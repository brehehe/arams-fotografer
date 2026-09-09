import React, { useState } from 'react';
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

    const companyName          = appSettings.company_name             || 'Arams Photography';
    const loginBg              = appSettings.login_bg_color           || '#2E0F15';
    const loginBgGradient      = appSettings.login_bg_gradient        || 'linear-gradient(180deg, #2E0F15 0%, #200A0E 100%)';
    const loginCardBg          = appSettings.login_card_bg            || '#FFFFFF';
    const loginCardBgGradient  = appSettings.login_card_bg_gradient   || '';
    const loginAccent          = appSettings.login_accent_color       || '#2563EB';
    const loginTagline         = appSettings.login_tagline            || 'STUDIO & CINEMA PHOTOGRAPHY SYSTEM';
    const fontHeading          = appSettings.font_family_heading      || 'Plus Jakarta Sans';

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
                {/* Background photo */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/wedding-couple.jpg"
                        alt="Arams Couple"
                        className="w-full h-full object-cover opacity-50 filter brightness-75 contrast-110"
                    />
                    <div
                        style={{
                            background: `linear-gradient(to top, ${loginBg} 0%, ${loginBg}cc 55%, ${loginBg}99 100%)`,
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
                        <p className="text-[9px] tracking-[0.28em] text-rose-300 font-bold uppercase mt-0.5">
                            {appSettings.company_tagline || 'Photografer'}
                        </p>
                    </div>
                </div>

                {/* Center: Headline */}
                <div className="relative z-10 space-y-3">
                    <span className="text-[10px] tracking-[0.25em] font-extrabold text-rose-300 uppercase block">
                        {loginTagline}
                    </span>
                    <h1
                        style={{ fontFamily: `'${fontHeading}', serif` }}
                        className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight"
                    >
                        Abadikan Setiap<br />
                        Momen Berharga Anda
                    </h1>
                    <div
                        style={{ backgroundColor: `${loginAccent}80` }}
                        className="w-12 h-0.5 mt-2 mb-2"
                    />
                    <p className="text-xs text-rose-100/70 leading-relaxed max-w-xs">
                        Terima kasih telah mempercayakan momen spesial Anda kepada {companyName}.
                    </p>
                </div>

                {/* Bottom: 3 Pillars */}
                <div className="relative z-10 grid grid-cols-3 gap-3 pt-8 border-t border-white/10">
                    {[
                        { icon: Camera,     title: 'Kualitas Terbaik', desc: 'Peralatan profesional & editing berkualitas tinggi.' },
                        { icon: Shield,     title: '100% Aman',        desc: 'Data & file Anda aman bersama kami.' },
                        { icon: Headphones, title: 'Layanan Personal', desc: 'Kami mendengar & mewujudkan visi Anda.' },
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
                className={`flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 py-12 transition-colors ${
                    isDarkCard ? 'text-slate-100' : 'text-slate-800'
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
                            Welcome Back!
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
                                    placeholder="admin@arams.com"
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all placeholder:text-slate-400 ${
                                        isDarkCard
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
                                    className={`w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all placeholder:text-slate-400 ${
                                        isDarkCard
                                            ? 'bg-white/10 border border-white/20 text-white focus:bg-white/15 focus:border-white/40 focus:ring-2 focus:ring-white/10'
                                            : 'bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-400 text-slate-900 focus:ring-2 focus:ring-slate-200'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 transition-colors cursor-pointer ${
                                        isDarkCard ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                                    }`}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-[11px] font-bold text-rose-500">{errors.password}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={processing}
                            style={{
                                backgroundColor: loginAccent,
                                color: '#FFFFFF',
                                boxShadow: `0 4px 14px 0 ${loginAccent}60`,
                            }}
                            className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-95 hover:shadow-lg active:scale-[0.99]"
                        >
                            {processing ? (
                                <>
                                    <Spinner className="w-4 h-4 text-white" />
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
