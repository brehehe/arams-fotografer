import { Head, router } from '@inertiajs/react';
import {
    Plus,
    Edit2,
    Trash2,
    ChevronDown,
    X,
    Car,
    Filter,
    MoreVertical,
    Layers,
    Info,
    Camera,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { AlertConfirmation } from '@/components/ui/alert-confirmation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/ui/pagination';
import { formatRupiah } from '@/lib/formatters';

interface AddonItem {
    id: number | string;
    name: string;
    type: 'addon' | 'operational'; // Ala Carte vs Biaya Operasional
    category_id?: string | null;
    category_name: string;
    unit: string;
    price: number;
    description: string;
    status: 'active' | 'inactive';
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
    per_page?: number;
}

interface AddonsIndexProps {
    addons?: PaginatedData<any>;
    operationals?: PaginatedData<any>;
    categories?: any[];
    stats?: any;
    filters?: {
        search?: string;
        type?: string;
        per_page?: number;
        addon_page?: number;
        ops_page?: number;
        addon_category?: string;
        addon_status?: string;
        ops_category?: string;
        ops_status?: string;
    };
}

export default function AddonsIndex({
    addons = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0 },
    operationals = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0 },
    stats = {},
    filters = {},
}: AddonsIndexProps) {
    // Active Tab & Filter States
    const [activeTab, setActiveTab] = useState<'all' | 'addon' | 'operational'>('all');
    const [addonCategoryFilter, setAddonCategoryFilter] = useState(filters?.addon_category || 'all');
    const [addonStatusFilter, setAddonStatusFilter] = useState(filters?.addon_status || 'all');
    const [opsCategoryFilter, setOpsCategoryFilter] = useState(filters?.ops_category || 'all');
    const [opsStatusFilter, setOpsStatusFilter] = useState(filters?.ops_status || 'all');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);

    const [addDropdownOpen, setAddDropdownOpen] = useState(false);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'addon' | 'operational'>('addon');
    const [editId, setEditId] = useState<string | number | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{
        isOpen: boolean;
        id?: string | number;
        name?: string;
        type?: string;
        isLoading?: boolean;
    }>({
        isOpen: false,
    });
    const [formData, setFormData] = useState({
        name: '',
        category_id: '',
        category_name: 'Tim Tambahan',
        unit: 'Orang / Hari',
        price: 1500000,
        description: '',
        status: 'active',
    });

    const handleFilterAddons = (overrides?: { addon_category?: string; addon_status?: string }) => {
        router.get('/master-data/addons', {
            ...filters,
            addon_category: overrides?.addon_category !== undefined ? (overrides.addon_category !== 'all' ? overrides.addon_category : undefined) : (addonCategoryFilter !== 'all' ? addonCategoryFilter : undefined),
            addon_status: overrides?.addon_status !== undefined ? (overrides.addon_status !== 'all' ? overrides.addon_status : undefined) : (addonStatusFilter !== 'all' ? addonStatusFilter : undefined),
            addon_page: 1,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleFilterOps = (overrides?: { ops_category?: string; ops_status?: string }) => {
        router.get('/master-data/addons', {
            ...filters,
            ops_category: overrides?.ops_category !== undefined ? (overrides.ops_category !== 'all' ? overrides.ops_category : undefined) : (opsCategoryFilter !== 'all' ? opsCategoryFilter : undefined),
            ops_status: overrides?.ops_status !== undefined ? (overrides.ops_status !== 'all' ? overrides.ops_status : undefined) : (opsStatusFilter !== 'all' ? opsStatusFilter : undefined),
            ops_page: 1,
        }, { preserveState: true, preserveScroll: true });
    };

    // 1. Data Ala Carte / Add-on Layanan (Prioritize database records with fallback)
    const alaCarteItems: AddonItem[] = useMemo(() => {
        if (addons?.data && addons.data.length > 0) {
            return addons.data.map((a: any) => ({
                id: a.id,
                name: a.name,
                type: 'addon' as const,
                category_id: a.category_id || a.category?.id || null,
                category_name: a.category?.name || 'Ala Carte',
                unit: a.unit || 'Item',
                price: Number(a.price) || 0,
                description: a.description || '',
                status: (a.status || 'active') as 'active' | 'inactive',
            }));
        }

        return [
            {
                id: 1,
                name: 'Extra Photographer',
                type: 'addon',
                category_id: null,
                category_name: 'Tim Tambahan',
                unit: 'Orang / Hari',
                price: 1500000,
                description: 'Tambahan 1 photographer',
                status: 'active',
            },
            {
                id: 2,
                name: 'Extra Videographer',
                type: 'addon',
                category_id: null,
                category_name: 'Tim Tambahan',
                unit: 'Orang / Hari',
                price: 1800000,
                description: 'Tambahan 1 videographer',
                status: 'active',
            },
            {
                id: 3,
                name: 'Drone Pilot',
                type: 'addon',
                category_id: null,
                category_name: 'Peralatan',
                unit: 'Per Hari',
                price: 2000000,
                description: 'Termasuk drone + pilot',
                status: 'active',
            },
            {
                id: 4,
                name: 'Basic Album 30x20 (22p)',
                type: 'addon',
                category_id: null,
                category_name: 'Album',
                unit: 'Paket',
                price: 1500000,
                description: 'Album basic 30x20cm 22 pages',
                status: 'active',
            },
            {
                id: 5,
                name: 'Premium Album 30x20 (30p)',
                type: 'addon',
                category_id: null,
                category_name: 'Album',
                unit: 'Paket',
                price: 2500000,
                description: 'Album premium 30x20cm 30 pages',
                status: 'active',
            },
            {
                id: 6,
                name: 'Exclusive Album 40x30 (80-100p)',
                type: 'addon',
                category_id: null,
                category_name: 'Album',
                unit: 'Paket',
                price: 6000000,
                description: 'Album exclusive 40x30cm 80-100 pages',
                status: 'active',
            },
            {
                id: 7,
                name: 'Fast Photo Editing',
                type: 'addon',
                category_id: null,
                category_name: 'Editing',
                unit: 'Paket',
                price: 1000000,
                description: 'Percepatan proses editing photo',
                status: 'active',
            },
            {
                id: 8,
                name: 'Same Day Edit Video',
                type: 'addon',
                category_id: null,
                category_name: 'Editing',
                unit: 'Paket',
                price: 2500000,
                description: 'Video SDE (Same Day Edit)',
                status: 'active',
            },
        ];
    }, [addons.data]);

    // 2. Data Biaya Operasional Project (Prioritize database records with fallback)
    const operationalItems: AddonItem[] = useMemo(() => {
        if (operationals?.data && operationals.data.length > 0) {
            return operationals.data.map((a: any) => ({
                id: a.id,
                name: a.name,
                type: 'operational' as const,
                category_id: a.category_id || a.category?.id || null,
                category_name: a.category?.name || a.name || 'Operasional',
                unit: a.unit || 'Paket',
                price: Number(a.price) || 0,
                description: a.description || '',
                status: (a.status || 'active') as 'active' | 'inactive',
            }));
        }

        return [
            {
                id: 101,
                name: 'Transportasi',
                type: 'operational',
                category_id: null,
                category_name: 'Transportasi',
                unit: 'Paket / Perjalanan',
                price: 500000,
                description: 'Biaya transportasi tim & peralatan',
                status: 'active',
            },
            {
                id: 102,
                name: 'Akomodasi / Penginapan',
                type: 'operational',
                category_id: null,
                category_name: 'Akomodasi',
                unit: 'Orang / Malam',
                price: 800000,
                description: 'Penginapan tim (per orang per malam)',
                status: 'active',
            },
            {
                id: 103,
                name: 'Konsumsi & Makan Tim',
                type: 'operational',
                category_id: null,
                category_name: 'Konsumsi',
                unit: 'Orang / Hari',
                price: 350000,
                description: 'Konsumsi tim selama project',
                status: 'active',
            },
            {
                id: 104,
                name: 'Toll & Parkir',
                type: 'operational',
                category_id: null,
                category_name: 'Transportasi',
                unit: 'Paket',
                price: 150000,
                description: 'Biaya tol & parkir venue acara',
                status: 'active',
            },
            {
                id: 105,
                name: 'Sewa Peralatan',
                type: 'operational',
                category_id: null,
                category_name: 'Peralatan',
                unit: 'Item',
                price: 750000,
                description: 'Sewa lighting / lensa tambahan',
                status: 'active',
            },
            {
                id: 106,
                name: 'Crew / Freelance Eksternal',
                type: 'operational',
                category_id: null,
                category_name: 'Fee Personel',
                unit: 'Orang / Hari',
                price: 1000000,
                description: 'Photographer / Videographer asisten tambahan',
                status: 'active',
            },
            {
                id: 107,
                name: 'Cetak Vendor Eksternal',
                type: 'operational',
                category_id: null,
                category_name: 'Vendor',
                unit: 'Paket',
                price: 1200000,
                description: 'Cetak foto instan / photobooth eksternal',
                status: 'active',
            },
            {
                id: 108,
                name: 'Izin Lokasi / Retribusi',
                type: 'operational',
                category_id: null,
                category_name: 'Lokasi',
                unit: 'Paket',
                price: 500000,
                description: 'Tiket masuk spot / retribusi venue',
                status: 'active',
            },
        ];
    }, [operationals.data]);

    // Category Pill Color Badges
    const getBadgeClass = (categoryName: string) => {
        switch (categoryName) {
            case 'Tim Tambahan':
                return 'bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100';
            case 'Peralatan':
                return 'bg-[#F5F3FF] text-[#7C3AED] border border-purple-100';
            case 'Album':
                return 'bg-[#FDF2F8] text-[#DB2777] border border-pink-100';
            case 'Editing':
                return 'bg-[#ECFEFF] text-[#0891B2] border border-cyan-100';
            case 'Transportasi':
                return 'bg-[#FDF2F8] text-[#DB2777] border border-pink-100';
            case 'Akomodasi':
                return 'bg-[#E0F2FE] text-[#0284C7] border border-sky-200';
            case 'Konsumsi':
                return 'bg-[#ECFEFF] text-[#0891B2] border border-cyan-100';
            case 'Fee Personel':
                return 'bg-[#FFFBEB] text-[#D97706] border border-amber-100';
            case 'Lokasi':
                return 'bg-[#ECFDF5] text-[#059669] border border-emerald-100';
            case 'Lainnya':
                return 'bg-[#ECFDF5] text-[#059669] border border-emerald-100';
            default:
                return 'bg-slate-100 text-slate-700 border border-slate-200';
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            type: modalType,
            category_id: formData.category_id || null,
            unit: formData.unit,
            price: formData.price,
            description: formData.description,
            status: formData.status,
        };

        if (editId) {
            router.put(`/master-data/addons/${editId}`, payload, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Data "${formData.name}" berhasil diperbarui!`);
                    setModalOpen(false);
                    setEditId(null);
                },
                onError: (err) => {
                    const firstMsg = Object.values(err)[0];
                    toast.error(typeof firstMsg === 'string' ? firstMsg : 'Gagal memperbarui data');
                },
            });
        } else {
            router.post(
                '/master-data/addons',
                payload,
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(`Data "${formData.name}" berhasil disimpan!`);
                        setModalOpen(false);
                        setEditId(null);
                        setFormData({
                            name: '',
                            category_id: '',
                            category_name: modalType === 'addon' ? 'Tim Tambahan' : 'Transportasi',
                            unit: modalType === 'addon' ? 'Orang / Hari' : 'Paket',
                            price: 500000,
                            description: '',
                            status: 'active',
                        });
                    },
                    onError: (err) => {
                        const firstMsg = Object.values(err)[0];
                        toast.error(typeof firstMsg === 'string' ? firstMsg : 'Gagal menyimpan data');
                    },
                }
            );
        }
    };

    const handleDelete = () => {
        if (!confirmDelete.id) {
return;
}

        setConfirmDelete((prev) => ({ ...prev, isLoading: true }));
        router.delete(`/master-data/addons/${confirmDelete.id}`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setConfirmDelete({ isOpen: false, isLoading: false });
                toast.success(`"${confirmDelete.name || 'Data'}" berhasil dihapus.`);
            },
            onError: (err) => {
                setConfirmDelete((prev) => ({ ...prev, isLoading: false }));
                const firstMsg = Object.values(err)[0];
                toast.error(typeof firstMsg === 'string' ? firstMsg : 'Gagal menghapus data.');
            },
        });
    };

    const renderTableA = () => (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-5 flex flex-col h-full justify-between">
            <div className="space-y-3.5">
                {/* 1. Header Section A */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#3B46F1] flex items-center justify-center shrink-0">
                            <Camera className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight truncate">
                                    A. Ala Carte / Add-on Layanan
                                </h2>
                                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-extrabold bg-indigo-50 text-[#3B46F1] border border-indigo-100/80 shrink-0">
                                    {stats?.total_addons ?? addons?.total ?? alaCarteItems.length} item
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                Layanan tambahan pilihan untuk melengkapi paket utama.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setEditId(null);
                            setModalType('addon');
                            setFormData({
                                name: '',
                                category_id: '',
                                category_name: 'Tim Tambahan',
                                unit: 'Orang / Hari',
                                price: 1500000,
                                description: '',
                                status: 'active',
                            });
                            setModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.02] cursor-pointer shrink-0"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah</span>
                    </button>
                </div>

                {/* 2. Filters Row */}
                <div className="flex items-center gap-2 bg-slate-50/70 p-2 rounded-xl border border-slate-100">
                    <select
                        value={addonCategoryFilter}
                        onChange={(e) => {
                            setAddonCategoryFilter(e.target.value);
                            handleFilterAddons({ addon_category: e.target.value });
                        }}
                        className="flex-1 min-w-0 h-8 px-2.5 text-xs bg-white rounded-lg border border-slate-200 text-slate-700 font-medium cursor-pointer shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#3B46F1]"
                    >
                        <option value="all">Semua Kategori</option>
                        <option value="Tim Tambahan">Tim Tambahan</option>
                        <option value="Peralatan">Peralatan</option>
                        <option value="Album">Album</option>
                        <option value="Editing">Editing</option>
                    </select>

                    <select
                        value={addonStatusFilter}
                        onChange={(e) => {
                            setAddonStatusFilter(e.target.value);
                            handleFilterAddons({ addon_status: e.target.value });
                        }}
                        className="w-28 sm:w-32 h-8 px-2.5 text-xs bg-white rounded-lg border border-slate-200 text-slate-700 font-medium cursor-pointer shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#3B46F1]"
                    >
                        <option value="all">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                    </select>

                    {(addonCategoryFilter !== 'all' || addonStatusFilter !== 'all') && (
                        <button
                            type="button"
                            onClick={() => {
                                setAddonCategoryFilter('all');
                                setAddonStatusFilter('all');
                                handleFilterAddons({ addon_category: 'all', addon_status: 'all' });
                            }}
                            className="h-8 px-2 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                            title="Reset Filter"
                        >
                            <Filter className="w-3.5 h-3.5 text-slate-500" />
                            <span className="hidden sm:inline">Reset</span>
                        </button>
                    )}
                </div>

                {/* 3. Clean Responsive Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-100/90">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                <th className="py-2.5 px-2.5 w-8 text-center">NO</th>
                                <th className="py-2.5 px-3 min-w-[160px]">NAMA ADD-ON</th>
                                <th className="py-2.5 px-2.5 w-24">KATEGORI</th>
                                <th className="py-2.5 px-2 w-16">SATUAN</th>
                                <th className="py-2.5 px-3 w-28 text-right">HARGA</th>
                                <th className="py-2.5 px-2 w-10 text-center">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px] text-slate-800">
                            {alaCarteItems.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                                    <td className="py-2.5 px-2.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                                    <td className="py-2.5 px-3">
                                        <div className="max-w-[200px]">
                                            <span className="font-bold text-slate-900 block truncate group-hover:text-[#3B46F1] transition-colors" title={item.name}>
                                                {item.name}
                                            </span>
                                            {item.description && (
                                                <span className="text-[10px] text-slate-400 block truncate font-normal" title={item.description}>
                                                    {item.description}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getBadgeClass(
                                                item.category_name
                                            )}`}
                                        >
                                            {item.category_name}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-2 text-slate-500 whitespace-nowrap text-[11px]">
                                        {item.unit}
                                    </td>
                                    <td className="py-2.5 px-3 font-extrabold text-slate-900 whitespace-nowrap font-mono text-right text-xs">
                                        {formatRupiah(item.price)}
                                    </td>
                                    <td className="py-2.5 px-2 text-center whitespace-nowrap relative">
                                        <div className="flex items-center justify-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                                    >
                                                        <MoreVertical className="w-3.5 h-3.5" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-32 bg-white rounded-xl border border-slate-200/90 shadow-xl p-1 z-50 text-xs">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setEditId(item.id);
                                                            setModalType('addon');
                                                            setFormData({
                                                                name: item.name,
                                                                category_id: String(item.category_id || ''),
                                                                category_name: item.category_name,
                                                                unit: item.unit,
                                                                price: item.price,
                                                                description: item.description,
                                                                status: item.status,
                                                            });
                                                            setModalOpen(true);
                                                        }}
                                                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>Edit</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setConfirmDelete({
                                                                isOpen: true,
                                                                id: item.id,
                                                                name: item.name,
                                                                type: 'addon',
                                                                isLoading: false,
                                                            });
                                                        }}
                                                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                        <span>Hapus</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4. Pagination (pinned to bottom) */}
            <div className="pt-3 border-t border-slate-100 mt-auto">
                <Pagination
                    currentPage={addons.current_page || 1}
                    lastPage={addons.last_page || 1}
                    total={addons.total ?? alaCarteItems.length}
                    from={addons.from}
                    to={addons.to}
                    perPage={addons.per_page || perPage}
                    itemLabel="add-on"
                    onPageChange={(page) => {
                        router.get('/master-data/addons', { ...filters, addon_page: page, per_page: perPage }, { preserveState: true, preserveScroll: true });
                    }}
                    onPerPageChange={(newPerPage) => {
                        setPerPage(newPerPage);
                        router.get('/master-data/addons', { ...filters, addon_page: 1, per_page: newPerPage }, { preserveState: true, preserveScroll: true });
                    }}
                />
            </div>
        </div>
    );

    const renderTableB = () => (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden p-5 flex flex-col h-full justify-between">
            <div className="space-y-3.5">
                {/* 1. Header Section B */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                            <Car className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-extrabold text-slate-900 tracking-tight truncate">
                                    B. Biaya Operasional Project
                                </h2>
                                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200/60 shrink-0">
                                    {stats?.total_ops ?? operationals?.total ?? operationalItems.length} item
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                Biaya operasional & pelaksanaan project.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setEditId(null);
                            setModalType('operational');
                            setFormData({
                                name: '',
                                category_id: '',
                                category_name: 'Transportasi',
                                unit: 'Paket',
                                price: 500000,
                                description: '',
                                status: 'active',
                            });
                            setModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.02] cursor-pointer shrink-0"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah</span>
                    </button>
                </div>

                {/* 2. Filters Row */}
                <div className="flex items-center gap-2 bg-slate-50/70 p-2 rounded-xl border border-slate-100">
                    <select
                        value={opsCategoryFilter}
                        onChange={(e) => {
                            setOpsCategoryFilter(e.target.value);
                            handleFilterOps({ ops_category: e.target.value });
                        }}
                        className="flex-1 min-w-0 h-8 px-2.5 text-xs bg-white rounded-lg border border-slate-200 text-slate-700 font-medium cursor-pointer shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#3B46F1]"
                    >
                        <option value="all">Semua Kategori</option>
                        <option value="Transportasi">Transportasi</option>
                        <option value="Akomodasi">Akomodasi</option>
                        <option value="Konsumsi">Konsumsi</option>
                        <option value="Fee Personel">Fee Personel</option>
                        <option value="Lokasi">Lokasi</option>
                    </select>

                    <select
                        value={opsStatusFilter}
                        onChange={(e) => {
                            setOpsStatusFilter(e.target.value);
                            handleFilterOps({ ops_status: e.target.value });
                        }}
                        className="w-28 sm:w-32 h-8 px-2.5 text-xs bg-white rounded-lg border border-slate-200 text-slate-700 font-medium cursor-pointer shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#3B46F1]"
                    >
                        <option value="all">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                    </select>

                    {(opsCategoryFilter !== 'all' || opsStatusFilter !== 'all') && (
                        <button
                            type="button"
                            onClick={() => {
                                setOpsCategoryFilter('all');
                                setOpsStatusFilter('all');
                                handleFilterOps({ ops_category: 'all', ops_status: 'all' });
                            }}
                            className="h-8 px-2 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                            title="Reset Filter"
                        >
                            <Filter className="w-3.5 h-3.5 text-slate-500" />
                            <span className="hidden sm:inline">Reset</span>
                        </button>
                    )}
                </div>

                {/* 3. Clean Responsive Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-100/90">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                <th className="py-2.5 px-2.5 w-8 text-center">NO</th>
                                <th className="py-2.5 px-3 min-w-[160px]">NAMA BIAYA</th>
                                <th className="py-2.5 px-2.5 w-24">KATEGORI</th>
                                <th className="py-2.5 px-2 w-16">SATUAN</th>
                                <th className="py-2.5 px-3 w-28 text-right">HARGA</th>
                                <th className="py-2.5 px-2 w-10 text-center">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px] text-slate-800">
                            {operationalItems.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                                    <td className="py-2.5 px-2.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                                    <td className="py-2.5 px-3">
                                        <div className="max-w-[200px]">
                                            <span className="font-bold text-slate-900 block truncate group-hover:text-amber-700 transition-colors" title={item.name}>
                                                {item.name}
                                            </span>
                                            {item.description && (
                                                <span className="text-[10px] text-slate-400 block truncate font-normal" title={item.description}>
                                                    {item.description}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getBadgeClass(
                                                item.category_name
                                            )}`}
                                        >
                                            {item.category_name}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-2 text-slate-500 whitespace-nowrap text-[11px]">
                                        {item.unit}
                                    </td>
                                    <td className="py-2.5 px-3 font-extrabold text-slate-900 whitespace-nowrap font-mono text-right text-xs">
                                        {formatRupiah(item.price)}
                                    </td>
                                    <td className="py-2.5 px-2 text-center whitespace-nowrap relative">
                                        <div className="flex items-center justify-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                                    >
                                                        <MoreVertical className="w-3.5 h-3.5" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-32 bg-white rounded-xl border border-slate-200/90 shadow-xl p-1 z-50 text-xs">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setEditId(item.id);
                                                            setModalType('operational');
                                                            setFormData({
                                                                name: item.name,
                                                                category_id: String(item.category_id || ''),
                                                                category_name: item.category_name,
                                                                unit: item.unit,
                                                                price: item.price,
                                                                description: item.description,
                                                                status: item.status,
                                                            });
                                                            setModalOpen(true);
                                                        }}
                                                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>Edit</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setConfirmDelete({
                                                                isOpen: true,
                                                                id: item.id,
                                                                name: item.name,
                                                                type: 'operational',
                                                                isLoading: false,
                                                            });
                                                        }}
                                                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                        <span>Hapus</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4. Pagination (pinned to bottom) */}
            <div className="pt-3 border-t border-slate-100 mt-auto">
                <Pagination
                    currentPage={operationals.current_page || 1}
                    lastPage={operationals.last_page || 1}
                    total={operationals.total ?? operationalItems.length}
                    from={operationals.from}
                    to={operationals.to}
                    perPage={operationals.per_page || perPage}
                    itemLabel="biaya operasional"
                    onPageChange={(page) => {
                        router.get('/master-data/addons', { ...filters, ops_page: page, per_page: perPage }, { preserveState: true, preserveScroll: true });
                    }}
                    onPerPageChange={(newPerPage) => {
                        setPerPage(newPerPage);
                        router.get('/master-data/addons', { ...filters, ops_page: 1, per_page: newPerPage }, { preserveState: true, preserveScroll: true });
                    }}
                />
            </div>
        </div>
    );

    const renderInformasiCard = () => (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5 text-xs text-slate-600 h-full flex flex-col justify-between">
            <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3B46F1] flex items-center justify-center shrink-0">
                        <Info className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-sm text-slate-900">Informasi &amp; Panduan Penggunaan</h3>
                        <p className="text-slate-500 text-[11px]">Panduan penggunaan add-on dan biaya operasional.</p>
                    </div>
                </div>
                <p className="leading-relaxed text-slate-500 text-xs">
                    Add-on &amp; Biaya digunakan saat membuat Project/Order untuk menghitung total nilai project secara detail.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                        <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                            <Camera className="w-3.5 h-3.5 text-indigo-600" />
                            <span>A. Ala Carte / Add-on Layanan</span>
                        </h4>
                        <p className="text-slate-500 leading-snug text-[11px]">
                            Layanan tambahan yang dapat dipilih client untuk melengkapi paket utama.
                        </p>
                        <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                            <p className="font-semibold text-slate-600">Contoh:</p>
                            <p>&bull; Extra Photographer &bull; Album Upgrade</p>
                            <p>&bull; Same Day Edit &bull; Drone Pilot</p>
                        </div>
                    </div>

                    <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                        <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                            <Car className="w-3.5 h-3.5 text-amber-600" />
                            <span>B. Biaya Operasional Project</span>
                        </h4>
                        <p className="text-slate-500 leading-snug text-[11px]">
                            Biaya pendukung yang timbul selama pelaksanaan project untuk tim internal.
                        </p>
                        <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                            <p className="font-semibold text-slate-600">Contoh:</p>
                            <p>&bull; Transportasi &bull; Penginapan / Hotel</p>
                            <p>&bull; Konsumsi Tim &bull; Fee Personel / Retribusi</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderKategoriWarnaCard = () => (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3.5 text-xs h-full flex flex-col justify-between">
            <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-sm text-slate-900">Kategori &amp; Label Warna</h3>
                        <p className="text-slate-500 text-[11px]">
                            Label warna membantu membedakan jenis add-on dan biaya.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/60 border border-slate-100/80">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />
                            <span className="font-bold text-[#4F46E5]">Tim Tambahan</span>
                        </div>
                        <span className="text-slate-500 font-medium text-[10.5px]">Tenaga kerja</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/60 border border-slate-100/80">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                            <span className="font-bold text-[#7C3AED]">Peralatan</span>
                        </div>
                        <span className="text-slate-500 font-medium text-[10.5px]">Sewa alat</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/60 border border-slate-100/80">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#DB2777]" />
                            <span className="font-bold text-[#DB2777]">Album</span>
                        </div>
                        <span className="text-slate-500 font-medium text-[10.5px]">Cetakan</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/60 border border-slate-100/80">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#0891B2]" />
                            <span className="font-bold text-[#0891B2]">Editing</span>
                        </div>
                        <span className="text-slate-500 font-medium text-[10.5px]">Layanan edit</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/60 border border-slate-100/80">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#DB2777]" />
                            <span className="font-bold text-[#DB2777]">Transportasi</span>
                        </div>
                        <span className="text-slate-500 font-medium text-[10.5px]">Transport</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/60 border border-slate-100/80">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                            <span className="font-bold text-[#0284C7]">Akomodasi</span>
                        </div>
                        <span className="text-slate-500 font-medium text-[10.5px]">Penginapan</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/60 border border-slate-100/80">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#0891B2]" />
                            <span className="font-bold text-[#0891B2]">Konsumsi</span>
                        </div>
                        <span className="text-slate-500 font-medium text-[10.5px]">Makan &amp; minum</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/60 border border-slate-100/80">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                            <span className="font-bold text-[#D97706]">Fee Personel</span>
                        </div>
                        <span className="text-slate-500 font-medium text-[10.5px]">Fee kru</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/60 border border-slate-100/80">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#059669]" />
                            <span className="font-bold text-[#059669]">Lokasi</span>
                        </div>
                        <span className="text-slate-500 font-medium text-[10.5px]">Izin venue</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50/60 border border-slate-100/80">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#059669]" />
                            <span className="font-bold text-[#059669]">Lainnya</span>
                        </div>
                        <span className="text-slate-500 font-medium text-[10.5px]">Biaya lain</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-full space-y-4 pb-2">
            <Head title="Add-on & Biaya - Master Data" />

            {/* ── 1. HEADER TITLE & ACTIONS SECTION ────────────────────────────────── */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Add-on &amp; Biaya</h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Kelola semua add-on layanan (Ala Carte) dan biaya operasional project.
                </p>
            </div>

            {/* ── 2. TOP PILL TABS & TAMBAH BARU BUTTON ──────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Pill Tab 1: Tampilan Sejajar (Semua) */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('all')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'all'
                                ? 'bg-[#3B46F1] text-white shadow-xs'
                                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Tampilan Sejajar (Semua)</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                            activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {(stats?.total_addons ?? addons?.total ?? alaCarteItems.length) + (stats?.total_ops ?? operationals?.total ?? operationalItems.length)}
                        </span>
                    </button>

                    {/* Pill Tab 2: Ala Carte / Add-on Layanan */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('addon')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'addon'
                                ? 'bg-[#3B46F1] text-white shadow-xs'
                                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                        }`}
                    >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Ala Carte / Add-on</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                            activeTab === 'addon' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {stats?.total_addons ?? addons?.total ?? alaCarteItems.length}
                        </span>
                    </button>

                    {/* Pill Tab 3: Biaya Operasional Project */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('operational')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'operational'
                                ? 'bg-[#0F172A] text-white shadow-xs'
                                : 'bg-[#0F172A] text-slate-200 hover:bg-slate-800'
                        }`}
                    >
                        <Car className="w-3.5 h-3.5" />
                        <span>Biaya Operasional</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-800 text-slate-200 border border-slate-700">
                            {stats?.total_ops ?? operationals?.total ?? operationalItems.length}
                        </span>
                    </button>
                </div>

                {/* Tambah Baru Dropdown Button */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setAddDropdownOpen(!addDropdownOpen)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Baru</span>
                        <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                    </button>

                    {addDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in duration-150">
                            <button
                                type="button"
                                onClick={() => {
                                    setAddDropdownOpen(false);
                                    setEditId(null);
                                    setModalType('addon');
                                    setFormData({
                                        name: '',
                                        category_id: '',
                                        category_name: 'Tim Tambahan',
                                        unit: 'Orang / Hari',
                                        price: 1500000,
                                        description: '',
                                        status: 'active',
                                    });
                                    setModalOpen(true);
                                }}
                                className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                            >
                                <Camera className="w-4 h-4 text-indigo-600" />
                                <span>+ Tambah Add-on Layanan</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setAddDropdownOpen(false);
                                    setEditId(null);
                                    setModalType('operational');
                                    setFormData({
                                        name: '',
                                        category_id: '',
                                        category_name: 'Transportasi',
                                        unit: 'Paket',
                                        price: 500000,
                                        description: '',
                                        status: 'active',
                                    });
                                    setModalOpen(true);
                                }}
                                className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                            >
                                <Car className="w-4 h-4 text-amber-600" />
                                <span>+ Tambah Biaya Operasional</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── 3. MAIN CONTENT: TAMPILAN SEJAJAR ATAU TABS ───────────────────────── */}
            {activeTab === 'all' ? (
                /* ── TAMPILAN SEJAJAR (2 KOLOM KIRI & KANAN) ── */
                <div className="space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
                        {/* Kolom 1: A. Ala Carte / Add-on Layanan */}
                        <div className="w-full flex flex-col h-full">
                            {renderTableA()}
                        </div>

                        {/* Kolom 2: B. Biaya Operasional Project */}
                        <div className="w-full flex flex-col h-full">
                            {renderTableB()}
                        </div>
                    </div>

                    {/* Helper Cards Sejajar di Bawah */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                        <div className="w-full flex flex-col h-full">
                            {renderInformasiCard()}
                        </div>
                        <div className="w-full flex flex-col h-full">
                            {renderKategoriWarnaCard()}
                        </div>
                    </div>
                </div>
            ) : (
                /* ── TAMPILAN TAB TUNGGAL DENGAN SIDEBAR ── */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-8 space-y-6">
                        {activeTab === 'addon' && renderTableA()}
                        {activeTab === 'operational' && renderTableB()}
                    </div>
                    <div className="lg:col-span-4 space-y-5">
                        {renderInformasiCard()}
                        {renderKategoriWarnaCard()}
                    </div>
                </div>
            )}


            {/* ── 4. RIGHT SLIDE-OVER DRAWER: TAMBAH / EDIT ADD-ON & BIAYA ───────── */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                        onClick={() => setModalOpen(false)}
                    />
                    {/* Slide-over Drawer from Right */}
                    <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
                        <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
                            <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-white shrink-0">
                                <h3 className="font-black text-sm text-slate-900">
                                    {editId
                                        ? (modalType === 'addon' ? 'Edit Add-on Layanan' : 'Edit Biaya Operasional')
                                        : (modalType === 'addon' ? 'Tambah Add-on Layanan (Ala Carte)' : 'Tambah Biaya Operasional Project')}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => {
 setModalOpen(false); setEditId(null); 
}}
                                    className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs flex-1 overflow-y-auto flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="font-bold text-slate-700">Nama Item *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Contoh: Extra Photographer / Transport Luar Kota"
                                            className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B46F1] outline-hidden font-medium"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="font-bold text-slate-700">Kategori *</label>
                                            <select
                                                value={formData.category_name}
                                                onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                                                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium cursor-pointer"
                                            >
                                                {modalType === 'addon' ? (
                                                    <>
                                                        <option value="Tim Tambahan">Tim Tambahan</option>
                                                        <option value="Peralatan">Peralatan</option>
                                                        <option value="Album">Album</option>
                                                        <option value="Editing">Editing</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="Transportasi">Transportasi</option>
                                                        <option value="Akomodasi">Akomodasi</option>
                                                        <option value="Konsumsi">Konsumsi</option>
                                                        <option value="Fee Personel">Fee Personel</option>
                                                        <option value="Lokasi">Lokasi</option>
                                                        <option value="Lainnya">Lainnya</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="font-bold text-slate-700">Satuan *</label>
                                            <input
                                                type="text"
                                                value={formData.unit}
                                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                                placeholder="Orang / Hari / Paket"
                                                className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="font-bold text-slate-700">Harga Standar (Rp) *</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                                                Rp
                                            </span>
                                            <input
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, price: Number(e.target.value) })
                                                }
                                                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="font-bold text-slate-700">Keterangan / Deskripsi</label>
                                        <textarea
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Keterangan singkat..."
                                            className="w-full p-2.5 rounded-xl border border-slate-200"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => {
 setModalOpen(false); setEditId(null); 
}}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                                    >
                                        {editId ? 'Simpan Perubahan' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 5. DELETE CONFIRMATION MODAL ───────────────────────────────── */}
            <AlertConfirmation
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, isLoading: false })}
                onConfirm={handleDelete}
                variant="danger"
                isLoading={confirmDelete.isLoading}
                title={`Hapus ${confirmDelete.type === 'addon' ? 'Add-on Layanan' : 'Biaya Operasional'}`}
                description={
                    <span>
                        Apakah Anda yakin ingin menghapus{' '}
                        <strong>"{confirmDelete.name}"</strong>?{' '}
                        Tindakan ini tidak dapat dibatalkan.
                    </span>
                }
                confirmText="Ya, Hapus"
                cancelText="Batal"
            />
        </div>
    );
}
