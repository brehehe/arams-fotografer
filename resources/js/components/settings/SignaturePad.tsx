import {
    PenTool,
    RotateCcw,
    Trash2,
    Upload,
    Check,
    Sparkles,
    FileSignature,
    CheckCircle2,
    Info,
    RefreshCw,
} from 'lucide-react';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface Point {
    x: number;
    y: number;
}

interface Stroke {
    points: Point[];
    color: string;
    width: number;
}

interface SignaturePadProps {
    value?: string;
    directorName?: string;
    directorTitle?: string;
    onSave: (signatureDataUrl: string, file?: File | Blob) => void;
    onDelete?: () => void;
    isLoading?: boolean;
}

const PEN_COLORS = [
    { label: 'Hitam Tinta', value: '#0F172A', bgClass: 'bg-slate-900' },
    { label: 'Biru Navy', value: '#1E3A8A', bgClass: 'bg-blue-900' },
    { label: 'Biru Resmi', value: '#1D4ED8', bgClass: 'bg-blue-600' },
    { label: 'Maroon Luxury', value: '#3C0E0E', bgClass: 'bg-[#3C0E0E]' },
];

const PEN_WIDTHS = [
    { label: 'Halus', value: 1.8 },
    { label: 'Normal', value: 2.8 },
    { label: 'Tebal', value: 4.2 },
];

