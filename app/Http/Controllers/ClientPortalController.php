<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\ClientPortalService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientPortalController extends Controller
{
    public function __construct(
        protected ClientPortalService $clientPortalService
    ) {}

    /**
     * Display the Client Portal Home / Dashboard.
     */
    public function dashboard(Request $request): Response
    {
        $data = $this->clientPortalService->getDashboardData($request);

        return Inertia::render('Client/Dashboard', $data);
    }

    /**
     * Display client's list of photography projects.
     */
    public function projects(Request $request): Response
    {
        $data = $this->clientPortalService->getProjectsData($request);

        return Inertia::render('Client/Projects/Index', $data);
    }

    /**
     * Display specific project detail & download gallery.
     */
    public function projectDetail(Request $request, Project $project): Response
    {
        $data = $this->clientPortalService->getProjectDetailData($project);

        return Inertia::render('Client/Projects/Show', $data);
    }
}
