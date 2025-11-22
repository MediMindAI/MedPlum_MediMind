// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { QuestionnaireResponse } from '@medplum/fhirtypes';

/**
 * Draft data interface for storing form drafts in IndexedDB
 */
export interface DraftData {
  /** Unique draft identifier (typically formId or generated UUID) */
  formId: string;
  /** Patient ID if form is associated with a patient */
  patientId?: string;
  /** Encounter ID if form is associated with an encounter */
  encounterId?: string;
  /** Form field values */
  values: Record<string, any>;
  /** When the draft was last saved locally */
  savedAt: Date;
  /** When the draft expires (30 days from savedAt by default) */
  expiresAt: Date;
  /** Whether the draft has been synced to the FHIR server */
  syncedToServer: boolean;
  /** The Questionnaire resource ID this draft is for */
  questionnaireId: string;
  /** QuestionnaireResponse ID if synced to server */
  questionnaireResponseId?: string;
}

/**
 * Serialized draft data for IndexedDB storage (dates as ISO strings)
 */
interface SerializedDraftData {
  formId: string;
  patientId?: string;
  encounterId?: string;
  values: Record<string, any>;
  savedAt: string;
  expiresAt: string;
  syncedToServer: boolean;
  questionnaireId: string;
  questionnaireResponseId?: string;
}

/** IndexedDB database name */
const DB_NAME = 'medimind-drafts';
/** IndexedDB database version */
const DB_VERSION = 1;
/** Object store name for drafts */
const DRAFTS_STORE = 'drafts';
/** Default draft TTL in milliseconds (30 days) */
const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Check if IndexedDB is available
 */
export function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Initialize the IndexedDB database for draft storage
 * Creates the database and object stores if they don't exist
 *
 * @returns Promise resolving to the IDBDatabase instance
 */
