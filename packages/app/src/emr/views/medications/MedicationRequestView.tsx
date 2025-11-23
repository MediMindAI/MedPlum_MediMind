// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Table,
  Button,
  Group,
  Stack,
  TextInput,
  Select,
  NumberInput,
  Textarea,
  Switch,
  Modal,
  Badge,
  ActionIcon,
  Box,
  Grid,
  Skeleton,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMedplum } from '@medplum/react-hooks';
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconPill,
  IconAlertCircle,
  IconRefresh,
} from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import type { MedicationRequestFormValues, MedicationRequestRow } from '../../types/medication';
import { MEDICATION_ROUTES, MEDICATION_STATUSES, MEDICATION_PRIORITIES, DOSE_UNITS } from '../../types/medication';
import {
  searchMedicationRequests,
  createMedicationRequest,
  updateMedicationRequest,
  cancelMedicationRequest,
  getMedicationRequest,
  extractFormValues,
} from '../../services/medicationService';

/**
 * MedicationRequestView - Main prescriptions management page
 *
 * Features:
 * - List all prescriptions with filtering
 * - Create new prescriptions
 * - Edit existing prescriptions
 * - Cancel prescriptions
 * - Multilingual support (ka/en/ru)
 */
export function MedicationRequestView(): JSX.Element {
  const { t } = useTranslation();
  const medplum = useMedplum();

  // State
  const [medications, setMedications] = useState<MedicationRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Form
  const form = useForm<MedicationRequestFormValues>({
    initialValues: {
      patientId: '',
      medicationName: '',
      dosageInstruction: '',
      status: 'active',
      priority: 'routine',
      substitutionAllowed: true,
    },
    validate: {
      patientId: (value) => (!value ? t('registration.validation.required') : null),
      medicationName: (value) => (!value ? t('registration.validation.required') : null),
      dosageInstruction: (value) => (!value ? t('registration.validation.required') : null),
    },
  });

  // Fetch medications
  const fetchMedications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchMedicationRequests(medplum, {
        status: statusFilter || undefined,
      });
      setMedications(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [medplum, statusFilter]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  // Open modal for new prescription
  const handleCreate = () => {
    form.reset();
    setEditingId(null);
    setModalOpen(true);
  };

  // Open modal for editing
  const handleEdit = async (id: string) => {
    try {
      const resource = await getMedicationRequest(medplum, id);
      const values = extractFormValues(resource);
      form.setValues(values);
      setEditingId(id);
      setModalOpen(true);
    } catch (err) {
      notifications.show({
        title: t('common.error') || 'Error',
        message: (err as Error).message,
        color: 'red',
      });
    }
  };

  // Handle form submit
  const handleSubmit = async (values: MedicationRequestFormValues) => {
    setSaving(true);
    try {
      if (editingId) {
        await updateMedicationRequest(medplum, editingId, values);
        notifications.show({
          title: t('common.success') || 'Success',
          message: t('medication.edit') + ' - OK',
          color: 'green',
        });
      } else {
        await createMedicationRequest(medplum, values);
        notifications.show({
          title: t('common.success') || 'Success',
          message: t('medication.create') + ' - OK',
          color: 'green',
        });
      }
      setModalOpen(false);
      form.reset();
      fetchMedications();
    } catch (err) {
      notifications.show({
        title: t('common.error') || 'Error',
        message: (err as Error).message,
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel prescription
  const handleCancel = async (id: string) => {
    try {
      await cancelMedicationRequest(medplum, id);
      notifications.show({
        title: t('common.success') || 'Success',
        message: t('medication.cancel') + ' - OK',
        color: 'green',
      });
      fetchMedications();
    } catch (err) {
      notifications.show({
        title: t('common.error') || 'Error',
        message: (err as Error).message,
        color: 'red',
      });
    }
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'green',
      draft: 'gray',
      'on-hold': 'yellow',
      cancelled: 'red',
      completed: 'blue',
      stopped: 'orange',
    };
    return colors[status] || 'gray';
  };

  // Status options for filter
  const statusOptions = MEDICATION_STATUSES.map((s) => ({
    value: s.value,
    label: t(s.labelKey),
  }));

  // Route options
  const routeOptions = MEDICATION_ROUTES.map((r) => ({
    value: r.value,
    label: t(r.labelKey),
  }));

  // Priority options
  const priorityOptions = MEDICATION_PRIORITIES.map((p) => ({
    value: p.value,
    label: t(p.labelKey),
  }));

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Paper
          p="lg"
          style={{
            background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)',
            borderRadius: '16px',
          }}
        >
          <Group justify="space-between" align="center">
            <Group gap="md">
              <Box
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconPill size={24} color="white" />
              </Box>
              <Box>
                <Title order={2} c="white" style={{ letterSpacing: '-0.5px' }}>
                  {t('medication.title')}
                </Title>
                <Text c="rgba(255, 255, 255, 0.8)" size="sm">
                  {medications.length} {t('common.recordCount').replace('({count})', '')}
                </Text>
              </Box>
            </Group>
            <Button
              leftSection={<IconPlus size={18} />}
              variant="white"
              color="dark"
              onClick={handleCreate}
            >
              {t('medication.create')}
            </Button>
          </Group>
        </Paper>

        {/* Filters */}
        <Paper p="md" withBorder style={{ borderRadius: '12px' }}>
          <Group gap="md">
            <Select
              placeholder={t('medication.status')}
              data={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              clearable
              style={{ minWidth: '200px' }}
            />
            <Button
              variant="subtle"
              leftSection={<IconRefresh size={16} />}
              onClick={fetchMedications}
            >
              {t('common.refresh')}
            </Button>
          </Group>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
            {error}
          </Alert>
        )}

        {/* Table */}
        <Paper p="md" withBorder style={{ borderRadius: '12px' }}>
          {loading ? (
            <Stack gap="sm">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height={50} radius="sm" />
              ))}
            </Stack>
          ) : medications.length === 0 ? (
            <Box ta="center" py="xl">
              <IconPill size={48} style={{ opacity: 0.3 }} />
              <Text c="dimmed" mt="md">
                {t('medication.noRecords')}
              </Text>
            </Box>
          ) : (
            <Box style={{ overflowX: 'auto' }}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('medication.patient')}</Table.Th>
                    <Table.Th>{t('medication.medicationName')}</Table.Th>
                    <Table.Th>{t('medication.dosage')}</Table.Th>
                    <Table.Th>{t('medication.status')}</Table.Th>
                    <Table.Th>{t('medication.authoredOn')}</Table.Th>
                    <Table.Th>{t('registration.table.actions')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {medications.map((med) => (
                    <Table.Tr key={med.id}>
                      <Table.Td>{med.patientName}</Table.Td>
                      <Table.Td fw={500}>{med.medicationName}</Table.Td>
                      <Table.Td>{med.dosageInstruction}</Table.Td>
                      <Table.Td>
                        <Badge color={getStatusColor(med.status)} variant="light">
                          {t(`medication.status.${med.status}`) || med.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {med.authoredOn
                          ? new Date(med.authoredOn).toLocaleDateString()
                          : '-'}
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleEdit(med.id)}
                          >
                            <IconPencil size={16} />
                          </ActionIcon>
                          {med.status === 'active' && (
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => handleCancel(med.id)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          )}
        </Paper>
      </Stack>

      {/* Create/Edit Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? t('medication.edit') : t('medication.create')}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label={t('medication.patient') + ' ID'}
                  placeholder="Patient ID"
                  required
                  {...form.getInputProps('patientId')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label={t('medication.prescriber') + ' ID'}
                  placeholder="Practitioner ID"
                  {...form.getInputProps('prescriberId')}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label={t('medication.medicationName')}
              placeholder="e.g., Aspirin 100mg"
              required
              {...form.getInputProps('medicationName')}
            />

            <Textarea
              label={t('medication.dosage')}
              placeholder="e.g., Take 1 tablet twice daily with food"
              required
              minRows={2}
              {...form.getInputProps('dosageInstruction')}
            />

            <Grid>
              <Grid.Col span={{ base: 6, md: 3 }}>
                <NumberInput
                  label={t('medication.dose')}
                  placeholder="500"
                  min={0}
                  {...form.getInputProps('doseQuantity')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 3 }}>
                <Select
                  label={t('medication.unit')}
                  data={DOSE_UNITS.map((u) => ({ value: u.value, label: u.label }))}
                  {...form.getInputProps('doseUnit')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label={t('medication.frequency')}
                  placeholder="e.g., twice daily"
                  {...form.getInputProps('frequency')}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label={t('medication.route')}
                  data={routeOptions}
                  {...form.getInputProps('route')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <NumberInput
                  label={t('medication.duration')}
                  placeholder="7"
                  min={1}
                  {...form.getInputProps('durationDays')}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label={t('medication.status')}
                  data={statusOptions}
                  required
                  {...form.getInputProps('status')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label={t('medication.priority')}
                  data={priorityOptions}
                  {...form.getInputProps('priority')}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={{ base: 6, md: 4 }}>
                <NumberInput
                  label={t('medication.dispenseQuantity')}
                  min={0}
                  {...form.getInputProps('dispenseQuantity')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 6, md: 4 }}>
                <NumberInput
                  label={t('medication.refills')}
                  min={0}
                  {...form.getInputProps('numberOfRefills')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Switch
                  label={t('medication.substitution')}
                  mt="xl"
                  {...form.getInputProps('substitutionAllowed', { type: 'checkbox' })}
                />
              </Grid.Col>
            </Grid>

            <Textarea
              label={t('medication.reason')}
              placeholder="Reason for prescription"
              {...form.getInputProps('reasonText')}
            />

            <Textarea
              label={t('medication.notes')}
              placeholder="Additional notes"
              {...form.getInputProps('notes')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => setModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={saving}>
                {editingId ? t('accountManagement.form.save') : t('medication.create')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}

export default MedicationRequestView;
