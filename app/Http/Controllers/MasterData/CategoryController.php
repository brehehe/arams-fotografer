<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreCategoryRequest;
use App\Http\Requests\MasterData\UpdateCategoryRequest;
use App\Models\Category;
use App\Traits\HasWebpUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    use HasWebpUpload;

    public function index(Request $request): Response
    {
        $query = Category::withCount(['projects', 'packages', 'services']);

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        }

        $perPage = (int) $request->input('per_page', 10);
        $categories = $query->orderBy('sort_order')->paginate($perPage)->withQueryString();

        $stats = [
            'total'            => Category::count(),
            'active'           => Category::where('status', 'active')->count(),
            'inactive'         => Category::where('status', '!=', 'active')->count(),
            'used_in_projects' => \App\Models\Project::whereNotNull('category_id')->count(),
        ];

        return Inertia::render('MasterData/Categories/Index', [
            'categories' => $categories,
            'stats'      => $stats,
            'filters'    => $request->only(['search', 'per_page']),
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $imagePath = $request->input('image_url') ?: ($request->input('image') ?: null);
        if ($request->hasFile('image_file')) {
            $imagePath = $this->uploadAsWebp($request->file('image_file'), 'categories', 85, 1920);
        }
        $validated['image'] = $imagePath;

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

        $imagePath = $category->image;
        if ($request->hasFile('image_file')) {
            $imagePath = $this->uploadAsWebp($request->file('image_file'), 'categories', 85, 1920, $category->image);
        } elseif ($request->has('image_url')) {
            $imagePath = $request->input('image_url');
        } elseif ($request->has('image')) {
            $imagePath = $request->input('image');
        }
        $validated['image'] = $imagePath;

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
        if ($category->image) {
            $this->deleteWebpImage($category->image);
        }

        $category->delete();

        return redirect()->back()->with('success', 'Kategori berhasil dihapus.');
    }
}
