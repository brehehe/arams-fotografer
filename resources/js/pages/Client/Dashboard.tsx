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
    created_at_formatted?: string;
    created_at?: string;
    expires_at?: string;
    is_expired?: boolean;
    days_remaining?: number;
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
    metrics?: {
        total_projects: number;
        total_invoices: number;
        total_payments: number;
        event_date?: string;
        event_category?: string;
    };
    active_project?: {
        id: string;
        project_number: string;
        name: string;
        category_name: string;
        package_name: string;
        status: string;
        status_label?: string;
        last_updated?: string;
        workflow_step: string;
        progress: number;
        event_date?: string;
        event_date_short?: string;
        event_date_raw?: string;
        location?: string;
        thumbnail?: string;
        total_amount: number;
        paid_amount: number;
        payment_status?: string;
        invoices_count?: number;
        payments_count?: number;
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
    metrics = {
        total_projects: 1,
        total_invoices: 1,
        total_payments: 0,
        event_date: '12 Des 2026',
        event_category: 'Wedding Day',
    },
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

    // Safe hex to rgba converter for smooth transparent gradients
    const hexToRgba = (hex: string, alpha: number) => {
        if (!hex || !hex.startsWith('#')) return hex;
        const clean = hex.replace('#', '');
        if (clean.length === 3) {
            const r = parseInt(clean[0] + clean[0], 16);
            const g = parseInt(clean[1] + clean[1], 16);
            const b = parseInt(clean[2] + clean[2], 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        if (clean.length >= 6) {
            const r = parseInt(clean.substring(0, 2), 16);
            const g = parseInt(clean.substring(2, 4), 16);
            const b = parseInt(clean.substring(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return hex;
    };

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
                {/* ── 1. HERO CAROUSEL BANNER (Nyambung ke Header Navbar) ── */}
                <section
                    style={{
                        background: portalHeroGradient || portalHeroBg,
                        color: portalHeroText,
                    }}
                    className="relative -mt-6 sm:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden shadow-lg min-h-[320px] sm:min-h-[440px] lg:min-h-[480px] flex items-center transition-colors"
                >
                    <div className="absolute inset-0 z-0">
                        <img
                            src={activePromo.image}
                            alt={activePromo.title}
                            className="w-full h-full object-cover object-center sm:object-right opacity-80 sm:opacity-95 filter brightness-95 contrast-[1.05] transition-opacity duration-700"
                        />
                        {/* Mobile Gradient Overlay */}
                        <div
                            style={{
                                background: `linear-gradient(to bottom, ${hexToRgba(portalHeroBg, 0.95)} 0%, ${hexToRgba(portalHeroBg, 0.70)} 50%, ${hexToRgba(portalHeroBg, 0.95)} 100%)`,
                            }}
                            className="absolute inset-0 sm:hidden"
                        />
                        {/* Desktop Gradient Overlay */}
                        <div
                            style={{
                                background: `linear-gradient(to right, ${hexToRgba(portalHeroBg, 0.96)} 0%, ${hexToRgba(portalHeroBg, 0.88)} 28%, ${hexToRgba(portalHeroBg, 0.50)} 55%, ${hexToRgba(portalHeroBg, 0.10)} 80%, transparent 100%)`,
                            }}
                            className="absolute inset-0 hidden sm:block"
                        />
                        {/* Subtle bottom vignette to ensure smooth transition with carousel dots */}
                        <div
                            style={{
                                background: `linear-gradient(to top, ${hexToRgba(portalHeroBg, 0.5)} 0%, transparent 30%)`,
                            }}
                            className="absolute inset-0 pointer-events-none"
                        />
                    </div>

                    <div className="relative z-10 w-full max-w-full px-4 sm:px-10 lg:px-12 py-10 sm:py-20 lg:py-24">
                        <div className="max-w-2xl space-y-3 sm:space-y-4 drop-shadow-xs">
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
                                className="text-xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight leading-tight"
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
                                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer"
                                >
                                    <span>{activePromo.button_text}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Left & Right Circular Arrows (Hidden on mobile) */}
                    <button
                        type="button"
                        onClick={() => setCurrentPromoIndex((prev) => (prev === 0 ? promoSlides.length - 1 : prev - 1))}
                        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center cursor-pointer transition-colors z-10 hidden sm:flex"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentPromoIndex((prev) => (prev + 1) % promoSlides.length)}
                        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-white flex items-center justify-center cursor-pointer transition-colors z-10 hidden sm:flex"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Pagination Dots */}
                    <div className="absolute bottom-4 inset-x-0 flex justify-center items-center gap-1.5 z-10">
                        {promoSlides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentPromoIndex(idx)}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                    currentPromoIndex === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
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
                                <span>Selamat datang, {client?.name || 'Klien Arams Pictures'}</span>
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
                                    <span className="text-2xl font-black text-slate-900 block leading-tight">
                                        {metrics?.total_projects ?? 1}
                                    </span>
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
                                    <span className="text-lg sm:text-xl font-black text-slate-900 block leading-tight truncate max-w-[140px]">
                                        {active_project?.event_date_short || metrics?.event_date || 'Belum Dijadwalkan'}
                                    </span>
                                    <span className="text-[11px] text-slate-500 font-medium">Tanggal Acara</span>
                                </div>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium truncate block">
                                {active_project?.category_name || metrics?.event_category || 'Dokumentasi'}
                            </span>
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
                                    <span className="text-2xl font-black text-slate-900 block leading-tight">
                                        {metrics?.total_invoices ?? active_project?.invoices_count ?? 1}
                                    </span>
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
                                    <span className="text-2xl font-black text-slate-900 block leading-tight">
                                        {metrics?.total_payments ?? active_project?.payments_count ?? 0}
                                    </span>
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
                            <span>Terakhir diperbarui: {active_project?.last_updated || 'Hari ini'}</span>
                            <RefreshCw className="w-3 h-3" />
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                        {/* Left Portrait Photo */}
                        <div className="w-full sm:w-44 h-48 sm:h-52 rounded-2xl overflow-hidden bg-slate-100 shrink-0 shadow-2xs">
                            <img
                                src={active_project?.thumbnail || '/images/wedding-couple.jpg'}
                                alt={active_project?.name || 'Wedding Couple'}
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
                                        {active_project?.name || (client ? `Project ${client.name}` : 'Wedding Andi & Sari')}
                                    </h4>
                                    <span
                                        style={{
                                            backgroundColor: `${portalPrimaryAccent}15`,
                                            color: portalPrimaryAccent,
                                            borderColor: `${portalPrimaryAccent}35`,
                                        }}
                                        className="px-2.5 py-0.5 rounded-md text-[10px] font-bold border"
                                    >
                                        {active_project?.status_label || (active_project?.status === 'completed' ? 'Selesai' : 'Dalam Proses')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{active_project?.event_date || 'Tanggal belum dijadwalkan'}</span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{active_project?.location || 'Studio Arams Pictures'}</span>
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
                                    href={active_project?.id ? `/client/projects/${active_project.id}` : '/client/projects'}
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

                {/* ── 4. TWO-BY-TWO GRID (2x2) ─────────────────────────────── */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {/* Card 1: Highlight Pembayaran */}
                    <div
                        style={{
                            backgroundColor: portalCardBg,
                            borderColor: portalCardBorder,
                        }}
                        className="rounded-3xl border p-5 sm:p-6 shadow-2xs flex flex-col justify-between transition-colors h-full"
                    >
                        <div className="space-y-4">
                            <div className="border-b border-slate-100 pb-3 min-h-[50px] flex flex-col justify-center">
                                <h4
                                    style={{ color: portalHeadingColor }}
                                    className="text-xs font-black uppercase tracking-wider"
                                >
                                    Highlight Pembayaran
                                </h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">Ringkasan pembayaran project Anda.</p>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center py-0.5">
                                    <span className="text-slate-500 font-medium">Total Project</span>
                                    <span className="font-bold text-slate-900 text-sm">
                                        {payment_summary?.total_amount ? `Rp${payment_summary.total_amount.toLocaleString('id-ID')}` : 'Rp50.000.000'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                    <span className="text-slate-500 font-medium">Total Dibayar</span>
                                    <span className="font-bold text-emerald-600 text-sm">
                                        {payment_summary?.paid_amount ? `Rp${payment_summary.paid_amount.toLocaleString('id-ID')}` : 'Rp25.000.000'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                    <span className="text-slate-500 font-medium">Sisa Tagihan</span>
                                    <span className="font-bold text-rose-600 text-sm">
                                        {payment_summary?.remaining_amount ? `Rp${payment_summary.remaining_amount.toLocaleString('id-ID')}` : 'Rp25.000.000'}
                                    </span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1.5 pt-1">
                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{
                                            backgroundColor: portalPrimaryAccent,
                                            width: `${payment_summary?.paid_percentage || 50}%`,
                                        }}
                                    />
                                </div>
                                <div className="text-right text-[10px] font-bold text-slate-500">
                                    {payment_summary?.paid_percentage ? `${payment_summary.paid_percentage}%` : '50%'}
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span className="font-medium">Pembayaran Terakhir</span>
                                </div>
                                <span className="font-bold text-slate-800">
                                    {payment_summary?.last_payment_date || '-'}
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 mt-auto">
                            <Link
                                href={active_project?.id ? `/client/projects/${active_project.id}` : '/client/projects'}
                                style={{ color: portalPrimaryAccent }}
                                className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-center transition-colors block shadow-2xs hover:shadow-xs"
                            >
                                Lihat Detail Pembayaran →
                            </Link>
                        </div>
                    </div>

                    {/* Card 2: File Terbaru */}
                    <div
                        style={{
                            backgroundColor: portalCardBg,
                            borderColor: portalCardBorder,
                        }}
                        className="rounded-3xl border p-5 sm:p-6 shadow-2xs flex flex-col justify-between transition-colors h-full"
                    >
                        <div className="space-y-4">
                            <div className="border-b border-slate-100 pb-3 min-h-[50px] flex flex-col justify-center">
                                <h4
                                    style={{ color: portalHeadingColor }}
                                    className="text-xs font-black uppercase tracking-wider"
                                >
                                    File Terbaru
                                </h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">File atau link terbaru yang dibagikan.</p>
                            </div>

                            <div className="space-y-2.5 text-xs">
                                {active_project?.file_links && active_project.file_links.length > 0 ? (
                                    active_project.file_links.slice(0, 3).map((file, idx) => (
                                        <a
                                            key={file.id || idx}
                                            href={file.drive_url || '#'}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100/80 transition-colors group block"
                                        >
                                            <div className="space-y-0.5 min-w-0 pr-2">
                                                <p className="font-bold text-slate-900 text-xs truncate group-hover:text-[#4A151B] transition-colors">
                                                    {file.name}
                                                </p>
                                                <span className="text-[10px] text-slate-400 block">
                                                    Dibagikan pada {file.created_at_formatted || file.created_at || 'Baru saja'}
                                                </span>
                                            </div>
                                            <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-[#4A151B] group-hover:border-[#4A151B]/30 shadow-2xs shrink-0 transition-colors">
                                                <Download className="w-3.5 h-3.5" />
                                            </div>
                                        </a>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-slate-400 text-xs">
                                        Belum ada file yang dibagikan untuk proyek ini.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 mt-auto">
                            <Link
                                href={active_project?.id ? `/client/projects/${active_project.id}` : '/client/projects'}
                                style={{ color: portalPrimaryAccent }}
                                className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-center transition-colors block shadow-2xs hover:shadow-xs"
                            >
                                Lihat Semua File &amp; Drive Link →
                            </Link>
                        </div>
                    </div>

                    {/* Card 3: Highlight Project */}
                    <div
                        style={{
                            backgroundColor: portalCardBg,
                            borderColor: portalCardBorder,
                        }}
                        className="rounded-3xl border p-5 sm:p-6 shadow-2xs flex flex-col justify-between transition-colors h-full"
                    >
                        <div className="space-y-4">
                            <div className="border-b border-slate-100 pb-3 min-h-[50px] flex flex-col justify-center">
                                <h4
                                    style={{ color: portalHeadingColor }}
                                    className="text-xs font-black uppercase tracking-wider"
                                >
                                    Highlight Project
                                </h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">Beberapa momen terbaik dari project Anda.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                                {((active_project?.highlights && active_project.highlights.length > 0)
                                    ? active_project.highlights.slice(0, 4)
                                    : [
                                        { id: '1', title: 'Highlight 1', image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&auto=format&fit=crop&q=80' },
                                        { id: '2', title: 'Highlight 2', image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&auto=format&fit=crop&q=80' },
                                        { id: '3', title: 'Highlight 3', image_url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=500&auto=format&fit=crop&q=80' },
                                        { id: '4', title: 'Highlight 4', image_url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500&auto=format&fit=crop&q=80' },
                                    ]
                                ).map((hl: any, idx: number) => (
                                    <div key={hl.id || idx} className="h-24 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 relative group border border-slate-200/60 shadow-2xs">
                                        <img
                                            src={hl.image_url}
                                            alt={hl.title || `Highlight ${idx + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 mt-auto">
                            <Link
                                href={active_project?.id ? `/client/projects/${active_project.id}#section-highlight` : '/client/projects'}
                                style={{ color: portalPrimaryAccent }}
                                className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-center transition-colors block shadow-2xs hover:shadow-xs"
                            >
                                Lihat Semua Highlight →
                            </Link>
                        </div>
                    </div>

                    {/* Card 4: Ulasan Client */}
                    <div
                        style={{
                            backgroundColor: portalCardBg,
                            borderColor: portalCardBorder,
                        }}
                        className="rounded-3xl border p-5 sm:p-6 shadow-2xs flex flex-col justify-between transition-colors h-full"
                    >
                        <div className="space-y-4">
                            <div className="border-b border-slate-100 pb-3 min-h-[50px] flex flex-col justify-center">
                                <h4
                                    style={{ color: portalHeadingColor }}
                                    className="text-xs font-black uppercase tracking-wider"
                                >
                                    Ulasan Client
                                </h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">Terima kasih atas kepercayaan Anda.</p>
                            </div>

                            {activeTestimonial ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-amber-500">
                                            <div className="flex items-center">
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
                                            </div>
                                            <span className="text-xs font-bold text-slate-900 ml-1">
                                                {Number(activeTestimonial.rating).toFixed(1)}
                                            </span>
                                        </div>

                                        {testimonialList.length > 1 && (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentTestimonialIndex((prev) => (prev === 0 ? testimonialList.length - 1 : prev - 1))}
                                                    className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors shadow-2xs"
                                                    title="Ulasan sebelumnya"
                                                >
                                                    <ChevronLeft className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentTestimonialIndex((prev) => (prev + 1) % testimonialList.length)}
                                                    className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer transition-colors shadow-2xs"
                                                    title="Ulasan selanjutnya"
                                                >
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                                        <p className="text-xs text-slate-700 leading-relaxed italic line-clamp-3">
                                            "{activeTestimonial.comment}"
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-0.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                                                <img
                                                    src={activeTestimonial.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                                    alt={activeTestimonial.client_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-900 leading-none truncate">
                                                    {activeTestimonial.client_name}
                                                </p>
                                                <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                                                    {activeTestimonial.package_name || 'Dokumentasi'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-6 text-center text-slate-400 text-xs">
                                    Belum ada ulasan klien.
                                </div>
                            )}
                        </div>

                        <div className="pt-4 mt-auto">
                            <Link
                                href="/client/projects"
                                style={{ color: portalPrimaryAccent }}
                                className="w-full py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-center transition-colors block cursor-pointer shadow-2xs hover:shadow-xs"
                            >
                                Lihat Semua Ulasan →
                            </Link>
                        </div>
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
