<?php

namespace App\Http\Controllers;

use App\Http\Requests\Client\StoreClientAccountRequest;
use App\Http\Requests\Client\StoreClientRequest;
use App\Http\Requests\Client\UpdateClientRequest;
use App\Models\Category;
use App\Models\Client;
use App\Models\ClientSource;
use App\Models\Package;
use App\Models\PaymentMethod;
use App\Models\User;
use App\Models\WeddingOrganizer;
use App\Services\ClientService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{

    public function __construct(
        protected ClientService $clientService
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Client::class);

        $data = $this->clientService->getClientsPaginated($request);

        return Inertia::render('Clients/Index', $data);
    }

    public function show(Client $client): Response
    {
        $this->authorize('view', $client);

        $clientDetail = $this->clientService->getClientDetail($client);
        $categories = Category::where('status', 'active')->select('id', 'name', 'slug', 'description', 'color', 'workflow_type', 'form_type')->orderBy('sort_order')->orderBy('name')->get();
        $packages = Package::where('status', 'active')->select('id', 'name', 'category_id', 'base_price', 'duration_hours', 'description', 'included_deliverables', 'included_services')->get();
        $teamMembers = User::where('status', 'active')->select('id', 'name', 'email', 'avatar')->get();
        $paymentMethods = PaymentMethod::where('status', 'active')->select('id', 'name', 'account_number', 'account_holder')->get();
        $weddingOrganizers = WeddingOrganizer::whereIn('status', ['partner', 'active'])->select('id', 'name', 'pic_name', 'phone', 'city', 'tier')->orderBy('name')->get();
        $allClients = Client::where('id', '!=', $client->id)
            ->select('id', 'name', 'phone', 'city', 'email', 'bride_name', 'groom_name', 'child_name', 'father_name', 'mother_name', 'children')
            ->orderBy('name')
            ->get();
        $clientSources = ClientSource::where('status', 'active')
            ->select('id', 'name', 'type', 'status', 'is_primary', 'avatar')
            ->orderByDesc('created_at')
            ->get();
        $workflows = \App\Http\Controllers\MasterData\WorkflowController::getWorkflowDefinitions();

        return Inertia::render('Clients/Detail', [
            'client' => $clientDetail,
            'categories' => $categories,
            'packages' => $packages,
            'team_members' => $teamMembers,
            'payment_methods' => $paymentMethods,
            'wedding_organizers' => $weddingOrganizers,
            'all_clients' => $allClients,
            'client_sources' => $clientSources,
            'workflows' => $workflows,
        ]);
    }

    public function edit(Client $client): Response
    {
        $this->authorize('update', $client);

        $clientDetail = $this->clientService->getClientDetail($client);
        $categories = Category::where('status', 'active')->select('id', 'name', 'slug', 'description', 'color', 'form_type')->orderBy('sort_order')->orderBy('name')->get();
        $packages = Package::where('status', 'active')->select('id', 'name', 'category_id', 'base_price', 'duration_hours', 'description', 'included_deliverables', 'included_services')->get();
        $weddingOrganizers = WeddingOrganizer::whereIn('status', ['partner', 'active'])->select('id', 'name', 'pic_name', 'phone', 'city', 'tier')->orderBy('name')->get();
        $allClients = Client::where('id', '!=', $client->id)
            ->select('id', 'name', 'phone', 'city', 'email', 'bride_name', 'groom_name', 'child_name', 'father_name', 'mother_name', 'children')
            ->orderBy('name')
            ->get();
        $clientSources = ClientSource::where('status', 'active')
            ->select('id', 'name', 'type', 'status', 'is_primary', 'avatar')
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Clients/Edit', [
            'client' => $clientDetail,
            'categories' => $categories,
            'packages' => $packages,
            'wedding_organizers' => $weddingOrganizers,
            'all_clients' => $allClients,
            'client_sources' => $clientSources,
        ]);
    }

    public function store(StoreClientRequest $request): RedirectResponse
    {
        $this->authorize('create', Client::class);

        $this->clientService->createClient($request->validated(), $request->user());

        return redirect()->back()->with('success', 'Klien berhasil ditambahkan.');
    }

    public function update(UpdateClientRequest $request, Client $client): RedirectResponse
    {
        $this->authorize('update', $client);

        $this->clientService->updateClient(
            $client,
            $request->validated(),
            $request->file('avatar_file'),
            $request->has('avatar') && empty($request->input('avatar')),
            $request->user()
        );

        return redirect()->back()->with('success', 'Data klien berhasil diperbarui.');
    }

    public function destroy(Client $client): RedirectResponse
    {
        $this->authorize('delete', $client);

        $this->clientService->deleteClient($client, auth()->user());

        return redirect()->back()->with('success', 'Klien berhasil dihapus.');
    }

    public function toggleBlock(Client $client): RedirectResponse
    {
        $this->authorize('update', $client);

        $result = $this->clientService->toggleBlock($client, auth()->user());

        return redirect()->back()->with('success', $result['message']);
    }

    public function storeAccount(StoreClientAccountRequest $request, Client $client): RedirectResponse
    {
        $result = $this->clientService->createOrUpdateClientAccount($client, $request->validated(), $request->user());

        return redirect()->back()->with([
            'success' => 'Akun klien berhasil disimpan dan diaktifkan!',
            'whatsapp_url' => $result['whatsapp_url'],
        ]);
    }
}
