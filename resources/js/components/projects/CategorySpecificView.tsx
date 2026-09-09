import React from 'react';
import {
    Heart,
    HeartHandshake,
    Baby,
    Camera,
    Users,
    Building2,
    Calendar,
    Clock,
    MapPin,
    Package,
    Plane,
    Sparkles,
    Tag,
    User,
    Check,
    Phone,
    Mail,
    FileText,
    Gift,
    Shield,
    Info,
} from 'lucide-react';
import {
    CategoryFormKey,
    resolveCategoryKey,
    AnyCategorySpecificData,
    ChildRepeaterItem,
} from '@/types/category-forms';
import { formatDate } from '@/lib/formatters';

interface CategorySpecificViewProps {
    project: any;
}

export function CategorySpecificView({ project }: CategorySpecificViewProps) {
    const category = project?.category;
    const categoryKey: CategoryFormKey = resolveCategoryKey(category);

    // Merge project.category_data with legacy client fields fallback
    const rawData: AnyCategorySpecificData = project?.category_data || {};
    const client = project?.client || {};

    const data: AnyCategorySpecificData = {
        // Fallbacks for common fields
        groom_name: rawData.groom_name || client.groom_name || client.partner_name || '',
        groom_nickname: rawData.groom_nickname || client.groom_nickname || '',
        groom_occupation: rawData.groom_occupation || '',
        groom_birth_date: rawData.groom_birth_date || client.groom_birth_date || '',
        groom_instagram: rawData.groom_instagram || '',
        bride_name: rawData.bride_name || client.bride_name || '',
        bride_nickname: rawData.bride_nickname || client.bride_nickname || '',
        bride_occupation: rawData.bride_occupation || '',
        bride_birth_date: rawData.bride_birth_date || client.bride_birth_date || '',
        bride_instagram: rawData.bride_instagram || '',
        father_name: rawData.father_name || client.father_name || '',
        mother_name: rawData.mother_name || client.mother_name || '',
        mom_name: rawData.mom_name || client.mother_name || client.name || '',
        partner_name: rawData.partner_name || client.partner_name || client.father_name || '',
        baby_name: rawData.baby_name || client.child_name || '',
        baby_nickname: rawData.baby_nickname || client.child_nickname || '',
        baby_birth_date: rawData.baby_birth_date || client.child_birth_date || '',
        baby_gender: rawData.baby_gender || client.child_gender || '',
        babies: (Array.isArray(rawData.babies) && rawData.babies.length > 0)
            ? rawData.babies
            : (Array.isArray(client.children) && client.children.length > 0
                ? client.children
                : undefined),
        children: (Array.isArray(rawData.children) && rawData.children.length > 0)
            ? rawData.children
            : (Array.isArray(client.children) ? client.children : []),
        company_name: rawData.company_name || client.company_name || client.name || '',
        location: rawData.location || project?.location || '',
        session_location: rawData.session_location || project?.location || '',
        ...rawData,
    };

    const renderItem = (label: string, value: any, icon?: React.ReactNode) => {
        if (!value && value !== 0) return null;
        return (
            <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block">{label}</span>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 break-words">
                    {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
                    <span>{String(value)}</span>
                </div>
            </div>
        );
    };

    const renderHeader = (title: string, subtitle: string, icon: React.ReactNode, badgeColor: string) => (
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${badgeColor}`}>
                    {icon}
                </div>
                <div>
                    <h3 className="font-bold text-sm text-slate-900">{title}</h3>
                    <p className="text-[11px] text-slate-400">{subtitle}</p>
                </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-slate-50 text-slate-700 border-slate-200">
                {category?.name || 'Kategori'}
            </span>
        </div>
    );

    return (
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            {/* ── 1. MATERNITY ──────────────────────────────────────────────── */}
            {categoryKey === 'maternity' && (
                <>
                    {renderHeader(
                        'Informasi Maternity',
                        'Detail kehamilan, hari perkiraan lahir, dan rencana sesi',
                        <Baby className="w-4 h-4 text-amber-600" />,
                        'bg-amber-50 text-amber-700'
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {renderItem('Nama Ibu (Mom-to-be)', data.mom_name)}
                        {renderItem('Nama Ayah / Pasangan', data.partner_name)}
                        {renderItem('Usia Kehamilan Saat Sesi', data.gestational_age_weeks ? `${data.gestational_age_weeks} minggu` : null)}
                        {renderItem('HPL (Hari Perkiraan Lahir)', data.hpl_date ? formatDate(data.hpl_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                        {renderItem('Konsep / Tema', data.concept_theme)}
                        {renderItem('Lokasi Sesi', data.session_location_type, <MapPin className="w-3.5 h-3.5" />)}
                    </div>
                    {data.wardrobe_notes && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                            <span className="font-semibold text-slate-600 block mb-1">👗 Wardrobe / Outfit:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.wardrobe_notes}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── 2. LAINNYA / KEBUTUHAN KHUSUS ────────────────────────────── */}
            {categoryKey === 'lainnya' && (
                <>
                    {renderHeader(
                        'Informasi Lainnya (Kebutuhan Khusus)',
                        'Detail permohonan spesifik & arahan teknis sesi',
                        <Sparkles className="w-4 h-4 text-purple-600" />,
                        'bg-purple-50 text-purple-700'
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderItem('Jenis Kebutuhan', data.needs_type)}
                        {renderItem('Lokasi', data.location, <MapPin className="w-3.5 h-3.5" />)}
                        {renderItem('Pendekatan yang Diperlukan', data.approach_type)}
                    </div>
                    {data.needs_description && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                            <span className="font-semibold text-slate-600 block">Deskripsi Kebutuhan:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.needs_description}</p>
                        </div>
                    )}
                    {data.needs_detail && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                            <span className="font-semibold text-slate-600 block">Detail Kebutuhan:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.needs_detail}</p>
                        </div>
                    )}
                    {data.special_notes && (
                        <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100 text-xs space-y-1">
                            <span className="font-semibold text-amber-800 block">Akomodasi / Catatan Khusus:</span>
                            <p className="text-amber-900 whitespace-pre-line">{data.special_notes}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── 3. PERORANGAN ────────────────────────────────────────────── */}
            {categoryKey === 'perorangan' && (
                <>
                    {renderHeader(
                        'Informasi Foto Perorangan',
                        'Tujuan foto, jenis sesi, durasi, dan setup studio',
                        <User className="w-4 h-4 text-indigo-600" />,
                        'bg-indigo-50 text-indigo-700'
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {renderItem('Tujuan Foto', data.photo_purpose)}
                        {renderItem('Jenis Sesi', data.session_type)}
                        {renderItem('Jumlah Look / Outfit', data.outfit_looks_count ? `${data.outfit_looks_count} Look` : null)}
                        {renderItem('Durasi Sesi', data.session_duration, <Clock className="w-3.5 h-3.5" />)}
                        {renderItem('Backdrop / Tema', data.backdrop_theme)}
                        {renderItem('Properti yang Diinginkan', data.desired_props)}
                    </div>
                    {data.additional_notes && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                            <span className="font-semibold text-slate-600 block mb-1">Catatan Tambahan:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.additional_notes}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── 4. PREWEDDING ────────────────────────────────────────────── */}
            {categoryKey === 'prewedding' && (
                <>
                    {renderHeader(
                        'Informasi Prewedding',
                        'Data pasangan, lokasi pemotretan, konsep, dan properti',
                        <Heart className="w-4 h-4 text-rose-600" />,
                        'bg-rose-50 text-rose-700'
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {renderItem('Nama Calon Pria (CPP)', data.groom_name)}
                        {renderItem('Nama Calon Wanita (CPW)', data.bride_name)}
                        {renderItem('Tanggal Sesi', data.session_date ? formatDate(data.session_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                        {renderItem('Konsep / Tema', data.concept_theme)}
                        {renderItem('Lokasi Sesi', data.session_location, <MapPin className="w-3.5 h-3.5" />)}
                        {renderItem('Outfit / Wardrobe', data.outfit_wardrobe)}
                        {renderItem('Jumlah Lokasi', data.locations_count ? `${data.locations_count} Lokasi` : null)}
                        {renderItem('Makeup & Hairdo', data.makeup_hairdo)}
                        {renderItem('Properti', data.props)}
                    </div>
                    {data.additional_notes && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                            <span className="font-semibold text-slate-600 block mb-1">Catatan Tambahan:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.additional_notes}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── 5. PRODUK / BRAND / COMMERCIAL ──────────────────────────── */}
            {categoryKey === 'commercial' && (
                <>
                    {renderHeader(
                        'Informasi Produk / Brand / Commercial',
                        'Tujuan komersial, jumlah SKU produk, latar, dan distribusi foto',
                        <Package className="w-4 h-4 text-emerald-600" />,
                        'bg-emerald-50 text-emerald-700'
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {renderItem('Tujuan / Kebutuhan', data.commercial_purpose)}
                        {renderItem('Jenis Produk / Brand', data.product_brand_type)}
                        {renderItem('Jumlah Produk', data.products_count ? `${data.products_count} Item / SKU` : null)}
                        {renderItem('Latar / Background', data.background_type)}
                        {renderItem('Gaya Foto / Mood', data.photo_style_mood)}
                    </div>
                    {Array.isArray(data.photo_usage) && data.photo_usage.length > 0 && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                            <span className="text-[11px] font-semibold text-slate-500 block">Penggunaan Foto:</span>
                            <div className="flex flex-wrap gap-1.5">
                                {data.photo_usage.map((usage: string) => (
                                    <span key={usage} className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#3C0E0E] text-white">
                                        {usage}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {data.reference_brief && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                            <span className="font-semibold text-slate-600 block">Referensi / Brief:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.reference_brief}</p>
                        </div>
                    )}
                    {data.additional_notes && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                            <span className="font-semibold text-slate-600 block mb-1">Catatan Tambahan:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.additional_notes}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── 6. TRAVELING ────────────────────────────────────────────── */}
            {categoryKey === 'traveling' && (
                <>
                    {renderHeader(
                        'Informasi Traveling Project',
                        'Destinasi perjalanan, jadwal keberangkatan, dan akomodasi trip',
                        <Plane className="w-4 h-4 text-sky-600" />,
                        'bg-sky-50 text-sky-700'
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {renderItem('Tujuan Destinasi', data.destination_city_country, <MapPin className="w-3.5 h-3.5" />)}
                        {renderItem('Jumlah Traveler', data.travelers_count ? `${data.travelers_count} orang` : null)}
                        {renderItem('Jenis Trip', data.trip_type)}
                        {renderItem('Durasi Trip', data.trip_duration_days ? `${data.trip_duration_days} hari` : null, <Clock className="w-3.5 h-3.5" />)}
                        {renderItem('Tanggal Berangkat', data.departure_date ? formatDate(data.departure_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                        {renderItem('Tanggal Pulang', data.return_date ? formatDate(data.return_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                        {renderItem('Maskapai', data.airline)}
                        {renderItem('Akomodasi / Hotel', data.accommodation_hotel)}
                        {renderItem('Transportasi Selama Trip', data.trip_transportation)}
                    </div>
                    {data.main_agenda_activity && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                            <span className="font-semibold text-slate-600 block">Agenda / Aktivitas Utama:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.main_agenda_activity}</p>
                        </div>
                    )}
                    {data.additional_notes && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                            <span className="font-semibold text-slate-600 block mb-1">Catatan Tambahan:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.additional_notes}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── 7. WEDDING ──────────────────────────────────────────────── */}
            {categoryKey === 'wedding' && (
                <>
                    {renderHeader(
                        'Informasi Wedding',
                        'Detail lengkap mempelai, sesi akad, resepsi, dan tim vendor',
                        <HeartHandshake className="w-4 h-4 text-rose-600" />,
                        'bg-rose-50 text-rose-700'
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* CPP Card */}
                        <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-xl border border-slate-200/80 space-y-3 shadow-2xs">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 font-semibold text-xs text-slate-900">
                                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                                    CPP
                                </div>
                                <span>Calon Pengantin Pria (CPP)</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {renderItem('Nama Lengkap', data.groom_name)}
                                {renderItem('Nama Panggilan', data.groom_nickname)}
                                {renderItem('Pekerjaan', data.groom_occupation)}
                                {renderItem('Tanggal Lahir', data.groom_birth_date ? formatDate(data.groom_birth_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                                {renderItem('Instagram', data.groom_instagram)}
                            </div>
                        </div>

                        {/* CPW Card */}
                        <div className="p-4 bg-gradient-to-br from-rose-50/40 to-pink-50/40 rounded-xl border border-rose-200/80 space-y-3 shadow-2xs">
                            <div className="flex items-center gap-2 pb-2 border-b border-rose-200/60 font-semibold text-xs text-rose-950">
                                <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[11px]">
                                    CPW
                                </div>
                                <span>Calon Pengantin Wanita (CPW)</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {renderItem('Nama Lengkap', data.bride_name)}
                                {renderItem('Nama Panggilan', data.bride_nickname)}
                                {renderItem('Pekerjaan', data.bride_occupation)}
                                {renderItem('Tanggal Lahir', data.bride_birth_date ? formatDate(data.bride_birth_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                                {renderItem('Instagram', data.bride_instagram)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderItem('Tanggal Akad', data.akad_date ? formatDate(data.akad_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                        {renderItem('Waktu Akad', data.akad_time, <Clock className="w-3.5 h-3.5" />)}
                        {renderItem('Lokasi Akad', data.akad_location, <MapPin className="w-3.5 h-3.5" />)}

                        {renderItem('Tanggal Resepsi', data.reception_date ? formatDate(data.reception_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                        {renderItem('Waktu Resepsi', data.reception_time, <Clock className="w-3.5 h-3.5" />)}
                        {renderItem('Lokasi Resepsi', data.reception_location, <MapPin className="w-3.5 h-3.5" />)}

                        {renderItem('Wedding Organizer', data.wedding_organizer)}
                        {renderItem('Estimasi Tamu', data.estimated_guests ? `${data.estimated_guests} Tamu` : null)}
                        {renderItem('Konsep / Tema', data.concept_theme)}
                        {renderItem('Venue / Gedung', data.venue_building)}
                        {renderItem('Dekorasi', data.decoration)}
                        {renderItem('Dress & MUA', data.mua_dress)}
                        {renderItem('Entertainment', data.entertainment)}
                    </div>

                    {data.additional_notes && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                            <span className="font-semibold text-slate-600 block mb-1">Catatan Tambahan:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.additional_notes}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── 8. BIRTHDAY ─────────────────────────────────────────────── */}
            {categoryKey === 'birthday' && (
                <>
                    {renderHeader(
                        'Informasi Ulang Tahun (Birthday)',
                        'Detail selebrasi, tema pesta, venue, dan rundown acara',
                        <Gift className="w-4 h-4 text-pink-600" />,
                        'bg-pink-50 text-pink-700'
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderItem('Nama yang Berulang Tahun', data.celebrant_name)}
                        {renderItem('Usia yang Dirayakan', data.celebrant_age ? `${data.celebrant_age} tahun` : null)}
                        {renderItem('Tema Ulang Tahun', data.birthday_theme)}
                        {renderItem('Jenis Acara', data.event_type)}
                        {renderItem('Jumlah Tamu', data.estimated_guests ? `${data.estimated_guests} Orang` : null)}
                        {renderItem('Venue / Tempat', data.venue_location, <MapPin className="w-3.5 h-3.5" />)}
                        {renderItem('Dekorasi / Warna Tema', data.decoration_color_theme)}
                        {renderItem('Aktivitas / Hiburan', data.activity_entertainment)}
                    </div>
                    {data.additional_notes && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                            <span className="font-semibold text-slate-600 block mb-1">Catatan Tambahan:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.additional_notes}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── 9. CORPORATE ────────────────────────────────────────────── */}
            {categoryKey === 'corporate' && (
                <>
                    {renderHeader(
                        'Informasi Corporate Event',
                        'Detail perusahaan, skala perhelatan, PIC, dan tujuan dokumentasi',
                        <Building2 className="w-4 h-4 text-blue-600" />,
                        'bg-blue-50 text-blue-700'
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderItem('Nama Perusahaan', data.company_name)}
                        {renderItem('Departemen / Divisi', data.department_division)}
                        {renderItem('Jenis Acara', data.event_type)}
                        {renderItem('Skala Acara', data.event_scale)}
                        {renderItem('Tujuan Dokumentasi', data.documentation_purpose)}
                        {renderItem('PIC / Contact Person', data.pic_name, <User className="w-3.5 h-3.5" />)}
                        {renderItem('No. Telepon PIC', data.pic_phone, <Phone className="w-3.5 h-3.5" />)}
                        {renderItem('Email PIC', data.pic_email, <Mail className="w-3.5 h-3.5" />)}
                    </div>
                    {data.special_requirements && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                            <span className="font-semibold text-slate-600 block">Kebutuhan Khusus / SOP:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.special_requirements}</p>
                        </div>
                    )}
                    {data.reference_brief && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                            <span className="font-semibold text-slate-600 block">Referensi / Brief Rundown:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.reference_brief}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── 10. ENGAGEMENT ──────────────────────────────────────────── */}
            {categoryKey === 'engagement' && (
                <>
                    {renderHeader(
                        'Informasi Engagement (Lamaran)',
                        'Detail calon mempelai, sesi lamaran, dan nuansa tema',
                        <HeartHandshake className="w-4 h-4 text-rose-600" />,
                        'bg-rose-50 text-rose-700'
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {renderItem('Nama Calon Pria (CPP)', data.groom_name)}
                        {renderItem('Nama Calon Wanita (CPW)', data.bride_name)}
                        {renderItem('Tanggal Lamaran', data.engagement_date ? formatDate(data.engagement_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                        {renderItem('Waktu Lamaran', data.engagement_time, <Clock className="w-3.5 h-3.5" />)}
                        {renderItem('Lokasi Lamaran', data.engagement_location, <MapPin className="w-3.5 h-3.5" />)}
                        {renderItem('Jumlah Tamu', data.estimated_guests ? `${data.estimated_guests} Tamu` : null)}
                        {renderItem('Konsep / Tema', data.concept_theme)}
                        {renderItem('Warna Tema', data.theme_color)}
                        {renderItem('Vendor / WO', data.vendor_wo)}
                    </div>
                    {data.additional_notes && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                            <span className="font-semibold text-slate-600 block mb-1">Catatan Tambahan:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.additional_notes}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── 11. EVENT ───────────────────────────────────────────────── */}
            {categoryKey === 'event' && (
                <>
                    {renderHeader(
                        'Informasi Event Utama',
                        'Jadwal waktu, skala pengunjung, dan rundown penyelenggara',
                        <Sparkles className="w-4 h-4 text-indigo-600" />,
                        'bg-indigo-50 text-indigo-700'
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderItem('Tanggal Event', data.event_date ? formatDate(data.event_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                        {renderItem('Waktu Event', data.event_time_range, <Clock className="w-3.5 h-3.5" />)}
                        {renderItem('Lokasi Event', data.event_location, <MapPin className="w-3.5 h-3.5" />)}
                        {renderItem('Jenis Event', data.event_type)}
                        {renderItem('Skala Event', data.event_scale)}
                        {renderItem('Nama Event', data.event_name)}
                        {renderItem('Penyelenggara / Organizer', data.organizer)}
                        {renderItem('Tema Event', data.event_theme)}
                        {renderItem('Jumlah Tamu / Hadirin', data.estimated_guests ? `${data.estimated_guests} Orang` : null)}
                        {renderItem('Dress Code', data.dress_code)}
                    </div>
                    {data.event_purpose && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                            <span className="font-semibold text-slate-600 block">Tujuan Event:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.event_purpose}</p>
                        </div>
                    )}
                    {data.rundown_agenda && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                            <span className="font-semibold text-slate-600 block">Rundown / Agenda Utama:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.rundown_agenda}</p>
                        </div>
                    )}
                    {data.additional_notes && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                            <span className="font-semibold text-slate-600 block mb-1">Catatan Tambahan:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.additional_notes}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── 12. FAMILY SESSION ──────────────────────────────────────── */}
            {categoryKey === 'family' && (
                <>
                    {renderHeader(
                        'Informasi Family Session',
                        'Potret keluarga, orang tua, anak-anak, dan lokasi pemotretan',
                        <Users className="w-4 h-4 text-amber-600" />,
                        'bg-amber-50 text-amber-700'
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderItem('Nama Keluarga', data.family_name)}
                        {renderItem('Nama Ayah', data.father_name)}
                        {renderItem('Nama Ibu', data.mother_name)}
                        {renderItem('Jumlah Anggota', data.members_count ? `${data.members_count} orang` : null)}
                        {renderItem('Lokasi Sesi', data.session_location, <MapPin className="w-3.5 h-3.5" />)}
                        {renderItem('Durasi Sesi', data.session_duration, <Clock className="w-3.5 h-3.5" />)}
                        {renderItem('Konsep / Tema', data.concept_theme)}
                    </div>

                    {/* Children badges */}
                    {Array.isArray(data.children) && data.children.length > 0 && (
                        <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-2">
                            <span className="text-[11px] font-bold text-amber-900 block">
                                👶 Daftar Anak ({data.children.length} Anak):
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {data.children.map((ch: ChildRepeaterItem, idx: number) => (
                                    <div
                                        key={idx}
                                        className="px-3 py-1.5 rounded-full bg-white border border-amber-300 shadow-2xs text-xs font-semibold text-slate-800 flex items-center gap-1"
                                    >
                                        <span>{ch.name}</span>
                                        {ch.age && (
                                            <span className="text-amber-700 text-[11px] font-medium">
                                                ({ch.age}{String(ch.age).toLowerCase().includes('th') ? '' : ' th'})
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {data.additional_notes && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                            <span className="font-semibold text-slate-600 block mb-1">Catatan Tambahan:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.additional_notes}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── 13. KOMUNITAS ───────────────────────────────────────────── */}
            {categoryKey === 'komunitas' && (
                <>
                    {renderHeader(
                        'Informasi Komunitas',
                        'Identitas komunitas, penanggung jawab (PIC), dan kegiatan',
                        <Users className="w-4 h-4 text-emerald-600" />,
                        'bg-emerald-50 text-emerald-700'
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderItem('Nama Komunitas', data.community_name)}
                        {renderItem('Jenis Komunitas', data.community_type)}
                        {renderItem('Tahun Berdiri', data.established_year)}
                        {renderItem('Jumlah Anggota', data.members_count ? `${data.members_count} Anggota` : null)}
                        {renderItem('Nama PIC / Penanggung Jawab', data.pic_name, <User className="w-3.5 h-3.5" />)}
                        {renderItem('No. Telepon PIC', data.pic_phone, <Phone className="w-3.5 h-3.5" />)}
                        {renderItem('Email Komunitas', data.pic_email, <Mail className="w-3.5 h-3.5" />)}
                        {renderItem('Jenis Kegiatan', data.activity_type)}
                        {renderItem('Tema Kegiatan', data.activity_theme)}
                    </div>
                    {data.activity_description && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                            <span className="font-semibold text-slate-600 block">Deskripsi Kegiatan:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.activity_description}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── 14. NEWBORN ─────────────────────────────────────────────── */}
            {categoryKey === 'newborn' && (
                <>
                    {renderHeader(
                        'Informasi Bayi (Newborn)',
                        'Detail kelahiran si kecil, jenis kelamin, dan nama orang tua',
                        <Baby className="w-4 h-4 text-rose-600" />,
                        'bg-rose-50 text-rose-700'
                    )}
                    {Array.isArray(data.babies) && data.babies.length > 0 ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {data.babies.map((b: any, idx: number, arr) => (
                                    <div key={idx} className="p-3.5 bg-rose-50/40 rounded-xl border border-rose-100 space-y-2">
                                        <div className="flex items-center gap-2 font-semibold text-xs text-rose-900 border-b border-rose-100 pb-1.5">
                                            <div className="w-5 h-5 rounded-full bg-rose-200/80 text-rose-800 flex items-center justify-center text-[10px] font-bold">
                                                {idx + 1}
                                            </div>
                                            <span>Bayi {arr.length > 1 ? `#${idx + 1}` : ''}</span>
                                            {arr.length > 1 && (
                                                <span className="text-[10px] text-rose-600 font-normal">(Kembar)</span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            {renderItem('Nama Lengkap', b.name)}
                                            {renderItem('Nama Panggilan', b.nickname)}
                                            {renderItem('Tanggal Lahir', b.birth_date ? formatDate(b.birth_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                                            {renderItem('Jenis Kelamin', b.gender === 'L' ? 'Laki-laki' : (b.gender === 'P' ? 'Perempuan' : b.gender))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                {renderItem('Nama Ayah', data.father_name)}
                                {renderItem('Nama Ibu', data.mother_name)}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {renderItem('Nama Bayi', data.baby_name)}
                            {renderItem('Nama Panggilan', data.baby_nickname)}
                            {renderItem('Tanggal Lahir Bayi', data.baby_birth_date ? formatDate(data.baby_birth_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                            {renderItem('Jenis Kelamin', data.baby_gender === 'L' ? 'Laki-laki' : (data.baby_gender === 'P' ? 'Perempuan' : data.baby_gender))}
                            {renderItem('Nama Ayah', data.father_name)}
                            {renderItem('Nama Ibu', data.mother_name)}
                        </div>
                    )}
                    {data.additional_notes && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                            <span className="font-semibold text-slate-600 block mb-1">Catatan Tambahan:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.additional_notes}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── STANDARD FALLBACK ────────────────────────────────────────── */}
            {categoryKey === 'standard' && (
                <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600">
                    <p>Informasi project menggunakan konfigurasi standar.</p>
                </div>
            )}
        </div>
    );
}
