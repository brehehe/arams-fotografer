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
                    'highlights' => fn ($q) => $q->orderBy('sort_order')->limit(8),
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
                    'highlights' => fn ($q) => $q->orderBy('sort_order')->limit(8),
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
                'highlights' => fn ($q) => $q->orderBy('sort_order')->limit(8),
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
            ->limit(4)
            ->get()
            ->map(function ($pkg) {
                return [
                    'id' => $pkg->id,
                    'name' => $pkg->name,
                    'title' => $pkg->name,
                    'category_name' => $pkg->category?->name ?? 'Layanan Foto',
                    'base_price' => (float) $pkg->base_price,
                    'price' => 'Rp ' . number_format($pkg->base_price, 0, ',', '.'),
                    'duration_hours' => $pkg->duration_hours,
                    'description' => $pkg->description,
                    'desc' => $pkg->description ?: ($pkg->category?->name ?? 'Dokumentasi Terbaik'),
                    'image' => $pkg->thumbnail ?? $this->getPackageSampleImage($pkg->name),
                ];
            });

        // 1. Promo Slides from Database
        $promoSlides = \App\Models\PromoSlide::active()->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'tag' => $p->tag,
                'title' => $p->title,
                'description' => $p->description,
                'button_text' => $p->button_text,
                'button_url' => $p->button_url ?: '/form-klien',
                'image' => $p->image ?: '/images/wedding-couple.jpg',
            ];
        });

        // 2. Instagram Posts from Database
        $instagramPosts = \App\Models\InstagramPost::active()->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'image' => $p->image_url,
                'caption' => $p->caption ?? '',
                'likes' => $p->likes_count,
                'comments' => $p->comments_count,
                'post_url' => $p->post_url ?: 'https://instagram.com/aramspictures',
                'type' => $p->media_type,
            ];
        });

        // 3. Testimonials from Database
        $testimonials = \App\Models\Testimonial::approved()->get()->map(function ($t) {
            return [
                'id' => $t->id,
                'client_name' => $t->client_name,
                'package_name' => $t->package_name ?? 'Dokumentasi',
                'rating' => (int) $t->rating,
                'comment' => $t->comment,
                'avatar' => $t->avatar ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            ];
        });

        $companySettings = [
            'name' => Setting::get('company_name', 'Arams Pictures'),
            'tagline' => Setting::get('company_tagline', 'Timeless Wedding & Portrait Photography'),
            'phone' => Setting::get('company_phone', '0812-3456-7890'),
            'email' => Setting::get('company_email', 'hello@arams.id'),
            'instagram' => '@' . ltrim(Setting::get('company_instagram', 'aramspictures'), '@'),
            'instagram_url' => 'https://www.instagram.com/' . ltrim(Setting::get('company_instagram', 'aramspictures'), '@') . '/',
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
                'highlights' => ($activeProject->highlights && $activeProject->highlights->isNotEmpty())
                    ? $activeProject->highlights->map(fn($h) => [
                        'id' => $h->id,
                        'title' => $h->title,
                        'caption' => $h->caption,
                        'image_url' => $h->image_url,
                        'is_cover' => (bool) $h->is_cover,
                    ])
                    : \App\Models\ProjectHighlight::orderByDesc('is_cover')->latest()->limit(4)->get()->map(fn($h) => [
                        'id' => $h->id,
                        'title' => $h->title,
                        'caption' => $h->caption,
                        'image_url' => $h->image_url,
                        'is_cover' => (bool) $h->is_cover,
                    ]),
            ] : null,
            'timeline' => $timeline,
            'payment_summary' => $paymentSummary,
            'promo_slides' => $promoSlides,
            'recommended_projects' => $recommendedPackages,
            'recommended_packages' => $recommendedPackages,
            'portfolios' => $instagramPosts,
            'instagram_posts' => $instagramPosts,
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

        $projectsCollection = $projectsQuery->with(['category', 'package', 'highlights'])
            ->latest('event_date')
            ->get();

        // If client has no projects (or admin previewing), get latest active projects
        if ($projectsCollection->isEmpty()) {
            $projectsCollection = Project::with(['category', 'package', 'highlights'])
                ->latest('event_date')
                ->limit(6)
                ->get();
        }

        $projects = $projectsCollection->map(function ($p) {
            $timelineData = $this->computeTimeline($p);
            $currentStepNum = $timelineData['current_step'] ?? 1;
            $totalStepsNum = $timelineData['total_steps'] ?? 8;
            $stepLabel = $timelineData['current_step_name'] ?? 'Proses Pengerjaan';

            $coverImage = $p->thumbnail
                ?: $p->highlights->where('is_cover', true)->first()?->image_url
                ?: $p->highlights->first()?->image_url
                ?: '/images/wedding-couple.jpg';

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
                'thumbnail' => $coverImage,
                'current_step' => $currentStepNum,
                'total_steps' => $totalStepsNum,
                'step_label' => $stepLabel,
                'completed_date' => in_array($p->status, ['completed', 'delivered']) ? ($p->updated_at?->isoFormat('D MMMM YYYY')) : null,
                'estimated_done' => $p->deadline?->isoFormat('D MMMM YYYY') ?? null,
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
            'supervisor:id,name,avatar',
            'fileLinks' => fn ($q) => $q->active()->latest(),
            'payments.paymentMethod',
            'projectAddons.addon',
            'highlights' => fn ($q) => $q->orderBy('sort_order'),
            'testimonials' => fn ($q) => $q->approved()->latest(),
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

        $notesList = array_values(array_filter([
            $project->notes ? [
                'id' => 'note-main',
                'title' => 'Catatan & Briefing Project',
                'content' => $project->notes,
                'author' => $project->client?->name ?? 'Klien',
                'role' => 'Briefing',
                'date' => $project->created_at?->isoFormat('D') ?? '01',
                'monthYear' => $project->created_at?->isoFormat('MMM YYYY') ?? '2026',
            ] : null,
            $project->location ? [
                'id' => 'note-venue',
                'title' => 'Konfirmasi Lokasi & Venue',
                'content' => 'Acara berlangsung di ' . $project->location . ($project->event_time ? (' pada pukul ' . $project->event_time) : ''),
                'author' => $project->supervisor?->name ?? 'Tim Arams',
                'role' => 'Operasional',
                'date' => $project->event_date?->isoFormat('D') ?? '12',
                'monthYear' => $project->event_date?->isoFormat('MMM YYYY') ?? '2026',
            ] : null,
        ]));

        $testimonialsList = $project->testimonials->isNotEmpty()
            ? $project->testimonials->map(fn($t) => [
                'id' => $t->id,
                'client_name' => $t->client_name,
                'package_name' => $t->package_name ?? 'Dokumentasi',
                'rating' => (int) $t->rating,
                'comment' => $t->comment,
                'avatar' => $t->avatar ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                'date' => $t->created_at?->isoFormat('D MMMM YYYY'),
            ])
            : \App\Models\Testimonial::approved()->latest()->limit(5)->get()->map(fn($t) => [
                'id' => $t->id,
                'client_name' => $t->client_name,
                'package_name' => $t->package_name ?? 'Dokumentasi',
                'rating' => (int) $t->rating,
                'comment' => $t->comment,
                'avatar' => $t->avatar ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                'date' => $t->created_at?->isoFormat('D MMMM YYYY'),
            ]);

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
                'supervisor' => $project->supervisor ? [
                    'name' => $project->supervisor->name,
                    'avatar' => $project->supervisor->avatar,
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
                    'date_label' => $f->created_at ? ('Dibagikan pada ' . $f->created_at->isoFormat('D MMM YYYY')) : null,
                ]),
                'highlights' => $project->highlights->map(fn($h) => [
                    'id' => $h->id,
                    'title' => $h->title ?? 'Highlight Foto',
                    'caption' => $h->caption ?? '',
                    'image_url' => $h->image_url,
                    'media_type' => $h->media_type,
                    'is_cover' => (bool) $h->is_cover,
                ]),
                'payments' => $project->payments->map(fn($p) => [
                    'id' => $p->id,
                    'amount' => (float) $p->amount,
                    'payment_date' => $p->payment_date?->isoFormat('D MMMM YYYY'),
                    'payment_method' => $p->paymentMethod?->name ?? 'Transfer Bank',
                    'reference_number' => $p->reference_number,
                    'status' => $p->status,
                ]),
                'notes_list' => $notesList,
            ],
            'testimonials' => $testimonialsList,
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
                'total_steps' => 8,
                'current_step_name' => 'Mulai Perjalanan',
                'active_step_title' => 'Mulai Perjalanan',
                'active_step_desc' => 'Proyek Anda sedang kami persiapkan.',
                'progress_percentage' => 0,
                'steps' => [],
            ];
        }

        $workflowType = $project->category?->workflow_type ?? 'wedding';

        $weddingSteps = [
            ['step' => 1, 'key' => 'booking', 'name' => 'Booking & DP', 'desc' => 'Tanda jadi & penguncian jadwal tanggal acara'],
            ['step' => 2, 'key' => 'briefing', 'name' => 'Briefing & Moodboard', 'desc' => 'Diskusi konsep, rundown, moodboard visual & teknis liputan'],
            ['step' => 3, 'key' => 'shooting', 'name' => 'Hari Pemotretan', 'desc' => 'Liputan sesi foto & video pada Hari-H acara'],
            ['step' => 4, 'key' => 'preview_foto', 'name' => 'Preview Foto', 'desc' => 'Galeri online untuk seleksi foto terbaik bersama klien'],
            ['step' => 5, 'key' => 'editing_seleksi', 'name' => 'Editing Seleksi', 'desc' => 'Proses color grading eksklusif & retouching foto pilihan'],
            ['step' => 6, 'key' => 'revisi', 'name' => 'Review & Revisi', 'desc' => 'Pengecekan hasil karya oleh klien & penyesuaian minor'],
            ['step' => 7, 'key' => 'cetak_album', 'name' => 'Cetak Album', 'desc' => 'Produksi cetak lab premium, cetak kanvas & album kolase'],
            ['step' => 8, 'key' => 'selesai_kirim', 'name' => 'Selesai & Pengiriman', 'desc' => 'Serah terima paket fisik & pengiriman link arsip cloud drive'],
        ];

        $photoshootSteps = [
            ['step' => 1, 'key' => 'booking', 'name' => 'Booking & DP', 'desc' => 'Tanda jadi & kunci jadwal pemotretan studio'],
            ['step' => 2, 'key' => 'briefing', 'name' => 'Briefing Konsep', 'desc' => 'Penentuan tema, kostum, wardrobe & properti'],
            ['step' => 3, 'key' => 'shooting', 'name' => 'Hari Sesi Foto', 'desc' => 'Sesi pemotretan di studio/lokasi outdoor pilihan'],
            ['step' => 4, 'key' => 'editing_seleksi', 'name' => 'Editing & Retouch', 'desc' => 'Color grading & retouching foto pilihan klien'],
            ['step' => 5, 'key' => 'selesai_kirim', 'name' => 'Selesai & Kirim File', 'desc' => 'Pengiriman file resolusi tinggi & tautan Google Drive'],
        ];

        $stepDefinitions = ($workflowType === 'photoshoot') ? $photoshootSteps : $weddingSteps;
        $totalSteps = count($stepDefinitions);

        // Normalize current step key
        $rawStep = strtolower(trim($project->workflow_step ?? 'booking'));
        $isCompletedProject = ($project->status === 'completed' || $rawStep === 'selesai' || $rawStep === 'final_delivery' || $rawStep === 'final delivery' || $rawStep === 'selesai & pengiriman');

        $currentStepIndex = 0;
        if ($isCompletedProject) {
            $currentStepIndex = $totalSteps - 1;
        } else {
            foreach ($stepDefinitions as $idx => $step) {
                $stepNameLower = strtolower($step['name']);
                $stepKeyLower = strtolower($step['key']);
                if ($rawStep === $stepKeyLower || str_contains($rawStep, $stepKeyLower) || str_contains($stepNameLower, $rawStep)) {
                    $currentStepIndex = $idx;
                    break;
                }
            }
        }

        $steps = [];
        foreach ($stepDefinitions as $idx => $def) {
            $status = 'pending';
            if ($isCompletedProject) {
                $status = 'completed';
            } elseif ($idx < $currentStepIndex) {
                $status = 'completed';
            } elseif ($idx === $currentStepIndex) {
                $status = 'active';
            }

            $statusLabel = match ($status) {
                'completed' => 'Selesai',
                'active' => 'Sedang Diproses',
                default => 'Menunggu',
            };

            $dateFormatted = $this->getStepDate($project, $def['key'], $idx);

            $steps[] = [
                'step' => $def['step'],
                'key' => $def['key'],
                'name' => $def['name'],
                'title' => $def['name'],
                'desc' => $def['desc'],
                'description' => $def['desc'],
                'status' => $status,
                'status_label' => $statusLabel,
                'date' => $dateFormatted,
                'icon' => $this->getStepIcon($def['key']),
                'pic' => $this->getStepPic($def['key'], $project),
                'tasks' => $this->getStepTasks($def['key'], $status),
            ];
        }

        $activeDef = $stepDefinitions[$currentStepIndex] ?? $stepDefinitions[0];
        $progressPct = $isCompletedProject
            ? 100
            : (int) round((($currentStepIndex + 1) / $totalSteps) * 100);

        return [
            'current_step' => $currentStepIndex + 1,
            'total_steps' => $totalSteps,
            'current_step_name' => $activeDef['name'],
            'active_step_title' => $activeDef['name'],
            'active_step_desc' => $activeDef['desc'],
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

    protected function getStepDate(Project $project, string $stepKey, int $idx = 0): ?string
    {
        $created = $project->created_at ?: now()->subDays(7);
        $event = $project->event_date ?: now()->addDays(30);
        $deadline = $project->deadline ?: ($event ? $event->copy()->addDays(30) : now()->addDays(60));

        return match ($stepKey) {
            'booking' => $created->isoFormat('D MMM YYYY'),
            'briefing' => $created->copy()->addDays(3)->isoFormat('D MMM YYYY'),
            'shooting' => $event->isoFormat('D MMM YYYY'),
            'preview_foto' => $event->copy()->addDays(3)->isoFormat('D MMM YYYY'),
            'editing_seleksi' => $event->copy()->addDays(14)->isoFormat('D MMM YYYY'),
            'revisi' => $event->copy()->addDays(21)->isoFormat('D MMM YYYY'),
            'cetak_album' => $deadline->copy()->subDays(7)->isoFormat('D MMM YYYY'),
            'selesai_kirim' => $deadline->isoFormat('D MMM YYYY'),
            default => $created->copy()->addDays($idx * 5)->isoFormat('D MMM YYYY'),
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

    protected function getStepPic(string $stepKey, Project $project): string
    {
        $supervisor = $project->supervisor?->name ?? 'Bima Arams';
        $photographer = $project->photographer?->name ?? 'Tim Fotografer Arams';
        $editor = $project->editor?->name ?? 'Tim Editor Arams';

        return match ($stepKey) {
            'booking' => "Client Relations & Supervisor ($supervisor)",
            'briefing' => "Creative Director & Supervisor ($supervisor)",
            'shooting' => "Lead Photographer ($photographer)",
            'preview_foto' => "Studio Data Officer & PIC ($supervisor)",
            'editing_seleksi' => "Lead Editor ($editor)",
            'revisi' => "Quality Control & Editor ($editor)",
            'cetak_album' => 'Divisi Percetakan & Lab Foto Arams',
            'selesai_kirim' => "Logistik & Dispatch ($supervisor)",
            default => 'Tim Operasional Arams',
        };
    }

    protected function getStepTasks(string $stepKey, string $status): array
    {
        $isDone = ($status === 'completed');
        $isActive = ($status === 'active');

        return match ($stepKey) {
            'booking' => [
                ['title' => 'Formulir data klien & detail acara terverifikasi', 'completed' => true],
                ['title' => 'Pembayaran Uang Muka (DP) / Pelunasan terkonfirmasi', 'completed' => true],
                ['title' => 'Penjadwalan kru fotografer & tanggal acara terkunci', 'completed' => true],
            ],
            'briefing' => [
                ['title' => 'Diskusi konsep visual & moodboard gaya pemotretan', 'completed' => $isDone || $isActive],
                ['title' => 'Penyusunan rundown & jadwal liputan detail Hari-H', 'completed' => $isDone],
                ['title' => 'Koordinasi attire, busana, lokasi & dekorasi', 'completed' => $isDone],
            ],
            'shooting' => [
                ['title' => 'Kehadiran tim fotografer & videografer di lokasi', 'completed' => $isDone || $isActive],
                ['title' => 'Sesi pemotretan prosesi akad / pemberkatan & resepsi', 'completed' => $isDone],
                ['title' => 'Pencadangan (backup) seluruh file RAW foto ke cloud server', 'completed' => $isDone],
            ],
            'preview_foto' => [
                ['title' => 'Kurasi & penyortiran awal foto mentah oleh studio', 'completed' => $isDone || $isActive],
                ['title' => 'Upload galeri online preview untuk dipilih oleh klien', 'completed' => $isDone],
                ['title' => 'Klien memilih foto-foto favorit untuk diproses edit', 'completed' => $isDone],
            ],
            'editing_seleksi' => [
                ['title' => 'Color grading tone sinematik khas Arams Pictures', 'completed' => $isDone || $isActive],
                ['title' => 'Retouching kulit & keindahan estetika foto pilihan', 'completed' => $isDone],
                ['title' => 'Penyuntingan video teaser 1 menit & video sinematik', 'completed' => $isDone],
            ],
            'revisi' => [
                ['title' => 'Klien meninjau hasil editing foto & teaser video', 'completed' => $isDone || $isActive],
                ['title' => 'Pemberian masukan atau permintaan revisi minor', 'completed' => $isDone],
                ['title' => 'Persetujuan akhir (final approval) dari klien', 'completed' => $isDone],
            ],
            'cetak_album' => [
                ['title' => 'Penyusunan tata letak (layouting) album kolase premium', 'completed' => $isDone || $isActive],
                ['title' => 'Proses cetak lab profesional & pembingkaian kanvas', 'completed' => $isDone],
                ['title' => 'Pemeriksaan kualitas cetak (QC) & pengemasan box eksklusif', 'completed' => $isDone],
            ],
            'selesai_kirim' => [
                ['title' => 'Pengemasan album fisik & flashdisk cetak custom', 'completed' => $isDone || $isActive],
                ['title' => 'Pemberian link arsip Google Drive kualitas tinggi (HD)', 'completed' => $isDone],
                ['title' => 'Serah terima paket fisik ke alamat klien & penyelesaian', 'completed' => $isDone],
            ],
            default => [
                ['title' => 'Persiapan tahapan pengerjaan', 'completed' => $isDone || $isActive],
                ['title' => 'Pelaksanaan & koordinasi tim', 'completed' => $isDone],
            ],
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
