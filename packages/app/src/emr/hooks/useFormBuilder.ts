// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @module useFormBuilder
 * @description React hook for managing form builder state with undo/redo functionality.
 *
 * Features:
 * - Immutable state updates using Immer
 * - Full undo/redo support with Immer patches
 * - Field management (add, update, delete, reorder)
 * - Form metadata (title, description, status)
 * - Save functionality (creates FHIR Questionnaire)
 *
 * ## Usage Example
 * ```typescript
 * import { useFormBuilder } from '@/emr/hooks/useFormBuilder';
 *
 * function FormBuilderComponent() {
 *   const {
 *     state,
 *     actions,
 *     canUndo,
 *     canRedo,
 *     undo,
 *     redo,
 *     save,
 *   } = useFormBuilder();
 *
 *   // Add a field
 *   actions.addField({
 *     id: 'field-1',
 *     linkId: 'patient-name',
 *     type: 'text',
 *     label: 'Patient Name',
 *     required: true,
 *   });
 *
 *   // Update form title
 *   actions.setTitle('New Consent Form');
 *
 *   // Undo last action
 *   if (canUndo) {
 *     undo();
 *   }
 *
 *   // Save to server
 *   const savedForm = await save(medplum);
 * }
 * ```
 *
 * ## State Management
 * - Uses useReducer with Immer for immutable updates
 * - History is tracked via Immer patches
 * - SELECT_FIELD action does not create undo history
 *
 * @see formBuilderService for FHIR Questionnaire operations
 */

import { useReducer, useCallback, useMemo } from 'react';
import { enablePatches, produceWithPatches, Patch } from 'immer';
import type { MedplumClient } from '@medplum/core';
import type { FieldConfig, FormTemplate } from '../types/form-builder';

// Enable Immer patches for undo/redo functionality
enablePatches();

/**
 * Form builder state interface
 */
export interface FormBuilderState {
  fields: FieldConfig[];
  selectedFieldId: string | null;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'retired';
}

/**
 * Form builder action types
 */
export type FormBuilderAction =
  | { type: 'ADD_FIELD'; field: FieldConfig }
  | { type: 'UPDATE_FIELD'; field: FieldConfig }
  | { type: 'DELETE_FIELD'; id: string }
  | { type: 'REORDER_FIELDS'; fromIndex: number; toIndex: number }
  | { type: 'SELECT_FIELD'; id: string | null }
  | { type: 'SET_TITLE'; title: string }
  | { type: 'SET_DESCRIPTION'; description: string }
  | { type: 'SET_STATUS'; status: 'draft' | 'active' | 'retired' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET'; state: FormBuilderState };

/**
 * Undo/Redo history state
 */
interface HistoryState {
  present: FormBuilderState;
  past: Array<{ state: FormBuilderState; patches: Patch[]; inversePatches: Patch[] }>;
  future: Array<{ state: FormBuilderState; patches: Patch[]; inversePatches: Patch[] }>;
}

/**
 * Initial form builder state
 */
const initialState: FormBuilderState = {
  fields: [],
  selectedFieldId: null,
  title: '',
  description: '',
  status: 'draft',
};

/**
 * Initial history state
 */
const initialHistoryState: HistoryState = {
  present: initialState,
  past: [],
  future: [],
};

/**
 * Form builder reducer with undo/redo support
 */
function formBuilderReducer(state: HistoryState, action: FormBuilderAction): HistoryState {
  switch (action.type) {
    case 'UNDO': {
      if (state.past.length === 0) {
        return state;
      }
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return {
        present: previous.state,
        past: newPast,
        future: [
          { state: state.present, patches: previous.inversePatches, inversePatches: previous.patches },
          ...state.future,
        ],
      };
    }

    case 'REDO': {
      if (state.future.length === 0) {
        return state;
      }
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        present: next.state,
        past: [
          ...state.past,
          { state: state.present, patches: next.inversePatches, inversePatches: next.patches },
        ],
        future: newFuture,
      };
    }

    case 'RESET': {
      return {
        present: action.state,
        past: [],
        future: [],
      };
    }

    default: {
      // For all other actions, use produceWithPatches to track changes
      const [nextState, patches, inversePatches] = produceWithPatches(state.present, (draft) => {
        switch (action.type) {
          case 'ADD_FIELD':
            draft.fields.push(action.field);
            draft.selectedFieldId = action.field.id;
            break;

          case 'UPDATE_FIELD': {
            const index = draft.fields.findIndex((f) => f.id === action.field.id);
            if (index !== -1) {
              draft.fields[index] = action.field;
            }
            break;
          }

          case 'DELETE_FIELD': {
            const index = draft.fields.findIndex((f) => f.id === action.id);
            if (index !== -1) {
              draft.fields.splice(index, 1);
              if (draft.selectedFieldId === action.id) {
                draft.selectedFieldId = null;
              }
            }
            break;
          }

          case 'REORDER_FIELDS': {
            const { fromIndex, toIndex } = action;
            if (fromIndex >= 0 && fromIndex < draft.fields.length && toIndex >= 0 && toIndex < draft.fields.length) {
              const [movedField] = draft.fields.splice(fromIndex, 1);
              draft.fields.splice(toIndex, 0, movedField);
            }
            break;
          }

          case 'SELECT_FIELD':
            draft.selectedFieldId = action.id;
            break;

          case 'SET_TITLE':
            draft.title = action.title;
            break;

          case 'SET_DESCRIPTION':
            draft.description = action.description;
            break;

          case 'SET_STATUS':
            draft.status = action.status;
            break;
        }
      });

      // Only record history for state-changing actions (not SELECT_FIELD)
      const shouldRecordHistory = action.type !== 'SELECT_FIELD';

      if (shouldRecordHistory && patches.length > 0) {
        return {
          present: nextState,
          past: [...state.past, { state: state.present, patches, inversePatches }],
          future: [], // Clear future on new action
        };
      }

      return {
        ...state,
        present: nextState,
      };
    }
  }
}

