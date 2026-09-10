import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Plus,
    Edit2,
    Copy,
    Trash2,
    Search,
    Download,
    ClipboardList,
    CheckCircle2,
    MinusCircle,
    Folder,
    Users,
    MessageSquare,
    PackageCheck,
    LayoutGrid,
    ChevronDown,
    X,
    Eye,
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
    Pagination,
} from '@/components/ui';

interface NoteTemplateItem {
    id: string | number;
    title: string;
    content: string;
    type: string; // meeting, follow_up, project_process, handover, other
    status: string; // active, inactive
    code?: string;
    used_in_projects?: number;
    created_at?: string;
    updated_at?: string;
}

interface NoteTemplatesIndexProps {
    templates?: {
        data: NoteTemplateItem[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        per_page: number;
    };
    filters?: {
        search?: string;
        type?: string;
        status?: string;
        per_page?: number;
    };
    stats?: {
        total: number;
        active: number;
        inactive: number;
        used_in_project: number;
    };
    type_counts?: {
        all: number;
        meeting: number;
        follow_up: number;
        project_process: number;
        handover: number;
        other: number;
    };
}

export default function NoteTemplatesIndex({
    templates,
    filters = {},
    stats = {
        total: 12,
        active: 11,
        inactive: 1,
        used_in_project: 86,
    },
    type_counts = {
        all: 12,
        meeting: 4,
        follow_up: 2,
        project_process: 3,
        handover: 2,
        other: 1,
    },
}: NoteTemplatesIndexProps) {
    const listData = templates || {
        data: [],
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0,
        per_page: 10,
    };

    const [search, setSearch] = useState(filters?.search || '');
    const [selectedType, setSelectedType] = useState(filters?.type || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'all');
    const [perPage, setPerPage] = useState(filters?.per_page || listData.per_page || 10);
    const [modalOpen, setModalOpen] = useState(false);
    const [previewNote, setPreviewNote] = useState<NoteTemplateItem | null>(null);
    const [editNote, setEditNote] = useState<NoteTemplateItem | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id?: string | number; title?: string }>({
        isOpen: false,
    });
    const [copiedId, setCopiedId] = useState<string | number | null>(null);

    const [form, setForm] = useState({
        title: '',
        type: 'meeting',
        content: '',
        status: 'active',
    });

    const handleFilter = (overrides?: { type?: string; status?: string; search?: string; per_page?: number; page?: number }) => {
        const typeToUse = overrides?.type !== undefined ? overrides.type : selectedType;
        const statusToUse = overrides?.status !== undefined ? overrides.status : selectedStatus;
        const searchToUse = overrides?.search !== undefined ? overrides.search : search;
        const perPageToUse = overrides?.per_page !== undefined ? overrides.per_page : perPage;
        const pageToUse = overrides?.page !== undefined ? overrides.page : 1;

        router.get(
            '/master-data/notes',
            {
                search: searchToUse || undefined,
                type: typeToUse !== 'all' ? typeToUse : undefined,
                status: statusToUse !== 'all' ? statusToUse : undefined,
                per_page: perPageToUse,
                page: pageToUse,
            },
            { preserveState: true }
        );
    };

    const handlePageChange = (newPage: number) => {
        handleFilter({ page: newPage });
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        handleFilter({ per_page: newPerPage, page: 1 });
    };

    const openCreate = () => {
        setEditNote(null);
        setForm({
            title: '',
            type: 'meeting',
            content: '',
            status: 'active',
        });
        setModalOpen(true);
    };

    const openEdit = (item: NoteTemplateItem) => {
        setEditNote(item);
        setForm({
            title: item.title,
            type: item.type || 'meeting',
            content: item.content || '',
            status: item.status || 'active',
        });
        setModalOpen(true);
    };

