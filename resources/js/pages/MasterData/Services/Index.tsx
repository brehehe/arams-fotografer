import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Box,
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
    Camera,
    Video,
    BookOpen,
    Layers,
    Sparkles,
} from 'lucide-react';

interface ServiceItem {
    id: number | string;
    name: string;
    description?: string;
    category_id?: number | string;
    category?: { id: number; name: string; color: string };
    status?: string;
    projects_count?: number;
    used_count?: number;
}

interface Stats {
    total?: number;
    active?: number;
    inactive?: number;
    used_in_projects?: number;
}

interface ServicesIndexProps {
    services?: {
        data: ServiceItem[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    categories?: Array<{ id: number; name: string; color?: string }>;
    stats?: Stats;
    filters?: {
        search?: string;
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
    Videography: <Video className="w-4 h-4 text-indigo-600" />,
    'Photography + Videography': (
        <div className="flex items-center -space-x-1">
            <Camera className="w-3.5 h-3.5 text-indigo-600" />
            <Video className="w-3.5 h-3.5 text-indigo-600" />
        </div>
    ),
    Album: <BookOpen className="w-4 h-4 text-indigo-600" />,
    Drone: <DroneIcon className="w-4 h-4 text-indigo-600" />,
};

export default function ServicesIndex({
    services = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0 },
    categories = [],
    stats = { total: 5, active: 5, inactive: 0, used_in_projects: 128 },
    filters = {},
}: ServicesIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState('all');
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

    // Demo services matching Screenshot 2
    const demoServices: ServiceItem[] = useMemo(() => [
        { id: 1, name: 'Photography', description: 'Jasa pengambilan foto untuk berbagai jenis project.', status: 'active', used_count: 96 },
        { id: 2, name: 'Videography', description: 'Jasa pembuatan video untuk berbagai jenis project.', status: 'active', used_count: 62 },
        { id: 3, name: 'Photography + Videography', description: 'Paket kombinasi foto dan video dalam satu layanan.', status: 'active', used_count: 48 },
        { id: 4, name: 'Album', description: 'Jasa pembuatan album cetak (custom design).', status: 'active', used_count: 27 },
        { id: 5, name: 'Drone', description: 'Pengambilan foto dan video udara menggunakan drone.', status: 'active', used_count: 19 },
    ], []);

    const rawData = services.data && services.data.length > 0 ? services.data : demoServices;

    const filteredData = useMemo(() => {
        return rawData.filter((srv) => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!srv.name.toLowerCase().includes(q) && !(srv.description || '').toLowerCase().includes(q)) {
                    return false;
                }
            }
            if (statusFilter !== 'all') {
                if (statusFilter === 'active' && srv.status !== 'active') return false;
                if (statusFilter === 'inactive' && srv.status === 'active') return false;
            }
            return true;
        });
    }, [rawData, searchQuery, statusFilter]);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (editItem) {
            router.put(`/master-data/services/${editItem.id}`, form, {
                onSuccess: () => {
                    setModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: () => setIsSubmitting(false),
            });
        } else {
            router.post('/master-data/services', form, {
                onSuccess: () => {
                    setModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: () => setIsSubmitting(false),
            });
        }
    };

    const handleDelete = (id: number | string) => {
        if (confirm('Yakin ingin menghapus jenis layanan ini?')) {
            router.delete(`/master-data/services/${id}`);
        }
    };

    // Export CSV
    const handleExport = () => {
        const rows = [
            ['No', 'Nama Layanan', 'Deskripsi', 'Digunakan di Project', 'Status'],
            ...filteredData.map((s, i) => [
                i + 1,
                s.name,
                s.description || '-',
                s.used_count || s.projects_count || 0,
                s.status === 'active' ? 'Aktif' : 'Nonaktif',
            ]),
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Jenis_Layanan_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 pb-20">
            <Head title="Jenis Layanan - Master Data" />

            {/* ── 1. BREADCRUMB & HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Link href="/master-data/services" className="hover:text-primary-accent transition-colors">
                            Master Data
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-primary-accent font-semibold">Jenis Layanan</span>
                    </nav>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Jenis Layanan</h1>
                    <p className="text-xs text-slate-500">
                        Kelola jenis layanan yang ditawarkan dalam setiap project.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Jenis Layanan
                </button>
            </div>

            {/* ── 2. TOP 4 STAT CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Jenis Layanan */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
                        <Box className="w-6 h-6 text-[#4F46E5]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Total Jenis Layanan</span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                            {stats.total || filteredData.length}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Semua layanan</p>
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
                            {stats.active || 5}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Sedang aktif</p>
                    </div>
                </div>

                {/* Card 3: Layanan Nonaktif */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] flex items-center justify-center shrink-0">
                        <MinusCircle className="w-6 h-6 text-[#EF4444]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Layanan Nonaktif</span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
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
                            {stats.used_in_projects || 128}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Total penggunaan</p>
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
                                placeholder="Cari jenis layanan..."
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
                                <th className="py-3 px-4">NAMA LAYANAN</th>
                                <th className="py-3 px-4">DESKRIPSI</th>
                                <th className="py-3 px-4 text-center">DIGUNAKAN DI PROJECT</th>
                                <th className="py-3 px-4 text-center">STATUS</th>
                                <th className="py-3 px-5 text-center">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.length > 0 ? (
                                filteredData.map((srv, idx) => {
                                    const iconEl = SERVICE_ICONS[srv.name] || <Layers className="w-4 h-4 text-indigo-600" />;
                                    const isActive = srv.status === 'active';

                                    return (
                                        <tr key={srv.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3.5 px-5 font-bold text-slate-400">
                                                {idx + 1}
                                            </td>

                                            <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center shrink-0">
                                                        {iconEl}
                                                    </div>
                                                    <span>{srv.name}</span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-slate-600 font-medium max-w-md">
                                                {srv.description || '-'}
                                            </td>

                                            <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                                                {srv.used_count ?? srv.projects_count ?? 0}
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
                                                        onClick={() => handleDelete(srv.id)}
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
                                        <Box className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-xs font-semibold text-slate-600">Tidak ada jenis layanan yang sesuai.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 sm:px-5 flex items-center justify-between border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500 font-medium">
                    <span>
                        Menampilkan 1 - {filteredData.length} dari {stats.total || filteredData.length} layanan
                    </span>
                    <div className="flex items-center gap-1">
                        <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40" disabled>
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="w-7 h-7 rounded-lg bg-[#3B46F1] text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                            1
                        </button>
                        <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40" disabled>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
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
                                    Nama Layanan <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Contoh: Photography, Videography, dll"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>

                            {categories && categories.length > 0 && (
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Kategori Utama</label>
                                    <select
                                        value={form.category_id}
                                        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                    >
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Deskripsi</label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Deskripsi singkat mengenai jenis layanan ini..."
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
