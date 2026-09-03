<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\PromoSlide;
use App\Traits\HasWebpUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PromoSlideController extends Controller
{
    use HasWebpUpload;

    public function index(Request $request): Response
    {
        $query = PromoSlide::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('tag', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $perPage = (int) $request->input('per_page', 10);
        $slides = $query->orderBy('sort_order')->latest()->paginate($perPage)->withQueryString();

        $stats = [
            'total' => PromoSlide::count(),
            'active' => PromoSlide::where('is_active', true)->count(),
            'inactive' => PromoSlide::where('is_active', false)->count(),
        ];

        return Inertia::render('MasterData/PromoSlides/Index', [
            'slides' => $slides,
            'stats' => $stats,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'tag' => 'required|string|max:100',
            'description' => 'nullable|string',
            'button_text' => 'required|string|max:100',
            'button_url' => 'nullable|string|max:255',
            'image' => 'nullable',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $imagePath = $request->input('image_url') ?? null;
        if ($request->hasFile('image_file')) {
            $imagePath = $this->uploadAsWebp($request->file('image_file'), 'promo_slides', 85, 1920);
        } elseif (!empty($validated['image'])) {
            $imagePath = $validated['image'];
        }

        PromoSlide::create([
            'title' => $validated['title'],
            'tag' => $validated['tag'],
            'description' => $validated['description'] ?? '',
            'button_text' => $validated['button_text'],
            'button_url' => $validated['button_url'] ?? '/form-klien',
            'image' => $imagePath ?? '/images/wedding-couple.jpg',
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => (int) ($validated['sort_order'] ?? 0),
        ]);

        return redirect()->back()->with('success', 'Promo Slide berhasil ditambahkan.');
    }

    public function update(Request $request, PromoSlide $promo_slide): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'tag' => 'required|string|max:100',
            'description' => 'nullable|string',
            'button_text' => 'required|string|max:100',
            'button_url' => 'nullable|string|max:255',
            'image' => 'nullable',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $imagePath = $promo_slide->image;
        if ($request->hasFile('image_file')) {
            $imagePath = $this->uploadAsWebp($request->file('image_file'), 'promo_slides', 85, 1920, $promo_slide->image);
        } elseif (!empty($request->input('image_url'))) {
            $imagePath = $request->input('image_url');
        }

        $promo_slide->update([
            'title' => $validated['title'],
            'tag' => $validated['tag'],
            'description' => $validated['description'] ?? '',
            'button_text' => $validated['button_text'],
            'button_url' => $validated['button_url'] ?? '/form-klien',
            'image' => $imagePath,
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => (int) ($validated['sort_order'] ?? 0),
        ]);

        return redirect()->back()->with('success', 'Promo Slide berhasil diperbarui.');
    }

    public function destroy(PromoSlide $promo_slide): RedirectResponse
    {
        $promo_slide->delete();

        return redirect()->back()->with('success', 'Promo Slide berhasil dihapus.');
    }
}
