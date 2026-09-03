import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Pagination } from '@/components/ui/pagination';
import {
    Wallet,
    CheckCircle2,
    MinusCircle,
    FolderKanban,
    Plus,
    Search,
    Download,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    X,
    Building2,
    Smartphone,
    Banknote,
    CreditCard,
} from 'lucide-react';

interface PaymentMethodItem {
    id: number | string;
    name: string;
    code?: string;
    type?: string;
    description?: string;
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    account_holder?: string;
    status?: string;
    used_in_invoice?: number;
    payments_count?: number;
}

interface Stats {
    total?: number;
    active?: number;
    inactive?: number;
    used_in_invoices?: number;
}

interface PaymentMethodsIndexProps {
    paymentMethods?: {
        data: PaymentMethodItem[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        per_page?: number;
    };
    payment_methods?: {
        data: PaymentMethodItem[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        per_page?: number;
    };
    stats?: Stats;
    filters?: {
        search?: string;
        per_page?: number;
    };
}

// Brand / Channel Badges
function MethodLogo({ name, type }: { name: string; type?: string }) {
    const lower = name.toLowerCase();

    if (lower.includes('bca')) {
        return (
            <div className="w-8 h-8 rounded-xl bg-[#0060AF]/10 border border-[#0060AF]/20 flex items-center justify-center text-[#0060AF] font-black text-xs shrink-0">
                <Building2 className="w-4 h-4" />
            </div>
        );
    }
    if (lower.includes('bri')) {
        return (
            <div className="w-8 h-8 rounded-xl bg-[#00529C] text-white font-black text-[10px] flex items-center justify-center shrink-0 tracking-tight">
                BRI
            </div>
        );
    }
    if (lower.includes('mandiri')) {
        return (
            <div className="w-8 h-8 rounded-xl bg-[#003d79] text-[#F39C12] font-black text-[9px] flex items-center justify-center shrink-0 tracking-tight">
                MND
            </div>
        );
    }
    if (lower.includes('ovo')) {
        return (
            <div className="w-8 h-8 rounded-xl bg-[#4C3494] text-white font-black text-[10px] flex items-center justify-center shrink-0">
                OVO
            </div>
        );
    }
    if (lower.includes('dana')) {
        return (
            <div className="w-8 h-8 rounded-xl bg-[#118EEA] text-white font-black text-[9px] flex items-center justify-center shrink-0">
                DANA
            </div>
        );
    }
    if (lower.includes('shopee')) {
        return (
            <div className="w-8 h-8 rounded-xl bg-[#EE4D2D] text-white font-black text-[8px] flex items-center justify-center shrink-0">
                Shopee
            </div>
        );
    }
    if (lower.includes('tunai') || lower.includes('cash')) {
        return (
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                <Banknote className="w-4 h-4" />
            </div>
        );
    }
    return (
        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-4 h-4" />
        </div>
    );
}

export default function PaymentMethodsIndex({
    paymentMethods,
    payment_methods,
    stats = { total: 7, active: 6, inactive: 1, used_in_invoices: 156 },
    filters = {},
}: PaymentMethodsIndexProps) {
    const rawPaginated = paymentMethods || payment_methods || { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0 };
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState('all');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<PaymentMethodItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [form, setForm] = useState({
        name: '',
        code: '',
        bank_name: '',
        account_number: '',
        account_holder: 'Arams Pictures',
        description: '',
        status: 'active',
    });

    // Demo data matching Screenshot 5
    const demoMethods: PaymentMethodItem[] = useMemo(() => [
        {
            id: 1,
            name: 'Transfer Bank BCA',
            type: 'bank',
            bank_name: 'BCA',
            account_number: '1234567890',
            account_holder: 'Arams Pictures',
            description: 'Pembayaran melalui transfer ke rekening BCA a.n Arams Pictures',
            status: 'active',
            used_in_invoice: 68,
        },
        {
            id: 2,
            name: 'Transfer Bank BRI',
            type: 'bank',
            bank_name: 'BRI',
            account_number: '0987654321',
            account_holder: 'Arams Pictures',
            description: 'Pembayaran melalui transfer ke rekening BRI a.n Arams Pictures',
            status: 'active',
            used_in_invoice: 42,
        },
        {
            id: 3,
            name: 'Transfer Bank Mandiri',
            type: 'bank',
            bank_name: 'Mandiri',
            account_number: '1122334455',
            account_holder: 'Arams Pictures',
            description: 'Pembayaran melalui transfer ke rekening Mandiri a.n Arams Pictures',
            status: 'active',
            used_in_invoice: 31,
        },
        {
            id: 4,
            name: 'OVO',
            type: 'ewallet',
            account_number: '0812 3456 7890',
            account_holder: 'Arams Pictures',
            description: 'Pembayaran melalui e-wallet OVO',
            status: 'active',
            used_in_invoice: 8,
        },
        {
            id: 5,
            name: 'DANA',
            type: 'ewallet',
            account_number: '0812 3456 7890',
            account_holder: 'Arams Pictures',
            description: 'Pembayaran melalui e-wallet DANA',
            status: 'active',
            used_in_invoice: 5,
        },
        {
            id: 6,
            name: 'ShopeePay',
            type: 'ewallet',
            account_number: '0812 3456 7890',
            account_holder: 'Arams Pictures',
            description: 'Pembayaran melalui e-wallet ShopeePay',
            status: 'active',
            used_in_invoice: 2,
        },
        {
            id: 7,
            name: 'Tunai',
            type: 'cash',
            description: 'Pembayaran secara tunai / cash',
            status: 'inactive',
            used_in_invoice: 0,
        },
    ], []);

    const rawData = rawPaginated.data && rawPaginated.data.length > 0 ? rawPaginated.data : demoMethods;

    const filteredData = useMemo(() => {
        return rawData.filter((item) => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchName = item.name.toLowerCase().includes(q);
                const matchDesc = (item.description || '').toLowerCase().includes(q);
                const matchAcc = (item.account_number || '').toLowerCase().includes(q);
                if (!matchName && !matchDesc && !matchAcc) return false;
            }
            if (statusFilter !== 'all') {
                if (statusFilter === 'active' && item.status !== 'active') return false;
                if (statusFilter === 'inactive' && item.status === 'active') return false;
            }
            return true;
        });
    }, [rawData, searchQuery, statusFilter]);

