<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Package;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkflowController extends Controller
{
    public function index(Request $request): Response
    {
        $categories = Category::withCount('packages')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $packages = Package::with('category:id,name,workflow_type,color')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(function ($pkg) {
                $pkg->included_deliverables = $this->normalizeDeliverables($pkg->included_deliverables ?? [], $pkg->name);
                return $pkg;
            });

        return Inertia::render('MasterData/Workflows/Index', [
            'categories' => $categories,
            'packages'   => $packages,
            'workflows'  => static::getWorkflowDefinitions(),
            'filters'    => $request->only(['search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'nullable|string',
            'steps'       => 'required|array|min:1',
            'steps.*.name'     => 'required|string|max:255',
            'steps.*.phase'    => 'nullable|string|max:100',
            'steps.*.duration' => 'nullable|string|max:100',
            'steps.*.activity' => 'nullable|string',
        ]);

        $allWorkflows = static::getWorkflowDefinitions();
        $newId = max(array_column($allWorkflows, 'id') ?: [0]) + 1;

        $formattedSteps = collect($validated['steps'])->map(function ($s, $idx) {
            $duration = $s['duration'] ?? ($s['dl'] ?? 'H+14');
            return [
                'id'          => $idx + 1,
                'num'         => $idx + 1,
                'name'        => trim($s['name']),
                'phase'       => $s['phase'] ?? 'Operasional',
                'duration'    => $duration,
                'activity'    => $s['activity'] ?? '',
                'dur'         => $duration,
                'dl'          => $duration,
                'deliv'       => $s['deliv'] ?? trim($s['name']),
                'description' => $s['activity'] ?? '',
            ];
        })->values()->all();

        $allWorkflows[] = [
            'id'          => $newId,
            'type'        => 'custom',
            'name'        => trim($validated['name']),
            'description' => $validated['description'] ?? '',
            'steps_count' => count($formattedSteps),
            'status'      => $validated['status'] ?? 'Aktif',
            'steps'       => $formattedSteps,
        ];

        \App\Models\Setting::set('workflow_definitions', $allWorkflows, 'master_data', 'json');

        activity()
            ->causedBy($request->user())
            ->event('created')
            ->log("Workflow baru {$validated['name']} ditambahkan ke database");

        return redirect()->back()->with('success', "Workflow \"{$validated['name']}\" berhasil ditambahkan.");
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'nullable|string',
            'steps'       => 'required|array|min:1',
            'steps.*.name'     => 'required|string|max:255',
            'steps.*.phase'    => 'nullable|string|max:100',
            'steps.*.duration' => 'nullable|string|max:100',
            'steps.*.activity' => 'nullable|string',
        ]);

        $allWorkflows = static::getWorkflowDefinitions();
        $targetIndex = null;
        foreach ($allWorkflows as $idx => $wf) {
            if ((string)($wf['id'] ?? '') === (string)$id || ($wf['type'] ?? '') === (string)$id) {
                $targetIndex = $idx;
                break;
            }
        }

        $formattedSteps = collect($validated['steps'])->map(function ($s, $idx) {
            $duration = $s['duration'] ?? ($s['dl'] ?? 'H+14');
            return [
                'id'          => $idx + 1,
                'num'         => $idx + 1,
                'name'        => trim($s['name']),
                'phase'       => $s['phase'] ?? 'Operasional',
                'duration'    => $duration,
                'activity'    => $s['activity'] ?? '',
                'dur'         => $duration,
                'dl'          => $duration,
                'deliv'       => $s['deliv'] ?? trim($s['name']),
                'description' => $s['activity'] ?? '',
            ];
        })->values()->all();

        if ($targetIndex !== null) {
            $allWorkflows[$targetIndex]['name'] = trim($validated['name']);
            $allWorkflows[$targetIndex]['description'] = $validated['description'] ?? '';
            $allWorkflows[$targetIndex]['status'] = $validated['status'] ?? 'Aktif';
            $allWorkflows[$targetIndex]['steps_count'] = count($formattedSteps);
            $allWorkflows[$targetIndex]['steps'] = $formattedSteps;
        } else {
            $newId = max(array_column($allWorkflows, 'id') ?: [0]) + 1;
            $allWorkflows[] = [
                'id'          => $newId,
                'type'        => 'custom',
                'name'        => trim($validated['name']),
                'description' => $validated['description'] ?? '',
                'steps_count' => count($formattedSteps),
                'status'      => $validated['status'] ?? 'Aktif',
                'steps'       => $formattedSteps,
            ];
        }

        \App\Models\Setting::set('workflow_definitions', $allWorkflows, 'master_data', 'json');

        activity()
            ->causedBy($request->user())
            ->event('updated')
            ->log("Workflow {$validated['name']} diperbarui dengan target deadline di database");

        return redirect()->back()->with('success', "Workflow \"{$validated['name']}\" beserta Target Deadline berhasil disimpan ke database!");
    }

    public function destroy($id): RedirectResponse
    {
        $allWorkflows = static::getWorkflowDefinitions();
        $filtered = array_values(array_filter($allWorkflows, fn ($wf) => (string)($wf['id'] ?? '') !== (string)$id && ($wf['type'] ?? '') !== (string)$id));
        
        \App\Models\Setting::set('workflow_definitions', $filtered, 'master_data', 'json');

        return redirect()->back()->with('success', 'Workflow berhasil dihapus dari database.');
    }

    /**
     * Get active workflow definitions from Database or standard fallback.
     */
    public static function getWorkflowDefinitions(): array
    {
        $saved = \App\Models\Setting::get('workflow_definitions');
        if (!empty($saved) && is_array($saved)) {
            return $saved;
        }
        return static::getDefaultWorkflowDefinitions();
    }

    /**
     * Standard default workflow definitions.
     */
    public static function getDefaultWorkflowDefinitions(): array
    {
        return [
            [
                'id' => 1,
                'type' => 'wedding',
                'name' => 'Workflow Wedding (7 Tahap)',
                'description' => 'Alur kerja komprehensif tim untuk kategori Wedding & International Wedding (Akad & Resepsi) dari pra-acara hingga produksi cetak.',
                'steps_count' => 7,
                'status' => 'Aktif',
                'steps' => [
                    [
                        'id' => 1,
                        'num' => 1,
                        'name' => 'Booking & Briefing Konsep',
                        'phase' => 'Pra-Acara',
                        'duration' => 'H-14 s/d H-1',
                        'activity' => 'Konsultasi konsep visual, moodboard, cek rundown acara & koordinasi tim WO.',
                        'dur' => 'H-14 s/d H-1',
                        'dl' => 'H-1',
                        'deliv' => 'Konfirmasi Konsep & Rundown',
                        'description' => 'Konsultasi konsep & koordinasi rundown',
                    ],
                    [
                        'id' => 2,
                        'num' => 2,
                        'name' => 'Hari H (Liputan & Shooting)',
                        'phase' => 'Hari H',
                        'duration' => 'Hari H',
                        'activity' => 'Dokumentasi penuh akad & resepsi, dilanjutkan proses ingest & backup ganda data.',
                        'dur' => 'Hari H',
                        'dl' => 'Hari H',
                        'deliv' => 'Liputan Hari H & Backup Data',
                        'description' => 'Liputan dokumentasi & backup data',
                    ],
                    [
                        'id' => 3,
                        'num' => 3,
                        'name' => 'Culling & Seleksi Preview',
                        'phase' => 'Pasca-Produksi',
                        'duration' => 'H+1 s/d H+3',
                        'activity' => 'Sortir foto terbaik, unggah preview sneak peek, dan share link Google Drive raw files.',
                        'dur' => '1 - 3 Hari',
                        'dl' => 'H+3',
                        'deliv' => 'Sneak Peek & Raw Upload',
                        'description' => 'Sortir foto & upload preview awal',
                    ],
                    [
                        'id' => 4,
                        'num' => 4,
                        'name' => 'Editing Foto & Video Highlight',
                        'phase' => 'Pasca-Produksi',
                        'duration' => 'H+7 s/d H+21',
                        'activity' => 'Retouching foto pilihan, color grading, editing teaser Instagram & cinematic highlight.',
                        'dur' => '1 - 3 Minggu',
                        'dl' => 'H+21',
                        'deliv' => 'Master Edited & Cinematic Video',
                        'description' => 'Retouch foto pilihan & video editing',
                    ],
                    [
                        'id' => 5,
                        'num' => 5,
                        'name' => 'Review Klien & Layouting Album',
                        'phase' => 'Review',
                        'duration' => 'H+21 s/d H+30',
                        'activity' => 'Desain layout photobook album dan sesi approval/revisi draft bersama klien.',
                        'dur' => '1 Minggu',
                        'dl' => 'H+30',
                        'deliv' => 'Approval Layout Album',
                        'description' => 'Layouting album & approval klien',
                    ],
                    [
                        'id' => 6,
                        'num' => 6,
                        'name' => 'Produksi Cetak & Packaging',
                        'phase' => 'Finishing',
                        'duration' => 'H+30 s/d H+45',
                        'activity' => 'Pencetakan album premium hardcover, bingkai canvas, dan pengemasan box kayu exclusive.',
                        'dur' => '2 Minggu',
                        'dl' => 'H+45',
                        'deliv' => 'Cetak Album Fisik & Box',
                        'description' => 'Cetak album fisik & packaging box',
                    ],
                    [
                        'id' => 7,
                        'num' => 7,
                        'name' => 'Penyerahan Final (Handover)',
                        'phase' => 'Selesai',
                        'duration' => 'H+45 s/d H+60',
                        'activity' => 'Serah terima paket album fisik & flashdisk via kurir serta konfirmasi kepuasan klien.',
                        'dur' => 'Final',
                        'dl' => 'H+60',
                        'deliv' => 'Serah Terima Lengkap',
                        'description' => 'Handover paket fisik & master archive',
                    ],
                ],
            ],
            [
                'id' => 2,
                'type' => 'non_wedding',
                'name' => 'Workflow Non-Wedding (5 Tahap)',
                'description' => 'Alur kerja ringkas untuk sesi Prewedding, Engagement, Event, Commercial & Portrait reguler.',
                'steps_count' => 5,
                'status' => 'Aktif',
                'steps' => [
                    [
                        'id' => 1,
                        'num' => 1,
                        'name' => 'Booking & Briefing Sesi',
                        'phase' => 'Pra-Acara',
                        'duration' => 'H-7 s/d H-1',
                        'activity' => 'Pemilihan tema, moodboard konsep foto, lokasi shooting, dan wardrobe guide.',
                        'dur' => 'H-7 s/d H-1',
                        'dl' => 'H-1',
                        'deliv' => 'Briefing & Moodboard',
                        'description' => 'Briefing konsep & persiapan teknis',
                    ],
                    [
                        'id' => 2,
                        'num' => 2,
                        'name' => 'Hari H Sesi Foto & Video',
                        'phase' => 'Hari H',
                        'duration' => 'Hari H',
                        'activity' => 'Pelaksanaan sesi pemotretan dan videografi sesuai durasi paket.',
                        'dur' => 'Hari H',
                        'dl' => 'Hari H',
                        'deliv' => 'Shooting Hari H & Backup Data',
                        'description' => 'Sesi pemotretan & backup raw files',
                    ],
                    [
                        'id' => 3,
                        'num' => 3,
                        'name' => 'Culling & Editing Color Grade',
                        'phase' => 'Pasca-Produksi',
                        'duration' => 'H+1 s/d H+7',
                        'activity' => 'Sortir foto terbaik, color grading tone khas, dan retouching foto pilihan.',
                        'dur' => '1 Minggu',
                        'dl' => 'H+7',
                        'deliv' => 'Master Retouched Photos',
                        'description' => 'Retouch foto & video editing',
                    ],
                    [
                        'id' => 4,
                        'num' => 4,
                        'name' => 'Review Klien & Revisi',
                        'phase' => 'Review',
                        'duration' => 'H+7 s/d H+14',
                        'activity' => 'Pengiriman draft preview untuk dikonfirmasi atau revisi minor oleh klien.',
                        'dur' => '3 - 7 Hari',
                        'dl' => 'H+14',
                        'deliv' => 'Approval Hasil Klien',
                        'description' => 'Preview klien & revisi',
                    ],
                    [
                        'id' => 5,
                        'num' => 5,
                        'name' => 'Penyerahan Final',
                        'phase' => 'Selesai',
                        'duration' => 'H+14',
                        'activity' => 'Pengiriman seluruh file resolusi tinggi via Google Drive dan cetak frame foto.',
                        'dur' => 'Final',
                        'dl' => 'H+14',
                        'deliv' => 'Final High-Res Deliverables',
                        'description' => 'Handover final link & produk',
                    ],
                ],
            ],
            [
                'id' => 3,
                'type' => 'custom',
                'name' => 'Workflow Custom / Bundling (6 Tahap)',
                'description' => 'Alur kerja fleksibel untuk paket bundling multi-acara dan liputan kebutuhan khusus.',
                'steps_count' => 6,
                'status' => 'Aktif',
                'steps' => [
                    [
                        'id' => 1,
                        'num' => 1,
                        'name' => 'Konsultasi Konsep Multi-Acara',
                        'phase' => 'Pra-Acara',
                        'duration' => 'H-30 s/d H-1',
                        'activity' => 'Penyusunan timeline terpadu beberapa sesi acara, moodboard, dan penugasan tim.',
                        'dur' => 'Pra-Acara',
                        'dl' => 'H-1',
                        'deliv' => 'Master Rundown & Moodboard',
                        'description' => 'Konsultasi terpadu multi-event',
                    ],
                    [
                        'id' => 2,
                        'num' => 2,
                        'name' => 'Sesi 1 (Prewedding / Acara Awal)',
                        'phase' => 'Hari H Sesi 1',
                        'duration' => 'Sesi 1',
                        'activity' => 'Liputan sesi pembuka atau foto pra-nikah dan penyediaan sneak peek kilat.',
                        'dur' => 'Sesi 1',
                        'dl' => 'Sesi 1',
                        'deliv' => 'Foto Sesi 1 & Teaser',
                        'description' => 'Pelaksanaan sesi awal',
                    ],
                    [
                        'id' => 3,
                        'num' => 3,
                        'name' => 'Sesi 2 (Main Event / Resepsi)',
                        'phase' => 'Hari H Sesi 2',
                        'duration' => 'Sesi 2',
                        'activity' => 'Liputan acara puncak / resepsi dan pengamanan seluruh file backup.',
                        'dur' => 'Main Event',
                        'dl' => 'Hari H Sesi 2',
                        'deliv' => 'Liputan Sesi Utama & Backup',
                        'description' => 'Pelaksanaan sesi utama',
                    ],
                    [
                        'id' => 4,
                        'num' => 4,
                        'name' => 'Editing & Video Assembly',
                        'phase' => 'Pasca-Produksi',
                        'duration' => 'H+7 s/d H+21',
                        'activity' => 'Penggabungan editing kedua sesi, color grading, dan pembuatan teaser video.',
                        'dur' => '2 - 3 Minggu',
                        'dl' => 'H+21',
                        'deliv' => 'Master Edited & Highlight Film',
                        'description' => 'Editing komprehensif foto & video',
                    ],
                    [
                        'id' => 5,
                        'num' => 5,
                        'name' => 'Produksi Album & Box Cetak',
                        'phase' => 'Finishing',
                        'duration' => 'H+21 s/d H+35',
                        'activity' => 'Desain layout album gabungan multi-event dan pembuatan box packaging custom.',
                        'dur' => '2 Minggu',
                        'dl' => 'H+35',
                        'deliv' => 'Cetak Custom Album & Box',
                        'description' => 'Layout & cetak photobook custom',
                    ],
                    [
                        'id' => 6,
                        'num' => 6,
                        'name' => 'Penyerahan Lengkap',
                        'phase' => 'Selesai',
                        'duration' => 'H+35 s/d H+45',
                        'activity' => 'Penyerahan seluruh berkas fisik, flashdisk exclusive, dan link cloud storage permanen.',
                        'dur' => 'Final',
                        'dl' => 'H+45',
                        'deliv' => 'Serah Terima Lengkap',
                        'description' => 'Handover seluruh paket lengkap',
                    ],
                ],
            ],
        ];
    }

    /**
     * Update entire list of deliverables for a specific package.
     */
    public function updatePackageDeliverables(Request $request, Package $package): RedirectResponse
    {
        $validated = $request->validate([
            'deliverables' => 'required|array',
            'deliverables.*.name' => 'required|string|max:255',
            'deliverables.*.type' => 'nullable|string',
            'deliverables.*.deadline' => 'nullable|string',
            'deliverables.*.description' => 'nullable|string',
            'deliverables.*.required' => 'nullable|boolean',
            'deliverables.*.by_owner' => 'nullable|boolean',
        ]);

        $deliverables = collect($validated['deliverables'])->map(function ($item, $idx) {
            $type = $item['type'] ?? 'Photo';
            return [
                'id'          => $item['id'] ?? ($idx + 1),
                'name'        => trim($item['name']),
                'type'        => $type,
                'description' => $item['description'] ?? '',
                'deadline'    => $item['deadline'] ?? ($item['target_deadline'] ?? 'H+14'),
                'required'    => (bool) ($item['required'] ?? ($item['is_required'] ?? true)),
                'by_owner'    => (bool) ($item['by_owner'] ?? false),
            ];
        })->values()->all();

        $package->included_deliverables = $deliverables;
        $package->save();

        activity()
            ->causedBy($request->user())
            ->performedOn($package)
            ->event('updated')
            ->log("Deliverables template untuk paket {$package->name} diperbarui di database");

        return redirect()->back()->with('success', "Deliverables untuk paket \"{$package->name}\" berhasil disimpan ke database.");
    }

    /**
     * Add a single deliverable to a package.
     */
    public function addPackageDeliverable(Request $request, Package $package): RedirectResponse
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'type'            => 'required|string|in:Photo,Video,Album,Special',
            'target_deadline' => 'nullable|string|max:50',
            'description'     => 'nullable|string',
            'is_required'     => 'nullable|boolean',
            'by_owner'        => 'nullable|boolean',
        ]);

        $current = $this->normalizeDeliverables($package->included_deliverables ?? [], $package->name);
        $nextId = empty($current) ? 1 : (max(array_column($current, 'id') ?: [0]) + 1);

        $newItem = [
            'id'          => $nextId,
            'name'        => trim($validated['name']),
            'type'        => $validated['type'],
            'description' => $validated['description'] ?? '',
            'deadline'    => $validated['target_deadline'] ?? 'H+14',
            'required'    => (bool) ($validated['is_required'] ?? true),
            'by_owner'    => (bool) ($validated['by_owner'] ?? false),
        ];

        $current[] = $newItem;
        $package->included_deliverables = $current;
        $package->save();

        activity()
            ->causedBy($request->user())
            ->performedOn($package)
            ->event('updated')
            ->log("Deliverable \"{$newItem['name']}\" ditambahkan ke paket {$package->name}");

        return redirect()->back()->with('success', "Deliverable \"{$newItem['name']}\" berhasil disimpan ke database untuk paket {$package->name}.");
    }

    /**
     * Delete a single deliverable from a package.
     */
    public function destroyPackageDeliverable(Package $package, $deliverableId): RedirectResponse
    {
        $current = $this->normalizeDeliverables($package->included_deliverables ?? [], $package->name);
        $filtered = array_values(array_filter($current, fn ($item) => (string) ($item['id'] ?? '') !== (string) $deliverableId));

        $package->included_deliverables = $filtered;
        $package->save();

        activity()
            ->causedBy(request()->user())
            ->performedOn($package)
            ->event('updated')
            ->log("Deliverable dihapus dari paket {$package->name}");

        return redirect()->back()->with('success', "Deliverable berhasil dihapus dari paket {$package->name} di database.");
    }

    /**
     * Update category workflow type.
     */
    public function updateCategoryWorkflowType(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'workflow_type' => 'required|string|in:wedding,non_wedding,custom',
        ]);

        $category->update(['workflow_type' => $validated['workflow_type']]);

        return redirect()->back()->with('success', "Workflow kategori \"{$category->name}\" berhasil diperbarui.");
    }

    /**
     * Store new package directly from workflow manager.
     */
    public function storePackage(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id'        => 'required|uuid|exists:categories,id',
            'name'               => 'required|string|max:255',
            'base_price'         => 'nullable|numeric|min:0',
            'description'        => 'nullable|string',
            'included_services'  => 'nullable|array',
        ]);

        $package = Package::create([
            'category_id'           => $validated['category_id'],
            'name'                  => trim($validated['name']),
            'base_price'            => $validated['base_price'] ?? 0,
            'description'           => $validated['description'] ?? '',
            'duration_hours'        => 4,
            'status'                => 'active',
            'included_services'     => $validated['included_services'] ?? ['Studio Photographer'],
            'included_deliverables' => [
                ['id' => 1, 'name' => 'Sneak Peek Photo', 'type' => 'Photo', 'description' => 'Preview pilihan 24 jam', 'deadline' => 'H+1', 'required' => true, 'by_owner' => false],
                ['id' => 2, 'name' => 'All Unedited Files', 'type' => 'Photo', 'description' => 'File asli resolusi tinggi', 'deadline' => 'H+3', 'required' => true, 'by_owner' => false],
                ['id' => 3, 'name' => 'Master Edited Photos', 'type' => 'Photo', 'description' => 'Retouching & color grading', 'deadline' => 'H+14', 'required' => true, 'by_owner' => false],
            ],
        ]);

        return redirect()->back()->with('success', "Paket \"{$package->name}\" berhasil ditambahkan ke database.");
    }

    /**
     * Update package name, category, price, and description.
     */
    public function updatePackage(Request $request, Package $package): RedirectResponse
    {
        $validated = $request->validate([
            'category_id'       => 'required|uuid|exists:categories,id',
            'name'              => 'required|string|max:255',
            'base_price'        => 'nullable|numeric|min:0',
            'description'       => 'nullable|string',
            'status'            => 'nullable|string|in:active,inactive',
            'included_services' => 'nullable|array',
        ]);

        $updateData = [
            'category_id' => $validated['category_id'],
            'name'        => trim($validated['name']),
            'base_price'  => $validated['base_price'] ?? 0,
            'description' => $validated['description'] ?? '',
            'status'      => $validated['status'] ?? 'active',
        ];

        if (array_key_exists('included_services', $validated)) {
            $updateData['included_services'] = $validated['included_services'];
        }

        $package->update($updateData);

        activity()
            ->causedBy($request->user())
            ->performedOn($package)
            ->event('updated')
            ->log("Paket {$package->name} diperbarui dari workflow manager");

        return redirect()->back()->with('success', "Paket \"{$package->name}\" berhasil diperbarui di database.");
    }

    /**
     * Delete a package from database.
     */
    public function destroyPackage(Package $package): RedirectResponse
    {
        $name = $package->name;
        $package->delete();

        activity()
            ->causedBy(request()->user())
            ->performedOn($package)
            ->event('deleted')
            ->log("Paket {$name} dihapus dari workflow manager");

        return redirect()->back()->with('success', "Paket \"{$name}\" berhasil dihapus dari database.");
    }

    /**
     * Helper to normalize deliverables list.
     */
    private function normalizeDeliverables($deliverables, string $packageName = ''): array
    {
        if (empty($deliverables) || !is_array($deliverables)) {
            return [];
        }

        $normalized = [];
        foreach ($deliverables as $index => $item) {
            if (is_string($item)) {
                $name = $item;
                $nameLower = strtolower($name);
                $type = 'Photo';
                $deadline = 'H+14';
                $byOwner = false;

                if (str_contains($nameLower, 'video') || str_contains($nameLower, 'teaser') || str_contains($nameLower, 'film') || str_contains($nameLower, 'reels') || str_contains($nameLower, 'aftermovie')) {
                    $type = 'Video';
                    $deadline = str_contains($nameLower, 'teaser') || str_contains($nameLower, 'reels') ? 'H+7' : 'H+30';
                    $byOwner = str_contains($nameLower, 'highlight') || str_contains($nameLower, 'cinematic') || str_contains($nameLower, 'film');
                } elseif (str_contains($nameLower, 'album')) {
                    $type = 'Album';
                    $deadline = 'H+45';
                    $byOwner = true;
                } elseif (str_contains($nameLower, 'canvas') || str_contains($nameLower, 'drive') || str_contains($nameLower, 'license') || str_contains($nameLower, 'flashdisk') || str_contains($nameLower, 'box') || str_contains($nameLower, 'prints')) {
                    $type = 'Special';
                    $deadline = str_contains($nameLower, 'drive') ? 'H+3' : (str_contains($nameLower, 'canvas') ? 'H+30' : 'H+7');
                } elseif (str_contains($nameLower, 'sneak peek') || str_contains($nameLower, 'preview') || str_contains($nameLower, 'fast turnaround')) {
                    $deadline = 'H+1';
                } elseif (str_contains($nameLower, 'raw') || str_contains($nameLower, 'unedited') || str_contains($nameLower, 'all edited')) {
                    $deadline = 'H+3';
                }

                $normalized[] = [
                    'id'          => $index + 1,
                    'name'        => $name,
                    'type'        => $type,
                    'type_class'  => $this->getTypeClass($type),
                    'description' => "Item deliverable standar untuk {$packageName}",
                    'deadline'    => $deadline,
                    'required'    => true,
                    'by_owner'    => $byOwner,
                ];
            } elseif (is_array($item)) {
                $type = $item['type'] ?? 'Photo';
                $normalized[] = [
                    'id'          => $item['id'] ?? ($index + 1),
                    'name'        => $item['name'] ?? 'Deliverable Item',
                    'type'        => $type,
                    'type_class'  => $this->getTypeClass($type),
                    'description' => $item['description'] ?? '',
                    'deadline'    => $item['deadline'] ?? ($item['target_deadline'] ?? 'H+14'),
                    'required'    => (bool) ($item['required'] ?? ($item['is_required'] ?? true)),
                    'by_owner'    => (bool) ($item['by_owner'] ?? false),
                ];
            }
        }

        return $normalized;
    }

    private function getTypeClass(string $type): string
    {
        return match ($type) {
            'Video'   => 'bg-cyan-50 text-cyan-700 border-cyan-200',
            'Album'   => 'bg-amber-50 text-amber-700 border-amber-200',
            'Special' => 'bg-purple-50 text-purple-700 border-purple-200',
            default   => 'bg-sky-50 text-sky-700 border-sky-200',
        };
    }
}
