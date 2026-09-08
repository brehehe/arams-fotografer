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
    const portalBg = appSettings.portal_bg_color || '#FAF8F5';
    const portalBgGradient = appSettings.portal_bg_gradient || '';
    const portalNavBg = appSettings.portal_nav_bg || '#240B10';
    const portalNavGradient = appSettings.portal_nav_gradient || '';
    const portalNavText = appSettings.portal_nav_text_color || '#FFFFFF';
    const portalNavBorder = appSettings.portal_nav_border_color || '#3D141C';
    const portalPrimaryAccent = appSettings.portal_primary_accent || '#4A151B';
    const portalAccentGradient = appSettings.portal_accent_gradient || '';
    const portalCardBg = appSettings.portal_card_bg || '#FFFFFF';
    const portalCardBorder = appSettings.portal_card_border || 'rgba(226, 232, 240, 0.8)';
    const portalHeadingColor = appSettings.portal_heading_color || '#240B10';
    const portalTextColor = appSettings.portal_text_color || '#334155';
    const portalMutedColor = appSettings.portal_muted_color || '#64748B';
    const portalFontHeading = appSettings.portal_font_heading || 'Plus Jakarta Sans';
    const portalFontBody = appSettings.portal_font_body || 'Plus Jakarta Sans';
    const portalHeroBg = appSettings.portal_hero_bg || '#240B10';
    const portalHeroGradient = appSettings.portal_hero_gradient || '';
    const portalHeroText = appSettings.portal_hero_text_color || '#FFFFFF';
    const portalFooterBg = appSettings.portal_footer_bg || '#1A070B';
    const portalFooterText = appSettings.portal_footer_text || '#FDA4AF';

    const isCurrent = (path: string) => {
        const rawUrl = url || (typeof window !== 'undefined' ? window.location.pathname : '') || '';
        const currentUrl = rawUrl.split('?')[0].split('#')[0];
        if (path === '/client/dashboard' && (currentUrl === '/client/dashboard' || currentUrl === '/client' || currentUrl === '/portal')) return true;
        if (path === '/client/projects' && currentUrl.startsWith('/client/projects')) return true;
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
                                    color: portalFooterText || '#FDA4AF',
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
                                          backgroundColor: portalNavText,
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
                                          backgroundColor: portalNavText,
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
                            <span className="hidden min-[460px]:inline">Project Saya</span>
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
                                        backgroundColor: portalPrimaryAccent,
                                        borderColor: portalNavBg,
                                    }}
                                    className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 text-white rounded-full text-[8px] sm:text-[9px] font-bold flex items-center justify-center border-2"
                                >
                                    2
                                </span>
                            </button>

                            {/* Notifications Dropdown */}
                            {notificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 text-xs animate-in fade-in zoom-in-95">
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                                            <span className="font-bold text-slate-900">Notifikasi</span>
                                            <span className="text-[10px] text-[#4A151B] font-semibold">Tandai sudah dibaca</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
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
                                            <span className="inline-block px-2 py-0.5 mt-1 rounded-full text-[9px] font-bold bg-rose-100 text-[#4A151B]">
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
                                                    className="w-full px-3 py-2 rounded-xl flex items-center gap-2 font-bold text-[#4A151B] hover:bg-rose-50 transition-colors"
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

            {/* ── FOOTER ── */}
            <footer
                style={{
                    backgroundColor: portalFooterBg,
                    color: portalFooterText,
                    borderColor: portalNavBorder,
                }}
                className="mt-auto border-t pt-10 sm:pt-12 pb-0 transition-colors"
            >
                <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* Top 4 Value Badges (Kenapa Memilih Arams Pictures?) */}
                    <div
                        style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                        className="space-y-4 pb-8 border-b"
                    >
                        <h4
                            style={{ color: '#FFFFFF' }}
                            className="text-xs font-black uppercase tracking-wider"
                        >
                            Kenapa Memilih Arams Pictures?
                        </h4>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                            <div className="space-y-2">
                                <div
                                    style={{
                                        backgroundColor: `${portalPrimaryAccent}25`,
                                        color: portalFooterText || '#FDA4AF',
                                    }}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                >
                                    <Award className="w-4 h-4" />
                                </div>
                                <h5 style={{ color: '#FFFFFF' }} className="font-bold text-xs">Berpengalaman</h5>
                                <p className="text-[11px] opacity-80 leading-snug">
                                    Lebih dari 7 tahun mengabadikan momen berharga.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div
                                    style={{
                                        backgroundColor: `${portalPrimaryAccent}25`,
                                        color: portalFooterText || '#FDA4AF',
                                    }}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                >
                                    <Camera className="w-4 h-4" />
                                </div>
                                <h5 style={{ color: '#FFFFFF' }} className="font-bold text-xs">Kualitas Terbaik</h5>
                                <p className="text-[11px] opacity-80 leading-snug">
                                    Peralatan profesional &amp; editing berkualitas tinggi.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div
                                    style={{
                                        backgroundColor: `${portalPrimaryAccent}25`,
                                        color: portalFooterText || '#FDA4AF',
                                    }}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                >
                                    <HeartHandshake className="w-4 h-4" />
                                </div>
                                <h5 style={{ color: '#FFFFFF' }} className="font-bold text-xs">Pelayanan Personal</h5>
                                <p className="text-[11px] opacity-80 leading-snug">
                                    Pendekatan ramah &amp; perhatian detail untuk setiap klien.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div
                                    style={{
                                        backgroundColor: `${portalPrimaryAccent}25`,
                                        color: portalFooterText || '#FDA4AF',
                                    }}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                >
                                    <Workflow className="w-4 h-4" />
                                </div>
                                <h5 style={{ color: '#FFFFFF' }} className="font-bold text-xs">Proses Terorganisir</h5>
                                <p className="text-[11px] opacity-80 leading-snug">
                                    Alur kerja jelas, update rutin, dan tepat waktu.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Dark Copyright Bar */}
                <div
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                    }}
                    className="py-6 mt-6"
                >
                    <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                        {/* Brand & Tagline */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white font-serif italic font-bold text-xs">
                                ap
                            </div>
                            <div>
                                <h4
                                    style={{
                                        fontFamily: `'${portalFontHeading}', serif`,
                                    }}
                                    className="font-black tracking-widest text-white text-xs uppercase"
                                >
                                    Arams Pictures
                                </h4>
                                <p
                                    style={{ color: portalFooterText || '#FDA4AF' }}
                                    className="text-[10px] font-medium"
                                >
                                    Capture Your Moments, Tell Your Story
                                </p>
                            </div>
                        </div>

                        {/* Social Icons */}
                        <div className="flex flex-col items-center gap-1.5">
                            <span className="text-[10px] text-white/60 uppercase tracking-widest font-bold">
                                Ikuti Kami
                            </span>
                            <div className="flex items-center gap-3 text-white/80">
                                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
                                    <Instagram className="w-4 h-4" />
                                </a>
                                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="YouTube">
                                    <Youtube className="w-4 h-4" />
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">
                                    <Facebook className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Copyright & Links */}
                        <div className="flex flex-col md:items-end gap-1 text-[11px] text-white/70">
                            <span>© 2026 Arams Pictures. All rights reserved.</span>
                            <div className="flex items-center gap-3 text-[10px]">
                                <Link href="#" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
                                <span>|</span>
                                <Link href="#" className="hover:text-white transition-colors">Syarat &amp; Ketentuan</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
