import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Box,
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
    MapPin,
    Plane,
    Globe,
    Car,
    Utensils,
    Bed,
    Users,
    ShoppingBag,
} from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';

interface AddonItem {
    id: number | string;
    name: string;
    category_id?: number | string;
    category?: { id: number; name: string; color?: string };
    addon_category?: string;
    description?: string;
    price?: number | string;
    unit?: string;
    status?: string;
    used_count?: number;
}

interface Stats {
    total?: number;
    active?: number;
    inactive?: number;
    used_in_projects?: number;
}

interface AddonsIndexProps {
    addons?: {
        data: AddonItem[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    categories?: Array<{ id: number; name: string; color?: string }>;
    stats?: Stats;
    filters?: {
        search?: string;
    };
}

const ADDON_ICONS: Record<string, React.ReactNode> = {
    'Lokasi - Seputar Jawa Timur': <MapPin className="w-4 h-4 text-purple-600" />,
    'Lokasi - Luar Jawa Timur (Dalam Pulau)': <Plane className="w-4 h-4 text-blue-600" />,
    'Lokasi - Luar Negeri': <Globe className="w-4 h-4 text-emerald-600" />,
    Transport: <Car className="w-4 h-4 text-indigo-600" />,
    Konsumsi: <Utensils className="w-4 h-4 text-amber-600" />,
    Penginapan: <Bed className="w-4 h-4 text-purple-600" />,
    'Fee per Orang (Talent/Model/Guest)': <Users className="w-4 h-4 text-violet-600" />,
    'Biaya Lainnya': <ShoppingBag className="w-4 h-4 text-rose-600" />,
};

const ADDON_BG: Record<string, string> = {
    'Lokasi - Seputar Jawa Timur': 'bg-purple-50 text-purple-600 border-purple-100',
    'Lokasi - Luar Jawa Timur (Dalam Pulau)': 'bg-blue-50 text-blue-600 border-blue-100',
    'Lokasi - Luar Negeri': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Transport: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    Konsumsi: 'bg-amber-50 text-amber-600 border-amber-100',
    Penginapan: 'bg-purple-50 text-purple-600 border-purple-100',
    'Fee per Orang (Talent/Model/Guest)': 'bg-violet-50 text-violet-600 border-violet-100',
    'Biaya Lainnya': 'bg-rose-50 text-rose-600 border-rose-100',
};

const CATEGORY_BADGES: Record<string, string> = {
    'Lokal - Jawa Timur': 'bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100',
    'Lokal - Luar Jawa Timur': 'bg-[#EFF6FF] text-[#2563EB] border border-blue-100',
    'Luar Negeri': 'bg-[#ECFDF5] text-[#059669] border border-emerald-100',
    Lainnya: 'bg-[#FFF7ED] text-[#EA580C] border border-orange-100',
};

export default function AddonsIndex({
    addons = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0 },
    categories = [],
    stats = { total: 16, active: 15, inactive: 1, used_in_projects: 84 },
    filters = {},
}: AddonsIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedTab, setSelectedTab] = useState('Semua');
    const [statusFilter, setStatusFilter] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<AddonItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [form, setForm] = useState({
        name: '',
        addon_category: 'Lokal - Jawa Timur',
        description: '',
        price: 0,
        unit: 'Per Project',
        status: 'active',
    });

