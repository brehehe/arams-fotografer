import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
} from 'lucide-react';

interface CategoryItem {
    id: number | string;
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
    color?: string;
    status?: string;
    projects_count?: number;
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
    };
    stats?: Stats;
    filters?: {
        search?: string;
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
    categories = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0 },
    stats = { total: 12, active: 10, inactive: 2, used_in_projects: 86 },
    filters = {},
}: CategoriesIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState('all');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<CategoryItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [form, setForm] = useState({
        name: '',
        description: '',
        color: '#6366F1',
        icon: 'Tag',
        status: 'active',
    });

    // Demo data fallback matching Screenshot 1
    const demoCategories: CategoryItem[] = useMemo(() => [
        { id: 1, name: 'Wedding', description: 'Kategori untuk project pernikahan (akad, resepsi, prewedding, dll)', status: 'active', projects_count: 28 },
        { id: 2, name: 'Prewedding', description: 'Sesi foto sebelum pernikahan', status: 'active', projects_count: 16 },
        { id: 3, name: 'Family', description: 'Foto keluarga / family portrait', status: 'active', projects_count: 12 },
        { id: 4, name: 'Maternity', description: 'Foto kehamilan / maternity session', status: 'active', projects_count: 8 },
        { id: 5, name: 'Newborn', description: 'Foto bayi baru lahir', status: 'active', projects_count: 6 },
        { id: 6, name: 'Birthday', description: 'Event ulang tahun', status: 'active', projects_count: 7 },
        { id: 7, name: 'Company Profile', description: 'Foto untuk kebutuhan profil perusahaan', status: 'active', projects_count: 9 },
        { id: 8, name: 'Event', description: 'Event formal / informal (seminar, gathering, dll)', status: 'active', projects_count: 15 },
        { id: 9, name: 'Traveling', description: 'Foto traveling / dokumentasi perjalanan', status: 'inactive', projects_count: 4 },
        { id: 10, name: 'Personal', description: 'Foto personal / individu', status: 'active', projects_count: 5 },
    ], []);

    const rawData = categories.data && categories.data.length > 0 ? categories.data : demoCategories;

    const filteredData = useMemo(() => {
        return rawData.filter((cat) => {
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
    }, [rawData, searchQuery, statusFilter]);

    const handleOpenCreate = () => {
        setEditItem(null);
        setForm({
            name: '',
            description: '',
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
                    setCreateModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: () => setIsSubmitting(false),
            });
        } else {
            router.post('/master-data/categories', form, {
                onSuccess: () => {
                    setCreateModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: () => setIsSubmitting(false),
            });
        }
    };

    const handleDelete = (id: number | string) => {
        if (confirm('Yakin ingin menghapus kategori ini?')) {
            router.delete(`/master-data/categories/${id}`);
        }
    };

    // Export CSV
    const handleExport = () => {
        const rows = [
            ['No', 'Nama Kategori', 'Deskripsi', 'Jumlah Project', 'Status'],
            ...filteredData.map((c, i) => [
                i + 1,
                c.name,
                c.description || '-',
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

    return (
        <div className="space-y-6 pb-20">
            <Head title="Kategori Project - Master Data" />

            {/* ── 1. BREADCRUMB & HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Link href="/master-data/categories" className="hover:text-primary-accent transition-colors">
                            Master Data
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-primary-accent font-semibold">Kategori Project</span>
                    </nav>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kategori Project</h1>
                    <p className="text-xs text-slate-500">
                        Kelola kategori project yang digunakan untuk mengelompokkan jenis project.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Kategori
                </button>
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
                            {stats.total || filteredData.length}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Kategori aktif</p>
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
                            {stats.active || 10}
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
                            {stats.inactive || 2}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Tidak digunakan</p>
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
                            {stats.used_in_projects || 86}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Project</p>
                    </div>
                </div>
            </div>

            {/* ── 3. TABLE CARD CONTAINER ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
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
                    </div>

                    <button
                        type="button"
                        onClick={handleExport}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50/70 transition-all cursor-pointer shadow-2xs"
                    >
                        <Download className="w-3.5 h-3.5 text-indigo-600" />
                        Export
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/40 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="py-3 px-5 w-14">NO</th>
                                <th className="py-3 px-4">NAMA KATEGORI</th>
                                <th className="py-3 px-4">DESKRIPSI</th>
                                <th className="py-3 px-4 text-center">JUMLAH PROJECT</th>
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
                                                {idx + 1}
                                            </td>

                                            <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${bgStyle}`}>
                                                        {iconEl}
                                                    </div>
                                                    <span>{cat.name}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-slate-600 font-medium max-w-md">
                                                {cat.description || '-'}
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
                                                        onClick={() => handleDelete(cat.id)}
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
                                    <td colSpan={6} className="py-12 text-center text-slate-400">
                                        <Folder className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-xs font-semibold text-slate-600">Tidak ada kategori yang sesuai.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 sm:px-5 flex items-center justify-between border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500 font-medium">
                    <span>
                        Menampilkan 1 - {filteredData.length > 0 ? Math.min(filteredData.length, 10) : 0} dari {stats.total || filteredData.length} kategori
                    </span>
                    <div className="flex items-center gap-1">
                        <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40" disabled>
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="w-7 h-7 rounded-lg bg-[#3B46F1] text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                            1
                        </button>
                        <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 font-semibold flex items-center justify-center text-xs hover:bg-slate-100">
                            2
                        </button>
                        <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100">
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
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
                                    placeholder="Contoh: Wedding, Prewedding, dll"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Deskripsi</label>
                                <textarea
                                    rows={3}
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
