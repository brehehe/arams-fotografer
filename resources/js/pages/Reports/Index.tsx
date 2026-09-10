import { Head, Link, router } from '@inertiajs/react';
import {
    BarChart3, TrendingUp, Users,
    Calendar, CheckCircle2, Layers, ChevronDown, Award, Sparkles,
    Target, Zap, ArrowUpRight, ArrowDownRight, Camera, Palette,
    Video, Smile, Building2, HeartHandshake,
    CreditCard, AlertCircle, MapPin, Package,
    Printer, FileDown, ChevronRight, Activity, DollarSign,
    ReceiptText, Users2, Handshake,
    BadgeCheck, Timer, XCircle,
} from 'lucide-react';
import React, { useState, useCallback } from 'react';
import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty,
} from '@/components/ui';
import { formatRupiah, formatRupiahCompact } from '@/lib/formatters';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MonthlyRevenue {
    month: string;
    month_index: number;
    revenue: number;
    projects: number;
    completed: number;
}

interface CategoryItem {
    id: string | number;
    name: string;
    slug?: string;
    icon?: string;
    color?: string;
    workflow_type?: string;
    projects_count: number;
    projects_sum_total_amount: number;
    projects_sum_paid_amount: number;
    percentage: number;
}

interface PackageItem {
    id: string | number;
    name: string;
    category_name: string;
    category_color: string;
    base_price: number;
    projects_count: number;
    total_revenue: number;
    total_paid: number;
    avg_deal: number;
    percentage: number;
}

interface WOItem {
    id: string;
    name: string;
    pic_name: string;
    phone: string;
    tier: string;
    projects_count: number;
    total_revenue: number;
    total_paid: number;
    percentage: number;
}

interface PaymentStatusItem {
    status: string;
    label: string;
    count: number;
    total_amount: number;
    paid_amount: number;
    unpaid_amount: number;
    percentage: number;
}

interface ProjectStatusItem {
    status: string;
    label: string;
    count: number;
    total_amount: number;
    percentage: number;
}

interface ReferralItem {
    source_id?: string;
    source_name: string;
    source_type?: string;
    source_type_label?: string;
    source_avatar?: string;
    client_count: number;
    project_count: number;
    total_revenue: number;
    total_paid: number;
    percentage: number;
}

interface TeamMember {
    id: string | number;
    name: string;
    role: string;
    avatar?: string;
    photo_count: number;
    photo_completed_count: number;
    edit_count: number;
    edit_completed_count: number;
    total_assigned: number;
    total_completed: number;
    completion_rate: number;
    photo_revenue: number;
}

interface TopProject {
    id: string;
    project_number: string;
    name: string;
    client_name: string;
    client_city: string;
    category_name: string;
    category_color: string;
    package_name: string;
    event_date: string;
    status: string;
    payment_status: string;
    total_amount: number;
    paid_amount: number;
}

