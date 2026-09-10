import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    Instagram,
    Check,
    Building2,
    Heart,
    Sparkles,
    Baby,
    Plus,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Tag,
    FileText,
    Users,
    Bookmark,
    Info,
    Globe,
} from 'lucide-react';
import { SelectSearch, type SelectSearchOption } from '@/components/ui/select-search';
import { NativeSelect } from '@/components/ui/native-select';
import { formatRupiah } from '@/lib/formatters';
import { CategorySpecificForm } from '@/components/projects/CategorySpecificForm';
import { CategorySpecificView } from '@/components/projects/CategorySpecificView';
import {
    CategoryFormKey,
    resolveCategoryKey,
    AnyCategorySpecificData,
} from '@/types/category-forms';

export interface ClientItemOption {
    id: string | number;
    name: string;
    phone?: string;
    city?: string;
    email?: string;
    bride_name?: string;
    groom_name?: string;
    child_name?: string;
    father_name?: string;
    mother_name?: string;
    children?: any;
}

interface RegionItem {
    code: string;
    name: string;
    postal_code?: string;
}

interface ClientEditProps {
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
        category_id?: string | number | null;
        category?: any;
        category_data?: AnyCategorySpecificData | any;
        email?: string;
        instagram?: string;
        partner_instagram?: string;
        phone: string;
        secondary_phone?: string;
        preferred_contact?: string;
        primary_contact?: string;
        province?: string;
        province_code?: string;
        city?: string;
        city_code?: string;
        district?: string;
        district_code?: string;
        village?: string;
        village_code?: string;
        postal_code?: string;
        address?: string;
        contact_person?: string;
        occupation?: string;
        other_social_media?: string;
        source?: string;
        client_source_id?: string;
        referred_by_client_id?: string;
        wedding_organizer_id?: string;
        referral_name?: string;
        status: string;
        notes?: string;
        tags?: string[];
        projects?: Array<any>;
    };
    all_clients?: ClientItemOption[];
    wedding_organizers?: Array<{
        id: string;
        name: string;
        pic_name?: string;
        phone?: string;
        city?: string;
        tier?: string;
    }>;
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
        base_price?: number | string;
        duration_hours?: number;
        description?: string;
    }>;
    client_sources?: Array<{
        id: string;
        name: string;
        type?: string;
        status?: string;
        is_primary?: boolean;
        avatar?: string | null;
    }>;
}

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
    { code: '93', name: 'PAPUA SELATAN' },
    { code: '94', name: 'PAPUA TENGAH' },
    { code: '95', name: 'PAPUA PEGUNUNGAN' },
    { code: '96', name: 'PAPUA BARAT DAYA' },
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

