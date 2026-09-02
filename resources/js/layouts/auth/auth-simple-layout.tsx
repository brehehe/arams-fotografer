import React from 'react';
import { usePage } from '@inertiajs/react';
import type { AuthLayoutProps } from '@/types';
import { Toaster } from '@/components/ui/sonner';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const pageProps = usePage().props as any;
    const settings = pageProps?.appSettings || {};

    const companyName = settings.company_name || 'Arams Pictures';
    const companySubtitle = settings.company_subtitle || 'STUDIO & CINEMA';
    const companyTagline = settings.login_tagline || settings.company_tagline || 'PHOTOGRAPHY SYSTEM';
    const companyLogo = settings.company_logo || '';
    const loginBgColor = settings.login_bg_color || settings.sidebar_bg_color || '#0E091E';
    const loginCardBg = settings.login_card_bg || '#1C132E';
    const accentColor = settings.login_accent_color || settings.primary_accent_color || '#C98922';
    const headingFont = settings.font_family_heading || 'Plus Jakarta Sans';
    const bodyFont = settings.font_family_body || 'Plus Jakarta Sans';

    // Compute initials from company name (e.g. Arams Pictures -> AP)
    const initials = companyName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w: string) => w[0])
        .join('')
        .toUpperCase() || 'AP';

    return (
        <div
            suppressHydrationWarning
            className="relative flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 text-slate-100 overflow-hidden"
            style={{
                backgroundColor: loginBgColor,
                fontFamily: `"${bodyFont}", sans-serif`,
                // @ts-ignore
                '--primary-accent': accentColor,
                '--login-bg': loginBgColor,
                '--login-card-bg': loginCardBg,
            }}
        >
            <Toaster position="top-right" richColors closeButton />
            <style>{`
                :root {
                    --primary-accent: ${accentColor};
                    --login-bg: ${loginBgColor};
                    --login-card-bg: ${loginCardBg};
                }
                .bg-primary-accent {
                    background-color: var(--primary-accent) !important;
                }
                .text-primary-accent {
                    color: var(--primary-accent) !important;
                }
                .border-primary-accent {
                    border-color: var(--primary-accent) !important;
                }
            `}</style>

            {/* Background Ambient Luxury Gradients */}
            <div
                className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none opacity-20"
                style={{ backgroundColor: accentColor }}
            />
            <div
                className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none opacity-25"
                style={{ backgroundColor: accentColor }}
            />
            <div
                className="absolute inset-0 [background-size:32px_32px] opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(${accentColor} 1px, transparent 1px)`,
                }}
            />

            <div className="w-full max-w-[420px] relative z-10">
                {/* Main Card */}
                <div
                    className="backdrop-blur-2xl border rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/70 relative overflow-hidden transition-all duration-300"
                    style={{
                        backgroundColor: loginCardBg ? `${loginCardBg}EE` : 'rgba(28, 19, 46, 0.95)',
                        borderColor: `${accentColor}33`,
                    }}
                >
                    {/* Top Accent Line */}
                    <div
                        className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[var(--primary-accent)] to-transparent opacity-90"
                    />

                    {/* Logo & Brand Header */}
                    <div className="flex flex-col items-center gap-3 mb-6 text-center">
                        {/* Luxury Logo Badge */}
                        <div className="relative group cursor-pointer">
                            <div
                                className="absolute -inset-1 rounded-2xl blur-xs opacity-40 group-hover:opacity-80 transition duration-300"
                                style={{ backgroundColor: accentColor }}
                            />
                            <div
                                className="relative flex items-center justify-center w-14 h-14 rounded-2xl border shadow-inner overflow-hidden"
                                style={{
                                    backgroundColor: loginBgColor,
                                    borderColor: `${accentColor}66`,
                                }}
                            >
                                {companyLogo ? (
                                    <img
                                        src={companyLogo}
                                        alt={companyName}
                                        className="w-10 h-10 object-contain"
                                    />
                                ) : (
                                    <span
                                        className="font-serif font-black text-2xl tracking-tighter drop-shadow-xs"
                                        style={{ color: accentColor }}
                                    >
                                        {initials}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Brand Name */}
                        <div>
                            <span
                                className="font-extrabold text-xl tracking-[0.25em] text-white uppercase block drop-shadow-xs"
                                style={{ fontFamily: `"${headingFont}", sans-serif` }}
                            >
                                {companyName}
                            </span>
                            {companySubtitle && (
                                <span
                                    className="text-[10px] tracking-[0.35em] font-bold uppercase block mt-0.5"
                                    style={{ color: accentColor }}
                                >
                                    {companySubtitle}
                                </span>
                            )}
                            {companyTagline && (
                                <span className="text-[9px] tracking-[0.2em] text-slate-400 font-medium uppercase block mt-1">
                                    {companyTagline}
                                </span>
                            )}
                        </div>

                        {/* Page Title & Description */}
                        {(title || description) && (
                            <div className="pt-2">
                                {title && (
                                    <h1 className="text-base font-bold text-white tracking-tight">
                                        {title}
                                    </h1>
                                )}
                                {description && (
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        {description}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Main Form Slot */}
                    {children}
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-xs text-slate-400/80 font-medium">
                    © 2026 {companyName} Management System.
                </div>
            </div>
        </div>
    );
}
