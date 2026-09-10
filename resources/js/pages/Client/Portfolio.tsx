import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ClientLayout } from '@/layouts/ClientLayout';
import { ClientHeroCarousel } from '@/components/ClientHeroCarousel';
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
    category_slug?: string;
    category_id?: string;
    project_id?: string;
    is_cover?: boolean;
}

interface ClientPortfolioCategory {
    id: string;
    category_id?: string;
    label: string;
    name?: string;
    count?: number;
}

interface ClientPortfolioProps {
    portfolios?: PortfolioItem[];
    highlights?: PortfolioItem[];
    categories?: ClientPortfolioCategory[];
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
    categories: serverCategories = [],
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

    const allItems: PortfolioItem[] = useMemo(() => {
        if (portfolios && portfolios.length > 0) {
            return portfolios;
        }
        return [
            ...highlights,
            ...(highlights.length < 4 ? samplePortfolios : []),
        ];
    }, [portfolios, highlights]);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Dynamically derive category pills from server categories, strictly ensuring categories without images are never shown!
    // "dan di bagian menu ini jika dari kategori tidak ada gambar tidak perlu di munculkan kategorinya"
    const categories = useMemo(() => {
        const list = [{ id: 'all', label: 'Semua Karya' }];

        if (serverCategories && serverCategories.length > 0) {
            serverCategories.forEach((cat) => {
                const catId = (cat.id || '').toLowerCase();
                const catName = (cat.label || cat.name || '').toLowerCase();
                // Check if there is actually at least one item with a valid image in allItems for this category
                const hasImages = allItems.some((item) => {
                    const imgSrc = item.image || item.image_url;
                    if (!imgSrc) return false;
                    const itemCat = (item.category || '').toLowerCase();
                    const itemSlug = (item.category_slug || '').toLowerCase();
                    const itemId = (item.category_id || '').toLowerCase();
                    return (
                        itemSlug === catId ||
                        itemId === (cat.category_id || '').toLowerCase() ||
                        itemCat === catName ||
                        itemCat.includes(catName) ||
                        catName.includes(itemCat)
                    );
                });

                if (hasImages) {
                    list.push({ id: cat.id, label: cat.label || cat.name || cat.id });
                }
            });
        } else {
            // Dynamic fallback from allItems
            const seen = new Set<string>();
            allItems.forEach((item) => {
                const imgSrc = item.image || item.image_url;
                if (!imgSrc || !item.category) return;
                const catLabel = item.category.trim();
                const catId = item.category_slug || catLabel.toLowerCase().replace(/\s+/g, '-');
                if (!seen.has(catId)) {
                    seen.add(catId);
                    list.push({ id: catId, label: catLabel });
                }
            });
        }

        return list;
    }, [serverCategories, allItems]);

    const filteredItems = useMemo(() => {
        return allItems.filter((item) => {
            const imgSrc = item.image || item.image_url;
            if (!imgSrc) return false; // Exclude items with no image

            const itemCat = (item.category || '').toLowerCase();
            const itemSlug = (item.category_slug || '').toLowerCase();
            const itemId = (item.category_id || '').toLowerCase();
            const selected = selectedCategory.toLowerCase();

            const matchesCategory =
                selected === 'all' ||
                itemSlug === selected ||
                itemId === selected ||
                itemCat === selected ||
                itemCat.includes(selected) ||
                selected.includes(itemCat);

            const textContent = `${item.title || ''} ${item.caption || ''} ${item.category || ''}`.toLowerCase();
            const matchesSearch = textContent.includes(searchQuery.toLowerCase());

            return matchesCategory && matchesSearch;
        });
    }, [allItems, selectedCategory, searchQuery]);

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

