import React, { useState } from 'react';
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
    Plus,
    X,
    Trash2,
    Phone,
    Mail,
    FileText,
    HelpCircle,
    Check,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect } from '@/components/ui/native-select';
import {
    CategoryFormKey,
    AnyCategorySpecificData,
    ChildRepeaterItem,
    BabyItem,
    MATERNITY_CONCEPTS,
    MATERNITY_LOCATIONS,
    LAINNYA_NEEDS_TYPES,
    LAINNYA_APPROACHES,
    PERORANGAN_PURPOSES,
    PERORANGAN_SESSION_TYPES,
    PERORANGAN_DURATIONS,
    PERORANGAN_BACKDROPS,
    PREWEDDING_CONCEPTS,
    COMMERCIAL_PURPOSES,
    COMMERCIAL_PRODUCT_TYPES,
    COMMERCIAL_BACKGROUNDS,
    COMMERCIAL_MOODS,
    COMMERCIAL_USAGES,
    TRAVELING_TRIP_TYPES,
    TRAVELING_TRANSPORTS,
    WEDDING_CONCEPTS,
    BIRTHDAY_THEMES,
    BIRTHDAY_EVENT_TYPES,
    CORPORATE_EVENT_TYPES,
    CORPORATE_SCALES,
    CORPORATE_PURPOSES,
    ENGAGEMENT_CONCEPTS,
    EVENT_TYPES,
    EVENT_SCALES,
    FAMILY_CONCEPTS,
    FAMILY_LOCATIONS,
    FAMILY_DURATIONS,
    KOMUNITAS_TYPES,
    KOMUNITAS_ACTIVITIES,
} from '@/types/category-forms';

interface CategorySpecificFormProps {
    categoryKey: CategoryFormKey;
    categoryName?: string;
    data: AnyCategorySpecificData;
    onChange: (field: string, value: any) => void;
    errors?: Record<string, string>;
    mode?: 'admin' | 'public';
}

