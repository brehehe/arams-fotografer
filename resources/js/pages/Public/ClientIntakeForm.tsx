import React, { useState, useEffect, useMemo } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import confetti from 'canvas-confetti';
import {
    Calendar,
    MapPin,
    Phone,
    Mail,
    Instagram,
    User,
    ArrowRight,
    ArrowLeft,
    Send,
    Edit2,
    FileText,
    Info,
    Check,
    ExternalLink,
    Bookmark,
    Loader2,
    Baby,
    Heart,
    Sparkles,
    Plus,
    Trash2,
    Users,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { SelectSearch, type SelectSearchOption } from '@/components/ui/select-search';
import { NativeSelect } from '@/components/ui/native-select';
import { CategorySpecificForm } from '@/components/projects/CategorySpecificForm';
import { CategorySpecificView } from '@/components/projects/CategorySpecificView';
import {
    CategoryFormKey,
    resolveCategoryKey,
    AnyCategorySpecificData,
} from '@/types/category-forms';

export interface ChildItem {
    [key: string]: string;
    name: string;
    nickname: string;
    birth_date: string;
    gender: string;
}

interface CategoryItem {
    id: string;
    name: string;
    slug?: string;
    description?: string;
    color?: string;
    form_type?: string;
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
    pic_name?: string;
    phone?: string;
    city?: string;
    tier?: string;
}

interface RegionItem {
    code: string;
    name: string;
    postal_code?: string;
}

interface ClientIntakeFormProps {
    categories: CategoryItem[];
    packages: PackageItem[];
    wedding_organizers: WeddingOrganizerItem[];
    all_clients?: Array<{
        id: string;
        name: string;
        phone?: string;
        city?: string;
        bride_name?: string;
        groom_name?: string;
    }>;
    company?: {
        name: string;
        phone: string;
        email: string;
        instagram: string;
        address: string;
        website: string;
    };
    form_status?: 'open' | 'closed';
    intake_closed_message?: string;
    intake_form_title?: string;
    intake_form_subtitle?: string;
    intake_notes?: string;
    theme?: {
        primary_color?: string;
        bg_color?: string;
        card_bg?: string;
        sidebar_bg?: string;
        text_color?: string;
    };
}

const DEFAULT_INDONESIA_PROVINCES: RegionItem[] = [
    { code: '31', name: 'DKI JAKARTA' },
    { code: '32', name: 'JAWA BARAT' },
    { code: '33', name: 'JAWA TENGAH' },
    { code: '34', name: 'DAERAH ISTIMEWA YOGYAKARTA' },
    { code: '35', name: 'JAWA TIMUR' },
    { code: '36', name: 'BANTEN' },
    { code: '51', name: 'BALI' },
    { code: '52', name: 'NUSA TENGGARA BARAT' },
    { code: '53', name: 'NUSA TENGGARA TIMUR' },
    { code: '11', name: 'ACEH' },
    { code: '12', name: 'SUMATERA UTARA' },
    { code: '13', name: 'SUMATERA BARAT' },
    { code: '14', name: 'RIAU' },
    { code: '15', name: 'JAMBI' },
    { code: '16', name: 'SUMATERA SELATAN' },
    { code: '17', name: 'BENGKULU' },
    { code: '18', name: 'LAMPUNG' },
    { code: '19', name: 'KEPULAUAN BANGKA BELITUNG' },
    { code: '21', name: 'KEPULAUAN RIAU' },
    { code: '61', name: 'KALIMANTAN BARAT' },
    { code: '62', name: 'KALIMANTAN TENGAH' },
    { code: '63', name: 'KALIMANTAN SELATAN' },
    { code: '64', name: 'KALIMANTAN TIMUR' },
    { code: '65', name: 'KALIMANTAN UTARA' },
    { code: '71', name: 'SULAWESI UTARA' },
    { code: '72', name: 'SULAWESI TENGAH' },
    { code: '73', name: 'SULAWESI SELATAN' },
    { code: '74', name: 'SULAWESI TENGGARA' },
    { code: '75', name: 'GORONTALO' },
    { code: '76', name: 'SULAWESI BARAT' },
    { code: '81', name: 'MALUKU' },
    { code: '82', name: 'MALUKU UTARA' },
    { code: '91', name: 'PAPUA' },
    { code: '92', name: 'PAPUA BARAT' },
    { code: '93', name: 'PAPUA SELATAN' },
    { code: '94', name: 'PAPUA TENGAH' },
    { code: '95', name: 'PAPUA PEGUNUNGAN' },
    { code: '96', name: 'PAPUA BARAT DAYA' },
];

export default function ClientIntakeForm({
    categories = [],
    packages = [],
    wedding_organizers = [],
    company = {
        name: 'Arams Pictures',
        phone: '081234567890',
        email: 'hello@arams.id',
        instagram: '@aramspictures',
        address: 'Surabaya, Jawa Timur',
        website: 'www.aramspictures.com',
    },
    form_status = 'open',
    intake_closed_message = 'Mohon maaf, saat ini pendaftaran booking baru sedang ditutup sementara.',
    intake_form_title = 'Form Data Diri Client',
    intake_form_subtitle = 'Silakan lengkapi data diri Anda dengan benar. Data ini akan digunakan untuk keperluan pemesanan dan administrasi.',
    intake_notes = '',
    theme = {
        primary_color: '#4F46E5',
        bg_color: '#090C15',
        card_bg: '#FFFFFF',
        sidebar_bg: '#0F1424',
        text_color: '#0F172A',
    },
}: ClientIntakeFormProps) {
    const pageProps = usePage().props as any;
    const { flash } = pageProps;
    const intakeSuccess = flash?.intake_success || flash?.success;

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Specific category form data across all 14 categories
    const [categoryData, setCategoryData] = useState<AnyCategorySpecificData>({});

    const handleCategoryDataChange = (field: string, value: any) => {
        setCategoryData((prev) => {
            const next = { ...prev, [field]: value };
            // Auto-sync event date and location with core form fields
            if (field === 'session_date' || field === 'akad_date' || field === 'event_date' || field === 'departure_date') {
                if (value) {
                    setFormData((f) => ({ ...f, event_date: value }));
                }
            }
            if (field === 'session_location' || field === 'location' || field === 'akad_location' || field === 'event_location' || field === 'destination_city_country') {
                if (value) {
                    setFormData((f) => ({ ...f, location: value }));
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

    // Form Data State matching 4 steps
    const [formData, setFormData] = useState({
        // DATA KATEGORI PROYEK (Langkah Awal)
        category_id: categories.find((c) => c.slug === 'wedding' || c.name.toLowerCase().includes('wedding'))?.id || categories[0]?.id || '',

        // STEP 1: Identitas Klien / Data Diri
        // 1.1 Data Diri Umum / Standar
        name: '',
        nickname: '',
        company_name: '',
        occupation: '',
        instagram: '',
        birth_date: '',

        // 1.2 Data Bayi / Anak (Newborn)
        child_name: '',
        child_nickname: '',
        child_birth_date: '',
        child_gender: 'Laki-laki',
        father_name: '',
        mother_name: '',
        parent_names: '',
        parent_occupation: '',
        parent_instagram: '',
        children: [
            { name: '', nickname: '', birth_date: '', gender: 'Laki-laki' },
        ] as ChildItem[],

        // 1.3 Data CPP & CPW (Pernikahan)
        // CPP (Calon Pengantin Pria)
        groom_name: '',
        groom_nickname: '',
        groom_occupation: '',
        groom_birth_date: '',
        groom_instagram: '',

        // CPW (Calon Pengantin Wanita)
        bride_name: '',
        bride_nickname: '',
        bride_occupation: '',
        bride_birth_date: '',
        bride_instagram: '',

        // STEP 2: Informasi Alamat & Kontak
        // Alamat
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

        // Kontak Utama
        primary_contact: 'cpw' as string,
        phone: '',
        email: '',
        other_social_media: '',

        // STEP 3: Informasi Acara/Project & Informasi Tambahan
        event_type: 'Pernikahan',
        package_id: packages[0]?.id || '',
        event_date: '',
        event_time: '',
        location: '',
        reception_location: '',
        estimated_guests: '',
        concept_theme: '',
        other_vendors: '',
        project_notes: '',

        // Informasi Tambahan
        reference_url: '',
        special_requests: '',
    });

    // Regional cascading dropdown options
    const [regionProvinces, setRegionProvinces] = useState<RegionItem[]>(DEFAULT_INDONESIA_PROVINCES);
    const [regionCities, setRegionCities] = useState<RegionItem[]>([]);
    const [regionDistricts, setRegionDistricts] = useState<RegionItem[]>([]);
    const [regionVillages, setRegionVillages] = useState<RegionItem[]>([]);

    // Fetch all provinces from DB on mount
    useEffect(() => {
        fetch('/api/regions/provinces')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    setRegionProvinces(data);
                }
            })
            .catch(() => {}); // fallback stays as DEFAULT_INDONESIA_PROVINCES
    }, []);

    // Fetch cities when province_code changes
    useEffect(() => {
        if (formData.province_code) {
            setRegionCities([]);
            setRegionDistricts([]);
            setRegionVillages([]);
            fetch(`/api/regions/children?parent_code=${formData.province_code}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) setRegionCities(data);
                })
                .catch(() => {});
        }
    }, [formData.province_code]);

    // Fetch districts when city_code changes
    useEffect(() => {
        if (formData.city_code) {
            setRegionDistricts([]);
            setRegionVillages([]);
            fetch(`/api/regions/children?parent_code=${formData.city_code}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) setRegionDistricts(data);
                })
                .catch(() => {});
        }
    }, [formData.city_code]);

    // Fetch villages when district_code changes
    useEffect(() => {
        if (formData.district_code) {
            setRegionVillages([]);
            fetch(`/api/regions/children?parent_code=${formData.district_code}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) setRegionVillages(data);
                })
                .catch(() => {});
        }
    }, [formData.district_code]);

    // Load draft if saved previously
    useEffect(() => {
        try {
            const savedDraft = localStorage.getItem('arams_intake_draft');
            if (savedDraft) {
                const parsed = JSON.parse(savedDraft);
                if (parsed && typeof parsed === 'object') {
                    if (!parsed.children || !Array.isArray(parsed.children) || parsed.children.length === 0) {
                        parsed.children = [
                            {
                                name: parsed.child_name || '',
                                nickname: parsed.child_nickname || '',
                                birth_date: parsed.child_birth_date || '',
                                gender: parsed.child_gender || 'Laki-laki',
                            },
                        ];
                    }
                    if (parsed.category_data && typeof parsed.category_data === 'object') {
                        setCategoryData(parsed.category_data);
                    }
                    setFormData((prev) => ({ ...prev, ...parsed }));
                }
            }
        } catch {
            // ignore
        }
    }, []);

    useEffect(() => {
        if (intakeSuccess) {
            setShowSuccessModal(true);
            try {
                confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.5 },
                });
            } catch {
                // ignore
            }
        }
    }, [intakeSuccess]);

    // Computed primary contact details for Step 2 preview
    const selectedCategory = useMemo(() => {
        return (
            categories.find((c) => String(c.id) === String(formData.category_id) || c.slug === formData.category_id) ||
            categories[0] || {
                id: 'wedding',
                name: 'Wedding',
                form_type: 'wedding',
            }
        );
    }, [categories, formData.category_id]);

    const activeCategoryKey: CategoryFormKey = useMemo(() => {
        return resolveCategoryKey(selectedCategory);
    }, [selectedCategory]);

    const formType = (selectedCategory as any)?.form_type || activeCategoryKey;

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

        return categories.map((c) => {
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
        handleFieldChange('category_id', val);
        const cat = categories.find((c) => String(c.id) === String(val) || c.slug === val);
        handleFieldChange('event_type', cat?.name || 'Dokumentasi');

        // Auto select first package of new category if current package does not belong
        const availablePkgs = packages.filter((p) => String(p.category_id) === String(val));
        if (availablePkgs.length > 0) {
            const currentPkgExists = availablePkgs.some((p) => String(p.id) === String(formData.package_id));
            if (!currentPkgExists) {
                handleFieldChange('package_id', String(availablePkgs[0].id));
            }
        }
    };

    const primaryContactInfo = useMemo(() => {
        if (activeCategoryKey === 'wedding' || activeCategoryKey === 'engagement') {
            const isCpw = formData.primary_contact === 'cpw';
            const name = isCpw
                ? (categoryData.bride_name || formData.bride_name || '-')
                : (categoryData.groom_name || formData.groom_name || '-');
            return {
                name,
                nickname: isCpw
                    ? (categoryData.bride_nickname || formData.bride_nickname || '-')
                    : (categoryData.groom_nickname || formData.groom_nickname || '-'),
                occupation: isCpw
                    ? (categoryData.bride_occupation || formData.bride_occupation || '-')
                    : (categoryData.groom_occupation || formData.groom_occupation || '-'),
                instagram: isCpw
                    ? (categoryData.bride_instagram || formData.bride_instagram || '-')
                    : (categoryData.groom_instagram || formData.groom_instagram || '-'),
                birth_date: isCpw
                    ? (categoryData.bride_birth_date || formData.bride_birth_date || '-')
                    : (categoryData.groom_birth_date || formData.groom_birth_date || '-'),
                role: isCpw ? 'CPW' : 'CPP',
            };
        }
        if (activeCategoryKey === 'prewedding') {
            const isP1 = formData.primary_contact === 'p1' || formData.primary_contact === 'cpw';
            const name = isP1
                ? (categoryData.partner_1 || categoryData.bride_name || '-')
                : (categoryData.partner_2 || categoryData.groom_name || '-');
            return {
                name,
                nickname: '-',
                occupation: '-',
                instagram: '-',
                birth_date: '-',
                role: isP1 ? 'Pasangan 1' : 'Pasangan 2',
            };
        }
        if (activeCategoryKey === 'maternity') {
            const isPartner = formData.primary_contact === 'partner' || formData.primary_contact === 'cpp';
            const name = isPartner
                ? (categoryData.partner_name || categoryData.father_name || '-')
                : (categoryData.mom_name || categoryData.mother_name || '-');
            return {
                name,
                nickname: '-',
                occupation: '-',
                instagram: '-',
                birth_date: '-',
                role: isPartner ? 'Ayah / Pasangan' : 'Ibu Hamil',
            };
        }
        if (activeCategoryKey === 'family') {
            const choice = formData.primary_contact;
            const name = choice === 'mother'
                ? (categoryData.mother_name || '-')
                : choice === 'family'
                ? (categoryData.family_name || '-')
                : (categoryData.father_name || categoryData.family_name || '-');
            const role = choice === 'mother' ? 'Ibu' : choice === 'family' ? 'Keluarga' : 'Ayah';
            return {
                name,
                nickname: '-',
                occupation: '-',
                instagram: '-',
                birth_date: '-',
                role,
            };
        }
        if (activeCategoryKey === 'corporate') {
            return {
                name: categoryData.pic_name || categoryData.company_name || formData.name || '-',
                nickname: '-',
                occupation: categoryData.company_name || '-',
                instagram: '-',
                birth_date: '-',
                role: 'PIC Perusahaan',
            };
        }
        if (activeCategoryKey === 'komunitas') {
            return {
                name: categoryData.pic_name || categoryData.community_name || formData.name || '-',
                nickname: '-',
                occupation: categoryData.community_name || '-',
                instagram: '-',
                birth_date: '-',
                role: 'PIC Komunitas',
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
                ? (categoryData.father_name || formData.father_name || formData.parent_names || 'Ayah')
                : (categoryData.mother_name || formData.mother_name || formData.parent_names || 'Ibu');
            const firstBabyName = categoryData.babies?.[0]?.name || categoryData.baby_name || formData.child_name || '-';
            const firstBabyBirthDate = categoryData.babies?.[0]?.birth_date || categoryData.baby_birth_date || formData.child_birth_date || '-';
            return {
                name: parentName,
                nickname: firstBabyName,
                occupation: formData.parent_occupation || '-',
                instagram: formData.parent_instagram || formData.instagram || '-',
                birth_date: firstBabyBirthDate,
                role: isFather ? 'Ayah' : 'Ibu',
            };
        }

        return {
            name: categoryData.contact_person || formData.name || '-',
            nickname: formData.nickname || '-',
            occupation: formData.occupation || '-',
            instagram: formData.instagram || '-',
            birth_date: formData.birth_date || '-',
            role: 'Pemesan',
        };
    }, [
        activeCategoryKey,
        formData.primary_contact,
        formData.name,
        formData.nickname,
        formData.occupation,
        formData.birth_date,
        formData.child_name,
        formData.child_nickname,
        formData.child_birth_date,
        formData.father_name,
        formData.mother_name,
        formData.parent_names,
        formData.parent_occupation,
        formData.parent_instagram,
        formData.bride_name,
        formData.bride_nickname,
        formData.bride_occupation,
        formData.bride_instagram,
        formData.bride_birth_date,
        formData.groom_name,
        formData.groom_nickname,
        formData.groom_occupation,
        formData.groom_instagram,
        formData.groom_birth_date,
        formData.instagram,
        categoryData,
    ]);

    const availablePackages = useMemo(() => {
        const catId = String(selectedCategory.id);
        const filtered = packages.filter((p) => String(p.category_id) === catId);
        return filtered.length > 0 ? filtered : packages;
    }, [packages, selectedCategory]);

    const selectedPackage = useMemo(() => {
        return packages.find((p) => p.id === formData.package_id) || availablePackages[0];
    }, [packages, formData.package_id, availablePackages]);

    const handleFieldChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddChild = () => {
        setFormData((prev) => {
            const nextChildren = [
                ...prev.children,
                { name: '', nickname: '', birth_date: '', gender: 'Laki-laki' },
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

    const handleRemoveChild = (index: number) => {
        setFormData((prev) => {
            if (prev.children.length <= 1) return prev;
            const nextChildren = prev.children.filter((_, i) => i !== index);
            const names = nextChildren.map((c) => c.name.trim()).filter(Boolean).join(' & ');
            const isTwin = nextChildren.length > 1;
            return {
                ...prev,
                children: nextChildren,
                child_name: isTwin && names ? `${names} (Kembar)` : names,
                child_nickname: nextChildren.map((c) => c.nickname.trim()).filter(Boolean).join(' & '),
                child_birth_date: nextChildren[0]?.birth_date || '',
                child_gender: nextChildren[0]?.gender || 'Laki-laki',
            };
        });
    };

    const handleChildChange = (index: number, field: keyof ChildItem, value: string) => {
        setFormData((prev) => {
            const nextChildren = prev.children.map((child, i) =>
                i === index ? { ...child, [field]: value } : child
            );
            const names = nextChildren.map((c) => c.name.trim()).filter(Boolean).join(' & ');
            const isTwin = nextChildren.length > 1;
            return {
                ...prev,
                children: nextChildren,
                child_name: isTwin && names ? `${names} (Kembar)` : names,
                child_nickname: nextChildren.map((c) => c.nickname.trim()).filter(Boolean).join(' & '),
                child_birth_date: nextChildren[0]?.birth_date || prev.child_birth_date,
                child_gender: nextChildren[0]?.gender || prev.child_gender,
            };
        });
    };

    const handleParentChange = (field: 'father_name' | 'mother_name', value: string) => {
        setFormData((prev) => {
            const nextFather = field === 'father_name' ? value : prev.father_name;
            const nextMother = field === 'mother_name' ? value : prev.mother_name;
            const combined = [nextFather.trim(), nextMother.trim()].filter(Boolean).join(' & ');
            return {
                ...prev,
                [field]: value,
                parent_names: combined,
            };
        });
    };

    const handleProvinceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const found = regionProvinces.find((p) => p.code === code);
        setFormData((prev) => ({
            ...prev,
            province_code: code,
            province: found ? found.name : prev.province,
            city_code: '',
            district_code: '',
            village_code: '',
        }));
    };

    const handleCitySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const found = regionCities.find((c) => c.code === code);
        setFormData((prev) => ({
            ...prev,
            city_code: code,
            city: found ? found.name : prev.city,
            district_code: '',
            village_code: '',
        }));
    };

    const handleDistrictSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const found = regionDistricts.find((d) => d.code === code);
        setFormData((prev) => ({
            ...prev,
            district_code: code,
            district: found ? found.name : prev.district,
            village_code: '',
        }));
    };

    const handleVillageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const found = regionVillages.find((v) => v.code === code);
        setFormData((prev) => ({
            ...prev,
            village_code: code,
            village: found ? found.name : prev.village,
            postal_code: found?.postal_code || prev.postal_code,
        }));
    };

    const handleSaveDraft = () => {
        try {
            localStorage.setItem('arams_intake_draft', JSON.stringify({
                ...formData,
                category_data: categoryData,
            }));
            toast.success('Draft formulir berhasil disimpan di perangkat Anda!');
        } catch {
            toast.error('Gagal menyimpan draft.');
        }
    };

    const validateStep1 = () => {
        switch (activeCategoryKey) {
            case 'maternity':
                if (!categoryData.mom_name?.trim()) {
                    toast.error('Nama Ibu wajib diisi');
                    return false;
                }
                if (!categoryData.partner_name?.trim()) {
                    toast.error('Nama Ayah / Pasangan wajib diisi');
                    return false;
                }
                if (!categoryData.gestational_age_weeks) {
                    toast.error('Usia Kehamilan Saat Sesi wajib diisi');
                    return false;
                }
                if (!categoryData.hpl_date) {
                    toast.error('HPL (Hari Perkiraan Lahir) wajib diisi');
                    return false;
                }
                return true;

            case 'lainnya':
                if (!categoryData.needs_description?.trim()) {
                    toast.error('Deskripsi Kebutuhan wajib diisi');
                    return false;
                }
                if (!categoryData.location?.trim() && !formData.location?.trim()) {
                    toast.error('Lokasi wajib diisi');
                    return false;
                }
                if (!categoryData.needs_type?.trim()) {
                    toast.error('Jenis Kebutuhan wajib dipilih');
                    return false;
                }
                if (!categoryData.needs_detail?.trim()) {
                    toast.error('Detail Kebutuhan wajib diisi');
                    return false;
                }
                return true;

            case 'perorangan':
                if (!categoryData.photo_purpose?.trim()) {
                    toast.error('Tujuan Foto wajib dipilih');
                    return false;
                }
                if (!categoryData.session_type?.trim()) {
                    toast.error('Jenis Sesi wajib dipilih');
                    return false;
                }
                if (!categoryData.outfit_looks_count) {
                    toast.error('Jumlah Look / Outfit wajib diisi');
                    return false;
                }
                if (!categoryData.session_duration?.trim()) {
                    toast.error('Durasi Sesi wajib dipilih');
                    return false;
                }
                return true;

            case 'prewedding':
                if (!categoryData.groom_name?.trim() || !categoryData.bride_name?.trim()) {
                    toast.error('Nama Lengkap Kedua Pasangan wajib diisi');
                    return false;
                }
                if (!categoryData.session_date) {
                    toast.error('Tanggal Sesi Foto Prewedding wajib diisi');
                    return false;
                }
                if (!categoryData.concept_theme?.trim()) {
                    toast.error('Konsep / Tema Foto wajib dipilih');
                    return false;
                }
                if (!categoryData.session_location?.trim() && !formData.location?.trim()) {
                    toast.error('Lokasi Sesi Foto wajib diisi');
                    return false;
                }
                return true;

            case 'commercial':
                if (!categoryData.commercial_purpose?.trim()) {
                    toast.error('Tujuan / Jenis Kebutuhan Foto wajib dipilih');
                    return false;
                }
                if (!categoryData.product_brand_type?.trim()) {
                    toast.error('Jenis Produk / Brand wajib diisi');
                    return false;
                }
                if (!categoryData.products_count) {
                    toast.error('Jumlah Produk wajib diisi');
                    return false;
                }
                if (!categoryData.background_type?.trim()) {
                    toast.error('Latar / Background Foto wajib dipilih');
                    return false;
                }
                if (!categoryData.photo_style_mood?.trim()) {
                    toast.error('Gaya Foto / Mood wajib dipilih');
                    return false;
                }
                if (!categoryData.photo_usage || !Array.isArray(categoryData.photo_usage) || categoryData.photo_usage.length === 0) {
                    toast.error('Pilih minimal satu Penggunaan Foto');
                    return false;
                }
                return true;

            case 'traveling':
                if (!categoryData.destination_city_country?.trim()) {
                    toast.error('Tujuan Destinasi (Negara / Kota) wajib diisi');
                    return false;
                }
                if (!categoryData.travelers_count) {
                    toast.error('Jumlah Traveler wajib diisi');
                    return false;
                }
                if (!categoryData.trip_type?.trim()) {
                    toast.error('Jenis Trip wajib dipilih');
                    return false;
                }
                if (!categoryData.trip_duration_days) {
                    toast.error('Durasi Trip wajib diisi');
                    return false;
                }
                if (!categoryData.departure_date) {
                    toast.error('Tanggal Berangkat wajib diisi');
                    return false;
                }
                if (!categoryData.return_date) {
                    toast.error('Tanggal Pulang wajib diisi');
                    return false;
                }
                return true;

            case 'wedding':
                if (!categoryData.groom_name?.trim()) {
                    toast.error('Nama Lengkap CPP (Mempelai Pria) wajib diisi');
                    return false;
                }
                if (!categoryData.groom_nickname?.trim()) {
                    toast.error('Nama Panggilan CPP (Mempelai Pria) wajib diisi');
                    return false;
                }
                if (!categoryData.bride_name?.trim()) {
                    toast.error('Nama Lengkap CPW (Mempelai Wanita) wajib diisi');
                    return false;
                }
                if (!categoryData.bride_nickname?.trim()) {
                    toast.error('Nama Panggilan CPW (Mempelai Wanita) wajib diisi');
                    return false;
                }
                if (!categoryData.akad_date) {
                    toast.error('Tanggal Akad wajib diisi');
                    return false;
                }
                if (!categoryData.akad_time?.trim()) {
                    toast.error('Waktu Akad wajib diisi');
                    return false;
                }
                if (!categoryData.akad_location?.trim()) {
                    toast.error('Lokasi Akad wajib diisi');
                    return false;
                }
                if (!categoryData.reception_date) {
                    toast.error('Tanggal Resepsi wajib diisi');
                    return false;
                }
                if (!categoryData.reception_time?.trim()) {
                    toast.error('Waktu Resepsi wajib diisi');
                    return false;
                }
                if (!categoryData.reception_location?.trim()) {
                    toast.error('Lokasi Resepsi wajib diisi');
                    return false;
                }
                return true;

            case 'birthday':
                if (!categoryData.celebrant_name?.trim()) {
                    toast.error('Nama yang Berulang Tahun wajib diisi');
                    return false;
                }
                if (!categoryData.celebrant_age) {
                    toast.error('Usia wajib diisi');
                    return false;
                }
                if (!categoryData.birthday_theme?.trim()) {
                    toast.error('Tema Ulang Tahun wajib diisi');
                    return false;
                }
                if (!categoryData.event_type?.trim()) {
                    toast.error('Jenis Acara wajib dipilih');
                    return false;
                }
                if (!categoryData.estimated_guests) {
                    toast.error('Jumlah Tamu wajib diisi');
                    return false;
                }
                return true;

            case 'corporate':
                if (!categoryData.company_name?.trim()) {
                    toast.error('Nama Perusahaan wajib diisi');
                    return false;
                }
                if (!categoryData.event_type?.trim()) {
                    toast.error('Jenis Acara wajib dipilih');
                    return false;
                }
                if (!categoryData.event_scale?.trim()) {
                    toast.error('Skala Acara wajib dipilih');
                    return false;
                }
                if (!categoryData.documentation_purpose?.trim()) {
                    toast.error('Tujuan Dokumentasi wajib dipilih');
                    return false;
                }
                if (!categoryData.pic_name?.trim()) {
                    toast.error('Nama PIC Acara wajib diisi');
                    return false;
                }
                if (!categoryData.pic_phone?.trim()) {
                    toast.error('Nomor Telepon / WA PIC wajib diisi');
                    return false;
                }
                return true;

            case 'engagement':
                if (!categoryData.groom_name?.trim() || !categoryData.bride_name?.trim()) {
                    toast.error('Nama Calon Pria dan Wanita wajib diisi');
                    return false;
                }
                if (!categoryData.engagement_date) {
                    toast.error('Tanggal Lamaran wajib diisi');
                    return false;
                }
                if (!categoryData.engagement_time?.trim()) {
                    toast.error('Waktu Lamaran wajib diisi');
                    return false;
                }
                if (!categoryData.engagement_location?.trim()) {
                    toast.error('Lokasi Lamaran wajib diisi');
                    return false;
                }
                return true;

            case 'event':
                if (!categoryData.event_date) {
                    toast.error('Tanggal Event wajib diisi');
                    return false;
                }
                if (!categoryData.event_time_range?.trim()) {
                    toast.error('Waktu Event wajib diisi');
                    return false;
                }
                if (!categoryData.event_type?.trim()) {
                    toast.error('Jenis Event wajib dipilih');
                    return false;
                }
                if (!categoryData.event_scale?.trim()) {
                    toast.error('Skala Event wajib dipilih');
                    return false;
                }
                if (!categoryData.event_location?.trim() && !formData.location?.trim()) {
                    toast.error('Lokasi Event wajib diisi');
                    return false;
                }
                return true;

            case 'family':
                if (!categoryData.family_name?.trim()) {
                    toast.error('Nama Keluarga wajib diisi');
                    return false;
                }
                if (!categoryData.father_name?.trim()) {
                    toast.error('Nama Ayah wajib diisi');
                    return false;
                }
                if (!categoryData.mother_name?.trim()) {
                    toast.error('Nama Ibu wajib diisi');
                    return false;
                }
                if (!categoryData.members_count) {
                    toast.error('Jumlah Anggota Keluarga wajib diisi');
                    return false;
                }
                if (!categoryData.session_location?.trim() && !formData.location?.trim()) {
                    toast.error('Lokasi Sesi Foto wajib diisi');
                    return false;
                }
                return true;

            case 'komunitas':
                if (!categoryData.community_name?.trim()) {
                    toast.error('Nama Komunitas wajib diisi');
                    return false;
                }
                if (!categoryData.community_type?.trim()) {
                    toast.error('Jenis Komunitas wajib dipilih');
                    return false;
                }
                if (!categoryData.pic_name?.trim()) {
                    toast.error('Nama PIC Komunitas wajib diisi');
                    return false;
                }
                if (!categoryData.pic_phone?.trim()) {
                    toast.error('Nomor Telepon / WA PIC wajib diisi');
                    return false;
                }
                if (!categoryData.activity_type?.trim()) {
                    toast.error('Jenis Kegiatan Komunitas wajib dipilih');
                    return false;
                }
                return true;

            case 'newborn': {
                const firstBabyName = categoryData.babies?.[0]?.name?.trim() || categoryData.baby_name?.trim() || formData.child_name?.trim();
                if (!firstBabyName) {
                    toast.error('Nama Lengkap Bayi wajib diisi');
                    return false;
                }
                return true;
            }

            default:
                if (!formData.name?.trim() && !categoryData.contact_person?.trim()) {
                    toast.error('Nama Lengkap Pemesan / Klien wajib diisi');
                    return false;
                }
                return true;
        }
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        // Validation per step
        if (currentStep === 1) {
            if (!validateStep1()) return;
        } else if (currentStep === 2) {
            if (!formData.phone.trim()) {
                toast.error('Nomor WhatsApp wajib diisi untuk konfirmasi.');
                return;
            }
        }
        if (currentStep < 4) {
            setCurrentStep((prev) => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            ...formData,
            name: formData.name || primaryContactInfo.name || 'Klien Baru',
            category_id: selectedCategory.id,
            package_id: formData.package_id || null,
            category_data: categoryData,
        };

        router.post('/form-klien', payload, {
            onSuccess: () => {
                setIsSubmitting(false);
                setShowSuccessModal(true);
                try {
                    localStorage.removeItem('arams_intake_draft');
                    confetti({
                        particleCount: 130,
                        spread: 80,
                        origin: { y: 0.5 },
                    });
                } catch {
                    // ignore
                }
            },
            onError: (errors) => {
                setIsSubmitting(false);
                const firstErr = Object.values(errors)[0];
                toast.error(typeof firstErr === 'string' ? firstErr : 'Gagal mengirim formulir. Periksa isian Anda.');
            },
        });
    };

    const steps = [
        { number: 1, title: 'Informasi Awal & Detail Klien' },
        { number: 2, title: 'Informasi Alamat & Kontak' },
        { number: 3, title: 'Paket & Detail Acara' },
        { number: 4, title: 'Ringkasan' },
    ];

    const primaryColor = theme?.primary_color || '#4F46E5';
    const bgColor = theme?.bg_color || '#090C15';
    const cardBg = theme?.card_bg || '#FFFFFF';
    const sidebarBg = theme?.sidebar_bg || '#0F1424';
    const textColor = theme?.text_color || '#0F172A';

    return (
        <div
            className="min-h-screen text-slate-100 font-sans antialiased py-6 px-3 sm:px-6 lg:px-8 flex flex-col justify-center transition-colors duration-300"
            style={{ backgroundColor: bgColor }}
        >
            <Head title={`${intake_form_title || 'Form Data Diri Client'} | Arams Pictures`} />
            <Toaster position="top-right" richColors />

            {/* ── BANNER: Form Ditutup Sementara ── */}
            {form_status === 'closed' && (
                <div className="max-w-full mx-auto mb-4">
                    <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-5 py-4">
                        <span className="text-amber-400 text-xl leading-none mt-0.5 shrink-0">⚠️</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-amber-300">Pendaftaran Ditutup Sementara</p>
                            <p className="text-xs text-amber-200/70 mt-0.5 leading-relaxed">{intake_closed_message}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-full w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-stretch">
                {/* ========================================================================= */}
                {/* LEFT SIDEBAR (Dark Brand Showcase - Lengthened to Full Height) */}
                {/* ========================================================================= */}
                <div
                    className="lg:col-span-3 xl:col-span-3 h-full flex flex-col justify-between p-4 sm:p-6 rounded-3xl border border-white/5 space-y-6 transition-colors duration-300"
                    style={{ backgroundColor: sidebarBg }}
                >
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* Logo & Brand */}
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-white text-slate-950 font-black text-lg flex items-center justify-center shadow-md shrink-0">
                                ap
                            </div>
                            <div className="leading-tight">
                                <h2 className="text-sm font-black text-white tracking-tight uppercase">
                                    ARAMS PICTURES
                                </h2>
                                <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">
                                    CAPTURE YOUR MOMENTS
                                </p>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <div className="mt-8 space-y-2 shrink-0">
                            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                                {intake_form_title || 'Form Data Diri Client'}
                            </h1>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                {intake_form_subtitle || 'Silakan lengkapi data diri Anda dengan benar. Data ini akan digunakan untuk keperluan pemesanan dan administrasi.'}
                            </p>
                        </div>

                        {/* Showcase Wedding Couple Photo (Stretches down seamlessly) */}
                        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/10 aspect-[3/3.8] lg:aspect-auto lg:flex-1 min-h-[280px] sm:min-h-[320px] mt-6 group flex flex-col justify-end">
                            <img
                                src="/images/wedding-couple.jpg"
                                alt="Arams Client Couple"
                                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        </div>
                    </div>

                    {/* Copyright Footer */}
                    <div className="pt-4 border-t border-white/5 text-[11px] text-slate-500 shrink-0 mt-auto">
                        <p>© 2026 Arams Pictures.</p>
                        <p>All rights reserved.</p>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* RIGHT MAIN CARD (4-Step Wizard Container) */}
                {/* ========================================================================= */}
                <div
                    className="lg:col-span-9 xl:col-span-9 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-100 min-h-[750px] flex flex-col justify-between transition-colors duration-300"
                    style={{ backgroundColor: cardBg, color: textColor }}
                >
                    <div>
                        {/* ================================================================= */}
                        {/* STEPPER HEADER (4 Connected Steps) */}
                        {/* ================================================================= */}
                        <div className="relative pb-8 mb-6 border-b border-slate-100">
                            <div className="flex items-center justify-between relative z-10">
                                {steps.map((s, idx) => {
                                    const isDone = currentStep > s.number;
                                    const isCurrent = currentStep === s.number;
                                    return (
                                        <div key={s.number} className="flex-1 flex flex-col items-center text-center px-1">
                                            <div className="relative flex items-center justify-center mb-2">
                                                {/* Connecting line */}
                                                {idx > 0 && (
                                                    <div
                                                        className={`absolute right-1/2 w-[calc(100vw/5)] sm:w-28 md:w-36 h-[2px] -z-10 transition-colors ${
                                                            isDone || isCurrent ? '' : 'bg-slate-200'
                                                        }`}
                                                        style={{
                                                            transform: 'translateX(-50%)',
                                                            backgroundColor: isDone || isCurrent ? primaryColor : undefined,
                                                        }}
                                                    />
                                                )}
                                                {/* Step Circle Badge */}
                                                <button
                                                    type="button"
                                                    onClick={() => (isDone ? setCurrentStep(s.number) : null)}
                                                    disabled={!isDone}
                                                    style={isDone || isCurrent ? { backgroundColor: primaryColor } : undefined}
                                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                        isDone
                                                            ? 'text-white cursor-pointer hover:opacity-90 shadow-md'
                                                            : isCurrent
                                                            ? 'text-white ring-4 ring-indigo-100 shadow-md'
                                                            : 'bg-white border-2 border-slate-300 text-slate-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.number}
                                                </button>
                                            </div>
                                            <span
                                                className={`text-[11px] sm:text-xs max-w-[140px] line-clamp-2 leading-tight ${
                                                    isCurrent
                                                        ? 'font-bold'
                                                        : isDone
                                                        ? 'text-slate-700 font-semibold'
                                                        : 'text-slate-400'
                                                }`}
                                                style={isCurrent ? { color: primaryColor } : undefined}
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
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                {intake_notes && (
                                    <div
                                        className="rounded-2xl p-4 flex items-start gap-3 text-xs border"
                                        style={{
                                            backgroundColor: `${primaryColor}0D`,
                                            borderColor: `${primaryColor}25`,
                                        }}
                                    >
                                        <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: primaryColor }} />
                                        <div>
                                            <strong className="block mb-0.5" style={{ color: textColor }}>
                                                Catatan &amp; Ketentuan:
                                            </strong>
                                            <span className="leading-relaxed text-slate-600">{intake_notes}</span>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {formType === 'wedding'
                                            ? 'Informasi Awal & Calon Pengantin (CPP/CPW)'
                                            : formType === 'newborn'
                                            ? 'Informasi Awal & Data Bayi (Newborn)'
                                            : 'Informasi Awal & Identitas Klien'}
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Pilih kategori project terlebih dahulu, formulir akan otomatis menyesuaikan data yang diperlukan.
                                    </p>
                                </div>

                                {/* ── 1. PILIH KATEGORI PROJECT TERLEBIH DAHULU ── */}
                                <div className="border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-2xs bg-slate-50/50">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                                <Bookmark className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900">
                                                    Pilih Kategori Project <span className="text-red-500">*</span>
                                                </h3>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    Pilih kategori sesi dokumentasi yang Anda inginkan:
                                                </p>
                                            </div>
                                        </div>

                                        <span className="self-start sm:self-auto inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                                            Kategori: {selectedCategory.name}
                                        </span>
                                    </div>

                                    {/* Category SelectSearch */}
                                    <div>
                                        <SelectSearch
                                            options={categoryOptions}
                                            value={String(formData.category_id)}
                                            onChange={handleCategoryChange}
                                            placeholder="Cari atau pilih Kategori Project..."
                                            searchPlaceholder="Ketik nama kategori (Wedding, Newborn, dll)..."
                                            clearable={false}
                                            className="w-full bg-white"
                                        />
                                    </div>
                                </div>

                                {/* ── 2. DYNAMIC INPUT FORM BASED ON CATEGORY ── */}
                                <div className="pt-2">
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
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Informasi Alamat & Kontak
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Lengkapi informasi alamat dan pilih kontak utama agar kami dapat menghubungi Anda dengan mudah.
                                    </p>
                                </div>

                                {/* Blue Info Alert */}
                                <div className="bg-indigo-50/70 border border-indigo-100/90 rounded-2xl p-4 flex items-center gap-3 text-xs text-indigo-900">
                                    <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>
                                        <strong>Informasi penting:</strong> Pastikan semua data yang Anda input sudah benar agar memudahkan komunikasi terkait pemesanan.
                                    </span>
                                </div>

                                {/* Informasi Alamat Card */}
                                <div className="border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Informasi Alamat
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Provinsi <span className="text-red-500">*</span>
                                            </label>
                                            <SelectSearch
                                                options={regionProvinces.map((p) => ({ value: p.code, label: p.name }))}
                                                value={formData.province_code}
                                                onChange={(val) => {
                                                    const found = regionProvinces.find((p) => p.code === val);
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        province_code: val,
                                                        province: found ? found.name : prev.province,
                                                        city_code: '',
                                                        district_code: '',
                                                        village_code: '',
                                                    }));
                                                }}
                                                placeholder="Pilih provinsi"
                                                searchPlaceholder="Cari provinsi..."
                                                clearable={false}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Kota / Kabupaten <span className="text-red-500">*</span>
                                            </label>
                                            <SelectSearch
                                                options={regionCities.map((c) => ({ value: c.code, label: c.name }))}
                                                value={formData.city_code}
                                                onChange={(val) => {
                                                    const found = regionCities.find((c) => c.code === val);
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        city_code: val,
                                                        city: found ? found.name : prev.city,
                                                        district_code: '',
                                                        village_code: '',
                                                    }));
                                                }}
                                                placeholder={formData.province_code ? 'Pilih kota / kabupaten' : 'Pilih provinsi dahulu'}
                                                searchPlaceholder="Cari kota..."
                                                disabled={!formData.province_code}
                                                isLoading={!!formData.province_code && regionCities.length === 0}
                                                clearable={false}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Kecamatan <span className="text-red-500">*</span>
                                            </label>
                                            <SelectSearch
                                                options={regionDistricts.map((d) => ({ value: d.code, label: d.name }))}
                                                value={formData.district_code}
                                                onChange={(val) => {
                                                    const found = regionDistricts.find((d) => d.code === val);
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        district_code: val,
                                                        district: found ? found.name : prev.district,
                                                        village_code: '',
                                                    }));
                                                }}
                                                placeholder={formData.city_code ? 'Pilih kecamatan' : 'Pilih kota dahulu'}
                                                searchPlaceholder="Cari kecamatan..."
                                                disabled={!formData.city_code}
                                                isLoading={!!formData.city_code && regionDistricts.length === 0}
                                                clearable={false}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Kelurahan <span className="text-red-500">*</span>
                                            </label>
                                            <SelectSearch
                                                options={regionVillages.map((v) => ({ value: v.code, label: v.name }))}
                                                value={formData.village_code}
                                                onChange={(val) => {
                                                    const found = regionVillages.find((v) => v.code === val);
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        village_code: val,
                                                        village: found ? found.name : prev.village,
                                                        postal_code: found?.postal_code || prev.postal_code,
                                                    }));
                                                }}
                                                placeholder={formData.district_code ? 'Pilih kelurahan' : 'Pilih kecamatan dahulu'}
                                                searchPlaceholder="Cari kelurahan..."
                                                disabled={!formData.district_code}
                                                isLoading={!!formData.district_code && regionVillages.length === 0}
                                                clearable={false}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Kode Pos <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.postal_code}
                                                onChange={(e) => handleFieldChange('postal_code', e.target.value)}
                                                placeholder="Masukkan kode pos"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
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
                                            rows={3}
                                            maxLength={255}
                                            required
                                            value={formData.address}
                                            onChange={(e) => handleFieldChange('address', e.target.value)}
                                            placeholder="Masukkan alamat lengkap (nama jalan, nomor, RT/RW, dll)"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Kontak Utama untuk Komunikasi Card */}
                                <div className="border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">
                                                Kontak Utama untuk Komunikasi
                                            </h3>
                                            <p className="text-[11px] text-slate-500">
                                                Pilih pihak yang paling mudah dihubungi terkait pemesanan ini.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                        {/* Left Column: Selection & Direct Inputs */}
                                        <div className="lg:col-span-6 space-y-4">
                                            <div>
                                                <NativeSelect
                                                    label="Pilih Kontak Utama"
                                                    required
                                                    value={formData.primary_contact}
                                                    onChange={(e) => handleFieldChange('primary_contact', e.target.value)}
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
                                                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                                                        placeholder="+62 812-3456-7890"
                                                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                    Email <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                        <Mail className="w-3.5 h-3.5" />
                                                    </span>
                                                    <input
                                                        type="email"
                                                        required
                                                        value={formData.email}
                                                        onChange={(e) => handleFieldChange('email', e.target.value)}
                                                        placeholder="contoh@gmail.com"
                                                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
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
                                                    onChange={(e) => handleFieldChange('other_social_media', e.target.value)}
                                                    placeholder="TikTok: @username, YouTube: Channel..."
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                                                />
                                            </div>
                                        </div>

                                        {/* Right Column: Auto-filled Live Preview Box */}
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
                                                    <span className="text-slate-400">Social Media Lainnya</span>
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

                        {/* ================================================================= */}
                        {/* STEP 3: INFORMASI ACARA/PROJECT & INFORMASI TAMBAHAN */}
                        {/* ================================================================= */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Informasi Acara / Project
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Lengkapi informasi detail acara atau project yang Anda pesan.
                                    </p>
                                </div>

                                {/* Blue Info Alert */}
                                <div className="bg-indigo-50/70 border border-indigo-100/90 rounded-2xl p-4 flex items-center gap-3 text-xs text-indigo-900">
                                    <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>
                                        <strong>Informasi penting:</strong> Informasi yang Anda isi akan membantu kami mempersiapkan layanan yang sesuai dengan kebutuhan Anda.
                                    </span>
                                </div>

                                {/* Detail Acara / Project Card */}
                                <div className="border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Detail Acara / Project
                                        </h3>
                                    </div>

                                    {/* Row 1: Kategori, Jenis Acara, Paket */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Kategori Project
                                            </label>
                                            <SelectSearch
                                                options={categoryOptions}
                                                value={String(formData.category_id)}
                                                onChange={handleCategoryChange}
                                                placeholder="Pilih kategori project"
                                                searchPlaceholder="Cari kategori..."
                                                clearable={false}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Jenis Acara <span className="text-red-500">*</span>
                                            </label>
                                            <NativeSelect
                                                value={formData.event_type}
                                                onChange={(e) => handleFieldChange('event_type', e.target.value)}
                                                options={[
                                                    { value: 'Pernikahan', label: 'Pernikahan' },
                                                    { value: 'Akad Saja', label: 'Akad Saja' },
                                                    { value: 'Resepsi Saja', label: 'Resepsi Saja' },
                                                    { value: 'Akad & Resepsi', label: 'Akad & Resepsi' },
                                                    { value: 'Lamaran & Engagement', label: 'Lamaran & Engagement' },
                                                    { value: 'Prewedding', label: 'Prewedding' },
                                                    { value: 'Siraman & Pengajian', label: 'Siraman & Pengajian' },
                                                    { value: 'Unduh Mantu', label: 'Unduh Mantu' },
                                                ]}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Paket yang Diminati (Opsional)
                                            </label>
                                            <SelectSearch
                                                options={[
                                                    ...packages.map((p) => ({
                                                        value: p.id,
                                                        label: p.name,
                                                        subtitle: p.description
                                                            ? p.description
                                                            : p.base_price
                                                            ? `Rp ${Number(p.base_price).toLocaleString('id-ID')}`
                                                            : undefined,
                                                    })),
                                                ]}
                                                value={formData.package_id}
                                                onChange={(val) => handleFieldChange('package_id', val)}
                                                placeholder="Pilih paket atau layanan"
                                                searchPlaceholder="Cari paket..."
                                                clearable={true}
                                            />
                                        </div>
                                    </div>

                                    {/* Row 2: Tanggal, Waktu, Tempat */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Tanggal Acara / Project / Sesi <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                value={formData.event_date}
                                                onChange={(e) => handleFieldChange('event_date', e.target.value)}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Waktu / Jam Sesi / Acara <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.event_time}
                                                onChange={(e) => handleFieldChange('event_time', e.target.value)}
                                                placeholder="Contoh: 16:00 - Selesai"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Tempat / Lokasi Sesi <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.location}
                                                onChange={(e) => handleFieldChange('location', e.target.value)}
                                                placeholder="Masukkan tempat / venue"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                                            />
                                        </div>
                                    </div>

                                    {/* Row 3: Lokasi Resepsi (Wedding only), Estimasi Tamu, Warna Tema */}
                                    <div className={`grid grid-cols-1 ${activeCategoryKey === 'wedding' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
                                        {activeCategoryKey === 'wedding' && (
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                    Lokasi Resepsi (Jika berbeda)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.reception_location}
                                                    onChange={(e) => handleFieldChange('reception_location', e.target.value)}
                                                    placeholder="Masukkan lokasi resepsi jika berbeda"
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Jumlah Tamu (Estimasi)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.estimated_guests}
                                                onChange={(e) => handleFieldChange('estimated_guests', e.target.value)}
                                                placeholder="Contoh: 200 - 300 orang"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Warna Tema / Konsep (Opsional)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.concept_theme}
                                                onChange={(e) => handleFieldChange('concept_theme', e.target.value)}
                                                placeholder="Contoh: Putih, Gold, Rustic, dll"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                                            />
                                        </div>
                                    </div>

                                    {/* Row 4: Vendor Lain */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            Vendor Lain yang Terlibat (Opsional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.other_vendors}
                                            onChange={(e) => handleFieldChange('other_vendors', e.target.value)}
                                            placeholder="Masukkan vendor lain (WO, MUA, Dekorasi, dll)"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                                        />
                                    </div>

                                    {/* Row 5: Catatan Tambahan Project */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-[11px] font-bold text-slate-700">
                                                Catatan Tambahan Project (Opsional)
                                            </label>
                                            <span className="text-[10px] text-slate-400">
                                                {formData.project_notes.length} / 500
                                            </span>
                                        </div>
                                        <textarea
                                            rows={2}
                                            maxLength={500}
                                            value={formData.project_notes}
                                            onChange={(e) => handleFieldChange('project_notes', e.target.value)}
                                            placeholder="Masukkan catatan tambahan terkait kebutuhan project Anda"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Informasi Tambahan Card */}
                                <div className="border border-slate-200/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Informasi Tambahan
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                Referensi / Inspirasi (Opsional)
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={formData.reference_url}
                                                onChange={(e) => handleFieldChange('reference_url', e.target.value)}
                                                placeholder="Masukkan referensi atau link inspirasi (Pinterest, Instagram, dll)"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-[11px] font-bold text-slate-700">
                                                    Hal-hal yang Perlu Diperhatikan (Opsional)
                                                </label>
                                                <span className="text-[10px] text-slate-400">
                                                    {formData.special_requests.length} / 500
                                                </span>
                                            </div>
                                            <textarea
                                                rows={3}
                                                maxLength={500}
                                                value={formData.special_requests}
                                                onChange={(e) => handleFieldChange('special_requests', e.target.value)}
                                                placeholder="Contoh: tidak ada drone, area terbatas, acara outdoor, dll"
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================================================================= */}
                        {/* STEP 4: RINGKASAN */}
                        {/* ================================================================= */}
                        {currentStep === 4 && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Ringkasan
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Periksa kembali semua informasi yang telah Anda lengkapi sebelum mengirim form pemesanan.
                                    </p>
                                </div>

                                {/* Blue Info Alert */}
                                <div className="bg-indigo-50/70 border border-indigo-100/90 rounded-2xl p-4 flex items-center gap-3 text-xs text-indigo-900">
                                    <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>
                                        <strong>Pastikan semua data sudah benar.</strong> Setelah dikirim, data akan kami proses dan tim kami akan segera menghubungi Anda.
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Card 1: Informasi Khusus Kategori */}
                                    <div className="md:col-span-2 space-y-2">
                                        <div className="flex items-center justify-between pb-1">
                                            <span className="text-xs font-bold text-slate-900">
                                                Detail Kebutuhan Kategori: {selectedCategory.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(1)}
                                                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-all"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                                <span>Ubah Data</span>
                                            </button>
                                        </div>
                                        <CategorySpecificView
                                            project={{
                                                category: selectedCategory,
                                                category_data: categoryData,
                                                location: formData.location || categoryData.location || categoryData.session_location || categoryData.akad_location || categoryData.event_location,
                                                client: {
                                                    name: primaryContactInfo.name,
                                                    phone: formData.phone,
                                                    email: formData.email,
                                                    address: formData.address,
                                                    city: formData.city,
                                                    ...categoryData,
                                                },
                                            }}
                                        />
                                    </div>

                                    {/* Card 2: Informasi Alamat & Kontak */}
                                    <div className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-2xs space-y-3">
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                </div>
                                                <h3 className="text-xs font-bold text-slate-900">
                                                    Informasi Alamat & Kontak
                                                </h3>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(2)}
                                                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-all"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                                <span>Ubah</span>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                                            {/* Alamat */}
                                            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                                <span className="font-bold text-slate-700 block">Alamat Lengkap</span>
                                                <p className="text-slate-700 font-medium leading-relaxed">
                                                    {formData.address}
                                                </p>
                                                <p className="text-slate-500">
                                                    {formData.village ? `${formData.village}, ` : ''}
                                                    {formData.district ? `${formData.district}, ` : ''}
                                                    {formData.city}
                                                </p>
                                                <p className="text-slate-500">
                                                    {formData.province} {formData.postal_code ? `- ${formData.postal_code}` : ''}
                                                </p>
                                            </div>

                                            {/* Kontak Utama */}
                                            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                                <span className="font-bold text-slate-700 block">
                                                    Kontak Utama untuk Komunikasi
                                                </span>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Nama Lengkap</span>
                                                    <span className="font-semibold text-slate-800 text-right">{primaryContactInfo.name} ({primaryContactInfo.role})</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Pekerjaan</span>
                                                    <span className="font-semibold text-slate-800 text-right">{primaryContactInfo.occupation}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">No. WhatsApp</span>
                                                    <span className="font-semibold text-slate-800 text-right">{formData.phone}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Email</span>
                                                    <span className="font-semibold text-slate-800 text-right">{formData.email}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Instagram</span>
                                                    <span className="font-semibold text-slate-800 text-right">{primaryContactInfo.instagram}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-400">Social Media</span>
                                                    <span className="font-semibold text-slate-800 text-right max-w-[120px] truncate">{formData.other_social_media || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card 3: Informasi Acara / Project (Full Width) */}
                                    <div className="md:col-span-2 border border-slate-200/80 rounded-2xl p-5 bg-white shadow-2xs space-y-3">
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                </div>
                                                <h3 className="text-xs font-bold text-slate-900">
                                                    Informasi Acara / Project
                                                </h3>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(3)}
                                                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-all"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                                <span>Ubah</span>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px]">
                                            <div className="space-y-2 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                                <div>
                                                    <span className="text-slate-400 block text-[10px]">Kategori Project</span>
                                                    <span className="font-semibold text-slate-800">{selectedCategory.name}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block text-[10px]">Jenis Acara</span>
                                                    <span className="font-semibold text-slate-800">{formData.event_type}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block text-[10px]">Paket yang Diminati</span>
                                                    <span className="font-semibold text-indigo-700">{selectedPackage?.name || 'Belum memilih paket'}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                                <div>
                                                    <span className="text-slate-400 block text-[10px]">Tanggal Project / Sesi</span>
                                                    <span className="font-semibold text-slate-800">{formData.event_date || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block text-[10px]">Waktu / Jam Sesi</span>
                                                    <span className="font-semibold text-slate-800">{formData.event_time || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block text-[10px]">Tempat / Lokasi</span>
                                                    <span className="font-semibold text-slate-800">{formData.location || '-'}</span>
                                                </div>
                                                {activeCategoryKey === 'wedding' && (
                                                    <div>
                                                        <span className="text-slate-400 block text-[10px]">Lokasi Resepsi</span>
                                                        <span className="font-semibold text-slate-800">{formData.reception_location || '-'}</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="text-slate-400 block text-[10px]">Jumlah Tamu (Estimasi)</span>
                                                    <span className="font-semibold text-slate-800">{formData.estimated_guests || '-'}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                                <div>
                                                    <span className="text-slate-400 block text-[10px]">Warna Tema / Konsep</span>
                                                    <span className="font-semibold text-slate-800">{formData.concept_theme || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block text-[10px]">Vendor Lain yang Terlibat</span>
                                                    <span className="font-semibold text-slate-800 leading-tight block">{formData.other_vendors || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 block text-[10px]">Catatan Tambahan Project</span>
                                                    <span className="font-semibold text-slate-800 leading-tight block">{formData.project_notes || '-'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card 4: Informasi Tambahan (Full Width) */}
                                    <div className="md:col-span-2 border border-slate-200/80 rounded-2xl p-5 bg-white shadow-2xs space-y-3">
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                                    <FileText className="w-3.5 h-3.5" />
                                                </div>
                                                <h3 className="text-xs font-bold text-slate-900">
                                                    Informasi Tambahan
                                                </h3>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setCurrentStep(3)}
                                                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1 transition-all"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                                <span>Ubah</span>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                                            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                                <span className="text-slate-400 block text-[10px] mb-1">Referensi / Inspirasi</span>
                                                <p className="font-semibold text-slate-800 leading-relaxed whitespace-pre-line">
                                                    {formData.reference_url || '-'}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                                <span className="text-slate-400 block text-[10px] mb-1">Hal-hal yang Perlu Diperhatikan</span>
                                                <p className="font-semibold text-slate-800 leading-relaxed whitespace-pre-line">
                                                    {formData.special_requests || '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ===================================================================== */}
                    {/* BOTTOM ACTION BUTTONS */}
                    {/* ===================================================================== */}
                    <div className="pt-6 mt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    <span>Kembali</span>
                                </button>
                            ) : (
                                <div className="hidden sm:block" />
                            )}
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            {currentStep === 4 ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleSaveDraft}
                                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                                    >
                                        <Bookmark className="w-3.5 h-3.5" />
                                        <span>Simpan Draft</span>
                                    </button>
                                    <div className="flex flex-col items-end">
                                        <button
                                            type="button"
                                            disabled={isSubmitting || form_status === 'closed'}
                                            onClick={form_status === 'closed' ? undefined : handleSubmit}
                                            style={form_status === 'closed' ? undefined : { backgroundColor: primaryColor }}
                                            className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md disabled:cursor-not-allowed ${
                                                form_status === 'closed'
                                                    ? 'bg-slate-500 opacity-60 shadow-slate-500/20'
                                                    : 'hover:opacity-90 cursor-pointer shadow-md disabled:opacity-50'
                                            }`}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>Memproses...</span>
                                                </>
                                            ) : form_status === 'closed' ? (
                                                <>
                                                    <span>🔒</span>
                                                    <span>Pendaftaran Ditutup</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Kirim Form Pemesanan</span>
                                                    <Send className="w-3.5 h-3.5" />
                                                </>
                                            )}
                                        </button>
                                        {form_status === 'closed' ? (
                                            <span className="text-[10px] text-amber-400 mt-1 font-semibold">
                                                ⚠️ {intake_closed_message}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 mt-1">
                                                Form akan dikirim ke tim kami untuk diproses.
                                            </span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    style={{ backgroundColor: primaryColor }}
                                    className="px-6 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md hover:opacity-90"
                                >
                                    <span>Selanjutnya</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* SUCCESS MODAL (Matching Screenshot 2) */}
            {/* ========================================================================= */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                        {/* Green Success Check Badge */}
                        <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                            <Check className="w-10 h-10 stroke-[3]" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                Formulir Berhasil Dikirim!
                            </h3>
                            <p className="text-xs font-semibold text-slate-700">
                                Terima kasih, data Anda telah berhasil kami terima.
                            </p>
                            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto pt-1">
                                Tim Arams Pictures akan melakukan pengecekan data Anda dan menghubungi Anda apabila diperlukan informasi tambahan.
                            </p>
                        </div>

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    window.location.reload();
                                }}
                                style={{ backgroundColor: primaryColor }}
                                className="w-full py-3 px-6 rounded-xl text-white text-xs font-bold transition-all shadow-md hover:opacity-90 cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
