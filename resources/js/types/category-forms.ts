export type CategoryFormKey =
    | 'maternity'
    | 'lainnya'
    | 'perorangan'
    | 'prewedding'
    | 'commercial'
    | 'traveling'
    | 'wedding'
    | 'birthday'
    | 'corporate'
    | 'engagement'
    | 'event'
    | 'family'
    | 'komunitas'
    | 'newborn'
    | 'standard';

export interface ChildRepeaterItem {
    name: string;
    age?: string | number;
    birth_date?: string;
    gender?: string;
}

export interface MaternityCategoryData {
    mom_name?: string;
    partner_name?: string;
    gestational_age_weeks?: number | string;
    hpl_date?: string;
    concept_theme?: string;
    session_location_type?: string;
    wardrobe_notes?: string;
}

export interface LainnyaCategoryData {
    needs_description?: string;
    location?: string;
    needs_type?: string;
    needs_detail?: string;
    approach_type?: string;
    special_notes?: string;
}

export interface PeroranganCategoryData {
    photo_purpose?: string;
    session_type?: string;
    outfit_looks_count?: number | string;
    session_duration?: string;
    backdrop_theme?: string;
    desired_props?: string;
    additional_notes?: string;
}

export interface PreweddingCategoryData {
    groom_name?: string;
    bride_name?: string;
    session_date?: string;
    concept_theme?: string;
    session_location?: string;
    outfit_wardrobe?: string;
    locations_count?: number | string;
    makeup_hairdo?: string;
    props?: string;
    additional_notes?: string;
}

export interface CommercialCategoryData {
    commercial_purpose?: string;
    product_brand_type?: string;
    products_count?: number | string;
    background_type?: string;
    photo_style_mood?: string;
    photo_usage?: string[];
    reference_brief?: string;
    additional_notes?: string;
}

export interface TravelingCategoryData {
    departure_date?: string;
    return_date?: string;
    destination_city_country?: string;
    travelers_count?: number | string;
    trip_type?: string;
    trip_duration_days?: number | string;
    airline?: string;
    accommodation_hotel?: string;
    trip_transportation?: string;
    main_agenda_activity?: string;
    additional_notes?: string;
}

export interface WeddingCategoryData {
    // CPP (Calon Pengantin Pria)
    groom_name?: string;
    groom_nickname?: string;
    groom_occupation?: string;
    groom_birth_date?: string;
    groom_instagram?: string;

    // CPW (Calon Pengantin Wanita)
    bride_name?: string;
    bride_nickname?: string;
    bride_occupation?: string;
    bride_birth_date?: string;
    bride_instagram?: string;

    akad_date?: string;
    akad_time?: string;
    akad_location?: string;
    reception_date?: string;
    reception_time?: string;
    reception_location?: string;
    wedding_organizer?: string;
    estimated_guests?: number | string;
    concept_theme?: string;
    venue_building?: string;
    decoration?: string;
    mua_dress?: string;
    entertainment?: string;
    additional_notes?: string;
}

export interface BirthdayCategoryData {
    celebrant_name?: string;
    celebrant_age?: number | string;
    birthday_theme?: string;
    event_type?: string;
    estimated_guests?: number | string;
    venue_location?: string;
    decoration_color_theme?: string;
    activity_entertainment?: string;
    additional_notes?: string;
}

export interface CorporateCategoryData {
    company_name?: string;
    department_division?: string;
    event_type?: string;
    event_scale?: string;
    documentation_purpose?: string;
    pic_name?: string;
    pic_phone?: string;
    pic_email?: string;
    special_requirements?: string;
    reference_brief?: string;
}

export interface EngagementCategoryData {
    groom_name?: string;
    bride_name?: string;
    engagement_date?: string;
    engagement_time?: string;
    engagement_location?: string;
    estimated_guests?: number | string;
    concept_theme?: string;
    theme_color?: string;
    vendor_wo?: string;
    additional_notes?: string;
}

export interface EventCategoryData {
    event_date?: string;
    event_time_range?: string;
    event_type?: string;
    event_scale?: string;
    event_location?: string;
    event_name?: string;
    organizer?: string;
    event_theme?: string;
    event_purpose?: string;
    estimated_guests?: number | string;
    dress_code?: string;
    rundown_agenda?: string;
    additional_notes?: string;
}

export interface FamilyCategoryData {
    family_name?: string;
    father_name?: string;
    mother_name?: string;
    children?: ChildRepeaterItem[];
    members_count?: number | string;
    concept_theme?: string;
    session_location?: string;
    session_duration?: string;
    additional_notes?: string;
}

export interface KomunitasCategoryData {
    community_name?: string;
    established_year?: number | string;
    community_type?: string;
    members_count?: number | string;
    pic_name?: string;
    pic_phone?: string;
    pic_email?: string;
    activity_type?: string;
    activity_theme?: string;
    activity_description?: string;
}

export interface BabyItem {
    name: string;
    nickname?: string;
    birth_date?: string;
    gender?: string;
}

