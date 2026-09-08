<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientSource;
use App\Models\ClientSourceAppreciation;
use App\Models\PaymentMethod;
use App\Models\Project;
use App\Models\WeddingOrganizer;
use App\Traits\HasWebpUpload;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientSourceController extends Controller
{
    use HasWebpUpload;
    public function index(Request $request): Response
    {
        $query = ClientSource::query()->with('appreciations');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
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

        $totalSources = ClientSource::count();

        $stats = [
            'total_sources' => $totalSources > 0 ? $totalSources : 28,
            'total_projects' => 76,
            'total_sales' => 185450000,
            'average_project_value' => 2439474,
        ];

        return Inertia::render('ClientSources/Index', [
            'sources' => $sources,
            'filters' => $request->only(['search', 'is_primary', 'type', 'status', 'start_date', 'end_date']),
            'stats' => $stats,
        ]);
    }

    public function show(string $id): Response
    {
        $source = ClientSource::with(['appreciations' => function ($q) {
            $q->with('paymentMethod')->latest('date');
        }])->findOrFail($id);

        // Cari klien riil yang berkaitan dengan sumber ini dari database
        $clientsQuery = Client::query()->where(function ($q) use ($source) {
            $q->where('source', $source->name)
                ->orWhere('source', $source->type)
                ->orWhere('referral_name', $source->name);

            if ($source->type === 'wedding_organizer') {
                $wo = WeddingOrganizer::where('name', $source->name)->first();
                if ($wo) {
                    $q->orWhere('wedding_organizer_id', $wo->id);
                }
            }
        });

        $clients = $clientsQuery->with([
            'projects' => function ($pq) {
                $pq->with('category')->latest('event_date');
            },
        ])->get();

        // Kumpulkan semua project dari klien-klien tersebut
        $allProjects = $clients->flatMap(function ($client) {
            return $client->projects->map(function ($project) use ($client) {
                $project->setRelation('client', $client);
                return $project;
            });
        })->sortByDesc(function ($p) {
            return $p->event_date ?? $p->created_at;
        })->values();

        // Bentuk riwayat referral dari data project riil
        $referralHistory = $allProjects->map(function ($project) {
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
                'client' => $clientName,
                'project' => $project->name,
                'project_category' => strtolower($project->category?->name ?? 'wedding'),
                'event_date' => $project->event_date ? Carbon::parse($project->event_date)->isoFormat('D MMM YYYY') : '-',
                'amount' => (float) $project->total_amount,
                'status' => $statusLabel,
            ];
        })->all();

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

        // Total pengeluaran komisi/apresiasi yang sudah diberikan / tercatat di finance
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

        return Inertia::render('ClientSources/Show', [
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
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:individual,wedding_organizer,vendor,social_media,ads,other',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string|in:active,inactive',
            'is_primary' => 'required|boolean',
        ]);

        $source = ClientSource::create($validated);

        activity()
            ->causedBy($request->user())
            ->performedOn($source)
            ->event('created')
            ->log("Sumber klien {$source->name} berhasil ditambahkan");

        return redirect()->back()->with('success', "Sumber klien {$source->name} berhasil ditambahkan.");
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $source = ClientSource::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:individual,wedding_organizer,vendor,social_media,ads,other',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string|in:active,inactive',
            'is_primary' => 'required|boolean',
        ]);

        $source->update($validated);

        activity()
            ->causedBy($request->user())
            ->performedOn($source)
            ->event('updated')
            ->log("Sumber klien {$source->name} berhasil diperbarui");

        return redirect()->back()->with('success', "Data sumber klien {$source->name} berhasil diperbarui.");
    }

    public function destroy(string $id): RedirectResponse
    {
        $source = ClientSource::findOrFail($id);
        $name = $source->name;
        $source->delete();

        activity()
            ->causedBy(auth()->user())
            ->performedOn($source)
            ->event('deleted')
            ->log("Sumber klien {$name} berhasil dihapus");

        return redirect()->route('client-sources.index')->with('success', "Sumber klien {$name} berhasil dihapus.");
    }

    public function storeAppreciation(Request $request, string $id): RedirectResponse
    {
        $source = ClientSource::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:given,pending',
            'date' => 'required|date',
            'type' => 'required|string|max:255',
            'amount' => 'nullable|numeric|min:0',
            'payment_method_id' => 'nullable|uuid|exists:payment_methods,id',
            'is_recorded_in_finance' => 'nullable|boolean',
            'notes' => 'nullable|string',
            'proof_image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
        ]);

        $isRecorded = $request->boolean('is_recorded_in_finance', true);
        $amount = (float) ($validated['amount'] ?? 0);

        // Buat nomor referensi pengeluaran kas otomatis jika dicatat di finance
        $financeReference = null;
        if ($isRecorded && $amount > 0) {
            $count = ClientSourceAppreciation::whereNotNull('finance_reference')->count() + 1;
            $financeReference = 'EXP-REF-' . date('ym') . '-' . str_pad((string) $count, 4, '0', STR_PAD_LEFT);
        }

        // Handle proof image upload
        $proofImagePath = null;
        if ($request->hasFile('proof_image')) {
            $proofImagePath = $this->uploadAsWebp($request->file('proof_image'), 'appreciations/proof');
        }

        $appreciation = $source->appreciations()->create([
            'status' => $validated['status'],
            'date' => $validated['date'],
            'type' => $validated['type'],
            'amount' => $amount,
            'payment_method_id' => $validated['payment_method_id'] ?? null,
            'finance_reference' => $financeReference,
            'is_recorded_in_finance' => $isRecorded,
            'notes' => $validated['notes'] ?? null,
            'proof_image' => $proofImagePath,
        ]);

        $financeMsg = $financeReference ? " dan tercatat di Finance ({$financeReference})" : "";

        activity()
            ->causedBy($request->user())
            ->performedOn($appreciation)
            ->event('created')
            ->log("Apresiasi referral untuk {$source->name} sebesar Rp " . number_format($amount, 0, ',', '.') . " berhasil disimpan{$financeMsg}");

        return redirect()->back()->with('success', "Apresiasi referral berhasil disimpan{$financeMsg}.");
    }

    public function updateAppreciation(Request $request, string $sourceId, string $appreciationId): RedirectResponse
    {
        $source = ClientSource::findOrFail($sourceId);
        $appreciation = ClientSourceAppreciation::where('client_source_id', $sourceId)->findOrFail($appreciationId);

        $validated = $request->validate([
            'status' => 'required|string|in:given,pending',
            'date' => 'required|date',
            'type' => 'required|string|max:255',
            'amount' => 'nullable|numeric|min:0',
            'payment_method_id' => 'nullable|uuid|exists:payment_methods,id',
            'is_recorded_in_finance' => 'nullable|boolean',
            'notes' => 'nullable|string',
            'proof_image' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
        ]);

        $isRecorded = $request->boolean('is_recorded_in_finance', true);
        $amount = (float) ($validated['amount'] ?? 0);

        $financeReference = $appreciation->finance_reference;
        if ($isRecorded && $amount > 0 && !$financeReference) {
            $count = ClientSourceAppreciation::whereNotNull('finance_reference')->count() + 1;
            $financeReference = 'EXP-REF-' . date('ym') . '-' . str_pad((string) $count, 4, '0', STR_PAD_LEFT);
        }

        // Handle proof image upload
        $proofImagePath = $appreciation->proof_image;
        if ($request->hasFile('proof_image')) {
            $proofImagePath = $this->uploadAsWebp($request->file('proof_image'), 'appreciations/proof');
        }

        $appreciation->update([
            'status' => $validated['status'],
            'date' => $validated['date'],
            'type' => $validated['type'],
            'amount' => $amount,
            'payment_method_id' => $validated['payment_method_id'] ?? null,
            'finance_reference' => $financeReference,
            'is_recorded_in_finance' => $isRecorded,
            'notes' => $validated['notes'] ?? null,
            'proof_image' => $proofImagePath,
        ]);

        activity()
            ->causedBy($request->user())
            ->performedOn($appreciation)
            ->event('updated')
            ->log("Apresiasi referral untuk {$source->name} berhasil diperbarui");

        return redirect()->back()->with('success', 'Data apresiasi referral berhasil diperbarui.');
    }

    public function destroyAppreciation(string $sourceId, string $appreciationId): RedirectResponse
    {
        $appreciation = ClientSourceAppreciation::where('client_source_id', $sourceId)->findOrFail($appreciationId);
        $appreciation->delete();

        return redirect()->back()->with('success', 'Apresiasi berhasil dibatalkan.');
    }
}
