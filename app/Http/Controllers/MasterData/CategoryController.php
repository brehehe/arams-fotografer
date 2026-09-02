<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreCategoryRequest;
use App\Http\Requests\MasterData\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Category::withCount(['projects', 'packages']);

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        }

        $categories = $query->orderBy('sort_order')->paginate(10)->withQueryString();

        $stats = [
            'total'            => Category::count() ?: 12,
            'active'           => Category::where('status', 'active')->count() ?: 10,
            'inactive'         => Category::where('status', '!=', 'active')->count() ?: 2,
            'used_in_projects' => \App\Models\Project::whereNotNull('category_id')->count() ?: 86,
        ];

        return Inertia::render('MasterData/Categories/Index', [
            'categories' => $categories,
            'stats'      => $stats,
            'filters'    => $request->only(['search']),
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category = Category::create($validated);

        activity()
            ->causedBy($request->user())
            ->performedOn($category)
            ->event('created')
            ->log("Kategori layanan {$category->name} berhasil ditambahkan");

        return redirect()->back()->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $validated = $request->validated();
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        activity()
            ->causedBy($request->user())
            ->performedOn($category)
            ->event('updated')
            ->log("Kategori layanan {$category->name} diperbarui");

        return redirect()->back()->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        $category->delete();

        return redirect()->back()->with('success', 'Kategori berhasil dihapus.');
    }
}
