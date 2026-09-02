<?php

namespace App\Http\Controllers;

use App\Http\Requests\Finance\StoreInvoiceRequest;
use App\Http\Requests\Finance\StorePaymentRequest;
use App\Services\FinanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    public function __construct(
        protected FinanceService $financeService
    ) {}

    public function index(Request $request): Response
    {
        $data = $this->financeService->getFinanceOverview($request);

        return Inertia::render('Finance/Index', $data);
    }

    public function storePayment(StorePaymentRequest $request): RedirectResponse
    {
        $this->financeService->recordPayment($request->validated(), $request->user());

        return redirect()->back()->with('success', 'Pembayaran berhasil dicatat.');
    }

    public function storeInvoice(StoreInvoiceRequest $request): RedirectResponse
    {
        $this->financeService->generateInvoice($request->validated(), $request->user());

        return redirect()->back()->with('success', 'Invoice berhasil diterbitkan.');
    }
}
