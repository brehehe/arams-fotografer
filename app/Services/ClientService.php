<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;

class ClientService
{
    /**
     * Get paginated clients with filters, stats, and distinct dropdowns.
     */
    public function getClientsPaginated(Request $request): array
    {
        $query = Client::with(['weddingOrganizer:id,name,pic_name,tier', 'referredByClient:id,name,phone,city,bride_name,groom_name'])
            ->withCount(['projects', 'projects as active_projects_count' => function ($q) {
                $q->whereIn('status', ['in_progress', 'editing', 'draft']);
            }])->withSum('projects as total_value', 'total_amount')
            ->withSum('projects as total_paid', 'paid_amount');

        // Filters
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhere('phone', 'ilike', "%{$search}%")
                    ->orWhere('bride_name', 'ilike', "%{$search}%")
                    ->orWhere('groom_name', 'ilike', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            if ($status !== 'all' && $status !== 'Semua') {
                $query->where('status', $status);
            }
        }

        if ($city = $request->input('city')) {
            if ($city !== 'all' && $city !== 'Semua') {
                $query->where('city', $city);
            }
        }

        if ($source = $request->input('source')) {
            if ($source !== 'all' && $source !== 'Semua') {
                $query->where('source', $source);
            }
        }

        $perPage = (int) $request->input('per_page', 10);
        $clients = $query->latest('id')->paginate($perPage)->withQueryString();

        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();

        // Consolidated KPI Stats
        $clientStats = Client::selectRaw("
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
            COUNT(CASE WHEN status = 'blocked' THEN 1 END) as blocked,
            COUNT(CASE WHEN created_at >= ? THEN 1 END) as new_this_month
        ", [$startOfMonth])->first();

        $projectStats = Project::selectRaw("
            COUNT(*) as total_projects,
            COUNT(CASE WHEN status IN ('in_progress', 'editing') THEN 1 END) as ongoing,
            COALESCE(SUM(total_amount), 0) as total_val,
            COALESCE(SUM(paid_amount), 0) as total_rec
        ")->first();

        $cities = Client::whereNotNull('city')->distinct()->pluck('city');
        $sources = Client::whereNotNull('source')->distinct()->pluck('source');
        $categories = \App\Models\Category::where('status', 'active')
            ->select('id', 'name', 'slug', 'description', 'color', 'form_type')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();
        $packages = \App\Models\Package::where('status', 'active')->select('id', 'name', 'category_id', 'base_price', 'duration_hours', 'description')->get();
        $weddingOrganizers = \App\Models\WeddingOrganizer::whereIn('status', ['partner', 'active'])
            ->select('id', 'name', 'pic_name', 'phone', 'city', 'tier')
            ->orderBy('name')
            ->get();
        $allClients = Client::select('id', 'name', 'phone', 'city', 'email', 'bride_name', 'groom_name', 'child_name', 'father_name', 'mother_name', 'children')
            ->orderBy('name')
            ->get();
        $clientSources = \App\Models\ClientSource::where('status', 'active')
            ->select('id', 'name', 'type', 'avatar', 'is_primary')
            ->orderByDesc('created_at')
            ->get();

        return [
            'clients' => $clients,
            'filters' => (object) $request->only(['search', 'status', 'city', 'source', 'per_page']),
            'cities' => $cities,
            'sources' => $sources,
            'categories' => $categories,
            'packages' => $packages,
            'wedding_organizers' => $weddingOrganizers,
            'all_clients' => $allClients,
            'client_sources' => $clientSources,
            'stats' => [
                'total_clients' => (int) ($clientStats->total ?? 0),
                'active_clients' => (int) ($clientStats->active ?? 0),
                'blocked_clients' => (int) ($clientStats->blocked ?? 0),
                'new_this_month' => (int) ($clientStats->new_this_month ?? 0),
                'total_projects' => (int) ($projectStats->total_projects ?? 0),
                'ongoing_projects' => (int) ($projectStats->ongoing ?? 0),
                'total_value' => (float) ($projectStats->total_val ?? 0),
                'total_received' => (float) ($projectStats->total_rec ?? 0),
            ],
        ];
    }

    /**
     * Get detailed client with relations.
     */
    public function getClientDetail(Client $client): Client
    {
        $client->load([
            'user:id,name,email,phone,avatar,client_id,status,last_login_at,created_at',
            'category:id,name,slug,description,color,form_type',
            'referredByClient:id,name,phone,city,email,bride_name,groom_name',
            'referrals:id,name,phone,city,referred_by_client_id,created_at',
            'weddingOrganizer:id,name,pic_name,phone,email,city,tier',
            'clientSource:id,name,type,avatar,phone,email',
            'projects' => function ($q) {
                $q->with([
                    'category',
                    'package',
                    'invoices' => function ($iq) {
                        $iq->orderBy('created_at');
                    },
                    'fileLinks' => function ($q) {
                        $q->latest();
                    },
                ])->latest('created_at');
            },
            'invoices' => function ($q) {
                $q->with('project:id,name,project_number')->orderBy('created_at');
            },
            'payments' => function ($q) {
                $q->with(['paymentMethod', 'project'])->latest('payment_date');
            },
        ]);

        $client->loadCount(['projects', 'invoices', 'payments', 'referrals']);

        return $client;
    }

    /**
     * Create a new client and log activity.
     */
    public function createClient(array $data, ?User $causer = null): Client
    {
        if (isset($data['children']) && is_array($data['children'])) {
            $filtered = array_values(array_filter($data['children'], fn($c) => !empty(trim($c['name'] ?? ''))));
            $data['children'] = !empty($filtered) ? $filtered : null;
        }

        $clientFillable = (new Client())->getFillable();
        $clientData = array_intersect_key($data, array_flip($clientFillable));

        $client = Client::create($clientData);

        activity()
            ->causedBy($causer ?? auth()->user())
            ->performedOn($client)
            ->event('created')
            ->log("Klien baru {$client->name} berhasil ditambahkan");

        // If project / event details are provided, create linked Draft Project
        if (!empty($data['category_id']) || !empty($data['package_id']) || !empty($data['event_type']) || !empty($data['event_date']) || !empty($data['event_location']) || !empty($data['location'])) {
            try {
                $category = null;
                if (!empty($data['category_id'])) {
                    $category = \App\Models\Category::find($data['category_id']);
                }
                if (!$category && !empty($data['event_type'])) {
                    $category = \App\Models\Category::whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($data['event_type']) . '%'])->first();
                }

                $package = null;
                if (!empty($data['package_id'])) {
                    $package = \App\Models\Package::find($data['package_id']);
                }

                $projectPrice = !empty($data['custom_price']) && is_numeric($data['custom_price'])
                    ? (float) $data['custom_price']
                    : ($package ? (float) ($package->base_price ?? 0) : 0);

                $projectName = ($category ? $category->name : ($data['event_type'] ?: 'Project')) . ' - ' . $client->name;

                app(ProjectService::class)->createProject([
                    'client_id' => $client->id,
                    'wedding_organizer_id' => $client->wedding_organizer_id,
                    'client_source_id' => $client->client_source_id,
                    'category_id' => $category?->id ?? ($package?->category_id ?? null),
                    'package_id' => $package?->id ?? null,
                    'name' => $projectName,
                    'event_date' => $data['event_date'] ?? null,
                    'event_time' => $data['event_time'] ?? null,
                    'location' => $data['location'] ?? ($data['event_location'] ?? $client->address),
                    'price' => $projectPrice,
                    'total_amount' => $projectPrice,
                    'paid_amount' => 0,
                    'status' => 'draft',
                    'payment_status' => 'unpaid',
                    'category_data' => $data['category_data'] ?? null,
                ], $causer);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("Failed to auto-create project for client {$client->id}: " . $e->getMessage());
            }
        }

        return $client;
    }

    /**
     * Update client and log activity.
     */
    public function updateClient(Client $client, array $data, ?User $causer = null): Client
    {
        if (isset($data['children']) && is_array($data['children'])) {
            $filtered = array_values(array_filter($data['children'], fn($c) => !empty(trim($c['name'] ?? ''))));
            $data['children'] = !empty($filtered) ? $filtered : null;
        }

        $clientFillable = (new Client())->getFillable();
        $clientData = array_intersect_key($data, array_flip($clientFillable));

        $client->update($clientData);

        activity()
            ->causedBy($causer ?? auth()->user())
            ->performedOn($client)
            ->event('updated')
            ->log("Data klien {$client->name} telah diperbarui");

        return $client;
    }

    /**
     * Delete client and log activity.
     */
    public function deleteClient(Client $client, ?User $causer = null): bool
    {
        $name = $client->name;
        $deleted = $client->delete();

        activity()
            ->causedBy($causer ?? auth()->user())
            ->performedOn($client)
            ->event('deleted')
            ->log("Klien {$name} dipindahkan ke sampah");

        return (bool) $deleted;
    }
}
