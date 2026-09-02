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
            ->select('id', 'name', 'color')
            ->orderBy('name')
            ->get();

        $packages = Package::where('status', 'active')
            ->select('id', 'name', 'category_id', 'base_price', 'duration_hours', 'description')
            ->orderBy('name')
            ->get();

        $weddingOrganizers = WeddingOrganizer::whereIn('status', ['partner', 'active'])
            ->select('id', 'name', 'pic_name', 'phone', 'city', 'tier')
            ->orderBy('name')
            ->get();

        $allClients = Client::select('id', 'name', 'phone', 'city', 'bride_name', 'groom_name')
            ->orderBy('name')
            ->get();

        $settings = Setting::all()->pluck('value', 'key')->toArray();

        return Inertia::render('Public/ClientIntakeForm', [
            'categories' => $categories,
            'packages' => $packages,
            'wedding_organizers' => $weddingOrganizers,
            'all_clients' => $allClients,
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

        return redirect()->back()->with('success', 'Formulir booking berhasil dikirim! Tim Arams Pictures akan segera menghubungi Anda melalui WhatsApp.');
    }
}
