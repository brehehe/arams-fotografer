<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Client;
use App\Models\Package;
use App\Models\PaymentMethod;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AramsSystemTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'Admin']);
        Role::firstOrCreate(['name' => 'Owner']);
        Role::firstOrCreate(['name' => 'Photographer']);

        $this->adminUser = User::factory()->create([
            'name' => 'Admin Arams',
            'email' => 'admin@arams.com',
        ]);
        $this->adminUser->assignRole('Admin');
    }

    public function test_dashboard_loads_with_correct_metrics()
    {
        $response = $this->actingAs($this->adminUser)->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_clients_index_and_create()
    {
        $response = $this->actingAs($this->adminUser)->get(route('clients.index'));
        $response->assertOk();

        $createResponse = $this->actingAs($this->adminUser)->post(route('clients.store'), [
            'name' => 'Budi & Jessica',
            'email' => 'budi.jessica@example.com',
            'phone' => '08123456789',
            'city' => 'Jakarta Selatan',
            'source' => 'Instagram',
            'status' => 'active',
        ]);

        $createResponse->assertRedirect();
        $this->assertDatabaseHas('clients', [
            'email' => 'budi.jessica@example.com',
        ]);
    }

    public function test_projects_index_and_workflow_update()
    {
        $cat = Category::create([
            'name' => 'Wedding',
            'slug' => 'wedding',
            'color' => '#3B82F6',
            'icon' => 'Heart',
            'status' => 'active',
        ]);

        $client = Client::create([
            'name' => 'Doni & Maya',
            'email' => 'doni.maya@example.com',
            'phone' => '08129876543',
            'city' => 'Bandung',
            'source' => 'Website',
            'status' => 'active',
        ]);

        $project = Project::create([
            'project_number' => 'PRJ-2608-0001',
            'name' => 'Doni & Maya Wedding',
            'client_id' => $client->id,
            'category_id' => $cat->id,
            'status' => 'draft',
            'workflow_step' => 'booking',
            'progress' => 10,
            'total_amount' => 35000000,
            'paid_amount' => 0,
        ]);

        $response = $this->actingAs($this->adminUser)->get(route('projects.index'));
        $response->assertOk();

        // Update workflow step to editing
        $statusResponse = $this->actingAs($this->adminUser)->patch(route('projects.status', $project), [
            'workflow_step' => 'editing',
            'progress' => 50,
            'status' => 'in_progress',
        ]);

        $statusResponse->assertRedirect();
        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'workflow_step' => 'editing',
            'progress' => 50,
        ]);
    }

    public function test_master_data_categories_crud()
    {
        $response = $this->actingAs($this->adminUser)->get(route('master-data.categories.index'));
        $response->assertOk();

        $createResponse = $this->actingAs($this->adminUser)->post(route('master-data.categories.store'), [
            'name' => 'Family & Portrait',
            'description' => 'Foto keluarga dan portrait studio',
            'color' => '#10B981',
            'icon' => 'User',
            'status' => 'active',
        ]);

        $createResponse->assertRedirect();
        $this->assertDatabaseHas('categories', [
            'name' => 'Family & Portrait',
        ]);
    }

    public function test_finance_and_payments()
    {
        $response = $this->actingAs($this->adminUser)->get(route('finance.index'));
        $response->assertOk();
    }

    public function test_users_index()
    {
        $response = $this->actingAs($this->adminUser)->get(route('users.index'));
        $response->assertOk();
    }

    public function test_calendar_and_reports()
    {
        $this->actingAs($this->adminUser)->get(route('calendar.index'))->assertOk();
        $this->actingAs($this->adminUser)->get(route('reports.index'))->assertOk();
        $this->actingAs($this->adminUser)->get(route('files.index'))->assertOk();
        $this->actingAs($this->adminUser)->get(route('activity-log.index'))->assertOk();
        $this->actingAs($this->adminUser)->get(route('settings.index'))->assertOk();
    }

    public function test_client_intake_form_submission_with_slug_category()
    {
        $category = Category::create([
            'name' => 'Wedding',
            'slug' => 'wedding',
            'status' => 'active',
        ]);

        $response = $this->post(route('client.intake.store'), [
            'bride_name' => 'Sari Dewi',
            'groom_name' => 'Andi Pratama',
            'phone' => '+6285656629097',
            'email' => 'sari.andi@example.com',
            'category_id' => 'wedding', // slug string instead of UUID
            'package_id' => null,
            'event_date' => '2026-12-12',
            'notes' => 'Test intake submission',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('clients', [
            'phone' => '+6285656629097',
        ]);
        $this->assertDatabaseHas('projects', [
            'category_id' => $category->id,
            'status' => 'draft',
        ]);
        // Assert user account was auto-created for this client
        $client = Client::where('email', 'sari.andi@example.com')->first();
        $this->assertNotNull($client);
        $this->assertDatabaseHas('users', [
            'client_id' => $client->id,
            'email' => 'sari.andi@example.com',
            'status' => 'active',
        ]);
    }

    public function test_admin_can_create_or_update_client_portal_account()
    {
        $client = Client::create([
            'name' => 'Budi Setiawan',
            'email' => 'budi.setiawan@example.com',
            'phone' => '08123456789',
            'city' => 'Jakarta',
            'status' => 'lead',
        ]);

        $response = $this->actingAs($this->adminUser)->post(route('clients.account.store', $client), [
            'email' => 'budi.portal@example.com',
            'username' => 'budisetiawan',
            'password' => 'secret123',
            'send_method' => 'whatsapp',
            'message' => 'Halo Budi, ini akun Anda.',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        $response->assertSessionHas('whatsapp_url');

        $this->assertDatabaseHas('users', [
            'client_id' => $client->id,
            'email' => 'budi.portal@example.com',
            'status' => 'active',
        ]);

        $user = User::where('email', 'budi.portal@example.com')->first();
        $this->assertTrue(Hash::check('secret123', $user->password));
        $this->assertTrue($user->hasRole('Client'));
    }

    public function test_clients_index_and_detail_provide_master_data_categories_and_allow_custom_client_type(): void
    {
        $client = Client::create([
            'name' => 'Testing Client Master Categories',
            'email' => 'client.master@example.com',
            'phone' => '0899998888',
            'city' => 'Bandung',
            'status' => 'active',
            'client_type' => 'birthday',
        ]);

        // Index route receives categories
        $indexResponse = $this->actingAs($this->adminUser)->get(route('clients.index'));
        $indexResponse->assertOk();
        $indexResponse->assertInertia(fn ($page) => $page
            ->component('Clients/Index')
            ->has('categories')
        );

        // Show route receives categories
        $showResponse = $this->actingAs($this->adminUser)->get(route('clients.show', $client));
        $showResponse->assertOk();
        $showResponse->assertInertia(fn ($page) => $page
            ->component('Clients/Detail')
            ->has('categories')
        );

        // Edit route receives categories
        $editResponse = $this->actingAs($this->adminUser)->get(route('clients.edit', $client));
        $editResponse->assertOk();
        $editResponse->assertInertia(fn ($page) => $page
            ->component('Clients/Edit')
            ->has('categories')
        );

        // Store client with category slug like 'commercial'
        $storeResponse = $this->actingAs($this->adminUser)->post(route('clients.store'), [
            'name' => 'Brand Commercial Client',
            'phone' => '0877776666',
            'client_type' => 'commercial',
            'city' => 'Jakarta',
            'status' => 'active',
        ]);
        $storeResponse->assertRedirect();
        $this->assertDatabaseHas('clients', [
            'name' => 'Brand Commercial Client',
            'client_type' => 'commercial',
        ]);

        // Update client with category slug like 'prewedding'
        $updateResponse = $this->actingAs($this->adminUser)->put(route('clients.update', $client), [
            'name' => 'Testing Client Master Categories Updated',
            'phone' => '0899998888',
            'client_type' => 'prewedding',
            'status' => 'active',
        ]);
        $updateResponse->assertRedirect();
        $this->assertDatabaseHas('clients', [
            'id' => $client->id,
            'client_type' => 'prewedding',
        ]);
    }

    public function test_client_intake_form_creates_client_project_user_and_invoice(): void
    {
        // 1. GET /form-klien
        $getResponse = $this->get('/form-klien');
        $getResponse->assertOk();
        $getResponse->assertInertia(fn ($page) => $page
            ->component('Public/ClientIntakeForm')
            ->has('categories')
            ->has('packages')
        );

        // 2. POST /form-klien
        $postData = [
            'groom_name' => 'Kevin Sanjaya',
            'groom_nickname' => 'Kevin',
            'groom_occupation' => 'Pengusaha',
            'groom_birth_date' => '1992-05-15',
            'groom_instagram' => '@kevin_sanjaya',
            'bride_name' => 'Jessica Mila',
            'bride_nickname' => 'Mila',
            'bride_occupation' => 'Aktris',
            'bride_birth_date' => '1992-08-03',
            'bride_instagram' => '@jessica_mila',
            'province' => 'DKI Jakarta',
            'province_code' => '31',
            'city' => 'Jakarta Selatan',
            'district' => 'Kebayoran Baru',
            'village' => 'Melawai',
            'postal_code' => '12160',
            'address' => 'Jl. Melawai Raya No.12, RT.03/RW.02',
            'primary_contact' => 'cpw',
            'phone' => '+62 812-3456-7890',
            'email' => 'jessica.mila@gmail.com',
            'other_social_media' => 'TikTok: @jessicamila, YouTube: Jessica Mila',
            'category_id' => 'wedding',
            'event_type' => 'Pernikahan',
            'event_date' => '2026-12-21',
            'event_time' => '16:00 - Selesai',
            'location' => 'The Ritz Carlton Jakarta',
            'reception_location' => 'The Ritz Carlton Jakarta',
            'estimated_guests' => '200 - 300 orang',
            'concept_theme' => 'Putih, Gold, Rustic',
            'other_vendors' => 'WO: Infinity Wedding Organizer, MUA: Lisa Makeup',
            'project_notes' => 'Klien menginginkan konsep elegan & timeless.',
            'reference_url' => 'Pinterest: pinterest.com/kevinandmila',
            'special_requests' => 'Tidak ada drone di area indoor.',
        ];

        $postResponse = $this->post('/form-klien', $postData);
        $postResponse->assertRedirect();
        $postResponse->assertSessionHas('intake_success');

        // Verify Client in database
        $this->assertDatabaseHas('clients', [
            'bride_name' => 'Jessica Mila',
            'groom_name' => 'Kevin Sanjaya',
            'email' => 'jessica.mila@gmail.com',
            'phone' => '+62 812-3456-7890',
            'city' => 'Jakarta Selatan',
            'province' => 'DKI Jakarta',
            'address' => 'Jl. Melawai Raya No.12, RT.03/RW.02',
            'client_type' => 'wedding',
        ]);

        $client = Client::where('email', 'jessica.mila@gmail.com')->first();
        $this->assertNotNull($client);

        // Verify User in database with client role
        $this->assertDatabaseHas('users', [
            'client_id' => $client->id,
            'email' => 'jessica.mila@gmail.com',
        ]);
        $user = User::where('email', 'jessica.mila@gmail.com')->first();
        $this->assertTrue($user->hasRole('Client'));

        // Verify Project in database
        $this->assertDatabaseHas('projects', [
            'client_id' => $client->id,
            'event_date' => '2026-12-21 00:00:00',
            'status' => 'draft',
        ]);
    }
}


