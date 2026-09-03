export interface WorkflowStep {
    id: number;
    num: number;
    name: string; // Nama Tahap Alur Kerja (misal: "Booking & Briefing Konsep", "Hari H (Liputan & Shooting)", "Culling & Preview", "Editing Foto & Video", "Review Klien & Layouting", "Produksi Cetak & Packaging", "Penyerahan Final (Handover)")
    phase: string; // Fase Proyek (misal: "Pra-Acara", "Hari H", "Pasca-Produksi", "Review", "Finishing", "Selesai")
    duration: string; // Estimasi Durasi / Waktu (misal: "H-14 s/d H-1", "Hari H", "H+1 s/d H+3", "H+7 s/d H+21", "H+21 s/d H+30", "H+30 s/d H+45", "H+45 s/d H+60")
    activity: string; // Deskripsi Aktivitas Tim Operasional
    // Properti kompatibilitas
    dur?: string;
    deliv?: string;
    dl?: string;
    description?: string;
}

export interface WorkflowDefinition {
    id: number;
    type: 'wedding' | 'non_wedding' | 'custom';
    name: string;
    description: string;
    steps_count: number;
    steps: WorkflowStep[];
}

export const WORKFLOW_WEDDING: WorkflowDefinition = {
    id: 1,
    type: 'wedding',
    name: 'Workflow Wedding (7 Tahap)',
    description: 'Alur kerja komprehensif tim untuk kategori Wedding & International Wedding (Akad & Resepsi) dari pra-acara hingga produksi cetak.',
    steps_count: 7,
    steps: [
        {
            id: 1,
            num: 1,
            name: 'Booking & Briefing Konsep',
            phase: 'Pra-Acara',
            duration: 'H-14 s/d H-1',
            activity: 'Konsultasi konsep visual, moodboard, cek rundown acara & koordinasi tim WO.',
            dur: 'H-14 s/d H-1',
            dl: 'H-1',
            deliv: 'Konfirmasi Konsep & Rundown',
            description: 'Konsultasi konsep & koordinasi rundown',
        },
        {
            id: 2,
            num: 2,
            name: 'Hari H (Liputan & Shooting)',
            phase: 'Hari H',
            duration: 'Hari H',
            activity: 'Dokumentasi penuh akad & resepsi, dilanjutkan proses ingest & backup ganda data.',
            dur: 'Hari H',
            dl: 'Hari H',
            deliv: 'Liputan Hari H & Backup Data',
            description: 'Liputan dokumentasi & backup data',
        },
        {
            id: 3,
            num: 3,
            name: 'Culling & Seleksi Preview',
            phase: 'Pasca-Produksi',
            duration: 'H+1 s/d H+3',
            activity: 'Sortir foto terbaik, unggah preview sneak peek, dan share link Google Drive raw files.',
            dur: '1 - 3 Hari',
            dl: 'H+3',
            deliv: 'Sneak Peek & Raw Upload',
            description: 'Sortir foto & upload preview awal',
        },
        {
            id: 4,
            num: 4,
            name: 'Editing Foto & Video Highlight',
            phase: 'Pasca-Produksi',
            duration: 'H+7 s/d H+21',
            activity: 'Retouching foto pilihan, color grading, editing teaser Instagram & cinematic highlight.',
            dur: '1 - 3 Minggu',
            dl: 'H+21',
            deliv: 'Master Edited & Cinematic Video',
            description: 'Retouch foto pilihan & video editing',
        },
        {
            id: 5,
            num: 5,
            name: 'Review Klien & Layouting Album',
            phase: 'Review',
            duration: 'H+21 s/d H+30',
            activity: 'Desain layout photobook album dan sesi approval/revisi draft bersama klien.',
            dur: '1 Minggu',
            dl: 'H+30',
            deliv: 'Approval Layout Album',
            description: 'Layouting album & approval klien',
        },
        {
            id: 6,
            num: 6,
            name: 'Produksi Cetak & Packaging',
            phase: 'Finishing',
            duration: 'H+30 s/d H+45',
            activity: 'Pencetakan album premium hardcover, bingkai canvas, dan pengemasan box kayu exclusive.',
            dur: '2 Minggu',
            dl: 'H+45',
            deliv: 'Cetak Album Fisik & Box',
            description: 'Cetak album fisik & packaging box',
        },
        {
            id: 7,
            num: 7,
            name: 'Penyerahan Final (Handover)',
            phase: 'Selesai',
            duration: 'H+45 s/d H+60',
            activity: 'Serah terima paket album fisik & flashdisk via kurir serta konfirmasi kepuasan klien.',
            dur: 'Final',
            dl: 'H+60',
            deliv: 'Serah Terima Lengkap',
            description: 'Handover paket fisik & master archive',
        },
    ],
};

