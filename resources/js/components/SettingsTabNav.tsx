import { Link, usePage } from '@inertiajs/react';
import {
    ShieldCheck,
    FileText,
    Globe,
    Building2,
    Settings,
    Palette,
    Lock,
    Sparkles,
    MessageSquareQuote,
    Instagram,
    Database,
} from 'lucide-react';

export type SettingMainTab = 'admin' | 'form_klien' | 'portal_klien';
export type SettingAdminSubTab =
    | 'company'
    | 'general'
    | 'appearance'
    | 'login_theme'
    | 'promo_slides'
    | 'testimonials'
    | 'instagram_posts'
    | 'backup';

interface SettingsTabNavProps {
    activeMainTab?: SettingMainTab;
    activeAdminSubTab?: SettingAdminSubTab;
    accentColor?: string;
    onSelectMainTab?: (tab: SettingMainTab) => void;
    onSelectAdminSubTab?: (subTab: SettingAdminSubTab) => void;
    showMainTabs?: boolean;
    className?: string;
}

export default function SettingsTabNav({
    activeMainTab = 'admin',
    activeAdminSubTab = 'company',
    accentColor,
    onSelectMainTab,
    onSelectAdminSubTab,
    showMainTabs = false,
    className = '',
}: SettingsTabNavProps) {
    const { props } = usePage<any>();
    const effectiveAccentColor = accentColor || props?.appSettings?.primary_accent_color || '#C98922';
    const mainTabs = [
        { id: 'admin' as const, label: 'Admin', icon: ShieldCheck, href: '/setting/admin' },
        { id: 'form_klien' as const, label: 'Form Klien', icon: FileText, href: '/setting/form-klien' },
        { id: 'portal_klien' as const, label: 'Portal Klien', icon: Globe, href: '/setting/portal-klien' },
    ];

    const adminSubTabs = [
        { id: 'company' as const, label: 'Profil Perusahaan', icon: Building2, href: '/setting/admin?sub=company' },
        { id: 'general' as const, label: 'Pengaturan Umum', icon: Settings, href: '/setting/admin?sub=general' },
        { id: 'appearance' as const, label: 'Tampilan Admin', icon: Palette, href: '/setting/admin?sub=appearance' },
        { id: 'login_theme' as const, label: 'Tampilan Login', icon: Lock, href: '/setting/admin?sub=login_theme' },
        { id: 'promo_slides' as const, label: 'Promo Slide', icon: Sparkles, href: '/master-data/promo-slides', isExternalPage: true },
        { id: 'testimonials' as const, label: 'Ulasan Klien', icon: MessageSquareQuote, href: '/master-data/testimonials', isExternalPage: true },
        { id: 'instagram_posts' as const, label: 'Feed Instagram', icon: Instagram, href: '/master-data/instagram-posts', isExternalPage: true },
        { id: 'backup' as const, label: 'Backup & Data', icon: Database, href: '/setting/admin?sub=backup' },
    ];

    return (
        <div className={`space-y-3.5 mb-6 ${className}`}>
            {/* ── 1. Top Level Tabs (Admin, Form Klien, Portal Klien) - Hanya tampil jika diminta ── */}
            {showMainTabs && (
                <div className="flex items-center gap-2 sm:gap-3 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto scrollbar-none">
                    {mainTabs.map((tab) => {
                        const isActive = activeMainTab === tab.id;
                        const Icon = tab.icon;

                        if (onSelectMainTab) {
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => onSelectMainTab(tab.id)}
                                    style={isActive ? { borderColor: effectiveAccentColor, color: effectiveAccentColor } : undefined}
                                    className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                                        isActive
                                            ? 'bg-slate-50/60 dark:bg-slate-900/40 rounded-t-xl'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                style={isActive ? { borderColor: effectiveAccentColor, color: effectiveAccentColor } : undefined}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                                    isActive
                                        ? 'bg-slate-50/60 dark:bg-slate-900/40 rounded-t-xl'
                                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{tab.label}</span>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* ── 2. Admin Sub-Pills (Shown when Admin Tab is active or top tabs disabled) ── */}
            {(activeMainTab === 'admin' || !showMainTabs) && (
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1 px-0.5">
                    {adminSubTabs.map((sub) => {
                        const isSubActive = activeAdminSubTab === sub.id;
                        const Icon = sub.icon;

                        // If onSelectAdminSubTab is provided and it's NOT an external full-page route
                        if (onSelectAdminSubTab && !sub.isExternalPage) {
                            return (
                                <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => onSelectAdminSubTab(sub.id)}
                                    style={isSubActive ? { backgroundColor: effectiveAccentColor, borderColor: effectiveAccentColor, color: '#FFFFFF' } : undefined}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                                        isSubActive
                                            ? 'shadow-xs font-bold'
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5 shrink-0" />
                                    <span>{sub.label}</span>
                                </button>
                            );
                        }

                        // Otherwise render Inertia Link
                        return (
                            <Link
                                key={sub.id}
                                href={sub.href}
                                style={isSubActive ? { backgroundColor: effectiveAccentColor, borderColor: effectiveAccentColor, color: '#FFFFFF' } : undefined}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                                    isSubActive
                                        ? 'shadow-xs font-bold'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                <span>{sub.label}</span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
