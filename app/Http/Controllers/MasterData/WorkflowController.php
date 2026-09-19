<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\AddPackageDeliverableRequest;
use App\Http\Requests\MasterData\StoreWorkflowRequest;
use App\Http\Requests\MasterData\UpdatePackageDeliverablesRequest;
use App\Http\Requests\MasterData\UpdateWorkflowRequest;
use App\Models\Category;
use App\Models\Package;
use App\Services\WorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkflowController extends Controller
{
    public function __construct(
        protected WorkflowService $workflowService
    ) {}

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
                $pkg->included_deliverables = $this->workflowService->normalizeDeliverables($pkg->included_deliverables ?? [], $pkg->name);
                return $pkg;
            });

        return Inertia::render('MasterData/Workflows/Index', [
            'categories' => $categories,
            'packages'   => $packages,
            'workflows'  => $this->workflowService->getWorkflowDefinitions(),
            'filters'    => $request->only(['search']),
        ]);
    }

    public function store(StoreWorkflowRequest $request): RedirectResponse
    {
        $workflow = $this->workflowService->storeWorkflow($request->validated(), $request->user());

        return redirect()->back()->with('success', "Workflow \"{$workflow['name']}\" berhasil ditambahkan.");
    }

    public function update(UpdateWorkflowRequest $request, string|int $id): RedirectResponse
    {
        $workflow = $this->workflowService->updateWorkflow($id, $request->validated(), $request->user());

        return redirect()->back()->with('success', "Workflow \"{$workflow['name']}\" beserta Target Deadline berhasil disimpan ke database!");
    }

    public function destroy(string|int $id): RedirectResponse
    {
        $this->workflowService->destroyWorkflow($id, auth()->user());

        return redirect()->back()->with('success', 'Workflow berhasil dihapus dari database.');
    }

    public function updatePackageDeliverables(UpdatePackageDeliverablesRequest $request, Package $package): RedirectResponse
    {
        $this->workflowService->updatePackageDeliverables($package, $request->validated()['deliverables'], $request->user());

        return redirect()->back()->with('success', "Deliverables untuk paket \"{$package->name}\" berhasil disimpan ke database.");
    }

    public function addPackageDeliverable(AddPackageDeliverableRequest $request, Package $package): RedirectResponse
    {
        $validated = $request->validated();
        $this->workflowService->addPackageDeliverable($package, $validated, $request->user());

        return redirect()->back()->with('success', "Deliverable \"{$validated['name']}\" berhasil disimpan ke database untuk paket {$package->name}.");
    }

    public function destroyPackageDeliverable(Package $package, string|int $deliverableId): RedirectResponse
    {
        $this->workflowService->destroyPackageDeliverable($package, $deliverableId, request()->user());

        return redirect()->back()->with('success', "Deliverable berhasil dihapus dari paket {$package->name} di database.");
    }

    public function updateCategoryWorkflowType(Request $request, Category $category): RedirectResponse
    {
        $validated = $request->validate([
            'workflow_type' => 'required|string|in:wedding,non_wedding,custom',
        ]);

        $this->workflowService->updateCategoryWorkflowType($category, $validated['workflow_type'], $request->user());

        return redirect()->back()->with('success', "Workflow kategori \"{$category->name}\" berhasil diperbarui.");
    }

    public function storePackage(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id'        => 'required|uuid|exists:categories,id',
            'name'               => 'required|string|max:255',
            'base_price'         => 'nullable|numeric|min:0',
            'description'        => 'nullable|string',
            'included_services'  => 'nullable|array',
        ]);

        $package = $this->workflowService->storePackage($validated, $request->user());

        return redirect()->back()->with('success', "Paket \"{$package->name}\" berhasil ditambahkan ke database.");
    }

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

        $this->workflowService->updatePackage($package, $validated, $request->user());

        return redirect()->back()->with('success', "Paket \"{$package->name}\" berhasil diperbarui di database.");
    }

    public function destroyPackage(Package $package): RedirectResponse
    {
        $name = $package->name;
        $this->workflowService->destroyPackage($package, request()->user());

        return redirect()->back()->with('success', "Paket \"{$name}\" berhasil dihapus dari database.");
    }

    /**
     * Backward-compatible static proxy to WorkflowService.
     */
    public static function getWorkflowDefinitions(): array
    {
        return app(WorkflowService::class)->getWorkflowDefinitions();
    }

    /**
     * Backward-compatible static proxy to WorkflowService.
     */
    public static function getDefaultWorkflowDefinitions(): array
    {
        return app(WorkflowService::class)->getDefaultWorkflowDefinitions();
    }
}
