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
    Download,
    Award,
    Printer,
    Eye,
    EyeOff,
    ChevronLeft,
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
    Baby,
    RotateCcw,
    Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Modal, AlertConfirmation } from '@/components/ui';
import { formatRupiah, formatDate } from '@/lib/formatters';
import {
    RecordPaymentModal,
    ProofViewerModal,
    AddDriveLinkModal,
    AddNoteModal,
    EditNoteModal,
    AddHighlightModal,
    ProjectSlideModal,
    CategorySpecificView,
} from '@/components/projects';

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
    const userRoles: string[] = user?.roles ?? [];
    const isSupervisor = Boolean(user?.is_supervisor || userRoles.includes('Supervisor'));
    // Supervisor cannot add, edit, or view invoices
    const canManageInvoices = !isSupervisor;

    // Active Navigation Tab
    const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'files' | 'catatan' | 'invoice' | 'highlight' | 'slide'>('overview');
    const [actionDropdownOpen, setActionDropdownOpen] = useState(false);
    const [invoiceDropdownOpen, setInvoiceDropdownOpen] = useState(false);

    // Modals
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentModalData, setPaymentModalData] = useState<{ amount?: number; notes?: string; invoiceId?: string | number }>({});
    const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

    const openPaymentModal = (defaultAmount?: number, defaultNotes?: string, defaultInvoiceId?: string | number) => {
        setPaymentModalData({ amount: defaultAmount, notes: defaultNotes, invoiceId: defaultInvoiceId });
        setIsPaymentModalOpen(true);
    };

    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkModalInitialData, setLinkModalInitialData] = useState<{ name?: string; drive_url?: string }>({
        name: 'Master Dokumentasi Google Drive',
        drive_url: '',
    });
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
    const [isEditAllNotesOpen, setIsEditAllNotesOpen] = useState(false);
    const [editAllNotesContent, setEditAllNotesContent] = useState('');
    const [isUpdatingNotes, setIsUpdatingNotes] = useState(false);
    const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);
    const [isDeletingProject, setIsDeletingProject] = useState(false);
    const [confirmCancelProject, setConfirmCancelProject] = useState(false);
    const [isCancellingProject, setIsCancellingProject] = useState(false);
    const [confirmRestoreProject, setConfirmRestoreProject] = useState(false);
    const [isRestoringProject, setIsRestoringProject] = useState(false);

    // Specific note editing state
    const [editingNoteData, setEditingNoteData] = useState<{
        isOpen: boolean;
        index: number | null;
        title: string;
        content: string;
    }>({
        isOpen: false,
        index: null,
        title: '',
        content: '',
    });

    const openEditNoteModal = (index: number, title: string, content: string) => {
        setEditingNoteData({
            isOpen: true,
            index,
            title,
            content,
        });
    };

    const handleDeleteNoteEntry = (index: number, noteTitle: string) => {
        if (!project?.id) return;
        if (!confirm(`Apakah Anda yakin ingin menghapus catatan "${noteTitle}"?`)) return;

        router.delete(`/projects/${project.id}/notes/${index}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Catatan berhasil dihapus dari project.'),
            onError: (errs) => {
                const first = (Object.values(errs)[0] as string) || 'Gagal menghapus catatan.';
                toast.error(first);
            },
        });
    };

    const handleUpdateAllNotes = (e: React.FormEvent) => {
        e.preventDefault();
        if (!project?.id) return;

        setIsUpdatingNotes(true);
        router.put(
            `/projects/${project.id}/note`,
            { notes: editAllNotesContent },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Catatan project berhasil diperbarui.');
                    setIsEditAllNotesOpen(false);
                    setIsUpdatingNotes(false);
                },
                onError: (errs) => {
                    setIsUpdatingNotes(false);
                    const first = (Object.values(errs)[0] as string) || 'Gagal memperbarui catatan.';
                    toast.error(first);
                },
            }
        );
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

    // ── SLIDE PROJECT STATE & HANDLERS ──────────────────────────────────────
    const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<any | null>(null);
    const [slidePreviewIndex, setSlidePreviewIndex] = useState(0);

    const openCreateSlideModal = () => {
        setEditingSlide(null);
        setIsSlideModalOpen(true);
    };

    const openEditSlideModal = (slide: any) => {
        setEditingSlide(slide);
        setIsSlideModalOpen(true);
    };

    const handleToggleSlideActive = (slide: any) => {
        router.patch(`/projects/${project?.id}/promo-slides/${slide.id}/toggle`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Status slide banner berhasil diubah'),
            onError: () => toast.error('Gagal mengubah status slide banner'),
        });
    };

    const handleDeleteSlide = (slide: any) => {
        if (!confirm(`Hapus slide banner "${slide.title}"?`)) return;
        router.delete(`/projects/${project?.id}/promo-slides/${slide.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Slide banner berhasil dihapus'),
            onError: () => toast.error('Gagal menghapus slide banner'),
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
    const clientSecondaryPhone = project?.client?.secondary_phone || null;
    const clientEmail = project?.client?.email || '-';
    const clientInstagram = project?.client?.instagram || '-';
    const clientAddress = project?.client?.address || project?.location || '-';
    const clientCity = project?.client?.city || '';
    const clientProvince = project?.client?.province || (project?.client?.category_data as any)?.province || '-';
    const clientDistrict = project?.client?.district || (project?.client?.category_data as any)?.district || '-';
    const clientVillage = project?.client?.village || (project?.client?.category_data as any)?.village || '-';
    const clientPostalCode = project?.client?.postal_code || (project?.client?.category_data as any)?.postal_code || '-';
    const clientContactPreference = project?.client?.contact_preference || project?.client?.preferred_contact || 'WhatsApp';
    const clientOtherSocial = project?.client?.other_social_media || (project?.client?.category_data as any)?.other_social_media || '-';
    const clientChildName = project?.client?.child_name || null;
    const clientChildBirthDate = project?.client?.child_birth_date || null;
    const clientChildGender = project?.client?.child_gender || null;
    const clientBrideName = project?.client?.bride_name || null;
    const clientBrideNickname = project?.client?.bride_nickname || null;
    const clientGroomName = project?.client?.groom_name || null;
    const clientGroomNickname = project?.client?.groom_nickname || null;
    const clientFatherName = project?.client?.father_name || null;
    const clientMotherName = project?.client?.mother_name || null;
    const clientChildren: Array<{ name: string; nickname?: string; birth_date?: string; gender?: string }> = Array.isArray(project?.client?.children) ? project.client.children : [];
    const categoryFormType = project?.category?.form_type || (project?.category?.name?.toLowerCase().includes('wedding') ? 'wedding' : project?.category?.name?.toLowerCase().includes('newborn') ? 'newborn' : 'standard');


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

    const structuredTeamAssignments: Array<{ type: string; name: string; notes?: string }> = useMemo(() => {
        const raw = (project?.category_data as any)?.team_assignments;
        if (Array.isArray(raw) && raw.length > 0) {
            return raw.filter((t: any) => t && t.name && typeof t.name === 'string' && t.name.trim().length > 0);
        }
        return [];
    }, [project?.category_data]);

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
    const projectInvoices = useMemo(() => {
        return (project?.invoices || []).map((inv: any) => {
            const tot = Number(inv.total || 0);
            const pd = Number(inv.paid_amount || 0);
            const rem = Math.max(0, Number(inv.remaining_amount ?? (tot - pd)));
            let statusLabel = 'Belum Lunas';
            let statusVariant = 'destructive';
            if (tot > 0 && rem <= 0) {
                statusLabel = 'Lunas';
                statusVariant = 'success';
            } else if (pd > 0) {
                statusLabel = 'Sebagian';
                statusVariant = 'warning';
            }
            return {
                ...inv,
                total: tot,
                paid_amount: pd,
                remaining_amount: rem,
                status_label: statusLabel,
                status_variant: statusVariant,
                is_paid: rem <= 0 && tot > 0,
            };
        });
    }, [project?.invoices]);

    const nextUnpaidInvoice = useMemo(() => {
        return projectInvoices.find((i: any) => !i.is_paid) || null;
    }, [projectInvoices]);

    const dpInvoiceAmount = Number(projectInvoices[0]?.total || 0);
    const nominalDP = dpInvoiceAmount > 0
        ? dpInvoiceAmount
        : (paidAmount > 0 ? paidAmount : Math.round(totalProject * 0.3));
    const sisaPelunasan = Math.max(0, totalProject - paidAmount);
    const dpPercent = totalProject > 0 ? Math.round((nominalDP / totalProject) * 100) : 30;

    const isDpPaid = useMemo(() => {
        if (project?.payment_status === 'paid') {
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
        const allFiles: any[] = (project?.file_links && project.file_links.length > 0)
            ? project.file_links
            : (project?.fileLinks || []);

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

            // Find matching file links for this step
            const lowerStep = step.name.trim().toLowerCase();
            const stepFiles = allFiles.filter((f: any) => {
                if (!f?.name) return false;
                const lowerName = f.name.toLowerCase();
                return (
                    lowerName.includes(`[tahap: ${lowerStep}]`) ||
                    lowerName.includes(`[tahap:${lowerStep}]`) ||
                    lowerName.includes(`[tahap: tahap ${stepNum}`) ||
                    lowerName.includes(lowerStep)
                );
            });

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
                files: stepFiles,
            };
        });
    }, [activeWorkflow, currentStepIndex, project?.status, project?.file_links, project?.fileLinks]);

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
    const [workflowModal, setWorkflowModal] = useState<{
        isOpen: boolean;
        stepToComplete: { id: number; name: string; phase?: string } | null;
        nextStep: { id: number; name: string } | null;
        targetStepIndex: number;
        linkName: string;
        driveUrl: string;
        fileType: string;
        isSubmitting: boolean;
    }>({
        isOpen: false,
        stepToComplete: null,
        nextStep: null,
        targetStepIndex: 0,
        linkName: '',
        driveUrl: '',
        fileType: 'gdrive',
        isSubmitting: false,
    });

    const [revertModal, setRevertModal] = useState<{
        isOpen: boolean;
        stepToRevert: { id: number; name: string } | null;
        isSubmitting: boolean;
    }>({
        isOpen: false,
        stepToRevert: null,
        isSubmitting: false,
    });

    const openCompleteStepModal = (step: any, nextStep: any, targetIndex: number) => {
        // Pre-fill existing file link if this step already had one saved
        const existingFile = step.files && step.files.length > 0 ? step.files[0] : null;

        setWorkflowModal({
            isOpen: true,
            stepToComplete: step,
            nextStep: nextStep || null,
            targetStepIndex: targetIndex,
            linkName: existingFile
                ? existingFile.name.replace(/^\[Tahap:[^\]]+\]\s*/i, '')
                : `Hasil ${step.name}`,
            driveUrl: existingFile ? existingFile.drive_url : '',
            fileType: existingFile?.file_type || 'gdrive',
            isSubmitting: false,
        });
    };

    const handleConfirmCompleteStep = () => {
        if (!workflowModal.stepToComplete) return;

        const totalSteps = activeWorkflow.steps.length;
        const targetStepIndex = workflowModal.targetStepIndex;
        const targetStep = activeWorkflow.steps[targetStepIndex - 1];

        const newProgress = Math.min(100, Math.round((targetStepIndex / totalSteps) * 100));
        let newStatus = project.status;
        if (targetStepIndex >= totalSteps) {
            newStatus = 'completed';
        } else if (
            targetStep?.name.toLowerCase().includes('editing') ||
            targetStep?.phase?.toLowerCase().includes('editing') ||
            targetStep?.phase?.toLowerCase().includes('post')
        ) {
            newStatus = 'editing';
        } else if (newStatus === 'draft' || newStatus === 'booking' || newStatus === 'pending') {
            newStatus = 'in_progress';
        }

        const payload: Record<string, any> = {
            workflow_step: targetStep ? targetStep.name : activeWorkflow.steps[totalSteps - 1]?.name || 'Selesai',
            progress: newProgress,
            status: newStatus,
            completed_step_name: workflowModal.stepToComplete.name,
        };

        if (workflowModal.driveUrl.trim()) {
            payload.drive_link = {
                name: workflowModal.linkName.trim() || `Hasil ${workflowModal.stepToComplete.name}`,
                drive_url: workflowModal.driveUrl.trim(),
                file_type: workflowModal.fileType || 'gdrive',
            };
        }

        setWorkflowModal((prev) => ({ ...prev, isSubmitting: true }));
        router.patch(
            `/projects/${project.id}/status`,
            payload,
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        workflowModal.driveUrl.trim()
                            ? `Tahap "${workflowModal.stepToComplete?.name}" selesai & tautan file berhasil disimpan!`
                            : `Alur kerja diperbarui ke: ${payload.workflow_step} (${newProgress}%)`
                    );
                    setWorkflowModal({
                        isOpen: false,
                        stepToComplete: null,
                        nextStep: null,
                        targetStepIndex: 0,
                        linkName: '',
                        driveUrl: '',
                        fileType: 'gdrive',
                        isSubmitting: false,
                    });
                },
                onError: (errors) => {
                    const firstError = Object.values(errors || {})[0];
                    toast.error(typeof firstError === 'string' ? firstError : 'Gagal memperbarui alur kerja');
                    setWorkflowModal((prev) => ({ ...prev, isSubmitting: false }));
                },
            }
        );
    };

    const handleConfirmRevertStep = () => {
        if (!revertModal.stepToRevert) return;
        const totalSteps = activeWorkflow.steps.length;
        const targetStepIndex = revertModal.stepToRevert.id;
        const targetStep = activeWorkflow.steps[targetStepIndex - 1];
        if (!targetStep) return;

        const targetProgress = Math.min(100, Math.max(0, Math.round(((targetStepIndex - 1) / totalSteps) * 100)));
        let newStatus = 'in_progress';
        if (targetStepIndex === 1) {
            newStatus = 'in_progress';
        } else if (
            targetStep.name.toLowerCase().includes('editing') ||
            targetStep.phase?.toLowerCase().includes('editing') ||
            targetStep.phase?.toLowerCase().includes('post')
        ) {
            newStatus = 'editing';
        }

        const revertedStepNames = activeWorkflow.steps
            .slice(targetStepIndex - 1)
            .map((s) => s.name);

        setRevertModal((prev) => ({ ...prev, isSubmitting: true }));
        router.patch(
            `/projects/${project.id}/status`,
            {
                workflow_step: targetStep.name,
                progress: targetProgress,
                status: newStatus,
                revert_step_name: targetStep.name,
                revert_step_names: revertedStepNames,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Status berhasil dikembalikan ke: ${targetStep.name} (${targetProgress}%)`);
                    setRevertModal({ isOpen: false, stepToRevert: null, isSubmitting: false });
                },
                onError: (errors) => {
                    const firstError = Object.values(errors || {})[0];
                    toast.error(typeof firstError === 'string' ? firstError : 'Gagal mengembalikan alur kerja');
                    setRevertModal((prev) => ({ ...prev, isSubmitting: false }));
                },
            }
        );
    };

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
        if (isSupervisor) return;
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

    const handleDeleteProject = () => {
        if (isSupervisor || !project?.id) return;
        setIsDeletingProject(true);
        router.delete(`/projects/${project.id}`, {
            onSuccess: () => {
                setConfirmDeleteProject(false);
                setIsDeletingProject(false);
                toast.success('Project berhasil dihapus.');
            },
            onError: () => {
                setIsDeletingProject(false);
                toast.error('Gagal menghapus project.');
            },
        });
    };

    const handleCancelProject = () => {
        if (isSupervisor || !project?.id) {
            return;
        }

        setIsCancellingProject(true);
        router.patch(
            `/projects/${project.id}/status`,
            {
                status: 'cancelled',
                progress: project.progress,
                workflow_step: project.workflow_step,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmCancelProject(false);
                    setIsCancellingProject(false);
                    toast.success('Project berhasil dibatalkan. Anda dapat mengaktifkannya kembali kapan saja.');
                },
                onError: () => {
                    setIsCancellingProject(false);
                    toast.error('Gagal membatalkan project.');
                },
            }
        );
    };

    const handleRestoreProject = () => {
        if (isSupervisor || !project?.id) {
            return;
        }

        setIsRestoringProject(true);
        const restoredStatus = (project.progress && project.progress > 0) ? 'in_progress' : 'draft';

        router.patch(
            `/projects/${project.id}/status`,
            {
                status: restoredStatus,
                progress: project.progress || 0,
                workflow_step: project.workflow_step || activeWorkflow.steps[0]?.name || 'Booking',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmRestoreProject(false);
                    setIsRestoringProject(false);
                    toast.success('Project berhasil diaktifkan kembali!');
                },
                onError: () => {
                    setIsRestoringProject(false);
                    toast.error('Gagal mengaktifkan kembali project.');
                },
            }
        );
    };

    return (
        <div className="w-full max-w-full space-y-4 pb-2">
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

                {/* Banner Status Dibatalkan */}
                {project?.status === 'cancelled' && (
                    <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs animate-in fade-in duration-200">
                        <div className="flex items-start sm:items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 shadow-2xs">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-rose-950 flex items-center gap-2">
                                    <span>Project Dibatalkan</span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-200/80 text-rose-800 tracking-wide">
                                        Nonaktif
                                    </span>
                                </h4>
                                <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                                    Aktivitas pengerjaan project ini saat ini dihentikan. Seluruh berkas, log riwayat, dan data pembayaran tetap tersimpan aman dan project dapat diaktifkan kembali sewaktu-waktu.
                                </p>
                            </div>
                        </div>
                        {!isSupervisor && (
                            <button
                                type="button"
                                onClick={() => setConfirmRestoreProject(true)}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer shrink-0"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>Aktifkan Kembali Project</span>
                            </button>
                        )}
                    </div>
                )}

                {/* Main Header with Title & Action Buttons */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <div className="space-y-2.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                                {project?.project_number || 'PRJ-2609-0000'}
                            </span>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight break-words min-w-0">
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
                                <span className="truncate max-w-[260px] sm:max-w-md" title={project?.location || 'Lokasi Acara Belum Ditentukan'}>
                                    {project?.location || 'Lokasi Acara Belum Ditentukan'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {!isSupervisor && (
                            <Link
                                href={`/projects/${project?.id}/edit`}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition-all hover:scale-[1.02] whitespace-nowrap shrink-0"
                            >
                                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Edit Project</span>
                            </Link>
                        )}

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
                                    {canManageInvoices && (
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
                                    )}
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
                                        href={project?.id ? `/client/projects/${project.id}` : '/client/projects'}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 whitespace-nowrap"
                                    >
                                        <ExternalLink className="w-4 h-4 text-purple-600" />
                                        <span>Portal Klien</span>
                                    </a>
                                    {!isSupervisor && (
                                        <>
                                            <div className="border-t border-slate-100 my-1" />
                                            {project?.status === 'cancelled' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActionDropdownOpen(false);
                                                        setConfirmRestoreProject(true);
                                                    }}
                                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 cursor-pointer whitespace-nowrap"
                                                >
                                                    <RotateCcw className="w-4 h-4 text-emerald-600" />
                                                    <span>Aktifkan Kembali Project</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActionDropdownOpen(false);
                                                        setConfirmCancelProject(true);
                                                    }}
                                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 cursor-pointer whitespace-nowrap"
                                                >
                                                    <X className="w-4 h-4 text-amber-600" />
                                                    <span>Batalkan Project</span>
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActionDropdownOpen(false);
                                                    setConfirmDeleteProject(true);
                                                }}
                                                className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer whitespace-nowrap"
                                            >
                                                <Trash2 className="w-4 h-4 text-rose-500" />
                                                <span>Hapus Project</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Buat / Lihat Invoice DP Button */}
                        {canManageInvoices && (
                            <div className="relative inline-flex rounded-xl shadow-sm shrink-0 whitespace-nowrap">
                                <Link
                                    href={`/projects/${project?.id}/invoice`}
                                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-l-xl text-xs font-bold transition-all shadow-2xs cursor-pointer whitespace-nowrap"
                                >
                                    <Receipt className="w-3.5 h-3.5" />
                                    <span>Lihat Invoice</span>
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
                        )}
                    </div>
                </div>
            </div>

            {/* ── 2. NAVIGATION TABS (OVERVIEW, TIMELINE, FILES, CATATAN, INVOICE) ── */}
            <div className="bg-white rounded-2xl border border-slate-200/80 px-4 shadow-2xs">
                <div className="flex items-center gap-8 text-xs font-bold overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('overview')}
                        className={`py-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'overview'
                            ? 'border-[#3B46F1] text-[#3B46F1]'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('timeline')}
                        className={`py-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'timeline'
                            ? 'border-[#3B46F1] text-[#3B46F1]'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        Timeline &amp; Workflow
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('files')}
                        className={`py-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'files'
                            ? 'border-[#3B46F1] text-[#3B46F1]'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        Files &amp; Google Drive
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('catatan')}
                        className={`py-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === 'catatan'
                            ? 'border-[#3B46F1] text-[#3B46F1]'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        Catatan &amp; Brief
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('highlight')}
                        className={`py-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'highlight'
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
                    <button
                        type="button"
                        onClick={() => setActiveTab('slide')}
                        className={`py-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'slide'
                            ? 'border-[#3B46F1] text-[#3B46F1]'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Slide Project</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
                            {project?.promo_slides?.length || 0}
                        </span>
                    </button>
                    {canManageInvoices && (
                        <Link
                            href={`/projects/${project?.id}/invoice`}
                            className="py-3.5 border-b-2 border-transparent text-slate-500 hover:text-slate-800 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
                        >
                            <span>Invoice</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                        </Link>
                    )}
                </div>
            </div>

            {/* ── 3. MAIN DASHBOARD CONTENT (OVERVIEW TAB) ──────────────────────── */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* ── ROW 1: DESKRIPSI PROJECT, STATUS PROJECT, PIC & TIM PRODUKSI ─ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
                        {/* 1. Deskripsi Project */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between h-full min-w-0 overflow-hidden">
                            <div className="space-y-2.5 min-w-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-xs text-slate-900 truncate">
                                        Deskripsi &amp; Konsep Acara
                                    </h3>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed break-words whitespace-normal line-clamp-4">
                                    {cleanProjectDescription}
                                </p>
                            </div>
                            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 gap-2 min-w-0">
                                <span className="truncate flex-1 min-w-0" title={formattedReferral}>
                                    <strong className="font-semibold text-slate-600">Ref:</strong> {formattedReferral}
                                </span>
                            </div>
                            <div className="pt-2 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 gap-2 min-w-0">
                                <span
                                    className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[10px] truncate shrink-0 border border-slate-200/60"
                                    title={project?.category?.name || 'Umum'}
                                >
                                    {project?.category?.name || 'Umum'}
                                </span>
                            </div>
                        </div>

                        {/* 2. Status & Riwayat Project */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between h-full">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                            <Clock3 className="w-4 h-4" />
                                        </div>
                                        <h3 className="font-bold text-xs text-slate-900">
                                            Status &amp; Riwayat
                                        </h3>
                                    </div>
                                    {isSupervisor ? (
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusBadge.bg}`}>
                                            {statusBadge.label}
                                        </span>
                                    ) : (
                                        <div className="relative">
                                            <select
                                                value={project?.status || 'draft'}
                                                onChange={(e) => {
                                                    if (e.target.value === 'cancelled') {
                                                        setConfirmCancelProject(true);
                                                    } else {
                                                        handleQuickStatusChange(e.target.value);
                                                    }
                                                }}
                                                className={`pl-2.5 pr-6 py-1 rounded-lg text-[10px] font-bold border cursor-pointer outline-hidden bg-white shadow-2xs hover:ring-2 hover:ring-indigo-200 transition-all appearance-none ${statusBadge.bg}`}
                                                title="Klik untuk mengubah status project langsung ke database"
                                            >
                                                <option value="draft">DRAFT</option>
                                                <option value="in_progress">DALAM PROSES</option>
                                                <option value="editing">EDITING</option>
                                                <option value="completed">SELESAI</option>
                                                <option value="on_hold">DITUNDA</option>
                                                <option value="cancelled">DIBATALKAN</option>
                                            </select>
                                            <ChevronDown className="w-3 h-3 text-slate-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    )}
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
                                </div>
                            </div>
                            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                                <span>Terakhir Diedit</span>
                                <span className="font-medium text-slate-700">{formatDateTimeIndo(project?.updated_at)}</span>
                            </div>
                        </div>

                        {/* 3. PIC & Tim Produksi Assigned */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between h-full md:col-span-2 xl:col-span-1 min-w-0">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                            <Users className="w-4 h-4" />
                                        </div>
                                        <h3 className="font-bold text-xs text-slate-900">
                                            Tim Produksi &amp; PIC
                                        </h3>
                                    </div>
                                    {structuredTeamAssignments.length > 0 && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                            {structuredTeamAssignments.length + (supervisorName !== 'Belum Ditentukan' ? 1 : 0)} Personil
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Supervisor (PIC)</span>
                                        <span className="font-bold text-slate-900">{supervisorName}</span>
                                    </div>

                                    {structuredTeamAssignments.length > 0 ? (
                                        <div className="pt-2 border-t border-slate-100 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                            {structuredTeamAssignments.map((member, idx) => {
                                                const typeColor =
                                                    member.type === 'Photografer'
                                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                        : member.type === 'Videografer'
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                            : member.type === 'Editor Foto'
                                                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                                : member.type === 'Editor Video'
                                                                    ? 'bg-violet-50 text-violet-700 border-violet-200'
                                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                                return (
                                                    <div key={idx} className="flex justify-between items-center gap-2 py-0.5">
                                                        <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${typeColor}`}>
                                                            {member.type || 'Personil'}
                                                        </span>
                                                        <span className="font-semibold text-slate-800 text-right truncate">
                                                            {member.name}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500">Lead Photographer</span>
                                                <span className="font-semibold text-slate-800">{parsedPhotographer}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500">Lead Editor</span>
                                                <span className="font-semibold text-slate-800">{parsedEditor}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                                <span>Kontak PIC</span>
                                <span className="font-mono font-medium text-slate-800">
                                    {supervisorPhone && supervisorPhone !== '-' ? supervisorPhone : 'Belum diisi'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── ROW 2A: INFORMASI SPESIFIK KATEGORI PROJECT ─── */}
                    <CategorySpecificView project={project} />

                    {/* ── ROW 2B: INFORMASI KONTAK KLIEN & ALAMAT (1 KOLOM PENUH KE BAWAH) ─── */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all w-full space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-sm text-slate-900">Informasi Klien &amp; Kontak Pemesan</h3>
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-indigo-50 text-indigo-700 border-indigo-200">
                                            {clientName}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">Kontak utama pemesan, rincian alamat wilayah lengkap, dan catatan referensi</p>
                                </div>
                            </div>
                            {project?.client?.id && (
                                <Link
                                    href={`/clients/${project.client.id}`}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 transition-all self-start sm:self-auto shrink-0 shadow-2xs"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Lihat Detail Klien</span>
                                </Link>
                            )}
                        </div>

                        {/* SUBSECTION A: WILAYAH & ALAMAT LENGKAP (1 - 6) */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-1">
                                Wilayah &amp; Alamat Lengkap
                            </span>
                            <div className="bg-slate-50/70 rounded-xl border border-slate-200/70 divide-y divide-slate-100/90 text-xs overflow-hidden">
                                <div className="flex flex-col sm:flex-row sm:items-baseline p-3 gap-1 sm:gap-4 hover:bg-white/60 transition-colors">
                                    <div className="w-44 sm:w-52 shrink-0 flex items-center gap-2 text-slate-500">
                                        <span className="w-4.5 h-4.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">1</span>
                                        <span className="text-[11.5px] font-medium text-slate-600">Provinsi</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 flex-1 min-w-0">
                                        <span className="text-slate-400 shrink-0 hidden sm:inline">:</span>
                                        <span className="font-bold text-slate-900 leading-snug flex-1 min-w-0 break-words">{clientProvince}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-baseline p-3 gap-1 sm:gap-4 hover:bg-white/60 transition-colors">
                                    <div className="w-44 sm:w-52 shrink-0 flex items-center gap-2 text-slate-500">
                                        <span className="w-4.5 h-4.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">2</span>
                                        <span className="text-[11.5px] font-medium text-slate-600">Kota/Kabupaten</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 flex-1 min-w-0">
                                        <span className="text-slate-400 shrink-0 hidden sm:inline">:</span>
                                        <span className="font-bold text-slate-900 leading-snug flex-1 min-w-0 break-words">{clientCity || '-'}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-baseline p-3 gap-1 sm:gap-4 hover:bg-white/60 transition-colors">
                                    <div className="w-44 sm:w-52 shrink-0 flex items-center gap-2 text-slate-500">
                                        <span className="w-4.5 h-4.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">3</span>
                                        <span className="text-[11.5px] font-medium text-slate-600">Kecamatan</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 flex-1 min-w-0">
                                        <span className="text-slate-400 shrink-0 hidden sm:inline">:</span>
                                        <span className="font-bold text-slate-900 leading-snug flex-1 min-w-0 break-words">{clientDistrict}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-baseline p-3 gap-1 sm:gap-4 hover:bg-white/60 transition-colors">
                                    <div className="w-44 sm:w-52 shrink-0 flex items-center gap-2 text-slate-500">
                                        <span className="w-4.5 h-4.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">4</span>
                                        <span className="text-[11.5px] font-medium text-slate-600">Kelurahan</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 flex-1 min-w-0">
                                        <span className="text-slate-400 shrink-0 hidden sm:inline">:</span>
                                        <span className="font-bold text-slate-900 leading-snug flex-1 min-w-0 break-words">{clientVillage}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-baseline p-3 gap-1 sm:gap-4 hover:bg-white/60 transition-colors">
                                    <div className="w-44 sm:w-52 shrink-0 flex items-center gap-2 text-slate-500">
                                        <span className="w-4.5 h-4.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">5</span>
                                        <span className="text-[11.5px] font-medium text-slate-600">Kode Pos</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 flex-1 min-w-0">
                                        <span className="text-slate-400 shrink-0 hidden sm:inline">:</span>
                                        <span className="font-mono font-bold text-slate-900 leading-snug flex-1 min-w-0">{clientPostalCode}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-baseline p-3 gap-1 sm:gap-4 hover:bg-white/60 transition-colors">
                                    <div className="w-44 sm:w-52 shrink-0 flex items-center gap-2 text-slate-500">
                                        <span className="w-4.5 h-4.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">6</span>
                                        <span className="text-[11.5px] font-medium text-slate-600">Alamat Lengkap</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 flex-1 min-w-0">
                                        <span className="text-slate-400 shrink-0 hidden sm:inline">:</span>
                                        <span className="font-semibold text-slate-900 leading-relaxed flex-1 min-w-0 break-words">{clientAddress}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SUBSECTION B: KONTAK & KOMUNIKASI (7 - 12) */}
                        <div className="space-y-2 pt-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-1">
                                Kontak &amp; Media Sosial
                            </span>
                            <div className="bg-slate-50/70 rounded-xl border border-slate-200/70 divide-y divide-slate-100/90 text-xs overflow-hidden">
                                <div className="flex flex-col sm:flex-row sm:items-baseline p-3 gap-1 sm:gap-4 hover:bg-white/60 transition-colors">
                                    <div className="w-44 sm:w-52 shrink-0 flex items-center gap-2 text-slate-500">
                                        <span className="w-4.5 h-4.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">7</span>
                                        <span className="text-[11.5px] font-medium text-slate-600">No. WhatsApp</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 flex-1 min-w-0">
                                        <span className="text-slate-400 shrink-0 hidden sm:inline">:</span>
                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0 font-mono">
                                            {clientPhone && clientPhone !== '-' ? (
                                                <a
                                                    href={`https://wa.me/${String(clientPhone).replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1.5 font-bold"
                                                >
                                                    <span>{clientPhone}</span>
                                                    <ExternalLink className="w-3 h-3 text-emerald-600 shrink-0" />
                                                </a>
                                            ) : '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-baseline p-3 gap-1 sm:gap-4 hover:bg-white/60 transition-colors">
                                    <div className="w-44 sm:w-52 shrink-0 flex items-center gap-2 text-slate-500">
                                        <span className="w-4.5 h-4.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">8</span>
                                        <span className="text-[11.5px] font-medium text-slate-600">No. Alternatif</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 flex-1 min-w-0">
                                        <span className="text-slate-400 shrink-0 hidden sm:inline">:</span>
                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0 font-mono">
                                            {clientSecondaryPhone || '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-baseline p-3 gap-1 sm:gap-4 hover:bg-white/60 transition-colors">
                                    <div className="w-44 sm:w-52 shrink-0 flex items-center gap-2 text-slate-500">
                                        <span className="w-4.5 h-4.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">9</span>
                                        <span className="text-[11.5px] font-medium text-slate-600">Preferensi Kontak</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 flex-1 min-w-0">
                                        <span className="text-slate-400 shrink-0 hidden sm:inline">:</span>
                                        <span className="font-semibold text-slate-900 leading-snug capitalize flex-1 min-w-0">
                                            {clientContactPreference}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-baseline p-3 gap-1 sm:gap-4 hover:bg-white/60 transition-colors">
                                    <div className="w-44 sm:w-52 shrink-0 flex items-center gap-2 text-slate-500">
                                        <span className="w-4.5 h-4.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">10</span>
                                        <span className="text-[11.5px] font-medium text-slate-600">Email Aktif</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 flex-1 min-w-0">
                                        <span className="text-slate-400 shrink-0 hidden sm:inline">:</span>
                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0 break-all" title={clientEmail || '-'}>
                                            {clientEmail && clientEmail !== '-' ? (
                                                <a href={`mailto:${clientEmail}`} className="text-indigo-600 hover:underline">
                                                    {clientEmail}
                                                </a>
                                            ) : '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-baseline p-3 gap-1 sm:gap-4 hover:bg-white/60 transition-colors">
                                    <div className="w-44 sm:w-52 shrink-0 flex items-center gap-2 text-slate-500">
                                        <span className="w-4.5 h-4.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">11</span>
                                        <span className="text-[11.5px] font-medium text-slate-600">Instagram</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 flex-1 min-w-0">
                                        <span className="text-slate-400 shrink-0 hidden sm:inline">:</span>
                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                            {clientInstagram && clientInstagram !== '-' ? (
                                                <a
                                                    href={`https://instagram.com/${clientInstagram.replace(/^@/, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-pink-600 hover:underline inline-flex items-center gap-1 break-all font-medium"
                                                >
                                                    <span>{clientInstagram.startsWith('@') ? clientInstagram : `@${clientInstagram}`}</span>
                                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                                </a>
                                            ) : '-'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-baseline p-3 gap-1 sm:gap-4 hover:bg-white/60 transition-colors">
                                    <div className="w-44 sm:w-52 shrink-0 flex items-center gap-2 text-slate-500">
                                        <span className="w-4.5 h-4.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">12</span>
                                        <span className="text-[11.5px] font-medium text-slate-600">Media Sosial Lain</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 flex-1 min-w-0">
                                        <span className="text-slate-400 shrink-0 hidden sm:inline">:</span>
                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0 break-words whitespace-pre-line">
                                            {clientOtherSocial || '-'}
                                        </span>
                                    </div>
                                </div>

                                {woName && (
                                    <div className="flex flex-col sm:flex-row sm:items-baseline p-3 gap-1 sm:gap-4 bg-purple-50/40">
                                        <div className="w-44 sm:w-52 shrink-0 flex items-center gap-2 text-purple-700 font-bold">
                                            <span>🎀</span>
                                            <span className="text-[11.5px]">Mitra WO / EO</span>
                                        </div>
                                        <div className="flex items-baseline gap-2 flex-1 min-w-0">
                                            <span className="text-slate-400 shrink-0 hidden sm:inline">:</span>
                                            <span className="font-bold text-purple-900 leading-snug flex-1 min-w-0 break-words">
                                                {woName} {woPic ? `(PIC: ${woPic})` : ''} {woPhone ? `• ${woPhone}` : ''}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── ROW 3: 3 FINANCIAL CARDS ─────────────────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
                        {/* 1. Informasi Keuangan & Status Pembayaran */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between h-full">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        <Wallet className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-xs text-slate-900">
                                        Ringkasan Tagihan
                                    </h3>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-tight">
                                        Total Kesepakatan Project
                                    </span>
                                    <span className="text-base sm:text-lg font-black text-[#3B46F1] font-mono block truncate" title={formatRupiah(totalProject)}>
                                        {formatRupiah(totalProject)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-tight">
                                        Nominal DP ({dpPercent}%)
                                    </span>
                                    <span className="text-sm sm:text-base font-extrabold text-emerald-600 font-mono block truncate" title={formatRupiah(nominalDP)}>
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
                                <span className="text-xs sm:text-sm font-extrabold text-[#D97706] font-mono block truncate" title={formatRupiah(sisaPelunasan)}>
                                    {formatRupiah(sisaPelunasan)}
                                </span>
                            </div>
                        </div>

                        {/* 3. Rincian Biaya Project */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between h-full">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        <Receipt className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-xs text-slate-900">
                                        Rincian Biaya &amp; Diskon
                                    </h3>
                                </div>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600">Harga Paket</span>
                                        <span className="font-semibold text-slate-900 font-mono">{formatRupiah(packagePrice)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600">Total Add-on</span>
                                        <span className="font-semibold text-slate-900 font-mono">{formatRupiah(totalAddon)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600">Biaya Operasional</span>
                                        <span className="font-semibold text-slate-900 font-mono">{formatRupiah(totalBiayaOperasional)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-rose-600">
                                        <span>Diskon Paket</span>
                                        <span className="font-semibold font-mono">- {formatRupiah(diskonPaket)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-600">
                                        <span>Pajak (PPN/PPh)</span>
                                        <span className="font-semibold">{taxAmount > 0 ? `+ ${formatRupiah(taxAmount)}` : 'Non-aktif'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2.5 mt-2.5 border-t border-slate-200 flex justify-between items-center">
                                <span className="font-black text-[11px] text-slate-900 uppercase">TOTAL KESEPAKATAN</span>
                                <span className="font-black text-sm text-[#3B46F1] font-mono">{formatRupiah(totalProject)}</span>
                            </div>
                        </div>

                        {/* 4. Informasi Pembayaran & Rekening */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between h-full md:col-span-2 xl:col-span-1 min-w-0">
                            <div className="space-y-2.5 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-xs text-slate-900">
                                        Rekening Pembayaran
                                    </h3>
                                </div>
                                <div className="space-y-1.5 pt-1 text-slate-700">
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
                                        <span className="text-slate-500 shrink-0">
                                            {nextUnpaidInvoice ? 'Jatuh Tempo Tagihan' : 'Status Tagihan'}
                                        </span>
                                        <span className="font-semibold text-slate-800 text-right">
                                            {nextUnpaidInvoice
                                                ? formatDateIndo(nextUnpaidInvoice.due_date || project?.deadline || project?.event_date)
                                                : 'Lunas Penuh'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Checklist & Status Termin / Tagihan Terintegrasi Finance */}
                            <div className={`p-2.5 rounded-xl border transition-all mt-auto ${!nextUnpaidInvoice || isDpPaid
                                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                                : 'bg-amber-50/90 border-amber-200 text-amber-950'
                                }`}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${!nextUnpaidInvoice ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                                            }`}>
                                            {!nextUnpaidInvoice ? <Check className="w-3 h-3 stroke-[3]" /> : <Clock className="w-3 h-3" />}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-[10px] truncate">
                                                {!nextUnpaidInvoice
                                                    ? 'Semua Tagihan Lunas'
                                                    : `Tagihan: ${nextUnpaidInvoice.notes || nextUnpaidInvoice.invoice_number}`}
                                            </div>
                                            <div className="text-[9px] opacity-80 truncate">
                                                {!nextUnpaidInvoice
                                                    ? `Total Lunas: ${formatRupiah(totalProject)}`
                                                    : `Sisa Tagihan: ${formatRupiah(nextUnpaidInvoice.remaining_amount)}`}
                                            </div>
                                        </div>
                                    </div>
                                    {canManageInvoices && (
                                        nextUnpaidInvoice ? (
                                            <button
                                                type="button"
                                                onClick={() => openPaymentModal(nextUnpaidInvoice.remaining_amount, `Pembayaran ${nextUnpaidInvoice.notes || nextUnpaidInvoice.invoice_number}`, nextUnpaidInvoice.id)}
                                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap"
                                                title="Konfirmasi Pembayaran Termin"
                                            >
                                                <CheckCircle2 className="w-3 h-3" />
                                                <span>Konfirmasi Bayar</span>
                                            </button>
                                        ) : (
                                            <Link
                                                href={`/projects/${project.id}/invoice`}
                                                className="text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 border border-emerald-300/60 shrink-0 hover:bg-emerald-200"
                                            >
                                                LIHAT INVOICE
                                            </Link>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── ROW 3: WORKFLOW & SERVICES (BALANCED 2-COLUMN DASHBOARD) ─── */}
                    <div className="grid grid-cols-1 gap-5 items-stretch">
                        {/* ── LEFT COLUMN (Span 6): Layanan & Deliverables + Riwayat Transaksi ─ */}
                        <div className="xl:col-span-6 flex flex-col gap-5 min-w-0">
                            {/* Card 1: Layanan & Deliverables Paket */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-4 flex-1 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                                <PackageIcon className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-xs text-slate-900 truncate">
                                                    Layanan &amp; Deliverables Paket
                                                </h4>
                                                <span className="text-[10px] text-slate-400 block truncate">
                                                    Hasil &amp; produk akhir yang diserahkan ke klien
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                                            {project?.package?.name || 'Paket Standar'}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                        {/* Layanan Termasuk */}
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                                                Layanan Termasuk
                                            </span>
                                            {servicesList.length === 0 ? (
                                                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 text-center space-y-1">
                                                    <Camera className="w-5 h-5 text-slate-300 mx-auto" />
                                                    <p className="text-[11px] font-semibold text-slate-600">Dokumentasi Standar</p>
                                                    <p className="text-[10px] text-slate-400">Sesuai paket yang disepakati bersama klien</p>
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
                                                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 text-center space-y-1">
                                                    <HardDrive className="w-5 h-5 text-slate-300 mx-auto" />
                                                    <p className="text-[11px] font-semibold text-slate-600">File Foto &amp; Google Drive</p>
                                                    <p className="text-[10px] text-slate-400">Target penyerahan file via cloud link</p>
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

                                {addonsList.length > 0 && (
                                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                                        <span>Add-on Tambahan:</span>
                                        <span className="font-bold text-slate-800">{addonsList.length} Item Tambahan</span>
                                    </div>
                                )}
                            </div>

                            {/* Card 2: Termin Tagihan & Invoice Project */}
                            {canManageInvoices && projectInvoices.length > 0 && (
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-3">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xs text-slate-900">Termin &amp; Invoice Project</h3>
                                                <p className="text-[10px] text-slate-400">Rincian invoice per termin kontrak</p>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/projects/${project.id}/invoice`}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold shadow-2xs transition-all cursor-pointer"
                                        >
                                            <span>Buka Lembar Invoice</span>
                                            <ExternalLink className="w-3 h-3 text-slate-400" />
                                        </Link>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[580px] text-left text-xs">
                                            <thead>
                                                <tr className="text-[9.5px] uppercase font-bold text-slate-400 border-b border-slate-100">
                                                    <th className="py-2 px-2 whitespace-nowrap">INVOICE</th>
                                                    <th className="py-2 px-2 whitespace-nowrap">TERMIN / KETERANGAN</th>
                                                    <th className="py-2 px-2 text-right whitespace-nowrap">TOTAL</th>
                                                    <th className="py-2 px-2 text-right whitespace-nowrap">SISA</th>
                                                    <th className="py-2 px-2 text-center whitespace-nowrap">STATUS</th>
                                                    <th className="py-2 px-2 text-center whitespace-nowrap">AKSI</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                                {projectInvoices.map((inv: any) => (
                                                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                                                        <td className="py-2.5 px-2 whitespace-nowrap">
                                                            <Link
                                                                href={`/projects/${project.id}/invoice?invoice_id=${inv.id}`}
                                                                className="font-mono font-bold text-[11px] text-indigo-600 hover:underline inline-flex items-center gap-1"
                                                            >
                                                                <span>{inv.invoice_number}</span>
                                                                <ExternalLink className="w-2.5 h-2.5 text-indigo-400" />
                                                            </Link>
                                                        </td>
                                                        <td className="py-2.5 px-2 min-w-[150px] whitespace-normal break-words">
                                                            <span className="font-semibold text-slate-900 text-[11px] block">
                                                                {inv.notes || 'Termin'}
                                                            </span>
                                                            {inv.due_date && (
                                                                <span className="text-[9.5px] text-slate-400 block whitespace-nowrap">
                                                                    Jatuh tempo: {formatDateIndo(inv.due_date)}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900 text-[11px] whitespace-nowrap">
                                                            {formatRupiah(inv.total)}
                                                        </td>
                                                        <td className={`py-2.5 px-2 text-right font-mono font-bold text-[11px] whitespace-nowrap ${inv.remaining_amount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                                                            {formatRupiah(inv.remaining_amount)}
                                                        </td>
                                                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                                                            <Badge variant={inv.status_variant as any} className="text-[9.5px] font-bold">
                                                                {inv.status_label}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                {inv.remaining_amount > 0 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openPaymentModal(inv.remaining_amount, `Pembayaran ${inv.notes || inv.invoice_number}`, inv.id)}
                                                                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg shadow-2xs transition-all cursor-pointer inline-flex items-center gap-1 whitespace-nowrap"
                                                                        title="Konfirmasi Pembayaran Termin Ini"
                                                                    >
                                                                        <Wallet className="w-3 h-3" />
                                                                        <span>Konfirmasi Bayar</span>
                                                                    </button>
                                                                )}
                                                                <Link
                                                                    href={`/projects/${project.id}/invoice?invoice_id=${inv.id}`}
                                                                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-2xs transition-all"
                                                                    title="Buka Invoice Termin Ini"
                                                                >
                                                                    <Download className="w-3.5 h-3.5" />
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Card 3: Riwayat Transaksi Pembayaran */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-3 flex-1 flex flex-col justify-between">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Receipt className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xs text-slate-900">Riwayat Transaksi</h3>
                                            <p className="text-[10px] text-slate-400">Catatan pembayaran yang tervalidasi</p>
                                        </div>
                                    </div>
                                    {canManageInvoices && (
                                        <button
                                            type="button"
                                            onClick={() => openPaymentModal()}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                                        >
                                            <Plus className="w-3 h-3" />
                                            <span>Catat Pembayaran</span>
                                        </button>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[500px] text-left text-xs">
                                        <thead>
                                            <tr className="text-[9.5px] uppercase font-bold text-slate-400 border-b border-slate-100">
                                                <th className="py-2 px-2 whitespace-nowrap">TANGGAL</th>
                                                <th className="py-2 px-2 whitespace-nowrap">KETERANGAN</th>
                                                <th className="py-2 px-2 text-right whitespace-nowrap">JUMLAH</th>
                                                <th className="py-2 px-2 text-center whitespace-nowrap">STATUS</th>
                                                <th className="py-2 px-2 text-center whitespace-nowrap">BUKTI</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                            {project?.payments && project.payments.length > 0 ? (
                                                project.payments.map((pm: any, pIdx: number) => (
                                                    <tr key={pm.id || pIdx} className="hover:bg-slate-50/60 transition-colors">
                                                        <td className="py-2.5 px-2 font-mono text-[11px] whitespace-nowrap">{formatDate(pm.payment_date || pm.created_at)}</td>
                                                        <td className="py-2.5 px-2 font-medium text-slate-900 text-[11px] min-w-[140px] whitespace-normal break-words">{pm.notes || 'Pembayaran Project'}</td>
                                                        <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-600 text-[11px] whitespace-nowrap">
                                                            {formatRupiah(Number(pm.amount || 0))}
                                                        </td>
                                                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                BERHASIL
                                                            </span>
                                                        </td>
                                                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                                                            {pm.proof_file ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedProofUrl(pm.proof_file)}
                                                                    className="px-2 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] inline-flex items-center gap-1 transition-colors cursor-pointer border border-indigo-200 whitespace-nowrap"
                                                                    title="Lihat Bukti Transfer"
                                                                >
                                                                    <Eye className="w-3 h-3" />
                                                                    <span>Bukti</span>
                                                                </button>
                                                            ) : (
                                                                <span className="text-[10px] text-slate-300">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="py-6 text-center text-slate-400">
                                                        <CreditCard className="w-5 h-5 text-slate-300 mx-auto mb-1" />
                                                        <p className="font-semibold text-slate-600 text-[11px]">Belum ada riwayat transaksi</p>
                                                        <p className="text-[10px] text-slate-400">Klik &quot;Catat Pembayaran&quot; untuk input cicilan/DP</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* ── RIGHT COLUMN (Span 6): Alur Kerja & Tahapan Operasional Tim ─ */}
                        <div className="xl:col-span-6 flex flex-col min-w-0">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-4 flex-1 flex flex-col justify-between h-full">
                                <div className="space-y-3">
                                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                                <Layers className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-xs text-slate-900">
                                                    Alur Kerja &amp; Tahapan Operasional Tim
                                                </h4>
                                                <span className="text-[10px] text-slate-400">
                                                    Tahap {currentStepIndex} dari {activeWorkflow.steps_count}: {project?.workflow_step || 'Booking'} ({project?.progress || 0}%)
                                                </span>
                                            </div>
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

                                    {/* Workflow Progress Bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="font-bold text-slate-600">Progress Pengerjaan</span>
                                            <span className="font-bold text-indigo-600 font-mono">{project?.progress || 0}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-[#3B46F1] h-full rounded-full transition-all duration-500"
                                                style={{ width: `${project?.progress || 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Steps List */}
                                    <div className="space-y-2 text-xs pt-1">
                                        {timelineSteps.map((step) => (
                                            <div
                                                key={step.id}
                                                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${step.done
                                                    ? 'bg-emerald-50/40 border-emerald-100'
                                                    : step.current
                                                        ? 'bg-indigo-50/60 border-indigo-200 ring-1 ring-indigo-200/80 shadow-2xs'
                                                        : 'bg-white border-slate-100'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div
                                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${step.done
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
                                                            <p className="text-[10.5px] text-slate-500 break-words whitespace-normal leading-snug mt-0.5">
                                                                {step.activity}
                                                            </p>
                                                        )}
                                                        {/* Tautan Berkas Ringkas */}
                                                        {step.files && step.files.length > 0 && (
                                                            <div className="pt-1.5 flex flex-wrap items-center gap-1.5">
                                                                {step.files.map((file: any) => {
                                                                    const cleanName = file.name ? file.name.replace(/^\[Tahap:[^\]]+\]\s*/i, '') : 'Hasil Pengerjaan';
                                                                    return (
                                                                        <a
                                                                            key={file.id}
                                                                            href={file.drive_url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/80 text-[10px] font-semibold transition-all group"
                                                                            title={`Buka tautan Google Drive: ${cleanName}`}
                                                                        >
                                                                            <HardDrive className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
                                                                            <span className="truncate max-w-[130px] sm:max-w-[180px]">{cleanName}</span>
                                                                            <ExternalLink className="w-2.5 h-2.5 text-indigo-500 group-hover:text-indigo-700 shrink-0" />
                                                                        </a>
                                                                    );
                                                                })}
                                                            </div>
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
                                                            onClick={() => {
                                                                const nextStep = activeWorkflow.steps[step.id];
                                                                openCompleteStepModal(step, nextStep, step.id + 1);
                                                            }}
                                                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                                                        >
                                                            <Check className="w-3 h-3" />
                                                            <span>Selesaikan Tahap</span>
                                                        </button>
                                                    )}
                                                    {step.done && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setRevertModal({ isOpen: true, stepToRevert: step, isSubmitting: false })}
                                                            className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-semibold border border-rose-200 transition-all cursor-pointer flex items-center gap-1"
                                                            title="Kembalikan status project ke tahap ini"
                                                        >
                                                            <RotateCcw className="w-2.5 h-2.5" />
                                                            <span>Kembalikan Status</span>
                                                        </button>
                                                    )}
                                                    {!step.done && !step.current && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateWorkflowStep(step.id)}
                                                            className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg text-[10px] font-semibold border border-slate-200 transition-all cursor-pointer"
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
                                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${step.done
                                    ? 'bg-emerald-50/40 border-emerald-200'
                                    : step.current
                                        ? 'bg-indigo-50/60 border-indigo-300 shadow-xs ring-1 ring-indigo-200'
                                        : 'bg-white border-slate-200/80'
                                    }`}
                            >
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step.done
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

                                        {/* Tautan Berkas / File Hasil Tahap */}
                                        {step.files && step.files.length > 0 && (
                                            <div className="pt-2 flex flex-wrap items-center gap-2">
                                                <span className="text-[10.5px] font-semibold text-slate-500 flex items-center gap-1 shrink-0">
                                                    <Folder className="w-3 h-3 text-indigo-500" />
                                                    Tautan Hasil:
                                                </span>
                                                {step.files.map((file: any) => {
                                                    const cleanName = file.name ? file.name.replace(/^\[Tahap:[^\]]+\]\s*/i, '') : 'Hasil Pengerjaan';
                                                    return (
                                                        <div
                                                            key={file.id}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/90 hover:bg-indigo-100 text-indigo-950 border border-indigo-200/90 text-xs font-medium transition-all shadow-2xs group"
                                                        >
                                                            {/* Google Drive Triangle Icon */}
                                                            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
                                                                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
                                                                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 10.15z" fill="#ea4335" />
                                                                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
                                                                <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
                                                                <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
                                                            </svg>
                                                            <span className="font-semibold text-[11px] truncate max-w-[200px] sm:max-w-[260px]" title={cleanName}>
                                                                {cleanName}
                                                            </span>
                                                            <a
                                                                href={file.drive_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 text-[11px] text-[#3B46F1] hover:text-[#323BD8] font-bold ml-1 hover:underline cursor-pointer"
                                                                title="Buka di Google Drive"
                                                            >
                                                                <span>Buka</span>
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(file.drive_url);
                                                                    toast.success('Link Google Drive berhasil disalin!');
                                                                }}
                                                                className="p-0.5 text-slate-400 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                                                                title="Salin Link URL"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setLinkModalInitialData({
                                                            name: `[Tahap: ${step.name}] Hasil ${step.name}`,
                                                            drive_url: '',
                                                        });
                                                        setIsLinkModalOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-slate-500 hover:text-indigo-600 px-1.5 py-0.5 rounded hover:bg-indigo-50 transition-colors cursor-pointer"
                                                    title="Tambah link berkas tambahan untuk tahap ini"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    <span>Tambah Link</span>
                                                </button>
                                            </div>
                                        )}
                                        {(!step.files || step.files.length === 0) && (step.done || step.current) && (
                                            <div className="pt-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setLinkModalInitialData({
                                                            name: `[Tahap: ${step.name}] Hasil ${step.name}`,
                                                            drive_url: '',
                                                        });
                                                        setIsLinkModalOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    <span>Tautkan File / GDrive Tahap Ini</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 self-start sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-between sm:justify-end">
                                    <span className={`text-xs font-bold shrink-0 ${step.statusColor}`}>{step.status}</span>
                                    {step.current && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const nextStep = activeWorkflow.steps[step.id];
                                                openCompleteStepModal(step, nextStep, step.id + 1);
                                            }}
                                            className="px-3 py-1.5 bg-[#3B46F1] hover:bg-[#323BD8] text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                                        >
                                            <span>Selesaikan &amp; Lanjut</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    {step.done && (
                                        <button
                                            type="button"
                                            onClick={() => setRevertModal({ isOpen: true, stepToRevert: step, isSubmitting: false })}
                                            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                                            title="Kembalikan status project ke tahap ini dan hapus link file terkait jika ada"
                                        >
                                            <RotateCcw className="w-3 h-3" />
                                            <span>Kembalikan Status</span>
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

                    {(() => {
                        const projectFiles = (project?.file_links && project.file_links.length > 0)
                            ? project.file_links
                            : (project?.fileLinks || []);

                        if (projectFiles.length === 0) {
                            return (
                                <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center py-10 space-y-2">
                                    <Folder className="w-10 h-10 text-slate-400 mx-auto" />
                                    <p className="text-xs font-bold text-slate-700">Belum ada link Google Drive yang disematkan</p>
                                    <p className="text-[11px] text-slate-400">Klik tombol di atas atau selesaikan tahapan alur kerja untuk menambahkan tautan berkas dokumentasi.</p>
                                </div>
                            );
                        }

                        return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projectFiles.map((link: any, lIdx: number) => {
                                    const hasStepTag = link.name?.match(/^\[Tahap:\s*([^\]]+)\]/i);
                                    const stepName = hasStepTag ? hasStepTag[1] : null;
                                    const displayName = link.name ? link.name.replace(/^\[Tahap:[^\]]+\]\s*/i, '') : 'Berkas Dokumentasi';

                                    return (
                                        <div key={link.id || lIdx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-300 hover:shadow-xs transition-all space-y-2.5 flex flex-col justify-between">
                                            <div className="space-y-1.5">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-xs text-slate-900 line-clamp-1" title={link.name}>
                                                            {displayName}
                                                        </h4>
                                                        {stepName && (
                                                            <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                                Tahap: {stepName}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                                                        <Folder className="w-3.5 h-3.5 text-[#3B46F1]" />
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-slate-400 font-mono truncate bg-white px-2 py-1 rounded border border-slate-100" title={link.drive_url}>
                                                    {link.drive_url}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                                <a
                                                    href={link.drive_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3B46F1] hover:text-[#323BD8] hover:underline"
                                                >
                                                    <span>Buka di Google Drive</span>
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(link.drive_url);
                                                        toast.success('Link berhasil disalin ke clipboard!');
                                                    }}
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                                    title="Salin tautan"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                    <span>Salin</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* ── TAB: CATATAN VIEW ────────────────────────────────────────────── */}
            {activeTab === 'catatan' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0">
                                    <StickyNote className="w-4.5 h-4.5" />
                                </div>
                                <h2 className="text-base font-bold text-slate-900">Catatan Khusus &amp; Brief Project</h2>
                                {project?.notes && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                                        Aktif
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Instruksi internal kru, preferensi brief acara, dan catatan referensi teknis klien.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                            {project?.notes && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditAllNotesContent(project.notes || '');
                                        setIsEditAllNotesOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 transition-colors cursor-pointer"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>Edit Seluruh Catatan</span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsNoteModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B46F1] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#323BD8] transition-all cursor-pointer shadow-indigo-500/10"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Catatan Baru</span>
                            </button>
                        </div>
                    </div>

                    {/* Notes List / Timeline */}
                    {(() => {
                        const raw = project?.notes || '';
                        if (!raw.trim()) {
                            return (
                                <div className="p-8 rounded-2xl border border-dashed border-slate-300/90 text-center py-12 space-y-3 bg-slate-50/50">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-2xs">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-slate-800">Belum Ada Catatan Khusus</h4>
                                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                                            Tambahkan memo briefing, arahan lokasi, instruksi tim fotografer/editor, atau kesepakatan khusus klien agar pengerjaan proyek terdokumentasi rapi.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsNoteModalOpen(true)}
                                        className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-[#3B46F1] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-[#323BD8] transition-all cursor-pointer mt-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Tambah Catatan Pertama</span>
                                    </button>
                                </div>
                            );
                        }

                        // Parse entries formatted as: --- [timestamp] title (Oleh: author) --- \n content
                        const pattern = /---\s*\[(.*?)\]\s*(.*?)\s*\(Oleh:\s*(.*?)\)\s*---\n?(.*?)(?=(?:---\s*\[|$))/gs;
                        const matches = [...raw.matchAll(pattern)];

                        const entries: Array<{
                            id: string;
                            index: number;
                            title: string;
                            content: string;
                            author?: string;
                            timestamp?: string;
                            isInitial?: boolean;
                        }> = [];

                        const firstDelim = raw.indexOf('--- [');
                        const hasInitial = firstDelim > 0 && Boolean(raw.substring(0, firstDelim).trim());

                        if (matches.length > 0) {
                            if (hasInitial) {
                                entries.push({
                                    id: 'note-initial',
                                    index: 0,
                                    title: 'Briefing & Catatan Awal Project',
                                    content: raw.substring(0, firstDelim).trim(),
                                    author: project?.client?.name || 'Input Awal',
                                    timestamp: formatDateIndo(project?.created_at),
                                    isInitial: true,
                                });
                            }

                            matches.forEach((m, idx) => {
                                entries.push({
                                    id: `note-${idx + 1}`,
                                    index: hasInitial ? idx + 1 : idx,
                                    timestamp: m[1]?.trim() || '',
                                    title: m[2]?.trim() || 'Catatan Project',
                                    author: m[3]?.trim() || 'Tim Operasional',
                                    content: m[4]?.trim() || '',
                                    isInitial: false,
                                });
                            });
                        } else {
                            entries.push({
                                id: 'note-initial',
                                index: 0,
                                title: 'Catatan & Preferensi Brief Project',
                                content: raw.trim(),
                                author: project?.client?.name || 'Tim Project',
                                timestamp: formatDateIndo(project?.updated_at || project?.created_at),
                                isInitial: true,
                            });
                        }

                        return (
                            <div className="space-y-3.5">
                                {entries.map((note) => (
                                    <div
                                        key={note.id}
                                        className={`rounded-2xl border p-4.5 sm:p-5 transition-all space-y-3 shadow-2xs hover:shadow-xs group/card ${note.isInitial
                                            ? 'bg-amber-50/50 border-amber-200/80'
                                            : 'bg-white border-slate-200/90'
                                            }`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100/90 pb-2.5">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${note.isInitial
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-indigo-100 text-indigo-700'
                                                        }`}
                                                >
                                                    {note.isInitial ? (
                                                        <StickyNote className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <FileText className="w-3.5 h-3.5" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                                        {note.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-[10.5px] text-slate-500 mt-0.5 flex-wrap">
                                                        <span className="font-semibold text-slate-700">
                                                            {note.author}
                                                        </span>
                                                        {note.timestamp && (
                                                            <>
                                                                <span className="text-slate-300">•</span>
                                                                <span className="flex items-center gap-1 font-mono text-slate-400">
                                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                                    {note.timestamp}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions & Badge */}
                                            <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0 pt-1 sm:pt-0">
                                                {note.isInitial && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200/80">
                                                        Briefing Utama
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => openEditNoteModal(note.index, note.title, note.content)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-[#3B46F1] bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/70 hover:border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                                                    title="Edit catatan ini"
                                                >
                                                    <Edit3 className="w-3 h-3 text-slate-400" />
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteNoteEntry(note.index, note.title)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50/70 border border-slate-200/70 hover:border-rose-200 transition-colors cursor-pointer shadow-2xs"
                                                    title="Hapus catatan ini"
                                                >
                                                    <Trash2 className="w-3 h-3 text-slate-400" />
                                                    <span>Hapus</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line break-words pl-0.5 font-normal">
                                            {note.content}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
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
                            onClick={() => setIsHighlightModalOpen(true)}
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
                                onClick={() => setIsHighlightModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B46F1] text-white rounded-xl text-xs font-bold hover:bg-[#323BD8] cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Unggah Foto Pertama</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── SLIDE PROJECT TAB ─────────────────────────────────────────────── */}
            {activeTab === 'slide' && (
                <div className="space-y-6">
                    {/* Header Bar */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                    <Layers className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <span>Slide Banner Promo &amp; Sambutan Project</span>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                                            {project?.promo_slides?.length || 0} Slide
                                        </span>
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Slide khusus project ini akan otomatis digabungkan dan diprioritaskan di Hero Banner Portal Klien (/client/dashboard).
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <a
                                href={project?.id ? `/client/projects/${project.id}` : '/client/projects'}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                title="Lihat tampilan detail project di Portal Klien"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Buka Portal Klien</span>
                            </a>
                            <button
                                type="button"
                                onClick={openCreateSlideModal}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B46F1] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#323BD8] transition-colors cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Slide Baru</span>
                            </button>
                        </div>
                    </div>

                    {/* LIVE HERO BANNER SIMULATION PREVIEW */}
                    {(() => {
                        const slidesList = project?.promo_slides || [];
                        const activeSlide = slidesList.length > 0
                            ? slidesList[slidePreviewIndex % slidesList.length]
                            : {
                                title: `Eksklusif: ${project?.name || 'Dokumentasi Project'}`,
                                tag: 'EXCLUSIVE PROJECT',
                                description: 'Momen berharga dan karya visual eksklusif Anda telah siap. Klik tombol di bawah untuk meninjau dokumentasi lengkap.',
                                button_text: 'Lihat Detail Project',
                                button_url: `/client/projects/${project?.id || ''}`,
                                image: project?.thumbnail || '/images/wedding-couple.jpg',
                                is_active: true,
                            };

                        return (
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                            Simulasi Live: Tampilan Hero Banner Portal Klien
                                        </h3>
                                    </div>
                                    {slidesList.length > 1 && (
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => setSlidePreviewIndex((prev) => (prev === 0 ? slidesList.length - 1 : prev - 1))}
                                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                                                title="Slide sebelumnya"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                            <span className="text-[11px] font-bold text-slate-500 font-mono">
                                                {(slidePreviewIndex % slidesList.length) + 1} / {slidesList.length}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setSlidePreviewIndex((prev) => (prev + 1) % slidesList.length)}
                                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                                                title="Slide berikutnya"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Banner Stage */}
                                <div className="relative rounded-xl overflow-hidden min-h-[220px] sm:min-h-[280px] flex items-center bg-slate-950 border border-slate-800 shadow-inner group">
                                    <img
                                        src={activeSlide.image || project?.thumbnail || '/images/wedding-couple.jpg'}
                                        alt={activeSlide.title}
                                        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-90 contrast-[1.05]"
                                    />
                                    {/* Gradient Overlay mirroring Client Portal */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-transparent sm:w-2/3" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                                    {/* Live Content */}
                                    <div className="relative z-10 px-6 sm:px-10 py-6 max-w-xl space-y-2.5 drop-shadow-md">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-xs">
                                                {activeSlide.tag || 'EXCLUSIVE PROJECT'}
                                            </span>
                                            {activeSlide.is_active ? (
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                    ● Aktif di Portal
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                                    ● Nonaktif
                                                </span>
                                            )}
                                        </div>

                                        <h2 className="text-lg sm:text-2xl font-serif font-black text-white tracking-tight leading-tight">
                                            {activeSlide.title}
                                        </h2>

                                        <p className="text-xs text-slate-200/90 leading-relaxed line-clamp-2">
                                            {activeSlide.description || 'Tidak ada deskripsi tambahan untuk slide ini.'}
                                        </p>

                                        <div className="pt-2 flex items-center gap-3">
                                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-950 shadow-md">
                                                <span>{activeSlide.button_text || 'Lihat Detail'}</span>
                                                <ArrowRight className="w-3.5 h-3.5 text-slate-700" />
                                            </span>
                                            <span className="text-[11px] text-slate-400 truncate max-w-xs font-mono">
                                                Target: {activeSlide.button_url || `/client/projects/${project?.id}`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Project watermark */}
                                    <div className="absolute bottom-3 right-4 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-xs text-[10px] text-slate-300 border border-white/10 font-mono">
                                        <span>Project #{project?.project_number || project?.id?.substring(0, 8)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* SLIDES CARD GRID */}
                    {project?.promo_slides && project.promo_slides.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                    Daftar Slide Project Ini ({project.promo_slides.length})
                                </h3>
                                <span className="text-xs text-slate-400">
                                    Diurutkan berdasarkan kolom Urutan (Sort Order)
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {project.promo_slides.map((slide: any, idx: number) => (
                                    <div
                                        key={slide.id}
                                        className={`bg-white rounded-2xl border overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${slide.is_active ? 'border-slate-200/80' : 'border-slate-200 opacity-60'
                                            }`}
                                    >
                                        <div className="space-y-3">
                                            {/* Thumbnail & Badges */}
                                            <div className="aspect-[16/9] bg-slate-900 relative overflow-hidden group">
                                                <img
                                                    src={slide.image || '/images/wedding-couple.jpg'}
                                                    alt={slide.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                                <div className="absolute top-2.5 left-2.5">
                                                    <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-xs">
                                                        {slide.tag || 'EXCLUSIVE PROJECT'}
                                                    </span>
                                                </div>
                                                <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${slide.is_active
                                                            ? 'bg-emerald-500 text-white'
                                                            : 'bg-slate-500 text-white'
                                                            }`}
                                                    >
                                                        {slide.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </div>
                                                <div className="absolute bottom-2.5 left-3 right-3">
                                                    <p className="text-white text-xs font-bold truncate">
                                                        {slide.title}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Body info */}
                                            <div className="p-4 pt-1 space-y-2">
                                                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                                    {slide.description || 'Tidak ada deskripsi tambahan.'}
                                                </p>

                                                <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-500">
                                                    <div className="flex items-center justify-between">
                                                        <span>Tombol: <strong>{slide.button_text}</strong></span>
                                                        <span className="font-mono">Urutan #{slide.sort_order}</span>
                                                    </div>
                                                    <div className="truncate text-slate-400 font-mono text-[10px]">
                                                        URL: {slide.button_url}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Footer */}
                                        <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleSlideActive(slide)}
                                                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${slide.is_active
                                                        ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                                                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                                        }`}
                                                >
                                                    {slide.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                    <span>{slide.is_active ? 'Nonaktifkan' : 'Aktifkan'}</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setSlidePreviewIndex(idx)}
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                                                    title="Lihat slide ini pada simulasi di atas"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Pratinjau</span>
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditSlideModal(slide)}
                                                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                                                    title="Edit Slide Banner"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteSlide(slide)}
                                                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                    title="Hapus Slide Banner"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                                <Layers className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-sm text-slate-800">Belum Ada Slide Khusus Project Ini</h3>
                            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                                Tambahkan slide banner khusus untuk project ini. Saat klien membuka Dashboard Portal Klien (/client/dashboard), slide ini akan langsung tampil di Hero Banner carousel utama bersama slide umum studio.
                            </p>
                            <button
                                type="button"
                                onClick={openCreateSlideModal}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B46F1] text-white rounded-xl text-xs font-bold hover:bg-[#323BD8] transition-colors cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Buat Slide Pertama Project Ini</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* ── MODALS (STRUCTURED & REUSABLE) ─────────────────────────────────── */}
            <RecordPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false);
                    setPaymentModalData({});
                }}
                project={project}
                paymentMethods={payment_methods}
                initialAmount={paymentModalData.amount}
                initialNotes={paymentModalData.notes}
                invoiceId={paymentModalData.invoiceId}
            />

            <ProofViewerModal
                isOpen={Boolean(selectedProofUrl)}
                proofUrl={selectedProofUrl}
                onClose={() => setSelectedProofUrl(null)}
            />

            <AddDriveLinkModal
                isOpen={isLinkModalOpen}
                onClose={() => setIsLinkModalOpen(false)}
                projectId={project?.id}
                initialData={linkModalInitialData}
            />

            <AddNoteModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                projectId={project?.id}
            />

            <EditNoteModal
                isOpen={editingNoteData.isOpen}
                onClose={() => setEditingNoteData((prev) => ({ ...prev, isOpen: false }))}
                projectId={project?.id}
                noteIndex={editingNoteData.index}
                initialTitle={editingNoteData.title}
                initialContent={editingNoteData.content}
            />

            {/* Modal: Edit Seluruh Catatan Project */}
            <Modal
                isOpen={isEditAllNotesOpen}
                onClose={() => !isUpdatingNotes && setIsEditAllNotesOpen(false)}
                title="Edit Seluruh Catatan Project"
                maxWidth="lg"
            >
                <form onSubmit={handleUpdateAllNotes} className="space-y-4 pt-1 text-xs">
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Anda dapat mengoreksi, merapikan, atau menghapus catatan project secara langsung di bawah ini.
                    </p>
                    <textarea
                        value={editAllNotesContent}
                        onChange={(e) => setEditAllNotesContent(e.target.value)}
                        rows={10}
                        maxLength={10000}
                        className="w-full p-3.5 rounded-2xl border border-slate-200 focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20 outline-hidden font-mono text-xs leading-relaxed text-slate-800 bg-white"
                        placeholder="Tuliskan catatan lengkap..."
                    />
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsEditAllNotesOpen(false)}
                            disabled={isUpdatingNotes}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdatingNotes}
                            className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl font-bold transition-all cursor-pointer shadow-sm shadow-indigo-500/20 disabled:opacity-50"
                        >
                            {isUpdatingNotes ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Simpan Perubahan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            <AddHighlightModal
                isOpen={isHighlightModalOpen}
                onClose={() => setIsHighlightModalOpen(false)}
                projectId={project?.id}
            />

            <ProjectSlideModal
                isOpen={isSlideModalOpen}
                onClose={() => setIsSlideModalOpen(false)}
                projectId={project?.id}
                projectName={project?.name}
                editingSlide={editingSlide}
            />

            {/* Modal: Selesaikan & Lanjut Tahap Workflow + Shortcut GDrive Link */}
            <Modal
                isOpen={workflowModal.isOpen}
                onClose={() => !workflowModal.isSubmitting && setWorkflowModal((prev) => ({ ...prev, isOpen: false }))}
                title="Selesaikan & Lanjut Tahap"
                maxWidth="md"
            >
                <div className="space-y-4 pt-1">
                    {/* Header info */}
                    <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#3B46F1] text-white flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-bold text-indigo-900">
                                Selesaikan Tahap: <span className="text-[#3B46F1]">{workflowModal.stepToComplete?.name}</span>
                            </div>
                            {workflowModal.nextStep ? (
                                <div className="text-[11px] text-indigo-700 mt-0.5 flex items-center gap-1">
                                    <span>Lanjut ke:</span>
                                    <span className="font-semibold">{workflowModal.nextStep.name}</span>
                                </div>
                            ) : (
                                <div className="text-[11px] text-emerald-700 mt-0.5 font-semibold">
                                    Ini adalah tahap terakhir — status project akan diselesaikan (100%).
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shortcut Link GDrive / Hasil */}
                    <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Tambah Link Hasil / GDrive</span>
                            </label>
                            <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                Opsional
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Shortcut untuk langsung menambahkan link hasil pengerjaan (Google Drive / Dropbox). Link ini akan otomatis tersimpan di tab Dokumen &amp; File. Jika suatu saat tahap ini dikembalikan statusnya, tautan ini akan otomatis dihapus.
                        </p>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-700 block">Nama / Keterangan File</label>
                            <input
                                type="text"
                                value={workflowModal.linkName}
                                onChange={(e) => setWorkflowModal((prev) => ({ ...prev, linkName: e.target.value }))}
                                placeholder="Contoh: Hasil Foto Editing Full"
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-700 block">URL Google Drive / Cloud Link</label>
                            <input
                                type="url"
                                value={workflowModal.driveUrl}
                                onChange={(e) => setWorkflowModal((prev) => ({ ...prev, driveUrl: e.target.value }))}
                                placeholder="https://drive.google.com/drive/folders/..."
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-700 block">Tipe File</label>
                            <select
                                value={workflowModal.fileType}
                                onChange={(e) => setWorkflowModal((prev) => ({ ...prev, fileType: e.target.value }))}
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                            >
                                <option value="gdrive">Google Drive</option>
                                <option value="dropbox">Dropbox</option>
                                <option value="cloud">Cloud Storage Lainnya</option>
                                <option value="zip">Arsip / ZIP</option>
                                <option value="preview">Preview / Web Gallery</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                            type="button"
                            disabled={workflowModal.isSubmitting}
                            onClick={() => setWorkflowModal((prev) => ({ ...prev, isOpen: false }))}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            disabled={workflowModal.isSubmitting}
                            onClick={handleConfirmCompleteStep}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#3B46F1] hover:bg-[#323BD8] disabled:opacity-50 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                        >
                            {workflowModal.isSubmitting ? (
                                <span>Menyimpan...</span>
                            ) : (
                                <>
                                    <span>{workflowModal.driveUrl.trim() ? 'Simpan Link & Lanjut' : 'Selesaikan & Lanjut'}</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal Konfirmasi Kembalikan Status */}
            <AlertConfirmation
                isOpen={revertModal.isOpen}
                onClose={() => !revertModal.isSubmitting && setRevertModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirmRevertStep}
                title="Kembalikan Status Alur Kerja?"
                description={`Anda akan mengembalikan status alur kerja ke tahap "${revertModal.stepToRevert?.name}". Progres pengerjaan akan disesuaikan kembali dan tautan link hasil pengerjaan pada tahap ini/setelahnya akan otomatis dihapus.`}
                confirmText={revertModal.isSubmitting ? 'Memproses...' : 'Ya, Kembalikan Status'}
                variant="danger"
            />

            {/* Modal Konfirmasi Batalkan Project */}
            {!isSupervisor && (
                <AlertConfirmation
                    isOpen={confirmCancelProject}
                    onClose={() => !isCancellingProject && setConfirmCancelProject(false)}
                    onConfirm={handleCancelProject}
                    title="Batalkan Project?"
                    description={`Apakah Anda yakin ingin membatalkan project "${project?.name}"? Status project akan diubah menjadi dibatalkan, namun seluruh data tersimpan aman dan project dapat diaktifkan kembali sewaktu-waktu.`}
                    confirmText={isCancellingProject ? 'Membatalkan...' : 'Ya, Batalkan Project'}
                    variant="warning"
                />
            )}

            {/* Modal Konfirmasi Aktifkan Kembali Project */}
            {!isSupervisor && (
                <AlertConfirmation
                    isOpen={confirmRestoreProject}
                    onClose={() => !isRestoringProject && setConfirmRestoreProject(false)}
                    onConfirm={handleRestoreProject}
                    title="Aktifkan Kembali Project?"
                    description={`Project "${project?.name}" akan diaktifkan kembali ke alur kerja aktif (${project?.progress && project.progress > 0 ? 'Dalam Proses' : 'Draft'}). Apakah Anda ingin melanjutkan?`}
                    confirmText={isRestoringProject ? 'Mengaktifkan...' : 'Ya, Aktifkan Project'}
                    variant="success"
                />
            )}

            {/* Modal Konfirmasi Hapus Project */}
            {!isSupervisor && (
                <AlertConfirmation
                    isOpen={confirmDeleteProject}
                    onClose={() => !isDeletingProject && setConfirmDeleteProject(false)}
                    onConfirm={handleDeleteProject}
                    title="Hapus Project?"
                    description={`Apakah Anda yakin ingin menghapus project "${project?.name}"? Data project yang dihapus dapat dipulihkan dari tempat sampah.`}
                    confirmText={isDeletingProject ? 'Menghapus...' : 'Ya, Hapus Project'}
                    variant="danger"
                />
            )}
        </div>
    );
}
