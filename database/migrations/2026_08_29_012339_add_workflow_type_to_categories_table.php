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
        Schema::table('categories', function (Blueprint $table) {
            $table->string('workflow_type')->default('non_wedding')->after('color'); // wedding (8 steps) or non_wedding (5 steps)
        });

        // Set Wedding categories to wedding workflow
        $likeOp = \Illuminate\Support\Facades\DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';
        \Illuminate\Support\Facades\DB::table('categories')
            ->where('slug', $likeOp, '%wedding%')
            ->where('slug', 'not like', '%prewedding%')
            ->update(['workflow_type' => 'wedding']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('workflow_type');
        });
    }
};
