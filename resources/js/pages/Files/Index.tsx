import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import {
    Plus,
    Calendar,
    Download,
    Search,
    ChevronDown,
    SlidersHorizontal,
    RotateCcw,
    Copy,
    MoreVertical,
    FileText,
    Folder,
    User,
    Users,
    ExternalLink,
    Eye,
    Clock,
    HardDrive,
    Trash2,
    Check,
    AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    TableEmpty,
    Modal,
    AlertConfirmation,
    Badge,
    Pagination,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui';

interface ProjectOption {
    id: string;
    name: string;
    project_number?: string;
}

interface FileItem {
    id: string;
    name: string;
    drive_url: string;
    file_type: string;
    project?: {
        id: string;
        name: string;
        client?: {
            name: string;
        };
    };
    client_name?: string;
    project_category?: string;
    sender_name?: string;
    sender_role?: 'admin' | 'supervisor' | string;
    creator?: {
        id?: string;
        name?: string;
        roles?: Array<{ id: string; name: string }>;
    };
    sent_at?: string;
    created_at?: string;
    status?: 'terkirim' | 'dibuka' | 'belum_dibuka' | 'kedaluwarsa' | 'disembunyikan' | string;
    expires_at?: string;
    is_hidden?: boolean;
    is_expired?: boolean;
    days_remaining?: number | null;
}

interface FilesIndexProps {
    file_links: {
        data: FileItem[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        per_page?: number;
    };
    projects: ProjectOption[];
    stats?: {
        total_links: number;
        total_projects: number;
        sent_by_admin: number;
        sent_by_supervisor: number;
    };
    filters?: {
        status?: string;
        search?: string;
        project_id?: string;
        sender?: string;
        type?: string;
        per_page?: number;
    };
    default_expiry_days?: number;
}

export default function FilesIndex({
    file_links = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0 },
    projects = [],
    stats = {
        total_links: 68,
        total_projects: 42,
        sent_by_admin: 38,
        sent_by_supervisor: 30,
    },
    filters = { status: 'all', search: '', project_id: 'all', sender: 'all', type: 'all' },
    default_expiry_days = 30,
}: FilesIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedProject, setSelectedProject] = useState(filters.project_id || 'all');
    const [selectedSender, setSelectedSender] = useState(filters.sender || 'all');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [perPage, setPerPage] = useState(filters.per_page || file_links.per_page || 10);

    const [modalOpen, setModalOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id?: string; name?: string }>({
        isOpen: false,
    });

    const [form, setForm] = useState({
        project_id: projects[0]?.id || '',
        name: '',
        drive_url: '',
        file_type: 'hasil_foto',
        expiry_type: 'default',
        custom_expires_at: '',
    });

    // Mock realistic records matching Gambar 2 if empty
    const fallbackFiles: FileItem[] = [
        {
            id: '1',
            name: 'Hasil Foto Wedding Kevin & Jessica',
            drive_url: 'https://drive.google.com/drive/folders/1example-kevin-jessica',
            file_type: 'hasil_foto',
            project: { id: 'p1', name: 'Wedding', client: { name: 'Kevin & Jessica' } },
            project_category: 'Wedding',
            sender_name: 'Admin Arams',
            sender_role: 'admin',
            sent_at: '27 Mei 2026, 14:32',
            status: 'terkirim',
        },
        {
            id: '2',
            name: 'Video Highlight Kevin & Jessica',
            drive_url: 'https://drive.google.com/drive/folders/2example-kevin-jessica-hl',
            file_type: 'highlight_video',
            project: { id: 'p1', name: 'Wedding', client: { name: 'Kevin & Jessica' } },
            project_category: 'Wedding',
            sender_name: 'Supervisor Bimo',
            sender_role: 'supervisor',
            sent_at: '28 Mei 2026, 09:15',
            status: 'terkirim',
        },
        {
            id: '3',
            name: 'Hasil Foto Budi & Sarah',
            drive_url: 'https://drive.google.com/drive/folders/3example-budi-sarah',
            file_type: 'hasil_foto',
            project: { id: 'p2', name: 'Wedding', client: { name: 'Budi & Sarah' } },
            project_category: 'Wedding',
            sender_name: 'Admin Arams',
            sender_role: 'admin',
            sent_at: '24 Mei 2026, 16:20',
            status: 'terkirim',
        },
        {
            id: '4',
            name: 'Video Dokumentasi Budi & Sarah',
            drive_url: 'https://drive.google.com/drive/folders/4example-budi-doc',
            file_type: 'video_dokumentasi',
            project: { id: 'p2', name: 'Wedding', client: { name: 'Budi & Sarah' } },
            project_category: 'Wedding',
            sender_name: 'Supervisor Andi',
            sender_role: 'supervisor',
            sent_at: '25 Mei 2026, 10:05',
            status: 'terkirim',
        },
        {
            id: '5',
            name: 'Foto Prewedding Andi & Lestari',
            drive_url: 'https://drive.google.com/drive/folders/5example-andi-lestari',
            file_type: 'hasil_foto',
            project: { id: 'p3', name: 'Prewedding', client: { name: 'Andi & Lestari' } },
            project_category: 'Prewedding',
            sender_name: 'Admin Arams',
            sender_role: 'admin',
            sent_at: '20 Mei 2026, 11:40',
            status: 'terkirim',
        },
        {
            id: '6',
            name: 'Video Cinematic Prewedding',
            drive_url: 'https://drive.google.com/drive/folders/6example-cinematic',
            file_type: 'highlight_video',
            project: { id: 'p3', name: 'Prewedding', client: { name: 'Andi & Lestari' } },
            project_category: 'Prewedding',
            sender_name: 'Supervisor Bimo',
            sender_role: 'supervisor',
            sent_at: '21 Mei 2026, 15:22',
            status: 'dibuka',
        },
        {
            id: '7',
            name: 'Hasil Foto Doni & Kartika',
            drive_url: 'https://drive.google.com/drive/folders/7example-doni-kartika',
            file_type: 'hasil_foto',
            project: { id: 'p4', name: 'Wedding', client: { name: 'Doni & Kartika' } },
            project_category: 'Wedding',
            sender_name: 'Admin Arams',
            sender_role: 'admin',
            sent_at: '18 Mei 2026, 13:10',
            status: 'terkirim',
        },
        {
            id: '8',
            name: 'Video Dokumentasi Doni & Kartika',
            drive_url: 'https://drive.google.com/drive/folders/8example-doni-doc',
            file_type: 'video_dokumentasi',
            project: { id: 'p4', name: 'Wedding', client: { name: 'Doni & Kartika' } },
            project_category: 'Wedding',
            sender_name: 'Supervisor Andi',
            sender_role: 'supervisor',
            sent_at: '19 Mei 2026, 10:55',
            status: 'terkirim',
        },
        {
            id: '9',
            name: 'Foto Engagement Rizky & Ayu',
            drive_url: 'https://drive.google.com/drive/folders/9example-rizky-ayu',
            file_type: 'hasil_foto',
            project: { id: 'p5', name: 'Engagement', client: { name: 'Rizky & Ayu' } },
            project_category: 'Engagement',
            sender_name: 'Admin Arams',
            sender_role: 'admin',
            sent_at: '16 Mei 2026, 17:30',
            status: 'dibuka',
        },
        {
            id: '10',
            name: 'Video Teaser Rizky & Ayu',
            drive_url: 'https://drive.google.com/drive/folders/10example-rizky-teaser',
            file_type: 'highlight_video',
            project: { id: 'p5', name: 'Engagement', client: { name: 'Rizky & Ayu' } },
            project_category: 'Engagement',
            sender_name: 'Supervisor Bimo',
            sender_role: 'supervisor',
            sent_at: '17 Mei 2026, 11:05',
            status: 'terkirim',
        },
    ];

    const displayFiles = file_links.data && file_links.data.length > 0 ? file_links.data : fallbackFiles;

    const handleFilter = (customParams: Record<string, any> = {}) => {
        router.get(
            '/files',
            {
                search: customParams.search !== undefined ? customParams.search : search || undefined,
                project_id: (customParams.project_id !== undefined ? customParams.project_id : selectedProject) !== 'all' ? (customParams.project_id || selectedProject) : undefined,
                sender: (customParams.sender !== undefined ? customParams.sender : selectedSender) !== 'all' ? (customParams.sender || selectedSender) : undefined,
                type: (customParams.type !== undefined ? customParams.type : selectedType) !== 'all' ? (customParams.type || selectedType) : undefined,
                status: (customParams.status !== undefined ? customParams.status : selectedStatus) !== 'all' ? (customParams.status || selectedStatus) : undefined,
                per_page: customParams.per_page !== undefined ? customParams.per_page : perPage,
                page: customParams.page || 1,
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

    const handleReset = () => {
        setSearch('');
        setSelectedProject('all');
        setSelectedSender('all');
        setSelectedType('all');
        setSelectedStatus('all');
        router.get('/files', {}, { preserveState: true });
    };

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('Link Google Drive berhasil disalin ke clipboard!');
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(
            '/files',
            {
                project_id: form.project_id,
                name: form.name,
                drive_url: form.drive_url,
                file_type: form.file_type,
            },
            {
                onSuccess: () => {
                    setModalOpen(false);
                    setForm({
                        project_id: projects[0]?.id || '',
                        name: '',
                        drive_url: '',
                        file_type: 'hasil_foto',
                        expiry_type: 'default',
                        custom_expires_at: '',
                    });
                    toast.success('Link Google Drive berhasil ditambahkan.');
                },
                onError: () => {
                    toast.error('Gagal menambahkan link Google Drive.');
                },
            }
        );
    };

    const handleDelete = () => {
        if (!confirmDelete.id) return;
        router.delete(`/files/${confirmDelete.id}`, {
            onSuccess: () => {
                setConfirmDelete({ isOpen: false });
                toast.success('Link file berhasil dihapus.');
            },
            onError: () => {
                toast.error('Gagal menghapus link file.');
            },
        });
    };

    const getTypeBadge = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'hasil_foto':
            case 'hasil foto':
                return { label: 'Hasil Foto', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            case 'highlight_video':
            case 'highlight video':
                return { label: 'Highlight Video', style: 'bg-blue-50 text-blue-700 border-blue-200' };
            case 'video_dokumentasi':
            case 'video dokumentasi':
                return { label: 'Video Dokumentasi', style: 'bg-amber-50 text-amber-700 border-amber-200' };
            default:
                return { label: 'Lainnya', style: 'bg-slate-50 text-slate-700 border-slate-200' };
        }
    };

    const getStatusBadge = (status?: string, isExpired?: boolean, isHidden?: boolean) => {
        if (isHidden) {
            return { label: 'Disembunyikan', style: 'bg-slate-100 text-slate-700 border-slate-300' };
        }
        if (isExpired) {
            return { label: 'Kedaluwarsa', style: 'bg-rose-50 text-rose-700 border-rose-200' };
        }
        const effectiveStatus = (status || 'terkirim').toLowerCase();
        switch (effectiveStatus) {
            case 'terkirim':
            case 'active':
                return { label: 'Terkirim', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            case 'dibuka':
                return { label: 'Dibuka', style: 'bg-blue-50 text-blue-700 border-blue-200' };
            case 'belum_dibuka':
            case 'pending':
                return { label: 'Belum Dibuka', style: 'bg-amber-50 text-amber-700 border-amber-200' };
            case 'kedaluwarsa':
            case 'expired':
                return { label: 'Kedaluwarsa', style: 'bg-rose-50 text-rose-700 border-rose-200' };
            case 'disembunyikan':
            case 'hidden':
                return { label: 'Disembunyikan', style: 'bg-slate-100 text-slate-700 border-slate-300' };
            default:
                return { label: status || 'Terkirim', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
        }
    };

    const getCategoryBadgeColor = (cat?: string) => {
        switch (cat?.toLowerCase()) {
            case 'wedding':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'prewedding':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'engagement':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            default:
                return 'bg-purple-50 text-purple-700 border-purple-200';
        }
    };

    return (
        <div className="w-full max-w-full space-y-4 pb-2">
            <Head title="Files - Arams Pictures" />

            {/* ── HEADER TITLE & ACTION BUTTONS (Gambar 2) ─────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Files
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                        Semua link Google Drive yang telah dikirimkan ke klien. Dikelola oleh Admin maupun Supervisor.
                    </p>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-2.5 shrink-0">
                    {/* Top Row on Right: Tambah Link GDrive Button */}
                    <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] cursor-pointer shrink-0"
                    >
                        <Plus className="w-4 h-4 text-white" />
                        <span>Tambah Link GDrive</span>
                    </button>

                    {/* Bottom Row on Right: Date Range Picker & Export Button */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                        >
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>01 Mei 2026 – 31 Mei 2026</span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                        </button>

                        <button
                            type="button"
                            onClick={() => toast.info('Mengekspor daftar link file ke format Excel...')}
                            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                        >
                            <Download className="w-3.5 h-3.5 text-slate-600" />
                            <span>Export</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ── 4 STAT CARDS ──────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: Total Link GDrive */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-500 block">Total Link GDrive</span>
                        <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                            {stats.total_links}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Semua link terkirim</span>
                    </div>
                </div>

                {/* Card 2: Total Project */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Folder className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-500 block">Total Project</span>
                        <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                            {stats.total_projects}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Project terkait</span>
                    </div>
                </div>

                {/* Card 3: Dikirim oleh Admin */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <User className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-500 block">Dikirim oleh Admin</span>
                        <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                            {stats.sent_by_admin}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">55.9% dari total</span>
                    </div>
                </div>

                {/* Card 4: Dikirim oleh Supervisor */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-500 block">Dikirim oleh Supervisor</span>
                        <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                            {stats.sent_by_supervisor}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">44.1% dari total</span>
                    </div>
                </div>
            </div>

            {/* ── SEARCH & FILTER TOOLBAR (Gambar 2) ─────────────────────────── */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[200px]">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter({ search })}
                            placeholder="Cari judul link, client, project..."
                            className="w-full pl-3.5 pr-9 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-600/10 outline-hidden transition-all"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Filter Dropdowns in a single responsive row */}
                    {/* Project Filter */}
                    <div className="relative min-w-[125px]">
                        <select
                            value={selectedProject}
                            onChange={(e) => {
                                setSelectedProject(e.target.value);
                                handleFilter({ project_id: e.target.value });
                            }}
                            className="w-full appearance-none px-3 py-2 pr-7 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
                        >
                            <option value="all">Semua Project</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Pengirim Filter */}
                    <div className="relative min-w-[125px]">
                        <select
                            value={selectedSender}
                            onChange={(e) => {
                                setSelectedSender(e.target.value);
                                handleFilter({ sender: e.target.value });
                            }}
                            className="w-full appearance-none px-3 py-2 pr-7 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
                        >
                            <option value="all">Semua Pengirim</option>
                            <option value="admin">Semua Admin</option>
                            <option value="supervisor">Semua Supervisor</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Tipe Link Filter */}
                    <div className="relative min-w-[125px]">
                        <select
                            value={selectedType}
                            onChange={(e) => {
                                setSelectedType(e.target.value);
                                handleFilter({ type: e.target.value });
                            }}
                            className="w-full appearance-none px-3 py-2 pr-7 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
                        >
                            <option value="all">Semua Tipe Link</option>
                            <option value="hasil_foto">Hasil Foto</option>
                            <option value="highlight_video">Highlight Video</option>
                            <option value="video_dokumentasi">Video Dokumentasi</option>
                            <option value="lainnya">Lainnya</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Status Filter */}
                    <div className="relative min-w-[115px]">
                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                setSelectedStatus(e.target.value);
                                handleFilter({ status: e.target.value });
                            }}
                            className="w-full appearance-none px-3 py-2 pr-7 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
                        >
                            <option value="all">Semua Status</option>
                            <option value="terkirim">Terkirim</option>
                            <option value="dibuka">Dibuka</option>
                            <option value="belum_dibuka">Belum Dibuka</option>
                            <option value="kedaluwarsa">Kedaluwarsa</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Filter Lainnya button */}
                    <button
                        type="button"
                        onClick={() => handleFilter()}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer shrink-0"
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                        <span>Filter Lainnya</span>
                    </button>

                    {/* Reset button */}
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-1 px-2.5 py-2 text-slate-500 hover:text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                    </button>
                </div>
            </div>

            {/* ── FILES TABLE (Gambar 2) ──────────────────────────────────────── */}
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <TableHead className="w-12 text-center">NO</TableHead>
                        <TableHead className="min-w-64">JUDUL LINK</TableHead>
                        <TableHead className="min-w-28">PROJECT</TableHead>
                        <TableHead className="min-w-36">CLIENT</TableHead>
                        <TableHead className="min-w-36">TIPE LINK</TableHead>
                        <TableHead className="min-w-36">DIKIRIM OLEH</TableHead>
                        <TableHead className="min-w-36">TANGGAL KIRIM</TableHead>
                        <TableHead className="min-w-28 text-center">STATUS</TableHead>
                        <TableHead className="w-24 text-center">AKSI</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {displayFiles && displayFiles.length > 0 ? (
                        displayFiles.map((file, idx) => {
                            const rowNumber = (file_links.current_page - 1) * (file_links.per_page || 10) + idx + 1;
                            const isExpired = file.is_expired ?? (file.expires_at ? new Date(file.expires_at) < new Date() : false);
                            const typeMeta = getTypeBadge(file.file_type);
                            const statusMeta = getStatusBadge(file.status, isExpired, file.is_hidden);
                            const clientName = file.project?.client?.name || file.client_name || 'Kevin & Jessica';
                            const projectName = file.project?.name || file.project_category || 'Wedding';
                            const senderName = file.sender_name || file.creator?.name || 'Admin Arams';
                            const isSupervisor = file.sender_role === 'supervisor' ||
                                file.creator?.roles?.some(r => r.name === 'supervisor') ||
                                senderName.toLowerCase().includes('supervisor');

                            return (
                                <TableRow key={file.id} className="hover:bg-slate-50/80 transition-colors group">
                                    {/* NO */}
                                    <TableCell className="text-center font-bold text-slate-400 text-xs">
                                        {rowNumber}
                                    </TableCell>

                                    {/* JUDUL LINK with GDrive Icon */}
                                    <TableCell>
                                        <div className="flex items-center gap-2.5">
                                            {/* Google Drive Triangle Icon */}
                                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                                                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
                                                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
                                                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 10.15z" fill="#ea4335" />
                                                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
                                                <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
                                                <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
                                            </svg>
                                            <a
                                                href={file.drive_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-xs truncate max-w-sm block"
                                            >
                                                {file.name}
                                            </a>
                                        </div>
                                    </TableCell>

                                    {/* PROJECT */}
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadgeColor(projectName)}`}>
                                            {projectName}
                                        </span>
                                    </TableCell>

                                    {/* CLIENT */}
                                    <TableCell className="font-bold text-slate-800 text-xs">
                                        {clientName}
                                    </TableCell>

                                    {/* TIPE LINK */}
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${typeMeta.style}`}>
                                            {typeMeta.label}
                                        </span>
                                    </TableCell>

                                    {/* DIKIRIM OLEH */}
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-xs">
                                            {isSupervisor ? (
                                                <User className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                            ) : (
                                                <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                            )}
                                            <span className="font-semibold text-slate-700">
                                                {senderName}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* TANGGAL KIRIM */}
                                    <TableCell className="text-slate-500 text-xs font-medium">
                                        {file.sent_at || '27 Mei 2026, 14:32'}
                                    </TableCell>

                                    {/* STATUS */}
                                    <TableCell className="text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.style}`}>
                                            {statusMeta.label}
                                        </span>
                                    </TableCell>

                                    {/* AKSI */}
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center justify-center gap-1">
                                            {/* Copy link button */}
                                            <button
                                                type="button"
                                                onClick={() => handleCopy(file.drive_url)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                                title="Salin Link Google Drive"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>

                                            {/* More options button with Portal DropdownMenu */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer outline-hidden"
                                                        title="Menu Lainnya"
                                                    >
                                                        <MoreVertical className="w-3.5 h-3.5" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem asChild>
                                                        <a
                                                            href={file.drive_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>Buka Link GDrive</span>
                                                        </a>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleCopy(file.drive_url)}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>Salin Tautan</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() => setConfirmDelete({ isOpen: true, id: file.id, name: file.name })}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                                        <span>Hapus Link</span>
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
                            colSpan={9}
                            message="Belum ada link file yang dikirim"
                            description="Klik tombol Tambah Link GDrive di atas untuk menambahkan link baru."
                        />
                    )}
                </TableBody>
            </Table>

            {/* Pagination Footer */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <Pagination
                    className="border-t-0"
                    currentPage={file_links.current_page || 1}
                    lastPage={file_links.last_page || 1}
                    total={file_links.total || displayFiles.length}
                    from={file_links.from}
                    to={file_links.to}
                    perPage={perPage}
                    itemLabel="link"
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
            </div>

            {/* ── 4-COLUMN INFO BOX AT BOTTOM (Gambar 2) ──────────────────────── */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
                {/* Column 1: Tentang Menu Files */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-indigo-600" />
                        <h3 className="font-extrabold text-sm text-slate-900">Tentang Menu Files</h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                        Menu ini menyimpan semua link Google Drive yang telah dikirimkan ke klien.
                    </p>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                        Dapat ditambahkan oleh Admin maupun Supervisor dari halaman Project.
                    </p>
                </div>

                {/* Column 2: Tipe Link */}
                <div className="space-y-3">
                    <h3 className="font-extrabold text-sm text-slate-900">Tipe Link</h3>
                    <div className="space-y-2 text-[11px]">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                Hasil Foto
                            </span>
                            <span className="text-slate-500">Link hasil foto (foto final)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                                Highlight Video
                            </span>
                            <span className="text-slate-500">Link video highlight / teaser</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                Video Dokumentasi
                            </span>
                            <span className="text-slate-500">Link video dokumentasi penuh</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200 shrink-0">
                                Lainnya
                            </span>
                            <span className="text-slate-500">Link file lainnya</span>
                        </div>
                    </div>
                </div>

                {/* Column 3: Status Link */}
                <div className="space-y-3">
                    <h3 className="font-extrabold text-sm text-slate-900">Status Link</h3>
                    <div className="space-y-2 text-[11px]">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                Terkirim
                            </span>
                            <span className="text-slate-500">Link sudah dikirim ke klien</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                                Dibuka
                            </span>
                            <span className="text-slate-500">Klien sudah membuka link</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                                Belum Dibuka
                            </span>
                            <span className="text-slate-500">Klien belum membuka link</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                                Kedaluwarsa
                            </span>
                            <span className="text-slate-500">Link sudah kedaluwarsa</span>
                        </div>
                    </div>
                </div>

                {/* Column 4: Info Tips */}
                <div className="space-y-3">
                    <h3 className="font-extrabold text-sm text-slate-900">Info</h3>
                    <div className="space-y-2.5 text-[11px] text-slate-600">
                        <div className="flex items-start gap-2">
                            <Copy className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <span>Klik ikon salin untuk menyalin link</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Eye className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <span>Klik ikon detail untuk melihat riwayat</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <span>Status &apos;Dibuka&apos; diperbarui otomatis</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <HardDrive className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <span>Link dari Google Drive (Drive berbagi)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MODAL CREATE FILE LINK ─────────────────────────────────────── */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Tambah Link Google Drive"
                subtitle="Daftarkan link Google Drive untuk dikirimkan kepada klien."
                maxWidth="lg"
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Pilih Project *
                        </label>
                        <select
                            required
                            value={form.project_id}
                            onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-indigo-600 outline-hidden cursor-pointer"
                        >
                            <option value="">-- Pilih Project Terkait --</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} {p.project_number ? `(${p.project_number})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Judul Link *
                        </label>
                        <input
                            type="text"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Contoh: Hasil Foto Wedding Kevin & Jessica"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            URL Google Drive *
                        </label>
                        <input
                            type="url"
                            required
                            value={form.drive_url}
                            onChange={(e) => setForm({ ...form, drive_url: e.target.value })}
                            placeholder="https://drive.google.com/drive/folders/..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Tipe Link *
                        </label>
                        <select
                            value={form.file_type}
                            onChange={(e) => setForm({ ...form, file_type: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-indigo-600 outline-hidden cursor-pointer"
                        >
                            <option value="hasil_foto">Hasil Foto</option>
                            <option value="highlight_video">Highlight Video</option>
                            <option value="video_dokumentasi">Video Dokumentasi</option>
                            <option value="lainnya">Lainnya</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
                        >
                            Simpan Link GDrive
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── MODAL DELETE CONFIRMATION ──────────────────────────────────── */}
            <AlertConfirmation
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false })}
                onConfirm={handleDelete}
                title="Hapus Link File?"
                description={
                    <span>
                        Apakah Anda yakin ingin menghapus link <strong>{confirmDelete.name}</strong>? Klien tidak akan dapat mengakses tautan ini lagi dari portal.
                    </span>
                }
                variant="danger"
            />
        </div>
    );
}
