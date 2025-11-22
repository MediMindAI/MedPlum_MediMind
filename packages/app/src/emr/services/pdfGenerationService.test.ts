// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { Questionnaire, Patient } from '@medplum/fhirtypes';
import {
  registerFonts,
  areFontsRegistered,
  resetFontRegistration,
  generatePDFFilename,
  downloadPDF,
  previewPDF,
  printPage,
  formatDateForDisplay,
  formatDateTimeForDisplay,
  getPatientPersonalId,
  PDF_THEME,
  PDF_LAYOUT,
} from './pdfGenerationService';

// Mock @react-pdf/renderer
jest.mock('@react-pdf/renderer', () => ({
  Font: {
    register: jest.fn(),
  },
}));

describe('pdfGenerationService', () => {
  beforeEach(() => {
    resetFontRegistration();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('registerFonts', () => {
    it('should register fonts successfully', () => {
      expect(areFontsRegistered()).toBe(false);
      registerFonts();
      expect(areFontsRegistered()).toBe(true);
    });

    it('should not register fonts twice', () => {
      const { Font } = require('@react-pdf/renderer');
      registerFonts();
      registerFonts();
      // Should only be called twice (once for Georgian, once for Helvetica)
      expect(Font.register).toHaveBeenCalledTimes(2);
    });
  });

  describe('generatePDFFilename', () => {
    it('should generate filename with form title and patient name', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'Patient Intake Form',
      };

      const patient: Patient = {
        resourceType: 'Patient',
        name: [
          {
            given: ['John'],
            family: 'Doe',
          },
        ],
      };

      const filename = generatePDFFilename(questionnaire, patient);

      expect(filename).toMatch(/^Patient_Intake_Form_John_Doe_\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should handle Georgian characters in form title', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'სამედიცინო ფორმა',
      };

      const patient: Patient = {
        resourceType: 'Patient',
        name: [
          {
            given: ['თენგიზი'],
            family: 'ხოზვრია',
          },
        ],
      };

      const filename = generatePDFFilename(questionnaire, patient);

      expect(filename).toMatch(/^სამედიცინო_ფორმა_თენგიზი_ხოზვრია_\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should handle missing questionnaire', () => {
      const patient: Patient = {
        resourceType: 'Patient',
        name: [{ given: ['John'], family: 'Doe' }],
      };

      const filename = generatePDFFilename(null, patient);

      expect(filename).toMatch(/^Form_John_Doe_\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should handle missing patient', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'Test Form',
      };

      const filename = generatePDFFilename(questionnaire, null);

      expect(filename).toMatch(/^Test_Form_Unknown_\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should handle patient without name', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'Test Form',
      };

      const patient: Patient = {
        resourceType: 'Patient',
      };

      const filename = generatePDFFilename(questionnaire, patient);

      expect(filename).toMatch(/^Test_Form_Unknown_\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should sanitize invalid filename characters', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'Test/Form:With<Invalid>Characters',
      };

      const filename = generatePDFFilename(questionnaire, null);

      expect(filename).not.toMatch(/[<>:"/\\|?*]/);
      expect(filename).toMatch(/^TestFormWithInvalidCharacters_Unknown_\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should handle multiple spaces', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'Test   Form   Title',
      };

      const filename = generatePDFFilename(questionnaire, null);

      expect(filename).not.toMatch(/__+/);
    });
  });

  describe('downloadPDF', () => {
    it('should create download link and trigger click', () => {
      const mockCreateObjectURL = jest.fn(() => 'blob:test-url');
      const mockRevokeObjectURL = jest.fn();
      const mockClick = jest.fn();

      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      const mockLink = {
        href: '',
        download: '',
        click: mockClick,
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as Node);
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as Node);

      const blob = new Blob(['test'], { type: 'application/pdf' });
      downloadPDF(blob, 'test.pdf');

      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
      expect(mockLink.href).toBe('blob:test-url');
      expect(mockLink.download).toBe('test.pdf');
      expect(mockClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });
  });

  describe('previewPDF', () => {
    it('should open PDF in new tab', () => {
      const mockWindow = {} as Window;
      const mockCreateObjectURL = jest.fn(() => 'blob:test-url');
      const mockOpen = jest.fn(() => mockWindow);

      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = jest.fn();
      jest.spyOn(window, 'open').mockImplementation(mockOpen);

      const blob = new Blob(['test'], { type: 'application/pdf' });
      const result = previewPDF(blob);

      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
      expect(mockOpen).toHaveBeenCalledWith('blob:test-url', '_blank');
      expect(result).toBe(mockWindow);
    });

    it('should return null if popup is blocked', () => {
      const mockCreateObjectURL = jest.fn(() => 'blob:test-url');
      const mockOpen = jest.fn(() => null);

      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = jest.fn();
      jest.spyOn(window, 'open').mockImplementation(mockOpen);

      const blob = new Blob(['test'], { type: 'application/pdf' });
      const result = previewPDF(blob);

      expect(result).toBeNull();
    });
  });

  describe('printPage', () => {
    it('should call window.print', () => {
      const mockPrint = jest.fn();
      jest.spyOn(window, 'print').mockImplementation(mockPrint);

      printPage();

      expect(mockPrint).toHaveBeenCalled();
    });
  });

  describe('formatDateForDisplay', () => {
    it('should format valid date string', () => {
      const result = formatDateForDisplay('2025-01-15');
      expect(result).toBeTruthy();
      expect(result).not.toBe('-');
    });

    it('should return dash for undefined', () => {
      const result = formatDateForDisplay(undefined);
      expect(result).toBe('-');
    });

    it('should return dash for empty string', () => {
      const result = formatDateForDisplay('');
      expect(result).toBe('-');
    });
  });

  describe('formatDateTimeForDisplay', () => {
    it('should format valid datetime string', () => {
      const result = formatDateTimeForDisplay('2025-01-15T10:30:00Z');
      expect(result).toBeTruthy();
      expect(result).not.toBe('-');
    });

    it('should return dash for undefined', () => {
      const result = formatDateTimeForDisplay(undefined);
      expect(result).toBe('-');
    });
  });

  describe('getPatientPersonalId', () => {
    it('should extract personal ID from patient', () => {
      const patient: Patient = {
        resourceType: 'Patient',
        identifier: [
          {
            system: 'http://medimind.ge/identifiers/personal-id',
            value: '12345678901',
          },
        ],
      };

      const result = getPatientPersonalId(patient);
      expect(result).toBe('12345678901');
    });

    it('should return null for patient without identifier', () => {
      const patient: Patient = {
        resourceType: 'Patient',
      };

      const result = getPatientPersonalId(patient);
      expect(result).toBeNull();
    });

    it('should return null for null patient', () => {
      const result = getPatientPersonalId(null);
      expect(result).toBeNull();
    });

    it('should return null for patient without personal-id identifier', () => {
      const patient: Patient = {
        resourceType: 'Patient',
        identifier: [
          {
            system: 'http://other-system.com',
            value: 'ABC123',
          },
        ],
      };

      const result = getPatientPersonalId(patient);
      expect(result).toBeNull();
    });
  });

  describe('PDF_THEME', () => {
    it('should have all required colors', () => {
      expect(PDF_THEME.primary).toBe('#1a365d');
      expect(PDF_THEME.secondary).toBe('#2b6cb0');
      expect(PDF_THEME.accent).toBe('#63b3ed');
      expect(PDF_THEME.text).toBe('#1f2937');
      expect(PDF_THEME.textSecondary).toBe('#6b7280');
      expect(PDF_THEME.border).toBe('#e5e7eb');
      expect(PDF_THEME.background).toBe('#f9fafb');
      expect(PDF_THEME.white).toBe('#ffffff');
    });
  });

  describe('PDF_LAYOUT', () => {
    it('should have all required layout constants', () => {
      expect(PDF_LAYOUT.pageSize).toBe('A4');
      expect(PDF_LAYOUT.marginTop).toBe(40);
      expect(PDF_LAYOUT.marginBottom).toBe(40);
      expect(PDF_LAYOUT.marginLeft).toBe(40);
      expect(PDF_LAYOUT.marginRight).toBe(40);
      expect(PDF_LAYOUT.headerHeight).toBe(60);
      expect(PDF_LAYOUT.footerHeight).toBe(30);
    });
  });
});
