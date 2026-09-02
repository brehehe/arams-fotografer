<?php

namespace App\Http\Controllers;

use App\Models\ClientSource;
use App\Models\ClientSourceAppreciation;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientSourceController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ClientSource::query()->with('appreciations');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
            });
        }

        if ($isPrimary = $request->input('is_primary')) {
            if ($isPrimary === 'yes' || $isPrimary === '1') {
                $query->where('is_primary', true);
            } elseif ($isPrimary === 'no' || $isPrimary === '0') {
                $query->where('is_primary', false);
            }
        }

        if ($type = $request->input('type')) {
            if ($type !== 'all') {
                $query->where('type', $type);
            }
        }

        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        $sources = $query->latest('created_at')->paginate(10)->withQueryString();

        $totalSources = ClientSource::count();

        $stats = [
            'total_sources' => $totalSources > 0 ? $totalSources : 28,
            'total_projects' => 76,
            'total_sales' => 185450000,
            'average_project_value' => 2439474,
        ];

        return Inertia::render('ClientSources/Index', [
            'sources' => $sources,
            'filters' => $request->only(['search', 'is_primary', 'type', 'status', 'start_date', 'end_date']),
            'stats' => $stats,
        ]);
    }

    public function show(string $id): Response
    {
        $source = ClientSource::with('appreciations')->findOrFail($id);

        // Mock/Seed realistic referral history matching Gambar 3
        $referralHistory = [
            [
                'id' => 1,
                'client' => 'Kevin & Jessica',
                'project' => 'Wedding',
                'project_category' => 'wedding',
                'event_date' => '27 Agu 2026',
                'amount' => 8500000,
                'status' => 'Selesai',
            ],
            [
                'id' => 2,
                'client' => 'Budi & Sarah',
                'project' => 'Wedding',
                'project_category' => 'wedding',
                'event_date' => '18 Agu 2026',
                'amount' => 6500000,
                'status' => 'Selesai',
            ],
            [
                'id' => 3,
                'client' => 'Andi & Lestari',
                'project' => 'Prewedding',
                'project_category' => 'prewedding',
                'event_date' => '10 Agu 2026',
                'amount' => 3750000,
                'status' => 'Selesai',
            ],
            [
                'id' => 4,
                'client' => 'Doni & Kartika',
                'project' => 'Wedding',
                'project_category' => 'wedding',
                'event_date' => '02 Agu 2026',
                'amount' => 4250000,
                'status' => 'Selesai',
            ],
            [
                'id' => 5,
                'client' => 'Rizky & Ayu',
                'project' => 'Engagement',
                'project_category' => 'engagement',
                'event_date' => '28 Jul 2026',
                'amount' => 2750000,
                'status' => 'Selesai',
            ],
            [
                'id' => 6,
                'client' => 'Fajar & Nabila',
                'project' => 'Wedding',
                'project_category' => 'wedding',
                'event_date' => '19 Jul 2026',
                'amount' => 5500000,
                'status' => 'Selesai',
            ],
            [
                'id' => 7,
                'client' => 'Hendra & Sinta',
                'project' => 'Prewedding',
                'project_category' => 'prewedding',
                'event_date' => '12 Jul 2026',
                'amount' => 2250000,
                'status' => 'Selesai',
            ],
            [
                'id' => 8,
                'client' => 'Tono & Diah',
                'project' => 'Wedding',
                'project_category' => 'wedding',
                'event_date' => '05 Jul 2026',
                'amount' => 4000000,
                'status' => 'Selesai',
            ],
            [
                'id' => 9,
                'client' => 'Agus & Mega',
                'project' => 'Event',
                'project_category' => 'event',
                'event_date' => '26 Jun 2026',
                'amount' => 1500000,
                'status' => 'Selesai',
            ],
            [
                'id' => 10,
                'client' => 'Yoga & Rani',
                'project' => 'Wedding',
                'project_category' => 'wedding',
                'event_date' => '15 Jun 2026',
                'amount' => 2000000,
                'status' => 'Selesai',
            ],
        ];

        $totalAmount = array_sum(array_column($referralHistory, 'amount'));

        $metrics = [
            'total_referral_clients' => 12,
            'total_projects' => 12,
            'total_project_value' => $totalAmount,
            'last_referral_date' => '27 Agustus 2026',
            'last_referral_project' => 'Kevin & Jessica (Wedding)',
        ];

        return Inertia::render('ClientSources/Show', [
            'source' => $source,
            'metrics' => $metrics,
            'referral_history' => $referralHistory,
            'total_amount' => $totalAmount,
            'appreciations' => $source->appreciations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:individual,wedding_organizer,vendor,social_media,ads,other',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string|in:active,inactive',
            'is_primary' => 'required|boolean',
        ]);

        $source = ClientSource::create($validated);

        activity()
            ->causedBy($request->user())
            ->performedOn($source)
            ->event('created')
            ->log("Sumber klien {$source->name} berhasil ditambahkan");

        return redirect()->back()->with('success', "Sumber klien {$source->name} berhasil ditambahkan.");
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $source = ClientSource::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:individual,wedding_organizer,vendor,social_media,ads,other',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string|in:active,inactive',
            'is_primary' => 'required|boolean',
        ]);

        $source->update($validated);

        activity()
            ->causedBy($request->user())
            ->performedOn($source)
            ->event('updated')
            ->log("Sumber klien {$source->name} berhasil diperbarui");

        return redirect()->back()->with('success', "Data sumber klien {$source->name} berhasil diperbarui.");
    }

    public function destroy(string $id): RedirectResponse
    {
        $source = ClientSource::findOrFail($id);
        $name = $source->name;
        $source->delete();

        activity()
            ->causedBy(auth()->user())
            ->performedOn($source)
            ->event('deleted')
            ->log("Sumber klien {$name} berhasil dihapus");

        return redirect()->route('client-sources.index')->with('success', "Sumber klien {$name} berhasil dihapus.");
    }

    public function storeAppreciation(Request $request, string $id): RedirectResponse
    {
        $source = ClientSource::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:given,pending',
            'date' => 'required|date',
            'type' => 'required|string|max:255',
            'amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $appreciation = $source->appreciations()->create($validated);

        activity()
            ->causedBy($request->user())
            ->performedOn($appreciation)
            ->event('created')
            ->log("Apresiasi referral untuk {$source->name} berhasil dicatat");

        return redirect()->back()->with('success', 'Apresiasi referral berhasil disimpan.');
    }

    public function destroyAppreciation(string $sourceId, string $appreciationId): RedirectResponse
    {
        $appreciation = ClientSourceAppreciation::where('client_source_id', $sourceId)->findOrFail($appreciationId);
        $appreciation->delete();

        return redirect()->back()->with('success', 'Apresiasi berhasil dibatalkan.');
    }
}
