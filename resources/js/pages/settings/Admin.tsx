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
    PanelLeft,
    Layout,
    MessageSquareQuote,
    Instagram,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import SettingsTabNav, { SettingAdminSubTab } from '@/components/SettingsTabNav';
import { GradientBuilder, ColorSettingRow } from '@/components/settings/ThemeControls';
import { isDarkColor } from '@/lib/utils';

interface SettingsAdminProps {
    settings?: any;
    settingsMap?: Record<string, string>;
}

export default function AdminSettingsPage({ settings = {}, settingsMap = {} }: SettingsAdminProps) {
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const subParam = searchParams?.get('sub');

    const initialAdminSubTab: SettingAdminSubTab =
        (['company', 'general', 'appearance', 'login_theme', 'backup'].includes(subParam || '')
            ? (subParam as SettingAdminSubTab)
            : 'company');

    const [adminSubTab, setAdminSubTab] = useState<SettingAdminSubTab>(initialAdminSubTab);
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
        company_instagram: getVal('company_instagram', 'aramspictures'),
        company_tiktok: getVal('company_tiktok', 'aramspictures'),
        company_youtube: getVal('company_youtube', ''),
        company_facebook: getVal('company_facebook', ''),
        company_gdrive_url: getVal('company_gdrive_url', ''),
        company_website: getVal('company_website', 'https://www.arams.com'),
        company_address: getVal('company_address', 'Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan 12190'),
        company_city: getVal('company_city', 'Jakarta Selatan'),
        invoice_director_name: getVal('invoice_director_name', getVal('company_director_name', 'Aditya Pratama')),
        invoice_director_title: getVal('invoice_director_title', 'Direktur Utama / Finance Studio'),
        invoice_signature_city: getVal('invoice_signature_city', getVal('company_city', 'Jakarta Selatan')),
        timezone: getVal('timezone', '(GMT+07:00) Jakarta'),
        company_description: getVal('company_description', getVal('company_tagline', 'Jasa fotografi & videografi profesional untuk mengabadikan setiap momen berharga Anda dengan kualitas sinematik terbaik.')),
        company_operational_hours: getVal('company_operational_hours', 'Senin - Minggu, 09.00 - 18.00 WIB'),
        company_logo: getVal('company_logo', ''),
    });

    // Theme & Appearance Customization Form State
    const [themeForm, setThemeForm] = useState({
        theme_preset: getVal('theme_preset', 'arams_maroon_luxury'),
        company_subtitle: getVal('company_subtitle', 'STUDIO & CINEMA'),
        sidebar_bg_color: getVal('sidebar_bg_color', '#2E0F15'),
        sidebar_bg_gradient: getVal('sidebar_bg_gradient', 'linear-gradient(180deg, #2E0F15 0%, #200A0E 100%)'),
        sidebar_active_bg: getVal('sidebar_active_bg', '#4A151B'),
        sidebar_active_bg_gradient: getVal('sidebar_active_bg_gradient', ''),
        sidebar_active_text: getVal('sidebar_active_text', '#FFFFFF'),
        sidebar_text_color: getVal('sidebar_text_color', '#FDA4AF'),
        primary_accent_color: getVal('primary_accent_color', '#4A151B'),
        primary_accent_gradient: getVal('primary_accent_gradient', ''),
        app_bg_color: getVal('app_bg_color', '#FAF7F5'),
        app_bg_gradient: getVal('app_bg_gradient', ''),
        login_preset: getVal('login_preset', 'arams_maroon_luxury'),
        login_bg_color: getVal('login_bg_color', '#2E0F15'),
        login_bg_gradient: getVal('login_bg_gradient', 'linear-gradient(180deg, #2E0F15 0%, #200A0E 100%)'),
        login_card_bg: getVal('login_card_bg', '#380E13'),
        login_card_bg_gradient: getVal('login_card_bg_gradient', ''),
        login_accent_color: getVal('login_accent_color', '#4A151B'),
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
        header_search_bg: getVal('header_search_bg', ''),
        header_search_text: getVal('header_search_text', ''),
        card_heading_color: getVal('card_heading_color', '#1E293B'),
        report_primary_accent: getVal('report_primary_accent', getVal('primary_accent_color', '#3C0E0E')),
        report_revenue_color: getVal('report_revenue_color', getVal('primary_accent_color', '#3C0E0E')),
        report_projects_color: getVal('report_projects_color', '#10B981'),
        report_received_color: getVal('report_received_color', '#059669'),
        report_pending_color: getVal('report_pending_color', '#DC2626'),
    });

    const [previewMode, setPreviewMode] = useState<'dashboard' | 'projects' | 'master_data' | 'finance' | 'login' | 'reports'>('dashboard');
    const [adminSectionTab, setAdminSectionTab] = useState<'sidebar' | 'navbar' | 'main' | 'report'>('sidebar');

    // Curated Login Presets
    const loginPresets = [
        {
            id: 'arams_maroon_luxury',
            name: 'Arams Maroon Luxury (Default)',
            description: 'Deep Wine #2E0F15, Velvet Glow, Card #380E13 & Royal Maroon #4A151B',
            login_bg_color: '#2E0F15',
            login_bg_gradient: 'linear-gradient(180deg, #2E0F15 0%, #200A0E 100%)',
            login_card_bg: '#380E13',
            login_card_bg_gradient: '',
            login_accent_color: '#4A151B',
            login_tagline: 'STUDIO & CINEMA PHOTOGRAPHY SYSTEM',
            badge: 'Official Default',
        },
        {
            id: 'gradient_dark_purple_gold',
            name: 'Gradient Dark Purple & Champagne Gold',
            description: 'Dark Purple #1C132E -> #1A0F3F, Champagne Gold #C98922 & Pure White #FFFFFF (Solid Tanpa Gradient)',
            login_bg_color: '#1C132E',
            login_bg_gradient: 'linear-gradient(180deg, #1C132E 0%, #1A0F3F 100%)',
            login_card_bg: '#1C132E',
            login_card_bg_gradient: '',
            login_accent_color: '#C98922',
            login_tagline: 'LUXURY CINEMA & PHOTOGRAPHY SYSTEM',
            badge: 'Dark Purple × Gold',
        },
        {
            id: 'luxury_champagne',
            name: 'Arams Luxury Gold & Ivory',
            description: 'Dark Indigo #1C132E, Champagne Gold #C98922 & Warm Ivory Card #FAF7F5',
            login_bg_color: '#1C132E',
            login_bg_gradient: 'linear-gradient(135deg, #1C132E 0%, #0E091E 100%)',
            login_card_bg: '#FAF7F5',
            login_card_bg_gradient: '',
            login_accent_color: '#C98922',
            login_tagline: 'LUXURY WEDDING & PORTRAIT STUDIO',
            badge: 'Master Gold',
        },
        {
            id: 'midnight_cinema_dark',
            name: 'Midnight Cinema Dark Studio',
            description: 'Dark Obsidian #0B0616, Deep Card #1C132E & Radiant Gold #E5A93C',
            login_bg_color: '#0B0616',
            login_bg_gradient: 'linear-gradient(180deg, #0B0616 0%, #150E28 100%)',
            login_card_bg: '#1C132E',
            login_card_bg_gradient: '',
            login_accent_color: '#E5A93C',
            login_tagline: 'CINEMATIC VISUAL STORYTELLERS',
            badge: 'Dark Cinema',
        },
        {
            id: 'clean_minimalist_white',
            name: 'Clean Modern Slate & Ivory',
            description: 'Slate Charcoal #0F172A, Clean White Card #FFFFFF & Elegant Slate',
            login_bg_color: '#0F172A',
            login_bg_gradient: 'linear-gradient(135deg, #334155 0%, #0F172A 100%)',
            login_card_bg: '#FFFFFF',
            login_card_bg_gradient: '',
            login_accent_color: '#0F172A',
            login_tagline: 'CONTEMPORARY PHOTOGRAPHY STUDIO',
            badge: 'Minimalist',
        },
        {
            id: 'royal_sapphire_blue',
            name: 'Royal Sapphire & Diamond Blue',
            description: 'Deep Navy #070D18, Sapphire Blue #2563EB & Pure White Card',
            login_bg_color: '#070D18',
            login_bg_gradient: 'linear-gradient(135deg, #070D18 0%, #0D1E3A 100%)',
            login_card_bg: '#FFFFFF',
            login_card_bg_gradient: '',
            login_accent_color: '#2563EB',
            login_tagline: 'TIMELESS ELEGANCE IN EVERY FRAME',
            badge: 'Royal Blue',
        },
        {
            id: 'emerald_botanical_luxury',
            name: 'Emerald Prestige Botanical',
            description: 'Deep Forest #06120E, Sage Emerald #059669 & Warm Ivory Card',
            login_bg_color: '#06120E',
            login_bg_gradient: 'linear-gradient(135deg, #06120E 0%, #0B241C 100%)',
            login_card_bg: '#FFFFFF',
            login_card_bg_gradient: '',
            login_accent_color: '#059669',
            login_tagline: 'ORGANIC & TIMELESS LOVE STORIES',
            badge: 'Emerald',
        },
    ];

    // Curated Theme Presets
    const themePresets = [
        {
            id: 'arams_maroon_luxury',
            name: 'Arams Maroon Luxury (Default)',
            description: 'Dark Burgundy #3C0E0E, Warm Cream #F4EBE4 & Off-White #FBF6F0',
            sidebar_bg: '#3C0E0E',
            sidebar_bg_gradient: 'linear-gradient(180deg, #3C0E0E 0%, #2A0909 100%)',
            sidebar_active_bg: '#541515',
            sidebar_active_text: '#FFFFFF',
            sidebar_text_color: '#F4EBE4',
            primary_accent: '#3C0E0E',
            primary_accent_gradient: '',
            app_bg: '#FBF6F0',
            app_bg_gradient: '',
            app_heading_color: '#3C0E0E',
            app_text_color: '#334155',
            app_muted_text_color: '#7A6666',
            header_bg_color: '#FFFFFF',
            header_bg_gradient: '',
            header_text_color: '#3C0E0E',
            header_border_color: '#F4EBE4',
            breadcrumb_color: '#3C0E0E',
            breadcrumb_active_color: '#3C0E0E',
            card_heading_color: '#3C0E0E',
            login_bg: '#3C0E0E',
            login_bg_gradient: 'linear-gradient(180deg, #3C0E0E 0%, #2A0909 100%)',
            login_card_bg: '#4D1212',
            login_accent: '#3C0E0E',
            font_heading: 'Plus Jakarta Sans',
            font_body: 'Plus Jakarta Sans',
            badge: 'Official Default',
        },
        {
            id: 'gradient_dark_purple_gold',
            name: 'Gradient Dark Purple & Champagne Gold',
            description: 'Sidebar Gradient Dark Purple #1C132E -> #1A0F3F, Font Champagne Gold #C98922 & Pure White #FFFFFF (Solid Tanpa Gradient)',
            sidebar_bg: '#1C132E',
            sidebar_bg_gradient: 'linear-gradient(180deg, #1C132E 0%, #1A0F3F 100%)',
            sidebar_active_bg: '#C98922',
            sidebar_active_bg_gradient: '',
            sidebar_active_text: '#FFFFFF',
            sidebar_text_color: '#FFFFFF',
            primary_accent: '#C98922',
            primary_accent_gradient: '',
            app_bg: '#FAF7F5',
            app_bg_gradient: '',
            app_heading_color: '#C98922',
            app_text_color: '#1C132E',
            app_muted_text_color: '#64748B',
            header_bg_color: '#FFFFFF',
            header_bg_gradient: '',
            header_text_color: '#C98922',
            header_border_color: '#E2E8F0',
            breadcrumb_color: '#C98922',
            breadcrumb_active_color: '#1C132E',
            card_heading_color: '#C98922',
            login_bg: '#1C132E',
            login_bg_gradient: 'linear-gradient(180deg, #1C132E 0%, #1A0F3F 100%)',
            login_card_bg: '#1C132E',
            login_accent: '#C98922',
            font_heading: 'Plus Jakarta Sans',
            font_body: 'Plus Jakarta Sans',
            badge: 'Dark Purple × Gold',
        },
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
            badge: 'Master Purple',
        },
        {
            id: 'midnight_cinema_dark',
            name: 'Midnight Cinema Dark Studio',
            description: 'Dark Obsidian #0B0616, Deep Card #1C132E & Radiant Gold #E5A93C',
            sidebar_bg: '#0B0616',
            sidebar_bg_gradient: 'linear-gradient(180deg, #0B0616 0%, #150E28 100%)',
            sidebar_active_bg: '#E5A93C',
            sidebar_active_text: '#0B0616',
            primary_accent: '#E5A93C',
            app_bg: '#0E091E',
            app_bg_gradient: '',
            login_bg: '#0B0616',
            login_card_bg: '#1C132E',
            login_accent: '#E5A93C',
            font_heading: 'Playfair Display',
            font_body: 'Inter',
            badge: 'Dark Cinema',
        },
        {
            id: 'clean_minimalist_white',
            name: 'Clean Modern Slate & Ivory',
            description: 'Slate Charcoal #0F172A, Clean White Card #FFFFFF & Elegant Slate',
            sidebar_bg: '#0F172A',
            sidebar_bg_gradient: '',
            sidebar_active_bg: '#2563EB',
            sidebar_active_text: '#FFFFFF',
            primary_accent: '#2563EB',
            app_bg: '#F8FAFC',
            app_bg_gradient: '',
            login_bg: '#0F172A',
            login_card_bg: '#FFFFFF',
            login_accent: '#0F172A',
            font_heading: 'Inter',
            font_body: 'Inter',
            badge: 'Minimalist',
        },
        {
            id: 'royal_sapphire_blue',
            name: 'Royal Sapphire & Diamond Blue',
            description: 'Deep Navy #070D18, Sapphire Blue #2563EB & Pure White Card',
            sidebar_bg: '#070D18',
            sidebar_bg_gradient: 'linear-gradient(135deg, #070D18 0%, #0D1E3A 100%)',
            sidebar_active_bg: '#2563EB',
            sidebar_active_text: '#FFFFFF',
            primary_accent: '#2563EB',
            app_bg: '#F0F4F8',
            app_bg_gradient: '',
            login_bg: '#070D18',
            login_card_bg: '#FFFFFF',
            login_accent: '#2563EB',
            font_heading: 'Plus Jakarta Sans',
            font_body: 'Plus Jakarta Sans',
            badge: 'Royal Blue',
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
            report_primary_accent: preset.primary_accent,
            report_revenue_color: preset.primary_accent,
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
                header_search_bg: '',
                header_search_text: '',
                card_heading_color: '#1E293B',
                login_bg_color: defaultPreset.login_bg,
                login_card_bg: defaultPreset.login_card_bg,
                login_accent_color: defaultPreset.login_accent,
                login_tagline: 'STUDIO & CINEMA PHOTOGRAPHY SYSTEM',
                font_family_heading: defaultPreset.font_heading,
                font_family_body: defaultPreset.font_body,
                report_primary_accent: defaultPreset.primary_accent,
                report_revenue_color: defaultPreset.primary_accent,
                report_projects_color: '#10B981',
                report_received_color: '#059669',
                report_pending_color: '#DC2626',
            },
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Tema Berhasil Direset ke Default');
            },
        });
    };

    const handleApplyLoginPreset = (preset: (typeof loginPresets)[0]) => {
        setThemeForm({
            ...themeForm,
            login_preset: preset.id,
            login_bg_color: preset.login_bg_color,
            login_bg_gradient: preset.login_bg_gradient,
            login_card_bg: preset.login_card_bg,
            login_card_bg_gradient: preset.login_card_bg_gradient,
            login_accent_color: preset.login_accent_color,
            login_tagline: preset.login_tagline,
        });
        toast.info(`Preset Login "${preset.name}" Dipilih. Klik Simpan untuk menerapkan.`);
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
        gdrive_folder_template: getVal('gdrive_folder_template', 'Arams/{YEAR}/{CATEGORY}/{PROJECT_NAME}'),
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
        <div className="space-y-4 pb-2 w-full max-w-full">
            <Head title="Pengaturan Admin - Arams Photography" />

            {/* Header Title & Subtitle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1
                        className="text-2xl lg:text-3xl font-extrabold tracking-tight transition-colors"
                        style={{ color: themeForm.app_heading_color || 'var(--app-heading-color, #0F172A)' }}
                    >
                        Pengaturan Admin
                    </h1>
                    <p
                        className="text-sm mt-0.5 transition-colors"
                        style={{ color: themeForm.app_muted_text_color || 'var(--app-muted-color, #64748B)' }}
                    >
                        Kelola identitas perusahaan, preferensi sistem, penomoran dokumen, dan backup data studio.
                    </p>
                </div>
            </div>

            {/* Top Horizontal Navigation (Admin, Form Klien, Portal Klien) */}
            <SettingsTabNav
                activeMainTab="admin"
                activeAdminSubTab={adminSubTab}
                accentColor={themeForm.primary_accent_color || '#F05322'}
                onSelectAdminSubTab={(s) => {
                    setAdminSubTab(s);
                    if (s === 'appearance') {
                        if (previewMode === 'login') setPreviewMode('dashboard');
                    } else if (s === 'login_theme') {
                        setPreviewMode('login');
                    }
                    if (typeof window !== 'undefined') {
                        const newUrl = new URL(window.location.href);
                        newUrl.searchParams.set('sub', s);
                        window.history.replaceState({}, '', newUrl.toString());
                    }
                }}
            />

            {/* TAB 1: PROFIL PERUSAHAAN */}
            {adminSubTab === 'company' && (
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
                                            placeholder="Contoh: Arams Photography"
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
                                            placeholder="Contoh: PT Arams Kreatif Nusantara"
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

                                {/* Row 2b: Deskripsi Singkat Usaha (Ditampilkan pada Footer Portal Klien) */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Deskripsi Singkat Usaha (Ditampilkan pada Footer Portal Klien)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={form.company_description}
                                        onChange={(e) => setForm({ ...form, company_description: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20 outline-hidden transition-all"
                                        placeholder="Contoh: Jasa fotografi & videografi profesional untuk mengabadikan setiap momen berharga Anda dengan kualitas sinematik terbaik."
                                    />
                                </div>

                                {/* Row 3: Kontak Resmi (Email, No. Telepon, WhatsApp) */}
                                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                                    <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
                                        <Phone className="w-4 h-4 text-[#3C0E0E]" />
                                        <span className="text-xs font-bold text-slate-800">Kontak &amp; Komunikasi Studio</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                No. WhatsApp (Chat Klien)
                                            </label>
                                            <input
                                                type="text"
                                                value={form.company_whatsapp}
                                                onChange={(e) => setForm({ ...form, company_whatsapp: e.target.value })}
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20 outline-hidden transition-all"
                                                placeholder="+62 812-3456-7890"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                No. Telepon Studio
                                            </label>
                                            <input
                                                type="text"
                                                value={form.company_phone}
                                                onChange={(e) => setForm({ ...form, company_phone: e.target.value })}
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20 outline-hidden transition-all"
                                                placeholder="+62 812-3456-7890"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Email Resmi
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
                                </div>

                                {/* Row 4: Sosial Media & Cloud Storage */}
                                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                                    <div className="flex items-center gap-2 pb-1 border-b border-slate-200/60">
                                        <Instagram className="w-4 h-4 text-[#3C0E0E]" />
                                        <span className="text-xs font-bold text-slate-800">Media Sosial &amp; Cloud Drive</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Instagram (Username / URL)
                                            </label>
                                            <input
                                                type="text"
                                                value={form.company_instagram}
                                                onChange={(e) => setForm({ ...form, company_instagram: e.target.value })}
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20 outline-hidden transition-all"
                                                placeholder="@aramspictures atau https://instagram.com/aramspictures"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                TikTok (Username / URL)
                                            </label>
                                            <input
                                                type="text"
                                                value={form.company_tiktok}
                                                onChange={(e) => setForm({ ...form, company_tiktok: e.target.value })}
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20 outline-hidden transition-all"
                                                placeholder="@aramspictures atau https://tiktok.com/@aramspictures"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                YouTube Channel URL
                                            </label>
                                            <input
                                                type="text"
                                                value={form.company_youtube}
                                                onChange={(e) => setForm({ ...form, company_youtube: e.target.value })}
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20 outline-hidden transition-all"
                                                placeholder="https://youtube.com/@aramspictures"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Facebook Page URL
                                            </label>
                                            <input
                                                type="text"
                                                value={form.company_facebook}
                                                onChange={(e) => setForm({ ...form, company_facebook: e.target.value })}
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20 outline-hidden transition-all"
                                                placeholder="https://facebook.com/aramspictures"
                                            />
                                        </div>

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
                                                Google Drive Master / Client Link
                                            </label>
                                            <input
                                                type="text"
                                                value={form.company_gdrive_url}
                                                onChange={(e) => setForm({ ...form, company_gdrive_url: e.target.value })}
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20 outline-hidden transition-all"
                                                placeholder="https://drive.google.com/drive/folders/..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Row 5: Jam Operasional */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Jam Operasional (Ditampilkan pada Footer Portal Klien)
                                    </label>
                                    <input
                                        type="text"
                                        value={form.company_operational_hours}
                                        onChange={(e) => setForm({ ...form, company_operational_hours: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20 outline-hidden transition-all"
                                        placeholder="Senin - Minggu, 09.00 - 18.00 WIB"
                                    />
                                </div>

                                {/* Row 5: Alamat Lengkap & Kota */}
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

                                {/* Row 6: Penandatangan Dokumen & Invoice (TTD) */}
                                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-3">
                                    <div className="flex items-center gap-2 pb-1 border-b border-purple-200/60">
                                        <FileText className="w-4 h-4 text-[#5B21B6]" />
                                        <span className="text-xs font-bold text-slate-800">Penandatangan Invoice &amp; Dokumen Resmi (TTD)</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Nama Direktur / Penandatangan
                                            </label>
                                            <input
                                                type="text"
                                                value={form.invoice_director_name}
                                                onChange={(e) => setForm({ ...form, invoice_director_name: e.target.value })}
                                                className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 outline-hidden transition-all font-medium"
                                                placeholder="Contoh: Aditya Pratama"
                                            />
                                            <p className="text-[10px] text-slate-500 mt-1">Nama yang tercantum pada kolom tanda tangan invoice.</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Jabatan Penandatangan
                                            </label>
                                            <input
                                                type="text"
                                                value={form.invoice_director_title}
                                                onChange={(e) => setForm({ ...form, invoice_director_title: e.target.value })}
                                                className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 outline-hidden transition-all"
                                                placeholder="Contoh: Direktur Utama / Finance Studio"
                                            />
                                            <p className="text-[10px] text-slate-500 mt-1">Gelar atau jabatan di bawah tanda tangan.</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Kota Tanda Tangan
                                            </label>
                                            <input
                                                type="text"
                                                value={form.invoice_signature_city}
                                                onChange={(e) => setForm({ ...form, invoice_signature_city: e.target.value })}
                                                className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20 outline-hidden transition-all"
                                                placeholder="Contoh: Jakarta Selatan"
                                            />
                                            <p className="text-[10px] text-slate-500 mt-1">Lokasi penerbitan pada baris tanggal TTD.</p>
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
                                        <span>{form.company_email || 'hello@arams.com'}</span>
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                        <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span className="text-blue-600 font-medium">{form.company_website || 'https://www.arams.com'}</span>
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
            {adminSubTab === 'general' && (
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

            {/* TAB 3: TAMPILAN & STYLING WARNA */}
            {adminSubTab === 'appearance' && (
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

                    {/* Detailed Customizer & Real-time Live Preview */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                        {/* Left Column: Form Customizer Admin (7 cols) */}
                        <div className="xl:col-span-7 space-y-6">
                            <form onSubmit={handleSaveTheme} className="space-y-5">
                                {/* Four Focused Tabs for Admin (Sidebar, Navbar, Main, Report) */}
                                <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setAdminSectionTab('sidebar')}
                                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                                adminSectionTab === 'sidebar'
                                                    ? 'bg-slate-900 text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            <PanelLeft className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">1. Sidebar</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setAdminSectionTab('navbar')}
                                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                                adminSectionTab === 'navbar'
                                                    ? 'bg-slate-900 text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            <Layout className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">2. Navbar</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setAdminSectionTab('main')}
                                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                                adminSectionTab === 'main'
                                                    ? 'bg-slate-900 text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            <Layers className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">3. Main Content</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAdminSectionTab('report');
                                                setPreviewMode('reports');
                                            }}
                                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                                adminSectionTab === 'report'
                                                    ? 'bg-slate-900 text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">4. Laporan &amp; Grafik</span>
                                        </button>
                                    </div>
                                </div>

                                {/* 1. SIDEBAR TAB */}
                                {adminSectionTab === 'sidebar' && (
                                    <div className="space-y-4 animate-in fade-in duration-150">
                                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                                            <div className="border-b border-slate-100 pb-2.5">
                                                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                                    <PanelLeft className="w-4 h-4 text-[#C89445]" />
                                                    <span>Latar Belakang Sidebar</span>
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    Atur warna latar belakang menu navigasi kiri studio
                                                </span>
                                            </div>

                                            <ColorSettingRow
                                                label="Warna Latar Sidebar (Solid)"
                                                description="Warna dasar latar belakang sidebar menu kiri"
                                                value={themeForm.sidebar_bg_color}
                                                onChange={(val) => setThemeForm({ ...themeForm, sidebar_bg_color: val })}
                                                presets={[
                                                    { label: 'Deep Purple', hex: '#1C132E' },
                                                    { label: 'Primary Dark', hex: '#0E091E' },
                                                    { label: 'Dark Navy', hex: '#0A192F' },
                                                    { label: 'Charcoal', hex: '#0B1527' },
                                                    { label: 'Pure White', hex: '#FFFFFF' },
                                                ]}
                                            />

                                            <GradientBuilder
                                                label="Gradient Sidebar (Opsional)"
                                                value={themeForm.sidebar_bg_gradient}
                                                onChange={(css) => setThemeForm({ ...themeForm, sidebar_bg_gradient: css })}
                                                presets={[
                                                    { label: 'Deep Purple Velvet', value: 'linear-gradient(135deg, #1C132E 0%, #2D1B69 100%)' },
                                                    { label: 'Midnight Obsidian', value: 'linear-gradient(180deg, #0E091E 0%, #1A0F3F 100%)' },
                                                    { label: 'Dark Emerald', value: 'linear-gradient(135deg, #091B16 0%, #112F27 100%)' },
                                                ]}
                                            />

                                            <div className="pt-2">
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                    Subtitle Brand di Bawah Logo
                                                </label>
                                                <input
                                                    type="text"
                                                    value={themeForm.company_subtitle}
                                                    onChange={(e) => setThemeForm({ ...themeForm, company_subtitle: e.target.value })}
                                                    placeholder="STUDIO & CINEMA"
                                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 bg-white focus:outline-hidden focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                                            <div className="border-b border-slate-100 pb-2.5">
                                                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-[#C89445]" />
                                                    <span>Menu Aktif &amp; Teks Navigasi</span>
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    Warna sorotan menu yang sedang dibuka dan teks menu biasa
                                                </span>
                                            </div>

                                            <ColorSettingRow
                                                label="Highlight Menu Aktif (Background)"
                                                description="Warna blok sorotan tombol menu yang sedang aktif"
                                                value={themeForm.sidebar_active_bg}
                                                onChange={(val) => setThemeForm({ ...themeForm, sidebar_active_bg: val })}
                                                presets={[
                                                    { label: 'Champagne Gold', hex: '#C98922' },
                                                    { label: 'Warm Gold', hex: '#CA8A22' },
                                                    { label: 'Sapphire Blue', hex: '#3B82F6' },
                                                    { label: 'Emerald Green', hex: '#10B981' },
                                                    { label: 'Royal Violet', hex: '#8B5CF6' },
                                                ]}
                                            />

                                            <ColorSettingRow
                                                label="Teks Menu Aktif"
                                                description="Warna tulisan dan ikon menu yang sedang aktif"
                                                value={themeForm.sidebar_active_text}
                                                onChange={(val) => setThemeForm({ ...themeForm, sidebar_active_text: val })}
                                                presets={[
                                                    { label: 'Pure White', hex: '#FFFFFF' },
                                                    { label: 'Ivory Soft', hex: '#FDF8EE' },
                                                    { label: 'Dark Charcoal', hex: '#0F172A' },
                                                ]}
                                            />

                                            <ColorSettingRow
                                                label="Teks Menu Biasa (Inaktif)"
                                                description="Warna tulisan dan ikon menu saat tidak diklik"
                                                value={themeForm.sidebar_text_color}
                                                onChange={(val) => setThemeForm({ ...themeForm, sidebar_text_color: val })}
                                                presets={[
                                                    { label: 'Light Slate', hex: '#94A3B8' },
                                                    { label: 'Silver Gray', hex: '#CBD5E1' },
                                                    { label: 'Muted Slate', hex: '#64748B' },
                                                    { label: 'Dark Slate', hex: '#475569' },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* 2. NAVBAR TAB */}
                                {adminSectionTab === 'navbar' && (
                                    <div className="space-y-4 animate-in fade-in duration-150">
                                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                                            <div className="border-b border-slate-100 pb-2.5">
                                                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                                    <Layout className="w-4 h-4 text-[#C89445]" />
                                                    <span>Latar Belakang &amp; Border Navbar</span>
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    Kustomisasi header atas dashboard studio
                                                </span>
                                            </div>

                                            <ColorSettingRow
                                                label="Background Navbar Atas"
                                                description="Warna latar belakang bar navigasi bagian atas"
                                                value={themeForm.header_bg_color}
                                                onChange={(val) => setThemeForm({ ...themeForm, header_bg_color: val, header_bg_gradient: '' })}
                                                presets={[
                                                    { label: 'Clean White', hex: '#FFFFFF' },
                                                    { label: 'Soft Ivory', hex: '#F8F6F5' },
                                                    { label: 'Deep Purple', hex: '#1C132E' },
                                                    { label: 'Sapphire Navy', hex: '#0A192F' },
                                                    { label: 'Charcoal Dark', hex: '#0E091E' },
                                                ]}
                                            />

                                            <GradientBuilder
                                                label="Gradient Khusus Navbar (Opsional)"
                                                value={themeForm.header_bg_gradient}
                                                onChange={(css) => setThemeForm({ ...themeForm, header_bg_gradient: css })}
                                                presets={[
                                                    { label: 'Deep Purple Navbar', value: 'linear-gradient(135deg, #1C132E 0%, #2D1B69 100%)' },
                                                    { label: 'Sapphire Navy Navbar', value: 'linear-gradient(135deg, #0A192F 0%, #1E3A8A 100%)' },
                                                    { label: 'Clean White Soft', value: 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 100%)' },
                                                ]}
                                            />

                                            <ColorSettingRow
                                                label="Warna Teks &amp; Ikon Header"
                                                description="Warna teks notifikasi, pencarian, dan ikon pada navbar"
                                                value={themeForm.header_text_color}
                                                onChange={(val) => setThemeForm({ ...themeForm, header_text_color: val })}
                                                presets={[
                                                    { label: 'Dark Slate', hex: '#0F172A' },
                                                    { label: 'Charcoal', hex: '#1E293B' },
                                                    { label: 'Pure White', hex: '#FFFFFF' },
                                                    { label: 'Champagne Gold', hex: '#E6CA85' },
                                                ]}
                                            />

                                            <ColorSettingRow
                                                label="Garis Pembatas Bawah (Border)"
                                                description="Warna garis separator pembatas navbar dengan konten"
                                                value={themeForm.header_border_color}
                                                onChange={(val) => setThemeForm({ ...themeForm, header_border_color: val })}
                                                presets={[
                                                    { label: 'Light Border', hex: '#E2E8F0' },
                                                    { label: 'Soft Silver', hex: '#CBD5E1' },
                                                    { label: 'Gold Shimmer', hex: '#C98922' },
                                                ]}
                                            />
                                        </div>

                                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                                            <div className="border-b border-slate-100 pb-2.5">
                                                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                                    <SlidersHorizontal className="w-4 h-4 text-[#C89445]" />
                                                    <span>Breadcrumb Navigasi &amp; Subtitle Header</span>
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    Jejak lokasi halaman di bawah judul serta teks keterangan role akun di header
                                                </span>
                                            </div>

                                            <ColorSettingRow
                                                label="Warna Breadcrumb Normal &amp; Role Akun"
                                                description="Warna link navigasi induk (Dashboard) dan teks role (Owner)"
                                                value={themeForm.breadcrumb_color}
                                                onChange={(val) => setThemeForm({ ...themeForm, breadcrumb_color: val })}
                                                presets={[
                                                    { label: 'Champagne Gold', hex: '#C98922' },
                                                    { label: 'Muted Gold', hex: '#D4AF37' },
                                                    { label: 'Silver Light', hex: '#CBD5E1' },
                                                    { label: 'Slate Muted', hex: '#94A3B8' },
                                                    { label: 'Pure White', hex: '#FFFFFF' },
                                                ]}
                                            />

                                            <ColorSettingRow
                                                label="Warna Breadcrumb Halaman Aktif"
                                                description="Warna teks penanda halaman yang sedang dibuka (Settings)"
                                                value={themeForm.breadcrumb_active_color}
                                                onChange={(val) => setThemeForm({ ...themeForm, breadcrumb_active_color: val })}
                                                presets={[
                                                    { label: 'Pure White', hex: '#FFFFFF' },
                                                    { label: 'Champagne Gold', hex: '#E6CA85' },
                                                    { label: 'Amber Gold', hex: '#F59E0B' },
                                                    { label: 'Dark Slate', hex: '#0F172A' },
                                                    { label: 'Charcoal', hex: '#1E293B' },
                                                ]}
                                            />
                                        </div>

                                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                                            <div className="border-b border-slate-100 pb-2.5">
                                                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                                    <Search className="w-4 h-4 text-[#C89445]" />
                                                    <span>Bilah Pencarian Header (Search Bar)</span>
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    Kustomisasi warna background dan teks kotak input pencarian global di navbar
                                                </span>
                                            </div>

                                            <ColorSettingRow
                                                label="Warna Background Kotak Search"
                                                description="Warna latar belakang pil search bar (kosongkan untuk auto-adaptif)"
                                                value={themeForm.header_search_bg}
                                                onChange={(val) => setThemeForm({ ...themeForm, header_search_bg: val })}
                                                presets={[
                                                    { label: 'Transparan Mewah', hex: 'rgba(255, 255, 255, 0.12)' },
                                                    { label: 'Putih Bersih', hex: '#FFFFFF' },
                                                    { label: 'Abu Lembut', hex: '#F1F5F9' },
                                                    { label: 'Dark Surface', hex: '#181129' },
                                                    { label: 'Dark Obsidian', hex: '#0E091E' },
                                                ]}
                                            />

                                            <ColorSettingRow
                                                label="Warna Teks &amp; Placeholder Search"
                                                description="Warna teks saat mengetik dan ikon pencarian di navbar"
                                                value={themeForm.header_search_text}
                                                onChange={(val) => setThemeForm({ ...themeForm, header_search_text: val })}
                                                presets={[
                                                    { label: 'Pure White', hex: '#FFFFFF' },
                                                    { label: 'Champagne Gold', hex: '#E6CA85' },
                                                    { label: 'Silver Muted', hex: '#CBD5E1' },
                                                    { label: 'Dark Slate', hex: '#0F172A' },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* 3. MAIN CONTENT TAB */}
                                {adminSectionTab === 'main' && (
                                    <div className="space-y-4 animate-in fade-in duration-150">
                                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                                            <div className="border-b border-slate-100 pb-2.5">
                                                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                                    <Layers className="w-4 h-4 text-[#C89445]" />
                                                    <span>Latar Aplikasi &amp; Aksen Brand Utama</span>
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    Latar belakang kanvas aplikasi dan warna tombol utama (CTA)
                                                </span>
                                            </div>

                                            <ColorSettingRow
                                                label="Latar Belakang Aplikasi (Canvas)"
                                                description="Warna dasar seluruh halaman admin di balik kartu-kartu"
                                                value={themeForm.app_bg_color}
                                                onChange={(val) => setThemeForm({ ...themeForm, app_bg_color: val, app_bg_gradient: '' })}
                                                presets={[
                                                    { label: 'Soft Ivory', hex: '#F8F6F5' },
                                                    { label: 'Clean Slate', hex: '#F8FAFC' },
                                                    { label: 'Cool Gray', hex: '#F1F5F9' },
                                                    { label: 'Pure White', hex: '#FFFFFF' },
                                                    { label: 'Obsidian Dark', hex: '#0E091E' },
                                                ]}
                                            />

                                            <GradientBuilder
                                                label="Gradient Kanvas Utama (Opsional)"
                                                value={themeForm.app_bg_gradient}
                                                onChange={(css) => setThemeForm({ ...themeForm, app_bg_gradient: css })}
                                                presets={[
                                                    { label: 'Warm Studio Ivory', value: 'linear-gradient(135deg, #F8F6F5 0%, #EDEAE8 100%)' },
                                                    { label: 'Subtle Slate Glow', value: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2F6 100%)' },
                                                    { label: 'Deep Dark Canvas', value: 'linear-gradient(135deg, #0E091E 0%, #181129 100%)' },
                                                ]}
                                            />

                                            <ColorSettingRow
                                                label="Warna Aksen Brand / Tombol Utama (CTA)"
                                                description="Warna tombol simpan, badge status aktif, tab aktif, dan ring fokus"
                                                value={themeForm.primary_accent_color}
                                                onChange={(val) => setThemeForm({ ...themeForm, primary_accent_color: val })}
                                                presets={[
                                                    { label: 'Champagne Gold', hex: '#C98922' },
                                                    { label: 'Warm Gold', hex: '#CA8A22' },
                                                    { label: 'Sapphire Blue', hex: '#3B82F6' },
                                                    { label: 'Emerald Green', hex: '#10B981' },
                                                    { label: 'Royal Violet', hex: '#8B5CF6' },
                                                    { label: 'Rose Crimson', hex: '#E11D48' },
                                                ]}
                                            />

                                            <GradientBuilder
                                                label="Gradient Tombol Utama (Opsional)"
                                                value={themeForm.primary_accent_gradient}
                                                onChange={(css) => setThemeForm({ ...themeForm, primary_accent_gradient: css })}
                                                presets={[
                                                    { label: 'Arams Royal Gold', value: 'linear-gradient(135deg, #E6CA85 0%, #C98922 50%, #9E6D24 100%)' },
                                                    { label: 'Vibrant Indigo', value: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)' },
                                                    { label: 'Emerald Sunset', value: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
                                                ]}
                                            />
                                        </div>

                                        {/* Tipografi & Hirarki Teks Terpadu */}
                                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                                            <div className="border-b border-slate-100 pb-2.5">
                                                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                                    <Type className="w-4 h-4 text-[#C89445]" />
                                                    <span>Tipografi &amp; Warna Teks Terpadu</span>
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    Mengatur warna judul (title), isi tabel (tbody), header kolom (thead), dan subtitle dalam satu kesatuan
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-slate-100">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                        Font Judul &amp; Heading
                                                    </label>
                                                    <select
                                                        value={themeForm.font_family_heading}
                                                        onChange={(e) => setThemeForm({ ...themeForm, font_family_heading: e.target.value })}
                                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 bg-white"
                                                    >
                                                        {['Plus Jakarta Sans', 'Inter', 'Outfit', 'Playfair Display', 'Cinzel', 'Poppins'].map((f) => (
                                                            <option key={f} value={f}>{f}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                        Font Body &amp; Konten
                                                    </label>
                                                    <select
                                                        value={themeForm.font_family_body}
                                                        onChange={(e) => setThemeForm({ ...themeForm, font_family_body: e.target.value })}
                                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 bg-white"
                                                    >
                                                        {['Plus Jakarta Sans', 'Inter', 'Outfit', 'Roboto', 'Poppins'].map((f) => (
                                                            <option key={f} value={f}>{f}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <ColorSettingRow
                                                label="Judul &amp; Heading (Title)"
                                                description="Mengatur Title H1, H2, H3, dan judul section utama"
                                                value={themeForm.app_heading_color}
                                                onChange={(val) => setThemeForm({ ...themeForm, app_heading_color: val })}
                                                presets={[
                                                    { label: 'Dark Slate', hex: '#0F172A' },
                                                    { label: 'Charcoal', hex: '#1E293B' },
                                                    { label: 'Deep Gray', hex: '#334155' },
                                                    { label: 'Champagne Gold', hex: '#C98922' },
                                                    { label: 'Pure White', hex: '#FFFFFF' },
                                                ]}
                                            />

                                            <ColorSettingRow
                                                label="Isi Teks &amp; Data Konten (Body / tbody)"
                                                description="Mengatur paragraf, label form, dan isi data baris tabel (tbody)"
                                                value={themeForm.app_text_color}
                                                onChange={(val) => setThemeForm({ ...themeForm, app_text_color: val })}
                                                presets={[
                                                    { label: 'Medium Slate', hex: '#334155' },
                                                    { label: 'Dark Charcoal', hex: '#1E293B' },
                                                    { label: 'Soft Slate', hex: '#475569' },
                                                    { label: 'Pure White', hex: '#FFFFFF' },
                                                ]}
                                            />

                                            <ColorSettingRow
                                                label="Subtitle, Keterangan &amp; Header Kolom (Muted / thead / tfoot)"
                                                description="Mengatur subtitle kartu, keterangan redup, header kolom tabel (thead), dan ringkasan (tfoot)"
                                                value={themeForm.app_muted_text_color}
                                                onChange={(val) => setThemeForm({ ...themeForm, app_muted_text_color: val })}
                                                presets={[
                                                    { label: 'Slate Muted', hex: '#64748B' },
                                                    { label: 'Silver Gray', hex: '#94A3B8' },
                                                    { label: 'Cool Silver', hex: '#CBD5E1' },
                                                    { label: 'Muted Gold', hex: '#D4AF37' },
                                                ]}
                                            />

                                            <ColorSettingRow
                                                label="Judul Kartu &amp; Panel Box (Title Card)"
                                                description="Warna judul kartu panel data dan form box"
                                                value={themeForm.card_heading_color}
                                                onChange={(val) => setThemeForm({ ...themeForm, card_heading_color: val })}
                                                presets={[
                                                    { label: 'Charcoal', hex: '#1E293B' },
                                                    { label: 'Dark Slate', hex: '#0F172A' },
                                                    { label: 'Deep Gray', hex: '#334155' },
                                                    { label: 'Champagne Gold', hex: '#C98922' },
                                                    { label: 'Pure White', hex: '#FFFFFF' },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* 4. REPORT & CHARTS TAB */}
                                {adminSectionTab === 'report' && (
                                    <div className="space-y-4 animate-in fade-in duration-150">
                                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                                            <div className="border-b border-slate-100 pb-2.5">
                                                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                                    <FileSpreadsheet className="w-4 h-4 text-[#C89445]" />
                                                    <span>Kustomisasi Warna Laporan &amp; Grafik (/reports)</span>
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    Atur palet warna kartu KPI, tombol export, grafik combo bulanan, dan indikator pembayaran laporan
                                                </span>
                                            </div>

                                            {/* Quick Report Palettes */}
                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
                                                <span className="text-[11px] font-bold text-slate-700 block">
                                                    Pilihan Palet Siap Pakai Laporan
                                                </span>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                    {[
                                                        { name: 'Arams Maroon', primary: '#3C0E0E', revenue: '#3C0E0E', projects: '#10B981', received: '#059669', pending: '#DC2626' },
                                                        { name: 'Royal Gold', primary: '#C98922', revenue: '#C98922', projects: '#10B981', received: '#059669', pending: '#DC2626' },
                                                        { name: 'Studio Blue', primary: '#2563EB', revenue: '#3B82F6', projects: '#10B981', received: '#059669', pending: '#DC2626' },
                                                        { name: 'Emerald Luxe', primary: '#059669', revenue: '#10B981', projects: '#3B82F6', received: '#059669', pending: '#DC2626' },
                                                        { name: 'Royal Violet', primary: '#7C3AED', revenue: '#8B5CF6', projects: '#C98922', received: '#10B981', pending: '#EF4444' },
                                                        { name: 'Dark Obsidian', primary: '#0F172A', revenue: '#334155', projects: '#10B981', received: '#059669', pending: '#DC2626' },
                                                    ].map((pal, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => {
                                                                setThemeForm({
                                                                    ...themeForm,
                                                                    report_primary_accent: pal.primary,
                                                                    report_revenue_color: pal.revenue,
                                                                    report_projects_color: pal.projects,
                                                                    report_received_color: pal.received,
                                                                    report_pending_color: pal.pending,
                                                                });
                                                            }}
                                                            className="flex items-center gap-1.5 p-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-400 text-left cursor-pointer transition-all"
                                                        >
                                                            <div className="flex -space-x-1 shrink-0">
                                                                <span className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: pal.primary }} />
                                                                <span className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: pal.revenue }} />
                                                                <span className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: pal.projects }} />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-slate-700 truncate">{pal.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <ColorSettingRow
                                                label="Warna Aksen Utama Laporan (Total Nilai Project &amp; Export)"
                                                description="Mengatur warna angka KPI Total Nilai Project, tombol Export Laporan, dan tautan Lihat Detail"
                                                value={themeForm.report_primary_accent}
                                                onChange={(val) => setThemeForm({ ...themeForm, report_primary_accent: val })}
                                                presets={[
                                                    { label: 'Arams Maroon', hex: '#3C0E0E' },
                                                    { label: 'Royal Wine', hex: '#4A151B' },
                                                    { label: 'Champagne Gold', hex: '#C98922' },
                                                    { label: 'Sapphire Blue', hex: '#2563EB' },
                                                    { label: 'Emerald Green', hex: '#059669' },
                                                    { label: 'Modern Indigo', hex: '#6366F1' },
                                                ]}
                                            />

                                            <ColorSettingRow
                                                label="Warna Batang Grafik Omzet / Revenue"
                                                description="Warna batang grafik (bar chart) performa omzet bulanan"
                                                value={themeForm.report_revenue_color}
                                                onChange={(val) => setThemeForm({ ...themeForm, report_revenue_color: val })}
                                                presets={[
                                                    { label: 'Arams Maroon', hex: '#3C0E0E' },
                                                    { label: 'Royal Wine', hex: '#4A151B' },
                                                    { label: 'Champagne Gold', hex: '#C98922' },
                                                    { label: 'Sapphire Blue', hex: '#3B82F6' },
                                                    { label: 'Indigo Purple', hex: '#6366F1' },
                                                    { label: 'Emerald Green', hex: '#10B981' },
                                                ]}
                                            />

                                            <ColorSettingRow
                                                label="Warna Garis Tren Jumlah Project"
                                                description="Warna garis dan titik (line chart) jumlah project bulanan"
                                                value={themeForm.report_projects_color}
                                                onChange={(val) => setThemeForm({ ...themeForm, report_projects_color: val })}
                                                presets={[
                                                    { label: 'Emerald Green', hex: '#10B981' },
                                                    { label: 'Champagne Gold', hex: '#C98922' },
                                                    { label: 'Sky Blue', hex: '#0EA5E9' },
                                                    { label: 'Amber Orange', hex: '#F59E0B' },
                                                    { label: 'Rose Red', hex: '#F43F5E' },
                                                    { label: 'Violet', hex: '#8B5CF6' },
                                                ]}
                                            />

                                            <ColorSettingRow
                                                label="Warna Indikator Total Diterima"
                                                description="Warna status dan angka kartu Total Nilai Pembayaran Diterima"
                                                value={themeForm.report_received_color}
                                                onChange={(val) => setThemeForm({ ...themeForm, report_received_color: val })}
                                                presets={[
                                                    { label: 'Emerald Green', hex: '#059669' },
                                                    { label: 'Teal Green', hex: '#0D9488' },
                                                    { label: 'Royal Gold', hex: '#C98922' },
                                                    { label: 'Blue', hex: '#2563EB' },
                                                ]}
                                            />

                                            <ColorSettingRow
                                                label="Warna Indikator Total Tertunda"
                                                description="Warna status dan angka kartu Total Nilai Pembayaran Tertunda / Piutang"
                                                value={themeForm.report_pending_color}
                                                onChange={(val) => setThemeForm({ ...themeForm, report_pending_color: val })}
                                                presets={[
                                                    { label: 'Rose Red', hex: '#DC2626' },
                                                    { label: 'Crimson', hex: '#E11D48' },
                                                    { label: 'Amber Orange', hex: '#D97706' },
                                                    { label: 'Warm Maroon', hex: '#881337' },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
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
                                            Live Real-time Preview Admin
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto scrollbar-none">
                                        {[
                                            { id: 'dashboard', label: 'Dashboard' },
                                            { id: 'projects', label: 'Projects' },
                                            { id: 'master_data', label: 'Master Data' },
                                            { id: 'finance', label: 'Keuangan' },
                                            { id: 'reports', label: 'Laporan' },
                                        ].map((m) => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setPreviewMode(m.id as any)}
                                                className={`px-2 py-1 rounded-lg text-[9px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                                                    previewMode === m.id
                                                        ? 'bg-white text-slate-900 shadow-xs'
                                                        : 'text-slate-500 hover:text-slate-800'
                                                }`}
                                            >
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Mockup Canvas Container */}
                                <div
                                    style={{
                                        backgroundColor: themeForm.app_bg_color || '#FAF7F5',
                                        backgroundImage: themeForm.app_bg_gradient || undefined,
                                        fontFamily: `${themeForm.font_family_body}, sans-serif`,
                                    }}
                                    className="rounded-xl border border-slate-200/80 overflow-hidden shadow-inner flex flex-col min-h-[360px] text-xs transition-colors"
                                >
                                    <div className="flex flex-1 min-h-[320px]">
                                        {/* Mockup Sidebar */}
                                        <div
                                            style={{
                                                backgroundColor: themeForm.sidebar_bg_color,
                                                backgroundImage: themeForm.sidebar_bg_gradient || undefined,
                                                color: themeForm.sidebar_text_color,
                                            }}
                                            className="w-28 p-2.5 flex flex-col justify-between shrink-0 border-r border-black/10 transition-colors"
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-1.5 px-1 py-0.5">
                                                    <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center font-bold text-[9px] text-white">
                                                        L
                                                    </div>
                                                    <div>
                                                        <span className="font-extrabold text-[8px] tracking-wider text-white uppercase block leading-none">
                                                            {form.company_name || 'LENSARIA'}
                                                        </span>
                                                        <span className="text-[6.5px] opacity-75 uppercase tracking-widest block mt-0.5">
                                                            {themeForm.company_subtitle || 'STUDIO'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-0.5 text-[8px] font-medium">
                                                    {[
                                                        { label: 'Dashboard', icon: LayoutDashboard, active: previewMode === 'dashboard' },
                                                        { label: 'Projects', icon: Briefcase, active: previewMode === 'projects' },
                                                        { label: 'Master Data', icon: Layers, active: previewMode === 'master_data' },
                                                        { label: 'Keuangan', icon: Hash, active: previewMode === 'finance' },
                                                        { label: 'Settings', icon: Settings, active: false },
                                                    ].map((item, idx) => {
                                                        const Icon = item.icon;
                                                        return (
                                                            <div
                                                                key={idx}
                                                                style={{
                                                                    backgroundColor: item.active ? themeForm.sidebar_active_bg : 'transparent',
                                                                    color: item.active ? themeForm.sidebar_active_text : themeForm.sidebar_text_color,
                                                                }}
                                                                className="flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-all"
                                                            >
                                                                <Icon className="w-2.5 h-2.5 shrink-0" />
                                                                <span className="truncate">{item.label}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-white/10 flex items-center gap-1 text-[7px] opacity-70">
                                                <ShieldCheck className="w-2.5 h-2.5" />
                                                <span>Admin Pro</span>
                                            </div>
                                        </div>

                                        {/* Mockup Main Viewport */}
                                        <div className="flex-1 flex flex-col min-w-0">
                                            {/* Header Bar */}
                                            <div
                                                style={{
                                                    backgroundColor: themeForm.header_bg_color || '#FFFFFF',
                                                    backgroundImage: themeForm.header_bg_gradient || undefined,
                                                    color: themeForm.header_text_color || '#0F172A',
                                                    borderColor: themeForm.header_border_color || '#E2E8F0',
                                                }}
                                                className="px-3 py-1.5 border-b flex items-center justify-between transition-colors shrink-0"
                                            >
                                                <div className="flex items-center gap-1 text-[8px]">
                                                    <span style={{ color: themeForm.breadcrumb_color }}>Dashboard</span>
                                                    <span style={{ color: themeForm.breadcrumb_color }} className="opacity-50">/</span>
                                                    <span style={{ color: themeForm.breadcrumb_active_color }} className="font-bold">Overview</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div
                                                        style={{
                                                            background: themeForm.header_search_bg || 'rgba(255,255,255,0.12)',
                                                            color: themeForm.header_search_text || themeForm.header_text_color,
                                                            borderColor: themeForm.header_border_color,
                                                        }}
                                                        className="px-1.5 py-0.5 rounded-md text-[7.5px] border flex items-center gap-1 opacity-90"
                                                    >
                                                        <Search className="w-2 h-2 opacity-60" />
                                                        <span className="opacity-70 hidden sm:inline">Search...</span>
                                                    </div>
                                                    <div className="w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-[7px] font-bold text-slate-700">
                                                        AU
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dynamic Preview Content */}
                                            <div className="p-3 space-y-2.5 flex-1 overflow-y-auto">
                                                {previewMode === 'dashboard' && (
                                                    <div className="space-y-2">
                                                        <div className="grid grid-cols-2 gap-1.5">
                                                            <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs">
                                                                <span style={{ color: themeForm.app_muted_text_color }} className="text-[8px] block">Revenue Bulan Ini</span>
                                                                <span style={{ color: themeForm.app_heading_color }} className="font-extrabold text-[11px] block">Rp 48.500.000</span>
                                                                <span className="text-[7.5px] font-bold text-emerald-600">+12% vs lalu</span>
                                                            </div>
                                                            <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs">
                                                                <span style={{ color: themeForm.app_muted_text_color }} className="text-[8px] block">Sesi Selesai</span>
                                                                <span style={{ color: themeForm.app_heading_color }} className="font-extrabold text-[11px] block">24 Proyek</span>
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
                                                                    <span style={{ color: themeForm.primary_accent_color }} className="font-bold text-[8.5px]">{item.price}</span>
                                                                </div>
                                                                <p style={{ color: themeForm.app_muted_text_color }} className="text-[7.5px]">{item.desc}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {previewMode === 'finance' && (
                                                    <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span style={{ color: themeForm.app_heading_color }} className="font-bold text-[9px]">Laporan Kas &amp; Saldo</span>
                                                            <span style={{ color: themeForm.primary_accent_color }} className="text-[8px] font-bold">BCA Studio</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-1 text-[8px]">
                                                            <div className="p-1 rounded bg-emerald-50 text-emerald-800">
                                                                <span className="block text-[6.5px] text-emerald-600 font-bold uppercase">Pemasukan</span>
                                                                <span className="font-bold text-[8.5px]">Rp 32.500.000</span>
                                                            </div>
                                                            <div className="p-1 rounded bg-rose-50 text-rose-800">
                                                                <span className="block text-[6.5px] text-rose-600 font-bold uppercase">Pengeluaran</span>
                                                                <span className="font-bold text-[8.5px]">Rp 8.120.000</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {previewMode === 'reports' && (
                                                    <div className="space-y-1.5 animate-in fade-in duration-100">
                                                        <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <span style={{ color: themeForm.app_muted_text_color }} className="text-[7.5px] font-bold">Total Nilai Project</span>
                                                                <span
                                                                    className="text-[6.5px] px-1 py-0.5 rounded font-bold text-white shadow-2xs"
                                                                    style={{ backgroundColor: themeForm.report_primary_accent }}
                                                                >
                                                                    Export
                                                                </span>
                                                            </div>
                                                            <span
                                                                style={{ color: themeForm.report_primary_accent }}
                                                                className="font-extrabold text-[12px] block leading-tight tracking-tight"
                                                            >
                                                                Rp 1.581.000.000
                                                            </span>
                                                            <span className="text-[7px] text-emerald-600 font-bold block">
                                                                ▲ 18.45% <span className="font-normal text-slate-400">dari periode lalu</span>
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-1 text-[8px]">
                                                            <div className="bg-white p-1.5 rounded-lg border border-slate-200/80">
                                                                <span style={{ color: themeForm.app_muted_text_color }} className="text-[6.5px] block font-medium">Total Diterima</span>
                                                                <span style={{ color: themeForm.report_received_color }} className="font-bold text-[8.5px] block">Rp 1.106.437.496</span>
                                                            </div>
                                                            <div className="bg-white p-1.5 rounded-lg border border-slate-200/80">
                                                                <span style={{ color: themeForm.app_muted_text_color }} className="text-[6.5px] block font-medium">Total Tertunda</span>
                                                                <span style={{ color: themeForm.report_pending_color }} className="font-bold text-[8.5px] block">Rp 474.562.504</span>
                                                            </div>
                                                        </div>

                                                        {/* Mini Combo Chart Preview */}
                                                        <div className="bg-white p-1.5 rounded-lg border border-slate-200/80 space-y-1">
                                                            <div className="flex items-center justify-between text-[7px]">
                                                                <span style={{ color: themeForm.app_heading_color }} className="font-bold">Grafik Bulanan</span>
                                                                <div className="flex items-center gap-1.5">
                                                                    <div className="flex items-center gap-0.5">
                                                                        <span className="w-1.5 h-1.5 rounded-xs" style={{ backgroundColor: themeForm.report_revenue_color }} />
                                                                        <span className="text-slate-400 text-[6.5px]">Omzet</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-0.5">
                                                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: themeForm.report_projects_color }} />
                                                                        <span className="text-slate-400 text-[6.5px]">Project</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="h-9 flex items-end justify-between gap-1 pt-1.5 px-1 bg-slate-50 rounded border border-slate-100">
                                                                {[35, 55, 48, 75, 62, 80, 70, 92].map((h, i) => (
                                                                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
                                                                        <div
                                                                            className="w-full rounded-t-xs transition-all"
                                                                            style={{ height: `${h}%`, backgroundColor: themeForm.report_revenue_color }}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <p style={{ color: themeForm.app_muted_text_color }} className="text-[7.5px] text-center pt-1">
                                                    *Preview live otomatis menyesuaikan Title, Subtitle, Font, dan Warna yang Anda atur.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

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

            {/* TAB 4: TAMPILAN LOGIN */}
            {adminSubTab === 'login_theme' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-[#4A151B]" />
                                <span>Kustomisasi Tampilan Halaman Login</span>
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Atur palet warna latar, gradien visual, kartu formulir masuk, dan tagline autentikasi studio.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleSaveTheme}
                                style={{ backgroundColor: themeForm.login_accent_color || '#4A151B' }}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <Save className="w-3.5 h-3.5" />
                                <span>Simpan Pengaturan Login</span>
                            </button>
                        </div>
                    </div>

                    {/* Presets Cepat Pilihan Tema Login */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-[#C98922]" />
                                    <span>Pilihan Preset Tema Login</span>
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Klik salah satu preset di bawah untuk menerapkan palet warna &amp; tipografi yang telah dikurasi.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pt-1">
                            {loginPresets.map((preset) => {
                                const isSelected = themeForm.login_preset === preset.id;
                                return (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => handleApplyLoginPreset(preset)}
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

                                        <div className="flex items-center gap-1.5 pt-1">
                                            <span
                                                style={{ backgroundColor: preset.login_bg_color }}
                                                className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                                                title="Latar Belakang"
                                            />
                                            <span
                                                style={{ backgroundColor: preset.login_card_bg }}
                                                className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                                                title="Kartu Form"
                                            />
                                            <span
                                                style={{ backgroundColor: preset.login_accent_color }}
                                                className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                                                title="Aksen Tombol"
                                            />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                        {/* Left Column: Form Customizer Login (7 cols) */}
                        <div className="xl:col-span-7 space-y-6">
                            <form onSubmit={handleSaveTheme} className="space-y-5">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                                    <div className="border-b border-slate-100 pb-2.5">
                                        <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-indigo-600" />
                                            <span>Latar Belakang Halaman Login</span>
                                        </span>
                                        <span className="text-[11px] text-slate-400">
                                            Kustomisasi tampilan halaman autentikasi masuk sistem
                                        </span>
                                    </div>

                                    <ColorSettingRow
                                        label="Latar Belakang Login (Solid)"
                                        description="Warna kanvas utama halaman masuk"
                                        value={themeForm.login_bg_color}
                                        onChange={(val) => setThemeForm({ ...themeForm, login_bg_color: val, login_bg_gradient: '' })}
                                        presets={[
                                            { label: 'Arams Maroon (Default)', hex: '#2E0F15' },
                                            { label: 'Deep Wine', hex: '#200A0E' },
                                            { label: 'Obsidian Dark', hex: '#0E091E' },
                                            { label: 'Deep Navy', hex: '#070D18' },
                                            { label: 'Forest Dark', hex: '#06120E' },
                                            { label: 'Slate Dark', hex: '#0F172A' },
                                        ]}
                                    />

                                    <GradientBuilder
                                        label="Gradient Latar Login (Opsional)"
                                        value={themeForm.login_bg_gradient}
                                        onChange={(css) => setThemeForm({ ...themeForm, login_bg_gradient: css })}
                                        presets={[
                                            { label: 'Arams Maroon Glow (Default)', value: 'linear-gradient(180deg, #2E0F15 0%, #200A0E 100%)' },
                                            { label: 'Wine & Rose Silk', value: 'linear-gradient(135deg, #2E0F15 0%, #4A151B 50%, #200A0E 100%)' },
                                            { label: 'Obsidian Velvet Glow', value: 'linear-gradient(135deg, #0E091E 0%, #1A0F3F 50%, #0E091E 100%)' },
                                            { label: 'Midnight Sapphire', value: 'linear-gradient(135deg, #070D18 0%, #0D1E3A 100%)' },
                                        ]}
                                    />
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                                    <div className="border-b border-slate-100 pb-2.5">
                                        <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                            <Paintbrush className="w-4 h-4 text-[#4A151B]" />
                                            <span>Kartu Login &amp; Aksen Tombol</span>
                                        </span>
                                        <span className="text-[11px] text-slate-400">
                                            Warna kotak form login, aksen tombol masuk, dan tagline brand
                                        </span>
                                    </div>

                                    <ColorSettingRow
                                        label="Latar Belakang Kartu Form Login"
                                        description="Warna permukaan kartu tempat input email dan password"
                                        value={themeForm.login_card_bg}
                                        onChange={(val) => setThemeForm({ ...themeForm, login_card_bg: val, login_card_bg_gradient: '' })}
                                        presets={[
                                            { label: 'Deep Maroon Card', hex: '#380E13' },
                                            { label: 'Pure White Card', hex: '#FFFFFF' },
                                            { label: 'Warm Ivory Card', hex: '#FAF7F5' },
                                            { label: 'Deep Purple Card', hex: '#1C132E' },
                                            { label: 'Navy Card', hex: '#132238' },
                                            { label: 'Slate Card', hex: '#1E293B' },
                                        ]}
                                    />

                                    <ColorSettingRow
                                        label="Warna Aksen Login (Tombol &amp; Border)"
                                        description="Warna tombol masuk dan garis aksen kartu"
                                        value={themeForm.login_accent_color}
                                        onChange={(val) => setThemeForm({ ...themeForm, login_accent_color: val })}
                                        presets={[
                                            { label: 'Royal Maroon (Default)', hex: '#4A151B' },
                                            { label: 'Crimson Wine', hex: '#380E13' },
                                            { label: 'Rose Gold', hex: '#BE185D' },
                                            { label: 'Champagne Gold', hex: '#C98922' },
                                            { label: 'Warm Gold', hex: '#CA8A22' },
                                            { label: 'Sapphire Blue', hex: '#2563EB' },
                                        ]}
                                    />

                                    <div className="pt-2">
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            Tagline Login Brand
                                        </label>
                                        <input
                                            type="text"
                                            value={themeForm.login_tagline}
                                            onChange={(e) => setThemeForm({ ...themeForm, login_tagline: e.target.value })}
                                            placeholder="STUDIO & CINEMA PHOTOGRAPHY SYSTEM"
                                            className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 bg-white focus:outline-hidden focus:border-indigo-500"
                                        />
                                    </div>
                                </div>

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

                        {/* Right Column: Live Interactive Mockup Preview for Login (5 cols) */}
                        <div className="xl:col-span-5 sticky top-20">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-lg space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                        <span className="text-[11px] font-bold text-slate-700 ml-1">
                                            Live Real-time Preview Login
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-[#4A151B] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                                        /login
                                    </span>
                                </div>

                                <div
                                    style={{
                                        fontFamily: `${themeForm.font_family_body}, sans-serif`,
                                    }}
                                    className="rounded-xl border border-slate-200/80 overflow-hidden shadow-inner flex items-center justify-center p-3 sm:p-5 min-h-[380px] text-xs transition-colors relative bg-[#EFECE8]"
                                >
                                    <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-xl border border-black/10 grid grid-cols-5 bg-white">
                                        <div
                                            style={{
                                                background: themeForm.login_bg_gradient || themeForm.login_bg_color,
                                            }}
                                            className="col-span-2 p-3 text-white flex flex-col justify-between relative overflow-hidden min-h-[250px]"
                                        >
                                            <img
                                                src="/images/wedding-couple.jpg"
                                                alt="Wedding couple"
                                                className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-75 contrast-125"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                                            <div className="relative z-10 space-y-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-5 h-5 rounded-md bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center font-black text-[9px]">
                                                        ap
                                                    </div>
                                                    <div>
                                                        <span className="font-extrabold text-[8px] tracking-wider text-white uppercase block leading-none">
                                                            ARAMS
                                                        </span>
                                                        <span className="text-[6.5px] text-rose-300 font-bold uppercase tracking-widest block mt-0.5">
                                                            Photografer
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative z-10 space-y-1">
                                                <span className="text-[8px] font-extrabold text-white leading-tight block drop-shadow-xs">
                                                    Abadikan Setiap Momen Berharga
                                                </span>
                                                <span
                                                    className="text-[6.5px] font-bold uppercase tracking-wider block opacity-90"
                                                    style={{ color: themeForm.login_accent_color }}
                                                >
                                                    {themeForm.login_tagline || 'STUDIO & CINEMA'}
                                                </span>
                                            </div>
                                        </div>

                                        {(() => {
                                            const isDarkLoginCard = isDarkColor(themeForm.login_card_bg);
                                            return (
                                                <div
                                                    style={{
                                                        background: themeForm.login_card_bg_gradient || themeForm.login_card_bg || '#FFFFFF',
                                                    }}
                                                    className="col-span-3 p-3 flex flex-col justify-between space-y-2 transition-colors"
                                                >
                                                    <div>
                                                        <span
                                                            style={{
                                                                color: isDarkLoginCard ? '#FFFFFF' : '#0F172A',
                                                                fontFamily: `'${themeForm.font_family_heading || 'Plus Jakarta Sans'}', serif`,
                                                            }}
                                                            className="font-extrabold text-[10px] block"
                                                        >
                                                            Welcome Back!
                                                        </span>
                                                        <span className={`text-[7.5px] block mt-0.5 ${isDarkLoginCard ? 'text-slate-300' : 'text-slate-400'}`}>
                                                            Masuk ke sistem {form.company_name || 'Arams'}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <div>
                                                            <span className={`text-[7px] font-bold block mb-0.5 ${isDarkLoginCard ? 'text-slate-200' : 'text-slate-500'}`}>Email</span>
                                                            <div className={`rounded-md px-2 py-1 text-[7.5px] font-medium border ${isDarkLoginCard ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                                                admin@arams.com
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className={`text-[7px] font-bold block mb-0.5 ${isDarkLoginCard ? 'text-slate-200' : 'text-slate-500'}`}>Password</span>
                                                            <div className={`rounded-md px-2 py-1 text-[7.5px] border ${isDarkLoginCard ? 'bg-white/10 border-white/20 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                                                ••••••••
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div
                                                            style={{
                                                                background: themeForm.login_accent_color,
                                                                boxShadow: `0 3px 10px -2px ${themeForm.login_accent_color}66`,
                                                            }}
                                                            className="w-full py-1.5 rounded-lg text-white font-bold text-[8px] tracking-wide text-center cursor-pointer shadow-xs transition-transform hover:scale-[1.02]"
                                                        >
                                                            Masuk
                                                        </div>
                                                        <div className="text-center mt-1">
                                                            <span className={`text-[6.5px] ${isDarkLoginCard ? 'text-slate-300' : 'text-slate-400'}`}>Lupa password?</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    <span className="text-[8px] text-slate-400 text-center mt-3 z-10">
                                        *Preview live halaman login (/login)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 5: BACKUP & DATA */}
            {adminSubTab === 'backup' && (
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
                                        <span className="font-bold text-slate-800 block font-mono">arams_backup_2026-08-27_full.json</span>
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
                                        <span className="font-bold text-slate-800 block font-mono">arams_backup_2026-08-20_weekly.json</span>
                                        <span className="text-[11px] text-slate-400">Dibuat oleh Admin Arams • 1.2 MB</span>
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
                                <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
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
                                            <option value="id">Bahasa Indonesia (ID)</option>
                                            <option value="en">English (US)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setActiveModal(null)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 cursor-pointer"
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
                const currentYear = new Date().getFullYear().toString();
                const currentYY = currentYear.slice(-2);
                const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

                const previewInvoice = numForm.invoice_format
                    .replace('{PREFIX}', numForm.invoice_prefix)
                    .replace('{YEAR}', currentYear)
                    .replace('{YY}', currentYY)
                    .replace('{MONTH}', currentMonth)
                    .replace('{MM}', currentMonth)
                    .replace('{NUMBER}', '0001'.padStart(parseInt(numForm.invoice_padding || '4'), '0'));

                const previewProject = numForm.project_format
                    .replace('{PREFIX}', numForm.project_prefix)
                    .replace('{YEAR}', currentYear)
                    .replace('{YY}', currentYY)
                    .replace('{MONTH}', currentMonth)
                    .replace('{MM}', currentMonth)
                    .replace('{NUMBER}', '0001'.padStart(4, '0'));

                const previewPayment = numForm.payment_format
                    .replace('{PREFIX}', numForm.payment_prefix)
                    .replace('{YEAR}', currentYear)
                    .replace('{YY}', currentYY)
                    .replace('{MONTH}', currentMonth)
                    .replace('{MM}', currentMonth)
                    .replace('{NUMBER}', '0001'.padStart(4, '0'));

                return (
                    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
                                        <Hash className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">Format Penomoran Dokumen</h3>
                                        <p className="text-[11px] text-slate-500">Kustomisasi kode invoice, project, dan kwitansi pembayaran</p>
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
                                <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                                    {/* Tag Variable Legend */}
                                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/70 text-[11px] text-amber-900 space-y-1">
                                        <span className="font-bold block">Variabel yang dapat digunakan:</span>
                                        <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                                            <span className="bg-white px-2 py-0.5 rounded border border-amber-200">{"{PREFIX}"}</span>
                                            <span className="bg-white px-2 py-0.5 rounded border border-amber-200">{"{YEAR}"}</span>
                                            <span className="bg-white px-2 py-0.5 rounded border border-amber-200">{"{YY}"}</span>
                                            <span className="bg-white px-2 py-0.5 rounded border border-amber-200">{"{MONTH}"}</span>
                                            <span className="bg-white px-2 py-0.5 rounded border border-amber-200">{"{NUMBER}"}</span>
                                        </div>
                                    </div>

                                    {/* 1. Invoice Section */}
                                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/30 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-800">Nomor Invoice Tagihan</span>
                                            <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                                                {previewInvoice}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Prefix</label>
                                                <input
                                                    type="text"
                                                    value={numForm.invoice_prefix}
                                                    onChange={(e) => setNumForm({ ...numForm, invoice_prefix: e.target.value })}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono outline-hidden focus:border-[#E8630A]"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Format Pola</label>
                                                <input
                                                    type="text"
                                                    value={numForm.invoice_format}
                                                    onChange={(e) => setNumForm({ ...numForm, invoice_format: e.target.value })}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono outline-hidden focus:border-[#E8630A]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Project Section */}
                                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/30 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-800">Nomor Kode Project</span>
                                            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                                                {previewProject}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Prefix</label>
                                                <input
                                                    type="text"
                                                    value={numForm.project_prefix}
                                                    onChange={(e) => setNumForm({ ...numForm, project_prefix: e.target.value })}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono outline-hidden focus:border-[#E8630A]"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Format Pola</label>
                                                <input
                                                    type="text"
                                                    value={numForm.project_format}
                                                    onChange={(e) => setNumForm({ ...numForm, project_format: e.target.value })}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono outline-hidden focus:border-[#E8630A]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Payment Section */}
                                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/30 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-800">Nomor Kwitansi Pembayaran</span>
                                            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                                                {previewPayment}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Prefix</label>
                                                <input
                                                    type="text"
                                                    value={numForm.payment_prefix}
                                                    onChange={(e) => setNumForm({ ...numForm, payment_prefix: e.target.value })}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono outline-hidden focus:border-[#E8630A]"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Format Pola</label>
                                                <input
                                                    type="text"
                                                    value={numForm.payment_format}
                                                    onChange={(e) => setNumForm({ ...numForm, payment_format: e.target.value })}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono outline-hidden focus:border-[#E8630A]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setActiveModal(null)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md shadow-amber-600/20 cursor-pointer"
                                    >
                                        Simpan Penomoran
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            })()}

            {/* ========================================================================= */}
            {/* MODAL 3: WORKFLOW PROYEK */}
            {/* ========================================================================= */}
            {activeModal === 'workflow' && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Tahapan & Workflow Proyek</h3>
                                    <p className="text-[11px] text-slate-500">Konfigurasi tahapan default dan kebijakan revisi hasil foto</p>
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
                            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1.5">Workflow Default Proyek Baru</label>
                                    <select
                                        value={workflowForm.default_workflow}
                                        onChange={(e) => setWorkflowForm({ ...workflowForm, default_workflow: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#E8630A]"
                                    >
                                        <option value="standard">Standard Wedding Workflow (8 Tahapan)</option>
                                        <option value="express">Express Prewedding / Portrait (4 Tahapan)</option>
                                        <option value="corporate">Commercial & Corporate Event (6 Tahapan)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1.5">Batas Maksimal Pengajuan Revisi Klien</label>
                                    <select
                                        value={workflowForm.allow_client_revisions}
                                        onChange={(e) => setWorkflowForm({ ...workflowForm, allow_client_revisions: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#E8630A]"
                                    >
                                        <option value="0">Tidak Ada Revisi Gratis (Langsung Final)</option>
                                        <option value="1">Maksimal 1 Kali Revisi</option>
                                        <option value="2">Maksimal 2 Kali Revisi (Standar)</option>
                                        <option value="3">Maksimal 3 Kali Revisi</option>
                                        <option value="unlimited">Tanpa Batas Revisi</option>
                                    </select>
                                </div>

                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                                    <div>
                                        <span className="font-bold text-slate-800 block">Wajib Approval Supervisor Sebelum Kirim</span>
                                        <span className="text-[11px] text-slate-500">Editor harus meminta persetujuan sebelum link dirilis ke klien</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={workflowForm.require_supervisor_approval === '1'}
                                        onChange={(e) => setWorkflowForm({ ...workflowForm, require_supervisor_approval: e.target.checked ? '1' : '0' })}
                                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                                >
                                    Simpan Workflow
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 4: HAK AKSES & PERAN */}
            {/* ========================================================================= */}
            {activeModal === 'access' && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-2xs">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Hak Akses & Penugasan Tim</h3>
                                    <p className="text-[11px] text-slate-500">Batasan akses finansial dan upload deliverables staf lapangan</p>
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
                            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                                    <div>
                                        <span className="font-bold text-slate-800 block">Fotografer Boleh Melihat Harga / Invoice</span>
                                        <span className="text-[11px] text-slate-500">Izinkan fotografer melihat nominal kontrak harga project</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={accessForm.photographer_can_view_price === '1'}
                                        onChange={(e) => setAccessForm({ ...accessForm, photographer_can_view_price: e.target.checked ? '1' : '0' })}
                                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                                    />
                                </div>

                                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                                    <div>
                                        <span className="font-bold text-slate-800 block">Editor Boleh Langsung Upload Deliverables</span>
                                        <span className="text-[11px] text-slate-500">Editor dapat mengunggah link hasil editan tanpa perantara admin</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={accessForm.editor_can_upload_deliverables === '1'}
                                        onChange={(e) => setAccessForm({ ...accessForm, editor_can_upload_deliverables: e.target.checked ? '1' : '0' })}
                                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1.5">Visibilitas Proyek Baru</label>
                                    <select
                                        value={accessForm.default_project_visibility}
                                        onChange={(e) => setAccessForm({ ...accessForm, default_project_visibility: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#E8630A]"
                                    >
                                        <option value="team">Hanya Tim yang Ditugaskan (Private)</option>
                                        <option value="all">Seluruh Karyawan & Staff (Public)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setActiveModal(null)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md shadow-teal-600/20 cursor-pointer"
                                >
                                    Simpan Hak Akses
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* MODAL 5: CLOUD & PENYIMPANAN */}
            {/* ========================================================================= */}
            {activeModal === 'storage' && (() => {
                const sampleFolder = storageForm.gdrive_folder_template
                    .replace('{YEAR}', '2026')
                    .replace('{CATEGORY}', 'Wedding')
                    .replace('{PROJECT_NAME}', 'Andi_Sarah');

                return (
                    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-2xs">
                                        <HardDrive className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">Integrasi Google Drive & Folder</h3>
                                        <p className="text-[11px] text-slate-500">Struktur folder otomatis dan masa aktif link Google Drive klien</p>
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
                                <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
                                    <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/70 space-y-1.5">
                                        <span className="text-[10px] font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                            Live Contoh Struktur Folder Otomatis
                                        </span>
                                        <div className="bg-white p-2.5 rounded-lg border border-purple-200/80 font-mono text-xs font-bold text-purple-900 truncate">
                                            📁 {sampleFolder}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1.5">Pola Struktur Folder Drive</label>
                                        <input
                                            type="text"
                                            value={storageForm.gdrive_folder_template}
                                            onChange={(e) => setStorageForm({ ...storageForm, gdrive_folder_template: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#E8630A] font-mono text-xs"
                                        />
                                        <span className="text-[11px] text-slate-400 mt-1 block">Variabel: {"{YEAR}"}, {"{CATEGORY}"}, {"{PROJECT_NAME}"}</span>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1.5">Masa Berlaku Link Download Galeri Klien</label>
                                        <select
                                            value={storageForm.link_expiry_days}
                                            onChange={(e) => setStorageForm({ ...storageForm, link_expiry_days: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-hidden focus:border-[#E8630A]"
                                        >
                                            <option value="0">Selamanya (Tidak Pernah Kedaluwarsa)</option>
                                            <option value="365">1 Tahun (365 Hari)</option>
                                            <option value="730">2 Tahun (730 Hari)</option>
                                            <option value="1095">3 Tahun (1095 Hari)</option>
                                        </select>
                                    </div>

                                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                                        <div>
                                            <span className="font-bold text-slate-800 block">Buat Folder Drive Otomatis</span>
                                            <span className="text-[11px] text-slate-500">Sistem otomatis generate folder saat project baru dibuat</span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={storageForm.auto_generate_folders === '1'}
                                            onChange={(e) => setStorageForm({ ...storageForm, auto_generate_folders: e.target.checked ? '1' : '0' })}
                                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50/50 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setActiveModal(null)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md shadow-purple-600/20 cursor-pointer"
                                    >
                                        Simpan Pengaturan Drive
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
