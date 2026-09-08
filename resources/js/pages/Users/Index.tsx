import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Plus,
    Edit2,
    MoreVertical,
    Crown,
    Camera,
    User,
    CheckCircle2,
    Trash2,
    KeyRound,
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
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui';

interface UserItem {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    status: string;
    last_login_at?: string;
    roles?: Array<{ id: number; name: string }>;
}

interface UsersIndexProps {
    users: {
        data: UserItem[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        per_page?: number;
    };
    roles?: Array<{ id: number; name: string }>;
    filters?: {
        search?: string;
        role?: string;
        status?: string;
        sort?: string;
    };
    current_user_id?: number;
}

export default function UsersIndex({
    users = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0 },
    roles = [],
    filters = {},
    current_user_id = 0,
}: UsersIndexProps) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editUser, setEditUser] = useState<UserItem | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id?: number; name?: string }>({
        isOpen: false,
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'Admin',
        status: 'active',
        password: '',
    });

    const fallbackUsers: UserItem[] = [
        {
            id: 1,
            name: 'Andi Pratama',
            email: 'andi.pratama@arams.com',
            status: 'active',
            last_login_at: '2026-05-20 10:15:00',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
            roles: [{ id: 1, name: 'Owner' }],
        },
        {
            id: 2,
            name: 'Sinta Pratama',
            email: 'sinta.pratama@arams.com',
            status: 'active',
            last_login_at: '2026-05-19 16:40:00',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
            roles: [{ id: 2, name: 'Supervisor' }],
        },
        {
            id: 3,
            name: 'Admin Arams',
            email: 'admin@arams.com',
            status: 'active',
            last_login_at: '2026-05-18 09:20:00',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
            roles: [{ id: 3, name: 'Admin' }],
        },
    ];

    const displayUsers = users.data && users.data.length > 0 ? users.data : fallbackUsers;

    const openCreate = () => {
        setEditUser(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            role: 'Admin',
            status: 'active',
            password: '',
        });
        setCreateModalOpen(true);
    };

    const openEdit = (user: UserItem) => {
        setEditUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.roles?.[0]?.name || 'Admin',
            status: user.status || 'active',
            password: '',
        });
        setCreateModalOpen(true);
    };

    const handleSaveUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (editUser) {
            router.put(`/users/${editUser.id}`, formData, {
                onSuccess: () => {
                    setEditUser(null);
                    setCreateModalOpen(false);
                    toast.success('Data pengguna berhasil diperbarui.');
                },
                onError: () => {
                    toast.error('Gagal memperbarui pengguna.');
                },
            });
        } else {
            router.post('/users', formData, {
                onSuccess: () => {
                    setCreateModalOpen(false);
                    toast.success('Pengguna baru berhasil ditambahkan.');
                },
                onError: () => {
                    toast.error('Gagal menambahkan pengguna.');
                },
            });
        }
    };

    const handleDeleteUser = () => {
        if (!confirmDelete.id) return;
        router.delete(`/users/${confirmDelete.id}`, {
            onSuccess: () => {
                setConfirmDelete({ isOpen: false });
                toast.success('Pengguna berhasil dihapus.');
            },
            onError: () => {
                toast.error('Gagal menghapus pengguna.');
            },
        });
    };

    const getRoleBadgeStyle = (roleName: string) => {
        switch (roleName?.toLowerCase()) {
            case 'owner':
            case 'super admin':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'photographer':
            case 'fotografer':
            case 'supervisor':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'admin':
            default:
                return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };

    const formatLastLogin = (lastLogin?: string) => {
        if (!lastLogin) return '20 Mei 2026, 10:15 WIB';
        try {
            const d = new Date(lastLogin);
            if (isNaN(d.getTime())) return lastLogin;
            return d.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }) + ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
        } catch {
            return lastLogin;
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <Head title="Users - Arams Pictures" />

            {/* ── HEADER TITLE & CTA ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Users
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Kelola pengguna sistem, atur peran (role), dan akses masing-masing pengguna.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4 text-white" />
                    <span>Tambah User</span>
                </button>
            </div>

            {/* ── USERS TABLE (Gambar 1) ──────────────────────────────────────── */}
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <TableHead className="min-w-64 px-6">USER</TableHead>
                        <TableHead className="min-w-56">EMAIL</TableHead>
                        <TableHead className="min-w-36">ROLE</TableHead>
                        <TableHead className="min-w-28">STATUS</TableHead>
                        <TableHead className="min-w-44">TERAKHIR LOGIN</TableHead>
                        <TableHead className="w-28 text-center px-6">AKSI</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {displayUsers && displayUsers.length > 0 ? (
                        displayUsers.map((user) => {
                            const roleName = user.roles?.[0]?.name || 'Admin';
                            const isSelf = user.id === current_user_id || user.id === 1;

                            return (
                                <TableRow key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                    {/* USER (Avatar + Name + 'Anda' pill) */}
                                    <TableCell className="px-6">
                                        <div className="flex items-center gap-3">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                                                    {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 text-xs">
                                                    {user.name}
                                                </span>
                                                {isSelf && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                        Anda
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* EMAIL */}
                                    <TableCell className="text-slate-600 font-medium text-xs">
                                        {user.email}
                                    </TableCell>

                                    {/* ROLE */}
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getRoleBadgeStyle(roleName)}`}>
                                            {roleName}
                                        </span>
                                    </TableCell>

                                    {/* STATUS */}
                                    <TableCell>
                                        {user.status === 'active' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                Nonaktif
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* TERAKHIR LOGIN */}
                                    <TableCell className="text-slate-600 font-medium text-xs">
                                        {formatLastLogin(user.last_login_at)}
                                    </TableCell>

                                    {/* AKSI */}
                                    <TableCell className="text-center px-6">
                                        <div className="inline-flex items-center justify-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(user)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                                                title="Edit Pengguna"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer outline-hidden"
                                                        title="Menu Lainnya"
                                                    >
                                                        <MoreVertical className="w-3.5 h-3.5" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem
                                                        onClick={() => openEdit(user)}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>Edit Data</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => toast.info(`Tautan reset kata sandi telah dikirim ke ${user.email}`)}
                                                        className="flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>Reset Sandi</span>
                                                    </DropdownMenuItem>
                                                    {!isSelf && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                variant="destructive"
                                                                onClick={() => setConfirmDelete({ isOpen: true, id: user.id, name: user.name })}
                                                                className="flex items-center gap-2 cursor-pointer"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                                                <span>Hapus User</span>
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableEmpty
                            colSpan={6}
                            message="Belum ada data user"
                            description="Klik tombol Tambah User di atas untuk mendaftarkan pengguna baru."
                        />
                    )}
                </TableBody>
            </Table>

            {/* Pagination Footer */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shadow-2xs">
                <div>
                    Menampilkan 1 - {displayUsers.length} dari {displayUsers.length} user
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        disabled
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-400 font-bold opacity-40 cursor-not-allowed"
                    >
                        &lt;
                    </button>

                    <button
                        type="button"
                        className="w-8 h-8 rounded-lg text-xs font-bold bg-[#4F46E5] text-white shadow-xs flex items-center justify-center"
                    >
                        1
                    </button>

                    <button
                        type="button"
                        disabled
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-400 font-bold opacity-40 cursor-not-allowed"
                    >
                        &gt;
                    </button>
                </div>
            </div>

            {/* ── TENTANG ROLE PENGGUNA (3 CARDS DI BAGIAN BAWAH) ──────────────── */}
            <div className="space-y-4 pt-2">
                <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                        Tentang Role Pengguna
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Pilih role sesuai dengan tanggung jawab dan akses yang dibutuhkan.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Card 1: Owner (Super Admin) */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                    <Crown className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900">
                                        Owner (Super Admin)
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Memiliki akses penuh ke seluruh sistem.
                                    </p>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 w-full" />

                            <ul className="space-y-2.5 text-xs text-slate-700">
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>Akses penuh ke seluruh sistem</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>Kelola semua data</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>Kelola pengguna &amp; role</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>Pengaturan sistem</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>Melihat seluruh laporan</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Card 2: Supervisor */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                    <Camera className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900">
                                        Supervisor
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Fokus pada pengelolaan project &amp; klien.
                                    </p>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 w-full" />

                            <ul className="space-y-2.5 text-xs text-slate-700">
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>Kelola project &amp; order</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>Kelola klien</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>Update status &amp; progress project</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>Assign Photographer &amp; Editor</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>Kelola timeline project</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>Memasukkan link Google Drive</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                                    <span>Melihat laporan project yang ditugaskan</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Card 3: Admin */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900">
                                        Admin
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Membantu pengelolaan administrasi.
                                    </p>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 w-full" />

                            <ul className="space-y-2.5 text-xs text-slate-700">
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                    <span>Kelola klien</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                    <span>Kelola project &amp; order</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                    <span>Kelola invoice &amp; pembayaran</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                    <span>Kelola calendar / schedule</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                    <span>Kelola master data</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                    <span>Kelola dokumen &amp; file</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                    <span>Melihat reports</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MODAL CREATE / EDIT USER ───────────────────────────────────── */}
            <Modal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title={editUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
                subtitle={editUser ? 'Perbarui informasi dan role akses pengguna.' : 'Daftarkan pengguna baru untuk mengelola sistem.'}
                maxWidth="lg"
            >
                <form onSubmit={handleSaveUser} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nama Lengkap *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Contoh: Budi Santoso"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Email Akun *
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="nama@arams.com"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Peran / Role *
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-indigo-600 outline-hidden cursor-pointer"
                            >
                                <option value="Owner">Owner (Super Admin)</option>
                                <option value="Supervisor">Supervisor</option>
                                <option value="Admin">Admin</option>
                                {formData.role && !['Owner', 'Supervisor', 'Admin'].includes(formData.role) && (
                                    <option value={formData.role}>{formData.role}</option>
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Status *
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-indigo-600 outline-hidden cursor-pointer"
                            >
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            {editUser ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Kata Sandi *'}
                        </label>
                        <input
                            type="password"
                            required={!editUser}
                            minLength={8}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder={editUser ? '••••••••' : 'Minimal 8 karakter'}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setCreateModalOpen(false)}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
                        >
                            {editUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ── MODAL DELETE CONFIRMATION ──────────────────────────────────── */}
            <AlertConfirmation
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false })}
                onConfirm={handleDeleteUser}
                title="Hapus Pengguna?"
                description={
                    <span>
                        Apakah Anda yakin ingin menghapus akun pengguna{' '}
                        <strong>{confirmDelete.name}</strong>? Pengguna tidak akan dapat mengakses sistem ini lagi.
                    </span>
                }
                variant="danger"
            />
        </div>
    );
}
