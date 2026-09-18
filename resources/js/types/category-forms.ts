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

// ── Item Repeater Interfaces ──────────────────────────────────────────────────

export interface FamilyMemberItem {
    name: string;
    relationship: string; // 'Suami' | 'Istri' | 'Anak' | 'Kakek' | 'Nenek' | 'Saudara' | 'Lainnya'
    relationship_other?: string;
    age?: number | string;
}

export interface BabyItem {
    name: string;
    nickname?: string;
    birth_date?: string;
    gender: 'Laki-laki' | 'Perempuan' | string;
}

export interface ChildRepeaterItem {
    [key: string]: any;
    name: string;
    age?: string | number;
    birth_date?: string;
    gender?: string;
}

// ── 14 Category Specific Interfaces ──────────────────────────────────────────

export interface WeddingCategoryData {
    groom_name?: string;
    bride_name?: string;
    akad_date?: string;
    akad_time?: string;
    akad_location?: string;
    reception_date?: string;
    reception_time?: string;
    reception_location?: string;
    estimated_guests?: number | string;
    concept_theme?: string;
    concept_theme_other?: string;
    wedding_organizer?: string;
    makeup_artist?: string;
    // Legacy support
    groom_nickname?: string;
    groom_occupation?: string;
    groom_birth_date?: string;
    groom_instagram?: string;
    bride_nickname?: string;
    bride_occupation?: string;
    bride_birth_date?: string;
    bride_instagram?: string;
    venue_building?: string;
    decoration?: string;
    mua_dress?: string;
    entertainment?: string;
    additional_notes?: string;
}

export interface PreweddingCategoryData {
    partner_1?: string;
    partner_2?: string;
    concept_theme?: string;
    concept_theme_other?: string;
    session_location?: string;
    locations_count?: number | string;
    wardrobe_looks_count?: number | string;
    include_makeup?: boolean | string;
    props_special?: string;
    // Legacy
    groom_name?: string;
    bride_name?: string;
    session_date?: string;
    outfit_wardrobe?: string;
    makeup_hairdo?: string;
    props?: string;
    additional_notes?: string;
}

export interface EngagementCategoryData {
    groom_name?: string;
    bride_name?: string;
    engagement_date?: string;
    engagement_time?: string;
    engagement_location?: string;
    estimated_guests?: number | string;
    concept_theme?: string;
    concept_theme_other?: string;
    theme_color?: string;
    wedding_organizer?: string;
    // Legacy
    vendor_wo?: string;
    additional_notes?: string;
}

export interface FamilyCategoryData {
    family_name?: string;
    family_members?: FamilyMemberItem[];
    concept_theme?: string;
    concept_theme_other?: string;
    session_location_type?: string;
    session_location?: string;
    // Legacy
    father_name?: string;
    mother_name?: string;
    children?: ChildRepeaterItem[];
    members_count?: number | string;
    session_duration?: string;
    additional_notes?: string;
}

export interface MaternityCategoryData {
    mom_name?: string;
    gestational_age_weeks?: number | string;
    hpl_date?: string;
    concept_theme?: string;
    concept_theme_other?: string;
    session_location_type?: string;
    session_location?: string;
    wardrobe?: string[];
    wardrobe_other?: string;
    // Legacy
    mother_name?: string;
    partner_name?: string;
    wardrobe_notes?: string;
}

export interface NewbornCategoryData {
    babies?: BabyItem[];
    concept_theme?: string[];
    concept_theme_other?: string;
    pose_special_requests?: string;
    // Legacy
    baby_name?: string;
    baby_nickname?: string;
    baby_birth_date?: string;
    baby_gender?: string;
    father_name?: string;
    mother_name?: string;
    children?: ChildRepeaterItem[];
    additional_notes?: string;
}

