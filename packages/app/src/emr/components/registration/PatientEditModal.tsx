// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Loader, Text, Stack, Button, Grid, Select, TextInput, Box, Modal } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';
import type { Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import { useEffect, useState } from 'react';
import { IconUser, IconPhone, IconFileText, IconUsers } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import { notifications } from '@mantine/notifications';
import { InternationalPhoneInput } from './InternationalPhoneInput';
import { CitizenshipSelect } from './CitizenshipSelect';
import { CollapsibleSection } from './CollapsibleSection';
import { validateGeorgianPersonalId, validateEmail } from '../../services/validators';
import { EMRDatePicker } from '../common/EMRDatePicker';

interface PatientEditModalProps {
  opened: boolean;
  onClose: () => void;
  patientId: string;
  onSuccess?: () => void;
}

interface PatientFormValues {
  // Personal Information
  personalId: string;
  firstName: string;
  lastName: string;
  fatherName: string;
  gender: string;
  birthDate: Date | null;
  // Contact Information
  phoneNumber: string;
  email: string;
  address: string;
  // Additional Details
  citizenship: string;
  maritalStatus: string;
  workplace: string;
  workplaceAddress: string;
  city: string;
  district: string;
  building: string;
  region: string;
  educationLevel: string;
  familyRelationship: string;
  // Guardian/Representative
  guardianRelationship: string;
  guardianPersonalId: string;
  guardianFirstName: string;
  guardianLastName: string;
  guardianGender: string;
  guardianBirthDate: Date | null;
  guardianPhone: string;
  guardianMaritalStatus: string;
  guardianAddress: string;
}

/**
 * Production-ready modal for editing existing patient information
 * Features: 4 collapsible sections, all FHIR fields, responsive design
 * @param root0
 * @param root0.opened
 * @param root0.onClose
 * @param root0.patientId
 * @param root0.onSuccess
 */
export function PatientEditModal({ opened, onClose, patientId, onSuccess }: PatientEditModalProps) {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 768px)');
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
      maritalStatus: '',
      workplace: '',
      workplaceAddress: '',
      city: '',
      district: '',
      building: '',
      region: '',
      educationLevel: '',
      familyRelationship: '',
      guardianRelationship: '',
      guardianPersonalId: '',
      guardianFirstName: '',
      guardianLastName: '',
      guardianGender: '',
      guardianBirthDate: null,
      guardianPhone: '+995',
      guardianMaritalStatus: '',
      guardianAddress: '',
    },
    validate: {
      personalId: (value) => {
        if (!value) {return null;}
        const result = validateGeorgianPersonalId(value);
        return result.isValid ? null : result.error;
      },
      firstName: (value) => (!value ? t('registration.validation.required') || 'Required' : null),
      lastName: (value) => (!value ? t('registration.validation.required') || 'Required' : null),
      gender: (value) => (!value ? t('registration.validation.required') || 'Required' : null),
      email: (value) => {
        if (!value) {return null;}
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
   * Extract extension value by URL
   * @param patient
   * @param url
   */
  const getExtensionValue = (patient: Patient, url: string): string => {
    const ext = patient.extension?.find((e) => e.url === url);
    if (!ext) {return '';}
    if (ext.valueString) {return ext.valueString;}
    if (ext.valueCodeableConcept?.coding?.[0]?.code) {return ext.valueCodeableConcept.coding[0].code;}
    return '';
  };

  /**
   * Convert FHIR Patient resource to form values
   * @param patient
   */
  const convertPatientToFormValues = (patient: Patient): PatientFormValues => {
    // Extract personal ID
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
    const phoneNumber = patient.telecom?.find((t) => t.system === 'phone')?.value || '+995';
    const email = patient.telecom?.find((t) => t.system === 'email')?.value || '';

    // Extract address
    const address = patient.address?.[0]?.text || '';

    // Extract extensions
    const citizenship = getExtensionValue(patient, 'citizenship') || 'GE';
    const maritalStatus = getExtensionValue(patient, 'marital-status');
    const workplace = getExtensionValue(patient, 'workplace');
    const workplaceAddress = getExtensionValue(patient, 'workplace-address');
    const city = getExtensionValue(patient, 'city');
    const district = getExtensionValue(patient, 'district');
    const building = getExtensionValue(patient, 'building');
    const region = getExtensionValue(patient, 'region');
    const educationLevel = getExtensionValue(patient, 'education-level');
    const familyRelationship = getExtensionValue(patient, 'family-relationship');

    // Extract guardian extensions
    const guardianRelationship = getExtensionValue(patient, 'guardian-relationship');
    const guardianPersonalId = getExtensionValue(patient, 'guardian-personal-id');
    const guardianFirstName = getExtensionValue(patient, 'guardian-first-name');
    const guardianLastName = getExtensionValue(patient, 'guardian-last-name');
    const guardianGender = getExtensionValue(patient, 'guardian-gender');
    const guardianBirthDateStr = getExtensionValue(patient, 'guardian-birth-date');
    const guardianBirthDate = guardianBirthDateStr ? new Date(guardianBirthDateStr) : null;
    const guardianPhone = getExtensionValue(patient, 'guardian-phone') || '+995';
    const guardianMaritalStatus = getExtensionValue(patient, 'guardian-marital-status');
    const guardianAddress = getExtensionValue(patient, 'guardian-address');

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
      maritalStatus,
      workplace,
      workplaceAddress,
      city,
      district,
      building,
      region,
      educationLevel,
      familyRelationship,
      guardianRelationship,
      guardianPersonalId,
      guardianFirstName,
      guardianLastName,
      guardianGender,
      guardianBirthDate,
      guardianPhone,
      guardianMaritalStatus,
      guardianAddress,
    };
  };

  /**
   * Convert form values back to FHIR Patient resource
   * @param values
   */
  const convertFormValuesToPatient = (values: PatientFormValues): Patient => {
    // Build extensions array
    const extensions: { url: string; valueString?: string; valueCodeableConcept?: any }[] = [];

    // Add value extensions
    if (values.citizenship) {
      extensions.push({
        url: 'citizenship',
        valueCodeableConcept: { coding: [{ code: values.citizenship }] },
      });
    }
    if (values.maritalStatus) {
      extensions.push({
        url: 'marital-status',
        valueCodeableConcept: { coding: [{ code: values.maritalStatus }] },
      });
    }
    if (values.workplace) {extensions.push({ url: 'workplace', valueString: values.workplace });}
    if (values.workplaceAddress) {extensions.push({ url: 'workplace-address', valueString: values.workplaceAddress });}
    if (values.city) {extensions.push({ url: 'city', valueString: values.city });}
    if (values.district) {extensions.push({ url: 'district', valueString: values.district });}
    if (values.building) {extensions.push({ url: 'building', valueString: values.building });}
    if (values.region) {extensions.push({ url: 'region', valueString: values.region });}
    if (values.educationLevel) {
      extensions.push({
        url: 'education-level',
        valueCodeableConcept: { coding: [{ code: values.educationLevel }] },
      });
    }
    if (values.familyRelationship) {extensions.push({ url: 'family-relationship', valueString: values.familyRelationship });}

    // Add guardian extensions
    if (values.guardianRelationship) {
      extensions.push({
        url: 'guardian-relationship',
        valueCodeableConcept: { coding: [{ code: values.guardianRelationship }] },
      });
    }
    if (values.guardianPersonalId) {extensions.push({ url: 'guardian-personal-id', valueString: values.guardianPersonalId });}
    if (values.guardianFirstName) {extensions.push({ url: 'guardian-first-name', valueString: values.guardianFirstName });}
    if (values.guardianLastName) {extensions.push({ url: 'guardian-last-name', valueString: values.guardianLastName });}
    if (values.guardianGender) {extensions.push({ url: 'guardian-gender', valueString: values.guardianGender });}
    if (values.guardianBirthDate) {
      extensions.push({ url: 'guardian-birth-date', valueString: values.guardianBirthDate.toISOString().split('T')[0] });
    }
    if (values.guardianPhone) {extensions.push({ url: 'guardian-phone', valueString: values.guardianPhone });}
    if (values.guardianMaritalStatus) {
      extensions.push({
        url: 'guardian-marital-status',
        valueCodeableConcept: { coding: [{ code: values.guardianMaritalStatus }] },
      });
    }
    if (values.guardianAddress) {extensions.push({ url: 'guardian-address', valueString: values.guardianAddress });}

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
            // Preserve existing registration number identifier
            ...(patient?.identifier?.filter((id) => id.system === 'http://medimind.ge/identifiers/registration-number') || []),
          ]
        : patient?.identifier,
      name: [
        {
          family: values.lastName,
          given: values.firstName ? [values.firstName] : [],
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
      gender: values.gender as 'male' | 'female' | 'other' | 'unknown',
      birthDate: values.birthDate ? values.birthDate.toISOString().split('T')[0] : undefined,
      telecom: [
        values.phoneNumber ? { system: 'phone', value: values.phoneNumber } : undefined,
        values.email ? { system: 'email', value: values.email } : undefined,
      ].filter(Boolean) as any,
      address: values.address ? [{ text: values.address }] : undefined,
      extension: extensions.length > 0 ? (extensions as any) : undefined,
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
    <Modal
      opened={opened}
      onClose={onClose}
      size="95%"
      centered
      title={
        <Text fw={700} size="xl" c="dark">
          {t('registration.edit.title') || 'Edit Patient'}
        </Text>
      }
      styles={{
        root: { zIndex: 1000 },
        inner: { paddingTop: '40px' },
        header: {
          borderBottom: '2px solid #e9ecef',
          paddingBottom: 12,
          marginBottom: 0,
          backgroundColor: 'white',
        },
        body: {
          padding: '20px 24px',
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
          backgroundColor: 'white',
        },
        content: {
          borderRadius: '12px',
        },
      }}
    >
      {loading ? (
        <Stack align="center" justify="center" gap="md" style={{ minHeight: '300px' }}>
          <Loader size="xl" color="cyan" />
          <Text size="lg" c="dimmed">
            {t('registration.edit.loading') || 'Loading patient data...'}
          </Text>
        </Stack>
      ) : (
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="lg" pb="md">
              {/* Section 1: Personal Information - Default OPEN */}
              <CollapsibleSection
                title={t('registration.sections.personalInfo') || 'Personal Information'}
                icon={<IconUser size={22} stroke={2} />}
                defaultOpen={true}
              >
                <Stack gap="md">
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label={t('registration.field.personalId')}
                        placeholder="01234567891"
                        {...form.getInputProps('personalId')}
                        size="md"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <Select
                        label={t('registration.field.gender')}
                        placeholder={t('registration.field.selectGender') || 'Select gender'}
                        data={[
                          { value: 'male', label: t('registration.gender.male') || 'Male' },
                          { value: 'female', label: t('registration.gender.female') || 'Female' },
                          { value: 'other', label: t('registration.gender.other') || 'Other' },
                          { value: 'unknown', label: t('registration.gender.unknown') || 'Unknown' },
                        ]}
                        {...form.getInputProps('gender')}
                        required
                        size="md"
                      />
                    </Grid.Col>
                  </Grid>

                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <TextInput
                        label={t('registration.field.firstName')}
                        placeholder="სახელი"
                        {...form.getInputProps('firstName')}
                        required
                        size="md"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <TextInput
                        label={t('registration.field.lastName')}
                        placeholder="გვარი"
                        {...form.getInputProps('lastName')}
                        required
                        size="md"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <TextInput
                        label={t('registration.field.fatherName')}
                        placeholder="მამის სახელი"
                        {...form.getInputProps('fatherName')}
                        size="md"
                      />
                    </Grid.Col>
                  </Grid>

                  <EMRDatePicker
                    label={t('registration.field.birthDate')}
                    placeholder={t('registration.field.birthDatePlaceholder') || 'Select birth date'}
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
                    error={form.errors.phoneNumber as string}
                  />

                  <TextInput
                    label={t('registration.field.email')}
                    type="email"
                    placeholder="email@example.com"
                    {...form.getInputProps('email')}
                    size="md"
                  />

                  <TextInput
                    label={t('registration.field.address')}
                    placeholder={t('registration.field.addressPlaceholder') || 'Full address'}
                    {...form.getInputProps('address')}
                    size="md"
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
                    <Grid.Col span={{ base: 12, sm: 6 }}>
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
                        size="md"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <CitizenshipSelect
                        value={form.values.citizenship}
                        onChange={(value) => form.setFieldValue('citizenship', value)}
                        error={form.errors.citizenship as string}
                      />
                    </Grid.Col>
                  </Grid>

                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label={t('registration.field.workplace')}
                        placeholder={t('registration.field.workplacePlaceholder') || 'Occupation'}
                        {...form.getInputProps('workplace')}
                        size="md"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label={t('registration.field.workplaceAddress')}
                        placeholder={t('registration.field.workplaceAddressPlaceholder') || 'Workplace address'}
                        {...form.getInputProps('workplaceAddress')}
                        size="md"
                      />
                    </Grid.Col>
                  </Grid>

                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <TextInput
                        label={t('registration.field.city')}
                        placeholder={t('registration.field.cityPlaceholder') || 'City'}
                        {...form.getInputProps('city')}
                        size="md"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <TextInput
                        label={t('registration.field.district')}
                        placeholder={t('registration.field.districtPlaceholder') || 'District'}
                        {...form.getInputProps('district')}
                        size="md"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <TextInput
                        label={t('registration.field.building')}
                        placeholder={t('registration.field.buildingPlaceholder') || 'Building/Street'}
                        {...form.getInputProps('building')}
                        size="md"
                      />
                    </Grid.Col>
                  </Grid>

                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label={t('registration.field.region')}
                        placeholder={t('registration.field.regionPlaceholder') || 'Region'}
                        {...form.getInputProps('region')}
                        size="md"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
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
                        size="md"
                      />
                    </Grid.Col>
                  </Grid>

                  <TextInput
                    label={t('registration.field.familyRelationship')}
                    placeholder={t('registration.field.familyRelationshipPlaceholder') || 'Family relationship'}
                    {...form.getInputProps('familyRelationship')}
                    size="md"
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
                    <Grid.Col span={{ base: 12, sm: 6 }}>
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
                        size="md"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label={t('registration.field.guardianPersonalId')}
                        placeholder="01234567891"
                        {...form.getInputProps('guardianPersonalId')}
                        size="md"
                      />
                    </Grid.Col>
                  </Grid>

                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <TextInput
                        label={t('registration.field.guardianFirstName')}
                        placeholder="სახელი"
                        {...form.getInputProps('guardianFirstName')}
                        size="md"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <TextInput
                        label={t('registration.field.guardianLastName')}
                        placeholder="გვარი"
                        {...form.getInputProps('guardianLastName')}
                        size="md"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                      <Select
                        label={t('registration.field.guardianGender')}
                        placeholder={t('registration.field.selectGender') || 'Select'}
                        data={[
                          { value: 'male', label: t('registration.gender.male') || 'Male' },
                          { value: 'female', label: t('registration.gender.female') || 'Female' },
                          { value: 'other', label: t('registration.gender.other') || 'Other' },
                        ]}
                        {...form.getInputProps('guardianGender')}
                        size="md"
                      />
                    </Grid.Col>
                  </Grid>

                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <EMRDatePicker
                        label={t('registration.field.guardianBirthDate')}
                        placeholder={t('registration.field.birthDatePlaceholder') || 'Select birth date'}
                        maxDate={new Date()}
                        {...form.getInputProps('guardianBirthDate')}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <InternationalPhoneInput
                        label={t('registration.field.guardianPhone')}
                        value={form.values.guardianPhone}
                        onChange={(value) => form.setFieldValue('guardianPhone', value)}
                        error={form.errors.guardianPhone as string}
                      />
                    </Grid.Col>
                  </Grid>

                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
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
                        size="md"
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label={t('registration.field.guardianAddress')}
                        placeholder={t('registration.field.addressPlaceholder') || 'Full address'}
                        {...form.getInputProps('guardianAddress')}
                        size="md"
                      />
                    </Grid.Col>
                  </Grid>
                </Stack>
              </CollapsibleSection>

            {/* Action Buttons */}
            <Grid mt="xl">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Button variant="outline" fullWidth onClick={onClose} disabled={submitting} size="md">
                  {t('registration.edit.cancel') || 'Cancel'}
                </Button>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Button
                  type="submit"
                  fullWidth
                  loading={submitting}
                  size="md"
                  style={{
                    background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
                  }}
                >
                  {t('registration.edit.save') || 'Save'}
                </Button>
              </Grid.Col>
            </Grid>
            </Stack>
        </form>
      )}
    </Modal>
  );
}
