<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;

class ClientPolicy
{
    /**
     * Determine whether the user can view any clients.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Owner', 'Admin', 'Supervisor', 'Photographer', 'Editor']);
    }

    /**
     * Determine whether the user can view the client.
     */
    public function view(User $user, Client $client): bool
    {
        if ($user->hasAnyRole(['Super Admin', 'Owner', 'Admin', 'Supervisor', 'Photographer', 'Editor'])) {
            return true;
        }

        return $user->client_id === $client->id;
    }

    /**
     * Determine whether the user can create clients.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Owner', 'Admin', 'Supervisor']);
    }

    /**
     * Determine whether the user can update the client.
     */
    public function update(User $user, Client $client): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Owner', 'Admin', 'Supervisor']);
    }

    /**
     * Determine whether the user can delete the client.
     */
    public function delete(User $user, Client $client): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Owner', 'Admin']);
    }
}