export const SignaturePad: React.FC<SignaturePadProps> = ({
    value,
    directorName = 'Aditya Pratama',
    directorTitle = 'Direktur Utama / Finance Studio',
    onSave,
    onDelete,
    isLoading = false,
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // State
    const [isDrawingMode, setIsDrawingMode] = useState<boolean>(!value);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
    const [penColor, setPenColor] = useState<string>('#0F172A');
    const [penWidth, setPenWidth] = useState<number>(2.8);

    // Redraw all strokes on canvas
    const redrawCanvas = useCallback(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
return;
}

        const ctx = canvas.getContext('2d');

        if (!ctx) {
return;
}

        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Combine committed strokes and current active stroke
        const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;

        allStrokes.forEach((stroke) => {
            if (stroke.points.length < 2) {
                if (stroke.points.length === 1) {
                    ctx.save();
                    ctx.fillStyle = stroke.color;
                    ctx.beginPath();
                    ctx.arc(stroke.points[0].x * dpr, stroke.points[0].y * dpr, (stroke.width * dpr) / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }

                return;
            }

            ctx.save();
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width * dpr;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();

            ctx.moveTo(stroke.points[0].x * dpr, stroke.points[0].y * dpr);

            for (let i = 1; i < stroke.points.length; i++) {
                const prev = stroke.points[i - 1];
                const curr = stroke.points[i];
                const midX = (prev.x + curr.x) / 2;
                const midY = (prev.y + curr.y) / 2;
                ctx.quadraticCurveTo(prev.x * dpr, prev.y * dpr, midX * dpr, midY * dpr);
            }

            const last = stroke.points[stroke.points.length - 1];
            ctx.lineTo(last.x * dpr, last.y * dpr);
            ctx.stroke();
            ctx.restore();
        });
    }, [strokes, currentStroke]);

    // Setup canvas DPI and size
    const setupCanvas = useCallback(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
return;
}

        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const width = Math.max(300, rect.width || 480);
        const height = 180;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        redrawCanvas();
    }, [redrawCanvas]);

    useEffect(() => {
        if (isDrawingMode) {
            setupCanvas();
            const handleResize = () => setupCanvas();
            window.addEventListener('resize', handleResize);

            return () => window.removeEventListener('resize', handleResize);
        }
    }, [isDrawingMode, setupCanvas]);

    useEffect(() => {
        if (isDrawingMode) {
            redrawCanvas();
        }
    }, [strokes, currentStroke, isDrawingMode, redrawCanvas]);

    // Pointer coordinates helper
    const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
        const canvas = canvasRef.current;

        if (!canvas) {
return { x: 0, y: 0 };
}

        const rect = canvas.getBoundingClientRect();

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    // Pointer event handlers (works for Mouse, Pen, and Touch)
    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        setIsDrawing(true);
        const point = getCanvasPoint(e);
        setCurrentStroke({
            points: [point],
            color: penColor,
            width: penWidth,
        });
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !currentStroke) {
return;
}

        e.preventDefault();
        const point = getCanvasPoint(e);
        setCurrentStroke((prev) => {
            if (!prev) {
return null;
}

            return {
                ...prev,
                points: [...prev.points, point],
            };
        });
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !currentStroke) {
return;
}

        e.preventDefault();
        setIsDrawing(false);

        if (currentStroke.points.length > 0) {
            setStrokes((prev) => [...prev, currentStroke]);
        }

        setCurrentStroke(null);
    };

    const handlePointerCancel = () => {
        setIsDrawing(false);
        setCurrentStroke(null);
    };

    // Undo last stroke
    const handleUndo = () => {
        if (strokes.length === 0) {
return;
}

        setStrokes((prev) => prev.slice(0, prev.length - 1));
    };

    // Clear canvas
    const handleClear = () => {
        setStrokes([]);
        setCurrentStroke(null);
        const canvas = canvasRef.current;

        if (canvas) {
            const ctx = canvas.getContext('2d');

            if (ctx) {
ctx.clearRect(0, 0, canvas.width, canvas.height);
}
        }
    };

    // Trim whitespace and save
    const handleSaveDrawing = () => {
        const canvas = canvasRef.current;

        if (!canvas) {
return;
}

        if (strokes.length === 0 && !currentStroke) {
            toast.error('Silakan buat tanda tangan terlebih dahulu pada bidang kanvas');

            return;
        }

        const ctx = canvas.getContext('2d');

        if (!ctx) {
return;
}

        // Auto-trim transparent pixels
        const dpr = window.devicePixelRatio || 1;
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data, width, height } = imgData;

        let minX = width;
        let minY = height;
        let maxX = 0;
        let maxY = 0;
        let hasPixels = false;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const alphaIndex = (y * width + x) * 4 + 3;

                if (data[alphaIndex] > 20) {
                    hasPixels = true;

                    if (x < minX) {
minX = x;
}

                    if (x > maxX) {
maxX = x;
}

                    if (y < minY) {
minY = y;
}

                    if (y > maxY) {
maxY = y;
}
                }
            }
        }

        if (!hasPixels) {
            toast.error('Tanda tangan belum terdeteksi. Silakan coba goreskan kembali.');

            return;
        }

        // Add padding around signature
        const padding = Math.round(16 * dpr);
        const cropX = Math.max(0, minX - padding);
        const cropY = Math.max(0, minY - padding);
        const cropW = Math.min(width - cropX, maxX - minX + padding * 2);
        const cropH = Math.min(height - cropY, maxY - minY + padding * 2);

        // Render to trimmed offscreen canvas
        const trimmedCanvas = document.createElement('canvas');
        trimmedCanvas.width = cropW;
        trimmedCanvas.height = cropH;
        const trimmedCtx = trimmedCanvas.getContext('2d');

        if (!trimmedCtx) {
            const fallbackUrl = canvas.toDataURL('image/png');
            onSave(fallbackUrl);
            setIsDrawingMode(false);

            return;
        }

        trimmedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        const trimmedDataUrl = trimmedCanvas.toDataURL('image/png');

        // Also convert to blob for FormData upload
        trimmedCanvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], 'signature.png', { type: 'image/png' });
                onSave(trimmedDataUrl, file);
            } else {
                onSave(trimmedDataUrl);
            }

            setIsDrawingMode(false);
        }, 'image/png');
    };

    // Upload signature file
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
return;
}

        if (file.size > 4 * 1024 * 1024) {
            toast.error('Ukuran file tanda tangan maksimal 4MB');

            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;

            if (dataUrl) {
                onSave(dataUrl, file);
                setIsDrawingMode(false);
                toast.success('File tanda tangan berhasil dimuat');
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-3">
            {/* Hidden file input for uploading scanned signatures */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
            />

            {/* If has existing signature and not in active drawing mode */}
            {value && !isDrawingMode ? (
                <div className="p-4 bg-white rounded-xl border border-purple-200/80 shadow-2xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-800">
                                    Tanda Tangan Digital Tersimpan
                                </span>
                                <span className="text-[10px] text-emerald-600 font-medium block">
                                    Aktif &amp; Otomatis Tampil pada Invoice
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsDrawingMode(true);
                                    setStrokes([]);
                                }}
                                className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1.5 border border-purple-200"
                            >
                                <PenTool className="w-3.5 h-3.5" />
                                <span>Ganti / Gambar Ulang</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                                title="Unggah file tanda tangan lain"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Unggah</span>
                            </button>

                            {onDelete && (
                                <button
                                    type="button"
                                    onClick={onDelete}
                                    className="px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                                    title="Hapus tanda tangan"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Hapus</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Realistic Document Signature Preview */}
                    <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                            <FileSignature className="w-3.5 h-3.5 text-purple-600" />
                            <span>Pratinjau Lembar Dokumen Invoice</span>
                        </div>

                        {/* Signature Image & Underline */}
                        <div className="w-64 flex flex-col items-center text-center">
                            <div className="h-16 flex items-center justify-center p-1">
                                <img
                                    src={value}
                                    alt="Tanda Tangan Resmi"
                                    className="max-h-14 max-w-full object-contain pointer-events-none select-none drop-shadow-2xs"
                                />
                            </div>

                            <div className="w-full border-t border-slate-700 pt-1 mt-0.5">
                                <p className="text-xs font-bold text-slate-900 leading-tight">
                                    {directorName}
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium">
                                    {directorTitle}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Active Signature Pad Drawing Container */
                <div className="p-4 bg-white rounded-xl border border-purple-200 shadow-2xs space-y-3">
                    {/* Header Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <PenTool className="w-4 h-4 text-purple-700" />
                            <span className="text-xs font-bold text-slate-800">
                                Kanvas Tanda Tangan Digital (Signature Pad)
                            </span>
                        </div>

                        {/* Pen Color & Width Quick Picker */}
                        <div className="flex items-center gap-3">
                            {/* Color Selector */}
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                                {PEN_COLORS.map((col) => (
                                    <button
                                        key={col.value}
                                        type="button"
                                        onClick={() => setPenColor(col.value)}
                                        title={col.label}
                                        className={`w-5 h-5 rounded-md ${col.bgClass} transition-transform ${
                                            penColor === col.value
                                                ? 'ring-2 ring-purple-600 ring-offset-1 scale-110'
                                                : 'opacity-70 hover:opacity-100'
                                        }`}
                                    />
                                ))}
                            </div>

                            {/* Stroke Width Selector */}
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                                {PEN_WIDTHS.map((pw) => (
                                    <button
                                        key={pw.value}
                                        type="button"
                                        onClick={() => setPenWidth(pw.value)}
                                        title={`Ketebalan: ${pw.label}`}
                                        className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all flex items-center justify-center ${
                                            penWidth === pw.value
                                                ? 'bg-white text-purple-700 shadow-2xs font-bold'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        {pw.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Canvas Drawing Surface */}
                    <div className="relative rounded-xl border-2 border-dashed border-purple-300/80 bg-slate-50/50 overflow-hidden select-none touch-none">
                        {/* Interactive Canvas */}
                        <canvas
                            ref={canvasRef}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerCancel}
                            style={{ touchAction: 'none' }}
                            className="w-full cursor-crosshair bg-transparent block"
                        />

                        {/* Baseline Guide Marker */}
                        <div className="absolute inset-x-8 bottom-7 border-b border-dashed border-purple-200/90 pointer-events-none flex items-center justify-between">
                            <span className="text-[9px] font-medium text-purple-400 select-none pb-0.5">
                                Goreskan tanda tangan di atas garis ini
                            </span>
                            <span className="text-[9px] font-medium text-purple-400 select-none pb-0.5">
                                [Tanda Tangan]
                            </span>
                        </div>

                        {/* Empty State Prompt */}
                        {strokes.length === 0 && !currentStroke && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center px-4">
                                    <Sparkles className="w-5 h-5 text-purple-300 mx-auto mb-1 animate-pulse" />
                                    <p className="text-xs font-semibold text-slate-400">
                                        Gunakan mouse, stylus, atau jari Anda untuk tanda tangan di sini
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        Mendukung layar sentuh handphone &amp; tablet secara presisi
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={handleUndo}
                                disabled={strokes.length === 0}
                                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none rounded-xl transition-all flex items-center justify-center gap-1.5"
                                title="Batalkan goresan terakhir (Undo)"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Undo</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleClear}
                                disabled={strokes.length === 0}
                                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none rounded-xl transition-all flex items-center justify-center gap-1.5"
                                title="Bersihkan kanvas"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Bersihkan</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all flex items-center justify-center gap-1.5"
                                title="Unggah file gambar tanda tangan jika sudah memiliki file scan/PNG transparan"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Unggah Gambar TTD</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            {value && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsDrawingMode(false);
                                        setStrokes([]);
                                    }}
                                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleSaveDrawing}
                                disabled={isLoading || (strokes.length === 0 && !currentStroke)}
                                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Terapkan Tanda Tangan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Helpful Tip */}
                    <div className="p-2.5 bg-purple-50/50 rounded-lg border border-purple-100 flex items-center gap-2 text-[11px] text-purple-800">
                        <Info className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>
                            Tanda tangan akan disimpan dengan latar belakang transparan berformat WebP berkualitas tinggi, dan langsung diposisikan di atas nama <strong>{directorName}</strong> pada semua invoice resmi.
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
