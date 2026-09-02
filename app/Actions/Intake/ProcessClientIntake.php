<?php

namespace App\Actions\Intake;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Package;
use App\Models\Project;
use App\Services\ProjectService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ProcessClientIntake
{
    public function __construct(
        protected ProjectService $projectService
    ) {}

    /**
     * Process incoming client booking intake within a database transaction.
     */
    public function execute(array $validated): Project
    {
        return DB::transaction(function () use ($validated) {
            // 1. Create or Find Client
            $clientName = trim($validated['bride_name'] . ' & ' . $validated['groom_name']);
            $client = Client::where('phone', $validated['phone'])->first();

            $clientData = [
                'name' => $clientName,
                'partner_name' => $validated['groom_name'],
                'bride_name' => $validated['bride_name'],
                'bride_nickname' => $validated['bride_nickname'] ?? null,
                'groom_name' => $validated['groom_name'],
                'groom_nickname' => $validated['groom_nickname'] ?? null,
                'bride_birth_date' => $validated['bride_birth_date'] ?? null,
                'groom_birth_date' => $validated['groom_birth_date'] ?? null,
                'phone' => $validated['phone'],
                'secondary_phone' => $validated['secondary_phone'] ?? null,
                'email' => $validated['email'] ?? null,
                'instagram' => $validated['instagram'] ?? null,
                'city' => $validated['city'] ?? null,
                'province' => $validated['province'] ?? null,
                'address' => $validated['address'] ?? null,
                'client_type' => 'wedding',
                'source' => 'Formulir Online (Client Intake)',
                'referred_by_client_id' => $validated['referred_by_client_id'] ?? null,
                'wedding_organizer_id' => $validated['wedding_organizer_id'] ?? null,
                'referral_name' => $validated['referral_name'] ?? null,
                'status' => 'lead',
                'tags' => ['Online Intake', 'New Lead'],
            ];

            if ($client) {
                $client->update($clientData);
            } else {
                $client = Client::create($clientData);
            }

            // 2. Package calculation
            $package = null;
            $price = 0;
            if (!empty($validated['package_id'])) {
                $package = Package::find($validated['package_id']);
                $price = $package ? (float) $package->base_price : 0;
            }

            // 3. Project Name & Number
            $projectName = 'Wedding ' . $clientName;
            $projectNumber = $this->projectService->generateProjectNumber();

            // 4. Create Project
            $project = Project::create([
                'project_number' => $projectNumber,
                'name' => $projectName,
                'client_id' => $client->id,
                'wedding_organizer_id' => $validated['wedding_organizer_id'] ?? null,
                'category_id' => $validated['category_id'],
                'package_id' => $validated['package_id'] ?? null,
                'status' => 'draft',
                'workflow_step' => 'booking',
                'progress' => 10,
                'event_date' => $validated['event_date'],
                'event_time' => $validated['event_time'] ?? null,
                'location' => $validated['location'] ?? null,
                'price' => $price,
                'total_amount' => $price,
                'paid_amount' => 0,
                'payment_status' => 'pending',
                'notes' => $validated['notes'] ?? 'Dibuat otomatis via Form Booking Online Klien.',
            ]);

            // 5. Generate First Invoice if package has price
            if ($price > 0) {
                $invoiceNumber = $this->projectService->generateInvoiceNumber();
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
