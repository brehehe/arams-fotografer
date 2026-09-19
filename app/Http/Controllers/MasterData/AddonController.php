<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreAddonRequest;
use App\Http\Requests\MasterData\UpdateAddonRequest;
use App\Models\Addon;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AddonController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $perPage = (int) $request->input('per_page', 10);
        $addonCategory = $request->input('addon_category');
        $addonStatus = $request->input('addon_status');
        $opsCategory = $request->input('ops_category');
        $opsStatus = $request->input('ops_status');

        // 1. Ala Carte / Add-on Layanan
        $addonsQuery = Addon::with('category:id,name,color')->where('type', 'addon');
        if ($search) {
            $addonsQuery->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%");
            });
        }
        if ($addonCategory && $addonCategory !== 'all') {
            $addonsQuery->whereHas('category', fn ($q) => $q->where('name', $addonCategory));
        }
        if ($addonStatus && $addonStatus !== 'all') {
            $addonsQuery->where('status', $addonStatus);
        }
        $addons = $addonsQuery->latest('id')->paginate($perPage, ['*'], 'addon_page')->withQueryString();

        // 2. Biaya Operasional Project
        $opsQuery = Addon::with('category:id,name,color')->where('type', 'operational');
        if ($search) {
            $opsQuery->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('description', 'ilike', "%{$search}%");
            });
        }
        if ($opsCategory && $opsCategory !== 'all') {
            $opsQuery->whereHas('category', fn ($q) => $q->where('name', $opsCategory));
        }
        if ($opsStatus && $opsStatus !== 'all') {
            $opsQuery->where('status', $opsStatus);
        }
        $operationals = $opsQuery->latest('id')->paginate($perPage, ['*'], 'ops_page')->withQueryString();

        $categories = Category::where('status', 'active')->select('id', 'name', 'color')->get();

        $stats = [
            'total'            => Addon::count() ?: 16,
            'active'           => Addon::where('status', 'active')->count() ?: 15,
            'inactive'         => Addon::where('status', '!=', 'active')->count() ?: 1,
            'total_addons'     => Addon::where('type', 'addon')->count(),
            'total_ops'        => Addon::where('type', 'operational')->count(),
            'used_in_projects' => 84,
        ];

        return Inertia::render('MasterData/Addons/Index', [
            'addons'        => $addons,
            'operationals'  => $operationals,
            'categories'    => $categories,
            'stats'         => $stats,
            'filters'       => $request->only([
                'search',
                'type',
                'per_page',
                'addon_page',
                'ops_page',
                'addon_category',
                'addon_status',
                'ops_category',
                'ops_status',
            ]),
        ]);
    }

    public function store(StoreAddonRequest $request): RedirectResponse
    {
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $addon = Addon::create($request->validated());

            activity()
                ->causedBy($request->user())
                ->performedOn($addon)
                ->event('created')
                ->log("Addon {$addon->name} berhasil ditambahkan");

            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Addon berhasil ditambahkan.');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Failed to create addon: {$e->getMessage()}", ['exception' => $e]);
            throw $e;
        }
    }

    public function update(UpdateAddonRequest $request, Addon $addon): RedirectResponse
    {
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $addon->update($request->validated());

            activity()
                ->causedBy($request->user())
                ->performedOn($addon)
                ->event('updated')
                ->log("Addon {$addon->name} diperbarui");

            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Addon berhasil diperbarui.');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Failed to update addon {$addon->id}: {$e->getMessage()}", ['exception' => $e]);
            throw $e;
        }
    }

    public function destroy(Addon $addon): RedirectResponse
    {
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $addon->delete();
            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Addon berhasil dihapus.');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Failed to delete addon {$addon->id}: {$e->getMessage()}", ['exception' => $e]);
            throw $e;
        }
    }
}
