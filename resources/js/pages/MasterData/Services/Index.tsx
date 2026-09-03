import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import {
    Box,
    CheckCircle2,
    MinusCircle,
    Plus,
    Search,
    Download,
    Edit2,
    Trash2,
    ChevronRight,
    ChevronDown,
    X,
    Camera,
    Video,
    BookOpen,
    Layers,
    Tag,
    Folder,
} from 'lucide-react';

interface ServiceItem {
    id: number | string;
    name: string;
    description?: string;
    category_id?: number | string;
    category?: { id: number | string; name: string; color?: string };
    status?: string;
    projects_count?: number;
    used_count?: number;
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
}

interface ServicesIndexProps {
    services?: {
        data: ServiceItem[];
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

// Custom icon for Drone/Air
function DroneIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <circle cx="12" cy="12" r="3" />
            <path d="M4.93 4.93l4.24 4.24m5.66 5.66l4.24 4.24M19.07 4.93l-4.24 4.24m-5.66 5.66l-4.24 4.24" />
            <circle cx="4" cy="4" r="2" />
            <circle cx="20" cy="4" r="2" />
            <circle cx="4" cy="20" r="2" />
            <circle cx="20" cy="20" r="2" />
        </svg>
    );
}

const SERVICE_ICONS: Record<string, React.ReactNode> = {
    Photography: <Camera className="w-4 h-4 text-indigo-600" />,
    Fotografi: <Camera className="w-4 h-4 text-indigo-600" />,
    Videography: <Video className="w-4 h-4 text-indigo-600" />,
    'Videografi Cinematic': <Video className="w-4 h-4 text-indigo-600" />,
    'Photography + Videography': (
        <div className="flex items-center -space-x-1">
            <Camera className="w-3.5 h-3.5 text-indigo-600" />
            <Video className="w-3.5 h-3.5 text-indigo-600" />
        </div>
    ),
    Album: <BookOpen className="w-4 h-4 text-indigo-600" />,
    'Cetak Album': <BookOpen className="w-4 h-4 text-indigo-600" />,
    Drone: <DroneIcon className="w-4 h-4 text-indigo-600" />,
};

