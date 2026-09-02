<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Client;
use App\Models\FileLink;
use App\Models\Package;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class ClientUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Ensure Client role exists
        $clientRole = Role::firstOrCreate(['name' => 'Client', 'guard_name' => 'web']);

        // 2. Find or create Client "Andi Pratama"
        $client = Client::firstOrCreate(
            ['email' => 'client@arams.com'],
            [
                'name' => 'Andi Pratama',
                'partner_name' => 'Sarah Wijaya',
                'client_type' => 'couple',
                'phone' => '081234567890',
                'city' => 'Jakarta Selatan',
                'province' => 'DKI Jakarta',
                'address' => 'Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan',
                'status' => 'active',
                'source' => 'Instagram',
            ]
        );

        // 3. Create or update User for this Client
        $user = User::updateOrCreate(
            ['email' => 'client@arams.com'],
            [
                'name' => 'Andi Pratama',
                'phone' => '081234567890',
                'client_id' => $client->id,
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $user->assignRole($clientRole);

        // 4. Ensure Category & Package exist
        $category = Category::where('name', 'like', '%Wedding%')->first()
            ?? Category::firstOrCreate(['name' => 'Wedding', 'color' => '#3B82F6', 'status' => 'active']);

        $package = Package::where('category_id', $category->id)->first()
            ?? Package::firstOrCreate(
                ['name' => 'Paket Exclusive Wedding', 'category_id' => $category->id],
                ['base_price' => 50000000, 'duration_hours' => 12, 'status' => 'active']
            );

        // 5. Create or update sample project for Andi Pratama
        $project = Project::updateOrCreate(
            ['client_id' => $client->id, 'name' => 'Wedding Andi & Sarah'],
            [
                'project_number' => 'PRJ-' . date('ym') . '-0001',
                'category_id' => $category->id,
                'package_id' => $package->id,
                'status' => 'in_progress',
                'workflow_step' => 'preview_foto',
                'progress' => 50,
                'event_date' => '2026-05-22',
                'end_date' => '2026-05-22',
                'deadline' => '2026-07-05',
                'location' => 'Grand Ballroom Hotel Mulia Senayan, Jakarta',
                'price' => 50000000,
                'total_amount' => 50000000,
                'paid_amount' => 25000000,
                'payment_status' => 'partial',
                'notes' => 'Konsep Modern Elegant Wedding. Tone warm cinematic.',
            ]
        );

        // 6. Create File Links for this project
        FileLink::firstOrCreate(
            ['project_id' => $project->id, 'name' => 'Preview Foto (Low Resolution)'],
            [
                'drive_url' => 'https://drive.google.com/drive/folders/sample-preview',
                'file_type' => 'folder',
                'size' => 1288490188, // ~1.2 GB
                'created_by' => $user->id,
                'created_at' => '2026-06-05 10:00:00',
            ]
        );

        FileLink::firstOrCreate(
            ['project_id' => $project->id, 'name' => 'Behind The Scene'],
            [
                'drive_url' => 'https://drive.google.com/drive/folders/sample-bts',
                'file_type' => 'video',
                'size' => 3650722201, // ~3.4 GB
                'created_by' => $user->id,
                'created_at' => '2026-05-23 14:00:00',
            ]
        );

        FileLink::firstOrCreate(
            ['project_id' => $project->id, 'name' => 'Foto Hari H (RAW)'],
            [
                'drive_url' => 'https://drive.google.com/drive/folders/sample-raw',
                'file_type' => 'archive',
                'size' => 49177114624, // ~45.8 GB
                'created_by' => $user->id,
                'created_at' => '2026-05-23 18:00:00',
            ]
        );

        // 7. Create Payment records
        $paymentMethod = PaymentMethod::first();
        Payment::firstOrCreate(
            ['project_id' => $project->id, 'amount' => 25000000],
            [
                'client_id' => $client->id,
                'payment_number' => 'PAY-' . date('ym') . '-0001',
                'payment_method_id' => $paymentMethod?->id,
                'payment_date' => '2026-05-26',
                'status' => 'confirmed',
                'notes' => 'DP 50% Pelunasan Tahap 1 terkonfirmasi.',
            ]
        );
    }
}
