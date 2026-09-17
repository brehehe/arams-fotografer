import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, Edit3, CheckCircle2, Loader2, Tag, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export interface EditNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId?: string | number;
    noteIndex: number | null;
    initialTitle?: string;
    initialContent?: string;
    onSuccess?: () => void;
}

const PRESET_TITLES = [
    'Briefing Acara',
    'Instruksi Tim',
    'Lokasi & Rundown',
    'Permintaan Klien',
    'Revisi & Editing',
    'Catatan Penting',
];

export default function EditNoteModal({
    isOpen,
    onClose,
    projectId,
    noteIndex,
    initialTitle = '',
    initialContent = '',
    onSuccess,
}: EditNoteModalProps) {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle(initialTitle || 'Catatan Project');
            setContent(initialContent || '');
        }
    }, [isOpen, initialTitle, initialContent]);

    if (!isOpen || noteIndex === null) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedContent = content.trim();
        if (!trimmedContent) {
            toast.error('Isi catatan tidak boleh kosong.');
            return;
        }

        if (!projectId) {
            toast.error('ID project tidak ditemukan.');
            return;
        }

        setIsSubmitting(true);
        router.put(
            `/projects/${projectId}/notes/${noteIndex}`,
            {
                title: title.trim() || 'Catatan Project',
                content: trimmedContent,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Catatan berhasil diperbarui!');
                    setIsSubmitting(false);
                    onClose();
                    onSuccess?.();
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    const firstErr = (Object.values(errors)[0] as string) || 'Gagal memperbarui catatan.';
                    toast.error(firstErr);
                },
            }
        );
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-edit-note-title"
        >
            <div
                className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border border-slate-200/80 space-y-4 my-auto animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                            <Edit3 className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <h3 id="modal-edit-note-title" className="font-bold text-sm text-slate-900">
                                Edit Catatan &amp; Memo Project
                            </h3>
                            <p className="text-[11px] text-slate-500">
                                Perbarui isi briefing, instruksi teknis, atau koreksi catatan
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Tutup modal"
                        className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* Judul / Subjek */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="font-bold text-slate-700 block text-xs">
                                Judul / Subjek Catatan
                            </label>
                            <span className="text-[10px] text-slate-400 font-medium">Opsional</span>
                        </div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Contoh: Brief Wardrobe Akad, Catatan Drone, dsb..."
                            maxLength={150}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden text-xs text-slate-800 bg-white placeholder:text-slate-400"
                        />

                        {/* Quick preset chips */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                                <Tag className="w-2.5 h-2.5" />
                                Preset:
                            </span>
                            {PRESET_TITLES.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setTitle(preset)}
                                    className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium border transition-all cursor-pointer ${
                                        title === preset
                                            ? 'bg-indigo-100 text-indigo-800 border-indigo-300 font-bold'
                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Isi Catatan */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="font-bold text-slate-700 block text-xs">
                                Isi Catatan / Instruksi <span className="text-rose-500">*</span>
                            </label>
                            <span className="text-[10px] text-slate-400 font-mono">
                                {content.length} / 5000
                            </span>
                        </div>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Tuliskan rincian brief, kesepakatan klien, arahan teknis lapangan, referensi foto, atau catatan koreksi..."
                            rows={5}
                            maxLength={5000}
                            required
                            className="w-full p-3.5 rounded-2xl border border-slate-200 focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden text-xs leading-relaxed resize-none bg-white text-slate-800 placeholder:text-slate-400"
                        />
                    </div>

                    {/* Hint / info */}
                    <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl flex items-start gap-2 text-[11px] text-indigo-900 leading-relaxed">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>
                            Perubahan akan otomatis disimpan dan status catatan akan ditandai dengan keterangan <em>(diedit)</em>.
                        </span>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !content.trim()}
                            className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-[#3B46F1] hover:bg-[#323BD8] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all cursor-pointer shadow-sm shadow-indigo-500/20"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Simpan Perubahan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
