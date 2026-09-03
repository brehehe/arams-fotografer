import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ClientLayout } from '@/layouts/ClientLayout';
import {
    Calendar,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    DollarSign,
    Download,
    Edit3,
    ExternalLink,
    FileText,
    Folder,
    FolderKanban,
    Headphones,
    HelpCircle,
    Info,
    Layers,
    MapPin,
    MessageCircle,
    MessageSquare,
    MoreVertical,
    Package as PackageIcon,
    Play,
    Send,
    Shield,
    Sparkles,
    Star,
    ThumbsUp,
    User,
    Users,
    Video,
    Camera,
    CheckCircle2,
    ArrowUpRight,
    Search,
    CreditCard,
    AlertCircle,
    RefreshCw,
    Plus,
    Link as LinkIcon,
    ArrowRight,
    BadgeCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/formatters';

interface FileLinkItem {
    id: string;
    name: string;
    drive_url?: string | null;
    file_type?: string | null;
    created_at?: string;
    date_label?: string;
    is_link?: boolean;
}

interface PaymentItem {
    id: string;
    payment_number: string;
    amount: number;
    payment_date?: string;
    status: string;
    notes?: string;
}

interface ClientProjectDetailProps {
    project?: {
        id: string;
        project_number: string;
        name: string;
        category?: { id: string; name: string } | null;
        category_name?: string;
        package?: { id: string; name: string; description?: string } | null;
        package_name?: string;
        status: string;
        workflow_step: string;
        progress: number;
        event_date?: string;
        event_time?: string;
        location?: string;
        notes?: string;
        total_amount: number;
        paid_amount: number;
        payment_status: string;
        photographer?: string;
        supervisor?: string;
        editor?: { id: string; name: string; avatar?: string } | null;
        file_links?: FileLinkItem[];
        payments?: PaymentItem[];
    };
    timeline?: {
        current_step: number;
        steps: Array<{
            step: number;
            title: string;
            status: 'completed' | 'active' | 'pending';
            status_label: string;
            date?: string;
        }>;
    };
}

export default function ClientProjectDetail({
    project = {
        id: '01a0473f-8eed-730c-a81b-3973c3d66eb3',
        project_number: 'PRJ-2608-0001',
        name: 'Wedding Andi & Sari',
        category_name: 'Wedding',
        package_name: 'Wedding Day',
        status: 'completed',
        workflow_step: 'selesai',
        progress: 100,
        event_date: '12 Desember 2026',
        event_time: '10.00 WIB',
        location: 'Gedung Graha Arams, Tangerang Selatan',
        notes: 'Konsep: Garden Party, Elegant. Warna: Putih, Hijau Sage, Gold.',
        total_amount: 25000000,
        paid_amount: 25000000,
        payment_status: 'paid',
        photographer: 'Arams Team',
        supervisor: 'Bima Arams',
    },
    timeline = {
        current_step: 8,
        steps: [
            { step: 1, title: 'Booking & DP', status: 'completed', status_label: 'Selesai', date: '05 Okt 2026' },
            { step: 2, title: 'Hari H (Shooting)', status: 'completed', status_label: 'Selesai', date: '12 Des 2026' },
            { step: 3, title: 'Preview Foto', status: 'completed', status_label: 'Selesai', date: '05 Jun 2026' },
            { step: 4, title: 'Editing & Seleksi', status: 'completed', status_label: 'Selesai', date: '20 Jun 2026' },
            { step: 5, title: 'Preview Hasil', status: 'completed', status_label: 'Selesai', date: '05 Jul 2026' },
            { step: 6, title: 'Revisi', status: 'completed', status_label: 'Selesai', date: '15 Jul 2026' },
            { step: 7, title: 'Finalisasi', status: 'completed', status_label: 'Selesai', date: '25 Jul 2026' },
            { step: 8, title: 'Selesai & Pengiriman', status: 'completed', status_label: 'Selesai', date: '27 Jul 2026' },
        ],
    },
}: ClientProjectDetailProps) {
    const { props: pageProps } = usePage<any>();
    const appSettings = pageProps?.appSettings || {};

    // Dynamic portal tokens
    const portalPrimaryAccent = appSettings.portal_primary_accent || '#4A151B';
    const portalHeroBg = appSettings.portal_hero_bg || '#240B10';
    const portalCardBg = appSettings.portal_card_bg || '#FFFFFF';
    const portalCardBorder = appSettings.portal_card_border || 'rgba(226, 232, 240, 0.8)';
    const portalHeadingColor = appSettings.portal_heading_color || '#240B10';
    const portalFontHeading = appSettings.portal_font_heading || 'Plus Jakarta Sans';

    const [activeSection, setActiveSection] = useState('timeline');
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(5);

    const fileList: FileLinkItem[] = [
        {
            id: 'f1',
            name: 'Preview Foto (Low Resolution)',
            date_label: 'Dibagikan pada 05 Jun 2026',
            file_type: 'folder',
        },
        {
            id: 'f2',
            name: 'Behind The Scene',
            date_label: 'Dibagikan pada 23 Mei 2026',
            file_type: 'folder',
        },
        {
            id: 'f3',
            name: 'Foto Hari H (RAW)',
            date_label: 'Dibagikan pada 23 Mei 2026',
            file_type: 'folder',
        },
        {
            id: 'f4',
            name: 'Drive Link (Full Resolution)',
            date_label: 'Dibagikan pada 20 Jun 2026',
            file_type: 'link',
            is_link: true,
        },
    ];

    const notesList = [
        {
            id: 1,
            date: '27',
            monthYear: 'Jul 2026',
            title: 'Project Selesai & File Dikirim',
            content: 'Terima kasih telah mempercayakan momen bahagia Anda kepada Arams Pictures. Semoga hasilnya berkesan dan bisa menjadi kenangan indah selamanya. 😊',
            author: 'Bima Arams',
            role: 'Supervisor',
        },
        {
            id: 2,
            date: '15',
            monthYear: 'Jul 2026',
            title: 'Finalisasi & Persiapan Pengiriman',
            content: 'Revisi terakhir telah selesai dan semua file sudah kami siapkan. File akan segera kami kirim melalui Google Drive.',
            author: 'Arams Team',
            role: 'Editor',
        },
        {
            id: 3,
            date: '05',
            monthYear: 'Jul 2026',
            title: 'Preview Hasil Editing',
            content: 'Berikut adalah preview hasil editing. Silakan beri tahu jika ada yang perlu direvisi.',
            author: 'Arams Team',
            role: 'Editor',
        },
    ];

    const highlightPhotos = [
        '/images/wedding-couple.jpg',
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&auto=format&fit=crop&q=80',
    ];

    const navItems = [
        { id: 'timeline', label: 'Timeline', icon: Clock },
        { id: 'files', label: 'Files', icon: Folder },
        { id: 'catatan', label: 'Catatan', icon: Edit3 },
        { id: 'pembayaran', label: 'Pembayaran', icon: CreditCard },
        { id: 'highlight', label: 'Highlight', icon: Star },
        { id: 'detail', label: 'Detail Project', icon: Info },
    ];

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(`section-${id}`);
        if (element) {
            const yOffset = -90;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const sectionIds = ['timeline', 'files', 'catatan', 'pembayaran', 'highlight', 'detail'];
            const scrollPosition = window.scrollY + 140;

            for (let i = sectionIds.length - 1; i >= 0; i--) {
                const id = sectionIds[i];
                const el = document.getElementById(`section-${id}`);
                if (el) {
                    const top = el.offsetTop;
                    if (scrollPosition >= top) {
                        setActiveSection(id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('Terima kasih! Ulasan Anda berhasil dikirim.');
        setReviewText('');
    };

    const categoryDisplayName = project?.category_name || project?.category?.name || 'Wedding';
    const packageDisplayName = project?.package_name || project?.package?.name || 'Wedding Day';

    return (
        <ClientLayout>
            <Head title={`${project.name} - Detail Project - Arams Pictures`} />

            <div className="space-y-6">
                {/* ── Breadcrumb ─────────────────────────────────────────────── */}
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Link
                        href="/client/projects"
                        style={{ color: portalPrimaryAccent }}
                        className="hover:underline transition-colors"
                    >
                        Project Saya
                    </Link>
                    <span>&gt;</span>
                    <span className="font-bold text-slate-900">{project.name}</span>
                </div>

                {/* ── HERO BANNER (MATCHING SCREENSHOT 2) ───────────────────── */}
                <div
                    style={{
                        backgroundColor: portalCardBg,
                        borderColor: portalCardBorder,
                    }}
                    className="relative rounded-3xl border p-6 sm:p-8 lg:p-10 shadow-xs overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 transition-colors"
                >
                    {/* Left Meta Information */}
                    <div className="relative z-10 space-y-4 max-w-2xl w-full">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                                <h1
                                    style={{
                                        fontFamily: `'${portalFontHeading}', serif`,
                                        color: portalHeadingColor,
                                    }}
                                    className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight leading-tight"
                                >
                                    {project.name}
                                </h1>
                                <span className="px-3 py-0.5 rounded-lg text-xs font-bold bg-[#EBF7EE] text-[#1E7E34] border border-[#C3E6CB]">
                                    Selesai
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium pt-1">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{project.event_date || '12 Desember 2026'}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{project.location || 'Gedung Graha Arams, Tangerang Selatan'}</span>
                                </div>
                            </div>
                        </div>

                        {/* 4 Key Pills */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-200/70 text-xs">
                            <div>
                                <span className="text-[10px] text-slate-400 block font-medium">Kategori Project</span>
                                <strong className="text-slate-900 font-bold">{categoryDisplayName}</strong>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block font-medium">Tipe Project</span>
                                <strong className="text-slate-900 font-bold">{packageDisplayName}</strong>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block font-medium">Photographer</span>
                                <strong className="text-slate-900 font-bold">{project.photographer || 'Arams Team'}</strong>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block font-medium">Supervisor</span>
                                <strong className="text-slate-900 font-bold">{project.supervisor || 'Bima Arams'}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Right Portrait Showcase */}
                    <div className="relative z-10 hidden md:block w-52 lg:w-64 h-36 lg:h-40 rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 shrink-0">
                        <img src="/images/wedding-couple.jpg" alt="Wedding Couple" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* ── 2-COLUMN MAIN CONTENT (MATCHING SCREENSHOT 2) ─────────── */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    
                    {/* LEFT COLUMN: Sticky Vertical Nav Tabs & Help Box */}
                    <div className="w-full lg:w-48 xl:w-52 shrink-0 space-y-4 lg:sticky lg:top-6 z-20">
                        {/* Nav Pills */}
                        <div
                            style={{
                                backgroundColor: portalCardBg,
                                borderColor: portalCardBorder,
                            }}
                            className="rounded-2xl border p-2 shadow-2xs space-y-1"
                        >
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeSection === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => scrollToSection(item.id)}
                                        style={
                                            isActive
                                                ? {
                                                      backgroundColor: portalPrimaryAccent,
                                                      color: '#FFFFFF',
                                                  }
                                                : {}
                                        }
                                        className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer text-left ${
                                            isActive
                                                ? 'shadow-xs'
                                                : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Help Box */}
                        <div
                            style={{
                                backgroundColor: portalCardBg,
                                borderColor: portalCardBorder,
                            }}
                            className="rounded-2xl border p-4 shadow-2xs space-y-3"
                        >
                            <div>
                                <h4
                                    style={{ color: portalHeadingColor }}
                                    className="font-bold text-xs"
                                >
                                    Butuh Bantuan?
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                    Hubungi admin kami jika Anda memiliki pertanyaan terkait project ini.
                                </p>
                            </div>
                            <a
                                href="https://wa.me/6281234567890"
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    backgroundColor: portalPrimaryAccent,
                                    color: '#FFFFFF',
                                }}
                                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs hover:opacity-90"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Hubungi Admin</span>
                            </a>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Timeline, Files, Catatan, Highlight, Review */}
                    <div className="flex-1 space-y-6 w-full">
                        
                        {/* 1. TIMELINE PROJECT CARD */}
                        <section
                            id="section-timeline"
                            style={{
                                backgroundColor: portalCardBg,
                                borderColor: portalCardBorder,
                            }}
                            className="rounded-3xl border p-6 sm:p-8 shadow-2xs space-y-6 scroll-mt-24 transition-colors"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div>
                                    <h3
                                        style={{
                                            fontFamily: `'${portalFontHeading}', serif`,
                                            color: portalHeadingColor,
                                        }}
                                        className="text-base font-serif font-bold"
                                    >
                                        Timeline Project
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Berikut adalah tahapan pengerjaan project Anda.
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                    <span>Terakhir diperbarui: 27 Agustus 2026</span>
                                    <RefreshCw className="w-3 h-3" />
                                </div>
                            </div>

                            {/* 8-Step Timeline Horizontal Stepper */}
                            <div className="pt-2">
                                <div className="flex items-center justify-between relative pb-2">
                                    <div className="absolute left-4 right-4 top-3.5 h-0.5 bg-slate-200 -z-0" />
                                    {timeline.steps.map((step) => (
                                        <div key={step.step} className="flex flex-col items-center relative z-10 flex-1">
                                            <div
                                                style={{
                                                    backgroundColor: portalPrimaryAccent,
                                                    color: '#FFFFFF',
                                                }}
                                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-xs"
                                            >
                                                {step.step}
                                            </div>
                                            <span className="text-[10px] font-bold mt-1.5 text-center text-slate-800 hidden sm:block">
                                                {step.title}
                                            </span>
                                            <span className="text-[9px] text-emerald-600 font-semibold hidden sm:block">
                                                {step.status_label}
                                            </span>
                                            {step.date && (
                                                <span className="text-[8px] text-slate-400 hidden sm:block mt-0.5">
                                                    {step.date}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Project Completed Banner */}
                            <div className="bg-[#EBF7EE] border border-[#C3E6CB] rounded-2xl p-4 flex items-center gap-3 text-xs text-[#1E7E34]">
                                <div className="w-7 h-7 rounded-full bg-[#28A745] text-white flex items-center justify-center shrink-0">
                                    <Check className="w-4 h-4 stroke-[3]" />
                                </div>
                                <div>
                                    <strong className="font-bold text-slate-900 block text-xs">Project telah selesai!</strong>
                                    <span className="text-slate-600 text-[11px]">Terima kasih telah mempercayakan momen berharga Anda kepada Arams Pictures.</span>
                                </div>
                            </div>
                        </section>

                        {/* 2. SUB-GRID 2 COLUMNS (Files & Catatan | Pembayaran & Ulasan) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            
                            {/* Left Side (Files & Catatan) - Span 7 */}
                            <div className="lg:col-span-7 space-y-6">
                                {/* File Terbaru */}
                                <div id="section-files" className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-4 scroll-mt-24">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">File Terbaru</h4>
                                            <p className="text-[11px] text-slate-400">Lihat semua file &amp; drive link project Anda.</p>
                                        </div>
                                        <button className="text-xs font-bold text-[#4A151B] hover:underline flex items-center gap-1">
                                            <span>Lihat Semua File</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                        {fileList.map((file) => (
                                            <div
                                                key={file.id}
                                                className="bg-[#FAF8F5] border border-slate-200/80 rounded-2xl p-3 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
                                            >
                                                <div className="space-y-2">
                                                    {file.is_link ? (
                                                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-[#4A151B] flex items-center justify-center">
                                                            <LinkIcon className="w-4 h-4" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-xl bg-[#F4ECEE] text-[#4A151B] flex items-center justify-center">
                                                            <Folder className="w-4 h-4 fill-[#4A151B]" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h5 className="font-bold text-xs text-slate-900 leading-tight">
                                                            {file.name}
                                                        </h5>
                                                        <span className="text-[10px] text-slate-400 block mt-1">
                                                            {file.date_label}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A151B] hover:underline cursor-pointer pt-1"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    <span>{file.is_link ? 'Buka Link' : 'Buka'}</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                 {/* Catatan Terbaru */}
                                <div
                                    id="section-catatan"
                                    style={{
                                        backgroundColor: portalCardBg,
                                        borderColor: portalCardBorder,
                                    }}
                                    className="rounded-3xl border p-5 sm:p-6 shadow-2xs space-y-4 scroll-mt-24 transition-colors"
                                >
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <div>
                                            <h4
                                                style={{ color: portalHeadingColor }}
                                                className="text-sm font-bold"
                                            >
                                                Catatan Terbaru
                                            </h4>
                                            <p className="text-[11px] text-slate-400">Catatan dari tim kami untuk Anda.</p>
                                        </div>
                                        <button
                                            style={{ color: portalPrimaryAccent }}
                                            className="text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                        >
                                            <span>Lihat Semua Catatan</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {notesList.map((note) => (
                                            <div
                                                key={note.id}
                                                className="bg-[#FAF8F5] border border-slate-200/70 rounded-2xl p-3.5 flex items-start gap-3.5"
                                            >
                                                {/* Date Badge */}
                                                <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0 shadow-2xs text-center">
                                                    <span className="font-black text-sm text-slate-900 leading-none">{note.date}</span>
                                                    <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{note.monthYear}</span>
                                                </div>

                                                {/* Note Content */}
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <h5 className="font-bold text-xs text-slate-900">{note.title}</h5>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-slate-400">{note.author} <span className="font-semibold text-slate-500">({note.role})</span></span>
                                                            <MoreVertical className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] text-slate-600 leading-relaxed">
                                                        {note.content}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => toast.info('Fitur penambahan catatan klien siap digunakan.')}
                                        className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambah Catatan Baru</span>
                                    </button>
                                </div>
                            </div>

                            {/* Right Side (Highlight Pembayaran & Berikan Ulasan) - Span 5 */}
                            <div className="lg:col-span-5 space-y-6">
                                {/* Highlight Pembayaran */}
                                <div
                                    id="section-pembayaran"
                                    style={{
                                        backgroundColor: portalCardBg,
                                        borderColor: portalCardBorder,
                                    }}
                                    className="rounded-3xl border p-5 sm:p-6 shadow-2xs space-y-4 scroll-mt-24 transition-colors"
                                >
                                    <div className="border-b border-slate-100 pb-3">
                                        <h4
                                            style={{ color: portalHeadingColor }}
                                            className="text-sm font-bold"
                                        >
                                            Highlight Pembayaran
                                        </h4>
                                        <p className="text-[11px] text-slate-400">Ringkasan pembayaran project Anda.</p>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Total Project</span>
                                            <span className="font-bold text-slate-900">Rp25.000.000</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Total Dibayar</span>
                                            <span className="font-bold text-emerald-600">Rp25.000.000</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Sisa Tagihan</span>
                                            <span className="font-bold text-slate-900">Rp0</span>
                                        </div>
                                    </div>

                                    {/* Progress 100% */}
                                    <div className="space-y-1">
                                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    backgroundColor: portalPrimaryAccent,
                                                    width: '100%',
                                                }}
                                            />
                                        </div>
                                        <div className="text-right text-[10px] font-bold text-slate-500">100%</div>
                                    </div>

                                    {/* Success Lunas Box */}
                                    <div className="p-3 rounded-2xl bg-[#EBF7EE] border border-[#C3E6CB] flex items-start gap-2.5 text-xs text-[#1E7E34]">
                                        <div className="w-5 h-5 rounded-full bg-[#28A745] text-white flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="w-3 h-3 stroke-[3]" />
                                        </div>
                                        <div>
                                            <strong className="font-bold text-slate-900">Pembayaran Lunas</strong>
                                            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                                                Terima kasih atas pelunasan pembayaran project ini.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => toast.info('Detail tagihan dan invoice project sudah lunas.')}
                                        style={{ color: portalPrimaryAccent }}
                                        className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-center transition-colors shadow-2xs block cursor-pointer"
                                    >
                                        Lihat Detail Pembayaran →
                                    </button>
                                </div>

                                {/* Berikan Ulasan Anda */}
                                <div
                                    style={{
                                        backgroundColor: portalCardBg,
                                        borderColor: portalCardBorder,
                                    }}
                                    className="rounded-3xl border p-5 sm:p-6 shadow-2xs space-y-4 transition-colors"
                                >
                                    <div>
                                        <h4
                                            style={{ color: portalHeadingColor }}
                                            className="text-sm font-bold"
                                        >
                                            Berikan Ulasan Anda
                                        </h4>
                                        <p className="text-[11px] text-slate-400">Bagaimana pengalaman Anda bersama Arams Pictures?</p>
                                    </div>

                                    <form onSubmit={handleSubmitReview} className="space-y-3">
                                        <div className="flex items-center gap-1.5">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => setRating(i + 1)}
                                                    className="cursor-pointer"
                                                >
                                                    <Star
                                                        className={`w-4 h-4 ${
                                                            i < rating
                                                                ? 'text-amber-500 fill-amber-500'
                                                                : 'text-slate-300'
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                            <span className="text-xs font-bold text-slate-900 ml-1.5">5.0</span>
                                            <span className="text-[11px] text-slate-500 font-medium">Sangat Puas</span>
                                        </div>

                                        <div className="relative">
                                            <textarea
                                                rows={3}
                                                maxLength={500}
                                                value={reviewText}
                                                onChange={(e) => setReviewText(e.target.value)}
                                                placeholder="Tulis ulasan Anda di sini..."
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:bg-white focus:border-[#4A151B]"
                                            />
                                            <span className="absolute right-3 bottom-2 text-[10px] text-slate-400">
                                                {reviewText.length}/500
                                            </span>
                                        </div>

                                        <button
                                            type="submit"
                                            style={{
                                                backgroundColor: portalPrimaryAccent,
                                                color: '#FFFFFF',
                                            }}
                                            className="w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:opacity-90"
                                        >
                                            Kirim Ulasan
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* 3. HIGHLIGHT PROJECT SECTION */}
                        <section
                            id="section-highlight"
                            style={{
                                backgroundColor: portalCardBg,
                                borderColor: portalCardBorder,
                            }}
                            className="rounded-3xl border p-6 shadow-2xs space-y-4 scroll-mt-24 transition-colors"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h4
                                        style={{ color: portalHeadingColor }}
                                        className="text-sm font-bold"
                                    >
                                        Highlight Project
                                    </h4>
                                    <p className="text-[11px] text-slate-400">Beberapa momen terbaik dari project Anda.</p>
                                </div>
                                <button
                                    style={{ color: portalPrimaryAccent }}
                                    className="text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    <span>Lihat Semua Highlight</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                {highlightPhotos.map((img, i) => (
                                    <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 shadow-2xs">
                                        <img src={img} alt={`Highlight ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 4. ULASAN CLIENT SECTION */}
                        <section
                            style={{
                                backgroundColor: portalCardBg,
                                borderColor: portalCardBorder,
                            }}
                            className="rounded-3xl border p-6 shadow-2xs space-y-4 transition-colors"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h4
                                        style={{ color: portalHeadingColor }}
                                        className="text-sm font-bold"
                                    >
                                        Ulasan Client
                                    </h4>
                                    <p className="text-[11px] text-slate-400">Terima kasih atas kepercayaan Anda.</p>
                                </div>
                                <button
                                    style={{ color: portalPrimaryAccent }}
                                    className="text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    <span>Lihat Semua Ulasan</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="bg-[#FAF8F5] border border-slate-200/70 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-3.5">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                        <img src="/images/wedding-couple.jpg" alt="Andi & Sari" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h5 className="font-bold text-xs text-slate-900">Andi &amp; Sari</h5>
                                            <span className="text-[10px] text-slate-400">Wedding Day</span>
                                            <div className="flex items-center gap-0.5 text-amber-500">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className="w-3 h-3 fill-amber-500" />
                                                ))}
                                                <span className="text-[10px] font-bold text-slate-800 ml-1">5.0</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed italic">
                                            Pelayanan sangat profesional, hasil foto luar biasa, dan timnya ramah banget. Momen kami jadi sangat berkesan!
                                        </p>
                                        <span className="text-[10px] text-slate-400 block pt-0.5">27 Agustus 2026</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                                    <button className="w-7 h-7 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer">
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                    <button className="w-7 h-7 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer">
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* 5. DETAIL PROJECT SECTION (MATCHING BUTTON "Detail Project") */}
                        <section
                            id="section-detail"
                            style={{
                                backgroundColor: portalCardBg,
                                borderColor: portalCardBorder,
                            }}
                            className="rounded-3xl border p-6 sm:p-8 shadow-2xs space-y-6 scroll-mt-24 transition-colors"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div
                                        style={{
                                            backgroundColor: `${portalPrimaryAccent}15`,
                                            color: portalPrimaryAccent,
                                        }}
                                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                                    >
                                        <Info className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3
                                            style={{
                                                fontFamily: `'${portalFontHeading}', serif`,
                                                color: portalHeadingColor,
                                            }}
                                            className="text-base font-serif font-bold"
                                        >
                                            Detail &amp; Spesifikasi Project
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Rangkuman informasi lengkap pemesanan dan tim yang bertugas.
                                        </p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                                    Status: Selesai
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                                {/* Left Info Box */}
                                <div className="space-y-3.5 bg-[#FAF8F5] p-5 rounded-2xl border border-slate-200/70">
                                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200/60 pb-2">
                                        Informasi Umum
                                    </h4>
                                    <div className="space-y-2.5">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Nomor Project:</span>
                                            <span className="font-bold text-slate-900 font-mono">{project.project_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Nama Project:</span>
                                            <span className="font-bold text-slate-900">{project.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Kategori:</span>
                                            <span className="font-bold text-slate-900">{categoryDisplayName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Paket Layanan:</span>
                                            <span className="font-bold text-slate-900">{packageDisplayName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Tanggal Acara:</span>
                                            <span className="font-bold text-slate-900">{project.event_date || '12 Desember 2026'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Waktu Acara:</span>
                                            <span className="font-bold text-slate-900">{project.event_time || '10:00 WIB'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Lokasi / Venue:</span>
                                            <span className="font-semibold text-slate-900 text-right max-w-[200px]">{project.location || 'Gedung Graha Arams'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Info Box */}
                                <div className="space-y-3.5 bg-[#FAF8F5] p-5 rounded-2xl border border-slate-200/70">
                                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200/60 pb-2">
                                        Tim Bertugas &amp; Catatan
                                    </h4>
                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Supervisor:</span>
                                            <span className="font-bold text-slate-900">{project.supervisor || 'Bima Arams'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Photographer:</span>
                                            <span className="font-bold text-slate-900">{project.photographer || 'Arams Team'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Editor:</span>
                                            <span className="font-bold text-slate-900">{project.editor?.name || 'Arams Editor'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Status Pembayaran:</span>
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                Lunas (100%)
                                            </span>
                                        </div>
                                        <div className="pt-2 border-t border-slate-200/60">
                                            <span className="text-slate-500 block text-[10px] mb-1">Catatan Klien:</span>
                                            <p className="text-slate-700 italic text-[11px] leading-relaxed">
                                                "{project.notes || 'Konsep: Garden Party, Elegant. Warna: Putih, Hijau Sage, Gold.'}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </ClientLayout>
    );
}
