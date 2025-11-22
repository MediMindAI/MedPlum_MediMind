// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { renderHook, waitFor, act } from '@testing-library/react';
import { MedplumProvider } from '@medplum/react-hooks';
import { MantineProvider } from '@mantine/core';
import { MockClient } from '@medplum/mock';
import type { ReactNode } from 'react';
import { useRoleForm } from './useRoleForm';
import { createRole } from '../services/roleService';
import type { RoleFormValues } from '../types/role-management';

describe('useRoleForm', () => {
  let medplum: MockClient;

  const wrapper = ({ children }: { children: ReactNode }): JSX.Element => (
    <MantineProvider>
      <MedplumProvider medplum={medplum}>{children}</MedplumProvider>
    </MantineProvider>
  );

  beforeEach(() => {
    medplum = new MockClient();
  });

  it('should initialize with default values', () => {
    const onSubmit = jest.fn();

    const { result } = renderHook(() => useRoleForm({ onSubmit }), { wrapper });

    expect(result.current.form.values.code).toBe('');
    expect(result.current.form.values.name).toBe('');
    expect(result.current.form.values.status).toBe('active');
    expect(result.current.form.values.permissions).toEqual([]);
  });

  it('should initialize with provided initial values', () => {
    const onSubmit = jest.fn();
    const initialValues: Partial<RoleFormValues> = {
      code: 'physician',
      name: 'Physician',
      description: 'Medical doctor',
      status: 'active',
      permissions: ['view-patient-demographics'],
    };

    const { result } = renderHook(() => useRoleForm({ initialValues, onSubmit }), { wrapper });

    expect(result.current.form.values.code).toBe('physician');
    expect(result.current.form.values.name).toBe('Physician');
    expect(result.current.form.values.description).toBe('Medical doctor');
    expect(result.current.form.values.permissions).toEqual(['view-patient-demographics']);
  });

  it('should validate required fields', async () => {
    const onSubmit = jest.fn();

    const { result } = renderHook(() => useRoleForm({ onSubmit }), { wrapper });

    act(() => {
      result.current.form.setFieldValue('code', '');
      result.current.form.setFieldValue('name', '');
      result.current.form.setFieldValue('permissions', []);
    });

    act(() => {
      result.current.form.validate();
    });

    expect(result.current.form.errors.code).toBeTruthy();
    expect(result.current.form.errors.name).toBeTruthy();
    expect(result.current.form.errors.permissions).toBeTruthy();
  });

  it('should validate role code format', () => {
    const onSubmit = jest.fn();

    const { result } = renderHook(() => useRoleForm({ onSubmit }), { wrapper });

    // Invalid code (uppercase)
    act(() => {
      result.current.form.setFieldValue('code', 'INVALID-CODE');
      result.current.form.validateField('code');
    });

    expect(result.current.form.errors.code).toBeTruthy();

    // Valid code (lowercase with hyphens)
    act(() => {
      result.current.form.setFieldValue('code', 'valid-code');
      result.current.form.validateField('code');
    });

    expect(result.current.form.errors.code).toBeFalsy();
  });

  it('should detect duplicate role names', async () => {
    const onSubmit = jest.fn();

    // Create an existing role
    await createRole(medplum, {
      code: 'existing-role',
      name: 'Existing Role',
      status: 'active',
      permissions: ['view-patient-list'],
    });

    const { result } = renderHook(() => useRoleForm({ onSubmit }), { wrapper });

    act(() => {
      result.current.form.setFieldValue('code', 'new-code');
      result.current.form.setFieldValue('name', 'Existing Role'); // Duplicate name
      result.current.form.setFieldValue('permissions', ['view-patient-list']);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(result.current.form.errors.name).toBe('A role with this name already exists');
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should call onSubmit with form values', async () => {
    const onSubmit = jest.fn();

    const { result } = renderHook(() => useRoleForm({ onSubmit }), { wrapper });

    act(() => {
      result.current.form.setFieldValue('code', 'nurse');
      result.current.form.setFieldValue('name', 'Nurse');
      result.current.form.setFieldValue('description', 'Registered nurse');
      result.current.form.setFieldValue('status', 'active');
      result.current.form.setFieldValue('permissions', ['view-patient-list']);
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        code: 'nurse',
        name: 'Nurse',
        description: 'Registered nurse',
        status: 'active',
        permissions: ['view-patient-list'],
      });
    });
  });
});
