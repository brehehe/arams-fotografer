/** Keep free-form notes; booking-form metadata belongs in the project/category detail instead. */
export function extractProjectNoteText(raw: unknown): string {
    if (typeof raw !== 'string') {
        return '';
    }

    const generatedField = /^(?:Kategori Layanan|Pilihan Paket|Rencana Tanggal Acara|Waktu Acara|Lokasi(?: Resepsi)?|Anak #\d+|Nama Anak|Panggilan Anak|Jenis Kelamin|Nama Ayah|Nama Ibu|Orang Tua|Jenis Acara|Kontak Utama|Pekerjaan CPP|Pekerjaan CPW|Medsos Lain|Estimasi Tamu|Tema\s*\/\s*Konsep|Vendor Terlibat|Inspirasi\s*\/\s*Ref|Photographer|Editor|Tim Personil|Sumber Referensi)\s*:/i;

    return raw
        .replace(/\r\n?/g, '\n')
        .replace(/\\n/g, '\n')
        .split(/\n+/)
        .map((line) => line.trim())
        .filter((line) => line && !generatedField.test(line))
        .map((line) => line.replace(/^Catatan(?: Tambahan)?:\s*/i, ''))
        .filter(Boolean)
        .join('\n')
        .trim();
}
