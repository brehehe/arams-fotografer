import React, { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import {
    X,
    CreditCard,
    CheckCircle2,
    Calendar,
    Building2,
    Upload,
    Receipt,
    Sparkles,
    Loader2,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { formatRupiah } from '@/lib/formatters';

export interface PaymentMethodItem {
    id: string | number;
    name: string;
    code?: string;
    account_number?: string;
    account_holder?: string;
    icon?: string;
}

export interface RecordPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: any;
    paymentMethods?: PaymentMethodItem[];
    invoiceId?: string | number;
    initialAmount?: number | string;
    initialNotes?: string;
    onSuccess?: () => void;
}

export default function RecordPaymentModal({
    isOpen,
    onClose,
    project,
    paymentMethods = [],
    invoiceId,
    initialAmount,
    initialNotes,
    onSuccess,
}: RecordPaymentModalProps) {
    const totalProject = useMemo(() => {
        return Number(
            project?.total_amount ||
            (Number(project?.price || 0) +
                Number(project?.addons_total || 0) +
                Number(project?.operational_cost || 0) -
                Number(project?.discount || 0) +
                Number(project?.tax || 0))
        );
    }, [project]);

    const paidAmount = useMemo(() => {
        return Number(project?.paid_amount || 0);
    }, [project?.paid_amount]);

    const sisaPelunasan = useMemo(() => {
        return Math.max(0, totalProject - paidAmount);
    }, [totalProject, paidAmount]);

    const percentPaid = useMemo(() => {
        if (totalProject <= 0) return 0;
        return Math.min(100, Math.round((paidAmount / totalProject) * 100));
    }, [totalProject, paidAmount]);

    // Calculate suggested nominals
    const dp30Amount = Math.round(totalProject * 0.3);
    const dp50Amount = Math.round(totalProject * 0.5);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method_id: '',
        reference_number: '',
        notes: '',
        proof_file: null as File | null,
    });

    // Initialize or reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            const defaultMethodId = paymentMethods.length > 0 ? String(paymentMethods[0].id) : '';
            
            let defaultAmount = initialAmount !== undefined && initialAmount !== null && Number(initialAmount) > 0 
                ? String(Math.round(Number(initialAmount))) 
                : '';
            let defaultNote = initialNotes || '';

            if (!defaultAmount) {
                if (paidAmount > 0 && sisaPelunasan > 0) {
                    defaultAmount = String(sisaPelunasan);
                } else if (paidAmount === 0 && totalProject > 0) {
                    defaultAmount = String(dp30Amount);
                }
            }

            if (!defaultNote) {
                if (paidAmount > 0 && sisaPelunasan > 0) {
                    defaultNote = `Pelunasan Sisa Tagihan untuk ${project?.name || 'Project'}`;
                } else if (paidAmount === 0 && totalProject > 0) {
                    defaultNote = `Pembayaran Uang Muka (DP 30%) untuk ${project?.name || 'Project'}`;
                } else {
                    defaultNote = `Pembayaran untuk project ${project?.name || 'Project'}`;
                }
            }

            setFormData({
                amount: defaultAmount,
                payment_date: new Date().toISOString().split('T')[0],
                payment_method_id: defaultMethodId,
                reference_number: '',
                notes: defaultNote,
                proof_file: null,
            });
        }
    }, [isOpen, project, paymentMethods, paidAmount, sisaPelunasan, totalProject, dp30Amount, initialAmount, initialNotes]);

    if (!isOpen) return null;

    const handleShortcut = (amount: number, type: 'dp30' | 'dp50' | 'sisa' | 'lunas') => {
        let noteText = '';
        if (type === 'dp30') {
            noteText = `Pembayaran Uang Muka (DP 30%) untuk ${project?.name || 'Project'}`;
        } else if (type === 'dp50') {
            noteText = `Pembayaran Uang Muka (DP 50%) untuk ${project?.name || 'Project'}`;
        } else if (type === 'sisa') {
            noteText = `Pelunasan Sisa Tagihan untuk ${project?.name || 'Project'}`;
        } else if (type === 'lunas') {
            noteText = `Pembayaran Lunas Penuh (100%) untuk ${project?.name || 'Project'}`;
        }

        setFormData((prev) => ({
            ...prev,
            amount: String(amount),
            notes: noteText,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const numAmount = Number(formData.amount);
        if (!numAmount || numAmount <= 0) {
            toast.error('Jumlah nominal pembayaran harus lebih dari 0.');
            return;
        }

        const methodId = formData.payment_method_id || (paymentMethods[0]?.id ? String(paymentMethods[0].id) : null);

        setIsSubmitting(true);

        const payload: Record<string, any> = {
            project_id: project.id,
            amount: numAmount,
            payment_date: formData.payment_date,
            payment_method_id: methodId,
            reference_number: formData.reference_number || null,
            notes: formData.notes || null,
            invoice_id: invoiceId || project.invoices?.[0]?.id || null,
        };

        if (formData.proof_file) {
            payload.proof_file = formData.proof_file;
        }

        router.post('/finance/payments', payload, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                toast.success('Pembayaran dan bukti transfer berhasil dicatat ke Modul Keuangan!');
                onClose();
                if (onSuccess) onSuccess();
            },
            onError: (errors: any) => {
                setIsSubmitting(false);
                const errorMsg = Object.values(errors || {})[0] as string;
                toast.error(errorMsg || 'Gagal mencatat pembayaran. Silakan periksa kembali formulir.');
            },
        });
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
        >
            <div
                className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col my-auto max-h-[92vh] transition-all animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── HEADER MODAL ────────────────────────────────────────────── */}
                <div className="p-5 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-[#3B46F1] shadow-2xs">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 id="payment-modal-title" className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-2">
                                <span>Catat Pembayaran Klien</span>
                            </h3>
                            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[280px] sm:max-w-sm">
                                {project?.name || 'Project Studio'}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup modal"
                        className="w-8 h-8 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200/80 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* ── FORM CONTENT (SCROLLABLE) ────────────────────────────────── */}
                <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                    {/* 1. Ringkasan Finansial Singkat */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 space-y-2.5">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-0.5">
                                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                                    Total Nilai
                                </span>
                                <span className="font-black text-slate-900 text-sm font-mono block truncate">
                                    {formatRupiah(totalProject)}
                                </span>
                            </div>

                            <div className="space-y-0.5 text-center">
                                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                                    Sudah Dibayar
                                </span>
                                <span className="font-black text-emerald-600 text-sm font-mono block truncate">
                                    {formatRupiah(paidAmount)}
                                </span>
                            </div>

                            <div className="space-y-0.5 text-right">
                                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                                    Sisa Tagihan
                                </span>
                                <span className="font-black text-amber-700 text-sm font-mono block truncate">
                                    {formatRupiah(sisaPelunasan)}
                                </span>
                            </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="space-y-1 pt-1 border-t border-slate-200/50">
                            <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden flex">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                    style={{ width: `${percentPaid}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                                <span>Progres Pelunasan</span>
                                <span className="font-bold text-slate-700">{percentPaid}%</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Pilihan Cepat Nominal (Shortcuts) */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>Pilihan Cepat Nominal (Shortcut):</span>
                            </label>
                            <span className="text-[10px] text-slate-400">Klik untuk isi otomatis</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {/* Shortcut DP 30% if belum dibayar */}
                            {paidAmount < dp30Amount && dp30Amount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleShortcut(dp30Amount, 'dp30')}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                                        Number(formData.amount) === dp30Amount
                                            ? 'bg-indigo-50 text-[#3B46F1] border-indigo-300 ring-2 ring-indigo-200/80 shadow-2xs'
                                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
                                    }`}
                                >
                                    <span>DP 30%</span>
                                    <span className="font-mono text-[11px] font-normal opacity-90">({formatRupiah(dp30Amount)})</span>
                                </button>
                            )}

                            {/* Shortcut DP 50% if paid < 50% */}
                            {paidAmount < dp50Amount && dp50Amount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleShortcut(dp50Amount, 'dp50')}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                                        Number(formData.amount) === dp50Amount
                                            ? 'bg-indigo-50 text-[#3B46F1] border-indigo-300 ring-2 ring-indigo-200/80 shadow-2xs'
                                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
                                    }`}
                                >
                                    <span>DP 50%</span>
                                    <span className="font-mono text-[11px] font-normal opacity-90">({formatRupiah(dp50Amount)})</span>
                                </button>
                            )}

                            {/* Shortcut Pelunasan Sisa Tagihan */}
                            {sisaPelunasan > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleShortcut(sisaPelunasan, 'sisa')}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                                        Number(formData.amount) === sisaPelunasan
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-200/80 shadow-2xs'
                                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
                                    }`}
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Pelunasan Sisa</span>
                                    <span className="font-mono text-[11px] font-normal opacity-90">({formatRupiah(sisaPelunasan)})</span>
                                </button>
                            )}

                            {/* Shortcut Lunas 100% jika belum pernah bayar */}
                            {paidAmount === 0 && totalProject > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleShortcut(totalProject, 'lunas')}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                                        Number(formData.amount) === totalProject
                                            ? 'bg-purple-50 text-purple-700 border-purple-300 ring-2 ring-purple-200/80 shadow-2xs'
                                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
                                    }`}
                                >
                                    <span>Lunas Penuh (100%)</span>
                                    <span className="font-mono text-[11px] font-normal opacity-90">({formatRupiah(totalProject)})</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 3. Input Nominal Pembayaran */}
                    <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block text-xs">
                            Jumlah Pembayaran <span className="text-rose-500">*</span>
                        </label>
                        <FormattedNumberInput
                            value={Number(formData.amount) || ''}
                            onChange={(val) => setFormData({ ...formData, amount: String(val) })}
                            prefix="Rp"
                            placeholder="0"
                            className="w-full text-base font-mono font-black py-2.5 rounded-xl border border-slate-200 focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 bg-white"
                            required
                        />
                        {Number(formData.amount) > 0 && (
                            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                <span className="text-slate-400">Terbaca:</span>
                                <strong className="text-slate-800 font-mono font-bold">
                                    {formatRupiah(Number(formData.amount))}
                                </strong>
                            </p>
                        )}
                    </div>

                    {/* 4. Tanggal Pembayaran & Rekening Bank */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>Tanggal Bayar <span className="text-rose-500">*</span></span>
                            </label>
                            <input
                                type="date"
                                value={formData.payment_date}
                                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden bg-white"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>Rekening Tujuan <span className="text-rose-500">*</span></span>
                            </label>
                            <select
                                value={formData.payment_method_id}
                                onChange={(e) => setFormData({ ...formData, payment_method_id: e.target.value })}
                                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden bg-white cursor-pointer"
                                required
                            >
                                {paymentMethods.length > 0 ? (
                                    paymentMethods.map((pm) => (
                                        <option key={pm.id} value={pm.id}>
                                            {pm.name} {pm.account_number ? `(${pm.account_number} a.n. ${pm.account_holder || ''})` : ''}
                                        </option>
                                    ))
                                ) : (
                                    <option value="">Transfer Bank / Rekening Studio</option>
                                )}
                            </select>
                        </div>
                    </div>

                    {/* 5. Nomor Referensi & Catatan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 block text-xs">
                                No. Referensi Transfer <span className="text-slate-400 font-normal">(Opsional)</span>
                            </label>
                            <input
                                type="text"
                                value={formData.reference_number}
                                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                                placeholder="Contoh: REF-BCA-82910"
                                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden bg-white"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 block text-xs">
                                Catatan / Keterangan
                            </label>
                            <input
                                type="text"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Keterangan transaksi..."
                                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden bg-white"
                            />
                        </div>
                    </div>

                    {/* 6. Upload Bukti Transfer */}
                    <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 block text-xs">
                            Upload Bukti Transfer / Resi <span className="text-slate-400 font-normal">(Opsional)</span>
                        </label>

                        {formData.proof_file ? (
                            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-center justify-between shadow-2xs">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-xl bg-white border border-indigo-100 flex items-center justify-center text-[#3B46F1] shrink-0">
                                        <Receipt className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-900 truncate text-xs">
                                            {formData.proof_file.name}
                                        </p>
                                        <span className="text-[10px] text-slate-500 font-medium">
                                            {(formData.proof_file.size / 1024).toFixed(1)} KB
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, proof_file: null })}
                                    className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer shadow-2xs"
                                    title="Hapus file"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="border-2 border-dashed border-slate-200 hover:border-[#3B46F1] rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer group">
                                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 group-hover:border-indigo-200 group-hover:bg-indigo-50 flex items-center justify-center mb-1.5 transition-colors">
                                    <Upload className="w-4 h-4 text-slate-400 group-hover:text-[#3B46F1] transition-colors" />
                                </div>
                                <span className="text-xs font-bold text-slate-700 group-hover:text-[#3B46F1] transition-colors">
                                    Pilih Foto atau Dokumen Bukti Transfer
                                </span>
                                <span className="text-[10px] text-slate-400 mt-0.5">
                                    Format JPG, PNG, WEBP, atau PDF (Maks. 10MB)
                                </span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,application/pdf"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        setFormData({ ...formData, proof_file: file });
                                    }}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {/* ── FOOTER ACTIONS ───────────────────────────────────────── */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Menyimpan ke Finance...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Simpan Pembayaran ke Finance</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
