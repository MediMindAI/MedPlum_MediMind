// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { MockClient } from '@medplum/mock';
import {
  hashSignature,
  verifySignature,
  saveSignature,
  createSignatureAuditEvent,
  getSignatureFromBinary,
  deleteSignature,
  processAndStoreSignature,
  captureSignature,
} from './signatureService';
import type { SignatureData } from '../types/form-renderer';

// Mock crypto.subtle for Node.js environment
const mockDigest = jest.fn();
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: mockDigest,
    },
  },
});

describe('signatureService', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
    mockDigest.mockReset();
  });

  describe('hashSignature', () => {
    it('computes SHA-256 hash of base64 data', async () => {
      const testData = 'SGVsbG8gV29ybGQ='; // "Hello World" in base64
      const mockHashBuffer = new Uint8Array([
        0x64, 0xec, 0x88, 0xca, 0x00, 0xb2, 0x68, 0xe5,
        0xba, 0x1a, 0x35, 0x67, 0x8a, 0x1b, 0x53, 0x16,
        0xd2, 0x12, 0xf4, 0xf3, 0x66, 0xb2, 0x47, 0x72,
        0x32, 0x53, 0x4a, 0x8a, 0xec, 0xa3, 0x7f, 0x3c,
      ]);

      mockDigest.mockResolvedValueOnce(mockHashBuffer.buffer);

      const hash = await hashSignature(testData);

      expect(mockDigest).toHaveBeenCalledWith('SHA-256', expect.any(Uint8Array));
      expect(hash).toBe('64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c');
    });

    it('handles empty data', async () => {
      const emptyHashBuffer = new Uint8Array(32);
      mockDigest.mockResolvedValueOnce(emptyHashBuffer.buffer);

      const hash = await hashSignature('');

      expect(hash).toHaveLength(64); // SHA-256 produces 64 hex characters
    });
  });

  describe('verifySignature', () => {
    it('returns true for matching hashes', async () => {
      const testData = 'SGVsbG8gV29ybGQ=';
      const expectedHash = '64ec88ca00b268e5ba1a35678a1b5316d212f4f366b2477232534a8aeca37f3c';

      const mockHashBuffer = new Uint8Array([
        0x64, 0xec, 0x88, 0xca, 0x00, 0xb2, 0x68, 0xe5,
        0xba, 0x1a, 0x35, 0x67, 0x8a, 0x1b, 0x53, 0x16,
        0xd2, 0x12, 0xf4, 0xf3, 0x66, 0xb2, 0x47, 0x72,
        0x32, 0x53, 0x4a, 0x8a, 0xec, 0xa3, 0x7f, 0x3c,
      ]);

      mockDigest.mockResolvedValueOnce(mockHashBuffer.buffer);

      const result = await verifySignature(testData, expectedHash);

      expect(result.isValid).toBe(true);
      expect(result.computedHash).toBe(expectedHash);
      expect(result.expectedHash).toBe(expectedHash);
      expect(result.verifiedAt).toBeDefined();
    });

    it('returns false for non-matching hashes', async () => {
      const testData = 'SGVsbG8gV29ybGQ=';
      const wrongHash = '0000000000000000000000000000000000000000000000000000000000000000';

      const mockHashBuffer = new Uint8Array([
        0x64, 0xec, 0x88, 0xca, 0x00, 0xb2, 0x68, 0xe5,
        0xba, 0x1a, 0x35, 0x67, 0x8a, 0x1b, 0x53, 0x16,
        0xd2, 0x12, 0xf4, 0xf3, 0x66, 0xb2, 0x47, 0x72,
        0x32, 0x53, 0x4a, 0x8a, 0xec, 0xa3, 0x7f, 0x3c,
      ]);

      mockDigest.mockResolvedValueOnce(mockHashBuffer.buffer);

      const result = await verifySignature(testData, wrongHash);

      expect(result.isValid).toBe(false);
      expect(result.computedHash).not.toBe(wrongHash);
    });
  });

  describe('saveSignature', () => {
    it('creates Binary resource with signature data', async () => {
      const testData = 'iVBORw0KGgoAAAANSUhEUg=='; // Mock PNG data
      const mockHashBuffer = new Uint8Array(32);
      mockDigest.mockResolvedValueOnce(mockHashBuffer.buffer);

      const result = await saveSignature(medplum, testData, 'image/png');

      expect(result.binaryId).toBeDefined();
      expect(result.binaryReference).toEqual({ reference: `Binary/${result.binaryId}` });
      expect(result.hash).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('uses default content type of image/png', async () => {
      const testData = 'iVBORw0KGgoAAAANSUhEUg==';
      const mockHashBuffer = new Uint8Array(32);
      mockDigest.mockResolvedValueOnce(mockHashBuffer.buffer);

      const createSpy = jest.spyOn(medplum, 'createResource');

      await saveSignature(medplum, testData);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceType: 'Binary',
          contentType: 'image/png',
          data: testData,
        })
      );
    });
  });

  describe('createSignatureAuditEvent', () => {
    it('creates audit event for signature-captured action', async () => {
      const result = await createSignatureAuditEvent(
        medplum,
        'signature-captured',
        'patient-123',
        {
          fieldId: 'consent-signature',
          signatureType: 'drawn',
          intent: 'consent',
        },
        'Practitioner/456'
      );

      expect(result.resourceType).toBe('AuditEvent');
      expect(result.action).toBe('C'); // Create
      expect(result.outcome).toBe('0'); // Success
      expect(result.agent?.[0]?.who?.reference).toBe('Practitioner/456');
    });

    it('creates audit event for signature-verified action', async () => {
      const result = await createSignatureAuditEvent(
        medplum,
        'signature-verified',
        'patient-123'
      );

      expect(result.resourceType).toBe('AuditEvent');
      expect(result.action).toBe('R'); // Read
    });

    it('creates audit event for signature-stored action', async () => {
      const result = await createSignatureAuditEvent(
        medplum,
        'signature-stored',
        'patient-123',
        {
          binaryResourceId: 'binary-789',
        }
      );

      expect(result.resourceType).toBe('AuditEvent');
      expect(result.action).toBe('C'); // Create
    });

    it('creates audit event for signature-deleted action', async () => {
      const result = await createSignatureAuditEvent(
        medplum,
        'signature-deleted',
        'patient-123'
      );

      expect(result.resourceType).toBe('AuditEvent');
      expect(result.action).toBe('D'); // Delete
    });

    it('includes patient reference in entity', async () => {
      const result = await createSignatureAuditEvent(
        medplum,
        'signature-captured',
        'patient-123'
      );

      const patientEntity = result.entity?.find(
        (e) => e.what?.reference === 'Patient/patient-123'
      );
      expect(patientEntity).toBeDefined();
      expect(patientEntity?.role?.code).toBe('1'); // Patient role
    });

    it('includes signature metadata in entity details', async () => {
      const result = await createSignatureAuditEvent(
        medplum,
        'signature-captured',
        'patient-123',
        {
          fieldId: 'consent-signature',
          signatureType: 'typed',
          intent: 'witness',
          hash: 'abc123',
        }
      );

      const signatureEntity = result.entity?.find(
        (e) => e.type?.code === '2' // System Object
      );
      expect(signatureEntity?.detail).toContainEqual({
        type: 'signature-type',
        valueString: 'typed',
      });
      expect(signatureEntity?.detail).toContainEqual({
        type: 'signature-intent',
        valueString: 'witness',
      });
      expect(signatureEntity?.detail).toContainEqual({
        type: 'signature-hash',
        valueString: 'abc123',
      });
    });
  });

  describe('getSignatureFromBinary', () => {
    it('retrieves signature data from Binary resource', async () => {
      // Create a Binary resource first
      const binary = await medplum.createResource({
        resourceType: 'Binary',
        contentType: 'image/png',
        data: 'testSignatureData',
      });

      const result = await getSignatureFromBinary(medplum, binary.id!);

      expect(result).toBe('testSignatureData');
    });

    it('returns undefined for non-existent Binary', async () => {
      const result = await getSignatureFromBinary(medplum, 'non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('deleteSignature', () => {
    it('deletes Binary resource and creates audit event', async () => {
      // Create a Binary resource first
      const binary = await medplum.createResource({
        resourceType: 'Binary',
        contentType: 'image/png',
        data: 'testSignatureData',
      });

      await deleteSignature(medplum, binary.id!, 'patient-123', 'Practitioner/456');

      // Verify Binary was deleted
      await expect(medplum.readResource('Binary', binary.id!)).rejects.toThrow();
    });
  });

  describe('processAndStoreSignature', () => {
    it('processes signature and returns updated data with hash and Binary reference', async () => {
      const mockHashBuffer = new Uint8Array(32);
      mockDigest.mockResolvedValue(mockHashBuffer.buffer);

      const signatureData: SignatureData = {
        fieldId: 'consent-signature',
        fieldLabel: 'Patient Consent',
        signatureType: 'drawn',
        signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==',
        timestamp: '2025-01-01T12:00:00Z',
        signedBy: { reference: 'Patient/123' },
        intent: 'consent',
      };

      const result = await processAndStoreSignature(
        medplum,
        signatureData,
        'patient-123',
        'Practitioner/456'
      );

      expect(result.hash).toBeDefined();
      expect(result.binaryResourceId).toBeDefined();
      expect(result.fieldId).toBe('consent-signature');
    });

    it('handles data URLs by extracting base64 portion', async () => {
      const mockHashBuffer = new Uint8Array(32);
      mockDigest.mockResolvedValue(mockHashBuffer.buffer);

      const signatureData: SignatureData = {
        fieldId: 'test',
        fieldLabel: 'Test',
        signatureType: 'drawn',
        signatureData: 'data:image/png;base64,actualBase64Data',
        timestamp: '2025-01-01T12:00:00Z',
        signedBy: { display: 'Test User' },
        intent: 'consent',
      };

      const createSpy = jest.spyOn(medplum, 'createResource');

      await processAndStoreSignature(medplum, signatureData);

      // Should have created Binary with just the base64 data (no data: prefix)
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceType: 'Binary',
          data: 'actualBase64Data',
        })
      );
    });
  });

  describe('captureSignature', () => {
    it('captures signature from canvas element', () => {
      // Create mock canvas
      const mockCanvas = document.createElement('canvas');
      mockCanvas.width = 500;
      mockCanvas.height = 200;
      const ctx = mockCanvas.getContext('2d');

      // Draw something to make it non-empty
      if (ctx) {
        ctx.fillStyle = 'black';
        ctx.fillRect(100, 100, 50, 50);
      }

      // Mock toDataURL
      mockCanvas.toDataURL = jest.fn().mockReturnValue('data:image/png;base64,mockData');

      const result = captureSignature(mockCanvas);

      expect(result.base64Data).toBe('mockData');
      expect(result.mimeType).toBe('image/png');
    });

    it('supports JPEG format', () => {
      const mockCanvas = document.createElement('canvas');
      mockCanvas.width = 500;
      mockCanvas.height = 200;
      mockCanvas.toDataURL = jest.fn().mockReturnValue('data:image/jpeg;base64,mockJpegData');

      const result = captureSignature(mockCanvas, 'image/jpeg');

      expect(result.mimeType).toBe('image/jpeg');
    });
  });
});
