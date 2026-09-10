<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\PortfolioCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PortfolioCategory::query()
            ->withCount([
                'portfolios',
                'activePortfolios',
            ]);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            if ($status === 'show' || $status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'hide' || $status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $perPage = (int) $request->input('per_page', 12);
        $categories = $query->orderBy('sort_order')->latest('updated_at')->paginate($perPage)->withQueryString();

        $stats = [
            'total' => PortfolioCategory::count(),
            'active' => PortfolioCategory::where('is_active', true)->count(),
            'inactive' => PortfolioCategory::where('is_active', false)->count(),
            'with_images' => PortfolioCategory::whereHas('activePortfolios')->count(),
        ];

        return Inertia::render('MasterData/PortfolioCategories/Index', [
            'categories' => $categories,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:portfolio_categories,slug',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        if (empty($validated['slug'])) {
            $baseSlug = Str::slug($validated['name']);
            $slug = $baseSlug;
            $count = 1;
            while (PortfolioCategory::where('slug', $slug)->exists()) {
                $slug = "{$baseSlug}-{$count}";
                $count++;
            }
            $validated['slug'] = $slug;
        }

        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['sort_order'] = (int) ($validated['sort_order'] ?? 0);

        PortfolioCategory::create($validated);

        return redirect()->back()->with('success', 'Kategori portofolio berhasil ditambahkan.');
    }

    public function update(Request $request, PortfolioCategory $portfolio_category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:portfolio_categories,slug,' . $portfolio_category->id,
            'description' => 'nullable|string|max:1000',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $validated['is_active'] = $request->has('is_active') ? $request->boolean('is_active') : $portfolio_category->is_active;
        $validated['sort_order'] = (int) ($validated['sort_order'] ?? $portfolio_category->sort_order);

        $portfolio_category->update($validated);

        return redirect()->back()->with('success', 'Kategori portofolio berhasil diperbarui.');
    }

    public function toggleActive(PortfolioCategory $portfolio_category): RedirectResponse
    {
        $newStatus = !$portfolio_category->is_active;
        $portfolio_category->update(['is_active' => $newStatus]);

        $statusText = $newStatus ? 'ditampilkan (Show)' : 'disembunyikan (Hide)';
        return redirect()->back()->with('success', "Kategori {$portfolio_category->name} berhasil {$statusText}.");
    }

    public function destroy(PortfolioCategory $portfolio_category): RedirectResponse
    {
        $name = $portfolio_category->name;
        $portfolio_category->delete();

        return redirect()->back()->with('success', "Kategori {$name} berhasil dihapus.");
    }
}