interface ReportIndexProps {
    year: number;
    available_years?: number[];
    summary: {
        revenue: number;
        total_contract_value: number;
        total_paid: number;
        total_outstanding: number;
        projects: number;
        completed: number;
        in_progress: number;
        draft: number;
        cancelled: number;
        new_clients: number;
        completion_rate: number;
        avg_project_value: number;
        avg_monthly_revenue: number;
        revenue_growth?: number;
        projects_growth?: number;
        clients_growth?: number;
        completion_rate_growth?: number;
    };
    insights?: {
        highest_month?: { name: string; revenue: number };
        peak_projects_month?: { name: string; count: number };
        top_category?: { name: string; count: number; revenue: number };
        top_package?: { name: string; count: number; revenue: number };
        top_source?: { name: string; revenue: number; count: number };
        completion_rate?: number;
    };
    monthly_revenue: MonthlyRevenue[];
    categories_report: CategoryItem[];
    packages_report?: PackageItem[];
    wedding_organizers_report?: WOItem[];
    payment_status_breakdown?: PaymentStatusItem[];
    project_status_breakdown?: ProjectStatusItem[];
    team_report: TeamMember[];
    referrals_report?: ReferralItem[];
    top_projects?: TopProject[];
    last_updated?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getCategoryIcon(name: string, className = 'w-3.5 h-3.5') {
    const lower = name.toLowerCase();

    if (lower.includes('wedding')) {
        return <HeartHandshake className={`${className} text-emerald-600`} />;
    }

    if (lower.includes('prewed') || lower.includes('engagement')) {
        return <Sparkles className={`${className} text-purple-600`} />;
    }

    if (lower.includes('event')) {
        return <Video className={`${className} text-blue-600`} />;
    }

    if (lower.includes('corp')) {
        return <Building2 className={`${className} text-indigo-600`} />;
    }

    if (lower.includes('mater')) {
        return <Smile className={`${className} text-pink-600`} />;
    }

    if (lower.includes('newborn')) {
        return <Smile className={`${className} text-amber-600`} />;
    }

    if (lower.includes('birth')) {
        return <Sparkles className={`${className} text-rose-600`} />;
    }

    if (lower.includes('produk') || lower.includes('brand') || lower.includes('commercial')) {
        return <Palette className={`${className} text-teal-600`} />;
    }

    if (lower.includes('family') || lower.includes('keluarga')) {
        return <Users2 className={`${className} text-cyan-600`} />;
    }

    if (lower.includes('perorangan') || lower.includes('personal')) {
        return <Camera className={`${className} text-violet-600`} />;
    }

    if (lower.includes('traveling') || lower.includes('travel')) {
        return <MapPin className={`${className} text-orange-600`} />;
    }

    if (lower.includes('komunitas')) {
        return <Users className={`${className} text-green-600`} />;
    }

    return <Camera className={`${className} text-slate-600`} />;
}


function getPaymentBadge(status: string) {
    const map: Record<string, { label: string; cls: string }> = {
        paid: { label: 'Lunas', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        partial: { label: 'Sebagian', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
        unpaid: { label: 'Belum Bayar', cls: 'bg-red-50 text-red-600 border-red-200' },
        overdue: { label: 'Jatuh Tempo', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
        refunded: { label: 'Refund', cls: 'bg-slate-50 text-slate-600 border-slate-200' },
    };
    const m = map[status] ?? { label: status, cls: 'bg-slate-50 text-slate-600 border-slate-200' };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${m.cls}`}>
            {m.label}
        </span>
    );
}

// ─── CSV Exporter (Client-Side Instant) ────────────────────────────────────────
function downloadCSV(rows: (string | number)[][], filename: string) {
    const BOM = '\uFEFF';
    const content = BOM + rows.map(r =>
        r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ─── Section Header with Export Buttons ───────────────────────────────────────
function SectionHeader({
    title,
    subtitle,
    badge,
    onExportCsv,
    onPrint,
    children,
}: {
    title: string;
    subtitle?: string;
    badge?: string;
    onExportCsv?: () => void;
    onPrint?: () => void;
    children?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5 mb-0">
            <div>
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900">{title}</h3>
                    {badge && (
                        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-xl border border-slate-200">
                            {badge}
                        </span>
                    )}
                </div>
                {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
                {children}
                {onExportCsv && (
                    <button
                        type="button"
                        onClick={onExportCsv}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                        <FileDown className="w-3 h-3" />
                        CSV
                    </button>
                )}
                {onPrint && (
                    <button
                        type="button"
                        onClick={onPrint}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <Printer className="w-3 h-3" />
                        Print
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Revenue Area Chart ────────────────────────────────────────────────────────
function RevenueAreaChart({ data }: { data: MonthlyRevenue[] }) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const maxVal = Math.max(...data.map(d => d.revenue), 50000000);
    const yMax = Math.ceil(maxVal / 50000000) * 50000000;
    const ySteps = [yMax, yMax * 0.75, yMax * 0.5, yMax * 0.25, 0];

    const W = 900, H = 260, pL = 70, pR = 30, pT = 30, pB = 40;
    const plotW = W - pL - pR;
    const plotH = H - pT - pB;

    const pts = data.map((d, i) => ({
        x: pL + (i / (data.length - 1)) * plotW,
        y: pT + (1 - d.revenue / yMax) * plotH,
        ...d,
    }));

    const smooth = (ps: { x: number; y: number }[]) => {
        if (ps.length === 0) {
            return '';
        }

        let p = `M ${ps[0].x} ${ps[0].y}`;

        for (let i = 0; i < ps.length - 1; i++) {
            const p0 = ps[i === 0 ? 0 : i - 1];
            const p1 = ps[i];
            const p2 = ps[i + 1];
            const p3 = ps[i + 2] ?? p2;
            const cx1 = p1.x + (p2.x - p0.x) / 6;
            const cy1 = p1.y + (p2.y - p0.y) / 6;
            const cx2 = p2.x - (p3.x - p1.x) / 6;
            const cy2 = p2.y - (p3.y - p1.y) / 6;
            p += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${p2.y}`;
        }

        return p;
    };

    const linePath = smooth(pts);
    const areaPath = pts.length > 0
        ? `${linePath} L ${pts[pts.length - 1].x} ${pT + plotH} L ${pts[0].x} ${pT + plotH} Z`
        : '';

    return (
        <div className="relative w-full overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-w-[600px] select-none" style={{ overflow: 'visible' }}>
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.20" />
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.00" />
                    </linearGradient>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="50%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#A855F7" />
                    </linearGradient>
                    <filter id="glow">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7C3AED" floodOpacity="0.3" />
                    </filter>
                </defs>

                {ySteps.map((val, idx) => {
                    const y = pT + (idx / (ySteps.length - 1)) * plotH;

                    return (
                        <g key={idx} className="pointer-events-none">
                            <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="#F1F5F9" strokeDasharray={idx === ySteps.length - 1 ? 'none' : '4 4'} strokeWidth="1" />
                            <text x={pL - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94A3B8" fontFamily="monospace">
                                {val === 0 ? '0' : formatRupiahCompact(val)}
                            </text>
                        </g>
                    );
                })}

                {areaPath && <path d={areaPath} fill="url(#areaGrad)" className="pointer-events-none" />}
                {linePath && (
                    <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow)" className="pointer-events-none" />
                )}

                {pts.map((pt, i) => {
                    const isH = hoveredIdx === i;

                    return (
                        <g key={i}>
                            {isH && (
                                <line x1={pt.x} y1={pT} x2={pt.x} y2={pT + plotH} stroke="#7C3AED" strokeDasharray="3 3" strokeWidth="1" strokeOpacity="0.4" className="pointer-events-none" />
                            )}
                            <circle cx={pt.x} cy={pt.y} r={isH ? 6 : 4} fill="#fff" stroke={isH ? '#6366F1' : '#7C3AED'} strokeWidth={isH ? 2.5 : 2} className="pointer-events-none transition-all duration-100" />
                            <circle cx={pt.x} cy={pt.y} r={isH ? 2.5 : 1.5} fill={isH ? '#6366F1' : '#7C3AED'} className="pointer-events-none transition-all duration-100" />

                            {pt.revenue > 0 && (
                                <g transform={`translate(${pt.x}, ${pt.y - (isH ? 14 : 11)})`} className="pointer-events-none">
                                    {isH && (
                                        <rect x="-36" y="-12" width="72" height="17" rx="4" fill="#1E1B4B" opacity="0.9" />
                                    )}
                                    <text x="0" y="0" textAnchor="middle" fontSize={isH ? '9.5' : '8.5'} fontFamily="monospace" fontWeight="700" fill={isH ? '#fff' : '#475569'}>
                                        {formatRupiahCompact(pt.revenue)}
                                    </text>
                                </g>
                            )}

                            {isH && pt.projects > 0 && (
                                <text x={pt.x} y={pT + plotH + 12} textAnchor="middle" fontSize="9" fill="#7C3AED" fontWeight="700" className="pointer-events-none">
                                    {pt.projects} proj
                                </text>
                            )}

                            <text x={pt.x} y={H - 8} textAnchor="middle" fontSize="10.5" fill={isH ? '#6D28D9' : '#94A3B8'} fontWeight={isH ? '700' : '500'} className="pointer-events-none transition-all duration-100">
                                {pt.month}
                            </text>

                            <rect
                                x={pt.x - plotW / (data.length * 2)}
                                y={pT}
                                width={plotW / data.length}
                                height={plotH + 30}
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

// ─── Bar Chart for Project Status ─────────────────────────────────────────────
function StatusPipelineChart({ data }: { data: ProjectStatusItem[] }) {
    const maxCount = Math.max(...data.map(d => d.count), 1);
    const colors: Record<string, string> = {
        completed: '#10B981',
        in_progress: '#3B82F6',
        confirmed: '#8B5CF6',
        draft: '#94A3B8',
        inquiry: '#94A3B8',
        cancelled: '#F87171',
    };

    return (
        <div className="space-y-2.5">
            {data.map((item) => (
                <div key={item.status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{item.label}</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900">{item.count} project</span>
                            <span className="text-slate-400">({item.percentage}%)</span>
                        </div>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${(item.count / maxCount) * 100}%`, backgroundColor: colors[item.status] ?? '#94A3B8' }}
                        />
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{formatRupiah(item.total_amount)}</div>
                </div>
            ))}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReportIndex({
    year,
    available_years = [new Date().getFullYear()],
    summary = { revenue: 0, total_contract_value: 0, total_paid: 0, total_outstanding: 0, projects: 0, completed: 0, in_progress: 0, draft: 0, cancelled: 0, new_clients: 0, completion_rate: 0, avg_project_value: 0, avg_monthly_revenue: 0 },
    insights = {},
    monthly_revenue = [],
    categories_report = [],
    packages_report = [],
    wedding_organizers_report = [],
    payment_status_breakdown = [],
    project_status_breakdown = [],
    team_report = [],
    referrals_report = [],
    top_projects = [],
    last_updated,
}: ReportIndexProps) {
    const currentYear = new Date().getFullYear();
    const resolvedYear = year ?? currentYear;
    const [selectedYear, setSelectedYear] = useState<number>(resolvedYear);
    const [isYearOpen, setIsYearOpen] = useState(false);
    const [rightTab, setRightTab] = useState<'packages' | 'sources' | 'payment'>('packages');

    const handleYearChange = (y: number) => {
        setSelectedYear(y);
        setIsYearOpen(false);
        router.get('/reports', { year: y }, { preserveState: false });
    };

    const completionRate = summary.completion_rate ?? 0;
    const revGrowthPositive = (summary.revenue_growth ?? 0) >= 0;
    const projGrowthPositive = (summary.projects_growth ?? 0) >= 0;
    const clientGrowthPositive = (summary.clients_growth ?? 0) >= 0;


    // Export helpers
    const exportCategories = useCallback(() => {
        const rows: (string | number)[][] = [
            ['No', 'Kategori', 'Jumlah Project', 'Total Nilai (IDR)', 'Total Terbayar (IDR)', 'Kontribusi (%)'],
            ...categories_report.map((c, i) => [i + 1, c.name, c.projects_count, c.projects_sum_total_amount, c.projects_sum_paid_amount, c.percentage]),
        ];
        downloadCSV(rows, `kategori-layanan-${year}.csv`);
    }, [categories_report, year]);

    const exportPackages = useCallback(() => {
        const rows: (string | number)[][] = [
            ['No', 'Paket', 'Kategori', 'Booking', 'Revenue (IDR)', 'Avg Deal (IDR)', 'Kontribusi (%)'],
            ...(packages_report ?? []).map((p, i) => [i + 1, p.name, p.category_name, p.projects_count, p.total_revenue, p.avg_deal, p.percentage]),
        ];
        downloadCSV(rows, `paket-layanan-${year}.csv`);
    }, [packages_report, year]);

    const exportSources = useCallback(() => {
        const rows: (string | number)[][] = [
            ['No', 'Sumber Klien', 'Tipe', 'Booking (Project)', 'Klien Terdaftar', 'Revenue (IDR)', 'Kontribusi (%)'],
            ...(referrals_report ?? []).map((s, i) => [i + 1, s.source_name, s.source_type_label ?? s.source_type ?? '-', s.project_count, s.client_count, s.total_revenue, s.percentage]),
        ];
        downloadCSV(rows, `sumber-klien-${year}.csv`);
    }, [referrals_report, year]);

    const exportPayStatus = useCallback(() => {
        const rows: (string | number)[][] = [
            ['Status', 'Jumlah Project', 'Total Kontrak (IDR)', 'Terbayar (IDR)', 'Sisa (IDR)', 'Kontribusi (%)'],
            ...(payment_status_breakdown ?? []).map(p => [p.label, p.count, p.total_amount, p.paid_amount, p.unpaid_amount, p.percentage]),
        ];
        downloadCSV(rows, `status-pembayaran-${year}.csv`);
    }, [payment_status_breakdown, year]);

    const exportReferrals = useCallback(() => {
        const rows: (string | number)[][] = [
            ['No', 'Sumber', 'Klien', 'Project', 'Revenue (IDR)', 'Terbayar (IDR)', '%'],
            ...(referrals_report ?? []).map((r, i) => [i + 1, r.source_name, r.client_count, r.project_count, r.total_revenue, r.total_paid, r.percentage]),
        ];
        downloadCSV(rows, `referral-${year}.csv`);
    }, [referrals_report, year]);

    const exportTeam = useCallback(() => {
        const rows: (string | number)[][] = [
            ['No', 'Nama', 'Jabatan', 'Foto', 'Foto Selesai', 'Edit', 'Edit Selesai', 'Total', 'Completion (%)'],
            ...team_report.map((m, i) => [i + 1, m.name, m.role, m.photo_count, m.photo_completed_count, m.edit_count, m.edit_completed_count, m.total_assigned, m.completion_rate]),
        ];
        downloadCSV(rows, `tim-studio-${year}.csv`);
    }, [team_report, year]);

    const exportTopProjects = useCallback(() => {
        const rows: (string | number)[][] = [
            ['No', 'No Project', 'Klien', 'Kategori', 'Paket', 'Tgl Event', 'Status', 'Bayar', 'Total (IDR)', 'Terbayar (IDR)'],
            ...(top_projects ?? []).map((p, i) => [i + 1, p.project_number, p.client_name, p.category_name, p.package_name, p.event_date, p.status, p.payment_status, p.total_amount, p.paid_amount]),
        ];
        downloadCSV(rows, `top-project-${year}.csv`);
    }, [top_projects, year]);

    const exportAll = useCallback(() => {
        window.location.href = `/reports/export?year=${year}&type=all`;
    }, [year]);

    return (
        <div className="w-full max-w-full space-y-4 pb-2">
            <Head title={`Laporan & Analitik Studio ${year} - Arams Pictures`} />

            {/* ── HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center border border-purple-100/60 shadow-sm">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--app-heading-color)' }}>
                            Laporan &amp; Analitik Studio
                        </h1>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--app-muted-color)' }}>
                            Data real-time — Tahun {year}
                            {last_updated && <span className="ml-2 text-xs opacity-70">· Diperbarui: {last_updated}</span>}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Year Selector */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsYearOpen(!isYearOpen)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                        >
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Tahun {selectedYear}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                        {isYearOpen && (
                            <div className="absolute right-0 top-11 z-30 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1 overflow-hidden">
                                {(available_years).map((yr) => (
                                    <button
                                        key={yr}
                                        type="button"
                                        onClick={() => handleYearChange(yr)}
                                        className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-purple-50 transition-colors cursor-pointer flex items-center justify-between ${selectedYear === yr ? 'text-purple-600 bg-purple-50/60 font-bold' : 'text-slate-700'}`}
                                    >
                                        <span>Tahun {yr}</span>
                                        {selectedYear === yr && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Export CSV All */}
                    <button
                        type="button"
                        onClick={exportAll}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                        <FileDown className="w-4 h-4" />
                        <span className="hidden sm:block">Export CSV</span>
                    </button>

                    {/* Print / PDF */}
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                        <Printer className="w-4 h-4" />
                        <span className="hidden sm:block">Cetak / PDF</span>
                    </button>
                </div>
            </div>

            {/* ── EXECUTIVE KPI CARDS ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* 1. Kas Masuk */}
                <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-violet-600 to-purple-700 p-5 rounded-2xl text-white shadow-lg flex flex-col justify-between min-h-[120px]">
                    <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-white" />
                        </div>
                        <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${revGrowthPositive ? 'bg-white/20 text-white' : 'bg-red-400/30 text-red-100'}`}>
                            {revGrowthPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(summary.revenue_growth ?? 0)}%
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-purple-200 uppercase tracking-wider">Kas Masuk (Lunas)</p>
                        <h3 className="text-lg font-extrabold font-mono leading-tight mt-0.5">{formatRupiahCompact(summary.revenue)}</h3>
                        <p className="text-[10px] text-purple-200 mt-0.5">dari tahun {year - 1}</p>
                    </div>
                </div>

                {/* 2. Nilai Kontrak */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between min-h-[110px]">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                        <ReceiptText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nilai Kontrak</p>
                        <h3 className="text-base font-extrabold text-slate-900 font-mono leading-tight mt-0.5">{formatRupiahCompact(summary.total_contract_value)}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Total {summary.projects} project</p>
                    </div>
                </div>

                {/* 3. Total Project */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between min-h-[110px]">
                    <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                            <Layers className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className={`text-[10px] font-bold ${projGrowthPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                            {projGrowthPositive ? '+' : ''}{summary.projects_growth ?? 0}
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Project</p>
                        <h3 className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">{summary.projects}</h3>
                        <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{summary.completed} Selesai · {summary.in_progress} Berjalan</p>
                    </div>
                </div>

                {/* 4. Klien Baru */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between min-h-[110px]">
                    <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                            <Users className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className={`text-[10px] font-bold ${clientGrowthPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                            {clientGrowthPositive ? '+' : ''}{summary.clients_growth ?? 0}
                        </span>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Klien Baru</p>
                        <h3 className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">{summary.new_clients}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">dari tahun {year - 1}</p>
                    </div>
                </div>

                {/* 5. Piutang */}
                <div className="bg-white p-4 rounded-2xl border border-amber-200/60 shadow-sm flex flex-col justify-between min-h-[110px] bg-amber-50/30">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-200">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Piutang Outstanding</p>
                        <h3 className="text-base font-extrabold text-slate-900 font-mono leading-tight mt-0.5">{formatRupiahCompact(summary.total_outstanding)}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Belum tertagih</p>
                    </div>
                </div>
            </div>

            {/* ── GRAFIK PENDAPATAN BULANAN ── */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 print-section">
                <SectionHeader
                    title={`Tren Pendapatan Bulanan (${year})`}
                    subtitle="Kas masuk terkonfirmasi per bulan dalam Rupiah (IDR)"
                    badge={`Avg: ${formatRupiahCompact(summary.avg_monthly_revenue ?? 0)}/bln`}
                    onPrint={() => window.print()}
                    onExportCsv={() => {
                        const rows: (string | number)[][] = [
                            ['Bulan', 'Pendapatan (IDR)', 'Jumlah Project', 'Selesai'],
                            ...monthly_revenue.map(m => [m.month, m.revenue, m.projects, m.completed]),
                        ];
                        downloadCSV(rows, `tren-pendapatan-${year}.csv`);
                    }}
                />
                <div className="pt-2">
                    <RevenueAreaChart data={monthly_revenue} />
                </div>

                {/* Monthly Stats Row */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1 border-t border-slate-100">
                    {monthly_revenue.map((m) => (
                        <div key={m.month} className={`text-center py-2 px-1 rounded-xl transition-colors ${m.revenue > 0 ? 'bg-purple-50/60' : 'bg-slate-50/60'}`}>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{m.month}</p>
                            <p className="text-[10px] font-extrabold text-slate-900 font-mono">{m.revenue > 0 ? formatRupiahCompact(m.revenue) : '-'}</p>
                            <p className="text-[9px] text-slate-400">{m.projects} proj</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── 2-COLUMN SPLIT: KATEGORI + COMPANION ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* LEFT — Performa per Kategori Layanan */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col print-section">
                    <div className="p-5 space-y-4 flex-1">
                        <SectionHeader
                            title="Performa per Kategori Layanan"
                            subtitle="Kontribusi nilai project berdasarkan kategori foto"
                            badge={`${categories_report.filter(c => c.projects_count > 0).length} Aktif`}
                            onExportCsv={exportCategories}
                            onPrint={() => window.print()}
                        />

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-4">#</TableHead>
                                        <TableHead>KATEGORI</TableHead>
                                        <TableHead className="text-center">PROJECT</TableHead>
                                        <TableHead className="text-right px-4">NILAI</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories_report.filter(c => c.projects_count > 0).length > 0 ? (
                                        categories_report.filter(c => c.projects_count > 0).map((cat, idx) => (
                                            <TableRow key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                                                <TableCell className="px-4 text-xs font-bold text-slate-400 font-mono w-8">{idx + 1}</TableCell>
                                                <TableCell className="font-semibold text-slate-800">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200/60" style={{ borderColor: cat.color ? `${cat.color}40` : undefined, backgroundColor: cat.color ? `${cat.color}10` : undefined }}>
                                                            {getCategoryIcon(cat.name)}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold">{cat.name}</p>
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <div className="h-1 rounded-full" style={{ width: `${Math.max(cat.percentage, 2)}px`, maxWidth: '80px', backgroundColor: cat.color ?? '#7C3AED' }} />
                                                                <span className="text-[9px] text-slate-400">{cat.percentage}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="text-xs font-mono font-semibold text-slate-700">{cat.projects_count}</span>
                                                </TableCell>
                                                <TableCell className="text-right px-4">
                                                    <p className="text-xs font-mono font-bold text-slate-900">{formatRupiah(cat.projects_sum_total_amount)}</p>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableEmpty colSpan={4} message="Belum ada data kategori untuk tahun ini." />
                                    )}
                                </TableBody>
                                {(categories_report ?? []).length > 0 && (
                                    <tfoot>
                                        <tr className="bg-slate-50/90 font-bold border-t border-slate-200/80">
                                            <TableCell colSpan={2} className="px-4 py-2.5 text-[11px] text-slate-700 font-bold uppercase tracking-wider">Total Kategori</TableCell>
                                            <TableCell className="py-2.5 text-center font-mono text-xs text-slate-900 font-extrabold">
                                                {(categories_report ?? []).reduce((sum, c) => sum + (c.projects_count ?? 0), 0)}
                                            </TableCell>
                                            <TableCell className="px-4 py-2.5 text-right font-mono text-xs text-slate-900 font-black">
                                                {formatRupiah((categories_report ?? []).reduce((sum, c) => sum + (c.projects_sum_total_amount ?? 0), 0))}
                                            </TableCell>
                                        </tr>
                                    </tfoot>
                                )}
                            </Table>
                        </div>
                    </div>
                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 text-center">
                        <Link href="/master-data/categories" className="text-xs font-bold text-slate-600 hover:text-purple-600 inline-flex items-center gap-1 transition-colors">
                            Kelola Kategori <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

                {/* RIGHT — Companion with 3-Tab Options */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col print-section">
                    <div className="p-5 space-y-4 flex-1">
                        {/* Tab Header */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        {rightTab === 'packages' && 'Performa Paket Layanan'}
                                        {rightTab === 'sources' && 'Performa Sumber Klien'}
                                        {rightTab === 'payment' && 'Status Pembayaran & Piutang'}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {rightTab === 'packages' && 'Paket terpopuler berdasarkan booking & revenue'}
                                        {rightTab === 'sources' && 'Kontribusi sumber lead & referral berdasarkan booking & nilai project'}
                                        {rightTab === 'payment' && 'Distribusi status pembayaran seluruh project'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {rightTab === 'packages' && <button type="button" onClick={exportPackages} className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"><FileDown className="w-3 h-3" />CSV</button>}
                                    {rightTab === 'sources' && <button type="button" onClick={exportSources} className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"><FileDown className="w-3 h-3" />CSV</button>}
                                    {rightTab === 'payment' && <button type="button" onClick={exportPayStatus} className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"><FileDown className="w-3 h-3" />CSV</button>}
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                                {[
                                    { key: 'packages' as const, label: 'Paket', icon: Package },
                                    { key: 'sources' as const, label: 'Sumber Klien', icon: Users },
                                    { key: 'payment' as const, label: 'Pembayaran', icon: CreditCard },
                                ].map(({ key, label, icon: Icon }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setRightTab(key)}
                                        className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${rightTab === key ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        {rightTab === 'packages' && (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="px-4">#</TableHead>
                                            <TableHead>PAKET</TableHead>
                                            <TableHead className="text-center">BOOKING</TableHead>
                                            <TableHead className="text-right px-4">REVENUE</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(packages_report ?? []).length > 0 ? (
                                            (packages_report ?? []).map((pkg, idx) => (
                                                <TableRow key={pkg.id} className="hover:bg-slate-50/60 transition-colors">
                                                    <TableCell className="px-4 text-xs font-bold text-slate-400 font-mono w-8">{idx + 1}</TableCell>
                                                    <TableCell>
                                                        <p className="text-xs font-bold text-slate-900">{pkg.name}</p>
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pkg.category_color }} />
                                                            <span className="text-[10px] text-slate-400">{pkg.category_name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="text-xs font-mono font-semibold text-slate-700">{pkg.projects_count}x</span>
                                                    </TableCell>
                                                    <TableCell className="text-right px-4">
                                                        <p className="text-xs font-mono font-bold text-slate-900">{formatRupiahCompact(pkg.total_revenue)}</p>
                                                        <p className="text-[10px] text-slate-400">avg {formatRupiahCompact(pkg.avg_deal)}</p>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableEmpty colSpan={4} message="Belum ada data paket untuk tahun ini." />
                                        )}
                                    </TableBody>
                                    {(packages_report ?? []).length > 0 && (
                                        <tfoot>
                                            <tr className="bg-slate-50/90 font-bold border-t border-slate-200/80">
                                                <TableCell colSpan={2} className="px-4 py-2.5 text-[11px] text-slate-700 font-bold uppercase tracking-wider">Total Paket</TableCell>
                                                <TableCell className="py-2.5 text-center font-mono text-xs text-slate-900 font-extrabold">
                                                    {(packages_report ?? []).reduce((sum, p) => sum + (p.projects_count ?? 0), 0)}x
                                                </TableCell>
                                                <TableCell className="px-4 py-2.5 text-right font-mono text-xs text-slate-900 font-black">
                                                    {formatRupiahCompact((packages_report ?? []).reduce((sum, p) => sum + (p.total_revenue ?? 0), 0))}
                                                </TableCell>
                                            </tr>
                                        </tfoot>
                                    )}
                                </Table>
                            </div>
                        )}

                        {rightTab === 'sources' && (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="px-4">#</TableHead>
                                            <TableHead>SUMBER KLIEN</TableHead>
                                            <TableHead className="text-center">BOOKING</TableHead>
                                            <TableHead className="text-right px-4">REVENUE</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(referrals_report ?? []).length > 0 ? (
                                            (referrals_report ?? []).map((source, idx) => (
                                                <TableRow key={source.source_id ?? idx} className="hover:bg-slate-50/60 transition-colors">
                                                    <TableCell className="px-4 text-xs font-bold text-slate-400 font-mono w-8">{idx + 1}</TableCell>
                                                    <TableCell>
                                                        {source.source_id ? (
                                                            <Link
                                                                href={`/client-sources/${source.source_id}`}
                                                                className="text-xs font-bold text-slate-900 hover:text-purple-600 transition-colors"
                                                                title="Lihat riwayat referral detail di master sumber klien"
                                                            >
                                                                {source.source_name}
                                                            </Link>
                                                        ) : (
                                                            <p className="text-xs font-bold text-slate-900">{source.source_name}</p>
                                                        )}
                                                        <p className="text-[10px] text-slate-400">
                                                            {source.source_type_label ?? source.source_type ?? 'Sumber Klien'} • {source.client_count} klien
                                                        </p>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">{source.project_count}x</span>
                                                    </TableCell>
                                                    <TableCell className="text-right px-4">
                                                        <p className="text-xs font-mono font-bold text-slate-900">{formatRupiahCompact(source.total_revenue)}</p>
                                                        <p className="text-[10px] text-slate-400">{source.percentage}% share</p>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableEmpty colSpan={4} message="Belum ada data sumber klien untuk tahun ini." />
                                        )}
                                    </TableBody>
                                    {(referrals_report ?? []).length > 0 && (
                                        <tfoot>
                                            <tr className="bg-slate-50/90 font-bold border-t border-slate-200/80">
                                                <TableCell colSpan={2} className="px-4 py-2.5 text-[11px] text-slate-700 font-bold uppercase tracking-wider">Total Sumber Klien</TableCell>
                                                <TableCell className="py-2.5 text-center font-mono text-xs text-slate-900 font-extrabold">
                                                    {(referrals_report ?? []).reduce((sum, s) => sum + (s.project_count ?? 0), 0)}x
                                                </TableCell>
                                                <TableCell className="px-4 py-2.5 text-right font-mono text-xs text-slate-900 font-black">
                                                    {formatRupiahCompact((referrals_report ?? []).reduce((sum, s) => sum + (s.total_revenue ?? 0), 0))}
                                                </TableCell>
                                            </tr>
                                        </tfoot>
                                    )}
                                </Table>
                            </div>
                        )}

                        {rightTab === 'payment' && (
                            <div className="space-y-3">
                                {(payment_status_breakdown ?? []).length > 0 ? (
                                    <>
                                        {(payment_status_breakdown ?? []).map((ps) => {
                                            const colorMap: Record<string, string> = {
                                                paid: '#10B981',
                                                partial: '#F59E0B',
                                                unpaid: '#EF4444',
                                                overdue: '#F97316',
                                                refunded: '#94A3B8',
                                            };
                                            const color = colorMap[ps.status] ?? '#94A3B8';

                                            return (
                                                <div key={ps.status} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                                            <span className="text-xs font-bold text-slate-800">{ps.label}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xs font-mono font-bold text-slate-900">{ps.count} project</span>
                                                            <span className="text-[10px] text-slate-400 ml-1.5">({ps.percentage}%)</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${ps.percentage}%`, backgroundColor: color }} />
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                                                        <span>Kontrak: <strong className="font-mono text-slate-700">{formatRupiahCompact(ps.total_amount)}</strong></span>
                                                        {ps.unpaid_amount > 0 && (
                                                            <span className="text-amber-600 font-semibold">Sisa: {formatRupiahCompact(ps.unpaid_amount)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                                <span className="text-xs font-bold text-amber-800">Total Piutang Outstanding</span>
                                            </div>
                                            <span className="text-sm font-extrabold text-amber-800 font-mono">{formatRupiahCompact(summary.total_outstanding)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-8 text-center text-slate-400 text-sm">Belum ada data pembayaran untuk tahun ini.</div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 text-center">
                        <Link href="/finance" className="text-xs font-bold text-slate-600 hover:text-purple-600 inline-flex items-center gap-1 transition-colors">
                            Kelola Keuangan <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── SUMBER LEAD & REFERRAL ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden print-section">
                <div className="p-5 space-y-4">
                    <SectionHeader
                        title={`Rekapitulasi Sumber Lead & Referral Klien (${resolvedYear})`}
                        subtitle="Saluran akuisisi klien berdasarkan master data Client Sources"
                        badge={`${(referrals_report ?? []).length} Sumber`}
                        onExportCsv={exportReferrals}
                        onPrint={() => window.print()}
                    />
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-5">#</TableHead>
                                    <TableHead>SUMBER / REFERRAL</TableHead>
                                    <TableHead className="hidden sm:table-cell">TIPE</TableHead>
                                    <TableHead className="text-center">KLIEN</TableHead>
                                    <TableHead className="text-center">PROJECT</TableHead>
                                    <TableHead className="text-right">TOTAL NILAI</TableHead>
                                    <TableHead className="text-right px-5">KONTRIBUSI</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(referrals_report ?? []).length > 0 ? (
                                    (referrals_report ?? []).map((ref, idx) => {
                                        const typeColorMap: Record<string, string> = {
                                            social_media: 'bg-blue-50 text-blue-700 border-blue-200',
                                            wedding_organizer: 'bg-purple-50 text-purple-700 border-purple-200',
                                            individual: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                            vendor: 'bg-orange-50 text-orange-700 border-orange-200',
                                            ads: 'bg-pink-50 text-pink-700 border-pink-200',
                                            other: 'bg-slate-50 text-slate-600 border-slate-200',
                                        };
                                        const typeCls = typeColorMap[ref.source_type ?? 'other'] ?? typeColorMap.other;

                                        return (
                                            <TableRow key={ref.source_id ?? idx} className="hover:bg-slate-50/60 transition-colors">
                                                <TableCell className="px-5">
                                                    <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-[10px] border border-amber-200/60 font-mono">{idx + 1}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2.5">
                                                        {ref.source_avatar ? (
                                                            <img src={ref.source_avatar} alt={ref.source_name} className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0" />
                                                        ) : (
                                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                                                {ref.source_name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            {ref.source_id ? (
                                                                <Link
                                                                    href={`/client-sources/${ref.source_id}`}
                                                                    className="text-xs font-bold text-slate-900 hover:text-purple-600 transition-colors"
                                                                    title="Buka riwayat referral detail"
                                                                >
                                                                    {ref.source_name}
                                                                </Link>
                                                            ) : (
                                                                <p className="text-xs font-bold text-slate-900">{ref.source_name}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full border ${typeCls}`}>
                                                        {ref.source_type_label ?? ref.source_type ?? '-'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">{ref.client_count} klien</span>
                                                </TableCell>
                                                <TableCell className="text-center text-xs font-mono font-semibold text-slate-700">{ref.project_count}</TableCell>
                                                <TableCell className="text-right text-xs font-mono font-bold text-slate-900">{formatRupiah(ref.total_revenue)}</TableCell>
                                                <TableCell className="text-right px-5">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${ref.percentage}%` }} />
                                                        </div>
                                                        <span className="text-[10px] font-mono font-bold text-slate-600 min-w-[35px] text-right">{ref.percentage}%</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableEmpty colSpan={7} message="Belum ada data sumber referral yang tercatat." />
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 text-center">
                    <Link href="/client-sources" className="text-xs font-bold text-slate-600 hover:text-purple-600 inline-flex items-center gap-1 transition-colors">
                        Kelola Master Sumber Klien <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>



            {/* ── 2-COLUMN: PIPELINE STATUS + TIM STUDIO ── */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 print-section">
                    <SectionHeader
                        title={`Pipeline & Status Workflow Project (${resolvedYear})`}
                        subtitle="Distribusi project berdasarkan tahap pengerjaan"
                        onExportCsv={() => {
                            const rows: (string | number)[][] = [
                                ['Status', 'Jumlah', 'Total Nilai (IDR)', '%'],
                                ...(project_status_breakdown ?? []).map(s => [s.label, s.count, s.total_amount, s.percentage]),
                            ];
                            downloadCSV(rows, `pipeline-${resolvedYear}.csv`);
                        }}
                    />
                    {(project_status_breakdown ?? []).length > 0 ? (
                        <StatusPipelineChart data={project_status_breakdown ?? []} />
                    ) : (
                        <div className="py-8 text-center text-slate-400 text-sm">Belum ada data project untuk tahun ini.</div>
                    )}

                    <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                        {[
                            { label: 'Selesai', value: summary.completed, icon: BadgeCheck, color: 'text-emerald-600' },
                            { label: 'Berjalan', value: summary.in_progress, icon: Timer, color: 'text-blue-600' },
                            { label: 'Dibatalkan', value: summary.cancelled, icon: XCircle, color: 'text-red-500' },
                        ].map(({ label, value, icon: Icon, color }) => (
                            <div key={label} className="text-center p-2 rounded-xl bg-slate-50">
                                <Icon className={`w-4 h-4 mx-auto mb-0.5 ${color}`} />
                                <p className="text-lg font-extrabold text-slate-900">{value}</p>
                                <p className="text-[10px] text-slate-500">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 print-section">
                    <SectionHeader
                        title={`Produktivitas Tim Studio (${resolvedYear})`}
                        subtitle="Assignment & completion rate fotografer dan editor"
                        badge={`${team_report.length} Anggota`}
                        onExportCsv={exportTeam}
                    />
                    {team_report.length > 0 ? (
                        <div className="space-y-2.5 overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-4">ANGGOTA</TableHead>
                                        <TableHead className="text-center">FOTO</TableHead>
                                        <TableHead className="text-center">EDIT</TableHead>
                                        <TableHead className="text-right px-4">RATE</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {team_report.map((member) => (
                                        <TableRow key={member.id} className="hover:bg-slate-50/60 transition-colors">
                                            <TableCell className="px-4">
                                                <div className="flex items-center gap-2.5">
                                                    {member.avatar ? (
                                                        <img src={member.avatar} alt={member.name} className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm shrink-0" />
                                                    ) : (
                                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                                            {member.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900">{member.name}</p>
                                                        <p className="text-[10px] text-slate-400">{member.role}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-xs font-mono font-semibold text-slate-700">{member.photo_count}</span>
                                                <span className="text-[10px] text-emerald-600 ml-1">✓{member.photo_completed_count}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-xs font-mono font-semibold text-slate-700">{member.edit_count}</span>
                                                <span className="text-[10px] text-emerald-600 ml-1">✓{member.edit_completed_count}</span>
                                            </TableCell>
                                            <TableCell className="text-right px-4">
                                                <span className={`text-xs font-bold font-mono ${member.completion_rate >= 80 ? 'text-emerald-600' : member.completion_rate >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                                                    {member.completion_rate}%
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-slate-400 text-sm">Belum ada data tim aktif.</div>
                    )}
                </div>
            </div> */}


            {/* ── TOP HIGH-VALUE PROJECTS LEDGER ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden print-section">
                <div className="p-5 space-y-4">
                    <SectionHeader
                        title={`Daftar Project Terbesar Tahun ${year}`}
                        subtitle="10 project dengan nilai kontrak tertinggi"
                        badge={`Top ${Math.min((top_projects ?? []).length, 10)}`}
                        onExportCsv={exportTopProjects}
                        onPrint={() => window.print()}
                    />
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-5">#</TableHead>
                                    <TableHead>PROJECT</TableHead>
                                    <TableHead className="hidden md:table-cell">KATEGORI & PAKET</TableHead>
                                    <TableHead className="hidden sm:table-cell text-center">STATUS BAYAR</TableHead>
                                    <TableHead className="text-right">KONTRAK</TableHead>
                                    <TableHead className="text-right px-5">TERBAYAR</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(top_projects ?? []).length > 0 ? (
                                    (top_projects ?? []).map((proj, idx) => (
                                        <TableRow key={proj.id} className="hover:bg-slate-50/60 transition-colors">
                                            <TableCell className="px-5 text-xs font-mono font-bold text-slate-400">{idx + 1}</TableCell>
                                            <TableCell>
                                                <Link href={`/projects/${proj.id}`} className="hover:text-purple-600 transition-colors">
                                                    <p className="text-xs font-bold text-slate-900">{proj.name}</p>
                                                    <p className="text-[10px] text-slate-400">{proj.client_name} · {proj.event_date}</p>
                                                </Link>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: proj.category_color }} />
                                                    <div>
                                                        <p className="text-[10px] font-semibold text-slate-700">{proj.category_name}</p>
                                                        <p className="text-[10px] text-slate-400">{proj.package_name}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-center">
                                                {getPaymentBadge(proj.payment_status)}
                                            </TableCell>
                                            <TableCell className="text-right text-xs font-mono font-bold text-slate-900">{formatRupiah(proj.total_amount)}</TableCell>
                                            <TableCell className="text-right px-5">
                                                <p className="text-xs font-mono font-bold text-emerald-700">{formatRupiah(proj.paid_amount)}</p>
                                                {proj.paid_amount < proj.total_amount && (
                                                    <p className="text-[10px] text-amber-600 font-semibold">Sisa: {formatRupiahCompact(proj.total_amount - proj.paid_amount)}</p>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableEmpty colSpan={6} message="Belum ada data project untuk tahun ini." />
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40 text-center">
                    <Link href="/projects" className="text-xs font-bold text-slate-600 hover:text-purple-600 inline-flex items-center gap-1 transition-colors">
                        Lihat Semua Project <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            {/* ── INSIGHT RINGKASAN ── */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 print-section">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900">Insight &amp; Ringkasan {year}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {[
                        {
                            icon: TrendingUp, color: 'emerald', label: 'Bulan Tertinggi',
                            title: insights?.highest_month?.name ?? '-',
                            value: formatRupiah(insights?.highest_month?.revenue ?? 0),
                            note: 'Pendapatan kas tertinggi',
                        },
                        {
                            icon: Award, color: 'blue', label: 'Kategori Terlaris',
                            title: insights?.top_category?.name ?? '-',
                            value: `${insights?.top_category?.count ?? 0} Project`,
                            note: `${formatRupiahCompact(insights?.top_category?.revenue ?? 0)} total`,
                        },
                        {
                            icon: Package, color: 'violet', label: 'Paket Terpopuler',
                            title: insights?.top_package?.name ?? '-',
                            value: `${insights?.top_package?.count ?? 0}x Booking`,
                            note: `${formatRupiahCompact(insights?.top_package?.revenue ?? 0)} revenue`,
                        },
                        {
                            icon: Target, color: 'amber', label: 'Sumber Terbaik',
                            title: insights?.top_source?.name ?? '-',
                            value: formatRupiahCompact(insights?.top_source?.revenue ?? 0),
                            note: `${insights?.top_source?.count ?? 0} klien`,
                        },
                        {
                            icon: Zap, color: 'purple', label: 'Kinerja Tim',
                            title: `${completionRate}% Completion`,
                            value: `${summary.completed} dari ${summary.projects}`,
                            note: `Project selesai ${year}`,
                        },
                    ].map(({ icon: Icon, color, label, title, value, note }) => (
                        <div key={label} className={`p-4 rounded-xl bg-${color}-50/50 border border-${color}-100 space-y-2`}>
                            <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg bg-${color}-100 flex items-center justify-center border border-${color}-200`}>
                                    <Icon className={`w-3.5 h-3.5 text-${color}-600`} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-extrabold text-slate-900 leading-tight">{title}</h4>
                                <p className={`text-xs font-bold text-${color}-700 font-mono mt-0.5`}>{value}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{note}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── FOOTER ── */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1 pb-1">
                <div className="flex items-center gap-1.5">
                    <Activity className="w-3 h-3" />
                    <span>Data real-time · Terakhir diperbarui: {last_updated ?? '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={exportAll} className="font-semibold hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1">
                        <FileDown className="w-3 h-3" /> Export Lengkap CSV
                    </button>
                    <span>·</span>
                    <button type="button" onClick={() => window.print()} className="font-semibold hover:text-purple-600 transition-colors cursor-pointer flex items-center gap-1">
                        <Printer className="w-3 h-3" /> Cetak PDF
                    </button>
                </div>
            </div>
        </div>
    );
}