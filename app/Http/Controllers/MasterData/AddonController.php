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
        $query = Addon::with('category:id,name,color');

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        }

        $addons = $query->latest('id')->paginate(10)->withQueryString();
        $categories = Category::where('status', 'active')->select('id', 'name', 'color')->get();

        $stats = [
            'total'            => Addon::count() ?: 16,
            'active'           => Addon::where('status', 'active')->count() ?: 15,
            'inactive'         => Addon::where('status', '!=', 'active')->count() ?: 1,
            'used_in_projects' => 84,
        ];

        return Inertia::render('MasterData/Addons/Index', [
            'addons'     => $addons,
            'categories' => $categories,
            'stats'      => $stats,
            'filters'    => $request->only(['search']),
        ]);
    }

    public function store(StoreAddonRequest $request): RedirectResponse
    {
        $addon = Addon::create($request->validated());

        activity()
            ->causedBy($request->user())
            ->performedOn($addon)
            ->event('created')
            ->log("Addon {$addon->name} berhasil ditambahkan");

        return redirect()->back()->with('success', 'Addon berhasil ditambahkan.');
    }

    public function update(UpdateAddonRequest $request, Addon $addon): RedirectResponse
    {
        $addon->update($request->validated());

        activity()
            ->causedBy($request->user())
            ->performedOn($addon)
            ->event('updated')
            ->log("Addon {$addon->name} diperbarui");

        return redirect()->back()->with('success', 'Addon berhasil diperbarui.');
    }

    public function destroy(Addon $addon): RedirectResponse
    {
        $addon->delete();

        return redirect()->back()->with('success', 'Addon berhasil dihapus.');
    }
}
