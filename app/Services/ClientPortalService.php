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

        // Retrieve linked client
        $client = null;
        if ($user?->client_id) {
            $client = Client::find($user->client_id);
        } elseif ($user?->email) {
            $client = Client::where('email', $user->email)->first();
            if ($client && $user && !$user->client_id) {
                $user->updateQuietly(['client_id' => $client->id]);
            }
        }

        $isClientUser = $user && ($user->client_id || $user->hasRole('Client') || $user->hasRole('client'));

        // If admin/super-admin/staff without a linked client, allow previewing first available client
        if (!$client && !$isClientUser) {
            $client = Client::whereHas('projects')->first() ?? Client::first();
        }

        // Retrieve active / latest project
        $activeProject = null;

        // If specific project requested via query param (e.g. from admin preview or direct link)
        if ($projectId = ($request->input('project_id') ?? $request->input('project'))) {
            $specificProjectQuery = Project::where('id', $projectId)
                ->with([
                    'category',
                    'package',
                    'client',
                    'fileLinks' => fn ($q) => $q->active()->latest()->limit(10),
                    'payments' => fn ($q) => $q->with('paymentMethod')->latest('payment_date')->limit(10),
                    'invoices' => fn ($q) => $q->latest()->limit(10),
                    'highlights' => fn ($q) => $q->orderBy('sort_order')->limit(12),
                    'projectAddons.addon',
                ]);

            if ($isClientUser && $client) {
                $specificProjectQuery->where('client_id', $client->id);
            }

            $specificProject = $specificProjectQuery->first();
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
                    'fileLinks' => fn ($q) => $q->active()->latest()->limit(10),
                    'payments' => fn ($q) => $q->with('paymentMethod')->latest('payment_date')->limit(10),
                    'invoices' => fn ($q) => $q->latest()->limit(10),
                    'highlights' => fn ($q) => $q->orderBy('sort_order')->limit(12),
                    'projectAddons.addon',
                ])
                ->latest('event_date')
                ->first();
        }

        // For non-clients (e.g. admin preview mode), fallback to latest project if none exists
        if (!$activeProject && !$isClientUser) {
            $activeProject = Project::with([
                'category',
                'package',
                'fileLinks' => fn ($q) => $q->active()->latest()->limit(10),
                'payments' => fn ($q) => $q->with('paymentMethod')->latest('payment_date')->limit(10),
                'invoices' => fn ($q) => $q->latest()->limit(10),
                'highlights' => fn ($q) => $q->orderBy('sort_order')->limit(12),
                'projectAddons.addon',
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

        $showRecommended = Setting::get('portal_show_recommended_packages', '1') !== '0';
        if (! $showRecommended) {
            $recommendedPackages = collect([]);
        } else {
            $rawRecommendedIds = Setting::get('portal_recommended_packages');
            $recommendedIds = [];
            if ($rawRecommendedIds) {
                if (is_array($rawRecommendedIds)) {
                    $recommendedIds = $rawRecommendedIds;
                } elseif (str_starts_with($rawRecommendedIds, '[')) {
                    $recommendedIds = json_decode($rawRecommendedIds, true) ?: [];
                } else {
                    $recommendedIds = array_filter(array_map('trim', explode(',', $rawRecommendedIds)));
                }
            }

            if (! empty($recommendedIds)) {
                $packagesQuery = Package::whereIn('id', $recommendedIds)
                    ->where('status', 'active')
                    ->with('category')
                    ->get()
                    ->keyBy('id');

                $recommendedPackages = collect($recommendedIds)
                    ->map(fn ($id) => $packagesQuery->get($id))
                    ->filter()
                    ->values()
                    ->map(function ($pkg) {
                        return [
                            'id' => $pkg->id,
                            'name' => $pkg->name,
                            'title' => $pkg->name,
                            'category_name' => $pkg->category?->name ?? 'Layanan Foto',
                            'category_color' => $pkg->category?->color ?? '#3C0E0E',
                            'base_price' => (float) $pkg->base_price,
                            'price' => 'Rp ' . number_format($pkg->base_price, 0, ',', '.'),
                            'duration_hours' => $pkg->duration_hours,
                            'description' => $pkg->description,
                            'desc' => $pkg->description ?: ($pkg->category?->name ?? 'Dokumentasi Terbaik'),
                            'image' => $pkg->category?->image ? asset($pkg->category->image) : $this->getPackageSampleImage($pkg->name),
                        ];
                    });
            } else {
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
                            'category_color' => $pkg->category?->color ?? '#3C0E0E',
                            'base_price' => (float) $pkg->base_price,
                            'price' => 'Rp ' . number_format($pkg->base_price, 0, ',', '.'),
                            'duration_hours' => $pkg->duration_hours,
                            'description' => $pkg->description,
                            'desc' => $pkg->description ?: ($pkg->category?->name ?? 'Dokumentasi Terbaik'),
                            'image' => $pkg->category?->image ? asset($pkg->category->image) : $this->getPackageSampleImage($pkg->name),
                        ];
                    });
            }
        }

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
                    'video_url' => $p->video_url,
                    'youtube_id' => $p->youtube_id,
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

        // 3. Testimonials from Database (Respects portal_show_testimonials and approved/Show status)
        $showTestimonials = Setting::get('portal_show_testimonials', '1') !== '0';
        $testimonials = $showTestimonials ? \App\Models\Testimonial::approved()->get()->map(function ($t) {
            return [
                'id' => $t->id,
                'client_name' => $t->client_name,
                'package_name' => $t->package_name ?? 'Dokumentasi',
                'rating' => (int) $t->rating,
                'comment' => $t->comment,
                'avatar' => $t->avatar ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            ];
        }) : collect([]);

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

        $totalProjects = $client ? Project::where('client_id', $client->id)->count() : 0;
        $totalInvoices = $client ? \App\Models\Invoice::where('client_id', $client->id)->count() : ($activeProject ? $activeProject->invoices()->count() : 0);
        $totalPayments = $client ? \App\Models\Payment::whereHas('project', fn($q) => $q->where('client_id', $client->id))->count() : ($activeProject ? $activeProject->payments()->count() : 0);

        $fileLinksCollection = ($activeProject && $activeProject->fileLinks)
            ? $activeProject->fileLinks
            : collect();

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
                'package' => $activeProject->package ? [
                    'id' => $activeProject->package->id,
                    'name' => $activeProject->package->name,
                    'description' => $activeProject->package->description,
                    'base_price' => (float) $activeProject->package->base_price,
                    'duration_hours' => $activeProject->package->duration_hours,
                    'included_services' => $activeProject->package->included_services ?? [],
                    'included_deliverables' => $activeProject->package->included_deliverables ?? [],
                ] : null,
                'addons' => $activeProject->projectAddons ? $activeProject->projectAddons->map(fn($pa) => [
                    'name' => $pa->addon?->name ?? $pa->custom_name ?? 'Add-on Item',
                    'qty' => $pa->qty,
                    'unit' => $pa->unit,
                    'price' => (float) $pa->unit_price,
                    'total' => (float) $pa->total_price,
                ]) : [],
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
                    : [],
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
                'invoices' => $activeProject->invoices->sortBy('created_at')->values()->map(fn($inv) => [
                    'id' => $inv->id,
                    'invoice_number' => $inv->invoice_number,
                    'total' => (float) $inv->total,
                    'paid_amount' => (float) $inv->paid_amount,
                    'remaining_amount' => (float) $inv->remaining_amount,
                    'status' => $inv->status,
                    'notes' => $inv->notes,
                    'issue_date' => $inv->issue_date?->isoFormat('D MMMM YYYY'),
                    'due_date' => $inv->due_date?->isoFormat('D MMMM YYYY'),
                    'invoice_url' => route('projects.invoice', ['project' => $activeProject->id, 'invoice_id' => $inv->id]),
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
            'portal_settings' => [
                'show_recommended_packages' => $showRecommended,
                'recommended_packages_title' => Setting::get('portal_recommended_packages_title', 'Rekomendasi Paket Untuk Anda'),
                'recommended_packages_subtitle' => Setting::get('portal_recommended_packages_subtitle', 'Pilihan paket menarik lainnya yang mungkin Anda sukai.'),
                'show_testimonials' => $showTestimonials,
            ],
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
        } else {
            $projectsQuery->whereRaw('1 = 0');
        }

        $projectsCollection = $projectsQuery->with(['category', 'package', 'highlights'])
            ->latest('event_date')
            ->get();

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

                    $role = 'Klien';
                    $authorDisplay = $nAuthor ?: 'Klien';

                    if (str_contains($nAuthor, ' - ')) {
                        [$aName, $aRole] = explode(' - ', $nAuthor, 2);
                        $authorDisplay = trim($aName);
                        $role = trim($aRole);
                    } elseif ($nAuthor === $supervisorName || str_contains(strtolower($nAuthor), 'admin') || str_contains(strtolower($nAuthor), 'studio') || str_contains(strtolower($nAuthor), 'operasional')) {
                        $role = 'Tim Studio';
                    }

                    $notesList[] = [
                        'id' => 'note-added-' . ($idx + 1),
                        'title' => $nTitle ?: 'Catatan Tambahan',
                        'content' => $nContent,
                        'author' => $authorDisplay,
                        'role' => $role,
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
                'package' => $project->package ? [
                    'id' => $project->package->id,
                    'name' => $project->package->name,
                    'description' => $project->package->description,
                    'base_price' => (float) $project->package->base_price,
                    'duration_hours' => $project->package->duration_hours,
                    'included_services' => $project->package->included_services ?? [],
                    'included_deliverables' => $project->package->included_deliverables ?? [],
                ] : null,
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
                'invoices' => $project->invoices->sortBy('created_at')->values()->map(fn($inv) => [
                    'id' => $inv->id,
                    'invoice_number' => $inv->invoice_number,
                    'total' => (float) $inv->total,
                    'paid_amount' => (float) $inv->paid_amount,
                    'remaining_amount' => (float) $inv->remaining_amount,
                    'status' => $inv->status,
                    'notes' => $inv->notes,
                    'issue_date' => $inv->issue_date?->isoFormat('D MMMM YYYY'),
                    'due_date' => $inv->due_date?->isoFormat('D MMMM YYYY'),
                    'invoice_url' => route('projects.invoice', ['project' => $project->id, 'invoice_id' => $inv->id]),
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
                'total_steps' => 5,
                'current_step_name' => 'Mulai Perjalanan',
                'active_step_title' => 'Mulai Perjalanan',
                'active_step_desc' => 'Proyek Anda sedang kami persiapkan.',
                'progress_percentage' => 0,
                'steps' => [],
            ];
        }

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

        // 1. Resolve master workflow definitions
        $workflowDefs = \App\Http\Controllers\MasterData\WorkflowController::getWorkflowDefinitions();

        // 2. Resolve matching workflow for this project
        $category = $project->category;
        $wfType = strtolower($category?->workflow_type ?? '');
        $catName = strtolower($category?->name ?? '');
        $pkgName = strtolower($project->package?->name ?? '');
        $projName = strtolower($project->name ?? '');
        $combined = "{$catName} {$pkgName} {$projName}";

        if (!empty($project->custom_timeline) && is_array($project->custom_timeline) && count($project->custom_timeline) > 0) {
            $stepDefinitions = array_map(function ($s, $idx) {
                return [
                    'step' => $s['step'] ?? $s['num'] ?? ($idx + 1),
                    'key' => strtolower(str_replace(' ', '_', $s['name'] ?? "step_{$idx}")),
                    'name' => $s['name'] ?? "Tahap " . ($idx + 1),
                    'desc' => $s['desc'] ?? $s['activity'] ?? $s['description'] ?? 'Tahapan alur kerja project.',
                ];
            }, $project->custom_timeline, array_keys($project->custom_timeline));
        } else {
            $selectedWorkflow = null;
            if ($wfType === 'non_wedding' || $wfType === 'photoshoot') {
                $selectedWorkflow = collect($workflowDefs)->firstWhere('type', 'non_wedding');
            } elseif ($wfType === 'custom' || $wfType === 'bundling') {
                $selectedWorkflow = collect($workflowDefs)->firstWhere('type', 'custom');
            } elseif ($wfType === 'wedding') {
                $selectedWorkflow = collect($workflowDefs)->firstWhere('type', 'wedding');
            }

            if (!$selectedWorkflow) {
                if (
                    str_contains($combined, 'bundle') || str_contains($combined, 'bundling') ||
                    str_contains($combined, 'custom') || str_contains($combined, 'journey') ||
                    str_contains($combined, 'all-in') || str_contains($combined, 'all in')
                ) {
                    $selectedWorkflow = collect($workflowDefs)->firstWhere('type', 'custom');
                } elseif (
                    str_contains($combined, 'prewed') || str_contains($combined, 'engagement') || str_contains($combined, 'lamaran') ||
                    str_contains($combined, 'event') || str_contains($combined, 'komunitas') || str_contains($combined, 'portrait') ||
                    str_contains($combined, 'graduation') || str_contains($combined, 'wisuda') || str_contains($combined, 'photo only') ||
                    str_contains($combined, 'video only') || str_contains($combined, 'photoshoot') || str_contains($combined, 'studio') ||
                    str_contains($combined, 'maternity') || str_contains($combined, 'aqiqah') || str_contains($combined, 'dokumentasi')
                ) {
                    $selectedWorkflow = collect($workflowDefs)->firstWhere('type', 'non_wedding');
                } else {
                    $selectedWorkflow = collect($workflowDefs)->firstWhere('type', 'wedding') ?? ($workflowDefs[0] ?? null);
                }
            }

            $rawSteps = $selectedWorkflow['steps'] ?? [];
            if (empty($rawSteps)) {
                $rawSteps = ($workflowDefs[0]['steps'] ?? []);
            }

            $stepDefinitions = array_map(function ($s, $idx) {
                return [
                    'step' => $s['num'] ?? ($idx + 1),
                    'key' => strtolower(str_replace(' ', '_', $s['name'] ?? "step_{$idx}")),
                    'name' => $s['name'] ?? "Tahap " . ($idx + 1),
                    'desc' => $s['activity'] ?? $s['description'] ?? 'Tahapan alur kerja project.',
                ];
            }, $rawSteps, array_keys($rawSteps));
        }

        $totalSteps = count($stepDefinitions);
        if ($totalSteps === 0) {
            $totalSteps = 5;
        }

        // 3. Determine current step index
        $rawStep = strtolower(trim($project->workflow_step ?? ''));
        $isCompletedProject = (
            $project->status === 'completed' ||
            str_contains($rawStep, 'selesai') ||
            str_contains($rawStep, 'final') ||
            (int) ($project->progress ?? 0) >= 100
        );

        $currentStepIndex = -1;
        if ($isCompletedProject) {
            $currentStepIndex = $totalSteps - 1;
        } elseif ($rawStep !== '') {
            // A. Exact or contains match
            foreach ($stepDefinitions as $idx => $step) {
                $stepNameLower = strtolower($step['name']);
                if ($stepNameLower === $rawStep || str_contains($stepNameLower, $rawStep) || str_contains($rawStep, $stepNameLower)) {
                    $currentStepIndex = $idx;
                    break;
                }
            }

            // B. Keyword semantic mapping
            if ($currentStepIndex === -1) {
                foreach ($stepDefinitions as $idx => $step) {
                    $sName = strtolower($step['name']);
                    if (
                        (str_contains($rawStep, 'cull') && (str_contains($sName, 'cull') || str_contains($sName, 'edit'))) ||
                        (str_contains($rawStep, 'edit') && (str_contains($sName, 'edit') || str_contains($sName, 'cull') || str_contains($sName, 'retouch'))) ||
                        (str_contains($rawStep, 'sneak') && (str_contains($sName, 'sneak') || str_contains($sName, 'preview'))) ||
                        (str_contains($rawStep, 'preview') && (str_contains($sName, 'preview') || str_contains($sName, 'sneak'))) ||
                        (str_contains($rawStep, 'shoot') && (str_contains($sName, 'shoot') || str_contains($sName, 'hari'))) ||
                        (str_contains($rawStep, 'hari h') && (str_contains($sName, 'hari') || str_contains($sName, 'shoot'))) ||
                        (str_contains($rawStep, 'brief') && str_contains($sName, 'brief')) ||
                        (str_contains($rawStep, 'tm') && (str_contains($sName, 'tm') || str_contains($sName, 'meeting'))) ||
                        (str_contains($rawStep, 'book') && str_contains($sName, 'book')) ||
                        (str_contains($rawStep, 'revis') && (str_contains($sName, 'revis') || str_contains($sName, 'review'))) ||
                        (str_contains($rawStep, 'review') && (str_contains($sName, 'review') || str_contains($sName, 'revis'))) ||
                        (str_contains($rawStep, 'cetak') && (str_contains($sName, 'cetak') || str_contains($sName, 'album') || str_contains($sName, 'book'))) ||
                        (str_contains($rawStep, 'album') && (str_contains($sName, 'album') || str_contains($sName, 'cetak'))) ||
                        (str_contains($rawStep, 'kirim') && (str_contains($sName, 'kirim') || str_contains($sName, 'deliver'))) ||
                        (str_contains($rawStep, 'deliver') && (str_contains($sName, 'deliver') || str_contains($sName, 'kirim')))
                    ) {
                        $currentStepIndex = $idx;
                        break;
                    }
                }
            }
        }

        // C. Fallback based on project status and progress
        if ($currentStepIndex === -1) {
            if ($project->status === 'editing') {
                $editIdx = collect($stepDefinitions)->search(fn ($s) => str_contains(strtolower($s['name']), 'edit') || str_contains(strtolower($s['name']), 'cull'));
                $currentStepIndex = ($editIdx !== false) ? $editIdx : min(2, $totalSteps - 1);
            } elseif ($project->status === 'in_progress') {
                $shootIdx = collect($stepDefinitions)->search(fn ($s) => str_contains(strtolower($s['name']), 'hari') || str_contains(strtolower($s['name']), 'shoot'));
                $currentStepIndex = ($shootIdx !== false) ? $shootIdx : min(1, $totalSteps - 1);
            } elseif ($project->progress && $project->progress > 0) {
                $currentStepIndex = max(0, min($totalSteps - 1, (int) round(($project->progress / 100) * ($totalSteps - 1))));
            } else {
                $currentStepIndex = 0;
            }
        }

        $isPhotoshoot = in_array($wfType, ['photoshoot', 'non_wedding', 'studio', 'portrait']);

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

            $stepKey = $def['key'] ?? "step_{$idx}";
            $dateFormatted = $this->getStepDate($project, $stepKey, $idx, $totalSteps);
            $icon = $this->getStepIcon($stepKey, $def['name']);
            $pic = $this->getStepPic($stepKey, $project, $supervisorName, $photographerName, $editorName, $def['name']);
            $tasks = $this->getStepTasks($stepKey, $status, $isPhotoshoot, $def['name'], $def['desc']);

            $lowerDefName = strtolower($def['name']);
            $stepFiles = ($project && $project->fileLinks) ? $project->fileLinks->filter(function ($f) use ($lowerDefName) {
                if ($f->is_hidden) return false;
                $lowerName = strtolower($f->name ?? '');
                return str_contains($lowerName, "[tahap: {$lowerDefName}]") ||
                       str_contains($lowerName, "[tahap:{$lowerDefName}]") ||
                       str_contains($lowerName, $lowerDefName);
            })->map(fn($f) => [
                'id' => $f->id,
                'name' => preg_replace('/^\[Tahap:[^\]]+\]\s*/i', '', $f->name ?? 'File Dokumentasi'),
                'drive_url' => $f->drive_url,
                'file_type' => $f->file_type,
            ])->values()->all() : [];

            $steps[] = [
                'step' => $def['step'],
                'key' => $stepKey,
                'name' => $def['name'],
                'title' => $def['name'],
                'desc' => $def['desc'],
                'description' => $def['desc'],
                'status' => $status,
                'status_label' => $statusLabel,
                'date' => $dateFormatted,
                'icon' => $icon,
                'pic' => $pic,
                'tasks' => $tasks,
                'files' => $stepFiles,
            ];
        }

        $activeDef = $stepDefinitions[$currentStepIndex] ?? ($stepDefinitions[0] ?? ['name' => 'Dalam Proses', 'desc' => '']);
        $progressPct = $isCompletedProject
            ? 100
            : ($project->progress !== null ? (int) $project->progress : (int) round((($currentStepIndex + 1) / $totalSteps) * 100));

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

    protected function getStepDate(Project $project, string $stepKey, int $idx = 0, int $totalSteps = 5): ?string
    {
        $created = $project->created_at ?: now()->subDays(7);
        $event = $project->event_date ?: now()->addDays(30);
        $deadline = $project->deadline ?: ($event ? $event->copy()->addDays(30) : now()->addDays(60));

        if ($idx === 0) {
            return $created->isoFormat('D MMM YYYY');
        }
        if ($idx === $totalSteps - 1) {
            return $deadline->isoFormat('D MMM YYYY');
        }
        if ($idx === 1) {
            return $created->copy()->addDays(3)->isoFormat('D MMM YYYY');
        }
        if ($idx === 2) {
            return $event->isoFormat('D MMM YYYY');
        }

        $daysAfterEvent = ($idx - 2) * 7;
        return $event->copy()->addDays($daysAfterEvent)->isoFormat('D MMM YYYY');
    }

    protected function getStepIcon(string $stepKey, string $stepName = ''): string
    {
        $name = strtolower($stepName . ' ' . $stepKey);
        if (str_contains($name, 'book') || str_contains($name, 'dp')) {
            return 'CalendarCheck';
        }
        if (str_contains($name, 'brief') || str_contains($name, 'tm') || str_contains($name, 'konsep')) {
            return 'MessageSquare';
        }
        if (str_contains($name, 'hari') || str_contains($name, 'shoot') || str_contains($name, 'foto')) {
            return 'Camera';
        }
        if (str_contains($name, 'sneak') || str_contains($name, 'preview')) {
            return 'Eye';
        }
        if (str_contains($name, 'edit') || str_contains($name, 'cull') || str_contains($name, 'color') || str_contains($name, 'retouch')) {
            return 'Sliders';
        }
        if (str_contains($name, 'revis') || str_contains($name, 'review')) {
            return 'RefreshCw';
        }
        if (str_contains($name, 'cetak') || str_contains($name, 'album') || str_contains($name, 'box')) {
            return 'BookOpen';
        }
        if (str_contains($name, 'selesai') || str_contains($name, 'final') || str_contains($name, 'kirim') || str_contains($name, 'deliver')) {
            return 'CheckCircle2';
        }
        return 'Circle';
    }

    protected function getStepPic(string $stepKey, Project $project, ?string $supervisorName = null, ?string $photographerName = null, ?string $editorName = null, string $stepName = ''): string
    {
        $supervisor = $supervisorName ?: ($project->supervisor?->name ?? 'Bima Arams');
        $photographer = $photographerName ?: ($project->photographer?->name ?? 'Tim Fotografer Arams');
        $editor = $editorName ?: ($project->editor?->name ?? 'Tim Editor Arams');

        $name = strtolower($stepName . ' ' . $stepKey);
        if (str_contains($name, 'edit') || str_contains($name, 'cull') || str_contains($name, 'color') || str_contains($name, 'retouch')) {
            return "Lead Editor ($editor)";
        }
        if (str_contains($name, 'shoot') || str_contains($name, 'foto') || str_contains($name, 'hari')) {
            return "Lead Photographer ($photographer)";
        }
        if (str_contains($name, 'cetak') || str_contains($name, 'album') || str_contains($name, 'box')) {
            return 'Divisi Percetakan & Lab Foto Arams';
        }
        if (str_contains($name, 'kirim') || str_contains($name, 'final') || str_contains($name, 'selesai')) {
            return "Logistik & Dispatch ($supervisor)";
        }
        return "Client Relations & Supervisor ($supervisor)";
    }

    protected function getStepTasks(string $stepKey, string $status, bool $isPhotoshoot = false, string $stepName = '', string $stepDesc = ''): array
    {
        $isDone = ($status === 'completed');
        $isActive = ($status === 'active');
        $name = strtolower($stepName . ' ' . $stepKey);

        if (str_contains($name, 'book') || str_contains($name, 'dp')) {
            return [
                ['title' => 'Formulir data sesi & preferensi pemotretan terverifikasi', 'completed' => true],
                ['title' => 'Pembayaran Uang Muka (DP) / Pelunasan terkonfirmasi', 'completed' => true],
                ['title' => 'Penjadwalan kru fotografer & tanggal pemotretan terkunci', 'completed' => true],
            ];
        }
        if (str_contains($name, 'brief') || str_contains($name, 'tm') || str_contains($name, 'konsep')) {
            return [
                ['title' => 'Diskusi tema visual, wardrobe, rundown & moodboard konsep', 'completed' => $isDone || $isActive],
                ['title' => 'Panduan persiapan sesi & briefing teknis bersama tim', 'completed' => $isDone],
                ['title' => 'Konfirmasi lokasi shooting dan perizinan terkait', 'completed' => $isDone],
            ];
        }
        if (str_contains($name, 'hari') || str_contains($name, 'shoot') || str_contains($name, 'foto')) {
            return [
                ['title' => 'Kehadiran tim fotografer & videografer di lokasi acara / studio', 'completed' => $isDone || $isActive],
                ['title' => 'Pelaksanaan sesi pemotretan sesuai durasi paket & shot list', 'completed' => $isDone],
                ['title' => 'Pencadangan (backup) ganda seluruh file RAW foto & video', 'completed' => $isDone],
            ];
        }
        if (str_contains($name, 'cull') || str_contains($name, 'edit') || str_contains($name, 'retouch') || str_contains($name, 'sneak')) {
            return [
                ['title' => 'Sortir (culling) foto terbaik dari seluruh hasil liputan', 'completed' => $isDone || $isActive],
                ['title' => 'Color grading tone sinematik khas Arams & fine retouching', 'completed' => $isDone || $isActive],
                ['title' => 'Penyusunan berkas master hasil olah digital resolusi tinggi', 'completed' => $isDone],
            ];
        }
        if (str_contains($name, 'revis') || str_contains($name, 'review') || str_contains($name, 'layout')) {
            return [
                ['title' => 'Pemberian draft preview online untuk ditinjau oleh klien', 'completed' => $isDone || $isActive],
                ['title' => 'Penyesuaian minor / revisi sesuai catatan masukan klien', 'completed' => $isDone],
                ['title' => 'Konfirmasi approval final hasil karya sebelum penyerahan', 'completed' => $isDone],
            ];
        }
        if (str_contains($name, 'cetak') || str_contains($name, 'album') || str_contains($name, 'box')) {
            return [
                ['title' => 'Layouting halaman photobook & konfirmasi cetak lab foto', 'completed' => $isDone || $isActive],
                ['title' => 'Pencetakan album kolase premium, cetak kanvas & frame foto', 'completed' => $isDone],
                ['title' => 'Quality control (QC) fisik cetakan dan packaging eksklusif', 'completed' => $isDone],
            ];
        }
        if (str_contains($name, 'selesai') || str_contains($name, 'final') || str_contains($name, 'kirim') || str_contains($name, 'deliver')) {
            return [
                ['title' => 'Quality check (QC) final berkas resolusi tinggi & packaging', 'completed' => $isDone || $isActive],
                ['title' => 'Pengiriman tautan Google Drive / Cloud Album resolusi tinggi', 'completed' => $isDone],
                ['title' => 'Serah terima paket fisik & penutupan project selesai', 'completed' => $isDone],
            ];
        }

        return [
            ['title' => $stepDesc ?: "Pelaksanaan tahapan {$stepName}", 'completed' => $isDone || $isActive],
            ['title' => 'Koordinasi dan quality review bersama tim terkait', 'completed' => $isDone],
        ];
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
                    'video_url' => $p->video_url,
                    'youtube_id' => $p->youtube_id,
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
