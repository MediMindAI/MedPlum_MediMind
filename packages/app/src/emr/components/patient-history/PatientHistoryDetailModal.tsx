// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, Text, Box, Grid, Group, Button, Badge, Paper, ActionIcon, ThemeIcon, Tooltip } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from '../../hooks/useTranslation';
import { EMRTextInput, EMRSelect, EMRTextarea, EMRNumberInput, EMRSwitch, EMRDatePicker } from '../shared/EMRFormFields';
import type { Encounter, Patient } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getIdentifierValue } from '../../services/fhirHelpers';
import { IconX, IconUser, IconCalendar, IconClock, IconFileText, IconBuilding, IconShieldCheck, IconCash, IconMapPin, IconSchool, IconHome, IconBriefcase } from '@tabler/icons-react';

// Import data files
import ambulanceServicesData from '../../translations/ambulance-services.json';
import regionsDistrictsData from '../../translations/regions-districts.json';
import educationLevelsData from '../../translations/education-levels.json';
import familyStatusData from '../../translations/family-status.json';
import employmentStatusData from '../../translations/employment-status.json';
import insuranceCompaniesData from '../../translations/insurance-companies.json';
import insuranceTypesData from '../../translations/insurance-types.json';

interface PatientHistoryDetailModalProps {
  opened: boolean;
  onClose: () => void;
  encounterId: string | null;
  onSuccess: () => void;
}

interface VisitFormValues {
  // Section 1: Registration
  visitDate: Date | null;
  visitTime: string;
  admissionType: string;
  stationaryNumber: string;
  comment: string;
  patientType: string;
  referralType: string;
  ambulanceService: string;
  // Section 2: Demographics
  region: string;
  district: string;
  city: string;
  actualAddress: string;
  education: string;
  familyStatus: string;
  employment: string;
  // Section 3: Insurance
  insuranceEnabled: boolean;
  // Primary Insurer
  insuranceCompany1: string;
  insuranceType1: string;
  policyNumber1: string;
  referralNumber1: string;
  issueDate1: Date | null;
  validityDate1: Date | null;
  copayPercent1: number;
  // Secondary Insurer
  insuranceCompany2: string;
  insuranceType2: string;
  policyNumber2: string;
  referralNumber2: string;
  issueDate2: Date | null;
  validityDate2: Date | null;
  copayPercent2: number;
  // Tertiary Insurer
  insuranceCompany3: string;
  insuranceType3: string;
  policyNumber3: string;
  referralNumber3: string;
  issueDate3: Date | null;
  validityDate3: Date | null;
  copayPercent3: number;
  // Section 4: Guarantee
  directDeposit: boolean;
  virtualAdvance: boolean;
  guaranteeDonor: string;
  guaranteeAmount: string;
  guaranteeDate: Date | null;
  guaranteePeriod: Date | null;
  guaranteeNumber: string;
  guaranteeComment: string;
  caseNumber: string;
}

