import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    Bell,
    ChevronDown,
    Home,
    FolderKanban,
    LogOut,
    User,
    Phone,
    Mail,
    Clock,
    Instagram,
    Youtube,
    Shield,
    FileText,
    ExternalLink,
    Camera,
    Sparkles,
    CheckCircle2,
    Award,
    HeartHandshake,
    Workflow,
    Facebook,
} from 'lucide-react';

interface ClientLayoutProps {
    children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
    const { url, props } = usePage<any>();
    const user = props?.auth?.user;
    const appSettings = props?.appSettings || {};

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const isCurrent = (path: string) => {
        const currentUrl = url || (typeof window !== 'undefined' ? window.location.pathname : '') || '';
        if (path === '/client/dashboard' && (currentUrl === '/client/dashboard' || currentUrl === '/client' || currentUrl === '/portal')) return true;
        if (path === '/client/projects' && currentUrl.startsWith('/client/projects')) return true;
        return false;
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-slate-800 font-sans antialiased selection:bg-rose-900 selection:text-white">
            {/* ── TOP HEADER NAVBAR (Screenshot 1, 2, 3) ──────────────────────── */}
            <header className="sticky top-0 z-40 bg-[#240B10] text-white border-b border-[#3D141C] shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                    {/* Brand Logo Monogram */}
                    <Link href="/client/dashboard" className="flex items-center gap-3.5 group">
                        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                            <span className="font-serif italic font-bold text-sm tracking-tighter">ap</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-serif font-black text-sm sm:text-base tracking-[0.2em] uppercase text-white">
                                Arams Pictures
                            </span>
                            <span className="text-[9px] tracking-[0.3em] uppercase text-rose-300 font-bold -mt-0.5">
                                Client Portal
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Pills */}
                    <nav className="flex items-center gap-2">
                        <Link
                            href="/client/dashboard"
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                                isCurrent('/client/dashboard')
                                    ? 'bg-white text-[#240B10] shadow-sm'
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <Home className="w-4 h-4" />
                            <span>Beranda</span>
                        </Link>

                        <Link
                            href="/client/projects"
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                                isCurrent('/client/projects')
                                    ? 'bg-white text-[#240B10] shadow-sm'
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <FolderKanban className="w-4 h-4" />
                            <span>Project Saya</span>
                        </Link>
                    </nav>

