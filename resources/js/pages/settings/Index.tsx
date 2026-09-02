import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import {
    Building2,
    Settings,
    Database,
    Upload,
    Check,
    ChevronRight,
    Sliders,
    Hash,
    Layers,
    Users,
    HardDrive,
    CloudDownload,
    History,
    FileSpreadsheet,
    FileText,
    MapPin,
    Phone,
    Mail,
    Globe,
    Info,
    X,
    Save,
    Download,
    RefreshCw,
    Shield,
    Sparkles,
    Eye,
    Palette,
    Type,
    Paintbrush,
    CheckCircle2,
    RotateCcw,
    LayoutDashboard,
    Briefcase,
    Lock,
    ShieldCheck,
    SlidersHorizontal,
    Menu,
    Search,
    Bell,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface SettingsIndexProps {
    settings?: any;
    settingsMap?: Record<string, string>;
}

// ── Multi-Stop Gradient Builder Component ─────────────────────────────────────
interface ColorStop { id: string; color: string; position: number; }
interface GradientBuilderProps {
    value: string;
    onChange: (css: string) => void;
    presets?: Array<{ label: string; value: string }>;
    label?: string;
}

function GradientBuilder({ value, onChange, presets = [], label = 'Gradient (Opsional)' }: GradientBuilderProps) {
    const parseGradient = (css: string): { angle: number; stops: ColorStop[] } => {
        const angleMatch = css.match(/linear-gradient\((\d+)deg/);
        const angle = angleMatch ? parseInt(angleMatch[1]) : 145;
        const stopMatches = [...css.matchAll(/(#[0-9a-fA-F]{3,8})\s+(\d+(?:\.\d+)?)%/g)];
        const stops: ColorStop[] = stopMatches.length >= 2
            ? stopMatches.map((m, i) => ({ id: String(i), color: m[1], position: parseFloat(m[2]) }))
            : [{ id: '0', color: '#2D1B69', position: 0 }, { id: '1', color: '#1A0F3F', position: 100 }];
        return { angle, stops };
    };

    const buildCSS = (a: number, s: ColorStop[]) => {
        const sorted = [...s].sort((x, y) => x.position - y.position);
        return `linear-gradient(${a}deg, ${sorted.map(st => `${st.color} ${st.position}%`).join(', ')})`;
    };

    const parsed = parseGradient(value);
    const [angle, setAngle] = React.useState(parsed.angle);
    const [stops, setStops] = React.useState<ColorStop[]>(parsed.stops);

    const update = (newAngle: number, newStops: ColorStop[]) => {
        setAngle(newAngle); setStops(newStops);
        onChange(buildCSS(newAngle, newStops));
    };

    const updateStop = (id: string, field: 'color' | 'position', val: string | number) =>
        update(angle, stops.map(s => s.id === id ? { ...s, [field]: val } : s));

    const addStop = () => {
        // Insert a new stop between existing ones at the midpoint
        const sorted = [...stops].sort((a, b) => a.position - b.position);
        const midPos = sorted.length >= 2 ? Math.round((sorted[0].position + sorted[sorted.length - 1].position) / 2) : 50;
        update(angle, [...stops, { id: String(Date.now()), color: '#7C3AED', position: midPos }]);
    };

    const removeStop = (id: string) => {
        if (stops.length <= 2) return;
        update(angle, stops.filter(s => s.id !== id));
    };

    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const previewCSS = buildCSS(angle, stops);

    return (
        <div className="space-y-3 pt-3 border-t border-dashed border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 shadow-sm" />
                    {label}
                </label>
                {value && (
                    <button type="button" onClick={() => onChange('')} className="text-[10px] text-red-500 hover:text-red-700 font-medium cursor-pointer">
                        ✕ Hapus Gradient
                    </button>
                )}
            </div>

            {/* Live Preview + Angle Slider */}
            <div className="space-y-2 bg-slate-50/80 border border-slate-200 rounded-xl p-3">
                <div className="w-full h-10 rounded-lg border border-slate-200 shadow-xs" style={{ background: previewCSS }} />
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-slate-500 whitespace-nowrap font-medium">Sudut:</span>
                    <input type="range" min="0" max="360" value={angle}
                        onChange={(e) => update(parseInt(e.target.value), stops)}
                        className="flex-1 h-1.5 accent-[#C98922] cursor-pointer" />
                    <input type="number" min="0" max="360" value={angle}
                        onChange={(e) => update(parseInt(e.target.value) || 0, stops)}
                        className="w-12 px-1.5 py-0.5 border border-slate-300 rounded text-[9px] font-mono text-center text-slate-700 bg-white" />
                    <span className="text-[9px] text-slate-500">°</span>
                </div>
            </div>

            {/* Color Stops */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-semibold">Titik Warna ({stops.length} stop):</span>
                    <button type="button" onClick={addStop}
                        className="text-[10px] text-[#C98922] hover:text-[#9E6D24] font-bold cursor-pointer px-2 py-0.5 rounded border border-[#C98922]/30 hover:bg-[#C98922]/5 transition-colors">
                        + Tambah Stop
                    </button>
                </div>
                {sortedStops.map((stop) => (
                    <div key={stop.id} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-2">
                        {/* Color picker */}
                        <input type="color" value={stop.color}
                            onChange={(e) => updateStop(stop.id, 'color', e.target.value)}
                            className="w-8 h-7 rounded border border-slate-300 p-0.5 cursor-pointer bg-white shrink-0" />
                        {/* Hex display */}
                        <input type="text" value={stop.color}
                            onChange={(e) => updateStop(stop.id, 'color', e.target.value)}
                            className="w-16 shrink-0 text-[9px] font-mono text-slate-700 border border-slate-200 rounded px-1 py-0.5 bg-slate-50" />
                        {/* Position slider */}
                        <input type="range" min="0" max="100" value={stop.position}
                            onChange={(e) => updateStop(stop.id, 'position', parseInt(e.target.value))}
                            className="flex-1 h-1.5 accent-[#C98922] cursor-pointer" />
                        {/* Position number */}
                        <input type="number" min="0" max="100" value={stop.position}
                            onChange={(e) => updateStop(stop.id, 'position', parseInt(e.target.value) || 0)}
                            className="w-10 shrink-0 text-[9px] font-mono text-center text-slate-700 border border-slate-200 rounded px-1 py-0.5 bg-slate-50" />
                        <span className="text-[9px] text-slate-400 shrink-0">%</span>
                        {/* Remove button - only if > 2 stops */}
                        <button type="button" onClick={() => removeStop(stop.id)}
                            disabled={stops.length <= 2}
                            className={`shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs font-bold transition-colors ${
                                stops.length <= 2 ? 'text-slate-300 cursor-not-allowed' : 'text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                            }`}>
                            ×
                        </button>
                    </div>
                ))}
            </div>

            {/* Preset Chips */}
            {presets.length > 0 && (
                <div className="grid grid-cols-3 gap-1.5">
                    {presets.map((p) => (
                        <button key={p.value} type="button"
                            onClick={() => {
                                onChange(p.value);
                                const p2 = parseGradient(p.value);
                                setAngle(p2.angle); setStops(p2.stops);
                            }}
                            className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                                value === p.value ? 'border-[#C98922] ring-1 ring-[#C98922] bg-[#C98922]/5' : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}>
                            <span className="w-6 h-6 rounded-md shrink-0 border border-white/10 shadow-xs" style={{ background: p.value }} />
                            <span className="text-[10px] font-medium text-slate-700 leading-tight truncate">{p.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Raw CSS Input */}
            <div className="flex items-center gap-2">
                <div className="flex-1">
                    <label className="block text-[9px] text-slate-400 mb-0.5 font-medium">CSS Gradient (edit manual / multi-stop):</label>
                    <input type="text"
                        placeholder="e.g. linear-gradient(145deg, #2D1B69 0%, #7C3AED 50%, #1A0F3F 100%)"
                        value={value}
                        onChange={(e) => { onChange(e.target.value); const p2 = parseGradient(e.target.value); setAngle(p2.angle); setStops(p2.stops); }}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[10px] font-mono text-slate-800 focus:ring-1 focus:ring-[#C98922]/50 focus:border-[#C98922] bg-white" />
                </div>
                {value && <div className="mt-4 w-9 h-7 rounded-md border border-slate-300 shrink-0 shadow-xs" style={{ background: value }} />}
            </div>
        </div>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function SettingsIndex({ settings = {}, settingsMap = {} }: SettingsIndexProps) {
    const [activeTab, setActiveTab] = useState<'company' | 'general' | 'appearance' | 'portal_theme' | 'backup'>('company');
    const [activeModal, setActiveModal] = useState<string | null>(null);

    // Helper to get setting value
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

    // Main Company Form State
    const [form, setForm] = useState({
        company_name: getVal('company_name', 'Arams Pictures'),
        company_subtitle: getVal('company_subtitle', 'STUDIO & CINEMA'),
        company_legal_name: getVal('company_legal_name', 'PT Arams Pictures Studio'),
        company_tagline: getVal('company_tagline', 'Capturing Moments, Creating Timeless Memories'),
        company_email: getVal('company_email', 'info@arams.com'),
        company_phone: getVal('company_phone', '+62 812-3456-7890'),
        company_whatsapp: getVal('company_whatsapp', '+62 812-3456-7890'),
        company_website: getVal('company_website', 'https://www.arams.com'),
        company_address: getVal('company_address', 'Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan 12190'),
        company_city: getVal('company_city', 'Jakarta Selatan'),
        timezone: getVal('timezone', '(GMT+07:00) Jakarta'),
        company_logo: getVal('company_logo', ''),
    });

    // Theme & Appearance Customization Form State
    const [themeForm, setThemeForm] = useState({
        theme_preset: getVal('theme_preset', 'arams_master_purple'),
        company_subtitle: getVal('company_subtitle', 'STUDIO & CINEMA'),
        sidebar_bg_color: getVal('sidebar_bg_color', '#1C132E'),
        sidebar_bg_gradient: getVal('sidebar_bg_gradient', ''),
        sidebar_active_bg: getVal('sidebar_active_bg', '#C98922'),
        sidebar_active_bg_gradient: getVal('sidebar_active_bg_gradient', ''),
        sidebar_active_text: getVal('sidebar_active_text', '#FFFFFF'),
        sidebar_text_color: getVal('sidebar_text_color', '#94A3B8'),
        primary_accent_color: getVal('primary_accent_color', '#C98922'),
        primary_accent_gradient: getVal('primary_accent_gradient', ''),
        app_bg_color: getVal('app_bg_color', '#F8F6F5'),
        app_bg_gradient: getVal('app_bg_gradient', ''),
        login_bg_color: getVal('login_bg_color', '#0E091E'),
        login_bg_gradient: getVal('login_bg_gradient', ''),
        login_card_bg: getVal('login_card_bg', '#1C132E'),
        login_card_bg_gradient: getVal('login_card_bg_gradient', ''),
        login_accent_color: getVal('login_accent_color', '#C98922'),
        login_tagline: getVal('login_tagline', 'STUDIO & CINEMA PHOTOGRAPHY SYSTEM'),
        font_family_heading: getVal('font_family_heading', 'Plus Jakarta Sans'),
        font_family_body: getVal('font_family_body', 'Plus Jakarta Sans'),
        app_heading_color: getVal('app_heading_color', '#0F172A'),
        app_text_color: getVal('app_text_color', '#334155'),
        app_muted_text_color: getVal('app_muted_text_color', '#64748B'),
        header_bg_color: getVal('header_bg_color', '#FFFFFF'),
        header_bg_gradient: getVal('header_bg_gradient', ''),
        header_text_color: getVal('header_text_color', '#0F172A'),
        header_border_color: getVal('header_border_color', '#E2E8F0'),
        breadcrumb_color: getVal('breadcrumb_color', '#64748B'),
        breadcrumb_active_color: getVal('breadcrumb_active_color', '#0F172A'),
        card_heading_color: getVal('card_heading_color', '#1E293B'),
    });

    // Portal Theme Customization Form State
    const [portalForm, setPortalForm] = useState({
        portal_preset: getVal('portal_preset', 'luxury_champagne'),
        portal_bg_color: getVal('portal_bg_color', '#FDFBF7'),
        portal_bg_gradient: getVal('portal_bg_gradient', ''),
        portal_nav_bg: getVal('portal_nav_bg', '#FFFFFF'),
        portal_nav_gradient: getVal('portal_nav_gradient', ''),
        portal_nav_text_color: getVal('portal_nav_text_color', '#0F172A'),
        portal_nav_border_color: getVal('portal_nav_border_color', 'rgba(226, 232, 240, 0.8)'),
        portal_card_bg: getVal('portal_card_bg', '#FFFFFF'),
        portal_card_bg_gradient: getVal('portal_card_bg_gradient', ''),
        portal_card_border: getVal('portal_card_border', 'rgba(226, 232, 240, 0.8)'),
        portal_primary_accent: getVal('portal_primary_accent', '#C98922'),
        portal_accent_gradient: getVal('portal_accent_gradient', ''),
        portal_heading_color: getVal('portal_heading_color', '#0F172A'),
        portal_text_color: getVal('portal_text_color', '#334155'),
        portal_muted_color: getVal('portal_muted_color', '#64748B'),
        portal_font_heading: getVal('portal_font_heading', 'Plus Jakarta Sans'),
        portal_font_body: getVal('portal_font_body', 'Plus Jakarta Sans'),
        portal_hero_bg: getVal('portal_hero_bg', '#1C132E'),
        portal_hero_gradient: getVal('portal_hero_gradient', 'linear-gradient(135deg, #1C132E 0%, #0E091E 100%)'),
        portal_hero_text_color: getVal('portal_hero_text_color', '#FFFFFF'),
        portal_footer_bg: getVal('portal_footer_bg', '#FFFFFF'),
        portal_footer_text: getVal('portal_footer_text', '#475569'),
    });

    const [portalPreviewTab, setPortalPreviewTab] = useState<'dashboard' | 'project_detail'>('dashboard');

    // Curated Portal Presets
    const portalPresets = [
        {
            id: 'luxury_champagne',
            name: 'Arams Luxury Gold & Ivory',
            description: 'Ivory #FDFBF7, Champagne Gold #C98922 & Pure White Modern Cards',
            portal_bg_color: '#FDFBF7',
            portal_bg_gradient: '',
            portal_nav_bg: '#FFFFFF',
            portal_nav_gradient: '',
            portal_nav_text_color: '#0F172A',
            portal_nav_border_color: 'rgba(226, 232, 240, 0.8)',
            portal_card_bg: '#FFFFFF',
            portal_card_border: 'rgba(226, 232, 240, 0.8)',
            portal_primary_accent: '#C98922',
            portal_accent_gradient: '',
            portal_heading_color: '#0F172A',
            portal_text_color: '#334155',
            portal_muted_color: '#64748B',
            portal_font_heading: 'Plus Jakarta Sans',
            portal_font_body: 'Plus Jakarta Sans',
            portal_hero_bg: '#1C132E',
            portal_hero_gradient: 'linear-gradient(135deg, #1C132E 0%, #0E091E 100%)',
            portal_hero_text_color: '#FFFFFF',
            portal_footer_bg: '#FFFFFF',
            portal_footer_text: '#475569',
            badge: 'Official Master',
        },
        {
            id: 'midnight_cinema_dark',
            name: 'Midnight Cinema Dark Studio',
            description: 'Dark Obsidian #0B0616, Deep Card #1C132E & Radiant Gold #E5A93C',
            portal_bg_color: '#0B0616',
            portal_bg_gradient: 'linear-gradient(180deg, #0B0616 0%, #150E28 100%)',
            portal_nav_bg: '#130D24',
            portal_nav_gradient: '',
            portal_nav_text_color: '#FFFFFF',
            portal_nav_border_color: 'rgba(255, 255, 255, 0.1)',
            portal_card_bg: '#1C132E',
            portal_card_border: 'rgba(255, 255, 255, 0.12)',
            portal_primary_accent: '#E5A93C',
            portal_accent_gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            portal_heading_color: '#FFFFFF',
            portal_text_color: '#CBD5E1',
            portal_muted_color: '#94A3B8',
            portal_font_heading: 'Playfair Display',
            portal_font_body: 'Inter',
            portal_hero_bg: '#2D1B69',
            portal_hero_gradient: 'linear-gradient(135deg, #2D1B69 0%, #130D24 100%)',
            portal_hero_text_color: '#FFFFFF',
            portal_footer_bg: '#130D24',
            portal_footer_text: '#94A3B8',
            badge: 'Dark Cinema',
        },
        {
            id: 'clean_minimalist_white',
            name: 'Clean Modern Ivory & Slate',
            description: 'Ultra Clean Ivory #F8F9FA, Slate #0F172A & Minimalist Borders',
            portal_bg_color: '#F8F9FA',
            portal_bg_gradient: '',
            portal_nav_bg: '#FFFFFF',
            portal_nav_gradient: '',
            portal_nav_text_color: '#0F172A',
            portal_nav_border_color: '#E2E8F0',
            portal_card_bg: '#FFFFFF',
            portal_card_border: '#E2E8F0',
            portal_primary_accent: '#0F172A',
            portal_accent_gradient: '',
            portal_heading_color: '#0F172A',
            portal_text_color: '#334155',
            portal_muted_color: '#64748B',
            portal_font_heading: 'Inter',
            portal_font_body: 'Inter',
            portal_hero_bg: '#0F172A',
            portal_hero_gradient: 'linear-gradient(135deg, #334155 0%, #0F172A 100%)',
            portal_hero_text_color: '#FFFFFF',
            portal_footer_bg: '#FFFFFF',
            portal_footer_text: '#475569',
            badge: 'Minimalist',
        },
        {
            id: 'royal_sapphire_blue',
            name: 'Royal Sapphire & Diamond Blue',
            description: 'Ice Blue #F0F4F8, Nautical Navy #0A192F & Electric Cobalt #2563EB',
            portal_bg_color: '#F0F4F8',
            portal_bg_gradient: '',
            portal_nav_bg: '#0A192F',
            portal_nav_gradient: '',
            portal_nav_text_color: '#FFFFFF',
            portal_nav_border_color: 'rgba(255,255,255,0.1)',
            portal_card_bg: '#FFFFFF',
            portal_card_border: '#DBEAFE',
            portal_primary_accent: '#2563EB',
            portal_accent_gradient: '',
            portal_heading_color: '#0F172A',
            portal_text_color: '#1E293B',
            portal_muted_color: '#64748B',
            portal_font_heading: 'Plus Jakarta Sans',
            portal_font_body: 'Plus Jakarta Sans',
            portal_hero_bg: '#0A192F',
            portal_hero_gradient: 'linear-gradient(135deg, #1E3A8A 0%, #0A192F 100%)',
            portal_hero_text_color: '#FFFFFF',
            portal_footer_bg: '#0A192F',
            portal_footer_text: '#94A3B8',
            badge: 'Royal Navy',
        },
        {
            id: 'emerald_botanical_luxury',
            name: 'Emerald Prestige Botanical',
            description: 'Mint Mist #F0FDF4, Pine Forest #064E3B & Emerald Green #059669',
            portal_bg_color: '#F0FDF4',
            portal_bg_gradient: '',
            portal_nav_bg: '#064E3B',
            portal_nav_gradient: '',
            portal_nav_text_color: '#FFFFFF',
            portal_nav_border_color: 'rgba(255,255,255,0.1)',
            portal_card_bg: '#FFFFFF',
            portal_card_border: '#D1FAE5',
            portal_primary_accent: '#059669',
            portal_accent_gradient: '',
            portal_heading_color: '#064E3B',
            portal_text_color: '#065F46',
            portal_muted_color: '#6EE7B7',
            portal_font_heading: 'Cinzel',
            portal_font_body: 'Plus Jakarta Sans',
            portal_hero_bg: '#064E3B',
            portal_hero_gradient: 'linear-gradient(135deg, #065F46 0%, #064E3B 100%)',
            portal_hero_text_color: '#FFFFFF',
            portal_footer_bg: '#064E3B',
            portal_footer_text: '#A7F3D0',
            badge: 'Emerald',
        },
    ];

    const [previewMode, setPreviewMode] = useState<'dashboard' | 'projects' | 'master_data' | 'finance' | 'login'>('dashboard');

    // Curated Theme Presets (12 Distinctive Variations & Aesthetics)
    const themePresets = [
        {
            id: 'arams_master_purple',
            name: 'Arams Luxury Master',
            description: 'Deep Purple #1C132E, Champagne Gold #C98922 & Soft Ivory #F8F6F5',
            sidebar_bg: '#1C132E',
            sidebar_bg_gradient: '',
            sidebar_active_bg: '#C98922',
            sidebar_active_text: '#FFFFFF',
            primary_accent: '#C98922',
            app_bg: '#F8F6F5',
            app_bg_gradient: '',
            login_bg: '#0E091E',
            login_card_bg: '#1C132E',
            login_accent: '#C98922',
            font_heading: 'Plus Jakarta Sans',
            font_body: 'Plus Jakarta Sans',
            badge: 'Official Master',
        },
        {
            id: 'midnight_sapphire',
            name: 'Midnight Sapphire & Royal Blue',
            description: 'Nautical Navy #0A192F, Electric Royal Blue #2563EB & Ice Slate #F0F4F8',
            sidebar_bg: '#0A192F',
            sidebar_active_bg: '#2563EB',
            sidebar_active_text: '#FFFFFF',
            primary_accent: '#2563EB',
            app_bg: '#F0F4F8',
            login_bg: '#070D18',
            login_card_bg: '#0D1627',
            login_accent: '#2563EB',
            font_heading: 'Inter',
            font_body: 'Inter',
            badge: 'Royal Blue',
        },
        {
            id: 'emerald_prestige',
            name: 'Emerald Prestige & Pine',
            description: 'Forest Deep #091B16, Pine Emerald #059669 & Mint Mist #F0FDF4',
            sidebar_bg: '#091B16',
            sidebar_active_bg: '#059669',
            sidebar_active_text: '#FFFFFF',
            primary_accent: '#10B981',
            app_bg: '#F0FDF4',
            login_bg: '#06120E',
            login_card_bg: '#091B16',
            login_accent: '#10B981',
            font_heading: 'Manrope',
            font_body: 'Manrope',
            badge: 'Lush Pine',
        },
        {
            id: 'royal_velvet_rose',
            name: 'Royal Velvet & Crimson Rose',
            description: 'Imperial Plum #1B0F23, Radiant Rose #E11D48 & Rose Silk #FFF1F2',
            sidebar_bg: '#1B0F23',
            sidebar_active_bg: '#BE185D',
            sidebar_active_text: '#FFFFFF',
            primary_accent: '#E11D48',
            app_bg: '#FFF1F2',
            login_bg: '#140912',
            login_card_bg: '#1B0F23',
            login_accent: '#E11D48',
            font_heading: 'Outfit',
            font_body: 'Outfit',
            badge: 'Plum Rose',
        },
        {
            id: 'obsidian_amber',
            name: 'Obsidian Onyx & Amber Gold',
            description: 'Pure Charcoal #090D16, Warm Amber #D97706 & Soft Sand #FAF8F5',
            sidebar_bg: '#090D16',
            sidebar_active_bg: '#D97706',
            sidebar_active_text: '#FFFFFF',
            primary_accent: '#F59E0B',
            app_bg: '#FAF8F5',
            login_bg: '#06090F',
            login_card_bg: '#0D131F',
            login_accent: '#F59E0B',
            font_heading: 'Plus Jakarta Sans',
            font_body: 'Plus Jakarta Sans',
            badge: 'Studio Amber',
        },
        {
            id: 'minimalist_slate',
            name: 'Graphite Slate & Tech Indigo',
            description: 'Graphite Slate #1E293B, Indigo Violet #4F46E5 & Crisp Slate #F8FAFC',
            sidebar_bg: '#1E293B',
            sidebar_active_bg: '#4F46E5',
            sidebar_active_text: '#FFFFFF',
            primary_accent: '#6366F1',
            app_bg: '#F8FAFC',
            login_bg: '#0F172A',
            login_card_bg: '#1E293B',
            login_accent: '#6366F1',
            font_heading: 'Inter',
            font_body: 'Inter',
            badge: 'Tech Indigo',
        },
        {
            id: 'sunset_terracotta',
            name: 'Sunset Terracotta & Bronze',
            description: 'Espresso Roast #23150D, Warm Terracotta #C2410C & Warm Peach #FFF7ED',
            sidebar_bg: '#23150D',
            sidebar_active_bg: '#C2410C',
            sidebar_active_text: '#FFFFFF',
            primary_accent: '#EA580C',
            app_bg: '#FFF7ED',
            login_bg: '#170E08',
            login_card_bg: '#23150D',
            login_accent: '#EA580C',
            font_heading: 'Manrope',
            font_body: 'Manrope',
            badge: 'Terracotta',
        },
        {
            id: 'nordic_cyan',
            name: 'Nordic Glacier & Cyan Teal',
            description: 'Deep Abyss #08202E, Vivid Cyan #0284C7 & Glacier White #F0F9FF',
            sidebar_bg: '#08202E',
            sidebar_active_bg: '#0284C7',
            sidebar_active_text: '#FFFFFF',
            primary_accent: '#06B6D4',
            app_bg: '#F0F9FF',
            login_bg: '#05151F',
            login_card_bg: '#08202E',
            login_accent: '#06B6D4',
            font_heading: 'Inter',
            font_body: 'Inter',
            badge: 'Glacier Cyan',
        },
        {
            id: 'imperial_amethyst',
            name: 'Imperial Amethyst & Violet',
            description: 'Dark Violet #160B29, Purple Glow #7C3AED & Lavender Mist #FAF5FF',
            sidebar_bg: '#160B29',
            sidebar_active_bg: '#7C3AED',
            sidebar_active_text: '#FFFFFF',
            primary_accent: '#8B5CF6',
            app_bg: '#FAF5FF',
            login_bg: '#0E061B',
            login_card_bg: '#160B29',
            login_accent: '#8B5CF6',
            font_heading: 'Outfit',
            font_body: 'Outfit',
            badge: 'Amethyst',
        },
        {
            id: 'arams_midnight_dark',
            name: 'Arams Midnight Dark (Full Dark)',
            description: 'Primary Dark #0E091E, Warm Gold #CA8A22 & Dark Midnight #100A22',
            sidebar_bg: '#0E091E',
            sidebar_active_bg: '#CA8A22',
            sidebar_active_text: '#FFFFFF',
            primary_accent: '#CA8A22',
            app_bg: '#100A22',
            login_bg: '#0E091E',
            login_card_bg: '#1C132E',
            login_accent: '#CA8A22',
            font_heading: 'Plus Jakarta Sans',
            font_body: 'Plus Jakarta Sans',
            badge: 'Full Dark',
        },
        {
            id: 'monochrome_titanium',
            name: 'Monochrome Titanium Steel',
            description: 'Zinc Charcoal #18181B, Steel Slate #475569 & Clean White #FFFFFF',
            sidebar_bg: '#18181B',
            sidebar_active_bg: '#475569',
            sidebar_active_text: '#FFFFFF',
            primary_accent: '#334155',
            app_bg: '#FFFFFF',
            login_bg: '#09090B',
            login_card_bg: '#18181B',
            login_accent: '#64748B',
            font_heading: 'Plus Jakarta Sans',
            font_body: 'Plus Jakarta Sans',
            badge: 'Monochrome',
        },
        {
            id: 'mocha_caramel',
            name: 'Mocha Caramel & Bronze Gold',
            description: 'Dark Mocha #261B14, Caramel Bronze #B45309 & Soft Almond #FEF3C7',
            sidebar_bg: '#261B14',
            sidebar_active_bg: '#B45309',
            sidebar_active_text: '#FFFFFF',
            primary_accent: '#D97706',
            app_bg: '#FFFBEB',
            login_bg: '#1A120D',
            login_card_bg: '#261B14',
            login_accent: '#D97706',
            font_heading: 'Plus Jakarta Sans',
            font_body: 'Plus Jakarta Sans',
            badge: 'Warm Mocha',
        },
        {
            id: 'purple_x_gold',
            name: 'Purple × Gold',
            description: 'Royal Purple → Deep Violet gradient sidebar, Champagne Gold accents & Ivory White',
            sidebar_bg: '#2D1B69',
            sidebar_bg_gradient: 'linear-gradient(160deg, #3D2080 0%, #2D1B69 40%, #1A0F3F 100%)',
            sidebar_active_bg: '#C98922',
            sidebar_active_text: '#FFFFFF',
            primary_accent: '#C98922',
            app_bg: '#F8F6F5',
            app_bg_gradient: 'linear-gradient(135deg, #F8F6F5 0%, #EDE8FF 50%, #F0EBF8 100%)',
            login_bg: '#1A0F3F',
            login_card_bg: '#2D1B69',
            login_accent: '#C98922',
            font_heading: 'Plus Jakarta Sans',
            font_body: 'Plus Jakarta Sans',
            badge: 'Purple × Gold',
        },
    ];

    const applyPreset = (preset: typeof themePresets[0]) => {
        setThemeForm({
            ...themeForm,
            theme_preset: preset.id,
            sidebar_bg_color: preset.sidebar_bg,
            sidebar_bg_gradient: (preset as any).sidebar_bg_gradient || '',
            sidebar_active_bg: preset.sidebar_active_bg,
            sidebar_active_bg_gradient: (preset as any).sidebar_active_bg_gradient || '',
            sidebar_active_text: preset.sidebar_active_text,
            sidebar_text_color: (preset as any).sidebar_text_color || '#94A3B8',
            primary_accent_color: preset.primary_accent,
            primary_accent_gradient: (preset as any).primary_accent_gradient || '',
            app_bg_color: preset.app_bg,
            app_bg_gradient: (preset as any).app_bg_gradient || '',
            app_heading_color: (preset as any).app_heading_color || '#0F172A',
            app_text_color: (preset as any).app_text_color || '#334155',
            app_muted_text_color: (preset as any).app_muted_text_color || '#64748B',
            header_bg_color: (preset as any).header_bg_color || '#FFFFFF',
            header_bg_gradient: (preset as any).header_bg_gradient || '',
            header_text_color: (preset as any).header_text_color || '#0F172A',
            header_border_color: (preset as any).header_border_color || 'rgba(226, 232, 240, 0.8)',
            breadcrumb_color: (preset as any).breadcrumb_color || '#64748B',
            breadcrumb_active_color: (preset as any).breadcrumb_active_color || '#0F172A',
            card_heading_color: (preset as any).card_heading_color || '#1E293B',
            login_bg_color: preset.login_bg || preset.sidebar_bg,
            login_bg_gradient: (preset as any).login_bg_gradient || '',
            login_card_bg: preset.login_card_bg || preset.sidebar_bg,
            login_card_bg_gradient: (preset as any).login_card_bg_gradient || '',
            login_accent_color: preset.login_accent || preset.primary_accent,
            font_family_heading: preset.font_heading,
            font_family_body: preset.font_body,
        });
    };

    const handleSaveTheme = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/settings', { settings: themeForm }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Pengaturan Tampilan & Warna Berhasil Disimpan');
            },
        });
    };

    const handleResetTheme = () => {
        const defaultPreset = themePresets[0];
        applyPreset(defaultPreset);
        router.post('/settings', {
            settings: {
                theme_preset: defaultPreset.id,
                sidebar_bg_color: defaultPreset.sidebar_bg,
                sidebar_active_bg: defaultPreset.sidebar_active_bg,
                sidebar_active_text: defaultPreset.sidebar_active_text,
                sidebar_text_color: '#94A3B8',
                primary_accent_color: defaultPreset.primary_accent,
                app_bg_color: defaultPreset.app_bg,
                app_heading_color: '#0F172A',
                app_text_color: '#334155',
                app_muted_text_color: '#64748B',
                header_bg_color: '#FFFFFF',
                header_bg_gradient: '',
                header_text_color: '#0F172A',
                header_border_color: 'rgba(226, 232, 240, 0.8)',
                breadcrumb_color: '#64748B',
                breadcrumb_active_color: '#0F172A',
                card_heading_color: '#1E293B',
                login_bg_color: defaultPreset.login_bg,
                login_card_bg: defaultPreset.login_card_bg,
                login_accent_color: defaultPreset.login_accent,
                login_tagline: 'STUDIO & CINEMA PHOTOGRAPHY SYSTEM',
                font_family_heading: defaultPreset.font_heading,
                font_family_body: defaultPreset.font_body,
            },
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Tema Berhasil Direset ke Default');
            },
        });
    };

    const handleApplyPortalPreset = (preset: (typeof portalPresets)[0]) => {
        setPortalForm({
            ...portalForm,
            portal_preset: preset.id,
            portal_bg_color: preset.portal_bg_color,
            portal_bg_gradient: preset.portal_bg_gradient,
            portal_nav_bg: preset.portal_nav_bg,
            portal_nav_gradient: preset.portal_nav_gradient,
            portal_nav_text_color: preset.portal_nav_text_color,
            portal_nav_border_color: preset.portal_nav_border_color,
            portal_card_bg: preset.portal_card_bg,
            portal_card_border: preset.portal_card_border,
            portal_primary_accent: preset.portal_primary_accent,
            portal_accent_gradient: preset.portal_accent_gradient,
            portal_heading_color: preset.portal_heading_color,
            portal_text_color: preset.portal_text_color,
            portal_muted_color: preset.portal_muted_color,
            portal_font_heading: preset.portal_font_heading,
            portal_font_body: preset.portal_font_body,
            portal_hero_bg: preset.portal_hero_bg,
            portal_hero_gradient: preset.portal_hero_gradient,
            portal_hero_text_color: preset.portal_hero_text_color,
            portal_footer_bg: preset.portal_footer_bg,
            portal_footer_text: preset.portal_footer_text,
        });
        toast.info(`Preset Portal "${preset.name}" Dipilih. Klik Simpan untuk menerapkan.`);
    };

    const handleSyncPortalWithStudioBrand = () => {
        setPortalForm({
            ...portalForm,
            portal_primary_accent: themeForm.primary_accent_color,
            portal_accent_gradient: themeForm.primary_accent_gradient,
            portal_font_heading: themeForm.font_family_heading,
            portal_font_body: themeForm.font_family_body,
            portal_nav_bg: themeForm.header_bg_color,
            portal_nav_text_color: themeForm.header_text_color,
            portal_nav_border_color: themeForm.header_border_color,
            portal_heading_color: themeForm.app_heading_color,
            portal_text_color: themeForm.app_text_color,
            portal_muted_color: themeForm.app_muted_text_color,
        });
        toast.success('Warna & Tipografi Portal disinkronkan dengan Brand Studio Utama.');
    };

    const handleSavePortalTheme = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.post('/settings', { settings: portalForm }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Pengaturan Tema & Tampilan Portal Klien Berhasil Disimpan!');
            },
            onError: () => {
                toast.error('Gagal menyimpan pengaturan portal.');
            },
        });
    };

    const handleResetPortalTheme = () => {
        const defaultPreset = portalPresets[0];
        handleApplyPortalPreset(defaultPreset);
        router.post('/settings', {
            settings: {
                portal_preset: defaultPreset.id,
                portal_bg_color: defaultPreset.portal_bg_color,
                portal_bg_gradient: defaultPreset.portal_bg_gradient,
                portal_nav_bg: defaultPreset.portal_nav_bg,
                portal_nav_gradient: defaultPreset.portal_nav_gradient,
                portal_nav_text_color: defaultPreset.portal_nav_text_color,
                portal_nav_border_color: defaultPreset.portal_nav_border_color,
                portal_card_bg: defaultPreset.portal_card_bg,
                portal_card_border: defaultPreset.portal_card_border,
                portal_primary_accent: defaultPreset.portal_primary_accent,
                portal_accent_gradient: defaultPreset.portal_accent_gradient,
                portal_heading_color: defaultPreset.portal_heading_color,
                portal_text_color: defaultPreset.portal_text_color,
                portal_muted_color: defaultPreset.portal_muted_color,
                portal_font_heading: defaultPreset.portal_font_heading,
                portal_font_body: defaultPreset.portal_font_body,
                portal_hero_bg: defaultPreset.portal_hero_bg,
                portal_hero_gradient: defaultPreset.portal_hero_gradient,
                portal_hero_text_color: defaultPreset.portal_hero_text_color,
                portal_footer_bg: defaultPreset.portal_footer_bg,
                portal_footer_text: defaultPreset.portal_footer_text,
            },
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Tema Portal Klien Berhasil Direset ke Default');
            },
        });
    };

    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ukuran file maksimal 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
            const dataUrl = uploadEvent.target?.result as string;
            setForm((prev) => ({ ...prev, company_logo: dataUrl }));

            // Submit update
            const formData = new FormData();
            formData.append('company_logo', file);
            formData.append('settings[company_logo]', dataUrl);

            router.post('/settings', formData, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Logo Perusahaan Berhasil Diunggah & Dikonversi ke WebP');
                },
            });
        };
        reader.readAsDataURL(file);
    };

    const handleResetLogo = () => {
        setForm((prev) => ({ ...prev, company_logo: '' }));
        router.post('/settings', { settings: { company_logo: '' } }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Logo Berhasil Direset ke Default');
            },
        });
    };

    // Preferences Form State
    const [prefForm, setPrefForm] = useState({
        currency: getVal('currency', 'IDR'),
        currency_symbol: getVal('currency_symbol', 'Rp'),
        date_format: getVal('date_format', 'DD/MM/YYYY'),
        language: getVal('language', 'id'),
        timezone: getVal('timezone', '(GMT+07:00) Jakarta'),
    });

    // Numbering Form State
    const [numForm, setNumForm] = useState({
        invoice_prefix: getVal('invoice_prefix', 'INV'),
        invoice_format: getVal('invoice_format', 'INV-{YEAR}-{MONTH}-{NUMBER}'),
        invoice_padding: getVal('invoice_padding', '4'),
        project_prefix: getVal('project_prefix', 'PRJ'),
        project_format: getVal('project_format', 'PRJ-{YY}{MM}-{NUMBER}'),
        payment_prefix: getVal('payment_prefix', 'PAY'),
        payment_format: getVal('payment_format', 'PAY-{YY}{MM}-{NUMBER}'),
    });

    // Workflow Form State
    const [workflowForm, setWorkflowForm] = useState({
        default_workflow: getVal('default_workflow', 'standard'),
        require_supervisor_approval: getVal('require_supervisor_approval', '1'),
        allow_client_revisions: getVal('allow_client_revisions', '2'),
    });

    // Access Form State
    const [accessForm, setAccessForm] = useState({
        default_project_visibility: getVal('default_project_visibility', 'team'),
        photographer_can_view_price: getVal('photographer_can_view_price', '0'),
        editor_can_upload_deliverables: getVal('editor_can_upload_deliverables', '1'),
    });

    // Storage Form State
    const [storageForm, setStorageForm] = useState({
        gdrive_folder_template: getVal('gdrive_folder_template', 'Lensaria/{YEAR}/{CATEGORY}/{PROJECT_NAME}'),
        link_expiry_days: getVal('link_expiry_days', '0'),
        auto_generate_folders: getVal('auto_generate_folders', '1'),
    });

    const handleSaveCompany = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/settings', { settings: form }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profil Perusahaan Berhasil Disimpan');
            },
        });
    };

    const handleSaveModalSettings = (settingsData: Record<string, any>) => {
        router.post('/settings', { settings: settingsData }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Pengaturan Berhasil Disimpan');
                setActiveModal(null);
            },
        });
    };

    return (
        <div className="space-y-6 pb-16 w-full max-w-full">
            <Head title="Settings - Lensaria Photography" />

            {/* Header Title & Subtitle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1
                        className="text-2xl lg:text-3xl font-extrabold tracking-tight transition-colors"
                        style={{ color: themeForm.app_heading_color || 'var(--app-heading-color, #0F172A)' }}
                    >
                        Pengaturan Sistem
                    </h1>
                    <p
                        className="text-sm mt-0.5 transition-colors"
                        style={{ color: themeForm.app_muted_text_color || 'var(--app-muted-color, #64748B)' }}
                    >
                        Kelola identitas perusahaan, preferensi sistem, penomoran dokumen, dan backup data.
                    </p>
                </div>
            </div>

            {/* Top Horizontal Tabs */}
            <div className="flex items-center gap-6 sm:gap-8 border-b border-slate-200/50 text-sm font-semibold overflow-x-auto scrollbar-none">
                <button
                    type="button"
                    onClick={() => setActiveTab('company')}
                    style={activeTab === 'company' ? {
                        borderColor: themeForm.primary_accent_color,
                        color: themeForm.primary_accent_color,
                    } : {
                        color: themeForm.app_muted_text_color || undefined,
                    }}
                    className={`flex items-center gap-2 pb-3.5 transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'company'
                            ? 'border-b-2 font-bold'
                            : 'text-slate-500 hover:opacity-80'
                    }`}
                >
                    <Building2 className="w-4 h-4" />
                    <span>Profil Perusahaan</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('general')}
                    style={activeTab === 'general' ? {
                        borderColor: themeForm.primary_accent_color,
                        color: themeForm.primary_accent_color,
                    } : {
                        color: themeForm.app_muted_text_color || undefined,
                    }}
                    className={`flex items-center gap-2 pb-3.5 transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'general'
                            ? 'border-b-2 font-bold'
                            : 'text-slate-500 hover:opacity-80'
                    }`}
                >
                    <Settings className="w-4 h-4" />
                    <span>Pengaturan Umum</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('appearance')}
                    style={activeTab === 'appearance' ? {
                        borderColor: themeForm.primary_accent_color,
                        color: themeForm.primary_accent_color,
                    } : {
                        color: themeForm.app_muted_text_color || undefined,
                    }}
                    className={`flex items-center gap-2 pb-3.5 transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'appearance'
                            ? 'border-b-2 font-bold'
                            : 'text-slate-500 hover:opacity-80'
                    }`}
                >
                    <Palette className="w-4 h-4" />
                    <span>Tampilan & Styling Warna</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('portal_theme')}
                    style={activeTab === 'portal_theme' ? {
                        borderColor: portalForm.portal_primary_accent || themeForm.primary_accent_color,
                        color: portalForm.portal_primary_accent || themeForm.primary_accent_color,
                    } : {
                        color: themeForm.app_muted_text_color || undefined,
                    }}
                    className={`flex items-center gap-2 pb-3.5 transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'portal_theme'
                            ? 'border-b-2 font-bold'
                            : 'text-slate-500 hover:opacity-80'
                    }`}
                >
                    <Globe className="w-4 h-4" />
                    <span>Kustomisasi Portal Klien</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('backup')}
                    style={activeTab === 'backup' ? {
                        borderColor: themeForm.primary_accent_color,
                        color: themeForm.primary_accent_color,
                    } : {
                        color: themeForm.app_muted_text_color || undefined,
                    }}
                    className={`flex items-center gap-2 pb-3.5 transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'backup'
                            ? 'border-b-2 font-bold'
                            : 'text-slate-500 hover:opacity-80'
                    }`}
                >
                    <Database className="w-4 h-4" />
                    <span>Backup & Data</span>
                </button>
            </div>

            {/* TAB 1: PROFIL PERUSAHAAN */}
            {activeTab === 'company' && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
                    {/* Form Profil Perusahaan (7 cols on xl) */}
                    <div className="xl:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="mb-5">
                                <h2 className="text-base font-bold text-slate-900">
                                    Informasi Perusahaan
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Informasi resmi bisnis yang akan dicantumkan pada invoice, proposal, dan portal klien.
                                </p>
                            </div>

                            <form onSubmit={handleSaveCompany} className="space-y-4">
                                {/* Row 1: Nama Brand & Nama Legal */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Nama Brand / Usaha
                                        </label>
                                        <input
                                            type="text"
                                            value={form.company_name}
                                            onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20 outline-hidden transition-all font-medium"
                                            placeholder="Contoh: Lensaria Photography"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Nama Badan Hukum / Legal
                                        </label>
                                        <input
                                            type="text"
                                            value={form.company_legal_name}
                                            onChange={(e) => setForm({ ...form, company_legal_name: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20 outline-hidden transition-all"
                                            placeholder="Contoh: PT Lensaria Kreatif Nusantara"
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Sub-Judul Sidebar & Tagline */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Sub-Judul Brand Sidebar (Monogram Subtitle)
                                        </label>
                                        <input
                                            type="text"
                                            value={form.company_subtitle}
                                            onChange={(e) => setForm({ ...form, company_subtitle: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20 outline-hidden transition-all font-medium"
                                            placeholder="Contoh: STUDIO & CINEMA / PHOTOGRAPHY SYSTEM"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Tagline Slogan
                                        </label>
                                        <input
                                            type="text"
                                            value={form.company_tagline}
                                            onChange={(e) => setForm({ ...form, company_tagline: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20 outline-hidden transition-all"
                                            placeholder="Contoh: Capturing Moments, Creating Memories"
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Website & Email */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Website Resmi
                                        </label>
                                        <input
                                            type="text"
                                            value={form.company_website}
                                            onChange={(e) => setForm({ ...form, company_website: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20 outline-hidden transition-all"
                                            placeholder="https://www.arams.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Email Kontak
                                        </label>
                                        <input
                                            type="email"
                                            value={form.company_email}
                                            onChange={(e) => setForm({ ...form, company_email: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20 outline-hidden transition-all"
                                            placeholder="info@arams.com"
                                        />
                                    </div>
                                </div>

                                {/* Row 4: No. Telepon & WhatsApp */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            No. Telepon / WhatsApp
                                        </label>
                                        <input
                                            type="text"
                                            value={form.company_phone}
                                            onChange={(e) => setForm({ ...form, company_phone: e.target.value, company_whatsapp: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20 outline-hidden transition-all"
                                            placeholder="+62 812-3456-7890"
                                        />
                                    </div>
                                </div>

                                {/* Row 4: Alamat Lengkap & Kota */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Alamat Studio / Kantor
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={form.company_address}
                                            onChange={(e) => setForm({ ...form, company_address: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20 outline-hidden transition-all"
                                            placeholder="Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Kota Domisili
                                            </label>
                                            <input
                                                type="text"
                                                value={form.company_city}
                                                onChange={(e) => setForm({ ...form, company_city: e.target.value })}
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20 outline-hidden transition-all"
                                                placeholder="Jakarta Selatan"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Zona Waktu
                                            </label>
                                            <select
                                                value={form.timezone}
                                                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20 outline-hidden transition-all cursor-pointer"
                                            >
                                                <option value="(GMT+07:00) Jakarta">WIB - (GMT+07:00) Jakarta, Bandung, Surabaya</option>
                                                <option value="(GMT+08:00) Makassar / Bali">WITA - (GMT+08:00) Bali, Makassar, Balikpapan</option>
                                                <option value="(GMT+09:00) Jayapura">WIT - (GMT+09:00) Jayapura, Ambon</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Logo Perusahaan */}
                                <div className="pt-2 border-t border-slate-100">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                        onChange={handleLogoFileChange}
                                        className="hidden"
                                    />

                                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                                        Logo Brand & Dokumen
                                    </label>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        {/* Logo Preview Box (Clean & Borderless when custom logo uploaded) */}
                                        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center p-2 text-center shrink-0 overflow-hidden transition-all ${
                                            form.company_logo
                                                ? 'bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300'
                                                : 'bg-[#0B1527] shadow-md border border-[#1E2D4A]'
                                        }`}>
                                            {form.company_logo ? (
                                                <img
                                                    src={form.company_logo}
                                                    alt="Brand Logo"
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center">
                                                    <span className="font-serif font-bold text-2xl text-[#C89445] leading-none">
                                                        L
                                                    </span>
                                                    <span className="text-[7px] font-bold tracking-widest text-white uppercase mt-1">
                                                        LENSARIA
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2 flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
                                                >
                                                    <Upload className="w-3.5 h-3.5 text-[#E8630A]" />
                                                    <span>Upload File Logo</span>
                                                </button>

                                                {form.company_logo && (
                                                    <button
                                                        type="button"
                                                        onClick={handleResetLogo}
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 text-xs font-semibold text-slate-600 transition-all cursor-pointer"
                                                    >
                                                        <span>Reset Default</span>
                                                    </button>
                                                )}
                                            </div>
                                            <span className="block text-[11px] text-slate-400">
                                                Mendukung format PNG transparan, JPG, SVG, WebP (Maks. 2MB).
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-xl bg-primary-accent text-white text-xs font-bold shadow-md transition-all hover:scale-[1.02] cursor-pointer inline-flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Simpan Perubahan</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Preview Tampilan Dokumen (5 cols on xl) */}
                    <div className="xl:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between sticky top-6">
                        <div>
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Preview Tampilan
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Live preview dokumen invoice & kontrak klien
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                    <Eye className="w-3 h-3" /> Live
                                </span>
                            </div>

                            {/* Document Mockup Box */}
                            <div className="p-6 rounded-2xl border border-slate-200/90 bg-slate-50/40 shadow-xs space-y-5">
                                {/* Brand Header */}
                                <div className="flex items-center justify-between border-b border-slate-200/70 pb-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {form.company_logo ? (
                                            <div className="h-10 max-w-[140px] flex items-center shrink-0">
                                                <img
                                                    src={form.company_logo}
                                                    alt="Brand"
                                                    className="max-h-10 max-w-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-xl bg-[#0B1527] flex flex-col items-center justify-center text-center shadow-xs shrink-0">
                                                <span className="font-serif font-bold text-base text-[#C89445]">L</span>
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <span className="font-bold text-sm tracking-[0.2em] text-slate-900 uppercase block font-sans truncate">
                                                {form.company_name || 'LENSARIA'}
                                            </span>
                                            <span className="text-[8px] tracking-[0.25em] text-slate-400 font-semibold uppercase block -mt-0.5 truncate">
                                                PHOTOGRAPHY & CINEMA
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200 shrink-0">
                                        INV-2026-0001
                                    </span>
                                </div>

                                {/* Info Details List */}
                                <div className="space-y-2.5 text-xs text-slate-600">
                                    <div className="flex items-center gap-2.5">
                                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span className="font-bold text-slate-800">
                                            {form.company_legal_name || form.company_name}
                                        </span>
                                    </div>

                                    <div className="flex items-start gap-2.5">
                                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">{form.company_address || 'Jl. Senopati No. 45, Jakarta Selatan'}</span>
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span>{form.company_phone || '+62 812-3456-7890'}</span>
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span>{form.company_email || 'hello@lensaria.com'}</span>
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                        <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span className="text-blue-600 font-medium">{form.company_website || 'https://www.lensaria.com'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Helper Banner */}
                        <div className="mt-5 p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-800 text-center flex items-center justify-center gap-2 font-medium">
                            <Info className="w-4 h-4 text-blue-500 shrink-0" />
                            <span>Informasi ini otomatis terpasang pada semua cetak dokumen.</span>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: PENGATURAN UMUM */}
            {activeTab === 'general' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                        <div className="mb-5 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    Modul Pengaturan Umum
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Sesuaikan preferensi mata uang, format penomoran, workflow tahapan, dan hak akses kerja.
                                </p>
                            </div>
                            <span className="text-xs text-slate-400 font-medium">Klik pada baris untuk mengubah pengaturan</span>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {/* 1. Preferensi Sistem */}
                            <div
                                onClick={() => setActiveModal('preferences')}
                                className="py-4 flex items-center justify-between group hover:bg-slate-50/80 p-3 rounded-xl transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                                        <Sliders className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#E8630A] transition-colors">
                                            Preferensi Sistem & Mata Uang
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Atur mata uang ({prefForm.currency_symbol} {prefForm.currency}), format tanggal ({prefForm.date_format}), dan zona waktu.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg hidden sm:inline-block border border-slate-200">
                                        {prefForm.currency} • {prefForm.date_format}
                                    </span>
                                    <button
                                        type="button"
                                        className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-bold text-slate-700 shadow-2xs group-hover:bg-[#E8630A] group-hover:text-white group-hover:border-[#E8630A] transition-all"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>

                            {/* 2. Penomoran Otomatis */}
                            <div
                                onClick={() => setActiveModal('numbering')}
                                className="py-4 flex items-center justify-between group hover:bg-slate-50/80 p-3 rounded-xl transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                                        <Hash className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#E8630A] transition-colors">
                                            Format Penomoran Dokumen (Invoice & Project)
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Prefix dan format penomoran otomatis saat invoice atau project baru dibuat.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-mono font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-lg hidden sm:inline-block border border-amber-200">
                                        {numForm.invoice_format}
                                    </span>
                                    <button
                                        type="button"
                                        className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-bold text-slate-700 shadow-2xs group-hover:bg-[#E8630A] group-hover:text-white group-hover:border-[#E8630A] transition-all"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>

                            {/* 3. Status & Timeline Default */}
                            <div
                                onClick={() => setActiveModal('workflow')}
                                className="py-4 flex items-center justify-between group hover:bg-slate-50/80 p-3 rounded-xl transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#E8630A] transition-colors">
                                            Tahapan Workflow & Approval Project
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Kelola langkah alur kerja fotografi (Booking → Preparation → Event → Editing → Selesai).
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg hidden sm:inline-block border border-emerald-200">
                                        8 Langkah Standar
                                    </span>
                                    <button
                                        type="button"
                                        className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-bold text-slate-700 shadow-2xs group-hover:bg-[#E8630A] group-hover:text-white group-hover:border-[#E8630A] transition-all"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>

                            {/* 4. Hak Akses Default Project */}
                            <div
                                onClick={() => setActiveModal('access')}
                                className="py-4 flex items-center justify-between group hover:bg-slate-50/80 p-3 rounded-xl transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#E8630A] transition-colors">
                                            Hak Akses & Penugasan Tim
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Atur hak visibilitas fotografer, editor, dan supervisor saat project dibuat.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-teal-800 bg-teal-50 px-3 py-1 rounded-lg hidden sm:inline-block border border-teal-200">
                                        Admin, Fotografer, Editor
                                    </span>
                                    <button
                                        type="button"
                                        className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-bold text-slate-700 shadow-2xs group-hover:bg-[#E8630A] group-hover:text-white group-hover:border-[#E8630A] transition-all"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>

                            {/* 5. Penyimpanan File Link */}
                            <div
                                onClick={() => setActiveModal('storage')}
                                className="py-4 flex items-center justify-between group hover:bg-slate-50/80 p-3 rounded-xl transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                                        <HardDrive className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#E8630A] transition-colors">
                                            Integrasi Google Drive & Folder Output
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Format penamaan folder Google Drive dan masa aktif tautan galeri klien.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-purple-800 bg-purple-50 px-3 py-1 rounded-lg hidden sm:inline-block border border-purple-200">
                                        {storageForm.link_expiry_days === '0'
                                            ? 'Tanpa Batas Waktu'
                                            : storageForm.link_expiry_days === '730'
                                            ? '2 Tahun'
                                            : storageForm.link_expiry_days === '1095'
                                            ? '3 Tahun'
                                            : storageForm.link_expiry_days === '365'
                                            ? '1 Tahun'
                                            : `${storageForm.link_expiry_days} Hari`}
                                    </span>
                                    <button
                                        type="button"
                                        className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-bold text-slate-700 shadow-2xs group-hover:bg-[#E8630A] group-hover:text-white group-hover:border-[#E8630A] transition-all"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: TAMPILAN & STYLING WARNA */}
            {activeTab === 'appearance' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Theme Presets Section */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#C89445]" />
                                    <span>Pilihan Preset Tema Instan</span>
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Pilih kombinasi palet warna siap pakai yang dirancang harmonis dan mewah dengan satu kali klik.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleResetTheme}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset ke Default</span>
                            </button>
                        </div>

                        {/* Preset Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {themePresets.map((preset) => {
                                const isSelected = themeForm.theme_preset === preset.id ||
                                    (themeForm.sidebar_bg_color === preset.sidebar_bg &&
                                     themeForm.sidebar_active_bg === preset.sidebar_active_bg);

                                return (
                                    <div
                                        key={preset.id}
                                        onClick={() => applyPreset(preset)}
                                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden group ${
                                            isSelected
                                                ? 'border-[#C89445] bg-[#C89445]/5 shadow-md shadow-[#C89445]/10'
                                                : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2.5">
                                            <span className="font-bold text-xs text-slate-900">
                                                {preset.name}
                                            </span>
                                            {isSelected ? (
                                                <CheckCircle2 className="w-4 h-4 text-[#C89445] shrink-0" />
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    {preset.badge}
                                                </span>
                                            )}
                                        </div>

                                        {/* Color Swatch Bar */}
                                        <div className="flex items-center gap-1.5 mb-2.5 p-1.5 rounded-lg bg-slate-100">
                                            <div
                                                className="h-5 flex-1 rounded-md shadow-xs"
                                                style={{ backgroundColor: preset.sidebar_bg }}
                                                title="Sidebar Background"
                                            />
                                            <div
                                                className="h-5 flex-1 rounded-md shadow-xs"
                                                style={{ backgroundColor: preset.sidebar_active_bg }}
                                                title="Active Highlight"
                                            />
                                            <div
                                                className="h-5 flex-1 rounded-md shadow-xs"
                                                style={{ backgroundColor: preset.primary_accent }}
                                                title="Accent"
                                            />
                                            <div
                                                className="h-5 flex-1 rounded-md border border-slate-300 shadow-xs"
                                                style={{ backgroundColor: preset.app_bg }}
                                                title="Surface"
                                            />
                                        </div>

                                        <p className="text-[11px] text-slate-500 line-clamp-1">
                                            {preset.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Official Master Palette Reference & Quick Palette Matrix */}
                    {/* <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                                <Palette className="w-4 h-4 text-[#C98922]" />
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                    Palet Warna Master Resmi Arams Pictures
                                </h3>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                9 Peran Warna Utama
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2 pt-1">
                            {[
                                { role: 'Primary Dark', hex: '#0E091E', desc: 'Background Utama' },
                                { role: 'Deep Purple', hex: '#1C132E', desc: 'Sidebar / Dark' },
                                { role: 'Dark Purple', hex: '#100A22', desc: 'Variasi Gelap' },
                                { role: 'Purple Surface', hex: '#181129', desc: 'Section Dark' },
                                { role: 'Champagne Gold', hex: '#C98922', desc: 'Brand CTA' },
                                { role: 'Warm Gold', hex: '#CA8A22', desc: 'Hover Light' },
                                { role: 'Warm White', hex: '#F7F5F5', desc: 'Card Utama' },
                                { role: 'Soft Ivory', hex: '#F8F6F5', desc: 'Surface Latar' },
                                { role: 'Soft Gray', hex: '#EDEAE8', desc: 'Border Divider' },
                            ].map((item) => (
                                <div
                                    key={item.hex}
                                    className="p-2 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between space-y-1.5"
                                >
                                    <div
                                        className="w-full h-6 rounded-lg border border-slate-300/40 shadow-xs flex items-center justify-center"
                                        style={{ backgroundColor: item.hex }}
                                    >
                                        <span
                                            className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded ${
                                                ['#0E091E', '#1C132E', '#100A22', '#181129'].includes(item.hex)
                                                    ? 'text-white/90 bg-black/40'
                                                    : 'text-slate-900 bg-white/80'
                                            }`}
                                        >
                                            {item.hex}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-bold text-slate-800 leading-tight truncate">
                                            {item.role}
                                        </span>
                                        <span className="block text-[8.5px] text-slate-400 leading-tight truncate">
                                            {item.desc}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div> */}

                    {/* Detailed Customizer & Real-time Live Preview */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                        {/* Left Column: Form Customizer (7 cols) */}
                        <div className="xl:col-span-7 space-y-6">
                            <form onSubmit={handleSaveTheme} className="space-y-6">
                                {/* 1. Sidebar Styling */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                                    <div className="border-b border-slate-100 pb-3">
                                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            <LayoutDashboard className="w-4 h-4 text-[#C89445]" />
                                            <span>Kustomisasi Warna Sidebar Navigasi</span>
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Sesuaikan latar belakang sidebar dan warna penanda menu yang sedang aktif.
                                        </p>
                                    </div>

                                    {/* Sidebar Background Color */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-semibold text-slate-700">
                                                Warna Latar Sidebar (Sidebar Background)
                                            </label>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                Hex: {themeForm.sidebar_bg_color}
                                            </span>
                                        </div>

                                        {/* Labeled Master Palette Role Options */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {[
                                                { label: 'Deep Purple', hex: '#1C132E', desc: 'Sidebar Utama' },
                                                { label: 'Primary Dark', hex: '#0E091E', desc: 'Dark Utama' },
                                                { label: 'Dark Purple', hex: '#100A22', desc: 'Variasi Gelap' },
                                                { label: 'Purple Surface', hex: '#181129', desc: 'Section Gelap' },
                                                { label: 'Midnight Navy', hex: '#0A192F', desc: 'Navy Modern' },
                                                { label: 'Classic Dark', hex: '#0B1527', desc: 'Dark Navy' },
                                                { label: 'Emerald Dark', hex: '#091B16', desc: 'Pine Deep' },
                                                { label: 'Slate Gray', hex: '#1E293B', desc: 'Graphite' },
                                            ].map((item) => (
                                                <button
                                                    key={item.hex}
                                                    type="button"
                                                    onClick={() =>
                                                        setThemeForm({ ...themeForm, sidebar_bg_color: item.hex })
                                                    }
                                                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                                        themeForm.sidebar_bg_color.toUpperCase() === item.hex.toUpperCase()
                                                            ? 'border-[#C98922] bg-[#C98922]/10 shadow-xs ring-1 ring-[#C98922]'
                                                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                                                    }`}
                                                >
                                                    <span
                                                        className="w-4 h-4 rounded-md border border-white/20 shrink-0 shadow-2xs"
                                                        style={{ backgroundColor: item.hex }}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <span className="block text-[11px] font-bold text-slate-800 truncate">
                                                            {item.label}
                                                        </span>
                                                        <span className="block text-[9px] text-slate-400 font-mono">
                                                            {item.hex}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Custom Picker */}
                                        <div className="flex items-center gap-3 pt-1">
                                            <span className="text-[11px] text-slate-500 font-medium">Custom Color:</span>
                                            <input
                                                type="color"
                                                value={themeForm.sidebar_bg_color}
                                                onChange={(e) =>
                                                    setThemeForm({ ...themeForm, sidebar_bg_color: e.target.value })
                                                }
                                                className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
                                            />
                                            <input
                                                type="text"
                                                value={themeForm.sidebar_bg_color}
                                                onChange={(e) =>
                                                    setThemeForm({ ...themeForm, sidebar_bg_color: e.target.value })
                                                }
                                                className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                                            />
                                        </div>
                                    </div>

                                    <GradientBuilder
                                        label="Gradient Sidebar (Opsional)"
                                        value={themeForm.sidebar_bg_gradient}
                                        onChange={(css) => setThemeForm({ ...themeForm, sidebar_bg_gradient: css })}
                                        presets={[
                                            { label: 'Purple → Violet', value: 'linear-gradient(160deg, #3D2080 0%, #1A0F3F 100%)' },
                                            { label: 'Purple → Navy', value: 'linear-gradient(145deg, #2D1B69 0%, #0A0E2A 100%)' },
                                            { label: 'Dark → Purple', value: 'linear-gradient(180deg, #1C132E 0%, #1A0F3F 100%)' },
                                            { label: 'Navy → Dark', value: 'linear-gradient(160deg, #0A192F 0%, #0E091E 100%)' },
                                            { label: 'Midnight → Indigo', value: 'linear-gradient(160deg, #0E091E 0%, #1a1f4e 100%)' },
                                            { label: 'Forest → Dark', value: 'linear-gradient(160deg, #091B16 0%, #071510 100%)' },
                                        ]}
                                    />

                                    {/* Sidebar Active Nav Item Background */}
                                    <div className="space-y-3 pt-3 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-semibold text-slate-700">
                                                Warna Sorotan Menu Aktif (Active Nav Item)
                                            </label>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                Hex: {themeForm.sidebar_active_bg}
                                            </span>
                                        </div>

                                        {/* Labeled Master Palette Role Options */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {[
                                                { label: 'Champagne Gold', hex: '#C98922', desc: 'Brand CTA' },
                                                { label: 'Warm Gold', hex: '#CA8A22', desc: 'Hover & Light' },
                                                { label: 'Classic Gold', hex: '#C89445', desc: 'Champagne' },
                                                { label: 'Royal Blue', hex: '#2563EB', desc: 'Electric' },
                                                { label: 'Emerald Pine', hex: '#059669', desc: 'Lush' },
                                                { label: 'Rose Velvet', hex: '#BE185D', desc: 'Plum' },
                                                { label: 'Amber Studio', hex: '#D97706', desc: 'Warm' },
                                                { label: 'Deep Purple', hex: '#1C132E', desc: 'Contrast' },
                                            ].map((item) => (
                                                <button
                                                    key={item.hex}
                                                    type="button"
                                                    onClick={() =>
                                                        setThemeForm({ ...themeForm, sidebar_active_bg: item.hex })
                                                    }
                                                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                                        themeForm.sidebar_active_bg.toUpperCase() === item.hex.toUpperCase()
                                                            ? 'border-[#C98922] bg-[#C98922]/10 shadow-xs ring-1 ring-[#C98922]'
                                                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                                                    }`}
                                                >
                                                    <span
                                                        className="w-4 h-4 rounded-md border border-white/20 shrink-0 shadow-2xs"
                                                        style={{ backgroundColor: item.hex }}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <span className="block text-[11px] font-bold text-slate-800 truncate">
                                                            {item.label}
                                                        </span>
                                                        <span className="block text-[9px] text-slate-400 font-mono">
                                                            {item.hex}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Custom Picker */}
                                        <div className="flex items-center gap-3 pt-1">
                                            <span className="text-[11px] text-slate-500 font-medium">Custom Color:</span>
                                            <input
                                                type="color"
                                                value={themeForm.sidebar_active_bg}
                                                onChange={(e) =>
                                                    setThemeForm({ ...themeForm, sidebar_active_bg: e.target.value })
                                                }
                                                className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
                                            />
                                            <input
                                                type="text"
                                                value={themeForm.sidebar_active_bg}
                                                onChange={(e) =>
                                                    setThemeForm({ ...themeForm, sidebar_active_bg: e.target.value })
                                                }
                                                className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                                            />
                                        </div>
                                    </div>

                                    <GradientBuilder
                                        label="Gradient Menu Aktif (Opsional)"
                                        value={themeForm.sidebar_active_bg_gradient}
                                        onChange={(css) => setThemeForm({ ...themeForm, sidebar_active_bg_gradient: css })}
                                        presets={[
                                            { label: 'Gold → Amber', value: 'linear-gradient(135deg, #C98922 0%, #F59E0B 100%)' },
                                            { label: 'Gold → Copper', value: 'linear-gradient(135deg, #C98922 0%, #9E6D24 100%)' },
                                            { label: 'Purple → Violet', value: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)' },
                                            { label: 'Blue → Indigo', value: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)' },
                                            { label: 'Rose → Pink', value: 'linear-gradient(135deg, #E11D48 0%, #BE185D 100%)' },
                                            { label: 'Emerald → Teal', value: 'linear-gradient(135deg, #059669 0%, #0D9488 100%)' },
                                        ]}
                                    />

                                    <div className="space-y-2 pt-3 border-t border-slate-100">
                                        <label className="block text-xs font-semibold text-slate-700">
                                            Warna Teks Menu Aktif
                                        </label>
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            {[
                                                { label: 'Putih Bersih', value: '#FFFFFF', preview: '#FFFFFF' },
                                                { label: 'Champagne Gold', value: '#C98922', preview: '#C98922' },
                                                { label: 'Warm Gold', value: '#CA8A22', preview: '#CA8A22' },
                                                { label: 'Soft Ivory', value: '#F8F6F5', preview: '#F8F6F5' },
                                                { label: 'Dark Navy', value: '#1C132E', preview: '#1C132E' },
                                            ].map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() =>
                                                        setThemeForm({ ...themeForm, sidebar_active_text: opt.value })
                                                    }
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                                                        themeForm.sidebar_active_text.toUpperCase() === opt.value.toUpperCase()
                                                            ? 'border-[#C98922] bg-[#C98922]/10 text-slate-900 shadow-xs'
                                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                                                    }`}
                                                >
                                                    <span
                                                        className="w-3 h-3 rounded-full border border-slate-300"
                                                        style={{ backgroundColor: opt.preview }}
                                                    />
                                                    <span>{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sidebar Subtitle Text */}
                                    <div className="space-y-2 pt-3 border-t border-slate-100">
                                        <label className="block text-xs font-semibold text-slate-700">
                                            Teks Sub-Judul Sidebar (Subtitle / Monogram Tagline)
                                        </label>
                                        <input
                                            type="text"
                                            value={themeForm.company_subtitle}
                                            onChange={(e) =>
                                                setThemeForm({ ...themeForm, company_subtitle: e.target.value })
                                            }
                                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 bg-white focus:border-[#C98922] focus:ring-2 focus:ring-[#C98922]/20 outline-hidden transition-all"
                                            placeholder="Contoh: STUDIO & CINEMA / PHOTOGRAPHY SYSTEM / PICTURES"
                                        />
                                        <span className="text-[10px] text-slate-400 block">
                                            Teks kecil berwarna emas yang tampil tepat di bawah nama brand pada sidebar.
                                        </span>
                                    </div>
                                </div>

                                {/* 2. Brand Accent & Page Background */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                                    <div className="border-b border-slate-100 pb-3">
                                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            <Paintbrush className="w-4 h-4 text-[#C98922]" />
                                            <span>Warna Aksen Brand & Latar Belakang Halaman</span>
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Tentukan warna tombol utama, badge status, dan nuansa latar dashboard.
                                        </p>
                                    </div>

                                    {/* Primary Accent Color */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-semibold text-slate-700">
                                                Warna Aksen Utama (Tombol & Badge)
                                            </label>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                Hex: {themeForm.primary_accent_color}
                                            </span>
                                        </div>

                                        {/* Labeled Master Palette Role Options */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {[
                                                { label: 'Champagne Gold', hex: '#C98922', desc: 'Brand CTA' },
                                                { label: 'Warm Gold', hex: '#CA8A22', desc: 'Highlight' },
                                                { label: 'Classic Gold', hex: '#C89445', desc: 'Champagne' },
                                                { label: 'Royal Blue', hex: '#2563EB', desc: 'Electric' },
                                                { label: 'Emerald Pine', hex: '#10B981', desc: 'Nature' },
                                                { label: 'Rose Crimson', hex: '#E11D48', desc: 'Plum' },
                                                { label: 'Amber Studio', hex: '#F59E0B', desc: 'Warm' },
                                                { label: 'Indigo Violet', hex: '#6366F1', desc: 'Tech' },
                                            ].map((item) => (
                                                <button
                                                    key={item.hex}
                                                    type="button"
                                                    onClick={() =>
                                                        setThemeForm({ ...themeForm, primary_accent_color: item.hex })
                                                    }
                                                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                                        themeForm.primary_accent_color.toUpperCase() === item.hex.toUpperCase()
                                                            ? 'border-[#C98922] bg-[#C98922]/10 shadow-xs ring-1 ring-[#C98922]'
                                                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                                                    }`}
                                                >
                                                    <span
                                                        className="w-4 h-4 rounded-md border border-white/20 shrink-0 shadow-2xs"
                                                        style={{ backgroundColor: item.hex }}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <span className="block text-[11px] font-bold text-slate-800 truncate">
                                                            {item.label}
                                                        </span>
                                                        <span className="block text-[9px] text-slate-400 font-mono">
                                                            {item.hex}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Custom Picker */}
                                        <div className="flex items-center gap-3 pt-1">
                                            <span className="text-[11px] text-slate-500 font-medium">Custom Color:</span>
                                            <input
                                                type="color"
                                                value={themeForm.primary_accent_color}
                                                onChange={(e) =>
                                                    setThemeForm({ ...themeForm, primary_accent_color: e.target.value })
                                                }
                                                className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
                                            />
                                            <input
                                                type="text"
                                                value={themeForm.primary_accent_color}
                                                onChange={(e) =>
                                                    setThemeForm({ ...themeForm, primary_accent_color: e.target.value })
                                                }
                                                className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                                            />
                                        </div>
                                    </div>

                                    <GradientBuilder
                                        label="Gradient Aksen Tombol (Opsional)"
                                        value={themeForm.primary_accent_gradient}
                                        onChange={(css) => setThemeForm({ ...themeForm, primary_accent_gradient: css })}
                                        presets={[
                                            { label: 'Gold → Amber', value: 'linear-gradient(135deg, #C98922 0%, #F59E0B 100%)' },
                                            { label: 'Gold → Orange', value: 'linear-gradient(135deg, #C98922 0%, #EA580C 100%)' },
                                            { label: 'Purple → Violet', value: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' },
                                            { label: 'Blue → Purple', value: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)' },
                                            { label: 'Emerald → Teal', value: 'linear-gradient(135deg, #059669 0%, #0D9488 100%)' },
                                            { label: 'Rose → Pink', value: 'linear-gradient(135deg, #E11D48 0%, #DB2777 100%)' },
                                        ]}
                                    />

                                    {/* Page Background */}
                                    <div className="space-y-3 pt-3 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-semibold text-slate-700">
                                                Nuansa Latar Belakang Halaman (App Surface Background)
                                            </label>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                Hex: {themeForm.app_bg_color}
                                            </span>
                                        </div>

                                        {/* Grid Cards for Quick Selection */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                            {[
                                                { label: 'Soft Ivory', value: '#F8F6F5', desc: 'Surface Latar' },
                                                { label: 'Warm White', value: '#F7F5F5', desc: 'Card Utama' },
                                                { label: 'Soft Gray', value: '#EDEAE8', desc: 'Border Netral' },
                                                { label: 'Crisp Slate', value: '#F8FAFC', desc: 'Clean Modern' },
                                                { label: 'Primary Dark', value: '#0E091E', desc: 'Gelap Midnight' },
                                                { label: 'Deep Purple', value: '#1C132E', desc: 'Gelap Purple' },
                                                { label: 'Warm Cream', value: '#FAF8F5', desc: 'Klasik Hangat' },
                                                { label: 'Pure White', value: '#FFFFFF', desc: 'Putih Polos' },
                                            ].map((opt) => (
                                                <div
                                                    key={opt.value}
                                                    onClick={() =>
                                                        setThemeForm({ ...themeForm, app_bg_color: opt.value })
                                                    }
                                                    className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                                                        themeForm.app_bg_color.toUpperCase() === opt.value.toUpperCase()
                                                            ? 'border-[#C98922] bg-white shadow-sm ring-1 ring-[#C98922]/20'
                                                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div
                                                            className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                                                            style={{ backgroundColor: opt.value }}
                                                        />
                                                        <span className="font-bold text-[11px] text-slate-900 truncate">
                                                            {opt.label}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] text-slate-400 block truncate">
                                                        {opt.desc} ({opt.value})
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Custom Color Palette Picker & Hex Input */}
                                        <div className="flex items-center gap-3 pt-1">
                                            <span className="text-[11px] text-slate-500 font-medium">Custom Palette Picker:</span>
                                            <input
                                                type="color"
                                                value={themeForm.app_bg_color}
                                                onChange={(e) =>
                                                    setThemeForm({ ...themeForm, app_bg_color: e.target.value })
                                                }
                                                className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
                                            />
                                            <input
                                                type="text"
                                                value={themeForm.app_bg_color}
                                                onChange={(e) =>
                                                    setThemeForm({ ...themeForm, app_bg_color: e.target.value })
                                                }
                                                className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                                                placeholder="#F8F6F5"
                                            />
                                            {/* Quick Dot Swatches */}
                                            <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                                                {['#F8F6F5', '#F7F5F5', '#EDEAE8', '#0E091E', '#1C132E', '#F8FAFC', '#FAF8F5', '#FFFFFF'].map((c) => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => setThemeForm({ ...themeForm, app_bg_color: c })}
                                                        style={{ backgroundColor: c }}
                                                        title={c}
                                                        className={`w-5 h-5 rounded-md border transition-transform hover:scale-110 ${
                                                            themeForm.app_bg_color.toUpperCase() === c.toUpperCase()
                                                                ? 'border-[#C98922] ring-2 ring-[#C98922]/40'
                                                                : 'border-slate-300'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <GradientBuilder
                                        label="Gradient Latar Utama App (Opsional)"
                                        value={themeForm.app_bg_gradient}
                                        onChange={(css) => setThemeForm({ ...themeForm, app_bg_gradient: css })}
                                        presets={[
                                            { label: 'Ivory → Lavender', value: 'linear-gradient(135deg, #F8F6F5 0%, #EDE8FF 100%)' },
                                            { label: 'White → Slate', value: 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)' },
                                            { label: 'Cream → Peach', value: 'linear-gradient(135deg, #FEF9F0 0%, #FFF7ED 100%)' },
                                            { label: 'Mint → White', value: 'linear-gradient(135deg, #F0FDF4 0%, #FAFAFA 100%)' },
                                            { label: 'Rose → Ivory', value: 'linear-gradient(135deg, #FFF1F2 0%, #F8F6F5 100%)' },
                                            { label: 'Sky → White', value: 'linear-gradient(135deg, #F0F9FF 0%, #FAFAFA 100%)' },
                                        ]}
                                    />
                                </div>

                                {/* 3. Kustomisasi Tampilan & Warna Halaman Login / Auth */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                                    <div className="border-b border-slate-100 pb-3">
                                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-[#C98922]" />
                                            <span>Kustomisasi Tampilan & Warna Halaman Login / Autentikasi</span>
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Atur warna latar belakang, kotak formulir login, warna tombol masuk, dan teks monogram khusus halaman login.
                                        </p>
                                    </div>

                                    {/* 1. Login Background Color */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-semibold text-slate-700">
                                                Warna Latar Belakang Login (Login Page Background)
                                            </label>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                Hex: {themeForm.login_bg_color}
                                            </span>
                                        </div>

                                        {/* Grid Cards for Quick Selection */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                            {[
                                                { label: 'Master Purple', value: '#0E091E', desc: 'Deep Purple' },
                                                { label: 'Midnight Navy', value: '#070D18', desc: 'Luxury Dark' },
                                                { label: 'Sapphire Navy', value: '#0A192F', desc: 'Royal Navy' },
                                                { label: 'Emerald Forest', value: '#06120E', desc: 'Deep Pine' },
                                                { label: 'Royal Velvet', value: '#140912', desc: 'Imperial Plum' },
                                                { label: 'Slate Charcoal', value: '#0F172A', desc: 'Modern Slate' },
                                                { label: 'Soft Ivory', value: '#F8F6F5', desc: 'Clean Ivory' },
                                                { label: 'Pure White', value: '#FFFFFF', desc: 'Terang Minimal' },
                                            ].map((opt) => (
                                                <div
                                                    key={opt.value}
                                                    onClick={() =>
                                                        setThemeForm({ ...themeForm, login_bg_color: opt.value })
                                                    }
                                                    className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                                                        themeForm.login_bg_color.toUpperCase() === opt.value.toUpperCase()
                                                            ? 'border-[#C98922] bg-white shadow-sm ring-1 ring-[#C98922]/20'
                                                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div
                                                            className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                                                            style={{ backgroundColor: opt.value }}
                                                        />
                                                        <span className="font-bold text-[11px] text-slate-900 truncate">
                                                            {opt.label}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] text-slate-400 block truncate">
                                                        {opt.desc} ({opt.value})
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Custom Picker & Hex Input */}
                                        <div className="flex items-center gap-3 pt-1">
                                            <span className="text-[11px] text-slate-500 font-medium">Custom Color:</span>
                                            <input
                                                type="color"
                                                value={themeForm.login_bg_color}
                                                onChange={(e) =>
                                                    setThemeForm({ ...themeForm, login_bg_color: e.target.value })
                                                }
                                                className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
                                            />
                                            <input
                                                type="text"
                                                value={themeForm.login_bg_color}
                                                onChange={(e) =>
                                                    setThemeForm({ ...themeForm, login_bg_color: e.target.value })
                                                }
                                                className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                                                placeholder="#0E091E"
                                            />
                                        </div>
                                    </div>

                                    <GradientBuilder
                                        label="Gradient Latar Login (Opsional)"
                                        value={themeForm.login_bg_gradient}
                                        onChange={(css) => setThemeForm({ ...themeForm, login_bg_gradient: css })}
                                        presets={[
                                            { label: 'Deep Purple → Black', value: 'linear-gradient(145deg, #2D1B69 0%, #0E091E 100%)' },
                                            { label: 'Navy → Dark', value: 'linear-gradient(145deg, #0A192F 0%, #0E091E 100%)' },
                                            { label: 'Midnight → Indigo', value: 'linear-gradient(145deg, #0E091E 0%, #1a1f4e 100%)' },
                                            { label: 'Forest → Black', value: 'linear-gradient(145deg, #091B16 0%, #050A07 100%)' },
                                            { label: 'Slate → Dark', value: 'linear-gradient(145deg, #1E293B 0%, #0F172A 100%)' },
                                            { label: 'Charcoal → Dark', value: 'linear-gradient(145deg, #27272A 0%, #09090B 100%)' },
                                        ]}
                                    />

                                    {/* 2. Login Card / Form Box Background */}
                                    <div className="space-y-3 pt-3 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-semibold text-slate-700">
                                                Warna Kotak Form Login (Login Card Surface)
                                            </label>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                Hex: {themeForm.login_card_bg}
                                            </span>
                                        </div>

                                        {/* Grid Cards for Quick Selection */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                            {[
                                                { label: 'Surface Purple', value: '#1C132E', desc: 'Dark Purple' },
                                                { label: 'Navy Card', value: '#0D1627', desc: 'Dark Navy' },
                                                { label: 'Slate Card', value: '#1E293B', desc: 'Tech Slate' },
                                                { label: 'Emerald Card', value: '#091B16', desc: 'Pine Card' },
                                                { label: 'Velvet Card', value: '#1B0F23', desc: 'Plum Card' },
                                                { label: 'Zinc Dark', value: '#18181B', desc: 'Dark Zinc' },
                                                { label: 'Soft Ivory Card', value: '#F7F5F5', desc: 'Light Card' },
                                                { label: 'Pure White Card', value: '#FFFFFF', desc: 'Clean White' },
                                            ].map((opt) => (
                                                <div
                                                    key={opt.value}
                                                    onClick={() =>
                                                        setThemeForm({ ...themeForm, login_card_bg: opt.value })
                                                    }
                                                    className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                                                        themeForm.login_card_bg.toUpperCase() === opt.value.toUpperCase()
                                                            ? 'border-[#C98922] bg-white shadow-sm ring-1 ring-[#C98922]/20'
                                                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div
                                                            className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                                                            style={{ backgroundColor: opt.value }}
                                                        />
                                                        <span className="font-bold text-[11px] text-slate-900 truncate">
                                                            {opt.label}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] text-slate-400 block truncate">
                                                        {opt.desc} ({opt.value})
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Custom Picker & Hex Input */}
                                        <div className="flex items-center gap-3 pt-1">
                                            <span className="text-[11px] text-slate-500 font-medium">Custom Color:</span>
                                            <input
                                                type="color"
                                                value={themeForm.login_card_bg}
                                                onChange={(e) =>
                                                    setThemeForm({ ...themeForm, login_card_bg: e.target.value })
                                                }
                                                className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
                                            />
                                            <input
                                                type="text"
                                                value={themeForm.login_card_bg}
                                                onChange={(e) =>
                                                    setThemeForm({ ...themeForm, login_card_bg: e.target.value })
                                                }
                                                className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                                                placeholder="#1C132E"
                                            />
                                        </div>
                                    </div>

                                    <GradientBuilder
                                        label="Gradient Kotak Form Login (Opsional)"
                                        value={themeForm.login_card_bg_gradient}
                                        onChange={(css) => setThemeForm({ ...themeForm, login_card_bg_gradient: css })}
                                        presets={[
                                            { label: 'Purple → Navy', value: 'linear-gradient(145deg, #2D1B69 0%, #0D1627 100%)' },
                                            { label: 'Slate → Dark', value: 'linear-gradient(145deg, #1E293B 0%, #0F172A 100%)' },
                                            { label: 'Dark → Purple', value: 'linear-gradient(145deg, #1C132E 0%, #2D1B69 100%)' },
                                            { label: 'Velvet → Black', value: 'linear-gradient(145deg, #1B0F23 0%, #09090B 100%)' },
                                            { label: 'White → Ivory', value: 'linear-gradient(145deg, #FFFFFF 0%, #F8F6F5 100%)' },
                                            { label: 'Ivory → Lavender', value: 'linear-gradient(145deg, #F8F6F5 0%, #EDE8FF 100%)' },
                                        ]}
                                    />

                                    {/* 3. Login Accent Color */}
                                    <div className="space-y-3 pt-3 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-semibold text-slate-700">
                                                Warna Aksen Tombol & Sorotan Login (Button & Glow Accent)
                                            </label>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                Hex: {themeForm.login_accent_color}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {[
                                                { label: 'Champagne Gold', hex: '#C98922', desc: 'Brand Master' },
                                                { label: 'Warm Gold', hex: '#CA8A22', desc: 'Highlight' },
                                                { label: 'Classic Gold', hex: '#C89445', desc: 'Champagne' },
                                                { label: 'Royal Blue', hex: '#2563EB', desc: 'Electric' },
                                                { label: 'Emerald Pine', hex: '#059669', desc: 'Lush' },
                                                { label: 'Rose Crimson', hex: '#E11D48', desc: 'Velvet' },
                                                { label: 'Amber Studio', hex: '#D97706', desc: 'Warm' },
                                                { label: 'Imperial Violet', hex: '#7C3AED', desc: 'Royal Violet' },
                                            ].map((item) => (
                                                <button
                                                    key={item.hex}
                                                    type="button"
                                                    onClick={() =>
                                                        setThemeForm({ ...themeForm, login_accent_color: item.hex })
                                                    }
                                                    className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                                        themeForm.login_accent_color.toUpperCase() === item.hex.toUpperCase()
                                                            ? 'border-[#C98922] bg-[#C98922]/10 shadow-xs ring-1 ring-[#C98922]'
                                                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                                                    }`}
                                                >
                                                    <span
                                                        className="w-4 h-4 rounded-md border border-white/20 shrink-0 shadow-2xs"
                                                        style={{ backgroundColor: item.hex }}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <span className="block text-[11px] font-bold text-slate-800 truncate">
                                                            {item.label}
                                                        </span>
                                                        <span className="block text-[9px] text-slate-400 font-mono">
                                                            {item.hex}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        {/* Custom Picker & Hex Input */}
                                        <div className="flex items-center gap-3 pt-1">
                                            <span className="text-[11px] text-slate-500 font-medium">Custom Color:</span>
                                            <input
                                                type="color"
                                                value={themeForm.login_accent_color}
                                                onChange={(e) =>
                                                    setThemeForm({ ...themeForm, login_accent_color: e.target.value })
                                                }
                                                className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
                                            />
                                            <input
                                                type="text"
                                                value={themeForm.login_accent_color}
                                                onChange={(e) =>
                                                    setThemeForm({ ...themeForm, login_accent_color: e.target.value })
                                                }
                                                className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                                                placeholder="#C98922"
                                            />
                                        </div>
                                    </div>

                                    {/* 4. Login Tagline */}
                                    <div className="space-y-2 pt-3 border-t border-slate-100">
                                        <label className="block text-xs font-semibold text-slate-700">
                                            Tagline Khusus Halaman Login
                                        </label>
                                        <input
                                            type="text"
                                            value={themeForm.login_tagline}
                                            onChange={(e) =>
                                                setThemeForm({ ...themeForm, login_tagline: e.target.value })
                                            }
                                            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 bg-white focus:border-[#C98922] focus:ring-2 focus:ring-[#C98922]/20 outline-hidden transition-all"
                                            placeholder="Contoh: STUDIO & CINEMA PHOTOGRAPHY SYSTEM"
                                        />
                                        <span className="text-[10px] text-slate-400 block">
                                            Teks keterangan kecil yang muncul di bawah logo dan judul brand pada halaman login.
                                        </span>
                                    </div>
                                </div>

                                 {/* 4. Tipografi, Font Family & Warna Teks Antarmuka */}
                                 <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
                                     <div className="border-b border-slate-100 pb-3">
                                         <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                             <Type className="w-4 h-4 text-[#C98922]" />
                                             <span>Tipografi, Font Family & Penyesuaian Warna Teks</span>
                                         </h3>
                                         <p className="text-xs text-slate-500 mt-0.5">
                                             Sesuaikan jenis font dan warna teks judul, isi, serta teks redup agar selalu kontras dan jelas terbaca pada background terang maupun gelap/gradient.
                                         </p>
                                     </div>

                                     {/* Quick 1-Click Text Contrast Presets */}
                                     <div className="space-y-2 bg-gradient-to-r from-slate-50 to-amber-50/40 p-3.5 rounded-xl border border-slate-200">
                                         <div className="flex items-center justify-between">
                                             <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                                                 <Sparkles className="w-3.5 h-3.5 text-[#C98922]" />
                                                 <span>Optimasi Cepat Kontras Teks (1-Click Presets):</span>
                                             </label>
                                             <span className="text-[10px] text-slate-400">Pilih mode kontras sesuai background</span>
                                         </div>
                                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                             <button
                                                 type="button"
                                                 onClick={() =>
                                                     setThemeForm({
                                                         ...themeForm,
                                                         app_heading_color: '#FFFFFF',
                                                         app_text_color: '#E2E8F0',
                                                         app_muted_text_color: '#94A3B8',
                                                         sidebar_text_color: '#CBD5E1',
                                                     })
                                                 }
                                                 className="p-2.5 rounded-xl border border-slate-200 bg-slate-900 text-left hover:border-slate-400 transition-all cursor-pointer shadow-xs"
                                             >
                                                 <div className="flex items-center gap-2">
                                                     <span className="w-3 h-3 rounded-full bg-white border border-slate-600 shrink-0" />
                                                     <span className="text-[11px] font-bold text-white">Mode Teks Terang</span>
                                                 </div>
                                                 <p className="text-[9px] text-slate-400 mt-1">
                                                     Untuk background gelap/purple agar teks tidak mati
                                                 </p>
                                             </button>

                                             <button
                                                 type="button"
                                                 onClick={() =>
                                                     setThemeForm({
                                                         ...themeForm,
                                                         app_heading_color: '#0F172A',
                                                         app_text_color: '#334155',
                                                         app_muted_text_color: '#64748B',
                                                         sidebar_text_color: '#94A3B8',
                                                     })
                                                 }
                                                 className="p-2.5 rounded-xl border border-slate-200 bg-white text-left hover:border-slate-400 transition-all cursor-pointer shadow-xs"
                                             >
                                                 <div className="flex items-center gap-2">
                                                     <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-300 shrink-0" />
                                                     <span className="text-[11px] font-bold text-slate-900">Mode Teks Gelap</span>
                                                 </div>
                                                 <p className="text-[9px] text-slate-500 mt-1">
                                                     Untuk background putih/ivory standar
                                                 </p>
                                             </button>

                                             <button
                                                 type="button"
                                                 onClick={() =>
                                                     setThemeForm({
                                                         ...themeForm,
                                                         app_heading_color: '#C98922',
                                                         app_text_color: '#F8F6F5',
                                                         app_muted_text_color: '#D4AF37',
                                                         sidebar_text_color: '#E6CA85',
                                                     })
                                                 }
                                                 className="p-2.5 rounded-xl border border-[#C98922]/40 bg-gradient-to-br from-[#1C132E] to-[#2D1B69] text-left hover:border-[#C98922] transition-all cursor-pointer shadow-xs"
                                             >
                                                 <div className="flex items-center gap-2">
                                                     <span className="w-3 h-3 rounded-full bg-[#C98922] border border-[#E6CA85] shrink-0" />
                                                     <span className="text-[11px] font-bold text-[#E6CA85]">Luxury Gold & Light</span>
                                                 </div>
                                                 <p className="text-[9px] text-slate-300 mt-1">
                                                     Kombinasi mewah khas Purple × Gold
                                                 </p>
                                             </button>
                                         </div>
                                     </div>

                                     {/* Font Family Pickers */}
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                         <div>
                                             <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                 Font Judul & Heading
                                             </label>
                                             <select
                                                 value={themeForm.font_family_heading}
                                                 onChange={(e) =>
                                                     setThemeForm({
                                                         ...themeForm,
                                                         font_family_heading: e.target.value,
                                                     })
                                                 }
                                                 className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 bg-white focus:border-[#C98922] focus:ring-2 focus:ring-[#C98922]/20"
                                             >
                                                 <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Sans)</option>
                                                 <option value="Inter">Inter (Clean UI)</option>
                                                 <option value="Manrope">Manrope (Geometric Modern)</option>
                                                 <option value="Outfit">Outfit (Brand Tech)</option>
                                                 <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                                                 <option value="Cormorant Garamond">Cormorant Garamond (Editorial Serif)</option>
                                             </select>
                                         </div>

                                         <div>
                                             <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                 Font Isi & Body Teks
                                             </label>
                                             <select
                                                 value={themeForm.font_family_body}
                                                 onChange={(e) =>
                                                     setThemeForm({
                                                         ...themeForm,
                                                         font_family_body: e.target.value,
                                                     })
                                                 }
                                                 className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 bg-white focus:border-[#C98922] focus:ring-2 focus:ring-[#C98922]/20"
                                             >
                                                 <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                                                 <option value="Inter">Inter</option>
                                                 <option value="Manrope">Manrope</option>
                                                 <option value="Roboto">Roboto</option>
                                             </select>
                                         </div>
                                     </div>

                                     {/* ── Detail Font Colors ── */}
                                     <div className="space-y-4 pt-2 border-t border-slate-100">
                                         {/* 1. Warna Judul & Heading */}
                                         <div className="space-y-2.5">
                                             <div className="flex items-center justify-between">
                                                 <label className="block text-xs font-semibold text-slate-700">
                                                     Warna Judul & Heading Halaman
                                                 </label>
                                                 <span className="text-[10px] text-slate-400 font-mono">
                                                     Hex: {themeForm.app_heading_color}
                                                 </span>
                                             </div>
                                             <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                                                 {[
                                                     { label: 'Putih Bersih', hex: '#FFFFFF' },
                                                     { label: 'Soft Ivory', hex: '#F8F6F5' },
                                                     { label: 'Champagne Gold', hex: '#C98922' },
                                                     { label: 'Warm Amber', hex: '#F59E0B' },
                                                     { label: 'Dark Slate', hex: '#0F172A' },
                                                     { label: 'Deep Purple', hex: '#1C132E' },
                                                 ].map((item) => (
                                                     <button
                                                         key={item.hex}
                                                         type="button"
                                                         onClick={() => setThemeForm({ ...themeForm, app_heading_color: item.hex })}
                                                         className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                                             themeForm.app_heading_color.toUpperCase() === item.hex.toUpperCase()
                                                                 ? 'border-[#C98922] bg-[#C98922]/10 ring-1 ring-[#C98922]'
                                                                 : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                                                         }`}
                                                     >
                                                         <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: item.hex }} />
                                                         <span className="text-[10px] font-bold text-slate-800 truncate">{item.label}</span>
                                                     </button>
                                                 ))}
                                             </div>
                                             <div className="flex items-center gap-3 pt-1">
                                                 <span className="text-[11px] text-slate-500 font-medium">Custom Color:</span>
                                                 <input
                                                     type="color"
                                                     value={themeForm.app_heading_color}
                                                     onChange={(e) => setThemeForm({ ...themeForm, app_heading_color: e.target.value })}
                                                     className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
                                                 />
                                                 <input
                                                     type="text"
                                                     value={themeForm.app_heading_color}
                                                     onChange={(e) => setThemeForm({ ...themeForm, app_heading_color: e.target.value })}
                                                     className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                                                 />
                                             </div>
                                         </div>

                                         {/* 2. Warna Isi & Body Teks */}
                                         <div className="space-y-2.5 pt-3 border-t border-slate-100">
                                             <div className="flex items-center justify-between">
                                                 <label className="block text-xs font-semibold text-slate-700">
                                                     Warna Isi & Body Teks (Paragraf & Konten)
                                                 </label>
                                                 <span className="text-[10px] text-slate-400 font-mono">
                                                     Hex: {themeForm.app_text_color}
                                                 </span>
                                             </div>
                                             <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                                                 {[
                                                     { label: 'Pure White', hex: '#FFFFFF' },
                                                     { label: 'Slate Terang', hex: '#E2E8F0' },
                                                     { label: 'Silver Lembut', hex: '#CBD5E1' },
                                                     { label: 'Dark Slate', hex: '#334155' },
                                                     { label: 'Charcoal', hex: '#1E293B' },
                                                     { label: 'Hitam Pekat', hex: '#0F172A' },
                                                 ].map((item) => (
                                                     <button
                                                         key={item.hex}
                                                         type="button"
                                                         onClick={() => setThemeForm({ ...themeForm, app_text_color: item.hex })}
                                                         className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                                             themeForm.app_text_color.toUpperCase() === item.hex.toUpperCase()
                                                                 ? 'border-[#C98922] bg-[#C98922]/10 ring-1 ring-[#C98922]'
                                                                 : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                                                         }`}
                                                     >
                                                         <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: item.hex }} />
                                                         <span className="text-[10px] font-bold text-slate-800 truncate">{item.label}</span>
                                                     </button>
                                                 ))}
                                             </div>
                                             <div className="flex items-center gap-3 pt-1">
                                                 <span className="text-[11px] text-slate-500 font-medium">Custom Color:</span>
                                                 <input
                                                     type="color"
                                                     value={themeForm.app_text_color}
                                                     onChange={(e) => setThemeForm({ ...themeForm, app_text_color: e.target.value })}
                                                     className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
                                                 />
                                                 <input
                                                     type="text"
                                                     value={themeForm.app_text_color}
                                                     onChange={(e) => setThemeForm({ ...themeForm, app_text_color: e.target.value })}
                                                     className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                                                 />
                                             </div>
                                         </div>

                                         {/* 3. Warna Subtitle & Teks Redup */}
                                         <div className="space-y-2.5 pt-3 border-t border-slate-100">
                                             <div className="flex items-center justify-between">
                                                 <label className="block text-xs font-semibold text-slate-700">
                                                     Warna Subtitle, Keterangan & Teks Redup (Muted Text)
                                                 </label>
                                                 <span className="text-[10px] text-slate-400 font-mono">
                                                     Hex: {themeForm.app_muted_text_color}
                                                 </span>
                                             </div>
                                             <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                                                 {[
                                                     { label: 'Muted Light', hex: '#94A3B8' },
                                                     { label: 'Silver Gray', hex: '#CBD5E1' },
                                                     { label: 'Muted Gold', hex: '#D4AF37' },
                                                     { label: 'Cool Slate', hex: '#64748B' },
                                                     { label: 'Dark Muted', hex: '#475569' },
                                                     { label: 'Neutral Gray', hex: '#71717A' },
                                                 ].map((item) => (
                                                     <button
                                                         key={item.hex}
                                                         type="button"
                                                         onClick={() => setThemeForm({ ...themeForm, app_muted_text_color: item.hex })}
                                                         className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                                             themeForm.app_muted_text_color.toUpperCase() === item.hex.toUpperCase()
                                                                 ? 'border-[#C98922] bg-[#C98922]/10 ring-1 ring-[#C98922]'
                                                                 : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                                                         }`}
                                                     >
                                                         <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: item.hex }} />
                                                         <span className="text-[10px] font-bold text-slate-800 truncate">{item.label}</span>
                                                     </button>
                                                 ))}
                                             </div>
                                             <div className="flex items-center gap-3 pt-1">
                                                 <span className="text-[11px] text-slate-500 font-medium">Custom Color:</span>
                                                 <input
                                                     type="color"
                                                     value={themeForm.app_muted_text_color}
                                                     onChange={(e) => setThemeForm({ ...themeForm, app_muted_text_color: e.target.value })}
                                                     className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
                                                 />
                                                 <input
                                                     type="text"
                                                     value={themeForm.app_muted_text_color}
                                                     onChange={(e) => setThemeForm({ ...themeForm, app_muted_text_color: e.target.value })}
                                                     className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                                                 />
                                             </div>
                                         </div>

                                         {/* 4. Warna Teks Menu Sidebar Inaktif */}
                                         <div className="space-y-2.5 pt-3 border-t border-slate-100">
                                             <div className="flex items-center justify-between">
                                                 <label className="block text-xs font-semibold text-slate-700">
                                                     Warna Teks Menu Sidebar (Menu Tidak Aktif)
                                                 </label>
                                                 <span className="text-[10px] text-slate-400 font-mono">
                                                     Hex: {themeForm.sidebar_text_color}
                                                 </span>
                                             </div>
                                             <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                                                 {[
                                                     { label: 'Muted Slate', hex: '#94A3B8' },
                                                     { label: 'Soft White', hex: '#E2E8F0' },
                                                     { label: 'Pure White', hex: '#FFFFFF' },
                                                     { label: 'Gold Mist', hex: '#E6CA85' },
                                                     { label: 'Light Mint', hex: '#99F6E4' },
                                                     { label: 'Zinc Gray', hex: '#A1A1AA' },
                                                 ].map((item) => (
                                                     <button
                                                         key={item.hex}
                                                         type="button"
                                                         onClick={() => setThemeForm({ ...themeForm, sidebar_text_color: item.hex })}
                                                         className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                                             themeForm.sidebar_text_color.toUpperCase() === item.hex.toUpperCase()
                                                                 ? 'border-[#C98922] bg-[#C98922]/10 ring-1 ring-[#C98922]'
                                                                 : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                                                         }`}
                                                     >
                                                         <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: item.hex }} />
                                                         <span className="text-[10px] font-bold text-slate-800 truncate">{item.label}</span>
                                                     </button>
                                                 ))}
                                             </div>
                                             <div className="flex items-center gap-3 pt-1">
                                                 <span className="text-[11px] text-slate-500 font-medium">Custom Color:</span>
                                                 <input
                                                     type="color"
                                                     value={themeForm.sidebar_text_color}
                                                     onChange={(e) => setThemeForm({ ...themeForm, sidebar_text_color: e.target.value })}
                                                     className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
                                                 />
                                                 <input
                                                     type="text"
                                                     value={themeForm.sidebar_text_color}
                                                     onChange={(e) => setThemeForm({ ...themeForm, sidebar_text_color: e.target.value })}
                                                     className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                                                 />
                                             </div>
                                          </div>

                                          {/* 5. Warna Judul Card & Stat Title */}
                                          <div className="space-y-2.5 pt-3 border-t border-slate-100">
                                              <div className="flex items-center justify-between">
                                                  <label className="block text-xs font-semibold text-slate-700">
                                                      Warna Judul Card &amp; Stat Title (TOTAL PROJECT, RINGKASAN KEUANGAN, dll.)
                                                  </label>
                                                  <span className="text-[10px] text-slate-400 font-mono">
                                                      Hex: {themeForm.card_heading_color}
                                                  </span>
                                              </div>
                                              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                                                  {[
                                                      { label: 'Dark Slate', hex: '#1E293B' },
                                                      { label: 'Charcoal Dark', hex: '#0F172A' },
                                                      { label: 'Deep Purple', hex: '#2D1B69' },
                                                      { label: 'Champagne Gold', hex: '#C98922' },
                                                      { label: 'Sapphire Navy', hex: '#0A192F' },
                                                      { label: 'Warm Amber', hex: '#B45309' },
                                                  ].map((item) => (
                                                      <button
                                                          key={item.hex}
                                                          type="button"
                                                          onClick={() => setThemeForm({ ...themeForm, card_heading_color: item.hex })}
                                                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                                              themeForm.card_heading_color.toUpperCase() === item.hex.toUpperCase()
                                                                  ? 'border-[#C98922] bg-[#C98922]/10 ring-1 ring-[#C98922]'
                                                                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                                                          }`}
                                                      >
                                                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: item.hex }} />
                                                          <span className="text-[10px] font-bold text-slate-800 truncate">{item.label}</span>
                                                      </button>
                                                  ))}
                                              </div>
                                              <div className="flex items-center gap-3 pt-1">
                                                  <span className="text-[11px] text-slate-500 font-medium">Custom Color:</span>
                                                  <input
                                                      type="color"
                                                      value={themeForm.card_heading_color}
                                                      onChange={(e) => setThemeForm({ ...themeForm, card_heading_color: e.target.value })}
                                                      className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
                                                  />
                                                  <input
                                                      type="text"
                                                      value={themeForm.card_heading_color}
                                                      onChange={(e) => setThemeForm({ ...themeForm, card_heading_color: e.target.value })}
                                                      className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                                                  />
                                              </div>
                                          </div>
                                     </div>
                                 </div>

                                 {/* 5. Kustomisasi Navbar Atas (Header) & Breadcrumb */}
                                 <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
                                     <div className="border-b border-slate-100 pb-3">
                                         <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                             <SlidersHorizontal className="w-4 h-4 text-[#C98922]" />
                                             <span>Kustomisasi Navbar Atas (Header) & Breadcrumb</span>
                                         </h3>
                                         <p className="text-xs text-slate-500 mt-0.5">
                                             Sesuaikan warna background navbar atas, teks judul navbar, warna link breadcrumb, dan garis border pemisah.
                                         </p>
                                     </div>

                                     {/* Quick 1-Click Matching Presets for Navbar */}
                                     <div className="space-y-2 bg-gradient-to-r from-slate-50 to-amber-50/40 p-3.5 rounded-xl border border-slate-200">
                                         <div className="flex items-center justify-between">
                                             <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                                                 <Sparkles className="w-3.5 h-3.5 text-[#C98922]" />
                                                 <span>Preset Cepat Navbar & Breadcrumb:</span>
                                             </label>
                                             <span className="text-[10px] text-slate-400">Pilih gaya header instan</span>
                                         </div>
                                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                             <button
                                                 type="button"
                                                 onClick={() =>
                                                     setThemeForm({
                                                         ...themeForm,
                                                         header_bg_color: '#1C132E',
                                                         header_bg_gradient: '',
                                                         header_text_color: '#FFFFFF',
                                                         header_border_color: 'rgba(255, 255, 255, 0.1)',
                                                         breadcrumb_color: '#94A3B8',
                                                         breadcrumb_active_color: '#FFFFFF',
                                                     })
                                                 }
                                                 className="p-2.5 rounded-xl border border-slate-200 bg-[#1C132E] text-left hover:border-slate-400 transition-all cursor-pointer shadow-xs"
                                             >
                                                 <div className="flex items-center gap-2">
                                                     <span className="w-3 h-3 rounded-full bg-white border border-slate-400 shrink-0" />
                                                     <span className="text-[11px] font-bold text-white">Dark Purple Navbar</span>
                                                 </div>
                                                 <p className="text-[9px] text-slate-300 mt-1">
                                                     Navbar ungu gelap senada dengan background utama
                                                 </p>
                                             </button>

                                             <button
                                                 type="button"
                                                 onClick={() =>
                                                     setThemeForm({
                                                         ...themeForm,
                                                         header_bg_color: '#FFFFFF',
                                                         header_bg_gradient: '',
                                                         header_text_color: '#0F172A',
                                                         header_border_color: 'rgba(226, 232, 240, 0.8)',
                                                         breadcrumb_color: '#64748B',
                                                         breadcrumb_active_color: '#0F172A',
                                                     })
                                                 }
                                                 className="p-2.5 rounded-xl border border-slate-200 bg-white text-left hover:border-slate-400 transition-all cursor-pointer shadow-xs"
                                             >
                                                 <div className="flex items-center gap-2">
                                                     <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-300 shrink-0" />
                                                     <span className="text-[11px] font-bold text-slate-900">Clean White Navbar</span>
                                                 </div>
                                                 <p className="text-[9px] text-slate-500 mt-1">
                                                     Navbar putih bersih klasik dengan teks gelap
                                                 </p>
                                             </button>

                                             <button
                                                 type="button"
                                                 onClick={() =>
                                                     setThemeForm({
                                                         ...themeForm,
                                                         header_bg_color: '#1C132E',
                                                         header_bg_gradient: 'linear-gradient(135deg, #1C132E 0%, #2D1B69 100%)',
                                                         header_text_color: '#E6CA85',
                                                         header_border_color: 'rgba(201, 137, 34, 0.3)',
                                                         breadcrumb_color: '#D4AF37',
                                                         breadcrumb_active_color: '#FFFFFF',
                                                     })
                                                 }
                                                 className="p-2.5 rounded-xl border border-[#C98922]/40 bg-gradient-to-r from-[#1C132E] to-[#2D1B69] text-left hover:border-[#C98922] transition-all cursor-pointer shadow-xs"
                                             >
                                                 <div className="flex items-center gap-2">
                                                     <span className="w-3 h-3 rounded-full bg-[#C98922] border border-[#E6CA85] shrink-0" />
                                                     <span className="text-[11px] font-bold text-[#E6CA85]">Luxury Gradient & Gold</span>
                                                 </div>
                                                 <p className="text-[9px] text-slate-300 mt-1">
                                                     Gradient ungu mewah & teks emas kontras
                                                 </p>
                                             </button>
                                         </div>
                                     </div>

                                     {/* 1. Background Navbar (Solid & Gradient) */}
                                     <div className="space-y-3">
                                         <div className="flex items-center justify-between">
                                             <label className="block text-xs font-semibold text-slate-700">
                                                 Background Navbar Atas (Solid atau Gradient Multi-Warna)
                                             </label>
                                             <span className="text-[10px] text-slate-400 font-mono">
                                                 {themeForm.header_bg_gradient ? 'Gradient Active' : `Hex: ${themeForm.header_bg_color}`}
                                             </span>
                                         </div>

                                         <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                                             {[
                                                 { label: 'Clean White', hex: '#FFFFFF' },
                                                 { label: 'Deep Purple', hex: '#1C132E' },
                                                 { label: 'Navy Sapphire', hex: '#0A192F' },
                                                 { label: 'Graphite Slate', hex: '#1E293B' },
                                                 { label: 'Soft Ivory', hex: '#F8F6F5' },
                                                 { label: 'Charcoal Dark', hex: '#0E091E' },
                                             ].map((item) => (
                                                 <button
                                                     key={item.hex}
                                                     type="button"
                                                     onClick={() =>
                                                         setThemeForm({
                                                             ...themeForm,
                                                             header_bg_color: item.hex,
                                                             header_bg_gradient: '',
                                                         })
                                                     }
                                                     className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                                         !themeForm.header_bg_gradient &&
                                                         themeForm.header_bg_color.toUpperCase() === item.hex.toUpperCase()
                                                             ? 'border-[#C98922] bg-[#C98922]/10 ring-1 ring-[#C98922]'
                                                             : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                                                     }`}
                                                 >
                                                     <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: item.hex }} />
                                                     <span className="text-[10px] font-bold text-slate-800 truncate">{item.label}</span>
                                                 </button>
                                             ))}
                                         </div>

                                         {/* Gradient Builder for Navbar */}
                                         <div className="pt-2">
                                             <GradientBuilder
                                                 label="Gradient Khusus Navbar Atas"
                                                 value={themeForm.header_bg_gradient}
                                                 onChange={(val) => setThemeForm({ ...themeForm, header_bg_gradient: val })}
                                                 presets={[
                                                     { label: 'Deep Purple Navbar', value: 'linear-gradient(135deg, #1C132E 0%, #2D1B69 100%)' },
                                                     { label: 'Sapphire Navy Navbar', value: 'linear-gradient(135deg, #0A192F 0%, #1E3A8A 100%)' },
                                                     { label: 'Clean White Soft', value: 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)' },
                                                     { label: 'Luxury Velvet & Gold', value: 'linear-gradient(135deg, #1C132E 0%, #3B1D5A 50%, #C98922 100%)' },
                                                     { label: 'Charcoal Minimalist', value: 'linear-gradient(90deg, #0F172A 0%, #1E293B 100%)' },
                                                 ]}
                                             />
                                         </div>
                                     </div>

                                     {/* 2. Detail Color Controls */}
                                     <div className="space-y-4 pt-3 border-t border-slate-100">
                                         {/* Warna Teks & Judul Navbar */}
                                         <div className="space-y-2.5">
                                             <div className="flex items-center justify-between">
                                                 <label className="block text-xs font-semibold text-slate-700">
                                                     Warna Teks, Judul & Ikon Navbar Atas
                                                 </label>
                                                 <span className="text-[10px] text-slate-400 font-mono">
                                                     Hex: {themeForm.header_text_color}
                                                 </span>
                                             </div>
                                             <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                                                 {[
                                                     { label: 'Putih Bersih', hex: '#FFFFFF' },
                                                     { label: 'Gold Mist', hex: '#E6CA85' },
                                                     { label: 'Champagne Gold', hex: '#C98922' },
                                                     { label: 'Dark Slate', hex: '#0F172A' },
                                                     { label: 'Charcoal', hex: '#1E293B' },
                                                     { label: 'Soft Ivory', hex: '#F8F6F5' },
                                                 ].map((item) => (
                                                     <button
                                                         key={item.hex}
                                                         type="button"
                                                         onClick={() => setThemeForm({ ...themeForm, header_text_color: item.hex })}
                                                         className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                                             themeForm.header_text_color.toUpperCase() === item.hex.toUpperCase()
                                                                 ? 'border-[#C98922] bg-[#C98922]/10 ring-1 ring-[#C98922]'
                                                                 : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                                                         }`}
                                                     >
                                                         <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: item.hex }} />
                                                         <span className="text-[10px] font-bold text-slate-800 truncate">{item.label}</span>
                                                     </button>
                                                 ))}
                                             </div>
                                             <div className="flex items-center gap-3 pt-1">
                                                 <span className="text-[11px] text-slate-500 font-medium">Custom Color:</span>
                                                 <input
                                                     type="color"
                                                     value={themeForm.header_text_color}
                                                     onChange={(e) => setThemeForm({ ...themeForm, header_text_color: e.target.value })}
                                                     className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
                                                 />
                                                 <input
                                                     type="text"
                                                     value={themeForm.header_text_color}
                                                     onChange={(e) => setThemeForm({ ...themeForm, header_text_color: e.target.value })}
                                                     className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                                                 />
                                             </div>
                                         </div>

                                         {/* Warna Link & Separator Breadcrumb */}
                                         <div className="space-y-2.5 pt-3 border-t border-slate-100">
                                             <div className="flex items-center justify-between">
                                                 <label className="block text-xs font-semibold text-slate-700">
                                                     Warna Link Induk & Separator Breadcrumb (›)
                                                 </label>
                                                 <span className="text-[10px] text-slate-400 font-mono">
                                                     Hex: {themeForm.breadcrumb_color}
                                                 </span>
                                             </div>
                                             <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                                                 {[
                                                     { label: 'Muted Light', hex: '#94A3B8' },
                                                     { label: 'Silver Gray', hex: '#CBD5E1' },
                                                     { label: 'Muted Gold', hex: '#D4AF37' },
                                                     { label: 'Slate Gray', hex: '#64748B' },
                                                     { label: 'Dark Slate', hex: '#475569' },
                                                     { label: 'Ivory Muted', hex: '#E2E8F0' },
                                                 ].map((item) => (
                                                     <button
                                                         key={item.hex}
                                                         type="button"
                                                         onClick={() => setThemeForm({ ...themeForm, breadcrumb_color: item.hex })}
                                                         className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                                             themeForm.breadcrumb_color.toUpperCase() === item.hex.toUpperCase()
                                                                 ? 'border-[#C98922] bg-[#C98922]/10 ring-1 ring-[#C98922]'
                                                                 : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                                                         }`}
                                                     >
                                                         <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: item.hex }} />
                                                         <span className="text-[10px] font-bold text-slate-800 truncate">{item.label}</span>
                                                     </button>
                                                 ))}
                                             </div>
                                             <div className="flex items-center gap-3 pt-1">
                                                 <span className="text-[11px] text-slate-500 font-medium">Custom Color:</span>
                                                 <input
                                                     type="color"
                                                     value={themeForm.breadcrumb_color}
                                                     onChange={(e) => setThemeForm({ ...themeForm, breadcrumb_color: e.target.value })}
                                                     className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
                                                 />
                                                 <input
                                                     type="text"
                                                     value={themeForm.breadcrumb_color}
                                                     onChange={(e) => setThemeForm({ ...themeForm, breadcrumb_color: e.target.value })}
                                                     className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                                                 />
                                             </div>
                                         </div>

                                         {/* Warna Teks Breadcrumb Halaman Aktif */}
                                         <div className="space-y-2.5 pt-3 border-t border-slate-100">
                                             <div className="flex items-center justify-between">
                                                 <label className="block text-xs font-semibold text-slate-700">
                                                     Warna Teks Halaman Aktif pada Breadcrumb
                                                 </label>
                                                 <span className="text-[10px] text-slate-400 font-mono">
                                                     Hex: {themeForm.breadcrumb_active_color}
                                                 </span>
                                             </div>
                                             <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                                                 {[
                                                     { label: 'Putih Bersih', hex: '#FFFFFF' },
                                                     { label: 'Champagne Gold', hex: '#C98922' },
                                                     { label: 'Soft Ivory', hex: '#F8F6F5' },
                                                     { label: 'Dark Slate', hex: '#0F172A' },
                                                     { label: 'Amber Gold', hex: '#F59E0B' },
                                                     { label: 'Slate Light', hex: '#E2E8F0' },
                                                 ].map((item) => (
                                                     <button
                                                         key={item.hex}
                                                         type="button"
                                                         onClick={() => setThemeForm({ ...themeForm, breadcrumb_active_color: item.hex })}
                                                         className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                                             themeForm.breadcrumb_active_color.toUpperCase() === item.hex.toUpperCase()
                                                                 ? 'border-[#C98922] bg-[#C98922]/10 ring-1 ring-[#C98922]'
                                                                 : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                                                         }`}
                                                     >
                                                         <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: item.hex }} />
                                                         <span className="text-[10px] font-bold text-slate-800 truncate">{item.label}</span>
                                                     </button>
                                                 ))}
                                             </div>
                                             <div className="flex items-center gap-3 pt-1">
                                                 <span className="text-[11px] text-slate-500 font-medium">Custom Color:</span>
                                                 <input
                                                     type="color"
                                                     value={themeForm.breadcrumb_active_color}
                                                     onChange={(e) => setThemeForm({ ...themeForm, breadcrumb_active_color: e.target.value })}
                                                     className="w-8 h-8 rounded-lg border border-slate-300 p-0.5 cursor-pointer bg-white"
                                                 />
                                                 <input
                                                     type="text"
                                                     value={themeForm.breadcrumb_active_color}
                                                     onChange={(e) => setThemeForm({ ...themeForm, breadcrumb_active_color: e.target.value })}
                                                     className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800"
                                                 />
                                             </div>
                                         </div>
                                     </div>
                                 </div>

                                {/* Save Button */}
                                <div className="flex items-center justify-between pt-2">
                                    <button
                                        type="button"
                                        onClick={handleResetTheme}
                                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                                    >
                                        Kembalikan ke Default
                                    </button>

                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-[#C89445] hover:bg-[#b78437] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#C89445]/25 transition-all flex items-center gap-2 cursor-pointer"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Simpan Perubahan Tampilan</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Right Column: Live Interactive Mockup Preview (5 cols) */}
                        <div className="xl:col-span-5 sticky top-20">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-lg space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                        <span className="text-[11px] font-bold text-slate-700 ml-1">
                                            Live Real-time Preview
                                        </span>
                                    </div>
                                    {/* Preview Toggle Buttons for multiple menus */}
                                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto scrollbar-none">
                                        {[
                                            { id: 'dashboard', label: 'Dashboard' },
                                            { id: 'projects', label: 'Projects' },
                                            { id: 'master_data', label: 'Master Data' },
                                            { id: 'finance', label: 'Keuangan' },
                                            { id: 'login', label: 'Login' },
                                        ].map((m) => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setPreviewMode(m.id as any)}
                                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                                                    previewMode === m.id
                                                        ? 'bg-white text-slate-900 shadow-2xs'
                                                        : 'text-slate-500 hover:text-slate-800'
                                                }`}
                                            >
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {previewMode === 'login' ? (
                                    /* Simulated Login Window */
                                    <div
                                        style={{
                                            background: themeForm.login_bg_gradient || themeForm.login_bg_color,
                                            fontFamily: `${themeForm.font_family_body}, sans-serif`,
                                        }}
                                        className="rounded-xl border border-slate-200 overflow-hidden shadow-inner flex flex-col items-center justify-center p-4 min-h-[380px] text-xs transition-colors relative"
                                    >
                                        {/* Ambient Glow */}
                                        <div
                                            className="absolute w-40 h-40 rounded-full blur-2xl opacity-25 pointer-events-none"
                                            style={{ backgroundColor: themeForm.login_accent_color }}
                                        />

                                        {/* Mini Login Card */}
                                        <div
                                            style={{
                                                background: themeForm.login_card_bg_gradient || themeForm.login_card_bg,
                                                borderColor: `${themeForm.login_accent_color}44`,
                                            }}
                                            className="w-full max-w-[250px] border rounded-2xl p-4 shadow-xl relative z-10 space-y-3"
                                        >
                                            {/* Top Accent Line */}
                                            <div
                                                className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl"
                                                style={{ backgroundColor: themeForm.login_accent_color }}
                                            />

                                            <div className="text-center space-y-1">
                                                <div
                                                    className="w-8 h-8 rounded-lg mx-auto flex items-center justify-center font-bold text-xs border shadow-xs"
                                                    style={{
                                                        background: themeForm.login_bg_color,
                                                        borderColor: `${themeForm.login_accent_color}66`,
                                                        color: themeForm.login_accent_color,
                                                    }}
                                                >
                                                    AP
                                                </div>
                                                <span className="font-extrabold text-[11px] text-white tracking-widest block uppercase">
                                                    ARAMS PICTURES
                                                </span>
                                                <span
                                                    className="text-[7px] font-bold uppercase tracking-wider block"
                                                    style={{ color: themeForm.login_accent_color }}
                                                >
                                                    {themeForm.login_tagline || 'STUDIO & CINEMA PHOTOGRAPHY SYSTEM'}
                                                </span>
                                            </div>

                                            {/* Dummy inputs */}
                                            <div className="space-y-1.5 pt-1">
                                                <div className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-[9px] text-slate-400">
                                                    nama@arams.com
                                                </div>
                                                <div className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-[9px] text-slate-400">
                                                    ••••••••
                                                </div>
                                            </div>

                                            {/* Button */}
                                            <div
                                                style={{
                                                    background: themeForm.primary_accent_gradient || themeForm.login_accent_color,
                                                    boxShadow: `0 4px 14px -2px ${themeForm.login_accent_color}66`,
                                                }}
                                                className="w-full py-1.5 rounded-lg text-white font-bold text-[9px] tracking-wider uppercase text-center cursor-pointer shadow-xs"
                                            >
                                                Masuk ke Dashboard
                                            </div>
                                        </div>

                                        <span className="text-[8px] text-slate-400 text-center mt-3 z-10">
                                            *Preview live halaman login ([http://localhost:8002/login](http://localhost:8002/login))
                                        </span>
                                    </div>
                                ) : (
                                    /* Simulated Application Window (Multi-Menu Support) */
                                    <div
                                        style={{
                                            background: themeForm.app_bg_gradient || themeForm.app_bg_color,
                                            fontFamily: `${themeForm.font_family_body}, sans-serif`,
                                        }}
                                        className="rounded-xl border border-slate-200 overflow-hidden shadow-inner flex min-h-[380px] text-xs transition-colors"
                                    >
                                        {/* Simulated Sidebar */}
                                        <div
                                            style={{ background: themeForm.sidebar_bg_gradient || themeForm.sidebar_bg_color }}
                                            className="w-36 p-3 text-slate-300 flex flex-col justify-between shrink-0 transition-colors"
                                        >
                                            <div className="space-y-3">
                                                {/* Mini Logo */}
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#E2B774] to-[#C89445] text-white flex items-center justify-center font-bold text-[10px]">
                                                        AP
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-bold text-[9px] text-white tracking-wider truncate">
                                                            ARAMS
                                                        </span>
                                                        <span className="text-[7px] text-[#C89445] font-semibold -mt-0.5 uppercase tracking-wider truncate">
                                                            {themeForm.company_subtitle || 'STUDIO & CINEMA'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Mini Nav Items */}
                                                <div className="space-y-1 pt-1">
                                                    {[
                                                        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                                                        { id: 'projects', label: 'Projects', icon: Briefcase },
                                                        { id: 'master_data', label: 'Master Data', icon: Database },
                                                        { id: 'finance', label: 'Keuangan', icon: FileSpreadsheet },
                                                    ].map((item) => {
                                                        const active = previewMode === item.id;
                                                        return (
                                                            <div
                                                                key={item.id}
                                                                style={active ? {
                                                                    background: themeForm.sidebar_active_bg_gradient || themeForm.sidebar_active_bg,
                                                                    color: themeForm.sidebar_active_text,
                                                                } : {
                                                                    color: themeForm.sidebar_text_color,
                                                                }}
                                                                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                                                    active ? 'shadow-xs' : 'hover:bg-white/5'
                                                                }`}
                                                                onClick={() => setPreviewMode(item.id as any)}
                                                            >
                                                                <item.icon className="w-3 h-3 shrink-0" />
                                                                <span className="truncate">{item.label}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="text-[8px] text-slate-500 pt-2 border-t border-white/5">
                                                v2.4.0 • Studio
                                            </div>
                                        </div>

                                        {/* Simulated Dynamic Content Area with Top Navbar */}
                                        <div className="flex-1 flex flex-col justify-between min-w-0">
                                            {/* Simulated Top Navbar */}
                                            <div
                                                style={{
                                                    background: themeForm.header_bg_gradient || themeForm.header_bg_color,
                                                    borderColor: themeForm.header_border_color,
                                                    color: themeForm.header_text_color,
                                                }}
                                                className="h-9 px-3 border-b flex items-center justify-between transition-colors shrink-0"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Menu className="w-3 h-3 opacity-70 shrink-0" />
                                                    <span
                                                        style={{
                                                            color: themeForm.header_text_color,
                                                            fontFamily: `${themeForm.font_family_heading}, sans-serif`,
                                                        }}
                                                        className="font-extrabold text-[10px] tracking-tight truncate"
                                                    >
                                                        {previewMode === 'dashboard' && 'Dashboard'}
                                                        {previewMode === 'projects' && 'Projects'}
                                                        {previewMode === 'master_data' && 'Master Data'}
                                                        {previewMode === 'finance' && 'Keuangan'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <div
                                                        style={{ borderColor: themeForm.header_border_color }}
                                                        className="hidden sm:flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded border text-[8px] opacity-70"
                                                    >
                                                        <Search className="w-2.5 h-2.5" />
                                                        <span>Search...</span>
                                                    </div>
                                                    <div className="relative">
                                                        <Bell className="w-3 h-3 opacity-80" />
                                                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                                                    </div>
                                                    <div className="w-4 h-4 rounded-full bg-slate-400 overflow-hidden ring-1 ring-white/20">
                                                        <img
                                                            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                                                            alt="Admin"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Page Body Content */}
                                            <div className="p-3 space-y-2.5 flex-1 flex flex-col justify-between">
                                                {/* In-page Breadcrumb & Title Live Display */}
                                                <div className="space-y-1 border-b border-slate-200/40 pb-2">
                                                    {/* In-Page Breadcrumb */}
                                                    <div className="flex items-center gap-1 text-[8px]">
                                                        <span style={{ color: themeForm.breadcrumb_color }}>Dashboard</span>
                                                        <span style={{ color: themeForm.breadcrumb_color }}>›</span>
                                                        <span
                                                            style={{ color: themeForm.breadcrumb_active_color }}
                                                            className="font-bold"
                                                        >
                                                            {previewMode === 'dashboard' && 'Overview'}
                                                            {previewMode === 'projects' && 'Projects'}
                                                            {previewMode === 'master_data' && 'Master Data Layanan'}
                                                            {previewMode === 'finance' && 'Invoice & Transaksi'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-2">
                                                        <h4
                                                            style={{
                                                                color: themeForm.app_heading_color,
                                                                fontFamily: `${themeForm.font_family_heading}, sans-serif`,
                                                            }}
                                                            className="font-extrabold text-[12px] tracking-tight truncate"
                                                        >
                                                            {previewMode === 'dashboard' && 'Dashboard Overview'}
                                                            {previewMode === 'projects' && 'Manajemen Projects'}
                                                            {previewMode === 'master_data' && 'Master Data & Paket'}
                                                            {previewMode === 'finance' && 'Keuangan & Invoice'}
                                                        </h4>
                                                        <div
                                                            style={{
                                                                background: themeForm.primary_accent_gradient || themeForm.primary_accent_color,
                                                            }}
                                                            className="px-2 py-0.5 rounded-md text-white text-[8px] font-bold shrink-0 shadow-xs"
                                                        >
                                                            + Tambah
                                                        </div>
                                                    </div>
                                                    <p
                                                        style={{
                                                            color: themeForm.app_muted_text_color,
                                                        }}
                                                        className="text-[8.5px] line-clamp-1"
                                                    >
                                                        {previewMode === 'dashboard' && 'Ringkasan performa studio, jadwal sesi foto, dan invoice.'}
                                                        {previewMode === 'projects' && 'Kelola jadwal sesi wedding, prewedding, dan status klien.'}
                                                        {previewMode === 'master_data' && 'Daftar layanan fotografi, paket pricing, dan kategori.'}
                                                        {previewMode === 'finance' && 'Pencatatan pemasukan, uang muka DP, dan pelunasan transaksi.'}
                                                    </p>
                                                </div>

                                            {/* Dynamic Content Snippet Based on Menu */}
                                            {previewMode === 'dashboard' && (
                                                <div className="space-y-2">
                                                    <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs space-y-0.5">
                                                        <span style={{ color: themeForm.app_muted_text_color }} className="text-[8px] font-semibold block">
                                                            Total Pendapatan Bulan Ini
                                                        </span>
                                                        <div className="flex items-baseline justify-between">
                                                            <span style={{ color: themeForm.app_heading_color }} className="font-extrabold text-xs font-mono">
                                                                Rp 128.500.000
                                                            </span>
                                                            <span style={{ color: themeForm.primary_accent_color }} className="text-[8px] font-bold">
                                                                +18.4%
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs space-y-1">
                                                        <div className="flex items-center justify-between text-[8px] font-bold border-b border-slate-100 pb-0.5" style={{ color: themeForm.app_muted_text_color }}>
                                                            <span>Project</span>
                                                            <span>Status</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[8px]" style={{ color: themeForm.app_text_color }}>
                                                            <span className="font-medium truncate">Wedding Raisa & Hamish</span>
                                                            <span className="px-1 py-0.2 rounded text-[7px] font-bold bg-emerald-50 text-emerald-700">Done</span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[8px]" style={{ color: themeForm.app_text_color }}>
                                                            <span className="font-medium truncate">Prewedding Bali Beach</span>
                                                            <span className="px-1 py-0.2 rounded text-[7px] font-bold bg-amber-50 text-amber-700">Active</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {previewMode === 'projects' && (
                                                <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs space-y-1.5">
                                                    <div className="flex items-center gap-1">
                                                        <span style={{ background: themeForm.primary_accent_color }} className="w-1.5 h-1.5 rounded-full" />
                                                        <span style={{ color: themeForm.app_heading_color }} className="font-bold text-[9px]">Daftar Sesi Foto Klien</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {[
                                                            { title: 'The Royal Wedding', client: 'Andi & Sarah', date: '28 Agu 2026', badge: 'Confirmed' },
                                                            { title: 'Intimate Prewedding', client: 'Budi & Cindy', date: '02 Sep 2026', badge: 'Editing' },
                                                            { title: 'Engagement Ceremony', client: 'Dimas & Ratna', date: '10 Sep 2026', badge: 'Planning' },
                                                        ].map((p, i) => (
                                                            <div key={i} className="flex items-center justify-between text-[8px] p-1 rounded bg-slate-50 border border-slate-100">
                                                                <div>
                                                                    <span style={{ color: themeForm.app_heading_color }} className="font-bold block leading-tight">{p.title}</span>
                                                                    <span style={{ color: themeForm.app_muted_text_color }} className="text-[7px]">{p.client} • {p.date}</span>
                                                                </div>
                                                                <span style={{ color: themeForm.primary_accent_color }} className="text-[7px] font-bold px-1 py-0.5 rounded bg-white border border-slate-200">
                                                                    {p.badge}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {previewMode === 'master_data' && (
                                                <div className="space-y-1.5">
                                                    {[
                                                        { name: 'Paket Cinema Deluxe', price: 'Rp 15.000.000', desc: 'Full Day 2 Photographer + 2 Videographer' },
                                                        { name: 'Paket Prewedding Romantic', price: 'Rp 6.500.000', desc: '1 Day Session + Album Hardcover' },
                                                    ].map((item, i) => (
                                                        <div key={i} className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs space-y-0.5">
                                                            <div className="flex items-center justify-between">
                                                                <span style={{ color: themeForm.app_heading_color }} className="font-bold text-[9px]">{item.name}</span>
                                                                <span style={{ color: themeForm.primary_accent_color }} className="font-extrabold text-[9px] font-mono">{item.price}</span>
                                                            </div>
                                                            <span style={{ color: themeForm.app_muted_text_color }} className="text-[8px] block">{item.desc}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {previewMode === 'finance' && (
                                                <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs space-y-1.5">
                                                    <div className="flex items-center justify-between text-[8px] font-bold border-b border-slate-100 pb-1" style={{ color: themeForm.app_muted_text_color }}>
                                                        <span>Invoice #</span>
                                                        <span>Nominal</span>
                                                        <span>Status</span>
                                                    </div>
                                                    {[
                                                        { no: 'INV-2026-001', amount: 'Rp 12.000.000', status: 'Lunas' },
                                                        { no: 'INV-2026-002', amount: 'Rp 5.500.000', status: 'DP 50%' },
                                                        { no: 'INV-2026-003', amount: 'Rp 18.000.000', status: 'Pending' },
                                                    ].map((inv, i) => (
                                                        <div key={i} className="flex items-center justify-between text-[8px]" style={{ color: themeForm.app_text_color }}>
                                                            <span className="font-mono">{inv.no}</span>
                                                            <span style={{ color: themeForm.app_heading_color }} className="font-bold font-mono">{inv.amount}</span>
                                                            <span style={{ color: themeForm.primary_accent_color }} className="font-semibold text-[7px]">{inv.status}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <p style={{ color: themeForm.app_muted_text_color }} className="text-[7.5px] text-center pt-1">
                                                *Preview live otomatis menyesuaikan Title, Subtitle, Font, dan Warna yang Anda atur.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                                    <span className="font-bold text-slate-800 block">💡 Tips Kustomisasi:</span>
                                    <span>
                                        Setelah menekan <strong>Simpan Perubahan Tampilan</strong>, tema warna yang Anda pilih akan langsung diterapkan secara otomatis di seluruh sistem.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: KUSTOMISASI PORTAL KLIEN */}
            {activeTab === 'portal_theme' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Header Banner & Quick Actions */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-base font-bold text-slate-900">
                                    Kustomisasi Tema &amp; Tampilan Portal Klien
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-[#C98922] border border-amber-200 uppercase tracking-wider">
                                    Client Experience
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                                Sesuaikan warna latar belakang, navbar, banner hero selamat datang, kartu konten, warna teks, tipografi (font heading &amp; body), hingga tombol galeri yang dilihat oleh klien saat membuka portal.
                            </p>
                        </div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <button
                                type="button"
                                onClick={handleSyncPortalWithStudioBrand}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                title="Salin warna dari tema brand utama studio"
                            >
                                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                                <span>Samakan Brand Studio</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleResetPortalTheme}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset Default</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleSavePortalTheme}
                                style={{ backgroundColor: portalForm.portal_primary_accent || '#C98922' }}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <Save className="w-3.5 h-3.5" />
                                <span>Simpan Pengaturan Portal</span>
                            </button>
                        </div>
                    </div>

                    {/* Presets Cepat Pilihan */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-[#C98922]" />
                                    <span>Pilihan Preset Tema Portal Klien</span>
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Klik salah satu preset di bawah untuk menerapkan palet warna &amp; tipografi yang telah dikurasi.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
                            {portalPresets.map((preset) => {
                                const isSelected = portalForm.portal_preset === preset.id;
                                return (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => handleApplyPortalPreset(preset)}
                                        className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-2.5 ${
                                            isSelected
                                                ? 'border-[#C98922] bg-amber-50/40 ring-2 ring-[#C98922]/20 shadow-xs'
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                                {preset.badge}
                                            </span>
                                            {isSelected && (
                                                <span className="w-4 h-4 rounded-full bg-[#C98922] text-white flex items-center justify-center text-[10px] font-bold">
                                                    ✓
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{preset.name}</h4>
                                            <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{preset.description}</p>
                                        </div>

                                        {/* Color preview circles */}
                                        <div className="flex items-center gap-1.5 pt-1">
                                            <span
                                                style={{ backgroundColor: preset.portal_bg_color }}
                                                className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                                                title="Background"
                                            />
                                            <span
                                                style={{ backgroundColor: preset.portal_nav_bg }}
                                                className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                                                title="Navbar"
                                            />
                                            <span
                                                style={{ backgroundColor: preset.portal_hero_bg }}
                                                className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                                                title="Hero"
                                            />
                                            <span
                                                style={{ backgroundColor: preset.portal_primary_accent }}
                                                className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                                                title="Accent"
                                            />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2-Column Grid: Form Controls (Left) vs Live Interactive Preview (Right) */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                        {/* LEFT COLUMN: Controls Form (7 Cols) */}
                        <div className="xl:col-span-7 space-y-5">
                            <form onSubmit={handleSavePortalTheme} className="space-y-5">
                                {/* CARD 1: Latar Belakang & Canvas Portal */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                            <Paintbrush className="w-3.5 h-3.5 text-[#C98922]" />
                                            <span>1. Latar Belakang (Canvas Portal)</span>
                                        </h3>
                                        <span className="text-[11px] text-slate-400">Background Keseluruhan</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Warna Solid Background
                                            </label>
                                            <div className="flex items-center gap-2.5">
                                                <input
                                                    type="color"
                                                    value={portalForm.portal_bg_color || '#FDFBF7'}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_bg_color: e.target.value })}
                                                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={portalForm.portal_bg_color}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_bg_color: e.target.value })}
                                                    placeholder="#FDFBF7"
                                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 uppercase focus:border-[#C98922]"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Gradien Background (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                value={portalForm.portal_bg_gradient}
                                                onChange={(e) => setPortalForm({ ...portalForm, portal_bg_gradient: e.target.value })}
                                                placeholder="linear-gradient(135deg, #1C132E 0%, #0E091E 100%)"
                                                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:border-[#C98922]"
                                            />
                                        </div>
                                    </div>

                                    {/* Preset Gradients */}
                                    <div className="pt-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                            Pilihan Cepat Gradien Background:
                                        </span>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {[
                                                { label: 'Solid Default', val: '' },
                                                { label: 'Soft Ivory Mesh', val: 'radial-gradient(circle at top, #FFFDF9 0%, #F5EFEB 100%)' },
                                                { label: 'Dark Obsidian', val: 'linear-gradient(180deg, #0B0616 0%, #150E28 100%)' },
                                                { label: 'Navy Sapphire', val: 'linear-gradient(180deg, #F0F4F8 0%, #E2E8F0 100%)' },
                                            ].map((g, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setPortalForm({ ...portalForm, portal_bg_gradient: g.val })}
                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                                                        portalForm.portal_bg_gradient === g.val
                                                            ? 'border-[#C98922] bg-amber-50 text-[#C98922] font-bold'
                                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {g.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* CARD 2: Header Navigasi & Navbar */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                            <Menu className="w-3.5 h-3.5 text-[#C98922]" />
                                            <span>2. Header &amp; Navigasi Portal</span>
                                        </h3>
                                        <span className="text-[11px] text-slate-400">Bar Navigasi Atas</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Latar Navbar
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={portalForm.portal_nav_bg || '#FFFFFF'}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_nav_bg: e.target.value })}
                                                    className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={portalForm.portal_nav_bg}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_nav_bg: e.target.value })}
                                                    className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 uppercase"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Warna Teks &amp; Logo
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={portalForm.portal_nav_text_color || '#0F172A'}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_nav_text_color: e.target.value })}
                                                    className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={portalForm.portal_nav_text_color}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_nav_text_color: e.target.value })}
                                                    className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 uppercase"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Garis Batas Bawah
                                            </label>
                                            <input
                                                type="text"
                                                value={portalForm.portal_nav_border_color}
                                                onChange={(e) => setPortalForm({ ...portalForm, portal_nav_border_color: e.target.value })}
                                                placeholder="rgba(226, 232, 240, 0.8)"
                                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* CARD 3: Banner Hero Selamat Datang */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                            <Sparkles className="w-3.5 h-3.5 text-[#C98922]" />
                                            <span>3. Banner Hero Selamat Datang</span>
                                        </h3>
                                        <span className="text-[11px] text-slate-400">Card Utama Beranda</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Gradien Banner Hero
                                            </label>
                                            <input
                                                type="text"
                                                value={portalForm.portal_hero_gradient}
                                                onChange={(e) => setPortalForm({ ...portalForm, portal_hero_gradient: e.target.value })}
                                                placeholder="linear-gradient(135deg, #1C132E 0%, #0E091E 100%)"
                                                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:border-[#C98922]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Warna Teks Hero
                                            </label>
                                            <div className="flex items-center gap-2.5">
                                                <input
                                                    type="color"
                                                    value={portalForm.portal_hero_text_color || '#FFFFFF'}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_hero_text_color: e.target.value })}
                                                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={portalForm.portal_hero_text_color}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_hero_text_color: e.target.value })}
                                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 uppercase"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CARD 4: Kartu Konten & Box Alur Kerja */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                            <Layers className="w-3.5 h-3.5 text-[#C98922]" />
                                            <span>4. Kartu Konten (Cards &amp; Containers)</span>
                                        </h3>
                                        <span className="text-[11px] text-slate-400">Card File, Stepper, &amp; Invoice</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Latar Belakang Kartu
                                            </label>
                                            <div className="flex items-center gap-2.5">
                                                <input
                                                    type="color"
                                                    value={portalForm.portal_card_bg.startsWith('#') ? portalForm.portal_card_bg : '#FFFFFF'}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_card_bg: e.target.value })}
                                                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={portalForm.portal_card_bg}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_card_bg: e.target.value })}
                                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Garis Batas Kartu (Border)
                                            </label>
                                            <input
                                                type="text"
                                                value={portalForm.portal_card_border}
                                                onChange={(e) => setPortalForm({ ...portalForm, portal_card_border: e.target.value })}
                                                placeholder="rgba(226, 232, 240, 0.8)"
                                                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* CARD 5: Warna Aksen Utama & Tombol */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                            <Palette className="w-3.5 h-3.5 text-[#C98922]" />
                                            <span>5. Warna Aksen Utama &amp; Tombol Aksi</span>
                                        </h3>
                                        <span className="text-[11px] text-slate-400">Tombol Drive, Badge, &amp; Icon</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Warna Aksen Utama
                                            </label>
                                            <div className="flex items-center gap-2.5">
                                                <input
                                                    type="color"
                                                    value={portalForm.portal_primary_accent || '#C98922'}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_primary_accent: e.target.value })}
                                                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={portalForm.portal_primary_accent}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_primary_accent: e.target.value })}
                                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 uppercase"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Gradien Tombol Aksi (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                value={portalForm.portal_accent_gradient}
                                                onChange={(e) => setPortalForm({ ...portalForm, portal_accent_gradient: e.target.value })}
                                                placeholder="linear-gradient(135deg, #C98922 0%, #A6702E 100%)"
                                                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-800"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* CARD 6: Tipografi & Warna Teks Portal */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                            <Type className="w-3.5 h-3.5 text-[#C98922]" />
                                            <span>6. Tipografi &amp; Warna Teks Portal</span>
                                        </h3>
                                        <span className="text-[11px] text-slate-400">Font &amp; Warna Huruf</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Font Judul &amp; Heading
                                            </label>
                                            <select
                                                value={portalForm.portal_font_heading}
                                                onChange={(e) => setPortalForm({ ...portalForm, portal_font_heading: e.target.value })}
                                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 bg-white focus:border-[#C98922]"
                                            >
                                                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Clean)</option>
                                                <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                                                <option value="Cinzel">Cinzel (Regal Classic Serif)</option>
                                                <option value="Cormorant Garamond">Cormorant Garamond (Editorial Elegance)</option>
                                                <option value="Outfit">Outfit (Contemporary Brand)</option>
                                                <option value="Inter">Inter (Swiss Minimalist)</option>
                                                <option value="Montserrat">Montserrat (Geometric Bold)</option>
                                                <option value="Manrope">Manrope (Clean Tech)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Font Isi &amp; Body Teks
                                            </label>
                                            <select
                                                value={portalForm.portal_font_body}
                                                onChange={(e) => setPortalForm({ ...portalForm, portal_font_body: e.target.value })}
                                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 bg-white focus:border-[#C98922]"
                                            >
                                                <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                                                <option value="Inter">Inter</option>
                                                <option value="Outfit">Outfit</option>
                                                <option value="Manrope">Manrope</option>
                                                <option value="Roboto">Roboto</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Text Color Controls */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Warna Judul
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={portalForm.portal_heading_color || '#0F172A'}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_heading_color: e.target.value })}
                                                    className="w-8 h-8 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={portalForm.portal_heading_color}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_heading_color: e.target.value })}
                                                    className="flex-1 px-2 py-1.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 uppercase"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Warna Teks Isi
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={portalForm.portal_text_color || '#334155'}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_text_color: e.target.value })}
                                                    className="w-8 h-8 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={portalForm.portal_text_color}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_text_color: e.target.value })}
                                                    className="flex-1 px-2 py-1.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 uppercase"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Warna Teks Redup
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={portalForm.portal_muted_color || '#64748B'}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_muted_color: e.target.value })}
                                                    className="w-8 h-8 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={portalForm.portal_muted_color}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_muted_color: e.target.value })}
                                                    className="flex-1 px-2 py-1.5 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 uppercase"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CARD 7: Footer Portal */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                            <Globe className="w-3.5 h-3.5 text-[#C98922]" />
                                            <span>7. Footer Portal Klien</span>
                                        </h3>
                                        <span className="text-[11px] text-slate-400">Bagian Bawah Halaman</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Latar Footer
                                            </label>
                                            <div className="flex items-center gap-2.5">
                                                <input
                                                    type="color"
                                                    value={portalForm.portal_footer_bg || '#FFFFFF'}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_footer_bg: e.target.value })}
                                                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={portalForm.portal_footer_bg}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_footer_bg: e.target.value })}
                                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 uppercase"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Warna Teks Footer
                                            </label>
                                            <div className="flex items-center gap-2.5">
                                                <input
                                                    type="color"
                                                    value={portalForm.portal_footer_text || '#475569'}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_footer_text: e.target.value })}
                                                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={portalForm.portal_footer_text}
                                                    onChange={(e) => setPortalForm({ ...portalForm, portal_footer_text: e.target.value })}
                                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 uppercase"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Sticky Save Bar */}
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>Perubahan akan langsung berlaku pada URL <strong>/portal</strong> &amp; <strong>/client/projects</strong>.</span>
                                    </div>
                                    <button
                                        type="submit"
                                        style={{ backgroundColor: portalForm.portal_primary_accent || '#C98922' }}
                                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Simpan Pengaturan Portal</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* RIGHT COLUMN: Interactive Live Real-Time Preview (5 Cols) */}
                        <div className="xl:col-span-5 sticky top-24 space-y-4">
                            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-[#C98922]" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                            Live Preview Portal Klien
                                        </h3>
                                    </div>
                                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                                        <button
                                            type="button"
                                            onClick={() => setPortalPreviewTab('dashboard')}
                                            className={`px-2.5 py-1 rounded-md transition-all ${
                                                portalPreviewTab === 'dashboard'
                                                    ? 'bg-white text-slate-900 shadow-xs'
                                                    : 'text-slate-500 hover:text-slate-800'
                                            }`}
                                        >
                                            Beranda
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPortalPreviewTab('project_detail')}
                                            className={`px-2.5 py-1 rounded-md transition-all ${
                                                portalPreviewTab === 'project_detail'
                                                    ? 'bg-white text-slate-900 shadow-xs'
                                                    : 'text-slate-500 hover:text-slate-800'
                                            }`}
                                        >
                                            Detail Project
                                        </button>
                                    </div>
                                </div>

                                {/* PREVIEW MOCKUP CONTAINER */}
                                <div
                                    style={{
                                        background: portalForm.portal_bg_gradient || portalForm.portal_bg_color || '#FDFBF7',
                                        color: portalForm.portal_text_color || '#334155',
                                        fontFamily: `${portalForm.portal_font_body || 'Plus Jakarta Sans'}, sans-serif`,
                                    }}
                                    className="rounded-2xl border border-slate-200/80 p-3 sm:p-4 space-y-3.5 shadow-inner transition-all overflow-hidden"
                                >
                                    {/* Mock Portal Header */}
                                    <div
                                        style={{
                                            background: portalForm.portal_nav_bg || '#FFFFFF',
                                            color: portalForm.portal_nav_text_color || '#0F172A',
                                            borderColor: portalForm.portal_nav_border_color || 'rgba(226, 232, 240, 0.8)',
                                        }}
                                        className="p-2.5 rounded-xl border flex items-center justify-between gap-2 shadow-2xs"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                style={{ borderColor: portalForm.portal_primary_accent || '#C98922' }}
                                                className="w-6 h-6 rounded-full border flex items-center justify-center bg-white shadow-2xs"
                                            >
                                                <span
                                                    style={{
                                                        color: portalForm.portal_primary_accent || '#C98922',
                                                        fontFamily: `${portalForm.portal_font_heading || 'Plus Jakarta Sans'}, serif`,
                                                    }}
                                                    className="font-serif italic font-bold text-[9px]"
                                                >
                                                    ap
                                                </span>
                                            </div>
                                            <span
                                                style={{
                                                    fontFamily: `${portalForm.portal_font_heading || 'Plus Jakarta Sans'}, serif`,
                                                    color: portalForm.portal_nav_text_color || '#0F172A',
                                                }}
                                                className="text-[11px] font-extrabold uppercase tracking-wider"
                                            >
                                                ARAMS PICTURES
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <span
                                                style={{
                                                    backgroundColor: `${portalForm.portal_primary_accent || '#C98922'}20`,
                                                    color: portalForm.portal_primary_accent || '#C98922',
                                                }}
                                                className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                                            >
                                                Beranda
                                            </span>
                                            <span style={{ color: portalForm.portal_muted_color }} className="text-[9px]">
                                                Project Saya
                                            </span>
                                        </div>
                                    </div>

                                    {/* Mock Hero Banner */}
                                    <div
                                        style={{
                                            background: portalForm.portal_hero_gradient || portalForm.portal_hero_bg || '#1C132E',
                                            color: portalForm.portal_hero_text_color || '#FFFFFF',
                                        }}
                                        className="p-4 rounded-2xl relative overflow-hidden shadow-xs space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span
                                                style={{
                                                    backgroundColor: portalForm.portal_primary_accent || '#C98922',
                                                    color: '#000000',
                                                }}
                                                className="px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider"
                                            >
                                                ROYAL WEDDING 2026
                                            </span>
                                            <span className="text-[9px] opacity-75">PRJ-2608-0001</span>
                                        </div>

                                        <div>
                                            <h4
                                                style={{
                                                    fontFamily: `${portalForm.portal_font_heading || 'Plus Jakarta Sans'}, serif`,
                                                }}
                                                className="text-sm font-bold leading-tight"
                                            >
                                                Selamat Datang, Sarah &amp; Andi
                                            </h4>
                                            <p className="text-[10px] opacity-80 mt-0.5 line-clamp-1">
                                                Abadikan momen berharga pernikahan Anda bersama tim sinema studio kami.
                                            </p>
                                        </div>

                                        <div className="pt-1 flex items-center gap-2">
                                            <button
                                                type="button"
                                                style={{
                                                    backgroundColor: portalForm.portal_primary_accent || '#C98922',
                                                    color: '#000000',
                                                }}
                                                className="px-3 py-1 rounded-lg text-[9px] font-bold shadow-xs cursor-pointer"
                                            >
                                                Lihat Galeri Foto
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mock Card 1: Stepper Workflow */}
                                    <div
                                        style={{
                                            background: portalForm.portal_card_bg || '#FFFFFF',
                                            borderColor: portalForm.portal_card_border || 'rgba(226, 232, 240, 0.8)',
                                        }}
                                        className="p-3.5 rounded-2xl border shadow-2xs space-y-2.5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span
                                                style={{
                                                    color: portalForm.portal_heading_color || '#0F172A',
                                                    fontFamily: `${portalForm.portal_font_heading || 'Plus Jakarta Sans'}, sans-serif`,
                                                }}
                                                className="text-[10px] font-bold uppercase tracking-wider"
                                            >
                                                ALUR PROGRESS PENGERJAAN
                                            </span>
                                            <span
                                                style={{
                                                    color: portalForm.portal_primary_accent || '#C98922',
                                                    backgroundColor: `${portalForm.portal_primary_accent || '#C98922'}15`,
                                                }}
                                                className="px-2 py-0.5 rounded-full text-[8px] font-bold"
                                            >
                                                Tahap 4 dari 8
                                            </span>
                                        </div>

                                        {/* Stepper circles */}
                                        <div className="flex items-center justify-between gap-1 pt-1">
                                            {[
                                                { label: 'Booking', done: true },
                                                { label: 'DP', done: true },
                                                { label: 'Hari H', done: true },
                                                { label: 'Editing', active: true },
                                                { label: 'Delivery', done: false },
                                            ].map((s, idx) => (
                                                <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                                                    <div
                                                        style={
                                                            s.done || s.active
                                                                ? {
                                                                      backgroundColor: portalForm.portal_primary_accent || '#C98922',
                                                                      color: '#FFFFFF',
                                                                  }
                                                                : {
                                                                      backgroundColor: '#E2E8F0',
                                                                      color: '#64748B',
                                                                  }
                                                        }
                                                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shadow-2xs"
                                                    >
                                                        {s.done ? '✓' : idx + 1}
                                                    </div>
                                                    <span style={{ color: portalForm.portal_muted_color }} className="text-[8px] truncate max-w-[45px]">
                                                        {s.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Mock Card 2: Google Drive Download Deliverables */}
                                    <div
                                        style={{
                                            background: portalForm.portal_card_bg || '#FFFFFF',
                                            borderColor: portalForm.portal_card_border || 'rgba(226, 232, 240, 0.8)',
                                        }}
                                        className="p-3.5 rounded-2xl border shadow-2xs space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">📁</span>
                                                <div>
                                                    <h5
                                                        style={{
                                                            color: portalForm.portal_heading_color || '#0F172A',
                                                            fontFamily: `${portalForm.portal_font_heading || 'Plus Jakarta Sans'}, sans-serif`,
                                                        }}
                                                        className="text-[11px] font-bold"
                                                    >
                                                        Preview Foto (Low Resolution)
                                                    </h5>
                                                    <span className="text-[9px] text-emerald-600 font-bold">
                                                        Aktif s.d. 4 Jun 2028
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                style={{
                                                    backgroundColor: portalForm.portal_primary_accent || '#C98922',
                                                    color: '#FFFFFF',
                                                }}
                                                className="px-2.5 py-1 rounded-lg text-[9px] font-bold shadow-2xs cursor-pointer flex items-center gap-1"
                                            >
                                                <span>Buka GDrive</span>
                                                <span>↗</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mock Footer */}
                                    <div
                                        style={{
                                            backgroundColor: portalForm.portal_footer_bg || '#FFFFFF',
                                            color: portalForm.portal_footer_text || '#475569',
                                        }}
                                        className="p-2.5 rounded-xl text-center text-[8.5px] border border-slate-200/60"
                                    >
                                        <span>© 2026 Arams Pictures • All rights reserved</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: BACKUP & DATA */}
            {activeTab === 'backup' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Card 1: Backup Database */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-2xs">
                                    <CloudDownload className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900">Backup Database (JSON)</h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Unduh snapshot lengkap database (Klien, Project, Finansial, Pengaturan) dalam format JSON terenkripsi.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <a
                                    href="/settings/backup/download"
                                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download Backup Sekarang</span>
                                </a>
                            </div>
                        </div>

                        {/* Card 2: Export Data CSV */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-2xs">
                                    <FileSpreadsheet className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900">Export ke Excel / CSV</h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Ekspor laporan tabular data Klien, Daftar Project, atau Rekap Pembayaran ke format spreadsheet.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                                <div className="grid grid-cols-3 gap-2">
                                    <a
                                        href="/settings/export/clients"
                                        className="py-2 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 text-center transition-colors"
                                    >
                                        Klien
                                    </a>
                                    <a
                                        href="/settings/export/projects"
                                        className="py-2 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 text-center transition-colors"
                                    >
                                        Project
                                    </a>
                                    <a
                                        href="/settings/export/payments"
                                        className="py-2 px-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 text-center transition-colors"
                                    >
                                        Keuangan
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Log Aktivitas */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 shadow-2xs">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900">Audit & Log Aktivitas</h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Pantau setiap perubahan data, upload file, update status project, dan tindakan user secara real-time.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <Link
                                    href="/activity-log"
                                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md shadow-slate-900/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <History className="w-4 h-4" />
                                    <span>Buka Log Aktivitas</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Riwayat Backup Table */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Riwayat Snapshot Backup Terakhir</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Daftar arsip pencadangan database sistem</p>
                            </div>
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                                Status: Aman & Terproteksi
                            </span>
                        </div>

                        <div className="divide-y divide-slate-100 text-xs">
                            <div className="py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <Database className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-800 block font-mono">lensaria_backup_2026-08-27_full.json</span>
                                        <span className="text-[11px] text-slate-400">Dibuat otomatis oleh Sistem • 1.4 MB</span>
                                    </div>
                                </div>
                                <a
                                    href="/settings/backup/download"
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <Download className="w-3 h-3" /> Unduh
                                </a>
                            </div>

                            <div className="py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                        <Database className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-800 block font-mono">lensaria_backup_2026-08-20_weekly.json</span>
                                        <span className="text-[11px] text-slate-400">Dibuat oleh Admin Lensaria • 1.2 MB</span>
                                    </div>
                                </div>
                                <a
                                    href="/settings/backup/download"
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <Download className="w-3 h-3" /> Unduh
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 1: PREFERENSI SISTEM */}
            {/* ========================================================================= */}
            {activeModal === 'preferences' && (() => {
                const sampleDateStr = prefForm.date_format === 'DD/MM/YYYY'
                    ? '27/08/2026'
                    : prefForm.date_format === 'DD MMM YYYY'
                    ? '27 Agu 2026'
                    : '2026-08-27';

                return (
                    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
                            {/* Modal Header (Fixed) */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                                        <Sliders className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">Preferensi Sistem & Mata Uang</h3>
                                        <p className="text-[11px] text-slate-500">Format visual mata uang, angka, dan tanggal transaksi</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSaveModalSettings(prefForm);
                                }}
                                className="flex flex-col flex-1 overflow-hidden"
                            >
                                {/* Scrollable Form Body */}
                                <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                                    {/* Live Preview Card */}
                                    <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/70 space-y-1.5">
                                        <span className="text-[10px] font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                            Live Preview Format Tampilan
                                        </span>
                                        <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-blue-200/80">
                                            <div>
                                                <span className="text-[10px] text-slate-400 font-semibold block">Format Nominal Uang:</span>
                                                <span className="text-xs font-bold text-slate-900 font-mono">
                                                    {prefForm.currency_symbol} 15.500.000 ({prefForm.currency})
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] text-slate-400 font-semibold block">Format Tanggal:</span>
                                                <span className="text-xs font-bold text-slate-900 font-mono">
                                                    {sampleDateStr}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1.5">Mata Uang</label>
                                            <select
                                                value={prefForm.currency}
                                                onChange={(e) => {
                                                    const curr = e.target.value;
                                                    const symb = curr === 'USD' ? '$' : curr === 'SGD' ? 'S$' : 'Rp';
                                                    setPrefForm({ ...prefForm, currency: curr, currency_symbol: symb });
                                                }}
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#E8630A]"
                                            >
                                                <option value="IDR">IDR - Indonesian Rupiah</option>
                                                <option value="USD">USD - US Dollar</option>
                                                <option value="SGD">SGD - Singapore Dollar</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1.5">Simbol Mata Uang</label>
                                            <input
                                                type="text"
                                                value={prefForm.currency_symbol}
                                                onChange={(e) => setPrefForm({ ...prefForm, currency_symbol: e.target.value })}
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#E8630A] font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1.5">Format Tanggal Tampilan</label>
                                        <select
                                            value={prefForm.date_format}
                                            onChange={(e) => setPrefForm({ ...prefForm, date_format: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#E8630A]"
                                        >
                                            <option value="DD/MM/YYYY">DD/MM/YYYY (Contoh: 27/08/2026)</option>
                                            <option value="DD MMM YYYY">DD MMM YYYY (Contoh: 27 Agu 2026)</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD (Contoh: 2026-08-27)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1.5">Bahasa Sistem</label>
                                        <select
                                            value={prefForm.language}
                                            onChange={(e) => setPrefForm({ ...prefForm, language: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#E8630A]"
                                        >
                                            <option value="id">Bahasa Indonesia</option>
                                            <option value="en">English (US)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Modal Footer (Fixed) */}
                                <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setActiveModal(null)}
                                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-xl bg-primary-accent text-white font-bold shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                                    >
                                        Simpan Preferensi
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            })()}

            {/* ========================================================================= */}
            {/* MODAL 2: PENOMORAN OTOMATIS */}
            {/* ========================================================================= */}
            {activeModal === 'numbering' && (() => {
                const samplePad = (num: number, len: number) => String(num).padStart(Math.max(1, len || 4), '0');
                const padLen = parseInt(numForm.invoice_padding, 10) || 4;
                const invPreview = (numForm.invoice_format || 'INV-{YEAR}-{MONTH}-{NUMBER}')
                    .replace(/\{PREFIX\}/g, numForm.invoice_prefix || 'INV')
                    .replace(/\{YEAR\}/g, '2026')
                    .replace(/\{YY\}/g, '26')
                    .replace(/\{MONTH\}/g, '08')
                    .replace(/\{MM\}/g, '08')
                    .replace(/\{NUMBER\}/g, samplePad(1, padLen));

                const prjPreview = (numForm.project_format || 'PRJ-{YY}{MM}-{NUMBER}')
                    .replace(/\{PREFIX\}/g, numForm.project_prefix || 'PRJ')
                    .replace(/\{YEAR\}/g, '2026')
                    .replace(/\{YY\}/g, '26')
                    .replace(/\{MONTH\}/g, '08')
                    .replace(/\{MM\}/g, '08')
                    .replace(/\{NUMBER\}/g, samplePad(1, padLen));

                const payPreview = (numForm.payment_format || 'PAY-{YY}{MM}-{NUMBER}')
                    .replace(/\{PREFIX\}/g, numForm.payment_prefix || 'PAY')
                    .replace(/\{YEAR\}/g, '2026')
                    .replace(/\{YY\}/g, '26')
                    .replace(/\{MONTH\}/g, '08')
                    .replace(/\{MM\}/g, '08')
                    .replace(/\{NUMBER\}/g, samplePad(1, padLen));

                return (
                    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
                            {/* Modal Header (Fixed) */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
                                        <Hash className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">Format Penomoran Dokumen</h3>
                                        <p className="text-[11px] text-slate-500">Pola nomor otomatis untuk Project, Invoice & Pembayaran</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSaveModalSettings(numForm);
                                }}
                                className="flex flex-col flex-1 overflow-hidden"
                            >
                                {/* Scrollable Form Body */}
                                <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                                    {/* Live Preview Box */}
                                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                                Live Preview Contoh Hasil Nomor
                                            </span>
                                            <span className="text-[10px] text-amber-700 font-medium">Auto-generate real-time</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                                            <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 shadow-2xs">
                                                <span className="text-[10px] text-slate-400 font-semibold block">Contoh No. Project:</span>
                                                <span className="text-xs font-bold font-mono text-slate-900 mt-0.5 block tracking-tight truncate">
                                                    {prjPreview}
                                                </span>
                                            </div>
                                            <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 shadow-2xs">
                                                <span className="text-[10px] text-slate-400 font-semibold block">Contoh No. Invoice:</span>
                                                <span className="text-xs font-bold font-mono text-slate-900 mt-0.5 block tracking-tight truncate">
                                                    {invPreview}
                                                </span>
                                            </div>
                                            <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 shadow-2xs">
                                                <span className="text-[10px] text-slate-400 font-semibold block">Contoh No. Pembayaran:</span>
                                                <span className="text-xs font-bold font-mono text-slate-900 mt-0.5 block tracking-tight truncate">
                                                    {payPreview}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Padding Digit & Prefixes */}
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1.5">
                                                Prefix Project
                                            </label>
                                            <input
                                                type="text"
                                                value={numForm.project_prefix}
                                                onChange={(e) => setNumForm({ ...numForm, project_prefix: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20 transition-all font-mono"
                                                placeholder="PRJ"
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1.5">
                                                Prefix Invoice
                                            </label>
                                            <input
                                                type="text"
                                                value={numForm.invoice_prefix}
                                                onChange={(e) => setNumForm({ ...numForm, invoice_prefix: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20 transition-all font-mono"
                                                placeholder="INV"
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1.5">
                                                Prefix Bayar
                                            </label>
                                            <input
                                                type="text"
                                                value={numForm.payment_prefix}
                                                onChange={(e) => setNumForm({ ...numForm, payment_prefix: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20 transition-all font-mono"
                                                placeholder="PAY"
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1.5">
                                                Padding Digit
                                            </label>
                                            <input
                                                type="number"
                                                min="3"
                                                max="8"
                                                value={numForm.invoice_padding}
                                                onChange={(e) => setNumForm({ ...numForm, invoice_padding: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20 transition-all font-mono"
                                                placeholder="4"
                                            />
                                        </div>
                                    </div>

                                    {/* Format Templates */}
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1.5">
                                                Format Template Project
                                            </label>
                                            <input
                                                type="text"
                                                value={numForm.project_format}
                                                onChange={(e) => setNumForm({ ...numForm, project_format: e.target.value })}
                                                className="w-full px-3.5 py-2 font-mono bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20 transition-all text-slate-800"
                                                placeholder="PRJ-{YY}{MM}-{NUMBER}"
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1.5">
                                                Format Template Invoice
                                            </label>
                                            <input
                                                type="text"
                                                value={numForm.invoice_format}
                                                onChange={(e) => setNumForm({ ...numForm, invoice_format: e.target.value })}
                                                className="w-full px-3.5 py-2 font-mono bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20 transition-all text-slate-800"
                                                placeholder="INV-{YEAR}-{MONTH}-{NUMBER}"
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-1.5">
                                                Format Template Pembayaran
                                            </label>
                                            <input
                                                type="text"
                                                value={numForm.payment_format}
                                                onChange={(e) => setNumForm({ ...numForm, payment_format: e.target.value })}
                                                className="w-full px-3.5 py-2 font-mono bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#E8630A] focus:ring-2 focus:ring-[#E8630A]/20 transition-all text-slate-800"
                                                placeholder="PAY-{YY}{MM}-{NUMBER}"
                                            />
                                        </div>
                                    </div>

                                    {/* Variable Guide (Static Explanation) */}
                                    <div className="pt-2 border-t border-slate-100">
                                        <span className="text-[11px] font-bold text-slate-700 block mb-2">
                                            Daftar Tag Variabel yang Bisa Digunakan:
                                        </span>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            <div className="bg-slate-50 border border-slate-200/80 p-2 rounded-xl text-center">
                                                <span className="font-bold text-[#E8630A] font-mono text-xs block">&#123;YEAR&#125;</span>
                                                <span className="text-[10px] text-slate-500 mt-0.5 block">Tahun 4 digit (2026)</span>
                                            </div>
                                            <div className="bg-slate-50 border border-slate-200/80 p-2 rounded-xl text-center">
                                                <span className="font-bold text-[#E8630A] font-mono text-xs block">&#123;YY&#125;</span>
                                                <span className="text-[10px] text-slate-500 mt-0.5 block">Tahun 2 digit (26)</span>
                                            </div>
                                            <div className="bg-slate-50 border border-slate-200/80 p-2 rounded-xl text-center">
                                                <span className="font-bold text-[#E8630A] font-mono text-xs block">&#123;MONTH&#125;</span>
                                                <span className="text-[10px] text-slate-500 mt-0.5 block">Bulan 2 digit (08)</span>
                                            </div>
                                            <div className="bg-slate-50 border border-slate-200/80 p-2 rounded-xl text-center">
                                                <span className="font-bold text-[#E8630A] font-mono text-xs block">&#123;NUMBER&#125;</span>
                                                <span className="text-[10px] text-slate-500 mt-0.5 block">Nomor urut otomatis</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-2.5 leading-normal">
                                            Nomor urut <code className="font-mono text-slate-600 bg-slate-100 px-1 py-0.5 rounded">&#123;NUMBER&#125;</code> akan bertambah otomatis secara berurutan setiap kali invoice atau project baru dibuat di sistem.
                                        </p>
                                    </div>
                                </div>

                                {/* Modal Footer (Fixed) */}
                                <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setActiveModal(null)}
                                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-xl bg-primary-accent text-white font-bold shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                                    >
                                        Simpan Format
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            })()}

            {/* ========================================================================= */}
            {/* MODAL 3: WORKFLOW & TIMELINE */}
            {/* ========================================================================= */}
            {activeModal === 'workflow' && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
                        {/* Modal Header (Fixed) */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Alur Workflow & Tahapan Project</h3>
                                    <p className="text-[11px] text-slate-500">Tahapan produksi standar & aturan revisi</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSaveModalSettings(workflowForm);
                            }}
                            className="flex flex-col flex-1 overflow-hidden"
                        >
                            {/* Scrollable Form Body */}
                            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                                <p className="text-slate-500">
                                    Urutan tahapan standar pengerjaan project di sistem Lensaria Photography:
                                </p>

                                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                                    {['1. Booking & DP Diterima', '2. Pra-Produksi / Preparation', '3. Hari Acara / Photoshoot', '4. Seleksi & Raw Transfer', '5. Color Grading & Editing', '6. Review & Revisi Klien', '7. Cetak Album / Merchandise', '8. Project Selesai & Pelunasan'].map((step, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-slate-800 font-semibold bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                            <span>{step}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1.5">Batas Maksimal Revisi</label>
                                        <input
                                            type="number"
                                            value={workflowForm.allow_client_revisions}
                                            onChange={(e) => setWorkflowForm({ ...workflowForm, allow_client_revisions: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#E8630A]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1.5">Approval Supervisor</label>
                                        <select
                                            value={workflowForm.require_supervisor_approval}
                                            onChange={(e) => setWorkflowForm({ ...workflowForm, require_supervisor_approval: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#E8630A]"
                                        >
                                            <option value="1">Wajib Disetujui</option>
                                            <option value="0">Otomatis Lolos</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer (Fixed) */}
                            <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                >
                                    Tutup
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-primary-accent text-white font-bold shadow-md cursor-pointer"
                                >
                                    Simpan Alur
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 4: HAK AKSES */}
            {/* ========================================================================= */}
            {activeModal === 'access' && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
                        {/* Modal Header (Fixed) */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-2xs">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Hak Akses Default Project</h3>
                                    <p className="text-[11px] text-slate-500">Perizinan fotografer & editor saat project dibuat</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSaveModalSettings(accessForm);
                            }}
                            className="flex flex-col flex-1 overflow-hidden"
                        >
                            {/* Scrollable Form Body */}
                            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={accessForm.editor_can_upload_deliverables === '1'}
                                            onChange={(e) => setAccessForm({ ...accessForm, editor_can_upload_deliverables: e.target.checked ? '1' : '0' })}
                                            className="w-4 h-4 rounded text-slate-800"
                                        />
                                        <div>
                                            <span className="font-bold text-slate-900 block">Editor dapat upload link Google Drive</span>
                                            <span className="text-[11px] text-slate-500">Izinkan tim editor memasukkan tautan hasil akhir project</span>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={accessForm.photographer_can_view_price === '1'}
                                            onChange={(e) => setAccessForm({ ...accessForm, photographer_can_view_price: e.target.checked ? '1' : '0' })}
                                            className="w-4 h-4 rounded text-slate-800"
                                        />
                                        <div>
                                            <span className="font-bold text-slate-900 block">Fotografer dapat melihat nilai invoice</span>
                                            <span className="text-[11px] text-slate-500">Tampilkan total harga project ke akun fotografer lapangan</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Modal Footer (Fixed) */}
                            <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-primary-accent text-white font-bold shadow-md cursor-pointer"
                                >
                                    Simpan Hak Akses
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 5: INTEGRASI GOOGLE DRIVE & STORAGE */}
            {/* ========================================================================= */}
            {activeModal === 'storage' && (() => {
                const sampleFolderPreview = (storageForm.gdrive_folder_template || 'Lensaria/{YEAR}/{CATEGORY}/{PROJECT_NAME}')
                    .replace(/\{YEAR\}/g, '2026')
                    .replace(/\{CATEGORY\}/g, 'Wedding')
                    .replace(/\{PROJECT_NAME\}/g, 'Andi_Sinta_Wedding')
                    .replace(/\{CLIENT_NAME\}/g, 'Andi_Pratama');

                return (
                    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
                            {/* Modal Header (Fixed) */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
                                        <HardDrive className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">Integrasi Link File & Google Drive</h3>
                                        <p className="text-[11px] text-slate-500">Struktur folder galeri dan masa aktif file</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSaveModalSettings(storageForm);
                                }}
                                className="flex flex-col flex-1 overflow-hidden"
                            >
                                {/* Scrollable Form Body */}
                                <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                                    {/* Live Preview Box */}
                                    <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/70 space-y-1.5">
                                        <span className="text-[10px] font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                            Contoh Struktur Folder Google Drive
                                        </span>
                                        <div className="bg-white p-2.5 rounded-lg border border-purple-200/80 font-mono text-slate-800 text-xs break-all">
                                            📁 {sampleFolderPreview}/
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1.5">Template Struktur Folder Google Drive</label>
                                        <input
                                            type="text"
                                            value={storageForm.gdrive_folder_template}
                                            onChange={(e) => setStorageForm({ ...storageForm, gdrive_folder_template: e.target.value })}
                                            className="w-full px-3.5 py-2.5 font-mono bg-white border border-slate-200 rounded-xl outline-hidden focus:border-slate-400 transition-all text-slate-800"
                                        />
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                                            <div className="bg-slate-50 border border-slate-200/80 p-1.5 rounded-lg text-center">
                                                <span className="font-bold text-slate-800 font-mono text-[11px] block">&#123;YEAR&#125;</span>
                                                <span className="text-[9.5px] text-slate-500 block">Tahun</span>
                                            </div>
                                            <div className="bg-slate-50 border border-slate-200/80 p-1.5 rounded-lg text-center">
                                                <span className="font-bold text-slate-800 font-mono text-[11px] block">&#123;CATEGORY&#125;</span>
                                                <span className="text-[9.5px] text-slate-500 block">Kategori</span>
                                            </div>
                                            <div className="bg-slate-50 border border-slate-200/80 p-1.5 rounded-lg text-center">
                                                <span className="font-bold text-slate-800 font-mono text-[11px] block">&#123;PROJECT_NAME&#125;</span>
                                                <span className="text-[9.5px] text-slate-500 block">Nama Project</span>
                                            </div>
                                            <div className="bg-slate-50 border border-slate-200/80 p-1.5 rounded-lg text-center">
                                                <span className="font-bold text-slate-800 font-mono text-[11px] block">&#123;CLIENT_NAME&#125;</span>
                                                <span className="text-[9.5px] text-slate-500 block">Nama Klien</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1.5">Masa Aktif Tautan Download Klien</label>
                                        <select
                                            value={storageForm.link_expiry_days}
                                            onChange={(e) => setStorageForm({ ...storageForm, link_expiry_days: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-hidden"
                                        >
                                            <option value="0">Selamanya (Tidak Ada Batas Waktu Kadaluarsa)</option>
                                            <option value="30">30 Hari setelah Project Selesai</option>
                                            <option value="90">90 Hari setelah Project Selesai</option>
                                            <option value="180">6 Bulan (180 Hari)</option>
                                            <option value="365">1 Tahun (365 Hari)</option>
                                            <option value="730">2 Tahun (730 Hari)</option>
                                            <option value="1095">3 Tahun (1095 Hari)</option>
                                        </select>
                                        <span className="text-[10px] text-slate-400 mt-1 block">Setelah masa aktif berakhir, link file akan otomatis dikunci demi keamanan storage.</span>
                                    </div>
                                </div>

                                {/* Modal Footer (Fixed) */}
                                <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setActiveModal(null)}
                                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-xl bg-primary-accent text-white font-bold shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                                    >
                                        Simpan Pengaturan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