export function initDraftDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error?.message || 'Unknown error'}`));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create drafts object store with formId as key
      if (!db.objectStoreNames.contains(DRAFTS_STORE)) {
        const store = db.createObjectStore(DRAFTS_STORE, { keyPath: 'formId' });

        // Create indexes for querying
        store.createIndex('patientId', 'patientId', { unique: false });
        store.createIndex('questionnaireId', 'questionnaireId', { unique: false });
        store.createIndex('expiresAt', 'expiresAt', { unique: false });
        store.createIndex('syncedToServer', 'syncedToServer', { unique: false });
      }
    };
  });
}

/**
 * Serialize draft data for storage (convert dates to ISO strings)
 */
function serializeDraft(draft: DraftData): SerializedDraftData {
  return {
    ...draft,
    savedAt: draft.savedAt.toISOString(),
    expiresAt: draft.expiresAt.toISOString(),
  };
}

/**
 * Deserialize draft data from storage (convert ISO strings to dates)
 */
function deserializeDraft(data: SerializedDraftData): DraftData {
  return {
    ...data,
    savedAt: new Date(data.savedAt),
    expiresAt: new Date(data.expiresAt),
  };
}

/**
 * Save a draft to IndexedDB
 *
 * @param draft - The draft data to save
 * @returns Promise that resolves when the draft is saved
 */
export async function saveDraft(draft: DraftData): Promise<void> {
  const db = await initDraftDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DRAFTS_STORE], 'readwrite');
    const store = transaction.objectStore(DRAFTS_STORE);

    const serialized = serializeDraft(draft);
    const request = store.put(serialized);

    request.onerror = () => {
      reject(new Error(`Failed to save draft: ${request.error?.message || 'Unknown error'}`));
    };

    request.onsuccess = () => {
      resolve();
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get a draft by form ID
 *
 * @param formId - The form ID to look up
 * @returns Promise resolving to the draft data or null if not found
 */
export async function getDraft(formId: string): Promise<DraftData | null> {
  const db = await initDraftDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DRAFTS_STORE], 'readonly');
    const store = transaction.objectStore(DRAFTS_STORE);
    const request = store.get(formId);

    request.onerror = () => {
      reject(new Error(`Failed to get draft: ${request.error?.message || 'Unknown error'}`));
    };

    request.onsuccess = () => {
      if (request.result) {
        const draft = deserializeDraft(request.result as SerializedDraftData);
        // Check if draft has expired
        if (draft.expiresAt > new Date()) {
          resolve(draft);
        } else {
          // Draft has expired, delete it and return null
          deleteDraft(formId).catch(console.error);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get all drafts for a specific patient
 *
 * @param patientId - The patient ID to look up drafts for
 * @returns Promise resolving to an array of draft data
 */
export async function getDraftsByPatient(patientId: string): Promise<DraftData[]> {
  const db = await initDraftDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DRAFTS_STORE], 'readonly');
    const store = transaction.objectStore(DRAFTS_STORE);
    const index = store.index('patientId');
    const request = index.getAll(patientId);

    request.onerror = () => {
      reject(new Error(`Failed to get drafts by patient: ${request.error?.message || 'Unknown error'}`));
    };

    request.onsuccess = () => {
      const now = new Date();
      const drafts = (request.result as SerializedDraftData[])
        .map(deserializeDraft)
        .filter((draft) => draft.expiresAt > now);
      resolve(drafts);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get all drafts for a specific questionnaire
 *
 * @param questionnaireId - The questionnaire ID to look up drafts for
 * @returns Promise resolving to an array of draft data
 */
export async function getDraftsByQuestionnaire(questionnaireId: string): Promise<DraftData[]> {
  const db = await initDraftDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DRAFTS_STORE], 'readonly');
    const store = transaction.objectStore(DRAFTS_STORE);
    const index = store.index('questionnaireId');
    const request = index.getAll(questionnaireId);

    request.onerror = () => {
      reject(new Error(`Failed to get drafts by questionnaire: ${request.error?.message || 'Unknown error'}`));
    };

    request.onsuccess = () => {
      const now = new Date();
      const drafts = (request.result as SerializedDraftData[])
        .map(deserializeDraft)
        .filter((draft) => draft.expiresAt > now);
      resolve(drafts);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get all unsynced drafts
 *
 * @returns Promise resolving to an array of unsynced draft data
 */
export async function getUnsyncedDrafts(): Promise<DraftData[]> {
  const db = await initDraftDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DRAFTS_STORE], 'readonly');
    const store = transaction.objectStore(DRAFTS_STORE);
    const index = store.index('syncedToServer');
    const request = index.getAll(false);

    request.onerror = () => {
      reject(new Error(`Failed to get unsynced drafts: ${request.error?.message || 'Unknown error'}`));
    };

    request.onsuccess = () => {
      const now = new Date();
      const drafts = (request.result as SerializedDraftData[])
        .map(deserializeDraft)
        .filter((draft) => draft.expiresAt > now);
      resolve(drafts);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Delete a draft by form ID
 *
 * @param formId - The form ID to delete
 * @returns Promise that resolves when the draft is deleted
 */
export async function deleteDraft(formId: string): Promise<void> {
  const db = await initDraftDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DRAFTS_STORE], 'readwrite');
    const store = transaction.objectStore(DRAFTS_STORE);
    const request = store.delete(formId);

    request.onerror = () => {
      reject(new Error(`Failed to delete draft: ${request.error?.message || 'Unknown error'}`));
    };

    request.onsuccess = () => {
      resolve();
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Delete all expired drafts
 *
 * @returns Promise resolving to the number of deleted drafts
 */
export async function deleteExpiredDrafts(): Promise<number> {
  const db = await initDraftDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DRAFTS_STORE], 'readwrite');
    const store = transaction.objectStore(DRAFTS_STORE);
    const request = store.getAll();
    let deletedCount = 0;

    request.onerror = () => {
      reject(new Error(`Failed to get drafts for cleanup: ${request.error?.message || 'Unknown error'}`));
    };

    request.onsuccess = () => {
      const now = new Date();
      const drafts = request.result as SerializedDraftData[];

      const deletePromises = drafts
        .filter((draft) => new Date(draft.expiresAt) <= now)
        .map((draft) => {
          return new Promise<void>((res, rej) => {
            const deleteRequest = store.delete(draft.formId);
            deleteRequest.onsuccess = () => {
              deletedCount++;
              res();
            };
            deleteRequest.onerror = () => rej(deleteRequest.error);
          });
        });

      Promise.all(deletePromises)
        .then(() => resolve(deletedCount))
        .catch(reject);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Create a DraftData object with default expiration
 *
 * @param formId - The form ID
 * @param questionnaireId - The questionnaire ID
 * @param values - The form values
 * @param options - Additional options
 * @returns A new DraftData object
 */
export function createDraft(
  formId: string,
  questionnaireId: string,
  values: Record<string, any>,
  options?: {
    patientId?: string;
    encounterId?: string;
    ttlMs?: number;
  }
): DraftData {
  const now = new Date();
  const ttl = options?.ttlMs ?? DEFAULT_TTL_MS;

  return {
    formId,
    questionnaireId,
    values,
    patientId: options?.patientId,
    encounterId: options?.encounterId,
    savedAt: now,
    expiresAt: new Date(now.getTime() + ttl),
    syncedToServer: false,
  };
}

/**
 * Convert draft values to QuestionnaireResponse items
 */
function convertValuesToItems(values: Record<string, any>): QuestionnaireResponse['item'] {
  return Object.entries(values)
    .filter(([key]) => !key.startsWith('_')) // Skip metadata fields
    .map(([linkId, answer]) => {
      const item: QuestionnaireResponse['item'][0] = {
        linkId,
        answer: [],
      };

      // Convert answer based on type
      if (answer !== undefined && answer !== null && answer !== '') {
        if (typeof answer === 'boolean') {
          item.answer = [{ valueBoolean: answer }];
        } else if (typeof answer === 'number') {
          if (Number.isInteger(answer)) {
            item.answer = [{ valueInteger: answer }];
          } else {
            item.answer = [{ valueDecimal: answer }];
          }
        } else if (answer instanceof Date) {
          item.answer = [{ valueDateTime: answer.toISOString() }];
        } else if (typeof answer === 'string') {
          // Check if it's a date string
          if (/^\d{4}-\d{2}-\d{2}$/.test(answer)) {
            item.answer = [{ valueDate: answer }];
          } else {
            item.answer = [{ valueString: answer }];
          }
        }
      }

      return item;
    });
}

/**
 * Sync a single draft to the FHIR server as a QuestionnaireResponse
 *
 * @param medplum - The MedplumClient instance
 * @param draft - The draft to sync
 * @returns Promise resolving to the updated draft with questionnaireResponseId
 */
export async function syncDraftToServer(
  medplum: MedplumClient,
  draft: DraftData
): Promise<DraftData> {
  try {
    const questionnaireResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      status: 'in-progress',
      questionnaire: `Questionnaire/${draft.questionnaireId}`,
      authored: draft.savedAt.toISOString(),
      item: convertValuesToItems(draft.values),
    };

    // Add subject reference if patient ID is available
    if (draft.patientId) {
      questionnaireResponse.subject = { reference: `Patient/${draft.patientId}` };
    }

    // Add encounter reference if encounter ID is available
    if (draft.encounterId) {
      questionnaireResponse.encounter = { reference: `Encounter/${draft.encounterId}` };
    }

    let savedResponse: QuestionnaireResponse;

    // Update existing or create new
    if (draft.questionnaireResponseId) {
      questionnaireResponse.id = draft.questionnaireResponseId;
      savedResponse = await medplum.updateResource(questionnaireResponse);
    } else {
      savedResponse = await medplum.createResource(questionnaireResponse);
    }

    // Update local draft with sync status
    const updatedDraft: DraftData = {
      ...draft,
      syncedToServer: true,
      questionnaireResponseId: savedResponse.id,
    };

    // Save updated draft locally
    await saveDraft(updatedDraft);

    return updatedDraft;
  } catch (error) {
    console.error('Failed to sync draft to server:', error);
    throw error;
  }
}

/**
 * Sync all unsynced drafts to the FHIR server
 *
 * @param medplum - The MedplumClient instance
 * @returns Promise resolving to the number of successfully synced drafts
 */
export async function syncDraftsToServer(medplum: MedplumClient): Promise<number> {
  try {
    const unsyncedDrafts = await getUnsyncedDrafts();
    let syncedCount = 0;

    for (const draft of unsyncedDrafts) {
      try {
        await syncDraftToServer(medplum, draft);
        syncedCount++;
      } catch (error) {
        // Continue with other drafts even if one fails
        console.error(`Failed to sync draft ${draft.formId}:`, error);
      }
    }

    return syncedCount;
  } catch (error) {
    console.error('Failed to sync drafts to server:', error);
    return 0;
  }
}

/**
 * Clear all drafts from IndexedDB (for testing or cleanup)
 *
 * @returns Promise that resolves when all drafts are cleared
 */
export async function clearAllDrafts(): Promise<void> {
  const db = await initDraftDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DRAFTS_STORE], 'readwrite');
    const store = transaction.objectStore(DRAFTS_STORE);
    const request = store.clear();

    request.onerror = () => {
      reject(new Error(`Failed to clear drafts: ${request.error?.message || 'Unknown error'}`));
    };

    request.onsuccess = () => {
      resolve();
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get all drafts (for debugging/admin purposes)
 *
 * @returns Promise resolving to all drafts
 */
export async function getAllDrafts(): Promise<DraftData[]> {
  const db = await initDraftDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([DRAFTS_STORE], 'readonly');
    const store = transaction.objectStore(DRAFTS_STORE);
    const request = store.getAll();

    request.onerror = () => {
      reject(new Error(`Failed to get all drafts: ${request.error?.message || 'Unknown error'}`));
    };

    request.onsuccess = () => {
      const drafts = (request.result as SerializedDraftData[]).map(deserializeDraft);
      resolve(drafts);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}
