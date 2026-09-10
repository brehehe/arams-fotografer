<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Kategori Portofolio
        Schema::create('portfolio_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true)->index(); // Kontrol Show / Hide
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        // 2. Item Portofolio (Karya / Foto Galeri)
        Schema::create('portfolios', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('portfolio_category_id')->nullable()->constrained('portfolio_categories')->nullOnDelete();
            $table->string('title');
            $table->text('caption')->nullable();
            $table->string('image_url');
            $table->string('media_type')->default('photo'); // photo, video
            $table->boolean('is_active')->default(true)->index(); // Kontrol Show / Hide
            $table->integer('sort_order')->default(0);
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. Seed data awal kategori & portofolio
        $now = now();
        $categories = [
            [
                'id' => (string) Str::uuid(),
                'name' => 'Wedding',
                'slug' => 'wedding',
                'description' => 'Momen magis hari pernikahan, akad nikah, dan resepsi megah yang tak lekang oleh waktu.',
                'is_active' => true,
                'sort_order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Prewedding',
                'slug' => 'prewedding',
                'description' => 'Sesi foto romantis pra-nikah dengan konsep outdoor, pemandangan alam, dan studio sinematik.',
                'is_active' => true,
                'sort_order' => 2,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Engagement',
                'slug' => 'engagement',
                'description' => 'Dokumentasi acara lamaran dan pertunangan hangat penuh kebahagiaan keluarga.',
                'is_active' => true,
                'sort_order' => 3,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Studio & Maternity',
                'slug' => 'studio-maternity',
                'description' => 'Potret kehamilan anggun dan sesi studio eksklusif dengan pencahayaan artistik.',
                'is_active' => true,
                'sort_order' => 4,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Family & Kids',
                'slug' => 'family-kids',
                'description' => 'Kehangatan keluarga dan keceriaan buah hati dalam bingkai foto penuh cinta.',
                'is_active' => true,
                'sort_order' => 5,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Commercial & Event',
                'slug' => 'commercial-event',
                'description' => 'Dokumentasi acara korporat, pameran, dan fotografi produk komersial profesional.',
                'is_active' => true,
                'sort_order' => 6,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('portfolio_categories')->insert($categories);

        $catWeddingId = $categories[0]['id'];
        $catPreweddingId = $categories[1]['id'];
        $catEngagementId = $categories[2]['id'];
        $catStudioId = $categories[3]['id'];
        $catFamilyId = $categories[4]['id'];
        // Note: Commercial & Event (index 5) sengaja dibiarkan TANPA GAMBAR untuk membuktikan fitur filter!

        $portfolios = [
            [
                'id' => (string) Str::uuid(),
                'portfolio_category_id' => $catWeddingId,
                'title' => 'Royal Heritage Wedding Blessing',
                'caption' => 'The Royal Blessing Ceremony with traditional nuances and timeless elegance. @aramspictures #AramsWedding',
                'image_url' => 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=85',
                'media_type' => 'photo',
                'is_active' => true,
                'sort_order' => 1,
                'likes_count' => 184,
                'comments_count' => 24,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'portfolio_category_id' => $catPreweddingId,
                'title' => 'Sunset at Bromo Mountain',
                'caption' => 'Dramatic prewedding session amidst the golden hour of Bromo savanna. #AramsPrewedding',
                'image_url' => 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200&auto=format&fit=crop&q=85',
                'media_type' => 'photo',
                'is_active' => true,
                'sort_order' => 2,
                'likes_count' => 245,
                'comments_count' => 38,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'portfolio_category_id' => $catWeddingId,
                'title' => 'Classic Ballroom Grand Reception',
                'caption' => 'Intimate celebration filled with warm tears, smiles, and everlasting love. #AramsMoments',
                'image_url' => 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop&q=85',
                'media_type' => 'photo',
                'is_active' => true,
                'sort_order' => 3,
                'likes_count' => 198,
                'comments_count' => 19,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'portfolio_category_id' => $catEngagementId,
                'title' => 'Intimate Engagement Day',
                'caption' => 'Two souls, one sacred promise. The journey to forever starts here. #AramsEngagement',
                'image_url' => 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&auto=format&fit=crop&q=85',
                'media_type' => 'photo',
                'is_active' => true,
                'sort_order' => 4,
                'likes_count' => 142,
                'comments_count' => 15,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'portfolio_category_id' => $catStudioId,
                'title' => 'Studio Portrait & Maternity Elegance',
                'caption' => 'Capturing the glowing anticipation of new life in pure elegance. #AramsStudio',
                'image_url' => 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&auto=format&fit=crop&q=85',
                'media_type' => 'photo',
                'is_active' => true,
                'sort_order' => 5,
                'likes_count' => 112,
                'comments_count' => 11,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'portfolio_category_id' => $catWeddingId,
                'title' => 'Outdoor Garden Exchange of Vows',
                'caption' => 'Romantic garden vows surrounded by lush blossoms and golden sunshine. #AramsWedding',
                'image_url' => 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&auto=format&fit=crop&q=85',
                'media_type' => 'photo',
                'is_active' => true,
                'sort_order' => 6,
                'likes_count' => 215,
                'comments_count' => 31,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => (string) Str::uuid(),
                'portfolio_category_id' => $catFamilyId,
                'title' => 'Warm Family Portrait Session',
                'caption' => 'Cherished family bonds captured in genuine laughter and warm togetherness. #AramsFamily',
                'image_url' => 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&auto=format&fit=crop&q=85',
                'media_type' => 'photo',
                'is_active' => true,
                'sort_order' => 7,
                'likes_count' => 167,
                'comments_count' => 18,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('portfolios')->insert($portfolios);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('portfolios');
        Schema::dropIfExists('portfolio_categories');
    }
};
