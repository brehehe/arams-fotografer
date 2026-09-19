import {
    Calendar,
    Plus,
    X,
    Trash2,
    Check,
    MapPin,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import type {
    CategoryFormKey,
    AnyCategorySpecificData,
    BabyItem,
} from '@/types/category-forms';
import {
    calculateTripDuration,
    getFamilyMemberCount,
    WEDDING_CONCEPTS,
    PREWEDDING_CONCEPTS,
    ENGAGEMENT_CONCEPTS,
    FAMILY_CONCEPTS,
    FAMILY_LOCATIONS,
    MATERNITY_CONCEPTS,
    MATERNITY_LOCATIONS,
    MATERNITY_WARDROBES,
    NEWBORN_CONCEPTS,
    NEWBORN_GENDERS,
    BIRTHDAY_EVENT_TYPES,
    KOMUNITAS_TYPES,
    KOMUNITAS_ACTIVITIES,
    CORPORATE_EVENT_TYPES,
    CORPORATE_DOC_PURPOSES,
    COMMERCIAL_BACKGROUNDS,
    COMMERCIAL_LIGHTING_STYLES,
    COMMERCIAL_MOODS,
    EVENT_TYPES,
    TRAVELING_TRIP_TYPES,
    TRAVELING_TRANSPORTS,
    PERORANGAN_PURPOSES,
    PERORANGAN_SESSION_TYPES,
    PERORANGAN_DURATIONS,
    PERORANGAN_BACKDROPS,
    LAINNYA_TRADITION_TYPES,
} from '@/types/category-forms';

interface CategorySpecificFormProps {
    categoryKey: CategoryFormKey;
    categoryName?: string;
    data: AnyCategorySpecificData;
    onChange: (field: string, value: any) => void;
    errors?: Record<string, string>;
    mode?: 'admin' | 'public';
    hideGeneralFields?: boolean;
}

// ── SUB-COMPONENT: Label Helper ───────────────────────────────────────────────

function FormLabel({
    label,
    required,
    hint,
}: {
    label: string;
    required?: boolean;
    hint?: string;
}) {
    return (
        <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-slate-700 inline-flex items-center gap-1">
                <span>{label}</span>
                {required ? (
                    <span className="text-rose-500 font-bold text-xs ml-0.5" title="Wajib diisi">*</span>
                ) : (
                    <span className="text-slate-400 font-normal text-[10px] ml-0.5">(Opsional)</span>
                )}
            </label>
            {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
        </div>
    );
}

// ── SUB-COMPONENT: Select With "Lainnya" Input ────────────────────────────────

function SelectWithOther({
    label,
    required = false,
    options,
    value = '',
    otherValue = '',
    onChangeValue,
    onChangeOther,
    placeholder = 'Pilih opsi...',
    otherPlaceholder = 'Sebutkan lainnya...',
    error,
}: {
    label: string;
    required?: boolean;
    options: string[];
    value?: string;
    otherValue?: string;
    onChangeValue: (val: string) => void;
    onChangeOther: (val: string) => void;
    placeholder?: string;
    otherPlaceholder?: string;
    error?: string;
}) {
    const isOtherSelected = value === 'Lainnya';

    return (
        <div className="space-y-1.5">
            <FormLabel label={label} required={required} />
            <NativeSelect
                value={value || ''}
                onChange={(e) => onChangeValue(e.target.value)}
                className="h-[38px] text-xs bg-white"
            >
                <option value="">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </NativeSelect>
            {isOtherSelected && (
                <div className="pt-1 animate-in fade-in duration-150">
                    <Input
                        value={otherValue || ''}
                        onChange={(e) => onChangeOther(e.target.value)}
                        placeholder={otherPlaceholder}
                        className="h-[34px] text-xs bg-amber-50/50 border-amber-200 text-slate-800 focus:border-amber-400"
                    />
                </div>
            )}
            {error && <p className="text-[11px] text-rose-500 mt-1">{error}</p>}
        </div>
    );
}

// ── SUB-COMPONENT: Multi-Select Chips With "Lainnya" ──────────────────────────

function MultiSelectWithOther({
    label,
    required = false,
    options,
    values = [],
    otherValue = '',
    onChangeValues,
    onChangeOther,
    error,
}: {
    label: string;
    required?: boolean;
    options: string[];
    values?: string[];
    otherValue?: string;
    onChangeValues: (vals: string[]) => void;
    onChangeOther: (val: string) => void;
    error?: string;
}) {
    const safeValues = Array.isArray(values) ? values : [];
    const isOtherSelected = safeValues.includes('Lainnya');

    const handleToggle = (opt: string) => {
        const next = safeValues.includes(opt)
            ? safeValues.filter((v) => v !== opt)
            : [...safeValues, opt];
        onChangeValues(next);
    };

    return (
        <div className="space-y-2">
            <FormLabel label={label} required={required} hint="Bisa pilih lebih dari satu" />
            <div className="flex flex-wrap gap-1.5">
                {options.map((opt) => {
                    const isChecked = safeValues.includes(opt);

                    return (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => handleToggle(opt)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                                isChecked
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                        >
                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${isChecked ? 'bg-white text-slate-900 font-bold' : 'border border-slate-300'}`}>
                                {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </span>
                            <span>{opt}</span>
                        </button>
                    );
                })}
            </div>
            {isOtherSelected && (
                <div className="pt-1 animate-in fade-in duration-150">
                    <Input
                        value={otherValue || ''}
                        onChange={(e) => onChangeOther(e.target.value)}
                        placeholder="Sebutkan opsi lainnya..."
                        className="h-[34px] text-xs bg-amber-50/50 border-amber-200 text-slate-800 focus:border-amber-400"
                    />
                </div>
            )}
            {error && <p className="text-[11px] text-rose-500 mt-1">{error}</p>}
        </div>
    );
}

// ── SUB-COMPONENT: Modern Toggle Switch (Ya / Tidak) ──────────────────────────

function ToggleSwitch({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (val: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/60">
            <div className="space-y-0.5 pr-3">
                <span className="text-xs font-bold text-slate-800 block">{label}</span>
                {description && <p className="text-[11px] text-slate-500">{description}</p>}
            </div>
            <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-lg">
                <button
                    type="button"
                    onClick={() => onChange(false)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        !checked
                            ? 'bg-white text-slate-800 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Tidak
                </button>
                <button
                    type="button"
                    onClick={() => onChange(true)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        checked
                            ? 'bg-[#0B1527] text-white shadow-2xs'
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Ya
                </button>
            </div>
        </div>
    );
}

// ── SUB-COMPONENT: Tags Input (Destinasi Traveling) ───────────────────────────

function TagsInput({
    label,
    required = false,
    tags = [],
    onChangeTags,
    placeholder = 'Ketik nama kota/negara lalu tekan Enter...',
    error,
}: {
    label: string;
    required?: boolean;
    tags?: string[];
    onChangeTags: (tags: string[]) => void;
    placeholder?: string;
    error?: string;
}) {
    const [inputVal, setInputVal] = useState('');
    const safeTags = Array.isArray(tags) ? tags : [];

    const handleAdd = () => {
        const trimmed = inputVal.trim();

        if (trimmed && !safeTags.includes(trimmed)) {
            onChangeTags([...safeTags, trimmed]);
            setInputVal('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    const handleRemove = (tagToRemove: string) => {
        onChangeTags(safeTags.filter((t) => t !== tagToRemove));
    };

    return (
        <div className="space-y-2">
            <FormLabel label={label} required={required} hint="Bisa masukkan lebih dari 1 destinasi" />
            <div className="flex items-center gap-2">
                <Input
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="h-[38px] text-xs bg-white flex-1"
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="px-3 h-[38px] rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                </button>
            </div>

            {safeTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {safeTags.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold"
                        >
                            <MapPin className="w-3 h-3 text-sky-600" />
                            <span>{tag}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(tag)}
                                className="w-4 h-4 rounded-full hover:bg-sky-200/70 flex items-center justify-center cursor-pointer text-sky-700"
                            >
                                <X className="w-2.5 h-2.5" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
            {error && <p className="text-[11px] text-rose-500 mt-1">{error}</p>}
        </div>
    );
}

// ── SUB-COMPONENT: Newborn Babies Repeater ─────────────────────────────────────

function NewbornBabiesRepeater({
    babies = [],
    onChange,
}: {
    babies?: BabyItem[];
    onChange: (babies: BabyItem[]) => void;
}) {
    const list = Array.isArray(babies) && babies.length > 0
        ? babies
        : [{ name: '', nickname: '', birth_date: '', gender: 'Laki-laki' }];

    const handleUpdate = (idx: number, field: keyof BabyItem, val: any) => {
        const next = [...list];
        next[idx] = { ...next[idx], [field]: val };
        onChange(next);
    };

    const handleAdd = () => {
        onChange([...list, { name: '', nickname: '', birth_date: '', gender: 'Laki-laki' }]);
    };

    const handleRemove = (idx: number) => {
        if (list.length <= 1) {
            return;
        }

        onChange(list.filter((_, i) => i !== idx));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-[11px] font-bold text-slate-700 block">Data Bayi yang Difoto</span>
                    <span className="text-[10px] text-slate-400">Dapat menambahkan lebih dari satu (untuk bayi kembar)</span>
                </div>
                <button
                    type="button"
                    onClick={handleAdd}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                    <Plus className="w-3 h-3 text-slate-600" />
                    <span>Tambah Bayi Kembar</span>
                </button>
            </div>

            <div className="space-y-2">
                {list.map((b, idx) => (
                    <div key={idx} className="p-3 bg-rose-50/40 rounded-xl border border-rose-200/70 space-y-2">
                        <div className="flex items-center justify-between pb-1 border-b border-rose-100">
                            <span className="text-[10.5px] font-extrabold uppercase text-rose-800">
                                Bayi #{idx + 1}
                            </span>
                            {list.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemove(idx)}
                                    className="text-rose-500 hover:text-rose-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Hapus</span>
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Nama Lengkap Bayi</label>
                                <Input
                                    value={b.name || ''}
                                    onChange={(e) => handleUpdate(idx, 'name', e.target.value)}
                                    placeholder="Nama bayi"
                                    className="h-[34px] text-xs bg-white"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Nama Panggilan (Opsional)</label>
                                <Input
                                    value={b.nickname || ''}
                                    onChange={(e) => handleUpdate(idx, 'nickname', e.target.value)}
                                    placeholder="Panggilan"
                                    className="h-[34px] text-xs bg-white"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Tanggal Lahir</label>
                                <Input
                                    type="date"
                                    value={b.birth_date || ''}
                                    onChange={(e) => handleUpdate(idx, 'birth_date', e.target.value)}
                                    className="h-[34px] text-xs bg-white"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">Jenis Kelamin</label>
                                <NativeSelect
                                    value={b.gender || 'Laki-laki'}
                                    onChange={(e) => handleUpdate(idx, 'gender', e.target.value)}
                                    className="h-[34px] text-xs bg-white"
                                >
                                    {NEWBORN_GENDERS.map((g) => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </NativeSelect>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── MAIN EXPORTED COMPONENT ───────────────────────────────────────────────────

export function CategorySpecificForm({
    categoryKey,
    data,
    onChange,
    errors = {},
}: CategorySpecificFormProps) {
    // Traveling duration calculation
    const tripDuration = useMemo(() => {
        return calculateTripDuration(data.departure_date, data.return_date);
    }, [data.departure_date, data.return_date]);

    const coupleDetails = (isPrewedding: boolean) => (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {(['groom', 'bride'] as const).map((person) => {
                const isGroom = person === 'groom';
                const prefix = isGroom ? 'groom' : 'bride';
                const partnerKey = isGroom ? 'partner_2' : 'partner_1';
                const name = isPrewedding ? data[partnerKey] || data[`${prefix}_name`] : data[`${prefix}_name`];
                const updateName = (value: string) => {
                    onChange(`${prefix}_name`, value);
                    if (isPrewedding) {
                        onChange(partnerKey, value);
                    }
                };

                return (
                    <div key={person} className={`min-w-0 space-y-4 rounded-2xl border p-4 sm:p-5 ${isGroom ? 'border-blue-200 bg-blue-50/30' : 'border-rose-200 bg-rose-50/30'}`}>
                        <h3 className={`border-b pb-3 text-sm font-bold ${isGroom ? 'border-blue-100 text-blue-950' : 'border-rose-100 text-rose-950'}`}>
                            Informasi Calon Pengantin {isGroom ? 'Pria (CPP)' : 'Wanita (CPW)'}
                        </h3>
                        <div>
                            <FormLabel label="Nama Lengkap" required />
                            <Input value={name || ''} onChange={(e) => updateName(e.target.value)} placeholder={`Nama lengkap ${isGroom ? 'CPP' : 'CPW'}`} className="h-11 bg-white" />
                            {errors[`${prefix}_name`] && <p className="mt-1 text-xs text-rose-600">{errors[`${prefix}_name`]}</p>}
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <FormLabel label="Panggilan" required />
                                <Input value={data[`${prefix}_nickname`] || ''} onChange={(e) => onChange(`${prefix}_nickname`, e.target.value)} placeholder={`Panggilan ${isGroom ? 'CPP' : 'CPW'}`} className="h-11 bg-white" />
                            </div>
                            <div>
                                <FormLabel label="Pekerjaan" />
                                <Input value={data[`${prefix}_occupation`] || ''} onChange={(e) => onChange(`${prefix}_occupation`, e.target.value)} placeholder="Pekerjaan" className="h-11 bg-white" />
                            </div>
                            <div>
                                <FormLabel label="Tanggal Lahir" />
                                <Input type="date" value={data[`${prefix}_birth_date`] || ''} onChange={(e) => onChange(`${prefix}_birth_date`, e.target.value)} className="h-11 bg-white" />
                            </div>
                            <div>
                                <FormLabel label="Akun Instagram" />
                                <Input value={data[`${prefix}_instagram`] || ''} onChange={(e) => onChange(`${prefix}_instagram`, e.target.value)} placeholder="@username" className="h-11 bg-white" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="space-y-4">
            {!['family', 'komunitas', 'perorangan', 'lainnya'].includes(categoryKey) && (
                <div>
                    <FormLabel label="Nama Pemesan" required />
                    <Input aria-label="Nama Pemesan" value={data.client_name || ''} onChange={(e) => onChange('client_name', e.target.value)} placeholder="Nama lengkap orang yang memesan layanan" className="h-11 bg-white" />
                    {errors.client_name && <p className="mt-1 text-xs text-rose-600">{errors.client_name}</p>}
                </div>
            )}
            {/* ── 1. WEDDING ────────────────────────────────────────────────── */}
            {categoryKey === 'wedding' && (
                <div className="space-y-5">
                    {/* Section A: Data Pasangan */}
                    {coupleDetails(false)}

                    {/* Section B: Akad & Resepsi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Akad */}
                        <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
                            <span className="text-xs font-bold text-slate-800 block border-b border-slate-200/60 pb-1.5">
                                Detail Akad / Pemberkatan
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <FormLabel label="Tanggal Akad" required />
                                    <Input
                                        type="date"
                                        value={data.akad_date || ''}
                                        onChange={(e) => onChange('akad_date', e.target.value)}
                                        className="h-[38px] text-xs bg-white"
                                    />
                                </div>
                                <div>
                                    <FormLabel label="Waktu Akad" required />
                                    <Input
                                        type="time"
                                        value={data.akad_time || ''}
                                        onChange={(e) => onChange('akad_time', e.target.value)}
                                        className="h-[38px] text-xs bg-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <FormLabel label="Lokasi Akad" required />
                                <Input
                                    value={data.akad_location || ''}
                                    onChange={(e) => onChange('akad_location', e.target.value)}
                                    placeholder="Nama masjid, gereja, atau venue akad"
                                    className="h-[38px] text-xs bg-white"
                                />
                            </div>
                        </div>

                        {/* Resepsi */}
                        <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
                            <span className="text-xs font-bold text-slate-800 block border-b border-slate-200/60 pb-1.5">
                                Detail Resepsi
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <FormLabel label="Tanggal Resepsi" required />
                                    <Input
                                        type="date"
                                        value={data.reception_date || ''}
                                        onChange={(e) => onChange('reception_date', e.target.value)}
                                        className="h-[38px] text-xs bg-white"
                                    />
                                </div>
                                <div>
                                    <FormLabel label="Waktu Resepsi" required />
                                    <Input
                                        type="time"
                                        value={data.reception_time || ''}
                                        onChange={(e) => onChange('reception_time', e.target.value)}
                                        className="h-[38px] text-xs bg-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <FormLabel label="Lokasi Resepsi" required />
                                <Input
                                    value={data.reception_location || ''}
                                    onChange={(e) => onChange('reception_location', e.target.value)}
                                    placeholder="Gedung, hotel, atau ballroom resepsi"
                                    className="h-[38px] text-xs bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section C: Detail Acara */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <FormLabel label="Estimasi Tamu Undangan" />
                            <Input
                                type="number"
                                min="1"
                                value={data.estimated_guests || ''}
                                onChange={(e) => onChange('estimated_guests', e.target.value)}
                                placeholder="Contoh: 500 (opsional)"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <SelectWithOther
                            label="Konsep Acara"
                            options={WEDDING_CONCEPTS}
                            value={data.concept_theme}
                            otherValue={data.concept_theme_other}
                            onChangeValue={(val) => onChange('concept_theme', val)}
                            onChangeOther={(val) => onChange('concept_theme_other', val)}
                            placeholder="Pilih konsep pernikahan (opsional)..."
                        />
                        <div>
                            <FormLabel label="Wedding Organizer (WO)" />
                            <Input
                                value={data.wedding_organizer || ''}
                                onChange={(e) => onChange('wedding_organizer', e.target.value)}
                                placeholder="Nama WO yang menangani"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <div>
                            <FormLabel label="Makeup Artist (MUA)" />
                            <Input
                                value={data.makeup_artist || ''}
                                onChange={(e) => onChange('makeup_artist', e.target.value)}
                                placeholder="Nama MUA pengantin"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ── 2. PREWEDDING ─────────────────────────────────────────────── */}
            {categoryKey === 'prewedding' && (
                <div className="space-y-4">
                    {coupleDetails(true)}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <FormLabel label="Tanggal Sesi Foto" required />
                            <Input
                                type="date"
                                value={data.session_date || ''}
                                onChange={(e) => onChange('session_date', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <div>
                            <SelectWithOther
                                label="Konsep Prewedding"
                                options={PREWEDDING_CONCEPTS}
                                value={data.concept_theme}
                                otherValue={data.concept_theme_other}
                                onChangeValue={(val) => onChange('concept_theme', val)}
                                onChangeOther={(val) => onChange('concept_theme_other', val)}
                                placeholder="Pilih konsep (opsional)..."
                            />
                        </div>
                        <div>
                            <FormLabel label="Lokasi Sesi" required />
                            <Input
                                value={data.session_location || ''}
                                onChange={(e) => onChange('session_location', e.target.value)}
                                placeholder="Contoh: Bromo / Studio Indoor"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <div>
                            <FormLabel label="Jumlah Lokasi" required />
                            <Input
                                type="number"
                                min="1"
                                value={data.locations_count || ''}
                                onChange={(e) => onChange('locations_count', e.target.value)}
                                placeholder="Contoh: 2"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div className="max-w-sm">
                        <div>
                            <FormLabel label="Jumlah Look / Wardrobe" />
                            <Input
                                type="number"
                                min="1"
                                value={data.wardrobe_looks_count || ''}
                                onChange={(e) => onChange('wardrobe_looks_count', e.target.value)}
                                placeholder="Contoh: 3 look"
                                className="h-11 bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <FormLabel label="Properti Khusus" />
                        <Textarea
                            rows={2}
                            value={data.props_special || ''}
                            onChange={(e) => onChange('props_special', e.target.value)}
                            placeholder="Contoh: Bunga kering, mobil antik, payung transparan..."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── 3. ENGAGEMENT ─────────────────────────────────────────────── */}
            {categoryKey === 'engagement' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <FormLabel label="Nama Calon Mempelai Pria" required />
                            <Input
                                value={data.groom_name || ''}
                                onChange={(e) => onChange('groom_name', e.target.value)}
                                placeholder="Nama calon mempelai pria"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <div>
                            <FormLabel label="Nama Calon Mempelai Wanita" required />
                            <Input
                                value={data.bride_name || ''}
                                onChange={(e) => onChange('bride_name', e.target.value)}
                                placeholder="Nama calon mempelai wanita"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <FormLabel label="Tanggal Acara" required />
                            <Input
                                type="date"
                                value={data.engagement_date || ''}
                                onChange={(e) => onChange('engagement_date', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <div>
                            <FormLabel label="Waktu Acara" required />
                            <Input
                                type="time"
                                value={data.engagement_time || ''}
                                onChange={(e) => onChange('engagement_time', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <div>
                            <FormLabel label="Estimasi Tamu" />
                            <Input
                                type="number"
                                min="1"
                                value={data.estimated_guests || ''}
                                onChange={(e) => onChange('estimated_guests', e.target.value)}
                                placeholder="Contoh: 100 (opsional)"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <FormLabel label="Lokasi Acara" required />
                        <Input
                            value={data.engagement_location || ''}
                            onChange={(e) => onChange('engagement_location', e.target.value)}
                            placeholder="Alamat / nama venue acara lamaran"
                            className="h-[38px] text-xs bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-1">
                            <SelectWithOther
                                label="Konsep / Tema Acara"
                                options={ENGAGEMENT_CONCEPTS}
                                value={data.concept_theme}
                                otherValue={data.concept_theme_other}
                                onChangeValue={(val) => onChange('concept_theme', val)}
                                onChangeOther={(val) => onChange('concept_theme_other', val)}
                                placeholder="Pilih konsep (opsional)..."
                            />
                        </div>
                        <div className="sm:col-span-1">
                            <FormLabel label="Tema Warna" />
                            <Input
                                value={data.theme_color || ''}
                                onChange={(e) => onChange('theme_color', e.target.value)}
                                placeholder="Contoh: Sage Green & Gold"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <div className="sm:col-span-1">
                            <FormLabel label="Wedding Organizer (WO)" />
                            <Input
                                value={data.wedding_organizer || ''}
                                onChange={(e) => onChange('wedding_organizer', e.target.value)}
                                placeholder="Nama WO jika ada"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ── 4. FAMILY ─────────────────────────────────────────────────── */}
            {categoryKey === 'family' && (
                <div className="space-y-4">
                    <div>
                        <FormLabel label="Nama Pemesan" required />
                        <Input aria-label="Nama Pemesan" value={data.client_name || ''} onChange={(e) => onChange('client_name', e.target.value)} placeholder="Nama lengkap pemesan" className="h-11 bg-white" />
                        {errors.client_name && <p className="mt-1 text-xs text-rose-600">{errors.client_name}</p>}
                    </div>
                    <div>
                        <FormLabel label="Nama Keluarga" required hint="Contoh: Keluarga Wijaya" />
                        <Input
                            value={data.family_name || ''}
                            onChange={(e) => onChange('family_name', e.target.value)}
                            placeholder="Contoh: Keluarga Wijaya"
                            className="h-[38px] text-xs bg-white"
                        />
                    </div>

                    <div className="max-w-sm">
                        <FormLabel label="Jumlah Anggota Keluarga yang Difoto" required hint="Termasuk pemesan jika ikut sesi" />
                        <Input
                            aria-label="Jumlah Anggota Keluarga yang Difoto"
                            type="number"
                            min="1"
                            value={data.members_count ?? (getFamilyMemberCount(data) || '')}
                            onChange={(e) => onChange('members_count', e.target.value)}
                            placeholder="Contoh: 4 orang"
                            className="h-11 bg-white"
                        />
                        {errors.members_count && <p className="mt-1 text-xs text-rose-600">{errors.members_count}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <SelectWithOther
                            label="Konsep Sesi"
                            required
                            options={FAMILY_CONCEPTS}
                            value={data.concept_theme}
                            otherValue={data.concept_theme_other}
                            onChangeValue={(val) => onChange('concept_theme', val)}
                            onChangeOther={(val) => onChange('concept_theme_other', val)}
                            placeholder="Pilih konsep keluarga..."
                        />

                        <div className="space-y-1.5">
                            <FormLabel label="Lokasi Sesi" required />
                            <NativeSelect
                                value={data.session_location_type || ''}
                                onChange={(e) => onChange('session_location_type', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih lokasi sesi...</option>
                                {FAMILY_LOCATIONS.map((loc) => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </NativeSelect>
                            {data.session_location_type === 'Lainnya' && (
                                <div className="pt-1 animate-in fade-in duration-150">
                                    <Input
                                        value={data.session_location || ''}
                                        onChange={(e) => onChange('session_location', e.target.value)}
                                        placeholder="Sebutkan lokasi sesi foto..."
                                        className="h-[34px] text-xs bg-amber-50/50 border-amber-200"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── 5. MATERNITY ──────────────────────────────────────────────── */}
            {categoryKey === 'maternity' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <FormLabel label="Nama Calon Ibu" required />
                            <Input
                                value={data.mom_name || ''}
                                onChange={(e) => onChange('mom_name', e.target.value)}
                                placeholder="Nama lengkap calon ibu"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <div>
                            <FormLabel label="Usia Kandungan (Minggu)" required />
                            <Input
                                type="number"
                                min="1"
                                max="42"
                                value={data.gestational_age_weeks || ''}
                                onChange={(e) => onChange('gestational_age_weeks', e.target.value)}
                                placeholder="Contoh: 30"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <div>
                            <FormLabel label="Hari Perkiraan Lahir (HPL)" required />
                            <Input
                                type="date"
                                value={data.hpl_date || ''}
                                onChange={(e) => onChange('hpl_date', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SelectWithOther
                            label="Konsep / Tema"
                            required
                            options={MATERNITY_CONCEPTS}
                            value={data.concept_theme}
                            otherValue={data.concept_theme_other}
                            onChangeValue={(val) => onChange('concept_theme', val)}
                            onChangeOther={(val) => onChange('concept_theme_other', val)}
                            placeholder="Pilih konsep..."
                        />

                        <div className="space-y-1.5">
                            <FormLabel label="Lokasi Sesi" required />
                            <NativeSelect
                                value={data.session_location_type || ''}
                                onChange={(e) => onChange('session_location_type', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih lokasi sesi...</option>
                                {MATERNITY_LOCATIONS.map((loc) => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </NativeSelect>
                            {data.session_location_type === 'Lainnya' && (
                                <div className="pt-1 animate-in fade-in duration-150">
                                    <Input
                                        value={data.session_location || ''}
                                        onChange={(e) => onChange('session_location', e.target.value)}
                                        placeholder="Sebutkan lokasi sesi foto..."
                                        className="h-[34px] text-xs bg-amber-50/50 border-amber-200"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <MultiSelectWithOther
                        label="Pilihan Wardrobe"
                        options={MATERNITY_WARDROBES}
                        values={data.wardrobe}
                        otherValue={data.wardrobe_other}
                        onChangeValues={(vals) => onChange('wardrobe', vals)}
                        onChangeOther={(val) => onChange('wardrobe_other', val)}
                    />
                </div>
            )}

            {/* ── 6. NEWBORN ────────────────────────────────────────────────── */}
            {categoryKey === 'newborn' && (
                <div className="space-y-4">
                    {/* Repeater Bayi (Mendukung Kembar) */}
                    <NewbornBabiesRepeater
                        babies={data.babies}
                        onChange={(babies) => onChange('babies', babies)}
                    />

                    <MultiSelectWithOther
                        label="Konsep Sesi Foto Bayi"
                        options={NEWBORN_CONCEPTS}
                        values={data.concept_theme}
                        otherValue={data.concept_theme_other}
                        onChangeValues={(vals) => onChange('concept_theme', vals)}
                        onChangeOther={(val) => onChange('concept_theme_other', val)}
                    />

                    <div>
                        <FormLabel label="Preferensi Pose / Request Khusus" />
                        <Textarea
                            rows={3}
                            value={data.pose_special_requests || ''}
                            onChange={(e) => onChange('pose_special_requests', e.target.value)}
                            placeholder="Catatan kondisi si kecil, preferensi warna wrap/bedong, properti bawaan sendiri..."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── 7. BIRTHDAY ───────────────────────────────────────────────── */}
            {categoryKey === 'birthday' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <FormLabel label="Nama yang Berulang Tahun" required />
                            <Input
                                value={data.celebrant_name || ''}
                                onChange={(e) => onChange('celebrant_name', e.target.value)}
                                placeholder="Nama lengkap celebrant"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <div>
                            <FormLabel label="Usia yang Dirayakan" required />
                            <Input
                                type="number"
                                min="1"
                                value={data.celebrant_age || ''}
                                onChange={(e) => onChange('celebrant_age', e.target.value)}
                                placeholder="Contoh: 17"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <SelectWithOther
                            label="Jenis Acara"
                            required
                            options={BIRTHDAY_EVENT_TYPES}
                            value={data.event_type}
                            otherValue={data.event_type_other}
                            onChangeValue={(val) => onChange('event_type', val)}
                            onChangeOther={(val) => onChange('event_type_other', val)}
                            placeholder="Pilih jenis acara..."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <FormLabel label="Estimasi Tamu" />
                            <Input
                                type="number"
                                min="1"
                                value={data.estimated_guests || ''}
                                onChange={(e) => onChange('estimated_guests', e.target.value)}
                                placeholder="Contoh: 50 (opsional)"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <div>
                            <FormLabel label="Venue / Lokasi Acara" required />
                            <Input
                                value={data.venue_location || ''}
                                onChange={(e) => onChange('venue_location', e.target.value)}
                                placeholder="Nama cafe, resto, atau ballroom"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <div>
                            <FormLabel label="Tema Acara" required />
                            <Input
                                value={data.birthday_theme || ''}
                                onChange={(e) => onChange('birthday_theme', e.target.value)}
                                placeholder="Contoh: Vintage Floral / Neon Party"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <FormLabel label="Konsep Dekorasi" />
                        <Input
                            value={data.decoration_concept || ''}
                            onChange={(e) => onChange('decoration_concept', e.target.value)}
                            placeholder="Kombinasi warna balon, backdrop, lighting..."
                            className="h-[38px] text-xs bg-white"
                        />
                    </div>

                </div>
            )}

            {/* ── 8. KOMUNITAS ──────────────────────────────────────────────── */}
            {categoryKey === 'komunitas' && (
                <div className="space-y-4">
                    <div>
                        <FormLabel label="Nama Pemesan" required />
                        <Input aria-label="Nama Pemesan" value={data.client_name || ''} onChange={(e) => onChange('client_name', e.target.value)} placeholder="Nama lengkap pemesan komunitas" className="h-11 bg-white" />
                        {errors.client_name && <p className="mt-1 text-xs text-rose-600">{errors.client_name}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <FormLabel label="Nama Komunitas" required />
                            <Input
                                value={data.community_name || ''}
                                onChange={(e) => onChange('community_name', e.target.value)}
                                placeholder="Contoh: Jakarta Running Club"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <SelectWithOther
                            label="Jenis Komunitas"
                            required
                            options={KOMUNITAS_TYPES}
                            value={data.community_type}
                            otherValue={data.community_type_other}
                            onChangeValue={(val) => onChange('community_type', val)}
                            onChangeOther={(val) => onChange('community_type_other', val)}
                            placeholder="Pilih jenis komunitas..."
                        />
                        <div>
                            <FormLabel label="Jumlah Peserta Kegiatan" required />
                            <Input
                                type="number"
                                min="1"
                                value={data.participants_count || ''}
                                onChange={(e) => onChange('participants_count', e.target.value)}
                                placeholder="Contoh: 150"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <SelectWithOther
                            label="Jenis Kegiatan"
                            required
                            options={KOMUNITAS_ACTIVITIES}
                            value={data.activity_type}
                            otherValue={data.activity_type_other}
                            onChangeValue={(val) => onChange('activity_type', val)}
                            onChangeOther={(val) => onChange('activity_type_other', val)}
                            placeholder="Pilih jenis kegiatan..."
                        />
                        <div>
                            <FormLabel label="Tema Kegiatan" required />
                            <Input
                                value={data.activity_theme || ''}
                                onChange={(e) => onChange('activity_theme', e.target.value)}
                                placeholder="Contoh: 5K Fun Run Anniversary"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <div>
                            <FormLabel label="Lokasi Kegiatan" required />
                            <Input
                                value={data.activity_location || ''}
                                onChange={(e) => onChange('activity_location', e.target.value)}
                                placeholder="Contoh: Gelora Bung Karno"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <FormLabel label="Deskripsi / Agenda Kegiatan" />
                        <Textarea
                            rows={3}
                            value={data.activity_description || ''}
                            onChange={(e) => onChange('activity_description', e.target.value)}
                            placeholder="Rute perjalanan, agenda acara utama, sesi foto grup & individu..."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── 9. CORPORATE ──────────────────────────────────────────────── */}
            {categoryKey === 'corporate' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <FormLabel label="Nama Perusahaan" required />
                            <Input
                                value={data.company_name || ''}
                                onChange={(e) => onChange('company_name', e.target.value)}
                                placeholder="PT Contoh Sukses Mandiri"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <div>
                            <FormLabel label="Divisi / Departemen" />
                            <Input
                                value={data.department_division || ''}
                                onChange={(e) => onChange('department_division', e.target.value)}
                                placeholder="Contoh: Human Capital / Corporate Secretary"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SelectWithOther
                            label="Jenis Acara"
                            required
                            options={CORPORATE_EVENT_TYPES}
                            value={data.event_type}
                            otherValue={data.event_type_other}
                            onChangeValue={(val) => onChange('event_type', val)}
                            onChangeOther={(val) => onChange('event_type_other', val)}
                            placeholder="Pilih jenis acara..."
                        />
                        <div>
                            <FormLabel label="Jumlah Peserta" required />
                            <Input
                                type="number"
                                min="1"
                                value={data.participants_count || ''}
                                onChange={(e) => onChange('participants_count', e.target.value)}
                                placeholder="Contoh: 200"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <MultiSelectWithOther
                        label="Tujuan Dokumentasi"
                        required
                        options={CORPORATE_DOC_PURPOSES}
                        values={data.documentation_purpose}
                        otherValue={data.documentation_purpose_other}
                        onChangeValues={(vals) => onChange('documentation_purpose', vals)}
                        onChangeOther={(val) => onChange('documentation_purpose_other', val)}
                    />

                    <div>
                        <FormLabel label="Aturan / SOP Khusus" />
                        <Textarea
                            rows={3}
                            value={data.special_rules_sop || ''}
                            onChange={(e) => onChange('special_rules_sop', e.target.value)}
                            placeholder="Contoh: Dress code tim dokumentasi formal hitam, NDA sebelum publikasi..."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── 10. COMMERCIAL / BRAND ────────────────────────────────────── */}
            {categoryKey === 'commercial' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <FormLabel label="Nama Brand / Bisnis" required />
                            <Input
                                value={data.brand_name || ''}
                                onChange={(e) => onChange('brand_name', e.target.value)}
                                placeholder="Nama brand / produk"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <div>
                            <FormLabel label="Jenis Produk" required />
                            <Input
                                value={data.product_type || ''}
                                onChange={(e) => onChange('product_type', e.target.value)}
                                placeholder="Contoh: Skincare, Fashion, F&B"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SelectWithOther
                            label="Background"
                            required
                            options={COMMERCIAL_BACKGROUNDS}
                            value={data.background_type}
                            otherValue={data.background_type_other}
                            onChangeValue={(val) => onChange('background_type', val)}
                            onChangeOther={(val) => onChange('background_type_other', val)}
                            placeholder="Pilih background..."
                        />
                        <SelectWithOther
                            label="Lighting Style"
                            required
                            options={COMMERCIAL_LIGHTING_STYLES}
                            value={data.lighting_style}
                            otherValue={data.lighting_style_other}
                            onChangeValue={(val) => onChange('lighting_style', val)}
                            onChangeOther={(val) => onChange('lighting_style_other', val)}
                            placeholder="Pilih lighting style..."
                        />
                    </div>

                    <MultiSelectWithOther
                        label="Mood / Style Foto"
                        required
                        options={COMMERCIAL_MOODS}
                        values={data.mood_style}
                        otherValue={data.mood_style_other}
                        onChangeValues={(vals) => onChange('mood_style', vals)}
                        onChangeOther={(val) => onChange('mood_style_other', val)}
                    />

                </div>
            )}

            {/* ── 11. EVENT PUBLIK ──────────────────────────────────────────── */}
            {categoryKey === 'event' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <FormLabel label="Nama Event" required />
                            <Input
                                value={data.event_name || ''}
                                onChange={(e) => onChange('event_name', e.target.value)}
                                placeholder="Contoh: Java Jazz Festival / Tech Summit"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <div>
                            <FormLabel label="Penyelenggara / EO" required />
                            <Input
                                value={data.organizer || ''}
                                onChange={(e) => onChange('organizer', e.target.value)}
                                placeholder="Nama lembaga / event organizer"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <SelectWithOther
                            label="Jenis Event"
                            required
                            options={EVENT_TYPES}
                            value={data.event_type}
                            otherValue={data.event_type_other}
                            onChangeValue={(val) => onChange('event_type', val)}
                            onChangeOther={(val) => onChange('event_type_other', val)}
                            placeholder="Pilih jenis event..."
                        />
                        <div>
                            <FormLabel label="Estimasi Peserta" required />
                            <Input
                                type="number"
                                min="10"
                                value={data.estimated_participants || ''}
                                onChange={(e) => onChange('estimated_participants', e.target.value)}
                                placeholder="Contoh: 1000"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <div>
                            <FormLabel label="Dress Code" />
                            <Input
                                value={data.dress_code || ''}
                                onChange={(e) => onChange('dress_code', e.target.value)}
                                placeholder="Contoh: Batik / Smart Casual"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <FormLabel label="Lokasi Event" required />
                        <Input
                            value={data.event_location || ''}
                            onChange={(e) => onChange('event_location', e.target.value)}
                            placeholder="Nama venue / gedung / arena acara"
                            className="h-[38px] text-xs bg-white"
                        />
                    </div>

                </div>
            )}

            {/* ── 12. TRAVELING ─────────────────────────────────────────────── */}
            {categoryKey === 'traveling' && (
                <div className="space-y-4">
                    {/* Tags Input Destinasi */}
                    <TagsInput
                        label="Destinasi Perjalanan"
                        required
                        tags={data.destinations}
                        onChangeTags={(tags) => onChange('destinations', tags)}
                        placeholder="Contoh: Labuan Bajo, Bali, Tokyo (tekan Enter)"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <FormLabel label="Jumlah Peserta" required />
                            <Input
                                type="number"
                                min="1"
                                value={data.participants_count || ''}
                                onChange={(e) => onChange('participants_count', e.target.value)}
                                placeholder="Contoh: 8"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <SelectWithOther
                            label="Jenis Perjalanan"
                            required
                            options={TRAVELING_TRIP_TYPES}
                            value={data.trip_type}
                            otherValue={data.trip_type_other}
                            onChangeValue={(val) => onChange('trip_type', val)}
                            onChangeOther={(val) => onChange('trip_type_other', val)}
                            placeholder="Pilih jenis trip..."
                        />
                    </div>

                    {/* Jadwal dengan kalkulasi durasi otomatis */}
                    <div className="p-4 bg-sky-50/50 border border-sky-200/80 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between border-b border-sky-100 pb-1.5">
                            <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                                <span>Jadwal Perjalanan</span>
                            </span>
                            {tripDuration && (
                                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-sky-600 text-white shadow-2xs">
                                    Durasi: {tripDuration}
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <FormLabel label="Tanggal Berangkat" required />
                                <Input
                                    type="date"
                                    value={data.departure_date || ''}
                                    onChange={(e) => onChange('departure_date', e.target.value)}
                                    className="h-[38px] text-xs bg-white"
                                />
                            </div>
                            <div>
                                <FormLabel label="Tanggal Pulang" required />
                                <Input
                                    type="date"
                                    value={data.return_date || ''}
                                    onChange={(e) => onChange('return_date', e.target.value)}
                                    className="h-[38px] text-xs bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <SelectWithOther
                            label="Transportasi Utama"
                            required
                            options={TRAVELING_TRANSPORTS}
                            value={data.transportation_mode}
                            otherValue={data.transportation_other}
                            onChangeValue={(val) => onChange('transportation_mode', val)}
                            onChangeOther={(val) => onChange('transportation_other', val)}
                            placeholder="Pilih transportasi..."
                        />
                        <div>
                            <FormLabel label="Maskapai / Detail Kendaraan" />
                            <Input
                                value={data.airline_transport_detail || ''}
                                onChange={(e) => onChange('airline_transport_detail', e.target.value)}
                                placeholder="Contoh: Garuda Indonesia / Hiace"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <div>
                            <FormLabel label="Hotel / Akomodasi" />
                            <Input
                                value={data.accommodation_hotel || ''}
                                onChange={(e) => onChange('accommodation_hotel', e.target.value)}
                                placeholder="Nama hotel / villa"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                    </div>

                    <div>
                        <FormLabel label="Agenda Utama Perjalanan" required />
                        <Textarea
                            rows={3}
                            value={data.main_agenda || ''}
                            onChange={(e) => onChange('main_agenda', e.target.value)}
                            placeholder="Hari 1: Island Hopping, Hari 2: Snorkeling, Hari 3: Sunset Dinner..."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── 13. PERORANGAN ────────────────────────────────────────────── */}
            {categoryKey === 'perorangan' && (
                <div className="space-y-4">
                    <div>
                        <FormLabel label="Nama Pemesan" required />
                        <Input aria-label="Nama Pemesan" value={data.client_name || ''} onChange={(e) => onChange('client_name', e.target.value)} placeholder="Nama lengkap pemesan" className="h-11 bg-white" />
                        {errors.client_name && <p className="mt-1 text-xs text-rose-600">{errors.client_name}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SelectWithOther
                            label="Tujuan Foto"
                            required
                            options={PERORANGAN_PURPOSES}
                            value={data.photo_purpose}
                            otherValue={data.photo_purpose_other}
                            onChangeValue={(val) => onChange('photo_purpose', val)}
                            onChangeOther={(val) => onChange('photo_purpose_other', val)}
                            placeholder="Pilih tujuan foto..."
                        />
                        <SelectWithOther
                            label="Jenis Sesi"
                            required
                            options={PERORANGAN_SESSION_TYPES}
                            value={data.session_type}
                            otherValue={data.session_type_other}
                            onChangeValue={(val) => onChange('session_type', val)}
                            onChangeOther={(val) => onChange('session_type_other', val)}
                            placeholder="Pilih jenis sesi..."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <FormLabel label="Jumlah Look / Outfit" required />
                            <Input
                                type="number"
                                min="1"
                                value={data.outfit_looks_count || ''}
                                onChange={(e) => onChange('outfit_looks_count', e.target.value)}
                                placeholder="Contoh: 2"
                                className="h-[38px] text-xs bg-white"
                            />
                        </div>
                        <div>
                            <FormLabel label="Durasi Sesi" required />
                            <NativeSelect
                                value={data.session_duration || ''}
                                onChange={(e) => onChange('session_duration', e.target.value)}
                                className="h-[38px] text-xs bg-white"
                            >
                                <option value="">Pilih durasi sesi...</option>
                                {PERORANGAN_DURATIONS.map((dur) => (
                                    <option key={dur} value={dur}>{dur}</option>
                                ))}
                            </NativeSelect>
                        </div>
                        <SelectWithOther
                            label="Backdrop / Background"
                            required
                            options={PERORANGAN_BACKDROPS}
                            value={data.backdrop}
                            otherValue={data.backdrop_other}
                            onChangeValue={(val) => onChange('backdrop', val)}
                            onChangeOther={(val) => onChange('backdrop_other', val)}
                            placeholder="Pilih backdrop..."
                        />
                    </div>

                    <div>
                        <FormLabel label="Properti Khusus Pribadi" />
                        <Textarea
                            rows={2}
                            value={data.special_props || ''}
                            onChange={(e) => onChange('special_props', e.target.value)}
                            placeholder="Buket bunga wisuda, toga, gitar, laptop, buku..."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── 14. LAINNYA / TRADISIONAL ──────────────────────────────────── */}
            {categoryKey === 'lainnya' && (
                <div className="space-y-4">
                    <h3 className="border-b border-slate-200 pb-2 text-sm font-semibold text-slate-900">Informasi Event Utama</h3>
                    <div>
                        <FormLabel label="Nama Pemesan" required />
                        <Input aria-label="Nama Pemesan" value={data.client_name || ''} onChange={(e) => onChange('client_name', e.target.value)} placeholder="Nama lengkap penanggung jawab pemesanan" className="h-11 bg-white" />
                        {errors.client_name && <p className="mt-1 text-xs text-rose-600">{errors.client_name}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <FormLabel label="Tanggal Event" required />
                            <Input aria-label="Tanggal Event" type="date" value={data.event_date || ''} onChange={(e) => onChange('event_date', e.target.value)} className="h-11 bg-white" />
                        </div>
                        <div>
                            <FormLabel label="Waktu Event (Time Range)" required hint="Contoh: 09:00 - 16:00" />
                            <Input aria-label="Waktu Event (Time Range)" value={data.event_time_range || ''} onChange={(e) => onChange('event_time_range', e.target.value)} placeholder="09:00 - 16:00" className="h-11 bg-white" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SelectWithOther
                            label="Jenis Event"
                            required
                            options={LAINNYA_TRADITION_TYPES}
                            value={data.event_type || data.event_tradition_type}
                            otherValue={data.event_tradition_other}
                            onChangeValue={(val) => {
                                onChange('event_tradition_type', val);
                                onChange('event_type', val);
                            }}
                            onChangeOther={(val) => onChange('event_tradition_other', val)}
                            placeholder="Pilih jenis event..."
                        />
                        <div>
                            <FormLabel label="Jenis Kebutuhan" required />
                            <NativeSelect aria-label="Jenis Kebutuhan" value={data.needs_type || ''} onChange={(e) => onChange('needs_type', e.target.value)} className="h-11 bg-white">
                                <option value="">Pilih jenis kebutuhan...</option>
                                <option value="Foto Only">Foto Only</option>
                                <option value="Video Only">Video Only</option>
                                <option value="Foto & Video">Foto &amp; Video</option>
                            </NativeSelect>
                        </div>
                    </div>
                    <div>
                        <FormLabel label="Lokasi Event" required />
                        <Input
                            aria-label="Lokasi Event"
                            value={data.event_location || data.location || ''}
                            onChange={(e) => onChange('event_location', e.target.value)}
                            placeholder="Alamat atau nama venue event"
                            className="h-11 bg-white"
                        />
                    </div>

                    <div>
                        <FormLabel label="Detail Kebutuhan Khusus" />
                        <Textarea
                            rows={4}
                            value={data.special_requirements || ''}
                            onChange={(e) => onChange('special_requirements', e.target.value)}
                            placeholder="Jelaskan kebutuhan dokumentasi dan hal khusus yang perlu diperhatikan tim..."
                            className="text-xs bg-white"
                        />
                    </div>
                </div>
            )}

            {/* ── STANDARD FALLBACK ─────────────────────────────────────────── */}
            {categoryKey === 'standard' && (
                <div className="space-y-3">
                    <FormLabel label="Catatan / Kebutuhan Sesi" />
                    <Textarea
                        rows={4}
                        value={data.notes || ''}
                        onChange={(e) => onChange('notes', e.target.value)}
                        placeholder="Tuliskan kebutuhan dokumentasi Anda secara lengkap..."
                        className="text-xs bg-white"
                    />
                </div>
            )}
        </div>
    );
}
