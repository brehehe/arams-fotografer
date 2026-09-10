<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    public function index(Request $request): Response
    {
        $year = (int) $request->input('year', now()->year);
        $data = $this->reportService->getAnnualReport($year);

        return Inertia::render('Reports/Index', $data);
    }

    /**
     * Export report sections to CSV.
     * ?type=all|categories|packages|referrals|team|projects|finance|wo|payment_status
     */
    public function export(Request $request): StreamedResponse
    {
        $year  = (int) $request->input('year', now()->year);
        $type  = $request->input('type', 'all');
        $data  = $this->reportService->getAnnualReport($year);

        $filename = "laporan-studio-{$type}-{$year}-" . now()->format('Ymd') . '.csv';

        return response()->streamDownload(function () use ($data, $type, $year) {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM for Excel compatibility
            fwrite($handle, "\xEF\xBB\xBF");

            if ($type === 'all' || $type === 'summary') {
                fputcsv($handle, ["=== RINGKASAN STUDIO {$year} ==="]);
                fputcsv($handle, ['Metrik', 'Nilai']);
                fputcsv($handle, ['Total Kas Masuk (Lunas)', $data['summary']['revenue']]);
                fputcsv($handle, ['Total Nilai Kontrak', $data['summary']['total_contract_value']]);
                fputcsv($handle, ['Total Terbayar (Project)', $data['summary']['total_paid']]);
                fputcsv($handle, ['Piutang Outstanding', $data['summary']['total_outstanding']]);
                fputcsv($handle, ['Total Project', $data['summary']['projects']]);
                fputcsv($handle, ['Project Selesai', $data['summary']['completed']]);
                fputcsv($handle, ['Klien Baru', $data['summary']['new_clients']]);
                fputcsv($handle, ['Completion Rate (%)', $data['summary']['completion_rate']]);
                fputcsv($handle, ['Rata-rata Nilai Project', $data['summary']['avg_project_value']]);
                fputcsv($handle, ['Pertumbuhan Pendapatan (%)', $data['summary']['revenue_growth']]);
                fputcsv($handle, []);
            }

            if ($type === 'all' || $type === 'categories') {
                fputcsv($handle, ["=== PERFORMA KATEGORI LAYANAN {$year} ==="]);
                fputcsv($handle, ['No', 'Kategori', 'Jumlah Project', 'Total Nilai (IDR)', 'Total Terbayar (IDR)', 'Kontribusi (%)']);
                foreach ($data['categories_report'] as $i => $cat) {
                    fputcsv($handle, [
                        $i + 1,
                        $cat['name'],
                        $cat['projects_count'],
                        $cat['projects_sum_total_amount'],
                        $cat['projects_sum_paid_amount'],
                        $cat['percentage'],
                    ]);
                }
                fputcsv($handle, []);
            }

            if ($type === 'all' || $type === 'packages') {
                fputcsv($handle, ["=== PERFORMA PAKET LAYANAN {$year} ==="]);
                fputcsv($handle, ['No', 'Nama Paket', 'Kategori', 'Jumlah Booking', 'Total Revenue (IDR)', 'Rata-rata Deal (IDR)', 'Kontribusi (%)']);
                foreach ($data['packages_report'] as $i => $pkg) {
                    fputcsv($handle, [
                        $i + 1,
                        $pkg['name'],
                        $pkg['category_name'],
                        $pkg['projects_count'],
                        $pkg['total_revenue'],
                        $pkg['avg_deal'],
                        $pkg['percentage'],
                    ]);
                }
                fputcsv($handle, []);
            }

            if ($type === 'all' || $type === 'sources' || $type === 'wo') {
                fputcsv($handle, ["=== SUMBER KLIEN & REFERRAL {$year} ==="]);
                fputcsv($handle, ['No', 'Sumber Klien', 'Tipe', 'Total Klien', 'Total Booking', 'Total Revenue (IDR)', 'Kontribusi (%)']);
                foreach ($data['referrals_report'] as $i => $src) {
                    fputcsv($handle, [
                        $i + 1,
                        $src['source_name'],
                        $src['source_type_label'] ?? $src['source_type'] ?? '-',
                        $src['client_count'],
                        $src['project_count'],
                        $src['total_revenue'],
                        $src['percentage'],
                    ]);
                }
                fputcsv($handle, []);
            }

            if ($type === 'all' || $type === 'referrals') {
                fputcsv($handle, ["=== SUMBER LEAD & REFERRAL KLIEN {$year} ==="]);
                fputcsv($handle, ['No', 'Sumber Referral', 'Jumlah Klien', 'Jumlah Project', 'Total Nilai Project (IDR)', 'Total Terbayar (IDR)', 'Kontribusi (%)']);
                foreach ($data['referrals_report'] as $i => $ref) {
                    fputcsv($handle, [
                        $i + 1,
                        $ref['source_name'],
                        $ref['client_count'],
                        $ref['project_count'],
                        $ref['total_revenue'],
                        $ref['total_paid'],
                        $ref['percentage'],
                    ]);
                }
                fputcsv($handle, []);
            }

            if ($type === 'all' || $type === 'team') {
                fputcsv($handle, ["=== PRODUKTIVITAS TIM STUDIO {$year} ==="]);
                fputcsv($handle, ['No', 'Nama', 'Jabatan', 'Project Foto', 'Foto Selesai', 'Project Edit', 'Edit Selesai', 'Total Assigned', 'Total Selesai', 'Completion Rate (%)']);
                foreach ($data['team_report'] as $i => $member) {
                    fputcsv($handle, [
                        $i + 1,
                        $member['name'],
                        $member['role'],
                        $member['photo_count'],
                        $member['photo_completed_count'],
                        $member['edit_count'],
                        $member['edit_completed_count'],
                        $member['total_assigned'],
                        $member['total_completed'],
                        $member['completion_rate'],
                    ]);
                }
                fputcsv($handle, []);
            }

            if ($type === 'all' || $type === 'payment_status') {
                fputcsv($handle, ["=== STATUS PEMBAYARAN & PIUTANG {$year} ==="]);
                fputcsv($handle, ['Status', 'Jumlah Project', 'Total Nilai Kontrak (IDR)', 'Sudah Dibayar (IDR)', 'Belum Dibayar (IDR)', 'Kontribusi (%)']);
                foreach ($data['payment_status_breakdown'] as $ps) {
                    fputcsv($handle, [
                        $ps['label'],
                        $ps['count'],
                        $ps['total_amount'],
                        $ps['paid_amount'],
                        $ps['unpaid_amount'],
                        $ps['percentage'],
                    ]);
                }
                fputcsv($handle, []);
            }

            if ($type === 'all' || $type === 'projects') {
                fputcsv($handle, ["=== TOP PROJECT TERBESAR {$year} ==="]);
                fputcsv($handle, ['No', 'No Project', 'Nama Project', 'Klien', 'Kota', 'Kategori', 'Paket', 'Tanggal Event', 'Status', 'Status Bayar', 'Total Kontrak (IDR)', 'Terbayar (IDR)']);
                foreach ($data['top_projects'] as $i => $proj) {
                    fputcsv($handle, [
                        $i + 1,
                        $proj['project_number'],
                        $proj['name'],
                        $proj['client_name'],
                        $proj['client_city'],
                        $proj['category_name'],
                        $proj['package_name'],
                        $proj['event_date'],
                        $proj['status'],
                        $proj['payment_status'],
                        $proj['total_amount'],
                        $proj['paid_amount'],
                    ]);
                }
                fputcsv($handle, []);
            }

            if ($type === 'all' || $type === 'finance') {
                fputcsv($handle, ["=== TREN PENDAPATAN BULANAN {$year} ==="]);
                fputcsv($handle, ['Bulan', 'Pendapatan Kas (IDR)', 'Jumlah Project', 'Project Selesai']);
                foreach ($data['monthly_revenue'] as $m) {
                    fputcsv($handle, [
                        $m['month'],
                        $m['revenue'],
                        $m['projects'],
                        $m['completed'],
                    ]);
                }
            }

            fclose($handle);
        }, $filename, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
