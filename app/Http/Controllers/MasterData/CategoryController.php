<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreCategoryRequest;
use App\Http\Requests\MasterData\UpdateCategoryRequest;
use App\Models\Category;
use App\Traits\HasWebpUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            $query->where('name', 'ilike', "%{$search}%")
                ->orWhere('description', 'ilike', "%{$search}%");
        }

        $perPage = (int) $request->input('per_page', 50);
        $categories = $query->orderBy('sort_order')->orderBy('name')->paginate($perPage)->withQueryString();

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

        DB::beginTransaction();
        try {
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

            DB::commit();

            return redirect()->back()->with('success', 'Kategori berhasil ditambahkan.');
        } catch (\Throwable $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Failed to create category: {$e->getMessage()}", ['exception' => $e]);

            return redirect()->back()->with('error', 'Gagal menambahkan kategori: ' . $e->getMessage())->withInput();
        }
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $validated = $request->validated();
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        DB::beginTransaction();
        try {
            $imagePath = $category->image;
            if ($request->hasFile('image_file')) {
                $imagePath = $this->uploadAsWebp($request->file('image_file'), 'categories', 85, 1920, oldPath: $category->image);
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

            DB::commit();

            return redirect()->back()->with('success', 'Kategori berhasil diperbarui.');
        } catch (\Throwable $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Failed to update category {$category->id}: {$e->getMessage()}", ['exception' => $e]);

            return redirect()->back()->with('error', 'Gagal memperbarui kategori: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy(Category $category): RedirectResponse
    {
        DB::beginTransaction();
        try {
            if ($category->image) {
                $this->deleteWebpImage($category->image);
            }

            $category->delete();

            DB::commit();

            return redirect()->back()->with('success', 'Kategori berhasil dihapus.');
        } catch (\Throwable $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Failed to delete category {$category->id}: {$e->getMessage()}", ['exception' => $e]);

            return redirect()->back()->with('error', 'Gagal menghapus kategori: ' . $e->getMessage());
        }
    }

    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids'   => ['required', 'array'],
            'ids.*' => ['required', 'uuid', 'exists:categories,id'],
        ]);

        DB::beginTransaction();
        try {
            foreach ($validated['ids'] as $index => $id) {
                Category::where('id', $id)->update(['sort_order' => $index + 1]);
            }

            activity()
                ->causedBy($request->user())
                ->event('reordered')
                ->log('Urutan kategori project diperbarui');

            DB::commit();

            return redirect()->back()->with('success', 'Urutan kategori project berhasil diperbarui.');
        } catch (\Throwable $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Failed to reorder categories: {$e->getMessage()}", ['exception' => $e]);

            return redirect()->back()->with('error', 'Gagal memperbarui urutan kategori: ' . $e->getMessage());
        }
    }
}
