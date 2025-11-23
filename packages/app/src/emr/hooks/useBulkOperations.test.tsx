// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderHook, act, waitFor } from '@testing-library/react';
import { MedplumProvider } from '@medplum/react-hooks';
import { MockClient } from '@medplum/mock';
import React from 'react';
import { useBulkOperations } from './useBulkOperations';

describe('useBulkOperations', () => {
  let medplum: MockClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MedplumProvider medplum={medplum}>{children}</MedplumProvider>
  );

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  describe('Selection state', () => {
    it('should initialize with empty selection', () => {
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      expect(result.current.selectedIds).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.progress).toBeNull();
      expect(result.current.result).toBeNull();
    });

    it('should select a single account', () => {
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      act(() => {
        result.current.selectAccount('account-1');
      });

      expect(result.current.selectedIds).toContain('account-1');
      expect(result.current.isSelected('account-1')).toBe(true);
    });

    it('should not duplicate when selecting same account', () => {
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      act(() => {
        result.current.selectAccount('account-1');
        result.current.selectAccount('account-1');
      });

      expect(result.current.selectedIds).toEqual(['account-1']);
    });

    it('should deselect a single account', () => {
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      act(() => {
        result.current.selectAccount('account-1');
        result.current.selectAccount('account-2');
      });

      act(() => {
        result.current.deselectAccount('account-1');
      });

      expect(result.current.selectedIds).toEqual(['account-2']);
      expect(result.current.isSelected('account-1')).toBe(false);
    });

    it('should select all accounts', () => {
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      act(() => {
        result.current.selectAll(['account-1', 'account-2', 'account-3']);
      });

      expect(result.current.selectedIds).toEqual(['account-1', 'account-2', 'account-3']);
    });

    it('should deselect all accounts', () => {
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      act(() => {
        result.current.selectAll(['account-1', 'account-2']);
      });

      act(() => {
        result.current.deselectAll();
      });

      expect(result.current.selectedIds).toEqual([]);
    });

    it('should clear selection and reset state', () => {
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      act(() => {
        result.current.selectAll(['account-1', 'account-2']);
      });

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedIds).toEqual([]);
      expect(result.current.result).toBeNull();
      expect(result.current.progress).toBeNull();
    });

    it('should toggle selection', () => {
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      // Toggle on
      act(() => {
        result.current.toggleSelection('account-1');
      });
      expect(result.current.isSelected('account-1')).toBe(true);

      // Toggle off
      act(() => {
        result.current.toggleSelection('account-1');
      });
      expect(result.current.isSelected('account-1')).toBe(false);
    });

    it('should check if account is selected', () => {
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      act(() => {
        result.current.selectAccount('account-1');
      });

      expect(result.current.isSelected('account-1')).toBe(true);
      expect(result.current.isSelected('account-2')).toBe(false);
    });
  });

  describe('Bulk operations', () => {
    beforeEach(async () => {
      // Create test practitioners
      await medplum.createResource({
        resourceType: 'Practitioner',
        id: 'pract-1',
        name: [{ given: ['John'], family: 'Doe' }],
        active: true,
      });
      await medplum.createResource({
        resourceType: 'Practitioner',
        id: 'pract-2',
        name: [{ given: ['Jane'], family: 'Smith' }],
        active: true,
      });
      await medplum.createResource({
        resourceType: 'Practitioner',
        id: 'pract-3',
        name: [{ given: ['Bob'], family: 'Johnson' }],
        active: false,
      });
    });

    it('should execute bulk deactivate', async () => {
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      act(() => {
        result.current.selectAll(['pract-1', 'pract-2']);
      });

      let operationResult: Awaited<ReturnType<typeof result.current.executeBulkDeactivate>> | undefined;
      await act(async () => {
        operationResult = await result.current.executeBulkDeactivate('Test deactivation');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(operationResult).toBeDefined();
      expect(operationResult?.operationType).toBe('deactivate');
    });

    it('should execute bulk activate', async () => {
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      act(() => {
        result.current.selectAll(['pract-3']);
      });

      let operationResult: Awaited<ReturnType<typeof result.current.executeBulkActivate>> | undefined;
      await act(async () => {
        operationResult = await result.current.executeBulkActivate('Test activation');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(operationResult).toBeDefined();
      expect(operationResult?.operationType).toBe('activate');
    });

    it('should execute bulk assign role', async () => {
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      act(() => {
        result.current.selectAll(['pract-1', 'pract-2']);
      });

      let operationResult: Awaited<ReturnType<typeof result.current.executeBulkAssignRole>> | undefined;
      await act(async () => {
        operationResult = await result.current.executeBulkAssignRole('physician');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(operationResult).toBeDefined();
      expect(operationResult?.operationType).toBe('assignRole');
    });

    it('should manage loading state', async () => {
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      act(() => {
        result.current.selectAll(['pract-1']);
      });

      // Initially loading should be false
      expect(result.current.loading).toBe(false);

      // Execute operation
      await act(async () => {
        await result.current.executeBulkDeactivate();
      });

      // After completion loading should be false
      expect(result.current.loading).toBe(false);
    });

    it('should clear result state', async () => {
      const { result } = renderHook(() => useBulkOperations(), { wrapper });

      act(() => {
        result.current.selectAll(['pract-1']);
      });

      await act(async () => {
        await result.current.executeBulkDeactivate();
      });

      // Result should be set after operation
      expect(result.current.result).toBeDefined();

      act(() => {
        result.current.clearResult();
      });

      expect(result.current.result).toBeNull();
      expect(result.current.progress).toBeNull();
    });
  });
});
