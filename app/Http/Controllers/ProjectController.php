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

    /**
     * Append a new timestamped note entry to the project.
     */
    public function addNote(Request $request, Project $project): RedirectResponse
    {
        $this->authorize('addNote', $project);

        $validated = $request->validate([
            'title' => 'nullable|string|max:150',
            'content' => 'required|string|max:5000',
        ]);

        $title = !empty(trim($validated['title'] ?? '')) ? trim($validated['title']) : 'Catatan Project';
        $user = $request->user();
        $authorName = $user?->name ?? 'Admin';
        $roleName = $user?->roles?->first()?->name ?? 'Tim Internal';
        $timestamp = now()->isoFormat('D MMM YYYY, HH:mm');

        $newEntry = "--- [{$timestamp}] {$title} (Oleh: {$authorName} - {$roleName}) ---\n" . trim($validated['content']);

        $existing = trim($project->notes ?? '');
        $project->notes = $existing ? ($existing . "\n\n" . $newEntry) : $newEntry;
        $project->save();

        return redirect()->back()->with('success', 'Catatan baru berhasil ditambahkan ke project.');
    }

    /**
     * Update or overwrite the complete notes content of the project.
     */
    public function updateNote(Request $request, Project $project): RedirectResponse
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'notes' => 'nullable|string|max:10000',
        ]);

        $project->notes = $validated['notes'] ?? '';
        $project->save();

        return redirect()->back()->with('success', 'Catatan project berhasil diperbarui.');
    }

    /**
     * Update a single note entry by its index.
     */
    public function updateNoteEntry(Request $request, Project $project, int $index): RedirectResponse
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'title' => 'nullable|string|max:150',
            'content' => 'required|string|max:5000',
        ]);

        $entries = $this->parseProjectNotes($project->notes);

        if (!isset($entries[$index])) {
            return redirect()->back()->with('error', 'Entri catatan tidak ditemukan.');
        }

        $user = $request->user();
        $authorName = $user?->name ?? 'Admin';
        $roleName = $user?->roles?->first()?->name ?? 'Tim Internal';
        $timestamp = now()->isoFormat('D MMM YYYY, HH:mm');

        $entries[$index]['title'] = !empty(trim($validated['title'] ?? '')) ? trim($validated['title']) : 'Catatan Project';
        $entries[$index]['content'] = trim($validated['content']);
        $entries[$index]['is_initial'] = false;
        $entries[$index]['timestamp'] = $timestamp . ' (diedit)';
        $entries[$index]['author'] = "{$authorName} - {$roleName}";

        $project->notes = $this->serializeProjectNotes($entries);
        $project->save();

        return redirect()->back()->with('success', 'Catatan berhasil diperbarui.');
    }

    /**
     * Delete a single note entry by its index.
     */
    public function deleteNoteEntry(Request $request, Project $project, int $index): RedirectResponse
    {
        $this->authorize('update', $project);

        $entries = $this->parseProjectNotes($project->notes);

        if (!isset($entries[$index])) {
            return redirect()->back()->with('error', 'Entri catatan tidak ditemukan.');
        }

        array_splice($entries, $index, 1);

        $project->notes = $this->serializeProjectNotes($entries);
        $project->save();

        return redirect()->back()->with('success', 'Catatan berhasil dihapus dari project.');
    }

    /**
     * Parse raw notes text into array of structured entries.
     */
    protected function parseProjectNotes(?string $raw): array
    {
        $raw = trim($raw ?? '');
        if ($raw === '') {
            return [];
        }

        $pattern = '/---\s*\[(.*?)\]\s*(.*?)\s*\(Oleh:\s*(.*?)\)\s*---\n?(.*?)(?=(?:---\s*\[|$))/s';
        $entries = [];

        if (preg_match_all($pattern, $raw, $matches, PREG_SET_ORDER)) {
            $firstDelim = strpos($raw, '--- [');
            if ($firstDelim !== false && $firstDelim > 0) {
                $initialText = trim(substr($raw, 0, $firstDelim));
                if ($initialText !== '') {
                    $entries[] = [
                        'is_initial' => true,
                        'timestamp' => '',
                        'title' => 'Catatan & Briefing Awal',
                        'author' => 'Input Awal',
                        'content' => $initialText,
                    ];
                }
            }

            foreach ($matches as $m) {
                $entries[] = [
                    'is_initial' => false,
                    'timestamp' => trim($m[1]),
                    'title' => trim($m[2]),
                    'author' => trim($m[3]),
                    'content' => trim($m[4]),
                ];
            }
        } else {
            $entries[] = [
                'is_initial' => true,
                'timestamp' => '',
                'title' => 'Catatan & Briefing Project',
                'author' => 'Input Awal',
                'content' => $raw,
            ];
        }

        return $entries;
    }

    /**
     * Re-serialize array of entries back into notes string.
     */
    protected function serializeProjectNotes(array $entries): string
    {
        $blocks = [];
        foreach ($entries as $entry) {
            $content = trim($entry['content'] ?? '');
            if ($content === '') {
                continue;
            }

            if (!empty($entry['is_initial'])) {
                $blocks[] = $content;
            } else {
                $timestamp = !empty($entry['timestamp']) ? $entry['timestamp'] : now()->isoFormat('D MMM YYYY, HH:mm');
                $title = !empty($entry['title']) ? $entry['title'] : 'Catatan Project';
                $author = !empty($entry['author']) ? $entry['author'] : 'Admin';
                $blocks[] = "--- [{$timestamp}] {$title} (Oleh: {$author}) ---\n" . $content;
            }
        }

        return implode("\n\n", $blocks);
    }
}
