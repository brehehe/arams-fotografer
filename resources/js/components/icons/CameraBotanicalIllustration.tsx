import type { SVGAttributes } from 'react';

export default function CameraBotanicalIllustration({
    className = 'w-full h-full',
    ...props
}: SVGAttributes<SVGElement>) {
    const id = props.id || 'camera-botanical';
    const leafGradId = `${id}-leaf-grad`;
    const leafGradAccentId = `${id}-leaf-grad-accent`;
    const lensGradId = `${id}-lens-grad`;
    const bodyGradId = `${id}-body-grad`;
    const stemColor = '#6366F1';
    const strokeWidth = 2.2;

    return (
        <svg
            viewBox="0 0 460 360"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            <defs>
                <linearGradient id={leafGradId} x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                    <stop offset="40%" stopColor="#E0E7FF" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#C7D2FE" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id={leafGradAccentId} x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#DDD6FE" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#A5B4FC" stopOpacity="0.55" />
                </linearGradient>
                <radialGradient id={lensGradId} cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.9" />
                    <stop offset="45%" stopColor="#A5B4FC" stopOpacity="0.8" />
                    <stop offset="80%" stopColor="#818CF8" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0.95" />
                </radialGradient>
                <linearGradient id={bodyGradId} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#F5F7FF" stopOpacity="0.85" />
                </linearGradient>
            </defs>

            {/* ── BASE GROUND SHADOW ── */}
            <ellipse cx="240" cy="304" rx="145" ry="7.5" fill="#C7D2FE" fillOpacity="0.45" />

            {/* ── TOP AMBIENT DOTS ── */}
            <circle cx="338" cy="112" r="4.5" fill={stemColor} fillOpacity="0.4" />
            <circle cx="355" cy="128" r="3.5" fill={stemColor} fillOpacity="0.45" />
            <circle cx="100" cy="180" r="3" fill={stemColor} fillOpacity="0.35" />

            {/* ── BACKGROUND FOLIAGE: RIGHT UPPER BRANCH ── */}
            {/* Upper Right Stem */}
            <path
                d="M330 180 C 345 145, 362 105, 388 65"
                stroke={stemColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
            />
            {/* Upper Right Tip Leaf */}
            <g>
                <path
                    d="M388 65 C 398 45, 412 30, 420 20 C 412 42, 402 60, 388 65 Z"
                    fill={`url(#${leafGradAccentId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M388 65 C 400 48, 412 32, 420 20" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Upper Right Leaf 1 (Left of stem) */}
            <g>
                <path
                    d="M358 120 C 342 100, 335 80, 332 62 C 350 80, 358 102, 358 120 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M358 120 C 348 100, 340 82, 332 62" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Upper Right Leaf 2 (Right of stem) */}
            <g>
                <path
                    d="M375 105 C 398 95, 418 92, 435 92 C 418 108, 398 112, 375 105 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M375 105 C 398 98, 418 96, 435 92" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Upper Right Berries Sprig */}
            <g stroke={stemColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M368 125 C 382 118, 395 110, 405 98" />
                <path d="M385 115 C 395 125, 408 132, 418 135" />
                <path d="M398 105 C 410 102, 420 105, 428 110" />
            </g>
            <circle cx="405" cy="98" r="4.5" fill={stemColor} fillOpacity="0.8" />
            <circle cx="418" cy="135" r="4.5" fill={stemColor} fillOpacity="0.8" />
            <circle cx="428" cy="110" r="4" fill={stemColor} fillOpacity="0.75" />

            {/* ── BACKGROUND FOLIAGE: RIGHT LOWER CLUSTER ── */}
            <path
                d="M335 240 C 360 240, 390 250, 420 270"
                stroke={stemColor}
                strokeWidth={strokeWidth * 0.85}
                strokeLinecap="round"
            />
            {/* Right Side Mid Leaf */}
            <g>
                <path
                    d="M340 215 C 368 205, 395 205, 418 210 C 395 228, 368 230, 340 215 Z"
                    fill={`url(#${leafGradAccentId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M340 215 C 370 210, 395 210, 418 210" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Right Lower Leaf */}
            <g>
                <path
                    d="M360 252 C 388 248, 415 252, 438 265 C 412 278, 385 272, 360 252 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M360 252 C 390 252, 415 258, 438 265" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Right Bottom Berry Sprig */}
            <g stroke={stemColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M380 250 C 398 242, 415 238, 428 238" />
                <path d="M405 242 C 415 250, 425 255, 435 256" />
            </g>
            <circle cx="428" cy="238" r="4" fill={stemColor} fillOpacity="0.8" />
            <circle cx="435" cy="256" r="3.5" fill={stemColor} fillOpacity="0.75" />
            {/* Right Bottom Leaf under */}
            <g>
                <path
                    d="M375 285 C 395 292, 415 292, 430 288 C 415 298, 395 298, 375 285 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
            </g>

            {/* ── BACKGROUND FOLIAGE: LEFT CLUSTER ── */}
            <path
                d="M160 260 C 130 250, 100 230, 75 190"
                stroke={stemColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
            />
            {/* Left Top Leaf */}
            <g>
                <path
                    d="M135 200 C 115 178, 98 155, 88 135 C 108 155, 125 180, 135 200 Z"
                    fill={`url(#${leafGradAccentId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M135 200 C 118 178, 102 158, 88 135" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Left Upper-Mid Leaf */}
            <g>
                <path
                    d="M110 220 C 85 205, 62 192, 48 178 C 72 198, 98 212, 110 220 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M110 220 C 88 205, 68 192, 48 178" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Left Mid Leaf */}
            <g>
                <path
                    d="M125 250 C 95 242, 68 232, 45 218 C 75 242, 105 252, 125 250 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M125 250 C 95 240, 70 230, 45 218" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Left Lower Leaf */}
            <g>
                <path
                    d="M142 272 C 118 275, 92 272, 68 265 C 95 282, 122 282, 142 272 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M142 272 C 118 275, 92 272, 68 265" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Left Berries Sprig */}
            <g stroke={stemColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M105 235 C 92 225, 80 215, 72 200" />
                <path d="M90 226 C 80 230, 70 235, 62 240" />
                <path d="M96 218 C 88 212, 82 208, 76 205" />
            </g>
            <circle cx="72" cy="200" r="4.5" fill={stemColor} fillOpacity="0.8" />
            <circle cx="62" cy="240" r="4" fill={stemColor} fillOpacity="0.75" />
            <circle cx="76" cy="205" r="3.5" fill={stemColor} fillOpacity="0.7" />

            {/* ── CAMERA MAIN BODY STRUCTURE ── */}
            {/* Pentaprism / Viewfinder bump (Top) */}
            <path
                d="M 198 152 L 208 124 C 210 120, 214 118, 218 118 L 262 118 C 266 118, 270 120, 272 124 L 282 152 Z"
                fill={`url(#${bodyGradId})`}
                stroke={stemColor}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
            />
            {/* Pentaprism Front Accent */}
            <path
                d="M 215 125 L 265 125"
                stroke={stemColor}
                strokeWidth="1.5"
                strokeLinecap="round"
            />

            {/* Top Left Dials */}
            {/* Shutter Speed Dial (Knurled) */}
            <rect
                x="156"
                y="140"
                width="28"
                height="12"
                rx="2"
                fill={`url(#${bodyGradId})`}
                stroke={stemColor}
                strokeWidth={strokeWidth}
            />
            {/* Vertical Knurling Lines on Dial */}
            <line x1="162" y1="141" x2="162" y2="151" stroke={stemColor} strokeWidth="1.2" />
            <line x1="167" y1="141" x2="167" y2="151" stroke={stemColor} strokeWidth="1.2" />
            <line x1="172" y1="141" x2="172" y2="151" stroke={stemColor} strokeWidth="1.2" />
            <line x1="177" y1="141" x2="177" y2="151" stroke={stemColor} strokeWidth="1.2" />

            {/* Shutter Release Button / Top Knob */}
            <rect
                x="170"
                y="130"
                width="16"
                height="10"
                rx="3"
                fill={`url(#${bodyGradId})`}
                stroke={stemColor}
                strokeWidth={strokeWidth}
            />

            {/* Main Camera Body Rounded Box */}
            <rect
                x="142"
                y="152"
                width="196"
                height="116"
                rx="10"
                fill={`url(#${bodyGradId})`}
                stroke={stemColor}
                strokeWidth={strokeWidth}
            />

            {/* Inset Body Accent Line */}
            <rect
                x="149"
                y="159"
                width="182"
                height="102"
                rx="7"
                stroke={stemColor}
                strokeWidth="1.2"
                strokeOpacity="0.6"
            />

            {/* Top Section Division Line */}
            <line x1="142" y1="176" x2="338" y2="176" stroke={stemColor} strokeWidth="1.5" strokeOpacity="0.8" />
            {/* Bottom Base Division Line */}
            <line x1="142" y1="256" x2="338" y2="256" stroke={stemColor} strokeWidth="1.5" strokeOpacity="0.8" />

            {/* Viewfinder Window (Front Top-Left) */}
            <rect
                x="156"
                y="185"
                width="20"
                height="12"
                rx="5"
                fill="#FFFFFF"
                stroke={stemColor}
                strokeWidth="1.8"
            />
            <circle cx="166" cy="191" r="3.5" stroke={stemColor} strokeWidth="1.5" fill={stemColor} fillOpacity="0.25" />

            {/* Red Dot / Sensor Port (Front Top-Right) */}
            <circle cx="316" cy="191" r="5.5" fill="#FFFFFF" stroke={stemColor} strokeWidth="1.8" />
            <circle cx="316" cy="191" r="3" fill={stemColor} fillOpacity="0.8" />

            {/* ── LENS ASSEMBLY (CENTER) ── */}
            {/* Outer Lens Bezel Ring */}
            <circle
                cx="240"
                cy="214"
                r="64"
                fill="#FFFFFF"
                stroke={stemColor}
                strokeWidth={strokeWidth}
            />
            {/* Second Stepped Barrel Ring */}
            <circle
                cx="240"
                cy="214"
                r="54"
                fill={`url(#${bodyGradId})`}
                stroke={stemColor}
                strokeWidth="1.8"
            />
            {/* Third Concentric Collar */}
            <circle
                cx="240"
                cy="214"
                r="44"
                stroke={stemColor}
                strokeWidth="1.5"
                strokeOpacity="0.7"
            />

            {/* Innermost Glass Element */}
            <circle
                cx="240"
                cy="214"
                r="36"
                fill={`url(#${lensGradId})`}
                stroke={stemColor}
                strokeWidth={strokeWidth}
            />

            {/* Glass Specular Reflection Highlights */}
            {/* Big Reflection Circle (Offset top-left) */}
            <circle
                cx="228"
                cy="202"
                r="11"
                fill="#FFFFFF"
                fillOpacity="0.85"
            />
            {/* Small Reflection Glint Dot (Offset bottom-right) */}
            <circle
                cx="254"
                cy="226"
                r="3.5"
                fill="#FFFFFF"
                fillOpacity="0.65"
            />

            {/* Foreground Leaf Accents on Lower Left & Right of Camera Base */}
            {/* Overlapping Leaf on Left Base */}
            <g>
                <path
                    d="M150 252 C 135 240, 118 235, 105 235 C 122 250, 138 260, 150 252 Z"
                    fill={`url(#${leafGradAccentId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
            </g>
            {/* Overlapping Leaf on Right Base */}
            <g>
                <path
                    d="M330 255 C 348 248, 365 248, 380 252 C 362 262, 345 262, 330 255 Z"
                    fill={`url(#${leafGradAccentId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
            </g>
        </svg>
    );
}
