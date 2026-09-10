<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Client;
use App\Models\ClientSource;
use App\Models\Package;
use App\Models\Payment;
use App\Models\Project;
use App\Models\User;
use App\Models\WeddingOrganizer;
use Carbon\Carbon;

class ReportService
{
    /**
     * Get annual performance report metrics completely from real database queries.
     */
    public function getAnnualReport(?int $year = null): array
    {
        $year = $year ?? (int) now()->year;
        // 0. Dynamic Available Years from Projects, Payments, and Clients
        $projectYears = \Illuminate\Support\Facades\DB::table('projects')
            ->whereNotNull('created_at')
            ->whereNull('deleted_at')
            ->selectRaw('DISTINCT EXTRACT(YEAR FROM created_at)::int as yr')
            ->pluck('yr')
            ->toArray();

        $paymentYears = \Illuminate\Support\Facades\DB::table('payments')
            ->whereNotNull('payment_date')
            ->selectRaw('DISTINCT EXTRACT(YEAR FROM payment_date)::int as yr')
            ->pluck('yr')
            ->toArray();

        $clientYears = \Illuminate\Support\Facades\DB::table('clients')
            ->whereNotNull('created_at')
            ->whereNull('deleted_at')
            ->selectRaw('DISTINCT EXTRACT(YEAR FROM created_at)::int as yr')
            ->pluck('yr')
            ->toArray();

        $allYears = array_unique(array_filter(array_merge(
            $projectYears,
            $paymentYears,
            $clientYears,
            [(int) now()->year, $year]
        ), fn ($y) => is_int($y) || is_numeric($y)));
        rsort($allYears);
        $availableYears = array_values($allYears);

        // 1. Current Year Summary Aggregations
        $totalRevenue = (float) Payment::where('status', 'completed')
            ->whereYear('payment_date', $year)
            ->sum('amount');

        $totalContractValue = (float) Project::whereYear('created_at', $year)
            ->sum('total_amount');

        $totalPaidOnProjects = (float) Project::whereYear('created_at', $year)
            ->sum('paid_amount');

        $totalOutstandingPiutang = max(0, $totalContractValue - $totalPaidOnProjects);

        $projectSummary = Project::whereYear('created_at', $year)
            ->selectRaw("
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
                COUNT(CASE WHEN status IN ('draft', 'inquiry') THEN 1 END) as draft,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
            ")->first();

        $totalProjects = (int) ($projectSummary->total ?? 0);
        $completedProjects = (int) ($projectSummary->completed ?? 0);
        $inProgressProjects = (int) ($projectSummary->in_progress ?? 0);
        $draftProjects = (int) ($projectSummary->draft ?? 0);
        $cancelledProjects = (int) ($projectSummary->cancelled ?? 0);
        $newClients = Client::whereYear('created_at', $year)->count();
        $completionRate = $totalProjects > 0 ? round(($completedProjects / $totalProjects) * 100) : 0;
        $avgProjectValue = $totalProjects > 0 ? round($totalContractValue / $totalProjects) : 0;
        $avgMonthlyRevenue = round($totalRevenue / 12);

        // 1.1 Previous Year Summary for Comparison
        $prevYear = $year - 1;
        $prevRevenue = (float) Payment::where('status', 'completed')
            ->whereYear('payment_date', $prevYear)
            ->sum('amount');

        $prevProjectSummary = Project::whereYear('created_at', $prevYear)
            ->selectRaw("
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
            ")->first();

        $prevTotalProjects = (int) ($prevProjectSummary->total ?? 0);
        $prevCompletedProjects = (int) ($prevProjectSummary->completed ?? 0);
        $prevNewClients = Client::whereYear('created_at', $prevYear)->count();
        $prevCompletionRate = $prevTotalProjects > 0 ? round(($prevCompletedProjects / $prevTotalProjects) * 100) : 0;

        // Real Growth metrics (without static fake fallbacks)
        $revenueGrowth = $prevRevenue > 0
            ? round((($totalRevenue - $prevRevenue) / $prevRevenue) * 100, 1)
            : ($prevRevenue == 0 && $totalRevenue > 0 ? 100 : 0);

        $projectsGrowth = $totalProjects - $prevTotalProjects;
        $clientsGrowth = $newClients - $prevNewClients;
        $completionRateGrowth = $completionRate - $prevCompletionRate;

        // 2. Monthly Breakdown (12 Months real database aggregation)
        $monthlyRevenueMap = Payment::whereYear('payment_date', $year)
            ->where('status', 'completed')
            ->get(['payment_date', 'amount'])
            ->groupBy(fn ($p) => (int) Carbon::parse($p->payment_date)->format('n'))
            ->map(fn ($group) => (float) $group->sum('amount'));

        $monthlyProjectsMap = Project::whereYear('created_at', $year)
            ->get(['created_at', 'status'])
            ->groupBy(fn ($p) => (int) Carbon::parse($p->created_at)->format('n'));

        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $monthlyRevenue = [];
        $highestMonthName = '-';
        $highestMonthRevenue = 0;
        $peakProjectsMonthName = '-';
        $peakProjectsCount = 0;

        for ($m = 1; $m <= 12; $m++) {
            $rev = (float) ($monthlyRevenueMap[$m] ?? 0);
            $monthGroup = $monthlyProjectsMap[$m] ?? collect();
            $projCount = $monthGroup->count();
            $compCount = $monthGroup->where('status', 'completed')->count();

            if ($rev > $highestMonthRevenue) {
                $highestMonthRevenue = $rev;
                $highestMonthName = $months[$m - 1];
            }
            if ($projCount > $peakProjectsCount) {
                $peakProjectsCount = $projCount;
                $peakProjectsMonthName = $months[$m - 1];
            }

            $monthlyRevenue[] = [
                'month' => $months[$m - 1],
                'month_index' => $m,
                'revenue' => $rev,
                'projects' => $projCount,
                'completed' => $compCount,
            ];
        }

        // 3. Category Revenue Breakdown
        $totalCatRevenue = Project::whereYear('created_at', $year)->sum('total_amount') ?: 1;
        $categoriesReport = Category::select('id', 'name', 'slug', 'icon', 'color', 'workflow_type')
            ->withCount(['projects' => function ($q) use ($year) {
                $q->whereYear('created_at', $year);
            }])
            ->withSum(['projects' => function ($q) use ($year) {
                $q->whereYear('created_at', $year);
            }], 'total_amount')
            ->withSum(['projects' => function ($q) use ($year) {
                $q->whereYear('created_at', $year);
            }], 'paid_amount')
            ->orderByDesc('projects_sum_total_amount')
            ->orderByDesc('projects_count')
            ->get()
            ->map(function ($cat) use ($totalCatRevenue) {
                $totalVal = (float) ($cat->projects_sum_total_amount ?? 0);
                return [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'slug' => $cat->slug,
                    'icon' => $cat->icon,
                    'color' => $cat->color,
                    'workflow_type' => $cat->workflow_type,
                    'projects_count' => (int) ($cat->projects_count ?? 0),
                    'projects_sum_total_amount' => $totalVal,
                    'projects_sum_paid_amount' => (float) ($cat->projects_sum_paid_amount ?? 0),
                    'percentage' => round(($totalVal / $totalCatRevenue) * 100, 1),
                ];
            });

        $topCategory = $categoriesReport->filter(fn ($c) => ($c['projects_count'] ?? 0) > 0)->first();

        // 4. Packages Report (Top booked packages and revenue)
        $totalProjectsRevenue = Project::whereYear('created_at', $year)->sum('total_amount') ?: 1;
        $packagesReport = Package::with('category:id,name,color')
            ->withCount(['projects' => function ($q) use ($year) {
                $q->whereYear('created_at', $year);
            }])
            ->withSum(['projects' => function ($q) use ($year) {
                $q->whereYear('created_at', $year);
            }], 'total_amount')
            ->withSum(['projects' => function ($q) use ($year) {
                $q->whereYear('created_at', $year);
            }], 'paid_amount')
            ->orderByDesc('projects_count')
            ->orderByDesc('projects_sum_total_amount')
            ->get()
            ->filter(fn ($p) => ($p->projects_count ?? 0) > 0 || ($p->projects_sum_total_amount ?? 0) > 0)
            ->values()
            ->map(function ($pkg) use ($totalProjectsRevenue) {
                $totalVal = (float) ($pkg->projects_sum_total_amount ?? 0);
                $count = (int) ($pkg->projects_count ?? 0);
                return [
                    'id' => $pkg->id,
                    'name' => $pkg->name,
                    'category_name' => $pkg->category?->name ?? 'Umum',
                    'category_color' => $pkg->category?->color ?? '#64748B',
                    'base_price' => (float) ($pkg->base_price ?? 0),
                    'projects_count' => $count,
                    'total_revenue' => $totalVal,
                    'total_paid' => (float) ($pkg->projects_sum_paid_amount ?? 0),
                    'avg_deal' => $count > 0 ? round($totalVal / $count) : 0,
                    'percentage' => round(($totalVal / $totalProjectsRevenue) * 100, 1),
                ];
            });

        // Sertakan project kustom / tanpa paket agar total paket 100% konsisten dengan kategori
        $unassignedProjectsQuery = Project::whereYear('created_at', $year)->whereNull('package_id');
        $unassignedCount = $unassignedProjectsQuery->count();
        if ($unassignedCount > 0) {
            $unassignedTotal = (float) $unassignedProjectsQuery->sum('total_amount');
            $unassignedPaid = (float) $unassignedProjectsQuery->sum('paid_amount');
            $packagesReport->push([
                'id' => 'custom',
                'name' => 'Custom / Non-Paket',
                'category_name' => 'Layanan Kustom',
                'category_color' => '#94A3B8',
                'base_price' => 0,
                'projects_count' => $unassignedCount,
                'total_revenue' => $unassignedTotal,
                'total_paid' => $unassignedPaid,
                'avg_deal' => round($unassignedTotal / $unassignedCount),
                'percentage' => round(($unassignedTotal / $totalProjectsRevenue) * 100, 1),
            ]);
        }

        $packagesReport = $packagesReport->sortByDesc('projects_count')->values();
        $topPackage = $packagesReport->first();

        // 5. Wedding Organizer Partners Report — Mengambil langsung dari master Sumber Klien (type = wedding_organizer)
        $woSources = ClientSource::where('type', 'wedding_organizer')->get();
        $woSourceIds = $woSources->pluck('id');

        $totalWoRevenue = Project::whereYear('created_at', $year)
            ->where(function ($q) use ($woSourceIds) {
                $q->whereIn('client_source_id', $woSourceIds)
                  ->orWhereNotNull('wedding_organizer_id');
            })
            ->sum('total_amount') ?: 1;

        $woReport = $woSources->map(function ($wo) use ($year, $totalWoRevenue) {
            $matchingWo = WeddingOrganizer::where('name', $wo->name)->first();
            $matchingWoId = $matchingWo?->id;

            $projectsQuery = Project::whereYear('created_at', $year)
                ->where(function ($q) use ($wo, $matchingWoId) {
                    $q->where('client_source_id', $wo->id)
                      ->orWhereHas('client', fn ($cq) => $cq->where('client_source_id', $wo->id));
                    if ($matchingWoId) {
                        $q->orWhere('wedding_organizer_id', $matchingWoId);
                    }
                });

            $projectsCount = (clone $projectsQuery)->count();
            $totalVal = (float) (clone $projectsQuery)->sum('total_amount');
            $totalPaid = (float) (clone $projectsQuery)->sum('paid_amount');

            $picName = '-';
            if (!empty($wo->description) && str_contains($wo->description, 'PIC:')) {
                $picName = trim(explode('(', str_replace('PIC:', '', $wo->description))[0]);
            } elseif ($matchingWo?->pic_name) {
                $picName = $matchingWo->pic_name;
            }

            return [
                'id' => $wo->id, // client_source_id
                'name' => $wo->name,
                'pic_name' => $picName,
                'phone' => $wo->phone ?? ($matchingWo?->phone ?? '-'),
                'tier' => $matchingWo?->tier ?? 'Partner',
                'projects_count' => $projectsCount,
                'total_revenue' => $totalVal,
                'total_paid' => $totalPaid,
                'percentage' => round(($totalVal / $totalWoRevenue) * 100, 1),
            ];
        })
        ->filter(fn ($wo) => $wo['projects_count'] > 0 || $wo['total_revenue'] > 0)
        ->sortByDesc('total_revenue')
        ->values();

        // 6. Payment & Receivables Status Distribution
        $rawPaymentStatuses = Project::whereYear('created_at', $year)
            ->selectRaw('payment_status, count(*) as count, coalesce(sum(total_amount), 0) as total_val, coalesce(sum(paid_amount), 0) as total_paid')
            ->groupBy('payment_status')
            ->get();

        $totalPayVal = $rawPaymentStatuses->sum('total_val') ?: 1;
        $paymentStatusBreakdown = $rawPaymentStatuses->map(function ($p) use ($totalPayVal) {
            $val = (float) $p->total_val;
            $paid = (float) $p->total_paid;
            $unpaid = max(0, $val - $paid);
            return [
                'status' => $p->payment_status ?? 'unpaid',
                'label' => match ($p->payment_status) {
                    'paid' => 'Lunas (Fully Paid)',
                    'partial' => 'DP / Pembayaran Sebagian',
                    'unpaid' => 'Belum Dibayar (Unpaid)',
                    'overdue' => 'Jatuh Tempo (Overdue)',
                    'refunded' => 'Dikembalikan (Refunded)',
                    default => ucfirst($p->payment_status ?? 'Unpaid'),
                },
                'count' => (int) $p->count,
                'total_amount' => $val,
                'paid_amount' => $paid,
                'unpaid_amount' => $unpaid,
                'percentage' => round(($val / $totalPayVal) * 100, 1),
            ];
        });

        // 7. Project Status & Pipeline Distribution
        $rawProjectStatuses = Project::whereYear('created_at', $year)
            ->selectRaw('status, count(*) as count, coalesce(sum(total_amount), 0) as total_val')
            ->groupBy('status')
            ->get();

        $totalProjCount = $totalProjects ?: 1;
        $projectStatusBreakdown = $rawProjectStatuses->map(function ($s) use ($totalProjCount) {
            return [
                'status' => $s->status ?? 'inquiry',
                'label' => match ($s->status) {
                    'draft', 'inquiry' => 'Inquiry / Draft',
                    'confirmed' => 'Terkonfirmasi (Confirmed)',
                    'in_progress' => 'Sedang Berjalan (In Progress)',
                    'completed' => 'Selesai (Completed)',
                    'cancelled' => 'Dibatalkan (Cancelled)',
                    default => ucfirst($s->status ?? 'Draft'),
                },
                'count' => (int) $s->count,
                'total_amount' => (float) $s->total_val,
                'percentage' => round(((int) $s->count / $totalProjCount) * 100, 1),
            ];
        });


        // 8. Referral & Lead Source Performance — FK-based (client_source_id) with string fallback
        // Load all ClientSource records for string-based fallback matching
        $allClientSources = ClientSource::orderByDesc('is_primary')
            ->orderBy('name')
            ->get(['id', 'name', 'type', 'status', 'avatar']);

        $typeLabels = [
            'social_media'      => 'Media Sosial',
            'wedding_organizer' => 'Wedding Organizer',
            'individual'        => 'Referral Perorangan',
            'vendor'            => 'Mitra Vendor',
            'ads'               => 'Iklan Berbayar',
            'other'             => 'Lainnya',
        ];

        // Primary: Group clients by client_source_id FK (year-scoped)
        $fkBasedSources = \Illuminate\Support\Facades\DB::table('clients')
            ->whereNull('clients.deleted_at')
            ->whereNotNull('clients.client_source_id')
            ->whereYear('clients.created_at', $year)
            ->join('client_sources', 'client_sources.id', '=', 'clients.client_source_id')
            ->whereNull('client_sources.deleted_at')
            ->selectRaw('clients.client_source_id as source_id, client_sources.name, client_sources.type, client_sources.avatar, COUNT(clients.id) as client_count')
            ->groupBy('clients.client_source_id', 'client_sources.name', 'client_sources.type', 'client_sources.avatar')
            ->get();

        // Fallback: Clients without FK, group by source string (year-scoped)
        $stringBasedSources = \Illuminate\Support\Facades\DB::table('clients')
            ->whereNull('clients.deleted_at')
            ->whereNull('clients.client_source_id')
            ->whereNotNull('clients.source')
            ->where('clients.source', '!=', '')
            ->whereYear('clients.created_at', $year)
            ->selectRaw("NULL as source_id, TRIM(clients.source) as name, NULL as type, NULL as avatar, COUNT(*) as client_count")
            ->groupBy(\Illuminate\Support\Facades\DB::raw('TRIM(clients.source)'))
            ->get();

        // Merge both, with FK sources first
        $allSources = $fkBasedSources->concat($stringBasedSources);

        // If year-scoped is empty, use all-time FK-based
        if ($allSources->isEmpty()) {
            $allSources = \Illuminate\Support\Facades\DB::table('clients')
                ->whereNull('clients.deleted_at')
                ->whereNotNull('clients.client_source_id')
                ->join('client_sources', 'client_sources.id', '=', 'clients.client_source_id')
                ->whereNull('client_sources.deleted_at')
                ->selectRaw('clients.client_source_id as source_id, client_sources.name, client_sources.type, client_sources.avatar, COUNT(clients.id) as client_count')
                ->groupBy('clients.client_source_id', 'client_sources.name', 'client_sources.type', 'client_sources.avatar')
                ->get();
        }

        $totalSourceClients = $allSources->sum('client_count') ?: 1;

        // For string-based, try to match to a ClientSource master record
        $csLookup = $allClientSources->keyBy(fn ($cs) => strtolower(trim($cs->name)));

        $referralsReport = $allSources->map(function ($s) use ($csLookup, $typeLabels, $totalSourceClients, $year) {
            $sourceId   = $s->source_id;
            $sourceName = $s->name;
            $sourceType = $s->type;
            $sourceAvatar = $s->avatar;

            // For string-based entries, try to resolve master record
            if (! $sourceId) {
                $key = strtolower(trim($sourceName));
                $master = $csLookup->get($key)
                    ?? $csLookup->first(fn ($cs) => str_contains(strtolower($cs->name), $key)
                        || str_contains($key, strtolower($cs->name)));
                if ($master) {
                    $sourceId = $master->id;
                    $sourceName = $master->name;
                    $sourceType = $master->type;
                    $sourceAvatar = $master->avatar;
                }
            }

            // Get project stats for this source's clients
            if ($sourceId) {
                $clientIds = \Illuminate\Support\Facades\DB::table('clients')
                    ->whereNull('deleted_at')
                    ->where('client_source_id', $sourceId)
                    ->whereYear('created_at', $year)
                    ->pluck('id');
            } else {
                $clientIds = \Illuminate\Support\Facades\DB::table('clients')
                    ->whereNull('deleted_at')
                    ->whereNull('client_source_id')
                    ->whereRaw('LOWER(TRIM(source)) = ?', [strtolower(trim($sourceName))])
                    ->whereYear('created_at', $year)
                    ->pluck('id');
            }

            if ($clientIds->isEmpty()) {
                // Fall back to all-time
                $clientIds = $sourceId
                    ? \Illuminate\Support\Facades\DB::table('clients')->whereNull('deleted_at')->where('client_source_id', $sourceId)->pluck('id')
                    : \Illuminate\Support\Facades\DB::table('clients')->whereNull('deleted_at')->whereNull('client_source_id')->whereRaw('LOWER(TRIM(source)) = ?', [strtolower(trim($sourceName))])->pluck('id');
            }

            $projectStats = Project::where(function ($pq) use ($clientIds, $sourceId) {
                    $pq->whereIn('client_id', $clientIds);
                    if ($sourceId) {
                        $pq->orWhere('client_source_id', $sourceId);
                    }
                })
                ->selectRaw('COUNT(*) as total_projects, COALESCE(SUM(total_amount), 0) as total_val, COALESCE(SUM(paid_amount), 0) as total_paid')
                ->first();

            $type = $sourceType ?? 'other';

            return [
                'source_id'         => $sourceId,
                'source_name'       => $sourceName,
                'source_type'       => $type,
                'source_type_label' => $typeLabels[$type] ?? ucfirst($type),
                'source_avatar'     => $sourceAvatar,
                'client_count'      => (int) $s->client_count,
                'project_count'     => (int) ($projectStats->total_projects ?? 0),
                'total_revenue'     => (float) ($projectStats->total_val ?? 0),
                'total_paid'        => (float) ($projectStats->total_paid ?? 0),
                'percentage'        => round(($s->client_count / $totalSourceClients) * 100, 1),
            ];
        })->sortByDesc('total_revenue')->values();

        $topSource = $referralsReport->first();


        // 9. Team Performance with Roles and Project Counts
        $teamReport = User::where('status', 'active')
            ->with('roles')
            ->withCount([
                'photographerProjects as photo_count' => fn ($q) => $q->whereYear('created_at', $year),
                'photographerProjects as photo_completed_count' => fn ($q) => $q->whereYear('created_at', $year)->where('status', 'completed'),
                'editorProjects as edit_count' => fn ($q) => $q->whereYear('created_at', $year),
                'editorProjects as edit_completed_count' => fn ($q) => $q->whereYear('created_at', $year)->where('status', 'completed'),
            ])
            ->withSum(['photographerProjects as photo_revenue' => fn ($q) => $q->whereYear('created_at', $year)], 'total_amount')
            ->get()
            ->map(function ($u) {
                $roleName = $u->roles->pluck('name')->first() ?? 'Staff';
                $displayRole = match (strtolower($roleName)) {
                    'photographer' => 'Photographer',
                    'editor' => 'Retoucher / Editor',
                    'admin', 'super-admin' => 'Administrator',
                    'supervisor' => 'Supervisor',
                    'owner' => 'Creative Director',
                    default => ucfirst($roleName),
                };

                $totalAssigned = (int) $u->photo_count + (int) $u->edit_count;
                $totalCompleted = (int) $u->photo_completed_count + (int) $u->edit_completed_count;
                $rate = $totalAssigned > 0 ? round(($totalCompleted / $totalAssigned) * 100) : 100;

                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'role' => $displayRole,
                    'avatar' => $u->avatar,
                    'photo_count' => (int) $u->photo_count,
                    'photo_completed_count' => (int) $u->photo_completed_count,
                    'edit_count' => (int) $u->edit_count,
                    'edit_completed_count' => (int) $u->edit_completed_count,
                    'total_assigned' => $totalAssigned,
                    'total_completed' => $totalCompleted,
                    'completion_rate' => $rate,
                    'photo_revenue' => (float) ($u->photo_revenue ?? 0),
                ];
            })
            ->sortByDesc('total_assigned')
            ->values();

        // 10. Top High-Value Projects Ledger (Top 10)
        $topProjects = Project::whereYear('created_at', $year)
            ->with(['client:id,name,phone,city', 'category:id,name,color', 'package:id,name'])
            ->orderByDesc('total_amount')
            ->limit(10)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'project_number' => $p->project_number ?? 'PRJ-' . substr($p->id, 0, 6),
                    'name' => $p->name,
                    'client_name' => $p->client?->name ?? 'Klien',
                    'client_city' => $p->client?->city ?? '-',
                    'category_name' => $p->category?->name ?? 'Umum',
                    'category_color' => $p->category?->color ?? '#64748B',
                    'package_name' => $p->package?->name ?? 'Kustom',
                    'event_date' => $p->event_date?->format('d M Y') ?? $p->created_at?->format('d M Y'),
                    'status' => $p->status ?? 'in_progress',
                    'payment_status' => (function () use ($p) {
                        $total = (float) ($p->total_amount ?? 0);
                        $paid  = (float) ($p->paid_amount ?? 0);
                        if ($total > 0 && $paid >= $total) {
                            return 'paid';
                        }
                        if ($paid <= 0) {
                            return 'unpaid';
                        }
                        // Respect 'overdue' and 'refunded' as-is, normalize partial/paid
                        $raw = $p->payment_status ?? 'unpaid';
                        if (in_array($raw, ['overdue', 'refunded'])) {
                            return $raw;
                        }

                        return 'partial';
                    })(),
                    'total_amount' => (float) ($p->total_amount ?? 0),
                    'paid_amount'  => (float) ($p->paid_amount ?? 0),
                ];
            });

        return [
            'year' => $year,
            'available_years' => $availableYears,
            'summary' => [
                'revenue' => $totalRevenue,
                'total_contract_value' => $totalContractValue,
                'total_paid' => $totalPaidOnProjects,
                'total_outstanding' => $totalOutstandingPiutang,
                'projects' => $totalProjects,
                'completed' => $completedProjects,
                'in_progress' => $inProgressProjects,
                'draft' => $draftProjects,
                'cancelled' => $cancelledProjects,
                'new_clients' => $newClients,
                'completion_rate' => $completionRate,
                'avg_project_value' => $avgProjectValue,
                'avg_monthly_revenue' => $avgMonthlyRevenue,
                'revenue_growth' => $revenueGrowth,
                'projects_growth' => $projectsGrowth,
                'clients_growth' => $clientsGrowth,
                'completion_rate_growth' => $completionRateGrowth,
            ],
            'insights' => [
                'highest_month' => [
                    'name' => $highestMonthRevenue > 0 ? "{$highestMonthName} {$year}" : "Tahun {$year}",
                    'revenue' => $highestMonthRevenue,
                ],
                'peak_projects_month' => [
                    'name' => $peakProjectsCount > 0 ? "{$peakProjectsMonthName} {$year}" : "Tahun {$year}",
                    'count' => $peakProjectsCount,
                ],
                'top_category' => [
                    'name' => $topCategory['name'] ?? '-',
                    'count' => $topCategory['projects_count'] ?? 0,
                    'revenue' => $topCategory['projects_sum_total_amount'] ?? 0,
                ],
                'top_package' => [
                    'name' => $topPackage['name'] ?? '-',
                    'count' => $topPackage['projects_count'] ?? 0,
                    'revenue' => $topPackage['total_revenue'] ?? 0,
                ],
                'top_source' => [
                    'name' => $topSource['source_name'] ?? '-',
                    'revenue' => $topSource['total_revenue'] ?? 0,
                    'count' => $topSource['client_count'] ?? 0,
                ],
                'completion_rate' => $completionRate,
            ],
            'monthly_revenue' => $monthlyRevenue,
            'categories_report' => $categoriesReport,
            'packages_report' => $packagesReport,
            'wedding_organizers_report' => $woReport,
            'payment_status_breakdown' => $paymentStatusBreakdown,
            'project_status_breakdown' => $projectStatusBreakdown,
            'team_report' => $teamReport,
            'referrals_report' => $referralsReport,
            'top_projects' => $topProjects,
            'last_updated' => now()->translatedFormat('d F Y H:i') . ' WIB',
        ];
    }
}