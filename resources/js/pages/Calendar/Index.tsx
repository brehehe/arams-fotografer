import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Plus,
    MapPin,
    Clock,
    Users,
    Check,
    X,
    CalendarDays,
    Briefcase,
    Layers,
    ExternalLink,
    Phone,
    Package,
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { formatDate } from '@/lib/formatters';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CalendarItem {
    id: string;
    schedule_id?: string | null;
    project_id: number | string;
    project_number?: string;
    project_name?: string;
    package_name?: string;
    title: string;
    client_name: string;
    client_phone?: string;
    category_name: string;
    category_color: string;
    date: string;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
    type: string;
    type_raw: string;
    status: string;
    payment_status?: string | null;
    total_amount?: number | string | null;
    paid_amount?: number | string | null;
    notes: string | null;
    source?: string;
    color?: string;
}

interface ProjectOption {
    id: string | number;
    name: string;
    project_number?: string;
    client_id?: string | number;
    client_name?: string;
    location?: string;
}

interface ClientOption {
    id: string | number;
    name: string;
    phone?: string;
    email?: string;
}

interface ScheduleSummary {
    total_week: number;
    project: number;
    meeting: number;
    deadline: number;
    other: number;
}

interface CalendarIndexProps {
    events?: CalendarItem[];
    grouped?: Array<{ date: string; day_label: string; is_today: boolean; items: CalendarItem[] }>;
    tab_counts?: Record<string, number>;
    team_stats?: { tersedia: number; booking: number; tidak: number; percentage: number };
    upcoming?: CalendarItem[];
    current_month?: { label: string; value: string };
    projects_list?: ProjectOption[];
    clients_list?: ClientOption[];
    locations_list?: string[];
    schedule_summary?: ScheduleSummary;
}

