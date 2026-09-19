<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Package;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WorkflowService
{
    /**
     * Get active workflow definitions from Database or standard fallback.
     */
    public function getWorkflowDefinitions(): array
    {
        $saved = Setting::get('workflow_definitions');
        if (!empty($saved) && is_array($saved)) {
            return $saved;
        }
        return $this->getDefaultWorkflowDefinitions();
    }

    /**
     * Standard default workflow definitions.
     */
    public function getDefaultWorkflowDefinitions(): array
    {
        return [
            [
                'id' => 1,
                'type' => 'wedding',
                'name' => 'Workflow Wedding (8 Tahap)',
                'description' => 'Alur kerja komprehensif tim untuk kategori Wedding & International Wedding (Akad & Resepsi) dari pra-acara hingga penyerahan berkas final.',
                'steps_count' => 8,
                'status' => 'Aktif',
                'steps' => [
                    [
                        'id' => 1,
                        'num' => 1,
                        'name' => 'Booking & DP',
                        'phase' => 'Pra-Acara',
                        'duration' => 'H-30 s/d H-14',
                        'activity' => 'Penerimaan uang muka (DP) telah terverifikasi. Jadwal tim, fotografer & videografer telah di-booking pada kalender kerja sistem.',
                        'dur' => 'H-30 s/d H-14',
                        'dl' => 'H-14',
                        'deliv' => 'Verifikasi DP & Booking Jadwal',
                        'description' => 'Verifikasi pembayaran DP & jadwal tim',
                    ],
                    [
                        'id' => 2,
                        'num' => 2,
                        'name' => 'TM Wedding',
                        'phase' => 'Pra-Acara',
                        'duration' => 'H-7 s/d H-1',
                        'activity' => 'Technical Meeting bersama perwakilan klien dan Wedding Organizer untuk finalisasi rundown serta checklist shot list foto.',
                        'dur' => 'H-7 s/d H-1',
                        'dl' => 'H-1',
                        'deliv' => 'Final Rundown & Shot List',
                        'description' => 'Technical Meeting & finalisasi rundown',
                    ],
                    [
                        'id' => 3,
                        'num' => 3,
                        'name' => 'Hari H',
                        'phase' => 'Hari H',
                        'duration' => 'Hari H',
                        'activity' => 'Pelaksanaan liputan dan dokumentasi live di lokasi acara oleh seluruh tim yang bertugas serta backup data ganda.',
                        'dur' => 'Hari H',
                        'dl' => 'Hari H',
                        'deliv' => 'Liputan Acara & Backup Raw Data',
                        'description' => 'Dokumentasi hari H & backup master data',
                    ],
                    [
                        'id' => 4,
                        'num' => 4,
                        'name' => 'Sneak Peak Photo Editing',
                        'phase' => 'Pasca-Produksi',
                        'duration' => 'H+1 s/d H+3',
                        'activity' => 'Tim sedang melakukan color grading kilat dan pemilihan foto highlight utama untuk preview kilat klien.',
                        'dur' => '1 - 3 Hari',
                        'dl' => 'H+3',
                        'deliv' => 'Sneak Peek Preview (20-50 Foto)',
                        'description' => 'Color grading kilat & preview teaser foto',
                    ],
                    [
                        'id' => 5,
                        'num' => 5,
                        'name' => 'Flashdrive + Box Delivery',
                        'phase' => 'Finishing',
                        'duration' => 'H+7 s/d H+14',
                        'activity' => 'Penyimpanan seluruh master raw file & hasil liputan ke dalam Flashdrive eksklusif dan penyiapan box kemasan.',
                        'dur' => '1 Minggu',
                        'dl' => 'H+14',
                        'deliv' => 'Exclusive Flashdrive & Box',
                        'description' => 'Pengisian flashdisk & box kemasan',
                    ],
                    [
                        'id' => 6,
                        'num' => 6,
                        'name' => 'Full Version Photo & Video Editing',
                        'phase' => 'Pasca-Produksi',
                        'duration' => 'H+14 s/d H+30',
                        'activity' => 'Editing menyeluruh seluruh foto terpilih dan perakitan video cinematic highlight & full documentary berdurasi lengkap.',
                        'dur' => '2 - 3 Minggu',
                        'dl' => 'H+30',
                        'deliv' => 'Master All Edited Photos & Cinematic Video',
                        'description' => 'Master editing foto pilihan & video cinematic',
                    ],
                    [
                        'id' => 7,
                        'num' => 7,
                        'name' => 'Album Layout Editing',
                        'phase' => 'Review',
                        'duration' => 'H+21 s/d H+35',
                        'activity' => 'Desain penataan layout halaman photobook wedding dan konfirmasi approval kepada klien sebelum dikirim ke percetakan.',
                        'dur' => '1 - 2 Minggu',
                        'dl' => 'H+35',
                        'deliv' => 'Approval Layout Photobook',
                        'description' => 'Desain layout album & approval klien',
                    ],
                    [
                        'id' => 8,
                        'num' => 8,
                        'name' => 'Final Delivery',
                        'phase' => 'Selesai',
                        'duration' => 'H+45 s/d H+60',
                        'activity' => 'Pengiriman seluruh paket fisik (album cetak, frame, flashdrive) dan berkas digital resolusi tinggi ke alamat klien.',
                        'dur' => 'Final',
                        'dl' => 'H+60',
                        'deliv' => 'Handover Lengkap Paket Fisik & Digital',
                        'description' => 'Penyerahan seluruh produk fisik & arsip cloud',
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
     * Store new custom workflow with DB transaction and rollback protection.
     */
    public function storeWorkflow(array $validated, ?User $user = null): array
    {
        DB::beginTransaction();
        try {
            $allWorkflows = $this->getWorkflowDefinitions();
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

            $newWorkflow = [
                'id'          => $newId,
                'type'        => 'custom',
                'name'        => trim($validated['name']),
                'description' => $validated['description'] ?? '',
                'steps_count' => count($formattedSteps),
                'status'      => $validated['status'] ?? 'Aktif',
                'steps'       => $formattedSteps,
            ];

            $allWorkflows[] = $newWorkflow;

            Setting::set('workflow_definitions', $allWorkflows, 'master_data', 'json');

            activity()
                ->causedBy($user ?? auth()->user())
                ->event('created')
                ->log("Workflow baru {$validated['name']} ditambahkan ke database");

            DB::commit();
            return $newWorkflow;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Gagal menambahkan workflow: " . $e->getMessage(), ['exception' => $e]);
            throw $e;
        }
    }

    /**
     * Update existing workflow definition with DB transaction and rollback.
     */
    public function updateWorkflow(string|int $id, array $validated, ?User $user = null): array
    {
        DB::beginTransaction();
        try {
            $allWorkflows = $this->getWorkflowDefinitions();
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

            Setting::set('workflow_definitions', $allWorkflows, 'master_data', 'json');

            activity()
                ->causedBy($user ?? auth()->user())
                ->event('updated')
                ->log("Workflow {$validated['name']} diperbarui di database");

            DB::commit();
            return $allWorkflows[$targetIndex ?? (count($allWorkflows) - 1)];
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Gagal memperbarui workflow: " . $e->getMessage(), ['exception' => $e]);
            throw $e;
        }
    }

    /**
     * Delete workflow definition with DB transaction.
     */
    public function destroyWorkflow(string|int $id, ?User $user = null): bool
    {
        DB::beginTransaction();
        try {
            $allWorkflows = $this->getWorkflowDefinitions();
            $filtered = array_values(array_filter($allWorkflows, fn ($wf) => (string)($wf['id'] ?? '') !== (string)$id && ($wf['type'] ?? '') !== (string)$id));

            Setting::set('workflow_definitions', $filtered, 'master_data', 'json');

            activity()
                ->causedBy($user ?? auth()->user())
                ->event('deleted')
                ->log("Workflow id {$id} dihapus dari database");

            DB::commit();
            return true;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Gagal menghapus workflow: " . $e->getMessage(), ['exception' => $e]);
            throw $e;
        }
    }

    /**
     * Update category workflow type with DB transaction.
     */
    public function updateCategoryWorkflowType(Category $category, string $workflowType, ?User $user = null): Category
    {
        DB::beginTransaction();
        try {
            $category->update(['workflow_type' => $workflowType]);

            activity()
                ->causedBy($user ?? auth()->user())
                ->performedOn($category)
                ->event('updated')
                ->log("Workflow type kategori {$category->name} diubah menjadi {$workflowType}");

            DB::commit();
            return $category;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Gagal memperbarui workflow type kategori: " . $e->getMessage(), ['exception' => $e]);
            throw $e;
        }
    }

    /**
     * Update package deliverables list with DB transaction and rollback.
     */
    public function updatePackageDeliverables(Package $package, array $deliverables, ?User $user = null): Package
    {
        DB::beginTransaction();
        try {
            $formatted = collect($deliverables)->map(function ($item, $idx) {
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

            $package->included_deliverables = $formatted;
            $package->save();

            activity()
                ->causedBy($user ?? auth()->user())
                ->performedOn($package)
                ->event('updated')
                ->log("Deliverables template untuk paket {$package->name} diperbarui di database");

            DB::commit();
            return $package;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Gagal memperbarui package deliverables: " . $e->getMessage(), ['exception' => $e]);
            throw $e;
        }
    }

    /**
     * Add a single deliverable to package with DB transaction.
     */
    public function addPackageDeliverable(Package $package, array $item, ?User $user = null): Package
    {
        DB::beginTransaction();
        try {
            $current = $this->normalizeDeliverables($package->included_deliverables ?? [], $package->name);
            $nextId = empty($current) ? 1 : (max(array_column($current, 'id') ?: [0]) + 1);

            $newItem = [
                'id'          => $nextId,
                'name'        => trim($item['name']),
                'type'        => $item['type'],
                'description' => $item['description'] ?? '',
                'deadline'    => $item['target_deadline'] ?? 'H+14',
                'required'    => (bool) ($item['is_required'] ?? true),
                'by_owner'    => (bool) ($item['by_owner'] ?? false),
            ];

            $current[] = $newItem;
            $package->included_deliverables = $current;
            $package->save();

            activity()
                ->causedBy($user ?? auth()->user())
                ->performedOn($package)
                ->event('updated')
                ->log("Deliverable \"{$newItem['name']}\" ditambahkan ke paket {$package->name}");

            DB::commit();
            return $package;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Gagal menambahkan deliverable: " . $e->getMessage(), ['exception' => $e]);
            throw $e;
        }
    }

    /**
     * Delete a single deliverable from package with DB transaction.
     */
    public function destroyPackageDeliverable(Package $package, string|int $deliverableId, ?User $user = null): Package
    {
        DB::beginTransaction();
        try {
            $current = $this->normalizeDeliverables($package->included_deliverables ?? [], $package->name);
            $filtered = array_values(array_filter($current, fn ($item) => (string) ($item['id'] ?? '') !== (string) $deliverableId));

            $package->included_deliverables = $filtered;
            $package->save();

            activity()
                ->causedBy($user ?? auth()->user())
                ->performedOn($package)
                ->event('updated')
                ->log("Deliverable dihapus dari paket {$package->name}");

            DB::commit();
            return $package;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Gagal menghapus deliverable: " . $e->getMessage(), ['exception' => $e]);
            throw $e;
        }
    }

    /**
     * Store new package with DB transaction and rollback.
     */
    public function storePackage(array $data, ?User $user = null): Package
    {
        DB::beginTransaction();
        try {
            $package = Package::create([
                'category_id'           => $data['category_id'],
                'name'                  => trim($data['name']),
                'base_price'            => $data['base_price'] ?? 0,
                'description'           => $data['description'] ?? '',
                'duration_hours'        => 4,
                'status'                => 'active',
                'included_services'     => $data['included_services'] ?? ['Studio Photographer'],
                'included_deliverables' => [
                    ['id' => 1, 'name' => 'Sneak Peek Photo', 'type' => 'Photo', 'description' => 'Preview pilihan 24 jam', 'deadline' => 'H+1', 'required' => true, 'by_owner' => false],
                    ['id' => 2, 'name' => 'All Unedited Files', 'type' => 'Photo', 'description' => 'File asli resolusi tinggi', 'deadline' => 'H+3', 'required' => true, 'by_owner' => false],
                    ['id' => 3, 'name' => 'Master Edited Photos', 'type' => 'Photo', 'description' => 'Retouching & color grading', 'deadline' => 'H+14', 'required' => true, 'by_owner' => false],
                ],
            ]);

            activity()
                ->causedBy($user ?? auth()->user())
                ->performedOn($package)
                ->event('created')
                ->log("Paket \"{$package->name}\" ditambahkan ke database");

            DB::commit();
            return $package;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Gagal membuat paket: " . $e->getMessage(), ['exception' => $e]);
            throw $e;
        }
    }

    /**
     * Update package with DB transaction and rollback.
     */
    public function updatePackage(Package $package, array $data, ?User $user = null): Package
    {
        DB::beginTransaction();
        try {
            $updateData = [
                'category_id' => $data['category_id'],
                'name'        => trim($data['name']),
                'base_price'  => $data['base_price'] ?? 0,
                'description' => $data['description'] ?? '',
                'status'      => $data['status'] ?? 'active',
            ];

            if (array_key_exists('included_services', $data)) {
                $updateData['included_services'] = $data['included_services'];
            }

            $package->update($updateData);

            activity()
                ->causedBy($user ?? auth()->user())
                ->performedOn($package)
                ->event('updated')
                ->log("Paket {$package->name} diperbarui di database");

            DB::commit();
            return $package;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Gagal memperbarui paket: " . $e->getMessage(), ['exception' => $e]);
            throw $e;
        }
    }

    /**
     * Delete package with DB transaction and rollback.
     */
    public function destroyPackage(Package $package, ?User $user = null): bool
    {
        DB::beginTransaction();
        try {
            $name = $package->name;
            $deleted = (bool) $package->delete();

            activity()
                ->causedBy($user ?? auth()->user())
                ->performedOn($package)
                ->event('deleted')
                ->log("Paket {$name} dihapus dari database");

            DB::commit();
            return $deleted;
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Gagal menghapus paket: " . $e->getMessage(), ['exception' => $e]);
            throw $e;
        }
    }

    /**
     * Helper to normalize deliverables list.
     */
    public function normalizeDeliverables($deliverables, string $packageName = ''): array
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
                }

                $normalized[] = [
                    'id'          => $index + 1,
                    'name'        => $name,
                    'type'        => $type,
                    'description' => '',
                    'deadline'    => $deadline,
                    'required'    => true,
                    'by_owner'    => $byOwner,
                ];
            } elseif (is_array($item)) {
                $name = $item['name'] ?? ('Deliverable ' . ($index + 1));
                $nameLower = strtolower($name);
                $type = $item['type'] ?? 'Photo';
                $deadline = $item['deadline'] ?? ($item['target_deadline'] ?? 'H+14');
                $byOwner = (bool) ($item['by_owner'] ?? false);

                if (empty($item['type'])) {
                    if (str_contains($nameLower, 'video') || str_contains($nameLower, 'teaser') || str_contains($nameLower, 'film') || str_contains($nameLower, 'reels')) {
                        $type = 'Video';
                    } elseif (str_contains($nameLower, 'album')) {
                        $type = 'Album';
                    }
                }

                $normalized[] = [
                    'id'          => $item['id'] ?? ($index + 1),
                    'name'        => $name,
                    'type'        => $type,
                    'description' => $item['description'] ?? '',
                    'deadline'    => $deadline,
                    'required'    => (bool) ($item['required'] ?? ($item['is_required'] ?? true)),
                    'by_owner'    => $byOwner,
                ];
            }
        }

        return $normalized;
    }
}
