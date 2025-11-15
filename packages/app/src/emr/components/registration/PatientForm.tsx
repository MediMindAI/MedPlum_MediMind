// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Select, TextInput, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMedplum } from '@medplum/react-hooks';
import { Patient } from '@medplum/fhirtypes';
import { useState } from 'react';
import { IconUser, IconPhone, IconFileText, IconUsers } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import { InternationalPhoneInput } from './InternationalPhoneInput';
import { CitizenshipSelect } from './CitizenshipSelect';
import { SubmitDropdownButton } from './SubmitDropdownButton';
import { CollapsibleSection } from './CollapsibleSection';
import { validateGeorgianPersonalId, validateEmail } from '../../services/validators';
import { notifications } from '@mantine/notifications';
import { EMRDatePicker } from '../common/EMRDatePicker';

interface PatientFormProps {
  onSuccess?: () => void;
  initialValues?: Partial<Patient>;
  onSaveAndContinue?: () => void;
  onSaveAndView?: (patientId: string) => void;
}

/**
 * Patient registration form with modern dropdowns
 * Includes all essential patient information fields
 */
export function PatientForm({ onSuccess, onSaveAndContinue, onSaveAndView }: PatientFormProps) {
  const { t } = useTranslation();
  const medplum = useMedplum();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      personalId: '',
      firstName: '',
      lastName: '',
      fatherName: '',
      gender: '',
      birthDate: null as Date | null,
      phoneNumber: '+995',
      email: '',
      address: '',
      citizenship: 'GE',
      // Additional fields from original EMR
      maritalStatus: '',
      workplace: '',
      workplaceAddress: '',
      city: '',
      district: '',
      building: '',
      region: '',
      educationLevel: '',
      familyRelationship: '',
      // Guardian/Representative fields
      guardianRelationship: '',
      guardianFirstName: '',
      guardianLastName: '',
      guardianPersonalId: '',
      guardianBirthDate: null as Date | null,
      guardianGender: '',
      guardianPhone: '+995',
      guardianMaritalStatus: '',
      guardianAddress: '',
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

  const handleSubmit = async (values: typeof form.values, action: 'save' | 'continue' | 'new' | 'view' = 'save') => {
    try {
      setIsSubmitting(true);
      const patient: Patient = {
        resourceType: 'Patient',
        identifier: values.personalId
          ? [
              {
                system: 'http://medimind.ge/identifiers/personal-id',
                value: values.personalId,
              },
            ]
          : undefined,
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
        extension: [
          values.citizenship && {
            url: 'citizenship',
            valueCodeableConcept: {
              coding: [{ code: values.citizenship }],
            },
          },
          values.maritalStatus && {
            url: 'marital-status',
            valueCodeableConcept: {
              coding: [{ code: values.maritalStatus }],
            },
          },
          values.workplace && {
            url: 'workplace',
            valueString: values.workplace,
          },
          values.workplaceAddress && {
            url: 'workplace-address',
            valueString: values.workplaceAddress,
          },
          values.city && {
            url: 'city',
            valueString: values.city,
          },
          values.district && {
            url: 'district',
            valueString: values.district,
          },
          values.building && {
            url: 'building',
            valueString: values.building,
          },
          values.region && {
            url: 'region',
            valueString: values.region,
          },
          values.educationLevel && {
            url: 'education-level',
            valueCodeableConcept: {
              coding: [{ code: values.educationLevel }],
            },
          },
          values.familyRelationship && {
            url: 'family-relationship',
            valueString: values.familyRelationship,
          },
          // Guardian/Representative fields
          values.guardianRelationship && {
            url: 'guardian-relationship',
            valueCodeableConcept: {
              coding: [{ code: values.guardianRelationship }],
            },
          },
          values.guardianPersonalId && {
            url: 'guardian-personal-id',
            valueString: values.guardianPersonalId,
          },
          values.guardianFirstName && {
            url: 'guardian-first-name',
            valueString: values.guardianFirstName,
          },
          values.guardianLastName && {
            url: 'guardian-last-name',
            valueString: values.guardianLastName,
          },
          values.guardianGender && {
            url: 'guardian-gender',
            valueString: values.guardianGender,
          },
          values.guardianBirthDate && {
            url: 'guardian-birth-date',
            valueString: values.guardianBirthDate.toISOString().split('T')[0],
          },
          values.guardianPhone && {
            url: 'guardian-phone',
            valueString: values.guardianPhone,
          },
          values.guardianMaritalStatus && {
            url: 'guardian-marital-status',
            valueCodeableConcept: {
              coding: [{ code: values.guardianMaritalStatus }],
            },
          },
          values.guardianAddress && {
            url: 'guardian-address',
            valueString: values.guardianAddress,
          },
        ].filter(Boolean) as any,
      };

      const createdPatient = await medplum.createResource(patient);
      notifications.show({
        title: t('registration.success.title') || 'Success',
        message: t('registration.success.patientCreated') || 'Patient registered successfully',
        color: 'green',
      });

      // Handle different actions
      if (action === 'new') {
        form.reset();
      }

      if (action === 'view' && createdPatient.id) {
        onSaveAndView?.(createdPatient.id);
      } else if (action === 'continue') {
        onSaveAndContinue?.();
      } else {
        onSuccess?.();
      }
    } catch (error) {
      notifications.show({
        title: t('registration.error.title') || 'Error',
        message: t('registration.error.createFailed') || 'Failed to register patient',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit((values) => handleSubmit(values, 'save'))}>
      <Stack gap="lg">
        {/* Section 1: Personal Information - Default OPEN */}
        <CollapsibleSection
          title={t('registration.sections.personalInfo') || 'Personal Information'}
          icon={<IconUser size={22} stroke={2} />}
          defaultOpen={true}
        >
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

            <EMRDatePicker
              label={t('registration.field.birthDate')}
              placeholder={t('registration.field.birthDatePlaceholder') || 'აირჩიეთ დაბადების თარიღი'}
              maxDate={new Date()}
              {...form.getInputProps('birthDate')}
            />
          </Stack>
        </CollapsibleSection>

        {/* Section 2: Contact Information - Default CLOSED */}
        <CollapsibleSection
          title={t('registration.sections.contactInfo') || 'Contact Information'}
          icon={<IconPhone size={22} stroke={2} />}
          defaultOpen={false}
        >
          <Stack gap="md">
            <InternationalPhoneInput
              label={t('registration.field.phoneNumber')}
              value={form.values.phoneNumber}
              onChange={(value) => form.setFieldValue('phoneNumber', value)}
              error={form.errors.phoneNumber}
            />

            <TextInput
              label={t('registration.field.email')}
              type="email"
              placeholder="email@example.com"
              {...form.getInputProps('email')}
            />

            <TextInput
              label={t('registration.field.address')}
              placeholder={t('registration.field.addressPlaceholder') || 'Full address'}
              {...form.getInputProps('address')}
            />
          </Stack>
        </CollapsibleSection>

        {/* Section 3: Additional Details - Default CLOSED */}
        <CollapsibleSection
          title={t('registration.sections.additionalDetails') || 'Additional Details'}
          icon={<IconFileText size={22} stroke={2} />}
          defaultOpen={false}
        >
          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label={t('registration.field.maritalStatus')}
                  placeholder={t('registration.field.selectMaritalStatus') || 'Select'}
                  data={[
                    { value: 'single', label: t('registration.maritalStatus.single') || 'Single' },
                    { value: 'married', label: t('registration.maritalStatus.married') || 'Married' },
                    { value: 'divorced', label: t('registration.maritalStatus.divorced') || 'Divorced' },
                    { value: 'widowed', label: t('registration.maritalStatus.widowed') || 'Widowed' },
                  ]}
                  {...form.getInputProps('maritalStatus')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <CitizenshipSelect
                  value={form.values.citizenship}
                  onChange={(value) => form.setFieldValue('citizenship', value)}
                  error={form.errors.citizenship as string}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label={t('registration.field.workplace')}
                  placeholder={t('registration.field.workplacePlaceholder') || 'Occupation'}
                  {...form.getInputProps('workplace')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label={t('registration.field.workplaceAddress')}
                  placeholder={t('registration.field.workplaceAddressPlaceholder') || 'Workplace address'}
                  {...form.getInputProps('workplaceAddress')}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={4}>
                <TextInput
                  label={t('registration.field.city')}
                  placeholder={t('registration.field.cityPlaceholder') || 'City'}
                  {...form.getInputProps('city')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label={t('registration.field.district')}
                  placeholder={t('registration.field.districtPlaceholder') || 'District'}
                  {...form.getInputProps('district')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label={t('registration.field.building')}
                  placeholder={t('registration.field.buildingPlaceholder') || 'Building/Street'}
                  {...form.getInputProps('building')}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label={t('registration.field.region')}
                  placeholder={t('registration.field.regionPlaceholder') || 'Region'}
                  {...form.getInputProps('region')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label={t('registration.field.educationLevel')}
                  placeholder={t('registration.field.selectEducation') || 'Select'}
                  data={[
                    { value: 'elementary', label: t('registration.education.elementary') || 'Elementary' },
                    { value: 'secondary', label: t('registration.education.secondary') || 'Secondary' },
                    { value: 'higher', label: t('registration.education.higher') || 'Higher Education' },
                    { value: 'postgraduate', label: t('registration.education.postgraduate') || 'Postgraduate' },
                  ]}
                  {...form.getInputProps('educationLevel')}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label={t('registration.field.familyRelationship')}
              placeholder={t('registration.field.familyRelationshipPlaceholder') || 'Family relationship'}
              {...form.getInputProps('familyRelationship')}
            />
          </Stack>
        </CollapsibleSection>

        {/* Section 4: Guardian/Representative - Default CLOSED */}
        <CollapsibleSection
          title={t('registration.sections.guardian') || 'Guardian/Representative'}
          icon={<IconUsers size={22} stroke={2} />}
          defaultOpen={false}
        >
          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label={t('registration.field.guardianRelationship')}
                  placeholder={t('registration.field.selectRelationship') || 'Select relationship'}
                  data={[
                    { value: 'mother', label: t('registration.relationship.mother') || 'Mother' },
                    { value: 'father', label: t('registration.relationship.father') || 'Father' },
                    { value: 'sister', label: t('registration.relationship.sister') || 'Sister' },
                    { value: 'brother', label: t('registration.relationship.brother') || 'Brother' },
                    { value: 'grandmother', label: t('registration.relationship.grandmother') || 'Grandmother' },
                    { value: 'grandfather', label: t('registration.relationship.grandfather') || 'Grandfather' },
                    { value: 'spouse', label: t('registration.relationship.spouse') || 'Spouse' },
                    { value: 'child', label: t('registration.relationship.child') || 'Child' },
                    { value: 'familyMember', label: t('registration.relationship.familyMember') || 'Family Member' },
                  ]}
                  {...form.getInputProps('guardianRelationship')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label={t('registration.field.guardianPersonalId')}
                  placeholder="01234567891"
                  {...form.getInputProps('guardianPersonalId')}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={4}>
                <TextInput
                  label={t('registration.field.guardianFirstName')}
                  placeholder="სახელი"
                  {...form.getInputProps('guardianFirstName')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label={t('registration.field.guardianLastName')}
                  placeholder="გვარი"
                  {...form.getInputProps('guardianLastName')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  label={t('registration.field.guardianGender')}
                  placeholder={t('registration.field.selectGender') || 'Select'}
                  data={[
                    { value: 'male', label: t('registration.gender.male') || 'Male' },
                    { value: 'female', label: t('registration.gender.female') || 'Female' },
                    { value: 'other', label: t('registration.gender.other') || 'Other' },
                  ]}
                  {...form.getInputProps('guardianGender')}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <EMRDatePicker
                  label={t('registration.field.guardianBirthDate')}
                  placeholder={t('registration.field.birthDatePlaceholder') || 'აირჩიეთ დაბადების თარიღი'}
                  maxDate={new Date()}
                  {...form.getInputProps('guardianBirthDate')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <InternationalPhoneInput
                  label={t('registration.field.guardianPhone')}
                  value={form.values.guardianPhone}
                  onChange={(value) => form.setFieldValue('guardianPhone', value)}
                  error={form.errors.guardianPhone}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <Select
                  label={t('registration.field.guardianMaritalStatus')}
                  placeholder={t('registration.field.selectMaritalStatus') || 'Select'}
                  data={[
                    { value: 'single', label: t('registration.maritalStatus.single') || 'Single' },
                    { value: 'married', label: t('registration.maritalStatus.married') || 'Married' },
                    { value: 'divorced', label: t('registration.maritalStatus.divorced') || 'Divorced' },
                    { value: 'widowed', label: t('registration.maritalStatus.widowed') || 'Widowed' },
                  ]}
                  {...form.getInputProps('guardianMaritalStatus')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label={t('registration.field.guardianAddress')}
                  placeholder={t('registration.field.addressPlaceholder') || 'Full address'}
                  {...form.getInputProps('guardianAddress')}
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </CollapsibleSection>

        {/* Submit Actions - Always Visible */}
        <SubmitDropdownButton
          onSave={() => form.onSubmit((values) => handleSubmit(values, 'save'))()}
          onSaveAndContinue={() => form.onSubmit((values) => handleSubmit(values, 'continue'))()}
          onSaveAndNew={() => form.onSubmit((values) => handleSubmit(values, 'new'))()}
          onSaveAndView={() => form.onSubmit((values) => handleSubmit(values, 'view'))()}
          loading={isSubmitting}
          disabled={!form.isValid()}
        />
      </Stack>
    </form>
  );
}