const COLOR_OPTIONS = [
    { name: 'purple', hex: '#6366F1', bg: '#EEF2FF', border: '#C7D2FE', text: '#3730A3', dot: '#4F46E5' },
    { name: 'blue', hex: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', dot: '#2563EB' },
    { name: 'green', hex: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46', dot: '#059669' },
    { name: 'yellow', hex: '#EAB308', bg: '#FEF3C7', border: '#FDE68A', text: '#92400E', dot: '#D97706' },
    { name: 'orange', hex: '#F97316', bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412', dot: '#EA580C' },
    { name: 'red', hex: '#EF4444', bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', dot: '#DC2626' },
    { name: 'pink', hex: '#EC4899', bg: '#FDF2F8', border: '#FBCFE8', text: '#9D174D', dot: '#DB2777' },
    { name: 'slate', hex: '#64748B', bg: '#F8FAFC', border: '#E2E8F0', text: '#334155', dot: '#475569' },
];

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const DAY_NAMES_FULL = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const formatDateToYMD = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function CalendarIndex({
    events = [],
    projects_list = [],
    clients_list = [],
    schedule_summary = { total_week: 12, project: 8, meeting: 3, deadline: 1, other: 0 },
}: CalendarIndexProps) {
    const today = useMemo(() => new Date(), []);
    const todayStr = useMemo(() => formatDateToYMD(today), [today]);

    // Current View State
    const [viewMode, setViewMode] = useState<'bulan' | 'minggu' | 'hari' | 'daftar'>('bulan');
    const [currentDate, setCurrentDate] = useState<Date>(today);
    const [selectedDate, setSelectedDate] = useState<string>(todayStr);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);

    // List view filters
    const [listSearch, setListSearch] = useState('');
    const [listTypeFilter, setListTypeFilter] = useState('Semua');

    // Modal State
    const [addModalOpen, setAddModalOpen] = useState(false);

    // Add Schedule Form State
    const [addForm, setAddForm] = useState({
        title: '',
        type: 'Project',
        client_id: '',
        project_id: '',
        description: '',
        start_date: todayStr,
        start_time: '09:00',
        end_date: todayStr,
        end_time: '12:00',
        location: '',
        color: '#6366F1',
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const action = params.get('action');

            if (action === 'create' || action === 'add') {
                const newUrl = window.location.pathname;

                window.history.replaceState({}, '', newUrl);
                requestAnimationFrame(() => {
                    setAddModalOpen(true);
                });
            }
        }
    }, []);

    // 1. Compute Days for the active Week
    const weekDays = useMemo(() => {
        const d = new Date(currentDate);
        const day = d.getDay(); // 0 is Sunday, 1 is Monday ...
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));

        const days = [];

        for (let i = 0; i < 7; i++) {
            const cur = new Date(monday);
            cur.setDate(monday.getDate() + i);
            const dateStr = formatDateToYMD(cur);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            days.push({
                dayName: DAY_NAMES[i],
                dayNameFull: DAY_NAMES_FULL[i],
                dayNum: cur.getDate(),
                monthName: MONTH_NAMES_SHORT[cur.getMonth()],
                year: cur.getFullYear(),
                dateStr: dateStr,
                isToday: isToday,
                isSelected: isSelected,
                fullDate: cur,
            });
        }

        return days;
    }, [currentDate, selectedDate, todayStr]);

    // 2. Compute Days for the active Month (35 or 42 cells)
    const monthDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        let startDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun, 1=Mon
        startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // 0=Mon, 6=Sun

        const days = [];
        const prevMonthLastDay = new Date(year, month, 0).getDate();

        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const d = new Date(year, month - 1, prevMonthLastDay - i);
            const dateStr = formatDateToYMD(d);
            days.push({
                dateStr: dateStr,
                dayNum: d.getDate(),
                isCurrentMonth: false,
                isToday: dateStr === todayStr,
                isSelected: dateStr === selectedDate,
                fullDate: d,
            });
        }

        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const d = new Date(year, month, i);
            const dateStr = formatDateToYMD(d);
            days.push({
                dateStr: dateStr,
                dayNum: i,
                isCurrentMonth: true,
                isToday: dateStr === todayStr,
                isSelected: dateStr === selectedDate,
                fullDate: d,
            });
        }

        const remaining = (7 - (days.length % 7)) % 7;

        for (let i = 1; i <= remaining; i++) {
            const d = new Date(year, month + 1, i);
            const dateStr = formatDateToYMD(d);
            days.push({
                dateStr: dateStr,
                dayNum: d.getDate(),
                isCurrentMonth: false,
                isToday: dateStr === todayStr,
                isSelected: dateStr === selectedDate,
                fullDate: d,
            });
        }

        return days;
    }, [currentDate, selectedDate, todayStr]);

    // 3. Navigation Controls
    const handlePrev = () => {
        const d = new Date(currentDate);

        if (viewMode === 'minggu') {
            d.setDate(d.getDate() - 7);
        } else if (viewMode === 'bulan' || viewMode === 'daftar') {
            d.setMonth(d.getMonth() - 1);
        } else if (viewMode === 'hari') {
            d.setDate(d.getDate() - 1);
            setSelectedDate(formatDateToYMD(d));
        }

        setCurrentDate(d);
    };

    const handleNext = () => {
        const d = new Date(currentDate);

        if (viewMode === 'minggu') {
            d.setDate(d.getDate() + 7);
        } else if (viewMode === 'bulan' || viewMode === 'daftar') {
            d.setMonth(d.getMonth() + 1);
        } else if (viewMode === 'hari') {
            d.setDate(d.getDate() + 1);
            setSelectedDate(formatDateToYMD(d));
        }

        setCurrentDate(d);
    };

    const handleToday = () => {
        const now = new Date();
        setCurrentDate(now);
        setSelectedDate(formatDateToYMD(now));
    };

    // 4. Header Date Label
    const dateLabel = useMemo(() => {
        if (viewMode === 'bulan' || viewMode === 'daftar') {
            return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        }

        if (viewMode === 'hari') {
            const parts = selectedDate.split('-');

            if (parts.length === 3) {
                const selD = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                let dow = selD.getDay();
                dow = dow === 0 ? 6 : dow - 1;

                return `${DAY_NAMES_FULL[dow]}, ${selD.getDate()} ${MONTH_NAMES[selD.getMonth()]} ${selD.getFullYear()}`;
            }

            return selectedDate;
        }

        if (weekDays.length === 7) {
            return `${weekDays[0].dayNum} – ${weekDays[6].dayNum} ${weekDays[6].monthName} ${weekDays[6].year}`;
        }

        return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }, [viewMode, currentDate, selectedDate, weekDays]);

    // Combine backend events
    const displayEvents = useMemo(() => {
        if (!events || events.length === 0) {
            return [];
        }

        return events.map(e => {
            const lower = (e.type || e.category_name || '').toLowerCase();
            let cName = 'purple';

            if (lower.includes('meet')) {
                cName = 'yellow';
            } else if (lower.includes('prewed') || lower.includes('matern')) {
                cName = 'green';
            } else if (lower.includes('family') || lower.includes('review')) {
                cName = 'blue';
            } else if (lower.includes('dead') || lower.includes('edit')) {
                cName = 'red';
            } else if (lower.includes('event') || lower.includes('corp')) {
                cName = 'orange';
            }

            return { ...e, color: e.color || cName };
        });
    }, [events]);

    const formattedTodayLabel = useMemo(() => {
        const now = new Date();
        let dow = now.getDay();
        dow = dow === 0 ? 6 : dow - 1;

        return `${DAY_NAMES_FULL[dow]}, ${now.getDate()} ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
    }, []);

    const todayItems = useMemo(() => {
        return displayEvents
            .filter(item => item.date === todayStr)
            .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
    }, [displayEvents, todayStr]);

    const upcomingItems = useMemo(() => {
        return displayEvents
            .filter(item => item.date && item.date >= todayStr)
            .sort((a, b) => {
                const cmp = (a.date || '').localeCompare(b.date || '');

                if (cmp !== 0) {
                    return cmp;
                }

                return (a.start_time || '').localeCompare(b.start_time || '');
            })
            .slice(0, 5);
    }, [displayEvents, todayStr]);

    // Handle Submit Tambah Jadwal
    const handleAddScheduleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/calendar/schedules', {
            title: addForm.title,
            type: addForm.type.toLowerCase(),
            project_id: addForm.project_id || undefined,
            client_id: addForm.client_id || undefined,
            date: addForm.start_date,
            start_time: addForm.start_time,
            end_time: addForm.end_time,
            location: addForm.location,
            notes: addForm.description,
        }, {
            onSuccess: () => {
                setAddModalOpen(false);
                setAddForm({
                    title: '',
                    type: 'Project',
                    client_id: '',
                    project_id: '',
                    description: '',
                    start_date: todayStr,
                    start_time: '09:00',
                    end_date: todayStr,
                    end_time: '12:00',
                    location: '',
                    color: '#6366F1',
                });
            }
        });
    };

    // Helper to find color styles
    const getColorStyle = (colorName?: string) => {
        return COLOR_OPTIONS.find(c => c.name === colorName) || COLOR_OPTIONS[0];
    };

    return (
        <div className="w-full max-w-full space-y-4 pb-2">
            <Head title="Calendar & Schedule - Arams Pictures" />

            {/* ── 1. PAGE HEADER ── */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Jadwal & Sesi
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Kelola dan lihat semua jadwal kegiatan, meeting, deadline, dan event penting.
                </p>
            </div>

            {/* ── 2. CALENDAR MAIN CONTAINER ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-visible">
                {/* Top Calendar Toolbar */}
                <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-white relative rounded-t-2xl">
                    {/* Left: Hari Ini, Arrows, Date Range Dropdown */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleToday}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                        >
                            Hari ini
                        </button>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handlePrev}
                                className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                                title="Sebelumnya"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                                title="Berikutnya"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Date Range Badge / Dropdown Popover Button */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                            >
                                <span>{dateLabel}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Interactive Date & Month Picker Dropdown Popover */}
                            {isDatePickerOpen && (
                                <div className="absolute left-0 top-12 z-50 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                        <span className="text-xs font-black text-slate-900">Pilih Tanggal &amp; Bulan</span>
                                        <button
                                            type="button"
                                            onClick={() => setIsDatePickerOpen(false)}
                                            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Direct Date Input */}
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-600 block">Lompat ke Tanggal:</label>
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => {
                                                const val = e.target.value;

                                                if (val) {
                                                    setSelectedDate(val);
                                                    const parts = val.split('-');
                                                    setCurrentDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
                                                }
                                            }}
                                            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-[#3B46F1] outline-hidden cursor-pointer"
                                        />
                                    </div>

                                    {/* Year Selector */}
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-600 block">Tahun:</label>
                                        <div className="flex items-center gap-1.5">
                                            {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map((yr) => (
                                                <button
                                                    key={yr}
                                                    type="button"
                                                    onClick={() => {
                                                        const d = new Date(currentDate);
                                                        d.setFullYear(yr);
                                                        setCurrentDate(d);
                                                    }}
                                                    className={`flex-1 py-1 text-xs rounded-lg font-bold border transition-colors cursor-pointer ${currentDate.getFullYear() === yr
                                                        ? 'bg-[#3B46F1] text-white border-indigo-600'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    {yr}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Month Selector Grid */}
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-600 block">Bulan:</label>
                                        <div className="grid grid-cols-4 gap-1.5">
                                            {MONTH_NAMES_SHORT.map((m, idx) => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => {
                                                        const d = new Date(currentDate);
                                                        d.setMonth(idx);
                                                        setCurrentDate(d);
                                                        setIsDatePickerOpen(false);
                                                    }}
                                                    className={`py-1.5 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer text-center ${currentDate.getMonth() === idx
                                                        ? 'bg-[#3B46F1] text-white border-indigo-600'
                                                        : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-indigo-50 hover:text-indigo-600'
                                                        }`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: View Switcher (Bulan, Minggu, Hari, Daftar) & + Tambah Jadwal */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center p-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
                            {(['bulan', 'minggu', 'hari', 'daftar'] as const).map(mode => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setViewMode(mode)}
                                    className={`px-3.5 py-1.5 rounded-lg capitalize transition-all cursor-pointer font-bold ${viewMode === mode
                                        ? 'bg-[#3B46F1] text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setAddForm(prev => ({
                                    ...prev,
                                    start_date: selectedDate,
                                    end_date: selectedDate,
                                }));
                                setAddModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Jadwal
                        </button>
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════════════ */}
                {/* ── 1. BULAN (MONTHLY) GRID VIEW ─────────────────────────────── */}
                {/* ════════════════════════════════════════════════════════════════ */}
                {viewMode === 'bulan' && (
                    <div className="p-4 sm:p-5 space-y-3 rounded-b-2xl">
                        <div className="grid grid-cols-7 text-center font-bold text-xs text-slate-500 border-b border-slate-100 pb-2.5">
                            {DAY_NAMES.map(d => (
                                <div key={d}>{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1.5">
                            {monthDays.map((cell, idx) => {
                                const dayEvents = displayEvents.filter(e => e.date === cell.dateStr);

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedDate(cell.dateStr)}
                                        onDoubleClick={() => {
                                            setSelectedDate(cell.dateStr);
                                            setViewMode('hari');
                                        }}
                                        className={`min-h-[105px] sm:min-h-[115px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group relative ${cell.isSelected
                                            ? 'ring-2 ring-[#3B46F1] border-indigo-200 bg-indigo-50/30'
                                            : cell.isCurrentMonth
                                                ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                                                : 'bg-slate-50/50 border-slate-100 opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${cell.isToday
                                                    ? 'bg-[#3B46F1] text-white shadow-xs'
                                                    : cell.isSelected
                                                        ? 'bg-indigo-100 text-indigo-700'
                                                        : cell.isCurrentMonth
                                                            ? 'text-slate-800'
                                                            : 'text-slate-400'
                                                    }`}
                                            >
                                                {cell.dayNum}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setAddForm(prev => ({
                                                        ...prev,
                                                        start_date: cell.dateStr,
                                                        end_date: cell.dateStr,
                                                    }));
                                                    setAddModalOpen(true);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-opacity cursor-pointer"
                                                title="Tambah Jadwal di tanggal ini"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {/* Event Pills inside Day Cell */}
                                        <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                                            {dayEvents.slice(0, 2).map(evt => {
                                                const colorStyle = getColorStyle(evt.color);

                                                return (
                                                    <div
                                                        key={evt.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedItem(evt);
                                                        }}
                                                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border flex items-center gap-1 hover:brightness-95 transition-all"
                                                        style={{
                                                            backgroundColor: colorStyle.bg,
                                                            borderColor: colorStyle.border,
                                                            color: colorStyle.text,
                                                        }}
                                                    >
                                                        <span
                                                            className="w-1.5 h-1.5 rounded-full shrink-0"
                                                            style={{ backgroundColor: colorStyle.dot }}
                                                        />
                                                        <span className="truncate">{evt.title}</span>
                                                    </div>
                                                );
                                            })}

                                            {dayEvents.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedDate(cell.dateStr);
                                                        setViewMode('hari');
                                                    }}
                                                    className="text-[10px] text-indigo-600 font-bold block hover:underline"
                                                >
                                                    +{dayEvents.length - 2} lainnya
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════════════ */}
                {/* ── 2. MINGGU (WEEKLY) GRID VIEW ─────────────────────────────── */}
                {/* ════════════════════════════════════════════════════════════════ */}
                {viewMode === 'minggu' && (
                    <div className="overflow-x-auto rounded-b-2xl">
                        <div className="min-w-[900px]">
                            {/* Grid Day Headers (7 Columns) */}
                            <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-200 bg-slate-50/40 text-center text-xs">
                                <div className="py-3 px-2 text-[11px] font-bold text-slate-400 border-r border-slate-100 flex items-center justify-center">
                                    WAKTU
                                </div>
                                {weekDays.map((day, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedDate(day.dateStr)}
                                        className={`py-3 px-2 border-r border-slate-100 last:border-r-0 flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${day.isSelected
                                            ? 'bg-indigo-50/70 ring-1 ring-inset ring-indigo-400'
                                            : day.isToday
                                                ? 'bg-indigo-50/40 hover:bg-indigo-50/60'
                                                : 'hover:bg-slate-100/60'
                                            }`}
                                    >
                                        <span className={`text-[11px] font-semibold ${day.isSelected || day.isToday ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}>
                                            {day.dayName}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {day.isToday ? (
                                                <span className="w-6 h-6 rounded-full bg-[#3B46F1] text-white font-black text-xs flex items-center justify-center shadow-2xs">
                                                    {day.dayNum}
                                                </span>
                                            ) : (
                                                <span className={`text-xs font-bold ${day.isSelected ? 'text-indigo-700 underline' : 'text-slate-800'}`}>
                                                    {day.dayNum}
                                                </span>
                                            )}
                                            <span className="text-[11px] text-slate-400 font-medium">{day.monthName}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Grid Body: 11 Time Slots */}
                            <div className="relative divide-y divide-slate-100">
                                {TIME_SLOTS.map((time, slotIdx) => (
                                    <div key={time} className="grid grid-cols-[80px_repeat(7,1fr)] min-h-[72px]">
                                        {/* Time column label */}
                                        <div className="py-2.5 px-3 text-[11px] font-bold text-slate-400 border-r border-slate-100 text-center flex items-start justify-center">
                                            {time}
                                        </div>

                                        {/* 7 Day Slot Cells */}
                                        {weekDays.map((day, dayIdx) => {
                                            const slotHour = parseInt(time.split(':')[0], 10);
                                            const cellEvents = displayEvents.filter(e => {
                                                if (e.date !== day.dateStr) {
                                                    return false;
                                                }

                                                if (!e.start_time) {
                                                    return slotIdx === 0;
                                                }

                                                const eventHour = parseInt(e.start_time.split(':')[0], 10);

                                                return eventHour === slotHour;
                                            });

                                            return (
                                                <div
                                                    key={dayIdx}
                                                    onClick={() => {
                                                        setSelectedDate(day.dateStr);
                                                    }}
                                                    onDoubleClick={() => {
                                                        setAddForm(prev => ({
                                                            ...prev,
                                                            start_date: day.dateStr,
                                                            end_date: day.dateStr,
                                                            start_time: time,
                                                            end_time: `${String(parseInt(time) + 1).padStart(2, '0')}:00`,
                                                        }));
                                                        setAddModalOpen(true);
                                                    }}
                                                    className={`border-r border-slate-100 last:border-r-0 p-1.5 relative transition-colors ${day.isSelected
                                                        ? 'bg-indigo-50/25'
                                                        : day.isToday
                                                            ? 'bg-indigo-50/10'
                                                            : 'hover:bg-slate-50/50'
                                                        }`}
                                                >
                                                    {cellEvents.map(evt => {
                                                        const colorStyle = getColorStyle(evt.color);

                                                        return (
                                                            <div
                                                                key={evt.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedItem(evt);
                                                                }}
                                                                className="rounded-xl p-2.5 text-xs transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer border mb-1.5 space-y-1 relative group"
                                                                style={{
                                                                    backgroundColor: colorStyle.bg,
                                                                    borderColor: colorStyle.border,
                                                                    color: colorStyle.text,
                                                                }}
                                                            >
                                                                {/* Title + Dot */}
                                                                <div className="flex items-center gap-1.5 min-w-0">
                                                                    <div
                                                                        className="w-2 h-2 rounded-full shrink-0"
                                                                        style={{ backgroundColor: colorStyle.dot }}
                                                                    />
                                                                    <span className="font-bold truncate text-[11px]" style={{ color: colorStyle.text }}>
                                                                        {evt.title}
                                                                    </span>
                                                                </div>

                                                                <p className="text-[10.5px] font-semibold opacity-90 truncate">
                                                                    {evt.client_name}
                                                                </p>

                                                                <div className="text-[9.5px] font-medium opacity-80 flex items-center gap-1">
                                                                    <span>{evt.start_time || '09:00'} - {evt.end_time || '12:00'}</span>
                                                                </div>

                                                                {evt.location && (
                                                                    <div className="text-[9.5px] font-medium opacity-80 flex items-center gap-1 truncate pt-0.5">
                                                                        <MapPin className="w-2.5 h-2.5 shrink-0 opacity-70" />
                                                                        <span className="truncate">{evt.location}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════════════ */}
                {/* ── 3. HARI (DAILY) TIMELINE VIEW ────────────────────────────── */}
                {/* ════════════════════════════════════════════════════════════════ */}
                {viewMode === 'hari' && (
                    <div className="p-5 space-y-6 rounded-b-2xl">
                        {/* Day Header Banner */}
                        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Jadwal Harian</span>
                                <h3 className="text-lg font-black text-slate-900 mt-0.5">{dateLabel}</h3>
                                <p className="text-xs text-slate-500">
                                    {displayEvents.filter(e => e.date === selectedDate).length} jadwal terdaftar pada hari ini
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAddForm(prev => ({
                                            ...prev,
                                            start_date: selectedDate,
                                            end_date: selectedDate,
                                        }));
                                        setAddModalOpen(true);
                                    }}
                                    className="px-3.5 py-2 bg-[#3B46F1] text-white rounded-xl text-xs font-bold hover:bg-[#323BD8] transition-colors cursor-pointer"
                                >
                                    + Tambah di Hari Ini
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('minggu')}
                                    className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    Buka Mode Minggu
                                </button>
                            </div>
                        </div>

                        {/* Hour by Hour Schedule Timeline */}
                        <div className="space-y-2 divide-y divide-slate-100">
                            {TIME_SLOTS.map(time => {
                                const slotHour = parseInt(time.split(':')[0], 10);
                                const hourEvents = displayEvents.filter(e => {
                                    if (e.date !== selectedDate) {
                                        return false;
                                    }

                                    if (!e.start_time) {
                                        return false;
                                    }

                                    const eventHour = parseInt(e.start_time.split(':')[0], 10);

                                    return eventHour === slotHour;
                                });

                                return (
                                    <div key={time} className="pt-3 flex gap-4 items-start group">
                                        <div className="w-16 text-xs font-black text-slate-400 text-right shrink-0 pt-1">
                                            {time}
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            {hourEvents.length > 0 ? (
                                                hourEvents.map(evt => {
                                                    const colorStyle = getColorStyle(evt.color);

                                                    return (
                                                        <div
                                                            key={evt.id}
                                                            onClick={() => setSelectedItem(evt)}
                                                            className="p-3.5 rounded-xl border transition-all hover:shadow-md cursor-pointer flex items-start justify-between gap-4"
                                                            style={{
                                                                backgroundColor: colorStyle.bg,
                                                                borderColor: colorStyle.border,
                                                                color: colorStyle.text,
                                                            }}
                                                        >
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-black text-sm text-slate-900">{evt.title}</span>
                                                                    <span
                                                                        className="px-2 py-0.5 rounded text-[10px] font-bold border"
                                                                        style={{ backgroundColor: colorStyle.bg, color: colorStyle.text }}
                                                                    >
                                                                        {evt.type}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs font-semibold opacity-90">{evt.client_name}</p>
                                                                <div className="text-xs font-medium opacity-80 flex items-center gap-3 pt-0.5">
                                                                    <span>🕒 {evt.start_time} - {evt.end_time}</span>
                                                                    {evt.location && <span>📍 {evt.location}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setAddForm(prev => ({
                                                            ...prev,
                                                            start_date: selectedDate,
                                                            end_date: selectedDate,
                                                            start_time: time,
                                                            end_time: `${String(slotHour + 1).padStart(2, '0')}:00`,
                                                        }));
                                                        setAddModalOpen(true);
                                                    }}
                                                    className="w-full py-2.5 px-3 border border-dashed border-slate-200 rounded-xl text-left text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/20 text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 opacity-50 hover:opacity-100"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>Tambah jadwal pada jam {time}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ════════════════════════════════════════════════════════════════ */}
                {/* ── 4. DAFTAR (LIST / AGENDA) VIEW ───────────────────────────── */}
                {/* ════════════════════════════════════════════════════════════════ */}
                {viewMode === 'daftar' && (
                    <div className="p-5 space-y-4 rounded-b-2xl">
                        {/* Search and Category Filter Toolbar */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <input
                                type="text"
                                value={listSearch}
                                onChange={(e) => setListSearch(e.target.value)}
                                placeholder="Cari judul, klien, atau lokasi..."
                                className="w-full sm:w-72 px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-[#3B46F1] outline-hidden"
                            />

                            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                                {['Semua', 'Project', 'Meeting', 'Deadline', 'Corporate'].map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setListTypeFilter(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${listTypeFilter === cat
                                            ? 'bg-[#3B46F1] text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List Items */}
                        <div className="divide-y divide-slate-100">
                            {displayEvents
                                .filter(e => {
                                    const matchSearch =
                                        !listSearch ||
                                        e.title.toLowerCase().includes(listSearch.toLowerCase()) ||
                                        e.client_name.toLowerCase().includes(listSearch.toLowerCase()) ||
                                        (e.location && e.location.toLowerCase().includes(listSearch.toLowerCase()));
                                    const matchType =
                                        listTypeFilter === 'Semua' ||
                                        e.type.toLowerCase() === listTypeFilter.toLowerCase() ||
                                        e.category_name.toLowerCase() === listTypeFilter.toLowerCase();

                                    return matchSearch && matchType;
                                })
                                .map(evt => {
                                    const colorStyle = getColorStyle(evt.color);

                                    return (
                                        <div
                                            key={evt.id}
                                            onClick={() => setSelectedItem(evt)}
                                            className="py-3.5 px-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-between gap-4 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold shadow-2xs"
                                                    style={{ backgroundColor: colorStyle.bg, color: colorStyle.dot }}
                                                >
                                                    <CalendarIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-slate-900 text-sm">{evt.title}</h4>
                                                        <span
                                                            className="px-2 py-0.5 rounded text-[10px] font-bold border"
                                                            style={{ backgroundColor: colorStyle.bg, color: colorStyle.dot, borderColor: colorStyle.border }}
                                                        >
                                                            {evt.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                        {evt.client_name} · 📍 {evt.location || 'Studio'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-xs font-bold text-slate-800 block font-sans">
                                                    {formatDate(evt.date)}
                                                </span>
                                                <span className="text-[11px] text-slate-500 font-medium">
                                                    {evt.start_time} - {evt.end_time}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}
            </div>

            {/* ── 3. BOTTOM 3 SUMMARY CARDS (Jadwal Hari Ini, Upcoming, Ringkasan) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 3.1. Jadwal Hari Ini */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Jadwal Hari Ini</h3>
                            <p className="text-[11px] text-slate-400 font-medium">{formattedTodayLabel}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setViewMode('daftar')}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                        >
                            Lihat Semua
                        </button>
                    </div>

                    <div className="space-y-3">
                        {todayItems.length > 0 ? (
                            todayItems.slice(0, 3).map((item) => {
                                const colorCfg = getColorStyle(item.color);

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-xs transition-all flex items-start justify-between gap-2 bg-slate-50/40 cursor-pointer"
                                    >
                                        <div className="space-y-1 min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                                                <div
                                                    className="w-2 h-2 rounded-full shrink-0"
                                                    style={{ backgroundColor: colorCfg.dot || '#6366F1' }}
                                                />
                                                <span>{item.start_time || '09:00'} - {item.end_time || 'Selesai'}</span>
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-900 truncate">
                                                {item.title}{item.client_name ? ` - ${item.client_name}` : ''}
                                            </h4>
                                            <div className="text-[10.5px] text-slate-400 flex items-center gap-1 truncate">
                                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span className="truncate">{item.location || 'Lokasi belum ditentukan'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <span
                                                className="px-2 py-0.5 rounded text-[9.5px] font-bold border"
                                                style={{
                                                    backgroundColor: colorCfg.bg,
                                                    borderColor: colorCfg.border,
                                                    color: colorCfg.text,
                                                }}
                                            >
                                                {item.status || item.type || 'Jadwal'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <CalendarDays className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                                <p className="text-xs font-semibold text-slate-600">Tidak ada jadwal hari ini</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Semua jadwal yang dibuat otomatis tercatat di sini</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3.2. Upcoming Jadwal */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">Upcoming Jadwal</h3>
                        <button
                            type="button"
                            onClick={() => setViewMode('daftar')}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                        >
                            Lihat Semua
                        </button>
                    </div>

                    <div className="space-y-3">
                        {upcomingItems.length > 0 ? (
                            upcomingItems.slice(0, 3).map((item) => {
                                const colorCfg = getColorStyle(item.color);

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-xs transition-all flex items-start justify-between gap-2 bg-slate-50/40 cursor-pointer"
                                    >
                                        <div className="space-y-1 min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                                                <div
                                                    className="w-2 h-2 rounded-full shrink-0"
                                                    style={{ backgroundColor: colorCfg.dot || '#6366F1' }}
                                                />
                                                <span>{formatDate(item.date)} - {item.start_time || '09:00'}</span>
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-900 truncate">
                                                {item.title}{item.client_name ? ` - ${item.client_name}` : ''}
                                            </h4>
                                            <div className="text-[10.5px] text-slate-400 flex items-center gap-1 truncate">
                                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span className="truncate">{item.location || 'Lokasi belum ditentukan'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <span
                                                className="px-2 py-0.5 rounded text-[9.5px] font-bold border"
                                                style={{
                                                    backgroundColor: colorCfg.bg,
                                                    borderColor: colorCfg.border,
                                                    color: colorCfg.text,
                                                }}
                                            >
                                                {item.status || item.type || 'Mendatang'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                <CalendarDays className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                                <p className="text-xs font-semibold text-slate-600">Belum ada jadwal mendatang</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Buat project atau tambah jadwal baru</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3.3. Ringkasan Jadwal */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">Ringkasan Jadwal</h3>

                    <div className="space-y-3 text-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                <CalendarDays className="w-4 h-4 text-slate-400" />
                                <span>Total Jadwal (Minggu Ini)</span>
                            </div>
                            <span className="font-extrabold text-slate-900 text-sm">
                                {schedule_summary.total_week}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                <span>Project</span>
                            </div>
                            <span className="font-extrabold text-slate-900">
                                {schedule_summary.project}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span>Meeting</span>
                            </div>
                            <span className="font-extrabold text-slate-900">
                                {schedule_summary.meeting}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                <Clock className="w-4 h-4 text-slate-400" />
                                <span>Deadline</span>
                            </div>
                            <span className="font-extrabold text-slate-900">
                                {schedule_summary.deadline}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                <Layers className="w-4 h-4 text-slate-400" />
                                <span>Event Lainnya</span>
                            </div>
                            <span className="font-extrabold text-slate-900">
                                {schedule_summary.other}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* ── 4. MODAL: TAMBAH JADWAL ── */}
            {addModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <h3 className="text-base font-black text-slate-900">Tambah Jadwal</h3>
                            <button
                                type="button"
                                onClick={() => setAddModalOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddScheduleSubmit} className="space-y-5 text-xs">
                            {/* 1. Informasi Jadwal */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Informasi Jadwal</h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Judul Jadwal <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={addForm.title}
                                            onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                                            placeholder="Contoh: Project Wedding Kevin & Jessica"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Jenis Jadwal <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            required
                                            value={addForm.type}
                                            onChange={(e) => setAddForm({ ...addForm, type: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                        >
                                            <option value="Project">Project</option>
                                            <option value="Meeting">Meeting</option>
                                            <option value="Deadline">Deadline</option>
                                            <option value="Event">Event Lainnya</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Client / Klien</label>
                                        <select
                                            value={addForm.client_id}
                                            onChange={(e) => {
                                                const selectedClientId = e.target.value;
                                                const matchingProjects = selectedClientId
                                                    ? projects_list.filter((p) => String(p.client_id) === String(selectedClientId))
                                                    : [];
                                                setAddForm({
                                                    ...addForm,
                                                    client_id: selectedClientId,
                                                    project_id: matchingProjects.length === 1 ? String(matchingProjects[0].id) : '',
                                                });
                                            }}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                        >
                                            <option value="">Pilih klien (opsional)</option>
                                            {clients_list.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Project / Order</label>
                                        <select
                                            value={addForm.project_id}
                                            onChange={(e) => {
                                                const selectedProjId = e.target.value;
                                                const proj = projects_list.find((p) => String(p.id) === String(selectedProjId));
                                                setAddForm({
                                                    ...addForm,
                                                    project_id: selectedProjId,
                                                    client_id: proj?.client_id ? String(proj.client_id) : addForm.client_id,
                                                    location: addForm.location || proj?.location || '',
                                                });
                                            }}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                        >
                                            <option value="">Pilih project (opsional)</option>
                                            {(addForm.client_id
                                                ? projects_list.filter((p) => String(p.client_id) === String(addForm.client_id))
                                                : projects_list
                                            ).map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} {p.client_name && !addForm.client_id ? `(${p.client_name})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Deskripsi</label>
                                    <textarea
                                        rows={2}
                                        value={addForm.description}
                                        onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                                        placeholder="Tambahkan deskripsi jadwal (opsional)"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                                    />
                                </div>
                            </div>

                            {/* 2. Waktu & Tempat */}
                            <div className="space-y-3 pt-2 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Waktu & Tempat</h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Tanggal Mulai <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={addForm.start_date}
                                            onChange={(e) => setAddForm({ ...addForm, start_date: e.target.value })}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Waktu Mulai <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={addForm.start_time}
                                            onChange={(e) => setAddForm({ ...addForm, start_time: e.target.value })}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Tanggal Selesai <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={addForm.end_date}
                                            onChange={(e) => setAddForm({ ...addForm, end_date: e.target.value })}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Waktu Selesai <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={addForm.end_time}
                                            onChange={(e) => setAddForm({ ...addForm, end_time: e.target.value })}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Lokasi</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={addForm.location}
                                            onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                                            placeholder="Contoh: Studio Arams, Gedung Serbaguna, Online, dll"
                                            className="w-full pl-3.5 pr-9 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                        <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* 3. Warna Label & Pengingat */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-2">Warna (Label)</label>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {COLOR_OPTIONS.map(c => (
                                            <button
                                                key={c.name}
                                                type="button"
                                                onClick={() => setAddForm({ ...addForm, color: c.hex })}
                                                className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                                                style={{ backgroundColor: c.hex }}
                                            >
                                                {addForm.color === c.hex && (
                                                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setAddModalOpen(false)}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
                                >
                                    Simpan Jadwal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* ── 5. MODAL: DETAIL EVENT & PROJECT POPUP ── */}
            {selectedItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                            <div className="space-y-1.5 min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                        className="px-2.5 py-0.5 rounded text-[10px] font-bold border"
                                        style={{
                                            backgroundColor: `${selectedItem.category_color}15`,
                                            borderColor: `${selectedItem.category_color}40`,
                                            color: selectedItem.category_color,
                                        }}
                                    >
                                        {selectedItem.category_name}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                        {selectedItem.type}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${selectedItem.status === 'Confirmed'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : selectedItem.status === 'Pending'
                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                            : 'bg-slate-100 text-slate-700 border-slate-200'
                                        }`}>
                                        {selectedItem.status}
                                    </span>
                                </div>
                                <h3 className="text-base font-black text-slate-900 leading-snug">
                                    {selectedItem.title}
                                </h3>
                                {selectedItem.project_number && (
                                    <p className="text-xs font-mono font-bold text-slate-500">
                                        {selectedItem.project_number} {selectedItem.project_name && selectedItem.project_name !== selectedItem.title ? `• ${selectedItem.project_name}` : ''}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Project Details Grid */}
                        <div className="space-y-2 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                            {/* Client Row */}
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-slate-400" />
                                    Klien:
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 text-right">{selectedItem.client_name}</span>
                                    {selectedItem.client_phone && (
                                        <a
                                            href={`https://wa.me/${selectedItem.client_phone.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-md text-[10px] font-bold inline-flex items-center gap-0.5 transition-colors"
                                            title="Chat WhatsApp"
                                        >
                                            <Phone className="w-3 h-3" />
                                            <span>WA</span>
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Package Row (if available) */}
                            {selectedItem.package_name && (
                                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                        <Package className="w-3.5 h-3.5 text-slate-400" />
                                        Paket:
                                    </span>
                                    <span className="font-bold text-slate-800 text-right">{selectedItem.package_name}</span>
                                </div>
                            )}

                            {/* Date Row */}
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                                    Tanggal:
                                </span>
                                <span className="font-bold text-slate-800">{formatDate(selectedItem.date)}</span>
                            </div>

                            {/* Time Row */}
                            {/* <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    Waktu:
                                </span>
                                <span className="font-bold text-slate-800">
                                    {selectedItem.start_time || '09:00'} - {selectedItem.end_time || 'Selesai'}
                                </span>
                            </div> */}

                            {/* Location Row */}
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                                <span className="text-slate-500 font-medium flex items-center gap-1.5 shrink-0">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    Lokasi:
                                </span>
                                <span className="font-bold text-slate-800 text-right truncate">
                                    {selectedItem.location || 'Lokasi belum ditentukan'}
                                </span>
                            </div>

                            {/* Total Amount & Payment Status (if available) */}
                            {/* {selectedItem.total_amount !== undefined && selectedItem.total_amount !== null && (
                                <div className="flex items-center justify-between gap-2 pt-0.5">
                                    <span className="text-slate-500 font-medium">Nilai / Status Bayar:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-black text-slate-900">
                                            {formatRupiah(selectedItem.total_amount)}
                                        </span>
                                        {selectedItem.payment_status && (
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                selectedItem.payment_status === 'paid'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : selectedItem.payment_status === 'partial'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}>
                                                {selectedItem.payment_status === 'paid'
                                                    ? 'Lunas'
                                                    : selectedItem.payment_status === 'partial'
                                                    ? 'DP / Sebagian'
                                                    : 'Belum Bayar'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )} */}

                            {/* Notes */}
                            {selectedItem.notes && (
                                <div className="pt-2 border-t border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                        Catatan / Konsep:
                                    </span>
                                    <p className="text-xs text-slate-700 whitespace-pre-line bg-white p-2.5 rounded-lg border border-slate-200/70">
                                        {selectedItem.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-1">
                            {selectedItem.project_id ? (
                                <Link
                                    href={`/projects/${String(selectedItem.project_id).replace('p-', '')}`}
                                    className="flex-1 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Buka Detail Project
                                </Link>
                            ) : null}
                            <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
