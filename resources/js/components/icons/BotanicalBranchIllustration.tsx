import type { SVGAttributes } from 'react';

export default function BotanicalBranchIllustration({
    className = 'w-full h-full',
    ...props
}: SVGAttributes<SVGElement>) {
    const id = props.id || 'botanical-branch';
    const leafGradId = `${id}-leaf-grad`;
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
                <linearGradient id={`${id}-leaf-grad-accent`} x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#DDD6FE" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#A5B4FC" stopOpacity="0.55" />
                </linearGradient>
            </defs>

            {/* ── AMBIENT FLOATING DOTS ── */}
            <circle cx="370" cy="115" r="4.5" fill={stemColor} fillOpacity="0.4" />
            <circle cx="395" cy="140" r="3.5" fill={stemColor} fillOpacity="0.5" />
            <circle cx="380" cy="165" r="2.5" fill={stemColor} fillOpacity="0.35" />

            {/* ── BERRY SPRIGS (RIGHT CLUSTER) ── */}
            <g stroke={stemColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {/* Right branchlet */}
                <path d="M255 240 C 275 235, 305 235, 325 245" />
                <path d="M295 238 C 300 220, 310 205, 320 195" />
                <path d="M310 215 C 322 215, 335 220, 345 228" />
                <path d="M280 240 C 285 255, 290 268, 298 275" />
            </g>
            {/* Berries on right cluster */}
            <circle cx="325" cy="245" r="5" fill={stemColor} fillOpacity="0.8" />
            <circle cx="320" cy="195" r="5" fill={stemColor} fillOpacity="0.8" />
            <circle cx="345" cy="228" r="4.5" fill={stemColor} fillOpacity="0.75" />
            <circle cx="298" cy="275" r="4.5" fill={stemColor} fillOpacity="0.75" />

            {/* ── BERRY SPRIGS (CENTER CLUSTER) ── */}
            <g stroke={stemColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M210 185 C 205 165, 200 145, 195 130" />
                <path d="M202 160 C 190 155, 180 152, 172 152" />
                <path d="M205 170 C 215 162, 225 158, 235 156" />
            </g>
            <circle cx="195" cy="130" r="5" fill={stemColor} fillOpacity="0.8" />
            <circle cx="172" cy="152" r="4.5" fill={stemColor} fillOpacity="0.75" />
            <circle cx="235" cy="156" r="4.5" fill={stemColor} fillOpacity="0.75" />

            {/* ── BERRY SPRIGS (LOWER LEFT) ── */}
            <g stroke={stemColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M165 248 C 150 252, 135 258, 125 268" />
                <path d="M145 254 C 142 265, 140 275, 138 285" />
            </g>
            <circle cx="125" cy="268" r="5" fill={stemColor} fillOpacity="0.8" />
            <circle cx="138" cy="285" r="4.5" fill={stemColor} fillOpacity="0.75" />

            {/* ── MAIN STEMS ── */}
            <path
                d="M345 305 C 310 295, 260 270, 215 220 C 180 180, 150 120, 145 70"
                stroke={stemColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
            />
            {/* Upper Right Branch */}
            <path
                d="M235 240 C 265 205, 295 165, 320 115"
                stroke={stemColor}
                strokeWidth={strokeWidth * 0.9}
                strokeLinecap="round"
            />
            {/* Lower Left Branch */}
            <path
                d="M210 225 C 160 230, 110 245, 65 278"
                stroke={stemColor}
                strokeWidth={strokeWidth * 0.9}
                strokeLinecap="round"
            />

            {/* ── LEAVES: TOPMOST VERTICAL CLUSTER ── */}
            {/* Top Leaf 1 */}
            <g>
                <path
                    d="M145 70 C 152 45, 168 25, 178 15 C 172 38, 162 60, 145 70 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M145 70 C 155 48, 165 30, 178 15" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Top Leaf 2 (Left) */}
            <g>
                <path
                    d="M145 85 C 122 75, 105 60, 95 45 C 115 52, 135 68, 145 85 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M145 85 C 128 72, 112 60, 95 45" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Top Leaf 3 (Right) */}
            <g>
                <path
                    d="M165 110 C 190 95, 215 88, 235 85 C 220 102, 195 112, 165 110 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M165 110 C 192 100, 215 92, 235 85" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>

            {/* ── LEAVES: UPPER RIGHT BRANCH CLUSTER ── */}
            {/* Upper Right Tip Leaf */}
            <g>
                <path
                    d="M320 115 C 338 95, 355 75, 365 58 C 355 82, 342 105, 320 115 Z"
                    fill={`url(#${id}-leaf-grad-accent)`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M320 115 C 338 95, 352 78, 365 58" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Upper Right Side Leaf 1 (Left side) */}
            <g>
                <path
                    d="M285 155 C 270 135, 260 115, 255 98 C 275 115, 285 138, 285 155 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M285 155 C 275 135, 265 118, 255 98" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Upper Right Side Leaf 2 (Right side) */}
            <g>
                <path
                    d="M305 140 C 330 132, 355 132, 375 135 C 352 148, 328 150, 305 140 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M305 140 C 330 135, 352 135, 375 135" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Upper Right Lower Leaf */}
            <g>
                <path
                    d="M270 190 C 295 185, 322 188, 345 198 C 322 208, 295 205, 270 190 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M270 190 C 298 190, 322 192, 345 198" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>

            {/* ── LEAVES: CENTER ARCHING CLUSTER ── */}
            {/* Center Leaf 1 (Left) */}
            <g>
                <path
                    d="M175 150 C 145 142, 120 130, 105 115 C 130 130, 158 142, 175 150 Z"
                    fill={`url(#${id}-leaf-grad-accent)`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M175 150 C 150 138, 128 128, 105 115" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Center Leaf 2 (Broad Left) */}
            <g>
                <path
                    d="M185 190 C 152 185, 122 175, 98 158 C 128 180, 160 192, 185 190 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M185 190 C 155 180, 128 170, 98 158" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Center Leaf 3 (Right) */}
            <g>
                <path
                    d="M205 195 C 228 185, 252 182, 272 185 C 252 198, 228 202, 205 195 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M205 195 C 230 190, 252 188, 272 185" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Center Leaf 4 (Lower Right) */}
            <g>
                <path
                    d="M230 230 C 255 225, 280 228, 302 238 C 278 245, 252 242, 230 230 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M230 230 C 258 230, 280 232, 302 238" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>

            {/* ── LEAVES: LOWER LEFT FAN CLUSTER ── */}
            {/* Lower Left Leaf 1 (Top of fan) */}
            <g>
                <path
                    d="M160 235 C 130 225, 95 212, 68 195 C 98 220, 132 235, 160 235 Z"
                    fill={`url(#${id}-leaf-grad-accent)`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M160 235 C 128 222, 98 210, 68 195" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Lower Left Leaf 2 (Mid outer) */}
            <g>
                <path
                    d="M125 255 C 92 250, 60 240, 32 225 C 65 248, 98 260, 125 255 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M125 255 C 95 248, 65 238, 32 225" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Lower Left Leaf 3 (Bottom Tip) */}
            <g>
                <path
                    d="M95 268 C 65 272, 38 270, 15 262 C 45 278, 75 278, 95 268 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M95 268 C 68 272, 42 270, 15 262" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Lower Left Leaf 4 (Under) */}
            <g>
                <path
                    d="M135 270 C 115 285, 92 295, 68 300 C 95 295, 118 285, 135 270 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M135 270 C 112 282, 90 292, 68 300" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
            {/* Lower Right Leaf (Under stem) */}
            <g>
                <path
                    d="M245 265 C 235 285, 218 302, 195 312 C 220 300, 238 282, 245 265 Z"
                    fill={`url(#${leafGradId})`}
                    stroke={stemColor}
                    strokeWidth={strokeWidth * 0.85}
                    strokeLinejoin="round"
                />
                <path d="M245 265 C 230 285, 215 300, 195 312" stroke={stemColor} strokeWidth="1.2" strokeLinecap="round" />
            </g>
        </svg>
    );
}
