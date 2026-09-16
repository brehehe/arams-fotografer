import { Camera, Video, Image as ImageIcon, Film, Users, Plus, Trash2, ShieldCheck, UserCheck } from 'lucide-react';
import React from 'react';
import { Input } from '@/components/ui/input';
import { SelectSearch } from '@/components/ui/select-search';
import type { SelectSearchOption } from '@/components/ui/select-search';
import { Textarea } from '@/components/ui/textarea';

export type TeamRoleType = 'Photografer' | 'Videografer' | 'Editor Foto' | 'Editor Video' | 'Crew';

export interface TeamAssignmentItem {
    id: string;
    type: TeamRoleType;
    name: string;
}

export const TEAM_ROLE_OPTIONS: Array<{ value: TeamRoleType; label: string; icon: string }> = [
    { value: 'Photografer', label: 'Photografer', icon: '📸' },
    { value: 'Videografer', label: 'Videografer', icon: '🎥' },
    { value: 'Editor Foto', label: 'Editor Foto', icon: '🖼️' },
    { value: 'Editor Video', label: 'Editor Video', icon: '🎬' },
    { value: 'Crew', label: 'Crew', icon: '👥' },
];

export const getRoleIcon = (type: TeamRoleType) => {
    switch (type) {
        case 'Photografer':
            return <Camera className="w-3.5 h-3.5 text-blue-500" />;
        case 'Videografer':
            return <Video className="w-3.5 h-3.5 text-purple-500" />;
        case 'Editor Foto':
            return <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />;
        case 'Editor Video':
            return <Film className="w-3.5 h-3.5 text-amber-500" />;
        case 'Crew':
        default:
            return <Users className="w-3.5 h-3.5 text-slate-500" />;
    }
};

interface ProjectTeamAssignmentSectionProps {
    supervisorId: string;
    setSupervisorId: (val: string) => void;
    supervisorOptions: SelectSearchOption[];
    teamAssignments: TeamAssignmentItem[];
    setTeamAssignments: React.Dispatch<React.SetStateAction<TeamAssignmentItem[]>>;
    teamSuggestions?: Array<{ id: string; name: string; role?: string }>;
    assignmentNotes: string;
    setAssignmentNotes: (val: string) => void;
    idPrefix?: string;
}

let teamIdCounter = 0;
const generateTeamId = () => {
    teamIdCounter += 1;

    return `team-${teamIdCounter}-${Math.random().toString(36).slice(2, 7)}`;
};

export function ProjectTeamAssignmentSection({
    supervisorId,
    setSupervisorId,
    supervisorOptions,
    teamAssignments,
    setTeamAssignments,
    teamSuggestions = [],
    assignmentNotes,
    setAssignmentNotes,
    idPrefix = 'proj',
}: ProjectTeamAssignmentSectionProps) {
    const handleAddPersonnel = (role: TeamRoleType = 'Photografer') => {
        const newItem: TeamAssignmentItem = {
            id: generateTeamId(),
            type: role,
            name: '',
        };
        setTeamAssignments((prev) => [...prev, newItem]);
    };

    const handleRemovePersonnel = (index: number) => {
        if (teamAssignments.length <= 1) {
            // Keep at least 1 empty row
            setTeamAssignments([{ id: generateTeamId(), type: 'Photografer', name: '' }]);

            return;
        }

        setTeamAssignments((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleUpdatePersonnel = (index: number, field: 'type' | 'name', val: any) => {
        setTeamAssignments((prev) =>
            prev.map((item, idx) => (idx === index ? { ...item, [field]: val } : item))
        );
    };

    const datalistId = `${idPrefix}-team-suggestions`;

    return (
        <div className="space-y-4 text-xs">
            {/* 1. SUPERVISOR UTAMA */}
            <div className="space-y-1.5 min-w-0 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Supervisor Penanggung Jawab</span>
                        <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Pengawas utama project</span>
                </div>
                <SelectSearch
                    options={supervisorOptions}
                    value={supervisorId}
                    onChange={setSupervisorId}
                    placeholder="Pilih Supervisor Penanggung Jawab..."
                    searchPlaceholder="Cari nama supervisor..."
                    clearable={false}
                    className="w-full bg-white"
                />
            </div>

            {/* 2. MULTIPLE TIM PERSONIL */}
            <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100">
                    <div>
                        <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-[#4F46E5]" />
                            <span>Personil Tim Bertugas</span>
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                {teamAssignments.filter((t) => t.name.trim()).length} dari {teamAssignments.length} Terisi
                            </span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            Pilih tipe peran dan nama personil (Photografer, Videografer, Editor, Crew).
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => handleAddPersonnel('Photografer')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] rounded-xl text-xs font-bold transition-colors cursor-pointer border border-indigo-100 self-start sm:self-auto shrink-0"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Personil</span>
                    </button>
                </div>

                <datalist id={datalistId}>
                    {teamSuggestions.map((member) => (
                        <option key={member.id} value={member.name}>
                            {member.name} {member.role ? `(${member.role})` : ''}
                        </option>
                    ))}
                </datalist>

                {/* List of Personnel Items */}
                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-0.5">
                    {teamAssignments.map((item, idx) => (
                        <div
                            key={item.id || idx}
                            className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all space-y-2"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-indigo-50 text-[#4F46E5] font-mono font-bold text-[11px] flex items-center justify-center border border-indigo-100 shrink-0">
                                        #{idx + 1}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                        {getRoleIcon(item.type)}
                                        <span>Peran: {item.type}</span>
                                    </span>
                                </div>

                                {teamAssignments.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemovePersonnel(idx)}
                                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                        title="Hapus personil ini"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                                {/* Tipe Selector (col-span-12 sm:col-span-4) */}
                                <div className="sm:col-span-4 min-w-0">
                                    <div className="relative">
                                        <select
                                            value={item.type}
                                            onChange={(e) => handleUpdatePersonnel(idx, 'type', e.target.value as TeamRoleType)}
                                            className="w-full h-[40px] px-3 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-hidden focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-colors"
                                        >
                                            {TEAM_ROLE_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.icon} {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Nama Input with suggestions (col-span-12 sm:col-span-8) */}
                                <div className="sm:col-span-8 min-w-0">
                                    <Input
                                        value={item.name}
                                        onChange={(e) => handleUpdatePersonnel(idx, 'name', e.target.value)}
                                        placeholder={`Ketik atau pilih nama ${item.type.toLowerCase()}...`}
                                        className="h-[40px] text-xs bg-slate-50/50 focus:bg-white"
                                        list={datalistId}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Add presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] font-semibold text-slate-400">Tambah cepat:</span>
                    {TEAM_ROLE_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleAddPersonnel(opt.value)}
                            className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-[#4F46E5] text-slate-600 transition-colors cursor-pointer border border-slate-200/60"
                        >
                            + {opt.icon} {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. CATATAN PENUGASAN */}
            <div className="space-y-1.5 min-w-0 pt-2 border-t border-slate-100">
                <label className="text-[11px] font-bold text-slate-600 block">Catatan Penugasan Tim &amp; Peralatan</label>
                <Textarea
                    minRows={2}
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    placeholder="Catatan khusus pembagian tugas, rundown penugasan, atau perlengkapan tim..."
                    className="text-xs"
                />
            </div>
        </div>
    );
}
