<?php

namespace Database\Seeders;

use App\Models\Addon;
use App\Models\Category;
use Illuminate\Database\Seeder;

class AddonSeeder extends Seeder
{
    public function run(): void
    {
        $weddingCat = Category::where('name', 'ilike', '%Wedding%')->first();
        $eventCat = Category::where('name', 'ilike', '%Event%')->first();
        $prewedCat = Category::where('name', 'ilike', '%Prewedding%')->first();
        $corporateCat = Category::where('name', 'ilike', '%Corporate%')->first();

        $addons = [
            // ── TYPE: ADDON (Ala Carte / Layanan Tambahan) ─────────────────
            [
                'name' => 'Extra 1 Fotografer Senior',
                'type' => 'addon',
                'category_id' => $weddingCat?->id,
                'price' => 1500000,
                'unit' => 'orang/hari',
                'description' => 'Tambahan 1 fotografer profesional senior untuk liputan candid & detail acara.',
                'status' => 'active',
            ],
            [
                'name' => 'Drone Aerial Cinematic 4K',
                'type' => 'addon',
                'category_id' => $weddingCat?->id,
                'price' => 2000000,
                'unit' => 'sesi',
                'description' => 'Pengambilan aerial view venue & momen outdoor menggunakan drone pilot bersertifikat.',
                'status' => 'active',
            ],
            [
                'name' => 'Same Day Edit (SDE) Video Teaser',
                'type' => 'addon',
                'category_id' => $weddingCat?->id,
                'price' => 2500000,
                'unit' => 'video',
                'description' => 'Video highlight 1-3 menit yang diedit di hari yang sama untuk diputar saat resepsi malam.',
                'status' => 'active',
            ],
            [
                'name' => 'Tambahan Durasi Liputan (Overtime)',
                'type' => 'addon',
                'category_id' => $eventCat?->id ?? $weddingCat?->id,
                'price' => 500000,
                'unit' => 'jam',
                'description' => 'Biaya penambahan waktu pemotretan/shooting per jam di luar paket awal.',
                'status' => 'active',
            ],
            [
                'name' => 'Luxury Velvet Photobook 30x40 (20 Halaman)',
                'type' => 'addon',
                'category_id' => $weddingCat?->id,
                'price' => 1800000,
                'unit' => 'album',
                'description' => 'Cetak album magazine cover beludru premium dengan box eksklusif dan kertas matte anti gores.',
                'status' => 'active',
            ],
            [
                'name' => 'Cetak Kanvas 60x90 + Frame Gold Ukir',
                'type' => 'addon',
                'category_id' => $prewedCat?->id ?? $weddingCat?->id,
                'price' => 850000,
                'unit' => 'buah',
                'description' => 'Cetak kanvas premium bertekstur tinggi dengan bingkai kayu ukir emas minimalis.',
                'status' => 'active',
            ],
            [
                'name' => 'Flashdrive Wooden Box Custom Gravir',
                'type' => 'addon',
                'category_id' => $prewedCat?->id,
                'price' => 250000,
                'unit' => 'item',
                'description' => 'USB 3.0 64GB dengan kotak kayu premium bertuliskan nama mempelai grafir laser.',
                'status' => 'active',
            ],
            [
                'name' => 'Live Streaming Multi-Camera Resepsi (3 Cam)',
                'type' => 'addon',
                'category_id' => $corporateCat?->id ?? $eventCat?->id,
                'price' => 3500000,
                'unit' => 'sesi',
                'description' => 'Broadcast live streaming YouTube/Zoom dengan switcher multi-kamera & audio mixer pro.',
                'status' => 'active',
            ],

            // ── TYPE: OPERATIONAL (Biaya Operasional Project) ───────────────
            [
                'name' => 'Transportasi',
                'type' => 'operational',
                'category_id' => null,
                'price' => 500000,
                'unit' => 'perjalanan',
                'description' => 'Bensin / Tiket Perjalanan Tim',
                'status' => 'active',
            ],
            [
                'name' => 'Akomodasi',
                'type' => 'operational',
                'category_id' => null,
                'price' => 800000,
                'unit' => 'malam',
                'description' => 'Hotel / Penginapan Tim',
                'status' => 'active',
            ],
            [
                'name' => 'Konsumsi & Makan Tim',
                'type' => 'operational',
                'category_id' => null,
                'price' => 350000,
                'unit' => 'hari',
                'description' => 'Konsumsi makan & minum tim liputan',
                'status' => 'active',
            ],
            [
                'name' => 'Toll & Parkir',
                'type' => 'operational',
                'category_id' => null,
                'price' => 150000,
                'unit' => 'paket',
                'description' => 'Biaya tol & parkir venue acara',
                'status' => 'active',
            ],
            [
                'name' => 'Sewa Peralatan',
                'type' => 'operational',
                'category_id' => null,
                'price' => 750000,
                'unit' => 'item',
                'description' => 'Sewa lighting / lensa tambahan',
                'status' => 'active',
            ],
            [
                'name' => 'Crew / Freelance Eksternal',
                'type' => 'operational',
                'category_id' => null,
                'price' => 1000000,
                'unit' => 'orang/hari',
                'description' => 'Photographer / Videographer asisten tambahan',
                'status' => 'active',
            ],
            [
                'name' => 'Cetak Vendor Eksternal',
                'type' => 'operational',
                'category_id' => null,
                'price' => 1200000,
                'unit' => 'paket',
                'description' => 'Cetak foto instan / photobooth eksternal',
                'status' => 'active',
            ],
            [
                'name' => 'Izin Lokasi / Retribusi',
                'type' => 'operational',
                'category_id' => null,
                'price' => 500000,
                'unit' => 'lokasi',
                'description' => 'Tiket masuk spot / retribusi venue',
                'status' => 'active',
            ],
        ];

        foreach ($addons as $addon) {
            Addon::updateOrCreate(
                ['name' => $addon['name']],
                $addon
            );
        }
    }
}
