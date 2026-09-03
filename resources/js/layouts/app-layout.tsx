import React from 'react';
import AramsLayout from '@/layouts/AramsLayout';

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
        <AramsLayout breadcrumbs={breadcrumbs} title={title}>
            {children}
        </AramsLayout>
    );
}
