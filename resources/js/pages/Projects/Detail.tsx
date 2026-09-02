import React, { useState, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    DollarSign,
    Clock,
    User,
    CheckCircle2,
    Briefcase,
    FileText,
    CreditCard,
    HardDrive,
    Plus,
    ExternalLink,
    Camera,
    Sparkles,
    Edit3,
    MoreVertical,
    Phone,
    Mail,
    Instagram,
    HeartHandshake,
    Package as PackageIcon,
    Layers,
    Receipt,
    Wallet,
    ShoppingBag,
    Users,
    Video,
    Check,
    HelpCircle,
    Copy,
    ChevronRight,
    ChevronDown,
    ArrowUpRight,
    X,
    Folder,
    Award,
    Printer,
    Eye,
} from 'lucide-react';
import { formatRupiah, formatDate } from '@/lib/formatters';

interface FileLinkItem {
    id: string;
    name: string;
    drive_url?: string | null;
    file_type?: string | null;
    created_at?: string;
    expires_at?: string | null;
    is_hidden?: boolean;
}

interface ProjectDetailProps {
    project: any;
    team_members: Array<{ id: string; name: string; email: string; avatar?: string; role?: string }>;
    categories: Array<{ id: string; name: string; color?: string }>;
    packages: Array<{ id: string; name: string; category_id: string; base_price: number; duration_hours?: number; description?: string }>;
    payment_methods?: Array<{ id: string; name: string; code?: string; account_number?: string; account_holder?: string; icon?: string }>;
    company_settings?: {
        name?: string;
        phone?: string;
        email?: string;
        address?: string;
        instagram?: string;
        website?: string;
    };
}

