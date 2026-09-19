<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return ! $this->user()?->hasRole('Supervisor');
    }

    public function rules(): array
    {
        $invoice = $this->route('invoice');
        $invoiceId = is_object($invoice) ? $invoice->id : $invoice;

        return [
            'invoice_number' => [
                'required',
                'string',
                'max:100',
                Rule::unique('invoices', 'invoice_number')->ignore($invoiceId),
            ],
            'issue_date' => 'required|date',
            'due_date' => 'required|date',
            'notes' => 'nullable|string|max:2000',
            'status' => 'nullable|string|in:draft,unpaid,partial,paid,overdue,cancelled',
            'subtotal' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'total' => 'nullable|numeric|min:0',
            'paid_amount' => 'nullable|numeric|min:0',
            'items' => 'nullable|array',
            'items.*.id' => 'nullable|string',
            'items.*.description' => 'required_with:items|string|max:255',
            'items.*.qty' => 'required_with:items|integer|min:1',
            'items.*.unit_price' => 'required_with:items|numeric|min:0',
            'items.*.total' => 'nullable|numeric|min:0',
            'client' => 'nullable|array',
            'client.name' => 'nullable|string|max:255',
            'client.phone' => 'nullable|string|max:50',
            'client.email' => 'nullable|email|max:255',
            'client.address' => 'nullable|string|max:500',
            'project_name' => 'nullable|string|max:255',
        ];
    }
}
