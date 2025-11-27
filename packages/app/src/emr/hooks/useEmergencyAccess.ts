// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useCallback } from 'react';
import { useMedplum, useMedplumProfile } from '@medplum/react-hooks';
import type { EmergencyAccessRequest, EmergencyAccessResult } from '../types/permission-cache';
import { logEmergencyAccess } from '../services/auditService';

/**
 * Hook for emergency (break-glass) access workflow
 * Grants temporary access to restricted data with mandatory audit logging
 *
 * @returns Object with requestAccess, revokeAccess, loading, activeAccess, hasActiveAccess
 *
 * @example
 * ```typescript
 * const { requestAccess, hasActiveAccess } = useEmergencyAccess();
 *
 * const handleEmergencyAccess = async () => {
 *   const result = await requestAccess('patient-123', 'Patient', 'Life-threatening emergency');
 *   if (result.granted) {
 *     // Access granted for 1 hour
 *   }
 * };
 * ```
 */
export function useEmergencyAccess() {
  const medplum = useMedplum();
  const profile = useMedplumProfile();
  const [loading, setLoading] = useState(false);
  const [activeAccess, setActiveAccess] = useState<EmergencyAccessResult | null>(null);

  const requestAccess = useCallback(async (
    resourceId: string,
    resourceType: string,
    reason: string
  ): Promise<EmergencyAccessResult> => {
    if (!profile?.id) {
      return { granted: false, error: 'User not authenticated' };
    }

    if (!reason || reason.length < 10) {
      return { granted: false, error: 'Reason must be at least 10 characters' };
    }

    setLoading(true);
    try {
      const request: EmergencyAccessRequest = {
        resourceId,
        resourceType,
        reason,
        requestedAt: new Date().toISOString(),
        requestedBy: profile.id,
      };

      // Log the emergency access with DICOM code DCM 110113
      const auditEvent = await logEmergencyAccess(medplum, request);

      const result: EmergencyAccessResult = {
        granted: true,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        auditEventId: auditEvent.id,
      };

      setActiveAccess(result);
      return result;
    } catch (error) {
      return { granted: false, error: 'Failed to grant emergency access' };
    } finally {
      setLoading(false);
    }
  }, [medplum, profile?.id]);

  const revokeAccess = useCallback(() => {
    setActiveAccess(null);
  }, []);

  return {
    requestAccess,
    revokeAccess,
    loading,
    activeAccess,
    hasActiveAccess: !!activeAccess && new Date(activeAccess.expiresAt!) > new Date(),
  };
}
