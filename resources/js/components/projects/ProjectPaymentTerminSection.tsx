import { CreditCard, Plus, Trash2, CheckCircle2, AlertCircle, Sparkles, Split, ExternalLink } from 'lucide-react';
import { Link } from '@inertiajs/react';
import React, { useMemo } from 'react';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { Input } from '@/components/ui/input';
import { SelectSearch  } from '@/components/ui/select-search';
import type {SelectSearchOption} from '@/components/ui/select-search';

export interface PaymentInstallmentItem {
    id: string;
    name: string;
    type: 'dp' | 'termin' | 'pelunasan';
    amount: number;
    due_date: string;
    notes?: string;
}

interface ProjectPaymentTerminSectionProps {
    projectId?: string;
    totalProject: number;
    dpPercent: number;
    setDpPercent: (val: number) => void;
    dpPercentOptions: SelectSearchOption[];
    dpDueDate: string;
    setDpDueDate: (val: string) => void;
    paymentInstallments: PaymentInstallmentItem[];
    setPaymentInstallments: React.Dispatch<React.SetStateAction<PaymentInstallmentItem[]>>;
    paymentMethodOptions: SelectSearchOption[];
    paymentMethodName: string;
    handlePaymentMethodChange: (val: string) => void;
    bankAccount: string;
    setBankAccount: (val: string) => void;
    accountHolder: string;
    setAccountHolder: (val: string) => void;
    eventDate?: string;
}