export function PatientHistoryDetailModal({
  opened,
  onClose,
  encounterId,
  onSuccess,
}: PatientHistoryDetailModalProps): React.ReactElement {
  const { lang } = useTranslation();
  const medplum = useMedplum();
  const [loading, setLoading] = useState(false);
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);

  const form = useForm<VisitFormValues>({
    initialValues: {
      visitDate: null,
      visitTime: '',
      admissionType: '',
      stationaryNumber: '',
      comment: '',
      patientType: '',
      referralType: '',
      ambulanceService: '1', // Default to 112
      region: '',
      district: '',
      city: '',
      actualAddress: '',
      education: '',
      familyStatus: '',
      employment: '',
      insuranceEnabled: true,
      insuranceCompany1: '',
      insuranceType1: '',
      policyNumber1: '',
      referralNumber1: '',
      issueDate1: null,
      validityDate1: null,
      copayPercent1: 100,
      insuranceCompany2: '',
      insuranceType2: '',
      policyNumber2: '',
      referralNumber2: '',
      issueDate2: null,
      validityDate2: null,
      copayPercent2: 0,
      insuranceCompany3: '',
      insuranceType3: '',
      policyNumber3: '',
      referralNumber3: '',
      issueDate3: null,
      validityDate3: null,
      copayPercent3: 0,
      // Section 4: Guarantee
      directDeposit: false,
      virtualAdvance: false,
      guaranteeDonor: '',
      guaranteeAmount: '',
      guaranteeDate: null,
      guaranteePeriod: null,
      guaranteeNumber: '',
      guaranteeComment: '',
      caseNumber: '',
    },
  });

  // Helper to extract nested extension values
  const getNestedExtension = (extensions: any[] | undefined, url: string) => {
    if (!extensions) {return undefined;}
    const ext = extensions.find((e: any) => e.url === url);
    if (!ext?.extension) {return undefined;}

    const result: Record<string, any> = {};
    for (const subExt of ext.extension) {
      result[subExt.url] = subExt.valueString || subExt.valueDateTime || subExt.valueDecimal || '';
    }
    return result;
  };

  // Fetch encounter and patient data when modal opens
  const fetchData = useCallback(async () => {
    if (!encounterId || !opened) {return;}

    setLoading(true);
    try {
      const enc = await medplum.readResource('Encounter', encounterId);
      setEncounter(enc);

      // Get patient from encounter subject
      let pat: Patient | null = null;
      const patientRef = enc.subject?.reference;
      if (patientRef) {
        const patientId = patientRef.split('/')[1];
        pat = await medplum.readResource('Patient', patientId);
        setPatient(pat);
      }

      // Load form with encounter data
      const visitDate = enc.period?.start ? new Date(enc.period.start) : null;
      const visitTime = visitDate ? visitDate.toTimeString().slice(0, 5) : '';

      // Extract admission type from class code (AMB/IMP/EMER -> 3/1/2)
      const classCodeMap: Record<string, string> = { AMB: '3', IMP: '1', EMER: '2' };
      const admissionType = classCodeMap[enc.class?.code || ''] || '';

      // Extract status-code and hospital-type from extensions
      const statusCodeExt = enc.extension?.find((e) => e.url === 'http://medimind.ge/fhir/StructureDefinition/status-code');
      const patientType = statusCodeExt?.valueString || '';

      const hospitalTypeExt = enc.extension?.find((e) => e.url === 'http://medimind.ge/fhir/StructureDefinition/hospital-type');
      const referralType = hospitalTypeExt?.valueString || '';

      // Extract insurance data from extensions
      const insurance1 = getNestedExtension(enc.extension, 'http://medimind.ge/fhir/StructureDefinition/insurance-1');
      const insurance2 = getNestedExtension(enc.extension, 'http://medimind.ge/fhir/StructureDefinition/insurance-2');
      const insurance3 = getNestedExtension(enc.extension, 'http://medimind.ge/fhir/StructureDefinition/insurance-3');

      const hasInsurance = !!(insurance1 || insurance2 || insurance3);

      // Extract demographics from Patient resource
      const region = pat?.address?.[0]?.state || '';
      const district = pat?.address?.[0]?.district || '';
      const city = pat?.address?.[0]?.city || '';
      const actualAddress = pat?.address?.[0]?.line?.join(', ') || '';

      const educationExt = pat?.extension?.find((e) => e.url === 'http://medimind.ge/fhir/StructureDefinition/education');
      const education = educationExt?.valueString || '';

      const familyStatusExt = pat?.extension?.find((e) => e.url === 'http://medimind.ge/fhir/StructureDefinition/family-status');
      const familyStatus = familyStatusExt?.valueString || '';

      const employmentExt = pat?.extension?.find((e) => e.url === 'http://medimind.ge/fhir/StructureDefinition/employment');
      const employment = employmentExt?.valueString || '';

      form.setValues({
        visitDate,
        visitTime,
        stationaryNumber:
          getIdentifierValue(enc, 'http://medimind.ge/identifiers/visit-registration') ||
          getIdentifierValue(enc, 'http://medimind.ge/identifiers/ambulatory-registration') ||
          '',
        comment: enc.text?.div || '',
        admissionType,
        patientType,
        referralType,
        ambulanceService: '1',
        region,
        district,
        city,
        actualAddress,
        education,
        familyStatus,
        employment,
        insuranceEnabled: hasInsurance,
        insuranceCompany1: insurance1?.company || '',
        insuranceType1: insurance1?.type || '',
        policyNumber1: insurance1?.['policy-number'] || '',
        referralNumber1: insurance1?.['referral-number'] || '',
        issueDate1: insurance1?.['issue-date'] ? new Date(insurance1['issue-date']) : null,
        validityDate1: insurance1?.['expiration-date'] ? new Date(insurance1['expiration-date']) : null,
        copayPercent1: insurance1?.['copay-percent'] ? parseFloat(insurance1['copay-percent']) : 0,
        insuranceCompany2: insurance2?.company || '',
        insuranceType2: insurance2?.type || '',
        policyNumber2: insurance2?.['policy-number'] || '',
        referralNumber2: insurance2?.['referral-number'] || '',
        issueDate2: insurance2?.['issue-date'] ? new Date(insurance2['issue-date']) : null,
        validityDate2: insurance2?.['expiration-date'] ? new Date(insurance2['expiration-date']) : null,
        copayPercent2: insurance2?.['copay-percent'] ? parseFloat(insurance2['copay-percent']) : 0,
        insuranceCompany3: insurance3?.company || '',
        insuranceType3: insurance3?.type || '',
        policyNumber3: insurance3?.['policy-number'] || '',
        referralNumber3: insurance3?.['referral-number'] || '',
        issueDate3: insurance3?.['issue-date'] ? new Date(insurance3['issue-date']) : null,
        validityDate3: insurance3?.['expiration-date'] ? new Date(insurance3['expiration-date']) : null,
        copayPercent3: insurance3?.['copay-percent'] ? parseFloat(insurance3['copay-percent']) : 0,
        // Section 4: Guarantee
        directDeposit: false,
        virtualAdvance: false,
        guaranteeDonor: '',
        guaranteeAmount: '',
        guaranteeDate: null,
        guaranteePeriod: null,
        guaranteeNumber: '',
        guaranteeComment: '',
        caseNumber: '',
      });
    } catch (error) {
      console.error('Error fetching encounter data:', error);
    } finally {
      setLoading(false);
    }
  }, [encounterId, opened, medplum]);

  // Load encounter data when modal opens
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get patient name
  const patientName = useMemo(() => {
    if (!patient?.name?.[0]) {return '';}
    const name = patient.name[0];
    return `${name.given?.join(' ') || ''} ${name.family || ''}`.trim();
  }, [patient]);

  // Get created by and creation date from encounter
  const createdBy = useMemo(() => {
    return encounter?.meta?.lastUpdated
      ? new Date(encounter.meta.lastUpdated).toLocaleString('en-GB', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      : '';
  }, [encounter]);

  // Helper function to get display text based on language
  const getDisplayText = (item: { displayKa: string; displayEn: string; displayRu: string }) => {
    if (lang === 'ka') {return item.displayKa;}
    if (lang === 'ru') {return item.displayRu;}
    return item.displayEn;
  };

  // Build dropdown options
  const ambulanceOptions = ambulanceServicesData.services.map((s) => ({
    value: s.value,
    label: getDisplayText(s),
  }));

  const regionOptions = regionsDistrictsData.regions.map((r) => ({
    value: r.value,
    label: getDisplayText(r),
  }));

  const districtOptions = useMemo(() => {
    const selectedRegion = form.values.region;
    if (!selectedRegion || !regionsDistrictsData.districts[selectedRegion as keyof typeof regionsDistrictsData.districts]) {
      return [];
    }
    return regionsDistrictsData.districts[selectedRegion as keyof typeof regionsDistrictsData.districts].map((d) => ({
      value: d.value,
      label: getDisplayText(d),
    }));
  }, [form.values.region, lang]);

  const educationOptions = educationLevelsData.levels.map((e) => ({
    value: e.value,
    label: getDisplayText(e),
  }));

  const familyStatusOptions = familyStatusData.statuses.map((s) => ({
    value: s.value,
    label: getDisplayText(s),
  }));

  const employmentOptions = employmentStatusData.statuses.map((s) => ({
    value: s.value,
    label: getDisplayText(s),
  }));

  const insuranceCompanyOptions = insuranceCompaniesData.companies.map((c) => ({
    value: c.code,
    label: getDisplayText(c),
  }));

  const insuranceTypeOptions = insuranceTypesData.types.map((t) => ({
    value: t.value,
    label: getDisplayText(t),
  }));

  const admissionTypeOptions = [
    { value: '3', label: lang === 'ka' ? 'ამბულატორიული' : lang === 'ru' ? 'Амбулаторный' : 'Ambulatory' },
    { value: '1', label: lang === 'ka' ? 'გეგმიური სტაციონარული' : lang === 'ru' ? 'Плановая госпитализация' : 'Planned Hospitalization' },
    { value: '2', label: lang === 'ka' ? 'გადაუდებელი სტაციონარული' : lang === 'ru' ? 'Экстренная госпитализация' : 'Emergency Hospitalization' },
  ];

  const patientTypeOptions = [
    { value: '', label: '-' },
    { value: '2', label: lang === 'ka' ? 'უფასო' : lang === 'ru' ? 'Бесплатно' : 'Free' },
    { value: '3', label: lang === 'ka' ? 'კვლევის პაციენტები' : lang === 'ru' ? 'Пациенты исследования' : 'Research Patients' },
    { value: '5', label: 'პროტოკოლი: R3767-ONC-2266' },
  ];

  const referralTypeOptions = [
    { value: '', label: '-' },
    { value: '1', label: lang === 'ka' ? 'თვითდინება' : lang === 'ru' ? 'Самообращение' : 'Self-referral' },
    { value: '2', label: lang === 'ka' ? 'სასწრაფო' : lang === 'ru' ? 'Скорая' : 'Emergency' },
    { value: '3', label: lang === 'ka' ? 'გადმოყვანილია კატასტროფით' : lang === 'ru' ? 'Переведен катастрофой' : 'Transferred by disaster medicine' },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Implement save logic
      console.log('Saving form values:', form.values);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving visit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="95%"
      centered
      title={null}
      overlayProps={{
        backgroundOpacity: 0.65,
        blur: 8,
      }}
      styles={{
        root: { zIndex: 1000 },
        overlay: { zIndex: 1000 },
        inner: { zIndex: 1000, paddingTop: '20px' },
        header: {
          display: 'none',
        },
        body: {
          padding: 0,
          maxHeight: 'calc(100vh - 60px)',
          overflowY: 'auto',
          backgroundColor: '#f8f9fa',
        },
        content: {
          borderRadius: '12px',
          border: 'none',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Premium Gradient Header */}
      <Box
        style={{
          background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
          padding: '20px 30px',
          position: 'relative',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap="lg">
            <ThemeIcon
              size={50}
              radius="xl"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <IconUser size={28} color="white" />
            </ThemeIcon>
            <Box>
              <Text
                size="xl"
                fw={700}
                c="white"
                style={{
                  fontSize: '28px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  letterSpacing: '-0.5px',
                }}
              >
                {patientName}
              </Text>
              <Group gap="xs" mt={4}>
                <Badge
                  size="sm"
                  variant="light"
                  color="white"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: 'none',
                  }}
                >
                  {form.values.stationaryNumber || 'N/A'}
                </Badge>
                <Badge
                  size="sm"
                  variant="light"
                  color="white"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: 'none',
                  }}
                >
                  <IconCalendar size={12} style={{ marginRight: 4 }} />
                  {form.values.visitDate?.toLocaleDateString('ka-GE') || '---'}
                </Badge>
              </Group>
            </Box>
          </Group>
          <Group gap="md">
            <Box style={{ textAlign: 'right' }}>
              <Text size="xs" c="rgba(255,255,255,0.8)" fw={500}>
                შეცვლის თარიღი
              </Text>
              <Text size="sm" c="white" fw={600}>
                {createdBy}
              </Text>
            </Box>
            <Tooltip label="დახურვა" position="bottom">
              <ActionIcon
                size="lg"
                radius="xl"
                variant="light"
                onClick={onClose}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <IconX size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Box>

      {/* Form Content */}
      <Box p="xl" style={{ backgroundColor: '#f8f9fa' }}>
        {/* Section 1: რეგისტრაცია */}
        <Paper
          shadow="sm"
          radius="lg"
          p="lg"
          mb="xl"
          style={{
            border: 'none',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative accent */}
          <Box
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)',
            }}
          />

          <Group gap="md" mb="lg" ml="md">
            <ThemeIcon
              size={36}
              radius="xl"
              style={{
                background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)',
              }}
            >
              <Text c="white" fw={700} size="sm">1</Text>
            </ThemeIcon>
            <Text
              fw={700}
              size="lg"
              style={{
                color: '#1a365d',
                letterSpacing: '-0.3px',
              }}
            >
              რეგისტრაცია
            </Text>
            <Badge color="blue" variant="light" size="sm">
              <IconCalendar size={12} style={{ marginRight: 4 }} />
              ვიზიტის დეტალები
            </Badge>
          </Group>

          <Grid gutter="lg" ml="md">
            <Grid.Col span={2}>
              <EMRTextInput
                label="თარიღი*"
                value={form.values.visitDate ? form.values.visitDate.toLocaleDateString('en-GB') + ' ' + form.values.visitTime : ''}
                onChange={() => {}}
                leftSection={<IconClock size={16} color="#6b7280" />}
                readOnly
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <EMRSelect
                label="შემოსვლის ტიპი*"
                data={admissionTypeOptions}
                {...form.getInputProps('admissionType')}
                searchable
                leftSection={<IconBuilding size={16} color="#6b7280" />}
              />
            </Grid.Col>
            <Grid.Col span={2}>
              <EMRTextInput
                label="სტაც. ნომერი"
                {...form.getInputProps('stationaryNumber')}
                leftSection={<IconFileText size={16} color="#6b7280" />}
                readOnly
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <EMRTextarea
                label="კომენტარი"
                {...form.getInputProps('comment')}
                minRows={2}
              />
            </Grid.Col>
            <Grid.Col span={2}>
              <EMRSelect
                label="ტიპი"
                data={patientTypeOptions}
                {...form.getInputProps('patientType')}
              />
            </Grid.Col>
          </Grid>
          <Grid gutter="lg" mt="md" ml="md">
            <Grid.Col span={4}>
              <EMRSelect
                label="მომართვის ტიპი"
                data={referralTypeOptions}
                {...form.getInputProps('referralType')}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <EMRSelect
                label="მომყვანი"
                data={ambulanceOptions}
                {...form.getInputProps('ambulanceService')}
                searchable
              />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Section 2: დემოგრაფია */}
        <Paper
          shadow="sm"
          radius="lg"
          p="lg"
          mb="xl"
          style={{
            border: 'none',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              background: 'linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%)',
            }}
          />

          <Group gap="md" mb="lg" ml="md">
            <ThemeIcon
              size={36}
              radius="xl"
              style={{
                background: 'linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%)',
              }}
            >
              <Text c="white" fw={700} size="sm">2</Text>
            </ThemeIcon>
            <Text fw={700} size="lg" style={{ color: '#2b6cb0', letterSpacing: '-0.3px' }}>
              დემოგრაფია
            </Text>
            <Badge color="blue" variant="light" size="sm">
              <IconMapPin size={12} style={{ marginRight: 4 }} />
              მისამართი & სტატუსი
            </Badge>
          </Group>

          <Grid gutter="lg" ml="md">
            <Grid.Col span={2}>
              <EMRSelect
                label="რეგიონი"
                data={regionOptions}
                {...form.getInputProps('region')}
                searchable
                leftSection={<IconMapPin size={16} color="#6b7280" />}
                onChange={(value) => {
                  form.setFieldValue('region', value || '');
                  form.setFieldValue('district', '');
                }}
              />
            </Grid.Col>
            <Grid.Col span={2}>
              <EMRSelect
                label="რაიონი"
                data={districtOptions}
                {...form.getInputProps('district')}
                searchable
                disabled={!form.values.region}
              />
            </Grid.Col>
            <Grid.Col span={2}>
              <EMRTextInput
                label="ქალაქი"
                {...form.getInputProps('city')}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <EMRTextInput
                label="ფაქტიური მისამართი"
                {...form.getInputProps('actualAddress')}
                leftSection={<IconHome size={16} color="#6b7280" />}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <EMRSelect
                label="განათლება"
                data={educationOptions}
                {...form.getInputProps('education')}
                leftSection={<IconSchool size={16} color="#6b7280" />}
              />
            </Grid.Col>
          </Grid>
          <Grid gutter="lg" mt="md" ml="md">
            <Grid.Col span={4}>
              <EMRSelect
                label="ოჯახური მდგომარეობა"
                data={familyStatusOptions}
                {...form.getInputProps('familyStatus')}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <EMRSelect
                label="დასაქმება"
                data={employmentOptions}
                {...form.getInputProps('employment')}
                leftSection={<IconBriefcase size={16} color="#6b7280" />}
              />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Section 3: დაზღვევა */}
        <Paper
          shadow="sm"
          radius="lg"
          p="lg"
          mb="xl"
          style={{
            border: 'none',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              background: 'linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%)',
            }}
          />

          <Group gap="md" mb="lg" ml="md" justify="space-between">
            <Group gap="md">
              <ThemeIcon
                size={36}
                radius="xl"
                style={{
                  background: 'linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%)',
                }}
              >
                <Text c="white" fw={700} size="sm">3</Text>
              </ThemeIcon>
              <Text fw={700} size="lg" style={{ color: '#2b6cb0', letterSpacing: '-0.3px' }}>
                დაზღვევა
              </Text>
              <Badge color="blue" variant="light" size="sm">
                <IconShieldCheck size={12} style={{ marginRight: 4 }} />
                სადაზღვევო პოლისები
              </Badge>
            </Group>
            <EMRSwitch
              checked={form.values.insuranceEnabled}
              onChange={(checked) => form.setFieldValue('insuranceEnabled', checked)}
              label={form.values.insuranceEnabled ? 'აქტიური' : 'გამორთული'}
            />
          </Group>

          {form.values.insuranceEnabled && (
            <Box ml="md">
              {/* Primary Insurer */}
              <Paper p="md" radius="md" mb="lg" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e5e7eb' }}>
                <Group gap="xs" mb="md">
                  <Badge size="lg" color="blue" variant="filled">1</Badge>
                  <Text fw={600} size="md" c="#1a365d">პირველი მზღვეველი</Text>
                </Group>
              <Grid gutter="md">
                <Grid.Col span={3}>
                  <EMRSelect
                    label="კომპანია"
                    data={insuranceCompanyOptions}
                    {...form.getInputProps('insuranceCompany1')}
                    searchable
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <EMRSelect
                    label="ტიპი"
                    data={insuranceTypeOptions}
                    {...form.getInputProps('insuranceType1')}
                    searchable
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <EMRTextInput
                    label="პოლისის #"
                    {...form.getInputProps('policyNumber1')}
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <EMRTextInput
                    label="მიმართვის #"
                    {...form.getInputProps('referralNumber1')}
                  />
                </Grid.Col>
              </Grid>
              <Grid gutter="md" mt="sm">
                <Grid.Col span={3}>
                  <EMRDatePicker
                    label="გაცემის თარიღი"
                    {...form.getInputProps('issueDate1')}
                  />
                </Grid.Col>
                <Grid.Col span={3}>
                  <EMRDatePicker
                    label="მოქმედების ვადა"
                    {...form.getInputProps('validityDate1')}
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <EMRNumberInput
                    label="თანაგადახდის %"
                    {...form.getInputProps('copayPercent1')}
                    min={0}
                    max={100}
                  />
                </Grid.Col>
              </Grid>
              </Paper>

              {/* Secondary Insurer */}
              <Paper p="md" radius="md" mb="lg" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e5e7eb' }}>
                <Group gap="xs" mb="md">
                  <Badge size="lg" color="blue" variant="filled">2</Badge>
                  <Text fw={600} size="md" c="#2b6cb0">მეორე მზღვეველი</Text>
                </Group>
              <Grid gutter="md">
                <Grid.Col span={3}>
                  <EMRSelect
                    label="კომპანია"
                    data={insuranceCompanyOptions}
                    {...form.getInputProps('insuranceCompany2')}
                    searchable
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <EMRSelect
                    label="ტიპი"
                    data={insuranceTypeOptions}
                    {...form.getInputProps('insuranceType2')}
                    searchable
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <EMRTextInput
                    label="პოლისის #"
                    {...form.getInputProps('policyNumber2')}
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <EMRTextInput
                    label="მიმართვის #"
                    {...form.getInputProps('referralNumber2')}
                  />
                </Grid.Col>
              </Grid>
              <Grid gutter="md" mt="sm">
                <Grid.Col span={3}>
                  <EMRDatePicker
                    label="გაცემის თარიღი"
                    {...form.getInputProps('issueDate2')}
                  />
                </Grid.Col>
                <Grid.Col span={3}>
                  <EMRDatePicker
                    label="მოქმედების ვადა"
                    {...form.getInputProps('validityDate2')}
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <EMRNumberInput
                    label="თანაგადახდის %"
                    {...form.getInputProps('copayPercent2')}
                    min={0}
                    max={100}
                  />
                </Grid.Col>
              </Grid>
              </Paper>

              {/* Tertiary Insurer */}
              <Paper p="md" radius="md" mb="lg" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e5e7eb' }}>
                <Group gap="xs" mb="md">
                  <Badge size="lg" color="grape" variant="filled">3</Badge>
                  <Text fw={600} size="md" c="#7c3aed">მესამე მზღვეველი</Text>
                </Group>
              <Grid gutter="md">
                <Grid.Col span={3}>
                  <EMRSelect
                    label="კომპანია"
                    data={insuranceCompanyOptions}
                    {...form.getInputProps('insuranceCompany3')}
                    searchable
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <EMRSelect
                    label="ტიპი"
                    data={insuranceTypeOptions}
                    {...form.getInputProps('insuranceType3')}
                    searchable
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <EMRTextInput
                    label="პოლისის #"
                    {...form.getInputProps('policyNumber3')}
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <EMRTextInput
                    label="მიმართვის #"
                    {...form.getInputProps('referralNumber3')}
                  />
                </Grid.Col>
              </Grid>
              <Grid gutter="md" mt="sm">
                <Grid.Col span={3}>
                  <EMRDatePicker
                    label="გაცემის თარიღი"
                    {...form.getInputProps('issueDate3')}
                  />
                </Grid.Col>
                <Grid.Col span={3}>
                  <EMRDatePicker
                    label="მოქმედების ვადა"
                    {...form.getInputProps('validityDate3')}
                  />
                </Grid.Col>
                <Grid.Col span={2}>
                  <EMRNumberInput
                    label="თანაგადახდის %"
                    {...form.getInputProps('copayPercent3')}
                    min={0}
                    max={100}
                  />
                </Grid.Col>
              </Grid>
              </Paper>
            </Box>
          )}
        </Paper>

        {/* Section 4: საგარანტიო (Guarantee) */}
        <Paper
          shadow="sm"
          radius="lg"
          p="lg"
          mb="xl"
          style={{
            border: 'none',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              background: 'linear-gradient(135deg, #3182ce 0%, #63b3ed 100%)',
            }}
          />

          <Group gap="md" mb="lg" ml="md">
            <ThemeIcon
              size={36}
              radius="xl"
              style={{
                background: 'linear-gradient(135deg, #3182ce 0%, #63b3ed 100%)',
              }}
            >
              <Text c="white" fw={700} size="sm">4</Text>
            </ThemeIcon>
            <Text fw={700} size="lg" style={{ color: '#3182ce', letterSpacing: '-0.3px' }}>
              საგარანტიო
            </Text>
            <Badge color="blue" variant="light" size="sm">
              <IconCash size={12} style={{ marginRight: 4 }} />
              გარანტიის წერილი
            </Badge>
          </Group>

          <Box ml="md">
            {/* Toggle Switches */}
            <Group gap="xl" mb="lg">
              <EMRSwitch
                checked={form.values.directDeposit}
                onChange={(checked) => form.setFieldValue('directDeposit', checked)}
                label="პირდაპირი ჩარიცხვა"
              />
              <EMRSwitch
                checked={form.values.virtualAdvance}
                onChange={(checked) => form.setFieldValue('virtualAdvance', checked)}
                label="ვირტუალურ ავანსად დაკვება"
              />
            </Group>

            {/* Main Fields */}
            <Grid gutter="lg">
              <Grid.Col span={2}>
                <EMRTextInput
                  label="დონორი"
                  {...form.getInputProps('guaranteeDonor')}
                />
              </Grid.Col>
              <Grid.Col span={2}>
                <EMRTextInput
                  label="თანხა"
                  {...form.getInputProps('guaranteeAmount')}
                  leftSection={<Text size="sm" c="#6b7280">₾</Text>}
                />
              </Grid.Col>
              <Grid.Col span={2}>
                <EMRDatePicker
                  label="თარიღი"
                  {...form.getInputProps('guaranteeDate')}
                />
              </Grid.Col>
              <Grid.Col span={2}>
                <EMRDatePicker
                  label="ვადა"
                  {...form.getInputProps('guaranteePeriod')}
                />
              </Grid.Col>
              <Grid.Col span={2}>
                <EMRTextInput
                  label="ნომერი"
                  {...form.getInputProps('guaranteeNumber')}
                />
              </Grid.Col>
              <Grid.Col span={2}>
                <EMRTextInput
                  label="კომენტარი"
                  {...form.getInputProps('guaranteeComment')}
                />
              </Grid.Col>
            </Grid>

            {/* Case Number */}
            <Grid gutter="lg" mt="lg">
              <Grid.Col span={4}>
                <EMRTextInput
                  label="შემთხვევის #"
                  {...form.getInputProps('caseNumber')}
                />
              </Grid.Col>
            </Grid>
          </Box>
        </Paper>

        {/* Sticky Footer with Actions */}
        <Paper
          shadow="lg"
          radius="lg"
          p="md"
          style={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'white',
            borderTop: '1px solid #e5e7eb',
            marginTop: '20px',
          }}
        >
          <Group justify="flex-end" gap="md">
            <Button
              variant="outline"
              color="gray"
              size="md"
              radius="md"
              onClick={onClose}
              style={{
                borderColor: '#d1d5db',
                color: '#4b5563',
                fontWeight: 600,
              }}
            >
              გაუქმება
            </Button>
            <Button
              onClick={handleSave}
              loading={loading}
              size="md"
              radius="md"
              style={{
                background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
                border: 'none',
                fontWeight: 600,
                paddingLeft: '24px',
                paddingRight: '24px',
                boxShadow: '0 4px 6px -1px rgba(26, 54, 93, 0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 10px -1px rgba(26, 54, 93, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(26, 54, 93, 0.3)';
              }}
            >
              შენახვა
            </Button>
          </Group>
        </Paper>
      </Box>
    </Modal>
  );
}
