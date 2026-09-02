<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Package;
use App\Models\Project;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ClientPortalService
{
    public function __construct(
        protected InstagramFeedService $instagramFeedService
    ) {}

    /**
     * Resolve the client and active project for the portal session.
     */
    public function resolvePortalContext(Request $request): array
    {
        $user = $request->user();

        // Retrieve linked client, or fallback to first client with project for preview/admins
        $client = null;
        if ($user->client_id) {
            $client = Client::find($user->client_id);
        } elseif ($user->email) {
            $client = Client::where('email', $user->email)->first();
        }

        if (!$client) {
            $client = Client::whereHas('projects')->first() ?? Client::first();
        }

        // Retrieve active / latest project
        $activeProject = null;

        // If specific project requested via query param (e.g. from admin preview)
        if ($projectId = ($request->input('project_id') ?? $request->input('project'))) {
            $specificProject = Project::where('id', $projectId)
                ->with([
                    'category',
                    'package',
                    'client',
                    'fileLinks' => fn ($q) => $q->active()->latest()->limit(5),
                    'payments' => fn ($q) => $q->latest('payment_date')->limit(5),
                ])
                ->first();
            if ($specificProject) {
                $activeProject = $specificProject;
                $client = $specificProject->client ?? $client;
            }
        }

        if (!$activeProject && $client) {
            $activeProject = Project::where('client_id', $client->id)
                ->with([
                    'category',
                    'package',
                    'fileLinks' => fn ($q) => $q->active()->latest()->limit(5),
                    'payments' => fn ($q) => $q->latest('payment_date')->limit(5),
                ])
                ->latest('event_date')
                ->first();
        }

        if (!$activeProject) {
            $activeProject = Project::with([
                'category',
                'package',
                'fileLinks' => fn ($q) => $q->active()->latest()->limit(5),
                'payments' => fn ($q) => $q->latest('payment_date')->limit(5),
            ])->latest()->first();
        }

        return [$client, $activeProject];
    }

    /**
     * Get dashboard data for client portal.
     */
    public function getDashboardData(Request $request): array
    {
        [$client, $activeProject] = $this->resolvePortalContext($request);

        $timeline = $this->computeTimeline($activeProject);
        $paymentSummary = $this->computePaymentSummary($activeProject);

        $recommendedPackages = Package::where('status', 'active')
            ->with('category')
            ->orderBy('sort_order')
            ->limit(5)
            ->get()
            ->map(function ($pkg) {
                return [
                    'id' => $pkg->id,
                    'name' => $pkg->name,
                    'category_name' => $pkg->category?->name ?? 'Layanan Foto',
                    'base_price' => (float) $pkg->base_price,
                    'duration_hours' => $pkg->duration_hours,
                    'description' => $pkg->description,
                    'image' => $pkg->thumbnail ?? $this->getPackageSampleImage($pkg->name),
                ];
            });

        $instagramData = $this->instagramFeedService->getFeed(6);
        $instagramHandle = $instagramData['username'] ?? 'aramspictures';
        $instagramUrl = $instagramData['url'] ?? 'https://www.instagram.com/aramspictures/';
        $portfolios = $instagramData['items'] ?? [];

        $testimonials = [
            [
                'id' => '1',
                'client_name' => 'Raka & Dinda',
                'package_name' => 'Paket Prewedding',
                'rating' => 5,
                'comment' => 'Hasil fotonya luar biasa, melebihi ekspektasi! Tim Arams Pictures sangat profesional dan friendly. Prosesnya juga mudah dan terorganisir.',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            ],
            [
                'id' => '2',
                'client_name' => 'Kevin & Sarah',
                'package_name' => 'Paket Wedding Exclusive',
                'rating' => 5,
                'comment' => 'Pilihan terbaik untuk dokumentasi pernikahan kami. Mulai dari sesi prewedding hingga hari H, semuanya tertata rapi dan hasilnya aesthetic sekali.',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            ],
            [
                'id' => '3',
                'client_name' => 'Dimas & Tiara',
                'package_name' => 'Paket Engagement',
                'rating' => 5,
                'comment' => 'Portal kliennya sangat membantu untuk tracking progress foto kami. Akses Google Drive langsung dari dashboard bikin gampang download file.',
                'avatar' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
            ],
        ];

        $companySettings = [
            'name' => Setting::get('company_name', 'Arams Pictures'),
            'tagline' => Setting::get('company_tagline', 'Timeless Wedding & Portrait Photography'),
            'phone' => Setting::get('company_phone', '0812-3456-7890'),
            'email' => Setting::get('company_email', 'hello@arams.id'),
            'instagram' => '@' . ltrim(Setting::get('company_instagram', $instagramHandle), '@'),
            'instagram_url' => $instagramUrl,
            'address' => Setting::get('company_address', 'Surabaya, Jawa Timur, Indonesia'),
            'website' => Setting::get('company_website', 'www.aramspictures.com'),
            'gdrive_url' => Setting::get('company_gdrive_url', 'https://drive.google.com'),
        ];

        return [
            'client' => $client ? [
                'id' => $client->id,
                'name' => $client->name,
                'email' => $client->email,
                'phone' => $client->phone,
                'city' => $client->city,
                'instagram' => $client->instagram,
                'bride_name' => $client->bride_name,
                'groom_name' => $client->groom_name,
                'bride_nickname' => $client->bride_nickname,
                'groom_nickname' => $client->groom_nickname,
            ] : null,
            'active_project' => $activeProject ? [
                'id' => $activeProject->id,
                'project_number' => $activeProject->project_number,
                'name' => $activeProject->name,
                'status' => $activeProject->status,
                'workflow_step' => $activeProject->workflow_step,
                'progress' => (int) $activeProject->progress,
                'event_date' => $activeProject->event_date?->isoFormat('D MMMM YYYY') ?? null,
                'event_date_raw' => $activeProject->event_date?->format('Y-m-d') ?? null,
                'location' => $activeProject->location,
                'category_name' => $activeProject->category?->name ?? 'Wedding Photography',
                'package_name' => $activeProject->package?->name ?? 'Custom Package',
                'total_amount' => (float) $activeProject->total_amount,
                'paid_amount' => (float) $activeProject->paid_amount,
                'payment_status' => $activeProject->payment_status,
                'file_links' => $activeProject->fileLinks->map(fn($f) => [
                    'id' => $f->id,
                    'name' => $f->name,
                    'drive_url' => $f->drive_url,
                    'file_type' => $f->file_type,
                    'expires_at' => $f->expires_at?->isoFormat('D MMMM YYYY'),
                    'is_expired' => $f->isExpired(),
                    'days_remaining' => $f->daysRemaining(),
                ]),
            ] : null,
            'timeline' => $timeline,
            'payment_summary' => $paymentSummary,
            'recommended_packages' => $recommendedPackages,
            'portfolios' => $portfolios,
            'testimonials' => $testimonials,
            'company' => $companySettings,
        ];
    }

    /**
     * Get client's projects list.
     */
    public function getProjectsData(Request $request): array
    {
        [$client] = $this->resolvePortalContext($request);

        $projectsQuery = Project::query();
        if ($client) {
            $projectsQuery->where('client_id', $client->id);
        }

        $projects = $projectsQuery->with(['category', 'package'])
            ->latest('event_date')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'project_number' => $p->project_number,
                    'name' => $p->name,
                    'category_name' => $p->category?->name ?? 'Photography',
                    'package_name' => $p->package?->name ?? 'Custom Package',
                    'status' => $p->status,
                    'workflow_step' => $p->workflow_step,
                    'progress' => (int) $p->progress,
                    'event_date' => $p->event_date?->isoFormat('D MMMM YYYY') ?? null,
                    'deadline' => $p->deadline?->isoFormat('D MMMM YYYY') ?? null,
                    'location' => $p->location,
                    'total_amount' => (float) $p->total_amount,
                    'paid_amount' => (float) $p->paid_amount,
                    'payment_status' => $p->payment_status,
                    'thumbnail' => $p->thumbnail ?? 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
                ];
            });

        return [
            'projects' => $projects,
            'client' => $client ? [
                'id' => $client->id,
                'name' => $client->name,
                'bride_name' => $client->bride_name,
                'groom_name' => $client->groom_name,
            ] : null,
        ];
    }

    /**
     * Get detailed project info for client view.
     */
    public function getProjectDetailData(Project $project): array
    {
        $project->load([
            'client',
            'category',
            'package',
            'photographer:id,name,avatar',
            'editor:id,name,avatar',
            'fileLinks' => fn ($q) => $q->active()->latest(),
            'payments.paymentMethod',
            'projectAddons.addon',
        ]);

        $timeline = $this->computeTimeline($project);
        $paymentSummary = $this->computePaymentSummary($project);

        $companySettings = [
            'name' => Setting::get('company_name', 'Arams Pictures'),
            'phone' => Setting::get('company_phone', '0812-3456-7890'),
            'email' => Setting::get('company_email', 'hello@arams.id'),
            'instagram' => Setting::get('company_instagram', '@aramspictures'),
            'address' => Setting::get('company_address', 'Surabaya, Jawa Timur, Indonesia'),
            'website' => Setting::get('company_website', 'www.aramspictures.com'),
        ];

        return [
            'project' => [
                'id' => $project->id,
                'project_number' => $project->project_number,
                'name' => $project->name,
                'status' => $project->status,
                'workflow_step' => $project->workflow_step,
                'progress' => (int) $project->progress,
                'event_date' => $project->event_date?->isoFormat('dddd, D MMMM YYYY'),
                'event_date_raw' => $project->event_date?->format('Y-m-d'),
                'event_time' => $project->event_time,
                'deadline' => $project->deadline?->isoFormat('D MMMM YYYY'),
                'location' => $project->location,
                'notes' => $project->notes,
                'category_name' => $project->category?->name ?? 'Photography',
                'package_name' => $project->package?->name ?? 'Custom Package',
                'total_amount' => (float) $project->total_amount,
                'paid_amount' => (float) $project->paid_amount,
                'payment_status' => $project->payment_status,
                'photographer' => $project->photographer ? [
                    'name' => $project->photographer->name,
                    'avatar' => $project->photographer->avatar,
                ] : null,
                'editor' => $project->editor ? [
                    'name' => $project->editor->name,
                    'avatar' => $project->editor->avatar,
                ] : null,
                'addons' => $project->projectAddons->map(fn($pa) => [
                    'name' => $pa->addon?->name ?? $pa->custom_name ?? 'Add-on Item',
                    'qty' => $pa->qty,
                    'unit' => $pa->unit,
                    'price' => (float) $pa->unit_price,
                    'total' => (float) $pa->total_price,
                ]),
                'file_links' => $project->fileLinks->map(fn($f) => [
                    'id' => $f->id,
                    'name' => $f->name,
                    'drive_url' => $f->drive_url,
                    'file_type' => $f->file_type,
                    'expires_at' => $f->expires_at?->isoFormat('D MMMM YYYY'),
                    'is_expired' => $f->isExpired(),
                    'days_remaining' => $f->daysRemaining(),
                ]),
                'payments' => $project->payments->map(fn($p) => [
                    'id' => $p->id,
                    'amount' => (float) $p->amount,
                    'payment_date' => $p->payment_date?->isoFormat('D MMMM YYYY'),
                    'payment_method' => $p->paymentMethod?->name ?? 'Transfer Bank',
                    'reference_number' => $p->reference_number,
                    'status' => $p->status,
                ]),
            ],
            'timeline' => $timeline,
            'payment_summary' => $paymentSummary,
            'company' => $companySettings,
        ];
    }

    /**
     * Compute Timeline steps for the project.
     */
    public function computeTimeline(?Project $project): array
    {
        if (!$project) {
            return [
                'current_step' => 1,
                'progress_percentage' => 0,
                'steps' => [],
            ];
        }

        $workflowType = $project->category?->workflow_type ?? 'wedding';

        $weddingSteps = [
            ['step' => 1, 'key' => 'booking', 'name' => 'Booking & DP', 'desc' => 'Tanda jadi & penguncian tanggal'],
            ['step' => 2, 'key' => 'briefing', 'name' => 'Briefing & Moodboard', 'desc' => 'Diskusi konsep, rundown & attire'],
            ['step' => 3, 'key' => 'shooting', 'name' => 'Hari Pemotretan', 'desc' => 'Liputan foto & video pada Hari-H'],
            ['step' => 4, 'key' => 'preview_foto', 'name' => 'Preview Foto', 'desc' => 'Galeri online untuk seleksi foto'],
            ['step' => 5, 'key' => 'editing_seleksi', 'name' => 'Editing Seleksi', 'desc' => 'Pewarnaan & retouch foto pilihan'],
            ['step' => 6, 'key' => 'revisi', 'name' => 'Review & Revisi', 'desc' => 'Pengecekan hasil & minor revision'],
            ['step' => 7, 'key' => 'cetak_album', 'name' => 'Cetak Album', 'desc' => 'Produksi cetak & album eksklusif'],
            ['step' => 8, 'key' => 'selesai_kirim', 'name' => 'Selesai & Pengiriman', 'desc' => 'Serah terima paket & cloud drive'],
        ];

        $photoshootSteps = [
            ['step' => 1, 'key' => 'booking', 'name' => 'Booking & DP', 'desc' => 'Tanda jadi & kunci jadwal studio'],
            ['step' => 2, 'key' => 'briefing', 'name' => 'Briefing Konsep', 'desc' => 'Penentuan tema, kostum & wardrobe'],
            ['step' => 3, 'key' => 'shooting', 'name' => 'Hari Sesi Foto', 'desc' => 'Sesi pemotretan di studio/lokasi'],
            ['step' => 4, 'key' => 'editing_seleksi', 'name' => 'Editing & Retouch', 'desc' => 'Color grading & retouching foto'],
            ['step' => 5, 'key' => 'selesai_kirim', 'name' => 'Selesai & Kirim File', 'desc' => 'Pengiriman file HD & link GDrive'],
        ];

        $stepDefinitions = ($workflowType === 'photoshoot') ? $photoshootSteps : $weddingSteps;
        $totalSteps = count($stepDefinitions);

        $currentStepKey = $project->workflow_step ?? 'booking';
        $currentStepIndex = 0;

        foreach ($stepDefinitions as $idx => $step) {
            if ($step['key'] === $currentStepKey) {
                $currentStepIndex = $idx;
                break;
            }
        }

        $steps = [];
        foreach ($stepDefinitions as $idx => $def) {
            $status = 'pending';
            if ($idx < $currentStepIndex) {
                $status = 'completed';
            } elseif ($idx === $currentStepIndex) {
                $status = 'active';
            }

            $steps[] = [
                'step' => $def['step'],
                'key' => $def['key'],
                'name' => $def['name'],
                'desc' => $def['desc'],
                'status' => $status,
                'date' => $this->getStepDate($project, $def['key']),
                'icon' => $this->getStepIcon($def['key']),
            ];
        }

        $progressPct = (int) round((($currentStepIndex + 1) / $totalSteps) * 100);

        return [
            'current_step' => $currentStepIndex + 1,
            'total_steps' => $totalSteps,
            'current_step_name' => $stepDefinitions[$currentStepIndex]['name'] ?? 'Proses Pemotretan',
            'progress_percentage' => $progressPct,
            'steps' => $steps,
        ];
    }

    /**
     * Compute Payment Summary for the project.
     */
    public function computePaymentSummary(?Project $project): array
    {
        if (!$project) {
            return [
                'total_amount' => 0,
                'paid_amount' => 0,
                'remaining_amount' => 0,
                'paid_percentage' => 0,
                'payment_status' => 'pending',
                'payment_status_label' => 'Belum Lunas',
            ];
        }

        $total = (float) $project->total_amount;
        $paid = (float) $project->paid_amount;
        $remaining = max(0, $total - $paid);
        $pct = $total > 0 ? round(($paid / $total) * 100) : 0;

        $statusLabel = match ($project->payment_status) {
            'paid' => 'Lunas',
            'partial' => 'Sebagian / DP',
            default => 'Belum Lunas',
        };

        return [
            'total_amount' => $total,
            'paid_amount' => $paid,
            'remaining_amount' => $remaining,
            'paid_percentage' => $pct,
            'payment_status' => $project->payment_status,
            'payment_status_label' => $statusLabel,
        ];
    }

    protected function getStepDate(Project $project, string $stepKey): ?string
    {
        return match ($stepKey) {
            'booking' => $project->created_at?->isoFormat('D MMM YYYY'),
            'shooting' => $project->event_date?->isoFormat('D MMM YYYY'),
            'selesai_kirim' => $project->deadline?->isoFormat('D MMM YYYY'),
            default => null,
        };
    }

    protected function getStepIcon(string $stepKey): string
    {
        return match ($stepKey) {
            'booking' => 'CalendarCheck',
            'briefing' => 'MessageSquare',
            'shooting' => 'Camera',
            'preview_foto' => 'Eye',
            'editing_seleksi' => 'Sliders',
            'revisi' => 'RefreshCw',
            'cetak_album' => 'BookOpen',
            'selesai_kirim' => 'CheckCircle2',
            default => 'Circle',
        };
    }

    protected function getPackageSampleImage(string $packageName): string
    {
        $lower = strtolower($packageName);
        if (str_contains($lower, 'prewedding')) {
            return 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80';
        }
        if (str_contains($lower, 'exclusive') || str_contains($lower, 'royal')) {
            return 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80';
        }
        if (str_contains($lower, 'engagement') || str_contains($lower, 'lamaran')) {
            return 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80';
        }
        return 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&auto=format&fit=crop&q=80';
    }
}
