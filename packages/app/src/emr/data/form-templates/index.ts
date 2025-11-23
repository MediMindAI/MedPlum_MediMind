// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * System Form Templates
 *
 * Pre-defined form templates for the MediMind EMR system.
 * These templates are based on official Georgian healthcare documentation forms.
 */

// Form 100 (IV-100/a) - Health Status Certificate
export {
  form100Template,
  form100Fields,
  form100Metadata,
  FORM_100_ID,
  FORM_100_VERSION,
} from './form-100-template';

// Re-export all templates in a collection
export { SYSTEM_FORM_TEMPLATES } from '../../services/form100Service';
