import React, { useState, useEffect, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Menu,
    Search,
    SlidersHorizontal,
    Bell,
    ChevronDown,
    User as UserIcon,
    Settings as SettingsIcon,
    LogOut,
    ExternalLink,
    AlertTriangle,
    Clock,
    Calendar,
    Receipt,
    HardDrive,
    Folder,
    UserCheck,
    CheckCheck,
    X,
    Sparkles,
    FileText,
    ArrowRight,
    Loader2,
} from 'lucide-react';

interface LensariaHeaderProps {
    onMenuToggle?: () => void;
    title?: string;
    breadcrumbs?: Array<{ label: string; href?: string }>;
}

interface SearchItem {
    id: string;
    title: string;
    subtitle: string;
    url: string;
    badge?: string;
    date?: string;
    external_url?: string;
}

interface NotificationItem {
    id: string;
    type: string;
    category: 'files' | 'schedule' | 'finance' | 'general';
    title: string;
    message: string;
    time_ago: string;
    url: string;
    priority: 'high' | 'medium' | 'low';
    icon: string;
    color: 'rose' | 'amber' | 'blue' | 'purple' | 'emerald';
    is_read: boolean;
    created_at: string;
}

export default function LensariaHeader({
    onMenuToggle,
    title = 'Dashboard',
    breadcrumbs,
}: LensariaHeaderProps) {
    const { auth, appSettings } = usePage().props as any;
    const user = auth?.user || {
        name: 'Admin Lensaria',
        email: 'admin@lensaria.com',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        roles: [{ name: 'Administrator' }],
    };

    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
    const [notifFilter, setNotifFilter] = useState<'all' | 'files' | 'schedule_finance'>('all');
    
    // Notifications State
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loadingNotifs, setLoadingNotifs] = useState<boolean>(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<{
        projects: SearchItem[];
        clients: SearchItem[];
        files: SearchItem[];
        invoices: SearchItem[];
    }>({
        projects: [],
        clients: [],
        files: [],
        invoices: [],
    });

    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchDropdownRef = useRef<HTMLDivElement>(null);
    const notifDropdownRef = useRef<HTMLDivElement>(null);

    const roleName = user.role || (typeof user.roles?.[0] === 'string' ? user.roles[0] : user.roles?.[0]?.name) || 'Staff';
    const headerBg = appSettings?.header_bg_color || '#FFFFFF';
    const headerBgGradient = appSettings?.header_bg_gradient || '';
    const headerTextColor = appSettings?.header_text_color || '#0F172A';
    const headerBorderColor = appSettings?.header_border_color || 'rgba(226, 232, 240, 0.8)';
    const fontHeading = appSettings?.font_family_heading || 'Plus Jakarta Sans';

    const breadcrumbColor = appSettings?.breadcrumb_color || appSettings?.primary_accent_color || '#C98922';
    const breadcrumbActiveColor = appSettings?.breadcrumb_active_color || '#0F172A';

    // 1. Fetch Notifications
    const fetchNotifications = async () => {
        try {
            setLoadingNotifs(true);
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unread_count || 0);
            }
        } catch (e) {
            // ignore network errors
        } finally {
            setLoadingNotifs(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // 2. Mark All Notifications as Read
    const handleMarkAllRead = async () => {
        try {
            await fetch('/api/notifications/mark-read', { method: 'POST', headers: { 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content || '' } });
            setUnreadCount(0);
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (e) {
            setUnreadCount(0);
        }
    };

    // 3. Debounced Global Search
    useEffect(() => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            setSearchResults({ projects: [], clients: [], files: [], invoices: [] });
            setSearching(false);
            return;
        }

        setSearching(true);
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/global-search?q=${encodeURIComponent(searchQuery.trim())}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data.results || { projects: [], clients: [], files: [], invoices: [] });
                    setSearchOpen(true);
                }
            } catch (e) {
                // ignore
            } finally {
                setSearching(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // 4. Keyboard shortcut ⌘K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
                setSearchOpen(true);
            } else if (e.key === 'Escape') {
                setSearchOpen(false);
                setUserDropdownOpen(false);
                setNotifDropdownOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node) && !searchInputRef.current?.contains(e.target as Node)) {
                setSearchOpen(false);
            }
            if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
                setNotifDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filtered Notifications
    const filteredNotifications = notifications.filter((item) => {
        if (notifFilter === 'files') return item.category === 'files';
        if (notifFilter === 'schedule_finance') return item.category === 'schedule' || item.category === 'finance';
        return true;
    });

    const totalResults =
        searchResults.projects.length +
        searchResults.clients.length +
        searchResults.files.length +
        searchResults.invoices.length;

    // Route based dynamic breadcrumbs & title detection
    const pageUrl = (usePage().url || '').split('?')[0];
    let effectiveTitle = title;
    let effectiveBreadcrumbs = breadcrumbs;

    if (!breadcrumbs || breadcrumbs.length === 0) {
        if (pageUrl.startsWith('/projects/create')) {
            effectiveTitle = 'Buat Project Baru';
            effectiveBreadcrumbs = [
                { label: 'Projects & Orders', href: '/projects' },
                { label: 'Buat Project Baru' },
            ];
        } else if (pageUrl.includes('/invoice') || pageUrl.startsWith('/invoices/')) {
            effectiveTitle = 'Invoice (DP)';
            effectiveBreadcrumbs = [
                { label: 'Projects & Orders', href: '/projects' },
                { label: 'Invoice (DP)' },
            ];
        } else if (pageUrl.startsWith('/projects/') && pageUrl.endsWith('/edit')) {
            effectiveTitle = 'Edit Project';
            effectiveBreadcrumbs = [
                { label: 'Projects & Orders', href: '/projects' },
                { label: 'Edit Project' },
            ];
        } else if (pageUrl.startsWith('/projects/') && pageUrl !== '/projects') {
            effectiveTitle = 'Detail Project';
            effectiveBreadcrumbs = [
                { label: 'Projects & Orders', href: '/projects' },
                { label: 'Detail Project' },
            ];
        } else if (pageUrl.startsWith('/projects')) {
            effectiveTitle = 'Projects & Orders';
            effectiveBreadcrumbs = [
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Projects & Orders' },
            ];
        } else if (pageUrl.startsWith('/calendar')) {
            effectiveTitle = 'Calendar / Schedule';
            effectiveBreadcrumbs = [
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Calendar / Schedule' },
            ];
        } else if (pageUrl.startsWith('/clients')) {
            effectiveTitle = 'Clients';
            effectiveBreadcrumbs = [
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Clients' },
            ];
        } else if (pageUrl.startsWith('/finance')) {
            effectiveTitle = 'Finance';
            effectiveBreadcrumbs = [
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Finance' },
            ];
        } else if (pageUrl.startsWith('/reports')) {
            effectiveTitle = 'Reports';
            effectiveBreadcrumbs = [
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Reports' },
            ];
        } else if (pageUrl.startsWith('/files')) {
            effectiveTitle = 'Files';
            effectiveBreadcrumbs = [
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Files' },
            ];
        } else if (pageUrl.startsWith('/activity-log')) {
            effectiveTitle = 'Activity Log';
            effectiveBreadcrumbs = [
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Activity Log' },
            ];
        } else if (pageUrl.startsWith('/master-data/notes')) {
            effectiveTitle = 'Template Catatan';
            effectiveBreadcrumbs = [
                { label: 'Master Data', href: '/master-data/categories' },
                { label: 'Template Catatan' },
            ];
        } else if (pageUrl.startsWith('/master-data/packages')) {
            effectiveTitle = 'Paket & Harga';
            effectiveBreadcrumbs = [
                { label: 'Master Data', href: '/master-data/categories' },
                { label: 'Paket & Harga' },
            ];
        } else if (pageUrl.startsWith('/master-data/categories')) {
            effectiveTitle = 'Kategori Project';
            effectiveBreadcrumbs = [
                { label: 'Master Data', href: '/master-data/categories' },
                { label: 'Kategori Project' },
            ];
        } else if (pageUrl.startsWith('/master-data/services')) {
            effectiveTitle = 'Jenis Layanan';
            effectiveBreadcrumbs = [
                { label: 'Master Data', href: '/master-data/categories' },
                { label: 'Jenis Layanan' },
            ];
        } else if (pageUrl.startsWith('/master-data/addons')) {
            effectiveTitle = 'Add-on & Biaya';
            effectiveBreadcrumbs = [
                { label: 'Master Data', href: '/master-data/categories' },
                { label: 'Add-on & Biaya' },
            ];
        } else if (pageUrl.startsWith('/master-data/payment-methods')) {
            effectiveTitle = 'Metode Pembayaran';
            effectiveBreadcrumbs = [
                { label: 'Master Data', href: '/master-data/categories' },
                { label: 'Metode Pembayaran' },
            ];
        } else if (pageUrl.startsWith('/client-sources/') && pageUrl !== '/client-sources') {
            effectiveTitle = 'Detail Sumber Klien';
            effectiveBreadcrumbs = [
                { label: 'Sumber Klien', href: '/client-sources' },
                { label: 'Detail Sumber Klien' },
            ];
        } else if (pageUrl.startsWith('/client-sources') || pageUrl.startsWith('/sumber-klien')) {
            effectiveTitle = 'Sumber Klien / Referral';
            effectiveBreadcrumbs = [
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Sumber Klien' },
            ];
        } else if (pageUrl.startsWith('/wedding-organizer') || pageUrl.startsWith('/wedding-organizers')) {
            effectiveTitle = 'Wedding Organizer';
            effectiveBreadcrumbs = [
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Wedding Organizer' },
            ];
        } else if (pageUrl.startsWith('/settings')) {
            effectiveTitle = 'Settings';
            effectiveBreadcrumbs = [
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Settings' },
            ];
        }
    }

    return (
        <header
            style={{
                background: headerBgGradient || headerBg,
                borderColor: headerBorderColor,
                color: headerTextColor,
            }}
            className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-7 border-b transition-all shrink-0 backdrop-blur-md"
        >
            {/* Left: Hamburger + Breadcrumb */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuToggle}
                    style={{ color: headerTextColor }}
                    className="p-1.5 -ml-1.5 rounded-xl hover:bg-white/10 lg:hidden transition-colors cursor-pointer"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="flex flex-col justify-center">
                    <h1
                        style={{
                            color: headerTextColor,
                            fontFamily: `${fontHeading}, sans-serif`,
                        }}
                        className="text-base sm:text-lg font-bold tracking-tight leading-tight"
                    >
                        {effectiveTitle}
                    </h1>
                    {effectiveBreadcrumbs && effectiveBreadcrumbs.length > 0 ? (
                        <nav className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            {effectiveBreadcrumbs.map((crumb, idx) => (
                                <React.Fragment key={crumb.label}>
                                    {crumb.href ? (
                                        <Link
                                            href={crumb.href}
                                            className="hover:text-slate-700 transition-colors font-normal"
                                        >
                                            {crumb.label}
                                        </Link>
                                    ) : (
                                        <span className="font-medium text-slate-600">
                                            {crumb.label}
                                        </span>
                                    )}
                                    {idx < effectiveBreadcrumbs.length - 1 && (
                                        <span className="text-slate-300">›</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </nav>
                    ) : (
                        <nav className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <Link href="/dashboard" className="hover:text-slate-700 transition-colors font-normal">
                                Dashboard
                            </Link>
                            <span className="text-slate-300">›</span>
                            <span className="font-medium text-slate-600">{effectiveTitle}</span>
                        </nav>
                    )}
                </div>
            </div>

            {/* Right: Global Search, Notifications, Profile */}
            <div className="flex items-center gap-2.5 sm:gap-3.5">
                {/* ── 1. GLOBAL SEARCH WITH LIVE AUTOCOMPLETE ────────────────────────── */}
                <div className="relative w-48 sm:w-64 lg:w-80">
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onFocus={() => {
                                if (searchQuery.trim().length >= 2) setSearchOpen(true);
                            }}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search project, client, photographer..."
                            style={{
                                color: headerTextColor,
                                borderColor: headerBorderColor,
                            }}
                            className="w-full pl-8.5 pr-14 py-1.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 focus:bg-white text-xs placeholder-slate-400 border border-slate-200 focus:border-[#F05322] focus:ring-2 focus:ring-[#F05322]/20 transition-all outline-hidden"
                        />
                        {searching ? (
                            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 animate-spin" />
                        ) : searchQuery ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSearchOpen(false);
                                }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:opacity-100 rounded-md transition-opacity cursor-pointer opacity-60"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        ) : (
                            <kbd className="hidden lg:inline-flex items-center absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 bg-white/20 border border-white/30 rounded shadow-2xs">
                                ⌘K
                            </kbd>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {searchOpen && searchQuery.trim().length >= 2 && (
                        <div
                            ref={searchDropdownRef}
                            className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden max-h-[75vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
                        >
                            <div className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-700">
                                    Hasil Pencarian: <strong className="text-slate-900">"{searchQuery}"</strong>
                                </span>
                                <span className="text-[10px] text-slate-400">
                                    {totalResults} item ditemukan
                                </span>
                            </div>

                            <div className="overflow-y-auto p-2 space-y-3 divide-y divide-slate-100/60">
                                {totalResults === 0 && !searching && (
                                    <div className="py-8 text-center space-y-2">
                                        <Search className="w-8 h-8 text-slate-300 mx-auto" />
                                        <p className="text-xs font-bold text-slate-700">Tidak ada hasil ditemukan</p>
                                        <p className="text-[11px] text-slate-400">
                                            Coba gunakan kata kunci nama klien, nomor project, atau nomor invoice lain.
                                        </p>
                                    </div>
                                )}

                                {/* Projects Section */}
                                {searchResults.projects.length > 0 && (
                                    <div className="space-y-1 pt-1">
                                        <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                            <Folder className="w-3 h-3 text-amber-500" />
                                            <span>Project &amp; Acara ({searchResults.projects.length})</span>
                                        </span>
                                        <div className="space-y-0.5">
                                            {searchResults.projects.map((item) => (
                                                <Link
                                                    key={item.id}
                                                    href={item.url}
                                                    onClick={() => setSearchOpen(false)}
                                                    className="p-2 rounded-xl hover:bg-amber-50/60 transition-colors flex items-center justify-between gap-2 group block"
                                                >
                                                    <div className="min-w-0">
                                                        <span className="text-xs font-bold text-slate-900 group-hover:text-amber-800 block truncate">
                                                            {item.title}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 block truncate">
                                                            {item.subtitle}
                                                        </span>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 capitalize shrink-0">
                                                        {item.badge}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Clients Section */}
                                {searchResults.clients.length > 0 && (
                                    <div className="space-y-1 pt-2">
                                        <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                            <UserCheck className="w-3 h-3 text-blue-500" />
                                            <span>Klien ({searchResults.clients.length})</span>
                                        </span>
                                        <div className="space-y-0.5">
                                            {searchResults.clients.map((item) => (
                                                <Link
                                                    key={item.id}
                                                    href={item.url}
                                                    onClick={() => setSearchOpen(false)}
                                                    className="p-2 rounded-xl hover:bg-blue-50/60 transition-colors flex items-center justify-between gap-2 group block"
                                                >
                                                    <div className="min-w-0">
                                                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-800 block truncate">
                                                            {item.title}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 block truncate">
                                                            {item.subtitle}
                                                        </span>
                                                    </div>
                                                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Files Section */}
                                {searchResults.files.length > 0 && (
                                    <div className="space-y-1 pt-2">
                                        <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                            <HardDrive className="w-3 h-3 text-emerald-500" />
                                            <span>File &amp; Link Drive ({searchResults.files.length})</span>
                                        </span>
                                        <div className="space-y-0.5">
                                            {searchResults.files.map((item) => (
                                                <Link
                                                    key={item.id}
                                                    href={item.url}
                                                    onClick={() => setSearchOpen(false)}
                                                    className="p-2 rounded-xl hover:bg-emerald-50/60 transition-colors flex items-center justify-between gap-2 group block"
                                                >
                                                    <div className="min-w-0">
                                                        <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 block truncate">
                                                            {item.title}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 block truncate">
                                                            {item.subtitle}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold border shrink-0 ${
                                                            item.badge === 'expired'
                                                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        }`}
                                                    >
                                                        {item.badge === 'expired' ? 'Expired' : 'Aktif'}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Invoices Section */}
                                {searchResults.invoices.length > 0 && (
                                    <div className="space-y-1 pt-2">
                                        <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                            <Receipt className="w-3 h-3 text-purple-500" />
                                            <span>Invoice &amp; Finansial ({searchResults.invoices.length})</span>
                                        </span>
                                        <div className="space-y-0.5">
                                            {searchResults.invoices.map((item) => (
                                                <Link
                                                    key={item.id}
                                                    href={item.url}
                                                    onClick={() => setSearchOpen(false)}
                                                    className="p-2 rounded-xl hover:bg-purple-50/60 transition-colors flex items-center justify-between gap-2 group block"
                                                >
                                                    <div className="min-w-0">
                                                        <span className="text-xs font-bold text-slate-900 group-hover:text-purple-800 block truncate">
                                                            {item.title}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 block truncate">
                                                            {item.subtitle}
                                                        </span>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 capitalize shrink-0">
                                                        {item.badge}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── 2. DYNAMIC NOTIFICATIONS BELL & DROPDOWN ──────────────────────── */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => {
                            setNotifDropdownOpen(!notifDropdownOpen);
                            if (!notifDropdownOpen) fetchNotifications();
                        }}
                        style={{ color: headerTextColor }}
                        className="relative p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                        title="Notifikasi Studio"
                    >
                        <Bell className="w-4.5 h-4.5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs animate-in zoom-in-50">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown Flyout */}
                    {notifDropdownOpen && (
                        <div
                            ref={notifDropdownRef}
                            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
                        >
                            {/* Notif Header */}
                            <div className="p-3.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                                        <Bell className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-900">Notifikasi Studio</h3>
                                        <span className="text-[10px] text-slate-400">{unreadCount} pemberitahuan penting</span>
                                    </div>
                                </div>

                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleMarkAllRead}
                                        className="text-[11px] font-bold text-[#A6702E] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <CheckCheck className="w-3 h-3" />
                                        <span>Tandai Dibaca</span>
                                    </button>
                                )}
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex items-center gap-1 p-1.5 bg-slate-100/60 border-b border-slate-100 text-[11px]">
                                <button
                                    type="button"
                                    onClick={() => setNotifFilter('all')}
                                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                        notifFilter === 'all'
                                            ? 'bg-white text-slate-900 shadow-2xs'
                                            : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    Semua ({notifications.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNotifFilter('files')}
                                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                        notifFilter === 'files'
                                            ? 'bg-white text-rose-800 shadow-2xs'
                                            : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    File Expired ({notifications.filter((n) => n.category === 'files').length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNotifFilter('schedule_finance')}
                                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                        notifFilter === 'schedule_finance'
                                            ? 'bg-white text-blue-800 shadow-2xs'
                                            : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    Jadwal &amp; Finance ({notifications.filter((n) => n.category === 'schedule' || n.category === 'finance').length})
                                </button>
                            </div>

                            {/* Notifications List */}
                            <div className="overflow-y-auto max-h-80 divide-y divide-slate-100 p-1">
                                {loadingNotifs ? (
                                    <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                                        <Loader2 className="w-5 h-5 mx-auto animate-spin text-slate-300" />
                                        <p>Memuat notifikasi...</p>
                                    </div>
                                ) : filteredNotifications.length === 0 ? (
                                    <div className="py-8 text-center space-y-1.5">
                                        <Sparkles className="w-7 h-7 text-emerald-400 mx-auto" />
                                        <p className="text-xs font-bold text-slate-800">Tidak ada notifikasi baru</p>
                                        <p className="text-[11px] text-slate-400">Semua file, jadwal acara, dan pembayaran aman terkendali.</p>
                                    </div>
                                ) : (
                                    filteredNotifications.map((notif) => (
                                        <Link
                                            key={notif.id}
                                            href={notif.url}
                                            onClick={() => setNotifDropdownOpen(false)}
                                            className="p-3 rounded-xl hover:bg-slate-50 transition-colors flex items-start gap-3 group block"
                                        >
                                            {/* Icon */}
                                            <div
                                                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border ${
                                                    notif.color === 'rose'
                                                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                        : notif.color === 'amber'
                                                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                                                        : notif.color === 'blue'
                                                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                        : 'bg-purple-50 text-purple-600 border-purple-100'
                                                }`}
                                            >
                                                {notif.icon === 'AlertTriangle' && <AlertTriangle className="w-4 h-4" />}
                                                {notif.icon === 'Clock' && <Clock className="w-4 h-4" />}
                                                {notif.icon === 'Calendar' && <Calendar className="w-4 h-4" />}
                                                {notif.icon === 'Receipt' && <Receipt className="w-4 h-4" />}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 space-y-0.5">
                                                <div className="flex items-center justify-between gap-1">
                                                    <span className="text-xs font-bold text-slate-900 group-hover:text-amber-800 truncate">
                                                        {notif.title}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                                        {notif.time_ago}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                                                    {notif.message}
                                                </p>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>

                            {/* Footer Link to Files / Dashboard */}
                            <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                                <Link
                                    href="/files"
                                    onClick={() => setNotifDropdownOpen(false)}
                                    className="text-[11px] font-bold text-slate-700 hover:text-slate-900 hover:underline flex items-center justify-center gap-1"
                                >
                                    <span>Lihat Semua Manajemen File &amp; Link</span>
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Vertical Divider */}
                <div style={{ backgroundColor: headerBorderColor }} className="hidden sm:block w-px h-6" />

                {/* ── 3. USER PROFILE PILL & DROPDOWN ───────────────────────────────── */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-white/10 transition-all group cursor-pointer"
                    >
                        <img
                            src={
                                user.avatar ||
                                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
                            }
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20 group-hover:ring-[#C89445]/40 transition-all"
                        />
                        <div className="hidden sm:flex flex-col text-left">
                            <span
                                style={{ color: headerTextColor }}
                                className="text-xs font-bold leading-tight"
                            >
                                {user.name}
                            </span>
                            <span
                                style={{ color: `${headerTextColor}99` }}
                                className="text-[10px] font-medium leading-tight"
                            >
                                {roleName}
                            </span>
                        </div>
                        <ChevronDown style={{ color: `${headerTextColor}80` }} className="w-3.5 h-3.5 group-hover:opacity-100 transition-transform" />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {userDropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setUserDropdownOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-56 p-1.5 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                <div className="px-3 py-2 border-b border-slate-100">
                                    <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                                </div>
                                <div className="py-1">
                                    <Link
                                        href="/settings/company"
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        <SettingsIcon className="w-4 h-4 text-slate-400" />
                                        <span>Pengaturan Sistem</span>
                                    </Link>
                                    <Link
                                        href="/users"
                                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        <UserIcon className="w-4 h-4 text-slate-400" />
                                        <span>Manajemen User</span>
                                    </Link>
                                </div>
                                <div className="pt-1 border-t border-slate-100">
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <LogOut className="w-4 h-4 text-red-500" />
                                        <span>Keluar (Logout)</span>
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