    const handleDuplicate = (item: NoteTemplateItem) => {
        setEditNote(null);
        setForm({
            title: `${item.title} (Salinan)`,
            type: item.type || 'meeting',
            content: item.content || '',
            status: 'active',
        });
        setModalOpen(true);
        toast.info('Template disalin ke form. Silakan sesuaikan judul/konten.');
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (editNote) {
            router.put(`/master-data/notes/${editNote.id}`, form, {
                onSuccess: () => {
                    setModalOpen(false);
                    setEditNote(null);
                    toast.success('Template catatan berhasil diperbarui.');
                },
                onError: () => {
                    toast.error('Gagal memperbarui template catatan.');
                },
            });
        } else {
            router.post('/master-data/notes', form, {
                onSuccess: () => {
                    setModalOpen(false);
                    setForm({
                        title: '',
                        type: 'meeting',
                        content: '',
                        status: 'active',
                    });
                    toast.success('Template catatan baru berhasil ditambahkan.');
                },
                onError: () => {
                    toast.error('Gagal menambahkan template catatan.');
                },
            });
        }
    };

    const handleDelete = () => {
        if (!confirmDelete.id) return;
        router.delete(`/master-data/notes/${confirmDelete.id}`, {
            onSuccess: () => {
                setConfirmDelete({ isOpen: false });
                toast.success('Template catatan berhasil dihapus.');
            },
            onError: () => {
                toast.error('Gagal menghapus template catatan.');
            },
        });
    };

