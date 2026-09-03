import React, { useState, useMemo } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Calendar,
    Camera,
    Check,
    CheckCircle2,
    ChevronDown,
    Clock,
    CreditCard,
    Download,
    Eye,
    ExternalLink,
    FileText,
    Heart,
    Info,
    Mail,
    Phone,
    Printer,
    RefreshCw,
    Send,
    Share2,
    Sparkles,
    Trash2,
    User as UserIcon,
    Users,
    Video,
    Car,
    Building2,
    Tag,
    ZoomIn,
    ZoomOut,
    Shield,
    Image,
    MapPin,
    Building,
    Layers,
    Palette,
    Briefcase,
    Copy,
    CheckCheck,
    ShieldCheck,
    Receipt,
    Wallet,
    AlertCircle,
    Globe,
    Edit3,
    Settings2,
    RotateCcw,
    X,
} from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';
import { FormattedNumberInput } from '@/components/ui/formatted-number-input';

interface InvoiceItem {
    id: string;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    subtotal: number;
    total: number;
    paid_amount: number;
    remaining_amount: number;
    status: string;
    notes?: string;
    items?: Array<{
        id: string;
        description: string;
        quantity: number;
        unit_price: number;
        total: number;
    }>;
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
    name?: string;
    logo?: string;
    tagline?: string;
    legal_name?: string;
    phone?: string;
    email?: string;
    address?: string;
    instagram?: string;
    website?: string;
}

interface LineItem {
    id: number | string;
    name: string;
    qty: number;
    unit_price: number;
    total: number;
    type?: string;
}

interface ProjectInvoiceProps {
    project: any;
    current_invoice: InvoiceItem;
    invoices: InvoiceItem[];
    payment_methods?: PaymentMethodItem[];
    company_settings?: CompanySettings;
}

