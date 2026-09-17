<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\FileLink;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Payment;
use App\Models\Project;
use App\Models\ProjectAddon;
use App\Models\ProjectHighlight;
use App\Models\ProjectSchedule;
use App\Models\PromoSlide;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Spatie\Activitylog\Models\Activity;

class CleanDummyDataCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:clean-dummy-data {--force : Eksekusi langsung tanpa konfirmasi}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Bersihkan data dummy client, project, kalender/jadwal, payment, invoice dan relasi terkait';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        if (!$this->option('force') && !$this->confirm('Apakah Anda yakin ingin menghapus SEMUA data dummy Client, Project, dan Kalender?')) {
            $this->warn('Operasi dibatalkan.');
            return 0;
        }

        $this->info('Memulai pembersihan data dummy dari database...');

        DB::transaction(function () {
            // 1. Lepas relasi project & client pada testimonial & promo slide agar landing page tetap aman
            if (class_exists(Testimonial::class)) {
                Testimonial::query()->update(['client_id' => null, 'project_id' => null]);
            }
            if (class_exists(PromoSlide::class)) {
                PromoSlide::query()->update(['project_id' => null]);
            }

            // 2. Hapus schedules / kalender
            $schedulesCount = ProjectSchedule::count();
            ProjectSchedule::query()->delete();
            $this->line("- Terhapus {$schedulesCount} jadwal kalender (project_schedules)");

            // 3. Hapus sub-relasi project
            ProjectHighlight::query()->delete();
            ProjectAddon::query()->delete();
            FileLink::query()->delete();

            // 4. Hapus invoices, invoice items, dan payments
            $itemsCount = InvoiceItem::count();
            InvoiceItem::query()->delete();

            $paymentsCount = Payment::count();
            Payment::query()->delete();

            $invoicesCount = Invoice::count();
            Invoice::query()->delete();
            $this->line("- Terhapus {$invoicesCount} invoices, {$itemsCount} items, {$paymentsCount} payments");

            // 5. Hapus semua projects (force delete agar tidak tertinggal di trash soft-delete)
            $projectsCount = Project::count();
            Project::query()->forceDelete();
            $this->line("- Terhapus {$projectsCount} projects");

            // 6. Hapus user akun dummy klien
            $clientUsers = User::whereNotNull('client_id')
                ->orWhereHas('roles', function ($q) {
                    $q->where('name', 'Client');
                })->get();

            $clientUsersCount = $clientUsers->count();
            foreach ($clientUsers as $cu) {
                $cu->delete();
            }
            $this->line("- Terhapus {$clientUsersCount} akun user dummy klien");

            // 7. Lepas self-referencing FK pada clients (referred_by_client_id)
            Client::query()->update(['referred_by_client_id' => null]);

            // 8. Hapus semua clients (force delete agar tidak tertinggal di trash soft-delete)
            $clientsCount = Client::count();
            Client::query()->forceDelete();
            $this->line("- Terhapus {$clientsCount} clients");

            // 9. Bersihkan activity log terkait project dan client
            if (class_exists(Activity::class)) {
                Activity::whereIn('subject_type', [Project::class, Client::class])
                    ->orWhere('causer_type', Client::class)
                    ->delete();
                $this->line('- Activity log terkait project & client dibersihkan');
            }
        });

        $this->newLine();
        $this->info('✓ Sukses! Seluruh data dummy client, project, dan kalender telah dibersihkan.');
        $this->info('✓ Master Data (Kategori, Layanan, Paket, Addon, Wilayah, Pengaturan, Akun Admin/Tim) tetap utuh.');

        return 0;
    }
}
