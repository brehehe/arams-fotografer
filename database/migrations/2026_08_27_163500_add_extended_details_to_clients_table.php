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
            $table->string('client_type')->default('personal')->after('name'); // personal, wedding, family, corporate, agency
            $table->string('partner_name')->nullable()->after('name');
            $table->string('company_name')->nullable()->after('partner_name');
            $table->string('instagram')->nullable()->after('email');
            $table->string('secondary_phone')->nullable()->after('phone');
            $table->string('preferred_contact')->default('whatsapp')->after('source'); // whatsapp, email, phone
            $table->string('postal_code')->nullable()->after('city');
            $table->json('tags')->nullable()->after('notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn([
                'client_type',
                'partner_name',
                'company_name',
                'instagram',
                'secondary_phone',
                'preferred_contact',
                'postal_code',
                'tags',
            ]);
        });
    }
};
