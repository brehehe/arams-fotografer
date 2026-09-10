import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Briefcase,
    CreditCard,
    FileText,
    Clock,
    Plus,
    CheckCircle2,
    AlertCircle,
    Instagram,
    Heart,
    Building2,
    Tag,
    MessageCircle,
    User,
    Users,
    FolderKanban,
    Sparkles,
    Check,
    X,
    Box,
    Receipt,
    Camera,
    ChevronRight,
    ChevronLeft,
    Edit3,
    Pencil,
    UserCheck,
    Layers,
    Share2,
    Shield,
    Video,
    ShoppingBag,
    Image as ImageIcon,
    ExternalLink,
    Building,
    MoreVertical,
    Wallet,
    ArrowUpRight,
    ArrowRight,
    Folder,
    FolderPlus,
    DollarSign,
    CheckSquare,
    Search,
    Filter,
    Download,
    Eye,
    EyeOff,
    Lock,
    Send,
    Star,
    Paperclip,
    Bold,
    Italic,
    RotateCcw,
    MessageSquare,
    HardDrive,
    Copy,
    PlayCircle,
    Trash2,
    ChevronDown,
    Baby,
    Upload,
} from 'lucide-react';
import { formatRupiah, formatDate, formatCurrencyShort } from '@/lib/formatters';
import { ALL_WORKFLOWS, resolveWorkflow, type WorkflowDefinition } from '@/lib/workflows';
import {
    Modal,
    Input,
    NativeSelect,
    SelectSearch,
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
    Badge,
    Button,
    Checkbox,
    Textarea,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui';

interface ClientDetailProps {
    client: {
        id: string | number;
        name: string;
        partner_name?: string;
        bride_name?: string;
        bride_nickname?: string;
        groom_name?: string;
        groom_nickname?: string;
        bride_birth_date?: string;
        groom_birth_date?: string;
        child_name?: string;
        child_birth_date?: string;
        child_gender?: string;
        father_name?: string | null;
        mother_name?: string | null;
        children?: Array<{ name: string; nickname?: string; birth_date?: string; gender?: string }> | null;
        company_name?: string;
        client_type?: string;
        email: string;
        instagram?: string;
        partner_instagram?: string;
        phone: string;
        secondary_phone?: string;
        preferred_contact?: string;
        province?: string;
        province_code?: string;
        city: string;
        city_code?: string;
        district?: string;
        district_code?: string;
        village?: string;
        village_code?: string;
        postal_code?: string;
        address: string;
        source: string;
        occupation?: string;
        contact_person?: string;
        other_social_media?: string;
        referred_by_client_id?: string;
        wedding_organizer_id?: string;
        referral_name?: string;
        referred_by_client?: {
            id: string;
            name: string;
            phone?: string;
            city?: string;
        };
        wedding_organizer?: {
            id: string;
            name: string;
            pic_name?: string;
            tier?: string;
            phone?: string;
            email?: string;
            city?: string;
        };
        status: string;
        notes?: string;
        tags?: string[];
        avatar?: string;
        birth_date?: string;
        job_title?: string;
        created_at: string;
        user?: {
            id: string;
            name: string;
            email: string;
            phone?: string;
            status?: string;
            last_login_at?: string;
            created_at?: string;
        } | null;
        projects: Array<any>;
        invoices: Array<any>;
        payments: Array<any>;
        referrals?: Array<any>;
        projects_count: number;
        invoices_count: number;
        payments_count: number;
        referrals_count?: number;
    };
    categories?: Array<{ id: string; name: string; slug?: string; description?: string; color?: string; workflow_type?: string; form_type?: string }>;
    packages?: Array<{
        id: string;
        name: string;
        category_id: string;
        base_price: number | string;
        duration_hours?: number;
        description?: string;
        included_deliverables?: Array<{
            id: number | string;
            name: string;
            type: 'Photo' | 'Video' | 'Album' | 'Special' | string;
            deadline: string;
            description?: string;
            required?: boolean;
            by_owner?: boolean;
        }>;
        included_services?: string[];
    }>;
    workflows?: Array<any>;
    team_members?: Array<{ id: string; name: string; email: string; avatar?: string | null; role?: string }>;
    payment_methods?: Array<{ id: string; name: string; account_number?: string; account_holder?: string }>;
    wedding_organizers?: Array<{
        id: string;
        name: string;
        pic_name?: string;
        phone?: string;
        city?: string;
        tier?: string;
    }>;
    all_clients?: Array<{
        id: string;
        name: string;
        phone?: string;
        city?: string;
        email?: string;
        bride_name?: string;
        groom_name?: string;
        child_name?: string;
    }>;
}

interface RegionItem {
    code: string;
    name: string;
    postal_code?: string;
}

export default function ClientDetail({
    client,
    categories = [],
    packages = [],
    workflows = [],
    team_members = [],
    payment_methods = [],
    wedding_organizers = [],
    all_clients = [],
}: ClientDetailProps) {
    // Active Main Tab
    const [mainTab, setMainTab] = useState<
        'ringkasan' | 'projects' | 'pembayaran' | 'files' | 'catatan' | 'komunikasi' | 'akun'
    >('ringkasan');

    // Modal Edit Data Klien States
    const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submittingEdit, setSubmittingEdit] = useState(false);
    const [editActiveFormTab, setEditActiveFormTab] = useState<'profile' | 'contact' | 'location' | 'event' | 'preferences'>('profile');

    const editSteps = [
        { id: 'profile', title: 'Identitas & Profil', stepNum: 1 },
        { id: 'contact', title: 'Kontak & Medsos', stepNum: 2 },
        { id: 'location', title: 'Domisili & Alamat', stepNum: 3 },
        { id: 'event', title: 'Acara & Project', stepNum: 4 },
        { id: 'preferences', title: 'Preferensi & Tag', stepNum: 5 },
    ];
    const currentEditStepIndex = editSteps.findIndex((s) => s.id === editActiveFormTab);

    const handleNextEditStep = () => {
        if (currentEditStepIndex < editSteps.length - 1) {
            setEditActiveFormTab(editSteps[currentEditStepIndex + 1].id as any);
        }
    };

    const handlePrevEditStep = () => {
        if (currentEditStepIndex > 0) {
            setEditActiveFormTab(editSteps[currentEditStepIndex - 1].id as any);
        }
    };

    const goToEditStep = (stepId: 'profile' | 'contact' | 'location' | 'event' | 'preferences') => {
        setEditActiveFormTab(stepId);
    };

    const presetTags = ['VIP', 'Wedding 2026', 'High Budget', 'Referral WO', 'Outdoor Session', 'Album Mewah', 'Repeat Client'];
    const toggleEditTag = (tag: string) => {
        setEditFormData((prev) => {
            const exists = prev.tags.includes(tag);
            return {
                ...prev,
                tags: exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
            };
        });
    };

    const [editFormData, setEditFormData] = useState({
        name: client.name || '',
        client_type: client.client_type || 'wedding',
        partner_name: client.partner_name || '',
        bride_name: client.bride_name || '',
        bride_nickname: client.bride_nickname || '',
        groom_name: client.groom_name || '',
        groom_nickname: client.groom_nickname || '',
        bride_birth_date: client.bride_birth_date ? String(client.bride_birth_date).substring(0, 10) : '',
        groom_birth_date: client.groom_birth_date ? String(client.groom_birth_date).substring(0, 10) : '',
        child_name: client.child_name || '',
        child_birth_date: client.child_birth_date ? String(client.child_birth_date).substring(0, 10) : '',
        child_gender: (client.child_gender || 'male') as 'male' | 'female',
        father_name: client.father_name || '',
        mother_name: client.mother_name || '',
        children: (client.children && Array.isArray(client.children) && client.children.length > 0)
            ? client.children
            : [{ name: client.child_name || '', nickname: '', birth_date: client.child_birth_date ? String(client.child_birth_date).substring(0, 10) : '', gender: (client.child_gender || 'male') }],
        company_name: client.company_name || '',
        email: client.email || '',
        instagram: client.instagram || '',
        phone: client.phone || '',
        secondary_phone: client.secondary_phone || '',
        preferred_contact: client.preferred_contact || 'WhatsApp',
        province: client.province || '',
        province_code: client.province_code || '',
        city: client.city || '',
        city_code: client.city_code || '',
        district: client.district || '',
        district_code: client.district_code || '',
        village: client.village || '',
        village_code: client.village_code || '',
        postal_code: client.postal_code || '',
        address: client.address || '',
        contact_person: client.contact_person || '',
        occupation: client.occupation || '',
        other_social_media: client.other_social_media || '',
        event_type: client.projects?.[0]?.category?.name || 'Wedding',
        event_date: client.projects?.[0]?.event_date ? String(client.projects[0].event_date).substring(0, 10) : '',
        event_time: client.projects?.[0]?.event_time || '16:00',
        event_location: client.projects?.[0]?.location || '',
        package_id: client.projects?.[0]?.package_id ? String(client.projects[0].package_id) : '',
        source: client.source || 'Instagram',
        referred_by_client_id: client.referred_by_client_id || '',
        wedding_organizer_id: client.wedding_organizer_id || '',
        referral_name: client.referral_name || '',
        status: client.status || 'active',
        notes: client.notes || '',
        tags: (Array.isArray(client.tags) ? client.tags : []) as string[],
    });

    const DEFAULT_INDONESIA_PROVINCES: RegionItem[] = [
        { code: '11', name: 'ACEH' },
        { code: '51', name: 'BALI' },
        { code: '36', name: 'BANTEN' },
        { code: '17', name: 'BENGKULU' },
        { code: '34', name: 'DAERAH ISTIMEWA YOGYAKARTA' },
        { code: '31', name: 'DKI JAKARTA' },
        { code: '75', name: 'GORONTALO' },
        { code: '15', name: 'JAMBI' },
        { code: '32', name: 'JAWA BARAT' },
        { code: '33', name: 'JAWA TENGAH' },
        { code: '35', name: 'JAWA TIMUR' },
        { code: '61', name: 'KALIMANTAN BARAT' },
        { code: '63', name: 'KALIMANTAN SELATAN' },
        { code: '62', name: 'KALIMANTAN TENGAH' },
        { code: '64', name: 'KALIMANTAN TIMUR' },
        { code: '65', name: 'KALIMANTAN UTARA' },
        { code: '19', name: 'KEPULAUAN BANGKA BELITUNG' },
        { code: '21', name: 'KEPULAUAN RIAU' },
        { code: '18', name: 'LAMPUNG' },
        { code: '81', name: 'MALUKU' },
        { code: '82', name: 'MALUKU UTARA' },
        { code: '52', name: 'NUSA TENGGARA BARAT' },
        { code: '53', name: 'NUSA TENGGARA TIMUR' },
        { code: '91', name: 'PAPUA' },
        { code: '92', name: 'PAPUA BARAT' },
        { code: '96', name: 'PAPUA BARAT DAYA' },
        { code: '95', name: 'PAPUA PEGUNUNGAN' },
        { code: '93', name: 'PAPUA SELATAN' },
        { code: '94', name: 'PAPUA TENGAH' },
        { code: '14', name: 'RIAU' },
        { code: '76', name: 'SULAWESI BARAT' },
        { code: '73', name: 'SULAWESI SELATAN' },
        { code: '72', name: 'SULAWESI TENGAH' },
        { code: '74', name: 'SULAWESI TENGGARA' },
        { code: '71', name: 'SULAWESI UTARA' },
        { code: '13', name: 'SUMATERA BARAT' },
        { code: '16', name: 'SUMATERA SELATAN' },
        { code: '12', name: 'SUMATERA UTARA' },
    ];

    // Regional cascading dropdown states
    const [regionProvinces, setRegionProvinces] = useState<RegionItem[]>(DEFAULT_INDONESIA_PROVINCES);
    const [regionCities, setRegionCities] = useState<RegionItem[]>([]);
    const [regionDistricts, setRegionDistricts] = useState<RegionItem[]>([]);
    const [regionVillages, setRegionVillages] = useState<RegionItem[]>([]);

    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingVillages, setLoadingVillages] = useState(false);

    // Fetch Provinces from local database API
    useEffect(() => {
        fetch('/api/indonesia-regions')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    setRegionProvinces(data);
                }
            })
            .catch(() => setRegionProvinces(DEFAULT_INDONESIA_PROVINCES));
    }, []);

    // Load initial cities/districts if client has province_code
    useEffect(() => {
        if (client.province_code) {
            setLoadingCities(true);
            fetch(`/api/indonesia-regions?parent_code=${client.province_code}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        setRegionCities(data);
                    }
                })
                .catch(() => { })
                .finally(() => setLoadingCities(false));
        }

        if (client.city_code) {
            setLoadingDistricts(true);
            fetch(`/api/indonesia-regions?parent_code=${client.city_code}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        setRegionDistricts(data);
                    }
                })
                .catch(() => { })
                .finally(() => setLoadingDistricts(false));
        }

        if (client.district_code) {
            setLoadingVillages(true);
            fetch(`/api/indonesia-regions?parent_code=${client.district_code}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        setRegionVillages(data);
                    }
                })
                .catch(() => { })
                .finally(() => setLoadingVillages(false));
        }
    }, [client.province_code, client.city_code, client.district_code]);

    const handleProvinceChange = (provCode: string) => {
        const found = regionProvinces.find((p) => p.code === provCode);
        setEditFormData((prev) => ({
            ...prev,
            province_code: provCode,
            province: found ? found.name : '',
            city_code: '',
            city: '',
            district_code: '',
            district: '',
            village_code: '',
            village: '',
            postal_code: '',
        }));

        setRegionCities([]);
        setRegionDistricts([]);
        setRegionVillages([]);

        if (provCode) {
            setLoadingCities(true);
            fetch(`/api/indonesia-regions?parent_code=${provCode}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        setRegionCities(data);
                    }
                })
                .catch(() => { })
                .finally(() => setLoadingCities(false));
        }
    };

    const handleCitySelectChange = (cityCode: string) => {
        const found = regionCities.find((c) => c.code === cityCode);
        setEditFormData((prev) => ({
            ...prev,
            city_code: cityCode,
            city: found ? found.name : '',
            district_code: '',
            district: '',
            village_code: '',
            village: '',
            postal_code: '',
        }));

        setRegionDistricts([]);
        setRegionVillages([]);

        if (cityCode) {
            setLoadingDistricts(true);
            fetch(`/api/indonesia-regions?parent_code=${cityCode}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        setRegionDistricts(data);
                    }
                })
                .catch(() => { })
                .finally(() => setLoadingDistricts(false));
        }
    };

    const handleDistrictSelectChange = (distCode: string) => {
        const found = regionDistricts.find((d) => d.code === distCode);
        setEditFormData((prev) => ({
            ...prev,
            district_code: distCode,
            district: found ? found.name : '',
            village_code: '',
            village: '',
            postal_code: '',
        }));

        setRegionVillages([]);

        if (distCode) {
            setLoadingVillages(true);
            fetch(`/api/indonesia-regions?parent_code=${distCode}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        setRegionVillages(data);
                    }
                })
                .catch(() => { })
                .finally(() => setLoadingVillages(false));
        }
    };

    const handleVillageSelectChange = (villCode: string) => {
        const found = regionVillages.find((v) => v.code === villCode);
        setEditFormData((prev) => ({
            ...prev,
            village_code: villCode,
            village: found ? found.name : '',
            postal_code: found?.postal_code || prev.postal_code,
        }));
    };

    // Category options for Edit Client Form (Master Data Categories)
    const categoryOptions = useMemo(() => {
        const list = (categories || []).map((cat: any) => {
            const formLabel = cat.form_type === 'wedding' ? '👰🤵 CPP & CPW' : cat.form_type === 'newborn' ? '👶 Nama Anak' : '👤 Standar';
            return {
                value: cat.slug || String(cat.id),
                label: cat.name,
                subtitle: `${cat.description || `Master Kategori: ${cat.name}`} • Input: ${formLabel}`,
            };
        });

        const cur = editFormData.client_type;
        if (cur && !list.some((o: any) => o.value === cur)) {
            if (cur === 'personal') {
                const perorangan = list.find((o: any) => o.value === 'perorangan');
                list.unshift({
                    value: 'personal',
                    label: perorangan ? `${perorangan.label} (Personal)` : 'Personal Portrait',
                    subtitle: 'Kategori Klien • Input: 👤 Standar',
                });
            } else if (cur === 'family') {
                list.unshift({
                    value: 'family',
                    label: 'Family & Maternity',
                    subtitle: 'Kategori Klien • Input: 👤 Standar',
                });
            } else if (cur === 'newborn') {
                list.unshift({
                    value: 'newborn',
                    label: 'Newborn',
                    subtitle: 'Kategori Klien • Input: 👶 Nama Anak',
                });
            } else {
                list.push({
                    value: cur,
                    label: cur.charAt(0).toUpperCase() + cur.slice(1),
                    subtitle: 'Kategori Klien',
                });
            }
        }

        return list;
    }, [categories, editFormData.client_type]);

    const activeEditFormType = useMemo(() => {
        const found = (categories || []).find(
            (c: any) => c.slug === editFormData.client_type || String(c.id) === editFormData.client_type
        );
        if (found?.form_type) return found.form_type;
        if (editFormData.client_type === 'newborn') return 'newborn';
        if (editFormData.client_type === 'wedding' || editFormData.client_type === 'prewedding') return 'wedding';
        return 'standard';
    }, [categories, editFormData.client_type]);

    // Modal Tambah Pembayaran States
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentFormData, setPaymentFormData] = useState<{
        project_id: string;
        amount: string;
        payment_date: string;
        payment_method_id: string;
        reference_number: string;
        notes: string;
        proof_file: File | null;
    }>({
        project_id: client.projects?.[0]?.id || '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method_id: payment_methods?.[0]?.id || '1',
        reference_number: '',
        notes: 'Pelunasan / DP Project',
        proof_file: null,
    });
    const [submittingPayment, setSubmittingPayment] = useState(false);

    // Filter unpaid/partially-paid projects for payment modal
    const unpaidProjects = useMemo(() => {
        const list = client.projects || [];
        return list.filter((p) => {
            const total = Number(p.total_amount || 0);
            const paid = Number(p.paid_amount || 0);
            return total === 0 || paid < total;
        });
    }, [client.projects]);

    // Active project selected in the payment modal
    const selectedPaymentProject = useMemo(() => {
        const list = client.projects || [];
        return (
            list.find((p) => String(p.id) === String(paymentFormData.project_id)) ||
            unpaidProjects[0] ||
            list[0]
        );
    }, [client.projects, paymentFormData.project_id, unpaidProjects]);

    const paymentProjectTotal = Number(selectedPaymentProject?.total_amount || 0);
    const paymentProjectPaid = Number(selectedPaymentProject?.paid_amount || 0);
    const paymentProjectRemaining = Math.max(0, paymentProjectTotal - paymentProjectPaid);

    const applyPaymentShortcut = (type: 'dp30' | 'dp50' | 'full') => {
        if (!selectedPaymentProject) return;
        let amount = 0;
        let note = '';
        if (type === 'dp30') {
            amount = Math.round(paymentProjectTotal * 0.3);
            note = `DP 30% - ${selectedPaymentProject.name}`;
        } else if (type === 'dp50') {
            amount = Math.round(paymentProjectTotal * 0.5);
            note = `DP 50% - ${selectedPaymentProject.name}`;
        } else if (type === 'full') {
            amount = paymentProjectRemaining > 0 ? paymentProjectRemaining : paymentProjectTotal;
            note = `Pelunasan Sisa Tagihan - ${selectedPaymentProject.name}`;
        }
        setPaymentFormData((prev) => ({
            ...prev,
            amount: String(amount),
            notes: note,
        }));
    };

    // Dynamic Projects list data from real database
    const rawProjects = useMemo(() => {
        if (client.projects && client.projects.length > 0) {
            return client.projects.map((p) => {
                const total = Number(p.total_amount || 0);
                const paid = Number(p.paid_amount || 0);
                const progress = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : (p.status === 'completed' ? 100 : 50);
                const isCompleted = p.status === 'completed' || (total > 0 && paid >= total);

                return {
                    id: p.id,
                    name: p.name || 'Project',
                    package_name: p.package?.name
                        ? `${p.category?.name || 'Project'} • ${p.package?.name}`
                        : (p.category?.name || 'Photoshoot Project'),
                    project_number: p.project_number || 'PRJ-AUTO',
                    event_date: p.event_date ? formatDate(p.event_date) : '-',
                    location: p.location || '-',
                    thumbnail: p.thumbnail || (p.category?.name?.toLowerCase().includes('prewed')
                        ? 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&auto=format&fit=crop&q=80'
                        : 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80'),
                    total_amount: total,
                    paid_amount: paid,
                    progress: progress,
                    status: isCompleted ? 'completed' : (p.status || 'in_progress'),
                    status_label: isCompleted ? 'Selesai' : 'Berlangsung',
                };
            });
        }
        return [];
    }, [client.projects]);

    // Financial Calculation (Dynamic from DB)
    const totalProjectValue = useMemo(() => {
        if (client.projects && client.projects.length > 0) {
            return client.projects.reduce((acc, p) => acc + Number(p.total_amount || 0), 0);
        }
        return 0;
    }, [client.projects]);

    const totalPaid = useMemo(() => {
        if (client.payments && client.payments.length > 0) {
            return client.payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
        }
        if (client.projects && client.projects.length > 0) {
            return client.projects.reduce((acc, p) => acc + Number(p.paid_amount || 0), 0);
        }
        return 0;
    }, [client.payments, client.projects]);

    const outstanding = Math.max(0, totalProjectValue - totalPaid);

    // Project counts by status from DB
    const completedCount = useMemo(() => {
        return rawProjects.filter((p) => p.status === 'completed' || p.progress === 100).length;
    }, [rawProjects]);

    const inProgressCount = useMemo(() => {
        return rawProjects.filter((p) => p.status === 'in_progress' || (p.progress > 0 && p.progress < 100)).length;
    }, [rawProjects]);

    const upcomingCount = useMemo(() => {
        return rawProjects.filter((p) => p.status === 'lead' || p.progress === 0).length;
    }, [rawProjects]);


    const handleAddEditChild = () => {
        setEditFormData((prev) => {
            const nextChildren = [
                ...(prev.children || []),
                { name: '', nickname: '', birth_date: '', gender: 'male' as const },
            ];
            const names = nextChildren.map((c) => c.name.trim()).filter(Boolean).join(' & ');
            const isTwin = nextChildren.length > 1;
            return {
                ...prev,
                children: nextChildren,
                child_name: isTwin && names ? `${names} (Kembar)` : names,
            };
        });
    };

    const handleRemoveEditChild = (index: number) => {
        setEditFormData((prev) => {
            const currentChildren = prev.children || [];
            if (currentChildren.length <= 1) return prev;
            const nextChildren = currentChildren.filter((_, i) => i !== index);
            const names = nextChildren.map((c) => c.name.trim()).filter(Boolean).join(' & ');
            const isTwin = nextChildren.length > 1;
            return {
                ...prev,
                children: nextChildren,
                child_name: isTwin && names ? `${names} (Kembar)` : names,
                child_birth_date: nextChildren[0]?.birth_date || '',
                child_gender: (nextChildren[0]?.gender || 'male') as 'male' | 'female',
            };
        });
    };

    const handleChildEditChange = (index: number, field: string, value: any) => {
        setEditFormData((prev) => {
            const currentChildren = prev.children || [];
            const nextChildren = currentChildren.map((child, i) =>
                i === index ? { ...child, [field]: value } : child
            );
            const names = nextChildren.map((c) => c.name.trim()).filter(Boolean).join(' & ');
            const isTwin = nextChildren.length > 1;
            return {
                ...prev,
                children: nextChildren,
                child_name: isTwin && names ? `${names} (Kembar)` : names,
                child_birth_date: nextChildren[0]?.birth_date || prev.child_birth_date,
                child_gender: (nextChildren[0]?.gender || prev.child_gender) as 'male' | 'female',
            };
        });
    };

    // Submit Edit Client Modal
    const handleSaveClientEdit = () => {
        if (!editFormData.name.trim()) {
            toast.error('Nama lengkap klien wajib diisi');
            return;
        }

        setSubmittingEdit(true);

        router.put(
            `/clients/${client.id}`,
            {
                name: editFormData.name,
                client_type: editFormData.client_type,
                partner_name: editFormData.partner_name || null,
                bride_name: editFormData.bride_name || null,
                bride_nickname: editFormData.bride_nickname || null,
                groom_name: editFormData.groom_name || null,
                groom_nickname: editFormData.groom_nickname || null,
                bride_birth_date: editFormData.bride_birth_date || null,
                groom_birth_date: editFormData.groom_birth_date || null,
                child_name: editFormData.child_name || null,
                child_birth_date: editFormData.child_birth_date || null,
                child_gender: editFormData.child_gender || null,
                father_name: editFormData.father_name || null,
                mother_name: editFormData.mother_name || null,
                children: editFormData.children || null,
                company_name: editFormData.company_name || null,
                email: editFormData.email || null,
                instagram: editFormData.instagram || null,
                phone: editFormData.phone || null,
                secondary_phone: editFormData.secondary_phone || null,
                preferred_contact: editFormData.preferred_contact,
                province: editFormData.province || null,
                province_code: editFormData.province_code || null,
                city: editFormData.city || null,
                city_code: editFormData.city_code || null,
                district: editFormData.district || null,
                district_code: editFormData.district_code || null,
                village: editFormData.village || null,
                village_code: editFormData.village_code || null,
                postal_code: editFormData.postal_code || null,
                address: editFormData.address || null,
                contact_person: editFormData.contact_person || null,
                occupation: editFormData.occupation || null,
                other_social_media: editFormData.other_social_media || null,
                event_type: editFormData.event_type || null,
                event_date: editFormData.event_date || null,
                event_time: editFormData.event_time || null,
                event_location: editFormData.event_location || null,
                package_id: editFormData.package_id || null,
                source: editFormData.source || 'Instagram',
                referred_by_client_id: editFormData.referred_by_client_id || null,
                wedding_organizer_id: editFormData.wedding_organizer_id || null,
                referral_name: editFormData.referral_name || null,
                status: editFormData.status,
                notes: editFormData.notes || null,
                tags: editFormData.tags || [],
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success('Data klien berhasil diperbarui!');
                    setIsEditClientModalOpen(false);
                },
                onError: (err) => {
                    const firstErr = Object.values(err)[0] as string;
                    toast.error(firstErr || 'Gagal memperbarui data klien. Periksa kembali form.');
                },
                onFinish: () => setSubmittingEdit(false),
            }
        );
    };

    // Submit Tambah Pembayaran Modal
    const handleSavePayment = (e: React.FormEvent) => {
        e.preventDefault();

        if (!paymentFormData.amount || Number(paymentFormData.amount) <= 0) {
            toast.error('Nominal pembayaran wajib diisi lebih dari 0');
            return;
        }

        const targetProjectId = paymentFormData.project_id || (client.projects?.[0]?.id ?? '');
        if (!targetProjectId) {
            toast.error('Silakan pilih project tujuan pembayaran');
            return;
        }

        setSubmittingPayment(true);

        const payload: Record<string, any> = {
            project_id: targetProjectId,
            amount: Number(paymentFormData.amount),
            payment_date: paymentFormData.payment_date,
            payment_method_id: paymentFormData.payment_method_id || payment_methods?.[0]?.id,
            reference_number: paymentFormData.reference_number || null,
            notes: paymentFormData.notes || null,
        };

        if (paymentFormData.proof_file) {
            payload.proof_file = paymentFormData.proof_file;
        }

        router.post(
            '/finance/payments',
            payload,
            {
                forceFormData: true,
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success('Pembayaran dan bukti transfer berhasil dicatat!');
                    setIsPaymentModalOpen(false);
                    setPaymentFormData({
                        project_id: client.projects?.[0]?.id || '',
                        amount: '',
                        payment_date: new Date().toISOString().split('T')[0],
                        payment_method_id: payment_methods?.[0]?.id || '1',
                        reference_number: '',
                        notes: 'Pelunasan / DP Project',
                        proof_file: null,
                    });
                },
                onError: (errors) => {
                    const msg = Object.values(errors)[0] as string;
                    toast.error(msg || 'Gagal mencatat pembayaran. Periksa input data.');
                },
                onFinish: () => setSubmittingPayment(false),
            }
        );
    };

    // Dynamic Activities Log from DB
    const activityItems = useMemo(() => {
        const items: Array<any> = [];

        // Real recorded payments
        if (client.payments && client.payments.length > 0) {
            client.payments.slice(0, 3).forEach((pay, idx) => {
                items.push({
                    id: `pay-${pay.id || idx}`,
                    type: 'payment',
                    title: 'Pembayaran diterima',
                    subtitle: `Invoice #${pay.reference_number || `INV-${new Date().getFullYear()}-01${idx + 1}`}`,
                    timeText: pay.payment_date ? `${formatDate(pay.payment_date)}, 14:30 WIB` : '-',
                    iconBg: 'bg-emerald-50 border-emerald-100 text-emerald-600',
                    icon: Receipt,
                });
            });
        }

        // Real projects
        if (client.projects && client.projects.length > 0) {
            client.projects.slice(0, 2).forEach((proj, idx) => {
                items.push({
                    id: `proj-${proj.id || idx}`,
                    type: 'project',
                    title: 'Project dibuat / berjalan',
                    subtitle: `${proj.category?.name || 'Project'} - ${proj.name}`,
                    timeText: proj.created_at ? formatDate(proj.created_at) : (proj.event_date ? formatDate(proj.event_date) : '-'),
                    iconBg: 'bg-purple-50 border-purple-100 text-purple-600',
                    icon: Calendar,
                });
            });
        }

        // Client Intake registration
        if (client.created_at) {
            items.push({
                id: 'client-intake',
                type: 'client',
                title: 'Klien Terdaftar',
                subtitle: 'Data profil klien berhasil disimpan ke sistem',
                timeText: formatDate(client.created_at),
                iconBg: 'bg-indigo-50 border-indigo-100 text-indigo-600',
                icon: Shield,
            });
        }

        return items;
    }, [client.payments, client.projects, client.created_at]);

    const openEditModal = () => {
        setEditFormData({
            name: client.name || '',
            client_type: client.client_type || 'wedding',
            partner_name: client.partner_name || '',
            bride_name: client.bride_name || '',
            bride_nickname: client.bride_nickname || '',
            groom_name: client.groom_name || '',
            groom_nickname: client.groom_nickname || '',
            bride_birth_date: client.bride_birth_date ? String(client.bride_birth_date).substring(0, 10) : '',
            groom_birth_date: client.groom_birth_date ? String(client.groom_birth_date).substring(0, 10) : '',
            child_name: client.child_name || '',
            child_birth_date: client.child_birth_date ? String(client.child_birth_date).substring(0, 10) : '',
            child_gender: (client.child_gender || 'male') as 'male' | 'female',
            father_name: client.father_name || '',
            mother_name: client.mother_name || '',
            children: (client.children && Array.isArray(client.children) && client.children.length > 0)
                ? client.children
                : [{ name: client.child_name || '', nickname: '', birth_date: client.child_birth_date ? String(client.child_birth_date).substring(0, 10) : '', gender: (client.child_gender || 'male') }],
            company_name: client.company_name || '',
            email: client.email || '',
            instagram: client.instagram || '',
            phone: client.phone || '',
            secondary_phone: client.secondary_phone || '',
            preferred_contact: client.preferred_contact || 'WhatsApp',
            province: client.province || '',
            province_code: client.province_code || '',
            city: client.city || '',
            city_code: client.city_code || '',
            district: client.district || '',
            district_code: client.district_code || '',
            village: client.village || '',
            village_code: client.village_code || '',
            postal_code: client.postal_code || '',
            address: client.address || '',
            contact_person: client.contact_person || '',
            occupation: client.occupation || '',
            other_social_media: client.other_social_media || '',
            event_type: client.projects?.[0]?.category?.name || 'Wedding',
            event_date: client.projects?.[0]?.event_date ? String(client.projects[0].event_date).substring(0, 10) : '',
            event_time: client.projects?.[0]?.event_time || '16:00',
            event_location: client.projects?.[0]?.location || '',
            package_id: client.projects?.[0]?.package_id ? String(client.projects[0].package_id) : '',
            source: client.source || 'Instagram',
            referred_by_client_id: client.referred_by_client_id || '',
            wedding_organizer_id: client.wedding_organizer_id || '',
            referral_name: client.referral_name || '',
            status: client.status || 'active',
            notes: client.notes || '',
            tags: (Array.isArray(client.tags) ? client.tags : []) as string[],
        });
        setEditActiveFormTab('profile');
        setFormErrors({});
        setIsEditClientModalOpen(true);
    };

    // -------------------------------------------------------------
    // -------------------------------------------------------------
    // PROJECT STATUS CONSTANTS & HELPERS
    // -------------------------------------------------------------
    const PROJECT_STATUS_OPTIONS = [
        { value: 'draft', label: 'Draft', dotColor: 'bg-slate-400', textColor: 'text-slate-700' },
        { value: 'in_progress', label: 'Dalam Proses', dotColor: 'bg-indigo-500', textColor: 'text-indigo-700' },
        { value: 'editing', label: 'Editing', dotColor: 'bg-purple-500', textColor: 'text-purple-700' },
        { value: 'completed', label: 'Selesai', dotColor: 'bg-emerald-500', textColor: 'text-emerald-700' },
        { value: 'on_hold', label: 'Ditunda', dotColor: 'bg-amber-500', textColor: 'text-amber-700' },
        { value: 'cancelled', label: 'Dibatalkan', dotColor: 'bg-rose-500', textColor: 'text-rose-700' },
    ];

    const getProjectStatusBadgeStyle = (status?: string) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'in_progress':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'editing':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'on_hold':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'cancelled':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'draft':
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getProjectStatusBadgeVariant = (status?: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'info';
            case 'editing': return 'primary';
            case 'on_hold': return 'warning';
            case 'cancelled': return 'danger';
            case 'draft':
            default: return 'outline';
        }
    };

    const getProjectStatusLabel = (status?: string) => {
        switch (status) {
            case 'completed':
                return 'Selesai';
            case 'in_progress':
                return 'Dalam Proses';
            case 'editing':
                return 'Editing';
            case 'on_hold':
                return 'Ditunda';
            case 'cancelled':
                return 'Dibatalkan';
            case 'draft':
            default:
                return 'Draft';
        }
    };

    // -------------------------------------------------------------
    // STATES FOR TAB 2: PROJECTS & ORDERS (Gambar 4)
    // -------------------------------------------------------------
    const [projectSearchQuery, setProjectSearchQuery] = useState('');
    const [projectStatusFilter, setProjectStatusFilter] = useState('all');
    const [projectPeriodFilter, setProjectPeriodFilter] = useState('all');
    const [projectCurrentPage, setProjectCurrentPage] = useState(1);

    const initialProjectsList = useMemo(() => {
        if (client.projects && client.projects.length > 0) {
            return client.projects.map((p, idx) => ({
                id: p.id || String(idx + 1),
                code: p.project_number || `PRJ-${String(idx + 1).padStart(4, '0')}`,
                name: p.name || 'Project',
                event_date: p.event_date ? formatDate(p.event_date) : '-',
                package_name: p.package?.name || (client.client_type === 'corporate' ? 'Company Profile' : (p.category?.name || 'Paket Dokumentasi')),
                status: getProjectStatusLabel(p.status),
                status_color: getProjectStatusBadgeVariant(p.status),
                total_amount: Number(p.total_amount || 0),
                updated_at: p.updated_at ? formatDate(p.updated_at) : (p.created_at ? formatDate(p.created_at) : '-'),
            }));
        }
        return [];
    }, [client.projects, client.client_type]);

    const filteredProjectsTable = useMemo(() => {
        return initialProjectsList.filter((item) => {
            const matchesSearch =
                item.name.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
                item.code.toLowerCase().includes(projectSearchQuery.toLowerCase()) ||
                item.package_name.toLowerCase().includes(projectSearchQuery.toLowerCase());
            const matchesStatus =
                projectStatusFilter === 'all' ||
                (projectStatusFilter === 'completed' && item.status === 'Selesai') ||
                (projectStatusFilter === 'in_progress' && item.status === 'Sedang Dikerjakan') ||
                (projectStatusFilter === 'upcoming' && item.status === 'Akan Datang');
            return matchesSearch && matchesStatus;
        });
    }, [initialProjectsList, projectSearchQuery, projectStatusFilter]);

    // -------------------------------------------------------------
    // STATES FOR TAB 3: PEMBAYARAN (Gambar 1)
    // -------------------------------------------------------------
    const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
    const [paymentCurrentPage, setPaymentCurrentPage] = useState(1);

    const initialInvoicesList = useMemo(() => {
        if (client.payments && client.payments.length > 0) {
            return client.payments.map((p, idx) => {
                const total = Number(p.amount || 0);
                return {
                    id: String(p.id || idx + 1),
                    invoice_no: p.reference_number || `INV-${String(idx + 1).padStart(4, '0')}`,
                    project_name: p.project?.name || client.projects?.[0]?.name || 'Project',
                    invoice_date: p.payment_date ? formatDate(p.payment_date) : '-',
                    due_date: p.due_date ? formatDate(p.due_date) : '-',
                    total_amount: total,
                    paid_amount: total,
                    remaining_amount: 0,
                    status: 'Lunas',
                    status_variant: 'success',
                    payment_method: p.payment_method?.name || (typeof p.payment_method === 'string' ? p.payment_method : 'Transfer BCA'),
                    paid_at: p.payment_date ? formatDate(p.payment_date) : '-',
                };
            });
        }
        return [];
    }, [client.payments, client.projects]);

    const filteredInvoicesList = useMemo(() => {
        return initialInvoicesList.filter((inv) => {
            const matchesSearch =
                inv.invoice_no.toLowerCase().includes(paymentSearchQuery.toLowerCase()) ||
                inv.project_name.toLowerCase().includes(paymentSearchQuery.toLowerCase());
            const matchesStatus =
                paymentStatusFilter === 'all' ||
                (paymentStatusFilter === 'lunas' && inv.status === 'Lunas') ||
                (paymentStatusFilter === 'sebagian' && inv.status === 'Sebagian') ||
                (paymentStatusFilter === 'unpaid' && inv.status === 'Belum Dibayar');
            const matchesMethod =
                paymentMethodFilter === 'all' || inv.payment_method.toLowerCase().includes(paymentMethodFilter.toLowerCase());
            return matchesSearch && matchesStatus && matchesMethod;
        });
    }, [initialInvoicesList, paymentSearchQuery, paymentStatusFilter, paymentMethodFilter]);

    const paymentSummary = useMemo(() => {
        const totalTagihan = totalProjectValue > 0
            ? totalProjectValue
            : (initialInvoicesList.reduce((acc, i) => acc + i.total_amount, 0) || 101500000);
        const totalDibayar = totalPaid > 0
            ? totalPaid
            : (initialInvoicesList.reduce((acc, i) => acc + i.paid_amount, 0) || 85750000);
        const sisaTagihan = Math.max(0, totalTagihan - totalDibayar);
        const percent = totalTagihan > 0 ? Math.min(100, Number(((totalDibayar / totalTagihan) * 100).toFixed(2))) : 0;
        const invoiceCount = initialInvoicesList.length || client.projects?.length || 9;
        const paymentCount = client.payments?.length || 8;
        const unpaidInvoiceCount = initialInvoicesList.filter((i) => i.remaining_amount > 0).length || (sisaTagihan > 0 ? 3 : 0);

        return {
            totalTagihan,
            totalDibayar,
            sisaTagihan,
            percent,
            invoiceCount,
            paymentCount,
            unpaidInvoiceCount,
        };
    }, [totalProjectValue, totalPaid, initialInvoicesList, client.projects, client.payments]);

    // -------------------------------------------------------------
    // STATES FOR TAB 4: FILES & TIMELINE — REAL-TIME DATABASE
    // -------------------------------------------------------------
    // Init selectedProjectId from first real project in DB
    const [selectedProjectId, setSelectedProjectId] = useState<string>(
        () => String(client.projects?.[0]?.id || '1')
    );

    // Master Workflows from DB props or standard definitions
    const masterWorkflows: WorkflowDefinition[] = useMemo(() => {
        if (workflows && workflows.length > 0) {
            return workflows.map((wf: any, idx: number) => ({
                id: Number(wf.id) || idx + 1,
                type: (wf.type || 'wedding') as 'wedding' | 'non_wedding' | 'custom',
                name: wf.name || `Workflow ${idx + 1}`,
                description: wf.description || '',
                steps_count: wf.steps?.length || wf.steps_count || 0,
                steps: (wf.steps || []).map((s: any, sIdx: number) => ({
                    id: s.id || sIdx + 1,
                    num: s.num || sIdx + 1,
                    name: s.name || s.title || `Tahap ${sIdx + 1}`,
                    phase: s.phase || 'Operasional',
                    duration: s.duration || s.dl || s.dur || 'H+14',
                    activity: s.activity || s.description || '',
                    dur: s.dur || s.duration || 'H+14',
                    dl: s.dl || s.duration || 'H+14',
                    deliv: s.deliv || s.name,
                    description: s.description || s.activity || '',
                })),
            }));
        }
        return ALL_WORKFLOWS;
    }, [workflows]);

    // Selected project from initialProjectsList (frontend shape)
    const selectedProject = useMemo(() => {
        return initialProjectsList.find((p) => String(p.id) === String(selectedProjectId)) || initialProjectsList[0];
    }, [initialProjectsList, selectedProjectId]);

    // Raw project from client.projects (backend shape, has workflow_step, custom_timeline, file_links)
    const selectedRawProject = useMemo(() => {
        return client.projects?.find((p: any) => String(p.id) === String(selectedProject?.id)) || client.projects?.[0];
    }, [client.projects, selectedProject?.id]);

    // Selected project's Category & Package from Master Data
    const projectCategory = useMemo(() => {
        return (
            selectedRawProject?.category ||
            categories.find((c) => String(c.id) === String(selectedRawProject?.category_id)) ||
            null
        );
    }, [selectedRawProject, categories]);

    const selectedProjectPackage = useMemo(() => {
        return (
            selectedRawProject?.package ||
            packages.find((p) => String(p.id) === String(selectedRawProject?.package_id)) ||
            null
        );
    }, [selectedRawProject, packages]);

    // Automatically resolve workflow definition from selected project category and package
    const activeWorkflowDef = useMemo(() => {
        return resolveWorkflow(projectCategory, masterWorkflows, {
            name: selectedProjectPackage?.name || selectedProject?.package_name || selectedProject?.name,
            service_name: selectedProject?.name,
        });
    }, [projectCategory, masterWorkflows, selectedProjectPackage, selectedProject]);

    const [selectedStageIndex, setSelectedStageIndex] = useState<number>(0);
    const [isAddDriveLinkModalOpen, setIsAddDriveLinkModalOpen] = useState(false);
    // Local list only for optimistic additions (no dummy data)
    const [driveLinksList, setDriveLinksList] = useState<Array<{ id: string; projectId: string; title: string; url: string; uploader: string; date: string }>>([]);
    const [newDriveTitle, setNewDriveTitle] = useState('');
    const [newDriveUrl, setNewDriveUrl] = useState('');

    // Checklist synced from DB custom_timeline.checklist
    const [jobChecklist, setJobChecklist] = useState(() => {
        const dbChecklist = client.projects?.[0]?.custom_timeline?.checklist || {};
        return {
            editedPhoto: dbChecklist.editedPhoto ?? false,
            revisiEditedPhoto: dbChecklist.revisiEditedPhoto ?? false,
            finalEditedPhoto: dbChecklist.finalEditedPhoto ?? false,
            editedVideoHL: dbChecklist.editedVideoHL ?? false,
            revisiEditedVideoHL: dbChecklist.revisiEditedVideoHL ?? false,
            editedFullDoc: dbChecklist.editedFullDoc ?? false,
            finalEditedVideoHL: dbChecklist.finalEditedVideoHL ?? false,
            finalEditedFullDoc: dbChecklist.finalEditedFullDoc ?? false,
        };
    });

    const projectSearchOptions = useMemo(() => {
        return initialProjectsList.map((p) => ({
            value: String(p.id),
            label: `${p.code} - ${p.name}`,
            subtitle: `${p.package_name} • ${p.event_date} (${p.status})`,
        }));
    }, [initialProjectsList]);

    const currentStages = useMemo(() => {
        const isCompleted = selectedProject?.status === 'Selesai';
        const isUpcoming = selectedProject?.status === 'Akan Datang';
        // Real workflow_step from DB to mark the active stage
        const dbWorkflowStep = (selectedRawProject?.workflow_step || '').toLowerCase().trim();
        const steps = activeWorkflowDef.steps || [];
        const customStagesList: any[] = selectedRawProject?.custom_timeline?.stages || [];

        // Helper: determine stage status based on DB workflow_step and progress
        const getStageStatus = (
            stageTitle: string,
            stageIndex: number,
            totalStages: number
        ): 'done' | 'active' | 'pending' => {
            if (isCompleted) return 'done';
            if (isUpcoming) return stageIndex === 0 ? 'active' : 'pending';
            // Match by workflow_step name from DB
            const isActiveStep = dbWorkflowStep && stageTitle.toLowerCase().includes(dbWorkflowStep.split(' ')[0]);
            if (isActiveStep) return 'active';
            // Determine by DB progress if no workflow_step match
            const dbProgress = Number(selectedRawProject?.progress || 0);
            const progressPerStep = 100 / (totalStages || 1);
            const stepsCompleted = Math.floor(dbProgress / progressPerStep);
            if (stageIndex < stepsCompleted) return 'done';
            if (stageIndex === stepsCompleted) return 'active';
            return 'pending';
        };

        return steps.map((s, idx) => {
            const customOverride = customStagesList.find(
                (cs: any) => cs.step === (s.num || idx + 1) || String(cs.id) === String(s.id)
            );
            const defaultStatus = getStageStatus(s.name, idx, steps.length);
            const defaultPic =
                idx === 0
                    ? 'Admin Finance & CRM'
                    : idx === 1
                        ? 'Project Officer & WO'
                        : idx === 2
                            ? 'Lead Photographer & Crew'
                            : idx === 3
                                ? 'Lead Colorist & Retoucher'
                                : idx === 4
                                    ? 'Warehouse & Packaging'
                                    : idx === 5
                                        ? 'Video Editor & Colorist'
                                        : idx === 6
                                            ? 'Album Layout Designer'
                                            : 'Logistics & Handover Team';

            const title = customOverride?.title || s.name;
            const phase = customOverride?.phase || s.phase || 'Operasional';
            const duration = customOverride?.duration || s.duration || s.dl || s.dur || 'H+14';
            const deliv = customOverride?.deliv || s.deliv || s.name;
            const activity = customOverride?.activity || s.activity || s.description || '';
            const pic = customOverride?.pic || defaultPic;
            const stStatus: 'done' | 'active' | 'pending' = customOverride?.status || defaultStatus;
            const progress =
                typeof customOverride?.progress === 'number'
                    ? customOverride.progress
                    : stStatus === 'done'
                        ? 100
                        : stStatus === 'active'
                            ? Number(selectedRawProject?.progress || 0)
                            : 0;

            return {
                id: s.id || idx + 1,
                step: s.num || idx + 1,
                title: title,
                phase: phase,
                duration: duration,
                deliv: deliv,
                activity: activity,
                date: stStatus === 'done' ? 'Selesai' : stStatus === 'active' ? 'Sedang Dikerjakan' : duration || 'Belum Dimulai',
                status: stStatus,
                progress: progress,
                pic: pic,
                description: activity || 'Pekerjaan berjalan sesuai SOP dan timeline produksi.',
                isCustom: !!customOverride,
            };
        });
    }, [activeWorkflowDef, selectedProject, selectedRawProject]);

    const completedStagesCount = useMemo(() => {
        return currentStages.filter((s) => s.status === 'done').length;
    }, [currentStages]);

    const overallProgressPercent = useMemo(() => {
        if (selectedProject?.status === 'Selesai') return 100;
        if (selectedProject?.status === 'Akan Datang') return 15;
        return Math.round((completedStagesCount / (currentStages.length || 1)) * 100);
    }, [selectedProject, completedStagesCount, currentStages.length]);

    const selectedStage = useMemo(() => {
        if (selectedStageIndex >= currentStages.length) {
            return currentStages[currentStages.length - 1] || currentStages[0];
        }
        return currentStages[selectedStageIndex] || currentStages[0];
    }, [currentStages, selectedStageIndex]);

    // Modal Edit Stage Timeline States
    const [isEditStageModalOpen, setIsEditStageModalOpen] = useState(false);
    const [editingStageIndex, setEditingStageIndex] = useState<number>(0);
    const [stageFormData, setStageFormData] = useState({
        step: 1,
        title: '',
        phase: 'Pra-Acara',
        duration: '',
        deliv: '',
        activity: '',
        pic: '',
        status: 'pending' as 'done' | 'active' | 'pending',
        progress: 0,
    });
    const [isSavingStage, setIsSavingStage] = useState(false);

    const openEditStageModal = (stageIdx: number) => {
        const stage = currentStages[stageIdx];
        if (!stage) return;
        setEditingStageIndex(stageIdx);
        setStageFormData({
            step: stage.step,
            title: stage.title,
            phase: stage.phase,
            duration: stage.duration,
            deliv: stage.deliv,
            activity: stage.activity || stage.description || '',
            pic: stage.pic,
            status: stage.status,
            progress: stage.progress,
        });
        setIsEditStageModalOpen(true);
    };

    const handleSaveStageEdit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const rawProject = client.projects?.find((p: any) => String(p.id) === String(selectedProject?.id));
        if (!rawProject?.id) {
            toast.error('Project tidak ditemukan.');
            return;
        }

        if (!stageFormData.title.trim()) {
            toast.error('Nama tahap tidak boleh kosong.');
            return;
        }

        setIsSavingStage(true);

        const currentCustomTimeline = rawProject.custom_timeline || {};
        const existingStages: any[] = currentCustomTimeline.stages || [];

        const updatedStageItem = {
            step: stageFormData.step,
            title: stageFormData.title.trim(),
            phase: stageFormData.phase.trim(),
            duration: stageFormData.duration.trim(),
            deliv: stageFormData.deliv.trim(),
            activity: stageFormData.activity.trim(),
            pic: stageFormData.pic.trim(),
            status: stageFormData.status,
            progress: Number(stageFormData.progress) || 0,
        };

        const otherStages = existingStages.filter((s: any) => s.step !== stageFormData.step);
        const newStagesList = [...otherStages, updatedStageItem].sort((a, b) => a.step - b.step);

        const newCustomTimeline = {
            ...currentCustomTimeline,
            stages: newStagesList,
        };

        let updatedWorkflowStep = rawProject.workflow_step;
        let updatedProjectStatus = rawProject.status;
        let updatedProjectProgress = rawProject.progress;

        if (stageFormData.status === 'active') {
            updatedWorkflowStep = stageFormData.title;
            updatedProjectStatus = 'in_progress';
            updatedProjectProgress = Math.round((editingStageIndex / (currentStages.length || 1)) * 100);
        } else if (stageFormData.status === 'done') {
            const allDone = currentStages.every((s, idx) => (idx === editingStageIndex ? true : s.status === 'done'));
            if (allDone) {
                updatedProjectStatus = 'completed';
                updatedProjectProgress = 100;
            }
        }

        router.patch(
            `/projects/${rawProject.id}/status`,
            {
                custom_timeline: newCustomTimeline,
                workflow_step: updatedWorkflowStep,
                status: updatedProjectStatus,
                progress: updatedProjectProgress,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Tahap ${stageFormData.step} "${stageFormData.title}" berhasil diperbarui!`);
                    setIsEditStageModalOpen(false);
                },
                onError: () => {
                    toast.error('Gagal memperbarui detail tahap. Silakan coba lagi.');
                },
                onFinish: () => {
                    setIsSavingStage(false);
                },
            }
        );
    };

    const handleResetStageToDefault = () => {
        const rawProject = client.projects?.find((p: any) => String(p.id) === String(selectedProject?.id));
        if (!rawProject?.id) return;

        setIsSavingStage(true);
        const currentCustomTimeline = rawProject.custom_timeline || {};
        const existingStages: any[] = currentCustomTimeline.stages || [];
        const newStagesList = existingStages.filter((s: any) => s.step !== stageFormData.step);

        router.patch(
            `/projects/${rawProject.id}/status`,
            {
                custom_timeline: {
                    ...currentCustomTimeline,
                    stages: newStagesList,
                },
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Tahap ${stageFormData.step} dikembalikan ke alur standar.`);
                    setIsEditStageModalOpen(false);
                },
                onError: () => {
                    toast.error('Gagal mereset tahap.');
                },
                onFinish: () => {
                    setIsSavingStage(false);
                },
            }
        );
    };

    const handleSelectProject = (projectId: string) => {
        setSelectedProjectId(projectId);
        setSelectedStageIndex(0);

        const rawProj = client.projects?.find((p: any) => String(p.id) === String(projectId));
        if (rawProj) {
            // Sync checklist from the newly selected project's DB custom_timeline
            const dbChecklist = rawProj.custom_timeline?.checklist || {};
            setJobChecklist({
                editedPhoto: dbChecklist.editedPhoto ?? false,
                revisiEditedPhoto: dbChecklist.revisiEditedPhoto ?? false,
                finalEditedPhoto: dbChecklist.finalEditedPhoto ?? false,
                editedVideoHL: dbChecklist.editedVideoHL ?? false,
                revisiEditedVideoHL: dbChecklist.revisiEditedVideoHL ?? false,
                editedFullDoc: dbChecklist.editedFullDoc ?? false,
                finalEditedVideoHL: dbChecklist.finalEditedVideoHL ?? false,
                finalEditedFullDoc: dbChecklist.finalEditedFullDoc ?? false,
            });
        }
    };

    // Update timetable stage — PATCH /projects/{id}/status
    const [updatingStage, setUpdatingStage] = useState(false);
    const handleUpdateStage = (newWorkflowStep: string, newStatus: 'in_progress' | 'completed', newProgress: number) => {
        const rawProject = client.projects?.find((p: any) => String(p.id) === String(selectedProject?.id));
        if (!rawProject?.id) { toast.error('Project tidak ditemukan'); return; }
        setUpdatingStage(true);
        router.patch(
            `/projects/${rawProject.id}/status`,
            { workflow_step: newWorkflowStep, status: newStatus, progress: newProgress },
            {
                preserveScroll: true,
                onSuccess: () => toast.success(`Tahap "${newWorkflowStep}" berhasil diperbarui!`),
                onError: () => toast.error('Gagal memperbarui status tahap. Silakan coba lagi.'),
                onFinish: () => setUpdatingStage(false),
            }
        );
    };

    // Quick Update Project Overall Status — Gambar 2
    const handleUpdateProjectStatus = (newStatus: string) => {
        const rawProject = client.projects?.find((p: any) => String(p.id) === String(selectedProject?.id));
        if (!rawProject?.id) {
            toast.error('Project tidak ditemukan.');
            return;
        }

        let newProgress = rawProject.progress;
        let newStep = rawProject.workflow_step;

        if (newStatus === 'completed') {
            newProgress = 100;
            newStep = currentStages[currentStages.length - 1]?.title || 'Selesai';
        } else if (newStatus === 'draft') {
            newProgress = 0;
            newStep = currentStages[0]?.title || 'Booking';
        } else if (newStatus === 'in_progress' && (rawProject.progress === 0 || !rawProject.progress)) {
            newProgress = Math.round((1 / (currentStages.length || 1)) * 100);
            newStep = currentStages[1]?.title || currentStages[0]?.title || 'Dalam Proses';
        } else if (newStatus === 'editing') {
            const editingStage = currentStages.find((s) => s.title.toLowerCase().includes('edit') || s.phase.toLowerCase().includes('edit'));
            if (editingStage) {
                newStep = editingStage.title;
            }
        }

        router.patch(
            `/projects/${rawProject.id}/status`,
            {
                status: newStatus,
                progress: newProgress,
                workflow_step: newStep,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Status project berhasil diubah menjadi: ${getProjectStatusLabel(newStatus)}`);
                },
                onError: () => {
                    toast.error('Gagal memperbarui status project.');
                },
            }
        );
    };

    // Quick Update Individual Stage Status from Stepper — Gambar 1
    const handleQuickUpdateStageStatus = (stageIdx: number, newStatus: 'done' | 'active' | 'pending') => {
        const rawProject = client.projects?.find((p: any) => String(p.id) === String(selectedProject?.id));
        if (!rawProject?.id) {
            toast.error('Project tidak ditemukan.');
            return;
        }

        const targetStage = currentStages[stageIdx];
        if (!targetStage) return;

        const currentCustomTimeline = rawProject.custom_timeline || {};
        const existingStages: any[] = currentCustomTimeline.stages || [];

        const updatedStageItem = {
            step: targetStage.step,
            title: targetStage.title,
            phase: targetStage.phase,
            duration: targetStage.duration,
            deliv: targetStage.deliv,
            activity: targetStage.activity,
            pic: targetStage.pic,
            status: newStatus,
            progress: newStatus === 'done' ? 100 : newStatus === 'active' ? (rawProject.progress || 50) : 0,
        };

        const otherStages = existingStages.filter((s: any) => s.step !== targetStage.step);
        const newStagesList = [...otherStages, updatedStageItem].sort((a, b) => a.step - b.step);

        const newCustomTimeline = {
            ...currentCustomTimeline,
            stages: newStagesList,
        };

        let updatedWorkflowStep = rawProject.workflow_step;
        let updatedProjectStatus = rawProject.status;
        let updatedProjectProgress = rawProject.progress;

        if (newStatus === 'active') {
            updatedWorkflowStep = targetStage.title;
            if (rawProject.status === 'draft' || rawProject.status === 'pending' || rawProject.status === 'completed') {
                updatedProjectStatus = 'in_progress';
            }
            updatedProjectProgress = Math.round(((stageIdx + 0.5) / (currentStages.length || 1)) * 100);
        } else if (newStatus === 'done') {
            const allDone = currentStages.every((s, idx) => (idx === stageIdx ? true : s.status === 'done'));
            if (allDone) {
                updatedProjectStatus = 'completed';
                updatedProjectProgress = 100;
            } else {
                const nextIdx = stageIdx + 1;
                if (nextIdx < currentStages.length) {
                    updatedWorkflowStep = currentStages[nextIdx].title;
                }
                if (rawProject.status === 'draft' || rawProject.status === 'pending') {
                    updatedProjectStatus = 'in_progress';
                }
                const completedCount = currentStages.filter((s, idx) => (idx === stageIdx ? true : s.status === 'done')).length;
                updatedProjectProgress = Math.round((completedCount / (currentStages.length || 1)) * 100);
            }
        } else if (newStatus === 'pending') {
            if (rawProject.workflow_step === targetStage.title) {
                const prevStage = stageIdx > 0 ? currentStages[stageIdx - 1] : null;
                updatedWorkflowStep = prevStage ? prevStage.title : currentStages[0]?.title || 'Booking';
            }
            if (rawProject.status === 'completed') {
                updatedProjectStatus = 'in_progress';
            }
            const completedCount = currentStages.filter((s, idx) => (idx === stageIdx ? false : s.status === 'done')).length;
            updatedProjectProgress = Math.round((completedCount / (currentStages.length || 1)) * 100);
        }

        router.patch(
            `/projects/${rawProject.id}/status`,
            {
                custom_timeline: newCustomTimeline,
                workflow_step: updatedWorkflowStep,
                status: updatedProjectStatus,
                progress: updatedProjectProgress,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    const statusLabels = {
                        done: 'Selesai',
                        active: 'Sedang Dikerjakan',
                        pending: 'Belum Dimulai',
                    };
                    toast.success(`Tahap ${targetStage.step} "${targetStage.title}" ditandai ${statusLabels[newStatus]}!`);
                },
                onError: () => {
                    toast.error('Gagal memperbarui status tahap.');
                },
            }
        );
    };

    // Checklist toggle — PATCH custom_timeline.checklist to DB
    const [savingChecklist, setSavingChecklist] = useState(false);
    const handleChecklistChange = (taskId: string, isNowChecked: boolean, taskLabel: string) => {
        const newChecklist = { ...jobChecklist, [taskId]: isNowChecked };
        setJobChecklist(newChecklist as any);
        toast.success(isNowChecked ? `"${taskLabel}" ditandai selesai!` : `"${taskLabel}" dibatalkan.`);

        const rawProject = client.projects?.find((p: any) => String(p.id) === String(selectedProject?.id));
        if (!rawProject?.id) return;
        const currentTimeline = rawProject.custom_timeline || {};
        setSavingChecklist(true);
        router.patch(
            `/projects/${rawProject.id}/status`,
            { custom_timeline: { ...currentTimeline, checklist: newChecklist } },
            {
                preserveScroll: true,
                onError: () => {
                    setJobChecklist((prev) => ({ ...prev, [taskId]: !isNowChecked }));
                    toast.error('Gagal menyimpan checklist ke database.');
                },
                onFinish: () => setSavingChecklist(false),
            }
        );
    };

    // Delete file link — DELETE /files/{id}
    const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);
    const handleDeleteLink = (linkId: string, linkTitle: string) => {
        if (!confirm(`Hapus link "${linkTitle}"?`)) return;
        setDeletingLinkId(linkId);
        router.delete(`/files/${linkId}`, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Link "${linkTitle}" berhasil dihapus!`),
            onError: () => toast.error('Gagal menghapus link. Silakan coba lagi.'),
            onFinish: () => setDeletingLinkId(null),
        });
    };

    const handleCopyLink = (url: string) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            toast.success('Link Google Drive berhasil disalin ke clipboard!');
        } else {
            toast.info(`Link: ${url}`);
        }
    };

    // Merge DB file_links from selected project with locally-added ones
    const projectDriveLinks = useMemo(() => {
        const selectedRawProject = client.projects?.find((p: any) => String(p.id) === String(selectedProject?.id));
        const dbLinks: Array<{ id: string; projectId: string; title: string; url: string; uploader: string; date: string }> =
            (selectedRawProject?.file_links || []).map((fl: any) => ({
                id: String(fl.id),
                projectId: String(selectedRawProject.id),
                // FileLink model fields: name (judul), drive_url (URL), sender_name (accessor), sent_at (accessor)
                title: fl.name || 'Link Google Drive',
                url: fl.drive_url || '#',
                uploader: fl.sender_name || 'Admin Arams',
                date: fl.sent_at || fl.created_at?.substring(0, 10) || '-',
            }));

        // Append locally-added links for this project (optimistic UI)
        const localLinks = driveLinksList.filter(
            (dl) => String(dl.projectId) === String(selectedProject?.id)
        );

        // Return DB links combined with any local ones
        return [...dbLinks, ...localLinks];
    }, [driveLinksList, selectedProject?.id, client.projects]);

    const checkedTasksCount = useMemo(() => {
        return Object.values(jobChecklist).filter(Boolean).length;
    }, [jobChecklist]);

    // Sync selectedStageIndex to active stage from DB workflow_step on project switch
    useEffect(() => {
        const dbStep = (selectedRawProject?.workflow_step || '').toLowerCase().trim();
        if (!dbStep || selectedProject?.status === 'Selesai') {
            setSelectedStageIndex(0);
            return;
        }
        const stageIdx = currentStages.findIndex(
            (s) => s.title.toLowerCase().includes(dbStep.split(' ')[0])
        );
        setSelectedStageIndex(stageIdx >= 0 ? stageIdx : 0);
    }, [selectedRawProject?.workflow_step, currentStages, selectedProject?.status]);

    const [savingDriveLink, setSavingDriveLink] = useState(false);
    const [newDriveLinkType, setNewDriveLinkType] = useState('google_drive');

    const handleSaveDriveLink = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newDriveTitle.trim() || !newDriveUrl.trim()) {
            toast.error('Judul dan URL Google Drive wajib diisi');
            return;
        }

        const rawProject = client.projects?.find((p: any) => String(p.id) === String(selectedProject?.id));
        const projectId = rawProject?.id || selectedProject?.id;

        if (projectId) {
            // Persist to database via backend
            setSavingDriveLink(true);
            router.post(
                `/projects/${projectId}/file-links`,
                {
                    name: newDriveTitle.trim(),
                    drive_url: newDriveUrl.trim(),
                    file_type: newDriveLinkType,
                    is_link: true,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setNewDriveTitle('');
                        setNewDriveUrl('');
                        setIsAddDriveLinkModalOpen(false);
                        toast.success('Link Google Drive berhasil disimpan ke database!');
                    },
                    onError: () => {
                        toast.error('Gagal menyimpan link. Periksa koneksi atau format URL.');
                    },
                    onFinish: () => setSavingDriveLink(false),
                }
            );
        } else {
            // Optimistic local add (no project selected from DB)
            setDriveLinksList((prev) => [
                ...prev,
                {
                    id: String(Date.now()),
                    projectId: String(selectedProject?.id || '1'),
                    title: newDriveTitle.trim(),
                    url: newDriveUrl.trim(),
                    uploader: 'Admin Arams',
                    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                },
            ]);
            setNewDriveTitle('');
            setNewDriveUrl('');
            setIsAddDriveLinkModalOpen(false);
            toast.success('Link Google Drive berhasil disimpan!');
        }
    };

    // -------------------------------------------------------------
    // STATES FOR TAB 5: CATATAN (Gambar 3)
    // -------------------------------------------------------------
    const [noteInputText, setNoteInputText] = useState('');
    const [noteInputCategory, setNoteInputCategory] = useState('Preferensi');
    const [noteCategoryFilter, setNoteCategoryFilter] = useState('all');
    const [noteAuthorFilter, setNoteAuthorFilter] = useState('all');
    const [notesList, setNotesList] = useState<Array<{
        id: string;
        title: string;
        category: string;
        badge_color: 'warning' | 'success' | 'info' | 'purple';
        border_color: string;
        icon_color: string;
        content: string;
        author: string;
        date: string;
        project: string;
    }>>(() => {
        if (client.notes && client.notes.trim()) {
            return [
                {
                    id: 'client-note-1',
                    title: 'Catatan Klien',
                    category: 'Informasi',
                    badge_color: 'success' as const,
                    border_color: 'border-l-emerald-400',
                    icon_color: 'text-emerald-500 bg-emerald-50',
                    content: client.notes.trim(),
                    author: 'Admin Arams',
                    date: client.created_at ? formatDate(client.created_at) : '-',
                    project: client.projects?.[0]?.name || 'Profil Klien',
                },
            ];
        }
        return [];
    });

    const handleAddNote = () => {
        if (!noteInputText.trim()) {
            toast.error('Isi catatan tidak boleh kosong');
            return;
        }

        const categoryMeta: Record<string, { badge: any; border: string; icon: string }> = {
            Preferensi: { badge: 'warning', border: 'border-l-amber-400', icon: 'text-amber-500 bg-amber-50' },
            Informasi: { badge: 'success', border: 'border-l-emerald-400', icon: 'text-emerald-500 bg-emerald-50' },
            Pembayaran: { badge: 'info', border: 'border-l-blue-400', icon: 'text-blue-500 bg-blue-50' },
            Meeting: { badge: 'purple', border: 'border-l-purple-400', icon: 'text-purple-500 bg-purple-50' },
        };

        const meta = categoryMeta[noteInputCategory] || categoryMeta.Informasi;

        const newNoteObj = {
            id: String(Date.now()),
            title: `Catatan ${noteInputCategory}`,
            category: noteInputCategory,
            badge_color: meta.badge,
            border_color: meta.border,
            icon_color: meta.icon,
            content: noteInputText.trim(),
            author: 'Admin Arams',
            date: `${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
            project: client.projects?.[0]?.name || 'Profil Klien',
        };

        setNotesList((prev) => [newNoteObj, ...prev]);
        setNoteInputText('');
        toast.success('Catatan berhasil ditambahkan!');
    };

    const filteredNotesList = useMemo(() => {
        return notesList.filter((n) => {
            const matchesCat = noteCategoryFilter === 'all' || n.category.toLowerCase() === noteCategoryFilter.toLowerCase();
            const matchesAuth = noteAuthorFilter === 'all' || n.author.toLowerCase().includes(noteAuthorFilter.toLowerCase());
            return matchesCat && matchesAuth;
        });
    }, [notesList, noteCategoryFilter, noteAuthorFilter]);

    // -------------------------------------------------------------
    // STATES FOR TAB 6: RIWAYAT KOMUNIKASI
    // -------------------------------------------------------------
    const [commSearchQuery, setCommSearchQuery] = useState('');
    const [commChannelFilter, setCommChannelFilter] = useState('all');
    const [isAddCommModalOpen, setIsAddCommModalOpen] = useState(false);
    const [commList, setCommList] = useState<Array<{
        id: string;
        channel: string;
        icon_type: string;
        title: string;
        content: string;
        author: string;
        date: string;
        status: string;
    }>>([]);
    const [newCommFormData, setNewCommFormData] = useState({
        channel: 'WhatsApp',
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
    });

    const handleSaveComm = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newCommFormData.title.trim() || !newCommFormData.content.trim()) {
            toast.error('Judul dan isi catatan komunikasi wajib diisi');
            return;
        }
        setCommList((prev) => [
            {
                id: String(Date.now()),
                channel: newCommFormData.channel,
                icon_type: newCommFormData.channel.toLowerCase(),
                title: newCommFormData.title.trim(),
                content: newCommFormData.content.trim(),
                author: 'Admin Arams',
                date: `${formatDate(newCommFormData.date)}, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
                status: 'Selesai',
            },
            ...prev,
        ]);
        setNewCommFormData({
            channel: 'WhatsApp',
            title: '',
            content: '',
            date: new Date().toISOString().split('T')[0],
        });
        setIsAddCommModalOpen(false);
        toast.success('Riwayat komunikasi berhasil dicatat!');
    };

    // -------------------------------------------------------------
    // STATES FOR TAB 7: INFORMASI AKUN KLIEN (Gambar 5)
    // -------------------------------------------------------------
    const clientUser = client.user;
    const [isAccountActive, setIsAccountActive] = useState(true);
    const [accountEmail, setAccountEmail] = useState(clientUser?.email || client.email || '');
    const [accountUsername, setAccountUsername] = useState(
        clientUser?.email
            ? clientUser.email.split('@')[0]
            : (client.email
                ? client.email.split('@')[0]
                : (client.name ? client.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'klien'))
    );
    const [accountPassword, setAccountPassword] = useState('arams2026');
    const [accountPasswordConfirm, setAccountPasswordConfirm] = useState('arams2026');
    const [showAccountPassword, setShowAccountPassword] = useState(false);
    const [showAccountPasswordConfirm, setShowAccountPasswordConfirm] = useState(false);
    const [accountMessage, setAccountMessage] = useState(
        'Silakan login untuk memantau progress project, review foto, dan mengunduh file dokumentasi Anda.'
    );
    const [accountShareMethod, setAccountShareMethod] = useState<'email' | 'whatsapp' | 'both'>('email');
    const [submittingAccount, setSubmittingAccount] = useState(false);

    // Sync state if client props change
    useEffect(() => {
        if (client.user) {
            setAccountEmail(client.user.email);
            setAccountUsername(client.user.email.split('@')[0]);
        } else if (client.email) {
            setAccountEmail(client.email);
            setAccountUsername(client.email.split('@')[0]);
        }
    }, [client]);

    const handleSaveClientAccount = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!accountEmail.trim()) {
            toast.error('Email akun wajib diisi');
            return;
        }
        if (!accountPassword || accountPassword !== accountPasswordConfirm) {
            toast.error('Password dan konfirmasi password tidak cocok');
            return;
        }
        if (accountPassword.length < 6) {
            toast.error('Password minimal 6 karakter');
            return;
        }

        setSubmittingAccount(true);
        router.post(
            `/clients/${client.id}/account`,
            {
                email: accountEmail,
                username: accountUsername,
                password: accountPassword,
                send_method: accountShareMethod,
                message: accountMessage,
            },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    setSubmittingAccount(false);
                    toast.success(clientUser ? 'Kredensial akun klien berhasil diperbarui!' : 'Akun klien berhasil dibuat & diaktifkan!');
                    const flash = (page.props as any).flash;
                    if (flash?.whatsapp_url && (accountShareMethod === 'whatsapp' || accountShareMethod === 'both')) {
                        const newWin = window.open(flash.whatsapp_url, '_blank');
                        if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
                            toast.info('Klik untuk membuka pesan WhatsApp', {
                                action: {
                                    label: 'Kirim WhatsApp',
                                    onClick: () => window.open(flash.whatsapp_url, '_blank'),
                                },
                                duration: 10000,
                            });
                        }
                    }
                },
                onError: (errors) => {
                    setSubmittingAccount(false);
                    const msg = Object.values(errors)[0] as string;
                    toast.error(msg || 'Gagal menyimpan akun klien');
                },
            }
        );
    };

    return (
        <>
            <Head title={`${client.name || 'Detail Client'} - Arams Photography`} />

            <div className="space-y-4 pb-2 text-slate-800 w-full max-w-full">

                {/* 1. TOP HERO PROFILE CARD (FULL-WIDTH 12 COLS - LUXURY BALANCED BANNER) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                        {/* Left: Avatar + Identity + 6 Info Chips */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1 min-w-0">
                            {/* Avatar */}
                            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-slate-100 ring-4 ring-slate-100/80 shadow-xs shrink-0">
                                <img
                                    src={
                                        client.avatar ||
                                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
                                    }
                                    alt={client.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Identity Header & 6 Chips */}
                            <div className="space-y-3 flex-1 min-w-0">
                                {/* Top Row: Name + Klien Premium + [Aktif] Badge on Far Right */}
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                                            {client.name || '-'}
                                        </h2>
                                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#F3E8FF] text-[#7E22CE]">
                                            {client.client_type === 'corporate' ? 'Klien Corporate' : 'Klien Premium'}
                                        </span>
                                    </div>

                                    {/* Status Badge right-aligned before Aksi Cepat */}
                                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#DCFCE7] text-[#15803D]">
                                        {client.status === 'completed' ? 'Selesai' : client.status === 'lead' ? 'Lead' : 'Aktif'}
                                    </span>
                                </div>

                                {/* 6 Information Chips (3 atas 3 bawah) */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 text-xs pt-0.5">
                                    {/* 1. No. HP */}
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-7 h-7 rounded-lg bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                                            <Phone className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-[10px] text-slate-400 font-semibold block leading-tight">No. HP</span>
                                            <span className="font-extrabold text-slate-900 font-mono text-[11px] block leading-tight truncate">
                                                {client.phone || '-'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 2. Email */}
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-7 h-7 rounded-lg bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                                            <Mail className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-[10px] text-slate-400 font-semibold block leading-tight">Email</span>
                                            <span className="font-extrabold text-slate-900 text-[11px] block leading-tight truncate" title={client.email || '-'}>
                                                {client.email || '-'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 3. Domisili Klien */}
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-7 h-7 rounded-lg bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                                            <MapPin className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-[10px] text-slate-400 font-semibold block leading-tight">Domisili Klien</span>
                                            <span className="font-extrabold text-slate-900 text-[11px] block leading-tight truncate">
                                                {client.city || [client.district, client.city].filter(Boolean).join(', ') || '-'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 4. Sumber Klien */}
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-7 h-7 rounded-lg bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                                            <Users className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-[10px] text-slate-400 font-semibold block leading-tight">Sumber Klien</span>
                                            <span className="font-extrabold text-slate-900 text-[11px] block leading-tight truncate">
                                                {client.source || '-'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 5. IG Klien */}
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-7 h-7 rounded-lg bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                                            <Instagram className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-[10px] text-slate-400 font-semibold block leading-tight">IG Klien</span>
                                            <span className="font-extrabold text-slate-900 text-[11px] block leading-tight truncate">
                                                {client.instagram || '-'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 6. Preferensi Komunikasi */}
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-7 h-7 rounded-lg bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                                            <MessageCircle className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-[10px] text-slate-400 font-semibold block leading-tight">Preferensi Komunikasi</span>
                                            <span className="font-extrabold text-slate-900 capitalize text-[11px] block leading-tight truncate">
                                                {client.preferred_contact === 'email' ? 'Email' : client.preferred_contact === 'phone' ? 'Telepon' : 'WhatsApp'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Aksi Cepat Card (With 3 Buttons) */}
                        <div className="w-full lg:w-48 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-3.5 space-y-2 shrink-0">
                            <div className="flex items-center justify-between pb-0.5">
                                <h3 className="text-xs font-extrabold text-slate-900">Aksi Cepat</h3>
                                <button
                                    type="button"
                                    onClick={openEditModal}
                                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                                >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={openEditModal}
                                className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[11px] transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                                <Edit3 className="w-3 h-3 text-slate-600" />
                                <span>Edit Klien</span>
                            </button>

                            <Link
                                href={`/projects/create?client_id=${client.id}`}
                                className="w-full py-1.5 px-3 rounded-xl bg-[#5438DC] hover:bg-[#462ec0] text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 shadow-xs hover:scale-[1.01] cursor-pointer"
                            >
                                <FolderPlus className="w-3 h-3 text-white" />
                                <span>Buat Project</span>
                            </Link>

                            <button
                                type="button"
                                onClick={() => {
                                    setPaymentFormData({
                                        project_id: client.projects?.[0]?.id || '',
                                        amount: '',
                                        payment_date: new Date().toISOString().split('T')[0],
                                        payment_method_id: payment_methods?.[0]?.id || '1',
                                        reference_number: '',
                                        notes: 'Pelunasan / DP Project',
                                        proof_file: null,
                                    });
                                    setIsPaymentModalOpen(true);
                                }}
                                className="w-full py-1.5 px-3 rounded-xl bg-[#E57A00] hover:bg-[#cf6d00] text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1 shadow-xs hover:scale-[1.01] cursor-pointer"
                            >
                                <Plus className="w-3 h-3 text-white" />
                                <span>Pembayaran</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. TWO-COLUMN SPLIT: LEFT (TABS CONTENT) vs RIGHT (SIDEBAR WIDGETS) - SEJAJAR HORIZONTAL SEMPURNA & TIDAK BOLONG */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    {/* LEFT COLUMN: TABS CONTENT CARD (8 COLS) */}
                    <div className="lg:col-span-8 flex flex-col h-full">
                        {/* UNIFIED CARD WITH TABS & TAB CONTENT */}
                        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden h-full flex flex-col">
                            {/* Tab Bar Header inside Card */}
                            <div className="px-6 pt-4 border-b border-slate-100 flex items-center gap-7 sm:gap-8 overflow-x-auto scrollbar-none shrink-0">
                                {[
                                    { id: 'ringkasan', label: 'Ringkasan' },
                                    { id: 'projects', label: 'Projects & Orders' },
                                    { id: 'pembayaran', label: 'Pembayaran' },
                                    { id: 'files', label: 'Files' },
                                    { id: 'catatan', label: 'Catatan' },
                                    // { id: 'komunikasi', label: 'Riwayat Komunikasi' }, // Dihide sementara sesuai permintaan
                                    { id: 'akun', label: 'Informasi Akun' },
                                ].map((t) => {
                                    const isActive = mainTab === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setMainTab(t.id as any)}
                                            className={`pb-3 text-xs whitespace-nowrap cursor-pointer relative transition-colors ${isActive
                                                ? 'font-extrabold text-[#E57A00]'
                                                : 'font-semibold text-slate-500 hover:text-slate-900'
                                                }`}
                                        >
                                            {t.label}
                                            {isActive && (
                                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E57A00] rounded-full" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* TAB 1: RINGKASAN (INFORMASI DETAIL KLIEN - EXACT MATCH TO SCREENSHOT) */}
                            {mainTab === 'ringkasan' && (
                                <div className="p-6 space-y-5 animate-in fade-in duration-150 flex-1 flex flex-col justify-between">
                                    <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                                        Informasi Detail Klien
                                    </h3>

                                    {/* SECTION 1 & 2: Dynamic Cards based on client category */}
                                    {Boolean(client.child_name || (client.children && client.children.length > 0) || client.client_type === 'newborn') ? (
                                        /* NEWBORN CARDS: Bayi & Orang Tua */
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                                            {/* Data Bayi Card */}
                                            <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4.5 space-y-3.5 flex flex-col justify-between h-full">
                                                <div className="flex items-center justify-between pb-1 border-b border-amber-200/70">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                                                            <Baby className="w-3.5 h-3.5" />
                                                        </div>
                                                        <h4 className="text-xs font-bold text-amber-950">
                                                            Informasi Bayi / Anak (Newborn)
                                                        </h4>
                                                    </div>
                                                    {client.children && client.children.length > 1 && (
                                                        <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
                                                            👶 Kembar ({client.children.length} Bayi)
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="space-y-3 text-xs flex-1">
                                                    {client.children && client.children.length > 0 ? (
                                                        <div className="space-y-2.5">
                                                            {client.children.map((child, idx) => (
                                                                <div key={idx} className="p-2.5 rounded-xl bg-white/90 border border-amber-200/70 space-y-1.5">
                                                                    <div className="flex items-center justify-between pb-1 border-b border-amber-100 text-[11px] font-bold text-amber-950">
                                                                        <span>Bayi #{idx + 1} {client.children && client.children.length > 1 ? '(Kembar)' : ''}</span>
                                                                        <span className="text-amber-700 font-semibold">{child.gender || '-'}</span>
                                                                    </div>
                                                                    <div className="flex items-start">
                                                                        <span className="text-slate-500 w-24 shrink-0 text-[11px]">Nama Lengkap</span>
                                                                        <span className="text-slate-400 mr-2 shrink-0">:</span>
                                                                        <span className="font-semibold text-slate-900 flex-1">{child.name || '-'}</span>
                                                                    </div>
                                                                    {child.nickname && (
                                                                        <div className="flex items-start">
                                                                            <span className="text-slate-500 w-24 shrink-0 text-[11px]">Panggilan</span>
                                                                            <span className="text-slate-400 mr-2 shrink-0">:</span>
                                                                            <span className="font-semibold text-slate-900 flex-1">{child.nickname}</span>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-start">
                                                                        <span className="text-slate-500 w-24 shrink-0 text-[11px]">Tanggal Lahir</span>
                                                                        <span className="text-slate-400 mr-2 shrink-0">:</span>
                                                                        <span className="font-semibold text-slate-900 flex-1">{child.birth_date ? formatDate(child.birth_date) : '-'}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2.5">
                                                            <div className="flex items-start">
                                                                <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Nama Lengkap</span>
                                                                <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                                <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                                    {client.child_name || client.name || '-'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-start">
                                                                <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Tanggal Lahir / HPL</span>
                                                                <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                                <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                                    {client.child_birth_date ? formatDate(client.child_birth_date) : '-'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-start">
                                                                <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Jenis Kelamin</span>
                                                                <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                                <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                                    {client.child_gender === 'male' ? '👦 Laki-laki (Boy)' : client.child_gender === 'female' ? '👧 Perempuan (Girl)' : '-'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Data Orang Tua Card */}
                                            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5 flex flex-col justify-between h-full">
                                                <div className="flex items-center gap-2 pb-1 border-b border-slate-100/80">
                                                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/80">
                                                        <User className="w-3.5 h-3.5" />
                                                    </div>
                                                    <h4 className="text-xs font-bold text-slate-900">
                                                        Data Orang Tua / Wali
                                                    </h4>
                                                </div>

                                                <div className="space-y-2.5 text-xs flex-1">
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Nama Ayah</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.father_name || client.partner_name || client.name || '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Nama Ibu</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.mother_name || '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Pekerjaan</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.occupation || '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Akun Instagram</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.instagram || client.partner_instagram || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : Boolean(client.bride_name || client.groom_name || client.client_type === 'wedding' || client.client_type === 'prewedding') ? (
                                        /* WEDDING CARDS: CPW & CPP Side by Side */
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                                            {/* CPW Card */}
                                            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5 flex flex-col justify-between h-full">
                                                <div className="flex items-center gap-2 pb-1 border-b border-slate-100/80">
                                                    <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/80">
                                                        <User className="w-3.5 h-3.5" />
                                                    </div>
                                                    <h4 className="text-xs font-bold text-slate-900">
                                                        Informasi Calon Pengantin (CPW)
                                                    </h4>
                                                </div>

                                                <div className="space-y-2.5 text-xs flex-1">
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Nama Lengkap</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.bride_name || client.name || '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Panggilan</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.bride_nickname || '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Tanggal Lahir</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.bride_birth_date ? formatDate(client.bride_birth_date) : '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Pekerjaan</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.occupation || '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Akun Instagram</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.instagram || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CPP Card */}
                                            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5 flex flex-col justify-between h-full">
                                                <div className="flex items-center gap-2 pb-1 border-b border-slate-100/80">
                                                    <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/80">
                                                        <User className="w-3.5 h-3.5" />
                                                    </div>
                                                    <h4 className="text-xs font-bold text-slate-900">
                                                        Informasi Calon Pengantin (CPP)
                                                    </h4>
                                                </div>

                                                <div className="space-y-2.5 text-xs flex-1">
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Nama Lengkap</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.groom_name || client.partner_name || '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Panggilan</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.groom_nickname || '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Tanggal Lahir</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.groom_birth_date ? formatDate(client.groom_birth_date) : '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Pekerjaan</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.occupation || '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Akun Instagram</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.partner_instagram || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        /* STANDARD CARDS: Klien Pemesan Umum */
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                                            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5 flex flex-col justify-between h-full">
                                                <div className="flex items-center gap-2 pb-1 border-b border-slate-100/80">
                                                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/80">
                                                        <User className="w-3.5 h-3.5" />
                                                    </div>
                                                    <h4 className="text-xs font-bold text-slate-900">
                                                        Informasi Pemesan / Klien
                                                    </h4>
                                                </div>

                                                <div className="space-y-2.5 text-xs flex-1">
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Nama Lengkap</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Kontak PIC</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.contact_person || client.partner_name || '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Perusahaan / Brand</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.company_name || '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Pekerjaan / Bidang</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.occupation || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5 flex flex-col justify-between h-full">
                                                <div className="flex items-center gap-2 pb-1 border-b border-slate-100/80">
                                                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/80">
                                                        <Tag className="w-3.5 h-3.5" />
                                                    </div>
                                                    <h4 className="text-xs font-bold text-slate-900">
                                                        Informasi Tambahan
                                                    </h4>
                                                </div>

                                                <div className="space-y-2.5 text-xs flex-1">
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Sumber Lead</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.source || '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Instagram</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                            {client.instagram || '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <span className="text-slate-500 w-28 shrink-0 text-[11px] pt-0.5">Catatan</span>
                                                        <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                        <span className="font-medium text-slate-600 leading-snug flex-1 min-w-0">
                                                            {client.notes || 'Tidak ada catatan.'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* SECTION 3: Informasi Alamat & Kontak (Numbered 1-12 Badges) */}
                                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5">
                                        <div className="flex items-center gap-2 pb-1 border-b border-slate-100/80">
                                            <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/80">
                                                <MapPin className="w-3.5 h-3.5" />
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-900">
                                                Informasi Alamat &amp; Kontak
                                            </h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-3 text-xs">
                                            {/* Column 1: Items 1 to 6 */}
                                            <div className="space-y-2.5">
                                                <div className="flex items-start">
                                                    <div className="w-32 sm:w-34 shrink-0 flex items-center gap-2 text-slate-500">
                                                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">1</span>
                                                        <span className="text-[11px]">Provinsi</span>
                                                    </div>
                                                    <span className="text-slate-400 mr-2.5 shrink-0">:</span>
                                                    <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">{client.province || '-'}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="w-32 sm:w-34 shrink-0 flex items-center gap-2 text-slate-500">
                                                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">2</span>
                                                        <span className="text-[11px]">Kota/Kabupaten</span>
                                                    </div>
                                                    <span className="text-slate-400 mr-2.5 shrink-0">:</span>
                                                    <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">{client.city || '-'}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="w-32 sm:w-34 shrink-0 flex items-center gap-2 text-slate-500">
                                                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">3</span>
                                                        <span className="text-[11px]">Kecamatan</span>
                                                    </div>
                                                    <span className="text-slate-400 mr-2.5 shrink-0">:</span>
                                                    <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">{client.district || '-'}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="w-32 sm:w-34 shrink-0 flex items-center gap-2 text-slate-500">
                                                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">4</span>
                                                        <span className="text-[11px]">Kelurahan</span>
                                                    </div>
                                                    <span className="text-slate-400 mr-2.5 shrink-0">:</span>
                                                    <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">{client.village || '-'}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="w-32 sm:w-34 shrink-0 flex items-center gap-2 text-slate-500">
                                                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">5</span>
                                                        <span className="text-[11px]">Kode Pos</span>
                                                    </div>
                                                    <span className="text-slate-400 mr-2.5 shrink-0">:</span>
                                                    <span className="font-mono font-semibold text-slate-900 leading-snug flex-1 min-w-0">{client.postal_code || '-'}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="w-32 sm:w-34 shrink-0 flex items-center gap-2 text-slate-500 pt-0.5">
                                                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">6</span>
                                                        <span className="text-[11px]">Alamat Lengkap</span>
                                                    </div>
                                                    <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                    <span className="font-semibold text-slate-900 leading-relaxed flex-1 min-w-0">
                                                        {client.address || '-'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Column 2: Items 7 to 12 */}
                                            <div className="space-y-2.5">
                                                <div className="flex items-start">
                                                    <div className="w-32 sm:w-34 shrink-0 flex items-center gap-2 text-slate-500">
                                                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">7</span>
                                                        <span className="text-[11px]">Contact Person</span>
                                                    </div>
                                                    <span className="text-slate-400 mr-2.5 shrink-0">:</span>
                                                    <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0 whitespace-nowrap">{client.contact_person || client.name || '-'}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="w-32 sm:w-34 shrink-0 flex items-center gap-2 text-slate-500">
                                                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">8</span>
                                                        <span className="text-[11px]">Preferensi Kontak</span>
                                                    </div>
                                                    <span className="text-slate-400 mr-2.5 shrink-0">:</span>
                                                    <span className="font-semibold text-slate-900 leading-snug capitalize flex-1 min-w-0">
                                                        {client.preferred_contact === 'email' ? 'Email' : client.preferred_contact === 'phone' ? 'Telepon' : 'WhatsApp'}
                                                    </span>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="w-32 sm:w-34 shrink-0 flex items-center gap-2 text-slate-500">
                                                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">9</span>
                                                        <span className="text-[11px]">Pekerjaan</span>
                                                    </div>
                                                    <span className="text-slate-400 mr-2.5 shrink-0">:</span>
                                                    <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">{client.occupation || '-'}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="w-32 sm:w-34 shrink-0 flex items-center gap-2 text-slate-500">
                                                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">10</span>
                                                        <span className="text-[11px]">Email Aktif</span>
                                                    </div>
                                                    <span className="text-slate-400 mr-2.5 shrink-0">:</span>
                                                    <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0 truncate" title={client.email || '-'}>
                                                        {client.email || '-'}
                                                    </span>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="w-32 sm:w-34 shrink-0 flex items-center gap-2 text-slate-500">
                                                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">11</span>
                                                        <span className="text-[11px]">Akun Instagram</span>
                                                    </div>
                                                    <span className="text-slate-400 mr-2.5 shrink-0">:</span>
                                                    <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0 whitespace-nowrap">
                                                        {client.instagram || '-'}
                                                    </span>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="w-32 sm:w-34 shrink-0 flex items-center gap-2 text-slate-500 pt-0.5">
                                                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">12</span>
                                                        <span className="text-[11px]">Media Sosial Lain</span>
                                                    </div>
                                                    <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                    <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0 whitespace-pre-line">
                                                        {client.other_social_media || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 4: Informasi Acara / Project */}
                                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5">
                                        <div className="flex items-center gap-2 pb-1 border-b border-slate-100/80">
                                            <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/80">
                                                <Calendar className="w-3.5 h-3.5" />
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-900">
                                                Informasi Acara / Project
                                            </h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2.5 text-xs">
                                            <div className="space-y-2.5">
                                                <div className="flex items-start">
                                                    <span className="text-slate-500 w-44 sm:w-48 shrink-0 text-[11px] pt-0.5">Jenis Acara</span>
                                                    <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                    <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                        {client.projects?.[0]?.category?.name || '-'}
                                                    </span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="text-slate-500 w-44 sm:w-48 shrink-0 text-[11px] pt-0.5">Tanggal Pelaksanaan Acara</span>
                                                    <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                    <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                        {client.projects?.[0]?.event_date ? formatDate(client.projects[0].event_date) : '-'}
                                                    </span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="text-slate-500 w-44 sm:w-48 shrink-0 text-[11px] pt-0.5">Waktu Pelaksanaan Acara</span>
                                                    <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                    <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                        {client.projects?.[0]?.event_time || '-'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2.5">
                                                <div className="flex items-start">
                                                    <span className="text-slate-500 w-32 sm:w-36 shrink-0 text-[11px] pt-0.5">Tempat Acara</span>
                                                    <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                    <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                        {client.projects?.[0]?.location || '-'}
                                                    </span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="text-slate-500 w-32 sm:w-36 shrink-0 text-[11px] pt-0.5">Paket Dipilih</span>
                                                    <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                    <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                        {client.projects?.[0]?.package?.name || '-'}
                                                    </span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="text-slate-500 w-32 sm:w-36 shrink-0 text-[11px] pt-0.5">Kategori Project</span>
                                                    <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                                    <span className="font-semibold text-slate-900 leading-snug flex-1 min-w-0">
                                                        {client.projects?.[0]?.category?.name || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION 5: Informasi Tambahan */}
                                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4.5 space-y-2.5">
                                        <div className="flex items-center gap-2 pb-1 border-b border-slate-100/80">
                                            <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/80">
                                                <FileText className="w-3.5 h-3.5" />
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-900">
                                                Informasi Tambahan
                                            </h4>
                                        </div>

                                        <div className="flex items-start text-xs">
                                            <span className="text-slate-500 w-44 sm:w-48 shrink-0 text-[11px] pt-0.5">Catatan</span>
                                            <span className="text-slate-400 mr-2.5 shrink-0 pt-0.5">:</span>
                                            <p className="font-semibold text-slate-900 leading-relaxed flex-1 min-w-0">
                                                {client.notes || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: PROJECTS & ORDERS (Gambar 4) */}
                            {mainTab === 'projects' && (
                                <div className="p-6 space-y-5 animate-in fade-in duration-150">
                                    {/* Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">
                                                Daftar Projects & Orders
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Kelola project aktif, riwayat order, dan progress pengerjaan klien.
                                            </p>
                                        </div>

                                        <Link
                                            href={`/projects/create?client_id=${client.id}`}
                                            className="px-4 py-2 rounded-xl bg-primary-accent hover:opacity-90 active:scale-[0.99] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Buat Project Baru</span>
                                        </Link>
                                    </div>

                                    {/* Filter Bar */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                        <div className="relative flex-1">
                                            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                value={projectSearchQuery}
                                                onChange={(e) => setProjectSearchQuery(e.target.value)}
                                                placeholder="Cari project / order..."
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <NativeSelect
                                                value={projectStatusFilter}
                                                onChange={(e) => setProjectStatusFilter(e.target.value)}
                                                className="text-xs min-w-[140px]"
                                            >
                                                <option value="all">Semua Status</option>
                                                <option value="completed">Selesai</option>
                                                <option value="in_progress">Sedang Dikerjakan</option>
                                                <option value="upcoming">Akan Datang</option>
                                            </NativeSelect>

                                            <NativeSelect
                                                value={projectPeriodFilter}
                                                onChange={(e) => setProjectPeriodFilter(e.target.value)}
                                                className="text-xs min-w-[140px]"
                                            >
                                                <option value="all">Semua Periode</option>
                                                <option value="year">Tahun 2025</option>
                                                <option value="month">Bulan Ini</option>
                                            </NativeSelect>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                                        <Table>
                                            <TableHeader className="bg-slate-50/80">
                                                <TableRow>
                                                    <TableHead className="text-[11px] font-bold text-slate-600">No. Project</TableHead>
                                                    <TableHead className="text-[11px] font-bold text-slate-600">Nama Project</TableHead>
                                                    <TableHead className="text-[11px] font-bold text-slate-600">Tanggal Acara</TableHead>
                                                    <TableHead className="text-[11px] font-bold text-slate-600">Paket</TableHead>
                                                    <TableHead className="text-[11px] font-bold text-slate-600">Status</TableHead>
                                                    <TableHead className="text-[11px] font-bold text-slate-600 text-right">Total</TableHead>
                                                    <TableHead className="text-[11px] font-bold text-slate-600">Terakhir Diperbarui</TableHead>
                                                    <TableHead className="text-[11px] font-bold text-slate-600 text-center">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredProjectsTable.length > 0 ? (
                                                    filteredProjectsTable.map((p) => (
                                                        <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                                            <TableCell className="font-mono font-bold text-xs text-slate-800">
                                                                {p.code}
                                                            </TableCell>
                                                            <TableCell className="font-bold text-xs text-slate-900">
                                                                {p.name}
                                                            </TableCell>
                                                            <TableCell className="text-xs text-slate-600">
                                                                {p.event_date}
                                                            </TableCell>
                                                            <TableCell className="text-xs text-slate-600 font-medium">
                                                                {p.package_name}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant={p.status_color as any} className="text-[10px] font-bold">
                                                                    {p.status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-xs font-mono font-bold text-slate-900 text-right">
                                                                {formatRupiah(p.total_amount)}
                                                            </TableCell>
                                                            <TableCell className="text-[11px] text-slate-400 font-medium">
                                                                {p.updated_at}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <div className="flex items-center justify-center gap-1.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            handleSelectProject(p.id);
                                                                            setMainTab('files');
                                                                        }}
                                                                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-primary-accent shadow-2xs transition-all cursor-pointer"
                                                                        title="Lihat Timeline & Berkas Project"
                                                                    >
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <Link
                                                                        href={`/projects/${p.id}`}
                                                                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-2xs transition-all"
                                                                        title="Lihat Detail Project"
                                                                    >
                                                                        <Eye className="w-3.5 h-3.5" />
                                                                    </Link>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={8} className="text-center py-8 text-xs text-slate-400">
                                                            Tidak ada data project yang sesuai filter.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Pagination Footer */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-1">
                                        <span>
                                            Menampilkan 1 - {filteredProjectsTable.length} dari {filteredProjectsTable.length} data
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 cursor-not-allowed"
                                                >
                                                    &lt;
                                                </button>
                                                <button
                                                    type="button"
                                                    className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs"
                                                >
                                                    1
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 cursor-not-allowed"
                                                >
                                                    &gt;
                                                </button>
                                            </div>
                                            <span className="text-[11px] text-slate-400 pl-2">10 / halaman</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: PEMBAYARAN (Gambar 1) */}
                            {mainTab === 'pembayaran' && (
                                <div className="p-6 space-y-5 animate-in fade-in duration-150">
                                    {/* Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">
                                                Riwayat Pembayaran
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Monitoring invoice, catatan transaksi, dan status pelunasan klien.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setIsPaymentModalOpen(true)}
                                            className="px-4 py-2 rounded-xl bg-primary-accent hover:opacity-90 active:scale-[0.99] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Tambah Pembayaran</span>
                                        </button>
                                    </div>

                                    {/* Filter Bar */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                        <div className="relative flex-1">
                                            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                value={paymentSearchQuery}
                                                onChange={(e) => setPaymentSearchQuery(e.target.value)}
                                                placeholder="Cari invoice / project..."
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all"
                                            />
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                            <NativeSelect
                                                value={paymentStatusFilter}
                                                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                                                className="text-xs min-w-[130px]"
                                            >
                                                <option value="all">Semua Status</option>
                                                <option value="lunas">Lunas</option>
                                                <option value="sebagian">Sebagian</option>
                                                <option value="unpaid">Belum Dibayar</option>
                                            </NativeSelect>

                                            <NativeSelect
                                                value={paymentMethodFilter}
                                                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                                className="text-xs min-w-[130px]"
                                            >
                                                <option value="all">Semua Metode</option>
                                                <option value="bca">Transfer BCA</option>
                                                <option value="mandiri">Transfer Mandiri</option>
                                                <option value="cash">Cash / Tunai</option>
                                            </NativeSelect>

                                            <button
                                                type="button"
                                                onClick={() => toast.info('Fitur export data pembayaran')}
                                                className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                <span>Export</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* 4 KPI Summary Cards (Gambar 3) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Total Tagihan
                                            </span>
                                            <div
                                                className="text-lg font-bold font-mono text-slate-900"
                                                title={formatRupiah(paymentSummary.totalTagihan)}
                                            >
                                                {formatCurrencyShort(paymentSummary.totalTagihan)}
                                            </div>
                                            <span className="text-[11px] text-slate-400 block">
                                                {paymentSummary.invoiceCount} Invoice
                                            </span>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 shadow-2xs space-y-1">
                                            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                                                Total Dibayar
                                            </span>
                                            <div
                                                className="text-lg font-bold font-mono text-emerald-600"
                                                title={formatRupiah(paymentSummary.totalDibayar)}
                                            >
                                                {formatCurrencyShort(paymentSummary.totalDibayar)}
                                            </div>
                                            <span className="text-[11px] text-emerald-600/80 block">
                                                {paymentSummary.paymentCount} Pembayaran
                                            </span>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 shadow-2xs space-y-1">
                                            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                                                Sisa Tagihan
                                            </span>
                                            <div
                                                className="text-lg font-bold font-mono text-amber-600"
                                                title={formatRupiah(paymentSummary.sisaTagihan)}
                                            >
                                                {formatCurrencyShort(paymentSummary.sisaTagihan)}
                                            </div>
                                            <span className="text-[11px] text-amber-600/80 block">
                                                {paymentSummary.unpaidInvoiceCount} Invoice
                                            </span>
                                        </div>

                                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                    Persentase Dibayar
                                                </span>
                                                <span className="text-xs font-bold font-mono text-slate-900">
                                                    {paymentSummary.percent.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                                                </span>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                                    style={{ width: `${paymentSummary.percent}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-slate-400 block pt-0.5">
                                                {paymentSummary.percent >= 100
                                                    ? 'Tagihan sudah lunas sepenuhnya'
                                                    : paymentSummary.percent >= 80
                                                        ? 'Tingkat pelunasan sangat baik'
                                                        : paymentSummary.percent >= 50
                                                            ? 'Pembayaran sebagian telah diterima'
                                                            : 'Menunggu pembayaran tahap berikutnya'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                                        <Table>
                                            <TableHeader className="bg-slate-50/80">
                                                <TableRow>
                                                    <TableHead className="text-[11px] font-bold text-slate-600">No. Invoice</TableHead>
                                                    <TableHead className="text-[11px] font-bold text-slate-600">Project</TableHead>
                                                    <TableHead className="text-[11px] font-bold text-slate-600">Tanggal Invoice</TableHead>
                                                    <TableHead className="text-[11px] font-bold text-slate-600">Jatuh Tempo</TableHead>
                                                    <TableHead className="text-[11px] font-bold text-slate-600 text-right">Total Tagihan</TableHead>
                                                    <TableHead className="text-[11px] font-bold text-slate-600 text-right">Dibayar</TableHead>
                                                    <TableHead className="text-[11px] font-bold text-slate-600 text-right">Sisa</TableHead>
                                                    <TableHead className="text-[11px] font-bold text-slate-600">Status</TableHead>
                                                    <TableHead className="text-[11px] font-bold text-slate-600">Metode</TableHead>
                                                    <TableHead className="text-[11px] font-bold text-slate-600 text-center">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredInvoicesList.length > 0 ? (
                                                    filteredInvoicesList.map((inv) => (
                                                        <TableRow key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                                                            <TableCell>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toast.info(`Melihat detail invoice ${inv.invoice_no}`)}
                                                                    className="font-mono font-bold text-xs text-indigo-600 hover:underline cursor-pointer"
                                                                >
                                                                    {inv.invoice_no}
                                                                </button>
                                                            </TableCell>
                                                            <TableCell className="font-semibold text-xs text-slate-900">
                                                                {inv.project_name}
                                                            </TableCell>
                                                            <TableCell className="text-xs text-slate-600">
                                                                {inv.invoice_date}
                                                            </TableCell>
                                                            <TableCell className="text-xs text-slate-600">
                                                                {inv.due_date}
                                                            </TableCell>
                                                            <TableCell className="text-xs font-mono font-bold text-slate-900 text-right">
                                                                {formatRupiah(inv.total_amount)}
                                                            </TableCell>
                                                            <TableCell className="text-xs font-mono font-bold text-emerald-600 text-right">
                                                                {formatRupiah(inv.paid_amount)}
                                                            </TableCell>
                                                            <TableCell
                                                                className={`text-xs font-mono font-bold text-right ${inv.remaining_amount > 0 ? 'text-amber-600' : 'text-slate-400'
                                                                    }`}
                                                            >
                                                                {formatRupiah(inv.remaining_amount)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant={inv.status_variant as any} className="text-[10px] font-bold">
                                                                    {inv.status}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="text-xs font-bold text-slate-800 block">
                                                                    {inv.payment_method}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 block">
                                                                    {inv.paid_at}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toast.info(`Mendownload invoice ${inv.invoice_no}`)}
                                                                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-2xs transition-all cursor-pointer"
                                                                    title="Download Invoice"
                                                                >
                                                                    <Download className="w-3.5 h-3.5" />
                                                                </button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={10} className="text-center py-8 text-xs text-slate-400">
                                                            Tidak ada data invoice yang sesuai kriteria pencarian.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Callout & Pagination */}
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-xs text-slate-600">
                                        <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                                            i
                                        </div>
                                        <span>Klik nomor invoice untuk melihat detail invoice dan riwayat pembayaran.</span>
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: FILES (Timeline & Workflow Pengerjaan Project) */}
                            {mainTab === 'files' && (
                                <div className="p-6 space-y-6 animate-in fade-in duration-150">
                                    {/* Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold text-slate-900">
                                                    Timeline / Progres Pengerjaan Project
                                                </h3>
                                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px]">
                                                    {initialProjectsList.length} Project Klien
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Tracking alur tahapan kerja foto & video per project klien secara real-time
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setIsAddDriveLinkModalOpen(true)}
                                            className="px-4 py-2 rounded-xl bg-primary-accent hover:opacity-90 active:scale-[0.99] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Simpan Link Google Drive</span>
                                        </button>
                                    </div>

                                    {/* PROJECT SWITCHER BAR WITH SELECT SEARCH */}
                                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-2xs space-y-3.5">
                                        {/* Header Row with Title & Active Workflow Indicator */}
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                                    <Folder className="w-4 h-4 text-primary-accent" />
                                                    <span>Pilih Project Klien ({initialProjectsList.length} Project)</span>
                                                </label>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    Cari & pilih project untuk cek alur tahapan kerja, berkas & deliverables pengerjaan
                                                </p>
                                            </div>

                                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-xs font-bold text-slate-700 shrink-0">
                                                <Layers className="w-3.5 h-3.5 text-primary-accent" />
                                                <span>{activeWorkflowDef.name}</span>
                                            </div>
                                        </div>

                                        {/* Full-width SelectSearch Input */}
                                        <div className="w-full">
                                            <SelectSearch
                                                options={projectSearchOptions}
                                                value={String(selectedProject?.id || selectedProjectId)}
                                                onChange={(val) => val && handleSelectProject(val)}
                                                placeholder="Cari & pilih project klien..."
                                                searchPlaceholder="Ketik nomor project atau nama acara..."
                                                clearable={false}
                                                className="w-full text-xs bg-white"
                                            />
                                        </div>

                                        {/* Active Project Info Strip (Gambar 2: Interactive Project Status Switcher) */}
                                        <div className="pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                                                <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-primary-accent shadow-2xs shrink-0">
                                                    {selectedProject?.code}
                                                </span>
                                                <span className="font-bold text-slate-900 truncate">
                                                    {selectedProject?.name}
                                                </span>
                                                <span className="text-slate-300 hidden sm:inline">•</span>
                                                <span className="text-slate-600 truncate">
                                                    {selectedProject?.package_name}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                                                <span className="text-slate-500 flex items-center gap-1 text-[11px] font-medium">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {selectedProject?.event_date}
                                                </span>

                                                {/* Project Overall Status Dropdown Switcher */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-2xs cursor-pointer transition-all hover:ring-2 hover:ring-primary-accent/20 ${getProjectStatusBadgeStyle(selectedRawProject?.status || 'draft')}`}
                                                            title="Klik untuk mengubah status project langsung ke database"
                                                        >
                                                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                            <span>{getProjectStatusLabel(selectedRawProject?.status || 'draft')}</span>
                                                            <ChevronDown className="w-3 h-3 opacity-70" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 p-1.5 text-xs bg-white shadow-xl rounded-xl border border-slate-200 z-50">
                                                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                            Ubah Status Project
                                                        </div>
                                                        {PROJECT_STATUS_OPTIONS.map((opt) => (
                                                            <DropdownMenuItem
                                                                key={opt.value}
                                                                onClick={() => handleUpdateProjectStatus(opt.value)}
                                                                className={`flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedRawProject?.status === opt.value ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'}`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`w-2 h-2 rounded-full ${opt.dotColor}`} />
                                                                    <span className={opt.textColor}>{opt.label}</span>
                                                                </div>
                                                                {selectedRawProject?.status === opt.value && (
                                                                    <Check className="w-3.5 h-3.5 text-slate-600" />
                                                                )}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Connected Horizontal Stepper Timeline (Gambar 1: Direct Timeline Status Update) */}
                                    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                                        <div className="flex items-center justify-between pb-1 border-b border-slate-100 text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-primary-accent/10 flex items-center justify-center text-primary-accent shrink-0">
                                                    <Layers className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-slate-900 block text-xs">
                                                        {activeWorkflowDef.name} — Alur Tahapan Kerja
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 block sm:hidden">
                                                        {completedStagesCount} dari {currentStages.length} Tahap Selesai
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="hidden sm:flex items-center gap-2">
                                                <span className="text-[11px] text-slate-500">Status Alur:</span>
                                                <span className="font-bold text-slate-800 font-mono text-xs px-2.5 py-0.5 rounded-md bg-slate-100">
                                                    {completedStagesCount} dari {currentStages.length} Tahap Selesai
                                                </span>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto pb-2 pt-2 -mx-1 px-1">
                                            <div
                                                className="relative pt-2 pb-1"
                                                style={{ minWidth: currentStages.length > 5 ? `${currentStages.length * 115}px` : '100%' }}
                                            >
                                                {/* Connecting line bar aligned to the center of first & last circle */}
                                                <div
                                                    className="absolute top-[26px] h-1 bg-slate-200 -z-0 rounded-full overflow-hidden"
                                                    style={{
                                                        left: `calc(100% / (${currentStages.length} * 2))`,
                                                        right: `calc(100% / (${currentStages.length} * 2))`,
                                                    }}
                                                >
                                                    <div
                                                        className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                                                        style={{
                                                            width: `${Math.min(
                                                                100,
                                                                currentStages.length > 1
                                                                    ? (completedStagesCount / (currentStages.length - 1)) * 100
                                                                    : completedStagesCount === 1 ? 100 : 0
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex items-start justify-between relative z-10">
                                                    {currentStages.map((s, idx) => {
                                                        const isStepSelected = selectedStageIndex === idx;
                                                        return (
                                                            <div
                                                                key={s.step || idx}
                                                                className="flex-1 flex flex-col items-center text-center group transition-all px-1"
                                                            >
                                                                {/* Step Circle & Title Button (Selects Stage) */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSelectedStageIndex(idx)}
                                                                    className="w-full flex flex-col items-center text-center cursor-pointer focus:outline-none"
                                                                    title={`Klik untuk lihat detail Tahap ${s.step}: ${s.title}`}
                                                                >
                                                                    <div
                                                                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs mb-2 transition-all relative ${s.status === 'done'
                                                                                ? 'bg-emerald-500 text-white shadow-emerald-200 ring-2 ring-white'
                                                                                : s.status === 'active'
                                                                                    ? 'bg-primary-accent text-white ring-4 ring-primary-accent/25 shadow-md scale-105'
                                                                                    : 'bg-white border-2 border-slate-300 text-slate-500 group-hover:border-slate-400 group-hover:bg-slate-50'
                                                                            } ${isStepSelected ? 'ring-2 ring-offset-2 ring-primary-accent' : ''}`}
                                                                    >
                                                                        {s.status === 'done' ? (
                                                                            <Check className="w-4 h-4 stroke-[2.5]" />
                                                                        ) : (
                                                                            <span>{s.step}</span>
                                                                        )}
                                                                    </div>

                                                                    <span
                                                                        className={`text-[11px] font-bold line-clamp-2 max-w-[110px] leading-tight transition-colors ${isStepSelected
                                                                                ? 'text-primary-accent font-extrabold'
                                                                                : s.status === 'active'
                                                                                    ? 'text-slate-900 font-extrabold'
                                                                                    : 'text-slate-700 group-hover:text-slate-900'
                                                                            }`}
                                                                    >
                                                                        {s.title}
                                                                    </span>
                                                                </button>

                                                                {/* Direct Stage Status Update Dropdown Trigger (Gambar 1) */}
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <button
                                                                            type="button"
                                                                            className={`text-[10px] font-semibold mt-1.5 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition-all hover:ring-2 hover:ring-primary-accent/20 border shadow-2xs ${s.status === 'done'
                                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100'
                                                                                    : s.status === 'active'
                                                                                        ? 'bg-amber-50 text-amber-700 border-amber-200/80 font-bold hover:bg-amber-100'
                                                                                        : 'text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100'
                                                                                }`}
                                                                            title="Klik untuk ubah status tahap ini"
                                                                        >
                                                                            <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'done' ? 'bg-emerald-500' : s.status === 'active' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                                                                            <span>{s.status === 'done' ? 'Selesai' : s.status === 'active' ? 'Dikerjakan' : 'Belum Mulai'}</span>
                                                                            <ChevronDown className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                                                                        </button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="center" className="w-48 p-1.5 text-xs bg-white shadow-xl rounded-xl border border-slate-200 z-50">
                                                                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                            Status Tahap {s.step}
                                                                        </div>
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleQuickUpdateStageStatus(idx, 'done')}
                                                                            className={`flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-700 hover:bg-emerald-50 ${s.status === 'done' ? 'bg-emerald-50 font-bold' : ''}`}
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                                                <span>Tandai Selesai</span>
                                                                            </div>
                                                                            {s.status === 'done' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleQuickUpdateStageStatus(idx, 'active')}
                                                                            className={`flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-700 hover:bg-amber-50 ${s.status === 'active' ? 'bg-amber-50 font-bold' : ''}`}
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="w-2 h-2 rounded-full bg-amber-500" />
                                                                                <span>Sedang Dikerjakan</span>
                                                                            </div>
                                                                            {s.status === 'active' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleQuickUpdateStageStatus(idx, 'pending')}
                                                                            className={`flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 ${s.status === 'pending' ? 'bg-slate-100 font-bold' : ''}`}
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="w-2 h-2 rounded-full bg-slate-300" />
                                                                                <span>Belum Dimulai</span>
                                                                            </div>
                                                                            {s.status === 'pending' && <Check className="w-3.5 h-3.5 text-slate-600" />}
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            onClick={() => openEditStageModal(idx)}
                                                                            className="flex items-center gap-2 cursor-pointer text-slate-700 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                                                                        >
                                                                            <Pencil className="w-3 h-3 text-slate-400" />
                                                                            <span>Edit Detail Tahap...</span>
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2 Dynamic Metric & Detail Boxes */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                                        {/* Left Card: Detail Tahap Terpilih */}
                                        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-4">
                                            {/* Stage Pill & Status Header */}
                                            <div className="space-y-2.5 pb-3 border-b border-slate-100">
                                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="px-2.5 py-1 rounded-lg bg-primary-accent/10 text-primary-accent text-xs font-black tracking-wide whitespace-nowrap shrink-0">
                                                            Tahap {selectedStage.step} dari {currentStages.length}
                                                        </span>
                                                        {selectedStage.isCustom && (
                                                            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-extrabold whitespace-nowrap shrink-0">
                                                                Custom
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {/* Stage Status Dropdown Switcher on Detail Card */}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border shadow-2xs cursor-pointer transition-all hover:ring-2 hover:ring-primary-accent/20 ${selectedStage.status === 'done'
                                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                            : selectedStage.status === 'active'
                                                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                                : 'bg-slate-100 text-slate-700 border-slate-200'
                                                                        }`}
                                                                    title="Klik untuk ubah status tahap ini"
                                                                >
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${selectedStage.status === 'done' ? 'bg-emerald-500' : selectedStage.status === 'active' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                                                                    <span>
                                                                        {selectedStage.status === 'done'
                                                                            ? 'Selesai (100%)'
                                                                            : selectedStage.status === 'active'
                                                                                ? 'Sedang Dikerjakan'
                                                                                : 'Belum Dimulai'}
                                                                    </span>
                                                                    <ChevronDown className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48 p-1.5 text-xs bg-white shadow-xl rounded-xl border border-slate-200 z-50">
                                                                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                    Status Tahap {selectedStage.step}
                                                                </div>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleQuickUpdateStageStatus(selectedStageIndex, 'done')}
                                                                    className={`flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-700 hover:bg-emerald-50 ${selectedStage.status === 'done' ? 'bg-emerald-50 font-bold' : ''}`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                                                        <span>Tandai Selesai</span>
                                                                    </div>
                                                                    {selectedStage.status === 'done' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleQuickUpdateStageStatus(selectedStageIndex, 'active')}
                                                                    className={`flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-700 hover:bg-amber-50 ${selectedStage.status === 'active' ? 'bg-amber-50 font-bold' : ''}`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                                                                        <span>Sedang Dikerjakan</span>
                                                                    </div>
                                                                    {selectedStage.status === 'active' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleQuickUpdateStageStatus(selectedStageIndex, 'pending')}
                                                                    className={`flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 ${selectedStage.status === 'pending' ? 'bg-slate-100 font-bold' : ''}`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                                                                        <span>Belum Dimulai</span>
                                                                    </div>
                                                                    {selectedStage.status === 'pending' && <Check className="w-3.5 h-3.5 text-slate-600" />}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => openEditStageModal(selectedStageIndex)}
                                                                    className="flex items-center gap-2 cursor-pointer text-slate-700 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg text-xs font-medium"
                                                                >
                                                                    <Pencil className="w-3 h-3 text-slate-400" />
                                                                    <span>Edit Detail Tahap...</span>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>

                                                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                                                    {selectedStage.title}
                                                </h4>
                                            </div>

                                            {/* Stage Progress Bar */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-500 font-medium">Progres Pengerjaan Tahap Ini</span>
                                                    <span className="font-extrabold text-slate-900 text-sm font-mono">{selectedStage.progress}%</span>
                                                </div>
                                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${selectedStage.status === 'done'
                                                                ? 'bg-emerald-500'
                                                                : selectedStage.status === 'active'
                                                                    ? 'bg-primary-accent'
                                                                    : 'bg-slate-300'
                                                            }`}
                                                        style={{ width: `${selectedStage.progress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Target Duration & Output Deliverable Info */}
                                            {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                                <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-100 space-y-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                        <Clock className="w-3 h-3 text-slate-400" />
                                                        <span>Target Durasi / Deadline</span>
                                                    </span>
                                                    <span className="font-bold text-slate-900 block font-mono text-xs">
                                                        {selectedStage.duration}
                                                    </span>
                                                </div>
                                                <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-100 space-y-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                        <Box className="w-3 h-3 text-slate-400" />
                                                        <span>Output / Deliverable</span>
                                                    </span>
                                                    <span className="font-bold text-slate-900 block leading-snug text-xs">
                                                        {selectedStage.deliv}
                                                    </span>
                                                </div>
                                            </div> */}

                                            {/* Description Box */}
                                            {/* <div className="p-3.5 rounded-xl bg-slate-50/80 border-l-4 border-primary-accent border border-slate-100 space-y-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                    <FileText className="w-3 h-3 text-slate-400" />
                                                    <span>Aktivitas Tim & Deskripsi</span>
                                                </span>
                                                <p className="text-xs text-slate-600 leading-relaxed">
                                                    {selectedStage.description || 'Pekerjaan berjalan sesuai SOP dan timeline produksi.'}
                                                </p>
                                            </div> */}

                                            {/* Footer Metadata */}
                                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-100">
                                                <div>
                                                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Status Tahap</span>
                                                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedStage.date}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Penanggung Jawab (PIC)</span>
                                                    <span className="font-bold text-slate-800 mt-0.5 block truncate" title={selectedStage.pic}>{selectedStage.pic}</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons: Edit Stage & Update Status to DB */}
                                            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                                {/* <button
                                                    type="button"
                                                    onClick={() => openEditStageModal(selectedStageIndex)}
                                                    className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                                                >
                                                    <Pencil className="w-3.5 h-3.5 text-primary-accent" />
                                                    <span>Edit Detail Tahap</span>
                                                </button> */}

                                                {selectedProject?.status !== 'Selesai' && (
                                                    <>
                                                        {selectedStage.status === 'pending' && (
                                                            <button
                                                                type="button"
                                                                disabled={updatingStage}
                                                                onClick={() => handleUpdateStage(selectedStage.title, 'in_progress', Math.round(((selectedStageIndex) / currentStages.length) * 100))}
                                                                className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                                            >
                                                                <PlayCircle className="w-3.5 h-3.5" />
                                                                <span>{updatingStage ? 'Menyimpan...' : 'Jadikan Aktif'}</span>
                                                            </button>
                                                        )}
                                                        {selectedStage.status === 'active' && (
                                                            <button
                                                                type="button"
                                                                disabled={updatingStage}
                                                                onClick={() => handleUpdateStage(selectedStage.title, 'completed', Math.round(((selectedStageIndex + 1) / currentStages.length) * 100))}
                                                                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                <span>{updatingStage ? 'Menyimpan...' : 'Tandai Selesai'}</span>
                                                            </button>
                                                        )}
                                                        {selectedStage.status === 'done' && (
                                                            <span className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                Tahap ini sudah selesai
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Card: Progress Keseluruhan Project */}
                                        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-4">
                                            {/* Header with Title & Big Hero Metric */}
                                            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                                                <div className="space-y-1">
                                                    <h4 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                                                        Progress Keseluruhan
                                                    </h4>
                                                    <p className="text-xs text-slate-500">
                                                        <span className="font-extrabold text-slate-800">{completedStagesCount}</span> dari{' '}
                                                        {currentStages.length} tahap pengerjaan telah selesai
                                                    </p>
                                                </div>
                                                <div className="text-3xl sm:text-4xl font-black font-mono text-primary-accent shrink-0 text-right">
                                                    {overallProgressPercent}%
                                                </div>
                                            </div>

                                            {/* Overall Progress Bar & Milestone Labels */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-xs text-slate-500">
                                                    <span className="font-medium">Total Akumulasi Milestone</span>
                                                    <span className="font-bold text-primary-accent">{overallProgressPercent}% Selesai</span>
                                                </div>
                                                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary-accent rounded-full transition-all duration-500"
                                                        style={{ width: `${overallProgressPercent}%` }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-0.5">
                                                    <span>Awal Project (DP)</span>
                                                    <span>Editing & Produksi</span>
                                                    <span>Final Delivery</span>
                                                </div>
                                            </div>

                                            {/* Stage Counts Breakdown Pill Grid */}
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                                                    <span className="text-[10px] font-bold text-emerald-600 uppercase block">Selesai</span>
                                                    <span className="text-xs sm:text-sm font-extrabold text-emerald-700 font-mono">{completedStagesCount} Tahap</span>
                                                </div>
                                                <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-100">
                                                    <span className="text-[10px] font-bold text-amber-600 uppercase block">Aktif</span>
                                                    <span className="text-xs sm:text-sm font-extrabold text-amber-700 font-mono">
                                                        {currentStages.some((s) => s.status === 'active') ? 1 : 0} Tahap
                                                    </span>
                                                </div>
                                                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Menunggu</span>
                                                    <span className="text-xs sm:text-sm font-extrabold text-slate-600 font-mono">
                                                        {currentStages.filter((s) => s.status === 'pending').length} Tahap
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Active Project Box */}
                                            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between gap-2 text-xs">
                                                <div className="min-w-0">
                                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Project Aktif</span>
                                                    <span className="font-bold text-slate-800 truncate block mt-0.5">
                                                        {selectedProject?.name}
                                                    </span>
                                                </div>
                                                <Badge
                                                    variant={selectedProject?.status_color as any}
                                                    className="text-[10px] font-bold shrink-0"
                                                >
                                                    {selectedProject?.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION: RINCIAN DELIVERABLES & LAYANAN PAKET (SESUAI MASTER DATA) */}
                                    {selectedProjectPackage && (
                                        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Box className="w-4 h-4 text-primary-accent" />
                                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                                            Rincian Deliverables & Layanan Paket ({selectedProjectPackage.name})
                                                        </h4>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        Daftar deliverable, estimasi target deadline, dan layanan yang termasuk dalam paket pengerjaan ini
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-bold text-xs">
                                                        {formatRupiah(Number(selectedProjectPackage.base_price || 0))}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Included Deliverables Grid */}
                                            {selectedProjectPackage.included_deliverables && selectedProjectPackage.included_deliverables.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {selectedProjectPackage.included_deliverables.map((deliv: any, dIdx: number) => {
                                                        const isPhoto = deliv.type === 'Photo';
                                                        const isVideo = deliv.type === 'Video';
                                                        const isAlbum = deliv.type === 'Album';
                                                        return (
                                                            <div
                                                                key={deliv.id || dIdx}
                                                                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between gap-2.5 hover:border-slate-300 transition-colors"
                                                            >
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <span
                                                                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isPhoto
                                                                                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                                                                    : isVideo
                                                                                        ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                                                                        : isAlbum
                                                                                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                                                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                                                }`}
                                                                        >
                                                                            {deliv.type || 'Deliverable'}
                                                                        </span>
                                                                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                                                                            {deliv.deadline || 'H+14'}
                                                                        </span>
                                                                    </div>
                                                                    <span className="font-bold text-xs text-slate-900 block leading-snug">
                                                                        {deliv.name}
                                                                    </span>
                                                                    {deliv.description && (
                                                                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                                                            {deliv.description}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                                                                    <span className="font-semibold text-slate-500">
                                                                        {deliv.required ? 'Deliverable Utama' : 'Deliverable Tambahan'}
                                                                    </span>
                                                                    {deliv.by_owner && (
                                                                        <span className="text-purple-600 font-bold">
                                                                            Approval Owner
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                                                    Deliverables standar paket mengikuti alur tahapan {activeWorkflowDef.name}.
                                                </div>
                                            )}

                                            {/* Included Services Tags */}
                                            {selectedProjectPackage.included_services && selectedProjectPackage.included_services.length > 0 && (
                                                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                                                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 shrink-0">
                                                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                                        <span>Layanan Termasuk:</span>
                                                    </span>
                                                    {selectedProjectPackage.included_services.map((srv: string, sIdx: number) => (
                                                        <span
                                                            key={sIdx}
                                                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium"
                                                        >
                                                            {srv}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 2-Column Split: Checklist + Link Google Drive */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                        {/* Left Card: Opsi Pekerjaan (Internal) */}
                                        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                                <div>
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                                        Opsi Pekerjaan (Internal)
                                                    </h4>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        Checklist tugas tim editing & produksi untuk project ini
                                                    </p>
                                                </div>
                                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-xs">
                                                    {checkedTasksCount}/8 Selesai
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {[
                                                    { id: 'editedPhoto', label: 'Edited Photo' },
                                                    { id: 'revisiEditedPhoto', label: 'Revisi Edited Photo (Opsional)' },
                                                    { id: 'finalEditedPhoto', label: 'Final Edited Photo' },
                                                    { id: 'editedVideoHL', label: 'Edited Video HL' },
                                                    { id: 'revisiEditedVideoHL', label: 'Revisi Edited Video HL (Opsional)' },
                                                    { id: 'editedFullDoc', label: 'Edited Full Doc (Opsional)' },
                                                    { id: 'finalEditedVideoHL', label: 'Final Edited Video HL' },
                                                    { id: 'finalEditedFullDoc', label: 'Final Edited Full Doc (Opsional)' },
                                                ].map((task) => {
                                                    const isChecked = (jobChecklist as any)[task.id] || false;
                                                    return (
                                                        <label
                                                            key={task.id}
                                                            className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${isChecked
                                                                ? 'border-emerald-300 bg-emerald-50/50 text-emerald-950 shadow-2xs font-semibold'
                                                                : 'border-slate-200/80 bg-slate-50/40 hover:bg-slate-100/70 hover:border-slate-300 text-slate-800'
                                                                }`}
                                                        >
                                                            <Checkbox
                                                                checked={isChecked}
                                                                disabled={savingChecklist}
                                                                onCheckedChange={(val) => {
                                                                    handleChecklistChange(task.id, !!val, task.label);
                                                                }}
                                                                className="shrink-0"
                                                            />
                                                            <span
                                                                className={`text-xs ${isChecked ? 'line-through text-slate-400' : 'font-medium'
                                                                    }`}
                                                            >
                                                                {task.label}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Right Card: Link Google Drive */}
                                        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
                                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                                <div>
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                                        Link Google Drive
                                                    </h4>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        Folder berkas & preview untuk project: <span className="font-semibold text-slate-700">{selectedProject?.code}</span>
                                                    </p>
                                                </div>
                                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                                                    {projectDriveLinks.length} Folder
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                {projectDriveLinks.length === 0 && (
                                                    <div className="py-8 flex flex-col items-center justify-center text-center gap-2 text-slate-400">
                                                        <Folder className="w-8 h-8 text-slate-300" />
                                                        <p className="text-xs font-semibold">Belum ada link Google Drive</p>
                                                        <p className="text-[11px]">Klik "Tambah Link" untuk menyimpan folder berkas project ini ke database.</p>
                                                    </div>
                                                )}
                                                {projectDriveLinks.map((dl) => (
                                                    <div
                                                        key={dl.id}
                                                        className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-start justify-between gap-3 hover:border-slate-300 transition-colors"
                                                    >
                                                        <div className="flex items-start gap-3 min-w-0">
                                                            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5 shadow-2xs">
                                                                <Folder className="w-4 h-4" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span className="font-bold text-xs text-slate-900 block leading-snug">
                                                                    {dl.title}
                                                                </span>
                                                                <a
                                                                    href={dl.url}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-xs text-primary-accent hover:underline block truncate mt-0.5"
                                                                >
                                                                    {dl.url}
                                                                </a>
                                                                <span className="text-[10px] text-slate-400 block mt-1">
                                                                    Diupload oleh {dl.uploader} • {dl.date}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopyLink(dl.url)}
                                                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-primary-accent text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                                                                title="Salin Link"
                                                            >
                                                                <Copy className="w-3.5 h-3.5" />
                                                            </button>
                                                            <a
                                                                href={dl.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold shadow-2xs flex items-center gap-1"
                                                            >
                                                                <span>Buka</span>
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                            <button
                                                                type="button"
                                                                disabled={deletingLinkId === dl.id}
                                                                onClick={() => handleDeleteLink(dl.id, dl.title)}
                                                                className="p-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                                                                title="Hapus Link"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}

                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddDriveLinkModalOpen(true)}
                                                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary-accent/40 hover:bg-primary-accent/5 text-slate-600 hover:text-primary-accent font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>Tambah Link Google Drive</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 5: CATATAN (Gambar 3) */}
                            {mainTab === 'catatan' && (
                                <div className="p-6 space-y-5 animate-in fade-in duration-150">
                                    {/* Header */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Catatan
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Kelola catatan internal terkait klien, preferensi, dan instruksi khusus
                                        </p>
                                    </div>

                                    {/* Add Note Box */}
                                    <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-2xs">
                                        <textarea
                                            rows={3}
                                            value={noteInputText}
                                            onChange={(e) => setNoteInputText(e.target.value)}
                                            placeholder="Tulis catatan baru..."
                                            className="w-full p-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none"
                                        />
                                        <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <NativeSelect
                                                    value={noteInputCategory}
                                                    onChange={(e) => setNoteInputCategory(e.target.value)}
                                                    className="text-xs py-1"
                                                >
                                                    <option value="Preferensi">Preferensi</option>
                                                    <option value="Informasi">Informasi</option>
                                                    <option value="Pembayaran">Pembayaran</option>
                                                    <option value="Meeting">Meeting</option>
                                                </NativeSelect>

                                                <div className="flex items-center gap-2 text-slate-400 border-l border-slate-200 pl-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => toast.info('Fitur lampirkan file ke catatan')}
                                                        className="hover:text-slate-700 cursor-pointer"
                                                        title="Lampirkan File"
                                                    >
                                                        <Paperclip className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setNoteInputText((prev) => prev + '**tebal**')}
                                                        className="hover:text-slate-700 cursor-pointer"
                                                        title="Teks Tebal"
                                                    >
                                                        <Bold className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setNoteInputText((prev) => prev + '_miring_')}
                                                        className="hover:text-slate-700 cursor-pointer"
                                                        title="Teks Miring"
                                                    >
                                                        <Italic className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleAddNote}
                                                className="px-4 py-1.5 rounded-xl bg-primary-accent hover:opacity-90 active:scale-[0.99] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-end sm:self-auto"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                <span>Simpan Catatan</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Filter Bar */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <NativeSelect
                                                value={noteCategoryFilter}
                                                onChange={(e) => setNoteCategoryFilter(e.target.value)}
                                                className="text-xs min-w-[140px]"
                                            >
                                                <option value="all">Semua Kategori</option>
                                                <option value="preferensi">Preferensi</option>
                                                <option value="informasi">Informasi</option>
                                                <option value="pembayaran">Pembayaran</option>
                                                <option value="meeting">Meeting</option>
                                            </NativeSelect>

                                            <NativeSelect
                                                value={noteAuthorFilter}
                                                onChange={(e) => setNoteAuthorFilter(e.target.value)}
                                                className="text-xs min-w-[140px]"
                                            >
                                                <option value="all">Dibuat Oleh</option>
                                                <option value="admin">Admin Arams</option>
                                                <option value="budi">Budi Santoso (Supervisor)</option>
                                            </NativeSelect>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNoteCategoryFilter('all');
                                                setNoteAuthorFilter('all');
                                            }}
                                            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            <span>Reset Filter</span>
                                        </button>
                                    </div>

                                    {/* Note Cards */}
                                    <div className="space-y-3.5">
                                        {filteredNotesList.length > 0 ? (
                                            filteredNotesList.map((note) => (
                                                <div
                                                    key={note.id}
                                                    className={`p-4 rounded-2xl bg-white border border-slate-200/80 border-l-4 ${note.border_color} shadow-2xs space-y-2`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className={`w-6 h-6 rounded-lg flex items-center justify-center ${note.icon_color}`}
                                                            >
                                                                {note.category === 'Preferensi' ? (
                                                                    <Star className="w-3.5 h-3.5" />
                                                                ) : note.category === 'Informasi' ? (
                                                                    <FileText className="w-3.5 h-3.5" />
                                                                ) : note.category === 'Pembayaran' ? (
                                                                    <Receipt className="w-3.5 h-3.5" />
                                                                ) : (
                                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                                )}
                                                            </div>
                                                            <h4 className="text-xs font-bold text-slate-900">
                                                                {note.title}
                                                            </h4>
                                                        </div>

                                                        <Badge variant={note.badge_color as any} className="text-[10px] font-bold">
                                                            {note.category}
                                                        </Badge>
                                                    </div>

                                                    <p className="text-xs text-slate-700 leading-relaxed pl-8">
                                                        {note.content}
                                                    </p>

                                                    <div className="text-[11px] text-slate-400 font-medium pl-8 flex items-center gap-2">
                                                        <span>{note.author}</span>
                                                        <span>•</span>
                                                        <span>{note.date}</span>
                                                        <span>•</span>
                                                        <span>{note.project}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-center space-y-2">
                                                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                                                <p className="text-xs font-semibold text-slate-700">Belum Ada Catatan Khusus</p>
                                                <p className="text-[11px] text-slate-400">Tulis catatan preferensi, briefing, atau instruksi kerja untuk klien ini di atas.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Pagination */}
                                    {filteredNotesList.length > 0 && (
                                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                                            <span>
                                                Menampilkan 1 - {filteredNotesList.length} dari {filteredNotesList.length} catatan
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 cursor-not-allowed"
                                                >
                                                    &lt;
                                                </button>
                                                <button
                                                    type="button"
                                                    className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs"
                                                >
                                                    1
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 cursor-not-allowed"
                                                >
                                                    &gt;
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 6: RIWAYAT KOMUNIKASI */}
                            {mainTab === 'komunikasi' && (
                                <div className="p-6 space-y-5 animate-in fade-in duration-150">
                                    {/* Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">
                                                Riwayat Komunikasi & WhatsApp Chat
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Catatan interaksi, pesan WhatsApp, email, dan meeting klien
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setIsAddCommModalOpen(true)}
                                            className="px-4 py-2 rounded-xl bg-primary-accent hover:opacity-90 active:scale-[0.99] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>+ Catat Komunikasi</span>
                                        </button>
                                    </div>

                                    {/* Filter Bar */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                        <div className="relative flex-1">
                                            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                value={commSearchQuery}
                                                onChange={(e) => setCommSearchQuery(e.target.value)}
                                                placeholder="Cari riwayat komunikasi..."
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            />
                                        </div>

                                        <NativeSelect
                                            value={commChannelFilter}
                                            onChange={(e) => setCommChannelFilter(e.target.value)}
                                            className="text-xs min-w-[140px]"
                                        >
                                            <option value="all">Semua Channel</option>
                                            <option value="WhatsApp">WhatsApp</option>
                                            <option value="Email">Email</option>
                                            <option value="Telepon">Telepon</option>
                                        </NativeSelect>
                                    </div>

                                    {/* Communication Cards List */}
                                    <div className="space-y-3">
                                        {commList.filter(
                                            (c) =>
                                                (commChannelFilter === 'all' || c.channel === commChannelFilter) &&
                                                (c.title.toLowerCase().includes(commSearchQuery.toLowerCase()) ||
                                                    c.content.toLowerCase().includes(commSearchQuery.toLowerCase()))
                                        ).length > 0 ? (
                                            commList
                                                .filter(
                                                    (c) =>
                                                        (commChannelFilter === 'all' || c.channel === commChannelFilter) &&
                                                        (c.title.toLowerCase().includes(commSearchQuery.toLowerCase()) ||
                                                            c.content.toLowerCase().includes(commSearchQuery.toLowerCase()))
                                                )
                                                .map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3.5 hover:border-slate-300 transition-colors"
                                                    >
                                                        <div
                                                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${item.channel === 'WhatsApp'
                                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                                : item.channel === 'Email'
                                                                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                                                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                                }`}
                                                        >
                                                            {item.channel === 'WhatsApp' ? (
                                                                <MessageCircle className="w-4 h-4" />
                                                            ) : item.channel === 'Email' ? (
                                                                <Mail className="w-4 h-4" />
                                                            ) : (
                                                                <Phone className="w-4 h-4" />
                                                            )}
                                                        </div>

                                                        <div className="flex-1 space-y-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <h4 className="text-xs font-bold text-slate-900 truncate">
                                                                    {item.channel}: {item.title}
                                                                </h4>
                                                                <Badge
                                                                    variant={item.channel === 'WhatsApp' ? 'success' : item.channel === 'Email' ? 'info' : 'warning'}
                                                                    className="text-[10px] font-bold shrink-0"
                                                                >
                                                                    {item.status}
                                                                </Badge>
                                                            </div>

                                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                                {item.content}
                                                            </p>

                                                            <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-1">
                                                                <span>{item.author}</span>
                                                                <span>•</span>
                                                                <span>{item.date}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="p-8 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-center space-y-2">
                                                <MessageCircle className="w-8 h-8 text-slate-300 mx-auto" />
                                                <p className="text-xs font-semibold text-slate-700">Belum Ada Riwayat Komunikasi</p>
                                                <p className="text-[11px] text-slate-400">Klik tombol "+ Catat Komunikasi" untuk mencatat WhatsApp, email, atau telepon klien.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB 7: INFORMASI AKUN (Gambar 5) */}
                            {mainTab === 'akun' && (
                                <div className="p-6 space-y-6 animate-in fade-in duration-150">
                                    {/* Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">
                                                Informasi Akun Klien (Akses Portal Klien)
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Klien dapat login ke portal untuk melihat progress project, review foto, dan download file.
                                            </p>
                                        </div>

                                        {/* Toggle Switch */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs font-bold text-slate-700">{clientUser ? 'Akses Portal Klien' : 'Buat akun klien'}</span>
                                            <button
                                                type="button"
                                                onClick={() => setIsAccountActive(!isAccountActive)}
                                                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${isAccountActive ? 'bg-indigo-600' : 'bg-slate-200'
                                                    }`}
                                            >
                                                <span
                                                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-xs ${isAccountActive ? 'left-6' : 'left-1'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {isAccountActive ? (
                                        <div className="space-y-5">
                                            {/* Status Akun Aktif Card jika user sudah terdaftar */}
                                            {clientUser && (
                                                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                                            <CheckCircle2 className="w-5 h-5" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-xs font-bold text-emerald-950">
                                                                    Akun Portal Klien Aktif
                                                                </span>
                                                                <Badge variant="success" className="text-[10px] py-0 px-2 font-bold uppercase">
                                                                    {clientUser.status || 'Active'}
                                                                </Badge>
                                                                <span className="text-[11px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full font-medium">
                                                                    Role: Client
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-emerald-900">
                                                                Email Login: <span className="font-semibold text-emerald-950 underline">{clientUser.email}</span>
                                                            </p>
                                                            <div className="text-[11px] text-emerald-700 flex items-center gap-2 pt-0.5">
                                                                <span>Dibuat: {clientUser.created_at ? new Date(clientUser.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                                                                <span>•</span>
                                                                <span>Login Terakhir: {clientUser.last_login_at ? new Date(clientUser.last_login_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : 'Belum pernah login'}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {client.phone && (
                                                        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const cleanPhone = (client.phone || '').replace(/[^0-9]/g, '').replace(/^0/, '62');
                                                                    const loginUrl = `${window.location.origin}/login`;
                                                                    const msg = `Halo Kak ${client.name},\n\nBerikut pengingat akses login Portal Klien Arams Photography Anda:\n\n🌐 Link Login : ${loginUrl}\n👤 Nama Klien : ${client.name}\n📧 Email      : ${clientUser.email}\n\nSilakan login untuk memantau progress project, review foto, dan download file dokumentasi Anda. Terima kasih!`;
                                                                    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                                                                }}
                                                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                                                            >
                                                                <MessageCircle className="w-3.5 h-3.5" />
                                                                <span>WA Pengingat</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <form onSubmit={handleSaveClientAccount} className="space-y-5">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                            Email Akun <span className="text-red-500">*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <Mail className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                            <input
                                                                type="email"
                                                                required
                                                                value={accountEmail}
                                                                onChange={(e) => setAccountEmail(e.target.value)}
                                                                placeholder="andipratama@email.com"
                                                                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                            Username (opsional)
                                                        </label>
                                                        <div className="relative">
                                                            <span className="text-xs font-bold text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2">
                                                                @
                                                            </span>
                                                            <input
                                                                type="text"
                                                                value={accountUsername}
                                                                onChange={(e) => setAccountUsername(e.target.value)}
                                                                placeholder="andipratama"
                                                                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                            {clientUser ? 'Password Baru / Kredensial' : 'Password Akun'} <span className="text-red-500">*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <Lock className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                            <input
                                                                type={showAccountPassword ? 'text' : 'password'}
                                                                required
                                                                value={accountPassword}
                                                                onChange={(e) => setAccountPassword(e.target.value)}
                                                                placeholder="Abc123!@#"
                                                                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowAccountPassword(!showAccountPassword)}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                                            >
                                                                {showAccountPassword ? (
                                                                    <EyeOff className="w-3.5 h-3.5" />
                                                                ) : (
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                            Konfirmasi Password <span className="text-red-500">*</span>
                                                        </label>
                                                        <div className="relative">
                                                            <Lock className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                            <input
                                                                type={showAccountPasswordConfirm ? 'text' : 'password'}
                                                                required
                                                                value={accountPasswordConfirm}
                                                                onChange={(e) => setAccountPasswordConfirm(e.target.value)}
                                                                placeholder="Abc123!@#"
                                                                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowAccountPasswordConfirm(!showAccountPasswordConfirm)}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                                            >
                                                                {showAccountPasswordConfirm ? (
                                                                    <EyeOff className="w-3.5 h-3.5" />
                                                                ) : (
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <label className="text-[11px] font-bold text-slate-700">
                                                            Pesan untuk Klien (Akan dikirim bersama kredensial)
                                                        </label>
                                                        <span className="text-[10px] text-slate-400">
                                                            {accountMessage.length} / 500
                                                        </span>
                                                    </div>
                                                    <textarea
                                                        rows={3}
                                                        maxLength={500}
                                                        value={accountMessage}
                                                        onChange={(e) => setAccountMessage(e.target.value)}
                                                        className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none leading-relaxed"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-[11px] font-bold text-slate-700 block mb-2">
                                                        Metode Pengiriman Kredensial Akun
                                                    </label>
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => setAccountShareMethod('email')}
                                                            className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${accountShareMethod === 'email'
                                                                ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold ring-1 ring-indigo-600 shadow-2xs'
                                                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                                                                <span className="text-xs font-bold">Email</span>
                                                            </div>
                                                            <p className="text-[11px] font-normal text-slate-500 leading-tight">
                                                                Kirim detail login ke email klien.
                                                            </p>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => setAccountShareMethod('whatsapp')}
                                                            className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${accountShareMethod === 'whatsapp'
                                                                ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold ring-1 ring-emerald-600 shadow-2xs'
                                                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                                                <span className="text-xs font-bold">WhatsApp</span>
                                                            </div>
                                                            <p className="text-[11px] font-normal text-slate-500 leading-tight">
                                                                Buka chat WhatsApp dengan draft kredensial klien.
                                                            </p>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => setAccountShareMethod('both')}
                                                            className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${accountShareMethod === 'both'
                                                                ? 'border-primary-accent bg-amber-50/30 text-slate-950 font-bold ring-1 ring-primary-accent shadow-2xs'
                                                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Send className="w-4 h-4 text-primary-accent shrink-0" />
                                                                <span className="text-xs font-bold">Email &amp; WhatsApp</span>
                                                            </div>
                                                            <p className="text-[11px] font-normal text-slate-500 leading-tight">
                                                                Kirim email sekaligus siapkan chat WhatsApp.
                                                            </p>
                                                        </button>
                                                    </div>

                                                    {/* Pratinjau Teks Pesan WhatsApp (wa.me) */}
                                                    {accountShareMethod !== 'email' && (
                                                        <div className="mt-3 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                                                                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                                    Format Pesan WhatsApp
                                                                </span>
                                                                {client.phone ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const cleanPhone = (client.phone || '').replace(/[^0-9]/g, '').replace(/^0/, '62');
                                                                            const loginUrl = `${window.location.origin}/login`;
                                                                            const note = accountMessage || 'Silakan login untuk memantau progress project, review foto, dan download file dokumentasi Anda.';
                                                                            const msg = `Halo Kak ${client.name},\n\nBerikut informasi akun akses Portal Klien Arams Photography Anda:\n\n🌐 Link Login : ${loginUrl}\n👤 Nama Klien : ${client.name}\n📧 Email      : ${accountEmail}\n🔑 Password   : ${accountPassword}\n\n📝 Keterangan:\n${note}\n\nTerima kasih!`;
                                                                            window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                                                                        }}
                                                                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
                                                                    >
                                                                        <span>Uji / Buka di WhatsApp Sekarang</span>
                                                                        <ExternalLink className="w-3 h-3" />
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-[11px] text-amber-700 font-medium">
                                                                        ⚠️ Nomor HP klien belum diisi
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-[11px] font-mono text-emerald-950 bg-white p-3 rounded-lg border border-emerald-200/70 whitespace-pre-line leading-relaxed select-all">
                                                                {`Halo Kak ${client.name},

Berikut informasi akun akses Portal Klien Arams Photography Anda:

🌐 Link Login : ${typeof window !== 'undefined' ? window.location.origin : ''}/login
👤 Nama Klien : ${client.name}
📧 Email      : ${accountEmail || '(email klien)'}
🔑 Password   : ${accountPassword || '(password akun)'}

📝 Keterangan:
${accountMessage || '-'}

Terima kasih!`}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div className="flex items-start gap-2.5">
                                                        <div className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                                            i
                                                        </div>
                                                        <p className="text-xs text-indigo-950 leading-relaxed">
                                                            Akun ini langsung tersimpan ke sistem (tabel users) dengan role <strong>Client</strong>. Klien dapat langsung login ke portal via <strong>/login</strong>.
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="submit"
                                                        disabled={submittingAccount}
                                                        className="px-5 py-2.5 rounded-xl bg-primary-accent hover:opacity-90 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
                                                    >
                                                        <Send className="w-3.5 h-3.5" />
                                                        <span>{submittingAccount ? 'Menyimpan...' : (clientUser ? 'Simpan & Kirim Ulang Kredensial' : 'Buat & Kirim Akun')}</span>
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                                            <Lock className="w-8 h-8 text-slate-300 mx-auto" />
                                            <h4 className="text-xs font-bold text-slate-700">Akses Portal Klien Non-Aktif</h4>
                                            <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                                Aktifkan tombol toggle "Akses Portal Klien" di kanan atas untuk memberikan akses portal kepada klien.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: 3 SIDEBAR WIDGETS (MATCHING REFERENCE SCREENSHOT EXACTLY & TIDAK BOLONG) */}
                    <div className="lg:col-span-4 flex flex-col gap-5 h-full">
                        {/* WIDGET 1: RINGKASAN PROJECT */}
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3.5 shrink-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-slate-900">Ringkasan Project</h3>
                                <div className="w-7 h-7 rounded-lg border border-indigo-100 bg-indigo-50/50 flex items-center justify-center text-indigo-600">
                                    <Folder className="w-3.5 h-3.5" />
                                </div>
                            </div>

                            <div>
                                <span className="text-3xl font-extrabold text-slate-900 font-mono block">
                                    {client.projects_count ?? rawProjects.length}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                                    Total Project
                                </span>
                            </div>

                            <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-emerald-600">Selesai</span>
                                    <span className="font-bold text-slate-800">{completedCount} Project</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-blue-600">Sedang Dikerjakan</span>
                                    <span className="font-bold text-slate-800">{inProgressCount} Project</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-amber-500">Akan Datang</span>
                                    <span className="font-bold text-slate-800">{upcomingCount} Project</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setMainTab('projects')}
                                    className="w-full text-center text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <span>Lihat Semua Project</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* WIDGET 2: RINGKASAN PEMBAYARAN */}
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs space-y-3.5 shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
                                    $
                                </div>
                                <h3 className="text-xs font-bold text-slate-900">Ringkasan Pembayaran</h3>
                            </div>

                            <div>
                                <span className="text-[11px] text-slate-400 font-medium block">
                                    Total Pembayaran
                                </span>
                                <span className="text-2xl font-extrabold text-slate-900 font-mono block mt-0.5">
                                    {formatRupiah(totalProjectValue)}
                                </span>
                            </div>

                            {/* Mini Visual Progress Bar */}
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min(100, Math.round((totalPaid / (totalProjectValue || 1)) * 100))}%`,
                                    }}
                                />
                            </div>

                            <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-emerald-600">Lunas</span>
                                    <div className="flex items-center gap-2 font-mono font-bold">
                                        <span className="text-slate-800">{formatRupiah(totalPaid)}</span>
                                        <span className="text-emerald-600 text-[11px]">
                                            {Math.round((totalPaid / (totalProjectValue || 1)) * 100)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-rose-500">Belum Lunas</span>
                                    <div className="flex items-center gap-2 font-mono font-bold">
                                        <span className="text-slate-800">{formatRupiah(outstanding)}</span>
                                        <span className="text-rose-500 text-[11px]">
                                            {Math.max(0, 100 - Math.round((totalPaid / (totalProjectValue || 1)) * 100))}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 space-y-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setMainTab('pembayaran')}
                                    className="w-full text-center text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <span>Lihat Detail Pembayaran</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setPaymentFormData({
                                            project_id: client.projects?.[0]?.id || '',
                                            amount: '',
                                            payment_date: new Date().toISOString().split('T')[0],
                                            payment_method_id: payment_methods?.[0]?.id || '1',
                                            reference_number: '',
                                            notes: 'Pelunasan / DP Project',
                                            proof_file: null,
                                        });
                                        setIsPaymentModalOpen(true);
                                    }}
                                    className="w-full py-2.5 rounded-xl bg-[#E57A00] hover:bg-[#cf6d00] text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01]"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Pembayaran</span>
                                </button>
                            </div>
                        </div>

                        {/* WIDGET 3: AKTIVITAS TERAKHIR (STRETCHED TO BOTTOM TO MATCH LEFT CARD) */}
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex-1 flex flex-col justify-between">
                            <div className="space-y-3.5">
                                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                                    <Clock className="w-4 h-4 text-purple-600" />
                                    <h3 className="text-xs font-bold text-slate-900">Aktivitas Terakhir</h3>
                                </div>

                                <div className="space-y-3 text-xs">
                                    {activityItems.map((act) => {
                                        const IconCmp = act.icon;
                                        return (
                                            <div key={act.id} className="flex items-start gap-3">
                                                <div
                                                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${act.iconBg}`}
                                                >
                                                    <IconCmp className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <span className="font-bold text-slate-900 block leading-tight truncate">
                                                        {act.title}
                                                    </span>
                                                    <span className="text-[11px] text-slate-500 block truncate">
                                                        {act.subtitle}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 block mt-0.5">
                                                        {act.timeText}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-3 mt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setMainTab('catatan')}
                                    className="w-full text-center text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <span>Lihat Semua Aktivitas</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* MODAL 1: EDIT CLIENT (5 continuous sections matching Tambah Client) */}
                {/* ========================================================================= */}
                <Modal
                    isOpen={isEditClientModalOpen}
                    onClose={() => setIsEditClientModalOpen(false)}
                    title="Edit Informasi Klien"
                    subtitle="Perbarui data profil, kontak, domisili, acara, dan preferensi klien."
                    maxWidth="3xl"
                    className="max-h-[90vh]"
                    footer={
                        <div className="flex items-center justify-between w-full gap-3">
                            <button
                                type="button"
                                onClick={() => setIsEditClientModalOpen(false)}
                                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                            >
                                Batal
                            </button>

                            <div className="flex items-center gap-2">
                                {currentEditStepIndex > 0 && (
                                    <button
                                        type="button"
                                        onClick={handlePrevEditStep}
                                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span>Sebelumnya</span>
                                    </button>
                                )}

                                {currentEditStepIndex < editSteps.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={handleNextEditStep}
                                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <span>Lanjut: {editSteps[currentEditStepIndex + 1].title}</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSaveClientEdit}
                                        disabled={submittingEdit}
                                        className="px-6 py-2.5 rounded-xl bg-[#C89445] hover:bg-[#b38136] text-white font-bold text-xs transition-all shadow-xs hover:scale-[1.02] cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {submittingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </button>
                                )}
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-5 pt-1">
                        {/* STEPPER HEADER (5 Horizontal Clickable Steps) */}
                        <div className="flex items-center justify-between gap-1 sm:gap-2 p-1.5 bg-slate-100/90 rounded-2xl overflow-x-auto scrollbar-none">
                            {editSteps.map((s, idx) => {
                                const isActive = editActiveFormTab === s.id;
                                const isPassed = currentEditStepIndex > idx;
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => goToEditStep(s.id as any)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex-1 justify-center ${isActive
                                            ? 'bg-white text-slate-900 shadow-2xs ring-1 ring-slate-200/80 font-extrabold'
                                            : isPassed
                                                ? 'text-emerald-700 hover:text-emerald-800 hover:bg-white/50'
                                                : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                                            }`}
                                    >
                                        <span
                                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive
                                                ? 'bg-[#C89445] text-white'
                                                : isPassed
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-slate-200 text-slate-600'
                                                }`}
                                        >
                                            {isPassed ? <Check className="w-3 h-3 text-emerald-700 stroke-[3]" /> : s.stepNum}
                                        </span>
                                        <span className="hidden sm:inline">{s.title}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* ========================================================================= */}
                        {/* TAB 1: IDENTITAS & PROFIL */}
                        {/* ========================================================================= */}
                        {editActiveFormTab === 'profile' && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                {/* Kategori / Tipe Klien Selection (SelectSearch dari Master Data Categories) */}
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                                        Kategori / Tipe Klien <span className="text-red-500">*</span>
                                    </label>
                                    <SelectSearch
                                        options={categoryOptions}
                                        value={editFormData.client_type}
                                        onChange={(val) => setEditFormData({ ...editFormData, client_type: val })}
                                        placeholder="Pilih Kategori / Tipe Klien..."
                                        searchPlaceholder="Cari kategori dari Master Data..."
                                        clearable={false}
                                        className="w-full text-xs bg-white"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Kategori diambil langsung dari Master Data Kategori (<Link href="/master-data/categories" className="text-amber-700 hover:underline font-medium">/master-data/categories</Link>).
                                    </p>
                                </div>

                                {/* WEDDING EDIT FIELDS */}
                                {activeEditFormType === 'wedding' && (
                                    <>
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                Judul Acara / Nama Project Wedding <span className="text-slate-400 font-normal">(Opsional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={editFormData.name}
                                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                                placeholder="Contoh: Kevin Sanjaya & Jessica Mila"
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                            />
                                        </div>

                                        {/* Calon Pengantin (CPW & CPP) Side by Side */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                            {/* CPW Card */}
                                            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                                                <div className="flex items-center gap-2 text-purple-900">
                                                    <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                                        <User className="w-3.5 h-3.5" />
                                                    </div>
                                                    <h4 className="text-xs font-bold text-slate-900">
                                                        Informasi Calon Pengantin (CPW)
                                                    </h4>
                                                </div>

                                                <div className="space-y-2.5">
                                                    <div>
                                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                            Nama Lengkap CPW
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={editFormData.bride_name}
                                                            onChange={(e) => setEditFormData({ ...editFormData, bride_name: e.target.value })}
                                                            placeholder="Nama lengkap CPW"
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                                Panggilan
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={editFormData.bride_nickname}
                                                                onChange={(e) => setEditFormData({ ...editFormData, bride_nickname: e.target.value })}
                                                                placeholder="Panggilan"
                                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                                Tanggal Lahir
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={editFormData.bride_birth_date}
                                                                onChange={(e) => setEditFormData({ ...editFormData, bride_birth_date: e.target.value })}
                                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* CPP Card */}
                                            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                                                <div className="flex items-center gap-2 text-purple-900">
                                                    <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                                        <User className="w-3.5 h-3.5" />
                                                    </div>
                                                    <h4 className="text-xs font-bold text-slate-900">
                                                        Informasi Calon Pengantin (CPP)
                                                    </h4>
                                                </div>

                                                <div className="space-y-2.5">
                                                    <div>
                                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                            Nama Lengkap CPP
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={editFormData.groom_name}
                                                            onChange={(e) => setEditFormData({ ...editFormData, groom_name: e.target.value })}
                                                            placeholder="Nama lengkap CPP"
                                                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                                Panggilan
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={editFormData.groom_nickname}
                                                                onChange={(e) => setEditFormData({ ...editFormData, groom_nickname: e.target.value })}
                                                                placeholder="Panggilan"
                                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                                Tanggal Lahir
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={editFormData.groom_birth_date}
                                                                onChange={(e) => setEditFormData({ ...editFormData, groom_birth_date: e.target.value })}
                                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional / Corporate Details */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                    Nama Pasangan / Pendamping Tambahan
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editFormData.partner_name}
                                                    onChange={(e) => setEditFormData({ ...editFormData, partner_name: e.target.value })}
                                                    placeholder="Opsional jika bukan wedding"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                    Nama Perusahaan / Brand (B2B)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editFormData.company_name}
                                                    onChange={(e) => setEditFormData({ ...editFormData, company_name: e.target.value })}
                                                    placeholder="Contoh: PT Astra International"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* NEWBORN EDIT FIELDS */}
                                {activeEditFormType === 'newborn' && (
                                    <div className="space-y-4">
                                        {/* Baby Data Repeater */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-amber-900">
                                                    <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                                        <Baby className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-slate-900">
                                                            Informasi Bayi / Anak (Newborn) <span className="text-red-500">*</span>
                                                        </h4>
                                                        <p className="text-[10px] text-slate-500">
                                                            Dapat mengisi lebih dari satu bayi jika kasus anak kembar.
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={handleAddEditChild}
                                                    className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    <span>+ Tambah Bayi (Kembar)</span>
                                                </button>
                                            </div>

                                            {(editFormData.children || []).map((child, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-3"
                                                >
                                                    <div className="flex items-center justify-between pb-1 border-b border-amber-200/50">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-bold text-[10px]">
                                                                👶 Bayi #{idx + 1} {(editFormData.children || []).length > 1 ? '(Kembar)' : ''}
                                                            </span>
                                                        </div>
                                                        {(editFormData.children || []).length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveEditChild(idx)}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                                <span>Hapus</span>
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                                Nama Lengkap Bayi #{idx + 1} <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={child.name}
                                                                onChange={(e) => handleChildEditChange(idx, 'name', e.target.value)}
                                                                placeholder="Nama bayi / anak"
                                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                                Tanggal Lahir / HPL
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={child.birth_date}
                                                                onChange={(e) => handleChildEditChange(idx, 'birth_date', e.target.value)}
                                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                            Jenis Kelamin
                                                        </label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleChildEditChange(idx, 'gender', 'male')}
                                                                className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                                                    child.gender === 'male'
                                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                                                }`}
                                                            >
                                                                <span>👦 Laki-laki (Boy)</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleChildEditChange(idx, 'gender', 'female')}
                                                                className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                                                    child.gender === 'female'
                                                                        ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                                                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                                                }`}
                                                            >
                                                                <span>👧 Perempuan (Girl)</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                type="button"
                                                onClick={handleAddEditChild}
                                                className="w-full py-2 px-3 rounded-xl border-2 border-dashed border-amber-300 hover:border-amber-400 bg-amber-50/40 hover:bg-amber-50 text-amber-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                            >
                                                <Plus className="w-3.5 h-3.5 text-amber-600" />
                                                <span>+ Tambah Bayi Kembar (Twins)</span>
                                            </button>
                                        </div>

                                        {/* Data Orang Tua */}
                                        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
                                            <div className="flex items-center gap-2 text-indigo-900">
                                                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                                    <User className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-slate-900">
                                                        Data Orang Tua (Ayah &amp; Ibu)
                                                    </h4>
                                                    <p className="text-[10px] text-slate-500">
                                                        Masukkan nama lengkap ayah dan ibu.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                        Nama Lengkap Ayah
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editFormData.father_name}
                                                        onChange={(e) => {
                                                            const f = e.target.value;
                                                            const m = editFormData.mother_name;
                                                            const combined = [f, m].filter(Boolean).join(' & ');
                                                            setEditFormData({ ...editFormData, father_name: f, partner_name: combined, name: editFormData.child_name ? `Baby ${editFormData.child_name}` : combined });
                                                        }}
                                                        placeholder="Nama ayah"
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                        Nama Lengkap Ibu
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editFormData.mother_name}
                                                        onChange={(e) => {
                                                            const m = e.target.value;
                                                            const f = editFormData.father_name;
                                                            const combined = [f, m].filter(Boolean).join(' & ');
                                                            setEditFormData({ ...editFormData, mother_name: m, partner_name: combined, name: editFormData.child_name ? `Baby ${editFormData.child_name}` : combined });
                                                        }}
                                                        placeholder="Nama ibu"
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                    Pekerjaan Orang Tua
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editFormData.occupation}
                                                    onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                                                    placeholder="Pekerjaan"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STANDARD EDIT FIELDS */}
                                {activeEditFormType === 'standard' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                Nama Lengkap Klien / Pemesan <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={editFormData.name}
                                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                                placeholder="Nama Klien"
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                    Nama Panggilan / Alias
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editFormData.contact_person}
                                                    onChange={(e) => setEditFormData({ ...editFormData, contact_person: e.target.value })}
                                                    placeholder="Panggilan"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                    Pekerjaan / Profesi
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editFormData.occupation}
                                                    onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                                                    placeholder="Profesi"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                Perusahaan / Brand / Institusi
                                            </label>
                                            <input
                                                type="text"
                                                value={editFormData.company_name}
                                                onChange={(e) => setEditFormData({ ...editFormData, company_name: e.target.value })}
                                                placeholder="Nama Perusahaan"
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ========================================================================= */}
                        {/* TAB 2: KONTAK & MEDIA SOSIAL */}
                        {/* ========================================================================= */}
                        {editActiveFormTab === 'contact' && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* 1. No. WhatsApp Utama */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between mb-1">
                                            <span>Nomor WhatsApp Utama <span className="text-red-500">*</span></span>
                                            <span className="text-[10px] text-emerald-600 font-semibold">Prioritas Kontak</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={editFormData.phone}
                                                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                                placeholder="Contoh: 081398765432"
                                                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all font-mono"
                                            />
                                            <Phone className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* 2. No. Telepon Cadangan */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                            Nomor Telepon Cadangan
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.secondary_phone}
                                            onChange={(e) => setEditFormData({ ...editFormData, secondary_phone: e.target.value })}
                                            placeholder="Contoh: 081234567890 (Pasangan/PIC)"
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all font-mono"
                                        />
                                    </div>

                                    {/* 3. Email Aktif */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                            Alamat Email Aktif
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={editFormData.email}
                                                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                                placeholder="contoh@gmail.com"
                                                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                            />
                                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* 4. Akun Instagram */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                            Akun Instagram
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={editFormData.instagram}
                                                onChange={(e) => setEditFormData({ ...editFormData, instagram: e.target.value })}
                                                placeholder="@username"
                                                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                            />
                                            <Instagram className="w-4 h-4 text-pink-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* 5. Preferensi Komunikasi */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                            Saluran Komunikasi Pilihan
                                        </label>
                                        <select
                                            value={editFormData.preferred_contact}
                                            onChange={(e) => setEditFormData({ ...editFormData, preferred_contact: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all cursor-pointer"
                                        >
                                            <option value="WhatsApp">WhatsApp (Rekomendasi Utama)</option>
                                            <option value="Email">Email Resmi</option>
                                            <option value="Phone">Panggilan Telepon Langsung</option>
                                        </select>
                                    </div>

                                    {/* 6. Contact Person / PIC */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                            Nama Contact Person (PIC)
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.contact_person}
                                            onChange={(e) => setEditFormData({ ...editFormData, contact_person: e.target.value })}
                                            placeholder="Contoh: Jessica Mila (CPP)"
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                        />
                                    </div>

                                    {/* 7. Pekerjaan */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                            Pekerjaan / Profesi
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.occupation}
                                            onChange={(e) => setEditFormData({ ...editFormData, occupation: e.target.value })}
                                            placeholder="Contoh: Pengusaha / Dokter / Aktris"
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                        />
                                    </div>

                                    {/* 8. Sosial Media Lainnya */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                            Sosial Media Lainnya
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.other_social_media}
                                            onChange={(e) => setEditFormData({ ...editFormData, other_social_media: e.target.value })}
                                            placeholder="TikTok: @user • YouTube: Channel"
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========================================================================= */}
                        {/* TAB 3: DOMISILI & WILAYAH */}
                        {/* ========================================================================= */}
                        {editActiveFormTab === 'location' && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* 1. Pilih Provinsi */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">1</span>
                                            <span>Pilih Provinsi</span>
                                        </label>
                                        <select
                                            value={editFormData.province_code}
                                            onChange={(e) => handleProvinceChange(e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all cursor-pointer"
                                        >
                                            <option value="">-- Pilih Provinsi --</option>
                                            {(regionProvinces || []).map((p) => (
                                                <option key={p.code} value={p.code}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 2. Pilih Kota/Kabupaten */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">2</span>
                                            <span>Pilih Kota / Kabupaten</span>
                                        </label>
                                        <select
                                            value={editFormData.city_code}
                                            onChange={(e) => handleCitySelectChange(e.target.value)}
                                            disabled={!editFormData.province_code || loadingCities}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <option value="">{loadingCities ? 'Memuat kota...' : '-- Pilih Kota / Kabupaten --'}</option>
                                            {(regionCities || []).map((c) => (
                                                <option key={c.code} value={c.code}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 3. Pilih Kecamatan */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">3</span>
                                            <span>Pilih Kecamatan</span>
                                        </label>
                                        <select
                                            value={editFormData.district_code}
                                            onChange={(e) => handleDistrictSelectChange(e.target.value)}
                                            disabled={!editFormData.city_code || loadingDistricts}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <option value="">{loadingDistricts ? 'Memuat kecamatan...' : '-- Pilih Kecamatan --'}</option>
                                            {(regionDistricts || []).map((d) => (
                                                <option key={d.code} value={d.code}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 4. Pilih Kelurahan */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">4</span>
                                            <span>Pilih Kelurahan</span>
                                        </label>
                                        <select
                                            value={editFormData.village_code}
                                            onChange={(e) => handleVillageSelectChange(e.target.value)}
                                            disabled={!editFormData.district_code || loadingVillages}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                                        >
                                            <option value="">{loadingVillages ? 'Memuat kelurahan...' : '-- Pilih Kelurahan --'}</option>
                                            {(regionVillages || []).map((v) => (
                                                <option key={v.code} value={v.code}>{v.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 5. Kode Pos */}
                                    <div className="sm:col-span-2">
                                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">5</span>
                                            <span>Kode Pos</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={editFormData.postal_code}
                                            onChange={(e) => setEditFormData({ ...editFormData, postal_code: e.target.value })}
                                            placeholder="Masukkan kode pos"
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all font-mono"
                                        />
                                    </div>

                                    {/* 6. Tulis Alamat Lengkap */}
                                    <div className="sm:col-span-2">
                                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">6</span>
                                            <span>Tulis Alamat Lengkap</span>
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                rows={3}
                                                value={editFormData.address}
                                                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                                                placeholder="Contoh: Jl. Melawai Raya No.12, RT.03/RW.02, Melawai, Kebayoran Baru, Jakarta Selatan 12160"
                                                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all resize-none pr-10"
                                            />
                                            <MapPin className="w-4 h-4 text-slate-400 absolute right-3 bottom-3 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========================================================================= */}
                        {/* TAB 4: INFORMASI ACARA & PAKET PROJECT */}
                        {/* ========================================================================= */}
                        {editActiveFormTab === 'event' && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Jenis Acara */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">9</span>
                                            <span>Jenis Acara / Project</span>
                                        </label>
                                        <select
                                            value={editFormData.event_type}
                                            onChange={(e) => setEditFormData({ ...editFormData, event_type: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all cursor-pointer"
                                        >
                                            <option value="Wedding">Wedding</option>
                                            <option value="Prewedding">Prewedding</option>
                                            <option value="Engagement">Engagement / Lamaran</option>
                                            <option value="Birthday">Birthday / Ulang Tahun</option>
                                            <option value="Corporate">Corporate Event</option>
                                            <option value="Family">Family Session</option>
                                        </select>
                                    </div>

                                    {/* Tanggal Pelaksanaan Acara */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">10</span>
                                            <span>Tanggal Pelaksanaan Acara</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={editFormData.event_date}
                                            onChange={(e) => setEditFormData({ ...editFormData, event_date: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                        />
                                    </div>

                                    {/* Waktu Pelaksanaan Acara */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">11</span>
                                            <span>Waktu Pelaksanaan Acara</span>
                                        </label>
                                        <input
                                            type="time"
                                            value={editFormData.event_time}
                                            onChange={(e) => setEditFormData({ ...editFormData, event_time: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                        />
                                    </div>

                                    {/* Tempat Acara */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">12</span>
                                            <span>Tempat / Lokasi Acara</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={editFormData.event_location}
                                                onChange={(e) => setEditFormData({ ...editFormData, event_location: e.target.value })}
                                                placeholder="Contoh: The Ritz Carlton Jakarta"
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all pr-10"
                                            />
                                            <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Paket Dipilih */}
                                    <div className="sm:col-span-2">
                                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">13</span>
                                            <span>Pilihan Paket Photography</span>
                                        </label>
                                        <select
                                            value={editFormData.package_id}
                                            onChange={(e) => setEditFormData({ ...editFormData, package_id: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all cursor-pointer"
                                        >
                                            <option value="">-- Pilih Paket (Opsional) --</option>
                                            {(packages && packages.length > 0) ? (
                                                packages.map((pkg) => (
                                                    <option key={pkg.id} value={pkg.id}>
                                                        {pkg.name} {pkg.base_price ? `(${formatRupiah(pkg.base_price)})` : ''}
                                                    </option>
                                                ))
                                            ) : (
                                                <>
                                                    <option value="1">Wedding Gold Package (Rp 45.000.000)</option>
                                                    <option value="2">Wedding Silver Package (Rp 25.000.000)</option>
                                                    <option value="3">Prewedding Premium (Rp 15.000.000)</option>
                                                    <option value="4">Custom Package</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========================================================================= */}
                        {/* TAB 5: SUMBER, STATUS & CATATAN */}
                        {/* ========================================================================= */}
                        {editActiveFormTab === 'preferences' && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Sumber Klien */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">14</span>
                                            <span>Sumber Klien (Lead Source) <span className="text-red-500">*</span></span>
                                        </label>
                                        <select
                                            value={editFormData.source}
                                            onChange={(e) => setEditFormData({ ...editFormData, source: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all cursor-pointer"
                                        >
                                            <option value="Instagram">Instagram Ads / Organik</option>
                                            <option value="TikTok">TikTok</option>
                                            <option value="Google">Google Search / SEO</option>
                                            <option value="Wedding Organizer">Vendor Partner / Wedding Organizer</option>
                                            <option value="Rekomendasi Teman">Rekomendasi Klien / Teman</option>
                                            <option value="Website">Website Resmi Arams</option>
                                            <option value="Bridestory">Bridestory</option>
                                        </select>
                                    </div>

                                    {/* Status Klien */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                            Status Klien
                                        </label>
                                        <select
                                            value={editFormData.status}
                                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all cursor-pointer"
                                        >
                                            <option value="active">Aktif (Sedang Berjalan)</option>
                                            <option value="lead">Lead / Calon Klien (Follow-up)</option>
                                            <option value="completed">Selesai (Arsip)</option>
                                        </select>
                                    </div>

                                    {/* Conditional Wedding Organizer Referral */}
                                    {editFormData.source === 'Wedding Organizer' && (
                                        <div className="sm:col-span-2">
                                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                Pilih Wedding Organizer (Partner)
                                            </label>
                                            <select
                                                value={editFormData.wedding_organizer_id}
                                                onChange={(e) => setEditFormData({ ...editFormData, wedding_organizer_id: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all cursor-pointer"
                                            >
                                                <option value="">-- Pilih Partner WO --</option>
                                                {(wedding_organizers || []).map((wo) => (
                                                    <option key={wo.id} value={wo.id}>
                                                        {wo.name} ({wo.city || 'Partner'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Conditional Referred By Client */}
                                    {editFormData.source === 'Rekomendasi Teman' && (
                                        <div className="sm:col-span-2">
                                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                Direferensikan oleh Klien
                                            </label>
                                            <select
                                                value={editFormData.referred_by_client_id}
                                                onChange={(e) => setEditFormData({ ...editFormData, referred_by_client_id: e.target.value })}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all cursor-pointer"
                                            >
                                                <option value="">-- Pilih Klien Referrer --</option>
                                                {(all_clients || []).map((cl) => (
                                                    <option key={cl.id} value={cl.id}>
                                                        {cl.name} ({cl.phone || cl.city || 'Klien'})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Tags Selection */}
                                    <div className="sm:col-span-2">
                                        <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                                            Tag / Label Klien
                                        </label>
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {presetTags.map((tag) => {
                                                const isSelected = editFormData.tags.includes(tag);
                                                return (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => toggleEditTag(tag)}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${isSelected
                                                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                                            }`}
                                                    >
                                                        {tag}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Catatan Umum */}
                                    <div className="sm:col-span-2">
                                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">15</span>
                                            <span>Catatan Umum / Permintaan Khusus</span>
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={editFormData.notes}
                                            onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                                            placeholder="Contoh: Klien menginginkan konsep timeless & elegant. Request sesi outdoor."
                                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>

                {/* ========================================================================= */}
                {/* MODAL 2: TAMBAH PEMBAYARAN */}
                {/* ========================================================================= */}
                <Modal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    title="Tambah Pembayaran Klien"
                    subtitle={`Catat pembayaran baru untuk ${client.name}.`}
                    maxWidth="md"
                    footer={
                        <div className="flex items-center justify-end gap-3 w-full">
                            <button
                                type="button"
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleSavePayment}
                                disabled={submittingPayment || unpaidProjects.length === 0}
                                className="px-5 py-2 rounded-xl bg-primary-accent hover:opacity-90 active:scale-[0.99] text-white font-bold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                            >
                                {submittingPayment ? 'Menyimpan...' : 'Simpan Pembayaran'}
                            </button>
                        </div>
                    }
                >
                    {unpaidProjects.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2.5 my-2">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                                <Check className="w-5 h-5" />
                            </div>
                            <h4 className="text-sm font-extrabold text-emerald-950">
                                Semua Tagihan Project Sudah Lunas!
                            </h4>
                            <p className="text-xs text-emerald-700 max-w-sm mx-auto leading-relaxed">
                                Seluruh invoice project milik klien {client.name} telah lunas 100%. Tidak ada sisa tagihan yang perlu dibayar.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSavePayment} className="space-y-4 pt-1">
                            {/* Project Selector - Only showing unpaid/partially paid projects */}
                            <div>
                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                    Pilih Project Tagihan <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={paymentFormData.project_id}
                                    onChange={(e) => setPaymentFormData({ ...paymentFormData, project_id: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all cursor-pointer"
                                >
                                    {unpaidProjects.map((p) => {
                                        const tot = Number(p.total_amount || 0);
                                        const pd = Number(p.paid_amount || 0);
                                        const rem = Math.max(0, tot - pd);
                                        return (
                                            <option key={p.id} value={p.id}>
                                                {p.name} (Sisa: {formatRupiah(rem)})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* Sisa Pembayaran Info Card */}
                            {selectedPaymentProject && (
                                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Total Nilai Project:</span>
                                        <span className="font-bold font-mono text-slate-800">
                                            {formatRupiah(paymentProjectTotal)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-500">Sudah Dibayar:</span>
                                        <span className="font-bold font-mono text-emerald-600">
                                            {formatRupiah(paymentProjectPaid)}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                                        <span className="font-extrabold text-slate-900">Sisa Tagihan Belum Lunas:</span>
                                        <span className="font-black font-mono text-amber-600 text-sm">
                                            {formatRupiah(paymentProjectRemaining)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Nominal Input & Quick Shortcuts */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-[11px] font-bold text-slate-700 block">
                                        Nominal Pembayaran (Rp) <span className="text-red-500">*</span>
                                    </label>
                                    <span className="text-[10px] text-slate-400">Pilih shortcut:</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    value={paymentFormData.amount}
                                    onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                                    placeholder="Contoh: 15000000"
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all font-mono font-bold"
                                />

                                {/* Shortcut Buttons: DP 30%, DP 50%, Sisa Tagihan 100% */}
                                <div className="flex items-center gap-2 mt-2 pt-1 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={() => applyPaymentShortcut('dp30')}
                                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-primary-accent/10 hover:text-primary-accent border border-slate-200/80 text-[11px] font-bold text-slate-700 transition-all cursor-pointer"
                                    >
                                        DP 30% ({formatRupiah(Math.round(paymentProjectTotal * 0.3))})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyPaymentShortcut('dp50')}
                                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-primary-accent/10 hover:text-primary-accent border border-slate-200/80 text-[11px] font-bold text-slate-700 transition-all cursor-pointer"
                                    >
                                        DP 50% ({formatRupiah(Math.round(paymentProjectTotal * 0.5))})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => applyPaymentShortcut('full')}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-extrabold text-emerald-800 transition-all cursor-pointer"
                                    >
                                        Lunas 100% ({formatRupiah(paymentProjectRemaining)})
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                        Tanggal Bayar
                                    </label>
                                    <input
                                        type="date"
                                        value={paymentFormData.payment_date}
                                        onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_date: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                        Metode Pembayaran
                                    </label>
                                    <select
                                        value={paymentFormData.payment_method_id}
                                        onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_method_id: e.target.value })}
                                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all cursor-pointer"
                                    >
                                        {(payment_methods || []).length > 0 ? (
                                            payment_methods.map((pm) => (
                                                <option key={pm.id} value={pm.id}>
                                                    {pm.name}
                                                </option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="1">Transfer Bank Mandiri</option>
                                                <option value="2">Transfer BCA</option>
                                                <option value="3">Cash / Tunai</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                    Catatan / Keterangan Pembayaran
                                </label>
                                <input
                                    type="text"
                                    value={paymentFormData.notes}
                                    onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                                    placeholder="Contoh: DP 50% / Pelunasan"
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all"
                                />
                            </div>

                            {/* Upload Bukti Pembayaran / Struk Transfer */}
                            <div>
                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                    Upload Bukti Pembayaran / Struk Transfer (Opsional)
                                </label>
                                {paymentFormData.proof_file ? (
                                    <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                                <Receipt className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-800 truncate">
                                                    {paymentFormData.proof_file.name}
                                                </p>
                                                <span className="text-[10px] text-slate-500">
                                                    {(paymentFormData.proof_file.size / 1024).toFixed(1)} KB
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentFormData({ ...paymentFormData, proof_file: null })}
                                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center transition-colors cursor-pointer"
                                            title="Hapus file"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="border-2 border-dashed border-slate-200 hover:border-primary-accent rounded-xl p-4 flex flex-col items-center justify-center text-center bg-slate-50/60 hover:bg-slate-50 transition-all cursor-pointer group">
                                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-primary-accent mb-1 transition-colors" />
                                        <span className="text-xs font-bold text-slate-700 group-hover:text-primary-accent transition-colors">
                                            Pilih Foto atau Dokumen Bukti Transfer
                                        </span>
                                        <span className="text-[10px] text-slate-400 mt-0.5">
                                            JPG, PNG, WEBP, atau PDF (Maks. 10MB)
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,application/pdf"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                setPaymentFormData({ ...paymentFormData, proof_file: file });
                                            }}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </form>
                    )}
                </Modal>

                {/* ========================================================================= */}
                {/* MODAL 3: TAMBAH LINK GOOGLE DRIVE */}
                {/* ========================================================================= */}
                <Modal
                    isOpen={isAddDriveLinkModalOpen}
                    onClose={() => setIsAddDriveLinkModalOpen(false)}
                    title="Simpan Link Google Drive"
                    subtitle={`Tambahkan tautan folder Google Drive untuk berkas atau preview foto & video klien ${client.name}.`}
                    maxWidth="md"
                    footer={
                        <div className="flex items-center justify-end gap-3 w-full">
                            <Button
                                variant="outline"
                                onClick={() => setIsAddDriveLinkModalOpen(false)}
                                disabled={savingDriveLink}
                            >
                                Batal
                            </Button>
                            <Button
                                className="bg-primary-accent hover:opacity-90 active:scale-[0.99] text-white"
                                onClick={() => handleSaveDriveLink()}
                                disabled={savingDriveLink}
                            >
                                {savingDriveLink ? 'Menyimpan...' : 'Simpan Link'}
                            </Button>
                        </div>
                    }
                >
                    <form onSubmit={handleSaveDriveLink} className="space-y-4 pt-1">
                        <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                Judul / Keterangan Link <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                required
                                value={newDriveTitle}
                                onChange={(e) => setNewDriveTitle(e.target.value)}
                                placeholder="Contoh: Sneak Peak Photo - Kevin & Jessica"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                URL Google Drive <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="url"
                                required
                                value={newDriveUrl}
                                onChange={(e) => setNewDriveUrl(e.target.value)}
                                placeholder="https://drive.google.com/drive/folders/..."
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                Tipe Berkas
                            </label>
                            <NativeSelect
                                value={newDriveLinkType}
                                onChange={(e) => setNewDriveLinkType(e.target.value)}
                                className="text-xs"
                            >
                                <option value="google_drive">Google Drive (Umum)</option>
                                <option value="master_raw">Master RAW</option>
                                <option value="highlight">Highlight Photo / Video</option>
                                <option value="cinematic">Cinematic / Full Video</option>
                                <option value="full_doc">Full Documentary</option>
                                <option value="album">Album Layout</option>
                                <option value="sneak_peak">Sneak Peak</option>
                            </NativeSelect>
                        </div>

                        <p className="text-[11px] text-slate-400">
                            Project aktif: <span className="font-bold text-slate-700">{selectedProject?.code} — {selectedProject?.name}</span>
                        </p>
                    </form>
                </Modal>

                {/* ========================================================================= */}
                {/* MODAL 4: CATAT RIWAYAT KOMUNIKASI */}
                {/* ========================================================================= */}
                <Modal
                    isOpen={isAddCommModalOpen}
                    onClose={() => setIsAddCommModalOpen(false)}
                    title="Catat Riwayat Komunikasi"
                    subtitle={`Dokumentasikan interaksi WhatsApp, Telepon, Email, atau Meeting dengan klien ${client.name}.`}
                    maxWidth="md"
                    footer={
                        <div className="flex items-center justify-end gap-3 w-full">
                            <Button
                                variant="outline"
                                onClick={() => setIsAddCommModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button
                                className="bg-primary-accent hover:opacity-90 active:scale-[0.99] text-white"
                                onClick={() => handleSaveComm()}
                            >
                                Simpan Komunikasi
                            </Button>
                        </div>
                    }
                >
                    <form onSubmit={handleSaveComm} className="space-y-4 pt-1">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                    Channel Komunikasi <span className="text-red-500">*</span>
                                </label>
                                <NativeSelect
                                    value={newCommFormData.channel}
                                    onChange={(e) => setNewCommFormData({ ...newCommFormData, channel: e.target.value })}
                                >
                                    <option value="WhatsApp">WhatsApp</option>
                                    <option value="Email">Email</option>
                                    <option value="Telepon">Telepon</option>
                                    <option value="Meeting Langsung">Meeting Langsung</option>
                                </NativeSelect>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                    Tanggal Interaksi
                                </label>
                                <Input
                                    type="date"
                                    value={newCommFormData.date}
                                    onChange={(e) => setNewCommFormData({ ...newCommFormData, date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                Topik / Judul Interaksi <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                required
                                value={newCommFormData.title}
                                onChange={(e) => setNewCommFormData({ ...newCommFormData, title: e.target.value })}
                                placeholder="Contoh: Konfirmasi Rundown Hari H & Shotlist"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                Catatan Isi Komunikasi <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                rows={4}
                                required
                                value={newCommFormData.content}
                                onChange={(e) => setNewCommFormData({ ...newCommFormData, content: e.target.value })}
                                placeholder="Tuliskan ringkasan pembahasan atau tanggapan klien..."
                                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-accent/20 focus:border-primary-accent transition-all resize-none"
                            />
                        </div>
                    </form>
                </Modal>

                {/* ========================================================================= */}
                {/* MODAL 5: EDIT ALUR TAHAP TIMELINE */}
                {/* ========================================================================= */}
                <Modal
                    isOpen={isEditStageModalOpen}
                    onClose={() => setIsEditStageModalOpen(false)}
                    title={`Edit Alur Tahap ${stageFormData.step} — ${selectedProject?.name || 'Project'}`}
                    subtitle="Sesuaikan nama tahapan, fase, target durasi/deadline, output deliverable, PIC, status, dan deskripsi aktivitas pengerjaan."
                    maxWidth="lg"
                    footer={
                        <div className="flex items-center justify-between w-full flex-wrap gap-2">
                            <div>
                                {currentStages[editingStageIndex]?.isCustom && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleResetStageToDefault}
                                        disabled={isSavingStage}
                                        className="text-xs text-amber-700 hover:bg-amber-50 border-amber-200 cursor-pointer"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                        Reset ke Standar Alur
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditStageModalOpen(false)}
                                    disabled={isSavingStage}
                                >
                                    Batal
                                </Button>
                                <Button
                                    className="bg-primary-accent hover:opacity-90 active:scale-[0.99] text-white font-bold"
                                    onClick={(e) => handleSaveStageEdit(e)}
                                    disabled={isSavingStage}
                                >
                                    {isSavingStage ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </div>
                    }
                >
                    <form onSubmit={handleSaveStageEdit} className="space-y-4 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                    Nama / Judul Tahap <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    required
                                    value={stageFormData.title}
                                    onChange={(e) => setStageFormData({ ...stageFormData, title: e.target.value })}
                                    placeholder="Contoh: Booking & Briefing Sesi"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                    Fase Proyek <span className="text-red-500">*</span>
                                </label>
                                <NativeSelect
                                    value={stageFormData.phase}
                                    onChange={(e) => setStageFormData({ ...stageFormData, phase: e.target.value })}
                                >
                                    <option value="Pra-Acara">Pra-Acara</option>
                                    <option value="Hari H">Hari H</option>
                                    <option value="Pasca-Produksi">Pasca-Produksi</option>
                                    <option value="Review">Review</option>
                                    <option value="Finishing">Finishing</option>
                                    <option value="Selesai">Selesai</option>
                                    <option value="Operasional">Operasional</option>
                                </NativeSelect>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                    Target Durasi / Deadline
                                </label>
                                <Input
                                    type="text"
                                    value={stageFormData.duration}
                                    onChange={(e) => setStageFormData({ ...stageFormData, duration: e.target.value })}
                                    placeholder="Contoh: H-7 s/d H-1 atau H+14"
                                />
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                    Penanggung Jawab (PIC)
                                </label>
                                <Input
                                    type="text"
                                    value={stageFormData.pic}
                                    onChange={(e) => setStageFormData({ ...stageFormData, pic: e.target.value })}
                                    placeholder="Contoh: Admin Finance & CRM / Lead Photographer"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                Output / Deliverable
                            </label>
                            <Input
                                type="text"
                                value={stageFormData.deliv}
                                onChange={(e) => setStageFormData({ ...stageFormData, deliv: e.target.value })}
                                placeholder="Contoh: Briefing & Moodboard Konsep Foto"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                    Status Tahap
                                </label>
                                <NativeSelect
                                    value={stageFormData.status}
                                    onChange={(e) => {
                                        const newStatus = e.target.value as 'done' | 'active' | 'pending';
                                        setStageFormData({
                                            ...stageFormData,
                                            status: newStatus,
                                            progress:
                                                newStatus === 'done'
                                                    ? 100
                                                    : newStatus === 'active'
                                                        ? stageFormData.progress || 50
                                                        : 0,
                                        });
                                    }}
                                >
                                    <option value="pending">Belum Dimulai (Pending)</option>
                                    <option value="active">Sedang Dikerjakan (In Progress)</option>
                                    <option value="done">Selesai (Completed)</option>
                                </NativeSelect>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                    Progres Pengerjaan Tahap Ini ({stageFormData.progress}%)
                                </label>
                                <div className="flex items-center gap-3 pt-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="5"
                                        value={stageFormData.progress}
                                        onChange={(e) =>
                                            setStageFormData({ ...stageFormData, progress: Number(e.target.value) })
                                        }
                                        className="flex-1 accent-primary-accent cursor-pointer"
                                    />
                                    <span className="font-mono font-bold text-xs px-2 py-1 rounded-md bg-slate-100 min-w-[50px] text-center">
                                        {stageFormData.progress}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                Deskripsi & Aktivitas Tim
                            </label>
                            <Textarea
                                rows={3}
                                value={stageFormData.activity}
                                onChange={(e) => setStageFormData({ ...stageFormData, activity: e.target.value })}
                                placeholder="Deskripsikan SOP atau aktivitas detail yang dikerjakan pada tahap ini..."
                                className="w-full text-xs"
                            />
                        </div>
                    </form>
                </Modal>
            </div>
        </>
    );
}