export interface BirthdayCategoryData {
    celebrant_name?: string;
    celebrant_age?: number | string;
    event_type?: string;
    event_type_other?: string;
    estimated_guests?: number | string;
    venue_location?: string;
    birthday_theme?: string;
    decoration_concept?: string;
    entertainment?: string[];
    entertainment_other?: string;
    // Legacy
    activity_entertainment?: string;
    decoration_color_theme?: string;
    additional_notes?: string;
}

export interface KomunitasCategoryData {
    community_name?: string;
    community_type?: string;
    community_type_other?: string;
    participants_count?: number | string;
    activity_type?: string;
    activity_type_other?: string;
    activity_theme?: string;
    activity_location?: string;
    activity_description?: string;
    // Legacy
    established_year?: number | string;
    members_count?: number | string;
    pic_name?: string;
    pic_phone?: string;
    pic_email?: string;
}

export interface CorporateCategoryData {
    company_name?: string;
    department_division?: string;
    event_type?: string;
    event_type_other?: string;
    participants_count?: number | string;
    documentation_purpose?: string[];
    documentation_purpose_other?: string;
    special_rules_sop?: string;
    // Legacy
    event_scale?: string;
    pic_name?: string;
    pic_phone?: string;
    pic_email?: string;
    special_requirements?: string;
    reference_brief?: string;
}

export interface CommercialCategoryData {
    brand_name?: string;
    production_purpose?: string[];
    production_purpose_other?: string;
    product_type?: string;
    sku_count?: number | string;
    background_type?: string;
    background_type_other?: string;
    lighting_style?: string;
    lighting_style_other?: string;
    mood_style?: string[];
    mood_style_other?: string;
    use_talent?: boolean | string;
    talent_count?: number | string;
    photo_usage?: string[];
    photo_usage_other?: string;
    // Legacy
    company_name?: string;
    pic_name?: string;
    client_name?: string;
    commercial_purpose?: string;
    product_brand_type?: string;
    products_count?: number | string;
    photo_style_mood?: string;
    reference_brief?: string;
    additional_notes?: string;
}

export interface EventCategoryData {
    event_name?: string;
    organizer?: string;
    event_type?: string;
    event_type_other?: string;
    estimated_participants?: number | string;
    event_location?: string;
    dress_code?: string;
    has_rundown?: boolean | string;
    rundown_notes?: string;
    // Legacy
    pic_name?: string;
    client_name?: string;
    needs_type?: string;
    event_date?: string;
    event_time_range?: string;
    event_scale?: string;
    event_theme?: string;
    event_purpose?: string;
    estimated_guests?: number | string;
    rundown_agenda?: string;
    additional_notes?: string;
}

export interface TravelingCategoryData {
    destinations?: string[];
    participants_count?: number | string;
    trip_type?: string;
    trip_type_other?: string;
    departure_date?: string;
    return_date?: string;
    transportation_mode?: string;
    transportation_other?: string;
    airline_transport_detail?: string;
    accommodation_hotel?: string;
    main_agenda?: string;
    // Legacy
    destination?: string;
    destination_city_country?: string;
    travelers_count?: number | string;
    trip_duration_days?: number | string;
    airline?: string;
    accommodation_hotel_legacy?: string;
    trip_transportation?: string;
    main_agenda_activity?: string;
    additional_notes?: string;
}

export interface PeroranganCategoryData {
    photo_purpose?: string;
    photo_purpose_other?: string;
    session_type?: string;
    session_type_other?: string;
    outfit_looks_count?: number | string;
    session_duration?: string;
    backdrop?: string;
    backdrop_other?: string;
    special_props?: string;
    // Legacy
    client_name?: string;
    name?: string;
    nickname?: string;
    backdrop_theme?: string;
    desired_props?: string;
    additional_notes?: string;
}

