// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, memo, useCallback } from 'react';
import { Stack, Box, Text, Badge, Group } from '@mantine/core';
import { EMRTextInput } from '../shared/EMRFormFields';
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
  { type: 'text', icon: <IconTextSize size={20} />, category: 'basic' },
  { type: 'textarea', icon: <IconTextWrap size={20} />, category: 'basic' },
  { type: 'date', icon: <IconCalendar size={20} />, category: 'basic' },
  { type: 'integer', icon: <IconNumber size={20} />, category: 'basic' },
  { type: 'decimal', icon: <IconDecimal size={20} />, category: 'basic' },
  { type: 'boolean', icon: <IconSquareCheck size={20} />, category: 'basic' },
  { type: 'choice', icon: <IconSelect size={20} />, category: 'basic' },
  { type: 'time', icon: <IconClock size={20} />, category: 'advanced' },
  { type: 'datetime', icon: <IconCalendarTime size={20} />, category: 'advanced' },
  { type: 'open-choice', icon: <IconCircleDot size={20} />, category: 'advanced' },
  { type: 'signature', icon: <IconSignature size={20} />, category: 'advanced' },
  { type: 'attachment', icon: <IconPaperclip size={20} />, category: 'advanced' },
  { type: 'group', icon: <IconLayoutList size={20} />, category: 'layout' },
  { type: 'display', icon: <IconEye size={20} />, category: 'layout' },
];

/**
 * DraggableFieldType Component
 * Individual draggable field type item - Modern glass-card design
 * Memoized for performance
 */
