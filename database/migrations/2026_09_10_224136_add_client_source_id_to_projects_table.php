<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->uuid('client_source_id')->nullable()->after('client_id');
            $table->foreign('client_source_id')
                ->references('id')
                ->on('client_sources')
                ->nullOnDelete();
            $table->index('client_source_id');
        });

        // Sync existing projects with their client's client_source_id
        $clientsWithSource = DB::table('clients')
            ->whereNotNull('client_source_id')
            ->pluck('client_source_id', 'id');

        foreach ($clientsWithSource as $clientId => $sourceId) {
            DB::table('projects')
                ->where('client_id', $clientId)
                ->whereNull('client_source_id')
                ->update(['client_source_id' => $sourceId]);
        }
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign(['client_source_id']);
            $table->dropColumn('client_source_id');
        });
    }
};
