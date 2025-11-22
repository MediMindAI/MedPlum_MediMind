// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderHook, act, waitFor } from '@testing-library/react';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';
import { MantineProvider } from '@mantine/core';
import { useAutoSave } from './useAutoSave';
import * as draftService from '../services/draftService';

// Mock the draft service
jest.mock('../services/draftService', () => ({
  saveDraft: jest.fn().mockResolvedValue(undefined),
  getDraft: jest.fn().mockResolvedValue(null),
  createDraft: jest.fn().mockImplementation((formId, questionnaireId, values, options) => ({
    formId,
    questionnaireId,
    values,
    patientId: options?.patientId,
    encounterId: options?.encounterId,
    savedAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    syncedToServer: false,
  })),
  syncDraftToServer: jest.fn().mockImplementation((_medplum, draft) =>
    Promise.resolve({ ...draft, syncedToServer: true })
  ),
  isIndexedDBAvailable: jest.fn().mockReturnValue(true),
}));

describe('useAutoSave (T137-T138)', () => {
  let medplum: MockClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider>
      <MedplumProvider medplum={medplum}>{children}</MedplumProvider>
    </MantineProvider>
  );

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    jest.clearAllMocks();
    // Reset mock implementations
    (draftService.saveDraft as jest.Mock).mockResolvedValue(undefined);
    (draftService.getDraft as jest.Mock).mockResolvedValue(null);
    (draftService.isIndexedDBAvailable as jest.Mock).mockReturnValue(true);
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(
        () =>
          useAutoSave({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
            data: {},
          }),
        { wrapper }
      );

      expect(result.current.isSaving).toBe(false);
      expect(result.current.isSyncing).toBe(false);
      expect(result.current.lastSaved).toBeNull();
      expect(result.current.lastSynced).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('should load existing draft on mount', async () => {
      const existingDraft = {
        formId: 'form-123',
        questionnaireId: 'questionnaire-456',
        values: { name: 'Test' },
        savedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        syncedToServer: false,
      };

      (draftService.getDraft as jest.Mock).mockResolvedValueOnce(existingDraft);

      const { result } = renderHook(
        () =>
          useAutoSave({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
            data: {},
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.currentDraft).toEqual(existingDraft);
        expect(result.current.lastSaved).toEqual(existingDraft.savedAt);
      });
    });

    it('should not initialize when disabled', () => {
      const { result } = renderHook(
        () =>
          useAutoSave({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
            data: {},
            enabled: false,
          }),
        { wrapper }
      );

      expect(result.current.isSaving).toBe(false);
      expect(draftService.getDraft).not.toHaveBeenCalled();
    });

    it('should handle IndexedDB unavailability gracefully', () => {
      (draftService.isIndexedDBAvailable as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(
        () =>
          useAutoSave({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
            data: {},
          }),
        { wrapper }
      );

      expect(result.current.isSaving).toBe(false);
      expect(draftService.saveDraft).not.toHaveBeenCalled();
    });
  });

  describe('Force Save', () => {
    it('should save immediately when forceSave is called', async () => {
      // Ensure data is different from initial empty state
      const testData = { name: 'Test', timestamp: Date.now() };

      const { result } = renderHook(
        () =>
          useAutoSave({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
            data: testData,
          }),
        { wrapper }
      );

      // Force save immediately (forceSync=true bypasses deepEqual check)
      await act(async () => {
        await result.current.forceSave();
      });

      expect(draftService.createDraft).toHaveBeenCalled();
      expect(draftService.saveDraft).toHaveBeenCalled();
    });
  });

  describe('Force Sync', () => {
    it('should sync immediately when forceSync is called', async () => {
      const existingDraft = {
        formId: 'form-123',
        questionnaireId: 'questionnaire-456',
        values: { name: 'Test' },
        savedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        syncedToServer: false,
      };

      // Set up mock to return the existing draft
      (draftService.getDraft as jest.Mock).mockResolvedValue(existingDraft);

      const testData = { name: 'Test', timestamp: Date.now() };

      const { result } = renderHook(
        () =>
          useAutoSave({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
            data: testData,
          }),
        { wrapper }
      );

      // Force sync (which also force saves first)
      await act(async () => {
        await result.current.forceSync();
      });

      // Force save should have created and saved draft
      expect(draftService.createDraft).toHaveBeenCalled();
      expect(draftService.saveDraft).toHaveBeenCalled();
      // Sync should have been called
      expect(draftService.syncDraftToServer).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle save errors gracefully', async () => {
      const onError = jest.fn();
      const saveError = new Error('Save failed');

      (draftService.saveDraft as jest.Mock).mockRejectedValueOnce(saveError);

      const testData = { name: 'Test', timestamp: Date.now() };

      const { result } = renderHook(
        () =>
          useAutoSave({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
            data: testData,
            onError,
          }),
        { wrapper }
      );

      // Force save to trigger error
      await act(async () => {
        await result.current.forceSave();
      });

      expect(result.current.error).toEqual(saveError);
      expect(onError).toHaveBeenCalledWith(saveError);
    });
  });

  describe('Callbacks', () => {
    it('should call onSave callback when draft is saved', async () => {
      const onSave = jest.fn();
      const testData = { name: 'Test', timestamp: Date.now() };

      const { result } = renderHook(
        () =>
          useAutoSave({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
            data: testData,
            onSave,
          }),
        { wrapper }
      );

      // Force save
      await act(async () => {
        await result.current.forceSave();
      });

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          formId: 'form-123',
          questionnaireId: 'questionnaire-456',
        })
      );
    });

    it('should call onSync callback when draft is synced', async () => {
      const onSync = jest.fn();

      const existingDraft = {
        formId: 'form-123',
        questionnaireId: 'questionnaire-456',
        values: { name: 'Test' },
        savedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        syncedToServer: false,
      };

      (draftService.getDraft as jest.Mock).mockResolvedValue(existingDraft);

      const testData = { name: 'Test', timestamp: Date.now() };

      const { result } = renderHook(
        () =>
          useAutoSave({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
            data: testData,
            onSync,
          }),
        { wrapper }
      );

      // Force sync
      await act(async () => {
        await result.current.forceSync();
      });

      expect(onSync).toHaveBeenCalledWith(
        expect.objectContaining({
          formId: 'form-123',
          syncedToServer: true,
        })
      );
    });
  });

  describe('Patient and Encounter Context', () => {
    it('should include patientId and encounterId in draft', async () => {
      const testData = { name: 'Test', timestamp: Date.now() };

      const { result } = renderHook(
        () =>
          useAutoSave({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
            data: testData,
            patientId: 'patient-789',
            encounterId: 'encounter-101',
          }),
        { wrapper }
      );

      // Force save to trigger draft creation
      await act(async () => {
        await result.current.forceSave();
      });

      expect(draftService.createDraft).toHaveBeenCalledWith(
        'form-123',
        'questionnaire-456',
        testData,
        expect.objectContaining({
          patientId: 'patient-789',
          encounterId: 'encounter-101',
        })
      );
    });
  });

  describe('Cleanup', () => {
    it('should clear timers on unmount', () => {
      const { unmount } = renderHook(
        () =>
          useAutoSave({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
            data: { name: 'Test' },
          }),
        { wrapper }
      );

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Return values', () => {
    it('should provide forceSave function', () => {
      const { result } = renderHook(
        () =>
          useAutoSave({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
            data: {},
          }),
        { wrapper }
      );

      expect(typeof result.current.forceSave).toBe('function');
    });

    it('should provide forceSync function', () => {
      const { result } = renderHook(
        () =>
          useAutoSave({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
            data: {},
          }),
        { wrapper }
      );

      expect(typeof result.current.forceSync).toBe('function');
    });
  });
});
