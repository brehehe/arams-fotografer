<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->uuid('client_source_id')->nullable()->after('source');
            $table->foreign('client_source_id')
                ->references('id')
                ->on('client_sources')
                ->nullOnDelete();
            $table->index('client_source_id');
        });

        // Auto-populate client_source_id for existing records by matching source string to ClientSource.name (exact, case-insensitive)
        $clientSources = DB::table('client_sources')->whereNull('deleted_at')->get(['id', 'name']);

        foreach ($clientSources as $cs) {
            DB::table('clients')
                ->whereNull('client_source_id')
                ->whereNull('deleted_at')
                ->whereRaw('LOWER(TRIM(source)) = ?', [strtolower(trim($cs->name))])
                ->update(['client_source_id' => $cs->id]);
        }

        // Partial match: e.g. "Website" -> "Google / Website"
        foreach ($clientSources as $cs) {
            $nameLower = strtolower(trim($cs->name));
            DB::table('clients')
                ->whereNull('client_source_id')
                ->whereNull('deleted_at')
                ->whereNotNull('source')
                ->where('source', '!=', '')
                ->whereRaw(
                    "? ILIKE '%' || LOWER(TRIM(source)) || '%' OR LOWER(TRIM(source)) ILIKE '%' || ? || '%'",
                    [$nameLower, $nameLower]
                )
                ->update(['client_source_id' => $cs->id]);
        }
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropForeign(['client_source_id']);
            $table->dropIndex(['client_source_id']);
            $table->dropColumn('client_source_id');
        });
    }
};
