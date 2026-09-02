<?php

namespace App\Http\Controllers;

use App\Http\Requests\WeddingOrganizer\StoreWeddingOrganizerRequest;
use App\Http\Requests\WeddingOrganizer\UpdateWeddingOrganizerRequest;
use App\Models\WeddingOrganizer;
use App\Services\WeddingOrganizerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WeddingOrganizerController extends Controller
{
    public function __construct(
        protected WeddingOrganizerService $weddingOrganizerService
    ) {}

    public function index(Request $request): Response
    {
        $data = $this->weddingOrganizerService->getWeddingOrganizersPaginated($request);

        return Inertia::render('WeddingOrganizers/Index', $data);
    }

    public function store(StoreWeddingOrganizerRequest $request): RedirectResponse
    {
        $wo = $this->weddingOrganizerService->createWeddingOrganizer($request->validated(), $request->user());

        return redirect()->back()->with('success', "Wedding Organizer {$wo->name} berhasil ditambahkan.");
    }

    public function update(UpdateWeddingOrganizerRequest $request, WeddingOrganizer $weddingOrganizer): RedirectResponse
    {
        $this->weddingOrganizerService->updateWeddingOrganizer($weddingOrganizer, $request->validated(), $request->user());

        return redirect()->back()->with('success', "Data Wedding Organizer {$weddingOrganizer->name} berhasil diperbarui.");
    }

    public function destroy(WeddingOrganizer $weddingOrganizer): RedirectResponse
    {
        $this->weddingOrganizerService->deleteWeddingOrganizer($weddingOrganizer, auth()->user());

        return redirect()->back()->with('success', 'Wedding Organizer berhasil dihapus.');
    }
}
