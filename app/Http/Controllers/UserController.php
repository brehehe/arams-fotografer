<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(
        protected UserService $userService
    ) {}

    public function index(Request $request): Response
    {
        $data = $this->userService->getUsersPaginated($request);

        return Inertia::render('Users/Index', $data);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email|max:255',
            'phone' => 'nullable|string|max:50',
            'role' => 'required|exists:roles,name',
            'status' => 'required|string|in:active,inactive,suspended',
            'password' => 'required|string|min:8',
        ]);

        $this->userService->createUser($validated, auth()->user());

        return redirect()->back()->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,'.$user->id,
            'phone' => 'nullable|string|max:50',
            'role' => 'required|exists:roles,name',
            'status' => 'required|string|in:active,inactive,suspended',
            'password' => 'nullable|string|min:8',
        ]);

        $this->userService->updateUser($user, $validated, auth()->user());

        return redirect()->back()->with('success', 'Pengguna berhasil diperbarui.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $this->userService->deleteUser($user, auth()->user());

        return redirect()->back()->with('success', 'Pengguna berhasil dihapus.');
    }
}

