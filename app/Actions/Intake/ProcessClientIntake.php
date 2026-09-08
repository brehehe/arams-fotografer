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

            // 1. Fetch & Resolve Category first to know form_type
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
                $category = Category::where('slug', 'wedding')->first()
                    ?? Category::first();
            }

            $formType = $category?->form_type ?? 'wedding';

            // 2. Determine Client Name & Type based on Category Form Type
            $children = !empty($validated['children']) && is_array($validated['children']) ? $validated['children'] : [];
            $fatherName = trim($validated['father_name'] ?? '');
            $motherName = trim($validated['mother_name'] ?? '');
            $parentNames = trim($validated['parent_names'] ?? '');
            if (empty($parentNames)) {
                $parentNames = implode(' & ', array_filter([$fatherName, $motherName]));
            }

            if ($formType === 'newborn') {
                if (!empty($children)) {
                    $childNames = array_filter(array_map(fn($c) => trim($c['name'] ?? ''), $children));
                    $childName = implode(' & ', $childNames);
                    if (count($children) > 1) {
                        $childName .= ' (Kembar)';
                    }
                    $childBirthDate = $children[0]['birth_date'] ?? ($validated['child_birth_date'] ?? null);
                    $childGender = count($children) > 1 ? 'Kembar' : ($children[0]['gender'] ?? ($validated['child_gender'] ?? null));
                } else {
                    $childName = trim($validated['child_name'] ?? '');
                    $childBirthDate = $validated['child_birth_date'] ?? null;
                    $childGender = $validated['child_gender'] ?? null;
                }

                $clientName = $childName ?: ($parentNames ?: ($validated['name'] ?? 'Baby Client'));
                $clientType = 'newborn';
            } elseif ($formType === 'wedding') {
                $childName = null;
                $childBirthDate = null;
                $childGender = null;
                $clientName = trim(($validated['bride_name'] ?? '') . ' & ' . ($validated['groom_name'] ?? ''));
                if (empty($clientName) || $clientName === '&') {
                    $clientName = $validated['name'] ?? 'Klien Pengantin';
                }
                $clientType = 'wedding';
            } else {
                $childName = null;
                $childBirthDate = null;
                $childGender = null;
                $clientName = trim($validated['name'] ?? 'Klien Baru');
                $clientType = Str::slug($category?->name ?? 'standard');
            }

            $client = Client::where('phone', $validated['phone'])->first();

            // Format rich notes from form
            $notesParts = [];
            if (!empty($children)) {
                foreach ($children as $idx => $ch) {
                    $num = $idx + 1;
                    $parts = array_filter([
                        !empty($ch['name']) ? "Nama: {$ch['name']}" : null,
                        !empty($ch['nickname']) ? "Panggilan: {$ch['nickname']}" : null,
                        !empty($ch['gender']) ? "Kelamin: {$ch['gender']}" : null,
                        !empty($ch['birth_date']) ? "Tgl Lahir: {$ch['birth_date']}" : null,
                    ]);
                    $notesParts[] = "Anak #{$num}: " . implode(', ', $parts);
                }
            } elseif (!empty($validated['child_name'])) {
                $notesParts[] = "Nama Anak: {$validated['child_name']}";
                if (!empty($validated['child_nickname'])) $notesParts[] = "Panggilan Anak: {$validated['child_nickname']}";
                if (!empty($validated['child_gender'])) $notesParts[] = "Jenis Kelamin: {$validated['child_gender']}";
            }
            if (!empty($fatherName)) $notesParts[] = "Nama Ayah: {$fatherName}";
            if (!empty($motherName)) $notesParts[] = "Nama Ibu: {$motherName}";
            if (!empty($parentNames) && empty($fatherName) && empty($motherName)) $notesParts[] = "Orang Tua: {$parentNames}";
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
                'partner_name' => $validated['groom_name'] ?? ($parentNames ?: null),
                'child_name' => $childName,
                'child_birth_date' => $childBirthDate,
                'child_gender' => $childGender,
                'father_name' => $fatherName ?: null,
                'mother_name' => $motherName ?: null,
                'children' => !empty($children) ? $children : null,
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
                'client_type' => $clientType,
                'source' => $validated['source_info'] ?? 'Formulir Online (Client Intake)',
                'referred_by_client_id' => $referredByClientId,
                'wedding_organizer_id' => $weddingOrganizerId,
                'referral_name' => $validated['referral_name'] ?? null,
                'status' => 'lead',
                'tags' => ['Online Intake', 'New Lead', ucfirst($formType)],
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

            // 4. Prepare Project Info based on form_type
            $categoryPrefix = $category->name ?? 'Project';
            if ($formType === 'wedding') {
                $projectName = "The Wedding of " . $clientName;
            } elseif ($formType === 'newborn') {
                $projectName = "Newborn Photoshoot of " . ($validated['child_name'] ?? $clientName);
            } else {
                $projectName = $categoryPrefix . ' - ' . $clientName;
            }
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
