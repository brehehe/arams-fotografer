<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserService
{
    /**
     * Get paginated users with filters and roles lookup.
     */
    public function getUsersPaginated(Request $request): array
    {
        $query = User::with('roles');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role = $request->input('role')) {
            if ($role !== 'all' && $role !== 'Semua Role') {
                $query->whereHas('roles', function ($q) use ($role) {
                    $q->where('name', $role);
                });
            }
        }

        if ($status = $request->input('status')) {
            if ($status !== 'all' && $status !== 'Semua Status') {
                $query->where('status', $status);
            }
        }

        $sort = $request->input('sort', 'asc');
        $query->orderBy('name', $sort === 'desc' ? 'desc' : 'asc');

        $users = $query->paginate(10)->withQueryString();
        $roles = Role::all();

        return [
            'users' => $users,
            'roles' => $roles,
            'filters' => (object) $request->only(['search', 'role', 'status', 'sort']),
            'current_user_id' => auth()->id(),
        ];
    }

    /**
     * Create user, hash password, assign role, and log activity.
     */
    public function createUser(array $data, ?User $causer = null): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'status' => $data['status'],
            'password' => Hash::make($data['password']),
        ]);

        $user->assignRole($data['role']);

        activity()
            ->causedBy($causer ?? auth()->user())
            ->performedOn($user)
            ->event('created')
            ->log("Pengguna baru {$user->name} ({$data['role']}) berhasil ditambahkan");

        return $user;
    }

    /**
     * Update user details, password (if provided), sync role, and log activity.
     */
    public function updateUser(User $user, array $data, ?User $causer = null): User
    {
        $updateData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'status' => $data['status'],
        ];

        if (! empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $user->update($updateData);
        $user->syncRoles([$data['role']]);

        activity()
            ->causedBy($causer ?? auth()->user())
            ->performedOn($user)
            ->event('updated')
            ->log("Data pengguna {$user->name} telah diperbarui");

        return $user;
    }

    /**
     * Delete user and log activity.
     */
    public function deleteUser(User $user, ?User $causer = null): bool
    {
        $name = $user->name;
        $deleted = $user->delete();

        activity()
            ->causedBy($causer ?? auth()->user())
            ->performedOn($user)
            ->event('deleted')
            ->log("Pengguna {$name} dihapus");

        return (bool) $deleted;
    }
}
