<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Package;
use Illuminate\Database\Seeder;

class WorkflowDeliverableSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Set Custom workflow_type for Lainnya / Custom category
        Category::where('slug', 'like', '%lainnya%')
            ->orWhere('name', 'like', '%Lainnya%')
            ->orWhere('name', 'like', '%Custom%')
            ->update(['workflow_type' => 'custom']);

        // 2. Ensure custom packages exist in DB
        $customCat = Category::where('workflow_type', 'custom')->first() ?? Category::first();
        if ($customCat) {
            Package::firstOrCreate(
                ['name' => 'Everlasting Duo'],
                [
                    'category_id' => $customCat->id,
                    'description' => 'Bundling lengkap Prewedding Outdoor + Full Day Wedding Documentation',
                    'base_price' => 45000000,
                    'duration_hours' => 18,
                    'status' => 'active',
                    'included_deliverables' => [
                        ['id' => 1, 'name' => 'Prewedding Moodboard Guide', 'type' => 'Special', 'description' => 'Panduan konsep & rundown prewedding', 'deadline' => 'H-14', 'required' => true, 'by_owner' => false],
                        ['id' => 2, 'name' => 'Prewedding High-Res Edit (30 pcs)', 'type' => 'Photo', 'description' => 'Hasil edit siap cetak dan display', 'deadline' => 'H-7', 'required' => true, 'by_owner' => false],
                        ['id' => 3, 'name' => 'Wedding Sneak Peek (24 Hours)', 'type' => 'Photo', 'description' => 'Preview kilat momen hari pernikahan', 'deadline' => 'H+1', 'required' => true, 'by_owner' => true],
                        ['id' => 4, 'name' => 'All Photo & Video Archives', 'type' => 'Special', 'description' => 'Seluruh file prewedding + wedding via SSD / Drive', 'deadline' => 'H+3', 'required' => true, 'by_owner' => false],
                        ['id' => 5, 'name' => 'Wedding Highlight Cinematic 4K', 'type' => 'Video', 'description' => 'Film highlight 5 menit 4K', 'deadline' => 'H+30', 'required' => true, 'by_owner' => true],
                        ['id' => 6, 'name' => '2x Luxury Flushmount Album (Cetak)', 'type' => 'Album', 'description' => 'Album cetak mewah 30x40 kulit + box kayu', 'deadline' => 'H+45', 'required' => true, 'by_owner' => true],
                        ['id' => 7, 'name' => '2x Canvas Frame 60x90', 'type' => 'Special', 'description' => 'Cetak kanvas minimalis untuk dekorasi rumah', 'deadline' => 'H+45', 'required' => true, 'by_owner' => true],
                        ['id' => 8, 'name' => 'Full Documentation Film', 'type' => 'Video', 'description' => 'Dokumentasi penuh prosesi kedua acara', 'deadline' => 'H+60', 'required' => true, 'by_owner' => true],
                    ],
                ]
            );

            Package::firstOrCreate(
                ['name' => 'Everlasting Journey'],
                [
                    'category_id' => $customCat->id,
                    'description' => 'Trilogi dokumentasi eksklusif: Engagement + Prewedding + Wedding Full Package',
                    'base_price' => 65000000,
                    'duration_hours' => 24,
                    'status' => 'active',
                    'included_deliverables' => [
                        ['id' => 1, 'name' => 'Full Concept & Rundown Briefing', 'type' => 'Special', 'description' => 'Briefing terpadu 3 rangkaian acara', 'deadline' => 'H-14', 'required' => true, 'by_owner' => true],
                        ['id' => 2, 'name' => 'Prewedding Album (20x30)', 'type' => 'Album', 'description' => 'Album prewedding selesai sebelum hari pernikahan', 'deadline' => 'H-7', 'required' => true, 'by_owner' => true],
                        ['id' => 3, 'name' => 'Prewedding Video Teaser (1 Min)', 'type' => 'Video', 'description' => 'Video teaser untuk diputar di resepsi', 'deadline' => 'H-7', 'required' => true, 'by_owner' => true],
                        ['id' => 4, 'name' => 'Wedding Same-Day Teaser Video', 'type' => 'Video', 'description' => 'Video teaser tayang di malam resepsi', 'deadline' => 'Hari H', 'required' => true, 'by_owner' => true],
                        ['id' => 5, 'name' => 'Wedding Sneak Peek 15 Photos', 'type' => 'Photo', 'description' => 'Foto preview pilihan pagi hari berikutnya', 'deadline' => 'H+1', 'required' => true, 'by_owner' => true],
                        ['id' => 6, 'name' => 'All Unedited Master Files (RAW + 4K)', 'type' => 'Special', 'description' => 'Master file lengkap via portable hard drive', 'deadline' => 'H+3', 'required' => true, 'by_owner' => false],
                        ['id' => 7, 'name' => '150 Fine Art Retouched Photos', 'type' => 'Photo', 'description' => 'Full magazine fine art editing', 'deadline' => 'H+14', 'required' => true, 'by_owner' => false],
                        ['id' => 8, 'name' => 'Cinematic Film (7-10 Min 4K)', 'type' => 'Video', 'description' => 'Film sinematik komprehensif 4K', 'deadline' => 'H+30', 'required' => true, 'by_owner' => true],
                        ['id' => 9, 'name' => '3x Luxury Wooden Box Albums (Cetak)', 'type' => 'Album', 'description' => '3 set album cetak premium kulit asli', 'deadline' => 'H+45', 'required' => true, 'by_owner' => true],
                        ['id' => 10, 'name' => 'Full Documentary Multi-Cam Feature', 'type' => 'Video', 'description' => 'Video feature lengkap durasi 90 menit', 'deadline' => 'H+60', 'required' => true, 'by_owner' => true],
                    ],
                ]
            );
        }

        // 3. Normalize all packages in DB so included_deliverables is always a structured list
        $packages = Package::all();
        foreach ($packages as $pkg) {
            $deliverables = $pkg->included_deliverables ?? [];
            if (!empty($deliverables) && is_array($deliverables)) {
                $hasStructured = false;
                foreach ($deliverables as $d) {
                    if (is_array($d) && isset($d['name'])) {
                        $hasStructured = true;
                        break;
                    }
                }

                if (!$hasStructured) {
                    $structured = [];
                    foreach ($deliverables as $idx => $str) {
                        $name = is_string($str) ? $str : 'Deliverable Item';
                        $nameLower = strtolower($name);
                        $type = 'Photo';
                        $deadline = 'H+14';
                        $byOwner = false;

                        if (str_contains($nameLower, 'video') || str_contains($nameLower, 'teaser') || str_contains($nameLower, 'film') || str_contains($nameLower, 'reels') || str_contains($nameLower, 'aftermovie')) {
                            $type = 'Video';
                            $deadline = str_contains($nameLower, 'teaser') || str_contains($nameLower, 'reels') ? 'H+7' : 'H+30';
                            $byOwner = str_contains($nameLower, 'highlight') || str_contains($nameLower, 'cinematic') || str_contains($nameLower, 'film');
                        } elseif (str_contains($nameLower, 'album')) {
                            $type = 'Album';
                            $deadline = 'H+45';
                            $byOwner = true;
                        } elseif (str_contains($nameLower, 'canvas') || str_contains($nameLower, 'drive') || str_contains($nameLower, 'license') || str_contains($nameLower, 'flashdisk') || str_contains($nameLower, 'box') || str_contains($nameLower, 'prints')) {
                            $type = 'Special';
                            $deadline = str_contains($nameLower, 'drive') ? 'H+3' : (str_contains($nameLower, 'canvas') ? 'H+30' : 'H+7');
                        } elseif (str_contains($nameLower, 'sneak peek') || str_contains($nameLower, 'preview') || str_contains($nameLower, 'fast turnaround')) {
                            $deadline = 'H+1';
                        } elseif (str_contains($nameLower, 'raw') || str_contains($nameLower, 'unedited') || str_contains($nameLower, 'all edited')) {
                            $deadline = 'H+3';
                        }

                        $structured[] = [
                            'id' => $idx + 1,
                            'name' => $name,
                            'type' => $type,
                            'description' => "Item deliverable standar untuk {$pkg->name}",
                            'deadline' => $deadline,
                            'required' => true,
                            'by_owner' => $byOwner,
                        ];
                    }
                    $pkg->included_deliverables = $structured;
                    $pkg->save();
                }
            }
        }
    }
}
