// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { renderHook, waitFor } from '@testing-library/react';
import { MedplumProvider } from '@medplum/react-hooks';
import { MockClient } from '@medplum/mock';
import { useDepartmentContext } from './useDepartmentContext';
import type { Practitioner, PractitionerRole } from '@medplum/fhirtypes';

describe('useDepartmentContext', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
  });

  function wrapper({ children }: { children: React.ReactNode }): JSX.Element {
    return <MedplumProvider medplum={medplum}>{children}</MedplumProvider>;
  }

  it('returns null when user has no department', async () => {
    const practitioner: Practitioner = {
      resourceType: 'Practitioner',
      id: 'practitioner-001',
      name: [{ given: ['John'], family: 'Doe' }],
    };

    jest.spyOn(medplum, 'getProfile').mockReturnValue(practitioner);
    jest.spyOn(medplum, 'search').mockResolvedValue({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [],
    });

    const { result } = renderHook(() => useDepartmentContext(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBeNull();
    });
  });

  it('returns department ID from PractitionerRole', async () => {
    const practitioner: Practitioner = {
      resourceType: 'Practitioner',
      id: 'practitioner-001',
      name: [{ given: ['John'], family: 'Doe' }],
    };

    const practitionerRole: PractitionerRole = {
      resourceType: 'PractitionerRole',
      id: 'role-001',
      active: true,
      practitioner: { reference: 'Practitioner/practitioner-001' },
      organization: { reference: 'Organization/dept-cardiology' },
    };

    jest.spyOn(medplum, 'getProfile').mockReturnValue(practitioner);
    jest.spyOn(medplum, 'search').mockResolvedValue({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [{ resource: practitionerRole }],
    });

    const { result } = renderHook(() => useDepartmentContext(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBe('dept-cardiology');
    });
  });

  it('returns null when profile is not a Practitioner', async () => {
    jest.spyOn(medplum, 'getProfile').mockReturnValue({
      resourceType: 'Patient',
      id: 'patient-001',
    });

    const { result } = renderHook(() => useDepartmentContext(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBeNull();
    });
  });

  it('returns null when profile is not available', async () => {
    jest.spyOn(medplum, 'getProfile').mockReturnValue(undefined);

    const { result } = renderHook(() => useDepartmentContext(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBeNull();
    });
  });

  it('handles search errors gracefully', async () => {
    const practitioner: Practitioner = {
      resourceType: 'Practitioner',
      id: 'practitioner-001',
      name: [{ given: ['John'], family: 'Doe' }],
    };

    jest.spyOn(medplum, 'getProfile').mockReturnValue(practitioner);
    jest.spyOn(medplum, 'search').mockRejectedValue(new Error('Network error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useDepartmentContext(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[useDepartmentContext] Failed to fetch user department:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  it('returns first department when user has multiple roles', async () => {
    const practitioner: Practitioner = {
      resourceType: 'Practitioner',
      id: 'practitioner-001',
      name: [{ given: ['John'], family: 'Doe' }],
    };

    const practitionerRoles: PractitionerRole[] = [
      {
        resourceType: 'PractitionerRole',
        id: 'role-001',
        active: true,
        practitioner: { reference: 'Practitioner/practitioner-001' },
        organization: { reference: 'Organization/dept-cardiology' },
      },
      {
        resourceType: 'PractitionerRole',
        id: 'role-002',
        active: true,
        practitioner: { reference: 'Practitioner/practitioner-001' },
        organization: { reference: 'Organization/dept-radiology' },
      },
    ];

    jest.spyOn(medplum, 'getProfile').mockReturnValue(practitioner);
    jest.spyOn(medplum, 'search').mockResolvedValue({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: practitionerRoles.map((role) => ({ resource: role })),
    });

    const { result } = renderHook(() => useDepartmentContext(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBe('dept-cardiology');
    });
  });

  it('skips roles without organization reference', async () => {
    const practitioner: Practitioner = {
      resourceType: 'Practitioner',
      id: 'practitioner-001',
      name: [{ given: ['John'], family: 'Doe' }],
    };

    const practitionerRoles: PractitionerRole[] = [
      {
        resourceType: 'PractitionerRole',
        id: 'role-001',
        active: true,
        practitioner: { reference: 'Practitioner/practitioner-001' },
        // No organization
      },
      {
        resourceType: 'PractitionerRole',
        id: 'role-002',
        active: true,
        practitioner: { reference: 'Practitioner/practitioner-001' },
        organization: { reference: 'Organization/dept-radiology' },
      },
    ];

    jest.spyOn(medplum, 'getProfile').mockReturnValue(practitioner);
    jest.spyOn(medplum, 'search').mockResolvedValue({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: practitionerRoles.map((role) => ({ resource: role })),
    });

    const { result } = renderHook(() => useDepartmentContext(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBe('dept-radiology');
    });
  });
});
