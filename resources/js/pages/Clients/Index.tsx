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
    Edit2,
    Bookmark,
    Info,
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
import { CategorySpecificForm } from '@/components/projects/CategorySpecificForm';
import { CategorySpecificView } from '@/components/projects/CategorySpecificView';
import {
    CategoryFormKey,
    resolveCategoryKey,
    AnyCategorySpecificData,
} from '@/types/category-forms';

interface SelectSearchOption {
    value: string;
    label: string;
    subtitle?: string;
}

interface ClientItem {
    id: string | number;
    name: string;
    projects?: any[];
    category?: any;
    category_data?: any;
    [key: string]: any;
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
    client_sources?: Array<{
        id: string;
        name: string;
        type?: string;
        avatar?: string;
        is_primary?: boolean;
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
    if (client.client_type === 'corporate' || client.company_name || client.name?.toLowerCase().includes('pt ') || client.name?.toLowerCase().includes('bank')) {
        return 'Klien Corporate';
    }
    if (client.client_type === 'vip' || (client as any).tags?.includes('VIP') || (client as any).tags?.includes('vip')) {
        return 'Klien VIP';
    }
    if ((client.total_value || 0) > 40000000 || client.client_type === 'premium' || (client as any).tags?.includes('Premium') || (client as any).tags?.includes('premium')) {
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
    client_sources = [],
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
        category_id: '',
        primary_contact: 'cpw',
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
        event_type: 'Pernikahan',
        event_date: '',
        event_time: '',
        event_location: '',
        reception_location: '',
        estimated_guests: '',
        concept_theme: '',
        other_vendors: '',
        project_notes: '',
        reference_url: '',
        special_requests: '',
        package_id: '',
        source: 'Instagram',
        client_source_id: '',
        referred_by_client_id: '',
        wedding_organizer_id: '',
        referral_name: '',
        status: 'active',
        notes: '',
        tags: [] as string[],
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
    const [createCurrentStep, setCreateCurrentStep] = useState(1);
    const [categoryData, setCategoryData] = useState<AnyCategorySpecificData>({});
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

    const handleCategoryDataChange = (field: string, value: any) => {
        setCategoryData((prev) => {
            const next = { ...prev, [field]: value };
            if (field === 'session_date' || field === 'akad_date' || field === 'event_date' || field === 'departure_date') {
                if (value) setFormData((f) => ({ ...f, event_date: value }));
            }
            if (field === 'session_location' || field === 'location' || field === 'akad_location' || field === 'event_location' || field === 'destination_city_country') {
                if (value) setFormData((f) => ({ ...f, event_location: value }));
            }
            return next;
        });
    };

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

    const selectedCategory = useMemo(() => {
        return (
            (categories || []).find(
                (c: any) => String(c.id) === String(formData.category_id) || c.slug === formData.client_type || c.slug === formData.category_id
            ) ||
            categories[0] || {
                id: 'wedding',
                name: 'Wedding',
                form_type: 'wedding',
            }
        );
    }, [categories, formData.category_id, formData.client_type]);

    const activeCategoryKey: CategoryFormKey = useMemo(() => {
        return resolveCategoryKey(selectedCategory);
    }, [selectedCategory]);

    const activeFormType = (selectedCategory as any)?.form_type || activeCategoryKey;

    const categoryOptions = useMemo<SelectSearchOption[]>(() => {
        const iconMap: Record<string, string> = {
            wedding: '💍',
            prewedding: '💑',
            maternity: '🤰',
            family: '👨‍👩‍👧‍👦',
            corporate: '🏢',
            komunitas: '👥',
            birthday: '🎂',
            engagement: '💐',
            event: '🎉',
            traveling: '✈️',
            commercial: '📸',
            perorangan: '👤',
            lainnya: '✨',
            newborn: '👶',
            standard: '📷',
        };

        return (categories || []).map((c: any) => {
            const key = resolveCategoryKey(c);
            const iconEmoji = iconMap[key] || '📷';
            return {
                value: String(c.id),
                label: `${iconEmoji} ${c.name}`,
                subtitle: c.description ? c.description : `Kategori ${c.name}`,
            };
        });
    }, [categories]);

    const handleCategoryChange = (val: string) => {
        const cat = (categories || []).find((c: any) => String(c.id) === String(val) || c.slug === val);
        setFormData((prev) => ({
            ...prev,
            category_id: val,
            client_type: cat?.slug || val,
            event_type: cat?.name || 'Dokumentasi',
        }));
    };

    const availablePackages = useMemo(() => {
        if (!selectedCategory?.id) return packages;
        const filtered = (packages || []).filter((p: any) => String(p.category_id) === String(selectedCategory.id));
        return filtered.length > 0 ? filtered : packages;
    }, [packages, selectedCategory]);

    const selectedPackage = useMemo(() => {
        return (packages || []).find((p: any) => String(p.id) === String(formData.package_id)) || availablePackages[0];
    }, [packages, formData.package_id, availablePackages]);

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

    const createSteps = [
        { number: 1, id: 'step1', title: 'Informasi Awal & Detail Klien', subtitle: 'Kategori & Data Khusus' },
        { number: 2, id: 'step2', title: 'Informasi Alamat & Kontak', subtitle: 'Domisili & WhatsApp' },
        { number: 3, id: 'step3', title: 'Paket & Detail Acara', subtitle: 'Paket, Lokasi & Jadwal' },
        { number: 4, id: 'step4', title: 'Ringkasan', subtitle: 'Review & Simpan' },
    ];

    const primaryContactInfo = useMemo(() => {
        if (activeCategoryKey === 'wedding' || activeCategoryKey === 'engagement') {
            const isBride = formData.primary_contact === 'cpw' || !formData.primary_contact;
            return {
                name: isBride ? (categoryData.bride_name || formData.bride_name || '-') : (categoryData.groom_name || formData.groom_name || '-'),
                nickname: isBride ? (categoryData.bride_nickname || formData.bride_nickname || '-') : (categoryData.groom_nickname || formData.groom_nickname || '-'),
                occupation: isBride ? (categoryData.bride_occupation || '-') : (categoryData.groom_occupation || '-'),
                instagram: isBride ? (categoryData.bride_instagram || formData.instagram || '-') : (categoryData.groom_instagram || formData.instagram || '-'),
                birth_date: isBride ? (categoryData.bride_birth_date || formData.bride_birth_date || '-') : (categoryData.groom_birth_date || formData.groom_birth_date || '-'),
                role: isBride ? 'CPW' : 'CPP',
            };
        }
        if (activeCategoryKey === 'prewedding') {
            const isP1 = formData.primary_contact === 'cpw' || !formData.primary_contact;
            return {
                name: isP1 ? (categoryData.partner_1 || categoryData.bride_name || '-') : (categoryData.partner_2 || categoryData.groom_name || '-'),
                nickname: isP1 ? (categoryData.partner_1_nickname || '-') : (categoryData.partner_2_nickname || '-'),
                occupation: isP1 ? (categoryData.partner_1_occupation || '-') : (categoryData.partner_2_occupation || '-'),
                instagram: isP1 ? (categoryData.partner_1_instagram || formData.instagram || '-') : (categoryData.partner_2_instagram || formData.instagram || '-'),
                birth_date: isP1 ? (categoryData.partner_1_birth_date || '-') : (categoryData.partner_2_birth_date || '-'),
                role: isP1 ? 'Pasangan 1' : 'Pasangan 2',
            };
        }
        if (activeCategoryKey === 'maternity') {
            const isMom = formData.primary_contact === 'cpw' || !formData.primary_contact;
            return {
                name: isMom ? (categoryData.mom_name || categoryData.mother_name || '-') : (categoryData.partner_name || categoryData.father_name || '-'),
                nickname: '-',
                occupation: isMom ? (categoryData.mom_occupation || '-') : (categoryData.partner_occupation || '-'),
                instagram: isMom ? (categoryData.mom_instagram || formData.instagram || '-') : (categoryData.partner_instagram || formData.instagram || '-'),
                birth_date: '-',
                role: isMom ? 'Ibu Hamil' : 'Pasangan',
            };
        }
        if (activeCategoryKey === 'corporate' || activeCategoryKey === 'komunitas') {
            return {
                name: categoryData.pic_name || categoryData.contact_person || formData.name || '-',
                nickname: '-',
                occupation: categoryData.pic_role || categoryData.pic_position || '-',
                instagram: categoryData.pic_phone || formData.instagram || '-',
                birth_date: '-',
                role: 'PIC',
            };
        }
        if (activeCategoryKey === 'birthday') {
            return {
                name: categoryData.celebrant_name || formData.name || '-',
                nickname: '-',
                occupation: '-',
                instagram: '-',
                birth_date: '-',
                role: 'Pemesan / Ultah',
            };
        }
        if (activeCategoryKey === 'newborn') {
            const isFather = formData.primary_contact === 'cpp' || formData.primary_contact === 'father';
            const parentName = isFather
                ? (categoryData.father_name || formData.father_name || 'Ayah')
                : (categoryData.mother_name || formData.mother_name || 'Ibu');
            const firstBabyName = categoryData.babies?.[0]?.name || categoryData.baby_name || formData.child_name || '-';
            const firstBabyBirthDate = categoryData.babies?.[0]?.birth_date || categoryData.baby_birth_date || formData.child_birth_date || '-';
            return {
                name: parentName,
                nickname: firstBabyName,
                occupation: categoryData.father_occupation || categoryData.mother_occupation || '-',
                instagram: formData.instagram || '-',
                birth_date: firstBabyBirthDate,
                role: isFather ? 'Ayah' : 'Ibu',
            };
        }

        return {
            name: categoryData.contact_person || formData.name || '-',
            nickname: formData.bride_nickname || formData.groom_nickname || '-',
            occupation: formData.occupation || '-',
            instagram: formData.instagram || '-',
            birth_date: '-',
            role: 'Pemesan',
        };
    }, [activeCategoryKey, formData, categoryData]);

    const newTagInput = customTagInput;
    const setNewTagInput = setCustomTagInput;
    const handleAddCustomTag = addCustomTag;

    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        router.get('/clients', { search, status: newStatus === 'Semua' ? undefined : newStatus, city: city === 'Semua' ? undefined : city, source: source === 'Semua' ? undefined : source, per_page: perPage }, { preserveState: true, preserveScroll: true });
    };

    const handleSearchChange = (val: string | React.ChangeEvent<HTMLInputElement>) => {
        const query = typeof val === 'string' ? val : val.target.value;
        setSearch(query);
    };

    const handleCityChange = (newCity: string) => {
        setCity(newCity);
        router.get('/clients', { search, status: status === 'Semua' ? undefined : status, city: newCity === 'Semua' ? undefined : newCity, source: source === 'Semua' ? undefined : source, per_page: perPage }, { preserveState: true, preserveScroll: true });
    };

    const handleSourceChange = (newSource: string) => {
        setSource(newSource);
        router.get('/clients', { search, status: status === 'Semua' ? undefined : status, city: city === 'Semua' ? undefined : city, source: newSource === 'Semua' ? undefined : newSource, per_page: perPage }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('Semua');
        setCity('Semua');
        setSource('Semua');
        router.get('/clients', {}, { preserveState: true, preserveScroll: true });
    };

    const handlePerPageChange = (newPerPage: number) => {
        setPerPage(newPerPage);
        router.get('/clients', { search, status: status === 'Semua' ? undefined : status, city: city === 'Semua' ? undefined : city, source: source === 'Semua' ? undefined : source, per_page: newPerPage }, { preserveState: true, preserveScroll: true });
    };

    const handlePageChange = (newPage: number) => {
        router.get('/clients', { search, status: status === 'Semua' ? undefined : status, city: city === 'Semua' ? undefined : city, source: source === 'Semua' ? undefined : source, per_page: perPage, page: newPage }, { preserveState: true, preserveScroll: true });
    };

    const handleOpenCreateModal = () => {
        setFormData({
            ...initialFormData,
            category_id: String(categories?.find((c: any) => c.slug === 'wedding' || c.name?.toLowerCase().includes('wedding'))?.id || categories?.[0]?.id || ''),
        });
        setCategoryData({});
        setCreateCurrentStep(1);
        setFormErrors({});
        setCreateModalOpen(true);
    };

    const validateCreateStep = (stepNum: number) => {
        if (stepNum === 1) {
            if (activeCategoryKey === 'wedding') {
                const hasWeddingName = (categoryData.groom_name || formData.groom_name || '').trim() || (categoryData.bride_name || formData.bride_name || '').trim();
                if (!hasWeddingName && !formData.name.trim()) {
                    toast.error('Nama calon pengantin (CPP & CPW) wajib diisi');
                    return false;
                }
            } else if (activeCategoryKey === 'newborn') {
                const firstBaby = (categoryData.babies?.[0]?.name || categoryData.baby_name || formData.child_name || '').trim();
                if (!firstBaby && !formData.name.trim() && !categoryData.father_name && !categoryData.mother_name) {
                    toast.error('Nama bayi atau orang tua wajib diisi');
                    return false;
                }
            } else {
                if (!formData.name.trim() && !categoryData.contact_person && !categoryData.company_name && !categoryData.celebrant_name) {
                    toast.error('Nama klien / pemesan wajib diisi');
                    return false;
                }
            }
        }
        if (stepNum === 2) {
            if (!formData.phone.trim() && !categoryData.pic_phone) {
                toast.error('Nomor WhatsApp / telepon utama wajib diisi');
                return false;
            }
        }
        return true;
    };

    const handleNextCreateStep = () => {
        if (!validateCreateStep(createCurrentStep)) return;
        if (createCurrentStep < 4) {
            setCreateCurrentStep((prev) => prev + 1);
        }
    };

    const handlePrevCreateStep = () => {
        if (createCurrentStep > 1) {
            setCreateCurrentStep((prev) => prev - 1);
        }
    };

    // Create Client Action
    const handleCreateClient = (e: React.FormEvent) => {
        e.preventDefault();

        const selectedCat = (categories || []).find((c: any) => String(c.id) === String(formData.category_id) || c.slug === formData.client_type || c.slug === formData.category_id) || categories[0];
        const activeKey = resolveCategoryKey(selectedCat);

        // Derive client name based on category
        let clientName = formData.name.trim();
        if (!clientName) {
            if (activeKey === 'wedding') {
                const groom = (categoryData.groom_name || formData.groom_name || '').trim();
                const bride = (categoryData.bride_name || formData.bride_name || '').trim();
                clientName = groom && bride ? `${groom} & ${bride}` : (groom || bride || 'Klien Wedding');
            } else if (activeKey === 'prewedding') {
                const p1 = (categoryData.partner_1 || categoryData.bride_name || '').trim();
                const p2 = (categoryData.partner_2 || categoryData.groom_name || '').trim();
                clientName = p1 && p2 ? `${p1} & ${p2}` : (p1 || p2 || 'Klien Prewedding');
            } else if (activeKey === 'maternity') {
                const mom = (categoryData.mom_name || categoryData.mother_name || '').trim();
                const partner = (categoryData.partner_name || categoryData.father_name || '').trim();
                clientName = mom ? `Maternity: ${mom}` : (partner || 'Klien Maternity');
            } else if (activeKey === 'newborn') {
                const firstBaby = (categoryData.babies?.[0]?.name || categoryData.baby_name || formData.child_name || '').trim();
                const parent = (categoryData.mother_name || categoryData.father_name || formData.father_name || '').trim();
                clientName = firstBaby ? `Baby ${firstBaby}` : (parent ? `Baby of ${parent}` : 'Klien Newborn');
            } else if (activeKey === 'family') {
                const fam = (categoryData.family_name || '').trim();
                clientName = fam ? `Keluarga ${fam}` : (categoryData.father_name || 'Klien Family');
            } else if (activeKey === 'corporate') {
                clientName = (categoryData.company_name || formData.company_name || categoryData.pic_name || 'Klien Corporate').trim();
            } else if (activeKey === 'komunitas') {
                clientName = (categoryData.community_name || categoryData.pic_name || 'Klien Komunitas').trim();
            } else if (activeKey === 'birthday') {
                const cel = (categoryData.celebrant_name || '').trim();
                clientName = cel ? `Birthday: ${cel}` : 'Klien Birthday';
            } else {
                clientName = (categoryData.contact_person || formData.contact_person || formData.name || 'Klien Baru').trim();
            }
        }

        const validChildren = (Array.isArray(categoryData.babies) && categoryData.babies.length > 0)
            ? categoryData.babies
            : (Array.isArray(categoryData.children) && categoryData.children.length > 0
                ? categoryData.children
                : (Array.isArray(formData.children) ? formData.children : []));

        const payload = {
            ...formData,
            name: clientName || 'Klien Baru',
            client_type: selectedCat?.slug || formData.client_type || 'wedding',
            category_id: selectedCat?.id || formData.category_id,
            package_id: formData.package_id || null,
            category_data: categoryData,
            bride_name: categoryData.bride_name || formData.bride_name || null,
            bride_nickname: categoryData.bride_nickname || formData.bride_nickname || null,
            groom_name: categoryData.groom_name || formData.groom_name || null,
            groom_nickname: categoryData.groom_nickname || formData.groom_nickname || null,
            bride_birth_date: categoryData.bride_birth_date || formData.bride_birth_date || null,
            groom_birth_date: categoryData.groom_birth_date || formData.groom_birth_date || null,
            child_name: categoryData.baby_name || formData.child_name || null,
            child_birth_date: categoryData.baby_birth_date || formData.child_birth_date || null,
            child_gender: categoryData.baby_gender || formData.child_gender || null,
            father_name: categoryData.father_name || formData.father_name || null,
            mother_name: categoryData.mother_name || categoryData.mom_name || formData.mother_name || null,
            partner_name: categoryData.partner_name || formData.partner_name || null,
            company_name: categoryData.company_name || formData.company_name || null,
            children: validChildren.length > 0 ? validChildren : null,
            event_type: selectedCat?.name || formData.event_type || 'Dokumentasi',
            event_date: formData.event_date || categoryData.session_date || categoryData.akad_date || categoryData.event_date || categoryData.departure_date || null,
            event_time: formData.event_time || categoryData.akad_time || categoryData.event_time || null,
            event_location: formData.event_location || categoryData.session_location || categoryData.akad_location || categoryData.event_location || categoryData.location || formData.address || null,
            phone: formData.phone.trim() || categoryData.pic_phone || '081234567890',
        };

        setIsSubmitting(true);
        setFormErrors({});

        const savedClientName = payload.name;

        router.post('/clients', payload as any, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setCreateModalOpen(false);
                setIsSubmitting(false);
                setFormData(initialFormData);
                setCategoryData({});
                setCreateCurrentStep(1);
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

            <div className="space-y-4 w-full max-w-full pb-2">
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
                            onClick={handleOpenCreateModal}
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
                    subtitle="Lengkapi data profil, kontak, domisili, acara, dan preferensi klien sesuai formulir intake."
                    maxWidth="4xl"
                    className="max-h-[92vh]"
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
                                {createCurrentStep > 1 && (
                                    <button
                                        type="button"
                                        onClick={handlePrevCreateStep}
                                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span>Sebelumnya</span>
                                    </button>
                                )}

                                {createCurrentStep < 4 ? (
                                    <button
                                        type="button"
                                        onClick={handleNextCreateStep}
                                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <span>Lanjut: {createSteps[createCurrentStep]?.title || 'Langkah Berikutnya'}</span>
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
                    <div className="space-y-6 pt-1">
                        {/* ================================================================= */}
                        {/* STEPPER HEADER (4 Connected Steps) */}
                        {/* ================================================================= */}
                        <div className="relative pb-6 mb-2 border-b border-slate-100">
                            {/* Connecting background line */}
                            <div
                                className="absolute top-[18px] -translate-y-1/2 h-[2px] bg-slate-200 z-0 pointer-events-none"
                                style={{
                                    left: `calc(100% / ${createSteps.length * 2})`,
                                    right: `calc(100% / ${createSteps.length * 2})`,
                                }}
                            >
                                {/* Active progress fill line */}
                                <div
                                    className="h-full transition-all duration-300 ease-in-out bg-[#C89445]"
                                    style={{
                                        width: `${((createCurrentStep - 1) / (createSteps.length - 1)) * 100}%`,
                                    }}
                                />
                            </div>

                            <div className="flex items-start justify-between relative z-10">
                                {createSteps.map((s) => {
                                    const isDone = createCurrentStep > s.number;
                                    const isCurrent = createCurrentStep === s.number;
                                    return (
                                        <div key={s.number} className="flex-1 flex flex-col items-center text-center px-1">
                                            <div className="relative flex items-center justify-center mb-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => (isDone ? setCreateCurrentStep(s.number) : null)}
                                                    disabled={!isDone}
                                                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all relative z-10 ${
                                                        isDone
                                                            ? 'bg-[#C89445] text-white cursor-pointer hover:opacity-90 shadow-md'
                                                            : isCurrent
                                                            ? 'bg-[#C89445] text-white ring-4 ring-[#C89445]/20 shadow-md font-extrabold'
                                                            : 'bg-white border-2 border-slate-300 text-slate-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.number}
                                                </button>
                                            </div>
                                            <span
                                                className={`text-[11px] sm:text-xs max-w-[130px] line-clamp-2 leading-tight ${
                                                    isCurrent
                                                        ? 'font-bold text-[#C89445]'
                                                        : isDone
                                                        ? 'text-slate-700 font-semibold'
                                                        : 'text-slate-400'
                                                }`}
                                            >
                                                {s.title}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ================================================================= */}
                        {/* STEP 1: INFORMASI AWAL & DETAIL KLIEN */}
                        {/* ================================================================= */}
                        {createCurrentStep === 1 && (
                            <div className="space-y-5 animate-in fade-in duration-200">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        {activeCategoryKey === 'wedding'
                                            ? 'Informasi Awal & Calon Pengantin (CPP/CPW)'
                                            : activeCategoryKey === 'newborn'
                                            ? 'Informasi Awal & Data Bayi (Newborn)'
                                            : 'Informasi Awal & Identitas Klien'}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Pilih kategori project terlebih dahulu, formulir akan otomatis menyesuaikan data yang diperlukan.
                                    </p>
                                </div>

                                {/* 1. PILIH KATEGORI PROJECT */}
                                <div className="border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs bg-slate-50/50">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                                <Bookmark className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900">
                                                    Pilih Kategori Project <span className="text-red-500">*</span>
                                                </h4>
                                                <p className="text-[11px] text-slate-500">
                                                    Kategori menentukan format isian data profil klien:
                                                </p>
                                            </div>
                                        </div>

                                        <span className="self-start sm:self-auto inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                                            Kategori: {selectedCategory.name}
                                        </span>
                                    </div>

                                    <div>
                                        <SelectSearch
                                            options={categoryOptions}
                                                                                      onChange={handleCategoryChange}
                                            placeholder="Cari atau pilih Kategori Project..."
                                            searchPlaceholder="Ketik nama kategori (Wedding, Newborn, dll)..."
                                            clearable={false}
                                            className="w-full bg-white"
                                        />
                                    </div>
                                </div>

                                {/* 2. DYNAMIC INPUT FORM BASED ON 15 CATEGORIES */}
                                <div className="pt-1">
                                    <CategorySpecificForm
                                        categoryKey={activeCategoryKey}
                                        categoryName={selectedCategory?.name}
                                        data={categoryData}
                                        onChange={handleCategoryDataChange}
                                        mode="public"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ================================================================= */}
                        {/* STEP 2: INFORMASI ALAMAT & KONTAK */}
                        {/* ================================================================= */}
                        {createCurrentStep === 2 && (
                            <div className="space-y-5 animate-in fade-in duration-200">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        Informasi Alamat & Kontak
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Lengkapi informasi domisili wilayah dan pilih kontak utama untuk komunikasi.
                                    </p>
                                </div>

                                {/* Blue Info Alert */}
                                <div className="bg-indigo-50/70 border border-indigo-100/90 rounded-2xl p-4 flex items-center gap-3 text-xs text-indigo-900">
                                    <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>
                                        <strong>Informasi penting:</strong> Pastikan semua data alamat dan kontak utama yang diisi sudah benar agar memudahkan komunikasi.
                                    </span>
                                </div>

                                {/* Informasi Alamat Card */}
                                <div className="border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs bg-white">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-900">
                                            Informasi Alamat & Domisili
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Provinsi <span className="text-red-500">*</span>
                                            </label>
                                            <SelectSearch
                                                options={provinceOptions}
                                                value={formData.province_code}
                                                onChange={handleProvinceChange}
                                                placeholder="Pilih provinsi"
                                                searchPlaceholder="Cari provinsi..."
                                                clearable={false}
                                                className="w-full bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Kota / Kabupaten <span className="text-red-500">*</span>
                                            </label>
                                            <SelectSearch
                                                options={cityOptions}
                                                value={formData.city_code}
                                                onChange={handleCitySelectChange}
                                                placeholder={formData.province_code ? 'Pilih kota / kabupaten' : 'Pilih provinsi dahulu'}
                                                searchPlaceholder="Cari kota..."
                                                disabled={!formData.province_code}
                                                isLoading={loadingCities}
                                                clearable={false}
                                                className="w-full bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Kecamatan <span className="text-red-500">*</span>
                                            </label>
                                            <SelectSearch
                                                options={districtOptions}
                                                value={formData.district_code}
                                                onChange={handleDistrictSelectChange}
                                                placeholder={formData.city_code ? 'Pilih kecamatan' : 'Pilih kota dahulu'}
                                                searchPlaceholder="Cari kecamatan..."
                                                disabled={!formData.city_code}
                                                isLoading={loadingDistricts}
                                                clearable={false}
                                                className="w-full bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Kelurahan / Desa <span className="text-red-500">*</span>
                                            </label>
                                            <SelectSearch
                                                options={villageOptions}
                                                value={formData.village_code}
                                                onChange={handleVillageSelectChange}
                                                placeholder={formData.district_code ? 'Pilih kelurahan' : 'Pilih kecamatan dahulu'}
                                                searchPlaceholder="Cari kelurahan..."
                                                disabled={!formData.district_code}
                                                isLoading={loadingVillages}
                                                clearable={false}
                                                className="w-full bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Kode Pos
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.postal_code}
                                                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                                placeholder="Masukkan kode pos"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-[11px] font-bold text-slate-700">
                                                Alamat Lengkap <span className="text-red-500">*</span>
                                            </label>
                                            <span className="text-[10px] text-slate-400">
                                                {formData.address.length} / 255
                                            </span>
                                        </div>
                                        <textarea
                                            rows={2.5}
                                            maxLength={255}
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Masukkan alamat lengkap (nama jalan, nomor rumah, RT/RW, dsb)"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Kontak Utama Card */}
                                <div className="border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs bg-white">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-900">
                                                Kontak Utama untuk Komunikasi
                                            </h4>
                                            <p className="text-[11px] text-slate-500">
                                                Pilih pihak yang paling mudah dihubungi terkait pemesanan ini.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                                        <div className="lg:col-span-6 space-y-3.5">
                                            <div>
                                                <NativeSelect
                                                    label="Pilih Kontak Utama"
                                                    required
                                                    value={formData.primary_contact}
                                                    onChange={(e) => setFormData({ ...formData, primary_contact: e.target.value })}
                                                    helperText="Data kontak akan terisi otomatis sesuai pilihan Anda."
                                                >
                                                    {activeCategoryKey === 'wedding' || activeCategoryKey === 'engagement' ? (
                                                        <>
                                                            <option value="cpw">CPW — {categoryData.bride_name || formData.bride_name || 'Calon Pengantin Wanita'}</option>
                                                            <option value="cpp">CPP — {categoryData.groom_name || formData.groom_name || 'Calon Pengantin Pria'}</option>
                                                        </>
                                                    ) : activeCategoryKey === 'prewedding' ? (
                                                        <>
                                                            <option value="cpw">Pasangan 1 — {categoryData.partner_1 || categoryData.bride_name || 'Pasangan 1'}</option>
                                                            <option value="cpp">Pasangan 2 — {categoryData.partner_2 || categoryData.groom_name || 'Pasangan 2'}</option>
                                                        </>
                                                    ) : activeCategoryKey === 'maternity' ? (
                                                        <>
                                                            <option value="cpw">Ibu — {categoryData.mom_name || categoryData.mother_name || 'Ibu Hamil'}</option>
                                                            <option value="cpp">Ayah / Pasangan — {categoryData.partner_name || categoryData.father_name || 'Ayah / Pasangan'}</option>
                                                        </>
                                                    ) : activeCategoryKey === 'family' ? (
                                                        <>
                                                            <option value="cpp">Ayah — {categoryData.father_name || 'Ayah'}</option>
                                                            <option value="mother">Ibu — {categoryData.mother_name || 'Ibu'}</option>
                                                            <option value="family">Keluarga — {categoryData.family_name || 'Keluarga'}</option>
                                                        </>
                                                    ) : activeCategoryKey === 'corporate' ? (
                                                        <option value="pic">PIC Perusahaan — {categoryData.pic_name || 'PIC'}</option>
                                                    ) : activeCategoryKey === 'komunitas' ? (
                                                        <option value="pic">PIC Komunitas — {categoryData.pic_name || 'PIC'}</option>
                                                    ) : activeCategoryKey === 'newborn' ? (
                                                        <>
                                                            <option value="mother">Ibu — {categoryData.mother_name || formData.mother_name || 'Ibu'}</option>
                                                            <option value="cpp">Ayah — {categoryData.father_name || formData.father_name || 'Ayah'}</option>
                                                        </>
                                                    ) : (
                                                        <option value="client">Pemesan — {categoryData.contact_person || formData.name || 'Pemesan'}</option>
                                                    )}
                                                </NativeSelect>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                    No. WhatsApp <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                        <Phone className="w-3.5 h-3.5" />
                                                    </span>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        placeholder="+62 812-3456-7890"
                                                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445]"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                    Email
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                        <Mail className="w-3.5 h-3.5" />
                                                    </span>
                                                    <input
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        placeholder="contoh@gmail.com"
                                                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445]"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                    Social Media Lainnya
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.other_social_media}
                                                    onChange={(e) => setFormData({ ...formData, other_social_media: e.target.value })}
                                                    placeholder="TikTok: @username, Instagram: @akun"
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445]"
                                                />
                                            </div>
                                        </div>

                                        <div className="lg:col-span-6 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                                            <div className="flex items-center gap-1.5 text-slate-800 text-xs font-bold pb-2 border-b border-slate-200/60">
                                                <span>Data Kontak (Terisi Otomatis)</span>
                                                <Info className="w-3.5 h-3.5 text-slate-400" />
                                            </div>

                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between py-0.5 border-b border-slate-100">
                                                    <span className="text-slate-400">Nama Lengkap</span>
                                                    <span className="font-semibold text-slate-800 text-right">
                                                        {primaryContactInfo.name} ({primaryContactInfo.role})
                                                    </span>
                                                </div>
                                                <div className="flex justify-between py-0.5 border-b border-slate-100">
                                                    <span className="text-slate-400">Pekerjaan</span>
                                                    <span className="font-semibold text-slate-800 text-right">
                                                        {primaryContactInfo.occupation}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between py-0.5 border-b border-slate-100">
                                                    <span className="text-slate-400">No. WhatsApp</span>
                                                    <span className="font-semibold text-slate-800 text-right">
                                                        {formData.phone || '-'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between py-0.5 border-b border-slate-100">
                                                    <span className="text-slate-400">Akun Instagram</span>
                                                    <span className="font-semibold text-slate-800 text-right">
                                                        {primaryContactInfo.instagram}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between py-0.5 border-b border-slate-100">
                                                    <span className="text-slate-400">Email</span>
                                                    <span className="font-semibold text-slate-800 text-right">
                                                        {formData.email || '-'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between py-0.5">
                                                    <span className="text-slate-400">Social Media Lain</span>
                                                    <span className="font-semibold text-slate-800 text-right max-w-[180px] truncate">
                                                        {formData.other_social_media || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================================================================= */}
                        {/* STEP 3: INFORMASI ACARA/PROJECT & MANAJEMEN */}
                        {/* ================================================================= */}
                        {createCurrentStep === 3 && (
                            <div className="space-y-5 animate-in fade-in duration-200">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        Paket, Detail Acara &amp; Pengaturan Klien
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Lengkapi detail jadwal, paket, tempat pelaksanaan, sumber lead, dan status klien.
                                    </p>
                                </div>

                                {/* Blue Info Alert */}
                                <div className="bg-indigo-50/70 border border-indigo-100/90 rounded-2xl p-4 flex items-center gap-3 text-xs text-indigo-900">
                                    <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>
                                        <strong>Informasi penting:</strong> Informasi yang Anda isi akan membantu tim mempersiapkan sesi dokumentasi dan paket layanan yang sesuai.
                                    </span>
                                </div>

                                {/* Detail Acara / Project Card */}
                                <div className="border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs bg-white">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-900">
                                            Detail Acara &amp; Paket Photography
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Kategori Project
                                            </label>
                                            <SelectSearch
                                                options={categoryOptions}
                                                value={String(formData.category_id || selectedCategory?.id)}
                                                onChange={handleCategoryChange}
                                                placeholder="Pilih kategori project"
                                                searchPlaceholder="Cari kategori..."
                                                clearable={false}
                                                className="w-full bg-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Jenis Acara <span className="text-red-500">*</span>
                                            </label>
                                            <NativeSelect
                                                value={formData.event_type}
                                                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                                                options={[
                                                    { value: 'Pernikahan', label: 'Pernikahan' },
                                                    { value: 'Akad Saja', label: 'Akad Saja' },
                                                    { value: 'Resepsi Saja', label: 'Resepsi Saja' },
                                                    { value: 'Akad & Resepsi', label: 'Akad & Resepsi' },
                                                    { value: 'Lamaran & Engagement', label: 'Lamaran & Engagement' },
                                                    { value: 'Prewedding', label: 'Prewedding' },
                                                    { value: 'Siraman & Pengajian', label: 'Siraman & Pengajian' },
                                                    { value: 'Unduh Mantu', label: 'Unduh Mantu' },
                                                    { value: 'Family Session', label: 'Family Session' },
                                                    { value: 'Maternity Session', label: 'Maternity Session' },
                                                    { value: 'Newborn Session', label: 'Newborn Session' },
                                                    { value: 'Corporate Documentation', label: 'Corporate Documentation' },
                                                    { value: 'Event Documentation', label: 'Event Documentation' },
                                                ]}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Pilihan Paket (Opsional)
                                            </label>
                                            <SelectSearch
                                                options={[
                                                    ...availablePackages.map((p: any) => ({
                                                        value: String(p.id),
                                                        label: p.name,
                                                        subtitle: p.description
                                                            ? p.description
                                                            : p.base_price
                                                            ? `Rp ${Number(p.base_price).toLocaleString('id-ID')}`
                                                            : undefined,
                                                    })),
                                                ]}
                                                value={formData.package_id}
                                                onChange={(val) => setFormData({ ...formData, package_id: val })}
                                                placeholder="Pilih paket atau layanan"
                                                searchPlaceholder="Cari paket..."
                                                clearable={true}
                                                className="w-full bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Tanggal Acara / Sesi
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.event_date}
                                                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Waktu / Jam Sesi / Acara
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.event_time}
                                                onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                                                placeholder="Contoh: 08:00 - 14:00 WIB"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Tempat / Lokasi Sesi
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.event_location}
                                                onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
                                                placeholder="Contoh: Grand Ballroom Hotel Hilton"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445]"
                                            />
                                        </div>
                                    </div>

                                    <div className={`grid grid-cols-1 ${activeCategoryKey === 'wedding' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3.5`}>
                                        {activeCategoryKey === 'wedding' && (
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                    Lokasi Resepsi (Jika berbeda)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.reception_location}
                                                    onChange={(e) => setFormData({ ...formData, reception_location: e.target.value })}
                                                    placeholder="Contoh: Gedung Pernikahan..."
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445]"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Estimasi Jumlah Tamu
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.estimated_guests}
                                                onChange={(e) => setFormData({ ...formData, estimated_guests: e.target.value })}
                                                placeholder="Contoh: 300 - 500 Pax"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Warna Tema / Konsep Acara
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.concept_theme}
                                                onChange={(e) => setFormData({ ...formData, concept_theme: e.target.value })}
                                                placeholder="Contoh: Emerald Green & White"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            Vendor Lain yang Terlibat
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.other_vendors}
                                            onChange={(e) => setFormData({ ...formData, other_vendors: e.target.value })}
                                            placeholder="Contoh: WO: Aruna Organizer, MUA: Bubah Alfian, Decor: Lotus"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445]"
                                        />
                                    </div>
                                </div>

                                {/* Informasi Tambahan, Manajemen & Status Card */}
                                <div className="border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs bg-white">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-xs font-bold text-slate-900">
                                            Manajemen Klien &amp; Catatan Khusus
                                        </h4>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Sumber Klien (Lead Source) <span className="text-red-500">*</span>
                                            </label>
                                            {client_sources && client_sources.length > 0 ? (
                                                <select
                                                    value={formData.client_source_id || ''}
                                                    onChange={(e) => {
                                                        const selected = client_sources.find(cs => cs.id === e.target.value);
                                                        setFormData({
                                                            ...formData,
                                                            client_source_id: e.target.value,
                                                            source: selected?.name || formData.source,
                                                        });
                                                    }}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all cursor-pointer"
                                                >
                                                    <option value="">— Pilih Sumber Klien —</option>
                                                    {client_sources.map((cs) => (
                                                        <option key={cs.id} value={cs.id}>
                                                            {cs.name} {cs.type ? `(${cs.type})` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
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
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
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

                                        {formData.source === 'Wedding Organizer' && (
                                            <div className="sm:col-span-2">
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                    Pilih Wedding Organizer (Partner)
                                                </label>
                                                <select
                                                    value={formData.wedding_organizer_id}
                                                    onChange={(e) => setFormData({ ...formData, wedding_organizer_id: e.target.value })}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all cursor-pointer"
                                                >
                                                    <option value="">-- Pilih Partner WO --</option>
                                                    {(wedding_organizers || []).map((wo: any) => (
                                                        <option key={wo.id} value={wo.id}>
                                                            {wo.name} ({wo.city || 'Partner'})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {formData.source === 'Rekomendasi Teman' && (
                                            <div className="sm:col-span-2">
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                    Direferensikan oleh Klien
                                                </label>
                                                <select
                                                    value={formData.referred_by_client_id}
                                                    onChange={(e) => setFormData({ ...formData, referred_by_client_id: e.target.value })}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all cursor-pointer"
                                                >
                                                    <option value="">-- Pilih Klien Referrer --</option>
                                                    {(all_clients || []).map((cl: any) => (
                                                        <option key={cl.id} value={cl.id}>
                                                            {cl.name} ({cl.phone || cl.city || 'Klien'})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div className="sm:col-span-2">
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
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
                                                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                                                isSelected
                                                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                                                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                                            }`}
                                                        >
                                                            #{tag}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newTagInput}
                                                    onChange={(e) => setNewTagInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddCustomTag();
                                                        }
                                                    }}
                                                    placeholder="Tambah tag kustom (tekan Enter)..."
                                                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445]"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddCustomTag}
                                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                                                >
                                                    Tambah Tag
                                                </button>
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Link Moodboard / Referensi Foto (Pinterest/Drive)
                                            </label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                    <Globe className="w-3.5 h-3.5" />
                                                </span>
                                                <input
                                                    type="url"
                                                    value={formData.reference_url}
                                                    onChange={(e) => setFormData({ ...formData, reference_url: e.target.value })}
                                                    placeholder="https://pinterest.com/... atau https://drive.google.com/..."
                                                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445]"
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Permintaan Khusus &amp; Catatan Acara
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={formData.project_notes}
                                                onChange={(e) => setFormData({ ...formData, project_notes: e.target.value })}
                                                placeholder="Contoh: Klien menginginkan pencahayaan natural warm tone, fokus foto candid keluarga, dll."
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================================================================= */}
                        {/* STEP 4: RINGKASAN & KONFIRMASI */}
                        {/* ================================================================= */}
                        {createCurrentStep === 4 && (
                            <div className="space-y-5 animate-in fade-in duration-200">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        Ringkasan &amp; Konfirmasi Data Klien
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Silakan tinjau kembali data yang telah diisi sebelum menyimpan data ke database.
                                    </p>
                                </div>

                                {/* Blue Info Alert */}
                                <div className="bg-indigo-50/70 border border-indigo-100/90 rounded-2xl p-4 flex items-center gap-3 text-xs text-indigo-900">
                                    <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>
                                        <strong>Pastikan semua data sudah benar.</strong> Periksa kembali data profil, kontak, dan detail acara sebelum menyimpan data klien.
                                    </span>
                                </div>

                                {/* CARD 1: DETAIL KATEGORI & PROFIL */}
                                <div className="border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3 bg-white shadow-2xs">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                                <Bookmark className="w-3.5 h-3.5" />
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-900">
                                                Profil Kategori: {selectedCategory?.name}
                                            </h4>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCreateCurrentStep(1)}
                                            className="text-xs font-bold text-[#C89445] hover:underline cursor-pointer"
                                        >
                                            Ubah Data
                                        </button>
                                    </div>

                                    <CategorySpecificView
                                        project={{
                                            category: {
                                                name: selectedCategory?.name || 'Wedding',
                                                form_type: activeCategoryKey,
                                            },
                                            category_data: categoryData,
                                            client: {
                                                name: primaryContactInfo.name,
                                                email: formData.email,
                                                phone: formData.phone,
                                                instagram: primaryContactInfo.instagram,
                                                address: formData.address,
                                                city: formData.city,
                                                province: formData.province,
                                            },
                                        }}
                                    />
                                </div>

                                {/* CARD 2: ALAMAT & KONTAK UTAMA */}
                                <div className="border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3 bg-white shadow-2xs">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                                                <MapPin className="w-3.5 h-3.5" />
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-900">
                                                Informasi Alamat &amp; Kontak Utama
                                            </h4>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCreateCurrentStep(2)}
                                            className="text-xs font-bold text-[#C89445] hover:underline cursor-pointer"
                                        >
                                            Ubah Alamat / Kontak
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <div className="p-3 bg-slate-50/70 rounded-xl space-y-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Wilayah Domisili
                                            </span>
                                            <p className="font-semibold text-slate-800">
                                                {[formData.village, formData.district, formData.city, formData.province].filter(Boolean).join(', ') || '-'}
                                            </p>
                                            {formData.postal_code && (
                                                <p className="text-[11px] text-slate-500">Kode Pos: {formData.postal_code}</p>
                                            )}
                                        </div>

                                        <div className="p-3 bg-slate-50/70 rounded-xl space-y-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Kontak Utama ({primaryContactInfo.role})
                                            </span>
                                            <p className="font-semibold text-slate-800">
                                                {primaryContactInfo.name} • {formData.phone || '-'}
                                            </p>
                                            {formData.email && (
                                                <p className="text-[11px] text-slate-500">Email: {formData.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-3 bg-slate-50/70 rounded-xl text-xs space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                            Alamat Lengkap
                                        </span>
                                        <p className="text-slate-800 font-medium leading-relaxed">
                                            {formData.address || 'Belum diisi.'}
                                        </p>
                                    </div>
                                </div>

                                {/* CARD 3: ACARA & MANAJEMEN */}
                                <div className="border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3 bg-white shadow-2xs">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                                <Calendar className="w-3.5 h-3.5" />
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-900">
                                                Detail Acara, Paket &amp; Status
                                            </h4>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCreateCurrentStep(3)}
                                            className="text-xs font-bold text-[#C89445] hover:underline cursor-pointer"
                                        >
                                            Ubah Acara
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                        <div className="p-3 bg-slate-50/70 rounded-xl">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Jenis Acara
                                            </span>
                                            <span className="font-semibold text-slate-800">{formData.event_type}</span>
                                        </div>
                                        <div className="p-3 bg-slate-50/70 rounded-xl">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Tanggal &amp; Waktu
                                            </span>
                                            <span className="font-semibold text-slate-800">
                                                {formData.event_date || '-'} {formData.event_time ? `(${formData.event_time})` : ''}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-slate-50/70 rounded-xl">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Lokasi Acara
                                            </span>
                                            <span className="font-semibold text-slate-800">{formData.event_location || '-'}</span>
                                        </div>
                                        <div className="p-3 bg-slate-50/70 rounded-xl">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Sumber Lead
                                            </span>
                                            <span className="font-semibold text-slate-800">{formData.source}</span>
                                        </div>
                                        <div className="p-3 bg-slate-50/70 rounded-xl">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Status
                                            </span>
                                            <span className="font-semibold text-emerald-700 capitalize">{formData.status}</span>
                                        </div>
                                        <div className="p-3 bg-slate-50/70 rounded-xl">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Estimasi Tamu
                                            </span>
                                            <span className="font-semibold text-slate-800">{formData.estimated_guests || '-'}</span>
                                        </div>
                                    </div>

                                    {formData.project_notes && (
                                        <div className="p-3 bg-slate-50/70 rounded-xl text-xs space-y-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                                Catatan Khusus
                                            </span>
                                            <p className="text-slate-800 leading-relaxed">{formData.project_notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>

                {/* ========================================================================= */}
                {/* MODAL 2: DETAIL RINGKASAN KLIEN (Quick View with CategorySpecificView) */}
                {/* ========================================================================= */}
                {detailModalClient && (
                    <Modal
                        isOpen={!!detailModalClient}
                        onClose={() => setDetailModalClient(null)}
                        title={`Profil: ${detailModalClient.name}`}
                        subtitle={`ID Klien: #${detailModalClient.id} • ${[detailModalClient.district, detailModalClient.city, detailModalClient.province].filter(Boolean).join(', ') || detailModalClient.city || 'Domisili'}`}
                        maxWidth="3xl"
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
                            <div className="flex items-center justify-between w-full">
                                <button
                                    type="button"
                                    onClick={() => setDetailModalClient(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer shadow-2xs"
                                >
                                    Tutup
                                </button>
                                <Link
                                    href={`/clients/${detailModalClient.id}`}
                                    className="px-5 py-2 rounded-xl bg-[#0B1527] hover:bg-[#152238] text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                                >
                                    <span>Buka Halaman Detail Penuh</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        }
                    >
                        <div className="space-y-4 text-xs">
                            <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4">
                                <CategorySpecificView
                                    project={
                                        detailModalClient.projects?.[0] || {
                                            category: detailModalClient.category || {
                                                name: detailModalClient.client_type || 'Wedding',
                                                form_type: resolveCategoryKey(
                                                    detailModalClient.category || {
                                                        slug: detailModalClient.client_type,
                                                        form_type: detailModalClient.client_type,
                                                    }
                                                ),
                                            },
                                            category_data: detailModalClient.category_data || detailModalClient,
                                            client: detailModalClient,
                                        }
                                    }
                                />
                            </div>

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
