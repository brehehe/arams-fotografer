import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ShieldCheck, Search, Filter, Clock, User, FileText } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

interface ActivityLogIndexProps {
    activities: any;
    users: any[];
    filters: {
        user_id?: string;
        event?: string;
        search?: string;
    };
}

export default function ActivityLogIndex({
    activities = { data: [] },
    users = [],
    filters = {},
}: ActivityLogIndexProps) {
    const [search, setSearch] = useState(typeof filters?.search === 'string' ? filters.search : '');
    const [userId, setUserId] = useState(typeof filters?.user_id === 'string' ? filters.user_id : '');

    const handleFilter = () => {
        router.get(
            '/activity-log',
            { search, user_id: userId || undefined },
            { preserveState: true }
        );
    };

    return (
        <div className="space-y-6 pb-12">
            <Head title="Audit Trail & Activity Log - Arams Photography" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Activity Log & Audit Trail
                    </h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Rekam jejak seluruh mutasi data, pembuatan project, status update, dan transaksi sistem.
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="w-full sm:w-80 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                        placeholder="Cari aktivitas log..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#C89445] rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-hidden"
                    />
                </div>

                <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-medium">Filter Pengguna</span>
                    <select
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:border-[#C89445] outline-hidden cursor-pointer"
                    >
                        <option value="">Semua Pengguna</option>
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.name}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={handleFilter}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                    >
                        Filter
                    </button>
                </div>
            </div>

            {/* Timeline Activities List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="divide-y divide-slate-100">
                    {activities.data.map((act: any) => (
                        <div key={act.id} className="py-4 flex items-start gap-4 hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                                <Clock className="w-4 h-4 text-slate-500" />
                            </div>

                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-900 leading-snug">
                                    {act.description}
                                </p>
                                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                                    <span>Oleh: {act.causer?.name || 'Sistem'}</span>
                                    <span>•</span>
                                    <span>
                                        {new Date(act.created_at).toLocaleString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}{' '}
                                        WIB
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
