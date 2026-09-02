import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Briefcase,
    Calendar,
    ChevronLeft,
    DollarSign,
    HeartHandshake,
    Layers,
    MapPin,
    Package as PackageIcon,
    Plus,
    Minus,
    Search,
    Sparkles,
    Trash2,
    User as UserIcon,
    Users,
    Video,
    Camera,
    FileText,
    Percent,
    ArrowRight,
    CheckCircle2,
    Receipt,
    HelpCircle,
    X,
    Edit3,
} from 'lucide-react';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { SelectSearch } from '@/components/ui/select-search';
import { formatRupiah } from '@/lib/formatters';

interface ClientItem {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    city?: string | null;
    instagram?: string | null;
}

interface CategoryItem {
    id: string;
    name: string;
    color: string;
    slug?: string;
    workflow_type?: string;
}

interface PackageItem {
    id: string;
    name: string;
    category_id: string;
    base_price: number | string;
    duration_hours?: number;
    description?: string;
}

interface WeddingOrganizerItem {
    id: string;
    name: string;
    pic_name?: string | null;
    phone?: string | null;
    city?: string | null;
    tier?: string;
}

interface AddonItem {
    id: string;
    name: string;
    category_id?: string | null;
    category?: { id: string; name: string } | null;
    price: number | string;
    unit: string;
    description?: string | null;
}

interface UserItem {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role?: string;
}

interface NoteTemplateItem {
    id: string;
    title: string;
    content: string;
    type: string;
}

interface ProjectsEditProps {
    project: any;
    clients: ClientItem[];
    categories: CategoryItem[];
    packages: PackageItem[];
    wedding_organizers: WeddingOrganizerItem[];
    addons: AddonItem[];
    team_members: UserItem[];
    note_templates: NoteTemplateItem[];
}

interface SelectedAddon {
    id: string;
    name: string;
    unit_price: number;
    qty: number;
    unit: string;
    total_price: number;
    is_custom?: boolean;
}

interface CustomFeeItem {
    tempId: string;
    name: string;
    unit_price: number;
    qty: number;
    unit: string;
}

