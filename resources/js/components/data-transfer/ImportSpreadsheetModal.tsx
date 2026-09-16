import { router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    Loader2,
    Upload,
    UploadCloud,
    X,
    Info,
} from 'lucide-react';
import { useId, useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button, Modal } from '@/components/ui';

type TransferKind = 'clients' | 'projects';

interface ImportSpreadsheetModalProps {
    kind: TransferKind;
    isOpen: boolean;
    onClose: () => void;
    categories?: Array<{ id: string | number; name: string }>;
}

function getColumnLetter(index: number): string {
    let letter = '';
    let temp = index;
    while (temp >= 0) {
        letter = String.fromCharCode((temp % 26) + 65) + letter;
        temp = Math.floor(temp / 26) - 1;
    }
    return letter;
}

// Sample mock data for clients
const CLIENT_SAMPLE_COLUMNS = [
    'nama',
    'tipe_klien',
    'kategori',
    'email',
    'telepon',
    'telepon_kedua',
    'instagram',
    'kontak_preferensi',
    'provinsi',
    'kota',
    'kecamatan',
    'kelurahan',
    'kode_pos',
    'alamat',
    'sumber',
    'sumber_klien',
    'wedding_organizer',
    'status',
    'nama_perusahaan',
    'nama_pasangan',
    'nama_mempelai_wanita',
    'nama_mempelai_pria',
    'nama_anak',
    'nama_ayah',
    'nama_ibu',
    'catatan',
    'tag_dipisah_koma',
    'data_kategori_json',
];

const CLIENT_SAMPLE_ROWS = [
    [
        'Nadia Pratama & Reza Mahendra',
        'wedding',
        'Wedding',
        'nadia@example.com',
        '081234567890',
        '081987654321',
        '@nadia_reza',
        'whatsapp',
        'DKI Jakarta',
        'Jakarta Selatan',
        'Kebayoran Baru',
        'Senayan',
        '12190',
        'Jl. Senopati No. 45',
        'Instagram',
        'Instagram Ads',
        'Glory WO',
        'active',
        '',
        'Reza Mahendra',
        'Nadia Pratama',
        'Reza Mahendra',
        '',
        '',
        '',
        'Preferensi dokumentasi outdoor sunset',
        'VIP, Promo Mei',
        '{"concept_theme":"Outdoor Modern"}',
    ],
    [
        'Budi Santoso & Sarah',
        'wedding',
        'Wedding',
        'budi.sarah@gmail.com',
        '081398765432',
        '',
        '@budisarah',
        'whatsapp',
        'Jawa Barat',
        'Bandung',
        'Coblong',
        'Dago',
        '40135',
        'Jl. Ir. H. Juanda No. 88',
        'Rekomendasi',
        'Walk-In',
        'Elegance WO',
        'active',
        '',
        'Sarah Wijaya',
        'Sarah Wijaya',
        'Budi Santoso',
        '',
        '',
        '',
        'Paket Gold Wedding resepsi malam',
        'Wedding 2026',
        '',
    ],
    [
        'Kevin Sanjaya & Jessica',
        'prewedding',
        'Prewedding',
        'kevin.jess@example.com',
        '081122334455',
        '',
        '@kevin_jessica',
        'whatsapp',
        'Banten',
        'Tangerang Selatan',
        'Serpong',
        'BSD',
        '15310',
        'Cluster Foresta No. 12',
        'Google',
        'Google Search',
        '',
        'active',
        '',
        'Jessica Tan',
        '',
        '',
        '',
        '',
        '',
        'Sesi foto Bromo & Savana',
        'Prewed Outdoor',
        '{"session_location":"Bromo"}',
    ],
    [
        'PT Mahakarya Digital',
        'corporate',
        'Corporate',
        'contact@mahakarya.id',
        '02155667788',
        '081255556666',
        '@mahakaryadigital',
        'email',
        'DKI Jakarta',
        'Jakarta Pusat',
        'Tanah Abang',
        'Karet Tengsin',
        '10220',
        'Gedung Sahid Sudirman Lt. 15',
        'Website',
        'Website Arams',
        '',
        'active',
        'PT Mahakarya Digital',
        '',
        '',
        '',
        '',
        '',
        '',
        'Dokumentasi Annual Gala Dinner',
        'Corporate, Tahunan',
        '',
    ],
];

