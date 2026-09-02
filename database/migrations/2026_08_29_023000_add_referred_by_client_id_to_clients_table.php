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
            if (!Schema::hasColumn('clients', 'referred_by_client_id')) {
                $table->foreignUuid('referred_by_client_id')->nullable()->after('source')->constrained('clients')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            if (Schema::hasColumn('clients', 'referred_by_client_id')) {
                $table->dropForeign(['referred_by_client_id']);
                $table->dropColumn('referred_by_client_id');
            }
        });
    }
};
