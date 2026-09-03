import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Plus,
    ChevronDown,
    MoreVertical,
    Edit2,
    Trash2,
    Info,
    Check,
    ArrowLeft,
    Power,
    X,
    FolderKanban,
    Folder,
    Box,
    Calendar,
    Sparkles,
    Layers,
    FileText,
    Camera,
    Video,
    Film,
    Gift,
    Clock,
    UserCheck,
    CheckCircle2,
    Palette,
    CheckSquare,
    ExternalLink,
    PackagePlus,
    Loader2,
    Tag,
    Coins,
} from 'lucide-react';
import { ALL_WORKFLOWS, resolveWorkflow } from '@/lib/workflows';
import { formatRupiah } from '@/lib/formatters';

export interface CategoryProjectItem {
    id: number | string;
    name: string;
    packages_count: string | number;
    workflow_id: number;
    workflow_name: string;
    workflow_type?: string;
    color: string;
    status?: string;
}

export interface DeliverableItem {
    id: number | string;
    name: string;
    type: 'Photo' | 'Video' | 'Album' | 'Special';
    type_class?: string;
    description: string;
    deadline: string;
    required: boolean;
    by_owner: boolean;
    [key: string]: any;
}

export interface DbPackage {
    id: string;
    name: string;
    category_id: string;
    status: string;
    base_price: number;
    description?: string;
    duration_hours?: number;
    included_services?: string[];
    included_deliverables?: DeliverableItem[];
    category?: {
        id: string;
        name: string;
        workflow_type: string;
        color?: string;
    };
}

export interface WorkflowStepItem {
    id: number;
    num: number;
    name: string;
    phase: string;
    duration: string; // Target Deadline / Durasi
    activity: string;
    [key: string]: any;
}

export interface WorkflowItem {
    id: number;
    name: string;
    type_key: 'wedding' | 'non_wedding' | 'custom';
    description: string;
    steps_count: number;
    status: 'Aktif' | 'Nonaktif';
    steps: WorkflowStepItem[];
}

interface WorkflowProps {
    categories?: any[];
    packages?: DbPackage[];
    workflows?: any[];
    filters?: any;
}

