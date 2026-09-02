<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Activity::with('causer');

        if ($userId = $request->input('user_id')) {
            $query->where('causer_id', $userId)->where('causer_type', User::class);
        }

        if ($event = $request->input('event')) {
            $query->where('event', $event);
        }

        if ($search = $request->input('search')) {
            $query->where('description', 'like', "%{$search}%");
        }

        $activities = $query->latest()->paginate(20)->withQueryString();
        $users = User::all(['id', 'name']);

        return Inertia::render('ActivityLog/Index', [
            'activities' => $activities,
            'users' => $users,
            'filters' => $request->only(['user_id', 'event', 'search']),
        ]);
    }
}
