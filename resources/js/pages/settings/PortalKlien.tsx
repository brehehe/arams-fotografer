import { Head, router } from '@inertiajs/react';
import {
    Globe,
    RotateCcw,
    Save,
    Sparkles,
    Eye,
    ExternalLink,
    Palette,
    Shield,
    Star,
    CheckCircle2,
    SlidersHorizontal,
} from 'lucide-react';
import React, { useState } from 'react';
import { GradientBuilder, ColorSettingRow } from '@/components/settings/ThemeControls';
import { toast } from '@/components/ui/sonner';

interface PortalKlienProps {
    settings?: any;
    settingsMap?: Record<string, string>;
}

export default function PortalKlienPage({ settings = {}, settingsMap = {} }: PortalKlienProps) {
    const getVal = (key: string, def: string = '') => {
        if (settingsMap && settingsMap[key] !== undefined) {
            return settingsMap[key];
        }

        if (!settings) {
            return def;
        }

        for (const group in settings) {
            if (Array.isArray(settings[group])) {
                const found = settings[group].find((s: any) => s.key === key);

                if (found && found.value) {
                    return found.value;
                }
            }
        }

        return def;
    };

    const [portalForm, setPortalForm] = useState({
        portal_preset: getVal('portal_preset', 'arams_maroon_luxury'),
        portal_bg_color: getVal('portal_bg_color', '#FBF6F0'),
        portal_bg_gradient: getVal('portal_bg_gradient', ''),
        portal_nav_bg: getVal('portal_nav_bg', '#3C0E0E'),
        portal_nav_gradient: getVal('portal_nav_gradient', 'linear-gradient(180deg, #3C0E0E 0%, #2A0909 100%)'),
        portal_nav_text_color: getVal('portal_nav_text_color', '#FFFFFF'),
        portal_nav_border_color: getVal('portal_nav_border_color', '#4D1212'),
        portal_card_bg: getVal('portal_card_bg', '#FFFFFF'),
        portal_card_bg_gradient: getVal('portal_card_bg_gradient', ''),
        portal_card_border: getVal('portal_card_border', '#F4EBE4'),
        portal_primary_accent: getVal('portal_primary_accent', '#3C0E0E'),
        portal_accent_gradient: getVal('portal_accent_gradient', 'linear-gradient(135deg, #3C0E0E 0%, #2A0909 100%)'),
        portal_heading_color: getVal('portal_heading_color', '#3C0E0E'),
        portal_text_color: getVal('portal_text_color', '#334155'),
        portal_muted_color: getVal('portal_muted_color', '#7A6666'),
        portal_font_heading: getVal('portal_font_heading', 'Plus Jakarta Sans'),
        portal_font_body: getVal('portal_font_body', 'Plus Jakarta Sans'),
        portal_hero_bg: getVal('portal_hero_bg', '#3C0E0E'),
        portal_hero_gradient: getVal('portal_hero_gradient', 'linear-gradient(135deg, #3C0E0E 0%, #2A0909 100%)'),
        portal_hero_text_color: getVal('portal_hero_text_color', '#FFFFFF'),

        // Detail Bar Keunggulan Atas
        portal_footer_bg: getVal('portal_footer_bg', '#3C0E0E'),
        portal_footer_badges_gradient: getVal('portal_footer_badges_gradient', ''),
        portal_footer_text: getVal('portal_footer_text', '#FFFFFF'),
        portal_footer_badges_title: getVal('portal_footer_badges_title', 'Kenapa Memilih Arams Pictures?'),
        portal_footer_badges_subtitle: getVal('portal_footer_badges_subtitle', 'Premium Client Experience'),

        // Detail Footer Utama Bagian Bawah
        portal_footer_main_bg: getVal('portal_footer_main_bg', '#F4EBE4'),
        portal_footer_main_text: getVal('portal_footer_main_text', '#334155'),
        portal_footer_heading_color: getVal('portal_footer_heading_color', '#3C0E0E'),
        portal_footer_muted_color: getVal('portal_footer_muted_color', '#7A6666'),
        portal_footer_item_bg: getVal('portal_footer_item_bg', '#F4EBE4'),
        portal_footer_item_icon_color: getVal('portal_footer_item_icon_color', '#3C0E0E'),
        portal_footer_border_color: getVal('portal_footer_border_color', '#E8DDD5'),
        portal_footer_tagline: getVal('portal_footer_tagline', 'Capturing Moments, Creating Timeless Memories'),
        portal_footer_contact_title: getVal('portal_footer_contact_title', 'Hubungi Kami'),
        portal_footer_contact_subtitle: getVal('portal_footer_contact_subtitle', 'Kami siap membantu Anda kapan saja.'),
        portal_footer_social_title: getVal('portal_footer_social_title', 'Ikuti Kami'),
        portal_footer_social_subtitle: getVal('portal_footer_social_subtitle', 'Ikuti sosial media kami untuk update terbaru.'),
        portal_footer_copyright: getVal('portal_footer_copyright', '© 2026 Arams Photography. All rights reserved.'),

        // Tombol Portal
        portal_btn_bg: getVal('portal_btn_bg', '#FFFFFF'),
        portal_btn_text: getVal('portal_btn_text', '#3C0E0E'),
        portal_btn_border: getVal('portal_btn_border', '#FFFFFF'),
        portal_btn_hover_bg: getVal('portal_btn_hover_bg', '#3C0E0E'),
        portal_btn_hover_text: getVal('portal_btn_hover_text', '#FFFFFF'),
    });

    const [portalPreviewTab, setPortalPreviewTab] = useState<'dashboard' | 'project_detail'>('dashboard');
    const [saving, setSaving] = useState(false);

    const portalPresets = [
        {
            id: 'arams_maroon_luxury',
            name: 'Arams Maroon Luxury (Default)',
            description: 'Dark Burgundy #3C0E0E, Warm Cream #F4EBE4 & Off-White #FBF6F0',
            portal_bg_color: '#FBF6F0',
            portal_bg_gradient: '',
            portal_nav_bg: '#3C0E0E',
            portal_nav_gradient: 'linear-gradient(180deg, #3C0E0E 0%, #2A0909 100%)',
            portal_nav_text_color: '#FFFFFF',
            portal_nav_border_color: '#4D1212',
            portal_card_bg: '#FFFFFF',
            portal_card_border: '#F4EBE4',
            portal_primary_accent: '#3C0E0E',
            portal_accent_gradient: 'linear-gradient(135deg, #3C0E0E 0%, #2A0909 100%)',
            portal_heading_color: '#3C0E0E',
            portal_text_color: '#334155',
            portal_muted_color: '#7A6666',
            portal_font_heading: 'Plus Jakarta Sans',
            portal_font_body: 'Plus Jakarta Sans',
            portal_hero_bg: '#3C0E0E',
            portal_hero_gradient: 'linear-gradient(135deg, #3C0E0E 0%, #2A0909 100%)',
            portal_hero_text_color: '#FFFFFF',
            portal_footer_bg: '#3C0E0E',
            portal_footer_badges_gradient: '',
            portal_footer_text: '#FFFFFF',
            portal_footer_badges_title: 'Kenapa Memilih Arams Pictures?',
            portal_footer_badges_subtitle: 'Premium Client Experience',
            portal_footer_main_bg: '#F4EBE4',
            portal_footer_main_text: '#334155',
            portal_footer_heading_color: '#3C0E0E',
            portal_footer_muted_color: '#7A6666',
            portal_footer_item_bg: '#F4EBE4',
            portal_footer_item_icon_color: '#3C0E0E',
            portal_footer_border_color: '#E8DDD5',
            portal_footer_tagline: 'Capturing Moments, Creating Timeless Memories',
            portal_footer_contact_title: 'Hubungi Kami',
            portal_footer_contact_subtitle: 'Kami siap membantu Anda kapan saja.',
            portal_footer_social_title: 'Ikuti Kami',
            portal_footer_social_subtitle: 'Ikuti sosial media kami untuk update terbaru.',
            portal_footer_copyright: '© 2026 Arams Photography. All rights reserved.',
            badge: 'Official Default',
        },
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
            portal_footer_bg: '#1C132E',
            portal_footer_badges_gradient: '',
            portal_footer_text: '#FFFFFF',
            portal_footer_badges_title: 'Kenapa Memilih Arams Pictures?',
            portal_footer_badges_subtitle: 'Premium Client Experience',
            portal_footer_main_bg: '#FDFBF7',
            portal_footer_main_text: '#334155',
            portal_footer_heading_color: '#1C132E',
            portal_footer_muted_color: '#64748B',
            portal_footer_item_bg: '#FDFBF7',
            portal_footer_item_icon_color: '#C98922',
            portal_footer_border_color: '#E2E8F0',
            portal_footer_tagline: 'Capturing Moments, Creating Timeless Memories',
            portal_footer_contact_title: 'Hubungi Kami',
            portal_footer_contact_subtitle: 'Kami siap membantu Anda kapan saja.',
            portal_footer_social_title: 'Ikuti Kami',
            portal_footer_social_subtitle: 'Ikuti sosial media kami untuk update terbaru.',
            portal_footer_copyright: '© 2026 Arams Photography. All rights reserved.',
            badge: 'Master Gold',
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
            portal_footer_bg: '#0B0616',
            portal_footer_badges_gradient: '',
            portal_footer_text: '#FFFFFF',
            portal_footer_badges_title: 'Kenapa Memilih Arams Pictures?',
            portal_footer_badges_subtitle: 'Premium Client Experience',
            portal_footer_main_bg: '#130D24',
            portal_footer_main_text: '#CBD5E1',
            portal_footer_heading_color: '#FFFFFF',
            portal_footer_muted_color: '#94A3B8',
            portal_footer_item_bg: '#1C132E',
            portal_footer_item_icon_color: '#E5A93C',
            portal_footer_border_color: 'rgba(255, 255, 255, 0.12)',
            portal_footer_tagline: 'Capturing Moments, Creating Timeless Memories',
            portal_footer_contact_title: 'Hubungi Kami',
            portal_footer_contact_subtitle: 'Kami siap membantu Anda kapan saja.',
            portal_footer_social_title: 'Ikuti Kami',
            portal_footer_social_subtitle: 'Ikuti sosial media kami untuk update terbaru.',
            portal_footer_copyright: '© 2026 Arams Photography. All rights reserved.',
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
            portal_footer_bg: '#0F172A',
            portal_footer_badges_gradient: '',
            portal_footer_text: '#FFFFFF',
            portal_footer_badges_title: 'Kenapa Memilih Arams Pictures?',
            portal_footer_badges_subtitle: 'Premium Client Experience',
            portal_footer_main_bg: '#F8F9FA',
            portal_footer_main_text: '#334155',
            portal_footer_heading_color: '#0F172A',
            portal_footer_muted_color: '#64748B',
            portal_footer_item_bg: '#FFFFFF',
            portal_footer_item_icon_color: '#0F172A',
            portal_footer_border_color: '#E2E8F0',
            portal_footer_tagline: 'Capturing Moments, Creating Timeless Memories',
            portal_footer_contact_title: 'Hubungi Kami',
            portal_footer_contact_subtitle: 'Kami siap membantu Anda kapan saja.',
            portal_footer_social_title: 'Ikuti Kami',
            portal_footer_social_subtitle: 'Ikuti sosial media kami untuk update terbaru.',
            portal_footer_copyright: '© 2026 Arams Photography. All rights reserved.',
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
            portal_footer_badges_gradient: '',
            portal_footer_text: '#FFFFFF',
            portal_footer_badges_title: 'Kenapa Memilih Arams Pictures?',
            portal_footer_badges_subtitle: 'Premium Client Experience',
            portal_footer_main_bg: '#F0F4F8',
            portal_footer_main_text: '#1E293B',
            portal_footer_heading_color: '#0A192F',
            portal_footer_muted_color: '#64748B',
            portal_footer_item_bg: '#FFFFFF',
            portal_footer_item_icon_color: '#2563EB',
            portal_footer_border_color: '#DBEAFE',
            portal_footer_tagline: 'Capturing Moments, Creating Timeless Memories',
            portal_footer_contact_title: 'Hubungi Kami',
            portal_footer_contact_subtitle: 'Kami siap membantu Anda kapan saja.',
            portal_footer_social_title: 'Ikuti Kami',
            portal_footer_social_subtitle: 'Ikuti sosial media kami untuk update terbaru.',
            portal_footer_copyright: '© 2026 Arams Photography. All rights reserved.',
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
            portal_footer_badges_gradient: '',
            portal_footer_text: '#FFFFFF',
            portal_footer_badges_title: 'Kenapa Memilih Arams Pictures?',
            portal_footer_badges_subtitle: 'Premium Client Experience',
            portal_footer_main_bg: '#F0FDF4',
            portal_footer_main_text: '#065F46',
            portal_footer_heading_color: '#064E3B',
            portal_footer_muted_color: '#6EE7B7',
            portal_footer_item_bg: '#FFFFFF',
            portal_footer_item_icon_color: '#059669',
            portal_footer_border_color: '#D1FAE5',
            portal_footer_tagline: 'Capturing Moments, Creating Timeless Memories',
            portal_footer_contact_title: 'Hubungi Kami',
            portal_footer_contact_subtitle: 'Kami siap membantu Anda kapan saja.',
            portal_footer_social_title: 'Ikuti Kami',
            portal_footer_social_subtitle: 'Ikuti sosial media kami untuk update terbaru.',
            portal_footer_copyright: '© 2026 Arams Photography. All rights reserved.',
            badge: 'Emerald',
        },
    ];

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
            portal_footer_badges_gradient: preset.portal_footer_badges_gradient,
            portal_footer_text: preset.portal_footer_text,
            portal_footer_badges_title: preset.portal_footer_badges_title,
            portal_footer_badges_subtitle: preset.portal_footer_badges_subtitle,
            portal_footer_main_bg: preset.portal_footer_main_bg,
            portal_footer_main_text: preset.portal_footer_main_text,
            portal_footer_heading_color: preset.portal_footer_heading_color,
            portal_footer_muted_color: preset.portal_footer_muted_color,
            portal_footer_item_bg: preset.portal_footer_item_bg,
            portal_footer_item_icon_color: preset.portal_footer_item_icon_color,
            portal_footer_border_color: preset.portal_footer_border_color,
            portal_footer_tagline: preset.portal_footer_tagline,
            portal_footer_contact_title: preset.portal_footer_contact_title,
            portal_footer_contact_subtitle: preset.portal_footer_contact_subtitle,
            portal_footer_social_title: preset.portal_footer_social_title,
            portal_footer_social_subtitle: preset.portal_footer_social_subtitle,
            portal_footer_copyright: preset.portal_footer_copyright,
        });
        toast.info(`Preset Portal "${preset.name}" Dipilih. Klik Simpan untuk menerapkan.`);
    };

    const handleSave = (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        setSaving(true);
        router.post('/settings', { settings: portalForm }, {
            preserveScroll: true,
            onSuccess: () => {
                setSaving(false);
                toast.success('Pengaturan Tema & Footer Portal Klien Berhasil Disimpan!');
            },
            onError: () => {
                setSaving(false);
                toast.error('Gagal menyimpan pengaturan portal.');
            },
        });
    };

    const handleReset = () => {
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
                portal_footer_badges_gradient: defaultPreset.portal_footer_badges_gradient,
                portal_footer_text: defaultPreset.portal_footer_text,
                portal_footer_badges_title: defaultPreset.portal_footer_badges_title,
                portal_footer_badges_subtitle: defaultPreset.portal_footer_badges_subtitle,
                portal_footer_main_bg: defaultPreset.portal_footer_main_bg,
                portal_footer_main_text: defaultPreset.portal_footer_main_text,
                portal_footer_heading_color: defaultPreset.portal_footer_heading_color,
                portal_footer_muted_color: defaultPreset.portal_footer_muted_color,
                portal_footer_item_bg: defaultPreset.portal_footer_item_bg,
                portal_footer_item_icon_color: defaultPreset.portal_footer_item_icon_color,
                portal_footer_border_color: defaultPreset.portal_footer_border_color,
                portal_footer_tagline: defaultPreset.portal_footer_tagline,
                portal_footer_contact_title: defaultPreset.portal_footer_contact_title,
                portal_footer_contact_subtitle: defaultPreset.portal_footer_contact_subtitle,
                portal_footer_social_title: defaultPreset.portal_footer_social_title,
                portal_footer_social_subtitle: defaultPreset.portal_footer_social_subtitle,
                portal_footer_copyright: defaultPreset.portal_footer_copyright,
            },
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Tema & Footer Portal Klien Berhasil Direset ke Default');
            },
        });
    };

    return (
        <div className="space-y-4 pb-2 w-full max-w-full">
            <Head title="Kustomisasi Portal Klien - Arams Photography" />

            {/* Header Title & Subtitle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
                        Pengaturan Portal Klien
                    </h1>
                    <p className="text-sm mt-0.5 text-slate-500">
                        Kustomisasi tema visual, navigasi, detail bar keunggulan, dan footer bawah portal klien.
                    </p>
                </div>
            </div>

            {/* Header Banner & Quick Actions */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-slate-900">
                            Kustomisasi Tema, Bar Keunggulan &amp; Footer Portal Klien
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-[#C98922] border border-amber-200 uppercase tracking-wider">
                            Client Experience
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                        Sesuaikan warna latar belakang, navbar, hero banner, bar keunggulan atas, serta pecahkan detail footer bawah (background #F4EBE4, kontak, media sosial, dan hak cipta).
                    </p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Default</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        style={{ backgroundColor: portalForm.portal_primary_accent || '#3C0E0E' }}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan Portal'}</span>
                    </button>
                </div>
            </div>

            {/* Presets Cepat Pilihan */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#C98922]" />
                            <span>Pilihan Preset Tema Portal Klien</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                            Klik salah satu preset di bawah untuk menerapkan palet warna, bar keunggulan &amp; footer yang telah dikurasi.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pt-1">
                    {portalPresets.map((preset) => {
                        const isSelected = portalForm.portal_preset === preset.id;

                        return (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => handleApplyPortalPreset(preset)}
                                className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-2.5 ${
                                    isSelected
                                        ? 'border-[#3C0E0E] bg-rose-50/40 ring-2 ring-[#3C0E0E]/20 shadow-xs'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                        {preset.badge}
                                    </span>
                                    {isSelected && (
                                        <span className="w-4 h-4 rounded-full bg-[#3C0E0E] text-white flex items-center justify-center text-[10px] font-bold">
                                            ✓
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{preset.name}</h4>
                                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{preset.description}</p>
                                </div>

                                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                                    <span className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: preset.portal_nav_bg }} title="Navbar" />
                                    <span className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: preset.portal_primary_accent }} title="Aksen Utama" />
                                    <span className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: preset.portal_footer_main_bg }} title="Footer Bawah" />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2-Column: Form Customizer & Live Preview */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Form Controls (7 cols) */}
                <form onSubmit={handleSave} className="xl:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-8">
                    {/* SEKSI 1: WARNA & GRADIENT DASAR PORTAL */}
                    <div className="space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                <Palette className="w-4 h-4 text-rose-600" />
                                <span>1. Tema Dasar, Navbar &amp; Kartu Konten</span>
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Atur warna dasar latar belakang portal, navbar header, aksen tombol, dan kartu konten.
                            </p>
                        </div>

                        <div className="space-y-1">
                            <ColorSettingRow
                                label="Latar Belakang Halaman Portal"
                                description="Warna dasar canvas utama halaman portal klien"
                                value={portalForm.portal_bg_color}
                                onChange={(c) => setPortalForm({ ...portalForm, portal_bg_color: c })}
                                presets={[{ hex: '#FBF6F0', label: 'Warm Off-White' }, { hex: '#FFFFFF', label: 'Pure White' }, { hex: '#0B0616', label: 'Dark Obsidian' }, { hex: '#F0F4F8', label: 'Ice Blue' }, { hex: '#F0FDF4', label: 'Mint Mist' }]}
                            />

                            <GradientBuilder
                                label="Latar Belakang Gradient Halaman (Opsional)"
                                value={portalForm.portal_bg_gradient}
                                onChange={(val) => setPortalForm({ ...portalForm, portal_bg_gradient: val })}
                            />

                            <ColorSettingRow
                                label="Warna Latar Navbar Header"
                                description="Warna bar navigasi di bagian paling atas portal klien"
                                value={portalForm.portal_nav_bg}
                                onChange={(c) => setPortalForm({ ...portalForm, portal_nav_bg: c })}
                                presets={[{ hex: '#3C0E0E', label: 'Classic Maroon' }, { hex: '#0A192F', label: 'Navy' }, { hex: '#FFFFFF', label: 'White' }, { hex: '#064E3B', label: 'Pine Forest' }]}
                            />

                            <GradientBuilder
                                label="Gradient Navbar Header (Opsional)"
                                value={portalForm.portal_nav_gradient}
                                onChange={(val) => setPortalForm({ ...portalForm, portal_nav_gradient: val })}
                            />

                            <ColorSettingRow
                                label="Warna Aksen Utama Portal"
                                description="Warna tombol utama, ikon aktif, badge status, dan sorotan"
                                value={portalForm.portal_primary_accent}
                                onChange={(c) => setPortalForm({ ...portalForm, portal_primary_accent: c })}
                                presets={[{ hex: '#3C0E0E', label: 'Royal Maroon' }, { hex: '#C98922', label: 'Champagne Gold' }, { hex: '#2563EB', label: 'Electric Blue' }, { hex: '#059669', label: 'Emerald' }]}
                            />

                            <ColorSettingRow
                                label="Warna Kartu &amp; Kontainer Konten"
                                description="Warna dasar card project, galeri foto, dan invoice"
                                value={portalForm.portal_card_bg}
                                onChange={(c) => setPortalForm({ ...portalForm, portal_card_bg: c })}
                                presets={[{ hex: '#FFFFFF', label: 'White' }, { hex: '#1C132E', label: 'Dark Card' }, { hex: '#FDFBF7', label: 'Soft Ivory' }]}
                            />

                            <ColorSettingRow
                                label="Warna Latar Hero Banner Selamat Datang"
                                description="Latar belakang card hero sambutan untuk pengantin"
                                value={portalForm.portal_hero_bg}
                                onChange={(c) => setPortalForm({ ...portalForm, portal_hero_bg: c })}
                            />

                            <GradientBuilder
                                label="Gradient Hero Banner Sambutan (Opsional)"
                                value={portalForm.portal_hero_gradient}
                                onChange={(val) => setPortalForm({ ...portalForm, portal_hero_gradient: val })}
                            />
                        </div>
                    </div>

                    {/* SEKSI 2: BAR KEUNGGULAN ATAS ("KENAPA MEMILIH ARAMS PICTURES?") */}
                    <div className="space-y-4 pt-2">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-rose-600" />
                                <span>2. Bar Keunggulan Atas ("Kenapa Memilih Arams Pictures?")</span>
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Kustomisasi warna latar, gradient, teks, dan judul bar 5 kartu keunggulan di atas footer.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Judul Bar Keunggulan
                                </label>
                                <input
                                    type="text"
                                    value={portalForm.portal_footer_badges_title}
                                    onChange={(e) => setPortalForm({ ...portalForm, portal_footer_badges_title: e.target.value })}
                                    placeholder="KENAPA MEMILIH ARAMS PICTURES?"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Subjudul Kanan Bar Keunggulan
                                </label>
                                <input
                                    type="text"
                                    value={portalForm.portal_footer_badges_subtitle}
                                    onChange={(e) => setPortalForm({ ...portalForm, portal_footer_badges_subtitle: e.target.value })}
                                    placeholder="PREMIUM CLIENT EXPERIENCE"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-1 pt-1">
                            <ColorSettingRow
                                label="Warna Latar Bar Keunggulan"
                                description="Warna dasar latar belakang bar keunggulan (default maroon #3C0E0E)"
                                value={portalForm.portal_footer_bg}
                                onChange={(c) => setPortalForm({ ...portalForm, portal_footer_bg: c })}
                                presets={[
                                    { hex: '#3C0E0E', label: 'Classic Maroon' },
                                    { hex: '#22070A', label: 'Dark Wine' },
                                    { hex: '#1C132E', label: 'Obsidian Cinema' },
                                    { hex: '#0F172A', label: 'Deep Navy' },
                                    { hex: '#064E3B', label: 'Dark Emerald' },
                                ]}
                            />

                            <GradientBuilder
                                label="Gradient Bar Keunggulan Atas (Opsional)"
                                value={portalForm.portal_footer_badges_gradient}
                                onChange={(val) => setPortalForm({ ...portalForm, portal_footer_badges_gradient: val })}
                            />

                            <ColorSettingRow
                                label="Warna Teks &amp; Ikon Kartu Keunggulan"
                                description="Warna tulisan judul, deskripsi, dan ikon badge kartu keunggulan"
                                value={portalForm.portal_footer_text}
                                onChange={(c) => setPortalForm({ ...portalForm, portal_footer_text: c })}
                                presets={[
                                    { hex: '#FFFFFF', label: 'Pure White (Standar)' },
                                    { hex: '#F4EBE4', label: 'Warm Cream' },
                                    { hex: '#E2E8F0', label: 'Soft Slate' },
                                ]}
                            />
                        </div>
                    </div>

                    {/* SEKSI 3: FOOTER UTAMA BAGIAN BAWAH (BACKGROUND #F4EBE4 & DETAILNYA) */}
                    <div className="space-y-4 pt-2">
                        <div className="border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-rose-600" />
                                    <span>3. Footer Utama Bagian Bawah (Brand, Kontak &amp; Sosial Media)</span>
                                </h3>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F4EBE4] text-[#3C0E0E] border border-[#E8DDD5]">
                                    Default #F4EBE4
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Kustomisasi detail warna latar (#F4EBE4), teks, ikon kontak, sosial media, dan teks informasi hak cipta.
                            </p>
                        </div>

                        {/* Palet Warna Footer Bawah */}
                        <div className="space-y-1">
                            <ColorSettingRow
                                label="Warna Latar Belakang Footer Bawah"
                                description="Warna dasar footer utama bagian bawah (default #F4EBE4)"
                                value={portalForm.portal_footer_main_bg}
                                onChange={(c) => setPortalForm({ ...portalForm, portal_footer_main_bg: c })}
                                presets={[
                                    { hex: '#F4EBE4', label: 'Warm Rosy Cream (Default)' },
                                    { hex: '#FAF7F5', label: 'Soft Ivory' },
                                    { hex: '#FFFFFF', label: 'Pure White' },
                                    { hex: '#F8FAFC', label: 'Light Slate' },
                                    { hex: '#1C132E', label: 'Dark Mode' },
                                ]}
                            />

                            <ColorSettingRow
                                label="Warna Judul Kolom (Heading)"
                                description="Warna nama brand, 'HUBUNGI KAMI', dan 'IKUTI KAMI' (default maroon #3C0E0E)"
                                value={portalForm.portal_footer_heading_color}
                                onChange={(c) => setPortalForm({ ...portalForm, portal_footer_heading_color: c })}
                                presets={[
                                    { hex: '#3C0E0E', label: 'Classic Maroon' },
                                    { hex: '#0F172A', label: 'Slate Dark' },
                                    { hex: '#C98922', label: 'Gold' },
                                    { hex: '#FFFFFF', label: 'White' },
                                ]}
                            />

                            <ColorSettingRow
                                label="Warna Teks Isi &amp; Nilai Kontak"
                                description="Warna nomor WhatsApp, email, dan jam operasional"
                                value={portalForm.portal_footer_main_text}
                                onChange={(c) => setPortalForm({ ...portalForm, portal_footer_main_text: c })}
                                presets={[
                                    { hex: '#334155', label: 'Slate 700' },
                                    { hex: '#1E293B', label: 'Slate 800' },
                                    { hex: '#475569', label: 'Slate 600' },
                                    { hex: '#F8FAFC', label: 'Light' },
                                ]}
                            />

                            <ColorSettingRow
                                label="Warna Label Muted &amp; Subjudul"
                                description="Warna label kecil 'WHATSAPP', 'EMAIL', subjudul, dan copyright"
                                value={portalForm.portal_footer_muted_color}
                                onChange={(c) => setPortalForm({ ...portalForm, portal_footer_muted_color: c })}
                                presets={[
                                    { hex: '#7A6666', label: 'Warm Muted Maroon' },
                                    { hex: '#64748B', label: 'Slate Muted' },
                                    { hex: '#94A3B8', label: 'Soft Gray' },
                                ]}
                            />

                            <ColorSettingRow
                                label="Warna Lingkaran Ikon Kontak &amp; Sosmed"
                                description="Background lingkaran tombol ikon WhatsApp, email, jam, dan sosmed"
                                value={portalForm.portal_footer_item_bg}
                                onChange={(c) => setPortalForm({ ...portalForm, portal_footer_item_bg: c })}
                                presets={[
                                    { hex: '#F4EBE4', label: 'Cream #F4EBE4' },
                                    { hex: '#FFFFFF', label: 'Pure White' },
                                    { hex: '#FAF7F5', label: 'Soft Ivory' },
                                    { hex: '#3C0E0E', label: 'Maroon' },
                                ]}
                            />

                            <ColorSettingRow
                                label="Warna Ikon Kontak &amp; Sosmed"
                                description="Warna simbol ikon di dalam lingkaran"
                                value={portalForm.portal_footer_item_icon_color}
                                onChange={(c) => setPortalForm({ ...portalForm, portal_footer_item_icon_color: c })}
                                presets={[
                                    { hex: '#3C0E0E', label: 'Maroon #3C0E0E' },
                                    { hex: '#0F172A', label: 'Slate' },
                                    { hex: '#C98922', label: 'Gold' },
                                    { hex: '#FFFFFF', label: 'White' },
                                ]}
                            />

                            <ColorSettingRow
                                label="Warna Garis Pemisah (Border)"
                                description="Warna garis pemisah horizontal antara seksi footer"
                                value={portalForm.portal_footer_border_color}
                                onChange={(c) => setPortalForm({ ...portalForm, portal_footer_border_color: c })}
                                presets={[
                                    { hex: '#E8DDD5', label: 'Cream Border #E8DDD5' },
                                    { hex: '#E2E8F0', label: 'Slate Border' },
                                    { hex: '#CBD5E1', label: 'Darker Slate' },
                                ]}
                            />
                        </div>

                        {/* Konten Teks Footer Bawah */}
                        <div className="space-y-3.5 pt-3 border-t border-slate-100">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Deskripsi / Tagline Brand (Kolom Kiri)
                                </label>
                                <textarea
                                    rows={2}
                                    value={portalForm.portal_footer_tagline}
                                    onChange={(e) => setPortalForm({ ...portalForm, portal_footer_tagline: e.target.value })}
                                    placeholder="Capturing Moments, Creating Timeless Memories"
                                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white transition-all font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Judul Kolom Kontak (Tengah)
                                    </label>
                                    <input
                                        type="text"
                                        value={portalForm.portal_footer_contact_title}
                                        onChange={(e) => setPortalForm({ ...portalForm, portal_footer_contact_title: e.target.value })}
                                        placeholder="Hubungi Kami"
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Subjudul Kolom Kontak
                                    </label>
                                    <input
                                        type="text"
                                        value={portalForm.portal_footer_contact_subtitle}
                                        onChange={(e) => setPortalForm({ ...portalForm, portal_footer_contact_subtitle: e.target.value })}
                                        placeholder="Kami siap membantu Anda kapan saja."
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Judul Kolom Sosial Media (Kanan)
                                    </label>
                                    <input
                                        type="text"
                                        value={portalForm.portal_footer_social_title}
                                        onChange={(e) => setPortalForm({ ...portalForm, portal_footer_social_title: e.target.value })}
                                        placeholder="Ikuti Kami"
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Subjudul Kolom Sosial Media
                                    </label>
                                    <input
                                        type="text"
                                        value={portalForm.portal_footer_social_subtitle}
                                        onChange={(e) => setPortalForm({ ...portalForm, portal_footer_social_subtitle: e.target.value })}
                                        placeholder="Ikuti sosial media kami untuk update terbaru."
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Teks Hak Cipta (Copyright Footer)
                                </label>
                                <input
                                    type="text"
                                    value={portalForm.portal_footer_copyright}
                                    onChange={(e) => setPortalForm({ ...portalForm, portal_footer_copyright: e.target.value })}
                                    placeholder="© 2026 Arams Photography. All rights reserved."
                                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SEKSI 4: TIPOGRAFI & FONT PORTAL */}
                    <div className="pt-2 space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-rose-600" />
                                <span>4. Tipografi &amp; Font Portal</span>
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Pilih font keluarga heading dan isi teks portal klien.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Font Heading (Judul)</label>
                                <select
                                    value={portalForm.portal_font_heading}
                                    onChange={(e) => setPortalForm({ ...portalForm, portal_font_heading: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 cursor-pointer"
                                >
                                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Clean)</option>
                                    <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                                    <option value="Cinzel">Cinzel (Royal Classical Serif)</option>
                                    <option value="Inter">Inter (Minimalist Geometric)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Font Body (Teks Isi)</label>
                                <select
                                    value={portalForm.portal_font_body}
                                    onChange={(e) => setPortalForm({ ...portalForm, portal_font_body: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 cursor-pointer"
                                >
                                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                                    <option value="Inter">Inter</option>
                                    <option value="Roboto">Roboto</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            style={{ backgroundColor: portalForm.portal_primary_accent || '#3C0E0E' }}
                            className="inline-flex items-center gap-2 px-6 py-2.5 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                        >
                            <Save className="w-4 h-4" />
                            <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan Portal Klien'}</span>
                        </button>
                    </div>
                </form>

                {/* Live Preview (5 cols) */}
                <div className="xl:col-span-5 bg-slate-100/80 p-5 rounded-2xl border border-slate-200/80 space-y-4 sticky top-20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-rose-600" />
                            <span className="text-xs font-bold text-slate-800">Preview Live Portal Klien</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[10px] font-bold">
                            <button
                                type="button"
                                onClick={() => setPortalPreviewTab('dashboard')}
                                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                                    portalPreviewTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                Dashboard
                            </button>
                            <button
                                type="button"
                                onClick={() => setPortalPreviewTab('project_detail')}
                                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                                    portalPreviewTab === 'project_detail' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                Detail Project
                            </button>
                        </div>
                    </div>

                    {/* Preview Screen Canvas */}
                    <div
                        style={{
                            background: portalForm.portal_bg_gradient || portalForm.portal_bg_color || '#FBF6F0',
                            fontFamily: portalForm.portal_font_body || 'inherit',
                        }}
                        className="rounded-2xl border border-slate-300 shadow-md p-3.5 space-y-3 overflow-hidden text-xs"
                    >
                        {/* Mock Navbar */}
                        <div
                            style={{
                                background: portalForm.portal_nav_gradient || portalForm.portal_nav_bg || '#3C0E0E',
                                color: portalForm.portal_nav_text_color || '#FFFFFF',
                                borderColor: portalForm.portal_nav_border_color || 'transparent',
                            }}
                            className="px-3 py-2 rounded-xl border flex items-center justify-between text-[11px] font-bold shadow-xs"
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-black text-[10px]">
                                    AP
                                </span>
                                <span style={{ fontFamily: portalForm.portal_font_heading }}>ARAMS PICTURES</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">Portal Klien</span>
                        </div>

                        {/* Mock Hero Sambutan */}
                        <div
                            style={{
                                background: portalForm.portal_hero_gradient || portalForm.portal_hero_bg || '#3C0E0E',
                                color: portalForm.portal_hero_text_color || '#FFFFFF',
                            }}
                            className="p-3.5 rounded-xl space-y-1.5 text-center shadow-xs"
                        >
                            <h4
                                style={{ fontFamily: portalForm.portal_font_heading }}
                                className="text-xs font-black"
                            >
                                Selamat Datang, Sarah &amp; David
                            </h4>
                            <p className="text-[10px] opacity-80 max-w-xs mx-auto leading-tight">
                                Semua momen terindah pernikahan Anda dapat dipantau dan diunduh di sini.
                            </p>
                        </div>

                        {/* Mock Project Cards */}
                        <div
                            style={{
                                background: portalForm.portal_card_bg_gradient || portalForm.portal_card_bg || '#FFFFFF',
                                borderColor: portalForm.portal_card_border || '#F4EBE4',
                            }}
                            className="p-3 rounded-xl border space-y-2 shadow-2xs"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold block">Paket Terpilih</span>
                                    <h5 className="font-bold text-[11px] text-slate-900">Wedding Platinum Cinema</h5>
                                </div>
                                <span
                                    style={{
                                        background: portalForm.portal_accent_gradient || portalForm.portal_primary_accent,
                                        color: '#FFFFFF',
                                    }}
                                    className="px-2 py-0.5 rounded-full text-[8px] font-bold"
                                >
                                    Selesai
                                </span>
                            </div>
                            <button
                                type="button"
                                style={{
                                    background: portalForm.portal_accent_gradient || portalForm.portal_primary_accent,
                                    color: '#FFFFFF',
                                }}
                                className="w-full py-1.5 rounded-lg text-[10px] font-bold cursor-pointer shadow-xs"
                            >
                                Buka Galeri &amp; Unduh File
                            </button>
                        </div>

                        {/* Mock Bar Keunggulan Atas (Dark Bar) */}
                        <div
                            style={{
                                background: portalForm.portal_footer_badges_gradient || portalForm.portal_footer_bg || '#3C0E0E',
                                color: portalForm.portal_footer_text || '#FFFFFF',
                            }}
                            className="p-3 rounded-xl space-y-2 shadow-xs border border-white/10"
                        >
                            <div className="flex items-center justify-between">
                                <span
                                    style={{ fontFamily: portalForm.portal_font_heading }}
                                    className="text-[9px] font-extrabold uppercase tracking-wider"
                                >
                                    {portalForm.portal_footer_badges_title || 'Kenapa Memilih Arams Pictures?'}
                                </span>
                                <span className="text-[7px] font-bold uppercase opacity-75 tracking-wider hidden sm:inline">
                                    {portalForm.portal_footer_badges_subtitle || 'Premium Client Experience'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                                <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5">
                                    <Star className="w-3 h-3 text-white shrink-0" />
                                    <span className="text-[9px] font-bold truncate">Berpengalaman</span>
                                </div>
                                <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3 text-white shrink-0" />
                                    <span className="text-[9px] font-bold truncate">Kualitas Terbaik</span>
                                </div>
                            </div>
                        </div>

                        {/* Mock Main Footer Bawah (Warm Cream #F4EBE4) */}
                        <div
                            style={{
                                backgroundColor: portalForm.portal_footer_main_bg || '#F4EBE4',
                                borderColor: portalForm.portal_footer_border_color || '#E8DDD5',
                            }}
                            className="p-3 rounded-xl border space-y-2 text-[10px] transition-colors"
                        >
                            <div className="flex items-start justify-between gap-2 border-b pb-2" style={{ borderColor: portalForm.portal_footer_border_color || '#E8DDD5' }}>
                                <div>
                                    <h5
                                        style={{
                                            color: portalForm.portal_footer_heading_color || '#3C0E0E',
                                            fontFamily: portalForm.portal_font_heading,
                                        }}
                                        className="font-black text-[11px] tracking-tight"
                                    >
                                        Arams Pictures
                                    </h5>
                                    <p
                                        style={{ color: portalForm.portal_footer_main_text || '#334155' }}
                                        className="text-[8px] leading-tight mt-0.5 line-clamp-2"
                                    >
                                        {portalForm.portal_footer_tagline}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <span
                                        style={{ color: portalForm.portal_footer_heading_color || '#3C0E0E' }}
                                        className="font-bold text-[8px] uppercase tracking-wider block"
                                    >
                                        {portalForm.portal_footer_contact_title}
                                    </span>
                                    <span
                                        style={{ color: portalForm.portal_footer_main_text || '#334155' }}
                                        className="text-[8px] font-bold block"
                                    >
                                        +62 812-3456-7890
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-0.5">
                                <div className="flex items-center gap-1">
                                    {['wa', 'mail', 'ig', 'yt'].map((k) => (
                                        <div
                                            key={k}
                                            style={{
                                                backgroundColor: portalForm.portal_footer_item_bg || '#F4EBE4',
                                                borderColor: portalForm.portal_footer_border_color || '#E8DDD5',
                                                color: portalForm.portal_footer_item_icon_color || '#3C0E0E',
                                            }}
                                            className="w-4 h-4 rounded-full border flex items-center justify-center text-[7px] font-bold"
                                        >
                                            •
                                        </div>
                                    ))}
                                </div>
                                <span
                                    style={{ color: portalForm.portal_footer_muted_color || '#7A6666' }}
                                    className="text-[7px]"
                                >
                                    {portalForm.portal_footer_copyright}
                                </span>
                            </div>
                        </div>
                    </div>

                    <a
                        href="/client/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
                    >
                        <span>Buka Dashboard Portal Sebenarnya</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>
            </div>
        </div>
    );
}
