<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClientSource\StoreClientSourceAppreciationRequest;
use App\Http\Requests\ClientSource\StoreClientSourceRequest;
use App\Http\Requests\ClientSource\UpdateClientSourceAppreciationRequest;
use App\Http\Requests\ClientSource\UpdateClientSourceRequest;
use App\Models\ClientSource;
use App\Models\ClientSourceAppreciation;
use App\Services\ClientSourceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientSourceController extends Controller
{
    public function __construct(
        protected ClientSourceService $clientSourceService
    ) {}

    public function index(Request $request): Response
    {
        $data = $this->clientSourceService->getSourcesPaginated($request);

        return Inertia::render('ClientSources/Index', $data);
    }

    public function show(string $id): Response
    {
        $data = $this->clientSourceService->getSourceDetail($id);

        return Inertia::render('ClientSources/Show', $data);
    }

    public function store(StoreClientSourceRequest $request): RedirectResponse
    {
        $source = $this->clientSourceService->createSource($request->validated(), $request->user());

        return redirect()->back()->with('success', "Sumber klien {$source->name} berhasil ditambahkan.");
    }

    public function update(UpdateClientSourceRequest $request, string $id): RedirectResponse
    {
        $source = ClientSource::findOrFail($id);
        $this->clientSourceService->updateSource($source, $request->validated(), $request->user());

        return redirect()->back()->with('success', "Data sumber klien {$source->name} berhasil diperbarui.");
    }

    public function destroy(string $id): RedirectResponse
    {
        $source = ClientSource::findOrFail($id);
        $name = $source->name;
        $this->clientSourceService->deleteSource($source, auth()->user());

        return redirect()->route('client-sources.index')->with('success', "Sumber klien {$name} berhasil dihapus.");
    }

    public function storeAppreciation(StoreClientSourceAppreciationRequest $request, string $id): RedirectResponse
    {
        $source = ClientSource::findOrFail($id);
        $result = $this->clientSourceService->storeAppreciation(
            $source,
            $request->validated(),
            $request->file('proof_image'),
            $request->user()
        );

        return redirect()->back()->with('success', "Apresiasi referral berhasil disimpan{$result['finance_message']}.");
    }

    public function updateAppreciation(UpdateClientSourceAppreciationRequest $request, string $sourceId, string $appreciationId): RedirectResponse
    {
        $source = ClientSource::findOrFail($sourceId);
        $appreciation = ClientSourceAppreciation::where('client_source_id', $sourceId)->findOrFail($appreciationId);

        $this->clientSourceService->updateAppreciation(
            $source,
            $appreciation,
            $request->validated(),
            $request->file('proof_image'),
            $request->user()
        );

        return redirect()->back()->with('success', 'Data apresiasi referral berhasil diperbarui.');
    }

    public function destroyAppreciation(string $sourceId, string $appreciationId): RedirectResponse
    {
        $appreciation = ClientSourceAppreciation::where('client_source_id', $sourceId)->findOrFail($appreciationId);
        $this->clientSourceService->destroyAppreciation($appreciation, auth()->user());

        return redirect()->back()->with('success', 'Apresiasi berhasil dibatalkan.');
    }
}
