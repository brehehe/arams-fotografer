import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import {
    Instagram,
    Plus,
    Search,
    Edit2,
    Trash2,
    Heart,
    MessageCircle,
    ExternalLink,
    Eye,
    EyeOff,
    Upload,
    Sparkles,
    Image as ImageIcon,
    X,
} from 'lucide-react';

interface InstagramPostItem {
    id: string;
    image_url: string;
    caption?: string;
    post_url?: string;
    likes_count: number;
    comments_count: number;
    media_type: string;
    is_active: boolean;
    sort_order: number;
    created_at?: string;
}

interface InstagramPostsIndexProps {
    posts?: {
        data: InstagramPostItem[];
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
    };
    filters?: {
        search?: string;
        per_page?: number;
    };
}

export default function InstagramPostsIndex({
    posts = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0 },
    stats = { total: 0, active: 0, inactive: 0 },
    filters = {},
}: InstagramPostsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InstagramPostItem | null>(null);

    const [formData, setFormData] = useState({
        image_url: '',
        image_file: null as File | null,
        caption: '',
        post_url: 'https://instagram.com/aramspictures',
        likes_count: 180,
        comments_count: 15,
        media_type: 'photo',
        is_active: true,
        sort_order: 0,
    });
    const [imagePreview, setImagePreview] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/master-data/instagram-posts', { search }, { preserveState: true });
    };

    const handleOpenCreate = () => {
        setSelectedItem(null);
        setFormData({
            image_url: '',
            image_file: null,
            caption: '',
            post_url: 'https://instagram.com/aramspictures',
            likes_count: 180,
            comments_count: 15,
            media_type: 'photo',
            is_active: true,
            sort_order: (posts.total || 0) + 1,
        });
        setImagePreview('');
        setModalOpen(true);
    };

    const handleOpenEdit = (item: InstagramPostItem) => {
        setSelectedItem(item);
        setFormData({
            image_url: item.image_url,
            image_file: null,
            caption: item.caption || '',
            post_url: item.post_url || 'https://instagram.com/aramspictures',
            likes_count: item.likes_count,
            comments_count: item.comments_count,
            media_type: item.media_type,
            is_active: item.is_active,
            sort_order: item.sort_order,
        });
        setImagePreview(item.image_url);
        setModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, image_file: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const form = new FormData();
        form.append('caption', formData.caption);
        form.append('post_url', formData.post_url);
        form.append('likes_count', String(formData.likes_count));
        form.append('comments_count', String(formData.comments_count));
        form.append('media_type', formData.media_type);
        form.append('is_active', formData.is_active ? '1' : '0');
        form.append('sort_order', String(formData.sort_order));

        if (formData.image_file) {
            form.append('image_file', formData.image_file);
        } else if (formData.image_url) {
            form.append('image_url', formData.image_url);
        }

        if (selectedItem) {
            form.append('_method', 'PUT');
            router.post(`/master-data/instagram-posts/${selectedItem.id}`, form, {
                onSuccess: () => {
                    toast.success('Postingan Instagram berhasil diperbarui');
                    setModalOpen(false);
                },
                onError: (err) => {
                    toast.error(Object.values(err)[0] as string || 'Gagal menyimpan postingan');
                },
            });
        } else {
            router.post('/master-data/instagram-posts', form, {
                onSuccess: () => {
                    toast.success('Postingan Instagram berhasil ditambahkan');
                    setModalOpen(false);
                },
                onError: (err) => {
                    toast.error(Object.values(err)[0] as string || 'Gagal menambahkan postingan');
                },
            });
        }
    };

    const handleDelete = () => {
        if (!selectedItem) return;
        router.delete(`/master-data/instagram-posts/${selectedItem.id}`, {
            onSuccess: () => {
                toast.success('Postingan berhasil dihapus');
                setDeleteModalOpen(false);
            },
        });
    };

    const handleToggleActive = (item: InstagramPostItem) => {
        router.put(`/master-data/instagram-posts/${item.id}`, {
            caption: item.caption,
            post_url: item.post_url,
            likes_count: item.likes_count,
            comments_count: item.comments_count,
            media_type: item.media_type,
            is_active: !item.is_active,
            sort_order: item.sort_order,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Status postingan berhasil diubah`),
        });
    };

    return (
        <div className="w-full max-w-full space-y-6 pb-20">
            <Head title="Instagram Kami - Master Data" />

            {/* ── 1. BREADCRUMB & HEADER SECTION ────────────────────────────────── */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs">
                    <Link
                        href="/master-data/categories"
                        className="text-slate-500 hover:text-slate-800 transition-colors font-medium"
                    >
                        Master Data
                    </Link>
                    <span className="text-slate-400">›</span>
                    <span className="text-[#F59E0B] font-bold">Instagram Kami</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                            <Instagram className="w-6 h-6 text-rose-600" />
                            <span>Feed Instagram Studio</span>
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Kelola foto-foto feed dan tautan Instagram studio yang tampil pada galeri dashboard klien.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Link
                            href="/client/dashboard"
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                        >
                            <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Preview di Portal</span>
                        </Link>
                        <button
                            type="button"
                            onClick={handleOpenCreate}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.02] cursor-pointer shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Postingan Instagram</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── 2. TOP STAT CARDS ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FDF2F8] flex items-center justify-center shrink-0">
                        <Instagram className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">Total Feed</span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                            {stats.total}
                        </h2>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <Eye className="w-6 h-6 text-emerald-600" />
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

            {/* ── 3. SEARCH BAR ────────────────────────────────────────────── */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
                <form onSubmit={handleSearch} className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari caption Instagram..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                    />
                </form>
            </div>

                {/* ── INSTAGRAM POSTS GRID ──────────────────────────────────── */}
                {posts.data.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {posts.data.map((item) => (
                            <div
                                key={item.id}
                                className={`rounded-2xl border bg-white overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                                    item.is_active ? 'border-slate-200/80' : 'border-slate-200 opacity-60'
                                }`}
                            >
                                <div className="aspect-square bg-slate-900 relative overflow-hidden group">
                                    <img
                                        src={item.image_url}
                                        alt={item.caption || 'Instagram'}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white p-2">
                                        <div className="flex items-center gap-3 text-xs font-bold">
                                            <span className="flex items-center gap-1">
                                                <Heart className="w-3.5 h-3.5 fill-current" />
                                                {item.likes_count}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                                {item.comments_count}
                                            </span>
                                        </div>
                                        {item.post_url && (
                                            <a
                                                href={item.post_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                                                title="Buka di Instagram"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <span
                                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                                item.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                                            }`}
                                        >
                                            {item.is_active ? 'Aktif' : 'Off'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-2.5 space-y-1.5">
                                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight">
                                        {item.caption || 'Tidak ada caption.'}
                                    </p>
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                                        <span>#{item.sort_order}</span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleActive(item)}
                                                className="p-1 hover:text-slate-900 transition-colors cursor-pointer"
                                                title={item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                            >
                                                {item.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEdit(item)}
                                                className="p-1 hover:text-slate-900 transition-colors cursor-pointer"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setDeleteModalOpen(true);
                                                }}
                                                className="p-1 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
                        <Instagram className="w-10 h-10 text-slate-300 mx-auto" />
                        <h3 className="font-bold text-sm text-slate-800">Belum Ada Postingan Instagram</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Tambahkan foto-foto feeds Instagram studio untuk ditampilkan di dashboard klien.
                        </p>
                        <button
                            type="button"
                            onClick={handleOpenCreate}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#240B10] text-white text-xs font-bold hover:bg-[#380E13] transition-colors cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Foto Pertama</span>
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {posts.total > (posts.per_page || 12) && (
                    <div className="pt-4">
                        <Pagination
                            currentPage={posts.current_page || 1}
                            lastPage={posts.last_page || 1}
                            total={posts.total}
                            from={posts.from}
                            to={posts.to}
                            perPage={posts.per_page || 12}
                            itemLabel="postingan instagram"
                            onPageChange={(page) => {
                                router.get(window.location.pathname, { page, search }, { preserveState: true });
                            }}
                        />
                    </div>
                )}

            {/* ── MODAL CREATE / EDIT ───────────────────────────────────────── */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <Instagram className="w-4 h-4 text-rose-600" />
                                <span>{selectedItem ? 'Edit Postingan Instagram' : 'Tambah Foto Instagram'}</span>
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
                            {/* Upload / URL Foto */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-700 block uppercase">Foto Feed Instagram *</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="text-xs file:mr-3 file:py-1.5 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                />
                                <input
                                    type="text"
                                    value={formData.image_url}
                                    onChange={(e) => {
                                        setFormData({ ...formData, image_url: e.target.value });
                                        setImagePreview(e.target.value);
                                    }}
                                    placeholder="Atau URL gambar..."
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                                {imagePreview && (
                                    <div className="mt-2 aspect-square max-w-[200px] mx-auto rounded-xl overflow-hidden bg-slate-100 border relative">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            {/* Caption */}
                            <div>
                                <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase">Caption</label>
                                <textarea
                                    rows={3}
                                    value={formData.caption}
                                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                                    placeholder="Tulis kutipan / caption postingan..."
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                                />
                            </div>

                            {/* Link Instagram */}
                            <div>
                                <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase">Link Postingan Instagram</label>
                                <input
                                    type="text"
                                    value={formData.post_url}
                                    onChange={(e) => setFormData({ ...formData, post_url: e.target.value })}
                                    placeholder="https://instagram.com/p/..."
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                            </div>

                            {/* Likes & Comments Counter */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase">Jumlah Likes</label>
                                    <input
                                        type="number"
                                        value={formData.likes_count}
                                        onChange={(e) => setFormData({ ...formData, likes_count: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase">Jumlah Komentar</label>
                                    <input
                                        type="number"
                                        value={formData.comments_count}
                                        onChange={(e) => setFormData({ ...formData, comments_count: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                                    />
                                </div>
                            </div>

                            {/* Urutan & Aktif */}
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 mb-1 block uppercase">Urutan Tampil</label>
                                    <input
                                        type="number"
                                        value={formData.sort_order}
                                        onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                                    />
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-4 h-4 rounded text-[#240B10] focus:ring-[#240B10]"
                                        />
                                        <span className="text-xs font-bold text-slate-800">Aktif di Portal</span>
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
                                    className="px-5 py-2 rounded-xl bg-[#240B10] hover:bg-[#380E13] text-white font-bold text-xs transition-colors cursor-pointer"
                                >
                                    {selectedItem ? 'Simpan Perubahan' : 'Tambah Foto'}
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
                            <h3 className="font-black text-sm text-slate-900">Hapus Foto Instagram?</h3>
                            <p className="text-xs text-slate-500">
                                Apakah Anda yakin ingin menghapus postingan Instagram ini dari galeri portal?
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
