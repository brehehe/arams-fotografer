import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export interface PromoSlideItem {
    id: string | number;
    tag?: string;
    title: string;
    description?: string;
    button_text?: string;
    button_url?: string;
    image: string;
    project_id?: string | null;
}

export interface ClientHeroCarouselProps {
    slides?: PromoSlideItem[];
    className?: string;
}

export const DEFAULT_PROMO_SLIDES: PromoSlideItem[] = [
    {
        id: '1',
        tag: 'EXCLUSIVE WEDDING',
        title: 'Cinematic Drone & 4K Wedding Story',
        description:
            'Bonus video drone 4K dan album kanvas eksklusif untuk booking sesi pernikahan tahun ini. Slot terbatas untuk setiap musim.',
        button_text: 'Booking Jadwal Sekarang',
        button_url: '/form-klien',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&auto=format&fit=crop&q=85',
    },
    {
        id: '2',
        tag: 'ROMANTIC PREWEDDING',
        title: 'Golden Sunset at Bromo & Savanna',
        description:
            'Abadikan kehangatan cinta Anda dengan latar megah alam nusantara. Termasuk makeup artist dan wardrobe stylist profesional.',
        button_text: 'Lihat Paket Prewedding',
        button_url: '/form-klien',
        image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1920&auto=format&fit=crop&q=85',
    },
    {
        id: '3',
        tag: 'FAMILY PORTRAIT',
        title: 'Warm & Intimate Family Studio Session',
        description:
            'Ciptakan warisan kenangan hangat bersama keluarga tercinta di studio eksklusif dengan pencahayaan sinematik premium.',
        button_text: 'Konsultasi Paket',
        button_url: '/form-klien',
        image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1920&auto=format&fit=crop&q=85',
    },
    {
        id: '4',
        tag: 'SPECIAL OFFER',
        title: 'Abadikan Momen Terbaikmu dengan Arams Pictures',
        description:
            'Promo spesial untuk setiap momen berharga Anda. Dapatkan penawaran terbaik untuk paket wedding, prewedding & portrait pilihan Anda.',
        button_text: 'Lihat Promo Selengkapnya',
        button_url: '/form-klien',
        image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1920&auto=format&fit=crop&q=85',
    },
];