export interface LainnyaCategoryData {
    event_tradition_type?: string;
    event_tradition_other?: string;
    location?: string;
    special_requirements?: string;
    // Legacy
    client_name?: string;
    name?: string;
    contact_person?: string;
    pic_name?: string;
    event_date?: string;
    event_time_range?: string;
    event_time?: string;
    event_type?: string;
    needs_type?: string;
    needs_description?: string;
    event_location?: string;
    needs_detail?: string;
    approach_type?: string;
    special_notes?: string;
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

/** Prefer the simple count; retain compatibility with older detailed family entries. */
export function getFamilyMemberCount(data: Pick<FamilyCategoryData, 'members_count' | 'family_members'>): number {
    if (data.members_count !== undefined && data.members_count !== null) {
        return Number(data.members_count);
    }

    return data.family_members?.filter((member) => member.name?.trim()).length || 0;
}

/** Required category details for project create/edit; optional and legacy fields stay optional. */
export function getProjectCategoryError(key: CategoryFormKey, data: AnyCategorySpecificData): string | null {
    const required: Partial<Record<CategoryFormKey, Array<[string, string]>>> = {
        wedding: [['groom_name', 'Nama lengkap CPP'], ['groom_nickname', 'Panggilan CPP'], ['bride_name', 'Nama lengkap CPW'], ['bride_nickname', 'Panggilan CPW'], ['akad_date', 'Tanggal Akad'], ['akad_time', 'Waktu Akad'], ['akad_location', 'Lokasi Akad'], ['reception_date', 'Tanggal Resepsi'], ['reception_time', 'Waktu Resepsi'], ['reception_location', 'Lokasi Resepsi'], ['estimated_guests', 'Estimasi Tamu Undangan'], ['concept_theme', 'Konsep Acara']],
        prewedding: [['groom_nickname', 'Panggilan CPP'], ['bride_nickname', 'Panggilan CPW'], ['concept_theme', 'Konsep Prewedding'], ['session_location', 'Lokasi Sesi'], ['locations_count', 'Jumlah Lokasi']],
        engagement: [['groom_name', 'Nama Calon Mempelai Pria'], ['bride_name', 'Nama Calon Mempelai Wanita'], ['engagement_date', 'Tanggal Acara'], ['engagement_time', 'Waktu Acara'], ['estimated_guests', 'Estimasi Tamu'], ['engagement_location', 'Lokasi Acara'], ['concept_theme', 'Konsep / Tema Acara']],
        family: [['family_name', 'Nama Keluarga'], ['members_count', 'Jumlah Anggota Keluarga yang Difoto'], ['concept_theme', 'Konsep Sesi'], ['session_location_type', 'Lokasi Sesi']],
        maternity: [['mom_name', 'Nama Calon Ibu'], ['gestational_age_weeks', 'Usia Kandungan'], ['hpl_date', 'Hari Perkiraan Lahir'], ['concept_theme', 'Konsep / Tema'], ['session_location_type', 'Lokasi Sesi']],
        birthday: [['celebrant_name', 'Nama yang Berulang Tahun'], ['celebrant_age', 'Usia yang Dirayakan'], ['event_type', 'Jenis Acara'], ['estimated_guests', 'Estimasi Tamu'], ['venue_location', 'Venue / Lokasi Acara'], ['birthday_theme', 'Tema Acara']],
        komunitas: [['community_name', 'Nama Komunitas'], ['community_type', 'Jenis Komunitas'], ['participants_count', 'Jumlah Peserta Kegiatan'], ['activity_type', 'Jenis Kegiatan'], ['activity_theme', 'Tema Kegiatan'], ['activity_location', 'Lokasi Kegiatan']],
        corporate: [['company_name', 'Nama Perusahaan'], ['event_type', 'Jenis Acara'], ['participants_count', 'Jumlah Peserta'], ['documentation_purpose', 'Tujuan Dokumentasi']],
        commercial: [['brand_name', 'Nama Brand / Bisnis'], ['product_type', 'Jenis Produk'], ['background_type', 'Background'], ['lighting_style', 'Lighting Style'], ['mood_style', 'Mood / Style Foto']],
        event: [['event_name', 'Nama Event'], ['organizer', 'Penyelenggara / EO'], ['event_type', 'Jenis Event'], ['estimated_participants', 'Estimasi Peserta'], ['event_location', 'Lokasi Event']],
        traveling: [['destinations', 'Destinasi Perjalanan'], ['participants_count', 'Jumlah Peserta'], ['trip_type', 'Jenis Perjalanan'], ['departure_date', 'Tanggal Berangkat'], ['return_date', 'Tanggal Pulang'], ['transportation_mode', 'Transportasi Utama'], ['main_agenda', 'Agenda Utama Perjalanan']],
        perorangan: [['photo_purpose', 'Tujuan Foto'], ['session_type', 'Jenis Sesi'], ['outfit_looks_count', 'Jumlah Look / Outfit'], ['session_duration', 'Durasi Sesi'], ['backdrop', 'Backdrop / Background']],
        lainnya: [['event_date', 'Tanggal Event'], ['event_time_range', 'Waktu Event'], ['event_tradition_type', 'Jenis Event'], ['needs_type', 'Jenis Kebutuhan'], ['event_location', 'Lokasi Event']],
    };

    if (!data.client_name?.trim() || data.client_name.trim() === '-') {
        return 'Nama Pemesan wajib diisi.';
    }

    if (key === 'wedding' || key === 'prewedding') {
        if (!(data.groom_name || data.partner_2)?.trim()) {
            return 'Nama lengkap CPP wajib diisi.';
        }

        if (!(data.bride_name || data.partner_1)?.trim()) {
            return 'Nama lengkap CPW wajib diisi.';
        }
    }

    for (const [field, label] of required[key] || []) {
        if (key === 'family' && field === 'members_count') {
            if (!Number.isInteger(getFamilyMemberCount(data)) || getFamilyMemberCount(data) < 1) {
                return `${label} minimal 1 orang.`;
            }

            continue;
        }

        const value = key === 'lainnya' && field === 'event_tradition_type'
            ? (data.event_tradition_type || data.event_type)
            : key === 'lainnya' && field === 'event_location'
                ? (data.event_location || data.location)
                : data[field];

        if (value == null || (Array.isArray(value) ? value.length === 0 : String(value).trim() === '')) {
            return `${label} wajib diisi.`;
        }
    }

    const numericMinimums: Partial<Record<CategoryFormKey, Array<[string, number, string]>>> = {
        wedding: [['estimated_guests', 10, 'Estimasi Tamu Undangan']],
        prewedding: [['locations_count', 1, 'Jumlah Lokasi']],
        engagement: [['estimated_guests', 10, 'Estimasi Tamu']],
        maternity: [['gestational_age_weeks', 1, 'Usia Kandungan']],
        birthday: [['celebrant_age', 1, 'Usia yang Dirayakan'], ['estimated_guests', 5, 'Estimasi Tamu']],
        komunitas: [['participants_count', 1, 'Jumlah Peserta Kegiatan']],
        corporate: [['participants_count', 1, 'Jumlah Peserta']],
        event: [['estimated_participants', 10, 'Estimasi Peserta']],
        traveling: [['participants_count', 1, 'Jumlah Peserta']],
        perorangan: [['outfit_looks_count', 1, 'Jumlah Look / Outfit']],
    };

    for (const [field, minimum, label] of numericMinimums[key] || []) {
        if (!Number.isInteger(Number(data[field])) || Number(data[field]) < minimum) {
            return `${label} minimal ${minimum}.`;
        }
    }

    if (key === 'maternity' && Number(data.gestational_age_weeks) > 42) {
        return 'Usia Kandungan maksimal 42 minggu.';
    }

    if (key === 'traveling' && data.return_date! < data.departure_date!) {
        return 'Tanggal Pulang tidak boleh sebelum Tanggal Berangkat.';
    }

    const otherFields: Partial<Record<CategoryFormKey, Array<[string, string]>>> = {
        wedding: [['concept_theme', 'concept_theme_other']], prewedding: [['concept_theme', 'concept_theme_other']],
        engagement: [['concept_theme', 'concept_theme_other']], family: [['concept_theme', 'concept_theme_other'], ['session_location_type', 'session_location']],
        maternity: [['concept_theme', 'concept_theme_other'], ['session_location_type', 'session_location']],
        birthday: [['event_type', 'event_type_other']], komunitas: [['community_type', 'community_type_other'], ['activity_type', 'activity_type_other']],
        corporate: [['event_type', 'event_type_other'], ['documentation_purpose', 'documentation_purpose_other']],
        commercial: [['background_type', 'background_type_other'], ['lighting_style', 'lighting_style_other'], ['mood_style', 'mood_style_other']],
        event: [['event_type', 'event_type_other']], traveling: [['trip_type', 'trip_type_other'], ['transportation_mode', 'transportation_other']],
        perorangan: [['photo_purpose', 'photo_purpose_other'], ['session_type', 'session_type_other'], ['backdrop', 'backdrop_other']],
        lainnya: [['event_tradition_type', 'event_tradition_other']],
    };

    for (const [field, other] of otherFields[key] || []) {
        const choice = key === 'lainnya' && field === 'event_tradition_type' ? (data.event_tradition_type || data.event_type) : data[field];

        if ((choice === 'Lainnya' || (Array.isArray(choice) && choice.includes('Lainnya'))) && !data[other]?.trim()) {
            return `Sebutkan pilihan Lainnya pada ${field.replaceAll('_', ' ')}.`;
        }
    }

    return null;
}

// ── Category Key Resolver ─────────────────────────────────────────────────────

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

