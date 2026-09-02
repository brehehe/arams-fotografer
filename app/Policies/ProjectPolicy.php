<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /**
     * Determine whether the user can view any projects.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the project.
     */
    public function view(User $user, Project $project): bool
    {
        if ($user->hasAnyRole(['Super Admin', 'Owner', 'Admin', 'Supervisor'])) {
            return true;
        }

        // Team members assigned to the project
        if (in_array($user->id, [$project->photographer_id, $project->editor_id, $project->supervisor_id])) {
            return true;
        }

        // Client linked to the project
        if ($user->client_id && $user->client_id === $project->client_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create projects.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Owner', 'Admin', 'Supervisor']);
    }

    /**
     * Determine whether the user can update the project.
     */
    public function update(User $user, Project $project): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Owner', 'Admin']);
    }

    /**
     * Determine whether the user can update the project status/workflow.
     */
    public function updateStatus(User $user, Project $project): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Owner', 'Admin', 'Supervisor', 'Photographer', 'Editor']);
    }

    /**
     * Determine whether the user can delete the project.
     */
    public function delete(User $user, Project $project): bool
    {
        return $user->hasAnyRole(['Super Admin', 'Owner', 'Admin']);
    }
}
