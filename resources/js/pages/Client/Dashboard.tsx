import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Head, Link, usePage } from '@inertiajs/react';
import { ClientLayout } from '@/layouts/ClientLayout';
import { ClientHeroCarousel } from '@/components/ClientHeroCarousel';
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
    Edit3,
    Eye,
    X,
    Printer,
    Receipt,
} from 'lucide-react';
import { formatRupiah, formatDate } from '@/lib/formatters';

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
    key?: string;
    title?: string;
    name?: string;
    desc?: string;
    description?: string;
    status: 'completed' | 'active' | 'upcoming' | 'pending';
    status_label?: string;
    date?: string;
    target_date?: string;
    icon?: string;
    pic?: string;
    tasks?: Array<{ title: string; completed: boolean }>;
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
        progress_percentage?: number;
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
        total_steps?: number;
        current_step_name?: string;
        active_step_title: string;
        active_step_desc: string;
        progress_percentage?: number;
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
    recommended_packages?: RecommendedItem[];
    testimonials?: TestimonialItem[];
    portfolios?: any[];
    company?: any;
}

export default function ClientDashboard({
    client,
    metrics,
    active_project,
    timeline = {
        current_step: 3,
        active_step_title: 'Preview Foto',
        active_step_desc: 'Kami sedang menyiapkan preview foto terbaik untuk Anda. Nantikan update selanjutnya!',
        steps: [],
    },
    payment_summary = {
        total_amount: 50000000,
        paid_amount: 25000000,
        remaining_amount: 25000000,
        paid_percentage: 50,
        last_payment_label: 'DP (50%)',
        last_payment_date: '26 Mei 2026',
    },
    promo_slides = [],
    recommended_projects = [],
    recommended_packages = [],
    testimonials = [],
    portfolios = [],
    company = {},
}: ClientDashboardProps) {
    const { props: pageProps } = usePage<any>();
    const appSettings = pageProps?.appSettings || {};

    // Exact color palette tokens requested by user
    const COLOR_BURGUNDY = '#3C0E0E';
    const COLOR_WARM_CREAM = '#F4EBE4';
    const COLOR_OFF_WHITE = '#FBF6F0';

    const portalPrimaryAccent = appSettings.portal_primary_accent || COLOR_BURGUNDY;
    const portalHeroBg = appSettings.portal_hero_bg || COLOR_BURGUNDY;
    const portalHeroGradient = appSettings.portal_hero_gradient || '';
    const portalHeroText = appSettings.portal_hero_text_color || '#FFFFFF';
    const portalCardBg = appSettings.portal_card_bg || '#FFFFFF';
    const portalCardBorder = appSettings.portal_card_border || COLOR_WARM_CREAM;
    const portalHeadingColor = appSettings.portal_heading_color || COLOR_BURGUNDY;
    const portalFontHeading = appSettings.portal_font_heading || 'Plus Jakarta Sans';
    const portalFooterText = appSettings.portal_footer_text || COLOR_WARM_CREAM;

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

    // Safe WhatsApp Link Generator
    const rawPhone = company?.phone || appSettings?.company_phone || '081234567890';
    const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
    const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const generalWhatsAppUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent('Halo Admin Arams Pictures, saya ingin menanyakan tentang paket layanan dokumentasi.')}`;

    const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
    const [isHoveredPromo, setIsHoveredPromo] = useState(false);
    const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
    const [isHoveredTestimonial, setIsHoveredTestimonial] = useState(false);

    // Payment History & Lightbox Modal States
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [activeLightboxIndex, setActiveLightboxIndex] = useState(0);

    useEffect(() => {
        if (isLightboxOpen || isPaymentModalOpen) {
            document.body.style.overflow = 'hidden';
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    setIsLightboxOpen(false);
                    setIsPaymentModalOpen(false);
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                document.body.style.overflow = '';
                window.removeEventListener('keydown', handleKeyDown);
            };
        } else {
            document.body.style.overflow = '';
        }
    }, [isLightboxOpen, isPaymentModalOpen]);

    // Timeline Steps (5 Steps as per client dashboard design)
    const defaultSteps: TimelineStep[] = [
        {
            step: 1,
            title: '1. Booking & DP',
            name: 'Booking & DP',
            desc: 'Pembayaran DP telah terverifikasi dan slot jadwal berhasil dibooking.',
            status: 'completed',
            status_label: 'Selesai',
            date: '10 Jan 2026',
        },
        {
            step: 2,
            title: '2. Hari H (Shooting)',
            name: 'Hari H (Shooting)',
            desc: 'Sesi dokumentasi foto dan video hari H telah selesai dilaksanakan.',
            status: 'completed',
            status_label: 'Selesai',
            date: '22 Mei 2026',
        },
        {
            step: 3,
            title: '3. Preview Foto',
            name: 'Preview Foto',
            desc: 'Kami sedang menyiapkan preview foto terbaik untuk Anda. Nantikan update selanjutnya!',
            status: 'active',
            status_label: 'Sedang Dikerjakan',
            date: 'Estimasi: 05 Jun 2026',
        },
        {
            step: 4,
            title: '4. Editing & Seleksi',
            name: 'Editing & Seleksi',
            desc: 'Proses editing menyeluruh, retouching, dan color grading semua file pilihan.',
            status: 'upcoming',
            status_label: 'Menunggu',
            date: 'Estimasi: 20 Jun 2026',
        },
        {
            step: 5,
            title: '5. Final Delivery',
            name: 'Final Delivery',
            desc: 'Penyerahan seluruh hasil foto/video resolusi tinggi dan cetak album fisik.',
            status: 'upcoming',
            status_label: 'Menunggu',
            date: 'Estimasi: 05 Jul 2026',
        },
    ];

    const timelineSteps = (timeline.steps && timeline.steps.length > 0)
        ? timeline.steps
        : defaultSteps;

    const isProjectCompleted = active_project?.status === 'completed' || active_project?.workflow_step === 'selesai' || active_project?.status === 'delivered';
    const totalTimelineSteps = timelineSteps.length;
    const currentStepNum = isProjectCompleted ? totalTimelineSteps : (timeline.current_step || 1);
    const activeStepObj = timelineSteps.find((s) => s.step === currentStepNum) || timelineSteps.find((s) => s.status === 'active') || timelineSteps[0];
    const progressPercent = active_project?.progress_percentage ?? active_project?.progress ?? (
        isProjectCompleted ? 100 : Math.min(100, Math.max(0, Math.round((currentStepNum / totalTimelineSteps) * 100)))
    );

    // Promo Slides Fallback (Multi-slide support for carousel)
    const promoSlides: PromoSlideItem[] = (promo_slides && promo_slides.length > 0)
        ? promo_slides
        : [
            {
                id: '1',
                tag: 'SPECIAL OFFER',
                title: 'Abadikan Momen Terbaikmu dengan Arams Pictures',
                description: 'Promo spesial untuk setiap momen berharga Anda. Dapatkan penawaran terbaik untuk paket pernikahan & prewedding pilihan.',
                button_text: 'Lihat Promo Selengkapnya',
                button_url: '/form-klien',
                image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1920&auto=format&fit=crop&q=85',
            },
            {
                id: '2',
                tag: 'EXCLUSIVE PREWEDDING',
                title: 'Dokumentasi Cinta Abadi di Destinasi Impian',
                description: 'Paket sinematografi prewedding eksklusif ke Bromo, Bali & Yogyakarta dengan arahan pose profesional & gaun premium.',
                button_text: 'Jelajahi Paket Prewedding',
                button_url: '/form-klien',
                image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&auto=format&fit=crop&q=85',
            },
            {
                id: '3',
                tag: 'LUXURY WEDDING',
                title: 'Kisah Hari Bahagia yang Mewah & Tak Lekang Waktu',
                description: 'Dokumentasi resepsi & akad elegan dengan multi-camera cinematic 4K, album cetak premium, dan drone aerial coverage.',
                button_text: 'Konsultasi Sekarang',
                button_url: '/form-klien',
                image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1920&auto=format&fit=crop&q=85',
            },
        ];

    // Auto-advance Promo Carousel every 5 seconds (pauses on hover)
    useEffect(() => {
        if (promoSlides.length <= 1 || isHoveredPromo) return;
        const timer = setInterval(() => {
            setCurrentPromoIndex((prev) => (prev + 1) % promoSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [promoSlides.length, isHoveredPromo]);

    // File Links Fallback
    const fileList: FileLinkItem[] = (active_project?.file_links && active_project.file_links.length > 0)
        ? active_project.file_links
        : [
            {
                id: '1',
                name: 'Preview Foto (Low Resolution)',
                drive_url: '#',
                file_type: 'image',
                created_at_formatted: '05 Jun 2026',
            },
            {
                id: '2',
                name: 'Behind The Scene',
                drive_url: '#',
                file_type: 'video',
                created_at_formatted: '23 Mei 2026',
            },
            {
                id: '3',
                name: 'Foto Hari H (RAW)',
                drive_url: '#',
                file_type: 'zip',
                created_at_formatted: '23 Mei 2026',
            },
        ];

    // Highlights Fallback (4 photos for 2x2 grid)
    const highlightPhotos = (active_project?.highlights && active_project.highlights.length > 0)
        ? active_project.highlights.slice(0, 4)
        : [
            { id: '1', title: 'Highlight 1', image_url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&auto=format&fit=crop&q=80' },
            { id: '2', title: 'Highlight 2', image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80' },
            { id: '3', title: 'Highlight 3', image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop&q=80' },
            { id: '4', title: 'Highlight 4', image_url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&auto=format&fit=crop&q=80' },
        ];

    // Portfolio Gallery (4 photos from backend real Portfolios or fallback)
    const totalPortfoliosCount = (pageProps as any)?.total_portfolios ?? portfolios?.length ?? 7;
    const portfolioPhotos = (portfolios && portfolios.length > 0)
        ? portfolios.slice(0, 4).map((item, idx) => ({
            id: item.id || String(idx + 1),
            image: item.image || item.image_url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
            isOverlay: idx === 3,
            count: `+${Math.max(1, totalPortfoliosCount - 3)}`,
        }))
        : [
            { id: '1', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80' },
            { id: '2', image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop&q=80' },
            { id: '3', image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&auto=format&fit=crop&q=80' },
            { id: '4', image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&auto=format&fit=crop&q=80', isOverlay: true, count: '+25' },
        ];

    // Testimonials Fallback
    const testimonialList: TestimonialItem[] = (testimonials && testimonials.length > 0)
        ? testimonials
        : [
            {
                id: '1',
                client_name: 'Raka & Dinda',
                package_name: 'Paket Prewedding',
                rating: 5,
                comment: 'Hasil fotonya luar biasa, melebihi ekspektasi! Tim Arams Pictures sangat profesional dan friendly. Prosesnya juga mudah dan terorganisir.',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
            },
            {
                id: '2',
                client_name: 'Aditya & Sarah',
                package_name: 'Paket Wedding Royal',
                rating: 5,
                comment: 'Video cinematic hari H kami sangat mengharukan dan detail. Semua keluarga memuji hasilnya. Terima kasih banyak tim Arams!',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
            },
            {
                id: '3',
                client_name: 'Dimas & Clarissa',
                package_name: 'Paket Maternity & Newborn',
                rating: 5,
                comment: 'Sangat sabar saat sesi foto newborn si kecil. Hasil editing warnanya hangat, natural, dan sangat berkesan bagi keluarga kami.',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
            },
        ];

    // Auto-advance Testimonials Carousel every 3 seconds (pauses on hover)
    useEffect(() => {
        if (testimonialList.length <= 1 || isHoveredTestimonial) return;
        const timer = setInterval(() => {
            setCurrentTestimonialIndex((prev) => (prev + 1) % testimonialList.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [testimonialList.length, isHoveredTestimonial]);

    // 5 Package Recommendations (From Real Database Packages)
    const packageRecommendations: RecommendedItem[] = (recommended_projects && recommended_projects.length > 0)
        ? recommended_projects.slice(0, 5)
        : (recommended_packages && (recommended_packages as RecommendedItem[]).length > 0)
        ? (recommended_packages as RecommendedItem[]).slice(0, 5)
        : [
            {
                id: '1',
                title: 'Paket Foto Wedding',
                description: 'Abadikan hari bahagia Anda dengan konsep elegan dan timeless.',
                price: 'Rp38.000.000',
                image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&auto=format&fit=crop&q=80',
            },
            {
                id: '2',
                title: 'Paket Maternity',
                description: 'Momen kehamilan penuh kehangatan yang tak terlupakan.',
                price: 'Rp15.000.000',
                image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
            },
            {
                id: '3',
                title: 'Paket Newborn',
                description: 'Abadikan momen pertama si kecil dengan penuh cinta dan kelembutan.',
                price: 'Rp13.500.000',
                image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80',
            },
            {
                id: '4',
                title: 'Paket Family',
                description: 'Ciptakan kenangan indah bersama keluarga tercinta untuk selamanya.',
                price: 'Rp12.700.000',
                image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop&q=80',
            },
            {
                id: '5',
                title: 'Paket Engagement',
                description: 'Rayakan momen spesial sebelum hari bahagia Anda.',
                price: 'Rp10.500.000',
                image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&auto=format&fit=crop&q=80',
            },
        ];

    const activePromo = promoSlides[currentPromoIndex % promoSlides.length] || promoSlides[0];
    const activeTestimonial = testimonialList[currentTestimonialIndex % testimonialList.length] || testimonialList[0];

    return (
        <ClientLayout>
            <Head title="Dashboard Client Portal - Arams Pictures" />

            <div className="space-y-6 sm:space-y-8">
                {/* ── 1. HERO CAROUSEL BANNER ─────────────────────────────── */}
                <ClientHeroCarousel slides={promoSlides} />

                {/* ── 2. STATUS PROGRESS (Timeline Stepper) ────────────────── */}
                <section
                    style={{
                        backgroundColor: '#FFFFFF',
                        borderColor: COLOR_WARM_CREAM,
                    }}
                    className="relative z-10 rounded-xl border p-5 sm:p-7 shadow-xs hover:shadow-xl hover:shadow-[#3C0E0E]/8 hover:border-[#3C0E0E]/25 transition-all duration-300 space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3
                                style={{
                                    fontFamily: `'${portalFontHeading}', serif`,
                                    color: COLOR_BURGUNDY,
                                }}
                                className="text-sm sm:text-base font-serif font-black uppercase tracking-wider"
                            >
                                Status Progress
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Berikut adalah tahapan pengerjaan project Anda.
                            </p>
                        </div>
                        <Link
                            href={active_project?.id ? `/client/projects/${active_project.id}#timeline` : '/client/projects'}
                            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#3C0E0E] transition-colors group"
                        >
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#3C0E0E] transition-colors" />
                            <span>Tentang Timeline</span>
                        </Link>
                    </div>

                    {/* 5-Step Horizontal Stepper */}
                    <div className="pt-2 px-1 sm:px-4">
                        <div className="flex items-start justify-between relative">
                            {/* Connecting Line behind circles */}
                            <div
                                className="absolute top-4 sm:top-5 h-0.5 bg-slate-200 -z-0"
                                style={{
                                    left: `calc(100% / (${timelineSteps.length} * 2))`,
                                    right: `calc(100% / (${timelineSteps.length} * 2))`,
                                }}
                            />

                            {timelineSteps.map((step, idx) => {
                                const isCompleted = step.status === 'completed';
                                const isActive = step.status === 'active' || (!isCompleted && step.step === currentStepNum);

                                return (
                                    <div
                                        key={step.step || idx}
                                        className="flex flex-col items-center relative z-10 flex-1 select-none"
                                    >
                                        <div
                                            style={
                                                isCompleted
                                                    ? {
                                                          backgroundColor: COLOR_BURGUNDY,
                                                          color: '#FFFFFF',
                                                      }
                                                    : isActive
                                                    ? {
                                                          backgroundColor: '#FFFFFF',
                                                          color: COLOR_BURGUNDY,
                                                          borderColor: COLOR_BURGUNDY,
                                                      }
                                                    : {
                                                          backgroundColor: COLOR_WARM_CREAM,
                                                          color: '#7A6666',
                                                          borderColor: '#E8DDD5',
                                                      }
                                            }
                                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                                                isActive ? 'border-2 shadow-xs' : !isCompleted ? 'border' : ''
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <Check className="w-4 h-4 stroke-[2.5]" />
                                            ) : step.step === 3 || (step.name || step.title || '').toLowerCase().includes('preview') ? (
                                                <ImageIcon className="w-4 h-4" />
                                            ) : step.step === 4 || (step.name || step.title || '').toLowerCase().includes('edit') ? (
                                                <Edit3 className="w-4 h-4" />
                                            ) : step.step === 5 || (step.name || step.title || '').toLowerCase().includes('delivery') || (step.name || step.title || '').toLowerCase().includes('kirim') ? (
                                                <Download className="w-4 h-4" />
                                            ) : (
                                                <span className="text-xs font-bold">{step.step}</span>
                                            )}
                                        </div>

                                        <div className="text-center mt-2 space-y-0.5">
                                            <p
                                                style={{
                                                    color: isCompleted || isActive ? COLOR_BURGUNDY : '#64748B',
                                                }}
                                                className="text-[11px] sm:text-xs font-bold"
                                            >
                                                {step.title || `${step.step}. ${step.name}`}
                                            </p>
                                            <span
                                                className={`text-[10px] block font-semibold ${
                                                    isCompleted
                                                        ? 'text-slate-500'
                                                        : isActive
                                                        ? 'text-[#3C0E0E] font-bold'
                                                        : 'text-slate-400'
                                                }`}
                                            >
                                                {step.status_label || (isCompleted ? 'Selesai' : isActive ? 'Sedang Dikerjakan' : 'Menunggu')}
                                            </span>
                                            {step.date && (
                                                <span className="text-[9.5px] text-slate-400 block">
                                                    {step.date}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stepper Progress Bar Banner */}
                    <div
                        style={{
                            backgroundColor: COLOR_WARM_CREAM,
                            borderColor: '#E8DDD5',
                        }}
                        className="rounded-xl border p-4 sm:p-5 space-y-3.5 hover:shadow-md hover:border-[#3C0E0E]/30 hover:-translate-y-0.5 transition-all duration-300 group"
                    >
                        {/* Top Info Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start sm:items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-[#E8DDD5] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                                    <Sparkles className="w-4 h-4 text-[#3C0E0E]" />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4
                                            style={{ color: COLOR_BURGUNDY }}
                                            className="text-xs sm:text-sm font-bold truncate"
                                        >
                                            {activeStepObj.title?.replace(/^\d+\.\s*/, '') || activeStepObj.name || 'Editing Seleksi'}
                                        </h4>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-[#3C0E0E] border border-[#E8DDD5] shadow-2xs">
                                            Tahap {currentStepNum} dari {totalTimelineSteps}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-1 sm:line-clamp-none">
                                        {activeStepObj.desc || activeStepObj.description || 'Proses color grading eksklusif & retouching foto pilihan'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E8DDD5]/60">
                                <div className="text-left sm:text-right">
                                    <span className="text-[10px] text-slate-500 font-semibold block uppercase tracking-wider">
                                        Progres
                                    </span>
                                    <span
                                        style={{ color: COLOR_BURGUNDY }}
                                        className="text-base sm:text-lg font-black leading-none block"
                                    >
                                        {progressPercent}%
                                    </span>
                                </div>

                                <Link
                                    href={active_project?.id ? `/client/projects/${active_project.id}#timeline` : '/client/projects'}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E8DDD5] bg-[#F4EBE4] text-[#3C0E0E] hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] text-xs font-bold shadow-2xs transition-all duration-300 group/btn cursor-pointer"
                                >
                                    <span>Lihat Detail</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-[#3C0E0E] group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                                </Link>
                            </div>
                        </div>

                        {/* Progress Bar Track & Fill */}
                        <div className="space-y-1.5 pt-0.5">
                            <div className="w-full h-2.5 sm:h-3 rounded-full bg-white/90 border border-[#E8DDD5] p-0.5 overflow-hidden shadow-2xs">
                                <div
                                    className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-[#3C0E0E] via-[#5C1A1A] to-[#8B2635] shadow-xs"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                                <span>
                                    Status: <strong className="text-slate-800">{activeStepObj.status_label || (isProjectCompleted ? 'Selesai' : 'Sedang Diproses')}</strong>
                                </span>
                                {activeStepObj.date && (
                                    <span>{activeStepObj.date}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 3. THREE-COLUMN ROW (FILE TERBARU, PEMBAYARAN, HIGHLIGHT) ── */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-stretch">
                    {/* Card 1: File Terbaru */}
                    <div
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderColor: COLOR_WARM_CREAM,
                        }}
                        className="rounded-xl border p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-lg hover:shadow-[#3C0E0E]/5 hover:-translate-y-1 hover:border-[#3C0E0E]/25 transition-all duration-300 group"
                    >
                        <div className="space-y-4">
                            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                                <div>
                                    <h4
                                        style={{ color: COLOR_BURGUNDY }}
                                        className="text-xs font-black uppercase tracking-wider"
                                    >
                                        File Terbaru
                                    </h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        File atau link terakhir yang dibagikan kepada Anda.
                                    </p>
                                </div>
                                <Link
                                    href={active_project?.id ? `/client/projects/${active_project.id}#files` : '/client/projects'}
                                    className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#F4EBE4] text-[#3C0E0E] border border-transparent hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] transition-all duration-200 shrink-0 cursor-pointer"
                                >
                                    Lihat Semua
                                </Link>
                            </div>

                            <div className="space-y-2.5">
                                {fileList.slice(0, 3).map((file, idx) => (
                                    <div
                                        key={file.id || idx}
                                        className="p-2.5 rounded-lg bg-[#FBF6F0] border border-[#F4EBE4] flex items-center justify-between hover:bg-white hover:border-[#3C0E0E]/30 hover:shadow-2xs transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                            <Folder className="w-4 h-4 text-slate-400 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-800 truncate">
                                                    {file.name}
                                                </p>
                                                <span className="text-[10px] text-slate-400 block">
                                                    Dibagikan pada {file.created_at_formatted || '05 Jun 2026'}
                                                </span>
                                            </div>
                                        </div>
                                        <a
                                            href={file.drive_url || '#'}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-2.5 py-1 rounded-md border border-[#E8DDD5] bg-[#F4EBE4] text-[#3C0E0E] hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] text-[10px] font-bold inline-flex items-center gap-1 transition-all duration-200 shrink-0 shadow-2xs cursor-pointer group/buka"
                                        >
                                            <span>Buka</span>
                                            <ArrowUpRight className="w-3 h-3 text-[#3C0E0E] group-hover/buka:text-white transition-colors" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 mt-auto">
                            <Link
                                href={active_project?.id ? `/client/projects/${active_project.id}#files` : '/client/projects'}
                                className="w-full py-2.5 rounded-lg border border-[#E8DDD5] bg-[#F4EBE4] text-[#3C0E0E] hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] text-xs font-bold text-center inline-flex items-center justify-center gap-2 transition-all duration-300 shadow-2xs group/btn cursor-pointer"
                            >
                                <Folder className="w-3.5 h-3.5 text-[#3C0E0E] group-hover/btn:text-white transition-colors" />
                                <span>Lihat Semua File &amp; Drive Link</span>
                                <ArrowRight className="w-3.5 h-3.5 text-[#3C0E0E] group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                            </Link>
                        </div>
                    </div>

                    {/* Card 2: Pembayaran */}
                    <div
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderColor: COLOR_WARM_CREAM,
                        }}
                        className="rounded-xl border p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-lg hover:shadow-[#3C0E0E]/5 hover:-translate-y-1 hover:border-[#3C0E0E]/25 transition-all duration-300 group"
                    >
                        <div className="space-y-4">
                            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                                <div>
                                    <h4
                                        style={{ color: COLOR_BURGUNDY }}
                                        className="text-xs font-black uppercase tracking-wider"
                                    >
                                        Pembayaran
                                    </h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Ringkasan status &amp; riwayat pembayaran project Anda.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsPaymentModalOpen(true)}
                                    className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#F4EBE4] text-[#3C0E0E] border border-transparent hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] transition-all duration-200 shrink-0 cursor-pointer"
                                >
                                    Lihat Detail
                                </button>
                            </div>

                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center py-0.5">
                                    <span className="text-slate-500 font-medium">Total Project</span>
                                    <span className="font-bold text-slate-900">
                                        {formatRupiah(payment_summary?.total_amount || 50000000)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                    <span className="text-slate-500 font-medium">Total Dibayar</span>
                                    <span className="font-bold text-emerald-600">
                                        {formatRupiah(payment_summary?.paid_amount || 25000000)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                    <span className="text-slate-500 font-medium">Sisa Tagihan</span>
                                    <span style={{ color: COLOR_BURGUNDY }} className="font-bold">
                                        {formatRupiah(payment_summary?.remaining_amount || 25000000)}
                                    </span>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1 pt-1">
                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#3C0E0E] to-[#8B2635]"
                                        style={{
                                            width: `${payment_summary?.paid_percentage || 50}%`,
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                                    <span>Status Tagihan</span>
                                    <span>{payment_summary?.paid_percentage || 50}% Terbayar</span>
                                </div>
                            </div>

                            {/* Sub Box: Pembayaran Terakhir */}
                            <div
                                style={{
                                    backgroundColor: COLOR_WARM_CREAM,
                                    borderColor: '#E8DDD5',
                                }}
                                className="p-3 rounded-lg border flex items-center justify-between text-xs hover:shadow-2xs hover:border-[#3C0E0E]/20 transition-all duration-200"
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <div>
                                        <span className="font-bold text-slate-800 block text-[11px]">
                                            Pembayaran Terakhir
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            {payment_summary?.last_payment_label || 'DP (50%)'}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-[10px] text-slate-500 font-medium">
                                    {payment_summary?.last_payment_date || '26 Mei 2026'}
                                </span>
                            </div>
                        </div>

                        {/* Bottom Full-Width Action Button to Fill Card Height symmetrically */}
                        <div className="pt-4 mt-auto">
                            <button
                                type="button"
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="w-full py-2.5 rounded-lg border border-[#E8DDD5] bg-[#F4EBE4] text-[#3C0E0E] hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] text-xs font-bold text-center inline-flex items-center justify-center gap-2 transition-all duration-300 shadow-2xs group/btn cursor-pointer"
                            >
                                <CreditCard className="w-3.5 h-3.5 text-[#3C0E0E] group-hover/btn:text-white transition-colors" />
                                <span>Lihat Rincian &amp; Riwayat Pembayaran</span>
                                <ArrowRight className="w-3.5 h-3.5 text-[#3C0E0E] group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </div>

                    {/* Card 3: Highlight Project */}
                    <div
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderColor: COLOR_WARM_CREAM,
                        }}
                        className="rounded-xl border p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-lg hover:shadow-[#3C0E0E]/5 hover:-translate-y-1 hover:border-[#3C0E0E]/25 transition-all duration-300 group"
                    >
                        <div className="space-y-4">
                            <div className="border-b border-slate-100 pb-3">
                                <h4
                                    style={{ color: COLOR_BURGUNDY }}
                                    className="text-xs font-black uppercase tracking-wider"
                                >
                                    Highlight Project
                                </h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Beberapa momen terbaik dari project Anda.
                                </p>
                            </div>

                            {/* 2x2 Photo Grid */}
                            <div className="grid grid-cols-2 gap-2">
                                {highlightPhotos.map((photo, idx) => (
                                    <div
                                        key={photo.id || idx}
                                        onClick={() => {
                                            setActiveLightboxIndex(idx);
                                            setIsLightboxOpen(true);
                                        }}
                                        className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 relative group/photo cursor-pointer"
                                    >
                                        <img
                                            src={photo.image_url}
                                            alt={photo.title || `Highlight ${idx + 1}`}
                                            className="w-full h-full object-cover group-hover/photo:scale-108 transition-transform duration-500"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Dots */}
                            <div className="flex justify-center items-center gap-1 pt-1">
                                <div className="w-4 h-1 rounded-full bg-slate-400" />
                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                            </div>
                        </div>

                        <div className="pt-4 mt-auto">
                            <Link
                                href={active_project?.id ? `/client/projects/${active_project.id}#highlights` : '/client/projects'}
                                className="w-full py-2.5 rounded-lg border border-[#E8DDD5] bg-[#F4EBE4] text-[#3C0E0E] hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] text-xs font-bold text-center inline-flex items-center justify-center gap-1.5 transition-all duration-300 shadow-2xs group/btn cursor-pointer"
                            >
                                <span>Lihat Semua Highlight</span>
                                <ArrowRight className="w-3.5 h-3.5 text-[#3C0E0E] group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── 4. TWO-COLUMN ROW (PORTOFOLIO KAMI & TESTIMONI KLIEN) ── */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">
                    {/* Card 1: Portofolio Kami */}
                    <div
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderColor: COLOR_WARM_CREAM,
                        }}
                        className="rounded-xl border p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-lg hover:shadow-[#3C0E0E]/5 hover:-translate-y-1 hover:border-[#3C0E0E]/25 transition-all duration-300 group"
                    >
                        <div className="space-y-4">
                            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                                <div>
                                    <h4
                                        style={{ color: COLOR_BURGUNDY }}
                                        className="text-xs font-black uppercase tracking-wider"
                                    >
                                        Portofolio Kami
                                    </h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Lihat lebih banyak karya terbaik kami.
                                    </p>
                                </div>
                                <Link
                                    href="/client/portfolio"
                                    className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#F4EBE4] text-[#3C0E0E] border border-transparent hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] transition-all duration-200 shrink-0 cursor-pointer"
                                >
                                    Lihat Portfolio
                                </Link>
                            </div>

                            {/* 4 Image Row (Clickable to view full image in lightbox modal) */}
                            <div className="grid grid-cols-4 gap-2">
                                {portfolioPhotos.map((item, idx) => (
                                    <div
                                        key={item.id || idx}
                                        onClick={() => {
                                            setActiveLightboxIndex(idx);
                                            setIsLightboxOpen(true);
                                        }}
                                        className="aspect-square rounded-lg overflow-hidden bg-slate-100 relative group/pimg cursor-pointer"
                                        title="Klik untuk melihat foto"
                                    >
                                        <img
                                             src={item.image}
                                             alt="Portfolio thumbnail"
                                             className="w-full h-full object-cover group-hover/pimg:scale-110 transition-transform duration-500"
                                        />
                                        {item.isOverlay ? (
                                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white text-center p-1 group-hover/pimg:bg-black/60 transition-colors">
                                                <span className="text-sm font-black">{item.count}</span>
                                                <span className="text-[8px] opacity-80 leading-none">Karya Lainnya</span>
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 bg-black/0 group-hover/pimg:bg-black/20 flex items-center justify-center opacity-0 group-hover/pimg:opacity-100 transition-all">
                                                <Eye className="w-4 h-4 text-white drop-shadow-md" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Testimoni Klien (Auto-sliding with hover pause & smooth transitions) */}
                    <div
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderColor: COLOR_WARM_CREAM,
                        }}
                        onMouseEnter={() => setIsHoveredTestimonial(true)}
                        onMouseLeave={() => setIsHoveredTestimonial(false)}
                        className="rounded-xl border p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-lg hover:shadow-[#3C0E0E]/5 hover:-translate-y-1 hover:border-[#3C0E0E]/25 transition-all duration-300 group select-none"
                    >
                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h4
                                        style={{ color: COLOR_BURGUNDY }}
                                        className="text-xs font-black uppercase tracking-wider"
                                    >
                                        Testimoni Klien
                                    </h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Kata mereka tentang pengalaman bersama kami.
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentTestimonialIndex((prev) => (prev === 0 ? testimonialList.length - 1 : prev - 1))}
                                        className="w-6 h-6 rounded-full border border-[#E8DDD5] bg-[#F4EBE4] flex items-center justify-center text-[#3C0E0E] hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] transition-all cursor-pointer group"
                                        aria-label="Previous testimonial"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5 text-[#3C0E0E] group-hover:text-white transition-colors" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentTestimonialIndex((prev) => (prev + 1) % testimonialList.length)}
                                        className="w-6 h-6 rounded-full border border-[#E8DDD5] bg-[#F4EBE4] flex items-center justify-center text-[#3C0E0E] hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] transition-all cursor-pointer group"
                                        aria-label="Next testimonial"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5 text-[#3C0E0E] group-hover:text-white transition-colors" />
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTestimonial.id || currentTestimonialIndex}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.28, ease: 'easeOut' }}
                                    className="space-y-3"
                                >
                                    {/* Stars */}
                                    <div className="flex items-center gap-1 text-rose-600">
                                        {Array.from({ length: activeTestimonial.rating || 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className="w-3.5 h-3.5 text-rose-600 fill-rose-600"
                                            />
                                        ))}
                                    </div>

                                    {/* Quote */}
                                    <p className="text-xs text-slate-700 leading-relaxed italic line-clamp-3 min-h-[48px]">
                                        "{activeTestimonial.comment}"
                                    </p>

                                    {/* Client Avatar + Name + Slide Dots */}
                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0 ring-1 ring-slate-200">
                                                <img
                                                    src={activeTestimonial.avatar}
                                                    alt={activeTestimonial.client_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 leading-none">
                                                    {activeTestimonial.client_name}
                                                </p>
                                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                                    {activeTestimonial.package_name || 'Wedding Day Luxury'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Testimonial Page Slider Indicator Dots */}
                                        {testimonialList.length > 1 && (
                                            <div className="flex items-center gap-1">
                                                {testimonialList.map((_, dotIdx) => (
                                                    <button
                                                        key={dotIdx}
                                                        type="button"
                                                        onClick={() => setCurrentTestimonialIndex(dotIdx)}
                                                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                                            (currentTestimonialIndex % testimonialList.length) === dotIdx
                                                                ? 'w-4 bg-[#3C0E0E]'
                                                                : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                                                        }`}
                                                        aria-label={`Testimoni ${dotIdx + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </section>

                {/* ── 5. REKOMENDASI PAKET UNTUK ANDA (5 Columns) ─────────── */}
                <section
                    style={{
                        backgroundColor: '#FFFFFF',
                        borderColor: COLOR_WARM_CREAM,
                    }}
                    className="rounded-xl border p-5 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 space-y-5"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3
                                style={{
                                    fontFamily: `'${portalFontHeading}', serif`,
                                    color: COLOR_BURGUNDY,
                                }}
                                className="text-xs sm:text-sm font-serif font-black uppercase tracking-wider"
                            >
                                Rekomendasi Paket Untuk Anda
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Pilihan paket menarik lainnya yang mungkin Anda sukai.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                        {packageRecommendations.map((pkg, idx) => (
                            <div
                                key={pkg.id || idx}
                                className="rounded-xl border border-slate-200/80 overflow-hidden flex flex-col justify-between bg-white shadow-2xs hover:shadow-lg hover:shadow-[#3C0E0E]/10 hover:-translate-y-1.5 hover:border-[#3C0E0E]/30 transition-all duration-300 group"
                            >
                                <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                                    <img
                                        src={pkg.image}
                                        alt={pkg.title || pkg.name}
                                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                                    />
                                </div>

                                <div className="p-3 space-y-2 flex flex-col flex-1 justify-between">
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-xs text-slate-900 leading-snug group-hover:text-[#3C0E0E] transition-colors">
                                            {pkg.title || pkg.name}
                                        </h4>
                                        <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                                            {pkg.desc || pkg.description}
                                        </p>
                                    </div>

                                    <div className="pt-2 space-y-2">
                                        <p
                                            style={{ color: COLOR_BURGUNDY }}
                                            className="text-xs font-black"
                                        >
                                            {pkg.price || (pkg.base_price ? formatRupiah(pkg.base_price) : '')}
                                        </p>
                                        <a
                                            href={generalWhatsAppUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full py-1.5 rounded-lg border border-[#E8DDD5] bg-[#F4EBE4] hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] text-[10.5px] font-bold text-[#3C0E0E] shadow-2xs transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer group/btn"
                                        >
                                            <MessageCircle className="w-3 h-3 text-[#3C0E0E] group-hover/btn:text-white transition-colors" />
                                            <span>Hubungi Admin</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* ── MODAL: RINCIAN & RIWAYAT PEMBAYARAN ───────────────────────────── */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[#F4EBE4] border border-[#E8DDD5] flex items-center justify-center shrink-0">
                                    <CreditCard className="w-5 h-5 text-[#3C0E0E]" />
                                </div>
                                <div>
                                    <h3
                                        style={{ fontFamily: `'${portalFontHeading}', serif`, color: COLOR_BURGUNDY }}
                                        className="text-base sm:text-lg font-serif font-black"
                                    >
                                        Rincian &amp; Riwayat Pembayaran
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Status invoice resmi, histori pembayaran per project, dan bukti transfer.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                aria-label="Tutup modal"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
                            {/* Financial 3-Metric Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block">
                                        Total Nilai Project
                                    </span>
                                    <p className="text-base sm:text-lg font-black text-slate-900 font-mono">
                                        {formatRupiah(payment_summary?.total_amount || 50000000)}
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 block">
                                        Total Terbayar
                                    </span>
                                    <p className="text-base sm:text-lg font-black text-emerald-700 font-mono">
                                        {formatRupiah(payment_summary?.paid_amount || 25000000)}
                                    </p>
                                    <span className="text-[10px] text-emerald-600 font-bold block">
                                        {payment_summary?.paid_percentage || 50}% dari total
                                    </span>
                                </div>
                                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-1">
                                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-700 block">
                                        Sisa Tagihan
                                    </span>
                                    <p className="text-base sm:text-lg font-black text-amber-700 font-mono">
                                        {formatRupiah(payment_summary?.remaining_amount || 25000000)}
                                    </p>
                                </div>
                            </div>

                            {/* Section: Invoice Resmi */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                    Invoice Resmi
                                </h4>
                                <div className="p-4 rounded-2xl bg-[#FBF6F0] border border-[#F4EBE4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-black text-xs text-slate-900">
                                                {(active_project as any)?.invoices?.[0]?.invoice_number || `INV-${new Date().getFullYear()}06-0001`}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                                                {(active_project as any)?.invoices?.[0]?.status || (active_project?.paid_amount && active_project.paid_amount >= active_project.total_amount ? 'Lunas' : 'DP Diterima')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            Total: <strong className="text-slate-800">{formatRupiah(payment_summary?.total_amount || 50000000)}</strong> • Project: {active_project?.name || 'Wedding Day'}
                                        </p>
                                    </div>
                                    <Link
                                        href={active_project?.id ? `/client/projects/${active_project.id}#invoice` : '/client/projects'}
                                        className="px-3.5 py-2 rounded-xl border border-[#E8DDD5] bg-[#F4EBE4] text-[#3C0E0E] hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer group/inv"
                                    >
                                        <Printer className="w-3.5 h-3.5 text-[#3C0E0E] group-hover/inv:text-white transition-colors" />
                                        <span>Lihat Invoice</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Section: Riwayat Pembayaran Masuk Real per Project */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        Riwayat Pembayaran Masuk
                                    </h4>
                                    <span className="text-[11px] text-slate-400 font-semibold">
                                        {((active_project as any)?.payments?.length || 1)} Transaksi
                                    </span>
                                </div>

                                <div className="space-y-2.5">
                                    {((active_project as any)?.payments && (active_project as any).payments.length > 0) ? (
                                        (active_project as any).payments.map((pm: any, idx: number) => (
                                            <div
                                                key={pm.id || idx}
                                                className="p-3.5 rounded-xl border border-slate-100 bg-white hover:border-[#3C0E0E]/20 hover:shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                                            >
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-xs text-slate-900">
                                                            {pm.payment_method?.name || pm.paymentMethod?.name || 'Transfer Bank'}
                                                        </span>
                                                        <span className="font-mono text-[10px] text-slate-400">
                                                            {pm.payment_number || `PAY-${idx + 1}`}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500">
                                                        {formatDate(pm.payment_date || pm.created_at)} • Ref: {pm.reference_number || '-'}
                                                    </p>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                                    <div className="text-left sm:text-right">
                                                        <span className="font-mono font-black text-xs text-emerald-700 block">
                                                            {formatRupiah(Number(pm.amount))}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 sm:justify-end">
                                                            <Check className="w-3 h-3 stroke-[3]" />
                                                            <span>Berhasil</span>
                                                        </span>
                                                    </div>

                                                    {pm.proof_file ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedProofUrl(pm.proof_file)}
                                                            className="px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                                            title="Lihat Bukti Transfer"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>Lihat Bukti</span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-300 italic px-1">
                                                            Tanpa Lampiran
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3.5 rounded-xl border border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-xs text-slate-900">
                                                        Transfer BCA
                                                    </span>
                                                    <span className="font-mono text-[10px] text-slate-400">
                                                        PAY-2605-0012
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500">
                                                    {payment_summary?.last_payment_date || '26 Mei 2026'} • Ref: REF-PAY-857218
                                                </p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <span className="font-mono font-black text-xs text-emerald-700 block">
                                                    {formatRupiah(payment_summary?.paid_amount || 25000000)}
                                                </span>
                                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 sm:justify-end">
                                                    <Check className="w-3 h-3 stroke-[3]" />
                                                    <span>Berhasil Terverifikasi</span>
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                            <span className="text-xs text-slate-500">
                                Perlu bantuan pembayaran? Hubungi tim support via WhatsApp.
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="px-4 py-2 bg-[#F4EBE4] hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] border border-[#E8DDD5] text-[#3C0E0E] text-xs font-bold rounded-xl cursor-pointer transition-all shadow-2xs"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL: LIHAT BUKTI PEMBAYARAN ─────────────────────────────────── */}
            {selectedProofUrl && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-[#3C0E0E]" />
                                <h3 className="font-bold text-sm text-slate-900">Bukti Pembayaran / Transfer</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedProofUrl(null)}
                                className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto flex items-center justify-center bg-slate-900/5 min-h-[300px]">
                            {selectedProofUrl.toLowerCase().endsWith('.pdf') ? (
                                <iframe
                                    src={selectedProofUrl}
                                    title="Bukti Pembayaran PDF"
                                    className="w-full h-[400px] rounded-xl border border-slate-200 bg-white"
                                />
                            ) : (
                                <img
                                    src={selectedProofUrl}
                                    alt="Bukti Transfer"
                                    className="max-h-[500px] w-auto max-w-full rounded-xl object-contain shadow-md"
                                />
                            )}
                        </div>
                        <div className="p-3.5 px-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                            <a
                                href={selectedProofUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Buka File Asli di Tab Baru</span>
                            </a>
                            <button
                                type="button"
                                onClick={() => setSelectedProofUrl(null)}
                                className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-800"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── LIGHTBOX MODAL (PHOTO VIEWER FOR PORTFOLIO & HIGHLIGHTS) ──────── */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <button
                        type="button"
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-20"
                        aria-label="Tutup preview"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveLightboxIndex((prev) => (prev === 0 ? portfolioPhotos.length - 1 : prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-20"
                        aria-label="Foto sebelumnya"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveLightboxIndex((prev) => (prev + 1) % portfolioPhotos.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-20"
                        aria-label="Foto selanjutnya"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="relative max-w-4xl max-h-[85vh] flex flex-col items-center justify-center">
                        <img
                            src={portfolioPhotos[activeLightboxIndex % portfolioPhotos.length]?.image || ''}
                            alt="Portofolio Arams Pictures"
                            className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl animate-in zoom-in-95 duration-200"
                        />
                        <div className="mt-4 text-center text-white/90">
                            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm">
                                Foto {activeLightboxIndex + 1} dari {portfolioPhotos.length}
                            </span>
                            <div className="mt-2">
                                <Link
                                    href="/client/portfolio"
                                    className="text-xs font-bold text-white hover:underline inline-flex items-center gap-1"
                                >
                                    <span>Lihat Semua Galeri Portfolio Lengkap</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ClientLayout>
    );
}
