import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ClientLayout } from '@/layouts/ClientLayout';
import {
    Calendar,
    Check,
    ChevronLeft,
    ChevronRight,
    Download,
    ExternalLink,
    Folder,
    HelpCircle,
    Info,
    Layers,
    MessageCircle,
    Shield,
    Sparkles,
    Star,
    Video,
    Award,
    HeartHandshake,
    Workflow,
    Lock,
    Clock,
    FileText,
    Image as ImageIcon,
    CheckCircle2,
    ArrowUpRight,
    Instagram,
    Heart,
    Quote,
    Camera,
    Users,
    Play,
    CreditCard,
    ArrowRight,
    Compass,
    RefreshCw,
    MapPin,
} from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';

interface FileLinkItem {
    id: string;
    name: string;
    drive_url?: string | null;
    file_type?: string | null;
    created_at?: string;
}

interface TimelineStep {
    step: number;
    title?: string;
    name?: string;
    desc?: string;
    description?: string;
    status: 'completed' | 'active' | 'upcoming' | 'pending';
    status_label?: string;
    date?: string;
    target_date?: string;
    tasks?: Array<{ title: string; completed: boolean }>;
}

interface RecommendedPackage {
    id: string;
    name: string;
    price: string;
    description: string;
    image: string;
}

interface PromoSlideItem {
    id: string;
    tag: string;
    title: string;
    description?: string;
    button_text: string;
    button_url?: string;
    image: string;
}

interface TestimonialItem {
    id: string;
    client_name: string;
    package_name?: string;
    rating: number;
    comment: string;
    avatar?: string;
}

interface InstagramPostItem {
    id: string;
    image: string;
    caption?: string;
    likes?: number;
    comments?: number;
    post_url?: string;
    type?: string;
}

interface RecommendedItem {
    id: string;
    name?: string;
    title?: string;
    desc?: string;
    description?: string;
    price?: string;
    base_price?: number;
    image?: string;
    category_name?: string;
}

interface ClientDashboardProps {
    client?: {
        id: string;
        name: string;
        partner_name?: string | null;
        email: string;
        phone?: string | null;
        avatar?: string | null;
    } | null;
    active_project?: {
        id: string;
        project_number: string;
        name: string;
        category_name: string;
        package_name: string;
        status: string;
        workflow_step: string;
        progress: number;
        event_date?: string;
        location?: string;
        total_amount: number;
        paid_amount: number;
        file_links?: FileLinkItem[];
        highlights?: Array<{
            id: string;
            title?: string;
            caption?: string;
            image_url: string;
            is_cover?: boolean;
        }>;
    } | null;
    timeline?: {
        current_step: number;
        active_step_title: string;
        active_step_desc: string;
        steps: TimelineStep[];
    };
    payment_summary?: {
        total_amount: number;
        paid_amount: number;
        remaining_amount: number;
        paid_percentage: number;
        last_payment_label?: string;
        last_payment_date?: string;
    };
    promo_slides?: PromoSlideItem[];
    recommended_projects?: RecommendedItem[];
    instagram_posts?: InstagramPostItem[];
    testimonials?: TestimonialItem[];
    company?: any;
}