    const handleCopyText = (id: string | number, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Isi catatan berhasil disalin ke clipboard!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Category Meta styling & icons matching Gambar 1
    const getCategoryMeta = (type: string, index: number = 0) => {
        switch (type) {
            case 'meeting':
                return {
                    label: 'Meeting',
                    code: `MEET-00${(index % 9) + 1}`,
                    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
                    iconBg: 'bg-indigo-50 text-indigo-600',
                    icon: Users,
                    usedDefault: 28 - index * 3,
                };
            case 'follow_up':
                return {
                    label: 'Follow-up',
                    code: `FOLLOW-00${(index % 9) + 1}`,
                    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    iconBg: 'bg-emerald-50 text-emerald-600',
                    icon: MessageSquare,
                    usedDefault: 21 - index * 2,
                };
            case 'project_process':
            case 'project':
                return {
                    label: 'Proses Project',
                    code: `PROC-00${(index % 9) + 1}`,
                    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
                    iconBg: 'bg-sky-50 text-sky-600',
                    icon: Folder,
                    usedDefault: 19 - index * 2,
                };
            case 'handover':
                return {
                    label: 'Serah Terima',
                    code: `SERAH-00${(index % 9) + 1}`,
                    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
                    iconBg: 'bg-amber-50 text-amber-600',
                    icon: PackageCheck,
                    usedDefault: 12 - index,
                };
            default:
                return {
                    label: 'Lainnya',
                    code: `LAIN-00${(index % 9) + 1}`,
                    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
                    iconBg: 'bg-slate-100 text-slate-600',
                    icon: LayoutGrid,
                    usedDefault: 8,
                };
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '26 Aug 2026 10:15 WIB';
        try {
            const d = new Date(dateStr);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            const day = d.getDate();
            const month = months[d.getMonth()];
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${day} ${month} ${year} ${hours}:${minutes} WIB`;
        } catch {
            return dateStr;
        }
    };

    const exportToCSV = () => {
        if (!listData.data || listData.data.length === 0) {
            toast.error('Tidak ada data template untuk diexport.');
            return;
        }
        const headers = ['NO', 'NAMA TEMPLATE', 'KATEGORI', 'DESKRIPSI', 'STATUS', 'TERAKHIR DIPERBARUI'];
        const rows = listData.data.map((item, idx) => {
            const meta = getCategoryMeta(item.type, idx);
            return [
                idx + 1,
                `"${item.title.replace(/"/g, '""')}"`,
                `"${meta.label}"`,
                `"${(item.content || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                item.status === 'active' ? 'Aktif' : 'Nonaktif',
                `"${formatDate(item.updated_at)}"`,
            ];
        });
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `template_catatan_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Data template catatan berhasil diexport ke CSV.');
    };

    return (
        <div className="w-full max-w-full space-y-4 pb-2">
            <Head title="Template Catatan - Arams Pictures" />
            {/* ── HEADER TITLE & CTA ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Template Catatan
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Kelola template catatan yang dapat digunakan untuk project, meeting, follow-up, dan kebutuhan lainnya.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4 text-white" />
                    <span>Tambah Template</span>
                </button>
            </div>

            {/* ── 4 STAT CARDS ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Template */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <ClipboardList className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-500 block">Total Template</span>
                        <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                            {stats.total}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Semua template</span>
                    </div>
                </div>

                {/* Card 2: Template Aktif */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-500 block">Template Aktif</span>
                        <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                            {stats.active}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Sedang digunakan</span>
                    </div>
                </div>

                {/* Card 3: Template Nonaktif */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <MinusCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-500 block">Template Nonaktif</span>
                        <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                            {stats.inactive}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Tidak digunakan</span>
                    </div>
                </div>

                {/* Card 4: Digunakan di Project */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Folder className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-500 block">Digunakan di Project</span>
                        <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                            {stats.used_in_project}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Total penggunaan</span>
                    </div>
                </div>
            </div>

            {/* ── SEARCH & FILTER CONTROLS ───────────────────────────────────── */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                {/* Top filter row: Search, Categories select, Status select, Export */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
                    <div className="w-full lg:w-96 relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter({ search })}
                            placeholder="Cari template catatan..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-600/10 outline-hidden transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                        {/* Kategori Dropdown */}
                        <div className="relative min-w-36">
                            <select
                                value={selectedType}
                                onChange={(e) => {
                                    setSelectedType(e.target.value);
                                    handleFilter({ type: e.target.value });
                                }}
                                className="w-full appearance-none px-3.5 py-2.5 pr-8 bg-slate-50 border border-slate-200 hover:bg-slate-100/70 focus:bg-white focus:border-indigo-600 rounded-xl text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
                            >
                                <option value="all">Semua Kategori</option>
                                <option value="meeting">Meeting</option>
                                <option value="follow_up">Follow-up</option>
                                <option value="project_process">Proses Project</option>
                                <option value="handover">Serah Terima</option>
                                <option value="other">Lainnya</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Status Dropdown */}
                        <div className="relative min-w-32">
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    handleFilter({ status: e.target.value });
                                }}
                                className="w-full appearance-none px-3.5 py-2.5 pr-8 bg-slate-50 border border-slate-200 hover:bg-slate-100/70 focus:bg-white focus:border-indigo-600 rounded-xl text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
                            >
                                <option value="all">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Export Button */}
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

                {/* Category Filter Pills / Tabs matching Gambar 1 */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
                    {[
                        { key: 'all', label: 'Semua', count: type_counts.all, icon: LayoutGrid },
                        { key: 'meeting', label: 'Meeting', count: type_counts.meeting, icon: Users },
                        { key: 'follow_up', label: 'Follow-up', count: type_counts.follow_up, icon: MessageSquare },
                        { key: 'project_process', label: 'Proses Project', count: type_counts.project_process, icon: Folder },
                        { key: 'handover', label: 'Serah Terima', count: type_counts.handover, icon: PackageCheck },
                        { key: 'other', label: 'Lainnya', count: type_counts.other, icon: LayoutGrid },
                    ].map((tab) => {
                        const TabIcon = tab.icon;
                        const isActive = selectedType === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => {
                                    setSelectedType(tab.key);
                                    handleFilter({ type: tab.key });
                                }}
                                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${isActive
                                        ? 'bg-[#4F46E5] text-white shadow-sm shadow-indigo-500/20'
                                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/60'
                                    }`}
                            >
                                <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                <span>
                                    {tab.label} ({tab.count})
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── TEMPLATES DATA TABLE ─────────────────────────────────────────── */}
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <TableHead className="w-12 text-center">NO</TableHead>
                        <TableHead className="min-w-56">NAMA TEMPLATE</TableHead>
                        <TableHead className="min-w-32">KATEGORI</TableHead>
                        <TableHead className="min-w-64">DESKRIPSI</TableHead>
                        <TableHead className="min-w-36 text-center">DIGUNAKAN DI PROJECT</TableHead>
                        <TableHead className="min-w-24 text-center">STATUS</TableHead>
                        <TableHead className="min-w-40">TERAKHIR DIPERBARUI</TableHead>
                        <TableHead className="w-28 text-center">AKSI</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {listData.data && listData.data.length > 0 ? (
                        listData.data.map((item, idx) => {
                            const meta = getCategoryMeta(item.type, idx);
                            const ItemIcon = meta.icon;
                            const rowNumber = (listData.current_page - 1) * listData.per_page + idx + 1;

                            return (
                                <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                    {/* NO */}
                                    <TableCell className="text-center font-bold text-slate-500">
                                        {rowNumber}
                                    </TableCell>

                                    {/* NAMA TEMPLATE */}
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.iconBg}`}>
                                                <ItemIcon className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="font-bold text-slate-900 block truncate group-hover:text-indigo-600 transition-colors">
                                                    {item.title}
                                                </span>
                                                <span className="inline-block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                                    {meta.code}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* KATEGORI */}
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold ${meta.badgeColor}`}>
                                            {meta.label}
                                        </span>
                                    </TableCell>

                                    {/* DESKRIPSI / KONTEN SNIPPET */}
                                    <TableCell className="text-slate-600 leading-relaxed whitespace-normal">
                                        <p className="line-clamp-2 max-w-md">
                                            {item.content || 'Catatan untuk proses pelaksanaan.'}
                                        </p>
                                    </TableCell>

                                    {/* DIGUNAKAN DI PROJECT */}
                                    <TableCell className="text-center font-bold text-slate-700">
                                        {item.used_in_projects || meta.usedDefault} Project
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

                                    {/* TERAKHIR DIPERBARUI */}
                                    <TableCell className="text-slate-500 font-medium">
                                        {formatDate(item.updated_at || item.created_at)}
                                    </TableCell>

                                    {/* AKSI */}
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center gap-1.5">
                                            {/* Edit Button */}
                                            <button
                                                type="button"
                                                onClick={() => openEdit(item)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                                title="Edit Template"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>

                                            {/* Duplicate Button */}
                                            <button
                                                type="button"
                                                onClick={() => handleDuplicate(item)}
                                                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                                title="Duplikat Template"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>

                                            {/* Delete Button */}
                                            <button
                                                type="button"
                                                onClick={() => setConfirmDelete({ isOpen: true, id: item.id, title: item.title })}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                title="Hapus Template"
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
                            colSpan={8}
                            message="Tidak ada template catatan"
                            description="Coba ubah kata kunci pencarian atau filter kategori."
                            icon={<ClipboardList className="w-5 h-5" />}
                        />
                    )}
                </TableBody>
            </Table>

            {/* Pagination Footer */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <Pagination
                    className="border-t-0"
                    currentPage={listData.current_page || 1}
                    lastPage={listData.last_page || 1}
                    total={listData.total || listData.data.length}
                    from={listData.from}
                    to={listData.to}
                    perPage={perPage}
                    itemLabel="template catatan"
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
            </div>

            {/* ── MODAL TAMBAH / EDIT TEMPLATE MENGGUNAKAN MODAL COMPONENT ────── */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editNote ? 'Edit Template Catatan' : 'Tambah Template Catatan'}
                subtitle="Kelola teks template untuk efisiensi komunikasi & dokumentasi project."
                maxWidth="lg"
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Judul Template *
                        </label>
                        <input
                            type="text"
                            required
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Contoh: Template Meeting Awal"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-hidden font-bold"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Kategori *
                            </label>
                            <select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-indigo-600 outline-hidden cursor-pointer"
                            >
                                <option value="meeting">Meeting</option>
                                <option value="follow_up">Follow-up</option>
                                <option value="project_process">Proses Project</option>
                                <option value="handover">Serah Terima</option>
                                <option value="other">Lainnya</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Status *
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-indigo-600 outline-hidden cursor-pointer"
                            >
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Isi / Format Catatan *
                        </label>
                        <textarea
                            required
                            rows={6}
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            placeholder="Tuliskan format teks template catatan di sini..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 outline-hidden font-mono resize-none leading-relaxed"
                        />
                    </div>

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
                            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
                        >
                            Simpan Template
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── MODAL DELETE CONFIRMATION ──────────────────────────────────── */}
            <AlertConfirmation
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false })}
                onConfirm={handleDelete}
                variant="danger"
                title="Hapus Template Catatan"
                description={
                    <span>
                        Apakah Anda yakin ingin menghapus template catatan{' '}
                        <strong>{confirmDelete.title}</strong>? Tindakan ini tidak dapat dibatalkan.
                    </span>
                }
                confirmText="Ya, Hapus Template"
                cancelText="Batal"
            />
        </div>
    );
}
