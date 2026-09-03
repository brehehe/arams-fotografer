<?php

namespace Database\Seeders;

use App\Models\Addon;
use App\Models\Category;
use App\Models\Client;
use App\Models\FileLink;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\NoteTemplate;
use App\Models\Package;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\Project;
use App\Models\ProjectAddon;
use App\Models\ProjectSchedule;
use App\Models\Service;
use App\Models\Setting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles & Permissions
        $permissions = [
            'dashboard.view',
            'clients.view', 'clients.create', 'clients.update', 'clients.delete', 'clients.restore',
            'projects.view', 'projects.create', 'projects.update', 'projects.delete', 'projects.restore',
            'packages.view', 'packages.create', 'packages.update', 'packages.delete',
            'addons.view', 'addons.create', 'addons.update', 'addons.delete',
            'payments.view', 'payments.create', 'payments.update', 'payments.delete',
            'invoices.view', 'invoices.create', 'invoices.update', 'invoices.delete',
            'reports.view',
            'files.view', 'files.upload', 'files.download', 'files.delete',
            'users.view', 'users.create', 'users.update', 'users.delete',
            'roles.view', 'roles.create', 'roles.update', 'roles.delete',
            'settings.view', 'settings.update',
            'activity-log.view',
            'backup.view', 'backup.create', 'backup.restore',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        $superAdminRole = Role::findOrCreate('Super Admin');
        $ownerRole = Role::findOrCreate('Owner');
        $adminRole = Role::findOrCreate('Admin');
        $photographerRole = Role::findOrCreate('Photographer');
        $editorRole = Role::findOrCreate('Editor');
        $supervisorRole = Role::findOrCreate('Supervisor');
        $clientRole = Role::findOrCreate('Client');

        $superAdminRole->syncPermissions(Permission::all());
        $ownerRole->syncPermissions(Permission::all());
        $adminRole->syncPermissions(Permission::all());
        $photographerRole->syncPermissions([
            'dashboard.view', 'projects.view', 'projects.update', 'files.view', 'files.upload', 'files.download',
        ]);
        $editorRole->syncPermissions([
            'dashboard.view', 'projects.view', 'projects.update', 'files.view', 'files.upload', 'files.download',
        ]);
        $supervisorRole->syncPermissions(Permission::all());

        // 2. Users
        $owner = User::create([
            'name' => 'Andi Pratama',
            'email' => 'andi.pratama@arams.com',
            'phone' => '0812-3456-7890',
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            'status' => 'active',
            'last_login_at' => Carbon::parse('2026-05-20 10:15:00'),
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $owner->assignRole($ownerRole);

        $photographer = User::create([
            'name' => 'Sinta Pratama',
            'email' => 'sinta.pratama@arams.com',
            'phone' => '0812-9988-7766',
            'avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
            'status' => 'active',
            'last_login_at' => Carbon::parse('2026-05-19 16:40:00'),
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $photographer->assignRole($photographerRole);

        $admin = User::create([
            'name' => 'Admin Arams',
            'email' => 'admin@arams.com',
            'phone' => '0812-1122-3344',
            'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            'status' => 'active',
            'last_login_at' => Carbon::parse('2026-05-18 09:20:00'),
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole($adminRole);

        $editor = User::create([
            'name' => 'Rian Hidayat',
            'email' => 'rian.editor@arams.com',
            'phone' => '0813-4455-6677',
            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            'status' => 'active',
            'last_login_at' => Carbon::parse('2026-05-17 14:00:00'),
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $editor->assignRole($editorRole);

        // 3. Settings
        $defaultSettings = [
            ['key' => 'company_name', 'value' => 'Arams Photography', 'group' => 'company'],
            ['key' => 'company_legal_name', 'value' => 'PT Arams Kreatif Nusantara', 'group' => 'company'],
            ['key' => 'company_tagline', 'value' => 'Capturing Moments, Creating Timeless Memories', 'group' => 'company'],
            ['key' => 'company_email', 'value' => 'hello@arams.com', 'group' => 'company'],
            ['key' => 'company_phone', 'value' => '+62 812-3456-7890', 'group' => 'company'],
            ['key' => 'company_whatsapp', 'value' => '+62 812-3456-7890', 'group' => 'company'],
            ['key' => 'company_address', 'value' => 'Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan 12190', 'group' => 'company'],
            ['key' => 'company_city', 'value' => 'Jakarta Selatan', 'group' => 'company'],
            ['key' => 'invoice_prefix', 'value' => 'INV', 'group' => 'invoice'],
            ['key' => 'invoice_format', 'value' => 'INV-{YEAR}-{MONTH}-{NUMBER}', 'group' => 'invoice'],
            ['key' => 'invoice_padding', 'value' => '4', 'group' => 'invoice'],
            ['key' => 'currency', 'value' => 'IDR', 'group' => 'datetime'],
            ['key' => 'currency_symbol', 'value' => 'Rp', 'group' => 'datetime'],
            ['key' => 'date_format', 'value' => 'DD/MM/YYYY', 'group' => 'datetime'],
            ['key' => 'timezone', 'value' => 'Asia/Jakarta', 'group' => 'datetime'],
        ];

        foreach ($defaultSettings as $setting) {
            Setting::create($setting);
        }

        // 4. Payment Methods (Metode Pembayaran)
        $bca = PaymentMethod::create([
            'name' => 'Transfer BCA',
            'code' => 'BCA',
            'account_number' => '8820192837',
            'account_holder' => 'PT Arams Kreatif Nusantara',
            'icon' => 'Building',
            'status' => 'active',
        ]);
        $mandiri = PaymentMethod::create([
            'name' => 'Transfer Mandiri',
            'code' => 'MANDIRI',
            'account_number' => '1370019283921',
            'account_holder' => 'PT Arams Kreatif Nusantara',
            'icon' => 'Building',
            'status' => 'active',
        ]);
        $bni = PaymentMethod::create([
            'name' => 'Transfer BNI',
            'code' => 'BNI',
            'account_number' => '0492817263',
            'account_holder' => 'PT Arams Kreatif Nusantara',
            'icon' => 'Building',
            'status' => 'active',
        ]);
        $bri = PaymentMethod::create([
            'name' => 'Transfer BRI',
            'code' => 'BRI',
            'account_number' => '020101002938531',
            'account_holder' => 'PT Arams Kreatif Nusantara',
            'icon' => 'Building',
            'status' => 'active',
        ]);
        $qris = PaymentMethod::create([
            'name' => 'QRIS Arams Studio',
            'code' => 'QRIS',
            'account_number' => 'NMID1029384756',
            'account_holder' => 'Arams Studio',
            'icon' => 'QrCode',
            'status' => 'active',
        ]);
        $edc = PaymentMethod::create([
            'name' => 'Kartu Debit / Kredit (EDC Studio)',
            'code' => 'EDC',
            'account_number' => 'EDC-STUDIO-01',
            'account_holder' => 'Arams Studio',
            'icon' => 'CreditCard',
            'status' => 'active',
        ]);
        $cash = PaymentMethod::create([
            'name' => 'Tunai / Cash (Kasir Studio)',
            'code' => 'CASH',
            'icon' => 'Banknote',
            'status' => 'active',
        ]);

        // 5. Note Templates (Template Catatan)
        $noteTemplatesData = [
            [
                'title' => 'Terms of Service (TOS) Wedding & Prewedding',
                'content' => "1. Booking fee (DP) minimal 30% dari total nilai paket untuk mengunci tanggal pemotretan.\n2. Pelunasan sisa tagihan wajib diselesaikan maksimal H-7 sebelum hari H acara.\n3. Hak cipta foto milik Arams Photography, klien diberikan lisensi penggunaan personal.\n4. Revisi editing maksimal 2 (dua) kali dengan catatan tertulis dalam waktu 14 hari sejak penyerahan draft.",
                'type' => 'terms_and_conditions',
                'status' => 'active',
            ],
            [
                'title' => 'Brief Pemotretan Wedding Day (Rundown & Shot List)',
                'content' => "Rundown Liputan:\n- 05:30: Sesi Makeup & Detail Gaun Pengantin Wanita\n- 07:00: First Look & Sesi Berdua bersama Pengantin Pria\n- 08:30: Prosesi Akad Nikah / Pemberkatan (Foto Sakral & Keluarga Inti)\n- 11:00: Sesi Foto Keluarga Besar (Sesuai Daftar Form Keluarga)\n- 18:30: Persiapan Resepsi Malam, Grand Entrance & Toast\n- 21:00: Lempar Bunga & After Party Moment.",
                'type' => 'project_brief',
                'status' => 'active',
            ],
            [
                'title' => 'Catatan Tambahan & Instruksi Pembayaran Invoice',
                'content' => "1. Pembayaran resmi hanya dilakukan melalui rekening atas nama PT Arams Kreatif Nusantara.\n2. Mohon cantumkan Nomor Invoice pada berita transfer.\n3. Konfirmasi bukti transfer dapat dikirimkan melalui WhatsApp Finance Studio: +62 812-3456-7890.\n4. Kwitansi dan update status pembayaran akan diterbitkan otomatis dalam 1x24 jam.",
                'type' => 'invoice_notes',
                'status' => 'active',
            ],
            [
                'title' => 'Brief Pemotretan Foto Produk & Commercial Catalog',
                'content' => "Spesifikasi Teknis:\n- Format Output: Master TIFF 300 DPI + JPEG High-Res sRGB untuk Web E-Commerce.\n- Angle Utama: Front View (0°), 45° Angle, Top-Down Flatlay, dan Macro Detail Texture.\n- Background: Seamless White Backdrop (#FFFFFF) & Styled Lifestyle Setup.\n- Retouching: Dust removal, color accuracy matching fisik produk.",
                'type' => 'project_brief',
                'status' => 'active',
            ],
            [
                'title' => 'Syarat & Ketentuan Sesi Foto Newborn & Baby',
                'content' => "1. Usia ideal bayi untuk sesi newborn adalah 5 - 14 hari saat bayi masih lelap dan lentur.\n2. Suhu ruangan studio diatur hangat steril (26-28°C) untuk kenyamanan optimal bayi.\n3. Seluruh kostum, wrap, dan properti dicuci dengan deterjen khusus bayi hypoallergenic.\n4. Ibu dianjurkan menyusui bayi 30 menit sebelum sesi dimulai agar bayi tidur lelap.",
                'type' => 'terms_and_conditions',
                'status' => 'active',
            ],
            [
                'title' => 'Kebijakan Perubahan Jadwal (Reschedule) & Pembatalan',
                'content' => "1. Pengajuan reschedule tanpa biaya tambahan dapat dilakukan maksimal H-14 sebelum jadwal semula (tergantung ketersediaan tim).\n2. Pembatalan sepihak oleh klien mengakibatkan DP yang telah dibayarkan hangus.\n3. Dalam kondisi force majeure (bencana alam, darurat medis), jadwal dapat dialihkan hingga 6 bulan ke depan.",
                'type' => 'terms_and_conditions',
                'status' => 'active',
            ],
        ];

        foreach ($noteTemplatesData as $nt) {
            NoteTemplate::create($nt);
        }

        // 6. Categories (Kategori Project)
        $categoriesData = [
            ['name' => 'Perorangan', 'slug' => 'perorangan', 'description' => 'Project untuk individu seperti personal photoshoot, profil, wisuda, dll.', 'icon' => 'User', 'color' => '#8B5CF6', 'sort_order' => 1],
            ['name' => 'Birthday', 'slug' => 'birthday', 'description' => 'Project dokumentasi ulang tahun anak maupun dewasa.', 'icon' => 'Cake', 'color' => '#EC4899', 'sort_order' => 2],
            ['name' => 'Event', 'slug' => 'event', 'description' => 'Event seperti seminar, gathering, opening, konser, dan acara lainnya.', 'icon' => 'Calendar', 'color' => '#F59E0B', 'sort_order' => 3],
            ['name' => 'Produk / Brand / Commercial', 'slug' => 'commercial', 'description' => 'Project foto produk, brand campaign, katalog, iklan, dan keperluan komersial.', 'icon' => 'Tag', 'color' => '#3B82F6', 'sort_order' => 4],
            ['name' => 'Corporate', 'slug' => 'corporate', 'description' => 'Project untuk perusahaan seperti profile company, annual report, meeting, dll.', 'icon' => 'Building2', 'color' => '#10B981', 'sort_order' => 5],
            ['name' => 'Wedding', 'slug' => 'wedding', 'description' => 'Dokumentasi pernikahan adat maupun modern secara komprehensif.', 'icon' => 'Heart', 'color' => '#3B82F6', 'sort_order' => 6],
            ['name' => 'Prewedding', 'slug' => 'prewedding', 'description' => 'Sesi foto prewedding konsep indoor studio maupun outdoor trip.', 'icon' => 'Camera', 'color' => '#6366F1', 'sort_order' => 7],
            ['name' => 'Newborn', 'slug' => 'newborn', 'description' => 'Sesi foto bayi baru lahir dengan perlengkapan aman & steril.', 'icon' => 'Baby', 'color' => '#F43F5E', 'sort_order' => 8],
            ['name' => 'Maternity', 'slug' => 'maternity', 'description' => 'Sesi foto kehamilan ibu dan keluarga dengan konsep hangat.', 'icon' => 'Smile', 'color' => '#A855F7', 'sort_order' => 9],
            ['name' => 'Lainnya (Kebutuhan khusus)', 'slug' => 'lainnya', 'description' => 'Project dengan kebutuhan khusus yang tidak termasuk kategori di atas.', 'icon' => 'MoreHorizontal', 'color' => '#64748B', 'sort_order' => 10],
        ];

        $categories = [];
        foreach ($categoriesData as $catData) {
            $categories[$catData['slug']] = Category::create($catData);
        }

        // 7. Services (Jenis Layanan)
        $servicesData = [
            ['category_id' => $categories['wedding']->id, 'name' => 'Lead Photographer (Akad & Resepsi)', 'description' => 'Fotografer utama penanggung jawab komposisi, momen sakral, dan arahan pose pengantin.', 'status' => 'active'],
            ['category_id' => $categories['wedding']->id, 'name' => 'Second Shooter (Candid & Details)', 'description' => 'Fotografer kedua fokus mengabadikan momen spontan keluarga, tamu VIP, dan detail dekorasi.', 'status' => 'active'],
            ['category_id' => $categories['wedding']->id, 'name' => 'Cinematic Wedding Videographer', 'description' => 'Videografer profesional dengan setup kamera cinema 4K, audio recorder & stabilizer gimbal.', 'status' => 'active'],
            ['category_id' => $categories['wedding']->id, 'name' => 'Drone Aerial Cinematography', 'description' => 'Pengambilan video udara venue dan outdoor dengan pilot berlisensi dan drone 4K.', 'status' => 'active'],
            ['category_id' => $categories['prewedding']->id, 'name' => 'Prewedding Concept Photographer', 'description' => 'Sesi foto konsep tematik indoor studio maupun outdoor trip dengan mood lighting.', 'status' => 'active'],
            ['category_id' => $categories['commercial']->id, 'name' => 'Commercial & Product Stylist Photographer', 'description' => 'Fotografi produk katalog, e-commerce, flatlay, dan brand marketing campaign.', 'status' => 'active'],
            ['category_id' => $categories['corporate']->id, 'name' => 'Corporate Headshot & Executive Portrait', 'description' => 'Foto profil profesional jajaran direksi, tim manajemen, dan lingkungan kerja kantor.', 'status' => 'active'],
            ['category_id' => $categories['event']->id, 'name' => 'Event & Concert Stage Photographer', 'description' => 'Dokumentasi panggung musik, konferensi, expo, dan gala dinner perusahaan.', 'status' => 'active'],
            ['category_id' => $categories['birthday']->id, 'name' => 'Birthday Party Documentary', 'description' => 'Dokumentasi pesta ulang tahun anak, sweet seventeen, dekorasi, dan games interaktif.', 'status' => 'active'],
            ['category_id' => $categories['newborn']->id, 'name' => 'Certified Newborn Baby Handler & Photographer', 'description' => 'Fotografi bayi baru lahir dengan perlengkapan steril, props lembut, dan keamanan terjamin.', 'status' => 'active'],
            ['category_id' => $categories['maternity']->id, 'name' => 'Maternity Fine Art Session', 'description' => 'Sesi foto kehamilan ibu hamil dan pasangan dengan konsep hangat dan gaun elegan.', 'status' => 'active'],
            ['category_id' => $categories['perorangan']->id, 'name' => 'Personal Studio & Graduation Session', 'description' => 'Sesi foto wisuda personal/keluarga dan personal branding di studio dengan lighting premium.', 'status' => 'active'],
        ];

        foreach ($servicesData as $srv) {
            Service::create($srv);
        }

        // 8. Packages (Paket & Harga)
        $packages = [
            'wedding_royal' => Package::create([
                'category_id' => $categories['wedding']->id,
                'name' => 'Royal Wedding Package',
                'description' => 'Full day documentation 2 Photographers + 2 Videographers + Drone',
                'base_price' => 50000000,
                'duration_hours' => 12,
                'included_services' => ['2 Main Photographers', '2 Videographers', 'Drone Pilot', 'Same Day Edit Video'],
                'included_deliverables' => ['All Edited Photos (300+)', '2 Premium Leather Albums 30x40', '1 Minute Cinematic Teaser', '5-7 Minute Highlight Film', 'Flashdisk Wooden Box'],
                'status' => 'active',
            ]),
            'wedding_premium' => Package::create([
                'category_id' => $categories['wedding']->id,
                'name' => 'Premium Wedding Package',
                'description' => 'Full day documentation 2 Photographers + 1 Videographer',
                'base_price' => 25000000,
                'duration_hours' => 10,
                'included_services' => ['2 Main Photographers', '1 Videographer'],
                'included_deliverables' => ['All Edited Photos (200+)', '1 Premium Leather Album 30x40', '3-5 Minute Highlight Film'],
                'status' => 'active',
            ]),
            'wedding_essential' => Package::create([
                'category_id' => $categories['wedding']->id,
                'name' => 'Essential Akad / Holy Matrimony',
                'description' => 'Dokumentasi prosesi akad nikah atau pemberkatan pernikahan',
                'base_price' => 15000000,
                'duration_hours' => 6,
                'included_services' => ['1 Main Photographer', '1 Videographer'],
                'included_deliverables' => ['100+ Edited Photos', '1 Velvet Album 20x30', '3 Minute Highlight Video'],
                'status' => 'active',
            ]),
            'prewedding_cinematic' => Package::create([
                'category_id' => $categories['prewedding']->id,
                'name' => 'Cinematic Prewedding Outdoor Trip',
                'description' => '1 Day Prewedding Outdoor Trip (Bromo / Bali / Jogja)',
                'base_price' => 25000000,
                'duration_hours' => 8,
                'included_services' => ['1 Photographer', '1 Videographer', 'MUA & Hairdo'],
                'included_deliverables' => ['50 Edited High-Res Photos', '1 Canvas 60x90 with Frame', '1 Minute Cinematic Teaser'],
                'status' => 'active',
            ]),
            'prewedding_studio' => Package::create([
                'category_id' => $categories['prewedding']->id,
                'name' => 'Intimate Studio Prewedding',
                'description' => 'Sesi foto prewedding konsep studio modern dengan 3 wardrobe',
                'base_price' => 12500000,
                'duration_hours' => 4,
                'included_services' => ['1 Photographer', 'Lighting Specialist'],
                'included_deliverables' => ['30 Edited High-Res Photos', '1 Canvas 50x75 with Minimalist Frame'],
                'status' => 'active',
            ]),
            'birthday_deluxe' => Package::create([
                'category_id' => $categories['birthday']->id,
                'name' => 'Birthday Deluxe Documentation',
                'description' => 'Kids / Sweet Seventeen Birthday Celebration',
                'base_price' => 8500000,
                'duration_hours' => 4,
                'included_services' => ['1 Photographer', '1 Videographer'],
                'included_deliverables' => ['All Edited Photos', '1 Mini Album 20x30', '1 Minute Reels Video'],
                'status' => 'active',
            ]),
            'commercial_campaign' => Package::create([
                'category_id' => $categories['commercial']->id,
                'name' => 'Brand Campaign & Lookbook',
                'description' => 'Full Production Commercial Photoshoot with creative directing',
                'base_price' => 75000000,
                'duration_hours' => 16,
                'included_services' => ['Lead Commercial Photographer', 'Lighting Specialist', 'Digital Tech Assistant', 'Color Grading Master'],
                'included_deliverables' => ['40 Master Retouched Commercial Assets', 'Full Copyright License', 'High-Res TIFF & Web Deliverables'],
                'status' => 'active',
            ]),
            'commercial_catalog' => Package::create([
                'category_id' => $categories['commercial']->id,
                'name' => 'E-Commerce & Product Catalog',
                'description' => 'Sesi foto katalog produk studio 50 SKU',
                'base_price' => 18000000,
                'duration_hours' => 6,
                'included_services' => ['Product Stylist Photographer'],
                'included_deliverables' => ['150 Clean White-Backdrop Images', 'Web Ready Deliverables'],
                'status' => 'active',
            ]),
            'corporate_event' => Package::create([
                'category_id' => $categories['corporate']->id,
                'name' => 'Corporate Annual Gathering & Summit',
                'description' => 'Documentation for Corporate Summit & Gala Dinner',
                'base_price' => 40000000,
                'duration_hours' => 8,
                'included_services' => ['2 Event Photographers', '1 Videographer', 'Live Photo Booth Stream'],
                'included_deliverables' => ['Fast Turnaround (24 Hours)', 'All High-Res Edited Photos', 'Aftermovie 3 Minutes'],
                'status' => 'active',
            ]),
            'corporate_headshot' => Package::create([
                'category_id' => $categories['corporate']->id,
                'name' => 'Executive Headshot & Profile Company',
                'description' => 'Foto profil direksi, komisaris, dan suasana kantor',
                'base_price' => 20000000,
                'duration_hours' => 6,
                'included_services' => ['Portrait Photographer', 'Mobile Studio Lighting Setup'],
                'included_deliverables' => ['30 Retouched Executive Portraits', 'High-Res TIFF & JPG'],
                'status' => 'active',
            ]),
            'newborn_session' => Package::create([
                'category_id' => $categories['newborn']->id,
                'name' => 'Newborn Sweet Dream Fine Art',
                'description' => 'Home / Studio Newborn Session with certified props',
                'base_price' => 15000000,
                'duration_hours' => 3,
                'included_services' => ['Newborn Specialist Photographer', 'Baby Handler Assistant'],
                'included_deliverables' => ['25 Fine Art Retouched Photos', '1 Fine Art Velvet Album 20x20', '5 Framed Mini Prints'],
                'status' => 'active',
            ]),
            'maternity_session' => Package::create([
                'category_id' => $categories['maternity']->id,
                'name' => 'Maternity Golden Glow Studio',
                'description' => 'Sesi foto kehamilan konsep natural dan gaun mewah',
                'base_price' => 9500000,
                'duration_hours' => 3,
                'included_services' => ['Maternity Photographer', 'MUA & Hairdo'],
                'included_deliverables' => ['20 Retouched Photos', '1 Acrylic Frame 30x45', 'Flashdisk Box'],
                'status' => 'active',
            ]),
            'personal_graduation' => Package::create([
                'category_id' => $categories['perorangan']->id,
                'name' => 'Personal & Graduation Studio Portrait',
                'description' => 'Sesi foto wisuda dan personal branding studio',
                'base_price' => 4500000,
                'duration_hours' => 2,
                'included_services' => ['Studio Photographer'],
                'included_deliverables' => ['15 Retouched Photos', '1 Canvas 40x60 with Frame'],
                'status' => 'active',
            ]),
            'event_concert' => Package::create([
                'category_id' => $categories['event']->id,
                'name' => 'Music Festival & Public Event Coverage',
                'description' => 'Dokumentasi festival musik, panggung expo, dan launching event',
                'base_price' => 35000000,
                'duration_hours' => 8,
                'included_services' => ['2 Stage Photographers', '1 Videographer'],
                'included_deliverables' => ['All Live Stage Photos', '3 Minute Highlight Video', 'Real-Time Social Media Live Content'],
                'status' => 'active',
            ]),
        ];

        // 9. Addons
        $addonList = [
            Addon::create(['category_id' => $categories['wedding']->id, 'name' => 'Additional Photographer', 'description' => 'Extra second shooter for wide & candid angles', 'price' => 2500000, 'unit' => 'person', 'status' => 'active']),
            Addon::create(['category_id' => $categories['wedding']->id, 'name' => 'Drone Aerial 4K Video', 'description' => 'Certified pilot with DJI Mavic 3 Pro', 'price' => 3000000, 'unit' => 'item', 'status' => 'active']),
            Addon::create(['category_id' => $categories['wedding']->id, 'name' => 'Same Day Edit Video (SDE)', 'description' => 'Video highlight edited and shown during wedding reception', 'price' => 3500000, 'unit' => 'item', 'status' => 'active']),
            Addon::create(['category_id' => $categories['wedding']->id, 'name' => 'Premium Leather Album 30x40', 'description' => 'Handcrafted flush-mount album with crystal glass cover', 'price' => 2500000, 'unit' => 'item', 'status' => 'active']),
            Addon::create(['category_id' => null, 'name' => 'Extra Shooting Hour', 'description' => 'Overtime fee per additional hour on location', 'price' => 1000000, 'unit' => 'hour', 'status' => 'active']),
        ];

        // 10. Clients (42 Total)
        $clientAndi = Client::create([
            'name' => 'Andi Pratama',
            'email' => 'andipratama@email.com',
            'phone' => '0812-3456-7890',
            'city' => 'Jakarta Selatan',
            'address' => 'Jl. Senayan Residences No. 12, Kebayoran Baru',
            'source' => 'Instagram',
            'status' => 'active',
            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        ]);

        $clientBudi = Client::create([
            'name' => 'Budi Santoso',
            'email' => 'budi.santoso@email.com',
            'phone' => '0812-9876-5432',
            'city' => 'Bandung',
            'address' => 'Jl. Dago Asri No. 88, Coblong',
            'source' => 'Website',
            'status' => 'active',
            'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        ]);

        $clientDewi = Client::create([
            'name' => 'Dewi Lestari',
            'email' => 'dewi.lestari@email.com',
            'phone' => '0813-1111-2222',
            'city' => 'Surabaya',
            'address' => 'CitraLand Cluster Bukit Golf No. 15',
            'source' => 'Referral',
            'status' => 'completed',
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        ]);

        $clientRika = Client::create([
            'name' => 'Rika Ayu',
            'email' => 'rikaayu@email.com',
            'phone' => '0812-5555-6666',
            'city' => 'Yogyakarta',
            'address' => 'Jl. Kaliurang KM 9, Sleman',
            'source' => 'Instagram',
            'status' => 'active',
            'avatar' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        ]);

        $clientFajar = Client::create([
            'name' => 'Fajar Nugroho',
            'email' => 'fajar.nugroho@email.com',
            'phone' => '0812-7777-8888',
            'city' => 'Jakarta Utara',
            'address' => 'Pantai Indah Kapuk, Cluster Ebony No. 22',
            'source' => 'Walk-in',
            'status' => 'completed',
            'avatar' => 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
        ]);

        $clientMajuJaya = Client::create([
            'name' => 'PT. Maju Jaya',
            'email' => 'contact@majujaya.co.id',
            'phone' => '021-1234-5678',
            'city' => 'Jakarta Pusat',
            'address' => 'Menara Sudirman Lt. 28, Jl. Jend. Sudirman Kav 60',
            'source' => 'Website',
            'status' => 'active',
            'avatar' => 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
        ]);

        $clientRoberts = Client::create([
            'name' => 'Roberts Family',
            'email' => 'roberts@family.com',
            'phone' => '0811-2233-4455',
            'city' => 'Jakarta Selatan',
            'address' => 'Pondok Indah Bukit Hijau No. 7',
            'source' => 'Referral',
            'status' => 'completed',
            'avatar' => 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=150&auto=format&fit=crop&q=80',
        ]);

        $clientGlowcare = Client::create([
            'name' => 'GlowCare Indonesia',
            'email' => 'marketing@glowcare.id',
            'phone' => '0821-9988-1122',
            'city' => 'Jakarta Barat',
            'address' => 'Grand Puri Niaga Blok B No. 10',
            'source' => 'Instagram',
            'status' => 'completed',
            'avatar' => 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150&auto=format&fit=crop&q=80',
        ]);

        $clientWanderlust = Client::create([
            'name' => 'Wanderlust ID',
            'email' => 'hello@wanderlust.id',
            'phone' => '0813-8877-6655',
            'city' => 'Bali',
            'address' => 'Canggu Coastal Road No. 8',
            'source' => 'Website',
            'status' => 'active',
            'avatar' => 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=150&auto=format&fit=crop&q=80',
        ]);

        $clientTechnova = Client::create([
            'name' => 'TechNova Indonesia',
            'email' => 'contact@technova.id',
            'phone' => '021-9988-7766',
            'city' => 'Jakarta Selatan',
            'address' => 'SCBD Treasury Tower Lt. 15',
            'source' => 'Referral',
            'status' => 'active',
            'avatar' => 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&auto=format&fit=crop&q=80',
        ]);

        // Demo Intake Form Client — data ini persis sama dengan dummy di ClientIntakeForm.tsx
        // Digunakan sebagai data demo/testing form pengisian oleh staf
        $clientKevinJessica = Client::create([
            'name'            => 'Kevin & Jessica',
            'bride_name'      => 'Jessica Mila',
            'bride_nickname'  => 'Mila',
            'groom_name'      => 'Kevin Sanjaya',
            'groom_nickname'  => 'Kevin',
            'instagram'       => '@jessica_mila', // instagram CPW
            'email'           => 'jessica.mila@gmail.com',
            'phone'           => '+62 812-3456-7890',
            'city'            => 'Jakarta Selatan',
            'province'        => 'DKI Jakarta',
            'province_code'   => '31',
            'address'         => 'Jl. Melawai Raya No.12, RT.03/RW.02',
            'postal_code'     => '12160',
            'source'          => 'Instagram',
            'status'          => 'active',
            'notes'           => 'Klien menginginkan konsep elegan & timeless. Request outdoor photo session di venue. Tidak ada drone di area indoor.',
            'avatar'          => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        ]);

        for ($i = 11; $i <= 42; $i++) {
            Client::create([
                'name' => "Klien Eksklusif {$i}",
                'email' => "client{$i}@example.com",
                'phone' => '0812-'.rand(1000, 9999).'-'.rand(1000, 9999),
                'city' => ['Jakarta Selatan', 'Bandung', 'Surabaya', 'Bali', 'Semarang', 'Medan'][rand(0, 5)],
                'source' => ['Instagram', 'Website', 'Referral', 'Walk-in'][rand(0, 3)],
                'status' => rand(0, 10) > 3 ? 'active' : 'completed',
            ]);
        }

        // 11. Projects (Primary Featured Projects)
        $p1 = Project::create([
            'project_number' => 'PRJ-2506-0001',
            'name' => 'Andi & Sinta Wedding',
            'client_id' => $clientAndi->id,
            'category_id' => $categories['wedding']->id,
            'package_id' => $packages['wedding_royal']->id,
            'status' => 'in_progress',
            'progress' => 68,
            'event_date' => Carbon::parse('2026-06-15'),
            'end_date' => Carbon::parse('2026-06-16'),
            'deadline' => Carbon::now()->addDays(3),
            'location' => 'The Westin Grand Ballroom, Jakarta',
            'photographer_id' => $photographer->id,
            'editor_id' => $owner->id,
            'supervisor_id' => $admin->id,
            'price' => 50000000,
            'discount' => 0,
            'tax' => 0,
            'total_amount' => 50000000,
            'paid_amount' => 40000000,
            'payment_status' => 'partial',
            'thumbnail' => 'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&auto=format&fit=crop&q=80',
            'workflow_step' => 'editing',
            'notes' => 'Konsep adat Jawa modern, dokumentasi akad jam 08:00 dan resepsi malam 19:00.',
        ]);

        $inv1 = Invoice::create([
            'invoice_number' => 'INV-2506-0001',
            'project_id' => $p1->id,
            'client_id' => $clientAndi->id,
            'issue_date' => Carbon::parse('2026-05-01'),
            'due_date' => Carbon::parse('2026-06-05'),
            'subtotal' => 50000000,
            'discount' => 0,
            'tax' => 0,
            'total' => 50000000,
            'paid_amount' => 40000000,
            'remaining_amount' => 10000000,
            'status' => 'draft',
            'notes' => 'Pembayaran termin 1 (DP 40jt) telah diterima.',
        ]);

        Payment::create([
            'payment_number' => 'PAY-2505-0001',
            'invoice_id' => $inv1->id,
            'project_id' => $p1->id,
            'client_id' => $clientAndi->id,
            'amount' => 40000000,
            'payment_date' => Carbon::parse('2026-05-02'),
            'payment_method_id' => $bca->id,
            'reference_number' => 'BCA-TRX-98218273',
            'notes' => 'DP 80% Wedding Photography Package',
            'status' => 'completed',
            'created_by' => $admin->id,
        ]);

        // Project 2: Budi & Lestari Prewedding
        $p2 = Project::create([
            'project_number' => 'PRJ-2505-0002',
            'name' => 'Budi & Lestari Prewedding',
            'client_id' => $clientBudi->id,
            'category_id' => $categories['prewedding']->id,
            'package_id' => $packages['prewedding_cinematic']->id,
            'status' => 'completed',
            'progress' => 100,
            'event_date' => Carbon::parse('2026-05-12'),
            'deadline' => Carbon::parse('2026-05-20'),
            'location' => 'Gunung Bromo & Lautan Pasir',
            'photographer_id' => $photographer->id,
            'price' => 25000000,
            'total_amount' => 25000000,
            'paid_amount' => 25000000,
            'payment_status' => 'paid',
            'thumbnail' => 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=300&auto=format&fit=crop&q=80',
            'workflow_step' => 'completed',
            'notes' => 'Sesi sunrise di Penanjakan 1 Bromo, foto berkuda dan savana.',
        ]);

        $inv2 = Invoice::create([
            'invoice_number' => 'INV-2505-0002',
            'project_id' => $p2->id,
            'client_id' => $clientBudi->id,
            'issue_date' => Carbon::parse('2026-05-01'),
            'due_date' => Carbon::parse('2026-05-10'),
            'subtotal' => 25000000,
            'total' => 25000000,
            'paid_amount' => 25000000,
            'remaining_amount' => 0,
            'status' => 'paid',
        ]);

        Payment::create([
            'payment_number' => 'PAY-2505-0002',
            'invoice_id' => $inv2->id,
            'project_id' => $p2->id,
            'client_id' => $clientBudi->id,
            'amount' => 25000000,
            'payment_date' => Carbon::parse('2026-05-05'),
            'payment_method_id' => $mandiri->id,
            'reference_number' => 'MDR-TRX-10293847',
            'notes' => 'Pelunasan 100% Prewedding Trip Bromo',
            'status' => 'completed',
            'created_by' => $admin->id,
        ]);

        // Project 3: Ulang Tahun Keira (Birthday)
        $p3 = Project::create([
            'project_number' => 'PRJ-2503-0007',
            'name' => 'Ulang Tahun Keira',
            'client_id' => $clientDewi->id,
            'category_id' => $categories['birthday']->id,
            'package_id' => $packages['birthday_deluxe']->id,
            'status' => 'in_progress',
            'progress' => 30,
            'event_date' => Carbon::parse('2026-08-05'),
            'end_date' => Carbon::parse('2026-08-05'),
            'deadline' => Carbon::now()->addDays(3),
            'location' => 'Sheraton Grand Gandaria City',
            'photographer_id' => $photographer->id,
            'price' => 8500000,
            'total_amount' => 8500000,
            'paid_amount' => 8500000,
            'payment_status' => 'paid',
            'thumbnail' => 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&auto=format&fit=crop&q=80',
            'workflow_step' => 'preparation',
        ]);

        Invoice::create([
            'invoice_number' => 'INV-2503-0007',
            'project_id' => $p3->id,
            'client_id' => $clientDewi->id,
            'issue_date' => Carbon::parse('2026-03-15'),
            'due_date' => Carbon::parse('2026-03-25'),
            'subtotal' => 8500000,
            'total' => 8500000,
            'paid_amount' => 8500000,
            'remaining_amount' => 0,
            'status' => 'paid',
        ]);

        // Project 4: Family Roberts (Newborn & Family)
        $p4 = Project::create([
            'project_number' => 'PRJ-2505-0015',
            'name' => 'Family Roberts Newborn Session',
            'client_id' => $clientRoberts->id,
            'category_id' => $categories['newborn']->id,
            'package_id' => $packages['newborn_session']->id,
            'status' => 'completed',
            'progress' => 100,
            'event_date' => Carbon::parse('2026-07-28'),
            'deadline' => Carbon::parse('2026-05-25'),
            'location' => 'Arams Studio Senopati',
            'photographer_id' => $photographer->id,
            'price' => 15000000,
            'total_amount' => 15000000,
            'paid_amount' => 15000000,
            'payment_status' => 'paid',
            'thumbnail' => 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&auto=format&fit=crop&q=80',
            'workflow_step' => 'completed',
        ]);

        // Project 5: Company Event PT. Maju (Corporate)
        $p5 = Project::create([
            'project_number' => 'PRJ-2504-0005',
            'name' => 'Company Event PT. Maju',
            'client_id' => $clientMajuJaya->id,
            'category_id' => $categories['corporate']->id,
            'package_id' => $packages['corporate_event']->id,
            'status' => 'in_progress',
            'progress' => 60,
            'event_date' => Carbon::parse('2026-04-18'),
            'deadline' => Carbon::now()->addDays(8),
            'location' => 'Ritz Carlton Pacific Place Ballroom',
            'photographer_id' => $photographer->id,
            'editor_id' => $owner->id,
            'price' => 40000000,
            'total_amount' => 40000000,
            'paid_amount' => 30000000,
            'payment_status' => 'partial',
            'thumbnail' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&auto=format&fit=crop&q=80',
            'workflow_step' => 'editing',
        ]);

        Invoice::create([
            'invoice_number' => 'INV-2504-0005',
            'project_id' => $p5->id,
            'client_id' => $clientMajuJaya->id,
            'issue_date' => Carbon::parse('2026-04-18'),
            'due_date' => Carbon::parse('2026-05-18'),
            'subtotal' => 40000000,
            'total' => 40000000,
            'paid_amount' => 30000000,
            'remaining_amount' => 10000000,
            'status' => 'sent',
        ]);

        // Project 6: Skincare Brand Campaign (Commercial)
        $p6 = Project::create([
            'project_number' => 'PRJ-2504-0010',
            'name' => 'Skincare Brand Campaign GlowCare',
            'client_id' => $clientGlowcare->id,
            'category_id' => $categories['commercial']->id,
            'package_id' => $packages['commercial_campaign']->id,
            'status' => 'in_progress',
            'progress' => 75,
            'event_date' => Carbon::parse('2026-04-20'),
            'end_date' => Carbon::parse('2026-04-22'),
            'deadline' => Carbon::now()->addDays(10),
            'location' => 'Studio 45 Menteng',
            'photographer_id' => $photographer->id,
            'price' => 75000000,
            'total_amount' => 75000000,
            'paid_amount' => 75000000,
            'payment_status' => 'paid',
            'thumbnail' => 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80',
            'workflow_step' => 'editing',
        ]);

        Invoice::create([
            'invoice_number' => 'INV-2504-0010',
            'project_id' => $p6->id,
            'client_id' => $clientGlowcare->id,
            'issue_date' => Carbon::parse('2026-04-20'),
            'due_date' => Carbon::parse('2026-05-05'),
            'subtotal' => 75000000,
            'total' => 75000000,
            'paid_amount' => 75000000,
            'remaining_amount' => 0,
            'status' => 'paid',
        ]);

        // Project 7: Bromo Open Trip (Event)
        $p7 = Project::create([
            'project_number' => 'PRJ-2505-0008',
            'name' => 'Bromo Open Trip Adventure',
            'client_id' => $clientWanderlust->id,
            'category_id' => $categories['event']->id,
            'package_id' => $packages['event_concert']->id,
            'status' => 'in_progress',
            'progress' => 45,
            'event_date' => Carbon::parse('2026-05-10'),
            'end_date' => Carbon::parse('2026-05-12'),
            'deadline' => Carbon::now()->addDays(14),
            'location' => 'Bromo Tengger Semeru',
            'photographer_id' => $photographer->id,
            'price' => 25000000,
            'total_amount' => 25000000,
            'paid_amount' => 10000000,
            'payment_status' => 'partial',
            'thumbnail' => 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&auto=format&fit=crop&q=80',
            'workflow_step' => 'event',
        ]);

        // Project 8: Product Launch Event (Event)
        $p8 = Project::create([
            'project_number' => 'PRJ-2503-0003',
            'name' => 'TechNova Product Launch Summit',
            'client_id' => $clientTechnova->id,
            'category_id' => $categories['event']->id,
            'package_id' => $packages['event_concert']->id,
            'status' => 'in_progress',
            'progress' => 30,
            'event_date' => Carbon::parse('2026-03-02'),
            'deadline' => Carbon::now()->addDays(20),
            'location' => 'Fairmont Ballroom Jakarta',
            'photographer_id' => $photographer->id,
            'price' => 60000000,
            'total_amount' => 60000000,
            'paid_amount' => 30000000,
            'payment_status' => 'partial',
            'thumbnail' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=300&auto=format&fit=crop&q=80',
            'workflow_step' => 'preparation',
        ]);

        // Additional Projects across all remaining categories to populate all stats
        $currentTotal = 298500000;
        $currentPaid  = 233500000;
        $targetTotal  = 1245000000;
        $targetPaid   = 945000000;
        $extraCount   = 24;

        $extraStatuses = array_merge(
            array_fill(0, 8,  'completed'),
            array_fill(0, 12, 'in_progress'),
            array_fill(0, 4,  'draft')
        );

        $extraCategories = [
            'wedding', 'wedding', 'wedding', 'wedding', 'wedding',
            'prewedding', 'prewedding', 'prewedding',
            'event', 'event',
            'newborn', 'newborn',
            'maternity', 'maternity',
            'perorangan', 'perorangan',
            'birthday',
            'commercial',
            'corporate',
            'lainnya',
            'wedding', 'prewedding', 'event', 'maternity'
        ];

        $usedTotal = 0;
        $usedPaid  = 0;
        $projIdx = 9;
        $clientList = Client::pluck('id')->toArray();

        for ($ei = 0; $ei < $extraCount; $ei++) {
            $status   = $extraStatuses[$ei];
            $catSlug  = $extraCategories[$ei];
            $progress = $status === 'completed' ? 100 : ($status === 'draft' ? 0 : rand(30, 80));

            if ($ei === $extraCount - 1) {
                $price = $targetTotal - $currentTotal - $usedTotal;
                $paid  = $status === 'completed' ? $price : ($status === 'draft' ? 0 : max(0, $targetPaid - $currentPaid - $usedPaid));
            } else {
                $price = (int) round(($targetTotal - $currentTotal) / $extraCount);
                if ($status === 'completed') {
                    $paid = $price;
                } elseif ($status === 'draft') {
                    $paid = 0;
                } else {
                    $paid = (int) round(($targetPaid - $currentPaid) / $extraCount * 0.85);
                }
            }

            $paid = min($price, max(0, $paid));
            $usedTotal += $price;
            $usedPaid  += $paid;

            $proj = Project::create([
                'project_number' => sprintf('PRJ-26%02d-%04d', ($projIdx % 12) + 1, $projIdx),
                'name'           => sprintf('Project %s #%d', ucfirst($catSlug), $ei + 1),
                'client_id'      => $clientList[array_rand($clientList)],
                'category_id'    => $categories[$catSlug]->id,
                'status'         => $status,
                'progress'       => $progress,
                'event_date'     => Carbon::now()->subDays(rand(0, 60)),
                'deadline'       => Carbon::now()->addDays(rand(3, 45)),
                'location'       => 'Jakarta & Sekitarnya',
                'photographer_id' => $photographer->id,
                'editor_id'      => $owner->id,
                'price'          => $price,
                'total_amount'   => $price,
                'paid_amount'    => $paid,
                'payment_status' => $paid >= $price ? 'paid' : ($paid > 0 ? 'partial' : 'unpaid'),
                'workflow_step'  => $status === 'completed' ? 'completed' : ($status === 'draft' ? 'booking' : 'editing'),
            ]);

            $projIdx++;
        }

        // Monthly Payments for 2026 financial distribution
        $monthlyRemaining = [
            1  => 15000000,
            2  => 25000000,
            3  => 45000000,
            4  => 75000000,
            5  => 90000000,
            6  => 85000000,
            7  => 110000000,
            8  => 135000000,
            9  => 145000000,
            10 => 105000000,
            11 => 40000000,
            12 => 10000000,
        ];

        $payIdx = 3;
        foreach ($monthlyRemaining as $monthNum => $amount) {
            if ($amount > 0) {
                Payment::create([
                    'payment_number'   => sprintf('PAY-26%02d-%04d', $monthNum, $payIdx),
                    'project_id'       => $p1->id,
                    'client_id'        => $clientAndi->id,
                    'amount'           => $amount,
                    'payment_date'     => Carbon::create(2026, $monthNum, 15),
                    'payment_method_id' => $bca->id,
                    'reference_number' => 'REF-PAY-' . rand(100000, 999999),
                    'status'           => 'completed',
                    'created_by'       => $admin->id,
                ]);
                $payIdx++;
            }
        }

        // 12. Files (FileLinks)
        $fileLinksData = [
            [
                'project_id' => $p1->id,
                'name' => 'Master High-Res Photos (Google Drive)',
                'drive_url' => 'https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ',
                'file_type' => 'google_drive',
                'size' => 15800000000,
                'created_by' => $photographer->id,
            ],
            [
                'project_id' => $p1->id,
                'name' => 'Raw 4K Cinema Footage & Drone (Dropbox)',
                'drive_url' => 'https://www.dropbox.com/sh/arams/wedding-andi-sinta-raw',
                'file_type' => 'dropbox',
                'size' => 64200000000,
                'created_by' => $photographer->id,
            ],
            [
                'project_id' => $p2->id,
                'name' => 'Final Retouched Bromo Outdoor Trip (Google Drive)',
                'drive_url' => 'https://drive.google.com/drive/folders/1bCdEfGhIjKlMnOpQrStUvWxYz',
                'file_type' => 'google_drive',
                'size' => 8400000000,
                'created_by' => $owner->id,
            ],
            [
                'project_id' => $p3->id,
                'name' => 'Birthday Photos & Reels Video (OneDrive)',
                'drive_url' => 'https://1drv.ms/f/s!AmAramsBirthdayKeira',
                'file_type' => 'onedrive',
                'size' => 4500000000,
                'created_by' => $photographer->id,
            ],
            [
                'project_id' => $p4->id,
                'name' => 'Family Roberts Portrait Deliverables (Google Drive)',
                'drive_url' => 'https://drive.google.com/drive/folders/1cDeFgHiJkLmNoPqRsTuVwXyZa',
                'file_type' => 'google_drive',
                'size' => 5200000000,
                'created_by' => $admin->id,
            ],
            [
                'project_id' => $p5->id,
                'name' => 'Company Event PT. Maju Highlights (Google Drive)',
                'drive_url' => 'https://drive.google.com/drive/folders/1eFgHiJkLmNoPqRsTuVwXyZabC',
                'file_type' => 'google_drive',
                'size' => 12400000000,
                'created_by' => $admin->id,
            ],
            [
                'project_id' => $p6->id,
                'name' => 'GlowCare Campaign Master TIFF Assets (Google Drive)',
                'drive_url' => 'https://drive.google.com/drive/folders/1dEfGhIjKlMnOpQrStUvWxYzAb',
                'file_type' => 'google_drive',
                'size' => 28500000000,
                'created_by' => $owner->id,
            ],
            [
                'project_id' => $p7->id,
                'name' => 'Bromo Adventure Raw & Teaser (Dropbox)',
                'drive_url' => 'https://www.dropbox.com/sh/technova/summit-gathering-2026',
                'file_type' => 'dropbox',
                'size' => 19200000000,
                'created_by' => $admin->id,
            ],
        ];

        foreach ($fileLinksData as $fl) {
            FileLink::create($fl);
        }

        // Demo project — Kevin & Jessica Wedding (dari dummy form)
        $pKevinJessica = Project::create([
            'project_number'  => 'PRJ-2512-0099',
            'name'            => 'Kevin & Jessica Wedding',
            'client_id'       => $clientKevinJessica->id,
            'category_id'     => $categories['wedding']->id,
            'package_id'      => $packages['wedding_royal']->id,
            'status'          => 'draft',
            'progress'        => 5,
            'event_date'      => Carbon::parse('2025-12-21'),
            'location'        => 'The Ritz Carlton Jakarta (Akad & Resepsi)',
            'photographer_id' => $photographer->id,
            'editor_id'       => $owner->id,
            'supervisor_id'   => $admin->id,
            'price'           => 50000000,
            'discount'        => 0,
            'tax'             => 0,
            'total_amount'    => 50000000,
            'paid_amount'     => 0,
            'payment_status'  => 'unpaid',
            'thumbnail'       => 'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&auto=format&fit=crop&q=80',
            'workflow_step'   => 'booking',
            'notes'           => "Konsep: Putih, Gold, Rustic. Est. tamu 200-300 orang.\nWO: Infinity Wedding Organizer, MUA: Lisa Makeup, Dekorasi: Bloom Decor.\nRef: pinterest.com/kevinandmila, @thebridestory, @weddingku.",
        ]);

        $invKevinJessica = Invoice::create([
            'invoice_number'   => 'INV-2512-0099',
            'project_id'       => $pKevinJessica->id,
            'client_id'        => $clientKevinJessica->id,
            'issue_date'       => Carbon::parse('2025-09-01'),
            'due_date'         => Carbon::parse('2025-12-01'),
            'subtotal'         => 50000000,
            'discount'         => 0,
            'tax'              => 0,
            'total'            => 50000000,
            'paid_amount'      => 0,
            'remaining_amount' => 50000000,
            'status'           => 'draft',
            'notes'            => 'Invoice awal — menunggu konfirmasi DP booking fee.',
        ]);

        InvoiceItem::create([
            'invoice_id'  => $invKevinJessica->id,
            'description' => $packages['wedding_royal']->name . ' — ' . $packages['wedding_royal']->description,
            'qty'         => 1,
            'unit_price'  => 50000000,
            'total'       => 50000000,
        ]);

        // 13. Activity Logs
        activity()
            ->causedBy($admin)
            ->performedOn($p1)
            ->event('status_change')
            ->createdAt(Carbon::now()->subMinutes(10))
            ->log('Admin mengubah status project Andi & Sinta Wedding menjadi Proses Editing Photo');

        activity()
            ->causedBy($owner)
            ->performedOn($p2)
            ->event('status_change')
            ->createdAt(Carbon::now()->subMinutes(90))
            ->log('Budi Santoso mengubah status project Budi & Lestari Prewedding menjadi Selesai');

        activity()
            ->causedBy($photographer)
            ->performedOn($p3)
            ->event('created')
            ->createdAt(Carbon::now()->subHours(5))
            ->log('Dewi Keira membuat project baru untuk Ulang Tahun Keira');

        activity()
            ->causedBy($admin)
            ->performedOn($p4)
            ->event('file_upload')
            ->createdAt(Carbon::now()->subHours(8))
            ->log('Admin mengunggah file baru untuk project Family Roberts');

        // 14. Additional Module Seeders
        $this->call([
            WeddingOrganizerSeeder::class,
            AddonSeeder::class,
            WorkflowDeliverableSeeder::class,
            ClientSourceAndNoteTemplatesSeeder::class,
            ClientUserSeeder::class,
            ProjectsShowcaseSeeder::class,
            PortalContentSeeder::class,
        ]);

        // 15. Indonesia Regions Seeder (Auto-seed if empty)
        if (class_exists(\Aliziodev\IndonesiaRegions\Database\Seeders\IndonesiaRegionSeeder::class)
            && \Aliziodev\IndonesiaRegions\Models\IndonesiaRegion::count() === 0) {
            $this->call(\Aliziodev\IndonesiaRegions\Database\Seeders\IndonesiaRegionSeeder::class);
        }
    }
}
