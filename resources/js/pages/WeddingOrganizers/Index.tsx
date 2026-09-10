import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    HeartHandshake,
    Sparkles,
    Briefcase,
    Building2,
    Plus,
    Search,
    Phone,
    Mail,
    Instagram,
    MapPin,
    Edit2,
    Trash2,
    ExternalLink,
    MessageCircle,
    Award,
    X,
    Filter,
    Percent,
    CreditCard,
    FileText,
    CheckCircle2,
    Clock,
    UserCheck,
} from 'lucide-react';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    TableEmpty,
    Badge,
    Pagination,
    AlertConfirmation,
} from '@/components/ui';

interface WeddingOrganizerItem {
    id: string;
    name: string;
    pic_name?: string;
    phone?: string;
    secondary_phone?: string;
    email?: string;
    instagram?: string;
    city?: string;
    address?: string;
    commission_rate?: number | string;
    tier?: 'platinum' | 'gold' | 'silver' | 'bronze' | string;
    status: 'active' | 'partner' | 'lead' | 'inactive' | string;
    notes?: string;
    avatar?: string;
    bank_name?: string;
    bank_account_number?: string;
    bank_account_holder?: string;
    projects_count?: number;
    created_at?: string;
}

interface WeddingOrganizersProps {
    weddingOrganizers: {
        data: WeddingOrganizerItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    stats: {
        total: number;
        active_count: number;
        partner_count: number;
        lead_count: number;
        total_projects_count: number;
    };
    cities: string[];
    filters: {
        search: string;
        status: string;
        tier: string;
        city: string;
        sort: string;
        order: string;
    };
}

export default function WeddingOrganizersIndex({
    weddingOrganizers,
    stats,
    cities = [],
    filters,
}: WeddingOrganizersProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [tierFilter, setTierFilter] = useState(filters.tier || 'all');
    const [cityFilter, setCityFilter] = useState(filters.city || 'all');

    const [modalOpen, setModalOpen] = useState(false);
    const [editWo, setEditWo] = useState<WeddingOrganizerItem | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id?: string; name?: string }>({
        isOpen: false,
    });

    const [form, setForm] = useState({
        name: '',
        pic_name: '',
        phone: '',
        secondary_phone: '',
        email: '',
        instagram: '',
        city: '',
        address: '',
        commission_rate: 10,
        tier: 'silver',
        status: 'active',
        bank_name: '',
        bank_account_number: '',
        bank_account_holder: '',
        notes: '',
    });

