import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ClientLayout } from '@/layouts/ClientLayout';
import { ClientHeroCarousel } from '@/components/ClientHeroCarousel';
import {
    Calendar,
    Check,
    ChevronRight,
    MapPin,
    Search,
    Clock,
    Sparkles,
    CheckCircle2,
    XCircle,
    SlidersHorizontal,
    ArrowRight,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight,
    FolderKanban,
} from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';

interface TimelineStepItem {
    step: number;
    key?: string;
    name: string;
    title?: string;
    desc?: string;
    status?: 'completed' | 'active' | 'pending';
    status_label?: string;
    date?: string | null;
}

interface ProjectItem {
    id: string;
    project_number: string;
    name: string;
    category_name: string;
    package_name: string;
    status: string;
    workflow_step: string;
    progress: number;
    event_date?: string;
    deadline?: string;
    location?: string;
    total_amount: number;
    paid_amount: number;
    payment_status: string;
    thumbnail?: string;
    current_step?: number;
    total_steps?: number;
    step_label?: string;
    active_step_desc?: string;
    progress_percentage?: number;
    timeline_steps?: TimelineStepItem[];
    completed_date?: string;
    estimated_done?: string;
}

interface ClientProjectsProps {
    projects: ProjectItem[];
}

export default function ClientProjects({ projects = [] }: ClientProjectsProps) {
    const { props: pageProps } = usePage<any>();
    const appSettings = pageProps?.appSettings || {};

    // Exact color palette tokens matching Dashboard
    const COLOR_BURGUNDY = '#3C0E0E';
    const COLOR_WARM_CREAM = '#F4EBE4';
    const COLOR_OFF_WHITE = '#FBF6F0';

    const portalPrimaryAccent = appSettings.portal_primary_accent || COLOR_BURGUNDY;
    const portalHeroBg = appSettings.portal_hero_bg || COLOR_BURGUNDY;
    const portalHeroGradient = appSettings.portal_hero_gradient || '';
    const portalHeroText = appSettings.portal_hero_text_color || '#FFFFFF';
    const portalCardBg = appSettings.portal_card_bg || '#FFFFFF';
    const portalCardBorder = appSettings.portal_card_border || COLOR_WARM_CREAM;
    const portalHeadingColor = appSettings.portal_heading_color || COLOR_BURGUNDY;
    const portalFontHeading = appSettings.portal_font_heading || 'Plus Jakarta Sans';
    const portalFooterText = appSettings.portal_footer_text || COLOR_WARM_CREAM;

    // Safe hex to rgba converter for smooth transparent gradients
    const hexToRgba = (hex: string, alpha: number) => {
        if (!hex || !hex.startsWith('#')) return hex;
        const clean = hex.replace('#', '');
        if (clean.length === 3) {
            const r = parseInt(clean[0] + clean[0], 16);
            const g = parseInt(clean[1] + clean[1], 16);
            const b = parseInt(clean[2] + clean[2], 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        if (clean.length >= 6) {
            const r = parseInt(clean.substring(0, 2), 16);
            const g = parseInt(clean.substring(2, 4), 16);
            const b = parseInt(clean.substring(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return hex;
    };

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    const displayProjects = projects || [];

    const filteredProjects = displayProjects.filter((p) => {
        const matchesSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.project_number.toLowerCase().includes(search.toLowerCase()) ||
            p.category_name.toLowerCase().includes(search.toLowerCase()) ||
            (p.location && p.location.toLowerCase().includes(search.toLowerCase()));

        let matchesStatus = true;
        if (statusFilter === 'in_progress') {
            matchesStatus = p.status === 'in_progress' || p.status === 'confirmed' || p.status === 'shooting' || p.status === 'draft';
        } else if (statusFilter === 'completed') {
            matchesStatus = p.status === 'completed' || p.status === 'delivered';
        } else if (statusFilter === 'cancelled') {
            matchesStatus = p.status === 'cancelled';
        }

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = filteredProjects.length > 0 ? (safeCurrentPage - 1) * ITEMS_PER_PAGE : 0;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredProjects.length);
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    return (
        <ClientLayout>
            <Head title="Project Saya - Arams Pictures" />

            <div className="space-y-6">
                {/* ── 1. HERO BANNER - PROJECT SAYA ───────────────────────── */}
                <section
                    style={{
                        background: portalHeroGradient || portalHeroBg,
                        color: portalHeroText,
                    }}
                    className="relative -mt-6 sm:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden shadow-md min-h-[380px] sm:min-h-[480px] lg:min-h-[560px] flex items-center transition-colors select-none"
                >
                    {/* Inner Decorative Box Frame (Kotak Bingkai) */}
                    <div className="absolute inset-x-4 top-6 bottom-6 sm:inset-x-6 sm:top-8 sm:bottom-8 lg:inset-x-8 lg:top-10 lg:bottom-10 border border-white/20 rounded-2xl pointer-events-none z-20" />

                    {/* Background Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src={displayProjects[0]?.thumbnail || 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1920&auto=format&fit=crop&q=85'}
                            alt="Project Saya Arams Pictures"
                            className="w-full h-full object-cover object-center sm:object-right opacity-85 sm:opacity-95 filter brightness-95 contrast-[1.05]"
                        />
                        {/* Mobile Gradient Overlay */}
                        <div
                            style={{
                                background: `linear-gradient(to bottom, ${hexToRgba(portalHeroBg, 0.95)} 0%, ${hexToRgba(portalHeroBg, 0.70)} 50%, ${hexToRgba(portalHeroBg, 0.95)} 100%)`,
                            }}
                            className="absolute inset-0 sm:hidden z-10 pointer-events-none"
                        />
                        {/* Desktop Gradient Overlay */}
                        <div
                            style={{
                                background: `linear-gradient(to right, ${hexToRgba(portalHeroBg, 0.97)} 0%, ${hexToRgba(portalHeroBg, 0.90)} 35%, ${hexToRgba(portalHeroBg, 0.55)} 60%, ${hexToRgba(portalHeroBg, 0.15)} 80%, transparent 100%)`,
                            }}
                            className="absolute inset-0 hidden sm:block z-10 pointer-events-none"
                        />
                    </div>

                    {/* Hero Content */}
                    <div className="relative z-10 w-full max-w-full px-6 sm:px-12 lg:px-16 py-10 sm:py-16 lg:py-20">
                        <div className="max-w-2xl space-y-3 sm:space-y-4 drop-shadow-xs">
                            <span
                                style={{ color: COLOR_WARM_CREAM }}
                                className="text-[10px] sm:text-xs font-extrabold tracking-[0.25em] uppercase block opacity-90"
                            >
                                CLIENT AREA • PROJECT MANAGEMENT
                            </span>
                            <h1
                                style={{
                                    fontFamily: `'${portalFontHeading}', serif`,
                                    color: portalHeroText,
                                }}
                                className="text-2xl sm:text-4xl lg:text-5xl font-serif font-normal tracking-tight leading-[1.18]"
                            >
                                Project Saya
                            </h1>
                            <p
                                style={{ color: COLOR_WARM_CREAM }}
                                className="text-xs sm:text-base leading-relaxed max-w-xl opacity-90"
                            >
                                Pantau seluruh tahapan dokumentasi, timeline pengerjaan, jadwal pemotretan, dan unduh hasil karya foto &amp; video Anda di satu tempat yang aman.
                            </p>
                            <div className="pt-2 sm:pt-3 flex flex-wrap items-center gap-2.5 sm:gap-3">
                                <div className="client-btn-outline cursor-default">
                                    <FolderKanban className="w-3.5 h-3.5 text-white/90" />
                                    <span>{displayProjects.length} Total Project</span>
                                </div>
                                <div className="client-btn-outline cursor-default">
                                    <Clock className="w-3.5 h-3.5 text-white/90" />
                                    <span>{displayProjects.filter((p) => p.status !== 'completed' && p.status !== 'delivered' && p.status !== 'cancelled').length} Project Aktif</span>
                                </div>
                                <Link
                                    href="/form-klien"
                                    className="client-btn-primary text-xs sm:text-sm"
                                >
                                    <span>Booking Project Baru</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 2. FILTER & SEARCH TOOLBAR (MATCHING SCREENSHOT 3) ─────── */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 w-full">
                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 w-full max-w-full no-scrollbar">
                        {[
                            { id: 'all', label: 'Semua Project', icon: FolderKanban },
                            { id: 'in_progress', label: 'Dalam Proses', icon: Clock },
                            { id: 'completed', label: 'Selesai', icon: CheckCircle2 },
                            { id: 'cancelled', label: 'Dibatalkan', icon: XCircle },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            const isActive = statusFilter === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleStatusFilterChange(tab.id)}
                                    style={
                                        isActive
                                            ? {
                                                  backgroundColor: portalPrimaryAccent,
                                                  color: '#FFFFFF',
                                              }
                                            : {}
                                    }
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                                        isActive
                                            ? 'shadow-xs'
                                            : 'bg-[#F4EBE4] hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] text-[#3C0E0E] border border-[#E8DDD5] group'
                                    }`}
                                >
                                    <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-white' : 'text-[#3C0E0E] group-hover:text-white'}`} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Search Input & Filter Button */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 md:w-64">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Cari project..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-hidden text-slate-900 placeholder:text-slate-400 transition-colors shadow-2xs focus:border-[#3C0E0E]"
                            />
                        </div>

                        <button
                            type="button"
                            className="px-3.5 py-2 bg-[#F4EBE4] hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] border border-[#E8DDD5] rounded-xl text-xs font-bold text-[#3C0E0E] shadow-2xs flex items-center gap-1.5 cursor-pointer group transition-all"
                        >
                            <span>Filter</span>
                            <SlidersHorizontal className="w-3.5 h-3.5 text-[#3C0E0E] group-hover:text-white transition-colors" />
                        </button>
                    </div>
                </div>

                {/* ── 3. PROJECT LIST CARDS (MATCHING SCREENSHOT 3) ──────────── */}
                <div className="space-y-4">
                    {filteredProjects.length === 0 ? (
                        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-2xs">
                            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#4A151B] flex items-center justify-center mx-auto">
                                <FolderKanban className="w-8 h-8" />
                            </div>
                            <div className="space-y-1 max-w-md mx-auto">
                                <h3 className="text-base font-bold text-slate-900">
                                    {search || statusFilter !== 'all'
                                        ? 'Tidak Ada Project yang Cocok'
                                        : 'Belum Ada Project'}
                                </h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    {search || statusFilter !== 'all'
                                        ? 'Coba ganti kata kunci pencarian atau ubah filter status yang Anda pilih.'
                                        : 'Anda belum memiliki riwayat project. Mulai abadikan momen spesial Anda bersama Arams Pictures.'}
                                </p>
                            </div>
                            <div className="pt-2">
                                <Link
                                    href="/form-klien"
                                    style={{ backgroundColor: portalPrimaryAccent, color: '#FFFFFF' }}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
                                >
                                    <span>Booking Project Baru</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        paginatedProjects.map((p) => {
                            const isWedding = (p.total_steps || 5) === 8 || p.category_name.toLowerCase().includes('wedding');
                            const totalSteps = p.total_steps || (isWedding ? 8 : 5);
                            const isCompleted = p.status === 'completed' || p.workflow_step === 'selesai' || p.status === 'delivered';
                            const activeStep = p.current_step || (isCompleted ? totalSteps : 1);
                            const sisaTagihan = Math.max(0, (p.total_amount || 0) - (p.paid_amount || 0));

                            const stepsList: TimelineStepItem[] = (p.timeline_steps && p.timeline_steps.length > 0)
                                ? p.timeline_steps
                                : (totalSteps === 8 ? [
                                    { step: 1, name: 'Booking & DP', desc: 'Tanda jadi & kunci jadwal acara' },
                                    { step: 2, name: 'Briefing', desc: 'Konsep, rundown & moodboard' },
                                    { step: 3, name: 'Hari Pemotretan', desc: 'Liputan sesi foto & video Hari-H' },
                                    { step: 4, name: 'Preview Foto', desc: 'Seleksi foto online' },
                                    { step: 5, name: 'Editing Seleksi', desc: 'Color grading & retouching' },
                                    { step: 6, name: 'Review Revisi', desc: 'Pengecekan hasil karya klien' },
                                    { step: 7, name: 'Cetak Album', desc: 'Produksi cetak lab album kolase' },
                                    { step: 8, name: 'Selesai & Kirim', desc: 'Serah terima album & cloud drive' },
                                ] : [
                                    { step: 1, name: 'Booking & DP', desc: 'Tanda jadi & kunci jadwal pemotretan' },
                                    { step: 2, name: 'Briefing Konsep', desc: 'Penentuan tema, kostum & properti' },
                                    { step: 3, name: 'Hari Sesi Foto', desc: 'Sesi pemotretan studio / outdoor' },
                                    { step: 4, name: 'Editing & Retouch', desc: 'Color grading & retouching' },
                                    { step: 5, name: 'Selesai & Kirim', desc: 'Pengiriman file resolusi tinggi' },
                                ]);

                            return (
                                <div
                                    key={p.id}
                                    style={{
                                        backgroundColor: portalCardBg,
                                        borderColor: portalCardBorder,
                                    }}
                                    className="group rounded-2xl border p-4 sm:p-5 shadow-xs hover:shadow-xl hover:shadow-[#3C0E0E]/8 hover:-translate-y-1.5 hover:border-[#3C0E0E]/30 transition-all duration-300 flex flex-col lg:flex-row gap-4 sm:gap-5 items-stretch"
                                >
                                    {/* Left Thumbnail with Badge */}
                                    <div className="relative w-full sm:w-44 md:w-48 lg:w-44 xl:w-48 h-36 sm:h-auto min-h-[135px] max-h-[170px] rounded-xl overflow-hidden bg-slate-100 shrink-0 shadow-2xs">
                                        <img
                                            src={p.thumbnail || '/images/wedding-couple.jpg'}
                                            alt={p.name}
                                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                                        />
                                        <div className="absolute bottom-2 left-2">
                                            <span
                                                style={
                                                    p.status === 'cancelled'
                                                        ? { backgroundColor: '#FEE2E2', color: '#991B1B', borderColor: '#FECACA' }
                                                        : isCompleted
                                                        ? { backgroundColor: '#D1FAE5', color: '#065F46', borderColor: '#A7F3D0' }
                                                        : {
                                                              backgroundColor: `${portalPrimaryAccent}15`,
                                                              color: portalPrimaryAccent,
                                                              borderColor: `${portalPrimaryAccent}35`,
                                                          }
                                                }
                                                className="px-2.5 py-0.5 rounded-md text-[10px] font-bold shadow-xs border backdrop-blur-xs"
                                            >
                                                {p.status === 'cancelled' ? 'Dibatalkan' : isCompleted ? 'Selesai' : 'Dalam Proses'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Center: Title, Stepper with Timeline Information, Status Strip */}
                                    <div className="flex-1 flex flex-col justify-between min-w-0 space-y-3">
                                        {/* Title & Metadata */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3
                                                    style={{
                                                        color: portalHeadingColor,
                                                        fontFamily: `'${portalFontHeading}', serif`,
                                                    }}
                                                    className="font-serif font-black text-base sm:text-lg leading-snug line-clamp-1 group-hover:text-[#3C0E0E] transition-colors"
                                                >
                                                    {p.name}
                                                </h3>
                                                {p.category_name && (
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold shrink-0 hidden sm:inline-block">
                                                        {p.category_name}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span>{p.event_date || 'Belum dijadwalkan'}</span>
                                                </div>
                                                <span>•</span>
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    <span className="truncate max-w-[220px]">{p.location || 'Studio Arams Pictures'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Horizontal Stepper with Complete Step Information */}
                                        <div className="pt-1 pb-1">
                                            <div className="relative flex items-start justify-between">
                                                {/* Connecting Background Line */}
                                                <div
                                                    className="absolute top-3 -translate-y-1/2 h-0.5 bg-slate-200 -z-0"
                                                    style={{
                                                        left: `calc(100% / (${stepsList.length} * 2))`,
                                                        right: `calc(100% / (${stepsList.length} * 2))`,
                                                    }}
                                                />

                                                {stepsList.map((st, idx) => {
                                                    const stepNum = st.step || idx + 1;
                                                    const isStepDone = isCompleted || st.status === 'completed' || stepNum < activeStep;
                                                    const isCurrent = !isCompleted && (st.status === 'active' || stepNum === activeStep);

                                                    return (
                                                        <div
                                                            key={stepNum}
                                                            className="flex flex-col items-center relative z-10 flex-1 px-0.5 text-center group cursor-default"
                                                        >
                                                            {/* Step Circle */}
                                                            <div
                                                                style={
                                                                    isCurrent
                                                                        ? {
                                                                              backgroundColor: portalPrimaryAccent,
                                                                              color: '#FFFFFF',
                                                                              boxShadow: `0 0 0 3px ${portalPrimaryAccent}25`,
                                                                          }
                                                                        : isStepDone
                                                                        ? {
                                                                              backgroundColor: '#059669',
                                                                              color: '#FFFFFF',
                                                                          }
                                                                        : {}
                                                                }
                                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shrink-0 ${
                                                                    isCurrent ? 'scale-110 ring-2 ring-rose-400 z-20 shadow-xs' : ''
                                                                } ${
                                                                    !isStepDone && !isCurrent
                                                                        ? 'bg-slate-100 text-slate-400 border border-slate-200'
                                                                        : 'shadow-2xs'
                                                                }`}
                                                            >
                                                                {isStepDone ? <Check className="w-3 h-3 stroke-[3]" /> : stepNum}
                                                            </div>

                                                            {/* Step Name / Info Text */}
                                                            <span
                                                                title={st.desc ? `${st.name}: ${st.desc}` : st.name}
                                                                style={
                                                                    isCurrent
                                                                        ? { color: portalPrimaryAccent, fontWeight: 700 }
                                                                        : isStepDone
                                                                        ? { color: '#047857', fontWeight: 600 }
                                                                        : {}
                                                                }
                                                                className={`text-[9px] sm:text-[10px] mt-1.5 leading-tight block text-center truncate max-w-[48px] sm:max-w-[70px] md:max-w-none transition-colors ${
                                                                    !isStepDone && !isCurrent ? 'text-slate-400' : ''
                                                                }`}
                                                            >
                                                                {st.name}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Step Info Summary Footer */}
                                        <div className="bg-slate-50/90 group-hover:bg-[#FBF6F0] rounded-xl px-3 py-2 border border-slate-100/90 group-hover:border-[#F4EBE4] flex flex-wrap items-center justify-between gap-2 text-xs transition-colors duration-300">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span
                                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                                        isCompleted ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
                                                    }`}
                                                />
                                                <div className="truncate text-xs">
                                                    <span className="text-slate-400 text-[10px] mr-1.5 uppercase tracking-wider font-bold">
                                                        {isCompleted ? 'Status:' : 'Tahapan Saat Ini:'}
                                                    </span>
                                                    <strong className="text-slate-900 font-bold text-xs">
                                                        {isCompleted ? 'Project Selesai' : (p.step_label || 'Dalam Proses')}
                                                    </strong>
                                                    {!isCompleted && p.active_step_desc && (
                                                        <span className="text-slate-500 text-[11px] hidden sm:inline ml-1.5">
                                                            — {p.active_step_desc}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 text-xs">
                                                <span className="text-slate-400 text-[10px] mr-1.5 uppercase tracking-wider font-bold">
                                                    {isCompleted ? 'Selesai Pada:' : 'Estimasi Selesai:'}
                                                </span>
                                                <strong className="text-slate-900 font-bold text-xs">
                                                    {isCompleted
                                                        ? (p.completed_date || '-')
                                                        : (p.estimated_done || (p.deadline ? p.deadline : '-'))}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Payment Breakdown & Action Button */}
                                    <div className="w-full lg:w-52 xl:w-56 flex flex-col justify-between pt-3.5 lg:pt-0 lg:pl-5 border-t lg:border-t-0 lg:border-l border-slate-100 space-y-2.5 shrink-0">
                                        <div className="space-y-1.5 text-xs bg-slate-50/60 group-hover:bg-[#FBF6F0]/80 p-2.5 rounded-xl border border-slate-100/90 group-hover:border-[#F4EBE4] transition-colors duration-300">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400 text-[11px]">Total Tagihan</span>
                                                <span className="font-bold text-slate-900 text-xs">{formatRupiah(p.total_amount)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-400 text-[11px]">Dibayar</span>
                                                <span className="font-bold text-emerald-600 text-xs">{formatRupiah(p.paid_amount)}</span>
                                            </div>
                                            {sisaTagihan > 0 ? (
                                                <div className="flex justify-between items-center pt-1 border-t border-slate-200/50">
                                                    <span className="text-slate-400 text-[11px]">Sisa Tagihan</span>
                                                    <span className="font-bold text-rose-600 text-xs">{formatRupiah(sisaTagihan)}</span>
                                                </div>
                                            ) : (
                                                <div className="flex justify-between items-center pt-1 border-t border-slate-200/50">
                                                    <span className="text-slate-400 text-[11px]">Status</span>
                                                    <span className="font-bold text-emerald-600 text-[11px]">Lunas</span>
                                                </div>
                                            )}
                                        </div>

                                        <Link
                                            href={`/client/projects/${p.id}`}
                                            className="w-full py-2.5 px-3 rounded-xl border border-[#E8DDD5] bg-[#F4EBE4] text-[#3C0E0E] hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] font-bold text-xs shadow-2xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer text-center group/btn"
                                        >
                                            <span className="transition-colors">Lihat Detail</span>
                                            <ArrowRight className="w-3.5 h-3.5 text-[#3C0E0E] group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* ── 4. PAGINATION (MATCHING SCREENSHOT 3) ──────────────────── */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-xs text-slate-500">
                    <span>
                        Menampilkan {filteredProjects.length > 0 ? startIndex + 1 : 0} - {endIndex} dari {filteredProjects.length} project
                    </span>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setCurrentPage(1)}
                                disabled={safeCurrentPage === 1}
                                className="w-8 h-8 rounded-lg border border-[#E8DDD5] bg-[#F4EBE4] flex items-center justify-center hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-[#3C0E0E] transition-all"
                            >
                                <ChevronsLeft className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                disabled={safeCurrentPage === 1}
                                className="w-8 h-8 rounded-lg border border-[#E8DDD5] bg-[#F4EBE4] flex items-center justify-center hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-[#3C0E0E] transition-all"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                                const isActive = pageNum === safeCurrentPage;
                                return (
                                    <button
                                        key={pageNum}
                                        type="button"
                                        onClick={() => setCurrentPage(pageNum)}
                                        style={
                                            isActive
                                                ? {
                                                      backgroundColor: portalPrimaryAccent,
                                                      color: '#FFFFFF',
                                                  }
                                                : {}
                                        }
                                        className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-all cursor-pointer ${
                                            isActive ? 'shadow-xs' : 'border border-[#E8DDD5] bg-[#F4EBE4] hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] text-[#3C0E0E]'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                type="button"
                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={safeCurrentPage === totalPages}
                                className="w-8 h-8 rounded-lg border border-[#E8DDD5] bg-[#F4EBE4] flex items-center justify-center hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-[#3C0E0E] transition-all"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={safeCurrentPage === totalPages}
                                className="w-8 h-8 rounded-lg border border-[#E8DDD5] bg-[#F4EBE4] flex items-center justify-center hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-[#3C0E0E] transition-all"
                            >
                                <ChevronsRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </ClientLayout>
    );
}
