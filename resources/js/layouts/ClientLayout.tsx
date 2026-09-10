import { Link, usePage, router } from '@inertiajs/react';
import {
    Bell,
    ChevronDown,
    Home,
    FolderKanban,
    LogOut,
    User,
    Instagram,
    Youtube,
    Shield,
    FileText,
    Camera,
    CheckCircle2,
    Workflow,
    Facebook,
    Star,
    MessageCircle,
    Clock,
} from 'lucide-react';
import React, { useState } from 'react';

interface ClientLayoutProps {
    children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
    const { url, props } = usePage<any>();
    const user = props?.auth?.user;
    const appSettings = props?.appSettings || {};

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    // Dynamic Theme Tokens from Settings
    const portalBg = appSettings.portal_bg_color || '#FBF6F0';
    const portalBgGradient = appSettings.portal_bg_gradient || '';
    const portalNavBg = appSettings.portal_nav_bg || '#3C0E0E';
    const portalNavGradient = appSettings.portal_nav_gradient || '';
    const portalNavText = appSettings.portal_nav_text_color || '#FFFFFF';
    const portalNavBorder = appSettings.portal_nav_border_color || '#4D1212';
    const portalPrimaryAccent = appSettings.portal_primary_accent || '#3C0E0E';
    const portalAccentGradient = appSettings.portal_accent_gradient || '';
    const portalCardBg = appSettings.portal_card_bg || '#FFFFFF';
    const portalCardBorder = appSettings.portal_card_border || '#F4EBE4';
    const portalHeadingColor = appSettings.portal_heading_color || '#3C0E0E';
    const portalTextColor = appSettings.portal_text_color || '#334155';
    const portalMutedColor = appSettings.portal_muted_color || '#7A6666';
    const portalFontHeading = appSettings.portal_font_heading || 'Plus Jakarta Sans';
    const portalFontBody = appSettings.portal_font_body || 'Plus Jakarta Sans';
    const portalHeroBg = appSettings.portal_hero_bg || '#3C0E0E';
    const portalHeroGradient = appSettings.portal_hero_gradient || '';
    const portalHeroText = appSettings.portal_hero_text_color || '#FFFFFF';
    const portalFooterBg = appSettings.portal_footer_bg || '#3C0E0E';
    const portalFooterText = appSettings.portal_footer_text || '#F4EBE4';
    const portalBtnBg = appSettings.portal_btn_bg || '#FFFFFF';
    const portalBtnText = appSettings.portal_btn_text || '#3C0E0E';
    const portalBtnBorder = appSettings.portal_btn_border || '#FFFFFF';
    const portalBtnHoverBg = appSettings.portal_btn_hover_bg || '#3C0E0E';
    const portalBtnHoverText = appSettings.portal_btn_hover_text || '#FFFFFF';

    // Company Profile from Setting Admin (http://localhost:8000/setting/admin)
    const companyName = appSettings.company_name || 'Arams Pictures';
    const companySubtitle = appSettings.company_subtitle || 'STUDIO & CINEMA';
    const companyDescription =
        appSettings.company_description ||
        appSettings.company_tagline ||
        'Jasa fotografi & videografi profesional untuk mengabadikan setiap momen berharga Anda dengan kualitas sinematik terbaik.';
    const companyLogo = appSettings.company_logo || '';
    const companyWhatsapp = appSettings.company_whatsapp || appSettings.company_phone || '+62 812-3456-7890';
    const companyEmail = appSettings.company_email || 'hello@aramspictures.com';
    const companyHours = appSettings.company_operational_hours || 'Senin - Minggu, 09.00 - 18.00 WIB';

