// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Group, Button, Title, Text, Stack, SegmentedControl, Switch } from '@mantine/core';
import { IconPlus, IconTable, IconLayoutGrid } from '@tabler/icons-react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedplum } from '@medplum/react-hooks';
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
        padding: 'var(--mantine-spacing-md)',
      }}
      data-testid="form-management-view"
    >
      <Container size="xl">
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Title order={2}>{t('formManagement.title')}</Title>
              <Text c="dimmed">{t('formManagement.subtitle')}</Text>
            </Stack>

            <Group gap="md">
              {/* View mode toggle */}
              <SegmentedControl
                value={viewMode}
                onChange={(value) => setViewMode(value as 'table' | 'cards')}
                data={[
                  {
                    value: 'table',
                    label: (
                      <Group gap="xs">
                        <IconTable size={16} />
                        <Text size="sm">{t('formManagement.viewMode.table')}</Text>
                      </Group>
                    ),
                  },
                  {
                    value: 'cards',
                    label: (
                      <Group gap="xs">
                        <IconLayoutGrid size={16} />
                        <Text size="sm">{t('formManagement.viewMode.cards')}</Text>
                      </Group>
                    ),
                  },
                ]}
                data-testid="view-mode-toggle"
              />

              {/* Show archived toggle */}
              <Switch
                label={showArchived ? t('formManagement.hideArchived') : t('formManagement.showArchived')}
                checked={showArchived}
                onChange={(e) => setShowArchived(e.currentTarget.checked)}
                data-testid="show-archived-toggle"
              />

              {/* Create new button */}
              <Button
                leftSection={<IconPlus size={18} />}
                variant="gradient"
                gradient={{ from: 'var(--emr-primary)', to: 'var(--emr-secondary)' }}
                onClick={handleCreateNew}
                data-testid="create-new-btn"
              >
                {t('formManagement.createNew')}
              </Button>
            </Group>
          </Group>

          {/* Content */}
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
        </Stack>
      </Container>

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
