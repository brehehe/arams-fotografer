<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ClientPortalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FileLinkController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\MasterData\AddonController;
use App\Http\Controllers\MasterData\CategoryController;
use App\Http\Controllers\MasterData\NoteTemplateController;
use App\Http\Controllers\MasterData\PackageController;
use App\Http\Controllers\MasterData\PaymentMethodController;
use App\Http\Controllers\MasterData\ServiceController;
use App\Http\Controllers\MasterData\WorkflowController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WeddingOrganizerController;
use App\Http\Controllers\ClientIntakeController;
use App\Http\Controllers\ClientSourceController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Client Intake / Booking Form
Route::get('/form-klien', [ClientIntakeController::class, 'create'])->name('client.intake');
Route::get('/booking', fn () => redirect()->route('client.intake'));
Route::post('/form-klien', [ClientIntakeController::class, 'store'])->name('client.intake.store');

Route::get('/', function () {
    if (auth()->check()) {
        if (auth()->user()->hasRole('Client')) {
            return redirect()->route('client.dashboard');
        }
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    // 0. Client Portal (Portal Khusus Klien)
    Route::get('/portal', [ClientPortalController::class, 'dashboard'])->name('portal');
    Route::get('/portal/projects/{project}', [ClientPortalController::class, 'projectDetail'])->name('portal.projects.show');

    Route::prefix('client')->name('client.')->group(function () {
        Route::get('/dashboard', [ClientPortalController::class, 'dashboard'])->name('dashboard');
        Route::get('/projects', [ClientPortalController::class, 'projects'])->name('projects.index');
        Route::get('/projects/{project}', [ClientPortalController::class, 'projectDetail'])->name('projects.show');
    });

    // 1. Admin Studio Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // 2. Clients & Wedding Organizers (WO)
    Route::resource('clients', ClientController::class);
    Route::resource('wedding-organizers', WeddingOrganizerController::class)->except(['create', 'edit', 'show']);
    Route::get('/wedding-organizer', [WeddingOrganizerController::class, 'index'])->name('wedding-organizer.index');
    Route::get('/weeding-organizer', fn() => redirect()->route('wedding-organizer.index'));

    // 3. Projects
    Route::get('/project/create', fn () => redirect()->route('projects.create'));
    Route::get('/projects/{project}/invoice', [ProjectController::class, 'showInvoice'])->name('projects.invoice');
    Route::get('/invoices/{invoice}', [ProjectController::class, 'showInvoiceById'])->name('invoices.show');
    Route::resource('projects', ProjectController::class);
    Route::patch('/projects/{project}/status', [ProjectController::class, 'updateStatus'])->name('projects.status');
    Route::post('/projects/{project}/file-links', [FileLinkController::class, 'storeForProject'])->name('projects.file-links.store');

    // 4. Master Data
    Route::prefix('master-data')->name('master-data.')->group(function () {
        Route::resource('categories', CategoryController::class)->except(['create', 'edit', 'show']);
        Route::resource('services', ServiceController::class)->except(['create', 'edit', 'show']);
        Route::resource('packages', PackageController::class)->except(['create', 'edit', 'show']);
        Route::resource('addons', AddonController::class)->except(['create', 'edit', 'show']);
        Route::put('workflows/packages/{package}/deliverables', [WorkflowController::class, 'updatePackageDeliverables'])->name('workflows.packages.deliverables');
        Route::post('workflows/packages/{package}/deliverables', [WorkflowController::class, 'addPackageDeliverable'])->name('workflows.packages.deliverables.add');
        Route::delete('workflows/packages/{package}/deliverables/{deliverableId}', [WorkflowController::class, 'destroyPackageDeliverable'])->name('workflows.packages.deliverables.destroy');
        Route::post('workflows/packages', [WorkflowController::class, 'storePackage'])->name('workflows.packages.store');
        Route::put('workflows/packages/{package}', [WorkflowController::class, 'updatePackage'])->name('workflows.packages.update');
        Route::delete('workflows/packages/{package}', [WorkflowController::class, 'destroyPackage'])->name('workflows.packages.destroy');
        Route::put('workflows/categories/{category}/workflow-type', [WorkflowController::class, 'updateCategoryWorkflowType'])->name('workflows.categories.workflow-type');
        Route::resource('workflows', WorkflowController::class)->except(['create', 'edit', 'show']);
        Route::get('workflow-template', fn() => redirect()->route('master-data.workflows.index'));
        Route::resource('payment-methods', PaymentMethodController::class)->except(['create', 'edit', 'show']);
        Route::resource('notes', NoteTemplateController::class)->except(['create', 'edit', 'show']);
    });

    // 4.1. Sumber Klien / Referral
    Route::resource('client-sources', ClientSourceController::class)->except(['create', 'edit']);
    Route::get('/sumber-klien', fn() => redirect()->route('client-sources.index'));
    Route::get('/sumber-klien/{id}', fn($id) => redirect()->route('client-sources.show', $id));
    Route::post('/client-sources/{client_source}/appreciation', [ClientSourceController::class, 'storeAppreciation'])->name('client-sources.appreciation.store');
    Route::put('/client-sources/{client_source}/appreciation/{appreciation}', [ClientSourceController::class, 'updateAppreciation'])->name('client-sources.appreciation.update');
    Route::delete('/client-sources/{client_source}/appreciation/{appreciation}', [ClientSourceController::class, 'destroyAppreciation'])->name('client-sources.appreciation.destroy');

    // 5. Users
    Route::resource('users', UserController::class)->except(['create', 'edit', 'show']);

    // 6. Finance, Invoices & Payments
    Route::get('/payments/create', fn () => redirect()->route('finance.index'));
    Route::get('/finance', [FinanceController::class, 'index'])->name('finance.index');
    Route::get('/finance/invoices', [FinanceController::class, 'index'])->name('finance.invoices.index');
    Route::get('/invoices', fn () => redirect()->route('finance.index'));
    Route::post('/finance/payments', [FinanceController::class, 'storePayment'])->name('finance.payments.store');
    Route::post('/finance/invoices', [FinanceController::class, 'storeInvoice'])->name('finance.invoices.store');
    Route::post('/finance/transactions', [FinanceController::class, 'storeTransaction'])->name('finance.transactions.store');
    Route::delete('/finance/transactions/{transaction}', [FinanceController::class, 'destroyTransaction'])->name('finance.transactions.destroy');

    // 7. Calendar
    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar.index');
    Route::post('/calendar/schedules', [CalendarController::class, 'storeSchedule'])->name('calendar.schedules.store');
    Route::delete('/calendar/schedules/{schedule}', [CalendarController::class, 'destroySchedule'])->name('calendar.schedules.destroy');

    // 8. Reports
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');

    // 9. Files & Expiration Management
    Route::resource('files', FileLinkController::class)->only(['index', 'store', 'destroy']);
    Route::patch('/files/{file}/extend', [FileLinkController::class, 'extendExpiry'])->name('files.extend');
    Route::patch('/files/{file}/toggle-visibility', [FileLinkController::class, 'toggleVisibility'])->name('files.toggle-visibility');

    // 10. Global Search & Smart Notifications API
    Route::get('/api/global-search', [SearchController::class, 'globalSearch'])->name('api.global-search');
    Route::get('/api/notifications', [NotificationController::class, 'getNotifications'])->name('api.notifications');
    Route::post('/api/notifications/mark-read', [NotificationController::class, 'markAllAsRead'])->name('api.notifications.mark-read');

    // 11. Activity Log
    Route::get('/activity-log', [ActivityLogController::class, 'index'])->name('activity-log.index');

    // 12. Settings
    Route::get('/settings/company', [SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
    Route::get('/settings/backup/download', [SettingController::class, 'backupDownload'])->name('settings.backup.download');
    Route::get('/settings/export/{type}', [SettingController::class, 'exportData'])->name('settings.export');
});

require __DIR__.'/settings.php';
