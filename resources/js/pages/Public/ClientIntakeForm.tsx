import React, { useState } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    MapPin,
    Phone,
    Mail,
    Instagram,
    User,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Send,
    MessageCircle,
    Building2,
    Tag,
    ChevronDown,
    Shield,
    Check,
    HelpCircle,
    ExternalLink,
    Lock,
    Headphones,
    Edit2,
    Facebook,
    Youtube,
    Radio,
    Sparkles,
    FileText,
    Info,
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { SelectSearch } from '@/components/ui/select-search';
import { Input } from '@/components/ui/input';

interface CategoryItem {
    id: string;
    name: string;
    color?: string;
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
}

export default function ClientIntakeForm({
    categories = [],
    packages = [],
    wedding_organizers = [],
    all_clients = [],
    company = {
        name: 'Arams Pictures',
        phone: '081234567890',
        email: 'hello@arams.id',
        instagram: '@aramspictures',
        address: 'Surabaya, Jawa Timur',
        website: 'www.aramspictures.com',
    },
}: ClientIntakeFormProps) {
    const pageProps = usePage().props as any;
    const { flash } = pageProps;
    const intakeSuccess = flash?.intake_success || flash?.success;

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Data State covering all multi-step form requirements
    const [formData, setFormData] = useState({
        // Step 1: Kategori & Identitas Utama
        category_id: categories[0]?.id || 'wedding',
        full_name: 'Andi Pratama',
        nickname: 'Andi',
        id_card_number: '3171234567890001',
        birth_place: 'Jakarta',
        birth_date: '1995-01-12',
        gender: 'male',
        marital_status: 'Belum Menikah',
        occupation: 'Software Engineer',

        // Step 2: Informasi Kontak
        phone_country_code: '+62',
        phone: '81234567890',
        email: 'andi.sari@gmail.com',
        address: 'Jl. Melati No. 10, RT 03/RW 02, Kel. Cempaka Putih, Kec. Ciputat Timur',
        city: 'Tangerang Selatan',
        province: 'Banten',
        postal_code: '15412',
        communication_preference: 'whatsapp',
        best_contact_time: 'siang',

        // Step 3: Informasi Khusus Project (Wedding)
        // CPW (Calon Pengantin Pria)
        groom_name: 'Andi Pratama',
        groom_nickname: 'Andi',
        groom_birth_place: 'Jakarta',
        groom_birth_date: '1995-01-12',
        groom_religion: 'Islam',
        groom_occupation: 'Software Engineer',
        groom_instagram: '@andipratama',
        groom_facebook: 'Andi Pratama',
        groom_tiktok: '@andipratama',
        groom_youtube: 'Andi Pratama',
        groom_x: '@andipratama_',

        // CPP (Calon Pengantin Wanita)
        bride_name: 'Sari Dewi',
        bride_nickname: 'Sari',
        bride_birth_place: 'Bandung',
        bride_birth_date: '1996-05-20',
        bride_religion: 'Islam',
        bride_occupation: 'Graphic Designer',
        bride_instagram: '@saridewi',
        bride_facebook: 'Sari Dewi',
        bride_tiktok: '@saridewi',
        bride_youtube: 'Sari Dewi',
        bride_x: '@saridewi_',

        // Detail Acara Pernikahan
        event_date: '2026-12-12',
        event_time: '10.00 WIB',
        location: 'Gedung Graha Arams, Jl. Raya Serpong No. 88, Tangerang Selatan',
        reception_location: 'Gedung Graha Arams',
        estimated_guests: '300 - 400 Orang',
        event_type: 'Akad & Resepsi',
        project_notes: 'Ingin hasil foto yang candid dan natural.',

        // Step 4: Informasi Tambahan
        package_id: packages[0]?.id || '',
        concept_theme: 'Garden Party, Elegant',
        favorite_style: 'Putih, Hijau Sage, Gold',
        has_reference: 'yes',
        reference_url: 'https://drive.google.com/drive/folders/contoh-referensi',
        special_requests: 'Ingin dokumentasi dari persiapan sampai resepsi selesai.',
        source_info: 'Instagram',
        referral_name: 'Rina (Teman)',

        // Checkboxes Persetujuan
        agree_data_accurate: true,
        agree_privacy_policy: true,
    });

    const updateField = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep < 5) {
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
        if (!formData.agree_data_accurate || !formData.agree_privacy_policy) {
            toast.error('Harap setujui pernyataan dan kebijakan privasi terlebih dahulu.');
            return;
        }

        setIsSubmitting(true);
        const fullPhone = `${formData.phone_country_code}${formData.phone.replace(/^0+/, '')}`;

        router.post(
            '/form-klien',
            {
                bride_name: formData.bride_name || formData.full_name,
                bride_nickname: formData.bride_nickname || formData.nickname,
                groom_name: formData.groom_name || formData.full_name,
                groom_nickname: formData.groom_nickname || formData.nickname,
                bride_birth_date: formData.bride_birth_date || null,
                groom_birth_date: formData.groom_birth_date || null,
                phone: fullPhone,
                email: formData.email,
                instagram: formData.groom_instagram || formData.bride_instagram,
                address: formData.address,
                city: formData.city,
                province: formData.province,
                postal_code: formData.postal_code,
                category_id: formData.category_id,
                package_id: formData.package_id || null,
                event_date: formData.event_date || '2026-12-12',
                event_time: formData.event_time,
                location: formData.location,
                reception_location: formData.reception_location,
                estimated_guests: formData.estimated_guests,
                event_type: formData.event_type,
                notes: `Konsep: ${formData.concept_theme}. Warna: ${formData.favorite_style}. Catatan: ${formData.project_notes}. ${formData.special_requests}`,
                source_info: formData.source_info,
                referral_name: formData.referral_name,
                concept_theme: formData.concept_theme,
                favorite_style: formData.favorite_style,
                reference_url: formData.reference_url,
                has_reference: formData.has_reference,
                communication_preference: formData.communication_preference,
                best_contact_time: formData.best_contact_time,
            },
            {
                onSuccess: () => {
                    setIsSubmitting(false);
                    toast.success('Formulir berhasil dikirim! Tim kami akan segera menghubungi Anda.');
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    const firstErr = Object.values(errors)[0];
                    toast.error(typeof firstErr === 'string' ? firstErr : 'Gagal mengirim formulir. Periksa isian Anda.');
                },
            }
        );
    };

    const steps = [
        { number: 1, title: 'Kategori & Identitas' },
        { number: 2, title: 'Informasi Kontak' },
        { number: 3, title: 'Informasi Khusus Project' },
        { number: 4, title: 'Informasi Tambahan' },
        { number: 5, title: 'Review & Kirim' },
    ];

    // Select options datasets
    const categoryOptions = categories.length > 0
        ? categories.map((cat) => ({ value: cat.id, label: cat.name }))
        : [
            { value: 'wedding', label: 'Wedding (Pernikahan)' },
            { value: 'prewedding', label: 'Prewedding' },
            { value: 'engagement', label: 'Engagement / Lamaran' },
            { value: 'event', label: 'Event & Gathering' },
        ];

    const maritalStatusOptions = [
        { value: 'Belum Menikah', label: 'Belum Menikah' },
        { value: 'Menikah', label: 'Menikah' },
        { value: 'Cerai Hidup', label: 'Cerai Hidup' },
        { value: 'Cerai Mati', label: 'Cerai Mati' },
    ];

    const provinceOptions = [
        { value: 'Banten', label: 'Banten' },
        { value: 'DKI Jakarta', label: 'DKI Jakarta' },
        { value: 'Jawa Barat', label: 'Jawa Barat' },
        { value: 'Jawa Tengah', label: 'Jawa Tengah' },
        { value: 'DI Yogyakarta', label: 'DI Yogyakarta' },
        { value: 'Jawa Timur', label: 'Jawa Timur' },
        { value: 'Bali', label: 'Bali' },
        { value: 'Sumatera Utara', label: 'Sumatera Utara' },
        { value: 'Sumatera Barat', label: 'Sumatera Barat' },
        { value: 'Riau', label: 'Riau' },
        { value: 'Sulawesi Selatan', label: 'Sulawesi Selatan' },
    ];

    const religionOptions = [
        { value: 'Islam', label: 'Islam' },
        { value: 'Kristen', label: 'Kristen Protestan' },
        { value: 'Katolik', label: 'Kristen Katolik' },
        { value: 'Hindu', label: 'Hindu' },
        { value: 'Buddha', label: 'Buddha' },
        { value: 'Konghucu', label: 'Konghucu' },
        { value: 'Lainnya', label: 'Lainnya' },
    ];

    const eventTypeOptions = [
        { value: 'Akad & Resepsi', label: 'Akad & Resepsi' },
        { value: 'Pemberkatan & Resepsi', label: 'Pemberkatan & Resepsi' },
        { value: 'Akad Saja', label: 'Akad Saja' },
        { value: 'Resepsi Saja', label: 'Resepsi Saja' },
        { value: 'Lamaran / Engagement', label: 'Lamaran / Engagement' },
    ];

    const contactTimeOptions = [
        { value: 'pagi', label: 'Pagi (08.00 - 12.00 WIB)' },
        { value: 'siang', label: 'Siang (10.00 - 16.00 WIB)' },
        { value: 'sore_malam', label: 'Sore / Malam (16.00 - 20.00 WIB)' },
    ];

    const packageOptions = packages.length > 0
        ? packages.map((pkg) => ({
            value: pkg.id,
            label: pkg.name,
            subtitle: pkg.base_price ? `Rp ${Number(pkg.base_price).toLocaleString('id-ID')}` : undefined,
        }))
        : [
            { value: 'pkg1', label: 'Wedding Gold', subtitle: 'Paket lengkap foto & video' },
            { value: 'pkg2', label: 'Wedding Silver', subtitle: 'Paket dokumentasi standard' },
            { value: 'pkg3', label: 'Wedding Platinum', subtitle: 'Paket premium cinematic & drone' },
        ];

    const sourceOptions = [
        { value: 'Instagram', label: 'Instagram (@aramspictures)' },
        { value: 'TikTok', label: 'TikTok' },
        { value: 'Teman/Keluarga', label: 'Rekomendasi Teman / Keluarga' },
        { value: 'Wedding Organizer', label: 'Wedding Organizer Partner' },
        { value: 'Google', label: 'Pencarian Google' },
        { value: 'Pameran / Vendor Fair', label: 'Pameran / Vendor Fair' },
    ];

    const currentCategoryName = categoryOptions.find((c) => c.value === formData.category_id)?.label || 'Wedding (Pernikahan)';

    return (
        <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-indigo-500 selection:text-white">
            <Head title="Form Data Diri Client - Arams Pictures" />
            <Toaster position="top-right" richColors />

            {/* ── LEFT SIDEBAR (Full Height Dark Navy & Couple Showcase) ─── */}
            <div className="w-full lg:w-[360px] xl:w-[400px] bg-[#0E091E] p-6 sm:p-8 lg:p-10 flex flex-col justify-between text-white shrink-0 border-b lg:border-b-0 lg:border-r border-indigo-950/40 min-h-screen overflow-y-auto">
                
                {/* Top Section: Brand & Intro */}
                <div className="space-y-6 relative z-10">
                    {/* Logo & Brand */}
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center font-black text-xl tracking-tight shadow-md">
                            ap
                        </div>
                        <div>
                            <h2 className="font-extrabold text-sm tracking-[0.15em] text-white uppercase">
                                Arams Pictures
                            </h2>
                            <p className="text-[10px] tracking-[0.25em] text-slate-400 font-bold uppercase mt-0.5">
                                Photographer
                            </p>
                        </div>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="space-y-1.5 pt-2">
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            {currentStep === 1 ? 'Selamat Datang!' : 'Form Data Diri Client'}
                        </h1>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Silakan lengkapi data diri Anda dengan benar. Data ini akan digunakan untuk keperluan pemesanan dan administrasi di Arams Pictures.
                        </p>
                    </div>

                    {/* Wedding Couple Photo Showcase */}
                    <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/10 aspect-[3/3.8] group">
                        <img
                            src="/images/wedding-couple.jpg"
                            alt="Arams Pictures Client Couple"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0E091E]/90 via-transparent to-transparent" />
                        <div className="absolute bottom-3.5 inset-x-3.5 text-center">
                            <span className="text-[11px] font-bold text-white tracking-wide drop-shadow-sm">
                                Abadikan Momen Berharga Bersama Kami
                            </span>
                        </div>
                    </div>

                    {/* Help Box Card */}
                    <div className="bg-[#1C132E]/80 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-3.5 shadow-inner">
                        <div className="w-10 h-10 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Headphones className="w-5 h-5" />
                        </div>
                        <div className="space-y-2 text-xs flex-1">
                            <div>
                                <h4 className="font-bold text-white text-xs">Butuh bantuan?</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                    Jika Anda mengalami kendala saat mengisi form, silakan hubungi kami.
                                </p>
                            </div>
                            <a
                                href={`https://wa.me/${company.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all shadow-xs"
                            >
                                <span>Hubungi Kami</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Copyright */}
                <div className="pt-6 text-[11px] text-slate-500 font-medium relative z-10">
                    © 2026 Arams Pictures. All rights reserved.
                </div>
            </div>

            {/* ── RIGHT MAIN CONTENT AREA (Full Height) ───────────────────── */}
            <div className="flex-1 min-h-screen p-6 sm:p-10 lg:p-14 xl:p-16 flex flex-col justify-between bg-white overflow-y-auto">
                
                <div className="space-y-8 max-w-5xl mx-auto w-full">
                    {/* ── TOP PROGRESS STEPPER (5 Steps matching Screenshots) ─ */}
                    <div className="relative">
                        <div className="flex items-center justify-between relative z-10">
                            {steps.map((step) => {
                                const isDone = currentStep > step.number;
                                const isActive = currentStep === step.number;

                                return (
                                    <div
                                        key={step.number}
                                        className="flex flex-col items-center cursor-pointer group flex-1"
                                        onClick={() => {
                                            if (step.number < currentStep) setCurrentStep(step.number);
                                        }}
                                    >
                                        {/* Step Circle */}
                                        <div
                                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                                                isDone
                                                    ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-500/25'
                                                    : isActive
                                                    ? 'bg-[#4F46E5] text-white ring-4 ring-indigo-100 shadow-md shadow-indigo-500/25'
                                                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                                            }`}
                                        >
                                            {isDone ? <Check className="w-4 h-4 text-white stroke-[3]" /> : step.number}
                                        </div>

                                        {/* Step Label */}
                                        <span
                                            className={`text-[11px] mt-2 font-bold text-center hidden sm:block max-w-[120px] transition-colors ${
                                                isActive
                                                    ? 'text-[#4F46E5]'
                                                    : isDone
                                                    ? 'text-slate-800'
                                                    : 'text-slate-400'
                                            }`}
                                        >
                                            {step.title}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Background Connecting Line */}
                        <div className="absolute top-4.5 left-8 right-8 h-0.5 bg-slate-200 -z-0">
                            <div
                                className="h-full bg-[#4F46E5] transition-all duration-500"
                                style={{
                                    width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                                }}
                            />
                        </div>
                    </div>

                    {/* ── STEP 1: KATEGORI & IDENTITAS (Image 5) ───────────── */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    Kategori &amp; Identitas
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Pilih kategori project dan lengkapi identitas utama Anda.
                                </p>
                            </div>

                            {/* Info Banner */}
                            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-950">
                                <Info className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                                <div>
                                    <strong className="font-bold text-[#4F46E5]">Informasi penting:</strong>{' '}
                                    <span>Pastikan nama yang Anda input sesuai dengan KTP untuk keperluan administrasi.</span>
                                </div>
                            </div>

                            <div className="space-y-5">
                                {/* Kategori Project with SelectSearch */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                        Kategori Project <span className="text-rose-500">*</span>
                                    </label>
                                    <SelectSearch
                                        options={categoryOptions}
                                        value={formData.category_id}
                                        onChange={(val) => updateField('category_id', val)}
                                        placeholder="Pilih kategori project Anda"
                                        searchPlaceholder="Cari kategori..."
                                        clearable={false}
                                        required
                                    />
                                </div>

                                {/* Section: Data Identitas Utama */}
                                <div className="pt-2">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                                        Data Identitas Utama
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Nama Lengkap */}
                                        <Input
                                            label="Nama Lengkap (Sesuai KTP) *"
                                            required
                                            value={formData.full_name}
                                            onChange={(e) => updateField('full_name', e.target.value)}
                                            placeholder="Masukkan nama lengkap sesuai KTP"
                                        />

                                        {/* Nama Panggilan */}
                                        <Input
                                            label="Nama Panggilan"
                                            value={formData.nickname}
                                            onChange={(e) => updateField('nickname', e.target.value)}
                                            placeholder="Masukkan nama panggilan (jika ada)"
                                        />

                                        {/* No. KTP */}
                                        <Input
                                            label="No. KTP *"
                                            required
                                            value={formData.id_card_number}
                                            onChange={(e) => updateField('id_card_number', e.target.value)}
                                            placeholder="Masukkan nomor KTP"
                                        />

                                        {/* Tempat Lahir */}
                                        <Input
                                            label="Tempat Lahir *"
                                            required
                                            value={formData.birth_place}
                                            onChange={(e) => updateField('birth_place', e.target.value)}
                                            placeholder="Masukkan tempat lahir"
                                        />

                                        {/* Tanggal Lahir */}
                                        <Input
                                            label="Tanggal Lahir *"
                                            type="date"
                                            required
                                            value={formData.birth_date}
                                            onChange={(e) => updateField('birth_date', e.target.value)}
                                        />

                                        {/* Jenis Kelamin */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 mb-2">
                                                Jenis Kelamin <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="flex items-center gap-6 pt-1">
                                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        checked={formData.gender === 'male'}
                                                        onChange={() => updateField('gender', 'male')}
                                                        className="w-4 h-4 text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                                                    />
                                                    <span>Laki-laki</span>
                                                </label>
                                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        checked={formData.gender === 'female'}
                                                        onChange={() => updateField('gender', 'female')}
                                                        className="w-4 h-4 text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                                                    />
                                                    <span>Perempuan</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Status Pernikahan with SelectSearch */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                                Status Pernikahan <span className="text-rose-500">*</span>
                                            </label>
                                            <SelectSearch
                                                options={maritalStatusOptions}
                                                value={formData.marital_status}
                                                onChange={(val) => updateField('marital_status', val)}
                                                placeholder="Pilih status pernikahan"
                                                clearable={false}
                                                required
                                            />
                                        </div>

                                        {/* Pekerjaan */}
                                        <Input
                                            label="Pekerjaan *"
                                            required
                                            value={formData.occupation}
                                            onChange={(e) => updateField('occupation', e.target.value)}
                                            placeholder="Masukkan pekerjaan Anda"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: INFORMASI KONTAK (Image 4) ───────────────── */}
                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    Informasi Kontak
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Lengkapi informasi kontak Anda agar kami dapat menghubungi Anda dengan mudah.
                                </p>
                            </div>

                            {/* Info Banner */}
                            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-950">
                                <Info className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                                <div>
                                    <strong className="font-bold text-[#4F46E5]">Informasi penting:</strong>{' '}
                                    <span>Pastikan nomor WhatsApp dan email yang Anda masukkan aktif, agar tidak terlewat informasi penting dari kami.</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Informasi Kontak Utama */}
                                <div>
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                                        Informasi Kontak Utama
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* No. WhatsApp Aktif */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 mb-1">
                                                No. WhatsApp Aktif <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="flex gap-2">
                                                <div className="relative w-24 shrink-0">
                                                    <select
                                                        value={formData.phone_country_code}
                                                        onChange={(e) => updateField('phone_country_code', e.target.value)}
                                                        className="w-full appearance-none px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-hidden cursor-pointer"
                                                    >
                                                        <option value="+62">+62</option>
                                                        <option value="+60">+60</option>
                                                        <option value="+65">+65</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                                </div>
                                                <Input
                                                    type="tel"
                                                    required
                                                    value={formData.phone}
                                                    onChange={(e) => updateField('phone', e.target.value)}
                                                    placeholder="Masukkan nomor WhatsApp aktif Anda"
                                                />
                                            </div>
                                            <p className="text-[11px] text-slate-400 mt-1 font-medium">
                                                Pastikan nomor aktif dan dapat dihubungi.
                                            </p>
                                        </div>

                                        {/* Email Aktif */}
                                        <div>
                                            <Input
                                                label="Email Aktif *"
                                                type="email"
                                                required
                                                icon={<Mail className="w-4 h-4 text-slate-400" />}
                                                value={formData.email}
                                                onChange={(e) => updateField('email', e.target.value)}
                                                placeholder="Masukkan email aktif Anda"
                                                helperText="Pastikan email aktif untuk menerima informasi."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Alamat Lengkap */}
                                <div>
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                                        Alamat Lengkap
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 mb-1">
                                                Alamat Lengkap <span className="text-rose-500">*</span>
                                            </label>
                                            <textarea
                                                rows={3}
                                                required
                                                value={formData.address}
                                                onChange={(e) => updateField('address', e.target.value)}
                                                placeholder="Masukkan alamat lengkap (nama jalan, nomor, RT/RW, dll.)"
                                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-indigo-500/10 outline-hidden"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {/* Kota / Kabupaten */}
                                            <Input
                                                label="Kota / Kabupaten *"
                                                required
                                                value={formData.city}
                                                onChange={(e) => updateField('city', e.target.value)}
                                                placeholder="Pilih kota / kabupaten"
                                            />

                                            {/* Provinsi with SelectSearch */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                                    Provinsi <span className="text-rose-500">*</span>
                                                </label>
                                                <SelectSearch
                                                    options={provinceOptions}
                                                    value={formData.province}
                                                    onChange={(val) => updateField('province', val)}
                                                    placeholder="Pilih provinsi"
                                                    searchPlaceholder="Cari provinsi..."
                                                    clearable={false}
                                                    required
                                                />
                                            </div>

                                            {/* Kode Pos */}
                                            <Input
                                                label="Kode Pos *"
                                                required
                                                value={formData.postal_code}
                                                onChange={(e) => updateField('postal_code', e.target.value)}
                                                placeholder="Masukkan kode pos"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Preferensi Komunikasi */}
                                <div>
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">
                                        Preferensi Komunikasi <span className="text-rose-500">*</span>
                                    </h3>
                                    <p className="text-[11px] text-slate-500 mb-3">
                                        Pilih cara terbaik untuk tim kami menghubungi Anda.
                                    </p>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {/* WhatsApp Option */}
                                        <div
                                            onClick={() => updateField('communication_preference', 'whatsapp')}
                                            className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                                                formData.communication_preference === 'whatsapp'
                                                    ? 'bg-indigo-50/60 border-[#4F46E5] shadow-xs'
                                                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="w-5 h-5 rounded-full border border-[#4F46E5] flex items-center justify-center bg-[#4F46E5] text-white shrink-0">
                                                <Check className="w-3 h-3 stroke-[3]" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-xs text-slate-900 flex items-center gap-1">
                                                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span>WhatsApp</span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium">Dianjurkan</span>
                                            </div>
                                        </div>

                                        {/* Telepon Option */}
                                        <div
                                            onClick={() => updateField('communication_preference', 'telepon')}
                                            className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                                                formData.communication_preference === 'telepon'
                                                    ? 'bg-indigo-50/60 border-[#4F46E5] shadow-xs'
                                                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <Phone className="w-4 h-4 text-slate-600 shrink-0 ml-1" />
                                            <span className="font-bold text-xs text-slate-800">Telepon</span>
                                        </div>

                                        {/* Email Option */}
                                        <div
                                            onClick={() => updateField('communication_preference', 'email')}
                                            className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                                                formData.communication_preference === 'email'
                                                    ? 'bg-indigo-50/60 border-[#4F46E5] shadow-xs'
                                                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <Mail className="w-4 h-4 text-slate-600 shrink-0 ml-1" />
                                            <span className="font-bold text-xs text-slate-800">Email</span>
                                        </div>

                                        {/* SMS Option */}
                                        <div
                                            onClick={() => updateField('communication_preference', 'sms')}
                                            className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                                                formData.communication_preference === 'sms'
                                                    ? 'bg-indigo-50/60 border-[#4F46E5] shadow-xs'
                                                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <MessageCircle className="w-4 h-4 text-slate-600 shrink-0 ml-1" />
                                            <span className="font-bold text-xs text-slate-800">SMS</span>
                                        </div>
                                    </div>

                                    {/* Waktu Terbaik Dihubungi with SelectSearch */}
                                    <div className="mt-4">
                                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                            Waktu Terbaik Dihubungi (Opsional)
                                        </label>
                                        <SelectSearch
                                            options={contactTimeOptions}
                                            value={formData.best_contact_time}
                                            onChange={(val) => updateField('best_contact_time', val)}
                                            placeholder="Pilih waktu terbaik dihubungi"
                                            clearable={false}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: INFORMASI KHUSUS PROJECT (Image 3) ───────── */}
                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    Informasi Khusus Project
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Lengkapi informasi yang sesuai dengan kategori project yang Anda pilih.
                                </p>
                            </div>

                            {/* Category Badge Box */}
                            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3.5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 block">Kategori Project Terpilih</span>
                                        <strong className="text-xs font-extrabold text-slate-900">{currentCategoryName}</strong>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(1)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-white text-[11px] font-bold text-[#4F46E5] hover:bg-indigo-50 transition-colors cursor-pointer"
                                >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Ubah Kategori</span>
                                </button>
                            </div>

                            {/* Info Banner */}
                            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-950">
                                <Info className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                                <div>
                                    <strong className="font-bold text-[#4F46E5]">Informasi:</strong>{' '}
                                    <span>Informasi di bawah ini khusus untuk kategori Wedding. Pastikan semua data diisi dengan benar.</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* CPW Section */}
                                <div className="space-y-3">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                        Data Mempelai Pria (CPW)
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <Input
                                            label="Nama Lengkap CPW *"
                                            required
                                            value={formData.groom_name}
                                            onChange={(e) => updateField('groom_name', e.target.value)}
                                            placeholder="Masukkan nama lengkap CPW"
                                        />

                                        <Input
                                            label="Nama Panggilan CPW"
                                            value={formData.groom_nickname}
                                            onChange={(e) => updateField('groom_nickname', e.target.value)}
                                            placeholder="Masukkan nama panggilan CPW (jika ada)"
                                        />

                                        <Input
                                            label="Tempat Lahir CPW *"
                                            required
                                            value={formData.groom_birth_place}
                                            onChange={(e) => updateField('groom_birth_place', e.target.value)}
                                            placeholder="Masukkan tempat lahir CPW"
                                        />

                                        <Input
                                            label="Tanggal Lahir CPW *"
                                            type="date"
                                            required
                                            value={formData.groom_birth_date}
                                            onChange={(e) => updateField('groom_birth_date', e.target.value)}
                                        />

                                        {/* Agama CPW with SelectSearch */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                                Agama CPW <span className="text-rose-500">*</span>
                                            </label>
                                            <SelectSearch
                                                options={religionOptions}
                                                value={formData.groom_religion}
                                                onChange={(val) => updateField('groom_religion', val)}
                                                placeholder="Pilih agama CPW"
                                                clearable={false}
                                                required
                                            />
                                        </div>

                                        <Input
                                            label="Pekerjaan CPW *"
                                            required
                                            value={formData.groom_occupation}
                                            onChange={(e) => updateField('groom_occupation', e.target.value)}
                                            placeholder="Masukkan pekerjaan CPW"
                                        />
                                    </div>

                                    {/* Social Media Row CPW */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                        <Input
                                            label="Akun Instagram CPW"
                                            icon={<Instagram className="w-4 h-4 text-pink-500" />}
                                            value={formData.groom_instagram}
                                            onChange={(e) => updateField('groom_instagram', e.target.value)}
                                            placeholder="@username"
                                        />

                                        <Input
                                            label="Akun Social Media Lain (CPW)"
                                            value={formData.groom_tiktok}
                                            onChange={(e) => updateField('groom_tiktok', e.target.value)}
                                            placeholder="@username TikTok / Lainnya"
                                        />
                                    </div>
                                </div>

                                {/* CPP Section */}
                                <div className="space-y-3 pt-2">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                        Data Mempelai Wanita (CPP)
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <Input
                                            label="Nama Lengkap CPP *"
                                            required
                                            value={formData.bride_name}
                                            onChange={(e) => updateField('bride_name', e.target.value)}
                                            placeholder="Masukkan nama lengkap CPP"
                                        />

                                        <Input
                                            label="Nama Panggilan CPP"
                                            value={formData.bride_nickname}
                                            onChange={(e) => updateField('bride_nickname', e.target.value)}
                                            placeholder="Masukkan nama panggilan CPP (jika ada)"
                                        />

                                        <Input
                                            label="Tempat Lahir CPP *"
                                            required
                                            value={formData.bride_birth_place}
                                            onChange={(e) => updateField('bride_birth_place', e.target.value)}
                                            placeholder="Masukkan tempat lahir CPP"
                                        />

                                        <Input
                                            label="Tanggal Lahir CPP *"
                                            type="date"
                                            required
                                            value={formData.bride_birth_date}
                                            onChange={(e) => updateField('bride_birth_date', e.target.value)}
                                        />

                                        {/* Agama CPP with SelectSearch */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                                Agama CPP <span className="text-rose-500">*</span>
                                            </label>
                                            <SelectSearch
                                                options={religionOptions}
                                                value={formData.bride_religion}
                                                onChange={(val) => updateField('bride_religion', val)}
                                                placeholder="Pilih agama CPP"
                                                clearable={false}
                                                required
                                            />
                                        </div>

                                        <Input
                                            label="Pekerjaan CPP *"
                                            required
                                            value={formData.bride_occupation}
                                            onChange={(e) => updateField('bride_occupation', e.target.value)}
                                            placeholder="Masukkan pekerjaan CPP"
                                        />
                                    </div>

                                    {/* Social Media Row CPP */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                        <Input
                                            label="Akun Instagram CPP"
                                            icon={<Instagram className="w-4 h-4 text-pink-500" />}
                                            value={formData.bride_instagram}
                                            onChange={(e) => updateField('bride_instagram', e.target.value)}
                                            placeholder="@username"
                                        />

                                        <Input
                                            label="Akun Social Media Lain (CPP)"
                                            value={formData.bride_tiktok}
                                            onChange={(e) => updateField('bride_tiktok', e.target.value)}
                                            placeholder="@username TikTok / Lainnya"
                                        />
                                    </div>
                                </div>

                                {/* Informasi Pernikahan Section */}
                                <div className="space-y-3 pt-2">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                        Informasi Pernikahan
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <Input
                                            label="Tanggal Pernikahan / Akad *"
                                            type="date"
                                            required
                                            value={formData.event_date}
                                            onChange={(e) => updateField('event_date', e.target.value)}
                                        />

                                        <Input
                                            label="Waktu Pernikahan / Akad *"
                                            required
                                            value={formData.event_time}
                                            onChange={(e) => updateField('event_time', e.target.value)}
                                            placeholder="Contoh: 10.00 WIB"
                                        />

                                        <Input
                                            label="Tempat / Venue *"
                                            required
                                            value={formData.location}
                                            onChange={(e) => updateField('location', e.target.value)}
                                            placeholder="Masukkan tempat / venue pernikahan"
                                        />

                                        <Input
                                            label="Lokasi Resepsi (Jika berbeda)"
                                            value={formData.reception_location}
                                            onChange={(e) => updateField('reception_location', e.target.value)}
                                            placeholder="Masukkan lokasi resepsi"
                                        />

                                        <Input
                                            label="Jumlah Tamu (Estimasi)"
                                            value={formData.estimated_guests}
                                            onChange={(e) => updateField('estimated_guests', e.target.value)}
                                            placeholder="Contoh: 300 - 400 Orang"
                                        />

                                        {/* Jenis Acara with SelectSearch */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                                Jenis Acara <span className="text-rose-500">*</span>
                                            </label>
                                            <SelectSearch
                                                options={eventTypeOptions}
                                                value={formData.event_type}
                                                onChange={(val) => updateField('event_type', val)}
                                                placeholder="Pilih jenis acara"
                                                clearable={false}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Catatan Tambahan */}
                                    <div className="pt-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-bold text-slate-800">
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
                                            onChange={(e) => updateField('project_notes', e.target.value)}
                                            placeholder="Masukkan catatan tambahan terkait kebutuhan project Anda"
                                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-hidden focus:bg-white focus:border-[#4F46E5]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 4: INFORMASI TAMBAHAN (Image 2) ──────────────── */}
                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    Informasi Tambahan
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Informasi tambahan dan preferensi yang akan membantu kami memberikan layanan terbaik.
                                </p>
                            </div>

                            {/* Info Banner */}
                            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-950">
                                <Info className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                                <div>
                                    <strong className="font-bold text-[#4F46E5]">Informasi:</strong>{' '}
                                    <span>Semua informasi bersifat opsional namun akan sangat membantu kami dalam mempersiapkan sesi terbaik untuk Anda.</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Preferensi & Kebutuhan */}
                                <div>
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                                        Preferensi &amp; Kebutuhan
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Left Column */}
                                        <div className="space-y-3">
                                            {/* Paket / Layanan with SelectSearch */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                                    Paket / Layanan yang Diminati (Opsional)
                                                </label>
                                                <SelectSearch
                                                    options={packageOptions}
                                                    value={formData.package_id}
                                                    onChange={(val) => updateField('package_id', val)}
                                                    placeholder="Pilih paket atau layanan"
                                                    searchPlaceholder="Cari paket..."
                                                    clearable={true}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-800 mb-1">
                                                    Konsep / Tema yang Diinginkan (Opsional)
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    value={formData.concept_theme}
                                                    onChange={(e) => updateField('concept_theme', e.target.value)}
                                                    placeholder="Masukkan konsep atau tema yang Anda inginkan"
                                                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-hidden"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-800 mb-1">
                                                    Warna / Style Favorit (Opsional)
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    value={formData.favorite_style}
                                                    onChange={(e) => updateField('favorite_style', e.target.value)}
                                                    placeholder="Masukkan warna atau style favorit Anda"
                                                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-hidden"
                                                />
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-800 mb-2">
                                                    Apakah ada referensi foto/pose/style yang disukai?
                                                </label>
                                                <div className="flex items-center gap-6 pb-1">
                                                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="has_reference"
                                                            checked={formData.has_reference === 'yes'}
                                                            onChange={() => updateField('has_reference', 'yes')}
                                                            className="w-4 h-4 text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                                                        />
                                                        <span>Ada</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="has_reference"
                                                            checked={formData.has_reference === 'no'}
                                                            onChange={() => updateField('has_reference', 'no')}
                                                            className="w-4 h-4 text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                                                        />
                                                        <span>Tidak ada</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <Input
                                                label="Jika ada, silakan jelaskan atau lampirkan (link/drive) *"
                                                value={formData.reference_url}
                                                onChange={(e) => updateField('reference_url', e.target.value)}
                                                placeholder="Masukkan link Google Drive / Pinterest / lainnya"
                                            />

                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="block text-xs font-bold text-slate-800">
                                                        Catatan Khusus / Permintaan Lain (Opsional)
                                                    </label>
                                                    <span className="text-[10px] text-slate-400">
                                                        {formData.special_requests.length} / 500
                                                    </span>
                                                </div>
                                                <textarea
                                                    rows={2}
                                                    maxLength={500}
                                                    value={formData.special_requests}
                                                    onChange={(e) => updateField('special_requests', e.target.value)}
                                                    placeholder="Tuliskan catatan atau permintaan khusus untuk tim kami"
                                                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-hidden"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sumber & Referral */}
                                <div>
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                                        Sumber &amp; Referral
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Sumber Informasi with SelectSearch */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                                Dari mana Anda mengetahui Arams Pictures? <span className="text-rose-500">*</span>
                                            </label>
                                            <SelectSearch
                                                options={sourceOptions}
                                                value={formData.source_info}
                                                onChange={(val) => updateField('source_info', val)}
                                                placeholder="Pilih sumber informasi"
                                                clearable={false}
                                                required
                                            />
                                        </div>

                                        <Input
                                            label="Nama Sumber / Referral (Jika ada)"
                                            value={formData.referral_name}
                                            onChange={(e) => updateField('referral_name', e.target.value)}
                                            placeholder="Masukkan nama sumber atau referral (jika ada)"
                                        />
                                    </div>
                                </div>

                                {/* Persetujuan & Konfirmasi */}
                                <div className="pt-2 space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                        Persetujuan &amp; Konfirmasi
                                    </h3>

                                    <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.agree_data_accurate}
                                            onChange={(e) => updateField('agree_data_accurate', e.target.checked)}
                                            className="w-4 h-4 text-[#4F46E5] rounded-sm focus:ring-[#4F46E5] mt-0.5 cursor-pointer shrink-0"
                                        />
                                        <span>Saya menyatakan bahwa semua data yang saya berikan adalah benar dan dapat dipertanggungjawabkan.</span>
                                    </label>

                                    <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.agree_privacy_policy}
                                            onChange={(e) => updateField('agree_privacy_policy', e.target.checked)}
                                            className="w-4 h-4 text-[#4F46E5] rounded-sm focus:ring-[#4F46E5] mt-0.5 cursor-pointer shrink-0"
                                        />
                                        <span>Saya setuju data yang saya berikan digunakan oleh Arams Pictures untuk keperluan pemesanan, komunikasi, dan administrasi sesuai dengan kebijakan privasi.</span>
                                    </label>

                                    <p className="text-[10px] text-rose-500 font-bold">* Wajib diisi</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 5: REVIEW & KIRIM (Image 1) ─────────────────── */}
                    {currentStep === 5 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                    Review &amp; Kirim
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Mohon periksa kembali seluruh informasi yang telah Anda isi sebelum dikirim.
                                </p>
                            </div>

                            {/* Info Banner */}
                            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-950">
                                <Info className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                                <div>
                                    <strong className="font-bold text-[#4F46E5]">Pastikan semua data sudah benar:</strong>{' '}
                                    <span>Data yang sudah dikirim akan kami review. Anda masih dapat menghubungi kami jika perlu melakukan perubahan.</span>
                                </div>
                            </div>

                            {/* Review Cards Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Card 1: Kategori & Identitas */}
                                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 flex flex-col justify-between shadow-2xs">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                                            <FileText className="w-3.5 h-3.5 text-[#4F46E5]" />
                                            <span>Kategori &amp; Identitas</span>
                                        </div>
                                        <div className="space-y-1.5 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Kategori Project:</span>
                                                <span className="font-bold text-slate-900">{currentCategoryName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Nama Panggilan:</span>
                                                <span className="font-bold text-slate-900">{formData.groom_nickname} &amp; {formData.bride_nickname}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Tanggal Mengisi Form:</span>
                                                <span className="font-bold text-slate-900">27 Agustus 2026</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(1)}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4F46E5] hover:underline cursor-pointer pt-2"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                        <span>Ubah</span>
                                    </button>
                                </div>

                                {/* Card 2: Informasi Kontak */}
                                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 flex flex-col justify-between shadow-2xs">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                                            <Phone className="w-3.5 h-3.5 text-[#4F46E5]" />
                                            <span>Informasi Kontak</span>
                                        </div>
                                        <div className="space-y-1.5 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">No. WhatsApp:</span>
                                                <span className="font-bold text-slate-900">+{formData.phone_country_code.replace('+', '')} {formData.phone}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Email:</span>
                                                <span className="font-bold text-slate-900">{formData.email}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Alamat Lengkap:</span>
                                                <span className="font-semibold text-slate-900 text-right max-w-[200px] truncate">{formData.address}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Kota / Kabupaten:</span>
                                                <span className="font-bold text-slate-900">{formData.city}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Provinsi:</span>
                                                <span className="font-bold text-slate-900">{formData.province}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Kode Pos:</span>
                                                <span className="font-bold text-slate-900">{formData.postal_code}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Preferensi Komunikasi:</span>
                                                <span className="font-bold text-slate-900 uppercase">{formData.communication_preference}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Waktu Terbaik Dihubungi:</span>
                                                <span className="font-bold text-slate-900">{formData.best_contact_time === 'siang' ? 'Siang (10.00 - 16.00)' : formData.best_contact_time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(2)}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4F46E5] hover:underline cursor-pointer pt-2"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                        <span>Ubah</span>
                                    </button>
                                </div>
                            </div>

                            {/* Card 3: Informasi Khusus Project (Span 2) */}
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                                        <User className="w-3.5 h-3.5 text-[#4F46E5]" />
                                        <span>Informasi Khusus Project</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(3)}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4F46E5] hover:underline cursor-pointer"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                        <span>Ubah</span>
                                    </button>
                                </div>

                                {/* CPW Block */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-800">Data Mempelai Pria (CPW)</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 text-xs text-slate-700">
                                        <div><span className="text-slate-400 block text-[10px]">Nama Lengkap</span><strong>{formData.groom_name}</strong></div>
                                        <div><span className="text-slate-400 block text-[10px]">Nama Panggilan</span><strong>{formData.groom_nickname}</strong></div>
                                        <div><span className="text-slate-400 block text-[10px]">Tempat, Tgl Lahir</span><strong>{formData.groom_birth_place}, 12 Januari 1995</strong></div>
                                        <div><span className="text-slate-400 block text-[10px]">Akun Instagram</span><strong>{formData.groom_instagram}</strong></div>
                                        <div><span className="text-slate-400 block text-[10px]">Agama</span><strong>{formData.groom_religion}</strong></div>
                                        <div><span className="text-slate-400 block text-[10px]">Pekerjaan</span><strong>{formData.groom_occupation}</strong></div>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100" />

                                {/* CPP Block */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-800">Data Mempelai Wanita (CPP)</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 text-xs text-slate-700">
                                        <div><span className="text-slate-400 block text-[10px]">Nama Lengkap</span><strong>{formData.bride_name}</strong></div>
                                        <div><span className="text-slate-400 block text-[10px]">Nama Panggilan</span><strong>{formData.bride_nickname}</strong></div>
                                        <div><span className="text-slate-400 block text-[10px]">Tempat, Tgl Lahir</span><strong>{formData.bride_birth_place}, 20 Mei 1996</strong></div>
                                        <div><span className="text-slate-400 block text-[10px]">Akun Instagram</span><strong>{formData.bride_instagram}</strong></div>
                                        <div><span className="text-slate-400 block text-[10px]">Agama</span><strong>{formData.bride_religion}</strong></div>
                                        <div><span className="text-slate-400 block text-[10px]">Pekerjaan</span><strong>{formData.bride_occupation}</strong></div>
                                    </div>
                                </div>
                            </div>

                            {/* Row Cards: Informasi Tambahan, Pernikahan, Preferensi */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Card 4: Informasi Tambahan */}
                                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 flex flex-col justify-between shadow-2xs">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                                            <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />
                                            <span>Informasi Tambahan</span>
                                        </div>
                                        <div className="space-y-1.5 text-xs">
                                            <div><span className="text-slate-400 block text-[10px]">Paket / Layanan:</span><strong>Wedding Gold</strong></div>
                                            <div><span className="text-slate-400 block text-[10px]">Referensi Foto/Style:</span><strong>{formData.has_reference === 'yes' ? 'Ada' : 'Tidak Ada'}</strong></div>
                                            <div><span className="text-slate-400 block text-[10px]">Konsep / Tema:</span><strong>{formData.concept_theme}</strong></div>
                                            <div><span className="text-slate-400 block text-[10px]">Warna / Style:</span><strong>{formData.favorite_style}</strong></div>
                                            <div><span className="text-slate-400 block text-[10px]">Catatan Khusus:</span><strong className="text-[11px]">{formData.project_notes}</strong></div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(4)}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4F46E5] hover:underline cursor-pointer pt-2"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                        <span>Ubah</span>
                                    </button>
                                </div>

                                {/* Card 5: Informasi Pernikahan */}
                                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 flex flex-col justify-between shadow-2xs">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                                            <Calendar className="w-3.5 h-3.5 text-[#4F46E5]" />
                                            <span>Informasi Pernikahan</span>
                                        </div>
                                        <div className="space-y-1.5 text-xs">
                                            <div><span className="text-slate-400 block text-[10px]">Tanggal Pernikahan:</span><strong>12 Desember 2026</strong></div>
                                            <div><span className="text-slate-400 block text-[10px]">Waktu:</span><strong>{formData.event_time}</strong></div>
                                            <div><span className="text-slate-400 block text-[10px]">Tempat / Venue:</span><strong>Gedung Graha Arams</strong></div>
                                            <div><span className="text-slate-400 block text-[10px]">Estimasi Tamu:</span><strong>{formData.estimated_guests}</strong></div>
                                            <div><span className="text-slate-400 block text-[10px]">Jenis Acara:</span><strong>{formData.event_type}</strong></div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(3)}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4F46E5] hover:underline cursor-pointer pt-2"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                        <span>Ubah</span>
                                    </button>
                                </div>

                                {/* Card 6: Preferensi & Kebutuhan Checklist */}
                                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 flex flex-col justify-between shadow-2xs">
                                    <div className="space-y-2.5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#4F46E5]" />
                                            <span>Preferensi &amp; Kebutuhan</span>
                                        </div>
                                        <ul className="space-y-2 text-xs text-slate-700">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#4F46E5] shrink-0 mt-0.5" />
                                                <span>Layanan yang diminta: Foto &amp; Video Wedding</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#4F46E5] shrink-0 mt-0.5" />
                                                <span>Ingin dokumentasi dari persiapan sampai resepsi selesai</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#4F46E5] shrink-0 mt-0.5" />
                                                <span>Ingin sesi foto prewedding (outdoor)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#4F46E5] shrink-0 mt-0.5" />
                                                <span>Butuh dokumentasi dengan drone</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(4)}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4F46E5] hover:underline cursor-pointer pt-2"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                        <span>Ubah</span>
                                    </button>
                                </div>
                            </div>

                            {/* Confirmation Box */}
                            <div className="p-4 bg-slate-50/60 rounded-2xl border border-slate-200/80 space-y-2">
                                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.agree_data_accurate}
                                        onChange={(e) => updateField('agree_data_accurate', e.target.checked)}
                                        className="w-4 h-4 text-[#4F46E5] rounded-sm focus:ring-[#4F46E5] mt-0.5 cursor-pointer shrink-0"
                                    />
                                    <div>
                                        <span className="font-bold">Saya menyatakan bahwa semua data yang saya berikan adalah benar dan dapat dipertanggungjawabkan.</span>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            Saya setuju data yang saya berikan digunakan oleh Arams Pictures untuk keperluan pemesanan, komunikasi, dan administrasi sesuai dengan kebijakan privasi.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── BOTTOM NAVIGATION BUTTONS ───────────────────────────── */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-100 mt-8 max-w-5xl mx-auto w-full">
                    {/* Kembali Button */}
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            currentStep === 1
                                ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Kembali</span>
                    </button>

                    {/* Next / Submit Button */}
                    {currentStep < 5 ? (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                        >
                            <span>Selanjutnya</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    ) : (
                        <div className="flex flex-col items-end gap-1">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="inline-flex items-center gap-2 px-7 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                            >
                                <span>{isSubmitting ? 'Mengirim...' : 'Kirim Formulir'}</span>
                                <Send className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] text-slate-400 font-medium">
                                Data akan dikirim untuk ditinjau oleh tim kami
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