export default function ClientEdit({
    client,
    all_clients = [],
    wedding_organizers = [],
    categories = [],
    packages = [],
    client_sources = [],
}: ClientEditProps) {
    const { appSettings } = usePage().props as any;
    const breadcrumbColor = appSettings?.breadcrumb_color || '#C98922';
    const breadcrumbActiveColor = appSettings?.breadcrumb_active_color || '#FFFFFF';

    const [currentStep, setCurrentStep] = useState<number>(1);
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const steps = [
        { number: 1, title: 'Informasi Awal & Detail Klien', subtitle: 'Kategori & Data Khusus' },
        { number: 2, title: 'Informasi Alamat & Kontak', subtitle: 'Domisili & WhatsApp' },
        { number: 3, title: 'Paket & Detail Acara', subtitle: 'Paket, Lokasi & Jadwal' },
        { number: 4, title: 'Ringkasan', subtitle: 'Review & Simpan' },
    ];

    const presetTags = ['VIP', 'Premium', 'Wedding 2026', 'High Budget', 'Referral WO', 'Outdoor Session', 'Album Mewah', 'Repeat Client'];
    const [newTagInput, setNewTagInput] = useState('');

    const handleAddCustomTag = () => {
        if (!newTagInput.trim()) return;
        const tag = newTagInput.trim();
        if (!formData.tags.includes(tag)) {
            setFormData((prev) => ({
                ...prev,
                tags: [...prev.tags, tag],
            }));
        }
        setNewTagInput('');
    };

    // Active Category Determination
    const initialActiveCat = useMemo(() => {
        return (categories || []).find((c) =>
            String(c.id) === String(client.category_id || (client.category as any)?.id) ||
            c.slug === client.client_type ||
            c.name.toLowerCase() === (client.client_type || '').toLowerCase()
        ) || categories[0] || { id: '1', name: 'Wedding', slug: 'wedding', form_type: 'wedding' };
    }, [categories, client]);

    // Dynamic Category Specific Data
    const [categoryData, setCategoryData] = useState<AnyCategorySpecificData>({
        ...(client.category_data || {}),
        ...(client.projects?.[0]?.category_data || {}),
        bride_name: client.bride_name || client.category_data?.bride_name || client.name,
        bride_nickname: client.bride_nickname || client.category_data?.bride_nickname || '',
        bride_birth_date: client.bride_birth_date ? String(client.bride_birth_date).substring(0, 10) : (client.category_data?.bride_birth_date || ''),
        bride_instagram: client.instagram || client.category_data?.bride_instagram || '',
        groom_name: client.groom_name || client.partner_name || client.category_data?.groom_name || '',
        groom_nickname: client.groom_nickname || client.category_data?.groom_nickname || '',
        groom_birth_date: client.groom_birth_date ? String(client.groom_birth_date).substring(0, 10) : (client.category_data?.groom_birth_date || ''),
        groom_instagram: client.partner_instagram || client.category_data?.groom_instagram || '',
        child_name: client.child_name || client.category_data?.child_name || '',
        child_birth_date: client.child_birth_date ? String(client.child_birth_date).substring(0, 10) : (client.category_data?.child_birth_date || ''),
        child_gender: (client.child_gender || client.category_data?.child_gender || 'male') as 'male' | 'female',
        father_name: client.father_name || client.partner_name || client.category_data?.father_name || '',
        mother_name: client.mother_name || client.category_data?.mother_name || '',
        company_name: client.company_name || client.category_data?.company_name || '',
        contact_person: client.contact_person || client.category_data?.contact_person || '',
        occupation: client.occupation || client.category_data?.occupation || '',
    });

    const initialChildren = (client.children && Array.isArray(client.children) && client.children.filter((c: any) => c && c.name && typeof c.name === 'string' && c.name.trim() !== '').length > 0)
        ? client.children.filter((c: any) => c && c.name && typeof c.name === 'string' && c.name.trim() !== '')
        : [{
            name: client.child_name || '',
            nickname: '',
            birth_date: client.child_birth_date ? String(client.child_birth_date).substring(0, 10) : '',
            gender: (client.child_gender || 'male') as 'male' | 'female',
        }];

    const [formData, setFormData] = useState({
        category_id: (client.category_id ? String(client.category_id) : '') || String(initialActiveCat.id) || '',
        name: client.name || '',
        client_type: client.client_type || initialActiveCat.slug || 'wedding',
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
        children: initialChildren,
        company_name: client.company_name || '',
        email: client.email || '',
        instagram: client.instagram || '',
        partner_instagram: client.partner_instagram || '',
        phone: client.phone || '',
        secondary_phone: client.secondary_phone || '',
        preferred_contact: client.preferred_contact || 'WhatsApp',
        primary_contact: client.primary_contact || 'cpw',
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
        reception_location: (client.projects?.[0]?.category_data as any)?.reception_location || '',
        estimated_guests: (client.projects?.[0]?.category_data as any)?.estimated_guests || '',
        concept_theme: (client.projects?.[0]?.category_data as any)?.concept || (client.projects?.[0]?.category_data as any)?.theme || '',
        other_vendors: '',
        reference_url: (client.projects?.[0]?.category_data as any)?.reference_url || '',
        package_id: client.projects?.[0]?.package_id ? String(client.projects[0].package_id) : (packages[0]?.id ? String(packages[0].id) : ''),
        source: client.source || '',
        client_source_id: (client as any).client_source_id || '',
        referred_by_client_id: client.referred_by_client_id || '',
        wedding_organizer_id: client.wedding_organizer_id || '',
        referral_name: client.referral_name || '',
        status: client.status || 'active',
        notes: client.notes || '',
        tags: (Array.isArray(client.tags) ? client.tags : []) as string[],
    });

    const activeCategory = useMemo(() => {
        return (categories || []).find((c) => String(c.id) === String(formData.category_id)) ||
               (categories || []).find((c) => c.slug === formData.client_type || c.name.toLowerCase() === (formData.client_type || '').toLowerCase()) ||
               categories[0] ||
               { name: 'Wedding', form_type: 'wedding' };
    }, [categories, formData.category_id, formData.client_type]);

    const activeCategoryKey: CategoryFormKey = useMemo(() => {
        return resolveCategoryKey(activeCategory);
    }, [activeCategory]);

    const categorySelectOptions: SelectSearchOption[] = useMemo(() => {
        return (categories || []).map((cat) => ({
            value: String(cat.id),
            label: cat.name,
            subtitle: cat.description || `Kategori Layanan: ${cat.name}`,
        }));
    }, [categories]);

    const filteredPackages = useMemo(() => {
        if (!formData.category_id) return packages;
        return packages.filter((pkg) => String(pkg.category_id) === String(formData.category_id));
    }, [packages, formData.category_id]);

    const handleCategoryDataChange = (field: string, value: any) => {
        setCategoryData((prev) => {
            const next = { ...prev, [field]: value };
            if (field === 'session_date' || field === 'akad_date' || field === 'event_date' || field === 'departure_date') {
                if (value) {
                    setFormData((f) => ({ ...f, event_date: value }));
                }
            }
            if (field === 'session_location' || field === 'location' || field === 'akad_location' || field === 'event_location' || field === 'destination_city_country') {
                if (value) {
                    setFormData((f) => ({ ...f, event_location: value }));
                }
            }
            if (field === 'reception_location') {
                if (value) {
                    setFormData((f) => ({ ...f, reception_location: value }));
                }
            }
            return next;
        });
    };

    // Regional cascading dropdown options
    const [regionProvinces, setRegionProvinces] = useState<RegionItem[]>(DEFAULT_INDONESIA_PROVINCES);
    const [regionCities, setRegionCities] = useState<RegionItem[]>([]);
    const [regionDistricts, setRegionDistricts] = useState<RegionItem[]>([]);
    const [regionVillages, setRegionVillages] = useState<RegionItem[]>([]);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingVillages, setLoadingVillages] = useState(false);

    useEffect(() => {
        fetch('/api/indonesia-regions')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) setRegionProvinces(data);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (formData.province_code) {
            setLoadingCities(true);
            fetch(`/api/indonesia-regions?parent_code=${formData.province_code}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) setRegionCities(data);
                })
                .catch(() => {})
                .finally(() => setLoadingCities(false));
        }
    }, [formData.province_code]);

    useEffect(() => {
        if (formData.city_code) {
            setLoadingDistricts(true);
            fetch(`/api/indonesia-regions?parent_code=${formData.city_code}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) setRegionDistricts(data);
                })
                .catch(() => {})
                .finally(() => setLoadingDistricts(false));
        }
    }, [formData.city_code]);

    useEffect(() => {
        if (formData.district_code) {
            setLoadingVillages(true);
            fetch(`/api/indonesia-regions?parent_code=${formData.district_code}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) setRegionVillages(data);
                })
                .catch(() => {})
                .finally(() => setLoadingVillages(false));
        }
    }, [formData.district_code]);

    const handleProvinceChange = (provCode: string) => {
        const found = regionProvinces.find((p) => p.code === provCode);
        setFormData((prev) => ({
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
                    if (Array.isArray(data)) setRegionCities(data);
                })
                .catch(() => {})
                .finally(() => setLoadingCities(false));
        }
    };

    const handleCitySelectChange = (cityCode: string) => {
        const found = regionCities.find((c) => c.code === cityCode);
        setFormData((prev) => ({
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
                    if (Array.isArray(data)) setRegionDistricts(data);
                })
                .catch(() => {})
                .finally(() => setLoadingDistricts(false));
        }
    };

    const handleDistrictSelectChange = (distCode: string) => {
        const found = regionDistricts.find((d) => d.code === distCode);
        setFormData((prev) => ({
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
                    if (Array.isArray(data)) setRegionVillages(data);
                })
                .catch(() => {})
                .finally(() => setLoadingVillages(false));
        }
    };

    const handleVillageSelectChange = (villCode: string) => {
        const found = regionVillages.find((v) => v.code === villCode);
        setFormData((prev) => ({
            ...prev,
            village_code: villCode,
            village: found ? found.name : '',
            postal_code: found?.postal_code || prev.postal_code,
        }));
    };

    const provinceOptions: SelectSearchOption[] = useMemo(() => {
        return (regionProvinces || []).map((p) => ({
            value: p.code,
            label: p.name,
        }));
    }, [regionProvinces]);

    const cityOptions: SelectSearchOption[] = useMemo(() => {
        return (regionCities || []).map((c) => ({
            value: c.code,
            label: c.name,
        }));
    }, [regionCities]);

    const districtOptions: SelectSearchOption[] = useMemo(() => {
        return (regionDistricts || []).map((d) => ({
            value: d.code,
            label: d.name,
        }));
    }, [regionDistricts]);

    const villageOptions: SelectSearchOption[] = useMemo(() => {
        return (regionVillages || []).map((v) => ({
            value: v.code,
            label: v.name,
            subtitle: v.postal_code ? `Kode Pos: ${v.postal_code}` : undefined,
        }));
    }, [regionVillages]);

    const handleAddChild = () => {
        setFormData((prev) => ({
            ...prev,
            children: [...prev.children, { name: '', nickname: '', birth_date: '', gender: 'male' }],
        }));
    };

    const handleRemoveChild = (index: number) => {
        setFormData((prev) => {
            const nextChildren = prev.children.filter((_, idx) => idx !== index);
            return {
                ...prev,
                children: nextChildren,
            };
        });
    };

    const handleChildChange = (index: number, field: string, value: any) => {
        setFormData((prev) => {
            const nextChildren = [...prev.children];
            nextChildren[index] = { ...nextChildren[index], [field]: value };
            const names = nextChildren.map((c) => c.name).filter(Boolean).join(' & ');
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

    const toggleTag = (tag: string) => {
        setFormData((prev) => {
            const exists = prev.tags.includes(tag);
            return {
                ...prev,
                tags: exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
            };
        });
    };

    const primaryContactInfo = useMemo(() => {
        if (activeCategoryKey === 'wedding' || activeCategoryKey === 'engagement') {
            const isBride = formData.primary_contact === 'cpw' || !formData.primary_contact;
            return {
                name: isBride ? ((categoryData as any).bride_name || formData.bride_name || '-') : ((categoryData as any).groom_name || formData.groom_name || '-'),
                nickname: isBride ? ((categoryData as any).bride_nickname || formData.bride_nickname || '-') : ((categoryData as any).groom_nickname || formData.groom_nickname || '-'),
                occupation: isBride ? ((categoryData as any).bride_occupation || '-') : ((categoryData as any).groom_occupation || '-'),
                instagram: isBride ? ((categoryData as any).bride_instagram || formData.instagram || '-') : ((categoryData as any).groom_instagram || formData.instagram || '-'),
                birth_date: isBride ? ((categoryData as any).bride_birth_date || formData.bride_birth_date || '-') : ((categoryData as any).groom_birth_date || formData.groom_birth_date || '-'),
                role: isBride ? 'CPW' : 'CPP',
            };
        }
        if (activeCategoryKey === 'prewedding') {
            const isP1 = formData.primary_contact === 'cpw' || !formData.primary_contact;
            return {
                name: isP1 ? ((categoryData as any).partner_1 || (categoryData as any).bride_name || '-') : ((categoryData as any).partner_2 || (categoryData as any).groom_name || '-'),
                nickname: isP1 ? ((categoryData as any).partner_1_nickname || '-') : ((categoryData as any).partner_2_nickname || '-'),
                occupation: isP1 ? ((categoryData as any).partner_1_occupation || '-') : ((categoryData as any).partner_2_occupation || '-'),
                instagram: isP1 ? ((categoryData as any).partner_1_instagram || formData.instagram || '-') : ((categoryData as any).partner_2_instagram || formData.instagram || '-'),
                birth_date: isP1 ? ((categoryData as any).partner_1_birth_date || '-') : ((categoryData as any).partner_2_birth_date || '-'),
                role: isP1 ? 'Pasangan 1' : 'Pasangan 2',
            };
        }
        if (activeCategoryKey === 'maternity') {
            const isMom = formData.primary_contact === 'cpw' || !formData.primary_contact;
            return {
                name: isMom ? ((categoryData as any).mom_name || (categoryData as any).mother_name || '-') : ((categoryData as any).partner_name || (categoryData as any).father_name || '-'),
                nickname: '-',
                occupation: isMom ? ((categoryData as any).mom_occupation || '-') : ((categoryData as any).partner_occupation || '-'),
                instagram: isMom ? ((categoryData as any).mom_instagram || formData.instagram || '-') : ((categoryData as any).partner_instagram || formData.instagram || '-'),
                birth_date: '-',
                role: isMom ? 'Ibu Hamil' : 'Pasangan',
            };
        }
        if (activeCategoryKey === 'corporate' || activeCategoryKey === 'komunitas') {
            return {
                name: (categoryData as any).pic_name || (categoryData as any).contact_person || formData.name || '-',
                nickname: '-',
                occupation: (categoryData as any).pic_role || (categoryData as any).pic_position || '-',
                instagram: (categoryData as any).pic_phone || formData.instagram || '-',
                birth_date: '-',
                role: 'PIC / Koordinator',
            };
        }
        if (activeCategoryKey === 'newborn') {
            const isMother = formData.primary_contact === 'mother' || !formData.primary_contact;
            return {
                name: isMother ? ((categoryData as any).mother_name || formData.mother_name || '-') : ((categoryData as any).father_name || formData.father_name || '-'),
                nickname: '-',
                occupation: '-',
                instagram: formData.instagram || '-',
                birth_date: '-',
                role: isMother ? 'Ibu' : 'Ayah',
            };
        }
        return {
            name: (categoryData as any).contact_person || (categoryData as any).client_name || formData.name || '-',
            nickname: '-',
            occupation: (categoryData as any).client_occupation || formData.occupation || '-',
            instagram: (categoryData as any).client_instagram || formData.instagram || '-',
            birth_date: '-',
            role: 'Pemesan / Klien',
        };
    }, [activeCategoryKey, categoryData, formData]);

    // Submit handler
    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        let clientName = formData.name;
        if (activeCategoryKey === 'wedding' || activeCategoryKey === 'engagement' || activeCategoryKey === 'prewedding') {
            const bName = (categoryData as any).bride_name || (categoryData as any).partner_1 || formData.bride_name;
            const gName = (categoryData as any).groom_name || (categoryData as any).partner_2 || formData.groom_name;
            if (bName && gName) {
                clientName = `${bName} & ${gName}`;
            } else if (bName) {
                clientName = bName;
            } else if (gName) {
                clientName = gName;
            }
        } else if (activeCategoryKey === 'corporate' || activeCategoryKey === 'commercial' || activeCategoryKey === 'komunitas') {
            clientName = (categoryData as any).company_name || (categoryData as any).community_name || (categoryData as any).brand_name || formData.company_name || formData.name;
        } else if (activeCategoryKey === 'newborn') {
            clientName = (categoryData as any).child_name || (categoryData as any).baby_name || formData.child_name || formData.name;
        }

        if (!clientName && !formData.name) {
            toast.error('Nama klien wajib diisi');
            return;
        }

        if (!formData.phone.trim()) {
            toast.error('Nomor telepon / WhatsApp wajib diisi');
            return;
        }

        const validChildren = (formData.children || []).filter(
            (c: any) => c && c.name && typeof c.name === 'string' && c.name.trim() !== ''
        );
        const isNewbornCategory = activeCategoryKey === 'newborn' || formData.client_type === 'newborn';
        const childrenPayload = isNewbornCategory && validChildren.length > 0 ? validChildren : null;

        setSubmitting(true);

        router.put(
            `/clients/${client.id}`,
            {
                name: clientName || formData.name,
                client_type: formData.client_type,
                category_id: formData.category_id || null,
                category_data: categoryData,
                partner_name: formData.partner_name || (categoryData as any).groom_name || (categoryData as any).partner_2 || null,
                bride_name: formData.bride_name || (categoryData as any).bride_name || (categoryData as any).partner_1 || null,
                bride_nickname: formData.bride_nickname || (categoryData as any).bride_nickname || null,
                groom_name: formData.groom_name || (categoryData as any).groom_name || (categoryData as any).partner_2 || null,
                groom_nickname: formData.groom_nickname || (categoryData as any).groom_nickname || null,
                bride_birth_date: formData.bride_birth_date || (categoryData as any).bride_birth_date || null,
                groom_birth_date: formData.groom_birth_date || (categoryData as any).groom_birth_date || null,
                child_name: formData.child_name || (categoryData as any).child_name || (categoryData as any).baby_name || null,
                child_birth_date: formData.child_birth_date || (categoryData as any).child_birth_date || (categoryData as any).birth_date || null,
                child_gender: formData.child_gender || (categoryData as any).child_gender || (categoryData as any).gender || null,
                father_name: formData.father_name || (categoryData as any).father_name || null,
                mother_name: formData.mother_name || (categoryData as any).mother_name || (categoryData as any).mom_name || null,
                children: childrenPayload,
                company_name: formData.company_name || (categoryData as any).company_name || (categoryData as any).community_name || (categoryData as any).brand_name || null,
                email: formData.email || null,
                instagram: formData.instagram || (categoryData as any).bride_instagram || (categoryData as any).instagram || null,
                partner_instagram: formData.partner_instagram || (categoryData as any).groom_instagram || null,
                phone: formData.phone,
                secondary_phone: formData.secondary_phone || null,
                preferred_contact: formData.preferred_contact,
                primary_contact: formData.primary_contact,
                province: formData.province || null,
                province_code: formData.province_code || null,
                city: formData.city || null,
                city_code: formData.city_code || null,
                district: formData.district || null,
                district_code: formData.district_code || null,
                village: formData.village || null,
                village_code: formData.village_code || null,
                postal_code: formData.postal_code || null,
                address: formData.address || null,
                contact_person: formData.contact_person || (categoryData as any).contact_person || null,
                occupation: formData.occupation || (categoryData as any).occupation || null,
                other_social_media: formData.other_social_media || null,
                source: formData.source,
                client_source_id: formData.client_source_id || null,
                referred_by_client_id: formData.referred_by_client_id || null,
                wedding_organizer_id: formData.wedding_organizer_id || null,
                referral_name: formData.referral_name || null,
                status: formData.status,
                notes: formData.notes || null,
                tags: formData.tags || [],
                event_type: formData.event_type || null,
                event_date: formData.event_date || null,
                event_time: formData.event_time || null,
                event_location: formData.event_location || null,
                package_id: formData.package_id || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Data klien berhasil diperbarui!');
                },
                onError: (errors) => {
                    setFormErrors(errors as Record<string, string>);
                    toast.error('Gagal memperbarui data klien. Periksa kembali isian formulir.');
                },
                onFinish: () => setSubmitting(false),
            }
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-16">
            <Head title={`Edit Klien: ${client.name}`} />

            {/* TOP HEADER */}
            <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/clients/${client.id}`}
                            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-2xs"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                                    Edit Klien: {client.name}
                                </h1>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C89445]/10 text-[#C89445] border border-[#C89445]/20">
                                    {activeCategory.name}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                Perbarui data kategori, kontak, alamat, paket, dan rincian acara klien.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={`/clients/${client.id}`}
                            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                        >
                            Batal
                        </Link>
                        {currentStep < 4 ? (
                            <button
                                type="button"
                                onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
                                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>Lanjut: {steps[currentStep]?.title || 'Langkah Berikutnya'}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleSubmit()}
                                disabled={submitting}
                                className="px-5 py-2 rounded-xl bg-[#C89445] hover:bg-[#b38136] text-white font-bold text-xs transition-all shadow-xs hover:scale-[1.02] cursor-pointer disabled:opacity-50 flex items-center gap-2"
                            >
                                {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT CONTAINER */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
                {/* STEPPER HEADER (4 Connected Steps matching /form-klien & Index) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-2xs">
                    <div className="relative pb-2">
                        {/* Connecting background line */}
                        <div
                            className="absolute top-[18px] -translate-y-1/2 h-[2px] bg-slate-200 z-0 pointer-events-none"
                            style={{
                                left: `calc(100% / ${steps.length * 2})`,
                                right: `calc(100% / ${steps.length * 2})`,
                            }}
                        >
                            {/* Active progress fill line */}
                            <div
                                className="h-full transition-all duration-300 ease-in-out bg-[#C89445]"
                                style={{
                                    width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                                }}
                            />
                        </div>

                        <div className="flex items-start justify-between relative z-10">
                            {steps.map((s) => {
                                const isDone = currentStep > s.number;
                                const isCurrent = currentStep === s.number;
                                return (
                                    <div key={s.number} className="flex-1 flex flex-col items-center text-center px-1">
                                        <div className="relative flex items-center justify-center mb-1.5">
                                            <button
                                                type="button"
                                                onClick={() => (isDone ? setCurrentStep(s.number) : null)}
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
                </div>

                {/* FORM BODY CONTAINER */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* STEP 1: INFORMASI AWAL & DETAIL KLIEN */}
                    {currentStep === 1 && (
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

                            {/* Kategori Project Selection */}
                            <div className="border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-2xs bg-white">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                        <Tag className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Kategori Layanan / Project
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Pilih kategori untuk menyesuaikan formulir isian detail secara dinamis.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Pilih Kategori <span className="text-red-500">*</span>
                                    </label>
                                    <SelectSearch
                                        options={categorySelectOptions}
                                        value={formData.category_id}
                                        onChange={(val) => {
                                            const cat = categories.find((c) => String(c.id) === String(val));
                                            setFormData({
                                                ...formData,
                                                category_id: val,
                                                client_type: cat?.slug || formData.client_type,
                                            });
                                        }}
                                        placeholder="Pilih Kategori Project..."
                                        searchPlaceholder="Cari kategori..."
                                        clearable={false}
                                        className="w-full bg-white"
                                    />
                                </div>
                            </div>

                            {/* Dynamic Category Specific Form Fields */}
                            <div className="border border-slate-200/80 rounded-2xl p-5 shadow-2xs bg-white">
                                <CategorySpecificForm
                                    categoryKey={activeCategoryKey}
                                    data={categoryData}
                                    onChange={handleCategoryDataChange}
                                    errors={formErrors}
                                />
                            </div>

                            {/* Extra Newborn multiple children manager if newborn */}
                            {activeCategoryKey === 'newborn' && (
                                <div className="border border-amber-200/80 bg-amber-50/40 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Baby className="w-4 h-4 text-amber-700" />
                                            <h4 className="text-xs font-bold text-amber-950">Daftar Bayi / Anak (Mendukung Kembar)</h4>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddChild}
                                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Tambah Bayi Kembar</span>
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {(formData.children || []).map((child, idx) => (
                                            <div key={idx} className="p-3.5 bg-white rounded-xl border border-amber-200 space-y-2.5">
                                                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                                                    <span className="text-xs font-bold text-slate-800">Bayi #{idx + 1}</span>
                                                    {(formData.children || []).length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveChild(idx)}
                                                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            <span>Hapus</span>
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Bayi</label>
                                                        <input
                                                            type="text"
                                                            value={child.name}
                                                            onChange={(e) => handleChildChange(idx, 'name', e.target.value)}
                                                            placeholder="Nama lengkap bayi"
                                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal Lahir / HPL</label>
                                                        <input
                                                            type="date"
                                                            value={child.birth_date}
                                                            onChange={(e) => handleChildChange(idx, 'birth_date', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Jenis Kelamin</label>
                                                        <select
                                                            value={child.gender}
                                                            onChange={(e) => handleChildChange(idx, 'gender', e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445]"
                                                        >
                                                            <option value="male">Laki-laki</option>
                                                            <option value="female">Perempuan</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: INFORMASI ALAMAT & KONTAK */}
                    {currentStep === 2 && (
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

                            {/* Regional Cascading Address */}
                            <div className="border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-2xs bg-white">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Wilayah Domisili / Alamat Klien
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Pilih Provinsi, Kota, Kecamatan, dan Kelurahan Indonesia secara bertingkat.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Provinsi <span className="text-red-500">*</span>
                                        </label>
                                        <SelectSearch
                                            options={provinceOptions}
                                            value={formData.province_code}
                                            onChange={handleProvinceChange}
                                            placeholder="Pilih Provinsi..."
                                            searchPlaceholder="Cari provinsi..."
                                            clearable={false}
                                            className="w-full bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Kota / Kabupaten <span className="text-red-500">*</span>
                                        </label>
                                        <SelectSearch
                                            options={cityOptions}
                                            value={formData.city_code}
                                            onChange={handleCitySelectChange}
                                            placeholder={loadingCities ? 'Memuat kota...' : 'Pilih Kota...'}
                                            searchPlaceholder="Cari kota/kabupaten..."
                                            disabled={!formData.province_code || loadingCities}
                                            clearable={false}
                                            className="w-full bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Kecamatan
                                        </label>
                                        <SelectSearch
                                            options={districtOptions}
                                            value={formData.district_code}
                                            onChange={handleDistrictSelectChange}
                                            placeholder={loadingDistricts ? 'Memuat kecamatan...' : 'Pilih Kecamatan...'}
                                            searchPlaceholder="Cari kecamatan..."
                                            disabled={!formData.city_code || loadingDistricts}
                                            clearable={false}
                                            className="w-full bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Kelurahan / Desa
                                        </label>
                                        <SelectSearch
                                            options={villageOptions}
                                            value={formData.village_code}
                                            onChange={handleVillageSelectChange}
                                            placeholder={loadingVillages ? 'Memuat kelurahan...' : 'Pilih Kelurahan...'}
                                            searchPlaceholder="Cari kelurahan/desa..."
                                            disabled={!formData.district_code || loadingVillages}
                                            clearable={false}
                                            className="w-full bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 pt-1">
                                    <div className="sm:col-span-3">
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Alamat Lengkap (Jalan, No. Rumah, RT/RW, Patokan)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Jl. Melati No. 12, RT 02 / RW 05"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Kode Pos
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.postal_code}
                                            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                            placeholder="12345"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Kontak & Live Preview */}
                            <div className="border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-2xs bg-white">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Kontak Utama &amp; Komunikasi
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Pilih kontak utama dan lengkapi kontak komunikasi WhatsApp / Email.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    <div className="lg:col-span-6 space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                Pilih Kontak Utama <span className="text-red-500">*</span>
                                            </label>
                                            <NativeSelect
                                                value={formData.primary_contact}
                                                onChange={(e) => setFormData({ ...formData, primary_contact: e.target.value })}
                                            >
                                                {activeCategoryKey === 'wedding' || activeCategoryKey === 'engagement' ? (
                                                    <>
                                                        <option value="cpw">Calon Pengantin Wanita (CPW) — {(categoryData as any).bride_name || formData.bride_name || 'CPW'}</option>
                                                        <option value="cpp">Calon Pengantin Pria (CPP) — {(categoryData as any).groom_name || formData.groom_name || 'CPP'}</option>
                                                    </>
                                                ) : activeCategoryKey === 'prewedding' ? (
                                                    <>
                                                        <option value="cpw">Pasangan 1 — {(categoryData as any).partner_1 || formData.bride_name || 'Pasangan 1'}</option>
                                                        <option value="cpp">Pasangan 2 — {(categoryData as any).partner_2 || formData.groom_name || 'Pasangan 2'}</option>
                                                    </>
                                                ) : activeCategoryKey === 'maternity' ? (
                                                    <>
                                                        <option value="cpw">Ibu Hamil — {(categoryData as any).mom_name || formData.mother_name || 'Ibu Hamil'}</option>
                                                        <option value="cpp">Pasangan / Ayah — {(categoryData as any).partner_name || formData.father_name || 'Pasangan'}</option>
                                                    </>
                                                ) : activeCategoryKey === 'corporate' ? (
                                                    <option value="pic">PIC Perusahaan — {(categoryData as any).pic_name || 'PIC'}</option>
                                                ) : activeCategoryKey === 'komunitas' ? (
                                                    <option value="pic">PIC Komunitas — {(categoryData as any).pic_name || 'PIC'}</option>
                                                ) : activeCategoryKey === 'newborn' ? (
                                                    <>
                                                        <option value="mother">Ibu — {(categoryData as any).mother_name || formData.mother_name || 'Ibu'}</option>
                                                        <option value="cpp">Ayah — {(categoryData as any).father_name || formData.father_name || 'Ayah'}</option>
                                                    </>
                                                ) : (
                                                    <option value="client">Pemesan — {(categoryData as any).contact_person || formData.name || 'Pemesan'}</option>
                                                )}
                                            </NativeSelect>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
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

                                    <div className="lg:col-span-6 bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-3">
                                        <div className="flex items-center gap-1.5 text-slate-800 text-xs font-bold pb-2 border-b border-slate-200/60">
                                            <span>Data Kontak (Terisi Otomatis)</span>
                                            <Info className="w-3.5 h-3.5 text-slate-400" />
                                        </div>

                                        <div className="space-y-2.5 text-xs">
                                            <div className="flex justify-between py-1 border-b border-slate-100">
                                                <span className="text-slate-400">Nama Lengkap</span>
                                                <span className="font-semibold text-slate-800 text-right">
                                                    {primaryContactInfo.name} ({primaryContactInfo.role})
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-slate-100">
                                                <span className="text-slate-400">Pekerjaan</span>
                                                <span className="font-semibold text-slate-800 text-right">
                                                    {primaryContactInfo.occupation}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-slate-100">
                                                <span className="text-slate-400">No. WhatsApp</span>
                                                <span className="font-semibold text-slate-800 text-right">
                                                    {formData.phone || '-'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-slate-100">
                                                <span className="text-slate-400">Akun Instagram</span>
                                                <span className="font-semibold text-slate-800 text-right">
                                                    {primaryContactInfo.instagram}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-slate-100">
                                                <span className="text-slate-400">Email</span>
                                                <span className="font-semibold text-slate-800 text-right">
                                                    {formData.email || '-'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-1">
                                                <span className="text-slate-400">Social Media Lain</span>
                                                <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">
                                                    {formData.other_social_media || '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: INFORMASI ACARA/PROJECT & MANAJEMEN */}
                    {currentStep === 3 && (
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
                            <div className="border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-2xs bg-white">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Detail Acara &amp; Paket Photography
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Lengkapi detail jadwal, paket, tempat pelaksanaan, dan tema acara.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Kategori Project
                                        </label>
                                        <SelectSearch
                                            options={categorySelectOptions}
                                            value={String(formData.category_id || activeCategory?.id)}
                                            onChange={(val) => {
                                                const cat = categories.find((c) => String(c.id) === String(val));
                                                setFormData({
                                                    ...formData,
                                                    category_id: val,
                                                    client_type: cat?.slug || formData.client_type,
                                                });
                                            }}
                                            placeholder="Pilih kategori project"
                                            searchPlaceholder="Cari kategori..."
                                            clearable={false}
                                            className="w-full bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Pilihan Paket (Opsional)
                                        </label>
                                        <SelectSearch
                                            options={[
                                                ...filteredPackages.map((p: any) => ({
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

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
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

                                <div className={`grid grid-cols-1 ${activeCategoryKey === 'wedding' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
                                    {activeCategoryKey === 'wedding' && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                            <div className="border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-2xs bg-white">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Manajemen Klien &amp; Catatan Khusus
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Atur status, sumber perolehan klien, dan tautan referensi moodboard.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Sumber Klien (Lead Source) <span className="text-red-500">*</span>
                                        </label>
                                        {client_sources.length > 0 ? (
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
                                                        {cs.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                value={formData.source || ''}
                                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                                placeholder="Contoh: Instagram, Referral, Walk-in"
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all"
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                                                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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
                                                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445]"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddCustomTag}
                                                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                                            >
                                                Tambah Tag
                                            </button>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Permintaan Khusus &amp; Catatan Acara
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            placeholder="Contoh: Klien menginginkan pencahayaan natural warm tone, fokus foto candid keluarga, dll."
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#C89445]/20 focus:border-[#C89445] transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: RINGKASAN & KONFIRMASI */}
                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in fade-in duration-200">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Ringkasan &amp; Konfirmasi Data Klien
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Silakan tinjau kembali data yang telah diisi sebelum menyimpan perubahan data.
                                </p>
                            </div>

                            {/* Blue Info Alert */}
                            <div className="bg-indigo-50/70 border border-indigo-100/90 rounded-2xl p-4 flex items-center gap-3 text-xs text-indigo-900">
                                <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                                <span>
                                    <strong>Pastikan semua data sudah benar.</strong> Periksa kembali data profil, kontak, dan detail acara sebelum menyimpan perubahan data.
                                </span>
                            </div>

                            {/* CARD 1: DETAIL KATEGORI & PROFIL */}
                            <div className="border border-slate-200/80 rounded-2xl p-5 space-y-4 bg-white shadow-2xs">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                            <Bookmark className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900">
                                            Profil Kategori: {activeCategory?.name}
                                        </h4>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(1)}
                                        className="text-xs font-bold text-[#C89445] hover:underline cursor-pointer"
                                    >
                                        Ubah Data
                                    </button>
                                </div>

                                <CategorySpecificView
                                    project={{
                                        category: {
                                            name: activeCategory?.name || 'Wedding',
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
                            <div className="border border-slate-200/80 rounded-2xl p-5 space-y-4 bg-white shadow-2xs">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900">
                                            Informasi Alamat &amp; Kontak Utama
                                        </h4>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(2)}
                                        className="text-xs font-bold text-[#C89445] hover:underline cursor-pointer"
                                    >
                                        Ubah Alamat / Kontak
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div className="p-3.5 bg-slate-50/70 rounded-xl space-y-1">
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

                                    <div className="p-3.5 bg-slate-50/70 rounded-xl space-y-1">
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

                                <div className="p-3.5 bg-slate-50/70 rounded-xl text-xs space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Alamat Lengkap
                                    </span>
                                    <p className="text-slate-800 font-medium leading-relaxed">
                                        {formData.address || 'Belum diisi.'}
                                    </p>
                                </div>
                            </div>

                            {/* CARD 3: ACARA & MANAJEMEN */}
                            <div className="border border-slate-200/80 rounded-2xl p-5 space-y-4 bg-white shadow-2xs">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900">
                                            Detail Acara, Paket &amp; Status
                                        </h4>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(3)}
                                        className="text-xs font-bold text-[#C89445] hover:underline cursor-pointer"
                                    >
                                        Ubah Acara
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
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

                                {formData.notes && (
                                    <div className="p-3.5 bg-slate-50/70 rounded-xl text-xs space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                            Catatan Khusus
                                        </span>
                                        <p className="text-slate-800 leading-relaxed">{formData.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* BOTTOM NAVIGATION FOOTER BAR */}
                    <div className="flex items-center justify-between pt-4 pb-12 border-t border-slate-200">
                        {currentStep > 1 ? (
                            <button
                                type="button"
                                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Sebelumnya: {steps[currentStep - 2]?.title}</span>
                            </button>
                        ) : (
                            <div />
                        )}

                        <div className="flex items-center gap-2">
                            {currentStep < 4 ? (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
                                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                    <span>Lanjut: {steps[currentStep]?.title || 'Langkah Berikutnya'}</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleSubmit()}
                                    disabled={submitting}
                                    className="px-8 py-2.5 rounded-xl bg-[#C89445] hover:bg-[#b38136] text-white font-bold text-xs transition-all shadow-xs hover:scale-[1.02] cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting ? 'Menyimpan...' : 'Simpan Perubahan Data'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