export default function ProjectInvoice({
    project,
    current_invoice,
    invoices = [],
    payment_methods = [],
    company_settings = {},
}: ProjectInvoiceProps) {
    const { appSettings } = usePage().props as any;

    // 3 Curated Layout Designs:
    // 'navy' = Navy Clean Luxury (Modern, fluid & soft - Gambar 1)
    // 'modern' = Modern Vivid Icons (Colorful pills & badges - Gambar 2)
    // 'classic' = Classic Wave Signature (Minimalist ribbon - Gambar 3)
    const [selectedTemplate, setSelectedTemplate] = useState<'navy' | 'modern' | 'classic'>('classic');
    const [zoomLevel, setZoomLevel] = useState<number>(100);
    const [sendDropdownOpen, setSendDropdownOpen] = useState(false);
    const [copiedAccount, setCopiedAccount] = useState(false);

    // Database Settings Fallbacks
    const studioLogo = company_settings?.logo || appSettings?.company_logo || '';
    const studioName = company_settings?.name || appSettings?.company_name || 'Arams Photography';
    const studioLegalName = company_settings?.legal_name || appSettings?.company_legal_name || 'Arams Pictures Studio';
    const studioTagline = company_settings?.tagline || appSettings?.company_tagline || 'Capturing Moments, Creating Timeless Memories';
    const studioPhone = company_settings?.phone || appSettings?.company_phone || '+62 812-3456-7890';
    const studioEmail = company_settings?.email || appSettings?.company_email || 'hello@lensaria.com';
    const studioAddress =
        company_settings?.address ||
        appSettings?.company_address ||
        'Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan 12190';
    const studioInstagram = (company_settings?.instagram || appSettings?.company_instagram || 'aramspictures').replace(/^@+/, '');
    const studioWebsite = company_settings?.website || appSettings?.company_website || 'https://www.arams.com';

    // Primary invoice data
    const inv = current_invoice || invoices[0] || {
        invoice_number: project?.project_number ? project.project_number.replace('PRJ', 'INV') : 'INV/260826/001',
        issue_date: project?.created_at || '2026-08-27',
        due_date: project?.deadline || '2026-09-10',
        total: 23800000,
        subtotal: 15000000,
        status: 'unpaid',
    };

    const client = project?.client || {
        name: 'Budi Santoso',
        phone: '0812 2345 6789',
        email: 'budi.santoso@email.com',
        address: 'Jl. Sudirman No. 10, Jakarta Pusat, DKI Jakarta 10220',
    };

    const supervisorName = project?.supervisor?.name || 'Aditya Pratama';
    const parsedPhotographer =
        project?.photographer?.name ||
        project?.photographer_name ||
        project?.notes?.match(/Photographer:\s*([^|\n]+)/i)?.[1]?.trim() ||
        'Ivan Hardianto';
    const parsedEditor =
        project?.editor?.name ||
        project?.editor_name ||
        project?.notes?.match(/Editor:\s*([^|\n]+)/i)?.[1]?.trim() ||
        'Dian Pratama';

    // Default Payment Method
    const defaultPaymentMethod = payment_methods[0] || {
        name: 'BCA',
        account_number: '123 456 7890',
        account_holder: studioName || 'Arams Pictures',
    };

    // Copy Account Number
    const handleCopyAccount = () => {
        const accNo = (defaultPaymentMethod.account_number || '123 456 7890').replace(/\s+/g, '');
        navigator.clipboard.writeText(accNo);
        setCopiedAccount(true);
        toast.success('Nomor rekening berhasil disalin ke clipboard!');
        setTimeout(() => setCopiedAccount(false), 2000);
    };

    // ── KUSTOMISASI TEKS & CATATAN INVOICE ────────────────────────────────────
    const initialCustomTexts = {
        invoiceTitle: 'INVOICE',
        invoiceSubtitle: 'DP (UANG MUKA)',
        tagline: studioTagline || 'Capturing Moments, Creating Timeless Memories',
        bankName: defaultPaymentMethod.name || 'Bank Mandiri',
        bankAccount: defaultPaymentMethod.account_number || '123-00-1234567-8',
        bankHolder: defaultPaymentMethod.account_holder || (studioLegalName ? `a.n. ${studioLegalName}` : 'a.n. PT Lensaria Kreatif Nusantara'),
        note1: 'DP (uang muka) digunakan sebagai konfirmasi booking tanggal.',
        note2: 'Sisa pembayaran akan diinformasikan sesuai progress project.',
        autoSendNote: 'Invoice ini akan dikirim otomatis ke klien setelah Anda mengirimkan melalui WhatsApp atau Email.',
        reminderTitle: 'HARAP LAKUKAN PEMBAYARAN SEBELUM',
        reminderSub: 'Agar booking tanggal tetap kami amankan.',
        thankYouTitle: 'Thank You',
        thankYouSub: 'Terima kasih atas kepercayaan Anda.',
        badge1Title: 'Profesional',
        badge1Sub: '& Terpercaya',
        badge2Title: 'Kualitas Terbaik',
        badge2Sub: 'Untuk Setiap Momen',
        badge3Title: 'Layanan Sepenuh',
        badge3Sub: 'Hati',
        footerWebsite: studioWebsite || 'https://www.arams.com',
        footerMotto: studioTagline || 'Capturing Moments, Creating Timeless Memories',
    };

    const [customTexts, setCustomTexts] = useState(initialCustomTexts);
    const [isTextModalOpen, setIsTextModalOpen] = useState(false);

    // Format dates
    const formatDateIndo = (dateStr?: string) => {
        if (!dateStr) return '27 Agustus 2026';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const issueDateFormatted = formatDateIndo(inv.issue_date || project?.created_at);
    const dueDateFormatted = formatDateIndo(inv.due_date || project?.deadline);
    const eventDateFormatted = formatDateIndo(project?.event_date || '2026-08-27');

    // ── DYNAMIC LINE ITEMS (PAKET, ADD-ONS, BIAYA OPERASIONAL) ─────────────────
    const projectAddons = project?.project_addons || project?.projectAddons || [];
    const hasProjectAddons = Array.isArray(projectAddons) && projectAddons.length > 0;

    const addonsList = useMemo<LineItem[]>(() => {
        if (hasProjectAddons) {
            return projectAddons.map((item: any, idx: number) => ({
                id: item.id || idx + 1,
                name: item.addon?.name || item.name || 'Additional Service',
                qty: Number(item.quantity || 1),
                unit_price: Number(item.price || item.addon?.price || 0),
                total: Number(item.price || item.addon?.price || 0) * Number(item.quantity || 1),
                type: (item.addon?.type || 'photo').toLowerCase(),
            }));
        }
        return [
            { id: 1, name: 'Same Day Edit (Video)', qty: 1, unit_price: 2000000, total: 2000000, type: 'video' },
            { id: 2, name: 'Extra Photographer', qty: 1, unit_price: 2500000, total: 2500000, type: 'camera' },
            { id: 3, name: 'Prewedding Photo Session', qty: 1, unit_price: 2000000, total: 2000000, type: 'image' },
        ];
    }, [projectAddons, hasProjectAddons]);

    const operationalCostsList = useMemo<LineItem[]>(() => {
        if (project?.operational_costs && Array.isArray(project.operational_costs) && project.operational_costs.length > 0) {
            return project.operational_costs.map((item: any, idx: number) => ({
                id: item.id || idx + 1,
                name: item.name || item.description || 'Biaya Operasional',
                qty: Number(item.quantity || 1),
                unit_price: Number(item.unit_price || item.amount || 0),
                total: Number(item.total || ((item.unit_price || item.amount || 0) * (item.quantity || 1))),
                type: (item.type || 'transport').toLowerCase(),
            }));
        }
        return [
            { id: 1, name: 'Transport (PP)', qty: 1, unit_price: 800000, total: 800000, type: 'transport' },
            { id: 2, name: 'Penginapan (2 Malam)', qty: 2, unit_price: 600000, total: 1200000, type: 'lodging' },
            { id: 3, name: 'Parkir & Tol', qty: 1, unit_price: 300000, total: 300000, type: 'parking' },
        ];
    }, [project?.operational_costs]);

    // Financial breakdown values
    const packageTotal = Number(project?.price || project?.package?.base_price || 15000000);
    const additionalServicesTotal = addonsList.reduce((acc: number, item: LineItem) => acc + item.total, 0);
    const operationalCostTotal = operationalCostsList.reduce((acc: number, item: LineItem) => acc + item.total, 0);
    const grandTotal = Number(
        project?.total_amount || (packageTotal + additionalServicesTotal + operationalCostTotal)
    );
    const dpPercent = 50;
    const dpAmount = Number(
        inv.total || (project?.paid_amount > 0 ? project.paid_amount : Math.round(grandTotal * (dpPercent / 100)))
    );
    const remainingAmount = Math.max(0, grandTotal - dpAmount);

    const isInvoicePaid = inv.status === 'paid' || project?.payment_status === 'paid' || (Number(inv.paid_amount || 0) >= Number(inv.total || 0) && Number(inv.total || 0) > 0);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentSubmitting, setPaymentSubmitting] = useState(false);
    const [paymentFormData, setPaymentFormData] = useState({
        amount: String(Math.round(dpAmount)),
        payment_date: new Date().toISOString().split('T')[0],
        payment_method_id: defaultPaymentMethod?.id || payment_methods[0]?.id || '',
        reference_number: '',
        notes: `Pembayaran ${inv.notes || `Invoice ${inv.invoice_number}`}`,
    });

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentFormData.amount || Number(paymentFormData.amount) <= 0) {
            toast.error('Silakan masukkan jumlah pembayaran yang valid');
            return;
        }

        const methodId = paymentFormData.payment_method_id || defaultPaymentMethod?.id || payment_methods[0]?.id;
        if (!methodId) {
            toast.error('Silakan pilih metode pembayaran');
            return;
        }

        setPaymentSubmitting(true);
        router.post(
            '/finance/payments',
            {
                project_id: project.id,
                amount: paymentFormData.amount,
                payment_date: paymentFormData.payment_date,
                payment_method_id: methodId,
                reference_number: paymentFormData.reference_number,
                notes: paymentFormData.notes,
                invoice_id: inv.id,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPaymentSubmitting(false);
                    setIsPaymentModalOpen(false);
                    toast.success('Pembayaran berhasil dikonfirmasi dan dicatat ke Finance!');
                },
                onError: (errors: any) => {
                    setPaymentSubmitting(false);
                    const errorMsg = Object.values(errors || {})[0] as string;
                    toast.error(errorMsg || 'Gagal mencatat pembayaran');
                },
            }
        );
    };

    // Status Label & Styling
    const getInvoiceStatus = () => {
        if (project?.payment_status === 'paid' || inv.status === 'paid' || isInvoicePaid) {
            return {
                label: 'LUNAS',
                badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
                dot: 'bg-emerald-500',
            };
        }
        if (project?.payment_status === 'partial' || project?.paid_amount > 0) {
            return {
                label: 'DP TERBAYAR',
                badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
                dot: 'bg-indigo-500',
            };
        }
        return {
            label: 'MENUNGGU PEMBAYARAN',
            badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
            dot: 'bg-amber-500',
        };
    };

    const statusBadge = getInvoiceStatus();

    // Print & Download PDF handler - Isolated to Invoice Paper only
    const handlePrint = () => {
        const printableElement = document.getElementById('invoice-printable-area');
        if (!printableElement) {
            window.print();
            return;
        }

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (!doc) {
            window.print();
            return;
        }

        const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map((s) => s.outerHTML)
            .join('\n');

        const invoiceNo = inv.invoice_number || 'Official';

        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html lang="id">
                <head>
                    <title>Invoice_${invoiceNo.replace(/[\/\\]/g, '_')}</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    ${styles}
                    <style>
                        @page {
                            size: A4 portrait;
                            margin: 6mm 8mm 6mm 8mm;
                        }
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            box-sizing: border-box !important;
                        }
                        html, body {
                            background: #ffffff !important;
                            color: #0f172a !important;
                            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            width: 100% !important;
                            font-size: 11px !important;
                            line-height: 1.35 !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        #invoice-printable-area {
                            transform: none !important;
                            box-shadow: none !important;
                            border: none !important;
                            border-radius: 0 !important;
                            background: #ffffff !important;
                            width: 100% !important;
                            max-width: 100% !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            overflow: visible !important;
                        }
                        /* Ensure side-by-side grid is preserved in print */
                        .grid-cols-12 {
                            display: grid !important;
                            grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
                        }
                        .col-span-7 {
                            grid-column: span 7 / span 7 !important;
                        }
                        .col-span-5 {
                            grid-column: span 5 / span 5 !important;
                        }
                        .grid-cols-2 {
                            display: grid !important;
                            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                        }
                        .grid-cols-4 {
                            display: grid !important;
                            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                        }
                        .break-inside-avoid, tr, table {
                            break-inside: avoid !important;
                            page-break-inside: avoid !important;
                        }
                    </style>
                </head>
                <body class="bg-white p-0 m-0">
                    <div id="invoice-printable-area" class="w-full bg-white text-slate-900 font-sans">
                        ${printableElement.innerHTML}
                    </div>
                </body>
            </html>
        `);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
            }, 1500);
        }, 300);
    };

    // Send WhatsApp handler
    const handleSendWhatsApp = () => {
        const cleanPhone = (client.phone || '').replace(/[^0-9]/g, '');
        const phoneFormatted = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;
        const msg = encodeURIComponent(
            `Halo ${client.name},\n\nBerikut kami lampirkan tagihan uang muka (DP) untuk project *${project?.name || ''}* (${inv.invoice_number}) senilai *${formatRupiah(dpAmount)}* dengan batas jatuh tempo pada *${dueDateFormatted}*.\n\nPembayaran dapat ditransfer ke:\n${defaultPaymentMethod.name}\nNo. Rek: ${defaultPaymentMethod.account_number}\na.n. ${defaultPaymentMethod.account_holder}\n\nTerima kasih atas kepercayaannya.\n*${studioName}*`
        );
        window.open(`https://wa.me/${phoneFormatted}?text=${msg}`, '_blank');
    };

    // Send Email handler
    const handleSendEmail = () => {
        const subject = encodeURIComponent(`Invoice DP ${inv.invoice_number} - ${project?.name || ''}`);
        const body = encodeURIComponent(
            `Yth. ${client.name},\n\nTerima kasih telah mempercayakan momen berharga Anda kepada ${studioName}.\n\nBerikut kami informasikan invoice uang muka (DP) untuk project:\n- Nama Project: ${project?.name || ''}\n- No. Invoice: ${inv.invoice_number}\n- Nominal DP: ${formatRupiah(dpAmount)}\n- Jatuh Tempo: ${dueDateFormatted}\n\nPembayaran via Transfer:\nBank: ${defaultPaymentMethod.name}\nRekening: ${defaultPaymentMethod.account_number}\na.n. ${defaultPaymentMethod.account_holder}\n\nTerima kasih,\n${studioName}`
        );
        window.open(`mailto:${client.email || ''}?subject=${subject}&body=${body}`, '_blank');
    };

    return (
        <div className="w-full max-w-full space-y-6 pb-20">
            <Head title={`Invoice ${inv.invoice_number} - ${project?.name || 'Project'}`} />

            {/* Print Isolation CSS */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #invoice-printable-area, #invoice-printable-area * {
                        visibility: visible !important;
                    }
                    #invoice-printable-area {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        margin: 0 !important;
                        padding: 12px 16px !important;
                        box-shadow: none !important;
                        border: none !important;
                        border-radius: 0 !important;
                        transform: none !important;
                        background: #FFFFFF !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    header, aside, nav, .lg\\:sticky, button, a {
                        display: none !important;
                    }
                }
            `}</style>

            {/* ── 1. TOP HEADER & ACTION BUTTONS ─────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                        <Link
                            href={`/projects/${project?.id}`}
                            className="text-slate-500 hover:text-slate-900 transition-colors font-medium flex items-center gap-1"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Detail Project</span>
                        </Link>
                        <span className="text-slate-300">/</span>
                        <span className="text-indigo-600 font-bold">Invoice DP</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Invoice Preview &amp; Export
                    </h1>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <Link
                        href={`/projects/${project?.id}`}
                        className="inline-flex items-center justify-center px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                    >
                        Kembali ke Detail
                    </Link>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setSendDropdownOpen(!sendDropdownOpen)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>Kirim ke Klien</span>
                            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                        </button>

                        {sendDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in duration-150">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSendDropdownOpen(false);
                                        handleSendWhatsApp();
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                                >
                                    <Phone className="w-4 h-4 text-emerald-600" />
                                    <span>Kirim via WhatsApp</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSendDropdownOpen(false);
                                        handleSendEmail();
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                                >
                                    <Mail className="w-4 h-4 text-blue-600" />
                                    <span>Kirim via Email</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsTextModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-[#7C3AED] border border-purple-200/80 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Kustomisasi Teks</span>
                    </button>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak / PDF</span>
                    </button>
                </div>
            </div>

            {/* ── 2. TEMPLATE SELECTOR BAR (FLUID, MODERN PILLS) ──────────────────── */}
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                        Style Template:
                    </span>

                    {/* Desain 1: Navy Clean (Gambar 1) */}
                    <button
                        type="button"
                        onClick={() => setSelectedTemplate('navy')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                            selectedTemplate === 'navy'
                                ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                                : 'bg-white hover:bg-slate-50 text-slate-600 border-transparent'
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Navy Clean Luxury</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20">Gambar 1</span>
                    </button>

                    {/* Desain 2: Modern Icons (Gambar 2) */}
                    <button
                        type="button"
                        onClick={() => setSelectedTemplate('modern')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                            selectedTemplate === 'modern'
                                ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-xs'
                                : 'bg-white hover:bg-slate-50 text-slate-600 border-transparent'
                        }`}
                    >
                        <Palette className="w-3.5 h-3.5" />
                        <span>Modern Vivid Icons</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20">Gambar 2</span>
                    </button>

                    {/* Desain 3: Classic Wave (Gambar 3) */}
                    <button
                        type="button"
                        onClick={() => setSelectedTemplate('classic')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                            selectedTemplate === 'classic'
                                ? 'bg-[#C89445] text-white border-[#C89445] shadow-xs'
                                : 'bg-white hover:bg-slate-50 text-slate-600 border-transparent'
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Classic Signature</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20">Gambar 3</span>
                    </button>
                </div>

                <div className="flex items-center gap-1.5 pr-1">
                    <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title="Zoom out"
                    >
                        <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-bold text-slate-700 font-mono w-10 text-center">
                        {zoomLevel}%
                    </span>
                    <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title="Zoom in"
                    >
                        <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setZoomLevel(100)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title="Reset Zoom"
                    >
                        <RefreshCw className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* ── 3. MAIN 2-COLUMN GRID ─────────────────────────────────────────── */}
            <div className="grid grid-cols-12 gap-6 items-start">
                {/* ── LEFT COLUMN (70% - 8 COLS): INVOICE CANVAS & PREVIEW ─────────── */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* The Elegant Studio Canvas Background */}
                    <div className="bg-slate-100/70 p-4 sm:p-8 rounded-3xl border border-slate-200/60 shadow-inner flex justify-center">
                        {/* ── THE INVOICE PAPER SHEET CONTAINER ── */}
                        <div
                            id="invoice-printable-area"
                            style={{
                                transform: `scale(${zoomLevel / 100})`,
                                transformOrigin: 'top center',
                            }}
                            className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_20px_50px_rgba(15,23,42,0.08)] overflow-hidden transition-all duration-150 relative font-sans text-slate-900 w-full max-w-3xl"
                        >
                            {/* ══════════════════════════════════════════════════════════════════ */}
                            {/* TEMPLATE 1: NAVY CLEAN LUXURY (SOPHISTICATED & TIDAK KAKU)        */}
                            {/* ══════════════════════════════════════════════════════════════════ */}
                            {selectedTemplate === 'navy' && (
                                <div className="p-6 sm:p-8 space-y-3.5 text-slate-900">
                                    {/* 1. Header: AP Logo & Navy INVOICE Badge */}
                                    <div className="flex items-start justify-between gap-4 pb-2 border-b border-slate-100/90">
                                        <div className="space-y-3">
                                            {/* Studio Logo */}
                                            <div className="flex items-center gap-3.5">
                                                {studioLogo ? (
                                                    <img src={studioLogo} alt={studioName} className="h-12 w-auto max-w-[140px] object-contain shrink-0" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white flex items-center justify-center font-serif text-xl font-bold italic tracking-tighter shadow-md shadow-slate-900/10 shrink-0">
                                                        ap
                                                    </div>
                                                )}
                                                <div>
                                                    <h2 className="text-base font-black tracking-widest text-slate-900 uppercase">
                                                        {studioName}
                                                    </h2>
                                                    <p className="text-[10px] uppercase tracking-widest text-[#3B46F1] font-bold">
                                                        {studioTagline}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Studio Address & Contact */}
                                            <div className="text-[11px] text-slate-600 space-y-0.5">
                                                <p className="font-bold text-slate-900">{studioLegalName}</p>
                                                <p>{studioAddress}</p>
                                                <div className="pt-1 flex items-center gap-3 text-slate-600 flex-wrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="w-3 h-3 text-slate-400" />
                                                        <span>{studioPhone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="w-3 h-3 text-slate-400" />
                                                        <span>{studioEmail}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <ExternalLink className="w-3 h-3 text-slate-400" />
                                                        <span>{studioWebsite}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Meta Header */}
                                        <div className="text-left sm:text-right space-y-2.5">
                                            <div className="flex items-center justify-start sm:justify-end gap-2.5">
                                                <div className="bg-[#0B132B] text-white px-5 py-2 rounded-2xl text-xs font-black tracking-widest uppercase shadow-xs">
                                                    INVOICE
                                                </div>
                                                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-xl uppercase tracking-wider">
                                                    DP (50%)
                                                </span>
                                            </div>
                                            <div className="font-mono font-bold text-sm text-slate-900 tracking-tight">
                                                {inv.invoice_number}
                                            </div>

                                            {/* Meta Card */}
                                            <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-[11px] space-y-1.5 text-left inline-block min-w-[230px]">
                                                <div className="flex justify-between items-center gap-3">
                                                    <span className="text-slate-500">Tanggal Invoice</span>
                                                    <span className="font-semibold text-slate-900">{issueDateFormatted}</span>
                                                </div>
                                                <div className="flex justify-between items-center gap-3">
                                                    <span className="text-slate-500">Jatuh Tempo</span>
                                                    <span className="font-semibold text-slate-900">{dueDateFormatted}</span>
                                                </div>
                                                <div className="flex justify-between items-center gap-3">
                                                    <span className="text-slate-500">Metode Bayar</span>
                                                    <span className="font-semibold text-slate-900">Transfer Bank</span>
                                                </div>
                                                <div className="flex justify-between items-center gap-3 pt-1 border-t border-slate-200/60">
                                                    <span className="text-slate-500">Status</span>
                                                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${statusBadge.badge}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                                                        <span>{statusBadge.label}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Diterbitkan Untuk & Detail Project Grid (Soft, Rounded Cards) */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Kiri: Diterbitkan Untuk */}
                                        <div className="p-3.5 rounded-2xl border border-slate-200/70 bg-gradient-to-b from-slate-50/60 to-white text-xs space-y-2">
                                            <div className="flex items-center gap-1.5 text-[#3B46F1] font-black text-[10px] uppercase tracking-wider">
                                                <UserIcon className="w-3.5 h-3.5" />
                                                <span>DITERBITKAN UNTUK</span>
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-bold text-sm text-slate-900">{client.name}</h4>
                                                <p className="text-slate-600 font-mono text-[11px]">{client.phone}</p>
                                                <p className="text-slate-600 text-[11px] truncate">{client.email}</p>
                                                <p className="text-slate-500 text-[11px] leading-relaxed pt-0.5">
                                                    {client.address}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Kanan: Detail Project */}
                                        <div className="p-3.5 rounded-2xl border border-slate-200/70 bg-gradient-to-b from-slate-50/60 to-white text-xs space-y-2">
                                            <div className="flex items-center gap-1.5 text-[#3B46F1] font-black text-[10px] uppercase tracking-wider">
                                                <Briefcase className="w-3.5 h-3.5" />
                                                <span>DETAIL PROJECT</span>
                                            </div>
                                            <div className="space-y-1.5 text-[11px]">
                                                <div className="flex justify-between items-center gap-2">
                                                    <span className="text-slate-500">Nama Project</span>
                                                    <span className="font-bold text-slate-900 truncate">{project?.name}</span>
                                                </div>
                                                <div className="flex justify-between items-center gap-2">
                                                    <span className="text-slate-500">Tanggal Event</span>
                                                    <span className="font-semibold text-slate-800">{eventDateFormatted}</span>
                                                </div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <span className="text-slate-500 shrink-0">Lokasi</span>
                                                    <span className="font-medium text-slate-800 text-right truncate">
                                                        {project?.location || 'Lokasi Terjadwal'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center gap-2">
                                                    <span className="text-slate-500">Kategori / PIC</span>
                                                    <span className="font-medium text-slate-800">
                                                        {project?.category?.name || 'Wedding'} • {supervisorName}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. 2-Column Main Section: Left 3 Item Tables | Right Summary Cards */}
                                    <div className="grid grid-cols-12 gap-4 items-start">
                                        {/* Left 3 Structured Tables (Span 7) */}
                                        <div className="col-span-7 space-y-2.5">
                                            {/* Table 1: DETAIL PROJECT (PAKET) */}
                                            <div className="space-y-1.5">
                                                <span className="font-bold text-xs text-slate-900 block">
                                                    1. DETAIL PROJECT (PAKET)
                                                </span>
                                                <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs">
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-[#0F172A] text-white text-[10px] uppercase font-bold tracking-wider">
                                                            <tr>
                                                                <th className="py-2.5 px-3.5">DESKRIPSI</th>
                                                                <th className="py-2.5 px-3.5 text-right">HARGA</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white">
                                                            <tr>
                                                                <td className="p-3.5">
                                                                    <strong className="text-slate-900 font-bold block text-xs">
                                                                        {project?.package?.name || 'Wedding Premium Package'}
                                                                    </strong>
                                                                    <span className="text-[10.5px] text-slate-500 block mt-0.5 leading-snug">
                                                                        {project?.package?.description ||
                                                                            'Coverage 12 Jam, 1 Photographer, 1 Videographer, Editing, Album, dll'}
                                                                    </span>
                                                                </td>
                                                                <td className="p-3.5 text-right font-bold text-slate-900 font-mono text-xs">
                                                                    {formatRupiah(packageTotal)}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Table 2: ADDITIONAL SERVICES (ALA CARTE) */}
                                            <div className="space-y-1.5">
                                                <span className="font-bold text-xs text-slate-900 block">
                                                    2. ADDITIONAL SERVICES (ALA CARTE)
                                                </span>
                                                <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs">
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-[#0F172A] text-white text-[10px] uppercase font-bold tracking-wider">
                                                            <tr>
                                                                <th className="py-2.5 px-3.5">DESKRIPSI</th>
                                                                <th className="py-2.5 px-2 text-center w-12">QTY</th>
                                                                <th className="py-2.5 px-3 text-right">HARGA SATUAN</th>
                                                                <th className="py-2.5 px-3.5 text-right">TOTAL</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-slate-100 text-[11px]">
                                                            {addonsList.map((item) => (
                                                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                                    <td className="py-2.5 px-3.5 font-medium text-slate-800">{item.name}</td>
                                                                    <td className="py-2.5 px-2 text-center font-mono text-slate-600">{item.qty}</td>
                                                                    <td className="py-2.5 px-3 text-right text-slate-600 font-mono">{formatRupiah(item.unit_price)}</td>
                                                                    <td className="py-2.5 px-3.5 text-right font-bold text-slate-900 font-mono">{formatRupiah(item.total)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Table 3: ADDITIONAL PROJECT COST (BIAYA OPERASIONAL) */}
                                            <div className="space-y-1.5">
                                                <span className="font-bold text-xs text-slate-900 block">
                                                    3. ADDITIONAL PROJECT COST (BIAYA OPERASIONAL)
                                                </span>
                                                <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs">
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-[#0F172A] text-white text-[10px] uppercase font-bold tracking-wider">
                                                            <tr>
                                                                <th className="py-2.5 px-3.5">DESKRIPSI</th>
                                                                <th className="py-2.5 px-2 text-center w-12">QTY</th>
                                                                <th className="py-2.5 px-3 text-right">HARGA SATUAN</th>
                                                                <th className="py-2.5 px-3.5 text-right">TOTAL</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-slate-100 text-[11px]">
                                                            {operationalCostsList.map((item) => (
                                                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                                                    <td className="py-2.5 px-3.5 font-medium text-slate-800">{item.name}</td>
                                                                    <td className="py-2.5 px-2 text-center font-mono text-slate-600">{item.qty}</td>
                                                                    <td className="py-2.5 px-3 text-right text-slate-600 font-mono">{formatRupiah(item.unit_price)}</td>
                                                                    <td className="py-2.5 px-3.5 text-right font-bold text-slate-900 font-mono">{formatRupiah(item.total)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Sidebar Summary Cards (Span 5) */}
                                        <div className="col-span-5 space-y-2.5">
                                            {/* RINGKASAN BIAYA */}
                                            <div className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 space-y-2 text-xs shadow-2xs">
                                                <span className="font-black text-[10px] text-slate-500 uppercase tracking-wider block">
                                                    RINGKASAN BIAYA
                                                </span>
                                                <div className="space-y-1.5 text-[11px]">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Detail Paket</span>
                                                        <span className="font-semibold text-slate-900 font-mono">{formatRupiah(packageTotal)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Additional Services</span>
                                                        <span className="font-semibold text-slate-900 font-mono">{formatRupiah(additionalServicesTotal)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Biaya Operasional</span>
                                                        <span className="font-semibold text-slate-900 font-mono">{formatRupiah(operationalCostTotal)}</span>
                                                    </div>
                                                </div>

                                                {/* Total Highlight */}
                                                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                                                    <span className="font-black text-xs text-slate-900 uppercase">TOTAL PROJECT</span>
                                                    <span className="font-black text-base text-[#3B46F1] font-mono">
                                                        {formatRupiah(grandTotal)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* PAYMENT BREAKDOWN */}
                                            <div className="p-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 space-y-1.5 text-xs shadow-2xs">
                                                <span className="font-black text-[10px] text-slate-500 uppercase tracking-wider block">
                                                    SKEMA PEMBAYARAN
                                                </span>
                                                <div className="space-y-1.5 text-[11px]">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-slate-600">DP ({dpPercent}%)</span>
                                                        <span className="font-bold text-emerald-600 font-mono text-xs">{formatRupiah(dpAmount)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-slate-600">Sisa Pelunasan</span>
                                                        <span className="font-bold text-amber-700 font-mono text-xs">{formatRupiah(remainingAmount)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* TRANSFER BANK (WITH COPY BUTTON) */}
                                            <div className="p-3 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 space-y-2 text-xs shadow-2xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-xs text-slate-900">Transfer Bank</span>
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700">
                                                        {defaultPaymentMethod.name}
                                                    </span>
                                                </div>

                                                <div className="p-2.5 bg-white rounded-xl border border-slate-200/70 flex items-center justify-between gap-2">
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 block uppercase font-bold">No. Rekening</span>
                                                        <span className="font-mono font-black text-sm text-slate-900 tracking-wider">
                                                            {defaultPaymentMethod.account_number}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 block">a.n. {defaultPaymentMethod.account_holder}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleCopyAccount}
                                                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                                                        title="Salin No. Rekening"
                                                    >
                                                        {copiedAccount ? (
                                                            <CheckCheck className="w-4 h-4 text-emerald-600" />
                                                        ) : (
                                                            <Copy className="w-4 h-4 text-slate-500" />
                                                        )}
                                                    </button>
                                                </div>

                                                <div className="flex items-start gap-1.5 text-[10px] text-slate-500 pt-0.5">
                                                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                    <p className="leading-snug">
                                                        Harap melakukan pembayaran sebelum tanggal jatuh tempo. Terima kasih atas kepercayaan Anda.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4. Bottom: Catatan & Signature */}
                                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 items-end">
                                        <div className="space-y-2 text-[10px] text-slate-600">
                                            <span className="font-black text-xs text-slate-900 uppercase block">CATATAN</span>
                                            <ul className="space-y-1 text-slate-600 leading-relaxed">
                                                <li className="flex items-start gap-1.5">
                                                    <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                                                    <span>Invoice ini sah dan diproses secara otomatis oleh sistem Lensaria.</span>
                                                </li>
                                                <li className="flex items-start gap-1.5">
                                                    <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                                                    <span>Pembayaran dianggap sah setelah dana masuk ke rekening resmi perusahaan.</span>
                                                </li>
                                                <li className="flex items-start gap-1.5">
                                                    <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                                                    <span>Konfirmasi bukti transfer melalui WhatsApp {studioPhone}.</span>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="text-right space-y-1">
                                            <span className="text-xs text-slate-500 block">Hormat kami,</span>
                                            {/* Ruang TTD dikosongkan */}
                                            <div className="h-14 w-36 ml-auto" />
                                            <strong className="font-black text-xs text-slate-900 block">{supervisorName}</strong>
                                            <span className="text-[10px] text-slate-500 block">Supervisor Studio</span>
                                        </div>
                                    </div>

                                    {/* 5. Footer Bar (Deep Slate Pill) */}
                                    <div className="bg-[#0B132B] text-white p-3.5 px-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs font-medium shadow-md shadow-slate-950/10">
                                        <div className="flex items-center gap-4 text-[11px]">
                                            <div className="flex items-center gap-1.5">
                                                <Camera className="w-3.5 h-3.5 opacity-80 text-indigo-400" />
                                                <span>{studioInstagram}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Globe className="w-3.5 h-3.5 opacity-80 text-indigo-400" />
                                                <span>{studioWebsite}</span>
                                            </div>
                                        </div>
                                        <div className="text-[11px] italic tracking-wide text-slate-300">
                                            Capture Your Moments, We Make It Timeless
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ══════════════════════════════════════════════════════════════════ */}
                            {/* TEMPLATE 2: MODERN VIVID ICONS (POLISHED & REFINED)               */}
                            {/* ══════════════════════════════════════════════════════════════════ */}
                            {selectedTemplate === 'modern' && (
                                <div className="p-6 sm:p-8 space-y-3.5 text-slate-900">
                                    {/* Header: AP Purple Rounded Badge & Gradient INVOICE */}
                                    <div className="flex items-start justify-between gap-4 pb-2 border-b border-slate-100">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3.5">
                                                {studioLogo ? (
                                                    <img src={studioLogo} alt={studioName} className="h-12 w-auto max-w-[140px] object-contain shrink-0" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#4338CA] text-white flex items-center justify-center font-serif text-xl font-bold italic tracking-tighter shadow-md shadow-indigo-500/20 shrink-0">
                                                        ap
                                                    </div>
                                                )}
                                                <div>
                                                    <h2 className="text-base font-black tracking-wider text-slate-900 uppercase">
                                                        {studioName}
                                                    </h2>
                                                    <p className="text-[9px] uppercase tracking-widest text-indigo-600 font-bold">
                                                        {studioTagline}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-[11px] text-slate-600 space-y-1">
                                                <p className="font-bold text-slate-800">{studioLegalName}</p>
                                                <p className="leading-tight text-slate-500">{studioAddress}</p>
                                                <div className="pt-1 flex items-center gap-4 text-slate-600 flex-wrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="w-3 h-3 text-[#4F46E5]" />
                                                        <span>{studioPhone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="w-3 h-3 text-[#4F46E5]" />
                                                        <span>{studioEmail}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <ExternalLink className="w-3 h-3 text-[#4F46E5]" />
                                                        <span>{studioWebsite}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Meta Header with Colorful Icons */}
                                        <div className="text-left sm:text-right space-y-2.5">
                                            <div className="flex items-center justify-start sm:justify-end gap-2.5">
                                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#4F46E5] to-[#7C3AED]">
                                                    INVOICE
                                                </h1>
                                                <span className="bg-[#4F46E5] text-white text-[10px] font-bold px-2.5 py-1 rounded-xl">
                                                    DP (50%)
                                                </span>
                                            </div>
                                            <div className="font-mono font-bold text-sm text-slate-900">
                                                {inv.invoice_number}
                                            </div>

                                            <div className="p-3 bg-indigo-50/40 rounded-2xl border border-indigo-100 text-[11px] space-y-1.5 text-left inline-block min-w-[240px]">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                                        <Calendar className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-slate-600 w-28">Tgl Invoice</span>
                                                    <span className="font-semibold text-slate-900">{issueDateFormatted}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                                        <Clock className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-slate-600 w-28">Jatuh Tempo</span>
                                                    <span className="font-semibold text-slate-900">{dueDateFormatted}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                                        <CreditCard className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-slate-600 w-28">Pembayaran</span>
                                                    <span className="font-semibold text-slate-900">Transfer Bank</span>
                                                </div>
                                                <div className="flex items-center gap-2 pt-1 border-t border-indigo-100">
                                                    <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                                        <AlertCircle className="w-3 h-3" />
                                                    </div>
                                                    <span className="text-slate-600 w-28">Status</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${statusBadge.badge}`}>
                                                        {statusBadge.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Diterbitkan Untuk & Detail Project Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3.5 rounded-2xl border border-indigo-100/90 bg-indigo-50/20 text-xs space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-[#4F46E5] font-black text-[10px] uppercase tracking-wider">
                                                <UserIcon className="w-3.5 h-3.5" />
                                                <span>DITERBITKAN UNTUK</span>
                                            </div>
                                            <h4 className="font-bold text-sm text-slate-900">{client.name}</h4>
                                            <p className="text-slate-600 font-mono text-[11px]">{client.phone}</p>
                                            <p className="text-slate-600 text-[11px] truncate">{client.email}</p>
                                            <p className="text-slate-500 text-[11px] leading-relaxed pt-0.5">{client.address}</p>
                                        </div>

                                        <div className="p-3.5 rounded-2xl border border-indigo-100/90 bg-indigo-50/20 text-xs space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-[#4F46E5] font-black text-[10px] uppercase tracking-wider">
                                                <FileText className="w-3.5 h-3.5" />
                                                <span>DETAIL PROJECT</span>
                                            </div>
                                            <div className="space-y-1 text-[11px]">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Project</span>
                                                    <span className="font-bold text-slate-900 truncate">{project?.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Tanggal</span>
                                                    <span className="font-semibold text-slate-800">{eventDateFormatted}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Lokasi</span>
                                                    <span className="font-medium text-slate-800 truncate">{project?.location || 'Grand Ballroom'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Supervisor</span>
                                                    <span className="font-medium text-slate-800">{supervisorName}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tables with Colorful Badges */}
                                    <div className="grid grid-cols-12 gap-4 items-start">
                                        <div className="col-span-7 space-y-2.5">
                                            {/* Table 1: Solid Indigo */}
                                            <div className="space-y-1.5">
                                                <span className="font-bold text-xs text-[#3730A3] block">1. DETAIL PROJECT (PAKET)</span>
                                                <div className="rounded-2xl overflow-hidden border border-indigo-100 shadow-2xs">
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-[#4338CA] text-white text-[10px] uppercase font-bold tracking-wider">
                                                            <tr>
                                                                <th className="py-2.5 px-3.5">DESKRIPSI</th>
                                                                <th className="py-2.5 px-3.5 text-right">HARGA</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white">
                                                            <tr>
                                                                <td className="p-3.5 flex items-start gap-2.5">
                                                                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0 mt-0.5">
                                                                        <Sparkles className="w-3.5 h-3.5" />
                                                                    </div>
                                                                    <div>
                                                                        <strong className="text-slate-900 font-bold block text-xs">
                                                                            {project?.package?.name || 'Wedding Premium Package'}
                                                                        </strong>
                                                                        <span className="text-[10.5px] text-slate-500 block mt-0.5">
                                                                            {project?.package?.description ||
                                                                                'Coverage 12 Jam, 1 Photographer, 1 Videographer, Editing, Album, dll'}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="p-3.5 text-right font-bold text-slate-900 font-mono text-xs">
                                                                    {formatRupiah(packageTotal)}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Table 2: Solid Emerald */}
                                            <div className="space-y-1.5">
                                                <span className="font-bold text-xs text-[#065F46] block">2. ADDITIONAL SERVICES (ALA CARTE)</span>
                                                <div className="rounded-2xl overflow-hidden border border-emerald-100 shadow-2xs">
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-[#059669] text-white text-[10px] uppercase font-bold tracking-wider">
                                                            <tr>
                                                                <th className="py-2.5 px-3.5">DESKRIPSI</th>
                                                                <th className="py-2.5 px-2 text-center w-12">QTY</th>
                                                                <th className="py-2.5 px-3 text-right">HARGA SATUAN</th>
                                                                <th className="py-2.5 px-3.5 text-right">TOTAL</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-slate-100 text-[11px]">
                                                            {addonsList.map((item) => (
                                                                <tr key={item.id} className="hover:bg-emerald-50/20">
                                                                    <td className="py-2.5 px-3.5 flex items-center gap-2 font-medium text-slate-800">
                                                                        <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                                            {item.type === 'video' ? <Video className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                                                                        </div>
                                                                        <span>{item.name}</span>
                                                                    </td>
                                                                    <td className="py-2.5 px-2 text-center font-mono text-slate-600">{item.qty}</td>
                                                                    <td className="py-2.5 px-3 text-right text-slate-600 font-mono">{formatRupiah(item.unit_price)}</td>
                                                                    <td className="py-2.5 px-3.5 text-right font-bold text-slate-900 font-mono">{formatRupiah(item.total)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Table 3: Solid Orange */}
                                            <div className="space-y-1.5">
                                                <span className="font-bold text-xs text-[#C2410C] block">3. ADDITIONAL PROJECT COST (BIAYA OPERASIONAL)</span>
                                                <div className="rounded-2xl overflow-hidden border border-orange-100 shadow-2xs">
                                                    <table className="w-full text-left text-xs">
                                                        <thead className="bg-[#EA580C] text-white text-[10px] uppercase font-bold tracking-wider">
                                                            <tr>
                                                                <th className="py-2.5 px-3.5">DESKRIPSI</th>
                                                                <th className="py-2.5 px-2 text-center w-12">QTY</th>
                                                                <th className="py-2.5 px-3 text-right">HARGA SATUAN</th>
                                                                <th className="py-2.5 px-3.5 text-right">TOTAL</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-slate-100 text-[11px]">
                                                            {operationalCostsList.map((item) => (
                                                                <tr key={item.id} className="hover:bg-orange-50/20">
                                                                    <td className="py-2.5 px-3.5 flex items-center gap-2 font-medium text-slate-800">
                                                                        <div className="w-5 h-5 rounded-md bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                                                            {item.type === 'transport' ? <Car className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                                                                        </div>
                                                                        <span>{item.name}</span>
                                                                    </td>
                                                                    <td className="py-2.5 px-2 text-center font-mono text-slate-600">{item.qty}</td>
                                                                    <td className="py-2.5 px-3 text-right text-slate-600 font-mono">{formatRupiah(item.unit_price)}</td>
                                                                    <td className="py-2.5 px-3.5 text-right font-bold text-slate-900 font-mono">{formatRupiah(item.total)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Sidebar Cards */}
                                        <div className="col-span-5 space-y-2.5">
                                            {/* RINGKASAN */}
                                            <div className="p-3 rounded-2xl border border-indigo-100 bg-indigo-50/20 space-y-2 text-xs shadow-2xs">
                                                <div className="flex items-center gap-2 text-[#4F46E5] font-black text-[10px] uppercase tracking-wider">
                                                    <FileText className="w-3.5 h-3.5" />
                                                    <span>RINGKASAN BIAYA</span>
                                                </div>
                                                <div className="space-y-1.5 text-[11px]">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Detail Paket</span>
                                                        <span className="font-semibold text-slate-900 font-mono">{formatRupiah(packageTotal)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Additional Services</span>
                                                        <span className="font-semibold text-slate-900 font-mono">{formatRupiah(additionalServicesTotal)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Biaya Operasional</span>
                                                        <span className="font-semibold text-slate-900 font-mono">{formatRupiah(operationalCostTotal)}</span>
                                                    </div>
                                                </div>
                                                <div className="pt-2 border-t border-indigo-100 flex justify-between items-center">
                                                    <span className="font-black text-xs text-slate-900 uppercase">TOTAL PROJECT</span>
                                                    <span className="font-black text-base text-[#4F46E5] font-mono">{formatRupiah(grandTotal)}</span>
                                                </div>
                                            </div>

                                            {/* PAYMENT */}
                                            <div className="p-3 rounded-2xl border border-purple-100 bg-purple-50/20 space-y-1.5 text-xs shadow-2xs">
                                                <div className="flex items-center gap-2 text-purple-700 font-black text-[10px] uppercase tracking-wider">
                                                    <CreditCard className="w-3.5 h-3.5" />
                                                    <span>SKEMA DP (50%)</span>
                                                </div>
                                                <div className="space-y-1 text-[11px]">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Nominal DP</span>
                                                        <span className="font-bold text-emerald-600 font-mono">{formatRupiah(dpAmount)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Sisa Pelunasan</span>
                                                        <span className="font-bold text-slate-900 font-mono">{formatRupiah(remainingAmount)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Transfer Bank */}
                                            <div className="p-3 rounded-2xl border border-blue-100 bg-blue-50/20 space-y-1.5 text-xs shadow-2xs">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
                                                        <Building2 className="w-3.5 h-3.5" />
                                                        <span>TRANSFER BANK</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleCopyAccount}
                                                        className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                                                    >
                                                        {copiedAccount ? 'Tersalin!' : 'Salin Rekening'}
                                                    </button>
                                                </div>
                                                <div className="space-y-1 text-[11px]">
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Bank</span>
                                                        <span className="font-bold text-slate-900">{defaultPaymentMethod.name}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">No. Rek</span>
                                                        <span className="font-bold text-slate-900 font-mono">{defaultPaymentMethod.account_number}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-500">Atas Nama</span>
                                                        <span className="font-semibold text-slate-900">{defaultPaymentMethod.account_holder}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom: Catatan & Signature */}
                                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 items-end">
                                        <div className="space-y-1.5 text-[10px] text-slate-600">
                                            <div className="flex items-center gap-1.5 text-[#4F46E5] font-black text-xs uppercase">
                                                <FileText className="w-3.5 h-3.5" />
                                                <span>CATATAN</span>
                                            </div>
                                            <ul className="list-disc list-inside space-y-0.5 text-slate-600 leading-relaxed">
                                                <li>Invoice ini sah dan diproses otomatis oleh sistem.</li>
                                                <li>Pembayaran sah setelah dana masuk ke rekening perusahaan.</li>
                                                <li>Konfirmasi transfer melalui WhatsApp {studioPhone}.</li>
                                            </ul>
                                        </div>

                                        <div className="text-right space-y-1">
                                            <span className="text-xs text-slate-500 block">Hormat kami,</span>
                                            {/* Ruang TTD dikosongkan */}
                                            <div className="h-14 w-36 ml-auto" />
                                            <strong className="font-black text-xs text-slate-900 block">{supervisorName}</strong>
                                            <span className="text-[10px] text-slate-500 block">Supervisor</span>
                                        </div>
                                    </div>

                                    {/* Footer Bar */}
                                    <div className="bg-gradient-to-r from-[#4F46E5] via-[#4338CA] to-[#3730A3] text-white p-3.5 px-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs font-medium shadow-md shadow-indigo-500/10">
                                        <div className="flex items-center gap-4 text-[11px]">
                                            <div className="flex items-center gap-1.5">
                                                <Camera className="w-3.5 h-3.5 opacity-80" />
                                                <span>{studioInstagram}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Globe className="w-3.5 h-3.5 opacity-80" />
                                                <span>{studioWebsite}</span>
                                            </div>
                                        </div>
                                        <div className="text-[11px] italic tracking-wide text-indigo-100">
                                            Capture Your Moments, We Make It Timeless
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ══════════════════════════════════════════════════════════════════ */}
                            {/* TEMPLATE 3: BOTANICAL SIGNATURE EXACT MATCH (GAMBAR 3)             */}
                            {/* ══════════════════════════════════════════════════════════════════ */}
                            {selectedTemplate === 'classic' && (
                                <div className="relative overflow-hidden">
                                    {/* Top Left Soft Lavender Wave Curve */}
                                    <div className="absolute top-0 left-0 w-56 sm:w-64 h-32 sm:h-40 pointer-events-none z-0 overflow-hidden">
                                        <svg viewBox="0 0 280 150" className="w-full h-full" preserveAspectRatio="none">
                                            <path d="M0,0 L210,0 Q140,95 0,125 Z" fill="#EDE9FE" opacity="0.7" />
                                            <path d="M0,0 L160,0 Q100,80 0,95 Z" fill="#DDD6FE" opacity="0.8" />
                                            <path d="M0,0 L110,0 Q60,60 0,70 Z" fill="#8B5CF6" opacity="0.4" />
                                        </svg>
                                    </div>

                                    {/* Top Right Subtle Accent Curve */}
                                    <div className="absolute top-0 right-0 w-36 h-24 pointer-events-none z-0 overflow-hidden opacity-40">
                                        <svg viewBox="0 0 160 100" className="w-full h-full" preserveAspectRatio="none">
                                            <path d="M160,0 L60,0 Q110,50 160,80 Z" fill="#DDD6FE" />
                                        </svg>
                                    </div>

                                    <div className="p-6 sm:p-8 space-y-4 relative z-10">
                                        {/* 1. Header: Hexagon Logo & Giant INVOICE Title */}
                                        <div className="flex items-start justify-between gap-4">
                                            {/* Left Studio Branding */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="relative flex flex-col items-center justify-center">
                                                        {studioLogo ? (
                                                            <div className="flex flex-col items-center">
                                                                <img src={studioLogo} alt={studioName} className="h-14 w-auto max-w-[160px] object-contain" />
                                                                <h2 className="text-sm sm:text-base font-black tracking-[0.25em] text-[#1E1B4B] uppercase font-sans mt-1">
                                                                    {studioName}
                                                                </h2>
                                                                <p className="text-[7.5px] uppercase tracking-[0.28em] text-[#4338CA] font-bold mt-0.5">
                                                                    {customTexts.tagline}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <svg className="w-24 h-14" viewBox="0 0 160 80">
                                                                    <line x1="12" y1="40" x2="42" y2="40" stroke="#1E1B4B" strokeWidth="1.8" strokeLinecap="round" />
                                                                    <line x1="118" y1="40" x2="148" y2="40" stroke="#1E1B4B" strokeWidth="1.8" strokeLinecap="round" />
                                                                    <polygon points="80,8 114,28 114,68 80,88 46,68 46,28" fill="none" stroke="#1E1B4B" strokeWidth="1.8" strokeLinejoin="round" />
                                                                    <text x="80" y="56" fontFamily="'Playfair Display', 'Brush Script MT', 'Great Vibes', Georgia, serif" fontSize="34" fontStyle="italic" fontWeight="normal" textAnchor="middle" fill="#1E1B4B">
                                                                        ap
                                                                    </text>
                                                                </svg>
                                                                <h2 className="text-sm sm:text-base font-black tracking-[0.25em] text-[#1E1B4B] uppercase font-sans mt-0.5">
                                                                    {studioName}
                                                                </h2>
                                                                <p className="text-[7.5px] uppercase tracking-[0.28em] text-[#4338CA] font-bold mt-0.5">
                                                                    {customTexts.tagline}
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Contact Items with Matching Purple Icons */}
                                                <div className="text-[11px] text-slate-700 space-y-1.5 pt-1.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-5 h-5 rounded-full bg-[#F3F0FF] text-[#5B21B6] flex items-center justify-center shrink-0">
                                                            <MapPin className="w-3 h-3" />
                                                        </div>
                                                        <span className="font-medium text-slate-800">{studioAddress}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-5 h-5 rounded-full bg-[#F3F0FF] text-[#5B21B6] flex items-center justify-center shrink-0">
                                                            <Phone className="w-3 h-3" />
                                                        </div>
                                                        <span className="font-medium text-slate-800">{studioPhone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-5 h-5 rounded-full bg-[#F3F0FF] text-[#5B21B6] flex items-center justify-center shrink-0">
                                                            <Mail className="w-3 h-3" />
                                                        </div>
                                                        <span className="font-medium text-slate-800">{studioEmail}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-5 h-5 rounded-full bg-[#F3F0FF] text-[#5B21B6] flex items-center justify-center shrink-0">
                                                            <Camera className="w-3 h-3" />
                                                        </div>
                                                        <span className="font-medium text-slate-800">{studioInstagram}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Header: INVOICE & Meta Table */}
                                            <div className="text-left sm:text-right space-y-2.5">
                                                <div>
                                                    <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-[#1E1B4B]">
                                                        INVOICE
                                                    </h1>
                                                    <span className="text-xs font-bold text-slate-800 tracking-[0.2em] block mt-1 uppercase">
                                                        {customTexts.invoiceSubtitle}
                                                    </span>
                                                    <div className="w-14 h-1 bg-amber-500 rounded-full mt-2 ml-0 sm:ml-auto"></div>
                                                </div>

                                                <div className="p-4 bg-[#F8F7FF] border border-[#E0D7FE] rounded-2xl text-[11px] space-y-2 text-left inline-block min-w-[240px] shadow-2xs">
                                                    <div className="grid grid-cols-[90px_10px_1fr] items-center">
                                                        <span className="text-slate-500 font-medium">No. Invoice</span>
                                                        <span className="text-slate-400">:</span>
                                                        <span className="font-bold text-[#5B21B6] font-mono text-xs">{inv.invoice_number}</span>
                                                    </div>
                                                    <div className="grid grid-cols-[90px_10px_1fr] items-center">
                                                        <span className="text-slate-500 font-medium">Tanggal</span>
                                                        <span className="text-slate-400">:</span>
                                                        <span className="font-semibold text-slate-800">{issueDateFormatted}</span>
                                                    </div>
                                                    <div className="grid grid-cols-[90px_10px_1fr] items-center">
                                                        <span className="text-slate-500 font-medium">Jatuh Tempo</span>
                                                        <span className="text-slate-400">:</span>
                                                        <span className="font-semibold text-slate-800">{dueDateFormatted}</span>
                                                    </div>
                                                    <div className="grid grid-cols-[90px_10px_1fr] items-center">
                                                        <span className="text-slate-500 font-medium">Jenis Invoice</span>
                                                        <span className="text-slate-400">:</span>
                                                        <span className="font-semibold text-slate-800">DP (Uang Muka)</span>
                                                    </div>
                                                    <div className="grid grid-cols-[90px_10px_1fr] items-center pt-1 border-t border-[#E0D7FE]">
                                                        <span className="text-slate-500 font-medium">Status</span>
                                                        <span className="text-slate-400">:</span>
                                                        <span className={`inline-flex items-center gap-1.5 font-bold text-[10.5px] ${
                                                            isInvoicePaid
                                                                ? 'text-emerald-700'
                                                                : (project?.payment_status === 'partial' || Number(project?.paid_amount || 0) > 0 ? 'text-indigo-700' : 'text-rose-600')
                                                        }`}>
                                                            <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                                                            <span>{statusBadge.label}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. Middle Row: KEPADA & RINGKASAN PROJECT With Botanical Watermarks */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Card 1: KEPADA with Botanical Watermark */}
                                            <div className="relative overflow-hidden p-5 rounded-2xl border border-[#E0D7FE] bg-white shadow-2xs space-y-2">
                                                <div className="relative z-10 space-y-1.5">
                                                    <span className="text-xs font-black tracking-wider text-[#5B21B6] uppercase block">
                                                        KEPADA
                                                    </span>
                                                    <div className="w-10 h-0.5 bg-[#5B21B6] rounded-full mb-2"></div>
                                                    <h3 className="text-sm font-bold text-slate-900 pt-1">
                                                        {client.name || 'Kevin Sanjaya & Jessica Mila'}
                                                    </h3>
                                                    <p className="text-xs text-slate-700 font-mono">
                                                        {client.phone || '0813 9876 5432'}
                                                    </p>
                                                    <p className="text-xs text-slate-600">
                                                        {client.email || 'kevin.sanjaya@gmail.com'}
                                                    </p>
                                                </div>

                                                {/* Botanical Branch Watermark Asset */}
                                                <img
                                                    src="/images/invoice-botanical-branch.png"
                                                    alt="Botanical Branch"
                                                    className="absolute -bottom-4 -right-4 w-36 h-36 object-contain opacity-25 pointer-events-none select-none mix-blend-multiply"
                                                />
                                            </div>

                                            {/* Card 2: RINGKASAN PROJECT with Camera Botanical Watermark */}
                                            <div className="relative overflow-hidden p-5 rounded-2xl border border-[#E0D7FE] bg-white shadow-2xs space-y-2">
                                                <div className="relative z-10 space-y-1.5">
                                                    <span className="text-xs font-black tracking-wider text-[#5B21B6] uppercase block">
                                                        RINGKASAN PROJECT
                                                    </span>
                                                    <div className="w-10 h-0.5 bg-[#5B21B6] rounded-full mb-2"></div>
                                                    <div className="space-y-1 text-xs pt-1">
                                                        <div className="grid grid-cols-[105px_10px_1fr]">
                                                            <span className="text-slate-600 font-medium">Nama Project</span>
                                                            <span className="text-slate-400">:</span>
                                                            <span className="font-bold text-slate-900 truncate">
                                                                {project?.name || 'Prewedding Kevin & Jessica Mila'}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-[105px_10px_1fr]">
                                                            <span className="text-slate-600 font-medium">Kategori</span>
                                                            <span className="text-slate-400">:</span>
                                                            <span className="text-slate-800">
                                                                {project?.category?.name || 'Prewedding / Event / Family / dll'}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-[105px_10px_1fr]">
                                                            <span className="text-slate-600 font-medium">Workflow</span>
                                                            <span className="text-slate-400">:</span>
                                                            <span className="text-slate-800">5 Tahap</span>
                                                        </div>
                                                        <div className="grid grid-cols-[105px_10px_1fr]">
                                                            <span className="text-slate-600 font-medium">Hari H</span>
                                                            <span className="text-slate-400">:</span>
                                                            <span className="font-semibold text-slate-800">{eventDateFormatted}</span>
                                                        </div>
                                                        <div className="grid grid-cols-[105px_10px_1fr]">
                                                            <span className="text-slate-600 font-medium">PIC Supervisor</span>
                                                            <span className="text-slate-400">:</span>
                                                            <span className="text-slate-800">{supervisorName} (Supervisor)</span>
                                                        </div>
                                                        <div className="grid grid-cols-[105px_10px_1fr]">
                                                            <span className="text-slate-600 font-medium">Photographer</span>
                                                            <span className="text-slate-400">:</span>
                                                            <span className="text-slate-800">{parsedPhotographer}</span>
                                                        </div>
                                                        <div className="grid grid-cols-[105px_10px_1fr]">
                                                            <span className="text-slate-600 font-medium">Editor</span>
                                                            <span className="text-slate-400">:</span>
                                                            <span className="text-slate-800">{parsedEditor}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Camera Botanical Watermark Asset */}
                                                <img
                                                    src="/images/invoice-camera-botanical.png"
                                                    alt="Camera Botanical"
                                                    className="absolute -bottom-2 -right-3 w-40 h-32 object-contain opacity-25 pointer-events-none select-none mix-blend-multiply"
                                                />
                                            </div>
                                        </div>

                                        {/* 3. Main Invoice Table */}
                                        <div className="rounded-2xl overflow-hidden border border-[#E0D7FE] shadow-2xs">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-[#0B0E38] text-white">
                                                    <tr className="text-[10px] uppercase font-bold tracking-wider">
                                                        <th className="py-3 px-5 text-left">DESKRIPSI</th>
                                                        <th className="py-3 px-5 text-right">JUMLAH (Rp)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white">
                                                    <tr className="border-b border-slate-100">
                                                        <td className="py-4 px-5 font-semibold text-slate-800 text-xs">
                                                            DP - {project?.name || 'Prewedding Kevin & Jessica Mila'}
                                                        </td>
                                                        <td className="py-4 px-5 text-right font-bold text-slate-900 font-mono text-xs">
                                                            {formatRupiah(dpAmount)}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <div className="p-4 px-5 bg-[#F5F3FF] flex items-center justify-between border-t border-[#E0D7FE]">
                                                <span className="text-xs font-black tracking-wider text-[#5B21B6] uppercase">
                                                    TOTAL DIBAYAR (DP)
                                                </span>
                                                <span className="text-2xl font-black text-[#5B21B6] font-mono">
                                                    {formatRupiah(dpAmount)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 4. Bottom Row: Metode Pembayaran & Catatan */}
                                        <div className="grid grid-cols-2 gap-4 pt-1 items-start">
                                            {/* Left Column: Metode Pembayaran */}
                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <span className="text-xs font-black tracking-wider text-[#5B21B6] uppercase block">
                                                        METODE PEMBAYARAN
                                                    </span>
                                                    <div className="w-10 h-0.5 bg-[#5B21B6] rounded-full mb-3"></div>

                                                    <div className="p-4 bg-white border border-[#E0D7FE] rounded-2xl space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-[#F3F0FF] text-[#5B21B6] flex items-center justify-center shrink-0">
                                                                <Building2 className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-900">Transfer Bank</p>
                                                                <p className="text-xs text-slate-600 font-medium">{customTexts.bankName}</p>
                                                            </div>
                                                        </div>
                                                        <div className="pt-1">
                                                            <p className="text-sm font-mono font-black text-slate-900 tracking-wider">
                                                                {customTexts.bankAccount}
                                                            </p>
                                                            <p className="text-[11px] text-slate-500 font-medium">
                                                                {customTexts.bankHolder}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Warning Reminder / Payment Verification */}
                                                {!isInvoicePaid ? (
                                                    <div className="p-4 bg-[#FFF5F5] border border-rose-200/90 rounded-2xl space-y-1.5">
                                                        <div className="flex items-center gap-2 text-rose-600">
                                                            <Calendar className="w-4 h-4" />
                                                            <span className="text-[10px] font-black uppercase tracking-wider">
                                                                {customTexts.reminderTitle}
                                                            </span>
                                                        </div>
                                                        <p className="text-base font-bold text-rose-700 font-mono">
                                                            {dueDateFormatted}
                                                        </p>
                                                        <p className="text-[11px] text-rose-600/90 leading-tight">
                                                            {customTexts.reminderSub}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-1.5">
                                                        <div className="flex items-center gap-2 text-emerald-700">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            <span className="text-[10px] font-black uppercase tracking-wider">
                                                                PEMBAYARAN TELAH DIVERIFIKASI
                                                            </span>
                                                        </div>
                                                        <p className="text-base font-bold text-emerald-800 font-mono">
                                                            LUNAS ({formatRupiah(inv.paid_amount || dpAmount)})
                                                        </p>
                                                        <p className="text-[11px] text-emerald-700/90 leading-tight">
                                                            Pembayaran sah telah diterima via rekening resmi dan tercatat di sistem Keuangan.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Column: Catatan */}
                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <span className="text-xs font-black tracking-wider text-[#5B21B6] uppercase block">
                                                        CATATAN
                                                    </span>
                                                    <div className="w-10 h-0.5 bg-[#5B21B6] rounded-full mb-3"></div>

                                                    <ul className="space-y-1.5 text-xs text-slate-700">
                                                        <li className="flex items-start gap-1.5">
                                                            <span className="text-[#5B21B6] font-bold">•</span>
                                                            <span>{customTexts.note1}</span>
                                                        </li>
                                                        <li className="flex items-start gap-1.5">
                                                            <span className="text-[#5B21B6] font-bold">•</span>
                                                            <span>{customTexts.note2}</span>
                                                        </li>
                                                    </ul>
                                                </div>

                                                {/* Automatic send callout */}
                                                <div className="p-3.5 bg-white border border-dashed border-[#A78BFA] rounded-2xl flex items-start gap-2.5 text-slate-700">
                                                    <Receipt className="w-4 h-4 text-[#5B21B6] shrink-0 mt-0.5" />
                                                    <p className="text-[11px] text-slate-600 leading-snug">
                                                        {customTexts.autoSendNote}
                                                    </p>
                                                </div>

                                                {/* Cursive Thank You */}
                                                <div className="text-center pt-2 space-y-0.5">
                                                    <h3 className="font-serif italic text-2xl text-[#1E1B4B] tracking-wide">
                                                        {customTexts.thankYouTitle}
                                                    </h3>
                                                    <p className="text-[11px] text-slate-500 font-medium">
                                                        {customTexts.thankYouSub}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 5. Trust Badges Bar */}
                                        <div className="p-3 bg-white border border-[#E0D7FE] rounded-2xl shadow-2xs grid grid-cols-4 gap-3 items-center divide-x divide-slate-100">
                                            <div className="flex items-center justify-center gap-2 py-1">
                                                <div className="w-7 h-7 flex items-center justify-center">
                                                    {studioLogo ? (
                                                        <img src={studioLogo} alt={studioName} className="w-7 h-7 object-contain" />
                                                    ) : (
                                                        <svg className="w-7 h-7" viewBox="0 0 100 100">
                                                            <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="none" stroke="#1E1B4B" strokeWidth="3" />
                                                            <text x="50" y="60" fontFamily="'Playfair Display', cursive, serif" fontSize="30" fontStyle="italic" fontWeight="bold" textAnchor="middle" fill="#1E1B4B">ap</text>
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-black tracking-wider text-slate-900 uppercase">{studioName}</span>
                                            </div>

                                            <div className="flex items-center justify-center gap-2 py-1 pl-2">
                                                <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
                                                <div className="text-left">
                                                    <p className="text-[10px] font-bold text-slate-800 leading-tight">{customTexts.badge1Title}</p>
                                                    <p className="text-[9px] text-slate-500">{customTexts.badge1Sub}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-center gap-2 py-1 pl-2">
                                                <Camera className="w-4 h-4 text-[#7C3AED]" />
                                                <div className="text-left">
                                                    <p className="text-[10px] font-bold text-slate-800 leading-tight">{customTexts.badge2Title}</p>
                                                    <p className="text-[9px] text-slate-500">{customTexts.badge2Sub}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-center gap-2 py-1 pl-2">
                                                <Heart className="w-4 h-4 text-[#7C3AED]" />
                                                <div className="text-left">
                                                    <p className="text-[10px] font-bold text-slate-800 leading-tight">{customTexts.badge3Title}</p>
                                                    <p className="text-[9px] text-slate-500">{customTexts.badge3Sub}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 6. Bottom Purple Double Wave Banner */}
                                    <div className="relative w-full overflow-hidden mt-4 -mb-10">
                                        <svg viewBox="0 0 1000 120" className="w-full h-16 sm:h-20 block" preserveAspectRatio="none">
                                            <path d="M0,50 Q250,110 500,50 T1000,45 L1000,120 L0,120 Z" fill="#8B5CF6" opacity="0.45" />
                                            <path d="M0,65 Q300,120 600,60 T1000,60 L1000,120 L0,120 Z" fill="#6D28D9" opacity="0.85" />
                                            <path d="M0,80 Q350,130 700,75 T1000,75 L1000,120 L0,120 Z" fill="#4C1D95" />
                                        </svg>
                                        <div className="bg-[#4C1D95] text-white text-center pb-3 pt-0.5 text-[9px] sm:text-[10px] tracking-[0.3em] font-bold uppercase">
                                            {customTexts.footerWebsite.toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIWAYAT INVOICE TABLE ────────────────────────────────── */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3.5">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-xs tracking-tight">
                                Riwayat Invoice Project
                            </h3>
                            <span className="text-[11px] text-slate-400">
                                {invoices.length} Dokumen Tercatat
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                                        <th className="pb-2">NO. INVOICE</th>
                                        <th className="pb-2">JENIS</th>
                                        <th className="pb-2">TANGGAL</th>
                                        <th className="pb-2">JATUH TEMPO</th>
                                        <th className="pb-2 text-right">NOMINAL</th>
                                        <th className="pb-2 text-center">STATUS</th>
                                        <th className="pb-2 text-center w-12">AKSI</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {invoices.map((item) => (
                                        <tr key={item.id} className="group hover:bg-slate-50/50">
                                            <td className="py-2.5 font-bold text-slate-900 font-mono">
                                                {item.invoice_number}
                                            </td>
                                            <td className="py-2.5 text-slate-600">DP (Uang Muka)</td>
                                            <td className="py-2.5 text-slate-500">
                                                {formatDateIndo(item.issue_date)}
                                            </td>
                                            <td className="py-2.5 text-slate-500">
                                                {formatDateIndo(item.due_date)}
                                            </td>
                                            <td className="py-2.5 text-right font-bold text-slate-900 font-mono">
                                                {formatRupiah(item.total)}
                                            </td>
                                            <td className="py-2.5 text-center">
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${statusBadge.badge}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                                                    <span>{statusBadge.label}</span>
                                                </span>
                                            </td>
                                            <td className="py-2.5 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => router.visit(`/projects/${project?.id}/invoice?invoice_id=${item.id}`)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                                    title="Lihat Invoice"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN (30% - 4 COLS): SIDEBAR PANELS ────────────────── */}
                <div className="col-span-12 lg:col-span-4 space-y-4 lg:sticky lg:top-4">
                    {/* ── CARD 1: INFORMASI INVOICE ───────────────────────────────── */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
                        <h3 className="font-bold text-slate-900 text-xs tracking-tight">
                            Informasi Dokumen
                        </h3>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500">No. Invoice</span>
                                <span className="font-bold text-slate-900 font-mono">{inv.invoice_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Tanggal Terbit</span>
                                <span className="font-semibold text-slate-800">{issueDateFormatted}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Jatuh Tempo</span>
                                <span className="font-semibold text-slate-800">{dueDateFormatted}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Jenis Dokumen</span>
                                <span className="font-semibold text-indigo-700">Invoice DP ({dpPercent}%)</span>
                            </div>
                            <div className="flex justify-between items-center pt-1.5 border-t border-slate-100">
                                <span className="text-slate-500">Status Pembayaran</span>
                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${statusBadge.badge}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                                    <span>{statusBadge.label}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── CARD: STATUS & KONFIRMASI DP ──────────────────────────── */}
                    <div className={`p-4 rounded-3xl border shadow-2xs space-y-3 ${
                        isInvoicePaid
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                            : 'bg-amber-50/80 border-amber-200 text-amber-950'
                    }`}>
                        <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                isInvoicePaid ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                            }`}>
                                {isInvoicePaid ? <Check className="w-4 h-4 stroke-[3]" /> : <Clock className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-xs truncate">
                                    {isInvoicePaid ? 'Invoice DP Telah Lunas' : 'Menunggu Pembayaran DP'}
                                </h4>
                                <p className="text-[11px] opacity-80 truncate">
                                    {isInvoicePaid
                                        ? `Tercatat di Keuangan: ${formatRupiah(inv.paid_amount || dpAmount)}`
                                        : `Total Tagihan: ${formatRupiah(dpAmount)}`}
                                </p>
                            </div>
                        </div>

                        {!isInvoicePaid ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setPaymentFormData({
                                        amount: String(Math.round(dpAmount)),
                                        payment_date: new Date().toISOString().split('T')[0],
                                        payment_method_id: defaultPaymentMethod?.id || payment_methods[0]?.id || '',
                                        reference_number: '',
                                        notes: `Pembayaran ${inv.notes || `Invoice ${inv.invoice_number}`}`,
                                    });
                                    setIsPaymentModalOpen(true);
                                }}
                                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Konfirmasi Terima DP (Catat ke Keuangan)</span>
                            </button>
                        ) : (
                            <div className="text-[11px] font-semibold text-emerald-800 bg-white/80 py-2 px-3 rounded-xl border border-emerald-200 text-center">
                                Pembayaran sah dan langsung tercatat di Keuangan
                            </div>
                        )}
                    </div>

                    {/* ── CARD 2: RINCIAN PEMBAYARAN ──────────────────────────────── */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
                        <h3 className="font-bold text-slate-900 text-xs tracking-tight">
                            Rincian Finansial
                        </h3>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Total Nilai Project</span>
                                <span className="font-bold text-slate-900 font-mono">{formatRupiah(grandTotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Nominal DP ({dpPercent}%)</span>
                                <span className="font-bold text-emerald-600 font-mono">{formatRupiah(dpAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Sisa Pelunasan</span>
                                <span className="font-bold text-amber-700 font-mono">{formatRupiah(remainingAmount)}</span>
                            </div>
                            <div className="flex justify-between pt-1.5 border-t border-slate-100">
                                <span className="font-black text-[#3B46F1]">Total Tagihan DP</span>
                                <span className="font-black text-sm text-[#3B46F1] font-mono">{formatRupiah(dpAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── CARD 3: METODE PEMBAYARAN ───────────────────────────────── */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-xs tracking-tight">
                                Rekening Tujuan
                            </h3>
                            <button
                                type="button"
                                onClick={handleCopyAccount}
                                className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                            >
                                <Copy className="w-3 h-3" />
                                <span>{copiedAccount ? 'Tersalin' : 'Salin'}</span>
                            </button>
                        </div>

                        <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/70 text-xs space-y-1">
                            <p className="font-bold text-slate-900">{defaultPaymentMethod.name}</p>
                            <p className="font-mono font-bold text-slate-900 text-sm tracking-wider">{defaultPaymentMethod.account_number}</p>
                            <p className="text-[10px] text-slate-500">a.n. {defaultPaymentMethod.account_holder}</p>
                        </div>
                    </div>

                    {/* ── CARD: KUSTOMISASI TEKS ────────────────────────────── */}
                    <div className="bg-gradient-to-br from-purple-50/70 to-indigo-50/70 p-5 rounded-3xl border border-purple-200/80 shadow-2xs space-y-2.5">
                        <div className="flex items-center gap-2 text-[#7C3AED] font-bold text-xs">
                            <Edit3 className="w-4 h-4" />
                            <span>Kustomisasi Teks Invoice</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                            Sesuaikan teks catatan DP, slogan studio, pesan pengingat jatuh tempo, dan baris garansi layanan.
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsTextModalOpen(true)}
                            className="w-full py-2 px-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <Settings2 className="w-3.5 h-3.5" />
                            <span>Buka Form Edit Teks</span>
                        </button>
                    </div>

                    {/* ── CARD 4: TINDAKAN CEPAT ──────────────────────────────────── */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2.5">
                        <h3 className="font-bold text-slate-900 text-xs tracking-tight">
                            Tindakan Cepat
                        </h3>

                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={handleSendWhatsApp}
                                className="w-full py-2.5 px-4 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Phone className="w-4 h-4" />
                                <span>Kirim via WhatsApp</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleSendEmail}
                                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-[#3B46F1] border border-[#3B46F1]/40 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Mail className="w-4 h-4" />
                                <span>Kirim via Email</span>
                            </button>

                            <button
                                type="button"
                                onClick={handlePrint}
                                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5 text-slate-500" />
                                <span>Download PDF</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 4. MODAL KUSTOMISASI TEKS INVOICE ─────────────────────────────── */}
            {isTextModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                        {/* Header Modal */}
                        <div className="p-5 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#7C3AED] flex items-center justify-center">
                                    <Edit3 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">
                                        Kustomisasi Teks &amp; Catatan Invoice
                                    </h3>
                                    <p className="text-[11px] text-slate-500">
                                        Ubah teks yang tampil pada invoice, preview langsung berubah seketika.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsTextModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body Form */}
                        <div className="p-6 space-y-5 overflow-y-auto text-xs text-slate-800 flex-1">
                            {/* Section 1: Header & Slogan */}
                            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-200/60">
                                <span className="font-black text-[10.5px] uppercase tracking-wider text-[#7C3AED] block">
                                    1. Header &amp; Slogan
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">
                                            Subtitle Invoice (Badge DP)
                                        </label>
                                        <input
                                            type="text"
                                            value={customTexts.invoiceSubtitle}
                                            onChange={(e) => setCustomTexts({ ...customTexts, invoiceSubtitle: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-hidden"
                                            placeholder="DP (UANG MUKA)"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">
                                            Slogan / Tagline Studio
                                        </label>
                                        <input
                                            type="text"
                                            value={customTexts.tagline}
                                            onChange={(e) => setCustomTexts({ ...customTexts, tagline: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-hidden"
                                            placeholder="CAPTURING MOMENTS, CREATING MEMORIES"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Metode Pembayaran (Rekening) */}
                            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-200/60">
                                <span className="font-black text-[10.5px] uppercase tracking-wider text-[#7C3AED] block">
                                    2. Informasi Transfer Bank
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">Nama Bank</label>
                                        <input
                                            type="text"
                                            value={customTexts.bankName}
                                            onChange={(e) => setCustomTexts({ ...customTexts, bankName: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-hidden"
                                            placeholder="Bank Mandiri"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">No. Rekening</label>
                                        <input
                                            type="text"
                                            value={customTexts.bankAccount}
                                            onChange={(e) => setCustomTexts({ ...customTexts, bankAccount: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium font-mono focus:ring-2 focus:ring-[#7C3AED] focus:outline-hidden"
                                            placeholder="123-00-1234567-8"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">Atas Nama</label>
                                        <input
                                            type="text"
                                            value={customTexts.bankHolder}
                                            onChange={(e) => setCustomTexts({ ...customTexts, bankHolder: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-hidden"
                                            placeholder="a.n. PT Arams Pictures"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Catatan Invoice */}
                            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-200/60">
                                <span className="font-black text-[10.5px] uppercase tracking-wider text-[#7C3AED] block">
                                    3. Poin Catatan &amp; Notifikasi
                                </span>
                                <div className="space-y-2.5">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">Catatan Poin 1</label>
                                        <input
                                            type="text"
                                            value={customTexts.note1}
                                            onChange={(e) => setCustomTexts({ ...customTexts, note1: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-hidden"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">Catatan Poin 2</label>
                                        <input
                                            type="text"
                                            value={customTexts.note2}
                                            onChange={(e) => setCustomTexts({ ...customTexts, note2: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-hidden"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">Keterangan Box Callout</label>
                                        <input
                                            type="text"
                                            value={customTexts.autoSendNote}
                                            onChange={(e) => setCustomTexts({ ...customTexts, autoSendNote: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-hidden"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Pengingat & Ucapan Terima Kasih */}
                            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-200/60">
                                <span className="font-black text-[10.5px] uppercase tracking-wider text-[#7C3AED] block">
                                    4. Pengingat Jatuh Tempo &amp; Ucapan Terima Kasih
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">Judul Box Pengingat</label>
                                        <input
                                            type="text"
                                            value={customTexts.reminderTitle}
                                            onChange={(e) => setCustomTexts({ ...customTexts, reminderTitle: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-hidden"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">Sub-teks Pengingat</label>
                                        <input
                                            type="text"
                                            value={customTexts.reminderSub}
                                            onChange={(e) => setCustomTexts({ ...customTexts, reminderSub: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-hidden"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">Judul Ucapan</label>
                                        <input
                                            type="text"
                                            value={customTexts.thankYouTitle}
                                            onChange={(e) => setCustomTexts({ ...customTexts, thankYouTitle: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-hidden"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">Pesan Ucapan Terima Kasih</label>
                                        <input
                                            type="text"
                                            value={customTexts.thankYouSub}
                                            onChange={(e) => setCustomTexts({ ...customTexts, thankYouSub: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-hidden"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: Trust Badges & Website */}
                            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-200/60">
                                <span className="font-black text-[10.5px] uppercase tracking-wider text-[#7C3AED] block">
                                    5. Bar Badges Garansi &amp; Website Footer
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">Badge 1</label>
                                        <input
                                            type="text"
                                            value={customTexts.badge1Title}
                                            onChange={(e) => setCustomTexts({ ...customTexts, badge1Title: e.target.value })}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                                            placeholder="Profesional"
                                        />
                                        <input
                                            type="text"
                                            value={customTexts.badge1Sub}
                                            onChange={(e) => setCustomTexts({ ...customTexts, badge1Sub: e.target.value })}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                                            placeholder="& Terpercaya"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">Badge 2</label>
                                        <input
                                            type="text"
                                            value={customTexts.badge2Title}
                                            onChange={(e) => setCustomTexts({ ...customTexts, badge2Title: e.target.value })}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                                            placeholder="Kualitas Terbaik"
                                        />
                                        <input
                                            type="text"
                                            value={customTexts.badge2Sub}
                                            onChange={(e) => setCustomTexts({ ...customTexts, badge2Sub: e.target.value })}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                                            placeholder="Untuk Setiap Momen"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">Badge 3</label>
                                        <input
                                            type="text"
                                            value={customTexts.badge3Title}
                                            onChange={(e) => setCustomTexts({ ...customTexts, badge3Title: e.target.value })}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                                            placeholder="Layanan Sepenuh"
                                        />
                                        <input
                                            type="text"
                                            value={customTexts.badge3Sub}
                                            onChange={(e) => setCustomTexts({ ...customTexts, badge3Sub: e.target.value })}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                                            placeholder="Hati"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">Teks Website Footer</label>
                                        <input
                                            type="text"
                                            value={customTexts.footerWebsite}
                                            onChange={(e) => setCustomTexts({ ...customTexts, footerWebsite: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                                            placeholder="WWW.ARAMS-PICTURES.COM"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">Motto / Tagline Footer</label>
                                        <input
                                            type="text"
                                            value={customTexts.footerMotto}
                                            onChange={(e) => setCustomTexts({ ...customTexts, footerMotto: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                                            placeholder="Capture Your Moments, We Make It Timeless"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setCustomTexts(initialCustomTexts);
                                    toast.success('Teks invoice berhasil direset ke standar!');
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                                <span>Reset ke Standar</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsTextModalOpen(false);
                                    toast.success('Kustomisasi teks invoice berhasil diterapkan!');
                                }}
                                className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold shadow-sm shadow-purple-500/20 transition-all cursor-pointer"
                            >
                                <Check className="w-3.5 h-3.5" />
                                <span>Terapkan Perubahan</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL: CATAT PEMBAYARAN INVOICE ─────────────────────────────── */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 border border-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-sm text-slate-900">Konfirmasi Pembayaran DP ke Keuangan</h3>
                            <button
                                type="button"
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handlePaymentSubmit} className="space-y-3.5 text-xs">
                            {/* Summary Finansial Singkat */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                                <div>
                                    <span className="text-slate-400 block text-[10px] font-medium">Nilai Invoice</span>
                                    <span className="font-bold text-slate-900 font-mono">{formatRupiah(inv.total || dpAmount)}</span>
                                </div>
                                <div className="text-center">
                                    <span className="text-slate-400 block text-[10px] font-medium">Sudah Dibayar</span>
                                    <span className="font-bold text-emerald-600 font-mono">{formatRupiah(inv.paid_amount || 0)}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-slate-400 block text-[10px] font-medium">Total Nilai Project</span>
                                    <span className="font-bold text-indigo-700 font-mono">{formatRupiah(grandTotal)}</span>
                                </div>
                            </div>

                            {/* Shortcut Pilihan Cepat Nominal */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px]">
                                    <label className="font-bold text-slate-700">Pilihan Cepat Nominal (Shortcut):</label>
                                    <span className="text-[10px] text-slate-400">Klik untuk isi otomatis</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {dpAmount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPaymentFormData({
                                                    ...paymentFormData,
                                                    amount: String(Math.round(dpAmount)),
                                                    notes: `Pembayaran ${inv.notes || `Invoice ${inv.invoice_number}`}`,
                                                });
                                            }}
                                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                                Number(paymentFormData.amount) === Math.round(dpAmount)
                                                    ? 'bg-indigo-50 text-[#3B46F1] border-indigo-300 ring-1 ring-indigo-200'
                                                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                            }`}
                                        >
                                            Bayar Tagihan DP ({formatRupiah(dpAmount)})
                                        </button>
                                    )}

                                    {remainingAmount > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPaymentFormData({
                                                    ...paymentFormData,
                                                    amount: String(Math.round(remainingAmount)),
                                                    notes: `Pelunasan Sisa Pembayaran Project ${project?.name || ''}`,
                                                });
                                            }}
                                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                                Number(paymentFormData.amount) === Math.round(remainingAmount)
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-200'
                                                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                            }`}
                                        >
                                            Pelunasan Sisa ({formatRupiah(remainingAmount)})
                                        </button>
                                    )}

                                    {grandTotal > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPaymentFormData({
                                                    ...paymentFormData,
                                                    amount: String(Math.round(grandTotal)),
                                                    notes: `Pembayaran Lunas Penuh (100%) Project ${project?.name || ''}`,
                                                });
                                            }}
                                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                                Number(paymentFormData.amount) === Math.round(grandTotal)
                                                    ? 'bg-purple-50 text-purple-700 border-purple-300 ring-1 ring-purple-200'
                                                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                            }`}
                                        >
                                            Lunas Penuh ({formatRupiah(grandTotal)})
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Input Jumlah Pembayaran dengan Format Otomatis */}
                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Jumlah Pembayaran *</label>
                                <FormattedNumberInput
                                    value={Number(paymentFormData.amount) || ''}
                                    onChange={(val) => setPaymentFormData({ ...paymentFormData, amount: String(val) })}
                                    prefix="Rp"
                                    placeholder="0"
                                    className="w-full text-sm font-mono font-bold focus:border-[#3B46F1] focus:ring-2 focus:ring-[#3B46F1]/20"
                                    required
                                />
                                {Number(paymentFormData.amount) > 0 && (
                                    <p className="text-[11px] text-slate-500 italic">
                                        Nominal: <strong className="text-slate-800 font-semibold">{formatRupiah(Number(paymentFormData.amount))}</strong>
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Tanggal Pembayaran *</label>
                                <input
                                    type="date"
                                    value={paymentFormData.payment_date}
                                    onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_date: e.target.value })}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B46F1] outline-hidden"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Metode Pembayaran / Rekening Bank *</label>
                                <select
                                    value={paymentFormData.payment_method_id}
                                    onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_method_id: e.target.value })}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#3B46F1] outline-hidden bg-white"
                                    required
                                >
                                    {payment_methods.length > 0 ? (
                                        payment_methods.map((pm) => (
                                            <option key={pm.id} value={pm.id}>
                                                {pm.name} {pm.account_number ? `(${pm.account_number} a.n. ${pm.account_holder})` : ''}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">Pilih Metode Pembayaran</option>
                                    )}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Nomor Referensi Transfer (Opsional)</label>
                                <input
                                    type="text"
                                    value={paymentFormData.reference_number}
                                    onChange={(e) => setPaymentFormData({ ...paymentFormData, reference_number: e.target.value })}
                                    placeholder="Contoh: REF-BCA-98124"
                                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#3B46F1] outline-hidden"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-bold text-slate-700">Catatan / Keterangan</label>
                                <input
                                    type="text"
                                    value={paymentFormData.notes}
                                    onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#3B46F1] outline-hidden"
                                />
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={paymentSubmitting}
                                    className="px-4 py-2 bg-[#3B46F1] text-white rounded-xl font-bold hover:bg-[#323BD8] cursor-pointer"
                                >
                                    {paymentSubmitting ? 'Menyimpan ke Finance...' : 'Simpan Pembayaran ke Finance'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
