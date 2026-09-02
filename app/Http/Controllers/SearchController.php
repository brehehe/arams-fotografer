<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\FileLink;
use App\Models\Invoice;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /**
     * Perform fast unified global search across Projects, Clients, Files, and Invoices.
     */
    public function globalSearch(Request $request): JsonResponse
    {
        $q = trim($request->input('q', ''));

        if (mb_strlen($q) < 2) {
            return response()->json([
                'query' => $q,
                'total' => 0,
                'results' => [
                    'projects' => [],
                    'clients' => [],
                    'files' => [],
                    'invoices' => [],
                ],
            ]);
        }

        // 1. Projects Search
        $projects = Project::with(['client', 'category'])
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('project_number', 'like', "%{$q}%")
                    ->orWhere('location', 'like', "%{$q}%")
                    ->orWhereHas('client', fn ($cq) => $cq->where('name', 'like', "%{$q}%"))
                    ->orWhereHas('category', fn ($catQ) => $catQ->where('name', 'like', "%{$q}%"));
            })
            ->limit(5)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'title' => $p->name,
                'subtitle' => "{$p->project_number} • " . ($p->client?->name ?? 'Klien') . " • " . ($p->category?->name ?? 'Foto'),
                'url' => "/projects/{$p->id}",
                'badge' => $p->status,
                'date' => $p->event_date?->format('d M Y') ?? '-',
            ]);

        // 2. Clients Search
        $clients = Client::where(function ($query) use ($q) {
            $query->where('name', 'like', "%{$q}%")
                ->orWhere('email', 'like', "%{$q}%")
                ->orWhere('phone', 'like', "%{$q}%")
                ->orWhere('city', 'like', "%{$q}%");
        })
            ->limit(5)
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'title' => $c->name,
                'subtitle' => ($c->phone ?: $c->email ?: 'Klien Studio') . ($c->city ? " • {$c->city}" : ''),
                'url' => "/clients/{$c->id}",
                'badge' => $c->status,
                'date' => $c->created_at?->format('d M Y') ?? '-',
            ]);

        // 3. Files Search
        $files = FileLink::with('project')
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('drive_url', 'like', "%{$q}%")
                    ->orWhereHas('project', fn ($pq) => $pq->where('name', 'like', "%{$q}%"));
            })
            ->limit(5)
            ->get()
            ->map(fn ($f) => [
                'id' => $f->id,
                'title' => $f->name,
                'subtitle' => "Project: " . ($f->project?->name ?? '-') . ($f->expires_at ? ($f->isExpired() ? ' • Expired' : " • Exp: {$f->expires_at->format('d M Y')}") : ''),
                'url' => $f->project_id ? "/projects/{$f->project_id}" : "/files",
                'external_url' => $f->drive_url,
                'badge' => $f->isExpired() ? 'expired' : 'active',
                'date' => $f->created_at?->format('d M Y') ?? '-',
            ]);

        // 4. Invoices Search
        $invoices = Invoice::with(['client', 'project'])
            ->where(function ($query) use ($q) {
                $query->where('invoice_number', 'like', "%{$q}%")
                    ->orWhereHas('client', fn ($cq) => $cq->where('name', 'like', "%{$q}%"))
                    ->orWhereHas('project', fn ($pq) => $pq->where('name', 'like', "%{$q}%"));
            })
            ->limit(5)
            ->get()
            ->map(fn ($inv) => [
                'id' => $inv->id,
                'title' => $inv->invoice_number,
                'subtitle' => ($inv->client?->name ?? 'Klien') . " • Rp " . number_format($inv->total, 0, ',', '.'),
                'url' => $inv->project_id ? "/projects/{$inv->project_id}" : "/finance",
                'badge' => $inv->status,
                'date' => $inv->issue_date?->format('d M Y') ?? '-',
            ]);

        $totalCount = $projects->count() + $clients->count() + $files->count() + $invoices->count();

        return response()->json([
            'query' => $q,
            'total' => $totalCount,
            'results' => [
                'projects' => $projects,
                'clients' => $clients,
                'files' => $files,
                'invoices' => $invoices,
            ],
        ]);
    }
}
