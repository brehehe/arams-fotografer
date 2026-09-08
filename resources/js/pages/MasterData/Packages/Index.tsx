import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Box,
    CheckCircle2,
    MinusCircle,
    Tag,
    Plus,
    Search,
    Download,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    X,
    RotateCcw,
    Eye,
    MoreVertical,
    Clock,
    Sparkles,
    Check,
    Layers,
    Camera,
    Video,
    Film,
    GitBranch,
    Folder,
    Info,
} from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';

interface PackageItem {
    id: number | string;
    name: string;
    category_id?: number | string;
    category?: { id: number | string; name: string; color?: string; workflow_type?: string };
    package_type?: string;
    base_price?: number;
    price?: number;
    duration_hours?: number;
    description?: string;
    status?: string;
    included_services?: string[];
    included_deliverables?: Array<{
        id?: string | number;
        name: string;
        type?: string;
        description?: string;
        deadline?: string;
        required?: boolean;
        by_owner?: boolean;
    }>;
    projects_count?: number;
}

interface Stats {
    total?: number;
    active?: number;
    inactive?: number;
    total_categories?: number;
}

interface CategoryOption {
    id: number | string;
    name: string;
    color?: string;
    workflow_type?: string;
}

interface PackagesIndexProps {
    packages?: {
        data: PackageItem[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        per_page?: number;
        links?: Array<{ url: string | null; label: string; active: boolean }>;
    };
    categories?: CategoryOption[];
    stats?: Stats;
    filters?: {
        search?: string;
        category_id?: string;
        status?: string;
        per_page?: number;
    };
}

export default function PackagesIndex({
    packages = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0, links: [] },
    categories = [],
    stats = { total: 0, active: 0, inactive: 0, total_categories: 0 },
    filters = {},
}: PackagesIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_id || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);

    // Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<PackageItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [form, setForm] = useState<{
        category_id: string;
        name: string;
        description: string;
        base_price: number;
        duration_hours: number;
        status: string;
        included_services: string[];
    }>({
        category_id: categories?.[0]?.id ? String(categories[0].id) : '',
        name: '',
        description: '',
        base_price: 10000000,
        duration_hours: 8,
        status: 'active',
        included_services: ['Studio Photographer'],
    });
    const [newServiceInput, setNewServiceInput] = useState('');

    const packageList = packages.data || [];

    const applyFilters = (newParams: Record<string, any> = {}) => {
        router.get(
            '/master-data/packages',
            {
                search: newParams.search !== undefined ? newParams.search : searchQuery || undefined,
                category_id: (newParams.category_id !== undefined ? newParams.category_id : selectedCategory) !== 'all' ? (newParams.category_id || selectedCategory) : undefined,
                status: (newParams.status !== undefined ? newParams.status : selectedStatus) !== 'all' ? (newParams.status || selectedStatus) : undefined,
                per_page: newParams.per_page !== undefined ? newParams.per_page : perPage,
                page: newParams.page || 1,
            },
            { preserveState: true }
        );
    };

    const handleCategoryFilterChange = (val: string) => {
        setSelectedCategory(val);
        applyFilters({ category_id: val, page: 1 });
    };

    const handleStatusFilterChange = (val: string) => {
        setSelectedStatus(val);
        applyFilters({ status: val, page: 1 });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search: searchQuery, page: 1 });
    };

    const handlePageChange = (newPage: number) => {
        applyFilters({ page: newPage });
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        applyFilters({ per_page: newPerPage, page: 1 });
    };

    const handleReset = () => {
        setSelectedCategory('all');
        setSelectedStatus('all');
        setSearchQuery('');
        router.get('/master-data/packages', {}, { preserveState: true });
    };

    const handleOpenCreate = () => {
        setEditItem(null);
        setNewServiceInput('');
        setForm({
            category_id: categories?.[0]?.id ? String(categories[0].id) : '',
            name: '',
            description: '',
            base_price: 10000000,
            duration_hours: 8,
            status: 'active',
            included_services: ['Studio Photographer'],
        });
        setIsCreateModalOpen(true);
    };

    const handleOpenEdit = (pkg: PackageItem) => {
        setEditItem(pkg);
        setNewServiceInput('');
        setForm({
            category_id: pkg.category_id ? String(pkg.category_id) : (categories?.[0]?.id ? String(categories[0].id) : ''),
            name: pkg.name,
            description: pkg.description || '',
            base_price: Number(pkg.base_price || pkg.price || 10000000),
            duration_hours: Number(pkg.duration_hours || 8),
            status: pkg.status || 'active',
            included_services: Array.isArray(pkg.included_services) ? pkg.included_services : [],
        });
        setIsCreateModalOpen(true);
    };

    const handleAddService = () => {
        const trimmed = newServiceInput.trim();
        if (!trimmed) return;
        if (!form.included_services.includes(trimmed)) {
            setForm({
                ...form,
                included_services: [...form.included_services, trimmed],
            });
        }
        setNewServiceInput('');
    };

    const handleRemoveService = (serviceToRemove: string) => {
        setForm({
            ...form,
            included_services: form.included_services.filter((s) => s !== serviceToRemove),
        });
    };

    const handleSavePackage = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            category_id: form.category_id,
            name: form.name,
            description: form.description,
            base_price: Number(form.base_price),
            duration_hours: Number(form.duration_hours),
            status: form.status,
            included_services: form.included_services,
        };

        if (editItem) {
            router.put(`/master-data/packages/${editItem.id}`, payload, {
                onSuccess: () => {
                    toast.success(`Paket "${form.name}" berhasil diperbarui!`);
                    setIsCreateModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: (errs) => {
                    toast.error('Gagal memperbarui: ' + Object.values(errs).join(', '));
                    setIsSubmitting(false);
                },
            });
        } else {
            router.post('/master-data/packages', payload, {
                onSuccess: () => {
                    toast.success(`Paket "${form.name}" berhasil ditambahkan!`);
                    setIsCreateModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: (errs) => {
                    toast.error('Gagal menambah: ' + Object.values(errs).join(', '));
                    setIsSubmitting(false);
                },
            });
        }
    };

    const handleDeletePackage = (pkg: PackageItem) => {
        if (confirm(`Yakin ingin menghapus paket "${pkg.name}"?`)) {
            router.delete(`/master-data/packages/${pkg.id}`, {
                onSuccess: () => toast.success(`Paket "${pkg.name}" berhasil dihapus!`),
                onError: (errs) => toast.error('Gagal menghapus: ' + Object.values(errs).join(', ')),
            });
        }
    };

    // Category Badge Helper
    const getCategoryBadgeClass = (categoryName: string) => {
        switch (categoryName) {
            case 'Wedding':
                return 'bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100';
            case 'International Wedding':
                return 'bg-[#E0F2FE] text-[#0284C7] border border-sky-200';
            case 'Prewedding':
                return 'bg-[#FDF2F8] text-[#DB2777] border border-pink-100';
            case 'Engagement / Event':
            case 'Event':
                return 'bg-[#FFF7ED] text-[#EA580C] border border-orange-100';
            case 'Photo Only':
            case 'Video Only':
                return 'bg-[#ECFEFF] text-[#0891B2] border border-cyan-100';
            case 'Bundling':
                return 'bg-[#FFFBEB] text-[#D97706] border border-amber-100';
            default:
                return 'bg-slate-100 text-slate-700 border border-slate-200';
        }
    };

    // Export CSV
    const handleExport = () => {
        const rows = [
            ['No', 'Nama Paket', 'Kategori', 'Harga', 'Durasi (Jam)', 'Deliverables', 'Status'],
            ...packageList.map((p, i) => [
                i + 1,
                p.name,
                p.category?.name || 'Umum',
                p.base_price || p.price || 0,
                p.duration_hours || 8,
                p.included_deliverables?.length || 0,
                p.status === 'active' ? 'Aktif' : 'Nonaktif',
            ]),
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Master_Paket_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full max-w-full space-y-6 pb-20">
            <Head title="Paket & Harga - Master Data" />

            {/* ── 1. HEADER TITLE & ACTIONS ────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Paket &amp; Harga</h1>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        Kelola semua paket, harga layanan, dan konfigurasi deliverables yang terhubung otomatis ke Project.
                    </p>
                </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/master-data/workflows"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                        >
                            <GitBranch className="w-4 h-4 text-indigo-600" />
                            <span>Atur Workflow Deliverables</span>
                        </Link>
                        <button
                            type="button"
                            onClick={handleOpenCreate}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Paket</span>
                        </button>
                    </div>
                </div>

            {/* ── 2. TOP 4 STAT CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
                        <Box className="w-6 h-6 text-[#4F46E5]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Total Paket</span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                            {stats.total ?? packageList.length}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Paket terdaftar</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Paket Aktif</span>
                        <h2 className="text-2xl font-black text-[#059669] tracking-tight font-sans">
                            {stats.active ?? 0}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Bisa dipilih saat buat project</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] flex items-center justify-center shrink-0">
                        <MinusCircle className="w-6 h-6 text-[#EF4444]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Paket Nonaktif</span>
                        <h2 className="text-2xl font-black text-[#DC2626] tracking-tight font-sans">
                            {stats.inactive ?? 0}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Dinonaktifkan</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] flex items-center justify-center shrink-0">
                        <Folder className="w-6 h-6 text-[#D97706]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Kategori Terkait</span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                            {stats.total_categories ?? categories.length}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Kategori aktif</p>
                    </div>
                </div>
            </div>

            {/* ── 3. FILTER TOOLBAR ──────────────────────── */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2.5 flex-wrap flex-1">
                    {/* Search Input */}
                    <div className="relative min-w-[220px] max-w-sm flex-1">
                        <input
                            type="text"
                            placeholder="Cari nama paket..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-3.5 pr-9 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Filter Kategori */}
                    <div className="relative min-w-[160px]">
                        <select
                            value={selectedCategory}
                            onChange={(e) => handleCategoryFilterChange(e.target.value)}
                            className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                        >
                            <option value="all">Semua Kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Filter Status */}
                    <div className="relative min-w-[130px]">
                        <select
                            value={selectedStatus}
                            onChange={(e) => handleStatusFilterChange(e.target.value)}
                            className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                        >
                            <option value="all">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Nonaktif</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Reset Button */}
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reset</span>
                    </button>
                </form>

                <button
                    type="button"
                    onClick={handleExport}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50/70 transition-all cursor-pointer shadow-2xs"
                >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Export CSV</span>
                </button>
            </div>

            {/* ── 4. MAIN TABLE CARD ────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/40 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                <th className="py-3 px-5 w-12">NO</th>
                                <th className="py-3 px-5">PAKET</th>
                                <th className="py-3 px-5">KATEGORI</th>
                                <th className="py-3 px-5">HARGA</th>
                                <th className="py-3 px-5">DURASI</th>
                                <th className="py-3 px-5">DELIVERABLES (WORKFLOW)</th>
                                <th className="py-3 px-5 text-center">PROJECTS</th>
                                <th className="py-3 px-5 text-center">STATUS</th>
                                <th className="py-3 px-5 text-center w-28">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-800">
                            {packageList.length > 0 ? (
                                packageList.map((pkg, idx) => {
                                    const catName = pkg.category?.name || 'Umum';
                                    const deliverableCount = pkg.included_deliverables?.length || 0;
                                    const price = pkg.base_price || pkg.price || 0;
                                    const isActive = pkg.status === 'active';

                                    return (
                                        <tr key={pkg.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3.5 px-5 font-bold text-slate-400">
                                                {((packages.current_page || 1) - 1) * 10 + idx + 1}
                                            </td>

                                            {/* Nama Paket */}
                                            <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                                                        <Box className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-slate-900 block">{pkg.name}</span>
                                                        {pkg.description && (
                                                            <span className="text-[10.5px] text-slate-400 font-normal block max-w-xs truncate" title={pkg.description}>
                                                                {pkg.description}
                                                            </span>
                                                        )}
                                                        {pkg.included_services && Array.isArray(pkg.included_services) && pkg.included_services.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {pkg.included_services.map((srv: string, sIdx: number) => (
                                                                    <span key={sIdx} className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9.5px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                                                                        {srv}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Kategori Badge */}
                                            <td className="py-3.5 px-5 whitespace-nowrap">
                                                <Link
                                                    href={`/master-data/categories`}
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-semibold hover:opacity-80 transition-opacity ${getCategoryBadgeClass(
                                                        catName
                                                    )}`}
                                                >
                                                    {catName}
                                                </Link>
                                            </td>

                                            {/* Harga */}
                                            <td className="py-3.5 px-5 font-bold text-slate-900 whitespace-nowrap font-mono">
                                                {formatRupiah(price)}
                                            </td>

                                            {/* Durasi */}
                                            <td className="py-3.5 px-5 text-slate-600 font-medium whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{pkg.duration_hours || 8} Jam</span>
                                                </div>
                                            </td>

                                            {/* Deliverables / Workflows */}
                                            <td className="py-3.5 px-5 whitespace-nowrap">
                                                <Link
                                                    href={`/master-data/workflows`}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 text-[#3B46F1] font-bold text-[11px] transition-colors border border-indigo-100"
                                                    title="Atur deliverables dan turnaround di Workflows"
                                                >
                                                    <GitBranch className="w-3 h-3 text-indigo-500" />
                                                    <span>{deliverableCount > 0 ? `${deliverableCount} Deliverables` : 'Atur Timeline'}</span>
                                                </Link>
                                            </td>

                                            {/* Projects Count */}
                                            <td className="py-3.5 px-5 text-center font-bold text-slate-800">
                                                {pkg.projects_count ?? 0}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-3.5 px-5 text-center whitespace-nowrap">
                                                {isActive ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-emerald-100">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-rose-100">
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </td>

                                            {/* Aksi */}
                                            <td className="py-3.5 px-5 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(pkg)}
                                                        className="w-8 h-8 rounded-lg border border-slate-200 hover:border-indigo-300 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-colors cursor-pointer"
                                                        title="Edit Paket"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeletePackage(pkg)}
                                                        className="w-8 h-8 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
                                                        title="Hapus Paket"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-slate-400">
                                        <Box className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-xs font-semibold text-slate-600">Tidak ada paket yang sesuai.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination */}
                <Pagination
                    currentPage={packages.current_page || 1}
                    lastPage={packages.last_page || 1}
                    total={packages.total || packageList.length}
                    from={packages.from}
                    to={packages.to}
                    perPage={perPage}
                    itemLabel="paket"
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
            </div>

            {/* ── 5. MODAL: TAMBAH / EDIT PAKET ── */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-base font-black text-slate-900">
                                {editItem ? 'Edit Paket' : 'Tambah Paket Baru'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSavePackage} className="space-y-3.5 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Kategori Project <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={form.category_id}
                                        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                    >
                                        <option value="" disabled>Pilih Kategori</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Nama Paket <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Contoh: Wedding Diamond, Prewedding Gold"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Harga Paket (Rp) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="100000"
                                        value={form.base_price}
                                        onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Durasi Kerja (Jam) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={form.duration_hours}
                                        onChange={(e) => setForm({ ...form, duration_hours: Number(e.target.value) })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                                <textarea
                                    rows={2}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Keterangan mengenai cakupan paket ini..."
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                                />
                            </div>

                            {/* Layanan Termasuk (Included Services) */}
                            <div className="space-y-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <label className="block font-bold text-slate-800">
                                        Layanan Termasuk (Included Services)
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {form.included_services.length} Layanan Ditambahkan
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-tight">
                                    Daftar kru dan fasilitas tim yang disertakan dalam paket ini (misal: Studio Photographer, 2 Main Photographers, 1 Videographer, MUA &amp; Hairdo).
                                </p>

                                {/* Input + Add Button */}
                                <div className="flex items-center gap-1.5 pt-1">
                                    <input
                                        type="text"
                                        value={newServiceInput}
                                        onChange={(e) => setNewServiceInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddService();
                                            }
                                        }}
                                        placeholder="Ketik layanan (contoh: Studio Photographer)..."
                                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddService}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambah</span>
                                    </button>
                                </div>

                                {/* Quick Presets */}
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {[
                                        'Studio Photographer',
                                        '1 Main Photographer',
                                        '2 Main Photographers',
                                        '1 Videographer',
                                        '2 Videographers',
                                        'Drone Pilot',
                                        'MUA & Hairdo',
                                        'Lighting Specialist',
                                        'Baby Handler Assistant',
                                        'Live Photo Booth Stream',
                                    ].map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => {
                                                if (!form.included_services.includes(preset)) {
                                                    setForm({
                                                        ...form,
                                                        included_services: [...form.included_services, preset],
                                                    });
                                                }
                                            }}
                                            className={`text-[9px] font-medium px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                                form.included_services.includes(preset)
                                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                            + {preset}
                                        </button>
                                    ))}
                                </div>

                                {/* Active Selected Services Chips */}
                                <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-200/60">
                                    {form.included_services.length === 0 ? (
                                        <span className="text-[11px] text-slate-400 italic">
                                            Belum ada layanan yang ditambahkan.
                                        </span>
                                    ) : (
                                        form.included_services.map((service, sIdx) => (
                                            <span
                                                key={sIdx}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs"
                                            >
                                                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                                <span>{service}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveService(service)}
                                                    className="p-0.5 rounded hover:bg-emerald-200/60 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                                                    title="Hapus Layanan"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Status</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                >
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Nonaktif</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Paket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
