// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Group, Button, Title, Text, Stack, SegmentedControl, Paper, SimpleGrid, ThemeIcon } from '@mantine/core';
import { EMRSwitch } from '../../components/shared/EMRFormFields';
import { IconPlus, IconTable, IconLayoutGrid, IconFileImport, IconForms, IconFileCheck, IconFilePencil, IconArchive } from '@tabler/icons-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedplum } from '@medplum/react-hooks';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import type { Questionnaire } from '@medplum/fhirtypes';
import { useTranslation } from '../../hooks/useTranslation';
import { FormTemplateList } from '../../components/form-management/FormTemplateList';
import { FormTemplateCard } from '../../components/form-management/FormTemplateCard';
import { FormVersionHistory } from '../../components/form-management/FormVersionHistory';
import { FormCloneModal } from '../../components/form-management/FormCloneModal';
import {
  listActiveQuestionnaires,
  listQuestionnaires,
  archiveQuestionnaire,
  restoreQuestionnaire,
  cloneQuestionnaire,
  getVersionHistory,
  type VersionHistoryEntry,
} from '../../services/formBuilderService';
import { seedForm100, form100Exists } from '../../services/form100Service';

/**
 * FormManagementView Component
 *
 * Main view for managing form templates at /emr/forms
 *
 * Features:
 * - List all form templates (table or card view)
 * - Search by name
 * - Filter by status
 * - Toggle archived forms visibility
 * - Actions: Edit, Clone, Archive, View History
 * - Create new form button
 */
