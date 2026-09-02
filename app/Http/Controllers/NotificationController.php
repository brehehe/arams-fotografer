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
            ->limit(4)
            ->get();

        foreach ($upcomingShoots as $proj) {
            $diffDays = $now->diffInDays($proj->event_date, false);
            $dayLabel = $diffDays == 0 ? 'Hari Ini' : ($diffDays == 1 ? 'Besok' : "H-{$diffDays}");
            $notifications[] = [
                'id' => "event_upcoming_{$proj->id}",
                'type' => 'upcoming_event',
                'category' => 'schedule',
                'title' => "Jadwal Shoot ({$dayLabel})",
                'message' => "Acara \"{$proj->name}\" (" . ($proj->category?->name ?? 'Event') . ") dijadwalkan pada " . ($proj->event_date?->format('d M Y') ?? '-') . " di " . ($proj->location ?: 'Lokasi Klien') . ".",
                'time_ago' => $dayLabel,
                'url' => "/projects/{$proj->id}",
                'priority' => $diffDays <= 1 ? 'high' : 'medium',
                'icon' => 'Calendar',
                'color' => 'blue',
                'is_read' => false,
                'created_at' => $proj->event_date?->toIso8601String() ?? $now->toIso8601String(),
            ];
        }

        // 4. Overdue / Unpaid Invoices
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
