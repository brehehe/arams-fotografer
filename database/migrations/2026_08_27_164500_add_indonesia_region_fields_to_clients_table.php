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
            $table->string('province')->nullable()->after('city');
            $table->string('district')->nullable()->after('province');
            $table->string('village')->nullable()->after('district');
            $table->string('province_code')->nullable()->after('postal_code');
            $table->string('city_code')->nullable()->after('province_code');
            $table->string('district_code')->nullable()->after('city_code');
            $table->string('village_code')->nullable()->after('district_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn([
                'province',
                'district',
                'village',
                'province_code',
                'city_code',
                'district_code',
                'village_code',
            ]);
        });
    }
};
