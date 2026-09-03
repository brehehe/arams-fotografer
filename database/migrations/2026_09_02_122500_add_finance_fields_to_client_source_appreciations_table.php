<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('client_source_appreciations', function (Blueprint $table) {
            $table->foreignUuid('payment_method_id')
                ->nullable()
                ->after('amount')
                ->constrained('payment_methods')
                ->nullOnDelete();
            $table->string('finance_reference')->nullable()->after('payment_method_id')->index();
            $table->boolean('is_recorded_in_finance')->default(true)->after('finance_reference');
        });
    }

    public function down(): void
    {
        Schema::table('client_source_appreciations', function (Blueprint $table) {
            $table->dropForeign(['payment_method_id']);
            $table->dropColumn(['payment_method_id', 'finance_reference', 'is_recorded_in_finance']);
        });
    }
};
