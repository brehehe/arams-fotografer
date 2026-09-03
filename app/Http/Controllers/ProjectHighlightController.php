<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectHighlight;
use App\Traits\HasWebpUpload;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProjectHighlightController extends Controller
{
    use HasWebpUpload;

    public function store(Request $request, Project $project): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'caption' => 'nullable|string',
            'image_url' => 'nullable|string',
            'media_type' => 'nullable|string|in:photo,video',
            'is_cover' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $imagePath = $request->input('image_url') ?? null;
        if ($request->hasFile('image_file')) {
            $imagePath = $this->uploadAsWebp($request->file('image_file'), "projects/{$project->id}/highlights", 85, 1920);
        }

        if (empty($imagePath)) {
            return redirect()->back()->withErrors(['image_file' => 'Wajib mengunggah foto highlight atau menyertakan URL gambar.']);
        }

        $isCover = $request->boolean('is_cover', false);
        if ($isCover) {
            $project->highlights()->update(['is_cover' => false]);
            $project->update(['thumbnail' => $imagePath]);
        }

        $project->highlights()->create([
            'title' => $validated['title'] ?? 'Momen Acara',
            'caption' => $validated['caption'] ?? '',
            'image_url' => $imagePath,
            'media_type' => $validated['media_type'] ?? 'photo',
            'is_cover' => $isCover,
            'sort_order' => (int) ($validated['sort_order'] ?? $project->highlights()->count() + 1),
        ]);

        return redirect()->back()->with('success', 'Foto highlight project berhasil ditambahkan.');
    }

    public function update(Request $request, Project $project, ProjectHighlight $highlight): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'caption' => 'nullable|string',
            'is_cover' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $isCover = $request->boolean('is_cover', false);
        if ($isCover && !$highlight->is_cover) {
            $project->highlights()->update(['is_cover' => false]);
            $project->update(['thumbnail' => $highlight->image_url]);
        }

        $highlight->update([
            'title' => $validated['title'] ?? $highlight->title,
            'caption' => $validated['caption'] ?? $highlight->caption,
            'is_cover' => $isCover,
            'sort_order' => (int) ($validated['sort_order'] ?? $highlight->sort_order),
        ]);

        return redirect()->back()->with('success', 'Highlight project berhasil diperbarui.');
    }

    public function setCover(Project $project, ProjectHighlight $highlight): RedirectResponse
    {
        $project->highlights()->update(['is_cover' => false]);
        $highlight->update(['is_cover' => true]);
        $project->update(['thumbnail' => $highlight->image_url]);

        return redirect()->back()->with('success', 'Foto berhasil dijadikan cover utama project.');
    }

    public function destroy(Project $project, ProjectHighlight $highlight): RedirectResponse
    {
        $highlight->delete();

        return redirect()->back()->with('success', 'Foto highlight berhasil dihapus.');
    }
}