    const handleOpenCreate = () => {
        setEditItem(null);
        setForm({
            name: '',
            code: '',
            bank_name: '',
            account_number: '',
            account_holder: 'Arams Pictures',
            description: '',
            status: 'active',
        });
        setModalOpen(true);
    };

    const handleOpenEdit = (item: PaymentMethodItem) => {
        setEditItem(item);
        setForm({
            name: item.name,
            code: item.code || '',
            bank_name: item.bank_name || '',
            account_number: item.account_number || '',
            account_holder: item.account_holder || item.account_name || 'Arams Pictures',
            description: item.description || '',
            status: item.status || 'active',
        });
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (editItem) {
            router.put(`/master-data/payment-methods/${editItem.id}`, form, {
                onSuccess: () => {
                    setModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: () => setIsSubmitting(false),
            });
        } else {
            router.post('/master-data/payment-methods', form, {
                onSuccess: () => {
                    setModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: () => setIsSubmitting(false),
            });
        }
    };

    const applyFilters = (newParams: Record<string, any> = {}) => {
        router.get(
            '/master-data/payment-methods',
            {
                search: newParams.search !== undefined ? newParams.search : searchQuery || undefined,
                per_page: newParams.per_page !== undefined ? newParams.per_page : perPage,
                page: newParams.page || 1,
            },
            { preserveState: true }
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search: searchQuery, page: 1 });
    };

    const handlePageChange = (newPage: number) => {
        applyFilters({ page: newPage });
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        applyFilters({ per_page: newPerPage, page: 1 });
    };

    const handleDelete = (id: number | string) => {
        if (confirm('Yakin ingin menghapus metode pembayaran ini?')) {
            router.delete(`/master-data/payment-methods/${id}`);
        }
    };

    // Export CSV
    const handleExport = () => {
        const rows = [
            ['No', 'Nama Metode', 'Deskripsi', 'Detail', 'Status', 'Digunakan di Invoice'],
            ...filteredData.map((pm, i) => [
                i + 1,
                pm.name,
                pm.description || '-',
                pm.account_number ? `${pm.account_number} (${pm.account_holder || 'Arams Pictures'})` : '-',
                pm.status === 'active' ? 'Aktif' : 'Nonaktif',
                `${pm.used_in_invoice || pm.payments_count || 0} Invoice`,
            ]),
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Metode_Pembayaran_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full max-w-full space-y-6 pb-20">
            <Head title="Metode Pembayaran - Master Data" />

            {/* ── 1. BREADCRUMB & HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Link href="/master-data/payment-methods" className="hover:text-primary-accent transition-colors">
                            Master Data
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-primary-accent font-semibold">Metode Pembayaran</span>
                    </nav>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Metode Pembayaran</h1>
                    <p className="text-xs text-slate-500">
                        Kelola metode pembayaran yang tersedia untuk transaksi invoice dan pembayaran project.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Metode Pembayaran
                </button>
            </div>

            {/* ── 2. TOP 4 STAT CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Metode Pembayaran */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
                        <Wallet className="w-6 h-6 text-[#4F46E5]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Total Metode Pembayaran</span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                            {stats.total || 7}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Semua metode</p>
                    </div>
                </div>

                {/* Card 2: Metode Aktif */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Metode Aktif</span>
                        <h2 className="text-2xl font-black text-[#059669] tracking-tight font-sans">
                            {stats.active || 6}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Sedang digunakan</p>
                    </div>
                </div>

                {/* Card 3: Metode Nonaktif */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] flex items-center justify-center shrink-0">
                        <MinusCircle className="w-6 h-6 text-[#EF4444]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Metode Nonaktif</span>
                        <h2 className="text-2xl font-black text-[#DC2626] tracking-tight font-sans">
                            {stats.inactive ?? 1}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Tidak digunakan</p>
                    </div>
                </div>

                {/* Card 4: Digunakan di Invoice */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] flex items-center justify-center shrink-0">
                        <FolderKanban className="w-6 h-6 text-[#D97706]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Digunakan di Invoice</span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                            {stats.used_in_invoices || 156}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Total penggunaan</p>
                    </div>
                </div>
            </div>

            {/* ── 3. TABLE CARD CONTAINER ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                        {/* Search Input */}
                        <div className="relative min-w-[240px] max-w-sm flex-1">
                            <input
                                type="text"
                                placeholder="Cari metode pembayaran..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-3.5 pr-9 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* Status Filter */}
                        <div className="relative min-w-[140px]">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                            >
                                <option value="all">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleExport}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50/70 transition-all cursor-pointer shadow-2xs"
                    >
                        <Download className="w-3.5 h-3.5 text-indigo-600" />
                        Export
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/40 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="py-3 px-4 w-12">NO</th>
                                <th className="py-3 px-4">NAMA METODE</th>
                                <th className="py-3 px-4">DESKRIPSI</th>
                                <th className="py-3 px-4">DETAIL METODE</th>
                                <th className="py-3 px-4 text-center">STATUS</th>
                                <th className="py-3 px-4 text-center">DIGUNAKAN DI INVOICE</th>
                                <th className="py-3 px-4 text-center">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.length > 0 ? (
                                filteredData.map((pm, idx) => {
                                    const isActive = pm.status === 'active';
                                    const isBank = (pm.type === 'bank' || pm.name.toLowerCase().includes('bank'));
                                    const isEwallet = (pm.type === 'ewallet' || pm.name.toLowerCase().includes('ovo') || pm.name.toLowerCase().includes('dana') || pm.name.toLowerCase().includes('shopee'));
                                    const isCash = (pm.type === 'cash' || pm.name.toLowerCase().includes('tunai'));

                                    return (
                                        <tr key={pm.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-slate-400">
                                                {idx + 1}
                                            </td>

                                            {/* Nama Metode + Logo */}
                                            <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                                                <div className="flex items-center gap-2.5">
                                                    <MethodLogo name={pm.name} type={pm.type} />
                                                    <span>{pm.name}</span>
                                                </div>
                                            </td>

                                            {/* Deskripsi */}
                                            <td className="py-3.5 px-4 text-slate-600 font-medium max-w-xs">
                                                {pm.description || '-'}
                                            </td>

                                            {/* Detail Metode */}
                                            <td className="py-3.5 px-4 text-[11px] text-slate-700 whitespace-nowrap">
                                                {isBank && pm.account_number ? (
                                                    <div className="space-y-0.5">
                                                        <div className="flex gap-2">
                                                            <span className="text-slate-500 w-20">Bank</span>
                                                            <span className="font-semibold">: {pm.bank_name || pm.name.replace('Transfer Bank ', '')}</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <span className="text-slate-500 w-20">No. Rekening</span>
                                                            <span className="font-semibold font-mono">: {pm.account_number}</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <span className="text-slate-500 w-20">Atas Nama</span>
                                                            <span className="font-semibold">: {pm.account_holder || pm.account_name || 'Arams Pictures'}</span>
                                                        </div>
                                                    </div>
                                                ) : isEwallet && pm.account_number ? (
                                                    <div className="space-y-0.5">
                                                        <div className="flex gap-2">
                                                            <span className="text-slate-500 w-16">No. HP</span>
                                                            <span className="font-semibold font-mono">: {pm.account_number}</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <span className="text-slate-500 w-16">Atas Nama</span>
                                                            <span className="font-semibold">: {pm.account_holder || pm.account_name || 'Arams Pictures'}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                {isActive ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-emerald-100">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-rose-100">
                                                        Nonaktif
                                                    </span>
                                                )}
                                            </td>

                                            {/* Digunakan di Invoice */}
                                            <td className="py-3.5 px-4 text-center font-bold text-slate-800 whitespace-nowrap">
                                                {pm.used_in_invoice ?? pm.payments_count ?? 0} Invoice
                                            </td>

                                            {/* Aksi */}
                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(pm)}
                                                        className="w-8 h-8 rounded-lg border border-slate-200 hover:border-indigo-300 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-colors cursor-pointer"
                                                        title="Edit Metode"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(pm.id)}
                                                        className="w-8 h-8 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
                                                        title="Hapus Metode"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400">
                                        <Wallet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-xs font-semibold text-slate-600">Tidak ada metode pembayaran yang sesuai.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={rawPaginated.current_page || 1}
                    lastPage={rawPaginated.last_page || 1}
                    total={rawPaginated.total || filteredData.length}
                    from={rawPaginated.from}
                    to={rawPaginated.to}
                    perPage={perPage}
                    itemLabel="metode pembayaran"
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
            </div>

            {/* ── 4. MODAL: TAMBAH / EDIT METODE PEMBAYARAN ── */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-base font-black text-slate-900">
                                {editItem ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}
                            </h3>
                            <button type="button" onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Nama Metode Pembayaran <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Contoh: Transfer Bank BCA, OVO, DANA, dll"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Nama Bank / Channel</label>
                                    <input
                                        type="text"
                                        value={form.bank_name}
                                        onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                                        placeholder="BCA, BRI, Mandiri, dll"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">No. Rekening / No. HP</label>
                                    <input
                                        type="text"
                                        value={form.account_number}
                                        onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                                        placeholder="1234567890"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Atas Nama</label>
                                    <input
                                        type="text"
                                        value={form.account_holder}
                                        onChange={(e) => setForm({ ...form, account_holder: e.target.value })}
                                        placeholder="Arams Pictures"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                    >
                                        <option value="active">Aktif</option>
                                        <option value="inactive">Nonaktif</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Deskripsi</label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Petunjuk atau deskripsi metode pembayaran..."
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Metode'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
