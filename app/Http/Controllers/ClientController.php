<?php

namespace App\Http\Controllers;

use App\Http\Requests\Client\StoreClientRequest;
use App\Http\Requests\Client\UpdateClientRequest;
use App\Models\Category;
use App\Models\Client;
use App\Models\ClientSource;
use App\Models\Package;
use App\Models\PaymentMethod;
use App\Models\User;
use App\Models\WeddingOrganizer;
use App\Mail\ClientAccountCreatedMail;
use App\Services\ClientService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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
        $categories = Category::where('status', 'active')->select('id', 'name', 'slug', 'description', 'color', 'workflow_type', 'form_type')->orderBy('sort_order')->get();
        $packages = Package::where('status', 'active')->select('id', 'name', 'category_id', 'base_price', 'duration_hours', 'description', 'included_deliverables', 'included_services')->get();
        $teamMembers = User::where('status', 'active')->select('id', 'name', 'email', 'avatar')->get();
        $paymentMethods = PaymentMethod::where('status', 'active')->select('id', 'name', 'account_number', 'account_holder')->get();
        $weddingOrganizers = WeddingOrganizer::whereIn('status', ['partner', 'active'])->select('id', 'name', 'pic_name', 'phone', 'city', 'tier')->orderBy('name')->get();
        $allClients = Client::where('id', '!=', $client->id)
            ->select('id', 'name', 'phone', 'city', 'email', 'bride_name', 'groom_name', 'child_name', 'father_name', 'mother_name', 'children')
            ->orderBy('name')
            ->get();
        $clientSources = ClientSource::orderBy('name')
            ->select('id', 'name', 'type', 'status', 'is_primary', 'avatar')
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
        $categories = Category::where('status', 'active')->select('id', 'name', 'slug', 'description', 'color', 'form_type')->orderBy('sort_order')->get();
        $packages = Package::where('status', 'active')->select('id', 'name', 'category_id', 'base_price', 'duration_hours', 'description')->get();
        $weddingOrganizers = WeddingOrganizer::whereIn('status', ['partner', 'active'])->select('id', 'name', 'pic_name', 'phone', 'city', 'tier')->orderBy('name')->get();
        $allClients = Client::where('id', '!=', $client->id)
            ->select('id', 'name', 'phone', 'city', 'email', 'bride_name', 'groom_name', 'child_name', 'father_name', 'mother_name', 'children')
            ->orderBy('name')
            ->get();
        $clientSources = ClientSource::orderBy('name')
            ->select('id', 'name', 'type', 'status', 'is_primary', 'avatar')
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

        $this->clientService->updateClient($client, $request->validated(), $request->user());

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

        $newStatus = $client->status === 'blocked' ? 'active' : 'blocked';
        $client->update(['status' => $newStatus]);

        // If client has an associated portal user account, also update user status
        $portalUser = User::where('client_id', $client->id)->first();
        if ($portalUser) {
            $portalUser->update([
                'status' => $newStatus === 'blocked' ? 'suspended' : 'active',
            ]);
        }

        $logMsg = $newStatus === 'blocked'
            ? "Klien {$client->name} telah diblokir."
            : "Blokir klien {$client->name} telah dibuka.";

        activity()
            ->causedBy(auth()->user())
            ->performedOn($client)
            ->event($newStatus === 'blocked' ? 'client_blocked' : 'client_unblocked')
            ->log($logMsg);

        return redirect()->back()->with('success', $newStatus === 'blocked'
            ? "Klien {$client->name} berhasil diblokir."
            : "Blokir klien {$client->name} berhasil dibuka.");
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

        // Format WhatsApp URL with structured account credentials
        $cleanPhone = preg_replace('/[^0-9]/', '', $client->phone ?? '');
        if (str_starts_with($cleanPhone, '0')) {
            $cleanPhone = '62' . substr($cleanPhone, 1);
        }

        $portalUrl = url('/login');
        $notes = !empty($validated['message']) ? trim($validated['message']) : 'Silakan login untuk memantau progress project, review foto, dan download file dokumentasi Anda.';

        $finalMsg = "Halo Kak {$client->name},\n\n"
            . "Berikut informasi akun akses Portal Klien Arams Photography Anda:\n\n"
            . "🌐 Link Login : {$portalUrl}\n"
            . "👤 Nama Klien : {$client->name}\n"
            . "📧 Email      : {$validated['email']}\n"
            . "🔑 Password   : {$validated['password']}\n\n"
            . "📝 Keterangan:\n{$notes}\n\n"
            . "Terima kasih!";

        $waUrl = !empty($cleanPhone) ? "https://wa.me/{$cleanPhone}?text=" . urlencode($finalMsg) : null;

        // Dispatch email notification via Laravel Queue
        if (in_array($validated['send_method'] ?? 'email', ['email', 'both'])) {
            try {
                Mail::to($validated['email'])->queue(new ClientAccountCreatedMail(
                    clientName: $client->name,
                    email: $validated['email'],
                    password: $validated['password'],
                    portalUrl: $portalUrl,
                    notes: $validated['message'] ?? null,
                ));
            } catch (\Throwable $e) {
                Log::error("Gagal antrekan email akun klien: " . $e->getMessage());
            }
        }

        return redirect()->back()->with([
            'success' => 'Akun klien berhasil disimpan dan diaktifkan!',
            'whatsapp_url' => in_array($validated['send_method'] ?? 'both', ['whatsapp', 'both']) ? $waUrl : null,
        ]);
    }
}