export const WORKFLOW_NON_WEDDING: WorkflowDefinition = {
    id: 2,
    type: 'non_wedding',
    name: 'Workflow Non-Wedding (5 Tahap)',
    description: 'Alur kerja cepat & dinamis untuk sesi Prewedding, Engagement, Event, Portrait & Photoshoot reguler.',
    steps_count: 5,
    steps: [
        {
            id: 1,
            num: 1,
            name: 'Booking & Moodboard',
            phase: 'Pra-Acara',
            duration: 'H-7 s/d H-1',
            activity: 'Penentuan lokasi, wardrobe, konsep visual, moodboard & jadwal sesi pemotretan.',
            dur: 'H-7 s/d H-1',
            dl: 'H-1',
            deliv: 'Konsep & Jadwal Photoshoot',
            description: 'Briefing konsep & penentuan lokasi',
        },
        {
            id: 2,
            num: 2,
            name: 'Hari H Sesi Pemotretan',
            phase: 'Hari H',
            duration: 'Hari H',
            activity: 'Pelaksanaan photoshoot sesuai durasi paket dan backup raw file langsung ke storage.',
            dur: 'Hari H',
            dl: 'Hari H',
            deliv: 'Photoshoot & Backup Data',
            description: 'Sesi photoshoot & backup data',
        },
        {
            id: 3,
            num: 3,
            name: 'Culling & Preview Sneak Peek',
            phase: 'Pasca-Produksi',
            duration: 'H+1 s/d H+3',
            activity: 'Penyortiran foto, pengiriman preview files / sneak peek untuk dipilih oleh klien.',
            dur: '1 - 3 Hari',
            dl: 'H+3',
            deliv: 'Sneak Peek & Seleksi Foto',
            description: 'Sortir foto & sneak peek',
        },
        {
            id: 4,
            num: 4,
            name: 'Editing Final & Retouching',
            phase: 'Pasca-Produksi',
            duration: 'H+4 s/d H+7',
            activity: 'Retouching detail, tone balancing, dan final polishing foto pilihan klien.',
            dur: '4 - 7 Hari',
            dl: 'H+7',
            deliv: 'Master Retouched Photos',
            description: 'Final retouching foto pilihan',
        },
        {
            id: 5,
            num: 5,
            name: 'Final Delivery & Download',
            phase: 'Selesai',
            duration: 'H+7 s/d H+14',
            activity: 'Penyerahan link download Google Drive resolusi tinggi & cetak foto (jika termasuk).',
            dur: 'Final',
            dl: 'H+14',
            deliv: 'Master High-Res Download',
            description: 'Serah terima file master high-res',
        },
    ],
};

