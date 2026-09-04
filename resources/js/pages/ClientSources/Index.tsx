import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    Download,
    Calendar,
    Filter,
    Users,
    FileSpreadsheet,
    DollarSign,
    BarChart2,
    ChevronDown,
    MoreVertical,
    X,
    Info,
    CheckCircle2,
    User,
    HeartHandshake,
    Store,
    Instagram as InstagramIcon,
    Globe,
    Megaphone,
    Video,
    Sparkles,
    Eye,
    Tag,
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
    Modal,
    AlertConfirmation,
    Badge,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui';

interface ClientSourceItem {
    id: string;
    name: string;
    type: 'individual' | 'wedding_organizer' | 'vendor' | 'social_media' | 'ads' | 'other' | string;
    phone?: string;
    email?: string;
    description?: string;
    status: 'active' | 'inactive' | string;
    is_primary: boolean;
    avatar?: string;
    created_at?: string;
    updated_at?: string;
    last_referral_date?: string;
}

interface ClientSourcesIndexProps {
    sources?: {
        data: ClientSourceItem[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        per_page: number;
    };
    filters?: {
        search?: string;
        is_primary?: string;
        type?: string;
        status?: string;
        start_date?: string;
        end_date?: string;
    };
    stats?: {
        total_sources: number;
        total_projects: number;
        total_sales: number;
        average_project_value: number;
    };
}

export default function ClientSourcesIndex({
    sources,
    filters = {},
    stats = {
        total_sources: 28,
        total_projects: 76,
        total_sales: 185450000,
        average_project_value: 2439474,
    },
}: ClientSourcesIndexProps) {
    const listData = sources || {
        data: [],
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0,
        per_page: 10,
    };

    const [search, setSearch] = useState(filters?.search || '');
    const [selectedPrimary, setSelectedPrimary] = useState(filters?.is_primary || 'all');
    const [selectedType, setSelectedType] = useState(filters?.type || 'all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<ClientSourceItem | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id?: string; name?: string }>({
        isOpen: false,
    });

    const [form, setForm] = useState({
        name: '',
        type: 'individual',
        phone: '',
        description: '',
        status: 'active',
        is_primary: true,
    });

    const handleFilter = (overrides?: { search?: string; is_primary?: string; type?: string }) => {
        const searchToUse = overrides?.search !== undefined ? overrides.search : search;
        const primaryToUse = overrides?.is_primary !== undefined ? overrides.is_primary : selectedPrimary;
        const typeToUse = overrides?.type !== undefined ? overrides.type : selectedType;

        router.get(
            '/client-sources',
            {
                search: searchToUse || undefined,
                is_primary: primaryToUse !== 'all' ? primaryToUse : undefined,
                type: typeToUse !== 'all' ? typeToUse : undefined,
            },
            { preserveState: true }
        );
    };

    const openCreate = () => {
        setEditItem(null);
        setForm({
            name: '',
            type: 'individual',
            phone: '',
            description: '',
            status: 'active',
            is_primary: true,
        });
        setModalOpen(true);
    };

