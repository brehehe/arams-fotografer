<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreServiceRequest;
use App\Http\Requests\MasterData\UpdateServiceRequest;
use App\Models\Category;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Service::with('category:id,name,color');

        if ($search = $request->input('search')) {
            $query->where('name', 'ilike', "%{$search}%")
                ->orWhere('description', 'ilike', "%{$search}%");
        }

        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        $perPage = (int) $request->input('per_page', 10);
        $services = $query->latest('id')->paginate($perPage)->withQueryString();
        $categories = Category::where('status', 'active')->select('id', 'name', 'color')->orderBy('name')->get();

        $stats = [
            'total'            => Service::count(),
            'active'           => Service::where('status', 'active')->count(),
            'inactive'         => Service::where('status', '!=', 'active')->count(),
            'total_categories' => Category::whereHas('services')->count(),
        ];

        return Inertia::render('MasterData/Services/Index', [
            'services'   => $services,
            'categories' => $categories,
            'stats'      => $stats,
            'filters'    => $request->only(['search', 'category_id', 'status', 'per_page']),
        ]);
    }

    public function store(StoreServiceRequest $request): RedirectResponse
    {
        $service = Service::create($request->validated());

        activity()
            ->causedBy($request->user())
            ->performedOn($service)
            ->event('created')
            ->log("Layanan {$service->name} berhasil ditambahkan");

        return redirect()->back()->with('success', 'Layanan berhasil ditambahkan.');
    }

    public function update(UpdateServiceRequest $request, Service $service): RedirectResponse
    {
        $service->update($request->validated());

        activity()
            ->causedBy($request->user())
            ->performedOn($service)
            ->event('updated')
            ->log("Layanan {$service->name} diperbarui");

        return redirect()->back()->with('success', 'Layanan berhasil diperbarui.');
    }

    public function destroy(Service $service): RedirectResponse
    {
        $service->delete();

        return redirect()->back()->with('success', 'Layanan berhasil dihapus.');
    }
}
