// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect, useCallback } from 'react';
import {
  Group,
  Button,
  Modal,
  TextInput,
  Text,
  ActionIcon,
  Menu,
  Stack,
  Paper,
} from '@mantine/core';
import { IconDeviceFloppy, IconTrash, IconChevronDown, IconBookmark } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import type { AccountSearchFiltersExtended, FilterPreset } from '../../types/account-management';

const STORAGE_KEY = 'emrAccountFilterPresets';

interface FilterPresetSelectProps {
  onSelect: (filters: AccountSearchFiltersExtended) => void;
  currentFilters: AccountSearchFiltersExtended;
  onSave: (preset: FilterPreset) => void;
  onDelete: (presetId: string) => void;
}

/**
 * Filter preset selector with save/load functionality
 *
 * Features:
 * - Dropdown to select saved filter presets
 * - Save current filters as new preset
 * - Delete existing presets
 * - Persistence via localStorage
 * - Modal for saving new presets
 */
export const FilterPresetSelect = React.memo(function FilterPresetSelect({
  onSelect,
  currentFilters,
  onSave,
  onDelete,
}: FilterPresetSelectProps): JSX.Element {
  const { t } = useTranslation();
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [saveModalOpened, setSaveModalOpened] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [nameError, setNameError] = useState('');

  // Load presets from localStorage on mount
  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as FilterPreset[];
        setPresets(parsed);
      }
    } catch (error) {
      console.error('Failed to load filter presets:', error);
      setPresets([]);
    }
  }, []);

  const savePresetsToStorage = useCallback((newPresets: FilterPreset[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPresets));
      setPresets(newPresets);
    } catch (error) {
      console.error('Failed to save filter presets:', error);
    }
  }, []);

  const handleSelectPreset = useCallback((preset: FilterPreset) => {
    onSelect(preset.filters);
  }, [onSelect]);

  const handleOpenSaveModal = useCallback(() => {
    setPresetName('');
    setNameError('');
    setSaveModalOpened(true);
  }, []);

  const handleCloseSaveModal = useCallback(() => {
    setSaveModalOpened(false);
    setPresetName('');
    setNameError('');
  }, []);

  const handleSavePreset = useCallback(() => {
    // Validate preset name
    if (!presetName.trim()) {
      setNameError(t('accountManagement.filters.presetNameRequired') || 'Preset name is required');
      return;
    }

    // Check for duplicate names
    if (presets.some((p) => p.name.toLowerCase() === presetName.trim().toLowerCase())) {
      setNameError(t('accountManagement.filters.presetNameExists') || 'A preset with this name already exists');
      return;
    }

    // Create new preset
    const newPreset: FilterPreset = {
      id: `preset-${Date.now()}`,
      name: presetName.trim(),
      filters: { ...currentFilters },
      createdAt: new Date().toISOString(),
    };

    // Save to storage
    const newPresets = [...presets, newPreset];
    savePresetsToStorage(newPresets);

    // Notify parent
    onSave(newPreset);

    // Close modal
    handleCloseSaveModal();
  }, [presetName, presets, currentFilters, savePresetsToStorage, onSave, handleCloseSaveModal, t]);

  const handleDeletePreset = useCallback((presetId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    const newPresets = presets.filter((p) => p.id !== presetId);
    savePresetsToStorage(newPresets);
    onDelete(presetId);
  }, [presets, savePresetsToStorage, onDelete]);

  // Check if current filters have any values to save
  const hasFiltersToSave =
    currentFilters.active !== undefined ||
    currentFilters.role !== undefined ||
    currentFilters.hireDateFrom !== undefined ||
    currentFilters.hireDateTo !== undefined ||
    currentFilters.invitationStatus !== undefined ||
    currentFilters.search !== undefined;

  return (
    <>
      <Group gap="xs">
        {/* Preset Selector Menu */}
        <Menu shadow="md" width={280} position="bottom-start">
          <Menu.Target>
            <Button
              variant="light"
              leftSection={<IconBookmark size={16} />}
              rightSection={<IconChevronDown size={14} />}
              style={{
                borderColor: 'var(--emr-turquoise)',
                color: 'var(--emr-primary)',
              }}
            >
              <TextInput
                placeholder={t('accountManagement.filters.selectPreset') || 'Select preset'}
                readOnly
                variant="unstyled"
                size="sm"
                styles={{
                  input: {
                    cursor: 'pointer',
                    minWidth: '120px',
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                  },
                }}
              />
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            {presets.length === 0 ? (
              <Paper p="md" ta="center">
                <Text size="sm" c="dimmed">
                  {t('accountManagement.filters.noPresets') || 'No saved presets'}
                </Text>
              </Paper>
            ) : (
              <Stack gap={0}>
                {presets.map((preset) => (
                  <Menu.Item
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    rightSection={
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={(e) => handleDeletePreset(preset.id, e)}
                        aria-label="delete"
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    }
                  >
                    <Group gap="xs" wrap="nowrap">
                      <IconBookmark size={14} color="var(--emr-turquoise)" />
                      <Text size="sm" truncate style={{ maxWidth: '180px' }}>
                        {preset.name}
                      </Text>
                    </Group>
                  </Menu.Item>
                ))}
              </Stack>
            )}
          </Menu.Dropdown>
        </Menu>

        {/* Save Preset Button */}
        <Button
          variant="light"
          leftSection={<IconDeviceFloppy size={16} />}
          onClick={handleOpenSaveModal}
          disabled={!hasFiltersToSave}
          aria-label="save"
          style={{
            borderColor: 'var(--emr-turquoise)',
            color: 'var(--emr-primary)',
          }}
        >
          {t('accountManagement.filters.savePreset') || 'Save'}
        </Button>
      </Group>

      {/* Save Preset Modal */}
      <Modal
        opened={saveModalOpened}
        onClose={handleCloseSaveModal}
        title={t('accountManagement.filters.saveFilterPreset') || 'Save Filter Preset'}
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t('accountManagement.filters.savePresetDescription') ||
              'Save current filter settings as a preset for quick access later.'}
          </Text>

          <TextInput
            label={t('accountManagement.filters.presetName') || 'Preset Name'}
            placeholder={t('accountManagement.filters.enterPresetName') || 'Enter preset name'}
            value={presetName}
            onChange={(e) => {
              setPresetName(e.target.value);
              setNameError('');
            }}
            error={nameError}
            required
            size="md"
            styles={{
              input: {
                minHeight: '44px',
              },
            }}
          />

          {/* Preview of filters being saved */}
          <Paper p="sm" withBorder style={{ background: 'var(--emr-gray-50)' }}>
            <Text size="xs" fw={600} mb="xs" c="var(--emr-primary)">
              {t('accountManagement.filters.filtersToSave') || 'Filters to save:'}
            </Text>
            <Stack gap={4}>
              {currentFilters.active !== undefined && (
                <Text size="xs">
                  {t('accountManagement.table.status')}: {currentFilters.active ? t('accountManagement.filters.active') : t('accountManagement.filters.inactive')}
                </Text>
              )}
              {currentFilters.role && (
                <Text size="xs">
                  {t('accountManagement.table.role')}: {currentFilters.role}
                </Text>
              )}
              {currentFilters.invitationStatus && (
                <Text size="xs">
                  {t('accountManagement.invitation.status') || 'Invitation'}: {currentFilters.invitationStatus}
                </Text>
              )}
              {currentFilters.hireDateFrom && (
                <Text size="xs">
                  {t('accountManagement.filters.hireDateFrom')}: {currentFilters.hireDateFrom}
                </Text>
              )}
              {currentFilters.hireDateTo && (
                <Text size="xs">
                  {t('accountManagement.filters.hireDateTo')}: {currentFilters.hireDateTo}
                </Text>
              )}
              {currentFilters.search && (
                <Text size="xs">
                  {t('common.search')}: {currentFilters.search}
                </Text>
              )}
            </Stack>
          </Paper>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleCloseSaveModal}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              onClick={handleSavePreset}
              style={{
                background: 'var(--emr-gradient-primary)',
              }}
            >
              {t('accountManagement.filters.save') || 'Save'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
});
