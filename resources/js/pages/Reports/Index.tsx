import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Download,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    CreditCard,
    Folder,
    Info,
    ArrowRight,
    Camera,
    Video,
    Navigation,
    Tv,
    Smartphone,
    Clock,
    BookOpen,
    Film,
    Image as ImageIcon,
    Printer,
    FileSpreadsheet,
} from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import type { DateRange} from '@/components/DateRangePicker';
import DateRangePicker, { formatRangeLabel } from '@/components/DateRangePicker';
import { formatRupiah } from '@/lib/formatters';

interface MonthlyItem {
    month: string;
    revenue: number;
    projects: number;
}

interface CategoryItem {
    name: string;
    percentage: number;
    color: string;
}

interface TopProjectItem {
    rank: number;
    project_name: string;
    client_name: string;
    amount: number;
}

interface PackageItem {
    package_name: string;
    total_projects: number;
    revenue: number;
    percentage: number;
}

interface ServiceItem {
    name: string;
    icon: string;
    total_projects: number;
    revenue: number;
}

interface AddonItem {
    name: string;
    icon: string;
    total_orders: number;
    revenue: number;
}

interface SourceItem {
    name: string;
    count: number;
    percentage: number;
    color: string;
}

interface ReportsProps {
    year?: number;
    period?: string;
    date_range_text?: string;
    summary?: {
        total_project_value: number;
        total_project_value_growth: number;
        total_received: number;
        total_received_growth: number;
        total_pending: number;
        total_pending_growth: number;
        total_projects: number;
        total_projects_growth: number;
    };
    monthly_performance?: MonthlyItem[];
    project_categories?: CategoryItem[];
    top_projects?: TopProjectItem[];
    package_performance?: PackageItem[];
    top_services?: ServiceItem[];
    top_addons?: AddonItem[];
    client_sources?: {
        total: number;
        items: SourceItem[];
    };
    report_colors?: {
        primary_accent?: string;
        revenue_color?: string;
        projects_color?: string;
        received_color?: string;
        pending_color?: string;
    };
    last_updated?: string;
}

// ─── ICON MAPPING HELPER ──────────────────────────────────────────────────────
function getServiceAddonIcon(icon: string) {
    const props = { className: 'w-3.5 h-3.5 text-slate-600 dark:text-slate-300' };

    switch (icon) {
        case 'camera':
            return <Camera {...props} />;
        case 'video':
            return <Video {...props} />;
        case 'navigation':
            return <Navigation {...props} />;
        case 'tv':
            return <Tv {...props} />;
        case 'smartphone':
            return <Smartphone {...props} />;
        case 'clock':
            return <Clock {...props} />;
        case 'book-open':
            return <BookOpen {...props} />;
        case 'film':
            return <Film {...props} />;
        case 'image':
            return <ImageIcon {...props} />;
        default:
            return <Camera {...props} />;
    }
}