export default function ProjectsEdit({
    project,
    clients = [],
    categories = [],
    packages = [],
    wedding_organizers = [],
    addons = [],
    team_members = [],
    note_templates = [],
}: ProjectsEditProps) {
    const [submitting, setSubmitting] = useState(false);

    // Initial addon processing
    const initialCatalogAddons: SelectedAddon[] = useMemo(() => {
        if (!project.project_addons || !Array.isArray(project.project_addons)) return [];
        return project.project_addons
            .filter((a: any) => a.addon_id)
            .map((a: any) => ({
                id: String(a.addon_id),
                name: a.addon?.name || a.custom_name || 'Add-on',
                unit_price: Number(a.unit_price) || 0,
                qty: Number(a.qty) || 1,
                unit: a.unit || a.addon?.unit || 'item',
                total_price: Number(a.total_price) || (Number(a.unit_price) * (Number(a.qty) || 1)),
                is_custom: false,
            }));
    }, [project.project_addons]);

    const initialCustomFees: CustomFeeItem[] = useMemo(() => {
        if (!project.project_addons || !Array.isArray(project.project_addons)) return [];
        return project.project_addons
            .filter((a: any) => !a.addon_id)
            .map((a: any, idx: number) => ({
                tempId: `custom_init_${idx}_${Date.now()}`,
                name: a.custom_name || '',
                unit_price: Number(a.unit_price) || 0,
                qty: Number(a.qty) || 1,
                unit: a.unit || 'item',
            }));
    }, [project.project_addons]);

    // Form states pre-filled from project
    const [clientId, setClientId] = useState<string>(project.client_id || (clients[0]?.id ?? ''));
    const [referralValue, setReferralValue] = useState<string>(
        project.wedding_organizer_id ? `wo_${project.wedding_organizer_id}` : (project.source ? `source_${project.source}` : '')
    );
    const [projectName, setProjectName] = useState<string>(project.name || '');
    const [categoryId, setCategoryId] = useState<string>(
        project.category_id || (categories[0]?.id ?? '')
    );
    const [packageId, setPackageId] = useState<string>(project.package_id || '');
    const [status, setStatus] = useState<string>(project.status || 'draft');
    const [eventDate, setEventDate] = useState<string>(
        project.event_date ? String(project.event_date).split('T')[0] : ''
    );
    const [eventTime, setEventTime] = useState<string>(project.event_time || '');
    const [endDate, setEndDate] = useState<string>(
        project.end_date ? String(project.end_date).split('T')[0] : ''
    );
    const [deadline, setDeadline] = useState<string>(
        project.deadline ? String(project.deadline).split('T')[0] : ''
    );
    const [location, setLocation] = useState<string>(project.location || '');

    // Crew assignments
    const [photographerId, setPhotographerId] = useState<string>(project.photographer_id || '');
    const [editorId, setEditorId] = useState<string>(project.editor_id || '');
    const [supervisorId, setSupervisorId] = useState<string>(project.supervisor_id || '');

    // Financial calculations
    const [basePrice, setBasePrice] = useState<number>(Number(project.price) || 0);
    const [discount, setDiscount] = useState<number>(Number(project.discount) || 0);
    const [tax, setTax] = useState<number>(Number(project.tax) || 0);
    const [notes, setNotes] = useState<string>(project.notes || '');

    // Timeline States (Default vs Custom Mode)
    const initialTimelineMode = (project.custom_timeline as any)?.mode || 'default';
    const savedSteps = (project.custom_timeline as any)?.steps || [];
    const initialCustomStepDates = useMemo(() => {
        const map: Record<number, string> = {};
        if (Array.isArray(savedSteps)) {
            savedSteps.forEach((s: any) => {
                if (s.step && s.date) {
                    map[s.step] = s.date;
                }
            });
        }
        return map;
    }, [savedSteps]);

    const [timelineMode, setTimelineMode] = useState<'default' | 'custom'>(initialTimelineMode);
    const [customStepDates, setCustomStepDates] = useState<Record<number, string>>(initialCustomStepDates);

    // Addons State: Catalog Addons + Custom Fees
    const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>(initialCatalogAddons);
    const [customFees, setCustomFees] = useState<CustomFeeItem[]>(initialCustomFees);
    const [addonSearch, setAddonSearch] = useState<string>('');
    const [addonTab, setAddonTab] = useState<'catalog' | 'custom'>('catalog');

    // Filtered packages based on category
    const availablePackages = useMemo(() => {
        if (!categoryId) return packages;
        return packages.filter((p) => String(p.category_id) === String(categoryId));
    }, [packages, categoryId]);

    // Selected client object
    const selectedClient = useMemo(() => {
        return clients.find((c) => String(c.id) === String(clientId));
    }, [clients, clientId]);

    // Selected category object
    const selectedCategory = useMemo(() => {
        return categories.find((c) => String(c.id) === String(categoryId));
    }, [categories, categoryId]);

    // Determine Wedding vs Non-Wedding workflow
    const isWeddingCategory = useMemo(() => {
        if (!selectedCategory) return false;
        return (
            selectedCategory.workflow_type === 'wedding' ||
            (selectedCategory.slug?.includes('wedding') && !selectedCategory.slug?.includes('prewedding')) ||
            (selectedCategory.name?.toLowerCase().includes('wedding') && !selectedCategory.name?.toLowerCase().includes('prewedding'))
        );
    }, [selectedCategory]);

    const activeWorkflowSteps = useMemo(() => {
        const WEDDING_STEPS = [
            { step: 1, title: '1. Booking & DP', desc: 'Konfirmasi jadwal & DP', offsetDays: 0, isEventRelative: 'created', dotColor: 'bg-emerald-500' },
            { step: 2, title: '2. TM Wedding', desc: 'Technical meeting rundown', offsetDays: -7, isEventRelative: 'event', dotColor: 'bg-indigo-500' },
            { step: 3, title: '3. Hari H', desc: 'Sesi foto & video wedding', offsetDays: 0, isEventRelative: 'event', dotColor: 'bg-blue-500' },
            { step: 4, title: '4. Sneak Peek Photo Editing', desc: 'Kurasi foto sneak peek', offsetDays: 3, isEventRelative: 'event', dotColor: 'bg-amber-500' },
            { step: 5, title: '5. Flashdrive + Box Delivery', desc: 'Pengiriman flashdrive & box', offsetDays: 14, isEventRelative: 'event', dotColor: 'bg-orange-500' },
            { step: 6, title: '6. Full Version Photo & Video Editing', desc: 'Full edit retouch & video', offsetDays: 28, isEventRelative: 'event', dotColor: 'bg-purple-500' },
            { step: 7, title: '7. Album Layout Editing', desc: 'Layouting album cetak', offsetDays: 35, isEventRelative: 'event', dotColor: 'bg-pink-500' },
            { step: 8, title: '8. Final Delivery', desc: 'Serah terima album & link master', offsetDays: 45, isEventRelative: 'deadline_or_event', dotColor: 'bg-emerald-600' },
        ];

        const NON_WEDDING_STEPS = [
            { step: 1, title: '1. Booking & DP', desc: 'Konfirmasi jadwal & DP', offsetDays: 0, isEventRelative: 'created', dotColor: 'bg-emerald-500' },
            { step: 2, title: '2. Meeting / Preparation Concept', desc: 'Konsep, moodboard & wardrobe', offsetDays: -5, isEventRelative: 'event', dotColor: 'bg-indigo-500' },
            { step: 3, title: '3. Hari H', desc: 'Sesi pemotretan di lokasi', offsetDays: 0, isEventRelative: 'event', dotColor: 'bg-blue-500' },
            { step: 4, title: '4. Full Version Photo & Video Editing', desc: 'Retouching tone & video', offsetDays: 20, isEventRelative: 'event', dotColor: 'bg-purple-500' },
            { step: 5, title: '5. Final Delivery', desc: 'Serah terima link & file master', offsetDays: 30, isEventRelative: 'deadline_or_event', dotColor: 'bg-emerald-500' },
        ];

        return isWeddingCategory ? WEDDING_STEPS : NON_WEDDING_STEPS;
    }, [isWeddingCategory]);

    const calculateStepDate = (stepDef: any, evDate: string, dlDate: string, createdDate?: string) => {
        if (stepDef.isEventRelative === 'created') {
            return createdDate ? createdDate.split('T')[0] : (project.created_at ? String(project.created_at).split('T')[0] : new Date().toISOString().split('T')[0]);
        }
        if (!evDate) return '';
        if (stepDef.isEventRelative === 'deadline_or_event' && dlDate) {
            return dlDate.split('T')[0];
        }
        const d = new Date(evDate);
        d.setDate(d.getDate() + stepDef.offsetDays);
        return d.toISOString().split('T')[0];
    };

    const getEffectiveStepDate = (stepDef: any) => {
        if (timelineMode === 'custom' && customStepDates[stepDef.step]) {
            return customStepDates[stepDef.step];
        }
        return calculateStepDate(stepDef, eventDate, deadline, project.created_at);
    };

    const formatStepDisplayDate = (dateStr: string, fallback: string) => {
        if (!dateStr) return fallback;
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return fallback;
        }
    };

    const handleResetTimelineToDefault = () => {
        setTimelineMode('default');
        setCustomStepDates({});
        toast.success('Estimasi timeline dikembalikan ke mode default.');
    };

    // Handle package selection
    const handlePackageChange = (pId: string) => {
        setPackageId(pId);
        const pkg = packages.find((p) => String(p.id) === String(pId));
        if (pkg) {
            setBasePrice(Number(pkg.base_price) || 0);
        }
    };

    // Addon calculation (Catalog + Custom)
    const totalCatalogAddons = useMemo(() => {
        return selectedAddons.reduce((acc, curr) => acc + curr.total_price, 0);
    }, [selectedAddons]);

    const totalCustomFees = useMemo(() => {
        return customFees.reduce((acc, curr) => acc + (curr.unit_price * curr.qty), 0);
    }, [customFees]);

    const totalAllAddonsPrice = useMemo(() => {
        return totalCatalogAddons + totalCustomFees;
    }, [totalCatalogAddons, totalCustomFees]);

    // Grand total calculation
    const grandTotal = useMemo(() => {
        const total = Number(basePrice || 0) + totalAllAddonsPrice - Number(discount || 0) + Number(tax || 0);
        return total > 0 ? total : 0;
    }, [basePrice, totalAllAddonsPrice, discount, tax]);

    // Catalog Addon Handlers
    const handleToggleAddon = (addon: AddonItem) => {
        const exists = selectedAddons.find((a) => a.id === addon.id);
        if (exists) {
            setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
        } else {
            const price = Number(addon.price) || 0;
            setSelectedAddons([
                ...selectedAddons,
                {
                    id: addon.id,
                    name: addon.name,
                    unit_price: price,
                    qty: 1,
                    unit: addon.unit,
                    total_price: price,
                    is_custom: false,
                },
            ]);
        }
    };

    const handleQtyChange = (addonId: string, delta: number) => {
        setSelectedAddons(
            selectedAddons
                .map((a) => {
                    if (a.id === addonId) {
                        const newQty = a.qty + delta;
                        if (newQty < 1) return null;
                        return {
                            ...a,
                            qty: newQty,
                            total_price: newQty * a.unit_price,
                        };
                    }
                    return a;
                })
                .filter(Boolean) as SelectedAddon[]
        );
    };

    const handleDirectQtyInput = (addonId: string, newQty: number) => {
        const validQty = Math.max(1, newQty);
        setSelectedAddons(
            selectedAddons.map((a) => {
                if (a.id === addonId) {
                    return {
                        ...a,
                        qty: validQty,
                        total_price: validQty * a.unit_price,
                    };
                }
                return a;
            })
        );
    };

    // Custom Fee Handlers
    const handleAddCustomFeeRow = () => {
        const newFee: CustomFeeItem = {
            tempId: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            name: '',
            unit_price: 250000,
            qty: 1,
            unit: 'item',
        };
        setCustomFees([...customFees, newFee]);
        setAddonTab('custom');
    };

    const handleUpdateCustomFee = (tempId: string, field: keyof CustomFeeItem, value: any) => {
        setCustomFees(
            customFees.map((fee) => {
                if (fee.tempId === tempId) {
                    return { ...fee, [field]: value };
                }
                return fee;
            })
        );
    };

    const handleRemoveCustomFee = (tempId: string) => {
        setCustomFees(customFees.filter((fee) => fee.tempId !== tempId));
    };

    // Note template loader
    const handleSelectTemplate = (templateId: string) => {
        const tpl = note_templates.find((t) => String(t.id) === String(templateId));
        if (tpl) {
            setNotes((prev) => (prev ? `${prev}\n\n${tpl.content}` : tpl.content));
            toast.success(`Template "${tpl.title}" diterapkan.`);
        }
    };

    // Build Referral Options (Clients + WO + General)
    const referralOptions = useMemo(() => {
        const list = [
            { value: '', label: '-- Tanpa Referensi (Direct / Walk-in) --', subtitle: 'Klien datang langsung' },
            { value: 'source_instagram', label: 'Instagram / Media Sosial', subtitle: 'Direct via DM / Feed' },
            { value: 'source_website', label: 'Website / Google Search', subtitle: 'Direct online booking' },
            { value: 'source_family', label: 'Teman / Rekomendasi Keluarga', subtitle: 'Word of mouth' },
        ];

        const otherClients = clients.filter((c) => c.id !== clientId);
        if (otherClients.length > 0) {
            otherClients.forEach((c) => {
                list.push({
                    value: `client_${c.id}`,
                    label: `[Klien] ${c.name}`,
                    subtitle: `Referensi dari Klien (${c.phone || c.city || 'Terdaftar'})`,
                });
            });
        }

        if (wedding_organizers.length > 0) {
            wedding_organizers.forEach((wo) => {
                list.push({
                    value: `wo_${wo.id}`,
                    label: `[WO] ${wo.name}`,
                    subtitle: `Partner Wedding Organizer (${wo.city || 'Vendor'})`,
                });
            });
        }

        return list;
    }, [clients, clientId, wedding_organizers]);

    // Submit handler
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!clientId) {
            toast.error('Silakan pilih Klien terlebih dahulu.');
            return;
        }

        if (!categoryId) {
            toast.error('Silakan tentukan Kategori Project.');
            return;
        }

        if (!projectName.trim()) {
            toast.error('Nama Project wajib diisi.');
            return;
        }

        for (const fee of customFees) {
            if (!fee.name.trim()) {
                toast.error('Nama biaya kustom tidak boleh kosong. Harap isi atau hapus baris yang kosong.');
                setAddonTab('custom');
                return;
            }
        }

        setSubmitting(true);

        let parsedWoId: string | null = null;
        let referralNote = '';
        if (referralValue.startsWith('wo_')) {
            parsedWoId = referralValue.replace('wo_', '');
        } else if (referralValue.startsWith('client_')) {
            const refClientId = referralValue.replace('client_', '');
            const refClient = clients.find((c) => c.id === refClientId);
            if (refClient) {
                referralNote = `[Referensi Klien: ${refClient.name}]`;
            }
        } else if (referralValue === 'source_instagram') {
            referralNote = '[Sumber: Instagram]';
        } else if (referralValue === 'source_website') {
            referralNote = '[Sumber: Website]';
        } else if (referralValue === 'source_family') {
            referralNote = '[Sumber: Teman/Keluarga]';
        }

        const finalNotes = referralNote
            ? (notes ? `${referralNote}\n${notes}` : referralNote)
            : notes;

        const mergedAddons = [
            ...selectedAddons.map((a) => ({
                id: a.id,
                name: a.name,
                is_custom: false,
                qty: a.qty,
                unit: a.unit,
                unit_price: a.unit_price,
                total_price: a.total_price,
            })),
            ...customFees.map((f) => ({
                id: f.tempId,
                name: f.name.trim(),
                is_custom: true,
                qty: f.qty,
                unit: f.unit || 'item',
                unit_price: f.unit_price,
                total_price: f.unit_price * f.qty,
            })),
        ];

        const payload = {
            name: projectName,
            client_id: clientId,
            wedding_organizer_id: parsedWoId,
            category_id: categoryId,
            package_id: packageId || null,
            status,
            event_date: eventDate || null,
            event_time: eventTime || null,
            end_date: endDate || null,
            deadline: deadline || null,
            location: location || null,
            photographer_id: photographerId || null,
            editor_id: editorId || null,
            supervisor_id: supervisorId || null,
            price: Number(basePrice) || 0,
            discount: Number(discount) || 0,
            tax: Number(tax) || 0,
            total_amount: Number(grandTotal) || 0,
            notes: finalNotes || null,
            selected_addons: mergedAddons,
            custom_timeline: {
                mode: timelineMode,
                is_wedding: isWeddingCategory,
                steps: activeWorkflowSteps.map((s) => ({
                    step: s.step,
                    title: s.title,
                    desc: s.desc,
                    date: getEffectiveStepDate(s),
                })),
            },
        };

        router.put(`/projects/${project.id}`, payload, {
            onFinish: () => setSubmitting(false),
            onSuccess: () => toast.success('Project berhasil diperbarui!'),
            onError: (errors) => {
                const firstErr = Object.values(errors)[0];
                toast.error(typeof firstErr === 'string' ? firstErr : 'Terjadi kesalahan validasi.');
            },
        });
    };

    const filteredAddons = useMemo(() => {
        if (!addonSearch) return addons;
        return addons.filter(
            (a) =>
                a.name.toLowerCase().includes(addonSearch.toLowerCase()) ||
                a.unit.toLowerCase().includes(addonSearch.toLowerCase()) ||
                a.category?.name.toLowerCase().includes(addonSearch.toLowerCase())
        );
    }, [addons, addonSearch]);

    return (
        <div className="space-y-6 pb-24">
            <Head title={`Edit Project ${project.name} - Lensaria Photography`} />

            {/* Breadcrumbs & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <nav className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
                            Dashboard
                        </Link>
                        <span>›</span>
                        <Link href="/projects" className="hover:text-slate-900 transition-colors">
                            Projects
                        </Link>
                        <span>›</span>
                        <Link
                            href={`/projects/${project.id}`}
                            className="hover:text-slate-900 transition-colors truncate max-w-xs"
                        >
                            {project.name}
                        </Link>
                        <span>›</span>
                        <span className="font-semibold text-slate-900">Edit</span>
                    </nav>
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/projects/${project.id}`}
                            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                                <span>Edit Project: {project.name}</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                    {project.project_number}
                                </span>
                            </h1>
                            <p className="text-slate-500 text-sm mt-0.5">
                                Perbarui rincian photoshoot, paket & add-on, referensi, jadwal, dan kru produksi.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Link
                        href={`/projects/${project.id}`}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
                    >
                        Batal
                    </Link>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-accent text-white rounded-xl text-xs font-bold shadow-md shadow-black/10 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                    >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>{submitting ? 'Menyimpan...' : 'Simpan Perubahan Project'}</span>
                    </button>
                </div>
            </div>

            {/* Main Form Grid */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left 2 Columns: Detailed Form Sections */}
                <div className="lg:col-span-2 space-y-6">
                    {/* SECTION 1: Klien & Referensi */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#C89445] flex items-center justify-center font-bold">
                                <UserIcon className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    1. Informasi Klien & Referensi
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Pilih klien pemesan dan sumber rekomendasi / referensi klien lain.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Searchable Select: Klien Pemesan */}
                            <div>
                                <SelectSearch
                                    label="Klien Pemesan"
                                    required
                                    placeholder="-- Cari atau Pilih Klien --"
                                    searchPlaceholder="Ketik nama, telepon, atau kota klien..."
                                    value={clientId}
                                    onChange={(val) => setClientId(val)}
                                    options={clients.map((c) => ({
                                        value: c.id,
                                        label: c.name,
                                        subtitle: `${c.phone || '-'} • ${c.city || 'Kota'}`,
                                    }))}
                                />
                                {selectedClient && (
                                    <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                                        <span>Telp: {selectedClient.phone || '-'}</span>
                                        <span>Kota: {selectedClient.city || '-'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Searchable Select: Referensi Klien / WO */}
                            <div>
                                <SelectSearch
                                    label="Referensi / Rekomendasi Dari (Opsional)"
                                    placeholder="-- Tanpa Referensi (Direct / Walk-in) --"
                                    searchPlaceholder="Cari referensi klien lain, partner WO, atau media..."
                                    value={referralValue}
                                    onChange={(val) => setReferralValue(val)}
                                    options={referralOptions}
                                />
                                <span className="text-[11px] text-slate-400 mt-1 block">
                                    Pilih rekomendasi dari klien lain, partner WO, atau media sosial.
                                </span>
                            </div>
                        </div>

                        {/* Project Name & Venue */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Nama Project *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="Contoh: Wedding Sarah & Kevin, Maternity Session"
                                    className="w-full px-3.5 py-2 h-[38px] rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-[#C89445] outline-hidden font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Lokasi / Venue Acara
                                </label>
                                <div className="relative">
                                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Contoh: Grand Ballroom Hotel Mulia Senayan, Jakarta"
                                        className="w-full pl-9 pr-3.5 py-2 h-[38px] rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-[#C89445] outline-hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Kategori & Paket Fotografi */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                <Camera className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    2. Kategori Layanan & Paket Utama
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Pilih jenis photoshoot dan paket penawaran yang dipesan.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Searchable Select: Category */}
                            <div>
                                <SelectSearch
                                    label="Kategori Project"
                                    required
                                    placeholder="-- Pilih Kategori Project --"
                                    searchPlaceholder="Cari kategori (Wedding, Birthday, Commercial, dll)..."
                                    value={categoryId}
                                    onChange={(val) => {
                                        setCategoryId(val);
                                        setPackageId('');
                                    }}
                                    options={categories.map((c) => ({
                                        value: c.id,
                                        label: c.name,
                                        icon: (
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                style={{ backgroundColor: c.color || '#3B82F6' }}
                                            />
                                        ),
                                    }))}
                                />
                            </div>

                            {/* Searchable Select: Package */}
                            <div>
                                <SelectSearch
                                    label="Paket Foto Utama"
                                    placeholder="-- Pilih Paket (atau atur harga di samping) --"
                                    searchPlaceholder="Cari nama paket foto..."
                                    value={packageId}
                                    onChange={(val) => handlePackageChange(val)}
                                    options={availablePackages.map((p) => ({
                                        value: p.id,
                                        label: p.name,
                                        subtitle: `${formatRupiah(p.base_price)} • ${p.duration_hours || 0} Jam`,
                                    }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Add-on & Layanan Ekstra (Catalog + Custom Fees) */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                    <Layers className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        3. Add-on, Biaya Kustom & Layanan Ekstra
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Pilih dari katalog add-on atau sesuaikan item biaya kustom manual khusus project ini.
                                    </p>
                                </div>
                            </div>

                            {/* Add Custom Fee Button */}
                            <button
                                type="button"
                                onClick={handleAddCustomFeeRow}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-[#C89445] hover:bg-amber-100 border border-amber-200/80 text-xs font-bold transition-all shrink-0 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>+ Biaya Kustom Manual</span>
                            </button>
                        </div>

                        {/* Tabs: Katalog vs Biaya Kustom */}
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                            <button
                                type="button"
                                onClick={() => setAddonTab('catalog')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                                    addonTab === 'catalog'
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                <span>Katalog Add-on ({addons.length})</span>
                                {selectedAddons.length > 0 && (
                                    <span className="w-4 h-4 rounded-full bg-[#C89445] text-white text-[10px] flex items-center justify-center font-mono">
                                        {selectedAddons.length}
                                    </span>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setAddonTab('custom')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                                    addonTab === 'custom'
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                <span>Biaya Kustom / Manual</span>
                                {customFees.length > 0 && (
                                    <span className="w-4 h-4 rounded-full bg-[#C89445] text-white text-[10px] flex items-center justify-center font-mono">
                                        {customFees.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* TAB 1: Katalog Master Data Add-ons */}
                        {addonTab === 'catalog' && (
                            <div className="space-y-3">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={addonSearch}
                                        onChange={(e) => setAddonSearch(e.target.value)}
                                        placeholder="Cari item di katalog add-on..."
                                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#C89445] outline-hidden font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                                    {filteredAddons.map((addon) => {
                                        const selected = selectedAddons.find((a) => a.id === addon.id);
                                        return (
                                            <div
                                                key={addon.id}
                                                onClick={() => handleToggleAddon(addon)}
                                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                                                    selected
                                                        ? 'bg-amber-50/50 border-[#C89445] shadow-xs'
                                                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!selected}
                                                            readOnly
                                                            className="rounded text-[#C89445] focus:ring-[#C89445] cursor-pointer"
                                                        />
                                                        <span className="text-xs font-bold text-slate-900">
                                                            {addon.name}
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 font-mono pl-5">
                                                        {formatRupiah(addon.price)} / {addon.unit}
                                                    </div>
                                                </div>

                                                {/* Directly Editable Quantity Stepper on Catalog Addons */}
                                                {selected && (
                                                    <div
                                                        className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-amber-200 shadow-2xs shrink-0"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQtyChange(addon.id, -1)}
                                                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-800 transition-colors cursor-pointer"
                                                        >
                                                            <Minus className="w-3 h-3 text-slate-700" />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={selected.qty}
                                                            onChange={(e) =>
                                                                handleDirectQtyInput(
                                                                    addon.id,
                                                                    parseInt(e.target.value, 10) || 1
                                                                )
                                                            }
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="w-8 text-center text-xs font-mono font-extrabold text-slate-900 bg-transparent border-0 outline-hidden p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQtyChange(addon.id, 1)}
                                                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-800 transition-colors cursor-pointer"
                                                        >
                                                            <Plus className="w-3 h-3 text-slate-700" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* TAB 2: Biaya Kustom / Manual */}
                        {addonTab === 'custom' && (
                            <div className="space-y-3">
                                {customFees.length === 0 ? (
                                    <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                                        <Receipt className="w-6 h-6 text-slate-400 mx-auto" />
                                        <p className="text-xs font-semibold text-slate-600">
                                            Belum ada biaya kustom manual yang ditambahkan.
                                        </p>
                                        <p className="text-[11px] text-slate-400">
                                            Cocok untuk biaya transport luar kota, tiket pesawat, sewa studio khusus, atau perizinan lokasi.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleAddCustomFeeRow}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-accent text-white text-xs font-bold hover:scale-[1.02] transition-all cursor-pointer mt-1"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Tambah Biaya Kustom Pertama</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {customFees.map((fee, index) => (
                                            <div
                                                key={fee.tempId}
                                                className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2.5 animate-in fade-in duration-150"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                                        Item Kustom #{index + 1}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveCustomFee(fee.tempId)}
                                                        className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                                        title="Hapus Biaya Kustom"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                                                    {/* Nama Biaya */}
                                                    <div className="sm:col-span-5">
                                                        <input
                                                            type="text"
                                                            required
                                                            value={fee.name}
                                                            onChange={(e) =>
                                                                handleUpdateCustomFee(fee.tempId, 'name', e.target.value)
                                                            }
                                                            placeholder="Nama Biaya (mis: Transport Luar Kota, Izin Lokasi)"
                                                            className="w-full px-3 py-2 h-[38px] rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-[#C89445] outline-hidden font-bold"
                                                        />
                                                    </div>

                                                    {/* Tarif Rp */}
                                                    <div className="sm:col-span-3">
                                                        <FormattedNumberInput
                                                            prefix="Rp"
                                                            placeholder="0"
                                                            value={fee.unit_price}
                                                            onChange={(val) =>
                                                                handleUpdateCustomFee(fee.tempId, 'unit_price', val)
                                                            }
                                                        />
                                                    </div>

                                                    {/* Qty Stepper */}
                                                    <div className="sm:col-span-2">
                                                        <div className="flex items-center justify-between bg-white px-2 h-[38px] rounded-xl border border-slate-200 shadow-2xs">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleUpdateCustomFee(
                                                                        fee.tempId,
                                                                        'qty',
                                                                        Math.max(1, fee.qty - 1)
                                                                    )
                                                                }
                                                                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-800 transition-all cursor-pointer shrink-0"
                                                            >
                                                                <Minus className="w-3 h-3 text-slate-700" />
                                                            </button>
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                value={fee.qty}
                                                                onChange={(e) =>
                                                                    handleUpdateCustomFee(
                                                                        fee.tempId,
                                                                        'qty',
                                                                        Math.max(1, parseInt(e.target.value, 10) || 1)
                                                                    )
                                                                }
                                                                className="w-8 text-center text-xs font-mono font-extrabold text-slate-900 bg-transparent border-0 outline-hidden p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleUpdateCustomFee(fee.tempId, 'qty', fee.qty + 1)
                                                                }
                                                                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-800 transition-all cursor-pointer shrink-0"
                                                            >
                                                                <Plus className="w-3 h-3 text-slate-700" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Satuan */}
                                                    <div className="sm:col-span-2">
                                                        <input
                                                            type="text"
                                                            value={fee.unit}
                                                            onChange={(e) =>
                                                                handleUpdateCustomFee(fee.tempId, 'unit', e.target.value)
                                                            }
                                                            placeholder="item/trip"
                                                            className="w-full px-3 py-2 h-[38px] rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-[#C89445] outline-hidden font-mono font-medium"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-end text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                                                    <span>
                                                        Subtotal: <strong className="text-slate-900 font-mono">{formatRupiah(fee.unit_price * fee.qty)}</strong>
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={handleAddCustomFeeRow}
                                            className="w-full py-2.5 border border-dashed border-slate-300 hover:border-[#C89445] hover:bg-amber-50/30 rounded-xl text-xs font-bold text-slate-700 hover:text-[#C89445] transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>+ Tambah Baris Biaya Kustom Lainnya</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* SECTION 4: Jadwal & Timeline Pengerjaan */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    4. Jadwal & Timeline Pengerjaan Project
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Tentukan tanggal pemotretan, batas deadline, serta opsi timeline standar atau kustom.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Tanggal Hari-H / Mulai *
                                </label>
                                <input
                                    type="date"
                                    value={eventDate}
                                    onChange={(e) => {
                                        const newDate = e.target.value;
                                        setEventDate(newDate);
                                        // Auto-suggest deadline H+30 if deadline is empty
                                        if (newDate && !deadline) {
                                            const d = new Date(newDate);
                                            d.setDate(d.getDate() + 30);
                                            setDeadline(d.toISOString().split('T')[0]);
                                        }
                                    }}
                                    className="w-full px-3.5 py-2 h-[38px] rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#C89445] outline-hidden font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Waktu / Jam Acara
                                </label>
                                <input
                                    type="text"
                                    value={eventTime}
                                    onChange={(e) => setEventTime(e.target.value)}
                                    placeholder="Contoh: 07.00 - 14.00 WIB"
                                    className="w-full px-3.5 py-2 h-[38px] rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#C89445] outline-hidden font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Tanggal Selesai (Opsional)
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3.5 py-2 h-[38px] rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#C89445] outline-hidden font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Deadline Final Delivery
                                </label>
                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    className="w-full px-3.5 py-2 h-[38px] rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#C89445] outline-hidden font-medium"
                                />
                            </div>
                        </div>

                        {/* Searchable Select: Status */}
                        <div>
                            <SelectSearch
                                label="Status Project"
                                placeholder="Pilih status..."
                                searchPlaceholder="Cari status..."
                                value={status}
                                onChange={(val) => setStatus(val)}
                                options={[
                                    { value: 'draft', label: 'Draft (Penawaran / Booking Awal)' },
                                    { value: 'in_progress', label: 'Dalam Proses (Terkonfirmasi / Menunggu Hari-H)' },
                                    { value: 'editing', label: 'Tahap Editing / Post-Production' },
                                    { value: 'completed', label: 'Selesai (Sudah Serah Terima)' },
                                    { value: 'cancelled', label: 'Dibatalkan' },
                                ]}
                            />
                        </div>

                        {/* Timeline Pengerjaan & Estimasi Tahapan Workflow (DYNAMIC 8 vs 5 STEPS) */}
                        <div className="pt-3 border-t border-slate-100 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div className="space-y-0.5">
                                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-[#C89445]" />
                                        <span>
                                            {isWeddingCategory
                                                ? 'Estimasi Timeline 8 Tahapan Standar Pengerjaan (Wedding)'
                                                : 'Estimasi Timeline 5 Tahapan Standar Pengerjaan (Non-Wedding)'}
                                        </span>
                                    </span>
                                    <p className="text-[11px] text-slate-400">
                                        {isWeddingCategory
                                            ? 'Alur lengkap pernikahan (Booking → TM → Hari-H → Sneak Peek → Flashdrive → Full Edit → Album → Delivery)'
                                            : 'Alur pengerjaan standar (Booking → Concept → Hari-H → Full Edit → Delivery)'}
                                    </p>
                                </div>

                                {/* Toggle Switch Default vs Custom */}
                                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setTimelineMode('default')}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            timelineMode === 'default'
                                                ? 'bg-white text-slate-900 shadow-2xs'
                                                : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                    >
                                        ⚡ Default Otomatis
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTimelineMode('custom')}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            timelineMode === 'custom'
                                                ? 'bg-[#C89445] text-white shadow-2xs'
                                                : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                    >
                                        ✏️ Atur Kustom
                                    </button>
                                    {timelineMode === 'custom' && (
                                        <button
                                            type="button"
                                            onClick={handleResetTimelineToDefault}
                                            className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                            title="Reset ke Default Otomatis"
                                        >
                                            ↺ Reset
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Responsive Steps Grid: 4 columns on desktop for 8 steps, 5 columns for 5 steps */}
                            <div className={`grid gap-2.5 ${
                                isWeddingCategory
                                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                                    : 'grid-cols-1 sm:grid-cols-5'
                            }`}>
                                {activeWorkflowSteps.map((s) => {
                                    const effectiveDate = getEffectiveStepDate(s);
                                    const isCustom = timelineMode === 'custom';

                                    return (
                                        <div
                                            key={s.step}
                                            className={`p-3 rounded-xl border space-y-1.5 transition-all ${
                                                isCustom
                                                    ? 'bg-amber-50/30 border-amber-200 shadow-2xs'
                                                    : 'bg-slate-50 border-slate-200/80'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-slate-500">
                                                    Tahap {s.step}
                                                </span>
                                                <span className={`w-2 h-2 rounded-full ${s.dotColor}`} />
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-900 leading-tight">
                                                {s.title}
                                            </h4>
                                            <p className="text-[10px] text-slate-500 leading-tight">
                                                {s.desc}
                                            </p>

                                            {isCustom ? (
                                                <input
                                                    type="date"
                                                    value={effectiveDate}
                                                    onChange={(e) =>
                                                        setCustomStepDates((prev) => ({
                                                            ...prev,
                                                            [s.step]: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full px-2 py-1 bg-white border border-amber-300 rounded-lg text-[10px] font-medium text-slate-900 outline-hidden focus:ring-1 focus:ring-amber-500"
                                                />
                                            ) : (
                                                <p className="text-[10px] text-[#A6702E] font-bold pt-0.5">
                                                    {effectiveDate
                                                        ? formatStepDisplayDate(effectiveDate, 'Sesuai Jadwal')
                                                        : s.isEventRelative === 'created'
                                                        ? 'Saat Dibuat'
                                                        : s.offsetDays === 0
                                                        ? 'Hari-H'
                                                        : s.offsetDays < 0
                                                        ? `H${s.offsetDays}`
                                                        : `H+${s.offsetDays}`}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: Penugasan Kru / Tim Produksi (SUPERVISOR FIRST) */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                                <Users className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    5. Penugasan Kru & Tim Produksi
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Tugaskan supervisor penanggung jawab, fotografer utama, dan editor.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* 1. Supervisor / PIC Studio (FIRST) */}
                            <div>
                                <SelectSearch
                                    label="Supervisor / PIC Studio"
                                    placeholder="-- Belum Ditugaskan --"
                                    searchPlaceholder="Cari nama supervisor..."
                                    value={supervisorId}
                                    onChange={(val) => setSupervisorId(val)}
                                    options={team_members.map((u) => ({
                                        value: u.id,
                                        label: u.name,
                                        subtitle: u.role || 'Supervisor / Manager',
                                    }))}
                                />
                            </div>

                            {/* 2. Lead Fotografer */}
                            <div>
                                <SelectSearch
                                    label="Lead Fotografer"
                                    placeholder="-- Belum Ditugaskan --"
                                    searchPlaceholder="Cari nama fotografer..."
                                    value={photographerId}
                                    onChange={(val) => setPhotographerId(val)}
                                    options={team_members.map((u) => ({
                                        value: u.id,
                                        label: u.name,
                                        subtitle: u.role || 'Tim Fotografer',
                                    }))}
                                />
                            </div>

                            {/* 3. Photo / Video Editor */}
                            <div>
                                <SelectSearch
                                    label="Photo / Video Editor"
                                    placeholder="-- Belum Ditugaskan --"
                                    searchPlaceholder="Cari nama editor..."
                                    value={editorId}
                                    onChange={(val) => setEditorId(val)}
                                    options={team_members.map((u) => ({
                                        value: u.id,
                                        label: u.name,
                                        subtitle: u.role || 'Tim Editor',
                                    }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 6: Catatan / Brief Project */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        6. Catatan Khusus & Template Brief
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Instruksi photoshoot, konsep acara, atau klausul perjanjian.
                                    </p>
                                </div>
                            </div>

                            {/* Searchable Select: Template Selector */}
                            {note_templates.length > 0 && (
                                <div className="w-full sm:w-64">
                                    <SelectSearch
                                        placeholder="+ Muat Template Catatan..."
                                        searchPlaceholder="Cari template brief..."
                                        value=""
                                        onChange={(val) => val && handleSelectTemplate(val)}
                                        options={note_templates.map((t) => ({
                                            value: t.id,
                                            label: t.title,
                                            subtitle: t.type,
                                        }))}
                                    />
                                </div>
                            )}
                        </div>

                        <textarea
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Tuliskan catatan khusus untuk fotografer, rincian susunan acara, dresscode, request lagu video teaser, dll..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:border-[#C89445] outline-hidden resize-none"
                        />
                    </div>
                </div>

                {/* Right Column: Sticky Pricing Breakdown & Quick Actions */}
                <div className="space-y-6 lg:sticky lg:top-6">
                    {/* Ringkasan Biaya Card */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#C89445] flex items-center justify-center font-bold">
                                <DollarSign className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    Kalkulasi Biaya Project
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Rincian paket, add-on, biaya kustom, diskon, dan grand total.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3.5 text-xs">
                            {/* Harga Paket */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Harga Dasar Paket (Rp)
                                </label>
                                <FormattedNumberInput
                                    prefix="Rp"
                                    placeholder="0"
                                    value={basePrice}
                                    onChange={(val) => setBasePrice(val)}
                                />
                            </div>

                            {/* Total Addon Readonly */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="font-semibold text-slate-600">
                                    Total Add-on & Kustom ({selectedAddons.length + customFees.length} item):
                                </span>
                                <span className="font-mono font-bold text-slate-900">
                                    {formatRupiah(totalAllAddonsPrice)}
                                </span>
                            </div>

                            {/* Selected Addon Items List */}
                            {(selectedAddons.length > 0 || customFees.length > 0) && (
                                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                    {/* Catalog Addons */}
                                    {selectedAddons.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between text-[11px] py-1 border-b border-slate-100 last:border-0"
                                        >
                                            <span className="text-slate-600 truncate max-w-[150px] flex items-center gap-1">
                                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-100 text-slate-600 font-semibold">
                                                    Katalog
                                                </span>
                                                <span>{item.qty}x {item.name}</span>
                                            </span>
                                            <span className="font-mono font-semibold text-slate-900">
                                                {formatRupiah(item.total_price)}
                                            </span>
                                        </div>
                                    ))}

                                    {/* Custom Fees */}
                                    {customFees.map((fee) => (
                                        <div
                                            key={fee.tempId}
                                            className="flex items-center justify-between text-[11px] py-1 border-b border-slate-100 last:border-0"
                                        >
                                            <span className="text-slate-600 truncate max-w-[150px] flex items-center gap-1">
                                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-100 text-amber-800 font-bold">
                                                    Kustom
                                                </span>
                                                <span>{fee.qty}x {fee.name || '(Biaya Manual)'}</span>
                                            </span>
                                            <span className="font-mono font-semibold text-slate-900">
                                                {formatRupiah(fee.unit_price * fee.qty)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Diskon & Pajak */}
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Diskon / Potongan (Rp)
                                    </label>
                                    <FormattedNumberInput
                                        prefix="Rp"
                                        placeholder="0"
                                        value={discount}
                                        onChange={(val) => setDiscount(val)}
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1.5">
                                        Pajak / PPN (Rp)
                                    </label>
                                    <FormattedNumberInput
                                        prefix="Rp"
                                        placeholder="0"
                                        value={tax}
                                        onChange={(val) => setTax(val)}
                                    />
                                </div>
                            </div>

                            {/* Grand Total Box */}
                            <div className="p-4 rounded-2xl bg-white border-2 border-[#C89445]/30 space-y-1 shadow-xs mt-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                    Grand Total Nilai Project
                                </span>
                                <div className="text-2xl font-mono font-extrabold text-slate-900">
                                    {formatRupiah(grandTotal)}
                                </div>
                                <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                                    Akan tercatat sebagai nilai total invoice pada project ini.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="w-full py-3 bg-primary-accent hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-lg shadow-black/10 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{submitting ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Project'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
