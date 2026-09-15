import { router } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Loader2, Upload } from 'lucide-react';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { Button, Modal } from '@/components/ui';

type TransferKind = 'clients' | 'projects';

interface ImportSpreadsheetModalProps {
    kind: TransferKind;
    isOpen: boolean;
    onClose: () => void;
    categories?: Array<{ id: string | number; name: string }>;
}

const copy: Record<TransferKind, { label: string; singular: string; steps: string[] }> = {
    clients: {
        label: 'Klien',
        singular: 'klien',
        steps: [
            'Unduh template Excel dan isi sheet Klien.',
            'Gunakan nama kategori, sumber klien, dan wedding organizer yang sudah ada di master data.',
            'Hapus baris contoh atau biarkan contoh=YA agar otomatis dilewati.',
        ],
    },
    projects: {
        label: 'Project',
        singular: 'project',
        steps: [
            'Impor klien terlebih dahulu, kemudian isi sheet Proyek.',
            'Gunakan referensi_proyek untuk menghubungkan data pada sheet Detail kategori.',
            'Kategori dan paket harus sama persis dengan master data aktif; nominal ditulis angka tanpa Rp.',
        ],
    },
};

export function ImportSpreadsheetModal({ kind, isOpen, onClose, categories = [] }: ImportSpreadsheetModalProps) {
    const inputId = useId();
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const content = copy[kind];

    const close = () => {
        if (isSubmitting) return;
        setFile(null);
        setErrors([]);
        onClose();
    };

    const submit = () => {
        if (!file) {
            setErrors(['Pilih file .xlsx terlebih dahulu.']);
            return;
        }

        setIsSubmitting(true);
        setErrors([]);
        router.post(`/${kind}/import`, { file }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Import ${content.label} selesai.`);
                setFile(null);
                setErrors([]);
                onClose();
            },
            onError: (formErrors) => {
                const messages = Object.values(formErrors).flatMap((value) => Array.isArray(value) ? value : [value]);
                setErrors(messages.length > 0 ? messages : ['File tidak dapat diproses. Silakan periksa kembali template.']);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={close}
            maxWidth="2xl"
            title={`Impor ${content.label} dari Excel`}
            subtitle="Gunakan template resmi agar struktur data dan relasi tetap aman."
            icon={<FileSpreadsheet className="size-5 text-emerald-700" aria-hidden="true" />}
            footer={
                <>
                    <Button type="button" variant="outline" onClick={close} disabled={isSubmitting}>
                        Batal
                    </Button>
                    <Button type="button" onClick={submit} disabled={!file || isSubmitting}>
                        {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Upload className="size-4" aria-hidden="true" />}
                        Impor file
                    </Button>
                </>
            }
        >
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden="true" />
                    <div>
                        <p className="font-semibold text-emerald-950">Contoh Excel sudah tersedia</p>
                        <p className="mt-1 leading-5 text-emerald-900/80">
                            Template memiliki baris contoh yang aman dilewati saat impor dan sheet Panduan berisi aturan pengisian.
                        </p>
                    </div>
                </div>
                <a
                    href={`/${kind}/import/template`}
                    className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                >
                    <Download className="size-4" aria-hidden="true" />
                    Unduh template Excel (.xlsx)
                </a>
            </div>

            <ol className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                {content.steps.map((step, index) => (
                    <li key={step} className="flex gap-3 leading-5">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white">{index + 1}</span>
                        <span>{step}</span>
                    </li>
                ))}
            </ol>

            {kind === 'projects' && categories.length > 0 && (
                <div className="rounded-xl border border-slate-200 p-4">
                    <p className="font-semibold text-slate-900">Sheet detail yang akan tersedia</p>
                    <p className="mt-1 text-slate-500">Satu sheet dibuat untuk setiap kategori aktif.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <span key={category.id} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                                Detail {category.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <label htmlFor={inputId} className="mb-2 block font-semibold text-slate-800">File Excel (.xlsx)</label>
                <input
                    id={inputId}
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={(event) => {
                        setFile(event.target.files?.[0] ?? null);
                        setErrors([]);
                    }}
                    className="block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                {file && <p className="mt-2 text-emerald-700">File dipilih: {file.name}</p>}
            </div>

            {errors.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800" role="alert">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                        <div>
                            <p className="font-semibold">Import belum dijalankan</p>
                            <ul className="mt-1 list-disc space-y-1 pl-4 leading-5">
                                {errors.map((error) => <li key={error}>{error}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}