    // Demo addons matching Screenshot 4
    const demoAddons: AddonItem[] = useMemo(() => [
        {
            id: 1,
            name: 'Lokasi - Seputar Jawa Timur',
            addon_category: 'Lokal - Jawa Timur',
            description: 'Biaya tambahan untuk lokasi project masih di area Jawa Timur (dalam kota/ sekitar kota).',
            unit: 'Per Project',
            price: 0,
            status: 'active',
            used_count: 45,
        },
        {
            id: 2,
            name: 'Lokasi - Luar Jawa Timur (Dalam Pulau)',
            addon_category: 'Lokal - Luar Jawa Timur',
            description: 'Biaya tambahan untuk lokasi project di luar Jawa Timur (antar pulau).',
            unit: 'Per Project',
            price: 1500000,
            status: 'active',
            used_count: 22,
        },
        {
            id: 3,
            name: 'Lokasi - Luar Negeri',
            addon_category: 'Luar Negeri',
            description: 'Biaya tambahan untuk lokasi project di luar negeri.',
            unit: 'Per Project',
            price: 5000000,
            status: 'active',
            used_count: 5,
        },
        {
            id: 4,
            name: 'Transport',
            addon_category: 'Lainnya',
            description: 'Biaya transportasi tim (bbm, tol, parkir, tiket transport).',
            unit: 'Per Project',
            price: 750000,
            status: 'active',
            used_count: 68,
        },
        {
            id: 5,
            name: 'Konsumsi',
            addon_category: 'Lainnya',
            description: 'Biaya konsumsi untuk tim selama project berlangsung.',
            unit: 'Per Orang',
            price: 75000,
            status: 'active',
            used_count: 61,
        },
        {
            id: 6,
            name: 'Penginapan',
            addon_category: 'Lainnya',
            description: 'Biaya penginapan untuk tim (hotel/ penginapan).',
            unit: 'Per Malam / Per Kamar',
            price: 500000,
            status: 'active',
            used_count: 38,
        },
        {
            id: 7,
            name: 'Fee per Orang (Talent/Model/Guest)',
            addon_category: 'Lainnya',
            description: 'Biaya fee untuk talent, model, atau tamu (jika ada).',
            unit: 'Per Orang',
            price: 300000,
            status: 'active',
            used_count: 14,
        },
        {
            id: 8,
            name: 'Biaya Lainnya',
            addon_category: 'Lainnya',
            description: 'Biaya tambahan lainnya yang tidak termasuk dalam kategori di atas.',
            unit: 'Per Project',
            price: 0,
            status: 'inactive',
            used_count: 0,
        },
    ], []);

    const rawData = addons.data && addons.data.length > 0 ? addons.data : demoAddons;