export function FormManagementView(): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const medplum = useMedplum();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  // State
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showArchived, setShowArchived] = useState(false);

  // Clone modal state
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [cloneTarget, setCloneTarget] = useState<{ id: string; title: string } | null>(null);
  const [cloneLoading, setCloneLoading] = useState(false);

  // Version history modal state
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<{ id: string; title: string } | null>(null);
  const [historyEntries, setHistoryEntries] = useState<VersionHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // System template seeding state
  const [seedingTemplates, setSeedingTemplates] = useState(false);
  const [hasForm100, setHasForm100] = useState(false);

  // Fetch questionnaires
  const fetchQuestionnaires = useCallback(async () => {
    setLoading(true);
    try {
      const results = showArchived
        ? await listQuestionnaires(medplum)
        : await listActiveQuestionnaires(medplum);
      setQuestionnaires(results);
    } catch (error) {
      console.error('Error fetching questionnaires:', error);
      notifications.show({
        title: t('formUI.messages.error'),
        message: 'Failed to load form templates',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [medplum, showArchived, t]);

  useEffect(() => {
    fetchQuestionnaires();
  }, [fetchQuestionnaires]);

  // Check if Form 100 exists
  useEffect(() => {
    const checkForm100 = async () => {
      const exists = await form100Exists(medplum);
      setHasForm100(exists);
    };
    checkForm100();
  }, [medplum, questionnaires]);

  // Compute stats for display
  const stats = useMemo(() => {
    const total = questionnaires.length;
    const active = questionnaires.filter((q) => q.status === 'active').length;
    const draft = questionnaires.filter((q) => q.status === 'draft').length;
    const archived = questionnaires.filter((q) => q.status === 'retired').length;
    return { total, active, draft, archived };
  }, [questionnaires]);

  // Handle seed system templates
  const handleSeedSystemTemplates = async (): Promise<void> => {
    setSeedingTemplates(true);
    try {
      await seedForm100(medplum);
      notifications.show({
        title: t('form100.systemTemplate'),
        message: 'Form 100 (ფორმა № IV-100/ა) created successfully',
        color: 'green',
      });
      setHasForm100(true);
      await fetchQuestionnaires();
    } catch (error) {
      console.error('Error seeding system templates:', error);
      notifications.show({
        title: t('formUI.messages.error'),
        message: error instanceof Error ? error.message : 'Failed to create system templates',
        color: 'red',
      });
    } finally {
      setSeedingTemplates(false);
    }
  };

  // Handle edit
  const handleEdit = (id: string): void => {
    navigate(`/emr/forms/edit/${id}`);
  };

  // Handle clone
  const handleClone = (id: string): void => {
    const questionnaire = questionnaires.find((q) => q.id === id);
    if (questionnaire) {
      setCloneTarget({ id, title: questionnaire.title || t('formManagement.untitled') });
      setCloneModalOpen(true);
    }
  };

  // Confirm clone
  const handleConfirmClone = async (newTitle: string): Promise<void> => {
    if (!cloneTarget) return;

    setCloneLoading(true);
    try {
      await cloneQuestionnaire(medplum, cloneTarget.id, newTitle);
      notifications.show({
        title: t('formManagement.clone.success'),
        message: newTitle,
        color: 'green',
      });
      setCloneModalOpen(false);
      setCloneTarget(null);
      await fetchQuestionnaires();
    } catch (error) {
      console.error('Error cloning questionnaire:', error);
      notifications.show({
        title: t('formManagement.clone.error'),
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      });
    } finally {
      setCloneLoading(false);
    }
  };

  // Handle archive
  const handleArchive = async (id: string): Promise<void> => {
    try {
      await archiveQuestionnaire(medplum, id);
      notifications.show({
        title: t('formManagement.archive.success'),
        message: '',
        color: 'green',
      });
      await fetchQuestionnaires();
    } catch (error) {
      console.error('Error archiving questionnaire:', error);
      notifications.show({
        title: t('formManagement.archive.error'),
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      });
    }
  };

  // Handle restore
  const handleRestore = async (id: string): Promise<void> => {
    try {
      await restoreQuestionnaire(medplum, id);
      notifications.show({
        title: t('formManagement.restore.success'),
        message: '',
        color: 'green',
      });
      await fetchQuestionnaires();
    } catch (error) {
      console.error('Error restoring questionnaire:', error);
      notifications.show({
        title: t('formManagement.restore.error'),
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      });
    }
  };

  // Handle view history
  const handleViewHistory = async (id: string): Promise<void> => {
    const questionnaire = questionnaires.find((q) => q.id === id);
    if (questionnaire) {
      setHistoryTarget({ id, title: questionnaire.title || t('formManagement.untitled') });
      setHistoryModalOpen(true);
      setHistoryLoading(true);

      try {
        const history = await getVersionHistory(medplum, id);
        setHistoryEntries(history);
      } catch (error) {
        console.error('Error fetching version history:', error);
        notifications.show({
          title: t('formUI.messages.error'),
          message: 'Failed to load version history',
          color: 'red',
        });
        setHistoryEntries([]);
      } finally {
        setHistoryLoading(false);
      }
    }
  };

  // Handle create new
  const handleCreateNew = (): void => {
    navigate('/emr/forms/builder');
  };

  // Handle row/card click
  const handleItemClick = (id: string): void => {
    navigate(`/emr/forms/edit/${id}`);
  };

  return (
    <Box
      style={{
        minHeight: 'calc(100vh - var(--emr-topnav-height) - var(--emr-mainmenu-height))',
        backgroundColor: 'var(--emr-gray-50)',
      }}
      data-testid="form-management-view"
    >
      {/* Hero Header Section */}
      <Box
        style={{
          background: 'var(--emr-gradient-secondary)',
          padding: 'var(--mantine-spacing-xl) var(--mantine-spacing-xl)',
          marginBottom: 'var(--mantine-spacing-lg)',
        }}
      >
        <Box style={{ maxWidth: '100%' }}>
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <Group gap="lg">
              <ThemeIcon
                size={56}
                radius="md"
                variant="white"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                }}
              >
                <IconForms size={32} stroke={1.5} />
              </ThemeIcon>
              <Stack gap={2}>
                <Title order={2} style={{ color: 'white', fontWeight: 600 }}>
                  {t('formManagement.title')}
                </Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.85)' }} size="sm">
                  {t('formManagement.subtitle')}
                </Text>
              </Stack>
            </Group>

            <Group gap="sm">
              {/* Seed system templates button (only show if Form 100 doesn't exist) */}
              {!hasForm100 && (
                <Button
                  leftSection={<IconFileImport size={18} />}
                  variant="white"
                  color="dark"
                  onClick={handleSeedSystemTemplates}
                  loading={seedingTemplates}
                  data-testid="seed-templates-btn"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: 'var(--emr-primary)',
                  }}
                >
                  {t('form100.systemTemplate')} (100/ა)
                </Button>
              )}

              {/* Create new button */}
              <Button
                leftSection={<IconPlus size={18} />}
                variant="white"
                size="md"
                onClick={handleCreateNew}
                data-testid="create-new-btn"
                style={{
                  backgroundColor: 'white',
                  color: 'var(--emr-primary)',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                }}
              >
                {t('formManagement.createNew')}
              </Button>
            </Group>
          </Group>
        </Box>
      </Box>

      <Box style={{ padding: '0 var(--mantine-spacing-xl)', paddingBottom: 'var(--mantine-spacing-xl)' }}>
        <Stack gap="lg">
          {/* Stats Cards - Using consistent blue theme colors */}
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
            {/* Total Forms Card */}
            <Paper
              p="md"
              radius="md"
              style={{
                border: '1px solid var(--emr-gray-200)',
                backgroundColor: 'var(--emr-light-accent)',
              }}
            >
              <Group gap="sm">
                <ThemeIcon
                  size={isMobile ? 36 : 40}
                  radius="md"
                  variant="light"
                  style={{ backgroundColor: 'var(--emr-light-accent)', color: 'var(--emr-primary)' }}
                >
                  <IconForms size={isMobile ? 18 : 22} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size={isMobile ? 'lg' : 'xl'} fw={700} style={{ color: 'var(--emr-primary)' }}>
                    {stats.total}
                  </Text>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                    {t('formManagement.stats.total')}
                  </Text>
                </Stack>
              </Group>
            </Paper>

            {/* Active Forms Card */}
            <Paper
              p="md"
              radius="md"
              style={{
                border: '1px solid var(--emr-gray-200)',
                backgroundColor: 'var(--emr-light-accent)',
              }}
            >
              <Group gap="sm">
                <ThemeIcon
                  size={isMobile ? 36 : 40}
                  radius="md"
                  variant="light"
                  style={{ backgroundColor: 'var(--emr-light-accent)', color: 'var(--emr-secondary)' }}
                >
                  <IconFileCheck size={isMobile ? 18 : 22} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size={isMobile ? 'lg' : 'xl'} fw={700} style={{ color: 'var(--emr-secondary)' }}>
                    {stats.active}
                  </Text>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                    {t('formManagement.status.active')}
                  </Text>
                </Stack>
              </Group>
            </Paper>

            {/* Draft Forms Card */}
            <Paper
              p="md"
              radius="md"
              style={{
                border: '1px solid var(--emr-gray-200)',
                backgroundColor: 'var(--emr-light-accent)',
              }}
            >
              <Group gap="sm">
                <ThemeIcon
                  size={isMobile ? 36 : 40}
                  radius="md"
                  variant="light"
                  style={{ backgroundColor: 'var(--emr-light-accent)', color: 'var(--emr-accent)' }}
                >
                  <IconFilePencil size={isMobile ? 18 : 22} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size={isMobile ? 'lg' : 'xl'} fw={700} style={{ color: 'var(--emr-accent)' }}>
                    {stats.draft}
                  </Text>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                    {t('formManagement.status.draft')}
                  </Text>
                </Stack>
              </Group>
            </Paper>

            {/* Archived Forms Card */}
            <Paper
              p="md"
              radius="md"
              style={{
                border: '1px solid var(--emr-gray-200)',
                backgroundColor: 'var(--emr-gray-100)',
              }}
            >
              <Group gap="sm">
                <ThemeIcon
                  size={isMobile ? 36 : 40}
                  radius="md"
                  variant="light"
                  style={{ backgroundColor: 'var(--emr-gray-100)', color: 'var(--emr-gray-500)' }}
                >
                  <IconArchive size={isMobile ? 18 : 22} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size={isMobile ? 'lg' : 'xl'} fw={700} style={{ color: 'var(--emr-gray-500)' }}>
                    {stats.archived}
                  </Text>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                    {t('formManagement.status.archived')}
                  </Text>
                </Stack>
              </Group>
            </Paper>
          </SimpleGrid>

          {/* Controls Section */}
          <Paper
            p={isMobile ? 'md' : 'lg'}
            radius="md"
            style={{
              border: '1px solid var(--emr-gray-200)',
              backgroundColor: 'white',
              boxShadow: 'var(--emr-shadow-sm)',
            }}
          >
            <Stack gap="md">
              {/* View mode toggle with label - stack on mobile */}
              <Group justify={isMobile ? 'center' : 'space-between'} wrap="wrap" gap="md">
                <Group gap="md" style={{ flexWrap: 'wrap' }}>
                  {!isMobile && (
                    <Text size="sm" fw={500} c="var(--emr-gray-600)">
                      {t('formManagement.viewMode.label')}:
                    </Text>
                  )}
                  <SegmentedControl
                    value={viewMode}
                    onChange={(value) => setViewMode(value as 'table' | 'cards')}
                    fullWidth={isMobile}
                    data={[
                      {
                        value: 'table',
                        label: (
                          <Group gap={6} wrap="nowrap" justify="center">
                            <IconTable size={isMobile ? 16 : 18} />
                            <Text size={isMobile ? 'xs' : 'sm'} fw={500}>{t('formManagement.viewMode.table')}</Text>
                          </Group>
                        ),
                      },
                      {
                        value: 'cards',
                        label: (
                          <Group gap={6} wrap="nowrap" justify="center">
                            <IconLayoutGrid size={isMobile ? 16 : 18} />
                            <Text size={isMobile ? 'xs' : 'sm'} fw={500}>{t('formManagement.viewMode.cards')}</Text>
                          </Group>
                        ),
                      },
                    ]}
                    data-testid="view-mode-toggle"
                    size={isMobile ? 'sm' : 'md'}
                    styles={{
                      root: {
                        backgroundColor: 'var(--emr-gray-50)',
                        border: '1px solid var(--emr-gray-200)',
                        padding: 4,
                        minWidth: isMobile ? '100%' : 'auto',
                      },
                      indicator: {
                        background: 'var(--emr-gradient-secondary)',
                        boxShadow: 'var(--emr-shadow-sm)',
                      },
                      label: {
                        padding: isMobile ? '8px 12px' : '8px 16px',
                        fontWeight: 500,
                        '&[dataActive]': {
                          color: 'white',
                        },
                      },
                    }}
                  />
                </Group>

                {/* Show archived toggle with better styling */}
                <Group
                  gap="sm"
                  justify={isMobile ? 'center' : 'flex-start'}
                  style={{
                    padding: isMobile ? '10px 12px' : '8px 16px',
                    backgroundColor: 'var(--emr-gray-50)',
                    borderRadius: 'var(--emr-border-radius)',
                    border: '1px solid var(--emr-gray-200)',
                    width: isMobile ? '100%' : 'auto',
                  }}
                >
                  <IconArchive size={isMobile ? 16 : 18} style={{ color: 'var(--emr-gray-500)' }} />
                  <EMRSwitch
                    label={showArchived ? t('formManagement.hideArchived') : t('formManagement.showArchived')}
                    checked={showArchived}
                    onChange={setShowArchived}
                    data-testid="show-archived-toggle"
                  />
                </Group>
              </Group>
            </Stack>
          </Paper>

          {/* Content */}
          <Paper
            p="lg"
            radius="md"
            style={{
              border: '1px solid var(--emr-gray-200)',
              backgroundColor: 'white',
              boxShadow: 'var(--emr-shadow-sm)',
            }}
          >
            {viewMode === 'table' ? (
              <FormTemplateList
                questionnaires={questionnaires}
                loading={loading}
                onEdit={handleEdit}
                onClone={handleClone}
                onArchive={handleArchive}
                onRestore={handleRestore}
                onViewHistory={handleViewHistory}
                onRowClick={handleItemClick}
                showArchived={showArchived}
              />
            ) : (
              <Box
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 'var(--mantine-spacing-md)',
                }}
                data-testid="cards-container"
              >
                {questionnaires.map((q) => (
                  <FormTemplateCard
                    key={q.id}
                    questionnaire={q}
                    onEdit={handleEdit}
                    onClone={handleClone}
                    onArchive={handleArchive}
                    onRestore={handleRestore}
                    onViewHistory={handleViewHistory}
                    onClick={handleItemClick}
                  />
                ))}
              </Box>
            )}
          </Paper>
        </Stack>
      </Box>

      {/* Clone Modal */}
      <FormCloneModal
        opened={cloneModalOpen}
        onClose={() => {
          setCloneModalOpen(false);
          setCloneTarget(null);
        }}
        originalTitle={cloneTarget?.title || ''}
        onConfirm={handleConfirmClone}
        loading={cloneLoading}
      />

      {/* Version History Modal */}
      <FormVersionHistory
        opened={historyModalOpen}
        onClose={() => {
          setHistoryModalOpen(false);
          setHistoryTarget(null);
          setHistoryEntries([]);
        }}
        title={historyTarget?.title}
        history={historyEntries}
        loading={historyLoading}
      />
    </Box>
  );
}
