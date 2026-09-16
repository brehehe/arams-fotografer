<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Client;
use App\Models\ClientSource;
use App\Models\Package;
use App\Models\Project;
use App\Models\User;
use App\Models\WeddingOrganizer;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Builds the editable workbooks used by the Clients and Projects screens.
 *
 * IDs are deliberately never exposed in the templates. Related records are
 * matched by their human-maintained name, email, or telephone number instead.
 */
class SpreadsheetTransferService
{
    private const CLIENT_HEADERS = [
        'nama', 'tipe_klien', 'kategori', 'email', 'telepon', 'telepon_kedua',
        'instagram', 'kontak_preferensi', 'provinsi', 'kota', 'kecamatan', 'kelurahan',
        'kode_pos', 'alamat', 'sumber', 'sumber_klien', 'wedding_organizer', 'status',
        'nama_perusahaan', 'nama_pasangan', 'nama_mempelai_wanita', 'nama_mempelai_pria',
        'nama_anak', 'nama_ayah', 'nama_ibu', 'catatan', 'tag_dipisah_koma', 'data_kategori_json',
    ];

    private const PROJECT_HEADERS = [
        'referensi_proyek', 'nama_proyek', 'email_klien', 'telepon_klien', 'kategori',
        'paket', 'status', 'tanggal_acara', 'jam_acara', 'tanggal_selesai', 'deadline', 'lokasi',
        'email_supervisor', 'email_fotografer', 'email_editor', 'harga', 'diskon', 'pajak',
        'total', 'sudah_dibayar', 'catatan',
    ];

    /** @var array<string, list<string>> */
    private const CATEGORY_FIELDS = [
        'maternity' => ['mom_name', 'partner_name', 'gestational_age_weeks', 'hpl_date', 'concept_theme', 'session_location_type', 'wardrobe_notes'],
        'lainnya' => ['client_name', 'contact_person', 'needs_description', 'location', 'needs_type', 'needs_detail', 'approach_type', 'special_notes'],
        'perorangan' => ['client_name', 'nickname', 'photo_purpose', 'session_type', 'outfit_looks_count', 'session_duration', 'backdrop_theme', 'desired_props', 'additional_notes'],
        'prewedding' => ['groom_name', 'bride_name', 'session_date', 'concept_theme', 'session_location', 'outfit_wardrobe', 'locations_count', 'makeup_hairdo', 'props', 'additional_notes'],
        'commercial' => ['company_name', 'pic_name', 'commercial_purpose', 'product_brand_type', 'products_count', 'background_type', 'photo_style_mood', 'photo_usage', 'reference_brief', 'additional_notes'],
        'traveling' => ['client_name', 'contact_person', 'departure_date', 'return_date', 'destination_city_country', 'travelers_count', 'trip_type', 'trip_duration_days', 'airline', 'accommodation_hotel', 'trip_transportation', 'main_agenda_activity', 'additional_notes'],
        'wedding' => ['groom_name', 'groom_nickname', 'groom_occupation', 'groom_birth_date', 'groom_instagram', 'bride_name', 'bride_nickname', 'bride_occupation', 'bride_birth_date', 'bride_instagram', 'akad_date', 'akad_time', 'akad_location', 'reception_date', 'reception_time', 'reception_location', 'wedding_organizer', 'estimated_guests', 'concept_theme', 'venue_building', 'decoration', 'mua_dress', 'entertainment', 'additional_notes'],
        'birthday' => ['celebrant_name', 'celebrant_age', 'birthday_theme', 'event_type', 'estimated_guests', 'venue_location', 'decoration_color_theme', 'activity_entertainment', 'additional_notes'],
        'corporate' => ['company_name', 'department_division', 'event_type', 'event_scale', 'documentation_purpose', 'pic_name', 'pic_phone', 'pic_email', 'special_requirements', 'reference_brief'],
        'engagement' => ['groom_name', 'bride_name', 'engagement_date', 'engagement_time', 'engagement_location', 'estimated_guests', 'concept_theme', 'theme_color', 'vendor_wo', 'additional_notes'],
        'event' => ['pic_name', 'client_name', 'event_name', 'event_date', 'event_time_range', 'event_type', 'event_scale', 'event_location', 'organizer', 'event_theme', 'event_purpose', 'estimated_guests', 'dress_code', 'rundown_agenda', 'additional_notes'],
        'family' => ['family_name', 'father_name', 'mother_name', 'members_count', 'concept_theme', 'session_location', 'session_duration', 'children_json', 'additional_notes'],
        'komunitas' => ['community_name', 'established_year', 'community_type', 'members_count', 'pic_name', 'pic_phone', 'pic_email', 'activity_type', 'activity_theme', 'activity_description'],
        'newborn' => ['baby_name', 'baby_nickname', 'baby_birth_date', 'baby_gender', 'father_name', 'mother_name', 'babies_json', 'children_json', 'additional_notes'],
        'standard' => ['additional_notes'],
    ];

