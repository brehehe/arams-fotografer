import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Calendar as CalendarIcon,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    Check,
    CheckCircle2,
    Clock,
    DollarSign,
    ExternalLink,
    HelpCircle,
    Info,
    MapPin,
    Plus,
    Trash2,
    X,
    ArrowUpRight,
    Search,
    FileText,
    Receipt,
    Gift,
    Briefcase,
    Camera,
    Video,
    Sparkles,
    User as UserIcon,
    Users,
    ArrowRight,
    ArrowLeft,
    Percent,
    Edit3,
    Database,
    PackagePlus,
    Minus,
    Layers,
    Upload,
    Image as ImageIcon,
} from 'lucide-react';
import { SelectSearch, SelectSearchOption } from '@/components/ui/select-search';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';
import { formatRupiah } from '@/lib/formatters';
import { resolveWorkflow } from '@/lib/workflows';

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
    included_services?: any[];
    included_deliverables?: any[];
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
    type?: string | null;
    category_id?: string | null;
    category?: { id: string; name: string } | null;
    price: number | string;
    unit: string;
    description?: string | null;
}

interface ClientSourceItem {
    id: string;
    name: string;
    type?: string;
    phone?: string | null;
    email?: string | null;
}

interface ServiceItem {
    id: string;
    name: string;
    category_id?: string | null;
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
    client_sources?: ClientSourceItem[];
    services?: ServiceItem[];
    supervisors?: UserItem[];
    team_members?: UserItem[];
    payment_methods?: PaymentMethodItem[];
    company_settings?: CompanySettings;
    next_project_number?: string;
    next_invoice_number?: string;
    workflow_definitions?: any[];
    initial_client_id?: string;
    initial_wo_id?: string;
    initial_category_id?: string;
    initial_package_id?: string;
}

interface SelectedAddonItem {
    id: string;
    name: string;
    unit: string;
    unit_price: number;
    qty: number;
    subtotal: number;
    selected: boolean;
    is_custom?: boolean;
}

interface OperationalExpenseItem {
    id: string;
    type: string;
    description: string;
    estimated_cost: number;
    addon_id?: string | null;
    is_custom?: boolean;
}

