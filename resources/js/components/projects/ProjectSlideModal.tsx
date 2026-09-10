import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, Layers, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export interface ProjectSlideModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string | number;
    projectName?: string;
    editingSlide?: any;
    onSuccess?: () => void;
}

export default function ProjectSlideModal({
    isOpen,
    onClose,
    projectId,
    projectName,
    editingSlide,
    onSuccess,
}: ProjectSlideModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        tag: 'EXCLUSIVE PROJECT',
        description: '',
        button_text: 'Lihat Detail Project',
        button_url: '',
        image_url: '',
        image_file: null as File | null,
        is_active: true,
        sort_order: 0,
    });
    const [filePreview, setFilePreview] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (editingSlide) {
                setFormData({
                    title: editingSlide.title || '',
                    tag: editingSlide.tag || 'EXCLUSIVE PROJECT',
                    description: editingSlide.description || '',
                    button_text: editingSlide.button_text || 'Lihat Detail Project',
                    button_url: editingSlide.button_url || `/client/projects/${projectId}`,
                    image_url: editingSlide.image_url || '',
                    image_file: null,
                    is_active: editingSlide.is_active ?? true,
                    sort_order: editingSlide.sort_order || 0,
                });
                setFilePreview(editingSlide.image_url || '');
            } else {
                setFormData({
                    title: projectName ? `Eksklusif: ${projectName}` : '',
                    tag: 'EXCLUSIVE PROJECT',
                    description: 'Dokumentasi momen istimewa dan bersejarah yang tak terlupakan.',
                    button_text: 'Lihat Detail Project',
                    button_url: `/client/projects/${projectId}`,
                    image_url: '',
                    image_file: null,
                    is_active: true,
                    sort_order: 0,
                });
                setFilePreview('');
            }
        }
    }, [isOpen, editingSlide, projectId, projectName]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const form = new FormData();
        form.append('title', formData.title);
        form.append('tag', formData.tag);
        form.append('description', formData.description || '');
        form.append('button_text', formData.button_text);
        form.append('button_url', formData.button_url);
        form.append('is_active', formData.is_active ? '1' : '0');
        form.append('sort_order', String(formData.sort_order));

        if (formData.image_file) {
            form.append('image_file', formData.image_file);
        } else if (formData.image_url) {
            form.append('image_url', formData.image_url);
        }

        if (editingSlide) {
            form.append('_method', 'PATCH');
            router.post(`/projects/${projectId}/promo-slides/${editingSlide.id}`, form, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    toast.success('Slide banner project berhasil diperbarui');
                    onClose();
                    if (onSuccess) onSuccess();
                },
                onError: (err) => {
                    setIsSubmitting(false);
                    toast.error(Object.values(err)[0] as string || 'Gagal memperbarui slide banner');
                },
            });
        } else {
            router.post(`/projects/${projectId}/promo-slides`, form, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    toast.success('Slide banner project berhasil ditambahkan');
                    onClose();
                    if (onSuccess) onSuccess();
                },
                onError: (err) => {
                    setIsSubmitting(false);
                    toast.error(Object.values(err)[0] as string || 'Gagal menambahkan slide banner');
                },
            });
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border border-slate-200/80 space-y-4 my-auto max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3B46F1]">
                            <Layers className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-slate-900">
                                {editingSlide ? 'Edit Slide Banner Project' : 'Tambah Slide Banner Project'}
                            </h3>
                            <p className="text-[11px] text-slate-500">Banner sorotan portal klien</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup modal"
                        className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                    <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block text-xs">
                            Judul Slide Banner <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder={`Contoh: Eksklusif: ${projectName || 'Pernikahan Anda'}`}
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 block text-xs">
                                Tag / Label Kategori <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.tag}
                                onChange={(e) => setFormData({ ...formData, tag: e.target.value.toUpperCase() })}
                                placeholder="EXCLUSIVE PROJECT"
                                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden bg-white"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 block text-xs">
                                Urutan Tampil (Sort Order)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.sort_order}
                                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden bg-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block text-xs">
                            Deskripsi Banner
                        </label>
                        <textarea
                            rows={2}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Tuliskan pesan singkat untuk klien..."
                            className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden text-xs resize-none bg-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 block text-xs">
                                Teks Tombol CTA <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.button_text}
                                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                                placeholder="Lihat Detail Project"
                                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden bg-white"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 block text-xs">
                                URL Tujuan Tombol
                            </label>
                            <input
                                type="text"
                                value={formData.button_url}
                                onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                                placeholder={`/client/projects/${projectId}`}
                                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden bg-white"
                            />
                        </div>
                    </div>

                    {/* Foto Banner */}
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                        <label className="font-bold text-slate-700 block text-xs">
                            Foto Background Banner
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setFormData({ ...formData, image_file: file });
                                    setFilePreview(URL.createObjectURL(file));
                                }
                            }}
                            className="w-full text-xs file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:bg-slate-100 file:text-slate-700 file:font-semibold hover:file:bg-slate-200 cursor-pointer"
                        />

                        <div className="space-y-1">
                            <span className="text-[10px] text-slate-500">Atau Gunakan URL Gambar:</span>
                            <input
                                type="text"
                                value={formData.image_url}
                                onChange={(e) => {
                                    setFormData({ ...formData, image_url: e.target.value });
                                    setFilePreview(e.target.value);
                                }}
                                placeholder="https://... atau /images/..."
                                className="w-full p-2 rounded-xl border border-slate-200 focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden text-xs bg-white"
                            />
                        </div>

                        {filePreview && (
                            <div className="aspect-16/9 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 relative shadow-inner">
                                <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
                                    Pratinjau Foto
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-4 h-4 rounded text-[#3B46F1] focus:ring-[#3B46F1]"
                            />
                            <span className="font-bold text-slate-800 text-xs">
                                Aktifkan slide banner ini di Portal Klien
                            </span>
                        </label>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl font-bold transition-all cursor-pointer shadow-sm shadow-indigo-500/20 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{editingSlide ? 'Simpan Perubahan' : 'Buat Slide Banner'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
