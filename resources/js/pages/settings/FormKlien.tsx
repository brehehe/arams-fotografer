import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    Share2,
    Link2,
    Check,
    Copy,
    ExternalLink,
    Phone,
    X,
    CheckCircle2,
    Save,
    Eye,
    Palette,
    Sparkles,
    RotateCcw,
    FileText,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import SettingsTabNav from '@/components/SettingsTabNav';
import { ColorSettingRow } from '@/components/settings/ThemeControls';

interface FormKlienProps {
    settings?: any;
    settingsMap?: Record<string, string>;
}

export default function FormKlienPage({ settings = {}, settingsMap = {} }: FormKlienProps) {
    const getVal = (key: string, def: string = '') => {
        if (settingsMap && settingsMap[key] !== undefined) return settingsMap[key];
        if (!settings) return def;
        for (const group in settings) {
            if (Array.isArray(settings[group])) {
                const found = settings[group].find((s: any) => s.key === key);
                if (found && found.value) return found.value;
            }
        }
        return def;
    };

    const [activeTab, setActiveTab] = useState<'content' | 'theme'>('theme');

    const [formKlien, setFormKlien] = useState({
        intake_form_title: getVal('intake_form_title', 'Formulir Pemesanan & Data Klien'),
        intake_form_subtitle: getVal('intake_form_subtitle', 'Lengkapi data kebutuhan fotografi & videografi acara spesial Anda.'),
        intake_form_status: getVal('intake_form_status', 'open'),
        intake_closed_message: getVal('intake_closed_message', 'Mohon maaf, saat ini pendaftaran booking baru sedang ditutup sementara.'),
        intake_whatsapp_notify: getVal('intake_whatsapp_notify', getVal('company_whatsapp', '+62 812-3456-7890')),
        intake_notes: getVal('intake_notes', 'Setelah mengisi formulir, tim kami akan menghubungi Anda via WhatsApp untuk konfirmasi ketersediaan jadwal & invoice.'),
        intake_success_title: getVal('intake_success_title', 'Terima Kasih! Formulir Berhasil Terkirim'),
        intake_success_message: getVal('intake_success_message', 'Data pemesanan Anda telah diterima oleh tim Arams Pictures. Kami akan segera menghubungi Anda.'),
        // Separate Theme & Color Settings for Client Intake Form
        intake_preset: getVal('intake_preset', 'modern_indigo'),
        intake_primary_color: getVal('intake_primary_color', '#4F46E5'),
        intake_bg_color: getVal('intake_bg_color', '#090C15'),
        intake_sidebar_bg: getVal('intake_sidebar_bg', '#0F1424'),
        intake_card_bg: getVal('intake_card_bg', '#FFFFFF'),
        intake_text_color: getVal('intake_text_color', '#0F172A'),
    });

    const [saving, setSaving] = useState(false);
    const [copiedIntakeUrl, setCopiedIntakeUrl] = useState(false);

    const formPresets = [
        {
            id: 'modern_indigo',
            name: 'Modern Indigo (Default)',
            description: 'Elegan modern dengan aksen Indigo #4F46E5 dan background dark luxury #090C15.',
            primary: '#4F46E5',
            bg: '#090C15',
            sidebar: '#0F1424',
            card: '#FFFFFF',
            text: '#0F172A',
            badge: 'Default',
        },
        {
            id: 'arams_maroon',
            name: 'Arams Royal Maroon',
            description: 'Nuansa brand khas Arams dengan Wine Maroon #4A151B dan dark luxury tone.',
            primary: '#4A151B',
            bg: '#1E0A0E',
            sidebar: '#2E0F15',
            card: '#FFFFFF',
            text: '#1E0A0E',
            badge: 'Signature',
        },
        {
            id: 'luxury_gold',
            name: 'Luxury Champagne Gold',
            description: 'Sentuhan kemewahan pernikahan dengan aksen emas Champagne Gold #C98922.',
            primary: '#C98922',
            bg: '#120E08',
            sidebar: '#1E1810',
            card: '#FFFFFF',
            text: '#1E1810',
            badge: 'Wedding Luxury',
        },
        {
            id: 'warm_terracotta',
            name: 'Warm Studio Terracotta',
            description: 'Warm & estetik dengan aksen Terracotta #F05322 yang memikat.',
            primary: '#F05322',
            bg: '#1A0F0A',
            sidebar: '#2A160F',
            card: '#FFFFFF',
            text: '#1A0F0A',
            badge: 'Warm Aesthetic',
        },
        {
            id: 'emerald_nature',
            name: 'Botanical Emerald',
            description: 'Nuansa outdoor & fresh dengan aksen Deep Emerald #059669.',
            primary: '#059669',
            bg: '#06120E',
            sidebar: '#0D241C',
            card: '#FFFFFF',
            text: '#06120E',
            badge: 'Fresh Botanical',
        },
        {
            id: 'clean_light',
            name: 'Clean Minimalist Light',
            description: 'Background cerah bersih #F1F5F9 dengan sidebar slate gelap dan aksen indigo.',
            primary: '#4F46E5',
            bg: '#F1F5F9',
            sidebar: '#1E293B',
            card: '#FFFFFF',
            text: '#0F172A',
            badge: 'Light Theme',
        },
    ];

    const applyPreset = (preset: typeof formPresets[0]) => {
        setFormKlien((prev) => ({
            ...prev,
            intake_preset: preset.id,
            intake_primary_color: preset.primary,
            intake_bg_color: preset.bg,
            intake_sidebar_bg: preset.sidebar,
            intake_card_bg: preset.card,
            intake_text_color: preset.text,
        }));
        toast.success(`Preset "${preset.name}" berhasil diterapkan.`);
    };

    const handleCopyIntakeUrl = () => {
        const url = typeof window !== 'undefined' ? `${window.location.origin}/form-klien` : 'http://localhost:8000/form-klien';
        navigator.clipboard.writeText(url);
        setCopiedIntakeUrl(true);
        toast.success('Link Form Klien berhasil disalin ke clipboard!');
        setTimeout(() => setCopiedIntakeUrl(false), 2000);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        router.post('/settings', { settings: formKlien }, {
            preserveScroll: true,
            onSuccess: () => {
                setSaving(false);
                toast.success('Pengaturan dan Tema Form Klien Berhasil Disimpan');
            },
            onError: (errors) => {
                setSaving(false);
                toast.error((Object.values(errors)[0] as string) || 'Gagal menyimpan pengaturan Form Klien');
            }
        });
    };

    return (
        <div className="space-y-6 pb-16 w-full max-w-full">
            <Head title="Pengaturan Form Klien - Arams Photography" />

            {/* Header Title & Subtitle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
                        Pengaturan Formulir Klien
                    </h1>
                    <p className="text-sm mt-0.5 text-slate-500">
                        Kelola formulir booking mandiri klien publik, konten instruksi, serta kustomisasi tema warnanya secara terpisah.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleCopyIntakeUrl}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
                    >
                        {copiedIntakeUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedIntakeUrl ? 'Tersalin' : 'Salin Tautan'}</span>
                    </button>
                    <a
                        href="/form-klien"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka /form-klien</span>
                    </a>
                </div>
            </div>

            {/* Top Navigation Tabs */}
            <SettingsTabNav showMainTabs activeMainTab="form_klien" />

            {/* Sub-Tab Navigation for Form Settings */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                    type="button"
                    onClick={() => setActiveTab('theme')}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'theme'
                            ? 'bg-[#4F46E5] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Kustomisasi Warna &amp; Tema Form</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('content')}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'content'
                            ? 'bg-[#4F46E5] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Konten, Teks &amp; Status Form</span>
                </button>
            </div>

            {/* 2 Column Settings & Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Form Settings (7 cols) */}
                <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
                    {/* ══════════════════════════════════════════════════════════════ */}
                    {/* TAB: TEMA & WARNA KHUSUS FORM KLIEN */}
                    {/* ══════════════════════════════════════════════════════════════ */}
                    {activeTab === 'theme' && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                                        <Palette className="w-3 h-3" />
                                        <span>Pengaturan Warna Terpisah</span>
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900">Kustomisasi Tema Form Klien (/form-klien)</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Warna di bawah ini khusus mengatur tampilan halaman publik Form Klien secara mandiri tanpa memengaruhi dashboard admin.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => applyPreset(formPresets[0])}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Reset Default</span>
                                </button>
                            </div>

                            {/* Preset Themes */}
                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-slate-800">
                                    Pilihan Preset Tema Siap Pakai (1-Click Theme)
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {formPresets.map((preset) => {
                                        const isSelected = formKlien.intake_preset === preset.id;
                                        return (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                onClick={() => applyPreset(preset)}
                                                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                                    isSelected
                                                        ? 'border-[#4F46E5] ring-2 ring-indigo-100 bg-indigo-50/30'
                                                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                                        {preset.name}
                                                    </span>
                                                    {preset.badge && (
                                                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                                            {preset.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                                                    {preset.description}
                                                </p>
                                                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                                                    <span className="text-[9px] font-semibold text-slate-400 mr-1">Palet:</span>
                                                    <span className="w-4 h-4 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: preset.primary }} title={`Primary: ${preset.primary}`} />
                                                    <span className="w-4 h-4 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: preset.bg }} title={`Background: ${preset.bg}`} />
                                                    <span className="w-4 h-4 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: preset.sidebar }} title={`Sidebar: ${preset.sidebar}`} />
                                                    <span className="w-4 h-4 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: preset.card }} title={`Card: ${preset.card}`} />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Detailed Color Pickers */}
                            <div className="space-y-1 pt-4 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                                    Penyesuaian Detail Warna
                                </h4>

                                <ColorSettingRow
                                    label="Warna Utama & Aksen (Primary Accent)"
                                    description="Digunakan untuk tombol submit/next, indikator step aktif, badge paket terpilih, dan sorotan ikon."
                                    value={formKlien.intake_primary_color}
                                    onChange={(col) => setFormKlien({ ...formKlien, intake_primary_color: col, intake_preset: 'custom' })}
                                    presets={[
                                        { hex: '#4F46E5', label: 'Indigo' },
                                        { hex: '#4A151B', label: 'Royal Maroon' },
                                        { hex: '#C98922', label: 'Champagne Gold' },
                                        { hex: '#F05322', label: 'Terracotta' },
                                        { hex: '#059669', label: 'Emerald' },
                                        { hex: '#E11D48', label: 'Rose' },
                                        { hex: '#2563EB', label: 'Blue' },
                                    ]}
                                />

                                <ColorSettingRow
                                    label="Warna Latar Belakang Luar (Page Background)"
                                    description="Warna background kanvas keseluruhan pada halaman /form-klien."
                                    value={formKlien.intake_bg_color}
                                    onChange={(col) => setFormKlien({ ...formKlien, intake_bg_color: col, intake_preset: 'custom' })}
                                    presets={[
                                        { hex: '#090C15', label: 'Dark Navy' },
                                        { hex: '#1E0A0E', label: 'Dark Wine' },
                                        { hex: '#120E08', label: 'Dark Gold' },
                                        { hex: '#1A0F0A', label: 'Dark Terracotta' },
                                        { hex: '#06120E', label: 'Dark Botanical' },
                                        { hex: '#F1F5F9', label: 'Light Slate' },
                                        { hex: '#FAF8F5', label: 'Warm Cream' },
                                    ]}
                                />

                                <ColorSettingRow
                                    label="Warna Sidebar Info Studio (Left Showcase)"
                                    description="Warna kartu sisi kiri yang menampilkan logo studio, judul form, dan foto pengantin."
                                    value={formKlien.intake_sidebar_bg}
                                    onChange={(col) => setFormKlien({ ...formKlien, intake_sidebar_bg: col, intake_preset: 'custom' })}
                                    presets={[
                                        { hex: '#0F1424', label: 'Navy Sidebar' },
                                        { hex: '#2E0F15', label: 'Maroon Sidebar' },
                                        { hex: '#1E1810', label: 'Gold Sidebar' },
                                        { hex: '#2A160F', label: 'Terracotta Sidebar' },
                                        { hex: '#0D241C', label: 'Emerald Sidebar' },
                                        { hex: '#1E293B', label: 'Slate Sidebar' },
                                    ]}
                                />

                                <ColorSettingRow
                                    label="Warna Latar Kartu Utama Form (Right Card Background)"
                                    description="Warna container kartu formulir wizard (tempat input data berada)."
                                    value={formKlien.intake_card_bg}
                                    onChange={(col) => setFormKlien({ ...formKlien, intake_card_bg: col, intake_preset: 'custom' })}
                                    presets={[
                                        { hex: '#FFFFFF', label: 'Pure White (Standar)' },
                                        { hex: '#FDFBF7', label: 'Soft Ivory' },
                                        { hex: '#F8FAFC', label: 'Light Slate' },
                                        { hex: '#0F1424', label: 'Dark Card' },
                                    ]}
                                />

                                <ColorSettingRow
                                    label="Warna Teks Judul &amp; Label Utama"
                                    description="Warna teks judul dan label pada kartu isian formulir."
                                    value={formKlien.intake_text_color}
                                    onChange={(col) => setFormKlien({ ...formKlien, intake_text_color: col, intake_preset: 'custom' })}
                                    presets={[
                                        { hex: '#0F172A', label: 'Dark Slate' },
                                        { hex: '#1E0A0E', label: 'Deep Maroon' },
                                        { hex: '#1E1810', label: 'Deep Gold' },
                                        { hex: '#1A0F0A', label: 'Deep Terracotta' },
                                        { hex: '#06120E', label: 'Deep Botanical' },
                                    ]}
                                />
                            </div>
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════════════ */}
                    {/* TAB: KONTEN, TEKS & STATUS FORM */}
                    {/* ══════════════════════════════════════════════════════════════ */}
                    {activeTab === 'content' && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Konfigurasi Konten &amp; Status</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Sesuaikan judul, status penerimaan, nomor WhatsApp, dan pesan konfirmasi.</p>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                    formKlien.intake_form_status === 'open'
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                    <span className={`w-2 h-2 rounded-full ${formKlien.intake_form_status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                    {formKlien.intake_form_status === 'open' ? 'Menerima Booking' : 'Pendaftaran Ditutup'}
                                </span>
                            </div>

                            {/* Status Toggle */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Status Pendaftaran Form Klien</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormKlien({ ...formKlien, intake_form_status: 'open' })}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                            formKlien.intake_form_status === 'open'
                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>Buka (Menerima Klien)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormKlien({ ...formKlien, intake_form_status: 'closed' })}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                            formKlien.intake_form_status === 'closed'
                                                ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <X className="w-4 h-4 text-rose-600" />
                                        <span>Tutup Sementara (Fully Booked)</span>
                                    </button>
                                </div>
                            </div>

                            {/* Judul & Subjudul */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Judul Formulir Booking</label>
                                    <input
                                        type="text"
                                        value={formKlien.intake_form_title}
                                        onChange={(e) => setFormKlien({ ...formKlien, intake_form_title: e.target.value })}
                                        placeholder="Formulir Pemesanan & Data Klien"
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Subjudul / Sambutan Formulir</label>
                                    <textarea
                                        rows={2}
                                        value={formKlien.intake_form_subtitle}
                                        onChange={(e) => setFormKlien({ ...formKlien, intake_form_subtitle: e.target.value })}
                                        placeholder="Lengkapi data kebutuhan fotografi & videografi acara spesial Anda."
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 transition-colors resize-none"
                                    />
                                </div>

                                {/* WhatsApp Notifikasi */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor WhatsApp Konfirmasi &amp; Notifikasi</label>
                                    <div className="relative">
                                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                        <input
                                            type="text"
                                            value={formKlien.intake_whatsapp_notify}
                                            onChange={(e) => setFormKlien({ ...formKlien, intake_whatsapp_notify: e.target.value })}
                                            placeholder="+62 812-3456-7890"
                                            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 transition-colors"
                                        />
                                    </div>
                                    <span className="text-[11px] text-slate-400 mt-1 block">Nomor ini akan tampil bagi klien jika ingin langsung bertanya melalui WhatsApp.</span>
                                </div>

                                {/* Catatan / Ketentuan */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Instruksi / Catatan Penting Sebelum Isi Form</label>
                                    <textarea
                                        rows={3}
                                        value={formKlien.intake_notes}
                                        onChange={(e) => setFormKlien({ ...formKlien, intake_notes: e.target.value })}
                                        placeholder="Contoh: Pemesanan tanggal dianggap sah setelah pembayaran Down Payment (DP) 30% dikonfirmasi."
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 transition-colors resize-none"
                                    />
                                </div>

                                {/* Pesan Sukses */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Pesan Konfirmasi Setelah Klien Mengirimkan Data</label>
                                    <textarea
                                        rows={2}
                                        value={formKlien.intake_success_message}
                                        onChange={(e) => setFormKlien({ ...formKlien, intake_success_message: e.target.value })}
                                        placeholder="Terima kasih! Formulir Anda telah berhasil kami terima..."
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500 transition-colors resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bottom Save Bar */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                            Pastikan untuk menyimpan perubahan sebelum keluar halaman.
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{ backgroundColor: formKlien.intake_primary_color }}
                            className="inline-flex items-center gap-2 px-6 py-2.5 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:opacity-90 hover:scale-[1.02] cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                            <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan Form Klien'}</span>
                        </button>
                    </div>
                </form>

                {/* Live Preview Card (5 cols) */}
                <div className="lg:col-span-5 bg-slate-100/80 p-5 rounded-2xl border border-slate-200/80 space-y-4 sticky top-20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-indigo-600" />
                            <span className="text-xs font-bold text-slate-800">Live Preview Form Klien</span>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            Real-time
                        </span>
                    </div>

                    {/* Mockup Container with dynamic background */}
                    <div
                        className="rounded-2xl p-4 border shadow-md space-y-3 transition-colors duration-300"
                        style={{ backgroundColor: formKlien.intake_bg_color }}
                    >
                        <div className="grid grid-cols-12 gap-3">
                            {/* Mini Left Sidebar */}
                            <div
                                className="col-span-4 rounded-xl p-3 text-white space-y-3 flex flex-col justify-between border border-white/5 transition-colors duration-300 h-full"
                                style={{ backgroundColor: formKlien.intake_sidebar_bg }}
                            >
                                <div className="space-y-2 flex-1 flex flex-col">
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <div className="w-5 h-5 rounded bg-white text-black font-black text-[9px] flex items-center justify-center">
                                            ap
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-tight">ARAMS</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-white leading-tight line-clamp-2 shrink-0">
                                        {formKlien.intake_form_title || 'Form Data Klien'}
                                    </p>
                                    <div className="w-full flex-1 min-h-[70px] bg-black/30 rounded-lg flex items-center justify-center text-[8px] text-slate-400 border border-white/5 mt-1">
                                        Cover Photo
                                    </div>
                                </div>
                                <span className="text-[8px] text-slate-500 shrink-0">© 2026 Arams</span>
                            </div>

                            {/* Mini Right Form Card */}
                            <div
                                className="col-span-8 rounded-xl p-3 border border-slate-200/60 shadow-xs space-y-2.5 transition-colors duration-300"
                                style={{ backgroundColor: formKlien.intake_card_bg }}
                            >
                                {/* Mini Stepper */}
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <div className="flex items-center gap-1">
                                        <span
                                            className="w-4 h-4 rounded-full text-white text-[8px] font-bold flex items-center justify-center"
                                            style={{ backgroundColor: formKlien.intake_primary_color }}
                                        >
                                            1
                                        </span>
                                        <span className="w-4 h-0.5 bg-slate-200" />
                                        <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 text-[8px] font-bold flex items-center justify-center">
                                            2
                                        </span>
                                        <span className="w-4 h-0.5 bg-slate-200" />
                                        <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 text-[8px] font-bold flex items-center justify-center">
                                            3
                                        </span>
                                    </div>
                                    <span
                                        className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                                        style={{
                                            backgroundColor: `${formKlien.intake_primary_color}15`,
                                            color: formKlien.intake_primary_color,
                                        }}
                                    >
                                        Tahap 1/4
                                    </span>
                                </div>

                                {/* Form Title */}
                                <div>
                                    <span
                                        className="text-[10px] font-black block leading-tight truncate"
                                        style={{ color: formKlien.intake_text_color }}
                                    >
                                        {formKlien.intake_form_title}
                                    </span>
                                    <span className="text-[8px] text-slate-400 block line-clamp-1">
                                        {formKlien.intake_form_subtitle}
                                    </span>
                                </div>

                                {/* Dummy Input Fields */}
                                <div className="space-y-1.5">
                                    <div className="h-6 bg-slate-50 rounded border border-slate-200 px-2 flex items-center text-[8px] text-slate-500">
                                        Nama Lengkap Klien
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <div className="h-6 bg-slate-50 rounded border border-slate-200 px-2 flex items-center text-[8px] text-slate-500">
                                            0812-3456-7890
                                        </div>
                                        <div
                                            className="h-6 rounded border px-2 flex items-center text-[8px] font-bold"
                                            style={{
                                                borderColor: formKlien.intake_primary_color,
                                                backgroundColor: `${formKlien.intake_primary_color}10`,
                                                color: formKlien.intake_primary_color,
                                            }}
                                        >
                                            Wedding ✓
                                        </div>
                                    </div>
                                </div>

                                {/* Mini Action Button */}
                                <div className="pt-2 border-t border-slate-100 flex justify-end">
                                    <div
                                        className="px-3 py-1 rounded-lg text-[9px] font-bold text-white flex items-center gap-1 shadow-2xs"
                                        style={{ backgroundColor: formKlien.intake_primary_color }}
                                    >
                                        <span>Selanjutnya</span>
                                        <span>→</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <a
                            href="/form-klien"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/15"
                        >
                            <span>Buka Form Klien (/form-klien)</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
