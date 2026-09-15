<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Project;
use App\Services\SpreadsheetTransferService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SpreadsheetTransferController extends Controller
{
    public function __construct(private readonly SpreadsheetTransferService $transfers) {}

    public function exportClients(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', Client::class);
        activity()->causedBy($request->user())->event('clients_exported')->log('Data klien diekspor ke CSV');

        return $this->transfers->exportClientsCsv($request);
    }

    public function exportProjects(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', Project::class);
        activity()->causedBy($request->user())->event('projects_exported')->log('Data project diekspor ke CSV');

        return $this->transfers->exportProjectsCsv($request);
    }

    public function clientTemplate(Request $request): StreamedResponse
    {
        $this->authorize('create', Client::class);

        return $this->transfers->downloadClientTemplate();
    }

    public function projectTemplate(Request $request): StreamedResponse
    {
        $this->authorize('create', Project::class);

        return $this->transfers->downloadProjectTemplate();
    }

    public function importClients(Request $request): RedirectResponse
    {
        $this->authorize('create', Client::class);
        $request->validate(['file' => ['required', 'file', 'mimes:xlsx', 'max:10240']]);
        $result = $this->transfers->importClients($request->file('file'), $request->user());
        activity()->causedBy($request->user())->event('clients_imported')->withProperties($result)->log('Data klien diimpor dari Excel');

        return back()->with('success', "{$result['clients']} klien berhasil diimpor.");
    }

    public function importProjects(Request $request): RedirectResponse
    {
        $this->authorize('create', Project::class);
        $request->validate(['file' => ['required', 'file', 'mimes:xlsx', 'max:10240']]);
        $result = $this->transfers->importProjects($request->file('file'), $request->user());
        activity()->causedBy($request->user())->event('projects_imported')->withProperties($result)->log('Data project diimpor dari Excel');

        return back()->with('success', "{$result['projects']} project berhasil diimpor.");
    }
}
