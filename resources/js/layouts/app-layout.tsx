import React from 'react';
import LensariaLayout from '@/layouts/LensariaLayout';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: Array<{ label: string; href?: string }>;
    title?: string;
}

export default function AppLayout({
    children,
    breadcrumbs,
    title,
}: AppLayoutProps) {
    return (
        <LensariaLayout breadcrumbs={breadcrumbs} title={title}>
            {children}
        </LensariaLayout>
    );
}
