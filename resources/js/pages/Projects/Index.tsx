import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    Search,
    Filter,
    Plus,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    Edit3,
    Trash2,
    X,
    FileText,
    ArrowRight,
} from 'lucide-react';
import { formatRupiah, formatDate } from '@/lib/formatters';
import { FormattedNumberInput, AlertConfirmation } from '@/components/ui';

interface ProjectItem {
    id: string | number;
    project_number: string;
    name: string;
    thumbnail?: string;
    client?: { id: string | number; name: string; email?: string; phone?: string };
    category?: { id: string | number; name: string; color?: string };
    package?: { id: string | number; name: string; base_price?: number };
    supervisor?: { id: string | number; name: string; avatar?: string };
    photographer?: { id: string | number; name: string; avatar?: string };
    editor?: { id: string | number; name: string; avatar?: string };
    status: string;
    progress: number;
    workflow_step?: string;
    event_date?: string;
    end_date?: string;
    deadline?: string;
    total_amount: number;
    paid_amount: number;
    payment_status?: string;
    location?: string;
}

interface ProjectsIndexProps {
    projects: {
        data: ProjectItem[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        per_page: number;
    };
    filters: {
        search?: string;
        status?: string;
        category_id?: string;
        supervisor_id?: string;
        tab?: string;
        date?: string;
        per_page?: number;
    };
    categories: Array<{ id: string | number; name: string; color?: string }>;
    clients: Array<{ id: string | number; name: string; email?: string; phone?: string }>;
    packages: Array<{ id: string | number; name: string; base_price: number }>;
    team_members: Array<{ id: string | number; name: string }>;
    supervisors: Array<{ id: string | number; name: string; avatar?: string }>;
    upcoming_deadlines: Array<{
        id: string | number;
        project_number: string;
        name: string;
        deadline?: string;
        formatted_deadline?: string;
        days_remaining?: number;
        category?: { name: string; color?: string };
    }>;
    recent_activities: Array<{
        id: string | number;
        description: string;
        event?: string;
        causer_name?: string;
        created_at?: string;
    }>;
    stats: {
        total: number;
        berlangsung: number;
        selesai: number;
        menunggu: number;
        dibatalkan: number;
        avg_progress: number;
    };
}

export default function ProjectsIndex({
    projects = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0, per_page: 8 },
    filters = {},
    categories = [],
    clients = [],
    packages = [],
    team_members = [],
    supervisors = [],
    upcoming_deadlines = [],
    recent_activities = [],
    stats = { total: 24, berlangsung: 12, selesai: 8, menunggu: 2, dibatalkan: 2, avg_progress: 58 },
}: ProjectsIndexProps) {
    const activeTab = filters?.tab || 'all';
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters?.category_id || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'all');
    const [selectedSupervisor, setSelectedSupervisor] = useState(filters?.supervisor_id || 'all');
    const [selectedDate, setSelectedDate] = useState(filters?.date || '');
    const [activeActionMenu, setActiveActionMenu] = useState<string | number | null>(null);

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id?: string | number; name?: string }>({
        isOpen: false,
    });

    // Form creation state
    const [formData, setFormData] = useState({
        name: '',
        client_id: clients?.[0]?.id || '',
        category_id: categories?.[0]?.id || '',
        package_id: packages?.[0]?.id || '',
        supervisor_id: supervisors?.[0]?.id || '',
        status: 'in_progress',
        event_date: '',
        deadline: '',
        location: '',
        total_amount: 25000000,
        notes: '',
    });

    const statusTabs = [
        { key: 'all', label: 'Semua' },
        { key: 'berlangsung', label: 'Berlangsung' },
        { key: 'selesai', label: 'Selesai' },
        { key: 'ditunda', label: 'Ditunda' },
        { key: 'dibatalkan', label: 'Dibatalkan' },
    ];

    const applyFilters = (newFilters: Record<string, any>) => {
        router.get(
            '/projects',
            {
                tab: activeTab !== 'all' ? activeTab : undefined,
                search: search || undefined,
                category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
                supervisor_id: selectedSupervisor !== 'all' ? selectedSupervisor : undefined,
                date: selectedDate || undefined,
                page: 1,
                ...newFilters,
            },
            { preserveState: true }
        );
    };

    const handleTabChange = (tabKey: string) => {
        router.get(
            '/projects',
            {
                ...filters,
                tab: tabKey !== 'all' ? tabKey : undefined,
                page: 1,
            },
            { preserveState: true }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const handleCreateProject = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/projects', formData, {
            onSuccess: () => {
                setCreateModalOpen(false);
                setFormData({
                    name: '',
                    client_id: clients?.[0]?.id || '',
                    category_id: categories?.[0]?.id || '',
                    package_id: packages?.[0]?.id || '',
                    supervisor_id: supervisors?.[0]?.id || '',
                    status: 'in_progress',
                    event_date: '',
                    deadline: '',
                    location: '',
                    total_amount: 25000000,
                    notes: '',
                });
            },
        });
    };

    const handleDeleteProject = () => {
        if (!confirmDelete.id) return;
        router.delete(`/projects/${confirmDelete.id}`, {
            onSuccess: () => {
                setConfirmDelete({ isOpen: false });
            },
        });
    };

    // Category styling badge
    const getCategoryBadge = (name: string = '') => {
        const cat = name.toLowerCase();
        if (cat.includes('wedding') && !cat.includes('pre')) {
            return { label: 'Wedding', bg: 'bg-purple-100/80 text-purple-700 border-purple-200' };
        }
        if (cat.includes('prewedding')) {
            return { label: 'Prewedding', bg: 'bg-blue-100/80 text-blue-700 border-blue-200' };
        }
        if (cat.includes('newborn') || cat.includes('baby')) {
            return { label: 'Newborn', bg: 'bg-emerald-100/80 text-emerald-700 border-emerald-200' };
        }
        if (cat.includes('event') || cat.includes('gathering')) {
            return { label: 'Event', bg: 'bg-amber-100/80 text-amber-800 border-amber-200' };
        }
        if (cat.includes('family') || cat.includes('keluarga')) {
            return { label: 'Family', bg: 'bg-teal-100/80 text-teal-700 border-teal-200' };
        }
        if (cat.includes('maternity')) {
            return { label: 'Maternity', bg: 'bg-rose-100/80 text-rose-700 border-rose-200' };
        }
        if (cat.includes('travel') || cat.includes('trip')) {
            return { label: 'Traveling', bg: 'bg-sky-100/80 text-sky-700 border-sky-200' };
        }
        if (cat.includes('komunitas') || cat.includes('community')) {
            return { label: 'Komunitas', bg: 'bg-violet-100/80 text-violet-700 border-violet-200' };
        }
        return { label: name || 'Umum', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    };

    // Status Pill
    const getStatusPill = (statusStr: string = '') => {
        const st = statusStr.toLowerCase();
        if (st === 'completed' || st === 'selesai') {
            return {
                label: 'Selesai',
                dotClass: 'bg-emerald-500',
                pillClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
            };
        }
        if (st === 'in_progress' || st === 'editing' || st === 'berlangsung' || st === 'active') {
            return {
                label: 'Berlangsung',
                dotClass: 'bg-amber-500',
                pillClass: 'bg-amber-50 text-amber-700 border border-amber-200/60',
            };
        }
        if (st === 'draft' || st === 'booking' || st === 'menunggu') {
            return {
                label: 'Booking',
                dotClass: 'bg-slate-400',
                pillClass: 'bg-slate-100 text-slate-600 border border-slate-200/60',
            };
        }
        if (st === 'ditunda' || st === 'pending' || st === 'on_hold') {
            return {
                label: 'Ditunda',
                dotClass: 'bg-yellow-500',
                pillClass: 'bg-yellow-50 text-yellow-800 border border-yellow-200/60',
            };
        }
        if (st === 'cancelled' || st === 'dibatalkan') {
            return {
                label: 'Dibatalkan',
                dotClass: 'bg-rose-500',
                pillClass: 'bg-rose-50 text-rose-700 border border-rose-200/60',
            };
        }
        return {
            label: 'Berlangsung',
            dotClass: 'bg-amber-500',
            pillClass: 'bg-amber-50 text-amber-700 border border-amber-200/60',
        };
    };

    // Progress stage text subtitle helper
    const getProgressStageText = (progress: number, step?: string) => {
        if (step && step !== 'booking') {
            return step;
        }
        if (progress === 100) return 'Final Delivery';
        if (progress >= 75) return 'Full Photo & Video Editing';
        if (progress >= 50) return 'Sneak Peek Photo Editing';
        if (progress >= 20) return 'Hari H';
        return 'Booking & DP';
    };

    // Fallback data when DB items are few
    const displayProjects = projects.data || [];
    const totalProjectsCount = projects.total || 0;
    const fromIndex = projects.from || (displayProjects.length > 0 ? 1 : 0);
    const toIndex = projects.to || displayProjects.length;

    // Direct Database Deadlines
    const displayUpcomingDeadlines = upcoming_deadlines || [];

    // Direct Database Recent Activities
    const displayActivities = recent_activities || [];

    // Dynamic Donut & Stats directly from Database
    const statTotal = stats.total || 0;
    const statBerlangsung = stats.berlangsung || 0;
    const statSelesai = stats.selesai || 0;
    const statMenunggu = stats.menunggu || 0;
    const statDibatalkan = stats.dibatalkan || 0;
    const avgProgress = stats.avg_progress || 0;

    const selesaiPct = statTotal > 0 ? Math.round((statSelesai / statTotal) * 100) : 0;
    const berlangsungPct = statTotal > 0 ? Math.round((statBerlangsung / statTotal) * 100) : 0;
    const menungguPct = statTotal > 0 ? Math.round((statMenunggu / statTotal) * 100) : 0;
    const dibatalkanPct = statTotal > 0 ? Math.round((statDibatalkan / statTotal) * 100) : 0;

    return (
        <div className="space-y-5 pb-12">
            <Head title="Projects & Orders - ARAMS PHOTOGRAPHY" />

            {/* ── 1. TOP HEADER & ACTION BUTTONS ─────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                        Projects &amp; Orders
                    </h1>
                    <nav className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
                            Dashboard
                        </Link>
                        <span>›</span>
                        <span className="text-slate-900 font-medium">Projects &amp; Orders</span>
                    </nav>
                </div>

                <div className="flex items-center gap-2.5">
                    <Link
                        href="/projects/create"
                        className="btn-primary-action inline-flex items-center gap-2 px-4 py-2 text-white rounded-xl text-xs font-bold shadow-sm shadow-black/10 transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                        <span>Buat Project Baru</span>
                    </Link>

                    <a
                        href="/settings/export/projects"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                    >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Export</span>
                    </a>
                </div>
            </div>

            {/* ── 2. HORIZONTAL STATUS TABS & TOOLBAR (Matching Calendar Theme) ────────────────────── */}
            <div className="space-y-3">
                {/* Horizontal Status Tabs */}
                <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 overflow-x-auto hide-scrollbar">
                    {statusTabs.map((tab) => {
                        const isActive = activeTab === tab.key;
                        const count =
                            tab.key === 'all'
                                ? (stats.total || displayProjects.length)
                                : tab.key === 'berlangsung'
                                ? statBerlangsung
                                : tab.key === 'selesai'
                                ? statSelesai
                                : tab.key === 'ditunda'
                                ? statMenunggu
                                : statDibatalkan;

                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleTabChange(tab.key)}
                                className={`flex-shrink-0 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                                    isActive
                                        ? 'border-primary-accent text-primary-accent font-bold'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                                        isActive
                                            ? 'badge-primary-accent'
                                            : 'bg-slate-100 text-slate-500'
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Filter Toolbar Controls */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center gap-2 sm:gap-3"
                >
                    {/* Category Filter */}
                    <div className="relative min-w-[130px] sm:min-w-[150px] flex-1 sm:flex-initial">
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                applyFilters({ category_id: e.target.value !== 'all' ? e.target.value : undefined });
                            }}
                            className="w-full pl-3 pr-8 py-1.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium outline-hidden cursor-pointer appearance-none"
                        >
                            <option value="all">Semua Kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <ChevronLeft className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none" />
                    </div>

                    {/* Status Filter */}
                    <div className="relative min-w-[120px] sm:min-w-[140px] flex-1 sm:flex-initial">
                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                applyFilters({ status: e.target.value !== 'all' ? e.target.value : undefined });
                            }}
                            className="w-full pl-3 pr-8 py-1.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium outline-hidden cursor-pointer appearance-none"
                        >
                            <option value="all">Semua Status</option>
                            <option value="berlangsung">Berlangsung</option>
                            <option value="selesai">Selesai</option>
                            <option value="menunggu">Menunggu / Booking</option>
                            <option value="dibatalkan">Dibatalkan</option>
                        </select>
                        <ChevronLeft className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none" />
                    </div>

                    {/* Supervisor Filter */}
                    <div className="relative min-w-[130px] sm:min-w-[150px] flex-1 sm:flex-initial">
                        <select
                            value={selectedSupervisor}
                            onChange={(e) => {
                                setSelectedSupervisor(e.target.value);
                                applyFilters({ supervisor_id: e.target.value !== 'all' ? e.target.value : undefined });
                            }}
                            className="w-full pl-3 pr-8 py-1.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium outline-hidden cursor-pointer appearance-none"
                        >
                            <option value="all">Semua Supervisor</option>
                            {supervisors.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                        <ChevronLeft className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none" />
                    </div>

                    {/* Date Picker Filter */}
                    <div className="relative min-w-[130px] sm:min-w-[140px] flex-1 sm:flex-initial">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                applyFilters({ date: e.target.value || undefined });
                            }}
                            className="w-full pl-3 pr-7 py-1.5 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium outline-hidden cursor-pointer"
                        />
                    </div>

                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[180px]">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari project atau klien..."
                            className="w-full pl-8.5 pr-8 py-1.5 bg-slate-50/80 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-primary-accent rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-hidden transition-all"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    applyFilters({ search: undefined });
                                }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Filter Submit Button */}
                    <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                        <Filter className="w-3.5 h-3.5 text-slate-600" />
                        <span>Filter</span>
                    </button>
                </form>
            </div>

            {/* ── 3. MAIN 2-COLUMN GRID (Table Left 75% + Widgets Right 25%) ─────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
                {/* ── LEFT COLUMN (TABLE + PAGINATION) ─────────────────────────────── */}
                <div className="xl:col-span-8 2xl:col-span-9 space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                        {/* Table for Desktop & Tablet */}
                        <div className="overflow-x-auto scrollbar-thin">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="py-3 px-4 sm:px-5">Project</th>
                                        <th className="py-3 px-3">Klien</th>
                                        <th className="py-3 px-3">Kategori</th>
                                        <th className="py-3 px-3">Nilai Project</th>
                                        <th className="py-3 px-3">Supervisor</th>
                                        <th className="py-3 px-3">Progress</th>
                                        <th className="py-3 px-3">Status</th>
                                        <th className="py-3 px-3">Deadline</th>
                                        <th className="py-3 px-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {displayProjects.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="py-12 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                        <Briefcase className="w-6 h-6" />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-700">Tidak ada project ditemukan</p>
                                                    <p className="text-xs text-slate-400 max-w-xs">
                                                        Coba ubah kata kunci pencarian atau sesuaikan filter di atas.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        displayProjects.map((p) => {
                                            const catBadge = getCategoryBadge(p.category?.name);
                                            const statusPill = getStatusPill(p.status);
                                            const stageText = getProgressStageText(p.progress, p.workflow_step);
                                            const supervisorName = p.supervisor?.name || '-';
                                            const supervisorAvatar =
                                                p.supervisor?.avatar ||
                                                (supervisorName.includes('Rizky')
                                                    ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
                                                    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80');

                                            return (
                                                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                                                    {/* Project Info */}
                                                    <td className="py-3.5 px-4 sm:px-5 min-w-[200px]">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={
                                                                    p.thumbnail ||
                                                                    'https://images.unsplash.com/photo-1519741497674-611481863552?w=100&auto=format&fit=crop&q=80'
                                                                }
                                                                alt={p.name}
                                                                className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0 shadow-2xs"
                                                            />
                                                            <div className="min-w-0">
                                                                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tight block">
                                                                    {p.project_number || `#${p.id}`}
                                                                </span>
                                                                <Link
                                                                    href={`/projects/${p.id}`}
                                                                    className="font-bold text-slate-900 group-hover:text-primary-accent transition-colors block truncate max-w-[180px]"
                                                                >
                                                                    {p.name}
                                                                </Link>
                                                                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                                    <span>{p.event_date ? formatDate(p.event_date) : '-'}</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Klien */}
                                                    <td className="py-3.5 px-3 min-w-[140px]">
                                                        <span className="font-bold text-slate-900 block truncate max-w-[150px]">
                                                            {p.client?.name || '-'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                                            {p.client?.phone || '-'}
                                                        </span>
                                                    </td>

                                                    {/* Kategori */}
                                                    <td className="py-3.5 px-3 whitespace-nowrap">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catBadge.bg}`}>
                                                            {catBadge.label}
                                                        </span>
                                                    </td>

                                                    {/* Nilai Project */}
                                                    <td className="py-3.5 px-3 whitespace-nowrap">
                                                        <span className="font-bold text-slate-900 font-mono">
                                                            {formatRupiah(p.total_amount)}
                                                        </span>
                                                    </td>

                                                    {/* Supervisor */}
                                                    <td className="py-3.5 px-3 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <img
                                                                src={supervisorAvatar}
                                                                alt={supervisorName}
                                                                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                                                            />
                                                            <div>
                                                                <span className="font-bold text-slate-900 block leading-tight text-[11px]">
                                                                    {supervisorName}
                                                                </span>
                                                                <span className="text-[9px] text-slate-400 block leading-tight">
                                                                    Supervisor
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Progress Bar */}
                                                    <td className="py-3.5 px-3 min-w-[140px]">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center justify-between gap-1">
                                                                <span className="text-[11px] font-bold text-slate-900 font-mono">
                                                                    {p.progress}%
                                                                </span>
                                                            </div>
                                                            <span className="text-[9px] text-slate-400 block truncate max-w-[130px] -mt-0.5">
                                                                {stageText}
                                                            </span>
                                                            <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                                        p.progress === 100
                                                                            ? 'bg-emerald-500'
                                                                            : p.progress > 0
                                                                            ? 'bg-primary-accent'
                                                                            : 'bg-slate-300'
                                                                    }`}
                                                                    style={{ width: `${p.progress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Status Pill */}
                                                    <td className="py-3.5 px-3 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${statusPill.pillClass}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${statusPill.dotClass}`} />
                                                            <span>{statusPill.label}</span>
                                                        </span>
                                                    </td>

                                                    {/* Deadline */}
                                                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[11px]">
                                                        <span
                                                            className={
                                                                p.status === 'completed'
                                                                    ? 'text-emerald-600 font-semibold'
                                                                    : 'text-[#E02424] font-bold'
                                                            }
                                                        >
                                                            {p.deadline ? formatDate(p.deadline) : '-'}
                                                        </span>
                                                    </td>

                                                    {/* Aksi Dropdown */}
                                                    <td className="py-3.5 px-3 text-center relative">
                                                        <div className="inline-block text-left">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setActiveActionMenu(activeActionMenu === p.id ? null : p.id)
                                                                }
                                                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                                            >
                                                                <MoreVertical className="w-4 h-4" />
                                                            </button>

                                                            {activeActionMenu === p.id && (
                                                                <>
                                                                    <div
                                                                        className="fixed inset-0 z-20"
                                                                        onClick={() => setActiveActionMenu(null)}
                                                                    />
                                                                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-100 z-30 py-1 text-left animate-in fade-in zoom-in-95 duration-100">
                                                                        <Link
                                                                            href={`/projects/${p.id}`}
                                                                            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                                                                        >
                                                                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                                                                            <span>Lihat Detail</span>
                                                                        </Link>
                                                                        <Link
                                                                            href={`/projects/${p.id}/invoice`}
                                                                            className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#3B46F1] hover:bg-indigo-50 font-medium"
                                                                        >
                                                                            <FileText className="w-3.5 h-3.5 text-[#3B46F1]" />
                                                                            <span>Lihat Invoice</span>
                                                                        </Link>
                                                                        <Link
                                                                            href={`/projects/${p.id}/edit`}
                                                                            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                                                                        >
                                                                            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                                                                            <span>Edit Project</span>
                                                                        </Link>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setActiveActionMenu(null);
                                                                                setConfirmDelete({
                                                                                    isOpen: true,
                                                                                    id: p.id,
                                                                                    name: p.name,
                                                                                });
                                                                            }}
                                                                            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-medium cursor-pointer"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                                                            <span>Hapus</span>
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Bottom Pagination Bar */}
                        <div className="px-5 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                            <div>
                                <span>
                                    Menampilkan {fromIndex} - {toIndex} dari {totalProjectsCount} project
                                </span>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    disabled={projects.current_page <= 1}
                                    onClick={() =>
                                        router.get(
                                            '/projects',
                                            { ...filters, page: projects.current_page - 1 },
                                            { preserveState: true }
                                        )
                                    }
                                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>

                                {[1, 2, 3].map((page) => {
                                    return (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() =>
                                                router.get(
                                                    '/projects',
                                                    { ...filters, page },
                                                    { preserveState: true }
                                                )
                                            }
                                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                page === (projects.current_page || 1)
                                                    ? 'border-2 border-primary-accent text-primary-accent badge-primary-accent font-bold'
                                                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    type="button"
                                    disabled={projects.current_page >= (projects.last_page || 3)}
                                    onClick={() =>
                                        router.get(
                                            '/projects',
                                            { ...filters, page: (projects.current_page || 1) + 1 },
                                            { preserveState: true }
                                        )
                                    }
                                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="relative">
                                <select
                                    value={filters?.per_page || 10}
                                    onChange={(e) =>
                                        router.get(
                                            '/projects',
                                            { ...filters, per_page: e.target.value, page: 1 },
                                            { preserveState: true }
                                        )
                                    }
                                    className="pl-2.5 pr-7 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium outline-hidden cursor-pointer appearance-none"
                                >
                                    <option value="8">8 / halaman</option>
                                    <option value="10">10 / halaman</option>
                                    <option value="20">20 / halaman</option>
                                </select>
                                <ChevronLeft className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 -rotate-90 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN (4 SUMMARY WIDGETS) ─────────────────────────────── */}
                <div className="xl:col-span-4 2xl:col-span-3 space-y-4">
                    {/* ── WIDGET 1: RINGKASAN PROJECT (2x2 GRID) ─────────────────── */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                        <h3 className="font-bold text-slate-900 text-xs tracking-tight">Ringkasan Project</h3>
                        <div className="grid grid-cols-2 gap-2.5">
                            {/* Berlangsung */}
                            <div className="p-3 rounded-xl badge-primary-accent border flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary-accent text-white flex items-center justify-center shrink-0">
                                    <Briefcase className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <span className="text-base font-extrabold text-slate-900 font-mono block leading-none">
                                        {statBerlangsung}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium">Berlangsung</span>
                                </div>
                            </div>

                            {/* Selesai */}
                            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                    <span className="text-base font-extrabold text-slate-900 font-mono block leading-none">
                                        {statSelesai}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium">Selesai</span>
                                </div>
                            </div>

                            {/* Menunggu */}
                            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <span className="text-base font-extrabold text-slate-900 font-mono block leading-none">
                                        {statMenunggu}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium">Menunggu</span>
                                </div>
                            </div>

                            {/* Dibatalkan */}
                            <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                    <XCircle className="w-4 h-4 text-rose-600" />
                                </div>
                                <div>
                                    <span className="text-base font-extrabold text-slate-900 font-mono block leading-none">
                                        {statDibatalkan}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium">Dibatalkan</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── WIDGET 2: PROGRESS KESELURUHAN (DONUT CHART) ────────────── */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                        <h3 className="font-bold text-slate-900 text-xs tracking-tight">Progress Keseluruhan</h3>
                        <div className="flex items-center gap-4">
                            {/* Circular Radial Donut Gauge */}
                            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                                    {/* Background track */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="#F1F5F9"
                                        strokeWidth="9"
                                        fill="none"
                                    />
                                    {/* Green arc (Selesai %) */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="#10B981"
                                        strokeWidth="9"
                                        strokeDasharray="251.2"
                                        strokeDashoffset={251.2 - (251.2 * (selesaiPct || 0)) / 100}
                                        fill="none"
                                        strokeLinecap="round"
                                    />
                                    {/* Dynamic Theme arc (Berlangsung %) */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="var(--primary-accent, #C89445)"
                                        strokeWidth="9"
                                        strokeDasharray="251.2"
                                        strokeDashoffset={251.2 - (251.2 * (berlangsungPct || 0)) / 100}
                                        strokeDashoffset-start="83"
                                        fill="none"
                                        strokeLinecap="round"
                                        className="opacity-90"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-xl font-extrabold text-slate-900 font-mono leading-none">
                                        {avgProgress}%
                                    </span>
                                    <span className="text-[8px] text-slate-400 font-medium leading-tight mt-0.5">
                                        Rata-rata Progress
                                    </span>
                                </div>
                            </div>

                            {/* Legend Breakdown */}
                            <div className="flex-1 space-y-1.5 text-[11px]">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-slate-600">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span>Selesai</span>
                                    </span>
                                    <span className="font-bold text-slate-900 font-mono">{statSelesai} ({selesaiPct}%)</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-slate-600">
                                        <span className="w-2 h-2 rounded-full bg-primary-accent" />
                                        <span>Berlangsung</span>
                                    </span>
                                    <span className="font-bold text-slate-900 font-mono">{statBerlangsung} ({berlangsungPct}%)</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-slate-600">
                                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                                        <span>Menunggu</span>
                                    </span>
                                    <span className="font-bold text-slate-900 font-mono">{statMenunggu} ({menungguPct}%)</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-slate-600">
                                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                                        <span>Dibatalkan</span>
                                    </span>
                                    <span className="font-bold text-slate-900 font-mono">{statDibatalkan} ({dibatalkanPct}%)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── WIDGET 3: PROJECT TERDEKAT DEADLINE ──────────────────────── */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                        <h3 className="font-bold text-slate-900 text-xs tracking-tight">
                            Project Terdekat Deadline
                        </h3>
                        <div className="space-y-2.5">
                            {displayUpcomingDeadlines.length === 0 ? (
                                <div className="py-6 text-center text-slate-400 text-xs">
                                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1.5 text-emerald-500 opacity-80" />
                                    <p className="font-semibold text-slate-600">Semua deadline terkontrol</p>
                                    <p className="text-[10px] text-slate-400">Tidak ada project mendesak saat ini.</p>
                                </div>
                            ) : (
                                displayUpcomingDeadlines.slice(0, 3).map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/projects/${item.id}`}
                                        className="p-2 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 block group"
                                    >
                                        <div className="flex items-start gap-2 min-w-0">
                                            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-[11px] font-bold text-slate-900 group-hover:text-primary-accent transition-colors block truncate">
                                                    {item.project_number || `#${item.id}`}
                                                </span>
                                                <span className="text-[10px] text-slate-500 block truncate">
                                                    {item.name}
                                                </span>
                                                <span className="text-[9px] text-slate-400 block font-mono">
                                                    {item.formatted_deadline || (item.deadline ? formatDate(item.deadline) : '-')}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-[#E02424] shrink-0">
                                            {item.days_remaining !== undefined
                                                ? (item.days_remaining <= 0
                                                    ? 'Hari ini / Lewat'
                                                    : `${item.days_remaining} hari lagi`)
                                                : '-'}
                                        </span>
                                    </Link>
                                ))
                            )}
                        </div>
                        <div className="pt-2 border-t border-slate-100 text-center">
                            <Link
                                href="/projects?tab=berlangsung"
                                className="text-[11px] font-bold text-slate-700 hover:text-primary-accent inline-flex items-center gap-1 transition-colors"
                            >
                                <span>Lihat Semua Deadline</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>

                    {/* ── WIDGET 4: AKTIVITAS TERBARU ─────────────────────────────── */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                        <h3 className="font-bold text-slate-900 text-xs tracking-tight">Aktivitas Terbaru</h3>
                        <div className="space-y-3">
                            {displayActivities.length === 0 ? (
                                <div className="py-6 text-center text-slate-400 text-xs">
                                    <Clock className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                                    <p className="font-semibold text-slate-600">Belum ada aktivitas</p>
                                    <p className="text-[10px] text-slate-400">Log aktivitas terbaru akan muncul di sini.</p>
                                </div>
                            ) : (
                                displayActivities.slice(0, 3).map((act, idx) => (
                                    <div key={act.id} className="flex items-start gap-2.5">
                                        <div
                                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                                idx === 0
                                                    ? 'bg-emerald-100 text-emerald-600'
                                                    : idx === 1
                                                    ? 'badge-primary-accent'
                                                    : 'bg-purple-100 text-purple-600'
                                            }`}
                                        >
                                            {idx === 0 && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            {idx === 1 && <Edit3 className="w-3.5 h-3.5" />}
                                            {idx === 2 && <FileText className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[11px] font-bold text-slate-900 leading-snug">
                                                {act.description}
                                            </p>
                                            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                                oleh {act.causer_name} • {act.created_at}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="pt-2 border-t border-slate-100 text-center">
                            <Link
                                href="/activity-log"
                                className="text-[11px] font-bold text-slate-700 hover:text-primary-accent inline-flex items-center gap-1 transition-colors"
                            >
                                <span>Lihat Semua Aktivitas</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MODAL: BUAT PROJECT BARU ────────────────────────────────────────── */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Buat Project / Work Order Baru</h3>
                                <p className="text-xs text-slate-500">
                                    Pilih klien, kategori, paket fotografi, dan jadwal acara.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setCreateModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProject} className="space-y-4 pt-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Nama Project / Acara *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contoh: Wedding Kevin & Jessica"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Pilih Klien *
                                    </label>
                                    <select
                                        required
                                        value={formData.client_id}
                                        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-[#3B46F1] outline-hidden cursor-pointer"
                                    >
                                        <option value="">Pilih Klien...</option>
                                        {clients.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Kategori *
                                    </label>
                                    <select
                                        required
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-[#3B46F1] outline-hidden cursor-pointer"
                                    >
                                        <option value="">Pilih Kategori...</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Paket Fotografi
                                    </label>
                                    <select
                                        value={formData.package_id}
                                        onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-[#3B46F1] outline-hidden cursor-pointer"
                                    >
                                        <option value="">Pilih Paket...</option>
                                        {packages.map((pkg) => (
                                            <option key={pkg.id} value={pkg.id}>
                                                {pkg.name} ({formatRupiah(pkg.base_price)})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Supervisor Penanggung Jawab
                                    </label>
                                    <select
                                        value={formData.supervisor_id}
                                        onChange={(e) => setFormData({ ...formData, supervisor_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-[#3B46F1] outline-hidden cursor-pointer"
                                    >
                                        <option value="">Pilih Supervisor...</option>
                                        {supervisors.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Total Nilai Project (Rp) *
                                    </label>
                                    <FormattedNumberInput
                                        prefix="Rp"
                                        placeholder="Contoh: 25.000.000"
                                        value={formData.total_amount}
                                        onChange={(val) => setFormData({ ...formData, total_amount: val })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Tanggal Acara
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.event_date}
                                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#3B46F1] outline-hidden"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Deadline Penyerahan
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#3B46F1] outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Lokasi Acara
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Contoh: The Westin Grand Ballroom"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#3B46F1] outline-hidden"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-[#3B46F1] hover:bg-[#323CD4] text-white text-xs font-bold shadow-md shadow-[#3B46F1]/20 transition-all cursor-pointer"
                                >
                                    Simpan &amp; Buat Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Delete Dialog */}
            <AlertConfirmation
                isOpen={confirmDelete.isOpen}
                title="Hapus Project?"
                description={`Apakah Anda yakin ingin menghapus project "${confirmDelete.name}"? Data project yang dihapus dapat dipulihkan dari tempat sampah.`}
                confirmText="Hapus Project"
                cancelText="Batal"
                variant="danger"
                onConfirm={handleDeleteProject}
                onClose={() => setConfirmDelete({ isOpen: false })}
            />
        </div>
    );
}
