import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <div className="w-full">
            <Head title="Lupa Kata Sandi - Arams Pictures" />

            {status && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold text-center animate-in fade-in">
                    {status}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label
                        htmlFor="email"
                        className="block text-xs font-semibold text-slate-300"
                    >
                        Alamat Email Terdaftar
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        <input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nama@arams.com"
                            autoComplete="email"
                            className="w-full pl-10 pr-4 py-2.5 bg-[#070E1A] border border-[#1E2D4A] focus:border-[#C89445] focus:ring-2 focus:ring-[#C89445]/20 text-white placeholder-slate-500 rounded-xl text-xs font-medium outline-hidden transition-all"
                        />
                    </div>
                    {errors.email && (
                        <p className="text-[11px] font-semibold text-rose-400 mt-1">
                            {errors.email}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-[#DFAC59] via-[#C89445] to-[#B27D2E] hover:brightness-110 active:scale-[0.99] text-[#070D18] font-bold text-xs shadow-lg shadow-[#C89445]/20 tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {processing ? (
                        <>
                            <Spinner className="w-4 h-4 text-[#070D18]" />
                            <span>Mengirim Link...</span>
                        </>
                    ) : (
                        <>
                            <span>Kirim Link Reset Sandi</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#1E2D4A] text-center">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C89445] hover:text-[#E2B774] transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Halaman Login</span>
                </Link>
            </div>
        </div>
    );
}

ForgotPassword.layout = {
    title: 'Lupa Kata Sandi',
    description: 'Masukkan email Anda untuk menerima link reset kata sandi',
};
