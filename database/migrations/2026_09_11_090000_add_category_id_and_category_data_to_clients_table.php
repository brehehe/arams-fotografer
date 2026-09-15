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
            if (!Schema::hasColumn('clients', 'category_id')) {
                $table->foreignUuid('category_id')
                    ->nullable()
                    ->after('client_type')
                    ->constrained('categories')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('clients', 'category_data')) {
                $table->json('category_data')
                    ->nullable()
                    ->after('category_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            if (Schema::hasColumn('clients', 'category_id')) {
                $table->dropForeign(['category_id']);
                $table->dropColumn('category_id');
            }

            if (Schema::hasColumn('clients', 'category_data')) {
                $table->dropColumn('category_data');
            }
        });
    }
};
