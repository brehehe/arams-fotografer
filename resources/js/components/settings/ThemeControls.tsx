import React from 'react';
import { Check } from 'lucide-react';

export interface ColorStop {
    id: string;
    color: string;
    position: number;
}

export interface GradientBuilderProps {
    value: string;
    onChange: (css: string) => void;
    presets?: Array<{ label: string; value: string }>;
    label?: string;
}

export function GradientBuilder({ value, onChange, presets = [], label = 'Gradient (Opsional)' }: GradientBuilderProps) {
    const parseGradient = (css: string): { angle: number; stops: ColorStop[] } => {
        const angleMatch = css.match(/linear-gradient\((\d+)deg/);
        const angle = angleMatch ? parseInt(angleMatch[1]) : 145;
        const stopMatches = [...css.matchAll(/(#[0-9a-fA-F]{3,8})\s+(\d+(?:\.\d+)?)%/g)];
        const stops: ColorStop[] = stopMatches.length >= 2
            ? stopMatches.map((m, i) => ({ id: String(i), color: m[1], position: parseFloat(m[2]) }))
            : [{ id: '0', color: '#2D1B69', position: 0 }, { id: '1', color: '#1A0F3F', position: 100 }];
        return { angle, stops };
    };

    const buildCSS = (a: number, s: ColorStop[]) => {
        const sorted = [...s].sort((x, y) => x.position - y.position);
        return `linear-gradient(${a}deg, ${sorted.map(st => `${st.color} ${st.position}%`).join(', ')})`;
    };

    const parsed = parseGradient(value);
    const [angle, setAngle] = React.useState(parsed.angle);
    const [stops, setStops] = React.useState<ColorStop[]>(parsed.stops);

    const update = (newAngle: number, newStops: ColorStop[]) => {
        setAngle(newAngle);
        setStops(newStops);
        onChange(buildCSS(newAngle, newStops));
    };

    const updateStop = (id: string, field: 'color' | 'position', val: string | number) =>
        update(angle, stops.map(s => s.id === id ? { ...s, [field]: val } : s));

    const addStop = () => {
        const sorted = [...stops].sort((a, b) => a.position - b.position);
        const midPos = sorted.length >= 2 ? Math.round((sorted[0].position + sorted[sorted.length - 1].position) / 2) : 50;
        update(angle, [...stops, { id: String(Date.now()), color: '#7C3AED', position: midPos }]);
    };

    const removeStop = (id: string) => {
        if (stops.length <= 2) return;
        update(angle, stops.filter(s => s.id !== id));
    };

    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const previewCSS = buildCSS(angle, stops);

    return (
        <div className="space-y-3 pt-3 border-t border-dashed border-slate-200">
            <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 shadow-xs" />
                    {label}
                </label>
                {value && (
                    <button type="button" onClick={() => onChange('')} className="text-[10px] text-red-500 hover:text-red-700 font-medium cursor-pointer">
                        ✕ Hapus Gradient
                    </button>
                )}
            </div>

            <div className="space-y-2 bg-slate-50/80 border border-slate-200 rounded-xl p-3">
                <div className="w-full h-10 rounded-lg border border-slate-200 shadow-2xs" style={{ background: previewCSS }} />
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-slate-500 whitespace-nowrap font-medium">Sudut:</span>
                    <input type="range" min="0" max="360" value={angle}
                        onChange={(e) => update(parseInt(e.target.value), stops)}
                        className="flex-1 h-1.5 accent-[#C98922] cursor-pointer" />
                    <input type="number" min="0" max="360" value={angle}
                        onChange={(e) => update(parseInt(e.target.value) || 0, stops)}
                        className="w-12 px-1.5 py-0.5 border border-slate-300 rounded text-[9px] font-mono text-center text-slate-700 bg-white" />
                    <span className="text-[9px] text-slate-500">°</span>
                </div>
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-semibold">Titik Warna ({stops.length} stop):</span>
                    <button type="button" onClick={addStop}
                        className="text-[10px] text-[#C98922] hover:text-[#9E6D24] font-bold cursor-pointer px-2 py-0.5 rounded border border-[#C98922]/30 hover:bg-[#C98922]/5 transition-colors">
                        + Tambah Stop
                    </button>
                </div>
                {sortedStops.map((stop) => (
                    <div key={stop.id} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-2">
                        <input type="color" value={stop.color}
                            onChange={(e) => updateStop(stop.id, 'color', e.target.value)}
                            className="w-8 h-7 rounded border border-slate-300 p-0.5 cursor-pointer bg-white shrink-0" />
                        <input type="text" value={stop.color}
                            onChange={(e) => updateStop(stop.id, 'color', e.target.value)}
                            className="w-16 shrink-0 text-[9px] font-mono text-slate-700 border border-slate-200 rounded px-1 py-0.5 bg-slate-50" />
                        <input type="range" min="0" max="100" value={stop.position}
                            onChange={(e) => updateStop(stop.id, 'position', parseInt(e.target.value))}
                            className="flex-1 h-1.5 accent-[#C98922] cursor-pointer" />
                        <input type="number" min="0" max="100" value={stop.position}
                            onChange={(e) => updateStop(stop.id, 'position', parseInt(e.target.value) || 0)}
                            className="w-10 shrink-0 text-[9px] font-mono text-center text-slate-700 border border-slate-200 rounded px-1 py-0.5 bg-slate-50" />
                        <span className="text-[9px] text-slate-400 shrink-0">%</span>
                        <button type="button" onClick={() => removeStop(stop.id)}
                            disabled={stops.length <= 2}
                            className={`shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs font-bold transition-colors ${
                                stops.length <= 2 ? 'text-slate-300 cursor-not-allowed' : 'text-red-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                            }`}>
                            ×
                        </button>
                    </div>
                ))}
            </div>

            {presets.length > 0 && (
                <div className="grid grid-cols-3 gap-1.5">
                    {presets.map((p) => (
                        <button key={p.value} type="button"
                            onClick={() => {
                                onChange(p.value);
                                const p2 = parseGradient(p.value);
                                setAngle(p2.angle);
                                setStops(p2.stops);
                            }}
                            className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                                value === p.value ? 'border-[#C98922] ring-1 ring-[#C98922] bg-[#C98922]/5' : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}>
                            <span className="w-6 h-6 rounded-md shrink-0 border border-white/10 shadow-2xs" style={{ background: p.value }} />
                            <span className="text-[10px] font-medium text-slate-700 leading-tight truncate">{p.label}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2">
                <div className="flex-1">
                    <label className="block text-[9px] text-slate-400 mb-0.5 font-medium">CSS Gradient (edit manual / multi-stop):</label>
                    <input type="text"
                        placeholder="e.g. linear-gradient(145deg, #2D1B69 0%, #7C3AED 50%, #1A0F3F 100%)"
                        value={value}
                        onChange={(e) => {
                            onChange(e.target.value);
                            const p2 = parseGradient(e.target.value);
                            setAngle(p2.angle);
                            setStops(p2.stops);
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[10px] font-mono text-slate-800 focus:ring-1 focus:ring-[#C98922]/50 focus:border-[#C98922] bg-white" />
                </div>
                {value && <div className="mt-4 w-9 h-7 rounded-md border border-slate-300 shrink-0 shadow-2xs" style={{ background: value }} />}
            </div>
        </div>
    );
}

export interface ColorSettingRowProps {
    label: string;
    description?: string;
    value: string;
    onChange: (color: string) => void;
    presets?: Array<{ hex: string; label?: string }>;
}

export function ColorSettingRow({
    label,
    description,
    value,
    onChange,
    presets = [],
}: ColorSettingRowProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-3 border-b border-slate-100 last:border-0">
            <div className="space-y-0.5 max-w-sm">
                <span className="text-xs font-bold text-slate-800 block leading-tight">
                    {label}
                </span>
                {description && (
                    <span className="text-[11px] text-slate-400 block leading-tight">
                        {description}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
                {presets.length > 0 && (
                    <div className="flex items-center gap-1">
                        {presets.map((p) => {
                            const isSelected = (value || '').toUpperCase() === p.hex.toUpperCase();
                            const isLight = ['#FFFFFF', '#F8FAFC', '#F8F6F5', '#FDFBF7', '#CBD5E1', '#E2E8F0', '#F1F5F9', '#EDEAE8'].includes(p.hex.toUpperCase());
                            return (
                                <button
                                    key={p.hex}
                                    type="button"
                                    onClick={() => onChange(p.hex)}
                                    title={p.label ? `${p.label} (${p.hex})` : p.hex}
                                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                                        isSelected
                                            ? 'ring-2 ring-indigo-500 ring-offset-1 scale-110 border-white z-10'
                                            : 'border-slate-200/80 hover:scale-105'
                                    }`}
                                    style={{ backgroundColor: p.hex }}
                                >
                                    {isSelected && (
                                        <Check className={`w-3 h-3 ${isLight ? 'text-slate-900' : 'text-white'}`} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100/80 transition-colors p-1 rounded-xl border border-slate-200">
                    <div className="relative w-6 h-6 rounded-lg overflow-hidden border border-slate-300/80 shadow-2xs shrink-0 cursor-pointer">
                        <input
                            type="color"
                            value={value && value.startsWith('#') && value.length === 7 ? value : '#000000'}
                            onChange={(e) => onChange(e.target.value)}
                            className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer border-0 p-0"
                        />
                    </div>
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="#HEX"
                        className="w-20 px-1 py-0.5 text-[11px] font-mono font-bold text-slate-800 bg-transparent border-0 focus:outline-hidden"
                    />
                </div>
            </div>
        </div>
    );
}
