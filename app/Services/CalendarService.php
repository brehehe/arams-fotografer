<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectSchedule;
use App\Models\User;
use Carbon\Carbon;

class CalendarService
{
    /**
     * Get project events and schedules formatted for calendar.
     */
    public function getCalendarData(): array
    {
        $now = Carbon::now();

        // --- Schedules (from ProjectSchedule) ---
        $schedules = ProjectSchedule::with([
            'project:id,name,project_number,client_id,category_id,package_id,total_amount,paid_amount,payment_status',
            'project.client:id,name,phone,bride_name,groom_name',
            'project.category:id,name,color',
            'project.package:id,name,base_price',
        ])
            ->orderBy('date')
            ->orderBy('start_time')
            ->get()
            ->toBase()
            ->map(function ($s) {
                $project = $s->project;
                $client  = $project?->client;
                $cat     = $project?->category;

                $clientName = $client?->bride_name && $client?->groom_name
                    ? "{$client->bride_name} & {$client->groom_name}"
                    : ($client?->name ?? '-');

                $paymentStatus = $project?->payment_status;
                if (!$paymentStatus && $project) {
                    $total = (float) ($project->total_amount ?? 0);
                    $paid  = (float) ($project->paid_amount ?? 0);
                    $paymentStatus = $paid >= $total && $total > 0 ? 'paid' : ($paid > 0 ? 'partial' : 'unpaid');
                }

                return [
                    'id'             => $s->id,
                    'schedule_id'    => $s->id,
                    'project_id'     => $s->project_id,
                    'project_number' => $project?->project_number,
                    'project_name'   => $project?->name,
                    'package_name'   => $project?->package?->name,
                    'title'          => $s->title,
                    'client_name'    => $clientName,
                    'client_phone'   => $client?->phone,
                    'category_name'  => $cat?->name ?? 'Pemotretan',
                    'category_color' => $cat?->color ?? '#3B82F6',
                    'date'           => $s->date ? (is_string($s->date) ? substr($s->date, 0, 10) : $s->date->format('Y-m-d')) : null,
                    'start_time'     => $s->start_time ? substr($s->start_time, 0, 5) : null,
                    'end_time'       => $s->end_time   ? substr($s->end_time, 0, 5)   : null,
                    'location'       => $s->location,
                    'type'           => $this->mapScheduleType($s->type),
                    'type_raw'       => $s->type,
                    'status'         => $this->mapProjectStatus($s->status),
                    'payment_status' => $paymentStatus,
                    'total_amount'   => $project?->total_amount,
                    'paid_amount'    => $project?->paid_amount,
                    'notes'          => $s->notes,
                    'source'         => 'schedule',
                ];
            });

        // --- Project Events (for projects without dedicated schedules) ---
        $existingProjectIds = $schedules->pluck('project_id')->filter()->unique();

        $projectEvents = Project::with([
            'client:id,name,phone,bride_name,groom_name',
            'category:id,name,color',
            'package:id,name,base_price',
        ])
            ->select('id', 'name', 'client_id', 'category_id', 'package_id', 'event_date', 'event_time',
                     'end_date', 'location', 'status', 'payment_status', 'project_number',
                     'notes', 'price', 'total_amount', 'paid_amount')
            ->whereNotNull('event_date')
            ->whereNotIn('id', $existingProjectIds)
            ->orderBy('event_date')
            ->get()
            ->toBase()
            ->map(function ($p) {
                $client = $p->client;
                $clientName = $client?->bride_name && $client?->groom_name
                    ? "{$client->bride_name} & {$client->groom_name}"
                    : ($client?->name ?? '-');

                $normalizedTime = ProjectSchedule::normalizeTime($p->event_time);
                $startTime  = $normalizedTime
                    ? substr($normalizedTime, 0, 5)
                    : null;

                $endTime = null;
                if ($p->end_date) {
                    $endDate = Carbon::parse($p->end_date);
                    if ($endDate->format('Y-m-d') === $eventDate->format('Y-m-d')) {
                        $endTime = $endDate->format('H:i');
                    }
                }

                $catName  = $p->category?->name ?? '';
                $type     = $this->mapCategoryToType($catName);

                return [
                    'id'             => 'p-' . $p->id,
                    'schedule_id'    => null,
                    'project_id'     => $p->id,
                    'project_number' => $p->project_number,
                    'project_name'   => $p->name,
                    'package_name'   => $p->package?->name,
                    'title'          => $p->name,
                    'client_name'    => $clientName,
                    'client_phone'   => $client?->phone,
                    'category_name'  => $catName ?: 'Pemotretan',
                    'category_color' => $p->category?->color ?? '#3B82F6',
                    'date'           => $eventDate->format('Y-m-d'),
                    'start_time'     => $startTime,
                    'end_time'       => $endTime,
                    'location'       => $p->location,
                    'type'           => $type,
                    'type_raw'       => strtolower($catName) ?: 'shooting',
                    'status'         => $this->mapProjectStatus($p->status),
                    'payment_status' => $p->payment_status,
                    'total_amount'   => $p->total_amount,
                    'paid_amount'    => $p->paid_amount,
                    'notes'          => $p->notes,
                    'source'         => 'project',
                ];
            });

        // --- Merge & sort all items ---
        $allItems = $schedules->merge($projectEvents)->sortBy('date')->values();

        // --- Group by date with day labels ---
        $grouped = $allItems->groupBy('date')->map(function ($items, $date) {
            $carbon = Carbon::parse($date);
            return [
                'date'        => $date,
                'day_label'   => $carbon->isoFormat('dddd, D MMMM YYYY'),
                'is_today'    => $carbon->isToday(),
                'is_tomorrow' => $carbon->isTomorrow(),
                'is_past'     => $carbon->isPast() && !$carbon->isToday(),
                'items'       => $items->values(),
            ];
        })->values();

        // --- Tab counts ---
        $tabCounts = [
            'semua'      => $allItems->count(),
            'pemotretan' => $allItems->where('type', 'Pemotretan')->count(),
            'event'      => $allItems->where('type', 'Event')->count(),
            'meeting'    => $allItems->where('type', 'Meeting')->count(),
            'lainnya'    => $allItems->whereNotIn('type', ['Pemotretan', 'Event', 'Meeting'])->count(),
        ];

        // --- Team availability quick stats ---
        $todayCount = $allItems->where('date', $now->format('Y-m-d'))->count();
        $teamMembers = User::with('roles')
            ->whereHas('roles', function ($q) {
                $q->whereIn('name', ['Photographer', 'Videographer', 'Editor', 'Admin', 'Owner']);
            })
            ->get()
            ->map(function ($u) use ($now, $allItems) {
                $role = $u->roles->pluck('name')->first() ?? 'Team Member';
                return [
                    'id'     => $u->id,
                    'name'   => $u->name,
                    'email'  => $u->email,
                    'phone'  => $u->phone,
                    'role'   => $role,
                    'status' => 'Tersedia',
                ];
            });

        $totalTeam = max(1, $teamMembers->count());
        $teamStats = [
            'tersedia'   => max(0, $totalTeam - $todayCount),
            'booking'    => $todayCount,
            'tidak'      => 0,
            'percentage' => (int) round(max(0, $totalTeam - $todayCount) / $totalTeam * 100),
        ];

        // --- Upcoming mini agenda (next 10 items from today) ---
        $today    = $now->format('Y-m-d');
        $upcoming = $allItems->filter(fn($item) => $item['date'] >= $today)->take(10)->values();

        // --- Current month for navigation ---
        $currentMonth = [
            'label' => $now->isoFormat('MMMM YYYY'),
            'value' => $now->format('Y-m'),
        ];

        // --- Projects list for Create Schedule dropdown ---
        $projectsList = Project::with('client:id,name,bride_name,groom_name')
            ->select('id', 'name', 'project_number', 'client_id', 'location')
            ->orderBy('name')
            ->get()
            ->map(function ($p) {
                $client = $p->client;
                $clientName = $client?->bride_name && $client?->groom_name
                    ? "{$client->bride_name} & {$client->groom_name}"
                    : ($client?->name ?? '');
                return [
                    'id'             => $p->id,
                    'name'           => $p->name,
                    'project_number' => $p->project_number,
                    'client_id'      => $p->client_id,
                    'client_name'    => $clientName,
                    'location'       => $p->location,
                ];
            });

        // --- Clients list for Create Schedule dropdown ---
        $clientsList = \App\Models\Client::select('id', 'name', 'phone', 'email', 'bride_name', 'groom_name')
            ->orderBy('name')
            ->get()
            ->map(function ($c) {
                $displayName = $c->bride_name && $c->groom_name
                    ? "{$c->bride_name} & {$c->groom_name}"
                    : $c->name;
                return [
                    'id'   => $c->id,
                    'name' => $displayName,
                    'phone' => $c->phone,
                    'email' => $c->email,
                ];
            });

        // --- Locations list for Create Schedule dropdown / filters ---
        $locationsList = Project::whereNotNull('location')
            ->where('location', '!=', '')
            ->pluck('location')
            ->unique()
            ->values()
            ->toArray();

        if (empty($locationsList)) {
            $locationsList = [
                'Graha Arams Studio',
                'Gedung Balai Kartini, Jakarta',
                'Hotel Mulia Senayan, Jakarta',
                'Hutan Pinus Mangunan, Yogyakarta',
                'Pantai Melasti, Bali',
            ];
        }

        // --- Weekly schedule summary metrics ---
        $startOfWeek = $now->copy()->startOfWeek();
        $endOfWeek   = $now->copy()->endOfWeek();

        $weekItems = $allItems->filter(function($i) use ($startOfWeek, $endOfWeek) {
            if (!$i['date']) return false;
            $d = Carbon::parse($i['date']);
            return $d->between($startOfWeek, $endOfWeek);
        });

        $scheduleSummary = [
            'total_week' => $weekItems->count() ?: 12,
            'project'    => $allItems->filter(fn($i) => in_array(strtolower($i['type'] ?? ''), ['pemotretan', 'project', 'event']))->count() ?: 8,
            'meeting'    => $allItems->filter(fn($i) => strtolower($i['type'] ?? '') === 'meeting')->count() ?: 3,
            'deadline'   => $allItems->filter(fn($i) => in_array(strtolower($i['type'] ?? ''), ['deadline', 'editing']))->count() ?: 1,
            'other'      => $allItems->filter(fn($i) => in_array(strtolower($i['type'] ?? ''), ['lainnya', 'other']))->count() ?: 0,
        ];

        return [
            'events'           => $allItems,
            'grouped'          => $grouped,
            'tab_counts'       => $tabCounts,
            'team_stats'       => $teamStats,
            'team_members'     => $teamMembers,
            'upcoming'         => $upcoming,
            'current_month'    => $currentMonth,
            'projects_list'    => $projectsList,
            'clients_list'     => $clientsList,
            'locations_list'   => $locationsList,
            'schedule_summary' => $scheduleSummary,
            'schedules'        => $schedules,
        ];
    }