export const WORKFLOW_CUSTOM: WorkflowDefinition = {
    id: 3,
    type: 'custom',
    name: 'Workflow Custom / Bundling (6 Tahap)',
    description: 'Alur kerja terintegrasi untuk paket bundling multi-sesi (Prewedding + Wedding) dan liputan khusus.',
    steps_count: 6,
    steps: [
        {
            id: 1,
            num: 1,
            name: 'Konsultasi & Master Timeline',
            phase: 'Pra-Acara',
            duration: 'H-14 s/d H-1',
            activity: 'Penyusunan rundown terpadu multi-sesi, penentuan konsep foto & koordinasi tim gabungan.',
            dur: 'H-14 s/d H-1',
            dl: 'H-1',
            deliv: 'Master Rundown & Briefing',
            description: 'Penyusunan jadwal & briefing konsep',
        },
        {
            id: 2,
            num: 2,
            name: 'Sesi Awal (Prewed / Engagement)',
            phase: 'Sesi 1',
            duration: 'Sesi Awal',
            activity: 'Shooting sesi pertama, preview foto untuk display undangan atau materi hari H.',
            dur: 'Sesi 1',
            dl: 'H+3',
            deliv: 'Foto Display & Sneak Peek Sesi 1',
            description: 'Shooting sesi awal & materi display',
        },
        {
            id: 3,
            num: 3,
            name: 'Hari H (Main Wedding Event)',
            phase: 'Sesi 2',
            duration: 'Hari H',
            activity: 'Dokumentasi penuh hari H, tim photo & video komplit, backup master data ganda.',
            dur: 'Hari H',
            dl: 'Hari H',
            deliv: 'Liputan Acara Utama',
            description: 'Liputan acara utama & backup data',
        },
        {
            id: 4,
            num: 4,
            name: 'Editing Foto & Video Terpadu',
            phase: 'Pasca-Produksi',
            duration: 'H+7 s/d H+21',
            activity: 'Editing foto seluruh sesi, perakitan video cinematic highlight & teaser.',
            dur: '2 - 3 Minggu',
            dl: 'H+21',
            deliv: 'Master Editing Foto & Video',
            description: 'Editing komprehensif foto & video',
        },
        {
            id: 5,
            num: 5,
            name: 'Produksi Album Fisik & Box',
            phase: 'Finishing',
            duration: 'H+21 s/d H+45',
            activity: 'Layout album bundling, proofing desain klien, dan proses percetakan album premium.',
            dur: '3 Minggu',
            dl: 'H+45',
            deliv: 'Cetak Album Fisik Bundling',
            description: 'Layouting & percetakan album bundling',
        },
        {
            id: 6,
            num: 6,
            name: 'Penyerahan Paket Komplit',
            phase: 'Selesai',
            duration: 'H+45 s/d H+60',
            activity: 'Serah terima seluruh hasil cetak fisik, merchandise box exclusive & link master cloud.',
            dur: 'Final',
            dl: 'H+60',
            deliv: 'Handover Seluruh Output',
            description: 'Handover seluruh output fisik & digital',
        },
    ],
};

export const ALL_WORKFLOWS: WorkflowDefinition[] = [
    WORKFLOW_WEDDING,
    WORKFLOW_NON_WEDDING,
    WORKFLOW_CUSTOM,
];

/**
 * Resolves the appropriate workflow definition based on Category and Package info.
 * Can use custom definitions from database if provided.
 */
export function resolveWorkflow(
    category?: { name?: string; workflow_type?: string | null } | null,
    customDefinitions?: WorkflowDefinition[]
): WorkflowDefinition {
    const list = customDefinitions && customDefinitions.length > 0 ? customDefinitions : ALL_WORKFLOWS;
    if (!category) return list.find((w) => w.type === 'wedding') || list[0] || WORKFLOW_WEDDING;

    const wfType = category.workflow_type?.toLowerCase() || '';
    const name = category.name?.toLowerCase() || '';

    if (
        wfType === 'non_wedding' ||
        wfType === 'photoshoot' ||
        name.includes('prewed') ||
        name.includes('engagement') ||
        name.includes('photo only') ||
        name.includes('video only') ||
        name.includes('portrait') ||
        name.includes('graduation') ||
        name.includes('event')
    ) {
        return list.find((w) => w.type === 'non_wedding') || list[1] || WORKFLOW_NON_WEDDING;
    }

    if (
        wfType === 'custom' ||
        wfType === 'bundling' ||
        name.includes('bundle') ||
        name.includes('bundling') ||
        name.includes('custom') ||
        name.includes('journey')
    ) {
        return list.find((w) => w.type === 'custom') || list[2] || WORKFLOW_CUSTOM;
    }

    return list.find((w) => w.type === 'wedding') || list[0] || WORKFLOW_WEDDING;
}
