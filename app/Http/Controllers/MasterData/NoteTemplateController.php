<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreNoteTemplateRequest;
use App\Http\Requests\MasterData\UpdateNoteTemplateRequest;
use App\Models\NoteTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NoteTemplateController extends Controller
{
    public function index(Request $request): Response
    {
        $query = NoteTemplate::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%");
            });
        }

        if ($type = $request->input('type')) {
            if ($type !== 'all' && $type !== 'semua') {
                $query->where('type', $type);
            }
        }

        if ($status = $request->input('status')) {
            if ($status !== 'all' && $status !== 'semua') {
                $query->where('status', $status);
            }
        }

        $templates = $query->latest('updated_at')->paginate(10)->withQueryString();

        // Calculate dynamic stats
        $totalCount = NoteTemplate::count();
        $activeCount = NoteTemplate::where('status', 'active')->count();
        $inactiveCount = NoteTemplate::where('status', 'inactive')->count();

        $stats = [
            'total' => $totalCount,
            'active' => $activeCount,
            'inactive' => $inactiveCount,
            'used_in_project' => 86,
        ];

        $typeCounts = [
            'all' => $totalCount,
            'meeting' => NoteTemplate::where('type', 'meeting')->count(),
            'follow_up' => NoteTemplate::where('type', 'follow_up')->count(),
            'project_process' => NoteTemplate::where('type', 'project_process')->count(),
            'handover' => NoteTemplate::where('type', 'handover')->count(),
            'other' => NoteTemplate::where('type', 'other')->count(),
        ];

        return Inertia::render('MasterData/Notes/Index', [
            'templates' => $templates,
            'filters' => $request->only(['search', 'type', 'status']),
            'stats' => $stats,
            'type_counts' => $typeCounts,
        ]);
    }

    public function store(StoreNoteTemplateRequest $request): RedirectResponse
    {
        $template = NoteTemplate::create($request->validated());

        activity()
            ->causedBy($request->user())
            ->performedOn($template)
            ->event('created')
            ->log("Template catatan {$template->title} berhasil ditambahkan");

        return redirect()->back()->with('success', 'Template catatan berhasil ditambahkan.');
    }

    public function update(UpdateNoteTemplateRequest $request, NoteTemplate $note): RedirectResponse
    {
        $note->update($request->validated());

        activity()
            ->causedBy($request->user())
            ->performedOn($note)
            ->event('updated')
            ->log("Template catatan {$note->title} diperbarui");

        return redirect()->back()->with('success', 'Template catatan berhasil diperbarui.');
    }

    public function destroy(NoteTemplate $note): RedirectResponse
    {
        $title = $note->title;
        $note->delete();

        activity()
            ->causedBy(auth()->user())
            ->performedOn($note)
            ->event('deleted')
            ->log("Template catatan {$title} berhasil dihapus");

        return redirect()->back()->with('success', 'Template catatan berhasil dihapus.');
    }
}