export function CategorySpecificForm({
    categoryKey,
    categoryName = 'Informasi Khusus Kategori',
    data,
    onChange,
    errors = {},
    mode = 'admin',
}: CategorySpecificFormProps) {
    // Local state for Family session child repeater addition
    const [newChildName, setNewChildName] = useState('');
    const [newChildAge, setNewChildAge] = useState('');
    const [isAddingChild, setIsAddingChild] = useState(false);

    const handleAddChild = () => {
        if (!newChildName.trim()) return;
        const currentChildren: ChildRepeaterItem[] = Array.isArray(data.children) ? [...data.children] : [];
        currentChildren.push({
            name: newChildName.trim(),
            age: newChildAge.trim() || undefined,
        });
        onChange('children', currentChildren);
        setNewChildName('');
        setNewChildAge('');
        setIsAddingChild(false);
    };

    const handleRemoveChild = (index: number) => {
        const currentChildren: ChildRepeaterItem[] = Array.isArray(data.children) ? [...data.children] : [];
        currentChildren.splice(index, 1);
        onChange('children', currentChildren);
    };

    const toggleCommercialUsage = (usage: string) => {
        const currentUsages: string[] = Array.isArray(data.photo_usage) ? [...data.photo_usage] : [];
        const index = currentUsages.indexOf(usage);
        if (index > -1) {
            currentUsages.splice(index, 1);
        } else {
            currentUsages.push(usage);
        }
        onChange('photo_usage', currentUsages);
    };

    // Baby repeater helpers for newborn session
    const babiesList: BabyItem[] = (Array.isArray(data.babies) && data.babies.length > 0)
        ? data.babies
        : [{
            name: data.baby_name || '',
            nickname: data.baby_nickname || '',
            birth_date: data.baby_birth_date || '',
            gender: data.baby_gender || '',
        }];

    const handleBabyChange = (index: number, field: keyof BabyItem, val: string) => {
        const updated = [...babiesList];
        updated[index] = { ...updated[index], [field]: val };
        onChange('babies', updated);
        if (index === 0) {
            if (field === 'name') onChange('baby_name', val);
            if (field === 'nickname') onChange('baby_nickname', val);
            if (field === 'birth_date') onChange('baby_birth_date', val);
            if (field === 'gender') onChange('baby_gender', val);
        }
    };

    const handleAddBaby = () => {
        const updated = [...babiesList, { name: '', nickname: '', birth_date: '', gender: '' }];
        onChange('babies', updated);
    };

    const handleRemoveBaby = (index: number) => {
        if (babiesList.length <= 1) return;
        const updated = babiesList.filter((_, i) => i !== index);
        onChange('babies', updated);
        if (updated[0]) {
            onChange('baby_name', updated[0].name || '');
            onChange('baby_nickname', updated[0].nickname || '');
            onChange('baby_birth_date', updated[0].birth_date || '');
            onChange('baby_gender', updated[0].gender || '');
        }
    };

    // Helper for input labels
    const renderLabel = (label: string, isRequired: boolean, hint?: string) => (
        <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-slate-700">
                {label} {isRequired ? <span className="text-rose-500">*</span> : <span className="text-slate-400 font-normal text-[10px]">(Opsional)</span>}
            </label>
            {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
        </div>
    );

    return (
        <div className="space-y-4">
            {/* ── 1. MATERNITY ──────────────────────────────────────────────── */}
            {categoryKey === 'maternity' && (
                <div className="space-y-4">
                    <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                        <Baby className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Dokumentasi Maternity menghadirkan potret kehangatan calon ibu dan keluarga tercinta.</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            {renderLabel('Nama Ibu (Mom-to-be)', true)}
                            <Input
                                value={data.mom_name || ''}
                                onChange={(e) => onChange('mom_name', e.target.value)}
                                placeholder="Contoh: Putri Ayuningtyas"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['mom_name'] && <p className="text-[11px] text-rose-500 mt-1">{errors['mom_name']}</p>}
                        </div>

                        <div>
                            {renderLabel('Nama Ayah / Pasangan', true)}
                            <Input
                                value={data.partner_name || ''}
                                onChange={(e) => onChange('partner_name', e.target.value)}
                                placeholder="Contoh: Dimas Setiawan"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['partner_name'] && <p className="text-[11px] text-rose-500 mt-1">{errors['partner_name']}</p>}
                        </div>

                        <div>
                            {renderLabel('Usia Kehamilan Saat Sesi', true, 'Format: Angka')}
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="1"
                                    max="42"
                                    value={data.gestational_age_weeks || ''}
                                    onChange={(e) => onChange('gestational_age_weeks', e.target.value)}
                                    placeholder="Contoh: 28"
                                    className="h-[38px] text-xs bg-white pr-16"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                                    minggu
                                </span>
                            </div>
                            {errors['gestational_age_weeks'] && <p className="text-[11px] text-rose-500 mt-1">{errors['gestational_age_weeks']}</p>}
                        </div>

                        <div>
                            {renderLabel('HPL (Hari Perkiraan Lahir)', true)}
                            <Input
                                type="date"
                                value={data.hpl_date || ''}
                                onChange={(e) => onChange('hpl_date', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['hpl_date'] && <p className="text-[11px] text-rose-500 mt-1">{errors['hpl_date']}</p>}
                        </div>

                        <div>
                            {renderLabel('Konsep / Tema', false)}
                            <NativeSelect
                                value={data.concept_theme || ''}
                                onChange={(e) => onChange('concept_theme', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Konsep / Tema...</option>
                                {MATERNITY_CONCEPTS.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </NativeSelect>
                        </div>

                        <div>
                            {renderLabel('Lokasi Sesi', false)}
                            <NativeSelect
                                value={data.session_location_type || ''}
                                onChange={(e) => onChange('session_location_type', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Lokasi Sesi...</option>
                                {MATERNITY_LOCATIONS.map((l) => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </NativeSelect>
                        </div>
                    </div>

                    <div>
                        {renderLabel('Wardrobe / Outfit', false, 'Gaun, warna, jumlah pakaian')}
                        <Textarea
                            rows={2}
                            value={data.wardrobe_notes || ''}
                            onChange={(e) => onChange('wardrobe_notes', e.target.value)}
                            placeholder="Contoh: Dress putih flowing untuk outdoor, knit cream untuk indoor studio."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── 2. LAINNYA / KEBUTUHAN KHUSUS ────────────────────────────── */}
            {categoryKey === 'lainnya' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            {renderLabel('Jenis Kebutuhan', true)}
                            <NativeSelect
                                value={data.needs_type || ''}
                                onChange={(e) => onChange('needs_type', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Jenis Kebutuhan...</option>
                                {LAINNYA_NEEDS_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </NativeSelect>
                            {errors['needs_type'] && <p className="text-[11px] text-rose-500 mt-1">{errors['needs_type']}</p>}
                        </div>

                        <div>
                            {renderLabel('Lokasi', true)}
                            <Input
                                value={data.location || ''}
                                onChange={(e) => onChange('location', e.target.value)}
                                placeholder="Contoh: Gallery Zen Space, BSD"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['location'] && <p className="text-[11px] text-rose-500 mt-1">{errors['location']}</p>}
                        </div>
                    </div>

                    <div>
                        {renderLabel('Deskripsi Kebutuhan', true)}
                        <Textarea
                            rows={3}
                            value={data.needs_description || ''}
                            onChange={(e) => onChange('needs_description', e.target.value)}
                            placeholder="Jelaskan kebutuhan dokumentasi secara ringkas dan tujuan utama dokumentasi..."
                            className="text-xs bg-white"
                        />
                        {errors['needs_description'] && <p className="text-[11px] text-rose-500 mt-1">{errors['needs_description']}</p>}
                    </div>

                    <div>
                        {renderLabel('Detail Kebutuhan', true)}
                        <Textarea
                            rows={3}
                            value={data.needs_detail || ''}
                            onChange={(e) => onChange('needs_detail', e.target.value)}
                            placeholder="Detail rundown, objek spesifik yang harus difoto, teknis output yang diminta..."
                            className="text-xs bg-white"
                        />
                        {errors['needs_detail'] && <p className="text-[11px] text-rose-500 mt-1">{errors['needs_detail']}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            {renderLabel('Pendekatan yang Diperlukan', false)}
                            <NativeSelect
                                value={data.approach_type || ''}
                                onChange={(e) => onChange('approach_type', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Pendekatan...</option>
                                {LAINNYA_APPROACHES.map((a) => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </NativeSelect>
                        </div>

                        <div>
                            {renderLabel('Akomodasi / Catatan Khusus', false)}
                            <Textarea
                                rows={2}
                                value={data.special_notes || ''}
                                onChange={(e) => onChange('special_notes', e.target.value)}
                                placeholder="Transportasi tim, izin lokasi, protokol khusus..."
                                className="text-xs bg-white"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ── 3. PERORANGAN ────────────────────────────────────────────── */}
            {categoryKey === 'perorangan' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            {renderLabel('Tujuan Foto', true)}
                            <NativeSelect
                                value={data.photo_purpose || ''}
                                onChange={(e) => onChange('photo_purpose', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Tujuan Foto...</option>
                                {PERORANGAN_PURPOSES.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </NativeSelect>
                            {errors['photo_purpose'] && <p className="text-[11px] text-rose-500 mt-1">{errors['photo_purpose']}</p>}
                        </div>

                        <div>
                            {renderLabel('Jenis Sesi', true)}
                            <NativeSelect
                                value={data.session_type || ''}
                                onChange={(e) => onChange('session_type', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Jenis Sesi...</option>
                                {PERORANGAN_SESSION_TYPES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </NativeSelect>
                            {errors['session_type'] && <p className="text-[11px] text-rose-500 mt-1">{errors['session_type']}</p>}
                        </div>

                        <div>
                            {renderLabel('Jumlah Look / Outfit', true)}
                            <Input
                                type="number"
                                min="1"
                                value={data.outfit_looks_count || ''}
                                onChange={(e) => onChange('outfit_looks_count', e.target.value)}
                                placeholder="Contoh: 2"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['outfit_looks_count'] && <p className="text-[11px] text-rose-500 mt-1">{errors['outfit_looks_count']}</p>}
                        </div>

                        <div>
                            {renderLabel('Durasi Sesi', true)}
                            <NativeSelect
                                value={data.session_duration || ''}
                                onChange={(e) => onChange('session_duration', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Durasi Sesi...</option>
                                {PERORANGAN_DURATIONS.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </NativeSelect>
                            {errors['session_duration'] && <p className="text-[11px] text-rose-500 mt-1">{errors['session_duration']}</p>}
                        </div>

                        <div>
                            {renderLabel('Backdrop / Tema', false)}
                            <NativeSelect
                                value={data.backdrop_theme || ''}
                                onChange={(e) => onChange('backdrop_theme', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Backdrop / Tema...</option>
                                {PERORANGAN_BACKDROPS.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </NativeSelect>
                        </div>

                        <div>
                            {renderLabel('Properti yang Diinginkan', false)}
                            <Input
                                value={data.desired_props || ''}
                                onChange={(e) => onChange('desired_props', e.target.value)}
                                placeholder="Contoh: Laptop, buku, kursi bar kayu"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        {renderLabel('Catatan Tambahan', false)}
                        <Textarea
                            rows={2}
                            value={data.additional_notes || ''}
                            onChange={(e) => onChange('additional_notes', e.target.value)}
                            placeholder="Catatan pose referensi, preferensi angle terbaik..."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── 4. PREWEDDING ────────────────────────────────────────────── */}
            {categoryKey === 'prewedding' && (
                <div className="space-y-4">
                    <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs text-rose-900 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Sesi Prewedding untuk mengabadikan kisah cinta Anda dalam visual yang sinematik & berkelas.</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            {renderLabel('Nama Pasangan Pria (CPP)', true)}
                            <Input
                                value={data.groom_name || ''}
                                onChange={(e) => onChange('groom_name', e.target.value)}
                                placeholder="Nama lengkap calon mempelai pria"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['groom_name'] && <p className="text-[11px] text-rose-500 mt-1">{errors['groom_name']}</p>}
                        </div>

                        <div>
                            {renderLabel('Nama Pasangan Wanita (CPW)', true)}
                            <Input
                                value={data.bride_name || ''}
                                onChange={(e) => onChange('bride_name', e.target.value)}
                                placeholder="Nama lengkap calon mempelai wanita"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['bride_name'] && <p className="text-[11px] text-rose-500 mt-1">{errors['bride_name']}</p>}
                        </div>

                        <div>
                            {renderLabel('Tanggal Sesi', true)}
                            <Input
                                type="date"
                                value={data.session_date || ''}
                                onChange={(e) => onChange('session_date', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['session_date'] && <p className="text-[11px] text-rose-500 mt-1">{errors['session_date']}</p>}
                        </div>

                        <div>
                            {renderLabel('Konsep / Tema', true)}
                            <NativeSelect
                                value={data.concept_theme || ''}
                                onChange={(e) => onChange('concept_theme', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Konsep / Tema...</option>
                                {PREWEDDING_CONCEPTS.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </NativeSelect>
                            {errors['concept_theme'] && <p className="text-[11px] text-rose-500 mt-1">{errors['concept_theme']}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            {renderLabel('Lokasi Sesi', true)}
                            <Input
                                value={data.session_location || ''}
                                onChange={(e) => onChange('session_location', e.target.value)}
                                placeholder="Contoh: Hutan Pinus Mangunan & Studio Arams"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['session_location'] && <p className="text-[11px] text-rose-500 mt-1">{errors['session_location']}</p>}
                        </div>

                        <div>
                            {renderLabel('Outfit / Wardrobe', false)}
                            <Input
                                value={data.outfit_wardrobe || ''}
                                onChange={(e) => onChange('outfit_wardrobe', e.target.value)}
                                placeholder="Contoh: 2 Outfit (Adat Jawa & Modern Suit/Gown)"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Jumlah Lokasi', false)}
                            <Input
                                type="number"
                                min="1"
                                value={data.locations_count || ''}
                                onChange={(e) => onChange('locations_count', e.target.value)}
                                placeholder="Contoh: 2"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Makeup & Hairdo', false)}
                            <Input
                                value={data.makeup_hairdo || ''}
                                onChange={(e) => onChange('makeup_hairdo', e.target.value)}
                                placeholder="Nama MUA atau 'Disediakan Sendiri'"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Properti', false)}
                            <Input
                                value={data.props || ''}
                                onChange={(e) => onChange('props', e.target.value)}
                                placeholder="Contoh: Bouquet bunga, payung transparan, mobil klasik"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        {renderLabel('Catatan Tambahan', false)}
                        <Textarea
                            rows={2}
                            value={data.additional_notes || ''}
                            onChange={(e) => onChange('additional_notes', e.target.value)}
                            placeholder="Catatan khusus, request khusus, atau moodboard..."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── 5. PRODUK / BRAND / COMMERCIAL ──────────────────────────── */}
            {categoryKey === 'commercial' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            {renderLabel('Tujuan / Jenis Kebutuhan', true)}
                            <NativeSelect
                                value={data.commercial_purpose || ''}
                                onChange={(e) => onChange('commercial_purpose', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Tujuan Kebutuhan...</option>
                                {COMMERCIAL_PURPOSES.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </NativeSelect>
                            {errors['commercial_purpose'] && <p className="text-[11px] text-rose-500 mt-1">{errors['commercial_purpose']}</p>}
                        </div>

                        <div>
                            {renderLabel('Jenis Produk / Brand', true)}
                            <Input
                                value={data.product_brand_type || ''}
                                onChange={(e) => onChange('product_brand_type', e.target.value)}
                                placeholder="Contoh: Skincare Serum & Face Wash / Fashion Batik"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['product_brand_type'] && <p className="text-[11px] text-rose-500 mt-1">{errors['product_brand_type']}</p>}
                        </div>

                        <div>
                            {renderLabel('Jumlah Produk (SKU / Varian)', true)}
                            <Input
                                type="number"
                                min="1"
                                value={data.products_count || ''}
                                onChange={(e) => onChange('products_count', e.target.value)}
                                placeholder="Contoh: 10"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['products_count'] && <p className="text-[11px] text-rose-500 mt-1">{errors['products_count']}</p>}
                        </div>

                        <div>
                            {renderLabel('Latar / Background', true)}
                            <NativeSelect
                                value={data.background_type || ''}
                                onChange={(e) => onChange('background_type', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Latar / Background...</option>
                                {COMMERCIAL_BACKGROUNDS.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </NativeSelect>
                            {errors['background_type'] && <p className="text-[11px] text-rose-500 mt-1">{errors['background_type']}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            {renderLabel('Gaya Foto / Mood', true)}
                            <NativeSelect
                                value={data.photo_style_mood || ''}
                                onChange={(e) => onChange('photo_style_mood', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Gaya Foto / Mood...</option>
                                {COMMERCIAL_MOODS.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </NativeSelect>
                            {errors['photo_style_mood'] && <p className="text-[11px] text-rose-500 mt-1">{errors['photo_style_mood']}</p>}
                        </div>
                    </div>

                    {/* Penggunaan Foto (Multi Select Tag Badges) */}
                    <div>
                        {renderLabel('Penggunaan Foto (Bisa Pilih Lebih Dari 1)', true)}
                        <div className="flex flex-wrap gap-2 mt-1.5 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50">
                            {COMMERCIAL_USAGES.map((usage) => {
                                const isSelected = Array.isArray(data.photo_usage) && data.photo_usage.includes(usage);
                                return (
                                    <button
                                        type="button"
                                        key={usage}
                                        onClick={() => toggleCommercialUsage(usage)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                                            isSelected
                                                ? 'bg-[#3C0E0E] text-white border-[#3C0E0E] shadow-2xs'
                                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        {isSelected && <Check className="w-3 h-3" />}
                                        <span>{usage}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {errors['photo_usage'] && <p className="text-[11px] text-rose-500 mt-1">{errors['photo_usage']}</p>}
                    </div>

                    <div>
                        {renderLabel('Referensi / Brief', false)}
                        <Textarea
                            rows={3}
                            value={data.reference_brief || ''}
                            onChange={(e) => onChange('reference_brief', e.target.value)}
                            placeholder="Link Google Drive moodboard, link referensi Pinterest/Instagram, atau brief format file..."
                            className="text-xs bg-white"
                        />
                    </div>

                    <div>
                        {renderLabel('Catatan Tambahan', false)}
                        <Textarea
                            rows={2}
                            value={data.additional_notes || ''}
                            onChange={(e) => onChange('additional_notes', e.target.value)}
                            placeholder="Catatan pengiriman produk, jadwal return produk..."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── 6. TRAVELING ────────────────────────────────────────────── */}
            {categoryKey === 'traveling' && (
                <div className="space-y-4">
                    <div className="p-3 bg-sky-50/70 border border-sky-200/80 rounded-xl text-xs text-sky-900 flex items-center gap-2">
                        <Plane className="w-4 h-4 text-sky-600 shrink-0" />
                        <span>Dokumentasi perjalanan traveling eksklusif bersama fotografer profesional Arams Pictures.</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            {renderLabel('Tanggal Berangkat (Mulai Trip)', true)}
                            <Input
                                type="date"
                                value={data.departure_date || ''}
                                onChange={(e) => onChange('departure_date', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['departure_date'] && <p className="text-[11px] text-rose-500 mt-1">{errors['departure_date']}</p>}
                        </div>

                        <div>
                            {renderLabel('Tanggal Pulang (Selesai Trip)', true)}
                            <Input
                                type="date"
                                value={data.return_date || ''}
                                onChange={(e) => onChange('return_date', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['return_date'] && <p className="text-[11px] text-rose-500 mt-1">{errors['return_date']}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            {renderLabel('Tujuan Destinasi (Negara / Kota)', true)}
                            <Input
                                value={data.destination_city_country || ''}
                                onChange={(e) => onChange('destination_city_country', e.target.value)}
                                placeholder="Contoh: Kyoto & Tokyo, Jepang / Labuan Bajo, NTT"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['destination_city_country'] && <p className="text-[11px] text-rose-500 mt-1">{errors['destination_city_country']}</p>}
                        </div>

                        <div>
                            {renderLabel('Jumlah Traveler (Peserta)', true)}
                            <Input
                                type="number"
                                min="1"
                                value={data.travelers_count || ''}
                                onChange={(e) => onChange('travelers_count', e.target.value)}
                                placeholder="Contoh: 4"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['travelers_count'] && <p className="text-[11px] text-rose-500 mt-1">{errors['travelers_count']}</p>}
                        </div>

                        <div>
                            {renderLabel('Jenis Trip', true)}
                            <NativeSelect
                                value={data.trip_type || ''}
                                onChange={(e) => onChange('trip_type', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Jenis Trip...</option>
                                {TRAVELING_TRIP_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </NativeSelect>
                            {errors['trip_type'] && <p className="text-[11px] text-rose-500 mt-1">{errors['trip_type']}</p>}
                        </div>

                        <div>
                            {renderLabel('Durasi Trip', true)}
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="1"
                                    value={data.trip_duration_days || ''}
                                    onChange={(e) => onChange('trip_duration_days', e.target.value)}
                                    placeholder="Contoh: 5"
                                    className="h-[38px] text-xs bg-white pr-14"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                                    hari
                                </span>
                            </div>
                            {errors['trip_duration_days'] && <p className="text-[11px] text-rose-500 mt-1">{errors['trip_duration_days']}</p>}
                        </div>

                        <div>
                            {renderLabel('Transportasi Selama Trip', false)}
                            <NativeSelect
                                value={data.trip_transportation || ''}
                                onChange={(e) => onChange('trip_transportation', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Transportasi...</option>
                                {TRAVELING_TRANSPORTS.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </NativeSelect>
                        </div>

                        <div>
                            {renderLabel('Maskapai Penerbangan', false)}
                            <Input
                                value={data.airline || ''}
                                onChange={(e) => onChange('airline', e.target.value)}
                                placeholder="Contoh: Garuda Indonesia / Singapore Airlines"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Akomodasi / Hotel', false)}
                            <Input
                                value={data.accommodation_hotel || ''}
                                onChange={(e) => onChange('accommodation_hotel', e.target.value)}
                                placeholder="Contoh: Hoshinoya Kyoto & Shinjuku Prince Hotel"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        {renderLabel('Aktivitas / Agenda Utama', false)}
                        <Textarea
                            rows={2}
                            value={data.main_agenda_activity || ''}
                            onChange={(e) => onChange('main_agenda_activity', e.target.value)}
                            placeholder="Contoh: Hari 1: Arashiyama Bamboo & Kimono Walk, Hari 2: Fushimi Inari Sunrise..."
                            className="text-xs bg-white"
                        />
                    </div>

                    <div>
                        {renderLabel('Catatan Tambahan', false)}
                        <Textarea
                            rows={2}
                            value={data.additional_notes || ''}
                            onChange={(e) => onChange('additional_notes', e.target.value)}
                            placeholder="Kebutuhan drone, gear khusus, atau preferensi bahasa fotografer..."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── 7. WEDDING ──────────────────────────────────────────────── */}
            {categoryKey === 'wedding' && (
                <div className="space-y-4">
                    {/* Informasi Calon Pengantin Pria (CPP) & Calon Pengantin Wanita (CPW) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* CPP Card */}
                        <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200/80 rounded-xl space-y-3 shadow-xs">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                                <div className="flex items-center gap-2 font-semibold text-xs text-slate-900">
                                    <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                                        CPP
                                    </div>
                                    <span>Informasi Calon Pengantin Pria (CPP)</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    {renderLabel('Nama Lengkap', true)}
                                    <Input
                                        value={data.groom_name || ''}
                                        onChange={(e) => onChange('groom_name', e.target.value)}
                                        placeholder="Nama lengkap CPP"
                                        className="h-[38px] text-xs bg-white"
                                    />
                                    {errors['groom_name'] && <p className="text-[11px] text-rose-500 mt-1">{errors['groom_name']}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        {renderLabel('Panggilan', true)}
                                        <Input
                                            value={data.groom_nickname || ''}
                                            onChange={(e) => onChange('groom_nickname', e.target.value)}
                                            placeholder="Nama panggilan CPP"
                                            className="h-[38px] text-xs bg-white"
                                        />
                                        {errors['groom_nickname'] && <p className="text-[11px] text-rose-500 mt-1">{errors['groom_nickname']}</p>}
                                    </div>

                                    <div>
                                        {renderLabel('Pekerjaan', false)}
                                        <Input
                                            value={data.groom_occupation || ''}
                                            onChange={(e) => onChange('groom_occupation', e.target.value)}
                                            placeholder="Pekerjaan CPP"
                                            className="h-[38px] text-xs bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        {renderLabel('Tanggal Lahir', false)}
                                        <Input
                                            type="date"
                                            value={data.groom_birth_date || ''}
                                            onChange={(e) => onChange('groom_birth_date', e.target.value)}
                                            className="h-[38px] text-xs bg-white"
                                        />
                                    </div>

                                    <div>
                                        {renderLabel('Akun Instagram', false)}
                                        <Input
                                            value={data.groom_instagram || ''}
                                            onChange={(e) => onChange('groom_instagram', e.target.value)}
                                            placeholder="@username"
                                            className="h-[38px] text-xs bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CPW Card */}
                        <div className="p-4 bg-gradient-to-br from-rose-50/40 to-pink-50/40 border border-rose-200/80 rounded-xl space-y-3 shadow-xs">
                            <div className="flex items-center justify-between pb-2 border-b border-rose-200/60">
                                <div className="flex items-center gap-2 font-semibold text-xs text-rose-950">
                                    <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[11px]">
                                        CPW
                                    </div>
                                    <span>Informasi Calon Pengantin Wanita (CPW)</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    {renderLabel('Nama Lengkap', true)}
                                    <Input
                                        value={data.bride_name || ''}
                                        onChange={(e) => onChange('bride_name', e.target.value)}
                                        placeholder="Nama lengkap CPW"
                                        className="h-[38px] text-xs bg-white"
                                    />
                                    {errors['bride_name'] && <p className="text-[11px] text-rose-500 mt-1">{errors['bride_name']}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        {renderLabel('Panggilan', true)}
                                        <Input
                                            value={data.bride_nickname || ''}
                                            onChange={(e) => onChange('bride_nickname', e.target.value)}
                                            placeholder="Nama panggilan CPW"
                                            className="h-[38px] text-xs bg-white"
                                        />
                                        {errors['bride_nickname'] && <p className="text-[11px] text-rose-500 mt-1">{errors['bride_nickname']}</p>}
                                    </div>

                                    <div>
                                        {renderLabel('Pekerjaan', false)}
                                        <Input
                                            value={data.bride_occupation || ''}
                                            onChange={(e) => onChange('bride_occupation', e.target.value)}
                                            placeholder="Pekerjaan CPW"
                                            className="h-[38px] text-xs bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        {renderLabel('Tanggal Lahir', false)}
                                        <Input
                                            type="date"
                                            value={data.bride_birth_date || ''}
                                            onChange={(e) => onChange('bride_birth_date', e.target.value)}
                                            className="h-[38px] text-xs bg-white"
                                        />
                                    </div>

                                    <div>
                                        {renderLabel('Akun Instagram', false)}
                                        <Input
                                            value={data.bride_instagram || ''}
                                            onChange={(e) => onChange('bride_instagram', e.target.value)}
                                            placeholder="@username"
                                            className="h-[38px] text-xs bg-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Akad */}
                    <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                            <Calendar className="w-4 h-4 text-indigo-600" />
                            <span>Informasi Sesi Akad / Pemberkatan</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                {renderLabel('Tanggal Akad', true)}
                                <Input
                                    type="date"
                                    value={data.akad_date || ''}
                                    onChange={(e) => onChange('akad_date', e.target.value)}
                                    className="h-[38px] text-xs bg-white"
                                />
                                {errors['akad_date'] && <p className="text-[11px] text-rose-500 mt-1">{errors['akad_date']}</p>}
                            </div>

                            <div>
                                {renderLabel('Waktu Akad', true)}
                                <Input
                                    type="time"
                                    value={data.akad_time || ''}
                                    onChange={(e) => onChange('akad_time', e.target.value)}
                                    className="h-[38px] text-xs bg-white"
                                />
                                {errors['akad_time'] && <p className="text-[11px] text-rose-500 mt-1">{errors['akad_time']}</p>}
                            </div>

                            <div>
                                {renderLabel('Lokasi Akad', true)}
                                <Input
                                    value={data.akad_location || ''}
                                    onChange={(e) => onChange('akad_location', e.target.value)}
                                    placeholder="Masjid / Gereja / Venue Akad"
                                    className="h-[38px] text-xs bg-white"
                                />
                                {errors['akad_location'] && <p className="text-[11px] text-rose-500 mt-1">{errors['akad_location']}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Resepsi */}
                    <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            <span>Informasi Sesi Resepsi</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                {renderLabel('Tanggal Resepsi', true)}
                                <Input
                                    type="date"
                                    value={data.reception_date || ''}
                                    onChange={(e) => onChange('reception_date', e.target.value)}
                                    className="h-[38px] text-xs bg-white"
                                />
                                {errors['reception_date'] && <p className="text-[11px] text-rose-500 mt-1">{errors['reception_date']}</p>}
                            </div>

                            <div>
                                {renderLabel('Waktu Resepsi', true)}
                                <Input
                                    type="time"
                                    value={data.reception_time || ''}
                                    onChange={(e) => onChange('reception_time', e.target.value)}
                                    className="h-[38px] text-xs bg-white"
                                />
                                {errors['reception_time'] && <p className="text-[11px] text-rose-500 mt-1">{errors['reception_time']}</p>}
                            </div>

                            <div>
                                {renderLabel('Lokasi Resepsi', true)}
                                <Input
                                    value={data.reception_location || ''}
                                    onChange={(e) => onChange('reception_location', e.target.value)}
                                    placeholder="Ballroom / Gedung Resepsi"
                                    className="h-[38px] text-xs bg-white"
                                />
                                {errors['reception_location'] && <p className="text-[11px] text-rose-500 mt-1">{errors['reception_location']}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Vendor & Detail Pendukung */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            {renderLabel('Wedding Organizer', false)}
                            <Input
                                value={data.wedding_organizer || ''}
                                onChange={(e) => onChange('wedding_organizer', e.target.value)}
                                placeholder="Nama WO & Kontak"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Estimasi Jumlah Tamu', false)}
                            <Input
                                type="number"
                                min="0"
                                value={data.estimated_guests || ''}
                                onChange={(e) => onChange('estimated_guests', e.target.value)}
                                placeholder="Contoh: 500"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Konsep / Tema', false)}
                            <NativeSelect
                                value={data.concept_theme || ''}
                                onChange={(e) => onChange('concept_theme', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Konsep Wedding...</option>
                                {WEDDING_CONCEPTS.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </NativeSelect>
                        </div>

                        <div>
                            {renderLabel('Venue / Gedung', false)}
                            <Input
                                value={data.venue_building || ''}
                                onChange={(e) => onChange('venue_building', e.target.value)}
                                placeholder="Contoh: Grand Ballroom Hotel Mulia"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Dekorasi', false)}
                            <Input
                                value={data.decoration || ''}
                                onChange={(e) => onChange('decoration', e.target.value)}
                                placeholder="Nama vendor dekorasi"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Dress & MUA', false)}
                            <Input
                                value={data.mua_dress || ''}
                                onChange={(e) => onChange('mua_dress', e.target.value)}
                                placeholder="Nama MUA & Desainer gaun"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div className="sm:col-span-3">
                            {renderLabel('Entertainment & Sound', false)}
                            <Input
                                value={data.entertainment || ''}
                                onChange={(e) => onChange('entertainment', e.target.value)}
                                placeholder="Band akustik, orchestra, MC kondang..."
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        {renderLabel('Catatan Tambahan', false)}
                        <Textarea
                            rows={2}
                            value={data.additional_notes || ''}
                            onChange={(e) => onChange('additional_notes', e.target.value)}
                            placeholder="Catatan khusus prosesi adat, susunan VIP, atau preferensi pose..."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── 8. BIRTHDAY ─────────────────────────────────────────────── */}
            {categoryKey === 'birthday' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            {renderLabel('Nama yang Berulang Tahun', true)}
                            <Input
                                value={data.celebrant_name || ''}
                                onChange={(e) => onChange('celebrant_name', e.target.value)}
                                placeholder="Nama yang merayakan ulang tahun"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['celebrant_name'] && <p className="text-[11px] text-rose-500 mt-1">{errors['celebrant_name']}</p>}
                        </div>

                        <div>
                            {renderLabel('Usia yang Dirayakan', true)}
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="1"
                                    value={data.celebrant_age || ''}
                                    onChange={(e) => onChange('celebrant_age', e.target.value)}
                                    placeholder="Contoh: 17"
                                    className="h-[38px] text-xs bg-white pr-14"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                                    tahun
                                </span>
                            </div>
                            {errors['celebrant_age'] && <p className="text-[11px] text-rose-500 mt-1">{errors['celebrant_age']}</p>}
                        </div>

                        <div>
                            {renderLabel('Tema Ulang Tahun', true)}
                            <NativeSelect
                                value={data.birthday_theme || ''}
                                onChange={(e) => onChange('birthday_theme', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Tema Ulang Tahun...</option>
                                {BIRTHDAY_THEMES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </NativeSelect>
                            {errors['birthday_theme'] && <p className="text-[11px] text-rose-500 mt-1">{errors['birthday_theme']}</p>}
                        </div>

                        <div>
                            {renderLabel('Jenis Acara', true)}
                            <NativeSelect
                                value={data.event_type || ''}
                                onChange={(e) => onChange('event_type', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Jenis Acara...</option>
                                {BIRTHDAY_EVENT_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </NativeSelect>
                            {errors['event_type'] && <p className="text-[11px] text-rose-500 mt-1">{errors['event_type']}</p>}
                        </div>

                        <div>
                            {renderLabel('Jumlah Tamu Undangan', true)}
                            <Input
                                type="number"
                                min="1"
                                value={data.estimated_guests || ''}
                                onChange={(e) => onChange('estimated_guests', e.target.value)}
                                placeholder="Contoh: 100"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['estimated_guests'] && <p className="text-[11px] text-rose-500 mt-1">{errors['estimated_guests']}</p>}
                        </div>

                        <div>
                            {renderLabel('Venue / Tempat', false)}
                            <Input
                                value={data.venue_location || ''}
                                onChange={(e) => onChange('venue_location', e.target.value)}
                                placeholder="Restoran, cafe, atau hall pesta"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Dekorasi / Warna Tema', false)}
                            <Input
                                value={data.decoration_color_theme || ''}
                                onChange={(e) => onChange('decoration_color_theme', e.target.value)}
                                placeholder="Contoh: Rose Gold & White Pastel"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Aktivitas / Hiburan', false)}
                            <Input
                                value={data.activity_entertainment || ''}
                                onChange={(e) => onChange('activity_entertainment', e.target.value)}
                                placeholder="Magic show, games, candle ceremony..."
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        {renderLabel('Catatan Tambahan', false)}
                        <Textarea
                            rows={2}
                            value={data.additional_notes || ''}
                            onChange={(e) => onChange('additional_notes', e.target.value)}
                            placeholder="Momen surprise, rundown tiup lilin..."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── 9. CORPORATE ────────────────────────────────────────────── */}
            {categoryKey === 'corporate' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            {renderLabel('Nama Perusahaan / Organisasi', true)}
                            <Input
                                value={data.company_name || ''}
                                onChange={(e) => onChange('company_name', e.target.value)}
                                placeholder="Contoh: PT Telkom Indonesia"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['company_name'] && <p className="text-[11px] text-rose-500 mt-1">{errors['company_name']}</p>}
                        </div>

                        <div>
                            {renderLabel('Departemen / Divisi', false)}
                            <Input
                                value={data.department_division || ''}
                                onChange={(e) => onChange('department_division', e.target.value)}
                                placeholder="Contoh: Corporate Communications & HR"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Jenis Acara', true)}
                            <NativeSelect
                                value={data.event_type || ''}
                                onChange={(e) => onChange('event_type', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Jenis Acara...</option>
                                {CORPORATE_EVENT_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </NativeSelect>
                            {errors['event_type'] && <p className="text-[11px] text-rose-500 mt-1">{errors['event_type']}</p>}
                        </div>

                        <div>
                            {renderLabel('Skala Acara', true)}
                            <NativeSelect
                                value={data.event_scale || ''}
                                onChange={(e) => onChange('event_scale', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Skala Acara...</option>
                                {CORPORATE_SCALES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </NativeSelect>
                            {errors['event_scale'] && <p className="text-[11px] text-rose-500 mt-1">{errors['event_scale']}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            {renderLabel('Tujuan Dokumentasi', true)}
                            <NativeSelect
                                value={data.documentation_purpose || ''}
                                onChange={(e) => onChange('documentation_purpose', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Tujuan Dokumentasi...</option>
                                {CORPORATE_PURPOSES.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </NativeSelect>
                            {errors['documentation_purpose'] && <p className="text-[11px] text-rose-500 mt-1">{errors['documentation_purpose']}</p>}
                        </div>

                        <div>
                            {renderLabel('PIC / Contact Person', true)}
                            <Input
                                value={data.pic_name || ''}
                                onChange={(e) => onChange('pic_name', e.target.value)}
                                placeholder="Nama penanggung jawab"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['pic_name'] && <p className="text-[11px] text-rose-500 mt-1">{errors['pic_name']}</p>}
                        </div>

                        <div>
                            {renderLabel('No. Telepon PIC', true)}
                            <Input
                                value={data.pic_phone || ''}
                                onChange={(e) => onChange('pic_phone', e.target.value)}
                                placeholder="Contoh: 081234567890"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['pic_phone'] && <p className="text-[11px] text-rose-500 mt-1">{errors['pic_phone']}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            {renderLabel('Email PIC', false)}
                            <Input
                                type="email"
                                value={data.pic_email || ''}
                                onChange={(e) => onChange('pic_email', e.target.value)}
                                placeholder="pic@perusahaan.com"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        {renderLabel('Kebutuhan Khusus / SOP Keamanan', false)}
                        <Textarea
                            rows={2}
                            value={data.special_requirements || ''}
                            onChange={(e) => onChange('special_requirements', e.target.value)}
                            placeholder="SOP dress code formal/batik, ID card visitor, embargo publikasi..."
                            className="text-xs bg-white"
                        />
                    </div>

                    <div>
                        {renderLabel('Referensi / Brief Rundown', false)}
                        <Textarea
                            rows={2}
                            value={data.reference_brief || ''}
                            onChange={(e) => onChange('reference_brief', e.target.value)}
                            placeholder="Link susunan acara, rundown timeline, VIP tamu kehormatan..."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── 10. ENGAGEMENT ──────────────────────────────────────────── */}
            {categoryKey === 'engagement' && (
                <div className="space-y-4">
                    <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs text-rose-900 flex items-center gap-2">
                        <HeartHandshake className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Dokumentasi prosesi pertunangan dan lamaran penuh kehangatan antar keluarga.</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            {renderLabel('Nama Calon Pria (CPP)', true)}
                            <Input
                                value={data.groom_name || ''}
                                onChange={(e) => onChange('groom_name', e.target.value)}
                                placeholder="Nama calon mempelai pria"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['groom_name'] && <p className="text-[11px] text-rose-500 mt-1">{errors['groom_name']}</p>}
                        </div>

                        <div>
                            {renderLabel('Nama Calon Wanita (CPW)', true)}
                            <Input
                                value={data.bride_name || ''}
                                onChange={(e) => onChange('bride_name', e.target.value)}
                                placeholder="Nama calon mempelai wanita"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['bride_name'] && <p className="text-[11px] text-rose-500 mt-1">{errors['bride_name']}</p>}
                        </div>

                        <div>
                            {renderLabel('Tanggal Lamaran', true)}
                            <Input
                                type="date"
                                value={data.engagement_date || ''}
                                onChange={(e) => onChange('engagement_date', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['engagement_date'] && <p className="text-[11px] text-rose-500 mt-1">{errors['engagement_date']}</p>}
                        </div>

                        <div>
                            {renderLabel('Waktu Lamaran', true)}
                            <Input
                                type="time"
                                value={data.engagement_time || ''}
                                onChange={(e) => onChange('engagement_time', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['engagement_time'] && <p className="text-[11px] text-rose-500 mt-1">{errors['engagement_time']}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            {renderLabel('Lokasi Lamaran', true)}
                            <Input
                                value={data.engagement_location || ''}
                                onChange={(e) => onChange('engagement_location', e.target.value)}
                                placeholder="Contoh: Rumah Kediaman CPW / Plataran Menteng"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['engagement_location'] && <p className="text-[11px] text-rose-500 mt-1">{errors['engagement_location']}</p>}
                        </div>

                        <div>
                            {renderLabel('Estimasi Jumlah Tamu', false)}
                            <Input
                                type="number"
                                min="1"
                                value={data.estimated_guests || ''}
                                onChange={(e) => onChange('estimated_guests', e.target.value)}
                                placeholder="Contoh: 60"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Konsep / Tema', false)}
                            <NativeSelect
                                value={data.concept_theme || ''}
                                onChange={(e) => onChange('concept_theme', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Konsep Lamaran...</option>
                                {ENGAGEMENT_CONCEPTS.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </NativeSelect>
                        </div>

                        <div>
                            {renderLabel('Warna Tema / Palette', false)}
                            <Input
                                value={data.theme_color || ''}
                                onChange={(e) => onChange('theme_color', e.target.value)}
                                placeholder="Contoh: Sage Green & Gold"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Vendor / WO', false)}
                            <Input
                                value={data.vendor_wo || ''}
                                onChange={(e) => onChange('vendor_wo', e.target.value)}
                                placeholder="Nama WO atau Dekorasi"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        {renderLabel('Catatan Tambahan', false)}
                        <Textarea
                            rows={2}
                            value={data.additional_notes || ''}
                            onChange={(e) => onChange('additional_notes', e.target.value)}
                            placeholder="Prosesi seserahan, pertukaran cincin, atau susunan acara..."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── 11. EVENT ───────────────────────────────────────────────── */}
            {categoryKey === 'event' && (
                <div className="space-y-4">
                    <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs text-indigo-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>Dokumentasi event, festival, seminar, konser, dan perhelatan publik dinamis.</span>
                    </div>

                    {/* Informasi Utama Event */}
                    <div className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-3">
                        <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider block">
                            Informasi Event Utama
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                {renderLabel('Tanggal Event', true)}
                                <Input
                                    type="date"
                                    value={data.event_date || ''}
                                    onChange={(e) => onChange('event_date', e.target.value)}
                                    className="h-[38px] text-xs bg-white"
                                />
                                {errors['event_date'] && <p className="text-[11px] text-rose-500 mt-1">{errors['event_date']}</p>}
                            </div>

                            <div>
                                {renderLabel('Waktu Event (Time Range)', true)}
                                <Input
                                    value={data.event_time_range || ''}
                                    onChange={(e) => onChange('event_time_range', e.target.value)}
                                    placeholder="Contoh: 09:00 - 17:00 WIB"
                                    className="h-[38px] text-xs bg-white"
                                />
                                {errors['event_time_range'] && <p className="text-[11px] text-rose-500 mt-1">{errors['event_time_range']}</p>}
                            </div>

                            <div>
                                {renderLabel('Jenis Event', true)}
                                <NativeSelect
                                    value={data.event_type || ''}
                                    onChange={(e) => onChange('event_type', e.target.value)}
                                    className="h-[38px] text-xs bg-white"
                                >
                                    <option value="">Pilih Jenis Event...</option>
                                    {EVENT_TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </NativeSelect>
                                {errors['event_type'] && <p className="text-[11px] text-rose-500 mt-1">{errors['event_type']}</p>}
                            </div>

                            <div>
                                {renderLabel('Skala Event', true)}
                                <NativeSelect
                                    value={data.event_scale || ''}
                                    onChange={(e) => onChange('event_scale', e.target.value)}
                                    className="h-[38px] text-xs bg-white"
                                >
                                    <option value="">Pilih Skala Event...</option>
                                    {EVENT_SCALES.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </NativeSelect>
                                {errors['event_scale'] && <p className="text-[11px] text-rose-500 mt-1">{errors['event_scale']}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                {renderLabel('Lokasi Event', true)}
                                <Input
                                    value={data.event_location || ''}
                                    onChange={(e) => onChange('event_location', e.target.value)}
                                    placeholder="Contoh: JCC Senayan Hall B, Jakarta Pusat"
                                    className="h-[38px] text-xs bg-white"
                                />
                                {errors['event_location'] && <p className="text-[11px] text-rose-500 mt-1">{errors['event_location']}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Informasi Event Tambahan */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            {renderLabel('Nama Event', false)}
                            <Input
                                value={data.event_name || ''}
                                onChange={(e) => onChange('event_name', e.target.value)}
                                placeholder="Contoh: Java Jazz Festival 2026"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Penyelenggara / Organizer', false)}
                            <Input
                                value={data.organizer || ''}
                                onChange={(e) => onChange('organizer', e.target.value)}
                                placeholder="Nama EO / Institusi"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Tema Event', false)}
                            <Input
                                value={data.event_theme || ''}
                                onChange={(e) => onChange('event_theme', e.target.value)}
                                placeholder="Contoh: Harmony in Diversity"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Jumlah Tamu / Pengunjung', false)}
                            <Input
                                type="number"
                                min="1"
                                value={data.estimated_guests || ''}
                                onChange={(e) => onChange('estimated_guests', e.target.value)}
                                placeholder="Contoh: 1000"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            {renderLabel('Dress Code', false)}
                            <Input
                                value={data.dress_code || ''}
                                onChange={(e) => onChange('dress_code', e.target.value)}
                                placeholder="Contoh: Smart Casual / Neon Accent"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        {renderLabel('Tujuan Event', false)}
                        <Textarea
                            rows={2}
                            value={data.event_purpose || ''}
                            onChange={(e) => onChange('event_purpose', e.target.value)}
                            placeholder="Tujuan perhelatan acara..."
                            className="text-xs bg-white"
                        />
                    </div>

                    <div>
                        {renderLabel('Rundown / Agenda Utama', false)}
                        <Textarea
                            rows={3}
                            value={data.rundown_agenda || ''}
                            onChange={(e) => onChange('rundown_agenda', e.target.value)}
                            placeholder="Susunan acara, jam pembukaan, sambutan pejabat, penampilan artis..."
                            className="text-xs bg-white"
                        />
                    </div>

                    <div>
                        {renderLabel('Catatan Tambahan', false)}
                        <Textarea
                            rows={2}
                            value={data.additional_notes || ''}
                            onChange={(e) => onChange('additional_notes', e.target.value)}
                            placeholder="Akses media pass, spot panggung khusus..."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── 12. FAMILY SESSION ──────────────────────────────────────── */}
            {categoryKey === 'family' && (
                <div className="space-y-4">
                    <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Sesi potret keluarga hangat bersama orang tua dan anak-anak tercinta.</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            {renderLabel('Nama Keluarga', true)}
                            <Input
                                value={data.family_name || ''}
                                onChange={(e) => onChange('family_name', e.target.value)}
                                placeholder="Contoh: Keluarga Pratama"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['family_name'] && <p className="text-[11px] text-rose-500 mt-1">{errors['family_name']}</p>}
                        </div>

                        <div>
                            {renderLabel('Nama Ayah', true)}
                            <Input
                                value={data.father_name || ''}
                                onChange={(e) => onChange('father_name', e.target.value)}
                                placeholder="Nama lengkap Ayah"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['father_name'] && <p className="text-[11px] text-rose-500 mt-1">{errors['father_name']}</p>}
                        </div>

                        <div>
                            {renderLabel('Nama Ibu', true)}
                            <Input
                                value={data.mother_name || ''}
                                onChange={(e) => onChange('mother_name', e.target.value)}
                                placeholder="Nama lengkap Ibu"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['mother_name'] && <p className="text-[11px] text-rose-500 mt-1">{errors['mother_name']}</p>}
                        </div>
                    </div>

                    {/* REPEATER NAMA ANAK: [ Alea (6 th) ] × [ Raka (3 th) ] × + Tambah Anak */}
                    <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-[11px] font-bold text-slate-800 block">
                                    Nama Anak <span className="text-slate-400 font-normal text-[10px]">(Opsional - Tanpa Batasan)</span>
                                </label>
                                <p className="text-[10px] text-slate-500">Tambahkan daftar anak yang ikut dalam sesi pemotretan</p>
                            </div>
                        </div>

                        {/* List of Children as Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            {Array.isArray(data.children) && data.children.length > 0 ? (
                                data.children.map((child: ChildRepeaterItem, idx: number) => (
                                    <div
                                        key={idx}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-amber-300 shadow-2xs text-xs font-semibold text-slate-800 animate-in fade-in"
                                    >
                                        <span>
                                            {child.name} {child.age ? `(${child.age}${String(child.age).toLowerCase().includes('th') ? '' : ' th'})` : ''}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveChild(idx)}
                                            className="w-4 h-4 rounded-full hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                                            title="Hapus anak ini"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <span className="text-xs text-slate-400 italic">Belum ada data anak ditambahkan</span>
                            )}
                        </div>

                        {/* Inline Add Child Form */}
                        {isAddingChild ? (
                            <div className="p-3 bg-white border border-amber-200 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-in fade-in duration-150">
                                <Input
                                    value={newChildName}
                                    onChange={(e) => setNewChildName(e.target.value)}
                                    placeholder="Nama anak (contoh: Alea)"
                                    className="h-[34px] text-xs flex-1"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddChild();
                                        }
                                    }}
                                />
                                <Input
                                    value={newChildAge}
                                    onChange={(e) => setNewChildAge(e.target.value)}
                                    placeholder="Usia (contoh: 6 th)"
                                    className="h-[34px] text-xs w-full sm:w-28"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddChild();
                                        }
                                    }}
                                />
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={handleAddChild}
                                        disabled={!newChildName.trim()}
                                        className="h-[34px] px-3 rounded-lg bg-[#3C0E0E] hover:bg-[#2A0A0A] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        Simpan
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddingChild(false);
                                            setNewChildName('');
                                            setNewChildAge('');
                                        }}
                                        className="h-[34px] px-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs transition-all cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsAddingChild(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-amber-400 bg-amber-50/50 hover:bg-amber-100/60 text-amber-900 text-xs font-bold transition-all cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5 text-amber-700" />
                                <span>+ Tambah Anak</span>
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            {renderLabel('Jumlah Anggota Keluarga', true)}
                            <Input
                                type="number"
                                min="2"
                                value={data.members_count || ''}
                                onChange={(e) => onChange('members_count', e.target.value)}
                                placeholder="Contoh: 4"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['members_count'] && <p className="text-[11px] text-rose-500 mt-1">{errors['members_count']}</p>}
                        </div>

                        <div>
                            {renderLabel('Lokasi Sesi', true)}
                            <NativeSelect
                                value={data.session_location || ''}
                                onChange={(e) => onChange('session_location', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Lokasi Sesi...</option>
                                {FAMILY_LOCATIONS.map((l) => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </NativeSelect>
                            {errors['session_location'] && <p className="text-[11px] text-rose-500 mt-1">{errors['session_location']}</p>}
                        </div>

                        <div>
                            {renderLabel('Konsep / Tema', false)}
                            <NativeSelect
                                value={data.concept_theme || ''}
                                onChange={(e) => onChange('concept_theme', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Konsep...</option>
                                {FAMILY_CONCEPTS.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </NativeSelect>
                        </div>

                        <div>
                            {renderLabel('Durasi Sesi', false)}
                            <NativeSelect
                                value={data.session_duration || ''}
                                onChange={(e) => onChange('session_duration', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Durasi Sesi...</option>
                                {FAMILY_DURATIONS.map((d) => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </NativeSelect>
                        </div>
                    </div>

                    <div>
                        {renderLabel('Catatan Tambahan', false)}
                        <Textarea
                            rows={2}
                            value={data.additional_notes || ''}
                            onChange={(e) => onChange('additional_notes', e.target.value)}
                            placeholder="Catatan pakaian keluarga seragam, anak yang masih bayi/balita..."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── 13. KOMUNITAS ───────────────────────────────────────────── */}
            {categoryKey === 'komunitas' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            {renderLabel('Nama Komunitas', true)}
                            <Input
                                value={data.community_name || ''}
                                onChange={(e) => onChange('community_name', e.target.value)}
                                placeholder="Contoh: Jakarta Running Club"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['community_name'] && <p className="text-[11px] text-rose-500 mt-1">{errors['community_name']}</p>}
                        </div>

                        <div>
                            {renderLabel('Jenis Komunitas', true)}
                            <NativeSelect
                                value={data.community_type || ''}
                                onChange={(e) => onChange('community_type', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Jenis Komunitas...</option>
                                {KOMUNITAS_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </NativeSelect>
                            {errors['community_type'] && <p className="text-[11px] text-rose-500 mt-1">{errors['community_type']}</p>}
                        </div>

                        <div>
                            {renderLabel('Tahun Berdiri', false)}
                            <Input
                                type="number"
                                min="1950"
                                max="2030"
                                value={data.established_year || ''}
                                onChange={(e) => onChange('established_year', e.target.value)}
                                placeholder="Contoh: 2020"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Jumlah Anggota', false)}
                            <Input
                                type="number"
                                min="1"
                                value={data.members_count || ''}
                                onChange={(e) => onChange('members_count', e.target.value)}
                                placeholder="Contoh: 150"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Nama PIC / Penanggung Jawab', true)}
                            <Input
                                value={data.pic_name || ''}
                                onChange={(e) => onChange('pic_name', e.target.value)}
                                placeholder="Nama lengkap PIC"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['pic_name'] && <p className="text-[11px] text-rose-500 mt-1">{errors['pic_name']}</p>}
                        </div>

                        <div>
                            {renderLabel('No. Telepon PIC', true)}
                            <Input
                                value={data.pic_phone || ''}
                                onChange={(e) => onChange('pic_phone', e.target.value)}
                                placeholder="Contoh: 081234567890"
                                className="h-[38px] text-xs bg-white"
                            />
                            {errors['pic_phone'] && <p className="text-[11px] text-rose-500 mt-1">{errors['pic_phone']}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            {renderLabel('Email Komunitas', false)}
                            <Input
                                type="email"
                                value={data.pic_email || ''}
                                onChange={(e) => onChange('pic_email', e.target.value)}
                                placeholder="info@komunitas.com"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Jenis Kegiatan', true)}
                            <NativeSelect
                                value={data.activity_type || ''}
                                onChange={(e) => onChange('activity_type', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih Jenis Kegiatan...</option>
                                {KOMUNITAS_ACTIVITIES.map((a) => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </NativeSelect>
                            {errors['activity_type'] && <p className="text-[11px] text-rose-500 mt-1">{errors['activity_type']}</p>}
                        </div>

                        <div>
                            {renderLabel('Tema Kegiatan', false)}
                            <Input
                                value={data.activity_theme || ''}
                                onChange={(e) => onChange('activity_theme', e.target.value)}
                                placeholder="Contoh: 5K Fun Run Anniversary"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        {renderLabel('Deskripsi Kegiatan', false)}
                        <Textarea
                            rows={3}
                            value={data.activity_description || ''}
                            onChange={(e) => onChange('activity_description', e.target.value)}
                            placeholder="Rute perjalanan, agenda acara utama, dokumentasi grup & individu..."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── 14. NEWBORN ─────────────────────────────────────────────── */}
            {categoryKey === 'newborn' && (
                <div className="space-y-4">
                    <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                            <Baby className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Sesi foto newborn mengabadikan hari-hari awal si kecil dengan perlengkapan higienis & aman.</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddBaby}
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 hover:text-rose-800 bg-rose-100/90 hover:bg-rose-200/90 px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer shadow-2xs self-start sm:self-auto"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah Bayi (Kembar)</span>
                        </button>
                    </div>

                    {/* Baby List Repeater */}
                    <div className="space-y-3">
                        {babiesList.map((baby, idx) => (
                            <div key={idx} className="p-4 bg-white border border-slate-200/80 rounded-xl space-y-3 relative shadow-2xs">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <div className="flex items-center gap-2 font-semibold text-xs text-slate-800">
                                        <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px]">
                                            {idx + 1}
                                        </div>
                                        <span>Data Bayi {babiesList.length > 1 ? `#${idx + 1}` : ''}</span>
                                        {babiesList.length > 1 && (
                                            <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                                                Kembar
                                            </span>
                                        )}
                                    </div>
                                    {babiesList.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveBaby(idx)}
                                            className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                                            title="Hapus bayi"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        {renderLabel('Nama Lengkap', idx === 0)}
                                        <Input
                                            value={baby.name || ''}
                                            onChange={(e) => handleBabyChange(idx, 'name', e.target.value)}
                                            placeholder="Nama lengkap si kecil"
                                            className="h-[38px] text-xs bg-white"
                                        />
                                        {idx === 0 && errors['baby_name'] && (
                                            <p className="text-[11px] text-rose-500 mt-1">{errors['baby_name']}</p>
                                        )}
                                    </div>

                                    <div>
                                        {renderLabel('Nama Panggilan', false)}
                                        <Input
                                            value={baby.nickname || ''}
                                            onChange={(e) => handleBabyChange(idx, 'nickname', e.target.value)}
                                            placeholder="Nama panggilan bayi"
                                            className="h-[38px] text-xs bg-white"
                                        />
                                    </div>

                                    <div>
                                        {renderLabel('Tanggal Lahir', false)}
                                        <Input
                                            type="date"
                                            value={baby.birth_date || ''}
                                            onChange={(e) => handleBabyChange(idx, 'birth_date', e.target.value)}
                                            className="h-[38px] text-xs bg-white"
                                        />
                                        {idx === 0 && errors['baby_birth_date'] && (
                                            <p className="text-[11px] text-rose-500 mt-1">{errors['baby_birth_date']}</p>
                                        )}
                                    </div>

                                    <div>
                                        {renderLabel('Jenis Kelamin', false)}
                                        <NativeSelect
                                            value={baby.gender || ''}
                                            onChange={(e) => handleBabyChange(idx, 'gender', e.target.value)}
                                            className="h-[38px] text-xs bg-white"
                                        >
                                            <option value="">Pilih Jenis Kelamin...</option>
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </NativeSelect>
                                        {idx === 0 && errors['baby_gender'] && (
                                            <p className="text-[11px] text-rose-500 mt-1">{errors['baby_gender']}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div>
                            {renderLabel('Nama Ayah', false)}
                            <Input
                                value={data.father_name || ''}
                                onChange={(e) => onChange('father_name', e.target.value)}
                                placeholder="Nama lengkap Ayah"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>

                        <div>
                            {renderLabel('Nama Ibu', false)}
                            <Input
                                value={data.mother_name || ''}
                                onChange={(e) => onChange('mother_name', e.target.value)}
                                placeholder="Nama lengkap Ibu"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        {renderLabel('Catatan Tambahan', false)}
                        <Textarea
                            rows={2}
                            value={data.additional_notes || ''}
                            onChange={(e) => onChange('additional_notes', e.target.value)}
                            placeholder="Kondisi si kecil, request properti/warna kostum khusus, dll..."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── STANDARD FALLBACK ────────────────────────────────────────── */}
            {categoryKey === 'standard' && (
                <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-600">
                    <p>Kategori ini menggunakan formulir standar pemesanan.</p>
                </div>
            )}
        </div>
    );
}
