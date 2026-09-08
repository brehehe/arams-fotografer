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
            if (!Schema::hasColumn('clients', 'father_name')) {
                $table->string('father_name')->nullable()->after('child_gender');
            }
            if (!Schema::hasColumn('clients', 'mother_name')) {
                $table->string('mother_name')->nullable()->after('father_name');
            }
            if (!Schema::hasColumn('clients', 'children')) {
                $table->json('children')->nullable()->after('mother_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $columnsToDrop = [];
            if (Schema::hasColumn('clients', 'children')) {
                $columnsToDrop[] = 'children';
            }
            if (Schema::hasColumn('clients', 'mother_name')) {
                $columnsToDrop[] = 'mother_name';
            }
            if (Schema::hasColumn('clients', 'father_name')) {
                $columnsToDrop[] = 'father_name';
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