    const candidate = slug || (ft && ft !== 'standard' ? ft : '') || name || ft;

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

    if (
        candidate.includes('lainnya') ||
        candidate.includes('pengajian') ||
        candidate.includes('siraman') ||
        candidate.includes('midodareni') ||
        candidate.includes('tradisional') ||
        candidate.includes('khusus')
    ) {
        return 'lainnya';
    }

    if (candidate.includes('event') || candidate.includes('acara') || candidate.includes('konser') || candidate.includes('festival')) {
        return 'event';
    }

    return 'standard';
}

// ── Trip Duration Calculator ──────────────────────────────────────────────────

export function calculateTripDuration(departureDate?: string | null, returnDate?: string | null): string {
    if (!departureDate || !returnDate) {
        return '';
    }

    try {
        const start = new Date(departureDate);
        const end = new Date(returnDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return '';
        }

        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (diffDays <= 0) {
            return '';
        }

        const nights = Math.max(0, diffDays - 1);

        return `${diffDays} Hari ${nights > 0 ? `${nights} Malam` : ''}`.trim();
    } catch {
        return '';
    }
}

// ── Dropdown Options Presets (Berdasarkan Spesifikasi) ─────────────────────────

// 1. Wedding
export const WEDDING_CONCEPTS = [
    'Traditional',
    'Modern',
    'International',
    'Intimate Wedding',
    'Garden Wedding',
    'Outdoor Wedding',
    'Indoor Wedding',
    'Lainnya',
];

