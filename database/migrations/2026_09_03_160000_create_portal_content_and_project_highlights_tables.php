<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Promo Slides (Banner hero carousel promo untuk client portal)
        Schema::create('promo_slides', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('tag')->default('SPECIAL OFFER');
            $table->text('description')->nullable();
            $table->string('button_text')->default('Lihat Promo Selengkapnya');
            $table->string('button_url')->nullable()->default('/form-klien');
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Testimonials (Ulasan & testimoni klien)
        Schema::create('testimonials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->foreignUuid('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->string('client_name');
            $table->string('package_name')->nullable();
            $table->unsignedTinyInteger('rating')->default(5);
            $table->text('comment');
            $table->string('avatar')->nullable();
            $table->date('event_date')->nullable();
            $table->boolean('is_featured')->default(true)->index();
            $table->string('status')->default('approved')->index(); // approved, pending, rejected
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. Instagram Posts (Feed & foto kurasi Instagram studio)
        Schema::create('instagram_posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('image_url');
            $table->text('caption')->nullable();
            $table->string('post_url')->nullable();
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->string('media_type')->default('photo'); // photo, video, reel, carousel
            $table->boolean('is_active')->default(true)->index();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        // 4. Project Highlights (Foto & video highlight kurasi per project)
        Schema::create('project_highlights', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->string('image_url');
            $table->text('caption')->nullable();
            $table->string('media_type')->default('photo');
            $table->boolean('is_cover')->default(false)->index();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_highlights');
        Schema::dropIfExists('instagram_posts');
        Schema::dropIfExists('testimonials');
        Schema::dropIfExists('promo_slides');
    }
};