    public function downloadClientTemplate(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $guide = $spreadsheet->getActiveSheet()->setTitle('Panduan');
        $guide->fromArray([
            ['TEMPLATE IMPORT KLIEN — ARAMS'],
            ['1. Isi sheet "Klien". Kolom nama wajib diisi; kolom lain opsional.'],
            ['2. Kategori, sumber klien, dan wedding organizer harus sama dengan nama master data aktif di sistem.'],
            ['3. data_kategori_json hanya dipakai untuk data khusus; gunakan format JSON valid.'],
            ['4. Simpan sebagai file Excel (.xlsx) lalu unggah melalui tombol Impor di halaman Klien.'],
        ]);

        $clients = $spreadsheet->createSheet()->setTitle('Klien');
        $clients->fromArray(self::CLIENT_HEADERS, null, 'A1');
        $this->styleSheet($guide);
        $this->styleSheet($clients, true);

        return $this->downloadWorkbook($spreadsheet, 'template-import-klien.xlsx');
    }

    public function downloadProjectTemplate(): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $guide = $spreadsheet->getActiveSheet()->setTitle('Panduan');
        $guide->fromArray([
            ['TEMPLATE IMPORT PROJECT — ARAMS'],
            ['1. Isi sheet "Proyek" terlebih dahulu. referensi_proyek, nama_proyek, email/telepon klien, dan kategori wajib diisi.'],
            ['2. Klien harus sudah diimpor atau dibuat sebelumnya. Kategori dan paket dicocokkan dengan master data aktif.'],
            ['3. Isi data khusus pada sheet kategori yang sesuai, lalu hubungkan melalui referensi_proyek.'],
            ['4. Semua tanggal menggunakan format YYYY-MM-DD. Nilai uang ditulis angka murni tanpa Rp atau pemisah ribuan.'],
            ['5. Sheet kategori memakai nama field sistem; jangan mengubah judul kolom. Kolom *_json memakai format JSON valid.'],
        ]);

        $projects = $spreadsheet->createSheet()->setTitle('Proyek');
        $projects->fromArray(self::PROJECT_HEADERS, null, 'A1');
        $this->styleSheet($guide);
        $this->styleSheet($projects, true);

        $sheetNames = [];
        foreach (Category::query()->where('status', 'active')->orderBy('sort_order')->get() as $category) {
            $title = $this->uniqueSheetTitle('Detail '.$category->name, $sheetNames);
            $sheetNames[] = $title;
            $sheet = $spreadsheet->createSheet()->setTitle($title);
            $fields = self::CATEGORY_FIELDS[$this->categoryKey($category)] ?? self::CATEGORY_FIELDS['standard'];
            $sheet->fromArray(array_merge(['referensi_proyek'], $fields), null, 'A1');
            $this->styleSheet($sheet, true);
        }

