<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Client;
use App\Models\Package;
use App\Models\Project;
use App\Models\User;
use App\Services\FinanceService;
use App\Traits\HasWebpUpload;
use Illuminate\Http\Request;

class ProjectService
{
    use HasWebpUpload;
    /**
     * Get paginated projects with filters, lookups, and KPI stats.
     */
    public function getProjectsPaginated(Request $request): array
    {
        $query = Project::with([
            'client:id,name,email,phone',
            'category:id,name,color',
            'package:id,name',
            'supervisor:id,name,email,avatar',
            'photographer:id,name,email,avatar',
            'editor:id,name,email,avatar',
            'invoices' => function ($q) {
                $q->select('id', 'project_id', 'invoice_number', 'status', 'total', 'paid_amount')->latest('id')->limit(1);
            },
        ]);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('project_number', 'like', "%{$search}%")
                    ->orWhereHas('client', function ($cq) use ($search) {
                        $cq->where('name', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    })
                    ->orWhereHas('invoices', function ($iq) use ($search) {
                        $iq->where('invoice_number', 'like', "%{$search}%");
                    });
            });
        }

        // Status Tab Filter (Semua, Draft, Berlangsung, Selesai, Ditunda, Dibatalkan)
        if ($tab = $request->input('tab')) {
            if ($tab === 'draft') {
                $query->where('status', 'draft');
            } elseif ($tab === 'berlangsung') {
                $query->whereIn('status', ['in_progress', 'editing', 'active']);
            } elseif ($tab === 'selesai') {
                $query->where('status', 'completed');
            } elseif ($tab === 'ditunda') {
                $query->whereIn('status', ['on_hold', 'pending', 'booking']);
            } elseif ($tab === 'dibatalkan') {
                $query->where('status', 'cancelled');
            }
        }

        if ($status = $request->input('status')) {
            if ($status !== 'all' && $status !== 'Semua Status') {
                if ($status === 'draft') {
                    $query->where('status', 'draft');
                } elseif ($status === 'berlangsung') {
                    $query->whereIn('status', ['in_progress', 'editing']);
                } elseif ($status === 'selesai') {
                    $query->where('status', 'completed');
                } elseif ($status === 'menunggu') {
                    $query->whereIn('status', ['booking', 'pending', 'on_hold']);
                } elseif ($status === 'dibatalkan') {
                    $query->where('status', 'cancelled');
                } else {
                    $query->where('status', $status);
                }
            }
        }

        if ($categoryId = $request->input('category_id')) {
            if ($categoryId !== 'all' && $categoryId !== 'Semua Kategori') {
                $query->where('category_id', $categoryId);
            }
        }

        if ($supervisorId = $request->input('supervisor_id')) {
            if ($supervisorId !== 'all' && $supervisorId !== 'Semua Supervisor') {
                $query->where('supervisor_id', $supervisorId);
            }
        }

        if ($date = $request->input('date')) {
            $query->where(function ($q) use ($date) {
                $q->whereDate('event_date', $date)
                    ->orWhereDate('deadline', $date);
            });
        }

        $perPage = (int) $request->input('per_page', 8);
        $projects = $query->latest('created_at')->paginate($perPage)->withQueryString();

        // Stats cards calculation directly from Database
        $stats = Project::selectRaw("
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
            COUNT(CASE WHEN status IN ('in_progress', 'editing', 'active') THEN 1 END) as berlangsung,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as selesai,
            COUNT(CASE WHEN status IN ('booking', 'pending', 'on_hold') THEN 1 END) as menunggu,
            COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as dibatalkan,
            COALESCE(AVG(CASE WHEN progress IS NOT NULL THEN progress ELSE 0 END), 0) as avg_progress
        ")->first();

        // Closest Upcoming Deadlines directly from Database (Hanya yang belum selesai & tenggat waktu mendatang)
        $upcomingDeadlines = Project::with(['category:id,name,color'])
            ->whereNotNull('deadline')
            ->whereNotIn('status', ['completed', 'selesai', 'cancelled', 'dibatalkan', 'delivered'])
            ->where('deadline', '>=', \Carbon\Carbon::now()->startOfDay())
            ->orderBy('deadline', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($p) {
                $deadlineDate = \Carbon\Carbon::parse($p->deadline);
                $daysRemaining = (int) ceil(now()->diffInDays($deadlineDate, false));
                return [
                    'id' => $p->id,
                    'project_number' => $p->project_number,
                    'name' => $p->name,
                    'deadline' => $p->deadline ? $p->deadline->format('Y-m-d') : null,
                    'formatted_deadline' => $p->deadline ? $p->deadline->translatedFormat('d M Y') : null,
                    'days_remaining' => $daysRemaining,
                    'category' => $p->category,
                ];
            });

        // Recent Activities directly from Spatie Activitylog / Project history
        $recentActivities = \Spatie\Activitylog\Models\Activity::with(['causer:id,name,avatar', 'subject'])
            ->latest('id')
            ->limit(5)
            ->get()
            ->map(function ($act) {
                $desc = $act->description;
                if ($act->subject instanceof Project) {
                    $desc = ($act->event === 'created' ? 'Project dibuat: ' : ($act->event === 'updated' ? 'Update progress: ' : 'Aktivitas: ')) . ($act->subject->project_number ? $act->subject->project_number . ' - ' : '') . $act->subject->name;
                } elseif ($desc === 'created') {
                    $desc = 'Data baru ditambahkan';
                } elseif ($desc === 'updated') {
                    $desc = 'Data diperbarui';
                }

                return [
                    'id' => (string) $act->id,
                    'description' => $desc,
                    'event' => $act->event ?? 'update',
                    'causer_name' => $act->causer?->name ?? 'Admin',
                    'created_at' => $act->created_at ? $act->created_at->diffForHumans() : 'baru saja',
                ];
            });

        if ($recentActivities->isEmpty()) {
            $recentActivities = Project::with('supervisor')->latest('updated_at')->limit(5)->get()->map(function ($p) {
                return [
                    'id' => 'p-' . $p->id,
                    'description' => 'Update progress ' . ($p->project_number ? $p->project_number . ' ' : '') . $p->name,
                    'event' => $p->status === 'completed' ? 'completed' : 'update',
                    'causer_name' => $p->supervisor?->name ?? 'Supervisor',
                    'created_at' => $p->updated_at ? $p->updated_at->diffForHumans() : 'baru saja',
                ];
            });
        }

        $categories = Category::where('status', 'active')->select('id', 'name', 'color')->orderBy('sort_order')->get();
        $clients = Client::select('id', 'name', 'email', 'phone')->get();
        $packages = Package::where('status', 'active')->select('id', 'name', 'category_id', 'base_price', 'duration_hours')->get();
        $teamMembers = User::where('status', 'active')->select('id', 'name', 'email', 'avatar')->get();
        $supervisors = User::where('status', 'active')
            ->select('id', 'name', 'email', 'avatar')
            ->orderBy('name')
            ->get();

        $totalCount = (int) ($stats->total ?? 0);
        $draftCount = (int) ($stats->draft ?? 0);
        $berlangsungCount = (int) ($stats->berlangsung ?? 0);
        $selesaiCount = (int) ($stats->selesai ?? 0);
        $menungguCount = (int) ($stats->menunggu ?? 0);
        $dibatalkanCount = (int) ($stats->dibatalkan ?? 0);
        $avgProgress = round((float) ($stats->avg_progress ?? 0));

        return [
            'projects' => $projects,
            'filters' => (object) $request->only(['search', 'status', 'category_id', 'supervisor_id', 'tab', 'date', 'per_page']),
            'categories' => $categories,
            'clients' => $clients,
            'packages' => $packages,
            'team_members' => $teamMembers,
            'supervisors' => $supervisors,
            'upcoming_deadlines' => $upcomingDeadlines,
            'recent_activities' => $recentActivities,
            'stats' => [
                'total' => $totalCount,
                'draft' => $draftCount,
                'berlangsung' => $berlangsungCount,
                'selesai' => $selesaiCount,
                'menunggu' => $menungguCount,
                'dibatalkan' => $dibatalkanCount,
                'avg_progress' => $avgProgress,
            ],
        ];
    }

    /**
     * Get project detail along with relations and lookup data.
     */
    public function getProjectDetail(Project $project): array
    {
        $project->load([
            'client',
            'weddingOrganizer',
            'category',
            'package',
            'photographer:id,name,email,avatar',
            'editor:id,name,email,avatar',
            'supervisor:id,name,email,avatar',
            'projectAddons.addon',
            'schedules',
            'invoices.items',
            'payments.paymentMethod',
            'fileLinks.creator:id,name',
            'highlights',
        ]);

        $teamMembers = User::where('status', 'active')->select('id', 'name', 'email', 'avatar')->get();
        $categories = Category::where('status', 'active')->select('id', 'name', 'color')->get();
        $packages = Package::where('status', 'active')->select('id', 'name', 'category_id', 'base_price', 'duration_hours')->get();
        $paymentMethods = \App\Models\PaymentMethod::where('status', 'active')
            ->select('id', 'name', 'code', 'account_number', 'account_holder', 'icon')
            ->orderBy('created_at')
            ->get();

        $companySettings = [
            'name' => \App\Models\Setting::get('company_name', 'ARAMS PICTURES'),
            'logo' => \App\Models\Setting::get('company_logo'),
            'tagline' => \App\Models\Setting::get('company_tagline', 'CAPTURING MOMENTS, CREATING MEMORIES'),
            'phone' => \App\Models\Setting::get('company_phone', '0812-3456-7890'),
            'email' => \App\Models\Setting::get('company_email', 'hello@arams.com'),
            'address' => \App\Models\Setting::get('company_address', 'Jakarta, Indonesia'),
            'instagram' => \App\Models\Setting::get('company_instagram', '@aramspictures'),
            'website' => \App\Models\Setting::get('company_website', 'www.arams.com'),
        ];

        return [
            'project' => $project,
            'team_members' => $teamMembers,
            'categories' => $categories,
            'packages' => $packages,
            'payment_methods' => $paymentMethods,
            'company_settings' => $companySettings,
            'workflow_definitions' => \App\Http\Controllers\MasterData\WorkflowController::getWorkflowDefinitions(),
        ];
    }

    /**
     * Generate unique project number according to system settings.
     */
    public function generateProjectNumber(): string
    {
        $prefixSetting = \App\Models\Setting::get('project_prefix', 'PRJ');
        $formatTemplate = \App\Models\Setting::get('project_format', 'PRJ-{YY}{MM}-{NUMBER}');
        $padding = (int) \App\Models\Setting::get('invoice_padding', 4);
        if ($padding < 1 || $padding > 8) {
            $padding = 4;
        }

        // Replace template date & prefix tokens
        $resolved = str_replace(
            ['{PREFIX}', '{YEAR}', '{YY}', '{MONTH}', '{MM}'],
            [$prefixSetting, date('Y'), date('y'), date('m'), date('m')],
            $formatTemplate
        );

        if (!str_contains($resolved, '{NUMBER}')) {
            $resolved .= '-{NUMBER}';
        }

        [$prefixPart, $suffixPart] = explode('{NUMBER}', $resolved, 2);

        // Find all existing project numbers matching prefixPart (including soft deleted)
        $allMatching = Project::withTrashed()
            ->where('project_number', 'like', "{$prefixPart}%")
            ->pluck('project_number')
            ->map(function ($num) use ($prefixPart, $suffixPart) {
                $mid = substr((string) $num, strlen($prefixPart));
                if (!empty($suffixPart) && str_ends_with($mid, $suffixPart)) {
                    $mid = substr($mid, 0, -strlen($suffixPart));
                }
                return is_numeric($mid) ? (int) $mid : 0;
            })
            ->filter(fn ($n) => $n > 0)
            ->all();

        $nextNum = (!empty($allMatching) ? max($allMatching) : 0) + 1;

        do {
            $candidate = $prefixPart . sprintf("%0{$padding}d", $nextNum) . $suffixPart;
            $exists = Project::withTrashed()->where('project_number', $candidate)->exists();
            if ($exists) {
                $nextNum++;
            }
        } while ($exists);

        return $candidate;
    }

    /**
     * Generate unique invoice number via FinanceService.
     */
    public function generateInvoiceNumber(): string
    {
        return app(FinanceService::class)->generateInvoiceNumber();
    }

    /**
     * Create a new project with auto-numbering, initial invoice creation, and activity log.
     */
    public function createProject(array $data, ?User $causer = null): Project
    {
        $addons = $data['selected_addons'] ?? [];
        unset($data['selected_addons']);

        $dpAmount = (float) ($data['dp_amount'] ?? ($data['invoice_amount'] ?? 0));
        $invoiceType = $data['invoice_type'] ?? 'dp';
        $invoiceDueDate = $data['invoice_due_date'] ?? null;
        $photographerName = $data['photographer_name'] ?? null;
        $editorName = $data['editor_name'] ?? null;
        $createdAtDate = $data['created_at_date'] ?? null;

        unset(
            $data['dp_amount'],
            $data['invoice_type'],
            $data['invoice_amount'],
            $data['invoice_due_date'],
            $data['photographer_name'],
            $data['editor_name'],
            $data['created_at_date'],
            $data['send_whatsapp'],
            $data['send_email_1'],
            $data['send_email_2'],
            $data['client_message']
        );

        if (empty($data['project_number'])) {
            $data['project_number'] = $this->generateProjectNumber();
        }

        $data['status'] = $data['status'] ?? 'in_progress';
        $data['progress'] = $data['status'] === 'completed' ? 100 : ($data['status'] === 'draft' ? 0 : 20);
        $data['payment_status'] = $data['payment_status'] ?? ($data['status'] === 'draft' ? 'unpaid' : ($data['paid_amount'] ?? 0 > 0 ? 'partial' : 'unpaid'));
        $data['paid_amount'] = (float) ($data['paid_amount'] ?? ($data['payment_status'] === 'paid' ? ($data['total_amount'] ?? 0) : 0));

        // Append operational free-text staff to notes if present
        $extraNotes = [];
        if ($photographerName) {
            $extraNotes[] = "Photographer: {$photographerName}";
        }
        if ($editorName) {
            $extraNotes[] = "Editor: {$editorName}";
        }
        if (!empty($extraNotes)) {
            $existingNotes = $data['notes'] ?? '';
            $data['notes'] = trim($existingNotes . "\n" . implode(' | ', $extraNotes));
        }

        if ($createdAtDate) {
            $data['created_at'] = \Carbon\Carbon::parse($createdAtDate)->setTimeFrom(now());
        }

        if (!empty($data['thumbnail']) && is_string($data['thumbnail']) && str_starts_with($data['thumbnail'], 'data:image')) {
            try {
                $data['thumbnail'] = $this->uploadAsWebp($data['thumbnail'], 'projects');
            } catch (\Throwable $e) {
                // Keep data or set null if conversion fails
            }
        }

        $project = Project::create($data);

        // Attach selected project addons if any
        if (!empty($addons) && is_array($addons)) {
            foreach ($addons as $item) {
                $qty = (int) ($item['qty'] ?? 1);
                $unitPrice = (float) ($item['unit_price'] ?? 0);
                $totalPrice = (float) ($item['total_price'] ?? ($unitPrice * $qty));
                $rawId = (string) ($item['id'] ?? '');
                $isValidUuid = \Illuminate\Support\Str::isUuid($rawId);
                $isCustom = !empty($item['is_custom']) || empty($rawId) || !$isValidUuid;

                \App\Models\ProjectAddon::create([
                    'project_id' => $project->id,
                    'addon_id' => ($isCustom || !$isValidUuid) ? null : $rawId,
                    'custom_name' => $isCustom ? ($item['name'] ?? 'Biaya Tambahan') : null,
                    'qty' => $qty,
                    'unit' => $item['unit'] ?? 'item',
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                ]);
            }
        }

        // Automatically create initial Invoice (DP or Full)
        $invoice = null;
        if ($dpAmount > 0) {
            $financeService = app(\App\Services\FinanceService::class);
            $invoiceNumber = $financeService->generateInvoiceNumber();

            $invoice = \App\Models\Invoice::create([
                'invoice_number' => $invoiceNumber,
                'project_id' => $project->id,
                'client_id' => $project->client_id,
                'issue_date' => $createdAtDate ? \Carbon\Carbon::parse($createdAtDate) : now(),
                'due_date' => $invoiceDueDate ? \Carbon\Carbon::parse($invoiceDueDate) : now()->addDays(7),
                'subtotal' => $dpAmount,
                'discount' => 0,
                'tax' => 0,
                'total' => $dpAmount,
                'paid_amount' => 0,
                'remaining_amount' => $dpAmount,
                'status' => 'unpaid',
                'notes' => $invoiceType === 'dp'
                    ? "Tagihan DP (Uang Muka) untuk {$project->name}"
                    : "Tagihan Penuh untuk {$project->name}",
            ]);

            \App\Models\InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'description' => ($invoiceType === 'dp' ? 'DP - ' : 'Pembayaran - ') . $project->name,
                'quantity' => 1,
                'unit_price' => $dpAmount,
                'total' => $dpAmount,
            ]);
        }

        $project->created_invoice = $invoice;

        activity()
            ->causedBy($causer ?? auth()->user())
            ->performedOn($project)
            ->event('created')
            ->log("Project baru {$project->name} ({$project->project_number}) berhasil dibuat");

        return $project;
    }

    /**
     * Update project and log activity.
     */
    public function updateProject(Project $project, array $data, ?User $causer = null): Project
    {
        $addons = $data['selected_addons'] ?? null;
        unset($data['selected_addons']);

        if (array_key_exists('thumbnail', $data)) {
            if (!empty($data['thumbnail']) && is_string($data['thumbnail']) && str_starts_with($data['thumbnail'], 'data:image')) {
                try {
                    $data['thumbnail'] = $this->uploadAsWebp($data['thumbnail'], 'projects', 80, 1920, null, $project->thumbnail);
                } catch (\Throwable $e) {
                    // Fallback
                }
            } elseif (empty($data['thumbnail'])) {
                if ($project->thumbnail) {
                    $this->deleteWebpImage($project->thumbnail);
                }
                $data['thumbnail'] = null;
            }
        }

        $project->update($data);

        // Sync selected project addons if array passed
        if ($addons !== null && is_array($addons)) {
            \App\Models\ProjectAddon::where('project_id', $project->id)->delete();
            foreach ($addons as $item) {
                $qty = (int) ($item['qty'] ?? 1);
                $unitPrice = (float) ($item['unit_price'] ?? 0);
                $totalPrice = (float) ($item['total_price'] ?? ($unitPrice * $qty));
                $rawId = (string) ($item['id'] ?? '');
                $isValidUuid = \Illuminate\Support\Str::isUuid($rawId);
                $isCustom = !empty($item['is_custom']) || empty($rawId) || !$isValidUuid;

                \App\Models\ProjectAddon::create([
                    'project_id' => $project->id,
                    'addon_id' => ($isCustom || !$isValidUuid) ? null : $rawId,
                    'custom_name' => $isCustom ? ($item['name'] ?? 'Biaya Tambahan Kustom') : null,
                    'qty' => $qty,
                    'unit' => $item['unit'] ?? 'item',
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                ]);
            }
        }

        activity()
            ->causedBy($causer ?? auth()->user())
            ->performedOn($project)
            ->event('updated')
            ->log("Project {$project->name} ({$project->project_number}) berhasil diperbarui");

        return $project;
    }

    /**
     * Update project status and log activity.
     */
    public function updateStatus(Project $project, array $data, ?User $causer = null): Project
    {
        $oldStatus = $project->status;
        $filtered = array_filter($data, fn ($val) => !is_null($val));

        if (isset($filtered['status']) && $filtered['status'] === 'completed' && !isset($filtered['progress'])) {
            $filtered['progress'] = 100;
        }

        $project->update($filtered);

        $logMsg = "Project {$project->name} diperbarui.";
        if (isset($filtered['status'])) {
            $logMsg .= " Status: {$oldStatus} → {$project->status}.";
        }
        if (isset($filtered['workflow_step'])) {
            $logMsg .= " Tahap: {$project->workflow_step}.";
        }
        if (isset($filtered['progress'])) {
            $logMsg .= " Progres: {$project->progress}%.";
        }

        activity()
            ->causedBy($causer ?? auth()->user())
            ->performedOn($project)
            ->event('status_change')
            ->log($logMsg);

        return $project;
    }

    /**
     * Get lookup data for project create/edit forms.
     */
    public function getProjectFormData(): array
    {
        $clients = Client::select('id', 'name', 'email', 'phone', 'city', 'instagram')->orderBy('name')->get();
        $categories = Category::where('status', 'active')->select('id', 'name', 'slug', 'color', 'workflow_type')->orderBy('sort_order')->get();
        $packages = Package::where('status', 'active')->select('id', 'name', 'category_id', 'base_price', 'duration_hours', 'description', 'included_services', 'included_deliverables')->get();
        $weddingOrganizers = \App\Models\WeddingOrganizer::whereIn('status', ['partner', 'active'])->select('id', 'name', 'pic_name', 'phone', 'city', 'tier')->orderBy('name')->get();
        $addons = \App\Models\Addon::where('status', 'active')->with('category:id,name')->select('id', 'name', 'type', 'category_id', 'price', 'unit', 'description')->orderBy('name')->get();
        $clientSources = \App\Models\ClientSource::where('status', 'active')->select('id', 'name', 'type', 'phone', 'email')->orderBy('name')->get();
        $services = \App\Models\Service::where('status', 'active')->select('id', 'name', 'category_id', 'description')->get();
        $teamMembers = User::where('status', 'active')
            ->with('roles:id,name')
            ->select('id', 'name', 'email', 'avatar')
            ->orderBy('name')
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'avatar' => $u->avatar,
                    'role' => $u->roles->first()?->name ?? 'Team Member',
                ];
            });
        $supervisors = User::where('status', 'active')
            ->select('id', 'name', 'email', 'avatar')
            ->orderBy('name')
            ->get();
        $noteTemplates = \App\Models\NoteTemplate::where('status', 'active')->select('id', 'title', 'content', 'type')->get();
        $paymentMethods = \App\Models\PaymentMethod::where('status', 'active')
            ->select('id', 'name', 'code', 'account_number', 'account_holder', 'icon')
            ->orderBy('created_at')
            ->get();

        $financeService = app(\App\Services\FinanceService::class);
        $nextProjectNumber = $this->generateProjectNumber();
        $nextInvoiceNumber = $financeService->generateInvoiceNumber();

        $companySettings = [
            'name' => \App\Models\Setting::get('company_name', 'ARAMS PICTURES'),
            'logo' => \App\Models\Setting::get('company_logo'),
            'tagline' => \App\Models\Setting::get('company_tagline', 'CAPTURING MOMENTS, CREATING MEMORIES'),
            'phone' => \App\Models\Setting::get('company_phone', '0813 9876 5432'),
            'email' => \App\Models\Setting::get('company_email', 'arams.pictures@gmail.com'),
            'address' => \App\Models\Setting::get('company_address', 'Jl. Studio Raya No. 10 Jakarta Selatan 12345, Indonesia'),
            'instagram' => \App\Models\Setting::get('company_instagram', '@arams.pictures'),
            'website' => \App\Models\Setting::get('company_website', 'www.arams-pictures.com'),
        ];

        return [
            'clients' => $clients,
            'categories' => $categories,
            'packages' => $packages,
            'wedding_organizers' => $weddingOrganizers,
            'addons' => $addons,
            'client_sources' => $clientSources,
            'services' => $services,
            'supervisors' => $supervisors,
            'team_members' => $teamMembers,
            'note_templates' => $noteTemplates,
            'payment_methods' => $paymentMethods,
            'company_settings' => $companySettings,
            'next_project_number' => $nextProjectNumber,
            'next_invoice_number' => $nextInvoiceNumber,
            'workflow_definitions' => \App\Http\Controllers\MasterData\WorkflowController::getWorkflowDefinitions(),
        ];
    }

    /**
     * Get data for dedicated Invoice preview & detail page.
     */
    public function getProjectInvoiceData(Project $project, ?string $invoiceId = null): array
    {
        $project->load([
            'client',
            'weddingOrganizer',
            'category',
            'package',
            'supervisor:id,name,email,avatar',
            'photographer:id,name,email,avatar',
            'editor:id,name,email,avatar',
            'projectAddons.addon',
            'invoices.items',
            'payments.paymentMethod',
        ]);

        // Find selected invoice or latest
        $invoice = null;
        if ($invoiceId) {
            $invoice = $project->invoices->firstWhere('id', $invoiceId);
        }
        if (!$invoice) {
            $invoice = $project->invoices->first();
        }

        // If no invoice exists on this project, create a default DP invoice record
        if (!$invoice) {
            $financeService = app(\App\Services\FinanceService::class);
            $dpAmount = (float) ($project->paid_amount > 0 ? $project->paid_amount : ($project->total_amount * 0.2));
            if ($dpAmount <= 0) {
                $dpAmount = 7000000;
            }

            $invoice = \App\Models\Invoice::create([
                'invoice_number' => $financeService->generateInvoiceNumber(),
                'project_id' => $project->id,
                'client_id' => $project->client_id,
                'issue_date' => $project->created_at ?? now(),
                'due_date' => $project->deadline ?? now()->addDays(7),
                'subtotal' => $dpAmount,
                'discount' => 0,
                'tax' => 0,
                'total' => $dpAmount,
                'paid_amount' => 0,
                'remaining_amount' => $dpAmount,
                'status' => 'unpaid',
                'notes' => "Invoice DP (Uang Muka) untuk {$project->name}",
            ]);

            \App\Models\InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'description' => "DP - {$project->name}",
                'quantity' => 1,
                'unit_price' => $dpAmount,
                'total' => $dpAmount,
            ]);

            $project->refresh();
            $project->load('invoices.items');
        }

        $paymentMethods = \App\Models\PaymentMethod::where('status', 'active')
            ->select('id', 'name', 'code', 'account_number', 'account_holder', 'icon')
            ->orderBy('created_at')
            ->get();

        $companySettings = [
            'name' => \App\Models\Setting::get('company_name', 'Arams Photography'),
            'legal_name' => \App\Models\Setting::get('company_legal_name', 'Arams Pictures Studio'),
            'subtitle' => \App\Models\Setting::get('company_subtitle', 'Photografer'),
            'logo' => \App\Models\Setting::get('company_logo'),
            'tagline' => \App\Models\Setting::get('company_tagline', 'Capturing Moments, Creating Timeless Memories'),
            'phone' => \App\Models\Setting::get('company_phone', '+62 812-3456-7890'),
            'email' => \App\Models\Setting::get('company_email', 'hello@arams.com'),
            'address' => \App\Models\Setting::get('company_address', 'Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan 12190'),
            'instagram' => \App\Models\Setting::get('company_instagram', 'aramspictures'),
            'website' => \App\Models\Setting::get('company_website', 'https://www.arams.com'),
        ];

        return [
            'project' => $project,
            'current_invoice' => $invoice,
            'invoices' => $project->invoices,
            'payment_methods' => $paymentMethods,
            'company_settings' => $companySettings,
        ];
    }
}
