<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Project;
use App\Models\Setting;
use App\Services\BackupService;
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
        protected SettingService $settingService,
        protected BackupService $backupService
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
        if (in_array($tab, ['company', 'general', 'appearance', 'login_theme', 'backup', 'recommended_packages'])) {
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
        $packages = \App\Models\Package::with('category')
            ->where('status', 'active')
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('settings/Admin', [
            'settings' => $data['settings'],
            'settingsMap' => $data['settingsMap'],
            'backups' => $this->backupService->getBackupsList(),
            'packages' => $packages,
            'sub' => $sub ?: 'company',
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
        $signatureFile = $request->hasFile('invoice_signature_image')
            ? $request->file('invoice_signature_image')
            : ($request->hasFile('company_signature') ? $request->file('company_signature') : null);

        $this->settingService->updateSettings($settings, $logoFile, auth()->user(), $signatureFile);

        return redirect()->back()->with('success', 'Pengaturan berhasil disimpan.');
    }

    public function runBackup(Request $request): RedirectResponse
    {
        $type = $request->input('type', 'full'); // 'full' or 'db'
        $result = $this->backupService->runBackup($type, auth()->user());

        if ($result['success']) {
            return redirect()->back()->with('success', $result['message']);
        }

        return redirect()->back()->with('error', $result['message']);
    }

    public function downloadBackup(Request $request, ?string $filename = null)
    {
        $filename = $filename ?? $request->query('filename');

        if (! $filename) {
            $backups = $this->backupService->getBackupsList();
            if (empty($backups)) {
                return redirect()->back()->with('error', 'Belum ada arsip backup yang tersedia.');
            }
            $filename = $backups[0]['filename'];
        }

        return $this->backupService->downloadBackup($filename);
    }

    public function deleteBackup(string $filename): RedirectResponse
    {
        $deleted = $this->backupService->deleteBackup($filename, auth()->user());

        if ($deleted) {
            return redirect()->back()->with('success', "Arsip backup {$filename} berhasil dihapus.");
        }

        return redirect()->back()->with('error', "Gagal menghapus arsip backup {$filename}.");
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
