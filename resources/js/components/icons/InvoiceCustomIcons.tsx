import React from 'react';

// ── 1. BANK BUILDING ICON (Transfer Bank / Bank Mandiri) ──
export function BankBuildingIcon({ className = 'w-6 h-6', color = '#3B46F1' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Roof Triangular Pediment */}
            <path d="M24 6L6 16H42L24 6Z" fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            {/* Top horizontal beam */}
            <line x1="8" y1="20" x2="40" y2="20" stroke={color} strokeWidth="3" strokeLinecap="round" />
            {/* 3 Pillars */}
            <line x1="13" y1="20" x2="13" y2="34" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <line x1="24" y1="20" x2="24" y2="34" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <line x1="35" y1="20" x2="35" y2="34" stroke={color} strokeWidth="3" strokeLinecap="round" />
            {/* Bottom step 1 */}
            <line x1="8" y1="34" x2="40" y2="34" stroke={color} strokeWidth="3" strokeLinecap="round" />
            {/* Bottom base step 2 */}
            <line x1="4" y1="40" x2="44" y2="40" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
        </svg>
    );
}

// ── 2. CREDIT CARD ICON (a.n. PT Arams Pictures) ──
export function CreditCardCustomIcon({ className = 'w-6 h-6', color = '#3B46F1' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <rect x="5" y="10" width="38" height="28" rx="5" stroke={color} strokeWidth="3" strokeLinejoin="round" />
            <line x1="5" y1="18" x2="43" y2="18" stroke={color} strokeWidth="3" />
            <line x1="11" y1="28" x2="18" y2="28" stroke={color} strokeWidth="3" strokeLinecap="round" />
            <line x1="11" y1="33" x2="26" y2="33" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}

// ── 3. RED CALENDAR REMINDER ICON (Pengingat Jatuh Tempo) ──
export function CalendarReminderIcon({ className = 'w-6 h-6', color = '#EF4444' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Main Rounded Box */}
            <rect x="6" y="11" width="36" height="32" rx="7" stroke={color} strokeWidth="3.2" strokeLinejoin="round" />
            {/* 2 Top Binder Rings */}
            <line x1="14" y1="5" x2="14" y2="13" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="34" y1="5" x2="34" y2="13" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
            {/* Header Division Line */}
            <line x1="6" y1="20" x2="42" y2="20" stroke={color} strokeWidth="2.5" />
            {/* Calendar Grid Rectangles/Dots */}
            {/* Row 1 */}
            <rect x="12" y="25" width="4.5" height="4.5" rx="1.5" fill={color} />
            <rect x="21.75" y="25" width="4.5" height="4.5" rx="1.5" fill={color} />
            <rect x="31.5" y="25" width="4.5" height="4.5" rx="1.5" fill={color} />
            {/* Row 2 */}
            <rect x="12" y="33" width="4.5" height="4.5" rx="1.5" fill={color} />
            <rect x="21.75" y="33" width="4.5" height="4.5" rx="1.5" fill={color} />
            <rect x="31.5" y="33" width="4.5" height="4.5" rx="1.5" fill={color} />
        </svg>
    );
}

