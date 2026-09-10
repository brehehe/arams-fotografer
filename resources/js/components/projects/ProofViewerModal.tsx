import React from 'react';
import { X, Receipt, ExternalLink } from 'lucide-react';

export interface ProofViewerModalProps {
    isOpen: boolean;
    proofUrl: string | null;
    onClose: () => void;
}

export default function ProofViewerModal({
    isOpen,
    proofUrl,
    onClose,
}: ProofViewerModalProps) {
    if (!isOpen || !proofUrl) return null;

    const isPdf = proofUrl.toLowerCase().endsWith('.pdf');

    return (
        <div 
            className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-[#3B46F1]">
                            <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-slate-900">Bukti Pembayaran / Resi</h3>
                            <p className="text-[11px] text-slate-500">Pratinjau lampiran transaksi</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup pratinjau"
                        className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto flex items-center justify-center bg-slate-900/5 min-h-[300px]">
                    {isPdf ? (
                        <iframe
                            src={proofUrl}
                            title="Bukti Pembayaran PDF"
                            className="w-full h-[450px] rounded-2xl border border-slate-200 bg-white"
                        />
                    ) : (
                        <img
                            src={proofUrl}
                            alt="Bukti Transfer"
                            className="max-h-[500px] w-auto max-w-full rounded-2xl object-contain shadow-md"
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="p-3.5 px-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <a
                        href={proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3B46F1] hover:underline"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka File Asli di Tab Baru</span>
                    </a>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