export function ClientHeroCarousel({ slides, className = '' }: ClientHeroCarouselProps) {
    const { props: pageProps } = usePage<any>();
    const appSettings = pageProps?.appSettings || {};

    const COLOR_BURGUNDY = '#3C0E0E';
    const COLOR_WARM_CREAM = '#F4EBE4';

    const portalHeroBg = appSettings.portal_hero_bg || COLOR_BURGUNDY;
    const portalHeroGradient = appSettings.portal_hero_gradient || '';
    const portalHeroText = appSettings.portal_hero_text_color || '#FFFFFF';
    const portalFontHeading = appSettings.portal_font_heading || 'Plus Jakarta Sans';

    const hexToRgba = (hex: string, alpha: number) => {
        if (!hex || !hex.startsWith('#')) {
return hex;
}

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

    const promoSlides: PromoSlideItem[] =
        slides && slides.length > 0
            ? slides
            : (pageProps?.promo_slides && pageProps.promo_slides.length > 0)
            ? pageProps.promo_slides
            : DEFAULT_PROMO_SLIDES;

    const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
    const [isHoveredPromo, setIsHoveredPromo] = useState(false);

    useEffect(() => {
        if (promoSlides.length <= 1 || isHoveredPromo) {
return;
}

        const timer = setInterval(() => {
            setCurrentPromoIndex((prev) => (prev + 1) % promoSlides.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [promoSlides.length, isHoveredPromo]);

    const activePromo = promoSlides[currentPromoIndex % promoSlides.length] || promoSlides[0];

    return (
        <section
            style={{
                background: portalHeroGradient || portalHeroBg,
                color: portalHeroText,
            }}
            onMouseEnter={() => setIsHoveredPromo(true)}
            onMouseLeave={() => setIsHoveredPromo(false)}
            className={`relative -mt-6 sm:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden shadow-md min-h-[310px] sm:min-h-[390px] lg:min-h-[450px] flex items-center transition-colors select-none ${className}`}
        >
            {/* Inner Decorative Box Frame (Kotak Bingkai - lifted at bottom so slider dots sit below the line) */}
            <div className="absolute inset-x-2.5 top-2.5 bottom-8 sm:inset-x-3.5 sm:top-3.5 sm:bottom-9 lg:inset-x-4 lg:top-4 lg:bottom-10 border border-white/20 rounded-xl pointer-events-none z-20" />

            {/* Pre-rendered Stacked Cross-Fade Background Images */}
            <div className="absolute inset-0 z-0">
                {promoSlides.map((slide, idx) => (
                    <img
                        key={slide.id || idx}
                        src={slide.image}
                        alt={slide.title}
                        className={`absolute inset-0 w-full h-full object-cover object-center sm:object-right filter brightness-95 contrast-[1.05] transition-opacity duration-700 ease-in-out ${
                            currentPromoIndex === idx ? 'opacity-85 sm:opacity-95' : 'opacity-0 pointer-events-none'
                        }`}
                    />
                ))}
                {/* Mobile Gradient Overlay */}
                <div
                    style={{
                        background: `linear-gradient(to bottom, ${hexToRgba(portalHeroBg, 0.95)} 0%, ${hexToRgba(portalHeroBg, 0.70)} 50%, ${hexToRgba(portalHeroBg, 0.95)} 100%)`,
                    }}
                    className="absolute inset-0 sm:hidden z-10 pointer-events-none"
                />
                {/* Desktop Gradient Overlay */}
                <div
                    style={{
                        background: `linear-gradient(to right, ${hexToRgba(portalHeroBg, 0.97)} 0%, ${hexToRgba(portalHeroBg, 0.90)} 35%, ${hexToRgba(portalHeroBg, 0.55)} 60%, ${hexToRgba(portalHeroBg, 0.15)} 80%, transparent 100%)`,
                    }}
                    className="absolute inset-0 hidden sm:block z-10 pointer-events-none"
                />
            </div>

            {/* Hero Slide Text Content with Smooth Animated Transition */}
            <div className="relative z-10 w-full max-w-full px-6 sm:px-12 lg:px-16 py-8 sm:py-12 lg:py-14">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPromoIndex}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="max-w-xl space-y-2.5 sm:space-y-3 drop-shadow-xs"
                    >
                        {activePromo.tag && (
                            <span
                                style={{ color: COLOR_WARM_CREAM }}
                                className="text-[10px] font-extrabold tracking-[0.25em] uppercase block opacity-90"
                            >
                                {activePromo.tag}
                            </span>
                        )}
                        <h1
                            style={{
                                fontFamily: `'${portalFontHeading}', serif`,
                                color: portalHeroText,
                            }}
                            className="text-xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-tight leading-[1.2]"
                        >
                            {activePromo.title}
                        </h1>
                        {activePromo.description && (
                            <p
                                style={{ color: COLOR_WARM_CREAM }}
                                className="text-xs sm:text-sm leading-relaxed max-w-lg opacity-90"
                            >
                                {activePromo.description}
                            </p>
                        )}
                        <div className="pt-2">
                            <Link
                                href={activePromo.button_url || '/form-klien'}
                                className="client-btn-primary"
                            >
                                <span>{activePromo.button_text || 'Lihat Selengkapnya'}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Pagination Slider Dots - positioned below the inner frame line so they never collide */}
            {promoSlides.length > 1 && (
                <div className="absolute bottom-2 sm:bottom-2.5 inset-x-0 flex justify-center items-center gap-1.5 z-20">
                    {promoSlides.map((_, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCurrentPromoIndex(idx);
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                currentPromoIndex === idx ? 'w-6 bg-white shadow-xs' : 'w-1.5 bg-white/40 hover:bg-white/70'
                            }`}
                            aria-label={`Slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

export default ClientHeroCarousel;
