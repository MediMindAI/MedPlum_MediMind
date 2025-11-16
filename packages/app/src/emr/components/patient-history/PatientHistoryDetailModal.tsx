// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Modal,
  Text,
  Group,
  Button,
  TextInput,
  Select,
  NumberInput,
  Paper,
  Tabs,
  Stack,
  LoadingOverlay,
  Checkbox,
  Textarea,
  Badge,
  ScrollArea,
  Divider,
} from '@mantine/core';
import { DateTimePicker, DateInput } from '@mantine/dates';
import { IconPlus } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { usePatientHistoryDetail } from '../../hooks/usePatientHistoryDetail';
import { InsuranceSelect } from './InsuranceSelect';

interface PatientHistoryDetailModalProps {
  opened: boolean;
  onClose: () => void;
  encounterId: string | null;
  onSuccess: () => void;
}

/**
 * Patient History Detail Modal
 *
 * Opens when clicking a patient row in the history table.
 * 4 sections: Registration, Insurance (expandable), Guarantee, Demographics (read-only)
 */
export function PatientHistoryDetailModal({
  opened,
  onClose,
  encounterId,
  onSuccess,
}: PatientHistoryDetailModalProps): JSX.Element {
  const { t } = useTranslation();
  const {
    form,
    loading,
    initialLoading,
    patientData,
    handleSave,
    handleCancel,
    addInsurer,
    copyDemographicsFromPatient,
  } = usePatientHistoryDetail(encounterId, onSuccess, onClose);

  // Get patient display name
  const patientName = patientData.patient
    ? `${patientData.patient.name?.[0]?.given?.join(' ') || ''} ${patientData.patient.name?.[0]?.family || ''}`
    : '';

  // Visit type translation
  const visitTypeLabel =
    patientData.visitType === 'stationary'
      ? t('patientHistory.detail.stationary')
      : patientData.visitType === 'emergency'
        ? t('patientHistory.detail.emergency')
        : t('patientHistory.detail.ambulatory');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group gap="md">
          <Text fw={700} size="lg">
            {patientName}
          </Text>
          <Badge color="cyan" size="lg">
            {t('patientHistory.detail.visits')}: {patientData.visitCount}/{patientData.totalVisits} ({visitTypeLabel})
          </Badge>
        </Group>
      }
      styles={{
        header: {
          borderBottom: '1px solid #e9ecef',
          paddingBottom: 10,
        },
      }}
    >
      <LoadingOverlay visible={initialLoading} />

      <ScrollArea h={550}>
        <form onSubmit={form.onSubmit(handleSave)}>
          {/* Section 1: Registration */}
          <Paper p="md" mb="md" style={{ backgroundColor: '#f8f9fa' }}>
            <Text fw={600} mb="sm" c="blue">
              1 {t('patientHistory.detail.registration')}
            </Text>
            <Stack gap="sm">
              <Group grow>
                <DateTimePicker
                  label={`${t('patientHistory.detail.visitDate')}*`}
                  required
                  {...form.getInputProps('visitDate')}
                />
                <Select
                  label={`${t('patientHistory.detail.admissionType')}*`}
                  required
                  data={[
                    { value: 'ambulatory', label: t('patientHistory.detail.ambulatory') },
                    { value: 'stationary', label: t('patientHistory.detail.stationary') },
                    { value: 'emergency', label: t('patientHistory.detail.emergency') },
                  ]}
                  {...form.getInputProps('admissionType')}
                />
              </Group>
              <Group grow>
                <Select
                  label={t('patientHistory.detail.status')}
                  data={[
                    { value: 'planned', label: t('patientHistory.detail.statusPlanned') },
                    { value: 'arrived', label: t('patientHistory.detail.statusArrived') },
                    { value: 'in-progress', label: t('patientHistory.detail.statusInProgress') },
                    { value: 'finished', label: t('patientHistory.detail.statusFinished') },
                  ]}
                  {...form.getInputProps('status')}
                />
                <Select
                  label={`${t('patientHistory.detail.department')}*`}
                  required
                  data={[
                    { value: 'planned-ambulatory', label: t('patientHistory.detail.plannedAmbulatory') },
                    { value: 'therapy', label: t('patientHistory.detail.therapy') },
                    { value: 'surgery', label: t('patientHistory.detail.surgery') },
                    { value: 'pediatrics', label: t('patientHistory.detail.pediatrics') },
                    { value: 'cardiology', label: t('patientHistory.detail.cardiology') },
                  ]}
                  searchable
                  {...form.getInputProps('department')}
                />
              </Group>
              <Group grow>
                <Select
                  label={t('patientHistory.detail.hospitalType')}
                  data={[
                    { value: 'day', label: t('patientHistory.detail.dayHospital') },
                    { value: 'full', label: t('patientHistory.detail.fullHospital') },
                    { value: 'intensive', label: t('patientHistory.detail.intensiveCare') },
                  ]}
                  {...form.getInputProps('hospitalType')}
                />
                <div />
              </Group>
              <Textarea
                label={t('patientHistory.detail.comment')}
                placeholder={t('patientHistory.detail.commentPlaceholder')}
                rows={3}
                {...form.getInputProps('comment')}
              />
            </Stack>
          </Paper>

          {/* Section 2: Insurance */}
          <Paper p="md" mb="md" style={{ backgroundColor: '#f8f9fa' }}>
            <Group justify="space-between" mb="sm">
              <Text fw={600} c="blue">
                2 {t('patientHistory.detail.insurance')}
              </Text>
              <Checkbox
                label={t('patientHistory.detail.enableInsurance')}
                {...form.getInputProps('insuranceEnabled', { type: 'checkbox' })}
              />
            </Group>

            {form.values.insuranceEnabled && (
              <Stack gap="md">
                {/* Primary Insurer */}
                <Paper withBorder p="sm">
                  <Text fw={500} mb="sm">
                    {t('patientHistory.detail.primaryInsurer')}
                  </Text>
                  <Stack gap="sm">
                    <Group grow>
                      <InsuranceSelect
                        label={t('patientHistory.detail.company')}
                        {...form.getInputProps('insuranceCompany')}
                      />
                      <Select
                        label={t('patientHistory.detail.insuranceType')}
                        data={[
                          { value: 'state', label: t('patientHistory.detail.stateInsurance') },
                          { value: 'private', label: t('patientHistory.detail.privateInsurance') },
                          { value: 'corporate', label: t('patientHistory.detail.corporateInsurance') },
                        ]}
                        {...form.getInputProps('insuranceType')}
                      />
                    </Group>
                    <Group grow>
                      <TextInput
                        label={`${t('patientHistory.detail.policyNumber')} #`}
                        {...form.getInputProps('policyNumber')}
                      />
                      <TextInput
                        label={`${t('patientHistory.detail.referralNumber')} #`}
                        {...form.getInputProps('referralNumber')}
                      />
                    </Group>
                    <Group grow>
                      <DateInput
                        label={t('patientHistory.detail.issueDate')}
                        clearable
                        {...form.getInputProps('issueDate')}
                      />
                      <DateInput
                        label={t('patientHistory.detail.expirationDate')}
                        clearable
                        {...form.getInputProps('expirationDate')}
                      />
                      <NumberInput
                        label={`${t('patientHistory.detail.copayPercent')} %`}
                        min={0}
                        max={100}
                        {...form.getInputProps('copayPercent')}
                      />
                    </Group>
                  </Stack>
                </Paper>

                {/* Secondary Insurer */}
                {form.values.insurerCount >= 2 && (
                  <Paper withBorder p="sm">
                    <Text fw={500} mb="sm">
                      {t('patientHistory.detail.secondaryInsurer')}
                    </Text>
                    <Stack gap="sm">
                      <Group grow>
                        <InsuranceSelect
                          label={t('patientHistory.detail.company')}
                          {...form.getInputProps('insuranceCompany2')}
                        />
                        <Select
                          label={t('patientHistory.detail.insuranceType')}
                          data={[
                            { value: 'state', label: t('patientHistory.detail.stateInsurance') },
                            { value: 'private', label: t('patientHistory.detail.privateInsurance') },
                            { value: 'corporate', label: t('patientHistory.detail.corporateInsurance') },
                          ]}
                          {...form.getInputProps('insuranceType2')}
                        />
                      </Group>
                      <Group grow>
                        <TextInput
                          label={`${t('patientHistory.detail.policyNumber')} #`}
                          {...form.getInputProps('policyNumber2')}
                        />
                        <TextInput
                          label={`${t('patientHistory.detail.referralNumber')} #`}
                          {...form.getInputProps('referralNumber2')}
                        />
                      </Group>
                      <Group grow>
                        <DateInput
                          label={t('patientHistory.detail.issueDate')}
                          clearable
                          {...form.getInputProps('issueDate2')}
                        />
                        <DateInput
                          label={t('patientHistory.detail.expirationDate')}
                          clearable
                          {...form.getInputProps('expirationDate2')}
                        />
                        <NumberInput
                          label={`${t('patientHistory.detail.copayPercent')} %`}
                          min={0}
                          max={100}
                          {...form.getInputProps('copayPercent2')}
                        />
                      </Group>
                    </Stack>
                  </Paper>
                )}

                {/* Tertiary Insurer */}
                {form.values.insurerCount >= 3 && (
                  <Paper withBorder p="sm">
                    <Text fw={500} mb="sm">
                      {t('patientHistory.detail.tertiaryInsurer')}
                    </Text>
                    <Stack gap="sm">
                      <Group grow>
                        <InsuranceSelect
                          label={t('patientHistory.detail.company')}
                          {...form.getInputProps('insuranceCompany3')}
                        />
                        <Select
                          label={t('patientHistory.detail.insuranceType')}
                          data={[
                            { value: 'state', label: t('patientHistory.detail.stateInsurance') },
                            { value: 'private', label: t('patientHistory.detail.privateInsurance') },
                            { value: 'corporate', label: t('patientHistory.detail.corporateInsurance') },
                          ]}
                          {...form.getInputProps('insuranceType3')}
                        />
                      </Group>
                      <Group grow>
                        <TextInput
                          label={`${t('patientHistory.detail.policyNumber')} #`}
                          {...form.getInputProps('policyNumber3')}
                        />
                        <TextInput
                          label={`${t('patientHistory.detail.referralNumber')} #`}
                          {...form.getInputProps('referralNumber3')}
                        />
                      </Group>
                      <Group grow>
                        <DateInput
                          label={t('patientHistory.detail.issueDate')}
                          clearable
                          {...form.getInputProps('issueDate3')}
                        />
                        <DateInput
                          label={t('patientHistory.detail.expirationDate')}
                          clearable
                          {...form.getInputProps('expirationDate3')}
                        />
                        <NumberInput
                          label={`${t('patientHistory.detail.copayPercent')} %`}
                          min={0}
                          max={100}
                          {...form.getInputProps('copayPercent3')}
                        />
                      </Group>
                    </Stack>
                  </Paper>
                )}

                {/* Add Insurer Button */}
                {form.values.insurerCount < 3 && (
                  <Button
                    variant="subtle"
                    leftSection={<IconPlus size={16} />}
                    onClick={addInsurer}
                    size="sm"
                  >
                    {t('patientHistory.detail.addInsurer')}
                  </Button>
                )}
              </Stack>
            )}
          </Paper>

          {/* Section 3: Guarantee */}
          <Paper p="md" mb="md" style={{ backgroundColor: '#f8f9fa' }}>
            <Group justify="space-between" mb="sm">
              <Text fw={600} c="blue">
                3 {t('patientHistory.detail.guarantee')}
              </Text>
              <Button variant="subtle" size="xs" leftSection={<IconPlus size={14} />}>
                {t('patientHistory.detail.add')}
              </Button>
            </Group>
            <Textarea
              placeholder={t('patientHistory.detail.guaranteePlaceholder')}
              rows={3}
              {...form.getInputProps('guaranteeText')}
            />
          </Paper>

          {/* Section 4: Demographics */}
          <Paper p="md" mb="md" style={{ backgroundColor: '#f8f9fa' }}>
            <Tabs defaultValue="demographics">
              <Tabs.List>
                <Tabs.Tab value="demographics">
                  <Text fw={600} c="blue">
                    4 {t('patientHistory.detail.demographics')}
                  </Text>
                </Tabs.Tab>
                <Tabs.Tab value="copy">{t('patientHistory.detail.copy')}</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="demographics" pt="md">
                <Stack gap="sm">
                  <Group grow>
                    <Select
                      label={t('patientHistory.detail.region')}
                      disabled
                      data={[]}
                      value={form.values.region}
                    />
                    <Select
                      label={t('patientHistory.detail.district')}
                      disabled
                      data={[]}
                      value={form.values.district}
                    />
                  </Group>
                  <Group grow>
                    <TextInput
                      label={t('patientHistory.detail.city')}
                      disabled
                      {...form.getInputProps('city')}
                    />
                    <TextInput
                      label={t('patientHistory.detail.actualAddress')}
                      disabled
                      {...form.getInputProps('actualAddress')}
                    />
                  </Group>
                  <Group grow>
                    <Select
                      label={t('patientHistory.detail.education')}
                      disabled
                      data={[]}
                      value={form.values.education}
                    />
                    <Select
                      label={t('patientHistory.detail.familyStatus')}
                      disabled
                      data={[]}
                      value={form.values.familyStatus}
                    />
                  </Group>
                  <Group grow>
                    <Select
                      label={t('patientHistory.detail.employment')}
                      disabled
                      data={[]}
                      value={form.values.employment}
                    />
                    <div />
                  </Group>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="copy" pt="md">
                <Stack gap="md" align="center">
                  <Text c="dimmed" size="sm">
                    {t('patientHistory.detail.copyDescription')}
                  </Text>
                  <Button onClick={copyDemographicsFromPatient} variant="light">
                    {t('patientHistory.detail.copyFromPatient')}
                  </Button>
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Paper>

          <Divider my="md" />

          {/* Action Buttons */}
          <Group justify="flex-end">
            <Button variant="default" onClick={handleCancel} disabled={loading}>
              {t('patientHistory.detail.cancel')}
            </Button>
            <Button
              type="submit"
              loading={loading}
              style={{ background: 'var(--emr-gradient-primary)' }}
            >
              {t('patientHistory.detail.save')}
            </Button>
          </Group>
        </form>
      </ScrollArea>
    </Modal>
  );
}