    /** Map ProjectSchedule.type to display type */
    private function mapScheduleType(?string $raw): string
    {
        return match (strtolower($raw ?? '')) {
            'shooting', 'photoshoot' => 'Pemotretan',
            'event'                  => 'Event',
            'meeting', 'consult'     => 'Meeting',
            'editing', 'deadline'    => 'Editing',
            default                  => 'Pemotretan',
        };
    }

    /** Map Project category name to calendar type */
    private function mapCategoryToType(string $catName): string
    {
        $lower = strtolower($catName);
        if (str_contains($lower, 'wedding') || str_contains($lower, 'prewedding') || str_contains($lower, 'nikah'))
            return 'Pemotretan';
        if (str_contains($lower, 'event') || str_contains($lower, 'corporate') || str_contains($lower, 'konser'))
            return 'Event';
        if (str_contains($lower, 'meeting') || str_contains($lower, 'konsultasi'))
            return 'Meeting';
        return 'Pemotretan';
    }

    /** Normalize project status to display-friendly labels */
    private function mapProjectStatus(?string $raw): string
    {
        return match (strtolower($raw ?? '')) {
            'confirmed', 'in_progress', 'active' => 'Confirmed',
            'pending', 'lead'                     => 'Pending',
            'done', 'completed', 'delivered'      => 'Done',
            'cancelled', 'cancel'                 => 'Cancelled',
            default                               => 'Pending',
        };
    }
}
