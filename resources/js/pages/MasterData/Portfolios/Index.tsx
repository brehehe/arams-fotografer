import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import { StatCard } from '@/components/ui';
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
    Play,
    Video,
    Sparkles,
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
    video_url?: string | null;
    youtube_id?: string | null;
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

export const extractYoutubeId = (url?: string | null): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i);
    if (match) return match[1];
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
    return null;
};

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
    const [previewModalItem, setPreviewModalItem] = useState<PortfolioItem | null>(null);
    const [showCustomCover, setShowCustomCover] = useState(false);
    const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);

    const [formData, setFormData] = useState({
        portfolio_category_id: '',
        title: '',
        caption: '',
        image_url: '',
        image_file: null as File | null,
        media_type: 'photo' as 'photo' | 'video',
        video_url: '',
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
        setShowCustomCover(false);
        setFormData({
            portfolio_category_id: categories[0]?.id || '',
            title: '',
            caption: '',
            image_url: '',
            image_file: null,
            media_type: 'photo',
            video_url: '',
            is_active: true,
            sort_order: (portfolios.total || 0) + 1,
        });
        setFilePreview('');
        setModalOpen(true);
    };

    const handleOpenEdit = (p: PortfolioItem) => {
        setSelectedPortfolio(p);
        const isVideo = p.media_type === 'video' || Boolean(p.video_url);
        const hasCustomImage = Boolean(p.image_url && !p.image_url.includes('img.youtube.com'));
        setShowCustomCover(hasCustomImage);
        setFormData({
            portfolio_category_id: p.portfolio_category_id || p.category?.id || '',
            title: p.title,
            caption: p.caption || '',
            image_url: p.image_url,
            image_file: null,
            media_type: isVideo ? 'video' : 'photo',
            video_url: p.video_url || '',
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

        if (formData.media_type === 'video') {
            if (!formData.video_url.trim()) {
                toast.error('Link YouTube wajib diisi untuk jenis media Video');
                return;
            }
            const ytId = extractYoutubeId(formData.video_url);
            if (!ytId) {
                toast.error('Format link YouTube tidak valid. Contoh: https://youtu.be/xxxx atau https://youtube.com/watch?v=xxxx');
                return;
            }
        } else {
            if (!selectedPortfolio && !formData.image_file && !formData.image_url.trim()) {
                toast.error('Wajib mengunggah foto atau memasukkan URL gambar');
                return;
            }
        }

        setIsSubmitting(true);
        const form = new FormData();
        if (formData.portfolio_category_id) form.append('portfolio_category_id', formData.portfolio_category_id);
        form.append('title', formData.title);
        form.append('caption', formData.caption);
        form.append('image_url', formData.image_url);
        form.append('media_type', formData.media_type);
        form.append('video_url', formData.video_url);
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
                <StatCard
                    title="Total Foto"
                    value={stats.total}
                    subtitle="Foto portofolio"
                    icon={ImageIcon}
                    color="amber"
                />
                <StatCard
                    title="Show (Tampil)"
                    value={stats.active}
                    subtitle="Ditampilkan publik"
                    icon={CheckCircle2}
                    color="emerald"
                />
                <StatCard
                    title="Hide (Sembunyi)"
                    value={stats.inactive}
                    subtitle="Disembunyikan"
                    icon={EyeOff}
                    color="slate"
                />
                <StatCard
                    title="Total Kategori"
                    value={stats.categories_count ?? categories.length}
                    subtitle="Kategori foto"
                    icon={FolderKanban}
                    color="purple"
                />
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

                                {/* Category & Media Badge overlay */}
                                <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 flex-wrap">
                                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-xs">
                                        {item.category?.name || 'Umum'}
                                    </span>
                                    {(item.media_type === 'video' || item.video_url) && (
                                        <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-600/90 backdrop-blur-md text-white border border-rose-400/30 shadow-xs flex items-center gap-1">
                                            <Play className="w-2.5 h-2.5 fill-current" />
                                            <span>YouTube</span>
                                        </span>
                                    )}
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

                                {/* Video Centered Play Overlay */}
                                {(item.media_type === 'video' || item.video_url) && (
                                    <button
                                        type="button"
                                        onClick={() => setPreviewModalItem(item)}
                                        className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all cursor-pointer z-10"
                                        title="Putar Video YouTube"
                                    >
                                        <Play className="w-5 h-5 fill-current ml-0.5" />
                                    </button>
                                )}

                                {/* Zoom / Play preview trigger */}
                                <button
                                    type="button"
                                    onClick={() => setPreviewModalItem(item)}
                                    className="absolute bottom-2.5 right-2.5 z-10 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-md text-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer"
                                    title={item.media_type === 'video' || item.video_url ? 'Putar Video' : 'Lihat Foto Penuh'}
                                >
                                    {item.media_type === 'video' || item.video_url ? <Play className="w-3.5 h-3.5 fill-current" /> : <ZoomIn className="w-4 h-4" />}
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
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Fixed Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
                                >
                                    <Camera className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-tight">
                                        {selectedPortfolio ? 'Edit Karya Portofolio' : 'Tambah Portofolio Baru'}
                                    </h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        {selectedPortfolio ? 'Perbarui informasi karya atau ganti media' : 'Tambahkan foto atau video YouTube ke galeri'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
                            {/* Scrollable Form Body */}
                            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
                            {/* Pilihan Jenis Media (Foto atau Video YouTube) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Jenis Media <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, media_type: 'photo' })}
                                        className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                            formData.media_type === 'photo'
                                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <Camera className="w-4 h-4" />
                                        <span>Foto / Gambar</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, media_type: 'video' })}
                                        className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                            formData.media_type === 'video'
                                                ? 'bg-rose-600 text-white shadow-xs'
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <Play className="w-4 h-4 fill-current" />
                                        <span>Video YouTube</span>
                                    </button>
                                </div>
                            </div>

                            {/* Section Khusus Video YouTube */}
                            {formData.media_type === 'video' ? (
                                <div className="space-y-3 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20">
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                                                Link / URL Video YouTube <span className="text-rose-500">*</span>
                                            </label>
                                            {extractYoutubeId(formData.video_url) && (
                                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> YouTube Terdeteksi
                                                </span>
                                            )}
                                        </div>
                                        <input
                                            type="url"
                                            value={formData.video_url}
                                            onChange={(e) => {
                                                const url = e.target.value;
                                                const ytId = extractYoutubeId(url);
                                                const autoThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';
                                                setFormData({
                                                    ...formData,
                                                    video_url: url,
                                                    image_url: (!formData.image_file && autoThumb) ? autoThumb : formData.image_url,
                                                });
                                                if (!formData.image_file && autoThumb) {
                                                    setFilePreview(autoThumb);
                                                }
                                            }}
                                            placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                                            className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500/30 outline-hidden font-mono"
                                            required={formData.media_type === 'video'}
                                        />
                                        <p className="text-[11px] text-slate-500 mt-1">
                                            Mendukung format: <span className="font-mono text-slate-700 dark:text-slate-300">youtube.com/watch?v=...</span>, <span className="font-mono text-slate-700 dark:text-slate-300">youtu.be/...</span>, atau <span className="font-mono text-slate-700 dark:text-slate-300">shorts</span>.
                                        </p>
                                    </div>

                                    {/* Video Player Preview if Valid ID */}
                                    {extractYoutubeId(formData.video_url) ? (
                                        <div className="space-y-2">
                                            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner">
                                                <iframe
                                                    src={`https://www.youtube-nocookie.com/embed/${extractYoutubeId(formData.video_url)}`}
                                                    title="YouTube Video Preview"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    className="w-full h-full border-0"
                                                />
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Auto-thumbnail YouTube aktif
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCustomCover(!showCustomCover)}
                                                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                                                >
                                                    {showCustomCover ? 'Gunakan Auto-Thumbnail' : 'Ganti Cover Kustom (Opsional)'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* Optional Custom Cover Upload for Video */}
                                    {(showCustomCover || !extractYoutubeId(formData.video_url)) && (
                                        <div className="pt-2 border-t border-rose-100 dark:border-rose-900/40">
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                Foto Cover Kustom (Opsional)
                                            </label>
                                            <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center bg-white dark:bg-slate-900">
                                                {filePreview && !filePreview.includes('img.youtube.com') ? (
                                                    <div className="relative aspect-16/9 w-full rounded-lg overflow-hidden max-h-36 mx-auto">
                                                        <img src={filePreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const ytId = extractYoutubeId(formData.video_url);
                                                                const fallback = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '';
                                                                setFilePreview(fallback);
                                                                setFormData({ ...formData, image_file: null, image_url: fallback });
                                                            }}
                                                            className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-md shadow-xs hover:bg-rose-700"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="flex flex-col items-center justify-center cursor-pointer py-2">
                                                        <Upload className="w-4 h-4 text-slate-400 mb-1" />
                                                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                            Unggah Cover Gambar Sendiri
                                                        </span>
                                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Section Khusus Foto */
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Foto Karya Portofolio <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-slate-300 dark:hover:border-slate-600 transition-colors bg-slate-50/50 dark:bg-slate-800/40">
                                        {filePreview && !filePreview.includes('img.youtube.com') ? (
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
                            )}

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

                            </div>

                            {/* Fixed Sticky Footer with Always Visible Actions */}
                            <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xs flex items-center justify-end gap-2.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{ backgroundColor: accentColor }}
                                    className="px-5 py-2 text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                >
                                    {isSubmitting ? (
                                        <span>Menyimpan...</span>
                                    ) : selectedPortfolio ? (
                                        <span>Simpan Perubahan</span>
                                    ) : formData.media_type === 'video' ? (
                                        <>
                                            <Play className="w-3.5 h-3.5 fill-current" />
                                            <span>Tambah Video</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Tambah Foto</span>
                                        </>
                                    )}
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

            {/* ── 9. PREVIEW LIGHTBOX / YOUTUBE PLAYER MODAL ── */}
            {previewModalItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
                    onClick={() => setPreviewModalItem(null)}
                >
                    <div 
                        className="relative w-full max-w-4xl max-h-[92vh] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Toolbar */}
                        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-slate-900 border-b border-slate-800 text-white shrink-0">
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                                {(previewModalItem.media_type === 'video' || previewModalItem.video_url) && (
                                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1 shrink-0">
                                        <Play className="w-2.5 h-2.5 fill-current" />
                                        YouTube Video
                                    </span>
                                )}
                                <h4 className="text-xs sm:text-sm font-bold truncate">
                                    {previewModalItem.title}
                                </h4>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {previewModalItem.video_url && (
                                    <a
                                        href={previewModalItem.video_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                                    >
                                        <span>Buka YouTube</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setPreviewModalItem(null)}
                                    className="p-1.5 bg-white/10 hover:bg-rose-600 text-white rounded-lg transition-colors cursor-pointer"
                                    title="Tutup (Esc)"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Player / Image Viewer Body */}
                        <div className="p-3 sm:p-5 flex-1 min-h-0 flex items-center justify-center bg-black/50 overflow-hidden">
                            {(previewModalItem.media_type === 'video' || previewModalItem.video_url) && extractYoutubeId(previewModalItem.video_url) ? (
                                <div className="relative aspect-video w-full max-w-3xl rounded-xl overflow-hidden bg-black shadow-2xl">
                                    <iframe
                                        src={`https://www.youtube-nocookie.com/embed/${extractYoutubeId(previewModalItem.video_url)}?autoplay=1`}
                                        title={previewModalItem.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full border-0"
                                    />
                                </div>
                            ) : (
                                <img
                                    src={previewModalItem.image_url}
                                    alt={previewModalItem.title}
                                    className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                                />
                            )}
                        </div>

                        {/* Caption Footer */}
                        {previewModalItem.caption && (
                            <div className="px-4 sm:px-5 py-3 bg-slate-900/90 border-t border-slate-800 text-slate-300 text-xs shrink-0">
                                {previewModalItem.caption}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
