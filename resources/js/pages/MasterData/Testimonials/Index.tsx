import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import {
    Star,
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    Clock,
    XCircle,
    User,
    Sparkles,
    MessageSquareQuote,
    Filter,
    X,
    ExternalLink,
} from 'lucide-react';
import SettingsTabNav from '@/components/SettingsTabNav';

interface TestimonialItem {
    id: string;
    client_name: string;
    package_name?: string;
    project_id?: string;
    client_id?: string;
    rating: number;
    comment: string;
    avatar?: string;
    is_featured: boolean;
    status: 'approved' | 'pending' | 'rejected';
    sort_order: number;
    created_at?: string;
}

interface TestimonialsIndexProps {
    testimonials?: {
        data: TestimonialItem[];
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
        approved: number;
        pending: number;
        featured: number;
    };
    projects?: Array<{ id: string; name: string; project_number: string }>;
    clients?: Array<{ id: string; name: string }>;
    filters?: {
        search?: string;
        status?: string;
        per_page?: number;
    };
}

export default function TestimonialsIndex({
    testimonials = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0 },
    stats = { total: 0, approved: 0, pending: 0, featured: 0 },
    projects = [],
    clients = [],
    filters = {},
}: TestimonialsIndexProps) {
    const { props: pageProps } = usePage<any>();
    const accentColor = pageProps?.appSettings?.primary_accent_color || '#C98922';
    const headingColor = pageProps?.appSettings?.app_heading_color || '#0F172A';
    const mutedColor = pageProps?.appSettings?.app_muted_text_color || '#64748B';

    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<TestimonialItem | null>(null);

    const [formData, setFormData] = useState({
        client_name: '',
        package_name: 'Paket Wedding Luxury',
        project_id: '',
        client_id: '',
        rating: 5,
        comment: '',
        avatar_url: '',
        avatar_file: null as File | null,
        is_featured: true,
        status: 'approved' as 'approved' | 'pending' | 'rejected',
        sort_order: 0,
    });
    const [avatarPreview, setAvatarPreview] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/master-data/testimonials', { search, status: statusFilter }, { preserveState: true });
    };

    const handleFilterStatus = (status: string) => {
        setStatusFilter(status);
        router.get('/master-data/testimonials', { search, status }, { preserveState: true });
    };

    const handleOpenCreate = () => {
        setSelectedItem(null);
        setFormData({
            client_name: '',
            package_name: 'Paket Wedding Luxury',
            project_id: '',
            client_id: '',
            rating: 5,
            comment: '',
            avatar_url: '',
            avatar_file: null,
            is_featured: true,
            status: 'approved',
            sort_order: (testimonials.total || 0) + 1,
        });
        setAvatarPreview('');
        setModalOpen(true);
    };

    const handleOpenEdit = (item: TestimonialItem) => {
        setSelectedItem(item);
        setFormData({
            client_name: item.client_name,
            package_name: item.package_name || '',
            project_id: item.project_id || '',
            client_id: item.client_id || '',
            rating: item.rating,
            comment: item.comment,
            avatar_url: item.avatar || '',
            avatar_file: null,
            is_featured: item.is_featured,
            status: item.status,
            sort_order: item.sort_order,
        });
        setAvatarPreview(item.avatar || '');
        setModalOpen(true);
    };

    const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, avatar_file: file });
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const form = new FormData();
        form.append('client_name', formData.client_name);
        form.append('package_name', formData.package_name);
        if (formData.project_id) form.append('project_id', formData.project_id);
        if (formData.client_id) form.append('client_id', formData.client_id);
        form.append('rating', String(formData.rating));
        form.append('comment', formData.comment);
        form.append('is_featured', formData.is_featured ? '1' : '0');
        form.append('status', formData.status);
        form.append('sort_order', String(formData.sort_order));

        if (formData.avatar_file) {
            form.append('avatar_file', formData.avatar_file);
        } else if (formData.avatar_url) {
            form.append('avatar_url', formData.avatar_url);
        }

        if (selectedItem) {
            form.append('_method', 'PUT');
            router.post(`/master-data/testimonials/${selectedItem.id}`, form, {
                onSuccess: () => {
                    toast.success('Ulasan klien berhasil diperbarui');
                    setModalOpen(false);
                },
                onError: (err) => {
                    toast.error(Object.values(err)[0] as string || 'Gagal menyimpan ulasan');
                },
            });
        } else {
            router.post('/master-data/testimonials', form, {
                onSuccess: () => {
                    toast.success('Ulasan klien baru berhasil ditambahkan');
                    setModalOpen(false);
                },
                onError: (err) => {
                    toast.error(Object.values(err)[0] as string || 'Gagal menambahkan ulasan');
                },
            });
        }
    };

    const handleDelete = () => {
        if (!selectedItem) return;
        router.delete(`/master-data/testimonials/${selectedItem.id}`, {
            onSuccess: () => {
                toast.success('Ulasan berhasil dihapus');
                setDeleteModalOpen(false);
            },
        });
    };

    const handleToggleStatus = (item: TestimonialItem, nextStatus: 'approved' | 'pending' | 'rejected') => {
        router.put(`/master-data/testimonials/${item.id}`, {
            client_name: item.client_name,
            package_name: item.package_name,
            rating: item.rating,
            comment: item.comment,
            status: nextStatus,
            is_featured: item.is_featured,
            sort_order: item.sort_order,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Status ulasan berhasil diubah ke ${nextStatus}`),
        });
    };

    return (
        <div className="w-full max-w-full space-y-6 pb-20">
            <Head title="Ulasan Klien - Setting Admin" />

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
            <SettingsTabNav activeMainTab="admin" activeAdminSubTab="testimonials" accentColor={accentColor} />

            {/* ── 3. SUB-SECTION TITLE & ACTIONS: ULASAN & TESTIMONI KLIEN ──────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
                        >
                            <MessageSquareQuote className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Ulasan &amp; Testimoni Klien
                        </h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 sm:ml-11">
                        Kelola ulasan, kepuasan bintang, dan apresiasi klien yang tampil di dashboard portal klien.
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
                        <span>Tambah Ulasan</span>
                    </button>
                </div>
            </div>

            {/* ── 4. TOP STAT CARDS ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
                    >
                        <MessageSquareQuote className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Total Ulasan</span>
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
                        <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Disetujui / Aktif</span>
                        <h2 className="text-2xl font-black text-emerald-600 tracking-tight font-sans">
                            {stats.approved}
                        </h2>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Menunggu Review</span>
                        <h2 className="text-2xl font-black text-amber-600 tracking-tight font-sans">
                            {stats.pending}
                        </h2>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Featured di Portal</span>
                        <h2 className="text-2xl font-black text-purple-600 tracking-tight font-sans">
                            {stats.featured}
                        </h2>
                    </div>
                </div>
            </div>

            {/* ── 3. SEARCH & STATUS FILTER BAR ───────────────────────────── */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
                <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama klien, komentar..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                    />
                </form>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                    {[
                        { id: 'all', label: 'Semua Status' },
                        { id: 'approved', label: 'Disetujui' },
                        { id: 'pending', label: 'Menunggu' },
                        { id: 'rejected', label: 'Ditolak' },
                    ].map((st) => (
                        <button
                            key={st.id}
                            type="button"
                            onClick={() => handleFilterStatus(st.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer capitalize ${statusFilter === st.id
                                    ? 'bg-[#3B46F1] text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {st.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── TESTIMONIALS GRID CARDS ──────────────────────────────── */}
            {testimonials.data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {testimonials.data.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                        >
                            <div className="space-y-3">
                                {/* Author & Rating Row */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                            {item.avatar ? (
                                                <img src={item.avatar} alt={item.client_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm bg-slate-200">
                                                    {item.client_name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xs text-slate-900 leading-tight">{item.client_name}</h4>
                                            <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{item.package_name || 'Dokumentasi'}</p>
                                        </div>
                                    </div>

                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${item.status === 'approved'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : item.status === 'pending'
                                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                            }`}
                                    >
                                        {item.status}
                                    </span>
                                </div>

                                {/* Star Ratings */}
                                <div className="flex items-center gap-1 text-amber-500">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3.5 h-3.5 ${i < item.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'
                                                }`}
                                        />
                                    ))}
                                    <span className="text-xs font-bold text-slate-700 ml-1.5">{item.rating}.0</span>
                                </div>

                                {/* Comment Quote */}
                                <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-3">
                                    "{item.comment}"
                                </p>
                            </div>

                            {/* Actions Bar */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    {item.status !== 'approved' && (
                                        <button
                                            type="button"
                                            onClick={() => handleToggleStatus(item, 'approved')}
                                            className="text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                                        >
                                            Setujui
                                        </button>
                                    )}
                                    {item.status !== 'rejected' && (
                                        <button
                                            type="button"
                                            onClick={() => handleToggleStatus(item, 'rejected')}
                                            className="text-[11px] font-bold text-slate-500 hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                                        >
                                            Tolak
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenEdit(item)}
                                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                                        title="Edit Ulasan"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedItem(item);
                                            setDeleteModalOpen(true);
                                        }}
                                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                        title="Hapus Ulasan"
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
                    <MessageSquareQuote className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="font-bold text-sm text-slate-800">Belum Ada Ulasan Klien</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Tambahkan testimoni kepuasan klien untuk meningkatkan kepercayaan calon pelanggan.
                    </p>
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        style={{ backgroundColor: accentColor }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold hover:brightness-110 transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Ulasan Pertama</span>
                    </button>
                </div>
            )}

            {/* Pagination */}
            {testimonials.total > (testimonials.per_page || 10) && (
                <div className="pt-4">
                    <Pagination
                        currentPage={testimonials.current_page || 1}
                        lastPage={testimonials.last_page || 1}
                        total={testimonials.total}
                        from={testimonials.from}
                        to={testimonials.to}
                        perPage={testimonials.per_page || 10}
                        itemLabel="ulasan client"
                        onPageChange={(page) => {
                            router.get(window.location.pathname, { page, search, status: statusFilter }, { preserveState: true });
                        }}
                    />
                </div>
            )}

            {/* ── MODAL FORM CREATE / EDIT ──────────────────────────────────── */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                <span>{selectedItem ? 'Edit Ulasan Klien' : 'Tambah Ulasan Klien Baru'}</span>
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
                            {/* Nama Klien & Paket */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase">Nama Klien *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.client_name}
                                        onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                        placeholder="Contoh: Budi & Rina"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase">Nama Paket Foto</label>
                                    <input
                                        type="text"
                                        value={formData.package_name}
                                        onChange={(e) => setFormData({ ...formData, package_name: e.target.value })}
                                        placeholder="Contoh: Paket Wedding Luxury"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>
                            </div>

                            {/* Rating Bintang */}
                            <div>
                                <label className="text-[11px] font-bold text-slate-700 mb-1.5 block uppercase">Rating Kepuasan</label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                                        >
                                            <Star
                                                className={`w-6 h-6 ${star <= formData.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                    <span className="text-xs font-bold text-slate-700 ml-2">{formData.rating} dari 5 Bintang</span>
                                </div>
                            </div>

                            {/* Isi Komentar */}
                            <div>
                                <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase">Isi Testimoni / Ulasan *</label>
                                <textarea
                                    rows={4}
                                    required
                                    value={formData.comment}
                                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                    placeholder="Tulis ulasan dan pengalaman klien..."
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                                />
                            </div>

                            {/* Avatar Klien */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-700 block uppercase">Foto Avatar Klien</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarFileChange}
                                        className="text-xs file:mr-3 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={formData.avatar_url}
                                    onChange={(e) => {
                                        setFormData({ ...formData, avatar_url: e.target.value });
                                        setAvatarPreview(e.target.value);
                                    }}
                                    placeholder="Atau URL gambar avatar..."
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                                {avatarPreview && (
                                    <div className="flex items-center gap-3 pt-1">
                                        <img src={avatarPreview} alt="Preview" className="w-10 h-10 rounded-full object-cover border" />
                                        <span className="text-[11px] text-slate-400">Preview Avatar</span>
                                    </div>
                                )}
                            </div>

                            {/* Status & Featured */}
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                                    >
                                        <option value="approved">Approved (Disetujui)</option>
                                        <option value="pending">Pending (Menunggu)</option>
                                        <option value="rejected">Rejected (Ditolak)</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_featured}
                                            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                            className="w-4 h-4 rounded text-[#240B10] focus:ring-[#240B10]"
                                        />
                                        <span className="text-xs font-bold text-slate-800">Featured di Dashboard</span>
                                    </label>
                                </div>
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
                                    {selectedItem ? 'Simpan Perubahan' : 'Tambah Ulasan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL DELETE CONFIRMATION ──────────────────────────────────── */}
            {deleteModalOpen && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-black text-sm text-slate-900">Hapus Ulasan Klien?</h3>
                            <p className="text-xs text-slate-500">
                                Apakah Anda yakin ingin menghapus ulasan dari <strong>"{selectedItem.client_name}"</strong>?
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
