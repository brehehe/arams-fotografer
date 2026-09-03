<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Project;
use App\Models\Testimonial;
use App\Traits\HasWebpUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TestimonialController extends Controller
{
    use HasWebpUpload;

    public function index(Request $request): Response
    {
        $query = Testimonial::with(['project', 'client']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('client_name', 'like', "%{$search}%")
                    ->orWhere('package_name', 'like', "%{$search}%")
                    ->orWhere('comment', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        $perPage = (int) $request->input('per_page', 10);
        $testimonials = $query->orderBy('sort_order')->latest()->paginate($perPage)->withQueryString();

        $stats = [
            'total' => Testimonial::count(),
            'approved' => Testimonial::where('status', 'approved')->count(),
            'pending' => Testimonial::where('status', 'pending')->count(),
            'featured' => Testimonial::where('is_featured', true)->count(),
        ];

        $projects = Project::select('id', 'name', 'project_number', 'client_id')->latest()->limit(50)->get();
        $clients = Client::select('id', 'name')->latest()->limit(50)->get();

        return Inertia::render('MasterData/Testimonials/Index', [
            'testimonials' => $testimonials,
            'stats' => $stats,
            'projects' => $projects,
            'clients' => $clients,
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'package_name' => 'nullable|string|max:255',
            'project_id' => 'nullable|uuid|exists:projects,id',
            'client_id' => 'nullable|uuid|exists:clients,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string',
            'avatar' => 'nullable',
            'is_featured' => 'boolean',
            'status' => 'required|in:approved,pending,rejected',
            'sort_order' => 'integer',
        ]);

        $avatarPath = $request->input('avatar_url') ?? null;
        if ($request->hasFile('avatar_file')) {
            $avatarPath = $this->uploadThumbnailAsWebp($request->file('avatar_file'), 'avatars', 400, 400, 80);
        }

        Testimonial::create([
            'client_name' => $validated['client_name'],
            'package_name' => $validated['package_name'] ?? 'Paket Foto',
            'project_id' => $validated['project_id'] ?? null,
            'client_id' => $validated['client_id'] ?? null,
            'rating' => (int) $validated['rating'],
            'comment' => $validated['comment'],
            'avatar' => $avatarPath,
            'is_featured' => $request->boolean('is_featured', true),
            'status' => $validated['status'],
            'sort_order' => (int) ($validated['sort_order'] ?? 0),
        ]);

        return redirect()->back()->with('success', 'Ulasan klien berhasil ditambahkan.');
    }

    public function update(Request $request, Testimonial $testimonial): RedirectResponse
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'package_name' => 'nullable|string|max:255',
            'project_id' => 'nullable|uuid|exists:projects,id',
            'client_id' => 'nullable|uuid|exists:clients,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string',
            'avatar' => 'nullable',
            'is_featured' => 'boolean',
            'status' => 'required|in:approved,pending,rejected',
            'sort_order' => 'integer',
        ]);

        $avatarPath = $testimonial->avatar;
        if ($request->hasFile('avatar_file')) {
            $avatarPath = $this->uploadThumbnailAsWebp($request->file('avatar_file'), 'avatars', 400, 400, 80, $testimonial->avatar);
        } elseif ($request->has('avatar_url') && !empty($request->input('avatar_url'))) {
            $avatarPath = $request->input('avatar_url');
        }

        $testimonial->update([
            'client_name' => $validated['client_name'],
            'package_name' => $validated['package_name'] ?? 'Paket Foto',
            'project_id' => $validated['project_id'] ?? null,
            'client_id' => $validated['client_id'] ?? null,
            'rating' => (int) $validated['rating'],
            'comment' => $validated['comment'],
            'avatar' => $avatarPath,
            'is_featured' => $request->boolean('is_featured', true),
            'status' => $validated['status'],
            'sort_order' => (int) ($validated['sort_order'] ?? 0),
        ]);

        return redirect()->back()->with('success', 'Ulasan klien berhasil diperbarui.');
    }

    public function destroy(Testimonial $testimonial): RedirectResponse
    {
        $testimonial->delete();

        return redirect()->back()->with('success', 'Ulasan klien berhasil dihapus.');
    }
}
