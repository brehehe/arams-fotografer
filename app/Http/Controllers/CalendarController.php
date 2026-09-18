<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectSchedule;
use App\Services\CalendarService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function __construct(
        protected CalendarService $calendarService
    ) {}

    public function index(Request $request): Response
    {
        $data = $this->calendarService->getCalendarData();

        return Inertia::render('Calendar/Index', $data);
    }

    public function storeSchedule(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'title'      => 'required|string|max:255',
            'date'       => 'required|date',
            'start_time' => 'nullable|string',
            'end_time'   => 'nullable|string',
            'location'   => 'nullable|string|max:255',
            'type'       => 'nullable|string|max:50',
            'status'     => 'nullable|string|max:50',
            'notes'      => 'nullable|string',
        ]);

        $projectId = !empty($validated['project_id']) ? $validated['project_id'] : null;

        if (!$projectId && $request->filled('client_id')) {
            $projectId = Project::where('client_id', $request->input('client_id'))->latest()->first()?->id;
        }

        ProjectSchedule::create([
            'project_id' => $projectId,
            'title'      => $validated['title'],
            'date'       => $validated['date'],
            'start_time' => $validated['start_time'] ?? null,
            'end_time'   => $validated['end_time'] ?? null,
            'location'   => $validated['location'] ?? null,
            'type'       => $validated['type'] ?? 'shooting',
            'status'     => $validated['status'] ?? 'pending',
            'notes'      => $validated['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Jadwal berhasil ditambahkan!');
    }

    public function destroySchedule(string $schedule): RedirectResponse
    {
        // 1. If it's a project reference (e.g. "p-01a0...")
        if (str_starts_with($schedule, 'p-')) {
            $projectId = substr($schedule, 2);
            $project = Project::find($projectId);
            if ($project) {
                $project->update([
                    'event_date' => null,
                    'event_time' => null,
                    'end_date'   => null,
                ]);
                return redirect()->back()->with('success', 'Jadwal project berhasil dihapus dari kalender!');
            }
        }

        // 2. If it's a ProjectSchedule
        $item = ProjectSchedule::find($schedule);
        if ($item) {
            $projectId = $item->project_id;
            $eventDate = $item->date;
            $item->delete();

            // Clear project event_date if no other schedule remains and it matched
            if ($projectId) {
                $otherSchedulesCount = ProjectSchedule::where('project_id', $projectId)->count();
                if ($otherSchedulesCount === 0) {
                    $project = Project::find($projectId);
                    if ($project && $project->event_date && $eventDate && $project->event_date->format('Y-m-d') === $eventDate->format('Y-m-d')) {
                        $project->update([
                            'event_date' => null,
                            'event_time' => null,
                            'end_date'   => null,
                        ]);
                    }
                }
            }

            return redirect()->back()->with('success', 'Jadwal berhasil dihapus!');
        }

        // 3. Fallback: maybe $schedule is a raw Project ID
        $project = Project::find($schedule);
        if ($project && $project->event_date) {
            $project->update([
                'event_date' => null,
                'event_time' => null,
                'end_date'   => null,
            ]);
            return redirect()->back()->with('success', 'Jadwal project berhasil dihapus dari kalender!');
        }

        return redirect()->back()->with('error', 'Jadwal tidak ditemukan atau sudah dihapus.');
    }
}
