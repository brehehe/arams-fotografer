import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Users,
    UserCheck,
    UserPlus,
    Folder,
    Briefcase,
    Plus,
    Download,
    Eye,
    MoreVertical,
    Trash2,
    Edit,
    Phone,
    Mail,
    MapPin,
    Search,
    SlidersHorizontal,
    ArrowRight,
    Calendar,
    Clock,
    ExternalLink,
    CheckCircle2,
    Sparkles,
    User,
    Heart,
    Building2,
    Tag,
    Instagram,
    MessageCircle,
    FileText,
    Check,
    Ban,
    ChevronRight,
    ChevronLeft,
    Globe,
    Building,
    Share2,
    Copy,
    Baby,
} from 'lucide-react';
import { formatRupiah, formatRupiahCompact, formatNumber } from '@/lib/formatters';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    TableEmpty,
    StatCard,
    FilterBar,
    Badge,
    Pagination,
    Modal,
    AlertConfirmation,
    Input,
    NativeSelect,
    SelectSearch,
    Alert,
    AlertTitle,
    AlertDescription,
} from '@/components/ui';

interface ClientItem {
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
    phone: string;
    secondary_phone?: string;
    preferred_contact?: string;
    province?: string;
    city: string;
    district?: string;
    village?: string;
    postal_code?: string;
    address: string;
    source: string;
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
    avatar: string;
    created_at?: string;
    projects_count: number;
    active_projects_count: number;
    total_value: number;
    total_paid: number;
}

