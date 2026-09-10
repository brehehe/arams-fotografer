import React, { useRef, useState } from 'react';
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
    Wallet,
    CreditCard,
    ExternalLink,
    Receipt,
    RefreshCw,
    ImageIcon,
    Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Modal,
    AlertConfirmation,
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

interface PaymentMethodItem {
    id: string;
    name: string;
    code: string;
    account_number?: string;
    account_holder?: string;
}

interface AppreciationItem {
    id: string;
    status: 'given' | 'pending' | string;
    date: string;
    type: string;
    amount: number;
    payment_method_id?: string | null;
    finance_reference?: string | null;
    is_recorded_in_finance?: boolean;
    payment_method?: PaymentMethodItem | null;
    notes?: string;
    proof_image?: string | null;
}

interface FinanceSummary {
    total_expenses: number;
    pending_expenses: number;
    connected_to_finance: boolean;
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
    payment_methods?: PaymentMethodItem[];
    finance_summary?: FinanceSummary;
}

export default function ClientSourceShow({
    source,
    metrics = {
        total_referral_clients: 0,
        total_projects: 0,
        total_project_value: 0,
        last_referral_date: '-',
        last_referral_project: '-',
    },
    referral_history = [],
    total_amount = 0,
    appreciations = [],
    payment_methods = [],
    finance_summary = {
        total_expenses: 0,
        pending_expenses: 0,
        connected_to_finance: true,
    },
}: ClientSourceShowProps) {
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [noteModalOpen, setNoteModalOpen] = useState(false);
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

    // State for Appreciation Form (Create / Edit)
    const [isEditingAppreciation, setIsEditingAppreciation] = useState(false);
    const [editingAppreciationId, setEditingAppreciationId] = useState<string | null>(null);
    const [proofImageFile, setProofImageFile] = useState<File | null>(null);
    const [proofImagePreview, setProofImagePreview] = useState<string | null>(null);
    const [existingProofImage, setExistingProofImage] = useState<string | null>(null);
    const proofImageInputRef = useRef<HTMLInputElement>(null);

    const defaultPaymentMethodId = payment_methods[0]?.id || '';

    const [appreciationForm, setAppreciationForm] = useState({
        status: 'given',
        date: new Date().toISOString().split('T')[0],
        type: 'Komisi Tunai',
        amount: 500000,
        payment_method_id: defaultPaymentMethodId,
        is_recorded_in_finance: true,
        notes: '',
    });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val || 0);
    };

    const initials = source.name
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'SK';

    const getCategoryBadgeColor = (cat: string) => {
        switch ((cat || '').toLowerCase()) {
            case 'wedding':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'prewedding':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'engagement':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'event':
            case 'corporate':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'newborn':
            case 'birthday':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
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

    const handleEditAppreciation = (item: AppreciationItem) => {
        setIsEditingAppreciation(true);
        setEditingAppreciationId(item.id);
        setAppreciationForm({
            status: item.status || 'given',
            date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
            type: item.type || 'Komisi Tunai',
            amount: Number(item.amount) || 0,
            payment_method_id: item.payment_method_id || defaultPaymentMethodId,
            is_recorded_in_finance: item.is_recorded_in_finance ?? true,
            notes: item.notes || '',
        });
        setProofImageFile(null);
        setProofImagePreview(null);
        setExistingProofImage(item.proof_image || null);
        toast.info(`Mengubah apresiasi (${item.type})`);
    };

    const handleResetAppreciationForm = () => {
        setIsEditingAppreciation(false);
        setEditingAppreciationId(null);
        setProofImageFile(null);
        setProofImagePreview(null);
        setExistingProofImage(null);
        if (proofImageInputRef.current) proofImageInputRef.current.value = '';
        setAppreciationForm({
            status: 'given',
            date: new Date().toISOString().split('T')[0],
            type: 'Komisi Tunai',
            amount: 500000,
            payment_method_id: defaultPaymentMethodId,
            is_recorded_in_finance: true,
            notes: '',
        });
    };

    const handleProofImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setProofImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setProofImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSaveAppreciation = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('status', appreciationForm.status);
        formData.append('date', appreciationForm.date);
        formData.append('type', appreciationForm.type);
        formData.append('amount', String(appreciationForm.amount));
        formData.append('payment_method_id', appreciationForm.payment_method_id || '');
        formData.append('is_recorded_in_finance', appreciationForm.is_recorded_in_finance ? '1' : '0');
        formData.append('notes', appreciationForm.notes || '');
        if (proofImageFile) {
            formData.append('proof_image', proofImageFile);
        }

        if (isEditingAppreciation && editingAppreciationId) {
            formData.append('_method', 'PUT');
            router.post(`/client-sources/${source.id}/appreciation/${editingAppreciationId}`, formData, {
                forceFormData: true,
                onSuccess: () => {
                    handleResetAppreciationForm();
                    toast.success('Apresiasi referral berhasil diperbarui.');
                },
                onError: () => {
                    toast.error('Gagal memperbarui apresiasi.');
                },
            });
        } else {
            router.post(`/client-sources/${source.id}/appreciation`, formData, {
                forceFormData: true,
                onSuccess: () => {
                    handleResetAppreciationForm();
                    toast.success(
                        appreciationForm.is_recorded_in_finance
                            ? 'Apresiasi berhasil disimpan dan dicatat ke Finance!'
                            : 'Apresiasi referral berhasil dicatat.'
                    );
                },
                onError: () => {
                    toast.error('Gagal mencatat apresiasi.');
                },
            });
        }
    };

    const handleCancelAppreciation = () => {
        if (!confirmCancelAppreciation.id) {
            setConfirmCancelAppreciation({ isOpen: false });
            return;
        }
        router.delete(`/client-sources/${source.id}/appreciation/${confirmCancelAppreciation.id}`, {
            onSuccess: () => {
                setConfirmCancelAppreciation({ isOpen: false });
                if (editingAppreciationId === confirmCancelAppreciation.id) {
                    handleResetAppreciationForm();
                }
                toast.success('Apresiasi referral berhasil dihapus.');
            },
            onError: () => {
                toast.error('Gagal menghapus apresiasi.');
            },
        });
    };

    return (
        <div className="space-y-4 pb-2">
            <Head title={`${source.name} - Detail Sumber Klien - Arams Pictures`} />

            {/* ── HEADER TITLE & TOP ACTIONS ─────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Detail Sumber Klien: {source.name}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Data referral nyata terhubung langsung dengan database klien, project, dan modul Finance.
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
                            <span className="text-slate-400 text-[11px] block">Terdaftar Sejak</span>
                            <span className="font-bold text-slate-700 mt-0.5 block">
                                {source.created_at ? new Date(source.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom notice */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                    <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>Data terhubung secara real-time dengan basis data klien dan transaksi proyek Arams.</span>
                </div>
            </div>

            {/* ── 2. METRIC STAT CARDS (REAL DATABASE) ────────────────────────── */}
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
                        <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5 font-sans">
                            {metrics.total_referral_clients}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Klien terdaftar</span>
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
                        <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5 font-sans">
                            {metrics.total_projects}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Proyek aktif</span>
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
                        <div className="text-xl font-black text-[#C89445] tracking-tight mt-0.5 truncate font-sans" title={formatCurrency(metrics.total_project_value)}>
                            {formatCurrency(metrics.total_project_value)}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium truncate block">
                            Nilai dari seluruh project
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

            {/* ── 3. FINANCE INTEGRATION STATUS BANNER ────────────────────────── */}
            {/* <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-emerald-400 shrink-0">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">Integrasi Pengeluaran Finance</h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Terhubung
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                            Setiap komisi atau apresiasi referral otomatis tercatat sebagai beban pengeluaran operasional di buku kas studio.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t border-white/10 md:border-t-0 pt-3 md:pt-0">
                    <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Total Dibayarkan</span>
                        <span className="text-base font-extrabold text-[#C89445] font-sans">
                            {formatCurrency(finance_summary.total_expenses)}
                        </span>
                    </div>

                    <Link
                        href="/finance"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                        <span>Lihat di Finance</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div> */}

            {/* ── 4. TWO-COLUMN CONTENT AREA ─────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ── LEFT COLUMN (7 COLS): REFERRAL HISTORY & NOTES ────────── */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Riwayat Referral Table Card (Real DB) */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-900">
                                    Riwayat Referral (Client &amp; Project)
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Daftar project klien yang bersumber dari {source.name}.
                                </p>
                            </div>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                                {referral_history.length} Project
                            </span>
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
                                        <th className="py-3 px-3.5 min-w-28 text-center">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {referral_history.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-slate-400">
                                                <Users className="w-7 h-7 mx-auto text-slate-300 mb-1.5" />
                                                <p className="font-semibold text-xs text-slate-600">Belum ada project tercatat</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    Klien baru yang memilih sumber ini akan otomatis muncul di sini.
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        referral_history.map((item, idx) => (
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
                                                <td className="py-3 px-3.5 text-right font-bold text-slate-900 font-sans">
                                                    {formatCurrency(item.amount)}
                                                </td>
                                                <td className="py-3 px-3.5 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {referral_history.length > 0 && (
                                    <tfoot>
                                        <tr className="bg-slate-50/90 font-extrabold text-slate-900 border-t border-slate-200/80">
                                            <td colSpan={4} className="py-3 px-3.5 uppercase tracking-wider text-xs font-bold text-slate-700">
                                                Total Nilai Transaksi
                                            </td>
                                            <td className="py-3 px-3.5 text-right text-xs font-black text-[#C89445] font-sans">
                                                {formatCurrency(total_amount)}
                                            </td>
                                            <td className="py-3 px-3.5"></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                            <span>Menampilkan {referral_history.length} data proyek terhubung</span>
                        </div>
                    </div>

                    {/* Catatan Sumber Card */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-extrabold text-slate-900">
                                    Catatan Sumber
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setNoteModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                                <span>{source.description ? 'Ubah Catatan' : 'Tambah Catatan'}</span>
                            </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs text-slate-700 leading-relaxed font-medium">
                            {source.description || 'Belum ada catatan khusus untuk sumber klien ini.'}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN (5 COLS): APRESIASI REFERRAL & RIWAYAT ──── */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Apresiasi Referral Form Card (Terintegrasi Finance) */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                                    <Gift className="w-4 h-4 text-indigo-600" />
                                    <span>{isEditingAppreciation ? 'Ubah Apresiasi Referral' : 'Apresiasi Referral'}</span>
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Pencatatan komisi/reward yang otomatis tersinkronisasi dengan Finance.
                                </p>
                            </div>
                            {isEditingAppreciation && (
                                <button
                                    type="button"
                                    onClick={handleResetAppreciationForm}
                                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                                >
                                    Batal Edit
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSaveAppreciation} className="space-y-3.5 pt-1 text-xs">
                            {/* Status Apresiasi */}
                            <div className="space-y-1.5">
                                <label className="font-bold text-slate-700 block">Status Apresiasi</label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {/* Belum Diberikan (Pending) */}
                                    <button
                                        type="button"
                                        onClick={() => setAppreciationForm({ ...appreciationForm, status: 'pending' })}
                                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${
                                            appreciationForm.status === 'pending'
                                                ? 'bg-amber-50/90 border-amber-300 text-amber-900 shadow-xs ring-2 ring-amber-400/20'
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                                        }`}
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                                appreciationForm.status === 'pending'
                                                    ? 'border-amber-600 bg-white'
                                                    : 'border-slate-300 bg-white'
                                            }`}
                                        >
                                            {appreciationForm.status === 'pending' && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-in zoom-in-75 duration-150" />
                                            )}
                                        </div>
                                        <span className="leading-tight">⏳ Belum diberikan</span>
                                    </button>

                                    {/* Sudah Diberikan (Given) */}
                                    <button
                                        type="button"
                                        onClick={() => setAppreciationForm({ ...appreciationForm, status: 'given' })}
                                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${
                                            appreciationForm.status === 'given'
                                                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900 shadow-xs ring-2 ring-emerald-400/20'
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                                        }`}
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                                appreciationForm.status === 'given'
                                                    ? 'border-emerald-600 bg-white'
                                                    : 'border-slate-300 bg-white'
                                            }`}
                                        >
                                            {appreciationForm.status === 'given' && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-in zoom-in-75 duration-150" />
                                            )}
                                        </div>
                                        <span className="leading-tight">✓ Sudah diberikan</span>
                                    </button>
                                </div>
                            </div>

                            {/* Tanggal Apresiasi */}
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Tanggal Apresiasi</label>
                                <input
                                    type="date"
                                    required
                                    value={appreciationForm.date}
                                    onChange={(e) => setAppreciationForm({ ...appreciationForm, date: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:bg-white focus:border-indigo-600 outline-hidden"
                                />
                            </div>

                            {/* Bentuk Apresiasi */}
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Bentuk Apresiasi</label>
                                <select
                                    value={appreciationForm.type}
                                    onChange={(e) => setAppreciationForm({ ...appreciationForm, type: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:bg-white focus:border-indigo-600 outline-hidden cursor-pointer"
                                >
                                    <option value="Komisi Tunai">Komisi Tunai</option>
                                    <option value="Voucher Belanja">Voucher Belanja</option>
                                    <option value="Hadiah / Gift">Hadiah / Gift</option>
                                    <option value="Diskon Layanan">Diskon Layanan</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>

                            {/* Nominal / Nilai */}
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Nominal / Nilai (Rp)</label>
                                <div className="flex items-center">
                                    <span className="px-3.5 py-2.5 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs font-bold text-slate-500">
                                        Rp
                                    </span>
                                    <input
                                        type="number"
                                        min={0}
                                        value={appreciationForm.amount}
                                        onChange={(e) => setAppreciationForm({ ...appreciationForm, amount: Number(e.target.value) })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-sans"
                                    />
                                </div>
                            </div>

                            {/* ── KONEKSI KE FINANCE (PENGELUARAN) ── */}
                            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 space-y-3">
                                {/* <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={appreciationForm.is_recorded_in_finance}
                                        onChange={(e) => setAppreciationForm({ ...appreciationForm, is_recorded_in_finance: e.target.checked })}
                                        className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
                                    />
                                    <span className="font-bold text-xs text-indigo-950">
                                        Sambungkan ke Finance (Catat sebagai Pengeluaran Operasional)
                                    </span>
                                </label> */}

                                {appreciationForm.is_recorded_in_finance && (
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-indigo-900">
                                            Sumber Dana
                                        </label>
                                        <select
                                            value={appreciationForm.payment_method_id}
                                            onChange={(e) => setAppreciationForm({ ...appreciationForm, payment_method_id: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs text-slate-800 font-semibold focus:border-indigo-600 outline-hidden cursor-pointer"
                                        >
                                            {payment_methods.map((pm) => (
                                                <option key={pm.id} value={pm.id}>
                                                    {pm.name} {pm.account_number ? `(${pm.account_number})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-[10px] text-indigo-700 flex items-center gap-1">
                                            <Receipt className="w-3 h-3" />
                                            <span>Nomor referensi kas otomatis: EXP-REF-...</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Catatan */}
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">Catatan</label>
                                <textarea
                                    rows={2}
                                    placeholder="Contoh: Komisi referral transfer fee project Kevin & Jessica"
                                    value={appreciationForm.notes}
                                    onChange={(e) => setAppreciationForm({ ...appreciationForm, notes: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed focus:bg-white focus:border-indigo-600 outline-hidden resize-none font-medium"
                                />
                            </div>

                            {/* Bukti Pemberian (Upload Gambar) */}
                            <div>
                                <label className="font-bold text-slate-700 block mb-1">
                                    Bukti Pemberian
                                    <span className="text-slate-400 font-normal ml-1">(Opsional)</span>
                                </label>

                                {/* Preview area */}
                                {(proofImagePreview || existingProofImage) && (
                                    <div className="relative mb-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                        <img
                                            src={proofImagePreview ?? `/storage/${existingProofImage}`}
                                            alt="Bukti pemberian"
                                            className="w-full max-h-40 object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProofImageFile(null);
                                                setProofImagePreview(null);
                                                setExistingProofImage(null);
                                                if (proofImageInputRef.current) proofImageInputRef.current.value = '';
                                            }}
                                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center hover:bg-rose-700 transition-colors cursor-pointer"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}

                                <label
                                    htmlFor="proof_image_upload"
                                    className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 hover:border-indigo-400 rounded-xl text-xs text-slate-500 font-semibold cursor-pointer transition-colors"
                                >
                                    <Upload className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>
                                        {proofImageFile ? proofImageFile.name : 'Pilih foto bukti (JPG, PNG, WEBP)'}
                                    </span>
                                </label>
                                <input
                                    ref={proofImageInputRef}
                                    id="proof_image_upload"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/jpg"
                                    onChange={handleProofImageChange}
                                    className="hidden"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>
                                        {isEditingAppreciation ? 'Simpan Perubahan Apresiasi' : 'Simpan & Sambungkan ke Finance'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Riwayat Apresiasi List Card (Real DB) */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <h3 className="text-sm font-extrabold text-slate-900">
                                    Riwayat Apresiasi
                                </h3>
                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                    {appreciations.length}
                                </span>
                            </div>
                        </div>

                        {appreciations.length === 0 ? (
                            <div className="py-8 text-center">
                                <Gift className="w-7 h-7 mx-auto text-slate-300 mb-2" />
                                <p className="text-xs font-semibold text-slate-500">Belum ada apresiasi dicatat</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Tambahkan apresiasi pertama di atas.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {appreciations.map((appr) => (
                                    <div
                                        key={appr.id}
                                        className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-2.5 hover:bg-white hover:shadow-sm transition-all"
                                    >
                                        {/* Row 1: Tanggal + Status + Tombol Aksi */}
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                                                    {appr.date
                                                        ? new Date(appr.date).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })
                                                        : '-'}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${appr.status === 'given'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}
                                                >
                                                    {appr.status === 'given' ? '✓ Diberikan' : '⏳ Pending'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-0.5 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditAppreciation(appr)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmCancelAppreciation({ isOpen: true, id: appr.id })}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Row 2: Bentuk Apresiasi + Nominal */}
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-bold text-slate-800">{appr.type}</span>
                                            <span className="text-xs font-black text-slate-900 font-sans">{formatCurrency(appr.amount)}</span>
                                        </div>

                                        {/* Row 3: Finance ref + Metode kas */}
                                        <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/60">
                                            {appr.is_recorded_in_finance ? (
                                                <div className="flex items-center gap-1 text-[10px] text-indigo-700 font-mono">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                                                    <span className="truncate max-w-[120px]">{appr.finance_reference || 'Finance OK'}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-slate-400">Non-Finance</span>
                                            )}
                                            {appr.payment_method && (
                                                <span className="text-[10px] text-slate-500 font-medium truncate max-w-[100px]">
                                                    {appr.payment_method.name}
                                                </span>
                                            )}
                                        </div>

                                        {/* Row 4: Catatan + Bukti foto */}
                                        {(appr.notes || appr.proof_image) && (
                                            <div className="flex items-start justify-between gap-2">
                                                {appr.notes && (
                                                    <p className="text-[11px] text-slate-500 leading-relaxed flex-1 min-w-0 truncate">
                                                        {appr.notes}
                                                    </p>
                                                )}
                                                {appr.proof_image && (
                                                    <a
                                                        href={`/storage/${appr.proof_image}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-[10px] text-indigo-600 hover:underline font-semibold shrink-0"
                                                    >
                                                        <ImageIcon className="w-3 h-3" />
                                                        Lihat Bukti
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                            <span>Menampilkan {appreciations.length} data apresiasi</span>
                            <span className="font-semibold text-slate-600">
                                Total: {formatCurrency(finance_summary.total_expenses)}
                            </span>
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
                title="Hapus Apresiasi"
                description="Apakah Anda yakin ingin membatalkan/menghapus catatan apresiasi ini? Transaksi pengeluaran terkait akan dibatalkan."
                confirmText="Ya, Hapus Apresiasi"
                cancelText="Batal"
            />
        </div>
    );
}
