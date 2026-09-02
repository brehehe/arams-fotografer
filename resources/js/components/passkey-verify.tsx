import type { UrlMethodPair } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import { usePasskeyVerify } from '@laravel/passkeys/react';
import { KeyRound } from 'lucide-react';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    routes?: {
        options: UrlMethodPair;
        submit: UrlMethodPair;
    };
    label?: string;
    loadingLabel?: string;
    separator?: string;
};

export default function PasskeyVerify({
    routes,
    label,
    loadingLabel,
    separator,
}: Props = {}) {
    const { verify, isLoading, error, isSupported } = usePasskeyVerify({
        ...(routes && {
            routes: {
                options: routes.options.url,
                submit: routes.submit.url,
            },
        }),
        onSuccess: (response) => {
            router.visit(response.redirect ?? '/dashboard');
        },
    });

    if (!isSupported) {
        return null;
    }

    return (
        <div className="w-full">
            <div className="grid gap-2">
                <button
                    type="button"
                    onClick={verify}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 bg-[#070E1A] hover:bg-[#111C30] border border-[#1E2D4A] hover:border-[#C89445]/50 text-slate-200 text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <Spinner className="h-4 w-4 text-[#C89445]" />
                    ) : (
                        <KeyRound className="h-4 w-4 text-[#C89445]" />
                    )}
                    <span>
                        {isLoading
                            ? (loadingLabel ?? 'Memverifikasi...')
                            : (label ?? 'Masuk dengan Passkey')}
                    </span>
                </button>
                {error && (
                    <InputError message={error} className="text-center text-rose-400 text-xs mt-1" />
                )}
            </div>

            <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#1E2D4A]" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-[#0D1627] px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 select-none">
                        {separator ?? 'Atau gunakan email & password'}
                    </span>
                </div>
            </div>
        </div>
    );
}
