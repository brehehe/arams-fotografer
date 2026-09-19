<?php

namespace App\Http\Controllers;

use Aliziodev\IndonesiaRegions\Models\IndonesiaRegion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RegionController extends Controller
{
    /**
     * Get list of Indonesian provinces (top-level 2-digit codes).
     */
    public function provinces(): JsonResponse
    {
        $driver = DB::connection()->getDriverName();

        $query = IndonesiaRegion::query()->orderBy('name');

        if ($driver === 'pgsql') {
            $query->whereRaw("code ~ '^[0-9]{2}$'");
        } elseif ($driver === 'sqlite') {
            $query->whereRaw("code NOT LIKE '%.%' AND length(code) = 2");
        } else {
            $query->whereRaw("code REGEXP '^[0-9]{2}$'");
        }

        $provinces = $query->get(['code', 'name'])
            ->map(fn ($r) => ['code' => $r->code, 'name' => $r->name]);

        return response()->json($provinces);
    }

    /**
     * Get cascading child regions for a given parent region code.
     */
    public function children(Request $request): JsonResponse
    {
        $parentCode = $request->query('parent_code', '');
        if (empty($parentCode)) {
            return response()->json([]);
        }

        $driver = DB::connection()->getDriverName();
        $query = IndonesiaRegion::query()->orderBy('name');

        if ($driver === 'pgsql') {
            $pattern = '^' . preg_quote($parentCode, '/') . '\.[0-9]+$';
            $query->whereRaw('code ~ ?', [$pattern]);
        } elseif ($driver === 'sqlite') {
            $prefix = $parentCode . '.';
            $prefixLen = strlen($prefix);
            $query->where('code', 'LIKE', "{$prefix}%")
                ->whereRaw("instr(substr(code, ?), '.') = 0", [$prefixLen + 1]);
        } else {
            $pattern = '^' . preg_quote($parentCode, '/') . '\.[0-9]+$';
            $query->whereRaw('code REGEXP ?', [$pattern]);
        }

        $children = $query->get(['code', 'name', 'postal_code'])
            ->map(fn ($r) => [
                'code' => $r->code,
                'name' => $r->name,
                'postal_code' => $r->postal_code,
            ]);

        return response()->json($children);
    }
}
