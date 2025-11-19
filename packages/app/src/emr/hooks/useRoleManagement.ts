import { useState, useEffect, useCallback } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { PractitionerRole } from '@medplum/fhirtypes';
import {
  createPractitionerRole,
  getPractitionerRoles,
  updatePractitionerRole,
  deletePractitionerRole,
  CreatePractitionerRoleParams,
  UpdatePractitionerRoleParams,
} from '../services/roleService';

/**
 * Hook for managing PractitionerRole resources for a specific practitioner
 *
 * @param practitionerId - ID of the Practitioner resource
 * @returns Role management utilities and state
 */
export function useRoleManagement(practitionerId: string) {
  const medplum = useMedplum();
  const [roles, setRoles] = useState<PractitionerRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetches all roles for the practitioner
   */
  const fetchRoles = useCallback(async () => {
    if (!practitionerId) {
      setRoles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedRoles = await getPractitionerRoles(medplum, practitionerId);
      setRoles(fetchedRoles);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching practitioner roles:', err);
    } finally {
      setLoading(false);
    }
  }, [medplum, practitionerId]);

  /**
   * Initial fetch on mount and when practitionerId changes
   */
  useEffect(() => {
    void fetchRoles();
  }, [fetchRoles]);

  /**
   * Adds a new role to the practitioner
   *
   * @param params - Role creation parameters
   * @returns Created PractitionerRole
   */
  const addRole = useCallback(
    async (params: CreatePractitionerRoleParams): Promise<PractitionerRole> => {
      try {
        const newRole = await createPractitionerRole(medplum, params);
        await fetchRoles(); // Refresh the list
        return newRole;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [medplum, fetchRoles]
  );

  /**
   * Updates an existing role
   *
   * @param roleId - PractitionerRole resource ID
   * @param params - Update parameters
   * @returns Updated PractitionerRole
   */
  const updateRole = useCallback(
    async (roleId: string, params: UpdatePractitionerRoleParams): Promise<PractitionerRole> => {
      try {
        const updatedRole = await updatePractitionerRole(medplum, roleId, params);
        await fetchRoles(); // Refresh the list
        return updatedRole;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [medplum, fetchRoles]
  );

  /**
   * Removes a role from the practitioner
   *
   * @param roleId - PractitionerRole resource ID
   * @param hardDelete - If true, permanently deletes; otherwise soft deletes
   */
  const removeRole = useCallback(
    async (roleId: string, hardDelete: boolean = false): Promise<void> => {
      try {
        await deletePractitionerRole(medplum, roleId, hardDelete);
        await fetchRoles(); // Refresh the list
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [medplum, fetchRoles]
  );

  /**
   * Manually refreshes the role list
   */
  const refresh = useCallback(async () => {
    await fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,
    addRole,
    updateRole,
    removeRole,
    refresh,
  };
}
