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

    /**
     * Display client studio portfolio gallery & Instagram feed.
     */
    public function portfolio(Request $request): Response
    {
        $data = $this->clientPortalService->getPortfolioData($request);

        return Inertia::render('Client/Portfolio', $data);
    }

    /**
     * Store client review for the project.
     */
    public function submitReview(Request $request, Project $project): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
        ]);

        $client = $project->client;

        \App\Models\Testimonial::updateOrCreate(
            ['project_id' => $project->id],
            [
                'client_id' => $client?->id,
                'client_name' => $client?->name ?? 'Klien Arams',
                'package_name' => $project->package?->name ?? 'Paket Dokumentasi',
                'rating' => (int) $validated['rating'],
                'comment' => $validated['comment'],
                'event_date' => $project->event_date,
                'is_featured' => true,
                'status' => 'approved',
                'sort_order' => 0,
            ]
        );

        return redirect()->back()->with('success', 'Terima kasih! Ulasan Anda berhasil disimpan.');
    }

    /**
     * Store a new client note/briefing for the project.
     */
    public function addNote(Request $request, Project $project): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:150',
            'content' => 'required|string|max:2000',
        ]);

        $title = !empty(trim($validated['title'] ?? '')) ? trim($validated['title']) : 'Catatan Klien';
        $user = $request->user();
        $authorName = $user?->name ?? ($project->client?->name ?? 'Klien');
        $timestamp = now()->isoFormat('D MMM YYYY, HH:mm');

        $newEntry = "--- [{$timestamp}] {$title} (Oleh: {$authorName}) ---\n" . trim($validated['content']);

        $existing = trim($project->notes ?? '');
        $project->notes = $existing ? ($existing . "\n\n" . $newEntry) : $newEntry;
        $project->save();

        return redirect()->back()->with('success', 'Catatan baru berhasil ditambahkan ke project.');
    }
}
