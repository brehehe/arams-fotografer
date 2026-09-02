<?php

namespace App\Http\Controllers;

use App\Http\Requests\Client\StoreClientRequest;
use App\Http\Requests\Client\UpdateClientRequest;
use App\Models\Category;
use App\Models\Client;
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
        $categories = Category::where('status', 'active')->select('id', 'name', 'color')->get();
        $packages = Package::where('status', 'active')->select('id', 'name', 'category_id', 'base_price', 'duration_hours', 'description')->get();
        $teamMembers = User::where('status', 'active')->select('id', 'name', 'email', 'avatar')->get();
        $paymentMethods = PaymentMethod::where('status', 'active')->select('id', 'name', 'account_number', 'account_holder')->get();
        $weddingOrganizers = WeddingOrganizer::whereIn('status', ['partner', 'active'])->select('id', 'name', 'pic_name', 'phone', 'city', 'tier')->orderBy('name')->get();
        $allClients = Client::where('id', '!=', $client->id)
            ->select('id', 'name', 'phone', 'city', 'email', 'bride_name', 'groom_name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Clients/Detail', [
            'client' => $clientDetail,
            'categories' => $categories,
            'packages' => $packages,
            'team_members' => $teamMembers,
            'payment_methods' => $paymentMethods,
            'wedding_organizers' => $weddingOrganizers,
            'all_clients' => $allClients,
        ]);
    }

    public function edit(Client $client): Response
    {
        $this->authorize('update', $client);

        $clientDetail = $this->clientService->getClientDetail($client);
        $weddingOrganizers = WeddingOrganizer::whereIn('status', ['partner', 'active'])->select('id', 'name', 'pic_name', 'phone', 'city', 'tier')->orderBy('name')->get();
        $allClients = Client::where('id', '!=', $client->id)
            ->select('id', 'name', 'phone', 'city', 'email', 'bride_name', 'groom_name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Clients/Edit', [
            'client' => $clientDetail,
            'wedding_organizers' => $weddingOrganizers,
            'all_clients' => $allClients,
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

        $this->clientService->updateClient($client, $request->validated(), $request->user());

        return redirect()->back()->with('success', 'Data klien berhasil diperbarui.');
    }

    public function destroy(Client $client): RedirectResponse
    {
        $this->authorize('delete', $client);

        $this->clientService->deleteClient($client, auth()->user());

        return redirect()->back()->with('success', 'Klien berhasil dihapus.');
    }
}
