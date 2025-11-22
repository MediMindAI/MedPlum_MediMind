// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderHook, act, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { useAccountForm } from './useAccountForm';
import type { AccountFormValues } from '../types/account-management';

describe('useAccountForm (T023)', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider>{children}</MantineProvider>
  );

  beforeEach(() => {
    localStorage.setItem('emrLanguage', 'ka');
  });

  it('should initialize form with empty values', () => {
    const { result } = renderHook(() => useAccountForm(), { wrapper });

    expect(result.current.form.values).toEqual(
      expect.objectContaining({
        firstName: '',
        lastName: '',
        email: '',
        gender: 'unknown',
      })
    );
  });

  it('should initialize form with provided initial values', () => {
    const initialValues: AccountFormValues = {
      firstName: 'თენგიზი',
      lastName: 'ხოზვრია',
      email: 'tengizi@medimind.ge',
      gender: 'male',
      phoneNumber: '+995500050610',
      role: 'physician',
    };

    const { result } = renderHook(() => useAccountForm(initialValues), { wrapper });

    expect(result.current.form.values).toEqual(
      expect.objectContaining({
        firstName: 'თენგიზი',
        lastName: 'ხოზვრია',
        email: 'tengizi@medimind.ge',
        gender: 'male',
        phoneNumber: '+995500050610',
        role: 'physician',
      })
    );
  });

  it('should validate required fields', async () => {
    const { result } = renderHook(() => useAccountForm(), { wrapper });

    act(() => {
      result.current.form.validate();
    });

    await waitFor(() => {
      expect(result.current.form.errors).toEqual(
        expect.objectContaining({
          firstName: expect.any(String),
          lastName: expect.any(String),
          email: expect.any(String),
        })
      );
    });
  });

  it('should validate email format', async () => {
    const { result } = renderHook(() => useAccountForm(), { wrapper });

    act(() => {
      result.current.form.setFieldValue('email', 'invalid-email');
      result.current.form.validateField('email');
    });

    await waitFor(() => {
      expect(result.current.form.errors.email).toBeTruthy();
    });
  });

  it('should validate phone format (E.164)', async () => {
    const { result } = renderHook(() => useAccountForm(), { wrapper });

    act(() => {
      result.current.form.setFieldValue('phoneNumber', '500050610'); // Missing +995
      result.current.form.validateField('phoneNumber');
    });

    await waitFor(() => {
      expect(result.current.form.errors.phoneNumber).toBeTruthy();
    });
  });

  it('should accept valid Georgian phone number', async () => {
    const { result } = renderHook(() => useAccountForm(), { wrapper });

    act(() => {
      result.current.form.setFieldValue('phoneNumber', '+995500050610');
      result.current.form.validateField('phoneNumber');
    });

    await waitFor(() => {
      expect(result.current.form.errors.phoneNumber).toBeUndefined();
    });
  });

  it('should provide onSubmit handler', () => {
    const { result } = renderHook(() => useAccountForm(), { wrapper });

    expect(result.current.form.onSubmit).toBeInstanceOf(Function);
  });

  it('should reset form to initial values', () => {
    const initialValues: AccountFormValues = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@medimind.ge',
      gender: 'unknown',
    };

    const { result } = renderHook(() => useAccountForm(initialValues), { wrapper });

    act(() => {
      result.current.form.setFieldValue('firstName', 'Changed');
      result.current.form.reset();
    });

    expect(result.current.form.values.firstName).toBe('Test');
  });

  it('should track form dirty state', () => {
    const { result } = renderHook(() => useAccountForm(), { wrapper });

    expect(result.current.form.isDirty()).toBe(false);

    act(() => {
      result.current.form.setFieldValue('firstName', 'Changed');
    });

    expect(result.current.form.isDirty()).toBe(true);
  });
});
