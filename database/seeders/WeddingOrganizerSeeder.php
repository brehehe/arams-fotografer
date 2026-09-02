<?php

namespace Database\Seeders;

use App\Models\WeddingOrganizer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class WeddingOrganizerSeeder extends Seeder
{
    public function run(): void
    {
        $organizers = [
            [
                'name' => 'Kalyana Wedding Planner & Organizer',
                'pic_name' => 'Riana Pratiwi, S.Sn',
                'phone' => '081288991234',
                'secondary_phone' => '081399887766',
                'email' => 'contact@kalyanawedding.com',
                'instagram' => '@kalyanawedding',
                'city' => 'Jakarta Selatan',
                'address' => 'Jl. Kemang Raya No. 45B, Bangka, Mampang Prapatan',
                'commission_rate' => 10.00,
                'tier' => 'platinum',
                'status' => 'partner',
                'bank_name' => 'Bank BCA',
                'bank_account_number' => '5420998811',
                'bank_account_holder' => 'Riana Pratiwi',
                'notes' => 'Partner utama untuk paket luxury wedding ballroom & intimate resort wedding.',
            ],
            [
                'name' => 'Arthea Event & Wedding Concept',
                'pic_name' => 'Dimas Arya Nugraha',
                'phone' => '081908776655',
                'secondary_phone' => null,
                'email' => 'hello@artheaevents.id',
                'instagram' => '@artheawp',
                'city' => 'Bandung',
                'address' => 'Jl. Dago Asri No. 12, Dago, Coblong',
                'commission_rate' => 8.50,
                'tier' => 'gold',
                'status' => 'partner',
                'bank_name' => 'Bank Mandiri',
                'bank_account_number' => '1310029988112',
                'bank_account_holder' => 'Dimas Arya Nugraha',
                'notes' => 'Spesialis outdoor garden wedding & rustic intimate concept di Bandung dan Lembang.',
            ],
            [
                'name' => 'Sekar Jagad Wedding Organizer',
                'pic_name' => 'Ibu Sri Wahyuningsih',
                'phone' => '081334455667',
                'secondary_phone' => '081223344556',
                'email' => 'sekarjagad.wo@gmail.com',
                'instagram' => '@sekarjagad_wo',
                'city' => 'Yogyakarta',
                'address' => 'Jl. Kaliurang KM 6.5, Pandega Marta, Sleman',
                'commission_rate' => 10.00,
                'tier' => 'gold',
                'status' => 'active',
                'bank_name' => 'Bank BCA',
                'bank_account_number' => '8690123456',
                'bank_account_holder' => 'Sri Wahyuningsih',
                'notes' => 'Pakar adat Jawa tradisional & nusantara modern, sering booking paket full day foto + video cinema.',
            ],
            [
                'name' => 'Elysian Creator Wedding Specialist',
                'pic_name' => 'Clarissa Stephanie',
                'phone' => '082199001122',
                'secondary_phone' => null,
                'email' => 'info@elysiancreator.com',
                'instagram' => '@elysian.creator',
                'city' => 'Surabaya',
                'address' => 'Pakuwon City Laguna Regency Blok F3 No. 9',
                'commission_rate' => 12.00,
                'tier' => 'platinum',
                'status' => 'partner',
                'bank_name' => 'Bank BCA',
                'bank_account_number' => '0188997766',
                'bank_account_holder' => 'Clarissa Stephanie',
                'notes' => 'Top tier client oriental & modern concept. Rekomendasi vendor dokumentasi eksklusif.',
            ],
            [
                'name' => 'Maharani Wedding Organizer',
                'pic_name' => 'Bpk. Hendra Gunawan',
                'phone' => '081807766554',
                'secondary_phone' => null,
                'email' => 'maharani.organizer@yahoo.com',
                'instagram' => '@maharani_organizer',
                'city' => 'Tangerang',
                'address' => 'Ruko Gading Serpong Blok AA3 No. 18, Kelapa Dua',
                'commission_rate' => 5.00,
                'tier' => 'silver',
                'status' => 'active',
                'bank_name' => 'Bank BRI',
                'bank_account_number' => '034101009988501',
                'bank_account_holder' => 'Hendra Gunawan',
                'notes' => 'Sering membawa klien wedding gedung pemerintah & Islamic wedding syar\'i.',
            ],
            [
                'name' => 'Nirwana Wedding Planner Bali',
                'pic_name' => 'Ni Wayan Desiari',
                'phone' => '081239887766',
                'secondary_phone' => '081999887766',
                'email' => 'info@nirwanabalievents.com',
                'instagram' => '@nirwanabalievents',
                'city' => 'Denpasar',
                'address' => 'Jl. Sunset Road No. 88, Kuta, Badung, Bali',
                'commission_rate' => 15.00,
                'tier' => 'platinum',
                'status' => 'partner',
                'bank_name' => 'Bank BCA',
                'bank_account_number' => '7720987654',
                'bank_account_holder' => 'Ni Wayan Desiari',
                'notes' => 'Spesialis destination wedding Bali, clifftop villa wedding, dan beach sunset ceremony.',
            ],
        ];

        foreach ($organizers as $wo) {
            WeddingOrganizer::updateOrCreate(
                ['name' => $wo['name']],
                $wo
            );
        }
    }
}
