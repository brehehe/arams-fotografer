import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Database,
    UserCog,
    BarChart3,
    HardDrive,
    Settings,
    LogOut,
    ChevronDown,
    ChevronRight,
    Circle,
    Calendar,
    DollarSign,
    Menu,
    X,
    HeartHandshake,
    ExternalLink,
} from 'lucide-react';

interface AramsSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function AramsSidebar({ isOpen = true, onClose }: AramsSidebarProps) {
    const { url, props: pageProps } = usePage<any>();
    const currentPath = (url || '').split('?')[0].split('#')[0];
    const isMasterData = currentPath.startsWith('/master-data') &&
        !currentPath.startsWith('/master-data/promo-slides') &&
        !currentPath.startsWith('/master-data/testimonials') &&
        !currentPath.startsWith('/master-data/instagram-posts');
    const [masterDataOpen, setMasterDataOpen] = useState(isMasterData);

    const isSettingSection = currentPath.startsWith('/setting') ||
        currentPath.startsWith('/settings') ||
        currentPath.startsWith('/master-data/promo-slides') ||
        currentPath.startsWith('/master-data/testimonials') ||
        currentPath.startsWith('/master-data/instagram-posts');
    const [settingsOpen, setSettingsOpen] = useState(isSettingSection);

    useEffect(() => {
        if (isMasterData) {
            setMasterDataOpen(true);
        }
    }, [currentPath, isMasterData]);

    useEffect(() => {
        if (isSettingSection) {
            setSettingsOpen(true);
        }
    }, [currentPath, isSettingSection]);

    const isCurrent = (path: string) => {
        if (path === '/dashboard') return currentPath === '/dashboard' || currentPath === '/';
        if (path === '/wedding-organizer') return currentPath.startsWith('/wedding-organizer') || currentPath.startsWith('/wedding-organizers') || currentPath.startsWith('/weeding-organizer');
        if (path === '/client-sources') return currentPath.startsWith('/client-sources') || currentPath.startsWith('/sumber-klien');
        return currentPath === path || currentPath.startsWith(path + '/');
    };

    const user = pageProps?.auth?.user;
    const isOwnerOrAdmin = user?.is_admin || user?.roles?.some((r: string) => ['Super Admin', 'Owner', 'Admin'].includes(r));
    const isSupervisor = user?.is_supervisor || user?.roles?.includes('Supervisor');
    const isPhotographer = user?.is_photographer || user?.roles?.includes('Photographer');
    const isEditor = user?.is_editor || user?.roles?.includes('Editor');

    const canAccessClients = isOwnerOrAdmin || isSupervisor;
    const canAccessFinance = isOwnerOrAdmin || isSupervisor;
    const canAccessMasterData = isOwnerOrAdmin;
    const canAccessUsers = isOwnerOrAdmin;
    const canAccessReports = isOwnerOrAdmin || isSupervisor;
    const canAccessSettings = isOwnerOrAdmin;