export default function WorkflowIndex({
    categories: initialCategories = [],
    packages: initialPackages = [],
    workflows: initialWorkflows = [],
    filters = {},
}: WorkflowProps) {
    // ── 1. MASTER WORKFLOW DEFINITIONS (From database with default fallback) ──
    const [workflows, setWorkflows] = useState<WorkflowItem[]>(() => {
        const source = (initialWorkflows && initialWorkflows.length > 0) ? initialWorkflows : ALL_WORKFLOWS;
        return source.map((wf: any) => ({
            id: wf.id,
            name: wf.name,
            type_key: wf.type || wf.type_key || 'custom',
            description: wf.description || '',
            steps_count: wf.steps?.length || wf.steps_count || 5,
            status: (wf.status || 'Aktif') as 'Aktif' | 'Nonaktif',
            steps: (wf.steps || []).map((s: any, idx: number) => ({
                id: s.id || idx + 1,
                num: s.num || idx + 1,
                name: s.name || s.title || `Tahap ${idx + 1}`,
                phase: s.phase || 'Operasional',
                duration: s.duration || s.dl || s.dur || 'H+14',
                activity: s.activity || s.description || '',
            })),
        }));
    });

    useEffect(() => {
        if (initialWorkflows && initialWorkflows.length > 0) {
            setWorkflows(
                initialWorkflows.map((wf: any) => ({
                    id: wf.id,
                    name: wf.name,
                    type_key: wf.type || wf.type_key || 'custom',
                    description: wf.description || '',
                    steps_count: wf.steps?.length || wf.steps_count || 5,
                    status: (wf.status || 'Aktif') as 'Aktif' | 'Nonaktif',
                    steps: (wf.steps || []).map((s: any, idx: number) => ({
                        id: s.id || idx + 1,
                        num: s.num || idx + 1,
                        name: s.name || s.title || `Tahap ${idx + 1}`,
                        phase: s.phase || 'Operasional',
                        duration: s.duration || s.dl || s.dur || 'H+14',
                        activity: s.activity || s.description || '',
                    })),
                }))
            );
        }
    }, [initialWorkflows]);

    const [selectedWorkflowId, setSelectedWorkflowId] = useState<number>(1);
    const activeWorkflow = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];

    // ── 2. CATEGORIES FROM DATABASE ──────────────────────────────────────────
    const dbCategoryItems: CategoryProjectItem[] = useMemo(() => {
        if (initialCategories && initialCategories.length > 0) {
            return initialCategories.map((cat: any) => {
                const wf = resolveWorkflow(cat);
                const pkgCount = typeof cat.packages_count === 'number'
                    ? (cat.packages_count > 0 ? `${cat.packages_count} Paket` : '-')
                    : (cat.packages_count || '-');

                let colorClass = 'bg-purple-100 text-purple-700';
                const lowerName = (cat.name || '').toLowerCase();
                const wfType = cat.workflow_type || wf.type;

                if (wfType === 'non_wedding') {
                    if (lowerName.includes('event') || lowerName.includes('gathering')) colorClass = 'bg-orange-100 text-orange-700';
                    else if (lowerName.includes('photo')) colorClass = 'bg-sky-100 text-sky-700';
                    else if (lowerName.includes('video')) colorClass = 'bg-cyan-100 text-cyan-700';
                    else if (lowerName.includes('commercial') || lowerName.includes('brand') || lowerName.includes('produk')) colorClass = 'bg-blue-100 text-blue-700';
                    else if (lowerName.includes('corporate') || lowerName.includes('perusahaan')) colorClass = 'bg-emerald-100 text-emerald-700';
                    else if (lowerName.includes('birthday') || lowerName.includes('ulang')) colorClass = 'bg-pink-100 text-pink-700';
                    else if (lowerName.includes('newborn') || lowerName.includes('bayi')) colorClass = 'bg-rose-100 text-rose-700';
                    else if (lowerName.includes('maternity') || lowerName.includes('hamil')) colorClass = 'bg-purple-100 text-purple-700';
                    else colorClass = 'bg-emerald-100 text-emerald-700';
                } else if (wfType === 'custom') {
                    colorClass = 'bg-amber-100 text-amber-700';
                }

                let mappedWfId = 2;
                if (wfType === 'wedding') mappedWfId = 1;
                else if (wfType === 'custom') mappedWfId = 3;

                return {
                    id: cat.id,
                    name: cat.name,
                    packages_count: pkgCount,
                    workflow_id: mappedWfId,
                    workflow_name: mappedWfId === 1 ? 'Workflow Wedding (8 Tahap)' : (mappedWfId === 3 ? 'Workflow Custom (6 Tahap)' : 'Workflow Non-Wedding (5 Tahap)'),
                    workflow_type: wfType,
                    color: colorClass,
                    status: cat.status === 'inactive' ? 'Nonaktif' : 'Aktif',
                };
            });
        }
        return [];
    }, [initialCategories]);

    // ── 3. DYNAMIC PACKAGES PER ACTIVE WORKFLOW ──────────────────────────────
    const activePackages = useMemo(() => {
        if (!initialPackages || initialPackages.length === 0) return [];
        
        if (selectedWorkflowId === 1) {
            // Wedding
            return initialPackages.filter((p: DbPackage) => {
                const wfType = p.category?.workflow_type;
                const nameLower = (p.name || '').toLowerCase();
                const catLower = (p.category?.name || '').toLowerCase();
                return wfType === 'wedding' || nameLower.includes('wedding') || catLower.includes('wedding');
            });
        }
        if (selectedWorkflowId === 3) {
            // Custom / Bundling
            return initialPackages.filter((p: DbPackage) => {
                const wfType = p.category?.workflow_type;
                const nameLower = (p.name || '').toLowerCase();
                const catLower = (p.category?.name || '').toLowerCase();
                return wfType === 'custom' || nameLower.includes('everlasting') || nameLower.includes('bundling') || catLower.includes('lainnya') || catLower.includes('custom');
            });
        }
        // Non-Wedding
        return initialPackages.filter((p: DbPackage) => {
            const wfType = p.category?.workflow_type;
            const nameLower = (p.name || '').toLowerCase();
            if (wfType === 'wedding' || (nameLower.includes('wedding') && !nameLower.includes('prewedding'))) return false;
            if (wfType === 'custom' || nameLower.includes('everlasting')) return false;
            return true;
        });
    }, [initialPackages, selectedWorkflowId]);

    // Selected Package ID State
    const [selectedPackageId, setSelectedPackageId] = useState<string>('');

    // Keep selectedPackageId in sync when active packages change
    useEffect(() => {
        if (activePackages.length > 0) {
            const exists = activePackages.some((p: DbPackage) => p.id === selectedPackageId);
            if (!exists) {
                setSelectedPackageId(activePackages[0].id);
            }
        } else {
            setSelectedPackageId('');
        }
    }, [activePackages, selectedPackageId]);

    const selectedPackage = useMemo(() => {
        return activePackages.find((p: DbPackage) => p.id === selectedPackageId) || activePackages[0] || null;
    }, [activePackages, selectedPackageId]);

    const currentDeliverables: DeliverableItem[] = useMemo(() => {
        if (!selectedPackage || !selectedPackage.included_deliverables) return [];
        return selectedPackage.included_deliverables;
    }, [selectedPackage]);

    const [deliverablePage, setDeliverablePage] = useState(1);
    const [deliverablesPerPage, setDeliverablesPerPage] = useState(10);

    useEffect(() => {
        setDeliverablePage(1);
    }, [selectedPackageId, selectedWorkflowId]);

    const paginatedDeliverables = useMemo(() => {
        const start = (deliverablePage - 1) * deliverablesPerPage;
        return currentDeliverables.slice(start, start + deliverablesPerPage);
    }, [currentDeliverables, deliverablePage, deliverablesPerPage]);

    // ── 4. DRAWERS & MODALS STATE ────────────────────────────────────────────
    const [isProcessing, setIsProcessing] = useState(false);
    const [isWorkflowDrawerOpen, setIsWorkflowDrawerOpen] = useState(false);
    const [editingWorkflow, setEditingWorkflow] = useState<WorkflowItem | null>(null);

    const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryProjectItem | null>(null);

    const [isDeliverableDrawerOpen, setIsDeliverableDrawerOpen] = useState(false);
    const [editingDeliverable, setEditingDeliverable] = useState<DeliverableItem | null>(null);

    const [isNewPackageModalOpen, setIsNewPackageModalOpen] = useState(false);
    const [isEditPackageModalOpen, setIsEditPackageModalOpen] = useState(false);

    // ── 5. FORM STATES ───────────────────────────────────────────────────────
    const [workflowForm, setWorkflowForm] = useState<{
        name: string;
        description: string;
        steps_count: number;
        status: 'Aktif' | 'Nonaktif';
        steps: WorkflowStepItem[];
    }>({
        name: '',
        description: '',
        steps_count: 7,
        status: 'Aktif',
        steps: [],
    });

    const [categoryForm, setCategoryForm] = useState({
        id: '',
        name: '',
        packages_count: '1 Paket',
        workflow_id: 1,
        color: 'bg-purple-100 text-purple-700',
    });

    const [deliverableForm, setDeliverableForm] = useState({
        name: '',
        type: 'Photo' as 'Photo' | 'Video' | 'Album' | 'Special',
        description: '',
        target_deadline: 'H+14',
        is_required: true,
        by_owner: false,
    });

    const [newPackageForm, setNewPackageForm] = useState<{
        name: string;
        category_id: string;
        base_price: number;
        description: string;
        included_services: string[];
    }>({
        name: '',
        category_id: '',
        base_price: 15000000,
        description: '',
        included_services: ['Studio Photographer'],
    });

    const [editPackageForm, setEditPackageForm] = useState<{
        id: string;
        name: string;
        category_id: string;
        base_price: number;
        description: string;
        included_services: string[];
    }>({
        id: '',
        name: '',
        category_id: '',
        base_price: 0,
        description: '',
        included_services: [],
    });
    const [packageServiceInput, setPackageServiceInput] = useState('');

    // ── 6. HANDLERS FOR DELIVERABLES CRUD (SAVED TO DATABASE) ────────────────
    const handleOpenAddDeliverable = () => {
        if (!selectedPackage) {
            toast.error('Pilih paket terlebih dahulu!');
            return;
        }
        setEditingDeliverable(null);
        setDeliverableForm({
            name: '',
            type: 'Photo',
            description: '',
            target_deadline: 'H+14',
            is_required: true,
            by_owner: false,
        });
        setIsDeliverableDrawerOpen(true);
    };

    const handleOpenEditDeliverable = (item: DeliverableItem) => {
        setEditingDeliverable(item);
        setDeliverableForm({
            name: item.name,
            type: item.type,
            description: item.description || '',
            target_deadline: item.deadline || 'H+14',
            is_required: Boolean(item.required),
            by_owner: Boolean(item.by_owner),
        });
        setIsDeliverableDrawerOpen(true);
    };

    const handleSaveDeliverable = (e: React.FormEvent) => {
        e.preventDefault();
        if (!deliverableForm.name.trim()) {
            toast.error('Nama deliverable harus diisi!');
            return;
        }
        if (!selectedPackage) {
            toast.error('Pilih paket terlebih dahulu!');
            return;
        }

        setIsProcessing(true);

        if (editingDeliverable) {
            // Edit existing deliverable item in package.included_deliverables
            const currentList = selectedPackage.included_deliverables || [];
            const updatedList = currentList.map((d) =>
                String(d.id) === String(editingDeliverable.id)
                    ? {
                          ...d,
                          name: deliverableForm.name.trim(),
                          type: deliverableForm.type,
                          description: deliverableForm.description.trim(),
                          deadline: deliverableForm.target_deadline.trim(),
                          required: deliverableForm.is_required,
                          by_owner: deliverableForm.by_owner,
                      }
                    : d
            );

            router.put(
                `/master-data/workflows/packages/${selectedPackage.id}/deliverables`,
                { deliverables: updatedList as any },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(`Deliverable "${deliverableForm.name}" berhasil disimpan ke database!`);
                        setIsDeliverableDrawerOpen(false);
                        setIsProcessing(false);
                    },
                    onError: (errors) => {
                        toast.error('Gagal memperbarui: ' + Object.values(errors).join(', '));
                        setIsProcessing(false);
                    },
                }
            );
        } else {
            // Add new deliverable to selected package
            router.post(
                `/master-data/workflows/packages/${selectedPackage.id}/deliverables`,
                {
                    name: deliverableForm.name.trim(),
                    type: deliverableForm.type,
                    description: deliverableForm.description.trim(),
                    target_deadline: deliverableForm.target_deadline.trim(),
                    is_required: deliverableForm.is_required,
                    by_owner: deliverableForm.by_owner,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(`Deliverable "${deliverableForm.name}" berhasil ditambahkan ke database untuk paket "${selectedPackage.name}"!`);
                        setIsDeliverableDrawerOpen(false);
                        setIsProcessing(false);
                    },
                    onError: (errors) => {
                        toast.error('Gagal menambahkan: ' + Object.values(errors).join(', '));
                        setIsProcessing(false);
                    },
                }
            );
        }
    };

    const handleDeleteDeliverable = (item: DeliverableItem) => {
        if (!selectedPackage) return;
        if (confirm(`Yakin ingin menghapus deliverable "${item.name}" dari paket "${selectedPackage.name}" di database?`)) {
            setIsProcessing(true);
            router.delete(
                `/master-data/workflows/packages/${selectedPackage.id}/deliverables/${item.id}`,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(`Deliverable "${item.name}" berhasil dihapus dari database!`);
                        setIsProcessing(false);
                    },
                    onError: (errors) => {
                        toast.error('Gagal menghapus deliverable: ' + Object.values(errors).join(', '));
                        setIsProcessing(false);
                    },
                }
            );
        }
    };

    // ── 7. HANDLERS FOR PACKAGES CRUD (DATABASE PERSISTENCE) ─────────────────
    const handleOpenAddPackage = () => {
        let defaultCat = initialCategories.find((c) => {
            if (selectedWorkflowId === 1) return c.workflow_type === 'wedding' || (c.name || '').toLowerCase().includes('wedding');
            if (selectedWorkflowId === 3) return c.workflow_type === 'custom' || (c.name || '').toLowerCase().includes('lainnya');
            return c.workflow_type === 'non_wedding';
        });
        if (!defaultCat && initialCategories.length > 0) defaultCat = initialCategories[0];

        setPackageServiceInput('');
        setNewPackageForm({
            name: '',
            category_id: defaultCat ? defaultCat.id : '',
            base_price: 15000000,
            description: '',
            included_services: ['Studio Photographer'],
        });
        setIsNewPackageModalOpen(true);
    };

    const handleSaveNewPackage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPackageForm.name.trim()) {
            toast.error('Nama paket harus diisi!');
            return;
        }
        if (!newPackageForm.category_id) {
            toast.error('Pilih kategori paket!');
            return;
        }

        setIsProcessing(true);
        router.post(
            '/master-data/workflows/packages',
            newPackageForm,
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Paket "${newPackageForm.name}" berhasil disimpan ke database!`);
                    setIsNewPackageModalOpen(false);
                    setIsProcessing(false);
                },
                onError: (errors) => {
                    toast.error('Gagal menambah paket: ' + Object.values(errors).join(', '));
                    setIsProcessing(false);
                },
            }
        );
    };

    const handleOpenEditPackage = (pkg: DbPackage) => {
        setPackageServiceInput('');
        setEditPackageForm({
            id: pkg.id,
            name: pkg.name,
            category_id: pkg.category_id,
            base_price: Number(pkg.base_price) || 0,
            description: pkg.description || '',
            included_services: Array.isArray(pkg.included_services) ? pkg.included_services : [],
        });
        setIsEditPackageModalOpen(true);
    };

    const handleSaveEditPackage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editPackageForm.name.trim()) {
            toast.error('Nama paket harus diisi!');
            return;
        }
        if (!editPackageForm.category_id) {
            toast.error('Pilih kategori paket!');
            return;
        }

        setIsProcessing(true);
        router.put(
            `/master-data/workflows/packages/${editPackageForm.id}`,
            editPackageForm,
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Paket "${editPackageForm.name}" berhasil diperbarui di database!`);
                    setIsEditPackageModalOpen(false);
                    setIsProcessing(false);
                },
                onError: (errors) => {
                    toast.error('Gagal memperbarui paket: ' + Object.values(errors).join(', '));
                    setIsProcessing(false);
                },
            }
        );
    };

    const handleDeletePackage = (pkg: DbPackage) => {
        if (confirm(`Yakin ingin menghapus paket "${pkg.name}" dari database? Seluruh deliverables di dalam paket ini juga akan dihapus.`)) {
            setIsProcessing(true);
            router.delete(`/master-data/workflows/packages/${pkg.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Paket "${pkg.name}" berhasil dihapus dari database!`);
                    setIsProcessing(false);
                },
                onError: (errors) => {
                    toast.error('Gagal menghapus paket: ' + Object.values(errors).join(', '));
                    setIsProcessing(false);
                },
            });
        }
    };

    // ── 8. HANDLERS FOR CATEGORIES & WORKFLOWS ──────────────────────────────
    const handleOpenEditCategory = (cat: CategoryProjectItem) => {
        setEditingCategory(cat);
        setCategoryForm({
            id: String(cat.id),
            name: cat.name,
            packages_count: String(cat.packages_count),
            workflow_id: cat.workflow_id,
            color: cat.color,
        });
        setIsCategoryDrawerOpen(true);
    };

    const handleSaveCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        let wfType = 'non_wedding';
        if (Number(categoryForm.workflow_id) === 1) wfType = 'wedding';
        else if (Number(categoryForm.workflow_id) === 3) wfType = 'custom';

        setIsProcessing(true);
        router.put(
            `/master-data/workflows/categories/${editingCategory.id}/workflow-type`,
            { workflow_type: wfType },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Workflow kategori "${editingCategory.name}" berhasil disimpan ke database!`);
                    setIsCategoryDrawerOpen(false);
                    setIsProcessing(false);
                },
                onError: (errs) => {
                    toast.error('Gagal memperbarui kategori: ' + Object.values(errs).join(', '));
                    setIsProcessing(false);
                },
            }
        );
    };

    const handleOpenAddWorkflow = () => {
        setEditingWorkflow(null);
        setWorkflowForm({
            name: '',
            description: '',
            steps_count: 6,
            status: 'Aktif',
            steps: [
                { id: 1, num: 1, name: 'Booking & Briefing Sesi', phase: 'Pra-Acara', duration: 'H-7 s/d H-1', activity: 'Briefing konsep visual, moodboard, dan penentuan lokasi.' },
                { id: 2, num: 2, name: 'Hari H Sesi Foto & Video', phase: 'Hari H', duration: 'Hari H', activity: 'Pelaksanaan dokumentasi hari H dan backup ganda data.' },
                { id: 3, num: 3, name: 'Culling & Editing', phase: 'Pasca-Produksi', duration: 'H+1 s/d H+7', activity: 'Sortir foto terbaik, color grading, dan retouching master.' },
                { id: 4, num: 4, name: 'Review Klien & Revisi', phase: 'Review', duration: 'H+7 s/d H+14', activity: 'Sesi pemilihan foto & konfirmasi revisi minor klien.' },
                { id: 5, num: 5, name: 'Produksi / Finishing', phase: 'Finishing', duration: 'H+14 s/d H+30', activity: 'Pencetakan album / kanvas dan packaging box exclusive.' },
                { id: 6, num: 6, name: 'Penyerahan Final', phase: 'Selesai', duration: 'H+30', activity: 'Handover seluruh berkas fisik dan link cloud storage.' },
            ],
        });
        setIsWorkflowDrawerOpen(true);
    };

    const handleOpenEditWorkflow = (wf: WorkflowItem) => {
        setEditingWorkflow(wf);
        setWorkflowForm({
            name: wf.name,
            description: wf.description,
            steps_count: wf.steps_count,
            status: wf.status,
            steps: wf.steps.map((s, idx) => ({
                id: s.id || idx + 1,
                num: s.num || idx + 1,
                name: s.name || `Tahap ${idx + 1}`,
                phase: s.phase || 'Operasional',
                duration: s.duration || 'H+14',
                activity: s.activity || '',
            })),
        });
        setIsWorkflowDrawerOpen(true);
    };

    const handleSaveWorkflow = (e: React.FormEvent) => {
        e.preventDefault();
        if (!workflowForm.name.trim()) {
            toast.error('Nama workflow harus diisi!');
            return;
        }

        const steps = workflowForm.steps.slice(0, workflowForm.steps_count).map((s, idx) => ({
            id: idx + 1,
            num: idx + 1,
            name: s.name || `Tahap ${idx + 1}`,
            phase: s.phase || 'Operasional',
            duration: s.duration || 'H+14',
            activity: s.activity || '',
        }));

        setIsProcessing(true);
        if (editingWorkflow) {
            router.put(
                `/master-data/workflows/${editingWorkflow.id}`,
                {
                    name: workflowForm.name,
                    description: workflowForm.description,
                    status: workflowForm.status,
                    steps,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(`Workflow "${workflowForm.name}" beserta Target Deadline berhasil disimpan ke database!`);
                        setIsWorkflowDrawerOpen(false);
                        setIsProcessing(false);
                    },
                    onError: (errs) => {
                        toast.error('Gagal memperbarui workflow: ' + Object.values(errs).join(', '));
                        setIsProcessing(false);
                    },
                }
            );
        } else {
            router.post(
                '/master-data/workflows',
                {
                    name: workflowForm.name,
                    description: workflowForm.description,
                    status: workflowForm.status,
                    steps,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success(`Workflow baru "${workflowForm.name}" berhasil disimpan ke database!`);
                        setIsWorkflowDrawerOpen(false);
                        setIsProcessing(false);
                    },
                    onError: (errs) => {
                        toast.error('Gagal menambahkan workflow: ' + Object.values(errs).join(', '));
                        setIsProcessing(false);
                    },
                }
            );
        }
    };

    const handleToggleWorkflowStatus = () => {
        const nextStatus = activeWorkflow.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
        setWorkflows((prev) =>
            prev.map((w) => (w.id === activeWorkflow.id ? { ...w, status: nextStatus } : w))
        );
        toast.success(`Status "${activeWorkflow.name}" diubah menjadi ${nextStatus}!`);
    };

    // ── 9. HELPER BADGE STYLES ───────────────────────────────────────────────
    const getTypeClass = (type: string) => {
        switch (type) {
            case 'Video':
                return 'bg-cyan-50 text-cyan-700 border-cyan-200';
            case 'Album':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Special':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            default:
                return 'bg-sky-50 text-sky-700 border-sky-200';
        }
    };

    const getDeadlineBadge = (deadline: string) => {
        if (!deadline || deadline === '—') {
            return <span className="text-slate-400 font-medium">—</span>;
        }
        const d = deadline.trim();
        if (d.startsWith('H-')) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                    <Clock className="w-3 h-3 text-amber-500" />
                    {d}
                </span>
            );
        }
        if (d.toLowerCase() === 'hari h') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    Hari H
                </span>
            );
        }
        if (d === 'H+1' || d === 'H+3') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80">
                    <Clock className="w-3 h-3 text-sky-500" />
                    {d}
                </span>
            );
        }
        if (d === 'H+7' || d === 'H+14') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-[#3B46F1] border border-indigo-200/80">
                    <Clock className="w-3 h-3 text-[#3B46F1]" />
                    {d}
                </span>
            );
        }
        if (d === 'H+30' || d === 'H+45') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/80">
                    <Clock className="w-3 h-3 text-purple-500" />
                    {d}
                </span>
            );
        }
        if (d === 'H+60') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                    <Clock className="w-3 h-3 text-rose-500" />
                    {d}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                <Clock className="w-3 h-3 text-slate-400" />
                {d}
            </span>
        );
    };

    return (
        <div className="w-full max-w-full space-y-6 pb-20">
            <Head title="Workflow & Template Progress - Master Data" />

            {/* ── 1. BREADCRUMB & HEADER SECTION ────────────────────────────────── */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs">
                    <Link
                        href="/master-data/workflows"
                        className="text-slate-500 hover:text-slate-800 transition-colors font-medium"
                    >
                        Master Data
                    </Link>
                    <span className="text-slate-400">›</span>
                    <span className="text-[#F59E0B] font-bold">Workflow &amp; Template Progress</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Workflow &amp; Template Progress
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Kelola workflow utama, paket, dan template deadline deliverables tersimpan langsung di database.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Link
                            href="/master-data/categories"
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                        >
                            <Folder className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Kategori</span>
                        </Link>
                        <Link
                            href="/master-data/packages"
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                        >
                            <Box className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Paket &amp; Harga</span>
                        </Link>
                        <button
                            type="button"
                            onClick={handleOpenAddPackage}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                        >
                            <PackagePlus className="w-4 h-4 text-indigo-600" />
                            <span>Tambah Paket Baru</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleOpenAddWorkflow}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.02] cursor-pointer shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Workflow</span>
                            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── 2. MAIN 2-COLUMN FULL-WIDTH GRID ──────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
                {/* ── LEFT COLUMN: KATEGORI PROJECT & WORKFLOW UTAMA ─────────────── */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                    {/* Card 1: Kategori Project */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-3.5">
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-sm font-bold text-slate-900">Kategori Project</h2>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                        {dbCategoryItems.length}
                                    </span>
                                </div>
                                <p className="text-[10.5px] text-slate-400 font-medium mt-0.5">
                                    Sinkron otomatis dengan database Master Kategori
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Link
                                    href="/master-data/categories"
                                    className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-[#3B46F1] hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
                                    title="Buka Master Data Kategori"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>

                        {/* Scrollable category list container */}
                        <div className="max-h-[380px] overflow-y-auto pr-1">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="sticky top-0 bg-white z-10">
                                    <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                                        <th className="py-2.5 px-2 w-[48%]">KATEGORI</th>
                                        <th className="py-2.5 px-2 w-[34%]">WORKFLOW</th>
                                        <th className="py-2.5 px-2 w-[18%] text-right">STATUS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {dbCategoryItems.map((cat) => (
                                        <tr
                                            key={cat.id}
                                            onClick={() => handleOpenEditCategory(cat)}
                                            className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                                            title="Klik untuk ubah alur workflow kategori ini"
                                        >
                                            <td className="py-2.5 px-2">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 group-hover:text-[#3B46F1] transition-colors">
                                                        {cat.name}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {cat.packages_count}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-2">
                                                <span
                                                    className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${cat.color}`}
                                                >
                                                    {cat.workflow_id === 1 ? 'Wedding (8T)' : (cat.workflow_id === 3 ? 'Custom (6T)' : 'Non-Wedding (5T)')}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-2 text-right">
                                                <span className="inline-flex px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    Aktif
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Card 2: Alur Workflow Utama */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900">Alur Workflow Utama</h2>
                                <p className="text-[10.5px] text-slate-400 font-medium">
                                    Klik workflow untuk melihat dan mengelola deliverables paket
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            {workflows.map((wf) => {
                                const isSelected = selectedWorkflowId === wf.id;
                                const pkgCountForWf = initialPackages.filter((p: DbPackage) => {
                                    if (wf.id === 1) return p.category?.workflow_type === 'wedding' || (p.name || '').toLowerCase().includes('wedding');
                                    if (wf.id === 3) return p.category?.workflow_type === 'custom' || (p.name || '').toLowerCase().includes('everlasting');
                                    return p.category?.workflow_type !== 'wedding' && p.category?.workflow_type !== 'custom';
                                }).length;

                                return (
                                    <div
                                        key={wf.id}
                                        onClick={() => setSelectedWorkflowId(wf.id)}
                                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                            isSelected
                                                ? 'bg-indigo-50/70 border-[#3B46F1] shadow-2xs ring-1 ring-indigo-500/20'
                                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                                        }`}
                                    >
                                        <div className="space-y-1 flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                                        isSelected ? 'bg-[#3B46F1]' : 'bg-slate-300'
                                                    }`}
                                                />
                                                <h3
                                                    className={`text-xs font-bold truncate ${
                                                        isSelected ? 'text-[#3B46F1]' : 'text-slate-900'
                                                    }`}
                                                >
                                                    {wf.name}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2 pl-4 text-[10.5px] text-slate-500">
                                                <span className="font-semibold text-slate-700">
                                                    {wf.steps_count} Tahap
                                                </span>
                                                <span>•</span>
                                                <span className="text-slate-500">
                                                    {pkgCountForWf} Paket DB
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                            <span
                                                className={`px-2 py-0.5 rounded text-[9.5px] font-bold border ${
                                                    wf.status === 'Aktif'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}
                                            >
                                                {wf.status}
                                            </span>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="p-1 hover:bg-slate-200/70 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                                                    >
                                                        <MoreVertical className="w-3.5 h-3.5" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-32 bg-white rounded-xl shadow-lg border border-slate-200 p-1 text-xs">
                                                    <DropdownMenuItem
                                                        onClick={() => handleOpenEditWorkflow(wf)}
                                                        className="px-2.5 py-1.5 hover:bg-indigo-50 hover:text-[#3B46F1] font-medium text-xs rounded-lg flex items-center gap-2 cursor-pointer focus:bg-indigo-50 focus:text-[#3B46F1]"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>Edit</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN: DETAIL WORKFLOW & TEMPLATE DELIVERABLES ─────── */}
                <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
                    {/* Header Workflow Detail */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                                    {activeWorkflow.name}
                                </h2>
                                <span
                                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                        activeWorkflow.status === 'Aktif'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}
                                >
                                    {activeWorkflow.status}
                                </span>
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                    {activeWorkflow.steps_count} Tahapan
                                </span>
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-[#3B46F1]">
                                    {activePackages.length} Paket Tersedia
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">{activeWorkflow.description}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleOpenEditWorkflow(activeWorkflow)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                            >
                                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Edit Workflow</span>
                            </button>
                        </div>
                    </div>

                    {/* Timeline Visual Stepper */}
                    <div className="py-2 overflow-x-auto pb-4">
                        <div className="flex items-center justify-between min-w-[560px] relative px-4">
                            {/* Connecting Line */}
                            <div className="absolute top-4 left-8 right-8 h-0.5 bg-slate-200 z-0" />

                            {activeWorkflow.steps.map((st, idx) => (
                                <div
                                    key={st.id || idx}
                                    className="flex flex-col items-center text-center relative z-10 group min-w-[90px] px-1"
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                            idx === 0
                                                ? 'bg-[#3B46F1] text-white shadow-md shadow-indigo-500/25 ring-4 ring-indigo-50'
                                                : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-indigo-400'
                                        }`}
                                    >
                                        {idx + 1}
                                    </div>
                                    <span
                                        className={`text-[10.5px] mt-2 max-w-[90px] leading-tight font-semibold break-words ${
                                            idx === 0 ? 'text-[#3B46F1] font-bold' : 'text-slate-700'
                                        }`}
                                    >
                                        {st.name || st.title}
                                    </span>
                                    {st.duration && (
                                        <span className="mt-1 text-[9px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100 whitespace-nowrap">
                                            {st.duration}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section Template Deadline Deliverables */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-sm text-slate-900">
                                        Template Deadline Deliverables per Paket
                                    </h3>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-[#3B46F1]">
                                        {currentDeliverables.length} Deliverables
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Target turnaround deliverable otomatis disinkronkan saat project baru dibuat.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleOpenAddDeliverable}
                                disabled={!selectedPackage || isProcessing}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#3B46F1] hover:bg-[#323BD8] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Deliverable</span>
                            </button>
                        </div>

                        {/* Package Selection Pills Tabs (Gambar 1) */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                            {activePackages.length > 0 ? (
                                <>
                                    {activePackages.map((pkg: DbPackage) => (
                                        <button
                                            key={pkg.id}
                                            type="button"
                                            onClick={() => setSelectedPackageId(pkg.id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                                selectedPackage?.id === pkg.id
                                                    ? 'bg-[#3B46F1] text-white shadow-xs ring-2 ring-indigo-500/20'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }`}
                                        >
                                            {pkg.name}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={handleOpenAddPackage}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 border border-indigo-200 text-[#3B46F1] hover:bg-indigo-100 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
                                        title="Tambah Paket Baru ke Database"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span>Paket Baru</span>
                                    </button>
                                </>
                            ) : (
                                <div className="text-xs text-slate-400 py-1 flex items-center gap-2">
                                    <span>Belum ada paket untuk alur workflow ini.</span>
                                    <button
                                        type="button"
                                        onClick={handleOpenAddPackage}
                                        className="text-[#3B46F1] font-bold hover:underline"
                                    >
                                        + Tambah Paket
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Active Package Info & CRUD Toolbar */}
                        {selectedPackage && (
                            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div className="flex items-center gap-2.5 flex-wrap text-xs">
                                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                        <Tag className="w-3.5 h-3.5 text-indigo-600" />
                                        <span>{selectedPackage.name}</span>
                                    </div>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                                        <Coins className="w-3.5 h-3.5 text-emerald-600" />
                                        {formatRupiah(selectedPackage.base_price)}
                                    </span>
                                    {selectedPackage.category && (
                                        <>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-slate-700">
                                                Kategori: {selectedPackage.category.name}
                                            </span>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenEditPackage(selectedPackage)}
                                        disabled={isProcessing}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                                        title="Edit nama paket, kategori, dan harga di database"
                                    >
                                        <Edit2 className="w-3 h-3 text-slate-500" />
                                        <span>Edit Paket</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeletePackage(selectedPackage)}
                                        disabled={isProcessing}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                                        title="Hapus paket ini dari database"
                                    >
                                        <Trash2 className="w-3 h-3 text-rose-500" />
                                        <span>Hapus Paket</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Deliverables Table (Gambar 2) */}
                        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50/80">
                                    <tr className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200/80">
                                        <th className="py-2.5 px-3 w-8">NO</th>
                                        <th className="py-2.5 px-3">DELIVERABLE</th>
                                        <th className="py-2.5 px-3">JENIS</th>
                                        <th className="py-2.5 px-3">DESKRIPSI</th>
                                        <th className="py-2.5 px-3">TARGET DEADLINE</th>
                                        <th className="py-2.5 px-3 text-center">WAJIB</th>
                                        <th className="py-2.5 px-3 text-center">BY OWNER</th>
                                        <th className="py-2.5 px-3 text-center w-20">AKSI</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-[11px] text-slate-800 bg-white">
                                    {paginatedDeliverables.length > 0 ? (
                                        paginatedDeliverables.map((item, idx) => (
                                            <tr key={item.id || idx} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="py-3 px-3 text-slate-400 font-bold">{(deliverablePage - 1) * deliverablesPerPage + idx + 1}</td>
                                                <td className="py-3 px-3 font-bold text-slate-900 break-words min-w-[150px]">
                                                    {item.name}
                                                </td>
                                                <td className="py-3 px-3 whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                            item.type_class || getTypeClass(item.type)
                                                        }`}
                                                    >
                                                        {item.type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-3 text-slate-600 break-words min-w-[220px] leading-relaxed">
                                                    {item.description || '—'}
                                                </td>
                                                <td className="py-3 px-3 whitespace-nowrap">
                                                    {getDeadlineBadge(item.deadline)}
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    {item.required ? (
                                                        <span className="inline-flex p-1 bg-emerald-50 text-emerald-600 rounded-md" title="Deliverable Wajib">
                                                            <Check className="w-3.5 h-3.5" />
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 font-medium">—</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    {item.by_owner ? (
                                                        <span className="inline-flex p-1 bg-indigo-50 text-[#3B46F1] rounded-md" title="Diawasi By Owner">
                                                            <Check className="w-3.5 h-3.5" />
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 font-medium">—</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 text-center whitespace-nowrap">
                                                    <div className="flex items-center justify-center gap-1.5 text-slate-400">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEditDeliverable(item)}
                                                            className="p-1.5 hover:text-[#3B46F1] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                                            title="Edit Deliverable"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteDeliverable(item)}
                                                            className="p-1.5 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                                            title="Hapus Deliverable"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="py-8 text-center text-slate-400">
                                                Belum ada deliverable untuk paket {selectedPackage?.name || ''}. Klik tombol &ldquo;Tambah Deliverable&rdquo; di atas untuk menyimpan ke database.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Deliverables Pagination */}
                        {currentDeliverables.length > 0 && (
                            <Pagination
                                currentPage={deliverablePage}
                                lastPage={Math.max(1, Math.ceil(currentDeliverables.length / deliverablesPerPage))}
                                total={currentDeliverables.length}
                                from={(deliverablePage - 1) * deliverablesPerPage + 1}
                                to={Math.min(deliverablePage * deliverablesPerPage, currentDeliverables.length)}
                                perPage={deliverablesPerPage}
                                itemLabel="deliverables"
                                onPageChange={(pg) => setDeliverablePage(pg)}
                                onPerPageChange={(newPerPage) => {
                                    setDeliverablesPerPage(newPerPage);
                                    setDeliverablePage(1);
                                }}
                            />
                        )}

                        {/* Legend Keterangan */}
                        <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-slate-600 flex-wrap">
                            <span className="text-slate-400 font-normal">Kategori Deliverable:</span>
                            <div className="flex items-center gap-1">
                                <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] rounded font-bold border border-sky-200">
                                    Photo
                                </span>
                                <span className="text-[11px] text-slate-500">Foto & Retouch</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 text-[10px] rounded font-bold border border-cyan-200">
                                    Video
                                </span>
                                <span className="text-[11px] text-slate-500">Teaser & Cinematic</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] rounded font-bold border border-amber-200">
                                    Album
                                </span>
                                <span className="text-[11px] text-slate-500">Layout & Cetak</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] rounded font-bold border border-purple-200">
                                    Special
                                </span>
                                <span className="text-[11px] text-slate-500">Canvas & Drive Link</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Two Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                        {/* Left Card: Catatan Workflow */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                <Clock className="w-4 h-4 text-[#3B46F1]" />
                                <span>Rumus Target Deadline Otomatis</span>
                            </div>
                            <ul className="space-y-1.5 text-[11px] text-slate-600 leading-relaxed list-disc list-inside">
                                <li><strong>H-x</strong>: Wajib selesai beberapa hari sebelum acara dimulai.</li>
                                <li><strong>Hari H</strong>: Deliverable diserahkan langsung pada hari acara (misal: Same Day Edit).</li>
                                <li><strong>H+x</strong>: Dihitung otomatis dari tanggal acara project (misal: H+14 = 14 hari setelah shooting).</li>
                                <li>Tersimpan di database dan otomatis terintegrasi ke Timeline Proyek.</li>
                            </ul>
                        </div>

                        {/* Right Card: Paket yang Menggunakan Workflow Ini */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2.5">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                <Layers className="w-4 h-4 text-[#3B46F1]" />
                                <span>Paket yang Menggunakan Workflow Ini</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {activePackages.length > 0 ? (
                                    activePackages.map((p) => (
                                        <span
                                            key={p.id}
                                            className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-[#3B46F1] font-semibold text-[10.5px]"
                                        >
                                            {p.name}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-[10.5px] text-slate-400">Belum ada paket terhubung</span>
                                )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">
                                Total {activePackages.length} paket terhubung di database
                            </p>
                        </div>
                    </div>

                    {/* Toggle Status Workflow Button */}
                    <div className="pt-2 flex justify-end">
                        <button
                            type="button"
                            onClick={handleToggleWorkflowStatus}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 border rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                                activeWorkflow.status === 'Aktif'
                                    ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                    : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                        >
                            <Power className="w-3.5 h-3.5" />
                            <span>
                                {activeWorkflow.status === 'Aktif'
                                    ? 'Nonaktifkan Workflow'
                                    : 'Aktifkan Workflow'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════════ */}
            {/* ── RIGHT SLIDE-OVER DRAWER: TAMBAH / EDIT DELIVERABLE ───────────── */}
            {/* ════════════════════════════════════════════════════════════════════ */}
            {isDeliverableDrawerOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                        onClick={() => !isProcessing && setIsDeliverableDrawerOpen(false)}
                    />
                    <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
                        <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
                            <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-white shrink-0">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                                        {editingDeliverable ? 'Edit Deliverable' : 'Tambah Deliverable Baru'}
                                    </h3>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Paket: <strong className="text-indigo-600">{selectedPackage?.name}</strong>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => !isProcessing && setIsDeliverableDrawerOpen(false)}
                                    className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveDeliverable} className="p-6 space-y-4 flex-1 overflow-y-auto text-xs flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="font-bold text-slate-700">Nama Deliverable *</label>
                                        <input
                                            type="text"
                                            value={deliverableForm.name}
                                            onChange={(e) =>
                                                setDeliverableForm({ ...deliverableForm, name: e.target.value })
                                            }
                                            placeholder="Contoh: Cinematic Highlight"
                                            className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B46F1] outline-hidden font-medium"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="font-bold text-slate-700">Jenis Deliverable *</label>
                                            <select
                                                value={deliverableForm.type}
                                                onChange={(e) =>
                                                    setDeliverableForm({
                                                        ...deliverableForm,
                                                        type: e.target.value as any,
                                                    })
                                                }
                                                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium cursor-pointer"
                                            >
                                                <option value="Photo">Photo</option>
                                                <option value="Video">Video</option>
                                                <option value="Album">Album</option>
                                                <option value="Special">Special</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="font-bold text-slate-700">Target Deadline *</label>
                                            <input
                                                type="text"
                                                value={deliverableForm.target_deadline}
                                                onChange={(e) =>
                                                    setDeliverableForm({
                                                        ...deliverableForm,
                                                        target_deadline: e.target.value,
                                                    })
                                                }
                                                placeholder="Contoh: H+14 / H+30 / —"
                                                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-[#3B46F1] outline-hidden"
                                                required
                                            />
                                            {/* Quick deadline preset pills */}
                                            <div className="flex items-center gap-1 flex-wrap pt-1">
                                                {['H-14', 'H-7', 'Hari H', 'H+1', 'H+3', 'H+7', 'H+14', 'H+30', 'H+45', 'H+60', '—'].map((preset) => (
                                                    <button
                                                        key={preset}
                                                        type="button"
                                                        onClick={() => setDeliverableForm({ ...deliverableForm, target_deadline: preset })}
                                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                                            deliverableForm.target_deadline === preset
                                                                ? 'bg-indigo-50 border-[#3B46F1] text-[#3B46F1]'
                                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        {preset}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="font-bold text-slate-700">Deskripsi / Keterangan</label>
                                        <textarea
                                            rows={3}
                                            value={deliverableForm.description}
                                            onChange={(e) =>
                                                setDeliverableForm({
                                                    ...deliverableForm,
                                                    description: e.target.value,
                                                })
                                            }
                                            placeholder="Keterangan format file, resolusi, durasi, dll..."
                                            className="w-full p-2.5 rounded-xl border border-slate-200"
                                        />
                                    </div>

                                    <div className="space-y-2 pt-2 border-t border-slate-100">
                                        <label className="flex items-center gap-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={deliverableForm.is_required}
                                                onChange={(e) =>
                                                    setDeliverableForm({
                                                        ...deliverableForm,
                                                        is_required: e.target.checked,
                                                    })
                                                }
                                                className="w-4 h-4 accent-[#3B46F1] rounded cursor-pointer"
                                            />
                                            <span className="font-semibold text-slate-700">Deliverable Wajib</span>
                                        </label>

                                        <label className="flex items-center gap-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={deliverableForm.by_owner}
                                                onChange={(e) =>
                                                    setDeliverableForm({
                                                        ...deliverableForm,
                                                        by_owner: e.target.checked,
                                                    })
                                                }
                                                className="w-4 h-4 accent-[#3B46F1] rounded cursor-pointer"
                                            />
                                            <span className="font-semibold text-slate-700">
                                                Diawasi By Owner (Adit)
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        disabled={isProcessing}
                                        onClick={() => setIsDeliverableDrawerOpen(false)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#3B46F1] hover:bg-[#323BD8] disabled:opacity-50 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                                    >
                                        {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        <span>{editingDeliverable ? 'Simpan ke Database' : 'Tambah ke Database'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════ */}
            {/* ── MODAL TAMBAH PAKET BARU KE DATABASE ──────────────────────────── */}
            {/* ════════════════════════════════════════════════════════════════════ */}
            {isNewPackageModalOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                        onClick={() => !isProcessing && setIsNewPackageModalOpen(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 z-10 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-black text-slate-900">
                                Tambah Paket Baru ke Database
                            </h3>
                            <button
                                type="button"
                                onClick={() => !isProcessing && setIsNewPackageModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveNewPackage} className="space-y-4 text-xs">
                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Kategori Paket *</label>
                                <select
                                    value={newPackageForm.category_id}
                                    onChange={(e) => setNewPackageForm({ ...newPackageForm, category_id: e.target.value })}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
                                    required
                                >
                                    <option value="">-- Pilih Kategori --</option>
                                    {initialCategories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.workflow_type || 'non_wedding'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Nama Paket *</label>
                                <input
                                    type="text"
                                    value={newPackageForm.name}
                                    onChange={(e) => setNewPackageForm({ ...newPackageForm, name: e.target.value })}
                                    placeholder="Contoh: Wedding Diamond Exclusive"
                                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B46F1] outline-hidden font-medium"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Harga Dasar (Rp)</label>
                                <input
                                    type="number"
                                    value={newPackageForm.base_price}
                                    onChange={(e) => setNewPackageForm({ ...newPackageForm, base_price: Number(e.target.value) })}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Deskripsi Singkat</label>
                                <textarea
                                    rows={2}
                                    value={newPackageForm.description}
                                    onChange={(e) => setNewPackageForm({ ...newPackageForm, description: e.target.value })}
                                    placeholder="Cakupan layanan paket..."
                                    className="w-full p-2.5 rounded-xl border border-slate-200"
                                />
                            </div>

                            {/* Layanan Termasuk (Included Services) */}
                            <div className="space-y-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <label className="block font-bold text-slate-800 text-xs">
                                        Layanan Termasuk (Included Services)
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {newPackageForm.included_services.length} Layanan
                                    </span>
                                </div>
                                <p className="text-[10.5px] text-slate-500 leading-tight">
                                    Daftar kru internal yang disertakan (misal: Studio Photographer, 2 Main Photographers, 1 Videographer, MUA &amp; Hairdo).
                                </p>

                                <div className="flex items-center gap-1.5 pt-1">
                                    <input
                                        type="text"
                                        value={packageServiceInput}
                                        onChange={(e) => setPackageServiceInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = packageServiceInput.trim();
                                                if (val && !newPackageForm.included_services.includes(val)) {
                                                    setNewPackageForm({
                                                        ...newPackageForm,
                                                        included_services: [...newPackageForm.included_services, val],
                                                    });
                                                }
                                                setPackageServiceInput('');
                                            }
                                        }}
                                        placeholder="Ketik layanan (contoh: Studio Photographer)..."
                                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const val = packageServiceInput.trim();
                                            if (val && !newPackageForm.included_services.includes(val)) {
                                                setNewPackageForm({
                                                    ...newPackageForm,
                                                    included_services: [...newPackageForm.included_services, val],
                                                });
                                            }
                                            setPackageServiceInput('');
                                        }}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambah</span>
                                    </button>
                                </div>

                                {/* Quick Presets */}
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {[
                                        'Studio Photographer',
                                        '1 Main Photographer',
                                        '2 Main Photographers',
                                        '1 Videographer',
                                        '2 Videographers',
                                        'Drone Pilot',
                                        'MUA & Hairdo',
                                        'Lighting Specialist',
                                    ].map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => {
                                                if (!newPackageForm.included_services.includes(preset)) {
                                                    setNewPackageForm({
                                                        ...newPackageForm,
                                                        included_services: [...newPackageForm.included_services, preset],
                                                    });
                                                }
                                            }}
                                            className={`text-[9px] font-medium px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                                newPackageForm.included_services.includes(preset)
                                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                            + {preset}
                                        </button>
                                    ))}
                                </div>

                                {/* Active Chips */}
                                <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-200/60">
                                    {newPackageForm.included_services.length === 0 ? (
                                        <span className="text-[11px] text-slate-400 italic">
                                            Belum ada layanan yang ditambahkan.
                                        </span>
                                    ) : (
                                        newPackageForm.included_services.map((service, sIdx) => (
                                            <span
                                                key={sIdx}
                                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                                            >
                                                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                                <span>{service}</span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setNewPackageForm({
                                                            ...newPackageForm,
                                                            included_services: newPackageForm.included_services.filter((s) => s !== service),
                                                        })
                                                    }
                                                    className="p-0.5 rounded hover:bg-emerald-200/60 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={() => setIsNewPackageModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#3B46F1] hover:bg-[#323BD8] disabled:opacity-50 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                                >
                                    {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Simpan Paket</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════ */}
            {/* ── MODAL EDIT PAKET DI DATABASE ─────────────────────────────────── */}
            {/* ════════════════════════════════════════════════════════════════════ */}
            {isEditPackageModalOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                        onClick={() => !isProcessing && setIsEditPackageModalOpen(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 z-10 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-sm font-black text-slate-900">
                                    Edit Paket di Database
                                </h3>
                                <p className="text-[11px] text-slate-400">
                                    Perubahan nama, harga, dan kategori akan disimpan permanen.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => !isProcessing && setIsEditPackageModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEditPackage} className="space-y-4 text-xs">
                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Kategori Paket *</label>
                                <select
                                    value={editPackageForm.category_id}
                                    onChange={(e) => setEditPackageForm({ ...editPackageForm, category_id: e.target.value })}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium cursor-pointer"
                                    required
                                >
                                    <option value="">-- Pilih Kategori --</option>
                                    {initialCategories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.workflow_type || 'non_wedding'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Nama Paket *</label>
                                <input
                                    type="text"
                                    value={editPackageForm.name}
                                    onChange={(e) => setEditPackageForm({ ...editPackageForm, name: e.target.value })}
                                    placeholder="Contoh: Wedding Diamond Exclusive"
                                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B46F1] outline-hidden font-medium"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Harga Dasar (Rp)</label>
                                <input
                                    type="number"
                                    value={editPackageForm.base_price}
                                    onChange={(e) => setEditPackageForm({ ...editPackageForm, base_price: Number(e.target.value) })}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Deskripsi Singkat</label>
                                <textarea
                                    rows={2}
                                    value={editPackageForm.description}
                                    onChange={(e) => setEditPackageForm({ ...editPackageForm, description: e.target.value })}
                                    placeholder="Cakupan layanan paket..."
                                    className="w-full p-2.5 rounded-xl border border-slate-200"
                                />
                            </div>

                            {/* Layanan Termasuk (Included Services) */}
                            <div className="space-y-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between">
                                    <label className="block font-bold text-slate-800 text-xs">
                                        Layanan Termasuk (Included Services)
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {editPackageForm.included_services.length} Layanan
                                    </span>
                                </div>
                                <p className="text-[10.5px] text-slate-500 leading-tight">
                                    Daftar kru internal yang disertakan (misal: Studio Photographer, 2 Main Photographers, 1 Videographer, MUA &amp; Hairdo).
                                </p>

                                <div className="flex items-center gap-1.5 pt-1">
                                    <input
                                        type="text"
                                        value={packageServiceInput}
                                        onChange={(e) => setPackageServiceInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = packageServiceInput.trim();
                                                if (val && !editPackageForm.included_services.includes(val)) {
                                                    setEditPackageForm({
                                                        ...editPackageForm,
                                                        included_services: [...editPackageForm.included_services, val],
                                                    });
                                                }
                                                setPackageServiceInput('');
                                            }
                                        }}
                                        placeholder="Ketik layanan (contoh: Studio Photographer)..."
                                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const val = packageServiceInput.trim();
                                            if (val && !editPackageForm.included_services.includes(val)) {
                                                setEditPackageForm({
                                                    ...editPackageForm,
                                                    included_services: [...editPackageForm.included_services, val],
                                                });
                                            }
                                            setPackageServiceInput('');
                                        }}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambah</span>
                                    </button>
                                </div>

                                {/* Quick Presets */}
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {[
                                        'Studio Photographer',
                                        '1 Main Photographer',
                                        '2 Main Photographers',
                                        '1 Videographer',
                                        '2 Videographers',
                                        'Drone Pilot',
                                        'MUA & Hairdo',
                                        'Lighting Specialist',
                                    ].map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => {
                                                if (!editPackageForm.included_services.includes(preset)) {
                                                    setEditPackageForm({
                                                        ...editPackageForm,
                                                        included_services: [...editPackageForm.included_services, preset],
                                                    });
                                                }
                                            }}
                                            className={`text-[9px] font-medium px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                                editPackageForm.included_services.includes(preset)
                                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                            + {preset}
                                        </button>
                                    ))}
                                </div>

                                {/* Active Chips */}
                                <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-200/60">
                                    {editPackageForm.included_services.length === 0 ? (
                                        <span className="text-[11px] text-slate-400 italic">
                                            Belum ada layanan yang ditambahkan.
                                        </span>
                                    ) : (
                                        editPackageForm.included_services.map((service, sIdx) => (
                                            <span
                                                key={sIdx}
                                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                                            >
                                                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                                <span>{service}</span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setEditPackageForm({
                                                            ...editPackageForm,
                                                            included_services: editPackageForm.included_services.filter((s) => s !== service),
                                                        })
                                                    }
                                                    className="p-0.5 rounded hover:bg-emerald-200/60 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={() => setIsEditPackageModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#3B46F1] hover:bg-[#323BD8] disabled:opacity-50 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                                >
                                    {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Simpan Perubahan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════ */}
            {/* ── RIGHT SLIDE-OVER DRAWER: EDIT WORKFLOW KATEGORI ──────────────── */}
            {/* ════════════════════════════════════════════════════════════════════ */}
            {isCategoryDrawerOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                        onClick={() => !isProcessing && setIsCategoryDrawerOpen(false)}
                    />
                    <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
                        <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
                            <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-white shrink-0">
                                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                                    Atur Workflow Kategori Project
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => !isProcessing && setIsCategoryDrawerOpen(false)}
                                    className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 flex-1 overflow-y-auto text-xs flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="font-bold text-slate-700">Nama Kategori</label>
                                        <input
                                            type="text"
                                            value={categoryForm.name}
                                            disabled
                                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-bold"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="font-bold text-slate-700">Pilih Alur Workflow Master *</label>
                                        <select
                                            value={categoryForm.workflow_id}
                                            onChange={(e) =>
                                                setCategoryForm({
                                                    ...categoryForm,
                                                    workflow_id: Number(e.target.value),
                                                })
                                            }
                                            className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium cursor-pointer"
                                        >
                                            {workflows.map((wf) => (
                                                <option key={wf.id} value={wf.id}>
                                                    {wf.name} ({wf.steps_count} Tahap)
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-[10.5px] text-slate-400 mt-1">
                                            Semua paket dalam kategori ini akan mengikuti alur tahapan progress workflow yang dipilih.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        disabled={isProcessing}
                                        onClick={() => setIsCategoryDrawerOpen(false)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#3B46F1] hover:bg-[#323BD8] disabled:opacity-50 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                                    >
                                        {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        <span>Simpan ke Database</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════ */}
            {/* ── RIGHT SLIDE-OVER DRAWER: TAMBAH / EDIT WORKFLOW ──────────────── */}
            {/* ════════════════════════════════════════════════════════════════════ */}
            {isWorkflowDrawerOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                        onClick={() => setIsWorkflowDrawerOpen(false)}
                    />
                    <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
                        <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full animate-in slide-in-from-right duration-300">
                            <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-white shrink-0">
                                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                                    {editingWorkflow ? 'Edit Workflow Utama' : 'Tambah Workflow Utama Baru'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsWorkflowDrawerOpen(false)}
                                    className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveWorkflow} className="p-6 space-y-4 flex-1 overflow-y-auto text-xs flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="font-bold text-slate-700">Nama Workflow *</label>
                                        <input
                                            type="text"
                                            value={workflowForm.name}
                                            onChange={(e) =>
                                                setWorkflowForm({ ...workflowForm, name: e.target.value })
                                            }
                                            placeholder="Contoh: Workflow Wedding Standard"
                                            className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B46F1] outline-hidden font-medium"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="font-bold text-slate-700">Jumlah Tahapan *</label>
                                            <select
                                                value={workflowForm.steps_count}
                                                onChange={(e) => {
                                                    const count = Number(e.target.value);
                                                    const currentSteps = [...workflowForm.steps];
                                                    while (currentSteps.length < count) {
                                                        const num = currentSteps.length + 1;
                                                        currentSteps.push({
                                                            id: num,
                                                            num: num,
                                                            name: `Tahap ${num}`,
                                                            phase: 'Operasional',
                                                            duration: 'H+14',
                                                            activity: '',
                                                        });
                                                    }
                                                    setWorkflowForm({
                                                        ...workflowForm,
                                                        steps_count: count,
                                                        steps: currentSteps,
                                                    });
                                                }}
                                                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold cursor-pointer"
                                            >
                                                {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                                    <option key={n} value={n}>
                                                        {n} Tahapan Alur Kerja
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="font-bold text-slate-700">Status</label>
                                            <select
                                                value={workflowForm.status}
                                                onChange={(e) =>
                                                    setWorkflowForm({
                                                        ...workflowForm,
                                                        status: e.target.value as any,
                                                    })
                                                }
                                                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium cursor-pointer"
                                            >
                                                <option value="Aktif">Aktif</option>
                                                <option value="Nonaktif">Nonaktif</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="font-bold text-slate-700">Deskripsi Workflow</label>
                                        <textarea
                                            rows={2}
                                            value={workflowForm.description}
                                            onChange={(e) =>
                                                setWorkflowForm({
                                                    ...workflowForm,
                                                    description: e.target.value,
                                                })
                                            }
                                            placeholder="Deskripsi singkat alur kerja ini..."
                                            className="w-full p-2.5 rounded-xl border border-slate-200"
                                        />
                                    </div>

                                    {/* Dynamic Step Detail Input with Target Deadline & Activity */}
                                    <div className="space-y-3 pt-3 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <label className="font-bold text-slate-800 text-xs">
                                                Detail &amp; Target Deadline Setiap Tahap:
                                            </label>
                                            <span className="text-[10px] text-slate-400">
                                                {workflowForm.steps_count} Tahap Terkonfigurasi
                                            </span>
                                        </div>

                                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                                            {Array.from({ length: workflowForm.steps_count }).map((_, idx) => {
                                                const s = workflowForm.steps[idx] || {
                                                    id: idx + 1,
                                                    num: idx + 1,
                                                    name: '',
                                                    phase: 'Operasional',
                                                    duration: 'H+14',
                                                    activity: '',
                                                };

                                                const updateStepField = (field: keyof WorkflowStepItem, value: any) => {
                                                    const updatedSteps = [...workflowForm.steps];
                                                    while (updatedSteps.length <= idx) {
                                                        const num = updatedSteps.length + 1;
                                                        updatedSteps.push({
                                                            id: num,
                                                            num: num,
                                                            name: `Tahap ${num}`,
                                                            phase: 'Operasional',
                                                            duration: 'H+14',
                                                            activity: '',
                                                        });
                                                    }
                                                    updatedSteps[idx] = {
                                                        ...updatedSteps[idx],
                                                        [field]: value,
                                                    };
                                                    setWorkflowForm({
                                                        ...workflowForm,
                                                        steps: updatedSteps,
                                                    });
                                                };

                                                const deadlinePresets = [
                                                    'H-14 s/d H-1',
                                                    'Hari H',
                                                    'H+1 s/d H+3',
                                                    'H+7 s/d H+21',
                                                    'H+21 s/d H+30',
                                                    'H+30 s/d H+45',
                                                    'H+45 s/d H+60',
                                                    'H+14',
                                                ];

                                                return (
                                                    <div
                                                        key={idx}
                                                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2.5"
                                                    >
                                                        <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-5 h-5 rounded-full bg-[#3B46F1] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                                                    {idx + 1}
                                                                </span>
                                                                <span className="font-bold text-slate-800 text-xs">
                                                                    Tahap #{idx + 1}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                                                {s.duration || 'H+14'}
                                                            </span>
                                                        </div>

                                                        {/* Row 1: Nama & Fase */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-slate-600">
                                                                    Nama Tahapan *
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={s.name || ''}
                                                                    onChange={(e) => updateStepField('name', e.target.value)}
                                                                    placeholder="Contoh: Booking & Briefing"
                                                                    className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white font-semibold"
                                                                    required
                                                                />
                                                            </div>

                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-bold text-slate-600">
                                                                    Fase Proyek
                                                                </label>
                                                                <select
                                                                    value={s.phase || 'Pra-Acara'}
                                                                    onChange={(e) => updateStepField('phase', e.target.value)}
                                                                    className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white font-medium cursor-pointer"
                                                                >
                                                                    <option value="Pra-Acara">Pra-Acara</option>
                                                                    <option value="Hari H">Hari H</option>
                                                                    <option value="Hari H Sesi 1">Hari H Sesi 1</option>
                                                                    <option value="Hari H Sesi 2">Hari H Sesi 2</option>
                                                                    <option value="Pasca-Produksi">Pasca-Produksi</option>
                                                                    <option value="Review">Review</option>
                                                                    <option value="Finishing">Finishing</option>
                                                                    <option value="Selesai">Selesai</option>
                                                                    <option value="Operasional">Operasional</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        {/* Row 2: Target Deadline & Quick Presets */}
                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] font-bold text-slate-600 flex items-center justify-between">
                                                                <span>Target Deadline / Durasi Waktu *</span>
                                                                <span className="text-[9px] text-slate-400">Bisa ketik bebas atau klik preset</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={s.duration || ''}
                                                                onChange={(e) => updateStepField('duration', e.target.value)}
                                                                placeholder="Contoh: H-14 s/d H-1, Hari H, H+1 s/d H+3, H+21, dll"
                                                                className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white font-mono font-bold text-indigo-700"
                                                                required
                                                            />
                                                            {/* Quick presets */}
                                                            <div className="flex flex-wrap gap-1 pt-0.5">
                                                                {deadlinePresets.map((preset) => (
                                                                    <button
                                                                        key={preset}
                                                                        type="button"
                                                                        onClick={() => updateStepField('duration', preset)}
                                                                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                                                                            s.duration === preset
                                                                                ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                                                                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                                                        }`}
                                                                    >
                                                                        {preset}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Row 3: Aktivitas Tim */}
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-600">
                                                                Aktivitas Tim Operasional
                                                            </label>
                                                            <textarea
                                                                rows={2}
                                                                value={s.activity || ''}
                                                                onChange={(e) => updateStepField('activity', e.target.value)}
                                                                placeholder="Uraian tugas dan instruksi kerja operasional tim..."
                                                                className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white leading-relaxed"
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        disabled={isProcessing}
                                        onClick={() => setIsWorkflowDrawerOpen(false)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#3B46F1] hover:bg-[#323BD8] disabled:opacity-50 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
                                    >
                                        {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        <span>{editingWorkflow ? 'Simpan ke Database' : 'Simpan Workflow'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
