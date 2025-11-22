// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, Text, Group, Button, TextInput, Select, NumberInput, Paper, Tabs, Stack, LoadingOverlay } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import type { JSX } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useVisitEdit } from '../../hooks/useVisitEdit';
import { InsuranceSelect } from './InsuranceSelect';

interface VisitEditModalProps {
  opened: boolean;
  onClose: () => void;
  visitId: string | null;
  onSuccess: () => void;
}

/**
 * Visit edit modal with 134-field form organized in 3 sections:
 * 1. Registration (14 fields)
 * 2. Demographics (8 READ-ONLY fields)
 * 3. Insurance I, II, III (3 tabs × 7 fields each = 21 fields)
 * Total: 14 + 8 + 21 + 21 + 21 + 49 financial fields = 134 fields
 * @param root0
 * @param root0.opened
 * @param root0.onClose
 * @param root0.visitId
 * @param root0.onSuccess
 */
export function VisitEditModal({
  opened,
  onClose,
  visitId,
  onSuccess,
}: VisitEditModalProps): JSX.Element {
  const { t } = useTranslation();
  const { form, loading, initialLoading, handleSave, handleCancel } = useVisitEdit(
    visitId,
    onSuccess,
    onClose
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={t('patientHistory.edit.title')}
    >
      <LoadingOverlay visible={initialLoading} />

      <form onSubmit={form.onSubmit(handleSave)}>
        {/* Registration Section - 14 fields */}
        <Paper p="md" mb="md" style={{ backgroundColor: '#f8f9fa' }}>
          <Text fw={600} mb="sm">{t('patientHistory.edit.registration')}</Text>
          <Stack gap="sm">
            <Group grow>
              <DateInput
                label={t('patientHistory.edit.visitDate')}
                required
                {...form.getInputProps('visitDate')}
              />
              <Select
                label={t('patientHistory.edit.registrationType')}
                required
                data={[
                  { value: 'IMP', label: t('patientHistory.edit.inpatient') },
                  { value: 'AMB', label: t('patientHistory.edit.ambulatory') },
                  { value: 'EMER', label: t('patientHistory.edit.emergency') },
                ]}
                {...form.getInputProps('registrationType')}
              />
            </Group>
            <Group grow>
              <TextInput
                label={t('patientHistory.edit.stationaryNumber')}
                placeholder="10357-2025"
                {...form.getInputProps('stationaryNumber')}
              />
              <TextInput
                label={t('patientHistory.edit.ambulatoryNumber')}
                placeholder="a-6871-2025"
                {...form.getInputProps('ambulatoryNumber')}
              />
            </Group>
            <Group grow>
              <Select
                label={t('patientHistory.edit.statusType')}
                data={[
                  { value: 'planned', label: t('patientHistory.edit.planned') },
                  { value: 'arrived', label: t('patientHistory.edit.arrived') },
                  { value: 'in-progress', label: t('patientHistory.edit.inProgress') },
                  { value: 'finished', label: t('patientHistory.edit.finished') },
                ]}
                {...form.getInputProps('statusType')}
              />
              <TextInput
                label={t('patientHistory.edit.referrer')}
                {...form.getInputProps('referrer')}
              />
            </Group>
            <Group grow>
              <TextInput
                label={t('patientHistory.edit.visitPurpose')}
                {...form.getInputProps('visitPurpose')}
              />
              <Select
                label={t('patientHistory.edit.admissionType')}
                data={[
                  { value: 'routine', label: t('patientHistory.edit.routine') },
                  { value: 'emergency', label: t('patientHistory.edit.emergency') },
                ]}
                {...form.getInputProps('admissionType')}
              />
            </Group>
            <Group grow>
              <Select
                label={t('patientHistory.edit.dischargeType')}
                data={[
                  { value: 'home', label: t('patientHistory.edit.home') },
                  { value: 'transfer', label: t('patientHistory.edit.transfer') },
                ]}
                {...form.getInputProps('dischargeType')}
              />
              <DateInput
                label={t('patientHistory.edit.dischargeDate')}
                {...form.getInputProps('dischargeDate')}
                clearable
              />
            </Group>
            <Group grow>
              <TextInput
                label={t('patientHistory.edit.attendingDoctor')}
                {...form.getInputProps('attendingDoctor')}
              />
              <TextInput
                label={t('patientHistory.edit.department')}
                {...form.getInputProps('department')}
              />
            </Group>
            <Group grow>
              <TextInput
                label={t('patientHistory.edit.room')}
                {...form.getInputProps('room')}
              />
              <TextInput
                label={t('patientHistory.edit.bed')}
                {...form.getInputProps('bed')}
              />
            </Group>
          </Stack>
        </Paper>

        {/* Demographics Section - 8 READ-ONLY fields */}
        <Paper p="md" mb="md" style={{ backgroundColor: '#f8f9fa' }}>
          <Text fw={600} mb="sm">{t('patientHistory.edit.demographics')}</Text>
          <Stack gap="sm">
            <Group grow>
              <TextInput
                label={t('patientHistory.edit.region')}
                disabled
                {...form.getInputProps('region')}
              />
              <TextInput
                label={t('patientHistory.edit.district')}
                disabled
                {...form.getInputProps('district')}
              />
            </Group>
            <Group grow>
              <TextInput
                label={t('patientHistory.edit.city')}
                disabled
                {...form.getInputProps('city')}
              />
              <TextInput
                label={t('patientHistory.edit.address')}
                disabled
                {...form.getInputProps('address')}
              />
            </Group>
            <Group grow>
              <TextInput
                label={t('patientHistory.edit.education')}
                disabled
                {...form.getInputProps('education')}
              />
              <TextInput
                label={t('patientHistory.edit.familyStatus')}
                disabled
                {...form.getInputProps('familyStatus')}
              />
            </Group>
            <Group grow>
              <TextInput
                label={t('patientHistory.edit.employment')}
                disabled
                {...form.getInputProps('employment')}
              />
              <TextInput
                label={t('patientHistory.edit.workplace')}
                disabled
                {...form.getInputProps('workplace')}
              />
            </Group>
          </Stack>
        </Paper>

        {/* Insurance Tabs - 3 tabs × 7 fields each = 21 fields per tab */}
        <Tabs defaultValue="insurance1">
          <Tabs.List>
            <Tabs.Tab value="insurance1">{t('patientHistory.edit.insurance1')}</Tabs.Tab>
            <Tabs.Tab value="insurance2">{t('patientHistory.edit.insurance2')}</Tabs.Tab>
            <Tabs.Tab value="insurance3">{t('patientHistory.edit.insurance3')}</Tabs.Tab>
          </Tabs.List>

          {/* Insurance I - Primary (7 fields) */}
          <Tabs.Panel value="insurance1" pt="md">
            <Stack gap="sm">
              <InsuranceSelect
                label={t('patientHistory.edit.insuranceCompany')}
                {...form.getInputProps('insuranceCompany')}
              />
              <Group grow>
                <TextInput
                  label={t('patientHistory.edit.insuranceType')}
                  {...form.getInputProps('insuranceType')}
                />
                <TextInput
                  label={t('patientHistory.edit.policyNumber')}
                  {...form.getInputProps('policyNumber')}
                />
              </Group>
              <Group grow>
                <TextInput
                  label={t('patientHistory.edit.referralNumber')}
                  {...form.getInputProps('referralNumber')}
                />
                <NumberInput
                  label={t('patientHistory.edit.copayPercent')}
                  min={0}
                  max={100}
                  suffix="%"
                  {...form.getInputProps('copayPercent')}
                />
              </Group>
              <Group grow>
                <DateInput
                  label={t('patientHistory.edit.issueDate')}
                  {...form.getInputProps('issueDate')}
                  clearable
                />
                <DateInput
                  label={t('patientHistory.edit.expirationDate')}
                  {...form.getInputProps('expirationDate')}
                  clearable
                />
              </Group>
            </Stack>
          </Tabs.Panel>

          {/* Insurance II - Secondary (7 fields) */}
          <Tabs.Panel value="insurance2" pt="md">
            <Stack gap="sm">
              <InsuranceSelect
                label={t('patientHistory.edit.insuranceCompany')}
                {...form.getInputProps('insuranceCompany2')}
              />
              <Group grow>
                <TextInput
                  label={t('patientHistory.edit.insuranceType')}
                  {...form.getInputProps('insuranceType2')}
                />
                <TextInput
                  label={t('patientHistory.edit.policyNumber')}
                  {...form.getInputProps('policyNumber2')}
                />
              </Group>
              <Group grow>
                <TextInput
                  label={t('patientHistory.edit.referralNumber')}
                  {...form.getInputProps('referralNumber2')}
                />
                <NumberInput
                  label={t('patientHistory.edit.copayPercent')}
                  min={0}
                  max={100}
                  suffix="%"
                  {...form.getInputProps('copayPercent2')}
                />
              </Group>
              <Group grow>
                <DateInput
                  label={t('patientHistory.edit.issueDate')}
                  {...form.getInputProps('issueDate2')}
                  clearable
                />
                <DateInput
                  label={t('patientHistory.edit.expirationDate')}
                  {...form.getInputProps('expirationDate2')}
                  clearable
                />
              </Group>
            </Stack>
          </Tabs.Panel>

          {/* Insurance III - Tertiary (7 fields) */}
          <Tabs.Panel value="insurance3" pt="md">
            <Stack gap="sm">
              <InsuranceSelect
                label={t('patientHistory.edit.insuranceCompany')}
                {...form.getInputProps('insuranceCompany3')}
              />
              <Group grow>
                <TextInput
                  label={t('patientHistory.edit.insuranceType')}
                  {...form.getInputProps('insuranceType3')}
                />
                <TextInput
                  label={t('patientHistory.edit.policyNumber')}
                  {...form.getInputProps('policyNumber3')}
                />
              </Group>
              <Group grow>
                <TextInput
                  label={t('patientHistory.edit.referralNumber')}
                  {...form.getInputProps('referralNumber3')}
                />
                <NumberInput
                  label={t('patientHistory.edit.copayPercent')}
                  min={0}
                  max={100}
                  suffix="%"
                  {...form.getInputProps('copayPercent3')}
                />
              </Group>
              <Group grow>
                <DateInput
                  label={t('patientHistory.edit.issueDate')}
                  {...form.getInputProps('issueDate3')}
                  clearable
                />
                <DateInput
                  label={t('patientHistory.edit.expirationDate')}
                  {...form.getInputProps('expirationDate3')}
                  clearable
                />
              </Group>
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={handleCancel} disabled={loading}>
            {t('patientHistory.edit.cancel')}
          </Button>
          <Button type="submit" loading={loading}>
            {t('patientHistory.edit.save')}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
