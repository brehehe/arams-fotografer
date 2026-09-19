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
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $service = Service::create($request->validated());

            activity()
                ->causedBy($request->user())
                ->performedOn($service)
                ->event('created')
                ->log("Layanan {$service->name} berhasil ditambahkan");

            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Layanan berhasil ditambahkan.');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Failed to create service: {$e->getMessage()}", ['exception' => $e]);
            throw $e;
        }
    }

    public function update(UpdateServiceRequest $request, Service $service): RedirectResponse
    {
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $service->update($request->validated());

            activity()
                ->causedBy($request->user())
                ->performedOn($service)
                ->event('updated')
                ->log("Layanan {$service->name} diperbarui");

            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Layanan berhasil diperbarui.');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Failed to update service {$service->id}: {$e->getMessage()}", ['exception' => $e]);
            throw $e;
        }
    }

    public function destroy(Service $service): RedirectResponse
    {
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $service->delete();
            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Layanan berhasil dihapus.');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Failed to delete service {$service->id}: {$e->getMessage()}", ['exception' => $e]);
            throw $e;
        }
    }
}
