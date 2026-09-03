import React, { useState, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { resolveWorkflow } from '@/lib/workflows';
import {
    ArrowLeft,
    ArrowRight,
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
    Upload,
    AlertCircle,
    Trash2,
    Send,
    Tag,
    Image as ImageIcon,
    Film,
    BookOpen,
    Disc,
    StickyNote,
    CheckCircle,
    Building2,
    ShieldCheck,
    Clock3,
} from 'lucide-react';
import { formatRupiah, formatDate } from '@/lib/formatters';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';

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
    team_members?: Array<{ id: string; name: string; email: string; avatar?: string; role?: string; phone?: string }>;
    categories?: Array<{ id: string; name: string; color?: string; workflow_type?: string }>;
    packages?: Array<{ id: string; name: string; category_id: string; base_price: number; duration_hours?: number; description?: string; included_services?: string[]; included_deliverables?: any[] }>;
    payment_methods?: Array<{ id: string; name: string; code?: string; account_number?: string; account_holder?: string; icon?: string }>;
    company_settings?: {
        name?: string;
        phone?: string;
        email?: string;
        address?: string;
        instagram?: string;
        website?: string;
    };
    workflow_definitions?: any[];
}

export default function ProjectDetail({
    project,
    team_members = [],
    categories = [],
    packages = [],
    payment_methods = [],
    company_settings,
    workflow_definitions = [],
}: ProjectDetailProps) {
    const { auth } = usePage().props as any;
    const user = auth?.user;

    // Active Navigation Tab
    const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'files' | 'catatan' | 'invoice' | 'highlight'>('overview');
    const [actionDropdownOpen, setActionDropdownOpen] = useState(false);
    const [invoiceDropdownOpen, setInvoiceDropdownOpen] = useState(false);

    // Modals
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentSubmitting, setPaymentSubmitting] = useState(false);
    const [paymentFormData, setPaymentFormData] = useState({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method_id: payment_methods[0]?.id || '',
        reference_number: '',
        notes: 'Pembayaran Project',
    });

    const openPaymentModal = (defaultAmount?: number, defaultNotes?: string) => {
        setPaymentFormData({
            amount: defaultAmount && defaultAmount > 0 ? String(Math.round(defaultAmount)) : '',
            payment_date: new Date().toISOString().split('T')[0],
            payment_method_id: payment_methods[0]?.id || '',
            reference_number: '',
            notes: defaultNotes || `Pembayaran untuk project ${project?.name || ''}`,
        });
        setIsPaymentModalOpen(true);
    };

    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkSubmitting, setLinkSubmitting] = useState(false);
    const [linkFormData, setLinkFormData] = useState({
        name: 'Master Dokumentasi Google Drive',
        drive_url: '',
        file_type: 'google_drive',
        expiry_days: '30',
    });

    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [newNoteText, setNewNoteText] = useState('');

    // Highlight Project Modal State & Handlers
    const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
    const [highlightSubmitting, setHighlightSubmitting] = useState(false);
    const [highlightFormData, setHighlightFormData] = useState({
        title: '',
        caption: '',
        image_url: '',
        image_file: null as File | null,
        is_cover: false,
    });
    const [highlightFilePreview, setHighlightFilePreview] = useState('');

    const handleHighlightSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setHighlightSubmitting(true);
        const form = new FormData();
        form.append('title', highlightFormData.title || 'Momen Acara');
        form.append('caption', highlightFormData.caption);
        form.append('is_cover', highlightFormData.is_cover ? '1' : '0');
        if (highlightFormData.image_file) {
            form.append('image_file', highlightFormData.image_file);
        } else if (highlightFormData.image_url) {
            form.append('image_url', highlightFormData.image_url);
        }

        router.post(`/projects/${project?.id}/highlights`, form, {
            onSuccess: () => {
                toast.success('Foto highlight berhasil ditambahkan ke project');
                setIsHighlightModalOpen(false);
                setHighlightSubmitting(false);
                setHighlightFormData({ title: '', caption: '', image_url: '', image_file: null, is_cover: false });
                setHighlightFilePreview('');
            },
            onError: (err) => {
                toast.error(Object.values(err)[0] as string || 'Gagal menambahkan foto highlight');
                setHighlightSubmitting(false);
            },
        });
    };

    const handleSetCover = (highlightId: string) => {
        router.post(`/projects/${project?.id}/highlights/${highlightId}/cover`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Foto berhasil dijadikan cover utama project'),
        });
    };

    const handleDeleteHighlight = (highlightId: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus foto highlight ini?')) return;
        router.delete(`/projects/${project?.id}/highlights/${highlightId}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Foto highlight berhasil dihapus'),
        });
    };

    const studioPhone = company_settings?.phone || '0812-3456-7890';
    const studioName = company_settings?.name || 'Arams Pictures';
    const studioEmail = company_settings?.email || 'hello@aramspictures.id';
    const studioAddress = company_settings?.address || 'Jakarta, Indonesia';

    // Format Indonesian Dates
    const formatDateIndo = (dateStr?: string) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    // Format Indonesian Datetime
    const formatDateTimeIndo = (dateStr?: string) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateStr;
        }
    };

    // ── DYNAMIC PROJECT CONTACT & TEAM INFORMATION ───────────────────────────
    const clientName = project?.client?.name || 'Klien';
    const clientPhone = project?.client?.phone || '-';
    const clientEmail = project?.client?.email || '-';
    const clientInstagram = project?.client?.instagram || '-';
    const clientAddress = project?.client?.address || project?.location || '-';
    const clientCity = project?.client?.city || '';

    const woName = project?.wedding_organizer?.name || project?.weddingOrganizer?.name || null;
    const woPic = project?.wedding_organizer?.pic_name || project?.weddingOrganizer?.pic_name || null;
    const woPhone = project?.wedding_organizer?.phone || project?.weddingOrganizer?.phone || null;

    // Assigned Team
    const supervisorName = project?.supervisor?.name || 'Belum Ditentukan';
    const supervisorPhone = project?.supervisor?.phone || '-';
    const supervisorEmail = project?.supervisor?.email || '-';

    const parsedPhotographer =
        project?.photographer?.name ||
        project?.photographer_name ||
        project?.notes?.match(/Photographer:\s*([^|\n]+)/i)?.[1]?.trim() ||
        '-';

    const parsedEditor =
        project?.editor?.name ||
        project?.editor_name ||
        project?.notes?.match(/Editor:\s*([^|\n]+)/i)?.[1]?.trim() ||
        '-';

    const parsedReferral =
        project?.client?.referral_name ||
        project?.notes?.match(/Sumber Referensi:\s*([^|\n]+)/i)?.[1]?.trim() ||
        '-';

    const formattedReferral = useMemo(() => {
        let ref = parsedReferral;
        if (!ref || ref === '-') return 'Langsung / Organik';
        // Clean out empty placeholders like ( - ) or (-)
        ref = ref.replace(/\s*\(\s*-\s*\)/g, '').replace(/\s*-\s*$/, '').trim();
        return ref || 'Langsung / Organik';
    }, [parsedReferral]);

    const cleanProjectDescription = useMemo(() => {
        const raw = project?.notes || project?.description || '';
        if (!raw) {
            return `Dokumentasi acara ${project?.name || ''} yang akan dilaksanakan pada ${formatDateIndo(project?.event_date)} di ${project?.location || 'lokasi yang telah disepakati'}.`;
        }

        // Filter out technical metadata lines that are already displayed in dedicated cards
        const cleanedLines = raw
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => {
                if (!line) return false;
                if (/^Photographer:\s*[^|]+(\s*\|\s*Editor:|$)/i.test(line)) return false;
                if (/^Editor:\s*/i.test(line)) return false;
                if (/^Sumber Referensi:\s*/i.test(line)) return false;
                return true;
            });

        const result = cleanedLines.join('\n\n').trim();
        return result || `Dokumentasi acara ${project?.name || ''} yang akan dilaksanakan pada ${formatDateIndo(project?.event_date)} di ${project?.location || 'lokasi yang telah disepakati'}.`;
    }, [project?.notes, project?.description, project?.name, project?.event_date, project?.location]);

    // ── DYNAMIC FINANCIAL BREAKDOWN ──────────────────────────────────────────
    const addonsList = useMemo(() => {
        if (project?.project_addons && Array.isArray(project.project_addons)) {
            return project.project_addons;
        }
        if (project?.projectAddons && Array.isArray(project.projectAddons)) {
            return project.projectAddons;
        }
        return [];
    }, [project]);

    const packagePrice = Number(project?.price || project?.package?.base_price || 0);

    const totalAddon = useMemo(() => {
        return addonsList.reduce((acc: number, item: any) => {
            const itemPrice = Number(item.price || item.addon?.price || 0);
            const itemQty = Number(item.quantity || 1);
            return acc + itemPrice * itemQty;
        }, 0);
    }, [addonsList]);

    const totalBiayaOperasional = Number(project?.operational_costs_total || 0);
    const diskonPaket = Number(project?.discount || 0);
    const taxAmount = Number(project?.tax || 0);

    const totalProject = Number(
        project?.total_amount || (packagePrice + totalAddon + totalBiayaOperasional - diskonPaket + taxAmount)
    );

    const paidAmount = Number(project?.paid_amount || 0);
    const dpInvoiceAmount = Number(project?.invoices?.[0]?.total || 0);
    const nominalDP = dpInvoiceAmount > 0
        ? dpInvoiceAmount
        : (paidAmount > 0 ? paidAmount : Math.round(totalProject * 0.3));
    const sisaPelunasan = Math.max(0, totalProject - paidAmount);
    const dpPercent = totalProject > 0 ? Math.round((nominalDP / totalProject) * 100) : 30;

    const isDpPaid = useMemo(() => {
        if (project?.payment_status === 'paid' || project?.payment_status === 'partial') {
            return true;
        }
        if (paidAmount > 0) {
            return true;
        }
        if (project?.payments && Array.isArray(project.payments) && project.payments.length > 0) {
            return true;
        }
        return false;
    }, [project?.payment_status, paidAmount, project?.payments]);

    // Payment destination info
    const primaryPaymentMethod = payment_methods[0] || null;
    const paymentMethodName = primaryPaymentMethod?.name || 'Transfer Bank';
    const bankAccount = primaryPaymentMethod?.account_number || primaryPaymentMethod?.code || 'BCA - 123 456 7890';
    const accountHolder = primaryPaymentMethod?.account_holder || studioName;

    // ── DYNAMIC SERVICES & DELIVERABLES (MATCHING STEP 4 OF CREATE & EDIT) ───
    const servicesList = useMemo<string[]>(() => {
        if (
            project?.package?.included_services &&
            Array.isArray(project.package.included_services) &&
            project.package.included_services.length > 0
        ) {
            return project.package.included_services.map((s: any) =>
                typeof s === 'string' ? s : (s?.name || String(s))
            );
        }
        return [];
    }, [project?.package]);

    const deliverablesList = useMemo<
        Array<{ id: number | string; name: string; type: string; deadline: string; description?: string }>
    >(() => {
        if (
            project?.package?.included_deliverables &&
            Array.isArray(project.package.included_deliverables) &&
            project.package.included_deliverables.length > 0
        ) {
            return project.package.included_deliverables.map((item: any, idx: number) => {
                if (typeof item === 'string') {
                    return {
                        id: idx + 1,
                        name: item,
                        type: 'Photo',
                        deadline: 'H+14',
                        description: 'Item hasil serah terima',
                    };
                }
                return {
                    id: item.id || idx + 1,
                    name: item.name || 'Deliverable',
                    type: item.type || 'Photo',
                    deadline: item.deadline || item.target_deadline || 'H+14',
                    description: item.description || 'Item hasil serah terima',
                };
            });
        }
        return [];
    }, [project?.package]);

    // ── DYNAMIC WORKFLOW RESOLUTION & TIMELINE STEPS ─────────────────────────
    const activeWorkflow = useMemo(() => {
        return resolveWorkflow(project?.category, workflow_definitions);
    }, [project?.category, workflow_definitions]);

    const currentStepIndex = useMemo(() => {
        const totalSteps = activeWorkflow.steps_count;
        if (project?.status === 'completed') return totalSteps;
        if (!project?.workflow_step) return 1;

        const foundIdx = activeWorkflow.steps.findIndex((s: any) =>
            s.name.toLowerCase().includes(project.workflow_step.toLowerCase()) ||
            project.workflow_step.toLowerCase().includes(s.name.toLowerCase())
        );

        if (foundIdx !== -1) {
            return foundIdx + 1;
        }

        if (project?.status === 'editing') return Math.min(3, totalSteps);
        if (project?.status === 'in_progress') return Math.min(2, totalSteps);
        return 1;
    }, [activeWorkflow, project?.workflow_step, project?.status]);

    const timelineSteps = useMemo(() => {
        const totalSteps = activeWorkflow.steps_count;

        return activeWorkflow.steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isDone = stepNum < currentStepIndex || (project?.status === 'completed');
            const isCurrent = stepNum === currentStepIndex && project?.status !== 'completed';

            let status = 'Belum Mulai';
            let statusColor = 'text-slate-400';
            if (isDone) {
                status = 'Selesai';
                statusColor = 'text-emerald-600 font-bold';
            } else if (isCurrent) {
                status = 'Sedang Berjalan';
                statusColor = 'text-amber-600 font-bold';
            }

            const targetDeadline = step.duration || step.dur || step.dl || 'Hari H';

            return {
                id: step.num || stepNum,
                name: step.name,
                phase: step.phase || 'Operasional',
                activity: step.activity || step.description || '',
                duration: targetDeadline,
                status,
                statusColor,
                date: isDone
                    ? 'Selesai Dikerjakan'
                    : isCurrent
                    ? `Sedang Dikerjakan (${targetDeadline})`
                    : `Target: ${targetDeadline}`,
                done: isDone,
                current: isCurrent,
            };
        });
    }, [activeWorkflow, currentStepIndex, project?.status]);

    // ── STATUS BADGE HELPER ──────────────────────────────────────────────────
    const getProjectStatusBadge = (status?: string) => {
        switch (status) {
            case 'completed':
                return { label: 'SELESAI', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            case 'in_progress':
                return { label: 'DALAM PROSES', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
            case 'editing':
                return { label: 'EDITING', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
            case 'on_hold':
                return { label: 'DITUNDA', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
            case 'confirmed':
                return { label: 'DIKONFIRMASI', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
            case 'cancelled':
                return { label: 'DIBATALKAN', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
            default:
                return { label: 'DRAFT', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
        }
    };

    const getPaymentStatusBadge = (status?: string) => {
        switch (status) {
            case 'paid':
            case 'lunas':
                return { label: 'LUNAS', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            case 'partial':
            case 'dp_paid':
                return { label: 'DP TERBAYAR', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
            default:
                return { label: 'BELUM BAYAR', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
        }
    };

    const statusBadge = getProjectStatusBadge(project?.status);
    const paymentBadge = getPaymentStatusBadge(isDpPaid ? (project?.payment_status || 'partial') : 'unpaid');

    // ── WORKFLOW & STATUS ACTIONS (DATABASE CONNECTED) ───────────────────────
    const handleUpdateWorkflowStep = (targetStepIndex: number) => {
        const totalSteps = activeWorkflow.steps.length;
        const targetStep = activeWorkflow.steps[targetStepIndex - 1];
        if (!targetStep) return;

        const newProgress = Math.min(100, Math.round((targetStepIndex / totalSteps) * 100));
        let newStatus = project.status;
        if (targetStepIndex === totalSteps) {
            newStatus = 'completed';
        } else if (targetStep.name.toLowerCase().includes('editing') || targetStep.phase?.toLowerCase().includes('editing') || targetStep.phase?.toLowerCase().includes('post')) {
            newStatus = 'editing';
        } else if (newStatus === 'draft' || newStatus === 'booking' || newStatus === 'pending') {
            newStatus = 'in_progress';
        }

        router.patch(
            `/projects/${project.id}/status`,
            {
                workflow_step: targetStep.name,
                progress: newProgress,
                status: newStatus,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Alur kerja diperbarui ke: ${targetStep.name} (${newProgress}%)`);
                },
                onError: () => {
                    toast.error('Gagal memperbarui alur kerja');
                },
            }
        );
    };

    const handleQuickStatusChange = (newStatus: string) => {
        let newProgress = project.progress;
        let newStep = project.workflow_step;

        if (newStatus === 'completed') {
            newProgress = 100;
            newStep = activeWorkflow.steps[activeWorkflow.steps.length - 1]?.name || 'Selesai';
        } else if (newStatus === 'draft') {
            newProgress = 0;
            newStep = activeWorkflow.steps[0]?.name || 'Booking';
        } else if (newStatus === 'in_progress' && (project.progress === 0 || !project.progress)) {
            newProgress = 25;
            newStep = activeWorkflow.steps[1]?.name || activeWorkflow.steps[0]?.name || 'Sesi Foto & Dokumentasi';
        } else if (newStatus === 'editing') {
            newStep = 'Seleksi & Editing Foto';
            if (newProgress < 50) newProgress = 50;
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
                    toast.success(`Status project berhasil diubah ke: ${newStatus.toUpperCase()}`);
                },
                onError: () => {
                    toast.error('Gagal mengubah status project');
                },
            }
        );
    };

    // Handle Payment Submission (Connected to Finance)
    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentFormData.amount || Number(paymentFormData.amount) <= 0) {
            toast.error('Silakan masukkan jumlah pembayaran yang valid');
            return;
        }

        const methodId = paymentFormData.payment_method_id || payment_methods[0]?.id;
        if (!methodId) {
            toast.error('Silakan pilih metode pembayaran');
            return;
        }

        setPaymentSubmitting(true);
        router.post(
            '/finance/payments',
            {
                project_id: project.id,
                amount: paymentFormData.amount,
                payment_date: paymentFormData.payment_date,
                payment_method_id: methodId,
                reference_number: paymentFormData.reference_number,
                notes: paymentFormData.notes,
                invoice_id: project.invoices?.[0]?.id,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPaymentSubmitting(false);
                    setIsPaymentModalOpen(false);
                    toast.success('Pembayaran DP berhasil dicatat dan masuk ke modul Keuangan!');
                },
                onError: (errors: any) => {
                    setPaymentSubmitting(false);
                    const errorMsg = Object.values(errors || {})[0] as string;
                    toast.error(errorMsg || 'Gagal mencatat pembayaran');
                },
            }
        );
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
        <div className="w-full max-w-full space-y-6 pb-20">
            <Head title={`${project?.name || 'Project'} - Detail Project`} />

            {/* ── 1. TOP BREADCRUMB & HEADER SECTION ────────────────────────────── */}
            <div className="space-y-3">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs">
                    <Link
                        href="/projects"
                        className="text-slate-500 hover:text-slate-800 transition-colors font-medium flex items-center gap-1"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Projects &amp; Orders</span>
                    </Link>
                    <span className="text-slate-400">/</span>
                    <span className="text-indigo-600 font-bold">
                        {project?.project_number || 'Detail Project'}
                    </span>
                </div>

                {/* Main Header with Title & Action Buttons */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <div className="space-y-2.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                                {project?.project_number || 'PRJ-2609-0000'}
                            </span>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                {project?.name || 'Nama Project'}
                            </h1>
                            <div className="inline-flex items-center gap-1.5 shrink-0 flex-wrap">
                                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border shrink-0 ${statusBadge.bg}`}>
                                    {statusBadge.label}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border shrink-0 ${paymentBadge.bg}`}>
                                    {paymentBadge.label}
                                </span>
                            </div>
                        </div>

                        {/* Metadata Icons Row */}
                        <div className="flex items-center gap-x-3.5 gap-y-1.5 text-xs text-slate-600 flex-wrap">
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{formatDateIndo(project?.event_date)}</span>
                            </div>
                            {project?.event_time && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>{project.event_time}</span>
                                </div>
                            )}
                            <span className="text-slate-300 hidden sm:inline">•</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="font-semibold text-slate-800">{project?.category?.name || 'Kategori'}</span>
                            </div>
                            <span className="text-slate-300 hidden sm:inline">•</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="font-semibold text-indigo-700">{project?.package?.name || 'Paket Layanan'}</span>
                            </div>
                            <span className="text-slate-300 hidden sm:inline">•</span>
                            <div className="flex items-center gap-1.5 min-w-0">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate max-w-md">{project?.location || 'Lokasi Acara Belum Ditentukan'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
                        <Link
                            href={`/projects/${project?.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition-all hover:scale-[1.02] whitespace-nowrap shrink-0"
                        >
                            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Edit Project</span>
                        </Link>

                        {/* Aksi Lainnya Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setActionDropdownOpen(!actionDropdownOpen)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0"
                            >
                                <span>Aksi Lainnya</span>
                                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                            </button>

                            {actionDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in duration-150">
                                    <button
                                        type="button"
                                        onClick={() => {
                                             setActionDropdownOpen(false);
                                             openPaymentModal();
                                         }}
                                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer whitespace-nowrap"
                                    >
                                        <CreditCard className="w-4 h-4 text-emerald-600" />
                                        <span>Catat Pembayaran</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                             setActionDropdownOpen(false);
                                             setIsLinkModalOpen(true);
                                         }}
                                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer whitespace-nowrap"
                                    >
                                        <Upload className="w-4 h-4 text-blue-600" />
                                        <span>Upload File / Drive</span>
                                    </button>
                                    <a
                                        href={`/portal?project=${project?.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 whitespace-nowrap"
                                    >
                                        <ExternalLink className="w-4 h-4 text-purple-600" />
                                        <span>Portal Klien</span>
                                    </a>
                                    <div className="border-t border-slate-100 my-1" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                             setActionDropdownOpen(false);
                                             toast.info('Status project dibatalkan.');
                                         }}
                                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer whitespace-nowrap"
                                    >
                                        <Trash2 className="w-4 h-4 text-rose-500" />
                                        <span>Batalkan Project</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Buat / Lihat Invoice DP Button */}
                        <div className="relative inline-flex rounded-xl shadow-sm shrink-0 whitespace-nowrap">
                            <Link
                                href={`/projects/${project?.id}/invoice`}
                                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-l-xl text-xs font-bold transition-all shadow-2xs cursor-pointer whitespace-nowrap"
                            >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Lihat Invoice DP</span>
                            </Link>
                            <button
                                type="button"
                                onClick={() => setInvoiceDropdownOpen(!invoiceDropdownOpen)}
                                className="px-2.5 py-2 bg-[#323BD8] hover:bg-[#2831BE] text-white rounded-r-xl text-xs border-l border-white/20 transition-colors cursor-pointer shrink-0"
                            >
                                <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            {invoiceDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in duration-150">
                                    <Link
                                        href={`/projects/${project?.id}/invoice`}
                                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                        <FileText className="w-4 h-4 text-indigo-600" />
                                        <span>Lihat Preview Invoice</span>
                                    </Link>
                                    <Link
                                        href={`/projects/${project?.id}/invoice`}
                                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                        <Printer className="w-4 h-4 text-slate-600" />
                                        <span>Cetak PDF</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 2. NAVIGATION TABS (OVERVIEW, TIMELINE, FILES, CATATAN, INVOICE) ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 px-4 shadow-2xs">
                <div className="flex items-center gap-8 text-xs font-bold overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('overview')}
                        className={`py-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'overview'
                                ? 'border-[#3B46F1] text-[#3B46F1]'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('timeline')}
                        className={`py-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'timeline'
                                ? 'border-[#3B46F1] text-[#3B46F1]'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Timeline &amp; Workflow
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('files')}
                        className={`py-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'files'
                                ? 'border-[#3B46F1] text-[#3B46F1]'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Files &amp; Google Drive
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('catatan')}
                        className={`py-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                            activeTab === 'catatan'
                                ? 'border-[#3B46F1] text-[#3B46F1]'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        Catatan &amp; Brief
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('highlight')}
                        className={`py-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                            activeTab === 'highlight'
                                ? 'border-[#3B46F1] text-[#3B46F1]'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Highlight Project</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                            {project?.highlights?.length || 0}
                        </span>
                    </button>
                    <Link
                        href={`/projects/${project?.id}/invoice`}
                        className="py-3.5 border-b-2 border-transparent text-slate-500 hover:text-slate-800 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                    >
                        <span>Invoice</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                    </Link>
                </div>
            </div>

            {/* ── 3. MAIN DASHBOARD CONTENT (OVERVIEW TAB) ──────────────────────── */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* ── ROW 1: DESKRIPSI PROJECT, STATUS PROJECT, PIC & TIM PRODUKSI ─ */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* 1. Deskripsi Project */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
                            <div className="space-y-1.5">
                                <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Deskripsi &amp; Konsep Acara</span>
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed break-words whitespace-normal line-clamp-4">
                                    {cleanProjectDescription}
                                </p>
                            </div>
                            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 gap-2">
                                <span className="truncate max-w-[65%]">
                                    <strong className="font-semibold text-slate-600">Ref:</strong> {formattedReferral}
                                </span>
                                <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[10px] shrink-0">
                                    {project?.category?.name || 'Umum'}
                                </span>
                            </div>
                        </div>

                        {/* 2. Status & Riwayat Project */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                    <Clock3 className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Status &amp; Riwayat</span>
                                </h3>
                                <select
                                    value={project?.status || 'draft'}
                                    onChange={(e) => handleQuickStatusChange(e.target.value)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer outline-hidden bg-white shadow-2xs hover:ring-2 hover:ring-indigo-200 transition-all ${statusBadge.bg}`}
                                    title="Klik untuk mengubah status project langsung ke database"
                                >
                                    <option value="draft">DRAFT</option>
                                    <option value="in_progress">DALAM PROSES</option>
                                    <option value="editing">EDITING</option>
                                    <option value="completed">SELESAI</option>
                                    <option value="on_hold">DITUNDA</option>
                                    <option value="cancelled">DIBATALKAN</option>
                                </select>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">No. Project</span>
                                    <span className="font-mono font-bold text-slate-900">{project?.project_number || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Tahap Workflow</span>
                                    <span className="font-bold text-indigo-700 capitalize">
                                        {project?.workflow_step || 'Booking'} ({project?.progress || 0}%)
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Tanggal Dibuat</span>
                                    <span className="font-medium text-slate-900">{formatDateTimeIndo(project?.created_at)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Terakhir Diedit</span>
                                    <span className="font-medium text-slate-900">{formatDateTimeIndo(project?.updated_at)}</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. PIC & Tim Produksi Assigned */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                            <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Tim Produksi &amp; PIC</span>
                            </h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Supervisor (PIC)</span>
                                    <span className="font-bold text-slate-900">{supervisorName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Lead Photographer</span>
                                    <span className="font-semibold text-slate-800">{parsedPhotographer}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Lead Editor</span>
                                    <span className="font-semibold text-slate-800">{parsedEditor}</span>
                                </div>
                                <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[11px]">
                                    <span className="text-slate-500">Kontak PIC</span>
                                    <span className="font-mono text-slate-700">
                                        {supervisorPhone && supervisorPhone !== '-' ? supervisorPhone : 'Belum diisi'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── ROW 2: 4 FINANCIAL & CLIENT CARDS ─────────────────────────── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {/* 1. Informasi Kontak Klien & WO */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
                            <div className="space-y-3">
                                <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Informasi Klien</span>
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 shrink-0">
                                        {clientName.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-xs text-slate-900 truncate">{clientName}</h4>
                                        <span className="text-[11px] text-slate-400 block">{clientCity || 'Klien Utama'}</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>{clientPhone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 truncate">
                                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="truncate">{clientEmail}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                        <span className="leading-tight text-[11px]">{clientAddress}</span>
                                    </div>
                                </div>
                            </div>

                            {woName && (
                                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                                    <span className="text-slate-400 block">Wedding Organizer:</span>
                                    <span className="font-bold text-slate-800">{woName}</span> {woPic ? `(${woPic})` : ''}
                                </div>
                            )}
                        </div>

                        {/* 2. Informasi Keuangan & Status Pembayaran */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
                            <div className="space-y-2">
                                <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                    <Wallet className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Ringkasan Tagihan</span>
                                </h3>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-500 block uppercase">
                                        Total Kesepakatan Project
                                    </span>
                                    <span className="text-lg font-black text-[#3B46F1] font-mono block">
                                        {formatRupiah(totalProject)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-500 block uppercase">
                                        Nominal DP ({dpPercent}%)
                                    </span>
                                    <span className="text-base font-extrabold text-emerald-600 font-mono block">
                                        {formatRupiah(nominalDP)}
                                    </span>
                                </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-0.5 mt-auto">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-amber-800 uppercase">
                                        Sisa Pelunasan
                                    </span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${paymentBadge.bg}`}>
                                        {paymentBadge.label}
                                    </span>
                                </div>
                                <span className="text-sm font-extrabold text-[#D97706] font-mono block">
                                    {formatRupiah(sisaPelunasan)}
                                </span>
                            </div>
                        </div>

                        {/* 3. Rincian Biaya Project (Sesuai Form Create/Edit) */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                            <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Rincian Biaya &amp; Diskon</span>
                            </h3>
                            <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Harga Paket</span>
                                    <span className="font-semibold text-slate-900">{formatRupiah(packagePrice)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Total Add-on</span>
                                    <span className="font-semibold text-slate-900">{formatRupiah(totalAddon)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Biaya Operasional</span>
                                    <span className="font-semibold text-slate-900">{formatRupiah(totalBiayaOperasional)}</span>
                                </div>
                                <div className="flex justify-between items-center text-rose-600">
                                    <span>Diskon Paket</span>
                                    <span className="font-semibold">- {formatRupiah(diskonPaket)}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Pajak (PPN/PPh)</span>
                                    <span className="font-semibold">{taxAmount > 0 ? `+ ${formatRupiah(taxAmount)}` : 'Non-aktif'}</span>
                                </div>
                                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                                    <span className="font-black text-xs text-slate-900 uppercase">TOTAL KESEPAKATAN</span>
                                    <span className="font-black text-sm text-[#3B46F1] font-mono">{formatRupiah(totalProject)}</span>
                                </div>
                            </div>
                        </div>

                        {/* 4. Informasi Pembayaran & Rekening */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
                            <div className="space-y-2.5 text-xs">
                                <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                    <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Rekening Pembayaran</span>
                                </h3>
                                <div className="space-y-2 pt-1 text-slate-700">
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-500 shrink-0">Metode</span>
                                        <span className="font-semibold text-slate-800 text-right">{paymentMethodName}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-500 shrink-0">Tujuan Transfer</span>
                                        <span className="font-bold text-slate-900 font-mono text-right">{bankAccount}</span>
                                    </div>
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="text-slate-500 shrink-0">Atas Nama</span>
                                        <span className="font-semibold text-slate-800 text-right leading-snug break-words max-w-[65%]">
                                            {accountHolder}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-500 shrink-0">Jatuh Tempo DP</span>
                                        <span className="font-semibold text-slate-800 text-right">
                                            {formatDateIndo(project?.deadline || project?.event_date)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Checklist & Status DP Terintegrasi Finance */}
                            <div className={`p-3 rounded-xl border transition-all ${
                                isDpPaid
                                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                                    : 'bg-amber-50/90 border-amber-200 text-amber-950'
                            }`}>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                            isDpPaid ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                                        }`}>
                                            {isDpPaid ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Clock className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-[11px] truncate">
                                                {isDpPaid ? 'DP Terbayar & Tercatat' : 'Belum Membayar DP'}
                                            </div>
                                            <div className="text-[10px] opacity-80 truncate">
                                                {isDpPaid
                                                    ? `Lunas DP: ${formatRupiah(project.paid_amount || nominalDP)}`
                                                    : `Tagihan DP: ${formatRupiah(nominalDP)} (${dpPercent}%)`}
                                            </div>
                                        </div>
                                    </div>
                                    {!isDpPaid ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPaymentFormData({
                                                    amount: String(Math.round(nominalDP)),
                                                    payment_date: new Date().toISOString().split('T')[0],
                                                    payment_method_id: payment_methods[0]?.id || '',
                                                    reference_number: '',
                                                    notes: `Pembayaran DP (${dpPercent}%) project ${project.name}`,
                                                });
                                                setIsPaymentModalOpen(true);
                                            }}
                                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap"
                                        >
                                            <CheckCircle2 className="w-3 h-3" />
                                            <span>Konfirmasi Terima DP</span>
                                        </button>
                                    ) : (
                                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 border border-emerald-300/60 shrink-0">
                                            TERCATAT DI KEUANGAN
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── ROW 3: DYNAMIC SERVICES, DELIVERABLES & WORKFLOW TIMELINE ─── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                        {/* 1. Card Kiri: Layanan Termasuk & Output Deliverables Paket (Span 5) */}
                        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                            <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                    <h4 className="font-bold text-sm text-slate-900 truncate">
                                        Layanan &amp; Deliverables Paket
                                    </h4>
                                    <span className="text-[11px] text-slate-400 block truncate">
                                        Hasil &amp; produk akhir yang diserahkan ke klien
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                                    {project?.package?.name || 'Paket Standar'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                {/* Layanan Termasuk */}
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                                        Layanan Termasuk
                                    </span>
                                    {servicesList.length === 0 ? (
                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                                            <p className="text-xs text-slate-400 italic">Tidak ada layanan spesifik pada database paket</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            {servicesList.map((item: string, i: number) => (
                                                <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50/70 border border-slate-100/80 text-slate-700 font-medium text-[11px]">
                                                    <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
                                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                    </div>
                                                    <span className="break-words whitespace-normal">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Output Deliverables */}
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                                        Item Deliverables (Hasil Akhir)
                                    </span>
                                    {deliverablesList.length === 0 ? (
                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                                            <p className="text-xs text-slate-400 italic">Tidak ada item deliverables pada database paket</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {deliverablesList.map((item: any) => {
                                                const badgeClass =
                                                    item.type === 'Video'
                                                        ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                                        : item.type === 'Album'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                        : item.type === 'Special'
                                                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                        : 'bg-sky-50 text-sky-700 border-sky-200';

                                                return (
                                                    <div key={item.id} className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1.5 transition-all hover:bg-slate-50">
                                                        <div className="flex items-center justify-between gap-1.5">
                                                            <span className="font-bold text-slate-800 text-[11px] leading-tight break-words whitespace-normal">
                                                                {item.name}
                                                            </span>
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono shrink-0 border border-indigo-100">
                                                                {item.deadline}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-[10px] text-slate-400 truncate">
                                                                {item.description || 'Item hasil serah terima'}
                                                            </span>
                                                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${badgeClass} shrink-0`}>
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

                        {/* 2. Card Kanan: Alur Kerja & Tahapan Operasional Tim (Span 7) */}
                        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                            <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between gap-2 flex-wrap">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900">
                                        Alur Kerja &amp; Tahapan Operasional Tim
                                    </h4>
                                    <span className="text-[11px] text-slate-400">
                                        Tahap {currentStepIndex} dari {activeWorkflow.steps_count}: {project?.workflow_step || 'Booking'} ({project?.progress || 0}%)
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {currentStepIndex < activeWorkflow.steps_count ? (
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateWorkflowStep(currentStepIndex + 1)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3B46F1] hover:bg-[#323BD8] text-white text-[11px] font-bold rounded-lg shadow-2xs transition-all cursor-pointer shrink-0"
                                        >
                                            <span>Lanjut Tahap Berikutnya</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </button>
                                    ) : (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                            Semua Tahap Selesai
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 text-xs">
                                {timelineSteps.map((step) => (
                                    <div
                                        key={step.id}
                                        className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                                            step.done
                                                ? 'bg-emerald-50/40 border-emerald-100'
                                                : step.current
                                                ? 'bg-indigo-50/60 border-indigo-200 shadow-2xs'
                                                : 'bg-white border-slate-100'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                                                    step.done
                                                        ? 'bg-emerald-600 text-white'
                                                        : step.current
                                                        ? 'bg-[#3B46F1] text-white ring-2 ring-indigo-200'
                                                        : 'bg-slate-100 text-slate-500'
                                                }`}
                                            >
                                                {step.done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-slate-900 text-xs">{step.name}</span>
                                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                                                        {step.phase}
                                                    </span>
                                                </div>
                                                {step.activity && (
                                                    <p className="text-[10.5px] text-slate-500 break-words whitespace-normal leading-snug">
                                                        {step.activity}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 block">
                                                    {step.duration}
                                                </span>
                                                <span className={`text-[10px] font-bold block ${step.statusColor}`}>
                                                    {step.status}
                                                </span>
                                            </div>
                                            {step.current && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateWorkflowStep(step.id + 1)}
                                                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                                                >
                                                    <Check className="w-2.5 h-2.5" />
                                                    <span>Selesaikan Tahap</span>
                                                </button>
                                            )}
                                            {!step.done && !step.current && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateWorkflowStep(step.id)}
                                                    className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded text-[10px] font-semibold border border-slate-200 transition-all cursor-pointer"
                                                >
                                                    Pilih Tahap
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── ROW 4: RIWAYAT PEMBAYARAN PROJECT ────────────────────────────── */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-xs text-slate-900">Riwayat Transaksi Pembayaran</h3>
                                <p className="text-[11px] text-slate-400">Semua catatan cicilan dan pelunasan yang telah tervalidasi</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => openPaymentModal()}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Catat Pembayaran Baru</span>
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                                        <th className="py-2.5 px-3">TANGGAL</th>
                                        <th className="py-2.5 px-3">DESKRIPSI / KETERANGAN</th>
                                        <th className="py-2.5 px-3">METODE PEMBAYARAN</th>
                                        <th className="py-2.5 px-3 text-right">JUMLAH (RP)</th>
                                        <th className="py-2.5 px-3 text-center">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {project?.payments && project.payments.length > 0 ? (
                                        project.payments.map((pm: any, pIdx: number) => (
                                            <tr key={pm.id || pIdx} className="hover:bg-slate-50/60">
                                                <td className="py-3 px-3 font-mono">{formatDateIndo(pm.payment_date || pm.created_at)}</td>
                                                <td className="py-3 px-3 font-medium text-slate-900">{pm.notes || 'Pembayaran Project'}</td>
                                                <td className="py-3 px-3">{pm.payment_method?.name || pm.paymentMethod?.name || 'Transfer Bank'}</td>
                                                <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600">
                                                    {formatRupiah(Number(pm.amount || 0))}
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        BERHASIL
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-slate-400">
                                                <CreditCard className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                                                <p className="font-semibold text-slate-600 text-xs">Belum ada riwayat pembayaran yang dicatat.</p>
                                                <p className="text-[11px] text-slate-400">Klik &quot;Catat Pembayaran Baru&quot; untuk menambahkan transfer DP/pelunasan.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAB: TIMELINE VIEW ───────────────────────────────────────────── */}
            {activeTab === 'timeline' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Alur Workflow Lengkap &amp; Target Deadline</h2>
                            <p className="text-xs text-slate-500">Pantau dan jalankan setiap tahapan pengerjaan operasional project studio.</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {activeWorkflow.name}
                            </span>
                            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Progres: {project?.progress || 0}%
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>Tahap {currentStepIndex} dari {activeWorkflow.steps_count}: {project?.workflow_step || 'Booking'}</span>
                            <span className="font-mono text-[#3B46F1]">{project?.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-indigo-500 to-[#3B46F1] h-full rounded-full transition-all duration-500"
                                style={{ width: `${project?.progress || 0}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {timelineSteps.map((step) => (
                            <div
                                key={step.id}
                                className={`p-4 rounded-xl border flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap transition-all ${
                                    step.done
                                        ? 'bg-emerald-50/40 border-emerald-200'
                                        : step.current
                                        ? 'bg-indigo-50/60 border-indigo-300 shadow-xs ring-1 ring-indigo-200'
                                        : 'bg-white border-slate-200/80'
                                }`}
                            >
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                            step.done
                                                ? 'bg-emerald-600 text-white'
                                                : step.current
                                                ? 'bg-[#3B46F1] text-white ring-2 ring-indigo-200'
                                                : 'bg-slate-100 text-slate-400'
                                        }`}
                                    >
                                        {step.done ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
                                    </div>
                                    <div className="min-w-0 space-y-0.5">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-bold text-xs text-slate-900">{step.name}</h4>
                                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                                {step.phase}
                                            </span>
                                        </div>
                                        {step.activity && (
                                            <p className="text-[11px] text-slate-600 break-words whitespace-normal leading-relaxed">
                                                {step.activity}
                                            </p>
                                        )}
                                        <div className="text-[10px] text-indigo-700 font-mono font-semibold pt-0.5">
                                            Target Deadline / Durasi: {step.duration}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                    <span className={`text-xs font-bold shrink-0 ${step.statusColor}`}>{step.status}</span>
                                    {step.current && (
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateWorkflowStep(step.id + 1)}
                                            className="px-3 py-1.5 bg-[#3B46F1] hover:bg-[#323BD8] text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                                        >
                                            <span>Selesaikan &amp; Lanjut</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    {!step.done && !step.current && (
                                        <button
                                            type="button"
                                            onClick={() => handleUpdateWorkflowStep(step.id)}
                                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-all cursor-pointer shrink-0"
                                        >
                                            Set Sebagai Tahap Aktif
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── TAB: FILES VIEW ──────────────────────────────────────────────── */}
            {activeTab === 'files' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Master File &amp; Google Drive</h2>
                            <p className="text-xs text-slate-500">Kelola link berkas dokumentasi foto, video, dan album serah terima.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsLinkModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B46F1] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#323BD8] cursor-pointer"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Tambah Link File</span>
                        </button>
                    </div>

                    {project?.file_links && project.file_links.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {project.file_links.map((link: any, lIdx: number) => (
                                <div key={link.id || lIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-xs text-slate-900">{link.name}</span>
                                        <Folder className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <p className="text-[11px] text-slate-400 font-mono truncate">{link.drive_url}</p>
                                    <a
                                        href={link.drive_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline pt-1"
                                    >
                                        <span>Buka di Google Drive</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center py-10 space-y-2">
                            <Folder className="w-10 h-10 text-slate-400 mx-auto" />
                            <p className="text-xs font-bold text-slate-700">Belum ada link Google Drive yang disematkan</p>
                            <p className="text-[11px] text-slate-400">Klik tombol di atas untuk menambahkan link master foto/video serah terima.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB: CATATAN VIEW ────────────────────────────────────────────── */}
            {activeTab === 'catatan' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Catatan Khusus &amp; Brief Project</h2>
                            <p className="text-xs text-slate-500">Instruksi internal, preferensi konsep, dan referensi klien.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsNoteModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B46F1] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#323BD8] cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah Catatan Baru</span>
                        </button>
                    </div>

                    <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
                        <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                            <div className="text-xs font-bold text-amber-900">
                                Catatan &amp; Preferensi Brief Project
                            </div>
                            <span className="text-[10px] text-amber-700 font-mono">
                                Diperbarui: {formatDateIndo(project?.updated_at || project?.created_at)}
                            </span>
                        </div>
                        <div className="text-xs text-amber-950 leading-relaxed whitespace-pre-line">
                            {project?.notes || 'Belum ada catatan khusus yang ditambahkan pada project ini.'}
                        </div>
                    </div>
                </div>
            )}

            {/* ── HIGHLIGHT PROJECT TAB ───────────────────────────────────────── */}
            {activeTab === 'highlight' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <span>Galeri Highlight &amp; Momen Terbaik Project</span>
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Foto-foto kurasi pilihan yang tampil eksklusif di galeri Portal Klien (/client/projects/{project?.id}).
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setHighlightFormData({ title: '', caption: '', image_url: '', image_file: null, is_cover: false });
                                setHighlightFilePreview('');
                                setIsHighlightModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B46F1] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#323BD8] cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Unggah Foto Highlight</span>
                        </button>
                    </div>

                    {project?.highlights && project.highlights.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {project.highlights.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                                >
                                    <div className="aspect-[4/3] bg-slate-900 relative overflow-hidden group">
                                        <img
                                            src={item.image_url}
                                            alt={item.title || 'Highlight'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {item.is_cover && (
                                            <div className="absolute top-2.5 left-2.5">
                                                <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-xs flex items-center gap-1">
                                                    <Sparkles className="w-2.5 h-2.5" />
                                                    Cover Utama
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                                            <a
                                                href={item.image_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-xs transition-colors"
                                                title="Lihat Foto Full Size"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteHighlight(item.id)}
                                                className="p-2 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                                                title="Hapus Foto"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-xs text-slate-900 leading-tight line-clamp-1">
                                                {item.title || 'Momen Acara'}
                                            </h4>
                                            {item.caption && (
                                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                                                    {item.caption}
                                                </p>
                                            )}
                                        </div>

                                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                            {!item.is_cover ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetCover(item.id)}
                                                    className="text-[10px] font-bold text-slate-600 hover:text-indigo-600 cursor-pointer"
                                                >
                                                    Jadikan Cover
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Cover Aktif
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteHighlight(item.id)}
                                                className="text-[10px] font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3">
                            <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
                            <h3 className="font-bold text-sm text-slate-800">Belum Ada Foto Highlight</h3>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                Unggah foto-foto terbaik acara klien ini agar dapat dinikmati langsung di galeri Portal Klien.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setHighlightFormData({ title: '', caption: '', image_url: '', image_file: null, is_cover: false });
                                    setHighlightFilePreview('');
                                    setIsHighlightModalOpen(true);
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B46F1] text-white rounded-xl text-xs font-bold hover:bg-[#323BD8] cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Unggah Foto Pertama</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── MODAL: CATAT PEMBAYARAN ───────────────────────────────────────── */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-sm text-slate-900">Catat Pembayaran Klien</h3>
                            <button
                                type="button"
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handlePaymentSubmit} className="space-y-3.5 text-xs">
                            {/* Summary Finansial Singkat */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-slate-400 block text-[10px] font-medium">Total Nilai Project</span>
                                    <span className="font-bold text-slate-900 font-mono">{formatRupiah(totalProject)}</span>
                                </div>
                                <div className="text-center">
                                    <span className="text-slate-400 block text-[10px] font-medium">Sudah Dibayar</span>
                                    <span className="font-bold text-emerald-600 font-mono">{formatRupiah(paidAmount)}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-slate-400 block text-[10px] font-medium">Sisa Tagihan</span>
                                    <span className="font-bold text-amber-700 font-mono">{formatRupiah(sisaPelunasan)}</span>
                                </div>
                            </div>

                            {/* Shortcut Pilihan Cepat Nominal */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px]">
                                    <label className="font-bold text-slate-700">Pilihan Cepat Nominal (Shortcut):</label>
                                    <span className="text-[10px] text-slate-400">Klik untuk isi otomatis</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {nominalDP > 0 && paidAmount < nominalDP && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPaymentFormData({
                                                    ...paymentFormData,
                                                    amount: String(Math.round(nominalDP)),
                                                    notes: `Pembayaran Uang Muka (DP ${dpPercent}%) untuk ${project?.name || ''}`,
                                                });
                                            }}
                                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                                Number(paymentFormData.amount) === Math.round(nominalDP)
                                                    ? 'bg-indigo-50 text-[#3B46F1] border-indigo-300 ring-1 ring-indigo-200'
                                                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                            }`}
                                        >
                                            Bayar DP ({formatRupiah(nominalDP)})
                                        </button>
                                    )}

                                    {sisaPelunasan > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPaymentFormData({
                                                    ...paymentFormData,
                                                    amount: String(Math.round(sisaPelunasan)),
                                                    notes: `Pelunasan Sisa Tagihan untuk ${project?.name || ''}`,
                                                });
                                            }}
                                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                                Number(paymentFormData.amount) === Math.round(sisaPelunasan)
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200'
                                                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                            }`}
                                        >
                                            Pelunasan Sisa ({formatRupiah(sisaPelunasan)})
                                        </button>
                                    )}

                                    {totalProject > 0 && paidAmount === 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPaymentFormData({
                                                    ...paymentFormData,
                                                    amount: String(Math.round(totalProject)),
                                                    notes: `Pembayaran Lunas Penuh (100%) untuk ${project?.name || ''}`,
                                                });
                                            }}
                                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                                Number(paymentFormData.amount) === Math.round(totalProject)
                                                    ? 'bg-purple-50 text-purple-700 border-purple-300 ring-1 ring-purple-200'
                                                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                            }`}
                                        >
                                            Lunas Penuh 100% ({formatRupiah(totalProject)})
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Input Jumlah Pembayaran dengan Format Otomatis */}
                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Jumlah Pembayaran *</label>
                                <FormattedNumberInput
                                    value={Number(paymentFormData.amount) || ''}
                                    onChange={(val) => setPaymentFormData({ ...paymentFormData, amount: String(val) })}
                                    prefix="Rp"
                                    placeholder="0"
                                    className="w-full text-sm font-mono font-bold focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20"
                                    required
                                />
                                {Number(paymentFormData.amount) > 0 && (
                                    <p className="text-[11px] text-slate-500 italic">
                                        Nominal: <strong className="text-slate-800 font-semibold">{formatRupiah(Number(paymentFormData.amount))}</strong>
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Tanggal Pembayaran *</label>
                                <input
                                    type="date"
                                    value={paymentFormData.payment_date}
                                    onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_date: e.target.value })}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B46F1] outline-hidden"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Metode Pembayaran / Rekening Bank *</label>
                                <select
                                    value={paymentFormData.payment_method_id}
                                    onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_method_id: e.target.value })}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#3B46F1] outline-hidden bg-white"
                                    required
                                >
                                    {payment_methods.length > 0 ? (
                                        payment_methods.map((pm) => (
                                            <option key={pm.id} value={pm.id}>
                                                {pm.name} {pm.account_number ? `(${pm.account_number} a.n. ${pm.account_holder})` : ''}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">Pilih Metode Pembayaran</option>
                                    )}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Nomor Referensi Transfer / Bukti (Opsional)</label>
                                <input
                                    type="text"
                                    value={paymentFormData.reference_number}
                                    onChange={(e) => setPaymentFormData({ ...paymentFormData, reference_number: e.target.value })}
                                    placeholder="Contoh: REF-BCA-82910"
                                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#3B46F1] outline-hidden"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Catatan / Keterangan</label>
                                <input
                                    type="text"
                                    value={paymentFormData.notes}
                                    onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B46F1] outline-hidden"
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={paymentSubmitting}
                                    className="px-4 py-2 bg-[#3B46F1] text-white rounded-xl font-bold hover:bg-[#323BD8] cursor-pointer"
                                >
                                    {paymentSubmitting ? 'Menyimpan ke Finance...' : 'Simpan Pembayaran ke Finance'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL: TAMBAH LINK FILE ───────────────────────────────────────── */}
            {isLinkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-sm text-slate-900">Tambah Link Google Drive / File</h3>
                            <button
                                type="button"
                                onClick={() => setIsLinkModalOpen(false)}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleLinkSubmit} className="space-y-3 text-xs">
                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Nama Link / Dokumen *</label>
                                <input
                                    type="text"
                                    value={linkFormData.name}
                                    onChange={(e) => setLinkFormData({ ...linkFormData, name: e.target.value })}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B46F1] outline-hidden"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">URL Google Drive *</label>
                                <input
                                    type="url"
                                    value={linkFormData.drive_url}
                                    onChange={(e) => setLinkFormData({ ...linkFormData, drive_url: e.target.value })}
                                    placeholder="https://drive.google.com/..."
                                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B46F1] outline-hidden"
                                    required
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsLinkModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={linkSubmitting}
                                    className="px-4 py-2 bg-[#3B46F1] text-white rounded-xl font-bold hover:bg-[#323BD8] cursor-pointer"
                                >
                                    {linkSubmitting ? 'Menyimpan...' : 'Simpan Link'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL: TAMBAH CATATAN ─────────────────────────────────────────── */}
            {isNoteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-sm text-slate-900">Tambah Catatan Khusus Project</h3>
                            <button
                                type="button"
                                onClick={() => setIsNoteModalOpen(false)}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3 text-xs">
                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Isi Catatan</label>
                                <textarea
                                    value={newNoteText}
                                    onChange={(e) => setNewNoteText(e.target.value)}
                                    placeholder="Tuliskan catatan brief atau instruksi pengerjaan..."
                                    rows={4}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B46F1] outline-hidden"
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsNoteModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        toast.success('Catatan berhasil ditambahkan!');
                                        setIsNoteModalOpen(false);
                                        setNewNoteText('');
                                    }}
                                    className="px-4 py-2 bg-[#3B46F1] text-white rounded-xl font-bold hover:bg-[#323BD8] cursor-pointer"
                                >
                                    Simpan Catatan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL: UNGGAH / TAMBAH FOTO HIGHLIGHT ────────────────────────── */}
            {isHighlightModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-500" />
                                <span>Tambah Foto Highlight Project</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsHighlightModalOpen(false)}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleHighlightSubmit} className="space-y-3.5 text-xs">
                            <div className="space-y-1">
                                <label className="font-bold text-slate-700 uppercase text-[10px]">Judul Foto / Momen</label>
                                <input
                                    type="text"
                                    required
                                    value={highlightFormData.title}
                                    onChange={(e) => setHighlightFormData({ ...highlightFormData, title: e.target.value })}
                                    placeholder="Contoh: First Look &amp; Tukar Cincin"
                                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B46F1] outline-hidden"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-slate-700 uppercase text-[10px]">Unggah Foto (WebP Optimized)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setHighlightFormData({ ...highlightFormData, image_file: file });
                                            setHighlightFilePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                    className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-slate-700 uppercase text-[10px]">Atau Gunakan URL Foto</label>
                                <input
                                    type="text"
                                    value={highlightFormData.image_url}
                                    onChange={(e) => {
                                        setHighlightFormData({ ...highlightFormData, image_url: e.target.value });
                                        setHighlightFilePreview(e.target.value);
                                    }}
                                    placeholder="https://... atau /images/..."
                                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B46F1] outline-hidden"
                                />
                            </div>

                            {highlightFilePreview && (
                                <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 border relative">
                                    <img src={highlightFilePreview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="font-bold text-slate-700 uppercase text-[10px]">Caption / Cerita Momen</label>
                                <textarea
                                    value={highlightFormData.caption}
                                    onChange={(e) => setHighlightFormData({ ...highlightFormData, caption: e.target.value })}
                                    placeholder="Tuliskan keterangan singkat foto highlight ini..."
                                    rows={3}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B46F1] outline-hidden resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={highlightFormData.is_cover}
                                        onChange={(e) => setHighlightFormData({ ...highlightFormData, is_cover: e.target.checked })}
                                        className="w-4 h-4 rounded text-[#3B46F1] focus:ring-[#3B46F1]"
                                    />
                                    <span className="font-bold text-slate-800 text-xs">Jadikan Foto Cover Utama Project</span>
                                </label>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsHighlightModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={highlightSubmitting}
                                    className="px-4 py-2 bg-[#3B46F1] text-white rounded-xl font-bold hover:bg-[#323BD8] disabled:opacity-50 cursor-pointer"
                                >
                                    {highlightSubmitting ? 'Menyimpan...' : 'Simpan Foto Highlight'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
