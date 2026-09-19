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
        // 1. users table index
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'client_id')) {
                $table->index('client_id');
            }
        });

        // 2. clients table indexes
        Schema::table('clients', function (Blueprint $table) {
            if (Schema::hasColumn('clients', 'wedding_organizer_id')) {
                $table->index('wedding_organizer_id');
            }
            if (Schema::hasColumn('clients', 'referred_by_client_id')) {
                $table->index('referred_by_client_id');
            }
            if (Schema::hasColumn('clients', 'category_id')) {
                $table->index('category_id');
            }
        });

        // 3. projects table indexes
        Schema::table('projects', function (Blueprint $table) {
            if (Schema::hasColumn('projects', 'wedding_organizer_id')) {
                $table->index('wedding_organizer_id');
            }
        });

        // 4. finance_transactions table indexes
        if (Schema::hasTable('finance_transactions')) {
            Schema::table('finance_transactions', function (Blueprint $table) {
                if (Schema::hasColumn('finance_transactions', 'payment_method_id')) {
                    $table->index('payment_method_id');
                }
                if (Schema::hasColumn('finance_transactions', 'created_by')) {
                    $table->index('created_by');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'client_id')) {
                $table->dropIndex(['client_id']);
            }
        });

        Schema::table('clients', function (Blueprint $table) {
            if (Schema::hasColumn('clients', 'wedding_organizer_id')) {
                $table->dropIndex(['wedding_organizer_id']);
            }
            if (Schema::hasColumn('clients', 'referred_by_client_id')) {
                $table->dropIndex(['referred_by_client_id']);
            }
            if (Schema::hasColumn('clients', 'category_id')) {
                $table->dropIndex(['category_id']);
            }
        });

        Schema::table('projects', function (Blueprint $table) {
            if (Schema::hasColumn('projects', 'wedding_organizer_id')) {
                $table->dropIndex(['wedding_organizer_id']);
            }
        });

        if (Schema::hasTable('finance_transactions')) {
            Schema::table('finance_transactions', function (Blueprint $table) {
                if (Schema::hasColumn('finance_transactions', 'payment_method_id')) {
                    $table->dropIndex(['payment_method_id']);
                }
                if (Schema::hasColumn('finance_transactions', 'created_by')) {
                    $table->dropIndex(['created_by']);
                }
            });
        }
    }
};
