// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  Patient,
} from '@medplum/fhirtypes';
import {
  PDF_THEME,
  PDF_LAYOUT,
  formatDateForDisplay,
  formatDateTimeForDisplay,
  getPatientPersonalId,
  registerFonts,
} from '../../services/pdfGenerationService';

// Register fonts on module load
registerFonts();

/**
 * PDF Styles using @react-pdf/renderer StyleSheet
 */
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: PDF_LAYOUT.marginTop,
    paddingBottom: PDF_LAYOUT.marginBottom,
    paddingLeft: PDF_LAYOUT.marginLeft,
    paddingRight: PDF_LAYOUT.marginRight,
    backgroundColor: PDF_THEME.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: PDF_THEME.primary,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    textAlign: 'right',
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PDF_THEME.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: PDF_THEME.textSecondary,
  },
  patientCard: {
    backgroundColor: PDF_THEME.background,
    borderWidth: 1,
    borderColor: PDF_THEME.border,
    borderRadius: 4,
    padding: 10,
    marginBottom: 15,
  },
  patientRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  patientLabel: {
    width: 100,
    fontSize: 9,
    color: PDF_THEME.textSecondary,
  },
  patientValue: {
    flex: 1,
    fontSize: 10,
    color: PDF_THEME.text,
  },
  metadataSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: PDF_THEME.border,
  },
  metadataItem: {
    flex: 1,
  },
  metadataLabel: {
    fontSize: 8,
    color: PDF_THEME.textSecondary,
    marginBottom: 2,
  },
  metadataValue: {
    fontSize: 10,
    color: PDF_THEME.text,
  },
  statusBadge: {
    fontSize: 9,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    color: PDF_THEME.white,
    backgroundColor: PDF_THEME.secondary,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: PDF_THEME.primary,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: PDF_THEME.accent,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: PDF_THEME.border,
    borderBottomStyle: 'dotted',
  },
  fieldLabel: {
    width: '40%',
    fontSize: 10,
    color: PDF_THEME.text,
    fontWeight: 'bold',
  },
  fieldValue: {
    width: '60%',
    fontSize: 10,
    color: PDF_THEME.text,
    textAlign: 'right',
  },
  emptyValue: {
    color: PDF_THEME.textSecondary,
    fontStyle: 'italic',
  },
  groupContainer: {
    marginLeft: 10,
    marginTop: 5,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: PDF_THEME.accent,
  },
  signatureSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: PDF_THEME.border,
  },
  signatureImage: {
    width: 200,
    height: 80,
    marginTop: 5,
    borderWidth: 1,
    borderColor: PDF_THEME.border,
  },
  signatureLabel: {
    fontSize: 9,
    color: PDF_THEME.textSecondary,
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: PDF_LAYOUT.marginLeft,
    right: PDF_LAYOUT.marginRight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: PDF_THEME.border,
  },
  footerText: {
    fontSize: 8,
    color: PDF_THEME.textSecondary,
  },
  pageNumber: {
    fontSize: 8,
    color: PDF_THEME.textSecondary,
  },
  noData: {
    textAlign: 'center',
    color: PDF_THEME.textSecondary,
    fontSize: 10,
    marginTop: 20,
  },
});

/**
 * Props for FormPDFDocument component
 */
export interface FormPDFDocumentProps {
  questionnaire: Questionnaire | null;
  response: QuestionnaireResponse;
  patient?: Patient | null;
  logoUrl?: string;
  organizationName?: string;
}

/**
 * FormPDFDocument Component
 *
 * Renders a FHIR QuestionnaireResponse as a PDF document.
 * Features:
 * - Header with optional logo and organization name
 * - Patient information section
 * - Form metadata (status, dates)
 * - Form fields rendered in sections
 * - Signature images embedded
 * - Footer with page numbers
 * - A4 page size with proper margins
 * - Georgian font support
 */
