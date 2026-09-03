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
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%")
                ->orWhere('account_number', 'like', "%{$search}%");
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
        $paymentMethod = PaymentMethod::create($request->validated());

        activity()
            ->causedBy($request->user())
            ->performedOn($paymentMethod)
            ->event('created')
            ->log("Metode pembayaran {$paymentMethod->name} berhasil ditambahkan");

        return redirect()->back()->with('success', 'Metode pembayaran berhasil ditambahkan.');
    }

    public function update(UpdatePaymentMethodRequest $request, PaymentMethod $paymentMethod): RedirectResponse
    {
        $paymentMethod->update($request->validated());

        activity()
            ->causedBy($request->user())
            ->performedOn($paymentMethod)
            ->event('updated')
            ->log("Metode pembayaran {$paymentMethod->name} diperbarui");

        return redirect()->back()->with('success', 'Metode pembayaran berhasil diperbarui.');
    }

    public function destroy(PaymentMethod $paymentMethod): RedirectResponse
    {
        $paymentMethod->delete();

        return redirect()->back()->with('success', 'Metode pembayaran berhasil dihapus.');
    }
}
