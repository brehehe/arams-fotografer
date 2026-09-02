import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Plus,
    MapPin,
    Clock,
    Camera,
    Users,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    Check,
    X,
    Bell,
    Share2,
    CalendarDays,
    Briefcase,
    Tag,
    Layers,
    FileText,
    ExternalLink,
    Trash2,
    Phone,
    Mail,
    MessageCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CalendarItem {
    id: string;
    schedule_id?: string | null;
    project_id: number | string;
    project_number?: string;
    title: string;
    client_name: string;
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
    notes: string | null;
    source?: string;
    color?: string;
    reminder_active?: boolean;
    reminder_time?: string;
}

interface ProjectOption {
    id: string | number;
    name: string;
    project_number?: string;
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

const TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function CalendarIndex({
    events = [],
    grouped = [],
    upcoming = [],
    projects_list = [],
    clients_list = [],
    schedule_summary = { total_week: 12, project: 8, meeting: 3, deadline: 1, other: 0 },
}: CalendarIndexProps) {
    // Current View State
    const [viewMode, setViewMode] = useState<'bulan' | 'minggu' | 'hari' | 'daftar'>('minggu');
    const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0);
    const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);

    // Modal & Drawer State
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [reminderDrawerOpen, setReminderDrawerOpen] = useState(false);
    const [activeReminderItem, setActiveReminderItem] = useState<CalendarItem | null>(null);

    // Reminder Form in Drawer
    const [reminderActive, setReminderActive] = useState(true);
    const [reminderTime, setReminderTime] = useState('30 menit sebelumnya');
    const [reminderSystem, setReminderSystem] = useState(true);
    const [reminderEmail, setReminderEmail] = useState(true);
    const [reminderWhatsapp, setReminderWhatsapp] = useState(true);
    const [whatsappNumber, setWhatsappNumber] = useState('+62 812-3456-7890');
    const [reminderRepeat, setReminderRepeat] = useState('Tidak diulang');

    // Add Schedule Form State
    const [addForm, setAddForm] = useState({
        title: '',
        type: 'Project',
        client_id: '',
        project_id: '',
        description: '',
        start_date: '2026-05-27',
        start_time: '09:00',
        end_date: '2026-05-27',
        end_time: '12:00',
        location: '',
        color: '#6366F1',
        reminder: '30 menit sebelumnya',
    });

    // Compute Days for the active Week
    // Base reference date: Wednesday, May 27, 2026 (or today shifted by week offset)
    const weekDays = useMemo(() => {
        const baseDate = new Date(2026, 4, 25); // May 25, 2026 (Monday)
        baseDate.setDate(baseDate.getDate() + (currentWeekOffset * 7));

        const days = [];
        const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];

        for (let i = 0; i < 7; i++) {
            const d = new Date(baseDate);
            d.setDate(baseDate.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const isToday = d.getDate() === 27 && d.getMonth() === 4 && d.getFullYear() === 2026;

            days.push({
                dayName: dayNames[i],
                dayNum: d.getDate(),
                monthName: monthNamesShort[d.getMonth()],
                year: d.getFullYear(),
                dateStr: dateStr,
                isToday: isToday,
            });
        }
        return days;
    }, [currentWeekOffset]);

    // Sample default events for the mock week if no backend events exist
    const defaultWeekEvents: CalendarItem[] = useMemo(() => {
        return [
            {
                id: 'evt-1',
                project_id: 'p-1',
                title: 'Project Wedding',
                client_name: 'Kevin & Jessica',
                category_name: 'Wedding',
                category_color: '#6366F1',
                date: '2026-05-25',
                start_time: '09:00',
                end_time: '12:00',
                location: 'Gedung Serbaguna',
                type: 'Project',
                type_raw: 'wedding',
                status: 'Confirmed',
                notes: 'Wedding ceremony and reception coverage.',
                color: 'purple',
                reminder_active: true,
            },
            {
                id: 'evt-2',
                project_id: 'p-2',
                title: 'Meeting Internal',
                client_name: 'Evaluasi Project',
                category_name: 'Meeting',
                category_color: '#EAB308',
                date: '2026-05-26',
                start_time: '10:00',
                end_time: '11:30',
                location: 'Office',
                type: 'Meeting',
                type_raw: 'meeting',
                status: 'Confirmed',
                notes: 'Evaluasi mingguan & pembagian jadwal fotografer.',
                color: 'yellow',
            },
            {
                id: 'evt-3',
                project_id: 'p-3',
                title: 'Project Prewedding',
                client_name: 'Rina & Andi',
                category_name: 'Prewedding',
                category_color: '#10B981',
                date: '2026-05-26',
                start_time: '14:00',
                end_time: '17:00',
                location: 'Kota Tua',
                type: 'Project',
                type_raw: 'prewedding',
                status: 'Confirmed',
                notes: 'Casual prewedding photoshoot.',
                color: 'green',
            },
            {
                id: 'evt-4',
                project_id: 'p-4',
                title: 'Project Family',
                client_name: 'Budi Santoso',
                category_name: 'Family',
                category_color: '#3B82F6',
                date: '2026-05-27',
                start_time: '09:00',
                end_time: '12:00',
                location: 'Taman Menteng',
                type: 'Project',
                type_raw: 'family',
                status: 'Confirmed',
                notes: 'Outdoor family photoshoot with props.',
                color: 'blue',
                reminder_active: true,
            },
            {
                id: 'evt-5',
                project_id: 'p-5',
                title: 'Deadline Editing',
                client_name: 'Wedding Day',
                category_name: 'Deadline',
                category_color: '#EF4444',
                date: '2026-05-27',
                start_time: '13:30',
                end_time: '17:00',
                location: 'Online',
                type: 'Deadline',
                type_raw: 'editing',
                status: 'Pending',
                notes: 'Final teaser & 50 edited master photos delivery.',
                color: 'red',
                reminder_active: true,
            },
            {
                id: 'evt-6',
                project_id: 'p-6',
                title: 'Project Birthday',
                client_name: 'Alya 1st Birthday',
                category_name: 'Birthday',
                category_color: '#8B5CF6',
                date: '2026-05-28',
                start_time: '11:00',
                end_time: '13:00',
                location: 'Studio Arams',
                type: 'Project',
                type_raw: 'birthday',
                status: 'Confirmed',
                notes: 'Smash cake photoshoot.',
                color: 'purple',
            },
            {
                id: 'evt-7',
                project_id: 'p-7',
                title: 'Meeting Client',
                client_name: 'Maternity Session',
                category_name: 'Meeting',
                category_color: '#EAB308',
                date: '2026-05-28',
                start_time: '15:00',
                end_time: '16:00',
                location: 'Office',
                type: 'Meeting',
                type_raw: 'meeting',
                status: 'Confirmed',
                notes: 'Moodboard and wardrobe consultation.',
                color: 'yellow',
            },
            {
                id: 'evt-8',
                project_id: 'p-8',
                title: 'Project Maternity',
                client_name: 'Dewi Lestari',
                category_name: 'Maternity',
                category_color: '#10B981',
                date: '2026-05-29',
                start_time: '09:00',
                end_time: '12:00',
                location: 'Studio Arams',
                type: 'Project',
                type_raw: 'maternity',
                status: 'Confirmed',
                notes: 'Studio glam maternity session.',
                color: 'green',
            },
            {
                id: 'evt-9',
                project_id: 'p-9',
                title: 'Review & Approval',
                client_name: 'Album Design',
                category_name: 'Review',
                category_color: '#3B82F6',
                date: '2026-05-29',
                start_time: '14:00',
                end_time: '16:00',
                location: 'Online',
                type: 'Meeting',
                type_raw: 'review',
                status: 'Confirmed',
                notes: 'Layout review before printing.',
                color: 'blue',
            },
            {
                id: 'evt-10',
                project_id: 'p-10',
                title: 'Project Event',
                client_name: 'Company Gathering',
                category_name: 'Corporate',
                category_color: '#F97316',
                date: '2026-05-30',
                start_time: '10:00',
                end_time: '16:00',
                location: 'Ancol, Jakarta',
                type: 'Event',
                type_raw: 'corporate',
                status: 'Confirmed',
                notes: 'Full day company gathering coverage.',
                color: 'orange',
            },
            {
                id: 'evt-11',
                project_id: 'p-11',
                title: 'Project Wedding',
                client_name: 'Andika & Sari',
                category_name: 'Wedding',
                category_color: '#EF4444',
                date: '2026-05-31',
                start_time: '09:00',
                end_time: '17:00',
                location: 'Gedung Graha',
                type: 'Project',
                type_raw: 'wedding',
                status: 'Confirmed',
                notes: 'Akad nikah & resepsi.',
                color: 'red',
            },
        ];
    }, []);

    // Combine backend events with demo items if events are empty
    const displayEvents = useMemo(() => {
        if (events && events.length > 0) {
            return events.map(e => {
                const lower = (e.type || e.category_name || '').toLowerCase();
                let cName = 'purple';
                if (lower.includes('meet')) cName = 'yellow';
                else if (lower.includes('prewed') || lower.includes('matern')) cName = 'green';
                else if (lower.includes('family') || lower.includes('review')) cName = 'blue';
                else if (lower.includes('dead') || lower.includes('edit')) cName = 'red';
                else if (lower.includes('event') || lower.includes('corp')) cName = 'orange';
                return { ...e, color: cName };
            });
        }
        return defaultWeekEvents;
    }, [events, defaultWeekEvents]);

    // Handle Submit Tambah Jadwal
    const handleAddScheduleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/calendar/schedules', {
            title: addForm.title,
            type: addForm.type.toLowerCase(),
            project_id: addForm.project_id || undefined,
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
                    start_date: '2026-05-27',
                    start_time: '09:00',
                    end_date: '2026-05-27',
                    end_time: '12:00',
                    location: '',
                    color: '#6366F1',
                    reminder: '30 menit sebelumnya',
                });
            }
        });
    };

    // Open reminder settings for an event
    const handleOpenReminder = (item: CalendarItem, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setActiveReminderItem(item);
        setReminderDrawerOpen(true);
    };

    // Helper to find color styles
    const getColorStyle = (colorName?: string) => {
        return COLOR_OPTIONS.find(c => c.name === colorName) || COLOR_OPTIONS[0];
    };

    return (
        <div className="space-y-6 pb-20">
            <Head title="Calendar & Schedule - Arams Pictures" />

            {/* ── 1. BREADCRUMBS & PAGE HEADER ── */}
            <div className="space-y-1">
                <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Link href="/calendar" className="hover:text-primary-accent transition-colors">
                        Calendar / Schedule
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-primary-accent font-semibold">Calendar</span>
                </nav>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Calendar / Schedule</h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Kelola dan lihat semua jadwal kegiatan, meeting, deadline, dan event penting.
                    </p>
                </div>
            </div>

            {/* ── 2. CALENDAR MAIN CONTAINER ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                {/* Top Calendar Toolbar */}
                <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-white">
                    {/* Left: Hari Ini, Arrows, Date Range Dropdown */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setCurrentWeekOffset(0)}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                        >
                            Hari ini
                        </button>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setCurrentWeekOffset(prev => prev - 1)}
                                className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setCurrentWeekOffset(prev => prev + 1)}
                                className="w-8 h-8 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Date Range Badge / Dropdown */}
                        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white shadow-2xs cursor-pointer">
                            <span>
                                {weekDays[0].dayNum} – {weekDays[6].dayNum} {weekDays[6].monthName} {weekDays[6].year}
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
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
                                    className={`px-3.5 py-1.5 rounded-lg capitalize transition-all cursor-pointer font-bold ${
                                        viewMode === mode
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
                            onClick={() => setAddModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Jadwal
                        </button>
                    </div>
                </div>

                {/* ── WEEKLY GRID VIEW ── */}
                {viewMode === 'minggu' && (
                    <div className="overflow-x-auto">
                        <div className="min-w-[900px]">
                            {/* Grid Day Headers (7 Columns) */}
                            <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-slate-200 bg-slate-50/40 text-center text-xs">
                                <div className="py-3 px-2 text-[11px] font-bold text-slate-400 border-r border-slate-100"></div>
                                {weekDays.map((day, idx) => (
                                    <div
                                        key={idx}
                                        className={`py-3 px-2 border-r border-slate-100 last:border-r-0 flex flex-col items-center gap-0.5 ${
                                            day.isToday ? 'bg-indigo-50/40' : ''
                                        }`}
                                    >
                                        <span className={`text-[11px] font-semibold ${day.isToday ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}>
                                            {day.dayName}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {day.isToday ? (
                                                <span className="w-6 h-6 rounded-full bg-[#3B46F1] text-white font-black text-xs flex items-center justify-center shadow-2xs">
                                                    {day.dayNum}
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-800">{day.dayNum}</span>
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
                                        <div className="py-2.5 px-3 text-[11px] font-bold text-slate-400 border-r border-slate-100 text-center">
                                            {time}
                                        </div>

                                        {/* 7 Day Slot Cells */}
                                        {weekDays.map((day, dayIdx) => {
                                            // Find events starting in this hour slot for this day
                                            const slotHour = parseInt(time.split(':')[0], 10);
                                            const cellEvents = displayEvents.filter(e => {
                                                if (e.date !== day.dateStr) return false;
                                                if (!e.start_time) return slotIdx === 0;
                                                const eventHour = parseInt(e.start_time.split(':')[0], 10);
                                                return eventHour === slotHour;
                                            });

                                            return (
                                                <div
                                                    key={dayIdx}
                                                    className={`border-r border-slate-100 last:border-r-0 p-1.5 relative ${
                                                        day.isToday ? 'bg-indigo-50/10' : ''
                                                    }`}
                                                >
                                                    {cellEvents.map(evt => {
                                                        const colorStyle = getColorStyle(evt.color);
                                                        return (
                                                            <div
                                                                key={evt.id}
                                                                onClick={() => setSelectedItem(evt)}
                                                                className="rounded-xl p-2.5 text-xs transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer border mb-1.5 space-y-1 relative group"
                                                                style={{
                                                                    backgroundColor: colorStyle.bg,
                                                                    borderColor: colorStyle.border,
                                                                    color: colorStyle.text,
                                                                }}
                                                            >
                                                                {/* Title + Dot */}
                                                                <div className="flex items-center justify-between gap-1">
                                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                                        <div
                                                                            className="w-2 h-2 rounded-full shrink-0"
                                                                            style={{ backgroundColor: colorStyle.dot }}
                                                                        />
                                                                        <span className="font-bold truncate text-[11px]" style={{ color: colorStyle.text }}>
                                                                            {evt.title}
                                                                        </span>
                                                                    </div>

                                                                    {/* Bell / Reminder icon */}
                                                                    {evt.reminder_active && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => handleOpenReminder(evt, e)}
                                                                            className="w-4 h-4 rounded text-rose-500 hover:text-rose-700 flex items-center justify-center shrink-0"
                                                                            title="Pengingat Aktif"
                                                                        >
                                                                            <Bell className="w-3 h-3" />
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                {/* Client / Subtitle */}
                                                                <p className="text-[10.5px] font-semibold opacity-90 truncate">
                                                                    {evt.client_name}
                                                                </p>

                                                                {/* Time range */}
                                                                <div className="text-[9.5px] font-medium opacity-80 flex items-center gap-1">
                                                                    <span>{evt.start_time || '09:00'} - {evt.end_time || '12:00'}</span>
                                                                </div>

                                                                {/* Location with Pin */}
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

                {/* ── DAFTAR / LIST VIEW ── */}
                {viewMode === 'daftar' && (
                    <div className="divide-y divide-slate-100 p-4 sm:p-6 space-y-4">
                        {displayEvents.map(evt => {
                            const colorStyle = getColorStyle(evt.color);
                            return (
                                <div
                                    key={evt.id}
                                    onClick={() => setSelectedItem(evt)}
                                    className="p-4 rounded-xl border border-slate-200/80 hover:border-indigo-200 transition-all flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold"
                                            style={{ backgroundColor: colorStyle.bg, color: colorStyle.dot }}
                                        >
                                            <CalendarIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-900 text-sm">{evt.title}</h4>
                                                <span
                                                    className="px-2 py-0.5 rounded text-[10px] font-bold"
                                                    style={{ backgroundColor: colorStyle.bg, color: colorStyle.dot }}
                                                >
                                                    {evt.type}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                {evt.client_name} · 📍 {evt.location || 'Studio'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
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
                )}
            </div>

            {/* ── 3. BOTTOM 3 SUMMARY CARDS (Jadwal Hari Ini, Upcoming, Ringkasan) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 3.1. Jadwal Hari Ini */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Jadwal Hari Ini</h3>
                            <p className="text-[11px] text-slate-400 font-medium">Rabu, 27 Mei 2026</p>
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
                        {/* Item 1 */}
                        <div className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors flex items-start justify-between gap-2 bg-slate-50/40">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span>09:00 - 12:00</span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-900">Project Family - Budi Santoso</h4>
                                <div className="text-[10.5px] text-slate-400 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    <span>Taman Menteng</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-blue-100">
                                    Berlangsung
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleOpenReminder(displayEvents[3])}
                                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                >
                                    <Bell className="w-3.5 h-3.5 text-indigo-600" />
                                </button>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors flex items-start justify-between gap-2 bg-slate-50/40">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                    <span>13:30 - 17:00</span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-900">Deadline Editing - Wedding Day</h4>
                                <div className="text-[10.5px] text-slate-400 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    <span>Online</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-rose-100">
                                    Mendatang
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleOpenReminder(displayEvents[4])}
                                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                >
                                    <Bell className="w-3.5 h-3.5 text-indigo-600" />
                                </button>
                            </div>
                        </div>
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
                        {/* Item 1 */}
                        <div className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors flex items-start justify-between gap-2 bg-slate-50/40">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    <span>Kam, 28 Mei 2026 - 11:00</span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-900">Project Birthday - Alya 1st Birthday</h4>
                                <div className="text-[10.5px] text-slate-400 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    <span>Studio Arams</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#EEF2FF] text-[#4F46E5] border border-indigo-100">
                                    Mendatang
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleOpenReminder(displayEvents[5])}
                                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                >
                                    <Bell className="w-3.5 h-3.5 text-indigo-600" />
                                </button>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors flex items-start justify-between gap-2 bg-slate-50/40">
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span>Jum, 29 Mei 2026 - 09:00</span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-900">Project Maternity - Dewi Lestari</h4>
                                <div className="text-[10.5px] text-slate-400 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    <span>Studio Arams</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#ECFDF5] text-[#059669] border border-emerald-100">
                                    Mendatang
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleOpenReminder(displayEvents[7])}
                                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                >
                                    <Bell className="w-3.5 h-3.5 text-indigo-600" />
                                </button>
                            </div>
                        </div>
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

            {/* ── 4. EXPLANATORY GUIDE BANNER (Where Reminder Appears) ── */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                <div className="text-center space-y-1">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Di mana saja reminder muncul selain di notifikasi?
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {/* Item 1 */}
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 space-y-3 flex flex-col justify-between">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[11px] flex items-center justify-center">1</span>
                                <h4 className="text-xs font-bold text-slate-900">Badge Reminder di Menu Calendar</h4>
                            </div>
                            <p className="text-[11px] text-slate-500">
                                Event yang memiliki reminder akan menampilkan ikon lonceng kecil di dalam event.
                            </p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
                            <div>
                                <span className="font-bold text-xs text-slate-900 block">Project Family</span>
                                <span className="text-[10px] text-slate-500">Budi Santoso · 09:00 - 12:00</span>
                            </div>
                            <div className="w-7 h-7 rounded-lg border border-rose-200 bg-rose-50 flex items-center justify-center">
                                <Bell className="w-3.5 h-3.5 text-rose-500" />
                            </div>
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 space-y-3 flex flex-col justify-between">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[11px] flex items-center justify-center">2</span>
                                <h4 className="text-xs font-bold text-slate-900">Daftar Jadwal Hari Ini</h4>
                            </div>
                            <p className="text-[11px] text-slate-500">
                                Event dengan reminder akan muncul di bagian "Jadwal Hari Ini" dengan ikon lonceng.
                            </p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
                            <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-blue-600 block">09:00 - 12:00</span>
                                <span className="font-bold text-xs text-slate-900 block">Project Family - Budi Santoso</span>
                            </div>
                            <Bell className="w-4 h-4 text-indigo-600" />
                        </div>
                    </div>

                    {/* Item 3 */}
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 space-y-3 flex flex-col justify-between">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[11px] flex items-center justify-center">3</span>
                                <h4 className="text-xs font-bold text-slate-900">Widget Upcoming Jadwal</h4>
                            </div>
                            <p className="text-[11px] text-slate-500">
                                Event dengan reminder akan ditandai dengan ikon lonceng di widget Upcoming dashboard.
                            </p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
                            <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-purple-600 block">Rabu, 27 Mei 2026 · 09:00</span>
                                <span className="font-bold text-xs text-slate-900 block">Project Family - Budi Santoso</span>
                            </div>
                            <Bell className="w-4 h-4 text-indigo-600" />
                        </div>
                    </div>

                    {/* Item 4 */}
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 space-y-3 flex flex-col justify-between">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[11px] flex items-center justify-center">4</span>
                                <h4 className="text-xs font-bold text-slate-900">Detail Project / Order</h4>
                            </div>
                            <p className="text-[11px] text-slate-500">
                                Reminder event juga akan tampil di tab timeline atau detail project terkait.
                            </p>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between shadow-2xs">
                            <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-slate-500 block">Rabu, 27 Mei 2026 · 09:00 - 12:00</span>
                                <span className="font-bold text-xs text-slate-900 block">Project Family</span>
                            </div>
                            <div className="w-6 h-6 rounded-lg border border-rose-200 bg-rose-50 flex items-center justify-center">
                                <Bell className="w-3 h-3 text-rose-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* ── 5. MODAL: TAMBAH JADWAL (Screenshot 2) ── */}
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
                                            onChange={(e) => setAddForm({ ...addForm, client_id: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                        >
                                            <option value="">Pilih klien (opsional)</option>
                                            {clients_list.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">Project / Order</label>
                                        <select
                                            value={addForm.project_id}
                                            onChange={(e) => setAddForm({ ...addForm, project_id: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                        >
                                            <option value="">Pilih project (opsional)</option>
                                            {projects_list.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
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

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Pengingat / Reminder</label>
                                    <select
                                        value={addForm.reminder}
                                        onChange={(e) => setAddForm({ ...addForm, reminder: e.target.value })}
                                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                    >
                                        <option value="30 menit sebelumnya">30 menit sebelumnya</option>
                                        <option value="1 jam sebelumnya">1 jam sebelumnya</option>
                                        <option value="1 hari sebelumnya">1 hari sebelumnya</option>
                                        <option value="Tidak ada">Tidak ada</option>
                                    </select>
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
            {/* ── 6. SLIDE-OVER DRAWER: PENGINGAT / REMINDER (Screenshot 3) ── */}
            {reminderDrawerOpen && (
                <div
                    className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
                    onClick={() => setReminderDrawerOpen(false)}
                >
                    <div
                        className="bg-white w-full max-w-sm h-full p-6 shadow-2xl overflow-y-auto space-y-6 flex flex-col justify-between"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="space-y-6">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h3 className="text-base font-black text-slate-900">Pengingat / Reminder</h3>
                                <button
                                    type="button"
                                    onClick={() => setReminderDrawerOpen(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Toggle Aktifkan Pengingat */}
                            <div className="space-y-2">
                                <span className="text-xs font-bold text-slate-700 block">Atur Pengingat</span>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="text-xs font-semibold text-slate-800">Aktifkan Pengingat</span>
                                    <button
                                        type="button"
                                        onClick={() => setReminderActive(!reminderActive)}
                                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                                            reminderActive ? 'bg-[#4F46E5]' : 'bg-slate-300'
                                        }`}
                                    >
                                        <div
                                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                                reminderActive ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Waktu Pengingat */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 block">Waktu Pengingat</label>
                                <select
                                    value={reminderTime}
                                    onChange={(e) => setReminderTime(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                >
                                    <option value="15 menit sebelumnya">15 menit sebelumnya</option>
                                    <option value="30 menit sebelumnya">30 menit sebelumnya</option>
                                    <option value="1 jam sebelumnya">1 jam sebelumnya</option>
                                    <option value="1 hari sebelumnya">1 hari sebelumnya</option>
                                </select>
                            </div>

                            {/* Metode Pengingat */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-700 block">Metode Pengingat</label>

                                {/* Notifikasi Sistem */}
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={reminderSystem}
                                        onChange={(e) => setReminderSystem(e.target.checked)}
                                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-slate-900 block">Notifikasi Sistem</span>
                                        <span className="text-[11px] text-slate-400 block">Notifikasi akan muncul di bell icon</span>
                                    </div>
                                </label>

                                {/* Email */}
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={reminderEmail}
                                        onChange={(e) => setReminderEmail(e.target.checked)}
                                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-slate-900 block">Email</span>
                                        <span className="text-[11px] text-slate-400 block">Pengingat akan dikirim ke email terkait</span>
                                    </div>
                                </label>

                                {/* WhatsApp */}
                                <div className="space-y-2">
                                    <label className="flex items-start gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={reminderWhatsapp}
                                            onChange={(e) => setReminderWhatsapp(e.target.checked)}
                                            className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                        />
                                        <div>
                                            <span className="text-xs font-bold text-slate-900 block">WhatsApp (Opsional)</span>
                                            <span className="text-[11px] text-slate-400 block">Pengingat akan dikirim via WhatsApp</span>
                                        </div>
                                    </label>
                                    {reminderWhatsapp && (
                                        <input
                                            type="text"
                                            value={whatsappNumber}
                                            onChange={(e) => setWhatsappNumber(e.target.value)}
                                            className="w-full pl-3.5 pr-3 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Ulangi Pengingat */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 block">
                                    Ulangi Pengingat (Jika belum ditandai selesai)
                                </label>
                                <select
                                    value={reminderRepeat}
                                    onChange={(e) => setReminderRepeat(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                                >
                                    <option value="Tidak diulang">Tidak diulang</option>
                                    <option value="Setiap 15 menit">Setiap 15 menit</option>
                                    <option value="Setiap 1 jam">Setiap 1 jam</option>
                                </select>
                            </div>

                            {/* Preview Pengingat Box */}
                            <div className="space-y-1.5">
                                <span className="text-xs font-bold text-slate-700 block">Preview Pengingat</span>
                                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs">
                                    <span className="font-bold text-slate-900 block">
                                        {activeReminderItem?.title || 'Project Family - Budi Santoso'}
                                    </span>
                                    <span className="text-[11px] text-slate-500 block">
                                        Rabu, 27 Mei 2026 · {activeReminderItem?.start_time || '09:00'} - {activeReminderItem?.end_time || '12:00'}
                                    </span>
                                    <div className="flex items-center gap-1.5 pt-1.5 text-[11px] font-bold text-indigo-600">
                                        <Bell className="w-3.5 h-3.5" />
                                        <span>Pengingat akan dikirim 30 menit sebelumnya (08:30)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setReminderDrawerOpen(false)}
                                className="flex-1 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer text-center"
                            >
                                Simpan Pengaturan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════ */}
            {/* ── 7. MODAL: DETAIL EVENT POPUP ── */}
            {selectedItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                                    {selectedItem.type}
                                </span>
                                <h3 className="text-base font-black text-slate-900 mt-1">{selectedItem.title}</h3>
                                <p className="text-xs text-slate-500 font-semibold">{selectedItem.client_name}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedItem(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-2.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Tanggal:</span>
                                <span className="font-bold text-slate-800">{formatDate(selectedItem.date)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Waktu:</span>
                                <span className="font-bold text-slate-800">{selectedItem.start_time || '09:00'} - {selectedItem.end_time || '12:00'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Lokasi:</span>
                                <span className="font-bold text-slate-800">{selectedItem.location || 'Studio'}</span>
                            </div>
                            {selectedItem.notes && (
                                <div className="pt-2 border-t border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Catatan:</span>
                                    <p className="text-xs text-slate-700">{selectedItem.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const it = selectedItem;
                                    setSelectedItem(null);
                                    handleOpenReminder(it);
                                }}
                                className="flex-1 py-2 border border-indigo-200 hover:bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                                <Bell className="w-3.5 h-3.5" />
                                Atur Reminder
                            </button>
                            {selectedItem.project_id && (
                                <Link
                                    href={`/projects/${String(selectedItem.project_id).replace('p-', '')}`}
                                    className="flex-1 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Buka Project
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
