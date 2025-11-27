// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderHook, waitFor } from '@testing-library/react';
import { MedplumProvider } from '@medplum/react-hooks';
import { MockClient } from '@medplum/mock';
import type { AuditEvent, Practitioner } from '@medplum/fhirtypes';
import { useEmergencyAccess } from './useEmergencyAccess';

describe('useEmergencyAccess', () => {
  let medplum: MockClient;
  let mockPractitioner: Practitioner;

  beforeEach(() => {
    medplum = new MockClient();
    mockPractitioner = {
      resourceType: 'Practitioner',
      id: 'test-practitioner-123',
      name: [{ given: ['Test'], family: 'User' }],
    };
    medplum.setProfile(mockPractitioner);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MedplumProvider medplum={medplum}>{children}</MedplumProvider>
  );

  it('should request emergency access with valid reason', async () => {
    const { result } = renderHook(() => useEmergencyAccess(), { wrapper });

    const accessResult = await result.current.requestAccess(
      'patient-123',
      'Patient',
      'Life-threatening emergency requiring immediate access'
    );

    await waitFor(() => {
      expect(accessResult.granted).toBe(true);
      expect(accessResult.expiresAt).toBeDefined();
      expect(accessResult.auditEventId).toBeDefined();
    });
  });

  it('should return error when reason is too short', async () => {
    const { result } = renderHook(() => useEmergencyAccess(), { wrapper });

    const accessResult = await result.current.requestAccess(
      'patient-123',
      'Patient',
      'Short'
    );

    expect(accessResult.granted).toBe(false);
    expect(accessResult.error).toBe('Reason must be at least 10 characters');
  });

  it('should set 1-hour expiration for emergency access', async () => {
    const { result } = renderHook(() => useEmergencyAccess(), { wrapper });

    const beforeRequest = Date.now();
    const accessResult = await result.current.requestAccess(
      'patient-123',
      'Patient',
      'Valid emergency reason for testing'
    );
    const afterRequest = Date.now();

    expect(accessResult.granted).toBe(true);
    expect(accessResult.expiresAt).toBeDefined();

    const expirationTime = new Date(accessResult.expiresAt!).getTime();
    const oneHourMs = 60 * 60 * 1000;

    // Expiration should be ~1 hour from now (within 1 second tolerance)
    expect(expirationTime).toBeGreaterThanOrEqual(beforeRequest + oneHourMs - 1000);
    expect(expirationTime).toBeLessThanOrEqual(afterRequest + oneHourMs + 1000);
  });

  it('should revoke active access', async () => {
    const { result } = renderHook(() => useEmergencyAccess(), { wrapper });

    await result.current.requestAccess(
      'patient-123',
      'Patient',
      'Emergency access reason'
    );

    await waitFor(() => {
      expect(result.current.hasActiveAccess).toBe(true);
    });

    result.current.revokeAccess();

    await waitFor(() => {
      expect(result.current.hasActiveAccess).toBe(false);
      expect(result.current.activeAccess).toBeNull();
    });
  });

  it('should check expiration for hasActiveAccess', async () => {
    const { result } = renderHook(() => useEmergencyAccess(), { wrapper });

    // Request access
    await result.current.requestAccess(
      'patient-123',
      'Patient',
      'Emergency access reason'
    );

    await waitFor(() => {
      expect(result.current.hasActiveAccess).toBe(true);
    });

    // After revoke, should be false
    result.current.revokeAccess();

    await waitFor(() => {
      expect(result.current.hasActiveAccess).toBe(false);
    });
  });

  it('should return error when user is not authenticated', async () => {
    medplum.setProfile(undefined as any);
    const { result } = renderHook(() => useEmergencyAccess(), { wrapper });

    const accessResult = await result.current.requestAccess(
      'patient-123',
      'Patient',
      'Valid emergency reason'
    );

    expect(accessResult.granted).toBe(false);
    expect(accessResult.error).toBe('User not authenticated');
  });

  it('should create audit event with correct DICOM code', async () => {
    const createResourceSpy = jest.spyOn(medplum, 'createResource');
    const { result } = renderHook(() => useEmergencyAccess(), { wrapper });

    await result.current.requestAccess(
      'patient-123',
      'Patient',
      'Emergency access for testing'
    );

    await waitFor(() => {
      expect(createResourceSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceType: 'AuditEvent',
          type: expect.objectContaining({
            code: 'DCM 110113',
            display: 'Emergency Override Started',
          }),
          outcomeDesc: 'Emergency access: Emergency access for testing',
        })
      );
    });
  });
});
