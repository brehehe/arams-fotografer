import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, FolderGit2, Link as LinkIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export interface AddDriveLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string | number;
    initialData?: {
        name?: string;
        drive_url?: string;
    };
    onSuccess?: () => void;
}

export default function AddDriveLinkModal({
    isOpen,
    onClose,
    projectId,
    initialData,
    onSuccess,
}: AddDriveLinkModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: 'Master Dokumentasi Google Drive',
        drive_url: '',
        file_type: 'google_drive',
        expiry_days: '30',
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: initialData?.name || 'Master Dokumentasi Google Drive',
                drive_url: initialData?.drive_url || '',
                file_type: 'google_drive',
                expiry_days: '30',
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.drive_url) {
            toast.error('Silakan masukkan link Google Drive yang valid.');
            return;
        }

        setIsSubmitting(true);
        router.post(
            `/projects/${projectId}/file-links`,
            formData,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    toast.success('Link Google Drive berhasil ditambahkan ke Project!');
                    onClose();
                    if (onSuccess) onSuccess();
                },
                onError: () => {
                    setIsSubmitting(false);
                    toast.error('Gagal menambahkan link');
                },
            }
        );
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
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3B46F1]">
                            <FolderGit2 className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-slate-900">Tambah Link Google Drive</h3>
                            <p className="text-[11px] text-slate-500">Tautkan cloud drive hasil dokumentasi</p>
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
                            Nama Dokumen / Folder <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Contoh: Master Dokumentasi High-Res"
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden bg-white"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                            <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span>URL Link Google Drive <span className="text-rose-500">*</span></span>
                        </label>
                        <input
                            type="url"
                            value={formData.drive_url}
                            onChange={(e) => setFormData({ ...formData, drive_url: e.target.value })}
                            placeholder="https://drive.google.com/drive/folders/..."
                            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden bg-white"
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
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl font-bold transition-all cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Simpan Link</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
