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
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('content', 'ilike', "%{$search}%")
                    ->orWhere('type', 'ilike', "%{$search}%");
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

        $perPage = (int) $request->input('per_page', 10);
        $templates = $query->latest('updated_at')->paginate($perPage)->withQueryString();

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
            'filters' => $request->only(['search', 'type', 'status', 'per_page']),
            'stats' => $stats,
            'type_counts' => $typeCounts,
        ]);
    }

    public function store(StoreNoteTemplateRequest $request): RedirectResponse
    {
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $template = NoteTemplate::create($request->validated());

            activity()
                ->causedBy($request->user())
                ->performedOn($template)
                ->event('created')
                ->log("Template catatan {$template->title} berhasil ditambahkan");

            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Template catatan berhasil ditambahkan.');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Failed to create note template: {$e->getMessage()}", ['exception' => $e]);
            throw $e;
        }
    }

    public function update(UpdateNoteTemplateRequest $request, NoteTemplate $note): RedirectResponse
    {
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $note->update($request->validated());

            activity()
                ->causedBy($request->user())
                ->performedOn($note)
                ->event('updated')
                ->log("Template catatan {$note->title} diperbarui");

            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Template catatan berhasil diperbarui.');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Failed to update note template {$note->id}: {$e->getMessage()}", ['exception' => $e]);
            throw $e;
        }
    }

    public function destroy(NoteTemplate $note): RedirectResponse
    {
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $title = $note->title;
            $note->delete();

            activity()
                ->causedBy(auth()->user())
                ->performedOn($note)
                ->event('deleted')
                ->log("Template catatan {$title} berhasil dihapus");

            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Template catatan berhasil dihapus.');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Failed to delete note template {$note->id}: {$e->getMessage()}", ['exception' => $e]);
            throw $e;
        }
    }
}
