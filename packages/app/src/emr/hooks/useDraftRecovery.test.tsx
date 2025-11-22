// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderHook, act, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { useDraftRecovery } from './useDraftRecovery';
import * as draftService from '../services/draftService';

// Mock the draft service
jest.mock('../services/draftService', () => ({
  getDraft: jest.fn().mockResolvedValue(null),
  getDraftsByQuestionnaire: jest.fn().mockResolvedValue([]),
  deleteDraft: jest.fn().mockResolvedValue(undefined),
  isIndexedDBAvailable: jest.fn().mockReturnValue(true),
}));

// Helper to clear all mocks
const resetMocks = () => {
  (draftService.getDraft as jest.Mock).mockResolvedValue(null);
  (draftService.getDraftsByQuestionnaire as jest.Mock).mockResolvedValue([]);
  (draftService.deleteDraft as jest.Mock).mockResolvedValue(undefined);
  (draftService.isIndexedDBAvailable as jest.Mock).mockReturnValue(true);
};

describe('useDraftRecovery (T144-T145)', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider>{children}</MantineProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    resetMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', async () => {
      const { result } = renderHook(
        () =>
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
          }),
        { wrapper }
      );

      // Wait for initial load to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasDraft).toBe(false);
      expect(result.current.draft).toBeNull();
      expect(result.current.showRecoveryModal).toBe(false);
      expect(result.current.relatedDrafts).toEqual([]);
    });

    it('should auto-check for drafts on mount by default', async () => {
      renderHook(
        () =>
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(draftService.getDraft).toHaveBeenCalledWith('form-123');
        expect(draftService.getDraftsByQuestionnaire).toHaveBeenCalledWith('questionnaire-456');
      });
    });

    it('should not auto-check when autoCheck is false', () => {
      renderHook(
        () =>
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
            autoCheck: false,
          }),
        { wrapper }
      );

      expect(draftService.getDraft).not.toHaveBeenCalled();
      expect(draftService.getDraftsByQuestionnaire).not.toHaveBeenCalled();
    });

    it('should handle IndexedDB unavailability gracefully', () => {
      (draftService.isIndexedDBAvailable as jest.Mock).mockReturnValue(false);

      const { result } = renderHook(
        () =>
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
          }),
        { wrapper }
      );

      expect(result.current.hasDraft).toBe(false);
      expect(draftService.getDraft).not.toHaveBeenCalled();
    });
  });

  describe('Draft Detection', () => {
    it('should detect existing draft and show recovery modal', async () => {
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
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.hasDraft).toBe(true);
        expect(result.current.draft).toEqual(existingDraft);
        expect(result.current.showRecoveryModal).toBe(true);
      });
    });

    it('should not show modal when no draft exists', async () => {
      (draftService.getDraft as jest.Mock).mockResolvedValueOnce(null);

      const { result } = renderHook(
        () =>
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.hasDraft).toBe(false);
        expect(result.current.showRecoveryModal).toBe(false);
      });
    });

    it('should load related drafts for the same questionnaire', async () => {
      const relatedDrafts = [
        {
          formId: 'form-1',
          questionnaireId: 'questionnaire-456',
          values: { name: 'Draft 1' },
          savedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          syncedToServer: false,
        },
        {
          formId: 'form-2',
          questionnaireId: 'questionnaire-456',
          values: { name: 'Draft 2' },
          savedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          syncedToServer: true,
        },
      ];

      (draftService.getDraftsByQuestionnaire as jest.Mock).mockResolvedValueOnce(relatedDrafts);

      const { result } = renderHook(
        () =>
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.relatedDrafts).toHaveLength(2);
      });
    });

    it('should filter related drafts by patient ID when provided', async () => {
      const relatedDrafts = [
        {
          formId: 'form-1',
          questionnaireId: 'questionnaire-456',
          values: { name: 'Draft 1' },
          patientId: 'patient-1',
          savedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          syncedToServer: false,
        },
        {
          formId: 'form-2',
          questionnaireId: 'questionnaire-456',
          values: { name: 'Draft 2' },
          patientId: 'patient-2',
          savedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          syncedToServer: false,
        },
      ];

      (draftService.getDraftsByQuestionnaire as jest.Mock).mockResolvedValueOnce(relatedDrafts);

      const { result } = renderHook(
        () =>
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
            patientId: 'patient-1',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.relatedDrafts).toHaveLength(1);
        expect(result.current.relatedDrafts[0].formId).toBe('form-1');
      });
    });
  });

  describe('recoverDraft', () => {
    it('should call onRecover callback with draft data', async () => {
      const existingDraft = {
        formId: 'form-123',
        questionnaireId: 'questionnaire-456',
        values: { name: 'Test', age: 25 },
        savedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        syncedToServer: false,
      };

      (draftService.getDraft as jest.Mock).mockResolvedValueOnce(existingDraft);

      const onRecover = jest.fn();

      const { result } = renderHook(
        () =>
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
            onRecover,
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.hasDraft).toBe(true);
      });

      act(() => {
        result.current.recoverDraft();
      });

      expect(onRecover).toHaveBeenCalledWith(existingDraft);
      expect(result.current.showRecoveryModal).toBe(false);
    });

    it('should not call onRecover when no draft exists', () => {
      const onRecover = jest.fn();

      const { result } = renderHook(
        () =>
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
            onRecover,
          }),
        { wrapper }
      );

      act(() => {
        result.current.recoverDraft();
      });

      expect(onRecover).not.toHaveBeenCalled();
    });
  });

  describe('discardDraft', () => {
    it('should delete draft and call onDiscard callback', async () => {
      const existingDraft = {
        formId: 'form-123',
        questionnaireId: 'questionnaire-456',
        values: { name: 'Test' },
        savedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        syncedToServer: false,
      };

      (draftService.getDraft as jest.Mock).mockResolvedValueOnce(existingDraft);
      (draftService.getDraftsByQuestionnaire as jest.Mock).mockResolvedValue([]);

      const onDiscard = jest.fn();

      const { result } = renderHook(
        () =>
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
            onDiscard,
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.hasDraft).toBe(true);
      });

      await act(async () => {
        await result.current.discardDraft();
      });

      expect(draftService.deleteDraft).toHaveBeenCalledWith('form-123');
      expect(onDiscard).toHaveBeenCalledWith('form-123');
      expect(result.current.hasDraft).toBe(false);
      expect(result.current.showRecoveryModal).toBe(false);
    });

    it('should refresh related drafts after discard', async () => {
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
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.hasDraft).toBe(true);
      });

      (draftService.getDraftsByQuestionnaire as jest.Mock).mockClear();

      await act(async () => {
        await result.current.discardDraft();
      });

      expect(draftService.getDraftsByQuestionnaire).toHaveBeenCalledWith('questionnaire-456');
    });
  });

  describe('Modal Control', () => {
    it('should allow manual control of recovery modal', async () => {
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
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.showRecoveryModal).toBe(true);
      });

      act(() => {
        result.current.setShowRecoveryModal(false);
      });

      expect(result.current.showRecoveryModal).toBe(false);

      act(() => {
        result.current.setShowRecoveryModal(true);
      });

      expect(result.current.showRecoveryModal).toBe(true);
    });
  });

  describe('formatLastSaved', () => {
    it('should format "just now" for recent saves', () => {
      const { result } = renderHook(
        () =>
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
          }),
        { wrapper }
      );

      const now = new Date();
      expect(result.current.formatLastSaved(now)).toBe('just now');
    });

    it('should format minutes ago', () => {
      const { result } = renderHook(
        () =>
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
          }),
        { wrapper }
      );

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(result.current.formatLastSaved(fiveMinutesAgo)).toBe('5 minutes ago');

      const oneMinuteAgo = new Date(Date.now() - 1 * 60 * 1000);
      expect(result.current.formatLastSaved(oneMinuteAgo)).toBe('1 minute ago');
    });

    it('should format hours ago', () => {
      const { result } = renderHook(
        () =>
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
          }),
        { wrapper }
      );

      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      expect(result.current.formatLastSaved(threeHoursAgo)).toBe('3 hours ago');

      const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
      expect(result.current.formatLastSaved(oneHourAgo)).toBe('1 hour ago');
    });

    it('should format days ago', () => {
      const { result } = renderHook(
        () =>
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
          }),
        { wrapper }
      );

      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      expect(result.current.formatLastSaved(twoDaysAgo)).toBe('2 days ago');

      const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      expect(result.current.formatLastSaved(oneDayAgo)).toBe('1 day ago');
    });

    it('should format as full date for older saves', () => {
      const { result } = renderHook(
        () =>
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
          }),
        { wrapper }
      );

      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const formatted = result.current.formatLastSaved(tenDaysAgo);

      // Should contain year, month, and day
      expect(formatted).toMatch(/\d{4}/); // Year
    });
  });

  describe('refreshDrafts', () => {
    it('should reload draft data from storage', async () => {
      const { result } = renderHook(
        () =>
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(draftService.getDraft).toHaveBeenCalledTimes(1);
      });

      (draftService.getDraft as jest.Mock).mockClear();
      (draftService.getDraftsByQuestionnaire as jest.Mock).mockClear();

      await act(async () => {
        await result.current.refreshDrafts();
      });

      expect(draftService.getDraft).toHaveBeenCalledWith('form-123');
      expect(draftService.getDraftsByQuestionnaire).toHaveBeenCalledWith('questionnaire-456');
    });
  });

  describe('Error Handling', () => {
    it('should handle getDraft errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      (draftService.getDraft as jest.Mock).mockRejectedValue(new Error('DB error'));

      const { result } = renderHook(
        () =>
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
          }),
        { wrapper }
      );

      // Wait for load to complete (will fail)
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      // Error should have been logged
      expect(consoleSpy).toHaveBeenCalled();
      expect(result.current.hasDraft).toBe(false);

      consoleSpy.mockRestore();
    });

    it('should handle deleteDraft errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const existingDraft = {
        formId: 'form-123',
        questionnaireId: 'questionnaire-456',
        values: { name: 'Test' },
        savedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        syncedToServer: false,
      };

      (draftService.getDraft as jest.Mock).mockResolvedValue(existingDraft);
      (draftService.deleteDraft as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(
        () =>
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
          }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.hasDraft).toBe(true);
      });

      await act(async () => {
        await result.current.discardDraft();
      });

      // Error should have been logged
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Loading State', () => {
    it('should provide isLoading state', async () => {
      const { result } = renderHook(
        () =>
          useDraftRecovery({
            formId: 'form-123',
            questionnaireId: 'questionnaire-456',
          }),
        { wrapper }
      );

      // Wait for initial load to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should have completed loading
      expect(result.current.isLoading).toBe(false);
    });
  });
});
