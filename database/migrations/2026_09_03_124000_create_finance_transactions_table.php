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
        Schema::create('finance_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('transaction_number')->unique(); // e.g. TRX-2609-0001
            $table->enum('type', ['income', 'expense'])->default('expense');
            $table->string('category'); // e.g. Sewa Studio, Konsumsi Crew, Transport, Listrik, etc.
            $table->string('title'); // Keterangan transaksi
            $table->decimal('amount', 15, 2)->default(0);
            $table->date('date');
            $table->foreignUuid('payment_method_id')->nullable()->constrained('payment_methods')->nullOnDelete();
            $table->string('reference_number')->nullable(); // No bukti / struk / kwitansi
            $table->text('notes')->nullable();
            $table->string('status')->default('completed'); // completed, pending, cancelled
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['type', 'date']);
            $table->index(['date', 'status']);
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('finance_transactions');
    }
};
