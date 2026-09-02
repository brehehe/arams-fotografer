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
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        }

        $services = $query->latest('id')->paginate(10)->withQueryString();
        $categories = Category::where('status', 'active')->select('id', 'name', 'color')->get();

        $stats = [
            'total'            => Service::count() ?: 5,
            'active'           => Service::where('status', 'active')->count() ?: 5,
            'inactive'         => Service::where('status', '!=', 'active')->count() ?: 0,
            'used_in_projects' => 128,
        ];

        return Inertia::render('MasterData/Services/Index', [
            'services'   => $services,
            'categories' => $categories,
            'stats'      => $stats,
            'filters'    => $request->only(['search']),
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
