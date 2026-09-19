import {
    Heart,
    HeartHandshake,
    Baby,
    Users,
    Building2,
    Calendar,
    Clock,
    MapPin,
    Plane,
    Sparkles,
    User,
    Gift,
    Camera,
    FileText,
} from 'lucide-react';
import React from 'react';
import { formatDate } from '@/lib/formatters';
import { extractProjectNoteText } from '@/lib/project-note-display';
import type {
    CategoryFormKey,
    AnyCategorySpecificData,
    BabyItem,
} from '@/types/category-forms';
import {
    resolveCategoryKey,
    getFamilyMemberCount,
    calculateTripDuration,
} from '@/types/category-forms';

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
        ...rawData,
        groom_name: rawData.groom_name || client.groom_name || '',
        bride_name: rawData.bride_name || client.bride_name || '',
        partner_1: rawData.partner_1 || client.bride_name || '',
        partner_2: rawData.partner_2 || client.groom_name || client.partner_name || '',
        mom_name: rawData.mom_name || client.mother_name || client.name || '',
        family_name: rawData.family_name || '',
        company_name: rawData.company_name || client.company_name || '',
        brand_name: rawData.brand_name || '',
        event_name: rawData.event_name || '',
        community_name: rawData.community_name || '',
        location: rawData.location || project?.location || '',
    };
    const activityDescription = extractProjectNoteText(data.activity_description);

    const renderItem = (label: string, value: any, icon?: React.ReactNode, fallback: string = '-', hideIfEmpty: boolean = true) => {
        const hasVal = value !== null && value !== undefined && String(value).trim() !== '' && String(value).trim() !== 'null' && String(value).trim() !== '-';

        if (!hasVal && hideIfEmpty) {
            return null;
        }

        return (
            <div className="space-y-1 min-w-0">
                <span className="text-[11px] font-semibold text-slate-400 block break-words leading-tight" title={label}>{label}</span>
                <div className={`text-xs flex items-start gap-1.5 min-w-0 ${hasVal ? 'font-bold text-slate-800' : 'font-normal text-slate-400'}`}>
                    {icon && <span className={`${hasVal ? 'text-slate-500' : 'text-slate-300'} shrink-0 mt-0.5`}>{icon}</span>}
                    <span className="min-w-0 flex-1 whitespace-pre-line [overflow-wrap:anywhere] leading-snug">{hasVal ? String(value) : fallback}</span>
                </div>
            </div>
        );
    };

    const renderChips = (label: string, items?: string[], otherVal?: string, hideIfEmpty: boolean = true) => {
        const list = Array.isArray(items) ? items : [];

        if (list.length === 0 && !otherVal) {
            if (hideIfEmpty) return null;

            return renderItem(label, null);
        }

        return (
            <div className="space-y-1.5 col-span-full">
                <span className="text-[11px] font-semibold text-slate-400 block">{label}</span>
                <div className="flex flex-wrap gap-1.5">
                    {list.map((it, idx) => {
                        if (it === 'Lainnya' && otherVal) {
                            return (
                                <span key={idx} className="max-w-full px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold [overflow-wrap:anywhere]">
                                    {otherVal}
                                </span>
                            );
                        }

                        return (
                            <span key={idx} className="max-w-full px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/80 text-xs font-semibold [overflow-wrap:anywhere]">
                                {it}
                            </span>
                        );
                    })}
                    {!list.includes('Lainnya') && otherVal && (
                        <span className="max-w-full px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold [overflow-wrap:anywhere]">
                            {otherVal}
                        </span>
                    )}
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
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-slate-50 text-slate-700 border-slate-200 shrink-0">
                {category?.name || 'Kategori'}
            </span>
        </div>
    );

    const renderCouple = (isPrewedding: boolean) => (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {(['groom', 'bride'] as const).map((person) => {
                const isGroom = person === 'groom';
                const prefix = isGroom ? 'groom' : 'bride';
                const name = isPrewedding
                    ? (isGroom ? data.partner_2 || data.groom_name : data.partner_1 || data.bride_name)
                    : data[`${prefix}_name`];

                return (
                    <div key={person} className={`min-w-0 space-y-3 rounded-xl border p-4 ${isGroom ? 'border-blue-100 bg-blue-50/40' : 'border-rose-100 bg-rose-50/40'}`}>
                        <h4 className="text-xs font-bold text-slate-800">Calon Pengantin {isGroom ? 'Pria (CPP)' : 'Wanita (CPW)'}</h4>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {renderItem('Nama Lengkap', name)}
                            {renderItem('Panggilan', data[`${prefix}_nickname`])}
                            {renderItem('Pekerjaan', data[`${prefix}_occupation`])}
                            {renderItem('Tanggal Lahir', data[`${prefix}_birth_date`] ? formatDate(data[`${prefix}_birth_date`]) : null)}
                            {renderItem('Instagram', data[`${prefix}_instagram`])}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            {/* ── 1. WEDDING ────────────────────────────────────────────────── */}
            {categoryKey === 'wedding' && (
                <>
                    {renderHeader(
                        'Informasi Pernikahan (Wedding)',
                        'Detail calon pengantin, jadwal & lokasi akad dan resepsi',
                        <Heart className="w-4 h-4 text-amber-600" />,
                        'bg-amber-50 text-amber-700'
                    )}
                    {/* Pasangan */}
                    {renderCouple(false)}

                    {/* Akad & Resepsi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70 space-y-2">
                            <span className="text-xs font-bold text-slate-800 block border-b border-slate-200/50 pb-1">Detail Akad</span>
                            {renderItem('Tanggal Akad', data.akad_date ? formatDate(data.akad_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                            {renderItem('Waktu Akad', data.akad_time, <Clock className="w-3.5 h-3.5" />)}
                            {renderItem('Lokasi Akad', data.akad_location, <MapPin className="w-3.5 h-3.5" />)}
                        </div>
                        <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/70 space-y-2">
                            <span className="text-xs font-bold text-slate-800 block border-b border-slate-200/50 pb-1">Detail Resepsi</span>
                            {renderItem('Tanggal Resepsi', data.reception_date ? formatDate(data.reception_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                            {renderItem('Waktu Resepsi', data.reception_time, <Clock className="w-3.5 h-3.5" />)}
                            {renderItem('Lokasi Resepsi', data.reception_location, <MapPin className="w-3.5 h-3.5" />)}
                        </div>
                    </div>

                    {/* Detail Acara */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
                        {renderItem('Estimasi Tamu', data.estimated_guests ? `${data.estimated_guests} Tamu` : null)}
                        {renderItem('Konsep Acara', data.concept_theme === 'Lainnya' ? (data.concept_theme_other || 'Lainnya') : data.concept_theme)}
                        {renderItem('Wedding Organizer (WO)', data.wedding_organizer)}
                        {renderItem('Makeup Artist (MUA)', data.makeup_artist || data.mua_dress)}
                    </div>
                </>
            )}

            {/* ── 2. PREWEDDING ─────────────────────────────────────────────── */}
            {categoryKey === 'prewedding' && (
                <>
                    {renderHeader(
                        'Informasi Prewedding',
                        'Detail pasangan, konsep sesi, wardrobe, dan lokasi',
                        <HeartHandshake className="w-4 h-4 text-pink-600" />,
                        'bg-pink-50 text-pink-700'
                    )}
                    {renderCouple(true)}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {renderItem('Tanggal Sesi Foto', data.session_date ? formatDate(data.session_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                        {renderItem('Konsep Prewedding', data.concept_theme === 'Lainnya' ? (data.concept_theme_other || 'Lainnya') : data.concept_theme)}
                        {renderItem('Lokasi Sesi', data.session_location || data.location, <MapPin className="w-3.5 h-3.5" />)}
                        {renderItem('Jumlah Lokasi', data.locations_count ? `${data.locations_count} Lokasi` : null)}
                        {renderItem('Jumlah Look / Wardrobe', data.wardrobe_looks_count ? `${data.wardrobe_looks_count} Look` : (data.outfit_wardrobe ? String(data.outfit_wardrobe) : null))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        {renderItem('Properti Khusus', data.props_special || data.props)}
                    </div>
                </>
            )}

            {/* ── 3. ENGAGEMENT ─────────────────────────────────────────────── */}
            {categoryKey === 'engagement' && (
                <>
                    {renderHeader(
                        'Informasi Engagement / Lamaran',
                        'Jadwal, venue, tema warna, dan calon mempelai',
                        <Sparkles className="w-4 h-4 text-indigo-600" />,
                        'bg-indigo-50 text-indigo-700'
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderItem('Calon Mempelai Pria', data.groom_name, <User className="w-3.5 h-3.5" />)}
                        {renderItem('Calon Mempelai Wanita', data.bride_name, <User className="w-3.5 h-3.5" />)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderItem('Tanggal Acara', data.engagement_date ? formatDate(data.engagement_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                        {renderItem('Waktu Acara', data.engagement_time, <Clock className="w-3.5 h-3.5" />)}
                        {renderItem('Estimasi Tamu', data.estimated_guests ? `${data.estimated_guests} Tamu` : null)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderItem('Lokasi Acara', data.engagement_location || data.location, <MapPin className="w-3.5 h-3.5" />)}
                        {renderItem('Konsep / Tema', data.concept_theme === 'Lainnya' ? (data.concept_theme_other || 'Lainnya') : data.concept_theme)}
                        {renderItem('Tema Warna', data.theme_color)}
                    </div>
                    {renderItem('Wedding Organizer (WO)', data.wedding_organizer || data.vendor_wo)}
                </>
            )}

            {/* ── 4. FAMILY ─────────────────────────────────────────────────── */}
            {categoryKey === 'family' && (
                <>
                    {renderHeader(
                        'Informasi Foto Keluarga',
                        'Identitas keluarga, anggota keluarga yang difoto, dan lokasi sesi',
                        <Users className="w-4 h-4 text-emerald-600" />,
                        'bg-emerald-50 text-emerald-700'
                    )}
                    {data.client_name && <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{renderItem('Nama Pemesan', data.client_name)}</div>}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderItem('Nama Keluarga', data.family_name)}
                        {renderItem('Konsep Sesi', data.concept_theme === 'Lainnya' ? (data.concept_theme_other || 'Lainnya') : data.concept_theme)}
                        {renderItem('Lokasi Sesi', data.session_location_type === 'Lainnya' ? (data.session_location || 'Lainnya') : (data.session_location_type || data.session_location || data.location), <MapPin className="w-3.5 h-3.5" />)}
                    </div>

                    {renderItem('Jumlah Anggota Keluarga yang Difoto', getFamilyMemberCount(data) > 0 ? `${getFamilyMemberCount(data)} Orang` : null)}
                </>
            )}

            {/* ── 5. MATERNITY ──────────────────────────────────────────────── */}
            {categoryKey === 'maternity' && (
                <>
                    {renderHeader(
                        'Informasi Maternity',
                        'Detail kehamilan, hari perkiraan lahir, dan rencana sesi',
                        <Baby className="w-4 h-4 text-amber-600" />,
                        'bg-amber-50 text-amber-700'
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderItem('Nama Calon Ibu', data.mom_name || data.mother_name, <User className="w-3.5 h-3.5" />)}
                        {renderItem('Usia Kandungan', data.gestational_age_weeks ? `${data.gestational_age_weeks} Minggu` : null)}
                        {renderItem('Hari Perkiraan Lahir (HPL)', data.hpl_date ? formatDate(data.hpl_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderItem('Konsep / Tema', data.concept_theme === 'Lainnya' ? (data.concept_theme_other || 'Lainnya') : data.concept_theme)}
                        {renderItem('Lokasi Sesi', data.session_location_type === 'Lainnya' ? (data.session_location || 'Lainnya') : (data.session_location_type || data.session_location || data.location), <MapPin className="w-3.5 h-3.5" />)}
                    </div>
                    {renderChips('Pilihan Wardrobe', data.wardrobe, data.wardrobe_other)}
                </>
            )}

            {/* ── 6. NEWBORN ────────────────────────────────────────────────── */}
            {categoryKey === 'newborn' && (
                <>
                    {renderHeader(
                        'Informasi Bayi (Newborn)',
                        'Detail si kecil, tanggal lahir, dan pose khusus',
                        <Baby className="w-4 h-4 text-rose-600" />,
                        'bg-rose-50 text-rose-700'
                    )}
                    {/* Repeater Bayi */}
                    {Array.isArray(data.babies) && data.babies.length > 0 ? (
                        <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-800 block">
                                Bayi yang Difoto ({data.babies.length} Bayi):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {data.babies.map((b: BabyItem, idx: number) => (
                                    <div key={idx} className="p-3 bg-rose-50/40 rounded-xl border border-rose-200/70 text-xs space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-rose-900">{b.name || `Bayi #${idx + 1}`}</span>
                                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold text-[10px]">
                                                {b.gender}
                                            </span>
                                        </div>
                                        {b.nickname && <p className="text-[11px] text-slate-500">Panggilan: {b.nickname}</p>}
                                        {b.birth_date && <p className="text-[11px] text-slate-500">Lahir: {formatDate(b.birth_date)}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Single baby fallback */
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {renderItem('Nama Bayi', data.baby_name)}
                            {renderItem('Tanggal Lahir', data.baby_birth_date ? formatDate(data.baby_birth_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                            {renderItem('Jenis Kelamin', data.baby_gender)}
                        </div>
                    )}

                    {renderChips('Konsep Sesi', data.concept_theme, data.concept_theme_other)}

                    {(data.pose_special_requests || data.additional_notes) && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                            <span className="font-semibold text-slate-600 block">Preferensi Pose / Request Khusus:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.pose_special_requests || data.additional_notes}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── 7. BIRTHDAY ───────────────────────────────────────────────── */}
            {categoryKey === 'birthday' && (
                <>
                    {renderHeader(
                        'Informasi Ulang Tahun',
                        'Detail perayaan ulang tahun dan lokasi acara',
                        <Gift className="w-4 h-4 text-purple-600" />,
                        'bg-purple-50 text-purple-700'
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderItem('Nama yang Berulang Tahun', data.celebrant_name, <User className="w-3.5 h-3.5" />)}
                        {renderItem('Usia yang Dirayakan', data.celebrant_age ? `${data.celebrant_age} Tahun` : null)}
                        {renderItem('Jenis Acara', data.event_type === 'Lainnya' ? (data.event_type_other || 'Lainnya') : data.event_type)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderItem('Estimasi Tamu', data.estimated_guests ? `${data.estimated_guests} Tamu` : null)}
                        {renderItem('Venue / Lokasi', data.venue_location || data.location, <MapPin className="w-3.5 h-3.5" />)}
                        {renderItem('Tema Acara', data.birthday_theme)}
                    </div>
                    {renderItem('Konsep Dekorasi', data.decoration_concept || data.decoration_color_theme)}
                </>
            )}

            {/* ── 8. KOMUNITAS ──────────────────────────────────────────────── */}
            {categoryKey === 'komunitas' && (
                <>
                    {renderHeader(
                        'Informasi Komunitas',
                        'Identitas komunitas, jenis kegiatan, tema, dan lokasi',
                        <Users className="w-4 h-4 text-emerald-600" />,
                        'bg-emerald-50 text-emerald-700'
                    )}
                    {data.client_name && <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{renderItem('Nama Pemesan', data.client_name)}</div>}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderItem('Nama Komunitas', data.community_name)}
                        {renderItem('Jenis Komunitas', data.community_type === 'Lainnya' ? (data.community_type_other || 'Lainnya') : data.community_type)}
                        {renderItem('Jumlah Peserta Kegiatan', data.participants_count ? `${data.participants_count} Peserta` : (data.members_count ? `${data.members_count} Anggota` : null))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderItem('Jenis Kegiatan', data.activity_type === 'Lainnya' ? (data.activity_type_other || 'Lainnya') : data.activity_type)}
                        {renderItem('Tema Kegiatan', data.activity_theme || data.concept_theme)}
                        {renderItem('Lokasi Kegiatan', data.activity_location || data.session_location || data.location, <MapPin className="w-3.5 h-3.5" />)}
                    </div>
                    {activityDescription && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                            <span className="font-semibold text-slate-600 block">Deskripsi / Agenda Kegiatan:</span>
                            <p className="text-slate-800 leading-5 whitespace-pre-line [overflow-wrap:anywhere]">{activityDescription}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── 9. CORPORATE ──────────────────────────────────────────────── */}
            {categoryKey === 'corporate' && (
                <>
                    {renderHeader(
                        'Informasi Corporate & Dokumentasi Bisnis',
                        'Detail perusahaan, agenda acara, tujuan dokumentasi, dan SOP',
                        <Building2 className="w-4 h-4 text-blue-600" />,
                        'bg-blue-50 text-blue-700'
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderItem('Nama Perusahaan', data.company_name)}
                        {renderItem('Divisi / Departemen', data.department_division)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderItem('Jenis Acara', data.event_type === 'Lainnya' ? (data.event_type_other || 'Lainnya') : data.event_type)}
                        {renderItem('Jumlah Peserta', data.participants_count ? `${data.participants_count} Peserta` : (data.event_scale || null))}
                    </div>
                    {renderChips('Tujuan Dokumentasi', data.documentation_purpose, data.documentation_purpose_other)}
                    {(data.special_rules_sop || data.special_requirements) && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                            <span className="font-semibold text-slate-600 block">Aturan / SOP Khusus:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.special_rules_sop || data.special_requirements}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── 10. COMMERCIAL / BRAND ────────────────────────────────────── */}
            {categoryKey === 'commercial' && (
                <>
                    {renderHeader(
                        'Informasi Foto Produk & Brand',
                        'Detail produk dan gaya visual pemotretan',
                        <Camera className="w-4 h-4 text-indigo-600" />,
                        'bg-indigo-50 text-indigo-700'
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderItem('Nama Brand', data.brand_name || data.company_name)}
                        {renderItem('Jenis Produk', data.product_type || data.product_brand_type)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderItem('Background', data.background_type === 'Lainnya' ? (data.background_type_other || 'Lainnya') : data.background_type)}
                        {renderItem('Lighting Style', data.lighting_style === 'Lainnya' ? (data.lighting_style_other || 'Lainnya') : data.lighting_style)}
                    </div>
                    {renderChips('Mood / Style Foto', data.mood_style, data.mood_style_other)}
                </>
            )}

            {/* ── 11. EVENT PUBLIK ──────────────────────────────────────────── */}
            {categoryKey === 'event' && (
                <>
                    {renderHeader(
                        'Informasi Event Publik',
                        'Penyelenggara, peserta, dan lokasi event',
                        <Calendar className="w-4 h-4 text-amber-600" />,
                        'bg-amber-50 text-amber-700'
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderItem('Nama Event', data.event_name)}
                        {renderItem('Penyelenggara / EO', data.organizer)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderItem('Jenis Event', data.event_type === 'Lainnya' ? (data.event_type_other || 'Lainnya') : data.event_type)}
                        {renderItem('Estimasi Peserta', data.estimated_participants ? `${data.estimated_participants} Peserta` : (data.estimated_guests ? `${data.estimated_guests} Tamu` : null))}
                        {renderItem('Dress Code', data.dress_code)}
                    </div>
                    {renderItem('Lokasi Event', data.event_location || data.location, <MapPin className="w-3.5 h-3.5" />)}
                </>
            )}

            {/* ── 12. TRAVELING ─────────────────────────────────────────────── */}
            {categoryKey === 'traveling' && (
                <>
                    {renderHeader(
                        'Informasi Dokumentasi Traveling',
                        'Destinasi, jadwal perjalanan, akomodasi, dan agenda utama',
                        <Plane className="w-4 h-4 text-sky-600" />,
                        'bg-sky-50 text-sky-700'
                    )}
                    {/* Destinasi Tags */}
                    {Array.isArray(data.destinations) && data.destinations.length > 0 ? (
                        renderChips('Destinasi Perjalanan', data.destinations)
                    ) : (
                        renderItem('Destinasi Perjalanan', data.destination_city_country || data.destination || data.location, <MapPin className="w-3.5 h-3.5" />)
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {renderItem('Jumlah Peserta', data.participants_count ? `${data.participants_count} Orang` : (data.travelers_count ? `${data.travelers_count} Orang` : null))}
                        {renderItem('Jenis Perjalanan', data.trip_type === 'Lainnya' ? (data.trip_type_other || 'Lainnya') : data.trip_type)}
                        {renderItem('Tanggal Berangkat', data.departure_date ? formatDate(data.departure_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                        {renderItem('Tanggal Pulang', data.return_date ? formatDate(data.return_date) : null, <Calendar className="w-3.5 h-3.5" />)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {renderItem('Durasi Perjalanan', calculateTripDuration(data.departure_date, data.return_date) || (data.trip_duration_days ? `${data.trip_duration_days} Hari` : null))}
                        {renderItem('Transportasi Utama', data.transportation_mode === 'Lainnya' ? (data.transportation_other || 'Lainnya') : data.transportation_mode)}
                        {renderItem('Maskapai / Kendaraan', data.airline_transport_detail || data.airline)}
                        {renderItem('Hotel / Akomodasi', data.accommodation_hotel || data.accommodation_hotel_legacy)}
                    </div>

                    {(data.main_agenda || data.main_agenda_activity) && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                            <span className="font-semibold text-slate-600 block">Agenda Utama Perjalanan:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.main_agenda || data.main_agenda_activity}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── 13. PERORANGAN ────────────────────────────────────────────── */}
            {categoryKey === 'perorangan' && (
                <>
                    {renderHeader(
                        'Informasi Sesi Perorangan (Portrait / Personal)',
                        'Tujuan foto, jenis sesi, durasi, backdrop, dan outfit',
                        <User className="w-4 h-4 text-slate-700" />,
                        'bg-slate-100 text-slate-800'
                    )}
                    {data.client_name && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{renderItem('Nama Pemesan', data.client_name)}</div>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderItem('Tujuan Foto', data.photo_purpose === 'Lainnya' ? (data.photo_purpose_other || 'Lainnya') : data.photo_purpose)}
                        {renderItem('Jenis Sesi', data.session_type === 'Lainnya' ? (data.session_type_other || 'Lainnya') : data.session_type)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {renderItem('Jumlah Look / Outfit', data.outfit_looks_count ? `${data.outfit_looks_count} Look` : null)}
                        {renderItem('Durasi Sesi', data.session_duration)}
                        {renderItem('Backdrop / Background', data.backdrop === 'Lainnya' ? (data.backdrop_other || 'Lainnya') : (data.backdrop || data.backdrop_theme))}
                    </div>
                    {renderItem('Properti Khusus Pribadi', data.special_props || data.desired_props)}
                </>
            )}

            {/* ── 14. LAINNYA / TRADISIONAL ──────────────────────────────────── */}
            {categoryKey === 'lainnya' && (
                <>
                    {renderHeader(
                        'Informasi Event Utama',
                        'Waktu, jenis kebutuhan, dan lokasi event',
                        <Sparkles className="w-4 h-4 text-indigo-600" />,
                        'bg-indigo-50 text-indigo-700'
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderItem('Nama Pemesan', data.client_name)}
                        {renderItem('Tanggal Event', data.event_date)}
                        {renderItem('Waktu Event', data.event_time_range || data.event_time)}
                        {renderItem('Jenis Event', (data.event_type || data.event_tradition_type) === 'Lainnya' ? (data.event_tradition_other || 'Lainnya') : (data.event_type || data.event_tradition_type))}
                        {renderItem('Jenis Kebutuhan', data.needs_type)}
                        {renderItem('Lokasi Event', data.event_location || data.location, <MapPin className="w-3.5 h-3.5" />)}
                    </div>
                    {(data.special_requirements || data.needs_description || data.special_notes) && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                            <span className="font-semibold text-slate-600 block">Detail Kebutuhan Khusus:</span>
                            <p className="text-slate-800 whitespace-pre-line">{data.special_requirements || data.needs_description || data.special_notes}</p>
                        </div>
                    )}
                </>
            )}

            {/* ── STANDARD FALLBACK ─────────────────────────────────────────── */}
            {categoryKey === 'standard' && (
                <>
                    {renderHeader(
                        'Informasi Umum Kebutuhan Sesi',
                        'Detail kebutuhan khusus dokumentasi',
                        <FileText className="w-4 h-4 text-slate-600" />,
                        'bg-slate-100 text-slate-700'
                    )}
                    {renderItem('Catatan Sesi', extractProjectNoteText(data.notes))}
                </>
            )}
        </div>
    );
}
