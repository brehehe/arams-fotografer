<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\FileLink;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\ProjectSchedule;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get dynamic smart notifications for studio operation and client portal.
     */
    public function getNotifications(Request $request): JsonResponse
    {
        $user = $request->user();
        $now = Carbon::now();
        $notifications = [];

        // Check if the request is from client context or authenticated client
        $isClientContext = ($request->query('portal') === 'client')
            || str_contains($request->header('referer', ''), '/client')
            || ($user && ($user->hasRole('Client') || $user->hasRole('client') || !empty($user->client_id)));

        if ($isClientContext) {
            // ── CLIENT NOTIFICATIONS (STRICTLY CLIENT-ONLY) ───────────────────
            $client = null;
            if ($user && $user->client_id) {
                $client = Client::find($user->client_id);
            } elseif ($user && $user->email) {
                $client = Client::where('email', $user->email)->first();
            }

            // If accessing client portal preview without direct client_id on user model
            if (!$client) {
                $referer = $request->header('referer', '');
                if (preg_match('/\/client\/projects\/([a-zA-Z0-9\-]+)/', $referer, $matches)) {
                    $projId = $matches[1];
                    $proj = Project::find($projId);
                    if ($proj && $proj->client_id) {
                        $client = Client::find($proj->client_id);
                    }
                }
            }

            if (!$client) {
                $client = Client::first();
            }

            if (!$client) {
                return response()->json([
                    'unread_count' => 0,
                    'notifications' => [],
                ]);
            }

            $clientProjects = Project::where('client_id', $client->id)->get();
            $projectIds = $clientProjects->pluck('id')->toArray();

            // 1. New & Active Drive Files ready for download
            if (!empty($projectIds)) {
                $availableFiles = FileLink::whereIn('project_id', $projectIds)
                    ->active()
                    ->with('project')
                    ->latest()
                    ->limit(5)
                    ->get();

                foreach ($availableFiles as $file) {
                    $projName = $file->project?->name ?? 'Project Anda';
                    $targetUrl = "/client/projects/{$file->project_id}#files";
                    $notifications[] = [
                        'id' => "client_file_{$file->id}",
                        'type' => 'file_available',
                        'category' => 'files',
                        'title' => 'File Galeri Siap Diunduh',
                        'message' => "File \"{$file->name}\" untuk {$projName} telah siap dan dapat diunduh di Google Drive.",
                        'time_ago' => $file->created_at ? $file->created_at->diffForHumans() : 'Baru saja',
                        'url' => $targetUrl,
                        'action_url' => $targetUrl,
                        'priority' => 'medium',
                        'icon' => 'Download',
                        'color' => 'blue',
                        'is_read' => false,
                        'created_at' => $file->created_at?->toIso8601String() ?? $now->toIso8601String(),
                    ];
                }

                // 2. Files Expiring Soon for Client (H-7 warning)
                $expiringClientFiles = FileLink::whereIn('project_id', $projectIds)
                    ->expiringSoon(7)
                    ->with('project')
                    ->orderBy('expires_at')
                    ->limit(3)
                    ->get();

                foreach ($expiringClientFiles as $file) {
                    $daysLeft = $file->expires_at ? max(0, $now->diffInDays($file->expires_at, false)) : 0;
                    $targetUrl = "/client/projects/{$file->project_id}#files";
                    $notifications[] = [
                        'id' => "client_file_expiring_{$file->id}",
                        'type' => 'file_expiring',
                        'category' => 'files',
                        'title' => "Masa Aktif Drive Berakhir (H-{$daysLeft})",
                        'message' => "Link unduh \"{$file->name}\" akan kedaluwarsa dalam {$daysLeft} hari (" . ($file->expires_at?->format('d M Y') ?? '-') . "). Segera amankan cadangan file Anda.",
                        'time_ago' => "Sisa {$daysLeft} hari",
                        'url' => $targetUrl,
                        'action_url' => $targetUrl,
                        'priority' => 'high',
                        'icon' => 'Clock',
                        'color' => 'amber',
                        'is_read' => false,
                        'created_at' => $file->expires_at?->toIso8601String() ?? $now->toIso8601String(),
                    ];
                }

                // 3. Upcoming Photoshoot Date
                $upcomingShoots = $clientProjects->where('status', '!=', 'completed')
                    ->where('status', '!=', 'cancelled')
                    ->filter(function ($proj) use ($now) {
                        return $proj->event_date && $proj->event_date >= $now->toDateString() && $proj->event_date <= $now->copy()->addDays(14)->toDateString();
                    });

                foreach ($upcomingShoots as $proj) {
                    $diffDays = $now->diffInDays($proj->event_date, false);
                    $dayLabel = $diffDays == 0 ? 'Hari Ini' : ($diffDays == 1 ? 'Besok' : "H-{$diffDays}");
                    $targetUrl = "/client/projects/{$proj->id}";
                    $notifications[] = [
                        'id' => "client_shoot_{$proj->id}",
                        'type' => 'upcoming_shoot',
                        'category' => 'schedule',
                        'title' => "Jadwal Pemotretan ({$dayLabel})",
                        'message' => "Sesi pemotretan \"{$proj->name}\" dijadwalkan pada " . ($proj->event_date?->format('d M Y') ?? '-') . ($proj->location ? " di {$proj->location}" : '') . ".",
                        'time_ago' => $dayLabel,
                        'url' => $targetUrl,
                        'action_url' => $targetUrl,
                        'priority' => 'high',
                        'icon' => 'Calendar',
                        'color' => 'rose',
                        'is_read' => false,
                        'created_at' => $proj->event_date?->toIso8601String() ?? $now->toIso8601String(),
                    ];
                }

                // 4. Project Progress / Workflow Update
                $activeProjects = $clientProjects->whereNotIn('status', ['cancelled'])->sortByDesc('updated_at')->take(3);
                foreach ($activeProjects as $proj) {
                    $stepName = match ($proj->workflow_step) {
                        'booking' => 'Booking & DP',
                        'briefing' => 'Briefing & Moodboard',
                        'shooting' => 'Hari Pemotretan',
                        'preview_foto' => 'Preview Foto',
                        'editing_seleksi' => 'Editing Seleksi',
                        'revisi' => 'Review & Revisi',
                        'cetak_album' => 'Cetak Album Kolase',
                        'selesai_kirim', 'selesai' => 'Selesai & Pengiriman',
                        default => $proj->workflow_step ?: 'Dalam Pengerjaan',
                    };

                    $targetUrl = "/client/projects/{$proj->id}";
                    $notifications[] = [
                        'id' => "client_progress_{$proj->id}",
                        'type' => 'project_progress',
                        'category' => 'project',
                        'title' => 'Progress Pengerjaan',
                        'message' => "Project \"{$proj->name}\" saat ini berada pada tahap {$stepName} (Progres: {$proj->progress}%).",
                        'time_ago' => $proj->updated_at ? $proj->updated_at->diffForHumans() : 'Update terbaru',
                        'url' => $targetUrl,
                        'action_url' => $targetUrl,
                        'priority' => 'medium',
                        'icon' => 'CheckCircle2',
                        'color' => 'emerald',
                        'is_read' => false,
                        'created_at' => $proj->updated_at?->toIso8601String() ?? $now->toIso8601String(),
                    ];
                }

                // 5. Invoices & Payments for Client
                $clientInvoices = Invoice::whereIn('project_id', $projectIds)
                    ->orWhere('client_id', $client->id)
                    ->latest()
                    ->limit(3)
                    ->get();

                foreach ($clientInvoices as $inv) {
                    $isPaid = $inv->status === 'paid' || $inv->remaining_amount <= 0;
                    $targetUrl = $inv->project_id ? "/client/projects/{$inv->project_id}#pembayaran" : "/client/dashboard";
                    $notifications[] = [
                        'id' => "client_invoice_{$inv->id}",
                        'type' => 'invoice_status',
                        'category' => 'finance',
                        'title' => $isPaid ? 'Pembayaran Telah Lunas' : 'Tagihan Invoice Tersedia',
                        'message' => $isPaid
                            ? "Invoice {$inv->invoice_number} telah terverifikasi lunas. Terima kasih atas pembayaran Anda."
                            : "Invoice {$inv->invoice_number} memiliki sisa tagihan Rp " . number_format($inv->remaining_amount, 0, ',', '.') . ".",
                        'time_ago' => $inv->updated_at ? $inv->updated_at->diffForHumans() : 'Tersedia',
                        'url' => $targetUrl,
                        'action_url' => $targetUrl,
                        'priority' => $isPaid ? 'low' : 'medium',
                        'icon' => 'Receipt',
                        'color' => $isPaid ? 'emerald' : 'purple',
                        'is_read' => false,
                        'created_at' => $inv->updated_at?->toIso8601String() ?? $now->toIso8601String(),
                    ];
                }
            }
        } else {
            // ── ADMIN & STUDIO STAFF NOTIFICATIONS ──────────────────────────────
            // 1. Files Expired (Hidden from client portal)
            $expiredFiles = FileLink::with('project')
                ->expired()
                ->latest('expires_at')
                ->limit(4)
                ->get();

            foreach ($expiredFiles as $file) {
                $targetUrl = $file->project_id ? "/projects/{$file->project_id}" : "/files";
                $notifications[] = [
                    'id' => "file_expired_{$file->id}",
                    'type' => 'file_expired',
                    'category' => 'files',
                    'title' => 'File Drive Telah Expired',
                    'message' => "Link file \"{$file->name}\" untuk project " . ($file->project?->name ?? 'Studio') . " telah expired dan disembunyikan dari Portal Klien.",
                    'time_ago' => $file->expires_at ? $file->expires_at->diffForHumans() : 'Baru saja',
                    'url' => $targetUrl,
                    'action_url' => $targetUrl,
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
                $targetUrl = $file->project_id ? "/projects/{$file->project_id}" : "/files";
                $notifications[] = [
                    'id' => "file_expiring_{$file->id}",
                    'type' => 'file_expiring',
                    'category' => 'files',
                    'title' => "File Segera Expired (H-{$daysLeft})",
                    'message' => "Link \"{$file->name}\" (" . ($file->project?->name ?? 'Project') . ") akan kedaluwarsa pada " . ($file->expires_at?->format('d M Y') ?? '-') . ".",
                    'time_ago' => "Sisa {$daysLeft} hari",
                    'url' => $targetUrl,
                    'action_url' => $targetUrl,
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
                $targetUrl = "/projects/{$proj->id}";
                $notifications[] = [
                    'id' => "event_upcoming_{$proj->id}",
                    'type' => 'upcoming_event',
                    'category' => 'schedule',
                    'title' => "Jadwal Shoot ({$dayLabel})",
                    'message' => "Project \"{$proj->name}\" (" . ($proj->category?->name ?? 'Pemotretan') . ") dijadwalkan pada " . ($proj->event_date?->format('d M Y') ?? '-') . ($proj->location ? " di {$proj->location}" : '') . ".",
                    'time_ago' => $dayLabel,
                    'url' => $targetUrl,
                    'action_url' => $targetUrl,
                    'priority' => $diffDays <= 1 ? 'high' : 'medium',
                    'icon' => 'Calendar',
                    'color' => 'blue',
                    'is_read' => false,
                    'created_at' => $proj->event_date?->toIso8601String() ?? $now->toIso8601String(),
                ];
            }

            // 4. Upcoming Calendar Schedules (Next 7 Days)
            $upcomingSchedules = ProjectSchedule::with('project')
                ->where('date', '>=', $now->toDateString())
                ->where('date', '<=', $now->copy()->addDays(7)->toDateString())
                ->orderBy('date')
                ->orderBy('start_time')
                ->limit(4)
                ->get();

            foreach ($upcomingSchedules as $sched) {
                $diffDays = $now->diffInDays(Carbon::parse($sched->date), false);
                $dayLabel = $diffDays == 0 ? 'Hari Ini' : ($diffDays == 1 ? 'Besok' : "H-{$diffDays}");
                $timeStr = $sched->start_time ? " (" . substr($sched->start_time, 0, 5) . ")" : '';
                $targetUrl = "/calendar";
                $notifications[] = [
                    'id' => "schedule_upcoming_{$sched->id}",
                    'type' => 'upcoming_schedule',
                    'category' => 'schedule',
                    'title' => "Jadwal Kalender ({$dayLabel})",
                    'message' => "{$sched->title}{$timeStr}" . ($sched->location ? " di {$sched->location}" : '') . ".",
                    'time_ago' => $dayLabel,
                    'url' => $targetUrl,
                    'action_url' => $targetUrl,
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
                $targetUrl = "/projects/{$dl->id}";
                $notifications[] = [
                    'id' => "deadline_upcoming_{$dl->id}",
                    'type' => 'upcoming_deadline',
                    'category' => 'schedule',
                    'title' => "Deadline Project ({$dayLabel})",
                    'message' => "Tenggat waktu project \"{$dl->name}\" jatuh pada " . ($dl->deadline?->format('d M Y') ?? '-') . ".",
                    'time_ago' => $dayLabel,
                    'url' => $targetUrl,
                    'action_url' => $targetUrl,
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
                $targetUrl = $inv->project_id ? "/projects/{$inv->project_id}" : "/finance";
                $notifications[] = [
                    'id' => "invoice_pending_{$inv->id}",
                    'type' => 'invoice_pending',
                    'category' => 'finance',
                    'title' => $isOverdue ? 'Tagihan Jatuh Tempo' : 'Sisa Tagihan Belum Lunas',
                    'message' => "Invoice {$inv->invoice_number} (" . ($inv->client?->name ?? 'Klien') . ") tersisa tagihan Rp " . number_format($inv->remaining_amount, 0, ',', '.') . ".",
                    'time_ago' => $inv->due_date ? $inv->due_date->diffForHumans() : 'Belum lunas',
                    'url' => $targetUrl,
                    'action_url' => $targetUrl,
                    'priority' => $isOverdue ? 'high' : 'low',
                    'icon' => 'Receipt',
                    'color' => $isOverdue ? 'rose' : 'purple',
                    'is_read' => false,
                    'created_at' => $inv->due_date?->toIso8601String() ?? $now->toIso8601String(),
                ];
            }
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