export default function ProjectsCreate({
    clients = [],
    categories = [],
    packages = [],
    wedding_organizers = [],
    addons = [],
    client_sources = [],
    services = [],
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
    next_project_number = 'PJ-260826-001',
    next_invoice_number = 'INV/DP/260826/001',
    workflow_definitions = [],
    initial_client_id = '',
    initial_wo_id = '',
    initial_category_id = '',
    initial_package_id = '',
}: ProjectsCreateProps) {
    const [submitting, setSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

    // Initial Defaults from Master Data
    const defaultClient = clients.find((c) => String(c.id) === String(initial_client_id)) || clients[0] || null;
    const defaultCategory = categories.find((c) => String(c.id) === String(initial_category_id)) || categories[0] || null;
    const defaultSupervisor =
        supervisors.find((u: UserItem) => u.name.toLowerCase().includes('aditya') || u.name.toLowerCase().includes('pratama')) ||
        supervisors[0] ||
        team_members[0] ||
        null;
    const defaultPhotographer =
        team_members.find((u: UserItem) => u.role?.toLowerCase().includes('photo'))?.name ||
        team_members[0]?.name ||
        '';
    const defaultEditor =
        team_members.find((u: UserItem) => u.role?.toLowerCase().includes('edit'))?.name ||
        team_members[1]?.name ||
        '';
    const defaultPaymentMethod = payment_methods[0] || null;

    // ── STEP 1: FORM STATES ──────────────────────────────────────────────
    const todayStr = new Date().toISOString().substring(0, 10);
    const [projectDate, setProjectDate] = useState<string>(todayStr);
    const [projectName, setProjectName] = useState<string>(
        defaultClient ? `The Wedding of ${defaultClient.name}` : ''
    );
    const [clientId, setClientId] = useState<string>(initial_client_id || defaultClient?.id || '');
    const [categoryId, setCategoryId] = useState<string>(initial_category_id || defaultCategory?.id || '');
    const [packageId, setPackageId] = useState<string>(initial_package_id || '');
    const [projectLocation, setProjectLocation] = useState<string>('');
    const [projectNotes, setProjectNotes] = useState<string>('');
    const [referralSource, setReferralSource] = useState<string>(client_sources[0]?.name || '');
    const [referralName, setReferralName] = useState<string>('');
    const [referralLink, setReferralLink] = useState<string>('');

    // Optional Project Cover Image / Thumbnail
    const [projectThumbnail, setProjectThumbnail] = useState<string>('');
    const thumbnailInputRef = React.useRef<HTMLInputElement | null>(null);

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ukuran foto maksimal 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
            const dataUrl = uploadEvent.target?.result as string;
            setProjectThumbnail(dataUrl);
            toast.success('Foto cover project berhasil dipilih');
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveThumbnail = () => {
        setProjectThumbnail('');
        if (thumbnailInputRef.current) {
            thumbnailInputRef.current.value = '';
        }
    };

    // Step 1 Bottom Row
    const [additionalNotes, setAdditionalNotes] = useState<string>('');
    const [visibleFor, setVisibleFor] = useState<{ supervisor: boolean; photographer: boolean; editor: boolean; client: boolean }>({
        supervisor: true,
        photographer: true,
        editor: false,
        client: false,
    });
    const [specialRequirement, setSpecialRequirement] = useState<string>('');

    // Financial in Step 1
    const [discountPackage, setDiscountPackage] = useState<number>(0);
    const [dpPercent, setDpPercent] = useState<number>(50);
    const [paymentMethodName, setPaymentMethodName] = useState<string>(defaultPaymentMethod?.name || 'Transfer BCA');
    const [bankAccount, setBankAccount] = useState<string>(
        defaultPaymentMethod?.account_number
            ? `${defaultPaymentMethod.name} - ${defaultPaymentMethod.account_number}`
            : 'BCA - 8820192837'
    );
    const [accountHolder, setAccountHolder] = useState<string>(
        defaultPaymentMethod?.account_holder || company_settings.name
    );
    const [dpDueDate, setDpDueDate] = useState<string>(todayStr);

    // ── STEP 2: PERSONEL & PENUGASAN ─────────────────────────────────────
    const [supervisorId, setSupervisorId] = useState<string>(defaultSupervisor?.id || '');
    const [photographerName, setPhotographerName] = useState<string>(defaultPhotographer);
    const [editorName, setEditorName] = useState<string>(defaultEditor);
    const [shootingEventDate, setShootingEventDate] = useState<string>(todayStr);
    const [shootingDuration, setShootingDuration] = useState<string>('12 Jam');
    const [assignmentNotes, setAssignmentNotes] = useState<string>('');

    // Step 2 Requirement Checkboxes
    const [step2Requirements, setStep2Requirements] = useState<{ [key: string]: boolean }>({
        briefing: true,
        survey: true,
        rundown: true,
        props: true,
        wo_coordination: true,
        backup_data: true,
    });

    // ── STEP 3: ADD-ON & BIAYA OPERASIONAL (Dynamic from Database & Custom) ──
    const [addonsList, setAddonsList] = useState<SelectedAddonItem[]>([]);
    const [operationalExpenses, setOperationalExpenses] = useState<OperationalExpenseItem[]>([]);
    const [additionalCostNotes, setAdditionalCostNotes] = useState<string>('');

    // Tax (Pajak PPN / PPh) State
    const [isTaxEnabled, setIsTaxEnabled] = useState<boolean>(false);
    const [taxPercent, setTaxPercent] = useState<number>(11);
    const [taxType, setTaxType] = useState<'percent' | 'custom'>('percent');
    const [customTaxAmount, setCustomTaxAmount] = useState<number>(0);

    // Modal: Tambah Add-on
    const [addAddonModalOpen, setAddAddonModalOpen] = useState(false);
    const [addonModalTab, setAddonModalTab] = useState<'database' | 'custom'>('database');
    const [selectedMasterAddonId, setSelectedMasterAddonId] = useState<string>('');
    const [masterAddonQty, setMasterAddonQty] = useState<number>(1);
    const [newAddonForm, setNewAddonForm] = useState({ name: '', unit: 'Item', price: 500000, qty: 1 });

    // Modal: Tambah Biaya Operasional
    const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);
    const [expenseModalTab, setExpenseModalTab] = useState<'database' | 'custom'>('database');
    const [selectedMasterOpsId, setSelectedMasterOpsId] = useState<string>('');
    const [presetExpenseDescription, setPresetExpenseDescription] = useState<string>('');
    const [presetExpenseCost, setPresetExpenseCost] = useState<number>(0);
    const [newExpenseForm, setNewExpenseForm] = useState({ type: '', description: '', cost: 250000 });

    // Modal: Quick Tambah Klien
    const [addClientModalOpen, setAddClientModalOpen] = useState(false);
    const [newClientForm, setNewClientForm] = useState({ name: '', phone: '', email: '', city: 'Jakarta' });

    // Success Modal Overlay
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdResult, setCreatedResult] = useState<{
        projectId?: string;
        projectNumber: string;
        projectName: string;
        invoiceId?: string;
        invoiceNumber: string;
        nominalDp: number;
    } | null>(null);

    // Selected Entities
    const selectedClient = useMemo(() => {
        return clients.find((c) => String(c.id) === String(clientId)) || defaultClient;
    }, [clients, clientId, defaultClient]);

    const selectedCategory = useMemo(() => {
        return categories.find((c) => String(c.id) === String(categoryId)) || defaultCategory;
    }, [categories, categoryId, defaultCategory]);

    const availablePackages = useMemo(() => {
        if (!categoryId) return packages;
        const filtered = packages.filter((p) => String(p.category_id) === String(categoryId));
        return filtered.length > 0 ? filtered : packages;
    }, [packages, categoryId]);

    const selectedPackage = useMemo(() => {
        if (packageId) {
            const found = availablePackages.find((p) => String(p.id) === String(packageId));
            if (found) return found;
        }
        return availablePackages[0] || null;
    }, [availablePackages, packageId]);

    const packagePrice = useMemo(() => {
        return Number(selectedPackage?.base_price) || 0;
    }, [selectedPackage]);

    // Dynamic Workflow definition according to selected Category & Package
    const activeWorkflow = useMemo(() => {
        return resolveWorkflow(selectedCategory, workflow_definitions);
    }, [selectedCategory, workflow_definitions]);

    // Dynamic Services & Deliverables from Master Data Package
    const servicesList = useMemo(() => {
        if (selectedPackage?.included_services && Array.isArray(selectedPackage.included_services) && selectedPackage.included_services.length > 0) {
            return selectedPackage.included_services.map((s: any) =>
                typeof s === 'string' ? s : (s?.name || String(s))
            );
        }
        if (services && services.length > 0) {
            const catServices = services.filter((s) => !s.category_id || String(s.category_id) === String(categoryId));
            if (catServices.length > 0) {
                return catServices.map((s) => s.name);
            }
        }
        return [];
    }, [selectedPackage, services, categoryId]);

    const deliverablesList = useMemo(() => {
        if (selectedPackage?.included_deliverables && Array.isArray(selectedPackage.included_deliverables) && selectedPackage.included_deliverables.length > 0) {
            return selectedPackage.included_deliverables.map((item: any, idx: number) => {
                if (typeof item === 'string') {
                    return {
                        id: idx + 1,
                        name: item,
                        deadline: 'H+14',
                        type: 'Photo',
                        description: '',
                    };
                }
                return {
                    id: item.id || idx + 1,
                    name: item.name || 'Deliverable Item',
                    deadline: item.deadline || item.target_deadline || 'H+14',
                    type: item.type || 'Photo',
                    description: item.description || '',
                };
            });
        }
        return [];
    }, [selectedPackage]);

    // Financial Calculations
    const totalAddonAmount = useMemo(() => {
        return addonsList
            .filter((a) => a.selected && a.qty > 0)
            .reduce((acc, curr) => acc + curr.subtotal, 0);
    }, [addonsList]);

    const totalOperationalAmount = useMemo(() => {
        return operationalExpenses.reduce((acc, curr) => acc + Number(curr.estimated_cost || 0), 0);
    }, [operationalExpenses]);

    const totalTambahanBiaya = useMemo(() => {
        return totalAddonAmount + totalOperationalAmount;
    }, [totalAddonAmount, totalOperationalAmount]);

    const subtotalPaketSetelahDiskon = useMemo(() => {
        return Math.max(0, packagePrice - (discountPackage || 0));
    }, [packagePrice, discountPackage]);

    const taxBaseAmount = useMemo(() => {
        return subtotalPaketSetelahDiskon + totalTambahanBiaya;
    }, [subtotalPaketSetelahDiskon, totalTambahanBiaya]);

    const calculatedTaxAmount = useMemo(() => {
        if (!isTaxEnabled) return 0;
        if (taxType === 'custom') return customTaxAmount;
        return Math.round((taxBaseAmount * taxPercent) / 100);
    }, [isTaxEnabled, taxType, customTaxAmount, taxBaseAmount, taxPercent]);

    const totalProject = useMemo(() => {
        return subtotalPaketSetelahDiskon + totalTambahanBiaya + calculatedTaxAmount;
    }, [subtotalPaketSetelahDiskon, totalTambahanBiaya, calculatedTaxAmount]);

    const nominalDp = useMemo(() => {
        if (dpPercent <= 0) return 0;
        return Math.round((totalProject * dpPercent) / 100);
    }, [totalProject, dpPercent]);

    // Format dates for display
    const formattedProjectDate = useMemo(() => {
        if (!projectDate) return '';
        const parts = projectDate.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : projectDate;
    }, [projectDate]);

    const formattedShootingDate = useMemo(() => {
        if (!shootingEventDate) return '';
        const parts = shootingEventDate.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : shootingEventDate;
    }, [shootingEventDate]);

    const formattedDpDueDate = useMemo(() => {
        if (!dpDueDate) return '-';
        const parts = dpDueDate.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dpDueDate;
    }, [dpDueDate]);

    // ── SELECT SEARCH OPTIONS MAPPING (100% Database Master Data) ────────
    const clientOptions = useMemo<SelectSearchOption[]>(() => {
        return clients.map((c) => ({
            value: String(c.id),
            label: c.name,
            subtitle: [c.phone, c.city].filter(Boolean).join(' • '),
        }));
    }, [clients]);

    const categoryOptions = useMemo<SelectSearchOption[]>(() => {
        return categories.map((cat) => ({
            value: String(cat.id),
            label: cat.name,
        }));
    }, [categories]);

    const packageOptions = useMemo<SelectSearchOption[]>(() => {
        return availablePackages.map((pkg) => ({
            value: String(pkg.id),
            label: pkg.name,
            subtitle: `${formatRupiah(pkg.base_price)} • Standby ${pkg.duration_hours || 12} Jam`,
        }));
    }, [availablePackages]);

    const supervisorOptions = useMemo<SelectSearchOption[]>(() => {
        const pool = supervisors.length > 0 ? supervisors : team_members;
        return pool.map((s: UserItem) => ({
            value: String(s.id),
            label: s.name,
            subtitle: s.email,
        }));
    }, [supervisors, team_members]);

    const photographerOptions = useMemo<SelectSearchOption[]>(() => {
        const pool = team_members.length > 0 ? team_members : supervisors;
        return pool.map((u: UserItem) => ({
            value: u.name,
            label: u.name,
            subtitle: `${u.role || 'Crew'} • ${u.email}`,
        }));
    }, [team_members, supervisors]);

    const editorOptions = useMemo<SelectSearchOption[]>(() => {
        const pool = team_members.length > 0 ? team_members : supervisors;
        return pool.map((u: UserItem) => ({
            value: u.name,
            label: u.name,
            subtitle: `${u.role || 'Editor'} • ${u.email}`,
        }));
    }, [team_members, supervisors]);

    const dpPercentOptions: SelectSearchOption[] = [
        { value: '20', label: '20% DP' },
        { value: '30', label: '30% DP' },
        { value: '50', label: '50% DP (Rekomendasi)' },
        { value: '100', label: '100% (Pelunasan Penuh)' },
    ];

    const paymentMethodOptions = useMemo<SelectSearchOption[]>(() => {
        if (payment_methods && payment_methods.length > 0) {
            return payment_methods.map((pm) => ({
                value: pm.name,
                label: pm.name,
                subtitle: pm.account_number ? `${pm.account_number} • a.n. ${pm.account_holder || company_settings.name}` : pm.code || 'Metode Pembayaran',
            }));
        }
        return [
            { value: 'Transfer BCA', label: 'Transfer BCA', subtitle: '8820192837 • PT Arams Kreatif Nusantara' },
            { value: 'Transfer Mandiri', label: 'Transfer Mandiri', subtitle: '1370019283921 • PT Arams Kreatif Nusantara' },
            { value: 'Kas Tunai', label: 'Kas Tunai / Cash', subtitle: 'Studio / Kantor' },
            { value: 'QRIS', label: 'QRIS / Instant', subtitle: 'Scan QRIS e-wallet' },
        ];
    }, [payment_methods, company_settings]);

    const shootingDurationOptions: SelectSearchOption[] = [
        { value: '4 Jam', label: '4 Jam', subtitle: 'Liputan Sesi Singkat' },
        { value: '8 Jam', label: '8 Jam', subtitle: 'Setengah Hari' },
        { value: '12 Jam', label: '12 Jam', subtitle: 'Standar Hari H' },
        { value: 'Full Day', label: 'Full Day', subtitle: 'Liputan Penuh Seharian' },
    ];

    const referralSourceOptions = useMemo<SelectSearchOption[]>(() => {
        if (client_sources && client_sources.length > 0) {
            return client_sources.map((cs) => ({
                value: cs.name,
                label: cs.name,
                subtitle: cs.type ? `Tipe: ${cs.type}` : cs.phone || undefined,
            }));
        }
        return [
            { value: 'Instagram', label: 'Instagram', subtitle: '@arams.pictures' },
            { value: 'Wedding Organizer Indah', label: 'Wedding Organizer Indah', subtitle: 'Partner WO' },
            { value: 'Rekomendasi Teman', label: 'Rekomendasi Teman / Klien' },
            { value: 'Bridestory', label: 'Bridestory' },
            { value: 'Google Search', label: 'Google Search' },
        ];
    }, [client_sources]);

    // Auto update project name when client changes
    const handleClientChange = (newClientId: string) => {
        setClientId(newClientId);
        const cl = clients.find((c) => String(c.id) === String(newClientId));
        if (cl) {
            setProjectName(`The Wedding of ${cl.name}`);
        }
    };

    const handleCategoryChange = (newCatId: string) => {
        setCategoryId(newCatId);
        const pkgs = packages.filter((p) => String(p.category_id) === String(newCatId));
        if (pkgs.length > 0) {
            setPackageId(String(pkgs[0].id));
        }
    };

    const handlePaymentMethodChange = (pmName: string) => {
        setPaymentMethodName(pmName);
        const found = payment_methods.find((pm) => pm.name === pmName);
        if (found) {
            if (found.account_number) {
                setBankAccount(`${found.name} - ${found.account_number}`);
            }
            if (found.account_holder) {
                setAccountHolder(found.account_holder);
            }
        }
    };

    // Helper icon resolver for operational expenses
    const getExpenseIcon = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('transport') || lower.includes('bensin') || lower.includes('perjalanan')) return '🚗';
        if (lower.includes('akomodasi') || lower.includes('hotel') || lower.includes('penginapan')) return '🏨';
        if (lower.includes('konsumsi') || lower.includes('makan') || lower.includes('minum')) return '🍽️';
        if (lower.includes('toll') || lower.includes('tol') || lower.includes('parkir')) return '🅿️';
        if (lower.includes('sewa') || lower.includes('alat') || lower.includes('lighting') || lower.includes('lensa')) return '📷';
        if (lower.includes('crew') || lower.includes('freelance') || lower.includes('personel') || lower.includes('asisten') || lower.includes('fotografer') || lower.includes('videografer')) return '👥';
        if (lower.includes('cetak') || lower.includes('vendor') || lower.includes('photobooth') || lower.includes('album')) return '🖨️';
        if (lower.includes('izin') || lower.includes('retribusi') || lower.includes('tiket') || lower.includes('lokasi')) return '🎫';
        return '💰';
    };

    // Master Add-on Selection Options from Database (Filtered: type === 'addon' or non-operational)
    const masterAddonOptions = useMemo<SelectSearchOption[]>(() => {
        if (!addons || addons.length === 0) return [];
        const alaCarteAddons = addons.filter((a) => a.type !== 'operational');
        return alaCarteAddons.map((a) => ({
            value: String(a.id),
            label: a.name,
            subtitle: `${formatRupiah(Number(a.price) || 0)} / ${a.unit || 'Item'} ${a.category?.name ? `• ${a.category.name}` : ''}`,
        }));
    }, [addons]);

    const selectedMasterAddon = useMemo(() => {
        if (!selectedMasterAddonId) return null;
        return addons.find((a) => String(a.id) === String(selectedMasterAddonId)) || null;
    }, [addons, selectedMasterAddonId]);

    // Master Operational Selection Options from Database (type === 'operational')
    const masterOpsOptions = useMemo<SelectSearchOption[]>(() => {
        if (!addons || addons.length === 0) return [];
        const ops = addons.filter((a) => a.type === 'operational');
        return ops.map((a) => ({
            value: String(a.id),
            label: a.name,
            subtitle: `${formatRupiah(Number(a.price) || 0)} / ${a.unit || 'Item'} • ${a.description || ''}`,
        }));
    }, [addons]);

    const selectedMasterOps = useMemo(() => {
        if (!selectedMasterOpsId) return null;
        return addons.find((a) => String(a.id) === String(selectedMasterOpsId)) || null;
    }, [addons, selectedMasterOpsId]);

    const handleSelectMasterOps = (opsId: string) => {
        setSelectedMasterOpsId(opsId);
        const found = addons.find((a) => String(a.id) === String(opsId));
        if (found) {
            setPresetExpenseDescription(found.description || found.name);
            setPresetExpenseCost(Number(found.price) || 0);
        }
    };

    // Add-on Handlers
    const handleAddonQtyChange = (id: string, newQty: number) => {
        const qty = Math.max(1, newQty);
        setAddonsList((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    return {
                        ...item,
                        qty,
                        selected: true,
                        subtotal: qty * item.unit_price,
                    };
                }
                return item;
            })
        );
    };

    const handleDeleteAddon = (id: string) => {
        setAddonsList((prev) => prev.filter((item) => item.id !== id));
        toast.info('Add-on dihapus dari project');
    };

    // Add Master Add-on from Database
    const handleAddMasterAddon = () => {
        if (!selectedMasterAddon) {
            toast.error('Silakan pilih Add-on dari Master Data');
            return;
        }
        const qtyToAdd = Math.max(1, masterAddonQty || 1);
        const existingIndex = addonsList.findIndex((a) => String(a.id) === String(selectedMasterAddon.id));

        if (existingIndex >= 0) {
            setAddonsList((prev) =>
                prev.map((item, idx) => {
                    if (idx === existingIndex) {
                        const newQty = item.qty + qtyToAdd;
                        return {
                            ...item,
                            qty: newQty,
                            selected: true,
                            subtotal: newQty * item.unit_price,
                        };
                    }
                    return item;
                })
            );
            toast.success(`Jumlah ${selectedMasterAddon.name} diperbarui (+${qtyToAdd})`);
        } else {
            const newAddonItem: SelectedAddonItem = {
                id: selectedMasterAddon.id,
                name: selectedMasterAddon.name,
                unit: selectedMasterAddon.unit || 'Item',
                unit_price: Number(selectedMasterAddon.price) || 0,
                qty: qtyToAdd,
                subtotal: qtyToAdd * (Number(selectedMasterAddon.price) || 0),
                selected: true,
                is_custom: false,
            };
            setAddonsList((prev) => [...prev, newAddonItem]);
            toast.success(`${selectedMasterAddon.name} berhasil ditambahkan`);
        }

        setSelectedMasterAddonId('');
        setMasterAddonQty(1);
        setAddAddonModalOpen(false);
    };

    // Add Custom Add-on
    const handleCreateCustomAddon = () => {
        if (!newAddonForm.name.trim()) {
            toast.error('Nama Add-on wajib diisi');
            return;
        }
        const qty = Math.max(1, newAddonForm.qty || 1);
        const unitPrice = Number(newAddonForm.price) || 0;
        const newAddon: SelectedAddonItem = {
            id: `custom-addon-${Date.now()}`,
            name: newAddonForm.name.trim(),
            unit: newAddonForm.unit.trim() || 'Item',
            unit_price: unitPrice,
            qty: qty,
            subtotal: qty * unitPrice,
            selected: true,
            is_custom: true,
        };
        setAddonsList((prev) => [...prev, newAddon]);
        setNewAddonForm({ name: '', unit: 'Item', price: 500000, qty: 1 });
        setAddAddonModalOpen(false);
        toast.success('Add-on kustom berhasil ditambahkan');
    };

    // Operational Expense Handlers
    const handleDeleteExpense = (id: string) => {
        setOperationalExpenses((prev) => prev.filter((item) => item.id !== id));
        toast.info('Biaya operasional dihapus');
    };

    // Add Master Operational Expense from Database
    const handleAddMasterOps = () => {
        if (!selectedMasterOps) {
            toast.error('Silakan pilih Biaya Operasional dari Master Data');
            return;
        }
        const cost = Number(presetExpenseCost) || 0;
        const desc = presetExpenseDescription.trim() || selectedMasterOps.description || selectedMasterOps.name;

        const newExp: OperationalExpenseItem = {
            id: `exp-${Date.now()}`,
            addon_id: selectedMasterOps.id,
            type: selectedMasterOps.name,
            description: desc,
            estimated_cost: cost,
            is_custom: false,
        };
        setOperationalExpenses((prev) => [...prev, newExp]);
        setSelectedMasterOpsId('');
        setPresetExpenseDescription('');
        setPresetExpenseCost(0);
        setAddExpenseModalOpen(false);
        toast.success(`Biaya ${selectedMasterOps.name} berhasil ditambahkan`);
    };

    // Add Custom Expense
    const handleCreateCustomExpense = () => {
        if (!newExpenseForm.type.trim()) {
            toast.error('Jenis biaya wajib diisi');
            return;
        }
        const newExp: OperationalExpenseItem = {
            id: `custom-exp-${Date.now()}`,
            addon_id: null,
            type: newExpenseForm.type.trim(),
            description: newExpenseForm.description.trim() || '-',
            estimated_cost: Number(newExpenseForm.cost) || 0,
            is_custom: true,
        };
        setOperationalExpenses((prev) => [...prev, newExp]);
        setNewExpenseForm({ type: '', description: '', cost: 250000 });
        setAddExpenseModalOpen(false);
        toast.success('Biaya operasional kustom berhasil ditambahkan');
    };

    // Create New Client Quick Modal
    const handleQuickCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClientForm.name.trim()) {
            toast.error('Nama klien wajib diisi');
            return;
        }
        try {
            const res = await fetch('/clients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify(newClientForm),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Klien baru berhasil ditambahkan');
                const createdId = data.client?.id || data.id || `client-${Date.now()}`;
                clients.unshift({
                    id: createdId,
                    name: newClientForm.name,
                    phone: newClientForm.phone,
                    email: newClientForm.email,
                    city: newClientForm.city,
                });
                setClientId(createdId);
                setProjectName(`The Wedding of ${newClientForm.name}`);
                setAddClientModalOpen(false);
                setNewClientForm({ name: '', phone: '', email: '', city: 'Jakarta' });
            } else {
                toast.error(data.message || 'Gagal menambahkan klien');
            }
        } catch {
            const fakeId = `client-${Date.now()}`;
            clients.unshift({
                id: fakeId,
                name: newClientForm.name,
                phone: newClientForm.phone,
                email: newClientForm.email,
                city: newClientForm.city,
            });
            setClientId(fakeId);
            setProjectName(`The Wedding of ${newClientForm.name}`);
            setAddClientModalOpen(false);
            toast.success('Klien baru dipilih');
        }
    };

    // Step Validation
    const validateStep1 = () => {
        if (!projectName.trim()) {
            toast.error('Nama Project wajib diisi');
            return false;
        }
        if (!clientId) {
            toast.error('Silakan pilih Klien');
            return false;
        }
        if (!categoryId) {
            toast.error('Silakan pilih Kategori Project');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!supervisorId) {
            toast.error('Silakan pilih Supervisor');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (currentStep === 1) {
            if (!validateStep1()) return;
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!validateStep2()) return;
            setCurrentStep(3);
        } else if (currentStep === 3) {
            setCurrentStep(4);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as any);
        }
    };

    // Form Submission
    const handleFinalSubmit = async (isDraft = false) => {
        if (isDraft) {
            if (!projectName.trim()) {
                toast.error('Nama Project wajib diisi untuk menyimpan draft');
                return;
            }
            if (!clientId) {
                toast.error('Silakan pilih Klien terlebih dahulu untuk menyimpan draft');
                return;
            }
            if (!categoryId) {
                toast.error('Silakan pilih Kategori Project untuk menyimpan draft');
                return;
            }
        } else {
            if (!validateStep1() || !validateStep2()) return;
        }

        setSubmitting(true);

        const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

        const selectedAddonsPayload = [
            ...addonsList
                .filter((a) => a.selected && a.qty > 0)
                .map((a) => ({
                    id: isUuid(a.id) ? a.id : null,
                    name: a.name,
                    is_custom: a.is_custom || !isUuid(a.id),
                    qty: a.qty,
                    unit: a.unit,
                    unit_price: a.unit_price,
                    total_price: a.subtotal,
                })),
            ...operationalExpenses.map((exp) => ({
                id: exp.addon_id && isUuid(exp.addon_id) ? exp.addon_id : null,
                name: `Biaya Operasional: ${exp.type} (${exp.description})`,
                is_custom: exp.is_custom !== false,
                qty: 1,
                unit: 'ops',
                unit_price: exp.estimated_cost,
                total_price: exp.estimated_cost,
            })),
        ];

        const payload = {
            name: projectName.trim(),
            client_id: clientId,
            category_id: categoryId,
            package_id: selectedPackage?.id || null,
            event_date: shootingEventDate || projectDate || null,
            created_at_date: projectDate || null,
            deadline: dpDueDate || null,
            location: projectLocation || null,
            supervisor_id: supervisorId || null,
            photographer_name: photographerName || null,
            editor_name: editorName || null,
            status: isDraft ? 'draft' : 'in_progress',
            price: packagePrice,
            discount: discountPackage,
            tax: calculatedTaxAmount,
            total_amount: totalProject,
            thumbnail: projectThumbnail || null,
            dp_amount: nominalDp,
            payment_method: paymentMethodName,
            payment_status: nominalDp > 0 ? 'partial' : 'unpaid',
            invoice_type: 'dp',
            invoice_amount: nominalDp,
            invoice_due_date: dpDueDate || null,
            notes: [
                projectNotes,
                additionalNotes ? `Catatan Tambahan: ${additionalNotes}` : '',
                specialRequirement ? `Requirement: ${specialRequirement}` : '',
                referralSource ? `Sumber Referensi: ${referralSource} (${referralName} - ${referralLink})` : '',
                additionalCostNotes ? `Catatan Biaya: ${additionalCostNotes}` : '',
            ]
                .filter(Boolean)
                .join('\n\n'),
            selected_addons: selectedAddonsPayload,
        };

        try {
            const res = await fetch('/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify(payload),
            });

            const json = await res.json();

            if (res.ok && json.success) {
                if (isDraft) {
                    toast.success('Draft project berhasil disimpan!');
                    router.visit(json.project?.id ? `/projects/${json.project.id}` : '/projects?tab=draft');
                    return;
                }
                setCreatedResult({
                    projectId: json.project?.id,
                    projectNumber: json.project?.project_number || next_project_number,
                    projectName: json.project?.name || projectName,
                    invoiceId: json.invoice?.id,
                    invoiceNumber: json.invoice?.invoice_number || next_invoice_number,
                    nominalDp: json.invoice?.total || nominalDp,
                });
                setShowSuccessModal(true);
            } else {
                router.post('/projects', payload as any, {
                    onSuccess: () => {
                        toast.success(isDraft ? 'Draft project berhasil disimpan!' : 'Project berhasil disimpan!');
                    },
                    onError: () => {
                        toast.error('Periksa kembali input form Anda.');
                    },
                });
            }
        } catch {
            router.post('/projects', payload as any, {
                onSuccess: () => {
                    toast.success(isDraft ? 'Draft project berhasil disimpan!' : 'Project berhasil disimpan!');
                },
                onError: () => {
                    toast.error('Periksa kembali kelengkapan form.');
                },
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-full space-y-5 pb-12">
            <Head title="Buat Project Baru - ARAMS PHOTOGRAPHY" />

            {/* ── TOP HEADER SECTION ───────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                        Buat Project Baru
                    </h1>
                    <nav className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
                            Dashboard
                        </Link>
                        <span>›</span>
                        <Link href="/projects" className="hover:text-slate-900 transition-colors">
                            Projects &amp; Orders
                        </Link>
                        <span>›</span>
                        <span className="text-slate-900 font-medium">Buat Project Baru</span>
                    </nav>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => handleFinalSubmit(true)}
                        disabled={submitting}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                        Simpan sebagai Draft
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFinalSubmit(false)}
                        disabled={submitting}
                        className="btn-primary-action inline-flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-sm shadow-black/10 transition-all cursor-pointer"
                    >
                        <span>Simpan &amp; Buat Invoice DP</span>
                        <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                    </button>
                </div>
            </div>
            {/* ── 4-STEP WIZARD STEPPER ───────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-xs">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
                    {/* Step 1 */}
                    <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="flex items-center gap-3 cursor-pointer group text-left relative z-10"
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${currentStep === 1
                                ? 'bg-[#4F46E5] text-white shadow-md ring-4 ring-indigo-50'
                                : currentStep > 1
                                    ? 'bg-indigo-100 text-[#4F46E5]'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                        >
                            {currentStep > 1 ? <Check className="w-4 h-4 stroke-[2.5]" /> : '1'}
                        </div>
                        <div className="min-w-0">
                            <span
                                className={`text-xs font-bold block truncate transition-colors ${currentStep === 1 ? 'text-[#4F46E5]' : 'text-slate-700 group-hover:text-slate-900'
                                    }`}
                            >
                                Informasi Project
                            </span>
                        </div>
                        {currentStep === 1 && (
                            <div className="absolute -bottom-4 sm:-bottom-5 left-0 right-0 h-1 bg-[#4F46E5] rounded-full" />
                        )}
                    </button>

                    {/* Step 2 */}
                    <button
                        type="button"
                        onClick={() => {
                            if (validateStep1()) setCurrentStep(2);
                        }}
                        className="flex items-center gap-3 cursor-pointer group text-left relative z-10"
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${currentStep === 2
                                ? 'bg-[#4F46E5] text-white shadow-md ring-4 ring-indigo-50'
                                : currentStep > 2
                                    ? 'bg-indigo-100 text-[#4F46E5]'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                        >
                            {currentStep > 2 ? <Check className="w-4 h-4 stroke-[2.5]" /> : '2'}
                        </div>
                        <div className="min-w-0">
                            <span
                                className={`text-xs font-bold block truncate transition-colors ${currentStep === 2 ? 'text-[#4F46E5]' : 'text-slate-700 group-hover:text-slate-900'
                                    }`}
                            >
                                Personel &amp; Penugasan
                            </span>
                        </div>
                        {currentStep === 2 && (
                            <div className="absolute -bottom-4 sm:-bottom-5 left-0 right-0 h-1 bg-[#4F46E5] rounded-full" />
                        )}
                    </button>

                    {/* Step 3 */}
                    <button
                        type="button"
                        onClick={() => {
                            if (validateStep1() && validateStep2()) setCurrentStep(3);
                        }}
                        className="flex items-center gap-3 cursor-pointer group text-left relative z-10"
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${currentStep === 3
                                ? 'bg-[#4F46E5] text-white shadow-md ring-4 ring-indigo-50'
                                : currentStep > 3
                                    ? 'bg-indigo-100 text-[#4F46E5]'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                        >
                            {currentStep > 3 ? <Check className="w-4 h-4 stroke-[2.5]" /> : '3'}
                        </div>
                        <div className="min-w-0">
                            <span
                                className={`text-xs font-bold block truncate transition-colors ${currentStep === 3 ? 'text-[#4F46E5]' : 'text-slate-700 group-hover:text-slate-900'
                                    }`}
                            >
                                Add-on &amp; Biaya Operasional
                            </span>
                        </div>
                        {currentStep === 3 && (
                            <div className="absolute -bottom-4 sm:-bottom-5 left-0 right-0 h-1 bg-[#4F46E5] rounded-full" />
                        )}
                    </button>

                    {/* Step 4 */}
                    <button
                        type="button"
                        onClick={() => {
                            if (validateStep1() && validateStep2()) setCurrentStep(4);
                        }}
                        className="flex items-center gap-3 cursor-pointer group text-left relative z-10"
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${currentStep === 4
                                ? 'bg-[#4F46E5] text-white shadow-md ring-4 ring-indigo-50'
                                : 'bg-slate-100 text-slate-500'
                                }`}
                        >
                            4
                        </div>
                        <div className="min-w-0">
                            <span
                                className={`text-xs font-bold block truncate transition-colors ${currentStep === 4 ? 'text-[#4F46E5]' : 'text-slate-700 group-hover:text-slate-900'
                                    }`}
                            >
                                Review &amp; Konfirmasi
                            </span>
                        </div>
                        {currentStep === 4 && (
                            <div className="absolute -bottom-4 sm:-bottom-5 left-0 right-0 h-1 bg-[#4F46E5] rounded-full" />
                        )}
                    </button>
                </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* ── STEP 1: INFORMASI PROJECT & KLIEN ───────────────────────── */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {currentStep === 1 && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-slate-900">
                        {/* Card 1: Detail Utama Project (col-span-12 lg:col-span-7) */}
                        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
                            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                                <h3 className="font-bold text-base text-slate-900">Detail Project &amp; Klien</h3>
                                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                                    Langkah 1 dari 4
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 min-w-0">
                                <div className="space-y-1 min-w-0">
                                    <label className="text-[11px] font-bold text-slate-600 block">
                                        Tanggal Project <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={projectDate}
                                        onChange={(e) => {
                                            setProjectDate(e.target.value);
                                            if (!shootingEventDate || shootingEventDate === projectDate) {
                                                setShootingEventDate(e.target.value);
                                            }
                                        }}
                                        className="w-full h-[42px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-1 min-w-0">
                                    <label className="text-[11px] font-bold text-slate-600 block">
                                        Estimasi Durasi Standby
                                    </label>
                                    <SelectSearch
                                        options={shootingDurationOptions}
                                        value={shootingDuration}
                                        onChange={setShootingDuration}
                                        clearable={false}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1 min-w-0">
                                <label className="text-[11px] font-bold text-slate-600 block">
                                    Nama Project <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="Contoh: Wedding Kevin &amp; Jessica"
                                    className="h-[42px]"
                                />
                            </div>

                            {/* Foto / Cover Project (Opsional) */}
                            <div className="space-y-1.5 min-w-0">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-bold text-slate-600">
                                        Foto / Cover Project <span className="text-slate-400 font-normal">(Opsional)</span>
                                    </label>
                                    {projectThumbnail && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveThumbnail}
                                            className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                                        >
                                            Hapus Foto
                                        </button>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    ref={thumbnailInputRef}
                                    accept="image/png,image/jpeg,image/webp,image/avif"
                                    onChange={handleThumbnailChange}
                                    className="hidden"
                                />

                                {projectThumbnail ? (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3 p-2.5">
                                        <img
                                            src={projectThumbnail}
                                            alt="Preview Project"
                                            className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <span className="text-xs font-bold text-slate-800 block truncate">
                                                Foto Cover Terpasang
                                            </span>
                                            <span className="text-[10px] text-slate-400 block">
                                                PNG, JPG, atau WebP
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => thumbnailInputRef.current?.click()}
                                                className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#4F46E5] hover:underline cursor-pointer"
                                            >
                                                <Upload className="w-3 h-3" />
                                                <span>Ganti Foto</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => thumbnailInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 rounded-xl p-3 text-center cursor-pointer transition-all flex items-center justify-center gap-2.5 group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-100 text-slate-500 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
                                            <ImageIcon className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[11px] font-bold text-slate-700 group-hover:text-indigo-900">
                                                Pilih atau unggah foto cover project
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                PNG, JPG, atau WebP hingga 5MB
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Client Selection */}
                            <div className="space-y-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-bold text-slate-600">
                                        Client <span className="text-rose-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setAddClientModalOpen(true)}
                                        className="text-[11px] text-[#4F46E5] hover:underline inline-flex items-center gap-1 font-bold cursor-pointer"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span>Tambah Klien Baru</span>
                                    </button>
                                </div>
                                <SelectSearch
                                    options={clientOptions}
                                    value={clientId}
                                    onChange={handleClientChange}
                                    placeholder="Cari atau pilih Client..."
                                    searchPlaceholder="Ketik nama klien atau telepon..."
                                    clearable={false}
                                />
                            </div>

                            {/* Category Selection */}
                            <div className="space-y-1 min-w-0">
                                <label className="text-[11px] font-bold text-slate-600 block">
                                    Kategori Project <span className="text-rose-500">*</span>
                                </label>
                                <SelectSearch
                                    options={categoryOptions}
                                    value={categoryId}
                                    onChange={handleCategoryChange}
                                    placeholder="Pilih Kategori Project..."
                                    searchPlaceholder="Cari kategori..."
                                    clearable={false}
                                />
                            </div>

                            {/* Package Selection */}
                            <div className="space-y-1.5 min-w-0">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-bold text-slate-600">
                                        Paket Layanan <span className="text-rose-500">*</span>
                                    </label>
                                    {selectedPackage && (
                                        <span className="text-xs font-black text-indigo-700 font-sans">
                                            {formatRupiah(packagePrice)}
                                        </span>
                                    )}
                                </div>
                                <SelectSearch
                                    options={packageOptions}
                                    value={packageId || selectedPackage?.id}
                                    onChange={setPackageId}
                                    placeholder="Pilih Paket Layanan..."
                                    searchPlaceholder="Cari paket..."
                                    clearable={false}
                                />
                                {selectedPackage && (
                                    <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs mt-1.5">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
                                            <div className="min-w-0">
                                                <span className="font-bold text-indigo-950 block truncate">
                                                    {selectedCategory?.name} - {selectedPackage.name}
                                                </span>
                                                <span className="text-[10px] text-slate-500">
                                                    Standby {selectedPackage.duration_hours || 12} Jam | Termasuk Tim Foto &amp; Video
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-indigo-700 shrink-0 font-sans ml-2">
                                            {formatRupiah(packagePrice)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Location */}
                            <div className="space-y-1 min-w-0">
                                <label className="text-[11px] font-bold text-slate-600 block">
                                    Lokasi Project / Event <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    icon={<MapPin className="w-4 h-4 text-slate-400" />}
                                    value={projectLocation}
                                    onChange={(e) => setProjectLocation(e.target.value)}
                                    placeholder="Contoh: Grand Ballroom, Hotel Indonesia Kempinski"
                                    className="h-[42px]"
                                />
                            </div>
                        </div>

                        {/* Card 2: Catatan & Referensi (col-span-12 lg:col-span-5) */}
                        <div className="lg:col-span-5 space-y-5">
                            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
                                <div className="border-b border-slate-100 pb-3">
                                    <h3 className="font-bold text-base text-slate-900">Catatan &amp; Referensi</h3>
                                </div>

                                <div className="space-y-1 min-w-0">
                                    <label className="text-[11px] font-bold text-slate-600 block">Catatan Project</label>
                                    <Textarea
                                        minRows={2}
                                        value={projectNotes}
                                        onChange={(e) => setProjectNotes(e.target.value)}
                                        placeholder="Tambahkan catatan umum project..."
                                    />
                                </div>

                                <div className="space-y-2 pt-1 border-t border-slate-100 min-w-0">
                                    <label className="text-[11px] font-bold text-slate-600 block">Referensi / Sumber Klien</label>
                                    <SelectSearch
                                        options={referralSourceOptions}
                                        value={referralSource}
                                        onChange={setReferralSource}
                                        placeholder="Pilih Sumber Referensi..."
                                        clearable={false}
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <Input
                                            value={referralName}
                                            onChange={(e) => setReferralName(e.target.value)}
                                            placeholder="Nama perujuk"
                                            className="h-[38px] text-[11px]"
                                        />
                                        <Input
                                            value={referralLink}
                                            onChange={(e) => setReferralLink(e.target.value)}
                                            placeholder="Link referensi"
                                            className="h-[38px] text-[11px]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1 pt-1 border-t border-slate-100 min-w-0">
                                    <label className="text-[11px] font-bold text-slate-600 block">Requirement Khusus / Briefing</label>
                                    <Textarea
                                        minRows={2}
                                        value={specialRequirement}
                                        onChange={(e) => setSpecialRequirement(e.target.value)}
                                        placeholder="Contoh: Tone warna warm &amp; bright, durasi teaser 1 menit..."
                                    />
                                </div>

                                <div className="space-y-1 pt-1 border-t border-slate-100 min-w-0">
                                    <label className="text-[11px] font-bold text-slate-600 block">Notes Tambahan</label>
                                    <Textarea
                                        minRows={2}
                                        value={additionalNotes}
                                        onChange={(e) => setAdditionalNotes(e.target.value)}
                                        placeholder="Catatan tambahan untuk tim..."
                                    />
                                    <div className="pt-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Visible untuk</span>
                                        <div className="flex items-center gap-3 text-xs flex-wrap">
                                            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleFor.supervisor}
                                                    onChange={(e) => setVisibleFor({ ...visibleFor, supervisor: e.target.checked })}
                                                    className="rounded text-[#4F46E5]"
                                                />
                                                <span>Supervisor</span>
                                            </label>
                                            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleFor.photographer}
                                                    onChange={(e) => setVisibleFor({ ...visibleFor, photographer: e.target.checked })}
                                                    className="rounded text-[#4F46E5]"
                                                />
                                                <span>Photographer</span>
                                            </label>
                                            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleFor.editor}
                                                    onChange={(e) => setVisibleFor({ ...visibleFor, editor: e.target.checked })}
                                                    className="rounded text-[#4F46E5]"
                                                />
                                                <span>Editor</span>
                                            </label>
                                            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                                                <input
                                                    type="checkbox"
                                                    checked={visibleFor.client}
                                                    onChange={(e) => setVisibleFor({ ...visibleFor, client: e.target.checked })}
                                                    className="rounded text-[#4F46E5]"
                                                />
                                                <span>Client</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 1 Bottom Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
                        <button
                            type="button"
                            onClick={() => handleFinalSubmit(true)}
                            disabled={submitting}
                            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>Simpan sebagai Draft</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            className="px-6 py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-bold text-white transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                        >
                            <span>Lanjut ke Step 2 (Personel &amp; Penugasan)</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* ── STEP 2: PERSONEL & PENUGASAN ───────────────────────────── */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {currentStep === 2 && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-slate-900">
                        {/* Card 1: Penugasan Personel (col-span-12 lg:col-span-6) */}
                        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
                            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-base text-slate-900">Penugasan Tim Personel</h3>
                                    <p className="text-[11px] text-slate-400">Tugaskan personil yang bertanggung jawab pada project ini</p>
                                </div>
                                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                                    Langkah 2 dari 4
                                </span>
                            </div>

                            <div className="space-y-3.5 text-xs min-w-0">
                                <div className="space-y-1 min-w-0">
                                    <label className="text-[11px] font-bold text-slate-600 block">
                                        Supervisor <span className="text-rose-500">*</span>
                                    </label>
                                    <SelectSearch
                                        options={supervisorOptions}
                                        value={supervisorId}
                                        onChange={setSupervisorId}
                                        placeholder="Pilih Supervisor..."
                                        searchPlaceholder="Cari nama supervisor..."
                                        clearable={false}
                                    />
                                </div>

                                <div className="space-y-1 min-w-0">
                                    <label className="text-[11px] font-bold text-slate-600 block">
                                        Photographer <span className="text-rose-500">*</span>
                                    </label>
                                    <SelectSearch
                                        options={photographerOptions}
                                        value={photographerName}
                                        onChange={setPhotographerName}
                                        placeholder="Pilih Photographer..."
                                        searchPlaceholder="Cari nama photographer..."
                                        clearable={false}
                                    />
                                </div>

                                <div className="space-y-1 min-w-0">
                                    <label className="text-[11px] font-bold text-slate-600 block">
                                        Editor <span className="text-rose-500">*</span>
                                    </label>
                                    <SelectSearch
                                        options={editorOptions}
                                        value={editorName}
                                        onChange={setEditorName}
                                        placeholder="Pilih Editor..."
                                        searchPlaceholder="Cari nama editor..."
                                        clearable={false}
                                    />
                                </div>

                                <div className="space-y-1 min-w-0 pt-2 border-t border-slate-100">
                                    <label className="text-[11px] font-bold text-slate-600 block">Catatan Penugasan Tim</label>
                                    <Textarea
                                        minRows={2}
                                        value={assignmentNotes}
                                        onChange={(e) => setAssignmentNotes(e.target.value)}
                                        placeholder="Catatan khusus pembagian tugas atau peralatan tim..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Checklist Persiapan & Requirement Khusus (col-span-12 lg:col-span-6) */}
                        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
                            <div className="border-b border-slate-100 pb-3">
                                <h3 className="font-bold text-base text-slate-900">Checklist Persiapan &amp; Operasional Tim</h3>
                                <p className="text-[11px] text-slate-400">Checklist SOP standar sebelum dan saat pelaksanaan event</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {[
                                    { key: 'briefing', label: 'Briefing & meeting sebelum hari H' },
                                    { key: 'survey', label: 'Survey lokasi (jika diperlukan)' },
                                    { key: 'rundown', label: 'List foto utama sesuai rundown' },
                                    { key: 'props', label: 'Properti & detail pendukung disiapkan' },
                                    { key: 'wo_coordination', label: 'Koordinasi dengan wedding organizer' },
                                    { key: 'backup_data', label: 'Backup data setiap selesai sesi' },
                                ].map((req) => (
                                    <label
                                        key={req.key}
                                        className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-700 text-[11px] border border-slate-100 transition-colors"
                                    >
                                        <div
                                            onClick={() =>
                                                setStep2Requirements({
                                                    ...step2Requirements,
                                                    [req.key]: !step2Requirements[req.key],
                                                })
                                            }
                                            className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-colors ${step2Requirements[req.key]
                                                    ? 'bg-[#4F46E5] text-white'
                                                    : 'bg-slate-100 border border-slate-300 text-transparent'
                                                }`}
                                        >
                                            <Check className="w-3 h-3 stroke-[3]" />
                                        </div>
                                        <span className={step2Requirements[req.key] ? 'font-semibold text-slate-900' : 'text-slate-500'}>
                                            {req.label}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-1 text-xs">
                                <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Workflow &amp; Timeline Otomatis</span>
                                </div>
                                <p className="text-[11px] text-slate-600">
                                    Workflow &amp; jadwal target deadline otomatis dikalkulasi berdasarkan kategori &amp; tanggal event, dan dapat Anda review lengkap pada Step 4.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 Bottom Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
                        <button
                            type="button"
                            onClick={handlePrev}
                            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Kembali ke Step 1</span>
                        </button>
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => handleFinalSubmit(true)}
                                disabled={submitting}
                                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                <FileText className="w-3.5 h-3.5 text-slate-500" />
                                <span>Simpan Draft</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                className="px-6 py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-bold text-white transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                            >
                                <span>Lanjut ke Step 3 (Add-on &amp; Biaya)</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* ── STEP 3: ADD-ON & BIAYA OPERASIONAL ──────────────────────── */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {currentStep === 3 && (
                <div className="space-y-6">
                    {/* Row 1: Tables (Add-on & Biaya Operasional) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch text-slate-900">
                        {/* Left Table: Add-on / Ala Carte */}
                        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full space-y-4">
                            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-base text-slate-900">Add-on / Ala Carte</h3>
                                    <p className="text-[11px] text-slate-400">Layanan tambahan di luar paket utama</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAddAddonModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] rounded-xl text-xs font-bold transition-colors cursor-pointer border border-indigo-100"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Tambah Add-on</span>
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col min-h-[220px]">
                                {addonsList.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center py-6 px-4 text-center border-2 border-dashed border-slate-200/80 rounded-xl bg-slate-50/50 space-y-3">
                                        <div className="w-11 h-11 mx-auto rounded-full bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                                            <PackagePlus className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-bold text-slate-800">Belum Ada Add-on Ditambahkan</p>
                                            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                                                Pilih add-on dari Master Data database atau buat add-on kustom khusus project ini.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setAddAddonModalOpen(true)}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Pilih / Tambah Add-on</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex-1 max-h-[240px] overflow-y-auto overflow-x-auto pr-1 border border-slate-100 rounded-xl">
                                        <table className="w-full text-left text-xs whitespace-nowrap">
                                            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 border-b border-slate-100 shadow-2xs">
                                                <tr className="text-[10px] uppercase font-bold text-slate-400">
                                                    <th className="py-2.5 px-3">Nama Add-on</th>
                                                    <th className="py-2.5 px-3">Satuan</th>
                                                    <th className="py-2.5 px-3">Harga Satuan</th>
                                                    <th className="py-2.5 px-3 text-center w-28">Qty</th>
                                                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                                                    <th className="py-2.5 px-3 text-center w-8"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-[11px]">
                                                {addonsList.map((addon) => (
                                                    <tr key={addon.id} className="hover:bg-slate-50/60">
                                                        <td className="py-2.5 px-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-slate-800">{addon.name}</span>
                                                                {addon.is_custom ? (
                                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                                        Kustom
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                                        Master Data
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-slate-500">{addon.unit}</td>
                                                        <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                                                            {formatRupiah(addon.unit_price)}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAddonQtyChange(addon.id, addon.qty - 1)}
                                                                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                                                                >
                                                                    -
                                                                </button>
                                                                <input
                                                                    type="number"
                                                                    min={1}
                                                                    max={99}
                                                                    value={addon.qty}
                                                                    onChange={(e) => handleAddonQtyChange(addon.id, parseInt(e.target.value) || 1)}
                                                                    className="w-10 px-1 py-1 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:border-[#4F46E5] outline-none"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAddonQtyChange(addon.id, addon.qty + 1)}
                                                                    className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                                                            {formatRupiah(addon.subtotal)}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteAddon(addon.id)}
                                                                className="text-slate-300 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                                                                title="Hapus Add-on"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">Total Add-on / Ala Carte</span>
                                <span className="text-base font-black text-[#4F46E5] font-sans">
                                    {formatRupiah(totalAddonAmount)}
                                </span>
                            </div>
                        </div>

                        {/* Right Table: Biaya Operasional */}
                        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full space-y-4">
                            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-base text-slate-900">Biaya Operasional</h3>
                                    <p className="text-[11px] text-slate-400">Estimasi biaya transportasi, akomodasi, dll.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setAddExpenseModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-indigo-100"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Tambah Biaya</span>
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col min-h-[220px]">
                                {operationalExpenses.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center py-6 px-4 text-center border-2 border-dashed border-slate-200/80 rounded-xl bg-slate-50/50 space-y-3">
                                        <div className="w-11 h-11 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                            <Receipt className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-bold text-slate-800">Belum Ada Biaya Operasional</p>
                                            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                                                Tambahkan estimasi biaya operasional tim seperti bensin, hotel, makan, sewa alat, dll.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setAddExpenseModalOpen(true)}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Tambah Biaya Operasional</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex-1 max-h-[240px] overflow-y-auto overflow-x-auto pr-1 border border-slate-100 rounded-xl">
                                        <table className="w-full text-left text-xs whitespace-nowrap">
                                            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs z-10 border-b border-slate-100 shadow-2xs">
                                                <tr className="text-[10px] uppercase font-bold text-slate-400">
                                                    <th className="py-2.5 px-3">Jenis Biaya</th>
                                                    <th className="py-2.5 px-3">Keterangan</th>
                                                    <th className="py-2.5 px-3 text-right">Estimasi Biaya</th>
                                                    <th className="py-2.5 px-3 text-center w-8"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-[11px]">
                                                {operationalExpenses.map((exp) => (
                                                    <tr key={exp.id} className="hover:bg-slate-50/60">
                                                        <td className="py-2.5 px-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-slate-800">{exp.type}</span>
                                                                {exp.is_custom ? (
                                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                                        Kustom
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                                        Master Data
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-2.5 px-3 text-slate-500">{exp.description}</td>
                                                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                                                            {formatRupiah(exp.estimated_cost)}
                                                        </td>
                                                        <td className="py-2.5 px-3 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteExpense(exp.id)}
                                                                className="text-slate-300 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                                                                title="Hapus Biaya Operasional"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-500">Total Biaya Operasional</span>
                                <span className="text-base font-black text-[#4F46E5] font-sans">
                                    {formatRupiah(totalOperationalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Diskon & Pengaturan DP / Pembayaran */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start text-slate-900">
                        {/* Left Summary: Ringkasan Tambahan Biaya & Diskon Paket */}
                        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
                            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
                                Ringkasan Tambahan &amp; Diskon Paket
                            </h3>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>Harga Paket ({selectedCategory?.name} - {selectedPackage?.name})</span>
                                    <span className="font-bold font-sans text-slate-800">{formatRupiah(packagePrice)}</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>Diskon Paket</span>
                                    <div className="w-40">
                                        <FormattedNumberInput
                                            value={discountPackage}
                                            onChange={(val) => setDiscountPackage(val)}
                                            prefix="- Rp "
                                            className="text-right text-rose-600 font-bold h-8 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>Subtotal Paket Setelah Diskon</span>
                                    <span className="font-bold font-sans text-slate-800">{formatRupiah(subtotalPaketSetelahDiskon)}</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>Total Add-on / Ala Carte</span>
                                    <span className="font-bold font-sans text-slate-800">{formatRupiah(totalAddonAmount)}</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-600">
                                    <span>Total Biaya Operasional</span>
                                    <span className="font-bold font-sans text-slate-800">{formatRupiah(totalOperationalAmount)}</span>
                                </div>

                                {/* Pajak (PPN / PPh) Opsional */}
                                <div className="pt-2 border-t border-slate-100 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold text-xs select-none">
                                            <input
                                                type="checkbox"
                                                checked={isTaxEnabled}
                                                onChange={(e) => setIsTaxEnabled(e.target.checked)}
                                                className="w-4 h-4 rounded text-[#4F46E5] focus:ring-indigo-200 cursor-pointer"
                                            />
                                            <span>Pajak (PPN / PPh)</span>
                                        </label>
                                        {isTaxEnabled ? (
                                            <span className="font-bold font-sans text-indigo-700">
                                                + {formatRupiah(calculatedTaxAmount)}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-[11px] font-medium">Non-aktif (0%)</span>
                                        )}
                                    </div>

                                    {isTaxEnabled && (
                                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-[11px]">
                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                <span className="text-slate-500">Tarif Pajak (%):</span>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {[11, 12, 10, 2].map((rate) => (
                                                        <button
                                                            key={rate}
                                                            type="button"
                                                            onClick={() => {
                                                                setTaxPercent(rate);
                                                                setTaxType('percent');
                                                            }}
                                                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${taxType === 'percent' && taxPercent === rate
                                                                    ? 'bg-[#4F46E5] text-white'
                                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                                                }`}
                                                        >
                                                            {rate}%
                                                        </button>
                                                    ))}
                                                    <div className="w-16">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.5"
                                                            value={taxType === 'percent' ? taxPercent : ''}
                                                            placeholder="Custom %"
                                                            onChange={(e) => {
                                                                setTaxType('percent');
                                                                setTaxPercent(parseFloat(e.target.value) || 0);
                                                            }}
                                                            className="w-full h-6 px-1.5 text-center bg-white border border-slate-200 rounded-md text-[11px] font-bold text-slate-800 focus:border-[#4F46E5] outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-slate-500 text-[10px] pt-1 border-t border-slate-200/60">
                                                <span>Dasar Pengenaan Pajak (DPP):</span>
                                                <span className="font-semibold text-slate-700">{formatRupiah(taxBaseAmount)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-900">Total Kesepakatan Project</span>
                                    <span className="text-xl font-black text-[#4F46E5] font-sans">
                                        {formatRupiah(totalProject)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                <label className="text-[11px] font-bold text-slate-600 block">Catatan Tambahan Biaya</label>
                                <Textarea
                                    minRows={2}
                                    value={additionalCostNotes}
                                    onChange={(e) => setAdditionalCostNotes(e.target.value)}
                                    placeholder="Tambahkan catatan jika ada penyesuaian biaya..."
                                />
                            </div>
                        </div>

                        {/* Right: Pengaturan Pembayaran & Tagihan DP */}
                        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
                            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
                                Pengaturan Pembayaran &amp; Invoice DP
                            </h3>

                            <div className="space-y-3 text-xs">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Persentase DP</label>
                                        <SelectSearch
                                            options={dpPercentOptions}
                                            value={String(dpPercent)}
                                            onChange={(val) => setDpPercent(Number(val) || 0)}
                                            clearable={false}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Jatuh Tempo DP</label>
                                        <input
                                            type="date"
                                            value={dpDueDate}
                                            onChange={(e) => setDpDueDate(e.target.value)}
                                            className="w-full h-[42px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#4F46E5]"
                                        />
                                    </div>
                                </div>

                                <div className="p-3 bg-emerald-50/80 border border-emerald-100 rounded-xl flex items-center justify-between">
                                    <div>
                                        <span className="text-emerald-900 font-bold text-xs block">Nominal Tagihan DP</span>
                                        <span className="text-[10px] text-emerald-700">DP {dpPercent}% dari total project</span>
                                    </div>
                                    <span className="text-lg font-black text-emerald-700 font-sans">
                                        {formatRupiah(nominalDp)}
                                    </span>
                                </div>

                                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Metode Pembayaran</label>
                                        <SelectSearch
                                            options={paymentMethodOptions}
                                            value={paymentMethodName}
                                            onChange={handlePaymentMethodChange}
                                            clearable={false}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Bank / No. Rekening</label>
                                            <Input
                                                value={bankAccount}
                                                onChange={(e) => setBankAccount(e.target.value)}
                                                className="h-[40px]"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Atas Nama</label>
                                            <Input
                                                value={accountHolder}
                                                onChange={(e) => setAccountHolder(e.target.value)}
                                                className="h-[40px]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 Bottom Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
                        <button
                            type="button"
                            onClick={handlePrev}
                            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Kembali ke Step 2</span>
                        </button>
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => handleFinalSubmit(true)}
                                disabled={submitting}
                                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                <FileText className="w-3.5 h-3.5 text-slate-500" />
                                <span>Simpan Draft</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                className="px-6 py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-bold text-white transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                            >
                                <span>Lanjut ke Step 4 (Review &amp; Konfirmasi)</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* ── STEP 4: REVIEW & KONFIRMASI (FULL INFORMASI) ─────────────── */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {currentStep === 4 && (
                <div className="space-y-6">
                    {/* Row 1: 4 KPI Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-slate-900">
                        {/* Card 1: Informasi Project */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2 text-xs flex flex-col justify-between">
                            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                                <span>Informasi Project</span>
                                {projectThumbnail && (
                                    <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                                        Ada Cover
                                    </span>
                                )}
                            </h4>
                            <div className="space-y-2 pt-1 text-[11px]">
                                {projectThumbnail && (
                                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                                        <img
                                            src={projectThumbnail}
                                            alt="Cover Project"
                                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Cover Project</span>
                                            <span className="text-[11px] font-semibold text-slate-800 truncate block">Foto Terpasang</span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-start justify-between gap-2.5">
                                    <span className="text-slate-400 shrink-0">Tanggal:</span>
                                    <span className="font-bold text-slate-800 text-right">{formattedProjectDate}</span>
                                </div>
                                <div className="flex items-start justify-between gap-2.5">
                                    <span className="text-slate-400 shrink-0">Nama:</span>
                                    <span className="font-bold text-slate-800 text-right min-w-0 break-words leading-tight">
                                        {projectName}
                                    </span>
                                </div>
                                <div className="flex items-start justify-between gap-2.5">
                                    <span className="text-slate-400 shrink-0">Client:</span>
                                    <span className="font-bold text-slate-800 text-right min-w-0 break-words">
                                        {selectedClient?.name}
                                    </span>
                                </div>
                                <div className="flex items-start justify-between gap-2.5">
                                    <span className="text-slate-400 shrink-0">Kategori:</span>
                                    <span className="font-bold text-slate-800 text-right">{selectedCategory?.name}</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Detail Paket */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2 text-xs flex flex-col justify-between">
                            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                                Detail Paket
                            </h4>
                            <div className="space-y-2 pt-1 text-[11px]">
                                <div className="flex items-start justify-between gap-2.5">
                                    <span className="text-slate-400 shrink-0">Paket:</span>
                                    <span className="font-bold text-slate-800 text-right min-w-0 break-words leading-tight">
                                        {selectedPackage?.name}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2.5">
                                    <span className="text-slate-400 shrink-0">Harga Paket:</span>
                                    <span className="font-bold font-sans text-slate-800 text-right">{formatRupiah(packagePrice)}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2.5">
                                    <span className="text-slate-400 shrink-0">Durasi:</span>
                                    <span className="font-bold text-slate-800 text-right">{selectedPackage?.duration_hours || 12} Jam</span>
                                </div>
                                <div className="flex items-center justify-between gap-2.5">
                                    <span className="text-slate-400 shrink-0">Tim Termasuk:</span>
                                    <span className="font-bold text-slate-800 text-right">2 Photo, 2 Video</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Personel & Tim */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2 text-xs flex flex-col justify-between">
                            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                                Personel &amp; Tim
                            </h4>
                            <div className="space-y-2 pt-1 text-[11px]">
                                <div className="flex items-start justify-between gap-2.5">
                                    <span className="text-slate-400 shrink-0">Supervisor:</span>
                                    <span className="font-bold text-slate-800 text-right">
                                        {supervisors.find((s) => String(s.id) === String(supervisorId))?.name || 'Supervisor'}
                                    </span>
                                </div>
                                <div className="flex items-start justify-between gap-2.5">
                                    <span className="text-slate-400 shrink-0">Photographer:</span>
                                    <span className="font-bold text-slate-800 text-right min-w-0 break-words">{photographerName}</span>
                                </div>
                                <div className="flex items-start justify-between gap-2.5">
                                    <span className="text-slate-400 shrink-0">Editor:</span>
                                    <span className="font-bold text-slate-800 text-right min-w-0 break-words">{editorName}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2.5">
                                    <span className="text-slate-400 shrink-0">Standby:</span>
                                    <span className="font-bold text-slate-800 text-right">{shootingDuration}</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 4: Jadwal & Lokasi */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-2 text-xs flex flex-col justify-between">
                            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                                Jadwal &amp; Lokasi
                            </h4>
                            <div className="space-y-2 pt-1 text-[11px]">
                                <div className="flex items-center justify-between gap-2.5">
                                    <span className="text-slate-400 shrink-0">Tanggal Event:</span>
                                    <span className="font-bold text-slate-800 text-right">{formattedShootingDate}</span>
                                </div>
                                <div className="flex items-start justify-between gap-2.5">
                                    <span className="text-slate-400 shrink-0">Lokasi:</span>
                                    <span className="font-bold text-slate-800 text-right min-w-0 break-words leading-tight">
                                        {projectLocation || '-'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-2.5">
                                    <span className="text-slate-400 shrink-0">DP Pertama:</span>
                                    <span className="font-bold text-indigo-700 text-right">{dpPercent}% ({formatRupiah(nominalDp)})</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Layanan Deliverables vs Alur Kerja Workflow Tim */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch text-slate-900">
                        {/* Card Kiri: Layanan Termasuk & Output Deliverables Paket */}
                        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between h-full">
                            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900">
                                        Layanan &amp; Deliverables Paket
                                    </h4>
                                    <span className="text-[10px] text-slate-400">Hasil &amp; produk akhir yang diserahkan ke klien</span>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                                    {selectedPackage?.name}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs flex-1">
                                {/* Layanan Termasuk */}
                                <div className="space-y-2">
                                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                                        Layanan Termasuk
                                    </span>
                                    {servicesList.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic">Tidak ada layanan spesifik pada database paket</p>
                                    ) : (
                                        <div className="space-y-1.5">
                                            {servicesList.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 text-slate-700 font-medium text-[11px]">
                                                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                        <Check className="w-2 h-2 stroke-[3]" />
                                                    </div>
                                                    <span>{item}</span>
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
                                        <p className="text-xs text-slate-400 italic">Tidak ada item deliverables pada database paket</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {deliverablesList.map((item) => {
                                                const badgeClass =
                                                    item.type === 'Video'
                                                        ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                                        : item.type === 'Album'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                            : item.type === 'Special'
                                                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                                : 'bg-sky-50 text-sky-700 border-sky-200';

                                                return (
                                                    <div key={item.id} className="p-2 rounded-lg bg-slate-50/80 border border-slate-100 space-y-1">
                                                        <div className="flex items-center justify-between gap-1.5">
                                                            <span className="font-semibold text-slate-800 text-[11px] leading-tight">
                                                                {item.name}
                                                            </span>
                                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono shrink-0">
                                                                {item.deadline}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-[9px] text-slate-400 truncate">
                                                                {item.description || 'Item hasil serah terima'}
                                                            </span>
                                                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.2 rounded border ${badgeClass} shrink-0`}>
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

                        {/* Card Kanan: Alur Kerja & Tahapan Operasional Tim */}
                        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between h-full">
                            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900">
                                        Alur Kerja &amp; Tahapan Operasional Tim
                                    </h4>
                                    <span className="text-[10px] text-slate-400">Proses kerja internal tim studio dari awal hingga akhir</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                                    {activeWorkflow.name}
                                </span>
                            </div>

                            <div className="overflow-x-auto flex-1">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                                            <th className="py-2 px-1 text-center w-6">#</th>
                                            <th className="py-2 px-2">Tahapan Kerja</th>
                                            <th className="py-2 px-2">Aktivitas Tim</th>
                                            <th className="py-2 px-2 text-right">Waktu Kerja</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-[11px]">
                                        {activeWorkflow.steps.map((w) => (
                                            <tr key={w.num} className="hover:bg-slate-50/60">
                                                <td className="py-2 px-1 text-center">
                                                    <span className="w-4 h-4 mx-auto rounded-full bg-[#4F46E5] text-white text-[9px] font-bold flex items-center justify-center">
                                                        {w.num}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-2">
                                                    <span className="font-semibold text-slate-800 block leading-tight break-words">{w.name}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">{w.phase || 'Operasional'}</span>
                                                </td>
                                                <td className="py-2 px-2 text-slate-600 text-[10.5px] break-words min-w-[140px] leading-relaxed" title={w.activity || w.description}>
                                                    {w.activity || w.description || '-'}
                                                </td>
                                                <td className="py-2 px-2 text-right font-mono font-bold text-indigo-700 text-[10px] whitespace-nowrap">
                                                    {w.duration || w.dl || w.dur}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Row 3: 3 Bottom Summary Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch text-slate-900">
                        {/* Card 1: Add-on Table */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full space-y-4">
                            <div className="space-y-3">
                                <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                                    <span>Add-on / Ala Carte</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                                        {addonsList.filter((a) => a.qty > 0).length} Item
                                    </span>
                                </h4>
                                {addonsList.filter((a) => a.qty > 0).length === 0 ? (
                                    <div className="py-8 text-center flex flex-col items-center justify-center space-y-1">
                                        <p className="text-xs text-slate-400 italic">Tidak ada add-on dipilih</p>
                                        <p className="text-[10px] text-slate-300">Project menggunakan paket standar</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 text-[11px] max-h-56 overflow-y-auto pr-1">
                                        {addonsList
                                            .filter((a) => a.qty > 0)
                                            .map((addon) => (
                                                <div key={addon.id} className="flex items-start justify-between gap-2 text-slate-700 py-1 border-b border-slate-50 last:border-0">
                                                    <span className="font-medium min-w-0 break-words">
                                                        {addon.name} <span className="text-slate-400 text-[10px]">(x{addon.qty})</span>
                                                    </span>
                                                    <span className="font-mono font-bold shrink-0">{formatRupiah(addon.subtotal)}</span>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between font-bold text-xs">
                                <span className="text-slate-600">Total Add-on</span>
                                <span className="text-[#4F46E5] font-sans font-black text-sm">{formatRupiah(totalAddonAmount)}</span>
                            </div>
                        </div>

                        {/* Card 2: Biaya Operasional */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full space-y-4">
                            <div className="space-y-3">
                                <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                                    <span>Biaya Operasional</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                                        {operationalExpenses.length} Item
                                    </span>
                                </h4>
                                {operationalExpenses.length === 0 ? (
                                    <div className="py-8 text-center flex flex-col items-center justify-center space-y-1">
                                        <p className="text-xs text-slate-400 italic">Tidak ada biaya operasional</p>
                                        <p className="text-[10px] text-slate-300">Tidak ada pengeluaran tambahan tim</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 text-[11px] max-h-56 overflow-y-auto pr-1">
                                        {operationalExpenses.map((exp) => (
                                            <div key={exp.id} className="flex items-start justify-between gap-2 text-slate-700 py-1 border-b border-slate-50 last:border-0">
                                                <div className="min-w-0">
                                                    <span className="font-semibold block truncate">{exp.type}</span>
                                                    <span className="text-[10px] text-slate-400 block truncate">{exp.description}</span>
                                                </div>
                                                <span className="font-mono font-bold shrink-0">{formatRupiah(exp.estimated_cost)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between font-bold text-xs">
                                <span className="text-slate-600">Total Biaya Operasional</span>
                                <span className="text-[#4F46E5] font-sans font-black text-sm">{formatRupiah(totalOperationalAmount)}</span>
                            </div>
                        </div>

                        {/* Card 3: Ringkasan Finansial & DP */}
                        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-full space-y-4">
                            <div className="space-y-3">
                                <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
                                    <span>Ringkasan Finansial &amp; Tagihan DP</span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                                        Finansial
                                    </span>
                                </h4>
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-start justify-between gap-2 text-slate-600">
                                        <span className="text-slate-500 shrink-0">Harga Paket</span>
                                        <span className="font-bold font-sans text-slate-800 text-right">{formatRupiah(packagePrice)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-600">
                                        <span className="text-slate-500">Total Add-on / Ala Carte</span>
                                        <span className="font-bold font-sans text-slate-800">{formatRupiah(totalAddonAmount)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-600">
                                        <span className="text-slate-500">Total Biaya Operasional</span>
                                        <span className="font-bold font-sans text-slate-800">{formatRupiah(totalOperationalAmount)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-600">
                                        <span className="text-slate-500">Diskon Paket</span>
                                        <span className="font-bold font-sans text-rose-600">- {formatRupiah(discountPackage)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-600">
                                        <span className="text-slate-500">Pajak (PPN/PPh)</span>
                                        {isTaxEnabled ? (
                                            <span className="font-bold font-sans text-indigo-700">
                                                + {formatRupiah(calculatedTaxAmount)} ({taxPercent}%)
                                            </span>
                                        ) : (
                                            <span className="font-medium text-slate-400">Non-aktif</span>
                                        )}
                                    </div>
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                        <span className="font-bold text-slate-900 text-xs">Total Project</span>
                                        <span className="text-base font-black text-[#4F46E5] font-sans">
                                            {formatRupiah(totalProject)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1 mt-auto text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-indigo-950">Tagihan DP Pertama</span>
                                    <span className="font-black text-[#4F46E5] font-sans">
                                        {formatRupiah(nominalDp)} ({dpPercent}%)
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                                    <span>Jatuh Tempo DP:</span>
                                    <span className="font-semibold text-slate-700">{formattedDpDueDate}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-500">
                                    <span>Tujuan Transfer:</span>
                                    <span className="font-semibold text-slate-700 truncate max-w-[170px]">{paymentMethodName} {bankAccount ? `(${bankAccount})` : ''}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 4: Card Yang Akan Dibuat Otomatis */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 text-slate-900">
                        <div className="flex items-center gap-1.5 text-indigo-700">
                            <Sparkles className="w-4 h-4" />
                            <h4 className="font-bold text-sm text-slate-900">Yang akan dibuat otomatis oleh sistem</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            {[
                                'Invoice DP (Draft)',
                                'Timeline Project',
                                'Workflow & Deadline',
                                'Nomor Project Unik',
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 font-medium">
                                    <div className="w-4 h-4 rounded bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                    </div>
                                    <span className="text-[11px] font-semibold">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step 4 Bottom Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
                        <button
                            type="button"
                            onClick={handlePrev}
                            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Kembali ke Step 3</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => handleFinalSubmit(true)}
                                disabled={submitting}
                                className="px-5 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                            >
                                <span>Simpan sebagai Draft</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFinalSubmit(false)}
                                disabled={submitting}
                                className="px-7 py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-bold text-white transition-all shadow-md inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>{submitting ? 'Memproses...' : 'Buat Project Sekarang'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════ */}
            {/* ── MODAL: SUKSES MEMBUAT PROJECT ─────────────────────────────── */}
            {/* ═════════════════════════════════════════════════════════════════ */}
            {showSuccessModal && createdResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900 text-center space-y-4">
                        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-900">Project Berhasil Dibuat!</h3>
                            <p className="text-xs text-slate-500">
                                Project <span className="font-bold text-slate-800">{createdResult.projectNumber}</span> dan Invoice DP telah tersimpan di sistem.
                            </p>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-left space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Nama Project:</span>
                                <span className="font-bold text-slate-800">{createdResult.projectName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Nomor Invoice:</span>
                                <span className="font-mono font-bold text-slate-800">{createdResult.invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200/60 pt-2">
                                <span className="font-bold text-slate-700">Nominal DP:</span>
                                <span className="font-black text-[#4F46E5] font-sans">{formatRupiah(createdResult.nominalDp)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <Link
                                href="/projects"
                                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors text-center"
                            >
                                Ke Daftar Project
                            </Link>
                            <Link
                                href={
                                    createdResult.invoiceId
                                        ? `/projects/${createdResult.projectId}/invoice?invoice_id=${createdResult.invoiceId}`
                                        : `/projects/${createdResult.projectId}/invoice`
                                }
                                className="flex-1 py-3 px-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-bold text-white transition-colors text-center inline-flex items-center justify-center gap-1.5 shadow-md"
                            >
                                <span>Lihat Invoice</span>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL: TAMBAH ADD-ON (MASTER DATA & KUSTOM) ─────────────────── */}
            {addAddonModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center font-bold">
                                    <PackagePlus className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900">Tambah Add-on Project</h4>
                                    <p className="text-[10px] text-slate-400">Pilih dari Master Data atau buat kustom</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAddAddonModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Segmented Tab Switcher */}
                        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
                            <button
                                type="button"
                                onClick={() => setAddonModalTab('database')}
                                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${addonModalTab === 'database'
                                        ? 'bg-white text-[#4F46E5] shadow-xs'
                                        : 'hover:text-slate-900'
                                    }`}
                            >
                                <Database className="w-3.5 h-3.5" />
                                <span>Master Data</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAddonModalTab('custom')}
                                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${addonModalTab === 'custom'
                                        ? 'bg-white text-[#4F46E5] shadow-xs'
                                        : 'hover:text-slate-900'
                                    }`}
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Add-on Kustom</span>
                            </button>
                        </div>

                        {/* Tab 1: Database Master Data */}
                        {addonModalTab === 'database' ? (
                            <div className="space-y-4 text-xs">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">
                                        Pilih Add-on dari Master Data <span className="text-rose-500">*</span>
                                    </label>
                                    <SelectSearch
                                        options={masterAddonOptions}
                                        value={selectedMasterAddonId}
                                        onChange={(val) => {
                                            setSelectedMasterAddonId(val);
                                        }}
                                        placeholder="Cari & pilih Add-on..."
                                        searchPlaceholder="Ketik nama add-on..."
                                        clearable={false}
                                    />
                                </div>

                                {selectedMasterAddon && (
                                    <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-indigo-950 uppercase tracking-tight">
                                                {selectedMasterAddon.name}
                                            </span>
                                            <span className="text-xs font-black text-indigo-700 font-sans">
                                                {formatRupiah(Number(selectedMasterAddon.price) || 0)} / {selectedMasterAddon.unit || 'Item'}
                                            </span>
                                        </div>
                                        {selectedMasterAddon.description && (
                                            <p className="text-[10px] text-slate-500">
                                                {selectedMasterAddon.description}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3 items-center">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-600 block">Jumlah (Qty)</label>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setMasterAddonQty((prev) => Math.max(1, prev - 1))}
                                                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer text-sm"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min={1}
                                                max={99}
                                                value={masterAddonQty}
                                                onChange={(e) => setMasterAddonQty(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-full h-9 px-2 text-center bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:border-[#4F46E5] outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setMasterAddonQty((prev) => prev + 1)}
                                                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer text-sm"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1 text-right">
                                        <label className="text-[11px] font-bold text-slate-400 block">Estimasi Subtotal</label>
                                        <div className="h-9 flex items-center justify-end font-mono font-black text-sm text-[#4F46E5]">
                                            {formatRupiah((Number(selectedMasterAddon?.price) || 0) * (masterAddonQty || 1))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setAddAddonModalOpen(false)}
                                        className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!selectedMasterAddonId}
                                        onClick={handleAddMasterAddon}
                                        className="px-4 py-2 text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambahkan ke Project</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Tab 2: Add-on Kustom */
                            <div className="space-y-3 text-xs">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">
                                        Nama Add-on <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        value={newAddonForm.name}
                                        onChange={(e) => setNewAddonForm({ ...newAddonForm, name: e.target.value })}
                                        placeholder="Contoh: Drone Operator 4K / Photobooth 2 Jam"
                                        className="h-[40px]"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-600 block">Satuan</label>
                                        <Input
                                            value={newAddonForm.unit}
                                            onChange={(e) => setNewAddonForm({ ...newAddonForm, unit: e.target.value })}
                                            placeholder="Sesi / Jam / Lembar"
                                            className="h-[40px]"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-600 block">Jumlah (Qty)</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={99}
                                            value={newAddonForm.qty}
                                            onChange={(e) => setNewAddonForm({ ...newAddonForm, qty: Math.max(1, parseInt(e.target.value) || 1) })}
                                            className="w-full h-[40px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-[#4F46E5] outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">Harga Satuan (Rp)</label>
                                    <FormattedNumberInput
                                        value={newAddonForm.price}
                                        onChange={(val) => setNewAddonForm({ ...newAddonForm, price: val })}
                                        prefix="Rp "
                                        className="h-[40px] text-xs font-semibold"
                                    />
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-500">Estimasi Subtotal:</span>
                                    <span className="font-mono font-black text-xs text-[#4F46E5]">
                                        {formatRupiah((Number(newAddonForm.price) || 0) * (newAddonForm.qty || 1))}
                                    </span>
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setAddAddonModalOpen(false)}
                                        className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCreateCustomAddon}
                                        className="px-4 py-2 text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambahkan Add-on</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── MODAL: TAMBAH BIAYA OPERASIONAL (PRESET & KUSTOM) ─────────────── */}
            {addExpenseModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                                    <Receipt className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900">Tambah Biaya Operasional</h4>
                                    <p className="text-[10px] text-slate-400">Pilih dari Master Data atau buat biaya kustom</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAddExpenseModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Segmented Tab Switcher */}
                        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
                            <button
                                type="button"
                                onClick={() => setExpenseModalTab('database')}
                                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${expenseModalTab === 'database'
                                        ? 'bg-white text-emerald-600 shadow-xs'
                                        : 'hover:text-slate-900'
                                    }`}
                            >
                                <Database className="w-3.5 h-3.5" />
                                <span>Master Data</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setExpenseModalTab('custom')}
                                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${expenseModalTab === 'custom'
                                        ? 'bg-white text-emerald-600 shadow-xs'
                                        : 'hover:text-slate-900'
                                    }`}
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Biaya Kustom</span>
                            </button>
                        </div>

                        {/* Tab 1: Database Master Data */}
                        {expenseModalTab === 'database' ? (
                            <div className="space-y-3.5 text-xs">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">
                                        Pilih Biaya Operasional dari Master Data <span className="text-rose-500">*</span>
                                    </label>
                                    <SelectSearch
                                        options={masterOpsOptions}
                                        value={selectedMasterOpsId}
                                        onChange={(val) => handleSelectMasterOps(val)}
                                        placeholder="Cari & pilih Biaya Operasional..."
                                        searchPlaceholder="Ketik jenis biaya operasional..."
                                        clearable={false}
                                    />
                                </div>

                                {selectedMasterOps && (
                                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-tight flex items-center gap-1.5">
                                                <span>{getExpenseIcon(selectedMasterOps.name)}</span>
                                                <span>{selectedMasterOps.name}</span>
                                            </span>
                                            <span className="text-xs font-black text-emerald-700 font-sans">
                                                {formatRupiah(Number(selectedMasterOps.price) || 0)} / {selectedMasterOps.unit || 'Item'}
                                            </span>
                                        </div>
                                        {selectedMasterOps.description && (
                                            <p className="text-[10px] text-slate-500">{selectedMasterOps.description}</p>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">Keterangan / Rincian Lapangan</label>
                                    <Input
                                        value={presetExpenseDescription}
                                        onChange={(e) => setPresetExpenseDescription(e.target.value)}
                                        placeholder="Contoh: PP Tim 4 orang Jakarta - Bogor"
                                        className="h-[40px]"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">Estimasi Biaya (Rp)</label>
                                    <FormattedNumberInput
                                        value={presetExpenseCost}
                                        onChange={(val) => setPresetExpenseCost(val)}
                                        prefix="Rp "
                                        className="h-[40px] text-xs font-semibold"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setAddExpenseModalOpen(false)}
                                        className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!selectedMasterOpsId}
                                        onClick={handleAddMasterOps}
                                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambahkan Biaya</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Tab 2: Biaya Kustom */
                            <div className="space-y-3 text-xs">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">
                                        Jenis Biaya <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        value={newExpenseForm.type}
                                        onChange={(e) => setNewExpenseForm({ ...newExpenseForm, type: e.target.value })}
                                        placeholder="Contoh: Dry Ice / Flare Effect Resepsi"
                                        className="h-[40px]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">Keterangan</label>
                                    <Input
                                        value={newExpenseForm.description}
                                        onChange={(e) => setNewExpenseForm({ ...newExpenseForm, description: e.target.value })}
                                        placeholder="Contoh: Efek panggung saat grand entrance"
                                        className="h-[40px]"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-600 block">Estimasi Biaya (Rp)</label>
                                    <FormattedNumberInput
                                        value={newExpenseForm.cost}
                                        onChange={(val) => setNewExpenseForm({ ...newExpenseForm, cost: val })}
                                        prefix="Rp "
                                        className="h-[40px] text-xs font-semibold"
                                    />
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setAddExpenseModalOpen(false)}
                                        className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCreateCustomExpense}
                                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambahkan Biaya</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── MODAL: QUICK TAMBAH KLIEN BARU ──────────────────────────── */}
            {addClientModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                    <form
                        onSubmit={handleQuickCreateClient}
                        className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-slate-900"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h4 className="font-bold text-sm text-slate-900">Tambah Klien Baru</h4>
                            <button
                                type="button"
                                onClick={() => setAddClientModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3 text-xs">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-600 block">
                                    Nama Lengkap <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    required
                                    value={newClientForm.name}
                                    onChange={(e) => setNewClientForm({ ...newClientForm, name: e.target.value })}
                                    placeholder="Nama Klien"
                                    className="h-[40px]"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-600 block">No. WhatsApp / Telepon</label>
                                <Input
                                    type="tel"
                                    value={newClientForm.phone}
                                    onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                                    placeholder="08123456789"
                                    className="h-[40px]"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-600 block">Email</label>
                                <Input
                                    type="email"
                                    value={newClientForm.email}
                                    onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                                    placeholder="klien@gmail.com"
                                    className="h-[40px]"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-600 block">Kota</label>
                                <Input
                                    value={newClientForm.city}
                                    onChange={(e) => setNewClientForm({ ...newClientForm, city: e.target.value })}
                                    placeholder="Jakarta Selatan"
                                    className="h-[40px]"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setAddClientModalOpen(false)}
                                className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-xs cursor-pointer"
                            >
                                Simpan Klien
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
