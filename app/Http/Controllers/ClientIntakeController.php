<?php

namespace App\Http\Controllers;

use App\Actions\Intake\ProcessClientIntake;
use App\Http\Requests\Intake\StoreClientIntakeRequest;
use App\Models\Category;
use App\Models\Client;
use App\Models\Package;
use App\Models\Setting;
use App\Models\WeddingOrganizer;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ClientIntakeController extends Controller
{
    public function __construct(
        protected ProcessClientIntake $processClientIntake
    ) {}

    /**
     * Display public client intake / booking form.
     */
    public function create(): Response
    {
        $categories = Category::where('status', 'active')
            ->select('id', 'name', 'slug', 'description', 'color', 'form_type', 'image')
            ->orderBy('sort_order')
            ->get();

        $packages = Package::where('status', 'active')
            ->select('id', 'name', 'category_id', 'base_price', 'duration_hours', 'description')
            ->orderBy('name')
            ->get();

        $weddingOrganizers = WeddingOrganizer::whereIn('status', ['partner', 'active'])
            ->select('id', 'name', 'pic_name', 'phone', 'city', 'tier')
            ->orderBy('name')
            ->get();

        $allClients = Client::select('id', 'name', 'phone', 'city', 'bride_name', 'groom_name', 'child_name', 'father_name', 'mother_name', 'children')
            ->orderBy('name')
            ->get();

        $settings = Setting::all()->pluck('value', 'key')->toArray();

        return Inertia::render('Public/ClientIntakeForm', [
            'categories' => $categories,
            'packages' => $packages,
            'wedding_organizers' => $weddingOrganizers,
            'all_clients' => $allClients,
            'form_status' => $settings['intake_form_status'] ?? 'open',
            'intake_closed_message' => $settings['intake_closed_message'] ?? 'Mohon maaf, saat ini pendaftaran booking baru sedang ditutup sementara. Silakan hubungi kami melalui WhatsApp.',
            'intake_form_title' => $settings['intake_form_title'] ?? 'Formulir Pemesanan & Data Klien',
            'intake_form_subtitle' => $settings['intake_form_subtitle'] ?? 'Lengkapi data kebutuhan fotografi & videografi acara spesial Anda.',
            'intake_notes' => $settings['intake_notes'] ?? '',
            'theme' => [
                'primary_color' => $settings['intake_primary_color'] ?? '#4F46E5',
                'bg_color' => $settings['intake_bg_color'] ?? '#090C15',
                'card_bg' => $settings['intake_card_bg'] ?? '#FFFFFF',
                'sidebar_bg' => $settings['intake_sidebar_bg'] ?? '#0F1424',
                'text_color' => $settings['intake_text_color'] ?? '#0F172A',
            ],
            'company' => [
                'name' => $settings['company_name'] ?? 'Arams Pictures',
                'phone' => $settings['company_phone'] ?? '081234567890',
                'email' => $settings['company_email'] ?? 'hello@arams.id',
                'instagram' => $settings['company_instagram'] ?? '@aramspictures',
                'address' => $settings['company_address'] ?? 'Surabaya, Jawa Timur',
                'website' => $settings['company_website'] ?? 'www.aramspictures.com',
            ],
        ]);
    }

    /**
     * Store submitted client intake data via Action.
     */
    public function store(StoreClientIntakeRequest $request): RedirectResponse
    {
        $this->processClientIntake->execute($request->validated());

        return redirect()->back()
            ->with('intake_success', true)
            ->with('success', 'Formulir booking berhasil dikirim! Tim Arams Pictures akan segera menghubungi Anda melalui WhatsApp.');
    }
}
