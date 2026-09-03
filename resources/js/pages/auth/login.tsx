import React, { useState } from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import {
    Lock,
    Mail,
    Eye,
    EyeOff,
    ArrowRight,
    Camera,
    Shield,
    Headphones,
    Gift,
    Sparkles,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({ status, canResetPassword = true }: LoginProps) {
    const { props: pageProps } = usePage<any>();
    const appSettings = pageProps?.appSettings || {};

    const companyName = appSettings.company_name || 'Arams Pictures';
    const loginBg = appSettings.login_bg_color || '#2E0F15';
    const loginBgGradient = appSettings.login_bg_gradient || 'linear-gradient(180deg, #2E0F15 0%, #200A0E 100%)';
    const loginCardBg = appSettings.login_card_bg || '#380E13';
    const loginAccent = appSettings.login_accent_color || '#4A151B';
    const loginTagline = appSettings.login_tagline || 'Capture Your Moments';
    const fontHeading = appSettings.font_family_heading || 'Plus Jakarta Sans';

    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    const initials = companyName
        .split(' ')
        .filter(Boolean)
        .map((w: string) => w[0])
        .join('')
        .slice(0, 2)
        .toLowerCase() || 'ap';

    return (
        <div className="min-h-screen w-full bg-[#EFECE8] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-slate-800">
            <Head title={`Login - ${companyName}`} />
            <Toaster position="top-right" richColors />

            {/* 2-Column Split Container (Screenshot 4) */}
            <div className="w-full max-w-[1080px] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-200/80 min-h-[660px]">

                {/* ── LEFT COLUMN (Deep Wine / Dark Maroon with Romantic Couple) ── */}
                <div
                    style={{ background: loginBgGradient || loginBg }}
                    className="w-full lg:w-[500px] xl:w-[520px] p-8 sm:p-10 flex flex-col justify-between text-white shrink-0 relative overflow-hidden transition-colors"
                >
                    {/* Background Overlay Image */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/images/wedding-couple.jpg"
                            alt="Arams Pictures Couple"
                            className="w-full h-full object-cover opacity-35 filter brightness-75 contrast-125"
                        />
                        <div
                            style={{
                                background: `linear-gradient(to top, ${loginBg} 0%, ${loginBg}cc 60%, ${loginBg}e6 100%)`,
                            }}
                            className="absolute inset-0"
                        />
                    </div>

                    {/* Top Brand */}
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3.5">
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

                        {/* Heading & Subtitle */}
                        <div className="space-y-2 pt-4">
                            <span className="text-[10px] tracking-[0.25em] font-extrabold text-rose-300 uppercase block">
                                {loginTagline}
                            </span>
                            <h1
                                style={{ fontFamily: `'${fontHeading}', serif` }}
                                className="text-2xl sm:text-3xl font-serif font-black text-white tracking-tight leading-tight"
                            >
                                Abadikan Setiap <br />
                                Momen Berharga Anda
                            </h1>
                            <div
                                style={{ backgroundColor: `${loginAccent}80` }}
                                className="w-12 h-0.5 mt-2 mb-2"
                            />
                            <p className="text-xs text-rose-100/80 leading-relaxed max-w-sm">
                                Terima kasih telah mempercayakan momen spesial Anda kepada {companyName}.
                            </p>
                        </div>
                    </div>

                    {/* Bottom 3 Feature Pillars */}
                    <div className="relative z-10 grid grid-cols-3 gap-3 pt-8 border-t border-white/10 mt-8">
                        <div className="space-y-1.5 text-center sm:text-left">
                            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-rose-200 mx-auto sm:mx-0">
                                <Camera className="w-4 h-4" />
                            </div>
                            <h4 className="font-bold text-[11px] text-white">Kualitas Terbaik</h4>
                            <p className="text-[10px] text-rose-200/70 leading-snug">
                                Peralatan profesional &amp; editing berkualitas tinggi.
                            </p>
                        </div>

                        <div className="space-y-1.5 text-center sm:text-left">
                            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-rose-200 mx-auto sm:mx-0">
                                <Shield className="w-4 h-4" />
                            </div>
                            <h4 className="font-bold text-[11px] text-white">100% Aman</h4>
                            <p className="text-[10px] text-rose-200/70 leading-snug">
                                Data &amp; file Anda aman bersama kami.
                            </p>
                        </div>

                        <div className="space-y-1.5 text-center sm:text-left">
                            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-rose-200 mx-auto sm:mx-0">
                                <Headphones className="w-4 h-4" />
                            </div>
                            <h4 className="font-bold text-[11px] text-white">Layanan Personal</h4>
                            <p className="text-[10px] text-rose-200/70 leading-snug">
                                Kami mendengar &amp; mewujudkan visi Anda.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN (Crisp White Form Container) ──────────────── */}
                <div className="flex-1 p-8 sm:p-12 lg:p-14 flex flex-col justify-between bg-white">
                    <div className="max-w-md mx-auto w-full space-y-6">

                        {/* Title & Subtitle */}
                        <div className="space-y-1.5">
                            <h2
                                style={{
                                    color: loginCardBg,
                                    fontFamily: `'${fontHeading}', serif`,
                                }}
                                className="text-2xl sm:text-3xl font-serif font-black tracking-tight"
                            >
                                Welcome Back!
                            </h2>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Masuk untuk mengakses project dan momen spesial Anda bersama {companyName}.
                            </p>
                        </div>

                        {status && (
                            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold text-center">
                                {status}
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-800">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <input
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Masukkan email Anda"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 outline-hidden transition-all"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-[11px] font-bold text-rose-500 mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-800">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Masukkan password Anda"
                                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-xs font-semibold text-slate-900 outline-hidden transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-[11px] font-bold text-rose-500 mt-1">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Lupa Password Link */}
                            <div className="flex justify-end pt-0.5">
                                {canResetPassword && (
                                    <Link
                                        href="/forgot-password"
                                        style={{ color: loginAccent }}
                                        className="text-[11px] font-bold hover:underline"
                                    >
                                        Lupa password?
                                    </Link>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={processing}
                                style={{
                                    backgroundColor: loginAccent,
                                    color: '#FFFFFF',
                                }}
                                className="w-full py-3 rounded-xl font-bold text-xs tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90"
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
                        </form>

                        {/* Divider */}
                        <div className="relative flex items-center justify-center my-4">
                            <div className="border-t border-slate-200 w-full" />
                            <span className="bg-white px-3 text-[11px] text-slate-400 font-medium">atau</span>
                            <div className="border-t border-slate-200 w-full" />
                        </div>

                        {/* Google Sign In Button */}
                        <button
                            type="button"
                            onClick={() => toast.info('Integrasi Google OAuth tersedia pada mode produksi.')}
                            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
                        >
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                            <span>Masuk dengan Google</span>
                        </button>

                        {/* Belum Memiliki Akun Box */}
                        <div
                            style={{
                                backgroundColor: `${loginAccent}0d`,
                                borderColor: `${loginAccent}26`,
                            }}
                            className="border rounded-2xl p-4 flex items-start gap-3.5 mt-6"
                        >
                            <div
                                style={{
                                    backgroundColor: `${loginAccent}1a`,
                                    color: loginAccent,
                                }}
                                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                            >
                                <Gift className="w-4 h-4" />
                            </div>
                            <div className="text-xs">
                                <h4 className="font-bold text-slate-900">Belum memiliki akun?</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                    Hubungi admin {companyName} untuk mendapatkan akses ke portal ini.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
