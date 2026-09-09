<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('projects', 'category_data')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->json('category_data')->nullable()->after('custom_timeline');
            });
        }

        // Ensure Engagement category exists
        $engagementExists = DB::table('categories')->where('slug', 'engagement')->exists();
        if (!$engagementExists) {
            DB::table('categories')->insert([
                'id' => (string) Str::uuid(),
                'name' => 'Engagement',
                'slug' => 'engagement',
                'description' => 'Dokumentasi momen lamaran dan pertunangan spesial.',
                'icon' => 'HeartHandshake',
                'color' => '#E11D48',
                'status' => 'active',
                'sort_order' => 7,
                'workflow_type' => 'wedding',
                'form_type' => 'engagement',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Map form_type for all known categories to match their slug
        $slugToFormType = [
            'maternity' => 'maternity',
            'lainnya' => 'lainnya',
            'perorangan' => 'perorangan',
            'prewedding' => 'prewedding',
            'commercial' => 'commercial',
            'traveling' => 'traveling',
            'wedding' => 'wedding',
            'birthday' => 'birthday',
            'corporate' => 'corporate',
            'engagement' => 'engagement',
            'event' => 'event',
            'family' => 'family',
            'komunitas' => 'komunitas',
            'newborn' => 'newborn',
        ];

        foreach ($slugToFormType as $slug => $formType) {
            DB::table('categories')
                ->where('slug', $slug)
                ->update(['form_type' => $formType]);
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('projects', 'category_data')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropColumn('category_data');
            });
        }
    }
};