    const handleFilter = () => {
        router.get(
            '/wedding-organizer',
            {
                search: search || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                tier: tierFilter !== 'all' ? tierFilter : undefined,
                city: cityFilter !== 'all' ? cityFilter : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleResetFilter = () => {
        setSearch('');
        setStatusFilter('all');
        setTierFilter('all');
        setCityFilter('all');
        router.get('/wedding-organizer', {}, { preserveState: true });
    };

    const openCreate = () => {
        setEditWo(null);
        setForm({
            name: '',
            pic_name: '',
            phone: '',
            secondary_phone: '',
            email: '',
            instagram: '',
            city: '',
            address: '',
            commission_rate: 10,
            tier: 'silver',
            status: 'active',
            bank_name: '',
            bank_account_number: '',
            bank_account_holder: '',
            notes: '',
        });
        setModalOpen(true);
    };

    const openEdit = (wo: WeddingOrganizerItem) => {
        setEditWo(wo);
        setForm({
            name: wo.name || '',
            pic_name: wo.pic_name || '',
            phone: wo.phone || '',
            secondary_phone: wo.secondary_phone || '',
            email: wo.email || '',
            instagram: wo.instagram || '',
            city: wo.city || '',
            address: wo.address || '',
            commission_rate: Number(wo.commission_rate) || 0,
            tier: wo.tier || 'silver',
            status: wo.status || 'active',
            bank_name: wo.bank_name || '',
            bank_account_number: wo.bank_account_number || '',
            bank_account_holder: wo.bank_account_holder || '',
            notes: wo.notes || '',
        });
        setModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editWo) {
            router.put(`/wedding-organizers/${editWo.id}`, form, {
                onSuccess: () => {
                    setModalOpen(false);
                    setEditWo(null);
                    toast.success('Data Wedding Organizer berhasil diperbarui.');
                },
                onError: (err) => {
                    const firstErr = Object.values(err)[0];
                    toast.error(typeof firstErr === 'string' ? firstErr : 'Gagal menyimpan perubahan.');
                },
            });
        } else {
            router.post('/wedding-organizers', form, {
                onSuccess: () => {
                    setModalOpen(false);
                    toast.success('Wedding Organizer baru berhasil ditambahkan.');
                },
                onError: (err) => {
                    const firstErr = Object.values(err)[0];
                    toast.error(typeof firstErr === 'string' ? firstErr : 'Gagal menambahkan WO.');
                },
            });
        }
    };

    const handleDelete = () => {
        if (!confirmDelete.id) return;
        router.delete(`/wedding-organizers/${confirmDelete.id}`, {
            onSuccess: () => {
                setConfirmDelete({ isOpen: false });
                toast.success('Wedding Organizer berhasil dihapus.');
            },
            onError: () => {
                toast.error('Gagal menghapus data WO.');
            },
        });
    };

    const getTierBadge = (tier?: string) => {
        switch (tier) {
            case 'platinum':
                return {
                    label: 'Platinum WO',
                    className: 'bg-purple-100 text-purple-700 border-purple-200',
                };
            case 'gold':
                return {
                    label: 'Gold WO',
                    className: 'bg-amber-100 text-amber-800 border-amber-200',
                };
            case 'silver':
                return {
                    label: 'Silver WO',
                    className: 'bg-slate-100 text-slate-700 border-slate-200',
                };
            case 'bronze':
                return {
                    label: 'Bronze WO',
                    className: 'bg-orange-100 text-orange-800 border-orange-200',
                };
            default:
                return {
                    label: 'Regular',
                    className: 'bg-slate-100 text-slate-700 border-slate-200',
                };
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'partner':
                return (
                    <Badge variant="active" size="sm" withDot>
                        Partner Resmi
                    </Badge>
                );
            case 'active':
                return (
                    <Badge variant="info" size="sm" withDot>
                        Aktif
                    </Badge>
                );
            case 'lead':
                return (
                    <Badge variant="warning" size="sm" withDot>
                        Calon Partner
                    </Badge>
                );
            case 'inactive':
            default:
                return (
                    <Badge variant="outline" size="sm" withDot>
                        Nonaktif
                    </Badge>
                );
        }
    };

    return (
        <div className="w-full max-w-full space-y-4 pb-2">
            <Head title="Wedding Organizer (WO) - Arams Photography" />

            {/* Header Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <span>Data Wedding Organizer (WO)</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C89445]/10 text-[#C89445] border border-[#C89445]/20">
                            Partner Vendor
                        </span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Kelola data wedding planner, koordinator acara, kontak PIC, dan riwayat kolaborasi project studio.
                    </p>
                </div>

                <div>
                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-accent text-white rounded-xl text-xs font-bold shadow-md shadow-black/10 transition-all hover:scale-[1.02] cursor-pointer"
                    >
                        <Plus className="w-4 h-4 text-white" />
                        <span>Tambah WO Partner</span>
                    </button>
                </div>
            </div>

            {/* Stat Cards Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 text-[#C89445] flex items-center justify-center shrink-0 border border-amber-100">
                        <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Total WO Terdaftar
                        </span>
                        <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                            {stats.total} <span className="text-xs font-semibold text-slate-400">Vendor</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Partner Resmi
                        </span>
                        <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                            {stats.partner_count} <span className="text-xs font-semibold text-emerald-600">Terverifikasi</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Kolaborasi Project
                        </span>
                        <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                            {stats.total_projects_count} <span className="text-xs font-semibold text-blue-600">Event</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                        <Award className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Calon Partner / Lead
                        </span>
                        <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                            {stats.lead_count} <span className="text-xs font-semibold text-purple-600">Prospek</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="w-full md:w-80 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                        placeholder="Cari nama WO, PIC, kota, telp, instagram..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#C89445] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#C89445]/20 outline-hidden transition-all font-medium"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2.5 text-xs w-full md:w-auto justify-start md:justify-end">
                    {/* Status Dropdown */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-medium">Status:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                router.get(
                                    '/wedding-organizer',
                                    {
                                        search: search || undefined,
                                        status: e.target.value !== 'all' ? e.target.value : undefined,
                                        tier: tierFilter !== 'all' ? tierFilter : undefined,
                                        city: cityFilter !== 'all' ? cityFilter : undefined,
                                    },
                                    { preserveState: true }
                                );
                            }}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:border-[#C89445] outline-hidden cursor-pointer"
                        >
                            <option value="all">Semua Status</option>
                            <option value="partner">Partner Resmi</option>
                            <option value="active">Aktif</option>
                            <option value="lead">Calon Partner (Lead)</option>
                            <option value="inactive">Nonaktif</option>
                        </select>
                    </div>

                    {/* Tier Dropdown */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-medium">Tier:</span>
                        <select
                            value={tierFilter}
                            onChange={(e) => {
                                setTierFilter(e.target.value);
                                router.get(
                                    '/wedding-organizer',
                                    {
                                        search: search || undefined,
                                        status: statusFilter !== 'all' ? statusFilter : undefined,
                                        tier: e.target.value !== 'all' ? e.target.value : undefined,
                                        city: cityFilter !== 'all' ? cityFilter : undefined,
                                    },
                                    { preserveState: true }
                                );
                            }}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:border-[#C89445] outline-hidden cursor-pointer"
                        >
                            <option value="all">Semua Tier</option>
                            <option value="platinum">Platinum</option>
                            <option value="gold">Gold</option>
                            <option value="silver">Silver</option>
                            <option value="bronze">Bronze</option>
                        </select>
                    </div>

                    {/* City Dropdown */}
                    {cities.length > 0 && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-medium">Kota:</span>
                            <select
                                value={cityFilter}
                                onChange={(e) => {
                                    setCityFilter(e.target.value);
                                    router.get(
                                        '/wedding-organizer',
                                        {
                                            search: search || undefined,
                                            status: statusFilter !== 'all' ? statusFilter : undefined,
                                            tier: tierFilter !== 'all' ? tierFilter : undefined,
                                            city: e.target.value !== 'all' ? e.target.value : undefined,
                                        },
                                        { preserveState: true }
                                    );
                                }}
                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:border-[#C89445] outline-hidden cursor-pointer"
                            >
                                <option value="all">Semua Kota</option>
                                {cities.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {(search || statusFilter !== 'all' || tierFilter !== 'all' || cityFilter !== 'all') && (
                        <button
                            type="button"
                            onClick={handleResetFilter}
                            className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Wedding Organizers Main Table Container */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                {/* 1. Desktop View */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-slate-100 bg-slate-50/70">
                                <TableHead className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    NAMA WO & VENDOR
                                </TableHead>
                                <TableHead className="px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    PIC & KONTAK
                                </TableHead>
                                <TableHead className="px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    KOTA & ALAMAT
                                </TableHead>
                                <TableHead className="px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    PROJECT
                                </TableHead>
                                <TableHead className="px-4 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    STATUS
                                </TableHead>
                                <TableHead className="px-6 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    AKSI
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {weddingOrganizers.data && weddingOrganizers.data.length > 0 ? (
                                weddingOrganizers.data.map((wo) => {
                                    const tierMeta = getTierBadge(wo.tier);
                                    const cleanPhone = wo.phone?.replace(/[^0-9]/g, '') || '';
                                    const waNumber = cleanPhone.startsWith('0')
                                        ? '62' + cleanPhone.slice(1)
                                        : cleanPhone;

                                    return (
                                        <TableRow key={wo.id} className="hover:bg-slate-50/80 transition-colors">
                                            {/* Column: Nama WO */}
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-[#C89445] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                                                        {wo.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-slate-900 text-sm">
                                                                {wo.name}
                                                            </span>
                                                            <span
                                                                className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${tierMeta.className}`}
                                                            >
                                                                {tierMeta.label}
                                                            </span>
                                                        </div>
                                                        {wo.instagram && (
                                                            <a
                                                                href={`https://instagram.com/${wo.instagram.replace('@', '')}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 text-xs text-[#C89445] hover:underline font-semibold mt-0.5"
                                                            >
                                                                <Instagram className="w-3 h-3" />
                                                                <span>{wo.instagram}</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Column: PIC & Kontak */}
                                            <TableCell className="px-4 py-4">
                                                <div className="space-y-1">
                                                    <div className="font-semibold text-slate-900 text-xs">
                                                        {wo.pic_name || '-'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        {wo.phone && (
                                                            <a
                                                                href={`https://wa.me/${waNumber}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-mono font-medium hover:underline"
                                                                title="Chat WhatsApp"
                                                            >
                                                                <MessageCircle className="w-3.5 h-3.5" />
                                                                <span>{wo.phone}</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                    {wo.email && (
                                                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                                                            {wo.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Column: Kota & Alamat */}
                                            <TableCell className="px-4 py-4">
                                                <div className="space-y-0.5">
                                                    <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-800">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span>{wo.city || '-'}</span>
                                                    </div>
                                                    {wo.address && (
                                                        <p className="text-[11px] text-slate-500 line-clamp-1 max-w-[200px]" title={wo.address}>
                                                            {wo.address}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Column: Project */}
                                            <TableCell className="px-4 py-4">
                                                <Link
                                                    href={`/projects?search=${encodeURIComponent(wo.name)}`}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors"
                                                >
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    <span>{wo.projects_count || 0} Project</span>
                                                </Link>
                                            </TableCell>

                                            {/* Column: Status */}
                                            <TableCell className="px-4 py-4">
                                                {getStatusBadge(wo.status)}
                                            </TableCell>

                                            {/* Column: Aksi */}
                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {wo.phone && (
                                                        <a
                                                            href={`https://wa.me/${waNumber}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                            title="WhatsApp PIC"
                                                        >
                                                            <MessageCircle className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(wo)}
                                                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                                                        title="Edit Data WO"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setConfirmDelete({
                                                                isOpen: true,
                                                                id: wo.id,
                                                                name: wo.name,
                                                            })
                                                        }
                                                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                                                        title="Hapus Data WO"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableEmpty
                                    colSpan={7}
                                    message="Belum ada data Wedding Organizer"
                                    description="Klik tombol 'Tambah WO Partner' di atas untuk mendaftarkan partner vendor baru."
                                />
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* 2. Mobile View Cards */}
                <div className="md:hidden divide-y divide-slate-100">
                    {weddingOrganizers.data && weddingOrganizers.data.length > 0 ? (
                        weddingOrganizers.data.map((wo) => {
                            const tierMeta = getTierBadge(wo.tier);
                            const cleanPhone = wo.phone?.replace(/[^0-9]/g, '') || '';
                            const waNumber = cleanPhone.startsWith('0')
                                ? '62' + cleanPhone.slice(1)
                                : cleanPhone;

                            return (
                                <div key={wo.id} className="p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-[#C89445] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                                                {wo.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm">
                                                    {wo.name}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${tierMeta.className}`}>
                                                        {tierMeta.label}
                                                    </span>
                                                    {getStatusBadge(wo.status)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(wo)}
                                                className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setConfirmDelete({
                                                        isOpen: true,
                                                        id: wo.id,
                                                        name: wo.name,
                                                    })
                                                }
                                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                PIC & Kontak
                                            </span>
                                            <span className="font-semibold text-slate-800 block mt-0.5">
                                                {wo.pic_name || '-'}
                                            </span>
                                            {wo.phone && (
                                                <span className="text-slate-500 font-mono text-[11px] block mt-0.5">
                                                    {wo.phone}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Kota / Wilayah
                                            </span>
                                            <span className="font-semibold text-slate-800 block mt-0.5">
                                                {wo.city || '-'}
                                            </span>
                                            <span className="text-[11px] text-blue-600 font-bold block mt-0.5">
                                                {wo.projects_count || 0} Kolaborasi Project
                                            </span>
                                        </div>
                                    </div>

                                    {/* Mobile Bottom Bar */}
                                    <div className="flex items-center justify-between pt-1">
                                        {wo.instagram && (
                                            <a
                                                href={`https://instagram.com/${wo.instagram.replace('@', '')}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-[#C89445] font-semibold hover:underline"
                                            >
                                                <Instagram className="w-3.5 h-3.5" />
                                                <span>{wo.instagram}</span>
                                            </a>
                                        )}

                                        {wo.phone && (
                                            <a
                                                href={`https://wa.me/${waNumber}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors ml-auto"
                                            >
                                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>Hubungi WhatsApp</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center text-slate-400 text-xs">
                            Belum ada data Wedding Organizer yang sesuai filter.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {weddingOrganizers.total > 0 && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                        <Pagination
                            currentPage={weddingOrganizers.current_page}
                            lastPage={weddingOrganizers.last_page}
                            total={weddingOrganizers.total}
                            from={weddingOrganizers.from}
                            to={weddingOrganizers.to}
                            itemLabel="wedding organizer"
                            onPageChange={(page) => {
                                router.get(
                                    '/wedding-organizer',
                                    {
                                        page,
                                        search: search || undefined,
                                        status: statusFilter !== 'all' ? statusFilter : undefined,
                                        tier: tierFilter !== 'all' ? tierFilter : undefined,
                                        city: cityFilter !== 'all' ? cityFilter : undefined,
                                    },
                                    { preserveState: true }
                                );
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Modal Tambah / Edit Wedding Organizer */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 my-8">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {editWo ? 'Edit Data Wedding Organizer' : 'Tambah Wedding Organizer Baru'}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Daftarkan vendor partner wedding organizer untuk kolaborasi project studio.
                                </p>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4 pt-4">
                            {/* Row 1: Nama & PIC */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Nama Wedding Organizer *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Contoh: Kalyana Wedding Planner"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-[#C89445] outline-hidden font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Nama PIC / Koordinator
                                    </label>
                                    <input
                                        type="text"
                                        value={form.pic_name}
                                        onChange={(e) => setForm({ ...form, pic_name: e.target.value })}
                                        placeholder="Contoh: Riana Pratiwi"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-[#C89445] outline-hidden font-medium"
                                    />
                                </div>
                            </div>

                            {/* Row 2: Phone & Secondary Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Nomor Telepon / WhatsApp *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="081288991234"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-[#C89445] outline-hidden font-mono font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Telepon Kantor / Alternatif
                                    </label>
                                    <input
                                        type="text"
                                        value={form.secondary_phone}
                                        onChange={(e) => setForm({ ...form, secondary_phone: e.target.value })}
                                        placeholder="021-7890123"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-[#C89445] outline-hidden font-mono"
                                    />
                                </div>
                            </div>

                            {/* Row 3: Email & Instagram */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="contact@kalyanawedding.com"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-[#C89445] outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Akun Instagram
                                    </label>
                                    <input
                                        type="text"
                                        value={form.instagram}
                                        onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                                        placeholder="@kalyanawedding"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-[#C89445] outline-hidden font-medium"
                                    />
                                </div>
                            </div>

                            {/* Row 4: Kota, Tier, Status */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Kota / Wilayah
                                    </label>
                                    <input
                                        type="text"
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                        placeholder="Jakarta Selatan"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-[#C89445] outline-hidden"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Tier Kemitraan
                                    </label>
                                    <select
                                        value={form.tier}
                                        onChange={(e) => setForm({ ...form, tier: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-[#C89445] outline-hidden cursor-pointer"
                                    >
                                        <option value="platinum">Platinum</option>
                                        <option value="gold">Gold</option>
                                        <option value="silver">Silver</option>
                                        <option value="bronze">Bronze</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Status Partner
                                    </label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-[#C89445] outline-hidden cursor-pointer"
                                    >
                                        <option value="partner">Partner Resmi</option>
                                        <option value="active">Aktif</option>
                                        <option value="lead">Calon Partner (Lead)</option>
                                        <option value="inactive">Nonaktif</option>
                                    </select>
                                </div>
                            </div>

                            {/* Row 5: Alamat Lengkap */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Alamat Kantor / Studio WO
                                </label>
                                <textarea
                                    rows={2}
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    placeholder="Jl. Kemang Raya No. 45B, Bangka, Mampang Prapatan..."
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-[#C89445] outline-hidden resize-none"
                                />
                            </div>

                            {/* Row 6: Catatan Kerjasama */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Catatan Kemitraan / Terms Kerjasama
                                </label>
                                <textarea
                                    rows={2}
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Spesialisasi paket wedding ballroom, kesepakatan kerjasama vendor..."
                                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-[#C89445] outline-hidden resize-none"
                                />
                            </div>

                            {/* Submit & Cancel Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-primary-accent text-white shadow-md cursor-pointer"
                                >
                                    {editWo ? 'Perbarui Data WO' : 'Simpan Data WO'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <AlertConfirmation
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false })}
                onConfirm={handleDelete}
                variant="danger"
                title="Hapus Data Wedding Organizer"
                description={
                    <span>
                        Apakah Anda yakin ingin menghapus partner Wedding Organizer{' '}
                        <strong>{confirmDelete.name}</strong>? Data riwayat kolaborasi akan tetap tersimpan.
                    </span>
                }
                confirmText="Ya, Hapus WO"
                cancelText="Batal"
            />
        </div>
    );
}
