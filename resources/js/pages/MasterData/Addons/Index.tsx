import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    Filter,
    MoreVertical,
    RotateCcw,
    Layers,
    Info,
    Camera,
    Video,
    Film,
    FileText,
} from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';

interface AddonItem {
    id: number | string;
    name: string;
    type: 'addon' | 'operational'; // Ala Carte vs Biaya Operasional
    category_name: string;
    unit: string;
    price: number;
    description: string;
    status: 'active' | 'inactive';
}

interface AddonsIndexProps {
    addons?: {
        data: any[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        per_page?: number;
    };
    categories?: any[];
    stats?: any;
    filters?: {
        search?: string;
        type?: string;
        per_page?: number;
    };
}

export default function AddonsIndex({
    addons = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0 },
    categories = [],
    stats = {},
    filters = {},
}: AddonsIndexProps) {
    // Active Tab & Filter States
    const [activeTab, setActiveTab] = useState<'all' | 'addon' | 'operational'>('all');
    const [addonCategoryFilter, setAddonCategoryFilter] = useState('all');
    const [addonStatusFilter, setAddonStatusFilter] = useState('all');
    const [opsCategoryFilter, setOpsCategoryFilter] = useState('all');
    const [opsStatusFilter, setOpsStatusFilter] = useState('all');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);

    const [addDropdownOpen, setAddDropdownOpen] = useState(false);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'addon' | 'operational'>('addon');
    const [formData, setFormData] = useState({
        name: '',
        category_name: 'Tim Tambahan',
        unit: 'Orang / Hari',
        price: 1500000,
        description: '',
        status: 'active',
    });

    // 1. Data Ala Carte / Add-on Layanan (Prioritize database records with fallback)
    const alaCarteItems: AddonItem[] = useMemo(() => {
        if (addons?.data && addons.data.length > 0) {
            const dbItems = addons.data
                .filter((a: any) => a.type !== 'operational')
                .map((a: any) => ({
                    id: a.id,
                    name: a.name,
                    type: 'addon' as const,
                    category_name: a.category?.name || 'Ala Carte',
                    unit: a.unit || 'Item',
                    price: Number(a.price) || 0,
                    description: a.description || '',
                    status: (a.status || 'active') as 'active' | 'inactive',
                }));
            if (dbItems.length > 0) return dbItems;
        }
        return [
            {
                id: 1,
                name: 'Extra Photographer',
                type: 'addon',
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
                category_name: 'Editing',
                unit: 'Paket',
                price: 2500000,
                description: 'Video SDE (Same Day Edit)',
                status: 'active',
            },
        ];
    }, [addons?.data]);

    // 2. Data Biaya Operasional Project (Prioritize database records with fallback)
    const operationalItems: AddonItem[] = useMemo(() => {
        if (addons?.data && addons.data.length > 0) {
            const dbOps = addons.data
                .filter((a: any) => a.type === 'operational')
                .map((a: any) => ({
                    id: a.id,
                    name: a.name,
                    type: 'operational' as const,
                    category_name: a.category?.name || a.name,
                    unit: a.unit || 'Paket',
                    price: Number(a.price) || 0,
                    description: a.description || '',
                    status: (a.status || 'active') as 'active' | 'inactive',
                }));
            if (dbOps.length > 0) return dbOps;
        }
        return [
            {
                id: 101,
                name: 'Transportasi',
                type: 'operational',
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
                category_name: 'Lokasi',
                unit: 'Paket',
                price: 500000,
                description: 'Tiket masuk spot / retribusi venue',
                status: 'active',
            },
        ];
    }, [addons?.data]);

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
        router.post(
            '/master-data/addons',
            {
                name: formData.name,
                type: modalType,
                unit: formData.unit,
                price: formData.price,
                description: formData.description,
                status: formData.status,
            },
            {
                onSuccess: () => {
                    toast.success(`Data ${formData.name} berhasil disimpan!`);
                    setModalOpen(false);
                    setFormData({
                        name: '',
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
    };

    return (
        <div className="w-full max-w-full space-y-6 pb-20">
            <Head title="Add-on & Biaya - Master Data" />

            {/* ── 1. BREADCRUMB & HEADER SECTION ────────────────────────────────── */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs">
                    <Link
                        href="/master-data/addons"
                        className="text-slate-500 hover:text-slate-800 transition-colors font-medium"
                    >
                        Master Data
                    </Link>
                    <span className="text-slate-400">›</span>
                    <span className="text-[#F59E0B] font-bold">Add-on &amp; Biaya</span>
                </div>

                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add-on &amp; Biaya</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Kelola semua add-on layanan (Ala Carte) dan biaya operasional project.
                    </p>
                </div>
            </div>

            {/* ── 2. TOP PILL TABS & TAMBAH BARU BUTTON ──────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Pill Tab 1: Ala Carte / Add-on Layanan */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('addon')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'addon' || activeTab === 'all'
                                ? 'bg-[#3B46F1] text-white shadow-xs'
                                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                        }`}
                    >
                        <span>Ala Carte / Add-on Layanan</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-white/20 text-white">
                            24
                        </span>
                    </button>

                    {/* Pill Tab 2: Biaya Operasional Project */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('operational')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'operational'
                                ? 'bg-[#0F172A] text-white shadow-xs'
                                : 'bg-[#0F172A] text-slate-200 hover:bg-slate-800'
                        }`}
                    >
                        <span>Biaya Operasional Project</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-800 text-slate-200 border border-slate-700">
                            12
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
                                    setModalType('addon');
                                    setFormData({
                                        name: '',
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
                                    setModalType('operational');
                                    setFormData({
                                        name: '',
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

            {/* ── 3. MAIN 2-COLUMN GRID (LEFT TABLES 8-9 COLS | RIGHT SIDEBAR 3-4 COLS) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ── LEFT COLUMN (TABLES) ────────────────────────────────────────── */}
                <div className="lg:col-span-8 space-y-6">
                    {/* ══════════════════════════════════════════════════════════════════ */}
                    {/* SECTION A: ALA CARTE / ADD-ON LAYANAN                              */}
                    {/* ══════════════════════════════════════════════════════════════════ */}
                    {(activeTab === 'all' || activeTab === 'addon') && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-3 p-5">
                            {/* Header Section A */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                <div>
                                    <h2 className="text-sm font-black text-slate-900 tracking-tight">
                                        A. Ala Carte / Add-on Layanan
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Layanan tambahan yang dapat ditambahkan ke paket utama.
                                    </p>
                                </div>

                                {/* Filters */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <select
                                        value={addonCategoryFilter}
                                        onChange={(e) => setAddonCategoryFilter(e.target.value)}
                                        className="p-1.5 px-3 text-xs bg-white rounded-xl border border-slate-200 text-slate-700 font-semibold"
                                    >
                                        <option value="all">Semua Kategori</option>
                                        <option value="Tim Tambahan">Tim Tambahan</option>
                                        <option value="Peralatan">Peralatan</option>
                                        <option value="Album">Album</option>
                                        <option value="Editing">Editing</option>
                                    </select>

                                    <select
                                        value={addonStatusFilter}
                                        onChange={(e) => setAddonStatusFilter(e.target.value)}
                                        className="p-1.5 px-3 text-xs bg-white rounded-xl border border-slate-200 text-slate-700 font-semibold"
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="active">Aktif</option>
                                        <option value="inactive">Nonaktif</option>
                                    </select>

                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1.5 p-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                                    >
                                        <Filter className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Filter</span>
                                    </button>
                                </div>
                            </div>

                            {/* Table Ala Carte */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/40 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                            <th className="py-2.5 px-3 w-8">NO</th>
                                            <th className="py-2.5 px-3">NAMA ADD-ON</th>
                                            <th className="py-2.5 px-3">KATEGORI</th>
                                            <th className="py-2.5 px-3">SATUAN</th>
                                            <th className="py-2.5 px-3">HARGA</th>
                                            <th className="py-2.5 px-3">KETERANGAN</th>
                                            <th className="py-2.5 px-3 text-center">STATUS</th>
                                            <th className="py-2.5 px-3 text-center w-16">AKSI</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-[11px] text-slate-800">
                                        {alaCarteItems.map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="py-3 px-3 text-slate-400 font-bold">{idx + 1}</td>
                                                <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                                                    {item.name}
                                                </td>
                                                <td className="py-3 px-3 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-semibold ${getBadgeClass(
                                                            item.category_name
                                                        )}`}
                                                    >
                                                        {item.category_name}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                                                    {item.unit}
                                                </td>
                                                <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap font-mono">
                                                    {formatRupiah(item.price)}
                                                </td>
                                                <td className="py-3 px-3 text-slate-500 whitespace-nowrap max-w-[200px] truncate">
                                                    {item.description}
                                                </td>
                                                <td className="py-3 px-3 text-center whitespace-nowrap">
                                                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        Aktif
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-center whitespace-nowrap relative">
                                                    <div className="flex items-center justify-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                                                >
                                                                    <MoreVertical className="w-3.5 h-3.5" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-32 bg-white rounded-xl border border-slate-200/90 shadow-xl p-1 z-50 text-xs">
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setFormData({
                                                                            name: item.name,
                                                                            category_name: item.category_name,
                                                                            unit: item.unit,
                                                                            price: item.price,
                                                                            description: item.description,
                                                                            status: item.status,
                                                                        });
                                                                        setModalType('addon');
                                                                        setModalOpen(true);
                                                                    }}
                                                                    className="px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg flex items-center gap-2 cursor-pointer focus:bg-slate-50"
                                                                >
                                                                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                                                    <span>Edit</span>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        toast.success(`Add-on "${item.name}" berhasil dihapus`);
                                                                    }}
                                                                    className="px-2.5 py-1.5 hover:bg-rose-50 text-rose-600 font-medium text-xs rounded-lg flex items-center gap-2 cursor-pointer focus:bg-rose-50 focus:text-rose-600"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
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

                            {/* Pagination Footer Section A */}
                            <Pagination
                                currentPage={addons.current_page || 1}
                                lastPage={addons.last_page || 1}
                                total={addons.total || alaCarteItems.length}
                                from={addons.from}
                                to={addons.to}
                                perPage={perPage}
                                itemLabel="add-on"
                                onPageChange={(page) => {
                                    router.get('/master-data/addons', { ...filters, page, per_page: perPage }, { preserveState: true });
                                }}
                                onPerPageChange={(newPerPage) => {
                                    setPerPage(newPerPage);
                                    router.get('/master-data/addons', { ...filters, page: 1, per_page: newPerPage }, { preserveState: true });
                                }}
                            />
                        </div>
                    )}

                    {/* ══════════════════════════════════════════════════════════════════ */}
                    {/* SECTION B: BIAYA OPERASIONAL PROJECT                               */}
                    {/* ══════════════════════════════════════════════════════════════════ */}
                    {(activeTab === 'all' || activeTab === 'operational') && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-3 p-5">
                            {/* Header Section B */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                <div>
                                    <h2 className="text-sm font-black text-slate-900 tracking-tight">
                                        B. Biaya Operasional Project
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Biaya pendukung / operasional yang terkait dengan pelaksanaan project.
                                    </p>
                                </div>

                                {/* Filters */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <select
                                        value={opsCategoryFilter}
                                        onChange={(e) => setOpsCategoryFilter(e.target.value)}
                                        className="p-1.5 px-3 text-xs bg-white rounded-xl border border-slate-200 text-slate-700 font-semibold"
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
                                        onChange={(e) => setOpsStatusFilter(e.target.value)}
                                        className="p-1.5 px-3 text-xs bg-white rounded-xl border border-slate-200 text-slate-700 font-semibold"
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="active">Aktif</option>
                                        <option value="inactive">Nonaktif</option>
                                    </select>

                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1.5 p-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                                    >
                                        <Filter className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Filter</span>
                                    </button>
                                </div>
                            </div>

                            {/* Table Operasional */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/40 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                            <th className="py-2.5 px-3 w-8">NO</th>
                                            <th className="py-2.5 px-3">NAMA BIAYA</th>
                                            <th className="py-2.5 px-3">KATEGORI</th>
                                            <th className="py-2.5 px-3">SATUAN</th>
                                            <th className="py-2.5 px-3">HARGA</th>
                                            <th className="py-2.5 px-3">KETERANGAN</th>
                                            <th className="py-2.5 px-3 text-center">STATUS</th>
                                            <th className="py-2.5 px-3 text-center w-16">AKSI</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-[11px] text-slate-800">
                                        {operationalItems.map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="py-3 px-3 text-slate-400 font-bold">{idx + 1}</td>
                                                <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                                                    {item.name}
                                                </td>
                                                <td className="py-3 px-3 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-semibold ${getBadgeClass(
                                                            item.category_name
                                                        )}`}
                                                    >
                                                        {item.category_name}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                                                    {item.unit}
                                                </td>
                                                <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap font-mono">
                                                    {formatRupiah(item.price)}
                                                </td>
                                                <td className="py-3 px-3 text-slate-500 whitespace-nowrap max-w-[200px] truncate">
                                                    {item.description}
                                                </td>
                                                <td className="py-3 px-3 text-center whitespace-nowrap">
                                                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        Aktif
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-center whitespace-nowrap">
                                                    <div className="flex items-center justify-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                                                >
                                                                    <MoreVertical className="w-3.5 h-3.5" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-32 bg-white rounded-xl border border-slate-200/90 shadow-xl p-1 z-50 text-xs">
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setFormData({
                                                                            name: item.name,
                                                                            category_name: item.category_name,
                                                                            unit: item.unit,
                                                                            price: item.price,
                                                                            description: item.description,
                                                                            status: item.status,
                                                                        });
                                                                        setModalType('operational');
                                                                        setModalOpen(true);
                                                                    }}
                                                                    className="px-2.5 py-1.5 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg flex items-center gap-2 cursor-pointer focus:bg-slate-50"
                                                                >
                                                                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                                                    <span>Edit</span>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        toast.success(`Biaya operasional "${item.name}" berhasil dihapus`);
                                                                    }}
                                                                    className="px-2.5 py-1.5 hover:bg-rose-50 text-rose-600 font-medium text-xs rounded-lg flex items-center gap-2 cursor-pointer focus:bg-rose-50 focus:text-rose-600"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
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

                            {/* Pagination Footer Section B */}
                            <Pagination
                                currentPage={addons.current_page || 1}
                                lastPage={addons.last_page || 1}
                                total={addons.total || operationalItems.length}
                                from={addons.from}
                                to={addons.to}
                                perPage={perPage}
                                itemLabel="biaya operasional"
                                onPageChange={(page) => {
                                    router.get('/master-data/addons', { ...filters, page, per_page: perPage }, { preserveState: true });
                                }}
                                onPerPageChange={(newPerPage) => {
                                    setPerPage(newPerPage);
                                    router.get('/master-data/addons', { ...filters, page: 1, per_page: newPerPage }, { preserveState: true });
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* ── RIGHT COLUMN (SIDEBAR CARDS) ────────────────────────────────── */}
                <div className="lg:col-span-4 space-y-5">
                    {/* Card 1: Informasi */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5 text-xs text-slate-600">
                        <h3 className="font-bold text-sm text-slate-900">Informasi</h3>
                        <p className="leading-relaxed">
                            Add-on &amp; Biaya digunakan saat membuat Project/Order untuk menghitung total nilai project secara detail.
                        </p>

                        <div className="space-y-1.5 pt-1">
                            <h4 className="font-bold text-slate-900">A. Ala Carte / Add-on Layanan</h4>
                            <p className="text-slate-500 leading-snug">
                                Layanan tambahan yang dapat dipilih client untuk melengkapi paket utama.
                            </p>
                            <div className="text-[11px] text-slate-500 space-y-0.5 pt-0.5 pl-2">
                                <p className="font-semibold text-slate-600">Contoh:</p>
                                <p>• Extra Photographer</p>
                                <p>• Album Upgrade</p>
                                <p>• Same Day Edit</p>
                                <p>• Drone Pilot</p>
                                <p>• Dll.</p>
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-1 border-t border-slate-100">
                            <h4 className="font-bold text-slate-900">B. Biaya Operasional Project</h4>
                            <p className="text-slate-500 leading-snug">
                                Biaya pendukung yang timbul selama pelaksanaan project, seperti transportasi, akomodasi, konsumsi, dll.
                            </p>
                            <div className="text-[11px] text-slate-500 space-y-0.5 pt-0.5 pl-2">
                                <p className="font-semibold text-slate-600">Contoh:</p>
                                <p>• Transport</p>
                                <p>• Penginapan</p>
                                <p>• Konsumsi</p>
                                <p>• Fee Personel</p>
                                <p>• Dll.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Kategori Warna */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 text-xs">
                        <h3 className="font-bold text-sm text-slate-900">Kategori Warna</h3>
                        <p className="text-slate-500 text-[11px]">
                            Label warna membantu membedakan jenis add-on dan biaya.
                        </p>

                        <div className="space-y-2 pt-1 text-[11px]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />
                                    <span className="font-semibold text-[#4F46E5]">Tim Tambahan</span>
                                </div>
                                <span className="text-slate-500">Tenaga kerja tambahan</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                                    <span className="font-semibold text-[#7C3AED]">Peralatan</span>
                                </div>
                                <span className="text-slate-500">Peralatan &amp; sewa alat</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#DB2777]" />
                                    <span className="font-semibold text-[#DB2777]">Album</span>
                                </div>
                                <span className="text-slate-500">Album &amp; cetakan</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#0891B2]" />
                                    <span className="font-semibold text-[#0891B2]">Editing</span>
                                </div>
                                <span className="text-slate-500">Layanan editing</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#DB2777]" />
                                    <span className="font-semibold text-[#DB2777]">Transportasi</span>
                                </div>
                                <span className="text-slate-500">Biaya transportasi</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                                    <span className="font-semibold text-[#0284C7]">Akomodasi</span>
                                </div>
                                <span className="text-slate-500">Biaya penginapan</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#0891B2]" />
                                    <span className="font-semibold text-[#0891B2]">Konsumsi</span>
                                </div>
                                <span className="text-slate-500">Biaya konsumsi</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                                    <span className="font-semibold text-[#D97706]">Fee Personel</span>
                                </div>
                                <span className="text-slate-500">Fee kru / personel</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#059669]" />
                                    <span className="font-semibold text-[#059669]">Lokasi</span>
                                </div>
                                <span className="text-slate-500">Biaya izin / lokasi</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#059669]" />
                                    <span className="font-semibold text-[#059669]">Lainnya</span>
                                </div>
                                <span className="text-slate-500">Biaya lainnya</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                                    {modalType === 'addon'
                                        ? 'Tambah Add-on Layanan (Ala Carte)'
                                        : 'Tambah Biaya Operasional Project'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
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
                                        onClick={() => setModalOpen(false)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
