<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\InstagramPost;
use App\Models\Project;
use App\Models\ProjectHighlight;
use App\Models\PromoSlide;
use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class PortalContentSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Promo Slides
        if (PromoSlide::count() === 0) {
            PromoSlide::create([
                'title' => 'Abadikan Momen Terbaikmu dengan Arams Pictures',
                'tag' => 'SPECIAL OFFER',
                'description' => 'Promo spesial untuk setiap momen berharga Anda. Dapatkan penawaran terbaik untuk paket wedding, prewedding & portrait pilihan Anda.',
                'button_text' => 'Lihat Promo Selengkapnya',
                'button_url' => '/form-klien',
                'image' => '/images/wedding-couple.jpg',
                'is_active' => true,
                'sort_order' => 1,
            ]);

            PromoSlide::create([
                'title' => 'Cinematic Drone & 4K Wedding Story',
                'tag' => 'EXCLUSIVE WEDDING',
                'description' => 'Bonus video drone 4K dan album kanvas eksklusif untuk booking sesi pernikahan tahun ini. Slot terbatas untuk setiap musim.',
                'button_text' => 'Booking Jadwal Sekarang',
                'button_url' => '/form-klien',
                'image' => 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=85',
                'is_active' => true,
                'sort_order' => 2,
            ]);

            PromoSlide::create([
                'title' => 'Warm & Intimate Family Studio Session',
                'tag' => 'FAMILY PORTRAIT',
                'description' => 'Ciptakan warisan kenangan hangat bersama keluarga tercinta di studio eksklusif dengan pencahayaan sinematik premium.',
                'button_text' => 'Konsultasi Paket',
                'button_url' => '/form-klien',
                'image' => 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&auto=format&fit=crop&q=85',
                'is_active' => true,
                'sort_order' => 3,
            ]);
        }

        // 2. Testimonials
        if (Testimonial::count() === 0) {
            $firstClient = Client::first();
            $firstProject = Project::first();

            Testimonial::create([
                'client_id' => $firstClient?->id,
                'project_id' => $firstProject?->id,
                'client_name' => 'Raka & Dinda',
                'package_name' => 'Paket Prewedding Gold',
                'rating' => 5,
                'comment' => 'Hasil fotonya luar biasa, melebihi ekspektasi kami! Tim Arams Pictures sangat profesional, sabar mengarahkan pose, dan suasananya menyenangkan. Momen kami jadi sangat berkesan!',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                'event_date' => now()->subMonths(2),
                'is_featured' => true,
                'status' => 'approved',
                'sort_order' => 1,
            ]);

            Testimonial::create([
                'client_id' => $firstClient?->id,
                'project_id' => $firstProject?->id,
                'client_name' => 'Budi & Rina',
                'package_name' => 'Wedding Day Luxury',
                'rating' => 5,
                'comment' => 'Pelayanan sangat profesional, hasil foto luar biasa, dan timnya ramah banget. Portal tracking project sangat membantu memantau progres editing dan download file.',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                'event_date' => now()->subMonths(1),
                'is_featured' => true,
                'status' => 'approved',
                'sort_order' => 2,
            ]);

            Testimonial::create([
                'client_id' => $firstClient?->id,
                'project_id' => $firstProject?->id,
                'client_name' => 'Kevin & Sarah',
                'package_name' => 'Exclusive Wedding Cinema',
                'rating' => 5,
                'comment' => 'Pilihan terbaik untuk dokumentasi pernikahan kami. Mulai dari sesi prewedding hingga hari H, semuanya tertata rapi dan tone warnanya aesthetic sekali.',
                'avatar' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
                'event_date' => now()->subMonths(3),
                'is_featured' => true,
                'status' => 'approved',
                'sort_order' => 3,
            ]);

            Testimonial::create([
                'client_id' => $firstClient?->id,
                'project_id' => $firstProject?->id,
                'client_name' => 'Dimas & Tiara',
                'package_name' => 'Maternity & New Life',
                'rating' => 5,
                'comment' => 'Akses Google Drive langsung dari dashboard bikin gampang download file full resolution. Rekomendasi banget untuk yang cari fotografer terpercaya!',
                'avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
                'event_date' => now()->subMonths(4),
                'is_featured' => true,
                'status' => 'approved',
                'sort_order' => 4,
            ]);
        }

        // 3. Instagram Posts
        if (InstagramPost::count() === 0) {
            $instagramPosts = [
                [
                    'image_url' => '/images/wedding-couple.jpg',
                    'caption' => 'The eternal vow of love in timeless monochrome and gold elegance ✨ #aramspictures #weddingstory',
                    'post_url' => 'https://instagram.com/aramspictures',
                    'likes_count' => 342,
                    'comments_count' => 28,
                    'media_type' => 'photo',
                    'is_active' => true,
                    'sort_order' => 1,
                ],
                [
                    'image_url' => 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
                    'caption' => 'Golden sunset bliss with our lovely couple. Every glance tells an unspoken poetry. 🕊️',
                    'post_url' => 'https://instagram.com/aramspictures',
                    'likes_count' => 284,
                    'comments_count' => 19,
                    'media_type' => 'photo',
                    'is_active' => true,
                    'sort_order' => 2,
                ],
                [
                    'image_url' => 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop&q=80',
                    'caption' => 'Intimate garden blessing with laughter and pure tears of joy 🌿🥂 #weddinginspiration',
                    'post_url' => 'https://instagram.com/aramspictures',
                    'likes_count' => 195,
                    'comments_count' => 14,
                    'media_type' => 'photo',
                    'is_active' => true,
                    'sort_order' => 3,
                ],
                [
                    'image_url' => 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop&q=80',
                    'caption' => 'Embracing every heartbeat in the misty serenity of Bromo mountains 🏔️ #preweddingbromo',
                    'post_url' => 'https://instagram.com/aramspictures',
                    'likes_count' => 412,
                    'comments_count' => 35,
                    'media_type' => 'photo',
                    'is_active' => true,
                    'sort_order' => 4,
                ],
                [
                    'image_url' => 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&auto=format&fit=crop&q=80',
                    'caption' => 'Pure vintage elegance. When classic romance meets contemporary cinematography. 🕯️',
                    'post_url' => 'https://instagram.com/aramspictures',
                    'likes_count' => 230,
                    'comments_count' => 17,
                    'media_type' => 'photo',
                    'is_active' => true,
                    'sort_order' => 5,
                ],
                [
                    'image_url' => 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&auto=format&fit=crop&q=80',
                    'caption' => 'Details that matter: hand-crafted rings, delicate lace, and vows sealed forever. 💍',
                    'post_url' => 'https://instagram.com/aramspictures',
                    'likes_count' => 178,
                    'comments_count' => 11,
                    'media_type' => 'photo',
                    'is_active' => true,
                    'sort_order' => 6,
                ],
                [
                    'image_url' => 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=600&auto=format&fit=crop&q=80',
                    'caption' => 'The divine radiance of motherhood. Cherishing new life in soft natural lighting. 🌸',
                    'post_url' => 'https://instagram.com/aramspictures',
                    'likes_count' => 267,
                    'comments_count' => 22,
                    'media_type' => 'photo',
                    'is_active' => true,
                    'sort_order' => 7,
                ],
                [
                    'image_url' => 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&auto=format&fit=crop&q=80',
                    'caption' => 'Welcome to the world, little angel. Innocent dreams wrapped in love. 👶🤍',
                    'post_url' => 'https://instagram.com/aramspictures',
                    'likes_count' => 389,
                    'comments_count' => 41,
                    'media_type' => 'photo',
                    'is_active' => true,
                    'sort_order' => 8,
                ],
            ];

            foreach ($instagramPosts as $post) {
                InstagramPost::create($post);
            }
        }

        // 4. Project Highlights for existing projects
        $projects = Project::limit(5)->get();
        foreach ($projects as $project) {
            if ($project->highlights()->count() === 0) {
                ProjectHighlight::create([
                    'project_id' => $project->id,
                    'title' => 'First Look & Vow Exchange',
                    'image_url' => '/images/wedding-couple.jpg',
                    'caption' => 'Momen tatap pertama yang mengharukan dan pengucapan janji suci.',
                    'media_type' => 'photo',
                    'is_cover' => true,
                    'sort_order' => 1,
                ]);

                ProjectHighlight::create([
                    'project_id' => $project->id,
                    'title' => 'The Holy Matrimony',
                    'image_url' => 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
                    'caption' => 'Pemberkatan pernikahan di altar yang khidmat bersama keluarga besar.',
                    'media_type' => 'photo',
                    'is_cover' => false,
                    'sort_order' => 2,
                ]);

                ProjectHighlight::create([
                    'project_id' => $project->id,
                    'title' => 'Grand Entrance & Toast',
                    'image_url' => 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80',
                    'caption' => 'Kemeriahan resepsi malam hari dengan kembang api dan tepuk tangan meriah.',
                    'media_type' => 'photo',
                    'is_cover' => false,
                    'sort_order' => 3,
                ]);

                ProjectHighlight::create([
                    'project_id' => $project->id,
                    'title' => 'The Wedding Rings & Details',
                    'image_url' => 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&auto=format&fit=crop&q=80',
                    'caption' => 'Detail cincin pernikahan platinum dan buket bunga mawar putih.',
                    'media_type' => 'photo',
                    'is_cover' => false,
                    'sort_order' => 4,
                ]);
            }
        }
    }
}
