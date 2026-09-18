<?php

namespace Database\Seeders;

use App\Models\ClientSource;
use App\Models\ClientSourceAppreciation;
use App\Models\NoteTemplate;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClientSourceAndNoteTemplatesSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Note Templates Seeding
        DB::table('note_templates')->delete();

        $templates = [
            [
                'title' => 'Template Meeting Awal',
                'type' => 'meeting',
                'status' => 'active',
                'content' => "Agenda Meeting Briefing Awal:\n1. Perkenalan tim & klien\n2. Pembahasan konsep & moodboard pemotretan\n3. Pemilihan lokasi venue & jadwal rundown\n4. Ketentuan wardrobe & makeup\n5. Tanya jawab teknis & penyampaian form kuesioner",
                'created_at' => Carbon::parse('2026-08-26 10:15:00'),
                'updated_at' => Carbon::parse('2026-08-26 10:15:00'),
            ],
            [
                'title' => 'Template Follow-up Client',
                'type' => 'follow_up',
                'status' => 'active',
                'content' => "Pesan Follow-up Komunikasi:\nHalo Kak [Nama Klien],\nTerima kasih banyak atas waktunya saat meeting kemarin. Berikut kami lampirkan rangkuman catatan & penawaran paket foto yang telah disesuaikan dengan kebutuhan Kakak.\n\nJika ada hal yang ingin didiskusikan kembali, tim kami siap membantu. Semoga lancar selalu persiapannya ya Kak!",
                'created_at' => Carbon::parse('2026-08-24 15:30:00'),
                'updated_at' => Carbon::parse('2026-08-24 15:30:00'),
            ],
            [
                'title' => 'Template Persiapan Project',
                'type' => 'project_process',
                'status' => 'active',
                'content' => "Checklist Persiapan H-3:\n- Cek ketersediaan gear (kamera, lensa, baterai cadangan, lighting flash, memory card format baru)\n- Konfirmasi ulang rundown dan PIC acara\n- Briefing tim fotografer & videografer utama\n- Cetak lembar form shot-list keluarga inti",
                'created_at' => Carbon::parse('2026-08-22 09:45:00'),
                'updated_at' => Carbon::parse('2026-08-22 09:45:00'),
            ],
            [
                'title' => 'Template Hari H / Pelaksanaan',
                'type' => 'project_process',
                'status' => 'active',
                'content' => "Log Lapangan Hari H:\n- Jam tiba di lokasi / stand by\n- Kondisi pencahayaan & ambient venue\n- Catatan momen khusus (misal: surprise, request angle khusus pengantin)\n- Serah terima koordinasi dengan tim Wedding Organizer",
                'created_at' => Carbon::parse('2026-08-20 11:12:00'),
                'updated_at' => Carbon::parse('2026-08-20 11:12:00'),
            ],
            [
                'title' => 'Template Revisi & Editing',
                'type' => 'project_process',
                'status' => 'active',
                'content' => "Petunjuk Revisi Foto/Video:\n- Tone warna: Sesuai preset signature Arams (Warm Natural / Clean Mood)\n- Retouching: Kulit natural, penghapusan objek pengganggu minor\n- Batas revisi: Maksimal 2x dengan poin catatan nomor foto yang jelas",
                'created_at' => Carbon::parse('2026-08-19 16:40:00'),
                'updated_at' => Carbon::parse('2026-08-19 16:40:00'),
            ],
            [
                'title' => 'Template Serah Terima',
                'type' => 'handover',
                'status' => 'active',
                'content' => "Berita Acara Serah Terima Hasil Karya:\nDengan ini menyatakan bahwa file digital high-resolution dan cetak album telah diserahkan dan diterima dalam kondisi baik oleh Klien.\n- Link Galeri Online: [Link Google Drive]\n- Fisik: 1 Album Leather 30x40 + Wooden Box USB",
                'created_at' => Carbon::parse('2026-08-18 13:20:00'),
                'updated_at' => Carbon::parse('2026-08-18 13:20:00'),
            ],
            [
                'title' => 'Template Catatan Umum',
                'type' => 'other',
                'status' => 'inactive',
                'content' => "Catatan umum operasional dan administrasi internal studio untuk arsip dokumentasi.",
                'created_at' => Carbon::parse('2026-08-15 08:55:00'),
                'updated_at' => Carbon::parse('2026-08-15 08:55:00'),
            ],
            [
                'title' => 'Template Meeting Teknis & Gear',
                'type' => 'meeting',
                'status' => 'active',
                'content' => "Technical Briefing:\n- Setup multi-cam 4K 60fps\n- Drone pilot clearance & slot terbang\n- Audio wireless lavalier & ambient shotgun mic",
                'created_at' => Carbon::parse('2026-08-12 14:00:00'),
                'updated_at' => Carbon::parse('2026-08-12 14:00:00'),
            ],
            [
                'title' => 'Template Meeting Koordinasi WO',
                'type' => 'meeting',
                'status' => 'active',
                'content' => "Sinkronisasi rundown dengan Wedding Organizer:\n- Jadwal prosesi masuk\n- Waktu sesi foto keluarga\n- Grand entrance & special effects lighting",
                'created_at' => Carbon::parse('2026-08-10 11:30:00'),
                'updated_at' => Carbon::parse('2026-08-10 11:30:00'),
            ],
            [
                'title' => 'Template Follow-up Penawaran Paket',
                'type' => 'follow_up',
                'status' => 'active',
                'content' => "Reminder Penawaran:\nHalo Kak, kami ingin mengonfirmasi apakah penawaran paket foto pernikahan kemarin sudah sesuai? Kami senang jika ada detail yang ingin disesuaikan.",
                'created_at' => Carbon::parse('2026-08-08 16:20:00'),
                'updated_at' => Carbon::parse('2026-08-08 16:20:00'),
            ],
            [
                'title' => 'Template Serah Terima Album Fisik',
                'type' => 'handover',
                'status' => 'active',
                'content' => "Checklist Pengiriman Fisik:\n- Album sudah lolos QC print & jilid\n- Box wooden USB lengkap dengan cetak polaroid bonus\n- Pengiriman via kurir bergaransi",
                'created_at' => Carbon::parse('2026-08-05 10:00:00'),
                'updated_at' => Carbon::parse('2026-08-05 10:00:00'),
            ],
            [
                'title' => 'Template Briefing Indoor Studio',
                'type' => 'meeting',
                'status' => 'active',
                'content' => "Panduan Sesi Foto Studio:\n- Kedatangan 15 menit sebelum sesi dimulai\n- Background pilihan: White Seamless / Warm Beige / Dark Classic\n- Properti studio yang disiapkan",
                'created_at' => Carbon::parse('2026-08-02 13:15:00'),
                'updated_at' => Carbon::parse('2026-08-02 13:15:00'),
            ],
        ];

        foreach ($templates as $t) {
            NoteTemplate::create($t);
        }

        // 2. Client Sources Seeding
        DB::table('client_source_appreciations')->delete();
        DB::table('client_sources')->delete();

        $sources = [
            [
                'name' => 'Instagram',
                'type' => 'social_media',
                'phone' => null,
                'email' => 'marketing@arams.com',
                'description' => 'Channel organik Instagram @arams.pictures',
                'status' => 'active',
                'is_primary' => true,
                'created_at' => Carbon::parse('2026-05-29 09:30:00'),
            ],
            [
                'name' => 'Facebook',
                'type' => 'social_media',
                'phone' => null,
                'email' => 'facebook@arams.com',
                'description' => 'Official Facebook Page & Meta Ads Campaign',
                'status' => 'active',
                'is_primary' => true,
                'created_at' => Carbon::parse('2026-05-28 10:00:00'),
            ],
            [
                'name' => 'YouTube',
                'type' => 'social_media',
                'phone' => null,
                'email' => 'youtube@arams.com',
                'description' => 'Channel video & portfolio resmi YouTube @aramspictures',
                'status' => 'active',
                'is_primary' => true,
                'created_at' => Carbon::parse('2026-05-27 15:00:00'),
            ],
            [
                'name' => 'TikTok',
                'type' => 'social_media',
                'phone' => null,
                'email' => null,
                'description' => 'Channel konten viral TikTok @arams_official',
                'status' => 'active',
                'is_primary' => true,
                'created_at' => Carbon::parse('2026-05-14 10:05:00'),
            ],
            [
                'name' => 'Google / Website',
                'type' => 'social_media',
                'phone' => null,
                'email' => 'web@arams.com',
                'description' => 'Organic search Google & Landing page official website',
                'status' => 'active',
                'is_primary' => true,
                'created_at' => Carbon::parse('2026-05-28 11:20:00'),
            ],
            [
                'name' => 'Lainnya (Rekomendasi WO / Teman / Vendor)',
                'type' => 'other',
                'phone' => null,
                'email' => null,
                'description' => 'Rekomendasi dari Wedding Organizer (WO), rekanan fotografer, kerabat, atau vendor rekanan',
                'status' => 'active',
                'is_primary' => true,
                'created_at' => Carbon::parse('2026-05-01 08:00:00'),
            ],
        ];

        $createdRina = null;
        foreach ($sources as $idx => $s) {
            $source = ClientSource::create($s);
            if ($idx === 0) {
                $createdRina = $source;
            }
        }

        // 3. Seed Appreciation for Rina Safitri (Gambar 3)
        if ($createdRina) {
            ClientSourceAppreciation::create([
                'client_source_id' => $createdRina->id,
                'status' => 'given',
                'date' => Carbon::parse('2026-08-25'),
                'type' => 'Voucher Belanja',
                'amount' => 500000,
                'notes' => 'Terima kasih banyak atas rekomendasi dan kepercayaannya. Semoga hubungan baik kita terus terjalin.',
            ]);
        }
    }
}
