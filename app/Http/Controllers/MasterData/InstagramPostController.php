<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\InstagramPost;
use App\Traits\HasWebpUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InstagramPostController extends Controller
{
    use HasWebpUpload;

    public function index(Request $request): Response
    {
        $query = InstagramPost::query();

        if ($search = $request->input('search')) {
            $query->where('caption', 'ilike', "%{$search}%");
        }

        $perPage = (int) $request->input('per_page', 12);
        $posts = $query->orderBy('sort_order')->latest()->paginate($perPage)->withQueryString();

        $stats = [
            'total' => InstagramPost::count(),
            'active' => InstagramPost::where('is_active', true)->count(),
            'inactive' => InstagramPost::where('is_active', false)->count(),
        ];

        return Inertia::render('MasterData/InstagramPosts/Index', [
            'posts' => $posts,
            'stats' => $stats,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'image_url' => 'nullable|string',
            'caption' => 'nullable|string',
            'post_url' => 'nullable|string|max:255',
            'likes_count' => 'nullable|integer|min:0',
            'comments_count' => 'nullable|integer|min:0',
            'media_type' => 'nullable|string|in:photo,video,reel,carousel',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $imagePath = $request->input('image_url') ?? null;
        if ($request->hasFile('image_file')) {
            $imagePath = $this->uploadAsWebp($request->file('image_file'), 'instagram', 85, 1080, 1080);
        }

        if (empty($imagePath)) {
            return redirect()->back()->withErrors(['image_file' => 'Wajib mengunggah foto atau memasukkan URL gambar.']);
        }

        InstagramPost::create([
            'image_url' => $imagePath,
            'caption' => $validated['caption'] ?? '',
            'post_url' => $validated['post_url'] ?? 'https://instagram.com/aramspictures',
            'likes_count' => (int) ($validated['likes_count'] ?? rand(100, 300)),
            'comments_count' => (int) ($validated['comments_count'] ?? rand(5, 25)),
            'media_type' => $validated['media_type'] ?? 'photo',
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => (int) ($validated['sort_order'] ?? 0),
        ]);

        return redirect()->back()->with('success', 'Postingan Instagram berhasil ditambahkan.');
    }

    public function update(Request $request, InstagramPost $instagram_post): RedirectResponse
    {
        $validated = $request->validate([
            'image_url' => 'nullable|string',
            'caption' => 'nullable|string',
            'post_url' => 'nullable|string|max:255',
            'likes_count' => 'nullable|integer|min:0',
            'comments_count' => 'nullable|integer|min:0',
            'media_type' => 'nullable|string|in:photo,video,reel,carousel',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $imagePath = $instagram_post->image_url;
        if ($request->hasFile('image_file')) {
            $imagePath = $this->uploadAsWebp($request->file('image_file'), 'instagram', 85, 1080, 1080, $instagram_post->image_url);
        } elseif (!empty($request->input('image_url'))) {
            $imagePath = $request->input('image_url');
        }

        $instagram_post->update([
            'image_url' => $imagePath,
            'caption' => $validated['caption'] ?? '',
            'post_url' => $validated['post_url'] ?? 'https://instagram.com/aramspictures',
            'likes_count' => (int) ($validated['likes_count'] ?? $instagram_post->likes_count),
            'comments_count' => (int) ($validated['comments_count'] ?? $instagram_post->comments_count),
            'media_type' => $validated['media_type'] ?? 'photo',
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => (int) ($validated['sort_order'] ?? 0),
        ]);

        return redirect()->back()->with('success', 'Postingan Instagram berhasil diperbarui.');
    }

    public function destroy(InstagramPost $instagram_post): RedirectResponse
    {
        $instagram_post->delete();

        return redirect()->back()->with('success', 'Postingan Instagram berhasil dihapus.');
    }
}
