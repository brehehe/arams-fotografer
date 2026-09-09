<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Client;
use App\Models\Package;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CategoryFormsTest extends TestCase
{
    use RefreshDatabase;
    protected function setUp(): void
    {
        parent::setUp();
        Role::findOrCreate('Client');
        Role::findOrCreate('Admin');
    }

    public function test_form_klien_page_renders_successfully()
    {
        $response = $this->get('/form-klien');
        $response->assertStatus(200);
    }

    public function test_intake_submission_with_maternity_category_data()
    {
        $category = Category::where('slug', 'maternity')->first()
            ?? Category::firstOrCreate(['name' => 'Maternity', 'slug' => 'maternity', 'form_type' => 'maternity']);

        $maternityData = [
            'mom_name' => 'Sarah Amanda',
            'partner_name' => 'Budi Santoso',
            'gestational_age_weeks' => 32,
            'hpl_date' => '2026-11-15',
            'concept_theme' => 'Elegant & Natural',
            'session_location_type' => 'Studio Indoor',
            'wardrobe_notes' => 'White dress and brown suit',
        ];

        $payload = [
            'category_id' => $category->id,
            'name' => 'Sarah Amanda',
            'phone' => '081299998888',
            'email' => 'sarah.maternity@example.com',
            'address' => 'Jl. Mawar Indah No. 10',
            'city' => 'Jakarta Selatan',
            'event_date' => '2026-10-01',
            'location' => 'Arams Studio',
            'category_data' => $maternityData,
        ];

        $response = $this->post('/form-klien', $payload);
        $response->assertRedirect();

        $this->assertDatabaseHas('clients', [
            'phone' => '081299998888',
        ]);

        $project = Project::where('category_id', $category->id)
            ->whereHas('client', function ($q) {
                $q->where('phone', '081299998888');
            })
            ->latest('id')
            ->first();

        $this->assertNotNull($project);
        $this->assertIsArray($project->category_data);
        $this->assertEquals('Sarah Amanda', $project->category_data['mom_name']);
        $this->assertEquals(32, $project->category_data['gestational_age_weeks']);
        $this->assertEquals('2026-11-15', $project->category_data['hpl_date']);
    }

    public function test_intake_submission_with_family_session_child_repeater()
    {
        $category = Category::where('slug', 'family')->first()
            ?? Category::firstOrCreate(['name' => 'Family Session', 'slug' => 'family', 'form_type' => 'family']);

        $familyData = [
            'family_name' => 'Keluarga Pratama',
            'father_name' => 'Pratama Wijaya',
            'mother_name' => 'Citra Lestari',
            'children' => [
                ['name' => 'Alea', 'age' => '6 th'],
                ['name' => 'Raka', 'age' => '3 th'],
            ],
            'members_count' => 4,
            'concept_theme' => 'Warm Casual',
            'session_location' => 'Taman Suropati',
        ];

        $payload = [
            'category_id' => $category->id,
            'name' => 'Pratama Wijaya',
            'phone' => '081277776666',
            'email' => 'pratama.family@example.com',
            'address' => 'Jl. Menteng Asri No. 5',
            'city' => 'Jakarta Pusat',
            'event_date' => '2026-09-25',
            'location' => 'Taman Suropati',
            'category_data' => $familyData,
        ];

        $response = $this->post('/form-klien', $payload);
        $response->assertRedirect();

        $project = Project::where('category_id', $category->id)
            ->whereHas('client', function ($q) {
                $q->where('phone', '081277776666');
            })
            ->latest('id')
            ->first();

        $this->assertNotNull($project);
        $this->assertIsArray($project->category_data);
        $this->assertEquals('Keluarga Pratama', $project->category_data['family_name']);
        $this->assertCount(2, $project->category_data['children']);
        $this->assertEquals('Alea', $project->category_data['children'][0]['name']);
        $this->assertEquals('Raka', $project->category_data['children'][1]['name']);
    }

    public function test_project_store_and_update_with_category_data()
    {
        $user = User::factory()->create();
        $user->assignRole('Admin');
        $client = Client::create([
            'name' => 'Dimas Anggara',
            'phone' => '081233445566',
            'email' => 'dimas@nusantara.co.id',
            'city' => 'Jakarta Pusat',
            'status' => 'client',
        ]);
        $category = Category::where('slug', 'corporate')->first()
            ?? Category::firstOrCreate(['name' => 'Corporate', 'slug' => 'corporate', 'form_type' => 'corporate']);

        $corporateData = [
            'company_name' => 'PT Nusantara Digital',
            'department_division' => 'Corporate Communications',
            'event_type' => 'Annual Gala Dinner',
            'event_scale' => 'Besar (> 200 orang)',
            'documentation_purpose' => 'Annual Report & Internal Documentation',
            'pic_name' => 'Dimas Anggara',
            'pic_phone' => '081233445566',
            'pic_email' => 'dimas@nusantara.co.id',
        ];

        // 1. Create project
        $createPayload = [
            'name' => 'Corporate Gala - PT Nusantara Digital',
            'client_id' => $client->id,
            'category_id' => $category->id,
            'event_date' => '2026-12-10',
            'location' => 'Grand Ballroom Mulia',
            'price' => 15000000,
            'total_amount' => 15000000,
            'status' => 'in_progress',
            'category_data' => $corporateData,
        ];

        $response = $this->actingAs($user)->post('/projects', $createPayload);
        $response->assertRedirect();

        $project = Project::where('name', 'Corporate Gala - PT Nusantara Digital')->latest('id')->first();
        $this->assertNotNull($project);
        $this->assertIsArray($project->category_data);
        $this->assertEquals('PT Nusantara Digital', $project->category_data['company_name']);
        $this->assertEquals('Dimas Anggara', $project->category_data['pic_name']);

        // 2. View project detail
        $detailResponse = $this->actingAs($user)->get("/projects/{$project->id}");
        $detailResponse->assertStatus(200);

        // 3. View project edit
        $editResponse = $this->actingAs($user)->get("/projects/{$project->id}/edit");
        $editResponse->assertStatus(200);

        // 4. Update project with revised category_data
        $updatedData = array_merge($corporateData, [
            'pic_name' => 'Dimas Anggara (Updated)',
            'special_requirements' => 'Live Streaming and Multi-cam Setup',
        ]);

        $updatePayload = [
            'name' => 'Corporate Gala - PT Nusantara Digital (Revised)',
            'client_id' => $client->id,
            'category_id' => $category->id,
            'event_date' => '2026-12-10',
            'location' => 'Grand Ballroom Mulia Hotel',
            'price' => 17000000,
            'total_amount' => 17000000,
            'status' => 'in_progress',
            'category_data' => $updatedData,
        ];

        $updateResponse = $this->actingAs($user)->put("/projects/{$project->id}", $updatePayload);
        $updateResponse->assertRedirect();

        $project->refresh();
        $this->assertEquals('Corporate Gala - PT Nusantara Digital (Revised)', $project->name);
        $this->assertEquals('Dimas Anggara (Updated)', $project->category_data['pic_name']);
        $this->assertEquals('Live Streaming and Multi-cam Setup', $project->category_data['special_requirements']);
    }

    public function test_intake_submission_and_project_creation_for_all_remaining_categories()
    {
        $categoriesTestData = [
            'wedding' => [
                'name' => 'Wedding',
                'category_data' => [
                    'groom_name' => 'Raden Mas Arya',
                    'bride_name' => 'Dian Sastrowardoyo',
                    'akad_date' => '2026-11-20',
                    'akad_time' => '08:00 - 11:00',
                    'akad_location' => 'Masjid Raya Pondok Indah',
                    'reception_date' => '2026-11-20',
                    'reception_time' => '19:00 - 22:00',
                    'reception_location' => 'Hotel Indonesia Kempinski',
                    'wedding_organizer' => 'Aura Wedding Planner',
                    'estimated_guests' => 500,
                ],
            ],
            'prewedding' => [
                'name' => 'Prewedding',
                'category_data' => [
                    'partner_1' => 'Arya Saloka',
                    'partner_2' => 'Putri Marino',
                    'session_date' => '2026-10-15',
                    'concept_theme' => 'Cinematic Moody',
                    'session_location' => 'Kintamani Bali',
                    'outfit_wardrobe' => '2 Casual, 1 Formal',
                ],
            ],
            'commercial' => [
                'name' => 'Produk / Brand / Commercial',
                'category_data' => [
                    'commercial_purpose' => 'Katalog Website & Marketplace',
                    'product_brand_type' => 'Skincare Nature Glow',
                    'products_count' => 12,
                    'background_type' => 'White Studio Minimalist',
                    'photo_style_mood' => 'Clean & Bright Modern',
                    'photo_usage' => ['Social Media (Instagram / TikTok)', 'E-Commerce / Marketplace', 'Website / Landing Page'],
                ],
            ],
            'traveling' => [
                'name' => 'Traveling',
                'category_data' => [
                    'departure_date' => '2026-11-01',
                    'return_date' => '2026-11-08',
                    'destination_city_country' => 'Tokyo & Kyoto, Japan',
                    'travelers_count' => 2,
                    'trip_type' => 'Couple Vacation',
                    'trip_duration_days' => 8,
                    'trip_transportation' => 'Private Van / Shinkansen',
                ],
            ],
            'birthday' => [
                'name' => 'Birthday',
                'category_data' => [
                    'celebrant_name' => 'Mikaela Syafira',
                    'celebrant_age' => 17,
                    'birthday_theme' => 'Enchanted Forest Sweet 17',
                    'event_type' => 'Sweet Seventeen Party',
                    'estimated_guests' => 150,
                ],
            ],
            'engagement' => [
                'name' => 'Engagement',
                'category_data' => [
                    'groom_name' => 'Bintang Pamungkas',
                    'bride_name' => 'Nathalia Putri',
                    'engagement_date' => '2026-10-05',
                    'engagement_time' => '10:00 - 14:00',
                    'engagement_location' => 'Plataran Dharmawangsa',
                    'estimated_guests' => 80,
                    'theme_color' => 'Sage Green & Gold',
                ],
            ],
            'event' => [
                'name' => 'Event',
                'category_data' => [
                    'event_name' => 'Tech Innovation Summit 2026',
                    'event_date' => '2026-10-25',
                    'event_time_range' => '09:00 - 17:00',
                    'event_type' => 'Seminar / Conference',
                    'event_scale' => 'Skala Besar (200 - 500 orang)',
                    'event_location' => 'Jakarta Convention Center (JCC)',
                ],
            ],
            'komunitas' => [
                'name' => 'Komunitas',
                'category_data' => [
                    'community_name' => 'Komunitas Fotografi Indonesia',
                    'established_year' => 2018,
                    'community_type' => 'Hobi & Kreatif',
                    'pic_name' => 'Bambang Sudarsono',
                    'pic_phone' => '081288990011',
                    'activity_type' => 'Gathering & Hunting Foto Akbar',
                ],
            ],
            'perorangan' => [
                'name' => 'Perorangan',
                'category_data' => [
                    'photo_purpose' => 'Personal Branding & LinkedIn',
                    'session_type' => 'Studio Portrait',
                    'outfit_looks_count' => 3,
                    'session_duration' => '1 - 2 Jam (Standar)',
                    'backdrop_theme' => 'Neutral Dark Grey',
                ],
            ],
            'lainnya' => [
                'name' => 'Lainnya / Kebutuhan Khusus',
                'category_data' => [
                    'needs_description' => 'Dokumentasi Khusus Restorasi Seni & Museum',
                    'location' => 'Museum Nasional Indonesia',
                    'needs_type' => 'Dokumentasi Khusus / Non-Standar',
                    'needs_detail' => 'High resolution macro documentation of historic oil paintings',
                ],
            ],
        ];

        foreach ($categoriesTestData as $slug => $data) {
            $cat = Category::where('slug', $slug)->first()
                ?? Category::firstOrCreate(['name' => $data['name'], 'slug' => $slug, 'form_type' => $slug]);

            $randomPhone = '081' . mt_rand(10000000, 99999999);
            $payload = [
                'category_id' => $cat->id,
                'name' => 'Klien ' . $cat->name,
                'phone' => $randomPhone,
                'email' => "test.{$slug}@example.com",
                'address' => 'Jl. Pengujian No. ' . mt_rand(1, 100),
                'city' => 'Jakarta',
                'event_date' => '2026-10-10',
                'location' => 'Lokasi ' . $cat->name,
                'category_data' => $data['category_data'],
            ];

            $response = $this->post('/form-klien', $payload);
            $response->assertRedirect();

            $project = Project::where('category_id', $cat->id)
                ->whereHas('client', function ($q) use ($randomPhone) {
                    $q->where('phone', $randomPhone);
                })
                ->latest('id')
                ->first();

            $this->assertNotNull($project, "Project for category {$slug} was not created.");
            $this->assertIsArray($project->category_data, "category_data for {$slug} is not an array.");

            // Verify first key in category_data matches
            $firstKey = array_key_first($data['category_data']);
            $this->assertEquals(
                $data['category_data'][$firstKey],
                $project->category_data[$firstKey],
                "Mismatch on {$firstKey} for category {$slug}"
            );
        }
    }
}

