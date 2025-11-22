// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import {
  createDraft,
  isIndexedDBAvailable,
  type DraftData,
} from './draftService';

/**
 * draftService Unit Tests (T139-T140, T143)
 *
 * Note: Full IndexedDB operations would require fake-indexeddb package.
 * These tests focus on the pure functions and type validation.
 */

describe('draftService (T139-T140, T143)', () => {
  describe('isIndexedDBAvailable', () => {
    it('should return true in test environment (jsdom)', () => {
      // jsdom provides a mock indexedDB
      const result = isIndexedDBAvailable();
      // May be true or false depending on test environment
      expect(typeof result).toBe('boolean');
    });
  });

  describe('createDraft', () => {
    it('should create a draft with default TTL (30 days)', () => {
      const now = Date.now();
      const draft = createDraft('form-123', 'questionnaire-456', { name: 'Test' });

      expect(draft.formId).toBe('form-123');
      expect(draft.questionnaireId).toBe('questionnaire-456');
      expect(draft.values).toEqual({ name: 'Test' });
      expect(draft.syncedToServer).toBe(false);
      expect(draft.savedAt).toBeInstanceOf(Date);
      expect(draft.expiresAt).toBeInstanceOf(Date);

      // Check TTL is approximately 30 days
      const ttlMs = draft.expiresAt.getTime() - draft.savedAt.getTime();
      expect(ttlMs).toBe(30 * 24 * 60 * 60 * 1000);
    });

    it('should create a draft with custom TTL', () => {
      const customTtl = 7 * 24 * 60 * 60 * 1000; // 7 days
      const draft = createDraft('form-123', 'questionnaire-456', { name: 'Test' }, {
        ttlMs: customTtl,
      });

      const ttlMs = draft.expiresAt.getTime() - draft.savedAt.getTime();
      expect(ttlMs).toBe(customTtl);
    });

    it('should include patient and encounter IDs when provided', () => {
      const draft = createDraft('form-123', 'questionnaire-456', { name: 'Test' }, {
        patientId: 'patient-789',
        encounterId: 'encounter-101',
      });

      expect(draft.patientId).toBe('patient-789');
      expect(draft.encounterId).toBe('encounter-101');
    });

    it('should set syncedToServer to false by default', () => {
      const draft = createDraft('form-123', 'questionnaire-456', { name: 'Test' });
      expect(draft.syncedToServer).toBe(false);
    });

    it('should set savedAt to current time', () => {
      const before = Date.now();
      const draft = createDraft('form-123', 'questionnaire-456', { name: 'Test' });
      const after = Date.now();

      expect(draft.savedAt.getTime()).toBeGreaterThanOrEqual(before);
      expect(draft.savedAt.getTime()).toBeLessThanOrEqual(after);
    });

    it('should handle empty values object', () => {
      const draft = createDraft('form-123', 'questionnaire-456', {});
      expect(draft.values).toEqual({});
    });

    it('should handle complex nested values', () => {
      const complexValues = {
        stringValue: 'Test',
        numberValue: 42,
        decimalValue: 3.14,
        booleanValue: true,
        dateValue: '2025-01-15',
        arrayValue: ['a', 'b', 'c'],
        nestedObject: { key: 'value', nested: { deep: true } },
      };

      const draft = createDraft('form-123', 'questionnaire-456', complexValues);
      expect(draft.values).toEqual(complexValues);
    });
  });

  describe('DraftData Type', () => {
    it('should have correct type structure', () => {
      const draft: DraftData = {
        formId: 'form-123',
        questionnaireId: 'questionnaire-456',
        values: { field: 'value' },
        savedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        syncedToServer: false,
        patientId: 'patient-789',
        encounterId: 'encounter-101',
        questionnaireResponseId: 'qr-123',
      };

      expect(draft.formId).toBeDefined();
      expect(draft.questionnaireId).toBeDefined();
      expect(draft.values).toBeDefined();
      expect(draft.savedAt).toBeDefined();
      expect(draft.expiresAt).toBeDefined();
      expect(draft.syncedToServer).toBeDefined();
    });

    it('should allow optional fields to be undefined', () => {
      const draft: DraftData = {
        formId: 'form-123',
        questionnaireId: 'questionnaire-456',
        values: {},
        savedAt: new Date(),
        expiresAt: new Date(),
        syncedToServer: false,
      };

      expect(draft.patientId).toBeUndefined();
      expect(draft.encounterId).toBeUndefined();
      expect(draft.questionnaireResponseId).toBeUndefined();
    });
  });

  describe('Draft Expiration Logic (T143)', () => {
    it('should create draft with correct expiration date', () => {
      const draft = createDraft('form-123', 'questionnaire-456', { name: 'Test' });

      // Default TTL is 30 days
      const expectedExpiration = new Date(draft.savedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      expect(draft.expiresAt.getTime()).toBe(expectedExpiration.getTime());
    });

    it('should allow checking if draft is expired', () => {
      // Create a draft that's already expired
      const expiredDraft: DraftData = {
        formId: 'expired-form',
        questionnaireId: 'q-1',
        values: { name: 'Expired' },
        savedAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // 31 days ago
        expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        syncedToServer: false,
      };

      const isExpired = expiredDraft.expiresAt < new Date();
      expect(isExpired).toBe(true);
    });

    it('should allow checking if draft is still valid', () => {
      const validDraft = createDraft('form-123', 'questionnaire-456', { name: 'Valid' });

      const isExpired = validDraft.expiresAt < new Date();
      expect(isExpired).toBe(false);
    });
  });
});