    // Footer Customization Tokens: Default #F4EBE4 (Warm Cream / Rosy Cream) for bottom footer
    const footerBadgesBg = appSettings.portal_footer_bg || appSettings.portal_footer_badges_bg || '#3C0E0E';
    const footerBadgesGradient = appSettings.portal_footer_badges_gradient || '';
    const footerBadgesText = appSettings.portal_footer_text || appSettings.portal_footer_badges_text || '#FFFFFF';
    const footerBadgesTitle = appSettings.portal_footer_badges_title || 'Kenapa Memilih Arams Pictures?';
    const footerBadgesSubtitle = appSettings.portal_footer_badges_subtitle || 'Premium Client Experience';

    const footerMainBg = appSettings.portal_footer_main_bg || '#F4EBE4';
    const footerMainText = appSettings.portal_footer_main_text || '#334155';
    const footerHeadingColor = appSettings.portal_footer_heading_color || portalHeadingColor || '#3C0E0E';
    const footerMutedColor = appSettings.portal_footer_muted_color || '#7A6666';
    const footerItemBg = appSettings.portal_footer_item_bg || '#F4EBE4';
    const footerItemIconColor = appSettings.portal_footer_item_icon_color || '#3C0E0E';
    const footerBorderColor = appSettings.portal_footer_border_color || '#E8DDD5';
    const footerTagline = appSettings.portal_footer_tagline || companyDescription;
    const footerContactTitle = appSettings.portal_footer_contact_title || 'Hubungi Kami';
    const footerContactSubtitle = appSettings.portal_footer_contact_subtitle || 'Kami siap membantu Anda kapan saja.';
    const footerSocialTitle = appSettings.portal_footer_social_title || 'Ikuti Kami';
    const footerSocialSubtitle = appSettings.portal_footer_social_subtitle || 'Ikuti sosial media kami untuk update terbaru.';
    const footerCopyright = appSettings.portal_footer_copyright || `© 2026 ${companyName}. All rights reserved.`;

    const footerFontHeading = appSettings.portal_font_heading || appSettings.font_family_heading || 'Plus Jakarta Sans';
    const footerFontBody = appSettings.portal_font_body || appSettings.font_family_body || 'Plus Jakarta Sans';

    const cleanWhatsapp = companyWhatsapp.replace(/[^0-9]/g, '');
    const whatsappLink = cleanWhatsapp ? `https://wa.me/${cleanWhatsapp}` : '#';

