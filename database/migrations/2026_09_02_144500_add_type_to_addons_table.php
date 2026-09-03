<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('addons', function (Blueprint $table) {
            $table->string('type')->default('addon')->after('name'); // 'addon' | 'operational'
            $table->index(['type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('addons', function (Blueprint $table) {
            $table->dropIndex(['type', 'status']);
            $table->dropColumn('type');
        });
    }
};
