<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use App\Models\PortfolioCategory;
use App\Traits\HasWebpUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    use HasWebpUpload;

    public function index(Request $request): Response
    {
        $query = Portfolio::query()->with('category');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('caption', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->input('category_id')) {
            $query->where('portfolio_category_id', $categoryId);
        }

        if ($status = $request->input('status')) {
            if ($status === 'show' || $status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'hide' || $status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $perPage = (int) $request->input('per_page', 12);
        $portfolios = $query->orderBy('sort_order')->latest('updated_at')->paginate($perPage)->withQueryString();

        $stats = [
            'total' => Portfolio::count(),
            'active' => Portfolio::where('is_active', true)->count(),
            'inactive' => Portfolio::where('is_active', false)->count(),
            'categories_count' => PortfolioCategory::count(),
        ];

        $categories = PortfolioCategory::orderBy('sort_order')->get(['id', 'name', 'is_active']);

        return Inertia::render('MasterData/Portfolios/Index', [
            'portfolios' => $portfolios,
            'stats' => $stats,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'portfolio_category_id' => 'nullable|uuid|exists:portfolio_categories,id',
            'title' => 'required|string|max:255',
            'caption' => 'nullable|string|max:1000',
            'image_url' => 'nullable|string|max:1000',
            'image_file' => 'nullable|image|max:10240', // max 10MB
            'media_type' => 'nullable|string|in:photo,video',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $imagePath = $request->input('image_url');
        if ($request->hasFile('image_file')) {
            $imagePath = $this->uploadAsWebp($request->file('image_file'), 'portfolios', 85, 1920, 1920);
        }

        if (empty($imagePath)) {
            return redirect()->back()->withErrors(['image_file' => 'Wajib mengunggah foto atau memasukkan URL gambar karya portofolio.']);
        }

        Portfolio::create([
            'portfolio_category_id' => $validated['portfolio_category_id'] ?? null,
            'title' => $validated['title'],
            'caption' => $validated['caption'] ?? '',
            'image_url' => $imagePath,
            'media_type' => $validated['media_type'] ?? 'photo',
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => (int) ($validated['sort_order'] ?? 0),
            'likes_count' => rand(80, 260),
            'comments_count' => rand(5, 35),
        ]);

        return redirect()->back()->with('success', 'Karya portofolio berhasil ditambahkan.');
    }

    public function update(Request $request, Portfolio $portfolio): RedirectResponse
    {
        $validated = $request->validate([
            'portfolio_category_id' => 'nullable|uuid|exists:portfolio_categories,id',
            'title' => 'required|string|max:255',
            'caption' => 'nullable|string|max:1000',
            'image_url' => 'nullable|string|max:1000',
            'image_file' => 'nullable|image|max:10240',
            'media_type' => 'nullable|string|in:photo,video',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $imagePath = $portfolio->image_url;
        if ($request->hasFile('image_file')) {
            $imagePath = $this->uploadAsWebp($request->file('image_file'), 'portfolios', 85, 1920, 1920, $portfolio->image_url);
        } elseif (!empty($request->input('image_url'))) {
            $imagePath = $request->input('image_url');
        }

        $portfolio->update([
            'portfolio_category_id' => $validated['portfolio_category_id'] ?? $portfolio->portfolio_category_id,
            'title' => $validated['title'],
            'caption' => $validated['caption'] ?? '',
            'image_url' => $imagePath,
            'media_type' => $validated['media_type'] ?? $portfolio->media_type,
            'is_active' => $request->has('is_active') ? $request->boolean('is_active') : $portfolio->is_active,
            'sort_order' => (int) ($validated['sort_order'] ?? $portfolio->sort_order),
        ]);

        return redirect()->back()->with('success', 'Karya portofolio berhasil diperbarui.');
    }

    public function toggleActive(Portfolio $portfolio): RedirectResponse
    {
        $newStatus = !$portfolio->is_active;
        $portfolio->update(['is_active' => $newStatus]);

        $statusText = $newStatus ? 'ditampilkan (Show)' : 'disembunyikan (Hide)';
        return redirect()->back()->with('success', "Karya '{$portfolio->title}' berhasil {$statusText}.");
    }

    public function destroy(Portfolio $portfolio): RedirectResponse
    {
        $title = $portfolio->title;
        $portfolio->delete();

        return redirect()->back()->with('success', "Karya '{$title}' berhasil dihapus.");
    }
}
