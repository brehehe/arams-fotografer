<?php

namespace App\Services;

use App\Models\Client;
use App\Models\ClientSource;
use App\Models\ClientSourceAppreciation;
use App\Models\PaymentMethod;
use App\Models\Project;
use App\Models\User;
use App\Models\WeddingOrganizer;
use App\Traits\HasWebpUpload;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ClientSourceService
{
    use HasWebpUpload;

    /**
     * Get paginated client sources with filters, optimized latest referral dates, and stats.
     */
    public function getSourcesPaginated(Request $request): array
    {
        $query = ClientSource::query()->with('appreciations');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('phone', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhere('type', 'ilike', "%{$search}%");
            });
        }

        if ($isPrimary = $request->input('is_primary')) {
            if ($isPrimary === 'yes' || $isPrimary === '1') {
                $query->where('is_primary', true);
            } elseif ($isPrimary === 'no' || $isPrimary === '0') {
                $query->where('is_primary', false);
            }
        }

        if ($type = $request->input('type')) {
            if ($type !== 'all') {
                $query->where('type', $type);
            }
        }

        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        $sources = $query->latest('created_at')->paginate(10)->withQueryString();
        $sourceIds = $sources->pluck('id')->filter()->toArray();

        // Optimized batch retrieval of latest project & client dates (eliminating N+1 query in loop)
        $latestProjectDates = [];
        $latestClientDates = [];

        if (!empty($sourceIds)) {
            $latestProjectDates = Project::whereIn('client_source_id', $sourceIds)
                ->whereNull('deleted_at')
                ->selectRaw('client_source_id, MAX(COALESCE(event_date, created_at)) as max_date')
                ->groupBy('client_source_id')
                ->pluck('max_date', 'client_source_id')
                ->toArray();

            $latestClientDates = Client::whereIn('client_source_id', $sourceIds)
                ->whereNull('deleted_at')
                ->selectRaw('client_source_id, MAX(created_at) as max_date')
                ->groupBy('client_source_id')
                ->pluck('max_date', 'client_source_id')
                ->toArray();
        }

        $sources->getCollection()->transform(function ($source) use ($latestProjectDates, $latestClientDates) {
            $latestProjectDate = $latestProjectDates[$source->id] ?? null;
            $latestClientDate = $latestClientDates[$source->id] ?? null;

            $dates = array_filter([$latestProjectDate, $latestClientDate]);
            if (!empty($dates)) {
                rsort($dates);
                $source->last_referral_date = Carbon::parse($dates[0])->isoFormat('D MMM YYYY');
            } else {
                $source->last_referral_date = '-';
            }

            return $source;
        });

        $totalSources = ClientSource::count();

        // Dynamic stats from real project & client data
        $sourceProjectsQuery = Project::query()->where(function ($q) {
            $q->whereNotNull('client_source_id')
                ->orWhereHas('client', fn($cq) => $cq->whereNotNull('client_source_id'));
        });

        $totalProjects = $sourceProjectsQuery->count();
        $totalSales = (float) $sourceProjectsQuery->sum('total_amount');
        $averageProjectValue = $totalProjects > 0 ? (int) round($totalSales / $totalProjects) : 0;

        $stats = [
            'total_sources' => $totalSources,
            'total_projects' => $totalProjects,
            'total_sales' => $totalSales,
            'average_project_value' => $averageProjectValue,
        ];

        return [
            'sources' => $sources,
            'filters' => $request->only(['search', 'is_primary', 'type', 'status', 'start_date', 'end_date']),
            'stats' => $stats,
        ];
    }

    /**
     * Get detail data, referral history, metrics, and finances for a single client source.
     */
    public function getSourceDetail(string $id): array
    {
        $source = ClientSource::with(['appreciations' => function ($q) {
            $q->with('paymentMethod')->latest('date');
        }])->findOrFail($id);

        $clientsByFk = Client::where('client_source_id', $source->id);

        $clientsQuery = Client::query()->where(function ($q) use ($source, $clientsByFk) {
            $fkIds = $clientsByFk->pluck('id');

            $q->where('client_source_id', $source->id)
                ->orWhere(function ($inner) use ($source, $fkIds) {
                    $inner->whereNull('client_source_id')
                        ->whereNotIn('id', $fkIds)
                        ->where(function ($str) use ($source) {
                            $str->where('source', $source->name)
                                ->orWhere('referral_name', $source->name);

                            if ($source->type === 'wedding_organizer') {
                                $wo = WeddingOrganizer::where('name', $source->name)->first();
                                if ($wo) {
                                    $str->orWhere('wedding_organizer_id', $wo->id);
                                }
                            }
                        });
                });
        });

        $clients = $clientsQuery->with([
            'projects' => function ($pq) {
                $pq->with('category')->latest('event_date');
            },
        ])->get();

        $directProjects = Project::where('client_source_id', $source->id)
            ->with(['client', 'category'])
            ->get();

        $allProjects = $clients->flatMap(function ($client) {
            return $client->projects->map(function ($project) use ($client) {
                $project->setRelation('client', $client);
                return $project;
            });
        })
        ->concat($directProjects)
        ->unique('id')
        ->sortByDesc(function ($p) {
            return $p->event_date ?? $p->created_at;
        })->values();

        $clientsWithProjectIds = $allProjects->pluck('client_id')->filter()->unique()->all();
        $clientsWithoutProject = $clients->filter(function ($client) use ($clientsWithProjectIds) {
            return !in_array($client->id, $clientsWithProjectIds);
        });

        $projectHistory = $allProjects->map(function ($project) {
            $clientName = $project->client?->bride_name && $project->client?->groom_name
                ? "{$project->client->bride_name} & {$project->client->groom_name}"
                : ($project->client?->name ?? 'Klien');

            $statusLabel = match ($project->status) {
                'completed' => 'Selesai',
                'confirmed' => 'Dikonfirmasi',
                'in_progress' => 'Sedang Berjalan',
                'draft' => 'Draft',
                'cancelled' => 'Dibatalkan',
                default => ucfirst((string) $project->status),
            };

            return [
                'id' => $project->id,
                'project_id' => $project->id,
                'client_id' => $project->client?->id,
                'client' => $clientName,
                'referral_name' => $project->client?->referral_name ?? null,
                'project' => $project->name,
                'project_category' => strtolower($project->category?->name ?? 'wedding'),
                'event_date' => $project->event_date ? Carbon::parse($project->event_date)->isoFormat('D MMM YYYY') : '-',
                'raw_date' => $project->event_date ?? $project->created_at,
                'amount' => (float) $project->total_amount,
                'status' => $statusLabel,
            ];
        });

        $clientLeadHistory = $clientsWithoutProject->map(function ($client) {
            $clientName = $client->bride_name && $client->groom_name
                ? "{$client->bride_name} & {$client->groom_name}"
                : $client->name;

            return [
                'id' => 'client-' . $client->id,
                'project_id' => null,
                'client_id' => $client->id,
                'client' => $clientName,
                'referral_name' => $client->referral_name ?? null,
                'project' => 'Lead Klien (Belum ada project)',
                'project_category' => 'lead',
                'event_date' => $client->created_at ? Carbon::parse($client->created_at)->isoFormat('D MMM YYYY') : '-',
                'raw_date' => $client->created_at,
                'amount' => 0,
                'status' => 'Lead Klien',
            ];
        });

        $referralHistory = $projectHistory->concat($clientLeadHistory)
            ->sortByDesc(fn ($item) => $item['raw_date'])
            ->values()
            ->all();

        $totalProjectValue = (float) $allProjects->sum('total_amount');
        $latestProject = $allProjects->first();
        $latestClient = $clients->sortByDesc('created_at')->first();

        $lastReferralDate = $latestProject?->event_date
            ? Carbon::parse($latestProject->event_date)->isoFormat('D MMMM YYYY')
            : ($latestClient ? Carbon::parse($latestClient->created_at)->isoFormat('D MMMM YYYY') : '-');

        $lastReferralProject = $latestProject
            ? (($latestProject->client?->name ?? 'Project') . ' (' . ($latestProject->category?->name ?? 'Project') . ')')
            : '-';

        $metrics = [
            'total_referral_clients' => $clients->count(),
            'total_projects' => $allProjects->count(),
            'total_project_value' => $totalProjectValue,
            'last_referral_date' => $lastReferralDate,
            'last_referral_project' => $lastReferralProject,
        ];

        $referralExpensesTotal = (float) $source->appreciations
            ->where('status', 'given')
            ->sum('amount');

        $pendingAppreciationTotal = (float) $source->appreciations
            ->where('status', 'pending')
            ->sum('amount');

        $paymentMethods = PaymentMethod::where('status', 'active')
            ->select('id', 'name', 'code', 'account_number', 'account_holder')
            ->get();

        $appreciations = $source->appreciations()
            ->with('paymentMethod')
            ->latest('date')
            ->latest('created_at')
            ->get();

        return [
            'source' => $source,
            'metrics' => $metrics,
            'referral_history' => $referralHistory,
            'total_amount' => $totalProjectValue,
            'appreciations' => $appreciations,
            'payment_methods' => $paymentMethods,
            'finance_summary' => [
                'total_expenses' => $referralExpensesTotal,
                'pending_expenses' => $pendingAppreciationTotal,
                'connected_to_finance' => true,
            ],
        ];
    }

    /**
     * Store new client source with DB transaction.
     */
    public function createSource(array $data, ?User $user = null): ClientSource
    {
        DB::beginTransaction();
        try {
            $source = ClientSource::create($data);

            activity()
                ->causedBy($user ?? auth()->user())
                ->performedOn($source)
                ->event('created')
                ->log("Sumber klien {$source->name} berhasil ditambahkan");

            DB::commit();
            return $source;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Gagal menambahkan sumber klien: " . $e->getMessage(), ['exception' => $e]);
            throw $e;
        }
    }

    /**
     * Update client source with DB transaction.
     */
    public function updateSource(ClientSource $source, array $data, ?User $user = null): ClientSource
    {
        DB::beginTransaction();
        try {
            $source->update($data);

            activity()
                ->causedBy($user ?? auth()->user())
                ->performedOn($source)
                ->event('updated')
                ->log("Sumber klien {$source->name} berhasil diperbarui");

            DB::commit();
            return $source;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Gagal memperbarui sumber klien: " . $e->getMessage(), ['exception' => $e]);
            throw $e;
        }
    }

    /**
     * Delete client source with DB transaction.
     */
    public function deleteSource(ClientSource $source, ?User $user = null): bool
    {
        DB::beginTransaction();
        try {
            $name = $source->name;
            $deleted = (bool) $source->delete();

            activity()
                ->causedBy($user ?? auth()->user())
                ->performedOn($source)
                ->event('deleted')
                ->log("Sumber klien {$name} berhasil dihapus");

            DB::commit();
            return $deleted;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Gagal menghapus sumber klien: " . $e->getMessage(), ['exception' => $e]);
            throw $e;
        }
    }

    /**
     * Store appreciation for client source with DB transaction and file handling.
     */
    public function storeAppreciation(ClientSource $source, array $data, $proofImageFile = null, ?User $user = null): array
    {
        DB::beginTransaction();
        try {
            $isRecorded = (bool) ($data['is_recorded_in_finance'] ?? true);
            $amount = (float) ($data['amount'] ?? 0);

            $financeReference = null;
            if ($isRecorded && $amount > 0) {
                $count = ClientSourceAppreciation::whereNotNull('finance_reference')->count() + 1;
                $financeReference = 'EXP-REF-' . date('ym') . '-' . str_pad((string) $count, 4, '0', STR_PAD_LEFT);
            }

            $proofImagePath = null;
            if ($proofImageFile) {
                $proofImagePath = $this->uploadAsWebp($proofImageFile, 'appreciations/proof');
            }

            $appreciation = $source->appreciations()->create([
                'status' => $data['status'],
                'date' => $data['date'],
                'type' => $data['type'],
                'amount' => $amount,
                'payment_method_id' => $data['payment_method_id'] ?? null,
                'finance_reference' => $financeReference,
                'is_recorded_in_finance' => $isRecorded,
                'notes' => $data['notes'] ?? null,
                'proof_image' => $proofImagePath,
            ]);

            $financeMsg = $financeReference ? " dan tercatat di Finance ({$financeReference})" : "";

            activity()
                ->causedBy($user ?? auth()->user())
                ->performedOn($appreciation)
                ->event('created')
                ->log("Apresiasi referral untuk {$source->name} sebesar Rp " . number_format($amount, 0, ',', '.') . " berhasil disimpan{$financeMsg}");

            DB::commit();
            return [
                'appreciation' => $appreciation,
                'finance_message' => $financeMsg,
            ];
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Gagal menyimpan apresiasi referral: " . $e->getMessage(), ['exception' => $e]);
            throw $e;
        }
    }

    /**
     * Update appreciation for client source with DB transaction.
     */
    public function updateAppreciation(ClientSource $source, ClientSourceAppreciation $appreciation, array $data, $proofImageFile = null, ?User $user = null): ClientSourceAppreciation
    {
        DB::beginTransaction();
        try {
            $isRecorded = (bool) ($data['is_recorded_in_finance'] ?? true);
            $amount = (float) ($data['amount'] ?? 0);

            $financeReference = $appreciation->finance_reference;
            if ($isRecorded && $amount > 0 && !$financeReference) {
                $count = ClientSourceAppreciation::whereNotNull('finance_reference')->count() + 1;
                $financeReference = 'EXP-REF-' . date('ym') . '-' . str_pad((string) $count, 4, '0', STR_PAD_LEFT);
            }

            $proofImagePath = $appreciation->proof_image;
            if ($proofImageFile) {
                $proofImagePath = $this->uploadAsWebp($proofImageFile, 'appreciations/proof');
            }

            $appreciation->update([
                'status' => $data['status'],
                'date' => $data['date'],
                'type' => $data['type'],
                'amount' => $amount,
                'payment_method_id' => $data['payment_method_id'] ?? null,
                'finance_reference' => $financeReference,
                'is_recorded_in_finance' => $isRecorded,
                'notes' => $data['notes'] ?? null,
                'proof_image' => $proofImagePath,
            ]);

            activity()
                ->causedBy($user ?? auth()->user())
                ->performedOn($appreciation)
                ->event('updated')
                ->log("Apresiasi referral untuk {$source->name} berhasil diperbarui");

            DB::commit();
            return $appreciation;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Gagal memperbarui apresiasi referral: " . $e->getMessage(), ['exception' => $e]);
            throw $e;
        }
    }

    /**
     * Delete appreciation with DB transaction.
     */
    public function destroyAppreciation(ClientSourceAppreciation $appreciation, ?User $user = null): bool
    {
        DB::beginTransaction();
        try {
            $deleted = (bool) $appreciation->delete();

            activity()
                ->causedBy($user ?? auth()->user())
                ->performedOn($appreciation)
                ->event('deleted')
                ->log("Apresiasi referral dibatalkan");

            DB::commit();
            return $deleted;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Gagal menghapus apresiasi referral: " . $e->getMessage(), ['exception' => $e]);
            throw $e;
        }
    }
}
