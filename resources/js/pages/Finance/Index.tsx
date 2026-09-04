import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Modal } from '@/components/ui';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    DollarSign,
    CreditCard,
    FileText,
    TrendingUp,
    Download,
    X,
    CheckCircle2,
    Briefcase,
    Receipt,
    Gift,
    Wallet,
    MoreVertical,
    ChevronDown,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    AlertCircle,
    Eye,
    Printer,
    Info,
    Search,
    ExternalLink,
    ChevronRight,
    ArrowRight,
    PieChart,
    Filter,
    PlusCircle,
    Trash2,
    Tag,
    Check,
} from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';

export interface FinanceInvoiceItem {
    id: string;
    invoice_number: string;
    is_dp: boolean;
    project_name: string;
    client_name: string;
    project_id: string;
    date: string;
    paket: number;
    addon: number;
    operasional: number;
    total_project: number;
    sudah_diterima: number;
    diterima_pct: string;
    sisa: number;
    status: string;
    status_color: string;
}

const INCOME_PRESETS = [
    'Sewa Studio & Alat',
    'Penjualan Cetak / Album',
    'Tips & Bonus Klien',
    'Cashback & Bunga Bank',
    'Pemasukan Lainnya',
];

const EXPENSE_PRESETS = [
    'Konsumsi & Logistik Crew',
    'Transport, Bensin & Tol',
    'Sewa Properti & Wardrobe',
    'Servis & Alat Fotografi',
    'Langganan Software & Cloud',
    'Listrik, Internet & Studio',
    'Honor Crew Lepas / Freelance',
    'Pengeluaran Lainnya',
];

interface FinanceIndexProps {
    tab?: string;
    filters?: {
        year: number;
        available_years: number[];
    };
    stats?: any;
    monthly_revenue?: any[];
    pm_breakdown?: any[];
    outstanding_projects?: any[];
    top_projects?: any[];
    invoice_stats?: any;
    invoice_status_breakdown?: {
        total: number;
        paid_count: number;
        paid_pct: number;
        waiting_count: number;
        waiting_pct: number;
        unpaid_count: number;
        unpaid_pct: number;
    };
    project_status_breakdown?: {
        total: number;
        paid_count: number;
        paid_pct: number;
        partial_count: number;
        partial_pct: number;
        unpaid_count: number;
        unpaid_pct: number;
        pending_count: number;
        pending_pct: number;
    };
    invoice_list?: FinanceInvoiceItem[];
    payments?: any;
    invoices?: any;
    payment_methods?: any[];
    projects?: any[];
    referral_expenses?: number;
    referral_expense_items?: any[];
    misc_transactions?: any[];
    misc_stats?: {
        total_income: number;
        total_expense: number;
        net_balance: number;
        count: number;
    };
    financial_statement?: any;
    unified_cashflow?: any[];
}

