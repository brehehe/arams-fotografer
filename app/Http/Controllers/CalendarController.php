<?php

namespace App\Http\Controllers;

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

        $projectId = $validated['project_id'] ?? \App\Models\Project::first()?->id;

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

    public function destroySchedule(ProjectSchedule $schedule): RedirectResponse
    {
        $schedule->delete();

        return redirect()->back()->with('success', 'Jadwal berhasil dihapus!');
    }
}
