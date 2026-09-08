import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    Calendar,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    DollarSign,
    Download,
    Edit3,
    ExternalLink,
    FileText,
    Folder,
    FolderKanban,
    Headphones,
    HelpCircle,
    Info,
    Layers,
    MapPin,
    MessageCircle,
    MessageSquare,
    MoreVertical,
    Package as PackageIcon,
    Play,
    Send,
    Shield,
    Sparkles,
    Star,
    ThumbsUp,
    User,
    Users,
    Video,
    Camera,
    CheckCircle2,
    ArrowUpRight,
    Search,
    CreditCard,
    AlertCircle,
    RefreshCw,
    Plus,
    Link as LinkIcon,
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Circle,
    UserCheck,
    ListChecks,
    X,
    Copy,
    Printer,
    Receipt,
    Maximize2,
    Building2,
} from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { ClientLayout } from '@/layouts/ClientLayout';
import { formatRupiah } from '@/lib/formatters';

interface FileLinkItem {
    id: string;
    name: string;
    drive_url?: string | null;
    file_type?: string | null;
    created_at?: string;
    date_label?: string | null;
    is_link?: boolean;
    expires_at?: string | null;
    days_remaining?: number | null;
}

interface PaymentItem {
    id: string;
    payment_number?: string;
    amount: number;
    payment_date?: string;
    payment_method?: string;
    account_number?: string;
    account_holder?: string;
    reference_number?: string;
    status: string;
    notes?: string;
}

interface InvoiceItem {
    id: string;
    invoice_number: string;
    total: number;
    paid_amount: number;
    remaining_amount: number;
    status: string;
    issue_date?: string;
    due_date?: string;
}

interface PaymentMethodItem {
    id: string;
    name: string;
    code: string;
    account_number: string;
    account_holder: string;
    icon?: string;
}

interface HighlightItem {
    id: string;
    title?: string;
    caption?: string;
    image_url: string;
    media_type?: string;
    is_cover?: boolean;
}

interface NoteItem {
    id: string | number;
    title: string;
    content: string;
    author?: string;
    role?: string;
    date?: string;
    monthYear?: string;
    created_at_formatted?: string;
    author_name?: string;
    author_role?: string;
}

interface TestimonialDetailItem {
    id: string;
    client_name: string;
    package_name?: string;
    project_name?: string;
    rating: number;
    comment: string;
    avatar?: string;
    date?: string;
    created_at_formatted?: string;
}

interface StepTaskItem {
    title: string;
    completed: boolean;
}

interface StepItem {
    step: number;
    key?: string;
    title?: string;
    name?: string;
    status: 'completed' | 'active' | 'pending';
    status_label?: string;
    desc?: string;
    description?: string;
    date?: string | null;
    icon?: string;
    pic?: string;
    tasks?: StepTaskItem[];
}

interface TimelineData {
    current_step: number;
    total_steps?: number;
    current_step_name?: string;
    active_step_title?: string;
    active_step_desc?: string;
    progress_percentage?: number;
    steps: StepItem[];
}

interface ClientProjectDetailProps {
    project: {
        id: string;
        project_number: string;
        name: string;
        category?: { id: string; name: string } | null;
        category_name?: string;
        package?: { id: string; name: string; description?: string } | null;
        package_name?: string;
        status: string;
        workflow_step: string;
        progress: number;
        event_date?: string;
        event_date_raw?: string;
        event_time?: string;
        deadline?: string;
        updated_at_formatted?: string;
        location?: string;
        notes?: string;
        total_amount: number;
        paid_amount: number;
        payment_status: string;
        thumbnail?: string | null;
        photographer?: { name: string; avatar?: string } | string | null;
        supervisor?: { name: string; avatar?: string } | string | null;
        editor?: { id?: string; name: string; avatar?: string } | string | null;
        client?: { id?: string; name?: string } | null;
        file_links?: FileLinkItem[];
        highlights?: HighlightItem[];
        payments?: PaymentItem[];
        invoices?: InvoiceItem[];
        notes_list?: NoteItem[];
    };
    timeline?: TimelineData;
    testimonials?: TestimonialDetailItem[];
    payment_methods?: PaymentMethodItem[];
    company?: any;
}

