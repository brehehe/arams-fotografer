import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Edit2,
    Users,
    FileSpreadsheet,
    DollarSign,
    Calendar,
    CheckCircle2,
    Clock,
    Gift,
    Info,
    Plus,
    X,
    Trash2,
    Check,
    ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
    TableEmpty,
    TableFooter,
    Modal,
    AlertConfirmation,
    Badge,
} from '@/components/ui';

interface ReferralHistoryItem {
    id: number | string;
    client: string;
    project: string;
    project_category: string;
    event_date: string;
    amount: number;
    status: string;
}

interface AppreciationItem {
    id: string;
    status: 'given' | 'pending' | string;
    date: string;
    type: string;
    amount: number;
    notes?: string;
}

interface ClientSourceShowProps {
    source: {
        id: string;
        name: string;
        type: string;
        phone?: string;
        email?: string;
        description?: string;
        status: string;
        is_primary: boolean;
        avatar?: string;
        created_at?: string;
    };
    metrics?: {
        total_referral_clients: number;
        total_projects: number;
        total_project_value: number;
        last_referral_date: string;
        last_referral_project: string;
    };
    referral_history?: ReferralHistoryItem[];
    total_amount?: number;
    appreciations?: AppreciationItem[];
}

export default function ClientSourceShow({
    source,
    metrics = {
        total_referral_clients: 12,
        total_projects: 12,
        total_project_value: 28750000,
        last_referral_date: '27 Agustus 2026',
        last_referral_project: 'Kevin & Jessica (Wedding)',
    },
    referral_history = [],
    total_amount = 28750000,
    appreciations = [],
}: ClientSourceShowProps) {
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [noteModalOpen, setNoteModalOpen] = useState(false);
    const [appreciationModalOpen, setAppreciationModalOpen] = useState(false);
    const [confirmCancelAppreciation, setConfirmCancelAppreciation] = useState<{ isOpen: boolean; id?: string }>({
        isOpen: false,
    });

    // Form states
    const [editForm, setEditForm] = useState({
        name: source.name,
        type: source.type || 'individual',
        phone: source.phone || source.email || '',
        description: source.description || '',
        status: source.status || 'active',
        is_primary: Boolean(source.is_primary),
    });

    const [noteContent, setNoteContent] = useState(source.description || '');

    const latestAppreciation = appreciations[0] || {
        status: 'given',
        date: '2026-08-25',
        type: 'Voucher Belanja',
        amount: 500000,
        notes: 'Terima kasih banyak atas rekomendasi dan kepercayaannya. Semoga hubungan baik kita terus terjalin.',
    };

    const [appreciationForm, setAppreciationForm] = useState({
        status: latestAppreciation.status || 'given',
        date: latestAppreciation.date || '2026-08-25',
        type: latestAppreciation.type || 'Voucher Belanja',
        amount: latestAppreciation.amount || 500000,
        notes: latestAppreciation.notes || 'Terima kasih banyak atas rekomendasi dan kepercayaannya. Semoga hubungan baik kita terus terjalin.',
    });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val);
    };

    const initials = source.name
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'RS';

    const getCategoryBadgeColor = (cat: string) => {
        switch (cat.toLowerCase()) {
            case 'wedding':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'prewedding':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'engagement':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'event':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        router.put(`/client-sources/${source.id}`, editForm, {
            onSuccess: () => {
                setEditModalOpen(false);
                toast.success('Data sumber klien berhasil diperbarui.');
            },
            onError: () => {
                toast.error('Gagal memperbarui sumber klien.');
            },
        });
    };

    const handleSaveNote = (e: React.FormEvent) => {
        e.preventDefault();
        router.put(
            `/client-sources/${source.id}`,
            {
                name: source.name,
                type: source.type,
                phone: source.phone,
                status: source.status,
                is_primary: source.is_primary,
                description: noteContent,
            },
            {
                onSuccess: () => {
                    setNoteModalOpen(false);
                    toast.success('Catatan sumber berhasil disimpan.');
                },
            }
        );
    };

    const handleSaveAppreciation = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/client-sources/${source.id}/appreciation`, appreciationForm, {
            onSuccess: () => {
                setAppreciationModalOpen(false);
                toast.success('Apresiasi referral berhasil dicatat.');
            },
            onError: () => {
                toast.error('Gagal mencatat apresiasi.');
            },
        });
    };

    const handleCancelAppreciation = () => {
        if (!confirmCancelAppreciation.id) {
            setConfirmCancelAppreciation({ isOpen: false });
            toast.info('Pencatatan apresiasi dinonaktifkan.');
            return;
        }
        router.delete(`/client-sources/${source.id}/appreciation/${confirmCancelAppreciation.id}`, {
            onSuccess: () => {
                setConfirmCancelAppreciation({ isOpen: false });
                toast.success('Apresiasi referral berhasil dibatalkan.');
            },
        });
    };

    return (
        <div className="space-y-6 pb-12">
            <Head title={`${source.name} - Detail Sumber Klien - Arams Pictures`} />

            {/* ── HEADER TITLE & TOP ACTIONS ─────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Detail Sumber Klien
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Informasi lengkap tentang sumber klien / referral dan riwayat kontribusinya.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                    <Link
                        href="/client-sources"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Kembali</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setEditModalOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Sumber</span>
                    </button>
                </div>
            </div>

            {/* ── 1. MAIN PROFILE CARD ────────────────────────────────────────── */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Left: Avatar & Identity */}
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-black text-2xl shadow-xs shrink-0">
                            {initials}
                        </div>
                        <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h2 className="text-xl font-black text-slate-900 truncate">
                                    {source.name}
                                </h2>
                                {source.status === 'active' ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        Aktif
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                        Nonaktif
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>Tipe Sumber:</span>
                                <span className="font-bold text-slate-800 capitalize">
                                    {source.type === 'individual' ? 'Perorangan' : source.type.replace('_', ' ')}
                                </span>
                                {source.phone && (
                                    <>
                                        <span className="text-slate-300">•</span>
                                        <span className="font-mono text-slate-600">{source.phone}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Metadata Pill Block */}
                    <div className="flex flex-wrap items-center gap-3 md:justify-end">
                        <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs">
                            <span className="text-slate-400 text-[11px] block">Sumber Primary (Utama)</span>
                            <span className={`font-bold inline-flex items-center gap-1 mt-0.5 ${source.is_primary ? 'text-emerald-600' : 'text-slate-600'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${source.is_primary ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                {source.is_primary ? 'Ya (Primary)' : 'Bukan Primary'}
                            </span>
                        </div>

                        <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs">
                            <span className="text-slate-400 text-[11px] block">Dibuat Otomatis</span>
                            <span className="font-bold text-slate-700 mt-0.5 block">
                                {source.created_at ? new Date(source.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '29 Mei 2026, 14:32 WIB'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom notice */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                    <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Sumber ini dibuat otomatis saat pertama kali digunakan oleh client.</span>
                </div>
            </div>

            {/* ── 2. FOUR DEDICATED STAT CARDS (BELOW PROFILE CARD) ─────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Referral */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-500 block truncate">
                            Total Referral (Client)
                        </span>
                        <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                            {metrics.total_referral_clients}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Client</span>
                    </div>
                </div>

                {/* Card 2: Total Project */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-500 block truncate">
                            Total Project
                        </span>
                        <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                            {metrics.total_projects}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Project</span>
                    </div>
                </div>

                {/* Card 3: Total Nilai Project */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-500 block truncate">
                            Total Nilai Project
                        </span>
                        <div className="text-xl font-black text-slate-900 tracking-tight mt-0.5 truncate" title={formatCurrency(metrics.total_project_value)}>
                            {formatCurrency(metrics.total_project_value)}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium truncate block">
                            Nilai dari semua project
                        </span>
                    </div>
                </div>

                {/* Card 4: Referral Terakhir */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-500 block truncate">
                            Referral Terakhir
                        </span>
                        <div className="text-base font-black text-slate-900 tracking-tight mt-0.5 truncate">
                            {metrics.last_referral_date}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium truncate block" title={metrics.last_referral_project}>
                            {metrics.last_referral_project}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── TWO-COLUMN CONTENT AREA ────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ── LEFT COLUMN (7 COLS): REFERRAL HISTORY & NOTES ────────── */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Riwayat Referral Table Card */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-extrabold text-slate-900">
                                Riwayat Referral (Client &amp; Project)
                            </h3>
                            <button
                                type="button"
                                onClick={() => toast.info('Menampilkan seluruh riwayat referral')}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
                            >
                                <span>Lihat Semua Riwayat</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
                            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                                <thead>
                                    <tr className="bg-slate-50/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                                        <th className="py-3 px-3.5 w-12 text-center">NO</th>
                                        <th className="py-3 px-3.5 min-w-36">CLIENT</th>
                                        <th className="py-3 px-3.5 min-w-28">PROJECT</th>
                                        <th className="py-3 px-3.5 min-w-28">TANGGAL PROJECT</th>
                                        <th className="py-3 px-3.5 min-w-32 text-right">NILAI PROJECT</th>
                                        <th className="py-3 px-3.5 min-w-28 text-center">STATUS PROJECT</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {referral_history.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3 px-3.5 text-center text-slate-400 font-bold">
                                                {idx + 1}
                                            </td>
                                            <td className="py-3 px-3.5 font-bold text-slate-900">
                                                {item.client}
                                            </td>
                                            <td className="py-3 px-3.5">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${getCategoryBadgeColor(item.project_category)}`}>
                                                    {item.project}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3.5 text-slate-500 font-medium">
                                                {item.event_date}
                                            </td>
                                            <td className="py-3 px-3.5 text-right font-bold text-slate-900">
                                                {formatCurrency(item.amount)}
                                            </td>
                                            <td className="py-3 px-3.5 text-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-50/90 font-extrabold text-slate-900 border-t border-slate-200/80">
                                        <td colSpan={4} className="py-3 px-3.5 uppercase tracking-wider text-xs font-bold text-slate-700">
                                            Total
                                        </td>
                                        <td className="py-3 px-3.5 text-right text-xs font-black text-slate-900">
                                            {formatCurrency(total_amount)}
                                        </td>
                                        <td className="py-3 px-3.5"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Pagination footer */}
                        <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                            <span>Menampilkan 1 - 10 dari 12 project</span>
                            <div className="flex items-center gap-1.5">
                                <button type="button" className="px-2.5 py-1 border border-slate-200 rounded-lg text-slate-400 font-bold hover:bg-slate-50 cursor-pointer">
                                    &lt;
                                </button>
                                <button type="button" className="w-7 h-7 rounded-lg bg-[#4F46E5] text-white text-xs font-bold shadow-xs flex items-center justify-center">
                                    1
                                </button>
                                <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center cursor-pointer">
                                    2
                                </button>
                                <button type="button" className="px-2.5 py-1 border border-slate-200 rounded-lg text-slate-600 font-bold hover:bg-slate-50 cursor-pointer">
                                    &gt;
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Catatan Sumber Card */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-extrabold text-slate-900">
                                    Catatan Sumber (Opsional)
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setNoteModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Tambah Catatan</span>
                            </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs text-slate-700 leading-relaxed font-medium">
                            {source.description || 'Channel organik Instagram @arams.pictures'}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN (5 COLS): APRESIASI REFERRAL & RIWAYAT ──── */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Apresiasi Referral Form Card */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                    <Gift className="w-4 h-4 text-indigo-600" />
                                    <span>Apresiasi Referral</span>
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Pencatatan apresiasi dilakukan secara manual oleh Owner/Admin.
                                </p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                Sudah Diberikan
                            </span>
                        </div>

                        <form onSubmit={handleSaveAppreciation} className="space-y-3.5 pt-1 text-xs">
                            {/* Status Apresiasi */}
                            <div className="space-y-1.5">
                                <label className="font-bold text-slate-700 block">Status Apresiasi</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 font-semibold text-slate-600 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="appreciation_status"
                                            value="pending"
                                            checked={appreciationForm.status === 'pending'}
                                            onChange={() => setAppreciationForm({ ...appreciationForm, status: 'pending' })}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span>Belum diberikan</span>
                                    </label>
                                    <label className="flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="appreciation_status"
                                            value="given"
                                            checked={appreciationForm.status === 'given'}
                                            onChange={() => setAppreciationForm({ ...appreciationForm, status: 'given' })}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span>Sudah diberikan</span>
                                    </label>
                                </div>
                            </div>

                            {/* Tanggal Apresiasi */}
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Tanggal Apresiasi</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={appreciationForm.date}
                                        onChange={(e) => setAppreciationForm({ ...appreciationForm, date: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:bg-white focus:border-indigo-600 outline-hidden"
                                    />
                                </div>
                            </div>

                            {/* Bentuk Apresiasi */}
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Bentuk Apresiasi</label>
                                <select
                                    value={appreciationForm.type}
                                    onChange={(e) => setAppreciationForm({ ...appreciationForm, type: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:bg-white focus:border-indigo-600 outline-hidden cursor-pointer"
                                >
                                    <option value="Voucher Belanja">Voucher Belanja</option>
                                    <option value="Komisi Tunai">Komisi Tunai</option>
                                    <option value="Hadiah / Gift">Hadiah / Gift</option>
                                    <option value="Diskon Layanan">Diskon Layanan</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>

                            {/* Nominal / Nilai */}
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Nominal / Nilai (Jika ada)</label>
                                <div className="flex items-center">
                                    <span className="px-3.5 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs font-bold text-slate-500">
                                        Rp
                                    </span>
                                    <input
                                        type="number"
                                        value={appreciationForm.amount}
                                        onChange={(e) => setAppreciationForm({ ...appreciationForm, amount: Number(e.target.value) })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden"
                                    />
                                </div>
                            </div>

                            {/* Catatan */}
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Catatan</label>
                                <textarea
                                    rows={3}
                                    value={appreciationForm.notes}
                                    onChange={(e) => setAppreciationForm({ ...appreciationForm, notes: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed focus:bg-white focus:border-indigo-600 outline-hidden resize-none font-medium"
                                />
                            </div>

                            {/* Action Buttons matching Gambar 3 */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                                >
                                    <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Lihat / Ubah Apresiasi</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setConfirmCancelAppreciation({ isOpen: true, id: latestAppreciation?.id })}
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Batalkan Apresiasi</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Riwayat Apresiasi List Card */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <h3 className="text-sm font-extrabold text-slate-900">
                                    Riwayat Apresiasi
                                </h3>
                                <Info className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <button
                                type="button"
                                onClick={() => toast.info('Menampilkan seluruh riwayat apresiasi')}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                            >
                                Lihat Semua
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50/90 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80 whitespace-nowrap">
                                        <th className="py-3 px-3.5 min-w-24">TANGGAL</th>
                                        <th className="py-3 px-3.5 min-w-32">BENTUK APRESIASI</th>
                                        <th className="py-3 px-3.5 min-w-24">NILAI</th>
                                        <th className="py-3 px-3.5 min-w-56">CATATAN</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr>
                                        <td className="py-3 px-3.5 text-slate-500 font-medium whitespace-nowrap">
                                            25 Agu 2026
                                        </td>
                                        <td className="py-3 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                                            Voucher Belanja
                                        </td>
                                        <td className="py-3 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                                            Rp 500.000
                                        </td>
                                        <td className="py-3 px-3.5 text-slate-600 text-xs leading-relaxed min-w-56">
                                            Terima kasih banyak atas rekomendasi dan kepercayaannya. Semoga hubungan baik kita terus terjalin.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="text-[11px] text-slate-400">
                            Menampilkan 1 dari 1 data
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MODAL EDIT SUMBER ─────────────────────────────────────────── */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title="Edit Sumber Klien"
                subtitle="Perbarui data pihak sumber rekomendasi klien."
                maxWidth="xl"
            >
                <form onSubmit={handleSaveEdit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nama Sumber Klien *
                        </label>
                        <input
                            type="text"
                            required
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:border-indigo-600 outline-hidden"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Tipe Sumber *
                            </label>
                            <select
                                value={editForm.type}
                                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-indigo-600 outline-hidden cursor-pointer"
                            >
                                <option value="individual">Perorangan</option>
                                <option value="wedding_organizer">Wedding Organizer</option>
                                <option value="vendor">Vendor / Partner</option>
                                <option value="social_media">Media Sosial / Online</option>
                                <option value="ads">Iklan (Ads)</option>
                                <option value="other">Lainnya</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Status *
                            </label>
                            <select
                                value={editForm.status}
                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-indigo-600 outline-hidden cursor-pointer"
                            >
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setEditModalOpen(false)}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
                        >
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── MODAL EDIT CATATAN ────────────────────────────────────────── */}
            <Modal
                isOpen={noteModalOpen}
                onClose={() => setNoteModalOpen(false)}
                title="Catatan Sumber"
                subtitle="Tuliskan catatan khusus terkait sumber klien ini."
                maxWidth="lg"
            >
                <form onSubmit={handleSaveNote} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Deskripsi / Catatan Tambahan
                        </label>
                        <textarea
                            rows={4}
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder="Tuliskan catatan khusus terkait sumber klien ini..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-indigo-600 outline-hidden resize-none leading-relaxed"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setNoteModalOpen(false)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-md cursor-pointer"
                        >
                            Simpan Catatan
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── MODAL BATALKAN APRESIASI CONFIRMATION ─────────────────────── */}
            <AlertConfirmation
                isOpen={confirmCancelAppreciation.isOpen}
                onClose={() => setConfirmCancelAppreciation({ isOpen: false })}
                onConfirm={handleCancelAppreciation}
                variant="danger"
                title="Batalkan Apresiasi"
                description="Apakah Anda yakin ingin membatalkan pencatatan apresiasi ini?"
                confirmText="Ya, Batalkan Apresiasi"
                cancelText="Batal"
            />
        </div>
    );
}
