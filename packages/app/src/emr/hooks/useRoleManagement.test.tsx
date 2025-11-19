import { renderHook, act, waitFor } from '@testing-library/react';
import { MedplumProvider } from '@medplum/react-hooks';
import { MockClient } from '@medplum/mock';
import { MantineProvider } from '@mantine/core';
import { PractitionerRole } from '@medplum/fhirtypes';
import { useRoleManagement } from './useRoleManagement';

describe('useRoleManagement', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider>
      <MedplumProvider medplum={medplum}>{children}</MedplumProvider>
    </MantineProvider>
  );

  it('should initialize with empty roles', () => {
    const { result } = renderHook(() => useRoleManagement('test-practitioner-123'), { wrapper });

    expect(result.current.roles).toEqual([]);
    expect(result.current.loading).toBe(true);
  });

  it('should fetch roles for practitioner', async () => {
    const practitionerId = 'test-practitioner-123';

    // Create mock roles
    const role1: PractitionerRole = {
      resourceType: 'PractitionerRole',
      id: 'role-1',
      active: true,
      practitioner: { reference: `Practitioner/${practitionerId}` },
      organization: { reference: 'Organization/dept-cardiology' },
      code: [
        {
          coding: [
            {
              system: 'http://medimind.ge/role-codes',
              code: 'physician',
            },
          ],
        },
      ],
      specialty: [
        {
          coding: [
            {
              system: 'http://nucc.org/provider-taxonomy',
              code: '207RC0000X',
            },
          ],
        },
      ],
    };

    await medplum.createResource(role1);

    const { result } = renderHook(() => useRoleManagement(practitionerId), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.roles).toBeDefined();
    expect(result.current.roles.length).toBe(1);
    expect(result.current.roles[0].id).toBe('role-1');
  });

  it('should add new role', async () => {
    const practitionerId = 'test-practitioner-456';
    const { result } = renderHook(() => useRoleManagement(practitionerId), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addRole({
        practitioner: { reference: `Practitioner/${practitionerId}` },
        organization: { reference: 'Organization/dept-emergency' },
        roleCode: 'nurse',
        specialtyCode: '207P00000X',
      });
    });

    await waitFor(() => {
      expect(result.current.roles.length).toBe(1);
    });

    expect(result.current.roles[0].code?.[0]?.coding?.[0]?.code).toBe('nurse');
    expect(result.current.roles[0].specialty?.[0]?.coding?.[0]?.code).toBe('207P00000X');
  });

  it('should remove role', async () => {
    const practitionerId = 'test-practitioner-789';

    // Create initial role
    const role: PractitionerRole = {
      resourceType: 'PractitionerRole',
      id: 'role-to-remove',
      active: true,
      practitioner: { reference: `Practitioner/${practitionerId}` },
      organization: { reference: 'Organization/dept-cardiology' },
    };

    await medplum.createResource(role);

    const { result } = renderHook(() => useRoleManagement(practitionerId), { wrapper });

    await waitFor(() => {
      expect(result.current.roles.length).toBe(1);
    });

    await act(async () => {
      await result.current.removeRole('role-to-remove');
    });

    await waitFor(() => {
      expect(result.current.roles.length).toBe(0);
    });
  });

  it('should update role', async () => {
    const practitionerId = 'test-practitioner-update';

    // Create initial role
    const role: PractitionerRole = {
      resourceType: 'PractitionerRole',
      id: 'role-update',
      active: true,
      practitioner: { reference: `Practitioner/${practitionerId}` },
      organization: { reference: 'Organization/dept-cardiology' },
      specialty: [
        {
          coding: [
            {
              system: 'http://nucc.org/provider-taxonomy',
              code: '207RC0000X',
            },
          ],
        },
      ],
    };

    await medplum.createResource(role);

    const { result } = renderHook(() => useRoleManagement(practitionerId), { wrapper });

    await waitFor(() => {
      expect(result.current.roles.length).toBe(1);
    });

    await act(async () => {
      await result.current.updateRole('role-update', {
        specialtyCode: '207P00000X', // Change specialty
      });
    });

    await waitFor(() => {
      expect(result.current.roles[0].specialty?.[0]?.coding?.[0]?.code).toBe('207P00000X');
    });
  });

  it('should handle multiple roles', async () => {
    const practitionerId = 'test-practitioner-multi';

    const role1: PractitionerRole = {
      resourceType: 'PractitionerRole',
      id: 'role-1',
      active: true,
      practitioner: { reference: `Practitioner/${practitionerId}` },
      organization: { reference: 'Organization/dept-cardiology' },
      code: [
        {
          coding: [{ system: 'http://medimind.ge/role-codes', code: 'physician' }],
        },
      ],
    };

    const role2: PractitionerRole = {
      resourceType: 'PractitionerRole',
      id: 'role-2',
      active: true,
      practitioner: { reference: `Practitioner/${practitionerId}` },
      organization: { reference: 'Organization/dept-admin' },
      code: [
        {
          coding: [{ system: 'http://medimind.ge/role-codes', code: 'department-head' }],
        },
      ],
    };

    await medplum.createResource(role1);
    await medplum.createResource(role2);

    const { result } = renderHook(() => useRoleManagement(practitionerId), { wrapper });

    await waitFor(() => {
      expect(result.current.roles.length).toBe(2);
    });

    expect(result.current.roles[0].code?.[0]?.coding?.[0]?.code).toBe('physician');
    expect(result.current.roles[1].code?.[0]?.coding?.[0]?.code).toBe('department-head');
  });

  it('should handle error when adding role fails', async () => {
    const practitionerId = 'test-practitioner-error';
    const { result } = renderHook(() => useRoleManagement(practitionerId), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock error by passing invalid data
    await act(async () => {
      await expect(
        result.current.addRole({
          practitioner: { reference: '' }, // Invalid reference
          organization: { reference: '' },
          roleCode: '',
        })
      ).rejects.toThrow();
    });
  });

  it('should refresh roles after adding', async () => {
    const practitionerId = 'test-practitioner-refresh';
    const { result } = renderHook(() => useRoleManagement(practitionerId), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.roles.length).toBe(0);

    await act(async () => {
      await result.current.addRole({
        practitioner: { reference: `Practitioner/${practitionerId}` },
        organization: { reference: 'Organization/dept-cardiology' },
        roleCode: 'physician',
      });
    });

    await waitFor(() => {
      expect(result.current.roles.length).toBe(1);
    });
  });

  it('should handle empty practitioner ID', async () => {
    const { result } = renderHook(() => useRoleManagement(''), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.roles).toEqual([]);
  });

  it('should only fetch active roles', async () => {
    const practitionerId = 'test-practitioner-active';

    const activeRole: PractitionerRole = {
      resourceType: 'PractitionerRole',
      id: 'role-active',
      active: true,
      practitioner: { reference: `Practitioner/${practitionerId}` },
      organization: { reference: 'Organization/dept-cardiology' },
    };

    const inactiveRole: PractitionerRole = {
      resourceType: 'PractitionerRole',
      id: 'role-inactive',
      active: false,
      practitioner: { reference: `Practitioner/${practitionerId}` },
      organization: { reference: 'Organization/dept-emergency' },
    };

    await medplum.createResource(activeRole);
    await medplum.createResource(inactiveRole);

    const { result } = renderHook(() => useRoleManagement(practitionerId), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.roles.length).toBe(1);
    expect(result.current.roles[0].id).toBe('role-active');
  });

  it('should support manual refresh', async () => {
    const practitionerId = 'test-practitioner-manual-refresh';
    const { result } = renderHook(() => useRoleManagement(practitionerId), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.roles.length).toBe(0);

    // Add role directly via medplum (bypassing hook)
    await medplum.createResource<PractitionerRole>({
      resourceType: 'PractitionerRole',
      id: 'manual-role',
      active: true,
      practitioner: { reference: `Practitioner/${practitionerId}` },
      organization: { reference: 'Organization/dept-cardiology' },
    });

    // Manually refresh
    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.roles.length).toBe(1);
    });
  });
});
