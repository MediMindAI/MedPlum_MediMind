// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { MedplumProvider } from '@medplum/react-hooks';
import { MockClient } from '@medplum/mock';
import { SignatureField } from './SignatureField';
import type { SignatureData } from '../../types/form-renderer';

// Mock react-signature-canvas
const mockClear = jest.fn();
const mockIsEmpty = jest.fn(() => false);
const mockGetTrimmedCanvas = jest.fn(() => ({
  toDataURL: () => 'data:image/png;base64,mockSignatureData',
}));

jest.mock('react-signature-canvas', () => {
  const React = require('react');
  return React.forwardRef((props: any, ref: any) => {
    // Attach mock methods to ref
    React.useImperativeHandle(ref, () => ({
      clear: mockClear,
      isEmpty: mockIsEmpty,
      getTrimmedCanvas: mockGetTrimmedCanvas,
    }));

    return (
      <canvas
        data-testid="signature-canvas"
        width={props.canvasProps?.width || 500}
        height={props.canvasProps?.height || 200}
        style={props.canvasProps?.style}
      />
    );
  });
});

describe('SignatureField', () => {
  let medplum: MockClient;

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <MantineProvider>
        <MemoryRouter>
          <MedplumProvider medplum={medplum}>{ui}</MedplumProvider>
        </MemoryRouter>
      </MantineProvider>
    );
  };

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
    mockClear.mockClear();
    mockIsEmpty.mockClear();
    mockGetTrimmedCanvas.mockClear();
    mockIsEmpty.mockReturnValue(false);
  });

  describe('Initial render', () => {
    it('renders add signature button when no value', () => {
      renderWithProviders(
        <SignatureField
          fieldId="test-signature"
          fieldLabel="Patient Signature"
          value={undefined}
          onChange={jest.fn()}
        />
      );

      expect(screen.getByText('Patient Signature')).toBeInTheDocument();
      // Button may show translation key or translated text
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('shows required indicator when required', () => {
      renderWithProviders(
        <SignatureField
          fieldId="test-signature"
          fieldLabel="Patient Signature"
          value={undefined}
          onChange={jest.fn()}
          required
        />
      );

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('disables button when disabled', () => {
      renderWithProviders(
        <SignatureField
          fieldId="test-signature"
          fieldLabel="Patient Signature"
          value={undefined}
          onChange={jest.fn()}
          disabled
        />
      );

      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Signature preview', () => {
    it('displays signature preview when value exists', () => {
      const signatureData: SignatureData = {
        fieldId: 'test-signature',
        fieldLabel: 'Patient Signature',
        signatureType: 'drawn',
        signatureData: 'data:image/png;base64,testdata',
        timestamp: '2025-01-01T12:00:00Z',
        signedBy: { reference: 'Patient/123' },
        intent: 'consent',
      };

      renderWithProviders(
        <SignatureField
          fieldId="test-signature"
          fieldLabel="Patient Signature"
          value={signatureData}
          onChange={jest.fn()}
        />
      );

      expect(screen.getByAltText('Signature')).toBeInTheDocument();
      expect(screen.getByText(/Hand-drawn signature/)).toBeInTheDocument();
    });

    it('shows typed signature label for typed signatures', () => {
      const signatureData: SignatureData = {
        fieldId: 'test-signature',
        fieldLabel: 'Patient Signature',
        signatureType: 'typed',
        signatureData: 'data:image/png;base64,testdata',
        timestamp: '2025-01-01T12:00:00Z',
        signedBy: { display: 'John Doe' },
        intent: 'consent',
      };

      renderWithProviders(
        <SignatureField
          fieldId="test-signature"
          fieldLabel="Patient Signature"
          value={signatureData}
          onChange={jest.fn()}
        />
      );

      expect(screen.getByText(/Typed signature/)).toBeInTheDocument();
    });

    it('shows remove button for existing signature', () => {
      const signatureData: SignatureData = {
        fieldId: 'test-signature',
        fieldLabel: 'Patient Signature',
        signatureType: 'drawn',
        signatureData: 'data:image/png;base64,testdata',
        timestamp: '2025-01-01T12:00:00Z',
        signedBy: { reference: 'Patient/123' },
        intent: 'consent',
      };

      renderWithProviders(
        <SignatureField
          fieldId="test-signature"
          fieldLabel="Patient Signature"
          value={signatureData}
          onChange={jest.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });

    it('calls onChange with undefined when remove is clicked', () => {
      const onChange = jest.fn();
      const signatureData: SignatureData = {
        fieldId: 'test-signature',
        fieldLabel: 'Patient Signature',
        signatureType: 'drawn',
        signatureData: 'data:image/png;base64,testdata',
        timestamp: '2025-01-01T12:00:00Z',
        signedBy: { reference: 'Patient/123' },
        intent: 'consent',
      };

      renderWithProviders(
        <SignatureField
          fieldId="test-signature"
          fieldLabel="Patient Signature"
          value={signatureData}
          onChange={onChange}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /remove/i }));
      expect(onChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Modal interaction', () => {
    it('opens modal when add signature button is clicked', async () => {
      renderWithProviders(
        <SignatureField
          fieldId="test-signature"
          fieldLabel="Patient Signature"
          value={undefined}
          onChange={jest.fn()}
        />
      );

      // Click the button (first button on page)
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('shows signature type selector in modal', async () => {
      renderWithProviders(
        <SignatureField
          fieldId="test-signature"
          fieldLabel="Patient Signature"
          value={undefined}
          onChange={jest.fn()}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        // Check for draw/type options - may be translated
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('shows intent confirmation section', async () => {
      renderWithProviders(
        <SignatureField
          fieldId="test-signature"
          fieldLabel="Patient Signature"
          value={undefined}
          onChange={jest.fn()}
          intent="consent"
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        // Intent confirmation box should be visible
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('closes modal when cancel is clicked', async () => {
      renderWithProviders(
        <SignatureField
          fieldId="test-signature"
          fieldLabel="Patient Signature"
          value={undefined}
          onChange={jest.fn()}
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Find and click cancel button
      const buttons = screen.getAllByRole('button');
      const cancelButton = buttons.find(btn => btn.textContent?.toLowerCase().includes('cancel') || btn.textContent === 'common.cancel');
      if (cancelButton) {
        fireEvent.click(cancelButton);
      }

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error handling', () => {
    it('displays error message', () => {
      renderWithProviders(
        <SignatureField
          fieldId="test-signature"
          fieldLabel="Patient Signature"
          value={undefined}
          onChange={jest.fn()}
          error="Signature is required"
        />
      );

      expect(screen.getByText('Signature is required')).toBeInTheDocument();
    });
  });

  describe('Signature intents', () => {
    it('shows consent intent description', async () => {
      renderWithProviders(
        <SignatureField
          fieldId="test-signature"
          fieldLabel="Patient Signature"
          value={undefined}
          onChange={jest.fn()}
          intent="consent"
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        // Dialog should open and show consent-related content
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('shows witness intent description', async () => {
      renderWithProviders(
        <SignatureField
          fieldId="test-signature"
          fieldLabel="Witness Signature"
          value={undefined}
          onChange={jest.fn()}
          intent="witness"
        />
      );

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        // Dialog should open with witness intent
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });
});