                    {/* Right Notification & User Profile */}
                    <div className="flex items-center gap-3">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/90 relative transition-colors cursor-pointer"
                            >
                                <Bell className="w-4 h-4" />
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center border-2 border-[#240B10]">
                                    2
                                </span>
                            </button>

                            {/* Notifications Dropdown */}
                            {notificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 text-xs animate-in fade-in zoom-in-95">
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                                            <span className="font-bold text-slate-900">Notifikasi</span>
                                            <span className="text-[10px] text-[#4A151B] font-semibold">Tandai sudah dibaca</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
                                                <p className="font-bold text-slate-900 text-[11px]">Preview Foto Siap Dilihat</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">Editor telah mengunggah preview foto untuk Wedding Anda.</p>
                                                <span className="text-[9px] text-slate-400 mt-1 block">5 menit yang lalu</span>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-slate-50">
                                                <p className="font-bold text-slate-900 text-[11px]">Pembayaran Terverifikasi</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">Pembayaran termin DP telah berhasil diverifikasi oleh admin.</p>
                                                <span className="text-[9px] text-slate-400 mt-1 block">2 jam yang lalu</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* User Profile Menu */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2.5 p-1 pr-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold uppercase overflow-hidden shadow-2xs">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src="/images/wedding-couple.jpg" alt="User" className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <span className="text-xs font-bold text-white max-w-[130px] truncate hidden sm:inline">
                                    {user?.name || 'Andi Pratama'}
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 text-white/70" />
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-xs animate-in fade-in zoom-in-95 divide-y divide-slate-100">
                                        <div className="px-3 py-2">
                                            <p className="font-bold text-slate-900 truncate">{user?.name || 'Andi Pratama'}</p>
                                            <p className="text-[11px] text-slate-500 truncate">{user?.email || 'andi.pratama@gmail.com'}</p>
                                            <span className="inline-block px-2 py-0.5 mt-1 rounded-full text-[9px] font-bold bg-rose-100 text-[#4A151B]">
                                                Akun Klien
                                            </span>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                href="/client/dashboard"
                                                onClick={() => setDropdownOpen(false)}
                                                className="w-full px-3 py-2 rounded-xl flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                                            >
                                                <Home className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Beranda Portal</span>
                                            </Link>
                                            <Link
                                                href="/client/projects"
                                                onClick={() => setDropdownOpen(false)}
                                                className="w-full px-3 py-2 rounded-xl flex items-center gap-2 text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                                            >
                                                <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Project Saya</span>
                                            </Link>
                                            {user?.roles?.some((r: any) => r.name !== 'Client') && (
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="w-full px-3 py-2 rounded-xl flex items-center gap-2 font-bold text-[#4A151B] hover:bg-rose-50 transition-colors"
                                                >
                                                    <Camera className="w-3.5 h-3.5" />
                                                    <span>Studio Admin Dashboard</span>
                                                </Link>
                                            )}
                                        </div>

                                        <div className="pt-1">
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="w-full px-3 py-2 rounded-xl flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer font-semibold"
                                            >
                                                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                                                <span>Keluar (Logout)</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12">
                {children}
            </main>

            {/* ── FOOTER SECTION (Screenshot 1, 2, 3) ────────────────────────── */}
            <footer className="bg-white border-t border-slate-200/80 pt-10 text-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Top 4 Value Badges & Contact Admin Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8 border-b border-slate-200">
                        {/* 4 Feature Pillars (Span 8) */}
                        <div className="lg:col-span-8 space-y-4">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                Kenapa Memilih Arams Pictures?
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#4A151B] flex items-center justify-center">
                                        <Award className="w-4 h-4" />
                                    </div>
                                    <h5 className="font-bold text-xs text-slate-900">Berpengalaman</h5>
                                    <p className="text-[11px] text-slate-500 leading-snug">
                                        Lebih dari 7 tahun mengabadikan momen berharga.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#4A151B] flex items-center justify-center">
                                        <Camera className="w-4 h-4" />
                                    </div>
                                    <h5 className="font-bold text-xs text-slate-900">Kualitas Terbaik</h5>
                                    <p className="text-[11px] text-slate-500 leading-snug">
                                        Peralatan profesional &amp; editing berkualitas tinggi.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#4A151B] flex items-center justify-center">
                                        <HeartHandshake className="w-4 h-4" />
                                    </div>
                                    <h5 className="font-bold text-xs text-slate-900">Pelayanan Personal</h5>
                                    <p className="text-[11px] text-slate-500 leading-snug">
                                        Kami mendengar &amp; mewujudkan visi Anda.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#4A151B] flex items-center justify-center">
                                        <Workflow className="w-4 h-4" />
                                    </div>
                                    <h5 className="font-bold text-xs text-slate-900">Proses Terorganisir</h5>
                                    <p className="text-[11px] text-slate-500 leading-snug">
                                        Alur kerja jelas, update rutin, dan tepat waktu.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Hubungi Admin Kami (Span 4) */}
                        <div className="lg:col-span-4 space-y-3 bg-[#FAF8F5] p-5 rounded-2xl border border-slate-200/80">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                Hubungi Admin Kami
                            </h4>
                            <p className="text-[11px] text-slate-500 -mt-1">
                                Kami siap membantu Anda kapan saja.
                            </p>

                            <div className="space-y-2.5 pt-1 text-xs">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                        <Phone className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-800 block text-[11px]">WhatsApp</span>
                                        <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-emerald-700 font-medium text-[11px]">
                                            +62 812-3456-7890
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                        <Mail className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-800 block text-[11px]">Email</span>
                                        <a href="mailto:hello@aramspictures.com" className="text-slate-600 hover:text-blue-700 font-medium text-[11px]">
                                            hello@aramspictures.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2.5">
                                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                        <Clock className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-800 block text-[11px]">Jam Operasional</span>
                                        <span className="text-slate-600 font-medium text-[11px]">
                                            Senin - Minggu, 08.00 - 18.00 WIB
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Dark Copyright Bar */}
                <div className="bg-[#1C080C] text-white py-6 mt-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                        {/* Brand & Tagline */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white font-serif italic font-bold text-xs">
                                ap
                            </div>
                            <div>
                                <h4 className="font-serif font-black tracking-widest text-white text-xs uppercase">
                                    Arams Pictures
                                </h4>
                                <p className="text-[10px] text-rose-300 font-medium">
                                    Capture Your Moments, Tell Your Story
                                </p>
                            </div>
                        </div>

                        {/* Social Icons */}
                        <div className="flex flex-col items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                Ikuti Kami
                            </span>
                            <div className="flex items-center gap-3 text-slate-300">
                                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                                    <Instagram className="w-4 h-4" />
                                </a>
                                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                                    <Youtube className="w-4 h-4" />
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                                    <Facebook className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Copyright & Links */}
                        <div className="flex flex-col md:items-end gap-1 text-[11px] text-slate-400">
                            <span>© 2026 Arams Pictures. All rights reserved.</span>
                            <div className="flex items-center gap-3 text-[10px]">
                                <Link href="#" className="hover:text-white">Kebijakan Privasi</Link>
                                <span>|</span>
                                <Link href="#" className="hover:text-white">Syarat &amp; Ketentuan</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