    useEffect(() => {
        if (lightboxIndex !== null) {
            document.body.style.overflow = 'hidden';
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') prevImage();
                if (e.key === 'ArrowRight') nextImage();
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                document.body.style.overflow = '';
                window.removeEventListener('keydown', handleKeyDown);
            };
        } else {
            document.body.style.overflow = '';
        }
    }, [lightboxIndex, filteredItems.length]);

    return (
        <ClientLayout>
            <Head title="Portofolio - Arams Pictures" />

            <div className="space-y-6 sm:space-y-8">
                {/* ── 1. HERO BANNER - PORTOFOLIO KARYA ───────────────────── */}
                <section
                    style={{
                        background: portalHeroGradient || portalHeroBg,
                        color: portalHeroText,
                    }}
                    className="relative -mt-6 sm:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden shadow-md min-h-[380px] sm:min-h-[480px] lg:min-h-[560px] flex items-center transition-colors select-none"
                >
                    {/* Inner Decorative Box Frame (Kotak Bingkai) */}
                    <div className="absolute inset-x-4 top-6 bottom-6 sm:inset-x-6 sm:top-8 sm:bottom-8 lg:inset-x-8 lg:top-10 lg:bottom-10 border border-white/20 rounded-2xl pointer-events-none z-20" />

                    {/* Background Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&auto=format&fit=crop&q=85"
                            alt="Portofolio Karya Arams Pictures"
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
                    <div className="relative z-10 w-full max-w-full px-6 sm:px-12 lg:px-16 py-10 sm:py-16 lg:py-20">
                        <div className="max-w-2xl space-y-3 sm:space-y-4 drop-shadow-xs">
                            <span
                                style={{ color: COLOR_WARM_CREAM }}
                                className="text-[10px] sm:text-xs font-extrabold tracking-[0.25em] uppercase block opacity-90"
                            >
                                SHOWCASE &amp; GALLERY
                            </span>
                            <h1
                                style={{
                                    fontFamily: `'${portalFontHeading}', serif`,
                                    color: portalHeroText,
                                }}
                                className="text-2xl sm:text-4xl lg:text-5xl font-serif font-normal tracking-tight leading-[1.18]"
                            >
                                Portofolio
                            </h1>
                            <p
                                style={{ color: COLOR_WARM_CREAM }}
                                className="text-xs sm:text-base leading-relaxed max-w-xl opacity-90"
                            >
                                Jelajahi koleksi dokumentasi momen magis, pernikahan mewah, prewedding romantis, dan potret keluarga terbaik yang telah kami abadikan dengan dedikasi penuh estetika.
                            </p>
                            <div className="pt-2 sm:pt-3 flex flex-wrap items-center gap-2.5 sm:gap-3">
                                <a
                                    href={company?.instagram_url || 'https://instagram.com/aramspictures'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="client-btn-primary text-xs sm:text-sm"
                                >
                                    <Instagram className="w-3.5 h-3.5" />
                                    <span>Follow {company?.instagram || '@aramspictures'}</span>
                                    <ExternalLink className="w-3 h-3 opacity-60" />
                                </a>
                                <div className="client-btn-outline cursor-default">
                                    <Camera className="w-3.5 h-3.5 text-white/90" />
                                    <span>{filteredItems.length} Koleksi Karya</span>
                                </div>
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
                                            : 'bg-[#F4EBE4] hover:!bg-[#3C0E0E] hover:!text-white hover:!border-[#3C0E0E] text-[#3C0E0E] border'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Input */}
                    {/* <div className="relative w-full sm:w-64 shrink-0">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari foto / tema..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E8DDD5] rounded-xl text-xs outline-hidden text-slate-900 placeholder:text-slate-400 transition-colors shadow-2xs focus:border-[#3C0E0E]"
                        />
                    </div> */}
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
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── 4. LIGHTBOX IMAGE VIEWER MODAL (FIT SCREEN - NO SCROLL) ──── */}
                {lightboxIndex !== null && currentLightboxItem && (
                    <div 
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200 select-none overflow-hidden"
                        onClick={closeLightbox}
                    >
                        {/* Top Lightbox Toolbar */}
                        <div 
                            className="flex items-center justify-between px-4 sm:px-6 py-3 bg-black/60 text-white border-b border-white/10 z-20 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xs font-bold tracking-wider uppercase text-white/75">
                                    Foto {lightboxIndex + 1} dari {filteredItems.length}
                                </span>
                                {currentLightboxItem.category && (
                                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-white">
                                        {currentLightboxItem.category}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setZoomLevel((z) => (z === 1 ? 1.5 : 1))}
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                                    title={zoomLevel === 1 ? 'Perbesar (Zoom In)' : 'Perkecil (Zoom Out)'}
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
                        <div 
                            className="relative flex-1 min-h-0 w-full flex items-center justify-center px-2 sm:px-14 py-2 overflow-hidden"
                            onClick={closeLightbox}
                        >
                            {/* Prev Arrow */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    prevImage();
                                }}
                                className="absolute left-3 sm:left-6 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-white/30 text-white backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer shadow-lg border border-white/10"
                                title="Foto Sebelumnya (Panah Kiri)"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>

                            {/* Main Active Image - Fitted to 100% available container height & width without scrolling */}
                            <div 
                                className="w-full h-full flex items-center justify-center overflow-hidden p-1 sm:p-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <img
                                    src={currentLightboxItem.image || currentLightboxItem.image_url || '/images/wedding-couple.jpg'}
                                    alt={currentLightboxItem.title || 'Foto Portofolio'}
                                    style={{ transform: `scale(${zoomLevel})` }}
                                    className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg shadow-2xl transition-transform duration-300 cursor-zoom-in select-none"
                                    onClick={() => setZoomLevel((z) => (z === 1 ? 1.5 : 1))}
                                />
                            </div>

                            {/* Next Arrow */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    nextImage();
                                }}
                                className="absolute right-3 sm:right-6 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-white/30 text-white backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer shadow-lg border border-white/10"
                                title="Foto Selanjutnya (Panah Kanan)"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Bottom Caption & Instagram Link */}
                        <div 
                            className="p-3 sm:p-4 bg-black/60 text-white border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left z-20 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="space-y-0.5 max-w-2xl min-w-0">
                                <h4 className="text-sm font-bold text-white truncate">
                                    {currentLightboxItem.title || 'Dokumentasi Arams Pictures'}
                                </h4>
                                <p className="text-xs text-white/80 line-clamp-1 sm:line-clamp-2">
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
