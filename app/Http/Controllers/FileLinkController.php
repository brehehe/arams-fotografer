<?php

namespace App\Http\Controllers;

use App\Http\Requests\FileLink\ExtendFileLinkRequest;
use App\Http\Requests\FileLink\StoreFileLinkRequest;
use App\Models\FileLink;
use App\Models\Project;
use App\Services\FileLinkService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FileLinkController extends Controller
{
    public function __construct(
        protected FileLinkService $fileLinkService
    ) {}

    public function index(Request $request): Response
    {
        $data = $this->fileLinkService->getFileLinksPaginated($request);

        return Inertia::render('Files/Index', $data);
    }

    public function store(StoreFileLinkRequest $request): RedirectResponse
    {
        $this->fileLinkService->createFileLink($request->validated(), $request->user());

        return redirect()->back()->with('success', 'Link dokumentasi berhasil ditambahkan.');
    }

    /**
     * Store file link directly from project detail page.
     */
    public function storeForProject(StoreFileLinkRequest $request, Project $project): RedirectResponse
    {
        $data = $request->validated();
        $data['project_id'] = $project->id;

        $this->fileLinkService->createFileLink($data, $request->user());

        return redirect()->back()->with('success', 'Link dokumentasi berhasil ditambahkan.');
    }

    /**
     * Extend expiry or set new expiration date.
     */
    public function extendExpiry(ExtendFileLinkRequest $request, FileLink $file): RedirectResponse
    {
        $this->fileLinkService->extendExpiry($file, $request->validated(), $request->user());

        return redirect()->back()->with('success', 'Masa aktif file berhasil diperpanjang.');
    }

    /**
     * Hide or unhide file from client portal.
     */
    public function toggleVisibility(FileLink $file): RedirectResponse
    {
        $this->fileLinkService->toggleVisibility($file, auth()->user());

        return redirect()->back()->with('success', 'Status visibilitas file berhasil diubah.');
    }

    public function destroy(FileLink $file): RedirectResponse
    {
        $this->fileLinkService->deleteFileLink($file, auth()->user());

        return redirect()->back()->with('success', 'Link dokumentasi berhasil dihapus.');
    }
}
