import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Calendar as CalendarIcon,
    ChevronDown,
    Check,
    CheckCircle2,
    HelpCircle,
    Info,
    Plus,
    Trash2,
    X,
    ArrowUpRight,
    Search,
} from 'lucide-react';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
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
    slug?: string;
    color?: string;
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

interface PaymentMethodItem {
    id: string;
    name: string;
    code?: string;
    account_number?: string;
    account_holder?: string;
    icon?: string;
}

interface CompanySettings {
    name: string;
    phone: string;
    email: string;
    address: string;
    instagram: string;
    website: string;
}

interface ProjectsCreateProps {
    clients: ClientItem[];
    categories: CategoryItem[];
    packages: PackageItem[];
    wedding_organizers?: WeddingOrganizerItem[];
    addons?: AddonItem[];
    supervisors?: UserItem[];
    team_members?: UserItem[];
    payment_methods?: PaymentMethodItem[];
    company_settings?: CompanySettings;
    next_project_number?: string;
    next_invoice_number?: string;
    initial_client_id?: string;
    initial_wo_id?: string;
    initial_category_id?: string;
    initial_package_id?: string;
}

interface SelectedAddonItem {
    tempId: string;
    id?: string;
    name: string;
    category_name: string;
    unit_price: number;
    qty: number;
    unit: string;
    total_price: number;
    is_custom?: boolean;
}

