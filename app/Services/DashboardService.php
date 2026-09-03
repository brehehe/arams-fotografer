<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Client;
use App\Models\Payment;
use App\Models\Project;
use Carbon\Carbon;
use Spatie\Activitylog\Models\Activity as ActivityModel;

class DashboardService
{
    /**
     * Apply date range filter to an Eloquent query.
     */
    protected function applyDateFilter($query, string $period, string $column = 'created_at')
    {
        $now = Carbon::now();
        return match ($period) {
            'today', 'Hari Ini' => $query->whereDate($column, $now->toDateString()),
            'this_week', 'Minggu Ini' => $query->whereBetween($column, [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()]),
            'this_month', 'Bulan Ini' => $query->whereYear($column, $now->year)->whereMonth($column, $now->month),
            'this_quarter', 'Kuartal Ini' => $query->whereBetween($column, [$now->copy()->startOfQuarter(), $now->copy()->endOfQuarter()]),
            'this_year', 'Tahun Ini' => $query->whereYear($column, $now->year),
            '2026', 'Tahun 2026', 'Tahun Ini (2026)' => $query->whereYear($column, 2026),
            '2025', 'Tahun 2025' => $query->whereYear($column, 2025),
            '2024', 'Tahun 2024' => $query->whereYear($column, 2024),
            '2027', 'Tahun 2027' => $query->whereYear($column, 2027),
            default => $query, // 'all_time', 'Semua Waktu'
        };
    }

