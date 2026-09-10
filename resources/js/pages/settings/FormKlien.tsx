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
    Globe,
    Star,
    Shield,
    ArrowRight,
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

    const [activeTab, setActiveTab] = useState<'content' | 'theme' | 'portal_colors'>('theme');

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
        // Portal Klien & Footer Color Customizations
        portal_footer_bg: getVal('portal_footer_bg', '#3C0E0E'),
        portal_footer_text: getVal('portal_footer_text', '#F4EBE4'),
        portal_footer_main_bg: getVal('portal_footer_main_bg', '#FBF6F0'),
        portal_footer_main_text: getVal('portal_footer_main_text', '#334155'),
        portal_hero_bg: getVal('portal_hero_bg', '#3C0E0E'),
        portal_nav_bg: getVal('portal_nav_bg', '#3C0E0E'),
        portal_bg_color: getVal('portal_bg_color', '#FBF6F0'),
        // Kustomisasi Tombol Portal Klien (/client/...)
        portal_btn_bg: getVal('portal_btn_bg', '#FFFFFF'),
        portal_btn_text: getVal('portal_btn_text', '#3C0E0E'),
        portal_btn_border: getVal('portal_btn_border', '#FFFFFF'),
        portal_btn_hover_bg: getVal('portal_btn_hover_bg', '#3C0E0E'),
        portal_btn_hover_text: getVal('portal_btn_hover_text', '#FFFFFF'),
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
        <div className="space-y-4 pb-2 w-full max-w-full">
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
                    onClick={() => setActiveTab('portal_colors')}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'portal_colors'
                            ? 'bg-[#4F46E5] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Warna Footer &amp; Portal Klien</span>
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
                    {/* TAB: WARNA FOOTER & PORTAL KLIEN */}
                    {/* ══════════════════════════════════════════════════════════════ */}
                    {activeTab === 'portal_colors' && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                                        <Globe className="w-3 h-3" />
                                        <span>Master Setting Portal Klien</span>
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900">Kustomisasi Warna Footer &amp; Portal Klien</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Pengaturan warna untuk bar keunggulan footer, teks &amp; ikon putih, hero banner, dan kanvas portal klien (/client/...).
                                    </p>
                                </div>
                                <a
                                    href="/client/dashboard"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Buka Portal</span>
                                </a>
                            </div>

                            <div className="space-y-4">
                                <ColorSettingRow
                                    label="Warna Latar Bar Keunggulan &amp; Footer Portal"
                                    description="Latar belakang bar 'Kenapa Memilih Arams Pictures?' di bagian bawah portal klien."
                                    value={formKlien.portal_footer_bg}
                                    onChange={(col) => setFormKlien({ ...formKlien, portal_footer_bg: col })}
                                    presets={[
                                        { hex: '#3C0E0E', label: 'Classic Maroon' },
                                        { hex: '#22070A', label: 'Dark Wine' },
                                        { hex: '#170406', label: 'Deep Dark Cherry' },
                                        { hex: '#0F172A', label: 'Deep Navy' },
                                        { hex: '#064E3B', label: 'Dark Emerald' },
                                        { hex: '#18181B', label: 'Charcoal' },
                                    ]}
                                />

                                <ColorSettingRow
                                    label="Warna Teks &amp; Ikon Bar Keunggulan"
                                    description="Warna tulisan judul, deskripsi, dan ikon pada bar keunggulan portal klien (disarankan putih/terang)."
                                    value={formKlien.portal_footer_text}
                                    onChange={(col) => setFormKlien({ ...formKlien, portal_footer_text: col })}
                                    presets={[
                                        { hex: '#FFFFFF', label: 'Pure White (Standar)' },
                                        { hex: '#F4EBE4', label: 'Warm Cream' },
                                        { hex: '#E2E8F0', label: 'Soft Slate' },
                                    ]}
                                />

                                <ColorSettingRow
                                    label="Warna Dasar Latar Footer Utama (Main Footer Background)"
                                    description="Latar belakang area informasi brand, kontak, dan copyright di footer portal klien (default #FBF6F0)."
                                    value={formKlien.portal_footer_main_bg}
                                    onChange={(col) => setFormKlien({ ...formKlien, portal_footer_main_bg: col })}
                                    presets={[
                                        { hex: '#FBF6F0', label: 'Warm Cream (Default)' },
                                        { hex: '#FFFFFF', label: 'Pure White' },
                                        { hex: '#FAF7F5', label: 'Ivory Soft' },
                                        { hex: '#F1F5F9', label: 'Slate Light' },
                                        { hex: '#3C0E0E', label: 'Dark Burgundy' },
                                        { hex: '#0F172A', label: 'Deep Navy' },
                                    ]}
                                />

                                <ColorSettingRow
                                    label="Warna Teks Footer Utama (Main Footer Text)"
                                    description="Warna tulisan deskripsi usaha, nomor kontak, dan teks copyright pada footer utama."
                                    value={formKlien.portal_footer_main_text}
                                    onChange={(col) => setFormKlien({ ...formKlien, portal_footer_main_text: col })}
                                    presets={[
                                        { hex: '#334155', label: 'Slate Charcoal (Default)' },
                                        { hex: '#1E293B', label: 'Dark Slate' },
                                        { hex: '#3C0E0E', label: 'Arams Maroon' },
                                        { hex: '#FFFFFF', label: 'Pure White' },
                                        { hex: '#F4EBE4', label: 'Warm Light' },
                                    ]}
                                />

                                <ColorSettingRow
                                    label="Warna Latar Hero Banner Portal"
                                    description="Warna latar belakang banner sambutan hero pada halaman utama portal klien."
                                    value={formKlien.portal_hero_bg}
                                    onChange={(col) => setFormKlien({ ...formKlien, portal_hero_bg: col })}
                                    presets={[
                                        { hex: '#3C0E0E', label: 'Arams Burgundy' },
                                        { hex: '#22070A', label: 'Dark Wine' },
                                        { hex: '#0F172A', label: 'Midnight Blue' },
                                        { hex: '#064E3B', label: 'Emerald' },
                                    ]}
                                />

                                <ColorSettingRow
                                    label="Warna Latar Navbar Header Portal"
                                    description="Warna navbar atas tempat logo Arams Pictures dan menu navigasi portal klien."
                                    value={formKlien.portal_nav_bg}
                                    onChange={(col) => setFormKlien({ ...formKlien, portal_nav_bg: col })}
                                    presets={[
                                        { hex: '#3C0E0E', label: 'Arams Burgundy' },
                                        { hex: '#22070A', label: 'Dark Wine' },
                                        { hex: '#0F172A', label: 'Midnight Blue' },
                                        { hex: '#18181B', label: 'Charcoal' },
                                    ]}
                                />

                                <ColorSettingRow
                                    label="Warna Latar Belakang Kanvas Portal"
                                    description="Warna latar belakang utama di luar kartu-kartu pada portal klien."
                                    value={formKlien.portal_bg_color}
                                    onChange={(col) => setFormKlien({ ...formKlien, portal_bg_color: col })}
                                    presets={[
                                        { hex: '#FBF6F0', label: 'Warm Off-White (Default)' },
                                        { hex: '#FFFFFF', label: 'Pure White' },
                                        { hex: '#F8FAFC', label: 'Light Slate' },
                                        { hex: '#F4EBE4', label: 'Soft Cream' },
                                    ]}
                                />

                                {/* ── KUSTOMISASI TOMBOL & OUTLINE PORTAL KLIEN ── */}
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-2 h-2 rounded-full bg-[#3C0E0E]" />
                                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                            Kustomisasi Tombol &amp; Outline Portal Klien
                                        </h4>
                                    </div>

                                    <div className="space-y-4">
                                        <ColorSettingRow
                                            label="Warna Outline / Garis Tepi Tombol (Default: Putih)"
                                            description="Outline awal di sekeliling tombol utama pada portal klien (Dashboard, Projects, Portfolio, Detail)."
                                            value={formKlien.portal_btn_border}
                                            onChange={(col) => setFormKlien({ ...formKlien, portal_btn_border: col })}
                                            presets={[
                                                { hex: '#FFFFFF', label: 'Putih Bersih (Default)' },
                                                { hex: '#F4EBE4', label: 'Warm Cream' },
                                                { hex: '#E2E8F0', label: 'Soft Slate' },
                                                { hex: '#3C0E0E', label: 'Burgundy' },
                                            ]}
                                        />

                                        <ColorSettingRow
                                            label="Warna Teks Tombol (Default: #3C0E0E)"
                                            description="Warna tulisan teks dan ikon pada tombol dalam keadaan normal."
                                            value={formKlien.portal_btn_text}
                                            onChange={(col) => setFormKlien({ ...formKlien, portal_btn_text: col })}
                                            presets={[
                                                { hex: '#3C0E0E', label: 'Burgundy (Default)' },
                                                { hex: '#22070A', label: 'Dark Wine' },
                                                { hex: '#0F172A', label: 'Midnight Blue' },
                                                { hex: '#4F46E5', label: 'Indigo' },
                                            ]}
                                        />

                                        <ColorSettingRow
                                            label="Warna Latar Tombol (Default: Putih)"
                                            description="Warna latar belakang bagian dalam tombol sebelum kursor masuk."
                                            value={formKlien.portal_btn_bg}
                                            onChange={(col) => setFormKlien({ ...formKlien, portal_btn_bg: col })}
                                            presets={[
                                                { hex: '#FFFFFF', label: 'Putih (Default)' },
                                                { hex: '#F4EBE4', label: 'Warm Cream' },
                                                { hex: '#FBF6F0', label: 'Off-White' },
                                                { hex: '#F8FAFC', label: 'Light Slate' },
                                            ]}
                                        />

                                        <ColorSettingRow
                                            label="Warna Latar Hover Tombol (Default: #3C0E0E)"
                                            description="Warna latar tombol ketika kursor mouse masuk ke dalam tombol."
                                            value={formKlien.portal_btn_hover_bg}
                                            onChange={(col) => setFormKlien({ ...formKlien, portal_btn_hover_bg: col })}
                                            presets={[
                                                { hex: '#3C0E0E', label: 'Burgundy (Default)' },
                                                { hex: '#22070A', label: 'Dark Wine' },
                                                { hex: '#4A151B', label: 'Arams Maroon' },
                                                { hex: '#0F172A', label: 'Midnight Blue' },
                                                { hex: '#4F46E5', label: 'Indigo Modern' },
                                            ]}
                                        />

                                        <ColorSettingRow
                                            label="Warna Teks Saat Hover (Default: Putih)"
                                            description="Warna teks tulisan dan ikon saat tombol di-hover."
                                            value={formKlien.portal_btn_hover_text}
                                            onChange={(col) => setFormKlien({ ...formKlien, portal_btn_hover_text: col })}
                                            presets={[
                                                { hex: '#FFFFFF', label: 'Putih Bersih (Default)' },
                                                { hex: '#F4EBE4', label: 'Warm Cream' },
                                                { hex: '#FEF08A', label: 'Soft Yellow' },
                                            ]}
                                        />
                                    </div>

                                    {/* Live Interactive Button Preview */}
                                    <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                                        <div className="flex items-center justify-between text-white text-[11px]">
                                            <span className="font-bold">Pratinjau Interaktif Tombol (Arahkan Mouse / Hover):</span>
                                            <span className="text-slate-400 text-[10px]">Outline Putih + Warna Hover</span>
                                        </div>
                                        <div className="p-4 rounded-lg bg-black/40 flex flex-wrap items-center gap-4">
                                            <button
                                                type="button"
                                                style={{
                                                    backgroundColor: formKlien.portal_btn_bg,
                                                    color: formKlien.portal_btn_text,
                                                    border: `1.5px solid ${formKlien.portal_btn_border}`,
                                                    outline: `2px solid ${formKlien.portal_btn_border}`,
                                                    outlineOffset: '2px',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = formKlien.portal_btn_hover_bg;
                                                    e.currentTarget.style.color = formKlien.portal_btn_hover_text;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = formKlien.portal_btn_bg;
                                                    e.currentTarget.style.color = formKlien.portal_btn_text;
                                                }}
                                                className="px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer shadow-md inline-flex items-center gap-2"
                                            >
                                                <span>Booking Project Baru</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </button>

                                            <span className="text-slate-400 text-xs">
                                                ← Arahkan kursor ke tombol untuk melihat efek outline putih &amp; warna hover
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mini Live Preview of Value Badges */}
                            <div className="pt-4 border-t border-slate-100 space-y-3">
                                <label className="block text-xs font-bold text-slate-800">
                                    Pratinjau Miniatur Bar Keunggulan Footer
                                </label>
                                <div
                                    style={{
                                        background: `linear-gradient(180deg, ${formKlien.portal_footer_bg} 0%, #170406 100%)`,
                                        color: formKlien.portal_footer_text || '#FFFFFF',
                                    }}
                                    className="p-4 rounded-xl border border-white/15 space-y-3 shadow-inner"
                                >
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                                        <span>Kenapa Memilih Arams Pictures?</span>
                                        <span className="opacity-70 text-[9px]">Premium Client Experience</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                                        <div className="p-2 rounded-lg bg-white/[0.04] border border-white/15 flex items-center gap-2">
                                            <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-white shrink-0">
                                                <Star className="w-3 h-3 text-white" />
                                            </div>
                                            <div>
                                                <strong className="block font-bold text-white text-[10px]">Berpengalaman</strong>
                                                <span className="text-[9px] opacity-75">7+ tahun berkarya</span>
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/[0.04] border border-white/15 flex items-center gap-2">
                                            <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-white shrink-0">
                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                            </div>
                                            <div>
                                                <strong className="block font-bold text-white text-[10px]">Kualitas Terbaik</strong>
                                                <span className="text-[9px] opacity-75">Editing standar tinggi</span>
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white/[0.04] border border-white/15 flex items-center gap-2">
                                            <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-white shrink-0">
                                                <Shield className="w-3 h-3 text-white" />
                                            </div>
                                            <div>
                                                <strong className="block font-bold text-white text-[10px]">100% Aman</strong>
                                                <span className="text-[9px] opacity-75">File aman terlindungi</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mini Live Preview of Main Footer Body */}
                                <div
                                    style={{
                                        backgroundColor: formKlien.portal_footer_main_bg || '#FBF6F0',
                                        color: formKlien.portal_footer_main_text || '#334155',
                                        borderColor: '#F4EBE4',
                                    }}
                                    className="p-4 rounded-xl border space-y-3 shadow-xs text-xs"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-3 border-b border-black/10">
                                        {/* Kiri */}
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-5 h-5 rounded bg-black/5 border border-black/10 flex items-center justify-center font-serif text-[9px] font-black text-[#3C0E0E]">
                                                    ap
                                                </div>
                                                <span className="font-black text-xs text-[#3C0E0E]">Arams Pictures</span>
                                            </div>
                                            <p className="text-[10px] line-clamp-2 opacity-80">
                                                Jasa fotografi &amp; videografi profesional untuk momen berharga Anda.
                                            </p>
                                        </div>

                                        {/* Tengah */}
                                        <div className="space-y-1">
                                            <span className="font-bold text-[10px] uppercase tracking-wider text-[#3C0E0E] block">
                                                Hubungi Kami
                                            </span>
                                            <div className="space-y-0.5 text-[10px]">
                                                <div>WA: +62 812-3456-7890</div>
                                                <div>Email: hello@aramspictures.com</div>
                                                <div>Jam: 09.00 - 18.00 WIB</div>
                                            </div>
                                        </div>

                                        {/* Kanan */}
                                        <div className="space-y-1 sm:text-right">
                                            <span className="font-bold text-[10px] uppercase tracking-wider text-[#3C0E0E] block">
                                                Ikuti Kami
                                            </span>
                                            <div className="flex items-center gap-1 sm:justify-end">
                                                <span className="w-5 h-5 rounded-full border border-black/15 flex items-center justify-center text-[9px]">IG</span>
                                                <span className="w-5 h-5 rounded-full border border-black/15 flex items-center justify-center text-[9px]">YT</span>
                                                <span className="w-5 h-5 rounded-full border border-black/15 flex items-center justify-center text-[9px]">TT</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bawah: Tengah Saja */}
                                    <div className="text-center text-[10px] opacity-70">
                                        © 2026 Arams Pictures. All rights reserved.
                                    </div>
                                </div>
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
