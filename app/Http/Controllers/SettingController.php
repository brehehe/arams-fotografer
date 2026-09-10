<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Project;
use App\Models\Setting;
use App\Services\SettingService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SettingController extends Controller
{
    public function __construct(
        protected SettingService $settingService
    ) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $tab = $request->input('tab');
        if ($tab === 'form_klien' || $tab === 'form-klien') {
            return redirect()->route('setting.form-klien');
        }
        if ($tab === 'portal_klien' || $tab === 'portal-klien') {
            return redirect()->route('setting.portal-klien');
        }

        $params = [];
        if ($tab === 'portfolio_categories' || $request->input('sub') === 'portfolio_categories') {
            return redirect()->route('master-data.portfolio-categories.index');
        }
        if ($tab === 'portfolios' || $request->input('sub') === 'portfolios') {
            return redirect()->route('master-data.portfolios.index');
        }
        if (in_array($tab, ['company', 'general', 'appearance', 'login_theme', 'backup'])) {
            $params['sub'] = $tab;
        } elseif ($request->has('sub')) {
            $params['sub'] = $request->input('sub');
        }

        return redirect()->route('setting.admin', $params);
    }

    public function admin(Request $request): Response|RedirectResponse
    {
        $sub = $request->input('sub');
        if ($sub === 'portfolio_categories') {
            return redirect()->route('master-data.portfolio-categories.index');
        }
        if ($sub === 'portfolios') {
            return redirect()->route('master-data.portfolios.index');
        }
        if ($sub === 'promo_slides') {
            return redirect()->route('master-data.promo-slides.index');
        }
        if ($sub === 'testimonials') {
            return redirect()->route('master-data.testimonials.index');
        }
        if ($sub === 'instagram_posts') {
            return redirect()->route('master-data.instagram-posts.index');
        }

        $data = $this->settingService->getSettingsData();

        return Inertia::render('settings/Admin', [
            'settings' => $data['settings'],
            'settingsMap' => $data['settingsMap'],
        ]);
    }

    public function formKlien(): Response
    {
        $data = $this->settingService->getSettingsData();

        return Inertia::render('settings/FormKlien', [
            'settings' => $data['settings'],
            'settingsMap' => $data['settingsMap'],
        ]);
    }

    public function portalKlien(): Response
    {
        $data = $this->settingService->getSettingsData();

        return Inertia::render('settings/PortalKlien', [
            'settings' => $data['settings'],
            'settingsMap' => $data['settingsMap'],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $settings = $request->input('settings', []);
        $logoFile = $request->hasFile('company_logo') ? $request->file('company_logo') : null;

        $this->settingService->updateSettings($settings, $logoFile, auth()->user());

        return redirect()->back()->with('success', 'Pengaturan dan logo berhasil disimpan.');
    }

    public function backupDownload(): StreamedResponse
    {
        activity()
            ->causedBy(auth()->user())
            ->event('backup_created')
            ->log('Database snapshot backup berhasil diunduh');

        $data = [
            'app' => 'Arams Photography Management System',
            'version' => '1.0.0',
            'exported_at' => Carbon::now()->toIso8601String(),
            'exported_by' => auth()->user()?->name ?? 'Admin',
            'settings' => Setting::all(),
            'clients' => Client::all(),
            'projects' => Project::with(['client', 'category', 'package'])->get(),
            'payments' => Payment::all(),
            'invoices' => Invoice::all(),
        ];

        $filename = 'arams_backup_' . date('Y-m-d_His') . '.json';

        return response()->streamDownload(function () use ($data) {
            echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        }, $filename, [
            'Content-Type' => 'application/json',
        ]);
    }

    public function exportData(string $type): StreamedResponse
    {
        activity()
            ->causedBy(auth()->user())
            ->event('data_exported')
            ->log("Data {$type} berhasil diexport ke CSV");

        $filename = "arams_{$type}_" . date('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($type) {
            $handle = fopen('php://output', 'w');

            if ($type === 'clients') {
                fputcsv($handle, ['ID', 'Nama', 'Email', 'Telepon', 'Kota', 'Alamat', 'Sumber', 'Status', 'Dibuat']);
                Client::chunk(100, function ($clients) use ($handle) {
                    foreach ($clients as $c) {
                        fputcsv($handle, [
                            $c->id,
                            $c->name,
                            $c->email,
                            $c->phone,
                            $c->city,
                            $c->address,
                            $c->source,
                            $c->status,
                            $c->created_at?->format('Y-m-d H:i'),
                        ]);
                    }
                });
            } elseif ($type === 'projects') {
                fputcsv($handle, ['ID', 'No Project', 'Nama Project', 'Klien', 'Kategori', 'Status', 'Progres (%)', 'Tanggal Event', 'Deadline', 'Total Biaya', 'Terbayar']);
                Project::with(['client', 'category'])->chunk(100, function ($projects) use ($handle) {
                    foreach ($projects as $p) {
                        fputcsv($handle, [
                            $p->id,
                            $p->project_number,
                            $p->name,
                            $p->client?->name,
                            $p->category?->name,
                            $p->status,
                            $p->progress,
                            $p->event_date?->format('Y-m-d'),
                            $p->deadline?->format('Y-m-d'),
                            $p->total_amount,
                            $p->paid_amount,
                        ]);
                    }
                });
            } elseif ($type === 'payments') {
                fputcsv($handle, ['ID', 'No Pembayaran', 'Project ID', 'Klien ID', 'Jumlah (IDR)', 'Metode ID', 'No Referensi', 'Status', 'Tanggal']);
                Payment::chunk(100, function ($payments) use ($handle) {
                    foreach ($payments as $pay) {
                        fputcsv($handle, [
                            $pay->id,
                            $pay->payment_number,
                            $pay->project_id,
                            $pay->client_id,
                            $pay->amount,
                            $pay->payment_method_id,
                            $pay->reference_number,
                            $pay->status,
                            $pay->payment_date?->format('Y-m-d'),
                        ]);
                    }
                });
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
