import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Folder,
    TrendingUp,
    CheckSquare,
    Users,
    Calendar,
    ChevronDown,
    ArrowUpRight,
    UserPlus,
    FolderPlus,
    CreditCard,
    BarChart3,
    Lightbulb,
    Activity,
    Clock,
    Target,
    Database,
    HardDrive,
    Settings,
    Share2,
    Compass,
    Globe,
    Instagram,
    Building2,
    Search,
    UserCheck,
    MapPin,
    Sparkles,
    Check,
} from 'lucide-react';
import { formatRupiah, formatRupiahCompact } from '@/lib/formatters';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    Badge,
    BarChart,
    DonutChart,
} from '@/components/ui';

interface DashboardProps {
    filters?: {
        period: string;
        chart_year: number;
        category_period: string;
        performance_period: string;
        available_years: number[];
    };
    period?: string;
    kpis?: {
        total_projects: number;
        active_projects: number;
        completed_projects: number;
        total_clients: number;
    };
    financial?: {
        total_value: number;
        received: number;
        outstanding: number;
        collection_rate: number;
        monthly_chart: Array<{
            month: string;
            month_num: number;
            amount: number;
            amount_in_millions: number;
        }>;
    };
    recent_projects?: Array<{
        id: number;
        project_number: string;
        name: string;
        thumbnail: string;
        client: { id: number; name: string; email: string };
        category: { name: string; color: string };
        status: string;
        status_label: string;
        progress: number;
        event_date: string;
        deadline: string;
        deadline_text: string;
        deadline_status: string;
        total_amount: number;
        paid_amount: number;
    }>;
    category_stats?: Array<{
        id: string | number;
        name: string;
        color: string;
        count: number;
        percentage: number;
    }>;
    recent_activities?: Array<{
        id: number;
        description: string;
        event: string;
        causer_name: string;
        causer_avatar: string;
        time_ago: string;
        created_at: string;
    }>;
    upcoming_deadlines?: Array<{
        id: number;
        name: string;
        thumbnail: string;
        deadline_formatted: string;
        urgency_text: string;
        urgency: string;
    }>;
    lead_sources?: Array<{
        source: string;
        count: number;
        percentage: number;
        total_revenue: number;
    }>;
    performance?: {
        total?: number;
        not_started: { count: number; percentage: number };
        in_progress: { count: number; percentage: number };
        pending?: { count: number; percentage: number };
        completed: { count: number; percentage: number };
        cancelled?: { count: number; percentage: number };
    };
}

