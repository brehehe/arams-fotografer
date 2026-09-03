<?php

namespace App\Actions\Intake;

use App\Models\Category;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Package;
use App\Models\Project;
use App\Models\User;
use App\Services\FinanceService;
use App\Services\ProjectService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class ProcessClientIntake
{
    public function __construct(
        protected ProjectService $projectService,
        protected FinanceService $financeService
    ) {}

    /**
     * Process incoming client booking intake within a database transaction.
     */
    public function execute(array $validated): Project
    {
        return DB::transaction(function () use ($validated) {
            // 0. Sanitize foreign UUID fields
            $weddingOrganizerId = (!empty($validated['wedding_organizer_id']) && Str::isUuid($validated['wedding_organizer_id']))
                ? $validated['wedding_organizer_id']
                : null;

            $referredByClientId = (!empty($validated['referred_by_client_id']) && Str::isUuid($validated['referred_by_client_id']))
                ? $validated['referred_by_client_id']
                : null;

            // 1. Create or Find Client
            $clientName = trim(($validated['bride_name'] ?? '') . ' & ' . ($validated['groom_name'] ?? ''));
            if (empty($clientName) || $clientName === '&') {
                $clientName = $validated['name'] ?? 'Klien Baru';
            }
            $client = Client::where('phone', $validated['phone'])->first();

            // Format rich notes from form
            $notesParts = [];
            if (!empty($validated['event_type'])) $notesParts[] = "Jenis Acara: {$validated['event_type']}";
            if (!empty($validated['primary_contact'])) $notesParts[] = "Kontak Utama: " . strtoupper($validated['primary_contact']);
            if (!empty($validated['groom_occupation'])) $notesParts[] = "Pekerjaan CPP: {$validated['groom_occupation']}";
            if (!empty($validated['bride_occupation'])) $notesParts[] = "Pekerjaan CPW: {$validated['bride_occupation']}";
            if (!empty($validated['other_social_media'])) $notesParts[] = "Medsos Lain: {$validated['other_social_media']}";
            if (!empty($validated['estimated_guests'])) $notesParts[] = "Estimasi Tamu: {$validated['estimated_guests']}";
            if (!empty($validated['concept_theme'])) $notesParts[] = "Tema/Konsep: {$validated['concept_theme']}";
            if (!empty($validated['other_vendors'])) $notesParts[] = "Vendor Terlibat: {$validated['other_vendors']}";
            if (!empty($validated['project_notes'])) $notesParts[] = "Catatan: {$validated['project_notes']}";
            if (!empty($validated['reference_url'])) $notesParts[] = "Inspirasi/Ref: {$validated['reference_url']}";
            if (!empty($validated['special_requests'])) $notesParts[] = "Perhatian Khusus: {$validated['special_requests']}";
            if (!empty($validated['notes'])) $notesParts[] = $validated['notes'];

            $formattedNotes = implode("\n", $notesParts);

            $instagramHandle = $validated['instagram'] 
                ?? (!empty($validated['primary_contact']) && $validated['primary_contact'] === 'cpp' 
                    ? ($validated['groom_instagram'] ?? $validated['bride_instagram'] ?? null)
                    : ($validated['bride_instagram'] ?? $validated['groom_instagram'] ?? null));

            $clientData = [
                'name' => $clientName,
                'partner_name' => $validated['groom_name'] ?? null,
                'bride_name' => $validated['bride_name'] ?? null,
                'bride_nickname' => $validated['bride_nickname'] ?? null,
                'groom_name' => $validated['groom_name'] ?? null,
                'groom_nickname' => $validated['groom_nickname'] ?? null,
                'bride_birth_date' => $validated['bride_birth_date'] ?? null,
                'groom_birth_date' => $validated['groom_birth_date'] ?? null,
                'phone' => $validated['phone'],
                'secondary_phone' => $validated['secondary_phone'] ?? null,
                'email' => $validated['email'] ?? null,
                'instagram' => $instagramHandle,
                'province' => $validated['province'] ?? null,
                'province_code' => $validated['province_code'] ?? null,
                'city' => $validated['city'] ?? null,
                'city_code' => $validated['city_code'] ?? null,
                'district' => $validated['district'] ?? null,
                'district_code' => $validated['district_code'] ?? null,
                'village' => $validated['village'] ?? null,
                'village_code' => $validated['village_code'] ?? null,
                'postal_code' => $validated['postal_code'] ?? null,
                'address' => $validated['address'] ?? null,
                'preferred_contact' => 'whatsapp',
                'client_type' => 'wedding',
                'source' => $validated['source_info'] ?? 'Formulir Online (Client Intake)',
                'referred_by_client_id' => $referredByClientId,
                'wedding_organizer_id' => $weddingOrganizerId,
                'referral_name' => $validated['referral_name'] ?? null,
                'status' => 'lead',
                'tags' => ['Online Intake', 'New Lead'],
                'notes' => $formattedNotes,
            ];

            if ($client) {
                $client->update($clientData);
            } else {
                $client = Client::create($clientData);
            }

            // 1.1 Create or Link User Account for Client Portal Login
            if (!empty($validated['email'])) {
                $user = User::where('email', $validated['email'])
                    ->orWhere(function ($q) use ($client) {
                        $q->where('client_id', $client->id);
                    })
                    ->first();

                $cleanPhone = preg_replace('/[^0-9]/', '', $validated['phone'] ?? '');
                $defaultPassword = !empty($cleanPhone) && strlen($cleanPhone) >= 6 ? $cleanPhone : 'arams2026';

                if (!$user) {
                    $user = User::create([
                        'name' => $clientName,
                        'email' => $validated['email'],
                        'phone' => $validated['phone'] ?? null,
                        'password' => Hash::make($defaultPassword),
                        'client_id' => $client->id,
                        'status' => 'active',
                        'email_verified_at' => now(),
                    ]);
                } else {
                    $user->update([
                        'client_id' => $client->id,
                        'name' => $clientName,
                        'phone' => $validated['phone'] ?? $user->phone,
                    ]);
                }

                $clientRole = Role::findOrCreate('Client');
                if (!$user->hasRole('Client')) {
                    $user->assignRole($clientRole);
                }
            }

            // 2. Fetch & Resolve Category
            $category = null;
            $rawCategoryId = $validated['category_id'] ?? null;
            if (!empty($rawCategoryId)) {
                if (Str::isUuid($rawCategoryId)) {
                    $category = Category::find($rawCategoryId);
                } else {
                    $category = Category::where('slug', $rawCategoryId)
                        ->orWhereRaw('LOWER(name) LIKE ?', ['%' . strtolower($rawCategoryId) . '%'])
                        ->first();
                }
            }

            if (!$category) {
                $fallbackSlug = (!empty($rawCategoryId) && !Str::isUuid($rawCategoryId)) ? Str::slug($rawCategoryId) : 'wedding';
                $fallbackName = (!empty($rawCategoryId) && !Str::isUuid($rawCategoryId)) ? ucfirst($rawCategoryId) : 'Wedding';

                $category = Category::where('slug', $fallbackSlug)->first()
                    ?? Category::first()
                    ?? Category::create([
                        'name' => $fallbackName,
                        'slug' => $fallbackSlug,
                        'description' => 'Kategori dokumentasi otomatis dari formulir klien.',
                        'icon' => 'Heart',
                        'color' => '#3B82F6',
                        'status' => 'active',
                        'sort_order' => 1,
                    ]);
            }

            // 3. Fetch & Resolve Package
            $package = null;
            $packageId = null;
            $price = 0;
            $rawPackageId = $validated['package_id'] ?? null;
            if (!empty($rawPackageId)) {
                if (Str::isUuid($rawPackageId)) {
                    $package = Package::find($rawPackageId);
                } else {
                    $package = Package::whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($rawPackageId) . '%'])->first();
                }
                if ($package) {
                    $packageId = $package->id;
                    $price = (float) ($package->base_price ?? $package->price ?? 0);
                }
            }

            // 4. Prepare Project Info
            $categoryPrefix = $category->name ?? 'Wedding';
            $projectName = $categoryPrefix . ' ' . $clientName;
            $projectNumber = $this->projectService->generateProjectNumber();

            // 5. Create Project
            $project = Project::create([
                'project_number' => $projectNumber,
                'name' => $projectName,
                'client_id' => $client->id,
                'wedding_organizer_id' => $weddingOrganizerId,
                'category_id' => $category->id,
                'package_id' => $packageId,
                'status' => 'draft',
                'workflow_step' => 'booking',
                'progress' => 10,
                'event_date' => $validated['event_date'] ?? Carbon::now()->addDays(30),
                'event_time' => $validated['event_time'] ?? null,
                'location' => !empty($validated['reception_location']) && $validated['reception_location'] !== ($validated['location'] ?? '')
                    ? (($validated['location'] ?? '') ? "Akad: {$validated['location']} | Resepsi: {$validated['reception_location']}" : $validated['reception_location'])
                    : ($validated['location'] ?? null),
                'price' => $price,
                'total_amount' => $price,
                'paid_amount' => 0,
                'payment_status' => 'pending',
                'notes' => $formattedNotes ?: ($validated['notes'] ?? 'Dibuat otomatis via Form Booking Online Klien.'),
            ]);

            // 5. Generate First Invoice if package has price
            if ($price > 0) {
                $invoiceNumber = $this->financeService->generateInvoiceNumber();
                $issueDate = Carbon::now();
                $dueDate = Carbon::parse($validated['event_date'])->subDays(7);
                if ($dueDate->isPast()) {
                    $dueDate = Carbon::now()->addDays(3);
                }

                $invoice = Invoice::create([
                    'project_id' => $project->id,
                    'client_id' => $client->id,
                    'invoice_number' => $invoiceNumber,
                    'status' => 'draft',
                    'issue_date' => $issueDate,
                    'due_date' => $dueDate,
                    'subtotal' => $price,
                    'tax' => 0,
                    'discount' => 0,
                    'total' => $price,
                    'paid_amount' => 0,
                    'notes' => 'Invoice diterbitkan otomatis untuk paket ' . ($package?->name ?? 'Wedding'),
                ]);

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'name' => $package?->name ?? 'Paket Layanan Foto',
                    'description' => 'Paket Utama - ' . $projectName,
                    'quantity' => 1,
                    'unit_price' => $price,
                    'total' => $price,
                ]);
            }

            // 6. Log Activity
            activity()
                ->performedOn($project)
                ->event('client_intake')
                ->log("Form Booking Online diterima dari {$clientName} (Project: {$projectNumber})");

            return $project;
        });
    }
}
