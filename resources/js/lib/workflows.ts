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
    name: 'Workflow Wedding (8 Tahap)',
    description: 'Alur kerja komprehensif tim untuk kategori Wedding & International Wedding (Akad & Resepsi) dari pra-acara hingga penyerahan berkas final.',
    steps_count: 8,
    steps: [
        {
            id: 1,
            num: 1,
            name: 'Booking & DP',
            phase: 'Pra-Acara',
            duration: 'H-30 s/d H-14',
            activity: 'Penerimaan uang muka (DP) telah terverifikasi. Jadwal tim, fotografer & videografer telah di-booking pada kalender kerja sistem.',
            dur: 'H-30 s/d H-14',
            dl: 'H-14',
            deliv: 'Verifikasi DP & Booking Jadwal',
            description: 'Verifikasi pembayaran DP & jadwal tim',
        },
        {
            id: 2,
            num: 2,
            name: 'TM Wedding',
            phase: 'Pra-Acara',
            duration: 'H-7 s/d H-1',
            activity: 'Technical Meeting bersama perwakilan klien dan Wedding Organizer untuk finalisasi rundown serta checklist shot list foto.',
            dur: 'H-7 s/d H-1',
            dl: 'H-1',
            deliv: 'Final Rundown & Shot List',
            description: 'Technical Meeting & finalisasi rundown',
        },
        {
            id: 3,
            num: 3,
            name: 'Hari H',
            phase: 'Hari H',
            duration: 'Hari H',
            activity: 'Pelaksanaan liputan dan dokumentasi live di lokasi acara oleh seluruh tim yang bertugas serta backup data ganda.',
            dur: 'Hari H',
            dl: 'Hari H',
            deliv: 'Liputan Acara & Backup Raw Data',
            description: 'Dokumentasi hari H & backup master data',
        },
        {
            id: 4,
            num: 4,
            name: 'Sneak Peak Photo Editing',
            phase: 'Pasca-Produksi',
            duration: 'H+1 s/d H+3',
            activity: 'Tim sedang melakukan color grading kilat dan pemilihan foto highlight utama untuk preview kilat klien.',
            dur: '1 - 3 Hari',
            dl: 'H+3',
            deliv: 'Sneak Peak Preview (20-50 Foto)',
            description: 'Color grading kilat & preview teaser foto',
        },
        {
            id: 5,
            num: 5,
            name: 'Flashdrive + Box Delivery',
            phase: 'Finishing',
            duration: 'H+7 s/d H+14',
            activity: 'Penyimpanan seluruh master raw file & hasil liputan ke dalam Flashdrive eksklusif dan penyiapan box kemasan.',
            dur: '1 Minggu',
            dl: 'H+14',
            deliv: 'Exclusive Flashdrive & Box',
            description: 'Pengisian flashdisk & box kemasan',
        },
        {
            id: 6,
            num: 6,
            name: 'Full Version Photo & Video Editing',
            phase: 'Pasca-Produksi',
            duration: 'H+14 s/d H+30',
            activity: 'Editing menyeluruh seluruh foto terpilih dan perakitan video cinematic highlight & full documentary berdurasi lengkap.',
            dur: '2 - 3 Minggu',
            dl: 'H+30',
            deliv: 'Master All Edited Photos & Cinematic Video',
            description: 'Master editing foto pilihan & video cinematic',
        },
        {
            id: 7,
            num: 7,
            name: 'Album Layout Editing',
            phase: 'Review',
            duration: 'H+21 s/d H+35',
            activity: 'Desain penataan layout halaman photobook wedding dan konfirmasi approval kepada klien sebelum dikirim ke percetakan.',
            dur: '1 - 2 Minggu',
            dl: 'H+35',
            deliv: 'Approval Layout Photobook',
            description: 'Desain layout album & approval klien',
        },
        {
            id: 8,
            num: 8,
            name: 'Final Delivery',
            phase: 'Selesai',
            duration: 'H+45 s/d H+60',
            activity: 'Pengiriman seluruh paket fisik (album cetak, frame, flashdrive) dan berkas digital resolusi tinggi ke alamat klien.',
            dur: 'Final',
            dl: 'H+60',
            deliv: 'Handover Lengkap Paket Fisik & Digital',
            description: 'Penyerahan seluruh produk fisik & arsip cloud',
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
 * Resolves the appropriate workflow definition based on Category, Package, and Project info.
 * Can use custom definitions from database if provided.
 */
export function resolveWorkflow(
    category?: { name?: string; workflow_type?: string | null } | null,
    customDefinitions?: WorkflowDefinition[],
    packageOrProjectInfo?: { name?: string; service_name?: string } | null
): WorkflowDefinition {
    const list = customDefinitions && customDefinitions.length > 0 ? customDefinitions : ALL_WORKFLOWS;

    const wfType = (category?.workflow_type || '').toLowerCase();
    const catName = (category?.name || '').toLowerCase();
    const pkgName = (packageOrProjectInfo?.name || '').toLowerCase();
    const srvName = (packageOrProjectInfo?.service_name || '').toLowerCase();
    const combined = `${catName} ${pkgName} ${srvName}`.trim();

    // 1. Direct workflow_type match
    if (wfType === 'non_wedding' || wfType === 'photoshoot') {
        return list.find((w) => w.type === 'non_wedding') || list[1] || WORKFLOW_NON_WEDDING;
    }
    if (wfType === 'custom' || wfType === 'bundling') {
        return list.find((w) => w.type === 'custom') || list[2] || WORKFLOW_CUSTOM;
    }
    if (wfType === 'wedding') {
        return list.find((w) => w.type === 'wedding') || list[0] || WORKFLOW_WEDDING;
    }

    // 2. Custom / Bundling keywords
    if (
        combined.includes('bundle') ||
        combined.includes('bundling') ||
        combined.includes('custom') ||
        combined.includes('journey') ||
        combined.includes('all-in') ||
        combined.includes('all in')
    ) {
        return list.find((w) => w.type === 'custom') || list[2] || WORKFLOW_CUSTOM;
    }

    // 3. Non-Wedding / Event / Community / Photoshoot keywords
    if (
        combined.includes('prewed') ||
        combined.includes('engagement') ||
        combined.includes('lamaran') ||
        combined.includes('event') ||
        combined.includes('komunitas') ||
        combined.includes('community') ||
        combined.includes('portrait') ||
        combined.includes('graduation') ||
        combined.includes('wisuda') ||
        combined.includes('photo only') ||
        combined.includes('video only') ||
        combined.includes('photoshoot') ||
        combined.includes('corporate') ||
        combined.includes('birthday') ||
        combined.includes('sweet 17') ||
        combined.includes('family') ||
        combined.includes('studio') ||
        combined.includes('maternity') ||
        combined.includes('aqiqah') ||
        combined.includes('dokumentasi')
    ) {
        return list.find((w) => w.type === 'non_wedding') || list[1] || WORKFLOW_NON_WEDDING;
    }

    // 4. Default: Wedding Workflow
    return list.find((w) => w.type === 'wedding') || list[0] || WORKFLOW_WEDDING;
}
