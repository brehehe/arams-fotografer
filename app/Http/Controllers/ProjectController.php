<?php

namespace App\Http\Controllers;

use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Requests\Project\UpdateProjectStatusRequest;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function __construct(
        protected ProjectService $projectService
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Project::class);

        $data = $this->projectService->getProjectsPaginated($request);

        return Inertia::render('Projects/Index', $data);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $this->authorize('create', Project::class);

        $formData = $this->projectService->getProjectFormData();

        return Inertia::render('Projects/Create', array_merge($formData, [
            'initial_client_id' => $request->query('client_id') ?? '',
            'initial_wo_id' => $request->query('wedding_organizer_id') ?? $request->query('wo_id') ?? '',
            'initial_category_id' => $request->query('category_id') ?? '',
            'initial_package_id' => $request->query('package_id') ?? '',
        ]));
    }

    public function show(Project $project): Response
    {
        $this->authorize('view', $project);

        $data = $this->projectService->getProjectDetail($project);

        return Inertia::render('Projects/Detail', $data);
    }

    public function store(StoreProjectRequest $request): RedirectResponse|\Illuminate\Http\JsonResponse
    {
        $this->authorize('create', Project::class);

        $project = $this->projectService->createProject($request->validated(), $request->user());
        $invoice = $project->created_invoice ?? null;

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Project baru berhasil dibuat!',
                'project' => [
                    'id' => $project->id,
                    'name' => $project->name,
                    'project_number' => $project->project_number,
                    'total_amount' => $project->total_amount,
                ],
                'invoice' => $invoice ? [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'total' => $invoice->total,
                    'due_date' => $invoice->due_date ? \Carbon\Carbon::parse($invoice->due_date)->translatedFormat('d F Y') : null,
                ] : null,
            ]);
        }

        return redirect()->route('projects.show', $project->id)
            ->with('success', 'Project baru berhasil dibuat!')
            ->with('created_project', [
                'id' => $project->id,
                'name' => $project->name,
                'project_number' => $project->project_number,
                'invoice_id' => $invoice?->id,
                'invoice_number' => $invoice?->invoice_number,
                'dp_amount' => $invoice?->total ?? 0,
                'due_date' => $invoice?->due_date ? \Carbon\Carbon::parse($invoice->due_date)->translatedFormat('d F Y') : null,
            ]);
    }

    public function edit(Project $project): Response|RedirectResponse
    {
        $this->authorize('update', $project);

        $project->load([
            'client',
            'weddingOrganizer',
            'category',
            'package',
            'photographer:id,name,email,avatar',
            'editor:id,name,email,avatar',
            'supervisor:id,name,email,avatar',
            'projectAddons.addon',
        ]);

        $formData = $this->projectService->getProjectFormData();

        return Inertia::render('Projects/Edit', array_merge($formData, [
            'project' => $project,
        ]));
    }

    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $this->authorize('update', $project);

        $this->projectService->updateProject($project, $request->validated(), $request->user());

        return redirect()->route('projects.show', $project->id)->with('success', 'Project berhasil diperbarui.');
    }

    public function updateStatus(UpdateProjectStatusRequest $request, Project $project): RedirectResponse
    {
        $this->authorize('updateStatus', $project);

        $this->projectService->updateStatus($project, $request->validated(), $request->user());

        return redirect()->back()->with('success', 'Status project berhasil diubah.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        $this->authorize('delete', $project);

        $this->projectService->deleteProject($project, auth()->user());

        return redirect()->back()->with('success', 'Project berhasil dihapus.');
    }

    public function showInvoice(Project $project, Request $request): Response
    {
        $this->authorize('view', $project);

        $data = $this->projectService->getProjectInvoiceData($project, $request->query('invoice_id'));

        return Inertia::render('Projects/Invoice', $data);
    }

    public function showInvoiceById(\App\Models\Invoice $invoice): Response
    {
        $project = $invoice->project;
        $this->authorize('view', $project);

        $data = $this->projectService->getProjectInvoiceData($project, $invoice->id);

        return Inertia::render('Projects/Invoice', $data);
    }
}