// 2. Prewedding
export const PREWEDDING_CONCEPTS = [
    'Casual',
    'Formal',
    'Elegant',
    'Romantic',
    'Traditional',
    'Editorial',
    'Cinematic',
    'Lifestyle',
    'Outdoor',
    'Studio',
    'Lainnya',
];

// 3. Engagement
export const ENGAGEMENT_CONCEPTS = [
    'Traditional',
    'Modern',
    'Elegant',
    'Minimalist',
    'Intimate',
    'Garden',
    'Indoor',
    'Outdoor',
    'Lainnya',
];

// 4. Family
export const FAMILY_RELATIONSHIPS = [
    'Suami',
    'Istri',
    'Anak',
    'Kakek',
    'Nenek',
    'Saudara',
    'Lainnya',
];

export const FAMILY_CONCEPTS = [
    'Casual Family',
    'Formal Family',
    'Lifestyle',
    'Studio Portrait',
    'Outdoor',
    'Home Session',
    'Extended Family',
    'Lainnya',
];

export const FAMILY_LOCATIONS = [
    'Studio',
    'Rumah',
    'Outdoor',
    'Venue',
    'Lainnya',
];

// 5. Maternity
export const MATERNITY_CONCEPTS = [
    'Elegant',
    'Minimalist',
    'Casual',
    'Fine Art',
    'Glamour',
    'Lifestyle',
    'Outdoor',
    'Studio',
    'Lainnya',
];

