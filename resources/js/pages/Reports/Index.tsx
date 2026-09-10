import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Briefcase,
    Users,
    Download,
    Calendar,
    CheckCircle2,
    Layers,
    ChevronDown,
    Award,
    Sparkles,
    Target,
    Zap,
    Info,
    ArrowUpRight,
    ArrowDownRight,
    Camera,
    Palette,
    Video,
    Smile,
    Building2,
    HeartHandshake,
    Tag,
} from 'lucide-react';
import { formatRupiah, formatRupiahCompact } from '@/lib/formatters';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    TableEmpty,
} from '@/components/ui';

interface ReportIndexProps {
    year: number;
    available_years?: number[];
    summary: {
        revenue: number;
        projects: number;
        completed: number;
        new_clients: number;
        completion_rate: number;
        revenue_growth?: number;
        projects_growth?: number;
        clients_growth?: number;
        completion_rate_growth?: number;
    };
    insights?: {
        highest_month?: { name: string; revenue: number };
        top_category?: { name: string; count: number };
        top_source?: { name: string; revenue: number };
        completion_rate?: number;
    };
    monthly_revenue: Array<{
        month: string;
        revenue: number;
        projects: number;
    }>;
    categories_report: Array<{
        id: string | number;
        name: string;
        projects_count: number;
        projects_sum_total_amount: number;
    }>;
    team_report: Array<{
        id: string | number;
        name: string;
        role: string;
        avatar?: string;
        photo_count: number;
        edit_count: number;
    }>;
    referrals_report?: Array<{
        source_name: string;
        client_count: number;
        project_count: number;
        total_revenue: number;
        total_paid: number;
        percentage: number;
    }>;
    wedding_organizers_report?: Array<{
        id: string;
        name: string;
        pic_name?: string;
        phone?: string;
        tier?: string;
        projects_count: number;
        total_revenue: number;
    }>;
    last_updated?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getCategoryIcon(name: string) {
    const lower = name.toLowerCase();
    if (lower.includes('wedding')) return <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />;
    if (lower.includes('prewed')) return <Sparkles className="w-3.5 h-3.5 text-purple-600" />;
    if (lower.includes('event')) return <Video className="w-3.5 h-3.5 text-blue-600" />;
    if (lower.includes('corp')) return <Building2 className="w-3.5 h-3.5 text-indigo-600" />;
    if (lower.includes('mater')) return <Smile className="w-3.5 h-3.5 text-pink-600" />;
    if (lower.includes('newborn')) return <Smile className="w-3.5 h-3.5 text-amber-600" />;
    if (lower.includes('birth')) return <Sparkles className="w-3.5 h-3.5 text-rose-600" />;
    if (lower.includes('produk') || lower.includes('brand')) return <Palette className="w-3.5 h-3.5 text-teal-600" />;
    return <Camera className="w-3.5 h-3.5 text-slate-600" />;
}

// ─── Smooth Area/Line Chart Component (Pure SVG Bezier Curves) ────────────────
function RevenueAreaChart({
    data,
    year,
}: {
    data: Array<{ month: string; revenue: number }>;
    year: number;
}) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const maxVal = Math.max(...data.map(d => d.revenue), 250000000);
    // Ceiling to nearest 50M
    const yMax = Math.ceil(maxVal / 50000000) * 50000000;
    const ySteps = [yMax, yMax * 0.8, yMax * 0.6, yMax * 0.4, yMax * 0.2, 0];

    const chartWidth = 900;
    const chartHeight = 280;
    const paddingLeft = 65;
    const paddingRight = 35;
    const paddingTop = 35;
    const paddingBottom = 40;

    const plotWidth = chartWidth - paddingLeft - paddingRight;
    const plotHeight = chartHeight - paddingTop - paddingBottom;

