import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Box,
    CheckCircle2,
    MinusCircle,
    Tag,
    Plus,
    Search,
    Download,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    X,
    ImageIcon,
} from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';

interface PackageItem {
    id: number | string;
    code?: string;
    name: string;
    category_id?: number | string;
    category?: { id: number; name: string; color?: string };
    service_type?: string;
    base_price?: number;
    price?: number;
    duration_hours?: number | string;
    benefits?: string[];
    description?: string;
    status?: string;
    thumbnail?: string;
}

interface Stats {
    total?: number;
    active?: number;
    inactive?: number;
    total_categories?: number;
}

interface PackagesIndexProps {
    packages?: {
        data: PackageItem[];
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

const CATEGORY_BADGES: Record<string, string> = {
    Wedding: 'bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100',
    Prewedding: 'bg-[#FDF2F8] text-[#DB2777] border border-pink-100',
    Newborn: 'bg-[#ECFEFF] text-[#0891B2] border border-cyan-100',
    Family: 'bg-[#ECFDF5] text-[#059669] border border-emerald-100',
    Maternity: 'bg-[#FFFBEB] text-[#D97706] border border-amber-100',
    Birthday: 'bg-[#F5F3FF] text-[#7C3AED] border border-purple-100',
    Event: 'bg-[#FFF7ED] text-[#EA580C] border border-orange-100',
};

// Fallback images for demo
const DEMO_IMAGES: Record<string, string> = {
    'Wedding Basic': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=150&auto=format&fit=crop&q=80',
    'Wedding Premium': 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=150&auto=format&fit=crop&q=80',
    'Prewedding Standard': 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=150&auto=format&fit=crop&q=80',
    'Newborn Package': 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=150&auto=format&fit=crop&q=80',
    'Family Session': 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=150&auto=format&fit=crop&q=80',
};

export default function PackagesIndex({
    packages = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0 },
    categories = [],
    stats = { total: 18, active: 16, inactive: 2, total_categories: 8 },
    filters = {},
}: PackagesIndexProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [serviceFilter, setServiceFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<PackageItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [form, setForm] = useState({
        name: '',
        category_id: categories?.[0]?.id || '',
        base_price: 4500000,
        duration_hours: 6,
        description: '',
        status: 'active',
    });

    // Demo packages matching Screenshot 3
    const demoPackages: PackageItem[] = useMemo(() => [
        {
            id: 1,
            code: 'PKT-WED-001',
            name: 'Wedding Basic',
            category: { id: 1, name: 'Wedding' },
            service_type: 'Photography',
            price: 4500000,
            duration_hours: '6 jam',
            benefits: ['1 Photographer', '300+ Foto (edit)', 'File Digital (Cloud)'],
            status: 'active',
            thumbnail: DEMO_IMAGES['Wedding Basic'],
        },
        {
            id: 2,
            code: 'PKT-WED-002',
            name: 'Wedding Premium',
            category: { id: 1, name: 'Wedding' },
            service_type: 'Photography + Videography',
            price: 8500000,
            duration_hours: '8 jam',
            benefits: ['1 Photographer + 1 Videographer', '500+ Foto & Video (edit)', 'Flashdisk + Box', 'File Digital (Cloud)'],
            status: 'active',
            thumbnail: DEMO_IMAGES['Wedding Premium'],
        },
        {
            id: 3,
            code: 'PKT-PRE-001',
            name: 'Prewedding Standard',
            category: { id: 2, name: 'Prewedding' },
            service_type: 'Photography',
            price: 3500000,
            duration_hours: '3-4 jam',
            benefits: ['1 Photographer', '150+ Foto (edit)', '2 Lokasi', 'File Digital (Cloud)'],
            status: 'active',
            thumbnail: DEMO_IMAGES['Prewedding Standard'],
        },
        {
            id: 4,
            code: 'PKT-NEW-001',
            name: 'Newborn Package',
            category: { id: 5, name: 'Newborn' },
            service_type: 'Photography',
            price: 2750000,
            duration_hours: '2-3 jam',
            benefits: ['1 Photographer', '100+ Foto (edit)', 'Properti Newborn', 'File Digital (Cloud)'],
            status: 'active',
            thumbnail: DEMO_IMAGES['Newborn Package'],
        },
        {
            id: 5,
            code: 'PKT-FAM-001',
            name: 'Family Session',
            category: { id: 3, name: 'Family' },
            service_type: 'Photography',
            price: 2250000,
            duration_hours: '2-3 jam',
            benefits: ['1 Photographer', '100+ Foto (edit)', '1 Lokasi', 'File Digital (Cloud)'],
            status: 'active',
            thumbnail: DEMO_IMAGES['Family Session'],
        },
    ], []);

    const rawData = packages.data && packages.data.length > 0 ? packages.data : demoPackages;

    const filteredData = useMemo(() => {
        return rawData.filter((pkg) => {
            const catName = pkg.category?.name || '';
            const srvType = pkg.service_type || 'Photography';

            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchName = pkg.name.toLowerCase().includes(q);
                const matchCat = catName.toLowerCase().includes(q);
                const matchCode = (pkg.code || '').toLowerCase().includes(q);
                if (!matchName && !matchCat && !matchCode) return false;
            }
            if (categoryFilter !== 'all' && catName !== categoryFilter) return false;
            if (serviceFilter !== 'all' && !srvType.includes(serviceFilter)) return false;
            if (statusFilter !== 'all') {
                if (statusFilter === 'active' && pkg.status !== 'active') return false;
                if (statusFilter === 'inactive' && pkg.status === 'active') return false;
            }
            return true;
        });
    }, [rawData, searchQuery, categoryFilter, serviceFilter, statusFilter]);

    const handleOpenCreate = () => {
        setEditItem(null);
        setForm({
            name: '',
            category_id: categories?.[0]?.id || '',
            base_price: 4500000,
            duration_hours: 6,
            description: '',
            status: 'active',
        });
        setModalOpen(true);
    };

    const handleOpenEdit = (item: PackageItem) => {
        setEditItem(item);
        setForm({
            name: item.name,
            category_id: item.category_id || categories?.[0]?.id || '',
            base_price: item.base_price || item.price || 4500000,
            duration_hours: typeof item.duration_hours === 'number' ? item.duration_hours : 6,
            description: item.description || '',
            status: item.status || 'active',
        });
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (editItem) {
            router.put(`/master-data/packages/${editItem.id}`, form, {
                onSuccess: () => {
                    setModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: () => setIsSubmitting(false),
            });
        } else {
            router.post('/master-data/packages', form, {
                onSuccess: () => {
                    setModalOpen(false);
                    setIsSubmitting(false);
                },
                onError: () => setIsSubmitting(false),
            });
        }
    };

    const handleDelete = (id: number | string) => {
        if (confirm('Yakin ingin menghapus paket ini?')) {
            router.delete(`/master-data/packages/${id}`);
        }
    };

    // Export CSV
    const handleExport = () => {
        const rows = [
            ['No', 'Nama Paket', 'Kode', 'Kategori', 'Jenis Layanan', 'Harga (IDR)', 'Durasi', 'Status'],
            ...filteredData.map((p, i) => [
                i + 1,
                p.name,
                p.code || '-',
                p.category?.name || '-',
                p.service_type || 'Photography',
                p.base_price || p.price || 0,
                p.duration_hours || '-',
                p.status === 'active' ? 'Aktif' : 'Nonaktif',
            ]),
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Paket_Harga_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 pb-20">
            <Head title="Paket & Harga - Master Data" />

            {/* ── 1. BREADCRUMB & HEADER ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Link href="/master-data/packages" className="hover:text-primary-accent transition-colors">
                            Master Data
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-primary-accent font-semibold">Paket & Harga</span>
                    </nav>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Paket & Harga</h1>
                    <p className="text-xs text-slate-500">
                        Kelola paket layanan, harga, dan benefit yang ditawarkan untuk setiap kategori project.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Paket
                </button>
            </div>

            {/* ── 2. TOP 4 STAT CARDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Paket */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center shrink-0">
                        <Box className="w-6 h-6 text-[#4F46E5]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Total Paket</span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                            {stats.total || 18}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Semua paket</p>
                    </div>
                </div>

                {/* Card 2: Paket Aktif */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Paket Aktif</span>
                        <h2 className="text-2xl font-black text-[#059669] tracking-tight font-sans">
                            {stats.active || 16}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Sedang digunakan</p>
                    </div>
                </div>

                {/* Card 3: Paket Nonaktif */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] flex items-center justify-center shrink-0">
                        <MinusCircle className="w-6 h-6 text-[#EF4444]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Paket Nonaktif</span>
                        <h2 className="text-2xl font-black text-[#DC2626] tracking-tight font-sans">
                            {stats.inactive ?? 2}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Tidak digunakan</p>
                    </div>
                </div>

                {/* Card 4: Total Kategori Project */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] flex items-center justify-center shrink-0">
                        <Tag className="w-6 h-6 text-[#EA580C]" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-slate-600 block">Total Kategori Project</span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                            {stats.total_categories || 8}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium">Kategori project</p>
                    </div>
                </div>
            </div>

            {/* ── 3. TABLE CARD CONTAINER ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2.5 flex-1">
                        {/* Search Input */}
                        <div className="relative min-w-[220px] max-w-sm flex-1">
                            <input
                                type="text"
                                placeholder="Cari nama paket, kategori, atau jenis layanan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-3.5 pr-9 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
                            />
                            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* Kategori Filter */}
                        <div className="relative min-w-[130px]">
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                            >
                                <option value="all">Semua Kategori</option>
                                <option value="Wedding">Wedding</option>
                                <option value="Prewedding">Prewedding</option>
                                <option value="Newborn">Newborn</option>
                                <option value="Family">Family</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* Layanan Filter */}
                        <div className="relative min-w-[140px]">
                            <select
                                value={serviceFilter}
                                onChange={(e) => setServiceFilter(e.target.value)}
                                className="w-full appearance-none pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                            >
                                <option value="all">Semua Jenis Layanan</option>
                                <option value="Photography">Photography</option>
                                <option value="Videography">Videography</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* Status Filter */}
                        <div className="relative min-w-[120px]">
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
                                <th className="py-3 px-4">NAMA PAKET</th>
                                <th className="py-3 px-4">KATEGORI PROJECT</th>
                                <th className="py-3 px-4">JENIS LAYANAN</th>
                                <th className="py-3 px-4">HARGA (IDR)</th>
                                <th className="py-3 px-4">DURASI</th>
                                <th className="py-3 px-4">BENEFIT UTAMA</th>
                                <th className="py-3 px-4 text-center">STATUS</th>
                                <th className="py-3 px-4 text-center">AKSI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.length > 0 ? (
                                filteredData.map((pkg, idx) => {
                                    const catName = pkg.category?.name || 'Wedding';
                                    const catBadge = CATEGORY_BADGES[catName] || 'bg-slate-50 text-slate-600 border-slate-200';
                                    const imgUrl = pkg.thumbnail || DEMO_IMAGES[pkg.name] || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=150&auto=format&fit=crop&q=80';
                                    const isActive = pkg.status === 'active';
                                    const priceVal = pkg.base_price || pkg.price || 0;

                                    return (
                                        <tr key={pkg.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-slate-400">
                                                {idx + 1}
                                            </td>

                                            {/* Nama Paket + Photo Thumbnail + Code */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={imgUrl}
                                                        alt={pkg.name}
                                                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                                                    />
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 text-xs">{pkg.name}</h4>
                                                        <span className="text-[10.5px] font-semibold text-slate-400 font-mono">
                                                            {pkg.code || `PKT-00${pkg.id}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Kategori Project */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${catBadge}`}>
                                                    {catName}
                                                </span>
                                            </td>

                                            {/* Jenis Layanan */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-blue-100">
                                                    {pkg.service_type || 'Photography'}
                                                </span>
                                            </td>

                                            {/* Harga (IDR) */}
                                            <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                                                {formatRupiah(priceVal)}
                                            </td>

                                            {/* Durasi */}
                                            <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                                                {pkg.duration_hours || '6 jam'}
                                            </td>

                                            {/* Benefit Utama */}
                                            <td className="py-3.5 px-4 text-[11px] text-slate-600">
                                                {pkg.benefits && pkg.benefits.length > 0 ? (
                                                    <ul className="space-y-0.5 font-medium">
                                                        {pkg.benefits.map((b, bIdx) => (
                                                            <li key={bIdx} className="flex items-center gap-1.5 whitespace-nowrap">
                                                                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                                                <span>{b}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
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

                                            {/* Aksi */}
                                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(pkg)}
                                                        className="w-8 h-8 rounded-lg border border-slate-200 hover:border-indigo-300 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-colors cursor-pointer"
                                                        title="Edit Paket"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(pkg.id)}
                                                        className="w-8 h-8 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
                                                        title="Hapus Paket"
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
                                        <p className="text-xs font-semibold text-slate-600">Tidak ada paket yang sesuai.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 sm:px-5 flex items-center justify-between border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500 font-medium">
                    <span>
                        Menampilkan 1 - {filteredData.length} dari {stats.total || 18} paket
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
                        <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 font-semibold flex items-center justify-center text-xs hover:bg-slate-100">
                            3
                        </button>
                        <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 font-semibold flex items-center justify-center text-xs hover:bg-slate-100">
                            4
                        </button>
                        <button type="button" className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100">
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── 4. MODAL: TAMBAH / EDIT PAKET ── */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-base font-black text-slate-900">
                                {editItem ? 'Edit Paket Layanan' : 'Tambah Paket Layanan'}
                            </h3>
                            <button type="button" onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Nama Paket <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Contoh: Wedding Basic, Prewedding Gold"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                                    <select
                                        value={form.category_id}
                                        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                    >
                                        {categories && categories.length > 0 ? (
                                            categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="1">Wedding</option>
                                                <option value="2">Prewedding</option>
                                                <option value="3">Family</option>
                                                <option value="4">Newborn</option>
                                            </>
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Harga (IDR)</label>
                                    <input
                                        type="number"
                                        required
                                        value={form.base_price}
                                        onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Durasi (Jam)</label>
                                    <input
                                        type="number"
                                        value={form.duration_hours}
                                        onChange={(e) => setForm({ ...form, duration_hours: Number(e.target.value) })}
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
                                <label className="block font-bold text-slate-700 mb-1">Deskripsi & Benefit</label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Rincian benefit (pisahkan dengan koma atau baris baru)..."
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
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Paket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
