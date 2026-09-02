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
                'company_tagline' => \App\Models\Setting::get('company_tagline', 'PHOTOGRAPHY SYSTEM'),
                'company_logo' => \App\Models\Setting::get('company_logo', ''),
                'theme_preset' => \App\Models\Setting::get('theme_preset', 'arams_master_purple'),
                'sidebar_bg_color' => \App\Models\Setting::get('sidebar_bg_color', '#1C132E'),
                'sidebar_bg_gradient' => \App\Models\Setting::get('sidebar_bg_gradient', ''),
                'sidebar_active_bg' => \App\Models\Setting::get('sidebar_active_bg', '#C98922'),
                'sidebar_active_bg_gradient' => \App\Models\Setting::get('sidebar_active_bg_gradient', ''),
                'sidebar_active_text' => \App\Models\Setting::get('sidebar_active_text', '#FFFFFF'),
                'sidebar_text_color' => \App\Models\Setting::get('sidebar_text_color', '#94A3B8'),
                'primary_accent_color' => \App\Models\Setting::get('primary_accent_color', '#C98922'),
                'primary_accent_gradient' => \App\Models\Setting::get('primary_accent_gradient', ''),
                'app_bg_color' => \App\Models\Setting::get('app_bg_color', '#F8F6F5'),
                'app_bg_gradient' => \App\Models\Setting::get('app_bg_gradient', ''),
                'login_bg_color' => \App\Models\Setting::get('login_bg_color', '#0E091E'),
                'login_bg_gradient' => \App\Models\Setting::get('login_bg_gradient', ''),
                'login_card_bg' => \App\Models\Setting::get('login_card_bg', '#1C132E'),
                'login_card_bg_gradient' => \App\Models\Setting::get('login_card_bg_gradient', ''),
                'login_accent_color' => \App\Models\Setting::get('login_accent_color', '#C98922'),
                'login_tagline' => \App\Models\Setting::get('login_tagline', 'STUDIO & CINEMA PHOTOGRAPHY SYSTEM'),
                'font_family_heading' => \App\Models\Setting::get('font_family_heading', 'Plus Jakarta Sans'),
                'font_family_body' => \App\Models\Setting::get('font_family_body', 'Plus Jakarta Sans'),
                'app_heading_color' => \App\Models\Setting::get('app_heading_color', '#0F172A'),
                'app_text_color' => \App\Models\Setting::get('app_text_color', '#334155'),
                'app_muted_text_color' => \App\Models\Setting::get('app_muted_text_color', '#64748B'),
                'header_bg_color' => \App\Models\Setting::get('header_bg_color', '#FFFFFF'),
                'header_bg_gradient' => \App\Models\Setting::get('header_bg_gradient', ''),
                'header_text_color' => \App\Models\Setting::get('header_text_color', '#0F172A'),
                'header_border_color' => \App\Models\Setting::get('header_border_color', '#E2E8F0'),
                'breadcrumb_color' => \App\Models\Setting::get('breadcrumb_color', '#C98922'),
                'breadcrumb_active_color' => \App\Models\Setting::get('breadcrumb_active_color', '#FFFFFF'),
                'card_heading_color' => \App\Models\Setting::get('card_heading_color', '#1E293B'),
                // Portal Klien Customization Tokens
                'portal_preset' => \App\Models\Setting::get('portal_preset', 'luxury_champagne'),
                'portal_bg_color' => \App\Models\Setting::get('portal_bg_color', '#FDFBF7'),
                'portal_bg_gradient' => \App\Models\Setting::get('portal_bg_gradient', ''),
                'portal_nav_bg' => \App\Models\Setting::get('portal_nav_bg', '#FFFFFF'),
                'portal_nav_gradient' => \App\Models\Setting::get('portal_nav_gradient', ''),
                'portal_nav_text_color' => \App\Models\Setting::get('portal_nav_text_color', '#0F172A'),
                'portal_nav_border_color' => \App\Models\Setting::get('portal_nav_border_color', 'rgba(226, 232, 240, 0.8)'),
                'portal_card_bg' => \App\Models\Setting::get('portal_card_bg', '#FFFFFF'),
                'portal_card_bg_gradient' => \App\Models\Setting::get('portal_card_bg_gradient', ''),
                'portal_card_border' => \App\Models\Setting::get('portal_card_border', 'rgba(226, 232, 240, 0.8)'),
                'portal_primary_accent' => \App\Models\Setting::get('portal_primary_accent', '#C98922'),
                'portal_accent_gradient' => \App\Models\Setting::get('portal_accent_gradient', ''),
                'portal_heading_color' => \App\Models\Setting::get('portal_heading_color', '#0F172A'),
                'portal_text_color' => \App\Models\Setting::get('portal_text_color', '#334155'),
                'portal_muted_color' => \App\Models\Setting::get('portal_muted_color', '#64748B'),
                'portal_font_heading' => \App\Models\Setting::get('portal_font_heading', 'Plus Jakarta Sans'),
                'portal_font_body' => \App\Models\Setting::get('portal_font_body', 'Plus Jakarta Sans'),
                'portal_hero_bg' => \App\Models\Setting::get('portal_hero_bg', '#1C132E'),
                'portal_hero_gradient' => \App\Models\Setting::get('portal_hero_gradient', 'linear-gradient(135deg, #1C132E 0%, #0E091E 100%)'),
                'portal_hero_text_color' => \App\Models\Setting::get('portal_hero_text_color', '#FFFFFF'),
                'portal_footer_bg' => \App\Models\Setting::get('portal_footer_bg', '#FFFFFF'),
                'portal_footer_text' => \App\Models\Setting::get('portal_footer_text', '#475569'),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
                'toast' => fn () => $request->session()->get('toast'),
            ],
        ];
    }
}
