<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function index(Request $request): Response|RedirectResponse
    {
        if (auth()->user()?->hasRole('Client')) {
            return redirect()->route('client.dashboard');
        }

        $filters = [
            'period' => $request->query('period', 'all_time'),
            'chart_year' => (int) $request->query('chart_year', 2026),
            'category_period' => $request->query('category_period', 'all_time'),
            'performance_period' => $request->query('performance_period', 'all_time'),
        ];

        $data = $this->dashboardService->getDashboardMetrics($filters);

        return Inertia::render('dashboard', $data);
    }
}