export interface NewbornCategoryData {
    baby_name?: string;
    baby_nickname?: string;
    baby_birth_date?: string;
    baby_gender?: string;
    babies?: BabyItem[];
    father_name?: string;
    mother_name?: string;
    children?: ChildRepeaterItem[];
    additional_notes?: string;
}

export type AnyCategorySpecificData =
    & MaternityCategoryData
    & LainnyaCategoryData
    & PeroranganCategoryData
    & PreweddingCategoryData
    & CommercialCategoryData
    & TravelingCategoryData
    & WeddingCategoryData
    & BirthdayCategoryData
    & CorporateCategoryData
    & EngagementCategoryData
    & EventCategoryData
    & FamilyCategoryData
    & KomunitasCategoryData
    & NewbornCategoryData
    & Record<string, any>;

/**
 * Resolves the active category form key from category attributes.
 */
export function resolveCategoryKey(category?: {
    slug?: string | null;
    form_type?: string | null;
    name?: string | null;
} | null): CategoryFormKey {
    if (!category) {
        return 'standard';
    }

    const ft = (category.form_type || '').toLowerCase().trim();
    const slug = (category.slug || '').toLowerCase().trim();
    const name = (category.name || '').toLowerCase().trim();

    const candidate = ft || slug || name;

    if (candidate.includes('maternity')) {
        return 'maternity';
    }
    if (candidate.includes('prewedding')) {
        return 'prewedding';
    }
    if (candidate.includes('wedding')) {
        return 'wedding';
    }
    if (candidate.includes('newborn') || candidate.includes('bayi')) {
        return 'newborn';
    }
    if (candidate.includes('commercial') || candidate.includes('produk') || candidate.includes('brand')) {
        return 'commercial';
    }
    if (candidate.includes('traveling') || candidate.includes('trip') || candidate.includes('wisata')) {
        return 'traveling';
    }
    if (candidate.includes('birthday') || candidate.includes('ulang tahun')) {
        return 'birthday';
    }
    if (candidate.includes('corporate') || candidate.includes('perusahaan')) {
        return 'corporate';
    }
    if (candidate.includes('engagement') || candidate.includes('lamaran')) {
        return 'engagement';
    }
    if (candidate.includes('perorangan') || candidate.includes('personal') || candidate.includes('portrait')) {
        return 'perorangan';
    }
    if (candidate.includes('family') || candidate.includes('keluarga')) {
        return 'family';
    }
    if (candidate.includes('komunitas') || candidate.includes('community')) {
        return 'komunitas';
    }
    if (candidate.includes('event') || candidate.includes('acara')) {
        return 'event';
    }
    if (candidate.includes('lainnya') || candidate.includes('khusus')) {
        return 'lainnya';
    }

    return 'standard';
}

// ── Dropdown Options Presets ────────────────────────────────────────────────

export const MATERNITY_CONCEPTS = [
    'Elegant & Natural',
    'Minimalist',
    'Outdoor',
    'Indoor',
    'Romantic',
    'Casual',
    'Luxury',
    'Custom',
];

export const MATERNITY_LOCATIONS = [
    'Studio',
    'Outdoor',
    'Indoor',
    'Di Rumah (Home Session)',
    'Lokasi Khusus / Custom',
];

export const LAINNYA_NEEDS_TYPES = [
    'Dokumentasi Personal',
    'Dokumentasi Keluarga',
    'Dokumentasi Acara',
    'Foto Produk',
    'Foto Profesional',
    'Konten',
    'Lainnya',
];

export const LAINNYA_APPROACHES = [
    'Dokumenter / Candid',
    'Formal & Terarah',
    'Sinematik / Artistik',
    'Cepat & Ringkas',
    'Khusus / Sesuai Brief',
];

export const PERORANGAN_PURPOSES = [
    'Portrait',
    'Personal Branding',
    'Professional Headshot',
    'Portfolio',
    'Social Media',
    'Graduation',
    'Fashion',
];

export const PERORANGAN_SESSION_TYPES = [
    'Studio',
    'Outdoor',
    'Indoor',
    'On Location',
];

export const PERORANGAN_DURATIONS = [
    '1 Jam',
    '2 Jam',
    '3 Jam',
    'Setengah Hari (4-5 Jam)',
    'Seharian Penuh (Full Day)',
];

export const PERORANGAN_BACKDROPS = [
    'Seamless White',
    'Seamless Grey',
    'Seamless Black',
    'Warm Neutral / Beige',
    'Aesthetic Room',
    'Outdoor Natural',
    'Custom / Lainnya',
];

export const PREWEDDING_CONCEPTS = [
    'Casual Modern',
    'Tradisional / Adat',
    'Formal & Glamour',
    'Vintage / Classic',
    'Cinematic Story',
    'Korean Minimalist',
    'Bohemian / Nature',
    'Custom / Konseptual',
];

