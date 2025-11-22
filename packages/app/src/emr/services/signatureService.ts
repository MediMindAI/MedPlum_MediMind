// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { Binary, AuditEvent, Reference, CodeableConcept } from '@medplum/fhirtypes';
import type { SignatureData, SignatureIntent } from '../types/form-renderer';

/**
 * Signature capture result
 */
export interface SignatureCaptureResult {
  base64Data: string;
  mimeType: string;
  width?: number;
  height?: number;
}

/**
 * Signature save result
 */
export interface SignatureSaveResult {
  binaryId: string;
  binaryReference: Reference;
  hash: string;
  timestamp: string;
}

/**
 * Signature verification result
 */
export interface SignatureVerificationResult {
  isValid: boolean;
  computedHash: string;
  expectedHash: string;
  verifiedAt: string;
}

/**
 * Audit event types for signatures
 */
export type SignatureAuditAction =
  | 'signature-captured'
  | 'signature-verified'
  | 'signature-stored'
  | 'signature-deleted';

/**
 * Capture signature from canvas element
 *
 * @param canvas - HTML Canvas element containing the signature
 * @param format - Image format (default: 'image/png')
 * @returns Base64 encoded signature data
 */
export function captureSignature(
  canvas: HTMLCanvasElement,
  format: 'image/png' | 'image/jpeg' = 'image/png'
): SignatureCaptureResult {
  // Get trimmed canvas to remove whitespace
  const trimmedCanvas = trimCanvas(canvas);

  // Convert to base64
  const dataUrl = trimmedCanvas.toDataURL(format);
  const base64Data = dataUrl.split(',')[1];

  return {
    base64Data,
    mimeType: format,
    width: trimmedCanvas.width,
    height: trimmedCanvas.height,
  };
}

/**
 * Trim whitespace from canvas
 */
function trimCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  // Find bounding box
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  // Add padding
  const padding = 10;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(width - 1, maxX + padding);
  maxY = Math.min(height - 1, maxY + padding);

  // Create trimmed canvas
  const trimmedWidth = maxX - minX + 1;
  const trimmedHeight = maxY - minY + 1;

  if (trimmedWidth <= 0 || trimmedHeight <= 0) {
    return canvas; // Return original if empty
  }

  const trimmedCanvas = document.createElement('canvas');
  trimmedCanvas.width = trimmedWidth;
  trimmedCanvas.height = trimmedHeight;

  const trimmedCtx = trimmedCanvas.getContext('2d');
  if (trimmedCtx) {
    trimmedCtx.drawImage(
      canvas,
      minX,
      minY,
      trimmedWidth,
      trimmedHeight,
      0,
      0,
      trimmedWidth,
      trimmedHeight
    );
  }

  return trimmedCanvas;
}

/**
 * Save signature as FHIR Binary resource
 *
 * @param medplum - Medplum client
 * @param base64Data - Base64 encoded signature data
 * @param contentType - MIME type (default: 'image/png')
 * @returns Binary resource reference and hash
 */
