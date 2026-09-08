import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import { SelectSearch } from '@/components/ui/select-search';

import {
    Folder,
    CheckCircle2,
    MinusCircle,
    FolderKanban,
    Plus,
    Search,
    Download,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    X,
    Heart,
    Camera,
    Users,
    Baby,
    Smile,
    Cake,
    Briefcase,
    Calendar,
    Plane,
    User,
    Tag,
    Layers,
    GitBranch,
    Box,
    ExternalLink,
} from 'lucide-react';

interface CategoryItem {
    id: number | string;
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
    color?: string;
    workflow_type?: string;
    form_type?: 'wedding' | 'newborn' | 'standard' | string;
    status?: string;
    projects_count?: number;
    packages_count?: number;
    services_count?: number;
}

interface Stats {
    total?: number;
    active?: number;
    inactive?: number;
    used_in_projects?: number;
}

interface CategoriesIndexProps {
    categories?: {
        data: CategoryItem[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        per_page?: number;
        links?: Array<{ url: string | null; label: string; active: boolean }>;
    };
    stats?: Stats;
    filters?: {
        search?: string;
        per_page?: number;
    };
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    Wedding: <Heart className="w-4 h-4 text-purple-600" />,
    Prewedding: <Camera className="w-4 h-4 text-blue-600" />,
    Family: <Users className="w-4 h-4 text-emerald-600" />,
    Maternity: <Baby className="w-4 h-4 text-amber-600" />,
    Newborn: <Smile className="w-4 h-4 text-rose-600" />,
    Birthday: <Cake className="w-4 h-4 text-teal-600" />,
    'Company Profile': <Briefcase className="w-4 h-4 text-orange-600" />,
    Event: <Calendar className="w-4 h-4 text-indigo-600" />,
    Traveling: <Plane className="w-4 h-4 text-sky-600" />,
    Personal: <User className="w-4 h-4 text-emerald-600" />,
};

const CATEGORY_BG: Record<string, string> = {
    Wedding: 'bg-purple-50 text-purple-600 border-purple-100',
    Prewedding: 'bg-blue-50 text-blue-600 border-blue-100',
    Family: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Maternity: 'bg-amber-50 text-amber-600 border-amber-100',
    Newborn: 'bg-rose-50 text-rose-600 border-rose-100',
    Birthday: 'bg-teal-50 text-teal-600 border-teal-100',
    'Company Profile': 'bg-orange-50 text-orange-600 border-orange-100',
    Event: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    Traveling: 'bg-sky-50 text-sky-600 border-sky-100',
    Personal: 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

export default function CategoriesIndex({
    categories = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0, links: [] },
    stats = { total: 0, active: 0, inactive: 0, used_in_projects: 0 },
    filters = {},
}: CategoriesIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState('all');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<CategoryItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [form, setForm] = useState({
        name: '',
        description: '',
        workflow_type: 'wedding',
        form_type: 'standard',
        color: '#6366F1',
        icon: 'Tag',
        status: 'active',
    });

    const categoryList = categories.data || [];

    const filteredData = useMemo(() => {
        return categoryList.filter((cat) => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!cat.name.toLowerCase().includes(q) && !(cat.description || '').toLowerCase().includes(q)) {
                    return false;
                }
            }
            if (statusFilter !== 'all') {
                if (statusFilter === 'active' && cat.status !== 'active') return false;
                if (statusFilter === 'inactive' && cat.status === 'active') return false;
            }
            return true;
        });
    }, [categoryList, searchQuery, statusFilter]);

    const handleOpenCreate = () => {
        setEditItem(null);
        setForm({
            name: '',
            description: '',
            workflow_type: 'non_wedding',
            form_type: 'standard',
            color: '#6366F1',
            icon: 'Tag',
            status: 'active',
        });
        setCreateModalOpen(true);
    };

    const handleOpenEdit = (item: CategoryItem) => {
        setEditItem(item);
        setForm({
            name: item.name,
            description: item.description || '',
            workflow_type: item.workflow_type || 'non_wedding',
            form_type: item.form_type || (item.slug === 'wedding' || item.slug === 'prewedding' ? 'wedding' : (item.slug === 'newborn' ? 'newborn' : 'standard')),
            color: item.color || '#6366F1',
            icon: item.icon || 'Tag',
            status: item.status || 'active',
        });
        setCreateModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (editItem) {
            router.put(`/master-data/categories/${editItem.id}`, form, {
                onSuccess: () => {
                    toast.success(`Kategori "${form.name}" berhasil diperbarui!`);
                    setCreateModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: (errs) => {
                    toast.error('Gagal memperbarui: ' + Object.values(errs).join(', '));
                    setIsSubmitting(false);
                },
            });
        } else {
            router.post('/master-data/categories', form, {
                onSuccess: () => {
                    toast.success(`Kategori "${form.name}" berhasil ditambahkan!`);
                    setCreateModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: (errs) => {
                    toast.error('Gagal menambah: ' + Object.values(errs).join(', '));
                    setIsSubmitting(false);
                },
            });
        }
    };

    const handleDelete = (cat: CategoryItem) => {
        if (confirm(`Yakin ingin menghapus kategori "${cat.name}"? Paket dan layanan yang terkait mungkin terpengaruh.`)) {
            router.delete(`/master-data/categories/${cat.id}`, {
                onSuccess: () => toast.success(`Kategori "${cat.name}" berhasil dihapus!`),
                onError: (errs) => toast.error('Gagal menghapus: ' + Object.values(errs).join(', ')),
            });
        }
    };

    const applyFilters = (newParams: Record<string, any> = {}) => {
        router.get(
            '/master-data/categories',
            {
                search: newParams.search !== undefined ? newParams.search : searchQuery || undefined,
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

    const handlePageChange = (newPage: number) => {
        applyFilters({ page: newPage });
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        applyFilters({ per_page: newPerPage, page: 1 });
    };

    // Export CSV
    const handleExport = () => {
        const rows = [
            ['No', 'Nama Kategori', 'Workflow', 'Paket', 'Layanan', 'Jumlah Project', 'Status'],
            ...filteredData.map((c, i) => [
                i + 1,
                c.name,
                c.workflow_type || 'non_wedding',
                c.packages_count || 0,
                c.services_count || 0,
                c.projects_count || 0,
                c.status === 'active' ? 'Aktif' : 'Nonaktif',
            ]),
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Kategori_Project_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getWorkflowBadge = (wfType?: string) => {
        if (wfType === 'wedding') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    <GitBranch className="w-3 h-3 text-purple-500" />
                    Wedding (8 Tahap)
                </span>
            );
        }
        if (wfType === 'custom') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <GitBranch className="w-3 h-3 text-amber-500" />
                    Custom (6 Tahap)
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                <GitBranch className="w-3 h-3 text-sky-500" />
                Non-Wedding (5 Tahap)
            </span>
        );
    };

    const getFormTypeBadge = (formType?: string) => {
        if (formType === 'wedding') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200 shadow-2xs">
                    <span>👰🤵 CPP &amp; CPW</span>
                </span>
            );
        }
        if (formType === 'newborn') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                    <span>👶 Nama Anak</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs">
                <span>👤 Standar</span>
            </span>
        );
    };

    return (
        <div className="w-full max-w-full space-y-6 pb-20">
            <Head title="Kategori Project - Master Data" />

            {/* ── 1. HEADER TITLE & ACTIONS ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Kategori Project</h1>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">
                        Kelola kategori project yang terhubung langsung dengan Alur Workflow, Paket, Layanan, dan Project.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/master-data/workflows"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                    >
                        <GitBranch className="w-4 h-4 text-indigo-600" />
                        <span>Atur Workflow</span>
                    </Link>
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Kategori</span>
                    </button>
                </div>
            </div>

            {/* ── 2. TOP 4 STAT CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Kategori */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
                        <Folder className="w-6 h-6 text-[#4F46E5]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Total Kategori</span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                            {stats.total ?? categoryList.length}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Kategori di database</p>
                    </div>
                </div>

                {/* Card 2: Kategori Aktif */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Kategori Aktif</span>
                        <h2 className="text-2xl font-black text-[#059669] tracking-tight font-sans">
                            {stats.active ?? 0}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Sedang digunakan</p>
                    </div>
                </div>

                {/* Card 3: Kategori Nonaktif */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] flex items-center justify-center shrink-0">
                        <MinusCircle className="w-6 h-6 text-[#EF4444]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Kategori Nonaktif</span>
                        <h2 className="text-2xl font-black text-[#DC2626] tracking-tight font-sans">
                            {stats.inactive ?? 0}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Tidak aktif</p>
                    </div>
                </div>

                {/* Card 4: Digunakan di Project */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] flex items-center justify-center shrink-0">
                        <FolderKanban className="w-6 h-6 text-[#D97706]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Digunakan di Project</span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                            {stats.used_in_projects ?? 0}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Project aktif</p>
                    </div>
                </div>
            </div>

            {/* ── 3. TABLE CARD CONTAINER ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
                    <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 flex-1">
                        {/* Search Input */}
                        <div className="relative min-w-[240px] max-w-sm flex-1">
                            <input
                                type="text"
                                placeholder="Cari kategori project..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-3.5 pr-9 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* Status Filter */}
                        <div className="relative min-w-[140px]">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
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
                            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="py-3 px-4 w-12 text-center">#</th>
                                <th className="py-3 px-4">Kategori</th>
                                <th className="py-3 px-4">Alur Workflow</th>
                                <th className="py-3 px-4">Tipe Input Form</th>
                                <th className="py-3 px-4 text-center">PAKET</th>
                                <th className="py-3 px-4 text-center">LAYANAN</th>
                                <th className="py-3 px-4 text-center">PROJECTS</th>
                                <th className="py-3 px-4 text-center">STATUS</th>
                                <th className="py-3 px-5 text-center">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.length > 0 ? (
                                filteredData.map((cat, idx) => {
                                    const iconEl = CATEGORY_ICONS[cat.name] || <Tag className="w-4 h-4 text-indigo-600" />;
                                    const bgStyle = CATEGORY_BG[cat.name] || 'bg-indigo-50 text-indigo-600 border-indigo-100';
                                    const isActive = cat.status === 'active';

                                    return (
                                        <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3.5 px-5 font-bold text-slate-400">
                                                {((categories.current_page || 1) - 1) * 10 + idx + 1}
                                            </td>

                                            <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${bgStyle}`}>
                                                        {iconEl}
                                                    </div>
                                                    <div>
                                                        <span className="block font-bold text-slate-900">{cat.name}</span>
                                                        {cat.description && (
                                                            <span className="block text-[10.5px] text-slate-400 font-normal max-w-xs truncate" title={cat.description}>
                                                                {cat.description}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <Link
                                                    href="/master-data/workflows"
                                                    className="hover:opacity-80 transition-opacity"
                                                    title="Buka Alur Workflow di Master Data"
                                                >
                                                    {getWorkflowBadge(cat.workflow_type)}
                                                </Link>
                                            </td>

                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {getFormTypeBadge(cat.form_type)}
                                            </td>

                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                <Link
                                                    href={`/master-data/packages?category_id=${cat.id}`}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 text-[#3B46F1] font-bold text-[11px] transition-colors border border-indigo-100"
                                                    title="Lihat paket dalam kategori ini"
                                                >
                                                    <Box className="w-3 h-3 text-indigo-500" />
                                                    <span>{cat.packages_count ?? 0} Paket</span>
                                                </Link>
                                            </td>

                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                <Link
                                                    href={`/master-data/services?category_id=${cat.id}`}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[11px] transition-colors border border-slate-200"
                                                    title="Lihat layanan dalam kategori ini"
                                                >
                                                    <Layers className="w-3 h-3 text-slate-400" />
                                                    <span>{cat.services_count ?? 0} Layanan</span>
                                                </Link>
                                            </td>

                                            <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                                                {cat.projects_count ?? 0}
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
                                                        onClick={() => handleOpenEdit(cat)}
                                                        className="w-8 h-8 rounded-lg border border-slate-200 hover:border-indigo-300 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-colors cursor-pointer"
                                                        title="Edit Kategori"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(cat)}
                                                        className="w-8 h-8 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
                                                        title="Hapus Kategori"
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
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        <Folder className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-xs font-semibold text-slate-600">Tidak ada kategori yang sesuai.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={categories.current_page || 1}
                    lastPage={categories.last_page || 1}
                    total={categories.total || categoryList.length}
                    from={categories.from}
                    to={categories.to}
                    perPage={perPage}
                    itemLabel="kategori"
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
            </div>

            {/* ── 4. MODAL: TAMBAH / EDIT KATEGORI ── */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-base font-black text-slate-900">
                                {editItem ? 'Edit Kategori Project' : 'Tambah Kategori Project'}
                            </h3>
                            <button type="button" onClick={() => setCreateModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Nama Kategori <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Contoh: Wedding, Prewedding, Event, dll"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Tipe Penginputan Form Klien &amp; Project <span className="text-rose-500">*</span>
                                </label>
                                <SelectSearch
                                    options={[
                                        { value: 'wedding', label: '👰🤵 Pernikahan — CPP & CPW (Calon Pengantin)' },
                                        { value: 'newborn', label: '👶 Newborn — Nama anak/kembar, ayah & ibu' },
                                        { value: 'standard', label: '👤 Umum / Standar — Data normal (nama klien saja)' },
                                    ]}
                                    value={form.form_type}
                                    onChange={(val) => setForm({ ...form, form_type: val })}
                                    placeholder="Pilih tipe form..."
                                    clearable={false}
                                />
                                <p className="text-[10px] text-slate-400 mt-1.5">
                                    Menentukan skema isian formulir di Form Klien publik, Tambah/Edit Klien, serta Tambah/Edit Project.
                                </p>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Alur Workflow Utama <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={form.workflow_type}
                                    onChange={(e) => setForm({ ...form, workflow_type: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                >
                                    <option value="wedding">Workflow Wedding (8 Tahapan - Akad/Resepsi)</option>
                                    <option value="non_wedding">Workflow Non-Wedding (5 Tahapan - Prewed/Portrait/Event)</option>
                                    <option value="custom">Workflow Custom / Bundling (6 Tahapan - Multi Sesi)</option>
                                </select>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Menentukan template alur kerja dan deadline deliverables otomatis di proyek.
                                </p>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Deskripsi</label>
                                <textarea
                                    rows={2}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Deskripsi singkat mengenai kategori project ini..."
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
                                    onClick={() => setCreateModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Kategori'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
