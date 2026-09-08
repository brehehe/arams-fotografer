import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx');
        const exact = `./pages/${name}.tsx`;
        if (pages[exact]) {
            return typeof pages[exact] === 'function' ? (pages[exact] as any)() : pages[exact];
        }
        const lowerExact = exact.toLowerCase().replace(/-/g, '');
        for (const path in pages) {
            if (path.toLowerCase().replace(/-/g, '') === lowerExact) {
                return typeof pages[path] === 'function' ? (pages[path] as any)() : pages[path];
            }
        }
        return resolvePageComponent(exact, pages);
    },
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
            case name === 'auth/login':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('Client/'):
                return null;
            case name.startsWith('Public/'):
                return null;
            case ['settings/profile', 'settings/security', 'settings/appearance'].includes(name):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    setup({ el, App, props }) {
        if (el) {
            const root = createRoot(el);
            root.render(
                <TooltipProvider delayDuration={0}>
                    <App {...props} />
                </TooltipProvider>
            );
        }
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
