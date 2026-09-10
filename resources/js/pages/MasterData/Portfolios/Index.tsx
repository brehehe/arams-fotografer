import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import {
    Camera,
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    ExternalLink,
    CheckCircle2,
    X,
    Upload,
    Image as ImageIcon,
    FolderKanban,
    ZoomIn,
    Heart,
    MessageCircle,
} from 'lucide-react';
import SettingsTabNav from '@/components/SettingsTabNav';

interface CategoryOption {
    id: string;
    name: string;
    is_active: boolean;
}

interface PortfolioItem {
    id: string;
    portfolio_category_id?: string | null;
    category?: {
        id: string;
        name: string;
        slug?: string;
    } | null;
    title: string;
    caption?: string | null;
    image_url: string;
    media_type: string;
    is_active: boolean;
    sort_order: number;
    likes_count?: number;
    comments_count?: number;
    created_at?: string;
}

interface PortfoliosIndexProps {
    portfolios?: {
        data: PortfolioItem[];
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
        categories_count?: number;
    };
    categories?: CategoryOption[];
    filters?: {
        search?: string;
        category_id?: string;
        status?: string;
        per_page?: number;
    };
}

export default function PortfoliosIndex({
    portfolios = {
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
        categories_count: 0,
    },
    categories = [],
    filters = {},
}: PortfoliosIndexProps) {
    const { props: pageProps } = usePage<any>();
    const appSettings = pageProps?.appSettings || {};
    const accentColor = appSettings.primary_accent_color || '#3C0E0E';
    const headingColor = appSettings.sidebar_bg_color || '#1E293B';
    const mutedColor = '#64748B';

    const [search, setSearch] = useState(filters.search || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
    const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);

    const [formData, setFormData] = useState({
        portfolio_category_id: '',
        title: '',
        caption: '',
        image_url: '',
        image_file: null as File | null,
        media_type: 'photo',
        is_active: true,
        sort_order: 0,
    });
    const [filePreview, setFilePreview] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/master-data/portfolios', {
            search,
            category_id: filters.category_id,
            status: filters.status,
        }, { preserveState: true });
    };

    const handleFilterCategory = (catId?: string) => {
        router.get('/master-data/portfolios', {
            search,
            category_id: catId,
            status: filters.status,
        }, { preserveState: true });
    };

    const handleFilterStatus = (status?: string) => {
        router.get('/master-data/portfolios', {
            search,
            category_id: filters.category_id,
            status,
        }, { preserveState: true });
    };

    const handleOpenCreate = () => {
        setSelectedPortfolio(null);
        setFormData({
            portfolio_category_id: categories[0]?.id || '',
            title: '',
            caption: '',
            image_url: '',
            image_file: null,
            media_type: 'photo',
            is_active: true,
            sort_order: (portfolios.total || 0) + 1,
        });
        setFilePreview('');
        setModalOpen(true);
    };

    const handleOpenEdit = (p: PortfolioItem) => {
        setSelectedPortfolio(p);
        setFormData({
            portfolio_category_id: p.portfolio_category_id || p.category?.id || '',
            title: p.title,
            caption: p.caption || '',
            image_url: p.image_url,
            image_file: null,
            media_type: p.media_type || 'photo',
            is_active: p.is_active,
            sort_order: p.sort_order,
        });
        setFilePreview(p.image_url);
        setModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, image_file: file });
            const reader = new FileReader();
            reader.onload = (re) => {
                setFilePreview(re.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error('Judul portofolio wajib diisi');
            return;
        }

        if (!selectedPortfolio && !formData.image_file && !formData.image_url.trim()) {
            toast.error('Wajib mengunggah foto atau memasukkan URL gambar');
            return;
        }

        setIsSubmitting(true);
        const form = new FormData();
        if (formData.portfolio_category_id) form.append('portfolio_category_id', formData.portfolio_category_id);
        form.append('title', formData.title);
        form.append('caption', formData.caption);
        form.append('image_url', formData.image_url);
        form.append('media_type', formData.media_type);
        form.append('is_active', formData.is_active ? '1' : '0');
        form.append('sort_order', formData.sort_order.toString());
        if (formData.image_file) {
            form.append('image_file', formData.image_file);
        }

        if (selectedPortfolio) {
            form.append('_method', 'PUT');
            router.post(`/master-data/portfolios/${selectedPortfolio.id}`, form, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Karya portofolio berhasil diperbarui');
                    setModalOpen(false);
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string || 'Gagal memperbarui portofolio');
                },
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post('/master-data/portfolios', form, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Karya portofolio berhasil ditambahkan');
                    setModalOpen(false);
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string || 'Gagal menambahkan portofolio');
                },
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    const handleToggleActive = (p: PortfolioItem) => {
        router.patch(`/master-data/portfolios/${p.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                const nextState = !p.is_active;
                if (nextState) {
                    toast.success(`"${p.title}" sekarang ditampilkan (Show) di galeri`);
                } else {
                    toast.info(`"${p.title}" disembunyikan (Hide) dari galeri`);
                }
            },
            onError: () => toast.error('Gagal mengubah status portofolio'),
        });
    };

    const handleDelete = () => {
        if (!selectedPortfolio) return;
        router.delete(`/master-data/portfolios/${selectedPortfolio.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Karya portofolio berhasil dihapus');
                setDeleteModalOpen(false);
            },
            onError: () => toast.error('Gagal menghapus karya portofolio'),
        });
    };

    return (
        <div className="w-full max-w-full space-y-4 pb-2">
            <Head title="Portofolio - Setting Admin" />

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
                        Kelola karya portofolio, tampilan foto galeri, preferensi sistem, dan konfigurasi studio.
                    </p>
                </div>
            </div>

            {/* ── 2. TAB NAVIGASI HORIZONTAL ── */}
            <SettingsTabNav activeMainTab="admin" activeAdminSubTab="portfolios" accentColor={accentColor} />

            {/* ── 3. SUB-SECTION TITLE & ACTIONS ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
                        >
                            <Camera className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Karya Portofolio
                        </h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 sm:ml-11">
                        Kelola galeri foto karya studio untuk klien. Anda dapat menampilkan (<strong>Show</strong>) atau menyembunyikan (<strong>Hide</strong>) foto secara bebas.
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
                        <span>Tambah Foto Portofolio</span>
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
                        <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Foto</span>
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
                        <FolderKanban className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Kategori</span>
                        <h3 className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                            {stats.categories_count ?? categories.length}
                        </h3>
                    </div>
                </div>
            </div>

            {/* ── 5. FILTER & SEARCH ── */}
            <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari judul / deskripsi foto..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-slate-900/20 text-slate-900 dark:text-white transition-colors"
                        />
                    </form>

                    {/* Status filter buttons */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => handleFilterStatus(undefined)}
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
                            onClick={() => handleFilterStatus('show')}
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
                            onClick={() => handleFilterStatus('hide')}
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

                {/* Category filter pills */}
                {categories.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto pb-1">
                        <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0">Kategori:</span>
                        <button
                            type="button"
                            onClick={() => handleFilterCategory(undefined)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                                !filters.category_id
                                    ? 'bg-slate-800 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                        >
                            Semua Kategori
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => handleFilterCategory(cat.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                                    filters.category_id === cat.id
                                        ? 'bg-slate-800 text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── 6. PORTFOLIO GALLERY GRID ── */}
            {portfolios.data.length === 0 ? (
                <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-3 shadow-2xs">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <Camera className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Tidak Ada Foto Portofolio</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Belum ada karya foto dalam daftar atau tidak sesuai filter. Klik tombol &quot;Tambah Foto Portofolio&quot; untuk mengunggah karya baru.
                    </p>
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        style={{ backgroundColor: accentColor }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:brightness-110 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Unggah Foto Sekarang</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                    {portfolios.data.map((item) => (
                        <div
                            key={item.id}
                            className="group relative bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                        >
                            {/* Image container */}
                            <div className="relative aspect-4/5 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <img
                                    src={item.image_url}
                                    alt={item.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                />

                                {/* Category Badge overlay */}
                                <div className="absolute top-2.5 left-2.5 z-10">
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-xs">
                                        {item.category?.name || 'Umum'}
                                    </span>
                                </div>

                                {/* Show / Hide Switch Badge overlay */}
                                <div className="absolute top-2.5 right-2.5 z-10">
                                    <button
                                        type="button"
                                        onClick={() => handleToggleActive(item)}
                                        title={item.is_active ? 'Klik untuk Hide dari galeri klien' : 'Klik untuk Show di galeri klien'}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 backdrop-blur-md transition-all cursor-pointer shadow-xs ${
                                            item.is_active
                                                ? 'bg-emerald-600/90 text-white hover:bg-emerald-700'
                                                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-900 border border-white/20'
                                        }`}
                                    >
                                        {item.is_active ? (
                                            <>
                                                <Eye className="w-3 h-3" />
                                                <span>Show</span>
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff className="w-3 h-3" />
                                                <span>Hide</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Zoom preview trigger */}
                                <button
                                    type="button"
                                    onClick={() => setPreviewModalImage(item.image_url)}
                                    className="absolute bottom-2.5 right-2.5 z-10 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md text-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer"
                                    title="Lihat Foto Penuh"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Card Content */}
                            <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                                        {item.title}
                                    </h4>
                                    {item.caption && (
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                                            {item.caption}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                                    <span className="text-[10px] text-slate-400">
                                        Urutan: #{item.sort_order}
                                    </span>

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEdit(item)}
                                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                            title="Edit Foto"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedPortfolio(item);
                                                setDeleteModalOpen(true);
                                            }}
                                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                                            title="Hapus Foto"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {portfolios.total > (portfolios.per_page || 12) && (
                <div className="pt-4">
                    <Pagination
                        currentPage={portfolios.current_page || 1}
                        lastPage={portfolios.last_page || 1}
                        total={portfolios.total}
                        from={portfolios.from}
                        to={portfolios.to}
                        perPage={portfolios.per_page || 12}
                        itemLabel="portofolio"
                        onPageChange={(page) => {
                            router.get('/master-data/portfolios', { ...filters, page }, { preserveState: true });
                        }}
                    />
                </div>
            )}

            {/* ── 7. ADD / EDIT MODAL ── */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
                                >
                                    <Camera className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                    {selectedPortfolio ? 'Edit Karya Portofolio' : 'Tambah Foto Portofolio Baru'}
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
                            {/* Photo Upload / URL Box */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Foto Karya Portofolio <span className="text-rose-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-slate-300 dark:hover:border-slate-600 transition-colors bg-slate-50/50 dark:bg-slate-800/40">
                                    {filePreview ? (
                                        <div className="relative aspect-16/10 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 max-h-48 mx-auto">
                                            <img
                                                src={filePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFilePreview('');
                                                    setFormData({ ...formData, image_file: null, image_url: '' });
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg shadow-md hover:bg-rose-700 cursor-pointer"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 shadow-2xs border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-500 mb-2">
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Klik untuk unggah foto
                                            </span>
                                            <span className="text-[11px] text-slate-400 mt-0.5">
                                                Format JPG, PNG, WebP (Maks 10MB). Kompresi otomatis aktif.
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>

                                <div className="mt-2 text-center text-xs text-slate-400">
                                    — atau masukkan URL gambar langsung —
                                </div>
                                <input
                                    type="url"
                                    value={formData.image_url}
                                    onChange={(e) => {
                                        setFormData({ ...formData, image_url: e.target.value });
                                        if (e.target.value.startsWith('http')) {
                                            setFilePreview(e.target.value);
                                        }
                                    }}
                                    placeholder="https://images.unsplash.com/..."
                                    className="mt-1 w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900/20 outline-hidden font-mono"
                                />
                            </div>

                            {/* Kategori Portofolio */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Kategori Portofolio <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formData.portfolio_category_id}
                                    onChange={(e) => setFormData({ ...formData, portfolio_category_id: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900/20 outline-hidden"
                                >
                                    <option value="">Pilih Kategori...</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} {!c.is_active ? '(Status: Hide)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Judul Foto */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Judul Foto / Karya <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Contoh: Sunset Blessing Ceremony"
                                    required
                                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900/20 outline-hidden"
                                />
                            </div>

                            {/* Caption / Cerita */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Caption / Cerita Singkat
                                </label>
                                <textarea
                                    value={formData.caption}
                                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                                    rows={3}
                                    placeholder="Ceritakan nuansa, keindahan momen, atau detail pemotretan karya ini..."
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
                                    {isSubmitting ? 'Menyimpan...' : selectedPortfolio ? 'Simpan Perubahan' : 'Tambah Foto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── 8. DELETE CONFIRM MODAL ── */}
            {deleteModalOpen && selectedPortfolio && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Hapus Karya Ini?
                            </h3>
                            <p className="text-xs text-slate-500">
                                Foto karya <span className="font-bold text-slate-800 dark:text-slate-200">&quot;{selectedPortfolio.title}&quot;</span> akan dihapus dari sistem galeri portofolio.
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

            {/* ── 9. PREVIEW LIGHTBOX MODAL ── */}
            {previewModalImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
                    onClick={() => setPreviewModalImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
                        <img
                            src={previewModalImage}
                            alt="Preview"
                            className="w-full h-full object-contain max-h-[85vh] rounded-2xl shadow-2xl"
                        />
                        <button
                            type="button"
                            onClick={() => setPreviewModalImage(null)}
                            className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
