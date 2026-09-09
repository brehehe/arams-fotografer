import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ClientLayout } from '@/layouts/ClientLayout';
import {
    Camera,
    Instagram,
    ExternalLink,
    Search,
    Sparkles,
    Eye,
    X,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Download,
    Share2,
    SlidersHorizontal,
    FolderKanban,
    ArrowRight,
    Check,
} from 'lucide-react';

interface PortfolioItem {
    id: string | number;
    image: string;
    image_url?: string;
    caption?: string;
    title?: string;
    likes?: number;
    comments?: number;
    post_url?: string | null;
    type?: string;
    category?: string;
    project_id?: string;
    is_cover?: boolean;
}

interface ClientPortfolioProps {
    portfolios?: PortfolioItem[];
    highlights?: PortfolioItem[];
    client?: {
        id: string;
        name: string;
    } | null;
    company?: {
        name?: string;
        tagline?: string;
        phone?: string;
        email?: string;
        instagram?: string;
        instagram_url?: string;
        website?: string;
    };
}

export default function ClientPortfolio({
    portfolios = [],
    highlights = [],
    client = null,
    company = {},
}: ClientPortfolioProps) {
    const { props: pageProps } = usePage<any>();
    const appSettings = pageProps?.appSettings || {};

    // Exact color palette tokens matching Dashboard
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

    // Safe hex to rgba converter
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

    // Merge default sample photos if database list is small
    const samplePortfolios: PortfolioItem[] = [
        {
            id: 'sample-1',
            image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop&q=85',
            title: 'Royal Heritage Wedding',
            caption: 'The Royal Blessing Ceremony with traditional nuances and timeless elegance. @aramspictures #AramsWedding',
            likes: 184,
            comments: 24,
            category: 'Wedding',
            type: 'image',
        },
        {
            id: 'sample-2',
            image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200&auto=format&fit=crop&q=85',
            title: 'Sunset at Bromo Mountain',
            caption: 'Dramatic prewedding session amidst the golden hour of Bromo savanna. #AramsPrewedding',
            likes: 245,
            comments: 38,
            category: 'Prewedding',
            type: 'image',
        },
        {
            id: 'sample-3',
            image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop&q=85',
            title: 'Classic Ballroom Reception',
            caption: 'Intimate celebration filled with warm tears, smiles, and everlasting love. #AramsMoments',
            likes: 198,
            comments: 19,
            category: 'Wedding',
            type: 'image',
        },
        {
            id: 'sample-4',
            image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&auto=format&fit=crop&q=85',
            title: 'Intimate Engagement Day',
            caption: 'Two souls, one sacred promise. The journey to forever starts here. #AramsEngagement',
            likes: 142,
            comments: 15,
            category: 'Engagement',
            type: 'image',
        },
        {
            id: 'sample-5',
            image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&auto=format&fit=crop&q=85',
            title: 'Studio Portrait & Maternity',
            caption: 'Capturing the glowing anticipation of new life in pure elegance. #AramsStudio',
            likes: 112,
            comments: 11,
            category: 'Studio',
            type: 'image',
        },
        {
            id: 'sample-6',
            image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&auto=format&fit=crop&q=85',
            title: 'Outdoor Garden Exchange of Vows',
            caption: 'Romantic garden vows surrounded by lush blossoms and golden sunshine. #AramsWedding',
            likes: 215,
            comments: 31,
            category: 'Wedding',
            type: 'image',
        },
    ];

    const allItems: PortfolioItem[] = [
        ...portfolios,
        ...highlights,
        ...(portfolios.length < 4 ? samplePortfolios : []),
    ];

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { id: 'all', label: 'Semua Karya' },
        { id: 'wedding', label: 'Wedding' },
        { id: 'prewedding', label: 'Prewedding' },
        { id: 'engagement', label: 'Engagement' },
        { id: 'studio', label: 'Studio & Maternity' },
    ];

    const filteredItems = allItems.filter((item) => {
        const itemCat = (item.category || item.title || '').toLowerCase();
        const matchesCategory =
            selectedCategory === 'all' ||
            (selectedCategory === 'wedding' && itemCat.includes('wedding')) ||
            (selectedCategory === 'prewedding' && itemCat.includes('prewedding')) ||
            (selectedCategory === 'engagement' && itemCat.includes('engagement')) ||
            (selectedCategory === 'studio' && (itemCat.includes('studio') || itemCat.includes('maternity') || itemCat.includes('portrait')));

        const textContent = `${item.title || ''} ${item.caption || ''} ${item.category || ''}`.toLowerCase();
        const matchesSearch = textContent.includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    // Lightbox modal states
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setZoomLevel(1);
    };

    const closeLightbox = () => {
        setLightboxIndex(null);
        setZoomLevel(1);
    };

    const nextImage = () => {
        if (lightboxIndex !== null && filteredItems.length > 0) {
            setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
            setZoomLevel(1);
        }
    };

    const prevImage = () => {
        if (lightboxIndex !== null && filteredItems.length > 0) {
            setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
            setZoomLevel(1);
        }
    };

    const currentLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

    return (
        <ClientLayout>
            <Head title="Portofolio Karya - Arams Pictures" />

            <div className="space-y-6 sm:space-y-8">
                {/* ── 1. HERO BANNER ────────────────────────────────────────── */}
                <section
                    style={{
                        background: portalHeroGradient || portalHeroBg,
                        color: portalHeroText,
                    }}
                    className="relative -mt-6 sm:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden shadow-md min-h-[240px] sm:min-h-[290px] lg:min-h-[320px] flex items-center transition-colors select-none"
                >
                    {/* Inner Decorative Box Frame */}
                    <div className="absolute inset-2.5 sm:inset-3.5 lg:inset-4 border border-white/20 rounded-xl pointer-events-none z-20" />

                    {/* Background Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&auto=format&fit=crop&q=85"
                            alt="Portofolio Arams Pictures"
                            className="w-full h-full object-cover object-center sm:object-right opacity-85 sm:opacity-95 filter brightness-95 contrast-[1.05]"
                        />
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

                    {/* Hero Content */}
                    <div className="relative z-10 w-full max-w-full px-6 sm:px-12 lg:px-16 py-8 sm:py-10 lg:py-12">
                        <div className="max-w-xl space-y-2.5 sm:space-y-3 drop-shadow-xs">
                            <span
                                style={{ color: COLOR_WARM_CREAM }}
                                className="text-[10px] font-extrabold tracking-[0.25em] uppercase block opacity-90"
                            >
                                SHOWCASE &amp; GALLERY
                            </span>
                            <h1
                                style={{
                                    fontFamily: `'${portalFontHeading}', serif`,
                                    color: portalHeroText,
                                }}
                                className="text-xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-tight leading-[1.2]"
                            >
                                Portofolio Karya Kami
                            </h1>
                            <p
                                style={{ color: COLOR_WARM_CREAM }}
                                className="text-xs sm:text-sm leading-relaxed max-w-lg opacity-90"
                            >
                                Kumpulan momen magis dan karya dokumentasi terbaik yang telah kami abadikan dengan dedikasi penuh estetika.
                            </p>
                            <div className="pt-1.5 flex flex-wrap items-center gap-2.5">
                                <a
                                    href={company?.instagram_url || 'https://instagram.com/aramspictures'}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                        borderColor: 'rgba(255, 255, 255, 0.25)',
                                        color: '#FFFFFF',
                                    }}
                                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-semibold backdrop-blur-xs hover:bg-white/25 transition-colors"
                                >
                                    <Instagram className="w-3.5 h-3.5 text-white/90" />
                                    <span>{company?.instagram || '@aramspictures'}</span>
                                    <ExternalLink className="w-3 h-3 text-white/70" />
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 2. FILTER & SEARCH TOOLBAR ────────────────────────────── */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                        {categories.map((cat) => {
                            const isActive = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.id)}
                                    style={
                                        isActive
                                            ? {
                                                  backgroundColor: portalPrimaryAccent,
                                                  color: '#FFFFFF',
                                              }
                                            : {
                                                  borderColor: '#E8DDD5',
                                              }
                                    }
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                        isActive
                                            ? 'shadow-xs'
                                            : 'bg-white hover:bg-slate-100 text-slate-700 border'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-64 shrink-0">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari foto / tema..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E8DDD5] rounded-xl text-xs outline-hidden text-slate-900 placeholder:text-slate-400 transition-colors shadow-2xs focus:border-[#3C0E0E]"
                        />
                    </div>
                </div>

                {/* ── 3. PORTFOLIO GRID GALLERY ────────────────────────────── */}
                {filteredItems.length === 0 ? (
                    <div className="rounded-2xl border border-[#E8DDD5] bg-white p-12 text-center space-y-3 shadow-2xs">
                        <div className="w-14 h-14 rounded-2xl bg-[#F4EBE4] text-[#3C0E0E] flex items-center justify-center mx-auto">
                            <Camera className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900">Tidak Ada Karya yang Ditemukan</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                            Coba ubah filter kategori atau kata kunci pencarian Anda untuk melihat karya dokumentasi lainnya.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                        {filteredItems.map((item, idx) => {
                            const imgSrc = item.image || item.image_url || '/images/wedding-couple.jpg';

                            return (
                                <div
                                    key={item.id || idx}
                                    onClick={() => openLightbox(idx)}
                                    style={{
                                        borderColor: portalCardBorder,
                                    }}
                                    className="group relative rounded-2xl border bg-white overflow-hidden shadow-xs hover:shadow-xl hover:shadow-[#3C0E0E]/10 hover:-translate-y-1 hover:border-[#3C0E0E]/30 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                                >
                                    {/* Image Container with Hover Zoom */}
                                    <div className="relative aspect-4/5 w-full overflow-hidden bg-slate-100">
                                        <img
                                            src={imgSrc}
                                            alt={item.title || item.caption || 'Portofolio Arams Pictures'}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                                        />

                                        {/* Hover Overlay with Action Icon */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#3C0E0E]/80 via-[#3C0E0E]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 text-white">
                                            <div className="flex justify-end">
                                                <div className="w-8 h-8 rounded-full bg-white/25 backdrop-blur-xs flex items-center justify-center text-white">
                                                    <Eye className="w-4 h-4" />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                {item.category && (
                                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs inline-block">
                                                        {item.category}
                                                    </span>
                                                )}
                                                <p className="text-xs font-bold leading-snug line-clamp-2 drop-shadow-xs">
                                                    {item.title || item.caption || 'Lihat Foto'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Information Row */}
                                    <div className="p-3.5 space-y-2 border-t border-slate-100 bg-white">
                                        <div className="flex items-start justify-between gap-2">
                                            <h4
                                                style={{ color: COLOR_BURGUNDY }}
                                                className="text-xs font-bold truncate group-hover:text-[#8B2635] transition-colors"
                                            >
                                                {item.title || 'Dokumentasi Arams Pictures'}
                                            </h4>
                                            {item.category && (
                                                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#F4EBE4] text-[#3C0E0E] shrink-0">
                                                    {item.category}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                                            {item.caption || 'Karya dokumentasi visual elegan dan berkesan.'}
                                        </p>

                                        <div className="flex items-center justify-end pt-1.5 border-t border-slate-100/80">
                                            <span className="text-[#3C0E0E] font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform text-xs">
                                                Buka <ArrowRight className="w-3 h-3" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── 4. LIGHTBOX IMAGE VIEWER MODAL ───────────────────────── */}
                {lightboxIndex !== null && currentLightboxItem && (
                    <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200">
                        {/* Top Lightbox Toolbar */}
                        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-black/40 text-white border-b border-white/10 z-20">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xs font-bold tracking-wider uppercase text-white/70">
                                    Foto {lightboxIndex + 1} dari {filteredItems.length}
                                </span>
                                {currentLightboxItem.category && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/15 text-white">
                                        {currentLightboxItem.category}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setZoomLevel((z) => (z === 1 ? 1.5 : 1))}
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                                    title={zoomLevel === 1 ? 'Zoom In' : 'Zoom Out'}
                                >
                                    {zoomLevel === 1 ? <ZoomIn className="w-4 h-4" /> : <ZoomOut className="w-4 h-4" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeLightbox}
                                    className="p-2 rounded-lg bg-white/10 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                                    title="Tutup (Esc)"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Center Image Container with Navigation Arrows */}
                        <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden select-none">
                            {/* Prev Arrow */}
                            <button
                                type="button"
                                onClick={prevImage}
                                className="absolute left-2 sm:left-6 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer"
                                title="Foto Sebelumnya"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>

                            {/* Main Active Image */}
                            <div className="max-w-full max-h-full flex items-center justify-center overflow-auto transition-transform duration-300">
                                <img
                                    src={currentLightboxItem.image || currentLightboxItem.image_url || '/images/wedding-couple.jpg'}
                                    alt={currentLightboxItem.title || 'Foto Portofolio'}
                                    style={{ transform: `scale(${zoomLevel})` }}
                                    className="max-h-[75vh] sm:max-h-[80vh] w-auto max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-300 cursor-zoom-in"
                                    onClick={() => setZoomLevel((z) => (z === 1 ? 1.5 : 1))}
                                />
                            </div>

                            {/* Next Arrow */}
                            <button
                                type="button"
                                onClick={nextImage}
                                className="absolute right-2 sm:right-6 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer"
                                title="Foto Selanjutnya"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Bottom Caption & Instagram Link */}
                        <div className="p-4 sm:p-5 bg-black/50 text-white border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left z-20">
                            <div className="space-y-0.5 max-w-2xl">
                                <h4 className="text-sm font-bold text-white">
                                    {currentLightboxItem.title || 'Dokumentasi Arams Pictures'}
                                </h4>
                                <p className="text-xs text-white/80 line-clamp-2">
                                    {currentLightboxItem.caption || 'Karya dokumentasi visual eksklusif dan abadi.'}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {currentLightboxItem.post_url && (
                                    <a
                                        href={currentLightboxItem.post_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors"
                                    >
                                        <Instagram className="w-3.5 h-3.5" />
                                        <span>Lihat di Instagram</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ClientLayout>
    );
}