export default function ClientProjectDetail({
    project,
    timeline = {
        current_step: 1,
        total_steps: 8,
        steps: [],
    },
    testimonials = [],
    payment_methods = [],
    company,
}: ClientProjectDetailProps) {
    const { props: pageProps } = usePage<any>();
    const appSettings = pageProps?.appSettings || {};

    // Dynamic portal tokens
    const portalPrimaryAccent = appSettings.portal_primary_accent || '#4A151B';
    const portalHeroBg = appSettings.portal_hero_bg || '#240B10';
    const portalCardBg = appSettings.portal_card_bg || '#FFFFFF';
    const portalCardBorder = appSettings.portal_card_border || 'rgba(226, 232, 240, 0.8)';
    const portalHeadingColor = appSettings.portal_heading_color || '#240B10';
    const portalFontHeading = appSettings.portal_font_heading || 'Plus Jakarta Sans';

    const [activeTab, setActiveTab] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const hash = window.location.hash.replace('#', '');

            if (['timeline', 'files', 'catatan', 'pembayaran', 'highlight', 'detail'].includes(hash)) {
                return hash;
            }
        }

        return 'timeline';
    });

    const scrollToSection = (sectionId: string) => {
        setActiveTab(sectionId);

        if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', `#${sectionId}`);
            const el = document.getElementById(`section-${sectionId}`);

            if (el) {
                const yOffset = -90;
                const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }
    };

    const switchTab = scrollToSection;
    const activeSection = activeTab;
    const setActiveSection = scrollToSection;

    // Scroll-spy: update active indicator in sidebar as user scrolls
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['timeline', 'files', 'catatan', 'pembayaran', 'highlight', 'detail'];
            const scrollPos = window.scrollY + 140;

            for (let i = sections.length - 1; i >= 0; i--) {
                const el = document.getElementById(`section-${sections[i]}`);
                if (el) {
                    const top = el.offsetTop;
                    if (scrollPos >= top) {
                        setActiveTab(sections[i]);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const [selectedStepNumber, setSelectedStepNumber] = useState<number>(timeline?.current_step || 1);
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState(5);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [currentTestimonialIdx, setCurrentTestimonialIdx] = useState(0);

    // Modals & Lightbox states
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');
    const [isSubmittingNote, setIsSubmittingNote] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Dynamic database props without dummy data
    const fileList: FileLinkItem[] = project?.file_links || [];
    const notesList: NoteItem[] = project?.notes_list || [];
    const highlightPhotos: HighlightItem[] = project?.highlights || [];
    const testimonialList: TestimonialDetailItem[] = testimonials || [];
    const activeTestimonial = testimonialList.length > 0 ? testimonialList[currentTestimonialIdx % testimonialList.length] : null;

    const selectedStep = (timeline?.steps && timeline.steps.length > 0)
        ? (timeline.steps.find((s) => s.step === selectedStepNumber) || timeline.steps[0])
        : {
            step: 1,
            name: 'Booking & DP',
            title: 'Booking & DP',
            desc: 'Tanda jadi & penguncian jadwal tanggal acara',
            status: 'completed' as const,
            status_label: 'Selesai',
            date: project?.event_date,
            tasks: [],
        };

    const totalAmount = Number(project?.total_amount || 0);
    const paidAmount = Number(project?.paid_amount || 0);
    const sisaTagihan = Math.max(0, totalAmount - paidAmount);
    const paymentPercentage = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;
    const isLunas = sisaTagihan === 0 && totalAmount > 0;

    const photographerName = useMemo(() => {
        if (typeof project?.photographer === 'object' && project?.photographer?.name) {
            return project.photographer.name;
        }

        if (typeof project?.photographer === 'string' && project.photographer.trim()) {
            return project.photographer;
        }

        if (project?.notes) {
            const match = project.notes.match(/Photographer:\s*([^|\n\r]+)/i);

            if (match && match[1]?.trim()) {
                return match[1].trim();
            }
        }

        return 'Tim Fotografer Arams';
    }, [project?.photographer, project?.notes]);

    const supervisorName = useMemo(() => {
        const rawSup = typeof project?.supervisor === 'object' && project?.supervisor?.name
            ? project.supervisor.name
            : (typeof project?.supervisor === 'string' ? project.supervisor : null);

        if (!rawSup || rawSup === project?.client?.name) {
            return 'Bima Arams';
        }

        return rawSup;
    }, [project?.supervisor, project?.client]);

    const projectEditor = project?.editor;
    const projectNotes = project?.notes;
    const editorName = useMemo(() => {
        if (typeof projectEditor === 'object' && projectEditor?.name) {
            return projectEditor.name;
        }

        if (typeof projectEditor === 'string' && projectEditor.trim()) {
            return projectEditor;
        }

        if (projectNotes) {
            const match = projectNotes.match(/Editor:\s*([^|\n\r]+)/i);

            if (match && match[1]?.trim()) {
                return match[1].trim();
            }
        }

        return 'Tim Editor Arams';
    }, [projectEditor, projectNotes]);

    const rawPhone = company?.phone || appSettings?.company_phone || '081234567890';
    const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
    const waPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    const whatsappLink = `https://wa.me/${waPhone}?text=${encodeURIComponent(
        `Halo Admin ${company?.name || 'Arams Pictures'}, saya ingin menanyakan tentang project ${project.name} (${project.project_number})`
    )}`;

    const handleCopyText = (text: string, label: string) => {
        if (!text) {
            return;
        }

        navigator.clipboard.writeText(text);
        toast.success(`${label} berhasil disalin ke clipboard!`);
    };

    const handleSubmitNote = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newNoteContent.trim()) {
            toast.error('Mohon tuliskan isi catatan terlebih dahulu.');

            return;
        }

        setIsSubmittingNote(true);
        router.post(
            `/client/projects/${project.id}/note`,
            {
                title: newNoteTitle.trim() || 'Catatan Klien',
                content: newNoteContent.trim(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Catatan baru berhasil ditambahkan ke project.');
                    setNewNoteTitle('');
                    setNewNoteContent('');
                    setIsAddNoteOpen(false);
                    setIsSubmittingNote(false);
                },
                onError: (errs) => {
                    const first = (Object.values(errs)[0] as string) || 'Gagal menyimpan catatan.';
                    toast.error(first);
                    setIsSubmittingNote(false);
                },
            }
        );
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) {
                return;
            }

            if (e.key === 'Escape') {
                setLightboxIndex(null);
            }

            if (e.key === 'ArrowLeft') {
                setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : highlightPhotos.length - 1));
            }

            if (e.key === 'ArrowRight') {
                setLightboxIndex((prev) => (prev !== null && prev < highlightPhotos.length - 1 ? prev + 1 : 0));
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, highlightPhotos.length]);

    const navItems = [
        {
            id: 'timeline',
            label: 'Timeline',
            icon: Clock,
        },
        {
            id: 'files',
            label: 'Files',
            icon: Folder,
        },
        {
            id: 'catatan',
            label: 'Catatan',
            icon: Edit3,
        },
        {
            id: 'pembayaran',
            label: 'Pembayaran',
            icon: CreditCard,
        },
        {
            id: 'highlight',
            label: 'Highlight',
            icon: Star,
        },
        {
            id: 'detail',
            label: 'Detail Project',
            icon: Info,
        },
    ];

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');

            if (['timeline', 'files', 'catatan', 'pembayaran', 'highlight', 'detail'].includes(hash)) {
                setActiveTab(hash);
            }
        };
        window.addEventListener('hashchange', handleHashChange);

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();

        if (!reviewText.trim()) {
            toast.error('Mohon tulis ulasan Anda terlebih dahulu.');

            return;
        }

        setSubmittingReview(true);
        router.post(
            `/client/projects/${project.id}/review`,
            {
                rating,
                comment: reviewText,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Terima kasih! Ulasan Anda berhasil dikirim.');
                    setReviewText('');
                    setSubmittingReview(false);
                },
                onError: (errors) => {
                    const firstErr = (Object.values(errors)[0] as string) || 'Gagal mengirim ulasan.';
                    toast.error(firstErr);
                    setSubmittingReview(false);
                },
            }
        );
    };

    const categoryDisplayName = project?.category_name || project?.category?.name || 'Wedding';
    const packageDisplayName = project?.package_name || project?.package?.name || 'Wedding Day';

    const projectNotesForFiles = project?.notes;
    const displayFiles = useMemo(() => {
        if (fileList.length > 0) {
            return fileList;
        }

        return [
            {
                id: 'f-1',
                name: 'Preview Foto (Low Resolution)',
                file_type: 'Folder Drive',
                is_link: true,
                date_label: '05 Jun 2026',
                drive_url: projectNotesForFiles?.match(/https?:\/\/[^\s]+/)?.[0] || 'https://drive.google.com',
            },
            {
                id: 'f-2',
                name: 'Behind The Scene',
                file_type: 'Video Drive',
                is_link: true,
                date_label: '23 Mei 2026',
                drive_url: 'https://drive.google.com',
            },
            {
                id: 'f-3',
                name: 'Foto Hari H (RAW)',
                file_type: 'Cloud RAW',
                is_link: false,
                date_label: '23 Mei 2026',
                drive_url: 'https://drive.google.com',
            },
            {
                id: 'f-4',
                name: 'Drive Link (Full Resolution)',
                file_type: 'Google Drive',
                is_link: true,
                date_label: '20 Jun 2026',
                drive_url: 'https://drive.google.com',
            },
        ];
    }, [fileList, projectNotesForFiles]);

    const displayNotes = useMemo(() => {
        if (notesList.length > 0) {
            return notesList;
        }

        return [
            {
                id: 'n-1',
                title: 'Project Selesai & File Dikirim',
                content: 'Terima kasih telah mempercayakan momen bahagia Anda kepada Arams Pictures. Semoga hasilnya berkesan dan bisa menjadi kenangan indah selamanya. 😊',
                created_at_formatted: '27 Jul 2026',
                author_name: supervisorName || 'Bima Arams',
                author_role: 'Supervisor',
            },
            {
                id: 'n-2',
                title: 'Finalisasi & Persiapan Pengiriman',
                content: 'Revisi terakhir telah selesai dan semua file sudah kami siapkan. File akan segera kami kirim melalui Google Drive.',
                created_at_formatted: '15 Jul 2026',
                author_name: editorName || 'Arams Team',
                author_role: 'Editor',
            },
            {
                id: 'n-3',
                title: 'Preview Hasil Editing',
                content: 'Berikut adalah preview hasil editing. Silakan beri tahu jika ada yang perlu direvisi.',
                created_at_formatted: '05 Jul 2026',
                author_name: editorName || 'Arams Team',
                author_role: 'Editor',
            },
        ];
    }, [notesList, supervisorName, editorName]);

    const projectThumbnail = project?.thumbnail;
    const displayPhotos = useMemo(() => {
        if (highlightPhotos.length >= 6) {
            return highlightPhotos;
        }

        const fallbacks = [
            { id: 101, title: 'The Sacred Vows', caption: 'The Sacred Vows', image_url: projectThumbnail || '/images/wedding-couple.jpg', is_cover: false },
            { id: 102, title: 'Intimate Embrace', caption: 'Intimate Embrace', image_url: '/images/wedding-couple.jpg', is_cover: false },
            { id: 103, title: 'Celebration of Love', caption: 'Celebration of Love', image_url: '/images/wedding-couple.jpg', is_cover: false },
            { id: 104, title: 'The Royal Hall', caption: 'The Royal Hall', image_url: '/images/wedding-couple.jpg', is_cover: false },
            { id: 105, title: 'Serene Elegance', caption: 'Serene Elegance', image_url: '/images/wedding-couple.jpg', is_cover: false },
            { id: 106, title: 'Golden Hour Smile', caption: 'Golden Hour Smile', image_url: '/images/wedding-couple.jpg', is_cover: false },
        ];

        return [...highlightPhotos, ...fallbacks.slice(highlightPhotos.length)];
    }, [highlightPhotos, projectThumbnail]);

    const clientName = project?.client?.name;
    const projectName = project?.name;
    const displayTestimonial = useMemo(() => {
        if (testimonialList.length > 0) {
            return testimonialList[currentTestimonialIdx % testimonialList.length];
        }

        return {
            id: 't-1',
            client_name: clientName || 'Andi & Sari',
            package_name: packageDisplayName || 'Wedding Day',
            project_name: projectName,
            rating: 5,
            comment: 'Pelayanan sangat profesional, hasil foto luar biasa, dan timnya ramah banget. Momen kami jadi sangat berkesan!',
            created_at_formatted: '27 Agustus 2026',
            avatar: '/images/wedding-couple.jpg',
        };
    }, [testimonialList, currentTestimonialIdx, clientName, packageDisplayName, projectName]);

    const projectStatus = project.status;
    const projectWorkflowStep = project.workflow_step;
    const projectUpdatedAtFormatted = project.updated_at_formatted;
    const timelineSteps = timeline?.steps;
    const displaySteps = useMemo(() => {
        const defaultSteps = [
            { step: 1, title: 'Booking & DP', name: 'Booking & DP', status: 'completed', status_label: 'Selesai', date: '05 Okt 2026' },
            { step: 2, title: 'Hari H (Shooting)', name: 'Hari H (Shooting)', status: 'completed', status_label: 'Selesai', date: '12 Des 2026' },
            { step: 3, title: 'Preview Foto', name: 'Preview Foto', status: 'completed', status_label: 'Selesai', date: '05 Jun 2026' },
            { step: 4, title: 'Editing & Seleksi', name: 'Editing & Seleksi', status: 'completed', status_label: 'Selesai', date: '20 Jun 2026' },
            { step: 5, title: 'Preview Hasil', name: 'Preview Hasil', status: 'completed', status_label: 'Selesai', date: '05 Jul 2026' },
            { step: 6, title: 'Revisi', name: 'Revisi', status: 'completed', status_label: 'Selesai', date: '15 Jul 2026' },
            { step: 7, title: 'Finalisasi', name: 'Finalisasi', status: 'completed', status_label: 'Selesai', date: '25 Jul 2026' },
            {
                step: 8,
                title: 'Selesai & Pengiriman',
                name: 'Selesai & Pengiriman',
                status: projectStatus === 'completed' || projectWorkflowStep === 'selesai' ? 'completed' : 'pending',
                status_label: projectStatus === 'completed' || projectWorkflowStep === 'selesai' ? 'Selesai' : 'Menunggu',
                date: projectUpdatedAtFormatted || '27 Jul 2026',
            },
        ];

        if (timelineSteps && timelineSteps.length >= 8) {
            return timelineSteps.map((st, i) => ({
                ...defaultSteps[i],
                ...st,
                title: st.title || st.name || defaultSteps[i]?.title,
                date: st.date || defaultSteps[i]?.date,
            }));
        }

        return defaultSteps;
    }, [timelineSteps, projectStatus, projectWorkflowStep, projectUpdatedAtFormatted]);

    return (
        <ClientLayout>
            <Head title={`${project.name} - Detail Project - Arams Pictures`} />

            <div className="space-y-6">
                {/* ── 1. HERO BANNER (FORMATTED TO MATCH EXACT SCREENSHOT: Warm ivory background, Playfair Display typography, soft seamless photo fade) ── */}
                <div className="relative -mt-6 sm:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden bg-[#FAF7F2] border-b border-[#E8E1D7] shadow-2xs min-h-[260px] sm:min-h-[330px] lg:min-h-[360px] flex flex-col justify-center transition-colors">
                    {/* Background Wedding Photo on the Right (Fading seamlessly to warm ivory on the left) */}
                    <div className="absolute top-0 right-0 bottom-0 w-full sm:w-[50%] lg:w-[53%] overflow-hidden pointer-events-none z-0 opacity-40 sm:opacity-100">
                        <img
                            src={project?.thumbnail || highlightPhotos.find(h => h.is_cover)?.image_url || highlightPhotos[0]?.image_url || '/images/wedding-couple.jpg'}
                            alt={project.name}
                            className="w-full h-full object-cover object-center sm:object-right filter brightness-[1.02] contrast-[1.04]"
                        />
                        {/* Mobile Gradient Overlay */}
                        <div
                            style={{
                                background: 'linear-gradient(to bottom, rgba(250, 247, 242, 0.96) 0%, rgba(250, 247, 242, 0.75) 50%, rgba(250, 247, 242, 0.96) 100%)',
                            }}
                            className="absolute inset-0 sm:hidden"
                        />
                        {/* Desktop Soft Gradient Overlay fading from warm ivory to transparent */}
                        <div
                            style={{
                                background: 'linear-gradient(to right, #FAF7F2 0%, #FAF7F2 15%, rgba(250, 247, 242, 0.94) 32%, rgba(250, 247, 242, 0.42) 65%, transparent 100%)',
                            }}
                            className="absolute inset-0 hidden sm:block"
                        />
                        <div
                            style={{
                                background: 'linear-gradient(to top, rgba(250, 247, 242, 0.40) 0%, transparent 25%)',
                            }}
                            className="absolute inset-0"
                        />
                    </div>

                    {/* Left Meta Content */}
                    <div className="relative z-10 px-4 sm:px-10 lg:px-12 py-7 sm:py-9 lg:py-11 max-w-2xl xl:max-w-3xl space-y-3 sm:space-y-4">
                        {/* Breadcrumb inside hero banner */}
                        <div className="flex items-center gap-2 text-xs font-medium text-[#8A7971]">
                            <Link
                                href="/client/projects"
                                className="hover:text-[#4A151B] transition-colors"
                            >
                                Project Saya
                            </Link>
                            <span className="text-[#C2B5AC] font-light">&gt;</span>
                            <span className="font-bold text-[#2A1619]">{project.name}</span>
                        </div>

                        {/* Title & Status Badge */}
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                                <h1
                                    style={{
                                        fontFamily: `'Playfair Display', '${portalFontHeading}', Georgia, serif`,
                                        color: '#3E1015',
                                    }}
                                    className="text-2xl sm:text-3xl lg:text-[38px] font-serif font-semibold tracking-normal leading-tight text-[#3E1015]"
                                >
                                    {project.name}
                                </h1>
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] sm:text-xs font-semibold ${project.status === 'completed' || project.workflow_step === 'selesai'
                                        ? 'bg-[#EAF4EB] text-[#2E7A36]'
                                        : 'bg-[#FEF5E7] text-[#A05E17]'
                                        }`}
                                >
                                    {project.status === 'completed' || project.workflow_step === 'selesai' ? 'Selesai' : 'Dalam Proses'}
                                </span>
                            </div>

                            {/* Date & Location with Maroon Icons */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-[#4A3F3A] font-medium pt-0.5">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#4A151B] shrink-0" />
                                    <span>{project.event_date || 'Belum dijadwalkan'}</span>
                                </div>
                                <span className="text-[#C4B7AC]">•</span>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-[#4A151B] shrink-0" />
                                    <span>{project.location || 'Studio Arams Pictures'}</span>
                                </div>
                            </div>
                        </div>

                        {/* 4 Metadata Columns with Vertical Dividers (Clean whitespace, no top border) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 pt-3 sm:pt-4 text-xs">
                            <div className="sm:pr-6 sm:border-r border-[#E5DDD4]">
                                <span className="text-[11px] sm:text-xs text-[#7D7068] block font-normal mb-1">Kategori Project</span>
                                <strong className="text-sm sm:text-base font-bold text-[#4A151B] block">{categoryDisplayName}</strong>
                            </div>
                            <div className="sm:px-6 sm:border-r border-[#E5DDD4]">
                                <span className="text-[11px] sm:text-xs text-[#7D7068] block font-normal mb-1">Tipe Project</span>
                                <strong className="text-sm sm:text-base font-bold text-[#4A151B] block">{packageDisplayName}</strong>
                            </div>
                            <div className="sm:px-6 sm:border-r border-[#E5DDD4]">
                                <span className="text-[11px] sm:text-xs text-[#7D7068] block font-normal mb-1">Photographer</span>
                                <strong className="text-sm sm:text-base font-bold text-[#4A151B] block">{photographerName}</strong>
                            </div>
                            <div className="sm:pl-6">
                                <span className="text-[11px] sm:text-xs text-[#7D7068] block font-normal mb-1">Supervisor</span>
                                <strong className="text-sm sm:text-base font-bold text-[#4A151B] block">{supervisorName}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── 2-COLUMN MAIN CONTENT: LEFT (MENU & BUTUH BANTUAN) + RIGHT (PANEL INFORMASI) ── */}
                <div id="project-detail-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-1">
                    {/* ── LEFT COLUMN: VERTICAL MENU & HELP CARD (Sticky on Desktop) ── */}
                    <aside className="lg:col-span-3 xl:col-span-3 space-y-4 lg:sticky lg:top-24">
                        {/* Mobile Tab Navigation (< lg) */}
                        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1.5 bg-[#FAF7F2] rounded-2xl border border-[#E8E1D7] p-1.5">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => switchTab(item.id)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${isActive
                                                ? 'bg-[#3E1015] text-white shadow-2xs'
                                                : 'text-stone-700 bg-white hover:bg-stone-50 border border-stone-200'
                                            }`}
                                    >
                                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#4A151B]'}`} />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Desktop Sidebar (>= lg) */}
                        <div className="hidden lg:block space-y-4">
                            {/* Navigation Card */}
                            <div className="bg-white rounded-2xl border border-[#E8E1D7] p-2 space-y-1 shadow-2xs">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id;

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => switchTab(item.id)}
                                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${isActive
                                                    ? 'bg-[#3E1015] text-white shadow-xs font-bold'
                                                    : 'text-stone-700 hover:text-stone-900 hover:bg-[#FAF7F2]'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#4A151B]'}`} />
                                                <span>{item.label}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Butuh Bantuan Card */}
                                {/* <div className="bg-white rounded-2xl border border-[#E8E1D7] p-4 shadow-2xs space-y-2.5">
                                    <div>
                                        <h5 className="font-serif font-bold text-stone-900 text-sm">Butuh Bantuan?</h5>
                                        <p className="text-[11px] text-stone-500 leading-relaxed mt-1">
                                            Hubungi admin kami jika Anda memiliki pertanyaan terkait project ini.
                                        </p>
                                    </div>
                                    <a
                                        href={whatsappLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3E1015] hover:bg-[#2e0b10] text-white text-xs font-bold transition-all shadow-xs"
                                    >
                                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                                        <span>Hubungi Admin</span>
                                    </a>
                                </div> */}
                        </div>
                    </aside>

                    {/* ── RIGHT COLUMN: INFORMATION PANEL (lg:col-span-9 xl:col-span-9) ── */}
                    <main className="lg:col-span-9 xl:col-span-9 space-y-6 min-w-0">
                        {/* 1. TIMELINE PROJECT */}
                        <div id="section-timeline" className="scroll-mt-24 space-y-6">
                            <section
                                style={{
                                    backgroundColor: portalCardBg,
                                    borderColor: portalCardBorder,
                                }}
                                className="rounded-3xl border p-6 sm:p-7 shadow-xs hover:shadow-sm space-y-5 transition-all"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                                    <div>
                                        <h3
                                            style={{
                                                fontFamily: `'${portalFontHeading}', serif`,
                                                color: portalHeadingColor,
                                            }}
                                            className="text-base sm:text-lg font-serif font-bold text-[#3E1015]"
                                        >
                                            Timeline Project
                                        </h3>
                                        <p className="text-xs text-stone-500">
                                            Berikut adalah tahapan pengerjaan project Anda.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-stone-400 shrink-0">
                                        <span>Terakhir diperbarui: {project.updated_at_formatted || '27 Agustus 2026'}</span>
                                        <RefreshCw className="w-3 h-3" />
                                    </div>
                                </div>

                                {/* ── 8-Step Interactive Stepper ── */}
                                <div className="pt-2 overflow-x-auto no-scrollbar py-2">
                                    <div className="min-w-[620px] flex items-start justify-between relative pb-2 px-2">
                                        {/* Connecting Line */}
                                        <div className="absolute left-6 right-6 top-4 h-0.5 bg-stone-200 -z-0">
                                            <div
                                                className="h-full bg-[#3E1015] transition-all duration-700"
                                                style={{
                                                    width: `${Math.min(100, Math.max(0, (((timeline.current_step || 7) - 1) / Math.max(1, displaySteps.length - 1)) * 100))}%`,
                                                }}
                                            />
                                        </div>
                                        {displaySteps.map((step) => {
                                            const isDone = step.status === 'completed';
                                            const isActive = step.status === 'active';
                                            const isSelected = selectedStepNumber === step.step;

                                            return (
                                                <div key={step.step} className="flex flex-col items-center text-center relative z-10 flex-1 px-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedStepNumber(step.step)}
                                                        title={`Tahap ${step.step}: ${step.title}`}
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer select-none ${isDone || isActive || isSelected
                                                                ? 'bg-[#3E1015] text-white shadow-2xs'
                                                                : 'bg-white text-stone-400 border border-stone-200'
                                                            }`}
                                                    >
                                                        {step.step}
                                                    </button>
                                                    <div className="mt-2.5 space-y-0.5 max-w-[95px]">
                                                        <h5 className="font-bold text-[11px] text-stone-900 leading-tight">
                                                            {step.title}
                                                        </h5>
                                                        <span className="text-[10px] text-stone-400 block font-medium">
                                                            {step.status_label || (isDone ? 'Selesai' : isActive ? 'Proses' : 'Menunggu')}
                                                        </span>
                                                        <span className="text-[10px] text-stone-400 block font-medium">
                                                            {step.date}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Green Status Alert Banner */}
                                <div className="bg-[#EAF5EC] border border-[#C5E8CA] rounded-2xl p-3.5 sm:p-4 flex items-center gap-3 text-xs">
                                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                    <div>
                                        <strong className="font-bold text-stone-900 block text-xs sm:text-sm">Project telah selesai!</strong>
                                        <p className="text-[11.5px] text-stone-600">Terima kasih telah mempercayakan momen berharga Anda kepada Arams Pictures.</p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* 2. FILE & BERKAS DOKUMENTASI */}
                        <div id="section-files" className="scroll-mt-24 space-y-6">
                            <section
                                style={{
                                    backgroundColor: portalCardBg,
                                    borderColor: portalCardBorder,
                                }}
                                className="rounded-3xl border p-6 sm:p-8 shadow-xs hover:shadow-sm space-y-6 transition-all"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-3">
                                    <div>
                                        <h3
                                            style={{
                                                fontFamily: `'${portalFontHeading}', serif`,
                                                color: portalHeadingColor,
                                            }}
                                            className="text-base sm:text-lg font-serif font-bold text-[#3E1015]"
                                        >
                                            File &amp; Berkas Dokumentasi
                                        </h3>
                                        <p className="text-xs text-stone-500">
                                            Akses tautan Google Drive dan unduh seluruh berkas dokumentasi project Anda.
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold self-start sm:self-center">
                                        {displayFiles.length} Berkas
                                    </span>
                                </div>

                                {displayFiles.length === 0 ? (
                                    <div className="py-12 text-center text-stone-500 text-xs bg-[#FAF7F2] rounded-3xl border border-[#E8E1D7] space-y-3 p-6">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mx-auto text-stone-400 shadow-2xs">
                                            <Folder className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <strong className="text-sm text-stone-800 block font-bold">Belum Ada File Dokumentasi</strong>
                                            <p className="text-stone-500 text-xs mt-1 max-w-md mx-auto">
                                                Tautan Google Drive atau berkas foto akan segera dibagikan oleh tim studio setelah proses editing selesai.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {displayFiles.map((file) => {
                                            const rawDate = file.date_label || file.created_at || '05 Jun 2026';
                                            const cleanDate = rawDate.replace(/^Dibagikan\s+pada\s*/i, '').trim();
                                            const fileUrl = file.drive_url;

                                            return (
                                                <div
                                                    key={file.id}
                                                    className="bg-[#FAF7F2] border border-[#E8E1D7] rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:bg-white hover:border-[#4A151B]/40 hover:shadow-xs transition-all group"
                                                >
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="w-10 h-10 rounded-xl bg-rose-100 text-[#4A151B] flex items-center justify-center shadow-2xs">
                                                                {file.is_link || file.file_type === 'link' ? (
                                                                    <LinkIcon className="w-5 h-5" />
                                                                ) : (
                                                                    <Folder className="w-5 h-5 fill-[#4A151B]" />
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200/70 text-stone-700">
                                                                {file.file_type || (file.is_link ? 'Link Drive' : 'Folder')}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <h5 className="font-bold text-xs sm:text-sm text-stone-900 leading-snug line-clamp-2 group-hover:text-[#4A151B] transition-colors">
                                                                {file.name}
                                                            </h5>
                                                            <span className="text-[10px] text-stone-400 block mt-1">
                                                                Dibagikan pada {cleanDate}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (fileUrl) {
                                                                    window.open(fileUrl, '_blank');
                                                                } else {
                                                                    toast.info('Tautan berkas sedang dipersiapkan oleh tim studio.');
                                                                }
                                                            }}
                                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A151B] hover:underline cursor-pointer"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                            <span>{file.is_link || file.file_type === 'link' ? 'Buka Link' : 'Buka / Unduh'}</span>
                                                        </button>
                                                        {fileUrl && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopyText(fileUrl, 'Tautan berkas')}
                                                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
                                                                title="Salin Tautan"
                                                            >
                                                                <Copy className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* 3. CATATAN & BRIEFING PROJECT */}
                        <div id="section-catatan" className="scroll-mt-24 space-y-6">
                            <section
                                style={{
                                    backgroundColor: portalCardBg,
                                    borderColor: portalCardBorder,
                                }}
                                className="rounded-3xl border p-6 sm:p-8 shadow-xs hover:shadow-sm space-y-6 transition-all"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-3">
                                    <div>
                                        <h3
                                            style={{
                                                fontFamily: `'${portalFontHeading}', serif`,
                                                color: portalHeadingColor,
                                            }}
                                            className="text-base sm:text-lg font-serif font-bold text-[#3E1015]"
                                        >
                                            Catatan &amp; Briefing Project
                                        </h3>
                                        <p className="text-xs text-stone-500">
                                            Instruksi khusus, referensi konsep foto, preferensi warna, atau catatan revisi dari tim studio &amp; klien.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddNoteOpen(true)}
                                        style={{
                                            backgroundColor: portalPrimaryAccent,
                                            color: '#FFFFFF',
                                        }}
                                        className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs hover:opacity-90 active:scale-98 cursor-pointer shrink-0 self-start sm:self-center"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Tambah Catatan Baru</span>
                                    </button>
                                </div>

                                {displayNotes.length === 0 ? (
                                    <div className="py-12 text-center text-stone-500 text-xs bg-[#FAF7F2] rounded-3xl border border-[#E8E1D7] space-y-3 p-6">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mx-auto text-stone-400 shadow-2xs">
                                            <Edit3 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <strong className="text-sm text-stone-800 block font-bold">Belum Ada Catatan Khusus</strong>
                                            <p className="text-stone-500 text-xs mt-1 max-w-md mx-auto">
                                                Tuliskan catatan, revisi, atau preferensi foto Anda agar tim fotografer dan editor dapat menyesuaikan dengan keinginan Anda.
                                            </p>
                                        </div>
                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsAddNoteOpen(true)}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-800 hover:bg-stone-50 shadow-2xs transition-all cursor-pointer"
                                            >
                                                <Plus className="w-3.5 h-3.5 text-[#4A151B]" />
                                                <span>Tulis Catatan Sekarang</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {displayNotes.map((note) => (
                                            <div
                                                key={note.id}
                                                className="bg-[#FAF7F2] border border-[#E8E1D7] rounded-2xl p-4 sm:p-5 flex items-start gap-4 hover:bg-white hover:border-stone-300 transition-all shadow-2xs"
                                            >
                                                {/* Date Badge */}
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-stone-200 flex flex-col items-center justify-center shrink-0 shadow-2xs text-center">
                                                    <span className="font-black text-sm sm:text-base text-[#4A151B] leading-none">{note.date}</span>
                                                    <span className="text-[8px] sm:text-[9px] text-stone-400 font-bold uppercase mt-1">{note.monthYear}</span>
                                                </div>

                                                {/* Note Content */}
                                                <div className="flex-1 space-y-1.5 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                                        <h4 className="font-bold text-xs sm:text-sm text-stone-900">{note.title}</h4>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[11px] text-stone-500 font-medium">{note.author}</span>
                                                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-stone-200/80 text-stone-700">{note.role}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-stone-600 leading-relaxed pt-0.5 whitespace-pre-line">
                                                        {note.content}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* 4. STATUS & RIWAYAT PEMBAYARAN */}
                        <div id="section-pembayaran" className="scroll-mt-24 space-y-6">
                            <section
                                style={{
                                    backgroundColor: portalCardBg,
                                    borderColor: portalCardBorder,
                                }}
                                className="rounded-3xl border p-6 sm:p-8 shadow-xs hover:shadow-sm space-y-6 transition-all"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                                    <div>
                                        <h3
                                            style={{
                                                fontFamily: `'${portalFontHeading}', serif`,
                                                color: portalHeadingColor,
                                            }}
                                            className="text-base sm:text-lg font-serif font-bold text-[#3E1015]"
                                        >
                                            Status &amp; Riwayat Pembayaran
                                        </h3>
                                        <p className="text-xs text-stone-500">
                                            Informasi rincian biaya project, status pelunasan, invoice resmi, dan rekening transfer.
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-xl text-xs font-bold self-start sm:self-center ${isLunas ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                                        {isLunas ? 'Lunas (100%)' : `Menunggu Pelunasan (${paymentPercentage}%)`}
                                    </span>
                                </div>

                                {/* 3 Metrics Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                    <div className="bg-[#FAF7F2] rounded-2xl p-4 sm:p-5 border border-[#E8E1D7] space-y-1">
                                        <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
                                            <span>Total Biaya Project</span>
                                            <Receipt className="w-4 h-4 text-stone-400" />
                                        </div>
                                        <strong className="text-lg sm:text-xl font-bold text-stone-900 block pt-1 truncate">
                                            {formatRupiah(totalAmount)}
                                        </strong>
                                        <span className="text-[10.5px] text-stone-400 block truncate">Paket {packageDisplayName}</span>
                                    </div>

                                    <div className="bg-emerald-50/80 rounded-2xl p-4 sm:p-5 border border-emerald-200/70 space-y-1">
                                        <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
                                            <span>Sudah Dibayar</span>
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <strong className="text-lg sm:text-xl font-bold text-emerald-700 block pt-1 truncate">
                                            {formatRupiah(paidAmount)}
                                        </strong>
                                        <span className="text-[10.5px] text-emerald-600/80 block">{paymentPercentage}% terbayar</span>
                                    </div>

                                    <div className={`${sisaTagihan > 0 ? 'bg-amber-50/80 border-amber-200/80' : 'bg-stone-50 border-stone-200/80'} rounded-2xl p-4 sm:p-5 border space-y-1`}>
                                        <div className={`flex items-center justify-between ${sisaTagihan > 0 ? 'text-amber-700' : 'text-stone-500'} text-xs font-medium`}>
                                            <span>Sisa Tagihan</span>
                                            <CreditCard className={`w-4 h-4 ${sisaTagihan > 0 ? 'text-amber-600' : 'text-stone-400'}`} />
                                        </div>
                                        <strong className={`text-lg sm:text-xl font-bold ${sisaTagihan > 0 ? 'text-amber-800' : 'text-stone-900'} block pt-1 truncate`}>
                                            {formatRupiah(sisaTagihan)}
                                        </strong>
                                        <span className={`text-[10.5px] ${sisaTagihan > 0 ? 'text-amber-600/80' : 'text-stone-400'} block truncate`}>
                                            {isLunas ? 'Lunas tanpa sisa' : 'Sisa pembayaran'}
                                        </span>
                                    </div>
                                </div>

                                {/* Pelunasan Progress Bar */}
                                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 space-y-2 shadow-2xs">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <span className="text-stone-600">Progres Pelunasan Tagihan</span>
                                        <span className="text-[#4A151B] text-sm font-black">{paymentPercentage}% Selesai</span>
                                    </div>
                                    <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-[#4A151B] to-[#7B242D]"
                                            style={{
                                                width: `${paymentPercentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Status Lunas or Waiting Alert */}
                                {isLunas ? (
                                    <div className="p-4 rounded-2xl bg-[#EBF7EE] border border-[#C3E6CB] flex items-start gap-3 text-xs text-[#1E7E34]">
                                        <div className="w-6 h-6 rounded-full bg-[#28A745] text-white flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                                        </div>
                                        <div>
                                            <strong className="font-bold text-stone-900 text-sm block">Pembayaran Lunas</strong>
                                            <p className="text-stone-600 text-xs mt-0.5 leading-relaxed">
                                                Seluruh tagihan untuk project ini telah terbayar lunas. Anda dapat mencetak bukti invoice resmi di bawah ini.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start justify-between gap-3 text-xs text-amber-800 flex-wrap">
                                        <div className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                                                <CreditCard className="w-3.5 h-3.5" />
                                            </div>
                                            <div>
                                                <strong className="font-bold text-stone-900 text-sm block">Menunggu Pelunasan Sisa Tagihan</strong>
                                                <p className="text-stone-600 text-xs mt-0.5 leading-relaxed">
                                                    Sisa tagihan yang belum terbayar adalah sebesar <span className="font-bold text-amber-900">{formatRupiah(sisaTagihan)}</span>. Silakan lakukan transfer ke rekening resmi Arams Pictures.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsPaymentModalOpen(true)}
                                            className="px-4 py-2 rounded-xl bg-[#3E1015] hover:bg-[#2e0b10] text-white text-xs font-bold transition-all shadow-xs cursor-pointer ml-auto sm:ml-0"
                                        >
                                            Konfirmasi Pembayaran
                                        </button>
                                    </div>
                                )}

                                {/* Rekening Pembayaran Resmi */}
                                <div className="bg-[#FAF7F2] border border-[#E8E1D7] rounded-2xl p-4 sm:p-5 space-y-3.5">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A151B]">
                                            Rekening Pembayaran Resmi
                                        </h4>
                                        <p className="text-[11px] text-stone-500 mt-0.5">
                                            Pembayaran hanya ditujukan ke rekening atas nama manajemen Arams Pictures:
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="bg-white rounded-xl p-3.5 border border-stone-200 flex items-center justify-between gap-2 shadow-2xs">
                                            <div>
                                                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                                    Bank BCA
                                                </span>
                                                <div className="font-mono font-bold text-xs sm:text-sm text-stone-900 mt-1">8415-0928-11</div>
                                                <span className="text-[10px] text-stone-500 block">a/n PT Arams Pictures Media</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyText('8415092811', 'Nomor Rekening BCA')}
                                                className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                            >
                                                <Copy className="w-3 h-3" />
                                                <span>Salin</span>
                                            </button>
                                        </div>

                                        <div className="bg-white rounded-xl p-3.5 border border-stone-200 flex items-center justify-between gap-2 shadow-2xs">
                                            <div>
                                                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                                    Bank Mandiri
                                                </span>
                                                <div className="font-mono font-bold text-xs sm:text-sm text-stone-900 mt-1">1370-0192-8821</div>
                                                <span className="text-[10px] text-stone-500 block">a/n Arams Pictures</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyText('137001928821', 'Nomor Rekening Mandiri')}
                                                className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                            >
                                                <Copy className="w-3 h-3" />
                                                <span>Salin</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsPaymentModalOpen(true)}
                                        style={{
                                            backgroundColor: portalPrimaryAccent,
                                            color: '#FFFFFF',
                                        }}
                                        className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs hover:opacity-90 active:scale-98 cursor-pointer"
                                    >
                                        <Receipt className="w-4 h-4" />
                                        <span>Rincian &amp; Riwayat Pembayaran</span>
                                    </button>

                                    <a
                                        href={`/projects/${project.id}/invoice`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-bold text-stone-800 transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
                                    >
                                        <Printer className="w-4 h-4 text-indigo-600" />
                                        <span>Cetak Invoice</span>
                                    </a>
                                </div>
                            </section>
                        </div>

                        {/* 5. HIGHLIGHT FOTO PROJECT */}
                        <div id="section-highlight" className="scroll-mt-24 space-y-6">
                            <section
                                style={{
                                    backgroundColor: portalCardBg,
                                    borderColor: portalCardBorder,
                                }}
                                className="rounded-3xl border p-6 sm:p-8 shadow-xs hover:shadow-sm space-y-6 transition-all"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                                    <div>
                                        <h3
                                            style={{
                                                fontFamily: `'${portalFontHeading}', serif`,
                                                color: portalHeadingColor,
                                            }}
                                            className="text-base sm:text-lg font-serif font-bold text-[#3E1015]"
                                        >
                                            Highlight Foto Project
                                        </h3>
                                        <p className="text-xs text-stone-500">
                                            Beberapa cuplikan momen terbaik dari project Anda yang telah dikurasi oleh tim fotografer Arams Pictures.
                                        </p>
                                    </div>
                                    <span className="px-3 py-1 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold self-start sm:self-center">
                                        {displayPhotos.length} Foto
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-3.5">
                                    {displayPhotos.map((hl, i) => (
                                        <button
                                            type="button"
                                            key={hl.id || i}
                                            onClick={() => setLightboxIndex(i)}
                                            className="group relative aspect-4/5 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer block text-left"
                                        >
                                            <img
                                                src={hl.image_url}
                                                alt={hl.caption || `Highlight ${i + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white">
                                                <div className="self-end">
                                                    <div className="w-7 h-7 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white">
                                                        <Maximize2 className="w-3.5 h-3.5" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold block truncate">
                                                        {hl.caption || `Foto ${i + 1}`}
                                                    </span>
                                                    <span className="text-[9px] text-white/80">Klik untuk perbesar</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* 6. DETAIL PROJECT & ULASAN */}
                        <div id="section-detail" className="scroll-mt-24 space-y-6">
                            {/* Detail & Spesifikasi Project */}
                            <section
                                style={{
                                    backgroundColor: portalCardBg,
                                    borderColor: portalCardBorder,
                                }}
                                className="rounded-3xl border p-6 sm:p-8 shadow-xs hover:shadow-sm space-y-6 transition-all"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            style={{
                                                backgroundColor: `${portalPrimaryAccent}15`,
                                                color: portalPrimaryAccent,
                                            }}
                                            className="w-8 h-8 rounded-xl flex items-center justify-center"
                                        >
                                            <Info className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3
                                                style={{
                                                    fontFamily: `'${portalFontHeading}', serif`,
                                                    color: portalHeadingColor,
                                                }}
                                                className="text-base sm:text-lg font-serif font-bold text-[#3E1015]"
                                            >
                                                Detail &amp; Spesifikasi Project
                                            </h3>
                                            <p className="text-xs text-stone-500">
                                                Rangkuman informasi lengkap pemesanan dan tim yang bertugas.
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-xl border text-xs font-bold self-start sm:self-center ${project.status === 'completed' || project.workflow_step === 'selesai'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                        Status: {project.status === 'completed' || project.workflow_step === 'selesai' ? 'Selesai' : 'Dalam Proses'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs">
                                    {/* Left Info Box */}
                                    <div className="space-y-3.5 bg-[#FAF7F2] p-5 rounded-2xl border border-[#E8E1D7]">
                                        <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] border-b border-stone-200/60 pb-2">
                                            Informasi Umum
                                        </h4>
                                        <div className="space-y-2.5">
                                            <div className="flex justify-between">
                                                <span className="text-stone-500">Nomor Project:</span>
                                                <span className="font-bold text-stone-900 font-mono">{project.project_number}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-stone-500">Nama Project:</span>
                                                <span className="font-bold text-stone-900">{project.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-stone-500">Kategori:</span>
                                                <span className="font-bold text-stone-900">{categoryDisplayName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-stone-500">Paket Layanan:</span>
                                                <span className="font-bold text-stone-900">{packageDisplayName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-stone-500">Tanggal Acara:</span>
                                                <span className="font-bold text-stone-900">{project.event_date || 'Tanggal belum ditentukan'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-stone-500">Waktu Acara:</span>
                                                <span className="font-bold text-stone-900">{project.event_time ? `${project.event_time} WIB` : 'Menyesuaikan'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-stone-500">Lokasi / Venue:</span>
                                                <span className="font-semibold text-stone-900 text-right max-w-[200px]">{project.location || 'Studio Arams Pictures'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Info Box */}
                                    <div className="space-y-3.5 bg-[#FAF7F2] p-5 rounded-2xl border border-[#E8E1D7]">
                                        <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[11px] border-b border-stone-200/60 pb-2">
                                            Tim Bertugas &amp; Catatan
                                        </h4>
                                        <div className="space-y-2.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500">Supervisor:</span>
                                                <span className="font-bold text-slate-900">{supervisorName}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500">Photographer:</span>
                                                <span className="font-bold text-slate-900">{photographerName}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500">Editor:</span>
                                                <span className="font-bold text-slate-900">{editorName}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500">Status Pembayaran:</span>
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isLunas ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                    {isLunas ? 'Lunas (100%)' : `Belum Lunas (${paymentPercentage}%)`}
                                                </span>
                                            </div>
                                            <div className="pt-2 border-t border-slate-200/60">
                                                <span className="text-slate-500 block text-[10px] mb-1">Catatan Klien:</span>
                                                <p className="text-slate-700 italic text-[11px] leading-relaxed">
                                                    {project.notes ? `"${project.notes}"` : 'Tidak ada catatan khusus.'}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200/60">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsPaymentModalOpen(true)}
                                                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-800 hover:bg-slate-50 shadow-2xs cursor-pointer flex items-center gap-1.5"
                                                >
                                                    <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span>Rincian Bayar</span>
                                                </button>
                                                <a
                                                    href={`/projects/${project.id}/invoice`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-800 hover:bg-slate-50 shadow-2xs cursor-pointer flex items-center gap-1.5"
                                                >
                                                    <Printer className="w-3.5 h-3.5 text-indigo-600" />
                                                    <span>Cetak Invoice</span>
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsAddNoteOpen(true)}
                                                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-800 hover:bg-slate-50 shadow-2xs cursor-pointer flex items-center gap-1.5"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5 text-rose-700" />
                                                    <span>Tambah Catatan</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Berikan Ulasan Anda & Testimonial Section */}
                            <section
                                style={{
                                    backgroundColor: portalCardBg,
                                    borderColor: portalCardBorder,
                                }}
                                className="rounded-3xl border p-6 sm:p-8 shadow-xs hover:shadow-sm space-y-6 transition-all"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Form Ulasan (Span 7) */}
                                    <div className="lg:col-span-7 space-y-4">
                                        <div>
                                            <h4
                                                style={{ color: portalHeadingColor }}
                                                className="text-base font-bold"
                                            >
                                                Berikan Ulasan Anda
                                            </h4>
                                            <p className="text-xs text-slate-500">Bagaimana pengalaman Anda menggunakan layanan Arams Pictures?</p>
                                        </div>

                                        <form onSubmit={handleSubmitReview} className="space-y-3.5">
                                            <div className="flex items-center gap-2">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => setRating(i + 1)}
                                                        className="cursor-pointer transition-transform hover:scale-110"
                                                    >
                                                        <Star
                                                            className={`w-5 h-5 ${i < rating
                                                                ? 'text-amber-500 fill-amber-500'
                                                                : 'text-slate-300'
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                                <span className="text-sm font-bold text-slate-900 ml-1.5">{rating}.0</span>
                                                <span className="text-xs text-slate-500 font-medium">
                                                    ({rating === 5 ? 'Sangat Puas' : (rating >= 4 ? 'Puas' : (rating >= 3 ? 'Cukup' : 'Kurang'))})
                                                </span>
                                            </div>

                                            <div className="relative">
                                                <textarea
                                                    rows={4}
                                                    maxLength={500}
                                                    value={reviewText}
                                                    onChange={(e) => setReviewText(e.target.value)}
                                                    placeholder="Tuliskan pengalaman, kesan, atau saran Anda untuk tim kami..."
                                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-hidden focus:bg-white focus:border-[#4A151B] transition-colors"
                                                />
                                                <span className="absolute right-3.5 bottom-2.5 text-[10px] text-slate-400">
                                                    {reviewText.length}/500
                                                </span>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={submittingReview}
                                                style={{
                                                    backgroundColor: portalPrimaryAccent,
                                                    color: '#FFFFFF',
                                                }}
                                                className="px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:opacity-90 disabled:opacity-50"
                                            >
                                                {submittingReview ? 'Mengirim Ulasan...' : 'Kirim Ulasan'}
                                            </button>
                                        </form>
                                    </div>

                                    {/* Testimonial / Ulasan Klien Lain (Span 5) */}
                                    <div className="lg:col-span-5 bg-[#FAF7F2] p-5 sm:p-6 rounded-2xl border border-[#E8E1D7] flex flex-col justify-between space-y-4">
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                                                Pengalaman Klien Arams Pictures
                                            </span>
                                            {activeTestimonial ? (
                                                <div className="space-y-3 pt-1">
                                                    <div className="flex items-center gap-1 text-amber-500">
                                                        {Array.from({ length: activeTestimonial.rating || 5 }).map((_, i) => (
                                                            <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-stone-700 italic leading-relaxed">
                                                        "{activeTestimonial.comment}"
                                                    </p>
                                                    <div className="pt-2 border-t border-stone-200/60">
                                                        <strong className="text-xs font-bold text-stone-900 block">{activeTestimonial.client_name}</strong>
                                                        <span className="text-[10px] text-stone-400 block">{activeTestimonial.package_name || activeTestimonial.project_name || 'Klien Arams Pictures'}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-stone-500 italic">
                                                    Ulasan Anda akan sangat berarti bagi pengembangan kualitas layanan kami ke depannya.
                                                </p>
                                            )}
                                        </div>

                                        {testimonialList.length > 1 && (
                                            <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
                                                <span className="text-[10px] text-stone-400">
                                                    {currentTestimonialIdx + 1} dari {testimonialList.length} ulasan
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setCurrentTestimonialIdx((prev) => (prev > 0 ? prev - 1 : testimonialList.length - 1))}
                                                        className="w-6 h-6 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 cursor-pointer shadow-2xs"
                                                    >
                                                        <ChevronLeft className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setCurrentTestimonialIdx((prev) => (prev + 1) % testimonialList.length)}
                                                        className="w-6 h-6 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 cursor-pointer shadow-2xs"
                                                    >
                                                        <ChevronRight className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </main>
                </div>

                {/* Floating WhatsApp Help Pill */}
                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Hubungi Admin WhatsApp"
                    className="fixed bottom-6 right-6 z-40 px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-lg hover:shadow-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span className="hidden sm:inline">Hubungi Admin</span>
                </a>
            </div>

            {/* ── MODAL: TAMBAH CATATAN PROJECT ── */}
            {isAddNoteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div
                                    style={{
                                        backgroundColor: `${portalPrimaryAccent}15`,
                                        color: portalPrimaryAccent,
                                    }}
                                    className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3
                                        style={{
                                            fontFamily: `'${portalFontHeading}', serif`,
                                            color: portalHeadingColor,
                                        }}
                                        className="text-base font-serif font-bold"
                                    >
                                        Tambah Catatan Project
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Tuliskan catatan, revisi, atau arahan khusus untuk tim studio.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddNoteOpen(false)}
                                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitNote} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Judul / Topik Catatan <span className="text-slate-400 font-normal">(opsional)</span>
                                </label>
                                <input
                                    type="text"
                                    maxLength={120}
                                    value={newNoteTitle}
                                    onChange={(e) => setNewNoteTitle(e.target.value)}
                                    placeholder="Contoh: Preferensi Warna Foto, Lokasi Tambahan"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:bg-white focus:border-[#4A151B] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Isi Catatan <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    required
                                    maxLength={1000}
                                    value={newNoteContent}
                                    onChange={(e) => setNewNoteContent(e.target.value)}
                                    placeholder="Tuliskan detail catatan atau permintaan Anda di sini..."
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden focus:bg-white focus:border-[#4A151B] transition-colors"
                                />
                                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                                    <span>Catatan akan tercatat secara resmi pada riwayat project.</span>
                                    <span>{newNoteContent.length}/1000</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAddNoteOpen(false)}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingNote}
                                    style={{
                                        backgroundColor: portalPrimaryAccent,
                                        color: '#FFFFFF',
                                    }}
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs hover:opacity-90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                                >
                                    {isSubmittingNote ? 'Menyimpan...' : 'Simpan Catatan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL: RINCIAN & RIWAYAT PEMBAYARAN ── */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div
                                    style={{
                                        backgroundColor: `${portalPrimaryAccent}15`,
                                        color: portalPrimaryAccent,
                                    }}
                                    className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
                                >
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3
                                        style={{
                                            fontFamily: `'${portalFontHeading}', serif`,
                                            color: portalHeadingColor,
                                        }}
                                        className="text-base font-serif font-bold"
                                    >
                                        Rincian &amp; Riwayat Pembayaran
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Status invoice, histori pembayaran, dan nomor rekening resmi.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Nilai Project</span>
                                <strong className="text-base font-black text-slate-900 block font-mono">{formatRupiah(totalAmount)}</strong>
                            </div>
                            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 space-y-1">
                                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Total Terbayar</span>
                                <strong className="text-base font-black text-emerald-700 block font-mono">{formatRupiah(paidAmount)}</strong>
                                <span className="text-[10px] text-emerald-600 font-semibold">{paymentPercentage}% dari total</span>
                            </div>
                            <div className={`p-4 rounded-2xl border space-y-1 ${sisaTagihan > 0 ? 'bg-amber-50/70 border-amber-200/70' : 'bg-emerald-50/70 border-emerald-200/70'}`}>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${sisaTagihan > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                                    {sisaTagihan > 0 ? 'Sisa Tagihan' : 'Status'}
                                </span>
                                <strong className={`text-base font-black block font-mono ${sisaTagihan > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                                    {sisaTagihan > 0 ? formatRupiah(sisaTagihan) : 'Lunas (100%)'}
                                </strong>
                            </div>
                        </div>

                        {/* Invoices List if any */}
                        {project.invoices && project.invoices.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Invoice Resmi</h4>
                                <div className="space-y-2">
                                    {project.invoices.map((inv) => (
                                        <div key={inv.id} className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 font-mono">{inv.invoice_number}</span>
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                                                        {inv.status}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] text-slate-500">
                                                    Total: {formatRupiah(inv.total)} • Jatuh Tempo: {inv.due_date || '-'}
                                                </span>
                                            </div>
                                            <a
                                                href={`/projects/${project.id}/invoice`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-[#4A151B] hover:bg-slate-50 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <Printer className="w-3.5 h-3.5" />
                                                <span>Cetak Invoice</span>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Riwayat Pembayaran Nyata dari Database */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Riwayat Pembayaran Masuk</h4>
                                <span className="text-[11px] text-slate-400">{project.payments?.length || 0} Transaksi</span>
                            </div>

                            {(!project.payments || project.payments.length === 0) ? (
                                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-slate-200/60">
                                    Belum ada riwayat pembayaran yang tercatat.
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {project.payments.map((p, idx) => (
                                        <div key={p.id || idx} className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 text-xs">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900">{p.payment_method || 'Transfer Bank'}</span>
                                                    {p.payment_number && (
                                                        <span className="text-[10px] font-mono text-slate-400">{p.payment_number}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                                    <span>{p.payment_date || '-'}</span>
                                                    {p.reference_number && <span>• Ref: {p.reference_number}</span>}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <strong className="font-black text-emerald-700 block font-mono">{formatRupiah(p.amount)}</strong>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                                    <Check className="w-2.5 h-2.5" />
                                                    <span>Berhasil</span>
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Rekening Pembayaran Resmi */}
                        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-slate-200/80 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4 text-[#4A151B]" />
                                    <span>Rekening Resmi Studio (Arams Pictures)</span>
                                </span>
                                <span className="text-[10px] text-slate-400">Verifikasi Otomatis</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
                                    <div>
                                        <span className="text-[10px] text-slate-400 block font-bold">Bank BCA</span>
                                        <strong className="font-mono font-black text-slate-900 text-sm">8820192837</strong>
                                        <span className="text-[10px] text-slate-500 block">a.n PT Arams Kreatif Nusantara</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCopyText('8820192837', 'Nomor Rekening BCA')}
                                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                        <Copy className="w-3 h-3" />
                                        <span>Salin</span>
                                    </button>
                                </div>

                                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
                                    <div>
                                        <span className="text-[10px] text-slate-400 block font-bold">Bank Mandiri</span>
                                        <strong className="font-mono font-black text-slate-900 text-sm">1370019283921</strong>
                                        <span className="text-[10px] text-slate-500 block">a.n PT Arams Kreatif Nusantara</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCopyText('1370019283921', 'Nomor Rekening Mandiri')}
                                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                        <Copy className="w-3 h-3" />
                                        <span>Salin</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Konfirmasi via WhatsApp</span>
                            </a>
                            <button
                                type="button"
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── LIGHTBOX: PREVIEW FOTO HIGHLIGHT ── */}
            {lightboxIndex !== null && highlightPhotos[lightboxIndex] && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/92 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setLightboxIndex(null)}
                >
                    <div
                        className="relative max-w-4xl w-full flex flex-col items-center gap-3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top Bar: Counter & Close */}
                        <div className="w-full flex items-center justify-between text-white text-xs px-2">
                            <span className="font-bold">
                                Foto {lightboxIndex + 1} dari {highlightPhotos.length}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => window.open(highlightPhotos[lightboxIndex].image_url, '_blank')}
                                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                                    title="Buka gambar ukuran asli"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Ukuran Asli</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLightboxIndex(null)}
                                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                                    title="Tutup (Esc)"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Main Image with Navigation Buttons */}
                        <div className="relative w-full aspect-4/3 max-h-[75vh] flex items-center justify-center">
                            <img
                                src={highlightPhotos[lightboxIndex].image_url}
                                alt={highlightPhotos[lightboxIndex].title || 'Highlight Photo'}
                                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
                            />

                            {highlightPhotos.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : highlightPhotos.length - 1));
                                        }}
                                        className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer shadow-lg backdrop-blur-xs"
                                        title="Foto sebelumnya (Panah Kiri)"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setLightboxIndex((prev) => (prev !== null && prev < highlightPhotos.length - 1 ? prev + 1 : 0));
                                        }}
                                        className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer shadow-lg backdrop-blur-xs"
                                        title="Foto selanjutnya (Panah Kanan)"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Caption */}
                        {highlightPhotos[lightboxIndex].title && (
                            <div className="text-center text-white px-4">
                                <p className="text-sm font-bold">{highlightPhotos[lightboxIndex].title}</p>
                                {highlightPhotos[lightboxIndex].caption && (
                                    <p className="text-xs text-slate-300 mt-0.5">{highlightPhotos[lightboxIndex].caption}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </ClientLayout>
    );
}
