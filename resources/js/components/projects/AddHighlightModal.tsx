import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, Sparkles, Upload, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export interface AddHighlightModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string | number;
    onSuccess?: () => void;
}

export default function AddHighlightModal({
    isOpen,
    onClose,
    projectId,
    onSuccess,
}: AddHighlightModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        caption: '',
        image_url: '',
        image_file: null as File | null,
        is_cover: false,
    });
    const [filePreview, setFilePreview] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData({
                title: '',
                caption: '',
                image_url: '',
                image_file: null,
                is_cover: false,
            });
            setFilePreview('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.image_file && !formData.image_url) {
            toast.error('Silakan pilih file foto atau masukkan URL foto');
            return;
        }

        setIsSubmitting(true);
        const form = new FormData();
        form.append('title', formData.title || 'Momen Acara');
        form.append('caption', formData.caption);
        form.append('is_cover', formData.is_cover ? '1' : '0');
        if (formData.image_file) {
            form.append('image_file', formData.image_file);
        } else if (formData.image_url) {
            form.append('image_url', formData.image_url);
        }

        router.post(`/projects/${projectId}/highlights`, form, {
            onSuccess: () => {
                setIsSubmitting(false);
                toast.success('Foto highlight berhasil ditambahkan ke project!');
                onClose();
                if (onSuccess) onSuccess();
            },
            onError: (err) => {
                setIsSubmitting(false);
                toast.error(Object.values(err)[0] as string || 'Gagal menambahkan foto highlight');
            },
        });
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200/80 space-y-4 my-auto max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-slate-900">Tambah Foto Highlight</h3>
                            <p className="text-[11px] text-slate-500">Galeri pilihan momen terbaik</p>
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
                            Judul Foto / Momen <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Contoh: First Look & Tukar Cincin"
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden bg-white"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block text-xs">
                            Unggah Foto Highlight
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
                    </div>

                    <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block text-xs">
                            Atau Gunakan URL Foto
                        </label>
                        <input
                            type="text"
                            value={formData.image_url}
                            onChange={(e) => {
                                setFormData({ ...formData, image_url: e.target.value });
                                setFilePreview(e.target.value);
                            }}
                            placeholder="https://... atau /images/..."
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden bg-white"
                        />
                    </div>

                    {filePreview && (
                        <div className="aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative shadow-inner">
                            <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block text-xs">
                            Caption / Cerita Momen
                        </label>
                        <textarea
                            value={formData.caption}
                            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                            placeholder="Tuliskan keterangan singkat momen ini..."
                            rows={3}
                            className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden resize-none bg-white"
                        />
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={formData.is_cover}
                                onChange={(e) => setFormData({ ...formData, is_cover: e.target.checked })}
                                className="w-4 h-4 rounded text-[#3B46F1] focus:ring-[#3B46F1]"
                            />
                            <span className="font-bold text-slate-800 text-xs">
                                Jadikan Foto Cover Utama Project
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
                                    <span>Simpan Foto Highlight</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
