import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import AramsSidebar from '@/components/AramsSidebar';
import AramsHeader from '@/components/AramsHeader';
import { Toaster } from '@/components/ui/sonner';

interface AramsLayoutProps {
    children: React.ReactNode;
    title?: string;
    breadcrumbs?: Array<{ label: string; href?: string }>;
}

export default function AramsLayout({
    children,
    title = 'Dashboard',
    breadcrumbs,
}: AramsLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { props: pageProps } = usePage<any>();

    const primaryAccent = pageProps?.appSettings?.primary_accent_color || '#C98922';
    const primaryAccentGradient = pageProps?.appSettings?.primary_accent_gradient || '';
    const sidebarBg = pageProps?.appSettings?.sidebar_bg_color || '#1C132E';
    const sidebarBgGradient = pageProps?.appSettings?.sidebar_bg_gradient || '';
    const sidebarActiveBg = pageProps?.appSettings?.sidebar_active_bg || '#C98922';
    const sidebarActiveBgGradient = pageProps?.appSettings?.sidebar_active_bg_gradient || '';
    const sidebarActiveText = pageProps?.appSettings?.sidebar_active_text || '#FFFFFF';
    const sidebarTextColor = pageProps?.appSettings?.sidebar_text_color || '#94A3B8';
    const appBg = pageProps?.appSettings?.app_bg_color || '#F8F6F5';
    const appBgGradient = pageProps?.appSettings?.app_bg_gradient || '';
    const appHeadingColor = pageProps?.appSettings?.app_heading_color || '#0F172A';
    const appTextColor = pageProps?.appSettings?.app_text_color || '#1E293B';
    const appMutedTextColor = pageProps?.appSettings?.app_muted_text_color || '#64748B';
    const headerBg = pageProps?.appSettings?.header_bg_color || '#FFFFFF';
    const headerBgGradient = pageProps?.appSettings?.header_bg_gradient || '';
    const headerTextColor = pageProps?.appSettings?.header_text_color || '#0F172A';
    const headerBorderColor = pageProps?.appSettings?.header_border_color || 'rgba(226, 232, 240, 0.8)';
    const breadcrumbColor = pageProps?.appSettings?.breadcrumb_color || '#64748B';
    const breadcrumbActiveColor = pageProps?.appSettings?.breadcrumb_active_color || '#0F172A';
    const headerSearchBg = pageProps?.appSettings?.header_search_bg || '';
    const headerSearchText = pageProps?.appSettings?.header_search_text || '';
    const cardHeadingColor = pageProps?.appSettings?.card_heading_color || '#1E293B';
    const fontFamily = pageProps?.appSettings?.font_family_body || 'Plus Jakarta Sans';
    const fontHeading = pageProps?.appSettings?.font_family_heading || 'Plus Jakarta Sans';
    const reportPrimary = pageProps?.appSettings?.report_primary_accent || primaryAccent;
    const reportRevenue = pageProps?.appSettings?.report_revenue_color || reportPrimary;
    const reportProjects = pageProps?.appSettings?.report_projects_color || '#10B981';
    const reportReceived = pageProps?.appSettings?.report_received_color || '#059669';
    const reportPending = pageProps?.appSettings?.report_pending_color || '#DC2626';

    return (
        <div
            style={{
                background: appBgGradient || appBg,
                color: appTextColor,
                fontFamily: `${fontFamily}, system-ui, -apple-system, sans-serif`,
            }}
            className="min-h-screen flex transition-colors duration-200"
            suppressHydrationWarning
        >
            {/* Global Sonner Toast Container for all Authenticated Pages */}
            <Toaster position="top-right" richColors closeButton />
            {/* Dynamic CSS Variables Injector for Theme Styling */}
            <style>{`
                :root {
                    --primary-accent: ${primaryAccent};
                    --primary-accent-gradient: ${primaryAccentGradient || 'none'};
                    --primary-accent-dark: color-mix(in srgb, ${primaryAccent} 85%, black);
                    --primary-accent-light: color-mix(in srgb, ${primaryAccent} 12%, transparent);
                    --report-primary: ${reportPrimary};
                    --report-revenue: ${reportRevenue};
                    --report-projects: ${reportProjects};
                    --report-received: ${reportReceived};
                    --report-pending: ${reportPending};
                    --sidebar-bg: ${sidebarBg};
                    --sidebar-bg-gradient: ${sidebarBgGradient || 'none'};
                    --sidebar-active-bg: ${sidebarActiveBg};
                    --sidebar-active-bg-gradient: ${sidebarActiveBgGradient || 'none'};
                    --sidebar-active-text: ${sidebarActiveText};
                    --sidebar-text: ${sidebarTextColor};
                    --app-bg: ${appBg};
                    --app-bg-gradient: ${appBgGradient || 'none'};
                    --app-heading-color: ${appHeadingColor};
                    --app-text-color: ${appTextColor};
                    --app-muted-color: ${appMutedTextColor};
                    --header-bg: ${headerBg};
                    --header-bg-gradient: ${headerBgGradient || 'none'};
                    --header-text: ${headerTextColor};
                    --header-border: ${headerBorderColor};
                    --breadcrumb-color: ${breadcrumbColor};
                    --breadcrumb-active-color: ${breadcrumbActiveColor};
                    --header-search-bg: ${headerSearchBg};
                    --header-search-text: ${headerSearchText};
                    --card-heading-color: ${cardHeadingColor};
                    --font-heading: '${fontHeading}', system-ui, sans-serif;
                }
                .btn-primary-action, .bg-primary-accent {
                    background: ${primaryAccentGradient || primaryAccent} !important;
                    color: #FFFFFF !important;
                }
                .btn-primary-action:hover, .bg-primary-accent:hover {
                    filter: brightness(0.92);
                }
                .text-primary-accent {
                    color: var(--primary-accent) !important;
                }
                .border-primary-accent {
                    border-color: var(--primary-accent) !important;
                }
                .badge-primary-accent {
                    background-color: var(--primary-accent-light) !important;
                    color: var(--primary-accent) !important;
                    border-color: color-mix(in srgb, var(--primary-accent) 25%, transparent) !important;
                }
                /* Global Main Page Titles & Subtitles */
                main h1, .theme-heading-text,
                main h1.text-2xl, main h1.text-3xl, main h1.text-xl, main h1.font-extrabold {
                    color: var(--app-heading-color) !important;
                    font-family: var(--font-heading) !important;
                }
                .theme-muted-text,
                main h1 + p, main h1 ~ p.text-slate-500, main .page-subtitle {
                    color: var(--app-muted-color) !important;
                }
                /* Global Card Headings, Section Headers & Stat Titles */
                .stat-card-title,
                .stat-title,
                .card-section-title,
                .bg-white h2, .bg-white h3, .bg-white h4,
                .bg-white .stat-card-title,
                .bg-white .stat-title,
                .bg-white span.uppercase.tracking-wider:not(.badge):not(.tag):not([class*="bg-"]):not([class*="text-emerald"]):not([class*="text-amber"]):not([class*="text-blue"]):not([class*="text-purple"]):not([class*="text-rose"]) {
                    color: var(--card-heading-color) !important;
                    font-family: var(--font-heading) !important;
                }
                /* Global In-Page Breadcrumb Navigation */
                main nav.text-xs a, main nav.text-xs span:not(.font-semibold):not(.font-bold) {
                    color: var(--breadcrumb-color) !important;
                }
                main nav.text-xs a:hover {
                    color: var(--breadcrumb-active-color) !important;
                }
                main nav.text-xs span.font-semibold, main nav.text-xs span.font-bold {
                    color: var(--breadcrumb-active-color) !important;
                }
                /* Global Navigation Tabs (Finance, Settings, Reports, Modals, etc.) */
                main div[class*="border-b"] > button[class*="border-b-2"]:not([class*="border-transparent"]),
                main .tab-active {
                    color: var(--primary-accent) !important;
                    border-color: var(--primary-accent) !important;
                    font-weight: 700 !important;
                }
                main div[class*="border-b"] > button.border-transparent,
                main .tab-inactive {
                    color: var(--app-muted-color) !important;
                }
                /* Inside white cards or containers, ensure inactive tabs are always dark slate for high contrast */
                .bg-white div[class*="border-b"] > button.border-transparent,
                .bg-white .tab-inactive,
                [class*="bg-white"] div[class*="border-b"] > button.border-transparent,
                [class*="bg-white"] .tab-inactive {
                    color: #64748B !important;
                }
                main div[class*="border-b"] > button.border-transparent:hover,
                main .tab-inactive:hover,
                .bg-white div[class*="border-b"] > button.border-transparent:hover,
                .bg-white .tab-inactive:hover {
                    color: #0F172A !important;
                    opacity: 0.95 !important;
                }

                /* ── PRINT & PDF OPTIMIZATIONS ────────────────────────────── */
                @media print {
                    /* Hide non-printable navigation, sidebar, header, and buttons */
                    #arams-sidebar,
                    #arams-header,
                    aside,
                    header,
                    nav,
                    .no-print,
                    .print\\:hidden,
                    [role="tooltip"],
                    [data-sonner-toaster] {
                        display: none !important;
                    }

                    /* Suppress all interactive buttons and dropdown triggers in print mode */
                    button:not(.print-visible) {
                        display: none !important;
                    }

                    /* Reset body and container backgrounds & paddings */
                    body, html, #root, div[style*="min-height"] {
                        background: #FFFFFF !important;
                        color: #0F172A !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        min-height: auto !important;
                    }

                    .lg\\:pl-64 {
                        padding-left: 0 !important;
                    }

                    main {
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }

                    /* Exact color accuracy for background colors, badges, and charts */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    /* Avoid page cuts through cards and tables */
                    .print-break-inside-avoid,
                    .bg-white,
                    table,
                    tr {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }

                    @page {
                        margin: 12mm 10mm 15mm 10mm;
                        size: A4 portrait;
                    }
                }
            `}</style>
            {/* Desktop & Mobile Sidebar */}
            <AramsSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
                <AramsHeader
                    title={title}
                    breadcrumbs={breadcrumbs}
                    onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                />

                <main className="flex-1 p-3.5 sm:p-4 lg:p-5 pb-4 w-full max-w-full animate-in fade-in-50 duration-200">
                    {children}
                </main>
            </div>
        </div>
    );
}
