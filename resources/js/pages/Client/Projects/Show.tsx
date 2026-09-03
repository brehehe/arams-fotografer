import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
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
    Circle,
    UserCheck,
    ListChecks,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/formatters';

interface FileLinkItem {
    id: string;
    name: string;
    drive_url?: string | null;
    file_type?: string | null;
    created_at?: string;
    date_label?: string | null;
    is_link?: boolean;
    expires_at?: string | null;
    days_remaining?: number | null;
}

interface PaymentItem {
    id: string;
    amount: number;
    payment_date?: string;
    payment_method?: string;
    reference_number?: string;
    status: string;
    notes?: string;
}

interface HighlightItem {
    id: string;
    title?: string;
    caption?: string;
    image_url: string;
    media_type?: string;
    is_cover?: boolean;
}

interface NoteItem {
    id: string | number;
    title: string;
    content: string;
    author: string;
    role: string;
    date: string;
    monthYear: string;
}

interface TestimonialDetailItem {
    id: string;
    client_name: string;
    package_name?: string;
    rating: number;
    comment: string;
    avatar?: string;
    date?: string;
}

interface StepTaskItem {
    title: string;
    completed: boolean;
}

interface StepItem {
    step: number;
    key?: string;
    title?: string;
    name?: string;
    status: 'completed' | 'active' | 'pending';
    status_label?: string;
    desc?: string;
    description?: string;
    date?: string | null;
    icon?: string;
    pic?: string;
    tasks?: StepTaskItem[];
}

interface TimelineData {
    current_step: number;
    total_steps?: number;
    current_step_name?: string;
    active_step_title?: string;
    active_step_desc?: string;
    progress_percentage?: number;
    steps: StepItem[];
}

interface ClientProjectDetailProps {
    project: {
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
        event_date_raw?: string;
        event_time?: string;
        deadline?: string;
        location?: string;
        notes?: string;
        total_amount: number;
        paid_amount: number;
        payment_status: string;
        photographer?: { name: string; avatar?: string } | string | null;
        supervisor?: { name: string; avatar?: string } | string | null;
        editor?: { id: string; name: string; avatar?: string } | string | null;
        file_links?: FileLinkItem[];
        highlights?: HighlightItem[];
        payments?: PaymentItem[];
        notes_list?: NoteItem[];
    };
    timeline?: TimelineData;
    testimonials?: TestimonialDetailItem[];
    company?: any;
}

