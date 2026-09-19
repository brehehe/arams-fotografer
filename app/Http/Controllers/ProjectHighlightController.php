<?php

namespace App\Http\Controllers;

use App\Http\Requests\Project\StoreProjectHighlightRequest;
use App\Http\Requests\Project\UpdateProjectHighlightRequest;
use App\Models\Project;
use App\Models\ProjectHighlight;
use App\Services\ProjectService;
use Illuminate\Http\RedirectResponse;

class ProjectHighlightController extends Controller
{
    public function __construct(
        protected ProjectService $projectService
    ) {}

    public function store(StoreProjectHighlightRequest $request, Project $project): RedirectResponse
    {
        $this->projectService->storeHighlight(
            $project,
            $request->validated(),
            $request->file('image_file')
        );

        return redirect()->back()->with('success', 'Foto highlight project berhasil ditambahkan.');
    }

    public function update(UpdateProjectHighlightRequest $request, Project $project, ProjectHighlight $highlight): RedirectResponse
    {
        $this->projectService->updateHighlight($project, $highlight, $request->validated());

        return redirect()->back()->with('success', 'Highlight project berhasil diperbarui.');
    }

    public function setCover(Project $project, ProjectHighlight $highlight): RedirectResponse
    {
        $this->projectService->setHighlightCover($project, $highlight);

        return redirect()->back()->with('success', 'Foto berhasil dijadikan cover utama project.');
    }

    public function destroy(Project $project, ProjectHighlight $highlight): RedirectResponse
    {
        $this->projectService->destroyHighlight($project, $highlight);

        return redirect()->back()->with('success', 'Foto highlight berhasil dihapus.');
    }
}