        return $this->downloadWorkbook($spreadsheet, 'template-import-project.xlsx');
    }

    public function exportClientsCsv(Request $request): StreamedResponse
    {
        $filename = 'arams_klien_'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($request) {
            $output = fopen('php://output', 'w');
            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, ['Nama', 'Tipe', 'Kategori', 'Email', 'Telepon', 'Kota', 'Sumber', 'Status', 'Jumlah Project', 'Nilai Project', 'Terbayar', 'Dibuat']);

            $query = Client::query()->with('category')->withCount('projects')->withSum('projects', 'total_amount')->withSum('projects', 'paid_amount');
            $this->applyClientFilters($query, $request);
            $query->orderBy('name')->chunk(200, function ($clients) use ($output) {
                foreach ($clients as $client) {
                    fputcsv($output, [
                        $client->name, $client->client_type, $client->category?->name, $client->email, $client->phone,
                        $client->city, $client->source, $client->status, $client->projects_count,
                        $client->projects_sum_total_amount ?? 0, $client->projects_sum_paid_amount ?? 0,
                        $client->created_at?->format('Y-m-d H:i'),
                    ]);
                }
            });
            fclose($output);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function exportProjectsCsv(Request $request): StreamedResponse
    {
        $filename = 'arams_project_'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($request) {
            $output = fopen('php://output', 'w');
            fwrite($output, "\xEF\xBB\xBF");
            fputcsv($output, ['No. Project', 'Nama Project', 'Klien', 'Email Klien', 'Kategori', 'Paket', 'Status', 'Progres', 'Tanggal Acara', 'Deadline', 'Total', 'Terbayar', 'Status Pembayaran']);

            $query = Project::query()->with(['client:id,name,email', 'category:id,name', 'package:id,name']);
            $this->applyProjectFilters($query, $request);
            $query->orderByDesc('created_at')->chunk(200, function ($projects) use ($output) {
                foreach ($projects as $project) {
                    fputcsv($output, [
                        $project->project_number, $project->name, $project->client?->name, $project->client?->email,
                        $project->category?->name, $project->package?->name, $project->status, $project->progress,
                        $project->event_date?->format('Y-m-d'), $project->deadline?->format('Y-m-d'),
                        $project->total_amount, $project->paid_amount, $project->payment_status,
                    ]);
                }
            });
            fclose($output);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /** @return array{clients: int, skipped: int} */
    public function importClients(UploadedFile $file, ?User $actor = null): array
    {
        $rows = $this->sheetRows($file, 'Klien');
        $errors = [];
        $payloads = [];
        foreach ($rows as $line => $row) {
            if ($this->isExampleOrEmpty($row)) {
                continue;
            }
            if (blank($row['nama'] ?? null)) {
                $errors[] = "Klien baris {$line}: kolom nama wajib diisi.";

                continue;
            }
            if (filled($row['email'] ?? null) && ! filter_var($row['email'], FILTER_VALIDATE_EMAIL)) {
                $errors[] = "Klien baris {$line}: email '{$row['email']}' tidak valid.";
            }
            $category = $this->findCategory($row['kategori'] ?? null);
            if (filled($row['kategori'] ?? null) && ! $category) {
                $errors[] = "Klien baris {$line}: kategori '{$row['kategori']}' tidak ditemukan.";
            }
            $source = $this->findByName(ClientSource::query(), $row['sumber_klien'] ?? null);
            if (filled($row['sumber_klien'] ?? null) && ! $source) {
                $errors[] = "Klien baris {$line}: sumber klien '{$row['sumber_klien']}' tidak ditemukan.";
            }
            $organizer = $this->findByName(WeddingOrganizer::query(), $row['wedding_organizer'] ?? null);
            if (filled($row['wedding_organizer'] ?? null) && ! $organizer) {
                $errors[] = "Klien baris {$line}: wedding organizer '{$row['wedding_organizer']}' tidak ditemukan.";
            }
            if (filled($row['email'] ?? null) && Client::withTrashed()->whereRaw('lower(email) = ?', [strtolower((string) $row['email'])])->exists()) {
                $errors[] = "Klien baris {$line}: email '{$row['email']}' sudah terdaftar.";
            }

            $payloads[] = [
                'name' => $row['nama'], 'client_type' => $row['tipe_klien'] ?: 'personal', 'category_id' => $category?->id,
                'email' => $row['email'] ?: null, 'phone' => $row['telepon'] ?: null, 'secondary_phone' => $row['telepon_kedua'] ?: null,
                'instagram' => $row['instagram'] ?: null, 'preferred_contact' => strtolower((string) ($row['kontak_preferensi'] ?: 'whatsapp')),
                'province' => $row['provinsi'] ?: null, 'city' => $row['kota'] ?: null, 'district' => $row['kecamatan'] ?: null,
                'village' => $row['kelurahan'] ?: null, 'postal_code' => $row['kode_pos'] ?: null, 'address' => $row['alamat'] ?: null,
                'source' => $row['sumber'] ?: null, 'client_source_id' => $source?->id, 'wedding_organizer_id' => $organizer?->id,
                'status' => $row['status'] ?: 'active', 'company_name' => $row['nama_perusahaan'] ?: null,
                'partner_name' => $row['nama_pasangan'] ?: null, 'bride_name' => $row['nama_mempelai_wanita'] ?: null,
                'groom_name' => $row['nama_mempelai_pria'] ?: null, 'child_name' => $row['nama_anak'] ?: null,
                'father_name' => $row['nama_ayah'] ?: null, 'mother_name' => $row['nama_ibu'] ?: null,
                'notes' => $row['catatan'] ?: null, 'tags' => $this->commaList($row['tag_dipisah_koma'] ?? null),
                'category_data' => $this->jsonValue($row['data_kategori_json'] ?? null, "Klien baris {$line}", $errors),
            ];
        }
        $this->throwIfErrors($errors);

        DB::transaction(function () use ($payloads, $actor) {
            foreach ($payloads as $payload) {
                app(ClientService::class)->createClient(Arr::where($payload, fn ($value) => $value !== null), $actor);
            }
        });

        return ['clients' => count($payloads), 'skipped' => count($rows) - count($payloads)];
    }

    /** @return array{projects: int, skipped: int} */
    public function importProjects(UploadedFile $file, ?User $actor = null): array
    {
        $workbook = IOFactory::load($file->getRealPath());
        $rows = $this->sheetRowsFromWorkbook($workbook, 'Proyek');
        $errors = [];
        $detailsByReference = $this->projectDetailsByReference($workbook, $errors);
        $payloads = [];

        foreach ($rows as $line => $row) {
            if ($this->isExampleOrEmpty($row)) {
                continue;
            }
            $reference = trim((string) ($row['referensi_proyek'] ?? ''));
            if ($reference === '' || blank($row['nama_proyek'] ?? null) || blank($row['kategori'] ?? null)) {
                $errors[] = "Project baris {$line}: referensi_proyek, nama_proyek, dan kategori wajib diisi.";

                continue;
            }
            $client = $this->findClient($row['email_klien'] ?? null, $row['telepon_klien'] ?? null);
            if (! $client) {
                $errors[] = "Project baris {$line}: klien tidak ditemukan. Impor/buat klien terlebih dahulu.";
            }
            $category = $this->findCategory($row['kategori'] ?? null);
            if (! $category) {
                $errors[] = "Project baris {$line}: kategori '{$row['kategori']}' tidak ditemukan.";
            }
            foreach (['tanggal_acara', 'tanggal_selesai', 'deadline'] as $column) {
                if (filled($row[$column] ?? null) && $this->dateValue($row[$column]) === null) {
                    $errors[] = "Project baris {$line}: {$column} harus menggunakan tanggal yang valid (YYYY-MM-DD).";
                }
            }
            foreach (['harga', 'diskon', 'pajak', 'total', 'sudah_dibayar'] as $column) {
                if (filled($row[$column] ?? null) && ! $this->isNumericValue($row[$column])) {
                    $errors[] = "Project baris {$line}: {$column} harus berupa angka tanpa format mata uang.";
                }
            }
            $package = $this->findPackage($row['paket'] ?? null, $category?->id);
            if (filled($row['paket'] ?? null) && ! $package) {
                $errors[] = "Project baris {$line}: paket '{$row['paket']}' tidak ditemukan pada kategori tersebut.";
            }
            $staff = [
                'supervisor_id' => $this->findUserByEmail($row['email_supervisor'] ?? null),
                'photographer_id' => $this->findUserByEmail($row['email_fotografer'] ?? null),
                'editor_id' => $this->findUserByEmail($row['email_editor'] ?? null),
            ];
            foreach (['email_supervisor', 'email_fotografer', 'email_editor'] as $column) {
                if (filled($row[$column] ?? null) && ! $staff[str_replace('email_', '', $column).'_id']) {
                    $errors[] = "Project baris {$line}: pengguna '{$row[$column]}' tidak ditemukan.";
                }
            }
            $categoryData = $detailsByReference[$reference] ?? [];
            $payloads[] = array_merge([
                'name' => $row['nama_proyek'], 'client_id' => $client?->id, 'category_id' => $category?->id,
                'package_id' => $package?->id, 'status' => $row['status'] ?: 'booking',
                'event_date' => $this->dateValue($row['tanggal_acara'] ?? null), 'event_time' => $row['jam_acara'] ?: null,
                'end_date' => $this->dateValue($row['tanggal_selesai'] ?? null), 'deadline' => $this->dateValue($row['deadline'] ?? null),
                'location' => $row['lokasi'] ?: null, 'price' => $this->numberValue($row['harga'] ?? null),
                'discount' => $this->numberValue($row['diskon'] ?? null), 'tax' => $this->numberValue($row['pajak'] ?? null),
                'total_amount' => $this->numberValue($row['total'] ?? null), 'paid_amount' => $this->numberValue($row['sudah_dibayar'] ?? null),
                'notes' => $row['catatan'] ?: null, 'category_data' => $categoryData,
            ], $staff);
        }
        $this->throwIfErrors($errors);

        DB::transaction(function () use ($payloads, $actor) {
            foreach ($payloads as $payload) {
                app(ProjectService::class)->createProject(Arr::where($payload, fn ($value) => $value !== null), $actor);
            }
        });

        return ['projects' => count($payloads), 'skipped' => count($rows) - count($payloads)];
    }

    private function projectDetailsByReference(Spreadsheet $workbook, array &$errors): array
    {
        $details = [];
        foreach ($workbook->getWorksheetIterator() as $sheet) {
            if (! Str::startsWith(Str::lower($sheet->getTitle()), 'detail ')) {
                continue;
            }
            foreach ($this->rowsFromSheet($sheet) as $line => $row) {
                if ($this->isExampleOrEmpty($row)) {
                    continue;
                }
                $reference = trim((string) ($row['referensi_proyek'] ?? ''));
                if ($reference === '') {
                    $errors[] = "{$sheet->getTitle()} baris {$line}: referensi_proyek wajib diisi.";

                    continue;
                }
                $data = Arr::except($row, ['contoh', 'referensi_proyek']);
                foreach ($data as $field => $value) {
                    if (blank($value)) {
                        unset($data[$field]);
                    } elseif (Str::endsWith($field, '_json')) {
                        $data[Str::beforeLast($field, '_json')] = $this->jsonValue($value, "{$sheet->getTitle()} baris {$line}", $errors);
                        unset($data[$field]);
                    } elseif (in_array($field, ['photo_usage'], true)) {
                        $data[$field] = $this->commaList($value);
                    }
                }
                $details[$reference] = array_merge($details[$reference] ?? [], $data);
            }
        }

        return $details;
    }

    /** @return array<int, array<string, mixed>> */
    private function sheetRows(UploadedFile $file, string $name): array
    {
        return $this->sheetRowsFromWorkbook(IOFactory::load($file->getRealPath()), $name);
    }

    /** @return array<int, array<string, mixed>> */
    private function sheetRowsFromWorkbook(Spreadsheet $workbook, string $name): array
    {
        $sheet = $workbook->getSheetByName($name);
        if (! $sheet) {
            throw ValidationException::withMessages(['file' => ["Sheet '{$name}' tidak ditemukan."]]);
        }

        return $this->rowsFromSheet($sheet);
    }

    /** @return array<int, array<string, mixed>> */
    private function rowsFromSheet(Worksheet $sheet): array
    {
        $matrix = $sheet->toArray(null, true, true, false);
        $headers = array_map(fn ($header) => $this->columnKey((string) $header), $matrix[0] ?? []);
        $rows = [];
        foreach (array_slice($matrix, 1) as $index => $values) {
            $row = [];
            foreach ($headers as $column => $header) {
                if ($header !== '') {
                    $row[$header] = $values[$column] ?? null;
                }
            }
            $rows[$index + 2] = $row;
        }

        return $rows;
    }

    private function downloadWorkbook(Spreadsheet $spreadsheet, string $filename): StreamedResponse
    {
        return response()->streamDownload(function () use ($spreadsheet) {
            (new Xlsx($spreadsheet))->save('php://output');
            $spreadsheet->disconnectWorksheets();
        }, $filename, ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
    }

    private function styleSheet(Worksheet $sheet, bool $header = false): void
    {
        $sheet->freezePane('A2');
        $sheet->getDefaultColumnDimension()->setWidth(20);
        if ($header) {
            $last = Coordinate::stringFromColumnIndex(max(1, $sheet->getHighestColumn() ? Coordinate::columnIndexFromString($sheet->getHighestColumn()) : 1));
            $sheet->getStyle("A1:{$last}1")->getFont()->setBold(true)->getColor()->setRGB('FFFFFF');
            $sheet->getStyle("A1:{$last}1")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('0B1527');
            $sheet->setAutoFilter("A1:{$last}1");
        } else {
            $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
            $sheet->getColumnDimension('A')->setWidth(110);
        }
    }

    private function uniqueSheetTitle(string $proposed, array $used): string
    {
        $title = Str::of($proposed)->replace([':', '\\', '/', '?', '*', '[', ']'], ' ')->substr(0, 31)->trim()->value();
        $base = $title ?: 'Detail';
        $number = 2;
        while (in_array($title, $used, true)) {
            $suffix = ' '.$number++;
            $title = Str::substr($base, 0, 31 - strlen($suffix)).$suffix;
        }

        return $title;
    }

    private function categoryKey(Category $category): string
    {
        $candidate = Str::lower(trim(implode(' ', array_filter([$category->form_type, $category->slug, $category->name]))));
        $aliases = [
            'maternity' => ['maternity'],
            'prewedding' => ['prewedding'],
            'wedding' => ['wedding', 'pernikahan'],
            'newborn' => ['newborn', 'bayi'],
            'commercial' => ['commercial', 'produk', 'brand'],
            'traveling' => ['traveling', 'trip', 'wisata'],
            'birthday' => ['birthday', 'ulang tahun'],
            'corporate' => ['corporate', 'perusahaan'],
            'engagement' => ['engagement', 'lamaran'],
            'perorangan' => ['perorangan', 'personal', 'portrait'],
            'family' => ['family', 'keluarga'],
            'komunitas' => ['komunitas', 'community'],
            'event' => ['event', 'acara'],
            'lainnya' => ['lainnya', 'khusus'],
        ];
        foreach ($aliases as $key => $needles) {
            if (Str::contains($candidate, $needles)) {
                return $key;
            }
        }

        return 'standard';
    }

    private function findCategory(?string $name): ?Category
    {
        return $this->findByName(Category::query()->where('status', 'active'), $name);
    }

    private function findPackage(?string $name, ?string $categoryId): ?Package
    {
        if (blank($name)) {
            return null;
        }
        $query = Package::query()->where('status', 'active');
        if ($categoryId) {
            $query->where('category_id', $categoryId);
        }

        return $this->findByName($query, $name);
    }

    private function findClient(?string $email, ?string $phone): ?Client
    {
        return Client::query()->where(function ($query) use ($email, $phone) {
            if (filled($email)) {
                $query->orWhereRaw('lower(email) = ?', [strtolower(trim((string) $email))]);
            }
            if (filled($phone)) {
                $query->orWhere('phone', trim((string) $phone));
            }
        })->first();
    }

    private function findUserByEmail(?string $email): ?string
    {
        if (blank($email)) {
            return null;
        }

        return User::query()->whereRaw('lower(email) = ?', [strtolower(trim((string) $email))])->value('id');
    }

    private function findByName($query, ?string $name): mixed
    {
        if (blank($name)) {
            return null;
        }

        return $query->whereRaw('lower(name) = ?', [strtolower(trim((string) $name))])->first();
    }

    private function columnKey(string $value): string
    {
        return Str::of($value)->ascii()->lower()->replaceMatches('/[^a-z0-9]+/', '_')->trim('_')->value();
    }

    private function isExampleOrEmpty(array $row): bool
    {
        if (in_array(Str::lower(trim((string) ($row['contoh'] ?? ''))), ['ya', 'yes', 'true', '1'], true)) {
            return true;
        }

        return count(array_filter($row, fn ($value) => filled($value))) === 0;
    }

    private function commaList(mixed $value): array
    {
        return array_values(array_filter(array_map('trim', explode(',', (string) $value))));
    }

    private function numberValue(mixed $value): float
    {
        if (blank($value)) {
            return 0;
        }

        return (float) str_replace([',', ' '], ['', ''], (string) $value);
    }

    private function isNumericValue(mixed $value): bool
    {
        return is_numeric(str_replace([',', ' '], ['', ''], (string) $value));
    }

    private function dateValue(mixed $value): ?string
    {
        if (blank($value)) {
            return null;
        }
        if (is_numeric($value) && (float) $value > 1000) {
            return Date::excelToDateTimeObject((float) $value)->format('Y-m-d');
        }

        try {
            return Carbon::parse((string) $value)->format('Y-m-d');
        } catch (\Throwable) {
            return null;
        }
    }

    private function jsonValue(mixed $value, string $context, array &$errors): array
    {
        if (blank($value)) {
            return [];
        }
        $decoded = json_decode((string) $value, true);
        if (! is_array($decoded)) {
            $errors[] = "{$context}: kolom JSON harus berisi JSON valid.";

            return [];
        }

        return $decoded;
    }

    private function throwIfErrors(array $errors): void
    {
        if ($errors !== []) {
            throw ValidationException::withMessages(['file' => array_slice($errors, 0, 15)]);
        }
    }

    private function applyClientFilters($query, Request $request): void
    {
        if ($search = $request->string('search')->trim()->value()) {
            $query->where(fn ($q) => $q->where('name', 'ilike', "%{$search}%")->orWhere('email', 'ilike', "%{$search}%")->orWhere('phone', 'ilike', "%{$search}%"));
        }
        foreach (['status', 'city', 'source'] as $filter) {
            if ($value = $request->input($filter)) {
                if (! in_array($value, ['Semua', 'all'], true)) {
                    $query->where($filter, $value);
                }
            }
        }
    }

    private function applyProjectFilters($query, Request $request): void
    {
        if ($search = $request->string('search')->trim()->value()) {
            $query->where(fn ($q) => $q->where('name', 'ilike', "%{$search}%")->orWhere('project_number', 'ilike', "%{$search}%"));
        }
        if ($tab = $request->input('tab')) {
            match ($tab) {
                'draft' => $query->where('status', 'draft'),
                'berlangsung' => $query->whereIn('status', ['in_progress', 'editing', 'active']),
                'selesai' => $query->where('status', 'completed'),
                'ditunda' => $query->whereIn('status', ['on_hold', 'pending', 'booking']),
                'dibatalkan' => $query->where('status', 'cancelled'),
                default => null,
            };
        }
        if (($categoryId = $request->input('category_id')) && ! in_array($categoryId, ['Semua Kategori', 'all'], true)) {
            $query->where('category_id', $categoryId);
        }
        if (($status = $request->input('status')) && ! in_array($status, ['Semua Status', 'all'], true)) {
            $query->where('status', $status);
        }
        if (($supervisorId = $request->input('supervisor_id')) && ! in_array($supervisorId, ['Semua Supervisor', 'all'], true)) {
            $query->where('supervisor_id', $supervisorId);
        }
        if ($date = $request->input('date')) {
            $query->where(fn ($q) => $q->whereDate('event_date', $date)->orWhereDate('deadline', $date));
        }
    }
}
