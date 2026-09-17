import { Head, useForm, Link, usePage } from '@inertiajs/react';
import {
    Lock,
    Mail,
    Eye,
    EyeOff,
    Camera,
    Shield,
    Headphones,
    Gift,
} from 'lucide-react';
import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { isDarkColor } from '@/lib/utils';

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({ status, canResetPassword = true }: LoginProps) {
    const { props: pageProps } = usePage<any>();
    const appSettings = pageProps?.appSettings || {};

    const companyName = appSettings.company_name || 'Arams Photography';
    const loginBg = appSettings.login_bg_color || '#2E0F15';
    const loginBgGradient = appSettings.login_bg_gradient || 'linear-gradient(180deg, #2E0F15 0%, #200A0E 100%)';
    const loginCardBg = appSettings.login_card_bg || '#FFFFFF';
    const loginCardBgGradient = appSettings.login_card_bg_gradient || '';
    const loginAccent = appSettings.login_accent_color || '#2563EB';
    const loginTagline = appSettings.login_tagline || 'STUDIO & CINEMA PHOTOGRAPHY SYSTEM';
    const fontHeading = appSettings.font_family_heading || 'Plus Jakarta Sans';
    // Content fields
    const loginBgPhoto = appSettings.login_bg_photo || '/images/wedding-couple.jpg';
    const loginHeadline = appSettings.login_headline || 'Abadikan Setiap\nMomen Berharga Anda';
    const loginDescription = appSettings.login_description || `Terima kasih telah mempercayakan momen spesial Anda kepada ${appSettings.company_name || 'Arams Photography'}.`;
    const loginWelcomeText = appSettings.login_welcome_text || 'Welcome Back!';
    const pillar1Title = appSettings.login_pillar_1_title || 'Kualitas Terbaik';
    const pillar1Desc = appSettings.login_pillar_1_desc || 'Peralatan profesional & editing berkualitas tinggi.';
    const pillar2Title = appSettings.login_pillar_2_title || '100% Aman';
    const pillar2Desc = appSettings.login_pillar_2_desc || 'Data & file Anda aman bersama kami.';
    const pillar3Title = appSettings.login_pillar_3_title || 'Layanan Personal';
    const pillar3Desc = appSettings.login_pillar_3_desc || 'Kami mendengar & mewujudkan visi Anda.';

    const isDarkCard = isDarkColor(loginCardBg);

    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login', { onFinish: () => reset('password') });
    };

    const initials = companyName
        .split(' ')
        .filter(Boolean)
        .map((w: string) => w[0])
        .join('')
        .slice(0, 2)
        .toLowerCase() || 'ap';

    return (
        <div className="min-h-screen w-full flex font-sans antialiased text-slate-800">
            <Head title={`Login - ${companyName}`} />
            <Toaster position="top-right" richColors />

            {/* ── LEFT COLUMN: Dark Overlay + Photo ────────────────────── */}
            <div
                style={{ background: loginBgGradient || loginBg }}
                className="hidden lg:flex w-1/2 flex-col justify-between p-10 xl:p-12 text-white shrink-0 relative overflow-hidden"
            >
                {/* Background photo with subtle, low-opacity warm overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={loginBgPhoto}
                        alt="Arams Couple"
                        className="w-full h-full object-cover opacity-70 filter brightness-85 contrast-105"
                    />
                    <div
                        style={{
                            background: `linear-gradient(to top, rgba(30, 8, 12, 0.70) 0%, rgba(46, 15, 21, 0.45) 50%, rgba(32, 10, 14, 0.28) 100%)`,
                        }}
                        className="absolute inset-0"
                    />
                </div>

                {/* Top: Brand */}
                <div className="relative z-10 flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center font-black text-lg tracking-tight shadow-md">
                        {initials}
                    </div>
                    <div>
                        <h2 className="font-extrabold text-sm tracking-[0.18em] text-white uppercase">
                            {companyName}
                        </h2>
                        <p className="text-[9px] tracking-[0.28em] text-rose-200/90 font-bold uppercase mt-0.5">
                            {appSettings.company_tagline || 'Photografer'}
                        </p>
                    </div>
                </div>

                {/* Center / Lower: Headline shifted downwards */}
                <div className="relative z-10 space-y-3.5 mt-auto mb-8 pt-14">
                    <span className="text-[10px] tracking-[0.25em] font-extrabold text-rose-200 uppercase block">
                        {loginTagline}
                    </span>
                    <h1
                        style={{ fontFamily: `'${fontHeading}', serif` }}
                        className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-sm"
                    >
                        {loginHeadline.split('\n').map((line: string, i: number, arr: string[]) => (
                            <React.Fragment key={i}>
                                {line}
                                {i < arr.length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </h1>
                    <div
                        style={{ backgroundColor: `${loginAccent}80` }}
                        className="w-12 h-0.5 mt-2 mb-2"
                    />
                    <p className="text-xs text-rose-100/85 leading-relaxed max-w-sm drop-shadow-xs">
                        {loginDescription}
                    </p>
                </div>

                {/* Bottom: 3 Pillars */}
                <div className="relative z-10 grid grid-cols-3 gap-3 pt-6 border-t border-white/15">
                    {[
                        { icon: Camera, title: pillar1Title, desc: pillar1Desc },
                        { icon: Shield, title: pillar2Title, desc: pillar2Desc },
                        { icon: Headphones, title: pillar3Title, desc: pillar3Desc },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="space-y-1.5">
                            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-rose-200">
                                <Icon className="w-4 h-4" />
                            </div>
                            <h4 className="font-bold text-[11px] text-white">{title}</h4>
                            <p className="text-[10px] text-rose-200/70 leading-snug">{desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── RIGHT COLUMN: Dynamic Themed Form Panel ──────────────── */}
            <div
                style={{
                    background: loginCardBgGradient || loginCardBg,
                }}
                className={`flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 py-12 transition-colors ${isDarkCard ? 'text-slate-100' : 'text-slate-800'
                    }`}
            >
                {/* Mobile logo (only on small screens) */}
                <div className="flex items-center gap-3 mb-8 lg:hidden">
                    <div
                        style={{ backgroundColor: loginAccent }}
                        className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-base tracking-tight shadow-sm"
                    >
                        {initials}
                    </div>
                    <span className={`font-extrabold text-sm tracking-widest uppercase ${isDarkCard ? 'text-white' : 'text-slate-800'}`}>
                        {companyName}
                    </span>
                </div>

                <div className="w-full max-w-md mx-auto space-y-7">

                    {/* Heading */}
                    <div className="space-y-1.5">
                        <h2
                            style={{
                                color: isDarkCard ? '#FFFFFF' : '#0F172A',
                                fontFamily: `'${fontHeading}', serif`,
                            }}
                            className="text-3xl xl:text-4xl font-black tracking-tight"
                        >
                            {loginWelcomeText}
                        </h2>
                        <p className={`text-sm ${isDarkCard ? 'text-slate-300' : 'text-slate-500'}`}>
                            Masuk ke sistem {companyName}
                        </p>
                    </div>

                    {/* Status */}
                    {status && (
                        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold text-center">
                            {status}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className={`block text-sm font-semibold ${isDarkCard ? 'text-slate-200' : 'text-slate-700'}`}>
                                Email
                            </label>
                            <div className="relative">
                                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDarkCard ? 'text-slate-400' : 'text-slate-400'}`} />
                                <input
                                    id="login-email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="admin@gmail.com"
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all placeholder:text-slate-400 ${isDarkCard
                                            ? 'bg-white/10 border border-white/20 text-white focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/10'
                                            : 'bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 text-slate-900 focus:ring-2 focus:ring-slate-200'
                                        }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-[11px] font-bold text-rose-500">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className={`block text-sm font-semibold ${isDarkCard ? 'text-slate-200' : 'text-slate-700'}`}>
                                Password
                            </label>
                            <div className="relative">
                                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDarkCard ? 'text-slate-400' : 'text-slate-400'}`} />
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all placeholder:text-slate-400 ${isDarkCard
                                            ? 'bg-white/10 border border-white/20 text-white focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/10'
                                            : 'bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 text-slate-900 focus:ring-2 focus:ring-slate-200'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors cursor-pointer ${isDarkCard ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                                        }`}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-[11px] font-bold text-rose-500">{errors.password}</p>
                            )}
                        </div>

                        {/* Submit Button: Custom styled #F4EBE4 with #3C0E0E active */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={processing}
                            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 bg-[#F4EBE4] hover:bg-[#3C0E0E] active:bg-[#3C0E0E] focus:bg-[#3C0E0E] text-[#3C0E0E] hover:text-[#F4EBE4] active:text-[#F4EBE4] focus:text-[#F4EBE4] border border-[#3C0E0E]/20 hover:border-[#3C0E0E] shadow-sm hover:shadow-md hover:shadow-[#3C0E0E]/25 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#3C0E0E]/30 group"
                        >
                            {processing ? (
                                <>
                                    <Spinner className="w-4 h-4 text-current" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <span>Masuk</span>
                            )}
                        </button>

                        {/* Lupa password */}
                        {canResetPassword && (
                            <div className="text-center">
                                <Link
                                    href="/forgot-password"
                                    style={{ color: isDarkCard ? '#93C5FD' : loginAccent }}
                                    className="text-sm font-semibold hover:underline"
                                >
                                    Lupa password?
                                </Link>
                            </div>
                        )}
                    </form>

                    {/* Belum punya akun */}
                    <div
                        style={{
                            backgroundColor: isDarkCard ? 'rgba(255, 255, 255, 0.06)' : `${loginAccent}0d`,
                            borderColor: isDarkCard ? 'rgba(255, 255, 255, 0.15)' : `${loginAccent}26`,
                        }}
                        className="border rounded-2xl p-4 flex items-start gap-3.5 backdrop-blur-xs"
                    >
                        <div
                            style={{
                                backgroundColor: isDarkCard ? 'rgba(255, 255, 255, 0.12)' : `${loginAccent}1a`,
                                color: isDarkCard ? '#FFFFFF' : loginAccent,
                            }}
                            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        >
                            <Gift className="w-4 h-4" />
                        </div>
                        <div className="text-sm">
                            <h4 className={`font-bold ${isDarkCard ? 'text-white' : 'text-slate-900'}`}>
                                Belum memiliki akun?
                            </h4>
                            <p className={`text-xs mt-0.5 leading-snug ${isDarkCard ? 'text-slate-300' : 'text-slate-500'}`}>
                                Hubungi admin {companyName} untuk mendapatkan akses ke portal ini.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className={`text-center text-xs ${isDarkCard ? 'text-slate-400' : 'text-slate-400'}`}>
                        © 2026 {companyName} Management System.
                    </p>
                </div>
            </div>
        </div>
    );
}
