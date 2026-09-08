<?php

namespace App\Http\Controllers;

use App\Models\FileLink;
use App\Models\Invoice;
use App\Models\Project;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get dynamic smart notifications for studio operation.
     */
    public function getNotifications(Request $request): JsonResponse
    {
        $notifications = [];
        $now = Carbon::now();

        // 1. Files Expired (Hidden from client portal)
        $expiredFiles = FileLink::with('project')
            ->expired()
            ->latest('expires_at')
            ->limit(4)
            ->get();

        foreach ($expiredFiles as $file) {
            $notifications[] = [
                'id' => "file_expired_{$file->id}",
                'type' => 'file_expired',
                'category' => 'files',
                'title' => 'File Drive Telah Expired',
                'message' => "Link file \"{$file->name}\" untuk project " . ($file->project?->name ?? 'Studio') . " telah expired dan disembunyikan dari Portal Klien.",
                'time_ago' => $file->expires_at ? $file->expires_at->diffForHumans() : 'Baru saja',
                'url' => $file->project_id ? "/projects/{$file->project_id}" : "/files",
                'priority' => 'high',
                'icon' => 'AlertTriangle',
                'color' => 'rose',
                'is_read' => false,
                'created_at' => $file->expires_at?->toIso8601String() ?? $now->toIso8601String(),
            ];
        }

        // 2. Files Expiring Soon (Within 7 Days)
        $expiringFiles = FileLink::with('project')
            ->expiringSoon(7)
            ->orderBy('expires_at')
            ->limit(4)
            ->get();

        foreach ($expiringFiles as $file) {
            $daysLeft = $file->expires_at ? max(0, $now->diffInDays($file->expires_at, false)) : 0;
            $notifications[] = [
                'id' => "file_expiring_{$file->id}",
                'type' => 'file_expiring',
                'category' => 'files',
                'title' => "File Segera Expired (H-{$daysLeft})",
                'message' => "Link \"{$file->name}\" (" . ($file->project?->name ?? 'Project') . ") akan kedaluwarsa pada " . ($file->expires_at?->format('d M Y') ?? '-') . ".",
                'time_ago' => "Sisa {$daysLeft} hari",
                'url' => $file->project_id ? "/projects/{$file->project_id}" : "/files",
                'priority' => 'medium',
                'icon' => 'Clock',
                'color' => 'amber',
                'is_read' => false,
                'created_at' => $file->expires_at?->toIso8601String() ?? $now->toIso8601String(),
            ];
        }

        // 3. Upcoming Photoshoot Events (Next 7 Days)
        $upcomingShoots = Project::with(['client', 'category'])
            ->whereNotNull('event_date')
            ->where('event_date', '>=', $now->toDateString())
            ->where('event_date', '<=', $now->copy()->addDays(7)->toDateString())
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->orderBy('event_date')
            ->limit(5)
            ->get();

        foreach ($upcomingShoots as $proj) {
            $diffDays = $now->diffInDays($proj->event_date, false);
            $dayLabel = $diffDays == 0 ? 'Hari Ini' : ($diffDays == 1 ? 'Besok' : "H-{$diffDays}");
            $notifications[] = [
                'id' => "event_upcoming_{$proj->id}",
                'type' => 'upcoming_event',
                'category' => 'schedule',
                'title' => "Jadwal Shoot ({$dayLabel})",
                'message' => "Project \"{$proj->name}\" (" . ($proj->category?->name ?? 'Pemotretan') . ") dijadwalkan pada " . ($proj->event_date?->format('d M Y') ?? '-') . ($proj->location ? " di {$proj->location}" : '') . ".",
                'time_ago' => $dayLabel,
                'url' => "/projects/{$proj->id}",
                'priority' => $diffDays <= 1 ? 'high' : 'medium',
                'icon' => 'Calendar',
                'color' => 'blue',
                'is_read' => false,
                'created_at' => $proj->event_date?->toIso8601String() ?? $now->toIso8601String(),
            ];
        }

        // 4. Upcoming Calendar Schedules (Next 7 Days)
        $upcomingSchedules = \App\Models\ProjectSchedule::with('project')
            ->where('date', '>=', $now->toDateString())
            ->where('date', '<=', $now->copy()->addDays(7)->toDateString())
            ->orderBy('date')
            ->orderBy('start_time')
            ->limit(5)
            ->get();

        foreach ($upcomingSchedules as $sched) {
            $diffDays = $now->diffInDays(Carbon::parse($sched->date), false);
            $dayLabel = $diffDays == 0 ? 'Hari Ini' : ($diffDays == 1 ? 'Besok' : "H-{$diffDays}");
            $timeStr = $sched->start_time ? " (" . substr($sched->start_time, 0, 5) . ")" : '';
            $notifications[] = [
                'id' => "schedule_upcoming_{$sched->id}",
                'type' => 'upcoming_schedule',
                'category' => 'schedule',
                'title' => "Jadwal Kalender ({$dayLabel})",
                'message' => "{$sched->title}{$timeStr}" . ($sched->location ? " di {$sched->location}" : '') . ".",
                'time_ago' => $dayLabel,
                'url' => "/calendar",
                'priority' => $diffDays <= 1 ? 'high' : 'medium',
                'icon' => 'Clock',
                'color' => 'indigo',
                'is_read' => false,
                'created_at' => Carbon::parse($sched->date)->toIso8601String(),
            ];
        }

        // 5. Upcoming Project Deadlines (Next 5 Days)
        $upcomingDeadlines = Project::whereNotNull('deadline')
            ->where('deadline', '>=', $now->toDateString())
            ->where('deadline', '<=', $now->copy()->addDays(5)->toDateString())
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->orderBy('deadline')
            ->limit(3)
            ->get();

        foreach ($upcomingDeadlines as $dl) {
            $diffDays = $now->diffInDays($dl->deadline, false);
            $dayLabel = $diffDays == 0 ? 'Hari Ini' : ($diffDays == 1 ? 'Besok' : "H-{$diffDays}");
            $notifications[] = [
                'id' => "deadline_upcoming_{$dl->id}",
                'type' => 'upcoming_deadline',
                'category' => 'schedule',
                'title' => "Deadline Project ({$dayLabel})",
                'message' => "Tenggat waktu project \"{$dl->name}\" jatuh pada " . ($dl->deadline?->format('d M Y') ?? '-') . ".",
                'time_ago' => $dayLabel,
                'url' => "/projects/{$dl->id}",
                'priority' => 'high',
                'icon' => 'AlertCircle',
                'color' => 'rose',
                'is_read' => false,
                'created_at' => $dl->deadline?->toIso8601String() ?? $now->toIso8601String(),
            ];
        }

        // 6. Overdue / Unpaid Invoices
        $pendingInvoices = Invoice::with(['client', 'project'])
            ->where('status', '!=', 'paid')
            ->where('remaining_amount', '>', 0)
            ->latest('due_date')
            ->limit(3)
            ->get();

        foreach ($pendingInvoices as $inv) {
            $isOverdue = $inv->due_date && $inv->due_date->isPast();
            $notifications[] = [
                'id' => "invoice_pending_{$inv->id}",
                'type' => 'invoice_pending',
                'category' => 'finance',
                'title' => $isOverdue ? 'Tagihan Jatuh Tempo' : 'Sisa Tagihan Belum Lunas',
                'message' => "Invoice {$inv->invoice_number} (" . ($inv->client?->name ?? 'Klien') . ") tersisa tagihan Rp " . number_format($inv->remaining_amount, 0, ',', '.') . ".",
                'time_ago' => $inv->due_date ? $inv->due_date->diffForHumans() : 'Belum lunas',
                'url' => $inv->project_id ? "/projects/{$inv->project_id}" : "/finance",
                'priority' => $isOverdue ? 'high' : 'low',
                'icon' => 'Receipt',
                'color' => $isOverdue ? 'rose' : 'purple',
                'is_read' => false,
                'created_at' => $inv->due_date?->toIso8601String() ?? $now->toIso8601String(),
            ];
        }

        $unreadCount = count($notifications);

        return response()->json([
            'unread_count' => $unreadCount,
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi telah ditandai sudah dibaca.',
        ]);
    }
}
