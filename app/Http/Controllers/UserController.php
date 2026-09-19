<?php

namespace App\Http\Controllers;

use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
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

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->userService->createUser($request->validated(), $request->user());

        return redirect()->back()->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->userService->updateUser($user, $request->validated(), $request->user());

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