    const filteredData = useMemo(() => {
        return rawData.filter((item) => {
            const catName = item.addon_category || item.category?.name || 'Lainnya';

            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!item.name.toLowerCase().includes(q) && !(item.description || '').toLowerCase().includes(q)) {
                    return false;
                }
            }
            if (selectedTab !== 'Semua') {
                if (selectedTab === 'Lokal - Jawa Timur' && !catName.includes('Seputar') && !catName.includes('Jawa Timur')) return false;
                if (selectedTab === 'Lokal - Luar Jawa Timur' && !catName.includes('Luar Jawa')) return false;
                if (selectedTab === 'Luar Negeri' && !catName.includes('Luar Negeri')) return false;
                if (selectedTab === 'Lainnya' && catName !== 'Lainnya' && catName !== 'Other') return false;
            }
            if (statusFilter !== 'all') {
                if (statusFilter === 'active' && item.status !== 'active') return false;
                if (statusFilter === 'inactive' && item.status === 'active') return false;
            }
            return true;
        });
    }, [rawData, searchQuery, selectedTab, statusFilter]);

    const handleOpenCreate = () => {
        setEditItem(null);
        setForm({
            name: '',
            addon_category: 'Lokal - Jawa Timur',
            description: '',
            price: 0,
            unit: 'Per Project',
            status: 'active',
        });
        setModalOpen(true);
    };

    const handleOpenEdit = (item: AddonItem) => {
        setEditItem(item);
        setForm({
            name: item.name,
            addon_category: item.addon_category || 'Lokal - Jawa Timur',
            description: item.description || '',
            price: Number(item.price) || 0,
            unit: item.unit || 'Per Project',
            status: item.status || 'active',
        });
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (editItem) {
            router.put(`/master-data/addons/${editItem.id}`, form, {
                onSuccess: () => {
                    setModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: () => setIsSubmitting(false),
            });
        } else {
            router.post('/master-data/addons', form, {
                onSuccess: () => {
                    setModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: () => setIsSubmitting(false),
            });
        }
    };

    const handleDelete = (id: number | string) => {
        if (confirm('Yakin ingin menghapus item add-on ini?')) {
            router.delete(`/master-data/addons/${id}`);
        }
    };

    // Export CSV
    const handleExport = () => {
        const rows = [
            ['No', 'Nama Add-on', 'Kategori', 'Deskripsi', 'Satuan', 'Harga (IDR)', 'Status', 'Digunakan di Project'],
            ...filteredData.map((a, i) => [
                i + 1,
                a.name,
                a.addon_category || 'Lainnya',
                a.description || '-',
                a.unit || 'Per Project',
                a.price ? a.price : '-',
                a.status === 'active' ? 'Aktif' : 'Nonaktif',
                `${a.used_count || 0} Project`,
            ]),
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Addon_Biaya_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 pb-20">
            <Head title="Add-on & Biaya - Master Data" />

            {/* ── 1. BREADCRUMB & HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Link href="/master-data/addons" className="hover:text-primary-accent transition-colors">
                            Master Data
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-primary-accent font-semibold">Add-on & Biaya</span>
                    </nav>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add-on & Biaya</h1>
                    <p className="text-xs text-slate-500">
                        Kelola biaya tambahan untuk project seperti transport, akomodasi, luar kota, luar negeri, fee per orang, dll.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Add-on / Biaya
                </button>
            </div>

            {/* ── 2. TOP 4 STAT CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Add-on / Biaya */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
                        <Box className="w-6 h-6 text-[#4F46E5]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Total Add-on / Biaya</span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                            {stats.total || 16}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Semua item</p>
                    </div>
                </div>

                {/* Card 2: Item Aktif */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Item Aktif</span>
                        <h2 className="text-2xl font-black text-[#059669] tracking-tight font-sans">
                            {stats.active || 15}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Sedang digunakan</p>
                    </div>
                </div>

                {/* Card 3: Item Nonaktif */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] flex items-center justify-center shrink-0">
                        <MinusCircle className="w-6 h-6 text-[#EF4444]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Item Nonaktif</span>
                        <h2 className="text-2xl font-black text-[#DC2626] tracking-tight font-sans">
                            {stats.inactive ?? 1}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Tidak digunakan</p>
                    </div>
                </div>

                {/* Card 4: Digunakan di Project */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] flex items-center justify-center shrink-0">
                        <FolderKanban className="w-6 h-6 text-[#D97706]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Digunakan di Project</span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                            {stats.used_in_projects || 84}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Total penggunaan</p>
                    </div>
                </div>
            </div>

            {/* ── 3. TABLE CARD CONTAINER ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                {/* Top Toolbar */}
                <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-3 flex-1">
                        {/* Search Input */}
                        <div className="relative min-w-[240px] max-w-sm flex-1">
                            <input
                                type="text"
                                placeholder="Cari add-on atau biaya..."
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

                {/* Filter Category Pills Bar */}
                <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto bg-slate-50/30">
                    {[
                        { label: 'Semua (16)', value: 'Semua' },
                        { label: 'Lokal - Jawa Timur (5)', value: 'Lokal - Jawa Timur' },
                        { label: 'Lokal - Luar Jawa Timur (5)', value: 'Lokal - Luar Jawa Timur' },
                        { label: 'Luar Negeri (3)', value: 'Luar Negeri' },
                        { label: 'Lainnya (3)', value: 'Lainnya' },
                    ].map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => setSelectedTab(tab.value)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                selectedTab === tab.value
                                    ? 'bg-[#3B46F1] text-white shadow-2xs'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/40 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="py-3 px-4 w-12">NO</th>
                                <th className="py-3 px-4">NAMA ADD-ON / BIAYA</th>
                                <th className="py-3 px-4">KATEGORI</th>
                                <th className="py-3 px-4">DESKRIPSI</th>
                                <th className="py-3 px-4">SATUAN</th>
                                <th className="py-3 px-4">HARGA (IDR)</th>
                                <th className="py-3 px-4 text-center">STATUS</th>
                                <th className="py-3 px-4 text-center">DIGUNAKAN DI PROJECT</th>
                                <th className="py-3 px-4 text-center">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.length > 0 ? (
                                filteredData.map((addon, idx) => {
                                    const iconEl = ADDON_ICONS[addon.name] || <ShoppingBag className="w-4 h-4 text-indigo-600" />;
                                    const bgStyle = ADDON_BG[addon.name] || 'bg-indigo-50 text-indigo-600 border-indigo-100';
                                    const catBadge = CATEGORY_BADGES[addon.addon_category || 'Lainnya'] || 'bg-slate-50 text-slate-600 border-slate-200';
                                    const isActive = addon.status === 'active';
                                    const priceNum = Number(addon.price) || 0;

                                    return (
                                        <tr key={addon.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-slate-400">
                                                {idx + 1}
                                            </td>

                                            {/* Nama Add-on + Icon */}
                                            <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${bgStyle}`}>
                                                        {iconEl}
                                                    </div>
                                                    <span>{addon.name}</span>
                                                </div>
                                            </td>

                                            {/* Kategori */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${catBadge}`}>
                                                    {addon.addon_category || 'Lainnya'}
                                                </span>
                                            </td>

                                            {/* Deskripsi */}
                                            <td className="py-3.5 px-4 text-slate-600 font-medium max-w-xs">
                                                {addon.description || '-'}
                                            </td>

                                            {/* Satuan */}
                                            <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                                                {addon.unit || 'Per Project'}
                                            </td>

                                            {/* Harga (IDR) */}
                                            <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                                                {priceNum > 0 ? (
                                                    <span>{formatRupiah(priceNum).replace('Rp ', '')}</span>
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

                                            {/* Digunakan di Project */}
                                            <td className="py-3.5 px-4 text-center font-bold text-slate-800 whitespace-nowrap">
                                                {addon.used_count || 0} Project
                                            </td>

                                            {/* Aksi */}
                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(addon)}
                                                        className="w-8 h-8 rounded-lg border border-slate-200 hover:border-indigo-300 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-colors cursor-pointer"
                                                        title="Edit Add-on"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(addon.id)}
                                                        className="w-8 h-8 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
                                                        title="Hapus Add-on"
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
                                    <td colSpan={9} className="py-12 text-center text-slate-400">
                                        <Box className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-xs font-semibold text-slate-600">Tidak ada add-on yang sesuai.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 sm:px-5 flex items-center justify-between border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500 font-medium">
                    <span>
                        Menampilkan 1 - {filteredData.length} dari {stats.total || 16} add-on / biaya
                    </span>
                    <div className="flex items-center gap-1">
                        <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-40" disabled>
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="w-7 h-7 rounded-lg bg-[#3B46F1] text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                            1
                        </button>
                        <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 font-semibold flex items-center justify-center text-xs hover:bg-slate-100">
                            2
                        </button>
                        <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100">
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── 4. MODAL: TAMBAH / EDIT ADDON ── */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-base font-black text-slate-900">
                                {editItem ? 'Edit Add-on / Biaya' : 'Tambah Add-on / Biaya'}
                            </h3>
                            <button type="button" onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Nama Add-on / Biaya <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Contoh: Transport, Penginapan, Lokasi Luar Kota"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                                    <select
                                        value={form.addon_category}
                                        onChange={(e) => setForm({ ...form, addon_category: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                    >
                                        <option value="Lokal - Jawa Timur">Lokal - Jawa Timur</option>
                                        <option value="Lokal - Luar Jawa Timur">Lokal - Luar Jawa Timur</option>
                                        <option value="Luar Negeri">Luar Negeri</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Satuan</label>
                                    <input
                                        type="text"
                                        value={form.unit}
                                        onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                        placeholder="Per Project, Per Orang, dll"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Harga (IDR)</label>
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                                        placeholder="0"
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
                                    placeholder="Rincian informasi biaya atau add-on..."
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
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Add-on'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
