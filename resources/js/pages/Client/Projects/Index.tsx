import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ClientLayout } from '@/layouts/ClientLayout';
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
    completed_date?: string;
    estimated_done?: string;
}

interface ClientProjectsProps {
    projects: ProjectItem[];
}

export default function ClientProjects({ projects = [] }: ClientProjectsProps) {
    const { props: pageProps } = usePage<any>();
    const appSettings = pageProps?.appSettings || {};

    // Dynamic portal tokens
    const portalPrimaryAccent = appSettings.portal_primary_accent || '#4A151B';
    const portalHeroBg = appSettings.portal_hero_bg || '#240B10';
    const portalHeroGradient = appSettings.portal_hero_gradient || '';
    const portalHeroText = appSettings.portal_hero_text_color || '#FFFFFF';
    const portalCardBg = appSettings.portal_card_bg || '#FFFFFF';
    const portalCardBorder = appSettings.portal_card_border || 'rgba(226, 232, 240, 0.8)';
    const portalHeadingColor = appSettings.portal_heading_color || '#240B10';
    const portalFontHeading = appSettings.portal_font_heading || 'Plus Jakarta Sans';
    const portalFooterText = appSettings.portal_footer_text || '#FDA4AF';

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

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

    return (
        <ClientLayout>
            <Head title="Project Saya - Arams Pictures" />

            <div className="space-y-6">
                {/* ── 1. HERO BANNER (MATCHING SCREENSHOT 3) ────────────────── */}
                <div
                    style={{
                        background: portalHeroGradient || portalHeroBg,
                        color: portalHeroText,
                        borderColor: portalCardBorder,
                    }}
                    className="relative rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg overflow-hidden border flex flex-col md:flex-row items-center justify-between gap-6 transition-colors"
                >
                    {/* Background Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/images/wedding-couple.jpg"
                            alt="Arams Pictures"
                            className="w-full h-full object-cover opacity-20 filter brightness-90"
                        />
                        <div
                            style={{
                                background: `linear-gradient(to right, ${portalHeroBg} 0%, ${portalHeroBg}e6 60%, transparent 100%)`,
                            }}
                            className="absolute inset-0"
                        />
                    </div>

                    {/* Left Title */}
                    <div className="relative z-10 space-y-2 max-w-xl">
                        <h1
                            style={{
                                fontFamily: `'${portalFontHeading}', serif`,
                                color: portalHeroText,
                            }}
                            className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight leading-tight"
                        >
                            Project Saya
                        </h1>
                        <p className="text-xs sm:text-sm opacity-85 leading-relaxed max-w-md">
                            Berikut adalah daftar project yang telah dan sedang Anda kerjakan bersama Arams Pictures.
                        </p>
                    </div>

                    {/* Right Illustration Thumbnail */}
                    <div className="relative z-10 hidden md:block w-48 lg:w-56 h-32 rounded-2xl overflow-hidden shadow-md border border-white/20 shrink-0">
                        <img
                            src="/images/wedding-couple.jpg"
                            alt="Wedding Couple"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* ── 2. FILTER & SEARCH TOOLBAR (MATCHING SCREENSHOT 3) ─────── */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
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
                                    onClick={() => setStatusFilter(tab.id)}
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
                                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
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
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari project..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-hidden text-slate-900 placeholder:text-slate-400 transition-colors shadow-2xs"
                            />
                        </div>

                        <button
                            type="button"
                            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                            <span>Filter</span>
                            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* ── 3. PROJECT LIST CARDS (MATCHING SCREENSHOT 3) ──────────── */}
                <div className="space-y-4">
                    {filteredProjects.length === 0 ? (
                        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-2xs">
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
                        filteredProjects.map((p) => {
                            const isWedding = (p.total_steps || 5) === 8 || p.category_name.toLowerCase().includes('wedding');
                            const totalSteps = isWedding ? 8 : 5;
                            const activeStep = p.current_step || (p.status === 'completed' ? totalSteps : 3);
                            const isCompleted = p.status === 'completed' || p.workflow_step === 'selesai';
                            const sisaTagihan = (p.total_amount || 0) - (p.paid_amount || 0);

                            return (
                                <div
                                    key={p.id}
                                style={{
                                    backgroundColor: portalCardBg,
                                    borderColor: portalCardBorder,
                                }}
                                className="rounded-3xl border p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all flex flex-col lg:flex-row gap-6 items-stretch"
                            >
                                {/* Left Thumbnail with Badge */}
                                <div className="relative w-full lg:w-56 h-44 sm:h-48 lg:h-auto rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-2xs">
                                    <img
                                        src={p.thumbnail || '/images/wedding-couple.jpg'}
                                        alt={p.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute bottom-2.5 left-2.5">
                                        <span
                                            style={
                                                !isCompleted
                                                    ? {
                                                          backgroundColor: `${portalPrimaryAccent}15`,
                                                          color: portalPrimaryAccent,
                                                          borderColor: `${portalPrimaryAccent}35`,
                                                      }
                                                    : {}
                                            }
                                            className={`px-3 py-1 rounded-lg text-[10px] font-bold shadow-xs border ${
                                                isCompleted
                                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                                    : ''
                                            }`}
                                        >
                                            {isCompleted ? 'Selesai' : 'Dalam Proses'}
                                        </span>
                                    </div>
                                </div>

                                {/* Center: Title, Stepper, Status */}
                                <div className="flex-1 flex flex-col justify-between space-y-4">
                                    <div className="space-y-1">
                                        <h3
                                            style={{
                                                color: portalHeadingColor,
                                                fontFamily: `'${portalFontHeading}', serif`,
                                            }}
                                            className="font-serif font-black text-xl leading-tight"
                                        >
                                            {p.name}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{p.event_date || '12 Desember 2026'}</span>
                                            </div>
                                            <span>•</span>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{p.location || 'Studio Arams Pictures'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Horizontal Stepper Line */}
                                    <div className="pt-2 pb-2">
                                        <div className="flex items-center justify-between relative">
                                            {/* Background Line */}
                                            <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-0" />
                                            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => {
                                                const isStepDone = isCompleted || stepNum < activeStep;
                                                const isCurrent = !isCompleted && stepNum === activeStep;
                                                return (
                                                    <div
                                                        key={stepNum}
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
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold relative z-10 transition-all ${
                                                            isCurrent ? 'scale-110 ring-2 ring-rose-400 z-20' : ''
                                                        } ${
                                                            !isStepDone && !isCurrent
                                                                ? 'bg-slate-100 text-slate-400 border border-slate-200'
                                                                : 'shadow-2xs'
                                                        }`}
                                                    >
                                                        {isStepDone ? <Check className="w-3 h-3 stroke-[3]" /> : stepNum}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Step Label Info Footer */}
                                    <div className="text-xs">
                                        {isCompleted ? (
                                            <p className="text-slate-500">
                                                Selesai pada <strong className="text-slate-900 font-bold">{p.completed_date || '30 Mei 2025'}</strong>
                                            </p>
                                        ) : (
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div>
                                                    <span className="text-slate-400 block text-[10px]">Tahapan Saat Ini</span>
                                                    <strong className="text-slate-900 font-bold text-xs">{p.step_label || 'Preview Foto'}</strong>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-slate-400 block text-[10px]">Estimasi Selesai</span>
                                                    <strong className="text-slate-900 font-bold text-xs">{p.estimated_done || '05 Juni 2026'}</strong>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Payment Breakdown & Action Button */}
                                <div className="w-full lg:w-64 flex flex-col justify-between pt-4 lg:pt-0 lg:pl-6 border-t lg:border-t-0 lg:border-l border-slate-100 space-y-3">
                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 text-[11px]">Total Pembayaran</span>
                                            <span className="font-bold text-slate-900">{formatRupiah(p.total_amount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400 text-[11px]">Dibayar</span>
                                            <span className="font-bold text-emerald-600">{formatRupiah(p.paid_amount)}</span>
                                        </div>
                                        {sisaTagihan > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 text-[11px]">Sisa Tagihan</span>
                                                <span className="font-bold text-rose-600">{formatRupiah(sisaTagihan)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <Link
                                        href={`/client/projects/${p.id}`}
                                        style={{ color: portalPrimaryAccent }}
                                        className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                                    >
                                        <span>Lihat Detail</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        );
                    }))}
                </div>

                {/* ── 4. PAGINATION (MATCHING SCREENSHOT 3) ──────────────────── */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-xs text-slate-500">
                    <span>
                        Menampilkan {filteredProjects.length > 0 ? 1 : 0} - {filteredProjects.length} dari {projects.length} project
                    </span>
                    <div className="flex items-center gap-1">
                        <button className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 cursor-pointer text-slate-400">
                            <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 cursor-pointer text-slate-400">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            style={{
                                backgroundColor: portalPrimaryAccent,
                                color: '#FFFFFF',
                            }}
                            className="w-8 h-8 rounded-lg font-bold flex items-center justify-center shadow-xs cursor-pointer"
                        >
                            1
                        </button>
                        <button className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 cursor-pointer text-slate-400">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 cursor-pointer text-slate-400">
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
