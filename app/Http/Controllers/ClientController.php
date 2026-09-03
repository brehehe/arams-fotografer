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
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

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
        $categories = Category::where('status', 'active')->select('id', 'name', 'slug', 'description', 'color')->orderBy('sort_order')->get();
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
        $categories = Category::where('status', 'active')->select('id', 'name', 'slug', 'description', 'color')->orderBy('sort_order')->get();
        $weddingOrganizers = WeddingOrganizer::whereIn('status', ['partner', 'active'])->select('id', 'name', 'pic_name', 'phone', 'city', 'tier')->orderBy('name')->get();
        $allClients = Client::where('id', '!=', $client->id)
            ->select('id', 'name', 'phone', 'city', 'email', 'bride_name', 'groom_name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Clients/Edit', [
            'client' => $clientDetail,
            'categories' => $categories,
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

    public function storeAccount(Request $request, Client $client): RedirectResponse
    {
        $this->authorize('update', $client);

        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'username' => 'nullable|string|max:100',
            'password' => 'required|string|min:6',
            'send_method' => 'nullable|in:email,whatsapp,both',
            'message' => 'nullable|string',
        ]);

        $user = User::where('client_id', $client->id)
            ->orWhere('email', $validated['email'])
            ->first();

        if ($user) {
            $user->update([
                'name' => $client->name,
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'client_id' => $client->id,
                'status' => 'active',
                'phone' => $client->phone ?? $user->phone,
            ]);
        } else {
            $user = User::create([
                'name' => $client->name,
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'client_id' => $client->id,
                'status' => 'active',
                'phone' => $client->phone,
                'email_verified_at' => now(),
            ]);
        }

        $clientRole = Role::findOrCreate('Client');
        if (!$user->hasRole('Client')) {
            $user->assignRole($clientRole);
        }

        if ($client->email !== $validated['email']) {
            $client->update(['email' => $validated['email']]);
        }

        activity()
            ->causedBy(auth()->user())
            ->performedOn($client)
            ->event('account_created')
            ->log("Akun portal klien dibuat/diperbarui untuk {$client->name} ({$user->email})");

        // Format WhatsApp URL if needed
        $cleanPhone = preg_replace('/[^0-9]/', '', $client->phone ?? '');
        if (str_starts_with($cleanPhone, '0')) {
            $cleanPhone = '62' . substr($cleanPhone, 1);
        }

        $portalUrl = url('/login');
        $defaultMsg = "Halo Kak {$client->name},\n\nBerikut informasi akun login portal klien Arams Photography Anda:\n"
            . "🌐 Link Portal: {$portalUrl}\n"
            . "📧 Email: {$validated['email']}\n"
            . "🔑 Password: {$validated['password']}\n\n"
            . "Silakan login untuk melihat progress project, review foto, dan download file Anda. Terima kasih!";

        $finalMsg = !empty($validated['message']) ? $validated['message'] : $defaultMsg;
        if (!str_contains($finalMsg, $validated['password'])) {
            $finalMsg .= "\n\n📧 Email: {$validated['email']}\n🔑 Password: {$validated['password']}\n🌐 Login: {$portalUrl}";
        }

        $waUrl = !empty($cleanPhone) ? "https://wa.me/{$cleanPhone}?text=" . urlencode($finalMsg) : null;

        return redirect()->back()->with([
            'success' => 'Akun klien berhasil disimpan dan diaktifkan!',
            'whatsapp_url' => in_array($validated['send_method'] ?? 'both', ['whatsapp', 'both']) ? $waUrl : null,
        ]);
    }
}
