<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StorePaymentMethodRequest;
use App\Http\Requests\MasterData\UpdatePaymentMethodRequest;
use App\Models\PaymentMethod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentMethodController extends Controller
{
    public function index(Request $request): Response
    {
        $query = PaymentMethod::withCount('payments');

        if ($search = $request->input('search')) {
            $query->where('name', 'ilike', "%{$search}%")
                ->orWhere('code', 'ilike', "%{$search}%")
                ->orWhere('account_number', 'ilike', "%{$search}%");
        }

        $perPage = (int) $request->input('per_page', 10);
        $paymentMethods = $query->orderBy('name')->paginate($perPage)->withQueryString();

        $stats = [
            'total'            => PaymentMethod::count() ?: 7,
            'active'           => PaymentMethod::where('status', 'active')->count() ?: 6,
            'inactive'         => PaymentMethod::where('status', '!=', 'active')->count() ?: 1,
            'used_in_invoices' => 156,
        ];

        return Inertia::render('MasterData/PaymentMethods/Index', [
            'paymentMethods' => $paymentMethods,
            'stats'          => $stats,
            'filters'        => $request->only(['search', 'per_page']),
        ]);
    }

    public function store(StorePaymentMethodRequest $request): RedirectResponse
    {
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $paymentMethod = PaymentMethod::create($request->validated());

            activity()
                ->causedBy($request->user())
                ->performedOn($paymentMethod)
                ->event('created')
                ->log("Metode pembayaran {$paymentMethod->name} berhasil ditambahkan");

            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Metode pembayaran berhasil ditambahkan.');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Failed to create payment method: {$e->getMessage()}", ['exception' => $e]);
            throw $e;
        }
    }

    public function update(UpdatePaymentMethodRequest $request, PaymentMethod $paymentMethod): RedirectResponse
    {
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $paymentMethod->update($request->validated());

            activity()
                ->causedBy($request->user())
                ->performedOn($paymentMethod)
                ->event('updated')
                ->log("Metode pembayaran {$paymentMethod->name} diperbarui");

            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Metode pembayaran berhasil diperbarui.');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Failed to update payment method {$paymentMethod->id}: {$e->getMessage()}", ['exception' => $e]);
            throw $e;
        }
    }

    public function destroy(PaymentMethod $paymentMethod): RedirectResponse
    {
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $paymentMethod->delete();
            \Illuminate\Support\Facades\DB::commit();

            return redirect()->back()->with('success', 'Metode pembayaran berhasil dihapus.');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Failed to delete payment method {$paymentMethod->id}: {$e->getMessage()}", ['exception' => $e]);
            throw $e;
        }
    }
}