    /**
     * Get all aggregated dashboard data for the given period & widget filters.
     */
    public function getDashboardMetrics(array|string $filterInput = []): array
    {
        if (is_string($filterInput)) {
            $filters = ['period' => $filterInput];
        } else {
            $filters = $filterInput;
        }

        $now = Carbon::now();
        $period = $filters['period'] ?? 'all_time';
        $chartYear = (int) ($filters['chart_year'] ?? $now->year);
        $categoryPeriod = $filters['category_period'] ?? 'all_time';
        $performancePeriod = $filters['performance_period'] ?? 'all_time';
        $availableYears = [$now->year - 2, $now->year - 1, $now->year, $now->year + 1];

        // 1. KPI Cards & Financial Summary
        $projectStatsQuery = Project::query();
        if ($period !== 'all_time' && $period !== 'Semua Waktu') {
            $this->applyDateFilter($projectStatsQuery, $period, 'created_at');
        }

        $projectStats = $projectStatsQuery->selectRaw("
            COUNT(*) as total,
            COUNT(CASE WHEN status IN ('in_progress', 'editing') THEN 1 END) as active,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
            COUNT(CASE WHEN status = 'draft' THEN 1 END) as not_started,
            COUNT(CASE WHEN status IN ('in_progress', 'editing') THEN 1 END) as in_progress,
            COUNT(CASE WHEN status IN ('pending', 'on_hold') THEN 1 END) as pending,
            COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
            COALESCE(SUM(total_amount), 0) as total_value
        ")->first();

        $totalProjects = (int) ($projectStats->total ?? 0);
        $activeProjects = (int) ($projectStats->active ?? 0);
        $completedProjects = (int) ($projectStats->completed ?? 0);
        $totalProjectValue = (float) ($projectStats->total_value ?? 0);
        $totalClients = Client::count();

        $paymentQuery = Payment::where('status', 'completed');
        if ($period !== 'all_time' && $period !== 'Semua Waktu') {
            $this->applyDateFilter($paymentQuery, $period, 'payment_date');
        }
        $totalReceived = (float) $paymentQuery->sum('amount');
        $totalOutstanding = max(0, $totalProjectValue - $totalReceived);
        $collectionRate = $totalProjectValue > 0 ? round(($totalReceived / $totalProjectValue) * 100, 1) : 0;

        // 2. Monthly Payments Chart for selected chart_year (Database-Agnostic)
        $monthlySums = Payment::whereYear('payment_date', $chartYear)
            ->where('status', 'completed')
            ->get(['payment_date', 'amount'])
            ->groupBy(fn ($p) => (int) Carbon::parse($p->payment_date)->format('n'))
            ->map(fn ($group) => (float) $group->sum('amount'));

        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $monthlyPayments = [];

        for ($m = 1; $m <= 12; $m++) {
            $monthSum = (float) ($monthlySums[$m] ?? 0);
            $monthlyPayments[] = [
                'month' => $months[$m - 1],
                'month_num' => $m,
                'amount' => $monthSum,
                'amount_in_millions' => round($monthSum / 1000000, 1),
            ];
        }

        // 3. Recent Projects (max 7 rows with lightweight eager relations)
        $recentProjects = Project::with([
            'client:id,name,email',
            'category:id,name,color',
            'package:id,name',
        ])
            ->latest('id')
            ->take(7)
            ->get()
            ->map(function ($proj) {
                $deadlineStatus = 'normal';
                $deadlineText = '-';

                if ($proj->deadline) {
                    $diff = Carbon::now()->startOfDay()->diffInDays($proj->deadline->startOfDay(), false);
                    if ($proj->status === 'completed') {
                        $deadlineText = 'Selesai';
                        $deadlineStatus = 'completed';
                    } elseif ($diff < 0) {
                        $deadlineText = abs($diff).' hari lalu';
                        $deadlineStatus = 'overdue';
                    } elseif ($diff === 0) {
                        $deadlineText = 'Hari ini';
                        $deadlineStatus = 'urgent';
                    } elseif ($diff <= 3) {
                        $deadlineText = $diff.' hari lagi';
                        $deadlineStatus = 'urgent';
                    } else {
                        $deadlineText = $diff.' hari lagi';
                        $deadlineStatus = 'normal';
                    }
                }

                return [
                    'id' => $proj->id,
                    'project_number' => $proj->project_number,
                    'name' => $proj->name,
                    'thumbnail' => $proj->thumbnail,
                    'client' => [
                        'id' => $proj->client?->id,
                        'name' => $proj->client?->name ?? 'Klien',
                        'email' => $proj->client?->email,
                    ],
                    'category' => [
                        'name' => $proj->category?->name ?? 'Umum',
                        'color' => $proj->category?->color ?? '#3B82F6',
                    ],
                    'status' => $proj->status,
                    'status_label' => match ($proj->status) {
                        'in_progress' => 'Sedang Dikerjakan',
                        'completed' => 'Selesai',
                        'draft' => 'Dalam Proses',
                        default => ucfirst($proj->status),
                    },
                    'progress' => $proj->progress,
                    'event_date' => $proj->event_date?->translatedFormat('d F Y'),
                    'deadline' => $proj->deadline?->translatedFormat('d F Y'),
                    'deadline_text' => $deadlineText,
                    'deadline_status' => $deadlineStatus,
                    'total_amount' => (float) $proj->total_amount,
                    'paid_amount' => (float) $proj->paid_amount,
                ];
            });

        // 4. Project Distribution by Category (Filtered by category_period)
        $categoryProjectsQuery = Project::query();
        if ($categoryPeriod !== 'all_time' && $categoryPeriod !== 'Semua Waktu') {
            $this->applyDateFilter($categoryProjectsQuery, $categoryPeriod, 'created_at');
        }
        $totalCategoryProjects = $categoryProjectsQuery->count();

        $allCategories = Category::select('id', 'name', 'color')->get();
        $categoriesWithCounts = $allCategories->map(function ($cat) use ($categoryPeriod) {
            $q = Project::where('category_id', $cat->id);
            if ($categoryPeriod !== 'all_time' && $categoryPeriod !== 'Semua Waktu') {
                $this->applyDateFilter($q, $categoryPeriod, 'created_at');
            }
            $count = $q->count();
            return [
                'id' => $cat->id,
                'name' => $cat->name,
                'color' => $cat->color ?: '#3B82F6',
                'count' => $count,
            ];
        })->filter(fn($c) => $c['count'] > 0)->sortByDesc('count')->values();

        $top6 = $categoriesWithCounts->take(6);
        $remaining = $categoriesWithCounts->slice(6);

        $categoriesStats = $top6->map(function ($cat) use ($totalCategoryProjects) {
            $percentage = $totalCategoryProjects > 0 ? round(($cat['count'] / $totalCategoryProjects) * 100, 1) : 0;

            return [
                'id' => $cat['id'],
                'name' => $cat['name'],
                'color' => $cat['color'],
                'count' => $cat['count'],
                'percentage' => $percentage,
            ];
        })->values();

        $remainingCount = $remaining->sum('count');
        if ($remainingCount > 0) {
            $remainingPercentage = $totalCategoryProjects > 0 ? round(($remainingCount / $totalCategoryProjects) * 100, 1) : 0;
            $categoriesStats->push([
                'id' => 'other',
                'name' => 'Lainnya',
                'color' => '#64748B',
                'count' => $remainingCount,
                'percentage' => $remainingPercentage,
            ]);
        }

        // 5. Recent Activity Timeline
        $recentActivities = ActivityModel::with('causer:id,name,avatar')
            ->latest('id')
            ->take(5)
            ->get()
            ->map(function ($act) {
                return [
                    'id' => $act->id,
                    'description' => $act->description,
                    'event' => $act->event,
                    'causer_name' => $act->causer?->name ?? 'Sistem',
                    'causer_avatar' => $act->causer?->avatar,
                    'time_ago' => $act->created_at->diffForHumans(),
                    'created_at' => $act->created_at->format('d M Y, H:i').' WIB',
                ];
            });

        // 6. Nearest Upcoming Deadlines (Hanya project aktif yang belum selesai dan tenggat waktu mendatang)
        $upcomingDeadlines = Project::select('id', 'name', 'thumbnail', 'deadline', 'status')
            ->whereNotIn('status', ['completed', 'selesai', 'cancelled', 'dibatalkan', 'delivered'])
            ->whereNotNull('deadline')
            ->where('deadline', '>=', Carbon::now()->startOfDay())
            ->orderBy('deadline', 'asc')
            ->take(5)
            ->get()
            ->map(function ($proj) {
                $diff = (int) Carbon::now()->startOfDay()->diffInDays($proj->deadline->startOfDay(), false);
                $urgency = 'normal';
                $urgencyText = '';

                if ($diff === 0) {
                    $urgencyText = 'Hari ini';
                    $urgency = 'urgent';
                } elseif ($diff === 1) {
                    $urgencyText = 'Besok';
                    $urgency = 'urgent';
                } else {
                    $urgencyText = $diff.' hari lagi';
                    $urgency = ($diff <= 3) ? 'urgent' : 'normal';
                }

                return [
                    'id' => $proj->id,
                    'name' => $proj->name,
                    'thumbnail' => $proj->thumbnail,
                    'deadline_formatted' => $proj->deadline->translatedFormat('d F Y'),
                    'urgency_text' => $urgencyText,
                    'urgency' => $urgency,
                ];
            });

        // 7. Project Performance Summary (Filtered by performance_period)
        $perfQuery = Project::query();
        if ($performancePeriod !== 'all_time' && $performancePeriod !== 'Semua Waktu') {
            $this->applyDateFilter($perfQuery, $performancePeriod, 'created_at');
        }

        $perfStats = $perfQuery->selectRaw("
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'draft' THEN 1 END) as not_started,
            COUNT(CASE WHEN status IN ('in_progress', 'editing') THEN 1 END) as in_progress,
            COUNT(CASE WHEN status IN ('pending', 'on_hold') THEN 1 END) as pending,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
            COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
        ")->first();

        $perfTotal = (int) ($perfStats->total ?? 0);
        $notStartedCount = (int) ($perfStats->not_started ?? 0);
        $inProgressCount = (int) ($perfStats->in_progress ?? 0);
        $pendingCount    = (int) ($perfStats->pending ?? 0);
        $completedCount  = (int) ($perfStats->completed ?? 0);
        $cancelledCount  = (int) ($perfStats->cancelled ?? 0);

        $performanceStats = [
            'total' => $perfTotal,
            'not_started' => [
                'count' => $notStartedCount,
                'percentage' => $perfTotal > 0 ? round(($notStartedCount / $perfTotal) * 100, 1) : 0,
            ],
            'in_progress' => [
                'count' => $inProgressCount,
                'percentage' => $perfTotal > 0 ? round(($inProgressCount / $perfTotal) * 100, 1) : 0,
            ],
            'pending' => [
                'count' => $pendingCount,
                'percentage' => $perfTotal > 0 ? round(($pendingCount / $perfTotal) * 100, 1) : 0,
            ],
            'completed' => [
                'count' => $completedCount,
                'percentage' => $perfTotal > 0 ? round(($completedCount / $perfTotal) * 100, 1) : 0,
            ],
            'cancelled' => [
                'count' => $cancelledCount,
                'percentage' => $perfTotal > 0 ? round(($cancelledCount / $perfTotal) * 100, 1) : 0,
            ],
        ];

        // 8. Top Lead Sources (Top 5 Sumber Klien)
        $rawSources = Client::whereNotNull('source')
            ->where('source', '!=', '')
            ->selectRaw('source, count(*) as client_count')
            ->groupBy('source')
            ->orderByDesc('client_count')
            ->take(5)
            ->get();

        $totalSourceClients = $rawSources->sum('client_count') ?: 1;
        $leadSources = $rawSources->map(function ($s) use ($totalSourceClients) {
            $clientIds = Client::where('source', $s->source)->pluck('id');
            $projSum = (float) Project::whereIn('client_id', $clientIds)->sum('total_amount');

            return [
                'source' => $s->source,
                'count' => (int) $s->client_count,
                'percentage' => round(($s->client_count / $totalSourceClients) * 100, 1),
                'total_revenue' => $projSum,
            ];
        });

        return [
            'filters' => [
                'period' => $period,
                'chart_year' => $chartYear,
                'category_period' => $categoryPeriod,
                'performance_period' => $performancePeriod,
                'available_years' => $availableYears,
            ],
            'period' => $period,
            'kpis' => [
                'total_projects' => $totalProjects,
                'active_projects' => $activeProjects,
                'completed_projects' => $completedProjects,
                'total_clients' => $totalClients,
            ],
            'financial' => [
                'total_value' => $totalProjectValue,
                'received' => $totalReceived,
                'outstanding' => $totalOutstanding,
                'collection_rate' => $collectionRate,
                'monthly_chart' => $monthlyPayments,
            ],
            'recent_projects' => $recentProjects,
            'category_stats' => $categoriesStats,
            'recent_activities' => $recentActivities,
            'upcoming_deadlines' => $upcomingDeadlines,
            'lead_sources' => $leadSources,
            'performance' => $performanceStats,
        ];
    }
}
