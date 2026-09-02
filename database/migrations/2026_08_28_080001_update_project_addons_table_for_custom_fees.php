<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_addons', function (Blueprint $table) {
            $table->foreignUuid('addon_id')->nullable()->change();
            $table->string('custom_name')->nullable()->after('addon_id');
            $table->string('unit')->default('item')->nullable()->after('qty');
            $table->text('notes')->nullable()->after('total_price');
        });
    }

    public function down(): void
    {
        Schema::table('project_addons', function (Blueprint $table) {
            $table->dropColumn(['custom_name', 'unit', 'notes']);
            $table->foreignUuid('addon_id')->nullable(false)->change();
        });
    }
};
