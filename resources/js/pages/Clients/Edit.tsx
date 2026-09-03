import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { SelectSearch } from '@/components/ui/select-search';

export interface ClientItemOption {
    id: string;
    name: string;
    phone?: string;
    city?: string;
    email?: string;
    bride_name?: string;
    groom_name?: string;
}

interface ClientEditProps {
    client: {
        id: string;
        name: string;
        partner_name?: string;
        bride_name?: string;
        bride_nickname?: string;
        groom_name?: string;
        groom_nickname?: string;
        bride_birth_date?: string;
        groom_birth_date?: string;
        company_name?: string;
        client_type?: string;
        email?: string;
        instagram?: string;
        phone: string;
        secondary_phone?: string;
        preferred_contact?: string;
        province?: string;
        city?: string;
        district?: string;
        village?: string;
        postal_code?: string;
        address?: string;
        source?: string;
        referred_by_client_id?: string;
        wedding_organizer_id?: string;
        referral_name?: string;
        status: string;
        notes?: string;
        birth_date?: string;
        job_title?: string;
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
        id: string;
        name: string;
        slug?: string;
        description?: string;
        color?: string;
    }>;
}

export default function ClientEdit({ client, all_clients = [], wedding_organizers = [], categories = [] }: ClientEditProps) {
    const { appSettings } = usePage().props as any;
    const breadcrumbColor = appSettings?.breadcrumb_color || '#C98922';
    const breadcrumbActiveColor = appSettings?.breadcrumb_active_color || '#FFFFFF';

    const [name, setName] = useState(client.name || '');
    const [partnerName, setPartnerName] = useState(client.partner_name || '');
    const [brideName, setBrideName] = useState(client.bride_name || '');
    const [brideNickname, setBrideNickname] = useState(client.bride_nickname || '');
    const [groomName, setGroomName] = useState(client.groom_name || '');
    const [groomNickname, setGroomNickname] = useState(client.groom_nickname || '');
    const [brideBirthDate, setBrideBirthDate] = useState(client.bride_birth_date ? String(client.bride_birth_date).substring(0, 10) : '');
    const [groomBirthDate, setGroomBirthDate] = useState(client.groom_birth_date ? String(client.groom_birth_date).substring(0, 10) : '');
    const [companyName, setCompanyName] = useState(client.company_name || '');
    const [clientType, setClientType] = useState(client.client_type || 'wedding');
    const [email, setEmail] = useState(client.email || '');
    const [instagram, setInstagram] = useState(client.instagram || '');
    const [phone, setPhone] = useState(client.phone || '');
    const [secondaryPhone, setSecondaryPhone] = useState(client.secondary_phone || '');
    const [preferredContact, setPreferredContact] = useState(client.preferred_contact || 'whatsapp');
    const [city, setCity] = useState(client.city || '');
    const [address, setAddress] = useState(client.address || '');
    const [source, setSource] = useState(client.source || 'Instagram');
    const [referredByClientId, setReferredByClientId] = useState(client.referred_by_client_id || '');
    const [weddingOrganizerId, setWeddingOrganizerId] = useState(client.wedding_organizer_id || '');
    const [referralName, setReferralName] = useState(client.referral_name || '');
    const [status, setStatus] = useState(client.status || 'active');
    const [birthDate, setBirthDate] = useState(client.birth_date || '');
    const [jobTitle, setJobTitle] = useState(client.job_title || '');
    const [notes, setNotes] = useState(client.notes || '');
    const [submitting, setSubmitting] = useState(false);

    // Kategori / Tipe Klien dynamically fetched from Master Data Categories
    const categoryOptions = useMemo(() => {
        const list = (categories || []).map((cat) => ({
            value: cat.slug || String(cat.id),
            label: cat.name,
            subtitle: cat.description || `Master Kategori: ${cat.name}`,
        }));

        if (clientType && !list.some((o) => o.value === clientType)) {
            if (clientType === 'personal') {
                const perorangan = list.find((o) => o.value === 'perorangan');
                list.unshift({
                    value: 'personal',
                    label: perorangan ? `${perorangan.label} (Personal)` : 'Personal Portrait',
                    subtitle: 'Kategori Klien',
                });
            } else if (clientType === 'family') {
                list.unshift({
                    value: 'family',
                    label: 'Family & Maternity',
                    subtitle: 'Kategori Klien',
                });
            } else {
                list.push({
                    value: clientType,
                    label: clientType.charAt(0).toUpperCase() + clientType.slice(1),
                    subtitle: 'Kategori Klien',
                });
            }
        }

        return list;
    }, [categories, clientType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Nama lengkap wajib diisi');
            return;
        }

        if (!phone.trim()) {
            toast.error('Nomor telepon wajib diisi');
            return;
        }

        setSubmitting(true);

        router.put(
            `/clients/${client.id}`,
            {
                name,
                partner_name: partnerName || null,
                bride_name: brideName || null,
                bride_nickname: brideNickname || null,
                groom_name: groomName || null,
                groom_nickname: groomNickname || null,
                bride_birth_date: brideBirthDate || null,
                groom_birth_date: groomBirthDate || null,
                company_name: companyName || null,
                client_type: clientType,
                email: email || null,
                instagram: instagram || null,
                phone,
                secondary_phone: secondaryPhone || null,
                preferred_contact: preferredContact,
                city: city || null,
                address: address || null,
                source: source || null,
                referred_by_client_id: referredByClientId || null,
                wedding_organizer_id: weddingOrganizerId || null,
                referral_name: referralName || null,
                status,
                notes: notes || null,
            },
            {
                onSuccess: () => {
                    toast.success('Data klien berhasil diperbarui!');
                    router.visit(`/clients/${client.id}`);
                },
                onError: () => {
                    toast.error('Gagal memperbarui data klien. Periksa kembali form.');
                },
                onFinish: () => setSubmitting(false),
            }
        );
    };

    return (
        <div className="w-full max-w-full space-y-6 pb-12">
            <Head title={`Edit ${client.name} - Arams CRM`} />

            {/* Breadcrumb Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                    <Link
                        href="/clients"
                        style={{ color: breadcrumbColor }}
                        className="hover:underline font-medium"
                    >
                        Clients
                    </Link>
                    <span style={{ color: breadcrumbColor }}>›</span>
                    <Link
                        href={`/clients/${client.id}`}
                        style={{ color: breadcrumbColor }}
                        className="hover:underline font-medium"
                    >
                        {client.name}
                    </Link>
                    <span style={{ color: breadcrumbColor }}>›</span>
                    <span style={{ color: breadcrumbActiveColor }} className="font-bold">
                        Edit Data Klien
                    </span>
                </div>

                <Link
                    href={`/clients/${client.id}`}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5 text-xs font-bold shadow-2xs"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Detail</span>
                </Link>
            </div>

            {/* Form Card */}
            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#C89445] flex items-center justify-center font-bold border border-amber-200/60 shadow-2xs">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900">
                            Edit Profil Data Klien
                        </h2>
                        <p className="text-xs text-slate-500">
                            Perbarui identitas, kontak, dan catatan khusus klien.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Nama Pasangan Klien / Tampilan Utama *
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: Sarah Anindita & Dimas Arya"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#C89445] outline-hidden font-bold"
                        />
                    </div>

                    {/* Khusus Wedding: CPW & CPP */}
                    {clientType === 'wedding' && (
                        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                            {/* CPW */}
                            <div className="space-y-2.5">
                                <span className="text-xs font-bold text-pink-600 block">
                                    👰 Calon Pengantin Wanita (CPW)
                                </span>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        Nama Lengkap CPW
                                    </label>
                                    <input
                                        type="text"
                                        value={brideName}
                                        onChange={(e) => setBrideName(e.target.value)}
                                        placeholder="Sarah Anindita Putri"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#C89445] outline-hidden"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                            Panggilan CPW
                                        </label>
                                        <input
                                            type="text"
                                            value={brideNickname}
                                            onChange={(e) => setBrideNickname(e.target.value)}
                                            placeholder="Sarah"
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#C89445] outline-hidden"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                            Tgl Lahir CPW
                                        </label>
                                        <input
                                            type="date"
                                            value={brideBirthDate}
                                            onChange={(e) => setBrideBirthDate(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#C89445] outline-hidden"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* CPP */}
                            <div className="space-y-2.5">
                                <span className="text-xs font-bold text-blue-600 block">
                                    🤵 Calon Pengantin Pria (CPP)
                                </span>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        Nama Lengkap CPP
                                    </label>
                                    <input
                                        type="text"
                                        value={groomName}
                                        onChange={(e) => setGroomName(e.target.value)}
                                        placeholder="Dimas Arya Nugraha"
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#C89445] outline-hidden"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                            Panggilan CPP
                                        </label>
                                        <input
                                            type="text"
                                            value={groomNickname}
                                            onChange={(e) => setGroomNickname(e.target.value)}
                                            placeholder="Dimas"
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#C89445] outline-hidden"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                            Tgl Lahir CPP
                                        </label>
                                        <input
                                            type="date"
                                            value={groomBirthDate}
                                            onChange={(e) => setGroomBirthDate(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#C89445] outline-hidden"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Nama Pasangan / Kontak Pendamping (Opsional)
                        </label>
                        <input
                            type="text"
                            value={partnerName}
                            onChange={(e) => setPartnerName(e.target.value)}
                            placeholder="Contoh: Dimas Arya"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#C89445] outline-hidden"
                        />
                    </div>

                    <div>
                        <SelectSearch
                            label="Kategori / Tipe Klien"
                            value={clientType}
                            onChange={(val) => setClientType(val)}
                            options={categoryOptions}
                            placeholder="Pilih Kategori / Tipe Klien..."
                            searchPlaceholder="Cari kategori dari Master Data..."
                            clearable={false}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                            Kategori diambil langsung dari Master Data Kategori (<Link href="/master-data/categories" className="text-amber-700 hover:underline font-medium">/master-data/categories</Link>).
                        </p>
                    </div>

                    <div>
                        <SelectSearch
                            label="Status Klien"
                            required
                            value={status}
                            onChange={(val) => setStatus(val)}
                            options={[
                                { value: 'active', label: 'Aktif (Sedang Berjalan)', subtitle: 'Klien aktif dalam proyek / sesi' },
                                { value: 'lead', label: 'Prospek / Lead', subtitle: 'Tahap negosiasi / konsultasi awal' },
                                { value: 'completed', label: 'Selesai / Alumni', subtitle: 'Proyek telah selesai seluruhnya' },
                            ]}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            No. WhatsApp / Telepon Utama *
                        </label>
                        <input
                            type="text"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0812-3456-7890"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#C89445] outline-hidden font-mono font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Alamat Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="andipratama@email.com"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#C89445] outline-hidden font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Akun Instagram
                        </label>
                        <input
                            type="text"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="@andipratama"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#C89445] outline-hidden"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Kota Domisili
                        </label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Surabaya, Jawa Timur"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#C89445] outline-hidden"
                        />
                    </div>

                    <div>
                        <SelectSearch
                            label="Sumber Klien (Lead Source)"
                            value={source}
                            onChange={(val) => {
                                setSource(val);
                                if (!['Vendor Partner', 'Referral', 'Rekomendasi Klien', 'Keluarga & Kerabat'].includes(val)) {
                                    setWeddingOrganizerId('');
                                    setReferredByClientId('');
                                    setReferralName('');
                                }
                            }}
                            options={[
                                { value: 'Instagram', label: 'Instagram', subtitle: 'DM Instagram / Feed / Story' },
                                { value: 'Rekomendasi Klien', label: 'Rekomendasi Klien (Client Referral)', subtitle: 'Direferensikan oleh klien terdaftar' },
                                // { value: 'Vendor Partner', label: 'Vendor / WO Partner', subtitle: 'Partner Wedding Organizer / Vendor' },
                                { value: 'Website', label: 'Website Arams Pictures', subtitle: 'Pencarian Google / Form Online' },
                                { value: 'TikTok', label: 'TikTok', subtitle: 'Video FYP / Ads TikTok' },
                                { value: 'Walk-in', label: 'Walk-in / Studio Visit', subtitle: 'Datang langsung ke studio' },
                                { value: 'Keluarga & Kerabat', label: 'Keluarga & Kerabat', subtitle: 'Kerabat / Teman dekat' },
                                { value: 'Pameran / Wedding Expo', label: 'Pameran / Wedding Expo', subtitle: 'Booth pameran pernikahan' },
                                { value: 'Lainnya', label: 'Lainnya', subtitle: 'Sumber lainnya' },
                            ]}
                        />
                    </div>

                    {/* REFERENSI DARI KLIEN TERDAFTAR (SEARCHABLE SELECT DARI DAFTAR KLIEN) */}
                    {['Rekomendasi Klien', 'Referral', 'Vendor Partner', 'Keluarga & Kerabat'].includes(source) && (
                        <div className="sm:col-span-2 p-4 bg-amber-50/70 rounded-2xl border border-amber-200/90 space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                                <Sparkles className="w-4 h-4 text-[#C89445]" />
                                <span>Referensi / Rekomendasi Dari (Pilih Klien Terdaftar)</span>
                            </div>

                            <SelectSearch
                                label="Cari Klien Pereferensi (Select Search)"
                                placeholder="Ketik nama klien, pasangan, no. HP, atau kota..."
                                searchPlaceholder="Ketik untuk mencari dari daftar klien..."
                                value={referredByClientId}
                                onChange={(val) => {
                                    setReferredByClientId(val);
                                    const found = all_clients.find((c) => c.id === val);
                                    if (found) {
                                        setReferralName(found.name);
                                    }
                                }}
                                options={all_clients.map((c) => ({
                                    value: c.id,
                                    label: c.name,
                                    subtitle: [c.phone, c.city].filter(Boolean).join(' • '),
                                }))}
                            />

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                    Atau Ketik Nama Referensi Manual (Jika belum terdaftar):
                                </label>
                                <input
                                    type="text"
                                    value={referralName}
                                    onChange={(e) => setReferralName(e.target.value)}
                                    placeholder="Contoh: Bpk. Hendra Gunawan / Kak Dimas & Sarah"
                                    className="w-full px-3.5 py-2.5 bg-white border border-amber-200/90 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#C89445] outline-hidden font-medium"
                                />
                            </div>
                        </div>
                    )}

                    {source === 'Vendor Partner' && wedding_organizers.length > 0 && (
                        <div className="sm:col-span-2 p-4 bg-purple-50/70 rounded-2xl border border-purple-200/90 space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                                <Building2 className="w-4 h-4 text-purple-600" />
                                <span>Opsi Tambahan: Pilih Vendor / WO Partner Terdaftar</span>
                            </div>
                            <SelectSearch
                                label="Vendor / Wedding Organizer Partner"
                                placeholder="Pilih Vendor / WO Partner..."
                                searchPlaceholder="Cari nama WO atau kota..."
                                value={weddingOrganizerId}
                                onChange={(val) => setWeddingOrganizerId(val)}
                                options={wedding_organizers.map((wo) => ({
                                    value: wo.id,
                                    label: wo.name,
                                    subtitle: [wo.pic_name, wo.city, wo.tier].filter(Boolean).join(' • '),
                                }))}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Pekerjaan / Jabatan
                        </label>
                        <input
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="Entrepreneur, Marketing, Dokter"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#C89445] outline-hidden"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Alamat Lengkap
                    </label>
                    <textarea
                        rows={2}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Alamat lengkap tempat tinggal atau kantor klien..."
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#C89445] outline-hidden resize-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Catatan Khusus Klien
                    </label>
                    <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Catatan preferensi gaya foto, pantangan, instruksi khusus..."
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:border-[#C89445] outline-hidden resize-none"
                    />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <Link
                        href={`/clients/${client.id}`}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
                    >
                        Batal
                    </Link>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        <Check className="w-4 h-4" />
                        <span>{submitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
