<?php

namespace App\Services;

use App\Models\Project;
use App\Models\WeddingOrganizer;
use Illuminate\Http\Request;

class WeddingOrganizerService
{
    /**
     * Get paginated wedding organizers with filters, KPIs, and cities.
     */
    public function getWeddingOrganizersPaginated(Request $request): array
    {
        $search = $request->input('search');
        $status = $request->input('status');
        $tier = $request->input('tier');
        $city = $request->input('city');
        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');

        $query = WeddingOrganizer::query()
            ->withCount('projects');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('pic_name', 'ilike', "%{$search}%")
                    ->orWhere('phone', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%")
                    ->orWhere('instagram', 'ilike', "%{$search}%")
                    ->orWhere('city', 'ilike', "%{$search}%");
            });
        }

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($tier && $tier !== 'all') {
            $query->where('tier', $tier);
        }

        if ($city && $city !== 'all') {
            $query->where('city', $city);
        }

        $validSorts = ['name', 'pic_name', 'city', 'commission_rate', 'created_at', 'projects_count'];
        $sortField = in_array($sort, $validSorts) ? $sort : 'created_at';
        $sortOrder = strtolower($order) === 'asc' ? 'asc' : 'desc';

        $weddingOrganizers = $query->orderBy($sortField, $sortOrder)->paginate(10)->withQueryString();

        $stats = [
            'total' => WeddingOrganizer::count(),
            'active_count' => WeddingOrganizer::where('status', 'active')->count(),
            'partner_count' => WeddingOrganizer::where('status', 'partner')->count(),
            'lead_count' => WeddingOrganizer::where('status', 'lead')->count(),
            'total_projects_count' => Project::whereNotNull('wedding_organizer_id')->count(),
        ];

        $cities = WeddingOrganizer::whereNotNull('city')->where('city', '!=', '')->distinct()->pluck('city');

        return [
            'weddingOrganizers' => $weddingOrganizers,
            'stats' => $stats,
            'cities' => $cities,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? 'all',
                'tier' => $tier ?? 'all',
                'city' => $city ?? 'all',
                'sort' => $sortField,
                'order' => $sortOrder,
            ],
        ];
    }

    /**
     * Create wedding organizer with activity logging.
     */
    public function createWeddingOrganizer(array $data, $user = null): WeddingOrganizer
    {
        $wo = WeddingOrganizer::create($data);

        if ($user) {
            activity()
                ->performedOn($wo)
                ->causedBy($user)
                ->log('Menambahkan data Wedding Organizer: ' . $wo->name);
        }

        return $wo;
    }

    /**
     * Update wedding organizer with activity logging.
     */
    public function updateWeddingOrganizer(WeddingOrganizer $weddingOrganizer, array $data, $user = null): WeddingOrganizer
    {
        $weddingOrganizer->update($data);

        if ($user) {
            activity()
                ->performedOn($weddingOrganizer)
                ->causedBy($user)
                ->log('Memperbarui data Wedding Organizer: ' . $weddingOrganizer->name);
        }

        return $weddingOrganizer;
    }

    /**
     * Delete wedding organizer with activity logging.
     */
    public function deleteWeddingOrganizer(WeddingOrganizer $weddingOrganizer, $user = null): void
    {
        $name = $weddingOrganizer->name;
        $weddingOrganizer->delete();

        if ($user) {
            activity()
                ->causedBy($user)
                ->log("Menghapus data Wedding Organizer: {$name}");
        }
    }
}
