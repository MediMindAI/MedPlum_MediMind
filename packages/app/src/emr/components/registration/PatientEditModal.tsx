// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Loader, Text, Stack, Button, Grid, Select, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { notifications } from '@mantine/notifications';
import { InternationalPhoneInput } from './InternationalPhoneInput';
import { validateGeorgianPersonalId, validateEmail } from '../../services/validators';
import { EMRModal } from '../common/EMRModal';
import { EMRDatePicker } from '../common/EMRDatePicker';

interface PatientEditModalProps {
  opened: boolean;
  onClose: () => void;
  patientId: string;
  onSuccess?: () => void;
}

interface PatientFormValues {
  personalId: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  gender: string;
  birthDate: Date | null;
  phoneNumber: string;
  email: string;
  address: string;
  citizenship: string;
}

/**
 * Modal for editing existing patient information
 * Auto-fetches patient data by ID and displays in editable form
 */
export function PatientEditModal({ opened, onClose, patientId, onSuccess }: PatientEditModalProps) {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<PatientFormValues>({
    initialValues: {
      personalId: '',
      firstName: '',
      lastName: '',
      fatherName: '',
      gender: '',
      birthDate: null,
      phoneNumber: '+995',
      email: '',
      address: '',
      citizenship: 'GE',
    },
    validate: {
      personalId: (value) => {
        if (!value) return null;
        const result = validateGeorgianPersonalId(value);
        return result.isValid ? null : result.error;
      },
      firstName: (value) => (!value ? t('registration.validation.required') || 'Required' : null),
      lastName: (value) => (!value ? t('registration.validation.required') || 'Required' : null),
      gender: (value) => (!value ? t('registration.validation.required') || 'Required' : null),
      email: (value) => {
        if (!value) return null;
        const result = validateEmail(value);
        return result.isValid ? null : result.error;
      },
    },
  });

  // Load patient data when modal opens
  useEffect(() => {
    if (opened && patientId) {
      loadPatient();
    }
  }, [opened, patientId]);

  const loadPatient = async () => {
    try {
      setLoading(true);
      const data = await medplum.readResource('Patient', patientId);
      setPatient(data);

      // Extract FHIR data and populate form
      const formValues = convertPatientToFormValues(data);
      form.setValues(formValues);
    } catch (error) {
      notifications.show({
        title: t('registration.error.title') || 'Error',
        message: t('registration.edit.error') || 'Failed to load patient',
        color: 'red',
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Convert FHIR Patient resource to form values
   */
  const convertPatientToFormValues = (patient: Patient): PatientFormValues => {
    // Extract personal ID from identifier array
    const personalId =
      patient.identifier?.find((id) => id.system === 'http://medimind.ge/identifiers/personal-id')?.value || '';

    // Extract name parts
    const name = patient.name?.[0];
    const firstName = name?.given?.[0] || '';
    const lastName = name?.family || '';
    const fatherName = name?.extension?.find((ext) => ext.url === 'patronymic')?.valueString || '';

    // Extract gender and birthDate
    const gender = patient.gender || '';
    const birthDate = patient.birthDate ? new Date(patient.birthDate) : null;

    // Extract phone and email from telecom
    const phoneNumber =
      patient.telecom?.find((t) => t.system === 'phone')?.value || '+995';
    const email = patient.telecom?.find((t) => t.system === 'email')?.value || '';

    // Extract address
    const address = patient.address?.[0]?.text || '';

    // Extract citizenship from extension
    const citizenship =
      patient.extension?.find((ext) => ext.url === 'citizenship')?.valueCodeableConcept?.coding?.[0]?.code || 'GE';

    return {
      personalId,
      firstName,
      lastName,
      fatherName,
      gender,
      birthDate,
      phoneNumber,
      email,
      address,
      citizenship,
    };
  };

  /**
   * Convert form values back to FHIR Patient resource
   */
  const convertFormValuesToPatient = (values: PatientFormValues): Patient => {
    return {
      ...patient,
      resourceType: 'Patient',
      id: patientId,
      identifier: values.personalId
        ? [
            {
              system: 'http://medimind.ge/identifiers/personal-id',
              value: values.personalId,
            },
            // Preserve existing registration number identifier if it exists
            ...(patient?.identifier?.filter(
              (id) => id.system === 'http://medimind.ge/identifiers/registration-number'
            ) || []),
          ]
        : patient?.identifier,
      name: [
        {
          family: values.lastName,
          given: [values.firstName],
          extension: values.fatherName
            ? [
                {
                  url: 'patronymic',
                  valueString: values.fatherName,
                },
              ]
            : undefined,
        },
      ],
      gender: values.gender as 'male' | 'female' | 'other',
      birthDate: values.birthDate ? values.birthDate.toISOString().split('T')[0] : undefined,
      telecom: [
        values.phoneNumber
          ? {
              system: 'phone',
              value: values.phoneNumber,
            }
          : undefined,
        values.email
          ? {
              system: 'email',
              value: values.email,
            }
          : undefined,
      ].filter(Boolean) as any,
      address: values.address
        ? [
            {
              text: values.address,
            },
          ]
        : undefined,
      extension: values.citizenship
        ? [
            {
              url: 'citizenship',
              valueCodeableConcept: {
                coding: [
                  {
                    code: values.citizenship,
                  },
                ],
              },
            },
          ]
        : undefined,
    };
  };

  const handleSubmit = async (values: PatientFormValues) => {
    try {
      setSubmitting(true);
      const updatedPatient = convertFormValuesToPatient(values);
      await medplum.updateResource(updatedPatient);

      notifications.show({
        title: t('registration.success.title') || 'Success',
        message: t('registration.edit.success') || 'Patient updated successfully',
        color: 'green',
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      notifications.show({
        title: t('registration.error.title') || 'Error',
        message: t('registration.edit.error') || 'Failed to update patient',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EMRModal
      opened={opened}
      onClose={onClose}
      title={t('registration.edit.title') || 'პაციენტის რედაქტირება'}
      size="xl"
    >
      {loading ? (
        <Stack align="center" gap="md" py="xl">
          <Loader size="lg" />
          <Text c="dimmed">{t('registration.edit.loading') || 'Loading patient data...'}</Text>
        </Stack>
      ) : (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label={t('registration.field.personalId')}
                  placeholder="01234567891"
                  {...form.getInputProps('personalId')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label={t('registration.field.gender')}
                  placeholder={t('registration.field.selectGender') || 'Select gender'}
                  data={[
                    { value: 'male', label: t('registration.gender.male') || 'Male' },
                    { value: 'female', label: t('registration.gender.female') || 'Female' },
                    { value: 'other', label: t('registration.gender.other') || 'Other' },
                  ]}
                  {...form.getInputProps('gender')}
                  required
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={4}>
                <TextInput
                  label={t('registration.field.firstName')}
                  placeholder="სახელი"
                  {...form.getInputProps('firstName')}
                  required
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label={t('registration.field.lastName')}
                  placeholder="გვარი"
                  {...form.getInputProps('lastName')}
                  required
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label={t('registration.field.fatherName')}
                  placeholder="მამის სახელი"
                  {...form.getInputProps('fatherName')}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <EMRDatePicker
                  label={t('registration.field.birthDate')}
                  placeholder={t('registration.field.birthDatePlaceholder') || 'აირჩიეთ დაბადების თარიღი'}
                  maxDate={new Date()}
                  {...form.getInputProps('birthDate')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label={t('registration.field.citizenship')}
                  placeholder={t('registration.field.selectCitizenship') || 'Select citizenship'}
                  data={[
                    { value: 'GE', label: '🇬🇪 Georgia' },
                    { value: 'US', label: '🇺🇸 United States' },
                    { value: 'GB', label: '🇬🇧 United Kingdom' },
                    { value: 'RU', label: '🇷🇺 Russia' },
                    { value: 'DE', label: '🇩🇪 Germany' },
                    { value: 'FR', label: '🇫🇷 France' },
                  ]}
                  {...form.getInputProps('citizenship')}
                  searchable
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <InternationalPhoneInput
                  label={t('registration.field.phoneNumber')}
                  value={form.values.phoneNumber}
                  onChange={(value) => form.setFieldValue('phoneNumber', value)}
                  error={form.errors.phoneNumber as string}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label={t('registration.field.email')}
                  type="email"
                  placeholder="email@example.com"
                  {...form.getInputProps('email')}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label={t('registration.field.address')}
              placeholder={t('registration.field.addressPlaceholder') || 'Full address'}
              {...form.getInputProps('address')}
            />

            <Grid mt="md">
              <Grid.Col span={6}>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={onClose}
                  disabled={submitting}
                >
                  {t('registration.action.cancel') || 'Cancel'}
                </Button>
              </Grid.Col>
              <Grid.Col span={6}>
                <Button
                  type="submit"
                  fullWidth
                  loading={submitting}
                  style={{
                    background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
                  }}
                >
                  {t('registration.edit.save') || 'Save Changes'}
                </Button>
              </Grid.Col>
            </Grid>
          </Stack>
        </form>
      )}
    </EMRModal>
  );
}
