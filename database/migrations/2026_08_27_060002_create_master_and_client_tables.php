<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->default('Folder');
            $table->string('color')->default('#3B82F6');
            $table->string('status')->default('active'); // active, inactive
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'sort_order']);
            $table->index('name');
        });

        Schema::create('clients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email')->nullable()->index();
            $table->string('phone')->nullable()->index();
            $table->string('city')->nullable()->index();
            $table->text('address')->nullable();
            $table->string('source')->nullable(); // Instagram, Website, Referral, Walk-in, etc.
            $table->string('status')->default('active'); // active, completed, lead
            $table->text('notes')->nullable();
            $table->string('avatar')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'created_at']);
            $table->index('name');
        });

        Schema::create('services', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category_id', 'status']);
        });

        Schema::create('packages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('category_id')->constrained('categories')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('base_price', 15, 2)->default(0);
            $table->integer('duration_hours')->default(2);
            $table->json('included_services')->nullable();
            $table->json('included_deliverables')->nullable();
            $table->string('status')->default('active');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category_id', 'status']);
            $table->index(['status', 'sort_order']);
        });

        Schema::create('addons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2)->default(0);
            $table->string('unit')->default('item'); // item, hour, person, photo
            $table->string('status')->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category_id', 'status']);
        });

        Schema::create('payment_methods', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name'); // Transfer BCA, Mandiri, Cash, QRIS
            $table->string('code')->unique();
            $table->string('account_number')->nullable();
            $table->string('account_holder')->nullable();
            $table->string('icon')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
        });

        Schema::create('note_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('content');
            $table->string('type')->default('project'); // project, client, invoice, quotation
            $table->string('status')->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('note_templates');
        Schema::dropIfExists('payment_methods');
        Schema::dropIfExists('addons');
        Schema::dropIfExists('packages');
        Schema::dropIfExists('services');
        Schema::dropIfExists('clients');
        Schema::dropIfExists('categories');
    }
};
