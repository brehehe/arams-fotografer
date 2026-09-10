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
        $data = $this->reportService->getAnnualReport($year);
        
        return Inertia::render('Reports/Index', $data);
    }
}
