import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useRef, useEffect, useMemo } from 'react';

export interface DateRange {
    startDate: Date;
    endDate: Date;
    label?: string;
}

export interface DateRangePickerProps {
    value?: DateRange;
    defaultValue?: DateRange;
    onChange?: (range: DateRange) => void;
    placeholder?: string;
    align?: 'left' | 'right';
    className?: string;
    buttonClassName?: string;
    primaryColor?: string;
}

const ID_MONTHS_FULL = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Normalize date to 00:00:00 without timezone shift
function normalizeDate(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function isSameDay(a: Date | null, b: Date | null): boolean {
    if (!a || !b) {
        return false;
    }

    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function isDateInRange(date: Date, start: Date | null, end: Date | null): boolean {
    if (!start || !end) {
        return false;
    }

    const time = date.getTime();
    const startTime = normalizeDate(start).getTime();
    const endTime = normalizeDate(end).getTime();

    return time >= startTime && time <= endTime;
}

export function formatDateIndonesian(date: Date, includeYear = true): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = ID_MONTHS_FULL[date.getMonth()];
    const year = date.getFullYear();

    return includeYear ? `${day} ${month} ${year}` : `${day} ${month}`;
}

export function formatRangeLabel(start: Date, end: Date): string {
    return `${formatDateIndonesian(start)} – ${formatDateIndonesian(end)}`;
}

type PresetKey = 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'custom';

interface PresetOption {
    key: PresetKey;
    label: string;
    getRange: () => { start: Date; end: Date };
}

export default function DateRangePicker({
    value,
    defaultValue,
    onChange,
    placeholder = 'Pilih Rentang Tanggal',
    align = 'right',
    className = '',
    buttonClassName = '',
    primaryColor = '#3C0E0E',
}: DateRangePickerProps) {
    const today = useMemo(() => normalizeDate(new Date()), []);

    const presets: PresetOption[] = useMemo(() => [
        {
            key: 'today',
            label: 'Hari Ini',
            getRange: () => ({ start: today, end: today }),
        },
        {
            key: 'yesterday',
            label: 'Kemarin',
            getRange: () => {
                const y = new Date(today);
                y.setDate(y.getDate() - 1);

                return { start: y, end: y };
            },
        },
        {
            key: 'last7',
            label: '7 Hari Terakhir',
            getRange: () => {
                const s = new Date(today);
                s.setDate(s.getDate() - 6);

                return { start: s, end: today };
            },
        },
        {
            key: 'last30',
            label: '30 Hari Terakhir',
            getRange: () => {
                const s = new Date(today);
                s.setDate(s.getDate() - 29);

                return { start: s, end: today };
            },
        },
        {
            key: 'thisMonth',
            label: 'Bulan Ini',
            getRange: () => {
                const start = new Date(today.getFullYear(), today.getMonth(), 1);
                const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

                return { start, end };
            },
        },
        {
            key: 'lastMonth',
            label: 'Bulan Lalu',
            getRange: () => {
                const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const end = new Date(today.getFullYear(), today.getMonth(), 0);

                return { start, end };
            },
        },
        {
            key: 'custom',
            label: 'Rentang Khusus',
            getRange: () => ({
                start: new Date(today.getFullYear(), today.getMonth(), 1),
                end: new Date(today.getFullYear(), today.getMonth() + 1, 0),
            }),
        },
    ], [today]);

    // Initial date values (default to This Month)
    const initialRange = useMemo(() => {
        if (value) {
            return { start: normalizeDate(value.startDate), end: normalizeDate(value.endDate) };
        }

        if (defaultValue) {
            return { start: normalizeDate(defaultValue.startDate), end: normalizeDate(defaultValue.endDate) };
        }

        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        return { start, end };
    }, [value, defaultValue, today]);

    const [isOpen, setIsOpen] = useState(false);
    const [selectedStart, setSelectedStart] = useState<Date>(initialRange.start);
    const [selectedEnd, setSelectedEnd] = useState<Date>(initialRange.end);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [selectingEnd, setSelectingEnd] = useState(false);
    const [activePreset, setActivePreset] = useState<PresetKey>('thisMonth');

    // Dual Calendar view state: baseMonth is the left calendar month (1st of that month)
    const [baseMonth, setBaseMonth] = useState<Date>(() => {
        return new Date(initialRange.start.getFullYear(), initialRange.start.getMonth(), 1);
    });

    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSelectingEnd(false);
                setHoverDate(null);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Right calendar month is baseMonth + 1 month
    const nextMonth = useMemo(() => {
        return new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1);
    }, [baseMonth]);

    const handlePrevMonth = () => {
        setBaseMonth(new Date(baseMonth.getFullYear(), baseMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setBaseMonth(new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1));
    };

    const handlePresetClick = (preset: PresetOption) => {
        setActivePreset(preset.key);
        const { start, end } = preset.getRange();
        setSelectedStart(start);
        setSelectedEnd(end);
        setSelectingEnd(false);
        setHoverDate(null);
        setBaseMonth(new Date(start.getFullYear(), start.getMonth(), 1));

        if (preset.key !== 'custom') {
            const formatted = formatRangeLabel(start, end);
            onChange?.({ startDate: start, endDate: end, label: formatted });
            setIsOpen(false);
        }
    };

    const handleDateClick = (date: Date) => {
        if (!selectingEnd) {
            // First click: Pick start date
            setSelectedStart(date);
            setSelectedEnd(date);
            setSelectingEnd(true);
            setActivePreset('custom');
        } else {
            // Second click: Pick end date
            let finalStart = selectedStart;
            let finalEnd = date;

            if (date.getTime() < selectedStart.getTime()) {
                finalStart = date;
                finalEnd = selectedStart;
            }

            setSelectedStart(finalStart);
            setSelectedEnd(finalEnd);
            setSelectingEnd(false);
            setHoverDate(null);
            setActivePreset('custom');

            const formatted = formatRangeLabel(finalStart, finalEnd);
            onChange?.({ startDate: finalStart, endDate: finalEnd, label: formatted });
            setIsOpen(false);
        }
    };

    const handleApply = () => {
        const formatted = formatRangeLabel(selectedStart, selectedEnd);
        onChange?.({ startDate: selectedStart, endDate: selectedEnd, label: formatted });
        setIsOpen(false);
        setSelectingEnd(false);
    };

    const handleCancel = () => {
        if (value) {
            setSelectedStart(normalizeDate(value.startDate));
            setSelectedEnd(normalizeDate(value.endDate));
        }

        setIsOpen(false);
        setSelectingEnd(false);
        setHoverDate(null);
    };

    // Render calendar grid for a specific month
    const renderMonthGrid = (year: number, month: number) => {
        const firstDayOfMonth = new Date(year, month, 1);
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const cells = [];

        // Previous month trailing days
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const dayNum = daysInPrevMonth - i;
            const date = new Date(year, month - 1, dayNum);
            cells.push({
                date,
                isCurrentMonth: false,
                dayNum,
            });
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            cells.push({
                date,
                isCurrentMonth: true,
                dayNum: d,
            });
        }

        // Next month leading days to complete grid (up to 42 cells)
        const remaining = 42 - cells.length;

        for (let d = 1; d <= remaining; d++) {
            const date = new Date(year, month + 1, d);
            cells.push({
                date,
                isCurrentMonth: false,
                dayNum: d,
            });
        }

        return (
            <div className="w-full">
                {/* Day Headers (Su Mo Tu We Th Fr Sa) */}
                <div className="grid grid-cols-7 mb-1.5 text-center">
                    {DAY_NAMES.map((name) => (
                        <div
                            key={name}
                            className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider py-1 uppercase"
                        >
                            {name}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
                    {cells.map((cell, idx) => {
                        const { date, isCurrentMonth, dayNum } = cell;

                        // Effective range considering hover state when selecting end date
                        let effStart = selectedStart;
                        let effEnd = selectedEnd;

                        if (selectingEnd && hoverDate) {
                            if (hoverDate.getTime() < selectedStart.getTime()) {
                                effStart = hoverDate;
                                effEnd = selectedStart;
                            } else {
                                effStart = selectedStart;
                                effEnd = hoverDate;
                            }
                        }

                        const isStart = isSameDay(date, effStart);
                        const isEnd = isSameDay(date, effEnd);
                        const isInRange = isDateInRange(date, effStart, effEnd);
                        const isSingle = isStart && isEnd;

                        // Range background strip styling
                        let rangeClasses = '';

                        if (isInRange && !isSingle) {
                            if (isStart) {
                                rangeClasses = 'bg-[#3C0E0E]/10 dark:bg-[#3C0E0E]/30 rounded-l-lg';
                            } else if (isEnd) {
                                rangeClasses = 'bg-[#3C0E0E]/10 dark:bg-[#3C0E0E]/30 rounded-r-lg';
                            } else {
                                rangeClasses = 'bg-[#3C0E0E]/10 dark:bg-[#3C0E0E]/30';
                            }
                        }

                        return (
                            <div
                                key={idx}
                                className={`relative py-0.5 flex items-center justify-center ${rangeClasses}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => handleDateClick(date)}
                                    onMouseEnter={() => {
                                        if (selectingEnd) {
                                            setHoverDate(date);
                                        }
                                    }}
                                    style={
                                        isStart || isEnd
                                            ? { backgroundColor: primaryColor || '#3C0E0E' }
                                            : undefined
                                    }
                                    className={`
                                        w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all cursor-pointer select-none
                                        ${
                                            isStart || isEnd
                                                ? 'text-white shadow-xs font-bold z-10 scale-105'
                                                : isCurrentMonth
                                                ? 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                : 'text-slate-400 dark:text-slate-600 hover:text-slate-600'
                                        }
                                        ${isInRange && !isStart && !isEnd ? 'text-[#3C0E0E] dark:text-rose-300 font-bold' : ''}
                                    `}
                                >
                                    {dayNum}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const currentDisplayText = useMemo(() => {
        if (!selectedStart || !selectedEnd) {
            return placeholder;
        }

        return formatRangeLabel(selectedStart, selectedEnd);
    }, [selectedStart, selectedEnd, placeholder]);

    return (
        <div ref={containerRef} className={`relative inline-block ${className}`}>
            {/* Pill Trigger Button - Default Background Putih Seperti Umumnya Input */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    inline-flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-full text-xs font-medium shadow-2xs transition-all cursor-pointer border border-slate-200/90 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.98] ${
                        isOpen ? 'ring-2 ring-[#3C0E0E]/15 border-[#3C0E0E]/40' : ''
                    }
                    ${buttonClassName}
                `}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
            >
                <CalendarIcon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                <span className="font-semibold tracking-wide whitespace-nowrap text-slate-800 dark:text-slate-200">{currentDisplayText}</span>
                <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 ml-0.5 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-slate-700 dark:text-slate-200' : ''
                    }`}
                />
            </button>

            {/* Dropdown Popover */}
            {isOpen && (
                <div
                    className={`
                        absolute top-full mt-2.5 z-50 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 ring-1 ring-black/5
                        ${align === 'right' ? 'right-0' : 'left-0'}
                    `}
                    style={{ minWidth: '640px', maxWidth: '95vw' }}
                >
                    <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
                        {/* ── LEFT PANEL: Presets List (Sidebar) ────────────────── */}
                        <div className="w-full sm:w-44 p-3 bg-slate-50/80 dark:bg-slate-900/90 flex flex-col justify-between shrink-0">
                            <div className="space-y-1">
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-2 block mb-1.5">
                                    Rentang Waktu
                                </span>
                                {presets.map((preset) => {
                                    const isActive = activePreset === preset.key;

                                    return (
                                        <button
                                            key={preset.key}
                                            type="button"
                                            onClick={() => handlePresetClick(preset)}
                                            style={isActive ? { backgroundColor: primaryColor || '#3C0E0E' } : undefined}
                                            className={`
                                                w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between
                                                ${
                                                    isActive
                                                        ? 'text-white shadow-xs font-bold'
                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                                                }
                                            `}
                                        >
                                            <span>{preset.label}</span>
                                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white/80" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Preset Helper Text */}
                            <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 px-1 text-[10px] text-slate-400 leading-tight">
                                <span>Pilih rentang cepat atau tentukan tanggal di kalender.</span>
                            </div>
                        </div>

                        {/* ── RIGHT PANEL: Dual Calendars ───────────────── */}
                        <div className="p-4 sm:p-5 flex-1 bg-white dark:bg-slate-900 flex flex-col justify-between">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Month 1 (Left Month) */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <button
                                            type="button"
                                            onClick={handlePrevMonth}
                                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                                            aria-label="Bulan Sebelumnya"
                                        >
                                            <ChevronLeft className="w-4 h-4 font-bold" />
                                        </button>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide">
                                            {ID_MONTHS_FULL[baseMonth.getMonth()]} {baseMonth.getFullYear()}
                                        </span>
                                        <div className="w-7 md:hidden" /> {/* Spacer on single column */}
                                    </div>
                                    {renderMonthGrid(baseMonth.getFullYear(), baseMonth.getMonth())}
                                </div>

                                {/* Month 2 (Right Month) */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <div className="w-7 hidden md:block" /> {/* Spacer on dual column */}
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide">
                                            {ID_MONTHS_FULL[nextMonth.getMonth()]} {nextMonth.getFullYear()}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleNextMonth}
                                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                                            aria-label="Bulan Berikutnya"
                                        >
                                            <ChevronRight className="w-4 h-4 font-bold" />
                                        </button>
                                    </div>
                                    {renderMonthGrid(nextMonth.getFullYear(), nextMonth.getMonth())}
                                </div>
                            </div>

                            {/* Bottom Selection Status & Actions */}
                            <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                                <div className="text-slate-500 dark:text-slate-400 text-left w-full sm:w-auto">
                                    <span className="font-medium text-[11px]">Rentang: </span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {formatRangeLabel(selectedStart, selectedEnd)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer text-xs"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleApply}
                                        style={{ backgroundColor: primaryColor || '#3C0E0E' }}
                                        className="px-4 py-1.5 rounded-xl text-white font-bold transition-all shadow-xs cursor-pointer text-xs hover:opacity-90 active:scale-95"
                                    >
                                        Terapkan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
