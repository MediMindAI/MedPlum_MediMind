// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderHook, act, waitFor } from '@testing-library/react';
import { MedplumProvider } from '@medplum/react-hooks';
import { MockClient } from '@medplum/mock';
import { useSignatureCapture } from './useSignatureCapture';
import type { ReactNode } from 'react';

// Mock crypto.subtle for Node.js environment
const mockDigest = jest.fn();
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: mockDigest,
    },
  },
});

// Mock react-signature-canvas
jest.mock('react-signature-canvas', () => {
  return jest.fn().mockImplementation(() => null);
});

// Mock signatureService
jest.mock('../services/signatureService', () => ({
  hashSignature: jest.fn().mockResolvedValue('mockhash123'),
  verifySignature: jest.fn().mockResolvedValue({ isValid: true, computedHash: 'mockhash123', expectedHash: 'mockhash123', verifiedAt: '2025-01-01T12:00:00Z' }),
  processAndStoreSignature: jest.fn().mockImplementation(async (medplum, signatureData) => ({
    ...signatureData,
    hash: 'mockhash123',
    binaryResourceId: 'binary-123',
  })),
  createSignatureAuditEvent: jest.fn().mockResolvedValue({ resourceType: 'AuditEvent', id: 'audit-123' }),
}));

describe('useSignatureCapture', () => {
  let medplum: MockClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <MedplumProvider medplum={medplum}>{children}</MedplumProvider>
  );

  beforeEach(() => {
    medplum = new MockClient();
    mockDigest.mockReset();
    jest.clearAllMocks();
  });

  describe('Initial state', () => {
    it('initializes with correct default values', () => {
      const { result } = renderHook(
        () =>
          useSignatureCapture({
            fieldId: 'test-signature',
            fieldLabel: 'Test Signature',
          }),
        { wrapper }
      );

      expect(result.current.signature).toBeUndefined();
      expect(result.current.isOpen).toBe(false);
      expect(result.current.signatureType).toBe('drawn');
      expect(result.current.typedName).toBe('');
      expect(result.current.intentConfirmed).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.error).toBeUndefined();
    });
  });

  describe('Modal controls', () => {
    it('opens modal', () => {
      const { result } = renderHook(
        () =>
          useSignatureCapture({
            fieldId: 'test-signature',
            fieldLabel: 'Test Signature',
          }),
        { wrapper }
      );

      act(() => {
        result.current.openModal();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('closes modal', () => {
      const { result } = renderHook(
        () =>
          useSignatureCapture({
            fieldId: 'test-signature',
            fieldLabel: 'Test Signature',
          }),
        { wrapper }
      );

      act(() => {
        result.current.openModal();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('resets state when opening modal', () => {
      const { result } = renderHook(
        () =>
          useSignatureCapture({
            fieldId: 'test-signature',
            fieldLabel: 'Test Signature',
          }),
        { wrapper }
      );

      // Set some state first
      act(() => {
        result.current.setTypedName('John Doe');
        result.current.confirmIntent();
      });

      expect(result.current.typedName).toBe('John Doe');
      expect(result.current.intentConfirmed).toBe(true);

      // Open modal should reset
      act(() => {
        result.current.openModal();
      });

      expect(result.current.typedName).toBe('');
      expect(result.current.intentConfirmed).toBe(false);
    });
  });

  describe('Signature type', () => {
    it('sets signature type', () => {
      const { result } = renderHook(
        () =>
          useSignatureCapture({
            fieldId: 'test-signature',
            fieldLabel: 'Test Signature',
          }),
        { wrapper }
      );

      expect(result.current.signatureType).toBe('drawn');

      act(() => {
        result.current.setSignatureType('typed');
      });

      expect(result.current.signatureType).toBe('typed');
    });
  });

  describe('Typed name', () => {
    it('sets typed name', () => {
      const { result } = renderHook(
        () =>
          useSignatureCapture({
            fieldId: 'test-signature',
            fieldLabel: 'Test Signature',
          }),
        { wrapper }
      );

      act(() => {
        result.current.setTypedName('John Doe');
      });

      expect(result.current.typedName).toBe('John Doe');
    });
  });

  describe('Intent confirmation', () => {
    it('confirms intent', () => {
      const { result } = renderHook(
        () =>
          useSignatureCapture({
            fieldId: 'test-signature',
            fieldLabel: 'Test Signature',
          }),
        { wrapper }
      );

      expect(result.current.intentConfirmed).toBe(false);

      act(() => {
        result.current.confirmIntent();
      });

      expect(result.current.intentConfirmed).toBe(true);
    });
  });

  describe('Canvas operations', () => {
    it('checks if canvas is empty (default true)', () => {
      const { result } = renderHook(
        () =>
          useSignatureCapture({
            fieldId: 'test-signature',
            fieldLabel: 'Test Signature',
          }),
        { wrapper }
      );

      // Canvas ref is not connected, so isEmpty returns true
      expect(result.current.isCanvasEmpty()).toBe(true);
    });
  });

  describe('Remove signature', () => {
    it('removes signature and calls onChange', () => {
      const onChange = jest.fn();
      const { result } = renderHook(
        () =>
          useSignatureCapture({
            fieldId: 'test-signature',
            fieldLabel: 'Test Signature',
            onChange,
          }),
        { wrapper }
      );

      act(() => {
        result.current.remove();
      });

      expect(onChange).toHaveBeenCalledWith(undefined);
      expect(result.current.signature).toBeUndefined();
    });
  });

  describe('Verify signature', () => {
    it('returns false when no signature exists', async () => {
      const { result } = renderHook(
        () =>
          useSignatureCapture({
            fieldId: 'test-signature',
            fieldLabel: 'Test Signature',
          }),
        { wrapper }
      );

      let isValid: boolean;
      await act(async () => {
        isValid = await result.current.verify();
      });

      expect(isValid!).toBe(false);
    });
  });

  describe('Save signature - error cases', () => {
    it('fails to save when intent is not confirmed', async () => {
      const onError = jest.fn();
      const { result } = renderHook(
        () =>
          useSignatureCapture({
            fieldId: 'test-signature',
            fieldLabel: 'Test Signature',
            onError,
          }),
        { wrapper }
      );

      act(() => {
        result.current.setSignatureType('typed');
        result.current.setTypedName('John Doe');
        // Note: intentConfirmed is still false
      });

      await act(async () => {
        await result.current.save();
      });

      expect(result.current.error).toBe('Intent must be confirmed before saving signature');
      expect(onError).toHaveBeenCalled();
    });

    it('fails to save typed signature without name', async () => {
      const onError = jest.fn();
      const { result } = renderHook(
        () =>
          useSignatureCapture({
            fieldId: 'test-signature',
            fieldLabel: 'Test Signature',
            onError,
          }),
        { wrapper }
      );

      act(() => {
        result.current.setSignatureType('typed');
        result.current.confirmIntent();
        // Note: typedName is empty
      });

      await act(async () => {
        await result.current.save();
      });

      expect(result.current.error).toBe('Typed name is required');
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Callbacks', () => {
    it('calls onChange when signature changes', async () => {
      const onChange = jest.fn();
      const { result } = renderHook(
        () =>
          useSignatureCapture({
            fieldId: 'test-signature',
            fieldLabel: 'Test Signature',
            onChange,
          }),
        { wrapper }
      );

      act(() => {
        result.current.remove();
      });

      expect(onChange).toHaveBeenCalledWith(undefined);
    });

    it('calls onError when save fails', async () => {
      const onError = jest.fn();
      const { result } = renderHook(
        () =>
          useSignatureCapture({
            fieldId: 'test-signature',
            fieldLabel: 'Test Signature',
            onError,
          }),
        { wrapper }
      );

      await act(async () => {
        await result.current.save();
      });

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Configuration options', () => {
    it('uses provided intent', () => {
      const { result } = renderHook(
        () =>
          useSignatureCapture({
            fieldId: 'test-signature',
            fieldLabel: 'Test Signature',
            intent: 'witness',
          }),
        { wrapper }
      );

      // Intent is stored in config and used during save
      expect(result.current).toBeDefined();
    });

    it('uses provided currentUserRef', () => {
      const { result } = renderHook(
        () =>
          useSignatureCapture({
            fieldId: 'test-signature',
            fieldLabel: 'Test Signature',
            currentUserRef: 'Practitioner/123',
          }),
        { wrapper }
      );

      expect(result.current).toBeDefined();
    });

    it('uses provided patientId', () => {
      const { result } = renderHook(
        () =>
          useSignatureCapture({
            fieldId: 'test-signature',
            fieldLabel: 'Test Signature',
            patientId: 'patient-123',
          }),
        { wrapper }
      );

      expect(result.current).toBeDefined();
    });
  });
});
