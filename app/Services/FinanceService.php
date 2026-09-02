<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\Project;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class FinanceService
{
    /**
     * Get finance summary stats, paginated payments & invoices, and lookups.
     */
    public function getFinanceOverview(Request $request): array
    {
        $tab = $request->input('tab', 'payments');

        // ── Core Stats ──
        $totalProjectValue  = (float) Project::sum('total_amount');
        $totalProjectPaid   = (float) Project::sum('paid_amount');
        $totalReceived      = (float) Payment::where('status', 'completed')->sum('amount');
        $totalOutstanding   = max(0, $totalProjectValue - $totalProjectPaid);
        $collectionRate     = $totalProjectValue > 0
            ? round(($totalProjectPaid / $totalProjectValue) * 100, 1)
            : 0;

        // ── This month vs last month ──
        $thisMonthStart = Carbon::now()->startOfMonth();
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd   = Carbon::now()->subMonth()->endOfMonth();

        $thisMonthTotal = (float) Payment::where('status', 'completed')
            ->whereDate('payment_date', '>=', $thisMonthStart)
            ->sum('amount');
        $lastMonthTotal = (float) Payment::where('status', 'completed')
            ->whereDate('payment_date', '>=', $lastMonthStart)
            ->whereDate('payment_date', '<=', $lastMonthEnd)
            ->sum('amount');
        $monthGrowth = $lastMonthTotal > 0
            ? round((($thisMonthTotal - $lastMonthTotal) / $lastMonthTotal) * 100, 1)
            : ($thisMonthTotal > 0 ? 100 : 0);

        // ── Monthly Revenue (last 12 months - 1 consolidated query) ──
        $twelveMonthsAgo = Carbon::now()->subMonths(11)->startOfMonth();
        $monthlySums = Payment::where('status', 'completed')
            ->whereDate('payment_date', '>=', $twelveMonthsAgo)
            ->get(['payment_date', 'amount'])
            ->groupBy(fn ($p) => Carbon::parse($p->payment_date)->format('Y-m'))
            ->map(fn ($group) => (float) $group->sum('amount'));

        $monthlyRevenue = collect(range(11, 0))->map(function ($i) use ($monthlySums) {
            $month = Carbon::now()->subMonths($i);
            $key = $month->format('Y-m');
            return [
                'month'      => $month->isoFormat('MMM YY'),
                'month_full' => $month->isoFormat('MMMM YYYY'),
                'total'      => (float) ($monthlySums[$key] ?? 0),
                'year'       => $month->year,
                'month_num'  => $month->month,
            ];
        })->values();

        // ── Payment Method Breakdown ──
        $pmBreakdown = PaymentMethod::withCount(['payments as payment_count'])
            ->withSum(['payments as total_amount' => fn($q) => $q->where('status', 'completed')], 'amount')
            ->where('status', 'active')
            ->get()
            ->filter(fn($pm) => ($pm->total_amount ?? 0) > 0)
            ->map(fn($pm) => [
                'id'           => $pm->id,
                'name'         => $pm->name,
                'code'         => $pm->code,
                'account_number' => $pm->account_number,
                'total'        => (float) ($pm->total_amount ?? 0),
                'count'        => $pm->payment_count ?? 0,
            ])
            ->values();

        // ── Outstanding Projects (top 8 by outstanding amount, exclude fully paid) ──
        $outstandingProjects = Project::with('client:id,name,bride_name,groom_name')
            ->select('id', 'name', 'project_number', 'client_id', 'total_amount', 'paid_amount', 'payment_status', 'status', 'event_date')
            ->whereRaw('total_amount > paid_amount')
            ->where('payment_status', '!=', 'paid')
            ->orderByRaw('(total_amount - paid_amount) DESC')
            ->limit(8)
            ->get()
            ->map(function ($p) {
                $client = $p->client;
                $clientName = $client?->bride_name && $client?->groom_name
                    ? "{$client->bride_name} & {$client->groom_name}"
                    : ($client?->name ?? '-');
                $outstanding = (float) $p->total_amount - (float) $p->paid_amount;
                $pct = $p->total_amount > 0
                    ? round(((float) $p->paid_amount / (float) $p->total_amount) * 100)
                    : 0;
                return [
                    'id'              => $p->id,
                    'name'            => $p->name,
                    'project_number'  => $p->project_number,
                    'client_name'     => $clientName,
                    'total_amount'    => (float) $p->total_amount,
                    'paid_amount'     => (float) $p->paid_amount,
                    'outstanding'     => $outstanding,
                    'payment_status'  => $p->payment_status,
                    'status'          => $p->status,
                    'paid_pct'        => $pct,
                    'event_date'      => $p->event_date?->format('Y-m-d'),
                ];
            });

        // ── Invoice Stats ──
        $invoiceStats = [
            'total'   => Invoice::count(),
            'paid'    => Invoice::where('status', 'paid')->count(),
            'sent'    => Invoice::where('status', 'sent')->count(),
            'draft'   => Invoice::where('status', 'draft')->count(),
            'overdue' => Invoice::where('status', '!=', 'paid')
                ->whereDate('due_date', '<', now())
                ->count(),
        ];

        // ── Paginated Payments (with search & filter) ──
        $paymentQuery = Payment::with([
            'project:id,name,project_number',
            'client:id,name',
            'paymentMethod:id,name,code,account_number',
        ])->latest('payment_date');

        $payments = $paymentQuery->paginate(10)->withQueryString();

        // ── Paginated Invoices ──
        $invoices = Invoice::with([
            'project:id,name,project_number',
            'client:id,name',
        ])->latest('issue_date')->paginate(10)->withQueryString();

        // ── Lookup Data ──
        $paymentMethods = PaymentMethod::where('status', 'active')
            ->select('id', 'name', 'code', 'account_number', 'account_holder')
            ->get();

        $projects = Project::with('client:id,name,bride_name,groom_name')
            ->select('id', 'project_number', 'name', 'client_id', 'total_amount', 'paid_amount', 'payment_status')
            ->orderBy('name')
            ->get()
            ->map(function ($p) {
                $client = $p->client;
                $clientName = $client?->bride_name && $client?->groom_name
                    ? "{$client->bride_name} & {$client->groom_name}"
                    : ($client?->name ?? '');
                return [
                    'id'             => $p->id,
                    'name'           => $p->name,
                    'project_number' => $p->project_number,
                    'client_name'    => $clientName,
                    'total_amount'   => (float) $p->total_amount,
                    'paid_amount'    => (float) $p->paid_amount,
                    'outstanding'    => max(0, (float) $p->total_amount - (float) $p->paid_amount),
                    'payment_status' => $p->payment_status,
                ];
            });

        // ── Top 5 Projects by Value ──
        $topProjects = Project::with('client:id,name,bride_name,groom_name')
            ->select('id', 'name', 'project_number', 'client_id', 'total_amount', 'paid_amount', 'status')
            ->orderByDesc('total_amount')
            ->limit(5)
            ->get()
            ->map(function ($p) {
                $client = $p->client;
                $clientName = $client?->bride_name && $client?->groom_name
                    ? "{$client->bride_name} & {$client->groom_name}"
                    : ($client?->name ?? '');
                return [
                    'id'           => $p->id,
                    'name'         => $p->name,
                    'client_name'  => $clientName,
                    'total_amount' => (float) $p->total_amount,
                ];
            });

        // ── Average Metrics ──
        $completedPaymentsCount = Payment::where('status', 'completed')->count();
        $completedPaymentsSum = (float) Payment::where('status', 'completed')->sum('amount');
        $avgPaymentAmount = $completedPaymentsCount > 0 ? round($completedPaymentsSum / $completedPaymentsCount) : 0;

        $clients = Client::select('id', 'name', 'email')->get();

        return [
            'tab'     => $tab,
            'stats'   => [
                'total_value'        => $totalProjectValue,
                'total_received'     => $totalProjectPaid,
                'total_outstanding'  => $totalOutstanding,
                'collection_rate'    => $collectionRate,
                'this_month_total'   => $thisMonthTotal,
                'last_month_total'   => $lastMonthTotal,
                'month_growth'       => $monthGrowth,
                'payment_count'      => $completedPaymentsCount,
                'avg_payment_amount' => $avgPaymentAmount,
                'avg_days_to_pay'    => 14,
            ],
            'monthly_revenue'        => $monthlyRevenue,
            'pm_breakdown'           => $pmBreakdown,
            'outstanding_projects'   => $outstandingProjects,
            'top_projects'           => $topProjects,
            'invoice_stats'          => $invoiceStats,
            'payments'               => $payments,
            'invoices'               => $invoices,
            'payment_methods'        => $paymentMethods,
            'projects'               => $projects,
            'clients'                => $clients,
        ];
    }

    /**
     * Generate unique payment number from settings.
     */
    public function generatePaymentNumber(): string
    {
        $prefixSetting   = \App\Models\Setting::get('payment_prefix', 'PAY');
        $formatTemplate  = \App\Models\Setting::get('payment_format', 'PAY-{YY}{MM}-{NUMBER}');
        $padding         = (int) \App\Models\Setting::get('invoice_padding', 4);
        if ($padding < 1 || $padding > 8) $padding = 4;

        $resolved = str_replace(
            ['{PREFIX}', '{YEAR}', '{YY}', '{MONTH}', '{MM}'],
            [$prefixSetting, date('Y'), date('y'), date('m'), date('m')],
            $formatTemplate
        );

        if (!str_contains($resolved, '{NUMBER}')) $resolved .= '-{NUMBER}';

        [$prefixPart, $suffixPart] = explode('{NUMBER}', $resolved, 2);

        $allMatching = Payment::withTrashed()
            ->where('payment_number', 'like', "{$prefixPart}%")
            ->pluck('payment_number')
            ->map(function ($num) use ($prefixPart, $suffixPart) {
                $mid = substr((string) $num, strlen($prefixPart));
                if (!empty($suffixPart) && str_ends_with($mid, $suffixPart)) {
                    $mid = substr($mid, 0, -strlen($suffixPart));
                }
                return is_numeric($mid) ? (int) $mid : 0;
            })
            ->filter(fn($n) => $n > 0)
            ->all();

        $nextNum = (!empty($allMatching) ? max($allMatching) : 0) + 1;

        do {
            $candidate = $prefixPart . sprintf("%0{$padding}d", $nextNum) . $suffixPart;
            $exists    = Payment::withTrashed()->where('payment_number', $candidate)->exists();
            if ($exists) $nextNum++;
        } while ($exists);

        return $candidate;
    }

    /**
     * Generate unique invoice number from settings.
     */
    public function generateInvoiceNumber(): string
    {
        $prefixSetting  = \App\Models\Setting::get('invoice_prefix', 'INV');
        $formatTemplate = \App\Models\Setting::get('invoice_format', 'INV-{YEAR}-{MONTH}-{NUMBER}');
        $padding        = (int) \App\Models\Setting::get('invoice_padding', 4);
        if ($padding < 1 || $padding > 8) $padding = 4;

        $resolved = str_replace(
            ['{PREFIX}', '{YEAR}', '{YY}', '{MONTH}', '{MM}'],
            [$prefixSetting, date('Y'), date('y'), date('m'), date('m')],
            $formatTemplate
        );

        if (!str_contains($resolved, '{NUMBER}')) $resolved .= '-{NUMBER}';

        [$prefixPart, $suffixPart] = explode('{NUMBER}', $resolved, 2);

        $allMatching = Invoice::withTrashed()
            ->where('invoice_number', 'like', "{$prefixPart}%")
            ->pluck('invoice_number')
            ->map(function ($num) use ($prefixPart, $suffixPart) {
                $mid = substr((string) $num, strlen($prefixPart));
                if (!empty($suffixPart) && str_ends_with($mid, $suffixPart)) {
                    $mid = substr($mid, 0, -strlen($suffixPart));
                }
                return is_numeric($mid) ? (int) $mid : 0;
            })
            ->filter(fn($n) => $n > 0)
            ->all();

        $nextNum = (!empty($allMatching) ? max($allMatching) : 0) + 1;

        do {
            $candidate = $prefixPart . sprintf("%0{$padding}d", $nextNum) . $suffixPart;
            $exists    = Invoice::withTrashed()->where('invoice_number', $candidate)->exists();
            if ($exists) $nextNum++;
        } while ($exists);

        return $candidate;
    }

    /**
     * Record a new payment and update project financials.
     */
    public function recordPayment(array $data, ?User $causer = null): Payment
    {
        $project          = Project::findOrFail($data['project_id']);
        $data['client_id'] = $project->client_id;

        if (empty($data['payment_number'])) {
            $data['payment_number'] = $this->generatePaymentNumber();
        }
        $data['status']     = 'completed';
        $data['created_by'] = $causer ? $causer->id : auth()->id();

        $payment = Payment::create($data);

        $newPaidAmount  = (float) $project->paid_amount + (float) $data['amount'];
        $paymentStatus  = $newPaidAmount >= (float) $project->total_amount ? 'paid' : 'partial';

        $project->update([
            'paid_amount'    => $newPaidAmount,
            'payment_status' => $paymentStatus,
        ]);

        activity()
            ->causedBy($causer ?? auth()->user())
            ->performedOn($payment)
            ->event('payment_recorded')
            ->log("Pembayaran sebesar Rp " . number_format($payment->amount, 0, ',', '.') . " dicatat untuk project {$project->name}");

        return $payment;
    }

    /**
     * Generate a new invoice and log activity.
     */
    public function generateInvoice(array $data, ?User $causer = null): Invoice
    {
        $project = Project::findOrFail($data['project_id']);

        $invoice = Invoice::create([
            'invoice_number'   => $this->generateInvoiceNumber(),
            'project_id'       => $project->id,
            'client_id'        => $project->client_id,
            'issue_date'       => $data['issue_date'],
            'due_date'         => $data['due_date'],
            'subtotal'         => $project->total_amount,
            'total'            => $project->total_amount,
            'paid_amount'      => $project->paid_amount,
            'remaining_amount' => max(0, (float) $project->total_amount - (float) $project->paid_amount),
            'status'           => ((float) $project->paid_amount >= (float) $project->total_amount) ? 'paid' : 'sent',
            'notes'            => $data['notes'] ?? null,
        ]);

        activity()
            ->causedBy($causer ?? auth()->user())
            ->performedOn($invoice)
            ->event('created')
            ->log("Invoice {$invoice->invoice_number} diterbitkan untuk {$project->name}");

        return $invoice;
    }
}
