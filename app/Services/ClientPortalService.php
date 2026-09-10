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
        if ($user?->client_id) {
            $client = Client::find($user->client_id);
        } elseif ($user?->email) {
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
                    'payments' => fn ($q) => $q->with('paymentMethod')->latest('payment_date')->limit(10),
                    'invoices' => fn ($q) => $q->latest()->limit(5),
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
                    'payments' => fn ($q) => $q->with('paymentMethod')->latest('payment_date')->limit(10),
                    'invoices' => fn ($q) => $q->latest()->limit(5),
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
                'payments' => fn ($q) => $q->with('paymentMethod')->latest('payment_date')->limit(10),
                'invoices' => fn ($q) => $q->latest()->limit(5),
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
            ->limit(5)
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
                    'image' => $this->getPackageSampleImage($pkg->name),
                ];
            });

        // 1. Promo Slides from Database (prioritize active project slide if exists, combined with general studio slides)
        $activeProjectId = $activeProject?->id;
        $promoSlides = \App\Models\PromoSlide::active()
            ->where(function ($q) use ($activeProjectId) {
                $q->whereNull('project_id');
                if ($activeProjectId) {
                    $q->orWhere('project_id', $activeProjectId);
                }
            })
            ->orderByRaw('CASE WHEN project_id IS NOT NULL THEN 0 ELSE 1 END')
            ->orderBy('sort_order')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'tag' => $p->tag,
                    'title' => $p->title,
                    'description' => $p->description,
                    'button_text' => $p->button_text,
                    'button_url' => $p->button_url ?: '/form-klien',
                    'image' => $p->image ?: '/images/wedding-couple.jpg',
                    'project_id' => $p->project_id,
                ];
            });

        // 2. Real Portfolios from Database (with fallback to Instagram Posts)
        $realPortfolios = \App\Models\Portfolio::with('category')
            ->active()
            ->withImage()
            ->orderBy('sort_order')
            ->latest('updated_at')
            ->limit(4)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'caption' => $p->caption ?? '',
                    'image' => $p->image_url,
                    'image_url' => $p->image_url,
                    'likes' => (int) $p->likes_count,
                    'comments' => (int) $p->comments_count,
                    'type' => $p->media_type ?: 'photo',
                ];
            });

        // 3. Instagram Posts from Database
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

        $portfoliosList = $realPortfolios->isNotEmpty() ? $realPortfolios : $instagramPosts;

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

        $totalProjects = $client ? Project::where('client_id', $client->id)->count() : Project::count();
        $totalInvoices = $activeProject ? $activeProject->invoices()->count() : ($client ? \App\Models\Invoice::where('client_id', $client->id)->count() : 1);
        $totalPayments = $activeProject ? $activeProject->payments()->count() : 0;

        $fileLinksCollection = ($activeProject && $activeProject->fileLinks && $activeProject->fileLinks->isNotEmpty())
            ? $activeProject->fileLinks
            : \App\Models\FileLink::latest()->limit(3)->get();

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
            'metrics' => [
                'total_projects' => $totalProjects,
                'total_invoices' => $totalInvoices,
                'total_payments' => $totalPayments,
                'event_date' => $activeProject?->event_date?->isoFormat('D MMM YYYY') ?? 'Belum Dijadwalkan',
                'event_category' => $activeProject?->category?->name ?? ($activeProject?->package?->name ?? 'Dokumentasi'),
            ],
            'active_project' => $activeProject ? [
                'id' => $activeProject->id,
                'project_number' => $activeProject->project_number,
                'name' => $activeProject->name,
                'status' => $activeProject->status,
                'status_label' => match ($activeProject->status) {
                    'completed', 'delivered' => 'Selesai',
                    'in_progress', 'editing', 'review' => 'Dalam Proses',
                    'scheduled', 'confirmed' => 'Terkonfirmasi',
                    'cancelled' => 'Dibatalkan',
                    default => 'Dalam Proses',
                },
                'last_updated' => $activeProject->updated_at?->isoFormat('D MMMM YYYY') ?? now()->isoFormat('D MMMM YYYY'),
                'workflow_step' => $activeProject->workflow_step,
                'progress' => (int) $activeProject->progress,
                'event_date' => $activeProject->event_date?->isoFormat('D MMMM YYYY') ?? null,
                'event_date_short' => $activeProject->event_date?->isoFormat('D MMM YYYY') ?? null,
                'event_date_raw' => $activeProject->event_date?->format('Y-m-d') ?? null,
                'location' => $activeProject->location ?: 'Studio Arams Pictures',
                'category_name' => $activeProject->category?->name ?? 'Wedding Photography',
                'package_name' => $activeProject->package?->name ?? 'Custom Package',
                'total_amount' => (float) $activeProject->total_amount,
                'paid_amount' => (float) $activeProject->paid_amount,
                'payment_status' => $activeProject->payment_status,
                'thumbnail' => $activeProject->thumbnail
                    ?: ($activeProject->highlights->where('is_cover', true)->first()?->image_url
                        ?: ($activeProject->highlights->first()?->image_url ?: '/images/wedding-couple.jpg')),
                'invoices_count' => $totalInvoices,
                'payments_count' => $totalPayments,
                'file_links' => $fileLinksCollection->map(fn($f) => [
                    'id' => $f->id,
                    'name' => $f->name,
                    'drive_url' => $f->drive_url ?: '#',
                    'file_type' => $f->file_type,
                    'created_at_formatted' => $f->created_at?->isoFormat('D MMM YYYY') ?? 'Baru saja',
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
                'payments' => $activeProject->payments->map(fn($p) => [
                    'id' => $p->id,
                    'payment_number' => $p->payment_number,
                    'amount' => (float) $p->amount,
                    'payment_date' => $p->payment_date?->isoFormat('D MMMM YYYY'),
                    'payment_method' => $p->paymentMethod?->name ?? 'Transfer Bank',
                    'account_number' => $p->paymentMethod?->account_number,
                    'account_holder' => $p->paymentMethod?->account_holder,
                    'reference_number' => $p->reference_number,
                    'notes' => $p->notes,
                    'proof_file' => $p->proof_file,
                    'status' => $p->status,
                ]),
                'invoices' => $activeProject->invoices->map(fn($inv) => [
                    'id' => $inv->id,
                    'invoice_number' => $inv->invoice_number,
                    'total' => (float) $inv->total,
                    'paid_amount' => (float) $inv->paid_amount,
                    'remaining_amount' => (float) $inv->remaining_amount,
                    'status' => $inv->status,
                    'issue_date' => $inv->issue_date?->isoFormat('D MMMM YYYY'),
                    'due_date' => $inv->due_date?->isoFormat('D MMMM YYYY'),
                ]),
            ] : null,
            'timeline' => $timeline,
            'payment_summary' => $paymentSummary,
            'promo_slides' => $promoSlides,
            'recommended_projects' => $recommendedPackages,
            'recommended_packages' => $recommendedPackages,
            'portfolios' => $portfoliosList,
            'total_portfolios' => \App\Models\Portfolio::active()->count(),
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

        // If client has no projects AND user is not an actual client (e.g. admin previewing), get latest active projects
        $user = $request->user();
        $isActualClient = $user && ($user->client_id || Client::where('email', $user->email)->exists());

        if ($projectsCollection->isEmpty() && !$isActualClient) {
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
                'active_step_desc' => $timelineData['active_step_desc'] ?? null,
                'progress_percentage' => $timelineData['progress_percentage'] ?? 0,
                'timeline_steps' => $timelineData['steps'] ?? [],
                'completed_date' => in_array($p->status, ['completed', 'delivered']) ? ($p->updated_at?->isoFormat('D MMMM YYYY')) : null,
                'estimated_done' => $p->deadline?->isoFormat('D MMMM YYYY') ?? ($p->event_date ? $p->event_date->copy()->addDays(30)->isoFormat('D MMMM YYYY') : null),
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
            'invoices' => fn ($q) => $q->latest(),
            'projectAddons.addon',
            'highlights' => fn ($q) => $q->orderBy('sort_order'),
            'testimonials' => fn ($q) => $q->approved()->latest(),
        ]);

        $coverImage = $project->thumbnail
            ?: $project->highlights->where('is_cover', true)->first()?->image_url
            ?: $project->highlights->first()?->image_url
            ?: $this->getPackageSampleImage($project->package?->name ?? $project->category?->name ?? '');

        if ($coverImage && str_contains($coverImage, 'images.unsplash.com') && str_contains($coverImage, 'w=')) {
            $coverImage = preg_replace('/w=\d+/', 'w=1400', $coverImage);
        }

        $isClientUser = ($project->supervisor_id && $project->supervisor_id === $project->client_id)
            || ($project->supervisor && $project->client && $project->supervisor->name === $project->client->name);
        $supervisorName = (!$isClientUser && $project->supervisor?->name) ? $project->supervisor->name : 'Bima Arams';
        $supervisorAvatar = (!$isClientUser) ? $project->supervisor?->avatar : null;

        $photographerName = $project->photographer?->name;
        if (!$photographerName && $project->notes) {
            if (preg_match('/Photographer:\s*([^|\n\r]+)/i', $project->notes, $matches)) {
                $photographerName = trim($matches[1]);
            }
        }
        $photographerName = $photographerName ?: 'Tim Fotografer Arams';

        $editorName = $project->editor?->name;
        if (!$editorName && $project->notes) {
            if (preg_match('/Editor:\s*([^|\n\r]+)/i', $project->notes, $matches)) {
                $editorName = trim($matches[1]);
            }
        }
        $editorName = $editorName ?: 'Tim Editor Arams';

        $timeline = $this->computeTimeline($project, $supervisorName, $photographerName, $editorName);
        $paymentSummary = $this->computePaymentSummary($project);

        $companySettings = [
            'name' => Setting::get('company_name', 'Arams Pictures'),
            'phone' => Setting::get('company_phone', '0812-3456-7890'),
            'email' => Setting::get('company_email', 'hello@arams.id'),
            'instagram' => Setting::get('company_instagram', '@aramspictures'),
            'address' => Setting::get('company_address', 'Surabaya, Jawa Timur, Indonesia'),
            'website' => Setting::get('company_website', 'www.aramspictures.com'),
        ];

        $notesList = [];
        if ($project->notes) {
            $pattern = '/---\s*\[(.*?)\]\s*(.*?)\s*\(Oleh:\s*(.*?)\)\s*---\n?(.*?)(?=(?:---\s*\[|$))/s';
            if (preg_match_all($pattern, $project->notes, $matches, PREG_SET_ORDER)) {
                $firstDelim = strpos($project->notes, '--- [');
                if ($firstDelim !== false && $firstDelim > 0) {
                    $initialText = trim(substr($project->notes, 0, $firstDelim));
                    if (!empty($initialText)) {
                        $notesList[] = [
                            'id' => 'note-main',
                            'title' => 'Catatan & Briefing Project',
                            'content' => $initialText,
                            'author' => $project->client?->name ?? 'Klien',
                            'role' => 'Briefing Awal',
                            'date' => $project->created_at?->isoFormat('D') ?? now()->isoFormat('D'),
                            'monthYear' => $project->created_at?->isoFormat('MMM YYYY') ?? now()->isoFormat('MMM YYYY'),
                        ];
                    }
                }
                foreach ($matches as $idx => $m) {
                    $rawDate = trim($m[1]);
                    $nTitle = trim($m[2]);
                    $nAuthor = trim($m[3]);
                    $nContent = trim($m[4]);

                    $parsedTime = strtotime(explode(',', $rawDate)[0]);
                    $dateDay = $parsedTime ? date('d', $parsedTime) : now()->isoFormat('D');
                    $dateMonthYear = $parsedTime ? date('M Y', $parsedTime) : now()->isoFormat('MMM YYYY');

                    $notesList[] = [
                        'id' => 'note-added-' . ($idx + 1),
                        'title' => $nTitle ?: 'Catatan Tambahan',
                        'content' => $nContent,
                        'author' => $nAuthor ?: 'Klien',
                        'role' => ($nAuthor === $supervisorName) ? 'Operasional' : 'Klien',
                        'date' => $dateDay,
                        'monthYear' => $dateMonthYear,
                    ];
                }
            } else {
                $notesList[] = [
                    'id' => 'note-main',
                    'title' => 'Catatan & Briefing Project',
                    'content' => $project->notes,
                    'author' => $project->client?->name ?? 'Klien',
                    'role' => 'Briefing',
                    'date' => $project->created_at?->isoFormat('D') ?? now()->isoFormat('D'),
                    'monthYear' => $project->created_at?->isoFormat('MMM YYYY') ?? now()->isoFormat('MMM YYYY'),
                ];
            }
        }

        if ($project->location) {
            $notesList[] = [
                'id' => 'note-venue',
                'title' => 'Konfirmasi Lokasi & Venue',
                'content' => 'Acara berlangsung di ' . $project->location . ($project->event_time ? (' pada pukul ' . $project->event_time) : ''),
                'author' => $supervisorName,
                'role' => 'Operasional',
                'date' => $project->event_date?->isoFormat('D') ?? now()->isoFormat('D'),
                'monthYear' => $project->event_date?->isoFormat('MMM YYYY') ?? now()->isoFormat('MMM YYYY'),
            ];
        }

        $existingReview = $project->testimonials()->latest()->first();
        $projectReview = $existingReview ? [
            'id' => $existingReview->id,
            'client_name' => $existingReview->client_name,
            'package_name' => $existingReview->package_name ?? ($project->package?->name ?? 'Dokumentasi'),
            'rating' => (int) $existingReview->rating,
            'comment' => $existingReview->comment,
            'avatar' => $existingReview->avatar ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            'date' => $existingReview->created_at?->isoFormat('D MMMM YYYY'),
            'updated_at_formatted' => $existingReview->updated_at?->isoFormat('D MMMM YYYY, HH:mm'),
        ] : null;

        $testimonialsList = $projectReview ? [$projectReview] : [];

        $paymentMethodsList = \App\Models\PaymentMethod::where('status', 'active')->get()->map(fn($pm) => [
            'id' => $pm->id,
            'name' => $pm->name,
            'code' => $pm->code,
            'account_number' => $pm->account_number,
            'account_holder' => $pm->account_holder,
            'icon' => $pm->icon,
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
                'updated_at_formatted' => $project->updated_at?->isoFormat('D MMMM YYYY') ?? now()->isoFormat('D MMMM YYYY'),
                'location' => $project->location,
                'notes' => $project->notes,
                'category_name' => $project->category?->name ?? 'Photography',
                'package_name' => $project->package?->name ?? 'Custom Package',
                'total_amount' => (float) $project->total_amount,
                'paid_amount' => (float) $project->paid_amount,
                'payment_status' => $project->payment_status,
                'thumbnail' => $coverImage,
                'photographer' => [
                    'name' => $photographerName,
                    'avatar' => $project->photographer?->avatar,
                ],
                'supervisor' => [
                    'name' => $supervisorName,
                    'avatar' => $supervisorAvatar,
                ],
                'editor' => [
                    'name' => $editorName,
                    'avatar' => $project->editor?->avatar,
                ],
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
                    'payment_number' => $p->payment_number,
                    'amount' => (float) $p->amount,
                    'payment_date' => $p->payment_date?->isoFormat('D MMMM YYYY'),
                    'payment_method' => $p->paymentMethod?->name ?? 'Transfer Bank',
                    'account_number' => $p->paymentMethod?->account_number,
                    'account_holder' => $p->paymentMethod?->account_holder,
                    'reference_number' => $p->reference_number,
                    'notes' => $p->notes,
                    'proof_file' => $p->proof_file,
                    'status' => $p->status,
                ]),
                'invoices' => $project->invoices->map(fn($inv) => [
                    'id' => $inv->id,
                    'invoice_number' => $inv->invoice_number,
                    'total' => (float) $inv->total,
                    'paid_amount' => (float) $inv->paid_amount,
                    'remaining_amount' => (float) $inv->remaining_amount,
                    'status' => $inv->status,
                    'issue_date' => $inv->issue_date?->isoFormat('D MMMM YYYY'),
                    'due_date' => $inv->due_date?->isoFormat('D MMMM YYYY'),
                ]),
                'notes_list' => $notesList,
            ],
            'testimonials' => $testimonialsList,
            'project_review' => $projectReview,
            'timeline' => $timeline,
            'payment_summary' => $paymentSummary,
            'payment_methods' => $paymentMethodsList,
            'company' => $companySettings,
        ];
    }

    /**
     * Compute Timeline steps for the project.
     */
    public function computeTimeline(?Project $project, ?string $supervisorName = null, ?string $photographerName = null, ?string $editorName = null): array
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

        if (!$supervisorName) {
            $isClientUser = ($project->supervisor_id && $project->supervisor_id === $project->client_id)
                || ($project->supervisor && $project->client && $project->supervisor->name === $project->client->name);
            $supervisorName = (!$isClientUser && $project->supervisor?->name) ? $project->supervisor->name : 'Bima Arams';
        }
        if (!$photographerName) {
            $photographerName = $project->photographer?->name;
            if (!$photographerName && $project->notes) {
                if (preg_match('/Photographer:\s*([^|\n\r]+)/i', $project->notes, $matches)) {
                    $photographerName = trim($matches[1]);
                }
            }
            $photographerName = $photographerName ?: 'Tim Fotografer Arams';
        }
        if (!$editorName) {
            $editorName = $project->editor?->name;
            if (!$editorName && $project->notes) {
                if (preg_match('/Editor:\s*([^|\n\r]+)/i', $project->notes, $matches)) {
                    $editorName = trim($matches[1]);
                }
            }
            $editorName = $editorName ?: 'Tim Editor Arams';
        }

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

        $isPhotoshoot = in_array($workflowType, ['photoshoot', 'non_wedding', 'studio', 'portrait']);
        $stepDefinitions = $isPhotoshoot ? $photoshootSteps : $weddingSteps;
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
                'pic' => $this->getStepPic($def['key'], $project, $supervisorName, $photographerName, $editorName),
                'tasks' => $this->getStepTasks($def['key'], $status, $isPhotoshoot),
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

    protected function getStepPic(string $stepKey, Project $project, ?string $supervisorName = null, ?string $photographerName = null, ?string $editorName = null): string
    {
        $supervisor = $supervisorName ?: ($project->supervisor?->name ?? 'Bima Arams');
        $photographer = $photographerName ?: ($project->photographer?->name ?? 'Tim Fotografer Arams');
        $editor = $editorName ?: ($project->editor?->name ?? 'Tim Editor Arams');

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

    protected function getStepTasks(string $stepKey, string $status, bool $isPhotoshoot = false): array
    {
        $isDone = ($status === 'completed');
        $isActive = ($status === 'active');

        if ($isPhotoshoot) {
            return match ($stepKey) {
                'booking' => [
                    ['title' => 'Formulir data sesi foto & preferensi gaya pemotretan terverifikasi', 'completed' => true],
                    ['title' => 'Pembayaran Uang Muka (DP) / Pelunasan terkonfirmasi', 'completed' => true],
                    ['title' => 'Penjadwalan studio, fotografer & waktu pemotretan terkunci', 'completed' => true],
                ],
                'briefing' => [
                    ['title' => 'Diskusi tema visual, wardrobe, kostum & properti khusus', 'completed' => $isDone || $isActive],
                    ['title' => 'Panduan persiapan sesi & arahan kenyamanan subjek / bayi', 'completed' => $isDone],
                    ['title' => 'Finalisasi jadwal kedatangan tim / waktu pemotretan', 'completed' => $isDone],
                ],
                'shooting' => [
                    ['title' => 'Kehadiran tim fotografer spesialis & asisten di lokasi / studio', 'completed' => $isDone || $isActive],
                    ['title' => 'Pelaksanaan sesi pemotretan sesuai tema & moodboard terpilih', 'completed' => $isDone],
                    ['title' => 'Pencadangan (backup) seluruh file RAW foto ke cloud server', 'completed' => $isDone],
                ],
                'editing_seleksi' => [
                    ['title' => 'Kurasi foto terbaik & seleksi foto bersama klien', 'completed' => $isDone || $isActive],
                    ['title' => 'Color grading tone sinematik & fine art retouching khas Arams', 'completed' => $isDone],
                    ['title' => 'Penyusunan hasil editing resolusi tinggi siap cetak', 'completed' => $isDone],
                ],
                'selesai_kirim' => [
                    ['title' => 'Quality check (QC) final hasil foto & dokumen pendukung', 'completed' => $isDone || $isActive],
                    ['title' => 'Pemberian tautan Google Drive / Cloud Album resolusi tinggi (HD)', 'completed' => $isDone],
                    ['title' => 'Serah terima hasil karya & penutupan project', 'completed' => $isDone],
                ],
                default => [
                    ['title' => 'Persiapan tahapan pengerjaan', 'completed' => $isDone || $isActive],
                    ['title' => 'Pelaksanaan & koordinasi tim', 'completed' => $isDone],
                ],
            };
        }

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
        if (str_contains($lower, 'newborn') || str_contains($lower, 'baby') || str_contains($lower, 'bayi')) {
            return 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&auto=format&fit=crop&q=80';
        }
        if (str_contains($lower, 'maternity') || str_contains($lower, 'hamil')) {
            return 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1200&auto=format&fit=crop&q=80';
        }
        if (str_contains($lower, 'prewedding')) {
            return 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=80';
        }
        if (str_contains($lower, 'exclusive') || str_contains($lower, 'royal')) {
            return 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop&q=80';
        }
        if (str_contains($lower, 'engagement') || str_contains($lower, 'lamaran')) {
            return 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&auto=format&fit=crop&q=80';
        }
        if (str_contains($lower, 'birthday') || str_contains($lower, 'ulang tahun') || str_contains($lower, 'family') || str_contains($lower, 'keluarga')) {
            return 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&auto=format&fit=crop&q=80';
        }
        if (str_contains($lower, 'corporate') || str_contains($lower, 'commercial') || str_contains($lower, 'product')) {
            return 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80';
        }

        return 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&auto=format&fit=crop&q=80';
    }

    /**
     * Get portfolio gallery data for /client/portfolio.
     */
    public function getPortfolioData(Request $request): array
    {
        [$client] = $this->resolvePortalContext($request);

        // 1. Fetch active portfolio items from database
        $databasePortfolios = \App\Models\Portfolio::with('category')
            ->active()
            ->withImage()
            ->orderBy('sort_order')
            ->latest('updated_at')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'category_id' => $p->portfolio_category_id,
                    'category_slug' => $p->category?->slug ?? 'general',
                    'category' => $p->category?->name ?? 'General',
                    'title' => $p->title,
                    'caption' => $p->caption ?? '',
                    'image' => $p->image_url,
                    'image_url' => $p->image_url,
                    'likes' => (int) $p->likes_count,
                    'comments' => (int) $p->comments_count,
                    'post_url' => null,
                    'type' => $p->media_type ?: 'photo',
                    'is_cover' => false,
                ];
            });

        // 2. Fetch active categories and FILTER OUT any category with 0 images
        $categoriesWithImages = \App\Models\PortfolioCategory::active()
            ->withCount(['activePortfolios'])
            ->orderBy('sort_order')
            ->get()
            ->filter(function ($cat) {
                return $cat->active_portfolios_count > 0;
            })
            ->values()
            ->map(function ($cat) {
                return [
                    'id' => $cat->slug,
                    'category_id' => $cat->id,
                    'label' => $cat->name,
                    'name' => $cat->name,
                    'count' => $cat->active_portfolios_count,
                ];
            });

        $instagramPosts = \App\Models\InstagramPost::active()->latest()->get()->map(function ($p) {
            return [
                'id' => $p->id,
                'image' => $p->image_url,
                'image_url' => $p->image_url,
                'caption' => $p->caption ?? '',
                'likes' => (int) $p->likes_count,
                'comments' => (int) $p->comments_count,
                'post_url' => $p->post_url ?: 'https://instagram.com/aramspictures',
                'type' => $p->media_type ?: 'image',
                'category' => 'Instagram Showcase',
            ];
        });

        // Also fetch project highlights from database for rich multi-category gallery
        $projectHighlights = \App\Models\ProjectHighlight::with(['project.category'])
            ->latest()
            ->limit(24)
            ->get()
            ->map(function ($h) {
                $categoryName = $h->project?->category?->name ?? 'Wedding';
                return [
                    'id' => $h->id,
                    'title' => $h->title ?? ($h->project?->name ? ('Project ' . $h->project->name) : 'Karya Arams Pictures'),
                    'caption' => $h->caption ?: ($h->project?->category?->name ?? 'Dokumentasi Terbaik'),
                    'image' => $h->image_url,
                    'image_url' => $h->image_url,
                    'category' => $categoryName,
                    'category_slug' => \Illuminate\Support\Str::slug($categoryName),
                    'likes' => rand(30, 250),
                    'comments' => rand(5, 45),
                    'post_url' => null,
                    'type' => $h->media_type ?: 'image',
                    'project_id' => $h->project_id,
                    'is_cover' => (bool) $h->is_cover,
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
            'portfolios' => $databasePortfolios,
            'categories' => $categoriesWithImages,
            'instagram_posts' => $instagramPosts,
            'highlights' => $projectHighlights,
            'client' => $client ? [
                'id' => $client->id,
                'name' => $client->name,
                'bride_name' => $client->bride_name,
                'groom_name' => $client->groom_name,
            ] : null,
            'company' => $companySettings,
        ];
    }
}
