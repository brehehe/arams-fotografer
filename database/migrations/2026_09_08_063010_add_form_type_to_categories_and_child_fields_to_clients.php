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
        if (Schema::hasTable('categories') && !Schema::hasColumn('categories', 'form_type')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->string('form_type')->default('standard')->after('workflow_type');
            });
        }

        if (Schema::hasTable('clients')) {
            Schema::table('clients', function (Blueprint $table) {
                if (!Schema::hasColumn('clients', 'child_name')) {
                    $table->string('child_name')->nullable()->after('partner_name');
                }
                if (!Schema::hasColumn('clients', 'child_birth_date')) {
                    $table->date('child_birth_date')->nullable()->after('child_name');
                }
                if (!Schema::hasColumn('clients', 'child_gender')) {
                    $table->string('child_gender')->nullable()->after('child_birth_date');
                }
            });
        }

        // Initialize default form_type for existing categories
        \Illuminate\Support\Facades\DB::table('categories')
            ->where(function ($q) {
                $q->whereIn('slug', ['wedding', 'prewedding'])
                    ->orWhereRaw('LOWER(name) LIKE ?', ['%wedding%']);
            })
            ->update(['form_type' => 'wedding']);

        \Illuminate\Support\Facades\DB::table('categories')
            ->where(function ($q) {
                $q->where('slug', 'newborn')
                    ->orWhereRaw('LOWER(name) LIKE ?', ['%newborn%']);
            })
            ->update(['form_type' => 'newborn']);

        \Illuminate\Support\Facades\DB::table('categories')
            ->whereNull('form_type')
            ->orWhere('form_type', '')
            ->update(['form_type' => 'standard']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('categories') && Schema::hasColumn('categories', 'form_type')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->dropColumn('form_type');
            });
        }

        if (Schema::hasTable('clients')) {
            Schema::table('clients', function (Blueprint $table) {
                $columns = [];
                if (Schema::hasColumn('clients', 'child_name')) $columns[] = 'child_name';
                if (Schema::hasColumn('clients', 'child_birth_date')) $columns[] = 'child_birth_date';
                if (Schema::hasColumn('clients', 'child_gender')) $columns[] = 'child_gender';
                if (!empty($columns)) {
                    $table->dropColumn($columns);
                }
            });
        }
    }
};
