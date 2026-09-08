import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import {
    Sparkles,
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    Upload,
    ExternalLink,
    Image as ImageIcon,
    CheckCircle2,
    Tag,
    X,
    Layers,
} from 'lucide-react';
import SettingsTabNav from '@/components/SettingsTabNav';

interface PromoSlideItem {
    id: string;
    project_id?: string | null;
    project?: {
        id: string;
        name: string;
        project_number?: string;
    } | null;
    title: string;
    tag: string;
    description?: string;
    button_text: string;
    button_url: string;
    image: string;
    is_active: boolean;
    sort_order: number;
    created_at?: string;
}

interface PromoSlidesIndexProps {
    slides?: {
        data: PromoSlideItem[];
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
        general?: number;
        project?: number;
    };
    filters?: {
        search?: string;
        per_page?: number;
        type?: string;
        project_id?: string;
    };
}

export default function PromoSlidesIndex({
    slides = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0 },
    stats = { total: 0, active: 0, inactive: 0 },
    filters = {},
}: PromoSlidesIndexProps) {
    const { props: pageProps } = usePage<any>();
    const accentColor = pageProps?.appSettings?.primary_accent_color || '#C98922';
    const headingColor = pageProps?.appSettings?.app_heading_color || '#0F172A';
    const mutedColor = pageProps?.appSettings?.app_muted_text_color || '#64748B';

    const [search, setSearch] = useState(filters.search || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedSlide, setSelectedSlide] = useState<PromoSlideItem | null>(null);
    const [previewBannerSlide, setPreviewBannerSlide] = useState<PromoSlideItem | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        tag: 'SPECIAL OFFER',
        description: '',
        button_text: 'Lihat Promo Selengkapnya',
        button_url: '/form-klien',
        image_url: '',
        image_file: null as File | null,
        is_active: true,
        sort_order: 0,
    });
    const [filePreview, setFilePreview] = useState<string>('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/master-data/promo-slides', { search }, { preserveState: true });
    };

    const handleOpenCreate = () => {
        setSelectedSlide(null);
        setFormData({
            title: '',
            tag: 'SPECIAL OFFER',
            description: '',
            button_text: 'Lihat Promo Selengkapnya',
            button_url: '/form-klien',
            image_url: '',
            image_file: null,
            is_active: true,
            sort_order: (slides.total || 0) + 1,
        });
        setFilePreview('');
        setModalOpen(true);
    };

    const handleOpenEdit = (slide: PromoSlideItem) => {
        setSelectedSlide(slide);
        setFormData({
            title: slide.title,
            tag: slide.tag,
            description: slide.description || '',
            button_text: slide.button_text,
            button_url: slide.button_url,
            image_url: slide.image,
            image_file: null,
            is_active: slide.is_active,
            sort_order: slide.sort_order,
        });
        setFilePreview(slide.image);
        setModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, image_file: file });
            setFilePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const form = new FormData();
        form.append('title', formData.title);
        form.append('tag', formData.tag);
        form.append('description', formData.description);
        form.append('button_text', formData.button_text);
        form.append('button_url', formData.button_url);
        form.append('is_active', formData.is_active ? '1' : '0');
        form.append('sort_order', String(formData.sort_order));

        if (formData.image_file) {
            form.append('image_file', formData.image_file);
        } else if (formData.image_url) {
            form.append('image_url', formData.image_url);
        }

        if (selectedSlide) {
            form.append('_method', 'PUT');
            router.post(`/master-data/promo-slides/${selectedSlide.id}`, form, {
                onSuccess: () => {
                    toast.success('Promo Slide berhasil diperbarui');
                    setModalOpen(false);
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string || 'Gagal menyimpan slide');
                },
            });
        } else {
            router.post('/master-data/promo-slides', form, {
                onSuccess: () => {
                    toast.success('Promo Slide baru berhasil dibuat');
                    setModalOpen(false);
                },
                onError: (errors) => {
                    toast.error(Object.values(errors)[0] as string || 'Gagal membuat slide');
                },
            });
        }
    };

    const handleDelete = () => {
        if (!selectedSlide) return;
        router.delete(`/master-data/promo-slides/${selectedSlide.id}`, {
            onSuccess: () => {
                toast.success('Promo Slide berhasil dihapus');
                setDeleteModalOpen(false);
            },
        });
    };

    const handleToggleActive = (slide: PromoSlideItem) => {
        router.put(`/master-data/promo-slides/${slide.id}`, {
            title: slide.title,
            tag: slide.tag,
            description: slide.description,
            button_text: slide.button_text,
            button_url: slide.button_url,
            is_active: !slide.is_active,
            sort_order: slide.sort_order,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Status ${slide.title} berhasil diubah`),
        });
    };

    return (
        <div className="w-full max-w-full space-y-6 pb-20">
            <Head title="Promo Slide - Setting Admin" />

            {/* ── 1. HEADER UTAMA PENGATURAN ADMIN (Sama persis dengan Admin.tsx) ── */}
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
                        Kelola identitas perusahaan, preferensi sistem, penomoran dokumen, dan backup data studio.
                    </p>
                </div>
            </div>

            {/* ── 2. TAB NAVIGASI HORIZONTAL (Posisi & warna identik dengan Admin.tsx) ── */}
            <SettingsTabNav activeMainTab="admin" activeAdminSubTab="promo_slides" accentColor={accentColor} />

            {/* ── 3. SUB-SECTION TITLE & ACTIONS: PROMO SLIDE PORTAL KLIEN ──────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
                        >
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Promo Slide Portal Klien
                        </h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 sm:ml-11">
                        Kelola banner hero slider promosi yang tampil interaktif di dashboard portal klien.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:ml-auto">
                    <Link
                        href="/client/dashboard"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                    >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        <span>Preview di Portal</span>
                    </Link>
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        style={{ backgroundColor: accentColor }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.02] cursor-pointer shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Promo Slide</span>
                    </button>
                </div>
            </div>

            {/* ── 4. TOP STAT CARDS ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
                    >
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Total Slide</span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                            {stats.total}
                        </h2>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Aktif di Portal</span>
                        <h2 className="text-2xl font-black text-emerald-600 tracking-tight font-sans">
                            {stats.active}
                        </h2>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                        <EyeOff className="w-6 h-6 text-slate-500" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Nonaktif</span>
                        <h2 className="text-2xl font-black text-slate-600 tracking-tight font-sans">
                            {stats.inactive}
                        </h2>
                    </div>
                </div>
            </div>

            {/* ── 3. SEARCH & FILTER ───────────────────────────────────────────── */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
                <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari promo slide..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                    />
                </form>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => router.get('/master-data/promo-slides', { search, type: undefined }, { preserveState: true })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            !filters.type || filters.type === 'all'
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Semua ({stats.total || 0})
                    </button>
                    <button
                        type="button"
                        onClick={() => router.get('/master-data/promo-slides', { search, type: 'general' }, { preserveState: true })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            filters.type === 'general'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <Sparkles className="w-3 h-3" />
                        <span>Slide Umum ({stats.general ?? 0})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => router.get('/master-data/promo-slides', { search, type: 'project' }, { preserveState: true })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            filters.type === 'project'
                                ? 'bg-[#3B46F1] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <Layers className="w-3 h-3" />
                        <span>Slide Project ({stats.project ?? 0})</span>
                    </button>
                </div>
            </div>

                {/* ── PROMO SLIDES CARDS GRID ───────────────────────────────── */}
                {slides.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {slides.data.map((slide) => (
                            <div
                                key={slide.id}
                                className={`rounded-2xl border bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                                    slide.is_active ? 'border-slate-200/80' : 'border-slate-200 opacity-60'
                                }`}
                            >
                                <div className="space-y-3">
                                    {/* Slide Image Preview */}
                                    <div className="aspect-[16/9] bg-slate-900 relative overflow-hidden group">
                                        <img
                                            src={slide.image}
                                            alt={slide.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                        <div className="absolute top-3 left-3">
                                            <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-xs">
                                                {slide.tag}
                                            </span>
                                        </div>
                                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                    slide.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                                                }`}
                                            >
                                                {slide.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <p className="text-white text-xs font-bold truncate">{slide.title}</p>
                                        </div>
                                    </div>

                                    {/* Slide Content Description */}
                                    <div className="p-4 pt-2 space-y-2.5">
                                        {slide.project ? (
                                            <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-indigo-800 text-[11px] font-semibold">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <Layers className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                                    <span className="truncate">Project: {slide.project.name}</span>
                                                </div>
                                                <Link
                                                    href={`/projects/${slide.project.id}`}
                                                    className="inline-flex items-center gap-0.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-900 shrink-0"
                                                    title="Buka Project"
                                                >
                                                    <span>Buka</span>
                                                    <ExternalLink className="w-2.5 h-2.5" />
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50/70 border border-amber-100/80 text-amber-800 text-[11px] font-medium">
                                                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                <span>Slide Umum Studio (Semua Klien)</span>
                                            </div>
                                        )}

                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                            {slide.description || 'Tidak ada deskripsi promo.'}
                                        </p>
                                        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 text-slate-500">
                                            <span>Tombol: <strong>{slide.button_text}</strong></span>
                                            <span>Urutan: #{slide.sort_order}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => handleToggleActive(slide)}
                                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                                            slide.is_active
                                                ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                                                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                        }`}
                                    >
                                        {slide.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        <span>{slide.is_active ? 'Nonaktifkan' : 'Aktifkan'}</span>
                                    </button>

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEdit(slide)}
                                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                                            title="Edit Promo Slide"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedSlide(slide);
                                                setDeleteModalOpen(true);
                                            }}
                                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                            title="Hapus Promo Slide"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
                        <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
                        <h3 className="font-bold text-sm text-slate-800">Belum Ada Promo Slide</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Tambahkan promo slide untuk menyapa klien di portal dengan penawaran eksklusif.
                        </p>
                        <button
                            type="button"
                            onClick={handleOpenCreate}
                            style={{ backgroundColor: accentColor }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold hover:brightness-110 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Slide Pertama</span>
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {slides.total > (slides.per_page || 10) && (
                    <div className="pt-4">
                        <Pagination
                            currentPage={slides.current_page || 1}
                            lastPage={slides.last_page || 1}
                            total={slides.total}
                            from={slides.from}
                            to={slides.to}
                            perPage={slides.per_page || 10}
                            itemLabel="slide promo"
                            onPageChange={(page) => {
                                router.get(window.location.pathname, { page, search }, { preserveState: true });
                            }}
                        />
                    </div>
                )}

            {/* ── MODAL CREATE / EDIT ───────────────────────────────────────── */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <span>{selectedSlide ? 'Edit Promo Slide' : 'Tambah Promo Slide Baru'}</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            {/* Tag & Urutan */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase">Tag Promo</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.tag}
                                        onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                        placeholder="Contoh: SPECIAL OFFER"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase">Urutan Tampil</label>
                                    <input
                                        type="number"
                                        value={formData.sort_order}
                                        onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            {/* Judul Slide */}
                            <div>
                                <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase">Judul Promo *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Contoh: Cinematic Drone & 4K Wedding Story"
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                            </div>

                            {/* Deskripsi */}
                            <div>
                                <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase">Deskripsi Promo</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Jelaskan penawaran atau keuntungan promo..."
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                                />
                            </div>

                            {/* Tombol Teks & Link URL */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase">Teks Tombol *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.button_text}
                                        onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                                        placeholder="Contoh: Booking Sekarang"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase">Tujuan Link URL</label>
                                    <input
                                        type="text"
                                        value={formData.button_url}
                                        onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                                        placeholder="/form-klien atau https://wa.me/..."
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            {/* Foto Banner / Upload */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-700 block uppercase">Foto Banner (WebP Optimized)</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="text-xs file:mr-3 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                    />
                                </div>
                                <div className="text-[11px] text-slate-400">Atau masukkan URL gambar langsung:</div>
                                <input
                                    type="text"
                                    value={formData.image_url}
                                    onChange={(e) => {
                                        setFormData({ ...formData, image_url: e.target.value });
                                        setFilePreview(e.target.value);
                                    }}
                                    placeholder="https://images.unsplash.com/... atau /images/..."
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />

                                {filePreview && (
                                    <div className="mt-2 aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                                        <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                                            Preview Banner
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Status Aktif Switch */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <span className="text-xs font-bold text-slate-800">Aktifkan Slide di Portal Klien</span>
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded text-[#240B10] focus:ring-[#240B10] cursor-pointer"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    style={{ backgroundColor: accentColor }}
                                    className="px-5 py-2 rounded-xl text-white font-bold text-xs hover:brightness-110 transition-all cursor-pointer"
                                >
                                    {selectedSlide ? 'Simpan Perubahan' : 'Tambah Promo Slide'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL DELETE CONFIRMATION ──────────────────────────────────── */}
            {deleteModalOpen && selectedSlide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-black text-sm text-slate-900">Hapus Promo Slide?</h3>
                            <p className="text-xs text-slate-500">
                                Apakah Anda yakin ingin menghapus banner promo <strong>"{selectedSlide.title}"</strong>?
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer"
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
