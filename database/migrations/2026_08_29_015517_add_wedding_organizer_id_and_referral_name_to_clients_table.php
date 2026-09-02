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
        Schema::table('clients', function (Blueprint $table) {
            $table->foreignUuid('wedding_organizer_id')
                ->nullable()
                ->after('source')
                ->constrained('wedding_organizers')
                ->nullOnDelete();
            $table->string('referral_name')->nullable()->after('wedding_organizer_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropForeign(['wedding_organizer_id']);
            $table->dropColumn(['wedding_organizer_id', 'referral_name']);
        });
    }
};
