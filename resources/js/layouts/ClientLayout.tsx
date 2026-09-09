import React, { useState } from 'react';
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
    ExternalLink,
    Camera,
    Sparkles,
    CheckCircle2,
    Award,
    HeartHandshake,
    Workflow,
    Facebook,
    Star,
    MessageCircle,
    Clock,
} from 'lucide-react';

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

    const isCurrent = (path: string) => {
        const rawUrl = url || (typeof window !== 'undefined' ? window.location.pathname : '') || '';
        const currentUrl = rawUrl.split('?')[0].split('#')[0];
        if (path === '/client/dashboard' && (currentUrl === '/client/dashboard' || currentUrl === '/client' || currentUrl === '/portal')) return true;
        if (path === '/client/projects' && currentUrl.startsWith('/client/projects')) return true;
        if (path === '/client/portfolio' && (currentUrl.startsWith('/client/portfolio') || currentUrl.startsWith('/client/portfolios'))) return true;
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
                            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 ${
                                !isCurrent('/client/dashboard') ? 'hover:bg-white/10 hover:text-white' : 'shadow-sm'
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
                            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 ${
                                !isCurrent('/client/projects') ? 'hover:bg-white/10 hover:text-white' : 'shadow-sm'
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
                            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 ${
                                !isCurrent('/client/portfolio') ? 'hover:bg-white/10 hover:text-white' : 'shadow-sm'
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

                                        <div className="py-1">
                                            <Link
                                                href="/client/dashboard"
                                                onClick={() => setDropdownOpen(false)}
                                                className="w-full px-3 py-2 rounded-xl flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                                            >
                                                <Home className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Beranda Portal</span>
                                            </Link>
                                            <Link
                                                href="/client/projects"
                                                onClick={() => setDropdownOpen(false)}
                                                className="w-full px-3 py-2 rounded-xl flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                                            >
                                                <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Project Saya</span>
                                            </Link>
                                            {user?.roles?.some((r: any) => r.name !== 'Client') && (
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="w-full px-3 py-2 rounded-xl flex items-center gap-2 font-bold text-[#3C0E0E] hover:bg-[#F4EBE4] transition-colors"
                                                >
                                                    <Camera className="w-3.5 h-3.5" />
                                                    <span>Studio Admin Dashboard</span>
                                                </Link>
                                            )}
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
            <main className="flex-1 w-full max-w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12">
                {children}
            </main>

            {/* ── FOOTER (Matching Screenshot 100%) ── */}
            <footer className="mt-auto transition-colors">
                {/* 1. Value Badges Dark Bar: KENAPA MEMILIH ARAMS PICTURES? */}
                <div
                    style={{
                        backgroundColor: '#3C0E0E',
                        color: '#FFFFFF',
                    }}
                    className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8"
                >
                    <div className="w-full max-w-full space-y-6">
                        <h4
                            style={{
                                color: '#FFFFFF',
                                fontFamily: `'${portalFontHeading}', serif`,
                            }}
                            className="text-xs font-black uppercase tracking-widest"
                        >
                            Kenapa Memilih Arams Pictures?
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-6">
                            {/* 1. Berpengalaman */}
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#F4EBE4] shrink-0 mt-0.5">
                                    <Star className="w-4 h-4 text-[#F4EBE4]" />
                                </div>
                                <div className="space-y-0.5">
                                    <h5 className="font-bold text-xs text-white">Berpengalaman</h5>
                                    <p className="text-[11px] text-[#F4EBE4]/80 leading-snug">
                                        Lebih dari 7 tahun mengabadikan momen berharga.
                                    </p>
                                </div>
                            </div>

                            {/* 2. Kualitas Terbaik */}
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#F4EBE4] shrink-0 mt-0.5">
                                    <CheckCircle2 className="w-4 h-4 text-[#F4EBE4]" />
                                </div>
                                <div className="space-y-0.5">
                                    <h5 className="font-bold text-xs text-white">Kualitas Terbaik</h5>
                                    <p className="text-[11px] text-[#F4EBE4]/80 leading-snug">
                                        Peralatan profesional & editing berkualitas tinggi.
                                    </p>
                                </div>
                            </div>

                            {/* 3. Pelayanan Personal */}
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#F4EBE4] shrink-0 mt-0.5">
                                    <User className="w-4 h-4 text-[#F4EBE4]" />
                                </div>
                                <div className="space-y-0.5">
                                    <h5 className="font-bold text-xs text-white">Pelayanan Personal</h5>
                                    <p className="text-[11px] text-[#F4EBE4]/80 leading-snug">
                                        Kami mendengar & mewujudkan visi Anda.
                                    </p>
                                </div>
                            </div>

                            {/* 4. Proses Terorganisir */}
                            <div className="flex items-start gap-3">
                                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#F4EBE4] shrink-0 mt-0.5">
                                    <Workflow className="w-4 h-4 text-[#F4EBE4]" />
                                </div>
                                <div className="space-y-0.5">
                                    <h5 className="font-bold text-xs text-white">Proses Terorganisir</h5>
                                    <p className="text-[11px] text-[#F4EBE4]/80 leading-snug">
                                        Alur kerja jelas, update rutin, dan tepat waktu.
                                    </p>
                                </div>
                            </div>

                            {/* 5. 100% Aman */}
                            <div className="flex items-start gap-3 col-span-2 md:col-span-1">
                                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#F4EBE4] shrink-0 mt-0.5">
                                    <Shield className="w-4 h-4 text-[#F4EBE4]" />
                                </div>
                                <div className="space-y-0.5">
                                    <h5 className="font-bold text-xs text-white">100% Aman</h5>
                                    <p className="text-[11px] text-[#F4EBE4]/80 leading-snug">
                                        Data & file Anda aman bersama kami.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Main Footer Body with Warm Cream / Off-White Theme */}
                <div
                    style={{
                        backgroundColor: '#FBF6F0',
                        color: '#334155',
                        borderColor: '#F4EBE4',
                    }}
                    className="pt-10 pb-8 px-4 sm:px-6 lg:px-8 border-t"
                >
                    <div className="w-full max-w-full grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-[#F4EBE4]">
                        {/* Left: HUBUNGI KAMI */}
                        <div className="space-y-3">
                            <h4
                                style={{
                                    color: '#3C0E0E',
                                    fontFamily: `'${portalFontHeading}', serif`,
                                }}
                                className="text-xs font-black uppercase tracking-wider"
                            >
                                Hubungi Kami
                            </h4>
                            <p className="text-xs text-slate-500">
                                Kami siap membantu Anda kapan saja.
                            </p>
                            <div className="flex flex-wrap items-center gap-6 pt-1 text-xs text-slate-700">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-[#F4EBE4] flex items-center justify-center text-[#3C0E0E]">
                                        <MessageCircle className="w-3.5 h-3.5 text-[#3C0E0E]" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">WhatsApp</span>
                                        <span className="font-bold text-xs text-slate-800">+62 812-3456-7890</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-[#F4EBE4] flex items-center justify-center text-[#3C0E0E]">
                                        <FileText className="w-3.5 h-3.5 text-[#3C0E0E]" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Email</span>
                                        <span className="font-bold text-xs text-slate-800">hello@aramspictures.com</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-[#F4EBE4] flex items-center justify-center text-[#3C0E0E]">
                                        <Clock className="w-3.5 h-3.5 text-[#3C0E0E]" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Jam Operasional</span>
                                        <span className="font-bold text-xs text-slate-800">Senin - Minggu, 09.00 - 18.00 WIB</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: IKUTI KAMI */}
                        <div className="space-y-3 md:text-right">
                            <h4
                                style={{
                                    color: '#3C0E0E',
                                    fontFamily: `'${portalFontHeading}', serif`,
                                }}
                                className="text-xs font-black uppercase tracking-wider"
                            >
                                Ikuti Kami
                            </h4>
                            <p className="text-xs text-slate-500">
                                Ikuti sosial media kami untuk update terbaru.
                            </p>
                            <div className="flex items-center gap-3 pt-1 md:justify-end">
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:text-[#3C0E0E] hover:border-[#3C0E0E] transition-colors"
                                    aria-label="Instagram"
                                >
                                    <Instagram className="w-4 h-4" />
                                </a>
                                <a
                                    href="https://youtube.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:text-[#3C0E0E] hover:border-[#3C0E0E] transition-colors"
                                    aria-label="YouTube"
                                >
                                    <Youtube className="w-4 h-4" />
                                </a>
                                <a
                                    href="https://tiktok.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:text-[#3C0E0E] hover:border-[#3C0E0E] transition-colors"
                                    aria-label="TikTok"
                                >
                                    <span className="text-xs font-bold">♪</span>
                                </a>
                                <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:text-[#3C0E0E] hover:border-[#3C0E0E] transition-colors"
                                    aria-label="Facebook"
                                >
                                    <Facebook className="w-4 h-4" />
                                </a>
                                <a
                                    href="https://pinterest.com"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:text-[#3C0E0E] hover:border-[#3C0E0E] transition-colors"
                                    aria-label="Pinterest"
                                >
                                    <span className="text-xs font-serif font-bold">P</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* 3. Bottom Copyright Row */}
                    <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg border border-slate-300 flex items-center justify-center text-[#3C0E0E] font-serif italic font-bold text-[10px]">
                                ap
                            </div>
                            <span
                                style={{
                                    fontFamily: `'${portalFontHeading}', serif`,
                                    color: '#3C0E0E',
                                }}
                                className="font-black tracking-widest text-xs uppercase"
                            >
                                Arams
                            </span>
                        </div>

                        <div>
                            <span>© 2026 Arams Pictures. All rights reserved.</span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                            <Link href="#" className="hover:text-[#3C0E0E] transition-colors">Kebijakan Privasi</Link>
                            <span>|</span>
                            <Link href="#" className="hover:text-[#3C0E0E] transition-colors">Syarat &amp; Ketentuan</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
