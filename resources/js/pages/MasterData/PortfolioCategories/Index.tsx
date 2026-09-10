import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import {
    FolderKanban,
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    ExternalLink,
    CheckCircle2,
    Tag,
    X,
    Layers,
    Image as ImageIcon,
    SlidersHorizontal,
    Camera,
} from 'lucide-react';
import SettingsTabNav from '@/components/SettingsTabNav';

interface CategoryItem {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    is_active: boolean;
    sort_order: number;
    portfolios_count?: number;
    active_portfolios_count?: number;
    created_at?: string;
}

interface PortfolioCategoriesIndexProps {
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
    stats?: {
        total: number;
        active: number;
        inactive: number;
        with_images?: number;
    };
    filters?: {
        search?: string;
        status?: string;
        per_page?: number;
    };
}

export default function PortfolioCategoriesIndex({
    categories = {
        data: [],
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0,
    },
    stats = {
        total: 0,
        active: 0,
        inactive: 0,
        with_images: 0,
    },
    filters = {},
}: PortfolioCategoriesIndexProps) {
    const { props: pageProps } = usePage<any>();
    const appSettings = pageProps?.appSettings || {};
    const accentColor = appSettings.primary_accent_color || '#3C0E0E';
    const headingColor = appSettings.sidebar_bg_color || '#1E293B';
    const mutedColor = '#64748B';

    const [search, setSearch] = useState(filters.search || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        is_active: true,
        sort_order: 0,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/master-data/portfolio-categories', { search, status: filters.status }, { preserveState: true });
    };

    const handleOpenCreate = () => {
        setSelectedCategory(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            is_active: true,
            sort_order: (categories.total || 0) + 1,
        });
        setModalOpen(true);
    };

    const handleOpenEdit = (cat: CategoryItem) => {
        setSelectedCategory(cat);
        setFormData({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            is_active: cat.is_active,
            sort_order: cat.sort_order,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Nama kategori wajib diisi');
            return;
        }

        setIsSubmitting(true);
        if (selectedCategory) {
            router.put(`/master-data/portfolio-categories/${selectedCategory.id}`, formData, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Kategori portofolio berhasil diperbarui');
                    setModalOpen(false);
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string || 'Gagal memperbarui kategori');
                },
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post('/master-data/portfolio-categories', formData, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Kategori portofolio berhasil ditambahkan');
                    setModalOpen(false);
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string || 'Gagal menambahkan kategori');
                },
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    const handleToggleActive = (cat: CategoryItem) => {
        router.patch(`/master-data/portfolio-categories/${cat.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                const nextState = !cat.is_active;
                if (nextState) {
                    toast.success(`Kategori "${cat.name}" sekarang ditampilkan (Show)`);
                } else {
                    toast.info(`Kategori "${cat.name}" disembunyikan (Hide)`);
                }
            },
            onError: () => toast.error('Gagal mengubah status kategori'),
        });
    };

    const handleDelete = () => {
        if (!selectedCategory) return;
        router.delete(`/master-data/portfolio-categories/${selectedCategory.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Kategori portofolio berhasil dihapus');
                setDeleteModalOpen(false);
            },
            onError: () => toast.error('Gagal menghapus kategori'),
        });
    };

    return (
        <div className="w-full max-w-full space-y-4 pb-2">
            <Head title="Kategori Portofolio - Setting Admin" />

            {/* ── 1. HEADER UTAMA PENGATURAN ADMIN ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1
                        className="text-2xl lg:text-3xl font-extrabold tracking-tight transition-colors"
                        style={{ color: headingColor }}
                    >
                        Pengaturan Admin
                    </h1>
                    <p
                        className="text-sm mt-0.5 transition-colors"
                        style={{ color: mutedColor }}
                    >
                        Kelola kategori portofolio, tampilan karya, preferensi sistem, dan konfigurasi studio.
                    </p>
                </div>
            </div>

            {/* ── 2. TAB NAVIGASI HORIZONTAL ── */}
            <SettingsTabNav activeMainTab="admin" activeAdminSubTab="portfolio_categories" accentColor={accentColor} />

            {/* ── 3. SUB-SECTION TITLE & ACTIONS ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
                        >
                            <FolderKanban className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Kategori Portofolio
                        </h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 sm:ml-11">
                        Atur kategori untuk pengelompokan galeri karya. Kategori dapat di-<strong>Show</strong> (tampil) atau di-<strong>Hide</strong> (sembunyi). Jika kategori belum memiliki gambar, sistem secara otomatis tidak akan memunculkannya di portal klien.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:ml-auto">
                    <Link
                        href="/client/portfolio"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                    >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        <span>Lihat Galeri Klien</span>
                    </Link>
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        style={{ backgroundColor: accentColor }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.02] cursor-pointer shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Kategori</span>
                    </button>
                </div>
            </div>

            {/* ── 4. STATS CARDS ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
                    >
                        <Layers className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Kategori</span>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {stats.total}
                        </h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Show (Tampil)</span>
                        <h3 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                            {stats.active}
                        </h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center shrink-0">
                        <EyeOff className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Hide (Sembunyi)</span>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-600 dark:text-slate-400 tracking-tight">
                            {stats.inactive}
                        </h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900/60 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ada Foto / Karya</span>
                        <h3 className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                            {stats.with_images ?? 0}
                        </h3>
                    </div>
                </div>
            </div>

            {/* ── 5. FILTER & SEARCH ── */}
            <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
                <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari kategori portofolio..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-slate-900/20 text-slate-900 dark:text-white transition-colors"
                    />
                </form>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => router.get('/master-data/portfolio-categories', { search, status: undefined }, { preserveState: true })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            !filters.status
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                    >
                        Semua ({stats.total})
                    </button>
                    <button
                        type="button"
                        onClick={() => router.get('/master-data/portfolio-categories', { search, status: 'show' }, { preserveState: true })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            filters.status === 'show'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100'
                        }`}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Show ({stats.active})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => router.get('/master-data/portfolio-categories', { search, status: 'hide' }, { preserveState: true })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            filters.status === 'hide'
                                ? 'bg-slate-700 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                    >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide ({stats.inactive})</span>
                    </button>
                </div>
            </div>

            {/* ── 6. CATEGORIES LIST ── */}
            {categories.data.length === 0 ? (
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-3 shadow-2xs">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <FolderKanban className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Tidak Ada Kategori Portofolio</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Belum ada kategori yang ditambahkan atau tidak sesuai filter. Klik tombol &quot;Tambah Kategori&quot; untuk membuat kategori baru.
                    </p>
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        style={{ backgroundColor: accentColor }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:brightness-110 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Kategori Sekarang</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.data.map((cat) => {
                        const activePhotosCount = cat.active_portfolios_count ?? 0;
                        const hasImages = activePhotosCount > 0;

                        return (
                            <div
                                key={cat.id}
                                className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                                    {cat.name}
                                                </h3>
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200/60 dark:border-slate-700">
                                                    {cat.slug}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                {cat.description || 'Tidak ada deskripsi kategori.'}
                                            </p>
                                        </div>

                                        {/* Show / Hide Toggle Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleToggleActive(cat)}
                                            title={cat.is_active ? 'Klik untuk Hide' : 'Klik untuk Show'}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                                                cat.is_active
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                                    : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                            }`}
                                        >
                                            {cat.is_active ? (
                                                <>
                                                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span>Show</span>
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>Hide</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Indicator Tag Foto & Status Portal */}
                                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                            <Camera className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="font-semibold">{activePhotosCount} Foto Aktif</span>
                                        </div>

                                        {/* Status Portal Pill */}
                                        {cat.is_active ? (
                                            hasImages ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Muncul di Portal
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md" title="Kategori ini Show, namun karena belum ada foto, sistem tidak menampilkannya di portal">
                                                    Belum Ada Foto
                                                </span>
                                            )
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                Sembunyi (Hide)
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                                    <Link
                                        href={`/master-data/portfolios?category_id=${cat.id}`}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                                    >
                                        <span>Kelola Foto ({cat.portfolios_count ?? 0})</span>
                                    </Link>

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEdit(cat)}
                                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                            title="Edit Kategori"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                setDeleteModalOpen(true);
                                            }}
                                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                                            title="Hapus Kategori"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {categories.total > (categories.per_page || 12) && (
                <div className="pt-4">
                    <Pagination
                        currentPage={categories.current_page || 1}
                        lastPage={categories.last_page || 1}
                        total={categories.total}
                        from={categories.from}
                        to={categories.to}
                        perPage={categories.per_page || 12}
                        itemLabel="kategori"
                        onPageChange={(page) => {
                            router.get('/master-data/portfolio-categories', { ...filters, page }, { preserveState: true });
                        }}
                    />
                </div>
            )}

            {/* ── 7. ADD / EDIT MODAL ── */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
                                >
                                    <FolderKanban className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                    {selectedCategory ? 'Edit Kategori Portofolio' : 'Tambah Kategori Baru'}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Nama Kategori <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contoh: Wedding, Prewedding, Family..."
                                    required
                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900/20 outline-hidden"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Slug URL (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="Biarkan kosong untuk generate otomatis"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900/20 outline-hidden font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Deskripsi Singkat
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Tuliskan deskripsi kategori atau tema pemotretan..."
                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900/20 outline-hidden"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Urutan Tampil
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.sort_order}
                                        onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900/20 outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Status Tampil
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                        className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                            formData.is_active
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                : 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                                        }`}
                                    >
                                        {formData.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                        <span>{formData.is_active ? 'Show (Tampil)' : 'Hide (Sembunyi)'}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{ backgroundColor: accentColor }}
                                    className="px-5 py-2.5 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Menyimpan...' : selectedCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 8. DELETE CONFIRM MODAL ── */}
            {deleteModalOpen && selectedCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Hapus Kategori Ini?
                            </h3>
                            <p className="text-xs text-slate-500">
                                Kategori <span className="font-bold text-slate-800 dark:text-slate-200">&quot;{selectedCategory.name}&quot;</span> akan dihapus dari sistem. Foto dalam kategori ini tidak akan terhapus otomatis.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteModalOpen(false)}
                                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
