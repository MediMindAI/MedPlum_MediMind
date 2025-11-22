// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useCallback, useRef } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import type { SignatureData, SignatureType, SignatureIntent, SignatureCaptureState } from '../types/form-renderer';
import {
  hashSignature,
  saveSignature,
  verifySignature,
  processAndStoreSignature,
  createSignatureAuditEvent,
} from '../services/signatureService';
import type SignatureCanvas from 'react-signature-canvas';

/**
 * Hook configuration
 */
export interface UseSignatureCaptureConfig {
  /** Field ID */
  fieldId: string;
  /** Field label */
  fieldLabel: string;
  /** Current user reference */
  currentUserRef?: string;
  /** Patient ID for audit context */
  patientId?: string;
  /** Signature intent */
  intent?: SignatureIntent;
  /** Auto-store to Binary */
  autoStore?: boolean;
  /** Callback on signature change */
  onChange?: (signature: SignatureData | undefined) => void;
  /** Callback on signature capture */
  onCapture?: (signature: SignatureData) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Hook return value
 */
export interface UseSignatureCaptureReturn {
  /** Current signature data */
  signature: SignatureData | undefined;
  /** Modal open state */
  isOpen: boolean;
  /** Current signature type (drawn/typed) */
  signatureType: SignatureType;
  /** Typed name value */
  typedName: string;
  /** Whether intent is confirmed (E-SIGN compliance) */
  intentConfirmed: boolean;
  /** Whether signature is being saved */
  isSaving: boolean;
  /** Error message */
  error: string | undefined;
  /** Canvas ref for signature pad */
  canvasRef: React.RefObject<SignatureCanvas>;
  /** Open the signature modal */
  openModal: () => void;
  /** Close the signature modal */
  closeModal: () => void;
  /** Set signature type */
  setSignatureType: (type: SignatureType) => void;
  /** Set typed name */
  setTypedName: (name: string) => void;
  /** Confirm intent (E-SIGN compliance) */
  confirmIntent: () => void;
  /** Clear the signature canvas */
  clearCanvas: () => void;
  /** Check if canvas is empty */
  isCanvasEmpty: () => boolean;
  /** Save the signature */
  save: () => Promise<void>;
  /** Remove current signature */
  remove: () => void;
  /** Verify signature integrity */
  verify: () => Promise<boolean>;
}

/**
 * useSignatureCapture Hook
 *
 * Manages digital signature capture with:
 * - Canvas-based drawing (mouse/touch)
 * - Typed signature option
 * - E-SIGN Act compliant intent confirmation
 * - SHA-256 hash verification
 * - FHIR Binary storage
 * - Audit trail
 *
 * @example
 * ```tsx
 * const {
 *   signature,
 *   isOpen,
 *   openModal,
 *   save,
 *   canvasRef,
 * } = useSignatureCapture({
 *   fieldId: 'consent-signature',
 *   fieldLabel: 'Patient Consent',
 *   patientId: 'patient-123',
 *   intent: 'consent',
 *   autoStore: true,
 * });
 * ```
 */
export function useSignatureCapture(
  config: UseSignatureCaptureConfig
): UseSignatureCaptureReturn {
  const medplum = useMedplum();
  const canvasRef = useRef<SignatureCanvas>(null);

  const [signature, setSignature] = useState<SignatureData | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [signatureType, setSignatureType] = useState<SignatureType>('drawn');
  const [typedName, setTypedName] = useState('');
  const [intentConfirmed, setIntentConfirmed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const {
    fieldId,
    fieldLabel,
    currentUserRef,
    patientId,
    intent = 'consent',
    autoStore = false,
    onChange,
    onCapture,
    onError,
  } = config;

  /**
   * Open signature modal
   */
  const openModal = useCallback(() => {
    setIsOpen(true);
    setIntentConfirmed(false);
    setTypedName('');
    setError(undefined);
  }, []);

  /**
   * Close signature modal
   */
  const closeModal = useCallback(() => {
    setIsOpen(false);
    setError(undefined);
  }, []);

  /**
   * Confirm intent (E-SIGN compliance)
   */
  const confirmIntent = useCallback(() => {
    setIntentConfirmed(true);
  }, []);

  /**
   * Clear the canvas
   */
  const clearCanvas = useCallback(() => {
    canvasRef.current?.clear();
    setTypedName('');
  }, []);

  /**
   * Check if canvas is empty
   */
  const isCanvasEmpty = useCallback((): boolean => {
    return canvasRef.current?.isEmpty() ?? true;
  }, []);

  /**
   * Create typed signature image
   */
  const createTypedSignatureImage = useCallback((name: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 100;

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.font = '36px "Brush Script MT", cursive';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(name, canvas.width / 2, canvas.height / 2);

    const textWidth = ctx.measureText(name).width;
    ctx.beginPath();
    ctx.moveTo((canvas.width - textWidth) / 2, canvas.height / 2 + 20);
    ctx.lineTo((canvas.width + textWidth) / 2, canvas.height / 2 + 20);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();

    return canvas.toDataURL('image/png');
  }, []);

  /**
   * Save signature
   */
  const save = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(undefined);

      if (!intentConfirmed) {
        throw new Error('Intent must be confirmed before saving signature');
      }

      let signatureData: string | undefined;

      if (signatureType === 'drawn') {
        if (isCanvasEmpty()) {
          throw new Error('Signature canvas is empty');
        }
        signatureData = canvasRef.current?.getTrimmedCanvas().toDataURL('image/png');
      } else if (signatureType === 'typed') {
        if (!typedName.trim()) {
          throw new Error('Typed name is required');
        }
        signatureData = createTypedSignatureImage(typedName);
      }

      if (!signatureData) {
        throw new Error('Failed to capture signature');
      }

      // Create signature object
      let newSignature: SignatureData = {
        fieldId,
        fieldLabel,
        signatureType,
        signatureData,
        timestamp: new Date().toISOString(),
        signedBy: currentUserRef
          ? { reference: currentUserRef }
          : { display: typedName || 'Unknown' },
        intent,
      };

      // Store to Binary if auto-store is enabled
      if (autoStore) {
        newSignature = await processAndStoreSignature(
          medplum,
          newSignature,
          patientId,
          currentUserRef
        );
      } else {
        // Just compute hash without storing
        const base64Data = signatureData.split(',')[1];
        newSignature.hash = await hashSignature(base64Data);

        // Create audit event for capture
        await createSignatureAuditEvent(
          medplum,
          'signature-captured',
          patientId,
          newSignature,
          currentUserRef
        );
      }

      setSignature(newSignature);
      onChange?.(newSignature);
      onCapture?.(newSignature);
      closeModal();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save signature';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsSaving(false);
    }
  }, [
    intentConfirmed,
    signatureType,
    typedName,
    fieldId,
    fieldLabel,
    currentUserRef,
    intent,
    autoStore,
    patientId,
    medplum,
    isCanvasEmpty,
    createTypedSignatureImage,
    onChange,
    onCapture,
    onError,
    closeModal,
  ]);

  /**
   * Remove signature
   */
  const remove = useCallback(() => {
    setSignature(undefined);
    onChange?.(undefined);
  }, [onChange]);

  /**
   * Verify signature integrity
   */
  const verify = useCallback(async (): Promise<boolean> => {
    if (!signature?.signatureData || !signature?.hash) {
      return false;
    }

    try {
      const base64Data = signature.signatureData.startsWith('data:')
        ? signature.signatureData.split(',')[1]
        : signature.signatureData;

      const result = await verifySignature(base64Data, signature.hash);
      return result.isValid;
    } catch {
      return false;
    }
  }, [signature]);

  return {
    signature,
    isOpen,
    signatureType,
    typedName,
    intentConfirmed,
    isSaving,
    error,
    canvasRef,
    openModal,
    closeModal,
    setSignatureType,
    setTypedName,
    confirmIntent,
    clearCanvas,
    isCanvasEmpty,
    save,
    remove,
    verify,
  };
}

export default useSignatureCapture;
