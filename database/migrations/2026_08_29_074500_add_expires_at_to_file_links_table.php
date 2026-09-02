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
        Schema::table('file_links', function (Blueprint $table) {
            $table->timestamp('expires_at')->nullable()->after('size');
            $table->boolean('is_hidden')->default(false)->after('expires_at');

            $table->index(['expires_at', 'is_hidden']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('file_links', function (Blueprint $table) {
            $table->dropIndex(['expires_at', 'is_hidden']);
            $table->dropColumn(['expires_at', 'is_hidden']);
        });
    }
};