// Sample mock data for projects
const PROJECT_SAMPLE_COLUMNS = [
    'referensi_proyek',
    'nama_proyek',
    'email_klien',
    'telepon_klien',
    'kategori',
    'paket',
    'status',
    'tanggal_acara',
    'jam_acara',
    'tanggal_selesai',
    'deadline',
    'lokasi',
    'email_supervisor',
    'email_fotografer',
    'email_editor',
    'harga',
    'diskon',
    'pajak',
    'total',
    'sudah_dibayar',
    'catatan',
];

const PROJECT_SAMPLE_ROWS = [
    [
        'PRJ-2026-001',
        'Wedding Nadia & Reza',
        'nadia@example.com',
        '081234567890',
        'Wedding',
        'Paket Gold Wedding',
        'booking',
        '2026-12-20',
        '09:00',
        '2026-12-20',
        '2026-12-27',
        'Hotel Mulia Senayan, Jakarta',
        'supervisor@arams.com',
        'fotografer@arams.com',
        'editor@arams.com',
        '25000000',
        '1000000',
        '0',
        '24000000',
        '10000000',
        'Dokumentasi akad nikah dan resepsi malam',
    ],
    [
        'PRJ-2026-002',
        'Wedding Budi & Sarah',
        'budi.sarah@gmail.com',
        '081398765432',
        'Wedding',
        'Paket Silver Wedding',
        'in_progress',
        '2026-11-15',
        '08:00',
        '2026-11-15',
        '2026-11-22',
        'Grand Ballroom Hilton Bandung',
        'supervisor@arams.com',
        '',
        '',
        '18500000',
        '0',
        '0',
        '18500000',
        '18500000',
        'Lunas pembayaran termin 1 & 2',
    ],
    [
        'PRJ-2026-003',
        'Prewedding Kevin & Jessica',
        'kevin.jess@example.com',
        '081122334455',
        'Prewedding',
        'Paket Prewedding Outdoor',
        'active',
        '2026-10-10',
        '06:00',
        '2026-10-10',
        '2026-10-17',
        'Kawasan Bromo & Savana Jawa Timur',
        '',
        'fotografer@arams.com',
        '',
        '12000000',
        '500000',
        '0',
        '11500000',
        '5000000',
        'Sesi subuh sunrise dan pakaian adat',
    ],
    [
        'PRJ-2026-004',
        'Gala Dinner PT Mahakarya Digital',
        'contact@mahakarya.id',
        '081255556666',
        'Corporate',
        'Paket Event Corporate',
        'completed',
        '2026-09-05',
        '18:30',
        '2026-09-05',
        '2026-09-12',
        'Sahid Sudirman Grand Hall',
        'supervisor@arams.com',
        'fotografer@arams.com',
        'editor@arams.com',
        '15000000',
        '0',
        '0',
        '15000000',
        '15000000',
        'Dokumentasi lengkap foto & video highlight 3 menit',
    ],
];