export const MATERNITY_LOCATIONS = [
    'Studio',
    'Rumah',
    'Outdoor',
    'Venue',
    'Lainnya',
];

export const MATERNITY_WARDROBES = [
    'Casual',
    'Formal',
    'Maternity Gown',
    'Traditional',
    'Personal Wardrobe',
    'Studio Wardrobe',
    'Lainnya',
];

// 6. Newborn
export const NEWBORN_CONCEPTS = [
    'Minimalist',
    'Wrapped',
    'Lifestyle',
    'Fine Art',
    'Natural',
    'Family Newborn',
    'Sibling',
    'Lainnya',
];

export const NEWBORN_GENDERS = [
    'Laki-laki',
    'Perempuan',
];

// 7. Birthday
export const BIRTHDAY_EVENT_TYPES = [
    'Kids Birthday',
    'Sweet 17',
    'Adult Birthday',
    'Private Party',
    'Surprise Party',
    'Lainnya',
];

export const BIRTHDAY_ENTERTAINMENT = [
    'MC',
    'Live Music',
    'Band',
    'DJ',
    'Games',
    'Performer',
    'Tidak Ada',
    'Lainnya',
];

// 8. Komunitas
export const KOMUNITAS_TYPES = [
    'Olahraga',
    'Seni',
    'Otomotif',
    'Hobi',
    'Musik',
    'Sosial',
    'Relawan',
    'Edukasi',
    'Profesional',
    'Lainnya',
];

export const KOMUNITAS_ACTIVITIES = [
    'Meetup',
    'Gathering',
    'Touring',
    'Workshop',
    'Anniversary',
    'Competition / Tournament',
    'Social Activity',
    'Lainnya',
];

// 9. Corporate
export const CORPORATE_EVENT_TYPES = [
    'Meeting',
    'Conference',
    'Seminar',
    'Workshop',
    'Gala Dinner',
    'Awarding',
    'RUPS',
    'Company Gathering',
    'Product Launch',
    'Corporate Event',
    'Lainnya',
];

export const CORPORATE_DOC_PURPOSES = [
    'Internal Documentation',
    'Company Profile',
    'Website',
    'Social Media',
    'Press Release',
    'Marketing',
    'Annual Report',
    'Lainnya',
];

// 10. Commercial
export const COMMERCIAL_PRODUCTION_PURPOSES = [
    'Product Catalog',
    'Campaign',
    'Advertising',
    'E-commerce',
    'Social Media',
    'Lookbook',
    'Company Profile',
    'Lainnya',
];

export const COMMERCIAL_BACKGROUNDS = [
    'White',
    'Solid Color',
    'Lifestyle',
    'Custom Set',
    'Transparent / Cutout',
    'Outdoor',
    'Lainnya',
];

export const COMMERCIAL_LIGHTING_STYLES = [
    'Natural',
    'Soft',
    'Dramatic',
    'High Key',
    'Low Key',
    'Commercial',
    'Lainnya',
];

export const COMMERCIAL_MOODS = [
    'Clean',
    'Minimalist',
    'Luxury',
    'Elegant',
    'Bold',
    'Natural',
    'Editorial',
    'Lifestyle',
    'Lainnya',
];