export function FormPDFDocument({
  questionnaire,
  response,
  patient,
  logoUrl,
  organizationName = 'MediMind EMR',
}: FormPDFDocumentProps): JSX.Element {
  const formTitle = questionnaire?.title || 'Form Response';
  const generatedDate = new Date().toLocaleDateString();

  return (
    <Document
      title={formTitle}
      author={organizationName}
      subject={`Form Response - ${response.id || 'Unknown'}`}
      creator="MediMind EMR PDF Generator"
    >
      <Page size={PDF_LAYOUT.pageSize} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoUrl && <Image src={logoUrl} style={styles.logo} />}
            <Text style={styles.title}>{formTitle}</Text>
            <Text style={styles.subtitle}>{organizationName}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.subtitle}>Generated: {generatedDate}</Text>
            {response.id && (
              <Text style={styles.subtitle}>ID: {response.id}</Text>
            )}
          </View>
        </View>

        {/* Patient Info */}
        {patient && (
          <View style={styles.patientCard}>
            <PatientInfoRow label="Patient Name" value={getPatientDisplayName(patient)} />
            <PatientInfoRow label="Personal ID" value={getPatientPersonalId(patient) || '-'} />
            <PatientInfoRow label="Birth Date" value={formatDateForDisplay(patient.birthDate)} />
            <PatientInfoRow label="Gender" value={patient.gender || '-'} />
          </View>
        )}

        {/* Form Metadata */}
        <View style={styles.metadataSection}>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Submitted</Text>
            <Text style={styles.metadataValue}>
              {formatDateTimeForDisplay(response.authored)}
            </Text>
          </View>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Status</Text>
            <Text style={styles.statusBadge}>{response.status || 'Unknown'}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Text style={styles.metadataLabel}>Response ID</Text>
            <Text style={styles.metadataValue}>{response.id || '-'}</Text>
          </View>
        </View>

        {/* Form Content */}
        <View style={styles.section}>
          {response.item && response.item.length > 0 ? (
            response.item.map((item, index) => (
              <ResponseItemRenderer
                key={item.linkId || index}
                item={item}
                questionnaireItem={findQuestionnaireItem(questionnaire, item.linkId)}
                level={0}
              />
            ))
          ) : (
            <Text style={styles.noData}>No responses recorded</Text>
          )}
        </View>

        {/* Footer with page numbers */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{organizationName}</Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

/**
 * Patient info row component
 */
interface PatientInfoRowProps {
  label: string;
  value: string;
}

function PatientInfoRow({ label, value }: PatientInfoRowProps): JSX.Element {
  return (
    <View style={styles.patientRow}>
      <Text style={styles.patientLabel}>{label}:</Text>
      <Text style={styles.patientValue}>{value}</Text>
    </View>
  );
}

/**
 * Response item renderer component
 */
interface ResponseItemRendererProps {
  item: QuestionnaireResponseItem;
  questionnaireItem?: QuestionnaireItem;
  level: number;
}

function ResponseItemRenderer({
  item,
  questionnaireItem,
  level,
}: ResponseItemRendererProps): JSX.Element | null {
  const label = questionnaireItem?.text || item.text || item.linkId;
  const isGroup =
    questionnaireItem?.type === 'group' ||
    (!item.answer && item.item && item.item.length > 0);

  // Render group
  if (isGroup) {
    return (
      <View style={level > 0 ? styles.groupContainer : styles.section}>
        <Text style={styles.sectionTitle}>{label}</Text>
        {item.item?.map((nestedItem, index) => (
          <ResponseItemRenderer
            key={nestedItem.linkId || index}
            item={nestedItem}
            questionnaireItem={findNestedQuestionnaireItem(
              questionnaireItem,
              nestedItem.linkId
            )}
            level={level + 1}
          />
        ))}
      </View>
    );
  }

  // Check if this is a signature field
  const isSignature = questionnaireItem?.type === 'attachment' &&
    (questionnaireItem?.code?.[0]?.code === 'signature' ||
     questionnaireItem?.linkId?.toLowerCase().includes('signature'));

  // Render signature with image
  if (isSignature && item.answer?.[0]?.valueAttachment?.data) {
    return (
      <View style={styles.signatureSection}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Image
          src={`data:image/png;base64,${item.answer[0].valueAttachment.data}`}
          style={styles.signatureImage}
        />
        <Text style={styles.signatureLabel}>
          Signed: {formatDateTimeForDisplay(item.answer[0].valueAttachment.creation)}
        </Text>
      </View>
    );
  }

  // Render regular field
  const answerValue = extractAnswerDisplay(item.answer);

  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={answerValue ? styles.fieldValue : [styles.fieldValue, styles.emptyValue]}>
        {answerValue || '-'}
      </Text>
    </View>
  );
}

/**
 * Helper functions
 */

function getPatientDisplayName(patient?: Patient | null): string {
  if (!patient?.name?.[0]) {
    return 'Unknown Patient';
  }

  const name = patient.name[0];
  return [
    ...(name.given || []),
    name.family || '',
  ].filter(Boolean).join(' ');
}

function findQuestionnaireItem(
  questionnaire: Questionnaire | null,
  linkId: string
): QuestionnaireItem | undefined {
  if (!questionnaire?.item) {
    return undefined;
  }

  for (const item of questionnaire.item) {
    if (item.linkId === linkId) {
      return item;
    }
    if (item.item) {
      const nested = findNestedQuestionnaireItem(item, linkId);
      if (nested) {
        return nested;
      }
    }
  }
  return undefined;
}

function findNestedQuestionnaireItem(
  parentItem: QuestionnaireItem | undefined,
  linkId: string
): QuestionnaireItem | undefined {
  if (!parentItem?.item) {
    return undefined;
  }

  for (const item of parentItem.item) {
    if (item.linkId === linkId) {
      return item;
    }
    if (item.item) {
      const nested = findNestedQuestionnaireItem(item, linkId);
      if (nested) {
        return nested;
      }
    }
  }
  return undefined;
}

function extractAnswerDisplay(answers?: QuestionnaireResponseItemAnswer[]): string {
  if (!answers || answers.length === 0) {
    return '';
  }

  return answers
    .map((answer) => {
      if (answer.valueBoolean !== undefined) {
        return answer.valueBoolean ? 'Yes' : 'No';
      }
      if (answer.valueInteger !== undefined) {
        return String(answer.valueInteger);
      }
      if (answer.valueDecimal !== undefined) {
        return String(answer.valueDecimal);
      }
      if (answer.valueDate !== undefined) {
        return formatDateForDisplay(answer.valueDate);
      }
      if (answer.valueDateTime !== undefined) {
        return formatDateTimeForDisplay(answer.valueDateTime);
      }
      if (answer.valueTime !== undefined) {
        return answer.valueTime;
      }
      if (answer.valueString !== undefined) {
        return answer.valueString;
      }
      if (answer.valueCoding !== undefined) {
        return answer.valueCoding.display || answer.valueCoding.code || '';
      }
      if (answer.valueAttachment !== undefined) {
        return answer.valueAttachment.title || '[Attachment]';
      }
      if (answer.valueReference !== undefined) {
        return answer.valueReference.display || answer.valueReference.reference || '';
      }
      return '';
    })
    .filter(Boolean)
    .join(', ');
}

export default FormPDFDocument;
