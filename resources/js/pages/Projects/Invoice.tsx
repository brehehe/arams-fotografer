import React, { useState, useRef } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    ArrowLeft,
    Award,
    Calendar,
    Camera,
    CheckCircle2,
    ChevronDown,
    Clock,
    CreditCard,
    Download,
    Eye,
    ExternalLink,
    FileText,
    HeartHandshake,
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
    X,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { formatRupiah } from '@/lib/formatters';
import {
    BankBuildingIcon,
    CreditCardCustomIcon,
    CalendarReminderIcon,
    ClipboardShieldIcon,
    WhatsAppCustomIcon,
    EmailCustomIcon,
    RibbonAwardCustomIcon,
    RosetteApertureIcon,
    HeartOutlineCustomIcon,
    GlobeWireframeIcon,
} from '@/components/icons/InvoiceCustomIcons';

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
    const [zoomLevel, setZoomLevel] = useState<number>(100);
    const [sendDropdownOpen, setSendDropdownOpen] = useState(false);

    // Database Settings Fallbacks
    const studioLogo = company_settings?.logo || appSettings?.company_logo || '';
    const studioName = company_settings?.name || appSettings?.company_name || 'ARAMS PICTURES';
    const studioTagline = company_settings?.tagline || appSettings?.company_tagline || 'CAPTURING MOMENTS, CREATING MEMORIES';
    const studioPhone = company_settings?.phone || appSettings?.company_phone || '0813 9876 5432';
    const studioEmail = company_settings?.email || appSettings?.company_email || 'arams.pictures@gmail.com';
    const studioAddress = company_settings?.address || appSettings?.company_address || 'Jl. Studio Raya No. 10 Jakarta Selatan 12345, Indonesia';
    const studioInstagram = company_settings?.instagram || appSettings?.company_instagram || '@arams.pictures';
    const studioWebsite = company_settings?.website || appSettings?.company_website || 'www.arams-pictures.com';

    // Primary invoice data
    const inv = current_invoice || invoices[0] || {
        invoice_number: 'INV/0526/0002',
        issue_date: '2026-05-26',
        due_date: '2026-06-02',
        total: 7000000,
        subtotal: 7000000,
        status: 'unpaid',
    };

    const client = project.client || {
        name: 'Kevin Sanjaya & Jessica Mila',
        phone: '0813 9876 5432',
        email: 'kevin.sanjaya@gmail.com',
    };

    const supervisorName = project.supervisor?.name || 'Budi Santoso (Supervisor)';
    const photographerName = project.photographer?.name || 'Ivan Hardianto';
    const editorName = project.editor?.name || 'Dian Pratama';

    const defaultPaymentMethod = payment_methods[0] || {
        name: 'Bank Mandiri',
        account_number: '123-00-1234567-8',
        account_holder: 'PT Arams Pictures',
    };

    // Format dates
    const formatDateIndo = (dateStr?: string) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const issueDateFormatted = formatDateIndo(inv.issue_date);
    const dueDateFormatted = formatDateIndo(inv.due_date);
    const eventDateFormatted = formatDateIndo(project.event_date);

    // Print & Download PDF handler - Isolated to Invoice Paper only
    const handlePrint = () => {
        const printableElement = document.getElementById('invoice-printable-area');
        if (!printableElement) {
            window.print();
            return;
        }

        // Create an isolated hidden iframe
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

        // Collect all stylesheets from active document
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
                            margin: 6mm 8mm;
                        }
                        * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            box-sizing: border-box !important;
                        }
                        html, body {
                            background: #ffffff !important;
                            color: #1e293b !important;
                            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            width: 100% !important;
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
                        .break-inside-avoid, tr {
                            break-inside: avoid !important;
                            page-break-inside: avoid !important;
                        }
                    </style>
                </head>
                <body class="bg-white p-0 m-0">
                    <div id="invoice-printable-area" class="p-6 bg-white text-slate-800 font-sans text-xs">
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
            `Halo ${client.name},\n\nBerikut kami lampirkan tagihan uang muka (DP) untuk project *${project.name}* (${inv.invoice_number}) senilai *${formatRupiah(inv.total)}* dengan batas jatuh tempo pada *${dueDateFormatted}*.\n\nPembayaran dapat ditransfer ke:\n${defaultPaymentMethod.name}\nNo. Rek: ${defaultPaymentMethod.account_number}\na.n. ${defaultPaymentMethod.account_holder}\n\nTerima kasih atas kepercayaannya.\n*${studioName}*`
        );
        window.open(`https://wa.me/${phoneFormatted}?text=${msg}`, '_blank');
    };

    // Send Email handler
    const handleSendEmail = () => {
        const subject = encodeURIComponent(`Invoice DP ${inv.invoice_number} - ${project.name}`);
        const body = encodeURIComponent(
            `Yth. ${client.name},\n\nTerima kasih telah mempercayakan momen berharga Anda kepada ${studioName}.\n\nBerikut kami informasikan invoice uang muka (DP) untuk project:\n- Nama Project: ${project.name}\n- No. Invoice: ${inv.invoice_number}\n- Nominal DP: ${formatRupiah(inv.total)}\n- Jatuh Tempo: ${dueDateFormatted}\n\nPembayaran via Transfer:\nBank: ${defaultPaymentMethod.name}\nRekening: ${defaultPaymentMethod.account_number}\na.n. ${defaultPaymentMethod.account_holder}\n\nTerima kasih,\n${studioName}`
        );
        window.open(`mailto:${client.email || ''}?subject=${subject}&body=${body}`, '_blank');
    };

    return (
        <div className="space-y-6 pb-20 max-w-7xl mx-auto">
            <Head title={`Invoice ${inv.invoice_number} - ${project.name}`} />

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
                        padding: 16px 20px !important;
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
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                        Invoice (DP)
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Preview invoice uang muka (DP) yang akan dikirim ke klien.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Link
                        href={`/projects/${project.id}`}
                        className="inline-flex items-center justify-center px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                    >
                        Kembali
                    </Link>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setSendDropdownOpen(!sendDropdownOpen)}
                            className="btn-primary-action inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl text-xs font-bold shadow-sm shadow-black/10 transition-all cursor-pointer"
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
                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                                >
                                    <WhatsAppCustomIcon className="w-4 h-4 text-emerald-600" />
                                    <span>Kirim via WhatsApp</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSendDropdownOpen(false);
                                        handleSendEmail();
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                                >
                                    <EmailCustomIcon className="w-4 h-4 text-indigo-600" />
                                    <span>Kirim via Email</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── 2. MAIN 2-COLUMN GRID ─────────────────────────────────────────── */}
            <div className="grid grid-cols-12 gap-6 items-start">
                {/* ── LEFT COLUMN (70% - 8 COLS): INVOICE PREVIEW & HISTORY ───────── */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* Header & Viewer Toolbar */}
                    <div className="space-y-3">
                        <h2 className="text-xs font-bold text-slate-900 tracking-tight">
                            Preview Invoice
                        </h2>

                        {/* PDF / Document Toolbar */}
                        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between text-xs text-slate-600">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-semibold text-slate-500">1 / 1</span>
                                <span className="text-slate-300">|</span>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setZoomLevel((z) => Math.max(75, z - 10))}
                                        className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
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
                                        className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                                        title="Zoom in"
                                    >
                                        <ZoomIn className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setZoomLevel(100)}
                                    className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                                    title="Reset Zoom"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
                                >
                                    <Download className="w-3.5 h-3.5 text-slate-500" />
                                    <span className="hidden sm:inline">Download</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handlePrint}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
                                >
                                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                                    <span className="hidden sm:inline">Print</span>
                                </button>
                            </div>
                        </div>

                        {/* ── THE INVOICE PAPER SHEET (EXACT PIXEL-PERFECT REPLICA) ── */}
                        <div
                            id="invoice-printable-area"
                            style={{
                                transform: `scale(${zoomLevel / 100})`,
                                transformOrigin: 'top center',
                            }}
                            className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden transition-all duration-150 relative font-sans text-slate-800"
                        >
                            {/* Dual-Tone Top Right Curved Ribbon */}
                            <div className="absolute top-0 right-0 w-64 h-32 pointer-events-none z-0 overflow-hidden">
                                <svg viewBox="0 0 260 130" className="w-full h-full" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="topOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#F59E0B" />
                                            <stop offset="100%" stopColor="#EA580C" />
                                        </linearGradient>
                                        <linearGradient id="topPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#3B46F1" />
                                            <stop offset="60%" stopColor="#252EA7" />
                                            <stop offset="100%" stopColor="#1E1B4B" />
                                        </linearGradient>
                                    </defs>
                                    {/* Orange accent wave */}
                                    <path d="M0,0 Q130,70 260,20 L260,0 Z" fill="url(#topOrangeGrad)" />
                                    {/* Main purple wave */}
                                    <path d="M30,0 Q160,85 260,35 L260,0 Z" fill="url(#topPurpleGrad)" />
                                </svg>
                            </div>

                            <div className="p-8 sm:p-10 space-y-6 relative z-10">
                                {/* ── 1. HEADER SECTION: LOGO + CONTACT & INVOICE TITLE + METADATA ── */}
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                                    {/* Studio Logo & Info */}
                                    <div className="space-y-3">
                                        {/* Studio Logo (from Database Setting) & Info */}
                                        <div className="flex items-center gap-3.5">
                                            {studioLogo ? (
                                                <div className="h-16 w-16 shrink-0 flex items-center justify-center overflow-hidden rounded-xl bg-white border border-slate-100 p-1 shadow-2xs">
                                                    <img
                                                        src={studioLogo}
                                                        alt={studioName}
                                                        className="h-full w-full object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="relative flex items-center justify-center">
                                                    <svg className="w-16 h-16" viewBox="0 0 100 100">
                                                        <line x1="2" y1="50" x2="22" y2="50" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
                                                        <line x1="78" y1="50" x2="98" y2="50" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
                                                        <polygon points="50,12 80,30 80,70 50,88 20,70 20,30" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinejoin="round" />
                                                        <text x="50" y="58" fontFamily="Georgia, serif" fontSize="28" fontStyle="italic" fontWeight="bold" textAnchor="middle" fill="#0F172A">
                                                            ap
                                                        </text>
                                                    </svg>
                                                </div>
                                            )}
                                            <div>
                                                <h2 className="text-base font-black tracking-widest text-[#0F172A] font-serif uppercase">
                                                    {studioName}
                                                </h2>
                                                <p className="text-[8px] uppercase tracking-[0.25em] text-indigo-950 font-bold mt-0.5">
                                                    {studioTagline}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Contact Items */}
                                        <div className="text-[10px] text-slate-700 space-y-1.5 pt-1 font-medium">
                                            <div className="flex items-start gap-2">
                                                <span className="text-[#3B46F1] text-xs">📍</span>
                                                <span className="leading-tight">{studioAddress}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#3B46F1] text-xs">📞</span>
                                                <span>{studioPhone}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#3B46F1] text-xs">✉️</span>
                                                <span>{studioEmail}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#3B46F1] text-xs">📷</span>
                                                <span>{studioInstagram}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Invoice Title & Meta Box */}
                                    <div className="text-right space-y-2.5">
                                        <div className="pr-1">
                                            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-[#1D4ED8] font-sans">
                                                INVOICE
                                            </h1>
                                            <span className="text-xs font-bold text-[#1D4ED8] tracking-wider block mt-0.5 uppercase">
                                                DP (UANG MUKA)
                                            </span>
                                        </div>

                                        {/* Metadata Table Box */}
                                        <div className="p-3.5 px-4 bg-white border border-indigo-100 rounded-2xl text-[10px] space-y-2 text-left inline-block min-w-[220px] shadow-2xs">
                                            <div className="grid grid-cols-[80px_10px_1fr] items-center">
                                                <span className="text-indigo-950 font-bold">No. Invoice</span>
                                                <span className="text-indigo-950">:</span>
                                                <span className="font-bold text-[#1D4ED8] font-mono">{inv.invoice_number}</span>
                                            </div>
                                            <div className="grid grid-cols-[80px_10px_1fr] items-center">
                                                <span className="text-indigo-950 font-bold">Tanggal</span>
                                                <span className="text-indigo-950">:</span>
                                                <span className="font-medium text-slate-800">{issueDateFormatted}</span>
                                            </div>
                                            <div className="grid grid-cols-[80px_10px_1fr] items-center">
                                                <span className="text-indigo-950 font-bold">Jatuh Tempo</span>
                                                <span className="text-indigo-950">:</span>
                                                <span className="font-medium text-slate-800">{dueDateFormatted}</span>
                                            </div>
                                            <div className="grid grid-cols-[80px_10px_1fr] items-center">
                                                <span className="text-indigo-950 font-bold">Jenis Invoice</span>
                                                <span className="text-indigo-950">:</span>
                                                <span className="font-medium text-slate-800">DP (Uang Muka)</span>
                                            </div>
                                            <div className="grid grid-cols-[80px_10px_1fr] items-center">
                                                <span className="text-indigo-950 font-bold">Status</span>
                                                <span className="text-indigo-950">:</span>
                                                <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                    <span>Belum Dibayar</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── 2. MIDDLE TWO CARDS: KEPADA & RINGKASAN PROJECT WITH WATERMARKS ── */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                    {/* KEPADA CARD */}
                                    <div className="p-4 bg-white border border-indigo-100 rounded-2xl space-y-2 relative overflow-hidden min-h-[140px]">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black tracking-wider text-[#3730A3] uppercase block">
                                                KEPADA
                                            </span>
                                            <div className="w-6 h-0.5 bg-[#3730A3] rounded-full" />
                                        </div>

                                        <div className="space-y-1 pt-1 z-10 relative">
                                            <h3 className="text-xs font-bold text-slate-900">
                                                {client.name}
                                            </h3>
                                            <p className="text-[11px] text-slate-600 font-mono font-medium">
                                                {client.phone}
                                            </p>
                                            <p className="text-[11px] text-slate-600 font-mono font-medium">
                                                {client.email}
                                            </p>
                                        </div>

                                        {/* Botanical Leaf Watermark from Image in Bottom-Right */}
                                        <div className="absolute -right-2 -bottom-2 w-32 h-32 opacity-40 pointer-events-none select-none">
                                            <img
                                                src="/images/invoice-botanical-branch.png"
                                                alt="Botanical Leaf"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>

                                    {/* RINGKASAN PROJECT CARD */}
                                    <div className="p-4 bg-white border border-indigo-100 rounded-2xl space-y-1.5 text-[10px] relative overflow-hidden min-h-[140px]">
                                        <div className="space-y-1 mb-2">
                                            <span className="text-[10px] font-black tracking-wider text-[#3730A3] uppercase block">
                                                RINGKASAN PROJECT
                                            </span>
                                            <div className="w-6 h-0.5 bg-[#3730A3] rounded-full" />
                                        </div>

                                        <div className="space-y-1 z-10 relative">
                                            <div className="grid grid-cols-[90px_10px_1fr]">
                                                <span className="text-[#3730A3] font-bold">Nama Project</span>
                                                <span className="text-[#3730A3]">:</span>
                                                <span className="font-bold text-slate-900 truncate">{project.name}</span>
                                            </div>
                                            <div className="grid grid-cols-[90px_10px_1fr]">
                                                <span className="text-[#3730A3] font-bold">Kategori</span>
                                                <span className="text-[#3730A3]">:</span>
                                                <span className="font-medium text-slate-800">{project.category?.name || 'Prewedding / Event / Family / dll'}</span>
                                            </div>
                                            <div className="grid grid-cols-[90px_10px_1fr]">
                                                <span className="text-[#3730A3] font-bold">Workflow</span>
                                                <span className="text-[#3730A3]">:</span>
                                                <span className="font-medium text-slate-800">5 Tahap</span>
                                            </div>
                                            <div className="grid grid-cols-[90px_10px_1fr]">
                                                <span className="text-[#3730A3] font-bold">Hari H</span>
                                                <span className="text-[#3730A3]">:</span>
                                                <span className="font-medium text-slate-800">{eventDateFormatted}</span>
                                            </div>
                                            <div className="grid grid-cols-[90px_10px_1fr]">
                                                <span className="text-[#3730A3] font-bold">PIC Supervisor</span>
                                                <span className="text-[#3730A3]">:</span>
                                                <span className="font-medium text-slate-800">{supervisorName}</span>
                                            </div>
                                            <div className="grid grid-cols-[90px_10px_1fr]">
                                                <span className="text-[#3730A3] font-bold">Photographer</span>
                                                <span className="text-[#3730A3]">:</span>
                                                <span className="font-medium text-slate-800">{photographerName}</span>
                                            </div>
                                            <div className="grid grid-cols-[90px_10px_1fr]">
                                                <span className="text-[#3730A3] font-bold">Editor</span>
                                                <span className="text-[#3730A3]">:</span>
                                                <span className="font-medium text-slate-800">{editorName}</span>
                                            </div>
                                        </div>

                                        {/* Camera Watermark from Image in Bottom-Right */}
                                        <div className="absolute -right-2 -bottom-2 w-32 h-32 opacity-40 pointer-events-none select-none">
                                            <img
                                                src="/images/invoice-camera-botanical.png"
                                                alt="Camera Botanical"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* ── 3. DETAIL PROJECT TABLE ── */}
                                <div className="space-y-1.5 pt-1">
                                    <span className="text-[10px] font-black tracking-wider text-[#3730A3] uppercase block">
                                        DETAIL PROJECT
                                    </span>
                                    <div className="border border-indigo-100 rounded-xl overflow-hidden divide-y divide-indigo-50 text-xs">
                                        <div className="grid grid-cols-[180px_1fr] p-2.5 px-4 items-center bg-white">
                                            <div className="flex items-center gap-2 text-[#3B46F1] font-bold text-[11px]">
                                                <UserIcon className="w-3.5 h-3.5" />
                                                <span>PIC Supervisor</span>
                                            </div>
                                            <span className="font-medium text-slate-900 text-[11px] border-l border-indigo-50 pl-4">{supervisorName}</span>
                                        </div>
                                        <div className="grid grid-cols-[180px_1fr] p-2.5 px-4 items-center bg-white">
                                            <div className="flex items-center gap-2 text-[#3B46F1] font-bold text-[11px]">
                                                <Camera className="w-3.5 h-3.5" />
                                                <span>Photographer</span>
                                            </div>
                                            <span className="font-medium text-slate-900 text-[11px] border-l border-indigo-50 pl-4">{photographerName}</span>
                                        </div>
                                        <div className="grid grid-cols-[180px_1fr] p-2.5 px-4 items-center bg-white">
                                            <div className="flex items-center gap-2 text-[#3B46F1] font-bold text-[11px]">
                                                <FileText className="w-3.5 h-3.5" />
                                                <span>Editor</span>
                                            </div>
                                            <span className="font-medium text-slate-900 text-[11px] border-l border-indigo-50 pl-4">{editorName}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* ── 4. INVOICE ITEM TABLE & TOTAL BAR ── */}
                                <div className="rounded-xl overflow-hidden border border-indigo-950/20 shadow-2xs">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-[#0B0E38] text-white">
                                            <tr className="text-[10px] uppercase font-bold tracking-wider">
                                                <th className="py-3 px-5">DESKRIPSI</th>
                                                <th className="py-3 px-5 text-right">JUMLAH (Rp)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white">
                                            <tr>
                                                <td className="py-4 px-5 font-semibold text-slate-900">
                                                    DP - {project.name}
                                                </td>
                                                <td className="py-4 px-5 text-right font-bold text-slate-900 font-mono">
                                                    {formatRupiah(inv.total)}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    {/* Highlight Bar */}
                                    <div className="p-4 px-5 bg-[#EFF2FE] flex items-center justify-between border-t border-indigo-100">
                                        <span className="text-xs font-black tracking-wider text-[#1D4ED8] uppercase">
                                            TOTAL DIBAYAR (DP)
                                        </span>
                                        <span className="text-lg font-black text-[#1D4ED8] font-mono">
                                            {formatRupiah(inv.total)}
                                        </span>
                                    </div>
                                </div>

                                {/* ── 5. BOTTOM METHODS & NOTES SECTION ── */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 items-start">
                                    {/* Metode Pembayaran Column */}
                                    <div className="space-y-3">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-[#3730A3] block">
                                            METODE PEMBAYARAN
                                        </span>

                                        <div className="p-3.5 bg-white border border-indigo-100 rounded-2xl space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-indigo-50/80 text-[#3B46F1] flex items-center justify-center font-bold">
                                                    <BankBuildingIcon className="w-5 h-5 text-[#3B46F1]" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900">Transfer Bank</p>
                                                    <p className="text-[10px] text-slate-500 font-semibold">
                                                        {defaultPaymentMethod.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="pt-0.5 flex items-center gap-2 text-xs font-mono font-bold text-slate-900">
                                                <CreditCardCustomIcon className="w-4 h-4 text-[#3B46F1]" />
                                                <span>{defaultPaymentMethod.account_number}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 pl-6">
                                                a.n. {defaultPaymentMethod.account_holder}
                                            </p>
                                        </div>

                                        {/* Komponen Pengingat (Red Box) */}
                                        <div className="p-4 bg-[#FFF5F5] border border-[#FED7D7] rounded-2xl flex items-center gap-3.5 shadow-2xs">
                                            <div className="shrink-0">
                                                <CalendarReminderIcon className="w-8 h-8 text-[#EF4444]" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className="text-[9px] font-black uppercase tracking-wider text-[#E53E3E] block">
                                                    HARAP LAKUKAN PEMBAYARAN SEBELUM
                                                </span>
                                                <p className="text-base sm:text-lg font-black text-[#E53E3E] font-sans tracking-tight">
                                                    {dueDateFormatted}
                                                </p>
                                                <p className="text-[9px] text-slate-600 font-medium">
                                                    Agar booking tanggal tetap kami amankan.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Catatan Column */}
                                    <div className="space-y-3">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-[#3730A3] block">
                                            CATATAN
                                        </span>

                                        <ul className="text-[10px] text-slate-700 space-y-1.5 list-disc list-inside leading-relaxed font-medium">
                                            <li>DP (uang muka) digunakan sebagai konfirmasi booking tanggal.</li>
                                            <li>Sisa pembayaran akan diinformasikan sesuai progress project.</li>
                                        </ul>

                                        {/* Komponen Info Invoice (Dashed Blue/Purple Box) */}
                                        <div className="p-3.5 bg-[#F4F6FF] border border-dashed border-[#818CF8] rounded-2xl flex items-center gap-3 text-[#3B46F1]">
                                            <div className="shrink-0">
                                                <ClipboardShieldIcon className="w-7 h-7 text-[#4F46E5]" />
                                            </div>
                                            <p className="text-[9.5px] text-indigo-950/80 leading-relaxed font-medium">
                                                Invoice ini akan dikirim otomatis ke klien setelah Anda mengirimkan melalui WhatsApp atau Email.
                                            </p>
                                        </div>

                                        {/* Thank You Signature */}
                                        <div className="pt-2 text-center space-y-0.5">
                                            <p className="font-serif italic text-3xl font-normal text-[#1E40AF]">
                                                Thank You
                                            </p>
                                            <p className="text-[9.5px] text-slate-600 font-medium">
                                                Terima kasih atas kepercayaan Anda.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* ── 6. STUDIO FOOTER BRAND BAR ── */}
                                <div className="pt-4 border-t border-slate-200 space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-4 text-[9px] text-slate-600 font-medium">
                                        {/* Mini Logo from DB Setting */}
                                        <div className="flex items-center gap-2">
                                            {studioLogo ? (
                                                <img
                                                    src={studioLogo}
                                                    alt={studioName}
                                                    className="h-7 w-auto max-w-[80px] object-contain"
                                                />
                                            ) : (
                                                <svg className="w-8 h-8" viewBox="0 0 100 100">
                                                    <line x1="2" y1="50" x2="22" y2="50" stroke="#0F172A" strokeWidth="3" />
                                                    <line x1="78" y1="50" x2="98" y2="50" stroke="#0F172A" strokeWidth="3" />
                                                    <polygon points="50,12 80,30 80,70 50,88 20,70 20,30" fill="none" stroke="#0F172A" strokeWidth="3" />
                                                    <text x="50" y="58" fontFamily="Georgia, serif" fontSize="30" fontStyle="italic" fontWeight="bold" textAnchor="middle" fill="#0F172A">
                                                        ap
                                                    </text>
                                                </svg>
                                            )}
                                            <span className="font-black tracking-widest text-[#0F172A] uppercase">{studioName}</span>
                                        </div>

                                        <div className="flex items-center gap-6 text-[9px] text-slate-600 font-medium">
                                            <div className="flex items-center gap-2">
                                                <RibbonAwardCustomIcon className="w-5 h-5 text-[#3B46F1]" />
                                                <div className="leading-tight text-left">
                                                    <span className="font-bold text-slate-800 block">Profesional</span>
                                                    <span>&amp; Terpercaya</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <RosetteApertureIcon className="w-5 h-5 text-[#3B46F1]" />
                                                <div className="leading-tight text-left">
                                                    <span className="font-bold text-slate-800 block">Kualitas Terbaik</span>
                                                    <span>Untuk Setiap Momen</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <HeartOutlineCustomIcon className="w-5 h-5 text-[#3B46F1]" />
                                                <div className="leading-tight text-left">
                                                    <span className="font-bold text-slate-800 block">Layanan Sepenuh</span>
                                                    <span>Hati</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom URL Pill Badge */}
                                    <div className="text-center pt-1">
                                        <span className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-[#EEF2FF] text-[#3B46F1] font-black text-[9.5px] tracking-[0.18em] uppercase">
                                            <GlobeWireframeIcon className="w-3.5 h-3.5 text-[#3B46F1]" />
                                            <span>{studioWebsite}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Dual-Tone Bottom Right Curved Ribbon */}
                            <div className="absolute bottom-0 right-0 w-36 h-20 pointer-events-none z-0 overflow-hidden">
                                <svg viewBox="0 0 140 80" className="w-full h-full" preserveAspectRatio="none">
                                    {/* Orange accent wave */}
                                    <path d="M0,80 Q70,25 140,50 L140,80 Z" fill="url(#topOrangeGrad)" />
                                    {/* Main purple wave */}
                                    <path d="M15,80 Q80,15 140,40 L140,80 Z" fill="url(#topPurpleGrad)" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* ── RIWAYAT INVOICE TABLE ────────────────────────────────── */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                        <h3 className="font-bold text-slate-900 text-xs tracking-tight">
                            Riwayat Invoice
                        </h3>

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
                                            <td className="py-2.5 text-right font-bold text-slate-900">
                                                {formatRupiah(item.total)}
                                            </td>
                                            <td className="py-2.5 text-center">
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                    <span>Belum Dibayar</span>
                                                </span>
                                            </td>
                                            <td className="py-2.5 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => router.visit(`/projects/${project.id}/invoice?invoice_id=${item.id}`)}
                                                    className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
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

                        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                            <span>Menampilkan {invoices.length} dari {invoices.length} data</span>
                            <div className="flex items-center gap-1">
                                <button className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-xs text-slate-400 disabled:opacity-50">
                                    ‹
                                </button>
                                <span className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                                    1
                                </span>
                                <button className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-xs text-slate-400 disabled:opacity-50">
                                    ›
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN (30% - 4 COLS): SIDEBAR PANELS ────────────────── */}
                <div className="col-span-12 lg:col-span-4 space-y-4 lg:sticky lg:top-4">
                    {/* ── CARD 1: INFORMASI INVOICE ───────────────────────────────── */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                        <h3 className="font-bold text-slate-900 text-xs tracking-tight">
                            Informasi Invoice
                        </h3>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500">No. Invoice</span>
                                <span className="font-bold text-slate-900 font-mono">{inv.invoice_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Tanggal</span>
                                <span className="font-semibold text-slate-800">{issueDateFormatted}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Jatuh Tempo</span>
                                <span className="font-semibold text-slate-800">{dueDateFormatted}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Jenis Invoice</span>
                                <span className="font-semibold text-slate-800">DP (Uang Muka)</span>
                            </div>
                            <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                                <span className="text-slate-500">Status</span>
                                <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                    <span>Belum Dibayar</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── CARD 2: RINCIAN PEMBAYARAN ──────────────────────────────── */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                        <h3 className="font-bold text-slate-900 text-xs tracking-tight">
                            Rincian Pembayaran
                        </h3>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Nominal DP</span>
                                <span className="font-bold text-slate-900">{formatRupiah(inv.total)}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-100">
                                <span className="font-bold text-[#3B46F1]">Total Dibayar (DP)</span>
                                <span className="font-black text-sm text-[#3B46F1]">{formatRupiah(inv.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── CARD 3: METODE PEMBAYARAN ───────────────────────────────── */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                        <h3 className="font-bold text-slate-900 text-xs tracking-tight">
                            Metode Pembayaran
                        </h3>

                        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs space-y-1">
                            <p className="font-bold text-slate-900">Transfer Bank</p>
                            <p className="text-slate-600">{defaultPaymentMethod.name}</p>
                            <p className="font-mono font-bold text-slate-900">{defaultPaymentMethod.account_number}</p>
                            <p className="text-[10px] text-slate-400">a.n. {defaultPaymentMethod.account_holder}</p>
                        </div>
                    </div>

                    {/* ── CARD 4: TINDAKAN ────────────────────────────────────────── */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                        <h3 className="font-bold text-slate-900 text-xs tracking-tight">
                            Tindakan
                        </h3>

                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={handleSendWhatsApp}
                                className="w-full py-2.5 px-4 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl text-xs font-bold shadow-sm shadow-black/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Phone className="w-4 h-4" />
                                <span>Kirim ke Klien via WhatsApp</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleSendEmail}
                                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-[#3B46F1] border border-[#3B46F1]/40 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Mail className="w-4 h-4" />
                                <span>Kirim ke Klien via Email</span>
                            </button>

                            <button
                                type="button"
                                onClick={handlePrint}
                                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5 text-slate-500" />
                                <span>Download PDF</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => toast.info('Fitur pembatalan invoice dikonfirmasi.')}
                                className="w-full py-2 px-4 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Batalkan Invoice</span>
                            </button>
                        </div>

                        {/* Callout */}
                        <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-start gap-2 text-[#3B46F1]">
                            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-indigo-900/80 leading-relaxed font-medium">
                                <span className="font-bold">Informasi:</span> Invoice ini akan dikirim otomatis ke klien setelah Anda mengirimkan melalui WhatsApp atau Email.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
