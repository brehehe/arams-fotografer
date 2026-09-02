import React, { useState } from 'react';
import { Instagram, ArrowUpRight, Loader2 } from 'lucide-react';

interface InstagramEmbedProps {
    url?: string;
    username?: string;
    displayName?: string;
    maxWidth?: number | string;
    height?: number | string;
    className?: string;
    title?: string;
}

/**
 * Super Clean & Polished Instagram Profile Iframe Embed Component
 * Embeds official URL (e.g. https://www.instagram.com/aramspictures/embed)
 * within a tailored design system container that eliminates awkward scrollbars and spacing.
 */
export function InstagramEmbed({
    url = 'https://www.instagram.com/aramspictures/embed',
    username = 'aramspictures',
    displayName = 'Arams Pictures',
    maxWidth = '100%',
    height = 380,
    className = '',
    title = 'Live Instagram Feed Arams Pictures',
}: InstagramEmbedProps) {
    const [isLoading, setIsLoading] = useState(true);
    const cleanUsername = username.replace(/^@/, '');
    const profileUrl = `https://www.instagram.com/${cleanUsername}/`;
    const embedSrc = url.includes('/embed') ? url : `${url.replace(/\/+$/, '')}/embed`;

    return (
        <div
            className={`w-full mx-auto rounded-2xl overflow-hidden border border-stone-200/90 shadow-xs bg-white flex flex-col justify-between transition-all ${className}`}
            style={{ maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth }}
        >
            {/* 1. Top Accent Bar (Live Feed Indicator + Direct Handle Link) */}
            <div className="px-4 py-2.5 border-b border-stone-100 flex items-center justify-between bg-white text-xs shrink-0">
                <div className="flex items-center gap-1.5 text-pink-600 font-bold">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    <span className="ml-1 text-[11px] tracking-wide">Live Instagram Feed</span>
                </div>
                <a
                    href={profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-pink-600 hover:text-pink-700 hover:underline flex items-center gap-0.5"
                >
                    <span>@{cleanUsername}</span>
                    <ArrowUpRight className="w-3 h-3" />
                </a>
            </div>

            {/* 2. Official Instagram Iframe Container */}
            <div
                className="w-full relative overflow-hidden bg-stone-50/50 flex items-center justify-center"
                style={{ height: typeof height === 'number' ? `${height}px` : height }}
            >
                {/* Loading State Spinner */}
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-stone-50/90 z-10 text-stone-400">
                        <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                        <span className="text-[11px] font-medium">Memuat feed Instagram...</span>
                    </div>
                )}

                {/* The Clean Iframe */}
                <iframe
                    src={embedSrc}
                    className="w-full h-full border-0 overflow-hidden"
                    scrolling="no"
                    loading="lazy"
                    title={title}
                    onLoad={() => setIsLoading(false)}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                    }}
                />
            </div>

            {/* 3. Bottom Action Bar */}
            <div className="px-4 py-2.5 bg-stone-50/90 border-t border-stone-100 flex items-center justify-between text-xs shrink-0">
                <span className="text-stone-500 text-[11px] font-medium">
                    {displayName}
                </span>
                <a
                    href={profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 text-white text-[11px] font-bold shadow-2xs hover:opacity-95 transition-all"
                >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Buka Profil Asli ↗</span>
                </a>
            </div>
        </div>
    );
}

export default InstagramEmbed;