interface ClientsIndexProps {
    clients: {
        data: ClientItem[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
        per_page: number;
        prev_page_url?: string | null;
        next_page_url?: string | null;
    };
    filters: {
        search?: string;
        status?: string;
        city?: string;
        source?: string;
        per_page?: number;
    };
    cities: string[];
    sources: string[];
    categories?: Array<{
        id: string | number;
        name: string;
        slug?: string;
        description?: string;
        color?: string;
        form_type?: string;
    }>;
    packages?: Array<{
        id: string | number;
        name: string;
        category_id?: string | number;
        base_price?: number;
        duration_hours?: number;
        description?: string;
    }>;
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
    stats: {
        total_clients: number;
        active_clients: number;
        blocked_clients?: number;
        new_this_month?: number;
        total_projects?: number;
        ongoing_projects: number;
        total_value: number;
        total_received: number;
    };
}

const getInitials = (name?: string) => {
    if (!name) return 'CL';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

const getInitialsBg = (name?: string) => {
    const colors = [
        'bg-purple-100 text-purple-700',
        'bg-pink-100 text-pink-700',
        'bg-blue-100 text-blue-700',
        'bg-amber-100 text-amber-700',
        'bg-rose-100 text-rose-700',
        'bg-emerald-100 text-emerald-700',
        'bg-indigo-100 text-indigo-700',
    ];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const getClientTypeLabel = (client: ClientItem) => {
    if (client.child_name) {
        return `👶 ${client.child_name}`;
    }
    if (client.bride_name && client.groom_name) {
        return `👰🤵 ${client.groom_name} & ${client.bride_name}`;
    }
    if (client.client_type === 'corporate' || client.company_name || client.name?.toLowerCase().includes('pt ') || client.name?.toLowerCase().includes('bank')) {
        return 'Klien Corporate';
    }
    if ((client.total_value || 0) > 40000000 || client.client_type === 'premium') {
        return 'Klien Premium';
    }
    return 'Klien Regular';
};

const formatDateIndonesian = (dateStr?: string) => {
    if (!dateStr) return '18 Jan 2026';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
};

const getTimeAgoIndonesian = (dateStr?: string) => {
    if (!dateStr) return '2 bulan lalu';
    try {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 1) return 'Hari ini';
        if (diffDays < 7) return `${diffDays} hari lalu`;
        if (diffDays < 30) return `${Math.max(1, Math.floor(diffDays / 7))} minggu lalu`;
        if (diffDays < 365) return `${Math.max(1, Math.floor(diffDays / 30))} bulan lalu`;
        return `${Math.max(1, Math.floor(diffDays / 365))} tahun lalu`;
    } catch {
        return 'Baru saja';
    }
};

export default function ClientsIndex({
    clients = { data: [], current_page: 1, last_page: 1, total: 0, from: 0, to: 0, per_page: 10 },
    filters = {},
    cities = [],
    sources = [],
    categories = [],
    packages = [],
    wedding_organizers = [],
    all_clients = [],
    stats = { total_clients: 0, active_clients: 0, blocked_clients: 0, new_this_month: 0, total_projects: 0, ongoing_projects: 0, total_value: 0, total_received: 0 },
}: ClientsIndexProps) {
    // Search & Filter State
    const [search, setSearch] = useState(typeof filters?.search === 'string' ? filters.search : '');
    const [status, setStatus] = useState(typeof filters?.status === 'string' ? filters.status : 'Semua');
    const [city, setCity] = useState(typeof filters?.city === 'string' ? filters.city : 'Semua');
    const [source, setSource] = useState(typeof filters?.source === 'string' ? filters.source : 'Semua');
    const [perPage, setPerPage] = useState(filters?.per_page || 10);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Selected rows for bulk operations
    const [selectedClients, setSelectedClients] = useState<number[]>([]);

    // Modals state
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [detailModalClient, setDetailModalClient] = useState<ClientItem | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCopyFormLink = () => {
        const url = typeof window !== 'undefined' ? `${window.location.origin}/form-klien` : 'http://localhost:8000/form-klien';
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Link Formulir Booking Online Klien berhasil disalin ke clipboard!');
        setTimeout(() => setCopied(false), 2500);
    };

    // Confirmation Alert state
    const [confirmDelete, setConfirmDelete] = useState<{
        isOpen: boolean;
        clientId?: string | number;
        clientName?: string;
        isBulk?: boolean;
    }>({ isOpen: false });

    // Confirmation Alert state for Toggle Block / Unblock
    const [confirmToggleBlock, setConfirmToggleBlock] = useState<{
        isOpen: boolean;
        client?: ClientItem | null;
        isProcessing?: boolean;
    }>({ isOpen: false, client: null, isProcessing: false });

    const handleExecuteToggleBlock = () => {
        if (!confirmToggleBlock.client) return;
        const targetClient = confirmToggleBlock.client;
        const isCurrentlyBlocked = targetClient.status === 'blocked';

        setConfirmToggleBlock((prev) => ({ ...prev, isProcessing: true }));
        router.patch(
            `/clients/${targetClient.id}/toggle-block`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        isCurrentlyBlocked
                            ? `Blokir pada klien ${targetClient.name} berhasil dibuka.`
                            : `Klien ${targetClient.name} berhasil diblokir.`
                    );
                    setConfirmToggleBlock({ isOpen: false, client: null, isProcessing: false });
                },
                onError: () => {
                    toast.error('Gagal memperbarui status klien. Silakan coba lagi.');
                    setConfirmToggleBlock((prev) => ({ ...prev, isProcessing: false }));
                },
            }
        );
    };

    // Create / Edit Form State
    const initialFormData = {
        name: '',
        client_type: 'wedding',
        partner_name: '',
        bride_name: '',
        bride_nickname: '',
        groom_name: '',
        groom_nickname: '',
        bride_birth_date: '',
        groom_birth_date: '',
        child_name: '',
        child_nickname: '',
        child_birth_date: '',
        child_gender: 'male' as 'male' | 'female',
        father_name: '',
        mother_name: '',
        children: [
            { name: '', nickname: '', birth_date: '', gender: 'male' },
        ],
        company_name: '',
        email: '',
        instagram: '',
        other_social_media: '',
        phone: '',  
        secondary_phone: '',
        preferred_contact: 'WhatsApp',
        contact_person: '',
        occupation: '',
        province: '',
        province_code: '',
        city: '',
        city_code: '',
        district: '',
        district_code: '',
        village: '',
        village_code: '',
        postal_code: '',
        address: '',
        event_type: 'Wedding',
        event_date: '',
        event_time: '',
        event_location: '',
        package_id: '',
        source: 'Instagram',
        referred_by_client_id: '',
        wedding_organizer_id: '',
        referral_name: '',
        status: 'active',
        notes: '',
        tags: ['VIP', 'Wedding 2026'] as string[],
    };

    interface RegionItem {
        code: string;
        name: string;
        postal_code?: string;
    }

    const DEFAULT_INDONESIA_PROVINCES: RegionItem[] = [
        { code: '11', name: 'ACEH' },
        { code: '51', name: 'BALI' },
        { code: '36', name: 'BANTEN' },
        { code: '17', name: 'BENGKULU' },
        { code: '34', name: 'DAERAH ISTIMEWA YOGYAKARTA' },
        { code: '31', name: 'DAERAH KHUSUS IBUKOTA JAKARTA' },
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

    const [formData, setFormData] = useState(initialFormData);
    const [activeFormTab, setActiveFormTab] = useState<'profile' | 'contact' | 'location' | 'event' | 'preferences'>('profile');
    const [customTagInput, setCustomTagInput] = useState('');
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Regional cascading dropdown states
    const [regionProvinces, setRegionProvinces] = useState<RegionItem[]>(DEFAULT_INDONESIA_PROVINCES);
    const [regionCities, setRegionCities] = useState<RegionItem[]>([]);
    const [regionDistricts, setRegionDistricts] = useState<RegionItem[]>([]);
    const [regionVillages, setRegionVillages] = useState<RegionItem[]>([]);

    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingVillages, setLoadingVillages] = useState(false);

    // Cascade handlers for regional data
    const handleProvinceChange = (provCode: string) => {
        const prov = (regionProvinces || []).find((p) => p?.code === provCode);
        setFormData((prev) => ({
            ...prev,
            province: prov ? prov.name : '',
            province_code: provCode,
            city: '',
            city_code: '',
            district: '',
            district_code: '',
            village: '',
            village_code: '',
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
                    if (Array.isArray(data)) setRegionCities(data);
                })
                .catch((err) => console.error('Gagal memuat kota:', err))
                .finally(() => setLoadingCities(false));
        }
    };

    const handleCitySelectChange = (cCode: string) => {
        const c = (regionCities || []).find((item) => item?.code === cCode);
        setFormData((prev) => ({
            ...prev,
            city: c ? c.name : '',
            city_code: cCode,
            district: '',
            district_code: '',
            village: '',
            village_code: '',
            postal_code: '',
        }));
        setRegionDistricts([]);
        setRegionVillages([]);

        if (formErrors.city) setFormErrors((prev) => ({ ...prev, city: '' }));

        if (cCode) {
            setLoadingDistricts(true);
            fetch(`/api/indonesia-regions?parent_code=${cCode}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) setRegionDistricts(data);
                })
                .catch((err) => console.error('Gagal memuat kecamatan:', err))
                .finally(() => setLoadingDistricts(false));
        }
    };

    const handleDistrictSelectChange = (dCode: string) => {
        const d = (regionDistricts || []).find((item) => item?.code === dCode);
        setFormData((prev) => ({
            ...prev,
            district: d ? d.name : '',
            district_code: dCode,
            village: '',
            village_code: '',
            postal_code: '',
        }));
        setRegionVillages([]);

        if (dCode) {
            setLoadingVillages(true);
            fetch(`/api/indonesia-regions?parent_code=${dCode}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) setRegionVillages(data);
                })
                .catch((err) => console.error('Gagal memuat kelurahan:', err))
                .finally(() => setLoadingVillages(false));
        }
    };

    const handleVillageSelectChange = (vCode: string) => {
        const v = (regionVillages || []).find((item) => item?.code === vCode);
        setFormData((prev) => ({
            ...prev,
            village: v ? v.name : '',
            village_code: vCode,
            postal_code: v?.postal_code || prev.postal_code,
        }));
    };

    // Memoized options formatted for SelectSearch
    const provinceOptions = useMemo(
        () => regionProvinces.map((p) => ({ value: p.code, label: p.name })),
        [regionProvinces]
    );

    const cityOptions = useMemo(
        () => regionCities.map((c) => ({ value: c.code, label: c.name })),
        [regionCities]
    );

    const districtOptions = useMemo(
        () => regionDistricts.map((d) => ({ value: d.code, label: d.name })),
        [regionDistricts]
    );

    const villageOptions = useMemo(
        () =>
            regionVillages.map((v) => ({
                value: v.code,
                label: v.name,
                subtitle: v.postal_code ? `Kode Pos: ${v.postal_code}` : undefined,
            })),
        [regionVillages]
    );

    // Kategori / Tipe Klien dynamically fetched from Master Data Categories
    const categoryOptions = useMemo(() => {
        const list = (categories || []).map((cat) => {
            const formLabel = cat.form_type === 'wedding' ? '👰🤵 CPP & CPW' : cat.form_type === 'newborn' ? '👶 Nama Anak' : '👤 Standar';
            return {
                value: cat.slug || String(cat.id),
                label: cat.name,
                subtitle: `${cat.description || `Master Kategori: ${cat.name}`} • Input: ${formLabel}`,
            };
        });

        const cur = formData.client_type;
        if (cur && !list.some((o) => o.value === cur)) {
            if (cur === 'personal') {
                const perorangan = list.find((o) => o.value === 'perorangan');
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
    }, [categories, formData.client_type]);

    const activeFormType = useMemo(() => {
        const found = (categories || []).find(
            (c) => c.slug === formData.client_type || String(c.id) === formData.client_type
        );
        if (found?.form_type) return found.form_type;
        if (formData.client_type === 'newborn') return 'newborn';
        if (formData.client_type === 'wedding' || formData.client_type === 'prewedding') return 'wedding';
        return 'standard';
    }, [categories, formData.client_type]);

    const presetTags = [
        'VIP',
        'Wedding 2026',
        'Corporate B2B',
        'Repeat Client',
        'High Budget',
        'Urgent Deadline',
        'Family Session',
        'Need Drone',
    ];

    const toggleTag = (tag: string) => {
        if (formData.tags.includes(tag)) {
            setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
        } else {
            setFormData({ ...formData, tags: [...formData.tags, tag] });
        }
    };

    const addCustomTag = () => {
        const trimmed = customTagInput.trim();
        if (trimmed && !formData.tags.includes(trimmed)) {
            setFormData({ ...formData, tags: [...formData.tags, trimmed] });
            setCustomTagInput('');
        }
    };


    // Filter Trigger
    const applyFilters = (newParams: Record<string, any> = {}) => {
        router.get(
            '/clients',
            {
                search: newParams.search !== undefined ? newParams.search : search || undefined,
                status: (newParams.status !== undefined ? newParams.status : status) !== 'Semua' ? (newParams.status || status) : undefined,
                city: (newParams.city !== undefined ? newParams.city : city) !== 'Semua' ? (newParams.city || city) : undefined,
                source: (newParams.source !== undefined ? newParams.source : source) !== 'Semua' ? (newParams.source || source) : undefined,
                per_page: newParams.per_page !== undefined ? newParams.per_page : perPage,
                page: newParams.page || 1,
            },
            { preserveState: true }
        );
    };

    const handleSearchChange = (val: string) => {
        setSearch(val);
        applyFilters({ search: val, page: 1 });
    };

    const handleStatusChange = (val: string) => {
        setStatus(val);
        applyFilters({ status: val, page: 1 });
    };

    const handleCityChange = (val: string) => {
        setCity(val);
        applyFilters({ city: val, page: 1 });
    };

    const handleSourceChange = (val: string) => {
        setSource(val);
        applyFilters({ source: val, page: 1 });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('Semua');
        setCity('Semua');
        setSource('Semua');
        router.get('/clients', {}, { preserveState: true });
    };

    const handlePageChange = (newPage: number) => {
        applyFilters({ page: newPage });
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        applyFilters({ per_page: newPerPage, page: 1 });
    };

    // Bulk selection helpers
    const toggleSelectAll = () => {
        if (selectedClients.length === clients.data.length) {
            setSelectedClients([]);
        } else {
            setSelectedClients(clients.data.map((c) => c.id as number));
        }
    };

    const toggleSelectClient = (id: number) => {
        if (selectedClients.includes(id)) {
            setSelectedClients(selectedClients.filter((item) => item !== id));
        } else {
            setSelectedClients([...selectedClients, id]);
        }
    };

    const handleAddModalChild = () => {
        setFormData((prev) => {
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

    const handleRemoveModalChild = (index: number) => {
        setFormData((prev) => {
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

    const handleChildModalChange = (index: number, field: string, value: any) => {
        setFormData((prev) => {
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

    const steps = [
        { id: 'profile', stepNum: 1, title: 'Identitas & Profil', subtitle: 'Kategori & Calon Pengantin' },
        { id: 'contact', stepNum: 2, title: 'Kontak & Sosmed', subtitle: 'WhatsApp & Instagram' },
        { id: 'location', stepNum: 3, title: 'Domisili & Wilayah', subtitle: 'Provinsi hingga Kelurahan' },
        { id: 'event', stepNum: 4, title: 'Acara & Paket', subtitle: 'Jadwal & Venue' },
        { id: 'preferences', stepNum: 5, title: 'Sumber & Status', subtitle: 'Lead source & Catatan' },
    ] as const;

    const currentStepIndex = steps.findIndex((s) => s.id === activeFormTab);

    const validateStep = (tabId: string) => {
        const errs: Record<string, string> = {};
        if (tabId === 'profile') {
            if (activeFormType === 'newborn') {
                if (!formData.child_name.trim() && !formData.name.trim()) {
                    errs.child_name = 'Nama lengkap bayi / anak wajib diisi';
                    toast.error('Nama lengkap bayi / anak wajib diisi');
                }
            } else if (activeFormType === 'wedding') {
                const hasWeddingName = formData.name.trim() || formData.bride_name.trim() || formData.groom_name.trim();
                if (!hasWeddingName) {
                    errs.name = 'Nama calon pengantin wajib diisi';
                    toast.error('Nama calon pengantin (CPP & CPW) wajib diisi');
                }
            } else {
                if (!formData.name.trim()) {
                    errs.name = 'Nama lengkap klien / pemesan wajib diisi';
                    toast.error('Nama lengkap klien / pemesan wajib diisi');
                }
            }
        }
        if (tabId === 'contact') {
            if (!formData.phone.trim()) {
                errs.phone = 'Nomor WhatsApp / telepon wajib diisi';
                toast.error('Nomor WhatsApp wajib diisi');
            }
        }
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const goToStep = (targetStepId: 'profile' | 'contact' | 'location' | 'event' | 'preferences') => {
        const targetIdx = steps.findIndex((s) => s.id === targetStepId);
        if (targetIdx > currentStepIndex) {
            if (!validateStep(activeFormTab)) return;
        }
        setFormErrors({});
        setActiveFormTab(targetStepId);
    };

    const handleNextStep = () => {
        if (!validateStep(activeFormTab)) return;
        if (currentStepIndex < steps.length - 1) {
            setFormErrors({});
            setActiveFormTab(steps[currentStepIndex + 1].id);
        }
    };

    const handlePrevStep = () => {
        setFormErrors({});
        if (currentStepIndex > 0) {
            setActiveFormTab(steps[currentStepIndex - 1].id);
        }
    };
    // Create Client Action
    const handleCreateClient = (e: React.FormEvent) => {
        e.preventDefault();

        let clientName = formData.name.trim();
        if (!clientName) {
            if (activeFormType === 'newborn') {
                clientName = formData.child_name.trim() ? `Baby ${formData.child_name.trim()}` : (formData.partner_name.trim() || 'Client Newborn');
            } else {
                const bride = formData.bride_name.trim();
                const groom = formData.groom_name.trim();
                if (bride && groom) {
                    clientName = `${groom} & ${bride}`;
                } else if (groom) {
                    clientName = groom;
                } else if (bride) {
                    clientName = bride;
                } else if (formData.contact_person.trim()) {
                    clientName = formData.contact_person.trim();
                }
            }
        }

        const phone = formData.phone.trim() || formData.contact_person.trim() || '081234567890';

        const payload = {
            ...formData,
            name: clientName || 'Klien Baru',
            phone: phone,
        };

        setIsSubmitting(true);
        setFormErrors({});

        const savedClientName = payload.name;

        router.post('/clients', payload, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setCreateModalOpen(false);
                setIsSubmitting(false);
                setFormData(initialFormData);
                toast.success('Berhasil Menambahkan Klien', {
                    description: `Data klien "${savedClientName}" berhasil disimpan ke sistem.`,
                });
            },
            onError: (err) => {
                setIsSubmitting(false);
                setFormErrors(err);
                toast.error('Gagal Menyimpan Data Klien', {
                    description: 'Silakan periksa kembali isian formulir Anda.',
                });
            },
        });
    };

    // Delete Client Action
    const handleDeleteConfirmed = () => {
        if (confirmDelete.clientId) {
            const deletedName = confirmDelete.clientName || 'Klien';
            router.delete(`/clients/${confirmDelete.clientId}`, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setConfirmDelete({ isOpen: false });
                    toast.success('Klien Berhasil Dihapus', {
                        description: `Data ${deletedName} berhasil dihapus dari sistem.`,
                    });
                },
                onError: () => {
                    toast.error('Gagal Menghapus Klien', {
                        description: 'Terjadi kesalahan saat menghapus data klien.',
                    });
                },
            });
        }
    };

    // Export Action
    const handleExportCSV = () => {
        window.open('/settings/export/clients', '_blank');
    };

    return (
        <>
            <Head title="Clients | Arams Photography" />

            <div className="space-y-6 w-full max-w-full pb-10">
                {/* Header Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                            Clients
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm mt-1">
                            Kelola semua data klien dan informasi kontak.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
                        {/* Copy Link Form Klien Button */}
                        <button
                            type="button"
                            onClick={handleCopyFormLink}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
                        >
                            {copied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span>{copied ? 'Link Disalin!' : 'Salin Link Form'}</span>
                        </button>

                        <a
                            href="/form-klien"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold shadow-2xs transition-all hover:scale-[1.02] cursor-pointer"
                        >
                            <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                            <span>Buka Form Klien</span>
                        </a>

                        <button
                            type="button"
                            onClick={() => setCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C89445] hover:bg-[#b38136] text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                        >
                            <Plus className="w-4 h-4 text-white" />
                            <span>Tambah Client</span>
                        </button>
                    </div>
                </div>

                {/* 4 Top Summary Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {/* 1. TOTAL CLIENTS */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                        TOTAL CLIENTS
                                    </span>
                                    <span className="text-3xl font-extrabold text-slate-900 font-mono block mt-1.5">
                                        {stats.total_clients || clients.total || 48}
                                    </span>
                                    <span className="text-xs text-slate-400 block mt-1">
                                        Semua Klien Terdaftar
                                    </span>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                    <Users className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => handleStatusChange('Semua')}
                                className="text-xs font-semibold text-slate-700 hover:text-amber-600 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <span>Lihat Detail</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* 2. CLIENT AKTIF */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                        CLIENT AKTIF
                                    </span>
                                    <span className="text-3xl font-extrabold text-slate-900 font-mono block mt-1.5">
                                        {stats.active_clients || 35}
                                    </span>
                                    <span className="text-xs text-slate-400 block mt-1">
                                        Klien dengan Project Aktif
                                    </span>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                    <UserCheck className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => handleStatusChange('active')}
                                className="text-xs font-semibold text-slate-700 hover:text-emerald-600 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <span>Lihat Detail</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* 3. CLIENT BARU BULAN INI */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                        CLIENT BARU BULAN INI
                                    </span>
                                    <span className="text-3xl font-extrabold text-slate-900 font-mono block mt-1.5">
                                        {stats.new_this_month || 6}
                                    </span>
                                    <span className="text-xs text-slate-400 block mt-1">
                                        Bergabung bulan ini
                                    </span>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => handleStatusChange('Semua')}
                                className="text-xs font-semibold text-slate-700 hover:text-purple-600 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <span>Lihat Detail</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* 4. TOTAL PROJECT */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                        TOTAL PROJECT
                                    </span>
                                    <span className="text-3xl font-extrabold text-slate-900 font-mono block mt-1.5">
                                        {stats.total_projects || 39}
                                    </span>
                                    <span className="text-xs text-slate-400 block mt-1">
                                        Dari Semua Klien
                                    </span>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                    <Folder className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100">
                            <Link
                                href="/projects"
                                className="text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <span>Lihat Detail</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Content: Daftar Clients */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    {/* Status Tabs Bar */}
                    <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'Semua', label: 'Semua Klien', count: stats.total_clients || clients.total },
                            { id: 'lead', label: 'Booking Online (Lead)', badge: 'Baru' },
                            { id: 'active', label: 'Klien Aktif', count: stats.active_clients },
                            { id: 'completed', label: 'Project Selesai' },
                            { id: 'blocked', label: 'Diblokir', count: stats.blocked_clients },
                        ].map((tab) => {
                            const isTabActive = status === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleStatusChange(tab.id)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${isTabActive
                                        ? 'bg-[#380E13] text-white border-[#380E13] shadow-xs'
                                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/60'
                                        }`}
                                >
                                    <span>{tab.label}</span>
                                    {tab.badge && (
                                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${isTabActive ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'}`}>
                                            {tab.badge}
                                        </span>
                                    )}
                                    {tab.count !== undefined && (
                                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${isTabActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'}`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Card Header with Search, Filter & Export */}
                    <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Daftar Clients</h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Menampilkan semua klien beserta informasi kontak dan status.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
                            {/* Search Input */}
                            <div className="relative min-w-[240px] sm:min-w-[280px]">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    placeholder="Cari nama, email, atau telepon..."
                                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2 pr-9 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                />
                                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>

                            {/* Filter Button */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer ${status !== 'Semua' || city !== 'Semua' || source !== 'Semua'
                                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Filter</span>
                                </button>

                                {showFilterDropdown && (
                                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-40 animate-in fade-in zoom-in-95 space-y-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                                Status Klien
                                            </label>
                                            <select
                                                value={status}
                                                onChange={(e) => handleStatusChange(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none"
                                            >
                                                <option value="Semua">Semua Status</option>
                                                <option value="active">Aktif</option>
                                                <option value="completed">Selesai</option>
                                                <option value="lead">Lead / Prospek</option>
                                                <option value="blocked">Diblokir</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                                Kota
                                            </label>
                                            <select
                                                value={city}
                                                onChange={(e) => handleCityChange(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none"
                                            >
                                                <option value="Semua">Semua Kota</option>
                                                {cities.map((c) => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                                Sumber Klien
                                            </label>
                                            <select
                                                value={source}
                                                onChange={(e) => handleSourceChange(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none"
                                            >
                                                <option value="Semua">Semua Sumber</option>
                                                {sources.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleReset();
                                                setShowFilterDropdown(false);
                                            }}
                                            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                                        >
                                            Reset Filter
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Export Button */}
                            <button
                                type="button"
                                onClick={handleExportCSV}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5 text-slate-500" />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>

                    {/* 1. DESKTOP VIEW: Full Column Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-slate-100 bg-white">
                                    <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">CLIENT</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">KONTAK</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">TOTAL PROJECT</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">TOTAL PEMBAYARAN</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">STATUS</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3.5">TERDAFTAR</TableHead>
                                    <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center py-3.5">AKSI</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clients.data.length > 0 ? (
                                    clients.data.map((c) => {
                                        const totalVal = c.total_value || 50000000;
                                        const paidVal = c.total_paid || 40000000;
                                        const isPaidOff = (c.total_paid || 0) >= (c.total_value || 0) && (c.total_value || 0) > 0;

                                        return (
                                            <TableRow
                                                key={c.id}
                                                className={`transition-colors hover:bg-slate-50/60 border-b border-slate-100/80 ${c.status === 'blocked' ? 'bg-rose-50/20' : ''}`}
                                            >
                                                {/* Client Avatar / Initials + Name + Type Badge */}
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        {c.avatar ? (
                                                            <img
                                                                src={c.avatar}
                                                                alt={c.name}
                                                                className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                                                            />
                                                        ) : (
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getInitialsBg(c.name)}`}>
                                                                {getInitials(c.name)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <Link
                                                                href={`/clients/${c.id}`}
                                                                className="font-bold text-slate-900 hover:text-[#C89445] transition-colors block text-xs"
                                                            >
                                                                {c.name}
                                                            </Link>
                                                            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100/80 mt-0.5 inline-block">
                                                                {getClientTypeLabel(c)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Kontak: Phone & Email */}
                                                <TableCell className="py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                                                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                                            <span className="font-mono">{c.phone || '-'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                                            <span className="truncate max-w-[190px]">{c.email || '-'}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Total Project */}
                                                <TableCell className="py-4">
                                                    <div>
                                                        <span className="font-bold text-xs text-slate-900 block font-mono">
                                                            {c.projects_count ?? 1}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 block">
                                                            Project
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Total Pembayaran & Lunas Status */}
                                                <TableCell className="py-4">
                                                    <div>
                                                        <span className="font-bold text-xs text-slate-900 block font-mono">
                                                            {formatRupiah(totalVal)}
                                                        </span>
                                                        <span className={`text-[11px] font-semibold block mt-0.5 ${isPaidOff || paidVal >= totalVal
                                                            ? 'text-emerald-600'
                                                            : 'text-amber-600'
                                                            }`}>
                                                            {isPaidOff || paidVal >= totalVal ? 'Lunas' : 'Belum Lunas'}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Status Klien Badge */}
                                                <TableCell className="py-4">
                                                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border inline-block ${c.status === 'blocked'
                                                        ? 'text-rose-700 bg-rose-50 border-rose-200'
                                                        : c.status === 'completed'
                                                            ? 'text-blue-700 bg-blue-50 border-blue-200'
                                                            : c.status === 'lead'
                                                                ? 'text-amber-700 bg-amber-50 border-amber-200'
                                                                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                                        }`}>
                                                        {c.status === 'blocked' ? 'Diblokir' : c.status === 'completed' ? 'Selesai' : c.status === 'lead' ? 'Lead' : 'Aktif'}
                                                    </span>
                                                </TableCell>

                                                {/* Terdaftar & Relative Time */}
                                                <TableCell className="py-4">
                                                    <div>
                                                        <span className="text-xs font-medium text-slate-800 block">
                                                            {formatDateIndonesian(c.created_at)}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400 block mt-0.5">
                                                            {getTimeAgoIndonesian(c.created_at)}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Aksi: Mata (Lihat Detail), Switch Toggle (Blokir / Buka Blokir), Hapus (Trash) */}
                                                <TableCell className="text-center py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {/* 1. Mata (Lihat Detail) */}
                                                        <Link
                                                            href={`/clients/${c.id}`}
                                                            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-2xs cursor-pointer"
                                                            title="Lihat Detail"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>

                                                        {/* 2. Switch Toggle (Blokir / Buka Blokir) */}
                                                        <button
                                                            type="button"
                                                            role="switch"
                                                            aria-checked={c.status !== 'blocked'}
                                                            onClick={() => setConfirmToggleBlock({ isOpen: true, client: c })}
                                                            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 shrink-0 ${c.status === 'blocked'
                                                                    ? 'bg-rose-100 hover:bg-rose-200 border border-rose-200 focus-visible:ring-rose-400'
                                                                    : 'bg-emerald-500 hover:bg-emerald-600 border border-emerald-600 focus-visible:ring-emerald-500'
                                                                }`}
                                                            title={c.status === 'blocked' ? 'Status: Diblokir (Klik untuk Buka Blokir)' : 'Status: Aktif (Klik untuk Blokir)'}
                                                        >
                                                            <span
                                                                className={`w-4.5 h-4.5 rounded-full bg-white absolute top-0.5 transition-all shadow-xs flex items-center justify-center ${c.status === 'blocked' ? 'left-0.5' : 'left-5.5'
                                                                    }`}
                                                            >
                                                                {c.status === 'blocked' ? (
                                                                    <Ban className="w-2.5 h-2.5 text-rose-600" />
                                                                ) : (
                                                                    <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />
                                                                )}
                                                            </span>
                                                        </button>

                                                        {/* 3. Tombol Icon Hapus (Trash) */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setConfirmDelete({
                                                                    isOpen: true,
                                                                    clientId: c.id,
                                                                    clientName: c.name,
                                                                });
                                                            }}
                                                            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-rose-500 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 transition-colors shadow-2xs cursor-pointer"
                                                            title="Hapus Klien"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableEmpty
                                        colSpan={7}
                                        message="Tidak ada klien yang ditemukan"
                                        description="Coba ubah kata kunci pencarian atau reset filter untuk menampilkan semua data."
                                    />
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* 2. MOBILE VIEW: Vertical Stacked Cards */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {clients.data.length > 0 ? (
                            clients.data.map((c) => {
                                const totalVal = c.total_value || 50000000;

                                return (
                                    <div
                                        key={c.id}
                                        className="p-4 transition-colors space-y-3 bg-white"
                                    >
                                        {/* Top Row: Avatar + Name + Type Badge + Dropdown */}
                                        <div className="flex items-start justify-between gap-2.5">
                                            <div className="flex items-center gap-3">
                                                {c.avatar ? (
                                                    <img
                                                        src={c.avatar}
                                                        alt={c.name}
                                                        className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 shrink-0 shadow-2xs"
                                                    />
                                                ) : (
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getInitialsBg(c.name)}`}>
                                                        {getInitials(c.name)}
                                                    </div>
                                                )}
                                                <div>
                                                    <Link
                                                        href={`/clients/${c.id}`}
                                                        className="font-bold text-slate-900 text-sm hover:text-[#C89445] transition-colors line-clamp-1"
                                                    >
                                                        {c.name}
                                                    </Link>
                                                    <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100/80 mt-0.5 inline-block">
                                                        {getClientTypeLabel(c)}
                                                    </span>
                                                </div>
                                            </div>

                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${c.status === 'blocked'
                                                ? 'text-rose-700 bg-rose-50 border-rose-200'
                                                : c.status === 'completed'
                                                    ? 'text-blue-700 bg-blue-50 border-blue-200'
                                                    : c.status === 'lead'
                                                        ? 'text-amber-700 bg-amber-50 border-amber-200'
                                                        : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                                }`}>
                                                {c.status === 'blocked' ? 'Diblokir' : c.status === 'completed' ? 'Selesai' : c.status === 'lead' ? 'Lead' : 'Aktif'}
                                            </span>
                                        </div>

                                        {/* Middle Section: Kontak & Pembayaran */}
                                        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                    Kontak Telepon
                                                </span>
                                                <span className="font-semibold text-slate-800 font-mono block mt-0.5 truncate">
                                                    {c.phone || '-'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                    Total Pembayaran
                                                </span>
                                                <span className="font-bold text-slate-900 font-mono block mt-0.5 truncate">
                                                    {formatRupiah(totalVal)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Button Links */}
                                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                            <Link
                                                href={`/clients/${c.id}`}
                                                className="flex-1 py-2 text-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-blue-600" />
                                                <span>Lihat Detail</span>
                                            </Link>

                                            {/* Toggle Switch Blokir / Buka Blokir */}
                                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70">
                                                <span className="text-[10px] font-bold text-slate-500">
                                                    {c.status === 'blocked' ? 'Diblokir' : 'Aktif'}
                                                </span>
                                                <button
                                                    type="button"
                                                    role="switch"
                                                    aria-checked={c.status !== 'blocked'}
                                                    onClick={() => setConfirmToggleBlock({ isOpen: true, client: c })}
                                                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${c.status === 'blocked'
                                                            ? 'bg-rose-100 border border-rose-200'
                                                            : 'bg-emerald-500 border border-emerald-600'
                                                        }`}
                                                    title={c.status === 'blocked' ? 'Buka Blokir' : 'Blokir'}
                                                >
                                                    <span
                                                        className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all shadow-xs flex items-center justify-center ${c.status === 'blocked' ? 'left-0.5' : 'left-4.5'
                                                            }`}
                                                    >
                                                        {c.status === 'blocked' ? (
                                                            <Ban className="w-2 h-2 text-rose-600" />
                                                        ) : (
                                                            <Check className="w-2 h-2 text-emerald-600 stroke-[3]" />
                                                        )}
                                                    </span>
                                                </button>
                                            </div>

                                            {/* Tombol Hapus */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setConfirmDelete({
                                                        isOpen: true,
                                                        clientId: c.id,
                                                        clientName: c.name,
                                                    });
                                                }}
                                                className="p-2 rounded-xl border border-slate-200 hover:border-rose-200 text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                                title="Hapus Klien"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-xs">
                                Tidak ada klien yang ditemukan.
                            </div>
                        )}
                    </div>

                    {/* Bottom Pagination Bar */}
                    <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                        <div>
                            Menampilkan {clients.from || 1} - {clients.to || clients.data.length} dari {clients.total || clients.data.length} clients
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Per Page Dropdown */}
                            <div className="relative">
                                <select
                                    value={perPage}
                                    onChange={(e) => handlePerPageChange(Number(e.target.value))}
                                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                                >
                                    <option value={10}>10 per halaman</option>
                                    <option value={25}>25 per halaman</option>
                                    <option value={50}>50 per halaman</option>
                                    <option value={100}>100 per halaman</option>
                                </select>
                            </div>

                            {/* Pagination Buttons */}
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    disabled={!clients.prev_page_url}
                                    onClick={() => clients.prev_page_url && handlePageChange((clients.current_page || 1) - 1)}
                                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {/* Page numbers */}
                                {Array.from({ length: Math.min(clients.last_page || 1, 5) }, (_, i) => i + 1).map((pg) => (
                                    <button
                                        key={pg}
                                        type="button"
                                        onClick={() => handlePageChange(pg)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center ${(clients.current_page || 1) === pg
                                            ? 'bg-slate-900 text-white'
                                            : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                                            }`}
                                    >
                                        {pg}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    disabled={!clients.next_page_url}
                                    onClick={() => clients.next_page_url && handlePageChange((clients.current_page || 1) + 1)}
                                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* MODAL 1: TAMBAH CLIENT (Stepped / Tabbed Modal with all fields) */}
                {/* ========================================================================= */}
                <Modal
                    isOpen={createModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    title="Tambah Client Baru"
                    subtitle="Lengkapi data profil, kontak, domisili, acara, dan preferensi klien."
                    maxWidth="3xl"
                    className="max-h-[90vh]"
                    footer={
                        <div className="flex items-center justify-between w-full gap-3">
                            <button
                                type="button"
                                onClick={() => setCreateModalOpen(false)}
                                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                            >
                                Batal
                            </button>

                            <div className="flex items-center gap-2">
                                {currentStepIndex > 0 && (
                                    <button
                                        type="button"
                                        onClick={handlePrevStep}
                                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span>Sebelumnya</span>
                                    </button>
                                )}

                                {currentStepIndex < steps.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <span>Lanjut: {steps[currentStepIndex + 1].title}</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleCreateClient}
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 rounded-xl bg-[#C89445] hover:bg-[#b38136] text-white font-bold text-xs transition-all shadow-xs hover:scale-[1.02] cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isSubmitting ? 'Menyimpan...' : 'Simpan Client'}
                                    </button>
                                )}
                            </div>
                        </div>
                    }
                >
                    <div className="space-y-5 pt-1">
                        {/* STEPPER HEADER (5 Horizontal Clickable Steps) */}
                        <div className="flex items-center justify-between gap-1 sm:gap-2 p-1.5 bg-slate-100/90 rounded-2xl overflow-x-auto scrollbar-none">
                            {steps.map((s, idx) => {
                                const isActive = activeFormTab === s.id;
                                const isPassed = currentStepIndex > idx;
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => goToStep(s.id as any)}
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
                        {activeFormTab === 'profile' && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                {/* Kategori / Tipe Klien Selection (SelectSearch dari Master Data Categories) */}
                                <div>
                                    <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                                        Kategori / Tipe Klien <span className="text-red-500">*</span>
                                    </label>
                                    <SelectSearch
                                        options={categoryOptions}
                                        value={formData.client_type}
                                        onChange={(val) => setFormData({ ...formData, client_type: val })}
                                        placeholder="Pilih Kategori / Tipe Klien..."
                                        searchPlaceholder="Cari kategori dari Master Data..."
                                        clearable={false}
                                        className="w-full text-xs bg-white"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Kategori diambil langsung dari Master Data Kategori (<Link href="/master-data/categories" className="text-amber-700 hover:underline font-medium">/master-data/categories</Link>).
                                    </p>
                                </div>

                                {/* WEDDING FORM FIELDS */}
                                {activeFormType === 'wedding' && (
                                    <>
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                Judul Acara / Nama Project Wedding <span className="text-slate-400 font-normal">(Opsional / Otomatis dari nama CPP &amp; CPW)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                                        Informasi Calon Pengantin (CPW) <span className="text-red-500">*</span>
                                                    </h4>
                                                </div>

                                                <div className="space-y-2.5">
                                                    <div>
                                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                            Nama Lengkap CPW
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.bride_name}
                                                            onChange={(e) => setFormData({ ...formData, bride_name: e.target.value })}
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
                                                                value={formData.bride_nickname}
                                                                onChange={(e) => setFormData({ ...formData, bride_nickname: e.target.value })}
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
                                                                value={formData.bride_birth_date}
                                                                onChange={(e) => setFormData({ ...formData, bride_birth_date: e.target.value })}
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
                                                        Informasi Calon Pengantin (CPP) <span className="text-red-500">*</span>
                                                    </h4>
                                                </div>

                                                <div className="space-y-2.5">
                                                    <div>
                                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                            Nama Lengkap CPP
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.groom_name}
                                                            onChange={(e) => setFormData({ ...formData, groom_name: e.target.value })}
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
                                                                value={formData.groom_nickname}
                                                                onChange={(e) => setFormData({ ...formData, groom_nickname: e.target.value })}
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
                                                                value={formData.groom_birth_date}
                                                                onChange={(e) => setFormData({ ...formData, groom_birth_date: e.target.value })}
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
                                                    value={formData.partner_name}
                                                    onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
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
                                                    value={formData.company_name}
                                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                                    placeholder="Contoh: PT Astra International"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* NEWBORN FORM FIELDS */}
                                {activeFormType === 'newborn' && (
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
                                                    onClick={handleAddModalChild}
                                                    className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                    <span>+ Tambah Bayi (Kembar)</span>
                                                </button>
                                            </div>

                                            {(formData.children || []).map((child, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-3"
                                                >
                                                    <div className="flex items-center justify-between pb-1 border-b border-amber-200/50">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-bold text-[10px]">
                                                                👶 Bayi #{idx + 1} {(formData.children || []).length > 1 ? '(Kembar)' : ''}
                                                            </span>
                                                        </div>
                                                        {(formData.children || []).length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveModalChild(idx)}
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
                                                                onChange={(e) => handleChildModalChange(idx, 'name', e.target.value)}
                                                                placeholder={idx === 0 ? "Contoh: Muhammad Al-Fatih" : "Contoh: Muhammad Al-Haq"}
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
                                                                onChange={(e) => handleChildModalChange(idx, 'birth_date', e.target.value)}
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
                                                                onClick={() => handleChildModalChange(idx, 'gender', 'male')}
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
                                                                onClick={() => handleChildModalChange(idx, 'gender', 'female')}
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
                                                onClick={handleAddModalChild}
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
                                                        value={formData.father_name}
                                                        onChange={(e) => {
                                                            const f = e.target.value;
                                                            const m = formData.mother_name;
                                                            const combined = [f, m].filter(Boolean).join(' & ');
                                                            setFormData({ ...formData, father_name: f, partner_name: combined, name: formData.child_name ? `Baby ${formData.child_name}` : combined });
                                                        }}
                                                        placeholder="Contoh: Dimas Pratama"
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                        Nama Lengkap Ibu
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.mother_name}
                                                        onChange={(e) => {
                                                            const m = e.target.value;
                                                            const f = formData.father_name;
                                                            const combined = [f, m].filter(Boolean).join(' & ');
                                                            setFormData({ ...formData, mother_name: m, partner_name: combined, name: formData.child_name ? `Baby ${formData.child_name}` : combined });
                                                        }}
                                                        placeholder="Contoh: Amanda Lestari"
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
                                                    value={formData.occupation}
                                                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                                                    placeholder="Contoh: Dokter & Dosen"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STANDARD / UMUM FORM FIELDS */}
                                {activeFormType === 'standard' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                Nama Lengkap Klien / Pemesan <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Contoh: Bpk. Aditya Pratama"
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
                                                    value={formData.contact_person}
                                                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                                    placeholder="Contoh: Adit"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                    Pekerjaan / Profesi
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.occupation}
                                                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                                                    placeholder="Profesi / Pekerjaan"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                Perusahaan / Brand / Institusi (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.company_name}
                                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                                placeholder="Contoh: PT Surya Dinamika"
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
                        {activeFormTab === 'contact' && (
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
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                                            value={formData.secondary_phone}
                                            onChange={(e) => setFormData({ ...formData, secondary_phone: e.target.value })}
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
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                                                value={formData.instagram}
                                                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
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
                                            value={formData.preferred_contact}
                                            onChange={(e) => setFormData({ ...formData, preferred_contact: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all cursor-pointer"
                                        >
                                            <option value="whatsapp">WhatsApp (Rekomendasi Utama)</option>
                                            <option value="email">Email Resmi</option>
                                            <option value="phone">Panggilan Telepon Langsung</option>
                                        </select>
                                    </div>

                                    {/* 6. Contact Person / PIC */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                            Nama Contact Person (PIC)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.contact_person}
                                            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
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
                                            value={formData.occupation}
                                            onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
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
                                            value={formData.other_social_media}
                                            onChange={(e) => setFormData({ ...formData, other_social_media: e.target.value })}
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
                        {activeFormTab === 'location' && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* 1. Pilih Provinsi */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">1</span>
                                            <span>Pilih Provinsi</span>
                                        </label>
                                        <select
                                            value={formData.province_code}
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
                                            value={formData.city_code}
                                            onChange={(e) => handleCitySelectChange(e.target.value)}
                                            disabled={!formData.province_code || loadingCities}
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
                                            value={formData.district_code}
                                            onChange={(e) => handleDistrictSelectChange(e.target.value)}
                                            disabled={!formData.city_code || loadingDistricts}
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
                                            value={formData.village_code}
                                            onChange={(e) => handleVillageSelectChange(e.target.value)}
                                            disabled={!formData.district_code || loadingVillages}
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
                                            value={formData.postal_code}
                                            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
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
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                        {activeFormTab === 'event' && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Jenis Acara */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">9</span>
                                            <span>Jenis Acara / Project</span>
                                        </label>
                                        <select
                                            value={formData.event_type}
                                            onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
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
                                            value={formData.event_date}
                                            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
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
                                            value={formData.event_time}
                                            onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
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
                                                value={formData.event_location}
                                                onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
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
                                            value={formData.package_id}
                                            onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
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
                        {activeFormTab === 'preferences' && (
                            <div className="space-y-4 animate-in fade-in duration-150">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Sumber Klien */}
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                                            <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">14</span>
                                            <span>Sumber Klien (Lead Source) <span className="text-red-500">*</span></span>
                                        </label>
                                        <select
                                            value={formData.source}
                                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
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
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all cursor-pointer"
                                        >
                                            <option value="active">Aktif (Sedang Berjalan)</option>
                                            <option value="lead">Lead / Calon Klien (Follow-up)</option>
                                            <option value="completed">Selesai (Arsip)</option>
                                            <option value="blocked">Diblokir (Nonaktif)</option>
                                        </select>
                                    </div>

                                    {/* Conditional Wedding Organizer Referral */}
                                    {formData.source === 'Wedding Organizer' && (
                                        <div className="sm:col-span-2">
                                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                Pilih Wedding Organizer (Partner)
                                            </label>
                                            <select
                                                value={formData.wedding_organizer_id}
                                                onChange={(e) => setFormData({ ...formData, wedding_organizer_id: e.target.value })}
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
                                    {formData.source === 'Rekomendasi Teman' && (
                                        <div className="sm:col-span-2">
                                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                                Direferensikan oleh Klien
                                            </label>
                                            <select
                                                value={formData.referred_by_client_id}
                                                onChange={(e) => setFormData({ ...formData, referred_by_client_id: e.target.value })}
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
                                                const isSelected = formData.tags.includes(tag);
                                                return (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() => toggleTag(tag)}
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
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                {/* MODAL 2: DETAIL RINGKASAN KLIEN (Quick View) */}
                {/* ========================================================================= */}
                {detailModalClient && (
                    <Modal
                        isOpen={!!detailModalClient}
                        onClose={() => setDetailModalClient(null)}
                        title={`Profil: ${detailModalClient.name}`}
                        subtitle={`ID Klien: #${detailModalClient.id} • ${[detailModalClient.district, detailModalClient.city, detailModalClient.province].filter(Boolean).join(', ') || detailModalClient.city}`}
                        maxWidth="2xl"
                        icon={
                            <img
                                src={
                                    detailModalClient.avatar ||
                                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                                }
                                alt=""
                                className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                            />
                        }
                        footer={
                            <Link
                                href={`/clients/${detailModalClient.id}`}
                                className="px-5 py-2 rounded-xl bg-[#0B1527] hover:bg-[#152238] text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>Buka Halaman Detail Penuh</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        }
                    >
                        <div className="space-y-4 text-xs">
                            {(detailModalClient.child_name || (detailModalClient.children && detailModalClient.children.length > 0)) && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Baby className="w-4 h-4 text-amber-600" />
                                            <span className="font-bold text-amber-900">
                                                Data Bayi: {detailModalClient.child_name || 'Newborn'}
                                            </span>
                                        </div>
                                        {detailModalClient.children && detailModalClient.children.length > 1 && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
                                                Kembar ({detailModalClient.children.length} Bayi)
                                            </span>
                                        )}
                                    </div>

                                    {detailModalClient.children && detailModalClient.children.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                            {detailModalClient.children.map((ch, idx) => (
                                                <div key={idx} className="p-2 bg-white rounded-lg border border-amber-200/80 text-[11px] space-y-0.5">
                                                    <div className="font-bold text-amber-900 flex justify-between">
                                                        <span>Bayi #{idx + 1}</span>
                                                        <span className="text-amber-700 font-semibold">{ch.gender || '-'}</span>
                                                    </div>
                                                    <div className="text-slate-800 font-medium">{ch.name || '-'}</div>
                                                    {ch.birth_date && <div className="text-slate-500 text-[10px]">Lahir: {ch.birth_date}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        detailModalClient.child_gender && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-800 inline-block">
                                                {detailModalClient.child_gender === 'male' ? 'Laki-laki (Boy)' : 'Perempuan (Girl)'}
                                            </span>
                                        )
                                    )}

                                    {(detailModalClient.father_name || detailModalClient.mother_name) && (
                                        <div className="text-[11px] text-slate-700 pt-1 border-t border-amber-200/60 flex flex-wrap gap-x-4">
                                            {detailModalClient.father_name && <span><strong>Ayah:</strong> {detailModalClient.father_name}</span>}
                                            {detailModalClient.mother_name && <span><strong>Ibu:</strong> {detailModalClient.mother_name}</span>}
                                        </div>
                                    )}
                                </div>
                            )}

                            {detailModalClient.bride_name && detailModalClient.groom_name && (
                                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2 text-xs text-purple-900 font-bold">
                                    <Heart className="w-4 h-4 text-purple-600" />
                                    <span>Pasangan Wedding: {detailModalClient.groom_name} &amp; {detailModalClient.bride_name}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Email
                                    </span>
                                    <span className="font-semibold text-slate-900 block mt-0.5 truncate">
                                        {detailModalClient.email || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        No. WhatsApp
                                    </span>
                                    <span className="font-semibold text-slate-900 font-mono block mt-0.5">
                                        {detailModalClient.phone || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Instagram
                                    </span>
                                    <span className="font-semibold text-slate-900 block mt-0.5 truncate">
                                        {detailModalClient.instagram || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Wilayah Domisili
                                    </span>
                                    <span className="font-semibold text-slate-900 block mt-0.5 truncate">
                                        {[detailModalClient.district, detailModalClient.city, detailModalClient.province].filter(Boolean).join(', ') || detailModalClient.city || '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Sumber Lead
                                    </span>
                                    <span className="font-semibold text-slate-900 block mt-0.5">
                                        {detailModalClient.source || '-'}
                                    </span>
                                    {(detailModalClient.wedding_organizer?.name || detailModalClient.referral_name) && (
                                        <span className="text-[10.5px] font-bold text-[#E8630A] block mt-0.5 truncate">
                                            Ref: {detailModalClient.wedding_organizer?.name || detailModalClient.referral_name}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Status
                                    </span>
                                    <span className="font-semibold text-emerald-700 block mt-0.5 capitalize">
                                        {detailModalClient.status}
                                    </span>
                                </div>
                            </div>

                            {detailModalClient.tags && detailModalClient.tags.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {detailModalClient.tags.map((t, idx) => (
                                        <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                                            #{t}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Alamat Domisili
                                </span>
                                <p className="text-slate-700 leading-relaxed">
                                    {detailModalClient.address || 'Belum ada catatan alamat lengkap.'}
                                </p>
                            </div>
                        </div>
                    </Modal>
                )}

                {/* ========================================================================= */}
                {/* MODAL 3: KONFIRMASI HAPUS (AlertConfirmation Component) */}
                {/* ========================================================================= */}
                <AlertConfirmation
                    isOpen={confirmDelete.isOpen}
                    onClose={() => setConfirmDelete({ isOpen: false })}
                    onConfirm={handleDeleteConfirmed}
                    title="Hapus Data Klien?"
                    description={
                        <span>
                            Apakah Anda yakin ingin menghapus data klien{' '}
                            <strong className="text-slate-900">{confirmDelete.clientName}</strong>? Tindakan
                            ini akan memindahkan data ke riwayat arsip.
                        </span>
                    }
                    confirmText="Ya, Hapus Klien"
                    cancelText="Batal"
                    variant="danger"
                />

                {/* ========================================================================= */}
                {/* MODAL 4: KONFIRMASI BLOKIR / BUKA BLOKIR (AlertConfirmation Component) */}
                {/* ========================================================================= */}
                <AlertConfirmation
                    isOpen={confirmToggleBlock.isOpen}
                    onClose={() => setConfirmToggleBlock({ isOpen: false, client: null, isProcessing: false })}
                    onConfirm={handleExecuteToggleBlock}
                    isLoading={confirmToggleBlock.isProcessing}
                    title={confirmToggleBlock.client?.status === 'blocked' ? 'Buka Blokir Klien?' : 'Blokir Klien Ini?'}
                    description={
                        <span>
                            {confirmToggleBlock.client?.status === 'blocked' ? (
                                <>
                                    Apakah Anda yakin ingin membuka blokir klien{' '}
                                    <strong className="text-slate-900">{confirmToggleBlock.client?.name}</strong>?
                                    Status klien akan kembali aktif dan akses login portal akan dipulihkan.
                                </>
                            ) : (
                                <>
                                    Apakah Anda yakin ingin memblokir klien{' '}
                                    <strong className="text-slate-900">{confirmToggleBlock.client?.name}</strong>?
                                    Klien yang diblokir tidak akan dapat login ke portal klien dan aktivitas project akan dibatasi.
                                </>
                            )}
                        </span>
                    }
                    confirmText={confirmToggleBlock.client?.status === 'blocked' ? 'Ya, Buka Blokir' : 'Ya, Blokir Klien'}
                    cancelText="Batal"
                    variant={confirmToggleBlock.client?.status === 'blocked' ? 'success' : 'danger'}
                />
            </div>
        </>
    );
}