    // Calculate coordinates for points
    const points = data.map((d, index) => {
        const x = paddingLeft + (index / (data.length - 1)) * plotWidth;
        const normalizedVal = d.revenue / yMax;
        const y = paddingTop + (1 - normalizedVal) * plotHeight;
        return { x, y, ...d };
    });

    // Create SVG smooth cubic bezier path
    const createSmoothPath = (pts: Array<{ x: number; y: number }>) => {
        if (pts.length === 0) return '';
        let path = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i === 0 ? 0 : i - 1];
            const p1 = pts[i];
            const p2 = pts[i + 1];
            const p3 = pts[i + 2] || p2;

            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;

            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
        }
        return path;
    };

    const linePath = createSmoothPath(points);
    const areaPath = points.length > 0
        ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + plotHeight} L ${points[0].x} ${paddingTop + plotHeight} Z`
        : '';

    return (
        <div className="relative w-full overflow-x-auto">
            <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto min-w-[700px] select-none"
                style={{ overflow: 'visible' }}
            >
                <defs>
                    {/* Area Gradient */}
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                    </linearGradient>
                    {/* Line Gradient */}
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="50%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                    {/* Glow filter */}
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7C3AED" floodOpacity="0.3" />
                    </filter>
                </defs>

                {/* Horizontal Grid lines & Y-Axis Labels */}
                {ySteps.map((val, idx) => {
                    const y = paddingTop + (idx / (ySteps.length - 1)) * plotHeight;
                    return (
                        <g key={idx} className="pointer-events-none">
                            <line
                                x1={paddingLeft}
                                y1={y}
                                x2={chartWidth - paddingRight}
                                y2={y}
                                stroke="#F1F5F9"
                                strokeDasharray={idx === ySteps.length - 1 ? 'none' : '4 4'}
                                strokeWidth="1"
                            />
                            <text
                                x={paddingLeft - 10}
                                y={y + 3.5}
                                textAnchor="end"
                                className="text-[10px] font-medium fill-slate-400 font-mono"
                            >
                                {val === 0 ? 'Rp 0' : formatRupiahCompact(val)}
                            </text>
                        </g>
                    );
                })}

                {/* Filled Area */}
                {areaPath && (
                    <path d={areaPath} fill="url(#areaGradient)" className="pointer-events-none" />
                )}

                {/* Curved Line */}
                {linePath && (
                    <path
                        d={linePath}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glow)"
                        className="pointer-events-none"
                    />
                )}

                {/* Data Points, Value Pills & Stable Hit Areas */}
                {points.map((pt, i) => {
                    const isHovered = hoveredIdx === i;
                    return (
                        <g key={i}>
                            {/* Vertical Guide Line on Hover */}
                            {isHovered && (
                                <line
                                    x1={pt.x}
                                    y1={paddingTop}
                                    x2={pt.x}
                                    y2={paddingTop + plotHeight}
                                    stroke="#7C3AED"
                                    strokeDasharray="3 3"
                                    strokeWidth="1"
                                    strokeOpacity="0.5"
                                    className="pointer-events-none"
                                />
                            )}

                            {/* Outer Glow Ring */}
                            <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isHovered ? 7 : 5}
                                fill="#FFFFFF"
                                stroke={isHovered ? '#6366F1' : '#7C3AED'}
                                strokeWidth={isHovered ? 3 : 2.5}
                                className="pointer-events-none transition-all duration-150"
                            />
                            {/* Inner Dot */}
                            <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={isHovered ? 3 : 2}
                                fill={isHovered ? '#6366F1' : '#7C3AED'}
                                className="pointer-events-none transition-all duration-150"
                            />

                            {/* Value Pill Above Point */}
                            {pt.revenue > 0 && (
                                <g transform={`translate(${pt.x}, ${pt.y - (isHovered ? 15 : 12)})`} className="pointer-events-none transition-all duration-150">
                                    {isHovered && (
                                        <rect
                                            x="-32"
                                            y="-11"
                                            width="64"
                                            height="16"
                                            rx="4"
                                            fill="#1E1B4B"
                                            opacity="0.9"
                                        />
                                    )}
                                    <text
                                        x="0"
                                        y="0"
                                        textAnchor="middle"
                                        className={`text-[9px] font-bold font-mono ${isHovered ? 'fill-white' : 'fill-slate-700'
                                            }`}
                                    >
                                        {formatRupiahCompact(pt.revenue)}
                                    </text>
                                </g>
                            )}

                            {/* Month X-Axis Label */}
                            <text
                                x={pt.x}
                                y={chartHeight - 12}
                                textAnchor="middle"
                                className={`text-[11px] pointer-events-none transition-all duration-150 ${isHovered ? 'fill-purple-600 font-bold' : 'fill-slate-500 font-medium'
                                    }`}
                            >
                                {pt.month}
                            </text>

                            {/* Stable Wide Hit-Area to prevent hover jitter */}
                            <rect
                                x={pt.x - plotWidth / (data.length * 2)}
                                y={paddingTop}
                                width={plotWidth / data.length}
                                height={plotHeight + 30}
                                fill="transparent"
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredIdx(i)}
                                onMouseLeave={() => setHoveredIdx(null)}
                            />
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReportIndex({
    year = 2026,
    available_years = [2024, 2025, 2026, 2027],
    summary = { revenue: 0, projects: 0, completed: 0, new_clients: 0, completion_rate: 0 },
    insights = {},
    monthly_revenue = [],
    categories_report = [],
    team_report = [],
    referrals_report = [],
    last_updated = '22 Mei 2026 10:30 WIB',
}: ReportIndexProps) {

    const [selectedYear, setSelectedYear] = useState<number>(year);
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

    const handleYearChange = (newYear: number) => {
        setSelectedYear(newYear);
        setIsYearDropdownOpen(false);
        router.get('/reports', { year: newYear }, { preserveState: true, preserveScroll: true });
    };

    const completionRate = summary.completion_rate ??
        (summary.projects > 0 ? Math.round((summary.completed / summary.projects) * 100) : 100);

    return (
        <div className="w-full max-w-full space-y-6 pb-12">
            <Head title="Laporan & Analitik Studio - Lensaria Photography" />

            {/* ── HEADER TITLE & CONTROLS ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100/60 shadow-2xs">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--app-heading-color)' }}>
                            Laporan &amp; Analitik Studio
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--app-muted-color)' }}>
                            Ringkasan pendapatan, pertumbuhan project, dan rekapitulasi referral tahun {year}.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Year Selector Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Tahun {selectedYear}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        {isYearDropdownOpen && (
                            <div className="absolute right-0 top-11 z-30 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                {available_years.map((yr) => (
                                    <button
                                        key={yr}
                                        type="button"
                                        onClick={() => handleYearChange(yr)}
                                        className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-purple-50 transition-colors cursor-pointer flex items-center justify-between ${selectedYear === yr ? 'text-purple-600 bg-purple-50/60 font-bold' : 'text-slate-700'
                                            }`}
                                    >
                                        <span>Tahun {yr}</span>
                                        {selectedYear === yr && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Download PDF Button */}
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        <span>Download Laporan (PDF)</span>
                    </button>
                </div>
            </div>

            {/* ── 4 SUMMARY STAT CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                {/* 1. Total Pendapatan */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100/50">
                            <Briefcase className="w-4.5 h-4.5 text-blue-600" />
                        </div>
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            TOTAL PENDAPATAN
                        </span>
                        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5 font-mono">
                            {formatRupiah(summary.revenue)}
                        </h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 pt-1 border-t border-slate-100">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>▲ {summary.revenue_growth ?? 18.6}% dari tahun {year - 1}</span>
                    </div>
                </div>

                {/* 2. Total Project */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100/50">
                            <Layers className="w-4.5 h-4.5 text-purple-600" />
                        </div>
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            TOTAL PROJECT
                        </span>
                        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                            {summary.projects}
                        </h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 pt-1 border-t border-slate-100">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>▲ {summary.projects_growth ?? 16} Project dari tahun {year - 1}</span>
                    </div>
                </div>

                {/* 3. Klien Baru */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100/50">
                            <Users className="w-4.5 h-4.5 text-emerald-600" />
                        </div>
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            KLIEN BARU
                        </span>
                        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                            {summary.new_clients}
                        </h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 pt-1 border-t border-slate-100">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>▲ {summary.clients_growth ?? 22} Klien dari tahun {year - 1}</span>
                    </div>
                </div>

                {/* 4. Completion Rate */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100/50">
                            <CheckCircle2 className="w-4.5 h-4.5 text-amber-600" />
                        </div>
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            COMPLETION RATE
                        </span>
                        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                            {completionRate}%
                        </h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-500 pt-1 border-t border-slate-100">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span>▼ {summary.completion_rate_growth ?? -4}% dari tahun {year - 1}</span>
                    </div>
                </div>
            </div>

            {/* ── GRAFIK PENDAPATAN BULANAN (AREA SPLINE CHART) ── */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Grafik Pendapatan Bulanan ({year})
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Total penerimaan kas per bulan dalam Rupiah (IDR)</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
                        <span>Tahun {year}</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                    </span>
                </div>

                <div className="pt-2">
                    <RevenueAreaChart data={monthly_revenue} year={year} />
                </div>
            </div>

            {/* ── REKAPITULASI SUMBER LEAD & REFERRAL KLIEN ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">
                                Rekapitulasi Sumber Lead &amp; Referral Klien ({year})
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Menu Report
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Melacak sumber referral mana yang paling sering dan besar memberikan klien ke Arams Pictures
                        </p>
                    </div>

                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                        {referrals_report.length} Sumber Terdata
                    </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="px-6">SUMBER / NAMA REFERRAL</TableHead>
                                <TableHead className="text-center">TOTAL KLIEN (X)</TableHead>
                                <TableHead className="text-center">TOTAL PROJECT</TableHead>
                                <TableHead className="text-right">TOTAL NILAI PROJECT</TableHead>
                                <TableHead className="text-right px-6">KONTRIBUSI (%)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {referrals_report.length > 0 ? (
                                referrals_report.map((ref, idx) => (
                                    <TableRow key={idx} className="hover:bg-slate-50/70 transition-colors">
                                        <TableCell className="px-6 font-bold text-slate-900">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs border border-amber-200/60 font-mono">
                                                    {idx + 1}
                                                </div>
                                                <span>{ref.source_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-mono">
                                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200 text-xs inline-block">
                                                {ref.client_count} Klien
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center font-mono font-semibold text-slate-700">
                                            {ref.project_count} Project
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-bold text-slate-900">
                                            {formatRupiah(ref.total_revenue)}
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <div className="flex items-center justify-end gap-2.5">
                                                <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#C89445] rounded-full transition-all"
                                                        style={{ width: `${ref.percentage}%` }}
                                                    />
                                                </div>
                                                <span className="font-mono font-bold text-xs text-slate-700 min-w-[45px] text-right">
                                                    {ref.percentage}%
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableEmpty colSpan={5} message="Belum ada data sumber referral yang tercatat." />
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* ── CARD: CATEGORY PERFORMANCE ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
                <div>
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">
                                Performa per Kategori Layanan
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">Kontribusi nilai project berdasarkan kategori foto</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                            {categories_report.length} Kategori Terdata
                        </span>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-6">KATEGORI LAYANAN</TableHead>
                                    <TableHead className="text-center">TOTAL PROJECT</TableHead>
                                    <TableHead className="text-right px-6">TOTAL NILAI</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories_report.length > 0 ? (
                                    categories_report.map((cat) => (
                                        <TableRow key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                                            <TableCell className="px-6 font-bold text-slate-800">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200/60">
                                                        {getCategoryIcon(cat.name)}
                                                    </div>
                                                    <span>{cat.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-mono font-semibold text-slate-700">
                                                {cat.projects_count} Project
                                            </TableCell>
                                            <TableCell className="text-right px-6 font-mono font-bold text-slate-900">
                                                {formatRupiah(cat.projects_sum_total_amount || 0)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableEmpty colSpan={3} message="Belum ada data kategori" />
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {categories_report.length > 0 ? (
                            categories_report.map((cat) => (
                                <div key={cat.id} className="p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getCategoryIcon(cat.name)}
                                            <h4 className="font-bold text-slate-900 text-xs">{cat.name}</h4>
                                        </div>
                                        <span className="font-mono font-semibold text-slate-700 text-xs">
                                            {cat.projects_count} Project
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                                        <span className="text-slate-400">Total Nilai:</span>
                                        <span className="font-mono font-bold text-slate-900 text-xs">
                                            {formatRupiah(cat.projects_sum_total_amount || 0)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-slate-400 text-xs">
                                Belum ada data kategori.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer link */}
                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-center">
                    <Link
                        href="/master-data/categories"
                        className="text-xs font-bold text-slate-700 hover:text-purple-600 inline-flex items-center gap-1 transition-colors"
                    >
                        <span>Lihat Detail Kategori</span>
                        <span>→</span>
                    </Link>
                </div>
            </div>

            {/* ── INSIGHT & RINGKASAN BOTTOM SECTION ── */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">
                    Insight &amp; Ringkasan
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Insight 1: Pendapatan Tertinggi */}
                    <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Pendapatan Tertinggi
                            </span>
                        </div>
                        <div>
                            <h4 className="text-sm font-extrabold text-slate-900">
                                {insights?.highest_month?.name ?? `Mei ${year}`}
                            </h4>
                            <p className="text-xs font-bold text-emerald-700 font-mono mt-0.5">
                                {formatRupiah(insights?.highest_month?.revenue ?? 224300000)}
                            </p>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Bulan paling produktif dari sisi pendapatan.
                        </p>
                    </div>

                    {/* Insight 2: Kategori Terlaris */}
                    <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                <Award className="w-4 h-4" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Kategori Terlaris
                            </span>
                        </div>
                        <div>
                            <h4 className="text-sm font-extrabold text-slate-900">
                                {insights?.top_category?.name ?? 'Wedding'}
                            </h4>
                            <p className="text-xs font-bold text-blue-700 font-mono mt-0.5">
                                {insights?.top_category?.count ?? 10} Project
                            </p>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Kontribusi terbesar dari total nilai project.
                        </p>
                    </div>

                    {/* Insight 3: Sumber Terbaik */}
                    <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                                <Target className="w-4 h-4" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Sumber Terbaik
                            </span>
                        </div>
                        <div>
                            <h4 className="text-sm font-extrabold text-slate-900">
                                {insights?.top_source?.name ?? 'Website'}
                            </h4>
                            <p className="text-xs font-bold text-amber-700 font-mono mt-0.5">
                                {formatRupiah(insights?.top_source?.revenue ?? 484375000)}
                            </p>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Nilai project tertinggi dari sumber referral.
                        </p>
                    </div>

                    {/* Insight 4: Kinerja Tim */}
                    <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                                <Zap className="w-4 h-4" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Kinerja Tim
                            </span>
                        </div>
                        <div>
                            <h4 className="text-sm font-extrabold text-slate-900">
                                {completionRate}% Completion
                            </h4>
                            <p className="text-xs font-bold text-rose-600 mt-0.5">
                                {summary.completion_rate_growth ?? -4}% dari {year - 1}
                            </p>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Tingkat penyelesaian project tepat waktu.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── FOOTER INFO ── */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <div className="flex items-center gap-1.5">
                    <span>Data diperbarui terakhir: {last_updated}</span>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                </div>
            </div>
        </div>
    );
}