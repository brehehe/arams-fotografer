<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    public function index(Request $request): Response
    {
        $year = (int) $request->input('year', 2026);
        $period = (string) $request->input('period', 'monthly');
        $dateRange = $request->input('date_range');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $data = $this->reportService->getAnnualReport($year, $period, $dateRange, $startDate, $endDate);

        return Inertia::render('Reports/Index', $data);
    }
}
