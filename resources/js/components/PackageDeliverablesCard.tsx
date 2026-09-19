import React, { useMemo } from 'react';
import { Package as PackageIcon, Check, Camera, HardDrive } from 'lucide-react';

export interface DeliverableItem {
    id: number | string;
    name: string;
    type: string;
    deadline: string;
    description?: string;
}

export interface AddonItem {
    name: string;
    qty?: number;
    unit?: string;
}

export interface PackageData {
    id?: string;
    name?: string;
    description?: string;
    included_services?: Array<string | { name?: string }>;
    included_deliverables?: Array<string | {
        id?: number | string;
        name?: string;
        type?: string;
        deadline?: string;
        target_deadline?: string;
        description?: string;
    }>;
}

interface PackageDeliverablesCardProps {
    packageData?: PackageData | null;
    packageName?: string;
    addons?: AddonItem[];
    className?: string;
    cardBg?: string;
    cardBorder?: string;
    fontHeading?: string;
    headingColor?: string;
}

export function PackageDeliverablesCard({
    packageData,
    packageName,
    addons = [],
    className = '',
    cardBg,
    cardBorder,
    fontHeading,
    headingColor,
}: PackageDeliverablesCardProps) {
    const resolvedPackageName = packageData?.name || packageName || 'Paket Standar';

    const servicesList = useMemo<string[]>(() => {
        if (
            packageData?.included_services &&
            Array.isArray(packageData.included_services) &&
            packageData.included_services.length > 0
        ) {
            return packageData.included_services.map((s: any) =>
                typeof s === 'string' ? s : (s?.name || String(s))
            );
        }
        return [];
    }, [packageData?.included_services]);

    const deliverablesList = useMemo<DeliverableItem[]>(() => {
        if (
            packageData?.included_deliverables &&
            Array.isArray(packageData.included_deliverables) &&
            packageData.included_deliverables.length > 0
        ) {
            return packageData.included_deliverables.map((item: any, idx: number) => {
                if (typeof item === 'string') {
                    return {
                        id: idx + 1,
                        name: item,
                        type: 'Photo',
                        deadline: 'H+14',
                        description: `Item deliverable standar untuk ${resolvedPackageName}`,
                    };
                }
                return {
                    id: item.id || idx + 1,
                    name: item.name || 'Deliverable',
                    type: item.type || 'Photo',
                    deadline: item.deadline || item.target_deadline || 'H+14',
                    description: item.description || `Item deliverable standar untuk ${resolvedPackageName}`,
                };
            });
        }
        return [];
    }, [packageData?.included_deliverables, resolvedPackageName]);

    const addonsList = useMemo<AddonItem[]>(() => {
        if (addons && Array.isArray(addons) && addons.length > 0) {
            return addons.map((a: any) => ({
                name: a.addon?.name || a.name || a.custom_name || 'Add-on Item',
                qty: a.qty || 1,
                unit: a.unit || 'item',
            }));
        }
        return [];
    }, [addons]);

    const getTypeBadgeClass = (type: string) => {
        const t = (type || '').toLowerCase();
        if (t.includes('video')) {
            return 'bg-cyan-50 text-cyan-700 border-cyan-200';
        }
        if (t.includes('album')) {
            return 'bg-amber-50 text-amber-700 border-amber-200';
        }
        if (t.includes('special')) {
            return 'bg-purple-50 text-purple-700 border-purple-200';
        }
        return 'bg-sky-50 text-sky-700 border-sky-200';
    };

    return (
        <div
            style={{
                backgroundColor: cardBg || '#FFFFFF',
                borderColor: cardBorder || undefined,
            }}
            className={`p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between ${className}`}
        >
            <div className="space-y-4">
                {/* Header Row */}
                <div className="border-b border-slate-100 pb-3.5 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                            <PackageIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <h4
                                style={{
                                    fontFamily: fontHeading ? `'${fontHeading}', sans-serif` : undefined,
                                    color: headingColor || undefined,
                                }}
                                className="font-bold text-sm sm:text-base text-slate-900 truncate leading-snug"
                            >
                                Layanan &amp; Deliverables Paket
                            </h4>
                            <span className="text-[11px] text-slate-400 block truncate">
                                Hasil &amp; produk akhir yang diserahkan ke klien
                            </span>
                        </div>
                    </div>
                    <span className="text-[11px] sm:text-xs font-bold px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100/90 shrink-0">
                        {resolvedPackageName}
                    </span>
                </div>

                {/* 2-Column Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs">
                    {/* Left: Layanan Termasuk */}
                    <div className="space-y-2.5">
                        <span className="text-[10px] sm:text-[10.5px] font-bold uppercase text-slate-400 block tracking-wider">
                            Layanan Termasuk
                        </span>
                        {servicesList.length === 0 ? (
                            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 text-center space-y-1">
                                <Camera className="w-5 h-5 text-slate-300 mx-auto" />
                                <p className="text-[11px] font-semibold text-slate-600">Dokumentasi Standar</p>
                                <p className="text-[10px] text-slate-400">Sesuai paket yang disepakati bersama tim</p>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                {servicesList.map((item: string, i: number) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/70 border border-slate-100/90 text-slate-700 font-medium text-[11px] sm:text-xs hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
                                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                                        </div>
                                        <span className="break-words whitespace-normal leading-relaxed">{item}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Item Deliverables (Hasil Akhir) */}
                    <div className="space-y-2.5">
                        <span className="text-[10px] sm:text-[10.5px] font-bold uppercase text-slate-400 block tracking-wider">
                            Item Deliverables (Hasil Akhir)
                        </span>
                        {deliverablesList.length === 0 ? (
                            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 text-center space-y-1">
                                <HardDrive className="w-5 h-5 text-slate-300 mx-auto" />
                                <p className="text-[11px] font-semibold text-slate-600">File Foto &amp; Google Drive</p>
                                <p className="text-[10px] text-slate-400">Target penyerahan file via cloud link resmi</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {deliverablesList.map((item: DeliverableItem) => {
                                    const badgeClass = getTypeBadgeClass(item.type);

                                    return (
                                        <div
                                            key={item.id}
                                            className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1.5 transition-all hover:bg-slate-50 hover:border-slate-300/80"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-bold text-slate-800 text-[11px] sm:text-xs leading-tight break-words whitespace-normal">
                                                    {item.name}
                                                </span>
                                                <span className="text-[9.5px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono shrink-0 border border-indigo-100/80">
                                                    {item.deadline}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 pt-0.5">
                                                <span className="text-[10.5px] text-slate-400 truncate max-w-[80%]">
                                                    {item.description || 'Item hasil serah terima'}
                                                </span>
                                                <span className={`text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded-md border ${badgeClass} shrink-0 tracking-wide`}>
                                                    {item.type}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Optional Add-ons Footer */}
            {addonsList.length > 0 && (
                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
                    <span className="font-semibold text-slate-700">Add-on Tambahan:</span>
                    <div className="flex flex-wrap gap-1.5 justify-end">
                        {addonsList.map((a: AddonItem, i: number) => (
                            <span
                                key={i}
                                className="px-2.5 py-0.5 rounded-lg bg-slate-100/80 text-slate-700 text-[10px] font-semibold border border-slate-200/70"
                            >
                                {a.name} ({a.qty} {a.unit || 'item'})
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default PackageDeliverablesCard;
