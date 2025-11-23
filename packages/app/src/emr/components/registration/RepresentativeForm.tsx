// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from '../../hooks/useTranslation';
import { validateGeorgianPersonalId } from '../../services/validators';
import { RelationshipSelect } from './RelationshipSelect';
import { InternationalPhoneInput } from './InternationalPhoneInput';
import { CollapsibleSection } from './CollapsibleSection';
import { EMRTextInput } from '../shared/EMRFormFields';

export interface RepresentativeFormValues {
  firstName: string;
  lastName: string;
  fatherName?: string;
  personalId?: string;
  phoneNumber: string;
  relationship: string;
}

interface RepresentativeFormProps {
  onSubmit: (values: RepresentativeFormValues) => void;
  initialValues?: Partial<RepresentativeFormValues>;
}

/**
 * Representative/Guardian Form Component
 *
 * Form for entering guardian/representative information for minor patients.
 * Supports multilingual (Georgian/English/Russian) interface.
 *
 * Features:
 * - Required: firstName, lastName, phoneNumber, relationship
 * - Optional: fatherName, personalId
 * - Georgian Personal ID validation (only if provided)
 * - International phone input with country flags
 * - Relationship selector with FHIR v3-RoleCode types
 * - Collapsible section wrapper
 *
 * @param props - Component props
 * @param props.onSubmit - Callback function when form is submitted
 * @param props.initialValues - Optional initial form values
 * @returns Representative form component
 *
 * @example
 * ```tsx
 * <RepresentativeForm
 *   onSubmit={handleRepresentativeSubmit}
 *   initialValues={{ firstName: 'თამარ', lastName: 'გელაშვილი' }}
 * />
 * ```
 */
export function RepresentativeForm({ onSubmit, initialValues }: RepresentativeFormProps): JSX.Element {
  const { t } = useTranslation();

  const form = useForm<RepresentativeFormValues>({
    initialValues: {
      firstName: initialValues?.firstName || '',
      lastName: initialValues?.lastName || '',
      fatherName: initialValues?.fatherName || '',
      personalId: initialValues?.personalId || '',
      phoneNumber: initialValues?.phoneNumber || '',
      relationship: initialValues?.relationship || '',
    },
    validate: {
      firstName: (value) => {
        if (!value?.trim()) {
          return t('registration.validation.required');
        }
        return null;
      },
      lastName: (value) => {
        if (!value?.trim()) {
          return t('registration.validation.required');
        }
        return null;
      },
      personalId: (value) => {
        // Personal ID is optional for representatives, but validate if provided
        if (value?.trim()) {
          const validation = validateGeorgianPersonalId(value);
          if (!validation.isValid) {
            return validation.error;
          }
        }
        return null;
      },
      phoneNumber: (value) => {
        if (!value?.trim()) {
          return t('registration.validation.required');
        }
        return null;
      },
      relationship: (value) => {
        if (!value?.trim()) {
          return t('registration.validation.required');
        }
        return null;
      },
    },
  });

  const handleSubmit = (values: RepresentativeFormValues): void => {
    onSubmit(values);
  };

  return (
    <CollapsibleSection title={t('registration.section.representative')} defaultOpen={true}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid gutter="md">
          {/* First Name */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <EMRTextInput
              label={t('registration.field.firstName')}
              placeholder={t('registration.placeholder.enterFirstName')}
              required
              {...form.getInputProps('firstName')}
            />
          </Grid.Col>

          {/* Last Name */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <EMRTextInput
              label={t('registration.field.lastName')}
              placeholder={t('registration.placeholder.enterLastName')}
              required
              {...form.getInputProps('lastName')}
            />
          </Grid.Col>

          {/* Father's Name (Optional) */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <EMRTextInput
              label={t('registration.field.fatherName')}
              placeholder={t('registration.placeholder.fatherName')}
              {...form.getInputProps('fatherName')}
            />
          </Grid.Col>

          {/* Personal ID (Optional) */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <EMRTextInput
              label={t('registration.field.personalId')}
              placeholder={t('registration.placeholder.enterPersonalId')}
              {...form.getInputProps('personalId')}
            />
          </Grid.Col>

          {/* Phone Number */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <InternationalPhoneInput
              label={t('registration.field.phoneNumber')}
              value={form.values.phoneNumber}
              onChange={(value) => form.setFieldValue('phoneNumber', value)}
              error={form.errors.phoneNumber as string}
              required
            />
          </Grid.Col>

          {/* Relationship */}
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <RelationshipSelect
              value={form.values.relationship}
              onChange={(value) => form.setFieldValue('relationship', value)}
              error={form.errors.relationship as string}
              required
            />
          </Grid.Col>
        </Grid>
      </form>
    </CollapsibleSection>
  );
}
