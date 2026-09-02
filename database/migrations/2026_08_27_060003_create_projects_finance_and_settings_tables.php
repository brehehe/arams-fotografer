<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('project_number')->unique(); // e.g. PRJ-2506-0001
            $table->string('name'); // e.g. Andi & Sinta Wedding
            $table->foreignUuid('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignUuid('category_id')->constrained('categories')->cascadeOnDelete();
            $table->foreignUuid('package_id')->nullable()->constrained('packages')->nullOnDelete();
            $table->string('status')->default('draft'); // draft, in_progress, editing, completed, cancelled
            $table->integer('progress')->default(0); // 0 - 100 %
            $table->date('event_date')->nullable();
            $table->date('end_date')->nullable();
            $table->date('deadline')->nullable();
            $table->string('location')->nullable();
            $table->foreignUuid('photographer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('editor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('supervisor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('price', 15, 2)->default(0);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->string('payment_status')->default('unpaid'); // unpaid, partial, paid, overdue
            $table->string('thumbnail')->nullable();
            $table->text('notes')->nullable();
            $table->string('workflow_step')->default('booking'); // booking, preparation, event, editing, review, finalization, delivered, completed
            $table->timestamps();
            $table->softDeletes();

            $table->index(['client_id', 'status']);
            $table->index(['category_id', 'event_date']);
            $table->index(['status', 'deadline']);
            $table->index(['photographer_id', 'status']);
            $table->index(['editor_id', 'status']);
            $table->index('project_number');
            $table->index('payment_status');
            $table->index('workflow_step');
        });

        Schema::create('project_addons', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignUuid('addon_id')->constrained('addons')->cascadeOnDelete();
            $table->integer('qty')->default(1);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('total_price', 15, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['project_id', 'addon_id']);
        });

        Schema::create('project_schedules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('title');
            $table->date('date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('location')->nullable();
            $table->string('type')->default('shooting'); // shooting, meeting, editing, delivery
            $table->string('status')->default('scheduled'); // scheduled, completed, cancelled
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['project_id', 'date']);
            $table->index(['date', 'status']);
        });

        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('invoice_number')->unique(); // e.g. INV-2506-0001
            $table->foreignUuid('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignUuid('client_id')->constrained('clients')->cascadeOnDelete();
            $table->date('issue_date');
            $table->date('due_date');
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->decimal('remaining_amount', 15, 2)->default(0);
            $table->string('status')->default('draft'); // draft, sent, paid, overdue
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['project_id', 'client_id']);
            $table->index(['status', 'due_date']);
            $table->index('invoice_number');
            $table->index('issue_date');
        });

        Schema::create('invoice_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invoice_id')->constrained('invoices')->cascadeOnDelete();
            $table->string('description');
            $table->integer('qty')->default(1);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('invoice_id');
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('payment_number')->unique(); // e.g. PAY-2506-0001
            $table->foreignUuid('invoice_id')->nullable()->constrained('invoices')->nullOnDelete();
            $table->foreignUuid('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignUuid('client_id')->constrained('clients')->cascadeOnDelete();
            $table->decimal('amount', 15, 2)->default(0);
            $table->date('payment_date');
            $table->foreignUuid('payment_method_id')->nullable()->constrained('payment_methods')->nullOnDelete();
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('completed'); // completed, pending, failed
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['project_id', 'client_id']);
            $table->index(['payment_date', 'status']);
            $table->index('payment_number');
        });

        Schema::create('file_links', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('name');
            $table->string('file_path')->nullable();
            $table->string('drive_url')->nullable();
            $table->string('file_type')->default('link'); // link, image, zip, raw
            $table->bigInteger('size')->nullable();
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['project_id', 'file_type']);
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->default('general'); // general, company, branding, invoice, datetime
            $table->string('type')->default('string'); // string, text, json, boolean, number
            $table->string('description')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('group');
            $table->index('key');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('file_links');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('project_schedules');
        Schema::dropIfExists('project_addons');
        Schema::dropIfExists('projects');
    }
};