export function ImportSpreadsheetModal({
    kind,
    isOpen,
    onClose,
    categories = [],
}: ImportSpreadsheetModalProps) {
    const inputId = useId();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const isClients = kind === 'clients';
    const labelTitle = isClients ? 'Klien' : 'Project';
    const filenameTemplate = isClients ? 'template_import_klien.xlsx' : 'template_import_proyek.xlsx';
    const sampleColumns = isClients ? CLIENT_SAMPLE_COLUMNS : PROJECT_SAMPLE_COLUMNS;
    const sampleRows = isClients ? CLIENT_SAMPLE_ROWS : PROJECT_SAMPLE_ROWS;
    const columnCount = sampleColumns.length;

    const close = () => {
        if (isSubmitting) return;
        setFile(null);
        setErrors([]);
        onClose();
    };

    const handleFileChange = (selectedFile: File | null) => {
        if (!selectedFile) return;
        if (!selectedFile.name.endsWith('.xlsx')) {
            setErrors(['Harap pilih berkas spreadsheet berekstensi .xlsx']);
            return;
        }
        setFile(selectedFile);
        setErrors([]);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const submit = () => {
        if (!file) {
            setErrors(['Pilih file .xlsx terlebih dahulu sebelum memproses impor.']);
            return;
        }

        setIsSubmitting(true);
        setErrors([]);
        router.post(
            `/${kind}/import`,
            { file },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Import data ${labelTitle} berhasil diproses.`);
                    setFile(null);
                    setErrors([]);
                    onClose();
                },
                onError: (formErrors) => {
                    const messages = Object.values(formErrors).flatMap((value) =>
                        Array.isArray(value) ? value : [value]
                    );
                    setErrors(
                        messages.length > 0
                            ? messages
                            : ['Berkas tidak dapat diproses. Silakan periksa kembali struktur kolom dan data template.']
                    );
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={close}
            maxWidth="6xl"
            title={`Import Data ${labelTitle}`}
            subtitle={`UNGGAH DATA MASSAL VIA FILE SPREADSHEET EXCEL (.XLSX)`}
            icon={
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-2xs">
                    <FileSpreadsheet className="size-5" />
                </div>
            }
            closeOnOverlayClick={!isSubmitting}
            footer={
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400 font-medium">
                        * Pastikan nama kategori, paket, dan sumber klien sama persis dengan master data aktif di sistem.
                    </span>
                    <div className="flex items-center justify-end gap-2.5 shrink-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={close}
                            disabled={isSubmitting}
                            className="rounded-xl text-xs font-semibold px-4 py-2"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={submit}
                            disabled={!file || isSubmitting}
                            className="rounded-xl text-xs font-bold px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm shadow-emerald-700/20 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="size-4 animate-spin mr-1.5" />
                                    <span>Memproses Impor...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="size-4 mr-1.5" />
                                    <span>Proses Import</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
                {/* ── SISI KIRI: LANGKAH 1 & LANGKAH 2 (col-span-4) ──────────── */}
                <div className="lg:col-span-4 space-y-4">
                    {/* 1. FORMAT EXCEL */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
                        <div className="flex items-center gap-2">
                            <Download className="w-4 h-4 text-emerald-700 shrink-0" />
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                                1. Format Excel (.xlsx)
                            </h4>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Gunakan template resmi kami agar format kolom sesuai dan proses impor berhasil tanpa kendala.
                        </p>
                        <a
                            href={`/${kind}/import/template`}
                            className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-800 text-xs font-bold transition-all shadow-2xs group cursor-pointer"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
                            <span>Download Template Excel</span>
                        </a>
                    </div>

                    {/* 2. PILIH FILE EXCEL */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
                            isDragging
                                ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            id={inputId}
                            type="file"
                            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                            className="hidden"
                        />

                        {file ? (
                            /* Selected File Card */
                            <div className="space-y-3 py-1">
                                <div className="w-11 h-11 mx-auto rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 truncate max-w-full px-2" title={file.name}>
                                        {file.name}
                                    </p>
                                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>
                                <div className="flex items-center justify-center gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                                    >
                                        Ganti Berkas
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFile(null);
                                            setErrors([]);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 p-1 rounded-lg transition-colors cursor-pointer"
                                        title="Batalkan pilihan"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Empty Upload State */
                            <div className="space-y-2.5 py-2">
                                <div className="w-10 h-10 mx-auto rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                                    <UploadCloud className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-800">
                                        2. Pilih File Excel (.xlsx)
                                    </h4>
                                    <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
                                        Seret file ke sini atau klik tombol untuk memilih berkas dari komputer Anda.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="rounded-xl text-xs font-semibold px-4 py-1.5 border-slate-300 hover:bg-white cursor-pointer shadow-2xs"
                                >
                                    Pilih Berkas
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Sheet Detail Categories (untuk Projects) */}
                    {!isClients && categories.length > 0 && (
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                            <p className="text-xs font-bold text-slate-900">Sheet Detail Kategori</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Tersedia sheet khusus per kategori aktif.</p>
                            <div className="mt-2.5 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                                {categories.map((category) => (
                                    <span
                                        key={category.id}
                                        className="rounded-md bg-slate-100 border border-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-700"
                                    >
                                        Detail {category.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error Box */}
                    {errors.length > 0 && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-rose-800 text-xs shadow-2xs" role="alert">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                                <div>
                                    <p className="font-bold text-rose-900">Impor Belum Berhasil</p>
                                    <ul className="mt-1 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-rose-800">
                                        {errors.map((error, idx) => (
                                            <li key={idx}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── SISI KANAN: PANDUAN & MOCKUP CONTOH STRUKTUR TABEL (col-span-8) ─── */}
                <div className="lg:col-span-8 space-y-4">
                    {/* Panduan Pengisian Berkas Impor */}
                    <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 shadow-2xs">
                        <div className="flex items-start gap-2.5 mb-2.5">
                            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                                <Info className="w-3.5 h-3.5" />
                            </div>
                            <div>
                                <h4 className="text-xs font-extrabold text-blue-950">
                                    Panduan Pengisian Berkas Impor
                                </h4>
                                <p className="text-[11px] text-blue-800/80 mt-0.5">
                                    Harap ikuti pedoman ini agar data {labelTitle.toLowerCase()} tersimpan dengan benar ke database sistem.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 text-[11px] text-slate-700 leading-relaxed">
                            {isClients ? (
                                <>
                                    <div className="flex items-start gap-2">
                                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                                            1
                                        </span>
                                        <div>
                                            <strong>Kolom Wajib & Identitas:</strong> Kolom <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">nama</code> wajib diisi. Kolom <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">email</code> dan <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">telepon</code> dianjurkan untuk identifikasi unik dan komunikasi portal klien.
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                                            2
                                        </span>
                                        <div>
                                            <strong>Master Data Sesuai:</strong> Kolom <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">kategori</code>, <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">sumber_klien</code>, dan <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">wedding_organizer</code> harus sama persis dengan master data aktif di sistem (contoh: <em>Wedding</em>, <em>Instagram</em>, <em>Glory WO</em>).
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                                            3
                                        </span>
                                        <div>
                                            <strong>Format Kontak:</strong> Tulis nomor pada kolom <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">telepon</code> tanpa spasi/strip (contoh: <em>081234567890</em>). Kontak preferensi diisi <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">whatsapp</code>, <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">email</code>, atau <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">phone</code>.
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                                            4
                                        </span>
                                        <div>
                                            <strong>Data Pengantin & Keluarga:</strong> Untuk Wedding, lengkapi <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">nama_mempelai_wanita</code> & <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">nama_mempelai_pria</code>. Untuk Newborn/Family, lengkapi <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">nama_anak</code>, <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">nama_ayah</code>, <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">nama_ibu</code>.
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-start gap-2">
                                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                                            1
                                        </span>
                                        <div>
                                            <strong>Klien Harus Terdaftar:</strong> Klien harus sudah diimpor atau terdaftar di sistem. Sistem akan otomatis mencocokkan melalui kolom <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">email_klien</code> atau <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">telepon_klien</code>.
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                                            2
                                        </span>
                                        <div>
                                            <strong>Kolom Wajib Proyek:</strong> Kolom <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">referensi_proyek</code> (kode unik, contoh: <em>PRJ-2026-001</em>), <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">nama_proyek</code>, dan <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">kategori</code> wajib diisi.
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                                            3
                                        </span>
                                        <div>
                                            <strong>Format Tanggal, Jam & Harga:</strong> Tanggal wajib format <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">YYYY-MM-DD</code> (contoh: <em>2026-12-20</em>), jam format <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">HH:MM</code> (contoh: <em>09:00</em>). Harga ditulis angka murni tanpa simbol Rp (contoh: <em>25000000</em>).
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                                            4
                                        </span>
                                        <div>
                                            <strong>Sheet Detail Kategori:</strong> Jika mengisi data spesifik pada sheet detail (misal: <em>Detail Wedding</em>), gunakan nilai <code className="px-1 py-0.2 bg-white rounded border border-blue-200 text-blue-900 font-mono text-[10px]">referensi_proyek</code> yang sama untuk menghubungkan data.
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* CONTOH STRUKTUR TABEL EXCEL MOCKUP */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                                    Contoh Struktur Tabel Excel
                                </h4>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/80">
                                Format {columnCount} Kolom
                            </span>
                        </div>

                        {/* ── MOCKUP JENDELA MICROSOFT EXCEL ─────────────────────── */}
                        <div className="rounded-xl border border-emerald-800/40 shadow-sm overflow-hidden bg-white">
                            {/* Title Bar Excel (Hijau Resmi Microsoft Excel #107C41) */}
                            <div className="bg-[#107C41] px-3 py-1.5 flex items-center justify-between text-white text-xs select-none">
                                <div className="flex items-center gap-2">
                                    {/* Excel SVG Icon */}
                                    <div className="w-4 h-4 bg-white rounded-xs flex items-center justify-center text-[#107C41] font-black text-[10px] leading-none shadow-2xs">
                                        X
                                    </div>
                                    <span className="font-semibold tracking-tight text-[11px] truncate">
                                        Microsoft Excel - {filenameTemplate}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 opacity-80 shrink-0">
                                    <span className="w-2.5 h-0.5 bg-white/80 inline-block rounded-xs" />
                                    <span className="w-2.5 h-2.5 border border-white/80 inline-block rounded-xs" />
                                    <span className="text-[11px] font-bold leading-none cursor-pointer">×</span>
                                </div>
                            </div>

                            {/* Menu / Ribbon Bar */}
                            <div className="bg-[#F3F2F1] border-b border-[#E1DFDD] px-3 py-1 flex items-center justify-between text-[11px] text-slate-700 select-none">
                                <div className="flex items-center gap-3 font-medium">
                                    <span className="text-emerald-800 font-bold border-b-2 border-emerald-700 pb-0.5">
                                        File
                                    </span>
                                    <span className="hover:text-slate-900 cursor-default">Beranda</span>
                                    <span className="hover:text-slate-900 cursor-default">Sisipkan</span>
                                    <span className="hover:text-slate-900 cursor-default">Tata Letak</span>
                                    <span className="hover:text-slate-900 cursor-default">Data</span>
                                </div>
                                <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-600 bg-white border border-[#E1DFDD] px-2 py-0.5 rounded-sm">
                                    <span className="font-bold text-slate-900">A1</span>
                                    <span className="text-slate-300">|</span>
                                    <span className="italic text-slate-500">fx: {sampleColumns[0]}</span>
                                </div>
                            </div>

                            {/* Spreadsheet Table Grid (Scrollable) */}
                            <div className="overflow-x-auto max-h-[260px] scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                                <table className="w-full text-left text-[11px] border-collapse font-sans">
                                    {/* Baris Huruf Kolom (A, B, C, D...) */}
                                    <thead>
                                        <tr className="bg-[#F3F2F1] text-slate-500 font-semibold select-none">
                                            {/* Kolom Indeks Sudut */}
                                            <th className="w-9 min-w-9 px-2 py-1 text-center border-r border-b border-[#E1DFDD] text-[10px] font-mono text-slate-400 bg-[#E8E6E3]">
                                                #
                                            </th>
                                            {sampleColumns.map((_, colIdx) => (
                                                <th
                                                    key={colIdx}
                                                    className="px-3 py-1 text-center border-r border-b border-[#E1DFDD] font-mono text-[10px] text-slate-600 whitespace-nowrap min-w-[120px]"
                                                >
                                                    {getColumnLetter(colIdx)}
                                                </th>
                                            ))}
                                        </tr>

                                        {/* Baris 1: Header Nama Kolom */}
                                        <tr className="bg-emerald-50/80 text-emerald-950 font-bold border-b-2 border-emerald-600/60">
                                            <td className="px-2 py-1.5 text-center font-mono text-[10px] text-slate-500 bg-[#F3F2F1] border-r border-b border-[#E1DFDD] select-none font-bold">
                                                1
                                            </td>
                                            {sampleColumns.map((colName, colIdx) => (
                                                <td
                                                    key={colIdx}
                                                    className="px-3 py-1.5 border-r border-b border-[#E1DFDD] font-bold text-slate-900 whitespace-nowrap"
                                                >
                                                    {colName}
                                                </td>
                                            ))}
                                        </tr>
                                    </thead>

                                    {/* Baris 2..5: Data Contoh Realistis */}
                                    <tbody className="divide-y divide-[#E1DFDD] bg-white">
                                        {sampleRows.map((row, rowIdx) => (
                                            <tr key={rowIdx} className="hover:bg-slate-50/80 transition-colors">
                                                {/* Nomor Baris Excel (2, 3, 4, 5...) */}
                                                <td className="px-2 py-1.5 text-center font-mono text-[10px] text-slate-500 bg-[#F3F2F1] border-r border-b border-[#E1DFDD] select-none">
                                                    {rowIdx + 2}
                                                </td>
                                                {row.map((val, valIdx) => (
                                                    <td
                                                        key={valIdx}
                                                        className={`px-3 py-1.5 border-r border-b border-[#E1DFDD] text-slate-800 whitespace-nowrap ${
                                                            val === '' || val === '-' ? 'text-slate-300 italic' : ''
                                                        }`}
                                                    >
                                                        {val !== '' ? val : '-'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Status Bar Excel Bawah */}
                            <div className="bg-[#F3F2F1] border-t border-[#E1DFDD] px-3 py-1 flex items-center justify-between text-[10px] text-slate-600 select-none">
                                <div className="flex items-center gap-2">
                                    <span className="bg-white px-2.5 py-0.5 rounded-t-sm border-t-2 border-emerald-600 font-bold text-slate-900 shadow-2xs">
                                        {isClients ? 'Klien' : 'Proyek'}
                                    </span>
                                    <span className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold">+</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-500">Siap</span>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-slate-500 font-mono">100%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
