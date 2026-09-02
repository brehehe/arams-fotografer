<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wedding_organizers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('pic_name')->nullable();
            $table->string('phone')->nullable()->index();
            $table->string('secondary_phone')->nullable();
            $table->string('email')->nullable()->index();
            $table->string('instagram')->nullable();
            $table->string('city')->nullable()->index();
            $table->text('address')->nullable();
            $table->decimal('commission_rate', 5, 2)->default(0); // in percentage or fixed
            $table->string('tier')->default('silver'); // platinum, gold, silver, bronze
            $table->string('status')->default('active'); // active, partner, lead, inactive
            $table->text('notes')->nullable();
            $table->string('avatar')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_account_holder')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'created_at']);
            $table->index('name');
        });

        // Add wedding_organizer_id to projects if projects table exists
        if (Schema::hasTable('projects') && !Schema::hasColumn('projects', 'wedding_organizer_id')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->foreignUuid('wedding_organizer_id')->nullable()->after('client_id')->constrained('wedding_organizers')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('projects') && Schema::hasColumn('projects', 'wedding_organizer_id')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropForeign(['wedding_organizer_id']);
                $table->dropColumn('wedding_organizer_id');
            });
        }

        Schema::dropIfExists('wedding_organizers');
    }
};