export default function ClientProjectDetail({
    project,
    timeline = {
        current_step: 1,
        total_steps: 8,
        steps: [],
    },
    testimonials = [],
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
    const [selectedStepNumber, setSelectedStepNumber] = useState<number>(timeline?.current_step || 1);
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(5);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [currentTestimonialIdx, setCurrentTestimonialIdx] = useState(0);

    // Dynamic database props without dummy data
    const fileList: FileLinkItem[] = project?.file_links || [];
    const notesList: NoteItem[] = project?.notes_list || [];
    const highlightPhotos: HighlightItem[] = project?.highlights || [];
    const testimonialList: TestimonialDetailItem[] = testimonials || [];
    const activeTestimonial = testimonialList.length > 0 ? testimonialList[currentTestimonialIdx % testimonialList.length] : null;

    const selectedStep = (timeline?.steps && timeline.steps.length > 0)
        ? (timeline.steps.find((s) => s.step === selectedStepNumber) || timeline.steps[0])
        : {
              step: 1,
              name: 'Booking & DP',
              title: 'Booking & DP',
              desc: 'Tanda jadi & penguncian jadwal tanggal acara',
              status: 'completed' as const,
              status_label: 'Selesai',
              date: project?.event_date,
              tasks: [],
          };

    const totalAmount = Number(project?.total_amount || 0);
    const paidAmount = Number(project?.paid_amount || 0);
    const sisaTagihan = Math.max(0, totalAmount - paidAmount);
    const paymentPercentage = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;
    const isLunas = sisaTagihan === 0 && totalAmount > 0;

    const photographerName = typeof project?.photographer === 'object' && project?.photographer !== null
        ? project.photographer.name
        : (typeof project?.photographer === 'string' ? project.photographer : 'Arams Team');

    const supervisorName = typeof project?.supervisor === 'object' && project?.supervisor !== null
        ? project.supervisor.name
        : (typeof project?.supervisor === 'string' ? project.supervisor : 'Bima Arams');

    const editorName = typeof project?.editor === 'object' && project?.editor !== null
        ? project.editor.name
        : (typeof project?.editor === 'string' ? project.editor : 'Arams Editor');

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
        if (!reviewText.trim()) {
            toast.error('Mohon tulis ulasan Anda terlebih dahulu.');
            return;
        }

        setSubmittingReview(true);
        router.post(
            `/client/projects/${project.id}/review`,
            {
                rating,
                comment: reviewText,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Terima kasih! Ulasan Anda berhasil dikirim.');
                    setReviewText('');
                    setSubmittingReview(false);
                },
                onError: (errors) => {
                    const firstErr = (Object.values(errors)[0] as string) || 'Gagal mengirim ulasan.';
                    toast.error(firstErr);
                    setSubmittingReview(false);
                },
            }
        );
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
                                <span
                                    className={`px-3 py-0.5 rounded-lg text-xs font-bold border ${
                                        project.status === 'completed' || project.workflow_step === 'selesai'
                                            ? 'bg-[#EBF7EE] text-[#1E7E34] border-[#C3E6CB]'
                                            : 'bg-amber-50 text-amber-800 border-amber-200'
                                    }`}
                                >
                                    {project.status === 'completed' || project.workflow_step === 'selesai' ? 'Selesai' : 'Dalam Proses'}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium pt-1">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{project.event_date || 'Tanggal belum ditentukan'}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{project.location || 'Studio Arams Pictures'}</span>
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
                                <strong className="text-slate-900 font-bold">{photographerName}</strong>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-400 block font-medium">Supervisor</span>
                                <strong className="text-slate-900 font-bold">{supervisorName}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Right Portrait Showcase */}
                    <div className="relative z-10 hidden md:block w-52 lg:w-64 h-36 lg:h-40 rounded-2xl overflow-hidden shadow-xs border border-slate-200/80 shrink-0">
                        <img
                            src={highlightPhotos.find(h => h.is_cover)?.image_url || highlightPhotos[0]?.image_url || '/images/wedding-couple.jpg'}
                            alt={project.name}
                            className="w-full h-full object-cover"
                        />
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

                            {/* ── 8-Step Interactive Timeline Stepper ── */}
                            <div className="pt-2">
                                <div className="flex items-center justify-between relative pb-4">
                                    {/* Background Line */}
                                    <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-200 -z-0" />
                                    {timeline.steps.map((step) => {
                                        const isDone = step.status === 'completed';
                                        const isActive = step.status === 'active';
                                        const isSelected = selectedStep.step === step.step;

                                        return (
                                            <div key={step.step} className="flex flex-col items-center relative z-10 flex-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedStepNumber(step.step)}
                                                    title={`Klik untuk melihat detail tahap ${step.step}: ${step.title || step.name}`}
                                                    style={
                                                        isSelected
                                                            ? {
                                                                  backgroundColor: portalPrimaryAccent,
                                                                  color: '#FFFFFF',
                                                                  boxShadow: `0 0 0 4px ${portalPrimaryAccent}30`,
                                                              }
                                                            : isDone
                                                            ? {
                                                                  backgroundColor: '#059669',
                                                                  color: '#FFFFFF',
                                                              }
                                                            : isActive
                                                            ? {
                                                                  backgroundColor: portalPrimaryAccent,
                                                                  color: '#FFFFFF',
                                                              }
                                                            : {
                                                                  backgroundColor: '#F1F5F9',
                                                                  color: '#94A3B8',
                                                              }
                                                    }
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all cursor-pointer transform hover:scale-115 active:scale-95 ${
                                                        isSelected ? 'scale-120 ring-2 ring-offset-2 ring-rose-400 z-20' : ''
                                                    } ${!isDone && !isActive && !isSelected ? 'border border-slate-200 hover:border-slate-300' : 'shadow-xs'}`}
                                                >
                                                    {isDone ? (
                                                        <Check className="w-4 h-4 stroke-[3]" />
                                                    ) : (
                                                        step.step
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedStepNumber(step.step)}
                                                    className="text-left flex flex-col items-center cursor-pointer mt-1.5 group max-w-[80px]"
                                                >
                                                    <span
                                                        style={isSelected || isActive ? { color: portalPrimaryAccent } : {}}
                                                        className={`text-[10px] font-bold text-center hidden sm:block transition-colors group-hover:underline line-clamp-1 ${
                                                            !isSelected && !isActive ? (isDone ? 'text-slate-800' : 'text-slate-400') : ''
                                                        }`}
                                                    >
                                                        {step.title || step.name}
                                                    </span>
                                                    <span
                                                        className={`text-[8.5px] font-semibold hidden sm:block ${
                                                            isDone
                                                                ? 'text-emerald-600'
                                                                : isActive
                                                                ? 'text-amber-600'
                                                                : 'text-slate-400'
                                                        }`}
                                                    >
                                                        {step.status_label || (isDone ? 'Selesai' : isActive ? 'Sedang Diproses' : 'Menunggu')}
                                                    </span>
                                                    {step.date && (
                                                        <span className="text-[8px] text-slate-400 hidden md:block mt-0.5">
                                                            {step.date}
                                                        </span>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── CARD DETAIL TAHAPAN YANG DIPILIH (Interactive Inspector) ── */}
                            <div
                                style={{
                                    backgroundColor: `${portalPrimaryAccent}05`,
                                    borderColor: `${portalPrimaryAccent}25`,
                                }}
                                className="rounded-2xl border p-5 sm:p-6 space-y-4 transition-all"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span
                                                style={{
                                                    backgroundColor: `${portalPrimaryAccent}15`,
                                                    color: portalPrimaryAccent,
                                                    borderColor: `${portalPrimaryAccent}35`,
                                                }}
                                                className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border"
                                            >
                                                Tahap {selectedStep.step} dari {timeline.steps.length || 8}
                                            </span>
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                                                    selectedStep.status === 'completed'
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                        : selectedStep.status === 'active'
                                                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}
                                            >
                                                {selectedStep.status_label || (selectedStep.status === 'completed' ? 'Selesai' : selectedStep.status === 'active' ? 'Sedang Diproses' : 'Menunggu')}
                                            </span>
                                            {selectedStep.date && (
                                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>{selectedStep.date}</span>
                                                </span>
                                            )}
                                        </div>
                                        <h4
                                            style={{
                                                fontFamily: `'${portalFontHeading}', serif`,
                                                color: portalHeadingColor,
                                            }}
                                            className="text-lg font-serif font-black"
                                        >
                                            {selectedStep.title || selectedStep.name}
                                        </h4>
                                        <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                                            {selectedStep.desc || selectedStep.description || 'Tahap pengerjaan ini dipersiapkan dengan teliti oleh tim profesional Arams Pictures.'}
                                        </p>
                                    </div>

                                    {/* Navigation prev/next buttons */}
                                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                                        <button
                                            type="button"
                                            disabled={selectedStep.step <= 1}
                                            onClick={() => setSelectedStepNumber((prev) => Math.max(1, prev - 1))}
                                            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Sebelumnya</span>
                                        </button>
                                        <button
                                            type="button"
                                            disabled={selectedStep.step >= (timeline.steps.length || 8)}
                                            onClick={() => setSelectedStepNumber((prev) => Math.min(timeline.steps.length || 8, prev + 1))}
                                            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                                        >
                                            <span className="hidden sm:inline">Selanjutnya</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Metadata Cards: PIC & Akses */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                    <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs">
                                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Penanggung Jawab (PIC)</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div
                                                style={{
                                                    backgroundColor: `${portalPrimaryAccent}15`,
                                                    color: portalPrimaryAccent,
                                                }}
                                                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                                            >
                                                <UserCheck className="w-3.5 h-3.5" />
                                            </div>
                                            <strong className="text-slate-800 text-xs font-bold truncate">
                                                {selectedStep.pic || supervisorName || 'Tim Operasional Arams'}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs">
                                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Status Tahapan</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                                selectedStep.status === 'completed'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : selectedStep.status === 'active'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {selectedStep.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                            </div>
                                            <strong className="text-slate-800 text-xs font-bold">
                                                {selectedStep.status_label || (selectedStep.status === 'completed' ? 'Telah Selesai' : selectedStep.status === 'active' ? 'Sedang Berjalan' : 'Menunggu Jadwal')}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs">
                                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Akses Terkait</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <button
                                                type="button"
                                                onClick={() => scrollToSection('files')}
                                                className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                                            >
                                                <span>File &amp; Drive</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </button>
                                            <span className="text-slate-300">•</span>
                                            <button
                                                type="button"
                                                onClick={() => scrollToSection('catatan')}
                                                className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                                            >
                                                <span>Catatan</span>
                                                <Edit3 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Checklist SOP Sub-Tugas */}
                                {selectedStep.tasks && selectedStep.tasks.length > 0 && (
                                    <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
                                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                                            <ListChecks className="w-4 h-4 text-indigo-600" />
                                            <span>Checklist Aktivitas Tahapan Ini:</span>
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {selectedStep.tasks.map((task, tidx) => (
                                                <div
                                                    key={tidx}
                                                    className={`flex items-start gap-2 p-2.5 rounded-xl text-xs transition-colors border ${
                                                        task.completed
                                                            ? 'bg-emerald-50/70 border-emerald-200/60 text-emerald-950 font-medium'
                                                            : 'bg-slate-50/80 border-slate-200/60 text-slate-600'
                                                    }`}
                                                >
                                                    <div className="mt-0.5 shrink-0">
                                                        {task.completed ? (
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                                                        ) : (
                                                            <Circle className="w-4 h-4 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <span className={task.completed ? 'text-slate-800' : 'text-slate-500'}>
                                                        {task.title}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Project Status Banner */}
                            {project.status === 'completed' || project.workflow_step === 'selesai' ? (
                                <div className="bg-[#EBF7EE] border border-[#C3E6CB] rounded-2xl p-4 flex items-center gap-3 text-xs text-[#1E7E34]">
                                    <div className="w-7 h-7 rounded-full bg-[#28A745] text-white flex items-center justify-center shrink-0">
                                        <Check className="w-4 h-4 stroke-[3]" />
                                    </div>
                                    <div>
                                        <strong className="font-bold text-slate-900 block text-xs">Project telah selesai!</strong>
                                        <span className="text-slate-600 text-[11px]">Terima kasih telah mempercayakan momen berharga Anda kepada Arams Pictures.</span>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        backgroundColor: `${portalPrimaryAccent}08`,
                                        borderColor: `${portalPrimaryAccent}25`,
                                    }}
                                    className="border rounded-2xl p-4 flex items-center gap-3 text-xs"
                                >
                                    <div
                                        style={{
                                            backgroundColor: portalPrimaryAccent,
                                            color: '#FFFFFF',
                                        }}
                                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                    >
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <strong className="font-bold text-slate-900 block text-xs">
                                            Tahap Berjalan: {timeline.current_step_name || selectedStep.title || 'Proses Pengerjaan'}
                                        </strong>
                                        <span className="text-slate-600 text-[11px]">
                                            {timeline.active_step_desc || 'Tahap pengerjaan saat ini sedang diproses oleh tim kami. Klik lingkaran nomor tahapan di atas untuk melihat detail masing-masing proses.'}
                                        </span>
                                    </div>
                                </div>
                            )}
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
                                    </div>

                                    {fileList.length === 0 ? (
                                        <div className="py-8 text-center text-slate-400 text-xs">
                                            Belum ada file atau tautan Google Drive yang dibagikan untuk project ini.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                            {fileList.map((file) => (
                                                <div
                                                    key={file.id}
                                                    className="bg-[#FAF8F5] border border-slate-200/80 rounded-2xl p-3 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
                                                >
                                                    <div className="space-y-2">
                                                        {file.is_link || file.file_type === 'link' ? (
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
                                                                {file.date_label || 'Tautan Berkas'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <a
                                                        href={file.drive_url || '#'}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A151B] hover:underline cursor-pointer pt-1"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        <span>{file.is_link || file.file_type === 'link' ? 'Buka Link' : 'Unduh File'}</span>
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
                                    </div>

                                    {notesList.length === 0 ? (
                                        <div className="py-6 text-center text-slate-400 text-xs">
                                            Belum ada catatan aktivitas untuk project ini.
                                        </div>
                                    ) : (
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
                                                            </div>
                                                        </div>
                                                        <p className="text-[11px] text-slate-600 leading-relaxed">
                                                            {note.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

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
                                            <span className="font-bold text-slate-900">{formatRupiah(totalAmount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Total Dibayar</span>
                                            <span className="font-bold text-emerald-600">{formatRupiah(paidAmount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Sisa Tagihan</span>
                                            <span className={`font-bold ${sisaTagihan > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                                                {formatRupiah(sisaTagihan)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-1">
                                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    backgroundColor: portalPrimaryAccent,
                                                    width: `${paymentPercentage}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="text-right text-[10px] font-bold text-slate-500">{paymentPercentage}%</div>
                                    </div>

                                    {/* Lunas or Tagihan Box */}
                                    {isLunas ? (
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
                                    ) : (
                                        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800">
                                            <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                                                <CreditCard className="w-3 h-3" />
                                            </div>
                                            <div>
                                                <strong className="font-bold text-slate-900">Menunggu Pelunasan</strong>
                                                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                                                    Sisa tagihan yang belum terbayar: {formatRupiah(sisaTagihan)}.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => toast.info(isLunas ? 'Semua tagihan telah lunas.' : `Sisa tagihan ${formatRupiah(sisaTagihan)}.`)}
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
                                            <span className="text-xs font-bold text-slate-900 ml-1.5">{rating}.0</span>
                                            <span className="text-[11px] text-slate-500 font-medium">
                                                {rating === 5 ? 'Sangat Puas' : (rating >= 4 ? 'Puas' : (rating >= 3 ? 'Cukup' : 'Kurang'))}
                                            </span>
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
                                            disabled={submittingReview}
                                            style={{
                                                backgroundColor: portalPrimaryAccent,
                                                color: '#FFFFFF',
                                            }}
                                            className="w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:opacity-90 disabled:opacity-50"
                                        >
                                            {submittingReview ? 'Mengirim Ulasan...' : 'Kirim Ulasan'}
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
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                {highlightPhotos.length > 0 ? (
                                    highlightPhotos.map((hl, i) => (
                                        <div key={hl.id || i} className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 shadow-2xs relative group">
                                            <img
                                                src={hl.image_url}
                                                alt={hl.title || `Highlight ${i + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {hl.title && (
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-[10px] text-white font-bold truncate">{hl.title}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                                        Belum ada foto highlight untuk project ini.
                                    </div>
                                )}
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
                            </div>

                            {activeTestimonial ? (
                                <div className="bg-[#FAF8F5] border border-slate-200/70 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                            <img
                                                src={activeTestimonial.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                                                alt={activeTestimonial.client_name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h5 className="font-bold text-xs text-slate-900">{activeTestimonial.client_name}</h5>
                                                <span className="text-[10px] text-slate-400">{activeTestimonial.package_name || packageDisplayName}</span>
                                                <div className="flex items-center gap-0.5 text-amber-500">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3 h-3 ${
                                                                i < activeTestimonial.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'
                                                            }`}
                                                        />
                                                    ))}
                                                    <span className="text-[10px] font-bold text-slate-800 ml-1">
                                                        {Number(activeTestimonial.rating).toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed italic">
                                                "{activeTestimonial.comment}"
                                            </p>
                                            {activeTestimonial.date && (
                                                <span className="text-[10px] text-slate-400 block pt-0.5">{activeTestimonial.date}</span>
                                            )}
                                        </div>
                                    </div>

                                    {testimonialList.length > 1 && (
                                        <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => setCurrentTestimonialIdx((prev) => (prev === 0 ? testimonialList.length - 1 : prev - 1))}
                                                className="w-7 h-7 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors"
                                                title="Ulasan sebelumnya"
                                            >
                                                <ChevronLeft className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentTestimonialIdx((prev) => (prev + 1) % testimonialList.length)}
                                                className="w-7 h-7 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors"
                                                title="Ulasan selanjutnya"
                                            >
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="py-6 text-center text-slate-400 text-xs">
                                    Belum ada ulasan untuk ditampilkan. Tulis ulasan pertama Anda pada form di atas.
                                </div>
                            )}
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
                                <span className={`px-3 py-1 rounded-xl border text-xs font-bold ${
                                    project.status === 'completed' || project.workflow_step === 'selesai'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                    Status: {project.status === 'completed' || project.workflow_step === 'selesai' ? 'Selesai' : 'Dalam Proses'}
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
                                            <span className="font-bold text-slate-900">{project.event_date || 'Tanggal belum ditentukan'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Waktu Acara:</span>
                                            <span className="font-bold text-slate-900">{project.event_time || '10:00 WIB'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Lokasi / Venue:</span>
                                            <span className="font-semibold text-slate-900 text-right max-w-[200px]">{project.location || 'Studio Arams Pictures'}</span>
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
                                            <span className="font-bold text-slate-900">{supervisorName}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Photographer:</span>
                                            <span className="font-bold text-slate-900">{photographerName}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Editor:</span>
                                            <span className="font-bold text-slate-900">{editorName}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-500">Status Pembayaran:</span>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                isLunas ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {isLunas ? 'Lunas (100%)' : `Belum Lunas (${paymentPercentage}%)`}
                                            </span>
                                        </div>
                                        <div className="pt-2 border-t border-slate-200/60">
                                            <span className="text-slate-500 block text-[10px] mb-1">Catatan Klien:</span>
                                            <p className="text-slate-700 italic text-[11px] leading-relaxed">
                                                {project.notes ? `"${project.notes}"` : 'Tidak ada catatan khusus.'}
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
