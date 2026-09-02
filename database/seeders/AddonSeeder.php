<?php

namespace Database\Seeders;

use App\Models\Addon;
use App\Models\Category;
use Illuminate\Database\Seeder;

class AddonSeeder extends Seeder
{
    public function run(): void
    {
        $weddingCat = Category::where('name', 'like', '%Wedding%')->first();
        $eventCat = Category::where('name', 'like', '%Event%')->first();
        $prewedCat = Category::where('name', 'like', '%Prewedding%')->first();
        $corporateCat = Category::where('name', 'like', '%Corporate%')->first();

        $addons = [
            [
                'name' => 'Extra 1 Fotografer Senior',
                'category_id' => $weddingCat?->id,
                'price' => 1500000,
                'unit' => 'orang/hari',
                'description' => 'Tambahan 1 fotografer profesional senior untuk liputan candid & detail acara.',
                'status' => 'active',
            ],
            [
                'name' => 'Drone Aerial Cinematic 4K',
                'category_id' => $weddingCat?->id,
                'price' => 2000000,
                'unit' => 'sesi',
                'description' => 'Pengambilan aerial view venue & momen outdoor menggunakan drone pilot bersertifikat.',
                'status' => 'active',
            ],
            [
                'name' => 'Same Day Edit (SDE) Video Teaser',
                'category_id' => $weddingCat?->id,
                'price' => 2500000,
                'unit' => 'video',
                'description' => 'Video highlight 1-3 menit yang diedit di hari yang sama untuk diputar saat resepsi malam.',
                'status' => 'active',
            ],
            [
                'name' => 'Tambahan Durasi Liputan (Overtime)',
                'category_id' => $eventCat?->id ?? $weddingCat?->id,
                'price' => 500000,
                'unit' => 'jam',
                'description' => 'Biaya penambahan waktu pemotretan/shooting per jam di luar paket awal.',
                'status' => 'active',
            ],
            [
                'name' => 'Luxury Velvet Photobook 30x40 (20 Halaman)',
                'category_id' => $weddingCat?->id,
                'price' => 1800000,
                'unit' => 'album',
                'description' => 'Cetak album magazine cover beludru premium dengan box eksklusif dan kertas matte anti gores.',
                'status' => 'active',
            ],
            [
                'name' => 'Cetak Kanvas 60x90 + Frame Gold Ukir',
                'category_id' => $prewedCat?->id ?? $weddingCat?->id,
                'price' => 850000,
                'unit' => 'buah',
                'description' => 'Cetak kanvas premium bertekstur tinggi dengan bingkai kayu ukir emas minimalis.',
                'status' => 'active',
            ],
            [
                'name' => 'Flashdrive Wooden Box Custom Gravir',
                'category_id' => $prewedCat?->id,
                'price' => 250000,
                'unit' => 'item',
                'description' => 'USB 3.0 64GB dengan kotak kayu premium bertuliskan nama mempelai grafir laser.',
                'status' => 'active',
            ],
            [
                'name' => 'Live Streaming Multi-Camera Resepsi (3 Cam)',
                'category_id' => $corporateCat?->id ?? $eventCat?->id,
                'price' => 3500000,
                'unit' => 'sesi',
                'description' => 'Broadcast live streaming YouTube/Zoom dengan switcher multi-kamera & audio mixer pro.',
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