export default function ProjectDetail({
    project,
    team_members = [],
    categories = [],
    packages = [],
    payment_methods = [],
    company_settings,
}: ProjectDetailProps) {
    const bankAccounts = useMemo(() => {
        const withAccount = (payment_methods || []).filter(pm => 
            pm.account_number && !['EDC', 'CASH'].includes((pm.code || '').toUpperCase())
        );
        if (withAccount.length > 0) return withAccount;
        return [
            { id: '1', name: 'Bank Central Asia (BCA)', code: 'BCA', account_number: '123 456 7890', account_holder: company_settings?.name || 'Arams Pictures' },
            { id: '2', name: 'Bank Mandiri', code: 'MANDIRI', account_number: '987 654 3210', account_holder: company_settings?.name || 'Arams Pictures' },
        ];
    }, [payment_methods, company_settings]);

    const studioPhone = company_settings?.phone || '0812-3456-7890';
    const studioName = company_settings?.name || 'ARAMS PICTURES';
    const studioEmail = company_settings?.email || 'hello@arams.com';
    const studioWebsite = company_settings?.website || 'www.arams.com';
    const studioInstagram = company_settings?.instagram || '@aramspictures';

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentSubmitting, setPaymentSubmitting] = useState(false);
    const [paymentFormData, setPaymentFormData] = useState({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method_id: payment_methods[0]?.id || '1',
        reference_number: '',
        notes: 'Pembayaran Project',
    });

    // Invoice Modal State & Handlers
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [selectedInvoiceForPreview, setSelectedInvoiceForPreview] = useState<any>(null);
    const [invoiceSubmitting, setInvoiceSubmitting] = useState(false);
    const [invoiceFormData, setInvoiceFormData] = useState({
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Terima kasih telah memilih Arams Pictures. Pembayaran dapat ditransfer ke rekening resmi studio.',
    });

    // File Link Modal State
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkSubmitting, setLinkSubmitting] = useState(false);
    const [linkFormData, setLinkFormData] = useState({
        name: 'Master Dokumentasi Google Drive',
        drive_url: '',
        file_type: 'google_drive',
        expiry_days: '30',
    });

    // Role Capabilities
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const isOwnerOrAdmin = user?.is_admin || user?.roles?.some((r: string) => ['Super Admin', 'Owner', 'Admin'].includes(r));
    const isSupervisor = user?.is_supervisor || user?.roles?.includes('Supervisor');
    const isPhotographer = user?.is_photographer || user?.roles?.includes('Photographer');
    const isEditor = user?.is_editor || user?.roles?.includes('Editor');

    // Role-based Permissions
    const canEditProject = isOwnerOrAdmin;
    const canViewClientPortal = isOwnerOrAdmin;
    const canRecordPayment = isOwnerOrAdmin;
    const canPrintInvoice = isOwnerOrAdmin || isSupervisor;
    const canChangeMasterStatus = isOwnerOrAdmin || isSupervisor;
    const canViewFinancials = isOwnerOrAdmin || isSupervisor;
    const canManageTeam = isOwnerOrAdmin;

    // Determine if project is Wedding category
    const isWedding = useMemo(() => {
        const catName = (project.category?.name || '').toLowerCase();
        const projName = (project.name || '').toLowerCase();
        return catName.includes('wedding') && !catName.includes('prewedding') && !projName.includes('prewedding');
    }, [project]);

    // 2 Workflow Pipelines from Zoom Meeting (Pak Adit)
    // 1. Wedding (8 Steps)
    // 2. Prewedding/Event/Family/etc (5 Steps)
    const workflowSteps = useMemo(() => {
        if (isWedding) {
            return [
                { id: 'booking', label: '1. Booking & DP', desc: 'Pembayaran DP & konfirmasi tanggal' },
                { id: 'tm_wedding', label: '2. TM Wedding', desc: 'Technical meeting & koordinasi rundown' },
                { id: 'event', label: '3. Hari H', desc: 'Pelaksanaan photoshoot acara' },
                { id: 'sneak_peak', label: '4. Sneak Peek Editing', desc: 'Editing cepat 20-30 foto preview' },
                { id: 'flashdrive', label: '5. Flashdrive Delivery', desc: 'Pengiriman flashdrive & raw files' },
                { id: 'full_editing', label: '6. Full Photo & Video Edit', desc: 'Full edit video HL & tone foto' },
                { id: 'album_layout', label: '7. Album Layout Edit', desc: 'Penyusunan & cetak album fisik' },
                { id: 'final_delivery', label: '8. Final Delivery', desc: 'Penyerahan semua paket & pelunasan' },
            ];
        }

        return [
            { id: 'booking', label: '1. Booking & DP', desc: 'Pembayaran DP & konfirmasi booking' },
            { id: 'meeting_concept', label: '2. Preparation Concept', desc: 'Diskusi konsep, moodboard & wardrobe' },
            { id: 'event', label: '3. Hari H', desc: 'Pelaksanaan photoshoot di lokasi' },
            { id: 'full_editing', label: '4. Photo & Video Editing', desc: 'Proses editing warna & retouching' },
            { id: 'final_delivery', label: '5. Final Delivery', desc: 'Penyerahan hasil final & drive download' },
        ];
    }, [isWedding]);

    // Find current step index
    const currentStepIndex = useMemo(() => {
        const step = project.workflow_step || 'booking';
        const idx = workflowSteps.findIndex((s) => s.id === step);
        return idx !== -1 ? idx : 0;
    }, [project.workflow_step, workflowSteps]);

    // Editing Sub-Checklist (Bu Icha Spec)
    const [editingChecklist, setEditingChecklist] = useState({
        edited_photo: true,
        revisi_edited_photo: false,
        final_edited_photo: false,
        edited_video_hl: true,
        revisi_edited_video_hl: false,
        edited_full_doc: false,
        final_edited_video_hl: false,
        final_edited_full_doc: false,
    });

    const toggleChecklistItem = (key: keyof typeof editingChecklist) => {
        setEditingChecklist((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
        toast.success(`Checklist editing diperbarui`);
    };

    // Calculate editing checklist progress
    const editingProgress = useMemo(() => {
        const activeItems = Object.values(editingChecklist);
        const checkedCount = activeItems.filter(Boolean).length;
        return Math.round((checkedCount / activeItems.length) * 100);
    }, [editingChecklist]);

    // 5 Project Statuses (Belum Dimulai, Sedang Dikerjakan, Pending, Selesai, Batal)
    const PROJECT_STATUSES = [
        { id: 'draft', label: 'Belum Dimulai', badgeClass: 'bg-slate-100 text-slate-700 border-slate-300', dotColor: 'bg-slate-400' },
        { id: 'in_progress', label: 'Sedang Dikerjakan', badgeClass: 'bg-amber-50 text-amber-800 border-amber-300', dotColor: 'bg-amber-500' },
        { id: 'pending', label: 'Pending / Tertunda', badgeClass: 'bg-purple-50 text-purple-700 border-purple-300', dotColor: 'bg-purple-500' },
        { id: 'completed', label: 'Selesai', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300', dotColor: 'bg-emerald-500' },
        { id: 'cancelled', label: 'Batal', badgeClass: 'bg-rose-50 text-rose-700 border-rose-300', dotColor: 'bg-rose-500' },
    ];

    const getStatusInfo = (st: string) => {
        const found = PROJECT_STATUSES.find((s) => s.id === st);
        if (found) return found;
        if (st === 'editing') return { id: 'editing', label: 'Proses Editing', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-300', dotColor: 'bg-indigo-500' };
        if (st === 'on_hold') return { id: 'on_hold', label: 'Pending / Tertunda', badgeClass: 'bg-purple-50 text-purple-700 border-purple-300', dotColor: 'bg-purple-500' };
        return PROJECT_STATUSES[0];
    };

    const [isHeaderStatusOpen, setIsHeaderStatusOpen] = useState(false);

    // Direct Status Change (Supports all 5 statuses)
    const handleDirectStatusChange = (newStatus: string) => {
        setIsHeaderStatusOpen(false);

        let newProgress = project.progress || 0;
        let newStep = project.workflow_step || workflowSteps[0].id;

        if (newStatus === 'completed') {
            newProgress = 100;
            newStep = workflowSteps[workflowSteps.length - 1].id;
        } else if (newStatus === 'draft') {
            newProgress = 0;
            newStep = workflowSteps[0].id;
        }

        router.patch(
            `/projects/${project.id}/status`,
            {
                status: newStatus,
                progress: newProgress,
                workflow_step: newStep,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    const info = getStatusInfo(newStatus);
                    toast.success(`Status project berhasil diubah ke: ${info.label}`);
                },
                onError: () => {
                    toast.error('Gagal mengubah status project');
                },
            }
        );
    };

    // Handle Workflow Stepper Change (Automatically synchronizes status)
    const handleWorkflowStepChange = (stepId: string, idx: number) => {
        const newProgress = Math.round(((idx + 1) / workflowSteps.length) * 100);
        const newStatus = idx === workflowSteps.length - 1 ? 'completed' : idx === 0 ? 'draft' : 'in_progress';

        router.patch(
            `/projects/${project.id}/status`,
            {
                workflow_step: stepId,
                progress: newProgress,
                status: newStatus,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Alur progress diperbarui ke: ${workflowSteps[idx].label}`);
                },
                onError: () => {
                    toast.error('Gagal memperbarui alur progress');
                },
            }
        );
    };

    // Financial calculations
    const totalAmount = Number(project.total_amount) || 0;
    const paidAmount = Number(project.paid_amount) || 0;
    const remainingAmount = Math.max(0, totalAmount - paidAmount);
    const basePrice = Number(project.price || project.package?.base_price) || 0;
    const discount = Number(project.discount) || 0;
    const tax = Number(project.tax) || 0;
    const addonsTotal = (project.project_addons || []).reduce(
        (acc: number, curr: any) =>
            acc + (Number(curr.total_price) || (Number(curr.unit_price) * Number(curr.qty)) || 0),
        0
    );

    // Handle Payment Submission
    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentFormData.amount || Number(paymentFormData.amount) <= 0) {
            toast.error('Silakan masukkan jumlah pembayaran yang valid');
            return;
        }

        setPaymentSubmitting(true);
        router.post(
            '/finance/payments',
            {
                project_id: project.id,
                amount: paymentFormData.amount,
                payment_date: paymentFormData.payment_date,
                payment_method_id: paymentFormData.payment_method_id,
                reference_number: paymentFormData.reference_number,
                notes: paymentFormData.notes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPaymentSubmitting(false);
                    setIsPaymentModalOpen(false);
                    toast.success('Pembayaran berhasil dicatat!');
                },
                onError: () => {
                    setPaymentSubmitting(false);
                    toast.error('Gagal mencatat pembayaran');
                },
            }
        );
    };

    // Handle Invoice Submission
    const handleInvoiceSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setInvoiceSubmitting(true);
        router.post(
            '/finance/invoices',
            {
                project_id: project.id,
                issue_date: invoiceFormData.issue_date,
                due_date: invoiceFormData.due_date,
                notes: invoiceFormData.notes,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setInvoiceSubmitting(false);
                    setIsInvoiceModalOpen(false);
                    toast.success('Invoice berhasil diterbitkan!');
                },
                onError: () => {
                    setInvoiceSubmitting(false);
                    toast.error('Gagal menerbitkan invoice');
                },
            }
        );
    };

    // Handle Clean 1-Page A4 PDF / Print for Invoice
    const handlePrintInvoice = () => {
        const printableElement = document.getElementById('invoice-printable-area');
        if (!printableElement) {
            window.print();
            return;
        }

        // Create an isolated hidden iframe so no background dashboard elements leak into the print count
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (!doc) {
            window.print();
            return;
        }

        // Collect all active CSS styles to maintain exact luxury styling
        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map((s) => s.outerHTML)
            .join('\n');

        const invoiceNo = project.invoices?.[0]?.invoice_number || project.project_number || 'Official';

        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html lang="id">
                <head>
                    <title>Invoice_${invoiceNo}</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    ${styles}
                    <style>
                        @page {
                            size: A4 portrait;
                            margin: 8mm 10mm;
                        }
                        html, body {
                            background: #ffffff !important;
                            color: #1c1917 !important;
                            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            width: 100% !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        #invoice-printable-area {
                            padding: 0 !important;
                            margin: 0 !important;
                            width: 100% !important;
                            max-width: 100% !important;
                            box-shadow: none !important;
                            border: none !important;
                            background: #ffffff !important;
                            font-size: 11px !important;
                            line-height: 1.35 !important;
                            overflow: visible !important;
                        }
                        .space-y-6 > :not([hidden]) ~ :not([hidden]) {
                            margin-top: 0.85rem !important;
                        }
                        table th, table td {
                            padding-top: 5px !important;
                            padding-bottom: 5px !important;
                        }
                        .break-inside-avoid, tr {
                            break-inside: avoid !important;
                            page-break-inside: avoid !important;
                        }
                    </style>
                </head>
                <body class="bg-white text-stone-800 p-0 m-0">
                    <div id="invoice-printable-area" class="p-0 space-y-4 bg-white text-stone-800 font-sans text-xs leading-normal">
                        ${printableElement.innerHTML}
                    </div>
                </body>
            </html>
        `);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
            }, 1500);
        }, 350);
    };

    // Handle File Link Submission
    const handleLinkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!linkFormData.drive_url) {
            toast.error('Silakan masukkan URL Link Google Drive');
            return;
        }

        setLinkSubmitting(true);
        router.post(
            `/projects/${project.id}/file-links`,
            linkFormData,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLinkSubmitting(false);
                    setIsLinkModalOpen(false);
                    toast.success('Link Google Drive berhasil ditambahkan!');
                },
                onError: () => {
                    setLinkSubmitting(false);
                    toast.error('Gagal menambahkan link');
                },
            }
        );
    };

    return (
        <div className="space-y-6 pb-16">
            <Head title={`${project.name} - Detail Project`} />

            {/* 1. TOP BREADCRUMB & ACTION HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs">
                    <Link
                        href="/projects"
                        className="text-slate-400 hover:text-slate-700 hover:underline transition-colors"
                    >
                        Projects
                    </Link>
                    <span className="text-slate-400">›</span>
                    <span className="font-mono text-slate-500 font-medium">
                        {project.project_number}
                    </span>
                    <span className="text-slate-400">›</span>
                    <span className="text-slate-900 font-bold truncate max-w-xs">
                        {project.name}
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* View in Client Portal - Only Admin / Owner */}
                    {canViewClientPortal && (
                        <a
                            href={`/portal?project=${project.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                        >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                            <span>Portal Klien ↗</span>
                        </a>
                    )}

                    {/* Record Payment Button - Only Admin / Owner and only if not paid yet */}
                    {canRecordPayment && remainingAmount > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                setPaymentFormData({
                                    amount: remainingAmount > 0 ? String(remainingAmount) : '',
                                    payment_date: new Date().toISOString().split('T')[0],
                                    payment_method_id: payment_methods[0]?.id || '1',
                                    reference_number: '',
                                    notes: `Pelunasan Project ${project.project_number}`,
                                });
                                setIsPaymentModalOpen(true);
                            }}
                            className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[#A6702E] text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                            <CreditCard className="w-3.5 h-3.5 text-[#A6702E]" />
                            <span>+ Catat Pembayaran</span>
                        </button>
                    )}

                    {/* Lihat Invoice Button - Admin / Owner / Supervisor */}
                    {canPrintInvoice && (
                        <Link
                            href={`/projects/${project.id}/invoice`}
                            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                        >
                            <FileText className="w-3.5 h-3.5 text-[#3B46F1]" />
                            <span>Lihat Invoice</span>
                        </Link>
                    )}

                    {/* Edit Project Button - Only Admin / Owner */}
                    {canEditProject && (
                        <Link
                            href={`/projects/${project.id}/edit`}
                            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                        >
                            <Edit3 className="w-3.5 h-3.5 text-white" />
                            <span>Edit Project</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* 2. TOP UNIFIED PROJECT KPI & HEADER CARD */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left: Project Title & Identity (5 Cols) */}
                <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-amber-50 text-[#A6702E] border border-amber-200">
                            {project.project_number}
                        </span>
                        <span
                            className="px-2.5 py-0.5 rounded-lg text-xs font-bold text-white uppercase shadow-2xs"
                            style={{ backgroundColor: project.category?.color || '#C89445' }}
                        >
                            {project.category?.name || 'Wedding'}
                        </span>

                        {/* Interactive Status Selector Dropdown */}
                        <div className="relative inline-block">
                            {canChangeMasterStatus ? (
                                <button
                                    type="button"
                                    onClick={() => setIsHeaderStatusOpen(!isHeaderStatusOpen)}
                                    className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:opacity-90 ${getStatusInfo(project.status).badgeClass}`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${getStatusInfo(project.status).dotColor}`} />
                                    <span>{getStatusInfo(project.status).label}</span>
                                    <ChevronDown className="w-3 h-3 opacity-60" />
                                </button>
                            ) : (
                                <div className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${getStatusInfo(project.status).badgeClass}`}>
                                    <span className={`w-2 h-2 rounded-full ${getStatusInfo(project.status).dotColor}`} />
                                    <span>{getStatusInfo(project.status).label}</span>
                                </div>
                            )}

                            {canChangeMasterStatus && isHeaderStatusOpen && (
                                <div className="absolute left-0 top-8 z-30 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 space-y-1 animate-in fade-in zoom-in-95">
                                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        Pilih Status Project
                                    </div>
                                    {PROJECT_STATUSES.map((st) => (
                                        <button
                                            key={st.id}
                                            type="button"
                                            onClick={() => handleDirectStatusChange(st.id)}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                                project.status === st.id
                                                    ? `${st.badgeClass} ring-1 ring-inset`
                                                    : 'hover:bg-slate-50 text-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${st.dotColor}`} />
                                                <span>{st.label}</span>
                                            </div>
                                            {project.status === st.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        {project.name}
                    </h1>

                    <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                        <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <strong className="text-slate-800">{project.client?.name || 'Andi Pratama'}</strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <PackageIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span>{project.package?.name || 'Paket Royal Wedding'}</span>
                        </span>
                    </div>
                </div>

                {/* Right: 4 Financial or Operational KPI Boxes based on Role */}
                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {canViewFinancials ? (
                        <>
                            {/* KPI 1: TOTAL NILAI PROJECT */}
                            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 space-y-1">
                                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-mono font-bold text-xs">
                                    Rp
                                </div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                                    TOTAL NILAI
                                </span>
                                <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono block truncate">
                                    {formatRupiah(totalAmount)}
                                </span>
                            </div>

                            {/* KPI 2: TERBAYAR */}
                            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3.5 space-y-1">
                                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <Receipt className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                                    TERBAYAR
                                </span>
                                <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono block truncate">
                                    {formatRupiah(paidAmount)}
                                </span>
                            </div>

                            {/* KPI 3: SISA TAGIHAN */}
                            <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-3.5 space-y-1">
                                <div className="w-7 h-7 rounded-lg bg-amber-100 text-[#C89445] flex items-center justify-center">
                                    <Wallet className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                                    SISA TAGIHAN
                                </span>
                                <span className="text-sm sm:text-base font-extrabold text-[#A6702E] font-mono block truncate">
                                    {formatRupiah(remainingAmount)}
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Operational 1: TANGGAL SHOOT */}
                            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3.5 space-y-1">
                                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <Calendar className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                                    TANGGAL SHOOT
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                                    {project.event_date ? formatDate(project.event_date) : 'Belum Ditentukan'}
                                </span>
                            </div>

                            {/* Operational 2: DEADLINE FINAL */}
                            <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-3.5 space-y-1">
                                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                                    <Clock className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                                    DEADLINE
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-amber-800 block truncate">
                                    {project.deadline ? formatDate(project.deadline) : '-'}
                                </span>
                            </div>

                            {/* Operational 3: KATEGORI */}
                            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 space-y-1">
                                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <Camera className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                                    KATEGORI
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                                    {project.category?.name || 'Wedding'}
                                </span>
                            </div>
                        </>
                    )}

                    {/* KPI 4: PROGRESS KERJA (All Roles) */}
                    <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-3.5 space-y-1">
                        <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                            PROGRESS
                        </span>
                        <span className="text-base sm:text-lg font-extrabold text-purple-700 font-mono block">
                            {project.progress || 0}%
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. WORKFLOW PROGRESS PIPELINE (DYNAMIC 8 STEPS WEDDING vs 5 STEPS NON-WEDDING) */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                ALUR PROGRESS KERJA STUDIO ({isWedding ? 'WEDDING - 8 TAHAPAN' : 'NON-WEDDING - 5 TAHAPAN'})
                            </h2>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-[#A6702E] border border-amber-200">
                                Tahap {currentStepIndex + 1} dari {workflowSteps.length}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Klik salah satu bulatan tahapan untuk memperbarui status pengerjaan project secara otomatis.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 font-mono bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                            Progress Total: {project.progress || 0}% Selesai
                        </span>
                    </div>
                </div>

                {/* Status Alert Banners for Pending or Cancelled */}
                {(project.status === 'pending' || project.status === 'on_hold') && (
                    <div className="bg-purple-50 border border-purple-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-purple-900 text-xs animate-in fade-in">
                        <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse shrink-0" />
                            <span>
                                <strong>Status Project: PENDING / TERTUNDA</strong> — Pengerjaan project sedang ditunda sementara.
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleDirectStatusChange('in_progress')}
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                        >
                            Lanjutkan Pengerjaan →
                        </button>
                    </div>
                )}

                {project.status === 'cancelled' && (
                    <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-900 text-xs animate-in fade-in">
                        <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                            <span>
                                <strong>Status Project: BATAL</strong> — Project ini telah dibatalkan.
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleDirectStatusChange('in_progress')}
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                        >
                            Aktifkan Kembali Project
                        </button>
                    </div>
                )}

                {/* Responsive Stepper Container */}
                <div className="overflow-x-auto py-2">
                    <div className="flex items-center min-w-[760px] justify-between relative px-2">
                        {workflowSteps.map((step, idx) => {
                            const isDone = idx < currentStepIndex;
                            const isCurrent = idx === currentStepIndex;

                            return (
                                <React.Fragment key={step.id}>
                                    <button
                                        type="button"
                                        onClick={() => handleWorkflowStepChange(step.id, idx)}
                                        className="flex flex-col items-center gap-1.5 group cursor-pointer relative z-10 text-center max-w-[100px]"
                                    >
                                        <div
                                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-2xs ${
                                                isCurrent
                                                    ? 'bg-[#C89445] text-white ring-4 ring-amber-100 shadow-md scale-110'
                                                    : isDone
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 border border-slate-200'
                                            }`}
                                        >
                                            {isDone ? (
                                                <Check className="w-4 h-4 stroke-[3]" />
                                            ) : (
                                                idx + 1
                                            )}
                                        </div>

                                        <span
                                            className={`text-[10px] sm:text-[11px] font-bold leading-tight ${
                                                isCurrent
                                                    ? 'text-[#A6702E]'
                                                    : isDone
                                                    ? 'text-slate-800'
                                                    : 'text-slate-400'
                                            }`}
                                        >
                                            {step.label}
                                        </span>
                                    </button>

                                    {idx < workflowSteps.length - 1 && (
                                        <div
                                            className={`flex-1 h-1 mx-1.5 rounded-full transition-all ${
                                                idx < currentStepIndex ? 'bg-emerald-500' : 'bg-slate-200'
                                            }`}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 4. SUB-CHECKLIST DETAIL EDITING INTERNAL (BU ICHA SPEC) */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                    CHECKLIST DETAIL PENGERJAAN EDITING (INTERNAL STUDIO)
                                </h3>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                    Progress Editing: {editingProgress}%
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Centang item yang sudah dikerjakan oleh Editor. Opsi revisi &amp; full doc bersifat opsional sesuai kebutuhan klien.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2-Columns Checklist Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* Item 1 */}
                    <label className={`p-3 rounded-2xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        editingChecklist.edited_photo ? 'bg-purple-50/50 border-purple-200 text-purple-900' : 'bg-slate-50 border-slate-200/70 text-slate-600'
                    }`}>
                        <input
                            type="checkbox"
                            checked={editingChecklist.edited_photo}
                            onChange={() => toggleChecklistItem('edited_photo')}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 mt-0.5"
                        />
                        <div>
                            <span className="font-bold block">1. Edited Photo</span>
                            <span className="text-[10px] text-slate-400">Tone color &amp; basic retouched</span>
                        </div>
                    </label>

                    {/* Item 2 */}
                    <label className={`p-3 rounded-2xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        editingChecklist.revisi_edited_photo ? 'bg-amber-50/50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200/70 text-slate-600'
                    }`}>
                        <input
                            type="checkbox"
                            checked={editingChecklist.revisi_edited_photo}
                            onChange={() => toggleChecklistItem('revisi_edited_photo')}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 mt-0.5"
                        />
                        <div>
                            <span className="font-bold block">2. Revisi Edited Photo</span>
                            <span className="text-[10px] text-slate-400">Dicentang jika ada revisi dari klien</span>
                        </div>
                    </label>

                    {/* Item 3 */}
                    <label className={`p-3 rounded-2xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        editingChecklist.final_edited_photo ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200/70 text-slate-600'
                    }`}>
                        <input
                            type="checkbox"
                            checked={editingChecklist.final_edited_photo}
                            onChange={() => toggleChecklistItem('final_edited_photo')}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                        />
                        <div>
                            <span className="font-bold block">3. Final Edited Photo</span>
                            <span className="text-[10px] text-slate-400">Finishing 100% tanpa revisi lanjutan</span>
                        </div>
                    </label>

                    {/* Item 4 */}
                    <label className={`p-3 rounded-2xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        editingChecklist.edited_video_hl ? 'bg-purple-50/50 border-purple-200 text-purple-900' : 'bg-slate-50 border-slate-200/70 text-slate-600'
                    }`}>
                        <input
                            type="checkbox"
                            checked={editingChecklist.edited_video_hl}
                            onChange={() => toggleChecklistItem('edited_video_hl')}
                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 mt-0.5"
                        />
                        <div>
                            <span className="font-bold block">4. Edited Video HL</span>
                            <span className="text-[10px] text-slate-400">Video highlight sinematik 1-3 menit</span>
                        </div>
                    </label>

                    {/* Item 5 */}
                    <label className={`p-3 rounded-2xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        editingChecklist.revisi_edited_video_hl ? 'bg-amber-50/50 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200/70 text-slate-600'
                    }`}>
                        <input
                            type="checkbox"
                            checked={editingChecklist.revisi_edited_video_hl}
                            onChange={() => toggleChecklistItem('revisi_edited_video_hl')}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 mt-0.5"
                        />
                        <div>
                            <span className="font-bold block">5. Revisi Video HL</span>
                            <span className="text-[10px] text-slate-400">Dicentang jika ada revisi audio/cut</span>
                        </div>
                    </label>

                    {/* Item 6 */}
                    <label className={`p-3 rounded-2xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        editingChecklist.edited_full_doc ? 'bg-blue-50/50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-200/70 text-slate-600'
                    }`}>
                        <input
                            type="checkbox"
                            checked={editingChecklist.edited_full_doc}
                            onChange={() => toggleChecklistItem('edited_full_doc')}
                            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                        />
                        <div>
                            <span className="font-bold block">6. Edited Full Doc</span>
                            <span className="text-[10px] text-slate-400">Dokumentasi video lengkap acara</span>
                        </div>
                    </label>

                    {/* Item 7 */}
                    <label className={`p-3 rounded-2xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        editingChecklist.final_edited_video_hl ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200/70 text-slate-600'
                    }`}>
                        <input
                            type="checkbox"
                            checked={editingChecklist.final_edited_video_hl}
                            onChange={() => toggleChecklistItem('final_edited_video_hl')}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                        />
                        <div>
                            <span className="font-bold block">7. Final Video HL</span>
                            <span className="text-[10px] text-slate-400">Render 4K siap rilis ke klien</span>
                        </div>
                    </label>

                    {/* Item 8 */}
                    <label className={`p-3 rounded-2xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        editingChecklist.final_edited_full_doc ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200/70 text-slate-600'
                    }`}>
                        <input
                            type="checkbox"
                            checked={editingChecklist.final_edited_full_doc}
                            onChange={() => toggleChecklistItem('final_edited_full_doc')}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5"
                        />
                        <div>
                            <span className="font-bold block">8. Final Full Doc</span>
                            <span className="text-[10px] text-slate-400">Export video master resolusi penuh</span>
                        </div>
                    </label>
                </div>
            </div>

            {/* 5. MAIN 2-COLUMN GRID (PROJECT DETAILS & SIDEBAR) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT COLUMN: 7 COLS (CLIENT, ACARA, PAKET, ADDONS, GDRIVE) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* CARD 1: INFORMASI KLIEN, WO / REFERRAL & JADWAL ACARA */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-500" />
                                <span>INFORMASI KLIEN &amp; DETAIL ACARA</span>
                            </h3>
                            {project.client?.id && (
                                <Link
                                    href={`/clients/${project.client.id}`}
                                    className="text-xs font-bold text-[#A6702E] hover:underline flex items-center gap-1"
                                >
                                    <span>Lihat Profil Klien</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            {/* Klien Utama */}
                            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    KLIEN UTAMA
                                </span>
                                <h4 className="text-sm font-bold text-slate-900">{project.client?.name || 'Andi Pratama'}</h4>
                                <p className="text-slate-600 flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                    <a
                                        href={`https://wa.me/${(project.client?.phone || '081234567890').replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-mono font-semibold text-emerald-600 hover:underline"
                                    >
                                        {project.client?.phone || '0812 3456 7890'}
                                    </a>
                                </p>
                                <p className="text-slate-600 flex items-center gap-1.5 truncate">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{project.client?.email || 'client@arams.com'}</span>
                                </p>
                            </div>

                            {/* Wedding Organizer / Referral */}
                            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    WEDDING ORGANIZER / REFERRAL
                                </span>
                                {project.wedding_organizer ? (
                                    <>
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="text-sm font-bold text-slate-900">{project.wedding_organizer.name}</h4>
                                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 uppercase">
                                                {project.wedding_organizer.tier || 'Gold Partner'}
                                            </span>
                                        </div>
                                        <p className="text-slate-600">
                                            PIC: <strong>{project.wedding_organizer.pic_name || 'Admin WO'}</strong>
                                        </p>
                                        <p className="text-slate-500 font-mono text-[11px]">
                                            {project.wedding_organizer.phone || '-'}
                                        </p>
                                    </>
                                ) : (
                                    <div className="text-slate-400 py-1">
                                        <span>Sumber: <strong>{project.client?.source || 'Direct Client / Instagram'}</strong></span>
                                        <p className="text-[11px] text-slate-400 mt-1">Tanpa perantara Wedding Organizer</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Jadwal & Lokasi Acara */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                            <div className="space-y-0.5">
                                <span className="text-slate-400 text-[11px] block">Tanggal &amp; Waktu Acara:</span>
                                <p className="font-bold text-slate-900 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>
                                        {project.event_date ? formatDate(project.event_date) : '22 Mei 2026'}
                                        {project.event_time ? ` • ${project.event_time}` : ''}
                                    </span>
                                </p>
                            </div>

                            <div className="space-y-0.5">
                                <span className="text-slate-400 text-[11px] block">Tanggal Selesai:</span>
                                <p className="font-bold text-slate-900 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{project.end_date ? formatDate(project.end_date) : formatDate(project.event_date) || '-'}</span>
                                </p>
                            </div>

                            <div className="space-y-0.5">
                                <span className="text-slate-400 text-[11px] block">Deadline Penyerahan:</span>
                                <p className="font-bold text-amber-700 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    <span>{project.deadline ? formatDate(project.deadline) : '22 Juni 2026'}</span>
                                </p>
                            </div>
                        </div>

                        {/* Lokasi */}
                        <div className="pt-2 border-t border-slate-100 flex items-start justify-between gap-4 text-xs">
                            <div>
                                <span className="text-slate-400 text-[11px] block">Lokasi &amp; Venue Acara:</span>
                                <p className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                    <span>{project.location || 'Grand Ballroom Hotel Mulia Senayan, Jakarta Selatan'}</span>
                                </p>
                            </div>

                            {project.location && (
                                <a
                                    href={`https://maps.google.com/?q=${encodeURIComponent(project.location)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shrink-0 flex items-center gap-1"
                                >
                                    <span>Buka Maps</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>

                        {/* Notes */}
                        {project.notes && (
                            <div className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-100 text-xs text-slate-700 space-y-1">
                                <span className="font-bold text-[#A6702E] block">Catatan &amp; Preferensi Khusus:</span>
                                <p className="leading-relaxed">{project.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* CARD 2: RINCIAN PAKET UTAMA & ADD-ONS / CUSTOM FEES */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                <PackageIcon className="w-4 h-4 text-slate-500" />
                                <span>RINCIAN PAKET &amp; BIAYA TAMBAHAN (ADD-ONS)</span>
                            </h3>
                            <span className="font-mono font-bold text-xs text-slate-900">
                                {project.project_addons?.length || 0} Addon Terpilih
                            </span>
                        </div>

                        {/* Paket Utama Card */}
                        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                        PAKET UTAMA
                                    </span>
                                    <h4 className="text-sm font-bold text-slate-900">
                                        {project.package?.name || 'Custom Package'}
                                    </h4>
                                </div>
                                <span className="font-mono font-bold text-sm text-slate-900">
                                    {formatRupiah(basePrice)}
                                </span>
                            </div>
                            {project.package?.description && (
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    {project.package.description}
                                </p>
                            )}
                        </div>

                        {/* List Addons & Custom Fees */}
                        {project.project_addons && project.project_addons.length > 0 ? (
                            <div className="space-y-2">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                    Add-on &amp; Biaya Kustom:
                                </span>

                                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden text-xs">
                                    {project.project_addons.map((add: any, idx: number) => (
                                        <div key={add.id || idx} className="p-3 bg-white flex items-center justify-between gap-3">
                                            <div className="space-y-0.5">
                                                <span className="font-bold text-slate-900">
                                                    {add.addon?.name || add.custom_name || 'Biaya Tambahan'}
                                                </span>
                                                <span className="text-[11px] text-slate-400 block font-mono">
                                                    {add.qty} {add.unit || 'item'} × {formatRupiah(add.unit_price)}
                                                </span>
                                            </div>
                                            <span className="font-mono font-bold text-slate-800">
                                                {formatRupiah(add.total_price)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {/* Financial Summary Breakdown */}
                        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                            <div className="flex items-center justify-between text-slate-600">
                                <span>Harga Dasar Paket</span>
                                <span className="font-mono">{formatRupiah(basePrice)}</span>
                            </div>

                            {discount > 0 && (
                                <div className="flex items-center justify-between text-rose-600">
                                    <span>Potongan Diskon</span>
                                    <span className="font-mono">- {formatRupiah(discount)}</span>
                                </div>
                            )}

                            {tax > 0 && (
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>Pajak PPN</span>
                                    <span className="font-mono">+ {formatRupiah(tax)}</span>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                                <span>Total Tagihan Project</span>
                                <span className="font-mono text-emerald-600">{formatRupiah(totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* CARD 3: FILE & LINK GOOGLE DRIVE DOKUMENTASI */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
                                    <HardDrive className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                        LINK GOOGLE DRIVE DOKUMENTASI
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Tautan ini dapat diakses langsung oleh klien pada Portal Klien.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsLinkModalOpen(true)}
                                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Link</span>
                            </button>
                        </div>

                        {project.file_links && project.file_links.length > 0 ? (
                            <div className="space-y-2.5">
                                {project.file_links.map((f: FileLinkItem) => (
                                    <div
                                        key={f.id}
                                        className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                    >
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-slate-900 block truncate">{f.name}</span>
                                                {f.expires_at ? (
                                                    new Date(f.expires_at).getTime() <= Date.now() ? (
                                                        <span className="px-2 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                            Expired (Hide dari Klien)
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            Aktif s.d. {formatDate(f.expires_at)}
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="px-2 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                                        Permanen
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-slate-400 block font-mono truncate max-w-md">
                                                {f.drive_url}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (f.drive_url) {
                                                        navigator.clipboard.writeText(f.drive_url);
                                                        toast.success('Link berhasil disalin ke clipboard!');
                                                    }
                                                }}
                                                className="p-2 rounded-xl border border-slate-200 hover:bg-white text-slate-600 transition-colors shadow-2xs"
                                                title="Salin Link"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>

                                            <a
                                                href={f.drive_url || '#'}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors flex items-center gap-1 shadow-2xs"
                                            >
                                                <span>Buka GDrive</span>
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                                <HardDrive className="w-8 h-8 text-slate-300 mx-auto" />
                                <p className="text-xs text-slate-500 font-medium">
                                    Belum ada Link Google Drive yang diinput untuk project ini.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setIsLinkModalOpen(true)}
                                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Input Link Drive Sekarang</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: 5 COLS (TIM CREW, PEMBAYARAN, RIWAYAT AKTIVITAS) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* CARD 4: TIM YANG DITUGASKAN (CREW ASSIGNMENT) */}
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-500" />
                                <span>TIM STUDIO YANG DITUGASKAN</span>
                            </h3>
                            {canManageTeam && (
                                <Link
                                    href={`/projects/${project.id}/edit`}
                                    className="text-xs font-bold text-[#A6702E] hover:underline"
                                >
                                    Ubah Tim
                                </Link>
                            )}
                        </div>

                        <div className="space-y-3">
                            {/* Supervisor */}
                            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-3.5">
                                <img
                                    src={project.supervisor?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'}
                                    alt="Supervisor"
                                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h4 className="text-xs font-bold text-slate-900 truncate">
                                            {project.supervisor?.name || 'Rian Hidayat'}
                                        </h4>
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800">
                                            Supervisor
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 truncate">
                                        {project.supervisor?.email || 'supervisor@arams.com'}
                                    </p>
                                </div>
                            </div>

                            {/* Photographer */}
                            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-3.5">
                                <img
                                    src={project.photographer?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'}
                                    alt="Photographer"
                                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h4 className="text-xs font-bold text-slate-900 truncate">
                                            {project.photographer?.name || 'Sinta Pratama'}
                                        </h4>
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800">
                                            Photographer
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 truncate">
                                        {project.photographer?.email || 'photographer@arams.com'}
                                    </p>
                                </div>
                            </div>

                            {/* Editor */}
                            <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center gap-3.5">
                                <img
                                    src={project.editor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                                    alt="Editor"
                                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h4 className="text-xs font-bold text-slate-900 truncate">
                                            {project.editor?.name || 'Budi Santoso'}
                                        </h4>
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-purple-100 text-purple-800">
                                            Retoucher / Editor
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 truncate">
                                        {project.editor?.email || 'editor@arams.com'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CARD 5: RIWAYAT PEMBAYARAN & INVOICE PROJECT (OR CREW BRIEFING FOR PHOTOGRAPHER/EDITOR) */}
                    {canViewFinancials ? (
                        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                            {/* Clean Header */}
                            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#C89445] flex items-center justify-center border border-amber-100/60">
                                        <Receipt className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                            RIWAYAT PEMBAYARAN &amp; INVOICE
                                        </h3>
                                        <p className="text-[11px] text-slate-400">Pencatatan termin &amp; bukti invoice</p>
                                    </div>
                                </div>

                                <span
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border ${
                                        remainingAmount === 0
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : paidAmount > 0
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : 'bg-amber-50 text-amber-800 border-amber-200'
                                    }`}
                                >
                                    {remainingAmount === 0 ? 'LUNAS' : paidAmount > 0 ? 'DP DITERIMA' : 'BELUM BAYAR'}
                                </span>
                            </div>

                            {/* List Invoices (If Any) */}
                            {project.invoices && project.invoices.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Invoice Terbit ({project.invoices.length}):
                                    </span>
                                    <div className="space-y-1.5 text-xs">
                                        {project.invoices.map((inv: any) => (
                                            <div
                                                key={inv.id}
                                                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2 hover:bg-slate-100/80 transition-colors"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                                    <div className="truncate">
                                                        <span className="font-mono font-bold text-slate-900 block truncate">
                                                            {inv.invoice_number}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 block">
                                                            Terbit: {formatDate(inv.issue_date)} • Tempo: {formatDate(inv.due_date)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                            inv.status === 'paid'
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                                                        }`}
                                                    >
                                                        {inv.status === 'paid' ? 'Lunas' : 'Terkirim'}
                                                    </span>
                                                    <Link
                                                        href={`/projects/${project.id}/invoice?invoice_id=${inv.id}`}
                                                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-indigo-600 text-xs font-semibold cursor-pointer flex items-center gap-1 shadow-2xs"
                                                        title="Lihat / Cetak Invoice"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Lihat</span>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* List Payments */}
                            {project.payments && project.payments.length > 0 ? (
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Pembayaran Diterima ({project.payments.length}):
                                    </span>
                                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden text-xs">
                                        {project.payments.map((p: any) => (
                                            <div key={p.id} className="p-3 bg-slate-50/50 flex items-center justify-between gap-2">
                                                <div>
                                                    <span className="font-semibold text-slate-800 block">
                                                        {p.payment_method?.name || 'Transfer Bank'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                        {p.payment_date ? formatDate(p.payment_date) : '-'} • Ref: {p.reference_number || '-'}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-mono font-bold text-emerald-600 block">
                                                        + {formatRupiah(p.amount)}
                                                    </span>
                                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        Sukses
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-6 px-4 text-center rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 space-y-1.5">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-700">Belum Ada Pembayaran Masuk</p>
                                    <p className="text-[11px] text-slate-400">
                                        Catat pembayaran DP atau pelunasan untuk memperbarui status keuangan project.
                                    </p>
                                </div>
                            )}

                            {/* Financial Summary Box */}
                            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 font-medium">Telah Diterima:</span>
                                    <span className="font-mono font-extrabold text-emerald-600 text-sm">
                                        {formatRupiah(paidAmount)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                                    <span className="text-slate-600 font-bold">Sisa Tagihan:</span>
                                    <span className="font-mono font-extrabold text-[#A6702E] text-sm sm:text-base">
                                        {formatRupiah(remainingAmount)}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className={`grid ${canRecordPayment && remainingAmount > 0 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-2.5 pt-1`}>
                                {canPrintInvoice && (
                                    <button
                                        type="button"
                                        onClick={() => setIsInvoiceModalOpen(true)}
                                        className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs w-full"
                                    >
                                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Cetak Invoice</span>
                                    </button>
                                )}
                                {canRecordPayment && remainingAmount > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setIsPaymentModalOpen(true)}
                                        className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[#A6702E] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs w-full"
                                    >
                                        <CreditCard className="w-3.5 h-3.5" />
                                        <span>+ Catat Pembayaran</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* CARD 5 (OPERATIONAL): BRIEFING & CATATAN TEKNIS TIM */
                        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-slate-500" />
                                    <span>BRIEFING &amp; PETUNJUK TEKNIS</span>
                                </h3>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    Internal Crew
                                </span>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                                    <span className="font-bold text-slate-800 block">Catatan &amp; Arahan Klien:</span>
                                    <p className="text-slate-600 leading-relaxed">
                                        {project.notes || 'Tidak ada catatan khusus. Ikuti rundown dan standar SOP studio Lensaria.'}
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1.5">
                                    <span className="font-bold text-indigo-900 block">Instruksi Pengerjaan Tim:</span>
                                    <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                                        <li>Pastikan koordinasi tim sebelum jam acara dimulai.</li>
                                        <li>Upload foto/video hasil shooting ke Google Drive dalam batas waktu.</li>
                                        <li>Update alur pengerjaan pada timeline di atas.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ======================================================== */}
            {/* MODAL 1: CATAT PEMBAYARAN                                 */}
            {/* ======================================================== */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden my-8 flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#C89445] flex items-center justify-center border border-amber-200/60">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Catat Pembayaran</h3>
                                    <p className="text-xs text-slate-400">{project.name}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                            {/* Project Breakdown Box */}
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs space-y-1.5">
                                <div className="flex justify-between text-slate-600">
                                    <span>Total Nilai Project:</span>
                                    <span className="font-mono font-bold text-slate-900">{formatRupiah(totalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Sudah Terbayar:</span>
                                    <span className="font-mono font-bold text-emerald-600">{formatRupiah(paidAmount)}</span>
                                </div>
                                <div className="flex justify-between text-slate-800 pt-1 border-t border-slate-200 font-bold">
                                    <span>Sisa Tagihan:</span>
                                    <span className="font-mono text-amber-700">{formatRupiah(remainingAmount)}</span>
                                </div>
                            </div>

                            {/* Amount Input */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700">Nominal Pembayaran (Rp) *</label>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentFormData((prev) => ({ ...prev, amount: String(remainingAmount) }))}
                                            className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold transition-colors cursor-pointer"
                                        >
                                            ⚡ Pelunasan
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentFormData((prev) => ({ ...prev, amount: String(Math.round(totalAmount * 0.5)) }))}
                                            className="px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold transition-colors cursor-pointer"
                                        >
                                            ⚡ DP 50%
                                        </button>
                                    </div>
                                </div>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={paymentFormData.amount}
                                    onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                                    placeholder="Contoh: 15000000"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-[#C89445] focus:outline-hidden"
                                />
                            </div>

                            {/* Date & Method */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Tanggal Bayar *</label>
                                    <input
                                        type="date"
                                        required
                                        value={paymentFormData.payment_date}
                                        onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_date: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#C89445] focus:outline-hidden"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700">Metode Pembayaran *</label>
                                    <select
                                        value={paymentFormData.payment_method_id}
                                        onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_method_id: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#C89445] focus:outline-hidden"
                                    >
                                        {payment_methods.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.name} {m.account_number ? `(${m.account_number})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Reference Number */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Nomor Referensi / Bukti Transfer</label>
                                <input
                                    type="text"
                                    value={paymentFormData.reference_number}
                                    onChange={(e) => setPaymentFormData({ ...paymentFormData, reference_number: e.target.value })}
                                    placeholder="Contoh: TRF-BCA-280826-001"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#C89445] focus:outline-hidden"
                                />
                            </div>

                            {/* Notes */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Catatan Pembayaran</label>
                                <textarea
                                    rows={2}
                                    value={paymentFormData.notes}
                                    onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                                    placeholder="Keterangan tambahan..."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#C89445] focus:outline-hidden"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={paymentSubmitting}
                                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                                >
                                    {paymentSubmitting ? 'Menyimpan...' : 'Simpan Pembayaran'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 2: TAMBAH LINK GOOGLE DRIVE                        */}
            {/* ======================================================== */}
            {isLinkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white text-slate-800 rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden my-8 flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
                                    <HardDrive className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Tambah Link Drive</h3>
                                    <p className="text-xs text-slate-400">Untuk {project.name}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsLinkModalOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleLinkSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Nama / Judul Folder *</label>
                                <input
                                    type="text"
                                    required
                                    value={linkFormData.name}
                                    onChange={(e) => setLinkFormData({ ...linkFormData, name: e.target.value })}
                                    placeholder="Contoh: Master Raw &amp; Edited Photos"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">URL Link Google Drive *</label>
                                <input
                                    type="url"
                                    required
                                    value={linkFormData.drive_url}
                                    onChange={(e) => setLinkFormData({ ...linkFormData, drive_url: e.target.value })}
                                    placeholder="https://drive.google.com/drive/folders/..."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700">Masa Aktif Link (Expiration)</label>
                                <select
                                    value={linkFormData.expiry_days}
                                    onChange={(e) => setLinkFormData({ ...linkFormData, expiry_days: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                                >
                                    <option value="30">30 Hari (1 Bulan)</option>
                                    <option value="60">60 Hari (2 Bulan)</option>
                                    <option value="90">90 Hari (3 Bulan)</option>
                                    <option value="365">1 Tahun (365 Hari)</option>
                                    <option value="0">Permanen (Tanpa Expired)</option>
                                </select>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsLinkModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={linkSubmitting}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                                >
                                    {linkSubmitting ? 'Menyimpan...' : 'Simpan Link Drive'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 3: CETAK INVOICE RESMI (EXACT USER SCREENSHOT)     */}
            {/* ======================================================== */}
            {isInvoiceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
                    <div className="bg-white text-stone-900 rounded-3xl shadow-2xl border border-stone-200 max-w-3xl w-full overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
                        {/* Top Action Toolbar (Hidden during Print) */}
                        <div className="px-6 py-3.5 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0 print:hidden">
                            <div className="flex items-center gap-2">
                                <Printer className="w-4 h-4 text-[#C89445]" />
                                <span className="text-xs font-bold text-stone-800">Dokumen Invoice Resmi — Arams Pictures</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handlePrintInvoice}
                                    className="px-4 py-2 rounded-xl bg-[#A6702E] hover:bg-[#8f5f24] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Cetak / Download PDF</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsInvoiceModalOpen(false)}
                                    className="w-8 h-8 rounded-full hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Printable Invoice Body (Side-by-Side Kiri & Kanan, Fits Exactly 1 A4 Page) */}
                        <div id="invoice-printable-area" className="p-6 sm:p-8 space-y-4 overflow-y-auto bg-white text-stone-800 font-sans text-xs leading-normal">
                            {/* 1. Header: AP Logo & Studio Tagline */}
                            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                                {/* Left Logo */}
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-full border border-[#C89445] flex items-center justify-center text-[#A6702E] font-serif font-bold text-lg bg-amber-50/40 shrink-0">
                                        ap
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-serif font-extrabold tracking-[0.25em] text-stone-900 uppercase">
                                            ARAMS PICTURES
                                        </h2>
                                        <p className="text-[8.5px] font-mono tracking-widest text-stone-400 uppercase font-bold">
                                            PHOTOGRAPHY STUDIO
                                        </p>
                                    </div>
                                </div>

                                {/* Right Tagline */}
                                <div className="text-right">
                                    <p className="text-[8.5px] tracking-widest text-stone-500 uppercase font-mono font-bold leading-tight">
                                        CAPTURING MEANINGFUL STORIES FOR A LIFETIME
                                    </p>
                                    <div className="w-12 h-[1.5px] bg-[#C89445] ml-auto mt-1" />
                                </div>
                            </div>

                            {/* 2. Invoice Title & Status Pill */}
                            <div className="flex items-center justify-between py-0.5">
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#A6702E] font-mono">
                                            INVOICE
                                        </span>
                                        <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
                                            {project.invoices?.[0]?.invoice_number || `INV-${new Date().getFullYear()}-${project.project_number ? project.project_number.split('-').pop() : '0018'}`}
                                        </h1>
                                    </div>
                                    <div className="flex items-center gap-3 text-[11px] text-stone-600 mt-0.5 font-sans">
                                        <p>
                                            <span className="text-stone-400">Tanggal Terbit:</span> &nbsp;
                                            <strong className="text-stone-800">{formatDate(project.invoices?.[0]?.issue_date || project.created_at || new Date())}</strong>
                                        </p>
                                        <span className="text-stone-300">•</span>
                                        <p>
                                            <span className="text-stone-400">Jatuh Tempo:</span> &nbsp;
                                            <strong className="text-stone-800">{formatDate(project.invoices?.[0]?.due_date || project.deadline || project.event_date || new Date())}</strong>
                                        </p>
                                    </div>
                                </div>

                                {/* Right Status Pill */}
                                <div>
                                    {remainingAmount <= 0 ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                            <span>LUNAS</span>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                            <Clock className="w-3 h-3 text-amber-600" />
                                            <span>MENUNGGU PEMBAYARAN</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* 3. 2-Column Metadata Row (Informasi Klien & Informasi Project Kiri-Kanan) */}
                            <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-stone-50/70 border border-stone-200 text-xs">
                                {/* Kiri: Informasi Klien */}
                                <div className="space-y-1 pr-2 border-r border-stone-200">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#A6702E] font-mono block">
                                        INFORMASI KLIEN
                                    </span>
                                    <h3 className="font-bold text-stone-900 text-xs truncate">
                                        {project.client?.name} {project.client?.partner_name ? `& ${project.client?.partner_name}` : ''}
                                    </h3>
                                    <div className="space-y-0.5 text-stone-600 text-[10.5px]">
                                        <p className="flex items-center gap-1.5">
                                            <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                                            <span>{project.client?.phone || '0812-3456-7890'}</span>
                                        </p>
                                        <p className="flex items-center gap-1.5 truncate">
                                            <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                                            <span>{project.client?.email || 'client@arams.com'}</span>
                                        </p>
                                        <p className="flex items-start gap-1.5 truncate">
                                            <MapPin className="w-3 h-3 text-stone-400 shrink-0 mt-0.5" />
                                            <span>{project.client?.address || 'Jakarta Selatan, DKI Jakarta'}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Kanan: Informasi Project */}
                                <div className="space-y-1 pl-1">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#A6702E] font-mono block">
                                        INFORMASI PROJECT
                                    </span>
                                    <h3 className="font-bold text-stone-900 text-xs truncate">{project.name}</h3>
                                    <div className="space-y-0.5 text-stone-600 text-[10.5px]">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-stone-400 shrink-0" />
                                            <span className="text-stone-400 w-20 shrink-0">Tgl Acara:</span>
                                            <strong className="text-stone-800 font-medium">{project.event_date ? formatDate(project.event_date) : '22 Mei 2026'}</strong>
                                        </div>
                                        <div className="flex items-center gap-1.5 truncate">
                                            <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                                            <span className="text-stone-400 w-20 shrink-0">Lokasi:</span>
                                            <strong className="text-stone-800 font-medium truncate">{project.location || 'Grand Ballroom Hotel Mulia Senayan, Jakarta'}</strong>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <FileText className="w-3 h-3 text-stone-400 shrink-0" />
                                            <span className="text-stone-400 w-20 shrink-0">No. Project:</span>
                                            <strong className="font-mono text-[#A6702E] font-bold">{project.project_number}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Itemized Table */}
                            <div className="border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
                                <table className="w-full text-xs">
                                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-mono text-[9.5px] uppercase">
                                        <tr>
                                            <th className="py-2 px-3 text-center w-10 font-bold">NO</th>
                                            <th className="py-2 px-3 text-left font-bold">DESKRIPSI</th>
                                            <th className="py-2 px-3 text-center w-12 font-bold">QTY</th>
                                            <th className="py-2 px-3 text-right w-32 font-bold">HARGA SATUAN</th>
                                            <th className="py-2 px-3 text-right w-32 font-bold">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100 text-stone-800 text-[11px]">
                                        {/* Main Package Item */}
                                        <tr>
                                            <td className="py-2 px-3 text-center font-mono text-stone-400">1</td>
                                            <td className="py-2 px-3">
                                                <strong className="text-stone-900 block font-sans text-[11px]">
                                                    {project.package?.name || project.name}
                                                </strong>
                                                <span className="text-stone-400 text-[10px] block">
                                                    {project.package?.description || 'Dokumentasi Foto & Video'}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-center font-mono font-medium">1</td>
                                            <td className="py-2 px-3 text-right font-mono">{formatRupiah(basePrice)}</td>
                                            <td className="py-2 px-3 text-right font-mono font-bold text-stone-900">
                                                {formatRupiah(basePrice)}
                                            </td>
                                        </tr>

                                        {/* Addons Items */}
                                        {project.project_addons && project.project_addons.length > 0 ? (
                                            project.project_addons.map((add: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td className="py-2 px-3 text-center font-mono text-stone-400">{idx + 2}</td>
                                                    <td className="py-2 px-3">
                                                        <strong className="text-stone-900 block font-sans text-[11px]">
                                                            {add.addon?.name || add.custom_name || 'Biaya Tambahan'}
                                                        </strong>
                                                        <span className="text-stone-400 text-[10px] block">
                                                            {add.addon?.description || 'Layanan / item tambahan'}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-3 text-center font-mono font-medium">{add.qty}</td>
                                                    <td className="py-2 px-3 text-right font-mono">{formatRupiah(add.unit_price)}</td>
                                                    <td className="py-2 px-3 text-right font-mono font-bold text-stone-900">
                                                        {formatRupiah(add.total_price)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : null}
                                    </tbody>
                                </table>
                            </div>

                            {/* 5. Side-by-Side: Informasi Pembayaran & Rekening (Kiri) vs Rekap Tagihan (Kanan) */}
                            <div className="grid grid-cols-12 gap-3 pt-1">
                                {/* Kiri (7 Kolom): Informasi Rekening Bank & WA (Ambil dari Database) */}
                                <div className="col-span-7 space-y-2">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 font-mono block">
                                        INFORMASI PEMBAYARAN
                                    </span>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {bankAccounts.map((bank: any, bIdx: number) => {
                                            const code = (bank.code || bank.name || '').toUpperCase();
                                            const isBCA = code.includes('BCA');
                                            const isMandiri = code.includes('MANDIRI');
                                            const isBNI = code.includes('BNI');
                                            const isBRI = code.includes('BRI');
                                            const isQRIS = code.includes('QRIS');

                                            const badgeColor = isBCA
                                                ? 'bg-blue-900 text-white'
                                                : isMandiri
                                                ? 'bg-amber-600 text-white'
                                                : isBNI
                                                ? 'bg-teal-700 text-white'
                                                : isBRI
                                                ? 'bg-blue-700 text-white'
                                                : isQRIS
                                                ? 'bg-red-600 text-white'
                                                : 'bg-stone-800 text-white';

                                            const badgeLabel = bank.code ? bank.code.toUpperCase() : (isBCA ? 'BCA' : isMandiri ? 'MANDIRI' : isBNI ? 'BNI' : isBRI ? 'BRI' : 'BANK');

                                            return (
                                                <div key={bank.id || bIdx} className="p-2 rounded-xl bg-stone-50/80 border border-stone-200 flex items-center gap-2">
                                                    <div className={`w-8 h-6 rounded ${badgeColor} flex items-center justify-center font-extrabold text-[8px] tracking-tight shrink-0`}>
                                                        {badgeLabel.slice(0, 7)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-mono text-[10.5px] text-stone-900 font-bold leading-tight truncate">{bank.account_number}</p>
                                                        <p className="text-[8px] text-stone-400 leading-tight truncate">a.n. {bank.account_holder || studioName}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-[10px] text-blue-900">
                                        <span className="flex items-center gap-1.5 font-medium truncate">
                                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                            Konfirmasi transfer via WhatsApp: <strong className="font-mono">{studioPhone}</strong>
                                        </span>
                                        <span className="font-mono text-blue-600 text-[9px] shrink-0">{studioName.split(' ')[0]} Care</span>
                                    </div>
                                </div>

                                {/* Kanan (5 Kolom): Ringkasan Subtotal, Diskon, Total, Sisa Tagihan */}
                                <div className="col-span-5 p-3 rounded-xl bg-[#FCF8F2] border border-[#E8DCCB] space-y-1 text-[11px]">
                                    <div className="flex justify-between text-stone-600">
                                        <span>Subtotal</span>
                                        <span className="font-mono font-bold text-stone-900">{formatRupiah(basePrice + addonsTotal)}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-stone-600">
                                            <span>Diskon</span>
                                            <span className="font-mono font-bold text-emerald-600">- {formatRupiah(discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-stone-700 font-semibold pt-1 border-t border-[#E8DCCB]">
                                        <span>Total Nilai Paket</span>
                                        <span className="font-mono font-bold text-stone-900">{formatRupiah(totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1 border-t border-[#E8DCCB]">
                                        <span className="font-bold text-stone-900 text-xs">Sisa Tagihan</span>
                                        <span className="font-mono text-sm font-extrabold text-[#A6702E]">
                                            {formatRupiah(remainingAmount)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 6. Catatan & Syarat & Ketentuan (Kiri-Kanan) */}
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-stone-200 text-[10px]">
                                {/* Catatan */}
                                <div className="space-y-0.5">
                                    <span className="font-bold text-amber-900 flex items-center gap-1 text-[10.5px]">
                                        <FileText className="w-3 h-3 text-[#C89445]" />
                                        Catatan
                                    </span>
                                    <p className="text-stone-500 leading-relaxed">
                                        Terima kasih telah mempercayakan momen berharga Anda kepada {studioName}. Kami akan memberikan hasil terbaik dengan sepenuh hati.
                                    </p>
                                </div>

                                {/* Syarat & Ketentuan */}
                                <div className="space-y-0.5">
                                    <span className="font-bold text-amber-900 flex items-center gap-1 text-[10.5px]">
                                        <Layers className="w-3 h-3 text-[#C89445]" />
                                        Syarat &amp; Ketentuan
                                    </span>
                                    <ol className="text-stone-500 space-y-0.5 list-decimal pl-3.5 leading-relaxed">
                                        <li>Pembayaran sah setelah dana diterima di rekening kami.</li>
                                        <li>Pembatalan &amp; jadwal ulang mengikuti kebijakan yang berlaku.</li>
                                        <li>Detail lengkap dapat dilihat pada surat perjanjian kerja sama.</li>
                                    </ol>
                                </div>
                            </div>

                            {/* 7. Footer: Brand, Socials, Signature, & QR */}
                            <div className="pt-2 border-t border-[#C89445]/50 flex items-center justify-between text-[9.5px] text-stone-500">
                                <div className="space-y-0.5">
                                    <p className="font-serif font-bold text-stone-900 tracking-wider text-[11px] uppercase">{studioName}</p>
                                    <div className="flex items-center gap-2.5 text-stone-600 flex-wrap">
                                        <span>📸 {studioInstagram}</span>
                                        <span>📞 {studioPhone}</span>
                                        <span>✉ {studioEmail}</span>
                                        <span>🌐 {studioWebsite.replace(/^https?:\/\//, '')}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <span className="font-serif italic font-bold text-xs text-stone-800 block">Arams</span>
                                        <span className="text-[8px] text-stone-400 block font-mono">Photography Studio</span>
                                    </div>
                                    <div className="w-6 h-6 bg-stone-900 rounded flex items-center justify-center text-[6px] font-mono text-white text-center">
                                        QR
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Stylesheet for Pure Clean A4 PDF */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 8mm 10mm;
                    }
                    html, body {
                        background: #ffffff !important;
                        color: #1c1917 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        height: auto !important;
                        min-height: 0 !important;
                        overflow: visible !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #invoice-printable-area, #invoice-printable-area * {
                        visibility: visible !important;
                    }
                    #invoice-printable-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        background: white !important;
                        overflow: visible !important;
                    }
                    .print\\:hidden, header, nav, aside, footer {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
