<?php

namespace App\Http\Controllers;

use App\Http\Requests\Calendar\StoreScheduleRequest;
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

    public function storeSchedule(StoreScheduleRequest $request): RedirectResponse
    {
        $this->calendarService->createSchedule(
            $request->validated(),
            $request->input('client_id'),
            $request->user()
        );

        return redirect()->back()->with('success', 'Jadwal berhasil ditambahkan!');
    }

    public function destroySchedule(string $schedule): RedirectResponse
    {
        $result = $this->calendarService->deleteSchedule($schedule, auth()->user());

        if (!$result['success']) {
            return redirect()->back()->with('error', $result['message']);
        }

        return redirect()->back()->with('success', $result['message']);
    }
}
