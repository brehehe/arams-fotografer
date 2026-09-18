<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Traits\HasWebpUpload;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    use HasWebpUpload;

    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $settings = \App\Models\Setting::all()->groupBy('group');

        return Inertia::render('settings/profile', [
            'settings' => $settings,
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if ($request->hasFile('avatar_file')) {
            $avatarUrl = $this->uploadThumbnailAsWebp(
                $request->file('avatar_file'),
                'avatars',
                400,
                400,
                85,
                $user->avatar
            );
            $validated['avatar'] = $avatarUrl;
        } elseif ($request->has('avatar') && empty($request->input('avatar'))) {
            if ($user->avatar) {
                $this->deleteWebpImage($user->avatar);
            }
            $validated['avatar'] = null;
        }

        $user->fill($validated);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        // If user has a linked Client record, synchronize name, email, phone, avatar
        if ($user->client_id && $user->client) {
            $clientUpdates = [];
            if (isset($validated['name'])) $clientUpdates['name'] = $validated['name'];
            if (isset($validated['email'])) $clientUpdates['email'] = $validated['email'];
            if (isset($validated['phone'])) $clientUpdates['phone'] = $validated['phone'];
            if (array_key_exists('avatar', $validated)) $clientUpdates['avatar'] = $validated['avatar'];

            if (!empty($clientUpdates)) {
                $user->client->update($clientUpdates);
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Profil berhasil diperbarui.']);

        return redirect()->back()->with('success', 'Profil berhasil diperbarui.');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