export default function ServicesIndex({
    services = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0, links: [] },
    categories = [],
    stats = { total: 0, active: 0, inactive: 0, total_categories: 0 },
    filters = {},
}: ServicesIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category_id || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<ServiceItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [form, setForm] = useState({
        name: '',
        category_id: categories?.[0]?.id || '',
        description: '',
        status: 'active',
    });

    const serviceList = services.data || [];


    const handleOpenCreate = () => {
        setEditItem(null);
        setForm({
            name: '',
            category_id: categories?.[0]?.id || '',
            description: '',
            status: 'active',
        });
        setModalOpen(true);
    };

    const handleOpenEdit = (item: ServiceItem) => {
        setEditItem(item);
        setForm({
            name: item.name,
            category_id: item.category_id || categories?.[0]?.id || '',
            description: item.description || '',
            status: item.status || 'active',
        });
        setModalOpen(true);
    };

    const applyFilters = (newParams: Record<string, any> = {}) => {
        router.get(
            '/master-data/services',
            {
                search: newParams.search !== undefined ? newParams.search : searchQuery || undefined,
                category_id: (newParams.category_id !== undefined ? newParams.category_id : categoryFilter) !== 'all' ? (newParams.category_id || categoryFilter) : undefined,
                status: (newParams.status !== undefined ? newParams.status : statusFilter) !== 'all' ? (newParams.status || statusFilter) : undefined,
                per_page: newParams.per_page !== undefined ? newParams.per_page : perPage,
                page: newParams.page || 1,
            },
            { preserveState: true }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search: searchQuery, page: 1 });
    };

    const handleCategoryFilterChange = (val: string) => {
        setCategoryFilter(val);
        applyFilters({ category_id: val, page: 1 });
    };

    const handleStatusFilterChange = (val: string) => {
        setStatusFilter(val);
        applyFilters({ status: val, page: 1 });
    };

    const handlePageChange = (newPage: number) => {
        applyFilters({ page: newPage });
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        applyFilters({ per_page: newPerPage, page: 1 });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (editItem) {
            router.put(`/master-data/services/${editItem.id}`, form, {
                onSuccess: () => {
                    toast.success(`Layanan "${form.name}" berhasil diperbarui!`);
                    setModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: (errs) => {
                    toast.error('Gagal memperbarui: ' + Object.values(errs).join(', '));
                    setIsSubmitting(false);
                },
            });
        } else {
            router.post('/master-data/services', form, {
                onSuccess: () => {
                    toast.success(`Layanan "${form.name}" berhasil ditambahkan!`);
                    setModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: (errs) => {
                    toast.error('Gagal menambah: ' + Object.values(errs).join(', '));
                    setIsSubmitting(false);
                },
            });
        }
    };

    const handleDelete = (srv: ServiceItem) => {
        if (confirm(`Yakin ingin menghapus jenis layanan "${srv.name}"?`)) {
            router.delete(`/master-data/services/${srv.id}`, {
                onSuccess: () => toast.success(`Layanan "${srv.name}" berhasil dihapus!`),
                onError: (errs) => toast.error('Gagal menghapus: ' + Object.values(errs).join(', ')),
            });
        }
    };

    // Export CSV
    const handleExport = () => {
        const rows = [
            ['No', 'Nama Layanan', 'Kategori', 'Deskripsi', 'Status'],
            ...serviceList.map((s, i) => [
                i + 1,
                s.name,
                s.category?.name || 'Umum',
                s.description || '-',
                s.status === 'active' ? 'Aktif' : 'Nonaktif',
            ]),
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Layanan_Master_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full max-w-full space-y-6 pb-20">
            <Head title="Jenis Layanan - Master Data" />

            {/* ── 1. BREADCRUMB & HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Link href="/master-data/categories" className="hover:text-primary-accent transition-colors">
                            Master Data
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-primary-accent font-semibold">Jenis Layanan</span>
                    </nav>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Jenis Layanan</h1>
                    <p className="text-xs text-slate-500">
                        Kelola master jenis layanan fotografi & videografi yang digunakan pada paket dan rincian project.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/master-data/packages"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                    >
                        <Box className="w-4 h-4 text-indigo-600" />
                        <span>Kelola Paket</span>
                    </Link>
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Layanan</span>
                    </button>
                </div>
            </div>

            {/* ── 2. TOP 4 STAT CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Layanan */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
                        <Layers className="w-6 h-6 text-[#4F46E5]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Total Layanan</span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                            {stats.total ?? serviceList.length}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Layanan terdaftar</p>
                    </div>
                </div>

                {/* Card 2: Layanan Aktif */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Layanan Aktif</span>
                        <h2 className="text-2xl font-black text-[#059669] tracking-tight font-sans">
                            {stats.active ?? 0}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Bisa dipilih di paket</p>
                    </div>
                </div>

                {/* Card 3: Layanan Nonaktif */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] flex items-center justify-center shrink-0">
                        <MinusCircle className="w-6 h-6 text-[#EF4444]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Layanan Nonaktif</span>
                        <h2 className="text-2xl font-black text-[#DC2626] tracking-tight font-sans">
                            {stats.inactive ?? 0}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Dinonaktifkan</p>
                    </div>
                </div>

                {/* Card 4: Kategori Terkait */}
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

            {/* ── 3. TABLE CARD CONTAINER ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
                    <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 flex-1">
                        {/* Search Input */}
                        <div className="relative min-w-[220px] max-w-sm flex-1">
                            <input
                                type="text"
                                placeholder="Cari jenis layanan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-3.5 pr-9 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* Category Filter */}
                        <div className="relative min-w-[160px]">
                            <select
                                value={categoryFilter}
                                onChange={(e) => handleCategoryFilterChange(e.target.value)}
                                className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
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

                        {/* Status Filter */}
                        <div className="relative min-w-[130px]">
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusFilterChange(e.target.value)}
                                className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                            >
                                <option value="all">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
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

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/40 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="py-3 px-5 w-12">NO</th>
                                <th className="py-3 px-4">NAMA LAYANAN</th>
                                <th className="py-3 px-4">KATEGORI</th>
                                <th className="py-3 px-4">DESKRIPSI</th>
                                <th className="py-3 px-4 text-center">STATUS</th>
                                <th className="py-3 px-5 text-center">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {serviceList.length > 0 ? (
                                serviceList.map((srv, idx) => {
                                    const iconEl = SERVICE_ICONS[srv.name] || <Tag className="w-4 h-4 text-indigo-600" />;
                                    const isActive = srv.status === 'active';

                                    return (
                                        <tr key={srv.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3.5 px-5 font-bold text-slate-400">
                                                {((services.current_page || 1) - 1) * 10 + idx + 1}
                                            </td>

                                            <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                                                        {iconEl}
                                                    </div>
                                                    <span className="font-bold text-slate-900">{srv.name}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {srv.category ? (
                                                    <Link
                                                        href={`/master-data/categories`}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200"
                                                    >
                                                        <Folder className="w-3 h-3 text-slate-500" />
                                                        <span>{srv.category.name}</span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-slate-400 font-medium text-xs">Umum</span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 text-slate-600 font-medium max-w-md">
                                                {srv.description || '-'}
                                            </td>

                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
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

                                            <td className="py-3.5 px-5 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(srv)}
                                                        className="w-8 h-8 rounded-lg border border-slate-200 hover:border-indigo-300 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-colors cursor-pointer"
                                                        title="Edit Layanan"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(srv)}
                                                        className="w-8 h-8 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
                                                        title="Hapus Layanan"
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
                                    <td colSpan={6} className="py-12 text-center text-slate-400">
                                        <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-xs font-semibold text-slate-600">Tidak ada layanan yang sesuai.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={services.current_page || 1}
                    lastPage={services.last_page || 1}
                    total={services.total || serviceList.length}
                    from={services.from}
                    to={services.to}
                    perPage={perPage}
                    itemLabel="layanan"
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
            </div>

            {/* ── 4. MODAL: TAMBAH / EDIT LAYANAN ── */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-base font-black text-slate-900">
                                {editItem ? 'Edit Jenis Layanan' : 'Tambah Jenis Layanan'}
                            </h3>
                            <button type="button" onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Kategori Project <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    value={form.category_id}
                                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
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
                                    Nama Layanan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Contoh: Fotografi, Videografi, Album Cetak, Drone"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Deskripsi</label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Deskripsi singkat mengenai layanan ini..."
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Status</label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                >
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Nonaktif</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Layanan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
