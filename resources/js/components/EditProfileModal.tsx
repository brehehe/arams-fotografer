import React, { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    User,
    Mail,
    Phone,
    Camera,
    Trash2,
    Save,
    X,
    Loader2,
    ShieldCheck,
    CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id?: string | number;
        name?: string;
        email?: string;
        phone?: string | null;
        avatar?: string | null;
        role?: string;
        roles?: string[];
    } | null;
}

export default function EditProfileModal({
    isOpen,
    onClose,
    user,
}: EditProfileModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Populate initial data when user changes or modal opens
    useEffect(() => {
        if (isOpen && user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phone || '');
            setAvatarFile(null);
            setAvatarPreview(user.avatar || null);
            setIsAvatarRemoved(false);
            setErrors({});
        }
    }, [isOpen, user]);

    // Clean up preview blob URL on unmount or change
    useEffect(() => {
        return () => {
            if (avatarPreview && avatarPreview.startsWith('blob:')) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ukuran foto maksimal adalah 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar (JPG, PNG, WebP)');
            return;
        }

        if (avatarPreview && avatarPreview.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreview);
        }

        const previewUrl = URL.createObjectURL(file);
        setAvatarFile(file);
        setAvatarPreview(previewUrl);
        setIsAvatarRemoved(false);
    };

    const handleRemoveAvatar = () => {
        if (avatarPreview && avatarPreview.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreview);
        }
        setAvatarFile(null);
        setAvatarPreview(null);
        setIsAvatarRemoved(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        toast.info('Foto avatar direset ke default silhouette');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        if (!name.trim()) {
            setErrors((prev) => ({ ...prev, name: 'Nama tidak boleh kosong.' }));
            return;
        }

        if (!email.trim()) {
            setErrors((prev) => ({ ...prev, email: 'Email tidak boleh kosong.' }));
            return;
        }

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('_method', 'patch');
        formData.append('name', name.trim());
        formData.append('email', email.trim());
        formData.append('phone', phone ? phone.trim() : '');

        if (avatarFile) {
            formData.append('avatar_file', avatarFile);
        } else if (isAvatarRemoved) {
            formData.append('avatar', '');
        }

        router.post('/settings/profile', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                toast.success('Profil berhasil diperbarui!');
                onClose();
            },
            onError: (errs) => {
                setIsSubmitting(false);
                setErrors(errs as Record<string, string>);
                toast.error('Gagal memperbarui profil. Periksa formulir kembali.');
            },
        });
    };

    const currentDisplayAvatar = avatarPreview || '/images/default-avatar.png';
    const roleBadge = user?.roles?.[0] || user?.role || 'Pengguna';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                {/* Header with Luxury Brand Accent */}
                <div className="bg-gradient-to-r from-[#3C0E0E] to-[#541515] p-5 text-white relative">
                    <DialogHeader className="text-left space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-white/15 text-white/90 text-[10px] font-bold uppercase tracking-wider">
                                {roleBadge}
                            </span>
                            <span className="text-xs text-amber-200 flex items-center gap-1 font-medium">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Tanpa Ubah Password</span>
                            </span>
                        </div>
                        <DialogTitle className="text-lg font-bold text-white tracking-tight">
                            Edit Profil Saya
                        </DialogTitle>
                        <DialogDescription className="text-xs text-white/80">
                            Perbarui foto avatar dan informasi kontak akun Anda dengan mudah.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* 1. Avatar Uploader Section */}
                    <div className="flex items-center gap-4 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                        {/* Hidden input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />

                        {/* Avatar Image with Click Trigger */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative w-18 h-18 rounded-full overflow-hidden bg-slate-200 ring-3 ring-white shadow-md cursor-pointer group shrink-0"
                            title="Klik untuk memilih foto avatar"
                        >
                            <img
                                src={currentDisplayAvatar}
                                alt={name || 'Avatar'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                <Camera className="w-5 h-5 drop-shadow" />
                                <span className="text-[9px] font-bold mt-0.5">Ubah</span>
                            </div>
                        </div>

                        {/* Avatar Action Buttons & Info */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                            <div>
                                <p className="text-xs font-bold text-slate-800">
                                    Foto Avatar
                                </p>
                                <p className="text-[10.5px] text-slate-400">
                                    JPG, PNG, atau WebP (Maks. 5MB)
                                </p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap pt-0.5">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                >
                                    <Camera className="w-3.5 h-3.5 text-[#3C0E0E]" />
                                    <span>Pilih Foto</span>
                                </button>

                                {(avatarPreview || user?.avatar) && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveAvatar}
                                        className="px-2.5 py-1 text-xs font-medium rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    >
                                        <Trash2 className="w-3 h-3 text-rose-500" />
                                        <span>Reset Default</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. Input Fields */}
                    <div className="space-y-3 pt-1">
                        {/* Nama Lengkap */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span>Nama Lengkap <span className="text-rose-500">*</span></span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Masukkan nama lengkap"
                                required
                                className={`w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                                    errors.name
                                        ? 'border-rose-300 focus:ring-rose-200 text-rose-900'
                                        : 'border-slate-200 focus:border-[#3C0E0E] focus:ring-[#3C0E0E]/10 text-slate-900'
                                }`}
                            />
                            {errors.name && (
                                <p className="text-[11px] font-medium text-rose-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span>Email Akun <span className="text-rose-500">*</span></span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
                                required
                                className={`w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                                    errors.email
                                        ? 'border-rose-300 focus:ring-rose-200 text-rose-900'
                                        : 'border-slate-200 focus:border-[#3C0E0E] focus:ring-[#3C0E0E]/10 text-slate-900'
                                }`}
                            />
                            {errors.email && (
                                <p className="text-[11px] font-medium text-rose-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Telepon / WhatsApp */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>Nomor Telepon / WhatsApp <span className="text-slate-400 font-normal">(Opsional)</span></span>
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Contoh: 081234567890"
                                className={`w-full px-3 py-2 text-xs rounded-xl border bg-white focus:outline-none focus:ring-2 transition-all ${
                                    errors.phone
                                        ? 'border-rose-300 focus:ring-rose-200 text-rose-900'
                                        : 'border-slate-200 focus:border-[#3C0E0E] focus:ring-[#3C0E0E]/10 text-slate-900'
                                }`}
                            />
                            {errors.phone && (
                                <p className="text-[11px] font-medium text-rose-600">
                                    {errors.phone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Notice card */}
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-900 leading-relaxed">
                            Perubahan profil langsung aktif dan tersimpan tanpa perlu memasukkan kata sandi lama atau baru.
                        </p>
                    </div>

                    {/* Footer Buttons */}
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#3C0E0E] text-white hover:bg-[#541515] transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Simpan Perubahan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