export function ProjectPaymentTerminSection({
    projectId,
    totalProject,
    dpPercent,
    setDpPercent,
    dpPercentOptions,
    dpDueDate,
    setDpDueDate,
    paymentInstallments,
    setPaymentInstallments,
    paymentMethodOptions,
    paymentMethodName,
    handlePaymentMethodChange,
    bankAccount,
    setBankAccount,
    accountHolder,
    setAccountHolder,
    eventDate,
}: ProjectPaymentTerminSectionProps) {
    // Format currency helper
    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate total allocated
    const totalAllocated = useMemo(() => {
        return paymentInstallments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    }, [paymentInstallments]);

    const remainingBalance = totalProject - totalAllocated;
    const isBalanced = Math.abs(remainingBalance) < 1;

    // Apply Presets (1, 2, or 3 Termin)
    const handleApplyPreset = (terminCount: number) => {
        const today = new Date().toISOString().split('T')[0];
        const defaultDpDate = dpDueDate || today;
        const finalDate = eventDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        if (terminCount === 1) {
            setPaymentInstallments([
                {
                    id: `inst-${Date.now()}-1`,
                    name: 'Invoice 1 (Pelunasan Penuh)',
                    type: 'pelunasan',
                    amount: totalProject,
                    due_date: defaultDpDate,
                },
            ]);

            return;
        }

        const dpRate = dpPercent > 0 ? dpPercent : 30;
        const dpNominal = Math.round((totalProject * dpRate) / 100);
        const remainder = totalProject - dpNominal;

        if (terminCount === 2) {
            setPaymentInstallments([
                {
                    id: `inst-${Date.now()}-1`,
                    name: `Invoice 1 (DP ${dpRate}%)`,
                    type: 'dp',
                    amount: dpNominal,
                    due_date: defaultDpDate,
                },
                {
                    id: `inst-${Date.now()}-2`,
                    name: 'Invoice 2 (Pelunasan)',
                    type: 'pelunasan',
                    amount: Math.max(0, remainder),
                    due_date: finalDate,
                },
            ]);

            return;
        }

        if (terminCount === 3) {
            const midDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const termin2Nominal = Math.round(remainder / 2);
            const pelunasanNominal = Math.max(0, remainder - termin2Nominal);

            setPaymentInstallments([
                {
                    id: `inst-${Date.now()}-1`,
                    name: `Invoice 1 (DP ${dpRate}%)`,
                    type: 'dp',
                    amount: dpNominal,
                    due_date: defaultDpDate,
                },
                {
                    id: `inst-${Date.now()}-2`,
                    name: 'Invoice 2 (Termin 2)',
                    type: 'termin',
                    amount: termin2Nominal,
                    due_date: midDate,
                },
                {
                    id: `inst-${Date.now()}-3`,
                    name: 'Invoice 3 (Pelunasan)',
                    type: 'pelunasan',
                    amount: pelunasanNominal,
                    due_date: finalDate,
                },
            ]);
        }
    };

    // Active options ensuring custom percentage is visible in dropdown
    const activeDpPercentOptions = useMemo(() => {
        const exists = dpPercentOptions.some((opt) => opt.value === String(dpPercent));

        if (!exists && dpPercent > 0) {
            return [{ value: String(dpPercent), label: `${dpPercent}% (Custom)` }, ...dpPercentOptions];
        }

        return dpPercentOptions;
    }, [dpPercentOptions, dpPercent]);

    // Calculate current DP amount from first installment or percentage
    const currentDpAmount = useMemo(() => {
        if (
            paymentInstallments.length > 0 &&
            (paymentInstallments[0].type === 'dp' || paymentInstallments[0].name.toLowerCase().includes('dp'))
        ) {
            return Number(paymentInstallments[0].amount) || 0;
        }

        return Math.round((totalProject * dpPercent) / 100);
    }, [paymentInstallments, totalProject, dpPercent]);

    // When DP percent changes from select, update Invoice 1 if it is DP
    const handleDpPercentChange = (newPercent: number) => {
        setDpPercent(newPercent);
        const newDpAmount = Math.round((totalProject * newPercent) / 100);

        setPaymentInstallments((prev) => {
            if (prev.length === 0) {
                return prev;
            }

            const updated = [...prev];

            // If first item is DP, update its amount & label
            if (updated[0].type === 'dp' || updated[0].name.toLowerCase().includes('dp')) {
                updated[0] = {
                    ...updated[0],
                    amount: newDpAmount,
                    name: `Invoice 1 (DP ${newPercent}%)`,
                };
            }

            // If 2 installments (DP + Pelunasan), auto-rebalance the second item
            if (updated.length === 2) {
                updated[1] = {
                    ...updated[1],
                    amount: Math.max(0, totalProject - newDpAmount),
                };
            }

            return updated;
        });
    };

    // When DP nominal changes manually, update Invoice 1 and recalculate DP percent
    const handleDpNominalChange = (customNominal: number) => {
        const nominal = Math.max(0, customNominal);
        const calculatedPercent = totalProject > 0 ? Math.min(100, Math.round((nominal / totalProject) * 100)) : 0;
        setDpPercent(calculatedPercent);

        setPaymentInstallments((prev) => {
            if (prev.length === 0) {
                const today = new Date().toISOString().split('T')[0];

                return [
                    {
                        id: `inst-${Date.now()}-1`,
                        name: 'Invoice 1 (DP)',
                        type: 'dp',
                        amount: nominal,
                        due_date: dpDueDate || today,
                    },
                ];
            }

            const updated = [...prev];
            updated[0] = {
                ...updated[0],
                amount: nominal,
                name: updated[0].name.toLowerCase().includes('dp') ? updated[0].name : 'Invoice 1 (DP)',
            };

            // If 2 installments (DP + Pelunasan), auto-rebalance the second item
            if (updated.length === 2) {
                updated[1] = {
                    ...updated[1],
                    amount: Math.max(0, totalProject - nominal),
                };
            }

            return updated;
        });
    };

    // Add new installment row
    const handleAddInstallment = () => {
        const nextNum = paymentInstallments.length + 1;
        const autoAmount = Math.max(0, remainingBalance);
        const newDate = eventDate || new Date(Date.now() + nextNum * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const newItem: PaymentInstallmentItem = {
            id: `inst-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            name: `Invoice ${nextNum} (Termin ${nextNum})`,
            type: 'termin',
            amount: autoAmount,
            due_date: newDate,
        };
        setPaymentInstallments((prev) => [...prev, newItem]);
    };

    // Remove row
    const handleRemoveInstallment = (idx: number) => {
        if (paymentInstallments.length <= 1) {
            return;
        }

        setPaymentInstallments((prev) => prev.filter((_, i) => i !== idx));
    };

    // Update row field
    const handleUpdateInstallment = (idx: number, field: keyof PaymentInstallmentItem, val: any) => {
        setPaymentInstallments((prev) => {
            const updated = prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item));

            if (idx === 0 && field === 'amount') {
                const nominal = Number(val) || 0;
                const calculatedPercent = totalProject > 0 ? Math.min(100, Math.round((nominal / totalProject) * 100)) : 0;
                setDpPercent(calculatedPercent);
            }

            return updated;
        });
    };

    // Helper: auto-balance remaining into the last termin row
    const handleBalanceToLast = () => {
        if (paymentInstallments.length === 0) {
return;
}

        setPaymentInstallments((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            const currentOtherSum = updated
                .slice(0, lastIdx)
                .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
            const targetForLast = Math.max(0, totalProject - currentOtherSum);
            updated[lastIdx] = {
                ...updated[lastIdx],
                amount: targetForLast,
            };

            return updated;
        });
    };

    // Helper: split remainder evenly across non-DP rows
    const handleSplitRemaining = () => {
        if (paymentInstallments.length <= 1) {
return;
}

        setPaymentInstallments((prev) => {
            const updated = [...prev];
            const dpAmount = Number(updated[0].amount) || 0;
            const remainingToSplit = Math.max(0, totalProject - dpAmount);
            const nonDpCount = updated.length - 1;
            const eachAmount = Math.floor(remainingToSplit / nonDpCount);
            const leftover = remainingToSplit - eachAmount * nonDpCount;

            for (let i = 1; i < updated.length; i++) {
                updated[i] = {
                    ...updated[i],
                    amount: eachAmount + (i === updated.length - 1 ? leftover : 0),
                };
            }

            return updated;
        });
    };

    return (
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full space-y-4">
            <div className="space-y-4">
                {/* Header Card */}
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#4F46E5]" />
                            <span>Pengaturan Pembayaran &amp; Termin Invoice</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Atur jumlah termin dan nominal rate per invoice sesuai kesepakatan klien
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                        {projectId && (
                            <Link
                                href={`/projects/${projectId}/invoice`}
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-full text-[11px] font-bold transition-all shadow-2xs"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Buka lembar cetak invoice di tab baru"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Lihat Lembar Invoice</span>
                            </Link>
                        )}
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                            {paymentInstallments.length} Termin Terjadwal
                        </span>
                    </div>
                </div>

                {/* Preset Termin Buttons & DP Ratio Setting */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Pilihan Cepat Skema Termin:</span>
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                                type="button"
                                onClick={() => handleApplyPreset(1)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                    paymentInstallments.length === 1
                                        ? 'bg-[#4F46E5] text-white shadow-xs'
                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                1x (Lunas Penuh)
                            </button>
                            <button
                                type="button"
                                onClick={() => handleApplyPreset(2)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                    paymentInstallments.length === 2
                                        ? 'bg-[#4F46E5] text-white shadow-xs'
                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                2 Termin (DP + Pelunasan)
                            </button>
                            <button
                                type="button"
                                onClick={() => handleApplyPreset(3)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                    paymentInstallments.length === 3
                                        ? 'bg-[#4F46E5] text-white shadow-xs'
                                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                3 Termin (DP + T2 + Pelunasan)
                            </button>
                        </div>
                    </div>

                    {/* DP Setting helper row with Custom Manual Nominal */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/60">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                                <span>Persentase DP</span>
                                <span className="text-indigo-600 font-semibold">{dpPercent}% dari Total</span>
                            </label>
                            <SelectSearch
                                options={activeDpPercentOptions}
                                value={String(dpPercent)}
                                onChange={(val) => handleDpPercentChange(Number(val) || 0)}
                                clearable={false}
                                className="w-full bg-white"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
                                <span>Nominal DP (Rp)</span>
                                <span className="text-emerald-600 font-semibold text-[10px]">Bisa Custom Manual</span>
                            </label>
                            <FormattedNumberInput
                                value={currentDpAmount}
                                onChange={(val) => handleDpNominalChange(val)}
                                prefix="Rp "
                                className="h-[42px] text-xs font-mono font-bold text-slate-900 bg-white border border-slate-200 focus:border-[#4F46E5]"
                                placeholder="Nominal DP..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Jatuh Tempo DP (Invoice 1)</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={dpDueDate}
                                    onChange={(e) => {
                                        setDpDueDate(e.target.value);

                                        if (paymentInstallments.length > 0) {
                                            handleUpdateInstallment(0, 'due_date', e.target.value);
                                        }
                                    }}
                                    className="w-full h-[42px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#4F46E5] cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* List of Dynamic Payment Installments (Multi-Termin) */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span>Jadwal Termin &amp; Nominal Tagihan (Rp)</span>
                        </label>
                        <div className="flex items-center gap-2">
                            {paymentInstallments.length > 1 && (
                                <button
                                    type="button"
                                    onClick={handleSplitRemaining}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                    title="Bagi rata sisa tagihan ke termin berikutnya"
                                >
                                    <Split className="w-3 h-3" />
                                    <span>Bagi Rata Sisa</span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleAddInstallment}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] rounded-lg text-[11px] font-bold transition-colors cursor-pointer border border-indigo-100"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Termin</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-0.5">
                        {paymentInstallments.map((item, idx) => {
                            const itemPercent = totalProject > 0 ? ((item.amount / totalProject) * 100).toFixed(1) : '0';

                            return (
                                <div
                                    key={item.id || idx}
                                    className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all space-y-2.5"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 font-mono font-bold text-[11px] flex items-center justify-center border border-emerald-100 shrink-0">
                                                #{idx + 1}
                                            </span>
                                            <Input
                                                value={item.name}
                                                onChange={(e) => handleUpdateInstallment(idx, 'name', e.target.value)}
                                                placeholder={`Invoice ${idx + 1}...`}
                                                className="h-[30px] font-bold text-xs text-slate-800 bg-transparent border-transparent hover:border-slate-200 focus:bg-white focus:border-[#4F46E5] px-1.5 w-44 sm:w-60"
                                            />
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                {itemPercent}%
                                            </span>
                                            {paymentInstallments.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveInstallment(idx)}
                                                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                    title="Hapus termin ini"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                                        {/* Tanggal Jatuh Tempo (col-span-12 sm:col-span-5) */}
                                        <div className="sm:col-span-5 min-w-0">
                                            <label className="text-[10px] font-bold text-slate-400 mb-0.5 block">
                                                Jatuh Tempo
                                            </label>
                                            <div className="relative flex items-center">
                                                <input
                                                    type="date"
                                                    value={item.due_date}
                                                    onChange={(e) => handleUpdateInstallment(idx, 'due_date', e.target.value)}
                                                    className="w-full h-[38px] px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-[#4F46E5] cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        {/* Nominal Tagihan Rupiah (col-span-12 sm:col-span-7) */}
                                        <div className="sm:col-span-7 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <label className="text-[10px] font-bold text-slate-400 block">
                                                    Nominal Tagihan (Rp)
                                                </label>
                                                {remainingBalance !== 0 && idx === paymentInstallments.length - 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={handleBalanceToLast}
                                                        className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                                                    >
                                                        Isi Sisa ({formatRupiah(remainingBalance)})
                                                    </button>
                                                )}
                                            </div>
                                            <FormattedNumberInput
                                                value={item.amount}
                                                onChange={(val) => handleUpdateInstallment(idx, 'amount', val)}
                                                prefix="Rp "
                                                className="h-[38px] text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Balance Status Card */}
                    <div
                        className={`p-3 rounded-xl border transition-all text-xs ${
                            isBalanced
                                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                                : 'bg-amber-50/80 border-amber-200 text-amber-900'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {isBalanced ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                ) : (
                                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                )}
                                <div>
                                    <span className="font-bold block">
                                        {isBalanced
                                            ? 'Total Termin Sesuai 100%'
                                            : `Total Termin Belum Sesuai (Selisih ${formatRupiah(Math.abs(remainingBalance))})`}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                        Total Tagihan: <strong>{formatRupiah(totalProject)}</strong> | Terjadwal:{' '}
                                        <strong>{formatRupiah(totalAllocated)}</strong>
                                    </span>
                                </div>
                            </div>

                            {!isBalanced && (
                                <button
                                    type="button"
                                    onClick={handleBalanceToLast}
                                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                                >
                                    Sesuaikan ke Termin Terakhir
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Rekening Tujuan Pembayaran */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 mt-auto text-xs">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Metode Pembayaran</label>
                    <SelectSearch
                        options={paymentMethodOptions}
                        value={paymentMethodName}
                        onChange={handlePaymentMethodChange}
                        clearable={false}
                        className="w-full bg-white"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Bank / No. Rekening</label>
                        <Input
                            value={bankAccount}
                            onChange={(e) => setBankAccount(e.target.value)}
                            className="h-[40px] text-xs"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Atas Nama</label>
                        <Input
                            value={accountHolder}
                            onChange={(e) => setAccountHolder(e.target.value)}
                            className="h-[40px] text-xs"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