/**
 * Form builder actions interface
 */
export interface FormBuilderActions {
  addField: (field: FieldConfig) => void;
  updateField: (field: FieldConfig) => void;
  deleteField: (id: string) => void;
  reorderFields: (fromIndex: number, toIndex: number) => void;
  selectField: (id: string | null) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setStatus: (status: 'draft' | 'active' | 'retired') => void;
}

/**
 * Hook for managing form builder state with undo/redo functionality
 *
 * Features:
 * - Immutable state updates using Immer
 * - Undo/redo support using Immer patches
 * - Field management (add, update, delete, reorder)
 * - Form metadata (title, description, status)
 * - Save functionality (creates FHIR Questionnaire)
 *
 * @example
 * ```typescript
 * const { state, actions, canUndo, canRedo, undo, redo, save } = useFormBuilder();
 *
 * // Add a field
 * actions.addField({
 *   id: 'field-1',
 *   linkId: 'patient-name',
 *   type: 'text',
 *   label: 'Patient Name',
 *   required: true
 * });
 *
 * // Update form title
 * actions.setTitle('Consent Form');
 *
 * // Save form
 * await save(medplum);
 * ```
 */
export function useFormBuilder(initialFormState?: Partial<FormBuilderState>) {
  const [history, dispatch] = useReducer(
    formBuilderReducer,
    initialFormState
      ? {
          present: { ...initialState, ...initialFormState },
          past: [],
          future: [],
        }
      : initialHistoryState
  );

  // Extract current state
  const state = history.present;

  // Check if undo/redo is available
  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  // Action creators
  const actions: FormBuilderActions = useMemo(
    () => ({
      addField: (field: FieldConfig) => dispatch({ type: 'ADD_FIELD', field }),
      updateField: (field: FieldConfig) => dispatch({ type: 'UPDATE_FIELD', field }),
      deleteField: (id: string) => dispatch({ type: 'DELETE_FIELD', id }),
      reorderFields: (fromIndex: number, toIndex: number) =>
        dispatch({ type: 'REORDER_FIELDS', fromIndex, toIndex }),
      selectField: (id: string | null) => dispatch({ type: 'SELECT_FIELD', id }),
      setTitle: (title: string) => dispatch({ type: 'SET_TITLE', title }),
      setDescription: (description: string) => dispatch({ type: 'SET_DESCRIPTION', description }),
      setStatus: (status: 'draft' | 'active' | 'retired') => dispatch({ type: 'SET_STATUS', status }),
    }),
    []
  );

  // Undo/Redo functions
  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  // Reset function
  const reset = useCallback((newState?: Partial<FormBuilderState>) => {
    dispatch({ type: 'RESET', state: { ...initialState, ...newState } });
  }, []);

  // Save function - creates or updates FHIR Questionnaire resource
  const save = useCallback(
    async (medplum: MedplumClient, questionnaireId?: string): Promise<FormTemplate> => {
      // Validate required fields
      if (!state.title?.trim()) {
        throw new Error('Form title is required');
      }

      // Import the service dynamically to avoid circular dependencies
      const { createQuestionnaire, updateQuestionnaire } = await import('../services/formBuilderService');

      const formTemplate: FormTemplate = {
        id: questionnaireId,
        title: state.title,
        description: state.description,
        status: state.status,
        fields: state.fields,
        lastModified: new Date().toISOString(),
      };

      // Create or update based on whether we have an existing ID
      if (questionnaireId) {
        const updatedQuestionnaire = await updateQuestionnaire(medplum, questionnaireId, formTemplate);
        return {
          ...formTemplate,
          id: updatedQuestionnaire.id,
        };
      } else {
        const newQuestionnaire = await createQuestionnaire(medplum, formTemplate);
        return {
          ...formTemplate,
          id: newQuestionnaire.id,
        };
      }
    },
    [state]
  );

  // Return state with unfrozen copies of fields to allow form libraries to work
  // Immer freezes state which breaks Mantine's useForm
  const unfrozenState = useMemo(() => {
    return {
      ...state,
      fields: (state.fields || []).map(f => ({ ...f })),
    };
  }, [state]);

  return {
    state: unfrozenState,
    actions,
    canUndo,
    canRedo,
    undo,
    redo,
    reset,
    save,
  };
}
