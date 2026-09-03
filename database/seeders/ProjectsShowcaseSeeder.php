<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Client;
use App\Models\Project;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class ProjectsShowcaseSeeder extends Seeder
{
    public function run(): void
    {
        $supervisorRole = Role::findOrCreate('Supervisor');

        // 1. Ensure Supervisors
        $budi = User::firstOrCreate(
            ['email' => 'budi.santoso@arams.com'],
            [
                'name' => 'Budi Santoso',
                'phone' => '0812-9876-5432',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                'status' => 'active',
                'password' => Hash::make('password'),
            ]
        );
        $budi->assignRole($supervisorRole);

        $rizky = User::firstOrCreate(
            ['email' => 'rizky.pratama@arams.com'],
            [
                'name' => 'Rizky Pratama',
                'phone' => '0813-1122-3344',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                'status' => 'active',
                'password' => Hash::make('password'),
            ]
        );
        $rizky->assignRole($supervisorRole);

        // 2. Ensure Categories
        $categoriesData = [
            'wedding' => ['name' => 'Wedding', 'color' => '#8B5CF6', 'icon' => 'Heart'],
            'prewedding' => ['name' => 'Prewedding', 'color' => '#3B82F6', 'icon' => 'Camera'],
            'newborn' => ['name' => 'Newborn', 'color' => '#10B981', 'icon' => 'Baby'],
            'event' => ['name' => 'Event', 'color' => '#F59E0B', 'icon' => 'Calendar'],
            'family' => ['name' => 'Family', 'color' => '#06B6D4', 'icon' => 'Users'],
            'maternity' => ['name' => 'Maternity', 'color' => '#EC4899', 'icon' => 'Smile'],
            'traveling' => ['name' => 'Traveling', 'color' => '#0EA5E9', 'icon' => 'Compass'],
            'komunitas' => ['name' => 'Komunitas', 'color' => '#6366F1', 'icon' => 'Users2'],
        ];

        $cats = [];
        foreach ($categoriesData as $key => $cd) {
            $cats[$key] = Category::firstOrCreate(
                ['name' => $cd['name']],
                [
                    'slug' => $key,
                    'color' => $cd['color'],
                    'icon' => $cd['icon'],
                    'status' => 'active',
                    'sort_order' => 1,
                ]
            );
        }

        // 3. Showcase Projects Data
        $showcaseProjects = [
            [
                'project_number' => 'PRJ-2505-0187',
                'name' => 'Wedding Kevin & Jessica',
                'client_name' => 'Kevin Sanjaya & Jessica Mila',
                'client_phone' => '0813 9876 5432',
                'client_email' => 'kevin.jessica@email.com',
                'category_key' => 'wedding',
                'total_amount' => 85000000,
                'supervisor_id' => $budi->id,
                'progress' => 63,
                'workflow_step' => 'Sneak Peek Photo Editing',
                'status' => 'in_progress',
                'event_date' => '2026-05-18',
                'deadline' => '2026-06-30',
                'thumbnail' => 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200&auto=format&fit=crop&q=80',
            ],
            [
                'project_number' => 'PRJ-2505-0186',
                'name' => 'Prewedding Andi & Sari',
                'client_name' => 'Andi Pratama & Sari Wulandari',
                'client_phone' => '0822 1111 2222',
                'client_email' => 'andi.sari@email.com',
                'category_key' => 'prewedding',
                'total_amount' => 45000000,
                'supervisor_id' => $rizky->id,
                'progress' => 40,
                'workflow_step' => 'Full Photo & Video Editing',
                'status' => 'in_progress',
                'event_date' => '2026-05-12',
                'deadline' => '2026-06-20',
                'thumbnail' => 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=200&auto=format&fit=crop&q=80',
            ],
            [
                'project_number' => 'PRJ-2505-0185',
                'name' => 'Newborn Baby Arsen',
                'client_name' => 'Denny Setiawan',
                'client_phone' => '0812 3333 4444',
                'client_email' => 'denny.setiawan@email.com',
                'category_key' => 'newborn',
                'total_amount' => 12500000,
                'supervisor_id' => $budi->id,
                'progress' => 20,
                'workflow_step' => 'Hari H',
                'status' => 'in_progress',
                'event_date' => '2026-05-10',
                'deadline' => '2026-06-05',
                'thumbnail' => 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=200&auto=format&fit=crop&q=80',
            ],
            [
                'project_number' => 'PRJ-2505-0184',
                'name' => 'Event Company Gathering',
                'client_name' => 'PT. Solusi Maju Bersama / Rina Anggraini',
                'client_phone' => '0817 5555 6666',
                'client_email' => 'rina.solusimaju@email.com',
                'category_key' => 'event',
                'total_amount' => 30000000,
                'supervisor_id' => $rizky->id,
                'progress' => 80,
                'workflow_step' => 'Full Photo & Video Editing',
                'status' => 'in_progress',
                'event_date' => '2026-05-08',
                'deadline' => '2026-05-28',
                'thumbnail' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=200&auto=format&fit=crop&q=80',
            ],
            [
                'project_number' => 'PRJ-2505-0183',
                'name' => 'Family Photoshoot',
                'client_name' => 'Keluarga Wijaya',
                'client_phone' => '0821 7777 8888',
                'client_email' => 'keluarga.wijaya@email.com',
                'category_key' => 'family',
                'total_amount' => 7500000,
                'supervisor_id' => $budi->id,
                'progress' => 100,
                'workflow_step' => 'Final Delivery',
                'status' => 'completed',
                'event_date' => '2026-05-05',
                'deadline' => '2026-05-15',
                'thumbnail' => 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200&auto=format&fit=crop&q=80',
            ],
            [
                'project_number' => 'PRJ-2505-0182',
                'name' => 'Maternity Photoshoot',
                'client_name' => 'Citra Lestari',
                'client_phone' => '0816 9999 0000',
                'client_email' => 'citra.lestari@email.com',
                'category_key' => 'maternity',
                'total_amount' => 15000000,
                'supervisor_id' => $rizky->id,
                'progress' => 25,
                'workflow_step' => 'Hari H',
                'status' => 'in_progress',
                'event_date' => '2026-05-03',
                'deadline' => '2026-05-22',
                'thumbnail' => 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=200&auto=format&fit=crop&q=80',
            ],
            [
                'project_number' => 'PRJ-2505-0181',
                'name' => 'Travel Documentation',
                'client_name' => 'Michael Tan',
                'client_phone' => '0819 1234 5678',
                'client_email' => 'michael.tan@email.com',
                'category_key' => 'traveling',
                'total_amount' => 8000000,
                'supervisor_id' => $budi->id,
                'progress' => 0,
                'workflow_step' => 'Booking & DP',
                'status' => 'draft',
                'event_date' => '2026-05-01',
                'deadline' => '2026-06-10',
                'thumbnail' => 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200&auto=format&fit=crop&q=80',
            ],
            [
                'project_number' => 'PRJ-2505-0180',
                'name' => 'Community Documentation',
                'client_name' => 'Komunitas Fotografi ID / Dika Prabowo',
                'client_phone' => '0822 2222 3333',
                'client_email' => 'dika.komunitas@email.com',
                'category_key' => 'komunitas',
                'total_amount' => 9500000,
                'supervisor_id' => $rizky->id,
                'progress' => 100,
                'workflow_step' => 'Final Delivery',
                'status' => 'completed',
                'event_date' => '2026-04-28',
                'deadline' => '2026-05-05',
                'thumbnail' => 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&auto=format&fit=crop&q=80',
            ],
        ];

        foreach ($showcaseProjects as $sp) {
            $client = Client::firstOrCreate(
                ['email' => $sp['client_email']],
                [
                    'name' => $sp['client_name'],
                    'phone' => $sp['client_phone'],
                    'status' => 'active',
                ]
            );

            Project::updateOrCreate(
                ['project_number' => $sp['project_number']],
                [
                    'name' => $sp['name'],
                    'client_id' => $client->id,
                    'category_id' => $cats[$sp['category_key']]->id,
                    'total_amount' => $sp['total_amount'],
                    'paid_amount' => $sp['total_amount'],
                    'payment_status' => $sp['status'] === 'completed' ? 'paid' : 'partial',
                    'supervisor_id' => $sp['supervisor_id'],
                    'progress' => $sp['progress'],
                    'workflow_step' => $sp['workflow_step'],
                    'status' => $sp['status'],
                    'event_date' => $sp['event_date'],
                    'deadline' => $sp['deadline'],
                    'thumbnail' => $sp['thumbnail'],
                ]
            );
        }

        // 4. Create sample activities
        \Spatie\Activitylog\Models\Activity::firstOrCreate(
            ['description' => 'Project PRJ-2505-0183 selesai'],
            [
                'event' => 'completed',
                'causer_id' => $budi->id,
                'causer_type' => User::class,
                'created_at' => Carbon::now()->subHours(2),
            ]
        );

        \Spatie\Activitylog\Models\Activity::firstOrCreate(
            ['description' => 'Update progress PRJ-2505-0187'],
            [
                'event' => 'update',
                'causer_id' => $rizky->id,
                'causer_type' => User::class,
                'created_at' => Carbon::now()->subHours(3),
            ]
        );

        \Spatie\Activitylog\Models\Activity::firstOrCreate(
            ['description' => 'File baru di PRJ-2505-0184'],
            [
                'event' => 'file',
                'causer_id' => $budi->id,
                'causer_type' => User::class,
                'created_at' => Carbon::now()->subHours(5),
            ]
        );
    }
}
