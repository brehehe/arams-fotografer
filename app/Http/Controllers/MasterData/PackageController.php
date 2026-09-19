<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StorePackageRequest;
use App\Http\Requests\MasterData\UpdatePackageRequest;
use App\Models\Category;
use App\Models\Package;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Package::with('category:id,name,color,workflow_type')->withCount('projects');

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
        $packages = $query->latest('id')->paginate($perPage)->withQueryString();
        $categories = Category::where('status', 'active')->select('id', 'name', 'color', 'workflow_type')->orderBy('name')->get();

        $stats = [
            'total'            => Package::count(),
            'active'           => Package::where('status', 'active')->count(),
            'inactive'         => Package::where('status', '!=', 'active')->count(),
            'total_categories' => Category::whereHas('packages')->count(),
        ];

        return Inertia::render('MasterData/Packages/Index', [
            'packages'   => $packages,
            'categories' => $categories,
            'stats'      => $stats,
            'filters'    => $request->only(['search', 'category_id', 'status', 'per_page']),
        ]);
    }

    public function store(StorePackageRequest $request): RedirectResponse
    {
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $package = Package::create($request->validated());

            activity()
                ->causedBy($request->user())
                ->performedOn($package)
                ->event('created')
                ->log("Paket foto {$package->name} berhasil ditambahkan");

            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Paket berhasil ditambahkan.');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Failed to create package: {$e->getMessage()}", ['exception' => $e]);
            throw $e;
        }
    }

    public function update(UpdatePackageRequest $request, Package $package): RedirectResponse
    {
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $package->update($request->validated());

            activity()
                ->causedBy($request->user())
                ->performedOn($package)
                ->event('updated')
                ->log("Paket foto {$package->name} diperbarui");

            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Paket berhasil diperbarui.');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Failed to update package {$package->id}: {$e->getMessage()}", ['exception' => $e]);
            throw $e;
        }
    }

    public function destroy(Package $package): RedirectResponse
    {
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $package->delete();
            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Paket berhasil dihapus.');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Failed to delete package {$package->id}: {$e->getMessage()}", ['exception' => $e]);
            throw $e;
        }
    }
}
