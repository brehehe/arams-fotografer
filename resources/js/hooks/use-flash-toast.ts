import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

// Module-level deduplication tracker across all component lifecycles
let lastToastPayload = '';
let lastToastTimestamp = 0;

export function useFlashToast(): void {
    const { props } = usePage<any>();
    const flash = props?.flash;

    useEffect(() => {
        if (!flash) return;

        // Check if there is any active message
        const hasMessage = Boolean(
            flash.success ||
            flash.error ||
            flash.warning ||
            flash.info ||
            flash.message ||
            flash.toast
        );

        if (!hasMessage) return;

        const payload = JSON.stringify(flash);
        const now = Date.now();

        // Prevent duplicate trigger within 1.5 seconds
        if (payload === lastToastPayload && now - lastToastTimestamp < 1500) {
            return;
        }

        if (flash.success) {
            toast.success(flash.success);
        } else if (flash.error) {
            toast.error(flash.error);
        } else if (flash.warning) {
            toast.warning(flash.warning);
        } else if (flash.info) {
            toast.info(flash.info);
        } else if (flash.message) {
            toast.info(flash.message);
        } else if (flash.toast) {
            const toastType = flash.toast.type || 'info';
            const message = flash.toast.message || flash.toast;
            if (typeof toast[toastType as keyof typeof toast] === 'function') {
                (toast[toastType as keyof typeof toast] as any)(message);
            } else {
                toast.info(message);
            }
        }

        lastToastPayload = payload;
        lastToastTimestamp = now;
    }, [flash]);
}
