import { Head, Link, router, usePage } from '@inertiajs/react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
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
    Heart,
    Mail,
    Phone,
    Printer,
    RefreshCw,
    Send,
    Building2,
    ZoomIn,
    ZoomOut,
    MapPin,
    Layers,
    Copy,
    Receipt,
    Edit3,
    Settings2,
    RotateCcw,
    X,
    Loader2,
    Maximize2,
    FileText,
    ShieldCheck,
    SplitSquareVertical,
} from 'lucide-react';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import RecordPaymentModal from '@/components/projects/RecordPaymentModal';
import { formatRupiah } from '@/lib/formatters';

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
    city?: string;
    instagram?: string;
    website?: string;
    director_name?: string;
    director_title?: string;
    signature_city?: string;
    signature_image?: string;
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
    const { appSettings, auth } = usePage().props as any;
    const user = auth?.user;
    const userRoles: string[] = user?.roles ?? [];
    const isSupervisor = Boolean(user?.is_supervisor || userRoles.includes('Supervisor'));

    // 2 Versi Desain Gambar 3 (Classic Wave Signature):
    // 'payment' = Versi Pembayaran / DP (Kwitansi & Tagihan)
    // 'full'    = Versi Full Informasi (Paket, Add-on, Biaya Layanan & Rekap Finansial)
    const [invoiceVersion, setInvoiceVersion] = useState<'payment' | 'full'>('payment');
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const invoiceSheetRef = useRef<HTMLDivElement>(null);

    const [zoomMode, setZoomMode] = useState<'fit' | '100' | 'manual'>('fit');
    const [manualScale, setManualScale] = useState<number>(1);
    const [containerWidth, setContainerWidth] = useState<number>(850);
    const [sheetHeight, setSheetHeight] = useState<number>(1123);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [sendDropdownOpen, setSendDropdownOpen] = useState(false);
    const [copiedAccount, setCopiedAccount] = useState(false);

    // Database Settings Fallbacks
    const studioLogo = company_settings?.logo || appSettings?.company_logo || '';
    const studioName = company_settings?.name || appSettings?.company_name || 'Arams Photography';
    const studioLegalName = company_settings?.legal_name || appSettings?.company_legal_name || 'Arams Pictures Studio';
    const studioTagline = company_settings?.tagline || appSettings?.company_tagline || 'Capturing Moments, Creating Timeless Memories';
    const studioPhone = company_settings?.phone || appSettings?.company_phone || '+62 812-3456-7890';
    const studioEmail = company_settings?.email || appSettings?.company_email || 'hello@arams.com';
    const studioAddress =
        company_settings?.address ||
        appSettings?.company_address ||
        'Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan 12190';
    const studioInstagram = (company_settings?.instagram || appSettings?.company_instagram || 'aramspictures').replace(/^@+/, '');
    const studioWebsite = company_settings?.website || appSettings?.company_website || 'https://www.arams.com';

    // Primary invoice data
    const inv = current_invoice || invoices[0] || {
        id: '',
        invoice_number: project?.project_number ? project.project_number.replace('PRJ', 'INV') : 'INV-001',
        issue_date: project?.created_at || '',
        due_date: project?.deadline || '',
        total: Number(project?.total_amount || 0),
        subtotal: Number(project?.total_amount || 0),
        paid_amount: 0,
        remaining_amount: Number(project?.total_amount || 0),
        status: 'unpaid',
        notes: '',
    };

    const currentInvoiceIndex = useMemo(() => {
        return invoices.findIndex((item) => String(item.id) === String(inv.id));
    }, [invoices, inv.id]);

    const invoiceTerminLabel = useMemo(() => {
        if (inv.notes) {
            const cleaned = inv.notes.replace(/\s+untuk\s+.*$/i, '').trim();

            if (cleaned) {
                return cleaned;
            }
        }

        if (currentInvoiceIndex >= 0) {
            if (invoices.length === 1) {
                return 'Invoice Tagihan (Penuh)';
            }

            if (currentInvoiceIndex === 0) {
                return 'Invoice 1 (DP)';
            }

            if (currentInvoiceIndex === invoices.length - 1) {
                return `Invoice ${currentInvoiceIndex + 1} (Pelunasan)`;
            }

            return `Invoice ${currentInvoiceIndex + 1} (Termin ${currentInvoiceIndex + 1})`;
        }

        return 'Invoice Tagihan';
    }, [inv.notes, currentInvoiceIndex, invoices.length]);

    const client = project?.client || {
        name: project?.name || 'Klien',
        phone: '-',
        email: '-',
        address: project?.location || '-',
    };

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

    const directorName = company_settings?.director_name || appSettings?.invoice_director_name || 'Aditya Pratama';
    const directorTitle = company_settings?.director_title || appSettings?.invoice_director_title || 'Direktur Utama / Finance Studio';
    const signatureCity = company_settings?.signature_city || appSettings?.invoice_signature_city || company_settings?.city || appSettings?.company_city || 'Jakarta';
    const directorSignature = company_settings?.signature_image || appSettings?.invoice_signature_image || appSettings?.company_signature || '';

    // ── KUSTOMISASI TEKS & CATATAN INVOICE ────────────────────────────────────
    const initialCustomTexts = {
        invoiceTitle: 'INVOICE',
        invoiceSubtitle: invoiceTerminLabel.toUpperCase(),
        tagline: studioTagline || 'Capturing Moments, Creating Timeless Memories',
        bankName: defaultPaymentMethod.name || 'Bank Mandiri',
        bankAccount: defaultPaymentMethod.account_number || '123-00-1234567-8',
        bankHolder: defaultPaymentMethod.account_holder || (studioLegalName ? `a.n. ${studioLegalName}` : 'a.n. PT Arams Kreatif Nusantara'),
        note1: 'DP (uang muka) digunakan sebagai konfirmasi booking tanggal.',
        note2: 'Sisa pembayaran akan diinformasikan sesuai progress project.',
        autoSendNote: 'Invoice ini akan dikirim otomatis ke klien setelah Anda mengirimkan melalui WhatsApp atau Email.',
        reminderTitle: 'HARAP LAKUKAN PEMBAYARAN SEBELUM',
        reminderSub: 'Agar booking tanggal tetap kami amankan.',
        signatureSalutation: 'Hormat Kami,',
        directorName: directorName,
        directorTitle: directorTitle,
        signatureCity: signatureCity,
        signatureImage: directorSignature,
        showSignature: true,
        badge1Title: 'Profesional',
        badge1Sub: '& Terpercaya',
        badge2Title: 'Kualitas Terbaik',
        badge2Sub: 'Untuk Setiap Momen',
        badge3Title: 'Layanan Sepenuh',
        badge3Sub: 'Hati',
        badge4Title: 'Layanan Cepat',
        badge4Sub: '& Responsif',
        footerWebsite: studioWebsite || 'https://www.arams.com',
        footerMotto: studioTagline || 'Capturing Moments, Creating Timeless Memories',
        hideEmptyTables: true,
    };

    const [customTexts, setCustomTexts] = useState(initialCustomTexts);
    const [pageLayoutMode, setPageLayoutMode] = useState<'single' | 'multi'>('single');
    const [isTextModalOpen, setIsTextModalOpen] = useState(false);
    const [prevTerminLabel, setPrevTerminLabel] = useState(invoiceTerminLabel);

    // Sync subtitle when invoice termin changes during render
    if (prevTerminLabel !== invoiceTerminLabel) {
        setPrevTerminLabel(invoiceTerminLabel);
        setCustomTexts((prev) => ({
            ...prev,
            invoiceSubtitle: invoiceTerminLabel.toUpperCase(),
        }));
    }

    // Format dates
    const formatDateIndo = (dateStr?: string) => {
        if (!dateStr) {
            return '-';
        }

        try {
            const d = new Date(dateStr);

            if (isNaN(d.getTime())) {
                return dateStr;
            }

            return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const issueDateFormatted = formatDateIndo(inv.issue_date || project?.created_at);
    const dueDateFormatted = formatDateIndo(inv.due_date || project?.deadline);
    const eventDateFormatted = formatDateIndo(project?.event_date);

    // ── DYNAMIC LINE ITEMS (PAKET, ADD-ONS, BIAYA OPERASIONAL DARI DATABASE) ───
    const allProjectAddons = useMemo(() => {
        const raw = project?.project_addons || project?.projectAddons;

        if (Array.isArray(raw)) {
            return raw;
        }

        return [];
    }, [project]);

    // Filter Add-ons (Ala Carte / Layanan Tambahan)
    const addonsList = useMemo<LineItem[]>(() => {
        const items = allProjectAddons.filter((item: any) => {
            const isOps = (item.addon?.type === 'operational') || (item.unit === 'ops') || (item.notes === 'operational');

            return !isOps;
        });

        return items.map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            name: item.custom_name || item.addon?.name || item.name || 'Layanan Tambahan',
            qty: Number(item.qty || item.quantity || 1),
            unit_price: Number(item.unit_price || item.price || item.addon?.price || 0),
            total: Number(item.total_price || item.total || (Number(item.unit_price || item.price || 0) * Number(item.qty || item.quantity || 1))),
            type: (item.addon?.type || 'photo').toLowerCase(),
        }));
    }, [allProjectAddons]);

    // Filter Biaya Layanan & Operasional
    const operationalCostsList = useMemo<LineItem[]>(() => {
        const directCosts = Array.isArray(project?.operational_costs) ? project.operational_costs : [];

        const opsFromAddons = allProjectAddons.filter((item: any) => {
            const isOps = (item.addon?.type === 'operational') || (item.unit === 'ops') || (item.notes === 'operational');

            return isOps;
        }).map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            name: item.custom_name || item.addon?.name || item.name || 'Biaya Operasional',
            qty: Number(item.qty || item.quantity || 1),
            unit_price: Number(item.unit_price || item.price || item.addon?.price || 0),
            total: Number(item.total_price || item.total || (Number(item.unit_price || item.price || 0) * Number(item.qty || item.quantity || 1))),
            type: (item.addon?.type || 'transport').toLowerCase(),
        }));

        if (directCosts.length > 0) {
            const directOps = directCosts.map((item: any, idx: number) => ({
                id: item.id || `direct-ops-${idx + 1}`,
                name: item.name || item.description || 'Biaya Operasional',
                qty: Number(item.quantity || 1),
                unit_price: Number(item.unit_price || item.amount || 0),
                total: Number(item.total || ((item.unit_price || item.amount || 0) * (item.quantity || 1))),
                type: (item.type || 'transport').toLowerCase(),
            }));

            return [...opsFromAddons, ...directOps];
        }

        return opsFromAddons;
    }, [allProjectAddons, project]);

    // Financial breakdown values strictly from database
    const packageTotal = Number(project?.price || project?.package?.base_price || 0);
    const additionalServicesTotal = addonsList.reduce((acc: number, item: LineItem) => acc + item.total, 0);
    const operationalCostTotal = operationalCostsList.reduce((acc: number, item: LineItem) => acc + item.total, 0);
    const grandTotal = Number(
        project?.total_amount || (packageTotal + additionalServicesTotal + operationalCostTotal)
    );
    const currentInvoiceAmount = Number(inv.total || 0);
    const remainingProjectAmount = Math.max(0, grandTotal - Number(project?.paid_amount || 0));

    const isInvoicePaid = inv.status === 'paid' || (Number(inv.paid_amount || 0) >= Number(inv.total || 0) && Number(inv.total || 0) > 0);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPaymentInvoice, setSelectedPaymentInvoice] = useState<any>(null);

    // Status Label & Styling for any invoice object
    const getInvoiceStatus = (invoiceObj: any = inv) => {
        const total = Number(invoiceObj?.total || 0);
        const paid = Number(invoiceObj?.paid_amount || 0);
        const isPaid = invoiceObj?.status === 'paid' || (total > 0 && paid >= total);
        const isPartial = !isPaid && paid > 0;

        if (isPaid) {
            return {
                label: 'LUNAS',
                badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
                dot: 'bg-emerald-500',
                text: 'text-emerald-700',
            };
        }

        if (isPartial) {
            return {
                label: 'DIBAYAR SEBAGIAN',
                badge: 'bg-sky-50 text-sky-700 border-sky-200/80',
                dot: 'bg-sky-500',
                text: 'text-sky-700',
            };
        }

        return {
            label: 'BELUM LUNAS',
            badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
            dot: 'bg-amber-500',
            text: 'text-amber-800',
        };
    };

    // Status helper for overall project
    const getProjectPaymentStatus = () => {
        const paid = Number(project?.paid_amount || 0);

        if (project?.payment_status === 'paid' || (grandTotal > 0 && paid >= grandTotal)) {
            return {
                label: 'LUNAS',
                badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
                dot: 'bg-emerald-500',
                text: 'text-emerald-700',
            };
        }

        if (paid > 0) {
            return {
                label: 'TERBAYAR SEBAGIAN',
                badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
                dot: 'bg-indigo-500',
                text: 'text-indigo-700',
            };
        }

        return {
            label: 'BELUM DIBAYAR',
            badge: 'bg-rose-50 text-rose-700 border-rose-200/80',
            dot: 'bg-rose-500',
            text: 'text-rose-700',
        };
    };

    const statusBadge = getInvoiceStatus(inv);
    const projectStatusBadge = getProjectPaymentStatus();

    // Standard A4 dimensions at 96 DPI: 210mm = 794px, 297mm = 1123px
    const A4_WIDTH = 794;
    const A4_MIN_HEIGHT = 1123;

    // Track container dimensions to calculate optimal auto-fit scale
    useEffect(() => {
        const updateDimensions = () => {
            if (canvasContainerRef.current) {
                const rect = canvasContainerRef.current.getBoundingClientRect();
                setContainerWidth(rect.width);
            }

            if (invoiceSheetRef.current) {
                setSheetHeight(invoiceSheetRef.current.offsetHeight);
            }
        };

        updateDimensions();

        const observer = new ResizeObserver(() => {
            updateDimensions();
        });

        if (canvasContainerRef.current) {
            observer.observe(canvasContainerRef.current);
        }

        if (invoiceSheetRef.current) {
            observer.observe(invoiceSheetRef.current);
        }

        window.addEventListener('resize', updateDimensions);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateDimensions);
        };
    }, [invoiceVersion, pageLayoutMode, customTexts.hideEmptyTables]);

    // Calculate auto-fit scale based on available container width
    const autoFitScale = useMemo(() => {
        // Container has horizontal padding (approx 24px-32px total)
        const availableWidth = Math.max(280, containerWidth - 32);
        const scale = availableWidth / A4_WIDTH;

        return Math.min(1.0, Math.max(0.32, Number(scale.toFixed(3))));
    }, [containerWidth]);

    // Effective scale applied to CSS transform
    const effectiveScale = useMemo(() => {
        if (zoomMode === 'fit') {
            return autoFitScale;
        }

        if (zoomMode === '100') {
            return 1.0;
        }

        return manualScale;
    }, [zoomMode, autoFitScale, manualScale]);

    const displayPercentage = Math.round(effectiveScale * 100);

    const handleZoomIn = () => {
        setZoomMode('manual');
        setManualScale(Math.min(1.5, Math.round((effectiveScale + 0.1) * 10) / 10));
    };

    const handleZoomOut = () => {
        setZoomMode('manual');
        setManualScale(Math.max(0.35, Math.round((effectiveScale - 0.1) * 10) / 10));
    };

    const handleResetZoom = () => {
        setZoomMode('fit');
    };

    // Direct PDF file generation and download without opening Windows print dialog
    const handleDownloadDirectPdf = async () => {
        setIsDownloadingPdf(true);
        const toastId = toast.loading('Menyiapkan file PDF invoice...');

        try {
            const cleanInvoiceNo = (inv.invoice_number || 'INV-001').replace(/[^a-zA-Z0-9-_]/g, '_');
            const cleanProjectName = (project?.name || 'Project').replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 30);
            const fileName = `Invoice_${cleanInvoiceNo}_${cleanProjectName}.pdf`;

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
            const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

            // Helper to capture a DOM sheet element with sharp 2x quality and inlined images
            const captureSheet = async (el: HTMLElement) => {
                const originalImages = el.querySelectorAll('img');
                const restoreImages: Array<{ img: HTMLImageElement; originalSrc: string }> = [];

                await Promise.all(
                    Array.from(originalImages).map(async (img) => {
                        const src = img.getAttribute('src');

                        if (src && !src.startsWith('data:')) {
                            try {
                                const res = await fetch(src, { mode: 'cors' });
                                const blob = await res.blob();
                                const reader = new FileReader();
                                const dataUrl = await new Promise<string>((resolve) => {
                                    reader.onloadend = () => resolve(reader.result as string);
                                    reader.readAsDataURL(blob);
                                });
                                restoreImages.push({ img, originalSrc: src });
                                img.src = dataUrl;
                            } catch {
                                // If conversion fails, keep original src
                            }
                        }
                    })
                );

                if ((document as any).fonts && (document as any).fonts.ready) {
                    await (document as any).fonts.ready;
                }

                await new Promise((resolve) => setTimeout(resolve, 80));

                const canvas = await html2canvas(el, {
                    scale: 3.5,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: '#ffffff',
                    logging: false,
                    imageTimeout: 0,
                    windowWidth: A4_WIDTH,
                    onclone: (_clonedDoc, clonedEl) => {
                        clonedEl.style.transform = 'none';
                        clonedEl.style.transformOrigin = 'top left';
                        clonedEl.style.boxShadow = 'none';
                        clonedEl.style.border = 'none';
                        clonedEl.style.borderRadius = '0';
                        clonedEl.style.margin = '0';
                        clonedEl.style.width = `${A4_WIDTH}px`;
                        clonedEl.style.minWidth = `${A4_WIDTH}px`;
                        clonedEl.style.maxWidth = `${A4_WIDTH}px`;
                        (clonedEl.style as any).webkitFontSmoothing = 'antialiased';
                        (clonedEl.style as any).mozOsxFontSmoothing = 'grayscale';
                        clonedEl.style.textRendering = 'optimizeLegibility';
                    },
                });

                restoreImages.forEach(({ img, originalSrc }) => {
                    img.src = originalSrc;
                });

                return canvas;
            };

            if (pageLayoutMode === 'multi') {
                const page1El = document.getElementById('invoice-page-1');
                const page2El = document.getElementById('invoice-page-2');

                if (!page1El || !page2El) {
                    throw new Error('Halaman invoice multi-page tidak ditemukan');
                }

                // Render Page 1 with lossless PNG for razor-sharp vector-grade clarity
                const canvas1 = await captureSheet(page1El);
                const imgData1 = canvas1.toDataURL('image/png');
                pdf.addImage(imgData1, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'SLOW');

                // Render Page 2
                pdf.addPage();
                const canvas2 = await captureSheet(page2El);
                const imgData2 = canvas2.toDataURL('image/png');
                pdf.addImage(imgData2, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'SLOW');
            } else {
                const singleEl = document.getElementById('invoice-printable-area');

                if (!singleEl) {
                    throw new Error('Elemen invoice tidak ditemukan');
                }

                const canvas = await captureSheet(singleEl);
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const totalHeightMm = (imgHeight * pdfWidth) / imgWidth;

                // Scale to fit on EXACTLY 1 A4 PAGE
                if (totalHeightMm <= 340) {
                    const scaledWidth = (imgWidth * pdfHeight) / imgHeight;
                    const xOffset = Math.max(0, (pdfWidth - scaledWidth) / 2);

                    pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, pdfHeight, undefined, 'SLOW');
                } else {
                    let heightLeft = totalHeightMm;
                    let position = 0;

                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalHeightMm, undefined, 'SLOW');
                    heightLeft -= pdfHeight;

                    while (heightLeft > 5) {
                        position -= pdfHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalHeightMm, undefined, 'SLOW');
                        heightLeft -= pdfHeight;
                    }
                }
            }

            pdf.save(fileName);
            toast.success('Invoice PDF berhasil diunduh!', { id: toastId });
        } catch (err: any) {
            console.error('Error generating direct PDF with html2canvas-pro:', err);
            toast.error('Gagal membuat PDF otomatis. Mengalihkan ke jendela cetak (Pilih "Simpan sebagai PDF")...', { id: toastId, duration: 4500 });
            setTimeout(() => {
                handlePrint();
            }, 600);
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    // Print & Native Print handler - Isolated to Invoice Paper only
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
                    <title>Invoice_${invoiceNo.replace(/[/\\]/g, '_')}</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    ${styles}
                    <style>
                        @page {
                            size: A4 portrait;
                            margin: 0;
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
                        .invoice-page-card {
                            page-break-inside: avoid !important;
                            break-inside: avoid !important;
                            width: 210mm !important;
                            min-height: 297mm !important;
                            max-height: 297mm !important;
                            height: 297mm !important;
                            position: relative !important;
                            overflow: hidden !important;
                            box-sizing: border-box !important;
                            box-shadow: none !important;
                            border: none !important;
                            border-radius: 0 !important;
                            margin: 0 !important;
                        }
                        .invoice-page-break {
                            page-break-before: always !important;
                            break-before: page !important;
                            height: 0 !important;
                            margin: 0 !important;
                        }
                        .no-print {
                            display: none !important;
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
        const isPayment = invoiceVersion === 'payment';
        const msg = encodeURIComponent(
            isPayment
                ? `Halo ${client.name},\n\nBerikut kami lampirkan tagihan *${invoiceTerminLabel}* untuk project *${project?.name || ''}* (${inv.invoice_number}) senilai *${formatRupiah(currentInvoiceAmount)}* dengan batas jatuh tempo pada *${dueDateFormatted}*.\n\nPembayaran dapat ditransfer ke:\n${defaultPaymentMethod.name}\nNo. Rek: ${defaultPaymentMethod.account_number}\na.n. ${defaultPaymentMethod.account_holder}\n\nTerima kasih atas kepercayaannya.\n*${studioName}*`
                : `Halo ${client.name},\n\nBerikut kami lampirkan rincian invoice lengkap project *${project?.name || ''}* (${inv.invoice_number}):\n- Paket: ${project?.package?.name || project?.name || 'Paket Utama'} (${formatRupiah(packageTotal)})\n- Add-ons: ${formatRupiah(additionalServicesTotal)}\n- Biaya Layanan: ${formatRupiah(operationalCostTotal)}\n- *Grand Total Project: ${formatRupiah(grandTotal)}*\n- Terbayar: ${formatRupiah(project?.paid_amount || 0)}\n- Sisa Tagihan: ${formatRupiah(remainingProjectAmount)}\n\nRekening Pembayaran:\n${defaultPaymentMethod.name} ${defaultPaymentMethod.account_number} a.n. ${defaultPaymentMethod.account_holder}\n\nTerima kasih,\n*${studioName}*`
        );
        window.open(`https://wa.me/${phoneFormatted}?text=${msg}`, '_blank');
    };

    // Send Email handler
    const handleSendEmail = () => {
        const isPayment = invoiceVersion === 'payment';
        const subject = encodeURIComponent(`Invoice ${isPayment ? invoiceTerminLabel : 'Rincian Layanan'} ${inv.invoice_number} - ${project?.name || ''}`);
        const body = encodeURIComponent(
            isPayment
                ? `Yth. ${client.name},\n\nTerima kasih telah mempercayakan momen berharga Anda kepada ${studioName}.\n\nBerikut kami informasikan invoice *${invoiceTerminLabel}* untuk project:\n- Nama Project: ${project?.name || ''}\n- No. Invoice: ${inv.invoice_number}\n- Nominal Tagihan: ${formatRupiah(currentInvoiceAmount)}\n- Jatuh Tempo: ${dueDateFormatted}\n\nPembayaran via Transfer:\nBank: ${defaultPaymentMethod.name}\nRekening: ${defaultPaymentMethod.account_number}\na.n. ${defaultPaymentMethod.account_holder}\n\nTerima kasih,\n${studioName}`
                : `Yth. ${client.name},\n\nTerima kasih telah mempercayakan momen berharga Anda kepada ${studioName}.\n\nBerikut rincian lengkap invoice untuk project:\n- Nama Project: ${project?.name || ''}\n- No. Invoice: ${inv.invoice_number}\n- Paket Utama: ${project?.package?.name || project?.name || 'Paket'} (${formatRupiah(packageTotal)})\n- Total Add-ons: ${formatRupiah(additionalServicesTotal)}\n- Biaya Layanan & Operasional: ${formatRupiah(operationalCostTotal)}\n- Grand Total Project: ${formatRupiah(grandTotal)}\n- Terbayar: ${formatRupiah(project?.paid_amount || 0)}\n- Sisa Tagihan: ${formatRupiah(remainingProjectAmount)}\n\nPembayaran via Transfer:\nBank: ${defaultPaymentMethod.name}\nRekening: ${defaultPaymentMethod.account_number}\na.n. ${defaultPaymentMethod.account_holder}\n\nTerima kasih,\n${studioName}`
        );
        window.open(`mailto:${client.email || ''}?subject=${subject}&body=${body}`, '_blank');
    };

    if (isSupervisor) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <Head title="Akses Dibatasi - Invoice" />
                <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-xl text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                        <Receipt className="w-6 h-6" />
                    </div>
                    <h2 className="text-base font-bold text-slate-900">Akses Invoice Dibatasi</h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Role Supervisor tidak memiliki wewenang untuk menambah, mengubah, atau melihat invoice project ini.
                    </p>
                    <Link
                        href={`/projects/${project?.id}`}
                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#3C0E0E] hover:bg-[#2A0909] text-white rounded-xl text-xs font-bold transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Detail Project</span>
                    </Link>
                </div>
            </div>
        );
    }

    // ── SUB-RENDER: WAVE CURVES DECORATION ──────────────────────────────────
    const renderWaveCurves = () => (
        <>
            <div className="absolute top-0 left-0 w-56 sm:w-64 h-32 sm:h-40 pointer-events-none z-0 overflow-hidden">
                <svg viewBox="0 0 280 150" className="w-full h-full" preserveAspectRatio="none">
                    <path d="M0,0 L210,0 Q140,95 0,125 Z" fill="#EDE9FE" opacity="0.7" />
                    <path d="M0,0 L160,0 Q100,80 0,95 Z" fill="#DDD6FE" opacity="0.8" />
                    <path d="M0,0 L110,0 Q60,60 0,70 Z" fill="#8B5CF6" opacity="0.4" />
                </svg>
            </div>
            <div className="absolute top-0 right-0 w-36 h-24 pointer-events-none z-0 overflow-hidden opacity-40">
                <svg viewBox="0 0 160 100" className="w-full h-full" preserveAspectRatio="none">
                    <path d="M160,0 L60,0 Q110,50 160,80 Z" fill="#DDD6FE" />
                </svg>
            </div>
        </>
    );

    // ── SUB-RENDER: STUDIO BRANDING & CONTACT ────────────────────────────────
    const renderStudioBranding = () => (
        <div className="space-y-2.5 max-w-[340px]">
            <div className="flex items-center">
                <div className="flex flex-col items-start text-left">
                    {studioLogo ? (
                        <div className="flex flex-col items-start text-left">
                            <img src={studioLogo} alt={studioName} className="h-12 w-auto max-w-[150px] object-contain" />
                            <h2 className="text-sm font-black tracking-wider text-[#1E1B4B] uppercase font-sans mt-1">
                                {studioName}
                            </h2>
                            <p className="text-[8px] uppercase tracking-wider text-[#4338CA] font-bold mt-0.5 leading-normal max-w-[260px]">
                                {customTexts.tagline}
                            </p>
                        </div>
                    ) : (
                        <>
                            <svg className="w-20 h-11" viewBox="0 0 160 80">
                                <line x1="12" y1="40" x2="42" y2="40" stroke="#1E1B4B" strokeWidth="1.8" strokeLinecap="round" />
                                <line x1="118" y1="40" x2="148" y2="40" stroke="#1E1B4B" strokeWidth="1.8" strokeLinecap="round" />
                                <polygon points="80,8 114,28 114,68 80,88 46,68 46,28" fill="none" stroke="#1E1B4B" strokeWidth="1.8" strokeLinejoin="round" />
                                <text x="80" y="56" fontFamily="'Playfair Display', 'Brush Script MT', 'Great Vibes', Georgia, serif" fontSize="34" fontStyle="italic" fontWeight="normal" textAnchor="middle" fill="#1E1B4B">
                                    ap
                                </text>
                            </svg>
                            <h2 className="text-sm font-black tracking-wider text-[#1E1B4B] uppercase font-sans mt-0.5">
                                {studioName}
                            </h2>
                            <p className="text-[8px] uppercase tracking-wider text-[#4338CA] font-bold mt-0.5 leading-normal max-w-[260px]">
                                {customTexts.tagline}
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Contact Items with Matching Purple Icons */}
            <div className="text-[11px] text-slate-700 space-y-1 pt-0.5">
                <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#F3F0FF] text-[#5B21B6] flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-3 h-3" />
                    </div>
                    <span className="font-medium text-slate-800 leading-snug">{studioAddress}</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#F3F0FF] text-[#5B21B6] flex items-center justify-center shrink-0">
                        <Phone className="w-3 h-3" />
                    </div>
                    <span className="font-medium text-slate-800 whitespace-nowrap">{studioPhone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#F3F0FF] text-[#5B21B6] flex items-center justify-center shrink-0">
                        <Mail className="w-3 h-3" />
                    </div>
                    <span className="font-medium text-slate-800">{studioEmail}</span>
                </div>
                {studioInstagram && (
                    <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-[#F3F0FF] text-[#5B21B6] flex items-center justify-center shrink-0">
                            <Camera className="w-3 h-3" />
                        </div>
                        <span className="font-medium text-slate-800">{studioInstagram}</span>
                    </div>
                )}
            </div>
        </div>
    );

    // ── SUB-RENDER: INVOICE META & TABLE ─────────────────────────────────────
    const renderInvoiceMeta = (pageBadge?: string) => (
        <div className="text-right space-y-2.5 shrink-0 ml-auto">
            <div>
                <div className="flex items-center justify-end gap-2">
                    <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-[#1E1B4B]">
                        {customTexts.invoiceTitle}
                    </h1>
                    {pageBadge && (
                        <span className="px-2.5 py-0.5 bg-[#EDE9FE] text-[#5B21B6] text-[9.5px] font-black rounded-md uppercase tracking-wider border border-[#DDD6FE]">
                            {pageBadge}
                        </span>
                    )}
                </div>
                <span className="text-xs font-bold text-slate-800 tracking-[0.2em] block mt-1 uppercase text-right">
                    {invoiceVersion === 'payment'
                        ? (customTexts.invoiceSubtitle || invoiceTerminLabel.toUpperCase())
                        : 'RINCIAN PAKET & LAYANAN LENGKAP'}
                </span>
                <div className="w-14 h-1 bg-amber-500 rounded-full mt-2 ml-auto"></div>
            </div>

            <div className="bg-white/90 backdrop-blur-xs p-3 rounded-2xl border border-[#E0D7FE] shadow-2xs inline-block text-left min-w-[240px]">
                <table className="w-full text-xs">
                    <tbody className="space-y-1">
                        <tr>
                            <td className="text-slate-500 font-medium py-0.5 pr-2">No. Invoice</td>
                            <td className="text-slate-400 font-bold px-1">:</td>
                            <td className="font-bold text-[#5B21B6] font-mono py-0.5 pl-2">
                                {inv.invoice_number || 'INV-001'}
                            </td>
                        </tr>
                        <tr>
                            <td className="text-slate-500 font-medium py-0.5 pr-2">Tanggal</td>
                            <td className="text-slate-400 font-bold px-1">:</td>
                            <td className="text-slate-800 font-semibold py-0.5 pl-2">{issueDateFormatted}</td>
                        </tr>
                        <tr>
                            <td className="text-slate-500 font-medium py-0.5 pr-2">Jatuh Tempo</td>
                            <td className="text-slate-400 font-bold px-1">:</td>
                            <td className="text-slate-800 font-semibold py-0.5 pl-2">{dueDateFormatted}</td>
                        </tr>
                        <tr>
                            <td className="text-slate-500 font-medium py-0.5 pr-2">Jenis Invoice</td>
                            <td className="text-slate-400 font-bold px-1">:</td>
                            <td className="text-slate-800 font-semibold py-0.5 pl-2">
                                {invoiceVersion === 'payment'
                                    ? invoiceTerminLabel
                                    : 'Rincian Layanan & Biaya'}
                            </td>
                        </tr>
                        <tr>
                            <td className="text-slate-500 font-medium py-0.5 pr-2">Status</td>
                            <td className="text-slate-400 font-bold px-1">:</td>
                            <td className="py-0.5 pl-2">
                                <span className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase ${isInvoicePaid ? 'text-emerald-700' : 'text-amber-800'}`}>
                                    <span className={`w-2 h-2 rounded-full ${isInvoicePaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    {isInvoicePaid ? 'LUNAS' : 'BELUM LUNAS'}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );

    // ── SUB-RENDER: KEPADA & RINGKASAN PROJECT ───────────────────────────────
    const renderClientAndProject = () => (
        <div className="grid grid-cols-2 gap-4">
            {/* Card 1: KEPADA */}
            <div className="relative overflow-hidden p-5 rounded-2xl border border-[#E0D7FE] bg-white shadow-2xs space-y-2">
                <div className="relative z-10 space-y-1.5">
                    <span className="text-xs font-black tracking-wider text-[#5B21B6] uppercase block">
                        KEPADA
                    </span>
                    <div className="w-10 h-0.5 bg-[#5B21B6] rounded-full mb-2"></div>
                    <h3 className="text-sm font-bold text-slate-900 pt-1">
                        {client.name || '-'}
                    </h3>
                    {client.phone && client.phone !== '-' && (
                        <p className="text-xs text-slate-700 font-mono">
                            {client.phone}
                        </p>
                    )}
                    {client.email && client.email !== '-' && (
                        <p className="text-xs text-slate-600">
                            {client.email}
                        </p>
                    )}
                    {client.address && client.address !== '-' && (
                        <p className="text-xs text-slate-500 line-clamp-2">
                            {client.address}
                        </p>
                    )}
                </div>
            </div>

            {/* Card 2: RINGKASAN PROJECT */}
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
                                {project?.name || '-'}
                            </span>
                        </div>
                        <div className="grid grid-cols-[105px_10px_1fr]">
                            <span className="text-slate-600 font-medium">Kategori</span>
                            <span className="text-slate-400">:</span>
                            <span className="text-slate-800">
                                {project?.category?.name || '-'}
                            </span>
                        </div>
                        <div className="grid grid-cols-[105px_10px_1fr]">
                            <span className="text-slate-600 font-medium">Hari H</span>
                            <span className="text-slate-400">:</span>
                            <span className="font-semibold text-slate-800">{eventDateFormatted}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // ── SUB-RENDER: BREAKDOWN TABLES ─────────────────────────────────────────
    const renderBreakdownTables = (isSinglePage = false) => {
        if (invoiceVersion === 'payment') {
            return (
                <div className="rounded-2xl overflow-hidden border border-[#E0D7FE] shadow-2xs">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-[#0B0E38] text-white">
                            <tr className="text-[10px] uppercase font-bold tracking-wider">
                                <th className="py-3 px-5 text-left">DESKRIPSI PEMBAYARAN</th>
                                <th className="py-3 px-4 text-center">STATUS</th>
                                <th className="py-3 px-5 text-right">JUMLAH (Rp)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            <tr className="border-b border-slate-100">
                                <td className="py-4 px-5 align-middle">
                                    <strong className="text-slate-900 font-bold text-xs block">
                                        {invoiceTerminLabel} - {project?.name || 'Project Photography'}
                                    </strong>
                                    <span className="text-[11px] text-slate-500 block mt-0.5">
                                        {inv.notes || `Pembayaran termin invoice untuk project ${project?.name || ''}`}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-center align-middle">
                                    <span className={`inline-flex items-center gap-1.5 font-bold text-[10px] px-2.5 py-1 rounded-full border ${isInvoicePaid
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-amber-50 text-amber-800 border-amber-200'
                                        }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${isInvoicePaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                        <span>{isInvoicePaid ? 'LUNAS' : 'MENUNGGU PEMBAYARAN'}</span>
                                    </span>
                                </td>
                                <td className="py-3 px-5 text-right font-bold text-slate-900 font-mono text-sm align-middle">
                                    {formatRupiah(currentInvoiceAmount)}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="p-3.5 px-5 bg-[#F5F3FF] flex items-center justify-between border-t border-[#E0D7FE]">
                        <div className="space-y-0.5">
                            <p className="text-xs font-black tracking-wider text-[#5B21B6] uppercase leading-tight">
                                TOTAL TAGIHAN ({invoiceTerminLabel.toUpperCase()})
                            </p>
                            <p className="text-[10.5px] text-slate-500 font-medium">
                                Total Nilai Project: {formatRupiah(grandTotal)}
                            </p>
                        </div>
                        <div className="text-right space-y-0.5">
                            <p className="text-xl font-black text-[#5B21B6] font-mono leading-tight">
                                {formatRupiah(currentInvoiceAmount)}
                            </p>
                            <p className="text-[10.5px] text-slate-600 font-medium">
                                Sisa Tagihan Project: <strong className="text-amber-800">{formatRupiah(remainingProjectAmount)}</strong>
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        // Full Breakdown Tables (Versi 2)
        const hideAddonsTable = isSinglePage && customTexts.hideEmptyTables && addonsList.length === 0;
        const hideOpsTable = isSinglePage && customTexts.hideEmptyTables && operationalCostsList.length === 0;

        return (
            <div className="space-y-3.5">
                {/* Table 1: DETAIL PAKET UTAMA */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black tracking-wider text-[#5B21B6] uppercase">
                            1. DETAIL PAKET UTAMA
                        </span>
                        <span className="text-[10.5px] font-semibold text-slate-500">
                            Kategori: {project?.category?.name || 'General'}
                        </span>
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-[#E0D7FE] shadow-2xs">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#0B0E38] text-white">
                                <tr className="text-[10px] uppercase font-bold tracking-wider">
                                    <th className="py-2.5 px-4 text-left">DESKRIPSI PAKET</th>
                                    <th className="py-2.5 px-3 text-center w-16">QTY</th>
                                    <th className="py-2.5 px-4 text-right">HARGA (Rp)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                <tr>
                                    <td className="p-3 align-middle">
                                        <strong className="text-slate-900 font-bold block text-xs">
                                            {project?.package?.name || project?.name || 'Paket Photography'}
                                        </strong>
                                        <span className="text-[11px] text-slate-500 block mt-0.5 leading-relaxed">
                                            {project?.package?.description ||
                                                'Dokumentasi profesional, full retouch foto, video teaser, dan penyerahan master file.'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center font-mono font-semibold text-slate-700 align-middle">
                                        1 Paket
                                    </td>
                                    <td className="p-3 text-right font-bold text-slate-900 font-mono text-xs align-middle">
                                        {formatRupiah(packageTotal)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Table 2: LAYANAN TAMBAHAN (ADD-ONS) */}
                {hideAddonsTable ? (
                    <div className="p-2.5 px-4 bg-white border border-[#E0D7FE] rounded-2xl flex items-center justify-between text-xs shadow-2xs">
                        <span className="text-xs font-black tracking-wider text-[#5B21B6] uppercase">
                            2. LAYANAN TAMBAHAN (ADD-ONS / ALA CARTE)
                        </span>
                        <span className="text-[11px] text-slate-400 italic font-medium">
                            Tidak ada add-on tambahan pada project ini (0 Item)
                        </span>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black tracking-wider text-[#5B21B6] uppercase">
                                2. LAYANAN TAMBAHAN (ADD-ONS / ALA CARTE)
                            </span>
                            <span className="text-[10.5px] font-bold text-indigo-700">
                                {addonsList.length} Item Tambahan
                            </span>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-[#E0D7FE] shadow-2xs">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#0B0E38] text-white">
                                    <tr className="text-[10px] uppercase font-bold tracking-wider">
                                        <th className="py-2 px-4 text-left">DESKRIPSI LAYANAN</th>
                                        <th className="py-2 px-3 text-center w-16">QTY</th>
                                        <th className="py-2 px-4 text-right">HARGA SATUAN</th>
                                        <th className="py-2 px-4 text-right">TOTAL (Rp)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100 text-[11px]">
                                    {addonsList.length > 0 ? (
                                        addonsList.map((item) => (
                                            <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                                                <td className="py-2 px-4 font-semibold text-slate-800 align-middle">
                                                    {item.name}
                                                </td>
                                                <td className="py-2 px-3 text-center font-mono text-slate-600 align-middle">
                                                    {item.qty}
                                                </td>
                                                <td className="py-2 px-4 text-right text-slate-600 font-mono align-middle">
                                                    {formatRupiah(item.unit_price)}
                                                </td>
                                                <td className="py-2 px-4 text-right font-bold text-slate-900 font-mono align-middle">
                                                    {formatRupiah(item.total)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-2.5 px-4 text-center text-slate-400 italic">
                                                Tidak ada add-on tambahan pada project ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {addonsList.length > 0 && (
                                    <tfoot className="bg-[#F8F7FF] border-t border-[#E0D7FE]">
                                        <tr>
                                            <td colSpan={3} className="py-1.5 px-4 font-bold text-slate-700 text-right text-[11px]">
                                                Subtotal Add-ons:
                                            </td>
                                            <td className="py-1.5 px-4 font-bold text-[#5B21B6] font-mono text-right text-xs">
                                                {formatRupiah(additionalServicesTotal)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                )}

                {/* Table 3: BIAYA LAYANAN & OPERASIONAL */}
                {hideOpsTable ? (
                    <div className="p-2.5 px-4 bg-white border border-[#E0D7FE] rounded-2xl flex items-center justify-between text-xs shadow-2xs">
                        <span className="text-xs font-black tracking-wider text-[#5B21B6] uppercase">
                            3. BIAYA LAYANAN &amp; OPERASIONAL
                        </span>
                        <span className="text-[11px] text-slate-400 italic font-medium">
                            Tidak ada biaya operasional tambahan pada project ini (0 Item)
                        </span>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black tracking-wider text-[#5B21B6] uppercase">
                                3. BIAYA LAYANAN &amp; OPERASIONAL
                            </span>
                            <span className="text-[10.5px] font-bold text-indigo-700">
                                {operationalCostsList.length} Item Biaya
                            </span>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-[#E0D7FE] shadow-2xs">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#0B0E38] text-white">
                                    <tr className="text-[10px] uppercase font-bold tracking-wider">
                                        <th className="py-2 px-4 text-left">DESKRIPSI BIAYA</th>
                                        <th className="py-2 px-3 text-center w-16">QTY</th>
                                        <th className="py-2 px-4 text-right">HARGA SATUAN</th>
                                        <th className="py-2 px-4 text-right">TOTAL (Rp)</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100 text-[11px]">
                                    {operationalCostsList.length > 0 ? (
                                        operationalCostsList.map((item) => (
                                            <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                                                <td className="py-2 px-4 font-semibold text-slate-800 align-middle">
                                                    {item.name}
                                                </td>
                                                <td className="py-2 px-3 text-center font-mono text-slate-600 align-middle">
                                                    {item.qty}
                                                </td>
                                                <td className="py-2 px-4 text-right text-slate-600 font-mono align-middle">
                                                    {formatRupiah(item.unit_price)}
                                                </td>
                                                <td className="py-2 px-4 text-right font-bold text-slate-900 font-mono align-middle">
                                                    {formatRupiah(item.total)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-2.5 px-4 text-center text-slate-400 italic">
                                                Tidak ada biaya operasional tambahan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                {operationalCostsList.length > 0 && (
                                    <tfoot className="bg-[#F8F7FF] border-t border-[#E0D7FE]">
                                        <tr>
                                            <td colSpan={3} className="py-1.5 px-4 font-bold text-slate-700 text-right text-[11px]">
                                                Subtotal Biaya Layanan:
                                            </td>
                                            <td className="py-1.5 px-4 font-bold text-[#5B21B6] font-mono text-right text-xs">
                                                {formatRupiah(operationalCostTotal)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                )}

                {/* 4. Rekapitulasi Finansial Lengkap */}
                <div className="p-3.5 px-4 bg-[#F5F3FF] rounded-2xl border border-[#E0D7FE] space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pb-2.5 border-b border-[#E0D7FE]/80">
                        <div>
                            <span className="text-slate-500 text-[10.5px] block font-medium">Subtotal Paket:</span>
                            <span className="font-bold text-slate-800 font-mono text-xs">{formatRupiah(packageTotal)}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 text-[10.5px] block font-medium">Subtotal Add-ons:</span>
                            <span className="font-bold text-slate-800 font-mono text-xs">{formatRupiah(additionalServicesTotal)}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 text-[10.5px] block font-medium">Subtotal Biaya Layanan:</span>
                            <span className="font-bold text-slate-800 font-mono text-xs">{formatRupiah(operationalCostTotal)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
                        <div>
                            <span className="text-xs font-black tracking-wider text-[#5B21B6] uppercase block">
                                TOTAL NILAI PROJECT
                            </span>
                            <span className="text-[11px] text-slate-600 font-medium">
                                Status Project: <strong className={projectStatusBadge.text}>{projectStatusBadge.label}</strong>
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                            <div>
                                <span className="text-[10px] text-slate-500 block uppercase font-bold">Terbayar</span>
                                <span className="text-sm font-bold text-emerald-700 font-mono">
                                    {formatRupiah(project?.paid_amount || 0)}
                                </span>
                            </div>
                            <div className="w-px h-8 bg-[#E0D7FE]" />
                            <div>
                                <span className="text-[10px] text-slate-500 block uppercase font-bold">Sisa Tagihan</span>
                                <span className="text-sm font-bold text-amber-800 font-mono">
                                    {formatRupiah(remainingProjectAmount)}
                                </span>
                            </div>
                            <div className="w-px h-8 bg-[#E0D7FE]" />
                            <div>
                                <span className="text-[10px] text-[#5B21B6] block uppercase font-black">Grand Total</span>
                                <span className="text-xl font-black text-[#5B21B6] font-mono">
                                    {formatRupiah(grandTotal)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ── SUB-RENDER: PAYMENT, NOTES & SIGNATURE ──────────────────────────────
    const renderPaymentAndNotesAndSignature = (isPageTwo = false) => (
        <div className="grid grid-cols-2 gap-4 pt-1 items-start">
            {/* Left Column: Metode Pembayaran */}
            <div className="space-y-3.5">
                <div className="space-y-1.5">
                    <span className="text-xs font-black tracking-wider text-[#5B21B6] uppercase block">
                        METODE PEMBAYARAN
                    </span>
                    <div className="w-10 h-0.5 bg-[#5B21B6] rounded-full mb-2.5"></div>

                    <div className="p-3.5 bg-white border border-[#E0D7FE] rounded-2xl space-y-2 shadow-2xs">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#F3F0FF] text-[#5B21B6] flex items-center justify-center shrink-0">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs font-bold text-slate-900 leading-tight">Transfer Bank</p>
                                <p className="text-xs text-slate-600 font-semibold leading-tight">{customTexts.bankName}</p>
                            </div>
                        </div>
                        <div className="pt-0.5">
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
                    <div className="p-3.5 bg-[#FFF5F5] border border-rose-200/90 rounded-2xl space-y-1 shadow-2xs">
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
                    <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-1 shadow-2xs">
                        <div className="flex items-center gap-2 text-emerald-700">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-wider">
                                PEMBAYARAN TELAH DIVERIFIKASI
                            </span>
                        </div>
                        <p className="text-base font-bold text-emerald-800 font-mono">
                            LUNAS ({formatRupiah(inv.paid_amount || currentInvoiceAmount)})
                        </p>
                        <p className="text-[11px] text-emerald-700/90 leading-tight">
                            Pembayaran sah telah diterima via rekening resmi dan tercatat di sistem Keuangan.
                        </p>
                    </div>
                )}

                {/* Quick Financial Recap on Page 2 for context */}
                {isPageTwo && (
                    <div className="p-3 bg-purple-50/60 border border-[#E0D7FE] rounded-2xl space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-600 text-[11px]">
                            <span>Total Nilai Project:</span>
                            <span className="font-bold text-slate-900 font-mono">{formatRupiah(grandTotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 text-[11px]">
                            <span>Terbayar:</span>
                            <span className="font-bold text-emerald-700 font-mono">{formatRupiah(project?.paid_amount || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700 text-xs font-black pt-1 border-t border-purple-200/60">
                            <span>Sisa Tagihan:</span>
                            <span className="font-bold text-[#5B21B6] font-mono">{formatRupiah(remainingProjectAmount)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Catatan & Tanda Tangan */}
            <div className="space-y-3.5">
                <div className="space-y-1.5">
                    <span className="text-xs font-black tracking-wider text-[#5B21B6] uppercase block">
                        CATATAN
                    </span>
                    <div className="w-10 h-0.5 bg-[#5B21B6] rounded-full mb-2.5"></div>

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
                <div className="p-3 bg-white border border-dashed border-[#A78BFA] rounded-2xl flex items-start gap-2 text-slate-700 shadow-2xs">
                    <Receipt className="w-4 h-4 text-[#5B21B6] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-600 leading-snug">
                        {customTexts.autoSendNote}
                    </p>
                </div>

                {/* ── TANDA TANGAN RESMI (TTD) ── */}
                <div className="pt-1 flex flex-col items-end text-right">
                    <div className="space-y-0.5 inline-block min-w-[210px] text-center">
                        <p className="text-[11px] text-slate-600 font-medium">
                            {customTexts.signatureCity || signatureCity || 'Jakarta'}, {issueDateFormatted}
                        </p>
                        <p className="text-[11px] font-bold text-slate-800">
                            {customTexts.signatureSalutation || 'Hormat Kami,'}
                        </p>
                        <p className="text-[9.5px] font-bold text-[#5B21B6] uppercase tracking-wider">
                            {studioLegalName || studioName || 'Arams Pictures Studio'}
                        </p>

                        {/* Signature Box / Stamp space */}
                        <div className="h-16 flex items-center justify-center relative my-0.5">
                            {customTexts.showSignature !== false && (customTexts.signatureImage || directorSignature) ? (
                                <div className="h-full flex items-center justify-center">
                                    <img
                                        src={customTexts.signatureImage || directorSignature}
                                        alt="Tanda Tangan Resmi"
                                        className="max-h-16 max-w-[200px] w-auto h-auto object-contain pointer-events-none select-none drop-shadow-2xs"
                                        crossOrigin="anonymous"
                                    />
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <span className="font-serif italic text-xl text-slate-300 tracking-wider select-none opacity-40">
                                        (Tanda Tangan)
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Name & Title Line */}
                        <div className="border-t border-slate-900/80 pt-1">
                            <p className="text-xs font-bold text-slate-900 tracking-tight">
                                {customTexts.directorName || directorName || 'Aditya Pratama'}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium leading-tight">
                                {customTexts.directorTitle || directorTitle || 'Direktur Utama / Finance Studio'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // ── SUB-RENDER: TRUST BADGES (ICON UNIFORM DENGAN SHIELDCHECK) ───────────
    const renderTrustBadges = () => (
        <div className="p-2.5 bg-white border border-[#E0D7FE] rounded-2xl shadow-2xs grid grid-cols-4 gap-2 items-center divide-x divide-slate-100">
            {/* Badge 1: Profesional & Terpercaya (HANYA ICON SHIELDCHECK) */}
            <div className="flex items-center justify-center gap-2 py-0.5">
                <ShieldCheck className="w-4 h-4 text-[#7C3AED] shrink-0" />
                <div className="text-left space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-800 leading-snug">{customTexts.badge1Title}</p>
                    <p className="text-[9px] text-slate-500 leading-snug">{customTexts.badge1Sub}</p>
                </div>
            </div>

            {/* Badge 2: Kualitas Terbaik */}
            <div className="flex items-center justify-center gap-2 py-0.5 pl-2">
                <Camera className="w-4 h-4 text-[#7C3AED] shrink-0" />
                <div className="text-left space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-800 leading-snug">{customTexts.badge2Title}</p>
                    <p className="text-[9px] text-slate-500 leading-snug">{customTexts.badge2Sub}</p>
                </div>
            </div>

            {/* Badge 3: Layanan Sepenuh Hati */}
            <div className="flex items-center justify-center gap-2 py-0.5 pl-2">
                <Heart className="w-4 h-4 text-[#7C3AED] shrink-0" />
                <div className="text-left space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-800 leading-snug">{customTexts.badge3Title}</p>
                    <p className="text-[9px] text-slate-500 leading-snug">{customTexts.badge3Sub}</p>
                </div>
            </div>

            {/* Badge 4: Layanan Cepat & Responsif */}
            <div className="flex items-center justify-center gap-2 py-0.5 pl-2">
                <Phone className="w-4 h-4 text-[#7C3AED] shrink-0" />
                <div className="text-left space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-800 leading-snug">{customTexts.badge4Title}</p>
                    <p className="text-[9px] text-slate-500 leading-snug">{customTexts.badge4Sub}</p>
                </div>
            </div>
        </div>
    );

    // ── SUB-RENDER: WAVE FOOTER ──────────────────────────────────────────────
    const renderWaveFooter = (pageInfo?: string) => (
        <div className="-mx-6 -mb-6 sm:-mx-8 sm:-mb-8 mt-2 overflow-hidden relative">
            <svg viewBox="0 0 1000 120" className="w-full h-10 sm:h-12 block" preserveAspectRatio="none">
                <path d="M0,50 Q250,110 500,50 T1000,45 L1000,120 L0,120 Z" fill="#8B5CF6" opacity="0.45" />
                <path d="M0,65 Q300,120 600,60 T1000,60 L1000,120 L0,120 Z" fill="#6D28D9" opacity="0.85" />
                <path d="M0,80 Q350,130 700,75 T1000,75 L1000,120 L0,120 Z" fill="#4C1D95" />
            </svg>
            <div className="bg-[#4C1D95] text-white px-6 pb-3 pt-1 text-[9px] sm:text-[10px] tracking-[0.2em] font-bold uppercase flex items-center justify-between">
                <span>{customTexts.footerWebsite.toUpperCase()}</span>
                {pageInfo ? (
                    <span className="text-purple-200 text-[8.5px] font-mono tracking-widest">{pageInfo}</span>
                ) : (
                    <span className="text-purple-200 text-[8.5px] font-mono tracking-widest">OFFICIAL INVOICE</span>
                )}
            </div>
        </div>
    );

    // ── SUB-RENDER: HEADER LEMBAR 2 ──────────────────────────────────────────
    const renderPage2Header = () => (
        <div className="flex items-center justify-between gap-4 border-b border-[#E0D7FE] pb-3">
            <div className="flex items-center gap-3">
                {studioLogo ? (
                    <img src={studioLogo} alt={studioName} className="h-9 w-auto max-w-[120px] object-contain" />
                ) : (
                    <div className="w-8 h-8 rounded-xl bg-[#0B0E38] text-white flex items-center justify-center font-bold text-xs font-serif italic">
                        ap
                    </div>
                )}
                <div>
                    <h2 className="text-xs font-black tracking-wider text-[#1E1B4B] uppercase">
                        {studioName}
                    </h2>
                    <p className="text-[9px] uppercase tracking-wider text-[#4338CA] font-semibold">
                        {customTexts.tagline}
                    </p>
                </div>
            </div>

            <div className="text-right space-y-0.5">
                <div className="flex items-center justify-end gap-2">
                    <span className="text-xs font-black tracking-wider text-[#0B0E38] uppercase">
                        LEMBAR PEMBAYARAN &amp; PENGESAHAN
                    </span>
                    <span className="px-2 py-0.5 bg-[#EDE9FE] text-[#5B21B6] text-[9px] font-black rounded-md uppercase tracking-wider border border-[#DDD6FE]">
                        Halaman 2 dari 2
                    </span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                    Lampiran Resmi Invoice <strong className="text-[#5B21B6] font-bold">{inv.invoice_number}</strong> • {issueDateFormatted}
                </p>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-full space-y-4 pb-2">
            <Head title={`Invoice ${inv.invoice_number} - ${project?.name || 'Project'}`} />

            {/* Print Isolation CSS */}
            <style>{`
                @page {
                    size: A4 portrait;
                    margin: 0;
                }
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #invoice-printable-area, #invoice-printable-area * {
                        visibility: visible !important;
                    }
                    #invoice-printable-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        min-width: 210mm !important;
                        max-width: 210mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        border-radius: 0 !important;
                        transform: none !important;
                        background: #FFFFFF !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .invoice-page-card {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                        max-height: 297mm !important;
                        height: 297mm !important;
                        position: relative !important;
                        overflow: hidden !important;
                        box-sizing: border-box !important;
                        box-shadow: none !important;
                        border: none !important;
                        border-radius: 0 !important;
                        margin: 0 !important;
                    }
                    .invoice-page-break {
                        page-break-before: always !important;
                        break-before: page !important;
                        height: 0 !important;
                        margin: 0 !important;
                    }
                    .no-print {
                        display: none !important;
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
                        <span className="text-indigo-600 font-bold">
                            {invoiceVersion === 'payment' ? 'Invoice Pembayaran (DP)' : 'Invoice Rincian Layanan'}
                        </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Invoice Preview &amp; Export
                    </h1>
                </div>


            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
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

                    {!isInvoicePaid && (
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedPaymentInvoice(inv);
                                setIsPaymentModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
                            title={`Konfirmasi pembayaran untuk ${invoiceTerminLabel}`}
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Konfirmasi Pembayaran</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsTextModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-[#7C3AED] border border-purple-200/80 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Kustomisasi Teks</span>
                    </button>

                    {/* Direct Download PDF Button */}
                    <button
                        type="button"
                        onClick={handleDownloadDirectPdf}
                        disabled={isDownloadingPdf}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-75"
                        title="Download invoice langsung dalam format file PDF"
                    >
                        {isDownloadingPdf ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Download className="w-3.5 h-3.5" />
                        )}
                        <span>{isDownloadingPdf ? 'Menyiapkan PDF...' : 'Download PDF'}</span>
                    </button>

                    {/* Printer / Native Print Dialog Button */}
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        title="Cetak invoice menggunakan printer fisik atau buka jendela print"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak</span>
                    </button>
                </div>
            </div>


            {/* ── 2. TERMIN INVOICES SELECTOR BAR ─────────────────────────────────── */}
            {invoices.length > 0 && (
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <Receipt className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xs text-slate-900">
                                    Pilih Termin Invoice ({invoices.length} Termin Terjadwal)
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Klik salah satu termin di bawah untuk melihat rincian tagihan, status pembayaran, atau mencetaknya
                                </p>
                            </div>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                            <span>Total Tagihan Project:</span>
                            <span className="font-mono text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                                {formatRupiah(grandTotal)}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                        {invoices.map((item, idx) => {
                            const isActive = String(item.id) === String(inv.id);
                            const isPaid = item.status === 'paid' || (Number(item.paid_amount || 0) >= Number(item.total || 0) && Number(item.total || 0) > 0);
                            const label = item.notes
                                ? item.notes.replace(/\s+untuk\s+.*$/i, '').trim()
                                : idx === 0
                                    ? 'Invoice 1 (DP)'
                                    : idx === invoices.length - 1
                                        ? `Invoice ${idx + 1} (Pelunasan)`
                                        : `Invoice ${idx + 1} (Termin ${idx + 1})`;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        if (!isActive) {
                                            router.visit(`/projects/${project?.id}/invoice?invoice_id=${item.id}`, {
                                                preserveScroll: true,
                                                preserveState: false,
                                            });
                                        }
                                    }}
                                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer relative group ${isActive
                                            ? 'bg-gradient-to-br from-[#5B21B6] to-[#431407]/90 text-white border-[#5B21B6] shadow-md ring-2 ring-[#5B21B6]/30'
                                            : 'bg-slate-50/70 hover:bg-white text-slate-800 border-slate-200/80 hover:border-indigo-300 hover:shadow-xs'
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className={`text-[11px] font-bold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                                            {label}
                                        </span>
                                        {isActive ? (
                                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 shrink-0">
                                                Aktif
                                            </span>
                                        ) : (
                                            <span className="text-[9px] font-semibold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Buka &rarr;
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between text-[10.5px]">
                                        <span className={`font-mono text-[10px] ${isActive ? 'text-purple-200' : 'text-slate-500'}`}>
                                            {item.invoice_number}
                                        </span>
                                        <span className={`font-bold font-mono text-xs ${isActive ? 'text-white' : 'text-[#5B21B6]'}`}>
                                            {formatRupiah(item.total)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 mt-2 border-t text-[10px] border-slate-200/40">
                                        <span className={isActive ? 'text-purple-200' : 'text-slate-400'}>
                                            Tempo: {formatDateIndo(item.due_date)}
                                        </span>
                                        <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${isPaid
                                                ? (isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                                                : (isActive ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-amber-50 text-amber-800 border border-amber-200')
                                            }`}>
                                            {isPaid ? 'LUNAS' : 'BELUM LUNAS'}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── 3. INVOICE VERSION & PAGE LAYOUT SELECTOR BAR (GAMBAR 3 CLASSIC) ── */}
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                            Pilihan Versi:
                        </span>

                        {/* Versi 1: Pembayaran / Termin */}
                        <button
                            type="button"
                            onClick={() => setInvoiceVersion('payment')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${invoiceVersion === 'payment'
                                ? 'bg-[#5B21B6] text-white border-[#5B21B6] shadow-xs'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                        >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Versi 1: Tagihan Termin ({invoiceTerminLabel})</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${invoiceVersion === 'payment' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                                }`}>
                                {formatRupiah(currentInvoiceAmount)}
                            </span>
                        </button>

                        {/* Versi 2: Full Informasi (Paket, Add-on, Biaya Layanan) */}
                        <button
                            type="button"
                            onClick={() => setInvoiceVersion('full')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${invoiceVersion === 'full'
                                ? 'bg-[#5B21B6] text-white border-[#5B21B6] shadow-xs'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Versi 2: Full Informasi (Paket, Add-on, Biaya)</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${invoiceVersion === 'full' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                                }`}>
                                Rincian Lengkap
                            </span>
                        </button>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                        {/* A4 Fixed Dimension Indicator */}
                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold tracking-wide">
                            A4 Fix • 210×297 mm
                        </span>

                        {/* Fit Screen Mode */}
                        <button
                            type="button"
                            onClick={() => setZoomMode('fit')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${zoomMode === 'fit'
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
                                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                            title="Sesuaikan otomatis dengan layar tablet atau HP agar tidak terpotong"
                        >
                            <Maximize2 className="w-3 h-3" />
                            <span>Fit Layar</span>
                        </button>

                        {/* 100% Original Scale Mode */}
                        <button
                            type="button"
                            onClick={() => {
                                setZoomMode('100');
                                setManualScale(1);
                            }}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${zoomMode === '100'
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs'
                                    : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                                }`}
                            title="Tampilkan dalam ukuran 100% A4 asli"
                        >
                            100%
                        </button>

                        {/* Manual Zoom Controls */}
                        <div className="flex items-center gap-0.5 bg-slate-50 p-0.5 rounded-lg border border-slate-200/80">
                            <button
                                type="button"
                                onClick={handleZoomOut}
                                className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-white cursor-pointer"
                                title="Perkecil (-10%)"
                            >
                                <ZoomOut className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10.5px] font-bold text-slate-700 font-mono w-9 text-center">
                                {displayPercentage}%
                            </span>
                            <button
                                type="button"
                                onClick={handleZoomIn}
                                className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-white cursor-pointer"
                                title="Perbesar (+10%)"
                            >
                                <ZoomIn className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={handleResetZoom}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-white cursor-pointer"
                                title="Reset Tampilan (Fit Layar)"
                            >
                                <RefreshCw className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sub-bar: Layout Mode (1 Halaman vs 2 Halaman Page Break) */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                            Format Halaman Cetak:
                        </span>
                        <button
                            type="button"
                            onClick={() => setPageLayoutMode('single')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${pageLayoutMode === 'single'
                                ? 'bg-[#0B0E38] text-white border-[#0B0E38] shadow-2xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                            title="Format seluruh invoice agar pas dan rapi dalam 1 lembar A4 tanpa terpotong"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            <span>1 Halaman Pas (Auto-Fit)</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setPageLayoutMode('multi')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${pageLayoutMode === 'multi'
                                ? 'bg-[#0B0E38] text-white border-[#0B0E38] shadow-2xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                            title="Format invoice dalam 2 halaman A4 resmi dengan page break, serta header dan footer di setiap halaman"
                        >
                            <SplitSquareVertical className="w-3.5 h-3.5" />
                            <span>2 Halaman (Page Break &amp; Header/Footer Lengkap)</span>
                        </button>
                    </div>

                    {pageLayoutMode === 'single' && (
                        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors">
                            <input
                                type="checkbox"
                                checked={customTexts.hideEmptyTables}
                                onChange={(e) => setCustomTexts(prev => ({ ...prev, hideEmptyTables: e.target.checked }))}
                                className="w-3.5 h-3.5 rounded text-[#5B21B6] focus:ring-[#5B21B6] border-slate-300"
                            />
                            <span className="text-[11px] font-medium">Sembunyikan tabel kosong (0 item)</span>
                        </label>
                    )}
                </div>
            </div>

            {/* ── 3. MAIN 2-COLUMN GRID ─────────────────────────────────────────── */}
            <div className="grid grid-cols-12 gap-6 items-start">
                {/* ── LEFT COLUMN (70% - 8 COLS): INVOICE CANVAS & PREVIEW ─────────── */}
                <div className="col-span-12 lg:col-span-8 space-y-6">
                    {/* The Elegant Studio Canvas Background */}
                    <div
                        ref={canvasContainerRef}
                        className="bg-slate-100/80 p-2.5 sm:p-6 lg:p-8 rounded-3xl border border-slate-200/60 shadow-inner flex justify-center overflow-x-auto min-h-[520px]"
                    >
                        {/* ── SIZING BOUNDING BOX: Matches exact scaled geometry to eliminate whitespace gaps ── */}
                        <div
                            style={{
                                width: `${Math.round(A4_WIDTH * effectiveScale)}px`,
                                height: sheetHeight > 0 ? `${Math.round(sheetHeight * effectiveScale)}px` : 'auto',
                                position: 'relative',
                                flexShrink: 0,
                            }}
                            className="transition-all duration-150 ease-out"
                        >
                            {pageLayoutMode === 'single' ? (
                                <div
                                    id="invoice-printable-area"
                                    ref={invoiceSheetRef}
                                    style={{
                                        width: `${A4_WIDTH}px`,
                                        minWidth: `${A4_WIDTH}px`,
                                        maxWidth: `${A4_WIDTH}px`,
                                        minHeight: `${A4_MIN_HEIGHT}px`,
                                        transform: `scale(${effectiveScale})`,
                                        transformOrigin: 'top left',
                                    }}
                                    className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_20px_50px_rgba(15,23,42,0.08)] overflow-hidden relative font-sans text-slate-900 flex flex-col justify-between"
                                >
                                    {/* Waves Header */}
                                    <div className="relative">
                                        {renderWaveCurves()}
                                        <div className="relative z-10 px-8 pt-7 pb-2 space-y-4">
                                            <div className="flex items-start justify-between gap-6">
                                                {renderStudioBranding()}
                                                {renderInvoiceMeta()}
                                            </div>
                                            {renderClientAndProject()}
                                        </div>
                                    </div>

                                    {/* Main Content Area */}
                                    <div className="px-8 py-2 flex-1 space-y-4">
                                        {renderBreakdownTables(true)}
                                        {renderPaymentAndNotesAndSignature()}
                                    </div>

                                    {/* Footer */}
                                    <div className="relative mt-auto">
                                        {renderTrustBadges()}
                                        {renderWaveFooter('Halaman 1 dari 1')}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    id="invoice-printable-area"
                                    ref={invoiceSheetRef}
                                    style={{
                                        transform: `scale(${effectiveScale})`,
                                        transformOrigin: 'top left',
                                    }}
                                    className="flex flex-col gap-6"
                                >
                                    {/* ── SHEET 1: RINGKASAN & TABEL RINCIAN ── */}
                                    <div
                                        id="invoice-page-1"
                                        style={{
                                            width: `${A4_WIDTH}px`,
                                            minWidth: `${A4_WIDTH}px`,
                                            maxWidth: `${A4_WIDTH}px`,
                                            minHeight: `${A4_MIN_HEIGHT}px`,
                                            height: `${A4_MIN_HEIGHT}px`,
                                        }}
                                        className="invoice-page-card bg-white rounded-2xl border border-slate-200/80 shadow-[0_20px_50px_rgba(15,23,42,0.08)] overflow-hidden relative font-sans text-slate-900 flex flex-col justify-between"
                                    >
                                        <div className="relative">
                                            {renderWaveCurves()}
                                            <div className="relative z-10 px-8 pt-7 pb-2 space-y-4">
                                                <div className="flex items-start justify-between gap-6">
                                                    {renderStudioBranding()}
                                                    {renderInvoiceMeta()}
                                                </div>
                                                {renderClientAndProject()}
                                            </div>
                                        </div>

                                        <div className="px-8 py-2 flex-1 space-y-4">
                                            {renderBreakdownTables(false)}
                                        </div>

                                        <div className="relative mt-auto">
                                            {renderTrustBadges()}
                                            {renderWaveFooter('Halaman 1 dari 2')}
                                        </div>
                                    </div>

                                    {/* Visual Page Break Separator in Preview (Hidden during print) */}
                                    <div className="no-print invoice-page-break flex items-center justify-center gap-3 py-2 text-xs font-bold text-slate-400">
                                        <div className="h-px bg-slate-300/80 flex-1 border-dashed border-t" />
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-slate-200 shadow-2xs text-slate-500">
                                            <SplitSquareVertical className="w-3.5 h-3.5 text-[#7C3AED]" />
                                            <span>Batas Halaman Cetak (Page Break A4)</span>
                                        </div>
                                        <div className="h-px bg-slate-300/80 flex-1 border-dashed border-t" />
                                    </div>

                                    {/* ── SHEET 2: METODE PEMBAYARAN, CATATAN & PENGESAHAN TTD ── */}
                                    <div
                                        id="invoice-page-2"
                                        style={{
                                            width: `${A4_WIDTH}px`,
                                            minWidth: `${A4_WIDTH}px`,
                                            maxWidth: `${A4_WIDTH}px`,
                                            minHeight: `${A4_MIN_HEIGHT}px`,
                                            height: `${A4_MIN_HEIGHT}px`,
                                        }}
                                        className="invoice-page-card bg-white rounded-2xl border border-slate-200/80 shadow-[0_20px_50px_rgba(15,23,42,0.08)] overflow-hidden relative font-sans text-slate-900 flex flex-col justify-between"
                                    >
                                        <div className="relative">
                                            {renderWaveCurves()}
                                            <div className="relative z-10 px-8 pt-7 pb-2">
                                                {renderPage2Header()}
                                            </div>
                                        </div>

                                        <div className="px-8 py-3 flex-1 space-y-5">
                                            {renderPaymentAndNotesAndSignature()}
                                        </div>

                                        <div className="relative mt-auto">
                                            {renderTrustBadges()}
                                            {renderWaveFooter('Halaman 2 dari 2')}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIWAYAT INVOICE TABLE ────────────────────────────────── */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3.5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-900 text-xs tracking-tight">
                                    Riwayat Invoice Project
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Daftar seluruh termin dan status pembayaran untuk project ini
                                </p>
                            </div>
                            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100/80">
                                {invoices.length} Dokumen
                            </span>
                        </div>

                        <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
                            <table className="w-full text-left text-xs whitespace-nowrap min-w-[720px]">
                                <thead>
                                    <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 tracking-wider">
                                        <th className="pb-2.5 pt-1 px-3 first:pl-1 whitespace-nowrap">NO. INVOICE</th>
                                        <th className="pb-2.5 pt-1 px-3 whitespace-nowrap">JENIS TAGIHAN</th>
                                        <th className="pb-2.5 pt-1 px-3 whitespace-nowrap">TANGGAL TERBIT</th>
                                        <th className="pb-2.5 pt-1 px-3 whitespace-nowrap">JATUH TEMPO</th>
                                        <th className="pb-2.5 pt-1 px-3 text-right whitespace-nowrap">NOMINAL</th>
                                        <th className="pb-2.5 pt-1 px-3 text-center whitespace-nowrap">STATUS</th>
                                        <th className="pb-2.5 pt-1 pl-3 pr-1 text-center w-16 whitespace-nowrap">AKSI</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                                                Belum ada riwayat invoice untuk project ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        invoices.map((item, idx) => {
                                            const isCurrent = item.id === inv.id;
                                            const isItemPaid = item.status === 'paid' || (Number(item.paid_amount || 0) >= Number(item.total || 0) && Number(item.total || 0) > 0);
                                            const itemLabel = item.notes
                                                ? item.notes.replace(/\s+untuk\s+.*$/i, '').trim()
                                                : idx === 0
                                                    ? 'Invoice 1 (DP)'
                                                    : idx === invoices.length - 1
                                                        ? `Invoice ${idx + 1} (Pelunasan)`
                                                        : `Invoice ${idx + 1} (Termin ${idx + 1})`;

                                            return (
                                                <tr key={item.id} className={`group transition-colors ${isCurrent ? 'bg-purple-50/60 font-semibold' : 'hover:bg-slate-50/60'}`}>
                                                    <td className="py-3 px-3 first:pl-1 font-bold text-slate-900 font-mono text-xs whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                            <span>{item.invoice_number}</span>
                                                            {isCurrent && (
                                                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-600 text-white shrink-0 shadow-2xs">
                                                                    Aktif
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap max-w-[220px] truncate" title={itemLabel}>
                                                        {itemLabel}
                                                    </td>
                                                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                                                        {formatDateIndo(item.issue_date)}
                                                    </td>
                                                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                                                        {formatDateIndo(item.due_date)}
                                                    </td>
                                                    <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono whitespace-nowrap">
                                                        {formatRupiah(item.total)}
                                                    </td>
                                                    <td className="py-3 px-3 text-center whitespace-nowrap">
                                                        {(() => {
                                                            const itemStatus = getInvoiceStatus(item);

                                                            return (
                                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-lg border whitespace-nowrap ${itemStatus.badge}`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${itemStatus.dot}`} />
                                                                    <span>{itemStatus.label}</span>
                                                                </span>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="py-3 pl-3 pr-1 text-center whitespace-nowrap">
                                                        <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                                                            <button
                                                                type="button"
                                                                onClick={() => router.visit(`/projects/${project?.id}/invoice?invoice_id=${item.id}`, { preserveScroll: true, preserveState: false })}
                                                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isCurrent ? 'bg-purple-100 text-purple-700' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'}`}
                                                                title="Lihat Invoice Ini"
                                                                aria-label={`Lihat invoice ${item.invoice_number}`}
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            {!isItemPaid && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSelectedPaymentInvoice(item);
                                                                        setIsPaymentModalOpen(true);
                                                                    }}
                                                                    className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                                                    title={`Konfirmasi Pembayaran ${itemLabel}`}
                                                                    aria-label={`Konfirmasi pembayaran untuk ${itemLabel}`}
                                                                >
                                                                    <CreditCard className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
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
                                <span className="font-semibold text-indigo-700">{invoiceTerminLabel}</span>
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

                    {/* ── CARD: STATUS & KONFIRMASI PEMBAYARAN ─────────────────────── */}
                    <div className={`p-4 rounded-3xl border shadow-2xs space-y-3 ${isInvoicePaid
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                        : 'bg-amber-50/80 border-amber-200 text-amber-950'
                        }`}>
                        <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isInvoicePaid ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                                }`}>
                                {isInvoicePaid ? <Check className="w-4 h-4 stroke-[3]" /> : <Clock className="w-4 h-4" />}
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-xs truncate">
                                    {isInvoicePaid ? `${invoiceTerminLabel} Telah Lunas` : `Menunggu Pembayaran ${invoiceTerminLabel}`}
                                </h4>
                                <p className="text-[11px] opacity-80 truncate">
                                    {isInvoicePaid
                                        ? `Tercatat di Keuangan: ${formatRupiah(inv.paid_amount || currentInvoiceAmount)}`
                                        : `Total Tagihan: ${formatRupiah(currentInvoiceAmount)}`}
                                </p>
                            </div>
                        </div>

                        {!isInvoicePaid ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedPaymentInvoice(inv);
                                    setIsPaymentModalOpen(true);
                                }}
                                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Konfirmasi Terima Pembayaran</span>
                            </button>
                        ) : (
                            <div className="text-[11px] font-semibold text-emerald-800 bg-white/80 py-2.5 px-3 rounded-xl border border-emerald-200 text-center flex items-center justify-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Pembayaran Telah Dikonfirmasi & Masuk Keuangan</span>
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
                                <span className="text-slate-500">Tagihan ({invoiceTerminLabel})</span>
                                <span className="font-bold text-indigo-600 font-mono">{formatRupiah(currentInvoiceAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Terbayar (Project)</span>
                                <span className="font-bold text-emerald-600 font-mono">{formatRupiah(project?.paid_amount || 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Sisa Tagihan Project</span>
                                <span className="font-bold text-amber-700 font-mono">{formatRupiah(remainingProjectAmount)}</span>
                            </div>
                            <div className="flex justify-between pt-1.5 border-t border-slate-100">
                                <span className="font-black text-[#3B46F1]">Nominal Invoice Ini</span>
                                <span className="font-black text-sm text-[#3B46F1] font-mono">{formatRupiah(currentInvoiceAmount)}</span>
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

                            {/* Direct PDF Download Button */}
                            <button
                                type="button"
                                onClick={handleDownloadDirectPdf}
                                disabled={isDownloadingPdf}
                                className="w-full py-2.5 px-4 bg-[#3B46F1] hover:bg-[#323BD8] text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                                title="Download invoice langsung dalam format file PDF tanpa dialog print"
                            >
                                {isDownloadingPdf ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                <span>{isDownloadingPdf ? 'Menyiapkan PDF...' : 'Download PDF (Langsung)'}</span>
                            </button>

                            {/* Physical / Native Print Button */}
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                title="Cetak menggunakan printer fisik atau buka jendela preview cetak"
                            >
                                <Printer className="w-4 h-4 text-slate-500" />
                                <span>Cetak Invoice</span>
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
                            {/* Section 0: Format Cetak & Tata Letak Halaman (Anti-Terpotong) */}
                            <div className="space-y-3 p-4 rounded-2xl bg-purple-50/60 border border-purple-200/70">
                                <div className="flex items-center justify-between">
                                    <span className="font-black text-[10.5px] uppercase tracking-wider text-[#7C3AED] flex items-center gap-1.5">
                                        <SplitSquareVertical className="w-3.5 h-3.5" />
                                        0. Tata Letak &amp; Format Cetak (Solusi Anti-Terpotong)
                                    </span>
                                    <span className="text-[10px] font-semibold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md">
                                        Rekomendasi Cetak A4
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-600">
                                    Pilih strategi tata letak agar tabel, metode transfer, dan tanda tangan tidak terpotong di tengah:
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setPageLayoutMode('single')}
                                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${pageLayoutMode === 'single'
                                            ? 'bg-white border-[#7C3AED] shadow-xs ring-1 ring-[#7C3AED]'
                                            : 'bg-white/60 border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${pageLayoutMode === 'single' ? 'bg-[#7C3AED]' : 'bg-slate-300'}`} />
                                                1 Halaman Pas (Auto-Fit)
                                            </span>
                                            {pageLayoutMode === 'single' && (
                                                <Check className="w-3.5 h-3.5 text-[#7C3AED]" />
                                            )}
                                        </div>
                                        <p className="text-[10.5px] text-slate-500 leading-relaxed">
                                            Muat seluruh tagihan dalam 1 lembar A4. Otomatis hemat spasi dan ringkas.
                                        </p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPageLayoutMode('multi')}
                                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${pageLayoutMode === 'multi'
                                            ? 'bg-white border-[#7C3AED] shadow-xs ring-1 ring-[#7C3AED]'
                                            : 'bg-white/60 border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${pageLayoutMode === 'multi' ? 'bg-[#7C3AED]' : 'bg-slate-300'}`} />
                                                2 Halaman (Page Break)
                                            </span>
                                            {pageLayoutMode === 'multi' && (
                                                <Check className="w-3.5 h-3.5 text-[#7C3AED]" />
                                            )}
                                        </div>
                                        <p className="text-[10.5px] text-slate-500 leading-relaxed">
                                            Rincian di Lembar 1, Rekening &amp; TTD di Lembar 2. Tiap lembar punya Header &amp; Footer lengkap.
                                        </p>
                                    </button>
                                </div>

                                <div className="pt-2 border-t border-purple-100 flex items-center justify-between">
                                    <div>
                                        <span className="text-[11px] font-semibold text-slate-700 block">
                                            Sembunyikan Tabel Kosong (0 item)
                                        </span>
                                        <span className="text-[10px] text-slate-500">
                                            Menghilangkan tabel add-on atau biaya operasional jika bernilai Rp 0.
                                        </span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={customTexts.hideEmptyTables}
                                            onChange={(e) => setCustomTexts({ ...customTexts, hideEmptyTables: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7C3AED]"></div>
                                    </label>
                                </div>
                            </div>

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

                            {/* Section 4: Pengingat & Tanda Tangan (TTD) */}
                            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-200/60">
                                <span className="font-black text-[10.5px] uppercase tracking-wider text-[#7C3AED] block">
                                    4. Pengingat Jatuh Tempo &amp; Penandatangan (TTD)
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
                                        <label className="text-[11px] font-semibold text-slate-600">Nama Direktur / Penandatangan</label>
                                        <input
                                            type="text"
                                            value={customTexts.directorName}
                                            onChange={(e) => setCustomTexts({ ...customTexts, directorName: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-hidden font-bold"
                                            placeholder="Aditya Pratama"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">Jabatan Penandatangan</label>
                                        <input
                                            type="text"
                                            value={customTexts.directorTitle}
                                            onChange={(e) => setCustomTexts({ ...customTexts, directorTitle: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-hidden"
                                            placeholder="Direktur Utama / Finance Studio"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">Kota Tanda Tangan</label>
                                        <input
                                            type="text"
                                            value={customTexts.signatureCity}
                                            onChange={(e) => setCustomTexts({ ...customTexts, signatureCity: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-hidden"
                                            placeholder="Jakarta Selatan"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">Salam Pembuka TTD</label>
                                        <input
                                            type="text"
                                            value={customTexts.signatureSalutation}
                                            onChange={(e) => setCustomTexts({ ...customTexts, signatureSalutation: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-hidden"
                                            placeholder="Hormat Kami,"
                                        />
                                    </div>

                                    {/* TTD Digital Integration Status & Toggle */}
                                    <div className="sm:col-span-2 pt-2 border-t border-slate-200/80">
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/70 border border-purple-200/70">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-white border border-purple-200 flex items-center justify-center shrink-0">
                                                    {customTexts.signatureImage || directorSignature ? (
                                                        <img
                                                            src={customTexts.signatureImage || directorSignature}
                                                            alt="TTD"
                                                            className="max-h-6 max-w-full object-contain"
                                                        />
                                                    ) : (
                                                        <FileText className="w-4 h-4 text-purple-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">
                                                        Tanda Tangan Digital (TTD)
                                                    </p>
                                                    <p className="text-[10px] text-slate-500">
                                                        {customTexts.signatureImage || directorSignature
                                                            ? 'Tersinkronisasi dari Pengaturan Admin'
                                                            : 'Belum diatur di Pengaturan Admin'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={customTexts.showSignature !== false}
                                                        onChange={(e) =>
                                                            setCustomTexts({
                                                                ...customTexts,
                                                                showSignature: e.target.checked,
                                                            })
                                                        }
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: Trust Badges & Website */}
                            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/60 border border-slate-200/60">
                                <span className="font-black text-[10.5px] uppercase tracking-wider text-[#7C3AED] block">
                                    5. Bar Badges Garansi &amp; Website Footer
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-slate-600">Badge 4</label>
                                        <input
                                            type="text"
                                            value={customTexts.badge4Title}
                                            onChange={(e) => setCustomTexts({ ...customTexts, badge4Title: e.target.value })}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                                            placeholder="Layanan Cepat"
                                        />
                                        <input
                                            type="text"
                                            value={customTexts.badge4Sub}
                                            onChange={(e) => setCustomTexts({ ...customTexts, badge4Sub: e.target.value })}
                                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                                            placeholder="& Responsif"
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
            <RecordPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedPaymentInvoice(null);
                }}
                project={project}
                paymentMethods={payment_methods}
                invoiceId={selectedPaymentInvoice?.id || inv.id}
                initialAmount={
                    selectedPaymentInvoice
                        ? Math.max(0, Number(selectedPaymentInvoice.total || 0) - Number(selectedPaymentInvoice.paid_amount || 0))
                        : Math.max(0, Number(inv.total || 0) - Number(inv.paid_amount || 0))
                }
                initialNotes={`Pembayaran ${(selectedPaymentInvoice || inv).notes ? (selectedPaymentInvoice || inv).notes.replace(/\s+untuk\s+.*$/i, '').trim() : invoiceTerminLabel} (${(selectedPaymentInvoice || inv).invoice_number})`}
                onSuccess={() => {
                    router.reload();
                }}
            />
        </div>
    );
}
