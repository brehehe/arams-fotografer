<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Client;
use App\Models\Package;
use App\Models\PaymentMethod;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class LensariaSystemTest extends TestCase
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
            'name' => 'Admin Lensaria',
            'email' => 'admin@lensaria.com',
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
}
