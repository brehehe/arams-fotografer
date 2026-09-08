<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('setting pages render correctly for authenticated users', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/setting/admin');
    $response->assertStatus(200);

    $response = $this->actingAs($user)->get('/setting/form-klien');
    $response->assertStatus(200);

    $response = $this->actingAs($user)->get('/setting/portal-klien');
    $response->assertStatus(200);
});

test('legacy settings query parameters redirect to separated routes', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/settings?tab=form_klien');
    $response->assertRedirect(route('setting.form-klien'));

    $response = $this->actingAs($user)->get('/settings?tab=portal_klien');
    $response->assertRedirect(route('setting.portal-klien'));

    $response = $this->actingAs($user)->get('/settings?tab=admin');
    $response->assertRedirect(route('setting.admin'));

    $response = $this->actingAs($user)->get('/setting');
    $response->assertRedirect(route('setting.admin'));
});
