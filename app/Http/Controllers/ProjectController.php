<?php

namespace App\Http\Controllers;

use App\Http\Requests\Project\StoreProjectNoteRequest;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectNoteRequest;
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

        $isDraft = $project->status === 'draft';
        $successMsg = $isDraft ? 'Draft project berhasil disimpan!' : 'Project baru berhasil dibuat!';

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => $successMsg,
                'project' => [
                    'id' => $project->id,
                    'name' => $project->name,
                    'project_number' => $project->project_number,
                    'total_amount' => $project->total_amount,
                    'status' => $project->status,
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
            ->with('success', $successMsg)
            ->with('created_project', [
                'id' => $project->id,
                'name' => $project->name,
                'project_number' => $project->project_number,
                'status' => $project->status,
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
            'client.clientSource',
            'clientSource',
            'weddingOrganizer',
            'category',
            'package',
            'photographer:id,name,email,avatar',
            'editor:id,name,email,avatar',
            'supervisor:id,name,email,avatar',
            'projectAddons.addon',
            'invoices.items',
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

    public function showInvoice(Project $project, Request $request): Response|RedirectResponse
    {
        if ($request->user()?->hasRole('Supervisor')) {
            return redirect()->route('projects.show', $project->id)
                ->with('error', 'Supervisor tidak memiliki hak akses untuk melihat atau mengelola invoice.');
        }

        $this->authorize('view', $project);

        $data = $this->projectService->getProjectInvoiceData($project, $request->query('invoice_id'));

        return Inertia::render('Projects/Invoice', $data);
    }

    public function showInvoiceById(\App\Models\Invoice $invoice, Request $request): Response|RedirectResponse
    {
        $project = $invoice->project;
        if ($request->user()?->hasRole('Supervisor')) {
            return redirect()->route('projects.show', $project->id)
                ->with('error', 'Supervisor tidak memiliki hak akses untuk melihat atau mengelola invoice.');
        }

        $this->authorize('view', $project);

        $data = $this->projectService->getProjectInvoiceData($project, $invoice->id);

        return Inertia::render('Projects/Invoice', $data);
    }

    /**
     * Append a new timestamped note entry to the project.
     */
    public function addNote(StoreProjectNoteRequest $request, Project $project): RedirectResponse
    {
        $this->projectService->addNote($project, $request->validated(), $request->user());

        return redirect()->back()->with('success', 'Catatan baru berhasil ditambahkan ke project.');
    }

    /**
     * Update or overwrite the complete notes content of the project.
     */
    public function updateNote(UpdateProjectNoteRequest $request, Project $project): RedirectResponse
    {
        $this->projectService->updateNote($project, $request->validated('notes'), $request->user());

        return redirect()->back()->with('success', 'Catatan project berhasil diperbarui.');
    }

    /**
     * Update a single note entry by its index.
     */
    public function updateNoteEntry(StoreProjectNoteRequest $request, Project $project, int $index): RedirectResponse
    {
        $this->authorize('update', $project);

        $this->projectService->updateNoteEntry($project, $index, $request->validated(), $request->user());

        return redirect()->back()->with('success', 'Catatan berhasil diperbarui.');
    }

    /**
     * Delete a single note entry by its index.
     */
    public function deleteNoteEntry(Request $request, Project $project, int $index): RedirectResponse
    {
        $this->authorize('update', $project);

        $this->projectService->deleteNoteEntry($project, $index, $request->user());

        return redirect()->back()->with('success', 'Catatan berhasil dihapus dari project.');
    }
}
