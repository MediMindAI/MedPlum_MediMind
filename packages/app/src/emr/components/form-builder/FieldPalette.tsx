// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, memo, useCallback } from 'react';
import { Stack, TextInput, Box, Text, Badge, Group } from '@mantine/core';
import { useDraggable } from '@dnd-kit/core';
import {
  IconTextSize,
  IconTextWrap,
  IconCalendar,
  IconClock,
  IconCalendarTime,
  IconNumber,
  IconDecimal,
  IconSquareCheck,
  IconSelect,
  IconCircleDot,
  IconSignature,
  IconPaperclip,
  IconLayoutList,
  IconEye,
  IconSearch,
} from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import type { FieldType } from '../../types/form-builder';

interface FieldTypeConfig {
  type: FieldType;
  icon: React.ReactElement;
  category: 'basic' | 'advanced' | 'layout';
}

const fieldTypeConfigs: FieldTypeConfig[] = [
  { type: 'text', icon: <IconTextSize size={18} />, category: 'basic' },
  { type: 'textarea', icon: <IconTextWrap size={18} />, category: 'basic' },
  { type: 'date', icon: <IconCalendar size={18} />, category: 'basic' },
  { type: 'integer', icon: <IconNumber size={18} />, category: 'basic' },
  { type: 'decimal', icon: <IconDecimal size={18} />, category: 'basic' },
  { type: 'boolean', icon: <IconSquareCheck size={18} />, category: 'basic' },
  { type: 'choice', icon: <IconSelect size={18} />, category: 'basic' },
  { type: 'time', icon: <IconClock size={18} />, category: 'advanced' },
  { type: 'datetime', icon: <IconCalendarTime size={18} />, category: 'advanced' },
  { type: 'open-choice', icon: <IconCircleDot size={18} />, category: 'advanced' },
  { type: 'signature', icon: <IconSignature size={18} />, category: 'advanced' },
  { type: 'attachment', icon: <IconPaperclip size={18} />, category: 'advanced' },
  { type: 'group', icon: <IconLayoutList size={18} />, category: 'layout' },
  { type: 'display', icon: <IconEye size={18} />, category: 'layout' },
];

/**
 * DraggableFieldType Component
 * Individual draggable field type item
 * Memoized for performance
 */
const DraggableFieldType = memo(function DraggableFieldType({ type, icon, label }: { type: FieldType; icon: React.ReactElement; label: string }): React.ReactElement {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `field-type-${type}`,
    data: { type },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <Box
      ref={setNodeRef}
      style={{
        ...style,
        padding: 'var(--mantine-spacing-sm)',
        backgroundColor: 'white',
        border: '1px solid var(--emr-gray-200)',
        borderRadius: 'var(--mantine-radius-md)',
        cursor: 'grab',
        transition: 'all 0.2s ease',
      }}
      {...listeners}
      {...attributes}
    >
      <Group gap="xs" wrap="nowrap">
        <Box style={{ color: 'var(--emr-secondary)' }}>{icon}</Box>
        <Text size="sm" style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </Text>
      </Group>
    </Box>
  );
});

/**
 * FieldPalette Component
 *
 * Left panel showing draggable field types
 * - 15 field types organized by category
 * - Search/filter functionality
 * - Drag and drop to canvas
 * - Keyboard navigation support
 * - Memoized for performance
 */
export const FieldPalette = memo(function FieldPalette(): React.ReactElement {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'basic' | 'advanced' | 'layout'>('all');

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.currentTarget.value);
  }, []);

  const handleCategoryChange = useCallback((category: 'all' | 'basic' | 'advanced' | 'layout') => {
    setActiveCategory(category);
  }, []);

  const filteredFields = fieldTypeConfigs.filter((config) => {
    const label = t(`fieldTypes.${config.type}`).toLowerCase();
    const matchesSearch = label.includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || config.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCount = (category: 'basic' | 'advanced' | 'layout'): number => {
    return fieldTypeConfigs.filter((f) => f.category === category).length;
  };

  return (
    <Stack
      gap="md"
      style={{
        padding: 'var(--mantine-spacing-md)',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
      }}
      role="region"
      aria-label={t('formUI.builder.palette') || 'Field Palette'}
    >
      {/* Header */}
      <Box>
        <Text size="lg" fw={600} style={{ marginBottom: 'var(--mantine-spacing-xs)' }} id="palette-heading">
          {t('formUI.builder.palette')}
        </Text>
        <Text size="xs" c="dimmed">
          Drag fields to canvas
        </Text>
      </Box>

      {/* Search */}
      <TextInput
        placeholder={t('formUI.search.placeholder')}
        leftSection={<IconSearch size={16} />}
        value={searchQuery}
        onChange={handleSearchChange}
        size="sm"
        aria-label={t('formUI.search.placeholder') || 'Search fields'}
      />

      {/* Category Filters */}
      <Group gap="xs" role="tablist" aria-label="Field categories">
        <Badge
          variant={activeCategory === 'all' ? 'filled' : 'light'}
          style={{ cursor: 'pointer' }}
          onClick={() => handleCategoryChange('all')}
          role="tab"
          aria-selected={activeCategory === 'all'}
          tabIndex={activeCategory === 'all' ? 0 : -1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleCategoryChange('all');
            }
          }}
        >
          All ({fieldTypeConfigs.length})
        </Badge>
        <Badge
          variant={activeCategory === 'basic' ? 'filled' : 'light'}
          style={{ cursor: 'pointer' }}
          onClick={() => handleCategoryChange('basic')}
          color="blue"
          role="tab"
          aria-selected={activeCategory === 'basic'}
          tabIndex={activeCategory === 'basic' ? 0 : -1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleCategoryChange('basic');
            }
          }}
        >
          Basic ({categoryCount('basic')})
        </Badge>
        <Badge
          variant={activeCategory === 'advanced' ? 'filled' : 'light'}
          style={{ cursor: 'pointer' }}
          onClick={() => handleCategoryChange('advanced')}
          color="cyan"
          role="tab"
          aria-selected={activeCategory === 'advanced'}
          tabIndex={activeCategory === 'advanced' ? 0 : -1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleCategoryChange('advanced');
            }
          }}
        >
          Advanced ({categoryCount('advanced')})
        </Badge>
        <Badge
          variant={activeCategory === 'layout' ? 'filled' : 'light'}
          style={{ cursor: 'pointer' }}
          onClick={() => handleCategoryChange('layout')}
          color="grape"
          role="tab"
          aria-selected={activeCategory === 'layout'}
          tabIndex={activeCategory === 'layout' ? 0 : -1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleCategoryChange('layout');
            }
          }}
        >
          Layout ({categoryCount('layout')})
        </Badge>
      </Group>

      {/* Field Types List */}
      <Stack
        gap="xs"
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0, /* Critical for flex overflow to work */
          paddingBottom: 'var(--mantine-spacing-md)',
        }}
        role="listbox"
        aria-label="Available field types"
      >
        {filteredFields.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" style={{ marginTop: 'var(--mantine-spacing-xl)' }} role="status">
            {t('formUI.messages.noResults')}
          </Text>
        ) : (
          filteredFields.map((config) => (
            <DraggableFieldType
              key={config.type}
              type={config.type}
              icon={config.icon}
              label={t(`fieldTypes.${config.type}`)}
            />
          ))
        )}
      </Stack>
    </Stack>
  );
});