// ─── DONUT CHART SVG (PURE SVG ACCURATE ARCS) ──────────────────────────────────
function DonutChart({
    items,
    size = 140,
    strokeWidth = 24,
    centerLabel,
    centerValue,
}: {
    items: Array<{ percentage: number; color: string; name?: string }>;
    size?: number;
    strokeWidth?: number;
    centerLabel?: string;
    centerValue?: string | number;
}) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const slices = items.map((item, index) => {
        const priorPercentage = items.slice(0, index).reduce((acc, prev) => acc + prev.percentage, 0);
        const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
        const strokeDashoffset = -((priorPercentage / 100) * circumference);

        return {
            item,
            strokeDasharray,
            strokeDashoffset,
        };
    });

    return (
        <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
                {slices.map((slice, index) => (
                    <circle
                        key={index}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke={slice.item.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={slice.strokeDasharray}
                        strokeDashoffset={slice.strokeDashoffset}
                        className="transition-all duration-500 ease-out"
                    />
                ))}
            </svg>
            {(centerLabel || centerValue !== undefined) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                    {centerLabel && (
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase leading-tight">
                            {centerLabel}
                        </span>
                    )}
                    {centerValue !== undefined && (
                        <span className="text-xl font-black text-slate-900 dark:text-white leading-none mt-0.5">
                            {centerValue}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── COMBO BAR + LINE CHART (REVENUE & JUMLAH PROJECT) ─────────────────────────
function ComboBarLineChart({
    data,
    barColor = '#3C0E0E',
    lineColor = '#10B981',
}: {
    data: MonthlyItem[];
    barColor?: string;
    lineColor?: string;
}) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const highestRev = Math.max(100000000, ...data.map((d) => d.revenue));
    const maxRev = Math.ceil(highestRev / 50000000) * 50000000;
    const highestProjects = Math.max(50, ...data.map((d) => d.projects));
    const maxProjects = Math.ceil(highestProjects / 10) * 10;

    const svgWidth = 460;
    const svgHeight = 220;
    const paddingLeft = 46;
    const paddingRight = 36;
    const paddingTop = 20;
    const paddingBottom = 30;

    const plotWidth = svgWidth - paddingLeft - paddingRight;
    const plotHeight = svgHeight - paddingTop - paddingBottom;

    const yLevels = [
        { labelLeft: `${Math.round(maxRev / 1000000)} jt`, labelRight: `${maxProjects}`, ratio: 1 },
        { labelLeft: `${Math.round((maxRev * 0.8) / 1000000)} jt`, labelRight: `${Math.round(maxProjects * 0.8)}`, ratio: 0.8 },
        { labelLeft: `${Math.round((maxRev * 0.6) / 1000000)} jt`, labelRight: `${Math.round(maxProjects * 0.6)}`, ratio: 0.6 },
        { labelLeft: `${Math.round((maxRev * 0.4) / 1000000)} jt`, labelRight: `${Math.round(maxProjects * 0.4)}`, ratio: 0.4 },
        { labelLeft: `${Math.round((maxRev * 0.2) / 1000000)} jt`, labelRight: `${Math.round(maxProjects * 0.2)}`, ratio: 0.2 },
        { labelLeft: '0', labelRight: '0', ratio: 0 },
    ];

    const count = data.length || 1;
    const step = plotWidth / count;
    const barWidth = 10;

    // Line points for projects
    const linePoints = data.map((d, i) => {
        const x = paddingLeft + i * step + step / 2;
        const normalizedProjects = Math.min(d.projects / maxProjects, 1);
        const y = paddingTop + (1 - normalizedProjects) * plotHeight;

        return { x, y, ...d };
    });

    const linePath = linePoints.reduce((acc, pt, i) => {
        return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    return (
        <div className="relative w-full overflow-x-auto select-none">
            <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto min-w-[380px]"
                style={{ overflow: 'visible' }}
            >
                {/* Horizontal Grid lines and Axis Labels */}
                {yLevels.map((lvl, idx) => {
                    const y = paddingTop + (1 - lvl.ratio) * plotHeight;

                    return (
                        <g key={idx} className="pointer-events-none">
                            <line
                                x1={paddingLeft}
                                y1={y}
                                x2={svgWidth - paddingRight}
                                y2={y}
                                stroke="#F1F5F9"
                                strokeDasharray={lvl.ratio === 0 ? 'none' : '2,2'}
                                strokeWidth="1"
                            />
                            {/* Left Y-axis (Revenue) */}
                            <text
                                x={paddingLeft - 8}
                                y={y + 3.5}
                                textAnchor="end"
                                className="fill-slate-400 text-[9px] font-medium"
                            >
                                {lvl.labelLeft}
                            </text>
                            {/* Right Y-axis (Projects) */}
                            <text
                                x={svgWidth - paddingRight + 8}
                                y={y + 3.5}
                                textAnchor="start"
                                className="fill-slate-400 text-[9px] font-medium"
                            >
                                {lvl.labelRight}
                            </text>
                        </g>
                    );
                })}

                {/* Bars: Revenue */}
                {data.map((d, i) => {
                    const x = paddingLeft + i * step + (step - barWidth) / 2;
                    const normalizedRev = Math.min(d.revenue / maxRev, 1);
                    const bHeight = normalizedRev * plotHeight;
                    const y = paddingTop + plotHeight - bHeight;
                    const isHovered = hoveredIndex === i;

                    return (
                        <g key={i}>
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={bHeight}
                                rx="4"
                                fill={barColor}
                                className={`transition-all duration-200 cursor-pointer ${isHovered ? 'brightness-125' : 'hover:brightness-110'}`}
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            />

                            {/* X-axis Month Label */}
                            <text
                                x={x + barWidth / 2}
                                y={svgHeight - 12}
                                textAnchor="middle"
                                className={`text-[10px] font-semibold transition-colors ${
                                    isHovered ? 'font-bold' : 'fill-slate-500'
                                }`}
                                style={{ fill: isHovered ? barColor : undefined }}
                            >
                                {d.month}
                            </text>

                            {/* Hit-area for easy hover */}
                            <rect
                                x={paddingLeft + i * step}
                                y={paddingTop}
                                width={step}
                                height={plotHeight + 20}
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            />
                        </g>
                    );
                })}

                {/* Line: Jumlah Project */}
                <path
                    d={linePath}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none"
                />

                {linePoints.map((pt, i) => {
                    const isHovered = hoveredIndex === i;

                    return (
                        <g key={i} className="pointer-events-none">
                            <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isHovered ? 5.5 : 4}
                                fill="#FFFFFF"
                                stroke={lineColor}
                                strokeWidth={isHovered ? 3 : 2.5}
                                className="transition-all duration-150"
                            />
                        </g>
                    );
                })}

                {/* Hover Tooltip */}
                {hoveredIndex !== null && (
                    <g className="pointer-events-none">
                        <line
                            x1={linePoints[hoveredIndex].x}
                            y1={paddingTop}
                            x2={linePoints[hoveredIndex].x}
                            y2={paddingTop + plotHeight}
                            stroke="#CBD5E1"
                            strokeDasharray="2,2"
                            strokeWidth="1"
                        />
                    </g>
                )}
            </svg>
        </div>
    );
}

// ─── MAIN REPORTS COMPONENT ───────────────────────────────────────────────────
export default function ReportIndex({
    date_range_text = '01 Agustus 2026 – 31 Agustus 2026',
    summary = {
        total_project_value: 482750000,
        total_project_value_growth: 18.45,
        total_received: 276450000,
        total_received_growth: 22.22,
        total_pending: 206300000,
        total_pending_growth: -8.33,
        total_projects: 46,
        total_projects_growth: 12.24,
    },
    monthly_performance = [
        { month: 'Jan', revenue: 20000000, projects: 18 },
        { month: 'Feb', revenue: 60000000, projects: 20 },
        { month: 'Mar', revenue: 55000000, projects: 38 },
        { month: 'Apr', revenue: 70000000, projects: 35 },
        { month: 'Mei', revenue: 65000000, projects: 40 },
        { month: 'Jun', revenue: 70000000, projects: 38 },
        { month: 'Jul', revenue: 68000000, projects: 36 },
        { month: 'Agu', revenue: 75000000, projects: 42 },
    ],
    project_categories = [
        { name: 'Wedding', percentage: 52.42, color: '#6366F1' },
        { name: 'Maternity', percentage: 15.32, color: '#10B981' },
        { name: 'Prewedding', percentage: 12.11, color: '#3B82F6' },
        { name: 'Event', percentage: 8.25, color: '#F59E0B' },
        { name: 'Others', percentage: 11.90, color: '#4338CA' },
    ],
    top_projects = [
        { rank: 1, project_name: 'The Wedding of Budi & Sari', client_name: 'Budi Santoso', amount: 88300000 },
        { rank: 2, project_name: 'Grand Opening PT Maju Bersama', client_name: 'PT Maju Bersama', amount: 65750000 },
        { rank: 3, project_name: 'Family Gathering XYZ Community', client_name: 'XYZ Community', amount: 53200000 },
        { rank: 4, project_name: 'Prewedding Rina & Dimas', client_name: 'Rina Amelia', amount: 31500000 },
        { rank: 5, project_name: 'Maternity Session Dewi Lestari', client_name: 'Dewi Lestari', amount: 27800000 },
    ],
    package_performance = [
        { package_name: 'Basic', total_projects: 8, revenue: 62500000, percentage: 12.95 },
        { package_name: 'Basic Plus', total_projects: 14, revenue: 134000000, percentage: 27.77 },
        { package_name: 'Premium', total_projects: 18, revenue: 222000000, percentage: 46.02 },
        { package_name: 'Exclusive', total_projects: 6, revenue: 64250000, percentage: 13.26 },
    ],
    top_services = [
        { name: 'Photography', icon: 'camera', total_projects: 42, revenue: 368500000 },
        { name: 'Videography', icon: 'video', total_projects: 30, revenue: 196000000 },
        { name: 'Drone', icon: 'navigation', total_projects: 12, revenue: 45800000 },
        { name: 'Live Streaming', icon: 'tv', total_projects: 5, revenue: 18900000 },
        { name: 'Content Creator', icon: 'smartphone', total_projects: 6, revenue: 14750000 },
    ],
    top_addons = [
        { name: 'Same Day Edit', icon: 'clock', total_orders: 17, revenue: 25500000 },
        { name: 'Extra Photographer', icon: 'camera', total_orders: 16, revenue: 24000000 },
        { name: 'Album (Vinyl Box)', icon: 'book-open', total_orders: 12, revenue: 15600000 },
        { name: 'Short Movie', icon: 'film', total_orders: 10, revenue: 12750000 },
        { name: 'Photo Booth', icon: 'image', total_orders: 8, revenue: 9600000 },
    ],
    client_sources = {
        total: 46,
        items: [
            { name: 'Instagram', count: 16, percentage: 34.78, color: '#8B5CF6' },
            { name: 'Referral Client', count: 12, percentage: 26.09, color: '#3B82F6' },
            { name: 'Google', count: 8, percentage: 17.39, color: '#F59E0B' },
            { name: 'Website', count: 6, percentage: 13.04, color: '#EF4444' },
            { name: 'Lainnya', count: 4, percentage: 8.70, color: '#6366F1' },
        ],
    },
    report_colors,
    last_updated,
}: ReportsProps) {
    const { props: pageProps } = usePage<any>();

    const reportPrimaryColor =
        report_colors?.primary_accent ||
        pageProps?.appSettings?.report_primary_accent ||
        pageProps?.appSettings?.primary_accent_color ||
        '#3C0E0E';

    const reportRevenueColor =
        report_colors?.revenue_color ||
        pageProps?.appSettings?.report_revenue_color ||
        reportPrimaryColor;

    const reportProjectsColor =
        report_colors?.projects_color ||
        pageProps?.appSettings?.report_projects_color ||
        '#10B981';

    const reportReceivedColor =
        report_colors?.received_color ||
        pageProps?.appSettings?.report_received_color ||
        '#059669';

    const reportPendingColor =
        report_colors?.pending_color ||
        pageProps?.appSettings?.report_pending_color ||
        '#DC2626';

    const [filterPeriod, setFilterPeriod] = useState('Bulanan');
    const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

    const exportRef = useRef<HTMLDivElement>(null);

    // Close export dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
                setExportDropdownOpen(false);
            }
        }

        if (exportDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [exportDropdownOpen]);

    // Handle date range change
    const handleDateRangeChange = (range: DateRange) => {
        const label = range.label || formatRangeLabel(range.startDate, range.endDate);
        const startYmd = `${range.startDate.getFullYear()}-${String(range.startDate.getMonth() + 1).padStart(2, '0')}-${String(range.startDate.getDate()).padStart(2, '0')}`;
        const endYmd = `${range.endDate.getFullYear()}-${String(range.endDate.getMonth() + 1).padStart(2, '0')}-${String(range.endDate.getDate()).padStart(2, '0')}`;

        router.get(
            '/reports',
            {
                date_range: label,
                start_date: startYmd,
                end_date: endYmd,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    // Export CSV of report tables
    const handleExportCSV = () => {
        const rows: Array<Array<string | number>> = [
            ['LAPORAN PERFORMA BISNIS & KEUANGAN - ARAMS PICTURES'],
            ['Periode Laporan', date_range_text],
            ['Tanggal Cetak', last_updated || new Date().toLocaleString('id-ID')],
            [],
            ['RINGKASAN METRIK KPI'],
            ['Metrik', 'Nilai (Rp / Count)', 'Pertumbuhan (%)'],
            ['Total Nilai Project', summary.total_project_value, `${summary.total_project_value_growth}%`],
            ['Sudah Diterima', summary.total_received, `${summary.total_received_growth}%`],
            ['Belum Diterima', summary.total_pending, `${summary.total_pending_growth}%`],
            ['Total Project', summary.total_projects, `${summary.total_projects_growth}%`],
            [],
            ['TOP 5 PROJECT (BERDASARKAN NILAI)'],
            ['Rank', 'Nama Project', 'Klien', 'Nilai Project (Rp)'],
            ...top_projects.map((p) => [p.rank, `"${p.project_name.replace(/"/g, '""')}"`, `"${p.client_name.replace(/"/g, '""')}"`, p.amount]),
            [],
            ['PERFORMANCE PAKET'],
            ['Nama Paket', 'Total Project', 'Revenue (Rp)', 'Kontribusi (%)'],
            ...package_performance.map((pkg) => [`"${pkg.package_name.replace(/"/g, '""')}"`, pkg.total_projects, pkg.revenue, `${pkg.percentage}%`]),
            [],
            ['PERFORMANCE LAYANAN TERLARIS'],
            ['Nama Layanan', 'Total Project', 'Revenue (Rp)'],
            ...top_services.map((s) => [`"${s.name.replace(/"/g, '""')}"`, s.total_projects, s.revenue]),
            [],
            ['PERFORMANCE ADD-ON TERLARIS'],
            ['Nama Add-on', 'Total Order', 'Revenue (Rp)'],
            ...top_addons.map((a) => [`"${a.name.replace(/"/g, '""')}"`, a.total_orders, a.revenue]),
            [],
            ['SUMBER KLIEN / REFERRAL'],
            ['Sumber Klien', 'Jumlah Klien', 'Persentase (%)'],
            ...client_sources.items.map((src) => [`"${src.name.replace(/"/g, '""')}"`, src.count, `${src.percentage}%`]),
        ];

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `laporan-arams-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportDropdownOpen(false);
    };

    const handlePrintPDF = () => {
        setExportDropdownOpen(false);
        // Small timeout so dropdown closes cleanly before print dialog triggers
        setTimeout(() => {
            window.print();
        }, 150);
    };

    return (
        <div className="w-full max-w-full space-y-4 pb-2">
            <Head title="Reports - Arams Pictures" />

            {/* ── PRINT-ONLY OFFICIAL STUDIO REPORT HEADER ──────────────────── */}
            <div className="hidden print:flex flex-col gap-3.5 mb-6 pb-4 border-b-2 border-slate-900 print-break-inside-avoid">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg tracking-wider shrink-0"
                            style={{ backgroundColor: reportPrimaryColor }}
                        >
                            A
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold tracking-tight text-slate-950 leading-tight">
                                ARAMS PICTURES
                            </h1>
                            <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                                Studio &amp; Cinema Production — Laporan Performa Bisnis &amp; Keuangan
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300">
                            Dokumen Resmi Internal
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Periode Laporan
                        </span>
                        <span className="font-bold text-slate-900">{date_range_text}</span>
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Tanggal Cetak
                        </span>
                        <span className="font-bold text-slate-900">
                            {last_updated || new Date().toLocaleString('id-ID')}
                        </span>
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Dicetak Oleh
                        </span>
                        <span className="font-bold text-slate-900">
                            {pageProps?.auth?.user?.name || 'Administrator Arams'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── 1. SCREEN HEADER SECTION ─────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Reports
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Ringkasan performa bisnis Arams Pictures.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Export Laporan Dropdown (Gambar 1) */}
                    <div ref={exportRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                            style={{ backgroundColor: reportPrimaryColor }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer hover:opacity-90 active:scale-95"
                            aria-expanded={exportDropdownOpen}
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export Laporan</span>
                            <ChevronDown
                                className={`w-3.5 h-3.5 text-white/80 transition-transform duration-200 ${
                                    exportDropdownOpen ? 'rotate-180' : ''
                                }`}
                            />
                        </button>

                        {exportDropdownOpen && (
                            <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 z-40 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 text-xs animate-in fade-in zoom-in-95 duration-100">
                                <button
                                    type="button"
                                    onClick={handlePrintPDF}
                                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-2.5 cursor-pointer transition-colors"
                                >
                                    <Printer className="w-4 h-4 text-slate-500 shrink-0" />
                                    <div className="flex flex-col">
                                        <span>Cetak / Simpan PDF</span>
                                        <span className="text-[10px] text-slate-400 font-normal">Format A4 &amp; Tanda Tangan</span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleExportCSV}
                                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-2.5 cursor-pointer transition-colors border-t border-slate-100 dark:border-slate-800 mt-1"
                                >
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <div className="flex flex-col">
                                        <span>Export Excel / CSV</span>
                                        <span className="text-[10px] text-slate-400 font-normal">Data tabel lengkap &amp; metrik</span>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Date Picker Button (Gambar 1 & Gambar 2) */}
                    <DateRangePicker
                        placeholder={date_range_text}
                        onChange={handleDateRangeChange}
                        primaryColor={reportPrimaryColor}
                    />
                </div>
            </div>

            {/* ── 2. ROW 1: 4 KPI METRIC CARDS ─────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-3 print-break-inside-avoid">
                {/* 1. Total Nilai Project */}
                <div className="bg-white dark:bg-slate-900/70 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between print:shadow-none print:border-slate-300 print:bg-white print:p-3.5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 print:text-slate-800">
                            <span>Total Nilai Project</span>
                            <Info className="w-3 h-3 text-slate-400 print:hidden" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: reportPrimaryColor }}>
                            {formatRupiah(summary.total_project_value)}
                        </h2>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <span>▲ {summary.total_project_value_growth.toFixed(2).replace('.', ',')}%</span>
                            <span className="font-normal text-slate-400">dari periode lalu</span>
                        </div>
                    </div>
                    <div
                        className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs print:shadow-none"
                        style={{
                            borderColor: `color-mix(in srgb, ${reportPrimaryColor} 30%, transparent)`,
                            backgroundColor: `color-mix(in srgb, ${reportPrimaryColor} 10%, transparent)`,
                        }}
                    >
                        <CreditCard className="w-5 h-5" style={{ color: reportPrimaryColor }} />
                    </div>
                </div>

                {/* 2. Sudah Diterima */}
                <div className="bg-white dark:bg-slate-900/70 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between print:shadow-none print:border-slate-300 print:bg-white print:p-3.5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 print:text-slate-800">
                            <span>Sudah Diterima</span>
                            <Info className="w-3 h-3 text-slate-400 print:hidden" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: reportReceivedColor }}>
                            {formatRupiah(summary.total_received)}
                        </h2>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <span>▲ {summary.total_received_growth.toFixed(2).replace('.', ',')}%</span>
                            <span className="font-normal text-slate-400">dari periode lalu</span>
                        </div>
                    </div>
                    <div
                        className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs print:shadow-none"
                        style={{
                            borderColor: `color-mix(in srgb, ${reportReceivedColor} 30%, transparent)`,
                            backgroundColor: `color-mix(in srgb, ${reportReceivedColor} 10%, transparent)`,
                        }}
                    >
                        <ArrowDown className="w-5 h-5" style={{ color: reportReceivedColor }} />
                    </div>
                </div>

                {/* 3. Belum Diterima */}
                <div className="bg-white dark:bg-slate-900/70 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between print:shadow-none print:border-slate-300 print:bg-white print:p-3.5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 print:text-slate-800">
                            <span>Belum Diterima</span>
                            <Info className="w-3 h-3 text-slate-400 print:hidden" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: reportPendingColor }}>
                            {formatRupiah(summary.total_pending)}
                        </h2>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                            <span>▼ {Math.abs(summary.total_pending_growth).toFixed(2).replace('.', ',')}%</span>
                            <span className="font-normal text-slate-400">dari periode lalu</span>
                        </div>
                    </div>
                    <div
                        className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs print:shadow-none"
                        style={{
                            borderColor: `color-mix(in srgb, ${reportPendingColor} 30%, transparent)`,
                            backgroundColor: `color-mix(in srgb, ${reportPendingColor} 10%, transparent)`,
                        }}
                    >
                        <ArrowUp className="w-5 h-5" style={{ color: reportPendingColor }} />
                    </div>
                </div>

                {/* 4. Total Project */}
                <div className="bg-white dark:bg-slate-900/70 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between print:shadow-none print:border-slate-300 print:bg-white print:p-3.5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 print:text-slate-800">
                            <span>Total Project</span>
                            <Info className="w-3 h-3 text-slate-400 print:hidden" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: reportProjectsColor }}>
                            {summary.total_projects}
                        </h2>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <span>▲ {summary.total_projects_growth.toFixed(2).replace('.', ',')}%</span>
                            <span className="font-normal text-slate-400">dari periode lalu</span>
                        </div>
                    </div>
                    <div
                        className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs print:shadow-none"
                        style={{
                            borderColor: `color-mix(in srgb, ${reportProjectsColor} 30%, transparent)`,
                            backgroundColor: `color-mix(in srgb, ${reportProjectsColor} 10%, transparent)`,
                        }}
                    >
                        <Folder className="w-5 h-5" style={{ color: reportProjectsColor }} />
                    </div>
                </div>
            </div>

            {/* ── 3. ROW 2: PERFORMA BULANAN & TOP 5 PROJECTS ─────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 print:grid-cols-12 print:gap-4 print-break-inside-avoid">
                {/* Left Card (~60%): Performa Project per Bulan + Kategori Project */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900/70 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between print:shadow-none print:border-slate-300 print:bg-white print:p-4">
                    <div className="space-y-4">
                        {/* Header card */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white print:text-slate-950">
                                    Performa Project per Bulan
                                </h3>
                                <Info className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                            </div>

                            <div className="relative print:hidden">
                                <button
                                    type="button"
                                    onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer shadow-2xs"
                                >
                                    <span>{filterPeriod}</span>
                                    <ChevronDown className="w-3 h-3 text-slate-400" />
                                </button>
                                {periodDropdownOpen && (
                                    <div className="absolute right-0 top-8 z-20 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 text-xs">
                                        {['Bulanan', 'Kuartalan', 'Tahunan'].map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => {
                                                    setFilterPeriod(p);
                                                    setPeriodDropdownOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chart Legend */}
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300 print:text-slate-800">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: reportRevenueColor }} />
                                <span>Revenue (Rp)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: reportProjectsColor }} />
                                <span>Jumlah Project</span>
                            </div>
                        </div>

                        {/* Dual content: Combo chart on left, Donut category on right */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1 items-center">
                            <div className="md:col-span-7">
                                <ComboBarLineChart
                                    data={monthly_performance}
                                    barColor={reportRevenueColor}
                                    lineColor={reportProjectsColor}
                                />
                            </div>

                            <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 print:border-slate-200 pt-3 md:pt-0 md:pl-4 space-y-3">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 print:text-slate-900">
                                    Kategori Project
                                </h4>
                                <div className="flex items-center gap-3">
                                    <DonutChart
                                        items={project_categories}
                                        size={105}
                                        strokeWidth={20}
                                    />
                                    <div className="space-y-1 text-[11px] flex-1">
                                        {project_categories.map((c) => (
                                            <div key={c.name} className="flex items-center justify-between text-slate-600 dark:text-slate-300 print:text-slate-800 font-medium">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                                                    <span className="truncate">{c.name}</span>
                                                </div>
                                                <span className="font-bold shrink-0 ml-1">
                                                    {c.percentage.toFixed(2).replace('.', ',')}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer link */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 print:hidden">
                        <Link
                            href="/client/projects"
                            style={{ color: reportPrimaryColor }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold hover:opacity-80 transition-opacity"
                        >
                            <span>Lihat Detail Project</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Right Card (~40%): Top 5 Project (Berdasarkan Nilai) */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900/70 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between print:shadow-none print:border-slate-300 print:bg-white print:p-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white print:text-slate-950">
                                Top 5 Project <span className="font-normal text-slate-500">(Berdasarkan Nilai)</span>
                            </h3>
                            <Info className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                        </div>

                        {/* Top 5 Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 print:border-slate-200 tracking-wider">
                                        <th className="pb-2 w-6">#</th>
                                        <th className="pb-2">PROJECT</th>
                                        <th className="pb-2">CLIENT</th>
                                        <th className="pb-2 text-right">NILAI PROJECT</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 print:divide-slate-200 font-medium">
                                    {top_projects.map((proj) => (
                                        <tr key={proj.rank} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-2.5 text-slate-400 font-bold">{proj.rank}</td>
                                            <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200 print:text-slate-900 max-w-[130px] truncate" title={proj.project_name}>
                                                {proj.project_name}
                                            </td>
                                            <td className="py-2.5 text-slate-500 dark:text-slate-400 print:text-slate-700 max-w-[100px] truncate">
                                                {proj.client_name}
                                            </td>
                                            <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white print:text-slate-900">
                                                {formatRupiah(proj.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer link */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 print:hidden">
                        <Link
                            href="/client/projects"
                            style={{ color: reportPrimaryColor }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold hover:opacity-80 transition-opacity"
                        >
                            <span>Lihat Semua Project</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── 4. ROW 3: PERFORMANCE PAKET & LAYANAN / ADD-ON ──────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 print:grid-cols-12 print:gap-4 print-break-inside-avoid">
                {/* Left Card (~40%): Performance Paket */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900/70 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between print:shadow-none print:border-slate-300 print:bg-white print:p-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white print:text-slate-950">
                                Performance Paket
                            </h3>
                            <Info className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 print:border-slate-200 tracking-wider">
                                        <th className="pb-2">PAKET</th>
                                        <th className="pb-2 text-center">TOTAL PROJECT</th>
                                        <th className="pb-2 text-right">REVENUE</th>
                                        <th className="pb-2 text-right w-24">% REVENUE</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 print:divide-slate-200 font-medium">
                                    {package_performance.map((pkg) => (
                                        <tr key={pkg.package_name} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200 print:text-slate-900">{pkg.package_name}</td>
                                            <td className="py-2.5 text-center text-slate-600 dark:text-slate-300 print:text-slate-700 font-semibold">{pkg.total_projects}</td>
                                            <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white print:text-slate-900">{formatRupiah(pkg.revenue)}</td>
                                            <td className="py-2.5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <span className="font-bold text-slate-700 dark:text-slate-300 print:text-slate-900 text-[11px]">
                                                        {pkg.percentage.toFixed(2).replace('.', ',')}%
                                                    </span>
                                                    <div className="w-10 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 print:bg-slate-200 overflow-hidden shrink-0">
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{
                                                                width: `${Math.min(pkg.percentage, 100)}%`,
                                                                backgroundColor: reportPrimaryColor,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 print:hidden">
                        <Link
                            href="/master-data/packages"
                            style={{ color: reportPrimaryColor }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold hover:opacity-80 transition-opacity"
                        >
                            <span>Lihat Detail Paket</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Right Card (~60%): Performance Layanan & Add-on */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900/70 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between print:shadow-none print:border-slate-300 print:bg-white print:p-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white print:text-slate-950">
                                Performance Layanan &amp; Add-on
                            </h3>
                            <Info className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
                            {/* Column 1: Layanan Terlaris */}
                            <div className="space-y-2 overflow-x-auto">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 print:text-slate-900">
                                    Layanan Terlaris
                                </h4>
                                <table className="w-full text-xs text-left min-w-[260px]">
                                    <thead>
                                        <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 print:border-slate-200 tracking-wider">
                                            <th className="pb-1.5 pr-2 whitespace-nowrap">LAYANAN</th>
                                            <th className="pb-1.5 px-2 text-center whitespace-nowrap">PROYEK</th>
                                            <th className="pb-1.5 pl-2 text-right whitespace-nowrap">REVENUE</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 print:divide-slate-200 font-medium">
                                        {top_services.map((s) => (
                                            <tr key={s.name} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="py-2 pr-2">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        {getServiceAddonIcon(s.icon)}
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200 print:text-slate-900 truncate max-w-[140px] block" title={s.name}>{s.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-2 text-center text-slate-600 dark:text-slate-300 print:text-slate-700 whitespace-nowrap">{s.total_projects}</td>
                                                <td className="py-2 pl-2 text-right font-bold text-slate-900 dark:text-white print:text-slate-900 whitespace-nowrap">{formatRupiah(s.revenue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Column 2: Add-on Terlaris */}
                            <div className="space-y-2 overflow-x-auto">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 print:text-slate-900">
                                    Add-on Terlaris
                                </h4>
                                <table className="w-full text-xs text-left min-w-[260px]">
                                    <thead>
                                        <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 print:border-slate-200 tracking-wider">
                                            <th className="pb-1.5 pr-2 whitespace-nowrap">ADD-ON</th>
                                            <th className="pb-1.5 px-2 text-center whitespace-nowrap">ORDER</th>
                                            <th className="pb-1.5 pl-2 text-right whitespace-nowrap">REVENUE</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 print:divide-slate-200 font-medium">
                                        {top_addons.map((a) => (
                                            <tr key={a.name} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="py-2 pr-2">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        {getServiceAddonIcon(a.icon)}
                                                        <span className="font-semibold text-slate-800 dark:text-slate-200 print:text-slate-900 truncate max-w-[140px] block" title={a.name}>{a.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-2 px-2 text-center text-slate-600 dark:text-slate-300 print:text-slate-700 whitespace-nowrap">{a.total_orders}</td>
                                                <td className="py-2 pl-2 text-right font-bold text-slate-900 dark:text-white print:text-slate-900 whitespace-nowrap">{formatRupiah(a.revenue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 print:hidden">
                        <Link
                            href="/master-data/services"
                            className="inline-flex items-center gap-1.5 text-xs font-bold transition-colors hover:opacity-80"
                            style={{ color: reportPrimaryColor }}
                        >
                            <span>Lihat Detail Layanan &amp; Add-on</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── 5. ROW 4: SUMBER KLIEN / REFERRAL ───── */}
            <div className="bg-white dark:bg-slate-900/70 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-4 print:shadow-none print:border-slate-300 print:bg-white print:p-4 print-break-inside-avoid">
                <div className="space-y-4">
                    <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white print:text-slate-950">
                            Sumber Klien / Referral
                        </h3>
                        <Info className="w-3.5 h-3.5 text-slate-400 print:hidden" />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 lg:gap-10 pt-2 print:flex-row print:gap-8">
                        {/* Donut Chart with center Total Project */}
                        <div className="shrink-0">
                            <DonutChart
                                items={client_sources.items}
                                size={150}
                                strokeWidth={24}
                                centerLabel="Total Project"
                                centerValue={client_sources.total}
                            />
                        </div>

                        {/* Legend List (Responsive Grid) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full flex-1 print:grid-cols-3 print:gap-2">
                            {client_sources.items.map((src) => (
                                <div
                                    key={src.name}
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 print:bg-slate-50 print:border-slate-200 text-xs text-slate-700 dark:text-slate-300 print:text-slate-800"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: src.color }} />
                                        <span className="font-semibold truncate">{src.name}</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white print:text-slate-900 shrink-0 ml-2">
                                        {src.count} ({src.percentage.toFixed(2).replace('.', ',')}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 print:hidden">
                    <Link
                        href="/client-sources"
                        className="inline-flex items-center gap-1.5 text-xs font-bold transition-colors hover:opacity-80"
                        style={{ color: reportPrimaryColor }}
                    >
                        <span>Lihat Detail Sumber Klien</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* ── PRINT-ONLY FOOTER & OFFICIAL APPROVAL STAMP ────────────── */}
            <div className="hidden print:flex flex-col gap-6 mt-10 pt-6 border-t-2 border-slate-300 print-break-inside-avoid">
                <div className="flex justify-between items-start text-xs text-slate-600">
                    <div className="max-w-md space-y-1">
                        <p className="font-bold text-slate-900">Catatan &amp; Ketentuan Laporan:</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                            Laporan ini digenerate secara otomatis oleh Sistem Informasi Arams Pictures berdasarkan data transaksi dan aktivitas proyek aktual yang tercatat pada database.
                        </p>
                    </div>
                    <div className="text-center min-w-[220px] space-y-14">
                        <div>
                            <p className="text-[11px] text-slate-600">
                                Disahkan di Bandung,{' '}
                                {new Date().toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                            <p className="font-bold text-slate-900 text-xs mt-0.5">
                                Manajemen Studio Arams Pictures
                            </p>
                        </div>
                        <div className="border-t border-slate-500 pt-1 mx-4">
                            <p className="font-bold text-slate-900 text-xs">( ___________________________ )</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