export default function ClientDashboard({
    client = null,
    active_project = null,
    timeline = {
        current_step: 1,
        active_step_title: 'Mulai Perjalanan',
        active_step_desc: 'Proyek Anda sedang kami persiapkan.',
        steps: [],
    },
    payment_summary = {
        total_amount: 0,
        paid_amount: 0,
        remaining_amount: 0,
        paid_percentage: 0,
    },
    promo_slides = [],
    recommended_projects = [],
    instagram_posts = [],
    testimonials = [],
    company = {},
}: ClientDashboardProps) {
    const { props: pageProps } = usePage<any>();
    const appSettings = pageProps?.appSettings || {};

    // Dynamic portal tokens
    const portalPrimaryAccent = appSettings.portal_primary_accent || '#4A151B';
    const portalHeroBg = appSettings.portal_hero_bg || '#240B10';
    const portalHeroGradient = appSettings.portal_hero_gradient || '';
    const portalHeroText = appSettings.portal_hero_text_color || '#FFFFFF';
    const portalCardBg = appSettings.portal_card_bg || '#FFFFFF';
    const portalCardBorder = appSettings.portal_card_border || 'rgba(226, 232, 240, 0.8)';
    const portalHeadingColor = appSettings.portal_heading_color || '#240B10';
    const portalFontHeading = appSettings.portal_font_heading || 'Plus Jakarta Sans';
    const portalFooterText = appSettings.portal_footer_text || '#FDA4AF';

    const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
    const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
    const [selectedDashboardStepNum, setSelectedDashboardStepNum] = useState<number>(timeline.current_step || 1);

    const selectedDashboardStep = (timeline.steps && timeline.steps.length > 0)
        ? (timeline.steps.find((s) => s.step === selectedDashboardStepNum) || timeline.steps[0])
        : null;

    // Database content with seamless fallback
    const promoSlides: PromoSlideItem[] = (promo_slides && promo_slides.length > 0)
        ? promo_slides
        : [
            {
                id: '1',
                tag: 'SPECIAL OFFER',
                title: 'Abadikan Momen Terbaikmu dengan Arams Pictures',
                description: 'Promo spesial untuk setiap momen berharga Anda. Dapatkan penawaran terbaik untuk paket pilihan Anda.',
                button_text: 'Lihat Promo Selengkapnya',
                button_url: '/form-klien',
                image: '/images/wedding-couple.jpg',
            },
        ];

    const recommendedProjects: RecommendedItem[] = (recommended_projects && recommended_projects.length > 0)
        ? recommended_projects
        : [];

    const instagramPhotos: InstagramPostItem[] = (instagram_posts && instagram_posts.length > 0)
        ? instagram_posts
        : [];

    const testimonialList: TestimonialItem[] = (testimonials && testimonials.length > 0)
        ? testimonials
        : [];

    const activePromo = promoSlides[currentPromoIndex % promoSlides.length] || promoSlides[0];
    const activeTestimonial = testimonialList.length > 0
        ? testimonialList[currentTestimonialIndex % testimonialList.length]
        : null;

    return (
        <ClientLayout>
            <Head title="Dashboard Client Portal - Arams Pictures" />

            <div className="space-y-8">
                {/* ── 1. HERO CAROUSEL BANNER (Screenshot 1) ───────────────── */}
                <section
                    style={{
                        background: portalHeroGradient || portalHeroBg,
                        color: portalHeroText,
                        borderColor: portalCardBorder,
                    }}
                    className="relative rounded-3xl overflow-hidden shadow-md min-h-[300px] sm:min-h-[340px] flex items-center border transition-colors"
                >
                    <div className="absolute inset-0 z-0">
                        <img
                            src={activePromo.image}
                            alt={activePromo.title}
                            className="w-full h-full object-cover object-right opacity-30 filter brightness-90"
                        />
                        <div
                            style={{
                                background: `linear-gradient(to right, ${portalHeroBg} 0%, ${portalHeroBg}dd 65%, transparent 100%)`,
                            }}
                            className="absolute inset-0"
                        />
                    </div>

                    <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-2xl space-y-3">
                        <span
                            style={{ color: portalFooterText || '#FDA4AF' }}
                            className="text-[10px] font-extrabold tracking-[0.25em] uppercase block"
                        >
                            {activePromo.tag}
                        </span>
                        <h1
                            style={{
                                fontFamily: `'${portalFontHeading}', serif`,
                                color: portalHeroText,
                            }}
                            className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight leading-tight"
                        >
                            {activePromo.title}
                        </h1>
                        <p className="text-xs sm:text-sm opacity-90 leading-relaxed max-w-lg">
                            {activePromo.description}
                        </p>
                        <div className="pt-2">
                            <Link
                                href={activePromo.button_url || '/form-klien'}
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    color: portalHeroBg,
                                }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer"
                            >
                                <span>{activePromo.button_text}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Left & Right Circular Arrows */}
                    <button
                        type="button"
                        onClick={() => setCurrentPromoIndex((prev) => (prev === 0 ? promoSlides.length - 1 : prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center cursor-pointer transition-colors z-10"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentPromoIndex((prev) => (prev + 1) % promoSlides.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center cursor-pointer transition-colors z-10"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Pagination Dots */}
                    <div className="absolute bottom-3.5 inset-x-0 flex justify-center items-center gap-1.5 z-10">
                        {promoSlides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentPromoIndex(idx)}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                    currentPromoIndex === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                                }`}
                            />
                        ))}
                    </div>
                </section>

                {/* ── 2. GREETING & 4 STAT CARDS (Screenshot 1) ─────────────── */}
                <section className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h2
                                style={{
                                    fontFamily: `'${portalFontHeading}', serif`,
                                    color: portalHeadingColor,
                                }}
                                className="text-xl sm:text-2xl font-serif font-black flex items-center gap-2"
                            >
                                <span>Selamat datang, {client?.name || 'Andi Pratama'}</span>
                                <Heart
                                    style={{
                                        color: portalPrimaryAccent,
                                        fill: portalPrimaryAccent,
                                    }}
                                    className="w-4 h-4 inline"
                                />
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Terima kasih telah mempercayakan momen berharga Anda bersama Arams Pictures.
                            </p>
                        </div>
                        <Link
                            href="/client/projects"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors self-start sm:self-auto"
                        >
                            <span>Lihat Semua Project</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Stat 1: Total Project */}
                        <div
                            style={{
                                backgroundColor: portalCardBg,
                                borderColor: portalCardBorder,
                            }}
                            className="p-4 sm:p-5 rounded-2xl border shadow-2xs space-y-3 flex flex-col justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    style={{
                                        backgroundColor: `${portalPrimaryAccent}15`,
                                        color: portalPrimaryAccent,
                                        borderColor: `${portalPrimaryAccent}25`,
                                    }}
                                    className="w-10 h-10 rounded-xl border flex items-center justify-center"
                                >
                                    <Folder className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-2xl font-black text-slate-900 block leading-tight">1</span>
                                    <span className="text-[11px] text-slate-500 font-medium">Total Project</span>
                                </div>
                            </div>
                            <Link
                                href="/client/projects"
                                style={{ color: portalPrimaryAccent }}
                                className="inline-flex items-center gap-1 text-[11px] font-bold hover:underline pt-1"
                            >
                                <span>Lihat semua project</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        {/* Stat 2: Tanggal Acara */}
                        <div
                            style={{
                                backgroundColor: portalCardBg,
                                borderColor: portalCardBorder,
                            }}
                            className="p-4 sm:p-5 rounded-2xl border shadow-2xs space-y-3 flex flex-col justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    style={{
                                        backgroundColor: `${portalPrimaryAccent}15`,
                                        color: portalPrimaryAccent,
                                        borderColor: `${portalPrimaryAccent}25`,
                                    }}
                                    className="w-10 h-10 rounded-xl border flex items-center justify-center"
                                >
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-lg sm:text-xl font-black text-slate-900 block leading-tight">12 Des 2026</span>
                                    <span className="text-[11px] text-slate-500 font-medium">Tanggal Acara</span>
                                </div>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">Wedding Day</span>
                        </div>

                        {/* Stat 3: Invoice */}
                        <div
                            style={{
                                backgroundColor: portalCardBg,
                                borderColor: portalCardBorder,
                            }}
                            className="p-4 sm:p-5 rounded-2xl border shadow-2xs space-y-3 flex flex-col justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    style={{
                                        backgroundColor: `${portalPrimaryAccent}15`,
                                        color: portalPrimaryAccent,
                                        borderColor: `${portalPrimaryAccent}25`,
                                    }}
                                    className="w-10 h-10 rounded-xl border flex items-center justify-center"
                                >
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-2xl font-black text-slate-900 block leading-tight">1</span>
                                    <span className="text-[11px] text-slate-500 font-medium">Invoice</span>
                                </div>
                            </div>
                            <Link
                                href="/client/projects"
                                style={{ color: portalPrimaryAccent }}
                                className="inline-flex items-center gap-1 text-[11px] font-bold hover:underline pt-1"
                            >
                                <span>Lihat invoice</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        {/* Stat 4: Pembayaran */}
                        <div
                            style={{
                                backgroundColor: portalCardBg,
                                borderColor: portalCardBorder,
                            }}
                            className="p-4 sm:p-5 rounded-2xl border shadow-2xs space-y-3 flex flex-col justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    style={{
                                        backgroundColor: `${portalPrimaryAccent}15`,
                                        color: portalPrimaryAccent,
                                        borderColor: `${portalPrimaryAccent}25`,
                                    }}
                                    className="w-10 h-10 rounded-xl border flex items-center justify-center"
                                >
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-2xl font-black text-slate-900 block leading-tight">0</span>
                                    <span className="text-[11px] text-slate-500 font-medium">Pembayaran</span>
                                </div>
                            </div>
                            <Link
                                href="/client/projects"
                                style={{ color: portalPrimaryAccent }}
                                className="inline-flex items-center gap-1 text-[11px] font-bold hover:underline pt-1"
                            >
                                <span>Lihat riwayat</span>
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── 3. STATUS PROJECT ANDA (Screenshot 1) ─────────────────── */}
                <section
                    style={{
                        backgroundColor: portalCardBg,
                        borderColor: portalCardBorder,
                    }}
                    className="rounded-3xl border p-6 sm:p-8 shadow-2xs space-y-6 transition-colors"
                >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h3
                            style={{
                                fontFamily: `'${portalFontHeading}', serif`,
                                color: portalHeadingColor,
                            }}
                            className="text-base font-serif font-bold"
                        >
                            Status Project Anda
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span>Terakhir diperbarui: 27 Agustus 2026</span>
                            <RefreshCw className="w-3 h-3" />
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                        {/* Left Portrait Photo */}
                        <div className="w-full sm:w-44 h-48 sm:h-52 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-2xs">
                            <img
                                src="/images/wedding-couple.jpg"
                                alt="Wedding Couple"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Right Content */}
                        <div className="flex-1 space-y-4 w-full">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4
                                        style={{
                                            fontFamily: `'${portalFontHeading}', serif`,
                                            color: portalHeadingColor,
                                        }}
                                        className="text-lg sm:text-xl font-serif font-black"
                                    >
                                        Wedding Andi &amp; Sari
                                    </h4>
                                    <span
                                        style={{
                                            backgroundColor: `${portalPrimaryAccent}15`,
                                            color: portalPrimaryAccent,
                                            borderColor: `${portalPrimaryAccent}35`,
                                        }}
                                        className="px-2.5 py-0.5 rounded-md text-[10px] font-bold border"
                                    >
                                        Dalam Proses
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        <span>12 Desember 2026</span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Gedung Graha Arams, Tangerang Selatan</span>
                                    </div>
                                </div>
                            </div>

                            {/* 8-Step Timeline Horizontal Stepper */}
                            <div className="pt-2">
                                <div className="flex items-center justify-between relative pb-2">
                                    <div className="absolute left-4 right-4 top-3.5 h-0.5 bg-slate-200 -z-0" />
                                    {timeline.steps.map((step) => {
                                        const isDone = step.status === 'completed';
                                        const isActive = step.status === 'active';
                                        const isSelected = selectedDashboardStep?.step === step.step;

                                        return (
                                            <div key={step.step} className="flex flex-col items-center relative z-10 flex-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedDashboardStepNum(step.step)}
                                                    title={`Klik untuk melihat info tahap ${step.step}: ${step.title || step.name}`}
                                                    style={
                                                        isSelected
                                                            ? {
                                                                  backgroundColor: portalPrimaryAccent,
                                                                  color: '#FFFFFF',
                                                                  boxShadow: `0 0 0 4px ${portalPrimaryAccent}25`,
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
                                                            : {}
                                                    }
                                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all cursor-pointer transform hover:scale-115 active:scale-95 ${
                                                        isSelected ? 'scale-120 ring-2 ring-rose-400 z-20' : ''
                                                    } ${
                                                        !isDone && !isActive && !isSelected
                                                            ? 'bg-slate-100 text-slate-400 border border-slate-200 hover:border-slate-300'
                                                            : 'shadow-xs'
                                                    }`}
                                                >
                                                    {isDone ? (
                                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                    ) : (
                                                        step.step
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedDashboardStepNum(step.step)}
                                                    className="text-left flex flex-col items-center cursor-pointer mt-1 group"
                                                >
                                                    <span
                                                        style={isSelected || isActive ? { color: portalPrimaryAccent } : {}}
                                                        className={`text-[10px] font-bold text-center hidden sm:block transition-colors group-hover:underline ${
                                                            !isSelected && !isActive ? (isDone ? 'text-slate-700' : 'text-slate-400') : ''
                                                        }`}
                                                    >
                                                        {step.title || step.name}
                                                    </span>
                                                    <span
                                                        className={`text-[9px] font-semibold hidden sm:block ${
                                                            isDone
                                                                ? 'text-emerald-600'
                                                                : isActive
                                                                ? 'text-amber-600'
                                                                : 'text-slate-400'
                                                        }`}
                                                    >
                                                        {step.status_label || (isDone ? 'Selesai' : isActive ? 'Sedang Diproses' : 'Menunggu')}
                                                    </span>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Alert Box Under Stepper */}
                            <div
                                style={{
                                    backgroundColor: `${portalPrimaryAccent}08`,
                                    borderColor: `${portalPrimaryAccent}25`,
                                }}
                                className="border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                            >
                                <div className="flex items-start sm:items-center gap-3.5 text-xs text-slate-700">
                                    <div
                                        style={{
                                            backgroundColor: `${portalPrimaryAccent}20`,
                                            color: portalPrimaryAccent,
                                        }}
                                        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0"
                                    >
                                        <Compass className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <strong className="text-sm font-bold text-slate-900">
                                                Tahap {selectedDashboardStep?.step || 1}: {selectedDashboardStep?.title || selectedDashboardStep?.name || timeline.active_step_title || 'Proses Pengerjaan'}
                                            </strong>
                                            <span
                                                className={`text-[9.5px] px-2.5 py-0.5 rounded-full font-bold ${
                                                    selectedDashboardStep?.status === 'completed'
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                        : selectedDashboardStep?.status === 'active'
                                                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}
                                            >
                                                {selectedDashboardStep?.status_label || (selectedDashboardStep?.status === 'completed' ? 'Selesai' : selectedDashboardStep?.status === 'active' ? 'Sedang Diproses' : 'Menunggu')}
                                            </span>
                                            {selectedDashboardStep?.date && (
                                                <span className="text-[10.5px] text-slate-400 font-medium inline-flex items-center gap-1">
                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                    <span>{selectedDashboardStep.date}</span>
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                                            {selectedDashboardStep?.desc || selectedDashboardStep?.description || timeline.active_step_desc || 'Tahap pengerjaan saat ini sedang diproses oleh tim kami.'}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={`/client/projects/${active_project?.id || '01a0473f-8eed-730c-a81b-3973c3d66eb3'}`}
                                    style={{ color: portalPrimaryAccent }}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors shrink-0 shadow-2xs hover:scale-[1.02]"
                                >
                                    <span>Lihat Detail Project</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            <p className="text-[10px] text-slate-400">
                                * Catatan: Untuk project non-wedding, proses terdiri dari 5 tahapan.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── 4. FOUR COLUMN GRID (Screenshot 1) ────────────────────── */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Highlight Pembayaran */}
                    <div
                        style={{
                            backgroundColor: portalCardBg,
                            borderColor: portalCardBorder,
                        }}
                        className="rounded-3xl border p-5 shadow-2xs space-y-4 flex flex-col justify-between transition-colors"
                    >
                        <div className="space-y-3">
                            <div className="border-b border-slate-100 pb-2">
                                <h4
                                    style={{ color: portalHeadingColor }}
                                    className="text-xs font-black uppercase tracking-wider"
                                >
                                    Highlight Pembayaran
                                </h4>
                                <p className="text-[10px] text-slate-400">Ringkasan pembayaran project Anda.</p>
                            </div>

                            <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Total Project</span>
                                    <span className="font-bold text-slate-900">Rp50.000.000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Total Dibayar</span>
                                    <span className="font-bold text-emerald-600">Rp25.000.000</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Sisa Tagihan</span>
                                    <span className="font-bold text-rose-600">Rp25.000.000</span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            backgroundColor: portalPrimaryAccent,
                                            width: '50%',
                                        }}
                                    />
                                </div>
                                <div className="text-right text-[10px] font-bold text-slate-500">50%</div>
                            </div>

                            {/* Info Box */}
                            <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Pembayaran Terakhir</span>
                                </div>
                                <span className="font-bold text-slate-800">26 Mei 2026</span>
                            </div>
                        </div>

                        <Link
                            href={`/client/projects/${active_project?.id || '01a0473f-8eed-730c-a81b-3973c3d66eb3'}`}
                            style={{ color: portalPrimaryAccent }}
                            className="w-full py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-center transition-colors block"
                        >
                            Lihat Detail Pembayaran →
                        </Link>
                    </div>

                    {/* Card 2: File Terbaru */}
                    <div
                        style={{
                            backgroundColor: portalCardBg,
                            borderColor: portalCardBorder,
                        }}
                        className="rounded-3xl border p-5 shadow-2xs space-y-4 flex flex-col justify-between transition-colors"
                    >
                        <div className="space-y-3">
                            <div className="border-b border-slate-100 pb-2">
                                <h4
                                    style={{ color: portalHeadingColor }}
                                    className="text-xs font-black uppercase tracking-wider"
                                >
                                    File Terbaru
                                </h4>
                                <p className="text-[10px] text-slate-400">File atau link terbaru yang dibagikan.</p>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="p-2 rounded-xl bg-slate-50 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-slate-900 text-[11px]">Preview Foto (Low Resolution)</p>
                                        <span className="text-[10px] text-slate-400">Dibagikan pada 05 Jun 2026</span>
                                    </div>
                                    <Download className="w-3.5 h-3.5 text-slate-400" />
                                </div>

                                <div className="p-2 rounded-xl bg-slate-50 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-slate-900 text-[11px]">Behind The Scene</p>
                                        <span className="text-[10px] text-slate-400">Dibagikan pada 23 Mei 2026</span>
                                    </div>
                                    <Download className="w-3.5 h-3.5 text-slate-400" />
                                </div>

                                <div className="p-2 rounded-xl bg-slate-50 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-slate-900 text-[11px]">Foto Hari H (RAW)</p>
                                        <span className="text-[10px] text-slate-400">Dibagikan pada 23 Mei 2026</span>
                                    </div>
                                    <Download className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        <Link
                            href={`/client/projects/${active_project?.id || '01a0473f-8eed-730c-a81b-3973c3d66eb3'}`}
                            style={{ color: portalPrimaryAccent }}
                            className="w-full py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-center transition-colors block"
                        >
                            Lihat Semua File &amp; Drive Link →
                        </Link>
                    </div>

                    {/* Card 3: Highlight Project */}
                    <div
                        style={{
                            backgroundColor: portalCardBg,
                            borderColor: portalCardBorder,
                        }}
                        className="rounded-3xl border p-5 shadow-2xs space-y-4 flex flex-col justify-between transition-colors"
                    >
                        <div className="space-y-3">
                            <div className="border-b border-slate-100 pb-2">
                                <h4
                                    style={{ color: portalHeadingColor }}
                                    className="text-xs font-black uppercase tracking-wider"
                                >
                                    Highlight Project
                                </h4>
                                <p className="text-[10px] text-slate-400">Beberapa momen terbaik dari project Anda.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {active_project?.highlights && active_project.highlights.length > 0 ? (
                                    active_project.highlights.slice(0, 4).map((hl: any, idx: number) => (
                                        <div key={hl.id || idx} className="aspect-square rounded-xl overflow-hidden bg-slate-100 relative group">
                                            <img
                                                src={hl.image_url}
                                                alt={hl.title || `Highlight ${idx + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 py-6 text-center text-slate-400 text-xs">
                                        Belum ada foto highlight
                                    </div>
                                )}
                            </div>
                        </div>

                        <Link
                            href={active_project?.id ? `/client/projects/${active_project.id}#section-highlight` : '/client/projects'}
                            style={{ color: portalPrimaryAccent }}
                            className="w-full py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-center transition-colors block"
                        >
                            Lihat Semua Highlight →
                        </Link>
                    </div>

                    {/* Card 4: Ulasan Client */}
                    <div
                        style={{
                            backgroundColor: portalCardBg,
                            borderColor: portalCardBorder,
                        }}
                        className="rounded-3xl border p-5 shadow-2xs space-y-4 flex flex-col justify-between transition-colors"
                    >
                        <div className="space-y-3">
                            <div className="border-b border-slate-100 pb-2">
                                <h4
                                    style={{ color: portalHeadingColor }}
                                    className="text-xs font-black uppercase tracking-wider"
                                >
                                    Ulasan Client
                                </h4>
                                <p className="text-[10px] text-slate-400">Terima kasih atas kepercayaan Anda.</p>
                            </div>

                            {activeTestimonial ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1 text-amber-500">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3.5 h-3.5 ${
                                                    i < activeTestimonial.rating
                                                        ? 'text-amber-500 fill-amber-500'
                                                        : 'text-slate-200'
                                                }`}
                                            />
                                        ))}
                                        <span className="text-xs font-bold text-slate-900 ml-1">
                                            {Number(activeTestimonial.rating).toFixed(1)}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-3">
                                        "{activeTestimonial.comment}"
                                    </p>

                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden shrink-0">
                                                <img
                                                    src={activeTestimonial.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                                    alt={activeTestimonial.client_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-bold text-slate-900 leading-none truncate">
                                                    {activeTestimonial.client_name}
                                                </p>
                                                <span className="text-[10px] text-slate-400 truncate block">
                                                    {activeTestimonial.package_name || 'Dokumentasi'}
                                                </span>
                                            </div>
                                        </div>

                                        {testimonialList.length > 1 && (
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentTestimonialIndex((prev) => (prev === 0 ? testimonialList.length - 1 : prev - 1))}
                                                    className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
                                                    title="Ulasan sebelumnya"
                                                >
                                                    <ChevronLeft className="w-3 h-3" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentTestimonialIndex((prev) => (prev + 1) % testimonialList.length)}
                                                    className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors"
                                                    title="Ulasan selanjutnya"
                                                >
                                                    <ChevronRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-6 text-center text-slate-400 text-xs">
                                    Belum ada ulasan klien.
                                </div>
                            )}
                        </div>

                        <Link
                            href="/client/projects"
                            style={{ color: portalPrimaryAccent }}
                            className="w-full py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-center transition-colors block cursor-pointer"
                        >
                            Lihat Semua Ulasan →
                        </Link>
                    </div>
                </section>

                {/* ── 5. REKOMENDASI PROJECT UNTUK ANDA (Screenshot 1) ─────── */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3
                                style={{
                                    fontFamily: `'${portalFontHeading}', serif`,
                                    color: portalHeadingColor,
                                }}
                                className="text-sm font-black uppercase tracking-wider"
                            >
                                Rekomendasi Project Untuk Anda
                            </h3>
                            <p className="text-xs text-slate-500">
                                Project lainnya yang mungkin menarik untuk momen spesial Anda selanjutnya.
                            </p>
                        </div>
                        <Link
                            href="/client/projects"
                            style={{ color: portalPrimaryAccent }}
                            className="text-xs font-bold hover:underline flex items-center gap-1"
                        >
                            <span>Lihat Semua Project</span>
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {recommendedProjects.map((rec) => (
                            <div key={rec.id} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
                                <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                                    <img src={rec.image} alt={rec.title || rec.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="p-4 space-y-2 flex flex-col flex-1 justify-between">
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-xs text-slate-900">{rec.title || rec.name}</h4>
                                        <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{rec.desc || rec.description}</p>
                                    </div>
                                    <div className="pt-2 space-y-2">
                                        <p className="text-xs font-bold text-slate-900">Mulai dari <span className="text-[#4A151B]">{rec.price || (rec.base_price ? formatRupiah(rec.base_price) : '')}</span></p>
                                        <Link
                                            href={`/form-klien?package_id=${rec.id}`}
                                            className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[11px] font-bold text-slate-700 transition-colors block text-center"
                                        >
                                            Pesan Paket Ini
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 6. DARI INSTAGRAM KAMI (Screenshot 1) ─────────────────── */}
                <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                                Dari Instagram Kami
                            </h3>
                            <p className="text-xs text-slate-500">
                                Intip momen-momen terbaru dan hasil karya kami di Instagram.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 font-medium">{company?.instagram || '@aramspictures'}</span>
                            <a
                                href={company?.instagram_url || 'https://instagram.com/aramspictures'}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#240B10] text-white text-xs font-bold hover:bg-[#380E13] transition-colors"
                            >
                                <Instagram className="w-4 h-4" />
                                <span>Ikuti Kami di Instagram</span>
                            </a>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                        {instagramPhotos.map((photo, i) => (
                            <a
                                key={photo.id || i}
                                href={photo.post_url || 'https://instagram.com/aramspictures'}
                                target="_blank"
                                rel="noreferrer"
                                className="aspect-square rounded-xl overflow-hidden bg-slate-100 relative group block"
                                title={photo.caption || 'Instagram Post'}
                            >
                                <img
                                    src={photo.image}
                                    alt={photo.caption || `Instagram ${i + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1 text-center">
                                    <Instagram className="w-5 h-5 mb-1" />
                                    {photo.likes !== undefined && photo.likes > 0 && (
                                        <span className="text-[10px] font-bold flex items-center gap-1">
                                            <Heart className="w-2.5 h-2.5 fill-white" /> {photo.likes}
                                        </span>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>

                    <div className="text-center pt-2">
                        <a
                            href={company?.instagram_url || 'https://instagram.com/aramspictures'}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                            <span>Lihat Lebih Banyak di Instagram</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </section>
            </div>
        </ClientLayout>
    );
}