export default function Dashboard({
    filters = {
        period: 'all_time',
        chart_year: 2026,
        category_period: 'all_time',
        performance_period: 'all_time',
        available_years: [2024, 2025, 2026, 2027],
    },
    period = 'all_time',
    kpis = { total_projects: 0, active_projects: 0, completed_projects: 0, total_clients: 0 },
    financial = { total_value: 0, received: 0, outstanding: 0, collection_rate: 0, monthly_chart: [] },
    recent_projects = [],
    category_stats = [],
    recent_activities = [],
    upcoming_deadlines = [],
    lead_sources = [],
    performance = {
        not_started: { count: 0, percentage: 0 },
        in_progress: { count: 0, percentage: 0 },
        completed: { count: 0, percentage: 0 },
    },
}: DashboardProps) {
    const [periodDropdown, setPeriodDropdown] = useState(false);
    const [yearDropdown, setYearDropdown] = useState(false);
    const [categoryDropdown, setCategoryDropdown] = useState(false);
    const [performanceDropdown, setPerformanceDropdown] = useState(false);

    const activePeriod = filters?.period || 'all_time';
    const activeChartYear = filters?.chart_year || 2026;
    const activeCategoryPeriod = filters?.category_period || 'all_time';
    const activePerformancePeriod = filters?.performance_period || 'all_time';
    const availableYears = filters?.available_years || [2024, 2025, 2026, 2027];

    const handleFilterChange = (key: string, value: any) => {
        setPeriodDropdown(false);
        setYearDropdown(false);
        setCategoryDropdown(false);
        setPerformanceDropdown(false);

        router.get(
            '/dashboard',
            {
                period: key === 'period' ? value : activePeriod,
                chart_year: key === 'chart_year' ? value : activeChartYear,
                category_period: key === 'category_period' ? value : activeCategoryPeriod,
                performance_period: key === 'performance_period' ? value : activePerformancePeriod,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const getPeriodLabel = (p: string) => {
        switch (p) {
            case 'today':
            case 'Hari Ini':
                return 'Hari Ini';
            case 'this_month':
            case 'Bulan Ini':
                return 'Bulan Ini';
            case 'this_quarter':
            case 'Kuartal Ini':
                return 'Kuartal Ini';
            case 'this_year':
            case '2026':
            case 'Tahun Ini (2026)':
                return 'Tahun Ini (2026)';
            case 'all_time':
            case 'Semua Waktu':
            default:
                return 'Semua Waktu';
        }
    };

    const getCategoryBadgeClass = (categoryName: string) => {
        const cat = (categoryName || '').toLowerCase();
        if (cat.includes('wedding') && !cat.includes('pre')) return 'bg-blue-50 text-blue-700 border-blue-200';
        if (cat.includes('prewedding')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        if (cat.includes('event')) return 'bg-amber-50 text-amber-700 border-amber-200';
        if (cat.includes('newborn') || cat.includes('birthday')) return 'bg-rose-50 text-rose-700 border-rose-200';
        if (cat.includes('maternity')) return 'bg-purple-50 text-purple-700 border-purple-200';
        if (cat.includes('corporate') || cat.includes('commercial')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        return 'bg-slate-100 text-slate-700 border-slate-200';
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
            case 'in_progress': return 'bg-blue-50 text-blue-700 border border-blue-200';
            case 'editing': return 'bg-purple-50 text-purple-700 border border-purple-200';
            case 'shooting': return 'bg-amber-50 text-amber-800 border border-amber-200';
            case 'draft': return 'bg-slate-100 text-slate-700 border border-slate-200';
            default: return 'bg-slate-100 text-slate-700 border border-slate-200';
        }
    };

    // Bar chart Y-axis max = 200 jt
    const yAxisMax = 200;
    const yAxisTicks = [200, 150, 100, 50, 0];

    // Compute donut segments dynamically from category_stats
    const circumference = 2 * Math.PI * 38;
    const topCategories = category_stats;
    let cumulativeOffset = 0;
    const donutSegments = topCategories.map((cat) => {
        const dashLen = (cat.percentage / 100) * circumference;
        const seg = { ...cat, dashLen, segOffset: cumulativeOffset };
        cumulativeOffset += dashLen;
        return seg;
    });

    const getSourceIcon = (sourceName: string) => {
        const lower = (sourceName || '').toLowerCase();
        if (lower.includes('instagram') || lower.includes('ig') || lower.includes('sosmed') || lower.includes('social')) {
            return { icon: Instagram, bg: 'bg-pink-50 text-pink-600 border-pink-100' };
        }
        if (lower.includes('wo') || lower.includes('wedding') || lower.includes('organizer') || lower.includes('partner') || lower.includes('glory')) {
            return { icon: Building2, bg: 'bg-amber-50 text-amber-700 border-amber-100' };
        }
        if (lower.includes('google') || lower.includes('search') || lower.includes('seo')) {
            return { icon: Search, bg: 'bg-blue-50 text-blue-600 border-blue-100' };
        }
        if (lower.includes('website') || lower.includes('web') || lower.includes('online')) {
            return { icon: Globe, bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
        }
        if (lower.includes('walk') || lower.includes('studio') || lower.includes('lokasi')) {
            return { icon: MapPin, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
        }
        return { icon: UserCheck, bg: 'bg-purple-50 text-purple-600 border-purple-100' };
    };

    const displayLeadSources = lead_sources && lead_sources.length > 0 ? lead_sources : [
        { source: 'Instagram Arams Pictures', count: 18, percentage: 41.0, total_revenue: 0 },
        { source: 'Glory Wedding Organizer', count: 12, percentage: 27.3, total_revenue: 0 },
        { source: 'Rina Pratiwi', count: 8, percentage: 18.2, total_revenue: 0 },
        { source: 'Nedi Setiawan', count: 6, percentage: 13.6, total_revenue: 0 },
        { source: 'Google Search', count: 5, percentage: 11.4, total_revenue: 0 },
    ];

    return (
        <div className="space-y-6 pb-12 w-full max-w-full">
            <Head title="Dashboard - Arams Photography" />

            {/* 1. Welcome Banner + Period */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        Selamat datang, Admin <span className="animate-bounce">👋</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Kelola semua project dan pantau progres pekerjaan dengan mudah.
                    </p>
                </div>

                <div className="relative">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Periode</span>
                        <button
                            type="button"
                            onClick={() => setPeriodDropdown(!periodDropdown)}
                            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 text-sm font-medium text-slate-800 transition-colors cursor-pointer"
                        >
                            <span>{getPeriodLabel(activePeriod)}</span>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setPeriodDropdown(!periodDropdown)}
                            className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 text-slate-400 transition-colors cursor-pointer"
                        >
                            <Calendar className="w-4 h-4" />
                        </button>
                    </div>
                    {periodDropdown && (
                        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 z-40 animate-in fade-in zoom-in-95">
                            {[
                                { id: 'all_time', label: 'Semua Waktu' },
                                { id: 'this_year', label: 'Tahun Ini (2026)' },
                                { id: 'this_month', label: 'Bulan Ini' },
                                { id: 'this_quarter', label: 'Kuartal Ini' },
                                { id: 'today', label: 'Hari Ini' },
                            ].map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handleFilterChange('period', p.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${activePeriod === p.id ? 'bg-[#C89445]/10 text-[#C89445] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <span>{p.label}</span>
                                    {activePeriod === p.id && <Check className="w-3.5 h-3.5 text-[#C89445]" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. 4 KPI Cards (Full Width 4 Kolom) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Project */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-slate-800 stat-card-title uppercase tracking-wider leading-tight block">TOTAL PROJECT</span>
                            <div className="text-3xl font-extrabold text-slate-900 mt-1 leading-none">{kpis.total_projects}</div>
                            <span className="text-xs text-slate-500 mt-1 block">Semua Project</span>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                            <Folder className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100">
                        <Link href="/projects" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#C89445] transition-colors">
                            <span>Lihat Detail</span><ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Card 2: Project Aktif */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-slate-800 stat-card-title uppercase tracking-wider leading-tight block">PROJECT AKTIF</span>
                            <div className="text-3xl font-extrabold text-slate-900 mt-1 leading-none">{kpis.active_projects}</div>
                            <span className="text-xs text-slate-500 mt-1 block">Sedang Dikerjakan</span>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100">
                        <Link href="/projects?status=in_progress" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#C89445] transition-colors">
                            <span>Lihat Detail</span><ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Card 3: Project Selesai */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-slate-800 stat-card-title uppercase tracking-wider leading-tight block">PROJECT SELESAI</span>
                            <div className="text-3xl font-extrabold text-slate-900 mt-1 leading-none">{kpis.completed_projects}</div>
                            <span className="text-xs text-slate-500 mt-1 block">Selesai</span>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                            <CheckSquare className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100">
                        <Link href="/projects?status=completed" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#C89445] transition-colors">
                            <span>Lihat Detail</span><ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Card 4: Total Klien */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-[10px] font-bold text-slate-800 stat-card-title uppercase tracking-wider leading-tight block">TOTAL KLIEN</span>
                            <div className="text-3xl font-extrabold text-slate-900 mt-1 leading-none">{kpis.total_clients}</div>
                            <span className="text-xs text-slate-500 mt-1 block">Klien Terdaftar</span>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100">
                        <Link href="/clients" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#C89445] transition-colors">
                            <span>Lihat Detail</span><ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* 3. Akses Cepat & Ringkasan Keuangan (Sejajar Rata 100%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                {/* Akses Cepat (5 cols) */}
                <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-full">
                    <div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Akses Cepat</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Pintasan aksi untuk mempermudah pekerjaan Anda</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* + Klien */}
                            <Link href="/clients" className="bg-slate-50/70 hover:bg-orange-50/50 p-3.5 rounded-xl border border-slate-200/70 hover:border-orange-200 shadow-2xs transition-all flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">+ Klien</h4>
                                    <p className="text-[11px] text-slate-500 truncate">Tambah data klien baru</p>
                                </div>
                            </Link>

                            {/* + Project */}
                            <Link href="/projects" className="bg-slate-50/70 hover:bg-blue-50/50 p-3.5 rounded-xl border border-slate-200/70 hover:border-blue-200 shadow-2xs transition-all flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <FolderPlus className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">+ Project</h4>
                                    <p className="text-[11px] text-slate-500 truncate">Buat project baru</p>
                                </div>
                            </Link>

                            {/* + Pembayaran */}
                            <Link href="/finance" className="bg-slate-50/70 hover:bg-emerald-50/50 p-3.5 rounded-xl border border-slate-200/70 hover:border-emerald-200 shadow-2xs transition-all flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">+ Pembayaran</h4>
                                    <p className="text-[11px] text-slate-500 truncate">Catat pembayaran klien</p>
                                </div>
                            </Link>

                            {/* Lihat Laporan */}
                            <Link href="/reports" className="bg-slate-50/70 hover:bg-purple-50/50 p-3.5 rounded-xl border border-slate-200/70 hover:border-purple-200 shadow-2xs transition-all flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors truncate">Lihat Laporan</h4>
                                    <p className="text-[11px] text-slate-500 truncate">Buka laporan &amp; analitik</p>
                                </div>
                            </Link>

                            {/* Jadwal & Sesi Foto */}
                            <Link href="/calendar" className="bg-slate-50/70 hover:bg-rose-50/50 p-3.5 rounded-xl border border-slate-200/70 hover:border-rose-200 shadow-2xs transition-all flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors truncate">Jadwal &amp; Sesi</h4>
                                    <p className="text-[11px] text-slate-500 truncate">Kalender agenda photoshoot</p>
                                </div>
                            </Link>

                            {/* Master Paket & Layanan */}
                            <Link href="/master-data/packages" className="bg-slate-50/70 hover:bg-indigo-50/50 p-3.5 rounded-xl border border-slate-200/70 hover:border-indigo-200 shadow-2xs transition-all flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <Database className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">Master Paket</h4>
                                    <p className="text-[11px] text-slate-500 truncate">Paket, layanan &amp; harga</p>
                                </div>
                            </Link>

                            {/* Drive & File Links */}
                            <Link href="/files" className="bg-slate-50/70 hover:bg-cyan-50/50 p-3.5 rounded-xl border border-slate-200/70 hover:border-cyan-200 shadow-2xs transition-all flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <HardDrive className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-cyan-600 transition-colors truncate">Files</h4>
                                    <p className="text-[11px] text-slate-500 truncate">Link cloud drive klien</p>
                                </div>
                            </Link>

                            {/* Pengaturan Sistem */}
                            <Link href="/settings" className="bg-slate-50/70 hover:bg-teal-50/50 p-3.5 rounded-xl border border-slate-200/70 hover:border-teal-200 shadow-2xs transition-all flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-600 transition-colors truncate">Pengaturan</h4>
                                    <p className="text-[11px] text-slate-500 truncate">Branding &amp; konfigurasi</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Pintasan cepat sistem Arams</span>
                        <span className="text-[11px] font-semibold text-[#C89445]">8 Fitur Aktif</span>
                    </div>
                </div>

                {/* Ringkasan Keuangan (7 cols) */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-full">
                    <div>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">RINGKASAN KEUANGAN</span>
                                <span className="text-xs text-slate-400 font-medium">Performa arus kas masuk tahun berjalan</span>
                            </div>
                            {/* Year Selector Dropdown */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setYearDropdown(!yearDropdown)}
                                    className="text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
                                >
                                    <span>Tahun {activeChartYear}</span>
                                    <ChevronDown className="w-3 h-3 text-slate-400" />
                                </button>

                                {yearDropdown && (
                                    <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 z-40 animate-in fade-in zoom-in-95">
                                        {availableYears.map((yr) => (
                                            <button
                                                key={yr}
                                                type="button"
                                                onClick={() => handleFilterChange('chart_year', yr)}
                                                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${activeChartYear === yr
                                                        ? 'bg-[#C89445]/10 text-[#C89445] font-bold'
                                                        : 'text-slate-700 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <span>Tahun {yr}</span>
                                                {activeChartYear === yr && <Check className="w-3.5 h-3.5 text-[#C89445]" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Grid: Left Metrics + Right Full-Height Chart */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-stretch min-h-[290px]">
                            {/* Left (sm:col-span-4): Total Nilai Project + Sudah & Belum Badges */}
                            <div className="sm:col-span-4 flex flex-col justify-between gap-3">
                                {/* Total Nilai Project */}
                                <div className="pb-1">
                                    <span className="text-xs text-slate-400 font-medium block">Total Nilai Project</span>
                                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                                        {formatRupiah(financial.total_value)}
                                    </div>
                                </div>

                                {/* Sudah Diterima */}
                                <div className="bg-emerald-50/80 border border-emerald-100 p-3.5 rounded-xl flex-1 flex flex-col justify-center">
                                    <span className="text-[11px] font-semibold text-emerald-800 block">Sudah Diterima</span>
                                    <p className="text-sm font-bold text-emerald-950 mt-1">{formatRupiah(financial.received)}</p>
                                    <span className="text-xs font-bold text-emerald-600 mt-0.5 inline-block">{financial.collection_rate}%</span>
                                </div>

                                {/* Belum Diterima */}
                                <div className="bg-amber-50/80 border border-amber-100 p-3.5 rounded-xl flex-1 flex flex-col justify-center">
                                    <span className="text-[11px] font-semibold text-amber-800 block">Belum Diterima</span>
                                    <p className="text-sm font-bold text-amber-950 mt-1">{formatRupiah(financial.outstanding)}</p>
                                    <span className="text-xs font-bold text-amber-600 mt-0.5 inline-block">{(100 - financial.collection_rate).toFixed(1)}%</span>
                                </div>
                            </div>

                            {/* Right: Bar chart component filling full available vertical space */}
                            <div className="sm:col-span-8 flex flex-col h-full min-h-[290px]">
                                <BarChart
                                    data={financial.monthly_chart.map((bar) => ({
                                        month: bar.month,
                                        value: bar.amount,
                                    }))}
                                    height="100%"
                                    barColor="#10B981"
                                    barHoverColor="#059669"
                                    showGridLines={true}
                                    className="h-full flex-1"
                                />
                            </div>
                        </div>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-4 border-t border-slate-100 pt-2.5">
                        Grafik menunjukkan total pembayaran yang benar-benar diterima.
                    </p>
                </div>
            </div>

            {/* 4. Project Terbaru + Donut Chart */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mt-2">
                {/* Recent Projects Table (8 cols) */}
                <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Project Terbaru</h3>
                        </div>
                        <Link
                            href="/projects"
                            className="text-xs font-semibold text-slate-500 hover:text-[#E8630A] transition-colors"
                        >
                            Lihat Semua
                        </Link>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="px-6">Project</TableHead>
                                    <TableHead>Klien</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Progres</TableHead>
                                    <TableHead className="px-6">Deadline</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recent_projects.map((proj) => (
                                    <TableRow key={proj.id} className="hover:bg-slate-50/70 transition-colors">
                                        {/* Project Thumbnail & Name */}
                                        <TableCell className="px-6">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={proj.thumbnail || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=100&auto=format&fit=crop&q=80'}
                                                    alt={proj.name}
                                                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shadow-2xs shrink-0"
                                                />
                                                <div>
                                                    <Link
                                                        href={`/projects/${proj.id}`}
                                                        className="font-bold text-slate-900 hover:text-[#E8630A] transition-colors block text-xs"
                                                    >
                                                        {proj.name}
                                                    </Link>
                                                    <span className="text-[11px] text-slate-400 font-mono">
                                                        {proj.event_date || '15 Agustus 2026'}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Client */}
                                        <TableCell className="font-semibold text-slate-800">
                                            {proj.client?.name || 'Tanpa Klien'}
                                        </TableCell>

                                        {/* Category */}
                                        <TableCell>
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getCategoryBadgeClass(
                                                    proj.category?.name || 'Umum'
                                                )}`}
                                            >
                                                {proj.category?.name || 'Umum'}
                                            </span>
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            <span
                                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${getStatusBadgeClass(
                                                    proj.status
                                                )}`}
                                            >
                                                {proj.status_label}
                                            </span>
                                        </TableCell>

                                        {/* Progress */}
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-slate-700 w-7 font-mono">
                                                    {proj.progress}%
                                                </span>
                                                <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${proj.progress === 100
                                                                ? 'bg-emerald-500'
                                                                : 'bg-primary-accent'
                                                            }`}
                                                        style={{ width: `${proj.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Deadline */}
                                        <TableCell className="px-6">
                                            <span className="text-[11px] text-slate-600 block">{proj.deadline || '05 Juni 2026'}</span>
                                            <span className={`text-[10px] font-bold ${proj.deadline_status === 'completed' ? 'text-emerald-600'
                                                    : proj.deadline_status === 'urgent' ? 'text-amber-600'
                                                        : proj.deadline_status === 'overdue' ? 'text-red-600'
                                                            : 'text-slate-400'
                                                }`}>
                                                {proj.deadline_text}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {recent_projects.map((proj) => (
                            <div key={proj.id} className="p-4 bg-white space-y-2.5">
                                <div className="flex items-start justify-between gap-2.5">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={proj.thumbnail || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=100&auto=format&fit=crop&q=80'}
                                            alt={proj.name}
                                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0 shadow-2xs"
                                        />
                                        <div>
                                            <Link
                                                href={`/projects/${proj.id}`}
                                                className="font-bold text-slate-900 text-xs hover:text-[#E8630A] transition-colors line-clamp-1"
                                            >
                                                {proj.name}
                                            </Link>
                                            <span className="text-[11px] text-slate-500 block font-medium">
                                                {proj.client?.name || 'Tanpa Klien'}
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${getStatusBadgeClass(
                                            proj.status
                                        )}`}
                                    >
                                        {proj.status_label}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getCategoryBadgeClass(
                                            proj.category?.name || 'Umum'
                                        )}`}
                                    >
                                        {proj.category?.name || 'Umum'}
                                    </span>
                                    <span className="font-mono text-[11px]">
                                        {proj.event_date || '15 Agu 2026'}
                                    </span>
                                </div>

                                <div className="space-y-1 pt-1">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-400">Progres ({proj.progress}%)</span>
                                        <span className={`font-bold ${proj.deadline_status === 'completed' ? 'text-emerald-600'
                                                : proj.deadline_status === 'urgent' ? 'text-amber-600'
                                                    : proj.deadline_status === 'overdue' ? 'text-red-600'
                                                        : 'text-slate-400'
                                            }`}>
                                            {proj.deadline_text}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${proj.progress === 100 ? 'bg-emerald-500' : 'bg-primary-accent'
                                                }`}
                                            style={{ width: `${proj.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Donut Chart (4 cols) */}
                <div className="xl:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                        <h3 className="text-sm font-bold text-slate-900">Project Berdasarkan Kategori</h3>
                        {/* Category Period Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setCategoryDropdown(!categoryDropdown)}
                                className="text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer flex items-center gap-1 transition-colors shadow-2xs"
                            >
                                <span>{getPeriodLabel(activeCategoryPeriod)}</span>
                                <ChevronDown className="w-3 h-3 text-slate-400" />
                            </button>

                            {categoryDropdown && (
                                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 z-40 animate-in fade-in zoom-in-95">
                                    {[
                                        { id: 'all_time', label: 'Semua Waktu' },
                                        { id: 'this_year', label: 'Tahun Ini (2026)' },
                                        { id: 'this_month', label: 'Bulan Ini' },
                                        { id: 'this_quarter', label: 'Kuartal Ini' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => handleFilterChange('category_period', opt.id)}
                                            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${activeCategoryPeriod === opt.id
                                                    ? 'bg-[#C89445]/10 text-[#C89445] font-bold'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                                }`}
                                        >
                                            <span>{opt.label}</span>
                                            {activeCategoryPeriod === opt.id && <Check className="w-3.5 h-3.5 text-[#C89445]" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DonutChart
                        data={topCategories.map((cat) => ({
                            label: cat.name,
                            value: cat.count,
                            count: cat.count,
                            color: cat.color,
                        }))}
                        size={165}
                        strokeWidth={22}
                        centerLabel="TOTAL PROJECT"
                        centerValue={kpis.total_projects}
                        layout="vertical"
                    />
                </div>
            </div>

            {/* 5. Bottom Section: 4 Spacious 2x2 Grid Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
                {/* Aktivitas Terbaru (Card 1) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100/60">
                                    <Activity className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Aktivitas Terbaru</h3>
                                    <p className="text-[11px] text-slate-400">Log operasional & aktivitas tim studio terkini</p>
                                </div>
                            </div>
                            <Link
                                href="/activity-log"
                                className="text-xs font-semibold text-slate-600 hover:text-purple-600 transition-colors flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200"
                            >
                                <span>Lihat Semua</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="space-y-2 flex-1">
                            {recent_activities && recent_activities.length > 0 ? (
                                recent_activities.slice(0, 5).map((act) => (
                                    <div
                                        key={act.id}
                                        className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50/80 transition-colors"
                                    >
                                        <img
                                            src={
                                                act.causer_avatar ||
                                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                                            }
                                            alt={act.causer_name}
                                            className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100 shrink-0 mt-0.5"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-bold text-slate-900 truncate">
                                                    {act.causer_name}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                                                    {act.time_ago || act.created_at}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600 leading-snug line-clamp-2 mt-0.5">
                                                {act.description}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-slate-400 text-xs">
                                    Belum ada aktivitas tercatat.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span>Log otomatis sistem</span>
                        <span className="font-semibold text-slate-700">{recent_activities?.length ?? 0} Aktivitas Terkini</span>
                    </div>
                </div>

                {/* Deadline Terdekat (Card 2) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100/60">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Deadline Terdekat</h3>
                                    <p className="text-[11px] text-slate-400">Monitoring tenggat waktu project yang berjalan</p>
                                </div>
                            </div>
                            <Link
                                href="/projects"
                                className="text-xs font-semibold text-slate-600 hover:text-amber-600 transition-colors flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200"
                            >
                                <span>Lihat Semua</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="space-y-2 flex-1">
                            {upcoming_deadlines && upcoming_deadlines.length > 0 ? (
                                upcoming_deadlines.slice(0, 5).map((dl) => (
                                    <Link
                                        key={dl.id}
                                        href={`/projects/${dl.id}`}
                                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors gap-3 group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={dl.thumbnail || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=100&auto=format&fit=crop&q=80'}
                                                alt={dl.name}
                                                className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0 shadow-2xs group-hover:ring-amber-300 transition-all"
                                            />
                                            <div className="min-w-0">
                                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-primary-accent transition-colors truncate">
                                                    {dl.name}
                                                </h4>
                                                <span className="text-[11px] text-slate-400 block truncate">
                                                    Deadline: {dl.deadline_formatted}
                                                </span>
                                            </div>
                                        </div>

                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap shrink-0 ${dl.urgency === 'urgent'
                                                ? 'text-amber-700 bg-amber-50 border-amber-200'
                                                : dl.urgency === 'overdue'
                                                    ? 'text-red-700 bg-red-50 border-red-200'
                                                    : 'text-blue-700 bg-blue-50 border-blue-200'
                                            }`}>
                                            {dl.urgency_text}
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-6 text-slate-400 text-xs">
                                    Belum ada project aktif mendekati deadline.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span>Monitoring tenggat waktu</span>
                        <span className="font-semibold text-amber-600">{upcoming_deadlines?.length ?? 0} Project Terpantau</span>
                    </div>
                </div>

                {/* Top Sumber Klien / Lead Source (Card 3) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100/60">
                                    <Compass className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Top Sumber Klien (Lead Source)</h3>
                                    <p className="text-[11px] text-slate-400">Peringkat saluran akuisisi klien & pendapatan</p>
                                </div>
                            </div>
                            <Link
                                href="/reports"
                                className="text-xs font-semibold text-slate-600 hover:text-purple-600 transition-colors flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200"
                            >
                                <span>Lihat Report</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="space-y-3.5 flex-1 pt-1">
                            {displayLeadSources.length > 0 ? (
                                displayLeadSources.map((src, idx) => (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-800 font-bold text-xs flex items-center justify-center font-mono border border-amber-200/60 shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <span className="font-bold text-slate-900 text-xs">
                                                    {src.source}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 font-mono shrink-0">
                                                {src.total_revenue > 0 && (
                                                    <span className="text-xs font-extrabold text-slate-900">
                                                        {formatRupiahCompact(src.total_revenue)}
                                                    </span>
                                                )}
                                                <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                                    {src.count} Klien
                                                </span>
                                                <span className="text-xs text-slate-500 font-bold min-w-[40px] text-right">
                                                    {src.percentage}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-[#C89445] transition-all duration-500"
                                                style={{ width: `${src.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-slate-400 text-xs">
                                    Belum ada data sumber klien yang tercatat.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span>Lead acquisition</span>
                        <span className="font-semibold text-purple-600">{displayLeadSources.length} Sumber Terdata</span>
                    </div>
                </div>

                {/* Kinerja Project (Card 4) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100/60">
                                        <Target className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">Kinerja Project</h3>
                                        <p className="text-[11px] text-slate-400">Distribusi status pengerjaan seluruh project</p>
                                    </div>
                                </div>
                                {/* Performance Period Dropdown */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setPerformanceDropdown(!performanceDropdown)}
                                        className="text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1 rounded-xl border border-slate-200 cursor-pointer flex items-center gap-1 transition-colors shadow-2xs"
                                    >
                                        <span>{getPeriodLabel(activePerformancePeriod)}</span>
                                        <ChevronDown className="w-3 h-3 text-slate-400" />
                                    </button>

                                    {performanceDropdown && (
                                        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 p-1.5 z-40 animate-in fade-in zoom-in-95">
                                            {[
                                                { id: 'all_time', label: 'Semua Waktu' },
                                                { id: 'this_year', label: 'Tahun Ini (2026)' },
                                                { id: 'this_month', label: 'Bulan Ini' },
                                            ].map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => handleFilterChange('performance_period', opt.id)}
                                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between ${activePerformancePeriod === opt.id
                                                            ? 'bg-emerald-50 text-emerald-800 font-bold'
                                                            : 'text-slate-700 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <span>{opt.label}</span>
                                                    {activePerformancePeriod === opt.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 5 Status Progress Bars */}
                            <div className="space-y-2.5 pt-1">
                                {/* Belum Dimulai */}
                                <div>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="font-semibold text-slate-700">Belum Dimulai</span>
                                        <span className="text-slate-500 font-mono font-bold text-[11px]">
                                            {performance.not_started?.count ?? 0} ({performance.not_started?.percentage ?? 0}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-slate-400 transition-all duration-500"
                                            style={{ width: `${performance.not_started?.percentage ?? 0}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Sedang Dikerjakan */}
                                <div>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="font-semibold text-slate-700">Sedang Dikerjakan</span>
                                        <span className="text-amber-700 font-mono font-bold text-[11px]">
                                            {performance.in_progress?.count ?? 0} ({performance.in_progress?.percentage ?? 0}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-amber-500 transition-all duration-500"
                                            style={{ width: `${performance.in_progress?.percentage ?? 0}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Pending / Menunggu */}
                                <div>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="font-semibold text-slate-700">Pending / Tertunda</span>
                                        <span className="text-purple-700 font-mono font-bold text-[11px]">
                                            {performance.pending?.count ?? 0} ({performance.pending?.percentage ?? 0}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-purple-500 transition-all duration-500"
                                            style={{ width: `${performance.pending?.percentage ?? 0}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Selesai */}
                                <div>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="font-semibold text-slate-700">Selesai</span>
                                        <span className="text-emerald-700 font-mono font-bold text-[11px]">
                                            {performance.completed?.count ?? 0} ({performance.completed?.percentage ?? 0}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                            style={{ width: `${performance.completed?.percentage ?? 0}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Batal / Dibatalkan */}
                                <div>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="font-semibold text-slate-700">Batal</span>
                                        <span className="text-rose-600 font-mono font-bold text-[11px]">
                                            {performance.cancelled?.count ?? 0} ({performance.cancelled?.percentage ?? 0}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-rose-500 transition-all duration-500"
                                            style={{ width: `${performance.cancelled?.percentage ?? 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mini Stat Summary Box */}
                        <div className="grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-slate-100">
                            <div className="bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-xl text-center">
                                <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Tingkat Sukses</span>
                                <span className="text-base font-extrabold text-emerald-950 font-mono">{performance.completed?.percentage ?? 0}%</span>
                            </div>
                            <div className="bg-blue-50/70 border border-blue-100 p-2.5 rounded-xl text-center">
                                <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider block">Proyek Aktif</span>
                                <span className="text-base font-extrabold text-blue-950 font-mono">{kpis.active_projects} Project</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1.5 truncate">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="truncate">Performa keseluruhan studio</span>
                        </div>
                        <span className="font-semibold text-emerald-600 whitespace-nowrap">Optimal</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
