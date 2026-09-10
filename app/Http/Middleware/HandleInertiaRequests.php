<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? array_merge($request->user()->toArray(), [
                    'roles' => $request->user()->getRoleNames()->toArray(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name')->toArray(),
                    'role' => $request->user()->getRoleNames()->first() ?? 'Staff',
                    'is_admin' => $request->user()->hasAnyRole(['Super Admin', 'Owner', 'Admin']),
                    'is_supervisor' => $request->user()->hasRole('Supervisor'),
                    'is_photographer' => $request->user()->hasRole('Photographer'),
                    'is_editor' => $request->user()->hasRole('Editor'),
                ]) : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'appSettings' => [
                'company_name' => \App\Models\Setting::get('company_name', 'Arams Pictures'),
                'company_subtitle' => \App\Models\Setting::get('company_subtitle', 'STUDIO & CINEMA'),
                'company_tagline' => \App\Models\Setting::get('company_tagline', 'Capturing Moments, Creating Timeless Memories'),
                'company_description' => \App\Models\Setting::get('company_description', \App\Models\Setting::get('company_tagline', 'Jasa fotografi & videografi profesional untuk mengabadikan setiap momen berharga Anda dengan kualitas sinematik terbaik.')),
                'company_logo' => \App\Models\Setting::get('company_logo', ''),
                'company_email' => \App\Models\Setting::get('company_email', 'hello@aramspictures.com'),
                'company_phone' => \App\Models\Setting::get('company_phone', '+62 812-3456-7890'),
                'company_whatsapp' => \App\Models\Setting::get('company_whatsapp', '+62 812-3456-7890'),
                'company_instagram' => \App\Models\Setting::get('company_instagram', 'aramspictures'),
                'company_tiktok' => \App\Models\Setting::get('company_tiktok', 'aramspictures'),
                'company_youtube' => \App\Models\Setting::get('company_youtube', ''),
                'company_facebook' => \App\Models\Setting::get('company_facebook', ''),
                'company_gdrive_url' => \App\Models\Setting::get('company_gdrive_url', ''),
                'company_operational_hours' => \App\Models\Setting::get('company_operational_hours', 'Senin - Minggu, 09.00 - 18.00 WIB'),
                'company_address' => \App\Models\Setting::get('company_address', 'Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan 12190'),
                'company_city' => \App\Models\Setting::get('company_city', 'Jakarta Selatan'),
                'invoice_director_name' => \App\Models\Setting::get('invoice_director_name', \App\Models\Setting::get('company_director_name', 'Aditya Pratama')),
                'invoice_director_title' => \App\Models\Setting::get('invoice_director_title', 'Direktur Utama / Finance Studio'),
                'invoice_signature_city' => \App\Models\Setting::get('invoice_signature_city', \App\Models\Setting::get('company_city', 'Jakarta Selatan')),
                'theme_preset' => \App\Models\Setting::get('theme_preset', 'arams_maroon_luxury'),
                'sidebar_bg_color' => \App\Models\Setting::get('sidebar_bg_color', '#3C0E0E'),
                'sidebar_bg_gradient' => \App\Models\Setting::get('sidebar_bg_gradient', 'linear-gradient(180deg, #3C0E0E 0%, #2A0909 100%)'),
                'sidebar_active_bg' => \App\Models\Setting::get('sidebar_active_bg', '#541515'),
                'sidebar_active_bg_gradient' => \App\Models\Setting::get('sidebar_active_bg_gradient', ''),
                'sidebar_active_text' => \App\Models\Setting::get('sidebar_active_text', '#FFFFFF'),
                'sidebar_text_color' => \App\Models\Setting::get('sidebar_text_color', '#F4EBE4'),
                'primary_accent_color' => \App\Models\Setting::get('primary_accent_color', '#3C0E0E'),
                'primary_accent_gradient' => \App\Models\Setting::get('primary_accent_gradient', ''),
                'app_bg_color' => \App\Models\Setting::get('app_bg_color', '#FBF6F0'),
                'app_bg_gradient' => \App\Models\Setting::get('app_bg_gradient', ''),
                'login_preset' => \App\Models\Setting::get('login_preset', 'arams_maroon_luxury'),
                'login_bg_color' => \App\Models\Setting::get('login_bg_color', '#3C0E0E'),
                'login_bg_gradient' => \App\Models\Setting::get('login_bg_gradient', 'linear-gradient(180deg, #3C0E0E 0%, #2A0909 100%)'),
                'login_card_bg' => \App\Models\Setting::get('login_card_bg', '#4D1212'),
                'login_card_bg_gradient' => \App\Models\Setting::get('login_card_bg_gradient', ''),
                'login_accent_color' => \App\Models\Setting::get('login_accent_color', '#3C0E0E'),
                'login_tagline' => \App\Models\Setting::get('login_tagline', 'STUDIO & CINEMA PHOTOGRAPHY SYSTEM'),
                'font_family_heading' => \App\Models\Setting::get('font_family_heading', 'Plus Jakarta Sans'),
                'font_family_body' => \App\Models\Setting::get('font_family_body', 'Plus Jakarta Sans'),
                'app_heading_color' => \App\Models\Setting::get('app_heading_color', '#3C0E0E'),
                'app_text_color' => \App\Models\Setting::get('app_text_color', '#334155'),
                'app_muted_text_color' => \App\Models\Setting::get('app_muted_text_color', '#7A6666'),
                'header_bg_color' => \App\Models\Setting::get('header_bg_color', '#FFFFFF'),
                'header_bg_gradient' => \App\Models\Setting::get('header_bg_gradient', ''),
                'header_text_color' => \App\Models\Setting::get('header_text_color', '#3C0E0E'),
                'header_border_color' => \App\Models\Setting::get('header_border_color', '#F4EBE4'),
                'breadcrumb_color' => \App\Models\Setting::get('breadcrumb_color', '#3C0E0E'),
                'breadcrumb_active_color' => \App\Models\Setting::get('breadcrumb_active_color', '#3C0E0E'),
                'header_search_bg' => \App\Models\Setting::get('header_search_bg', ''),
                'header_search_text' => \App\Models\Setting::get('header_search_text', ''),
                'card_heading_color' => \App\Models\Setting::get('card_heading_color', '#3C0E0E'),
                // Portal Klien Customization Tokens
                'portal_preset' => \App\Models\Setting::get('portal_preset', 'arams_maroon_luxury'),
                'portal_bg_color' => \App\Models\Setting::get('portal_bg_color', '#FBF6F0'),
                'portal_bg_gradient' => \App\Models\Setting::get('portal_bg_gradient', ''),
                'portal_nav_bg' => \App\Models\Setting::get('portal_nav_bg', '#3C0E0E'),
                'portal_nav_gradient' => \App\Models\Setting::get('portal_nav_gradient', 'linear-gradient(180deg, #3C0E0E 0%, #2A0909 100%)'),
                'portal_nav_text_color' => \App\Models\Setting::get('portal_nav_text_color', '#FFFFFF'),
                'portal_nav_border_color' => \App\Models\Setting::get('portal_nav_border_color', '#4D1212'),
                'portal_card_bg' => \App\Models\Setting::get('portal_card_bg', '#FFFFFF'),
                'portal_card_bg_gradient' => \App\Models\Setting::get('portal_card_bg_gradient', ''),
                'portal_card_border' => \App\Models\Setting::get('portal_card_border', '#F4EBE4'),
                'portal_primary_accent' => \App\Models\Setting::get('portal_primary_accent', '#3C0E0E'),
                'portal_accent_gradient' => \App\Models\Setting::get('portal_accent_gradient', 'linear-gradient(135deg, #3C0E0E 0%, #2A0909 100%)'),
                'portal_heading_color' => \App\Models\Setting::get('portal_heading_color', '#3C0E0E'),
                'portal_text_color' => \App\Models\Setting::get('portal_text_color', '#334155'),
                'portal_muted_color' => \App\Models\Setting::get('portal_muted_color', '#7A6666'),
                'portal_font_heading' => \App\Models\Setting::get('portal_font_heading', 'Plus Jakarta Sans'),
                'portal_font_body' => \App\Models\Setting::get('portal_font_body', 'Plus Jakarta Sans'),
                'portal_hero_bg' => \App\Models\Setting::get('portal_hero_bg', '#3C0E0E'),
                'portal_hero_gradient' => \App\Models\Setting::get('portal_hero_gradient', 'linear-gradient(135deg, #3C0E0E 0%, #2A0909 100%)'),
                'portal_hero_text_color' => \App\Models\Setting::get('portal_hero_text_color', '#FFFFFF'),
                'portal_footer_bg' => \App\Models\Setting::get('portal_footer_bg', '#3C0E0E'),
                'portal_footer_text' => \App\Models\Setting::get('portal_footer_text', '#FFFFFF'),
                'portal_footer_badges_gradient' => \App\Models\Setting::get('portal_footer_badges_gradient', ''),
                'portal_footer_badges_title' => \App\Models\Setting::get('portal_footer_badges_title', 'Kenapa Memilih Arams Pictures?'),
                'portal_footer_badges_subtitle' => \App\Models\Setting::get('portal_footer_badges_subtitle', 'Premium Client Experience'),
                'portal_footer_main_bg' => \App\Models\Setting::get('portal_footer_main_bg', '#F4EBE4'),
                'portal_footer_main_text' => \App\Models\Setting::get('portal_footer_main_text', '#334155'),
                'portal_footer_heading_color' => \App\Models\Setting::get('portal_footer_heading_color', '#3C0E0E'),
                'portal_footer_muted_color' => \App\Models\Setting::get('portal_footer_muted_color', '#7A6666'),
                'portal_footer_item_bg' => \App\Models\Setting::get('portal_footer_item_bg', '#F4EBE4'),
                'portal_footer_item_icon_color' => \App\Models\Setting::get('portal_footer_item_icon_color', '#3C0E0E'),
                'portal_footer_border_color' => \App\Models\Setting::get('portal_footer_border_color', '#E8DDD5'),
                'portal_footer_tagline' => \App\Models\Setting::get('portal_footer_tagline', 'Capturing Moments, Creating Timeless Memories'),
                'portal_footer_contact_title' => \App\Models\Setting::get('portal_footer_contact_title', 'Hubungi Kami'),
                'portal_footer_contact_subtitle' => \App\Models\Setting::get('portal_footer_contact_subtitle', 'Kami siap membantu Anda kapan saja.'),
                'portal_footer_social_title' => \App\Models\Setting::get('portal_footer_social_title', 'Ikuti Kami'),
                'portal_footer_social_subtitle' => \App\Models\Setting::get('portal_footer_social_subtitle', 'Ikuti sosial media kami untuk update terbaru.'),
                'portal_footer_copyright' => \App\Models\Setting::get('portal_footer_copyright', '© 2026 Arams Photography. All rights reserved.'),
                'portal_btn_bg' => \App\Models\Setting::get('portal_btn_bg', '#FFFFFF'),
                'portal_btn_text' => \App\Models\Setting::get('portal_btn_text', '#3C0E0E'),
                'portal_btn_border' => \App\Models\Setting::get('portal_btn_border', '#FFFFFF'),
                'portal_btn_hover_bg' => \App\Models\Setting::get('portal_btn_hover_bg', '#3C0E0E'),
                'portal_btn_hover_text' => \App\Models\Setting::get('portal_btn_hover_text', '#FFFFFF'),
                // Report & Charts Customization Tokens
                'report_primary_accent' => \App\Models\Setting::get('report_primary_accent', \App\Models\Setting::get('primary_accent_color', '#3C0E0E')),
                'report_revenue_color' => \App\Models\Setting::get('report_revenue_color', \App\Models\Setting::get('primary_accent_color', '#3C0E0E')),
                'report_projects_color' => \App\Models\Setting::get('report_projects_color', '#10B981'),
                'report_received_color' => \App\Models\Setting::get('report_received_color', '#059669'),
                'report_pending_color' => \App\Models\Setting::get('report_pending_color', '#DC2626'),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
                'toast' => fn () => $request->session()->get('toast'),
                'whatsapp_url' => fn () => $request->session()->get('whatsapp_url'),
            ],
        ];
    }
}