    const mainNav = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: true },
        { name: 'Clients', href: '/clients', icon: Users, show: canAccessClients },
        { name: 'Projects & Orders', href: '/projects', icon: Briefcase, show: true },
        { name: 'Finance', href: '/finance', icon: DollarSign, show: canAccessFinance },
        { name: 'Calendar / Schedule', href: '/calendar', icon: Calendar, show: true },
    ].filter((item) => item.show !== false);

    const masterDataNav = [
        { name: 'Kategori Project', href: '/master-data/categories' },
        { name: 'Jenis Layanan', href: '/master-data/services' },
        { name: 'Paket & Harga', href: '/master-data/packages' },
        { name: 'Add-on & Biaya', href: '/master-data/addons' },
        { name: 'Workflow & Template', href: '/master-data/workflows' },
        { name: 'Metode Pembayaran', href: '/master-data/payment-methods' },
        { name: 'Template Catatan', href: '/master-data/notes' },
    ];

    const isFormKlienActive = currentPath.startsWith('/setting/form-klien') ||
        currentPath.startsWith('/settings/form-klien') ||
        (currentPath.startsWith('/settings') && (url || '').includes('tab=form_klien'));
    const isPortalKlienActive = currentPath.startsWith('/setting/portal-klien') ||
        currentPath.startsWith('/settings/portal-klien') ||
        (currentPath.startsWith('/settings') && (url || '').includes('tab=portal_klien'));
    const isAdminActive =
        currentPath.startsWith('/setting/admin') ||
        currentPath.startsWith('/settings/admin') ||
        (currentPath.startsWith('/settings') && !isFormKlienActive && !isPortalKlienActive) ||
        (currentPath === '/setting') ||
        currentPath.startsWith('/master-data/promo-slides') ||
        currentPath.startsWith('/master-data/testimonials') ||
        currentPath.startsWith('/master-data/instagram-posts');

    const settingNav = [
        { name: 'Admin', href: '/setting/admin', active: isAdminActive },
        { name: 'Form Klien', href: '/setting/form-klien', active: isFormKlienActive },
        { name: 'Portal Klien', href: '/setting/portal-klien', active: isPortalKlienActive },
    ];

    const secondaryNav = [
        { name: 'Sumber Klien', href: '/client-sources', icon: HeartHandshake, show: canAccessClients },
        { name: 'Users', href: '/users', icon: UserCog, show: canAccessUsers },
        { name: 'Reports', href: '/reports', icon: BarChart3, show: canAccessReports },
        { name: 'Files', href: '/files', icon: HardDrive, show: true },
    ].filter((item) => item.show !== false);

    const companyName = pageProps?.appSettings?.company_name || 'ARAMS PHOTOGRAPHY';
    const companySubtitle = pageProps?.appSettings?.company_subtitle || 'PHOTOGRAPHER';
    const companyLogo = pageProps?.appSettings?.company_logo || '';
    const sidebarBg = pageProps?.appSettings?.sidebar_bg_color || '#090F1D';
    const sidebarBgGradient = pageProps?.appSettings?.sidebar_bg_gradient || '';
    const sidebarActiveBg = pageProps?.appSettings?.sidebar_active_bg || '#F05322';
    const sidebarActiveBgGradient = pageProps?.appSettings?.sidebar_active_bg_gradient || '';
    const sidebarActiveText = pageProps?.appSettings?.sidebar_active_text || '#FFFFFF';
    const sidebarTextColor = pageProps?.appSettings?.sidebar_text_color || '#94A3B8';

    const initials = companyName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w: string) => w[0])
        .join('')
        .toUpperCase() || 'AP';

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside
                suppressHydrationWarning
                style={{ background: sidebarBgGradient || sidebarBg }}
                className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 text-slate-300 border-r border-white/5 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Brand Logo Header (Compact) */}
                <div className="flex items-center justify-between px-5 h-16 border-b border-white/5 shrink-0" suppressHydrationWarning>
                    <Link href="/dashboard" className="flex items-center gap-3 group min-w-0">
                        {companyLogo ? (
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shadow-xs border border-white/10 shrink-0 overflow-hidden">
                                    <img
                                        src={companyLogo}
                                        alt={companyName}
                                        className="max-h-full max-w-full object-contain"
                                    />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-xs tracking-[0.1em] text-white uppercase font-sans truncate">
                                        {companyName}
                                    </span>
                                    <span className="text-[9px] tracking-[0.2em] text-slate-400 font-semibold uppercase truncate">
                                        {companySubtitle}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#111A2E] border border-white/15 text-white shadow-sm font-sans font-bold text-xs group-hover:scale-105 transition-transform shrink-0">
                                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <rect x="3" y="3" width="18" height="18" rx="2" strokeDasharray="4 2" />
                                        <circle cx="12" cy="12" r="4" />
                                    </svg>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-xs tracking-[0.08em] text-white uppercase font-sans truncate">
                                        {companyName}
                                    </span>
                                    <span className="text-[8px] tracking-[0.22em] text-slate-400 font-medium uppercase truncate">
                                        {companySubtitle}
                                    </span>
                                </div>
                            </>
                        )}
                    </Link>

                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Nav Links (Compact Spacing) */}
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
                    {mainNav.map((item) => {
                        const active = isCurrent(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                style={active ? {
                                    background: sidebarActiveBgGradient || sidebarActiveBg,
                                    color: sidebarActiveText,
                                } : (sidebarTextColor ? { color: sidebarTextColor } : undefined)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${active
                                    ? 'shadow-md shadow-black/20 text-white font-bold'
                                    : 'hover:bg-white/10'
                                    }`}
                            >
                                <item.icon
                                    className="w-4 h-4 shrink-0"
                                    style={{ color: active ? sidebarActiveText : (sidebarTextColor || undefined) }}
                                />
                                <span className="flex-1">{item.name}</span>
                            </Link>
                        );
                    })}

                    {/* Master Data Collapsible Section */}
                    {canAccessMasterData && (
                        <div className="pt-0.5">
                            <button
                                type="button"
                                onClick={() => setMasterDataOpen(!masterDataOpen)}
                                style={!isMasterData && sidebarTextColor ? { color: sidebarTextColor } : undefined}
                                className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isMasterData
                                    ? 'text-white font-bold bg-white/5'
                                    : 'hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Database
                                        className="w-4 h-4 shrink-0"
                                        style={{ color: isMasterData ? (sidebarActiveBg || '#F05322') : (sidebarTextColor || undefined) }}
                                    />
                                    <span>Master Data</span>
                                </div>
                                <div style={{ color: sidebarTextColor || undefined }}>
                                    {masterDataOpen ? (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                    ) : (
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    )}
                                </div>
                            </button>

                            {/* Master Data Submenu */}
                            {masterDataOpen && (
                                <div className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-0.5 py-0.5 animate-in slide-in-from-top-1 duration-150">
                                    {masterDataNav.map((sub) => {
                                        const subActive = currentPath === sub.href || currentPath.startsWith(sub.href + '/');
                                        return (
                                            <Link
                                                key={sub.name}
                                                href={sub.href}
                                                style={subActive ? {
                                                    background: sidebarActiveBgGradient || sidebarActiveBg,
                                                    color: sidebarActiveText,
                                                } : (sidebarTextColor ? { color: sidebarTextColor } : undefined)}
                                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${subActive
                                                    ? 'font-bold shadow-xs'
                                                    : 'hover:bg-white/10 font-medium'
                                                    }`}
                                            >
                                                <span>{sub.name}</span>
                                                {subActive && (
                                                    <Circle className="w-1.5 h-1.5 fill-current" />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Secondary Navigation */}
                    {secondaryNav.map((item) => {
                        const active = isCurrent(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                style={active ? {
                                    background: sidebarActiveBgGradient || sidebarActiveBg,
                                    color: sidebarActiveText,
                                } : (sidebarTextColor ? { color: sidebarTextColor } : undefined)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${active
                                    ? 'shadow-xs text-white'
                                    : 'hover:bg-white/10'
                                    }`}
                            >
                                <item.icon
                                    className="w-4 h-4 shrink-0"
                                    style={{ color: active ? sidebarActiveText : (sidebarTextColor || undefined) }}
                                />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}

                    {/* Setting Collapsible Section */}
                    {canAccessSettings && (
                        <div className="pt-0.5">
                            <button
                                type="button"
                                onClick={() => setSettingsOpen(!settingsOpen)}
                                style={!isSettingSection && sidebarTextColor ? { color: sidebarTextColor } : undefined}
                                className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isSettingSection
                                    ? 'text-white font-bold bg-white/5'
                                    : 'hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Settings
                                        className="w-4 h-4 shrink-0"
                                        style={{ color: isSettingSection ? (sidebarActiveBg || '#F05322') : (sidebarTextColor || undefined) }}
                                    />
                                    <span>Setting</span>
                                </div>
                                <div style={{ color: sidebarTextColor || undefined }}>
                                    {settingsOpen ? (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                    ) : (
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    )}
                                </div>
                            </button>

                            {/* Setting Submenu */}
                            {settingsOpen && (
                                <div className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-0.5 py-0.5 animate-in slide-in-from-top-1 duration-150">
                                    {settingNav.map((sub) => {
                                        return (
                                            <Link
                                                key={sub.name}
                                                href={sub.href}
                                                style={sub.active ? {
                                                    background: sidebarActiveBgGradient || sidebarActiveBg,
                                                    color: sidebarActiveText,
                                                } : (sidebarTextColor ? { color: sidebarTextColor } : undefined)}
                                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${sub.active
                                                    ? 'font-bold shadow-xs'
                                                    : 'hover:bg-white/10 font-medium'
                                                    }`}
                                            >
                                                <span>{sub.name}</span>
                                                {sub.active && (
                                                    <Circle className="w-1.5 h-1.5 fill-current" />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Help & Support Card */}
                    {/* <div className="pt-4 pb-2">
                        <div className="p-3.5 rounded-2xl bg-[#111A2E]/80 border border-white/10 space-y-2">
                            <div className="flex items-center gap-2 text-amber-500">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                                </svg>
                                <span className="text-[11px] font-bold text-white">Butuh Bantuan?</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-snug">
                                Tim support kami siap membantu operasional studio Anda.
                            </p>
                            <a
                                href="https://wa.me/6281234567890"
                                target="_blank"
                                rel="noreferrer"
                                className="block w-full py-1.5 px-3 rounded-xl border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 text-center text-[11px] font-semibold transition-colors"
                            >
                                Contact Support
                            </a>
                        </div>
                    </div> */}
                </div>

                {/* Footer / Logout (Compact) */}
                <div className="p-3 border-t border-white/5 space-y-1.5 shrink-0" suppressHydrationWarning>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </Link>

                    <div className="px-3 text-[10px] text-slate-500 leading-tight">
                        © 2026 Arams Photography<br />All rights reserved.
                    </div>
                </div>
            </aside>
        </>
    );
}