    // Safe hex to rgba converter for smooth transparent gradients and opacity
    const hexToRgba = (hex: string, alpha: number) => {
        if (!hex || !hex.startsWith('#')) {
            return hex;
        }

        const clean = hex.replace('#', '');

        if (clean.length === 3) {
            const r = parseInt(clean[0] + clean[0], 16);
            const g = parseInt(clean[1] + clean[1], 16);
            const b = parseInt(clean[2] + clean[2], 16);

            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        if (clean.length >= 6) {
            const r = parseInt(clean.substring(0, 2), 16);
            const g = parseInt(clean.substring(2, 4), 16);
            const b = parseInt(clean.substring(4, 6), 16);

            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        return hex;
    };

    const isCurrent = (path: string) => {
        const rawUrl = url || (typeof window !== 'undefined' ? window.location.pathname : '') || '';
        const currentUrl = rawUrl.split('?')[0].split('#')[0];

        if (path === '/client/dashboard' && (currentUrl === '/client/dashboard' || currentUrl === '/client' || currentUrl === '/portal')) {
            return true;
        }

        if (path === '/client/projects' && currentUrl.startsWith('/client/projects')) {
            return true;
        }

        if (path === '/client/portfolio' && (currentUrl.startsWith('/client/portfolio') || currentUrl.startsWith('/client/portfolios'))) {
            return true;
        }

        return false;
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div
            style={{
                backgroundColor: portalBg,
                color: portalTextColor,
            }}
            className="min-h-screen flex flex-col font-sans antialiased transition-colors duration-200 overflow-x-clip"
        >
            {/* Dynamic CSS Variables Injector for Portal Theme */}
            <style>{`
                :root {
                    --portal-bg: ${portalBg};
                    --portal-bg-gradient: ${portalBgGradient || 'none'};
                    --portal-nav-bg: ${portalNavBg};
                    --portal-nav-gradient: ${portalNavGradient || 'none'};
                    --portal-nav-text: ${portalNavText};
                    --portal-nav-border: ${portalNavBorder};
                    --portal-primary-accent: ${portalPrimaryAccent};
                    --portal-accent-gradient: ${portalAccentGradient || 'none'};
                    --portal-card-bg: ${portalCardBg};
                    --portal-card-border: ${portalCardBorder};
                    --portal-heading-color: ${portalHeadingColor};
                    --portal-text-color: ${portalTextColor};
                    --portal-muted-color: ${portalMutedColor};
                    --portal-hero-bg: ${portalHeroBg};
                    --portal-hero-gradient: ${portalHeroGradient || 'none'};
                    --portal-hero-text: ${portalHeroText};
                    --portal-footer-bg: ${portalFooterBg};
                    --portal-footer-text: ${portalFooterText};
                    --portal-font-heading: '${portalFontHeading}', serif;
                    --portal-font-body: '${portalFontBody}', sans-serif;
                    --portal-btn-bg: ${portalBtnBg};
                    --portal-btn-text: ${portalBtnText};
                    --portal-btn-border: ${portalBtnBorder};
                    --portal-btn-hover-bg: ${portalBtnHoverBg};
                    --portal-btn-hover-text: ${portalBtnHoverText};
                }

                /* Primary Client Button: Outline awal putih, background & text dari setting, hover berganti warna setting */
                .client-btn-primary {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-weight: 700;
                    font-size: 0.75rem;
                    padding: 0.5rem 1.15rem;
                    border-radius: 0.5rem;
                    background-color: var(--portal-btn-bg, #FFFFFF);
                    color: var(--portal-btn-text, #3C0E0E);
                    border: 1.5px solid var(--portal-btn-border, #FFFFFF);
                    outline: 2px solid var(--portal-btn-border, #FFFFFF);
                    outline-offset: 2px;
                    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    text-decoration: none;
                    user-select: none;
                }
                .client-btn-primary:hover {
                    background-color: var(--portal-btn-hover-bg, #3C0E0E) !important;
                    color: var(--portal-btn-hover-text, #FFFFFF) !important;
                    border-color: var(--portal-btn-border, #FFFFFF) !important;
                    outline: 2px solid var(--portal-btn-border, #FFFFFF) !important;
                    outline-offset: 2px;
                    box-shadow: 0 6px 20px rgba(60, 14, 14, 0.35);
                    transform: translateY(-1.5px);
                }
                .client-btn-primary:hover svg,
                .client-btn-primary:hover span {
                    color: var(--portal-btn-hover-text, #FFFFFF) !important;
                }

                /* Secondary / Pill Button: Outline awal putih semi-transparan, hover berganti warna setting */
                .client-btn-outline {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    font-size: 0.75rem;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    background-color: rgba(255, 255, 255, 0.15);
                    color: #FFFFFF;
                    border: 1.5px solid var(--portal-btn-border, #FFFFFF);
                    outline: 2px solid rgba(255, 255, 255, 0.6);
                    outline-offset: 2px;
                    backdrop-filter: blur(4px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    text-decoration: none;
                    user-select: none;
                }
                .client-btn-outline:hover {
                    background-color: var(--portal-btn-hover-bg, #3C0E0E) !important;
                    color: var(--portal-btn-hover-text, #FFFFFF) !important;
                    border-color: var(--portal-btn-border, #FFFFFF) !important;
                    outline: 2px solid var(--portal-btn-border, #FFFFFF) !important;
                    outline-offset: 2px;
                    box-shadow: 0 6px 20px rgba(60, 14, 14, 0.35);
                    transform: translateY(-1.5px);
                }
                .client-btn-outline:hover svg,
                .client-btn-outline:hover span {
                    color: var(--portal-btn-hover-text, #FFFFFF) !important;
                }

                /* Round Arrow / Control Button */
                .client-btn-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 9999px;
                    background-color: var(--portal-btn-bg, #FFFFFF);
                    color: var(--portal-btn-text, #3C0E0E);
                    border: 1.5px solid var(--portal-btn-border, #FFFFFF);
                    outline: 2px solid var(--portal-btn-border, #FFFFFF);
                    outline-offset: 2px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    transition: all 0.25s ease;
                    cursor: pointer;
                }
                .client-btn-icon:hover {
                    background-color: var(--portal-btn-hover-bg, #3C0E0E) !important;
                    color: var(--portal-btn-hover-text, #FFFFFF) !important;
                    border-color: var(--portal-btn-border, #FFFFFF) !important;
                    transform: scale(1.08);
                }
                .client-btn-icon:hover svg {
                    color: var(--portal-btn-hover-text, #FFFFFF) !important;
                }
            `}</style>

            {/* ── TOP HEADER NAVBAR (Screenshot 1, 2, 3) ──────────────────────── */}
            <header
                style={{
                    background: portalNavGradient || portalNavBg,
                    borderColor: portalNavBorder,
                    color: portalNavText,
                }}
                className="sticky top-0 z-40 border-b shadow-md transition-colors w-full"
            >
                <div className="w-full max-w-full px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
                    {/* Brand Logo Monogram */}
                    <Link href="/client/dashboard" className="flex items-center gap-2 sm:gap-3.5 group shrink-0">
                        <div
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderColor: 'rgba(255, 255, 255, 0.2)',
                                color: portalNavText,
                            }}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0"
                        >
                            <span className="font-serif italic font-bold text-sm tracking-tighter">ap</span>
                        </div>
                        <div className="hidden min-[480px]:flex flex-col">
                            <span
                                style={{
                                    color: portalNavText,
                                    fontFamily: `'${portalFontHeading}', serif`,
                                }}
                                className="font-black text-xs sm:text-base tracking-[0.15em] sm:tracking-[0.2em] uppercase whitespace-nowrap"
                            >
                                Arams Pictures
                            </span>
                            <span
                                style={{
                                    color: portalFooterText || '#F4EBE4',
                                }}
                                className="text-[8px] sm:text-[9px] tracking-[0.25em] sm:tracking-[0.3em] uppercase font-bold -mt-0.5 whitespace-nowrap"
                            >
                                Client Portal
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Pills */}
                    <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <Link
                            href="/client/dashboard"
                            style={
                                isCurrent('/client/dashboard')
                                    ? {
                                        backgroundColor: '#FFFFFF',
                                        color: portalNavBg,
                                    }
                                    : {
                                        color: `${portalNavText}cc`,
                                    }
                            }
                            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 ${!isCurrent('/client/dashboard') ? 'hover:bg-white/10 hover:text-white' : 'shadow-sm'
                                }`}
                        >
                            <Home className="w-4 h-4 shrink-0" />
                            <span className="hidden min-[460px]:inline">Beranda</span>
                        </Link>

                        <Link
                            href="/client/projects"
                            style={
                                isCurrent('/client/projects')
                                    ? {
                                        backgroundColor: '#FFFFFF',
                                        color: portalNavBg,
                                    }
                                    : {
                                        color: `${portalNavText}cc`,
                                    }
                            }
                            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 ${!isCurrent('/client/projects') ? 'hover:bg-white/10 hover:text-white' : 'shadow-sm'
                                }`}
                        >
                            <FolderKanban className="w-4 h-4 shrink-0" />
                            <span className="hidden min-[460px]:inline">Project</span>
                        </Link>

                        <Link
                            href="/client/portfolio"
                            style={
                                isCurrent('/client/portfolio')
                                    ? {
                                        backgroundColor: '#FFFFFF',
                                        color: portalNavBg,
                                    }
                                    : {
                                        color: `${portalNavText}cc`,
                                    }
                            }
                            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 ${!isCurrent('/client/portfolio') ? 'hover:bg-white/10 hover:text-white' : 'shadow-sm'
                                }`}
                        >
                            <Camera className="w-4 h-4 shrink-0" />
                            <span className="hidden min-[460px]:inline">Portofolio</span>
                        </Link>
                    </nav>

                    {/* Right Notification & User Profile */}
                    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center relative transition-colors cursor-pointer"
                                style={{ color: portalNavText }}
                            >
                                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span
                                    style={{
                                        backgroundColor: '#E11D48',
                                        borderColor: portalNavBg,
                                    }}
                                    className="absolute top-1 right-1 w-2 h-2 rounded-full border border-[#3C0E0E]"
                                />
                            </button>

                            {/* Notifications Dropdown */}
                            {notificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 text-xs animate-in fade-in zoom-in-95">
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                                            <span className="font-bold text-slate-900">Notifikasi</span>
                                            <span className="text-[10px] text-[#3C0E0E] font-semibold">Tandai sudah dibaca</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="p-2.5 rounded-xl bg-[#F4EBE4]/60 border border-[#F4EBE4]">
                                                <p className="font-bold text-slate-900 text-[11px]">Preview Foto Siap Dilihat</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">Editor telah mengunggah preview foto untuk Wedding Anda.</p>
                                                <span className="text-[9px] text-slate-400 mt-1 block">5 menit yang lalu</span>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-slate-50">
                                                <p className="font-bold text-slate-900 text-[11px]">Pembayaran Terverifikasi</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">Pembayaran termin DP telah berhasil diverifikasi oleh admin.</p>
                                                <span className="text-[9px] text-slate-400 mt-1 block">2 jam yang lalu</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* User Profile Menu */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-1.5 sm:gap-2.5 p-1 pr-1.5 sm:pr-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                            >
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold uppercase overflow-hidden shadow-2xs shrink-0">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src="/images/wedding-couple.jpg" alt="User" className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <span className="text-xs font-bold text-white max-w-[130px] truncate hidden sm:inline">
                                    {user?.name || 'Andi Pratama'}
                                </span>
                                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/70 shrink-0" />
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-xs animate-in fade-in zoom-in-95 divide-y divide-slate-100">
                                        <div className="px-3 py-2">
                                            <p className="font-bold text-slate-900 truncate">{user?.name || 'Andi Pratama'}</p>
                                            <p className="text-[11px] text-slate-500 truncate">{user?.email || 'andi.pratama@gmail.com'}</p>
                                            <span className="inline-block px-2 py-0.5 mt-1 rounded-full text-[9px] font-bold bg-[#F4EBE4] text-[#3C0E0E]">
                                                Akun Klien
                                            </span>
                                        </div>

                                        <div className="pt-1">
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="w-full px-3 py-2 rounded-xl flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer font-semibold"
                                            >
                                                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                                                <span>Keluar (Logout)</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-6 sm:pb-8">
                {children}
            </main>

            {/* ── FOOTER (Matching Screenshot 100%) ── */}
            <footer className="mt-auto transition-colors">
                {/* 1. Value Badges Dark Bar: KENAPA MEMILIH ARAMS PICTURES? */}
                <div
                    style={{
                        background: footerBadgesGradient || (footerBadgesBg
                            ? `linear-gradient(180deg, ${footerBadgesBg} 0%, ${hexToRgba(footerBadgesBg, 0.90)} 100%)`
                            : 'linear-gradient(180deg, #3C0E0E 0%, #2A0909 100%)'),
                        color: footerBadgesText || '#FFFFFF',
                    }}
                    className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-t border-b border-white/15"
                >
                    <div className="w-full max-w-full space-y-6">
                        <div className="flex items-center justify-between">
                            <h4
                                style={{
                                    fontFamily: `'${portalFontHeading}', serif`,
                                    color: footerBadgesText || '#FFFFFF',
                                }}
                                className="text-xs font-black uppercase tracking-widest text-white"
                            >
                                {footerBadgesTitle}
                            </h4>
                            <span
                                style={{
                                    color: footerBadgesText ? hexToRgba(footerBadgesText, 0.7) : 'rgba(255, 255, 255, 0.7)',
                                }}
                                className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-[0.2em]"
                            >
                                {footerBadgesSubtitle}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
                            {/* 1. Berpengalaman */}
                            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-white/30 transition-all duration-200 backdrop-blur-xs group shadow-xs">
                                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mt-0.5 group-hover:scale-105 group-hover:bg-white/15 transition-all shadow-2xs">
                                    <Star className="w-4 h-4 text-white" />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                    <h5 className="font-bold text-xs text-white truncate">Berpengalaman</h5>
                                    <p className="text-[11px] text-white/80 leading-snug transition-colors">
                                        Lebih dari 7 tahun mengabadikan momen berharga.
                                    </p>
                                </div>
                            </div>

                            {/* 2. Kualitas Terbaik */}
                            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-white/30 transition-all duration-200 backdrop-blur-xs group shadow-xs">
                                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mt-0.5 group-hover:scale-105 group-hover:bg-white/15 transition-all shadow-2xs">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                    <h5 className="font-bold text-xs text-white truncate">Kualitas Terbaik</h5>
                                    <p className="text-[11px] text-white/80 leading-snug transition-colors">
                                        Peralatan profesional & editing berkualitas tinggi.
                                    </p>
                                </div>
                            </div>

                            {/* 3. Pelayanan Personal */}
                            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-white/30 transition-all duration-200 backdrop-blur-xs group shadow-xs">
                                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mt-0.5 group-hover:scale-105 group-hover:bg-white/15 transition-all shadow-2xs">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                    <h5 className="font-bold text-xs text-white truncate">Pelayanan Personal</h5>
                                    <p className="text-[11px] text-white/80 leading-snug transition-colors">
                                        Kami mendengar & mewujudkan visi Anda.
                                    </p>
                                </div>
                            </div>

                            {/* 4. Proses Terorganisir */}
                            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-white/30 transition-all duration-200 backdrop-blur-xs group shadow-xs">
                                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mt-0.5 group-hover:scale-105 group-hover:bg-white/15 transition-all shadow-2xs">
                                    <Workflow className="w-4 h-4 text-white" />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                    <h5 className="font-bold text-xs text-white truncate">Proses Terorganisir</h5>
                                    <p className="text-[11px] text-white/80 leading-snug transition-colors">
                                        Alur kerja jelas, update rutin, dan tepat waktu.
                                    </p>
                                </div>
                            </div>

                            {/* 5. 100% Aman */}
                            <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 hover:border-white/30 transition-all duration-200 backdrop-blur-xs group shadow-xs col-span-2 md:col-span-1">
                                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mt-0.5 group-hover:scale-105 group-hover:bg-white/15 transition-all shadow-2xs">
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                    <h5 className="font-bold text-xs text-white truncate">100% Aman</h5>
                                    <p className="text-[11px] text-white/80 leading-snug transition-colors">
                                        Data & file Anda aman bersama kami.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Main Footer Body with Warm Cream Default #F4EBE4 */}
                <div
                    style={{
                        backgroundColor: footerMainBg,
                        color: footerMainText,
                        borderColor: footerBorderColor,
                        fontFamily: `'${footerFontBody}', sans-serif`,
                    }}
                    className="pt-10 pb-8 px-4 sm:px-6 lg:px-8 border-t transition-colors"
                >
                    {/* Bagian Footer Atas: 3 Kolom (Kiri, Tengah, Kanan) */}
                    <div
                        style={{ borderColor: footerBorderColor }}
                        className="w-full max-w-full grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 pb-8 border-b items-start"
                    >
                        {/* Kiri: Logo, Nama Brand / Usaha, Tagline Deskripsi */}
                        <div className="md:col-span-5 lg:col-span-4 space-y-3">
                            <div className="flex items-center gap-3">
                                {companyLogo ? (
                                    <img
                                        src={companyLogo}
                                        alt={companyName}
                                        className="h-10 w-auto max-w-[150px] object-contain"
                                    />
                                ) : (
                                    <div
                                        className="w-10 h-10 rounded-xl border flex items-center justify-center font-serif italic font-black text-sm shadow-2xs shrink-0"
                                        style={{
                                            borderColor: hexToRgba(portalPrimaryAccent, 0.25),
                                            backgroundColor: '#FFFFFF',
                                            color: portalPrimaryAccent,
                                        }}
                                    >
                                        {companyName ? companyName.substring(0, 2).toLowerCase() : 'ap'}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h3
                                        style={{
                                            color: footerHeadingColor,
                                            fontFamily: `'${footerFontHeading}', serif`,
                                        }}
                                        className="text-base font-black tracking-tight leading-tight truncate"
                                    >
                                        {companyName}
                                    </h3>
                                    {companySubtitle && (
                                        <p
                                            style={{ color: footerHeadingColor }}
                                            className="text-[10px] font-bold tracking-widest uppercase opacity-75 mt-0.5 truncate"
                                        >
                                            {companySubtitle}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <p
                                style={{ color: footerMainText }}
                                className="text-xs leading-relaxed max-w-sm"
                            >
                                {footerTagline}
                            </p>
                        </div>

                        {/* Tengah: Hubungi Kami */}
                        <div className="md:col-span-7 lg:col-span-5 space-y-3">
                            <h4
                                style={{
                                    color: footerHeadingColor,
                                    fontFamily: `'${footerFontHeading}', serif`,
                                }}
                                className="text-xs font-black uppercase tracking-wider"
                            >
                                {footerContactTitle}
                            </h4>
                            <p
                                style={{ color: footerMutedColor }}
                                className="text-xs"
                            >
                                {footerContactSubtitle}
                            </p>
                            <div className="flex flex-col sm:flex-row flex-wrap items-start gap-4 sm:gap-6 pt-1 text-xs">
                                {/* WhatsApp */}
                                <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2.5 group transition-transform hover:translate-x-0.5"
                                >
                                    <div
                                        style={{
                                            backgroundColor: footerItemBg,
                                            borderColor: footerBorderColor,
                                        }}
                                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-2xs transition-colors border group-hover:!bg-[#3C0E0E]"
                                    >
                                        <MessageCircle
                                            style={{ color: footerItemIconColor }}
                                            className="w-3.5 h-3.5 group-hover:!text-white transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <span
                                            style={{ color: footerMutedColor }}
                                            className="text-[10px] block font-bold uppercase tracking-wider"
                                        >
                                            WhatsApp
                                        </span>
                                        <span
                                            style={{ color: footerMainText }}
                                            className="font-bold text-xs group-hover:underline"
                                        >
                                            {companyWhatsapp}
                                        </span>
                                    </div>
                                </a>

                                {/* Email */}
                                <a
                                    href={`mailto:${companyEmail}`}
                                    className="flex items-center gap-2.5 group transition-transform hover:translate-x-0.5"
                                >
                                    <div
                                        style={{
                                            backgroundColor: footerItemBg,
                                            borderColor: footerBorderColor,
                                        }}
                                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-2xs transition-colors border group-hover:!bg-[#3C0E0E]"
                                    >
                                        <FileText
                                            style={{ color: footerItemIconColor }}
                                            className="w-3.5 h-3.5 group-hover:!text-white transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <span
                                            style={{ color: footerMutedColor }}
                                            className="text-[10px] block font-bold uppercase tracking-wider"
                                        >
                                            Email
                                        </span>
                                        <span
                                            style={{ color: footerMainText }}
                                            className="font-bold text-xs group-hover:underline"
                                        >
                                            {companyEmail}
                                        </span>
                                    </div>
                                </a>

                                {/* Jam Operasional */}
                                {/* <div className="flex items-center gap-2.5">
                                    <div
                                        style={{
                                            backgroundColor: footerItemBg,
                                            borderColor: footerBorderColor,
                                        }}
                                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-2xs border"
                                    >
                                        <Clock
                                            style={{ color: footerItemIconColor }}
                                            className="w-3.5 h-3.5"
                                        />
                                    </div>
                                    <div>
                                        <span
                                            style={{ color: footerMutedColor }}
                                            className="text-[10px] block font-bold uppercase tracking-wider"
                                        >
                                            Jam Operasional
                                        </span>
                                        <span
                                            style={{ color: footerMainText }}
                                            className="font-bold text-xs"
                                        >
                                            {companyHours}
                                        </span>
                                    </div>
                                </div> */}
                            </div>
                        </div>

                        {/* Kanan: Ikuti Kami */}
                        <div className="md:col-span-12 lg:col-span-3 space-y-3 lg:text-right">
                            <h4
                                style={{
                                    color: footerHeadingColor,
                                    fontFamily: `'${footerFontHeading}', serif`,
                                }}
                                className="text-xs font-black uppercase tracking-wider"
                            >
                                {footerSocialTitle}
                            </h4>
                            <p
                                style={{ color: footerMutedColor }}
                                className="text-xs"
                            >
                                {footerSocialSubtitle}
                            </p>
                            <div className="flex items-center gap-2.5 pt-1 lg:justify-end">
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        backgroundColor: footerItemBg,
                                        borderColor: footerBorderColor,
                                        color: footerItemIconColor,
                                    }}
                                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] transition-all shadow-2xs group cursor-pointer"
                                    aria-label="Instagram"
                                >
                                    <Instagram className="w-4 h-4 group-hover:text-white transition-colors" />
                                </a>
                                <a
                                    href="https://youtube.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        backgroundColor: footerItemBg,
                                        borderColor: footerBorderColor,
                                        color: footerItemIconColor,
                                    }}
                                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] transition-all shadow-2xs group cursor-pointer"
                                    aria-label="YouTube"
                                >
                                    <Youtube className="w-4 h-4 group-hover:text-white transition-colors" />
                                </a>
                                <a
                                    href="https://tiktok.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        backgroundColor: footerItemBg,
                                        borderColor: footerBorderColor,
                                        color: footerItemIconColor,
                                    }}
                                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] transition-all shadow-2xs group cursor-pointer"
                                    aria-label="TikTok"
                                >
                                    <span className="text-xs font-bold group-hover:text-white transition-colors">♪</span>
                                </a>
                                <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        backgroundColor: footerItemBg,
                                        borderColor: footerBorderColor,
                                        color: footerItemIconColor,
                                    }}
                                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] transition-all shadow-2xs group cursor-pointer"
                                    aria-label="Facebook"
                                >
                                    <Facebook className="w-4 h-4 group-hover:text-white transition-colors" />
                                </a>
                                <a
                                    href="https://pinterest.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        backgroundColor: footerItemBg,
                                        borderColor: footerBorderColor,
                                        color: footerItemIconColor,
                                    }}
                                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] transition-all shadow-2xs group cursor-pointer"
                                    aria-label="Pinterest"
                                >
                                    <span className="text-xs font-serif font-bold group-hover:text-white transition-colors">P</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bagian Footer Bawah: Copyright */}
                    <div
                        className="pt-6 flex items-center justify-center text-center text-xs"
                        style={{
                            color: footerMutedColor,
                            fontFamily: `'${footerFontBody}', sans-serif`,
                        }}
                    >
                        <span>{footerCopyright}</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