export async function saveSignature(
  medplum: MedplumClient,
  base64Data: string,
  contentType: string = 'image/png'
): Promise<SignatureSaveResult> {
  // Compute hash for integrity verification
  const hash = await hashSignature(base64Data);

  // Create Binary resource
  const binary: Binary = {
    resourceType: 'Binary',
    contentType,
    data: base64Data,
  };

  // Save to FHIR server
  const savedBinary = await medplum.createResource(binary);

  return {
    binaryId: savedBinary.id!,
    binaryReference: { reference: `Binary/${savedBinary.id}` },
    hash,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Compute SHA-256 hash of signature data
 *
 * @param base64Data - Base64 encoded signature data
 * @returns Hex-encoded SHA-256 hash
 */
export async function hashSignature(base64Data: string): Promise<string> {
  // Convert base64 to ArrayBuffer
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Compute SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Verify signature integrity by comparing hashes
 *
 * @param base64Data - Base64 encoded signature data
 * @param expectedHash - Expected SHA-256 hash
 * @returns Verification result
 */
export async function verifySignature(
  base64Data: string,
  expectedHash: string
): Promise<SignatureVerificationResult> {
  const computedHash = await hashSignature(base64Data);

  return {
    isValid: computedHash === expectedHash,
    computedHash,
    expectedHash,
    verifiedAt: new Date().toISOString(),
  };
}

/**
 * Create audit event for signature action
 *
 * @param medplum - Medplum client
 * @param action - Type of signature action
 * @param patientId - Patient ID (optional)
 * @param signatureData - Signature data for context
 * @param userId - User who performed the action
 * @returns Created AuditEvent
 */
export async function createSignatureAuditEvent(
  medplum: MedplumClient,
  action: SignatureAuditAction,
  patientId?: string,
  signatureData?: Partial<SignatureData>,
  userId?: string
): Promise<AuditEvent> {
  // Map action to AuditEvent outcome
  const outcomeMap: Record<SignatureAuditAction, '0' | '4' | '8' | '12'> = {
    'signature-captured': '0', // Success
    'signature-verified': '0',
    'signature-stored': '0',
    'signature-deleted': '0',
  };

  // Map action to type
  const typeMap: Record<SignatureAuditAction, CodeableConcept> = {
    'signature-captured': {
      coding: [
        {
          system: 'http://dicom.nema.org/resources/ontology/DCM',
          code: '110106',
          display: 'Export',
        },
      ],
      text: 'Signature Captured',
    },
    'signature-verified': {
      coding: [
        {
          system: 'http://dicom.nema.org/resources/ontology/DCM',
          code: '110114',
          display: 'User Authentication',
        },
      ],
      text: 'Signature Verified',
    },
    'signature-stored': {
      coding: [
        {
          system: 'http://dicom.nema.org/resources/ontology/DCM',
          code: '110107',
          display: 'Import',
        },
      ],
      text: 'Signature Stored',
    },
    'signature-deleted': {
      coding: [
        {
          system: 'http://dicom.nema.org/resources/ontology/DCM',
          code: '110105',
          display: 'DICOM Instances Accessed',
        },
      ],
      text: 'Signature Deleted',
    },
  };

  const auditEvent: AuditEvent = {
    resourceType: 'AuditEvent',
    type: typeMap[action],
    action: getAuditAction(action),
    recorded: new Date().toISOString(),
    outcome: outcomeMap[action],
    agent: [
      {
        who: userId ? { reference: userId } : undefined,
        requestor: true,
      },
    ],
    source: {
      observer: { display: 'MediMind EMR' },
    },
    entity: [],
  };

  // Add patient reference if provided
  if (patientId) {
    auditEvent.entity?.push({
      what: { reference: `Patient/${patientId}` },
      type: {
        system: 'http://terminology.hl7.org/CodeSystem/audit-entity-type',
        code: '1',
        display: 'Person',
      },
      role: {
        system: 'http://terminology.hl7.org/CodeSystem/object-role',
        code: '1',
        display: 'Patient',
      },
    });
  }

  // Add signature metadata
  if (signatureData) {
    auditEvent.entity?.push({
      what: signatureData.binaryResourceId
        ? { reference: `Binary/${signatureData.binaryResourceId}` }
        : undefined,
      type: {
        system: 'http://terminology.hl7.org/CodeSystem/audit-entity-type',
        code: '2',
        display: 'System Object',
      },
      role: {
        system: 'http://terminology.hl7.org/CodeSystem/object-role',
        code: '3',
        display: 'Report',
      },
      detail: [
        {
          type: 'signature-type',
          valueString: signatureData.signatureType,
        },
        {
          type: 'signature-intent',
          valueString: signatureData.intent,
        },
        {
          type: 'signature-field',
          valueString: signatureData.fieldId,
        },
        ...(signatureData.hash
          ? [{ type: 'signature-hash', valueString: signatureData.hash }]
          : []),
      ],
    });
  }

  return medplum.createResource(auditEvent);
}

/**
 * Map signature action to FHIR audit action code
 */
function getAuditAction(
  action: SignatureAuditAction
): 'C' | 'R' | 'U' | 'D' | 'E' {
  switch (action) {
    case 'signature-captured':
      return 'C'; // Create
    case 'signature-verified':
      return 'R'; // Read
    case 'signature-stored':
      return 'C'; // Create
    case 'signature-deleted':
      return 'D'; // Delete
    default:
      return 'E'; // Execute
  }
}

/**
 * Get signature from Binary resource
 *
 * @param medplum - Medplum client
 * @param binaryId - Binary resource ID
 * @returns Base64 encoded signature data
 */
export async function getSignatureFromBinary(
  medplum: MedplumClient,
  binaryId: string
): Promise<string | undefined> {
  try {
    const binary = await medplum.readResource('Binary', binaryId);
    return binary.data;
  } catch {
    return undefined;
  }
}

/**
 * Delete signature Binary resource
 *
 * @param medplum - Medplum client
 * @param binaryId - Binary resource ID
 * @param patientId - Patient ID for audit
 * @param userId - User performing deletion
 */
export async function deleteSignature(
  medplum: MedplumClient,
  binaryId: string,
  patientId?: string,
  userId?: string
): Promise<void> {
  // Create audit event before deletion
  await createSignatureAuditEvent(
    medplum,
    'signature-deleted',
    patientId,
    { binaryResourceId: binaryId },
    userId
  );

  // Delete Binary resource
  await medplum.deleteResource('Binary', binaryId);
}

/**
 * Process and store signature with full audit trail
 *
 * @param medplum - Medplum client
 * @param signatureData - Signature data to process
 * @param patientId - Patient ID
 * @param userId - User ID
 * @returns Updated signature data with hash and Binary reference
 */
export async function processAndStoreSignature(
  medplum: MedplumClient,
  signatureData: SignatureData,
  patientId?: string,
  userId?: string
): Promise<SignatureData> {
  // Extract base64 data from data URL if needed
  let base64Data = signatureData.signatureData;
  if (base64Data.startsWith('data:')) {
    base64Data = base64Data.split(',')[1];
  }

  // Save to Binary resource
  const saveResult = await saveSignature(medplum, base64Data);

  // Create audit event
  await createSignatureAuditEvent(
    medplum,
    'signature-stored',
    patientId,
    {
      ...signatureData,
      hash: saveResult.hash,
      binaryResourceId: saveResult.binaryId,
    },
    userId
  );

  // Return updated signature data
  return {
    ...signatureData,
    hash: saveResult.hash,
    binaryResourceId: saveResult.binaryId,
  };
}

export default {
  captureSignature,
  saveSignature,
  hashSignature,
  verifySignature,
  createSignatureAuditEvent,
  getSignatureFromBinary,
  deleteSignature,
  processAndStoreSignature,
};
