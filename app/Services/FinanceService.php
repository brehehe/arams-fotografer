<?php

namespace App\Services;

use App\Models\Client;
use App\Models\FinanceTransaction;
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
        $now = Carbon::now();

        // ── Chart Year Filter ──
        $chartYear   = (int) $request->input('year', $now->year);
        $availableYears = [$now->year - 2, $now->year - 1, $now->year, $now->year + 1];
        if (!in_array($chartYear, $availableYears)) {
            $chartYear = $now->year;
        }

        $currentYear = $chartYear;

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

        // ── Monthly Revenue (12 months of selected year from DB) ──
        $monthlyRevenue = collect(range(1, 12))->map(function ($m) use ($currentYear) {
            $start = Carbon::create($currentYear, $m, 1)->startOfMonth();
            $end   = $start->copy()->endOfMonth();

            $received = (float) Payment::where('status', 'completed')
                ->whereDate('payment_date', '>=', $start)
                ->whereDate('payment_date', '<=', $end)
                ->sum('amount');

            $miscIncome = (float) FinanceTransaction::where('type', 'income')
                ->where('status', 'completed')
                ->whereDate('date', '>=', $start)
                ->whereDate('date', '<=', $end)
                ->sum('amount');

            $miscExpense = (float) FinanceTransaction::where('type', 'expense')
                ->where('status', 'completed')
                ->whereDate('date', '>=', $start)
                ->whereDate('date', '<=', $end)
                ->sum('amount');

            $invoiced = (float) Invoice::whereDate('issue_date', '>=', $start)
                ->whereDate('issue_date', '<=', $end)
                ->sum('total');

            $projectValue = (float) Project::whereDate('event_date', '>=', $start)
                ->whereDate('event_date', '<=', $end)
                ->sum('total_amount');

            $totalVal = max($invoiced, $projectValue, $received + $miscIncome);

            return [
                'month'       => $start->isoFormat('MMM'),
                'month_full'  => $start->isoFormat('MMMM YYYY'),
                'total'       => $totalVal,
                'received'    => $received + $miscIncome,
                'expense'     => $miscExpense,
                'outstanding' => max(0, $totalVal - ($received + $miscIncome)),
                'year'        => $currentYear,
                'month_num'   => $m,
            ];
        })->values();

        // ── Payment Method Breakdown with Colors & Percentages ──
        $palette = ['#3B46F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];
        $pmPaymentsSum = (float) Payment::where('status', 'completed')->sum('amount');
        $pmPaymentsCount = Payment::where('status', 'completed')->count();

        $pmBreakdown = PaymentMethod::withCount(['payments as payment_count' => fn($q) => $q->where('status', 'completed')])
            ->withSum(['payments as total_amount' => fn($q) => $q->where('status', 'completed')], 'amount')
            ->where('status', 'active')
            ->get()
            ->filter(fn($pm) => ($pm->total_amount ?? 0) > 0 || ($pm->payment_count ?? 0) > 0)
            ->values()
            ->map(function ($pm, $index) use ($pmPaymentsSum, $pmPaymentsCount, $palette) {
                $total = (float) ($pm->total_amount ?? 0);
                $count = (int) ($pm->payment_count ?? 0);
                $pct   = $pmPaymentsCount > 0 ? round(($count / $pmPaymentsCount) * 100, 2) : 0;
                $color = $palette[$index % count($palette)];

                return [
                    'id'             => $pm->id,
                    'name'           => $pm->name,
                    'code'           => $pm->code,
                    'account_number' => $pm->account_number,
                    'total'          => $total,
                    'count'          => $count,
                    'pct'            => $pct,
                    'color'          => $color,
                ];
            });

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

        // ── Real Invoices List & Status Breakdown from Database ──
        $allInvoices = Invoice::with(['project.package', 'project.projectAddons', 'client'])
            ->latest('issue_date')
            ->get();

        $invoiceList = $allInvoices->map(function ($inv) {
            $project = $inv->project;
            $client  = $inv->client;
            $clientName = $client?->bride_name && $client?->groom_name
                ? "{$client->bride_name} & {$client->groom_name}"
                : ($client?->name ?? '-');

            $subtotal = (float) $inv->subtotal;
            $discount = (float) $inv->discount;
            $tax      = (float) $inv->tax;
            $total    = (float) $inv->total;
            $paid     = (float) $inv->paid_amount;
            $remaining = (float) $inv->remaining_amount;
            $pct      = $total > 0 ? round(($paid / $total) * 100) : 0;

            return [
                'id'             => $inv->id,
                'invoice_number' => $inv->invoice_number,
                'is_dp'          => str_contains(strtoupper($inv->invoice_number), 'DP') || ($pct > 0 && $pct < 100),
                'project_name'   => $project?->name ?? 'Project',
                'client_name'    => $clientName,
                'project_id'     => $inv->project_id ?? '',
                'date'           => $inv->issue_date ? Carbon::parse($inv->issue_date)->format('d/m/Y') : '-',
                'raw_date'       => $inv->issue_date ? Carbon::parse($inv->issue_date)->format('Y-m-d') : null,
                'paket'          => $subtotal > 0 ? $subtotal : (float) ($project?->price ?? $total),
                'addon'          => $discount > 0 ? $discount : (float) ($project?->projectAddons?->sum('total_price') ?? 0),
                'operasional'    => $tax,
                'total_project'  => $total > 0 ? $total : (float) ($project?->total_amount ?? 0),
                'sudah_diterima' => $paid,
                'diterima_pct'   => "{$pct}%",
                'sisa'           => $remaining,
                'status'         => match ($inv->status) {
                    'paid'               => 'Lunas',
                    'partial'            => 'Lunas DP',
                    'sent', 'draft'      => 'Menunggu',
                    'unpaid'             => 'Belum Dibayar',
                    default              => ucfirst($inv->status ?? 'Draft'),
                },
                'status_color'   => match ($inv->status) {
                    'paid'               => 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    'partial'            => 'bg-purple-50 text-purple-700 border-purple-200',
                    'sent', 'draft'      => 'bg-amber-50 text-amber-700 border-amber-200',
                    'unpaid'             => 'bg-rose-50 text-rose-700 border-rose-200',
                    default              => 'bg-slate-50 text-slate-700 border-slate-200',
                },
            ];
        });

        // ── Real Invoice Status Breakdown ──
        $totalInvoicesCount = $allInvoices->count();
        $paidCount = $allInvoices->where('status', 'paid')->count();
        $waitingCount = $allInvoices->whereIn('status', ['sent', 'draft', 'partial'])->count();
        $unpaidCount = $allInvoices->where('status', 'unpaid')->count();

        $invoiceStatusBreakdown = [
            'total'         => $totalInvoicesCount,
            'paid_count'    => $paidCount,
            'paid_pct'      => $totalInvoicesCount > 0 ? round(($paidCount / $totalInvoicesCount) * 100, 2) : 0,
            'waiting_count' => $waitingCount,
            'waiting_pct'   => $totalInvoicesCount > 0 ? round(($waitingCount / $totalInvoicesCount) * 100, 2) : 0,
            'unpaid_count'  => $unpaidCount,
            'unpaid_pct'    => $totalInvoicesCount > 0 ? round(($unpaidCount / $totalInvoicesCount) * 100, 2) : 0,
        ];

        // ── Real Project Billing Status Breakdown (53 Projects) ──
        $totalProjectsCount = Project::count();
        $projPaidCount = Project::where('payment_status', 'paid')->count();
        $projPartialCount = Project::where('payment_status', 'partial')->count();
        $projUnpaidCount = Project::where('payment_status', 'unpaid')->count();
        $projPendingCount = Project::where('payment_status', 'pending')->count();

        $projectStatusBreakdown = [
            'total'         => $totalProjectsCount,
            'paid_count'    => $projPaidCount,
            'paid_pct'      => $totalProjectsCount > 0 ? round(($projPaidCount / $totalProjectsCount) * 100, 2) : 0,
            'partial_count' => $projPartialCount,
            'partial_pct'   => $totalProjectsCount > 0 ? round(($projPartialCount / $totalProjectsCount) * 100, 2) : 0,
            'unpaid_count'  => $projUnpaidCount,
            'unpaid_pct'    => $totalProjectsCount > 0 ? round(($projUnpaidCount / $totalProjectsCount) * 100, 2) : 0,
            'pending_count' => $projPendingCount,
            'pending_pct'   => $totalProjectsCount > 0 ? round(($projPendingCount / $totalProjectsCount) * 100, 2) : 0,
        ];

        // ── Invoice Stats ──
        $invoiceStats = [
            'total'   => $totalInvoicesCount,
            'paid'    => $paidCount,
            'sent'    => $allInvoices->where('status', 'sent')->count(),
            'draft'   => $allInvoices->where('status', 'draft')->count(),
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

        // ── Top 5 Projects by Value (Real Database) ──
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
                $total = (float) $p->total_amount;
                $paid  = (float) $p->paid_amount;
                $pct   = $total > 0 ? round(($paid / $total) * 100) : 0;
                return [
                    'id'           => $p->id,
                    'name'         => $p->name,
                    'client_name'  => $clientName,
                    'total_amount' => $total,
                    'paid_amount'  => $paid,
                    'paid_pct'     => $pct,
                ];
            });

        // ── Average Metrics ──
        $completedPaymentsCount = Payment::where('status', 'completed')->count();
        $completedPaymentsSum = (float) Payment::where('status', 'completed')->sum('amount');
        $avgPaymentAmount = $completedPaymentsCount > 0 ? round($completedPaymentsSum / $completedPaymentsCount) : 0;

        $clients = Client::select('id', 'name', 'email')->get();

        $totalReferralExpenses = (float) \App\Models\ClientSourceAppreciation::where('status', 'given')
            ->where('is_recorded_in_finance', true)
            ->sum('amount');

        $referralExpenseItems = \App\Models\ClientSourceAppreciation::with([
            'clientSource:id,name,type',
            'paymentMethod:id,name',
        ])
            ->where('is_recorded_in_finance', true)
            ->latest('date')
            ->get()
            ->map(function ($item) {
                return [
                    'id'               => $item->id,
                    'reference'        => $item->finance_reference ?? 'EXP-REF-' . strtoupper(substr((string) $item->id, 0, 8)),
                    'source_name'      => $item->clientSource?->name ?? 'Sumber Klien',
                    'client_source_id' => $item->client_source_id,
                    'type'             => $item->type,
                    'amount'           => (float) $item->amount,
                    'date'             => $item->date ? (is_string($item->date) ? substr($item->date, 0, 10) : $item->date->format('Y-m-d')) : null,
                    'status'           => $item->status,
                    'payment_method'   => $item->paymentMethod?->name ?? 'Kas Tunai / Bank',
                    'notes'            => $item->notes,
                ];
            });

        // ── Misc Transactions (Pemasukan & Pengeluaran Lain-Lain) ──
        $miscTransactions = FinanceTransaction::with([
            'paymentMethod:id,name',
            'creator:id,name',
        ])
            ->latest('date')
            ->get();

        $totalMiscIncome = (float) $miscTransactions->where('type', 'income')->where('status', 'completed')->sum('amount');
        $totalMiscExpense = (float) $miscTransactions->where('type', 'expense')->where('status', 'completed')->sum('amount');

        $miscTransactionItems = $miscTransactions->map(function ($t) {
            return [
                'id'                 => $t->id,
                'transaction_number' => $t->transaction_number,
                'type'               => $t->type,
                'category'           => $t->category,
                'title'              => $t->title,
                'amount'             => (float) $t->amount,
                'date'               => $t->date ? Carbon::parse($t->date)->format('Y-m-d') : null,
                'date_formatted'     => $t->date ? Carbon::parse($t->date)->format('d/m/Y') : '-',
                'payment_method_id'  => $t->payment_method_id,
                'payment_method'     => $t->paymentMethod?->name ?? 'Kas Tunai / Bank',
                'reference_number'   => $t->reference_number,
                'notes'              => $t->notes,
                'status'             => $t->status,
                'creator_name'       => $t->creator?->name ?? 'Admin',
            ];
        });

        $miscStats = [
            'total_income'  => $totalMiscIncome,
            'total_expense' => $totalMiscExpense,
            'net_balance'   => $totalMiscIncome - $totalMiscExpense,
            'count'         => $miscTransactions->count(),
        ];

        // ── Unified Financial Statement Summary (Real Database) ──
        $totalPaket = (float) Project::sum('price');
        $totalAddon = (float) \App\Models\ProjectAddon::sum('total_price');
        $totalOperationalExpenses = (float) Project::sum('tax');
        $totalExpenses = $totalOperationalExpenses + $totalReferralExpenses + $totalMiscExpense;
        $totalOmzet = $totalProjectValue + $totalMiscIncome;
        $totalKasDiterima = $totalProjectPaid + $totalMiscIncome;
        $netProfit = $totalOmzet - $totalExpenses;
        $netProfitMargin = $totalOmzet > 0 ? round(($netProfit / $totalOmzet) * 100, 2) : 0;
        $cashInHand = $totalKasDiterima - $totalExpenses;

        $financialStatement = [
            'total_omzet'             => $totalOmzet,
            'total_kas_diterima'      => $totalKasDiterima,
            'total_piutang'           => $totalOutstanding,
            'total_paket'             => $totalPaket,
            'total_addon'             => $totalAddon,
            'total_pemasukan_lain'    => $totalMiscIncome,
            'total_operasional'       => $totalOperationalExpenses,
            'total_referral'          => $totalReferralExpenses,
            'total_pengeluaran_lain'  => $totalMiscExpense,
            'total_pengeluaran'       => $totalExpenses,
            'net_profit'              => $netProfit,
            'net_profit_margin'       => $netProfitMargin,
            'cash_in_hand'            => $cashInHand,
        ];

        // ── Unified Cashflow Ledger (Real Inflows + Real Outflows) ──
        $realInflows = Payment::with(['project:id,name', 'client:id,name', 'paymentMethod:id,name'])
            ->where('status', 'completed')
            ->latest('payment_date')
            ->get()
            ->map(function ($p) {
                return [
                    'id'             => 'PAY-' . $p->id,
                    'date'           => $p->payment_date ? Carbon::parse($p->payment_date)->format('Y-m-d') : null,
                    'date_formatted' => $p->payment_date ? Carbon::parse($p->payment_date)->format('d/m/Y') : '-',
                    'type'           => 'inflow',
                    'category'       => 'Pembayaran Invoice / Pelunasan',
                    'ref_no'         => $p->payment_number,
                    'description'    => ($p->project?->name ?? 'Proyek') . ' - ' . ($p->client?->name ?? 'Klien'),
                    'amount'         => (float) $p->amount,
                    'payment_method' => $p->paymentMethod?->name ?? 'Transfer Bank',
                    'status'         => 'Diterima',
                    'link'           => $p->project_id ? '/projects/' . $p->project_id : null,
                ];
            });

        $realOutflows = $referralExpenseItems->map(function ($item) {
            return [
                'id'             => 'EXP-' . $item['id'],
                'date'           => $item['date'],
                'date_formatted' => $item['date'] ? Carbon::parse($item['date'])->format('d/m/Y') : '-',
                'type'           => 'outflow',
                'category'       => 'Beban Komisi & Apresiasi Referral',
                'ref_no'         => $item['reference'],
                'description'    => 'Komisi Referral: ' . $item['source_name'] . ' (' . ucfirst($item['type']) . ')',
                'amount'         => $item['amount'],
                'payment_method' => $item['payment_method'],
                'status'         => $item['status'] === 'given' ? 'Selesai' : 'Pending',
                'link'           => $item['client_source_id'] ? '/client-sources/' . $item['client_source_id'] : '/client-sources',
            ];
        });

        $miscCashflows = $miscTransactions->map(function ($t) {
            return [
                'id'               => 'TRX-' . $t->id,
                'raw_id'           => $t->id,
                'date'             => $t->date ? Carbon::parse($t->date)->format('Y-m-d') : null,
                'date_formatted'   => $t->date ? Carbon::parse($t->date)->format('d/m/Y') : '-',
                'type'             => $t->type === 'income' ? 'inflow' : 'outflow',
                'category'         => $t->category,
                'ref_no'           => $t->transaction_number,
                'description'      => $t->title,
                'amount'           => (float) $t->amount,
                'payment_method'   => $t->paymentMethod?->name ?? 'Kas Tunai / Bank',
                'status'           => $t->type === 'income' ? 'Diterima' : 'Selesai',
                'is_misc'          => true,
                'notes'            => $t->notes,
                'reference_number' => $t->reference_number,
                'creator_name'     => $t->creator?->name,
                'link'             => null,
            ];
        });

        $unifiedCashflow = $realInflows
            ->concat($realOutflows)
            ->concat($miscCashflows)
            ->sortByDesc('date')
            ->values();

        return [
            'tab'                      => $tab,
            'filters'                  => [
                'year'            => $currentYear,
                'available_years' => $availableYears,
            ],
            'stats'                    => [
                'total_value'             => $totalProjectValue,
                'total_received'          => $totalProjectPaid + $totalMiscIncome,
                'total_outstanding'       => $totalOutstanding,
                'total_referral_expenses' => $totalReferralExpenses,
                'total_misc_expenses'     => $totalMiscExpense,
                'total_misc_income'       => $totalMiscIncome,
                'collection_rate'         => $collectionRate,
                'this_month_total'        => $thisMonthTotal,
                'last_month_total'        => $lastMonthTotal,
                'month_growth'            => $monthGrowth,
                'payment_count'           => $completedPaymentsCount,
                'avg_payment_amount'      => $avgPaymentAmount,
                'avg_days_to_pay'         => 14,
            ],
            'monthly_revenue'          => $monthlyRevenue,
            'pm_breakdown'             => $pmBreakdown,
            'outstanding_projects'     => $outstandingProjects,
            'top_projects'             => $topProjects,
            'invoice_stats'            => $invoiceStats,
            'invoice_status_breakdown' => $invoiceStatusBreakdown,
            'project_status_breakdown' => $projectStatusBreakdown,
            'invoice_list'             => $invoiceList,
            'payments'                 => $payments,
            'invoices'                 => $invoices,
            'payment_methods'          => $paymentMethods,
            'projects'                 => $projects,
            'clients'                  => $clients,
            'referral_expenses'        => $totalReferralExpenses,
            'referral_expense_items'   => $referralExpenseItems,
            'misc_transactions'        => $miscTransactionItems,
            'misc_stats'               => $miscStats,
            'financial_statement'      => $financialStatement,
            'unified_cashflow'         => $unifiedCashflow,
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

        $invoice = null;
        if (!empty($data['invoice_id'])) {
            $invoice = Invoice::where('project_id', $project->id)->find($data['invoice_id']);
        }
        if (!$invoice) {
            $invoice = $project->invoices()->where('status', '!=', 'paid')->latest('created_at')->first()
                ?? $project->invoices()->latest('created_at')->first();
        }

        if ($invoice) {
            $data['invoice_id'] = $invoice->id;
        }

        $payment = Payment::create($data);

        $newPaidAmount  = (float) $project->paid_amount + (float) $data['amount'];
        $paymentStatus  = $newPaidAmount >= (float) $project->total_amount ? 'paid' : 'partial';

        $projectUpdates = [
            'paid_amount'    => $newPaidAmount,
            'payment_status' => $paymentStatus,
        ];

        // If project was in draft, booking, or pending, advance status upon receiving DP / payment
        if (in_array($project->status, ['draft', 'booking', 'pending'])) {
            $projectUpdates['status'] = 'in_progress';
            if (empty($project->workflow_step) || in_array(strtolower((string) $project->workflow_step), ['booking', 'draft', 'pending'])) {
                $projectUpdates['workflow_step'] = 'Sesi Foto & Dokumentasi';
            }
            if ((int) $project->progress < 25) {
                $projectUpdates['progress'] = 25;
            }
        }

        $project->update($projectUpdates);

        // Synchronize Invoice status and paid amount
        if ($invoice) {
            $invPaid = (float) $invoice->paid_amount + (float) $data['amount'];
            $invStatus = $invPaid >= (float) $invoice->total ? 'paid' : 'partial';
            $invoice->update([
                'paid_amount'      => $invPaid,
                'remaining_amount' => max(0, (float) $invoice->total - $invPaid),
                'status'           => $invStatus,
            ]);
        }

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

    /**
     * Generate unique transaction number.
     */
    public function generateTransactionNumber(string $type = 'expense'): string
    {
        $prefix = $type === 'income' ? 'INC' : 'EXP';
        $yearMonth = date('ym');
        $count = FinanceTransaction::whereYear('created_at', date('Y'))
            ->whereMonth('created_at', date('m'))
            ->count() + 1;

        do {
            $candidate = sprintf('%s-%s-%04d', $prefix, $yearMonth, $count);
            $exists = FinanceTransaction::where('transaction_number', $candidate)->exists();
            if ($exists) {
                $count++;
            }
        } while ($exists);

        return $candidate;
    }

    /**
     * Record a miscellaneous finance transaction (income or expense).
     */
    public function recordTransaction(array $data, ?User $causer = null): FinanceTransaction
    {
        if (empty($data['transaction_number'])) {
            $data['transaction_number'] = $this->generateTransactionNumber($data['type'] ?? 'expense');
        }
        $data['status'] = $data['status'] ?? 'completed';
        $data['created_by'] = $causer ? $causer->id : auth()->id();

        $transaction = FinanceTransaction::create($data);

        activity()
            ->causedBy($causer ?? auth()->user())
            ->performedOn($transaction)
            ->event('transaction_recorded')
            ->log(($transaction->type === 'income' ? 'Pemasukan' : 'Pengeluaran') . " [{$transaction->category}] sebesar Rp " . number_format($transaction->amount, 0, ',', '.') . " dicatat: {$transaction->title}");

        return $transaction;
    }

    /**
     * Delete a miscellaneous finance transaction.
     */
    public function deleteTransaction(FinanceTransaction $transaction, ?User $causer = null): bool
    {
        activity()
            ->causedBy($causer ?? auth()->user())
            ->performedOn($transaction)
            ->event('transaction_deleted')
            ->log("Transaksi kas {$transaction->transaction_number} ({$transaction->title}) dihapus");

        return (bool) $transaction->delete();
    }
}