export const COMMERCIAL_PURPOSES = [
    'E-Commerce / Marketplace',
    'Website',
    'Social Media',
    'Advertising',
    'Catalog',
    'Campaign',
];

export const COMMERCIAL_PRODUCT_TYPES = [
    'Fashion / Pakaian',
    'Makanan & Minuman (F&B)',
    'Skincare & Beauty',
    'Gadget & Elektronik',
    'Aksesoris & Perhiasan',
    'Properti / Interior',
    'Lainnya',
];

export const COMMERCIAL_BACKGROUNDS = [
    'White',
    'Black',
    'Natural',
    'Lifestyle',
    'Custom',
];

export const COMMERCIAL_MOODS = [
    'Clean & Minimalist',
    'Elegant',
    'Luxury',
    'Natural',
    'Editorial',
    'Commercial',
];

export const COMMERCIAL_USAGES = [
    'Instagram Feed / Story',
    'Marketplace (Shopee, Tokopedia, dll)',
    'Website & Landing Page',
    'Advertising & Billboard',
    'Katalog Cetak & Brosur',
    'Digital Ads (Meta / TikTok Ads)',
];

export const TRAVELING_TRIP_TYPES = [
    'Family Vacation',
    'Couple / Honeymoon',
    'Solo Travel',
    'Group Friends',
    'Corporate / Incentive Trip',
    'Adventure / Outdoor',
];

export const TRAVELING_TRANSPORTS = [
    'Mobil Sewa / Rental Pribadi',
    'Transportasi Umum / Kereta',
    'Disediakan Klien',
    'Bus Pariwisata',
    'Pesawat / Kapal',
];

export const WEDDING_CONCEPTS = [
    'Tradisional / Adat',
    'Modern National',
    'Rustic / Garden',
    'International Glamour',
    'Minimalist Chic',
    'Classic Royal',
    'Intimate Wedding',
];

export const BIRTHDAY_THEMES = [
    'Sweet 17th',
    'Kids / Anak-anak',
    '1st Birthday / Smash Cake',
    'Adult Milestone (30th/40th/50th)',
    'Golden Age (60th+)',
    'Custom / Bebas',
];

export const BIRTHDAY_EVENT_TYPES = [
    'Pesta Privat / Keluarga',
    'Pesta Besar / Ballroom',
    'Dinner Santai',
    'Kids Party & Playground',
    'Surprise Party',
];

export const CORPORATE_EVENT_TYPES = [
    'Annual Gathering',
    'Seminar / Konferensi',
    'Product Launching',
    'Gala Dinner & Awarding',
    'Corporate Anniversary',
    'Board Meeting',
    'Exhibition / Booth',
];

export const CORPORATE_SCALES = [
    'Internal (< 50 orang)',
    'Menengah (50 - 200 orang)',
    'Besar (200 - 500 orang)',
    'Skala Nasional / Internasional (> 500 orang)',
];

export const CORPORATE_PURPOSES = [
    'Publikasi & PR',
    'Arsip Internal Perusahaan',
    'Materi Promosi / Marketing',
    'Laporan Tahunan (Annual Report)',
    'Konten Medsos Perusahaan',
];

export const ENGAGEMENT_CONCEPTS = [
    'Tradisional / Adat',
    'Modern Minimalist',
    'Intimate Romantic',
    'Rustic Floral',
    'Oriental / Sangjit',
    'Custom',
];

export const EVENT_TYPES = [
    'Konser Musik',
    'Festival / Bazaar',
    'Olahraga / Maraton',
    'Seminar / Workshop',
    'Pameran Seni',
    'Awarding Night',
    'Lainnya',
];

export const EVENT_SCALES = [
    'Komunitas / Lokal (< 100 orang)',
    'Regional (100 - 500 orang)',
    'Besar / Publik (> 500 orang)',
];

export const FAMILY_CONCEPTS = [
    'Warm & Cozy',
    'Minimalist Studio',
    'Outdoor Park / Picnic',
    'Casual Home Session',
    'Formal Family Portrait',
    'Custom / Bebas',
];

export const FAMILY_LOCATIONS = [
    'Studio Indoor',
    'Outdoor Taman / Publik',
    'Di Rumah Klien (Home Session)',
    'Lokasi Khusus',
];

export const FAMILY_DURATIONS = [
    '1 Jam',
    '2 Jam',
    'Setengah Hari (3-4 Jam)',
    'Full Day',
];

export const KOMUNITAS_TYPES = [
    'Olahraga / Sport',
    'Seni & Kreatif',
    'Otomotif',
    'Hobi & Gaming',
    'Sosial & Relawan',
    'Edukasi / Profesi',
    'Lainnya',
];

export const KOMUNITAS_ACTIVITIES = [
    'Meetup / Kopi Darat',
    'Touring / Gowes / Lari',
    'Workshop / Pelatihan',
    'Anniversary / Ultah Komunitas',
    'Bakti Sosial',
    'Kompetisi / Turnamen',
    'Lainnya',
];