const DraggableFieldType = memo(function DraggableFieldType({ type, icon, label }: { type: FieldType; icon: React.ReactElement; label: string }): React.ReactElement {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `field-type-${type}`,
    data: { type },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(1.03)`,
        zIndex: 100,
      }
    : undefined;

  return (
    <Box
      ref={setNodeRef}
      style={{
        ...style,
        padding: '14px 16px',
        background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
        border: '1.5px solid var(--emr-gray-200)',
        borderRadius: '12px',
        cursor: 'grab',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isDragging
          ? '0 8px 24px rgba(43, 108, 176, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1)'
          : 'var(--emr-shadow-panel-item)',
        opacity: isDragging ? 0.95 : 1,
        minHeight: '62px',
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = 'var(--emr-shadow-panel-item-hover)';
          e.currentTarget.style.borderColor = 'var(--emr-accent)';
          e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--emr-shadow-panel-item)';
          e.currentTarget.style.borderColor = 'var(--emr-gray-200)';
          e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)';
        }
      }}
      {...listeners}
      {...attributes}
    >
      <Group gap="md" wrap="nowrap" style={{ width: '100%' }}>
        <Box
          style={{
            color: 'var(--emr-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 42,
            height: 42,
            background: 'linear-gradient(135deg, rgba(99, 179, 237, 0.15) 0%, rgba(43, 108, 176, 0.1) 100%)',
            borderRadius: '10px',
            flexShrink: 0,
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
          }}
        >
          {icon}
        </Box>
        <Text
          size="sm"
          fw={500}
          style={{
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: 'var(--emr-gray-700)',
            lineHeight: 1.4,
            fontSize: '13px',
          }}
        >
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
      gap="lg"
      style={{
        padding: 'var(--emr-panel-padding)',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        backdropFilter: 'var(--emr-backdrop-blur)',
        borderRight: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: 'var(--emr-shadow-panel)',
      }}
      role="region"
      aria-label={t('formUI.builder.palette') || 'Field Palette'}
    >
      {/* Enhanced Panel Header */}
      <Box
        style={{
          padding: '16px 20px',
          margin: '-20px -20px 0 -20px',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderBottom: '1px solid var(--emr-gray-200)',
        }}
      >
        <Group gap="sm" align="center">
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(99, 179, 237, 0.15) 0%, rgba(43, 108, 176, 0.1) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconLayoutList size={18} style={{ color: 'var(--emr-secondary)' }} />
          </Box>
          <Text size="sm" fw={600} tt="uppercase" style={{ letterSpacing: '0.05em', color: 'var(--emr-gray-700)' }} id="palette-heading">
            {t('formUI.builder.palette')}
          </Text>
        </Group>
        <Text size="xs" c="dimmed" mt={8} style={{ lineHeight: 1.5 }}>
          {t('formUI.builder.dragToCanvas')}
        </Text>
      </Box>

      {/* Enhanced Search Input */}
      <EMRTextInput
        placeholder={t('formUI.search.placeholder')}
        leftSection={<IconSearch size={18} style={{ color: 'var(--emr-gray-400)' }} />}
        value={searchQuery}
        onChange={(value) => setSearchQuery(value)}
        aria-label={t('formUI.search.placeholder') || 'Search fields'}
      />

      {/* Enhanced Category Filters */}
      <Group gap={8} role="tablist" aria-label="Field categories" wrap="wrap">
        <Badge
          variant={activeCategory === 'all' ? 'filled' : 'light'}
          radius="xl"
          size="lg"
          style={{
            cursor: 'pointer',
            background: activeCategory === 'all' ? 'var(--emr-gradient-primary)' : 'white',
            color: activeCategory === 'all' ? 'white' : 'var(--emr-gray-600)',
            border: activeCategory === 'all' ? 'none' : '1.5px solid var(--emr-gray-200)',
            padding: '0 16px',
            height: '34px',
            fontWeight: 500,
            fontSize: '13px',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: activeCategory === 'all' ? 'var(--emr-shadow-soft-md)' : 'none',
          }}
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
          {t('formUI.categories.all')} ({fieldTypeConfigs.length})
        </Badge>
        <Badge
          variant={activeCategory === 'basic' ? 'filled' : 'light'}
          radius="xl"
          size="lg"
          style={{
            cursor: 'pointer',
            background: activeCategory === 'basic' ? 'var(--emr-gradient-secondary)' : 'white',
            color: activeCategory === 'basic' ? 'white' : 'var(--emr-gray-600)',
            border: activeCategory === 'basic' ? 'none' : '1.5px solid var(--emr-gray-200)',
            padding: '0 16px',
            height: '34px',
            fontWeight: 500,
            fontSize: '13px',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: activeCategory === 'basic' ? 'var(--emr-shadow-soft-md)' : 'none',
          }}
          onClick={() => handleCategoryChange('basic')}
          role="tab"
          aria-selected={activeCategory === 'basic'}
          tabIndex={activeCategory === 'basic' ? 0 : -1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleCategoryChange('basic');
            }
          }}
        >
          {t('formUI.categories.basic')} ({categoryCount('basic')})
        </Badge>
        <Badge
          variant={activeCategory === 'advanced' ? 'filled' : 'light'}
          radius="xl"
          size="lg"
          style={{
            cursor: 'pointer',
            background: activeCategory === 'advanced' ? 'var(--emr-gradient-secondary)' : 'white',
            color: activeCategory === 'advanced' ? 'white' : 'var(--emr-gray-600)',
            border: activeCategory === 'advanced' ? 'none' : '1.5px solid var(--emr-gray-200)',
            padding: '0 16px',
            height: '34px',
            fontWeight: 500,
            fontSize: '13px',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: activeCategory === 'advanced' ? 'var(--emr-shadow-soft-md)' : 'none',
          }}
          onClick={() => handleCategoryChange('advanced')}
          role="tab"
          aria-selected={activeCategory === 'advanced'}
          tabIndex={activeCategory === 'advanced' ? 0 : -1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleCategoryChange('advanced');
            }
          }}
        >
          {t('formUI.categories.advanced')} ({categoryCount('advanced')})
        </Badge>
        <Badge
          variant={activeCategory === 'layout' ? 'filled' : 'light'}
          radius="xl"
          size="lg"
          style={{
            cursor: 'pointer',
            background: activeCategory === 'layout' ? 'var(--emr-gradient-secondary)' : 'white',
            color: activeCategory === 'layout' ? 'white' : 'var(--emr-gray-600)',
            border: activeCategory === 'layout' ? 'none' : '1.5px solid var(--emr-gray-200)',
            padding: '0 16px',
            height: '34px',
            fontWeight: 500,
            fontSize: '13px',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: activeCategory === 'layout' ? 'var(--emr-shadow-soft-md)' : 'none',
          }}
          onClick={() => handleCategoryChange('layout')}
          role="tab"
          aria-selected={activeCategory === 'layout'}
          tabIndex={activeCategory === 'layout' ? 0 : -1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleCategoryChange('layout');
            }
          }}
        >
          {t('formUI.categories.layout')} ({categoryCount('layout')})
        </Badge>
      </Group>

      {/* Field Types List */}
      <Stack
        gap="var(--emr-palette-item-gap)"
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0, /* Critical for flex overflow to work */
          paddingBottom: 'var(--mantine-spacing-lg)',
          paddingRight: 6,
        }}
        role="listbox"
        aria-label="Available field types"
        className="emr-scrollbar"
      >
        {filteredFields.length === 0 ? (
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 20px',
              color: 'var(--emr-gray-400)',
            }}
            role="status"
          >
            <Box
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(107, 114, 128, 0.05) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <IconSearch size={24} style={{ opacity: 0.5 }} />
            </Box>
            <Text size="sm" c="dimmed" ta="center" style={{ lineHeight: 1.5 }}>
              {t('formUI.messages.noResults')}
            </Text>
          </Box>
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