export default function FinanceIndex({
    tab: serverTab = 'payments',
    filters,
    stats = {},
    monthly_revenue = [],
    pm_breakdown = [],
    outstanding_projects = [],
    top_projects = [],
    invoice_stats = {},
    invoice_status_breakdown,
    project_status_breakdown,
    invoice_list: propsInvoiceList = [],
    payments = { data: [] },
    invoices = { data: [] },
    payment_methods = [],
    projects = [],
    referral_expenses = 0,
    referral_expense_items = [],
    misc_transactions = [],
    misc_stats = { total_income: 0, total_expense: 0, net_balance: 0, count: 0 },
    financial_statement,
    unified_cashflow = [],
}: FinanceIndexProps) {
    const activeYear = filters?.year ?? new Date().getFullYear();
    const availableYears = filters?.available_years ?? [new Date().getFullYear()];
    const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
    const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
    const [expenseModalOpen, setExpenseModalOpen] = useState(false);
    const [expenseTab, setExpenseTab] = useState<'referral' | 'operational'>('referral');
    const [allInvoicesModalOpen, setAllInvoicesModalOpen] = useState(false);
    const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
    const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
    const [financialReportTab, setFinancialReportTab] = useState<'overview' | 'ledger' | 'misc' | 'operational' | 'referral'>('overview');
    const [cashflowTypeFilter, setCashflowTypeFilter] = useState<'all' | 'inflow' | 'outflow'>('all');

    // State Modal Catat Kas Lainnya
    const [transactionModalOpen, setTransactionModalOpen] = useState(false);
    const [isSubmittingTransaction, setIsSubmittingTransaction] = useState(false);
    const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
    const [transactionCategory, setTransactionCategory] = useState('Konsumsi & Logistik Crew');
    const [transactionTitle, setTransactionTitle] = useState('');
    const [transactionAmount, setTransactionAmount] = useState<number | string>('');
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
    const [transactionPaymentMethodId, setTransactionPaymentMethodId] = useState('');
    const [transactionReference, setTransactionReference] = useState('');
    const [transactionNotes, setTransactionNotes] = useState('');

    // State Filter & Search Transaksi Lain-lain
    const [miscTypeFilter, setMiscTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [miscSearchQuery, setMiscSearchQuery] = useState('');

    // Format mata uang ringkas (k, jt, M)
    const formatCompactRupiah = (val: number): string => {
        if (!val || isNaN(val)) return 'Rp 0';
        const abs = Math.abs(val);
        if (abs >= 1_000_000_000) {
            const formatted = (val / 1_000_000_000).toFixed(1).replace('.', ',');
            return `Rp ${formatted.replace(',0', '')} M`;
        }
        if (abs >= 1_000_000) {
            const formatted = (val / 1_000_000).toFixed(1).replace('.', ',');
            return `Rp ${formatted.replace(',0', '')} jt`;
        }
        if (abs >= 1_000) {
            const formatted = (val / 1_000).toFixed(0);
            return `Rp ${formatted}k`;
        }
        return `Rp ${val}`;
    };

    // Primary KPI Stats from Database
    const totalNilaiTransaksi = Number(stats.total_value) || 0;
    const sudahDiterima = Number(stats.total_received) || 0;
    const belumDiterima = Number(stats.total_outstanding) || 0;
    const rataRataPembayaran = Number(stats.avg_payment_amount) || 0;

    const persenSudahDiterima = totalNilaiTransaksi > 0
        ? `${((sudahDiterima / totalNilaiTransaksi) * 100).toFixed(2).replace('.', ',')}%`
        : '0%';
    const persenBelumDiterima = totalNilaiTransaksi > 0
        ? `${((belumDiterima / totalNilaiTransaksi) * 100).toFixed(2).replace('.', ',')}%`
        : '0%';

    // Real Invoices List from Database
    const invoiceList = useMemo<FinanceInvoiceItem[]>(() => {
        if (propsInvoiceList && propsInvoiceList.length > 0) {
            return propsInvoiceList;
        }
        if (invoices?.data && invoices.data.length > 0) {
            return invoices.data.map((inv: any) => {
                const project = inv.project;
                const client = inv.client;
                const clientName = client?.bride_name && client?.groom_name
                    ? `${client.bride_name} & ${client.groom_name}`
                    : (client?.name || '-');
                const total = Number(inv.total) || 0;
                const paid = Number(inv.paid_amount) || 0;
                const remaining = Number(inv.remaining_amount) || 0;
                const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
                return {
                    id: inv.id,
                    invoice_number: inv.invoice_number,
                    is_dp: inv.invoice_number?.includes('DP') || (pct > 0 && pct < 100),
                    project_name: project?.name || 'Project',
                    client_name: clientName,
                    project_id: inv.project_id || '',
                    date: inv.issue_date
                        ? new Date(inv.issue_date).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                          })
                        : '-',
                    paket: Number(inv.subtotal) || total,
                    addon: Number(inv.discount) || 0,
                    operasional: Number(inv.tax) || 0,
                    total_project: total,
                    sudah_diterima: paid,
                    diterima_pct: `${pct}%`,
                    sisa: remaining,
                    status:
                        inv.status === 'paid'
                            ? 'Lunas'
                            : inv.status === 'partial'
                            ? 'Lunas DP'
                            : inv.status === 'unpaid'
                            ? 'Belum Dibayar'
                            : 'Menunggu',
                    status_color:
                        inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : inv.status === 'partial'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : inv.status === 'unpaid'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200',
                };
            });
        }
        return [];
    }, [propsInvoiceList, invoices]);

    const allInvoicesDisplay = useMemo(() => {
        return invoiceList;
    }, [invoiceList]);

    const filteredInvoices = useMemo(() => {
        if (!invoiceSearchQuery.trim()) return allInvoicesDisplay;
        const q = invoiceSearchQuery.toLowerCase();
        return allInvoicesDisplay.filter(
            (inv: any) =>
                inv.invoice_number?.toLowerCase().includes(q) ||
                inv.project_name?.toLowerCase().includes(q) ||
                inv.client_name?.toLowerCase().includes(q)
        );
    }, [allInvoicesDisplay, invoiceSearchQuery]);

    // Top 5 Projects List directly from Database
    const topProjectsList = useMemo(() => {
        if (top_projects && top_projects.length > 0) {
            return top_projects.map((item: any, idx: number) => ({
                id: idx + 1,
                name: item.name,
                client_name: item.client_name,
                total: Number(item.total_amount) || 0,
                received: Number(item.paid_amount) || 0,
                remaining: Math.max(0, (Number(item.total_amount) || 0) - (Number(item.paid_amount) || 0)),
                pct: Number(item.paid_pct) || 0,
            }));
        }
        return [];
    }, [top_projects]);

    // Real Monthly Revenue Chart Data (12 Months of Database Payments & Invoices)
    const monthlyMaxVal = useMemo(() => {
        if (!monthly_revenue || monthly_revenue.length === 0) return 1;
        return Math.max(...monthly_revenue.map((m: any) => Number(m.total) || 0), 1);
    }, [monthly_revenue]);

    // Add 25% headroom so highest bar reaches ~80% of container height (charting standard)
    const monthlyCeilingVal = useMemo(() => {
        return Math.round(monthlyMaxVal * 1.25);
    }, [monthlyMaxVal]);

    const monthlyChartData = useMemo(() => {
        if (monthly_revenue && monthly_revenue.length > 0) {
            return monthly_revenue.map((item: any) => {
                const total = Number(item.total) || 0;
                const received = Number(item.received) || 0;
                const outstanding = Number(item.outstanding) || 0;
                return {
                    month: item.month,
                    month_full: item.month_full,
                    totalRaw: total,
                    receivedRaw: received,
                    outstandingRaw: outstanding,
                    totalHeightPct: total > 0 ? Math.max(4, Math.round((total / monthlyCeilingVal) * 100)) : 0,
                    receivedHeightPct: received > 0 ? Math.max(4, Math.round((received / monthlyCeilingVal) * 100)) : 0,
                    outstandingHeightPct: outstanding > 0 ? Math.max(4, Math.round((outstanding / monthlyCeilingVal) * 100)) : 0,
                };
            });
        }
        return [];
    }, [monthly_revenue, monthlyCeilingVal]);

    // Invoice Status Breakdown from Database
    const invStatus = useMemo(() => {
        if (invoice_status_breakdown) {
            return invoice_status_breakdown;
        }
        const total = Number(invoice_stats?.total) || 0;
        const paid = Number(invoice_stats?.paid) || 0;
        const waiting = (Number(invoice_stats?.sent) || 0) + (Number(invoice_stats?.draft) || 0);
        const unpaid = Number(invoice_stats?.overdue) || 0;
        return {
            total,
            paid_count: paid,
            paid_pct: total > 0 ? Math.round((paid / total) * 100) : 0,
            waiting_count: waiting,
            waiting_pct: total > 0 ? Math.round((waiting / total) * 100) : 0,
            unpaid_count: unpaid,
            unpaid_pct: total > 0 ? Math.round((unpaid / total) * 100) : 0,
        };
    }, [invoice_status_breakdown, invoice_stats]);

    // Payment Methods Breakdown from Database
    const pmList = useMemo(() => {
        if (pm_breakdown && pm_breakdown.length > 0) {
            return pm_breakdown;
        }
        return [];
    }, [pm_breakdown]);

    const totalPmPaymentsCount = useMemo(() => {
        return pmList.reduce((acc: number, item: any) => acc + (Number(item.count) || 0), 0);
    }, [pmList]);

    // Real Financial Statement Summary from Database
    const finSummary = useMemo(() => {
        if (financial_statement) {
            return financial_statement;
        }
        const omzet = Number(stats.total_value) || 0;
        const kas = Number(stats.total_received) || 0;
        const piutang = Number(stats.total_outstanding) || 0;
        const refExp = Number(stats.total_referral_expenses) || 0;
        return {
            total_omzet: omzet,
            total_kas_diterima: kas,
            total_piutang: piutang,
            total_paket: omzet,
            total_addon: 0,
            total_operasional: 0,
            total_referral: refExp,
            total_pengeluaran: refExp,
            net_profit: omzet - refExp,
            net_profit_margin: omzet > 0 ? Number((((omzet - refExp) / omzet) * 100).toFixed(2)) : 0,
            cash_in_hand: kas - refExp,
        };
    }, [financial_statement, stats]);

    const totalPaketSemua = finSummary.total_paket;
    const totalAddonSemua = finSummary.total_addon;
    const totalBebanOperasionalSemua = finSummary.total_operasional;
    const totalBebanReferralSemua = finSummary.total_referral;
    const totalPengeluaranSemua = finSummary.total_pengeluaran;
    const totalOmzetPemasukanSemua = finSummary.total_omzet;
    const totalKasDiterimaSemua = finSummary.total_kas_diterima;
    const totalBelumDiterimaSemua = finSummary.total_piutang;
    const labaBersihKontrakSemua = finSummary.net_profit;
    const labaBersihMarginSemua = String(finSummary.net_profit_margin).replace('.', ',');
    const kasBersihDiterimaSemua = finSummary.cash_in_hand;

    const totalPemasukanLainSemua = Number(finSummary.total_pemasukan_lain) || Number(misc_stats?.total_income) || 0;
    const totalPengeluaranLainSemua = Number(finSummary.total_pengeluaran_lain) || Number(misc_stats?.total_expense) || 0;

    // Real Unified Cashflow Ledger (Inflow + Outflow from Database)
    const unifiedCashflowItems = useMemo(() => {
        if (unified_cashflow && unified_cashflow.length > 0) {
            return unified_cashflow.map((item: any) => ({
                id: String(item.id),
                raw_id: item.raw_id,
                is_misc: Boolean(item.is_misc),
                date: item.date_formatted || item.date || '-',
                reference: item.ref_no,
                category: item.category,
                description: item.description,
                type: item.type as 'inflow' | 'outflow',
                amount: Number(item.amount) || 0,
                payment_method: item.payment_method || 'Kas Studio',
                status: item.status,
                status_color:
                    item.type === 'inflow'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : item.status === 'Selesai'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200',
                link: item.link,
            }));
        }
        return [];
    }, [unified_cashflow]);

    const filteredCashflowItems = useMemo(() => {
        if (cashflowTypeFilter === 'inflow') {
            return unifiedCashflowItems.filter((i) => i.type === 'inflow');
        }
        if (cashflowTypeFilter === 'outflow') {
            return unifiedCashflowItems.filter((i) => i.type === 'outflow');
        }
        return unifiedCashflowItems;
    }, [unifiedCashflowItems, cashflowTypeFilter]);

    // Misc Transactions List from Database
    const miscTransactionsList = useMemo(() => {
        if (misc_transactions && misc_transactions.length > 0) {
            return misc_transactions;
        }
        return [];
    }, [misc_transactions]);

    const filteredMiscTransactions = useMemo(() => {
        return miscTransactionsList.filter((item: any) => {
            if (miscTypeFilter !== 'all' && item.type !== miscTypeFilter) return false;
            if (miscSearchQuery.trim()) {
                const q = miscSearchQuery.toLowerCase();
                return (
                    item.title?.toLowerCase().includes(q) ||
                    item.category?.toLowerCase().includes(q) ||
                    item.transaction_number?.toLowerCase().includes(q) ||
                    item.reference_number?.toLowerCase().includes(q)
                );
            }
            return true;
        });
    }, [miscTransactionsList, miscTypeFilter, miscSearchQuery]);

    // Handle Save Transaction (Pemasukan / Pengeluaran Lainnya)
    const handleSaveTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        const amt = Number(transactionAmount);
        if (!amt || amt <= 0) {
            toast.error('Nominal transaksi harus lebih dari 0');
            return;
        }
        if (!transactionTitle.trim()) {
            toast.error('Keterangan transaksi tidak boleh kosong');
            return;
        }
        if (!transactionCategory.trim()) {
            toast.error('Kategori transaksi harus dipilih atau diisi');
            return;
        }

        setIsSubmittingTransaction(true);
        router.post(
            '/finance/transactions',
            {
                type: transactionType,
                category: transactionCategory.trim(),
                title: transactionTitle.trim(),
                amount: amt,
                date: transactionDate,
                payment_method_id: transactionPaymentMethodId || null,
                reference_number: transactionReference.trim() || null,
                notes: transactionNotes.trim() || null,
            },
            {
                onSuccess: () => {
                    toast.success(
                        transactionType === 'income'
                            ? 'Pemasukan kas berhasil dicatat!'
                            : 'Pengeluaran kas berhasil dicatat!'
                    );
                    setTransactionModalOpen(false);
                    setTransactionTitle('');
                    setTransactionAmount('');
                    setTransactionReference('');
                    setTransactionNotes('');
                    setIsSubmittingTransaction(false);
                },
                onError: (errs) => {
                    const firstErr = Object.values(errs)[0];
                    toast.error(typeof firstErr === 'string' ? firstErr : 'Gagal menyimpan transaksi');
                    setIsSubmittingTransaction(false);
                },
            }
        );
    };

    // Handle Delete Transaction
    const handleDeleteTransaction = (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus catatan transaksi kas ini?')) return;

        router.delete(`/finance/transactions/${id}`, {
            onSuccess: () => {
                toast.success('Transaksi kas berhasil dihapus');
            },
            onError: () => {
                toast.error('Gagal menghapus transaksi kas');
            },
        });
    };

    // Export CSV
    const handleExportCSV = () => {
        const headers = ['NO. INV', 'PROJECT', 'TANGGAL', 'PAKET', 'ADD-ON', 'OPERASIONAL', 'TOTAL', 'DITERIMA', 'SISA', 'STATUS'];
        const rows = invoiceList.map((item) => [
            item.invoice_number,
            item.project_name,
            item.date,
            item.paket,
            item.addon,
            item.operasional,
            item.total_project,
            item.sudah_diterima,
            item.sisa,
            item.status,
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Laporan_Finance_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Laporan finance berhasil diexport!');
    };

    return (
        <div className="w-full max-w-full space-y-6 pb-20">
            <Head title="Finance - Arams Pictures" />

            {/* ── 1. HEADER SECTION ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Finance</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Ringkasan keuangan, arus kas, dan invoice studio.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                        type="button"
                        onClick={() => {
                            setTransactionType('expense');
                            setTransactionCategory('Konsumsi & Logistik Crew');
                            setTransactionModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Catat Kas Lainnya</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setExpenseModalOpen(true)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                    >
                        <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Cek Biaya Pengeluaran</span>
                    </button>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export Laporan</span>
                            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                        </button>

                        {exportDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in duration-150">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setExportDropdownOpen(false);
                                        handleExportCSV();
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                                >
                                    <FileText className="w-4 h-4 text-emerald-600" />
                                    <span>Export sebagai CSV</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setExportDropdownOpen(false);
                                        window.print();
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                                >
                                    <Printer className="w-4 h-4 text-indigo-600" />
                                    <span>Cetak Ringkasan</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── 2. TOP 4 STATS CARDS ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Total Nilai Transaksi */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold">
                            <span className="truncate">Total Nilai Transaksi</span>
                            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
                            <FileText className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h2 className="text-xl xl:text-2xl font-black text-[#C89445] font-sans tracking-tight">
                            {formatRupiah(totalNilaiTransaksi)}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">Total nilai dari semua project</p>
                    </div>
                </div>

                {/* 2. Sudah Diterima */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold">
                            <span className="truncate">Sudah Diterima</span>
                            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
                            <ArrowDownLeft className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h2 className="text-xl xl:text-2xl font-black text-[#C89445] font-sans tracking-tight">
                            {formatRupiah(sudahDiterima)}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{persenSudahDiterima} dari total transaksi</p>
                    </div>
                </div>

                {/* 3. Belum Diterima */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold">
                            <span className="truncate">Belum Diterima</span>
                            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0 shadow-2xs">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h2 className="text-xl xl:text-2xl font-black text-[#C89445] font-sans tracking-tight">
                            {formatRupiah(belumDiterima)}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{persenBelumDiterima} dari total transaksi</p>
                    </div>
                </div>

                {/* 4. Rata-rata Pembayaran */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold">
                            <span className="truncate">Rata-rata Pembayaran</span>
                            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-2xs">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-3">
                        <h2 className="text-xl xl:text-2xl font-black text-[#C89445] font-sans tracking-tight">
                            {formatRupiah(rataRataPembayaran)}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">Rata-rata per invoice</p>
                    </div>
                </div>
            </div>

            {/* ── 3. ROW 2: GRAFIK TREN KEUANGAN & INVOICE PER BULAN (FULL WIDTH - BESAR & RAPI) ── */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wide border border-indigo-100">
                                Analitik Keuangan Bulanan
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500 font-medium">Tahun {activeYear}</span>
                        </div>
                        <h3 className="font-bold text-base sm:text-lg text-slate-900 mt-1">
                            Tren Keuangan &amp; Tagihan per Bulan
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Visualisasi komparasi nilai tagihan kontrak, realisasi kas masuk, dan sisa piutang per bulan.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Summary Badges in Header */}
                        <div className="hidden xl:flex items-center gap-2 text-xs pr-2 border-r border-slate-200">
                            <div className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                                <span className="text-[10px] text-slate-400 block font-medium">Total Kontrak:</span>
                                <span className="font-bold font-sans text-indigo-700">{formatCompactRupiah(totalNilaiTransaksi)}</span>
                            </div>
                            <div className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                                <span className="text-[10px] text-slate-400 block font-medium">Kas Masuk:</span>
                                <span className="font-bold font-sans text-emerald-700">{formatCompactRupiah(sudahDiterima)}</span>
                            </div>
                            <div className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                                <span className="text-[10px] text-slate-400 block font-medium">Piutang:</span>
                                <span className="font-bold font-sans text-rose-700">{formatCompactRupiah(belumDiterima)}</span>
                            </div>
                        </div>

                        {/* Year Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-colors"
                            >
                                <span>{activeYear}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                            {yearDropdownOpen && (
                                <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 text-xs">
                                    {availableYears.map((y) => (
                                        <button
                                            key={y}
                                            type="button"
                                            onClick={() => {
                                                setYearDropdownOpen(false);
                                                router.get(
                                                    '/finance',
                                                    { year: y },
                                                    { preserveState: false, preserveScroll: false }
                                                );
                                            }}
                                            className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 font-medium ${
                                                y === activeYear ? 'text-indigo-600 font-bold' : 'text-slate-700'
                                            }`}
                                        >
                                            {y}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Legend Row */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-md bg-[#4F46E5]" />
                            <span>Total Tagihan / Kontrak</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-md bg-[#10B981]" />
                            <span>Kas Sudah Diterima</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-md bg-[#EF4444]" />
                            <span>Sisa Belum Diterima</span>
                        </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                        Arahkan kursor ke tiap bulan untuk melihat rincian nominal riil
                    </span>
                </div>

                {/* Main Large Bar Chart */}
                <div className="pt-2 overflow-x-auto sm:overflow-visible">
                    <div className="min-w-[540px] sm:min-w-0 w-full">
                        <div className="h-72 sm:h-80 flex items-end justify-between gap-1 sm:gap-2.5 lg:gap-3.5 border-b border-slate-200 pb-3 relative">
                            {/* Horizontal guideline grid */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-3 opacity-35">
                                <div className="border-b border-dashed border-slate-300 w-full" />
                                <div className="border-b border-dashed border-slate-300 w-full" />
                                <div className="border-b border-dashed border-slate-300 w-full" />
                                <div className="border-b border-dashed border-slate-300 w-full" />
                                <div className="border-b border-dashed border-slate-300 w-full" />
                            </div>

                            {monthlyChartData.map((item, idx) => (
                                <div
                                    key={idx}
                                    onMouseEnter={() => setHoveredBarIndex(idx)}
                                    onMouseLeave={() => setHoveredBarIndex(null)}
                                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative cursor-pointer z-10 px-0.5 sm:px-1"
                                >
                                    {/* Interactive Floating Tooltip */}
                                    {hoveredBarIndex === idx && (
                                        <div className="absolute -top-28 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-xs text-white text-[11px] py-2.5 px-3.5 rounded-xl shadow-xl z-30 pointer-events-none whitespace-nowrap border border-slate-700/80">
                                            <div className="font-bold text-slate-200 border-b border-slate-700/80 pb-1 mb-1.5 flex items-center justify-between gap-4">
                                                <span>{item.month_full || `${item.month} 2026`}</span>
                                                <span className="text-[9px] text-emerald-400 font-mono">Data Riil Database</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-indigo-300 font-medium">Tagihan / Kontrak:</span>
                                                    <span className="font-bold font-sans">{formatRupiah(item.totalRaw)}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-emerald-300 font-medium">Kas Diterima:</span>
                                                    <span className="font-bold font-sans">{formatRupiah(item.receivedRaw)}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-rose-300 font-medium">Sisa Piutang:</span>
                                                    <span className="font-bold font-sans">{formatRupiah(item.outstandingRaw)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                                        {/* Total Bar (Purple) */}
                                        <div
                                            style={{ height: `${item.totalHeightPct}%` }}
                                            className={`w-2 sm:w-3 lg:w-3.5 bg-[#4F46E5] rounded-t-sm transition-all duration-300 ${
                                                hoveredBarIndex === idx ? 'brightness-125 scale-y-105 ring-2 ring-indigo-300' : 'group-hover:opacity-85'
                                            }`}
                                        />
                                        {/* Sudah Diterima Bar (Green) */}
                                        <div
                                            style={{ height: `${item.receivedHeightPct}%` }}
                                            className={`w-2 sm:w-3 lg:w-3.5 bg-[#10B981] rounded-t-sm transition-all duration-300 ${
                                                hoveredBarIndex === idx ? 'brightness-125 scale-y-105 ring-2 ring-emerald-300' : 'group-hover:opacity-85'
                                            }`}
                                        />
                                        {/* Belum Diterima Bar (Red) */}
                                        <div
                                            style={{ height: `${item.outstandingHeightPct}%` }}
                                            className={`w-2 sm:w-3 lg:w-3.5 bg-[#EF4444] rounded-t-sm transition-all duration-300 ${
                                                hoveredBarIndex === idx ? 'brightness-125 scale-y-105 ring-2 ring-rose-300' : 'group-hover:opacity-85'
                                            }`}
                                        />
                                    </div>
                                    <span
                                        className={`text-xs font-semibold block mt-1.5 transition-colors ${
                                            hoveredBarIndex === idx ? 'text-indigo-600 font-bold' : 'text-slate-500'
                                        }`}
                                    >
                                        {item.month}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Guideline Scale Labels */}
                        <div className="flex justify-between text-xs text-slate-400 pt-2 font-mono">
                            <span>0</span>
                            <span>{formatCompactRupiah(monthlyCeilingVal * 0.2)}</span>
                            <span>{formatCompactRupiah(monthlyCeilingVal * 0.4)}</span>
                            <span>{formatCompactRupiah(monthlyCeilingVal * 0.6)}</span>
                            <span>{formatCompactRupiah(monthlyCeilingVal * 0.8)}</span>
                            <span>{formatCompactRupiah(monthlyCeilingVal)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 4. ROW 3: DAFTAR INVOICE (FULL WIDTH - LEGA & RAPI) ── */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                        <h3 className="font-bold text-base text-slate-900">Daftar Invoice Terkini</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Menampilkan {invoiceList.length} invoice riil yang diterbitkan dari project studio
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setAllInvoicesModalOpen(true)}
                        className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-[#3B46F1] transition-colors cursor-pointer"
                    >
                        <span>Lihat Semua Invoice ({invoiceList.length})</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead>
                            <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200 bg-slate-50/50">
                                <th className="py-3 px-3">NO. INV</th>
                                <th className="py-3 px-3">PROJECT &amp; KLIEN</th>
                                <th className="py-3 px-3">TANGGAL</th>
                                <th className="py-3 px-3 text-right">PAKET</th>
                                <th className="py-3 px-3 text-right">ADD-ON / ALA CARTE</th>
                                <th className="py-3 px-3 text-right">BIAYA OPERASIONAL</th>
                                <th className="py-3 px-3 text-right">TOTAL PROJECT</th>
                                <th className="py-3 px-3 text-right">SUDAH DITERIMA</th>
                                <th className="py-3 px-3 text-right">SISA</th>
                                <th className="py-3 px-3 text-center">STATUS</th>
                                <th className="py-3 px-3 text-center w-10">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                            {invoiceList.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                    <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                                        <div className="flex items-center gap-1.5">
                                            <span>{item.invoice_number}</span>
                                            {item.is_dp && (
                                                <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[9px] font-bold rounded">
                                                    DP
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-3 font-medium text-slate-800 max-w-[220px] truncate">
                                        <Link
                                            href={`/projects/${item.project_id}`}
                                            className="font-bold text-slate-900 hover:text-[#3B46F1] transition-colors block truncate"
                                            title={item.project_name}
                                        >
                                            {item.project_name}
                                        </Link>
                                        {item.client_name && item.client_name !== '-' && (
                                            <span className="text-[10px] text-slate-400 block font-normal mt-0.5 truncate">
                                                Klien: {item.client_name}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3.5 px-3 text-slate-500">{item.date}</td>
                                    <td className="py-3.5 px-3 text-right text-slate-700 font-sans">
                                        {formatRupiah(item.paket)}
                                    </td>
                                    <td className="py-3.5 px-3 text-right text-slate-700 font-sans">
                                        {item.addon > 0 ? formatRupiah(item.addon) : 'Rp 0'}
                                    </td>
                                    <td className="py-3.5 px-3 text-right text-slate-700 font-sans">
                                        {formatRupiah(item.operasional)}
                                    </td>
                                    <td className="py-3.5 px-3 text-right font-bold text-slate-900 font-sans">
                                        {formatRupiah(item.total_project)}
                                    </td>
                                    <td className="py-3.5 px-3 text-right font-semibold text-emerald-600 font-sans">
                                        {formatRupiah(item.sudah_diterima)} ({item.diterima_pct})
                                    </td>
                                    <td className="py-3.5 px-3 text-right font-semibold text-rose-600 font-sans">
                                        {formatRupiah(item.sisa)}
                                    </td>
                                    <td className="py-3.5 px-3 text-center">
                                        <span
                                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.status_color}`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-3 text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                                >
                                                    <MoreVertical className="w-3.5 h-3.5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-36 bg-white rounded-xl border border-slate-200/90 shadow-xl p-1 z-50 text-xs">
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={`/projects/${item.project_id}/invoice`}
                                                        className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 font-medium rounded-lg flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>Lihat Invoice</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={`/projects/${item.project_id}`}
                                                        className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 font-medium rounded-lg flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>Detail Project</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── 4. ROW 3: STATUS INVOICE, TOP 5 PROJECTS, METODE PEMBAYARAN ─── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                {/* 1. Status Invoice (Chart di atas, detail di bawah - Database Riil) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                    <h3 className="font-bold text-sm text-[#C89445]">Status Invoice</h3>

                    {/* Chart di Atas */}
                    <div className="flex flex-col items-center justify-center py-4">
                        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                {/* Background ring */}
                                <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="3.8" />
                                {/* Lunas (Green) */}
                                {invStatus.paid_pct > 0 && (
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="14"
                                        fill="none"
                                        stroke="#10B981"
                                        strokeWidth="3.8"
                                        pathLength="100"
                                        strokeDasharray={`${invStatus.paid_pct} 100`}
                                        strokeDashoffset="0"
                                        className="transition-all duration-500 hover:brightness-110"
                                    />
                                )}
                                {/* Menunggu Pembayaran (Amber) */}
                                {invStatus.waiting_pct > 0 && (
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="14"
                                        fill="none"
                                        stroke="#F59E0B"
                                        strokeWidth="3.8"
                                        pathLength="100"
                                        strokeDasharray={`${invStatus.waiting_pct} 100`}
                                        strokeDashoffset={`-${invStatus.paid_pct}`}
                                        className="transition-all duration-500 hover:brightness-110"
                                    />
                                )}
                                {/* Belum Dibayar (Red) */}
                                {invStatus.unpaid_pct > 0 && (
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="14"
                                        fill="none"
                                        stroke="#EF4444"
                                        strokeWidth="3.8"
                                        pathLength="100"
                                        strokeDasharray={`${invStatus.unpaid_pct} 100`}
                                        strokeDashoffset={`-${invStatus.paid_pct + invStatus.waiting_pct}`}
                                        className="transition-all duration-500 hover:brightness-110"
                                    />
                                )}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total</span>
                                <span className="text-3xl sm:text-4xl font-black text-slate-900 leading-none my-1">
                                    {invStatus.total}
                                </span>
                                <span className="text-xs text-slate-400 font-semibold">Invoice</span>
                            </div>
                        </div>
                    </div>

                    {/* Detail di Bawah */}
                    <div className="border-t border-slate-100 pt-3 space-y-2.5 w-full">
                        <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
                                <span className="text-xs font-semibold text-slate-700">Lunas</span>
                            </div>
                            <span className="text-xs font-bold text-slate-900 font-sans">
                                {invStatus.paid_count} ({invStatus.paid_pct}%)
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
                                <span className="text-xs font-semibold text-slate-700">Menunggu Pembayaran</span>
                            </div>
                            <span className="text-xs font-bold text-slate-900 font-sans">
                                {invStatus.waiting_count} ({invStatus.waiting_pct}%)
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
                                <span className="text-xs font-semibold text-slate-700">Belum Dibayar</span>
                            </div>
                            <span className="text-xs font-bold text-slate-900 font-sans">
                                {invStatus.unpaid_count} ({invStatus.unpaid_pct}%)
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Top 5 Project (Berdasarkan Nilai Transaksi - Database Riil) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
                    <div>
                        <h3 className="font-bold text-sm text-[#C89445]">
                            Top 5 Project <span className="text-slate-400 font-normal text-xs">(Berdasarkan Nilai Transaksi)</span>
                        </h3>

                        {/* Tidy List of Top 5 Projects directly from DB */}
                        <div className="divide-y divide-slate-100 mt-2">
                            {topProjectsList.length === 0 ? (
                                <p className="text-xs text-slate-400 py-6 text-center">Belum ada data project</p>
                            ) : (
                                topProjectsList.map((item: any) => {
                                    return (
                                        <div key={item.id} className="py-2.5 space-y-1.5 hover:bg-slate-50/60 rounded-xl px-2 transition-colors">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-black text-[10px] flex items-center justify-center shrink-0">
                                                        {item.id}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <span className="font-bold text-xs text-slate-900 truncate block" title={item.name}>
                                                            {item.name}
                                                        </span>
                                                        {item.client_name && (
                                                            <span className="text-[10px] text-slate-400 truncate block">
                                                                {item.client_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="font-bold text-xs text-slate-900 block font-sans">
                                                        {formatRupiah(item.total)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Financial breakdown line & progress */}
                                            <div className="flex items-center justify-between text-[11px] pl-7">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-400 font-medium">Sudah diterima:</span>
                                                    <span className="font-bold text-emerald-600 font-sans">
                                                        {formatRupiah(item.received)}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                                    {item.pct}%
                                                </span>
                                            </div>

                                            {/* Mini progress bar */}
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden ml-7 max-w-[calc(100%-1.75rem)]">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                                    style={{ width: `${item.pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                        <Link
                            href="/projects"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3B46F1] hover:text-indigo-800 transition-colors"
                        >
                            <span>Lihat Semua Project</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* 3. Metode Pembayaran (Chart di atas, detail di bawah - Database Riil) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                    <h3 className="font-bold text-sm text-[#C89445]">Metode Pembayaran</h3>

                    {/* Chart di Atas */}
                    <div className="flex flex-col items-center justify-center py-4">
                        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                {/* Background ring */}
                                <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="3.8" />
                                {pmList.map((pm: any, idx: number) => {
                                    const prevOffsets = pmList.slice(0, idx).reduce((acc: number, cur: any) => acc + (Number(cur.pct) || 0), 0);
                                    return (
                                        <circle
                                            key={pm.id || idx}
                                            cx="18"
                                            cy="18"
                                            r="14"
                                            fill="none"
                                            stroke={pm.color || '#3B46F1'}
                                            strokeWidth="3.8"
                                            pathLength="100"
                                            strokeDasharray={`${pm.pct} 100`}
                                            strokeDashoffset={`-${prevOffsets}`}
                                            className="transition-all duration-500 hover:brightness-110"
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total</span>
                                <span className="text-3xl sm:text-4xl font-black text-slate-900 leading-none my-1">
                                    {totalPmPaymentsCount}
                                </span>
                                <span className="text-xs text-slate-400 font-semibold">Transaksi</span>
                            </div>
                        </div>
                    </div>

                    {/* Detail di Bawah */}
                    <div className="border-t border-slate-100 pt-3 space-y-2 w-full">
                        {pmList.length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 text-center">Belum ada transaksi metode pembayaran</p>
                        ) : (
                            pmList.map((pm: any) => (
                                <div key={pm.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: pm.color }} />
                                        <div>
                                            <span className="text-xs font-semibold text-slate-700 block">{pm.name}</span>
                                            {pm.account_number && (
                                                <span className="text-[10px] text-slate-400 font-mono block">{pm.account_number}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-slate-900 font-sans block">{pm.count} ({pm.pct}%)</span>
                                        <span className="text-[10px] text-slate-400 font-sans font-medium">{formatCompactRupiah(pm.total)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── 5. ROW 4: LAPORAN KEUANGAN TERPADU (PEMASUKAN & PENGELUARAN JADI SATU FULL) ─────────── */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                {/* Header Section */}
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-slate-50/70 via-white to-amber-50/20">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wide">
                                Laporan Finansial Studio
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500 font-medium">Buku Kas Terpadu 2026</span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">
                            Laporan Keuangan Terpadu <span className="text-[#C89445] font-bold text-base">(Pemasukan &amp; Pengeluaran)</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Semua arus kas masuk (omzet &amp; pelunasan invoice) dan arus kas keluar (biaya operasional project &amp; komisi referral) disajikan utuh dalam satu laporan.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5 text-slate-500" />
                            <span>Cetak Laporan</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5 text-amber-400" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* 3 Executive High-Level Cards (Total Pemasukan, Total Pengeluaran, Laba Bersih) */}
                <div className="p-5 sm:p-6 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/40">
                    {/* 1. Total Pemasukan */}
                    <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                    <ArrowDownLeft className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
                                        TOTAL PEMASUKAN
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">Omzet &amp; Tagihan Project</span>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Inflow
                            </span>
                        </div>

                        <div>
                            <span className="text-2xl font-black text-slate-900 font-sans tracking-tight block">
                                {formatRupiah(totalOmzetPemasukanSemua)}
                            </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-slate-600">
                                <span>Kas Sudah Diterima:</span>
                                <span className="font-bold text-emerald-600 font-sans">
                                    {formatRupiah(totalKasDiterimaSemua)} ({persenSudahDiterima})
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-600">
                                <span>Belum Diterima (Piutang):</span>
                                <span className="font-bold text-rose-600 font-sans">
                                    {formatRupiah(totalBelumDiterimaSemua)} ({persenBelumDiterima})
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Total Pengeluaran */}
                    <div className="p-4 rounded-2xl bg-white border border-rose-200/80 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider block">
                                        TOTAL PENGELUARAN
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">Beban Operasional &amp; Referral</span>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                Outflow
                            </span>
                        </div>

                        <div>
                            <span className="text-2xl font-black text-slate-900 font-sans tracking-tight block">
                                {formatRupiah(totalPengeluaranSemua)}
                            </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-slate-600">
                                <span>Biaya Operasional Project:</span>
                                <span className="font-bold text-slate-900 font-sans">
                                    {formatRupiah(totalBebanOperasionalSemua)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-600">
                                <span>Beban Komisi &amp; Apresiasi:</span>
                                <span className="font-bold text-indigo-600 font-sans">
                                    {formatRupiah(totalBebanReferralSemua)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Laba Bersih & Arus Kas Riil */}
                    <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-md space-y-3 border border-slate-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                                        ESTIMASI LABA BERSIH
                                    </span>
                                    <span className="text-xs text-slate-300 font-medium">Net Profit (Margin {labaBersihMarginSemua}%)</span>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Net Profit
                            </span>
                        </div>

                        <div>
                            <span className="text-2xl font-black text-[#C89445] font-sans tracking-tight block">
                                {formatRupiah(labaBersihKontrakSemua)}
                            </span>
                        </div>

                        <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between text-slate-300">
                                <span>Rumus Profit:</span>
                                <span className="text-slate-400 font-mono text-[11px]">
                                    Pemasukan − Pengeluaran
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-300">
                                <span>Kas Bersih Saat Ini:</span>
                                <span className="font-bold text-emerald-400 font-sans">
                                    {formatRupiah(kasBersihDiterimaSemua)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation for Unified Statement (High-Contrast Segmented Bar) */}
                <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-slate-200 bg-slate-50/70">
                    <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl max-w-full overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setFinancialReportTab('overview')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                                financialReportTab === 'overview'
                                    ? 'bg-white shadow-xs border border-slate-300/80 font-black'
                                    : 'hover:bg-white/60 hover:text-slate-900'
                            }`}
                            style={{
                                color: financialReportTab === 'overview' ? '#0F172A' : '#334155',
                                backgroundColor: financialReportTab === 'overview' ? '#FFFFFF' : 'transparent',
                            }}
                        >
                            <PieChart className={`w-4 h-4 ${financialReportTab === 'overview' ? 'text-[#C89445]' : 'text-slate-600'}`} />
                            <span>Ringkasan Terpadu (Pemasukan vs Pengeluaran)</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFinancialReportTab('ledger')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                                financialReportTab === 'ledger'
                                    ? 'bg-white shadow-xs border border-slate-300/80 font-black'
                                    : 'hover:bg-white/60 hover:text-slate-900'
                            }`}
                            style={{
                                color: financialReportTab === 'ledger' ? '#0F172A' : '#334155',
                                backgroundColor: financialReportTab === 'ledger' ? '#FFFFFF' : 'transparent',
                            }}
                        >
                            <Receipt className={`w-4 h-4 ${financialReportTab === 'ledger' ? 'text-indigo-600' : 'text-slate-600'}`} />
                            <span>Buku Kas Terpadu</span>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                    financialReportTab === 'ledger' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-300/80 text-slate-700'
                                }`}
                            >
                                {unifiedCashflowItems.length} Transaksi
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFinancialReportTab('misc')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                                financialReportTab === 'misc'
                                    ? 'bg-white shadow-xs border border-slate-300/80 font-black'
                                    : 'hover:bg-white/60 hover:text-slate-900'
                            }`}
                            style={{
                                color: financialReportTab === 'misc' ? '#0F172A' : '#334155',
                                backgroundColor: financialReportTab === 'misc' ? '#FFFFFF' : 'transparent',
                            }}
                        >
                            <Wallet className={`w-4 h-4 ${financialReportTab === 'misc' ? 'text-teal-600' : 'text-slate-600'}`} />
                            <span>Transaksi Kas Lain-lain</span>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                    financialReportTab === 'misc' ? 'bg-teal-100 text-teal-700' : 'bg-slate-300/80 text-slate-700'
                                }`}
                            >
                                {miscTransactionsList.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFinancialReportTab('operational')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                                financialReportTab === 'operational'
                                    ? 'bg-white shadow-xs border border-slate-300/80 font-black'
                                    : 'hover:bg-white/60 hover:text-slate-900'
                            }`}
                            style={{
                                color: financialReportTab === 'operational' ? '#0F172A' : '#334155',
                                backgroundColor: financialReportTab === 'operational' ? '#FFFFFF' : 'transparent',
                            }}
                        >
                            <Briefcase className={`w-4 h-4 ${financialReportTab === 'operational' ? 'text-amber-600' : 'text-slate-600'}`} />
                            <span>Rincian Biaya Operasional</span>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                    financialReportTab === 'operational' ? 'bg-amber-100 text-amber-700' : 'bg-slate-300/80 text-slate-700'
                                }`}
                            >
                                {invoiceList.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFinancialReportTab('referral')}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                                financialReportTab === 'referral'
                                    ? 'bg-white shadow-xs border border-slate-300/80 font-black'
                                    : 'hover:bg-white/60 hover:text-slate-900'
                            }`}
                            style={{
                                color: financialReportTab === 'referral' ? '#0F172A' : '#334155',
                                backgroundColor: financialReportTab === 'referral' ? '#FFFFFF' : 'transparent',
                            }}
                        >
                            <Gift className={`w-4 h-4 ${financialReportTab === 'referral' ? 'text-rose-600' : 'text-slate-600'}`} />
                            <span>Rincian Komisi Referral</span>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                    financialReportTab === 'referral' ? 'bg-rose-100 text-rose-700' : 'bg-slate-300/80 text-slate-700'
                                }`}
                            >
                                {referral_expense_items.length}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Tab 1: Ringkasan Terpadu Berdampingan (Pemasukan vs Pengeluaran) */}
                {financialReportTab === 'overview' && (
                    <div className="p-5 sm:p-6 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                            {/* Sisi Kiri: Rincian Pemasukan */}
                            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                        <h4 className="font-bold text-sm text-slate-900">Rincian Pemasukan (Income)</h4>
                                    </div>
                                    <span className="text-xs font-black text-emerald-600 font-sans">
                                        + {formatRupiah(totalOmzetPemasukanSemua)}
                                    </span>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between py-2 px-3 bg-white rounded-xl border border-slate-100">
                                        <span className="text-slate-600 font-medium">Paket Foto &amp; Video Utama:</span>
                                        <span className="font-bold text-slate-900 font-sans">{formatRupiah(totalPaketSemua)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 px-3 bg-white rounded-xl border border-slate-100">
                                        <span className="text-slate-600 font-medium">Add-on &amp; Ala Carte (Album, Print, Frame):</span>
                                        <span className="font-bold text-slate-900 font-sans">{formatRupiah(totalAddonSemua)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 px-3 bg-white rounded-xl border border-slate-100">
                                        <span className="text-slate-600 font-medium">Komponen Biaya di Invoice:</span>
                                        <span className="font-bold text-slate-900 font-sans">{formatRupiah(totalBebanOperasionalSemua)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 px-3 bg-white rounded-xl border border-slate-100">
                                        <span className="text-slate-600 font-medium">Pemasukan Kas Lain-lain (Sewa/Tips/Cetak Ekstra):</span>
                                        <span className="font-bold text-emerald-600 font-sans">{formatRupiah(totalPemasukanLainSemua)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 px-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-emerald-800">
                                        <span className="font-bold">Total Nilai Tagihan + Pemasukan:</span>
                                        <span className="font-black font-sans text-sm">{formatRupiah(totalOmzetPemasukanSemua)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 px-3 bg-white rounded-xl border border-slate-100">
                                        <span className="text-slate-600 font-medium">Kas Riil Sudah Diterima:</span>
                                        <span className="font-bold text-emerald-600 font-sans">{formatRupiah(totalKasDiterimaSemua)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 px-3 bg-white rounded-xl border border-slate-100">
                                        <span className="text-slate-600 font-medium">Piutang Klien (Belum Lunas):</span>
                                        <span className="font-bold text-rose-600 font-sans">{formatRupiah(totalBelumDiterimaSemua)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Sisi Kanan: Rincian Pengeluaran */}
                            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                        <h4 className="font-bold text-sm text-slate-900">Rincian Pengeluaran (Expenses)</h4>
                                    </div>
                                    <span className="text-xs font-black text-rose-600 font-sans">
                                        - {formatRupiah(totalPengeluaranSemua)}
                                    </span>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between py-2 px-3 bg-white rounded-xl border border-slate-100">
                                        <span className="text-slate-600 font-medium">Beban Operasional Project (Akomodasi, Transport, Crew):</span>
                                        <span className="font-bold text-slate-900 font-sans">{formatRupiah(totalBebanOperasionalSemua)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 px-3 bg-white rounded-xl border border-slate-100">
                                        <span className="text-slate-600 font-medium">Beban Komisi &amp; Apresiasi Referral (Mitra):</span>
                                        <span className="font-bold text-indigo-600 font-sans">{formatRupiah(totalBebanReferralSemua)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 px-3 bg-white rounded-xl border border-slate-100">
                                        <span className="text-slate-600 font-medium">Beban Kas Lain-lain (Konsumsi/Alat/Utilitas):</span>
                                        <span className="font-bold text-rose-600 font-sans">{formatRupiah(totalPengeluaranLainSemua)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2.5 px-3 bg-rose-50/80 rounded-xl border border-rose-200 text-rose-800">
                                        <span className="font-bold">Total Seluruh Beban Pengeluaran:</span>
                                        <span className="font-black font-sans text-sm">{formatRupiah(totalPengeluaranSemua)}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 px-3 bg-white rounded-xl border border-slate-100">
                                        <span className="text-slate-600 font-medium">Jumlah Project Berbiaya Operasional:</span>
                                        <span className="font-bold text-slate-900 font-sans">{invoiceList.length} Project</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 px-3 bg-white rounded-xl border border-slate-100">
                                        <span className="text-slate-600 font-medium">Catatan Kas Lainnya:</span>
                                        <span className="font-bold text-slate-900 font-sans">{miscTransactionsList.length} Transaksi</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 px-3 bg-white rounded-xl border border-slate-100">
                                        <span className="text-slate-600 font-medium">Pencatatan ke Modul Finance:</span>
                                        <span className="font-bold text-emerald-600 font-sans">✓ Terhubung Otomatis</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Bottom Bar */}
                        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-amber-900">Perhitungan Neraca Bersih:</span>
                                <span className="text-slate-600">
                                    Total Pemasukan ({formatRupiah(totalOmzetPemasukanSemua)}) − Total Pengeluaran ({formatRupiah(totalPengeluaranSemua)}) =
                                </span>
                                <span className="font-black text-slate-900 font-sans bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                                    Laba Bersih {formatRupiah(labaBersihKontrakSemua)} ({labaBersihMarginSemua}%)
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFinancialReportTab('ledger')}
                                className="font-bold text-[#3B46F1] hover:underline inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                            >
                                <span>Lihat Buku Kas Terpadu Transaksi</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Tab 2: Buku Kas Terpadu (Semua Transaksi Masuk & Keluar) */}
                {financialReportTab === 'ledger' && (
                    <div className="p-5 sm:p-6 space-y-4">
                        {/* Filter Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
                                <button
                                    type="button"
                                    onClick={() => setCashflowTypeFilter('all')}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                        cashflowTypeFilter === 'all'
                                            ? 'bg-white text-slate-900 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Semua ({unifiedCashflowItems.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCashflowTypeFilter('inflow')}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                                        cashflowTypeFilter === 'inflow'
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'text-emerald-700 hover:bg-emerald-50'
                                    }`}
                                >
                                    <span>+ Pemasukan</span>
                                    <span className="text-[10px] opacity-80">
                                        ({unifiedCashflowItems.filter((i) => i.type === 'inflow').length})
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCashflowTypeFilter('outflow')}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                                        cashflowTypeFilter === 'outflow'
                                            ? 'bg-rose-600 text-white shadow-xs'
                                            : 'text-rose-700 hover:bg-rose-50'
                                    }`}
                                >
                                    <span>- Pengeluaran</span>
                                    <span className="text-[10px] opacity-80">
                                        ({unifiedCashflowItems.filter((i) => i.type === 'outflow').length})
                                    </span>
                                </button>
                            </div>

                            <span className="text-xs text-slate-400">
                                Menampilkan {filteredCashflowItems.length} transaksi kas masuk &amp; keluar
                            </span>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead className="bg-slate-50">
                                    <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                                        <th className="py-3 px-3">TANGGAL</th>
                                        <th className="py-3 px-3">NO. REF / INVOICE</th>
                                        <th className="py-3 px-3">KATEGORI ARUS KAS</th>
                                        <th className="py-3 px-3">KETERANGAN / PROJECT</th>
                                        <th className="py-3 px-3">METODE KAS / BANK</th>
                                        <th className="py-3 px-3 text-center">ARUS</th>
                                        <th className="py-3 px-3 text-right">NOMINAL</th>
                                        <th className="py-3 px-3 text-center">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-[11px]">
                                    {filteredCashflowItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3 px-3 text-slate-500 font-medium">{item.date}</td>
                                            <td className="py-3 px-3 font-mono font-bold text-slate-900">
                                                {item.link ? (
                                                    <Link href={item.link} className="hover:text-[#3B46F1] transition-colors">
                                                        {item.reference}
                                                    </Link>
                                                ) : (
                                                    item.reference
                                                )}
                                            </td>
                                            <td className="py-3 px-3">
                                                <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                                                    <span>{item.category}</span>
                                                    {item.is_misc && (
                                                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-100 text-slate-500 border border-slate-200 font-normal">
                                                            Kas Lain
                                                        </span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 font-semibold text-slate-900 max-w-xs truncate">
                                                {item.description}
                                            </td>
                                            <td className="py-3 px-3 text-slate-600">{item.payment_method}</td>
                                            <td className="py-3 px-3 text-center">
                                                <span
                                                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                        item.type === 'inflow'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-rose-50 text-rose-700 border-rose-200'
                                                    }`}
                                                >
                                                    {item.type === 'inflow' ? '+ Masuk' : '- Keluar'}
                                                </span>
                                            </td>
                                            <td
                                                className={`py-3 px-3 text-right font-sans font-bold ${
                                                    item.type === 'inflow' ? 'text-emerald-600' : 'text-rose-600'
                                                }`}
                                            >
                                                {item.type === 'inflow' ? '+ ' : '- '}
                                                {formatRupiah(item.amount)}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <span
                                                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.status_color}`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                    {item.is_misc && item.raw_id && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteTransaction(item.raw_id)}
                                                            title="Hapus catatan kas ini"
                                                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab: Transaksi Kas Lain-lain (Pencatatan Pemasukan & Pengeluaran Lainnya) */}
                {financialReportTab === 'misc' && (
                    <div className="p-5 sm:p-6 space-y-5">
                        {/* Top Summary & Action Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70">
                                <span className="text-[11px] font-bold text-emerald-800 block">
                                    Total Pemasukan Kas Lain
                                </span>
                                <span className="text-lg font-black text-emerald-900 font-sans mt-0.5 block">
                                    + {formatRupiah(totalPemasukanLainSemua)}
                                </span>
                                <span className="text-[10px] text-emerald-700">Sewa studio/alat, tips, penjualan cetak ekstra</span>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/70">
                                <span className="text-[11px] font-bold text-rose-800 block">
                                    Total Pengeluaran Kas Lain
                                </span>
                                <span className="text-lg font-black text-rose-900 font-sans mt-0.5 block">
                                    - {formatRupiah(totalPengeluaranLainSemua)}
                                </span>
                                <span className="text-[10px] text-rose-700">Konsumsi, transport, servis, utilitas studio</span>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-xs flex flex-col justify-between">
                                <div>
                                    <span className="text-[11px] font-bold text-slate-300 block">
                                        Selisih Kas Lain-lain
                                    </span>
                                    <span className={`text-lg font-black font-sans mt-0.5 block ${totalPemasukanLainSemua - totalPengeluaranLainSemua >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {formatRupiah(totalPemasukanLainSemua - totalPengeluaranLainSemua)}
                                    </span>
                                </div>
                                <span className="text-[10px] text-slate-400">Total {miscTransactionsList.length} transaksi kas tercatat</span>
                            </div>
                        </div>

                        {/* Filter and Search Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
                                <button
                                    type="button"
                                    onClick={() => setMiscTypeFilter('all')}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                        miscTypeFilter === 'all'
                                            ? 'bg-white text-slate-900 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Semua ({miscTransactionsList.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMiscTypeFilter('income')}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                                        miscTypeFilter === 'income'
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'text-emerald-700 hover:bg-emerald-50'
                                    }`}
                                >
                                    <span>+ Pemasukan</span>
                                    <span className="text-[10px] opacity-80">
                                        ({miscTransactionsList.filter((t: any) => t.type === 'income').length})
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMiscTypeFilter('expense')}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                                        miscTypeFilter === 'expense'
                                            ? 'bg-rose-600 text-white shadow-xs'
                                            : 'text-rose-700 hover:bg-rose-50'
                                    }`}
                                >
                                    <span>- Pengeluaran</span>
                                    <span className="text-[10px] opacity-80">
                                        ({miscTransactionsList.filter((t: any) => t.type === 'expense').length})
                                    </span>
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative w-full sm:w-64">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Cari transaksi / kategori..."
                                        value={miscSearchQuery}
                                        onChange={(e) => setMiscSearchQuery(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                                    />
                                    {miscSearchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setMiscSearchQuery('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setTransactionType('expense');
                                        setTransactionCategory('Konsumsi & Logistik Crew');
                                        setTransactionModalOpen(true);
                                    }}
                                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5"
                                >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    <span>Catat Transaksi</span>
                                </button>
                            </div>
                        </div>

                        {/* Transactions Table */}
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead className="bg-slate-50">
                                    <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                                        <th className="py-3 px-3">TANGGAL</th>
                                        <th className="py-3 px-3">NO. TRANSAKSI</th>
                                        <th className="py-3 px-3">KATEGORI</th>
                                        <th className="py-3 px-3">KETERANGAN</th>
                                        <th className="py-3 px-3">METODE KAS</th>
                                        <th className="py-3 px-3 text-center">TIPE</th>
                                        <th className="py-3 px-3 text-right">NOMINAL</th>
                                        <th className="py-3 px-3">NO. BUKTI</th>
                                        <th className="py-3 px-3 text-center">AKSI</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-[11px]">
                                    {filteredMiscTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="py-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Wallet className="w-8 h-8 text-slate-300" />
                                                    <span className="font-medium text-slate-500">
                                                        Belum ada catatan transaksi kas lainnya.
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setTransactionType('expense');
                                                            setTransactionCategory('Konsumsi & Logistik Crew');
                                                            setTransactionModalOpen(true);
                                                        }}
                                                        className="mt-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                                                    >
                                                        + Tambah Catatan Pertama
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredMiscTransactions.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="py-3 px-3 text-slate-500 font-medium">{item.date_formatted || item.date}</td>
                                                <td className="py-3 px-3 font-mono font-bold text-slate-800">{item.transaction_number}</td>
                                                <td className="py-3 px-3">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                                                        <span>{item.category}</span>
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 font-medium text-slate-900 max-w-xs truncate" title={item.title}>
                                                    <div>{item.title}</div>
                                                    {item.notes && <div className="text-[10px] text-slate-400 truncate">{item.notes}</div>}
                                                </td>
                                                <td className="py-3 px-3 text-slate-600">{item.payment_method}</td>
                                                <td className="py-3 px-3 text-center">
                                                    <span
                                                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                            item.type === 'income'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : 'bg-rose-50 text-rose-700 border-rose-200'
                                                        }`}
                                                    >
                                                        {item.type === 'income' ? '+ Masuk' : '- Keluar'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-right font-sans font-bold">
                                                    <span className={item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}>
                                                        {item.type === 'income' ? '+' : '-'} {formatRupiah(item.amount)}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-slate-400 font-mono text-[10px]">
                                                    {item.reference_number || '-'}
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteTransaction(item.id)}
                                                        title="Hapus catatan ini"
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 3: Rincian Biaya Operasional */}
                {financialReportTab === 'operational' && (
                    <div className="p-5 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">
                                Total Biaya Operasional Project: <span className="font-black text-amber-700 font-sans">{formatRupiah(totalBebanOperasionalSemua)}</span>
                            </span>
                            <span className="text-slate-400">Total {invoiceList.length} project berbiaya operasional</span>
                        </div>
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead className="bg-slate-50">
                                    <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                                        <th className="py-3 px-3">NO. INVOICE</th>
                                        <th className="py-3 px-3">PROJECT</th>
                                        <th className="py-3 px-3">TANGGAL</th>
                                        <th className="py-3 px-3 text-right">TOTAL PROJECT</th>
                                        <th className="py-3 px-3 text-right">BIAYA OPERASIONAL</th>
                                        <th className="py-3 px-3 text-center">AKSI</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-[11px]">
                                    {invoiceList.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3 px-3 font-mono font-bold text-slate-900">{item.invoice_number}</td>
                                            <td className="py-3 px-3 font-semibold text-slate-800">{item.project_name}</td>
                                            <td className="py-3 px-3 text-slate-500">{item.date}</td>
                                            <td className="py-3 px-3 text-right font-sans font-bold text-slate-900">
                                                {formatRupiah(item.total_project)}
                                            </td>
                                            <td className="py-3 px-3 text-right font-sans font-bold text-amber-700 bg-amber-50/30">
                                                {formatRupiah(item.operasional)}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <Link
                                                    href={`/projects/${item.project_id}/invoice`}
                                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:underline"
                                                >
                                                    <span>Lihat Invoice</span>
                                                    <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab 4: Rincian Komisi Referral */}
                {financialReportTab === 'referral' && (
                    <div className="p-5 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">
                                Total Beban Komisi Referral: <span className="font-black text-indigo-700 font-sans">{formatRupiah(totalBebanReferralSemua)}</span>
                            </span>
                            <Link
                                href="/client-sources"
                                className="font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                            >
                                <span>Kelola Sumber Klien &amp; Komisi</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead className="bg-slate-50">
                                    <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                                        <th className="py-3 px-3">TANGGAL</th>
                                        <th className="py-3 px-3">REF KAS KELUAR</th>
                                        <th className="py-3 px-3">SUMBER KLIEN / PENERIMA</th>
                                        <th className="py-3 px-3">BENTUK</th>
                                        <th className="py-3 px-3 text-right">NOMINAL</th>
                                        <th className="py-3 px-3">METODE KAS</th>
                                        <th className="py-3 px-3 text-center">STATUS</th>
                                        <th className="py-3 px-3">CATATAN</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-[11px]">
                                    {referral_expense_items.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-8 text-center text-slate-400">
                                                Belum ada catatan pengeluaran komisi referral.
                                            </td>
                                        </tr>
                                    ) : (
                                        referral_expense_items.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="py-3 px-3 text-slate-500 font-medium">{item.date || '-'}</td>
                                                <td className="py-3 px-3 font-mono font-bold text-indigo-600">{item.reference}</td>
                                                <td className="py-3 px-3 font-bold text-slate-900">{item.source_name}</td>
                                                <td className="py-3 px-3">
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-right font-bold text-slate-900 font-sans">
                                                    {formatRupiah(item.amount)}
                                                </td>
                                                <td className="py-3 px-3 text-slate-600 font-medium">{item.payment_method}</td>
                                                <td className="py-3 px-3 text-center">
                                                    <span
                                                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                            item.status === 'given'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}
                                                    >
                                                        {item.status === 'given' ? '✓ Diberikan' : '⏳ Pending'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-slate-500 max-w-[200px] truncate">{item.notes || '-'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ── MODAL SEMUA INVOICE ────────────────────────────────────────── */}
            <Modal
                isOpen={allInvoicesModalOpen}
                onClose={() => setAllInvoicesModalOpen(false)}
                title="Daftar Lengkap Invoice"
                subtitle="Semua invoice project yang tercatat dalam sistem keuangan."
                maxWidth="5xl"
            >
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={invoiceSearchQuery}
                                onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                                placeholder="Cari nomor invoice, nama project, atau klien..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
                            />
                        </div>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2.5 rounded-xl shrink-0">
                            {filteredInvoices.length} Invoice
                        </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white max-h-[60vh]">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="sticky top-0 bg-slate-50 z-10">
                                <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                                    <th className="py-3 px-3">NO. INV</th>
                                    <th className="py-3 px-3">PROJECT</th>
                                    <th className="py-3 px-3">TANGGAL</th>
                                    <th className="py-3 px-3 text-right">TOTAL</th>
                                    <th className="py-3 px-3 text-right">DITERIMA</th>
                                    <th className="py-3 px-3 text-right">SISA</th>
                                    <th className="py-3 px-3 text-center">STATUS</th>
                                    <th className="py-3 px-3 text-center">AKSI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-[11px]">
                                {filteredInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-8 text-center text-slate-400">
                                            Tidak ditemukan invoice yang cocok dengan pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredInvoices.map((inv: any) => (
                                        <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3 px-3 font-mono font-bold text-slate-900">
                                                <div className="flex items-center gap-1.5">
                                                    <span>{inv.invoice_number}</span>
                                                    {inv.is_dp && (
                                                        <span className="px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[9px] font-bold rounded">
                                                            DP
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 font-semibold text-slate-800 max-w-[200px] truncate">
                                                <div>{inv.project_name}</div>
                                                {inv.client_name && inv.client_name !== '-' && (
                                                    <div className="text-[10px] text-slate-400 font-normal">
                                                        Klien: {inv.client_name}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 text-slate-500 font-medium">
                                                {inv.date}
                                            </td>
                                            <td className="py-3 px-3 text-right font-bold text-slate-900 font-sans">
                                                {formatRupiah(inv.total_project)}
                                            </td>
                                            <td className="py-3 px-3 text-right font-semibold text-emerald-600 font-sans">
                                                {formatRupiah(inv.sudah_diterima)}
                                            </td>
                                            <td className="py-3 px-3 text-right font-semibold text-rose-600 font-sans">
                                                {formatRupiah(inv.sisa)}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <span
                                                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${inv.status_color}`}
                                                >
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <Link
                                                    href={`/projects/${inv.project_id}/invoice`}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[10px] transition-colors"
                                                >
                                                    <span>Lihat Invoice</span>
                                                    <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setAllInvoicesModalOpen(false)}
                            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── MODAL RINCIAN BIAYA PENGELUARAN ─────────────────────────── */}
            <Modal
                isOpen={expenseModalOpen}
                onClose={() => setExpenseModalOpen(false)}
                title="Rincian Beban & Biaya Pengeluaran"
                subtitle="Buku kas pengeluaran operasional studio dan komisi referral."
                maxWidth="5xl"
            >
                <div className="space-y-4">
                    {/* 3 Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70">
                            <span className="text-[11px] font-bold text-amber-800 block">
                                Biaya Operasional Project
                            </span>
                            <span className="text-lg font-black text-amber-900 font-sans mt-0.5 block">
                                {formatRupiah(totalBebanOperasionalSemua)}
                            </span>
                            <span className="text-[10px] text-amber-700">Akomodasi, transport & produksi</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/70">
                            <span className="text-[11px] font-bold text-indigo-800 block">
                                Beban Komisi & Apresiasi Referral
                            </span>
                            <span className="text-lg font-black text-indigo-900 font-sans mt-0.5 block">
                                {formatRupiah(totalBebanReferralSemua)}
                            </span>
                            <span className="text-[10px] text-indigo-700">Tercatat ke buku kas studio</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-xs">
                            <span className="text-[11px] font-bold text-slate-300 block">
                                Total Seluruh Pengeluaran
                            </span>
                            <span className="text-lg font-black text-[#C89445] font-sans mt-0.5 block">
                                {formatRupiah(totalPengeluaranSemua)}
                            </span>
                            <span className="text-[10px] text-slate-400">Akumulasi pengeluaran studio</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 border-b border-slate-200 pt-1">
                        <button
                            type="button"
                            onClick={() => setExpenseTab('referral')}
                            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                                expenseTab === 'referral'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Gift className="w-3.5 h-3.5" />
                            <span>Komisi & Apresiasi Referral ({referral_expense_items.length})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setExpenseTab('operational')}
                            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                                expenseTab === 'operational'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>Biaya Operasional Project ({invoiceList.length})</span>
                        </button>
                    </div>

                    {/* Tab 1: Referral Expense Content */}
                    {expenseTab === 'referral' && (
                        <div className="space-y-3">
                            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white max-h-[50vh]">
                                <table className="w-full text-left text-xs whitespace-nowrap">
                                    <thead className="sticky top-0 bg-slate-50 z-10">
                                        <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                                            <th className="py-2.5 px-3">TANGGAL</th>
                                            <th className="py-2.5 px-3">REF KAS</th>
                                            <th className="py-2.5 px-3">SUMBER KLIEN / PENERIMA</th>
                                            <th className="py-2.5 px-3">BENTUK</th>
                                            <th className="py-2.5 px-3 text-right">NOMINAL</th>
                                            <th className="py-2.5 px-3">METODE KAS</th>
                                            <th className="py-2.5 px-3 text-center">STATUS</th>
                                            <th className="py-2.5 px-3">CATATAN</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-[11px]">
                                        {referral_expense_items.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="py-8 text-center text-slate-400">
                                                    Belum ada catatan pengeluaran komisi referral.
                                                </td>
                                            </tr>
                                        ) : (
                                            referral_expense_items.map((item: any) => (
                                                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                                    <td className="py-2.5 px-3 text-slate-500 font-medium">
                                                        {item.date || '-'}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">
                                                        {item.reference}
                                                    </td>
                                                    <td className="py-2.5 px-3 font-bold text-slate-900">
                                                        {item.source_name}
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                                                            {item.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-sans">
                                                        {formatRupiah(item.amount)}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                                                        {item.payment_method}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center">
                                                        <span
                                                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                                item.status === 'given'
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                                            }`}
                                                        >
                                                            {item.status === 'given' ? '✓ Diberikan' : '⏳ Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-slate-500 max-w-[200px] truncate">
                                                        {item.notes || '-'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                                <span>Menampilkan data pengeluaran apresiasi yang disinkronkan ke Finance.</span>
                                <Link
                                    href="/client-sources"
                                    className="font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                                >
                                    <span>Kelola Sumber Klien</span>
                                    <ExternalLink className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Operational Expense Content */}
                    {expenseTab === 'operational' && (
                        <div className="space-y-3">
                            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white max-h-[50vh]">
                                <table className="w-full text-left text-xs whitespace-nowrap">
                                    <thead className="sticky top-0 bg-slate-50 z-10">
                                        <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                                            <th className="py-2.5 px-3">NO. INV</th>
                                            <th className="py-2.5 px-3">PROJECT</th>
                                            <th className="py-2.5 px-3">TANGGAL</th>
                                            <th className="py-2.5 px-3 text-right">TOTAL PROJECT</th>
                                            <th className="py-2.5 px-3 text-right">BIAYA OPERASIONAL</th>
                                            <th className="py-2.5 px-3 text-center">AKSI</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-[11px]">
                                        {invoiceList.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                                                    {item.invoice_number}
                                                </td>
                                                <td className="py-2.5 px-3 font-semibold text-slate-800">
                                                    {item.project_name}
                                                </td>
                                                <td className="py-2.5 px-3 text-slate-500">{item.date}</td>
                                                <td className="py-2.5 px-3 text-right font-sans font-bold text-slate-900">
                                                    {formatRupiah(item.total_project)}
                                                </td>
                                                <td className="py-2.5 px-3 text-right font-sans font-bold text-amber-700 bg-amber-50/30">
                                                    {formatRupiah(item.operasional)}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <Link
                                                        href={`/projects/${item.project_id}/invoice`}
                                                        className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:underline"
                                                    >
                                                        <span>Detail</span>
                                                        <ExternalLink className="w-3 h-3" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setExpenseModalOpen(false)}
                            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ── 5. MODAL: CATAT TRANSAKSI KAS (PEMASUKAN & PENGELUARAN LAINNYA) ─── */}
            <Modal
                isOpen={transactionModalOpen}
                onClose={() => !isSubmittingTransaction && setTransactionModalOpen(false)}
                title={<span className="font-bold text-slate-900 text-sm">Catat Transaksi Kas Studio</span>}
                subtitle="Pencatatan arus kas internal studio di luar invoice kontrak (konsumsi, bensin, servis alat, sewa studio, dll)."
                icon={
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                    </div>
                }
                maxWidth="xl"
                footer={
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                                    transactionType === 'income'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                            >
                                <span>{transactionType === 'income' ? '+ Kas Masuk' : '- Kas Keluar'}</span>
                                {Number(transactionAmount) > 0 && (
                                    <span className="font-mono font-black">
                                        : {formatRupiah(Number(transactionAmount))}
                                    </span>
                                )}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={isSubmittingTransaction}
                                onClick={() => setTransactionModalOpen(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/80 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                form="finance-transaction-form"
                                disabled={isSubmittingTransaction}
                                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                                    transactionType === 'income'
                                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                                        : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                                }`}
                            >
                                {isSubmittingTransaction ? (
                                    <span>Menyimpan...</span>
                                ) : (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>
                                            Simpan {transactionType === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                }
            >
                <form id="finance-transaction-form" onSubmit={handleSaveTransaction} className="space-y-3.5">
                    {/* Segmented Type Toggle */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                            Jenis Transaksi Kas <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
                            <button
                                type="button"
                                onClick={() => {
                                    setTransactionType('income');
                                    if (EXPENSE_PRESETS.includes(transactionCategory)) {
                                        setTransactionCategory(INCOME_PRESETS[0]);
                                    }
                                }}
                                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                    transactionType === 'income'
                                        ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                                }`}
                            >
                                <div
                                    className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                                        transactionType === 'income'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-slate-200 text-slate-500'
                                    }`}
                                >
                                    <ArrowDownLeft className="w-3 h-3" />
                                </div>
                                <span>+ Kas Masuk (Pemasukan)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setTransactionType('expense');
                                    if (INCOME_PRESETS.includes(transactionCategory)) {
                                        setTransactionCategory(EXPENSE_PRESETS[0]);
                                    }
                                }}
                                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                    transactionType === 'expense'
                                        ? 'bg-white text-rose-700 shadow-xs border border-rose-200'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                                }`}
                            >
                                <div
                                    className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                                        transactionType === 'expense'
                                            ? 'bg-rose-100 text-rose-700'
                                            : 'bg-slate-200 text-slate-500'
                                    }`}
                                >
                                    <ArrowUpRight className="w-3 h-3" />
                                </div>
                                <span>- Kas Keluar (Pengeluaran)</span>
                            </button>
                        </div>
                    </div>

                    {/* Kategori Transaksi: Preset Chips + Input */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-bold text-slate-700">
                                Kategori Transaksi <span className="text-rose-500">*</span>
                            </label>
                            <span className="text-[10px] text-slate-400">Pilih rekomendasi atau ketik bebas</span>
                        </div>

                        {/* Preset quick chips */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                            {(transactionType === 'income' ? INCOME_PRESETS : EXPENSE_PRESETS).map((cat) => {
                                const isSelected = transactionCategory === cat;
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setTransactionCategory(cat)}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                            isSelected
                                                ? transactionType === 'income'
                                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                                    : 'bg-rose-600 text-white shadow-2xs'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                                        }`}
                                    >
                                        {isSelected && <Check className="w-3 h-3" />}
                                        <span>{cat}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Input custom category */}
                        <div className="relative">
                            <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={transactionCategory}
                                onChange={(e) => setTransactionCategory(e.target.value)}
                                placeholder="Ketik kategori kustom jika tidak ada di atas..."
                                className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400"
                                required
                            />
                        </div>
                    </div>

                    {/* Judul / Uraian Transaksi */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Keterangan Transaksi <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={transactionTitle}
                            onChange={(e) => setTransactionTitle(e.target.value)}
                            placeholder={
                                transactionType === 'income'
                                    ? 'Misal: Sewa lighting godox 3 set oleh Studio X'
                                    : 'Misal: Makan siang & kopi crew 5 orang photoshoot wedding'
                            }
                            className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 font-medium placeholder:text-slate-400 transition-all"
                            required
                        />
                    </div>

                    {/* Grid: Nominal & Tanggal */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-bold text-slate-700">
                                    Nominal Transaksi (Rp) <span className="text-rose-500">*</span>
                                </label>
                                {Number(transactionAmount) > 0 && (
                                    <span className="text-[10px] text-emerald-600 font-bold font-sans">
                                        {formatRupiah(Number(transactionAmount))}
                                    </span>
                                )}
                            </div>
                            <div className="relative">
                                <span className="text-xs font-bold text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none font-sans">
                                    Rp
                                </span>
                                <input
                                    type="number"
                                    min="1"
                                    step="1000"
                                    value={transactionAmount}
                                    onChange={(e) => setTransactionAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full pl-9 pr-3 py-2 text-xs font-sans font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                Tanggal Transaksi <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={transactionDate}
                                onChange={(e) => setTransactionDate(e.target.value)}
                                className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 font-medium"
                                required
                            />
                        </div>
                    </div>

                    {/* Grid: Akun Kas / Rekening & No. Bukti */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                Akun Kas / Rekening Pembayaran
                            </label>
                            <select
                                value={transactionPaymentMethodId}
                                onChange={(e) => setTransactionPaymentMethodId(e.target.value)}
                                className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 font-medium cursor-pointer"
                            >
                                <option value="">-- Kas Tunai Studio (Default) --</option>
                                {payment_methods &&
                                    payment_methods.map((pm: any) => (
                                        <option key={pm.id} value={pm.id}>
                                            {pm.name} {pm.account_number ? `(${pm.account_number})` : ''}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                No. Bukti / Struk / Kwitansi (Opsional)
                            </label>
                            <input
                                type="text"
                                value={transactionReference}
                                onChange={(e) => setTransactionReference(e.target.value)}
                                placeholder="Misal: STR-2026/09/001"
                                className="w-full px-3 py-2 text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Catatan Tambahan */}
                    <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Catatan Tambahan (Opsional)
                        </label>
                        <input
                            type="text"
                            value={transactionNotes}
                            onChange={(e) => setTransactionNotes(e.target.value)}
                            placeholder="Catatan tambahan memo internal studio..."
                            className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 placeholder:text-slate-400"
                        />
                    </div>
                </form>
            </Modal>
        </div>
    );
}
