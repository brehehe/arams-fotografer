<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_sources', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('type')->default('individual'); // individual, wedding_organizer, vendor, social_media, ads, other
            $table->string('phone')->nullable()->index();
            $table->string('email')->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('active'); // active, inactive
            $table->boolean('is_primary')->default(true);
            $table->string('avatar')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['type', 'status']);
            $table->index('is_primary');
        });

        Schema::create('client_source_appreciations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('client_source_id')->constrained('client_sources')->cascadeOnDelete();
            $table->string('status')->default('given'); // given, pending
            $table->date('date')->nullable();
            $table->string('type')->default('Voucher Belanja'); // Voucher Belanja, Komisi Tunai, Hadiah, Diskon Layanan, Lainnya
            $table->decimal('amount', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['client_source_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_source_appreciations');
        Schema::dropIfExists('client_sources');
    }
};
