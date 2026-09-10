import React, { useState } from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export interface AddNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (note: string) => void;
}

export default function AddNoteModal({
    isOpen,
    onClose,
    onSave,
}: AddNoteModalProps) {
    const [noteText, setNoteText] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!noteText.trim()) {
            toast.error('Catatan tidak boleh kosong.');
            return;
        }

        if (onSave) {
            onSave(noteText);
        } else {
            toast.success('Catatan berhasil ditambahkan!');
        }
        setNoteText('');
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200/80 space-y-4 my-auto animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-slate-900">Tambah Catatan Khusus</h3>
                            <p className="text-[11px] text-slate-500">Brief, instruksi khusus, atau memo project</p>
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
                            Isi Catatan / Memo
                        </label>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Tuliskan catatan brief, kebutuhan klien, atau instruksi teknis pengerjaan..."
                            rows={4}
                            className="w-full p-3 rounded-2xl border border-slate-200 focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden text-xs leading-relaxed resize-none bg-white"
                            required
                        />
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
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl font-bold transition-all cursor-pointer shadow-sm shadow-indigo-500/20"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Simpan Catatan</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