// ── 4. CLIPBOARD SECURITY SHIELD ICON (Informasi Keamanan) ──
export function ClipboardShieldIcon({ className = 'w-6 h-6', color = '#4F46E5' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <defs>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#3730A3" />
                </linearGradient>
            </defs>
            {/* Clipboard Frame */}
            <rect x="9" y="9" width="30" height="34" rx="6" stroke={color} strokeWidth="2.8" strokeLinejoin="round" />
            {/* Top Clip Tab */}
            <path d="M18 9V6C18 4.89543 18.8954 4 20 4H28C29.1046 4 30 4.89543 30 6V9" stroke={color} strokeWidth="2.8" strokeLinecap="round" />
            {/* Bottom Loop / hanging peg */}
            <circle cx="24" cy="43" r="2" fill={color} />
            {/* Inner Shield Badge */}
            <path
                d="M24 16C24 16 17 18 17 23.5C17 29.5 24 33 24 33C24 33 31 29.5 31 23.5C31 18 24 16 24 16Z"
                stroke={color}
                strokeWidth="2.2"
                fill="none"
                strokeLinejoin="round"
            />
            {/* Inner Checkmark inside shield */}
            <path d="M21 24.5L23 26.5L27 22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// ── 5. WHATSAPP OUTLINE ICON ──
export function WhatsAppCustomIcon({ className = 'w-6 h-6', color = '#3B46F1' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path
                d="M24 6C14.0589 6 6 14.0589 6 24C6 27.5256 7.0142 30.8122 8.76678 33.6006L6 42L14.7735 39.314C17.4339 40.9782 20.6015 41.95 24 41.95C33.9411 41.95 42 33.8911 42 23.95C42 14.0089 33.9411 6 24 6Z"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Phone Handset shape inside */}
            <path
                d="M17 17C16.5 18 16 20.5 18 23.5C20 26.5 22.5 29 26 30.5C28.5 31.5 30.5 31 31.5 30C32.5 29 33.5 27.5 32 26C30.5 24.5 29 25 28 26C27 27 25.5 25.5 24 24C22.5 22.5 21 21 22 20C23 19 23.5 17.5 22 16C20.5 14.5 19 15.5 17 17Z"
                fill={color}
            />
        </svg>
    );
}

// ── 6. EMAIL OUTLINE ICON ──
export function EmailCustomIcon({ className = 'w-6 h-6', color = '#3B46F1' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <rect x="6" y="10" width="36" height="28" rx="5" stroke={color} strokeWidth="3" strokeLinejoin="round" />
            <path d="M8 12L24 25L40 12" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// ── 7. RIBBON AWARD MEDAL ICON (Profesional & Terpercaya) ──
export function RibbonAwardCustomIcon({ className = 'w-6 h-6', color = '#3B46F1' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Rosette Scalloped Circle */}
            <circle cx="24" cy="18" r="11" stroke={color} strokeWidth="3" />
            <circle cx="24" cy="18" r="6" stroke={color} strokeWidth="2" strokeDasharray="2 2" />
            <circle cx="24" cy="18" r="2" fill={color} />
            {/* Ribbon Tails */}
            <path d="M18 27L14 42L22 37L25 42L25 28" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M30 27L34 42L26 37L23 42L23 28" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// ── 8. ROSETTE APERTURE SEAL ICON (Kualitas Terbaik Untuk Setiap Momen) ──
export function RosetteApertureIcon({ className = 'w-6 h-6', color = '#3B46F1' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* 8-Petal/gear scalloped outline */}
            <path
                d="M24 7C26.5 7 28.5 8.8 29.5 11C31.5 11.5 33.5 12.8 34.5 14.8C36.5 15.8 37.8 17.8 38 20.2C39.5 21.8 40 24 39.5 26.2C40 28.5 39 30.8 37.5 32.5C36.5 34.5 34.5 35.8 32.5 36.2C31 38 29 39 26.8 39.5C24.8 40 22.8 39.5 21 38.5C19 39 17 38 15.5 36.5C13.5 35.5 12.2 33.5 11.8 31.2C10.5 29.8 10 27.5 10.5 25.5C10 23.2 11 21 12.5 19.5C13.5 17.5 15.5 16.2 17.5 15.8C19 14 21 13 23.2 12.5C23.8 9.5 24 7 24 7Z"
                stroke={color}
                strokeWidth="2.8"
                strokeLinejoin="round"
            />
            <circle cx="24.5" cy="24.5" r="7.5" stroke={color} strokeWidth="2.8" />
            <circle cx="24.5" cy="24.5" r="2.5" fill={color} />
        </svg>
    );
}

// ── 9. HEART OUTLINE ICON (Layanan Sepenuh Hati) ──
export function HeartOutlineCustomIcon({ className = 'w-6 h-6', color = '#3B46F1' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path
                d="M24 40C24 40 7 29.5 7 17.5C7 11.5 11.5 7 17.5 7C21 7 23.2 9 24 10.5C24.8 9 27 7 30.5 7C36.5 7 41 11.5 41 17.5C41 29.5 24 40 24 40Z"
                stroke={color}
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// ── 10. GLOBE WIREFRAME ICON ──
export function GlobeWireframeIcon({ className = 'w-4 h-4', color = '#3B46F1' }: { className?: string; color?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
            <line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="1.8" />
            <ellipse cx="12" cy="12" rx="4.5" ry="9" stroke={color} strokeWidth="1.8" />
        </svg>
    );
}
