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
  Textarea,
  Modal,
  Badge,
  ActionIcon,
  Box,
  Grid,
  Skeleton,
  Alert,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMedplum } from '@medplum/react-hooks';
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconReportMedical,
  IconAlertCircle,
  IconRefresh,
} from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import type { DiagnosticReportFormValues, DiagnosticReportRow } from '../../types/diagnostic';
import { REPORT_CATEGORIES, REPORT_STATUSES } from '../../types/diagnostic';
import {
  searchDiagnosticReports,
  createDiagnosticReport,
  updateDiagnosticReport,
  cancelDiagnosticReport,
  getDiagnosticReport,
  extractFormValues,
} from '../../services/diagnosticReportService';

/**
 * DiagnosticReportView - Main diagnostic reports management page
 *
 * Features:
 * - List all diagnostic reports with filtering
 * - Create new reports
 * - Edit existing reports
 * - Cancel reports
 * - Multilingual support (ka/en/ru)
 */
export function DiagnosticReportView(): JSX.Element {
  const { t } = useTranslation();
  const medplum = useMedplum();

  // State
  const [reports, setReports] = useState<DiagnosticReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Form
  const form = useForm<DiagnosticReportFormValues>({
    initialValues: {
      patientId: '',
      reportName: '',
      category: 'OTHER',
      status: 'registered',
    },
    validate: {
      patientId: (value) => (!value ? t('registration.validation.required') : null),
      reportName: (value) => (!value ? t('registration.validation.required') : null),
    },
  });

  // Fetch reports
  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchDiagnosticReports(medplum, {
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
      });
      setReports(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [medplum, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Open modal for new report
  const handleCreate = () => {
    form.reset();
    setEditingId(null);
    setModalOpen(true);
  };

  // Open modal for editing
  const handleEdit = async (id: string) => {
    try {
      const resource = await getDiagnosticReport(medplum, id);
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
  const handleSubmit = async (values: DiagnosticReportFormValues) => {
    setSaving(true);
    try {
      if (editingId) {
        await updateDiagnosticReport(medplum, editingId, values);
        notifications.show({
          title: t('common.success') || 'Success',
          message: t('diagnostic.edit') + ' - OK',
          color: 'green',
        });
      } else {
        await createDiagnosticReport(medplum, values);
        notifications.show({
          title: t('common.success') || 'Success',
          message: t('diagnostic.create') + ' - OK',
          color: 'green',
        });
      }
      setModalOpen(false);
      form.reset();
      fetchReports();
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

  // Handle cancel report
  const handleCancel = async (id: string) => {
    try {
      await cancelDiagnosticReport(medplum, id);
      notifications.show({
        title: t('common.success') || 'Success',
        message: t('diagnostic.cancel') + ' - OK',
        color: 'green',
      });
      fetchReports();
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
      registered: 'gray',
      partial: 'yellow',
      preliminary: 'blue',
      final: 'green',
      amended: 'orange',
      corrected: 'cyan',
      cancelled: 'red',
      'entered-in-error': 'red',
    };
    return colors[status] || 'gray';
  };

  // Category badge color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      LAB: 'blue',
      RAD: 'violet',
      PATH: 'pink',
      CARD: 'red',
      OTHER: 'gray',
    };
    return colors[category] || 'gray';
  };

  // Status options for filter
  const statusOptions = REPORT_STATUSES.map((s) => ({
    value: s.value,
    label: t(s.labelKey),
  }));

  // Category options
  const categoryOptions = REPORT_CATEGORIES.map((c) => ({
    value: c.value,
    label: t(c.labelKey),
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
                <IconReportMedical size={24} color="white" />
              </Box>
              <Box>
                <Title order={2} c="white" style={{ letterSpacing: '-0.5px' }}>
                  {t('diagnostic.title')}
                </Title>
                <Text c="rgba(255, 255, 255, 0.8)" size="sm">
                  {reports.length} {t('common.recordCount').replace('({count})', '')}
                </Text>
              </Box>
            </Group>
            <Button
              leftSection={<IconPlus size={18} />}
              variant="white"
              color="dark"
              onClick={handleCreate}
            >
              {t('diagnostic.create')}
            </Button>
          </Group>
        </Paper>

        {/* Filters */}
        <Paper p="md" withBorder style={{ borderRadius: '12px' }}>
          <Group gap="md">
            <Select
              placeholder={t('diagnostic.category.label')}
              data={categoryOptions}
              value={categoryFilter}
              onChange={setCategoryFilter}
              clearable
              style={{ minWidth: '180px' }}
            />
            <Select
              placeholder={t('diagnostic.status.label')}
              data={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              clearable
              style={{ minWidth: '180px' }}
            />
            <Button
              variant="subtle"
              leftSection={<IconRefresh size={16} />}
              onClick={fetchReports}
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
          ) : reports.length === 0 ? (
            <Box ta="center" py="xl">
              <IconReportMedical size={48} style={{ opacity: 0.3 }} />
              <Text c="dimmed" mt="md">
                {t('diagnostic.noRecords')}
              </Text>
            </Box>
          ) : (
            <Box style={{ overflowX: 'auto' }}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('diagnostic.patient')}</Table.Th>
                    <Table.Th>{t('diagnostic.reportName')}</Table.Th>
                    <Table.Th>{t('diagnostic.category.label')}</Table.Th>
                    <Table.Th>{t('diagnostic.status.label')}</Table.Th>
                    <Table.Th>{t('diagnostic.effectiveDate')}</Table.Th>
                    <Table.Th>{t('diagnostic.conclusion')}</Table.Th>
                    <Table.Th>{t('registration.table.actions')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {reports.map((report) => (
                    <Table.Tr key={report.id}>
                      <Table.Td>{report.patientName}</Table.Td>
                      <Table.Td fw={500}>{report.reportName}</Table.Td>
                      <Table.Td>
                        <Badge color={getCategoryColor(report.category)} variant="light">
                          {t(`diagnostic.category.${report.category.toLowerCase()}`) || report.category}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getStatusColor(report.status)} variant="light">
                          {t(`diagnostic.status.${report.status}`) || report.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {report.effectiveDate
                          ? new Date(report.effectiveDate).toLocaleDateString()
                          : '-'}
                      </Table.Td>
                      <Table.Td style={{ maxWidth: '200px' }}>
                        <Text size="sm" truncate>
                          {report.conclusionPreview || '-'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleEdit(report.id)}
                          >
                            <IconPencil size={16} />
                          </ActionIcon>
                          {report.status !== 'cancelled' && (
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => handleCancel(report.id)}
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
        title={editingId ? t('diagnostic.edit') : t('diagnostic.create')}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label={t('diagnostic.patient') + ' ID'}
                  placeholder="Patient ID"
                  required
                  {...form.getInputProps('patientId')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label={t('diagnostic.performer') + ' ID'}
                  placeholder="Practitioner ID"
                  {...form.getInputProps('performerId')}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label={t('diagnostic.reportName')}
              placeholder="e.g., Complete Blood Count"
              required
              {...form.getInputProps('reportName')}
            />

            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label={t('diagnostic.reportCode')}
                  placeholder="LOINC code (optional)"
                  {...form.getInputProps('reportCode')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label={t('diagnostic.category.label')}
                  data={categoryOptions}
                  required
                  {...form.getInputProps('category')}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label={t('diagnostic.status.label')}
                  data={statusOptions}
                  required
                  {...form.getInputProps('status')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <DateInput
                  label={t('diagnostic.effectiveDate')}
                  placeholder="Study date"
                  {...form.getInputProps('effectiveDateTime')}
                />
              </Grid.Col>
            </Grid>

            <Textarea
              label={t('diagnostic.conclusion')}
              placeholder="Clinical interpretation..."
              minRows={3}
              {...form.getInputProps('conclusion')}
            />

            <TextInput
              label={t('diagnostic.conclusionCode')}
              placeholder="Coded conclusion (optional)"
              {...form.getInputProps('conclusionCode')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => setModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={saving}>
                {editingId ? t('accountManagement.form.save') : t('diagnostic.create')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}

export default DiagnosticReportView;