export const COMMERCIAL_PHOTO_USAGES = [
    'E-commerce',
    'Website',
    'Social Media',
    'Marketplace',
    'Digital Ads',
    'Print Ads',
    'Billboard',
    'Packaging',
    'Lainnya',
];

// 11. Event Publik
export const EVENT_TYPES = [
    'Concert',
    'Festival',
    'Seminar',
    'Conference',
    'Exhibition',
    'Competition',
    'Community Event',
    'Government Event',
    'Lainnya',
];

// 12. Traveling
export const TRAVELING_TRIP_TYPES = [
    'Family Trip',
    'Group Trip',
    'Corporate Tour',
    'Honeymoon',
    'Private Trip',
    'Community Trip',
    'Lainnya',
];

export const TRAVELING_TRANSPORTS = [
    'Pesawat',
    'Kereta',
    'Bus',
    'Mobil',
    'Kapal',
    'Kombinasi',
    'Lainnya',
];

// 13. Perorangan
export const PERORANGAN_PURPOSES = [
    'Personal Branding',
    'Graduation',
    'Portfolio',
    'Professional Profile',
    'Social Media',
    'Dating Profile',
    'Creative Portrait',
    'Lainnya',
];

export const PERORANGAN_SESSION_TYPES = [
    'Studio',
    'Outdoor',
    'Indoor Location',
    'Home Session',
    'Lainnya',
];

export const PERORANGAN_DURATIONS = [
    '30 Menit',
    '1 Jam',
    '2 Jam',
    '3 Jam',
    'Half Day',
    'Full Day',
];

export const PERORANGAN_BACKDROPS = [
    'White',
    'Black',
    'Grey',
    'Color',
    'Lifestyle',
    'Outdoor',
    'Custom',
    'Lainnya',
];

// 14. Lainnya / Tradisional
export const LAINNYA_TRADITION_TYPES = [
    'Pengajian',
    'Siraman',
    'Midodareni',
    'Tedak Siten',
    'Aqiqah',
    'Khitan',
    'Syukuran',
    'Upacara Adat',
    'Acara Keagamaan',
    'Lainnya',
];

// ── Field Labels & Error Formatter ────────────────────────────────────────────

export const FIELD_LABELS: Record<string, string> = {
    name: 'Nama Klien / Pemesan',
    phone: 'Nomor WhatsApp / Telepon',
    email: 'Email',
    preferred_contact: 'Kontak Pilihan',
    category_id: 'Kategori Project',
    client_type: 'Tipe Klien',
    event_date: 'Tanggal Acara / Sesi',
    event_time: 'Waktu / Jam Sesi',
    event_location: 'Lokasi Sesi / Acara',
    address: 'Alamat Lengkap',
    city: 'Kota / Kabupaten',
    province: 'Provinsi',
    district: 'Kecamatan',
    village: 'Kelurahan / Desa',
    postal_code: 'Kode Pos',
    package_id: 'Paket Layanan',
    client_source_id: 'Sumber Klien',
    wedding_organizer_id: 'Wedding Organizer',
    referred_by_client_id: 'Referral Klien',
    groom_name: 'Nama Calon Pengantin Pria',
    bride_name: 'Nama Calon Pengantin Wanita',
    status: 'Status Klien',
    notes: 'Catatan Klien',
};

export function formatValidationErrors(err: Record<string, any>): string {
    const entries = Object.entries(err || {});

    if (entries.length === 0) {
        return 'Silakan periksa kembali isian formulir Anda.';
    }

    return entries
        .map(([field, msg]) => {
            const label = FIELD_LABELS[field] || field.replace(/_/g, ' ');
            const message = Array.isArray(msg) ? msg.join(', ') : String(msg);

            return `${label}: ${message}`;
        })
        .join(' • ');
}