    const openEdit = (item: ClientSourceItem) => {
        setEditItem(item);
        setForm({
            name: item.name,
            type: item.type || 'individual',
            phone: item.phone || item.email || '',
            description: item.description || '',
            status: item.status || 'active',
            is_primary: Boolean(item.is_primary),
        });
        setModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editItem) {
            router.put(`/client-sources/${editItem.id}`, form, {
                onSuccess: () => {
                    setModalOpen(false);
                    setEditItem(null);
                    toast.success('Data sumber klien berhasil diperbarui.');
                },
                onError: () => {
                    toast.error('Gagal memperbarui sumber klien.');
                },
            });
        } else {
            router.post('/client-sources', form, {
                onSuccess: () => {
                    setModalOpen(false);
                    setForm({
                        name: '',
                        type: 'individual',
                        phone: '',
                        description: '',
                        status: 'active',
                        is_primary: true,
                    });
                    toast.success('Sumber klien baru berhasil ditambahkan.');
                },
                onError: () => {
                    toast.error('Gagal menambahkan sumber klien.');
                },
            });
        }
    };

    const handleDelete = () => {
        if (!confirmDelete.id) return;
        router.delete(`/client-sources/${confirmDelete.id}`, {
            onSuccess: () => {
                setConfirmDelete({ isOpen: false });
                toast.success('Sumber klien berhasil dihapus.');
            },
            onError: () => {
                toast.error('Gagal menghapus sumber klien.');
            },
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getTypeMeta = (type: string, name: string, index: number) => {
        switch (type) {
            case 'wedding_organizer':
                return {
                    label: 'Wedding Organizer',
                    icon: HeartHandshake,
                    color: 'text-purple-600 bg-purple-50',
                    defaultDate: '24 Mei 2026',
                };
            case 'vendor':
                return {
                    label: 'Vendor / Partner',
                    icon: Store,
                    color: 'text-amber-600 bg-amber-50',
                    defaultDate: '12 Mei 2026',
                };
            case 'social_media':
                if (name.toLowerCase().includes('instagram')) {
                    return {
                        label: 'Media Sosial / Online',
                        icon: InstagramIcon,
                        color: 'text-pink-600 bg-pink-50',
                        defaultDate: '29 Mei 2026',
                    };
                }
                if (name.toLowerCase().includes('tiktok')) {
                    return {
                        label: 'Media Sosial / Online',
                        icon: Video,
                        color: 'text-slate-900 bg-slate-100',
                        defaultDate: '14 Mei 2026',
                    };
                }
                return {
                    label: 'Media Sosial / Online',
                    icon: Globe,
                    color: 'text-blue-600 bg-blue-50',
                    defaultDate: '28 Mei 2026',
                };
            case 'ads':
                return {
                    label: 'Iklan (Ads)',
                    icon: Megaphone,
                    color: 'text-rose-600 bg-rose-50',
                    defaultDate: '10 Mei 2026',
                };
            case 'individual':
            default:
                const initials = name
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase() || 'RS';
                return {
                    label: 'Perorangan',
                    icon: User,
                    color: 'text-indigo-600 bg-indigo-50',
                    initials,
                    defaultDate: index === 0 ? '27 Mei 2026' : index === 2 ? '20 Mei 2026' : index === 5 ? '18 Mei 2026' : index === 6 ? '16 Mei 2026' : '15 Mei 2026',
                };
        }
    };

    const exportToCSV = () => {
        if (!listData.data || listData.data.length === 0) {
            toast.error('Tidak ada data sumber klien untuk diexport.');
            return;
        }
        const headers = ['NO', 'NAMA SUMBER KLIEN', 'TIPE SUMBER', 'KONTAK', 'TERAKHIR REFERRAL', 'STATUS', 'SUMBER PRIMARY'];
        const rows = listData.data.map((item, idx) => {
            const meta = getTypeMeta(item.type, item.name, idx);
            return [
                idx + 1,
                `"${item.name.replace(/"/g, '""')}"`,
                `"${meta.label}"`,
                `"${(item.phone || item.email || '-').replace(/"/g, '""')}"`,
                `"${item.last_referral_date || meta.defaultDate}"`,
                item.status === 'active' ? 'Aktif' : 'Nonaktif',
                item.is_primary ? 'Ya' : 'Tidak',
            ];
        });
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `sumber_klien_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Data sumber klien berhasil diexport ke CSV.');
    };

    return (
        <div className="space-y-6 pb-12">
            <Head title="Sumber Klien / Referral - Arams Pictures" />
            {/* ── HEADER TITLE & CTA ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Sumber Klien / Referral
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Kelola data pihak yang telah mereferensikan Arams Pictures kepada klien baru. Data ini akan membantu rekapitulasi dan apresiasi kepada pihak yang berkontribusi.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4 text-white" />
                    <span>Tambah Sumber Klien</span>
                </button>
            </div>

            {/* ── 4 STAT CARDS ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Sumber Klien */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-500 block">Total Sumber Klien</span>
                        <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                            {stats.total_sources}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Semua sumber</span>
                    </div>
                </div>

                {/* Card 2: Total Project */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-500 block">Total Project</span>
                        <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                            {stats.total_projects}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Dari semua sumber</span>
                    </div>
                </div>

                {/* Card 3: Total Penjualan */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-500 block">Total Penjualan</span>
                        <div className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                            {formatCurrency(stats.total_sales)}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Dari semua sumber</span>
                    </div>
                </div>

                {/* Card 4: Rata-rata Nilai Project */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <BarChart2 className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-500 block">Rata-rata Nilai Project</span>
                        <div className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                            {formatCurrency(stats.average_project_value)}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Dari semua sumber</span>
                    </div>
                </div>
            </div>

            {/* ── SEARCH & FILTERS BAR ────────────────────────────────────────── */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="w-full lg:w-96 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter({ search })}
                            placeholder="Cari nama sumber klien..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-600/10 outline-hidden transition-all"
                        />
                    </div>

                    {/* Date Range & Export Buttons */}
                    <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                        >
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>01 Mei 2026 - 31 Mei 2026</span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                        </button>

                        <button
                            type="button"
                            onClick={exportToCSV}
                            className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                {/* Filter row: Sumber Primary, Tipe, Filter button */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="font-semibold text-slate-500">Sumber Primary:</span>
                        <div className="relative min-w-32">
                            <select
                                value={selectedPrimary}
                                onChange={(e) => setSelectedPrimary(e.target.value)}
                                className="w-full appearance-none px-3 py-1.5 pr-7 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-hidden cursor-pointer"
                            >
                                <option value="all">Semua</option>
                                <option value="yes">Ya (Primary)</option>
                                <option value="no">Bukan Primary</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 ml-auto">
                        <button
                            type="button"
                            onClick={() => handleFilter()}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                            <Filter className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── CLIENT SOURCES TABLE ────────────────────────────────────────── */}
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <TableHead className="w-12 text-center">NO</TableHead>
                        <TableHead className="min-w-64">NAMA SUMBER KLIEN</TableHead>
                        <TableHead className="min-w-44">TERAKHIR REFERRAL</TableHead>
                        <TableHead className="min-w-28 text-center">STATUS</TableHead>
                        <TableHead className="w-24 text-center">AKSI</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {listData.data && listData.data.length > 0 ? (
                        listData.data.map((item, idx) => {
                            const meta = getTypeMeta(item.type, item.name, idx);
                            const TypeIcon = meta.icon;
                            const rowNumber = (listData.current_page - 1) * listData.per_page + idx + 1;

                            return (
                                <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                    {/* NO */}
                                    <TableCell className="text-center font-bold text-slate-500">
                                        {rowNumber}
                                    </TableCell>

                                    {/* NAMA SUMBER KLIEN */}
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {meta.initials ? (
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${meta.color}`}>
                                                    {meta.initials}
                                                </div>
                                            ) : (
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                                                    <TypeIcon className="w-4 h-4" />
                                                </div>
                                            )}
                                            <div>
                                                <Link
                                                    href={`/client-sources/${item.id}`}
                                                    className="font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors hover:underline"
                                                >
                                                    {item.name}
                                                </Link>
                                                {item.phone && (
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                        {item.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* TERAKHIR REFERRAL */}
                                    <TableCell className="text-slate-600 font-medium">
                                        {item.last_referral_date || meta.defaultDate}
                                    </TableCell>

                                    {/* STATUS */}
                                    <TableCell className="text-center">
                                        {item.status === 'active' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                Nonaktif
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* AKSI */}
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(item)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                                title="Edit Sumber"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer outline-hidden"
                                                        title="Menu Lainnya"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/client-sources/${item.id}`}
                                                            className="flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>Lihat Detail</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => openEdit(item)}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>Edit Data</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() => setConfirmDelete({ isOpen: true, id: item.id, name: item.name })}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                                        <span>Hapus Sumber</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableEmpty
                            colSpan={5}
                            message="Belum ada sumber klien"
                            description="Klik tombol Tambah Sumber Klien di atas untuk mendaftarkan sumber baru."
                            icon={<Users className="w-5 h-5" />}
                        />
                    )}
                </TableBody>
            </Table>

            {/* Pagination Footer */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shadow-2xs">
                <div>
                    Menampilkan {listData.from || 1} - {listData.to || listData.data.length} dari {listData.total || listData.data.length} sumber klien
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        disabled={listData.current_page <= 1}
                        onClick={() =>
                            router.get(
                                '/client-sources',
                                { ...filters, page: listData.current_page - 1 },
                                { preserveState: true }
                            )
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 font-bold cursor-pointer"
                    >
                        &lt;
                    </button>

                    {Array.from({ length: listData.last_page || 1 }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() =>
                                router.get(
                                    '/client-sources',
                                    { ...filters, page: p },
                                    { preserveState: true }
                                )
                            }
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${p === listData.current_page
                                    ? 'bg-[#4F46E5] text-white shadow-xs'
                                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            {p}
                        </button>
                    ))}

                    <button
                        type="button"
                        disabled={listData.current_page >= listData.last_page}
                        onClick={() =>
                            router.get(
                                '/client-sources',
                                { ...filters, page: listData.current_page + 1 },
                                { preserveState: true }
                            )
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 font-bold cursor-pointer"
                    >
                        &gt;
                    </button>
                </div>
            </div>

            {/* ── 3 INFO CARDS AT THE BOTTOM ─────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Card 1: Tentang Sumber Klien */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                    <h3 className="font-extrabold text-sm text-slate-900">Tentang Sumber Klien</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Sumber klien adalah pihak yang merekomendasikan Arams Pictures kepada klien baru. Bisa berupa perorangan, wedding organizer, vendor/partner, media sosial, atau lainnya.
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Data ini akan digunakan untuk rekapitulasi dan apresiasi kepada pihak yang telah membantu mereferensikan Arams Pictures.
                    </p>
                </div>

                {/* Card 2: Tipe Sumber Klien */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                    <h3 className="font-extrabold text-sm text-slate-900">Tipe Sumber Klien</h3>
                    <div className="space-y-2.5 text-xs">
                        <div className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                                <User className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <span className="font-bold text-slate-900 block">Perorangan</span>
                                <span className="text-slate-500 text-[11px]">Teman, keluarga, kenalan, atau individu.</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                                <HeartHandshake className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <span className="font-bold text-slate-900 block">Wedding Organizer</span>
                                <span className="text-slate-500 text-[11px]">Wedding organizer / planner / coordinator.</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                                <Store className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <span className="font-bold text-slate-900 block">Vendor / Partner</span>
                                <span className="text-slate-500 text-[11px]">Vendor atau partner bisnis.</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                <Globe className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <span className="font-bold text-slate-900 block">Media Sosial / Online</span>
                                <span className="text-slate-500 text-[11px]">Instagram, TikTok, Website, Google, dll.</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                                <Megaphone className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <span className="font-bold text-slate-900 block">Iklan (Ads)</span>
                                <span className="text-slate-500 text-[11px]">Iklan berbayar (Facebook Ads, Google Ads, dll).</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 3: Sumber Primary */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                    <h3 className="font-extrabold text-sm text-slate-900">Sumber Primary</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Sumber utama yang pertama kali merekomendasikan Arams Pictures ke klien tersebut.
                    </p>
                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Ya
                            </span>
                            <span className="text-slate-600">Sumber utama</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Tidak
                            </span>
                            <span className="text-slate-600">Bukan sumber utama</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MODAL TAMBAH / EDIT SUMBER BARU ─────────────────────────────── */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editItem ? 'Edit Sumber Klien' : 'Tambah Sumber Baru'}
                subtitle="Kelola data pihak pereferensi atau kanal pemasaran."
                maxWidth="xl"
            >
                <div className="space-y-4">
                    {/* Notice Banner matching Gambar 2 */}
                    <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 flex items-start gap-2.5 text-xs">
                        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                            Sumber klien akan otomatis tersimpan ke daftar Sumber Klien. Jika sumber yang dimasukkan sudah ada, sistem akan menandai sebagai sumber yang sama.
                        </span>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4 pt-1">
                        {/* Nama Sumber */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Nama Sumber Klien *
                            </label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Masukkan nama sumber klien"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-hidden font-bold"
                            />
                            <span className="text-[10px] text-slate-400 mt-1 block">
                                Contoh: Rina Safitri, Wedding Organizer Indah, Instagram
                            </span>
                        </div>

                        {/* Tipe Sumber & Kontak */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Tipe Sumber *
                                </label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-indigo-600 outline-hidden cursor-pointer"
                                >
                                    <option value="individual">Perorangan</option>
                                    <option value="wedding_organizer">Wedding Organizer</option>
                                    <option value="vendor">Vendor / Partner</option>
                                    <option value="social_media">Media Sosial / Online</option>
                                    <option value="ads">Iklan (Ads)</option>
                                    <option value="other">Lainnya</option>
                                </select>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                    Pilih jenis sumber klien.
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Kontak (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="Masukkan nomor telepon / email"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-hidden"
                                />
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                    Untuk memudahkan komunikasi.
                                </span>
                            </div>
                        </div>

                        {/* Deskripsi */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Deskripsi (Opsional)
                            </label>
                            <textarea
                                rows={3}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Masukkan keterangan tambahan"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-hidden resize-none leading-relaxed"
                            />
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                                Catatan atau informasi tambahan tentang sumber ini.
                            </span>
                        </div>

                        {/* Status & Sumber Primary Radio */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Status *
                                </label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-indigo-600 outline-hidden cursor-pointer"
                                >
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Nonaktif</option>
                                </select>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                    Sumber yang tidak aktif tidak akan ditampilkan pada dropdown pemilihan.
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Sumber Primary (Default)
                                </label>
                                <div className="space-y-2 mt-1">
                                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="is_primary"
                                            checked={form.is_primary === true}
                                            onChange={() => setForm({ ...form, is_primary: true })}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span>Ya, jadikan sebagai sumber primary</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="is_primary"
                                            checked={form.is_primary === false}
                                            onChange={() => setForm({ ...form, is_primary: false })}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span>Tidak, bukan sumber primary</span>
                                    </label>
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                    Akan menjadi pilihan utama saat membuat client baru.
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
                            >
                                Simpan Sumber
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ── MODAL DELETE CONFIRMATION ──────────────────────────────────── */}
            <AlertConfirmation
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false })}
                onConfirm={handleDelete}
                variant="danger"
                title="Hapus Sumber Klien"
                description={
                    <span>
                        Apakah Anda yakin ingin menghapus sumber klien <strong>{confirmDelete.name}</strong>? Data histori referral yang terkait akan tetap tersimpan di database.
                    </span>
                }
                confirmText="Ya, Hapus Sumber"
                cancelText="Batal"
            />
        </div>
    );
}