export default function ProjectsCreate({
    clients = [],
    categories = [],
    packages = [],
    wedding_organizers = [],
    addons = [],
    supervisors = [],
    team_members = [],
    payment_methods = [],
    company_settings = {
        name: 'ARAMS PICTURES',
        phone: '0813 9876 5432',
        email: 'arams.pictures@gmail.com',
        address: 'Jl. Studio Raya No. 10 Jakarta Selatan 12345, Indonesia',
        instagram: '@arams.pictures',
        website: 'www.arams-pictures.com',
    },
    next_project_number = 'PRJ-0526-0007',
    next_invoice_number = 'INV/0526/0002',
    initial_client_id = '',
    initial_wo_id = '',
    initial_category_id = '',
    initial_package_id = '',
}: ProjectsCreateProps) {
    const [submitting, setSubmitting] = useState(false);

    // Initial Defaults
    const defaultClient = clients.find((c) => c.name.toLowerCase().includes('kevin')) || clients[0] || null;
    const defaultCategory = categories.find((c) => c.name.toLowerCase().includes('prewedding')) || categories[0] || null;
    const defaultSupervisor = supervisors.find((u) => u.name.toLowerCase().includes('budi')) || supervisors[0] || team_members[0] || null;

    // Form states
    const [clientId, setClientId] = useState<string>(initial_client_id || defaultClient?.id || '');
    const [categoryId, setCategoryId] = useState<string>(initial_category_id || defaultCategory?.id || '');
    const [workflowType, setWorkflowType] = useState<'8_tahap' | '5_tahap'>('5_tahap');
    const [projectName, setProjectName] = useState<string>('Prewedding Kevin & Jessica Mila');
    const [eventDate, setEventDate] = useState<string>('2026-05-18');
    const [createdAtDate, setCreatedAtDate] = useState<string>('2026-05-26');
    const [internalNotes, setInternalNotes] = useState<string>('');

    // PIC
    const [supervisorId, setSupervisorId] = useState<string>(defaultSupervisor?.id || '');
    const [photographerName, setPhotographerName] = useState<string>('Ivan Hardianto');
    const [editorName, setEditorName] = useState<string>('Dian Pratama');

    // Packages & Addons
    const [packageId, setPackageId] = useState<string>(initial_package_id || '');
    const [selectedAddonsList, setSelectedAddonsList] = useState<SelectedAddonItem[]>([
        {
            tempId: 'addon-1',
            name: 'Extra Photographer',
            category_name: 'Add On',
            unit_price: 2000000,
            qty: 1,
            unit: 'crew',
            total_price: 2000000,
            is_custom: false,
        },
        {
            tempId: 'addon-2',
            name: 'Album Layout (20 Halaman)',
            category_name: 'Add On',
            unit_price: 2000000,
            qty: 1,
            unit: 'album',
            total_price: 2000000,
            is_custom: false,
        },
        {
            tempId: 'addon-3',
            name: 'Overtime Liputan (2 Jam)',
            category_name: 'Add On',
            unit_price: 1000000,
            qty: 1,
            unit: 'jam',
            total_price: 1000000,
            is_custom: true,
        },
    ]);

    // Financial
    const [manualTotalOverride, setManualTotalOverride] = useState<number | null>(null);
    const [dpAmount, setDpAmount] = useState<number>(7000000);
    const [paymentMethod, setPaymentMethod] = useState<string>('Transfer Bank');
    const [paymentStatus, setPaymentStatus] = useState<string>('unpaid');
    const [paymentSchema, setPaymentSchema] = useState<string>('Satu Kali Bayar');

    // Invoice Automation
    const [invoiceFor, setInvoiceFor] = useState<string>('dp');
    const [invoiceAmount, setInvoiceAmount] = useState<number>(7000000);
    const [invoiceDueDate, setInvoiceDueDate] = useState<string>('2026-06-02');
    const [sendWhatsapp, setSendWhatsapp] = useState<boolean>(true);
    const [sendEmail1, setSendEmail1] = useState<boolean>(true);
    const [sendEmail2, setSendEmail2] = useState<boolean>(true);
    const [clientMessage, setClientMessage] = useState<string>(
        'Yth. Kevin & Jessica,\nBerikut kami kirimkan invoice uang muka untuk project Prewedding Kevin & Jessica Mila.\nTerima kasih.'
    );

    // Modal state for adding custom add-on
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newAddonName, setNewAddonName] = useState('');
    const [newAddonCategory, setNewAddonCategory] = useState('Add On');
    const [newAddonPrice, setNewAddonPrice] = useState<number>(1000000);

    // Success Modal Overlay
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdResult, setCreatedResult] = useState<{
        projectId?: string;
        projectNumber: string;
        projectName: string;
        invoiceId?: string;
        invoiceNumber: string;
        nominalDp: number;
        dueDate: string;
    } | null>(null);

    // Get selected objects
    const selectedClient = useMemo(() => {
        return clients.find((c) => String(c.id) === String(clientId)) || defaultClient;
    }, [clients, clientId, defaultClient]);

    const selectedCategory = useMemo(() => {
        return categories.find((c) => String(c.id) === String(categoryId)) || defaultCategory;
    }, [categories, categoryId, defaultCategory]);

    const availablePackages = useMemo(() => {
        if (!categoryId) return packages;
        return packages.filter((p) => String(p.category_id) === String(categoryId));
    }, [packages, categoryId]);

    const selectedPackage = useMemo(() => {
        if (packageId) {
            return packages.find((p) => String(p.id) === String(packageId));
        }
        return availablePackages[0] || packages[0] || null;
    }, [packages, packageId, availablePackages]);

    // Auto set package when category changes
    useEffect(() => {
        if (availablePackages.length > 0) {
            const match = availablePackages.find((p) => String(p.id) === String(packageId));
            if (!match) {
                setPackageId(availablePackages[0].id);
            }
        }
    }, [availablePackages, packageId]);

    // Auto sync workflow & project name based on Category & Client
    const handleCategoryChange = (newCatId: string) => {
        setCategoryId(newCatId);
        const cat = categories.find((c) => String(c.id) === String(newCatId));
        if (cat) {
            const catName = cat.name.toLowerCase();
            const isWed = catName.includes('wedding') && !catName.includes('prewedding');
            setWorkflowType(isWed ? '8_tahap' : '5_tahap');
            if (selectedClient) {
                setProjectName(`${cat.name} ${selectedClient.name}`);
            }
        }
    };

    const handleClientChange = (newClientId: string) => {
        setClientId(newClientId);
        const cl = clients.find((c) => String(c.id) === String(newClientId));
        if (cl && selectedCategory) {
            setProjectName(`${selectedCategory.name} ${cl.name}`);
            setClientMessage(
                `Yth. ${cl.name},\nBerikut kami kirimkan invoice uang muka untuk project ${selectedCategory.name} ${cl.name}.\nTerima kasih.`
            );
        }
    };

    // Calculate financials
    const packagePrice = useMemo(() => {
        if (!selectedPackage) return 30000000;
        return Number(selectedPackage.base_price) || 30000000;
    }, [selectedPackage]);

    const totalAddonsPrice = useMemo(() => {
        return selectedAddonsList.reduce((acc, item) => acc + (item.total_price || 0), 0);
    }, [selectedAddonsList]);

    const calculatedTotal = useMemo(() => {
        if (manualTotalOverride !== null && manualTotalOverride > 0) {
            return manualTotalOverride;
        }
        return packagePrice + totalAddonsPrice;
    }, [manualTotalOverride, packagePrice, totalAddonsPrice]);

    const remainingAmount = useMemo(() => {
        return Math.max(0, calculatedTotal - (dpAmount || 0));
    }, [calculatedTotal, dpAmount]);

    // Handlers for Addons
    const handleRemoveAddon = (tempId: string) => {
        setSelectedAddonsList((prev) => prev.filter((item) => item.tempId !== tempId));
    };

    const handleAddAddon = () => {
        if (!newAddonName.trim()) {
            toast.error('Masukkan nama biaya / add-on');
            return;
        }
        const newAddon: SelectedAddonItem = {
            tempId: `custom-${Date.now()}`,
            name: newAddonName.trim(),
            category_name: newAddonCategory,
            unit_price: newAddonPrice,
            qty: 1,
            unit: 'item',
            total_price: newAddonPrice,
            is_custom: true,
        };
        setSelectedAddonsList((prev) => [...prev, newAddon]);
        setNewAddonName('');
        setNewAddonPrice(1000000);
        setAddModalOpen(false);
        toast.success('Biaya tambahan berhasil ditambahkan');
    };

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!clientId) {
            toast.error('Silakan pilih Klien terlebih dahulu.');
            return;
        }

        if (!projectName.trim()) {
            toast.error('Nama Project / Order wajib diisi.');
            return;
        }

        setSubmitting(true);

        const payload = {
            client_id: clientId,
            category_id: categoryId,
            workflow_type: workflowType,
            name: projectName.trim(),
            event_date: eventDate || null,
            created_at_date: createdAtDate || null,
            deadline: invoiceDueDate || null,
            status: 'in_progress',
            supervisor_id: supervisorId || null,
            photographer_name: photographerName || null,
            editor_name: editorName || null,
            package_id: selectedPackage?.id || null,
            price: packagePrice,
            total_amount: calculatedTotal,
            dp_amount: dpAmount,
            payment_method: paymentMethod,
            payment_status: paymentStatus,
            payment_schema: paymentSchema,
            invoice_type: invoiceFor,
            invoice_amount: invoiceAmount || dpAmount,
            invoice_due_date: invoiceDueDate,
            send_whatsapp: sendWhatsapp,
            send_email_1: sendEmail1,
            send_email_2: sendEmail2,
            client_message: clientMessage,
            notes: internalNotes || null,
            selected_addons: selectedAddonsList.map((a) => ({
                id: a.id || null,
                name: a.name,
                is_custom: a.is_custom || false,
                qty: a.qty,
                unit: a.unit,
                unit_price: a.unit_price,
                total_price: a.total_price,
            })),
        };

        try {
            const res = await fetch('/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN':
                        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify(payload),
            });

            const json = await res.json();

            if (res.ok && json.success) {
                toast.success('Project baru berhasil dibuat!');
                setCreatedResult({
                    projectId: json.project?.id,
                    projectNumber: json.project?.project_number || next_project_number,
                    projectName: json.project?.name || projectName,
                    invoiceId: json.invoice?.id,
                    invoiceNumber: json.invoice?.invoice_number || next_invoice_number,
                    nominalDp: json.invoice?.total || dpAmount,
                    dueDate: json.invoice?.due_date || formattedDueDate,
                });
                setShowSuccessModal(true);
            } else {
                toast.error(json.message || 'Gagal menyimpan project.');
            }
        } catch {
            // Fallback standard inertia submit
            router.post('/projects', payload as any, {
                onSuccess: () => {
                    toast.success('Project baru berhasil dibuat!');
                },
                onError: () => {
                    toast.error('Periksa kembali input form Anda.');
                },
                onFinish: () => setSubmitting(false),
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Format dates for display
    const formattedEventDate = useMemo(() => {
        if (!eventDate) return '18 Mei 2026';
        const d = new Date(eventDate);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }, [eventDate]);

    const formattedDueDate = useMemo(() => {
        if (!invoiceDueDate) return '02 Juni 2026';
        const d = new Date(invoiceDueDate);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }, [invoiceDueDate]);

    const formattedCreatedAt = useMemo(() => {
        if (!createdAtDate) return '26 Mei 2026';
        const d = new Date(createdAtDate);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }, [createdAtDate]);

    return (
        <div className="space-y-6 pb-20 max-w-7xl mx-auto">
            <Head title="Buat Project Baru - Lensaria" />

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* ── TOP HEADER & ACTIONS ────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                            Buat Project Baru
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Lengkapi informasi project, keuangan, dan penanggung jawab.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href="/projects"
                            className="inline-flex items-center justify-center px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                        >
                            Batal
                        </Link>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary-action inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl text-xs font-bold shadow-sm shadow-black/10 transition-all cursor-pointer disabled:opacity-50"
                        >
                            <span>{submitting ? 'Menyimpan...' : 'Simpan & Buat Project'}</span>
                            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                        </button>
                    </div>
                </div>

                {/* ── MAIN 2-COLUMN GRID ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-12 gap-6 items-start">
                    {/* ── LEFT COLUMN (70% - 8 COLS): FORM SECTIONS ────────────────── */}
                    <div className="col-span-12 lg:col-span-8 space-y-5">
                        {/* ── SECTION 1: INFORMASI PROJECT ─────────────────────────── */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                            <h2 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <span>1. Informasi Project</span>
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                        Klien <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={clientId}
                                        onChange={(e) => handleClientChange(e.target.value)}
                                        className="w-full h-9 px-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none transition-all"
                                    >
                                        {clients.length === 0 ? (
                                            <option value="">Pilih Klien</option>
                                        ) : (
                                            clients.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} {c.phone ? `(${c.phone})` : ''}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                        Kategori Project <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={categoryId}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        className="w-full h-9 px-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none transition-all"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Jenis Workflow (Radio Cards) */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-2">
                                    Jenis Workflow <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Workflow 5 Tahap */}
                                    <button
                                        type="button"
                                        onClick={() => setWorkflowType('5_tahap')}
                                        className={`p-3.5 rounded-xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                                            workflowType === '5_tahap'
                                                ? 'border-[#3B46F1] bg-[#3B46F1]/5 ring-1 ring-[#3B46F1]'
                                                : 'border-slate-200/90 hover:border-slate-300 bg-white'
                                        }`}
                                    >
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 leading-snug">
                                                Prewedding / Event / Family / dll (5 Tahap)
                                            </p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">
                                                Workflow 5 tahap untuk kategori lainnya
                                            </p>
                                        </div>
                                        <div
                                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                                workflowType === '5_tahap'
                                                    ? 'border-[#3B46F1] bg-[#3B46F1] text-white'
                                                    : 'border-slate-300 bg-white'
                                            }`}
                                        >
                                            {workflowType === '5_tahap' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                        </div>
                                    </button>

                                    {/* Workflow 8 Tahap */}
                                    <button
                                        type="button"
                                        onClick={() => setWorkflowType('8_tahap')}
                                        className={`p-3.5 rounded-xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                                            workflowType === '8_tahap'
                                                ? 'border-[#3B46F1] bg-[#3B46F1]/5 ring-1 ring-[#3B46F1]'
                                                : 'border-slate-200/90 hover:border-slate-300 bg-white'
                                        }`}
                                    >
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 leading-snug">
                                                Wedding (8 Tahap)
                                            </p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">
                                                Workflow 8 tahap khusus project Wedding
                                            </p>
                                        </div>
                                        <div
                                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                                workflowType === '8_tahap'
                                                    ? 'border-[#3B46F1] bg-[#3B46F1] text-white'
                                                    : 'border-slate-300 bg-white'
                                            }`}
                                        >
                                            {workflowType === '8_tahap' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Nama Project / Order */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                    Nama Project / Order <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="Prewedding Kevin & Jessica Mila"
                                    className="w-full h-9 px-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none transition-all"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Contoh: Prewedding Kevin &amp; Jessica
                                </p>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                        Tanggal Project (Hari H) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={eventDate}
                                            onChange={(e) => setEventDate(e.target.value)}
                                            className="w-full h-9 px-3 pr-9 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none transition-all"
                                        />
                                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                        Tanggal Dibuat <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={createdAtDate}
                                            onChange={(e) => setCreatedAtDate(e.target.value)}
                                            className="w-full h-9 px-3 pr-9 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none transition-all"
                                        />
                                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Deskripsi / Catatan */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                    Deskripsi / Catatan (Internal)
                                </label>
                                <textarea
                                    rows={2}
                                    value={internalNotes}
                                    maxLength={500}
                                    onChange={(e) => setInternalNotes(e.target.value)}
                                    placeholder="Tulis catatan singkat tentang project ini (opsional)"
                                    className="w-full p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none resize-none transition-all"
                                />
                                <div className="text-right text-[10px] text-slate-400 mt-0.5">
                                    {internalNotes.length} / 500
                                </div>
                            </div>
                        </div>

                        {/* ── SECTION 2: PENANGGUNG JAWAB (PIC) ────────────────────── */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                            <h2 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <span>2. Penanggung Jawab (PIC)</span>
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                        Supervisor <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={supervisorId}
                                        onChange={(e) => setSupervisorId(e.target.value)}
                                        className="w-full h-9 px-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none transition-all"
                                    >
                                        {(supervisors.length > 0 ? supervisors : team_members).map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name} (Supervisor)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                        Photographer (Free Text) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={photographerName}
                                        onChange={(e) => setPhotographerName(e.target.value)}
                                        placeholder="Ivan Hardianto"
                                        className="w-full h-9 px-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                        Editor (Free Text) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editorName}
                                        onChange={(e) => setEditorName(e.target.value)}
                                        placeholder="Dian Pratama"
                                        className="w-full h-9 px-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* PIC Information Callout */}
                            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-start gap-2.5 text-[#3B46F1]">
                                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#3B46F1]" />
                                <p className="text-[11px] text-indigo-900/80 leading-relaxed font-medium">
                                    Photographer dan Editor adalah role operasional (tidak perlu login ke sistem).
                                    Supervisor bertugas assign, update status, dan memonitor progress project.
                                </p>
                            </div>
                        </div>

                        {/* ── SECTION 3: KEUANGAN PROJECT ──────────────────────────── */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                            <h2 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <span>3. Keuangan Project</span>
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                        Total Nilai Project (Rp) <span className="text-red-500">*</span>
                                    </label>
                                    <FormattedNumberInput
                                        value={calculatedTotal}
                                        onChange={(val) => setManualTotalOverride(val)}
                                        className="w-full h-9 px-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                        Uang Muka / DP (Rp) <span className="text-red-500">*</span>
                                    </label>
                                    <FormattedNumberInput
                                        value={dpAmount}
                                        onChange={(val) => {
                                            setDpAmount(val);
                                            if (invoiceFor === 'dp') {
                                                setInvoiceAmount(val);
                                            }
                                        }}
                                        className="w-full h-9 px-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                        Sisa Pembayaran (Rp)
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        value={formatRupiah(remainingAmount)}
                                        className="w-full h-9 px-3 bg-slate-100/70 border border-slate-200/90 rounded-xl text-xs text-slate-600 font-bold cursor-not-allowed outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                        Metode Pembayaran <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full h-9 px-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none transition-all"
                                    >
                                        <option value="Transfer Bank">Transfer Bank</option>
                                        <option value="Cash">Cash / Tunai</option>
                                        <option value="QRIS">QRIS</option>
                                        <option value="Credit Card">Credit Card</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                        Status Pembayaran <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={paymentStatus}
                                        onChange={(e) => setPaymentStatus(e.target.value)}
                                        className="w-full h-9 px-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none transition-all"
                                    >
                                        <option value="unpaid">🔴 Belum Dibayar</option>
                                        <option value="partial">🟡 Sebagian / DP</option>
                                        <option value="paid">🟢 Lunas</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                        Skema Pembayaran <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={paymentSchema}
                                        onChange={(e) => setPaymentSchema(e.target.value)}
                                        className="w-full h-9 px-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none transition-all"
                                    >
                                        <option value="Satu Kali Bayar">Satu Kali Bayar</option>
                                        <option value="DP + Pelunasan (2x)">DP + Pelunasan (2x)</option>
                                        <option value="DP + Termin 1 + Pelunasan (3x)">
                                            DP + Termin 1 + Pelunasan (3x)
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {/* ── ACCORDION / RINCIAN BIAYA BOX ─────────────────────── */}
                            <div className="border border-slate-200/90 rounded-xl overflow-hidden divide-y divide-slate-200/90 bg-slate-50/30">
                                <div className="px-4 py-2.5 bg-slate-50/80 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                        <span>▼ RINCIAN BIAYA</span>
                                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                                    </div>
                                </div>

                                {/* A. Paket / Layanan (Wajib) */}
                                <div className="p-4 bg-white space-y-2">
                                    <p className="text-[11px] font-bold text-slate-800">
                                        A. Paket / Layanan (Wajib)
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                                                    <th className="pb-2">DESKRIPSI</th>
                                                    <th className="pb-2">KATEGORI</th>
                                                    <th className="pb-2 text-right">JUMLAH (Rp)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b border-slate-50">
                                                    <td className="py-2.5">
                                                        <select
                                                            value={packageId}
                                                            onChange={(e) => setPackageId(e.target.value)}
                                                            className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:border-primary-accent outline-none"
                                                        >
                                                            {packages.map((pkg) => (
                                                                <option key={pkg.id} value={pkg.id}>
                                                                    {pkg.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="py-2.5 text-slate-500 font-medium">
                                                        {selectedCategory?.name ? `Paket ${selectedCategory.name}` : 'Paket Prewedding'}
                                                    </td>
                                                    <td className="py-2.5 text-right font-bold text-slate-900">
                                                        {formatRupiah(packagePrice)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* B. Biaya Lainnya / Add On */}
                                <div className="p-4 bg-white space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] font-bold text-slate-800">
                                            B. Biaya Lainnya / Add On (Optional)
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setAddModalOpen(true)}
                                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200/60 transition-colors cursor-pointer"
                                        >
                                            <Plus className="w-3 h-3" />
                                            <span>Tambah Biaya Lainnya</span>
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                                                    <th className="pb-2">DESKRIPSI</th>
                                                    <th className="pb-2">KATEGORI</th>
                                                    <th className="pb-2 text-right">JUMLAH (Rp)</th>
                                                    <th className="pb-2 text-center w-16">AKSI</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {selectedAddonsList.map((item) => (
                                                    <tr key={item.tempId} className="group hover:bg-slate-50/50">
                                                        <td className="py-2 font-semibold text-slate-800">
                                                            {item.name}
                                                        </td>
                                                        <td className="py-2 text-slate-500 font-medium">
                                                            {item.category_name}
                                                        </td>
                                                        <td className="py-2 text-right font-bold text-slate-900">
                                                            {formatRupiah(item.total_price)}
                                                        </td>
                                                        <td className="py-2 text-center">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveAddon(item.tempId)}
                                                                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="pt-2 text-right text-xs text-slate-500">
                                        <span>Total Biaya Lainnya: </span>
                                        <span className="font-bold text-slate-900">
                                            {formatRupiah(totalAddonsPrice)}
                                        </span>
                                    </div>
                                </div>

                                {/* TOTAL HIGHLIGHT BAR */}
                                <div className="p-4 bg-[#FDF6ED] flex items-center justify-between text-amber-900">
                                    <span className="text-xs font-black tracking-wide uppercase text-[#B96A00]">
                                        TOTAL PROJECT (PAKET + BIAYA LAINNYA)
                                    </span>
                                    <span className="text-base font-black text-[#B96A00]">
                                        {formatRupiah(calculatedTotal)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── SECTION 4: INVOICE / TAGIHAN AWAL (OTOMATIS) ─────────── */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                            <h2 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <span>4. Invoice / Tagihan Awal (Otomatis)</span>
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                        Akan dibuat Invoice untuk <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={invoiceFor}
                                        onChange={(e) => {
                                            setInvoiceFor(e.target.value);
                                            if (e.target.value === 'full') {
                                                setInvoiceAmount(calculatedTotal);
                                            } else {
                                                setInvoiceAmount(dpAmount);
                                            }
                                        }}
                                        className="w-full h-9 px-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none transition-all"
                                    >
                                        <option value="dp">DP (Uang Muka)</option>
                                        <option value="full">Pelunasan Penuh (100%)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                        Jumlah Invoice (Rp) <span className="text-red-500">*</span>
                                    </label>
                                    <FormattedNumberInput
                                        value={invoiceAmount}
                                        onChange={(val) => setInvoiceAmount(val)}
                                        className="w-full h-9 px-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                        Jatuh Tempo <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={invoiceDueDate}
                                            onChange={(e) => setInvoiceDueDate(e.target.value)}
                                            className="w-full h-9 px-3 pr-9 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none transition-all"
                                        />
                                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Info Callout */}
                            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-start gap-2.5 text-[#3B46F1]">
                                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#3B46F1]" />
                                <p className="text-[11px] text-indigo-900/80 leading-relaxed font-medium">
                                    Invoice akan dibuat otomatis setelah project disimpan. Nomor invoice akan dibuat
                                    mengikuti penomoran sistem.
                                </p>
                            </div>

                            {/* Channels & Client Message */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                        Kirim Invoice ke Klien melalui <span className="text-red-500">*</span>
                                    </label>

                                    <div className="space-y-2">
                                        {/* WhatsApp */}
                                        <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200/80 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={sendWhatsapp}
                                                onChange={(e) => setSendWhatsapp(e.target.checked)}
                                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span className="text-xs font-bold text-slate-800 w-20">WhatsApp</span>
                                            <span className="text-xs text-slate-600 font-mono">
                                                {selectedClient?.phone || '0813 9876 5432'} ({selectedClient?.name?.split(' ')[0] || 'Kevin'})
                                            </span>
                                        </label>

                                        {/* Email 1 */}
                                        <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200/80 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={sendEmail1}
                                                onChange={(e) => setSendEmail1(e.target.checked)}
                                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-xs font-bold text-slate-800 w-20">Email</span>
                                            <span className="text-xs text-slate-600 truncate font-mono">
                                                {selectedClient?.email || 'kevin.sanjaya@gmail.com'}
                                            </span>
                                        </label>

                                        {/* Email 2 */}
                                        <label className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200/80 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={sendEmail2}
                                                onChange={(e) => setSendEmail2(e.target.checked)}
                                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-xs font-bold text-slate-800 w-20">Email</span>
                                            <span className="text-xs text-slate-600 truncate font-mono">
                                                jessica.mila@gmail.com
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                        Pesan untuk Klien (opsional)
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={clientMessage}
                                        maxLength={250}
                                        onChange={(e) => setClientMessage(e.target.value)}
                                        className="w-full p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-primary-accent focus:ring-1 focus:ring-primary-accent outline-none resize-none transition-all leading-relaxed"
                                    />
                                    <div className="text-right text-[10px] text-slate-400 mt-0.5">
                                        {clientMessage.length} / 250
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── SECTION 5: TEMPLATE PROGRESS (WORKFLOW) ─────────────── */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                            <div>
                                <h2 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                    <span>5. Template Progress (Workflow)</span>
                                </h2>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Timeline progress akan otomatis dibuat sesuai workflow yang dipilih:{' '}
                                    <span className="font-bold text-slate-700">
                                        {workflowType === '8_tahap'
                                            ? 'Wedding (8 Tahap)'
                                            : 'Prewedding / Event / Family / dll (5 Tahap)'}
                                    </span>
                                </p>
                            </div>

                            {/* Visual Workflow Steps */}
                            <div className="overflow-x-auto py-2">
                                {workflowType === '8_tahap' ? (
                                    <div className="flex items-center justify-between min-w-[620px] relative px-4">
                                        <div className="absolute left-8 right-8 top-3.5 h-[2px] bg-slate-200 z-0" />
                                        {[
                                            { num: 1, label: 'Booking & DP' },
                                            { num: 2, label: 'TM Wedding' },
                                            { num: 3, label: 'Hari H' },
                                            { num: 4, label: 'Sneak Peek Photo Editing' },
                                            { num: 5, label: 'Flashdrive + Box Delivery' },
                                            { num: 6, label: 'Full Version Photo & Video Editing' },
                                            { num: 7, label: 'Album Layout Editing' },
                                            { num: 8, label: 'Final Delivery' },
                                        ].map((step) => (
                                            <div key={step.num} className="flex flex-col items-center relative z-10 text-center max-w-[70px]">
                                                <div className="w-7 h-7 rounded-full bg-white border-2 border-[#3B46F1] text-[#3B46F1] flex items-center justify-center text-xs font-bold shadow-xs">
                                                    {step.num}
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-700 leading-tight mt-1.5">
                                                    {step.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between min-w-[480px] relative px-8">
                                        <div className="absolute left-12 right-12 top-3.5 h-[2px] bg-slate-200 z-0" />
                                        {[
                                            { num: 1, label: 'Booking & DP' },
                                            { num: 2, label: 'Meeting / Preparation Concept' },
                                            { num: 3, label: 'Hari H' },
                                            { num: 4, label: 'Full Version Photo & Video Editing' },
                                            { num: 5, label: 'Final Delivery' },
                                        ].map((step) => (
                                            <div key={step.num} className="flex flex-col items-center relative z-10 text-center max-w-[85px]">
                                                <div className="w-7 h-7 rounded-full bg-white border-2 border-[#3B46F1] text-[#3B46F1] flex items-center justify-center text-xs font-bold shadow-xs">
                                                    {step.num}
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-700 leading-tight mt-1.5">
                                                    {step.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN (30% - 4 COLS): PREVIEW PANELS ─────────────── */}
                    <div className="col-span-12 lg:col-span-4 space-y-4 lg:sticky lg:top-4">
                        {/* ── CARD 1: RINGKASAN PROJECT ────────────────────────────── */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                            <h3 className="font-bold text-slate-900 text-xs tracking-tight">
                                Ringkasan Project
                            </h3>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Klien</span>
                                    <span className="font-bold text-slate-900 truncate max-w-[160px]">
                                        {selectedClient?.name || 'Kevin Sanjaya & Jessica Mila'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Kategori</span>
                                    <span className="font-semibold text-slate-900">
                                        {selectedCategory?.name || 'Prewedding / Event / Family / dll'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Workflow</span>
                                    <span className="font-semibold text-slate-900">
                                        {workflowType === '8_tahap' ? 'Wedding (8 Tahap)' : '5 Tahap'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Hari H</span>
                                    <span className="font-semibold text-slate-900">
                                        {formattedEventDate}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Nama Project</span>
                                    <span className="font-bold text-slate-900 truncate max-w-[160px]">
                                        {projectName || 'Prewedding Kevin & Jessica Mila'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                    <span className="text-slate-500">Nilai Project</span>
                                    <span className="font-bold text-slate-900">
                                        {formatRupiah(calculatedTotal)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">DP (Invoice)</span>
                                    <span className="font-bold text-slate-900">
                                        {formatRupiah(dpAmount)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Status Invoice</span>
                                    <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                        <span>Belum Dibayar</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── CARD 2: PREVIEW INVOICE (DP) ─────────────────────────── */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                            <h3 className="font-bold text-slate-900 text-xs tracking-tight">
                                Preview Invoice (DP)
                            </h3>

                            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3 font-sans">
                                {/* Header Paper */}
                                <div className="flex items-start justify-between border-b border-slate-200 pb-2.5">
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-4 h-4 rounded bg-slate-900 text-white flex items-center justify-center text-[9px] font-black">
                                                A
                                            </div>
                                            <span className="font-black text-[11px] tracking-tight text-slate-900">
                                                ARAMS PICTURES
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide block">
                                            INVOICE
                                        </span>
                                        <span className="text-[9px] font-bold text-indigo-600 block">
                                            DP
                                        </span>
                                    </div>
                                </div>

                                {/* Meta */}
                                <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-500">
                                    <div>
                                        <p>No. Invoice: <span className="font-bold text-slate-800">{next_invoice_number}</span></p>
                                        <p>Tanggal: <span className="font-semibold text-slate-700">{formattedCreatedAt}</span></p>
                                        <p>Jatuh Tempo: <span className="font-semibold text-slate-700">{formattedDueDate}</span></p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">Bill To:</p>
                                        <p className="font-bold text-slate-900 truncate">{selectedClient?.name || 'Kevin Sanjaya & Jessica Mila'}</p>
                                        <p>{selectedClient?.phone || '0813 9876 5432'}</p>
                                        <p className="truncate">{selectedClient?.email || 'kevin.sanjaya@gmail.com'}</p>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="border-t border-b border-slate-200 py-1.5 space-y-1">
                                    <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                                        <span>DESKRIPSI</span>
                                        <span>JUMLAH</span>
                                    </div>
                                    <div className="flex justify-between text-[9px] text-slate-800 font-medium">
                                        <span className="truncate max-w-[150px]">DP - {projectName || 'Prewedding Kevin & Jessica Mila'}</span>
                                        <span className="font-bold">{formatRupiah(dpAmount)}</span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center text-xs font-black text-slate-900 pt-0.5">
                                    <span>TOTAL</span>
                                    <span>{formatRupiah(dpAmount)}</span>
                                </div>

                                <div className="text-[8px] text-slate-400 italic pt-1 border-t border-slate-200">
                                    Invoice ini dibuat otomatis oleh sistem. Terima kasih atas kepercayaan Anda.
                                </div>
                            </div>
                        </div>

                        {/* ── CARD 3: CATATAN INFORMASI ────────────────────────────── */}
                        <div className="p-4 bg-[#FBF6ED] border border-[#F3E2C6] rounded-2xl space-y-2 text-[#8A5612]">
                            <h4 className="text-xs font-bold">Catatan</h4>
                            <ul className="text-[11px] space-y-1.5 list-disc list-inside leading-relaxed opacity-90">
                                <li>
                                    Nilai project dan biaya lainnya dapat diedit setelah project dibuat (selama invoice belum lunas).
                                </li>
                                <li>
                                    Progress project akan tampil di Web Customer setelah status sesuai tahapan.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </form>

            {/* ── MODAL: TAMBAH BIAYA LAINNYA ────────────────────────────────────────── */}
            {addModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-sm">Tambah Biaya Lainnya / Add-On</h3>
                            <button
                                type="button"
                                onClick={() => setAddModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Deskripsi Biaya
                                </label>
                                <input
                                    type="text"
                                    value={newAddonName}
                                    onChange={(e) => setNewAddonName(e.target.value)}
                                    placeholder="Contoh: Cetak Frame Kayu 24R"
                                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-primary-accent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Kategori
                                </label>
                                <select
                                    value={newAddonCategory}
                                    onChange={(e) => setNewAddonCategory(e.target.value)}
                                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-primary-accent outline-none"
                                >
                                    <option value="Add On">Add On</option>
                                    <option value="Album">Album</option>
                                    <option value="Frame">Frame / Cetak</option>
                                    <option value="Overtime">Overtime</option>
                                    <option value="Transport">Transport / Luar Kota</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Nominal (Rp)
                                </label>
                                <FormattedNumberInput
                                    value={newAddonPrice}
                                    onChange={(val) => setNewAddonPrice(val)}
                                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-primary-accent outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setAddModalOpen(false)}
                                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleAddAddon}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
                            >
                                Tambahkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SUCCESS MODAL OVERLAY: PROJECT BERHASIL DIBUAT! ──────────────────── */}
            {showSuccessModal && createdResult && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-center space-y-4 relative animate-in fade-in zoom-in duration-200">
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => router.visit('/projects')}
                            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Top checkmark icon */}
                        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner relative">
                            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-75" />
                        </div>

                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Project Berhasil Dibuat!
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                                Project <span className="font-bold text-slate-800">"{createdResult.projectName}"</span> telah berhasil dibuat dan invoice DP telah dibuat otomatis.
                            </p>
                        </div>

                        {/* Details box */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2 font-mono">
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-sans">Kode Project</span>
                                <span className="font-bold text-slate-900">{createdResult.projectNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-sans">No. Invoice (DP)</span>
                                <span className="font-bold text-slate-900">{createdResult.invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-sans">Nominal DP</span>
                                <span className="font-bold text-emerald-600">{formatRupiah(createdResult.nominalDp)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-sans">Jatuh Tempo</span>
                                <span className="font-semibold text-slate-700">{createdResult.dueDate}</span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Link
                                href={createdResult.projectId ? `/projects/${createdResult.projectId}` : '/projects'}
                                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center justify-center"
                            >
                                Lihat Project
                            </Link>

                            <Link
                                href={
                                    createdResult.projectId
                                        ? `/projects/${createdResult.projectId}/invoice`
                                        : '/projects'
                                }
                                className="px-4 py-2.5 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl text-xs font-bold shadow-sm shadow-black/10 transition-all flex items-center justify-center gap-1.5"
                            >
                                <span>Lihat Invoice (DP)</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
