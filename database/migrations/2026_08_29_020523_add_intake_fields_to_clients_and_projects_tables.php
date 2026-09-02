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
            $table->string('bride_name')->nullable()->after('partner_name');
            $table->string('bride_nickname')->nullable()->after('bride_name');
            $table->string('groom_name')->nullable()->after('bride_nickname');
            $table->string('groom_nickname')->nullable()->after('groom_name');
            $table->date('bride_birth_date')->nullable()->after('groom_nickname');
            $table->date('groom_birth_date')->nullable()->after('bride_birth_date');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->string('event_time')->nullable()->after('event_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn([
                'bride_name',
                'bride_nickname',
                'groom_name',
                'groom_nickname',
                'bride_birth_date',
                'groom_birth_date',
            ]);
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['event_time']);
        });
    }
};
