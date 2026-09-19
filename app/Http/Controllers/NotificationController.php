<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * Get dynamic smart notifications for studio operation and client portal.
     */
    public function getNotifications(Request $request): JsonResponse
    {
        $data = $this->notificationService->getNotificationsForRequest($request);

        return response()->json($data);
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
